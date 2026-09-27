import "dotenv/config";
import express from "express";
import { MongoClient } from "mongodb";
import { randomUUID } from "node:crypto";
import assert from "node:assert/strict";
import { api } from "../server/api.ts";

// All records live in an isolated disposable database, never the storefront.
const client = new MongoClient(
  `mongodb://127.0.0.1:${process.env.LOCAL_MONGO_PORT || 63938}/?replicaSet=testset`,
);
await client.connect();
const db = client.db(
  `aurelio_operations_qa_${randomUUID().replaceAll("-", "")}`,
);
globalThis.aurelioDatabase = Promise.resolve({ db, client });
process.env.LOCAL_EMAIL_PREVIEW = "true";
process.env.ADMIN_TOKEN = randomUUID();
const app = express();
app.use(api);
const server = app.listen(0, "127.0.0.1");
await new Promise<void>((resolve) => server.once("listening", resolve));
const base = `http://127.0.0.1:${(server.address() as any).port}`;
let cookie = "";
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
      Cookie: cookie,
      ...(admin ? { Authorization: `Bearer ${process.env.ADMIN_TOKEN}` } : {}),
      ...extra,
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  return {
    status: response.status,
    data: await response.json(),
    cookie: response.headers.get("set-cookie")?.split(";")[0],
  };
}
const email = "operations@example.invalid";
const password = "isolated-password-one";
try {
  await db.collection("customers").createIndex({ email: 1 }, { unique: true });
  await db
    .collection("accountLinks")
    .createIndex({ tokenHash: 1 }, { unique: true });
  await db
    .collection("returns")
    .createIndex({ reference: 1 }, { unique: true });
  const registered = await call("/api/auth", {
    mode: "register",
    email,
    password,
    name: "QA Collector",
  });
  assert.equal(registered.status, 200);
  cookie = registered.cookie!;
  const addressId = randomUUID();
  const address = {
    id: addressId,
    label: "Studio",
    name: "QA Collector",
    address: "123 Test Street",
    city: "Moradabad",
    region: "UP",
    postalCode: "244001",
    country: "IN",
  };
  assert.equal(
    (
      await call(
        "/api/profile",
        { name: "New name", addresses: [address], defaultAddressId: addressId },
        "PATCH",
      )
    ).status,
    200,
  );
  assert.equal(
    (
      await call(
        "/api/profile",
        {
          name: "New name",
          addresses: [{ ...address, postalCode: "abc" }],
          defaultAddressId: addressId,
        },
        "PATCH",
      )
    ).status,
    400,
  );
  const session = await call("/api/session", undefined, "GET");
  assert.equal(session.data.customer.name, "New name");
  assert.equal(session.data.customer.passwordHash, undefined);
  const known = await call("/api/account-links", { email, purpose: "verify" });
  const unknown = await call("/api/account-links", {
    email: "absent@example.invalid",
    purpose: "verify",
  });
  assert.deepEqual(known.data, unknown.data);
  const verification = await db
    .collection("emailPreview")
    .findOne({ to: email });
  const verifyToken = new URLSearchParams(
    new URL(verification!.url).hash.slice(1),
  ).get("token");
  assert.equal(
    (
      await call("/api/account-links/consume", {
        token: verifyToken,
        purpose: "reset",
        password,
      })
    ).status,
    400,
  );
  assert.equal(
    (
      await call("/api/account-links/consume", {
        token: verifyToken,
        purpose: "verify",
      })
    ).status,
    200,
  );
  assert.equal(
    (
      await call("/api/account-links/consume", {
        token: verifyToken,
        purpose: "verify",
      })
    ).status,
    400,
  );
  assert.ok(
    (await call("/api/session", undefined, "GET")).data.customer
      .emailVerifiedAt,
  );
  await call("/api/account-links", { email, purpose: "reset" });
  const recovery = await db
    .collection("emailPreview")
    .findOne({ subject: "Reset your Aurelio password" });
  const resetToken = new URLSearchParams(
    new URL(recovery!.url).hash.slice(1),
  ).get("token");
  const resets = await Promise.all([
    call("/api/account-links/consume", {
      token: resetToken,
      purpose: "reset",
      password: "second-password-only",
    }),
    call("/api/account-links/consume", {
      token: resetToken,
      purpose: "reset",
      password: "second-password-only",
    }),
  ]);
  assert.deepEqual(resets.map((r) => r.status).sort(), [200, 400]);
  assert.equal(
    (await call("/api/session", undefined, "GET")).data.customer,
    null,
  );
  assert.equal(
    (await call("/api/auth", { mode: "login", email, password })).status,
    401,
  );
  const login = await call("/api/auth", {
    mode: "login",
    email,
    password: "second-password-only",
  });
  assert.equal(login.status, 200);
  cookie = login.cookie!;
  await db.collection("orders").insertOne({
    reference: "QA-ORDER",
    customerId: registered.data.customer.id,
    accessHash: "hidden",
    fingerprint: "private",
    internalNotes: "staff only",
  });
  assert.equal(
    (
      await call("/api/returns", {
        reference: "QA-ORDER",
        reason: "Please help with this test order.",
        type: "question",
      })
    ).status,
    200,
  );
  assert.equal(
    (
      await call("/api/returns", {
        reference: "QA-ORDER",
        reason: "Repeated request should not overwrite.",
      })
    ).status,
    200,
  );
  assert.equal(await db.collection("returns").countDocuments(), 1);
  assert.equal(
    (
      await call(
        "/api/admin/workflow/returns/QA-ORDER",
        {
          status: "reviewing",
          internalNotes: "Private notes",
          customerUpdate: "We are reviewing your request.",
        },
        "PATCH",
        true,
      )
    ).status,
    200,
  );
  const order = await call("/api/orders/QA-ORDER", undefined, "GET");
  assert.equal(order.data.internalNotes, undefined);
  assert.equal(order.data.fingerprint, undefined);
  assert.equal(order.data.support.internalNotes, undefined);
  assert.equal(
    order.data.support.customerUpdate,
    "We are reviewing your request.",
  );
  cookie = "";
  assert.equal(
    (
      await call("/api/returns", {
        reference: "QA-ORDER",
        reason: "Unauthorized test request",
      })
    ).status,
    404,
  );
  assert.equal(
    (await call("/api/admin/overview", undefined, "GET")).status,
    401,
  );
  await db.collection("products").insertMany([
    { id: "qa-draft", slug: "qa-draft", status: "draft" },
    { id: "qa-published", slug: "qa-published", status: "published" },
    { id: "qa-archived", slug: "qa-archived", status: "archived" },
  ]);
  assert.deepEqual(
    (await call("/api/products", undefined, "GET")).data.map((p: any) => p.id),
    ["qa-published"],
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
    slug: "shipping",
    expectedVersion: 0,
    publish: false,
    title: "QA shipping page",
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
    (await db.collection("content").findOne({ slug: "shipping" }))!.published,
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
  const content = await db.collection("content").findOne({ slug: "shipping" });
  assert.equal(content!.published.title, "QA shipping page");
  assert.equal(content!.draft.title, "Private revised draft");
  assert.equal(
    await db.collection("contentVersions").countDocuments({ slug: "shipping" }),
    3,
  );
  console.log(
    "Content integration passed: private drafts, explicit publication, stale-edit conflict protection and retained version history.",
  );
  console.log(
    "Account/operations integration passed: profile validation, one-time purpose-bound links, concurrent reset, revoked sessions, ownership, private notes, draft visibility, unsubscribe. No storefront products added.",
  );
} finally {
  await db.dropDatabase();
  await client.close();
  await new Promise<void>((resolve) => server.close(() => resolve()));
}
