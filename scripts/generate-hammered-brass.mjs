// Renders the macro photograph for the finish study "Hand-hammered, up close".
//
//   node scripts/generate-hammered-brass.mjs
//
// The image is composed for the study's three inspection points (the detail
// buttons in MakersLens, on a 600×450 canvas):
//   01 The high points     (160,150) tight, deep strikes; crisp lit ridges
//   02 The quieter marks   (410,210) broad, shallow planishing on a polish
//   03 The changing grain  (280,335) hammering gives way to brushed grain
//                                    that turns from a straight diagonal into
//                                    spun arcs
//
// How it reads as a photograph rather than a pattern:
//   - Polished metal shows its surroundings, so shading is a reflection of a
//     studio: a four-pane window softbox, a fill strip, a dark room. Every
//     concave strike mirrors its own small window, as in real macro shots.
//   - Brass reflectance colour, roughness that varies by zone (polished,
//     worked, brushed), oxidation in the hollows, a gentle overall curvature
//     so a broad highlight sweeps the plate.
//   - Filmic tone mapping, focus fall-off at the frame edges, sensor grain.
// Deterministic (seeded), so re-running reproduces the same image.
import sharp from "sharp";
import { mkdir, rm } from "node:fs/promises";

const W = 2400,
  H = 1800;
