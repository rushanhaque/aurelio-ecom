import "dotenv/config";
import express from "express";
import { MongoClient } from "mongodb";
import { randomUUID } from "node:crypto";
import assert from "node:assert/strict";
// A throwaway replica set and a random-port server: never touches real data.
const { MongoMemoryReplSet } = await import("mongodb-memory-server");
const replica = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
const client = new MongoClient(replica.getUri());
await client.connect();
const db = client.db(`aurelio_qa_${randomUUID().replaceAll("-", "")}`);
globalThis.aurelioDatabase = Promise.resolve({ db, client });
process.env.ADMIN_TOKEN = randomUUID();
const { api } = await import("../server/api.ts");
const app = express();
app.use(api);
const server = app.listen(0, "127.0.0.1");
await new Promise<void>((resolve) => server.once("listening", resolve));
const base = `http://127.0.0.1:${(server.address() as any).port}`;
const payload = (key = randomUUID()) => ({
  idempotencyKey: key,
  name: "Isolated QA",
  email: "qa@example.invalid",
  company: "QA Hotels",
  country: "India",
  quantity: 40,
  product: "Lighting",
  message: "Forty brass pendants for a hotel lobby.",
});
async function post(path: string, data: unknown, headers = {}) {
  const r = await fetch(base + path, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(data),
  });
  return { status: r.status, data: await r.json() };
}
try {
  await db
    .collection("enquiries")
    .createIndex({ idempotencyKey: 1 }, { unique: true });
  // A double-clicked send makes one enquiry, not two.
  const shared = payload();
  const pair = await Promise.all([
    post("/api/enquiries", shared),
    post("/api/enquiries", shared),
  ]);
  assert.deepEqual(pair.map((r) => r.status), [201, 201]);
  assert.equal(pair[0].data.reference, pair[1].data.reference);
  assert.equal(await db.collection("enquiries").countDocuments(), 1);
  // The same key with different details is refused, not silently merged.
  assert.equal(
    (await post("/api/enquiries", { ...shared, quantity: 41 })).status,
    409,
  );
  // Bots that fill the hidden field are turned away.
  assert.equal(
    (await post("/api/enquiries", { ...payload(), website: "spam" })).status,
    400,
  );
  // A picture id nobody uploaded cannot be attached.
  assert.equal(
    (
      await post("/api/enquiries", {
        ...payload(),
        attachments: [randomUUID()],
      })
    ).status,
    400,
  );
  const message = await post("/api/contact", {
    name: "Isolated QA",
    email: "qa@example.invalid",
    topic: "Catalogue request",
    message: "Please send the catalogue.",
  });
  assert.equal(message.status, 201);
  // The studio's records are behind the admin token.
  assert.equal((await fetch(`${base}/api/admin/overview`)).status, 401);
  const overview = await fetch(`${base}/api/admin/overview`, {
    headers: { Authorization: `Bearer ${process.env.ADMIN_TOKEN}` },
  });
  const records = await overview.json();
  assert.equal(records.enquiries.length, 1);
  assert.equal(records.messages.length, 1);
  assert.equal(records.enquiries[0].idempotencyKey, undefined);
  console.log(
    "Enquiry integration passed: duplicate sends, payload conflict, honeypot, unknown pictures, contact messages, private studio records.",
  );
} finally {
  await db.dropDatabase();
  await client.close();
  await replica.stop();
  await new Promise<void>((resolve) => server.close(() => resolve()));
}
