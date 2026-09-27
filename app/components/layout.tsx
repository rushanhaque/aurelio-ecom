import { brand } from "../lib/brand";
import { collections } from "../lib/brand-content";
import { Link, NavLink, useLocation, useNavigate } from "react-router";
import { useEffect, useRef, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import {
  Search,
  ShoppingBag,
  Heart,
  Menu,
  X,
  ArrowUpRight,
  ArrowRight,
  ChevronDown,
  User,
  Check,
  Minus,
  Plus,
} from "lucide-react";
import { useStore, request } from "../lib/store";
import { money, cartTotal, currencies } from "../lib/catalog";
import { Picture, Quantity, EmptyState } from "./ui";
export function Header() {
  const { cart, wishlist, currency, setCurrency, setPanel } = useStore();
  return (
    <>
      <div className="announcement">
        <span>Made by hand in Moradabad. Since 2008.</span>
        <Link to="/our-craft">
          Discover the Aurelio philosophy <ArrowUpRight size={12} />
        </Link>
      </div>
      <header className="site-header">
        <div className="header-left">
          <button
            className="icon-button mobile-menu"
            onClick={() => setPanel("menu")}
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>
          <nav aria-label="Main navigation">
            <NavLink to="/shop">
              Shop <ChevronDown size={11} />
            </NavLink>
            <NavLink to="/collections">Collections</NavLink>
            <NavLink to="/our-craft">Our craft</NavLink>
          </nav>
        </div>
        <Link className="wordmark" to="/" aria-label="Aurelio home">
          AURELIO<span>BY AF INTERNATIONAL</span>
        </Link>
        <div className="header-right">
          <Link className="bulk-nav" to="/bulk-orders">
            Bulk enquiries <ArrowUpRight size={13} />
          </Link>
          <label className="currency-select">
            <span className="sr-only">Currency</span>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as any)}
            >
              {currencies.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
          <button
            className="icon-button"
            onClick={() => setPanel("search")}
            aria-label="Search objects"
          >
            <Search size={19} />
          </button>
          <Link
            className="icon-button desktop-icon"
            to="/account"
            aria-label="Your account"
          >
            <User size={19} />
          </Link>
          <Link
            className="icon-button desktop-icon"
            to="/wishlist"
            aria-label={`Wishlist, ${wishlist.length} saved objects`}
          >
            <Heart size={19} />
          </Link>
          <button
            className="icon-button bag-button"
            onClick={() => setPanel("cart")}
            aria-label={`Open bag, ${cart.reduce((s, l) => s + l.quantity, 0)} items`}
          >
            <ShoppingBag size={19} />
            <span>{cart.reduce((s, l) => s + l.quantity, 0)}</span>
          </button>
        </div>
      </header>
    </>
  );
}
export function Footer() {
  const [status, setStatus] = useState(""),
    [busy, setBusy] = useState(false);
  async function subscribe(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    try {
      await request("/api/newsletter", {
        method: "POST",
        body: JSON.stringify({
          email: new FormData(e.currentTarget).get("email"),
          consent: true,
        }),
      });
      setStatus("You’re on the list. Thank you for being here.");
    } catch (e) {
      setStatus((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <footer className="site-footer">
      <div className="footer-top container">
        <div className="footer-invitation">
          <p className="eyebrow">A NOTE FROM THE ATELIER</p>
          <h2>
            Good things.
            <br />
            <em>Every now and then.</em>
          </h2>
          <p>
            New objects, stories from the workshop, and a little inspiration.
          </p>
          <form className="newsletter-form" onSubmit={subscribe}>
            <label className="sr-only" htmlFor="newsletter-email">
              Your email address
            </label>
            <input
              id="newsletter-email"
              name="email"
              type="email"
              placeholder="Your email address"
              required
            />
            <button aria-label="Subscribe to Aurelio notes" disabled={busy}>
              <ArrowRight size={21} />
            </button>
          </form>
          <small>
            By subscribing, you agree to receive Aurelio notes.{" "}
            <Link to="/privacy">Privacy policy</Link>.
          </small>
          <p className="form-status" role="status">
            {status}
          </p>
        </div>
        <div className="footer-links">
          <div>
            <h3>EXPLORE</h3>
            <Link to="/shop">All objects</Link>
            <Link to="/collections">The collections</Link>
            <Link to="/our-craft">Our craft</Link>
            <Link to="/about">About Aurelio</Link>
            <Link to="/materials">Materials</Link>
            <Link to="/bulk-orders">Bulk enquiries</Link>
            <Link to="/journal">The journal</Link>
          </div>
          <div>
            <h3>HERE TO HELP</h3>
            <Link to="/contact">Contact us</Link>
            <Link to="/shipping">Shipping & delivery</Link>
            <Link to="/returns">Returns & refunds</Link>
            <Link to="/care">Caring for your objects</Link>
            <Link to="/track-order">Track your order</Link>
            <Link to="/faq">Frequently asked</Link>
          </div>
        </div>
      </div>
      <div className="footer-business container">
        <div>
          <h3>THE MORADABAD ATELIER</h3>
          <address>
            {brand.address.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </address>
          <p>{brand.hours}</p>
        </div>
        <div>
          <h3>COLLECTIONS</h3>
          <nav aria-label="Footer collections">
            {collections.map((c) => (
              <Link key={c.slug} to={`/collections/${c.slug}`}>
                {c.name}
              </Link>
            ))}
          </nav>
        </div>
        <div>
          <h3>CONNECT</h3>
          <a href={brand.telephone}>{brand.phone}</a>
          <a href={`mailto:${brand.email}`}>{brand.email}</a>
          <a href={`mailto:${brand.tradeEmail}`}>{brand.tradeEmail}</a>
          <a href={brand.whatsapp} target="_blank" rel="noreferrer">
            WhatsApp ↗
          </a>
          <a href={brand.instagram} target="_blank" rel="noreferrer">
            Instagram ↗
          </a>
          <Link to="/contact?topic=Catalogue%20request">
            Request a catalogue
          </Link>
        </div>
      </div>
      <div className="footer-brand container">
        AURELIO<span>Metal & wood. Moradabad, India.</span>
      </div>
      <div className="footer-bottom container">
        <span>© {new Date().getFullYear()} Aurelio by AF International.</span>
        <span className="preview-note">
          Design preview · Editorial imagery · Payments not connected
        </span>
        <div>
          <Link to="/privacy">Privacy</Link>
          <Link to="/preferences">Cookie & email preferences</Link>
          <Link to="/terms">Terms</Link>
          <Link to="/accessibility">Accessibility</Link>
        </div>
      </div>
    </footer>
  );
}
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
  useEffect(() => setPanel(null), [location.pathname, location.search]);
  const results = products.filter((p) =>
    `${p.name} ${p.category} ${p.finish} ${p.id}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
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
                  ? "Your collection"
                  : panel === "search"
                    ? "Find your next object."
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
                <span className="eyebrow">A WORLD OF CONSIDERED OBJECTS</span>
                {[
                  ["/shop", "Shop all objects"],
                  ["/collections", "The collections"],
                  ["/materials", "Materials"],
                  ["/about", "About Aurelio"],
                  ["/our-craft", "Our craft"],
                  ["/bulk-orders", "Bulk enquiries"],
                  ["/journal", "The journal"],
                ].map(([to, label]) => (
                  <Link to={to} key={to}>
                    {label}
                    <ArrowUpRight size={22} />
                  </Link>
                ))}
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
                  <Link to="/wishlist">Saved objects ({wishlist.length})</Link>
                  <Link to="/account">My account</Link>
                  <Link to="/contact">Get in touch</Link>
                </div>
              </div>
            ) : panel === "search" ? (
              <div className="search-content">
                <div className="search-input">
                  <Search size={20} />
                  <input
                    autoFocus
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Vases, brass, a little inspiration…"
                    aria-label="Search the collection"
                  />
                </div>
                <p className="eyebrow">
                  {query ? `${results.length} OBJECTS FOUND` : "THE COLLECTION"}
                </p>
                {results.map((p) => (
                  <Link
                    className="search-result"
                    key={p.id}
                    to={`/products/${p.slug}`}
                  >
                    <Picture name={p.image} alt={p.name} />
                    <span>
                      {p.name}
                      <small>{p.finish}</small>
                    </span>
                    <ArrowUpRight size={18} />
                  </Link>
                ))}
                {results.length === 0 && (
                  <p>
                    No objects to show yet. The collection is being prepared.
                  </p>
                )}
              </div>
            ) : cart.length ? (
              <>
                <div className="cart-lines">
                  {cart.map((line) => {
                    const p = products.find((p) => p.id === line.productId)!;
                    return (
                      <div className="cart-line" key={p.id}>
                        <Link to={`/products/${p.slug}`}>
                          <Picture name={p.image} alt={p.name} />
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
                  <p>
                    Delivery estimates are shown at checkout. Payments are not
                    connected yet.
                  </p>
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
              <EmptyState title="A little room for something special.">
                Your bag is waiting to be filled with objects you love.
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
export function RouteEffects() {
  const location = useLocation();
  useEffect(() => {
    let context: any;
    let disposed = false;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const activate = async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);
      if (disposed) return;
      gsap.registerPlugin(ScrollTrigger);
      context = gsap.context(() => {
        document.querySelectorAll("[data-reveal]").forEach((el) => {
          if (el.getBoundingClientRect().top > window.innerHeight * 0.85)
            gsap.from(el, {
              y: 24,
              opacity: 0,
              duration: 0.7,
              ease: "power2.out",
              scrollTrigger: { trigger: el, start: "top 94%", once: true },
            });
        });
        const hero = document.querySelector(".hero-visual img");
        if (
          hero &&
          window.matchMedia("(min-width: 900px) and (pointer: fine)").matches
        )
          gsap.to(hero, {
            yPercent: 7,
            ease: "none",
            scrollTrigger: {
              trigger: ".hero",
              start: "top top",
              end: "bottom top",
              scrub: 1,
            },
          });
      });
    };
    const timer = setTimeout(() => activate().catch(() => {}), 120);
    return () => {
      disposed = true;
      clearTimeout(timer);
      context?.revert();
    };
  }, [location.pathname]);
  return null;
}
