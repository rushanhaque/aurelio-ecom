// Imports aurelio.in's dedicated imagery for the commission path:
//   - the six stage strips (Enquiry … Delivery) for the bulk page
//   - the design-and-drafting photograph as the cover of the journal piece
//     "The path a piece travels", in the responsive sizes <Picture> expects.
//   node scripts/import-stage-images.mjs ["D:/Code/Done ones/Aurelio"]
import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const source = path.resolve(process.argv[2] || "D:/Code/Done ones/Aurelio");
const home = path.join(source, "assets/HomePage");

await mkdir("public/images/stages", { recursive: true });
for (const stage of [
  "Enquiry",
  "Design",
  "Sample",
  "Forge",
  "Finish",
  "Delivery",
])
  await sharp(path.join(home, "PathAPieceTravels", `${stage}.webp`))
    .webp({ quality: 80 })
    .toFile(`public/images/stages/${stage.toLowerCase()}.webp`);

// Portrait original (1400×1875): crop to the square-ish frame the journal uses.
const drafting = sharp(path.join(home, "WhereWeExcel/designanddrafting.webp"));
for (const width of [480, 800, 1400])
  await drafting
    .clone()
    .resize({
      width,
      height: Math.round(width * 0.8),
      fit: "cover",
      position: "south",
    })
    .webp({ quality: 80 })
    .toFile(`public/images/brand/path-${width === 1400 ? 1440 : width}.webp`);
console.log("stage strips and journal cover written");
