# Aurelio

Custom React + Express + MongoDB storefront with server rendering, TypeScript, GSAP and an intentionally empty catalog. No sample products, prices or stock are seeded. Brand imagery combines the original Aurelio archive with generated decorative artwork; none of it automatically creates inventory. See `docs/BRAND_CONTENT.md` for provenance.

**Current status:** a functional local storefront/studio, not a live payment store. Read `docs/IMPLEMENTATION_STATUS.md` for the full plan audit and genuine remaining work. `docs/STUDIO_GUIDE.md` explains operating the new features.

## Start locally

Requires Node.js 22.12+ (tested with 24.15).

```sh
npm install
npm run dev
```

Open http://localhost:3000. Without MONGODB_URI, development starts a real local MongoDB replica set, stores its database under `.data/mongodb`, and downloads the official MongoDB binary on first run. The initial download can be large. An existing MongoDB replica-set connection can be supplied instead.

For a faster local review of the optimized frontend, stop the dev server, then run `npm run build` followed by `npm run preview`. This binds only to 127.0.0.1 and enables unpaid preview orders against the same local database. It is not a deployment command.

## Add your products

1. Copy `.env.example` to `.env` if a local `.env` has not already been prepared.
2. Set a long random `ADMIN_TOKEN` in `.env`, and restart the server after changing configuration.
3. Open http://localhost:3000/admin and enter that token.
4. Choose **Add a product**, upload your own photograph, add descriptions, dimensions, care instructions, stock and explicit prices in INR, USD, GBP and EUR.
5. Choose **Published** in the publication selector and save. New products default to **Draft**. Add a unique SKU, link finish/size options with a shared style code, and upload additional gallery photographs as needed. The studio also manages enquiries, quotations, support requests and help-page content.

Prices are stored as integer minor units. The admin form accepts full currency amounts. Uploaded images are checked and re-encoded as WebP. Images are stored in `public/uploads` and require persistent storage in a hosted environment. Admin tokens remain in browser memory only; they are not stored in localStorage. Never commit `.env`.

## Included

- Responsive home, collection landing pages, filterable shop, product details and image zoom.
- Empty-catalog launch presentation, with no invented products or prices.
- Wishlist and bag saved on the current device; currency selection; search panel.
- Guest preview checkout with server pricing, MongoDB transactions, stock checks and idempotent retries.
- Customer registration/sign-in, secure session cookies, order history and private guest order access keys.
- Profiles/address books, saved-address checkout, paginated order history, password changes and one-time verification/recovery links in a private local email preview.
- Persisted bulk enquiries, contact messages and newsletter consent.
- Cart-to-bulk selections, assigned enquiries and follow-up dates, versioned private quotations and idempotent unpaid order drafts.
- Order-linked after-sales requests, customer-visible updates, email unsubscribe and essential-storage information.
- Draft/published/archived products, galleries, stock-adjustment reasons and audit records.
- Help/policy content editor with private drafts, preview, publishing, saved versions and edit-conflict protection.
- Craft, journal and article pages; shipping, returns, care, FAQ, privacy, terms and accessibility pages.
- Token-protected studio dashboard and manual catalog management.
- Reduced-motion support, keyboard-accessible dialogs, route-based code splitting, responsive WebP assets and self-hosted fonts.

## Verification

```sh
npm run typecheck
npm test
npm run build
```

With the local server running, `npm run test:smoke` verifies APIs and server-rendered routes without adding products. `npm run test:integration` exercises order races and stock transactions; `npm run test:operations` checks account/security/quote/content workflows; `npm run test:backup` performs a restore drill. Integration fixtures use separate disposable databases and never add objects to your storefront catalog. The local MongoDB port defaults to 63938 and must remain stable for persisted replica-set data.

`npm run assets` regenerates editorial WebP sizes from local source PNGs. Exact generation prompts are recorded in `docs/ASSET_PROMPTS.md`.

## Production configuration and launch prerequisites

```sh
npm run build
npm start
```

Production requires `MONGODB_URI` (a replica set, such as MongoDB Atlas), `SITE_URL`, a secure `ADMIN_TOKEN`, persistent upload storage, and reverse-proxy HTTPS. Configure `HOST` for the deployment target; the default is loopback for local use. Back up the database and uploaded assets.

**This is a working local preview, not a live payment store.** Checkout collects no card data or money. It records an explicitly unpaid preview order and decrements preview stock transactionally. Production preview checkout is disabled unless `ALLOW_PREVIEW_ORDERS=true` is deliberately set. Live payments must use a verified gateway integration, authenticated webhooks, payment reconciliation and inventory reservation/release before enabling real orders.

Before public launch: implement and verify the live payment/reservation/refund integrations; configure actual delivery/tax/duty services and countries; approve legal policies; connect transactional email and marketing delivery; add staff identities/roles/MFA, monitoring and integration workers; configure trusted proxy/rate limits for the host; complete accessibility and performance audits with real catalog content. Nonce CSP, recovery UI and newsletter unsubscribe now exist, but do not substitute for those remaining integrations. Existing legal/support pages honestly describe preview limitations and are not final business policies. See the audit for additional engineering gaps, not just account/configuration dependencies.

`npm run check:production` reports environment blockers without printing secrets. CI and a Docker recipe are provided but have not been deployed. `npm run backup:export` writes a private EJSON snapshot; `npm run backup:restore -- <file> aurelio_restore_<new-name>` only restores into a new empty database. Uploaded assets require a separate backup. No point-in-time recovery guarantee is claimed.

## Structure

- `app/`: React Router SSR storefront, store context, visual components and route modules.
- `server/`: Express APIs, MongoDB connection, validated product and commerce rules.
- `public/images/`: optimized editorial assets and source artwork.
- `public/uploads/`: product photographs you upload manually.
- `tests/`: isolated commerce validation tests; they do not insert products.
- `AURELIO_IMPLEMENTATION_PLAN.md`: researched long-term implementation plan.

No website has been deployed and no external email or payment service is connected.
