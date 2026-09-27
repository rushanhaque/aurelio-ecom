import { useEffect, useState } from "react";
import { Link } from "react-router";
import { ArrowUpRight } from "lucide-react";
import { PageIntro, Field } from "../components/ui";
import { request } from "../lib/store";
import { money } from "../lib/catalog";
import { AccountSettings } from "../components/account-settings";
export const meta = () => [
  { title: "Your account — Aurelio" },
  { name: "robots", content: "noindex" },
];
export default function Account() {
  const [page, setPage] = useState(1),
    [total, setTotal] = useState(0);
  const [user, setUser] = useState<any>(null),
    [loading, setLoading] = useState(true),
    [mode, setMode] = useState("login"),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [orders, setOrders] = useState<any[]>([]);
  useEffect(() => {
    request("/api/session")
      .then((r) => setUser(r.customer))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);
  useEffect(() => {
    if (user)
      request(`/api/orders?paginated=1&page=${page}`)
        .then((result) => {
          setOrders(result.orders);
          setTotal(result.total);
        })
        .catch((e) => setError(e.message));
  }, [user, page]);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const r = await request("/api/auth", {
        method: "POST",
        body: JSON.stringify({
          ...Object.fromEntries(new FormData(e.currentTarget)),
          mode,
        }),
      });
      setUser(r.customer);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <PageIntro
        eyebrow="YOUR AURELIO WORLD"
        title={
          user ? `Hello, ${user.name.split(" ")[0]}.` : "A place of your own."
        }
      >
        <p>
          {user
            ? "Your orders, your objects, your little corner of Aurelio."
            : "Sign in to keep your orders close."}
        </p>
      </PageIntro>
      <section className="container account-section">
        {loading ? (
          <p role="status">Opening your account…</p>
        ) : user ? (
          <>
            <div className="account-toolbar">
              <span>{user.email}</span>
              <button
                className="text-link"
                onClick={async () => {
                  await request("/api/logout", { method: "POST" });
                  setUser(null);
                  setOrders([]);
                  setPage(1);
                }}
              >
                Sign out
                <ArrowUpRight size={16} />
              </button>
            </div>
            <h2>Your orders</h2>
            {orders.length ? (
              orders.map((o) => (
                <Link
                  className="account-order"
                  key={o.reference}
                  to={`/orders/${o.reference}`}
                >
                  <span>
                    {o.reference}
                    <small>{new Date(o.createdAt).toLocaleDateString()}</small>
                  </span>
                  <span>Unpaid preview</span>
                  <strong>{money(o.total, o.currency)}</strong>
                  <ArrowUpRight size={18} />
                </Link>
              ))
            ) : (
              <div className="quiet-empty">
                <p>Your order story starts here.</p>
                <Link to="/shop" className="text-link">
                  Explore the collection
                  <ArrowUpRight size={16} />
                </Link>
              </div>
            )}
            {total > 20 && (
              <nav className="pagination" aria-label="Order history pages">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  ← Previous
                </button>
                <span>
                  Page {page} of {Math.ceil(total / 20)}
                </span>
                <button
                  disabled={page * 20 >= total}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next →
                </button>
              </nav>
            )}
            <AccountSettings
              user={user}
              onUpdate={setUser}
              onSignOut={() => {
                setUser(null);
                setOrders([]);
                setPage(1);
                setError("Password changed. Please sign in again.");
              }}
            />
          </>
        ) : (
          <div className="auth-layout">
            <div className="auth-intro">
              <span className="auth-monogram">au.</span>
              <h2>
                Objects you love.
                <br /> <em>A world that’s yours.</em>
              </h2>
              <p>
                Guest checkout is always welcome. An account brings your future
                orders together.
              </p>
            </div>
            <form className="editorial-form" onSubmit={submit}>
              <div className="auth-tabs">
                <button
                  type="button"
                  className={mode === "login" ? "active" : ""}
                  onClick={() => setMode("login")}
                >
                  Sign in
                </button>
                <button
                  type="button"
                  className={mode === "register" ? "active" : ""}
                  onClick={() => setMode("register")}
                >
                  Create account
                </button>
              </div>
              {mode === "register" && (
                <Field label="Your name" name="name" autoComplete="name" />
              )}
              <Field
                label="Email address"
                name="email"
                type="email"
                autoComplete="email"
              />
              <label className="field">
                <span>Password</span>
                <input
                  name="password"
                  type="password"
                  required
                  minLength={10}
                  maxLength={128}
                  autoComplete={
                    mode === "register" ? "new-password" : "current-password"
                  }
                />
                <small>At least 10 characters.</small>
              </label>
              <p className="form-error" role="alert">
                {error}
              </p>
              <button className="button" disabled={busy}>
                {busy
                  ? "One moment…"
                  : mode === "login"
                    ? "Welcome back"
                    : "Create your account"}
                <ArrowUpRight size={18} />
              </button>
              <p className="muted">
                Preview accounts only. Recovery links are available through the
                studio’s local email preview until email delivery is connected.
              </p>
              <Link className="text-link" to="/account/link">
                Forgot your password?
              </Link>
            </form>
          </div>
        )}
      </section>
    </>
  );
}
