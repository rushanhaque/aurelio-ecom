import { useEffect, useRef, useState } from "react";
import { Picture } from "./ui";
import { Link, NavLink, useLocation } from "react-router";
import {
  ArrowUpRight,
  ChevronDown,
  X,
  BookOpen,
  Heart,
  Menu,
  MessageCircle,
  Search,
  ShoppingBag,
  User,
} from "lucide-react";
import { useStore } from "../lib/store";
import { currencies, type Currency } from "../lib/catalog";
import { collections } from "../lib/brand-content";
import { brand } from "../lib/brand";

export function Header() {
  const location = useLocation();
  const { cart, wishlist, currency, setCurrency, setPanel } = useStore();
  const root = useRef<HTMLElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const [expanded, setExpanded] = useState(false);
  const [preview, setPreview] = useState(collections[1]);
  function cancelHover() {
    clearTimeout(hoverTimer.current);
  }
  function closeMenu() {
    cancelHover();
    setExpanded(false);
  }
  useEffect(() => {
    closeMenu();
  }, [location.pathname, location.search, location.hash]);
  useEffect(() => {
    const outside = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) closeMenu();
    };
    document.addEventListener("pointerdown", outside);
    return () => {
      document.removeEventListener("pointerdown", outside);
      cancelHover();
    };
  }, []);
  if (location.pathname === "/") return null;
  const trade =
    location.pathname.startsWith("/bulk-orders") ||
    location.pathname.startsWith("/quotes");
  const count = cart.reduce((total, item) => total + item.quantity, 0);
  const category = new URLSearchParams(location.search).get("category");

  return (
    <header
      ref={root}
      data-expanded={expanded}
      onKeyDown={(event) => {
        if (event.key === "Escape" && expanded) {
          closeMenu();
          trigger.current?.focus();
        }
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null))
          closeMenu();
      }}
      onPointerLeave={(event) => {
        cancelHover();
        if (
          event.pointerType === "mouse" &&
          !root.current?.contains(document.activeElement)
        )
          hoverTimer.current = setTimeout(() => setExpanded(false), 250);
      }}
      onPointerEnter={cancelHover}
      className={`commerce-header ${trade ? "commerce-header--trade" : "commerce-header--shop"}`}
    >
      <div className="commerce-masthead">
        <div className="commerce-identity">
          <button
            className="commerce-icon commerce-menu"
            onClick={() => {
              closeMenu();
              setPanel("menu");
            }}
            aria-label={trade ? "Open trade menu" : "Open shop menu"}
          >
            <Menu size={21} strokeWidth={1.5} />
          </button>
          <div className="commerce-context">
            <span className="commerce-edition">
              {trade ? "Export & trade" : "Objects for living"}
            </span>
            <Link
              className="commerce-switch"
              to={trade ? "/shop" : "/bulk-orders"}
            >
              {trade ? "Visit the shop" : "For trade & projects"}
              <ArrowUpRight size={12} />
            </Link>
          </div>
          {!trade && (
            <button
              className="commerce-search"
              onClick={() => {
                closeMenu();
                setPanel("search");
              }}
              aria-label="Search objects"
            >
              <Search size={17} strokeWidth={1.5} />
              <span>Search</span>
            </button>
          )}
        </div>
        <Link className="commerce-brand" to="/" aria-label="Aurelio home">
          AURELIO<span>BY AF INTERNATIONAL</span>
        </Link>
        <div className="commerce-tools">
          {trade ? (
            <>
              <Link
                className="commerce-catalogue"
                to="/contact?topic=Catalogue%20request"
              >
                <BookOpen size={17} strokeWidth={1.5} />
                <span>Request catalogue</span>
              </Link>
              <a
                className="commerce-icon commerce-whatsapp"
                href={brand.whatsapp}
                target="_blank"
                rel="noreferrer"
                aria-label="Chat with the trade desk on WhatsApp"
                title="WhatsApp the trade desk"
              >
                <MessageCircle size={19} strokeWidth={1.5} />
              </a>
              <Link className="commerce-enquire" to="/bulk-orders#enquire" aria-label="Start an enquiry">
                <span className="commerce-enquire-full">Start an enquiry</span>
                <span className="commerce-enquire-short" aria-hidden="true">Enquire</span>
                <ArrowUpRight size={16} />
              </Link>
            </>
          ) : (
            <>
              <select
                className="commerce-currency"
                value={currency}
                onChange={(event) =>
                  setCurrency(event.target.value as Currency)
                }
                aria-label="Select currency"
              >
                {currencies.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
              <Link
                className="commerce-icon commerce-account"
                to="/account"
                aria-label="Your account"
                title="Your account"
              >
                <User size={19} strokeWidth={1.5} />
              </Link>
              <Link
                className="commerce-icon commerce-saved"
                to="/wishlist"
                aria-label={`Wishlist, ${wishlist.length} saved objects`}
                title="Saved objects"
              >
                <Heart size={19} strokeWidth={1.5} />
                {wishlist.length > 0 && <span className="commerce-dot" />}
              </Link>
              <button
                className="commerce-bag"
                onClick={() => {
                  closeMenu();
                  setPanel("cart");
                }}
                aria-label={`Open bag, ${count} ${count === 1 ? "item" : "items"}`}
              >
                <ShoppingBag size={18} strokeWidth={1.5} />
                <span className="commerce-bag-label">Bag</span>
                <span className="commerce-count">{count}</span>
              </button>
            </>
          )}
        </div>
      </div>
      <div className="commerce-navigation">
        <nav
          className="commerce-links"
          aria-label={trade ? "Trade navigation" : "Shop navigation"}
        >
          {!trade && (
            <Link
              to="/shop"
              aria-current={
                location.pathname === "/shop" && !category ? "page" : undefined
              }
            >
              All objects
            </Link>
          )}
          <button
            ref={trigger}
            className="commerce-disclosure"
            aria-expanded={expanded}
            aria-controls="header-collections"
            onClick={() => {
              cancelHover();
              setExpanded(!expanded);
            }}
            onPointerEnter={(event) => {
              if (event.pointerType === "mouse") {
                cancelHover();
                hoverTimer.current = setTimeout(() => setExpanded(true), 350);
              }
            }}
            onPointerLeave={cancelHover}
          >
            Collections <ChevronDown size={12} />
          </button>
          <Link to={trade ? "/bulk-orders#material-atelier" : "/materials"} aria-current={(trade ? location.hash === "#material-atelier" : location.pathname === "/materials") ? "page" : undefined}>
            {trade ? "Materials & finishes" : "Materials"}
          </Link>
          {trade && <Link to="/bulk-orders#process">How we work</Link>}
          <NavLink to="/about">Our atelier</NavLink>
          <NavLink to="/contact">Contact</NavLink>
        </nav>
      </div>
      <div id="header-collections" className="commerce-mega" hidden={!expanded}>
        <div className="commerce-mega-intro">
          <span className="commerce-overline">THE COLLECTIONS</span>
          <h2>
            Considered objects.
            <br />
            <em>Lasting impressions.</em>
          </h2>
          <p>
            {trade
              ? "Explore the possibilities for your next project."
              : "Metal, wood and the mark of a maker."}
          </p>
          <Link
            to={trade ? "/bulk-orders#collections" : "/shop"}
            onClick={closeMenu}
            className="commerce-mega-all"
          >
            {trade ? "Explore our collections" : "View all objects"}
            <ArrowUpRight size={16} />
          </Link>
        </div>
        <nav className="commerce-mega-links" aria-label="Browse collections">
          {collections.map((item) => (
            <Link
              key={item.slug}
              to={
                item.slug === "bespoke"
                  ? "/bulk-orders#enquire"
                  : trade
                    ? `/collections/${item.slug}`
                    : `/shop?category=${item.slug}`
              }
              onClick={closeMenu}
              onPointerEnter={() => setPreview(item)}
              onFocus={() => setPreview(item)}
              data-preview={preview.slug === item.slug}
              aria-current={
                !trade && category === item.slug ? "page" : undefined
              }
            >
              <span>{item.index}</span>
              <strong>{item.name}</strong>
              <ArrowUpRight size={15} />
            </Link>
          ))}
        </nav>
        <Link
          className="commerce-mega-preview"
          to={
            preview.slug === "bespoke"
              ? "/bulk-orders#enquire"
              : trade
                ? `/collections/${preview.slug}`
                : `/shop?category=${preview.slug}`
          }
          onClick={closeMenu}
        >
          <Picture
            key={preview.slug}
            name={preview.cover}
            alt={preview.name}
            sizes="380px"
            eager
          />
          <span>
            <small>EXPLORE {preview.name.toUpperCase()}</small>
            <strong>{preview.tagline}</strong>
            <ArrowUpRight size={22} />
          </span>
        </Link>
        <button
          className="commerce-mega-close commerce-icon"
          onClick={() => {
            closeMenu();
            trigger.current?.focus();
          }}
          aria-label="Close collections"
        >
          <X size={18} />
        </button>
      </div>
    </header>
  );
}
