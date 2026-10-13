import "dotenv/config";
import express from "express";
import { MongoClient } from "mongodb";
import { randomUUID } from "node:crypto";
import assert from "node:assert/strict";

// All records live in a throwaway replica set, never the real database.
const { MongoMemoryReplSet } = await import("mongodb-memory-server");
const replica = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
const client = new MongoClient(replica.getUri());
await client.connect();
const db = client.db(
  `aurelio_operations_qa_${randomUUID().replaceAll("-", "")}`,
);
globalThis.aurelioDatabase = Promise.resolve({ db, client });
process.env.LOCAL_EMAIL_PREVIEW = "true";
process.env.ADMIN_TOKEN = randomUUID();
const { api } = await import("../server/api.ts");
const app = express();
app.use(api);
const server = app.listen(0, "127.0.0.1");
await new Promise<void>((resolve) => server.once("listening", resolve));
const base = `http://127.0.0.1:${(server.address() as any).port}`;
async function call(
  path: string,
  body?: unknown,
  method = "POST",
  admin = false,
  extra: Record<string, string> = {},
) {
  const response = await fetch(base + path, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(admin ? { Authorization: `Bearer ${process.env.ADMIN_TOKEN}` } : {}),
      ...extra,
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  return { status: response.status, data: await response.json() };
}
const email = "operations@example.invalid";
try {
  assert.equal(
    (await call("/api/admin/overview", undefined, "GET")).status,
    401,
  );
  await call("/api/newsletter", { email, consent: true });
  await call("/api/newsletter/unsubscribe", { email });
  assert.equal(
    (await db.collection("newsletter").findOne({ email }))!.consent,
    false,
  );
  await db
    .collection("draftOrders")
    .createIndex({ quoteId: 1 }, { unique: true });
  await db.collection("enquiries").insertOne({
    reference: "ENQ-1234ABCD",
    name: "Isolated QA",
    status: "new",
  });
  const quoteInput = {
    enquiry: "ENQ-1234ABCD",
    currency: "INR",
    lines: [
      {
        description: "Isolated quotation fixture",
        quantity: 10,
        unitPrice: 1099,
      },
    ],
    freight: 500,
    tax: 100,
    terms: "Test-only terms. Not a commercial quote.",
    validDays: 7,
  };
  assert.equal((await call("/api/admin/quotes", quoteInput)).status, 401);
  const firstQuote = await call("/api/admin/quotes", quoteInput, "POST", true);
  assert.equal(firstQuote.status, 201);
  const firstKey = new URLSearchParams(
    new URL(firstQuote.data.url).hash.slice(1),
  ).get("key")!;
  const secondQuote = await call("/api/admin/quotes", quoteInput, "POST", true);
  assert.equal(secondQuote.data.version, 2);
  const secondKey = new URLSearchParams(
    new URL(secondQuote.data.url).hash.slice(1),
  ).get("key")!;
  assert.equal(
    (
      await call(
        `/api/quotes/${firstQuote.data.id}/accept`,
        { consent: true },
        "POST",
        false,
        { "x-quote-key": firstKey },
      )
    ).status,
    400,
  );
  assert.equal(
    (await call(`/api/quotes/${secondQuote.data.id}`, undefined, "GET")).status,
    404,
  );
  const quoted = await call(
    `/api/quotes/${secondQuote.data.id}`,
    undefined,
    "GET",
    false,
    { "x-quote-key": secondKey },
  );
  assert.equal(quoted.data.total, 11590);
  assert.equal(quoted.data.tokenHash, undefined);
  const accept = () =>
    call(
      `/api/quotes/${secondQuote.data.id}/accept`,
      { consent: true },
      "POST",
      false,
      { "x-quote-key": secondKey },
    );
  const accepted = await Promise.all([accept(), accept()]);
  assert.deepEqual(
    accepted.map((r) => r.status),
    [200, 200],
  );
  assert.equal(accepted[0].data.draftId, accepted[1].data.draftId);
  assert.equal(await db.collection("draftOrders").countDocuments(), 1);
  assert.equal(
    (await db.collection("draftOrders").findOne({}))!.paymentStatus,
    "unpaid",
  );
  console.log(
    "Quote integration passed: authorization, immutable totals, superseded-link rejection, private access, concurrent acceptance creates one unpaid draft.",
  );
  await db.collection("content").createIndex({ slug: 1 }, { unique: true });
  const pageInput = {
    slug: "faq",
    expectedVersion: 0,
    publish: false,
    title: "QA FAQ page",
    eyebrow: "TEST CONTENT",
    intro: "An isolated content test.",
    sections: [
      ["Test section", "Only a disposable database stores this copy."],
    ],
  };
  const contentPages = await call("/api/admin/content", undefined, "GET", true);
  assert.ok(contentPages.data.some((page: any) => page.slug === "home"));
  const homeInput = { ...pageInput, slug: "home", title: "QA material atelier" };
  assert.equal((await call("/api/admin/content", homeInput, "POST", true)).status, 200);
  assert.equal((await db.collection("content").findOne({ slug: "home" }))!.published, null);
  assert.equal((await call("/api/admin/content", { ...homeInput, expectedVersion: 1, publish: true }, "POST", true)).status, 200);
  assert.equal((await db.collection("content").findOne({ slug: "home" }))!.published.title, homeInput.title);
  assert.equal((await call("/api/admin/content", pageInput)).status, 401);
  assert.equal(
    (await call("/api/admin/content", pageInput, "POST", true)).status,
    200,
  );
  assert.equal(
    (await db.collection("content").findOne({ slug: "faq" }))!.published,
    null,
  );
  assert.equal(
    (await call("/api/admin/content", pageInput, "POST", true)).status,
    409,
  );
  assert.equal(
    (
      await call(
        "/api/admin/content",
        { ...pageInput, expectedVersion: 1, publish: true },
        "POST",
        true,
      )
    ).status,
    200,
  );
  assert.equal(
    (
      await call(
        "/api/admin/content",
        { ...pageInput, expectedVersion: 2, title: "Private revised draft" },
        "POST",
        true,
      )
    ).status,
    200,
  );
  const content = await db.collection("content").findOne({ slug: "faq" });
  assert.equal(content!.published.title, "QA FAQ page");
  assert.equal(content!.draft.title, "Private revised draft");
  assert.equal(
    await db.collection("contentVersions").countDocuments({ slug: "faq" }),
    3,
  );
  console.log(
    "Content integration passed: private drafts, explicit publication, stale-edit conflict protection and retained version history.",
  );
  console.log(
    "Operations integration passed: studio authorization, unsubscribe, quotations, content.",
  );
} finally {
  await db.dropDatabase();
  await client.close();
  await replica.stop();
  await new Promise<void>((resolve) => server.close(() => resolve()));
}
