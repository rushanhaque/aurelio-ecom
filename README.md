# Aurelio

A homepage for Aurelio by AF International, built with React Router, TypeScript, and Express. The responsive background film, liquid-glass contact popup, and introductory wordmark are the only visitor-facing experience in this repository.

- **Visit the shop** links to `https://shop.aurelio.in`, with a **Coming soon** label on the homepage.
- **Explore bulk export** links to `https://exports.aurelio.in`.
- Contact opens the existing name, email, and message form, with WhatsApp, email, and Instagram cards. The film keeps playing while the popup is open.

The former shop, export/catalogue, editorial, policy, and studio pages and their unused frontend components have been removed. `/shop` forwards to the shop subdomain; `/bulk-orders` and `/exports` forward to the exports subdomain. Other retired page URLs return visitors to `/`. Unknown URLs return a small 404 with a link home. The sitemap lists only `/`.

The external domains are links; this change does not deploy or configure either subdomain. The Coming soon presentation is on this homepage.

## Local preview

Requires Node.js 22.12+.

```sh
npm install
npm run build
```

For a frontend preview without MongoDB or live submissions, run in PowerShell:

```powershell
$env:NODE_ENV = "production"
$env:FRONTEND_PREVIEW = "true"
$env:HOST = "127.0.0.1"
$env:PORT = "4173"
node --import tsx server.js
```

Open `http://127.0.0.1:4173/`. The popup explicitly reports that messages cannot be sent in this preview; direct contact links remain available.

## Verify

```sh
npm run typecheck
npm test
npm run build
npm run test:frontend
```

The frontend check verifies the built homepage, external destinations, retired URL redirects, unknown-page response, preview API, and homepage-only sitemap without MongoDB or sending messages. It supports both the standard and Vercel server build layouts.

## Contact service and existing data

The existing Express contact endpoint remains available in connected deployments. MongoDB records, backend APIs, backup tooling, and media source files have been retained. There is no longer a browser-based studio or catalogue in this app. Older documents under `docs/` describe the former multi-page application; the scope above is current.

`npm run dev` starts the connected development server. Without `MONGODB_URI`, it uses the existing local MongoDB replica set. Production contact submissions still require the existing database and email configuration. Never commit `.env`.

See [docs/HOMEPAGE_VIDEO.md](docs/HOMEPAGE_VIDEO.md) for the optimized video formats and loading behavior.

## Structure

- `app/routes/home.tsx`: the single homepage.
- `app/components/home-contact.tsx`: lazy-loaded contact popup.
- `app/lib/brand.ts`: contact details and the two external destinations.
- `app/routes/legacy-redirect.ts`: compatibility redirects; no page content.
- `server/`: contact and retained backend services.
- `public/videos/` and `public/images/hero-film-*`: optimized film and posters.
