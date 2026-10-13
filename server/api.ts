import express from "express";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import { randomBytes, createHash, timingSafeEqual } from "node:crypto";
import { database } from "./db.ts";
import { enquirySchema } from "./enquiry.ts";
import { localEmailEnabled, notifyStudio } from "./mail.ts";
import { quotes } from "./quotes.ts";
import { briefsPublic, briefsAdmin } from "./briefs.ts";
import { content } from "./content.ts";
const router = express.Router();
export const api = router;
router.use("/api", express.json({ limit: "32kb" }));
router.use(
  "/api",
  rateLimit({
    windowMs: 60000,
    limit: 90,
    standardHeaders: "draft-8",
    legacyHeaders: false,
  }),
);
router.use("/api", (req, res, next) => {
  if (["POST", "PATCH", "DELETE"].includes(req.method)) {
    const origin = req.get("origin");
    const expected = process.env.SITE_URL || `http://${req.get("host")}`;
    if (origin && origin !== expected)
      return res
        .status(403)
        .json({ error: "This request could not be verified." });
    if (req.get("sec-fetch-site") === "cross-site")
      return res
        .status(403)
        .json({ error: "This request could not be verified." });
  }
  next();
});
const hash = (v: string) => createHash("sha256").update(v).digest("hex");
router.get("/api/health", async (req, res) => {
  const { db } = await database();
  await db.command({ ping: 1 });
  res.json({ ok: true, database: "mongodb" });
});
router.post("/api/enquiries", async (req, res, next) => {
  try {
    const data = enquirySchema.parse(req.body);
    const { db } = await database();
    const fingerprint = hash(JSON.stringify(data));
    const previous = await db
      .collection("enquiries")
      .findOne({ idempotencyKey: data.idempotencyKey });
    if (
      previous &&
      previous.fingerprint &&
      previous.fingerprint !== fingerprint
    )
      return res.status(409).json({
        error:
          "This enquiry has already been submitted with different details. Start a new enquiry.",
      });
    // Pictures must be ones this visitor just uploaded and nobody has used.
    if (!previous && data.attachments.length) {
      const free = await db.collection("briefFiles").countDocuments({
        id: { $in: data.attachments },
        enquiry: { $exists: false },
      });
      if (free !== new Set(data.attachments).size)
        return res.status(400).json({
          error:
            "One of your pictures expired. Please add it again and resend.",
        });
    }
    const reference = `ENQ-${randomBytes(4).toString("hex").toUpperCase()}`;
    await db.collection("enquiries").updateOne(
      { idempotencyKey: data.idempotencyKey },
      {
        $setOnInsert: {
          ...data,
          fingerprint,
          reference,
          status: "new",
          createdAt: new Date(),
        },
      },
      { upsert: true },
    );
    const saved = await db
      .collection("enquiries")
      .findOne({ idempotencyKey: data.idempotencyKey });
    if (saved!.fingerprint && saved!.fingerprint !== fingerprint)
      return res.status(409).json({
        error: "This enquiry was already submitted with different details.",
      });
    // The enquiry now owns its pictures, so they no longer expire.
    if (data.attachments.length)
      await db.collection("briefFiles").updateMany(
        { id: { $in: data.attachments }, enquiry: { $exists: false } },
        { $set: { enquiry: saved!.reference }, $unset: { expiresAt: "" } },
      );
    if (!previous)
      void notifyStudio(
        `New enquiry ${saved!.reference}: ${data.product}`,
        `${data.name} <${data.email}>${data.company ? `, ${data.company}` : ""}\n${data.country} · quantity ${data.quantity}\n${data.attachments.length ? `${data.attachments.length} picture(s) attached (open them in the studio)\n` : ""}\n${data.message}\n\nOpen the studio: ${process.env.SITE_URL || "http://localhost:3000"}/admin`,
      );
    res.status(201).json({ reference: saved!.reference });
  } catch (e) {
    next(e);
  }
});
router.post("/api/contact", async (req, res, next) => {
  try {
    const data = z
      .object({
        name: z.string().min(2).max(100),
        email: z.email(),
        topic: z.string().max(100),
        message: z.string().min(10).max(4000),
      })
      .parse(req.body);
    const { db } = await database();
    const reference = `MSG-${randomBytes(4).toString("hex").toUpperCase()}`;
    await db
      .collection("messages")
      .insertOne({ ...data, reference, createdAt: new Date(), status: "new" });
    void notifyStudio(
      `New message ${reference}: ${data.topic}`,
      `${data.name} <${data.email}>\nTopic: ${data.topic}\n\n${data.message}\n\nOpen the studio: ${process.env.SITE_URL || "http://localhost:3000"}/admin`,
    );
    res.status(201).json({ reference });
  } catch (e) {
    next(e);
  }
});
router.post("/api/newsletter", async (req, res, next) => {
  try {
    const { email } = z
      .object({
        email: z.email().transform((v) => v.toLowerCase()),
        consent: z.literal(true),
      })
      .parse(req.body);
    const { db } = await database();
    await db
      .collection("newsletter")
      .updateOne(
        { email },
        { $set: { consent: true, updatedAt: new Date() } },
        { upsert: true },
      );
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});
router.post("/api/newsletter/unsubscribe", async (req, res, next) => {
  try {
    const { email } = z
      .object({ email: z.email().transform((v) => v.trim().toLowerCase()) })
      .parse(req.body);
    const { db } = await database();
    await db
      .collection("newsletter")
      .updateOne(
        { email },
        { $set: { consent: false, updatedAt: new Date() } },
      );
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});
router.use(briefsPublic);
router.use("/api/admin", (req, res, next) => {
  const expected = process.env.ADMIN_TOKEN;
  const provided = req.get("authorization")?.replace("Bearer ", "");
  if (
    !expected ||
    !provided ||
    !timingSafeEqual(Buffer.from(hash(expected)), Buffer.from(hash(provided)))
  )
    return res
      .status(401)
      .json({ error: "Admin access requires a configured access token." });
  next();
});
router.use(quotes);
router.use(briefsAdmin);
router.use(content);
router.get("/api/admin/overview", async (req, res) => {
  const { db } = await database();
  const [enquiries, messages] = await Promise.all(
    ["enquiries", "messages"].map((name) =>
      db
        .collection(name)
        .find({}, { projection: { _id: 0, accessHash: 0, idempotencyKey: 0 } })
        .sort({ createdAt: -1 })
        .limit(100)
        .toArray(),
    ),
  );
  const emailPreview = localEmailEnabled()
    ? await db
        .collection("emailPreview")
        .find({ expiresAt: { $gt: new Date() } }, { projection: { _id: 0 } })
        .sort({ createdAt: -1 })
        .limit(50)
        .toArray()
    : [];
  const draftOrders = await db
    .collection("draftOrders")
    .find({}, { projection: { _id: 0 } })
    .sort({ createdAt: -1 })
    .limit(100)
    .toArray();
  res.json({ enquiries, messages, emailPreview, draftOrders });
});
router.patch("/api/admin/enquiries/:reference", async (req, res, next) => {
  try {
    const data = z
      .object({
        status: z.enum([
          "new",
          "reviewing",
          "clarification",
          "quoted",
          "follow-up",
          "won",
          "lost",
          "closed",
        ]),
        owner: z.string().trim().max(100).optional(),
        internalNotes: z.string().trim().max(4000).optional(),
        followUp: z
          .string()
          .regex(/^\d{4}-\d{2}-\d{2}$/)
          .or(z.literal(""))
          .optional(),
      })
      .parse(req.body);
    const { db } = await database();
    const result = await db
      .collection("enquiries")
      .updateOne(
        { reference: req.params.reference },
        { $set: { ...data, updatedAt: new Date() } },
      );
    res.json({ ok: result.matchedCount === 1 });
  } catch (e) {
    next(e);
  }
});
router.patch("/api/admin/workflow/:kind/:reference", async (req, res, next) => {
  try {
    const kind = z.enum(["messages"]).parse(req.params.kind);
    const data = z
      .object({
        status: z.enum([
          "new",
          "requested",
          "reviewing",
          "awaiting-customer",
          "resolved",
          "closed",
        ]),
        internalNotes: z.string().trim().max(4000),
        customerUpdate: z.string().trim().max(1000).default(""),
      })
      .parse(req.body);
    const { db } = await database();
    const result = await db
      .collection(kind)
      .updateOne(
        { reference: req.params.reference },
        { $set: { ...data, updatedAt: new Date() } },
      );
    if (!result.matchedCount)
      return res.status(404).json({ error: "Record not found." });
    await db.collection("audit").insertOne({
      action: `${kind}.update`,
      resource: req.params.reference,
      status: data.status,
      at: new Date(),
    });
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});
router.use("/api", (req, res) =>
  res.status(404).json({ error: "This endpoint does not exist." }),
);
router.use(
  (
    error: unknown,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    if (res.headersSent) return next(error);
    if ((error as { code?: number })?.code === 11000)
      return res.status(409).json({
        error: "That identifier is already in use. Refresh and try again.",
      });
    if (error instanceof z.ZodError)
      return res.status(400).json({
        error: error.issues
          .map((i) => `${i.path.join(".")}: ${i.message}`)
          .join(" "),
      });
    const businessError =
      error instanceof Error &&
      /quantity|available|Quote|quote|Enquiry not found/.test(
        error.message,
      );
    if (!businessError)
      console.error(
        JSON.stringify({
          event: "api.error",
          requestId: res.getHeader("X-Request-ID"),
          type: error instanceof Error ? error.name : "UnknownError",
        }),
      );
    res.status(businessError ? 400 : 500).json({
      error: businessError
        ? (error as Error).message
        : "We could not complete that request. Please try again.",
    });
  },
);
