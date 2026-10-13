import { useState } from "react";
import { PageIntro, Field } from "../components/ui";
import { request } from "../lib/store";
export const meta = () => [
  { title: "Privacy & email preferences — Aurelio" },
  { name: "robots", content: "noindex" },
];
export default function Preferences() {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <>
      <PageIntro title="Preferences">
        <p>Privacy and email choices.</p>
      </PageIntro>
      <section className="container account-section settings-grid">
        <div>
          <h2>Essential storage only.</h2>
          <p>
            This site sets no cookies of its own and keeps nothing about you in
            your browser.
          </p>
          <p>No advertising or analytics trackers are used.</p>
          <p>
            Our online shop runs on Shopify, which has its own privacy and
            cookie notice.
          </p>
        </div>
        <form
          className="editorial-form"
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            setError("");
            try {
              await request("/api/newsletter/unsubscribe", {
                method: "POST",
                body: JSON.stringify(
                  Object.fromEntries(new FormData(e.currentTarget)),
                ),
              });
              setMessage(
                "If this email was subscribed, it has been removed from Aurelio notes.",
              );
            } catch (e) {
              setError((e as Error).message);
            } finally {
              setBusy(false);
            }
          }}
        >
          <h2>Email</h2>
          <p>Unsubscribe from our notes. Replies to your enquiries are unaffected.</p>
          <Field
            name="email"
            type="email"
            label="Email address"
            autoComplete="email"
          />
          <button className="button button-outline" disabled={busy}>
            {busy ? "Saving…" : "Unsubscribe"}
          </button>
          <p role="status">{message}</p>
          <p role="alert" className="form-error">
            {error}
          </p>
        </form>
      </section>
    </>
  );
}
