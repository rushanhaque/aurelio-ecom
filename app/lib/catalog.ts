import { collections } from "./brand-content";
export type Currency = "INR" | "USD" | "GBP" | "EUR";
export type Product = {
  status?: "draft" | "published" | "archived";
  sku?: string;
  styleCode?: string;
  leadTime?: string;
  gallery?: string[];
  id: string;
  slug: string;
  name: string;
  subtitle: string;
  category: string;
  material: string;
  finish: string;
  image: string;
  prices: Record<Currency, number>;
  description: string;
  dimensions: string;
  weight: string;
  stock: number;
  featured: boolean;
  care: string;
};
export const currencies: Currency[] = ["INR", "USD", "GBP", "EUR"];
export const categories = [
  { id: "all", name: "All objects" },
  ...collections
    .filter((c) => c.slug !== "bespoke")
    .map((c) => ({ id: c.slug, name: c.name })),
];

export function money(amount: number, currency: Currency = "INR") {
  return new Intl.NumberFormat(currency === "INR" ? "en-IN" : "en-GB", {
    style: "currency",
    currency,
    minimumFractionDigits: amount % 100 ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(amount / 100);
}
export type CartLine = { productId: string; quantity: number };
export function cartTotal(
  lines: CartLine[],
  catalog: Product[],
  currency: Currency,
) {
  return lines.reduce(
    (sum, line) =>
      sum +
      (catalog.find((p) => p.id === line.productId)?.prices[currency] || 0) *
        line.quantity,
    0,
  );
}
