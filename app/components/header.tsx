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
import { collections, materials } from "../lib/brand-content";
import { brand } from "../lib/brand";

type Panel = false | "categories" | "materials" | "collections";

export function Header() {
  const location = useLocation();
  const { cart, wishlist, currency, setCurrency, setPanel } = useStore();
  const root = useRef<HTMLElement>(null);
  const triggers = useRef<Record<string, HTMLButtonElement | null>>({});
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const [expanded, setExpanded] = useState<Panel>(false);
  const [previewSlug, setPreviewSlug] = useState("");
  function cancelHover() {
    clearTimeout(hoverTimer.current);
  }
  function closeMenu() {
    cancelHover();
    setExpanded(false);
  }
  function openMenu(panel: Exclude<Panel, false>) {
    setPreviewSlug("");
    setExpanded(panel);
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
  // Collections belong to the trade side; the shop sorts by category and
  // material instead.
  const trade = /^\/(bulk-orders|quotes|collections|pieces)(\/|$)/.test(
    location.pathname,
  );
  const count = cart.reduce((total, item) => total + item.quantity, 0);
  const query = new URLSearchParams(location.search);
  const category = query.get("category");
  const material = query.get("material");

  type Entry = {
    slug: string;
    index: string;
    name: string;
    line: string;
    image: string;
    to: string;
    current: boolean;
  };
  const entries: Entry[] =
    expanded === "materials"
      ? materials.map((m) => ({
          slug: m.slug,
          index: m.index,
          name: m.name,
          line: m.trait,
          image: m.image,
          to: `/shop?material=${encodeURIComponent(m.name)}`,
          current: material === m.name,
        }))
      : collections
          .filter((c) => trade || c.slug !== "bespoke")
          .map((c) => ({
            slug: c.slug,
            index: c.index,
            name: c.name,
            line: c.tagline,
            image: c.cover,
            to:
              c.slug === "bespoke"
                ? "/bulk-orders#enquire"
                : trade
                  ? `/collections/${c.slug}`
                  : `/shop?category=${c.slug}`,
            current: !trade && category === c.slug,
          }));
  const preview =
    entries.find((entry) => entry.slug === previewSlug) ||
    entries[Math.min(1, entries.length - 1)];
  const mega = {
    categories: {
      overline: "SHOP BY CATEGORY",
      title: (
        <>
          Considered objects.
          <br />
          <em>Lasting impressions.</em>
        </>
      ),
      text: "Metal, wood and the mark of a maker.",
      to: "/shop",
      cta: "View all objects",
      label: "Browse categories",
    },
    materials: {
      overline: "SHOP BY MATERIAL",
      title: (
        <>
          Nine materials.
          <br />
          <em>Each its own.</em>
        </>
      ),
      text: "Choose by the surface you want to live with.",
      to: "/materials",
      cta: "About our materials",
      label: "Browse materials",
    },
    collections: {
      overline: "THE COLLECTIONS",
      title: (
        <>
          Considered objects.
          <br />
          <em>Lasting impressions.</em>
        </>
      ),
      text: "Explore the possibilities for your next project.",
      to: "/bulk-orders#collections",
      cta: "Explore our collections",
      label: "Browse collections",
    },
  }[expanded || (trade ? "collections" : "categories")];
  const disclosure = (name: Exclude<Panel, false>, label: string) => (
    <button
      ref={(node) => {
        triggers.current[name] = node;
      }}
      className="commerce-disclosure"
      aria-expanded={expanded === name}
      aria-controls="header-mega"
      onClick={() => {
        cancelHover();
        if (expanded === name) setExpanded(false);
        else openMenu(name);
      }}
      onPointerEnter={(event) => {
        if (event.pointerType === "mouse") {
          cancelHover();
          hoverTimer.current = setTimeout(
            () => openMenu(name),
            expanded ? 80 : 350,
          );
        }
      }}
      onPointerLeave={cancelHover}
    >
      {label} <ChevronDown size={12} />
    </button>
  );

  return (
    <header
      ref={root}
      data-expanded={expanded ? "true" : "false"}
      onKeyDown={(event) => {
        if (event.key === "Escape" && expanded) {
          const open = expanded;
          closeMenu();
          triggers.current[open]?.focus();
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
                location.pathname === "/shop" && !category && !material
                  ? "page"
                  : undefined
              }
            >
              All objects
            </Link>
          )}
          {trade
            ? disclosure("collections", "Collections")
            : disclosure("categories", "Categories")}
          {trade ? (
            <Link
              to="/bulk-orders#material-atelier"
              aria-current={
                location.hash === "#material-atelier" ? "page" : undefined
              }
            >
              Materials &amp; finishes
            </Link>
          ) : (
            disclosure("materials", "Materials")
          )}
          {trade && <Link to="/bulk-orders#process">How we work</Link>}
          <NavLink to="/about">Our atelier</NavLink>
          <NavLink to="/contact">Contact</NavLink>
        </nav>
      </div>
      <div id="header-mega" className="commerce-mega" hidden={!expanded}>
        <div className="commerce-mega-intro">
          <span className="commerce-overline">{mega.overline}</span>
          <h2>{mega.title}</h2>
          <p>{mega.text}</p>
          <Link to={mega.to} onClick={closeMenu} className="commerce-mega-all">
            {mega.cta}
            <ArrowUpRight size={16} />
          </Link>
        </div>
        <nav
          className="commerce-mega-links"
          data-wide={expanded === "materials"}
          aria-label={mega.label}
        >
          {entries.map((item) => (
            <Link
              key={`${expanded}-${item.slug}`}
              to={item.to}
              onClick={closeMenu}
              onPointerEnter={() => setPreviewSlug(item.slug)}
              onFocus={() => setPreviewSlug(item.slug)}
              data-preview={preview?.slug === item.slug}
              aria-current={item.current ? "page" : undefined}
            >
              <span>{item.index}</span>
              <strong>{item.name}</strong>
              <ArrowUpRight size={15} />
            </Link>
          ))}
        </nav>
        {preview && (
          <Link
            className="commerce-mega-preview"
            to={preview.to}
            onClick={closeMenu}
          >
            <Picture
              key={`${expanded}-${preview.slug}`}
              name={preview.image}
              alt={preview.name}
              sizes="380px"
            />
            <span>
              <small>
                {trade ? "EXPLORE" : "SHOP"} {preview.name.toUpperCase()}
              </small>
              <strong>{preview.line}</strong>
              <ArrowUpRight size={22} />
            </span>
          </Link>
        )}
        <button
          className="commerce-mega-close commerce-icon"
          onClick={() => {
            const open = expanded;
            closeMenu();
            if (open) triggers.current[open]?.focus();
          }}
          aria-label="Close menu"
        >
          <X size={18} />
        </button>
      </div>
    </header>
  );
}
