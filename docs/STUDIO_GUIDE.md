# Running the Aurelio studio

The retail shop runs on Shopify and is managed there (products, orders, payments, customers). This studio handles the trade side.

## Local email

In development, the studio's **Local email** tab shows the messages the site would have sent (enquiry alerts, quotation notices). They are private development messages, not sent emails. Never enable `LOCAL_EMAIL_PREVIEW=true` on a public deployment; production sends through Amazon SES (see `docs/LAUNCH_SETUP.md`).

## Enquiries and quotations

Enquiries retain contact details, the brief, and any pictures the visitor attached. Set an owner, notes, status and follow-up date. The date is a stored reminder for staff, not an automatic email schedule.

Open “Create a versioned quotation” on an enquiry. Enter line descriptions/quantities/prices, freight, tax, validity and complete production/payment/duty terms using approved business information. All money becomes integer minor units on the server. The returned secure link is intended only for that customer; sharing it is a separate manual action.

A new version supersedes older open versions. The customer’s “Request order draft” creates one unpaid draft even when repeated. View it in **Order drafts**. It does not take payment, reserve stock or book shipping.

## Content

Open `/cms` to enter the Content workspace directly, or use the **Content** tab in `/admin`. It edits the homepage material atelier heading, introduction and footnotes, plus FAQ, privacy, terms and accessibility. Review the built-in preview. Save without the publication checkbox to keep a private draft; an existing published version stays unchanged. Tick the checkbox to publish. Loading a saved version puts it in the editor for review; save/publish it explicitly to restore. Text is rendered as text, never arbitrary HTML or scripts.

The other cinematic homepage sections, material facts, original collections and journal remain code-managed. Final policy copy must describe the actual business rather than the local preview.

## Local verification

Run `npm run typecheck`, `npm test`, then `npm run build`. Use `npm run preview` for the optimized local site. `npm run test:integration` and `npm run test:operations` start their own throwaway database. With the local server running, execute `npm run test:backup` and `npm run test:smoke`. On Windows PowerShell with a restrictive script policy, use `npm.cmd` instead of changing system execution policy.

## Backup and restore

`npm run backup:export` writes a private snapshot under `.data/backups`. It contains people's contact details: protect it, encrypt off-site backups, and never commit it. It includes enquiries (with their pictures), messages, newsletter consent, quotes, drafts, content versions and audit records.

Use `npm run backup:restore -- <file> aurelio_restore_<name>` to restore to a **new empty database only**. Existing databases are refused. Application startup recreates indexes; validate records before a separately reviewed cutover. The built-in disposable drill verifies BSON ObjectId and Date preservation and refuses overwrites. This tool does not provide managed point-in-time recovery.

## Production

Run `npm run check:production` and read `IMPLEMENTATION_STATUS.md`. The checker detects obvious environment mistakes; it does not certify MFA, legal review or monitoring. The Dockerfile is a deployment starting point and has not been run in this environment. Set a real MongoDB replica URI and HTTPS origin; configure private secrets on the host. Keep indexing disabled until the site is approved for launch. No remote deployment has been performed.
