import { brand, commissionStages } from "../lib/brand";
import { collections } from "../lib/brand-content";
import { useState } from "react";
import { useSearchParams } from "react-router";
import {
  ArrowUpRight,
  Building2,
  Gift,
  Store,
  PenTool,
  MessageCircle,
  BookOpen,
  Plus,
} from "lucide-react";
import { Link } from "react-router";
import { pages } from "../lib/help-content";
import { PageIntro, Picture, Field, Success } from "../components/ui";
import { request, useStore } from "../lib/store";
export const meta = () => [
  { title: "Bulk enquiries — Aurelio" },
  {
    name: "description",
    content:
      "Trade, hospitality, gifting and bespoke commissions from Aurelio by AF International — handcrafted metal and wood from Moradabad, exported worldwide.",
  },
];

/* The questions trade buyers ask first. Answers come from the FAQ page so the
   two can never drift apart. */
const tradeQuestions = [
  "Is there a minimum order quantity?",
  "What are your lead times?",
  "Can I customize a piece?",
  "Do you ship internationally?",
];
const tradeAnswers = tradeQuestions
  .map((q) => pages.faq?.sections.find(([question]) => question === q))
  .filter((entry): entry is [string, string] => !!entry);

const whatsappBrief = `${brand.whatsapp}?text=${encodeURIComponent(
  "Hello Aurelio — I'd like to discuss a bulk / trade enquiry.",
)}`;
export default function Bulk() {
  const [params] = useSearchParams();
  const { cart, products } = useStore();
  const selected =
    params.get("from") === "cart"
      ? cart
          .map((line) => ({
            ...line,
            product: products.find((p) => p.id === line.productId)!,
          }))
          .filter((line) => line.product)
      : [];
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [reference, setReference] = useState("");
  const [key] = useState(() => globalThis.crypto.randomUUID());
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const data = Object.fromEntries(new FormData(e.currentTarget));
      const result = await request("/api/enquiries", {
        method: "POST",
        body: JSON.stringify({
          ...data,
          items: selected.map((line) => ({
            productId: line.productId,
            quantity: line.quantity,
          })),
          idempotencyKey: key,
        }),
      });
      setReference(result.reference);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <PageIntro title="Bulk enquiries">
        <p>Trade, hospitality, gifting and bespoke work.</p>
      </PageIntro>
      <div className="bulk-hero container">
        <Picture
          name="brand/decor"
          alt="Brass vessels and decor displayed in a boutique interior"
          eager
        />
        <div>
          <h2>
            Let’s make
            <br /> <em>something together.</em>
          </h2>
        </div>
      </div>
      <section className="section container">
        <div className="use-cases">
          {[
            [Building2, "Hospitality & interiors", "For spaces with a story."],
            [Gift, "Corporate & occasion gifting", "Gifts worth keeping."],
            [Store, "Retail & wholesale", "A range for your store."],
            [PenTool, "Bespoke projects", "Made to your idea."],
          ].map(([Icon, title, copy]: any) => (
            <div key={title}>
              <Icon size={26} />
              <h3>{title}</h3>
              <p>{copy}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="form-section container">
        <div className="form-aside">
          {!!selected.length && (
            <div className="address-card">
              <p className="eyebrow">YOUR SELECTED OBJECTS</p>
              {selected.map((line) => (
                <p key={line.productId}>
                  {line.product.name} · {line.product.finish} × {line.quantity}
                </p>
              ))}
              <p>Your bag stays saved. Add quantities in the brief.</p>
            </div>
          )}
          <h2>
            Tell us
            <br /> your <em>idea.</em>
          </h2>
          <p>Quantities, finishes, timing. An early idea is fine.</p>
          <ol className="process-list">
            {commissionStages.map((stage, i) => (
              <li key={stage}>
                <span>0{i + 1}</span>
                {stage}
                <img
                  src={`/images/stages/${stage.toLowerCase()}.webp`}
                  alt=""
                  width={700}
                  height={170}
                  loading="lazy"
                  decoding="async"
                />
              </li>
            ))}
          </ol>
          <p className="brand-contact">
            <a href={`mailto:${brand.tradeEmail}`}>{brand.tradeEmail}</a>
            <a href={brand.telephone}>{brand.phone}</a>
          </p>
          <div className="trade-shortcuts">
            <a
              className="trade-shortcut"
              href={whatsappBrief}
              target="_blank"
              rel="noreferrer"
            >
              <MessageCircle size={18} />
              <span>
                Prefer to talk?
                <small>WhatsApp the trade desk</small>
              </span>
              <ArrowUpRight size={16} />
            </a>
            <Link
              className="trade-shortcut"
              to="/contact?topic=Catalogue%20request"
            >
              <BookOpen size={18} />
              <span>
                Request the catalogue
                <small>Collections and finishes</small>
              </span>
              <ArrowUpRight size={16} />
            </Link>
          </div>
          <p className="muted">
            Minimums, samples and lead times are confirmed per order. An enquiry
            is not a purchase.
          </p>
        </div>
        {reference ? (
          <Success title="Thank you.">
            <p>We’ve saved your enquiry.</p>
            <p className="reference">{reference}</p>
            <p>
              Keep this reference. Email notifications are off in this preview.
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
              <Field
                label="Company or studio"
                name="company"
                required={false}
                autoComplete="organization"
              />
              <Field
                label="Country"
                name="country"
                autoComplete="country-name"
              />
              <label className="field">
                <span>Approximate quantity</span>
                <input
                  name="quantity"
                  type="number"
                  inputMode="numeric"
                  min={1}
                  step={1}
                  required
                />
              </label>
              <label className="field">
                <span>
                  Object or collection <small>(optional)</small>
                </span>
                <input
                  name="product"
                  list="brief-collections"
                  defaultValue={params.get("product") || ""}
                />
                <datalist id="brief-collections">
                  {collections.map((c) => (
                    <option key={c.slug} value={c.name} />
                  ))}
                </datalist>
              </label>
            </div>
            <label className="field">
              <span>Your project</span>
              <textarea
                name="message"
                defaultValue={(params.get("brief") || "").slice(0, 4000)}
                minLength={10}
                maxLength={4000}
                required
                rows={5}
                placeholder="Materials, size, finish, timeline."
              />
            </label>
            <input
              className="honey-field"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
            />
            <label className="checkbox-label">
              <input type="checkbox" required />I agree to be contacted about
              this enquiry.
            </label>
            <p className="form-error" role="alert">
              {error}
            </p>
            <button className="button" disabled={busy}>
              {busy ? "Sending…" : "Send enquiry"}
              <ArrowUpRight size={18} />
            </button>
          </form>
        )}
      </section>
      {!!tradeAnswers.length && (
        <section className="section container trade-faq">
          <div className="section-heading">
            <div>
              <h2>
                Common
                <br /> <em>questions.</em>
              </h2>
            </div>
            <Link className="text-link" to="/faq">
              All questions
              <ArrowUpRight size={17} />
            </Link>
          </div>
          <div className="trade-faq-list">
            {tradeAnswers.map(([question, answer]) => (
              <details key={question}>
                <summary>
                  {question}
                  <Plus size={16} />
                </summary>
                <p>{answer}</p>
              </details>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
