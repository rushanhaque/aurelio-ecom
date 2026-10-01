import { Link } from "react-router";
import { Search } from "lucide-react";
import { collections } from "../lib/brand-content";
import { useStore } from "../lib/store";
export function loader() {
  throw new Response("Not found", { status: 404 });
}
export const meta = () => [
  { title: "Page not found — Aurelio" },
  { name: "robots", content: "noindex" },
];
export default function NotFound() {
  const { setPanel } = useStore();
  return (
    <div className="empty-state tall not-found">
      <p className="eyebrow">404</p>
      <h1>
        Page not <em>found.</em>
      </h1>
      <div className="not-found-actions">
        <Link className="button" to="/shop">
          Back to the shop ↗
        </Link>
        <button
          className="button button-outline"
          onClick={() => setPanel("search")}
        >
          Search
          <Search size={17} />
        </button>
      </div>
      <nav className="not-found-worlds" aria-label="The collections">
        {collections.map((c) => (
          <Link key={c.slug} to={`/collections/${c.slug}`}>
            {c.name}
          </Link>
        ))}
      </nav>
    </div>
  );
}
