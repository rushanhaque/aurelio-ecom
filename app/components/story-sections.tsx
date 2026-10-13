import { useEffect, useRef, type CSSProperties, type PointerEvent } from "react";
import { Link } from "react-router";
import { ArrowUpRight } from "lucide-react";
import { commissionStages } from "../lib/brand";
import { collections } from "../lib/brand-content";
import { Picture } from "./ui";
import { Words } from "./motion-text";

/* Sections carried over from the original Aurelio site (Marquee, Timeline and
   Categories), rebuilt for this storefront: the loops are CSS, they only run
   while they can be seen, and every one of them reads as a plain list when
   motion is reduced or scripts never arrive. Styles: atelier-story.css. */

/* Run a looping animation only while its element is on screen. */
function useOnScreen<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const watch = new IntersectionObserver(([entry]) => {
      node.toggleAttribute("data-running", entry.isIntersecting);
      // Once seen, stays seen: deferred images load then and are kept.
      if (entry.isIntersecting) node.setAttribute("data-seen", "");
    });
    watch.observe(node);
    return () => watch.disconnect();
  }, []);
  return ref;
}

/* ---------- Marquee · the vocabulary of the workshop ---------- */
const vocabulary = [
  "Brass",
  "Copper",
  "Patinated steel",
  "Bronze",
  "Seasoned timber",
  "Blown glass",
  "Hand-forged",
  "Since 2008",
  "Moradabad atelier",
  "Worldwide export",
  "Bespoke commissions",
  "Made by hand",
];

export function MaterialMarquee({ tone = "light" }: { tone?: "light" | "dark" }) {
  const ref = useOnScreen<HTMLDivElement>();
  return (
    <div ref={ref} className={`story-marquee story-marquee--${tone}`} aria-hidden="true">
      <div className="story-marquee-track">
        {[0, 1].map((copy) => (
          <ul key={copy}>
            {vocabulary.map((word) => (
              <li key={word}>
                <span className="story-diamond">◆</span>
                {word}
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}

/* ---------- The path a piece travels · a flowing stage list ----------
   Hovering a station lifts an emerald band in from whichever edge the pointer
   crossed, carrying the station's name and its photograph on a slow loop. On
   touch screens every station runs its band continuously instead. */
const notes = [
  "Quantities, finishes and timing.",
  "We draw and cost your range.",
  "A sample, approved before production.",
  "Raised, cast and forged by hand.",
  "Polished, lacquered and checked.",
  "Packed for freight and shipped.",
];

function Station({ name, index }: { name: string; index: number }) {
  const image = `/images/stages/${name.toLowerCase()}.webp`;
  const enter = (event: PointerEvent<HTMLLIElement>) => {
    const box = event.currentTarget.getBoundingClientRect();
    event.currentTarget.dataset.edge =
      event.clientY - box.top < box.height / 2 ? "top" : "bottom";
  };
  return (
    <li
      className="path-station"
      onPointerEnter={enter}
      onPointerLeave={enter}
      data-cursor={name.toUpperCase()}
    >
      <span className="path-index">0{index + 1}</span>
      <span className="path-name">{name}</span>
      <span className="path-note">{notes[index]}</span>
      <span className="path-band" aria-hidden="true">
        <span className="path-band-track">
          {Array.from({ length: 8 }, (_, i) => (
            <span className="path-band-part" key={i}>
              <span>{name}</span>
              <span
                className="path-band-image"
                style={{ "--band-image": `url(${image})` } as CSSProperties}
              />
            </span>
          ))}
        </span>
      </span>
    </li>
  );
}

export function PathOfAPiece() {
  const ref = useOnScreen<HTMLOListElement>();
  return (
    <section className="path-story" aria-labelledby="path-title">
      <div className="container path-head">
        <p className="story-kicker" data-reveal>
          <span>Commission</span>
          <span className="story-kicker-rule" />
          <span>Six stations</span>
        </p>
        <h2 id="path-title" data-reveal="words">
          <Words>
            The path a piece <em>travels.</em>
          </Words>
        </h2>
        <p className="path-lead" data-reveal>
          Every commission passes through the same six stations. No shortcuts,
          no exceptions.
        </p>
      </div>
      <ol ref={ref} className="path-list" data-reveal="group">
        {commissionStages.map((stage, i) => (
          <Station key={stage} name={stage} index={i} />
        ))}
      </ol>
    </section>
  );
}

/* ---------- Seven worlds · the collections as cinematic panels ----------
   One panel is always open; hovering or focusing another glides it wide while
   the rest narrow to slender columns with their names standing upright. Pure
   CSS (flex-grow), so it costs nothing until it is touched. On phones the
   panels stack as full cards. */
export function CollectionWorlds() {
  return (
    <section className="worlds" aria-labelledby="worlds-title">
      <div className="container worlds-head">
        <p className="story-kicker" data-reveal>
          <span>Collections</span>
          <span className="story-kicker-rule" />
          <span>07 worlds</span>
        </p>
        <h2 id="worlds-title" data-reveal="words">
          <Words>
            Seven worlds, <em>shaped in metal.</em>
          </Words>
        </h2>
        <p className="worlds-lead" data-reveal>
          From a single pendant to an entire interior: seven disciplines, each
          drawn, forged and finished beneath one roof.
        </p>
      </div>
      <div className="worlds-panels" data-reveal="group">
        {collections.map((c) => (
          <Link
            key={c.slug}
            className="worlds-panel"
            to={c.slug === "bespoke" ? "/bulk-orders#enquire" : `/collections/${c.slug}`}
            data-cursor="OPEN"
          >
            <Picture
              name={c.cover}
              alt=""
              sizes="(max-width: 900px) 100vw, 60vw"
            />
            <span className="worlds-scrim" aria-hidden="true" />
            <span className="worlds-index" aria-hidden="true">
              {c.index}
            </span>
            <span className="worlds-vertical" aria-hidden="true">
              {c.name}
            </span>
            <span className="worlds-content">
              <strong>{c.name}</strong>
              <em>{c.tagline}</em>
              <span className="worlds-summary">{c.summary}</span>
              <span className="worlds-cta">
                {c.slug === "bespoke" ? "Begin a commission" : "Enter the collection"}
                <ArrowUpRight size={16} />
              </span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
