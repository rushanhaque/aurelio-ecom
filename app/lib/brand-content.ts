// Adapted from the owner's original Aurelio project. See docs/BRAND_CONTENT.md.
export const collectionIds = [
  "urns",
  "lighting",
  "furniture",
  "kitchenware",
  "decor",
  "accessories",
] as const;
export const collections = [
  {
    slug: "urns",
    name: "Urns",
    index: "01",
    cover: "brand/urns",
    tagline: "Vessels that keep.",
    summary: "Raised and cast urns for the mantel, the hall and the garden.",
    description:
      "The oldest form we make. Raised in copper or cast in bronze and weighted to stand for a century, our urns are vessels built to hold meaning as readily as anything else — for the mantel, the entrance hall, or the garden.",
  },
  {
    slug: "lighting",
    name: "Lighting",
    index: "02",
    cover: "brand/lightings",
    tagline: "Light, raised in metal.",
    summary: "Pendants, sconces and chandeliers in spun brass and blown glass.",
    description:
      "Light is our first material. Each fixture is spun, raised or cast by hand, then wired and balanced so it hangs as quietly as it glows — objects that hold a room long after the bulb is dimmed.",
  },
  {
    slug: "furniture",
    name: "Furniture",
    index: "03",
    cover: "brand/furniture",
    tagline: "Structure with a pulse.",
    summary: "Consoles, tables and seating raised on hand-forged metal frames.",
    description:
      "Furniture that earns its weight. Forged frames, honest joinery and surfaces that wear in rather than out — pieces drawn to outlast the rooms they are made for.",
  },
  {
    slug: "kitchenware",
    name: "Kitchenware",
    index: "04",
    cover: "brand/kitchenware",
    tagline: "For the daily ritual.",
    summary: "Cookware, flatware and serveware, cast and polished by hand.",
    description:
      "The objects you reach for every day deserve the most care. Cast, hammered and hand-polished, our kitchenware is made to be used hard and handed down.",
  },
  {
    slug: "decor",
    name: "Decor",
    index: "05",
    cover: "brand/decor",
    tagline: "Quiet sculpture.",
    summary: "Vessels, mirrors and sculptural objects for the considered home.",
    description:
      "Decorative work where the material does the talking — patinated reliefs, cast vessels and mirrors framed in blackened steel. Sculpture you live alongside.",
  },
  {
    slug: "accessories",
    name: "Accessories",
    index: "06",
    cover: "brand/accessories",
    tagline: "The smaller heirlooms.",
    summary: "Hardware, fittings and the smaller heirlooms of daily life.",
    description:
      "The details a house is judged by. Levers, latches and desk objects machined and finished to the same standard as a chandelier — because they are touched far more often.",
  },
  {
    slug: "bespoke",
    name: "Bespoke",
    index: "07",
    cover: "brand/bespoke",
    tagline: "Drawn entirely to your brief.",
    summary: "Commissions drawn, forged and finished entirely to your brief.",
    description:
      "Our truest work. A single object or an entire interior, developed with you from sketch to installation. Most of what we are proudest of began as a conversation.",
  },
];
export const materials = [
  {
    slug: "brass",
    name: "Brass",
    index: "01",
    ratio: "16/15",
    trait: "Warm · luminous · living",
    blurb:
      "Our signature metal. Spun, cast and machined, brass moves from yellow to deep gold as it ages — a finish that improves with every year of handling.",
    note: "Lacquered for stability or left living to patina.",
    image: "brand/brass",
    texture: "brand/brass-texture",
  },
  {
    slug: "copper",
    name: "Copper",
    index: "02",
    ratio: "16/15",
    trait: "Soft · conductive · alive",
    blurb:
      "Raised and hammered by hand, copper takes a patina like no other metal — verdigris greens, fire-blues and rose-golds coaxed from the surface, never painted on.",
    note: "Tinned for cookware; patinated for relief work.",
    image: "brand/copper",
    texture: "brand/copper-texture",
  },
  {
    slug: "patinated-steel",
    name: "Patinated Steel",
    index: "03",
    ratio: "16/15",
    trait: "Structural · honest · dark",
    blurb:
      "Where strength is the point. Forged and blackened, our steel carries weight without bulk — the backbone of the furniture and the architectural commissions.",
    note: "Hand-blackened and waxed to a living finish.",
    image: "brand/steel",
    texture: "brand/steel-texture",
  },
  {
    slug: "bronze",
    name: "Bronze",
    index: "04",
    ratio: "16/15",
    trait: "Dense · ancient · permanent",
    blurb:
      "Sand-cast and substantial. Bronze brings weight, depth and a slowly developing patina to the objects we make.",
    note: "Hand-polished or left to develop a natural patina.",
    image: "brand/bronze",
    texture: "brand/bronze-texture",
  },
  {
    slug: "blown-glass",
    name: "Blown Glass",
    index: "05",
    ratio: "16/15",
    trait: "Molten · breath · light",
    blurb:
      "Mouth-blown glass, married to metal in the atelier. Opal, clear and smoked — the diffuser that turns a fixture into light.",
    note: "Each element is unique to the breath that made it.",
    image: "brand/glass",
    texture: "brand/glass-texture",
  },
  {
    slug: "wood",
    name: "Wood",
    index: "06",
    ratio: "16/15",
    trait: "Grained · warm · counterweight",
    blurb:
      "The warm counterweight to metal. European oak and American walnut, single-board where we can, oiled to a finish that wears in rather than out.",
    note: "Seasoned timber, with care and finish selected for the intended piece.",
    image: "brand/wood",
    texture: "brand/wood-texture",
  },
  {
    slug: "aluminium",
    name: "Aluminium",
    index: "07",
    ratio: "16/15",
    trait: "Light · satin · modern",
    blurb:
      "The lightest metal on the bench. Spun and brushed to a cool satin sheen, aluminium carries bold form without weight — chosen where a piece must feel effortless in the hand.",
    note: "Anodised or hand-brushed to a soft satin finish.",
    image: "brand/aluminium",
    texture: "brand/aluminium-texture",
  },
  {
    slug: "porcelain",
    name: "Porcelain",
    index: "08",
    ratio: "16/15",
    trait: "Fired · pure · enduring",
    blurb:
      "Slip-cast and high-fired, porcelain brings a glove-smooth white to the table — set against brass and copper where warmth meets restraint.",
    note: "Hand-glazed; kiln-fired in small batches.",
    image: "brand/porcelain",
    texture: "brand/porcelain-texture",
  },
  {
    slug: "ceramic",
    name: "Ceramic",
    index: "09",
    ratio: "16/15",
    trait: "Earthy · textured · handformed",
    blurb:
      "Wheel-thrown and hand-built in small batches, our ceramic work pairs the rough honesty of raw clay with precisely applied glazes — each piece bearing the fingerprints of its maker.",
    note: "Earthenware and stoneware; food-safe glazes available.",
    image: "brand/ceramic",
    texture: "brand/ceramic-texture",
  },
];
