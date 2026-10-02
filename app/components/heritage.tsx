import { useEffect, useRef, useState } from "react";
import "../heritage.css";

/* Adapted from the original Aurelio project's Heritage section: a full-bleed
   atelier film, a short story and four counters that count up once. */
const stats = [
  { value: 17, suffix: "+", label: "Years at the bench" },
  { value: 60, suffix: "+", label: "Hands in the workshop" },
  { value: 5000, suffix: "+", label: "Pieces a year" },
  { value: 25, suffix: "+", label: "Countries shipped to" },
];
const format = (n: number) => Math.round(n).toLocaleString("en-US");

export function Heritage() {
  const section = useRef<HTMLElement>(null);
  const numbers = useRef<(HTMLElement | null)[]>([]);
  const [film, setFilm] = useState(false);
  const [counted, setCounted] = useState(false);

  // The film is ~4 MB and sits well below the fold, so hold the download until
  // the section is near the viewport.
  useEffect(() => {
    const root = section.current;
    if (!root) return;
    const watch = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setFilm(true);
        watch.disconnect();
      },
      { rootMargin: "200% 0px" },
    );
    watch.observe(root);
    return () => watch.disconnect();
  }, []);

  // Count up once, when the stats come into view.
  useEffect(() => {
    const root = section.current;
    if (!root) return;
    const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frame = 0;
    const run = () => {
      setCounted(true);
      if (calm) {
        stats.forEach((s, i) => {
          const el = numbers.current[i];
          if (el) el.textContent = format(s.value) + s.suffix;
        });
        return;
      }
      const start = performance.now();
      const tick = (now: number) => {
        stats.forEach((s, i) => {
          const el = numbers.current[i];
          if (!el) return;
          const t = Math.min(1, Math.max(0, (now - start - i * 100) / 2200));
          el.textContent =
            format(s.value * (1 - Math.pow(1 - t, 4))) + s.suffix;
        });
        if (now - start < 2200 + stats.length * 100)
          frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    };
    const watch = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        run();
        watch.disconnect();
      },
      { threshold: 0.35 },
    );
    watch.observe(root);
    return () => {
      watch.disconnect();
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <section
      ref={section}
      id="heritage"
      className={`heritage ${counted ? "is-counted" : ""}`}
      aria-labelledby="heritage-title"
    >
      <div className="heritage-film" aria-hidden="true">
        {film && (
          <video
            className="heritage-video"
            src="/videos/heritage.mp4"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
          />
        )}
        <div className="heritage-scrim" />
      </div>
      <div className="heritage-body container">
        <h2 id="heritage-title">
          At the bench
          <br /> <em>since 2008.</em>
        </h2>
        <div className="heritage-prose">
          <p>
            Aurelio began as one workshop in Moradabad and a handful of hands.
            We are still a family atelier, larger but unchanged.
          </p>
          <p>
            We chase the line of a curve and the weight of a handle. Patience is
            our only shortcut.
          </p>
        </div>
        <dl className="heritage-stats">
          {stats.map((s, i) => (
            <div className="heritage-stat" key={s.label}>
              <span className="heritage-bar" aria-hidden="true" />
              <dd
                className="heritage-num"
                aria-hidden="true"
                ref={(el) => {
                  numbers.current[i] = el;
                }}
              >
                0{s.suffix}
              </dd>
              <span className="sr-only">
                {format(s.value)}
                {s.suffix}
              </span>
              <dt>{s.label}</dt>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
