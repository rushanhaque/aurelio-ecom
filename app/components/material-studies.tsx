import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { Link } from "react-router";
import { ArrowUpRight, Sparkles } from "lucide-react";
import "../material-studies.css";

/* The atelier studies — small instruments in the spirit of the light study:
   one gesture, one true thing about owning the piece, and a live readout.
   Each numbers on from "Material study 001". */

const studies = [["patina", "Polish fifty years away"]] as const;

const reducedMotion = () =>
  typeof matchMedia !== "undefined" &&
  matchMedia("(prefers-reduced-motion: reduce)").matches;

function Study({
  index,
  title,
  em,
  copy,
  note,
  icon,
  tone = "paper",
  reverse = false,
  extra,
  children,
}: {
  index: number;
  title: string;
  em: string;
  copy: ReactNode;
  note: string;
  icon: ReactNode;
  tone?: "paper" | "ink";
  reverse?: boolean;
  extra?: ReactNode;
  children: ReactNode;
}) {
  const [id] = studies[index];
  return (
    <section
      id={`study-${id}`}
      className={`study study-${tone} ${reverse ? "study-reverse" : ""}`}
      aria-labelledby={`study-${id}-title`}
    >
      <div className="study-inner container">
        <div className="study-intro" data-reveal>
          <h2 id={`study-${id}-title`}>
            {title}
            <br /> <em>{em}</em>
          </h2>
          <p>{copy}</p>
          <span className="interaction-note">
            {icon} {note}
          </span>
          {extra}
        </div>
        {children}
      </div>
    </section>
  );
}

