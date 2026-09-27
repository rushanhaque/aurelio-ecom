import { collectionIds } from "../app/lib/brand-content.ts";
import { z } from "zod";
export const productSchema = z.object({
  status: z.enum(["draft", "published", "archived"]).default("published"),
  sku: z
    .string()
    .trim()
    .max(80)
    .transform((value) => value.toUpperCase())
    .default(""),
  styleCode: z.string().trim().max(80).default(""),
  leadTime: z.string().trim().max(160).default(""),
  gallery: z
    .array(z.string().regex(/^\/uploads\/[a-f0-9-]+\.webp$/))
    .max(8)
    .default([]),
  slug: z
    .string()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .max(100),
  name: z.string().trim().min(2).max(120),
  subtitle: z.string().max(180),
  category: z.enum(collectionIds),
  material: z.string().min(2).max(80),
  finish: z.string().min(2).max(80),
  image: z
    .string()
    .refine(
      (v) => /^\/uploads\/[a-f0-9-]+\.webp$/.test(v),
      "Upload a product photograph first.",
    ),
  prices: z.object({
    INR: z.number().int().positive().max(100000000),
    USD: z.number().int().positive().max(100000000),
    GBP: z.number().int().positive().max(100000000),
    EUR: z.number().int().positive().max(100000000),
  }),
  description: z.string().min(10).max(5000),
  dimensions: z.string().min(2).max(200),
  weight: z.string().max(100),
  stock: z.number().int().min(0).max(1000000),
  featured: z.boolean(),
  care: z.string().min(5).max(2000),
  stockReason: z.string().trim().max(500).default(""),
});
