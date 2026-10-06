import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { request } from "../lib/store";

/* The footer's catalogue request and colophon dialogs, split out so the dialog
   library only loads when one is opened. */

const CATALOGUE_TYPES = [
  "Urns",
  "Lighting",
  "Furniture",
  "Kitchenware",
  "Decor",
  "Accessories",
  "Bespoke / Custom",
  "Full Collection",
];

export function CatalogueModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({ email: "", type: "" });
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const upd =
    (k: keyof typeof form) =>
    (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.email.trim() || !form.type) return;
    setBusy(true);
    setError("");
    try {
      await request("/api/contact", {
        method: "POST",
        body: JSON.stringify({
          name: "Catalogue request",
          email: form.email,
          topic: "Catalogue request",
          message: `Please send me the ${form.type} catalogue.`,
        }),
      });
      setSent(true);
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog.Root
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="cat-modal-overlay" />
        <Dialog.Content className="cat-modal" aria-describedby={undefined}>
          <Dialog.Title className="sr-only">Request a catalogue</Dialog.Title>
          <button
            className="cat-modal-close"
            onClick={onClose}
            aria-label="Close"
          >
            <svg viewBox="0 0 18 18" width="14" height="14" fill="none">
              <path
                d="M1 1l16 16M17 1L1 17"
                stroke="currentColor"
                strokeWidth="1.5"
              />
            </svg>
          </button>
          {sent ? (
            <div className="cat-modal-thanks">
              <span className="cat-modal-kicker">Thank you</span>
              <p className="cat-modal-lead">
                Your catalogue request has been received. We will be in touch by
                email.
              </p>
              <button className="ft-send" onClick={onClose}>
                Close{" "}
                <svg
                  viewBox="0 0 24 24"
                  width="13"
                  height="13"
                  aria-hidden="true"
                >
                  <path
                    d="M5 12h14M13 6l6 6-6 6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                </svg>
              </button>
            </div>
          ) : (
            <>
              <span className="cat-modal-kicker">Request a Catalogue</span>
              <p className="cat-modal-lead">
                Choose a collection and we will send you its full lookbook by
                email.
              </p>
              <form className="cat-modal-form" onSubmit={onSubmit}>
                <div className="cat-modal-field">
                  <label className="cat-modal-label" htmlFor="cat-email">
                    Your email
                  </label>
                  <input
                    id="cat-email"
                    className="ft-input"
                    type="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={upd("email")}
                    required
                  />
                </div>
                <div className="cat-modal-field">
                  <label className="cat-modal-label" htmlFor="cat-type">
                    Catalogue
                  </label>
                  <select
                    id="cat-type"
                    className="ft-input ft-select"
                    value={form.type}
                    onChange={upd("type")}
                    required
                  >
                    <option value="">Select a collection…</option>
                    {CATALOGUE_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="submit"
                  className="ft-send cat-modal-submit"
                  disabled={busy}
                >
                  <span>{busy ? "Sending…" : "Send request"}</span>
                  <svg
                    viewBox="0 0 24 24"
                    width="13"
                    height="13"
                    aria-hidden="true"
                  >
                    <path
                      d="M5 12h14M13 6l6 6-6 6"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                  </svg>
                </button>
                {error && (
                  <p className="ft-error" role="alert">
                    {error}
                  </p>
                )}
              </form>
            </>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export function DeveloperModal({ onClose }: { onClose: () => void }) {
  return (
    <Dialog.Root
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="cat-modal-overlay" />
        <Dialog.Content className="cat-modal" aria-describedby={undefined}>
          <Dialog.Title className="sr-only">Developer information</Dialog.Title>
          <button
            className="cat-modal-close"
            onClick={onClose}
            aria-label="Close"
          >
            <svg viewBox="0 0 18 18" width="14" height="14" fill="none">
              <path
                d="M1 1l16 16M17 1L1 17"
                stroke="currentColor"
                strokeWidth="1.5"
              />
            </svg>
          </button>
          <span className="cat-modal-kicker">Colophon</span>
          <p className="cat-modal-lead">
            This website was designed and developed by Rushan Haque. For
            assistance and technical support, visit{" "}
            <a
              href="https://www.rushanhaque.online"
              target="_blank"
              rel="noreferrer"
              className="dev-modal-link"
            >
              www.rushanhaque.online
            </a>
            .
          </p>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
