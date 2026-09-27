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
    [view, setView] = useState("");
  useEffect(() => {
    setQty(1);
    setView("");
  }, [slug]);
  if (!p) return <NotFound />;
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
            <div className="main-product-image">
              <Picture
                name={view || p.image}
                alt={`${p.name}, ${p.finish}`}
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
                  A closer look at the object.
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
              <Picture name={p.image} alt="Object view" />
            </button>
            {(p.gallery || []).map((src, i) => (
              <button
                key={src}
                onClick={() => setView(src)}
                className={view === src ? "active" : ""}
                aria-label={`View photograph ${i + 2}`}
                aria-pressed={view === src}
              >
                <Picture name={src} alt={`${p.name}, photograph ${i + 2}`} />
              </button>
            ))}
            <span>AN OBJECT TO LIVE WITH.</span>
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
            Thinking bigger? Enquire for bulk
            <ArrowUpRight size={16} />
          </Link>
          <div className="product-accordions">
            {[
              [
                "Details & dimensions",
                `${p.dimensions}. Weight: ${p.weight || "Contact us for details"}. Material: ${p.material}. Finish: ${p.finish}. SKU: ${p.sku || p.id.toUpperCase()}.`,
              ],
              ["A little care goes a long way", p.care],
              [
                "Delivery & returns",
                "This is a preview storefront. No real payment is collected and no physical shipment is created. Final shipping services and return terms will be published before live ordering.",
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
          <p className="sample-note">
            Please review dimensions, material and care details before ordering.
          </p>
        </div>
      </section>
      <section className="section container">
        <div className="section-heading">
          <div>
            <p className="eyebrow">BEAUTIFUL COMPANY</p>
            <h2>
              Better <em>together.</em>
            </h2>
          </div>
          <TextLink to="/shop">Explore all objects</TextLink>
        </div>
        <div className="product-grid related-grid">
          {products
            .filter((x) => x.id !== p.id)
            .slice(0, 4)
            .map((x, i) => (
              <ProductCard key={x.id} product={x} index={i} />
            ))}
        </div>
      </section>
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
