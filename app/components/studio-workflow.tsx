import { useState } from "react";
import { request } from "../lib/store";
export function StudioWorkflow({
  record,
  kind,
  headers,
  refresh,
}: {
  record: any;
  kind: "messages" | "returns" | "enquiries";
  headers: Record<string, string>;
  refresh: () => Promise<void>;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const statuses =
    kind === "enquiries"
      ? [
          "new",
          "reviewing",
          "clarification",
          "quoted",
          "follow-up",
          "won",
          "lost",
          "closed",
        ]
      : [
          "new",
          "requested",
          "reviewing",
          "awaiting-customer",
          "resolved",
          "closed",
        ];
  return (
    <form
      className="workflow-form"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setError("");
        setSaved(false);
        const data = Object.fromEntries(new FormData(e.currentTarget));
        try {
          await request(
            kind === "enquiries"
              ? `/api/admin/enquiries/${record.reference}`
              : `/api/admin/workflow/${kind}/${record.reference}`,
            { method: "PATCH", headers, body: JSON.stringify(data) },
          );
          await refresh();
          setSaved(true);
        } catch (e) {
          setError((e as Error).message);
        } finally {
          setBusy(false);
        }
      }}
    >
      <label className="field">
        <span>Status</span>
        <select name="status" defaultValue={record.status}>
          {statuses.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </label>
      {kind === "enquiries" && (
        <div className="form-grid">
          <label className="field">
            <span>Assigned to</span>
            <input name="owner" defaultValue={record.owner} maxLength={100} />
          </label>
          <label className="field">
            <span>Follow-up date</span>
            <input name="followUp" type="date" defaultValue={record.followUp} />
          </label>
        </div>
      )}
      <label className="field">
        <span>Internal notes</span>
        <textarea
          name="internalNotes"
          defaultValue={record.internalNotes}
          maxLength={4000}
          rows={3}
        />
      </label>
      {kind === "returns" && (
        <label className="field">
          <span>Update visible on the customer’s order page</span>
          <textarea
            name="customerUpdate"
            defaultValue={record.customerUpdate}
            maxLength={1000}
            rows={2}
          />
        </label>
      )}
      <p className="form-error" role="alert">
        {error}
      </p>
      <p role="status">{saved ? "Changes saved." : ""}</p>
      <button className="button button-outline" disabled={busy}>
        {busy ? "Saving…" : "Save update"}
      </button>
    </form>
  );
}
