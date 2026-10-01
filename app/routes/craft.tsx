import { PageIntro, Picture, TextLink } from "../components/ui";
import { OriginalAtelier } from "../components/original-sections";
import { brand } from "../lib/brand";
export const meta = () => [
  { title: "About us — Aurelio by AF International" },
  { name: "description", content: brand.story },
];
const pillars = [
  [
    "01",
    "Made by hand",
    "Every piece is cast, forged, raised, turned and finished by hand on the bench in Moradabad. No two leave the workshop quite the same.",
  ],
  [
    "02",
    "Metal & wood",
    "We work brass, copper and patinated steel alongside seasoned timber — the materials northern India has shaped for generations.",
  ],
  [
    "03",
    "Shipped worldwide",
    "From a single object to a container of furniture, our work leaves the atelier for private homes and trade clients across the world.",
  ],
];
export default function Craft() {
  return (
    <>
      <PageIntro eyebrow="MADE BY HAND IN MORADABAD" title="About us">
        <p>{brand.story}</p>
      </PageIntro>
      <div className="wide-editorial container">
        <Picture
          name="brand/bespoke"
          alt="Bespoke work from the Aurelio collection"
          eager
        />
        <span>METAL & WOOD · MORADABAD, INDIA · SINCE 2008</span>
      </div>
      <section className="philosophy section container">
        <p className="eyebrow">THE STORY OF OUR ATELIER</p>
        <h2>
          A workshop,
          <br /> <em>not a factory.</em>
        </h2>
        <div className="philosophy-copy">
          <p>{brand.history}</p>
        </div>
      </section>
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
          [
            "2008",
            "Our beginning",
            "Founded in Moradabad, India’s brass city.",
          ],
          [
            "By hand",
            "Our practice",
            "Cast, forged, raised, turned and finished on the bench.",
          ],
          [
            "Worldwide",
            "Our reach",
            "Handcrafted metal and wooden pieces for homes and trade.",
          ],
        ].map(([n, title, text]) => (
          <div key={title} data-reveal>
            <span className="eyebrow">{n}</span>
            <h3>{title}</h3>
            <p>{text}</p>
          </div>
        ))}
      </section>
      <OriginalAtelier />
      <section className="editorial-cta container">
        <p className="eyebrow">THE VOCABULARY OF THE ATELIER</p>
        <h2>
          Metal. Wood.
          <br /> <em>And everything between.</em>
        </h2>
        <TextLink to="/materials">Explore our nine materials</TextLink>
        <TextLink to="/collections">See the collections</TextLink>
        <TextLink to="/contact">Contact us</TextLink>
      </section>
    </>
  );
}
