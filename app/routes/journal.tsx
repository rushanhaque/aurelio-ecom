import { Link } from "react-router";
import { ArrowUpRight } from "lucide-react";
import { PageIntro, Picture } from "../components/ui";
import { articles } from "../lib/journal";
export const meta = () => [{ title: "Journal — Aurelio" }];
export default function Journal() {
  return (
    <>
      <PageIntro title="Journal">
        <p>Notes from the atelier.</p>
      </PageIntro>
      <section className="journal-grid container">
        {articles.map((a) => (
          <Link className="journal-card" to={`/journal/${a.slug}`} key={a.slug}>
            <div>
              <Picture name={a.image} alt={a.title} />
            </div>
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
