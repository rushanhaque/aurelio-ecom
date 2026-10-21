import { redirect, type LoaderFunctionArgs } from "react-router";
import { brand } from "../lib/brand";

const retiredPages = new Set([
  "collections",
  "materials",
  "about",
  "care",
  "pieces",
  "our-craft",
  "preferences",
  "contact",
  "quotes",
  "journal",
  "admin",
  "cms",
  "faq",
  "privacy",
  "terms",
  "accessibility",
]);

// Keep old bookmarks useful without retaining the retired pages or forwarding
// private enquiry parameters to another site.
export function loader({ request }: LoaderFunctionArgs) {
  const section = new URL(request.url).pathname.split("/")[1];
  if (section === "shop") return redirect(brand.shopUrl, 302);
  if (section === "bulk-orders" || section === "exports")
    return redirect(brand.exportsUrl, 302);
  if (retiredPages.has(section)) return redirect("/", 302);
  throw new Response("Not found", { status: 404 });
}

// A component route lets unknown URLs use the shared branded error boundary.
// Every recognized legacy URL redirects before rendering.
export default function LegacyRedirect() {
  return null;
}
