// Server-only: the bulk-enquiry catalogue imported from aurelio.in
// (scripts/import-catalogue.mjs). Kept out of the client bundle; routes send
// only the pieces a page shows.
import data from "./catalogue.json";

export type Piece = (typeof data)[number];
const pieces = data as Piece[];

export const allPieces = () => pieces;
export const piecesIn = (collection: string) =>
  pieces.filter((p) => p.collection === collection);
export const getPiece = (slug: string) => pieces.find((p) => p.slug === slug);
export const pieceCounts = () =>
  pieces.reduce<Record<string, number>>((counts, p) => {
    counts[p.collection] = (counts[p.collection] || 0) + 1;
    return counts;
  }, {});
