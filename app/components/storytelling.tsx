import { useEffect, useState, type CSSProperties } from "react";
import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router";
import { collections } from "../lib/brand-content";
import "../storytelling.css";

const numerals = ["I", "II", "III", "IV", "V", "VI", "VII"];
const alts: Record<string, string> = {
  urns: "Hand-raised urns arranged in a lit alcove",
  lighting: "Brass and glass light fixtures glowing in a room",
  furniture: "Forged-frame furniture in a considered interior",
  kitchenware: "Cast and hammered kitchenware on a table",
  decor: "Sculptural decor objects in a quiet interior",
  accessories: "Hardware and desk accessories in fine metal",
  bespoke: "A bespoke commission in an architectural interior",
};
export function MakingStory() {
  return (
    <section
      className="making-story"
      id="material-story"
      aria-labelledby="making-title"
      style={{ "--acts": collections.length } as CSSProperties}
    >
      <h2 className="sr-only" id="making-title">
        Seven collections, one atelier.
      </h2>
      <div className="making-stage">
        <div className="making-topline">
          <span>THE COLLECTIONS</span>
        </div>
        <svg
          className="making-thread"
          viewBox="0 0 1000 800"
          fill="none"
          aria-hidden="true"
        >
          <path d="M -30 690 C 330 800 130 70 490 85 C 930 90 910 740 565 735 C 285 730 380 215 770 130 C 950 90 1010 210 1060 360" />
        </svg>
        <div className="making-panels">
          {collections.map((c, i) => (
            <article className="making-panel" key={c.slug}>
              <div className="making-copy">
                <h3>
                  <span className="making-line">
                    <span>{c.name}</span>
                  </span>
                  <span className="making-line">
                    <em>{c.tagline}</em>
                  </span>
                </h3>
                <p>{c.description}</p>
                <Link
                  className="text-link light making-link"
                  to={`/collections/${c.slug}`}
                  data-cursor="EXPLORE"
                >
                  {c.slug === "bespoke"
                    ? "Begin a commission"
                    : `Explore ${c.name.toLowerCase()}`}
                  <ArrowUpRight size={17} />
                </Link>
              </div>
              <Link
                className="making-image"
                to={`/collections/${c.slug}`}
                tabIndex={-1}
                aria-hidden="true"
              >
                <img
                  src={`/images/${c.cover}-800.webp`}
                  srcSet={`/images/${c.cover}-480.webp 480w, /images/${c.cover}-800.webp 800w, /images/${c.cover}-1440.webp 1440w`}
                  sizes="(max-width: 900px) 90vw, 45vw"
                  width="1024"
                  height="1024"
                  loading="lazy"
                  decoding="async"
                  alt={alts[c.slug] || `The Aurelio ${c.name} collection`}
                />
              </Link>
            </article>
          ))}
        </div>
        <div className="making-bottom">
          <div className="making-track" aria-hidden="true">
            <i />
          </div>
          <a href="/bulk-orders#selected-works">
            MEET THE OBJECTS <ArrowUpRight size={14} />
          </a>
        </div>
      </div>
    </section>
  );
}
const journey = [
  { id: "prologue", label: "The idea" },
  { id: "material-story", label: "The making" },
  { id: "selected-works", label: "The objects" },
  { id: "your-chapter", label: "Your chapter" },
];
export function JourneyNavigation() {
  const [active, setActive] = useState("");
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries)
          if (entry.isIntersecting) setActive(entry.target.id);
      },
      { rootMargin: "-15% 0px -65% 0px", threshold: 0 },
    );
    journey.forEach((item) => {
      const node = document.getElementById(item.id);
      if (node) observer.observe(node);
    });
    return () => observer.disconnect();
  }, []);
  return (
    <nav
      className={`journey-dock ${active ? "is-visible" : ""}`}
      aria-label="Explore the Aurelio story"
    >
      <span className="journey-mark" aria-hidden="true">
        a.
      </span>
      {journey.map((item, i) => (
        <a
          key={item.id}
          href={`#${item.id}`}
          aria-current={active === item.id ? "location" : undefined}
        >
          <span>0{i + 1}</span>
          <b>{item.label}</b>
          <i />
        </a>
      ))}
      <Link
        to="/shop"
        className="journey-shop"
        aria-label="Shop the collection"
      >
        <ArrowUpRight size={18} />
      </Link>
    </nav>
  );
}
export function ReadingStatement() {
  return (
    <p className="statement story-reading">
      <span className="sr-only">
        Some things fill a space. Others change how it feels.
      </span>
      <span aria-hidden="true">
        {"Some things fill a space.".split(" ").map((word, i) => (
          <span className="reading-word" key={i}>
            {word}{" "}
          </span>
        ))}
      </span>
      <br />
      <em aria-hidden="true">
        {"Others change how it feels.".split(" ").map((word, i) => (
          <span className="reading-word" key={i}>
            {word}{" "}
          </span>
        ))}
      </em>
    </p>
  );
}
