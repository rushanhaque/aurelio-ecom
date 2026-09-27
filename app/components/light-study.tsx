import { useState, type CSSProperties, type PointerEvent } from "react";
import { MoveHorizontal } from "lucide-react";
import { Picture } from "./ui";

export function LightStudy() {
  const [light, setLight] = useState(55);
  function moveLight(event: PointerEvent<HTMLInputElement>) {
    const bounds = event.currentTarget.getBoundingClientRect();
    // Match the 22px thumb's travel, including both reachable endpoints.
    const progress = (event.clientX - bounds.left - 11) / Math.max(1, bounds.width - 22);
    setLight(Math.round(Math.min(1, Math.max(0, progress)) * 100));
  }
  return (
    <section className="light-lab container" id="light-study" aria-labelledby="light-study-title">
      <div className="lab-intro">
        <span className="chapter-tag">03 / A LITTLE EXPERIMENT</span>
        <h2 id="light-study-title">Light changes<br /> <em>everything.</em></h2>
        <p>Metal never stands still. It catches a moment,<br /> holds a reflection, becomes something new.</p>
        <span className="interaction-note"><MoveHorizontal size={19} /> MOVE THE LIGHT. CHANGE THE MOOD.</span>
      </div>
      <div className="light-object" style={{ "--beam": `${light}%`, "--exposure": 0.32 + light * 0.0088 } as CSSProperties}>
        <Picture name="sculpture" alt="Editorial brass sculpture used in an interactive lighting study" />
        <div className="light-beam" aria-hidden="true" />
        <div className="lab-cross top-left" aria-hidden="true">+</div>
        <div className="lab-cross bottom-right" aria-hidden="true">+</div>
        <span className="lab-mark">AURELIO<br /> MATERIAL STUDY 001</span>
        <span className="lab-value" aria-hidden="true">{String(light).padStart(2, "0")}<small> / LIGHT</small></span>
        <label className="light-control">
          <span>SHADOW</span>
          <input
            aria-label="Move the light across the material study"
            aria-valuetext={`${light}% light`}
            type="range" min="0" max="100" step="1" value={light}
            onChange={(event) => setLight(Number(event.target.value))}
            onPointerDown={(event) => {
              if (event.button !== 0) return;
              event.preventDefault();
              event.currentTarget.focus({ preventScroll: true });
              event.currentTarget.setPointerCapture(event.pointerId);
              moveLight(event);
            }}
            onPointerMove={(event) => {
              if (event.currentTarget.hasPointerCapture(event.pointerId)) moveLight(event);
            }}
            onPointerUp={(event) => {
              if (event.currentTarget.hasPointerCapture(event.pointerId)) {
                moveLight(event);
                event.currentTarget.releasePointerCapture(event.pointerId);
              }
            }}
          />
          <span>GLOW</span>
        </label>
      </div>
    </section>
  );
}
