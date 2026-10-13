import { Link } from "react-router";
import { collections } from "../lib/brand-content";
import { shopLink, shopIsExternal } from "../lib/brand";
export function loader() {
  throw new Response("Not found", { status: 404 });
}
export const meta = () => [
  { title: "Page not found — Aurelio" },
  { name: "robots", content: "noindex" },
];
export default function NotFound() {
  return (
    <div className="empty-state tall not-found">
      <p className="eyebrow">404</p>
      <h1>
        Page not <em>found.</em>
      </h1>
      <div className="not-found-actions">
        <Link className="button" to="/bulk-orders">
          Export & bulk ↗
        </Link>
        <a
          className="button button-outline"
          href={shopLink}
          {...(shopIsExternal && { target: "_blank", rel: "noopener" })}
        >
          Visit the shop ↗
        </a>
      </div>
      <nav className="not-found-worlds" aria-label="Collections">
        {collections
          .filter((c) => c.slug !== "bespoke")
          .map((c) => (
            <Link key={c.slug} to={`/collections/${c.slug}`}>
              {c.name}
            </Link>
          ))}
      </nav>
    </div>
  );
}
