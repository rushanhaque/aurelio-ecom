import { brand } from "../lib/brand";
import { useSearchParams } from "react-router";
import { useState } from "react";
import { Link } from "react-router";
import { ArrowUpRight } from "lucide-react";
import { PageIntro, Field, Success } from "../components/ui";
import { request } from "../lib/store";
export const meta = () => [{ title: "Contact us — Aurelio" }];
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
      <PageIntro eyebrow="A CONVERSATION STARTS HERE" title="Contact us">
        <p>
          Questions about an object, a project, or your order?
          <br /> We’re here to listen.
        </p>
      </PageIntro>
      {/* The two desks, as listed on aurelio.in/contact. */}
      <section
        className="contact-cards container"
        aria-label="Where to reach us"
      >
        <article data-reveal>
          <span className="eyebrow">ATELIER & FOUNDRY</span>
          <h2>The Moradabad Atelier</h2>
          <address>
            {brand.address.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </address>
          <dl>
            <div>
              <dt>Email</dt>
              <dd>
                <a href={`mailto:${brand.email}`}>{brand.email}</a>
              </dd>
            </div>
            <div>
              <dt>Telephone</dt>
              <dd>
                <a href={brand.telephone}>{brand.phone}</a>
              </dd>
            </div>
            <div>
              <dt>Hours</dt>
              <dd>{brand.hours}</dd>
            </div>
          </dl>
          <a
            className="text-link"
            href={brand.map}
            target="_blank"
            rel="noreferrer"
          >
            Open in Maps <ArrowUpRight size={16} />
          </a>
        </article>
        <article data-reveal>
          <span className="eyebrow">COMMISSIONS & EXPORT</span>
          <h2>Enquiries Desk</h2>
          <address>
            <span>Private commissions, trade accounts</span>
            <span>and worldwide export</span>
            <span>Handled from the Moradabad atelier</span>
          </address>
          <dl>
            <div>
              <dt>Email</dt>
              <dd>
                <a href={`mailto:${brand.tradeEmail}`}>{brand.tradeEmail}</a>
              </dd>
            </div>
            <div>
              <dt>Telephone</dt>
              <dd>
                <a href={brand.telephone}>{brand.phone}</a>
              </dd>
            </div>
            <div>
              <dt>Hours</dt>
              <dd>Replies within two working days</dd>
            </div>
          </dl>
          <a
            className="text-link"
            href={brand.whatsapp}
            target="_blank"
            rel="noreferrer"
          >
            WhatsApp the desk <ArrowUpRight size={16} />
          </a>
        </article>
      </section>
      <section className="form-section container">
        <aside className="form-aside">
          <h2>
            Start a
            <br /> <em>conversation.</em>
          </h2>
          <p>
            Private commissions, trade accounts and worldwide export, handled
            from the Moradabad atelier.
          </p>
          <p className="brand-contact">
            <a href={brand.instagram} target="_blank" rel="noreferrer">
              Instagram — @afinternational.in ↗
            </a>
          </p>
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
                <option>Bulk or trade enquiry</option>
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
