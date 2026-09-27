import {
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent,
  type ReactNode,
} from "react";
import { Link } from "react-router";
import { Picture } from "./ui";
import "../atelier-experiments.css";

const experiments = [
  ["patina-study", "Time leaves a signature"],
  ["polish-study", "The final polish"],
  ["shadow-theatre", "The shadow theatre"],
  ["makers-lens", "Under the maker’s lens"],
  ["object-anatomy", "Anatomy of an object"],
  ["three-lives", "One object, three lives"],
  ["atelier-rhythm", "The rhythm of the atelier"],
  ["your-line", "From your line to our hands"],
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
          <span className="eyebrow">THE SENSORY ATELIER / 0{index + 1}</span>
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

export function PatinaStudy() {
  const [age, setAge] = useState(30),
    [preserve, setPreserve] = useState(false);
  const visible = preserve ? 0 : age;
  return (
    <Chapter
      index={0}
      intro="An object begins in the workshop. Its character keeps unfolding in your hands."
    >
      <div className="experiment-split">
        <div className="patina-canvas experiment-canvas">
          <Picture
            name="sculpture"
            alt="Sculptural brass form in an illustrative patina study"
          />
          <div className="patina-wash" style={{ opacity: visible / 125 }} />
          <span className="experiment-stamp">BRASS / A LIVING SURFACE</span>
          <span className="patina-word">
            {visible < 33 ? "Fresh." : visible < 67 ? "Mellow." : "Storied."}
          </span>
        </div>
        <div className="experiment-copy">
          <span className="eyebrow">BEAUTY, WITH A MEMORY</span>
          <h3>{preserve ? "Hold the moment." : "Let time leave its mark."}</h3>
          <p>
            Explore a visual impression of a changing surface. The way real
            brass develops depends on its finish, handling and environment.
          </p>
          <div className="experiment-options" aria-label="Finish approach">
            <button aria-pressed={!preserve} onClick={() => setPreserve(false)}>
              Embrace patina
            </button>
            <button aria-pressed={preserve} onClick={() => setPreserve(true)}>
              Preserve the finish
            </button>
          </div>
          <Range
            label="Explore the patina"
            value={age}
            onChange={(v) => {
              setAge(v);
              setPreserve(false);
            }}
          />
          <div className="experiment-scale">
            <span>NEWLY FINISHED</span>
            <span>FULL OF CHARACTER</span>
          </div>
          <p className="experiment-caption">
            Colour study, not a prediction of ageing. Protective finishes and
            care are discussed for each piece.
          </p>
          <Link className="text-link" to="/care">
            Living with your objects ↗
          </Link>
        </div>
      </div>
    </Chapter>
  );
}

export function PolishStudy() {
  const [marks, setMarks] = useState<{ x: number; y: number }[]>([]),
    [reveal, setReveal] = useState(0);
  const mask = useId();
  function polish(e: PointerEvent<SVGSVGElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    const point = {
      x:
        Math.round(
          Math.max(0, Math.min(600, ((e.clientX - r.left) / r.width) * 600)) /
            24,
        ) * 24,
      y:
        Math.round(
          Math.max(0, Math.min(450, ((e.clientY - r.top) / r.height) * 450)) /
            24,
        ) * 24,
    };
    // A finite grid retains earlier strokes without growing on every pointer event.
    setMarks((old) =>
      old.some((p) => p.x === point.x && p.y === point.y)
        ? old
        : [...old, point],
    );
  }
  return (
    <Chapter
      index={1}
      dark
      intro="One surface. Two impressions. Follow the gesture of a finishing hand."
    >
      <div className="experiment-split experiment-split-reverse">
        <div className="experiment-copy">
          <span className="eyebrow">A LITTLE WORK, A LITTLE WONDER</span>
          <h3>The reveal is in your hands.</h3>
          <p>
            Drag across the metal to uncover its glow. Every pass leaves a small
            trace of your movement.
          </p>
          <Range
            label="Reveal the polished study"
            value={reveal}
            onChange={setReveal}
          />
          <button
            className="experiment-reset"
            onClick={() => {
              setMarks([]);
              setReveal(0);
            }}
          >
            Start with a fresh surface ↺
          </button>
          <p className="experiment-caption">
            Interactive finish illustration using Aurelio’s brass texture. Not a
            before-and-after manufacturing photograph.
          </p>
        </div>
        <div className="experiment-canvas polish-canvas">
          <svg
            viewBox="0 0 600 450"
            role="img"
            aria-label="Rubbed brass surface. Use the reveal slider as a keyboard alternative."
            onPointerDown={(e) => {
              if (e.button !== 0) return;
              e.currentTarget.setPointerCapture(e.pointerId);
              polish(e);
            }}
            onPointerMove={(e) => {
              if (e.currentTarget.hasPointerCapture(e.pointerId)) polish(e);
            }}
          >
            <defs>
              <mask id={mask}>
                <rect width="600" height="450" fill="black" />
                <rect width={reveal * 6} height="450" fill="white" />
                {marks.map((p, i) => (
                  <circle key={i} cx={p.x} cy={p.y} r="38" fill="white" />
                ))}
              </mask>
            </defs>
            <image
              href="/images/brand/brass-texture-800.webp"
              width="600"
              height="450"
              preserveAspectRatio="xMidYMid slice"
              className="polish-dull"
            />
            <image
              href="/images/brand/brass-texture-800.webp"
              width="600"
              height="450"
              preserveAspectRatio="xMidYMid slice"
              mask={`url(#${mask})`}
            />
          </svg>
          <span className="experiment-stamp">PRESS. MOVE. REVEAL.</span>
        </div>
      </div>
    </Chapter>
  );
}

export function ShadowTheatre() {
  const [angle, setAngle] = useState(45);
  const rad = (angle * Math.PI) / 180;
  function moveSun(e: PointerEvent<SVGSVGElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    const scale = Math.min(r.width / 800, r.height / 420);
    const x = (e.clientX - r.left - (r.width - 800 * scale) / 2) / scale;
    const y = (e.clientY - r.top - (r.height - 420 * scale) / 2) / scale;
    setAngle(
      Math.round(
        Math.max(
          10,
          Math.min(
            170,
            (Math.atan2(Math.max(0, 265 - y), x - 400) * 180) / Math.PI,
          ),
        ),
      ),
    );
  }
  return (
    <Chapter
      index={2}
      intro="The object occupies a place. Its shadow changes the space around it."
    >
      <div className="shadow-stage experiment-canvas">
        <svg
          viewBox="0 0 800 420"
          role="img"
          aria-label={`Abstract sculpture with light at ${angle} degrees`}
          onPointerDown={(e) => {
            if (e.button !== 0) return;
            e.currentTarget.setPointerCapture(e.pointerId);
            moveSun(e);
          }}
          onPointerMove={(e) => {
            if (e.currentTarget.hasPointerCapture(e.pointerId)) moveSun(e);
          }}
        >
          <defs>
            <linearGradient id="shadow-wall" x2="0" y2="1">
              <stop stopColor="#e4ded2" />
              <stop offset="1" stopColor="#bfb6a5" />
            </linearGradient>
            <radialGradient id="shadow-soft">
              <stop stopColor="#263729" stopOpacity=".65" />
              <stop offset="1" stopColor="#263729" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="800" height="420" fill="url(#shadow-wall)" />
          <path d="M0 290 H800" stroke="#a89e8c" />
          <path
            d="M400 60 A250 180 0 0 1 650 240"
            fill="none"
            stroke="#756b58"
            strokeDasharray="2 7"
            opacity=".4"
          />
          <ellipse
            cx={400 - Math.cos(rad) * 115}
            cy="320"
            rx={95 + Math.abs(Math.cos(rad)) * 125}
            ry="32"
            fill="url(#shadow-soft)"
            transform={`rotate(${(angle - 90) / 7} 400 320)`}
          />
          <g transform="translate(200 25)">
            <Vessel />
          </g>
          <g
            transform={`translate(${400 + Math.cos(rad) * 265} ${265 - Math.sin(rad) * 210})`}
          >
            <circle r="24" fill="#fff7d6" />
            <circle r="34" fill="none" stroke="#fff7d6" strokeOpacity=".5" />
          </g>
        </svg>
        <span className="experiment-stamp">A STUDY IN FORM & SHADOW</span>
      </div>
      <div className="experiment-under">
        <p>
          A small sun. A different perspective.
          <small>Illustrative light study.</small>
        </p>
        <Range
          label="Move the sun"
          value={angle}
          min={10}
          max={170}
          unit="°"
          onChange={setAngle}
        />
      </div>
    </Chapter>
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
    <Chapter
      index={3}
      intro="Look a little closer. A surface tells you how it was touched."
    >
      <div className="experiment-split">
        <div className="experiment-canvas lens-canvas">
          <svg
            viewBox="0 0 600 450"
            role="img"
            aria-label="Magnified brass texture. Detail buttons provide fixed inspection positions."
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
              href="/images/brand/brass-texture-800.webp"
              width="600"
              height="450"
              preserveAspectRatio="xMidYMid slice"
            />
            <g clipPath={`url(#${clip})`}>
              <image
                href="/images/brand/brass-texture-800.webp"
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
          <span className="experiment-stamp">BRASS / 2.4× CLOSER</span>
        </div>
        <div className="experiment-copy">
          <span className="eyebrow">THE SMALL THINGS ARE THE THING</span>
          <h3>Character lives in the detail.</h3>
          <p>
            Move the lens across the surface, or choose a detail below. Notice
            how the highlights break around each variation.
          </p>
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
          <Link className="text-link" to="/our-craft">
            Meet the making ↗
          </Link>
        </div>
      </div>
    </Chapter>
  );
}

export function ObjectAnatomy() {
  const [apart, setApart] = useState(0),
    [follow, setFollow] = useState(true);
  const stage = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const node = stage.current;
    if (
      !node ||
      !follow ||
      matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    let raf = 0,
      active = false;
    const update = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = node.getBoundingClientRect();
        setApart(
          Math.round(
            Math.max(
              0,
              Math.min(1, (innerHeight * 0.8 - r.top) / (innerHeight * 0.6)),
            ) * 100,
          ),
        );
      });
    };
    const observer = new IntersectionObserver(([entry]) => {
      active = entry.isIntersecting;
      if (active) {
        window.addEventListener("scroll", update, { passive: true });
        update();
      } else window.removeEventListener("scroll", update);
    });
    observer.observe(node);
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", update);
      cancelAnimationFrame(raf);
    };
  }, [follow]);
  const gap = apart / 100;
  return (
    <Chapter
      index={4}
      dark
      intro="Quiet on the outside. Considered in every part."
    >
      <div className="experiment-split">
        <div ref={stage} className="experiment-canvas anatomy-canvas">
          <svg
            viewBox="0 0 600 500"
            role="img"
            aria-label="Illustrative lamp construction, separated into shade, light source, stem and base"
          >
            <defs>
              <linearGradient id="anatomy-metal">
                <stop stopColor="#7d6039" />
                <stop offset=".5" stopColor="#ecd2a0" />
                <stop offset="1" stopColor="#866944" />
              </linearGradient>
            </defs>
            <path
              d="M300 30 V460"
              stroke="#d5c19b"
              opacity=".3"
              strokeDasharray="3 6"
            />
            <g transform={`translate(0 ${-gap * 70})`}>
              <path
                d="M240 145 Q300 100 360 145 L395 235 Q300 270 205 235Z"
                fill="url(#anatomy-metal)"
              />
              <ellipse cx="300" cy="235" rx="95" ry="17" fill="#594831" />
              <path d="M395 183 H445" stroke="#b9a581" />
              <text x="455" y="188">
                01
              </text>
            </g>
            <g transform={`translate(0 ${-gap * 10})`}>
              <ellipse cx="300" cy="247" rx="22" ry="29" fill="#fff1c4" />
              <path d="M326 245 H410" stroke="#b9a581" />
              <text x="420" y="250">
                02
              </text>
            </g>
            <g transform={`translate(0 ${gap * 35})`}>
              <rect
                x="294"
                y="267"
                width="12"
                height="95"
                rx="5"
                fill="url(#anatomy-metal)"
              />
              <path d="M310 310 H445" stroke="#b9a581" />
              <text x="455" y="315">
                03
              </text>
            </g>
            <g transform={`translate(0 ${gap * 60})`}>
              <ellipse
                cx="300"
                cy="371"
                rx="75"
                ry="15"
                fill="url(#anatomy-metal)"
              />
              <path d="M377 371 H410" stroke="#b9a581" />
              <text x="420" y="376">
                04
              </text>
            </g>
          </svg>
          <span className="experiment-stamp">ANATOMY / A CONCEPTUAL LAMP</span>
        </div>
        <div className="experiment-copy">
          <span className="eyebrow">NOTHING HERE BY ACCIDENT</span>
          <h3>A whole, made of details.</h3>
          <ol className="anatomy-list">
            <li>
              <b>The shade</b>
              <span>Where the light finds its direction.</span>
            </li>
            <li>
              <b>The light source</b>
              <span>The warm centre of the composition.</span>
            </li>
            <li>
              <b>The stem</b>
              <span>A line that holds the proportions together.</span>
            </li>
            <li>
              <b>The base</b>
              <span>A quiet foundation for the form.</span>
            </li>
          </ol>
          <Range
            label="Separate the parts"
            value={apart}
            onChange={(v) => {
              setFollow(false);
              setApart(v);
            }}
          />
          <button
            className="experiment-reset"
            aria-pressed={follow}
            onClick={() => setFollow((v) => !v)}
          >
            {follow ? "Scroll choreography on" : "Follow my scroll"} ↕
          </button>
          <p className="experiment-caption">
            Design illustration, not the technical specification of a
            purchasable lamp.
          </p>
        </div>
      </div>
    </Chapter>
  );
}

