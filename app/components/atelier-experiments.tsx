import {
  useId,
  useState,
  type CSSProperties,
  type PointerEvent,
  type ReactNode,
} from "react";
import { Link } from "react-router";
import { Picture } from "./ui";
import { LightStudy } from "./light-study";
import "../atelier-experiments.css";

const experiments = [
  ["light-study", "Light changes everything"],
  ["hand-hammered", "Hand-hammered, up close"],
  ["mixed-finishes", "One piece, many finishes"],
  ["finish-for-the-room", "A finish for every room"],
  ["your-finish", "Your form, your finish"],
];

function Chapter({
  index,
  children,
  intro,
  dark = false,
}: {
  index: number;
  children: ReactNode;
  intro: string;
  dark?: boolean;
}) {
  return (
    <section
      id={experiments[index][0]}
      className={`experiment ${dark ? "experiment-dark" : ""}`}
      aria-labelledby={`experiment-title-${index}`}
    >
      <div className="container">
        <header className="experiment-heading" data-reveal>
          <h2 id={`experiment-title-${index}`}>
            {experiments[index][1]}
            <em>.</em>
          </h2>
          <p>{intro}</p>
        </header>
        {children}
      </div>
    </section>
  );
}

function Range({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  unit = "%",
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  unit?: string;
}) {
  function update(e: PointerEvent<HTMLInputElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    onChange(
      Math.round(
        min +
          Math.max(
            0,
            Math.min(1, (e.clientX - r.left - 11) / Math.max(1, r.width - 22)),
          ) *
            (max - min),
      ),
    );
  }
  return (
    <label className="experiment-range">
      <span>
        {label}
        <output>
          {value}
          {unit}
        </output>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        aria-label={label}
        aria-valuetext={`${value}${unit}`}
        style={
          {
            "--range-fill": `${((value - min) / (max - min)) * 100}%`,
          } as CSSProperties
        }
        onChange={(e) => onChange(Number(e.target.value))}
        onPointerDown={(e) => {
          if (e.button !== 0) return;
          e.preventDefault();
          e.currentTarget.focus({ preventScroll: true });
          e.currentTarget.setPointerCapture(e.pointerId);
          update(e);
        }}
        onPointerMove={(e) => {
          if (e.currentTarget.hasPointerCapture(e.pointerId)) update(e);
        }}
        onPointerUp={(e) => {
          if (e.currentTarget.hasPointerCapture(e.pointerId)) {
            update(e);
            e.currentTarget.releasePointerCapture(e.pointerId);
          }
        }}
      />
    </label>
  );
}

function Vessel({
  width = 90,
  neck = 38,
  height = 170,
  wire = false,
}: {
  width?: number;
  neck?: number;
  height?: number;
  wire?: boolean;
}) {
  const id = useId();
  const top = 285 - height;
  const path = `M${200 - neck},${top} L${200 + neck},${top} C${200 + neck - 8},${top + 55} ${200 + width},${top + 65} ${200 + width},220 Q${200 + width},275 240,285 L160,285 Q${200 - width},275 ${200 - width},220 C${200 - width},${top + 65} ${200 - neck + 8},${top + 55} ${200 - neck},${top}Z`;
  return (
    <g className={wire ? "vessel-wire" : "vessel-solid"}>
      <defs>
        <linearGradient id={id}>
          <stop stopColor="#544633" />
          <stop offset=".3" stopColor="#ac8752" />
          <stop offset=".48" stopColor="#dfc796" />
          <stop offset=".7" stopColor="#ae8d5b" />
          <stop offset="1" stopColor="#615038" />
        </linearGradient>
      </defs>
      <path
        d={path}
        fill={wire ? "none" : `url(#${id})`}
        stroke={wire ? "currentColor" : "#8b7047"}
        strokeWidth={wire ? 1.2 : 0.6}
      />
      <ellipse
        cx="200"
        cy={top}
        rx={neck}
        ry="5"
        fill={wire ? "none" : "#4d4030"}
        stroke="currentColor"
        strokeOpacity=".25"
      />
      {wire && (
        <>
          <path
            d={`M200 ${top - 20} V305 M${105} 220 H295`}
            stroke="currentColor"
            strokeDasharray="3 5"
            opacity=".4"
          />
          <ellipse
            cx="200"
            cy="220"
            rx={width}
            ry="17"
            fill="none"
            stroke="currentColor"
            opacity=".35"
          />
        </>
      )}
    </g>
  );
}

