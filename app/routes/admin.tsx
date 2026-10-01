import { collections, materials } from "../lib/brand-content";
import { StudioWorkflow } from "../components/studio-workflow";
import { QuoteEditor } from "../components/quote-editor";
import { ContentEditor } from "../components/content-editor";
import { useState } from "react";
import { useRevalidator, useLocation } from "react-router";
import {
  Plus,
  ArrowUpRight,
  LogOut,
  Trash2,
  Pencil,
  Upload,
} from "lucide-react";
import { PageIntro, Field, Picture } from "../components/ui";
import { request } from "../lib/store";
import { currencies, money, type Product } from "../lib/catalog";
export const meta = () => [
  { title: "Studio dashboard — Aurelio" },
  { name: "robots", content: "noindex,nofollow" },
];
export default function Admin() {
  const location = useLocation();
  const [token, setToken] = useState(""),
    [data, setData] = useState<any>(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [tab, setTab] = useState(
      location.pathname === "/cms" ? "content" : "products",
    ),
    [editing, setEditing] = useState<Product | null | undefined>(),
    [image, setImage] = useState(""),
    [gallery, setGallery] = useState<string[]>([]),
    [uploading, setUploading] = useState(false);
  const revalidator = useRevalidator();
  const headers = { Authorization: `Bearer ${token}` };
  async function refresh() {
    const r = await request("/api/admin/overview", { headers });
    setData(r);
  }
  async function login(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function upload(file?: File, extra = false) {
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        headers: { ...headers, "Content-Type": file.type },
        body: file,
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);
      if (extra)
        setGallery((previous) => [...previous, result.image].slice(0, 8));
      else setImage(result.image);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setUploading(false);
    }
  }
  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const form = new FormData(e.currentTarget),
      fields = Object.fromEntries(form),
      prices = Object.fromEntries(
        currencies.map((c) => [
          c,
          Math.round(Number(form.get(`price-${c}`)) * 100),
        ]),
      );
    const product = {
      ...fields,
      image,
      gallery,
      prices,
      stock: Number(fields.stock),
      featured: form.get("featured") === "on",
    };
    try {
      await request(`/api/admin/products${editing ? `/${editing.id}` : ""}`, {
        method: editing ? "PATCH" : "POST",
        headers,
        body: JSON.stringify(product),
      });
      setEditing(undefined);
      await refresh();
      revalidator.revalidate();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <PageIntro title="Behind the collection.">
        <p>Your objects, enquiries and orders. In one place.</p>
      </PageIntro>
      <section className="admin-section container">
        {!data ? (
          <form className="editorial-form admin-login" onSubmit={login}>
            <h2>Studio access</h2>
            <label className="field">
              <span>Administrator access token</span>
              <input
                type="password"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                required
                autoComplete="off"
              />
            </label>
            <p className="muted">
              Use the ADMIN_TOKEN configured in your local .env file. The token
              stays in memory and is cleared when you leave this page.
            </p>
            <p className="form-error" role="alert">
              {error}
            </p>
            <button className="button" disabled={busy}>
              {busy ? "Opening…" : "Open the studio"}
              <ArrowUpRight size={18} />
            </button>
          </form>
        ) : (
          <>
            <div className="admin-toolbar">
              <div className="auth-tabs">
                {[
                  "products",
                  "enquiries",
                  "orders",
                  "draftOrders",
                  "messages",
                  "returns",
                  "emailPreview",
                  "content",
                ].map((t) => (
                  <button
                    className={tab === t ? "active" : ""}
                    key={t}
                    onClick={() => {
                      setTab(t);
                      setEditing(undefined);
                    }}
                  >
                    {t === "draftOrders"
                      ? "Order drafts"
                      : t === "emailPreview"
                        ? "Local email"
                        : t}
                    {t !== "content" && <span>{data[t]?.length || 0}</span>}
                  </button>
                ))}
              </div>
              <button
                className="text-link"
                onClick={() => {
                  setToken("");
                  setData(null);
                }}
              >
                Lock studio
                <LogOut size={16} />
              </button>
            </div>
            <p className="form-error" role="alert">
              {error}
            </p>
            {tab === "products" && (
              <>
                {editing === undefined ? (
                  <>
                    <div className="section-heading">
                      <div>
                        <h2>Your objects</h2>
                        <p>
                          No products are added automatically. This catalog is
                          yours to build.
                        </p>
                      </div>
                      <button
                        className="button"
                        onClick={() => {
                          setEditing(null);
                          setImage("");
                          setGallery([]);
                          setError("");
                        }}
                      >
                        Add a product
                        <Plus size={18} />
                      </button>
                    </div>
                    {data.products.length ? (
                      <div className="admin-products">
                        {data.products.map((p: Product) => (
                          <div className="admin-product" key={p.id}>
                            <Picture name={p.image} alt={p.name} />
                            <div>
                              <h3>{p.name}</h3>
                              <p>
                                {p.stock} available · {money(p.prices.INR)} ·{" "}
                                {p.status || "published"}
                                {p.stock <= 5 ? " · Low stock" : ""}
                              </p>
                            </div>
                            <button
                              className="icon-button"
                              aria-label={`Edit ${p.name}`}
                              onClick={() => {
                                setEditing(p);
                                setImage(p.image);
                                setGallery(p.gallery || []);
                              }}
                            >
                              <Pencil size={18} />
                            </button>
                            <button
                              className="icon-button"
                              aria-label={`Delete ${p.name}`}
                              onClick={async () => {
                                if (
                                  !confirm(
                                    `Remove ${p.name} from the catalog? Existing orders will retain their details.`,
                                  )
                                )
                                  return;
                                try {
                                  await request(`/api/admin/products/${p.id}`, {
                                    method: "DELETE",
                                    headers,
                                  });
                                  await refresh();
                                  revalidator.revalidate();
                                } catch (e) {
                                  setError((e as Error).message);
                                }
                              }}
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="quiet-empty">
                        <span className="empty-star">✳</span>
                        <h3>A blank canvas.</h3>
                        <p>Your first product starts the collection.</p>
                      </div>
                    )}
                  </>
                ) : (
                  <form
                    className="editorial-form product-editor"
                    onSubmit={save}
                  >
                    <div className="section-heading">
                      <h2>{editing ? "Edit your object" : "A new object"}</h2>
                      <button
                        className="text-link"
                        type="button"
                        onClick={() => setEditing(undefined)}
                      >
                        Cancel
                      </button>
                    </div>
                    <div className="form-grid">
                      <label className="field">
                        <span>Publication</span>
                        <select
                          name="status"
                          defaultValue={
                            editing?.status || (editing ? "published" : "draft")
                          }
                        >
                          <option value="draft">
                            Draft — hidden from shop
                          </option>
                          <option value="published">Published</option>
                          <option value="archived">
                            Archived — hidden from shop
                          </option>
                        </select>
                      </label>
                      <Field
                        label="SKU"
                        name="sku"
                        required={false}
                        defaultValue={editing?.sku}
                      />
                      <Field
                        label="Style code (shared by finish/size variants)"
                        name="styleCode"
                        required={false}
                        defaultValue={editing?.styleCode}
                      />
                      <Field
                        label="Production / dispatch lead time"
                        name="leadTime"
                        required={false}
                        defaultValue={editing?.leadTime}
                      />
                      <Field
                        label="Stock adjustment reason"
                        name="stockReason"
                        required={false}
                      />
                      <Field
                        label="Product name"
                        name="name"
                        defaultValue={editing?.name}
                      />
                      <Field
                        label="URL slug"
                        name="slug"
                        placeholder="your-product-name"
                        defaultValue={editing?.slug}
                      />
                      <Field
                        label="Subtitle"
                        name="subtitle"
                        required={false}
                        defaultValue={editing?.subtitle}
                      />
                      <label className="field">
                        <span>Category</span>
                        <select
                          name="category"
                          defaultValue={editing?.category || "urns"}
                        >
                          {collections
                            .filter((c) => c.slug !== "bespoke")
                            .map((c) => (
                              <option value={c.slug} key={c.slug}>
                                {c.name}
                              </option>
                            ))}
                        </select>
                      </label>
                      <label className="field">
                        <span>Material</span>
                        <input
                          name="material"
                          required
                          list="aurelio-materials"
                          defaultValue={editing?.material}
                        />
                        <datalist id="aurelio-materials">
                          {materials.map((m) => (
                            <option key={m.slug} value={m.name} />
                          ))}
                        </datalist>
                      </label>
                      <Field
                        label="Finish"
                        name="finish"
                        defaultValue={editing?.finish}
                      />
                      <Field
                        label="Dimensions"
                        name="dimensions"
                        placeholder="Width × depth × height"
                        defaultValue={editing?.dimensions}
                      />
                      <Field
                        label="Weight"
                        name="weight"
                        required={false}
                        defaultValue={editing?.weight}
                      />
                      <Field
                        label="Stock quantity"
                        name="stock"
                        type="number"
                        defaultValue={String(editing?.stock ?? 0)}
                      />
                    </div>
                    <div className="upload-field">
                      <label className="field">
                        <span>
                          Product photograph · JPG, PNG or WebP · up to 8 MB
                        </span>
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          onChange={(e) => upload(e.target.files?.[0])}
                        />
                      </label>
                      {uploading ? (
                        <p role="status">Preparing your photograph…</p>
                      ) : image ? (
                        <Picture
                          name={image}
                          alt="Uploaded product photograph"
                        />
                      ) : (
                        <p>
                          Upload your own product photograph. No sample image
                          will be assigned.
                        </p>
                      )}
                    </div>
                    <h3>Prices by market</h3>
                    <label className="field">
                      <span>Additional product photographs · up to 8</span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        disabled={uploading || gallery.length >= 8}
                        onChange={(e) => upload(e.target.files?.[0], true)}
                      />
                    </label>
                    <div className="gallery-thumbs">
                      {gallery.map((src, index) => (
                        <button
                          key={src}
                          type="button"
                          aria-label={`Remove gallery photograph ${index + 1}`}
                          onClick={() =>
                            setGallery((items) =>
                              items.filter((item) => item !== src),
                            )
                          }
                        >
                          <Picture
                            name={src}
                            alt={`Gallery photograph ${index + 1}. Click to remove.`}
                          />
                        </button>
                      ))}
                    </div>
                    <p className="muted">
                      Enter full currency amounts, e.g. 4800 for ₹4,800. These
                      are explicit market prices, not automatic currency
                      conversions.
                    </p>
                    <div className="form-grid">
                      {currencies.map((c) => (
                        <label key={c} className="field">
                          <span>{c} price</span>
                          <input
                            type="number"
                            name={`price-${c}`}
                            step="0.01"
                            min="0.01"
                            required
                            defaultValue={
                              editing ? editing.prices[c] / 100 : undefined
                            }
                          />
                        </label>
                      ))}
                    </div>
                    <label className="field">
                      <span>Description</span>
                      <textarea
                        name="description"
                        minLength={10}
                        required
                        rows={4}
                        defaultValue={editing?.description}
                      />
                    </label>
                    <label className="field">
                      <span>Care instructions</span>
                      <textarea
                        name="care"
                        minLength={5}
                        required
                        rows={3}
                        defaultValue={editing?.care}
                      />
                    </label>
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="featured"
                        defaultChecked={editing?.featured}
                      />
                      Feature on the home page
                    </label>
                    <p className="form-error" role="alert">
                      {error}
                    </p>
                    <button
                      className="button"
                      disabled={busy || uploading || !image}
                    >
                      {busy
                        ? "Saving…"
                        : editing
                          ? "Save changes"
                          : "Save product"}
                      <ArrowUpRight size={18} />
                    </button>
                  </form>
                )}
              </>
            )}
            {tab === "enquiries" && (
              <div className="admin-records">
                {data.enquiries.length ? (
                  data.enquiries.map((q: any) => (
                    <article key={q.reference}>
                      <div>
                        <p className="eyebrow">{q.reference}</p>
                        <h3>
                          {q.name} {q.company && `/ ${q.company}`}
                        </h3>
                        <p>
                          {q.email} · {q.country} · Quantity: {q.quantity}
                        </p>
                        <p>{q.product}</p>
                        {q.selections?.map((item: any) => (
                          <p key={item.productId}>
                            {item.name} · {item.finish} · {item.sku} ×{" "}
                            {item.quantity}
                          </p>
                        ))}
                        <p className="preserve-lines">{q.message}</p>
                      </div>
                      <StudioWorkflow
                        record={q}
                        kind="enquiries"
                        headers={headers}
                        refresh={refresh}
                      />
                      <QuoteEditor
                        reference={q.reference}
                        headers={headers}
                        refresh={refresh}
                      />
                    </article>
                  ))
                ) : (
                  <p>No enquiries yet.</p>
                )}
              </div>
            )}
            {tab === "orders" && (
              <div className="admin-records">
                {data.orders.length ? (
                  data.orders.map((o: any) => (
                    <article key={o.reference}>
                      <div>
                        <p className="eyebrow">{o.reference}</p>
                        <h3>{o.name}</h3>
                        <p>
                          {o.email} · {o.paymentStatus}
                        </p>
                        <p>
                          {o.lines
                            .map((l: any) => `${l.name} × ${l.quantity}`)
                            .join(", ")}
                        </p>
                        <p>
                          {o.address}, {o.city}, {o.country}
                        </p>
                      </div>
                      <strong>{money(o.total, o.currency)}</strong>
                    </article>
                  ))
                ) : (
                  <p>No orders yet.</p>
                )}
              </div>
            )}
            {tab === "draftOrders" && (
              <div className="admin-records">
                {data.draftOrders.length ? (
                  data.draftOrders.map((draft: any) => (
                    <article key={draft.reference}>
                      <div>
                        <p className="eyebrow">
                          {draft.reference} / {draft.enquiry}
                        </p>
                        <h3>Awaiting studio confirmation</h3>
                        {draft.lines.map((line: any, i: number) => (
                          <p key={i}>
                            {line.description} × {line.quantity}
                          </p>
                        ))}
                        <p className="preserve-lines">{draft.terms}</p>
                        <p>Unpaid. No stock reserved or shipment created.</p>
                      </div>
                      <strong>{money(draft.total, draft.currency)}</strong>
                    </article>
                  ))
                ) : (
                  <p>No accepted quotations yet.</p>
                )}
              </div>
            )}
            {tab === "content" && <ContentEditor headers={headers} />}
            {tab === "messages" && (
              <div className="admin-records">
                {data.messages.length ? (
                  data.messages.map((m: any) => (
                    <article key={m.reference}>
                      <div>
                        <p className="eyebrow">
                          {m.reference} / {m.topic}
                        </p>
                        <h3>{m.name}</h3>
                        <p>{m.email}</p>
                        <p className="preserve-lines">{m.message}</p>
                      </div>
                      <StudioWorkflow
                        record={m}
                        kind="messages"
                        headers={headers}
                        refresh={refresh}
                      />
                    </article>
                  ))
                ) : (
                  <p>No messages yet.</p>
                )}
              </div>
            )}
            {tab === "returns" && (
              <div className="admin-records">
                {data.returns.length ? (
                  data.returns.map((record: any) => (
                    <article key={record.reference}>
                      <div>
                        <p className="eyebrow">
                          {record.reference} / {record.type || "question"}
                        </p>
                        <h3>After-sales request</h3>
                        <p className="preserve-lines">{record.reason}</p>
                      </div>
                      <StudioWorkflow
                        record={record}
                        kind="returns"
                        headers={headers}
                        refresh={refresh}
                      />
                    </article>
                  ))
                ) : (
                  <p>No after-sales requests yet.</p>
                )}
              </div>
            )}
            {tab === "emailPreview" && (
              <div className="admin-records">
                <p>
                  Local development inbox. These messages have not been sent.
                  Links expire and can be used once. This inbox is disabled
                  outside local preview mode.
                </p>
                {data.emailPreview.map((mail: any, i: number) => (
                  <article key={i}>
                    <div>
                      <p className="eyebrow">{mail.to}</p>
                      <h3>{mail.subject}</h3>
                      <p>Expires {new Date(mail.expiresAt).toLocaleString()}</p>
                      <a className="text-link" href={mail.url}>
                        Open account link ↗
                      </a>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </>
        )}
      </section>
    </>
  );
}
