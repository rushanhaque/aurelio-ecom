import { useEffect, useState } from "react";
import { Link } from "react-router";
import { PageIntro, Field } from "../components/ui";
import { request } from "../lib/store";
export const meta = () => [
  { title: "Account assistance — Aurelio" },
  { name: "robots", content: "noindex,nofollow" },
  { name: "referrer", content: "no-referrer" },
];
export default function AccountLink() {
  const [token, setToken] = useState("");
  const [purpose, setPurpose] = useState("reset");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  useEffect(() => {
    const params = new URLSearchParams(location.hash.slice(1));
    setToken(params.get("token") || "");
    setPurpose(params.get("purpose") === "verify" ? "verify" : "reset");
    if (location.hash) history.replaceState(null, "", location.pathname);
  }, []);
  return (
    <>
      <PageIntro
        eyebrow="YOUR AURELIO ACCOUNT"
        title={
          purpose === "verify" ? "A little reassurance." : "A fresh beginning."
        }
      >
        <p>
          {purpose === "verify"
            ? "Confirm that this email address belongs to you."
            : "Recover access to your account."}
        </p>
      </PageIntro>
      <section className="container account-section">
        <form
          className="editorial-form admin-login"
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            setError("");
            const values = Object.fromEntries(new FormData(e.currentTarget));
            try {
              const result = await request(
                token ? "/api/account-links/consume" : "/api/account-links",
                {
                  method: "POST",
                  body: JSON.stringify(
                    token
                      ? { token, purpose, ...values }
                      : { purpose: "reset", ...values },
                  ),
                },
              );
              setMessage(
                token
                  ? purpose === "verify"
                    ? "Email verified. You can return to your account."
                    : "Password updated. Please sign in again."
                  : result.message,
              );
              if (token) setDone(true);
            } catch (e) {
              setError((e as Error).message);
            } finally {
              setBusy(false);
            }
          }}
        >
          {!done && (
            <>
              {!token ? (
                <Field
                  name="email"
                  type="email"
                  label="Email address"
                  autoComplete="email"
                />
              ) : purpose === "reset" ? (
                <label className="field">
                  <span>New password</span>
                  <input
                    type="password"
                    name="password"
                    required
                    minLength={10}
                    maxLength={128}
                    autoComplete="new-password"
                  />
                </label>
              ) : (
                <p>
                  Verification links can be used once and expire after one hour.
                </p>
              )}
              <button className="button" disabled={busy}>
                {busy
                  ? "One moment…"
                  : !token
                    ? "Request recovery link"
                    : purpose === "verify"
                      ? "Verify my email"
                      : "Save new password"}
              </button>
            </>
          )}
          <p role="status">{message}</p>
          <p role="alert" className="form-error">
            {error}
          </p>
          {error && token && (
            <button
              type="button"
              className="text-link"
              onClick={() => {
                setToken("");
                setError("");
              }}
            >
              Request a new recovery link
            </button>
          )}
          <Link to="/account" className="text-link">
            Return to account ↗
          </Link>
        </form>
      </section>
    </>
  );
}
