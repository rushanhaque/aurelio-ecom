# Aurelio

React + Express + MongoDB site for Aurelio by AF International, with server rendering, TypeScript and GSAP: the atelier, the trade catalogue, export and bulk enquiries, quotations and a studio dashboard. **Retail sales run on a separate Shopify store**; every "Visit the shop" button goes there (set `brand.shopUrl` in `app/lib/brand.ts`). See `docs/BRAND_CONTENT.md` for image provenance.

Read `docs/IMPLEMENTATION_STATUS.md` for the plan audit and `docs/STUDIO_GUIDE.md` for operating the studio.

## Start locally

Requires Node.js 22.12+ (tested with 24.15).

```sh
npm install
npm run dev
```

Open http://localhost:3000. Without MONGODB_URI, development starts a real local MongoDB replica set, stores its database under `.data/mongodb`, and downloads the official MongoDB binary on first run. The initial download can be large. An existing MongoDB replica-set connection can be supplied instead.

For a faster local review of the optimized frontend, stop the dev server, then run `npm run build` followed by `npm run preview`. This binds only to 127.0.0.1. It is not a deployment command.

## The studio

1. Copy `.env.example` to `.env` if a local `.env` has not already been prepared.
2. Set a long random `ADMIN_TOKEN` in `.env`, and restart the server after changing configuration.
3. Open http://localhost:3000/admin and enter that token. Admin tokens remain in browser memory only.

The studio manages enquiries (with the pictures visitors attach), versioned quotations, contact messages and the help/policy pages. Never commit `.env`.

## Included

- Landing film, collection pages and the trade catalogue of made-to-order pieces.
- Export and bulk page with the enquiry form; "Your form, your finish" lets visitors drop a photo, drawing or sketch to start an enquiry.
- Persisted enquiries, contact messages and newsletter consent, with idempotent retries.
- Assigned enquiries and follow-up dates, versioned private quotations and idempotent unpaid order drafts.
- Help/policy content editor with private drafts, publishing, saved versions and edit-conflict protection.
- About, materials, care, journal, FAQ, privacy, terms and accessibility pages.
- Reduced-motion support, keyboard-accessible dialogs, route-based code splitting, responsive WebP assets and self-hosted fonts.

## Verification

```sh
npm run typecheck
npm test
npm run build
```

`npm run test:integration` (enquiries) and `npm run test:operations` (studio, quotations, content) each start their own throwaway MongoDB. With the local server running, `npm run test:smoke` verifies APIs and server-rendered routes, and `npm run test:backup` performs a restore drill. The local MongoDB port defaults to 63938 and must remain stable for persisted replica-set data.

`npm run assets` regenerates editorial WebP sizes from local source PNGs. Exact generation prompts are recorded in `docs/ASSET_PROMPTS.md`.

## Production

```sh
npm run build
npm start
```

Production requires `MONGODB_URI` (a replica set, such as MongoDB Atlas), `SITE_URL`, a secure `ADMIN_TOKEN`, email through SES, and HTTPS in front. Follow [docs/LAUNCH_SETUP.md](docs/LAUNCH_SETUP.md). `npm run check:production` reports blockers without printing secrets. `npm run backup:export` writes a private EJSON snapshot; `npm run backup:restore -- <file> aurelio_restore_<new-name>` only restores into a new empty database.

## Structure

- `app/`: React Router SSR site, visual components and route modules.
- `server/`: Express APIs, MongoDB connection, enquiries, quotations, content and email.
- `public/images/`: optimized editorial assets and source artwork.
- `tests/`: validation and isolated integration tests.

No website has been deployed.
