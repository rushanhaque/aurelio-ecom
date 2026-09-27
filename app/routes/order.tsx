import { useEffect, useState } from "react";
import { useParams, Link } from "react-router";
import { Check, Copy, ArrowUpRight } from "lucide-react";
import { PageIntro, Picture } from "../components/ui";
import { request, useStore } from "../lib/store";
import { money } from "../lib/catalog";
export const meta = () => [
  { title: "Your order — Aurelio" },
  { name: "robots", content: "noindex" },
];
export default function Order() {
  const { reference } = useParams();
  const { notify } = useStore();
  const [order, setOrder] = useState<any>(null),
    [error, setError] = useState(""),
    [token, setToken] = useState("");
  const [supportBusy, setSupportBusy] = useState(false),
    [supportError, setSupportError] = useState("");
  useEffect(() => {
    const t = sessionStorage.getItem(`order-${reference}`) || "";
    setToken(t);
    request(`/api/orders/${reference}`, { headers: { "x-order-token": t } })
      .then(setOrder)
      .catch((e) => setError(e.message));
  }, [reference]);
  return (
    <>
      <PageIntro
        eyebrow="THANK YOU FOR EXPLORING AURELIO"
        title={order ? "Beautifully chosen." : "Your order."}
      >
        <p>
          {order
            ? "Your unpaid preview order has been saved. Nothing has been charged or shipped."
            : error || "Gathering the details…"}
        </p>
      </PageIntro>
      <section className="container order-page">
        {order && (
          <>
            <div className="order-status">
              <Check size={24} />
              <span>PREVIEW ORDER SAVED</span>
              <strong>{reference}</strong>
            </div>
            <div className="cart-layout">
              <div>
                {order.lines.map((l: any) => (
                  <div className="checkout-line" key={l.productId}>
                    <Picture name={l.image} alt={l.name} />
                    <span>
                      {l.name}
                      <small>
                        {l.finish} · Quantity {l.quantity}
                      </small>
                    </span>
                    <strong>
                      {money(l.unitPrice * l.quantity, order.currency)}
                    </strong>
                  </div>
                ))}
                <div className="order-address">
                  <p className="eyebrow">DELIVERY DETAILS</p>
                  <p>
                    {order.name}
                    <br /> {order.address}
                    <br /> {order.city}, {order.postalCode}
                    <br /> {order.country}
                  </p>
                </div>
                <div className="support-form">
                  <h2>Here for your object.</h2>
                  {order.support ? (
                    <div>
                      <p>Request status: {order.support.status}</p>
                      <p>{order.support.reason}</p>
                      {order.support.customerUpdate && (
                        <p>{order.support.customerUpdate}</p>
                      )}
                      <Link className="text-link" to="/contact">
                        Contact the studio ↗
                      </Link>
                    </div>
                  ) : (
                    <form
                      className="editorial-form"
                      onSubmit={async (e) => {
                        e.preventDefault();
                        setSupportBusy(true);
                        setSupportError("");
                        try {
                          await request("/api/returns", {
                            method: "POST",
                            body: JSON.stringify({
                              ...Object.fromEntries(
                                new FormData(e.currentTarget),
                              ),
                              reference,
                              token,
                            }),
                          });
                          const updated = await request(
                            `/api/orders/${reference}`,
                            { headers: { "x-order-token": token } },
                          );
                          setOrder(updated);
                        } catch (e) {
                          setSupportError((e as Error).message);
                        } finally {
                          setSupportBusy(false);
                        }
                      }}
                    >
                      <p>
                        A request starts a conversation. It does not approve a
                        return, cancel an order or issue a refund. Preview
                        orders have no payment to refund.
                      </p>
                      <label className="field">
                        <span>How can we help?</span>
                        <select name="type">
                          <option value="question">Order question</option>
                          <option value="cancellation">
                            Cancellation request
                          </option>
                          <option value="damage">Damage / wrong item</option>
                          <option value="return">Return request</option>
                        </select>
                      </label>
                      <label className="field">
                        <span>Tell us what happened</span>
                        <textarea
                          name="reason"
                          minLength={10}
                          maxLength={2000}
                          rows={4}
                          required
                        />
                      </label>
                      <p role="alert" className="form-error">
                        {supportError}
                      </p>
                      <button
                        className="button button-outline"
                        disabled={supportBusy}
                      >
                        {supportBusy ? "Saving…" : "Save support request"}
                      </button>
                    </form>
                  )}
                </div>
              </div>
              <aside className="order-summary">
                <div className="summary-row">
                  <span>Subtotal</span>
                  <span>{money(order.subtotal, order.currency)}</span>
                </div>
                <div className="summary-row">
                  <span>Illustrative delivery</span>
                  <span>{money(order.shipping, order.currency)}</span>
                </div>
                <div className="summary-row total">
                  <span>Preview total</span>
                  <strong>{money(order.total, order.currency)}</strong>
                </div>
                <p>
                  Payment status: unpaid preview.
                  <br /> No tax has been calculated.
                </p>
                {token && (
                  <details className="order-key">
                    <summary>Your secure access key</summary>
                    <p>
                      Save this privately to reopen your order on another
                      device.
                    </p>
                    <code>{token}</code>
                    <button
                      className="text-link"
                      onClick={() =>
                        navigator.clipboard
                          .writeText(token)
                          .then(() =>
                            notify("Access key copied. Keep it private."),
                          )
                          .catch(() =>
                            notify("Copy the key manually from above."),
                          )
                      }
                    >
                      Copy access key
                      <Copy size={15} />
                    </button>
                  </details>
                )}
              </aside>
            </div>
          </>
        )}
        <Link to="/contact" className="text-link">
          A question about your order?
          <ArrowUpRight size={17} />
        </Link>
      </section>
    </>
  );
}
