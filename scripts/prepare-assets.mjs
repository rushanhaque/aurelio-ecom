import sharp from "sharp";
import { mkdir, stat } from "node:fs/promises";
await mkdir("public/images", { recursive: true });
for (const name of ["hero", "vase", "bowl", "candle", "sculpture", "craft"]) {
  for (const width of [480, 800, 1440]) {
    const file = `public/images/${name}-${width}.webp`;
    await sharp(`public/images/${name}-source.png`)
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 82, effort: 5 })
      .toFile(file);
    console.log(file, Math.round((await stat(file)).size / 1024) + " KB");
  }
}
