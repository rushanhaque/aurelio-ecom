import { Router } from "express";
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
        ? `User-agent: *\nDisallow: /api/\nSitemap: ${origin}/sitemap.xml\n`
        : "User-agent: *\nDisallow: /\n",
    );
});
discovery.get("/sitemap.xml", (_req, res) => {
  const origin = new URL(process.env.SITE_URL || "http://localhost:3000")
    .origin;
  const routes = ["/"];
  res
    .type("application/xml")
    .send(
      `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${routes.map((route) => `<url><loc>${escapeXml(origin + route)}</loc></url>`).join("")}</urlset>`,
    );
});
