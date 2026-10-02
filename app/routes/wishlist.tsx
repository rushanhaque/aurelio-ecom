import {
  PageIntro,
  ProductCard,
  EmptyState,
  Settling,
  Suggestions,
} from "../components/ui";
import { useStore } from "../lib/store";
export const meta = () => [{ title: "Saved items — Aurelio" }];
export default function Wishlist() {
  const { products, wishlist, ready } = useStore();
  const saved = products.filter((p) => wishlist.includes(p.id));
  return (
    <>
      <PageIntro title="Saved items">
        <p>Saved on this device.</p>
      </PageIntro>
      <section className="container section-start">
        {!ready ? (
          <Settling label="Loading…" />
        ) : saved.length ? (
          <div className="product-grid">
            {saved.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        ) : (
          <>
            <EmptyState title="Nothing saved yet.">
              Tap the heart on a piece to save it.
            </EmptyState>
            <Suggestions />
          </>
        )}
      </section>
    </>
  );
}