export function MakersLens() {
  const [point, setPoint] = useState({ x: 300, y: 225 });
  const clip = useId();
  function inspect(e: PointerEvent<SVGSVGElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    setPoint({
      x: Math.max(80, Math.min(520, ((e.clientX - r.left) / r.width) * 600)),
      y: Math.max(80, Math.min(370, ((e.clientY - r.top) / r.height) * 450)),
    });
  }
  return (
    <Chapter index={1} intro="Every mark is placed by hand.">
      <div className="experiment-split">
        <div className="experiment-canvas lens-canvas">
          <svg
            viewBox="0 0 600 450"
            role="img"
            aria-label="Magnified hand-hammered brass surface. Detail buttons provide fixed inspection positions."
            onPointerMove={(e) => {
              if (
                e.pointerType === "mouse" ||
                e.currentTarget.hasPointerCapture(e.pointerId)
              )
                inspect(e);
            }}
            onPointerDown={(e) => {
              e.currentTarget.setPointerCapture(e.pointerId);
              inspect(e);
            }}
          >
            <defs>
              <clipPath id={clip}>
                <circle cx={point.x} cy={point.y} r="85" />
              </clipPath>
            </defs>
            <image
              href="/images/finishes/hammered-brass-2400.webp"
              width="600"
              height="450"
              preserveAspectRatio="xMidYMid slice"
            />
            <g clipPath={`url(#${clip})`}>
              <image
                href="/images/finishes/hammered-brass-2400.webp"
                width="600"
                height="450"
                preserveAspectRatio="xMidYMid slice"
                transform={`translate(${-point.x * 1.4} ${-point.y * 1.4}) scale(2.4)`}
              />
            </g>
            <circle
              cx={point.x}
              cy={point.y}
              r="87"
              fill="none"
              stroke="#f2f2f2"
              strokeWidth="2"
            />
            <path
              d={`M${point.x + 62} ${point.y + 62} l35 35`}
              stroke="#f2f2f2"
              strokeWidth="4"
            />
          </svg>
        </div>
        <div className="experiment-copy">
          <p>Move the lens across the brass, or pick a detail.</p>
          <div className="lens-details">
            {[
              [160, 150, "01", "The high points"],
              [410, 210, "02", "The quieter marks"],
              [280, 335, "03", "The changing grain"],
            ].map(([x, y, n, title]) => (
              <button
                key={n}
                onClick={() => setPoint({ x: Number(x), y: Number(y) })}
              >
                <span>{n}</span>
                {title}
                <b>↗</b>
              </button>
            ))}
          </div>
          <Link className="text-link" to="/about">
            Meet the makers ↗
          </Link>
        </div>
      </div>
    </Chapter>
  );
}

/* The Solène table lamp from the atelier archive, photographed off and lit.
   Hotspot positions are fractions of the photograph. */
