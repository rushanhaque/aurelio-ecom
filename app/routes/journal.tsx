import { Link } from "react-router";
import { ArrowUpRight } from "lucide-react";
import { PageIntro, Picture } from "../components/ui";
import { articles } from "../lib/journal";
export const meta = () => [{ title: "Journal — Aurelio" }];
export default function Journal() {
  return (
    <>
      <PageIntro eyebrow="NOTES FROM THE ATELIER" title="Journal">
        <p>Materials, moments, and the things we choose to live with.</p>
      </PageIntro>
      <section className="journal-grid container">
        {articles.map((a) => (
          <Link className="journal-card" to={`/journal/${a.slug}`} key={a.slug}>
            <div>
              <Picture name={a.image} alt={a.title} />
            </div>
            <p className="eyebrow">{a.category} · 2 MIN READ</p>
            <h2>
              {a.title}
              <ArrowUpRight size={22} />
            </h2>
            <p>{a.excerpt}</p>
          </Link>
        ))}
      </section>
    </>
  );
}
