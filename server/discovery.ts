import { Router } from "express";
import { getProducts } from "./db.ts";
import { collections } from "../app/lib/brand-content.ts";
import { articles } from "../app/lib/journal.ts";
export const discovery = Router();
const escapeXml = (value: string) =>
  value.replace(
    /[<>&"']/g,
    (c) =>
      ({
        "<": "&lt;",
        ">": "&gt;",
        "&": "&amp;",
        '"': "&quot;",
        "'": "&apos;",
      })[c]!,
  );
discovery.get("/robots.txt", (_req, res) => {
  const origin = new URL(process.env.SITE_URL || "http://localhost:3000")
    .origin;
  const live = process.env.INDEXING_ENABLED === "true";
  res
    .type("text/plain")
    .send(
      live
        ? `User-agent: *\nDisallow: /api/\nDisallow: /admin\nDisallow: /account\nDisallow: /orders/\nDisallow: /checkout\nDisallow: /cart\nDisallow: /wishlist\nSitemap: ${origin}/sitemap.xml\n`
        : "User-agent: *\nDisallow: /\n",
    );
});
discovery.get("/sitemap.xml", async (_req, res) => {
  const origin = new URL(process.env.SITE_URL || "http://localhost:3000")
    .origin;
  const routes = [
    "/",
    "/shop",
    "/collections",
    "/materials",
    "/about",
    "/our-craft",
    "/care",
    "/bulk-orders",
    "/contact",
    "/journal",
    "/faq",
    "/shipping",
    "/returns",
    "/privacy",
    "/terms",
    "/accessibility",
    ...collections.map((c) => `/collections/${c.slug}`),
    ...articles.map((a) => `/journal/${a.slug}`),
    ...(await getProducts()).map((p) => `/products/${p.slug}`),
  ];
  res
    .type("application/xml")
    .send(
      `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${routes.map((route) => `<url><loc>${escapeXml(origin + route)}</loc></url>`).join("")}</urlset>`,
    );
});
