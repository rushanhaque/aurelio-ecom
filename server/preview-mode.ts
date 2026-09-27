// Vercel currently hosts the client-review storefront, without commerce services.
// Explicit false opts out when the production backend is ready.
export function frontendPreview() {
  return process.env.FRONTEND_PREVIEW === "true" ||
    (process.env.VERCEL === "1" && process.env.FRONTEND_PREVIEW !== "false");
}
