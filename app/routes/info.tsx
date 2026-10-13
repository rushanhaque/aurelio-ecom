import { useParams, useLoaderData, Link, redirect } from "react-router";
import { brand } from "../lib/brand";
import { Plus, ArrowUpRight } from "lucide-react";
import { PageIntro } from "../components/ui";
import NotFound from "./not-found";
import { pages } from "../lib/help-content";
import { database } from "../../server/db";
import { frontendPreview } from "../../server/preview-mode";

/* Retail policies moved to the Shopify store with the shop. */
const shopPolicies: Record<string, string> = {
  shipping: "shipping-policy",
  returns: "refund-policy",
  seller: "contact-information",
};
export async function loader({ params }: { params: { page?: string } }) {
  const policy = shopPolicies[params.page || ""];
  if (policy)
    throw redirect(
      brand.shopUrl ? `${brand.shopUrl}/policies/${policy}` : "/contact",
    );
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
/* A section's text is plain: a blank line starts a paragraph, and lines that
   begin "- " form a list. The same convention works in the studio's editor. */
function Prose({ text }: { text: string }) {
  return (
    <>
      {text.split(/\n{2,}/).map((block, i) => {
        const lines = block.split("\n").filter(Boolean);
        const items = lines.filter((line) => line.startsWith("- "));
        if (items.length && items.length === lines.length)
          return (
            <ul key={i}>
              {items.map((item) => (
                <li key={item}>{item.slice(2)}</li>
              ))}
            </ul>
          );
        return (
          <p key={i} className="preserve-lines">
            {block}
          </p>
        );
      })}
    </>
  );
}
export default function Info() {
  const { page } = useParams();
  const { page: p } = useLoaderData<typeof loader>();
  if (!p) return <NotFound />;
  return (
    <>
      <PageIntro title={p.title}>
        <p>{p.intro}</p>
        {p.updated && <p className="info-updated">Last updated {p.updated}</p>}
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
                <Prose text={body} />
              </details>
            ) : (
              <section key={heading}>
                <h2>{heading}</h2>
                <Prose text={body} />
              </section>
            ),
          )}
          <Link className="text-link" to="/contact">
            Questions? Get in touch
            <ArrowUpRight size={16} />
          </Link>
        </div>
      </section>
    </>
  );
}
