import { useState, useRef, useEffect, type CSSProperties } from "react";
import { Link } from "react-router";
import { materials } from "../lib/brand-content";
import { homeContent } from "../lib/home-content";
import { Picture } from "./ui";
export function MaterialAtelier({
  copy = homeContent,
}: {
  copy?: typeof homeContent;
}) {
  const [selected, setSelected] = useState(0),
    [surface, setSurface] = useState(false);
  const frame = useRef<HTMLDivElement>(null),
    raf = useRef(0);
  useEffect(() => () => cancelAnimationFrame(raf.current), []);
  const material = materials[selected];
  function select(index: number) {
    setSelected(index);
    setSurface(false);
  }
  return (
    <section
      className="material-atelier container"
      aria-labelledby="material-atelier-title"
      id="material-atelier"
    >
      <div className="atelier-heading" data-reveal>
        <p className="eyebrow">{copy.eyebrow}</p>
        <h2 id="material-atelier-title">{copy.title}</h2>
        <p>{copy.intro}</p>
      </div>
      <div className="material-workbench">
        <div
          className="material-specimen"
          ref={frame}
          onPointerMove={(e) => {
            if (
              e.pointerType !== "mouse" ||
              matchMedia("(prefers-reduced-motion: reduce)").matches
            )
              return;
            const box = e.currentTarget.getBoundingClientRect();
            const x = (e.clientX - box.left) / box.width,
              y = (e.clientY - box.top) / box.height;
            cancelAnimationFrame(raf.current);
            raf.current = requestAnimationFrame(() => {
              frame.current?.style.setProperty("--specimen-x", `${x * 100}%`);
              frame.current?.style.setProperty("--specimen-y", `${y * 100}%`);
            });
          }}
        >
          <div className="specimen-image" key={`${material.slug}-${surface}`}>
            <Picture
              name={surface ? material.texture : material.image}
              alt={`${material.name}, ${surface ? "surface detail" : "material study"}`}
              sizes="(max-width: 760px) 90vw, 48vw"
            />
          </div>
          <div className="specimen-cross specimen-cross-top" aria-hidden="true">
            +
          </div>
          <div
            className="specimen-cross specimen-cross-bottom"
            aria-hidden="true"
          >
            +
          </div>
          <span className="specimen-register">
            AURELIO / MATERIAL {material.index}
          </span>
          <span className="specimen-ring" aria-hidden="true" />
          <button
            className="specimen-toggle"
            aria-pressed={surface}
            onClick={() => setSurface((value) => !value)}
          >
            {surface ? "Return to form" : "Examine the surface"}
            <span aria-hidden="true">↗</span>
          </button>
        </div>
        <div className="material-desk">
          <div
            className="material-selectors"
            role="tablist"
            aria-label="Explore Aurelio materials"
          >
            {materials.map((item, index) => (
              <button
                key={item.slug}
                id={`specimen-tab-${index}`}
                role="tab"
                aria-selected={selected === index}
                aria-controls="specimen-description"
                tabIndex={selected === index ? 0 : -1}
                onClick={() => select(index)}
                onKeyDown={(e) => {
                  const keys = [
                    "ArrowRight",
                    "ArrowLeft",
                    "ArrowDown",
                    "ArrowUp",
                    "Home",
                    "End",
                  ];
                  if (!keys.includes(e.key)) return;
                  e.preventDefault();
                  const next =
                    e.key === "Home"
                      ? 0
                      : e.key === "End"
                        ? materials.length - 1
                        : (selected +
                            (["ArrowRight", "ArrowDown"].includes(e.key)
                              ? 1
                              : -1) +
                            materials.length) %
                          materials.length;
                  select(next);
                  document.getElementById(`specimen-tab-${next}`)?.focus();
                }}
                style={
                  {
                    "--swatch": [
                      "#ba9560",
                      "#b77351",
                      "#5c6862",
                      "#806644",
                      "#d5d4c8",
                      "#8f7255",
                      "#b2b8b2",
                      "#e7e2d5",
                      "#b99b7e",
                    ][index],
                  } as CSSProperties
                }
              >
                <i aria-hidden="true" />
                <span>{item.name}</span>
                <small>{item.index}</small>
              </button>
            ))}
          </div>
          <div
            className="specimen-copy"
            role="tabpanel"
            id="specimen-description"
            aria-labelledby={`specimen-tab-${selected}`}
            tabIndex={0}
          >
            <span className="eyebrow">{material.trait}</span>
            <h3 key={material.slug}>
              {material.name}
              <span aria-hidden="true">.</span>
            </h3>
            <p>{material.blurb}</p>
            <p className="specimen-note">{material.note}</p>
            <Link className="text-link" to={`/materials#${material.slug}`}>
              Discover {material.name.toLowerCase()}{" "}
              <span aria-hidden="true">↗</span>
            </Link>
          </div>
        </div>
      </div>
      <div className="atelier-footnotes">
        {copy.sections.map(([heading, body], index) => (
          <div key={index} data-reveal>
            <span className="eyebrow">0{index + 1}</span>
            <h3>{heading}</h3>
            <p>{body}</p>
          </div>
        ))}
        <Link
          to="/bulk-orders"
          className="atelier-seal"
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
    </section>
  );
}
