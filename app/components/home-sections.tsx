import { Link } from "react-router";
import { shopLink, shopIsExternal } from "../lib/brand";
import { ArrowUpRight } from "lucide-react";
import { Picture } from "./ui";
import { ReadingStatement } from "./storytelling";
import "../immersive.css";
import "../home-hero.css";
import { Words } from "./motion-text";

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
export function OpeningNote() {
  return (
    <section className="opening-note container" id="prologue">
      <ReadingStatement />
      <div className="opening-foot">
        <Orbit />
        <p>Made by hand in Moradabad since 2008.</p>
      </div>
    </section>
  );
}

export function CommissionScene() {
  return (
    <section className="commission-scene" id="your-chapter">
      <Picture
        name="brand/decor"
        alt="Brass vessels and decor displayed in a boutique interior"
        sizes="100vw"
      />
      <div className="commission-veil" />
      <div className="commission-content">
        <h2 data-reveal="words">
          <Words>
          Let’s make
          <br /> <em>an impression.</em></Words>
        </h2>
        <div className="commission-bottom">
          <p>One piece for your home, or a range for your business.</p>
          <div className="commission-links">
            <a
              href={shopLink}
              className="commission-link"
              {...(shopIsExternal && { target: "_blank", rel: "noopener" })}
            >
              <span>VISIT THE SHOP</span>
              <ArrowUpRight size={28} />
            </a>
            <Link to="/bulk-orders#enquire" className="commission-link">
              <span>START AN ENQUIRY</span>
              <ArrowUpRight size={28} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
