import { useEffect, useRef, useState } from "react";
import { Picture } from "./ui";
import { Link, NavLink, useLocation } from "react-router";
import {
  ArrowUpRight,
  ChevronDown,
  X,
  BookOpen,
  Menu,
  MessageCircle,
} from "lucide-react";
import { useStore } from "../lib/store";
import { collections } from "../lib/brand-content";
import { brand, shopLink, shopIsExternal } from "../lib/brand";

/* One header for the whole site: the atelier, its collections and the trade
   desk. The retail shop is on Shopify, reached by "Visit the shop". */
export function Header() {
  const location = useLocation();
  const { setPanel } = useStore();
  const root = useRef<HTMLElement>(null);
  const trigger = useRef<HTMLButtonElement | null>(null);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const [expanded, setExpanded] = useState(false);
  const [previewSlug, setPreviewSlug] = useState("");
  function cancelHover() {
    clearTimeout(hoverTimer.current);
  }
  function closeMenu() {
    cancelHover();
    setExpanded(false);
  }
  function openMenu() {
    setPreviewSlug("");
    setExpanded(true);
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

  const entries = collections.map((c) => ({
    slug: c.slug,
    index: c.index,
    name: c.name,
    line: c.tagline,
    image: c.cover,
    to: c.slug === "bespoke" ? "/bulk-orders#enquire" : `/collections/${c.slug}`,
    current: location.pathname === `/collections/${c.slug}`,
  }));
  const preview =
    entries.find((entry) => entry.slug === previewSlug) ||
    entries[Math.min(1, entries.length - 1)];

  return (
    <header
      ref={root}
      data-expanded={expanded ? "true" : "false"}
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
      className="commerce-header commerce-header--trade"
    >
      <div className="commerce-masthead">
        <div className="commerce-identity">
          <button
            className="commerce-icon commerce-menu"
            onClick={() => {
              closeMenu();
              setPanel("menu");
            }}
            aria-label="Open menu"
          >
            <Menu size={21} strokeWidth={1.5} />
          </button>
          <div className="commerce-context">
            <span className="commerce-edition">Export &amp; trade</span>
            <a
              className="commerce-switch"
              href={shopLink}
              {...(shopIsExternal && { target: "_blank", rel: "noopener" })}
            >
              Visit the shop
              <ArrowUpRight size={12} />
            </a>
          </div>
        </div>
        <Link className="commerce-brand" to="/">
          AURELIO <span>BY AF INTERNATIONAL</span>
        </Link>
        <div className="commerce-tools">
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
          {/* One label shows at a time (CSS), and it is the accessible name. */}
          <Link className="commerce-enquire" to="/bulk-orders#enquire">
            <span className="commerce-enquire-full">Start an enquiry</span>
            <span className="commerce-enquire-short">Enquire</span>
            <ArrowUpRight size={16} />
          </Link>
        </div>
      </div>
      <div className="commerce-navigation">
        <nav className="commerce-links" aria-label="Main navigation">
          <button
            ref={trigger}
            className="commerce-disclosure"
            aria-expanded={expanded}
            aria-controls="header-mega"
            onClick={() => {
              cancelHover();
              if (expanded) setExpanded(false);
              else openMenu();
            }}
            onPointerEnter={(event) => {
              if (event.pointerType === "mouse") {
                cancelHover();
                hoverTimer.current = setTimeout(openMenu, expanded ? 80 : 350);
              }
            }}
            onPointerLeave={cancelHover}
          >
            Collections <ChevronDown size={12} />
          </button>
          <Link
            to="/bulk-orders#material-atelier"
            aria-current={
              location.hash === "#material-atelier" ? "page" : undefined
            }
          >
            Materials &amp; finishes
          </Link>
          <Link to="/bulk-orders#process">How we work</Link>
          <NavLink to="/about">Our atelier</NavLink>
          <NavLink to="/contact">Contact</NavLink>
        </nav>
      </div>
      <div id="header-mega" className="commerce-mega" hidden={!expanded}>
        <div className="commerce-mega-intro">
          <span className="commerce-overline">THE COLLECTIONS</span>
          <h2>
            Considered objects.
            <br />
            <em>Lasting impressions.</em>
          </h2>
          <p>Explore the possibilities for your next project.</p>
          <Link
            to="/collections"
            onClick={closeMenu}
            className="commerce-mega-all"
          >
            Explore our collections
            <ArrowUpRight size={16} />
          </Link>
        </div>
        <nav className="commerce-mega-links" aria-label="Browse collections">
          {entries.map((item) => (
            <Link
              key={item.slug}
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
        {/* Only once opened, so its photograph never loads with the page. */}
        {expanded && preview && (
          <Link
            className="commerce-mega-preview"
            to={preview.to}
            onClick={closeMenu}
          >
            <Picture
              key={preview.slug}
              name={preview.image}
              alt={preview.name}
              sizes="380px"
            />
            <span>
              <small>EXPLORE {preview.name.toUpperCase()}</small>
              <strong>{preview.line}</strong>
              <ArrowUpRight size={22} />
            </span>
          </Link>
        )}
        <button
          className="commerce-mega-close commerce-icon"
          onClick={() => {
            closeMenu();
            trigger.current?.focus();
          }}
          aria-label="Close menu"
        >
          <X size={18} />
        </button>
      </div>
    </header>
  );
}
