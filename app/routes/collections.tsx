import { Link } from "react-router";
import { ArrowUpRight } from "lucide-react";
import { PageIntro, Picture } from "../components/ui";
import { collections } from "../lib/brand-content";
export const meta = () => [{ title: "Seven collections — Aurelio" }];
export default function Collections() {
  return (
    <>
      <PageIntro
        eyebrow="SEVEN COLLECTIONS. ONE ATELIER."
        title="The worlds of Aurelio."
      >
        <p>
          Furniture, lighting, urns and objets in metal and wood.
          <br /> Made by hand in Moradabad, for homes and trade the world over.
        </p>
      </PageIntro>
      <div className="collection-grid container">
        {collections.map((c) => (
          <Link
            className="collection-card"
            key={c.slug}
            to={"/collections/" + c.slug}
            data-reveal
          >
            <div>
              <Picture name={c.cover} alt={c.name} />
              <span>COLLECTION {c.index}</span>
            </div>
            <h2>
              {c.name}
              <ArrowUpRight size={30} />
            </h2>
            <p>{c.summary}</p>
          </Link>
        ))}
      </div>
    </>
  );
}
