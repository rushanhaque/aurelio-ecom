import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { ArrowUpRight, MessageCircle } from "lucide-react";
import { brand } from "../lib/brand";
import "../home-hero.css";

const film = __HERO_FILM__;
const ContactPopup = lazy(() => import("../components/home-contact"));
const warmContact = () => import("../components/home-contact").catch(() => {});

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
   painted its poster and the main thread is idle, then fades in over the still. */
function VideoHero() {
  const video = useRef<HTMLVideoElement>(null);
  const poster = useRef<HTMLImageElement>(null);
  const contactTrigger = useRef<HTMLButtonElement>(null);
  const [contactOpen, setContactOpen] = useState(false);
  const [contactMounted, setContactMounted] = useState(false);
  const [ready, setReady] = useState(false);
  const [rolling, setRolling] = useState(false);
  useEffect(() => {
    if (!canPlayFilm()) return;
    const still = poster.current;
    let cancelled = false;
    let scheduled = false;
    let idleId: number | undefined;
    let timerId: number | undefined;
    const begin = () => {
      if (!cancelled) setRolling(true);
    };
    const schedule = () => {
      if (scheduled || cancelled) return;
      scheduled = true;
      if (typeof window.requestIdleCallback === "function")
        idleId = requestIdleCallback(begin, { timeout: 1000 });
      else timerId = window.setTimeout(begin, 150);
    };
    // Start after the small poster, without waiting for unrelated page assets.
    if (!still || still.complete) schedule();
    else {
      still.addEventListener("load", schedule, { once: true });
      still.addEventListener("error", schedule, { once: true });
    }
    return () => {
      cancelled = true;
      still?.removeEventListener("load", schedule);
      still?.removeEventListener("error", schedule);
      if (idleId !== undefined) cancelIdleCallback(idleId);
      if (timerId !== undefined) clearTimeout(timerId);
    };
  }, []);
  useEffect(() => {
    const reel = video.current;
    if (!rolling || !reel) return;
    let inView = false;
    const syncPlayback = () => {
      if (!inView || document.hidden) reel.pause();
      else reel.play().catch(() => {});
    };
    const watch = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      syncPlayback();
    });
    watch.observe(reel);
    document.addEventListener("visibilitychange", syncPlayback);
    return () => {
      watch.disconnect();
      document.removeEventListener("visibilitychange", syncPlayback);
      reel.pause();
    };
  }, [rolling]);
  return (
    <section
      className={`atelier-hero film-hero ${ready ? "is-ready" : ""}`}
      aria-label="Aurelio"
    >
      <picture className="film-poster">
        <source
          media="(max-aspect-ratio: 4/5)"
          srcSet="/images/hero-film-portrait-304.webp 304w, /images/hero-film-portrait-608.webp 608w"
          sizes="100vw"
          width={608}
          height={1080}
        />
        <img
          ref={poster}
          src="/images/hero-film-1440.webp"
          srcSet="/images/hero-film-800.webp 800w, /images/hero-film-1440.webp 1440w, /images/hero-film-1920.webp 1920w"
          sizes="100vw"
          width={1920}
          height={1080}
          alt=""
          loading="eager"
          fetchPriority="high"
          decoding="async"
        />
      </picture>
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
          onError={() => setReady(false)}
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
      <button
        ref={contactTrigger}
        type="button"
        className="landing-contact"
        aria-label="Contact us"
        aria-haspopup="dialog"
        aria-expanded={contactOpen}
        aria-controls={contactMounted ? "home-contact-dialog" : undefined}
        onPointerEnter={warmContact}
        onFocus={warmContact}
        onClick={() => {
          setContactMounted(true);
          setContactOpen(true);
        }}
      >
        <MessageCircle size={21} strokeWidth={1.5} aria-hidden="true" />
        <span className="contact-caption" aria-hidden="true">
          Contact us
        </span>
      </button>
      {contactMounted && (
        <Suspense
          fallback={
            <span className="sr-only" role="status">
              Opening contact form…
            </span>
          }
        >
          <ContactPopup
            open={contactOpen}
            onOpenChange={setContactOpen}
            triggerRef={contactTrigger}
          />
        </Suspense>
      )}
      <nav
        className="film-actions"
        aria-label="Choose how to work with Aurelio"
      >
        <a href={brand.shopUrl} className="film-button film-button-shop">
          <span className="film-button-copy">
            <span className="film-button-label">Visit the shop</span>
            <span className="film-button-status">Coming soon</span>
          </span>
          <ArrowUpRight size={14} strokeWidth={1.5} aria-hidden="true" />
        </a>
        <a href={brand.exportsUrl} className="film-button">
          <span className="film-button-label">Explore bulk export</span>
          <ArrowUpRight size={14} strokeWidth={1.5} aria-hidden="true" />
        </a>
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
