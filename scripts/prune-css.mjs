/* Removes CSS rules whose classes appear nowhere in the app's source.
   Usage: node scripts/prune-css.mjs        (dry run: lists what would go)
          node scripts/prune-css.mjs --write (rewrites app/*.css)
   A rule is removed only when every selector in it names at least one class
   that no source file mentions, so shared and dynamic classes are kept. */
import { readFile, writeFile, readdir } from "node:fs/promises";
import path from "node:path";
import postcss from "postcss";

const root = path.resolve("app");
async function walk(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(full)));
    else out.push(full);
  }
  return out;
}
const files = await walk(root);
const sources = files.filter((f) => /\.(tsx?|mjs|js|json)$/.test(f));
const text = (await Promise.all(sources.map((f) => readFile(f, "utf8")))).join("\n");
const words = new Set(text.match(/[A-Za-z_][\w-]*/g));
// `prefix-${x}` in a template literal: any class starting with the prefix is live.
const prefixes = [...text.matchAll(/([A-Za-z_][\w-]*-)\$\{/g)].map((m) => m[1]);
// Classes added at run time by libraries, never written in our source.
const external = /^(lenis|pin-spacer|gsap|is-|has-)/;
const used = (name) =>
  words.has(name) || external.test(name) || prefixes.some((p) => name.startsWith(p));

function selectorIsDead(selector) {
  // :is()/:where() can match through their alternatives; leave those alone.
  if (/:(is|where)\(/.test(selector)) return false;
  // A class inside :not() never stops a match.
  const plain = selector.replace(/:not\((?:[^()]|\([^()]*\))*\)/g, "");
  const classes = [...plain.matchAll(/\.(-?[_A-Za-z][\w-]*)/g)].map((m) => m[1]);
  return classes.some((c) => !used(c));
}

const write = process.argv.includes("--write");
let removedBytes = 0;
const removed = new Set();
for (const file of files.filter((f) => f.endsWith(".css"))) {
  const css = await readFile(file, "utf8");
  const ast = postcss.parse(css);
  ast.walkRules((rule) => {
    if (rule.parent?.type === "atrule" && /keyframes/.test(rule.parent.name)) return;
    const selectors = rule.selectors;
    const live = selectors.filter((s) => !selectorIsDead(s));
    if (live.length === selectors.length) return;
    for (const s of selectors.filter((s) => selectorIsDead(s))) removed.add(s.trim());
    if (live.length) rule.selectors = live;
    else rule.remove();
  });
  // Drop at-rules (media, supports) left empty.
  ast.walkAtRules((at) => {
    if (at.nodes && !at.nodes.length) at.remove();
  });
  const next = ast.toString();
  removedBytes += css.length - next.length;
  if (write && next !== css) await writeFile(file, next);
}
console.log([...removed].sort().join("\n"));
console.log(`\n${removed.size} selectors, ${(removedBytes / 1024).toFixed(1)} KiB ${write ? "removed" : "would be removed"}.`);
