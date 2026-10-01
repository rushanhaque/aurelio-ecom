import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { PageIntro } from "../components/ui";
import { request } from "../lib/store";
import { money } from "../lib/catalog";
export const meta = () => [
  { title: "Your private quotation — Aurelio" },
  { name: "robots", content: "noindex,nofollow" },
  { name: "referrer", content: "no-referrer" },
];
export default function Quote() {
  const { id } = useParams();
  const [quote, setQuote] = useState<any>(null);
  const [key, setKey] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    const value =
      new URLSearchParams(location.hash.slice(1)).get("key") ||
      sessionStorage.getItem(`quote-${id}`) ||
      "";
    setKey(value);
    if (value) sessionStorage.setItem(`quote-${id}`, value);
    if (location.hash) history.replaceState(null, "", location.pathname);
    request(`/api/quotes/${id}`, { headers: { "x-quote-key": value } })
      .then(setQuote)
      .catch((e) => setError(e.message));
  }, [id]);
  return (
    <>
      <PageIntro eyebrow="MADE AROUND YOUR VISION" title="Your quotation">
        <p>Your private Aurelio quotation.</p>
      </PageIntro>
      <section className="container account-section">
        <p role="alert" className="form-error">
          {error}
        </p>
        {quote && (
          <div className="cart-layout">
            <div>
              <p className="eyebrow">
                {quote.enquiry} / VERSION {quote.version}
              </p>
              <h2>The details, together.</h2>
              {quote.lines.map((line: any, i: number) => (
                <div className="quote-summary-line" key={i}>
                  <div>
                    <h3>{line.description}</h3>
                    <p>
                      {line.quantity} × {money(line.unitPrice, quote.currency)}
                    </p>
                  </div>
                  <strong>
                    {money(line.quantity * line.unitPrice, quote.currency)}
                  </strong>
                </div>
              ))}
              <h3>Terms & production</h3>
              <p className="preserve-lines">{quote.terms}</p>
            </div>
            <aside className="order-summary">
              <div className="summary-row">
                <span>Objects</span>
                <span>{money(quote.subtotal, quote.currency)}</span>
              </div>
              <div className="summary-row">
                <span>Freight</span>
                <span>{money(quote.freight, quote.currency)}</span>
              </div>
              <div className="summary-row">
                <span>Tax</span>
                <span>{money(quote.tax, quote.currency)}</span>
              </div>
              <div className="summary-row total">
                <span>Total</span>
                <strong>{money(quote.total, quote.currency)}</strong>
              </div>
              <p>
                Valid until {new Date(quote.expiresAt).toLocaleDateString()}
              </p>
              {quote.status === "accepted" ? (
                <div role="status">
                  <h3>Your response is saved.</h3>
                  <p>Draft reference: {quote.draftId}</p>
                  <p>
                    The studio will confirm the next steps. No payment has been
                    collected and no stock is reserved.
                  </p>
                </div>
              ) : !quote.current || quote.expired ? (
                <p>
                  This quote has expired or been replaced. Contact the studio
                  for an updated proposal.
                </p>
              ) : (
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setBusy(true);
                    setError("");
                    try {
                      const result = await request(`/api/quotes/${id}/accept`, {
                        method: "POST",
                        headers: { "x-quote-key": key },
                        body: JSON.stringify({ consent: true }),
                      });
                      setQuote({
                        ...quote,
                        status: "accepted",
                        draftId: result.draftId,
                      });
                    } catch (e) {
                      setError((e as Error).message);
                    } finally {
                      setBusy(false);
                    }
                  }}
                >
                  <label className="checkbox-label">
                    <input type="checkbox" required />I have reviewed this
                    proposal and would like the studio to proceed with an order
                    draft.
                  </label>
                  <p>
                    This records your request. The studio must confirm the order
                    and arrange payment separately.
                  </p>
                  <button className="button" disabled={busy}>
                    {busy ? "Saving…" : "Request order draft"}
                  </button>
                </form>
              )}
              <Link to="/contact" className="text-link">
                Speak with the studio ↗
              </Link>
            </aside>
          </div>
        )}
      </section>
    </>
  );
}
