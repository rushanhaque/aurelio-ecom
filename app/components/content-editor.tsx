import { useEffect, useState } from "react";
import { request } from "../lib/store";
export function ContentEditor({
  headers,
}: {
  headers: Record<string, string>;
}) {
  const [pages, setPages] = useState<any[]>([]),
    [slug, setSlug] = useState("home"),
    [draft, setDraft] = useState<any>(null),
    [version, setVersion] = useState(0),
    [history, setHistory] = useState<any[]>([]),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [message, setMessage] = useState("");
  async function load() {
    const result = await request("/api/admin/content", { headers });
    setPages(result);
    return result;
  }
  useEffect(() => {
    load().catch((e) => setError(e.message));
  }, []);
  useEffect(() => {
    const page = pages.find((p) => p.slug === slug);
    if (page) {
      setDraft(page.draft);
      setVersion(page.version);
      setHistory([]);
    }
  }, [pages, slug]);
  if (!draft) return <p role="status">{error || "Opening content studio…"}</p>;
  return (
    <div className="content-editor">
      <h2>Words with purpose.</h2>
      <p>
        Edit the homepage material atelier, help and policy pages. Drafts remain
        private; publishing replaces the public page. Have business policies
        approved before publishing.
      </p>
      <label className="field">
        <span>Page</span>
        <select
          disabled={busy}
          value={slug}
          onChange={(e) => {
            setSlug(e.target.value);
            setMessage("");
          }}
        >
          {pages.map((p) => (
            <option key={p.slug} value={p.slug}>
              {p.slug}
            </option>
          ))}
        </select>
      </label>
      <form
        key={`${slug}-${version}`}
        className="editorial-form"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setError("");
          setMessage("");
          const publish = new FormData(e.currentTarget).get("publish") === "on";
          try {
            await request("/api/admin/content", {
              method: "POST",
              headers,
              body: JSON.stringify({
                slug,
                expectedVersion: version,
                publish,
                ...draft,
              }),
            });
            await load();
            setMessage(
              publish
                ? "Page published."
                : "Private draft saved. Public page unchanged.",
            );
          } catch (e) {
            setError((e as Error).message);
          } finally {
            setBusy(false);
          }
        }}
      >
        {[
          ["eyebrow", "Eyebrow"],
          ["title", "Page title"],
          ["intro", "Introduction"],
        ].map(([key, label]) => (
          <label className="field" key={key}>
            <span>{label}</span>
            <input
              required
              value={draft[key]}
              onChange={(e) => setDraft({ ...draft, [key]: e.target.value })}
            />
          </label>
        ))}
        {draft.sections.map(([heading, body]: string[], i: number) => (
          <fieldset className="quote-line" key={i}>
            <legend>Section {i + 1}</legend>
            <label className="field">
              <span>Heading</span>
              <input
                required
                value={heading}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    sections: draft.sections.map((s: string[], n: number) =>
                      n === i ? [e.target.value, s[1]] : s,
                    ),
                  })
                }
              />
            </label>
            <label className="field">
              <span>Body</span>
              <textarea
                rows={4}
                required
                value={body}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    sections: draft.sections.map((s: string[], n: number) =>
                      n === i ? [s[0], e.target.value] : s,
                    ),
                  })
                }
              />
            </label>
            {draft.sections.length > 1 && (
              <button
                type="button"
                className="text-link"
                onClick={() =>
                  setDraft({
                    ...draft,
                    sections: draft.sections.filter(
                      (_: unknown, n: number) => n !== i,
                    ),
                  })
                }
              >
                Remove section
              </button>
            )}
          </fieldset>
        ))}
        <button
          type="button"
          className="text-link"
          disabled={draft.sections.length >= 20}
          onClick={() =>
            setDraft({ ...draft, sections: [...draft.sections, ["", ""]] })
          }
        >
          Add section +
        </button>
        <details className="content-preview">
          <summary>Preview this draft</summary>
          <p className="eyebrow">{draft.eyebrow}</p>
          <h2>{draft.title}</h2>
          <p>{draft.intro}</p>
          {draft.sections.map(([heading, body]: string[], i: number) => (
            <section key={i}>
              <h3>{heading}</h3>
              <p className="preserve-lines">{body}</p>
            </section>
          ))}
        </details>
        <label className="checkbox-label">
          <input name="publish" type="checkbox" />I have reviewed the preview
          and want to publish these changes.
        </label>
        <button className="button" disabled={busy}>
          {busy ? "Saving…" : "Save page"}
        </button>
        <p role="status">{message}</p>
        <p className="form-error" role="alert">
          {error}
        </p>
      </form>
      <button
        className="text-link"
        onClick={async () => {
          try {
            setHistory(
              await request(`/api/admin/content/${slug}/versions`, { headers }),
            );
          } catch (e) {
            setError((e as Error).message);
          }
        }}
      >
        View saved versions
      </button>
      {history.map((item) => (
        <div className="address-card" key={item.version}>
          <p>
            Version {item.version} ·{" "}
            {item.publishedInThisVersion ? "Published" : "Draft"} ·{" "}
            {new Date(item.updatedAt).toLocaleString()}
          </p>
          <button
            className="text-link"
            onClick={() => {
              setDraft(item.draft);
              setMessage(
                "Previous version loaded into the editor. Review and save to restore it.",
              );
            }}
          >
            Load this version into editor
          </button>
        </div>
      ))}
    </div>
  );
}
