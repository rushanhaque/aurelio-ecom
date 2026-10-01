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
      <p className="eyebrow">404 / AN UNEXPECTED TURN</p>
      <h1>
        Not everything
        <br /> is meant to be <em>found.</em>
      </h1>
      <p>But there are beautiful objects waiting in the collection.</p>
      <div className="not-found-actions">
        <Link className="button" to="/shop">
          Find your way back ↗
        </Link>
        <button
          className="button button-outline"
          onClick={() => setPanel("search")}
        >
          Search the atelier
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
