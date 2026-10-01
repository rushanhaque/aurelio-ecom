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
      <PageIntro eyebrow="YOUR CHOICES" title="Preferences">
        <p>Your privacy and communication preferences.</p>
      </PageIntro>
      <section className="container account-section settings-grid">
        <div>
          <h2>Essential storage only.</h2>
          <p>
            This storefront uses a secure session cookie to keep you signed in
            and browser storage for your bag, wishlist and chosen currency.
            Secure guest order keys remain in your browser session.
          </p>
          <p>
            No advertising pixels, optional analytics cookies or third-party
            marketing trackers are installed. There are no optional tracking
            preferences to enable.
          </p>
          <p>
            Signing out removes the session cookie. Clearing Aurelio’s site data
            in your browser removes saved shopping preferences and order keys on
            this device.
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
          <h2>A quieter inbox.</h2>
          <p>
            Unsubscribe from Aurelio notes. This does not change essential
            communications about an order or enquiry.
          </p>
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
