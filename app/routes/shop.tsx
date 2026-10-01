import { Link } from "react-router";
import { collections, materials } from "../lib/brand-content";
import { useSearchParams } from "react-router";
import { SlidersHorizontal, Search, X } from "lucide-react";
import { useStore } from "../lib/store";
import { categories } from "../lib/catalog";
import { PageIntro, ProductCard } from "../components/ui";
export const meta = () => [{ title: "Shop — Aurelio" }];
export default function Shop() {
  const { products, currency } = useStore();
  const [params, setParams] = useSearchParams();
  const category = params.get("category") || "all",
    q = params.get("q") || "",
    material = params.get("material") || "",
    finish = params.get("finish") || "",
    stock = params.get("stock") || "",
    min = params.get("min") || "",
    max = params.get("max") || "",
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
        (!min ||
          !Number.isFinite(Number(min)) ||
          p.prices[currency] >= Number(min) * 100) &&
        (!max ||
          !Number.isFinite(Number(max)) ||
          p.prices[currency] <= Number(max) * 100) &&
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
  const pages = Math.max(1, Math.ceil(visible.length / 12));
  const page = Math.min(
    pages,
    Math.max(1, Number.parseInt(params.get("page") || "1", 10) || 1),
  );
  return (
    <>
      <PageIntro
        eyebrow="HANDCRAFTED IN MORADABAD"
        title={collections.find((c) => c.slug === category)?.name || "Shop"}
      >
        <p>
          Urns, lighting, furniture, kitchenware, decor and accessories.
          <br /> Metal and wood, made by hand for homes and trade.
        </p>
      </PageIntro>
      <section className="container shop-content">
        <div className="category-tabs" aria-label="Filter by category">
          {categories.map((c) => (
            <button
              key={c.id}
              className={category === c.id ? "active" : ""}
              onClick={() => update("category", c.id)}
            >
              {c.name}
            </button>
          ))}
          <Link to="/collections/bespoke">Bespoke ↗</Link>
        </div>
        <div className="shop-toolbar">
          <span className="eyebrow">{visible.length} CONSIDERED OBJECTS</span>
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
          <label className="price-filter">
            <span>{currency} from</span>
            <input
              aria-label="Minimum price"
              type="number"
              min="0"
              step="0.01"
              value={min}
              onChange={(e) => update("min", e.target.value, true)}
            />
          </label>
          <label className="price-filter">
            <span>to</span>
            <input
              aria-label="Maximum price"
              type="number"
              min="0"
              step="0.01"
              value={max}
              onChange={(e) => update("max", e.target.value, true)}
            />
          </label>
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
            <h2>
              {products.length
                ? "A different direction?"
                : "Something worth waiting for."}
            </h2>
            <p>
              {products.length
                ? "No objects match these filters. Try a material, a collection name, or clear your selection."
                : "Our collection is being thoughtfully prepared. Published objects will appear here."}
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
        <p className="catalog-note">
          The Aurelio collection. Individually selected, thoughtfully made.
        </p>
      </section>
    </>
  );
}
