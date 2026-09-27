import "dotenv/config";
import { MongoClient, ObjectId } from "mongodb";
import { randomUUID } from "node:crypto";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { mkdtemp, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import assert from "node:assert/strict";
const run = promisify(execFile);
const script = path.resolve("scripts/backup.mjs");
const uri = `mongodb://127.0.0.1:${process.env.LOCAL_MONGO_PORT || 63938}/?replicaSet=testset`;
const client = new MongoClient(uri);
await client.connect();
const marker = randomUUID().replaceAll("-", "");
const sourceName = `aurelio_backup_qa_${marker}`,
  targetName = `aurelio_restore_qa_${marker}`;
const directory = await mkdtemp(path.join(tmpdir(), "aurelio-backup-qa-"));
const env = { ...process.env, MONGODB_URI: uri, MONGODB_DATABASE: sourceName };
try {
  const date = new Date("2026-09-01T12:00:00Z"),
    id = new ObjectId();
  await client
    .db(sourceName)
    .collection("products")
    .insertOne({ _id: id, id: "qa-only", stock: 7, createdAt: date });
  await run(process.execPath, [script, "export"], { cwd: directory, env });
  const backupDirectory = path.join(directory, ".data", "backups");
  const files = await readdir(backupDirectory);
  const file = path.join(backupDirectory, files[0]);
  await run(process.execPath, [script, "restore", file, targetName], {
    cwd: directory,
    env,
  });
  const restored = await client
    .db(targetName)
    .collection("products")
    .findOne({ id: "qa-only" });
  assert.equal(restored.stock, 7);
  assert.equal(restored._id.toHexString(), id.toHexString());
  assert.equal(restored.createdAt.toISOString(), date.toISOString());
  await assert.rejects(
    run(process.execPath, [script, "restore", file, targetName], {
      cwd: directory,
      env,
    }),
    /target must be empty/,
  );
  assert.equal(
    await client.db(sourceName).collection("products").countDocuments(),
    1,
  );
  console.log(
    "Backup restore drill passed: preserved ObjectId, dates, values; existing target rejected; source unchanged. Only disposable databases used.",
  );
} finally {
  await client.db(sourceName).dropDatabase();
  await client.db(targetName).dropDatabase();
  await client.close();
  // Exact temp directory returned by mkdtemp; never user data or a computed workspace root.
  const resolved = path.resolve(directory);
  if (
    path.dirname(resolved) === path.resolve(tmpdir()) &&
    path.basename(resolved).startsWith("aurelio-backup-qa-")
  )
    await rm(resolved, { recursive: true, force: true });
}
