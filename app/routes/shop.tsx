import { Link } from "react-router";
import { collections, materials } from "../lib/brand-content";
import { useSearchParams } from "react-router";
import {
  SlidersHorizontal,
  Search,
  X,
  ArrowUpRight,
  Hammer,
  Package,
  Sparkles,
  PenTool,
} from "lucide-react";
import { useStore } from "../lib/store";
import { Picture, ProductCard } from "../components/ui";
import "../storefront.css";
import {
  ObjectAnatomy,
  Studies,
  ThreeLives,
} from "../components/atelier-experiments";
export const meta = () => [
  { title: "Shop — Aurelio by AF International" },
  {
    name: "description",
    content:
      "Handcrafted furniture, lighting and décor in brass, copper and wood, made by hand in Moradabad.",
  },
];
export default function Shop() {
  const { products, currency } = useStore();
  const [params, setParams] = useSearchParams();
  const category = params.get("category") || "all",
    q = params.get("q") || "",
    material = params.get("material") || "",
    finish = params.get("finish") || "",
    stock = params.get("stock") || "",
    sort = params.get("sort") || "featured";
  function update(key: string, v: string, replace = false) {
    const p = new URLSearchParams(params);
    if (key !== "page") p.delete("page");
    if (v) p.set(key, v);
    else p.delete(key);
    setParams(p, { preventScrollReset: true, replace });
  }
  const terms = q.toLowerCase().trim().split(/\s+/).filter(Boolean);
  const visible = products
    .filter(
      (p) =>
        (category === "all" || p.category === category) &&
        (!material ||
          p.material.toLowerCase().includes(material.toLowerCase())) &&
        (!finish || p.finish === finish) &&
        (!stock || p.stock > 0) &&
        // Every term, in any order — matches the search panel.
        terms.every((term) =>
          `${p.name} ${p.category} ${p.material} ${p.finish} ${p.sku || ""} ${p.description}`
            .toLowerCase()
            .includes(term),
        ),
    )
    .sort((a, b) =>
      sort === "low"
        ? a.prices[currency] - b.prices[currency]
        : sort === "high"
          ? b.prices[currency] - a.prices[currency]
          : Number(b.featured) - Number(a.featured),
    );
  const current = collections.find((c) => c.slug === category);
  const pages = Math.max(1, Math.ceil(visible.length / 12));
  const page = Math.min(
    pages,
    Math.max(1, Number.parseInt(params.get("page") || "1", 10) || 1),
  );
  return (
    <>
      <section className="shop-hero" aria-labelledby="shop-title">
        <Picture
          name={current?.cover || "brand/lightings"}
          alt=""
          sizes="100vw"
          eager
        />
        <div className="shop-hero-veil" aria-hidden="true" />
        <div className="shop-hero-body container">
          <h1 id="shop-title">
            {current ? (
              <>
                {current.name}
                <br /> <em>{current.tagline}</em>
              </>
            ) : (
              <>
                The <em>Shop.</em>
              </>
            )}
          </h1>
          <p>
            {current?.description ||
              "Furniture, lighting and décor in metal and wood. Made by hand, one at a time."}
          </p>
        </div>
      </section>
      <section
        className="shop-collections container"
        aria-label="Shop by collection"
      >
        {collections
          .filter((c) => c.slug !== "bespoke")
          .map((c) => (
            <button
              key={c.slug}
              type="button"
              className={`shop-tile ${category === c.slug ? "active" : ""}`}
              aria-pressed={category === c.slug}
              onClick={() => {
                update("category", category === c.slug ? "" : c.slug);
                document
                  .getElementById("catalogue")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              <Picture name={c.cover} alt="" sizes="200px" />
              <span>{c.name}</span>
            </button>
          ))}
      </section>
      <section className="container shop-content" id="catalogue">
        <div className="shop-toolbar">
          <span className="eyebrow">
            {visible.length} {visible.length === 1 ? "OBJECT" : "OBJECTS"}
          </span>
          <div>
            <label className="shop-search">
              <Search size={15} />
              <input
                aria-label="Search products"
                value={q}
                onChange={(e) => update("q", e.target.value, true)}
                placeholder="Find an object"
              />
            </label>
            <label className="sort-control">
              <span className="sr-only">Filter by material</span>
              <select
                value={material}
                onChange={(e) => update("material", e.target.value)}
              >
                <option value="">All materials</option>
                {materials.map((m) => (
                  <option value={m.name} key={m.slug}>
                    {m.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="sort-control">
              <span className="sr-only">Filter by finish</span>
              <select
                value={finish}
                onChange={(e) => update("finish", e.target.value)}
              >
                <option value="">All finishes</option>
                {[...new Set(products.map((p) => p.finish))].sort().map((f) => (
                  <option key={f}>{f}</option>
                ))}
              </select>
            </label>
            <label className="sort-control">
              <span className="sr-only">Availability</span>
              <select
                value={stock}
                onChange={(e) => update("stock", e.target.value)}
              >
                <option value="">All availability</option>
                <option value="available">In stock</option>
              </select>
            </label>
            <label className="sort-control">
              <SlidersHorizontal size={15} />
              <span className="sr-only">Sort objects</span>
              <select
                value={sort}
                onChange={(e) => update("sort", e.target.value)}
              >
                <option value="featured">Featured</option>
                <option value="low">Price: low to high</option>
                <option value="high">Price: high to low</option>
              </select>
            </label>
          </div>
        </div>
        <div className="filter-chips">
          {[...params.entries()]
            .filter(
              ([k, v]) =>
                ["category", "material", "finish", "stock", "q"].includes(k) &&
                v &&
                v !== "all",
            )
            .map(([key, value]) => (
              <button
                key={key}
                onClick={() => update(key, "")}
                aria-label={`Remove ${key} filter ${value}`}
              >
                {value} ×
              </button>
            ))}
        </div>
        {visible.length ? (
          <div className="product-grid shop-grid">
            {visible.slice((page - 1) * 12, page * 12).map((p, i) => (
              <ProductCard product={p} index={(page - 1) * 12 + i} key={p.id} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <h2>{products.length ? "No matches." : "Coming soon."}</h2>
            <p>
              {products.length
                ? "Nothing matches. Try clearing your filters."
                : "Our collection is on its way."}
            </p>
            <button className="button" onClick={() => setParams({})}>
              Clear filters
              <X size={17} />
            </button>
          </div>
        )}
        {pages > 1 && (
          <nav className="pagination" aria-label="Product pages">
            <button
              disabled={page === 1}
              onClick={() => update("page", String(page - 1))}
            >
              ← Previous
            </button>
            <span>
              Page {page} of {pages}
            </span>
            <button
              disabled={page === pages}
              onClick={() => update("page", String(page + 1))}
            >
              Next →
            </button>
          </nav>
        )}
      </section>
      <Studies>
        <ObjectAnatomy />
        <ThreeLives />
      </Studies>
      <section className="shop-promise container" aria-label="Our promise">
        {[
          [Hammer, "Made by hand", "Raised, cast and finished in Moradabad."],
          [Package, "Packed to travel", "Wrapped and crated for the journey."],
          [Sparkles, "Made to age", "Care notes come with every piece."],
          [PenTool, "Bespoke on request", "Your size, finish or idea."],
        ].map(([Icon, title, copy]: any) => (
          <div key={title}>
            <Icon size={22} strokeWidth={1.4} />
            <strong>{title}</strong>
            <span>{copy}</span>
          </div>
        ))}
      </section>
      <section className="shop-trade">
        <Picture name="brand/decor" alt="" sizes="100vw" />
        <div className="shop-trade-veil" aria-hidden="true" />
        <div className="shop-trade-body container">
          <h2>
            Buying for <em>a business?</em>
          </h2>
          <p>Trade pricing, custom finishes and worldwide export.</p>
          <Link to="/bulk-orders" className="sf-button sf-solid">
            Explore bulk export <ArrowUpRight size={17} />
          </Link>
        </div>
      </section>
    </>
  );
}
