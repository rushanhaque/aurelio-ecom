import { PageIntro, ProductCard, EmptyState, Settling } from "../components/ui";
import { useStore } from "../lib/store";
export const meta = () => [{ title: "Saved items — Aurelio" }];
export default function Wishlist() {
  const { products, wishlist, ready } = useStore();
  const saved = products.filter((p) => wishlist.includes(p.id));
  return (
    <>
      <PageIntro eyebrow="A FEW THINGS YOU LOVE" title="Saved items">
        <p>
          Your personal collection of possibilities.
          <br /> Saved on this device, ready when you are.
        </p>
      </PageIntro>
      <section className="container section-start">
        {!ready ? (
          <Settling label="Finding what you saved…" />
        ) : saved.length ? (
          <div className="product-grid">
            {saved.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        ) : (
          <EmptyState title="Something will catch your eye.">
            Tap the heart on an object to keep it here for another day.
          </EmptyState>
        )}
      </section>
    </>
  );
}
