import assert from "node:assert/strict";
import { readdir } from "node:fs/promises";
import express from "express";
import { discovery } from "../server/discovery.ts";

process.env.NODE_ENV = "production";
process.env.FRONTEND_PREVIEW = "true";
process.env.SITE_URL = "https://aurelio.in";
delete process.env.MONGODB_URI;
const { createRequestHandler } = await import("react-router");
const bundles = await readdir(new URL("../build/server/", import.meta.url));
const hosted = bundles.find((name) => name.startsWith("nodejs_"));
const build = await import(
  hosted ? `../build/server/${hosted}/index.js` : "../build/server/index.js"
);
const handler = createRequestHandler(build, "production");
const response = await handler(new Request("https://aurelio.in/"));
const html = await response.text();
assert.equal(response.status, 200);
assert.match(html, /Visit the shop/);
assert.match(html, /Coming soon/);
assert.match(html, /href="https:\/\/shop\.aurelio\.in"/);
assert.match(html, /href="https:\/\/exports\.aurelio\.in"/);
assert.match(html, /data-frontend-preview="true"/);
assert.match(html, /noindex,nofollow/);
assert.doesNotMatch(
  html,
  /href="\/(?:contact|privacy|collections|bulk-orders|admin|cms)(?:["?#/])/,
);
assert.deepEqual(
  Object.keys(build.routes).sort(),
  [
    "root",
    "routes/home",
    "routes/legacy-redirect",
    "routes/preview-api",
  ].sort(),
);

const redirects = [
  ["/shop", "https://shop.aurelio.in"],
  ["/shop/old-product?email=private@example.com", "https://shop.aurelio.in"],
  ["/bulk-orders", "https://exports.aurelio.in"],
  ["/bulk-orders?product=urn", "https://exports.aurelio.in"],
  ["/exports", "https://exports.aurelio.in"],
  ...[
    "collections",
    "collections/urns",
    "pieces/old-piece",
    "materials",
    "about",
    "care",
    "our-craft",
    "preferences",
    "contact",
    "quotes/private-id",
    "journal",
    "journal/old-article",
    "admin",
    "cms",
    "faq",
    "privacy",
    "terms",
    "accessibility",
  ].map((path) => [`/${path}`, "/"]),
];
for (const [path, destination] of redirects) {
  const result = await handler(new Request(`https://aurelio.in${path}`));
  assert.equal(result.status, 302, path);
  assert.equal(result.headers.get("location"), destination, path);
}
const missing = await handler(new Request("https://aurelio.in/not-a-page"));
assert.equal(missing.status, 404);
assert.match(await missing.text(), /Back to Aurelio/);
const api = await handler(
  new Request("https://aurelio.in/api/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{}",
  }),
);
assert.equal(api.status, 503);
assert.match((await api.json()).error, /preview/);

const app = express();
app.use(discovery);
const server = await new Promise((resolve) => {
  const running = app.listen(0, "127.0.0.1", () => resolve(running));
});
try {
  const base = `http://127.0.0.1:${server.address().port}`;
  const sitemap = await (await fetch(`${base}/sitemap.xml`)).text();
  assert.deepEqual(
    [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]),
    ["https://aurelio.in/"],
  );
  process.env.INDEXING_ENABLED = "false";
  assert.equal(
    await (await fetch(`${base}/robots.txt`)).text(),
    "User-agent: *\nDisallow: /\n",
  );
  process.env.INDEXING_ENABLED = "true";
  assert.match(
    await (await fetch(`${base}/robots.txt`)).text(),
    /Sitemap: https:\/\/aurelio\.in\/sitemap\.xml/,
  );
} finally {
  await new Promise((resolve, reject) =>
    server.close((error) => (error ? reject(error) : resolve())),
  );
}
console.log(
  "Homepage SSR, external links, retired-page redirects, 404, preview API, and homepage-only sitemap passed. No messages sent.",
);