let seed = 20080701;
const rand = () => {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const smooth = (a, b, v) => {
  const t = clamp((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};

// --- Zones, in canvas fractions (600×450 → u,v) -------------------------------
const zone = (cx, cy, r) => (x, y) => {
  const d = Math.hypot(x - cx * W, y - cy * H) / W;
  return Math.exp(-((d / r) ** 2));
};
const gHigh = zone(160 / 600, 150 / 450, 0.17);
const gQuiet = zone(410 / 600, 210 / 450, 0.19);
const gGrain = zone(280 / 600, 335 / 450, 0.17);

// --- Smooth random fields --------------------------------------------------------
// Value noise with quintic interpolation (C2 continuous), so derived surface
// normals carry no grid seams. Summed over octaves, normalised to 0..1.
function noiseField(scale, octaves = 3) {
  const layers = [];
  for (let o = 0; o < octaves; o++) {
    const s = scale / 2 ** o;
    const gw = Math.ceil(W / s) + 2,
      gh = Math.ceil(H / s) + 2;
    const g = new Float32Array(gw * gh).map(() => rand());
    layers.push({ s, gw, g, amp: 0.5 ** o });
  }
  const q = (t) => t * t * t * (t * (t * 6 - 15) + 10);
  const f = new Float32Array(W * H);
  let min = Infinity,
    max = -Infinity;
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      let v = 0;
      for (const { s, gw, g, amp } of layers) {
        const fx = x / s,
          fy = y / s,
          xi = fx | 0,
          yi = fy | 0,
          tx = q(fx - xi),
          ty = q(fy - yi);
        const a = g[yi * gw + xi],
          b = g[yi * gw + xi + 1],
          c = g[(yi + 1) * gw + xi],
          d = g[(yi + 1) * gw + xi + 1];
        v += amp * ((a + (b - a) * tx) * (1 - ty) + (c + (d - c) * tx) * ty);
      }
      f[y * W + x] = v;
      if (v < min) min = v;
      if (v > max) max = v;
    }
  for (let i = 0; i < f.length; i++) f[i] = (f[i] - min) / (max - min);
  return f;
}
const oxide = noiseField(180); // patches of oxidation
const peel = noiseField(14, 2); // fine "orange peel" of the worked surface
const form = noiseField(700, 2); // slow undulation of the sheet

// --- Hammer strikes ------------------------------------------------------------
const CELL = 128;
// Two cells of margin: broad strikes reach past their own cell.
const gx = Math.ceil(W / CELL) + 4,
  gy = Math.ceil(H / CELL) + 4;
const strikes = [];
for (let j = 0; j < gy; j++)
  for (let i = 0; i < gx; i++) {
    const x = (i - 2 + 0.12 + rand() * 0.76) * CELL;
    const y = (j - 2 + 0.12 + rand() * 0.76) * CELL;
    const hi = gHigh(x, y),
      qu = gQuiet(x, y),
      gr = gGrain(x, y);
    strikes.push({
      x,
      y,
      // Planishing strikes are broad; the high-point strikes are tight.
      s: CELL * (0.72 + rand() * 0.5) * (1 + 0.12 * qu - 0.18 * hi),
      d:
        (0.6 + rand() * 0.55) *
        Math.max(0.08, 0.6 + 0.85 * hi - 0.22 * qu - 0.62 * gr),
    });
  }
const at = (i, j) => strikes[j * gx + i];

// --- Brushed grain: strokes that follow a turning direction field -------------
const scratch = new Float32Array(W * H);
const arcCentre = { x: 0.5 * W, y: 1.32 * H }; // spun arcs centred below frame
const theta0 = -0.82; // straight brushing, descending diagonal
function grainAngle(x, y) {
  const arc = Math.atan2(y - arcCentre.y, x - arcCentre.x) + Math.PI / 2;
  // Left of the grain zone it is brushed straight; to the right it is spun.
  const w = smooth(0.36, 0.6, x / W);
  return theta0 * (1 - w) + (arc - Math.PI) * w;
}
for (let n = 0; n < 220000; n++) {
  let x = rand() * W,
    y = rand() * H;
  const density = 0.015 + 0.985 * gGrain(x, y) ** 1.2;
  if (rand() > density) continue;
  const len = 40 + rand() * 260;
  const depth = (0.25 + rand() * 0.75) * (0.18 + 0.82 * gGrain(x, y));
  for (let s = 0; s < len; s++) {
    const a = grainAngle(x, y);
    x += Math.cos(a);
    y += Math.sin(a);
    const xi = x | 0,
      yi = y | 0;
    if (xi < 0 || yi < 0 || xi >= W || yi >= H) break;
    // Taper the stroke at both ends, like a real scratch.
    scratch[yi * W + xi] += depth * Math.sin((Math.PI * s) / len);
  }
}
// Anti-alias the strokes.
{
  const buf = Buffer.alloc(W * H);
  let max = 0;
  for (const v of scratch) max = Math.max(max, v);
  for (let i = 0; i < buf.length; i++)
    buf[i] = Math.round(clamp(scratch[i] / (max * 0.6)) * 255);
  const blurred = await sharp(buf, {
    raw: { width: W, height: H, channels: 1 },
  })
    .blur(0.7)
    .extractChannel(0)
    .raw()
    .toBuffer();
  for (let i = 0; i < scratch.length; i++) scratch[i] = blurred[i] / 255;
}

if (process.env.DEBUG_LAYERS) {
  const dump = async (name, f) => {
    const b = Buffer.alloc(W * H);
    for (let i = 0; i < b.length; i++) b[i] = Math.round(clamp(f[i]) * 255);
    await sharp(b, { raw: { width: W, height: H, channels: 1 } })
      .resize(800)
      .png()
      .toFile(process.env.DEBUG_LAYERS + "/" + name + ".png");
  };
  await dump("scratch", scratch);
  await dump("form", form);
  await dump("peel", peel);
  await dump("oxide", oxide);
}
// --- Height field ------------------------------------------------------------
const DEPTH = 30;
const height = new Float32Array(W * H);
const cavity = new Float32Array(W * H);
const rough = new Float32Array(W * H);
for (let y = 0; y < H; y++) {
  const cj = Math.floor(y / CELL) + 2;
  for (let x = 0; x < W; x++) {
    const ci = Math.floor(x / CELL) + 2;
    const hi = gHigh(x, y),
      qu = gQuiet(x, y),
      gr = gGrain(x, y);
    const soft = 0.085 - 0.045 * hi + 0.13 * qu; // ridge rounding
    let sum = 0,
      best = Infinity;
    for (let dj = -2; dj <= 2; dj++)
      for (let di = -2; di <= 2; di++) {
        const s = at(ci + di, cj + dj);
        const dx = x - s.x,
          dy = y - s.y;
        const d = ((dx * dx + dy * dy) / (s.s * s.s) - 1) * s.d;
        best = Math.min(best, d);
        sum += Math.exp(-d / soft);
      }
    const i = y * W + x;
    const dish = -soft * Math.log(sum);
    // A gentle overall curvature, as across the belly of a vessel.
    const cx = x / W - 0.58,
      cy = y / H - 0.5;
    const bow = -(cx * cx * 0.9 + cy * cy * 0.45) * 620;
    height[i] =
      dish * DEPTH +
      bow +
      form[i] * 26 +
      (peel[i] - 0.5) * 0.45 * (1 - qu) -
      scratch[i] * (0.9 + 1.6 * gr);
    cavity[i] = clamp(-best);
    // Polished where it was planished, satin where it was brushed.
    rough[i] = clamp(0.2 - 0.07 * qu + 0.14 * gr + scratch[i] * 0.2, 0.08, 0.5);
  }
}

// --- Studio environment, as seen in the metal --------------------------------
// (rx, ry) is the reflected direction projected onto the image plane.
function env(rx, ry, rz, r) {
  if (rz < 0) return [0.004, 0.003, 0.002];
  // Edge softness grows with roughness; even polished metal is never razor
  // sharp in a macro shot.
  const e = 0.07 + r * 0.6;
  // A large softbox, upper left: rounded rectangle with a soft falloff.
  const qx = Math.max(0, Math.abs(rx + 0.3) - 0.32),
    qy = Math.max(0, Math.abs(ry + 0.42) - 0.16);
  const box = smooth(0.16 + e * 1.3, 0, Math.hypot(qx, qy)) ** 1.8;
  // A broad, dim bounce card on the right.
  const card = smooth(0.4 + e, 0, Math.hypot(rx - 0.7, (ry + 0.1) * 0.6)) ** 2;
  // Dimly lit studio walls, brighter overhead; a warm floor bounce.
  const wall = 0.02 + 0.07 * smooth(0.7, -0.8, ry);
  const floor = smooth(0.2, 0.9, ry);
  const k = box * 1.05;
  return [
    k * 1.0 + card * 0.32 + wall * 1.0 + floor * 0.06,
    k * 0.93 + card * 0.27 + wall * 0.9 + floor * 0.04,
    k * 0.82 + card * 0.2 + wall * 0.75 + floor * 0.025,
  ];
}

// --- Shade ---------------------------------------------------------------------
const F0 = [0.95, 0.64, 0.24]; // brass reflectance (linear)
const patinaTint = [0.05, 0.028, 0.012];
const lin = new Float32Array(W * H * 3);
const hAt = (x, y) => height[clamp(y, 0, H - 1) * W + clamp(x, 0, W - 1)];
for (let y = 0; y < H; y++)
  for (let x = 0; x < W; x++) {
    const i = y * W + x;
    let nx = (hAt(x - 1, y) - hAt(x + 1, y)) * 0.5,
      ny = (hAt(x, y - 1) - hAt(x, y + 1)) * 0.5,
      nz = 1;
    const l = Math.hypot(nx, ny, nz);
    nx /= l;
    ny /= l;
    nz /= l;
    const rx = 2 * nz * nx,
      ry = 2 * nz * ny,
      rz = 2 * nz * nz - 1;
    const r = rough[i];
    // Rough metal blurs its reflection: average a few jittered lookups.
    const e = [0, 0, 0];
    const taps = r > 0.12 ? 4 : 1;
    for (let t = 0; t < taps; t++) {
      const s = env(
        rx + (rand() - 0.5) * r * 0.6,
        ry + (rand() - 0.5) * r * 0.6,
        rz,
        r,
      );
      for (let c = 0; c < 3; c++) e[c] += s[c] / taps;
    }
    // Grazing reflections approach white (Schlick, per channel).
    const f = (1 - nz) ** 5;
    const patina = clamp(
      cavity[i] ** 2 * 0.45 +
        smooth(0.55, 0.85, oxide[i]) * 0.55 * (1 - gQuiet(x, y)),
      0,
      0.8,
    );
    for (let c = 0; c < 3; c++) {
      const metal = (F0[c] + (1 - F0[c]) * f) * e[c];
      const ox = patinaTint[c] * (0.4 + e[c] * 0.3);
      lin[i * 3 + c] = metal * (1 - patina) + ox * patina;
    }
  }

// --- Develop: tone map, vignette, grain, focus fall-off -----------------------
const px = Buffer.alloc(W * H * 3);
const aces = (v) => (v * (2.51 * v + 0.03)) / (v * (2.43 * v + 0.59) + 0.14);
for (let y = 0; y < H; y++)
  for (let x = 0; x < W; x++) {
    const i = y * W + x;
    const vx = x / W - 0.48,
      vy = y / H - 0.46;
    const vig = 1 - Math.min(0.5, (vx * vx + vy * vy) * 1.1);
    const rgb = [0, 1, 2].map((c) => lin[i * 3 + c] * vig * 1.15);
    const lum = 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2] || 1e-6;
    const scale = aces(lum) / lum;
    const peak = smooth(0.75, 1.05, aces(lum));
    const grain = (rand() - 0.5) * 0.018;
    for (let c = 0; c < 3; c++) {
      // Hue-preserving in the mids; very bright metal goes pale gold.
      let v = rgb[c] * scale * (1 - peak) + aces(rgb[c]) * peak;
      v = clamp(v) ** (1 / 2.2) + grain;
      px[i * 3 + c] = Math.round(clamp(v) * 255);
    }
  }

// Focus fall-off at the very top and bottom edges, as from a macro lens.
const softened = await sharp(px, { raw: { width: W, height: H, channels: 3 } })
  .blur(5)
  .raw()
  .toBuffer();
const out = Buffer.alloc(px.length);
for (let y = 0; y < H; y++) {
  const v = y / H;
  const k = Math.max(smooth(0.1, 0, v), smooth(0.9, 1, v)) * 0.8;
  for (let x = 0; x < W * 3; x++) {
    const i = y * W * 3 + x;
    out[i] = Math.round(px[i] * (1 - k) + softened[i] * k);
  }
}

await mkdir("public/images/finishes", { recursive: true });
for (const old of ["hammered-brass-800.webp", "hammered-brass-1600.webp"])
  await rm(`public/images/finishes/${old}`, { force: true });
await sharp(out, { raw: { width: W, height: H, channels: 3 } })
  .webp({ quality: 84 })
  .toFile("public/images/finishes/hammered-brass-2400.webp");
console.log("wrote public/images/finishes/hammered-brass-2400.webp");
