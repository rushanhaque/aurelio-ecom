import { brand } from "./brand";
import { materials } from "./brand-content";
export const articles = [
  {
    slug: "the-beauty-of-brass",
    title: "Our signature metal.",
    category: "MATERIAL STORIES",
    image: "brand/brass",
    excerpt:
      "Warm, luminous, living. The character of brass in the Aurelio atelier.",
    paragraphs: [
      materials.find((m) => m.slug === "brass")!.blurb,
      materials.find((m) => m.slug === "brass")!.note,
      "We work brass alongside copper, patinated steel, bronze, blown glass, wood, aluminium, porcelain and ceramic. Each material offers a different vocabulary of colour, texture and weight.",
      "The finish determines the care. Follow the guidance for the particular object, and ask the atelier before polishing or treating a living surface.",
    ],
  },
  {
    slug: "made-in-moradabad",
    title: "Made by hand in Moradabad.",
    category: "THE ATELIER",
    image: "brand/bespoke",
    excerpt: "The story of Aurelio, the atelier line of AF International.",
    paragraphs: [
      brand.story,
      brand.history,
      "We work brass, copper and patinated steel alongside seasoned timber — the materials northern India has shaped for generations.",
      "From a single object to a container of furniture, our work leaves the atelier for private homes and trade clients across the world.",
    ],
  },
  {
    slug: "the-path-a-piece-travels",
    title: "The path a piece travels.",
    category: "BESPOKE & COMMISSIONS",
    image: "brand/path",
    excerpt: "Enquiry. Design. Sample. Forge. Finish. Delivery.",
    paragraphs: [
      "A single object or an entire interior, developed with you from sketch to installation. Most of what we are proudest of began as a conversation.",
      "Every commission follows a considered path: enquiry, design, sample, forge, finish and delivery. Proportion, weight and line are considered before a piece takes shape.",
      "Many pieces can be tailored in size, finish and material. Lead times depend on the complexity of the brief and the current atelier schedule; estimates are supplied with the quotation.",
      "For private commissions, trade accounts and worldwide export, share your brief with the Moradabad atelier at saud@aurelio.in or use the bulk enquiry form.",
    ],
  },
];
