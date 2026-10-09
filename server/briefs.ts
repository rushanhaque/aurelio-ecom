import express from "express";
import rateLimit from "express-rate-limit";
import { randomUUID } from "node:crypto";
import { Binary } from "mongodb";
import sharp from "sharp";
import { database } from "./db.ts";

/* Pictures visitors send with an idea: a photograph, a drawing or a sketch.

   They are private. Nothing here is written under public/, so nothing is
   reachable by URL: each image is re-encoded (which also strips its metadata,
   location included) and kept in MongoDB, and only the studio, signed in with
   the admin token, can read it back. An upload no enquiry has claimed within a
   day expires on its own. */

export const MAX_BRIEF_IMAGES = 3;
const TYPES = ["image/jpeg", "image/png", "image/webp"];

/* The visitor-facing half: one upload at a time, raw image bytes. */
export const briefsPublic = express.Router();
briefsPublic.post(
  "/api/briefs/upload",
  // Uploads are the one expensive call a stranger can make, so they get their
  // own, tighter allowance on top of the general one.
  rateLimit({
    windowMs: 10 * 60 * 1000,
    limit: 12,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { error: "That is a lot of pictures at once. Please try again shortly." },
  }),
  express.raw({ type: TYPES, limit: "6mb" }),
  async (req, res, next) => {
    try {
      if (!Buffer.isBuffer(req.body) || !req.body.length)
        return res
          .status(400)
          .json({ error: "Please choose a JPG, PNG or WebP picture." });
      let image: { data: Buffer; info: { width: number; height: number } };
      let thumb: Buffer;
      try {
        const source = sharp(req.body, {
          limitInputPixels: 40_000_000,
          failOn: "error",
        }).rotate();
        image = await source
          .clone()
          .resize({
            width: 1600,
            height: 1600,
            fit: "inside",
            withoutEnlargement: true,
          })
          .webp({ quality: 84 })
          .toBuffer({ resolveWithObject: true });
        thumb = await source
          .clone()
          .resize({ width: 360, height: 360, fit: "inside" })
          .webp({ quality: 72 })
          .toBuffer();
      } catch {
        return res.status(400).json({
          error:
            "That picture could not be read. Please try a JPG, PNG or WebP.",
        });
      }
      const id = randomUUID();
      const { db } = await database();
      await db.collection("briefFiles").insertOne({
        id,
        data: new Binary(image.data),
        thumb: new Binary(thumb),
        width: image.info.width,
        height: image.info.height,
        bytes: image.data.length,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });
      res.status(201).json({
        id,
        width: image.info.width,
        height: image.info.height,
      });
    } catch (e) {
      next(e);
    }
  },
);

/* The studio half: mounted behind the admin-token guard in api.ts. */
export const briefsAdmin = express.Router();
briefsAdmin.get("/api/admin/briefs/:id", async (req, res, next) => {
  try {
    const { db } = await database();
    const file = await db
      .collection("briefFiles")
      .findOne({ id: req.params.id }, { projection: { _id: 0 } });
    if (!file) return res.status(404).json({ error: "Picture not found." });
    const binary = (req.query.thumb ? file.thumb : file.data) as Binary;
    res.set({
      "Content-Type": "image/webp",
      "Cache-Control": "private, no-store",
      "Content-Disposition": "inline",
    });
    res.send(Buffer.from(binary.buffer.subarray(0, binary.position)));
  } catch (e) {
    next(e);
  }
});
