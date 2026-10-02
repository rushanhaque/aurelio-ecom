import { brand } from "../lib/brand";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { Link } from "react-router";
import dimensions from "../lib/original-image-sizes.json";
import "../original-sections.css";

// Editorial archive adapted from the owner's Aurelio Gallery.jsx.
// These are deliberately not catalog records, cart items or purchasable SKUs.
const works = [
  {
    off: "Lamp",
    on: "LampHover",
    name: "Lumière",
    type: "Lamp",
    meta: "Lighting · Brass & opal glass",
  },
  {
    off: "Candle1",
    on: "Candle1Hover",
    name: "Vesta",
    type: "Candleholder",
    meta: "Objets · Cast brass",
  },
  {
    off: "Lantern1",
    on: "Lantern1Hover",
    name: "Beacon",
    type: "Lantern",
    meta: "Lighting · Brass & glass",
  },
  {
    off: "FlowerPot1",
    on: "FlowerPot1Hover",
    name: "Flora",
    type: "Planter",
    meta: "Decor · Hammered copper",
  },
  {
    off: "Lamptwo",
    on: "LamptwoHover",
    name: "Solène",
    type: "Table Lamp",
    meta: "Lighting · Patinated brass",
  },
  {
    off: "Light1",
    on: "Light1Hover",
    name: "Lumen",
    type: "Wall Light",
    meta: "Lighting · Hand-spun brass",
  },
  {
    off: "Candle2",
    on: "Candle2Hover",
    name: "Ember",
    type: "Candle Stand",
    meta: "Objets · Blackened steel",
  },
  {
    off: "JewelryStand1",
    on: "JewelryStand2",
    name: "Aveline",
    type: "Jewelry Stand",
    meta: "Objets · Cast brass",
  },
  {
    off: "FlowerPot2",
    on: "FlowerPot2Hover",
    name: "Terra",
    type: "Cachepot",
    meta: "Decor · Spun brass",
  },
  {
    off: "Console",
    on: "ConsoleHover",
    name: "Séverin",
    type: "Console Table",
    meta: "Furniture · Forged steel & oak",
  },
  {
    off: "Tray1",
    on: "Tray2",
    name: "Auréa",
    type: "Serving Tray",
    meta: "Objets · Handcrafted brass",
  },
  {
    off: "WallClock1",
    on: "WallClock2",
    name: "Tempus",
    type: "Wall Clock",
    meta: "Decor · Brushed brass & charcoal dial",
  },
];
const stages = [
  {
    title: "Design & Drafting",
    image: "designanddrafting",
    body: "Every piece begins on paper.",
  },
  {
    title: "Casting & Forging",
    image: "castingandforging",
    body: "Molten metal is poured and forged.",
  },
  {
    title: "Hand-Raising",
    image: "handraising",
    body: "Smiths raise and hammer the metal by hand.",
  },
  {
    title: "Patina & Finishing",
    image: "patinaandfinishing",
    body: "Surfaces are brushed and patinated.",
  },
  {
    title: "Assembly & Inspection",
    image: "assemblyinspection",
    body: "Every joint and surface is checked.",
  },
];
function OriginalImage({
  name,
  alt = "",
  className = "",
  sizes = "(max-width: 640px) 90vw, (max-width: 900px) 45vw, 30vw",
}: {
  name: string;
  alt?: string;
  className?: string;
  sizes?: string;
}) {
  const size = dimensions[name as keyof typeof dimensions];
  return (
    <img
      className={className}
      src={`/images/original/${name}-960.webp`}
      srcSet={`/images/original/${name}-480.webp 480w, /images/original/${name}-960.webp 960w`}
      sizes={sizes}
      width={size.width}
      height={size.height}
      alt={alt}
      loading="lazy"
      decoding="async"
    />
  );
}
function ArchiveWork({
  work,
  index,
  autoLit,
}: {
  work: (typeof works)[number];
  index: number;
  autoLit: boolean;
}) {
  const lit = autoLit;
  return (
    <figure
      data-work={work.off}
      className={`archive-work ${lit ? "is-lit" : ""}`}
    >
      <div className="archive-frame">
        <OriginalImage name={work.on} className="archive-on" />
        <OriginalImage
          name={work.off}
          className="archive-off"
          alt={`${work.name} ${work.type} from the Aurelio atelier archive`}
        />
      </div>
      <figcaption>
        <span>
          <em>{work.name}</em> {work.type}
        </span>
        <small>{work.meta}</small>
      </figcaption>
    </figure>
  );
}
export function SelectedWorks({ limit = works.length }: { limit?: number }) {
  const root = useRef<HTMLElement>(null);
  const [litItems, setLitItems] = useState<Set<string>>(() => new Set());
  useEffect(() => {
    const mq = matchMedia(
      "(max-width: 640px) and (prefers-reduced-motion: no-preference)",
    );
    let observer: IntersectionObserver | undefined;
    const update = () => {
      observer?.disconnect();
      setLitItems(new Set());
      if (!mq.matches) return;
      observer = new IntersectionObserver(
        (entries) =>
          setLitItems((previous) => {
            const next = new Set(previous);
            entries.forEach((entry) => {
              const key = (entry.target as HTMLElement).dataset.work!;
              if (entry.isIntersecting) next.add(key);
              else next.delete(key);
            });
            return next;
          }),
        { rootMargin: "-15% 0px -25% 0px", threshold: 0.25 },
      );
      root.current
        ?.querySelectorAll(".archive-work")
        .forEach((el) => observer!.observe(el));
    };
    update();
    mq.addEventListener("change", update);
    return () => {
      observer?.disconnect();
      mq.removeEventListener("change", update);
    };
  }, []);
  return (
    <section
      ref={root}
      className="original-gallery"
      id="selected-works"
      aria-labelledby="archive-heading"
    >
      <div className="container">
        <header className="archive-heading">
          <h2 id="archive-heading">
            Pieces with
            <br />
            <em>a past tense.</em>
          </h2>
          <div>
            <p>Raised, forged or cast. Finished to be lived with.</p>
            <Link to="/shop" className="text-link">
              Explore the collection <ArrowUpRight size={17} />
            </Link>
          </div>
        </header>
        <div className="archive-grid">
          {works.slice(0, limit).map((work, index) => (
            <ArchiveWork
              key={work.off}
              work={work}
              index={index}
              autoLit={litItems.has(work.off)}
            />
          ))}
        </div>
        <div className="archive-foot">
          <p>
            Want one made to your size?{" "}
            <Link to="/bulk-orders">
              Begin a commission <ArrowUpRight size={14} />
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
export function AurelioStandard() {
  return (
    <section className="original-standard" aria-labelledby="standard-heading">
      <div className="container">
        <h2 id="standard-heading">
          Objects that refuse
          <br />
          to be disposable.
          <br />
          <em>Made slowly, to last.</em>
        </h2>
        <div className="standard-foot">
          <p>{brand.story}</p>
          <ul>
            {["Made by hand", "Made to last", "Made once"].map((item, i) => (
              <li key={item}>
                <span>0{i + 1}</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
export function OriginalAtelier() {
  const track = useRef<HTMLOListElement>(null);
  const [active, setActive] = useState(0);
  useEffect(() => {
    if (!track.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries)
          if (entry.isIntersecting)
            setActive(Number((entry.target as HTMLElement).dataset.stage));
      },
      { root: track.current, threshold: 0.65 },
    );
    Array.from(track.current.children).forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
  function go(index: number) {
    const list = track.current;
    const item = list?.children[index] as HTMLElement | undefined;
    if (!list || !item) return;
    list.scrollTo({
      left: item.offsetLeft - list.offsetLeft,
      behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    });
  }
  return (
    <section
      className="original-atelier"
      aria-labelledby="original-atelier-heading"
    >
      <div className="container">
        <div className="workshop-heading">
          <h2 id="original-atelier-heading">
            Where we <em>excel.</em>
          </h2>
          <div className="workshop-controls">
            <button
              onClick={() => go(active - 1)}
              disabled={active === 0}
              aria-label="Previous craft stage"
            >
              <ArrowLeft size={21} />
            </button>
            <span aria-live="polite">0{active + 1} / 05</span>
            <button
              onClick={() => go(active + 1)}
              disabled={active === 4}
              aria-label="Next craft stage"
            >
              <ArrowRight size={21} />
            </button>
          </div>
        </div>
      </div>
      <ol
        ref={track}
        className="workshop-track"
        tabIndex={0}
        aria-label="Our craft in five stages. Swipe or use arrow keys to explore."
        onKeyDown={(e) => {
          if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
            e.preventDefault();
            go(
              Math.max(
                0,
                Math.min(4, active + (e.key === "ArrowRight" ? 1 : -1)),
              ),
            );
          }
        }}
      >
        {stages.map((stage, i) => (
          <li className="workshop-panel" data-stage={i} key={stage.image}>
            <div className="workshop-copy">
              <span className="workshop-number" aria-hidden="true">
                0{i + 1}
              </span>
              <h3>{stage.title}</h3>
              <span className="workshop-rule" />
              <p>{stage.body}</p>
            </div>
            <div className="workshop-image">
              <OriginalImage
                name={stage.image}
                alt={stage.title + " in the Aurelio workshop"}
                sizes="(max-width: 640px) 85vw, 50vw"
              />
            </div>
          </li>
        ))}
      </ol>
      <div className="container workshop-bottom">
        <Link to="/about" className="text-link">
          Discover our craft <ArrowUpRight size={17} />
        </Link>
      </div>
    </section>
  );
}
