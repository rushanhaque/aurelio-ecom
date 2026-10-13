import { StudioWorkflow } from "../components/studio-workflow";
import { QuoteEditor } from "../components/quote-editor";
import { ContentEditor } from "../components/content-editor";
import { useEffect, useState } from "react";
import { useLocation } from "react-router";
import { ArrowUpRight, LogOut } from "lucide-react";
import { PageIntro } from "../components/ui";
import { request } from "../lib/store";
import { money } from "../lib/catalog";
export const meta = () => [
  { title: "Studio dashboard — Aurelio" },
  { name: "robots", content: "noindex,nofollow" },
];
/* The pictures a visitor sent with an idea. They are private, so each one is
   fetched with the studio token (an <img> cannot send it) and shown from a
   local blob; a click opens the full-size picture. */
function BriefPictures({
  ids,
  headers,
}: {
  ids: string[];
  headers: Record<string, string>;
}) {
  const [items, setItems] = useState<{ id: string; thumb: string; full: string }[]>([]);
  useEffect(() => {
    let alive = true;
    const made: string[] = [];
    (async () => {
      const loaded = [];
      for (const id of ids) {
        try {
          const [thumb, full] = await Promise.all(
            [`?thumb=1`, ``].map(async (query) => {
              const response = await fetch(`/api/admin/briefs/${id}${query}`, { headers });
              if (!response.ok) throw new Error();
              const url = URL.createObjectURL(await response.blob());
              made.push(url);
              return url;
            }),
          );
          loaded.push({ id, thumb, full });
        } catch {
          // A picture that has expired or cannot be read is simply skipped.
        }
      }
      if (alive) setItems(loaded);
    })();
    return () => {
      alive = false;
      made.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [ids.join(","), headers.Authorization]);
  if (!items.length) return null;
  return (
    <ul className="admin-briefs" aria-label="Pictures sent with this idea">
      {items.map((item) => (
        <li key={item.id}>
          <a href={item.full} target="_blank" rel="noreferrer">
            <img src={item.thumb} alt="A picture the visitor sent" />
          </a>
        </li>
      ))}
    </ul>
  );
}
export default function Admin() {
  const location = useLocation();
  const [token, setToken] = useState(""),
    [data, setData] = useState<any>(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [tab, setTab] = useState(
      location.pathname === "/cms" ? "content" : "enquiries",
    );
  const headers = { Authorization: `Bearer ${token}` };
  async function refresh() {
    const r = await request("/api/admin/overview", { headers });
    setData(r);
  }
  async function login(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <PageIntro title="Behind the collection.">
        <p>Enquiries, quotations and messages. In one place.</p>
      </PageIntro>
      <section className="admin-section container">
        {!data ? (
          <form className="editorial-form admin-login" onSubmit={login}>
            <h2>Studio access</h2>
            <label className="field">
              <span>Administrator access token</span>
              <input
                type="password"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                required
                autoComplete="off"
              />
            </label>
            <p className="muted">
              Use the ADMIN_TOKEN configured in your local .env file. The token
              stays in memory and is cleared when you leave this page.
            </p>
            <p className="form-error" role="alert">
              {error}
            </p>
            <button className="button" disabled={busy}>
              {busy ? "Opening…" : "Open the studio"}
              <ArrowUpRight size={18} />
            </button>
          </form>
        ) : (
          <>
            <div className="admin-toolbar">
              <div className="auth-tabs">
                {[
                  "enquiries",
                  "draftOrders",
                  "messages",
                  "emailPreview",
                  "content",
                ].map((t) => (
                  <button
                    className={tab === t ? "active" : ""}
                    key={t}
                    onClick={() => setTab(t)}
                  >
                    {t === "draftOrders"
                      ? "Order drafts"
                      : t === "emailPreview"
                        ? "Local email"
                        : t}
                    {t !== "content" && <span>{data[t]?.length || 0}</span>}
                  </button>
                ))}
              </div>
              <button
                className="text-link"
                onClick={() => {
                  setToken("");
                  setData(null);
                }}
              >
                Lock studio
                <LogOut size={16} />
              </button>
            </div>
            <p className="form-error" role="alert">
              {error}
            </p>
            {tab === "enquiries" && (
              <div className="admin-records">
                {data.enquiries.length ? (
                  data.enquiries.map((q: any) => (
                    <article key={q.reference}>
                      <div>
                        <p className="eyebrow">{q.reference}</p>
                        <h3>
                          {q.name} {q.company && `/ ${q.company}`}
                        </h3>
                        <p>
                          {q.email} · {q.country} · Quantity: {q.quantity}
                        </p>
                        <p>{q.product}</p>
                        <p className="preserve-lines">{q.message}</p>
                        {!!q.attachments?.length && (
                          <BriefPictures ids={q.attachments} headers={headers} />
                        )}
                      </div>
                      <StudioWorkflow
                        record={q}
                        kind="enquiries"
                        headers={headers}
                        refresh={refresh}
                      />
                      <QuoteEditor
                        reference={q.reference}
                        headers={headers}
                        refresh={refresh}
                      />
                    </article>
                  ))
                ) : (
                  <p>No enquiries yet.</p>
                )}
              </div>
            )}
            {tab === "draftOrders" && (
              <div className="admin-records">
                {data.draftOrders.length ? (
                  data.draftOrders.map((draft: any) => (
                    <article key={draft.reference}>
                      <div>
                        <p className="eyebrow">
                          {draft.reference} / {draft.enquiry}
                        </p>
                        <h3>Awaiting studio confirmation</h3>
                        {draft.lines.map((line: any, i: number) => (
                          <p key={i}>
                            {line.description} × {line.quantity}
                          </p>
                        ))}
                        <p className="preserve-lines">{draft.terms}</p>
                        <p>Unpaid. No stock reserved or shipment created.</p>
                      </div>
                      <strong>{money(draft.total, draft.currency)}</strong>
                    </article>
                  ))
                ) : (
                  <p>No accepted quotations yet.</p>
                )}
              </div>
            )}
            {tab === "content" && <ContentEditor headers={headers} />}
            {tab === "messages" && (
              <div className="admin-records">
                {data.messages.length ? (
                  data.messages.map((m: any) => (
                    <article key={m.reference}>
                      <div>
                        <p className="eyebrow">
                          {m.reference} / {m.topic}
                        </p>
                        <h3>{m.name}</h3>
                        <p>{m.email}</p>
                        <p className="preserve-lines">{m.message}</p>
                      </div>
                      <StudioWorkflow
                        record={m}
                        kind="messages"
                        headers={headers}
                        refresh={refresh}
                      />
                    </article>
                  ))
                ) : (
                  <p>No messages yet.</p>
                )}
              </div>
            )}
            {tab === "emailPreview" && (
              <div className="admin-records">
                <p>
                  Local development inbox. These messages have not been sent.
                  This inbox is disabled outside local preview mode.
                </p>
                {data.emailPreview.map((mail: any, i: number) => (
                  <article key={i}>
                    <div>
                      <p className="eyebrow">{mail.to}</p>
                      <h3>{mail.subject}</h3>
                      <p className="preserve-lines">{mail.text}</p>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </>
        )}
      </section>
    </>
  );
}
