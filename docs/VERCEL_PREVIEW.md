# Vercel client preview

The earlier deployment rendered the app error boundary because the root catalogue loader and homepage content loader required MongoDB. The frontend review mode now supplies built-in content and an empty catalogue without opening a database connection.

Vercel automatically enables this mode (`VERCEL=1`). You can also explicitly set `FRONTEND_PREVIEW=true`. This is a server-rendered design preview, not a live commerce backend. Orders, accounts and CMS are unavailable; submissions return a preview message rather than claiming success.

## Redeploy

1. Commit and push the changes, including `package-lock.json`, `vercel.json`, and `react-router.config.ts`.
2. Vercel Project Settings → Build and Deployment: Framework Preset **React Router**, Build Command **npm run build**, Install Command **npm ci**. Remove any custom Output Directory override; use the framework default. Root Directory is the repository root.
3. Environment Variables: set `FRONTEND_PREVIEW=true` and `SITE_URL=https://aurelio-ecom.vercel.app` for the deployment environments you use. MongoDB or payment credentials are not needed for this preview.
4. Redeploy the latest commit. If the push already triggered a deployment before changing settings, redeploy it after saving them.

Do not set `FRONTEND_PREVIEW=false` until the real backend, provider integrations and production deployment are completed. The Vercel preset renders the React Router application; it does not mount the existing Express commerce API. The API fallback intentionally returns 503.

## Local validation

In PowerShell, run `$env:VERCEL='1'`, then `npm.cmd run build`, then `node tests/frontend-preview.mjs`. The test deletes its own process's MongoDB URI, renders the generated Vercel server bundle and checks preview API rejection. Use `Remove-Item Env:VERCEL` and rebuild normally before using `npm.cmd run preview` locally.

No deployment or Git push is performed by this change. Live status must be checked after the new commit deploys.
