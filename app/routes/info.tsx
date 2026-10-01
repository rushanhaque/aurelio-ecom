import { useParams, useLoaderData, Link } from "react-router";
import { Plus, ArrowUpRight } from "lucide-react";
import { PageIntro } from "../components/ui";
import NotFound from "./not-found";
import { pages } from "../lib/help-content";
import { database } from "../../server/db";
import { frontendPreview } from "../../server/preview-mode";

export async function loader({ params }: { params: { page?: string } }) {
  if (!pages[params.page || ""])
    throw new Response("Not found", { status: 404 });
  if (frontendPreview()) return { page: pages[params.page!] };
  const { db } = await database();
  const saved = await db.collection("content").findOne({ slug: params.page });
  return {
    page: (saved?.published || pages[params.page!]) as (typeof pages)[string],
  };
}
export const meta = ({
  data,
}: {
  data?: Awaited<ReturnType<typeof loader>>;
}) => [
  {
    title: data ? `${data.page.title} — Aurelio` : "Help — Aurelio",
  },
];
export default function Info() {
  const { page } = useParams();
  const { page: p } = useLoaderData<typeof loader>();
  if (!p) return <NotFound />;
  return (
    <>
      <PageIntro eyebrow={p.eyebrow} title={p.title}>
        <p>{p.intro}</p>
      </PageIntro>
      <section className="info-layout container">
        <nav aria-label="Help pages">
          {Object.entries(pages).map(([slug, item]) => (
            <Link
              className={slug === page ? "active" : ""}
              to={`/${slug}`}
              key={slug}
            >
              {item.eyebrow.toLowerCase()}
              <ArrowUpRight size={14} />
            </Link>
          ))}
        </nav>
        <div className="info-body">
          {p.sections.map(([heading, body], i) =>
            page === "faq" ? (
              <details key={heading} open={i === 0}>
                <summary>
                  {heading}
                  <Plus size={18} />
                </summary>
                <p>{body}</p>
              </details>
            ) : (
              <section key={heading}>
                <h2>{heading}</h2>
                <p>{body}</p>
              </section>
            ),
          )}
          <Link className="text-link" to="/contact">
            Still wondering? Get in touch
            <ArrowUpRight size={16} />
          </Link>
        </div>
      </section>
    </>
  );
}
