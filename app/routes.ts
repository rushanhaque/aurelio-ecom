import { type RouteConfig, index, route } from "@react-router/dev/routes";
/* The retail shop lives on Shopify (see brand.shopUrl); this site is the
   atelier, the trade catalogue and enquiries. */
export default [
  route("api/*", "routes/preview-api.ts"),
  index("routes/home.tsx"),
  route("shop", "routes/shop-redirect.ts"),
  route("collections", "routes/collections.tsx"),
  route("collections/:slug", "routes/collection.tsx"),
  route("materials", "routes/materials.tsx"),
  route("about", "routes/craft.tsx"),
  route("care", "routes/care.tsx"),
  route("pieces/:slug", "routes/piece.tsx"),
  route("our-craft", "routes/our-craft-redirect.ts"),
  route("bulk-orders", "routes/bulk.tsx"),
  route("preferences", "routes/preferences.tsx"),
  route("contact", "routes/contact.tsx"),
  route("quotes/:id", "routes/quote.tsx"),
  route("journal", "routes/journal.tsx"),
  route("journal/:slug", "routes/article.tsx"),
  route("admin", "routes/admin.tsx"),
  route("cms", "routes/cms.tsx"),
  route(":page", "routes/info.tsx"),
  route("*", "routes/not-found.tsx"),
] satisfies RouteConfig;
