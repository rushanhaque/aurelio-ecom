import { brand } from "../lib/brand";
import { collections } from "../lib/brand-content";
import {
  Link,
  useLocation,
  useNavigate,
  useNavigation,
} from "react-router";
import { useEffect, useRef, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import {
  Search,
  X,
  ArrowUpRight,
  ArrowRight,
  Check,
} from "lucide-react";
import { useStore, request } from "../lib/store";
import { money, cartTotal, currencies, type Product } from "../lib/catalog";
import { Picture, Quantity, EmptyState } from "./ui";

/* Routes with loaders previously gave no sign that anything was happening
   between the click and the new page. This is that sign. */
export function NavigationProgress() {
  const navigation = useNavigation();
  const busy = navigation.state !== "idle";
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (busy) {
      // Only show for navigations slow enough to notice, so instant ones do
      // not flash a bar.
      const timer = setTimeout(() => setVisible(true), 140);
      return () => clearTimeout(timer);
    }
    // Let the completed bar finish its run before it disappears.
    const timer = setTimeout(() => setVisible(false), 260);
    return () => clearTimeout(timer);
  }, [busy]);
  if (!visible && !busy) return null;
  return (
    <div
      className={`navigation-progress ${busy && visible ? "is-loading" : "is-done"}`}
      role="status"
      aria-live="polite"
    >
      <span className="sr-only">{busy ? "Loading page" : "Page loaded"}</span>
    </div>
  );
}

/* Every term must appear somewhere in the object's description, in any order,
   so "brass bowl" finds "Hammered Bowl · Brass". Name matches rank first. */
function searchCatalog(query: string, products: Product[]) {
  const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  if (!terms.length) return { products, collections };
  const scored = products
    .map((p) => {
      const name = p.name.toLowerCase();
      const haystack =
        `${p.name} ${p.category} ${p.material} ${p.finish} ${p.sku || ""} ${p.description}`.toLowerCase();
      if (!terms.every((t) => haystack.includes(t))) return null;
      const score = terms.reduce(
        (sum, t) => sum + (name.startsWith(t) ? 3 : name.includes(t) ? 2 : 0),
        0,
      );
      return { p, score };
    })
    .filter((entry): entry is { p: Product; score: number } => !!entry)
    .sort((a, b) => b.score - a.score);
  return {
    products: scored.map((entry) => entry.p),
    collections: collections.filter((c) =>
      terms.every((t) => `${c.name} ${c.tagline}`.toLowerCase().includes(t)),
    ),
  };
}

const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function Highlight({ text, query }: { text: string; query: string }) {
  const terms = query.trim().split(/\s+/).filter(Boolean);
  if (!terms.length) return <>{text}</>;
  const pattern = new RegExp(`(${terms.map(escapeRegExp).join("|")})`, "gi");
  return (
    <>
      {text
        .split(pattern)
        .map((part, i) => (i % 2 ? <mark key={i}>{part}</mark> : part))}
    </>
  );
}

export { Header } from "./header";

export { default as Footer } from "./footer";

