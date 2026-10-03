import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { heroMedia } from "../lib/home-content";
import { ArrowUpRight } from "lucide-react";
import "../immersive.css";
import "../home-hero.css";

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
export default function Home() {
  return (
    <div className="immersive-home">
      <VideoHero />
    </div>
  );
}
