import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";
import { existsSync } from "node:fs";

/* The landing film is optional: the poster carries the hero until files are
   dropped into public/videos. Requesting films that are not there cost two
   404s and console errors on every visit, so only the formats that exist at
   build time are offered. (Restart the dev server after adding one.) */
const heroFilm = (["webm", "mp4"] as const).filter((ext) =>
  existsSync(`public/videos/hero.${ext}`),
);

/* React's runtime and the router change together and are needed on every
   page, so they share one long-cached chunk. */
const framework =
  /node_modules\/(react|react-dom|scheduler|react-router|cookie|set-cookie-parser)\//;

export default defineConfig(({ isSsrBuild }) => ({
  plugins: [reactRouter()],
  define: { __HERO_FILM__: JSON.stringify(heroFilm) },
  server: { allowedHosts: ["localhost", "127.0.0.1"] },
  build: {
    rollupOptions: isSsrBuild
      ? undefined
      : {
          output: {
            /* Every lucide icon used by two routes became its own ~1 KB chunk,
               so a single page fetched a dozen tiny files before it could
               hydrate. Grouping the icons and the React runtime trades that for
               two cached requests shared by the whole site. */
            manualChunks(id: string) {
              const path = id.replace(/\\/g, "/");
              if (path.includes("node_modules/lucide-react/")) return "icons";
              if (framework.test(path)) return "framework";
            },
          },
        },
  },
}));
