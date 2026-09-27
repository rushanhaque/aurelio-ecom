import { useState } from "react";
import { Link } from "react-router";
import { Field } from "./ui";
import { request } from "../lib/store";

export function AccountSettings({
  user,
  onUpdate,
  onSignOut,
}: {
  user: any;
  onUpdate: (user: any) => void;
  onSignOut: () => void;
}) {
  const [addresses, setAddresses] = useState<any[]>(user.addresses || []);
  const [defaultId, setDefaultId] = useState<string | null>(
    user.defaultAddressId || null,
  );
  const [editing, setEditing] = useState<any>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function save(name: string, next = addresses, nextDefault = defaultId) {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const result = await request("/api/profile", {
        method: "PATCH",
        body: JSON.stringify({
          name,
          addresses: next,
          defaultAddressId: nextDefault,
        }),
      });
      onUpdate(result.customer);
      setAddresses(result.customer.addresses);
      setDefaultId(result.customer.defaultAddressId);
      setEditing(null);
      setMessage("Your details have been saved.");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="account-settings">
      <div className="section-heading">
        <div>
          <p className="eyebrow">THE PERSONAL DETAILS</p>
          <h2>Your account, considered.</h2>
        </div>
        <Link className="text-link" to="/wishlist">
          Your saved objects ↗
        </Link>
      </div>
      <p role="status">{message}</p>
      <p className="form-error" role="alert">
        {error}
      </p>
      <div className="settings-grid">
        <form
          className="editorial-form"
          onSubmit={(e) => {
            e.preventDefault();
            void save(String(new FormData(e.currentTarget).get("name")));
          }}
        >
          <h3>Profile</h3>
          <Field
            name="name"
            label="Your name"
            defaultValue={user.name}
            autoComplete="name"
          />
          <p>
            {user.email} ·{" "}
            {user.emailVerifiedAt ? "Verified" : "Not yet verified"}
          </p>
          {!user.emailVerifiedAt && (
            <button
              type="button"
              className="text-link"
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                setError("");
                try {
                  const result = await request("/api/account-links", {
                    method: "POST",
                    body: JSON.stringify({
                      email: user.email,
                      purpose: "verify",
                    }),
                  });
                  setMessage(result.message);
                } catch (e) {
                  setError((e as Error).message);
                } finally {
                  setBusy(false);
                }
              }}
            >
              Request verification link
            </button>
          )}
          <p className="muted">
            For email changes or a privacy request, contact the studio. We will
            verify ownership before changing your details.
          </p>
          <button className="button button-outline" disabled={busy}>
            Save profile
          </button>
          <Link to="/contact?topic=Privacy%20request" className="text-link">
            Privacy & account assistance ↗
          </Link>
        </form>
        <form
          className="editorial-form"
          onSubmit={async (e) => {
            e.preventDefault();
            const form = e.currentTarget;
            setBusy(true);
            setError("");
            try {
              await request("/api/password", {
                method: "POST",
                body: JSON.stringify(Object.fromEntries(new FormData(form))),
              });
              onSignOut();
            } catch (e) {
              setError((e as Error).message);
            } finally {
              setBusy(false);
            }
          }}
        >
          <h3>Password</h3>
          <Field
            name="currentPassword"
            label="Current password"
            type="password"
            autoComplete="current-password"
          />
          <label className="field">
            <span>New password</span>
            <input
              name="password"
              type="password"
              minLength={10}
              maxLength={128}
              required
              autoComplete="new-password"
            />
          </label>
          <p className="muted">
            Use at least 10 characters. Changing your password signs you out on
            every device.
          </p>
          <button className="button button-outline" disabled={busy}>
            Change password
          </button>
        </form>
      </div>
      <div className="section-heading">
        <h3>Address book</h3>
        <button
          className="text-link"
          disabled={addresses.length >= 10 || busy}
          onClick={() => setEditing({ id: crypto.randomUUID(), country: "IN" })}
        >
          Add an address +
        </button>
      </div>
      <p className="muted">
        Save up to ten addresses. A saved destination does not guarantee
        delivery serviceability.
      </p>
      <div className="address-grid">
        {addresses.map((a) => (
          <article className="address-card" key={a.id}>
            <p className="eyebrow">
              {a.label}
              {a.id === defaultId ? " / DEFAULT" : ""}
            </p>
            <h3>{a.name}</h3>
            <p>
              {a.address}
              <br />
              {a.city}, {a.region} {a.postalCode}
              <br />
              {a.country}
            </p>
            <div className="address-actions">
              <button
                className="text-link"
                disabled={busy}
                onClick={() => setEditing(a)}
              >
                Edit
              </button>
              <button
                className="text-link"
                disabled={busy}
                onClick={() => void save(user.name, addresses, a.id)}
              >
                Make default
              </button>
              <button
                className="text-link"
                disabled={busy}
                onClick={() =>
                  void save(
                    user.name,
                    addresses.filter((x) => x.id !== a.id),
                    defaultId === a.id ? null : defaultId,
                  )
                }
              >
                Remove
              </button>
            </div>
          </article>
        ))}
      </div>
      {editing && (
        <form
          key={editing.id}
          className="editorial-form address-editor"
          onSubmit={(e) => {
            e.preventDefault();
            const address = {
              ...Object.fromEntries(new FormData(e.currentTarget)),
              id: editing.id,
            };
            void save(user.name, [
              ...addresses.filter((a) => a.id !== editing.id),
              address,
            ]);
          }}
        >
          <h3>
            {addresses.some((a) => a.id === editing.id)
              ? "Edit address"
              : "A new address"}
          </h3>
          <div className="form-grid">
            {[
              ["label", "Address label"],
              ["name", "Recipient name"],
              ["address", "Street address"],
              ["city", "City"],
              ["region", "State / region"],
              ["postalCode", "Postal code"],
            ].map(([name, label]) => (
              <Field
                key={name}
                name={name}
                label={label}
                defaultValue={editing[name]}
                required={name !== "region" && name !== "postalCode"}
              />
            ))}
            <label className="field">
              <span>Country</span>
              <select name="country" defaultValue={editing.country}>
                {[
                  ["IN", "India"],
                  ["US", "United States"],
                  ["GB", "United Kingdom"],
                  ["DE", "Germany"],
                  ["FR", "France"],
                ].map(([code, name]) => (
                  <option value={code} key={code}>
                    {name}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="address-actions">
            <button className="button" disabled={busy}>
              Save address
            </button>
            <button
              type="button"
              className="text-link"
              onClick={() => setEditing(null)}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
