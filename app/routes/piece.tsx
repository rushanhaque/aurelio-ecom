import { Link, useLoaderData } from "react-router";
import { ArrowUpRight, MessageCircle, Check } from "lucide-react";
import { getPiece, piecesIn } from "../lib/catalogue.server";
import { collections } from "../lib/brand-content";
import { brand } from "../lib/brand";
import { PieceCard, TextLink } from "../components/ui";

export function loader({ params }: { params: { slug?: string } }) {
  const piece = getPiece(params.slug || "");
  if (!piece) throw new Response("Not found", { status: 404 });
  const collection = collections.find((c) => c.slug === piece.collection)!;
  const siblings = piecesIn(piece.collection);
  const at = siblings.findIndex((p) => p.slug === piece.slug);
  // The next four in the collection, wrapping round, so every piece links on.
  const related = [1, 2, 3, 4]
    .map((step) => siblings[(at + step) % siblings.length])
    .filter((p) => p.slug !== piece.slug)
    .map(({ slug, name, suffix, material, finish, image, index }) => ({
      slug,
      name,
      suffix,
      material,
      finish,
      image,
      index,
    }));
  return { piece, collection, related };
}

export const meta = ({
  data,
}: {
  data?: Awaited<ReturnType<typeof loader>>;
}) =>
  data
    ? [
        {
          title: `${data.piece.name} ${data.piece.suffix} — ${data.collection.name} — Aurelio`,
        },
        { name: "description", content: data.piece.story },
      ]
    : [{ title: "Piece not found — Aurelio" }];

export default function Piece() {
  const { piece, collection, related } = useLoaderData<typeof loader>();
  const title = `${piece.name} ${piece.suffix}`;
  const enquire = `/bulk-orders?product=${encodeURIComponent(title)}&brief=${encodeURIComponent(
    `I'd like a quotation for the ${title} (${piece.material}, ${piece.finish}).\nQuantity:\nDestination:\nTimeline:`,
  )}`;
  const whatsapp = `${brand.whatsapp}?text=${encodeURIComponent(
    `Hello Aurelio — I'd like a quotation for the ${title} (${collection.name}).`,
  )}`;
  return (
    <>
      <div className="container breadcrumbs">
        <Link to="/">Home</Link>
        <span>/</span>
        <Link to="/collections">Collections</Link>
        <span>/</span>
        <Link to={`/collections/${collection.slug}#pieces`}>
          {collection.name}
        </Link>
        <span>/</span>
        <span>{title}</span>
      </div>
      <section className="product-detail container piece-detail">
        <div className="product-gallery">
          <div className="main-product-image" data-cursor="LOOK">
            <img
              src={`${piece.image}-960.webp`}
              srcSet={`${piece.image}-480.webp 480w, ${piece.image}-960.webp 960w`}
              sizes="(max-width: 900px) 100vw, 50vw"
              alt={`${title}, ${piece.material.toLowerCase()} with a ${piece.finish.toLowerCase()} finish`}
              width={piece.width}
              height={piece.height}
              fetchPriority="high"
            />
          </div>
        </div>
        <div className="product-information">
          <p className="eyebrow">
            {collection.name.toUpperCase()} / PIECE {piece.index}
          </p>
          <h1>
            {piece.name} <em>{piece.suffix}</em>
          </h1>
          <p className="product-subtitle">{piece.type}</p>
          <p className="piece-availability">
            <span /> Made to order · Bulk &amp; trade enquiry
          </p>
          <p className="product-description">{piece.story}</p>
          <dl className="piece-specs">
            <div>
              <dt>Material</dt>
              <dd>{piece.material}</dd>
            </div>
            <div>
              <dt>Finish</dt>
              <dd>{piece.finish}</dd>
            </div>
            <div>
              <dt>Collection</dt>
              <dd>
                <Link to={`/collections/${collection.slug}`}>
                  {collection.name}
                </Link>
              </dd>
            </div>
          </dl>
          <ul className="piece-details">
            {piece.details.map((detail) => (
              <li key={detail}>
                <Check size={14} /> {detail}
              </li>
            ))}
          </ul>
          <div className="piece-actions">
            <Link className="button" to={enquire}>
              Request a quotation
              <ArrowUpRight size={18} />
            </Link>
            <a
              className="button button-outline"
              href={whatsapp}
              target="_blank"
              rel="noreferrer"
            >
              WhatsApp the trade desk
              <MessageCircle size={17} />
            </a>
          </div>
          <p className="sample-note">
            Material, finish, size and quantity are confirmed with your
            quotation. Samples can be arranged before production.
          </p>
        </div>
      </section>
      {!!related.length && (
        <section className="section container">
          <div className="section-heading">
            <div>
              <p className="eyebrow">
                MORE FROM {collection.name.toUpperCase()}
              </p>
              <h2>
                From the <em>same bench.</em>
              </h2>
            </div>
            <TextLink to={`/collections/${collection.slug}#pieces`}>
              All {collection.name.toLowerCase()}
            </TextLink>
          </div>
          <div className="product-grid related-grid">
            {related.map((p) => (
              <PieceCard piece={p} key={p.slug} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
