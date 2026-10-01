import { useEffect, useRef, useState } from "react";
import { Link, useLoaderData } from "react-router";
import { MaterialAtelier } from "../components/material-atelier";
import { AtelierExperiments } from "../components/atelier-experiments";
import { MaterialStudies } from "../components/material-studies";
import { heroMedia, homeContent } from "../lib/home-content";
import { database } from "../../server/db";
import { frontendPreview } from "../../server/preview-mode";
import { ArrowUpRight } from "lucide-react";
import { Picture, ProductCard, TextLink } from "../components/ui";
import { useStore } from "../lib/store";
import "../immersive.css";
import "../home-hero.css";
import {
  SelectedWorks,
  AurelioStandard,
  OriginalAtelier,
} from "../components/original-sections";
import { MakingStory, ReadingStatement } from "../components/storytelling";
function Orbit({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`orbit-art ${className}`}
      viewBox="0 0 300 300"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="150" cy="150" r="142" />
      <ellipse
        cx="150"
        cy="150"
        rx="142"
        ry="57"
        transform="rotate(-35 150 150)"
      />
      <ellipse
        cx="150"
        cy="150"
        rx="142"
        ry="57"
        transform="rotate(35 150 150)"
      />
      <circle cx="150" cy="150" r="95" />
      <path d="M150 0V300M0 150H300" />
      <circle cx="150" cy="150" r="5" fill="currentColor" />
    </svg>
  );
}
/* The landing hero is only the film and two ways in. */
function VideoHero() {
  const video = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const film = video.current;
    if (!film) return;
    if (film.readyState >= 3) setReady(true);
    // Visitors who ask for less motion get the still poster, not the film.
    const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (calm) film.pause();
    // Rest the film while it is off screen.
    const watch = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) film.pause();
      else if (!calm) film.play().catch(() => {});
    });
    watch.observe(film);
    return () => watch.disconnect();
  }, []);
  return (
    <section
      className={`atelier-hero film-hero ${ready ? "is-ready" : ""}`}
      aria-label="Aurelio"
    >
      <video
        ref={video}
        className="film-video"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        poster={heroMedia.poster}
        aria-hidden="true"
        onCanPlay={() => setReady(true)}
      >
        <source src={heroMedia.webm} type="video/webm" />
        <source src={heroMedia.mp4} type="video/mp4" />
      </video>
      <div className="film-veil" aria-hidden="true" />
      <div className="hero-grain" aria-hidden="true" />
      <h1 className="sr-only">Aurelio</h1>
      <nav
        className="film-actions"
        aria-label="Choose how to work with Aurelio"
      >
        <Link to="/shop" className="film-button film-button-solid">
          Visit the shop
          <ArrowUpRight size={17} />
        </Link>
        <Link to="/bulk-orders" className="film-button film-button-glass">
          Explore bulk export
          <ArrowUpRight size={17} />
        </Link>
      </nav>
    </section>
  );
}
const services = [
  {
    to: "/shop",
    cursor: "SHOP",
    index: "01",
    label: "The Shop",
    image: "brand/lightings",
    alt: "Handcrafted brass lighting in a softly lit room",
    title: ["Shop the", "collection."],
    copy: "Furniture, lighting and décor in metal and wood.",
    cta: "Enter the shop",
  },
  {
    to: "/bulk-orders",
    cursor: "ENQUIRE",
    index: "02",
    label: "Export & Trade",
    image: "brand/furniture",
    alt: "A collection of handcrafted metal and wood furniture",
    title: ["Export &", "bulk orders."],
    copy: "For retailers, hotels and gifting. We make and ship worldwide.",
    cta: "Start an enquiry",
  },
];
function ServicesSplit() {
  return (
    <section
      className="services-split"
      id="services"
      aria-labelledby="services-title"
    >
      <header className="services-head container" data-reveal>
        <h2 id="services-title">
          One workshop. <em>Two doors.</em>
        </h2>
        <p>From a single piece to a full container.</p>
      </header>
      <div className="services-grid">
        {services.map((s) => (
          <Link
            key={s.to}
            to={s.to}
            className="service-panel"
            data-cursor={s.cursor}
            data-reveal
          >
            <Picture
              name={s.image}
              alt={s.alt}
              sizes="(max-width: 860px) 100vw, 50vw"
            />
            <span className="service-veil" aria-hidden="true" />
            <span className="service-body">
              <span className="service-title">
                {s.title[0]} <em>{s.title[1]}</em>
              </span>
              <span className="service-copy">{s.copy}</span>
              <span className="service-cta">
                {s.cta}
                <span className="door-arrow">
                  <ArrowUpRight size={18} />
                </span>
              </span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
export async function loader() {
  if (frontendPreview()) return { homeCopy: homeContent };
  const { db } = await database();
  const saved = await db.collection("content").findOne({ slug: "home" });
  return { homeCopy: (saved?.published || homeContent) as typeof homeContent };
}
export default function Home() {
  const { homeCopy } = useLoaderData<typeof loader>();
  const { products } = useStore();
  return (
    <div className="immersive-home">
      <VideoHero />
      <ServicesSplit />
      <section className="opening-note container" id="prologue">
        <ReadingStatement />
        <div className="opening-foot">
          <Orbit />
          <p>Made by hand in Moradabad since 2008.</p>
        </div>
      </section>
      <MakingStory />
      <OriginalAtelier />
      <SelectedWorks />
      <MaterialAtelier copy={homeCopy} />
      <AtelierExperiments />
      <MaterialStudies />
      <AurelioStandard />
      <section className="collection-premiere container" id="selected">
        <div className="premiere-head">
          <h2>
            Objects.
            <br /> <em>With an inner life.</em>
          </h2>
          <TextLink to="/shop">Enter the collection</TextLink>
        </div>
        {products.length ? (
          <div className="product-grid">
            {products
              .filter((p) => p.featured)
              .concat(products.filter((p) => !p.featured))
              .slice(0, 4)
              .map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
          </div>
        ) : (
          <div className="arrival-composition">
            <div className="arrival-art" aria-hidden="true">
              <Orbit />
              <span>au.</span>
            </div>
            <div>
              <h3>
                Worth the <em>wait.</em>
              </h3>
              <p>Our collection is on its way.</p>
              <a href="#newsletter-email" className="text-link">
                Notify me
                <ArrowUpRight size={17} />
              </a>
            </div>
          </div>
        )}
      </section>
      <section className="commission-scene" id="your-chapter">
        <Picture
          name="brand/decor"
          alt="Brass vessels and decor displayed in a boutique interior"
          sizes="100vw"
        />
        <div className="commission-veil" />
        <div className="commission-content">
          <h2>
            Let’s make
            <br /> <em>an impression.</em>
          </h2>
          <div className="commission-bottom">
            <p>Craft, on your scale.</p>
            <Link to="/bulk-orders" className="commission-link" data-magnetic>
              <span>BEGIN A CONVERSATION</span>
              <ArrowUpRight size={35} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
