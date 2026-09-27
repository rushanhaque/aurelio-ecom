import "dotenv/config";
import express from "express";
import { MongoClient } from "mongodb";
import { randomUUID } from "node:crypto";
import assert from "node:assert/strict";
import { api } from "../server/api.ts";
// Disposable database and separate random-port HTTP server. Never touches the storefront catalog.
const client = new MongoClient(
  `mongodb://127.0.0.1:${process.env.LOCAL_MONGO_PORT || 63938}/?replicaSet=testset`,
);
await client.connect();
const db = client.db(`aurelio_qa_${randomUUID().replaceAll("-", "")}`);
globalThis.aurelioDatabase = Promise.resolve({ db, client });
const app = express();
app.use(api);
const server = app.listen(0, "127.0.0.1");
await new Promise<void>((resolve) => server.once("listening", resolve));
const port = (server.address() as any).port;
const fixture = {
  id: "isolated-fixture",
  slug: "isolated-fixture",
  name: "Isolated test fixture",
  finish: "Test",
  image: "/uploads/test.webp",
  stock: 3,
  prices: { INR: 100000, USD: 1000, GBP: 1000, EUR: 1000 },
};
const payload = (key = randomUUID()) => ({
  idempotencyKey: key,
  currency: "INR",
  items: [{ productId: fixture.id, quantity: 2 }],
  email: "qa@example.invalid",
  name: "Isolated QA",
  address: "Test address 123",
  city: "Test City",
  postalCode: "123456",
  country: "IN",
  previewConsent: true,
});
async function order(data: any) {
  const r = await fetch(`http://127.0.0.1:${port}/api/checkout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return { status: r.status, data: await r.json() };
}
try {
  await db
    .collection("orders")
    .createIndex({ idempotencyKey: 1 }, { unique: true });
  await db.collection("products").insertOne(fixture);
  const shared = payload();
  const pair = await Promise.all([order(shared), order(shared)]);
  assert.equal(pair[0].status, 201);
  assert.equal(pair[1].status, 201);
  assert.equal(pair[0].data.reference, pair[1].data.reference);
  assert.equal(await db.collection("orders").countDocuments(), 1);
  assert.equal(
    (await db.collection("products").findOne({ id: fixture.id }))!.stock,
    1,
  );
  const altered = await order({
    ...shared,
    items: [{ productId: fixture.id, quantity: 1 }],
  });
  assert.equal(altered.status, 409);
  const retry = await order(shared);
  assert.equal(retry.status, 200);
  assert.equal(retry.data.reference, pair[0].data.reference);
  const privateOrder = await fetch(
    `http://127.0.0.1:${port}/api/orders/${retry.data.reference}`,
  );
  assert.equal(privateOrder.status, 404);
  const permitted = await fetch(
    `http://127.0.0.1:${port}/api/orders/${retry.data.reference}`,
    { headers: { "x-order-token": retry.data.accessToken } },
  );
  assert.equal(permitted.status, 200);
  assert.equal((await permitted.json()).paymentStatus, "unpaid-preview");
  await db
    .collection("products")
    .updateOne({ id: fixture.id }, { $set: { stock: 3 } });
  const competition = await Promise.all([order(payload()), order(payload())]);
  assert.deepEqual(competition.map((x) => x.status).sort(), [201, 400]);
  assert.equal(
    (await db.collection("products").findOne({ id: fixture.id }))!.stock,
    1,
  );
  console.log(
    "Transactional integration passed: duplicate retries, payload conflict, private order access, concurrent stock protection. Storefront catalog untouched.",
  );
} finally {
  await db.dropDatabase();
  await client.close();
  await new Promise<void>((resolve) => server.close(() => resolve()));
}
