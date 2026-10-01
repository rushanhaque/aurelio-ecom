import assert from "node:assert/strict";
import { readdir } from "node:fs/promises";
process.env.NODE_ENV = "production";
process.env.VERCEL = "1";
process.env.FRONTEND_PREVIEW = "true";
delete process.env.MONGODB_URI;
const { createRequestHandler } = await import("react-router");
const bundles = await readdir(new URL("../build/server/", import.meta.url));
const bundle = bundles.find(name => name.startsWith("nodejs_"));
assert.ok(bundle, "Build with VERCEL=1 before running this test.");
const build = await import(`../build/server/${bundle}/index.js`);
const handler = createRequestHandler(build, "production");
for (const [path, expected] of [["/", "Visit the shop"], ["/shop", "collection"], ["/shipping", "shipping"], ["/materials", "Brass"], ["/cms", "This chapter is still taking shape"], ["/account", "This chapter is still taking shape"], ["/checkout", "This chapter is still taking shape"]]) {
  const response = await handler(new Request(`https://preview.example${path}`));
  const html = await response.text();
  assert.equal(response.status, 200, `${path} renders without MongoDB`);
  assert.ok(html.toLowerCase().includes(expected.toLowerCase()), `${path} has expected content`);
  assert.ok(html.includes('data-frontend-preview="true"'));
  assert.ok(html.includes("noindex,nofollow"));
}
const api = await handler(new Request("https://preview.example/api/auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" }));
assert.equal(api.status, 503);
assert.match((await api.json()).error, /preview/);
console.log("Frontend preview passed: seven SSR routes render without MongoDB; services blocked; preview indexing disabled.");
