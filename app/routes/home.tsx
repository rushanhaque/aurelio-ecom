import { useEffect, useRef, useState } from "react";
import { Link, useLoaderData } from "react-router";
import { MaterialAtelier } from "../components/material-atelier";
import { AtelierExperiments } from "../components/atelier-experiments";
import { homeContent } from "../lib/home-content";
import { database } from "../../server/db";
import { frontendPreview } from "../../server/preview-mode";
import { ArrowUpRight, ArrowDown } from "lucide-react";
import { Picture, ProductCard, TextLink } from "../components/ui";
import { useStore } from "../lib/store";
import "../immersive.css";
import {
  SelectedWorks,
  AurelioStandard,
  OriginalAtelier,
} from "../components/original-sections";
import { MakingStory, ReadingStatement } from "../components/storytelling";
const scenes = [
  { name: "Form", image: "hero", caption: "An exploration in brass" },
  { name: "Touch", image: "craft", caption: "The poetry of the process" },
  {
    name: "Presence",
    image: "sculpture",
    caption: "A study in sculptural balance",
  },
];
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
export async function loader() {
  if (frontendPreview()) return { homeCopy: homeContent };
  const { db } = await database();
  const saved = await db.collection("content").findOne({ slug: "home" });
  return { homeCopy: (saved?.published || homeContent) as typeof homeContent };
}
export default function Home() {
  const { homeCopy } = useLoaderData<typeof loader>();
  const { products } = useStore();
  const [scene, setScene] = useState(0);

  const hero = useRef<HTMLElement>(null);
  const frame = useRef(0);
  useEffect(() => () => cancelAnimationFrame(frame.current), []);
  function illuminate(e: React.PointerEvent<HTMLElement>) {
    if (
      e.pointerType === "touch" ||
      matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    const box = e.currentTarget.getBoundingClientRect(),
      x = e.clientX - box.left,
      y = e.clientY - box.top;
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      hero.current?.style.setProperty("--light-x", `${x}px`);
      hero.current?.style.setProperty("--light-y", `${y}px`);
      hero.current?.style.setProperty(
        "--drift-x",
        `${(x / box.width - 0.5) * 16}px`,
      );
      hero.current?.style.setProperty(
        "--drift-y",
        `${(y / box.height - 0.5) * 12}px`,
      );
    });
  }
  return (
    <div className="immersive-home">
      <section
        className="atelier-hero"
        ref={hero}
        onPointerMove={illuminate}
        onPointerLeave={() => {
          hero.current?.style.setProperty("--drift-x", "0px");
          hero.current?.style.setProperty("--drift-y", "0px");
        }}
        aria-label="The world of Aurelio"
      >
        <div className="hero-scenes">
          {scenes.map((s, i) => (
            <div
              key={s.name}
              className={`hero-scene ${scene === i ? "is-active" : ""}`}
              aria-hidden={scene !== i}
            >
              <Picture
                name={s.image}
                alt={
                  i === 0
                    ? "Brass forms in a sunlit architectural space"
                    : i === 1
                      ? "An illustrative study of hands working metal"
                      : "A sculptural brass form"
                }
                eager={i === 0}
                sizes="100vw"
              />
            </div>
          ))}
        </div>
        <div className="hero-shade" />
        <div className="hero-light" aria-hidden="true" />
        <div className="hero-grain" aria-hidden="true" />
        <div className="hero-topline">
          <span>IN PURSUIT OF THE EXTRAORDINARY</span>
          <span>METAL & WOOD. MADE BY HAND.</span>
        </div>
        <div className="hero-editorial">
          <p className="eyebrow">
            <span className="live-point" /> AURELIO BY AF INTERNATIONAL
          </p>
          <h1>
            <span>
              <span className="hero-line-inner">Beyond</span>
            </span>
            <span>
              <span className="hero-line-inner">
                the <em>ordinary.</em>
              </span>
            </span>
          </h1>
          <div className="hero-storyline">
            <span className="hairline" />
            <p>
              Metal, wrought
              <br /> into permanence.
            </p>
          </div>
        </div>
        <Link
          className="orbit-link"
          to="/shop"
          data-magnetic
          data-cursor="ENTER"
        >
          <svg viewBox="0 0 120 120" aria-hidden="true">
            <defs>
              <path
                id="hero-orbit"
                d="M60,60 m-46,0 a46,46 0 1,1 92,0 a46,46 0 1,1 -92,0"
              />
            </defs>
            <text>
              <textPath href="#hero-orbit">
                EXPLORE AURELIO · EXPLORE AURELIO ·{" "}
              </textPath>
            </text>
          </svg>
          <ArrowUpRight size={32} />
          <span className="sr-only">Explore the collection</span>
        </Link>
        <div className="hero-bottomline">
          <a href="#material-story" className="scroll-invitation">
            <span className="scroll-track">
              <i />
            </span>
            SCROLL TO FEEL THE DIFFERENCE
            <ArrowDown size={14} />
          </a>
          <div className="scene-selector" aria-label="Explore editorial scenes">
            {scenes.map((s, i) => (
              <button
                aria-pressed={scene === i}
                key={s.name}
                onClick={() => setScene(i)}
                className={scene === i ? "active" : ""}
              >
                <span>0{i + 1}</span>
                {s.name}
                <i />
              </button>
            ))}
          </div>
          <span className="scene-caption" aria-live="polite">
            {scenes[scene].caption}
          </span>
        </div>
      </section>
      <section className="opening-note container" id="prologue">
        <span className="chapter-tag">01 / THE FEELING</span>
        <ReadingStatement />
        <div className="opening-foot">
          <Orbit />
          <p>
            From our family workshop in Moradabad to your home.
            <br /> Metal and wooden pieces, made by hand since 2008.
          </p>
          <span className="little-coordinate">
            FORM / FEELING
            <br /> MORADABAD — EST. 2008
          </span>
        </div>
      </section>
      <MakingStory />
      <OriginalAtelier />
      <SelectedWorks />
      <MaterialAtelier copy={homeCopy} />
      <AtelierExperiments />
      <AurelioStandard />
      <section className="collection-premiere container" id="selected">
        <div className="premiere-head">
          <span className="chapter-tag">05 / THE COLLECTION</span>
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
              <span className="eyebrow">CURRENTLY TAKING SHAPE</span>
              <h3>
                Worth the <em>anticipation.</em>
              </h3>
              <p>
                Our online collection is being thoughtfully prepared.
                <br /> Leave a little room for what comes next.
              </p>
              <a href="#newsletter-email" className="text-link">
                Let me know when it arrives
                <ArrowUpRight size={17} />
              </a>
            </div>
            <span className="arrival-edition">
              THE NEXT CHAPTER
              <br /> IS YOURS TO DISCOVER.
            </span>
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
          <span className="chapter-tag">FOR SPACES WITH A STORY</span>
          <h2>
            Let’s make
            <br /> <em>an impression.</em>
          </h2>
          <div className="commission-bottom">
            <p>
              A room. A gesture. A grand idea.
              <br /> Considered craft, on your scale.
            </p>
            <Link to="/bulk-orders" className="commission-link" data-magnetic>
              <span>BEGIN A CONVERSATION</span>
              <ArrowUpRight size={35} />
            </Link>
          </div>
        </div>
        <span className="commission-side">
          HOSPITALITY / GIFTING / RETAIL / BESPOKE
        </span>
      </section>
      <div className="atelier-signoff container">
        <span>AURELIO</span>
        <p>
          Less ordinary.
          <br /> <em>More meaningful.</em>
        </p>
        <ArrowDown size={28} />
      </div>
    </div>
  );
}
