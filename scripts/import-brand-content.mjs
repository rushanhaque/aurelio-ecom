import fs from "node:fs/promises";
import path from "node:path";
import ts from "typescript";
import sharp from "sharp";
const root = process.argv[2];
if (!root) throw new Error("Pass the original Aurelio project directory.");
await fs.mkdir("public/images/brand", { recursive: true });
const images = new Map();
async function readData(relative, variable) {
  const filename = path.join(root, relative);
  const source = ts.createSourceFile(
    filename,
    await fs.readFile(filename, "utf8"),
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.JSX,
  );
  const bindings = new Map();
  for (const statement of source.statements) {
    if (
      ts.isImportDeclaration(statement) &&
      statement.importClause?.name &&
      statement.moduleSpecifier.text.endsWith(".webp")
    ) {
      const input = path.resolve(
        path.dirname(filename),
        statement.moduleSpecifier.text,
      );
      const name = path.basename(input, ".webp").toLowerCase();
      images.set(name, input);
      bindings.set(statement.importClause.name.text, `brand/${name}`);
    }
  }
  function literal(node) {
    if (ts.isStringLiteral(node)) return node.text;
    if (ts.isIdentifier(node) && bindings.has(node.text))
      return bindings.get(node.text);
    if (ts.isArrayLiteralExpression(node)) return node.elements.map(literal);
    if (ts.isObjectLiteralExpression(node))
      return Object.fromEntries(
        node.properties.map((p) => [p.name.text, literal(p.initializer)]),
      );
    throw new Error(`Non-literal source content in ${variable}`);
  }
  for (const statement of source.statements)
    if (ts.isVariableStatement(statement)) {
      for (const declaration of statement.declarationList.declarations)
        if (declaration.name.getText(source) === variable)
          return literal(declaration.initializer);
    }
  throw new Error(`Missing ${variable}`);
}
const collections = await readData("src/data/collections.js", "COLLECTIONS");
const materials = await readData("src/data/materials.js", "MATERIALS");
// Keep material descriptions; do not turn demo provenance or blanket safety claims into promises.
materials.find((m) => m.slug === "blown-glass").blurb =
  "Mouth-blown glass, married to metal in the atelier. Opal, clear and smoked — the diffuser that turns a fixture into light.";
materials.find((m) => m.slug === "wood").note =
  "Seasoned timber, with care and finish selected for the intended piece.";
materials.find((m) => m.slug === "bronze").blurb =
  "Sand-cast and substantial. Bronze brings weight, depth and a slowly developing patina to the objects we make.";
materials.find((m) => m.slug === "porcelain").blurb =
  "Slip-cast and high-fired, porcelain brings a glove-smooth white to the table — set against brass and copper where warmth meets restraint.";
const ids = collections.filter((c) => c.slug !== "bespoke").map((c) => c.slug);
const content = `// Adapted from the owner's original Aurelio project. See docs/BRAND_CONTENT.md.\nexport const collectionIds = ${JSON.stringify(ids)} as const;\nexport const collections = ${JSON.stringify(collections, null, 2)};\nexport const materials = ${JSON.stringify(materials, null, 2)};\n`;
await fs.writeFile("app/lib/brand-content.ts", content);
for (const [name, input] of images)
  for (const width of [480, 800, 1440]) {
    await sharp(input)
      .resize({ width })
      .webp({ quality: 82, effort: 4 })
      .toFile(`public/images/brand/${name}-${width}.webp`);
  }
console.log(
  `Imported ${collections.length} collections, ${materials.length} materials and ${images.size} editorial images. No products imported.`,
);
