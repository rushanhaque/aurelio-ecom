import "dotenv/config";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { MongoClient } from "mongodb";
// Local-only smoke test against the running dev server.
const base = "http://localhost:3000";
const marker = randomUUID();
const email = `qa-${marker}@example.invalid`;
const client = new MongoClient(
  `mongodb://127.0.0.1:${process.env.LOCAL_MONGO_PORT || 63938}/?replicaSet=testset`,
);
await client.connect();
const db = client.db(process.env.MONGODB_DATABASE || "aurelio");
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
  return { status: r.status, body: await r.json() };
};
try {
  check((await api("/api/health")).body.ok, "Database health");
  check((await api("/api/admin/overview")).status === 401, "Admin protected");
  const documentResponse = await fetch(base + "/");
  const documentHtml = await documentResponse.text();
  const csp = documentResponse.headers.get("content-security-policy");
  if (csp) {
    const nonce = csp.match(/nonce-([^']+)/)?.[1];
    check(Boolean(nonce), "Nonce CSP configured");
    check(
      [...documentHtml.matchAll(/<script\b([^>]*)>/g)].every((match) =>
        match[1].includes(`nonce="${nonce}"`),
      ),
      "SSR scripts carry the response nonce",
    );
  }
  check(documentHtml.includes('rel="canonical"'), "Canonical link rendered");
  check(
    (await fetch(base + "/sitemap.xml")).status === 200,
    "Sitemap available",
  );
  check(
    (await fetch(base + "/robots.txt")).status === 200,
    "Robots policy available",
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
  check(documentResponse.status === 200, "Homepage renders");
  check(documentHtml.includes("Coming soon"), "Shop launch label renders");
  const redirects = [
    ["/shop", "https://shop.aurelio.in"],
    ["/bulk-orders", "https://exports.aurelio.in"],
    ["/exports", "https://exports.aurelio.in"],
    ...[
      "collections",
      "materials",
      "about",
      "contact",
      "preferences",
      "journal",
      "care",
      "privacy",
      "terms",
      "admin",
      "cms",
    ].map((path) => [`/${path}`, "/"]),
  ];
  for (const [path, destination] of redirects) {
    const response = await fetch(base + path, { redirect: "manual" });
    check(
      response.status === 302 &&
        response.headers.get("location") === destination,
      `${path} redirects`,
    );
  }
  check(
    (await fetch(base + "/not-a-page")).status === 404,
    "Unknown paths return 404",
  );
  console.log(`${assertions} smoke assertions passed.`);
} finally {
  for (const collection of ["enquiries", "messages", "newsletter"])
    await db.collection(collection).deleteMany({ email });
  await client.close();
  console.log("Removed only this test run’s form records.");
}
