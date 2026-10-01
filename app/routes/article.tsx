import { useParams, Link } from "react-router";
import { PageIntro, Picture, TextLink } from "../components/ui";
import { articles } from "../lib/journal";
import NotFound from "./not-found";
export function loader({ params }: { params: { slug?: string } }) {
  if (!articles.some((a) => a.slug === params.slug))
    throw new Response("Not found", { status: 404 });
  return null;
}
export default function Article() {
  const { slug } = useParams();
  const article = articles.find((a) => a.slug === slug);
  if (!article) return <NotFound />;
  return (
    <>
      <title>{article.title} — Aurelio journal</title>
      <PageIntro title={article.title}>
        <p>{article.excerpt}</p>
      </PageIntro>
      <div className="article-image container">
        <Picture name={article.image} alt={article.title} eager />
      </div>
      <article className="article-body">
        {article.paragraphs.map((p) => (
          <p key={p}>{p}</p>
        ))}
        <TextLink to="/journal">More notes</TextLink>
      </article>
    </>
  );
}
