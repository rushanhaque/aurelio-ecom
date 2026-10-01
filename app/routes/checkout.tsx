import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router";
import { LockKeyhole, ArrowUpRight } from "lucide-react";
import {
  PageIntro,
  EmptyState,
  Field,
  Picture,
  Settling,
} from "../components/ui";
import { useStore, request } from "../lib/store";
import { money, cartTotal } from "../lib/catalog";
export const meta = () => [
  { title: "Checkout — Aurelio" },
  { name: "robots", content: "noindex" },
];
export default function Checkout() {
  const [customer, setCustomer] = useState<any>(null),
    [addressId, setAddressId] = useState("");
  useEffect(() => {
    request("/api/session")
      .then((result) => setCustomer(result.customer))
      .catch(() => {});
  }, []);
  const savedAddress = customer?.addresses?.find(
    (address: any) => address.id === addressId,
  );
  const { cart, products, currency, clear, ready } = useStore();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const [key] = useState(() => globalThis.crypto.randomUUID());
  const shipping = { INR: 35000, USD: 1800, GBP: 1400, EUR: 1700 }[currency];
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const fields = Object.fromEntries(new FormData(e.currentTarget));
      const r = await request("/api/checkout", {
        method: "POST",
        body: JSON.stringify({
          ...fields,
          idempotencyKey: key,
          currency,
          items: cart,
          previewConsent: true,
        }),
      });
      sessionStorage.setItem(`order-${r.reference}`, r.accessToken);
      clear();
      navigate(`/orders/${r.reference}`);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <PageIntro eyebrow="THE FINAL DETAILS" title="Checkout" />
      {!ready ? (
        <div className="container section-start">
          <Settling label="Bringing your bag across…" />
        </div>
      ) : !cart.length ? (
        <div className="container section-start">
          <EmptyState title="Your bag comes first.">
            Add an object before continuing to checkout.
          </EmptyState>
        </div>
      ) : (
        <section className="container checkout-layout">
          <form className="editorial-form" onSubmit={submit}>
            <div className="preview-banner">
              <LockKeyhole size={20} />
              <div>
                <strong>Preview checkout</strong>
                <p>
                  No payment is collected. This creates an unpaid test order;
                  nothing will be shipped. Delivery figures are illustrative,
                  and tax is not calculated.
                </p>
              </div>
            </div>
            <h2>Your details</h2>
            {!!customer?.addresses?.length && (
              <label className="field">
                <span>Use a saved delivery address</span>
                <select
                  value={addressId}
                  onChange={(e) => setAddressId(e.target.value)}
                >
                  <option value="">Enter a new address</option>
                  {customer.addresses.map((address: any) => (
                    <option value={address.id} key={address.id}>
                      {address.label} — {address.city}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <div key={addressId} className="editorial-form">
              <Field
                label="Email address"
                name="email"
                type="email"
                autoComplete="email"
                defaultValue={customer?.email}
              />
              <Field
                label="Full name"
                name="name"
                autoComplete="name"
                defaultValue={savedAddress?.name || customer?.name}
              />
              <h2>Delivery address</h2>
              <Field
                label="Street address"
                name="address"
                autoComplete="street-address"
                defaultValue={
                  savedAddress
                    ? [savedAddress.address, savedAddress.region]
                        .filter(Boolean)
                        .join(", ")
                    : undefined
                }
              />
              <div className="form-grid">
                <Field
                  label="City"
                  name="city"
                  autoComplete="address-level2"
                  defaultValue={savedAddress?.city}
                />
                <Field
                  label="Postal code"
                  name="postalCode"
                  autoComplete="postal-code"
                  defaultValue={savedAddress?.postalCode}
                />
              </div>
              <label className="field">
                <span>Country</span>
                <select
                  name="country"
                  autoComplete="country"
                  defaultValue={savedAddress?.country || "IN"}
                >
                  <option value="IN">India</option>
                  <option value="US">United States</option>
                  <option value="GB">United Kingdom</option>
                  <option value="DE">Germany</option>
                  <option value="FR">France</option>
                </select>
              </label>
            </div>
            <label className="checkbox-label">
              <input type="checkbox" required />I understand this is an unpaid
              preview order and no products will be shipped.
            </label>
            <p className="form-error" role="alert">
              {error}
            </p>
            <button className="button" disabled={busy}>
              {busy ? "Saving your order…" : "Place preview order"}
              <ArrowUpRight size={18} />
            </button>
            <p className="muted">
              By proceeding, you acknowledge the{" "}
              <Link to="/terms">preview terms</Link> and{" "}
              <Link to="/privacy">privacy notice</Link>.
            </p>
          </form>
          <aside className="order-summary">
            <p className="eyebrow">YOUR SELECTION</p>
            {cart.map((l) => {
              const p = products.find((p) => p.id === l.productId)!;
              return (
                <div className="checkout-line" key={p.id}>
                  <Picture name={p.image} alt={p.name} sizes="120px" />
                  <span>
                    {p.name}
                    <small>Quantity {l.quantity}</small>
                  </span>
                  <strong>
                    {money(p.prices[currency] * l.quantity, currency)}
                  </strong>
                </div>
              );
            })}
            <div className="summary-row">
              <span>Subtotal</span>
              <span>
                {money(cartTotal(cart, products, currency), currency)}
              </span>
            </div>
            <div className="summary-row">
              <span>Illustrative delivery</span>
              <span>{money(shipping, currency)}</span>
            </div>
            <div className="summary-row total">
              <span>Preview total</span>
              <strong>
                {money(
                  cartTotal(cart, products, currency) + shipping,
                  currency,
                )}
              </strong>
            </div>
            <p>No money is due or collected.</p>
          </aside>
        </section>
      )}
    </>
  );
}
