import { useState } from "react";
import { Link } from "react-router";
import { ArrowUpRight, Layers } from "lucide-react";
import { materials } from "../lib/brand-content";
import { PageIntro, Picture, TextLink } from "../components/ui";
export const meta = () => [{ title: "Materials — Aurelio" }];
function MaterialCard({
  material: m,
}: {
  material: (typeof materials)[number];
}) {
  const [texture, setTexture] = useState(false);
  return (
    <article className="brand-material" id={m.slug} data-reveal>
      <button
        className={`material-surface ${texture ? "show-texture" : ""}`}
        onClick={() => setTexture(!texture)}
        aria-pressed={texture}
        aria-label={`View the texture of ${m.name}`}
      >
        <Picture name={m.image} alt={m.name} />
        <Picture name={m.texture} alt="" className="material-texture" />
        <span>
          <Layers size={15} />{" "}
          {texture ? "See the material" : "See the texture"}
        </span>
      </button>
      <div className="material-heading">
        <span>{m.index}</span>
        <h2>{m.name}</h2>
      </div>
      <p className="material-trait">{m.trait}</p>
      <p>{m.blurb}</p>
      <small>{m.note}</small>
      <Link className="text-link" to={`/care#${m.slug}`}>
        Care for {m.name.toLowerCase()} <ArrowUpRight size={15} />
      </Link>
    </article>
  );
}
export default function Materials() {
  return (
    <>
      <PageIntro title="Materials">
        <p>Nine materials, each with its own character.</p>
      </PageIntro>
      <nav className="material-index container" aria-label="Materials">
        {materials.map((m) => (
          <a href={`#${m.slug}`} key={m.slug}>
            {m.name}
          </a>
        ))}
      </nav>
      <section className="brand-material-grid container">
        {materials.map((m) => (
          <MaterialCard material={m} key={m.slug} />
        ))}
      </section>
      <section className="editorial-cta container">
        <h2>
          Start with
          <br /> <em>a material.</em>
        </h2>
        <TextLink to="/bulk-orders">Discuss a piece</TextLink>
      </section>
    </>
  );
}
