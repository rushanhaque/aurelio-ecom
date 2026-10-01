// Imports aurelio.in's bulk-enquiry catalogue from the owner's local project.
//
//   node scripts/import-catalogue.mjs ["D:/Code/Done ones/Aurelio"]
//
// aurelio.in builds its catalogue from image folders (assets/Collections/<Name>)
// and dresses each image as a piece using the RECIPE vocabulary in
// src/data/collections.js. This script reproduces that exactly, so names, order
// and materials match the live site, and writes:
//   - public/images/catalogue/<collection>/<slug>-{480,960}.webp
//   - app/lib/catalogue.json
// These pieces are enquiry-only: no prices, stock or checkout. Retail products
// are still managed in /admin and are never touched by this script.
import { readFile, readdir, mkdir, writeFile, rm } from "node:fs/promises";
import path from "node:path";
import vm from "node:vm";
import sharp from "sharp";

const source = path.resolve(process.argv[2] || "D:/Code/Done ones/Aurelio");
const outImages = path.resolve("public/images/catalogue");
const outData = path.resolve("app/lib/catalogue.json");

// RECIPE is a plain data literal; evaluate only that literal, in an empty
// context, rather than executing the source project.
const sourceCode = await readFile(
  path.join(source, "src/data/collections.js"),
  "utf8",
);
const start = sourceCode.indexOf("const RECIPE = {");
if (start < 0) throw new Error("RECIPE not found in source collections.js");
let depth = 0,
  end = sourceCode.indexOf("{", start);
for (let i = end; i < sourceCode.length; i++) {
  if (sourceCode[i] === "{") depth++;
  else if (sourceCode[i] === "}" && --depth === 0) {
    end = i + 1;
    break;
  }
}
const RECIPE = vm.runInNewContext(
  `(${sourceCode.slice(sourceCode.indexOf("{", start), end)})`,
  Object.create(null),
  { timeout: 1000 },
);

const folders = {
  urns: "Urns",
  lighting: "Lighting",
  kitchenware: "Kitchenware",
  decor: "Decor",
  accessories: "Accessories",
};
const slugify = (s) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
function roman(n) {
  const table = [
    [1000, "M"],
    [900, "CM"],
    [500, "D"],
    [400, "CD"],
    [100, "C"],
    [90, "XC"],
    [50, "L"],
    [40, "XL"],
    [10, "X"],
    [9, "IX"],
    [5, "V"],
    [4, "IV"],
    [1, "I"],
  ];
  let out = "";
  for (const [v, r] of table) while (n >= v) ((out += r), (n -= v));
  return out;
}

await rm(outImages, { recursive: true, force: true });
const pieces = [];
for (const [collection, folder] of Object.entries(folders)) {
  const recipe = RECIPE[collection];
  const dir = path.join(source, "assets/Collections", folder);
  const files = (await readdir(dir))
    .filter((f) => /\.(jpe?g|png|webp)$/i.test(f))
    // Same exclusions as aurelio.in: raw screenshots and two duplicates.
    .filter((f) => !/screenshot/i.test(f))
    .filter((f) => !/_202606102016\b/i.test(f) && !/_202606102021\b/i.test(f))
    .sort((a, b) =>
      a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }),
    );
  await mkdir(path.join(outImages, collection), { recursive: true });
  for (const [i, file] of files.entries()) {
    const cycle = Math.floor(i / recipe.names.length);
    let name = recipe.names[i % recipe.names.length];
    if (cycle > 0) name = `${name} ${roman(cycle + 1)}`;
    const material = recipe.materials[i % recipe.materials.length];
    const finish = recipe.finishes[i % recipe.finishes.length];
    const slug = slugify(`${name}-${recipe.suffix}-${i + 1}`);
    const input = sharp(path.join(dir, file)).rotate();
    const meta = await input.metadata();
    for (const width of [480, 960])
      await input
        .clone()
        .resize({ width, withoutEnlargement: true })
        .webp({ quality: 78 })
        .toFile(path.join(outImages, collection, `${slug}-${width}.webp`));
    pieces.push({
      slug,
      name,
      suffix: recipe.suffix,
      type: recipe.type,
      collection,
      index: String(i + 1).padStart(2, "0"),
      material,
      finish,
      image: `/images/catalogue/${collection}/${slug}`,
      width: meta.width,
      height: meta.height,
      story: `${name} — a ${recipe.type.toLowerCase()} made and finished by hand in ${material.toLowerCase()}. ${recipe.line}`,
      details: recipe.details,
    });
  }
  console.log(`${collection}: ${files.length} pieces`);
}
await writeFile(outData, JSON.stringify(pieces, null, 1) + "\n");
console.log(`Wrote ${pieces.length} pieces to ${path.relative(".", outData)}`);
