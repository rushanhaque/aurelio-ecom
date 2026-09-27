import { PageIntro, Picture, TextLink } from "../components/ui";
import { OriginalAtelier } from "../components/original-sections";
import { brand } from "../lib/brand";
import "../brand-content.css";
export const meta = () => [
  { title: "Made by hand in Moradabad — Aurelio by AF International" },
  { name: "description", content: brand.story },
];
export default function Craft() {
  return (
    <>
      <PageIntro
        eyebrow="AURELIO BY AF INTERNATIONAL"
        title="Made by hand in Moradabad."
      >
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
          A workshop.
          <br /> <em>A family. A way of making.</em>
        </h2>
        <div className="philosophy-copy">
          <p>{brand.history}</p>
          <p>
            We work brass, copper and patinated steel alongside seasoned timber
            — the materials northern India has shaped for generations. From a
            single object to a container of furniture, our work leaves the
            atelier for private homes and trade clients across the world.
          </p>
        </div>
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
        <TextLink to="/collections">Discover the collections</TextLink>
      </section>
    </>
  );
}
