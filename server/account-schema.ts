import { z } from "zod";

export const addressSchema = z
  .object({
    id: z.string().uuid(),
    label: z.string().trim().min(1).max(40),
    name: z.string().trim().min(2).max(100),
    address: z.string().trim().min(5).max(250),
    city: z.string().trim().min(2).max(100),
    region: z.string().trim().max(100).default(""),
    postalCode: z.string().trim().max(20),
    country: z.string().regex(/^[A-Z]{2}$/),
  })
  .superRefine((value, context) => {
    if (value.country === "IN" && !/^[1-9]\d{5}$/.test(value.postalCode))
      context.addIssue({
        code: "custom",
        path: ["postalCode"],
        message: "Enter a six-digit Indian PIN code.",
      });
    if (value.country === "US" && !/^\d{5}(-\d{4})?$/.test(value.postalCode))
      context.addIssue({
        code: "custom",
        path: ["postalCode"],
        message: "Enter a valid US ZIP code.",
      });
  });
export const profileSchema = z
  .object({
    name: z.string().trim().min(2).max(100),
    addresses: z.array(addressSchema).max(10),
    defaultAddressId: z.string().uuid().nullable(),
  })
  .refine(
    (value) =>
      new Set(value.addresses.map((a) => a.id)).size === value.addresses.length,
    "Address IDs must be unique.",
  )
  .refine(
    (value) =>
      !value.defaultAddressId ||
      value.addresses.some((a) => a.id === value.defaultAddressId),
    "Choose a saved default address.",
  );
