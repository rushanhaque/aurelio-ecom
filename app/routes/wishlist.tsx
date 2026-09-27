import { PageIntro, ProductCard, EmptyState } from "../components/ui";
import { useStore } from "../lib/store";
export const meta = () => [{ title: "Your saved objects — Aurelio" }];
export default function Wishlist() {
  const { products, wishlist } = useStore();
  const saved = products.filter((p) => wishlist.includes(p.id));
  return (
    <>
      <PageIntro eyebrow="A FEW THINGS YOU LOVE" title="Worth keeping close.">
        <p>
          Your personal collection of possibilities.
          <br /> Saved on this device, ready when you are.
        </p>
      </PageIntro>
      <section className="container section-start">
        {saved.length ? (
          <div className="product-grid">
            {saved.map((p) => (
              <ProductCard key={p.id} product={p} />
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
