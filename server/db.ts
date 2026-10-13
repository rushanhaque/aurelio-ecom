import { MongoClient, type Db } from "mongodb";
import { mkdir } from "node:fs/promises";
import path from "node:path";
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
    db
      .collection("enquiries")
      .createIndex({ idempotencyKey: 1 }, { unique: true }),
    db.collection("newsletter").createIndex({ email: 1 }, { unique: true }),
    db
      .collection("emailPreview")
      .createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
    db.collection("quotes").createIndex({ id: 1 }, { unique: true }),
    db.collection("content").createIndex({ slug: 1 }, { unique: true }),
    db
      .collection("contentVersions")
      .createIndex({ slug: 1, version: 1 }, { unique: true }),
    db.collection("draftOrders").createIndex({ quoteId: 1 }, { unique: true }),
    db.collection("briefFiles").createIndex({ id: 1 }, { unique: true }),
    // Pictures nobody attached to an enquiry go after a day (expiresAt is
    // removed once an enquiry claims them).
    db
      .collection("briefFiles")
      .createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
  ]);
  return { db, client };
}
