import { Router } from "express";
import { z } from "zod";
import { pages } from "../app/lib/help-content.ts";
import { homeContent } from "../app/lib/home-content.ts";
import { database } from "./db.ts";
export const content = Router();
export const contentSchema = z.object({
  slug: z.enum([
    "home",
    "shipping",
    "returns",
    "faq",
    "privacy",
    "terms",
    "accessibility",
  ]),
  expectedVersion: z.number().int().min(0),
  publish: z.boolean(),
  title: z.string().trim().min(2).max(160),
  eyebrow: z.string().trim().min(2).max(100),
  intro: z.string().trim().min(10).max(1000),
  sections: z
    .array(
      z.tuple([
        z.string().trim().min(2).max(200),
        z.string().trim().min(5).max(4000),
      ]),
    )
    .min(1)
    .max(20),
});
content.get("/api/admin/content", async (_req, res) => {
  const { db } = await database();
  const saved = await db
    .collection("content")
    .find({}, { projection: { _id: 0 } })
    .toArray();
  res.json(
    Object.entries({ home: homeContent, ...pages })
      .filter(([slug]) => slug !== "care")
      .map(([slug, base]) => ({
        slug,
        version: 0,
        draft: base,
        ...saved.find((page) => page.slug === slug),
      })),
  );
});
content.post("/api/admin/content", async (req, res, next) => {
  try {
    const { slug, expectedVersion, publish, ...page } = contentSchema.parse(
      req.body,
    );
    const { db, client } = await database();
    const session = client.startSession();
    let conflict = false;
    try {
      await session.withTransaction(async () => {
        conflict = false;
        const previous = await db
          .collection("content")
          .findOne({ slug }, { session });
        if ((previous?.version || 0) !== expectedVersion) {
          conflict = true;
          return;
        }
        const record = {
          slug,
          version: expectedVersion + 1,
          draft: page,
          published: publish ? page : previous?.published || null,
          updatedAt: new Date(),
        };
        await db
          .collection("content")
          .updateOne({ slug }, { $set: record }, { upsert: true, session });
        await db
          .collection("contentVersions")
          .insertOne(
            { ...record, publishedInThisVersion: publish },
            { session },
          );
        await db.collection("audit").insertOne(
          {
            action: publish ? "content.publish" : "content.draft",
            resource: slug,
            version: record.version,
            at: new Date(),
          },
          { session },
        );
      });
    } finally {
      await session.endSession();
    }
    if (conflict)
      return res.status(409).json({
        error:
          "This page changed while you were editing. Reload the editor before saving.",
      });
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});
content.get("/api/admin/content/:slug/versions", async (req, res) => {
  const { db } = await database();
  res.json(
    await db
      .collection("contentVersions")
      .find({ slug: req.params.slug }, { projection: { _id: 0 } })
      .sort({ version: -1 })
      .limit(20)
      .toArray(),
  );
});
