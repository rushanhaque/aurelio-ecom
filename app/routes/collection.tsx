import { useLoaderData, Link } from "react-router";
import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { Studies, YourLine } from "../components/atelier-experiments";
import { piecesIn } from "../lib/catalogue.server";
import { collections } from "../lib/brand-content";
import { PageIntro, PieceCard, TextLink } from "../components/ui";
export function loader({ params }: { params: { slug?: string } }) {
  const collection = collections.find((c) => c.slug === params.slug);
  if (!collection) throw new Response("Not found", { status: 404 });
  // Only what the grid shows; the full catalogue stays on the server.
  const pieces = piecesIn(collection.slug).map(
    ({ slug, name, suffix, material, finish, image, index }) => ({
      slug,
      name,
      suffix,
      material,
      finish,
      image,
      index,
    }),
  );
  return { collection, pieces };
}
/* Tells the root layout this route writes its own description. */
export const handle = { describes: true };
export const meta = ({
  data,
}: {
  data?: { collection: (typeof collections)[number] };
}) => [
  { title: `${data?.collection.name || "Collection"} — Aurelio` },
  {
    name: "description",
    content: data?.collection.summary || "The Aurelio collections.",
  },
];
export default function Collection() {
  const { collection: c, pieces } = useLoaderData<typeof loader>();
  const [shown, setShown] = useState(24);
  return (
    <>
      <PageIntro
        title={
          <>
            {c.name}
            <br /> <em>{c.tagline}</em>
          </>
        }
        image={c.cover}
      >
        <p>{c.description}</p>
        <Link
          className="page-hero-cta"
          to={
            c.slug === "bespoke"
              ? "/bulk-orders?product=Bespoke#enquire"
              : `/bulk-orders?product=${encodeURIComponent(c.name)}#enquire`
          }
        >
          {c.slug === "bespoke"
            ? "Begin your commission"
            : `Enquire about ${c.name.toLowerCase()}`}
          <ArrowUpRight size={16} />
        </Link>
      </PageIntro>
      {c.slug === "bespoke" && (
        <Studies>
          <YourLine />
        </Studies>
      )}
      {c.slug !== "bespoke" && !pieces.length && (
        <section className="container section">
          <div className="empty-state">
            <h3>Made to order.</h3>
            <p>Tell us what you need and we will draw and cost it.</p>
            <TextLink
              to={`/bulk-orders?product=${encodeURIComponent(c.name)}`}
            >
              Enquire about {c.name.toLowerCase()}
            </TextLink>
          </div>
        </section>
      )}
      {!!pieces.length && (
        <section className="container section piece-section" id="pieces">
          <div className="section-heading">
            <div>
              <h2>
                {c.name},<br /> <em>made to order.</em>
              </h2>
            </div>
            <TextLink to={`/bulk-orders?product=${encodeURIComponent(c.name)}`}>
              Enquire about {c.name.toLowerCase()}
            </TextLink>
          </div>
          <p className="piece-note">
            Made to order. Quantities and lead times are quoted per piece.
          </p>
          <div className="product-grid piece-grid">
            {pieces.slice(0, shown).map((piece) => (
              <PieceCard piece={piece} key={piece.slug} />
            ))}
          </div>
          {shown < pieces.length && (
            <div className="piece-more">
              <span>
                Showing {shown} of {pieces.length}
              </span>
              <button
                className="button button-outline"
                onClick={() => setShown((n) => n + 24)}
              >
                Show more
              </button>
            </div>
          )}
        </section>
      )}
      <section className="editorial-cta container">
        <TextLink to="/materials">Our materials</TextLink>
        <Link className="text-link" to="/collections">
          All collections ↗
        </Link>
      </section>
    </>
  );
}
