import { useLoaderData, Link } from "react-router";
import { useState } from "react";
import { piecesIn } from "../lib/catalogue.server";
import { collections } from "../lib/brand-content";
import { useStore } from "../lib/store";
import {
  PageIntro,
  Picture,
  ProductCard,
  PieceCard,
  TextLink,
} from "../components/ui";
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
  const { products } = useStore();
  const [shown, setShown] = useState(24);
  const items = products.filter((p) => p.category === c.slug);
  return (
    <>
      <PageIntro title={c.name}>
        <p>{c.summary}</p>
      </PageIntro>
      <section className="collection-story container">
        <Picture
          name={c.cover}
          alt={`The Aurelio ${c.name} collection`}
          eager
        />
        <div>
          <h2>
            {c.name},<br /> <em>by Aurelio.</em>
          </h2>
          <p>{c.description}</p>
          <TextLink
            to={
              c.slug === "bespoke"
                ? "/bulk-orders?product=Bespoke"
                : `/shop?category=${c.slug}`
            }
          >
            {c.slug === "bespoke"
              ? "Begin your commission"
              : `Shop ${c.name.toLowerCase()}`}
          </TextLink>
        </div>
      </section>
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
      {c.slug !== "bespoke" && (!!items.length || !pieces.length) && (
        <section className="container section">
          <h2 className="collection-objects-heading">
            Shop {c.name.toLowerCase()}.
          </h2>
          {items.length ? (
            <div className="product-grid">
              {items.map((p, i) => (
                <ProductCard product={p} index={i} key={p.id} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <h3>Coming soon.</h3>
              <p>Pieces will appear here soon.</p>
              <TextLink
                to={`/bulk-orders?product=${encodeURIComponent(c.name)}`}
              >
                Enquire about {c.name.toLowerCase()}
              </TextLink>
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
