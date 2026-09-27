import { Link } from "react-router";
export function loader() {
  throw new Response("Not found", { status: 404 });
}
export default function NotFound() {
  return (
    <div className="empty-state tall">
      <p className="eyebrow">404 / AN UNEXPECTED TURN</p>
      <h1>
        Not everything
        <br /> is meant to be <em>found.</em>
      </h1>
      <p>But there are beautiful objects waiting in the collection.</p>
      <Link className="button" to="/shop">
        Find your way back ↗
      </Link>
    </div>
  );
}
