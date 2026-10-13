import { z } from "zod";
export const enquirySchema = z.object({
  idempotencyKey: z.string().uuid(),
  name: z.string().trim().min(2).max(100),
  email: z.email().max(200),
  company: z.string().trim().max(200).optional(),
  country: z.string().min(2).max(80),
  quantity: z.coerce.number().int().min(1).max(100000),
  product: z.string().max(300),
  message: z.string().trim().min(10).max(4000),
  // Pictures sent with the idea (see server/briefs.ts), by upload id.
  attachments: z.array(z.uuid()).max(3).default([]),
  website: z.string().max(0).optional(),
});
