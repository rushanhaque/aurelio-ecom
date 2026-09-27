import "dotenv/config";
import express from "express";
import compression from "compression";
import helmet from "helmet";
import { createRequestHandler } from "@react-router/express";
import { api } from "./server/api.ts";
import { database } from "./server/db.ts";
import { frontendPreview } from "./server/preview-mode.ts";
import { discovery } from "./server/discovery.ts";
import { randomBytes, randomUUID } from "node:crypto";
const development = process.env.NODE_ENV !== "production";
const app = express();
app.disable("x-powered-by");
app.use(compression());
app.use((req, res, next) => {
  res.locals.cspNonce = randomBytes(18).toString("base64");
  res.setHeader("X-Request-ID", randomUUID());
  if (process.env.INDEXING_ENABLED !== "true")
    res.setHeader("X-Robots-Tag", "noindex, nofollow");
  next();
});
app.use(
  helmet({
    contentSecurityPolicy: development
      ? false
      : {
          directives: {
            defaultSrc: ["'self'"],
            scriptSrc: [
              "'self'",
              (_req, res) => `'nonce-${res.locals.cspNonce}'`,
            ],
            scriptSrcAttr: ["'none'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "blob:"],
            fontSrc: ["'self'"],
            connectSrc: ["'self'"],
            objectSrc: ["'none'"],
            frameAncestors: ["'none'"],
            formAction: ["'self'"],
            upgradeInsecureRequests: process.env.SITE_URL?.startsWith("https:")
              ? []
              : null,
          },
        },
    crossOriginEmbedderPolicy: false,
    strictTransportSecurity: development ? false : undefined,
  }),
);
app.use("/api", (req, res, next) => {
  res.setHeader("Cache-Control", "no-store");
  next();
});
if (frontendPreview()) {
  app.use("/api", (_req, res) => res.status(503).json({ error: "Online services are not connected in this client preview." }));
} else app.use(api);
app.use(discovery);
app.use(
  "/uploads",
  express.static("public/uploads", { maxAge: "1d", fallthrough: false }),
);
if (development) {
  const { createServer } = await import("vite");
  const vite = await createServer({ server: { middlewareMode: true } });
  app.use(vite.middlewares);
  app.use(async (req, res, next) => {
    try {
      const build = await vite.ssrLoadModule(
        "virtual:react-router/server-build",
      );
      return createRequestHandler({
        build,
        mode: "development",
        getLoadContext: (_req, res) => ({ cspNonce: res.locals.cspNonce }),
      })(req, res, next);
    } catch (error) {
      vite.ssrFixStacktrace(error);
      next(error);
    }
  });
} else {
  app.use(
    "/assets",
    express.static("build/client/assets", { immutable: true, maxAge: "1y" }),
  );
  app.use(express.static("build/client", { maxAge: "1h" }));
  app.use(
    createRequestHandler({
      build: await import("./build/server/index.js"),
      mode: "production",
      getLoadContext: (_req, res) => ({ cspNonce: res.locals.cspNonce }),
    }),
  );
}
const port = Number(process.env.PORT || 3000);
if (!frontendPreview()) await database();
const server = app.listen(port, process.env.HOST || "127.0.0.1", () =>
  console.log(`Aurelio is available at http://localhost:${port}`),
);
server.on("error", (error) => {
  console.error(error);
  process.exitCode = 1;
});
