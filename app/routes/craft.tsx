import { PageIntro, TextLink } from "../components/ui";
import { brand } from "../lib/brand";
import { Words } from "../components/motion-text";
import {
  CollectionWorlds,
  MaterialMarquee,
  PathOfAPiece,
} from "../components/story-sections";
import {
  AurelioStandard,
  OriginalAtelier,
} from "../components/original-sections";
import { Heritage } from "../components/heritage";
/* Tells the root layout this route writes its own description. */
export const handle = { describes: true };
export const meta = () => [
  { title: "About us — Aurelio by AF International" },
  { name: "description", content: brand.story },
];
const pillars = [
  [
    "01",
    "Made by hand",
    "Cast, forged and finished on our bench. No two are the same.",
  ],
  ["02", "Metal & wood", "Brass, copper and steel, alongside seasoned timber."],
  ["03", "Shipped worldwide", "From one piece to a full container."],
];

/* The atelier's story, told in the order of the original Aurelio site: who we
   are, what we believe, what we make, where we work, how a piece is made and
   who makes it. */
export default function Craft() {
  return (
    <>
      <PageIntro
        title={
          <>
            A family <em>atelier.</em>
          </>
        }
        image="craft"
      >
        <p>{brand.story}</p>
      </PageIntro>
      <section className="philosophy section container">
        <h2 data-reveal="words">
          <Words>
            A workshop,
            <br /> <em>not a factory.</em>
          </Words>
        </h2>
        <div className="philosophy-copy">
          <p>{brand.history}</p>
        </div>
      </section>
      <MaterialMarquee />
      <AurelioStandard />
      <CollectionWorlds />
      <Heritage />
      <PathOfAPiece />
      <OriginalAtelier />
      <section className="about-pillars container" aria-label="How we work">
        {pillars.map(([no, name, text]) => (
          <article key={no} data-reveal>
            <span className="eyebrow">{no}</span>
            <h3>{name}</h3>
            <p>{text}</p>
          </article>
        ))}
      </section>
      <section className="values-section container">
        {[
          ["2008", "Our beginning", "Founded in Moradabad."],
          ["By hand", "Our practice", "Made on the bench."],
          ["Worldwide", "Our reach", "For homes and trade."],
        ].map(([n, title, text]) => (
          <div key={title} data-reveal>
            <span className="eyebrow">{n}</span>
            <h3>{title}</h3>
            <p>{text}</p>
          </div>
        ))}
      </section>
      <section className="editorial-cta container">
        <h2 data-reveal="words">
          <Words>
            Metal. Wood.
            <br /> <em>And everything between.</em>
          </Words>
        </h2>
        <TextLink to="/materials">Our materials</TextLink>
        <TextLink to="/collections">Collections</TextLink>
        <TextLink to="/contact">Contact us</TextLink>
      </section>
    </>
  );
}
