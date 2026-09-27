import express from "express";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import {
  randomBytes,
  createHash,
  scrypt,
  timingSafeEqual,
  randomUUID,
} from "node:crypto";
import { database, getProducts } from "./db.ts";
import { checkoutSchema, enquirySchema, priceOrder } from "./commerce.ts";
import { productSchema } from "./product-schema.ts";
import { profileSchema } from "./account-schema.ts";
import { createAccountLink, localEmailEnabled } from "./account-links.ts";
import { quotes } from "./quotes.ts";
import { content } from "./content.ts";
import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import { promisify } from "node:util";
const derivePassword = promisify(scrypt);
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
function cookies(req: express.Request) {
  return Object.fromEntries(
    (req.headers.cookie || "")
      .split(";")
      .filter(Boolean)
      .map((c) => {
        const i = c.indexOf("=");
        return [c.slice(0, i).trim(), c.slice(i + 1)];
      }),
  );
}
async function identity(req: express.Request) {
  const token = cookies(req).aurelio_session;
  if (!token) return null;
  const { db } = await database();
  const session = await db
    .collection("sessions")
    .findOne({ tokenHash: hash(token), expiresAt: { $gt: new Date() } });
  if (!session) return null;
  const customer = await db
    .collection("customers")
    .findOne({ id: session.customerId });
  if (
    !customer ||
    (session.passwordVersion &&
      session.passwordVersion !== hash(customer.passwordHash))
  )
    return null;
  const { _id, passwordHash, salt, ...safe } = customer;
  return safe;
}
router.get("/api/health", async (req, res) => {
  const { db } = await database();
  await db.command({ ping: 1 });
  res.json({ ok: true, database: "mongodb", preview: true });
});
router.get("/api/products", async (req, res) => res.json(await getProducts()));
router.get("/api/session", async (req, res) =>
  res.json({ customer: await identity(req) }),
);
router.post(
  "/api/auth",
  rateLimit({ windowMs: 900000, limit: 15 }),
  async (req, res, next) => {
    try {
      const data = z
        .object({
          mode: z.enum(["login", "register"]),
          email: z.email().transform((v) => v.toLowerCase().trim()),
          password: z.string().min(10).max(128),
          name: z.string().trim().max(100).optional(),
        })
        .parse(req.body);
      const { db } = await database();
      let customer = await db
        .collection("customers")
        .findOne({ email: data.email });
      if (data.mode === "register") {
        if (customer)
          return res.status(400).json({
            error: "Unable to create this account. Try signing in instead.",
          });
        const salt = randomBytes(16).toString("hex");
        customer = {
          id: randomUUID(),
          email: data.email,
          name: data.name || "Collector",
          salt,
          passwordHash: (
            (await derivePassword(data.password, salt, 64)) as Buffer
          ).toString("hex"),
          createdAt: new Date(),
        } as any;
        await db.collection("customers").insertOne(customer!);
      } else {
        const actual = (await derivePassword(
          data.password,
          customer?.salt || "missing-account-salt",
          64,
        )) as Buffer;
        if (
          !customer ||
          !timingSafeEqual(actual, Buffer.from(customer.passwordHash, "hex"))
        )
          return res
            .status(401)
            .json({ error: "Email or password is incorrect." });
      }
      const token = randomBytes(32).toString("hex");
      await db.collection("sessions").insertOne({
        tokenHash: hash(token),
        customerId: customer!.id,
        passwordVersion: hash(customer!.passwordHash),
        expiresAt: new Date(Date.now() + 7 * 86400000),
      });
      res.cookie("aurelio_session", token, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 7 * 86400000,
        path: "/",
      });
      res.json({
        customer: {
          id: customer!.id,
          name: customer!.name,
          email: customer!.email,
        },
      });
    } catch (e) {
      next(e);
    }
  },
);
router.post("/api/logout", async (req, res) => {
  const { db } = await database();
  const token = cookies(req).aurelio_session;
  if (token)
    await db.collection("sessions").deleteOne({ tokenHash: hash(token) });
  res.clearCookie("aurelio_session", { path: "/" });
  res.json({ ok: true });
});
router.post(
  "/api/account-links",
  rateLimit({ windowMs: 900000, limit: 8 }),
  async (req, res, next) => {
    try {
      const data = z
        .object({
          email: z.email().transform((v) => v.trim().toLowerCase()),
          purpose: z.enum(["verify", "reset"]),
        })
        .parse(req.body);
      if (!localEmailEnabled())
        return res.status(503).json({
          error:
            "Email delivery is not connected yet. Please contact the studio for help.",
        });
      const { db } = await database();
      const customer = await db
        .collection("customers")
        .findOne({ email: data.email });
      if (customer && (data.purpose !== "verify" || !customer.emailVerifiedAt))
        await createAccountLink(
          { id: customer.id, email: customer.email },
          data.purpose,
        );
      res.json({
        message:
          "If an eligible account exists, a link is available in the studio’s local email preview. No email has been sent.",
      });
    } catch (error) {
      next(error);
    }
  },
);
router.post(
  "/api/account-links/consume",
  rateLimit({ windowMs: 900000, limit: 15 }),
  async (req, res, next) => {
    try {
      const data = z
        .object({
          token: z.string().regex(/^[a-f0-9]{64}$/),
          purpose: z.enum(["verify", "reset"]),
          password: z.string().min(10).max(128).optional(),
        })
        .parse(req.body);
      if (data.purpose === "reset" && !data.password)
        return res.status(400).json({ error: "Choose a new password." });
      const { db, client } = await database();
      const salt = randomBytes(16).toString("hex");
      const passwordHash = data.password
        ? ((await derivePassword(data.password, salt, 64)) as Buffer).toString(
            "hex",
          )
        : undefined;
      const session = client.startSession();
      let valid = false;
      try {
        await session.withTransaction(async () => {
          valid = false;
          const link = await db.collection("accountLinks").findOneAndDelete(
            {
              tokenHash: hash(data.token),
              purpose: data.purpose,
              expiresAt: { $gt: new Date() },
            },
            { session },
          );
          if (!link) return;
          const changed = await db.collection("customers").updateOne(
            { id: link.customerId },
            {
              $set:
                data.purpose === "verify"
                  ? { emailVerifiedAt: new Date() }
                  : { salt, passwordHash },
            },
            { session },
          );
          if (!changed.matchedCount) return;
          if (data.purpose === "reset") {
            await db
              .collection("sessions")
              .deleteMany({ customerId: link.customerId }, { session });
            await db
              .collection("accountLinks")
              .deleteMany(
                { customerId: link.customerId, purpose: "reset" },
                { session },
              );
          }
          valid = true;
        });
      } finally {
        await session.endSession();
      }
      if (!valid)
        return res.status(400).json({
          error:
            "This link has expired or has already been used. Request a new link.",
        });
      if (data.purpose === "reset")
        res.clearCookie("aurelio_session", { path: "/" });
      res.json({ ok: true });
    } catch (error) {
      next(error);
    }
  },
);
router.patch("/api/profile", async (req, res, next) => {
  try {
    const user = await identity(req);
    if (!user) return res.status(401).json({ error: "Please sign in." });
    const data = profileSchema.parse(req.body);
    const { db } = await database();
    await db.collection("customers").updateOne({ id: user.id }, { $set: data });
    res.json({ customer: await identity(req) });
  } catch (error) {
    next(error);
  }
});
router.post(
  "/api/password",
  rateLimit({ windowMs: 900000, limit: 10 }),
  async (req, res, next) => {
    try {
      const user = await identity(req);
      if (!user) return res.status(401).json({ error: "Please sign in." });
      const data = z
        .object({
          currentPassword: z.string().max(128),
          password: z.string().min(10).max(128),
        })
        .parse(req.body);
      const { db, client } = await database();
      const customer = await db
        .collection("customers")
        .findOne({ id: user.id });
      const actual = (await derivePassword(
        data.currentPassword,
        customer!.salt,
        64,
      )) as Buffer;
      if (!timingSafeEqual(actual, Buffer.from(customer!.passwordHash, "hex")))
        return res
          .status(400)
          .json({ error: "Your current password is incorrect." });
      const salt = randomBytes(16).toString("hex");
      const passwordHash = (
        (await derivePassword(data.password, salt, 64)) as Buffer
      ).toString("hex");
      const session = client.startSession();
      try {
        await session.withTransaction(async () => {
          const changed = await db
            .collection("customers")
            .updateOne(
              { id: user.id, passwordHash: customer!.passwordHash },
              { $set: { salt, passwordHash } },
              { session },
            );
          if (!changed.modifiedCount)
            throw new Error("Password changed. Please sign in again.");
          await db
            .collection("sessions")
            .deleteMany({ customerId: user.id }, { session });
        });
      } finally {
        await session.endSession();
      }
      res.clearCookie("aurelio_session", { path: "/" });
      res.json({ ok: true });
    } catch (error) {
      next(error);
    }
  },
);
router.get("/api/orders", async (req, res) => {
  const user = await identity(req);
  if (!user) return res.status(401).json({ error: "Please sign in." });
  const { db } = await database();
  const page = Math.max(
    1,
    Math.min(10000, Number.parseInt(String(req.query.page || "1"), 10) || 1),
  );
  const orders = await db
    .collection("orders")
    .find(
      { customerId: user.id },
      {
        projection: {
          _id: 0,
          accessHash: 0,
          idempotencyKey: 0,
          fingerprint: 0,
          internalNotes: 0,
        },
      },
    )
    .sort({ createdAt: -1 })
    .skip((page - 1) * 20)
    .limit(20)
    .toArray();
  if (req.query.paginated === "1")
    return res.json({
      orders,
      page,
      total: await db
        .collection("orders")
        .countDocuments({ customerId: user.id }),
    });
  res.json(orders);
});
router.post("/api/checkout", async (req, res, next) => {
  try {
    if (
      process.env.NODE_ENV === "production" &&
      process.env.ALLOW_PREVIEW_ORDERS !== "true"
    )
      return res.status(503).json({
        error:
          "Online payments are not connected yet. Please enquire for an order.",
      });
    const data = checkoutSchema.parse(req.body);
    const { db, client } = await database();
    const user = await identity(req);
    const accessToken = hash(
      `${data.idempotencyKey}:${data.email.toLowerCase()}`,
    );
    const fingerprint = hash(JSON.stringify(data));
    const existing = await db
      .collection("orders")
      .findOne({ idempotencyKey: data.idempotencyKey });
    if (existing) {
      if (
        existing.accessHash !== hash(accessToken) ||
        existing.fingerprint !== fingerprint
      )
        return res.status(409).json({ error: "Please start a new checkout." });
      return res.json({ reference: existing.reference, accessToken });
    }
    const session = client.startSession();
    let reference = "";
    try {
      await session.withTransaction(async () => {
        // A competing request may have committed before a transaction retry.
        const committed = await db
          .collection("orders")
          .findOne({ idempotencyKey: data.idempotencyKey }, { session });
        if (committed) {
          if (committed.fingerprint !== fingerprint)
            throw new Error(
              "Stock request changed. Please start a new checkout.",
            );
          reference = committed.reference;
          return;
        }
        const catalog = await db
          .collection("products")
          .find({}, { session, projection: { _id: 0 } })
          .toArray();
        const quote = priceOrder(data, catalog as any);
        reference = `AUR-${Date.now().toString(36).toUpperCase()}-${randomBytes(2).toString("hex").toUpperCase()}`;
        for (const line of quote.lines) {
          const change = await db.collection("products").updateOne(
            {
              id: line.productId,
              stock: { $gte: line.quantity },
              status: { $nin: ["draft", "archived"] },
            },
            { $inc: { stock: -line.quantity } },
            { session },
          );
          if (!change.modifiedCount)
            throw new Error("Stock changed. Please review your bag.");
        }
        await db.collection("orders").insertOne(
          {
            ...quote,
            reference,
            idempotencyKey: data.idempotencyKey,
            fingerprint,
            customerId: user?.id || null,
            email: data.email,
            name: data.name,
            address: data.address,
            city: data.city,
            postalCode: data.postalCode,
            country: data.country,
            status: "preview",
            paymentStatus: "unpaid-preview",
            accessHash: hash(accessToken),
            createdAt: new Date(),
          },
          { session },
        );
      });
    } catch (error) {
      // Unique-key races can surface without an automatic transaction retry.
      if ((error as any)?.code !== 11000) throw error;
      const committed = await db
        .collection("orders")
        .findOne({ idempotencyKey: data.idempotencyKey });
      if (!committed || committed.fingerprint !== fingerprint) throw error;
      reference = committed.reference;
    } finally {
      await session.endSession();
    }
    res.status(201).json({ reference, accessToken });
  } catch (e) {
    next(e);
  }
});
router.get("/api/orders/:reference", async (req, res) => {
  const { db } = await database();
  const user = await identity(req);
  const order = await db
    .collection("orders")
    .findOne({ reference: req.params.reference });
  const token = req.get("x-order-token");
  if (
    !order ||
    (!(user && order.customerId === user.id) &&
      (!token || hash(token) !== order.accessHash))
  )
    return res.status(404).json({
      error:
        "Order not found. Use the secure link from your order confirmation.",
    });
  const {
    _id,
    accessHash,
    idempotencyKey,
    fingerprint,
    internalNotes,
    ...safe
  } = order;
  const support = await db
    .collection("returns")
    .findOne(
      { reference: order.reference },
      { projection: { _id: 0, internalNotes: 0 } },
    );
  res.json({ ...safe, support });
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
    const catalog = await getProducts();
    const selections = data.items.map((line) => {
      const product = catalog.find((p) => p.id === line.productId);
      if (!product)
        throw new Error("One of the selected objects is no longer available.");
      return {
        productId: product.id,
        name: product.name,
        sku: product.sku || product.id,
        finish: product.finish,
        quantity: line.quantity,
      };
    });
    const reference = `ENQ-${randomBytes(4).toString("hex").toUpperCase()}`;
    await db.collection("enquiries").updateOne(
      { idempotencyKey: data.idempotencyKey },
      {
        $setOnInsert: {
          ...data,
          selections,
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
router.post("/api/returns", async (req, res, next) => {
  try {
    const data = z
      .object({
        reference: z.string(),
        token: z.string().max(128).default(""),
        type: z
          .enum(["return", "damage", "cancellation", "question"])
          .default("question"),
        reason: z.string().min(10).max(2000),
      })
      .parse(req.body);
    const { db } = await database();
    const user = await identity(req);
    const order = await db
      .collection("orders")
      .findOne({ reference: data.reference });
    if (
      !order ||
      (!(user && order.customerId === user.id) &&
        (!data.token || order.accessHash !== hash(data.token)))
    )
      return res.status(404).json({
        error: "Please use your secure order details to make a request.",
      });
    await db.collection("returns").updateOne(
      { reference: data.reference },
      {
        $setOnInsert: {
          reference: data.reference,
          reason: data.reason,
          type: data.type,
          status: "requested",
          createdAt: new Date(),
        },
      },
      { upsert: true },
    );
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});
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
router.use(content);
router.get("/api/admin/overview", async (req, res) => {
  const { db } = await database();
  const [orders, enquiries, messages] = await Promise.all(
    ["orders", "enquiries", "messages"].map((name) =>
      db
        .collection(name)
        .find({}, { projection: { _id: 0, accessHash: 0, idempotencyKey: 0 } })
        .sort({ createdAt: -1 })
        .limit(100)
        .toArray(),
    ),
  );
  const returns = await db
    .collection("returns")
    .find({}, { projection: { _id: 0 } })
    .sort({ createdAt: -1 })
    .limit(100)
    .toArray();
  const emailPreview = localEmailEnabled()
    ? await db
        .collection("emailPreview")
        .find({ expiresAt: { $gt: new Date() } }, { projection: { _id: 0 } })
        .sort({ createdAt: -1 })
        .limit(50)
        .toArray()
    : [];
  const products = await db
    .collection("products")
    .find({}, { projection: { _id: 0 } })
    .toArray();
  const draftOrders = await db
    .collection("draftOrders")
    .find({}, { projection: { _id: 0 } })
    .sort({ createdAt: -1 })
    .limit(100)
    .toArray();
  res.json({
    orders,
    enquiries,
    messages,
    returns,
    emailPreview,
    products,
    draftOrders,
  });
});
router.post(
  "/api/admin/upload",
  express.raw({
    type: ["image/jpeg", "image/png", "image/webp"],
    limit: "8mb",
  }),
  async (req, res, next) => {
    try {
      if (!Buffer.isBuffer(req.body))
        return res
          .status(400)
          .json({ error: "Choose a JPG, PNG or WebP image." });
      const id = randomUUID();
      await mkdir("public/uploads", { recursive: true });
      await sharp(req.body, { limitInputPixels: 40000000 })
        .rotate()
        .resize({
          width: 1600,
          height: 1600,
          fit: "inside",
          withoutEnlargement: true,
        })
        .webp({ quality: 85 })
        .toFile(`public/uploads/${id}.webp`);
      res.status(201).json({ image: `/uploads/${id}.webp` });
    } catch (e) {
      next(e);
    }
  },
);
router.post("/api/admin/products", async (req, res, next) => {
  try {
    const data = productSchema.parse(req.body);
    const { db } = await database();
    if (await db.collection("products").findOne({ slug: data.slug }))
      return res
        .status(409)
        .json({ error: "That product URL is already in use." });
    const product = { ...data, id: randomUUID() };
    await db.collection("products").insertOne(product);
    res.status(201).json(product);
  } catch (e) {
    next(e);
  }
});
router.patch("/api/admin/products/:id", async (req, res, next) => {
  try {
    const data = productSchema.parse(req.body);
    const { db } = await database();
    const before = await db
      .collection("products")
      .findOne({ id: req.params.id });
    if (!before) return res.status(404).json({ error: "Product not found." });
    if (before.stock !== data.stock && !data.stockReason)
      return res
        .status(400)
        .json({ error: "Add a reason for this stock adjustment." });
    if (
      await db
        .collection("products")
        .findOne({ slug: data.slug, id: { $ne: req.params.id } })
    )
      return res
        .status(409)
        .json({ error: "That product URL is already in use." });
    const result = await db
      .collection("products")
      .updateOne({ id: req.params.id, stock: before.stock }, { $set: data });
    if (!result.matchedCount)
      return res
        .status(409)
        .json({ error: "Stock changed while editing. Refresh and try again." });
    await db.collection("audit").insertOne({
      action: "product.update",
      resource: req.params.id,
      previousStock: before.stock,
      stock: data.stock,
      reason: data.stockReason,
      at: new Date(),
    });
    res
      .status(result.matchedCount ? 200 : 404)
      .json(
        result.matchedCount ? { ok: true } : { error: "Product not found." },
      );
  } catch (e) {
    next(e);
  }
});
router.delete("/api/admin/products/:id", async (req, res) => {
  const { db } = await database();
  await db.collection("products").deleteOne({ id: req.params.id });
  res.json({ ok: true });
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
    const kind = z.enum(["messages", "returns"]).parse(req.params.kind);
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
      /quantity|Stock|available|smaller|Quote|quote|Enquiry not found/.test(
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
