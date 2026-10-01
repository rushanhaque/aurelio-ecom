import { Link, useParams } from "react-router";
import { useState, useEffect } from "react";
import {
  ArrowUpRight,
  Heart,
  Check,
  Plus,
  Minus,
  Expand,
  Package,
  Truck,
  Share2,
} from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import { useStore } from "../lib/store";
import { money } from "../lib/catalog";
import { Picture, Quantity, ProductCard, TextLink } from "../components/ui";
import NotFound from "./not-found";
import { getProducts } from "../../server/db";
export async function loader({ params }: { params: { slug?: string } }) {
  const product = (await getProducts()).find((p) => p.slug === params.slug);
  if (!product) throw new Response("Not found", { status: 404 });
  return { product };
}
export const meta = ({
  data,
}: {
  data?: Awaited<ReturnType<typeof loader>>;
}) => [
  {
    title: data
      ? `${data.product.name} — Aurelio`
      : "Object not found — Aurelio",
  },
];
export default function Product() {
  const { slug } = useParams();
  const { products, currency, add, toggleWish, wishlist } = useStore();
  const p = products.find((p) => p.slug === slug);
  const [qty, setQty] = useState(1),
    [view, setView] = useState(""),
    [recent, setRecent] = useState<string[]>([]),
    [shared, setShared] = useState("");
  useEffect(() => {
    setQty(1);
    setView("");
    setShared("");
  }, [slug]);
  // Remember the last few objects looked at, on this device only.
  useEffect(() => {
    if (!p) return;
    try {
      const seen: string[] = JSON.parse(
        localStorage.getItem("aurelio-recent") || "[]",
      );
      setRecent(seen.filter((id) => id !== p.id));
      localStorage.setItem(
        "aurelio-recent",
        JSON.stringify([p.id, ...seen.filter((id) => id !== p.id)].slice(0, 8)),
      );
    } catch {}
  }, [p?.id]);
  if (!p) return <NotFound />;
  // Same collection first, then the rest, so "Better together" is about the
  // object rather than whatever happened to be first in the catalogue.
  const related = [
    ...products.filter((x) => x.id !== p.id && x.category === p.category),
    ...products.filter((x) => x.id !== p.id && x.category !== p.category),
  ].slice(0, 4);
  const recentlyViewed = recent
    .map((id) => products.find((x) => x.id === id))
    .filter((x): x is typeof p => !!x && !related.some((r) => r.id === x.id))
    .slice(0, 4);
  async function share() {
    const url = location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: `${p!.name} — Aurelio`, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setShared("Link copied");
    } catch (error) {
      if ((error as Error).name !== "AbortError")
        setShared("Copy the address bar to share");
    }
  }
  return (
    <>
      <div className="container breadcrumbs">
        <Link to="/">Home</Link>
        <span>/</span>
        <Link to="/shop">The collection</Link>
        <span>/</span>
        <span>{p.name}</span>
      </div>
      <section className="product-detail container">
        <div className="product-gallery">
          <Dialog.Root>
            <div className="main-product-image" data-cursor="LOOK">
              <Picture
                name={view || p.image}
                alt={`${p.name}, ${p.finish}`}
                sizes="(max-width: 900px) 100vw, 50vw"
                eager
              />
              <Dialog.Trigger
                className="icon-button zoom-button"
                aria-label="Enlarge product photograph"
              >
                <Expand size={19} />
              </Dialog.Trigger>
            </div>
            <Dialog.Portal>
              <Dialog.Overlay className="panel-overlay" />
              <Dialog.Content className="zoom-dialog">
                <Dialog.Title className="sr-only">{p.name}</Dialog.Title>
                <Dialog.Description className="sr-only">
                  A closer look.
                </Dialog.Description>
                <Picture name={view || p.image} alt={p.name} sizes="90vw" />
                <Dialog.Close className="button button-outline">
                  Close photograph
                </Dialog.Close>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
          <div className="gallery-thumbs">
            <button
              onClick={() => setView("")}
              className={!view ? "active" : ""}
              aria-label="View object photograph"
            >
              <Picture name={p.image} alt="Object view" sizes="120px" />
            </button>
            {(p.gallery || []).map((src, i) => (
              <button
                key={src}
                onClick={() => setView(src)}
                className={view === src ? "active" : ""}
                aria-label={`View photograph ${i + 2}`}
                aria-pressed={view === src}
              >
                <Picture
                  name={src}
                  alt={`${p.name}, photograph ${i + 2}`}
                  sizes="120px"
                />
              </button>
            ))}
          </div>
        </div>
        <div className="product-information">
          <p className="eyebrow">
            THE AURELIO COLLECTION / {p.material.toUpperCase()}
          </p>
          <h1>{p.name}</h1>
          <p className="product-subtitle">{p.subtitle}</p>
          <p className="detail-price">
            {money(p.prices[currency], currency)}
            <span>{currency}</span>
          </p>
          <p className="product-description">{p.description}</p>
          <div className="finish-select">
            <span>FINISH</span>
            <button className="finish-option" aria-pressed="true">
              <i />
              <span>{p.finish}</span>
              <Check size={13} />
            </button>
          </div>
          <div className="availability">
            <span />
            {p.stock > 0 ? "Available" : "Currently unavailable"}
          </div>
          {p.leadTime && <p>{p.leadTime}</p>}
          {p.styleCode && (
            <div
              className="filter-chips"
              aria-label="Available finishes and sizes"
            >
              {products
                .filter((x) => x.styleCode === p.styleCode)
                .map((x) => (
                  <Link
                    className="text-link"
                    aria-current={x.id === p.id ? "page" : undefined}
                    to={`/products/${x.slug}`}
                    key={x.id}
                  >
                    {x.finish} · {x.dimensions}
                  </Link>
                ))}
            </div>
          )}
          <div className="buy-row">
            <Quantity value={qty} onChange={setQty} max={p.stock} />
            <button
              className="button"
              onClick={() => add(p.id, qty)}
              disabled={!p.stock}
            >
              Add to bag
              <ArrowUpRight size={18} />
            </button>
            <button
              className="icon-button detail-share"
              onClick={share}
              aria-label={`Share ${p.name}`}
            >
              <Share2 size={18} />
            </button>
            <button
              className={`icon-button detail-heart ${wishlist.includes(p.id) ? "saved" : ""}`}
              onClick={() => toggleWish(p.id)}
              aria-label={`Save ${p.name}`}
              aria-pressed={wishlist.includes(p.id)}
            >
              <Heart
                size={20}
                fill={wishlist.includes(p.id) ? "currentColor" : "none"}
              />
            </button>
          </div>
          <p className="share-status" role="status">
            {shared}
          </p>
          <div className="purchase-notes">
            <p>
              <Package size={17} /> A considered arrival, from object to
              packaging.
            </p>
            <p>
              <Truck size={17} /> Delivery estimates available at checkout.
            </p>
          </div>
          <Link
            className="bulk-product-link"
            to={`/bulk-orders?product=${p.slug}`}
          >
            Need more? Enquire in bulk
            <ArrowUpRight size={16} />
          </Link>
          <div className="product-accordions">
            {[
              [
                "Details & dimensions",
                `${p.dimensions}. Weight: ${p.weight || "Contact us for details"}. Material: ${p.material}. Finish: ${p.finish}. SKU: ${p.sku || p.id.toUpperCase()}.`,
              ],
              ["Care", p.care],
              [
                "Delivery & returns",
                "This is a preview. No payment is taken and nothing ships. Final delivery and return terms come before launch.",
              ],
            ].map(([label, body]) => (
              <details key={label}>
                <summary>
                  {label}
                  <Plus size={16} />
                </summary>
                <p>{body}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
      <section className="section container">
        <div className="section-heading">
          <div>
            <h2>
              Pairs <em>well.</em>
            </h2>
          </div>
          <TextLink to="/shop">All objects</TextLink>
        </div>
        <div className="product-grid related-grid">
          {related.map((x, i) => (
            <ProductCard key={x.id} product={x} index={i} />
          ))}
        </div>
      </section>
      {!!recentlyViewed.length && (
        <section className="section container recently-viewed">
          <div className="section-heading">
            <div>
              <h2>
                Recently <em>viewed.</em>
              </h2>
            </div>
          </div>
          <div className="product-grid related-grid">
            {recentlyViewed.map((x, i) => (
              <ProductCard key={x.id} product={x} index={i} />
            ))}
          </div>
        </section>
      )}
      <div className="mobile-buy-bar">
        <span>
          {p.name}
          <small>{money(p.prices[currency], currency)}</small>
        </span>
        <button
          className="button"
          onClick={() => add(p.id, qty)}
          disabled={!p.stock}
        >
          Add to bag
          <Plus size={17} />
        </button>
      </div>
    </>
  );
}
