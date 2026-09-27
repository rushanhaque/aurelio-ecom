import "dotenv/config";
import { MongoClient, BSON } from "mongodb";
import { mkdir, writeFile, readFile } from "node:fs/promises";
import path from "node:path";
const uri =
  process.env.MONGODB_URI ||
  `mongodb://127.0.0.1:${process.env.LOCAL_MONGO_PORT || 63938}/?replicaSet=testset`;
const client = new MongoClient(uri, { serverSelectionTimeoutMS: 10000 });
const sourceName = process.env.MONGODB_DATABASE || "aurelio";
const collections = [
  "products",
  "customers",
  "orders",
  "enquiries",
  "messages",
  "newsletter",
  "returns",
  "quotes",
  "draftOrders",
  "audit",
  "content",
  "contentVersions",
];
await client.connect();
try {
  const [mode = "export", file, targetName] = process.argv.slice(2);
  if (mode === "export") {
    const db = client.db(sourceName);
    const snapshot = {
      format: "aurelio-ejson-v1",
      createdAt: new Date(),
      sourceName,
      collections: {},
    };
    const session = client.startSession();
    try {
      await session.withTransaction(
        async () => {
          for (const name of collections)
            snapshot.collections[name] = await db
              .collection(name)
              .find({}, { session })
              .toArray();
        },
        { readConcern: { level: "snapshot" } },
      );
    } finally {
      await session.endSession();
    }
    const directory = path.resolve(".data/backups");
    await mkdir(directory, { recursive: true });
    const destination = path.join(
      directory,
      `aurelio-${new Date().toISOString().replace(/[:.]/g, "-")}.json`,
    );
    await writeFile(
      destination,
      BSON.EJSON.stringify(snapshot, { relaxed: false }),
      { flag: "wx", mode: 0o600 },
    );
    console.log(
      `Private database export written to ${destination}. Protect this file: it contains customer data. Media files require a separate backup.`,
    );
  } else if (mode === "restore") {
    if (
      !file ||
      !targetName ||
      !/^aurelio_restore_[a-zA-Z0-9_]+$/.test(targetName) ||
      targetName === sourceName
    )
      throw new Error(
        "Restore requires a file and a NEW database named aurelio_restore_<name>. Live databases cannot be overwritten.",
      );
    const db = client.db(targetName);
    if ((await db.listCollections().toArray()).length)
      throw new Error("Restore target must be empty. No records were changed.");
    const snapshot = BSON.EJSON.parse(
      await readFile(path.resolve(file), "utf8"),
    );
    if (snapshot.format !== "aurelio-ejson-v1")
      throw new Error("Unsupported backup format.");
    for (const name of collections)
      if (!Array.isArray(snapshot.collections?.[name]))
        throw new Error(`Missing backup collection: ${name}`);
    for (const name of collections) {
      const records = snapshot.collections[name];
      if (records.length) await db.collection(name).insertMany(records);
      if ((await db.collection(name).countDocuments()) !== records.length)
        throw new Error(`Restore count mismatch: ${name}`);
    }
    console.log(
      `Restore verified into ${targetName}. Original database untouched. Recreate application indexes before any controlled cutover. Sessions and account recovery links are intentionally not restored.`,
    );
  } else
    throw new Error(
      "Use export or restore <backup-file> <aurelio_restore_name>.",
    );
} finally {
  await client.close();
}
