import sharp from "sharp";
import { mkdir, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

// One-time, read-only import from the owner's original Aurelio project.
const source = process.argv[2];
if (!source) throw new Error("Pass the original Aurelio project directory.");
const output = "public/images/original";
await mkdir(output, { recursive: true });
const dimensions = {};
for (const folder of ["Selected works", "WhereWeExcel"]) {
  const directory = path.join(source, "assets/HomePage", folder);
  for (const filename of await readdir(directory)) {
    if (!filename.endsWith(".webp")) continue;
    const input = path.join(directory, filename);
    const name = path.parse(filename).name;
    const { width, height } = await sharp(input).metadata();
    dimensions[name] = { width, height };
    for (const size of [480, 960]) {
      await sharp(input)
        .resize({ width: size })
        .webp({ quality: 82, effort: 5 })
        .toFile(`${output}/${name}-${size}.webp`);
    }
  }
}
await writeFile(
  "app/lib/original-image-sizes.json",
  JSON.stringify(dimensions, null, 2),
);
console.log(
  `Imported ${Object.keys(dimensions).length} original images in two responsive sizes.`,
);
