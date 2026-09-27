# Running the Aurelio studio

## Products

Open `/admin`, unlock with the private `ADMIN_TOKEN` from your own `.env`, and choose Products. New objects start as drafts. Add your own image, copy, material, finish, dimensions, stock and explicit market prices; choose Published when ready. An empty catalog remains empty until you add objects.

Use a unique SKU. To offer another finish or size, create a separate SKU record with the same style code; the product page links those published options. Upload up to eight additional photographs. Stock changes require a reason. If stock changed since the editor opened, refresh before saving. Archive hides an object while retaining its record; deleting removes the catalog entry while old order snapshots remain.

## Accounts and local email

Customers can edit their profile/addresses and change their password under `/account`. Password changes sign out all sessions. Saved addresses are optional at checkout. Account recovery lives at `/account/link`; verification can be requested from the account profile.

In `npm run preview`, the studio’s **Local email** tab contains expiring verification/reset links. These are private development messages, not sent emails. A new link invalidates older links for the same purpose. Verification lasts one hour, password recovery thirty minutes. Opening a link does not consume it; the explicit confirm/reset action does.

Never enable `LOCAL_EMAIL_PREVIEW=true` on a public deployment. The production route returns an honest unavailable message until live delivery is implemented. A delivery provider/domain still needs to be connected and verified. Email setup research consulted the [Cloudflare Email Service skill](C:/Users/rusha/.codex/skills/cloudflare-email-service/SKILL.md) and [official API reference](https://developers.cloudflare.com/api/resources/email_sending/); no Cloudflare integration or account was enabled.

## Enquiries and quotations

Enquiries retain contact details, the brief, and any objects carried over from the shopping bag. Set an owner, notes, status and follow-up date. The date is a stored reminder for staff, not an automatic email schedule.

Open “Create a versioned quotation” on an enquiry. Enter line descriptions/quantities/prices, freight, tax, validity and complete production/payment/duty terms using approved business information. All money becomes integer minor units on the server. The returned secure link is intended only for that customer; sharing it is a separate manual action.

A new version supersedes older open versions. The customer’s “Request order draft” creates one unpaid draft even when repeated. View it in **Order drafts**. It does not take payment, reserve stock or book shipping. Do not interpret it as a paid retail order.

## After-sales

Customers open their authenticated order or secure guest order link and submit a question, return, damage or cancellation request. The **Returns** studio tab records review status and internal notes. Only the customer-update field appears on their order page. This workflow does not itself issue refunds or approve return eligibility.

## Content

Open `/cms` to enter the Content workspace directly, or use the **Content** tab in `/admin`. It edits the homepage material atelier heading, introduction and footnotes, plus shipping, returns, FAQ, privacy, terms and accessibility. Review the built-in preview. Save without the publication checkbox to keep a private draft; an existing published version stays unchanged. Tick the checkbox to publish. Loading a saved version puts it in the editor for review; save/publish it explicitly to restore. Text is rendered as text, never arbitrary HTML or scripts.

The other cinematic homepage sections, material facts, original collections and journal remain code-managed. Final policy copy must describe the actual business rather than the local preview.

## Local verification

Run `npm run typecheck`, `npm test`, then `npm run build`. Use `npm run preview` for the optimized local site. With that server running, execute `npm run test:integration`, `npm run test:operations`, `npm run test:backup`, and `npm run test:smoke`. On Windows PowerShell with a restrictive script policy, use `npm.cmd` instead of changing system execution policy.

## Backup and restore

`npm run backup:export` writes a private snapshot under `.data/backups`. It contains customer information: protect it, encrypt off-site backups, and never commit it. It excludes sessions and recovery tokens. It includes catalog, customers, orders, forms, quotes, drafts, content versions and audit records. Copy uploaded media separately; database backup does not include image files.

Use `npm run backup:restore -- <file> aurelio_restore_<name>` to restore to a **new empty database only**. Existing databases are refused. Application startup recreates indexes; validate records, assets and any external payment reconciliation before a separately reviewed cutover. The built-in disposable drill verifies BSON ObjectId and Date preservation and refuses overwrites. This tool does not provide managed point-in-time recovery.

## Production

Run `npm run check:production` and read `IMPLEMENTATION_STATUS.md`. The checker detects obvious environment mistakes; it does not certify the outstanding gateway/carrier/MFA/legal/monitoring work. The Dockerfile is a deployment starting point and has not been run in this environment. Set a real MongoDB replica URI, HTTPS origin and persistent upload volume; configure private secrets on the host. Keep indexing disabled until the store is approved for launch. No remote deployment has been performed.
