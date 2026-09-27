import { z } from "zod";
import type { Product } from "../app/lib/catalog.ts";
export const lineSchema = z.object({
  productId: z.string().min(1).max(80),
  quantity: z.number().int().min(1).max(50),
});
export const checkoutSchema = z.object({
  idempotencyKey: z.string().uuid(),
  currency: z.enum(["INR", "USD", "GBP", "EUR"]),
  items: z.array(lineSchema).min(1).max(30),
  email: z.email().max(200),
  name: z.string().trim().min(2).max(100),
  address: z.string().trim().min(5).max(250),
  city: z.string().trim().min(2).max(100),
  postalCode: z.string().trim().min(2).max(20),
  country: z.enum(["IN", "US", "GB", "DE", "FR"]),
  previewConsent: z.literal(true),
});
export const enquirySchema = z.object({
  items: z.array(lineSchema).max(30).default([]),
  idempotencyKey: z.string().uuid(),
  name: z.string().trim().min(2).max(100),
  email: z.email().max(200),
  company: z.string().trim().max(200).optional(),
  country: z.string().min(2).max(80),
  quantity: z.coerce.number().int().min(1).max(100000),
  product: z.string().max(300),
  message: z.string().trim().min(10).max(4000),
  website: z.string().max(0).optional(),
});
export function priceOrder(
  data: z.infer<typeof checkoutSchema>,
  catalog: Product[],
) {
  const quantities = new Map<string, number>();
  for (const line of data.items)
    quantities.set(
      line.productId,
      (quantities.get(line.productId) || 0) + line.quantity,
    );
  const lines = [...quantities].map(([id, quantity]) => {
    const p = catalog.find((p) => p.id === id);
    if (!p || p.status === "draft" || p.status === "archived")
      throw new Error("One of these objects is no longer available.");
    if (quantity > 50 || quantity > p.stock)
      throw new Error(`Please choose a smaller quantity for ${p.name}.`);
    return {
      productId: id,
      name: p.name,
      finish: p.finish,
      image: p.image,
      quantity,
      unitPrice: p.prices[data.currency],
    };
  });
  const subtotal = lines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0);
  // Preview amounts are deliberately labelled estimates. Live carrier/tax quotes are a launch prerequisite.
  const shipping = ({ INR: 35000, USD: 1800, GBP: 1400, EUR: 1700 } as const)[
    data.currency
  ];
  return {
    lines,
    subtotal,
    shipping,
    total: subtotal + shipping,
    currency: data.currency,
  };
}