/* The shared instrument frame: crosshairs, a study mark and a live value. */
function Instrument({
  mark,
  value,
  unit,
  light = false,
  className = "",
  style,
  children,
}: {
  mark: ReactNode;
  value: ReactNode;
  unit: string;
  light?: boolean;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  return (
    <div
      className={`instrument ${light ? "instrument-light" : ""} ${className}`}
      style={style}
    >
      {children}
      <span className="lab-cross top-left" aria-hidden="true">
        +
      </span>
      <span className="lab-cross bottom-right" aria-hidden="true">
        +
      </span>
      <span className="instrument-value" aria-hidden="true">
        {value}
        <small> / {unit}</small>
      </span>
    </div>
  );
}

/* ---------- Patina: rub fifty years of age away ---------- */

const patinas = {
  Copper: {
    texture: "/images/brand/copper-texture-800.webp",
    tone: "#3d4a3a",
    blooms: ["#5d9a86", "#3f7564", "#7fb3a0", "#2f5a4c"],
  },
  Brass: {
    texture: "/images/brand/brass-texture-800.webp",
    tone: "#3b2e1d",
    blooms: ["#21180d", "#4a3a22", "#2c2416", "#5b4a2c"],
  },
};
type PatinaName = keyof typeof patinas;
const AGE_YEARS = 50;

export function PatinaStudy() {
  const [metal, setMetal] = useState<PatinaName>("Copper");
  const [age, setAge] = useState(AGE_YEARS);
  const canvas = useRef<HTMLCanvasElement>(null);
  const aged = useRef<HTMLCanvasElement | null>(null);
  const rubbing = useRef(false);
  const last = useRef<[number, number] | null>(null);
  const hurry = useRef(0);
  const dirty = useRef(false);

  // Build the fully aged surface once per metal, then paint it on.
  useEffect(() => {
    const img = new Image();
    let alive = true;
    img.onload = () => {
      if (!alive || !canvas.current) return;
      const S = canvas.current.width;
      const off = document.createElement("canvas");
      off.width = off.height = S;
      const o = off.getContext("2d")!;
      o.drawImage(img, 0, 0, S, S);
      o.globalCompositeOperation = "multiply";
      o.fillStyle = patinas[metal].tone;
      o.fillRect(0, 0, S, S);
      o.globalCompositeOperation = "source-over";
      let seed = metal === "Copper" ? 7 : 19;
      const rand = () =>
        ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
      for (let i = 0; i < 520; i++) {
        const x = rand() * S;
        const y = rand() * S;
        const r = S * (0.008 + rand() ** 2 * 0.06);
        const g = o.createRadialGradient(x, y, 0, x, y, r);
        const c = patinas[metal].blooms[i % 4];
        g.addColorStop(0, c + "d9");
        g.addColorStop(0.55, c + "80");
        g.addColorStop(1, c + "00");
        o.fillStyle = g;
        o.fillRect(x - r, y - r, r * 2, r * 2);
      }
      for (let i = 0; i < 2600; i++) {
        o.fillStyle = `rgba(${rand() > 0.5 ? "255,255,255" : "0,0,0"},${rand() * 0.08})`;
        o.fillRect(rand() * S, rand() * S, 2, 2);
      }
      aged.current = off;
      const ctx = canvas.current.getContext("2d")!;
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 1;
      ctx.clearRect(0, 0, S, S);
      ctx.drawImage(off, 0, 0);
      setAge(AGE_YEARS);
    };
    img.src = patinas[metal].texture;
    return () => {
      alive = false;
    };
  }, [metal]);

  // Time keeps passing: the patina creeps back, and the readout follows it.
  useEffect(() => {
    const probe = document.createElement("canvas");
    probe.width = probe.height = 40;
    const p = probe.getContext("2d", { willReadFrequently: true })!;
    let visible = false;
    const watch = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
    });
    if (canvas.current) watch.observe(canvas.current);
    const timer = window.setInterval(() => {
      const c = canvas.current;
      const off = aged.current;
      if (!c || !off || (!visible && !dirty.current)) return;
      dirty.current = false;
      const ctx = c.getContext("2d")!;
      if (visible && !rubbing.current) {
        ctx.globalCompositeOperation = "source-over";
        ctx.globalAlpha = performance.now() < hurry.current ? 0.12 : 0.012;
        ctx.drawImage(off, 0, 0);
        ctx.globalAlpha = 1;
      }
      p.clearRect(0, 0, 40, 40);
      p.drawImage(c, 0, 0, 40, 40);
      const data = p.getImageData(0, 0, 40, 40).data;
      let sum = 0;
      for (let i = 3; i < data.length; i += 4) sum += data[i];
      setAge(Math.round((sum / (1600 * 255)) * AGE_YEARS));
    }, 160);
    return () => {
      window.clearInterval(timer);
      watch.disconnect();
    };
  }, []);

  function polish(x: number, y: number) {
    const c = canvas.current;
    if (!c) return;
    const ctx = c.getContext("2d")!;
    const S = c.width;
    const r = S * 0.07;
    ctx.globalCompositeOperation = "destination-out";
    const from = last.current ?? [x, y];
    const steps = Math.max(
      1,
      Math.ceil(Math.hypot(x - from[0], y - from[1]) / (r * 0.3)),
    );
    for (let i = 1; i <= steps; i++) {
      const px = from[0] + ((x - from[0]) * i) / steps;
      const py = from[1] + ((y - from[1]) * i) / steps;
      const g = ctx.createRadialGradient(px, py, 0, px, py, r);
      g.addColorStop(0, "rgba(0,0,0,.35)");
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.fillRect(px - r, py - r, r * 2, r * 2);
    }
    ctx.globalCompositeOperation = "source-over";
    last.current = [x, y];
    dirty.current = true;
  }
  function toCanvas(e: ReactPointerEvent<HTMLCanvasElement>): [number, number] {
    const r = e.currentTarget.getBoundingClientRect();
    const S = e.currentTarget.width;
    return [
      ((e.clientX - r.left) / r.width) * S,
      ((e.clientY - r.top) / r.height) * S,
    ];
  }
  function polishPatch() {
    const S = canvas.current?.width ?? 800;
    const cy = S * (0.3 + Math.random() * 0.4);
    last.current = null;
    for (let i = 0; i <= 12; i++)
      polish(S * (0.2 + i * 0.05), cy + Math.sin(i) * S * 0.04);
    last.current = null;
  }

  return (
    <Study
      index={0}
      reverse
      title="Polish fifty"
      em="years away."
      copy={<>Metal keeps changing. A cloth brings back the first day.</>}
      note="RUB THE SURFACE."
      icon={<Sparkles size={19} />}
      extra={
        <Link className="text-link study-link" to="/care">
          Care guide <ArrowUpRight size={16} />
        </Link>
      }
    >
      <Instrument
        mark={
          <>
            AURELIO
            <br /> PATINA STUDY 002
          </>
        }
        value={String(age).padStart(2, "0")}
        unit="YEARS"
        className="patina-instrument"
      >
        <img
          className="patina-bright"
          src={patinas[metal].texture}
          alt=""
          aria-hidden="true"
        />
        <canvas
          ref={canvas}
          width={800}
          height={800}
          className="patina-canvas"
          role="img"
          aria-label={`${metal} surface showing about ${age} years of patina`}
          onPointerDown={(e) => {
            if (e.button !== 0) return;
            e.currentTarget.setPointerCapture(e.pointerId);
            rubbing.current = true;
            last.current = null;
            polish(...toCanvas(e));
          }}
          onPointerMove={(e) => {
            if (rubbing.current) polish(...toCanvas(e));
          }}
          onPointerUp={() => {
            rubbing.current = false;
            last.current = null;
          }}
          onPointerCancel={() => {
            rubbing.current = false;
          }}
        />
        <div className="instrument-control">
          <div className="instrument-options" role="group" aria-label="Metal">
            {(Object.keys(patinas) as PatinaName[]).map((name) => (
              <button
                key={name}
                type="button"
                aria-pressed={metal === name}
                onClick={() => setMetal(name)}
              >
                {name}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="instrument-action"
            onClick={polishPatch}
          >
            Polish a patch
          </button>
          <button
            type="button"
            className="instrument-action"
            onClick={() => {
              hurry.current = performance.now() + 2200;
            }}
          >
            Let time pass
          </button>
        </div>
      </Instrument>
    </Study>
  );
}

export function MaterialStudies() {
  return (
    <div className="material-studies">
      <PatinaStudy />
    </div>
  );
}
