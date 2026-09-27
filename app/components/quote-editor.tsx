import { useState } from "react";
import { request } from "../lib/store";
import { currencies } from "../lib/catalog";
export function QuoteEditor({
  reference,
  headers,
  refresh,
}: {
  reference: string;
  headers: Record<string, string>;
  refresh: () => Promise<void>;
}) {
  const [lines, setLines] = useState([
    { id: 0, description: "", quantity: 1, price: "" },
  ]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [url, setUrl] = useState("");
  return (
    <details className="quote-editor">
      <summary>Create a versioned quotation</summary>
      <form
        className="editorial-form"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setError("");
          const values = Object.fromEntries(new FormData(e.currentTarget));
          try {
            const result = await request("/api/admin/quotes", {
              method: "POST",
              headers,
              body: JSON.stringify({
                enquiry: reference,
                currency: values.currency,
                validDays: Number(values.validDays),
                terms: values.terms,
                freight: Math.round(Number(values.freight) * 100),
                tax: Math.round(Number(values.tax) * 100),
                lines: lines.map((line) => ({
                  description: line.description,
                  quantity: line.quantity,
                  unitPrice: Math.round(Number(line.price) * 100),
                })),
              }),
            });
            setUrl(result.url);
            await refresh();
          } catch (e) {
            setError((e as Error).message);
          } finally {
            setBusy(false);
          }
        }}
      >
        <p>
          Use approved prices, freight, taxes and payment terms. Creating a new
          version replaces the previous open quote. This does not send an email
          or collect payment.
        </p>
        <div className="form-grid">
          <label className="field">
            <span>Currency</span>
            <select name="currency">
              {currencies.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Valid for (days)</span>
            <input
              name="validDays"
              type="number"
              min={1}
              max={90}
              defaultValue={14}
              required
            />
          </label>
        </div>
        {lines.map((line, i) => (
          <fieldset key={line.id} className="quote-line">
            <legend>Line {i + 1}</legend>
            <label className="field">
              <span>Description / specifications</span>
              <input
                required
                minLength={2}
                maxLength={250}
                value={line.description}
                onChange={(e) =>
                  setLines((all) =>
                    all.map((l) =>
                      l.id === line.id
                        ? { ...l, description: e.target.value }
                        : l,
                    ),
                  )
                }
              />
            </label>
            <div className="form-grid">
              <label className="field">
                <span>Quantity</span>
                <input
                  required
                  type="number"
                  min={1}
                  max={100000}
                  value={line.quantity}
                  onChange={(e) =>
                    setLines((all) =>
                      all.map((l) =>
                        l.id === line.id
                          ? { ...l, quantity: Number(e.target.value) }
                          : l,
                      ),
                    )
                  }
                />
              </label>
              <label className="field">
                <span>Unit price (full currency amount)</span>
                <input
                  required
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={line.price}
                  onChange={(e) =>
                    setLines((all) =>
                      all.map((l) =>
                        l.id === line.id ? { ...l, price: e.target.value } : l,
                      ),
                    )
                  }
                />
              </label>
            </div>
            {lines.length > 1 && (
              <button
                type="button"
                className="text-link"
                onClick={() =>
                  setLines((all) => all.filter((l) => l.id !== line.id))
                }
              >
                Remove line
              </button>
            )}
          </fieldset>
        ))}
        <button
          type="button"
          className="text-link"
          disabled={lines.length >= 30}
          onClick={() =>
            setLines((all) => [
              ...all,
              {
                id: Math.max(...all.map((l) => l.id)) + 1,
                description: "",
                quantity: 1,
                price: "",
              },
            ])
          }
        >
          Add line +
        </button>
        <div className="form-grid">
          <label className="field">
            <span>Freight amount</span>
            <input
              required
              name="freight"
              type="number"
              min="0"
              step="0.01"
              defaultValue="0"
            />
          </label>
          <label className="field">
            <span>Tax amount</span>
            <input
              required
              name="tax"
              type="number"
              min="0"
              step="0.01"
              defaultValue="0"
            />
          </label>
        </div>
        <label className="field">
          <span>Payment, delivery, duty and production terms</span>
          <textarea
            name="terms"
            minLength={10}
            maxLength={4000}
            rows={5}
            required
          />
        </label>
        <p className="form-error" role="alert">
          {error}
        </p>
        <button className="button button-outline" disabled={busy}>
          {busy ? "Creating…" : "Create secure quote"}
        </button>
        {url && (
          <div className="address-card" role="status">
            <p>
              Quote created. Keep this link private and share it with the
              intended customer.
            </p>
            <a href={url} className="text-link">
              Open quote ↗
            </a>
            <label className="field">
              <span>Secure customer link</span>
              <input
                readOnly
                value={url}
                onFocus={(e) => e.currentTarget.select()}
              />
            </label>
          </div>
        )}
      </form>
    </details>
  );
}
