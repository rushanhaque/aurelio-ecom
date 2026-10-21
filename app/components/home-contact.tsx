import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type RefObject,
} from "react";
import * as Dialog from "@radix-ui/react-dialog";
import {
  ArrowUpRight,
  Check,
  Instagram,
  Mail,
  MessageCircle,
  X,
} from "lucide-react";
import { brand } from "../lib/brand";
import { request } from "../lib/request";
import "../home-contact.css";

const initialForm = {
  name: "",
  email: "",
  message: "",
};

export default function HomeContact({
  open,
  onOpenChange,
  triggerRef,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  triggerRef: RefObject<HTMLButtonElement | null>;
}) {
  const [form, setForm] = useState(initialForm);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [reference, setReference] = useState("");
  const sending = useRef(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const confirmation = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reference && open) confirmation.current?.focus();
  }, [reference, open]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending.current) return;
    const note = {
      topic: "General enquiry",
      name: form.name.trim(),
      email: form.email.trim(),
      message: form.message.trim(),
    };
    if (note.name.length < 2 || note.message.length < 10) {
      setError("Please add your name and a message of at least 10 characters.");
      return;
    }
    sending.current = true;
    setBusy(true);
    setError("");
    try {
      const response = await request<{ reference: string }>("/api/contact", {
        method: "POST",
        body: JSON.stringify(note),
      });
      if (!response.reference || typeof response.reference !== "string")
        throw new Error(
          "We couldn’t confirm your message. Please try again or contact us directly.",
        );
      setReference(response.reference);
    } catch (cause) {
      setError(
        document.documentElement.dataset.frontendPreview === "true"
          ? "Your note hasn’t been sent. Please reach us on WhatsApp or email while the online form is unavailable."
          : cause instanceof Error
            ? cause.message
            : "We couldn’t send your note. Please try again or contact us directly.",
      );
    } finally {
      sending.current = false;
      setBusy(false);
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="home-contact-backdrop" />
        <Dialog.Content
          id="home-contact-dialog"
          className="home-contact-dialog"
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            (reference ? confirmation.current : heading.current)?.focus();
          }}
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            triggerRef.current?.focus();
          }}
        >
          <Dialog.Close
            className="home-contact-close"
            aria-label="Close contact form"
          >
            <X size={19} strokeWidth={1.5} aria-hidden="true" />
          </Dialog.Close>
          <div className="home-contact-layout">
            <aside className="home-contact-intro">
              <span className="home-contact-eyebrow">
                AURELIO · THE ATELIER
              </span>
              <Dialog.Title
                ref={heading}
                tabIndex={-1}
                className="home-contact-title"
              >
                Let’s <em>talk.</em>
              </Dialog.Title>
              <Dialog.Description className="home-contact-description">
                A piece you love. A project in mind.
                <br />
                We’d love to hear from you.
              </Dialog.Description>
              <div
                className="home-contact-direct"
                aria-label="Contact us directly"
              >
                <a
                  href={brand.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle
                    size={20}
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />
                  <span>
                    <strong>WhatsApp</strong>
                    <small>{brand.phone}</small>
                  </span>
                  <ArrowUpRight size={15} aria-hidden="true" />
                </a>
                <a href={`mailto:${brand.email}`}>
                  <Mail size={20} strokeWidth={1.5} aria-hidden="true" />
                  <span>
                    <strong>Email</strong>
                    <small>
                      {brand.email.split("@")[0]}
                      <wbr />@{brand.email.split("@")[1]}
                    </small>
                  </span>
                  <ArrowUpRight size={15} aria-hidden="true" />
                </a>
                <a
                  href={brand.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Instagram size={20} strokeWidth={1.5} aria-hidden="true" />
                  <span>
                    <strong>Instagram</strong>
                    <small>
                      @{new URL(brand.instagram).pathname.replaceAll("/", "")}
                    </small>
                  </span>
                  <ArrowUpRight size={15} aria-hidden="true" />
                </a>
              </div>
              <p className="home-contact-credit">
                This website is designed and developed by Rushan Haque. To
                connect, visit{" "}
                <a
                  href="https://rushanhaque.in"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  rushanhaque.in
                </a>
              </p>
            </aside>
            <section className="home-contact-note" aria-label="Send a message">
              {reference ? (
                <div
                  className="home-contact-success"
                  ref={confirmation}
                  tabIndex={-1}
                  role="status"
                >
                  <span className="home-contact-check">
                    <Check size={25} strokeWidth={1.5} aria-hidden="true" />
                  </span>
                  <h3>Your note is with us.</h3>
                  <p>
                    Thank you for getting in touch. Our team will reply to{" "}
                    {form.email}.
                  </p>
                  <span className="home-contact-reference">
                    Your reference · {reference}
                  </span>
                  <button
                    type="button"
                    className="home-contact-submit"
                    onClick={() => {
                      setReference("");
                      setForm(initialForm);
                      setError("");
                    }}
                  >
                    Write another note{" "}
                    <ArrowUpRight size={17} aria-hidden="true" />
                  </button>
                </div>
              ) : (
                <>
                  <h3>Leave us a note</h3>
                  <p id="home-contact-reply" className="home-contact-reply">
                    We usually reply within two working days.
                  </p>
                  <form
                    onSubmit={submit}
                    aria-describedby="home-contact-reply"
                    aria-busy={busy}
                  >
                    <fieldset disabled={busy} className="home-contact-fields">
                      <legend className="sr-only">
                        Your contact details and message
                      </legend>
                      <div className="home-contact-row">
                        <label htmlFor="home-contact-name">
                          Your name
                          <input
                            id="home-contact-name"
                            name="name"
                            autoComplete="name"
                            placeholder="Your name"
                            required
                            minLength={2}
                            maxLength={100}
                            value={form.name}
                            onChange={(e) =>
                              setForm({ ...form, name: e.target.value })
                            }
                          />
                        </label>
                        <label htmlFor="home-contact-email">
                          Email address
                          <input
                            id="home-contact-email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            placeholder="Your email"
                            required
                            maxLength={254}
                            value={form.email}
                            onChange={(e) =>
                              setForm({ ...form, email: e.target.value })
                            }
                          />
                        </label>
                      </div>
                      <label htmlFor="home-contact-message">
                        Your message
                        <textarea
                          id="home-contact-message"
                          name="message"
                          placeholder="Tell us a little about what you have in mind…"
                          required
                          minLength={10}
                          maxLength={4000}
                          rows={4}
                          value={form.message}
                          onChange={(e) =>
                            setForm({ ...form, message: e.target.value })
                          }
                        />
                      </label>
                      {error && (
                        <p className="home-contact-error" role="alert">
                          {error}
                        </p>
                      )}
                      <button
                        className="home-contact-submit"
                        type="submit"
                        disabled={busy}
                      >
                        {busy ? "Sending your note…" : "Send your note"}
                        <ArrowUpRight
                          size={17}
                          strokeWidth={1.5}
                          aria-hidden="true"
                        />
                      </button>
                    </fieldset>
                    <p className="home-contact-privacy">
                      We’ll only use these details to reply to your enquiry.
                    </p>
                  </form>
                </>
              )}
            </section>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
