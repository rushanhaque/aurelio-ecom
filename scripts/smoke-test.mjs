import "dotenv/config";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { MongoClient } from "mongodb";
// Local-only smoke test. No product records are created or changed.
const base = "http://localhost:3000";
const marker = randomUUID();
const email = `qa-${marker}@example.invalid`;
const client = new MongoClient(
  `mongodb://127.0.0.1:${process.env.LOCAL_MONGO_PORT || 63938}/?replicaSet=testset`,
);
await client.connect();
const db = client.db(process.env.MONGODB_DATABASE || "aurelio");
let userId;
let assertions = 0;
const check = (condition, message) => {
  assert.ok(condition, message);
  assertions++;
};
const api = async (path, data, extra = {}) => {
  const r = await fetch(base + path, {
    method: data ? "POST" : "GET",
    headers: { "Content-Type": "application/json", ...extra },
    ...(data ? { body: JSON.stringify(data) } : {}),
  });
  return {
    status: r.status,
    body: await r.json(),
    cookie: r.headers.get("set-cookie"),
  };
};
try {
  const before = await db.collection("products").countDocuments();
  check((await api("/api/health")).body.ok, "Database health");
  check(
    (await api("/api/products")).body.length ===
      (await db
        .collection("products")
        .countDocuments({ status: { $nin: ["draft", "archived"] } })),
    "Public catalog matches database",
  );
  check((await api("/api/admin/overview")).status === 401, "Admin protected");
  const documentResponse = await fetch(base + "/");
  const documentHtml = await documentResponse.text();
  const csp = documentResponse.headers.get("content-security-policy");
  if(csp) {
    const nonce = csp.match(/nonce-([^']+)/)?.[1];
    check(Boolean(nonce), "Nonce CSP configured");
    check([...documentHtml.matchAll(/<script\b([^>]*)>/g)].every(match => match[1].includes(`nonce="${nonce}"`)), "SSR scripts carry the response nonce");
  }
  check(documentHtml.includes('rel="canonical"'), "Canonical link rendered");
  check((await fetch(base + "/sitemap.xml")).status === 200, "Sitemap available");
  check((await fetch(base + "/robots.txt")).status === 200, "Robots policy available");
  const auth = await api("/api/auth", {
    mode: "register",
    email,
    password: `test-only-${marker}`,
    name: "Disposable QA",
  });
  check(
    auth.status === 200 && auth.body.customer.email === email,
    "Register account",
  );
  userId = auth.body.customer.id;
  check(
    auth.cookie.includes("HttpOnly") && auth.cookie.includes("SameSite=Lax"),
    "Session security attributes",
  );
  const cookie = auth.cookie.split(";")[0];
  check(
    (await api("/api/session", null, { Cookie: cookie })).body.customer.id ===
      userId,
    "Session persistence",
  );
  check(
    (await api("/api/orders", null, { Cookie: cookie })).status === 200,
    "Private order history",
  );
  check(
    (
      await api("/api/auth", {
        mode: "login",
        email,
        password: "wrong-password",
      })
    ).status === 401,
    "Invalid credentials",
  );
  const brief = {
    idempotencyKey: marker,
    name: "Disposable QA",
    email,
    country: "India",
    quantity: 25,
    company: "Test only",
    product: "",
    message: "Local QA enquiry. Not a customer request.",
    website: "",
  };
  const first = await api("/api/enquiries", brief);
  const retry = await api("/api/enquiries", brief);
  check(
    first.status === 201 && first.body.reference === retry.body.reference,
    "Enquiry idempotency",
  );
  check(
    (
      await api("/api/enquiries", {
        ...brief,
        idempotencyKey: randomUUID(),
        quantity: 0,
      })
    ).status === 400,
    "Invalid quantities",
  );
  check(
    (
      await api("/api/contact", {
        name: "Disposable QA",
        email,
        topic: "Local QA",
        message: "Local QA message. Not a customer request.",
      })
    ).status === 201,
    "Contact persistence",
  );
  check(
    (await api("/api/newsletter", { email, consent: true })).body.ok,
    "Consent persistence",
  );
  const admin = await api("/api/admin/overview", null, {
    Authorization: `Bearer ${process.env.ADMIN_TOKEN}`,
  });
  check(
    admin.status === 200 &&
      admin.body.enquiries.some((q) => q.reference === first.body.reference),
    "Studio sees saved enquiry",
  );
  check(
    (
      await api(
        "/api/contact",
        {
          name: "QA",
          email,
          topic: "QA",
          message: "Local QA CSRF validation.",
        },
        { Origin: "https://untrusted.example" },
      )
    ).status === 403,
    "Cross-origin mutation rejected",
  );
  check(
    (await api("/api/orders/AUR-unknown")).status === 404,
    "Order authorization",
  );
  for (const path of [
    "/",
    "/shop",
    "/collections",
    "/collections/urns",
    "/collections/lighting",
    "/collections/furniture",
    "/collections/kitchenware",
    "/collections/decor",
    "/collections/accessories",
    "/collections/bespoke",
    "/materials",
    "/about",
    "/about",
    "/bulk-orders",
    "/contact",
    "/cart",
    "/checkout",
    "/account",
    "/account/link",
    "/preferences",
    "/wishlist",
    "/journal",
    "/journal/the-beauty-of-brass",
    "/shipping",
    "/returns",
    "/care",
    "/faq",
    "/privacy",
    "/terms",
    "/accessibility",
    "/track-order",
    "/admin",
    "/cms",
  ]) {
    const r = await fetch(base + path);
    check(r.status === 200, `${path} renders`);
    check((await r.text()).includes("<h1"), `${path} server-rendered heading`);
  }
  for (const path of [
    "/not-a-page",
    "/products/not-a-product",
    "/journal/not-an-article",
  ])
    check((await fetch(base + path)).status === 404, `${path} returns 404`);
  check((await api("/api/logout", {}, { Cookie: cookie })).body.ok, "Logout");
  check(
    (await api("/api/session", null, { Cookie: cookie })).body.customer ===
      null,
    "Session revoked",
  );
  check(
    (await db.collection("products").countDocuments()) === before,
    "Product catalog unchanged",
  );
  console.log(`${assertions} smoke assertions passed. No products added.`);
} finally {
  if (userId)
    await db.collection("sessions").deleteMany({ customerId: userId });
  for (const collection of ["customers", "enquiries", "messages", "newsletter"])
    await db.collection(collection).deleteMany({ email });
  await client.close();
  console.log(
    "Removed only this test run’s disposable account and form records.",
  );
}
