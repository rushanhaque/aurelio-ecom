import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Link } from "react-router";
import { ArrowUpRight } from "lucide-react";
import { materials } from "../lib/brand-content";
import { homeContent } from "../lib/home-content";
import { Picture } from "./ui";
import "../material-atelier.css";

/* One tone per material: it tints the whole room when that material is chosen. */
const tones = [
  "#ba9560", // brass
  "#b77351", // copper
  "#5c6862", // patinated steel
  "#806644", // bronze
  "#d5d4c8", // blown glass
  "#8f7255", // wood
  "#b2b8b2", // aluminium
  "#e7e2d5", // porcelain
  "#b99b7e", // ceramic
];
const LOUPE = 2.2; // magnification inside the loupe

/* The material atelier, as a single specimen under a loupe.
   - Hover the specimen: a lens follows the cursor and shows the material's real
     surface texture at LOUPE×, so "look closer" is literal rather than a button.
   - Choose a material: the new specimen opens as an iris from the swatch you
     chose, the name rolls in letter by letter, and the room takes its tone. */
export function MaterialAtelier({
  copy = homeContent,
}: {
  copy?: typeof homeContent;
}) {
  const [selected, setSelected] = useState(0);
  const [previous, setPrevious] = useState<number | null>(null);
  const [origin, setOrigin] = useState({ x: 50, y: 100 });
  const [surface, setSurface] = useState(false);
  const lens = useRef<HTMLDivElement>(null);
  const frame = useRef(0);
  // Hover switches materials. A short intent delay means sweeping the cursor
  // across the row settles on where it stops instead of firing every swatch.
  const hoverTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(hoverTimer.current), []);
  useEffect(() => () => cancelAnimationFrame(frame.current), []);
  // Clear the outgoing specimen after the iris. Not tied to animationend,
  // which never fires when reduced motion switches the animation off.
  useEffect(() => {
    if (previous === null) return;
    const timer = setTimeout(() => setPrevious(null), 750);
    return () => clearTimeout(timer);
  }, [previous, selected]);
  const material = materials[selected];
  const section = useRef<HTMLElement>(null);
  // Switching felt delayed because each photo only began downloading on
  // hover. Warm all nine (and their loupe textures) as the section nears the
  // viewport, using the same srcset so the browser reuses the exact file. The
  // first pointer entry is a fallback for when the observer cannot run.
  const warmed = useRef(false);
  const warm = () => {
    if (warmed.current) return;
    warmed.current = true;
    for (const m of materials) {
      const img = new Image();
      img.sizes = "(max-width: 900px) 90vw, 46vw";
      img.srcset = [480, 800, 1440]
        .map((w) => `/images/${m.image}-${w}.webp ${w}w`)
        .join(", ");
      img.src = `/images/${m.image}-800.webp`;
      new Image().src = `/images/${m.texture}-1440.webp`;
    }
  };
  useEffect(() => {
    const node = section.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        warm();
      },
      { rootMargin: "800px 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  function select(index: number, from?: HTMLElement) {
    if (index === selected) return;
    // The iris opens from the chosen swatch, measured against the specimen.
    const box = lens.current?.getBoundingClientRect();
    const chip = from?.getBoundingClientRect();
    if (box && chip)
      setOrigin({
        x: ((chip.left + chip.width / 2 - box.left) / box.width) * 100,
        y: ((chip.top + chip.height / 2 - box.top) / box.height) * 100,
      });
    else setOrigin({ x: 50, y: 50 });
    setPrevious(selected);
    setSelected(index);
    setSurface(false);
  }

  function track(event: React.PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== "mouse") return;
    const el = event.currentTarget;
    const box = el.getBoundingClientRect();
    const x = event.clientX - box.left,
      y = event.clientY - box.top;
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      el.style.setProperty("--lx", `${x}px`);
      el.style.setProperty("--ly", `${y}px`);
      el.style.setProperty("--lw", `${box.width}px`);
      el.style.setProperty("--lh", `${box.height}px`);
    });
  }

  return (
    <section
      ref={section}
      className="mx-atelier"
      onPointerEnter={warm}
      id="material-atelier"
      aria-labelledby="material-atelier-title"
      style={{ "--tone": tones[selected] } as CSSProperties}
    >
      <span className="mx-ghost" aria-hidden="true" key={`ghost-${selected}`}>
        {material.index}
      </span>
      <div className="container">
        <header className="mx-heading" data-reveal>
          <p className="eyebrow">{copy.eyebrow}</p>
          <h2 id="material-atelier-title">{copy.title}</h2>
          <p>{copy.intro}</p>
        </header>

        <div className="mx-stage">
          <div
            ref={lens}
            className={`mx-specimen ${surface ? "is-surface" : ""}`}
            onPointerMove={track}
            style={
              {
                "--ox": `${origin.x}%`,
                "--oy": `${origin.y}%`,
                "--zoom": LOUPE,
              } as CSSProperties
            }
          >
            {previous !== null && (
              <div className="mx-layer is-leaving" aria-hidden="true">
                <Picture
                  name={materials[previous].image}
                  alt=""
                  sizes="(max-width: 900px) 90vw, 46vw"
                  eager
                />
              </div>
            )}
            <div className="mx-layer is-current" key={material.slug}>
              <Picture
                name={surface ? material.texture : material.image}
                alt={`${material.name}, ${surface ? "surface detail" : "material study"}`}
                sizes="(max-width: 900px) 90vw, 46vw"
                eager
              />
            </div>
            <div
              className="mx-loupe"
              aria-hidden="true"
              style={{
                backgroundImage: `url(/images/${material.texture}-1440.webp)`,
              }}
            >
              <span>×{LOUPE}</span>
            </div>
            <span className="mx-register" aria-hidden="true">
              MATERIAL {material.index} / 09
            </span>
            <span className="mx-hint" aria-hidden="true">
              Move across the surface
            </span>
            {/* Touch has no hover, so the loupe gives way to a plain toggle. */}
            <button
              className="mx-touch-toggle"
              aria-pressed={surface}
              onClick={() => setSurface((v) => !v)}
            >
              {surface ? "Show the form" : "Show the surface"}
            </button>
          </div>

          <div className="mx-copy">
            <span className="mx-trait" key={`trait-${selected}`}>
              {material.trait}
            </span>
            <h3 className="mx-name" aria-label={material.name}>
              {[...material.name].map((letter, i) => (
                <span
                  aria-hidden="true"
                  key={`${material.slug}-${i}`}
                  style={{ "--i": i } as CSSProperties}
                >
                  {letter === " " ? " " : letter}
                </span>
              ))}
            </h3>
            <div
              className="mx-description"
              key={`copy-${selected}`}
              role="tabpanel"
              id="mx-panel"
              aria-labelledby={`mx-tab-${selected}`}
            >
              <p>{material.blurb}</p>
              <p className="mx-note">{material.note}</p>
              <Link
                className="text-link light"
                to={`/materials#${material.slug}`}
              >
                Discover {material.name.toLowerCase()}
                <ArrowUpRight size={16} />
              </Link>
            </div>

            <div
              className="mx-swatches"
              role="tablist"
              aria-label="Choose a material"
            >
              {materials.map((item, index) => (
                <button
                  key={item.slug}
                  id={`mx-tab-${index}`}
                  role="tab"
                  aria-selected={selected === index}
                  aria-controls="mx-panel"
                  tabIndex={selected === index ? 0 : -1}
                  style={{ "--swatch": tones[index] } as CSSProperties}
                  onClick={(e) => select(index, e.currentTarget)}
                  onPointerEnter={(e) => {
                    if (e.pointerType !== "mouse") return;
                    const chip = e.currentTarget;
                    clearTimeout(hoverTimer.current);
                    hoverTimer.current = setTimeout(
                      () => select(index, chip),
                      40,
                    );
                  }}
                  onPointerLeave={() => clearTimeout(hoverTimer.current)}
                  onKeyDown={(e) => {
                    const step =
                      e.key === "ArrowRight" || e.key === "ArrowDown"
                        ? 1
                        : e.key === "ArrowLeft" || e.key === "ArrowUp"
                          ? -1
                          : 0;
                    const next =
                      e.key === "Home"
                        ? 0
                        : e.key === "End"
                          ? materials.length - 1
                          : step
                            ? (selected + step + materials.length) %
                              materials.length
                            : null;
                    if (next === null) return;
                    e.preventDefault();
                    const target = document.getElementById(`mx-tab-${next}`);
                    select(next, target || undefined);
                    target?.focus();
                  }}
                >
                  <img
                    src={`/images/${item.image}-480.webp`}
                    alt=""
                    width={48}
                    height={48}
                    loading="lazy"
                    decoding="async"
                  />
                  <span>{item.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mx-foot">
          {copy.sections.map(([heading, body], index) => (
            <div key={index} data-reveal>
              <span className="eyebrow">0{index + 1}</span>
              <h3>{heading}</h3>
              <p>{body}</p>
            </div>
          ))}
          <Link
            to="/bulk-orders"
            className="mx-seal"
            data-magnetic
            aria-label="Start your material commission"
          >
            <span>
              YOUR IDEA.
              <br />
              OUR ATELIER.
            </span>
            <b aria-hidden="true">↗</b>
          </Link>
        </div>
      </div>
    </section>
  );
}
