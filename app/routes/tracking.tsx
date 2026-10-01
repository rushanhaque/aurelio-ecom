import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowUpRight } from "lucide-react";
import { PageIntro, Field } from "../components/ui";
import { request } from "../lib/store";
export default function Tracking() {
  const navigate = useNavigate();
  const [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const form = new FormData(e.currentTarget),
      ref = String(form.get("reference")).trim(),
      token = String(form.get("token")).trim();
    try {
      await request(`/api/orders/${encodeURIComponent(ref)}`, {
        headers: { "x-order-token": token },
      });
      sessionStorage.setItem(`order-${ref}`, token);
      navigate(`/orders/${ref}`);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <PageIntro title="Track your order">
        <p>Enter your reference and access key, or sign in.</p>
      </PageIntro>
      <form className="editorial-form narrow-form container" onSubmit={submit}>
        <Field label="Order reference" name="reference" placeholder="AUR-…" />
        <Field label="Secure access key" name="token" />
        <p className="muted">
          Your key is on the confirmation page. Keep it private. Preview orders
          aren’t shipped.
        </p>
        <p className="form-error" role="alert">
          {error}
        </p>
        <button className="button" disabled={busy}>
          {busy ? "Finding…" : "View order"}
          <ArrowUpRight size={18} />
        </button>
      </form>
    </>
  );
}
