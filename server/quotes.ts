import { Router } from "express";
import { z } from "zod";
import { randomBytes, randomUUID, createHash } from "node:crypto";
import { database } from "./db.ts";
export const quotes = Router();
const hash = (value: string) =>
  createHash("sha256").update(value).digest("hex");
export const quoteSchema = z.object({
  enquiry: z.string().regex(/^ENQ-[A-F0-9]{8}$/),
  currency: z.enum(["INR", "USD", "GBP", "EUR"]),
  lines: z
    .array(
      z.object({
        description: z.string().trim().min(2).max(250),
        quantity: z.number().int().min(1).max(100000),
        unitPrice: z.number().int().min(1).max(100000000),
      }),
    )
    .min(1)
    .max(30),
  freight: z.number().int().min(0).max(100000000),
  tax: z.number().int().min(0).max(100000000),
  terms: z.string().trim().min(10).max(4000),
  validDays: z.number().int().min(1).max(90),
});
// Mounted after admin authorization. Customer routes require a separate scoped secret.
quotes.post("/api/admin/quotes", async (req, res, next) => {
  try {
    const data = quoteSchema.parse(req.body);
    const { db, client } = await database();
    const token = randomBytes(32).toString("hex");
    const id = randomUUID();
    const session = client.startSession();
    let version = 1;
    try {
      await session.withTransaction(async () => {
        const enquiry = await db
          .collection("enquiries")
          .findOneAndUpdate(
            { reference: data.enquiry },
            {
              $inc: { quoteVersion: 1 },
              $set: {
                currentQuoteId: id,
                status: "quoted",
                updatedAt: new Date(),
              },
            },
            { session, returnDocument: "after" },
          );
        if (!enquiry) throw new Error("Enquiry not found.");
        version = enquiry.quoteVersion;
        const subtotal = data.lines.reduce(
          (sum, line) => sum + line.quantity * line.unitPrice,
          0,
        );
        const total = subtotal + data.freight + data.tax;
        if (!Number.isSafeInteger(total))
          throw new Error("Quote total is too large.");
        await db
          .collection("quotes")
          .insertOne(
            {
              ...data,
              id,
              version,
              subtotal,
              total,
              tokenHash: hash(token),
              status: "open",
              createdAt: new Date(),
              expiresAt: new Date(Date.now() + data.validDays * 86400000),
            },
            { session },
          );
        await db
          .collection("audit")
          .insertOne(
            {
              action: "quote.create",
              resource: id,
              enquiry: data.enquiry,
              version,
              at: new Date(),
            },
            { session },
          );
      });
    } finally {
      await session.endSession();
    }
    const url = new URL(
      `/quotes/${id}`,
      process.env.SITE_URL || "http://localhost:3000",
    );
    url.hash = new URLSearchParams({ key: token }).toString();
    res.status(201).json({ id, version, url: url.toString() });
  } catch (error) {
    next(error);
  }
});
quotes.get("/api/quotes/:id", async (req, res) => {
  const key = req.get("x-quote-key") || "";
  const { db } = await database();
  const quote = await db
    .collection("quotes")
    .findOne({ id: req.params.id, tokenHash: hash(key) });
  if (!quote)
    return res
      .status(404)
      .json({ error: "Use the secure quote link shared by the studio." });
  const enquiry = await db
    .collection("enquiries")
    .findOne({ reference: quote.enquiry });
  const { _id, tokenHash, ...safe } = quote;
  res.json({
    ...safe,
    current: enquiry?.currentQuoteId === quote.id,
    expired: quote.expiresAt <= new Date(),
  });
});
quotes.post("/api/quotes/:id/accept", async (req, res, next) => {
  try {
    z.object({ consent: z.literal(true) }).parse(req.body);
    const key = req.get("x-quote-key") || "";
    const { db, client } = await database();
    const session = client.startSession();
    let draftId = "";
    try {
      await session.withTransaction(async () => {
        const quote = await db
          .collection("quotes")
          .findOne({ id: req.params.id, tokenHash: hash(key) }, { session });
        if (!quote)
          throw new Error("Quote is not available. Use your secure link.");
        if (quote.status === "accepted") {
          draftId = quote.draftId;
          return;
        }
        if (quote.expiresAt <= new Date())
          throw new Error(
            "Quote is no longer available. Ask the studio for an updated quote.",
          );
        const updated = await db
          .collection("enquiries")
          .updateOne(
            { reference: quote.enquiry, currentQuoteId: quote.id },
            { $set: { status: "won", updatedAt: new Date() } },
            { session },
          );
        if (!updated.matchedCount)
          throw new Error(
            "A newer quote is available. Ask the studio for the latest link.",
          );
        draftId = `DRAFT-${randomBytes(6).toString("hex").toUpperCase()}`;
        await db
          .collection("draftOrders")
          .insertOne(
            {
              reference: draftId,
              quoteId: quote.id,
              enquiry: quote.enquiry,
              lines: quote.lines,
              currency: quote.currency,
              subtotal: quote.subtotal,
              freight: quote.freight,
              tax: quote.tax,
              total: quote.total,
              terms: quote.terms,
              status: "awaiting-studio-confirmation",
              paymentStatus: "unpaid",
              createdAt: new Date(),
            },
            { session },
          );
        await db
          .collection("quotes")
          .updateOne(
            { id: quote.id },
            { $set: { status: "accepted", acceptedAt: new Date(), draftId } },
            { session },
          );
        await db
          .collection("audit")
          .insertOne(
            {
              action: "quote.accept",
              resource: quote.id,
              draftId,
              at: new Date(),
            },
            { session },
          );
      });
    } finally {
      await session.endSession();
    }
    res.json({ draftId });
  } catch (error) {
    next(error);
  }
});
