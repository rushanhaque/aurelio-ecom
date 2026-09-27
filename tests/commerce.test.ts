import { test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import {
  priceOrder,
  checkoutSchema,
  enquirySchema,
} from "../server/commerce.ts";
import { productSchema } from "../server/product-schema.ts";
import { profileSchema } from "../server/account-schema.ts";
import { money } from "../app/lib/catalog.ts";
import type { Product } from "../app/lib/catalog.ts";
// In-memory fixtures only. Tests never seed the user's product catalog.
const object: Product = {
  id: "test-only",
  slug: "test-only",
  name: "Test fixture",
  subtitle: "",
  category: "urns",
  material: "Brass",
  finish: "Brushed",
  image: "/uploads/00000000-0000-0000-0000-000000000000.webp",
  prices: { INR: 100000, USD: 1500, GBP: 1200, EUR: 1400 },
  description: "An isolated test fixture.",
  dimensions: "10 × 10 cm",
  weight: "1 kg",
  stock: 3,
  featured: false,
  care: "Use a dry cloth.",
};
const checkout = {
  idempotencyKey: randomUUID(),
  currency: "INR" as const,
  items: [{ productId: object.id, quantity: 1 }],
  email: "test@example.invalid",
  name: "Test User",
  address: "Test street 123",
  city: "Test City",
  postalCode: "123456",
  country: "IN" as const,
  previewConsent: true as const,
};
test("unpublished objects cannot be purchased even with a known product ID", () => {
  for (const status of ["draft", "archived"] as const)
    assert.throws(
      () => priceOrder(checkout, [{ ...object, status }]),
      /available/,
    );
});
test("currency formatting preserves nonzero minor units", () => {
  assert.match(money(1099, "USD"), /10\.99/);
});
test("default address must belong to the customer address book", () => {
  assert.equal(
    profileSchema.safeParse({
      name: "Test User",
      addresses: [],
      defaultAddressId: randomUUID(),
    }).success,
    false,
  );
});
test("prices and totals come from the server catalog, ignoring submitted totals", () => {
  const parsed = checkoutSchema.parse({
    ...checkout,
    total: 1,
    items: [{ productId: object.id, quantity: 2, unitPrice: 1 }],
  });
  const quote = priceOrder(parsed, [object]);
  assert.equal(quote.subtotal, 200000);
  assert.equal(quote.total, 235000);
  assert.equal(quote.lines[0].unitPrice, 100000);
});
test("duplicate cart lines are merged before stock checks", () => {
  assert.throws(
    () =>
      priceOrder(
        {
          ...checkout,
          items: [
            { productId: object.id, quantity: 2 },
            { productId: object.id, quantity: 2 },
          ],
        },
        [object],
      ),
    /smaller quantity/,
  );
  const quote = priceOrder(
    {
      ...checkout,
      items: [
        { productId: object.id, quantity: 1 },
        { productId: object.id, quantity: 1 },
      ],
    },
    [object],
  );
  assert.equal(quote.lines.length, 1);
  assert.equal(quote.lines[0].quantity, 2);
});
test("removed products cannot be purchased", () =>
  assert.throws(() => priceOrder(checkout, []), /no longer available/));
test("market pricing is explicit, without client currency conversions", () =>
  assert.equal(
    priceOrder({ ...checkout, currency: "EUR" }, [object]).subtotal,
    1400,
  ));
test("negative, fractional and excessive quantities are rejected", () => {
  for (const quantity of [-1, 0, 1.5, 51])
    assert.equal(
      checkoutSchema.safeParse({
        ...checkout,
        items: [{ productId: object.id, quantity }],
      }).success,
      false,
    );
});
test("checkout requires explicit preview consent and supported country", () => {
  assert.equal(
    checkoutSchema.safeParse({ ...checkout, previewConsent: false }).success,
    false,
  );
  assert.equal(
    checkoutSchema.safeParse({ ...checkout, country: "XX" }).success,
    false,
  );
});
test("product publication requires own uploaded image and complete positive prices", () => {
  assert.equal(productSchema.safeParse(object).success, true);
  assert.equal(
    productSchema.safeParse({ ...object, image: "hero" }).success,
    false,
  );
  assert.equal(
    productSchema.safeParse({
      ...object,
      prices: { ...object.prices, INR: -1 },
    }).success,
    false,
  );
  assert.equal(
    productSchema.safeParse({ ...object, slug: "../bad" }).success,
    false,
  );
});
test("enquiry validates quantities and the honeypot", () => {
  const e = {
    idempotencyKey: randomUUID(),
    name: "Test User",
    email: "test@example.invalid",
    country: "India",
    quantity: "100",
    product: "",
    message: "Testing an enquiry.",
    website: "",
  };
  assert.equal(enquirySchema.parse(e).quantity, 100);
  assert.equal(
    enquirySchema.safeParse({ ...e, website: "spam" }).success,
    false,
  );
  assert.equal(enquirySchema.safeParse({ ...e, quantity: 0 }).success, false);
});

test("publication accepts the six Aurelio retail collections and excludes enquiry-only Bespoke", () => {
  for (const category of [
    "urns",
    "lighting",
    "furniture",
    "kitchenware",
    "decor",
    "accessories",
  ])
    assert.equal(
      productSchema.safeParse({ ...object, category }).success,
      true,
    );
  for (const category of ["bespoke", "vases", "unrecognized"])
    assert.equal(
      productSchema.safeParse({ ...object, category }).success,
      false,
    );
});
