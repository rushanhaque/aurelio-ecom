import { Link } from "react-router";
import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { PageIntro, EmptyState, Picture, Quantity } from "../components/ui";
import { useStore } from "../lib/store";
import { cartTotal, money } from "../lib/catalog";
export const meta = () => [{ title: "Your bag — Aurelio" }];
export default function Cart() {
  const { cart, products, currency, quantity, remove, add, setPanel } =
    useStore();
  const [removed, setRemoved] = useState<{
    productId: string;
    quantity: number;
  } | null>(null);
  return (
    <>
      <PageIntro eyebrow="A CONSIDERED CHOICE" title="Your collection.">
        <p>Good things, gathered together.</p>
      </PageIntro>
      <section className="container section-start">
        {removed && (
          <div className="filter-chips" role="status">
            <span>Object removed from your bag.</span>
            <button
              onClick={() => {
                add(removed.productId, removed.quantity);
                setPanel(null);
                setRemoved(null);
              }}
            >
              Undo removal
            </button>
          </div>
        )}
        {!cart.length ? (
          <EmptyState title="A little space for something special.">
            Your bag is empty. Explore our collection when it arrives.
          </EmptyState>
        ) : (
          <div className="cart-layout">
            <div>
              {cart.map((l) => {
                const p = products.find((p) => p.id === l.productId)!;
                return (
                  <div className="cart-line" key={p.id}>
                    <Link to={`/products/${p.slug}`}>
                      <Picture name={p.image} alt={p.name} />
                    </Link>
                    <div>
                      <Link to={`/products/${p.slug}`}>{p.name}</Link>
                      <small>{p.finish}</small>
                      <Quantity
                        value={l.quantity}
                        max={p.stock}
                        onChange={(n) => quantity(p.id, n)}
                      />
                    </div>
                    <div className="cart-line-end">
                      <span>
                        {money(p.prices[currency] * l.quantity, currency)}
                      </span>
                      <button
                        onClick={() => {
                          setRemoved(l);
                          remove(p.id);
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            <aside className="order-summary">
              <p className="eyebrow">THE DETAILS</p>
              <h2>A lovely selection.</h2>
              <div className="summary-row">
                <span>Subtotal</span>
                <strong>
                  {money(cartTotal(cart, products, currency), currency)}
                </strong>
              </div>
              <p>
                Delivery is estimated at checkout. Live payments are not
                connected.
              </p>
              <Link className="button" to="/checkout">
                Continue to checkout
                <ArrowUpRight size={18} />
              </Link>
              <Link className="text-link" to="/shop">
                Continue exploring
                <ArrowUpRight size={16} />
              </Link>
              <Link className="text-link" to="/bulk-orders?from=cart">
                Enquire about this selection in bulk ↗
              </Link>
            </aside>
          </div>
        )}
      </section>
    </>
  );
}