const rooms = [
  {
    name: "A quiet home",
    wall: "#ddd5c6",
    floor: "#b4a38c",
    caption: "A small pause in the everyday.",
    detail: "A console. A favourite book. Room to breathe.",
  },
  {
    name: "A boutique hotel",
    wall: "#153b31",
    floor: "#4d5645",
    caption: "A welcome with character.",
    detail: "A composed arrival, made a little more memorable.",
  },
  {
    name: "An evening table",
    wall: "#504237",
    floor: "#9b7454",
    caption: "For moments worth gathering.",
    detail: "Warm light. Familiar faces. A considered centrepiece.",
  },
];
export function ThreeLives() {
  const [scene, setScene] = useState(0);
  const room = rooms[scene];
  return (
    <Chapter
      index={5}
      intro="Keep the object. Change the setting. Discover what it brings to the room."
    >
      <div
        className="room-stage experiment-canvas"
        style={
          {
            "--room-wall": room.wall,
            "--room-floor": room.floor,
          } as CSSProperties
        }
      >
        <svg
          viewBox="0 0 800 440"
          role="img"
          aria-label={`Illustrative brass vessel in ${room.name.toLowerCase()}`}
        >
          <rect className="room-wall" width="800" height="440" />
          <path d="M0 315 H800 V440 H0Z" className="room-floor" />
          {scene === 0 && (
            <g>
              <path
                d="M70 30 H265 V275 H70Z M165 30 V275 M70 140 H265"
                fill="none"
                stroke="#f1eadb"
                strokeWidth="6"
              />
              <path d="M190 320 H310 V340 H190Z" fill="#e2d8bc" />
              <path d="M185 307 H303 V320 H185Z" fill="#7a8066" />
            </g>
          )}
          {scene === 1 && (
            <g fill="none" stroke="#b7a074" strokeOpacity=".45">
              <path
                d="M80 315 V125 Q80 35 170 35 Q260 35 260 125 V315 M540 315 V125 Q540 35 630 35 Q720 35 720 125 V315"
                strokeWidth="2"
              />
              <path d="M45 335 H755" />
            </g>
          )}
          {scene === 2 && (
            <g>
              <ellipse cx="400" cy="365" rx="290" ry="50" fill="#cfc1a5" />
              <g stroke="#d5b675" strokeWidth="5">
                <path d="M165 355 V235 M635 355 V215" />
              </g>
              <g fill="#fff1c4">
                <ellipse cx="165" cy="223" rx="5" ry="12" />
                <ellipse cx="635" cy="203" rx="5" ry="12" />
              </g>
              <g fill="none" stroke="#f1e5c6">
                <ellipse cx="250" cy="367" rx="46" ry="12" />
                <ellipse cx="550" cy="367" rx="46" ry="12" />
              </g>
            </g>
          )}
          <ellipse
            cx="400"
            cy="345"
            rx="100"
            ry="14"
            fill="#172b22"
            opacity=".15"
          />
          <g transform="translate(200 55)">
            <Vessel width={72} height={145} neck={32} />
          </g>
        </svg>
        <span className="experiment-stamp">
          SAME FORM. A DIFFERENT FEELING.
        </span>
      </div>
      <div className="room-selector">
        {rooms.map((r, i) => (
          <button
            key={r.name}
            aria-pressed={scene === i}
            onClick={() => setScene(i)}
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
          <small>Illustrative room compositions.</small>
        </p>
      </div>
    </Chapter>
  );
}

const rhythms = [
  {
    name: "Casting",
    image: "castingandforging",
    word: "Begin in fire.",
    text: "Heat opens a possibility. The mould gives it a boundary.",
    frequency: 110,
  },
  {
    name: "Hammering",
    image: "handraising",
    word: "Find a rhythm.",
    text: "A repeated gesture. A surface that remembers the hand.",
    frequency: 640,
  },
  {
    name: "Finishing",
    image: "patinaandfinishing",
    word: "Leave a signature.",
    text: "A final pass brings texture, tone and character into focus.",
    frequency: 220,
  },
];
export function AtelierRhythm() {
  const [stage, setStage] = useState(0),
    [playing, setPlaying] = useState(false),
    [audioError, setAudioError] = useState("");
  const audio = useRef<AudioContext | null>(null),
    timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
      void audio.current?.close();
    },
    [],
  );
  function stop() {
    if (timer.current) clearTimeout(timer.current);
    void audio.current?.close();
    audio.current = null;
    setPlaying(false);
  }
  async function play() {
    stop();
    setAudioError("");
    try {
      const context = new AudioContext();
      audio.current = context;
      await context.resume();
      if (audio.current !== context) return;
      setPlaying(true);
      for (let i = 0; i < 6; i++) {
        const oscillator = context.createOscillator(),
          gain = context.createGain(),
          t = context.currentTime + i * 0.32;
        oscillator.type = stage === 1 ? "triangle" : "sine";
        oscillator.frequency.setValueAtTime(rhythms[stage].frequency, t);
        oscillator.frequency.exponentialRampToValueAtTime(
          rhythms[stage].frequency * 0.55,
          t + 0.2,
        );
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.06, t + 0.008);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.23);
        oscillator.connect(gain);
        gain.connect(context.destination);
        oscillator.start(t);
        oscillator.stop(t + 0.25);
      }
      timer.current = setTimeout(stop, 2100);
    } catch {
      setAudioError(
        "Sound is unavailable in this browser. You can still explore the stages.",
      );
      stop();
    }
  }
  const current = rhythms[stage];
  return (
    <Chapter
      index={6}
      dark
      intro="There is a rhythm to making. A sequence of gestures, each with its own tempo."
    >
      <div className="experiment-split">
        <div
          className={`experiment-canvas rhythm-canvas ${playing ? "is-playing" : ""}`}
        >
          <img
            key={current.image}
            src={`/images/original/${current.image}-960.webp`}
            srcSet={`/images/original/${current.image}-480.webp 480w, /images/original/${current.image}-960.webp 960w`}
            sizes="(max-width:760px) 90vw, 48vw"
            width="960"
            height="960"
            loading="lazy"
            alt={`${current.name} in the Aurelio workshop`}
          />
          <div className="rhythm-bars" aria-hidden="true">
            {Array.from({ length: 24 }, (_, i) => (
              <i
                key={i}
                style={
                  {
                    "--bar": `${12 + ((i * 17) % 44)}px`,
                    "--delay": `${i * 0.06}s`,
                  } as CSSProperties
                }
              />
            ))}
          </div>
        </div>
        <div className="experiment-copy">
          <span className="eyebrow">A WORKSHOP IN THREE MOVEMENTS</span>
          <h3>{current.word}</h3>
          <p>{current.text}</p>
          <div className="experiment-options">
            {rhythms.map((r, i) => (
              <button
                key={r.name}
                aria-pressed={stage === i}
                onClick={() => {
                  stop();
                  setStage(i);
                }}
              >
                {r.name}
              </button>
            ))}
          </div>
          <button
            className="sound-button"
            aria-pressed={playing}
            onClick={() => (playing ? stop() : void play())}
          >
            {playing ? "Stop sound sketch" : "Play sound sketch"}
            <span aria-hidden="true">{playing ? "Ⅱ" : "▷"}</span>
          </button>
          <p className="experiment-caption">
            Workshop stills with an optional synthesised sound sketch. No audio
            plays automatically; these are not workshop recordings.
          </p>
          <p role="status">{audioError}</p>
        </div>
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
  const brief = `Bespoke vessel concept from the Aurelio form study: body ${width}/110, opening ${neck}/60, height ${height}/210; preferred material ${finish}. These are visual proportions, not dimensions or an order. Please discuss feasibility, final dimensions, finish, quantity and pricing with me.`;
  return (
    <Chapter
      index={7}
      intro="Every commission starts somewhere. Let yours begin with a line."
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
          <span className="experiment-stamp">
            YOUR PROPORTIONS / OUR CONVERSATION
          </span>
          <button
            className="line-view"
            aria-pressed={solid}
            onClick={() => setSolid((v) => !v)}
          >
            {solid ? "Return to the drawing" : "Bring the form to life"} ↗
          </button>
        </div>
        <div className="experiment-copy">
          <span className="eyebrow">AN IDEA, TAKING SHAPE</span>
          <h3>Draw a possibility.</h3>
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
          <div className="experiment-options" aria-label="Preferred material">
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
            Bring this idea to Aurelio <span>↗</span>
          </Link>
          <p className="experiment-caption">
            A proportion sketch, not a production drawing. Your choices travel
            with the enquiry; dimensions and feasibility are agreed with the
            atelier.
          </p>
        </div>
      </div>
    </Chapter>
  );
}

export function AtelierExperiments() {
  return (
    <div className="atelier-experiments">
      <section
        id="sensory-atelier"
        className="experiment-directory container"
        aria-label="Explore eight interactive studies"
      >
        <span className="eyebrow">TOUCH. EXPLORE. IMAGINE.</span>
        <h2>
          A little closer
          <br />
          <em>to the extraordinary.</em>
        </h2>
        <nav aria-label="Sensory atelier studies">
          {experiments.map(([id, name], i) => (
            <a key={id} href={`#${id}`}>
              <small>0{i + 1}</small>
              {name}
              <span>↗</span>
            </a>
          ))}
        </nav>
      </section>
      <PatinaStudy />
      <PolishStudy />
      <ShadowTheatre />
      <MakersLens />
      <ObjectAnatomy />
      <ThreeLives />
      <AtelierRhythm />
      <YourLine />
    </div>
  );
}