const lampParts = [
  {
    x: 68,
    y: 24,
    name: "The shade",
    finish: "Pleated linen, soft light.",
  },
  {
    x: 50,
    y: 38,
    name: "The light source",
    finish: "Wired and balanced by hand.",
  },
  {
    x: 55,
    y: 60,
    name: "The stem",
    finish: "Cast brass, antiqued.",
  },
  {
    x: 62,
    y: 85,
    name: "The base",
    finish: "Weighted brass, burnished.",
  },
];
export function ObjectAnatomy() {
  const [glow, setGlow] = useState(0),
    [part, setPart] = useState<number | null>(null);
  return (
    <Chapter index={2} dark intro="One piece, more than one finish.">
      <div className="experiment-split">
        <div
          className="experiment-canvas anatomy-canvas"
          style={{ "--glow": glow / 100 } as CSSProperties}
        >
          <div className="anatomy-photo">
            <img
              src="/images/original/Lamptwo-960.webp"
              srcSet="/images/original/Lamptwo-480.webp 480w, /images/original/Lamptwo-960.webp 960w"
              sizes="(max-width: 900px) 80vw, 520px"
              width={960}
              height={1442}
              loading="lazy"
              decoding="async"
              alt="The Solène table lamp: a pleated shade on a fluted, antiqued brass stem and base"
            />
            <img
              className="anatomy-lit"
              src="/images/original/LamptwoHover-960.webp"
              srcSet="/images/original/LamptwoHover-480.webp 480w, /images/original/LamptwoHover-960.webp 960w"
              sizes="(max-width: 900px) 80vw, 520px"
              width={960}
              height={1439}
              loading="lazy"
              decoding="async"
              alt=""
              aria-hidden="true"
            />
            {lampParts.map((p, i) => (
              <button
                key={p.name}
                className={`anatomy-spot ${part === i ? "is-active" : ""}`}
                style={{ left: `${p.x}%`, top: `${p.y}%` }}
                onPointerEnter={() => setPart(i)}
                onPointerLeave={() => setPart(null)}
                onFocus={() => setPart(i)}
                onBlur={() => setPart(null)}
                aria-label={`${p.name}: ${p.finish}`}
              >
                <span>0{i + 1}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="experiment-copy">
          <ol className="anatomy-list">
            {lampParts.map((p, i) => (
              <li
                key={p.name}
                className={part === i ? "is-active" : ""}
                onPointerEnter={() => setPart(i)}
                onPointerLeave={() => setPart(null)}
              >
                <b>{p.name}</b>
                <span>{p.finish}</span>
              </li>
            ))}
          </ol>
          <Range label="Light the lamp" value={glow} onChange={setGlow} />
        </div>
      </div>
    </Chapter>
  );
}

/* Real settings from the Aurelio collections, each with the finish that suits
   it. These replaced drawn SVG rooms. */
const rooms = [
  {
    name: "A quiet home",
    image: "brand/lightings",
    alt: "Brass lamps and sconces in a calm, sunlit living space",
    finish: "Antique brass",
    caption: "A quiet home.",
    detail: "Antique brass glows rather than shines.",
  },
  {
    name: "A boutique hotel",
    image: "brand/furniture",
    alt: "A hotel lounge with brass-framed seating and a hammered brass table",
    finish: "Polished brass",
    caption: "A warm welcome.",
    detail: "Polished brass catches the eye and wears well.",
  },
  {
    name: "A gathered table",
    image: "brand/kitchenware",
    alt: "Brass and copper serveware set on a table outdoors",
    finish: "Hammered brass & copper",
    caption: "A gathered table.",
    detail: "Hammered metal hides the marks of use.",
  },
];
export function ThreeLives() {
  const [scene, setScene] = useState(0);
  const room = rooms[scene];
  return (
    <Chapter index={3} intro="The right finish depends on the room.">
      <div className="room-stage experiment-canvas">
        {/* All three stay mounted so switching is an instant crossfade. */}
        {rooms.map((r, i) => (
          <div
            key={r.name}
            className={`room-photo ${scene === i ? "is-active" : ""}`}
            aria-hidden={scene !== i}
          >
            <Picture
              name={r.image}
              alt={r.alt}
              sizes="(max-width: 900px) 92vw, 80vw"
            />
          </div>
        ))}
      </div>
      <div className="room-selector">
        {rooms.map((r, i) => (
          <button
            key={r.name}
            aria-pressed={scene === i}
            onClick={() => setScene(i)}
            onPointerEnter={(e) => e.pointerType === "mouse" && setScene(i)}
          >
            <span>0{i + 1}</span>
            {r.name}
            <b>↗</b>
          </button>
        ))}
      </div>
      <div className="experiment-under">
        <h3 key={scene}>{room.caption}</h3>
        <p>
          {room.detail}
          <small>{room.finish}</small>
        </p>
      </div>
    </Chapter>
  );
}

export function YourLine() {
  const [width, setWidth] = useState(75),
    [neck, setNeck] = useState(32),
    [height, setHeight] = useState(165),
    [finish, setFinish] = useState("Brass"),
    [solid, setSolid] = useState(false);
  const brief = `Bespoke vessel concept: body ${width}/110, opening ${neck}/60, height ${height}/210, in ${finish}. Proportions only. Please advise on dimensions, finish, quantity and price.`;
  return (
    <Chapter
      index={4}
      intro="Sketch a form. Pick a metal. We send samples first."
    >
      <div className="experiment-split">
        <div
          className={`experiment-canvas line-canvas ${solid ? "is-solid" : ""}`}
        >
          <svg
            viewBox="0 0 400 340"
            role="img"
            aria-label={`Vessel concept: body ${width}, opening ${neck}, height ${height}; ${solid ? "form" : "sketch"} view`}
          >
            <defs>
              <pattern
                id="line-grid"
                width="20"
                height="20"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M20 0 H0 V20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth=".4"
                  opacity=".12"
                />
              </pattern>
            </defs>
            <rect width="400" height="340" fill="url(#line-grid)" />
            <g
              style={{
                filter:
                  solid && finish === "Copper"
                    ? "hue-rotate(-18deg) saturate(1.4)"
                    : solid && finish === "Bronze"
                      ? "brightness(.7)"
                      : "none",
              }}
            >
              <Vessel width={width} neck={neck} height={height} wire={!solid} />
            </g>
          </svg>
          <button
            className="line-view"
            aria-pressed={solid}
            onClick={() => setSolid((v) => !v)}
          >
            {solid ? "Return to the drawing" : "Bring the form to life"} ↗
          </button>
        </div>
        <div className="experiment-copy">
          <Range
            label="Body proportion"
            min={55}
            max={110}
            value={width}
            unit=""
            onChange={setWidth}
          />
          <Range
            label="Opening proportion"
            min={20}
            max={60}
            value={neck}
            unit=""
            onChange={setNeck}
          />
          <Range
            label="Height proportion"
            min={120}
            max={210}
            value={height}
            unit=""
            onChange={setHeight}
          />
          <div className="experiment-options" aria-label="Preferred metal">
            {["Brass", "Copper", "Bronze"].map((m) => (
              <button
                key={m}
                aria-pressed={finish === m}
                onClick={() => setFinish(m)}
              >
                {m}
              </button>
            ))}
          </div>
          <Link
            className="experiment-cta"
            to={`/bulk-orders?product=Bespoke+vessel&brief=${encodeURIComponent(brief)}`}
          >
            Send this idea <span>↗</span>
          </Link>
        </div>
      </div>
    </Chapter>
  );
}

export function AtelierExperiments() {
  return (
    <div className="atelier-experiments">
      <section
        id="finishes"
        className="experiment-directory container"
        aria-label="The finishes we offer"
      >
        <h2>
          Finished by hand,
          <br />
          <em>chosen by you.</em>
        </h2>
        <nav aria-label="Finishes we offer">
          {experiments.map(([id, name], i) => (
            <a key={id} href={`#${id}`}>
              <small>0{i + 1}</small>
              {name}
              <span>↗</span>
            </a>
          ))}
        </nav>
      </section>
      <LightStudy />
      <MakersLens />
      <ObjectAnatomy />
      <ThreeLives />
      <YourLine />
    </div>
  );
}
