import { MongoClient, type Db } from "mongodb";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import type { Product } from "../app/lib/catalog.ts";
import { frontendPreview } from "./preview-mode.ts";
declare global {
  var aurelioDatabase: Promise<{ db: Db; client: MongoClient }> | undefined;
}
export function database() {
  if (!globalThis.aurelioDatabase) globalThis.aurelioDatabase = connect();
  return globalThis.aurelioDatabase;
}
async function connect() {
  let uri = process.env.MONGODB_URI;
  if (!uri) {
    if (process.env.NODE_ENV === "production")
      throw new Error("MONGODB_URI must be configured for production.");
    const { MongoMemoryReplSet } = await import("mongodb-memory-server");
    const dbPath = path.resolve(".data/mongodb");
    await mkdir(dbPath, { recursive: true });
    const replica = await MongoMemoryReplSet.create({
      binary: { version: "8.2.5" },
      // Stable port is essential when reopening persisted replica-set data.
      instanceOpts: [
        { dbPath, port: Number(process.env.LOCAL_MONGO_PORT || 63938) },
      ],
      replSet: { count: 1, storageEngine: "wiredTiger" },
    });
    uri = replica.getUri();
    console.log(
      "Local MongoDB replica set ready. Data directory: .data/mongodb",
    );
  }
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 10000 });
  await client.connect();
  const db = client.db(process.env.MONGODB_DATABASE || "aurelio");
  await Promise.all([
    db.collection("products").createIndex({ id: 1 }, { unique: true }),
    db.collection("products").createIndex({ slug: 1 }, { unique: true }),
    db
      .collection("products")
      .createIndex(
        { sku: 1 },
        { unique: true, partialFilterExpression: { sku: { $gt: "" } } },
      ),
    db.collection("orders").createIndex({ customerId: 1, createdAt: -1 }),
    db.collection("customers").createIndex({ email: 1 }, { unique: true }),
    db
      .collection("sessions")
      .createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
    db.collection("sessions").createIndex({ tokenHash: 1 }, { unique: true }),
    db
      .collection("orders")
      .createIndex({ idempotencyKey: 1 }, { unique: true }),
    db.collection("orders").createIndex({ reference: 1 }, { unique: true }),
    db
      .collection("enquiries")
      .createIndex({ idempotencyKey: 1 }, { unique: true }),
    db.collection("newsletter").createIndex({ email: 1 }, { unique: true }),
    db
      .collection("accountLinks")
      .createIndex({ tokenHash: 1 }, { unique: true }),
    db
      .collection("accountLinks")
      .createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
    db
      .collection("emailPreview")
      .createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
    db.collection("returns").createIndex({ reference: 1 }, { unique: true }),
    db.collection("quotes").createIndex({ id: 1 }, { unique: true }),
    db.collection("content").createIndex({ slug: 1 }, { unique: true }),
    db
      .collection("contentVersions")
      .createIndex({ slug: 1, version: 1 }, { unique: true }),
    db.collection("draftOrders").createIndex({ quoteId: 1 }, { unique: true }),
  ]);
  return { db, client };
}
export async function getProducts() {
  if (frontendPreview()) return [] as Product[];
  const { db } = await database();
  return (await db
    .collection("products")
    .find(
      { status: { $nin: ["draft", "archived"] } },
      { projection: { _id: 0, stockReason: 0 } },
    )
    .toArray()) as unknown as Product[];
}
