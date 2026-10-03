import { brand, commissionStages } from "../lib/brand";
import { collections } from "../lib/brand-content";
import { Children, useEffect, useState, type ReactNode } from "react";
import { useLoaderData, useSearchParams } from "react-router";
import { ArrowUpRight, MessageCircle, BookOpen, Plus } from "lucide-react";
import { Link } from "react-router";
import { pages } from "../lib/help-content";
import { Picture, Field, Success } from "../components/ui";
import { request, useStore } from "../lib/store";
import "../storefront.css";
import "../enquiry-card.css";
import "../bulk-sections.css";
import { MakingStory } from "../components/storytelling";
import {
  AurelioStandard,
  OriginalAtelier,
  SelectedWorks,
} from "../components/original-sections";
import { MaterialAtelier } from "../components/material-atelier";
import { Heritage } from "../components/heritage";
import {
  MakersLens,
  LightStudy,
  Studies,
  YourLine,
} from "../components/atelier-experiments";
import { homeContent } from "../lib/home-content";
import { database } from "../../server/db";
import { frontendPreview } from "../../server/preview-mode";
import { CommissionScene } from "../components/home-sections";
export const meta = () => [
  { title: "Export & bulk orders — Aurelio by AF International" },
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

const processNotes = [
  "Share quantities, finishes and timing.",
  "We draw and cost your range.",
  "Approve a sample before production.",
  "Raised, cast and forged by hand.",
  "Polished, lacquered and checked.",
  "Packed for freight and shipped.",
];
const whatsappBrief = `${brand.whatsapp}?text=${encodeURIComponent(
  "Hello Aurelio — I'd like to discuss a bulk / trade enquiry.",
)}`;
/* The material copy is editable in the CMS under the "home" slug. */
export async function loader() {
  if (frontendPreview()) return { homeCopy: homeContent };
  const { db } = await database();
  const saved = await db.collection("content").findOne({ slug: "home" });
  return { homeCopy: (saved?.published || homeContent) as typeof homeContent };
}
/* On phones the header has no room for the enquiry button, so a pill floats
   at the foot of the screen — shown past the hero, hidden once the form is
   on screen. */
function FloatingEnquiry() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const hero = document.querySelector(".trade-hero");
    const form = document.getElementById("enquire");
    if (!hero || !form) return;
    let pastHero = false,
      atForm = false;
    const sync = () => setShow(pastHero && !atForm);
    const watchHero = new IntersectionObserver(([e]) => {
      pastHero = !e.isIntersecting;
      sync();
    });
    const watchForm = new IntersectionObserver(
      ([e]) => {
        atForm = e.isIntersecting;
        sync();
      },
      { rootMargin: "0px 0px -20% 0px" },
    );
    watchHero.observe(hero);
    watchForm.observe(form);
    return () => {
      watchHero.disconnect();
      watchForm.disconnect();
    };
  }, []);
  return (
    <a
      href="#enquire"
      className={`floating-enquiry ${show ? "is-shown" : ""}`}
      aria-hidden={!show}
      tabIndex={show ? 0 : -1}
    >
      Start an enquiry <ArrowUpRight size={16} />
    </a>
  );
}
export default function Bulk() {
  const { homeCopy } = useLoaderData<typeof loader>();
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
      <BulkSections>
        <section className="trade-hero" aria-labelledby="trade-title">
          <Picture
            name="brand/furniture"
            alt="Handcrafted metal and wood furniture in a sunlit room"
            sizes="100vw"
            eager
          />
          <div className="trade-hero-veil" aria-hidden="true" />
          <div className="trade-hero-body container">
            <h1 id="trade-title">
              Export &amp;
              <br /> <em>bulk orders.</em>
            </h1>
            <p>
              Metal and wood, made by hand in Moradabad for retailers, hotels
              and gifting programmes worldwide.
            </p>
            <div className="trade-hero-actions">
              <a href="#enquire" className="sf-button sf-solid">
                Start an enquiry <ArrowUpRight size={17} />
              </a>
              <Link
                to="/contact?topic=Catalogue%20request"
                className="sf-button sf-glass"
              >
                Request the catalogue <ArrowUpRight size={17} />
              </Link>
            </div>
          </div>
        </section>
        <MakingStory />
        <SelectedWorks limit={6} />
        <Studies>
          <LightStudy />
        </Studies>
        <OriginalAtelier />
        <MaterialAtelier copy={homeCopy} />
        <Heritage />
        <AurelioStandard />
        <Studies>
          <MakersLens />
        </Studies>
        <Studies>
          <YourLine />
        </Studies>
        <section
          className="trade-process container"
          id="process"
          aria-labelledby="process-title"
        >
          <h2 id="process-title" className="trade-kicker">
            From brief <em>to container.</em>
          </h2>
          <ol>
            {commissionStages.map((stage, i) => (
              <li key={stage}>
                <img
                  src={`/images/stages/${stage.toLowerCase()}.webp`}
                  alt=""
                  width={700}
                  height={170}
                  loading="lazy"
                  decoding="async"
                />
                <span>0{i + 1}</span>
                <strong>{stage}</strong>
                <small>{processNotes[i]}</small>
              </li>
            ))}
          </ol>
        </section>
        <section className="section container trade-serve">
          <h2 className="trade-kicker">
            Who we <em>make for.</em>
          </h2>
          <div className="serve-grid">
            {[
              [
                "Hospitality & interiors",
                "Lighting and furniture for hotels, restaurants and residences.",
                "brand/lightings",
              ],
              [
                "Corporate gifting",
                "Gifts worth keeping, branded or engraved.",
                "brand/accessories",
              ],
              [
                "Retail & wholesale",
                "A ready range or your own line for your store.",
                "brand/kitchenware",
              ],
              [
                "Bespoke projects",
                "Your drawing, made in metal and wood.",
                "brand/bespoke",
              ],
            ].map(([title, copy, image]) => (
              <a key={title} href="#enquire" className="serve-card">
                <Picture
                  name={image}
                  alt=""
                  sizes="(max-width: 900px) 50vw, 25vw"
                />
                <span className="serve-veil" aria-hidden="true" />
                <span className="serve-body">
                  <strong>{title}</strong>
                  <small>{copy}</small>
                  <span className="serve-arrow" aria-hidden="true">
                    <ArrowUpRight size={16} />
                  </span>
                </span>
              </a>
            ))}
          </div>
        </section>
        <section
          className="enquiry-feature container"
          id="enquire"
          aria-labelledby="enquiry-title"
        >
          <div className="enquiry-card">
            <div className="form-aside">
              <span className="enquiry-kicker">
                LET’S MAKE SOMETHING EXCEPTIONAL
              </span>
              {!!selected.length && (
                <div className="address-card">
                  <p className="eyebrow">YOUR SELECTED OBJECTS</p>
                  {selected.map((line) => (
                    <p key={line.productId}>
                      {line.product.name} · {line.product.finish} ×{" "}
                      {line.quantity}
                    </p>
                  ))}
                  <p>Your bag stays saved. Add quantities in the brief.</p>
                </div>
              )}
              <h2 id="enquiry-title">
                Tell us
                <br /> your <em>idea.</em>
              </h2>
              <p>Quantities, finishes, timing. An early idea is fine.</p>
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
                Minimums, samples and lead times are confirmed per order. An
                enquiry is not a purchase.
              </p>
            </div>
            <div className="enquiry-form-panel">
              {reference ? (
                <Success title="Thank you.">
                  <p>We’ve saved your enquiry.</p>
                  <p className="reference">{reference}</p>
                  <p>
                    Keep this reference. Email notifications are off in this
                    preview.
                  </p>
                </Success>
              ) : (
                <form className="editorial-form" onSubmit={submit}>
                  <div className="enquiry-form-heading">
                    <span className="enquiry-kicker">
                      YOUR NEXT PROJECT STARTS HERE
                    </span>
                    <h3>Share your brief.</h3>
                    <p>
                      A few details are all we need to begin the conversation.
                    </p>
                  </div>
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
                        key={params.get("product") || ""}
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
                      key={params.get("brief") || ""}
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
                    <input type="checkbox" required />I agree to be contacted
                    about this enquiry.
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
            </div>
          </div>
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
        <CommissionScene />
      </BulkSections>
      <FloatingEnquiry />
    </>
  );
}

/** Number only visible content sections, including each individual study. */
function BulkSections({ children }: { children: ReactNode }) {
  return (
    <div className="bulk-sections">
      {Children.toArray(children).map((section, index) => (
        <div
          key={index}
          id={index === 1 ? "collections" : undefined}
          className={`bulk-band ${index % 2 === 0 ? "bulk-band--white" : "bulk-band--green"}`}
          data-section-number={index + 1}
        >
          {section}
        </div>
      ))}
    </div>
  );
}
