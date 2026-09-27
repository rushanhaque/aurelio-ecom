import { brand } from "../lib/brand";
import { useSearchParams } from "react-router";
import { useState } from "react";
import { Link } from "react-router";
import { ArrowUpRight } from "lucide-react";
import { PageIntro, Field, Success } from "../components/ui";
import { request } from "../lib/store";
export const meta = () => [{ title: "Contact the studio — Aurelio" }];
export default function Contact() {
  const [params] = useSearchParams();
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [reference, setReference] = useState("");
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const r = await request("/api/contact", {
        method: "POST",
        body: JSON.stringify(Object.fromEntries(new FormData(e.currentTarget))),
      });
      setReference(r.reference);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <PageIntro
        eyebrow="A CONVERSATION STARTS HERE"
        title="A little help. A new idea."
      >
        <p>
          Questions about an object, a project, or your order?
          <br /> We’re here to listen.
        </p>
      </PageIntro>
      <section className="form-section container">
        <aside className="form-aside">
          <h2>
            Let’s talk
            <br /> <em>beautiful things.</em>
          </h2>
          <p>
            Private commissions, trade accounts and worldwide export, handled
            from the Moradabad atelier.
          </p>
          <address className="brand-contact">
            {brand.address.map((line) => (
              <div key={line}>{line}</div>
            ))}
            <p>{brand.hours}</p>
            <a href={brand.telephone}>{brand.phone}</a>
            <a href={`mailto:${brand.email}`}>{brand.email}</a>
            <a href={`mailto:${brand.tradeEmail}`}>
              Commissions & export: {brand.tradeEmail}
            </a>
            <a href={brand.map} target="_blank" rel="noreferrer">
              Find the atelier ↗
            </a>
            <a href={brand.whatsapp} target="_blank" rel="noreferrer">
              Talk to us on WhatsApp ↗
            </a>
          </address>
          <div className="contact-links">
            <Link to="/bulk-orders">
              A bulk or bespoke project
              <ArrowUpRight size={19} />
            </Link>
            <Link to="/track-order">
              An existing order
              <ArrowUpRight size={19} />
            </Link>
            <Link to="/faq">
              A quick question
              <ArrowUpRight size={19} />
            </Link>
          </div>
        </aside>
        {reference ? (
          <Success title="Your note is with us.">
            <p>
              Saved to the studio inbox. Reference: <strong>{reference}</strong>
              .
            </p>
            <p>
              Email replies will be available once the studio’s email service is
              connected.
            </p>
          </Success>
        ) : (
          <form className="editorial-form" onSubmit={submit}>
            <div className="form-grid">
              <Field label="Your name" name="name" autoComplete="name" />
              <Field
                label="Email address"
                name="email"
                type="email"
                autoComplete="email"
              />
            </div>
            <label className="field">
              <span>What can we help with?</span>
              <select
                name="topic"
                defaultValue={params.get("topic") || "Product question"}
              >
                <option>Product question</option>
                <option>Order support</option>
                <option>Shipping & returns</option>
                <option>Press & collaborations</option>
                <option>Catalogue request</option>
                <option>Privacy request</option>
                <option>Something else</option>
              </select>
            </label>
            <label className="field">
              <span>Your message</span>
              <textarea
                name="message"
                required
                minLength={10}
                maxLength={4000}
                rows={6}
              />
            </label>
            <p className="form-error" role="alert">
              {error}
            </p>
            <button className="button" disabled={busy}>
              {busy ? "Sending…" : "Send your note"}
              <ArrowUpRight size={18} />
            </button>
          </form>
        )}
      </section>
    </>
  );
}