export function GlobalPanels() {
  const {
    panel,
    setPanel,
    cart,
    products,
    currency,
    quantity,
    remove,
    wishlist,
    notice,
    setCurrency,
  } = useStore();
  const [query, setQuery] = useState("");
  const location = useLocation();
  const trade = location.pathname.startsWith("/bulk-orders") || location.pathname.startsWith("/quotes");
  const navigate = useNavigate();
  // A hash jump on the same page (the trade menu's section links) closes too.
  useEffect(
    () => setPanel(null),
    [location.pathname, location.search, location.hash],
  );
  // "/" and Ctrl/Cmd+K open search from anywhere, unless the reader is typing.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing =
        target?.isContentEditable ||
        /^(INPUT|TEXTAREA|SELECT)$/.test(target?.tagName || "");
      const shortcut =
        (event.key === "/" && !typing) ||
        (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey));
      if (!shortcut || event.altKey) return;
      event.preventDefault();
      setPanel("search");
    };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, [setPanel]);
  const { products: productResults, collections: collectionResults } =
    searchCatalog(query, products);
  const results = productResults.slice(0, 8);
  function submitSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const q = query.trim();
    navigate(q ? `/shop?q=${encodeURIComponent(q)}` : "/shop");
  }
  return (
    <>
      <Dialog.Root
        open={panel !== null}
        onOpenChange={(open) => !open && setPanel(null)}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="panel-overlay" />
          <Dialog.Content
            className={`side-panel ${panel === "menu" ? "menu-panel" : ""}`}
          >
            <div className="panel-heading">
              <Dialog.Title>
                {panel === "cart"
                  ? "Your bag"
                  : panel === "search"
                    ? "Search"
                    : "AURELIO"}
              </Dialog.Title>
              <Dialog.Close className="icon-button" aria-label="Close panel">
                <X size={22} />
              </Dialog.Close>
            </div>
            <Dialog.Description className="sr-only">
              {panel === "cart"
                ? "Review the objects in your bag."
                : panel === "search"
                  ? "Search the Aurelio collection."
                  : "Explore Aurelio pages."}
            </Dialog.Description>
            {panel === "menu" ? (
              <div className="mobile-navigation">
                {(trade
                  ? [
                      ["/bulk-orders#enquire", "Start an enquiry"],
                      ["/bulk-orders#collections", "Collections"],
                      ["/bulk-orders#material-atelier", "Materials & finishes"],
                      ["/bulk-orders#process", "How we work"],
                      ["/contact?topic=Catalogue%20request", "Request a catalogue"],
                      ["/shop", "Visit the shop"],
                      ["/about", "About us"],
                      ["/contact", "Contact us"],
                      ["/faq", "FAQ"],
                    ]
                  : [
                      ["/shop", "Shop"],
                      ["/collections", "Collections"],
                      ["/bulk-orders", "Export & bulk"],
                      ["/materials", "Materials"],
                      ["/about", "About us"],
                      ["/contact", "Contact us"],
                      ["/faq", "FAQ"],
                      ["/journal", "Journal"],
                    ]
                ).map(([to, label]) => (
                  <Link to={to} key={to}>
                    {label}
                    <ArrowUpRight size={22} />
                  </Link>
                ))}
                {trade && (
                  <div className="menu-utilities">
                    <a href={brand.whatsapp} target="_blank" rel="noreferrer">WhatsApp the trade desk</a>
                    <Link to="/">Aurelio home</Link>
                  </div>
                )}
                {!trade && (
                  <div className="menu-utilities">
                    <label className="menu-currency">
                      Currency{" "}
                      <select
                        aria-label="Shopping currency"
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value as any)}
                      >
                        {currencies.map((c) => (
                          <option key={c}>{c}</option>
                        ))}
                      </select>
                    </label>
                    <Link to="/wishlist">
                      Saved objects ({wishlist.length})
                    </Link>
                    <Link to="/account">My account</Link>
                    <Link to="/contact">Get in touch</Link>
                  </div>
                )}
              </div>
            ) : panel === "search" ? (
              <div className="search-content">
                <form
                  className="search-input"
                  role="search"
                  onSubmit={submitSearch}
                >
                  <Search size={20} />
                  <input
                    autoFocus
                    type="search"
                    enterKeyHint="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search vases, brass…"
                    aria-label="Search the collection"
                  />
                  <kbd className="search-hint" aria-hidden="true">
                    ↵
                  </kbd>
                </form>
                {!!collectionResults.length && (
                  <div className="search-collections">
                    <p className="eyebrow">
                      {query ? "COLLECTIONS" : "BROWSE A WORLD"}
                    </p>
                    <div>
                      {collectionResults.map((c) => (
                        <Link key={c.slug} to={`/collections/${c.slug}`}>
                          <Highlight text={c.name} query={query} />
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
                <p className="eyebrow" aria-live="polite">
                  {query
                    ? `${productResults.length} ${productResults.length === 1 ? "OBJECT" : "OBJECTS"} FOUND`
                    : "THE COLLECTION"}
                </p>
                {results.map((p) => (
                  <Link
                    className="search-result"
                    key={p.id}
                    to={`/products/${p.slug}`}
                  >
                    <Picture name={p.image} alt={p.name} sizes="120px" />
                    <span>
                      <Highlight text={p.name} query={query} />
                      <small>{p.finish}</small>
                    </span>
                    <ArrowUpRight size={18} />
                  </Link>
                ))}
                {productResults.length > results.length && (
                  <Link
                    className="text-link"
                    to={`/shop?q=${encodeURIComponent(query.trim())}`}
                  >
                    See all {productResults.length} objects
                    <ArrowRight size={16} />
                  </Link>
                )}
                {productResults.length === 0 &&
                  (products.length && query.trim() ? (
                    <div className="search-empty">
                      <p>
                        Nothing matches “{query.trim()}”. Try “brass”, or ask us
                        — much is made to order.
                      </p>
                      <Link
                        className="text-link"
                        to={`/bulk-orders?brief=${encodeURIComponent(`I am looking for: ${query.trim()}`)}`}
                      >
                        Ask the atelier
                        <ArrowUpRight size={16} />
                      </Link>
                    </div>
                  ) : (
                    <p>The collection is on its way.</p>
                  ))}
              </div>
            ) : cart.length ? (
              <>
                <div className="cart-lines">
                  {cart.map((line) => {
                    const p = products.find((p) => p.id === line.productId);
                    if (!p) return null;
                    return (
                      <div className="cart-line" key={p.id}>
                        <Link to={`/products/${p.slug}`}>
                          <Picture name={p.image} alt={p.name} sizes="120px" />
                        </Link>
                        <div>
                          <Link to={`/products/${p.slug}`}>{p.name}</Link>
                          <small>{p.finish}</small>
                          <Quantity
                            value={line.quantity}
                            max={p.stock}
                            onChange={(n) => quantity(p.id, n)}
                          />
                        </div>
                        <div className="cart-line-end">
                          <span>
                            {money(
                              p.prices[currency] * line.quantity,
                              currency,
                            )}
                          </span>
                          <button onClick={() => remove(p.id)}>Remove</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="cart-bottom">
                  <div className="summary-row">
                    <span>Subtotal</span>
                    <strong>
                      {money(cartTotal(cart, products, currency), currency)}
                    </strong>
                  </div>
                  <p>Delivery is shown at checkout.</p>
                  <Link to="/checkout" className="button">
                    Continue to checkout
                    <ArrowUpRight size={18} />
                  </Link>
                  <Link className="text-link" to="/cart">
                    View your bag
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </>
            ) : (
              <EmptyState title="Your bag is empty.">
                Add something you love.
              </EmptyState>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
      <div className={`toast ${notice ? "show" : ""}`} role="status">
        {notice && (
          <>
            <Check size={16} />
            {notice}
          </>
        )}
      </div>
    </>
  );
}
/* Route reveals and the hero parallax now live in AtelierMotion, so GSAP is
   loaded and context-managed once per route instead of twice. This keeps only
   the work that has to happen on every navigation. */
export function RouteEffects() {
  const location = useLocation();
  const first = useRef(true);
  useEffect(() => {
    // A client-side navigation does not announce itself, so screen reader users
    // otherwise get no confirmation that the page changed.
    if (first.current) {
      first.current = false;
      return;
    }
    const announcer = document.getElementById("route-announcer");
    if (!announcer) return;
    const heading = document.querySelector("main h1")?.textContent?.trim();
    const timer = setTimeout(() => {
      announcer.textContent = `${heading || document.title.split("—")[0].trim()}. Page loaded.`;
    }, 80);
    return () => clearTimeout(timer);
  }, [location.pathname]);
  return null;
}
