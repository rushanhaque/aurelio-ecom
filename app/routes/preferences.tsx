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
            A session cookie keeps you signed in. Browser storage remembers your
            bag, wishlist and currency.
          </p>
          <p>No advertising or analytics trackers are used.</p>
          <p>Clearing site data removes your saved bag and order keys.</p>
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
          <p>Unsubscribe from our notes. Order emails are unaffected.</p>
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
