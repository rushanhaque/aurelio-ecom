import { useLoaderData, Link } from "react-router";
import { collections } from "../lib/brand-content";
import { useStore } from "../lib/store";
import { PageIntro, Picture, ProductCard, TextLink } from "../components/ui";
import "../brand-content.css";
export function loader({ params }: { params: { slug?: string } }) {
  const collection = collections.find((c) => c.slug === params.slug);
  if (!collection) throw new Response("Not found", { status: 404 });
  return { collection };
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
  const { collection: c } = useLoaderData<typeof loader>();
  const { products } = useStore();
  const items = products.filter((p) => p.category === c.slug);
  return (
    <>
      <PageIntro
        eyebrow={`COLLECTION ${c.index} / ${c.name.toUpperCase()}`}
        title={c.tagline}
      >
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
      {c.slug !== "bespoke" && (
        <section className="container section">
          <h2 className="collection-objects-heading">
            Objects in this collection.
          </h2>
          {items.length ? (
            <div className="product-grid">
              {items.map((p) => (
                <ProductCard product={p} key={p.id} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <h3>The next chapter is taking shape.</h3>
              <p>
                Available pieces will appear here as they are added to the
                collection.
              </p>
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
        <p className="eyebrow">EXPLORE THE ATELIER</p>
        <TextLink to="/materials">The materials we work in</TextLink>
        <Link className="text-link" to="/collections">
          All seven collections ↗
        </Link>
      </section>
    </>
  );
}
