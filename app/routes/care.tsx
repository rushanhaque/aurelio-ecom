import { Link } from "react-router";
import { PageIntro, TextLink } from "../components/ui";
import { materials } from "../lib/brand-content";
const care: Record<string, string> = {
  brass:
    "Dust with a soft, dry cloth. Dry any wipe at once. Unlacquered brass will deepen. Never polish lacquered or patinated surfaces.",
  copper:
    "Use a soft, barely damp cloth and dry at once. Hand-wash cookware only if its instructions allow. No acidic cleaners.",
  "patinated-steel":
    "Dust with a dry cloth. Keep it away from moisture. Ask us before treating rust.",
  bronze:
    "Dust with a soft brush. Keep the patina, don't polish it away. Avoid moisture.",
  "blown-glass":
    "Use a lint-free cloth. Avoid sudden temperature changes. Unplug and cool lighting before cleaning. Never immerse it.",
  wood: "Wipe with a slightly damp cloth and dry at once. Keep from heat and strong sun. Use coasters. Ask us before refinishing.",
  aluminium:
    "Wipe gently and dry at once. Follow the grain. No steel wool or alkaline cleaners.",
  porcelain:
    "Hold it by the base. Hand-wash gently. Avoid sudden temperature changes. Not dishwasher or microwave safe.",
  ceramic:
    "Handle gently and dry well. Use felt pads. Decorative pieces may not be food-safe or watertight.",
};
export const meta = () => [{ title: "Care guide — Aurelio" }];
export default function Care() {
  return (
    <>
      <PageIntro title="Care guide">
        <p>Start with the material.</p>
      </PageIntro>
      <nav className="material-index container" aria-label="Care by material">
        {materials.map((m) => (
          <a key={m.slug} href={`#${m.slug}`}>
            {m.name}
          </a>
        ))}
      </nav>
      <section className="care-library container">
        {materials.map((m) => (
          <article id={m.slug} key={m.slug}>
            <h2>{m.name}</h2>
            <p>{care[m.slug]}</p>
            <Link className="text-link" to={`/materials#${m.slug}`}>
              About {m.name.toLowerCase()} ↗
            </Link>
          </article>
        ))}
      </section>
      <section className="editorial-cta container">
        <h2>
          Not sure about
          <br /> <em>your finish?</em>
        </h2>
        <TextLink to="/contact">Ask us first</TextLink>
      </section>
    </>
  );
}
