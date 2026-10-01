import { Link } from "react-router";
import { PageIntro, TextLink } from "../components/ui";
import { materials } from "../lib/brand-content";
const care: Record<string, string> = {
  brass:
    "Dust with a soft, dry cloth. Lacquered brass should be wiped gently and dried immediately. Living, unlacquered brass will deepen in colour. Avoid abrasives and do not polish a lacquered or intentionally patinated surface.",
  copper:
    "Use a dry or barely damp soft cloth and dry promptly. Wash copper cookware by hand only when its individual care instructions permit. Preserve intentional decorative patinas; do not use acidic cleaners or polishing treatments without finish-specific guidance.",
  "patinated-steel":
    "Dust with a dry cloth and keep moisture exposure brief. Dry immediately after any damp wiping. Blackened and waxed steel needs finish-specific maintenance; contact the atelier before treating rust or renewing its protective finish.",
  bronze:
    "Dust with a soft brush or microfibre cloth. Preserve the patina rather than polishing it away. Avoid prolonged contact with moisture, and ask the atelier about the right wax or treatment for your particular finish.",
  "blown-glass":
    "Use a soft, lint-free cloth and avoid sudden temperature changes. Disconnect electrical fittings and let them cool before handling shades. Follow the fitting’s instructions for removing glass; avoid immersing assembled lighting or placing it in a dishwasher.",
  wood: "Wipe with a dry or slightly damp cloth and dry immediately. Keep away from direct heat and prolonged direct sunlight. Use coasters and trivets. Ask the atelier which oil or finish is appropriate before refinishing the surface.",
  aluminium:
    "Wipe gently and dry immediately to avoid water spots. Follow the grain on brushed finishes. Avoid steel wool, sharp abrasives and alkaline cleaners on anodised surfaces; check the finish before using a specialist cleaner.",
  porcelain:
    "Handle at the base rather than a thin rim or handle. Hand-wash gently where the piece’s instructions permit and avoid sudden temperature changes. Metallic details and hand-applied decoration require particular care; do not assume dishwasher or microwave suitability.",
  ceramic:
    "Treat hand-built forms and relief decoration gently. Dry thoroughly before storing and protect furniture with felt pads. Do not assume a decorative piece is food-safe, watertight or microwave-safe; follow the stated use and individual care instructions.",
};
export const meta = () => [{ title: "Care guide — Aurelio" }];
export default function Care() {
  return (
    <>
      <PageIntro eyebrow="AFTER THE ATELIER" title="Care guide">
        <p>
          Every material we work has its own logic.
          <br /> Begin with the material, then follow the guidance for your
          piece’s particular finish.
        </p>
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
            <span className="eyebrow">{m.index} / MATERIAL CARE</span>
            <h2>{m.name}</h2>
            <p>{care[m.slug]}</p>
            <Link className="text-link" to={`/materials#${m.slug}`}>
              Explore {m.name.toLowerCase()} ↗
            </Link>
          </article>
        ))}
      </section>
      <section className="editorial-cta container">
        <h2>
          Not sure about
          <br /> <em>your finish?</em>
        </h2>
        <TextLink to="/contact">Ask the atelier before treating it</TextLink>
      </section>
    </>
  );
}
