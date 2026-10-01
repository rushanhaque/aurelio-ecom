import { brand } from "./brand";
import { materials } from "./brand-content";
export const articles = [
  {
    slug: "the-beauty-of-brass",
    title: "Our signature metal.",
    category: "MATERIAL STORIES",
    image: "brand/brass",
    excerpt: "Warm, luminous, living.",
    paragraphs: [
      materials.find((m) => m.slug === "brass")!.blurb,
      materials.find((m) => m.slug === "brass")!.note,
      "We also work copper, steel, bronze, glass, wood, aluminium, porcelain and ceramic.",
      "The finish decides the care. Ask us before polishing a living surface.",
    ],
  },
  {
    slug: "made-in-moradabad",
    title: "Made by hand in Moradabad.",
    category: "THE ATELIER",
    image: "brand/bespoke",
    excerpt: "The story of Aurelio.",
    paragraphs: [
      brand.story,
      brand.history,
      "We work brass, copper and steel alongside seasoned timber.",
      "Our pieces go to private homes and trade clients worldwide.",
    ],
  },
  {
    slug: "the-path-a-piece-travels",
    title: "The path a piece travels.",
    category: "BESPOKE & COMMISSIONS",
    image: "brand/path",
    excerpt: "Enquiry. Design. Sample. Forge. Finish. Delivery.",
    paragraphs: [
      "Every commission begins as a conversation.",
      "It follows six steps: enquiry, design, sample, forge, finish and delivery.",
      "Size, finish and material can be tailored. Lead times come with your quotation.",
      "To start, email saud@aurelio.in or use the bulk enquiry form.",
    ],
  },
];
