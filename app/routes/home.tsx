import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { ArrowUpRight } from "lucide-react";
import { Picture } from "../components/ui";
import { shopLink, shopIsExternal } from "../lib/brand";
import "../immersive.css";
import "../home-hero.css";

const film = __HERO_FILM__;

/* Whether this visit can afford the film: not for people who asked for less
   motion or less data, nor on connections where it would fight the page. */
function canPlayFilm() {
  if (!film.length) return false;
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  const connection = (
    navigator as Navigator & {
      connection?: { saveData?: boolean; effectiveType?: string };
    }
  ).connection;
  if (connection?.saveData) return false;
  return !/(^|-)2g$/.test(connection?.effectiveType || "");
}

/* The landing hero is only the film and two ways in. A responsive still paints
   first and stays as the hero on its own; the film is fetched once the page has
   finished loading and the main thread is idle, then fades in over the still. */
function VideoHero() {
  const video = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);
  const [rolling, setRolling] = useState(false);
  useEffect(() => {
    if (!canPlayFilm()) return;
    let cancelled = false;
    const begin = () => {
      if (!cancelled) setRolling(true);
    };
    const idle = () =>
      "requestIdleCallback" in window
        ? requestIdleCallback(begin, { timeout: 2500 })
        : setTimeout(begin, 1200);
    if (document.readyState === "complete") idle();
    else addEventListener("load", idle, { once: true });
    return () => {
      cancelled = true;
      removeEventListener("load", idle);
    };
  }, []);
  useEffect(() => {
    const reel = video.current;
    if (!rolling || !reel) return;
    reel.load();
    // Rest the film while it is off screen.
    const watch = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) reel.pause();
      else reel.play().catch(() => {});
    });
    watch.observe(reel);
    return () => watch.disconnect();
  }, [rolling]);
  return (
    <section
      className={`atelier-hero film-hero ${ready ? "is-ready" : ""}`}
      aria-label="Aurelio"
    >
      <Picture name="hero" alt="" className="film-poster" sizes="100vw" eager />
      {rolling && (
        <video
          ref={video}
          className="film-video"
          muted
          loop
          playsInline
          preload="auto"
          aria-hidden="true"
          onPlaying={() => setReady(true)}
        >
          {film.map((source) => (
            <source key={source.src} {...source} />
          ))}
        </video>
      )}
      <div className="film-veil" aria-hidden="true" />
      <div className="hero-grain" aria-hidden="true" />
      <h1 className="landing-name">
        AURELIO
        <span className="landing-byline">by AF International</span>
      </h1>
      <Link className="landing-contact" to="/contact">
        Contact us <ArrowUpRight size={14} />
      </Link>
      <nav
        className="film-actions"
        aria-label="Choose how to work with Aurelio"
      >
        {/* The shop runs on Shopify. */}
        <a
          href={shopLink}
          className="film-button film-button-solid"
          {...(shopIsExternal && { target: "_blank", rel: "noopener" })}
        >
          <span className="film-button-label">Visit the shop</span>
          <ArrowUpRight size={17} />
        </a>
        <Link to="/bulk-orders" className="film-button film-button-glass">
          <span className="film-button-label">Explore bulk export</span>
          <ArrowUpRight size={17} />
        </Link>
      </nav>
    </section>
  );
}
export default function Home() {
  return (
    <div className="immersive-home">
      <VideoHero />
    </div>
  );
}
