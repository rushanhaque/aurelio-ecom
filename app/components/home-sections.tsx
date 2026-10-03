import { Link } from "react-router";
import { ArrowUpRight } from "lucide-react";
import { Picture } from "./ui";
import { ReadingStatement } from "./storytelling";
import "../immersive.css";
import "../home-hero.css";

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
const services = [
  {
    to: "/shop",
    cursor: "SHOP",
    index: "01",
    label: "The Shop",
    image: "brand/lightings",
    alt: "Handcrafted brass lighting in a softly lit room",
    title: ["Shop the", "collection."],
    copy: "Furniture, lighting and décor in metal and wood.",
    cta: "Enter the shop",
  },
  {
    to: "/bulk-orders#enquire",
    cursor: "ENQUIRE",
    index: "02",
    label: "Export & Trade",
    image: "brand/furniture",
    alt: "A collection of handcrafted metal and wood furniture",
    title: ["Export &", "bulk orders."],
    copy: "For retailers, hotels and gifting. We make and ship worldwide.",
    cta: "Start an enquiry",
  },
];
export function ServicesSplit() {
  return (
    <section
      className="services-split"
      id="services"
      aria-labelledby="services-title"
    >
      <header className="services-head container" data-reveal>
        <h2 id="services-title">
          One workshop. <em>Two doors.</em>
        </h2>
        <p>From a single piece to a full container.</p>
      </header>
      <div className="services-grid">
        {services.map((s) => (
          <Link
            key={s.to}
            to={s.to}
            className="service-panel"
            data-cursor={s.cursor}
            data-reveal
          >
            <Picture
              name={s.image}
              alt={s.alt}
              sizes="(max-width: 860px) 100vw, 50vw"
            />
            <span className="service-veil" aria-hidden="true" />
            <span className="service-body">
              <span className="service-title">
                {s.title[0]} <em>{s.title[1]}</em>
              </span>
              <span className="service-copy">{s.copy}</span>
              <span className="service-cta">
                {s.cta}
                <span className="door-arrow">
                  <ArrowUpRight size={18} />
                </span>
              </span>
            </span>
          </Link>
        ))}
      </div>
    </section>
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
        <h2>
          Let’s make
          <br /> <em>an impression.</em>
        </h2>
        <div className="commission-bottom">
          <p>One piece for your home, or a range for your business.</p>
          <div className="commission-links">
            <Link to="/shop" className="commission-link" data-magnetic>
              <span>VISIT THE SHOP</span>
              <ArrowUpRight size={28} />
            </Link>
            <Link to="/bulk-orders#enquire" className="commission-link" data-magnetic>
              <span>START AN ENQUIRY</span>
              <ArrowUpRight size={28} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
