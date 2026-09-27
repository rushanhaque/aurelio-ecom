import { readdir, readFile } from "node:fs/promises";
import { brotliCompressSync } from "node:zlib";
const folder = new URL("../build/client/assets/", import.meta.url);
const files = await readdir(folder);
const groups = {
  javascript: { raw: 0, brotli: 0 },
  stylesheets: { raw: 0, brotli: 0 },
  fonts: { raw: 0, brotli: 0 },
};
for (const name of files) {
  const group = name.endsWith(".js")
    ? groups.javascript
    : name.endsWith(".css")
      ? groups.stylesheets
      : name.endsWith(".woff2")
        ? groups.fonts
        : null;
  if (!group) continue;
  const bytes = await readFile(new URL(name, folder));
  group.raw += bytes.length;
  group.brotli += brotliCompressSync(bytes).length;
}
console.log(
  "All route assets combined, not an initial-page transfer or Core Web Vitals measurement:",
);
for (const [name, value] of Object.entries(groups))
  console.log(
    `${name}: ${(value.raw / 1024).toFixed(1)} KiB raw / ${(value.brotli / 1024).toFixed(1)} KiB Brotli`,
  );
