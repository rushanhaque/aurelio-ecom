import { useEffect, useState } from "react";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { Link } from "react-router";
import "../storytelling.css";

const chapters = [
  {
    roman: "I",
    prelude: "First,",
    title: "the fire.",
    image: "castingandforging",
    label: "THE TRANSFORMATION",
    copy: "Before there is an object, there is possibility. Heat softens the metal. An idea begins to take a shape of its own.",
    detail: "RAW MATERIAL → POSSIBILITY",
  },
  {
    roman: "II",
    prelude: "Then,",
    title: "the hands.",
    image: "handraising",
    label: "THE HUMAN ELEMENT",
    copy: "A thousand small decisions. The rhythm of a hammer. The instinct to know when to stop. This is where a surface becomes a signature.",
    detail: "HUMAN TOUCH → CHARACTER",
  },
  {
    roman: "III",
    prelude: "Finally,",
    title: "a feeling.",
    image: "LampHover",
    label: "THE EVERYDAY EXTRAORDINARY",
    copy: "And one day, it finds your home. A corner grows warmer. A familiar ritual feels different. The making ends. Your story begins.",
    detail: "CONSIDERED FORM → EVERYDAY LIFE",
  },
];
export function MakingStory() {
  return (
    <section
      className="making-story"
      id="material-story"
      aria-labelledby="making-title"
    >
      <h2 className="sr-only" id="making-title">
        From fire to feeling. An Aurelio story in three acts.
      </h2>
      <div className="making-stage">
        <div className="making-topline">
          <span>AN OBJECT IS ONLY THE BEGINNING.</span>
          <span>A STORY IN THREE ACTS</span>
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
          {chapters.map((chapter, i) => (
            <article className="making-panel" key={chapter.roman}>
              <span className="making-watermark" aria-hidden="true">
                {chapter.roman}
              </span>
              <div className="making-copy">
                <span className="making-label">
                  0{i + 1} / {chapter.label}
                </span>
                <h3>
                  <span className="making-line">
                    <span>{chapter.prelude}</span>
                  </span>
                  <span className="making-line">
                    <em>{chapter.title}</em>
                  </span>
                </h3>
                <p>{chapter.copy}</p>
                <span className="making-detail">{chapter.detail}</span>
              </div>
              <div className="making-image">
                <img
                  src={`/images/original/${chapter.image}-960.webp`}
                  srcSet={`/images/original/${chapter.image}-480.webp 480w, /images/original/${chapter.image}-960.webp 960w`}
                  sizes="(max-width: 900px) 90vw, 45vw"
                  width="960"
                  height="1280"
                  loading="lazy"
                  decoding="async"
                  alt={
                    i === 0
                      ? "Molten metal taking shape in the atelier"
                      : i === 1
                        ? "A craftsperson hammering a brass vessel by hand"
                        : "A finished lantern casting a warm glow"
                  }
                />
                <span className="making-image-corner" aria-hidden="true">
                  AURELIO / {chapter.roman}
                </span>
              </div>
            </article>
          ))}
        </div>
        <div className="making-bottom">
          <span>
            KEEP SCROLLING <ArrowDown size={12} />
          </span>
          <div className="making-track" aria-hidden="true">
            <i />
          </div>
          <a href="#selected-works">
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
