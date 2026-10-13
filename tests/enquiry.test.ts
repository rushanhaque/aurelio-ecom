import { test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { enquirySchema } from "../server/enquiry.ts";
import { money } from "../app/lib/catalog.ts";

test("currency formatting preserves nonzero minor units", () => {
  assert.match(money(1099, "USD"), /10\.99/);
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

test("an enquiry may carry up to three uploaded pictures, by id only", () => {
  const e = {
    idempotencyKey: randomUUID(),
    name: "Test User",
    email: "test@example.invalid",
    country: "India",
    quantity: "1",
    product: "Bespoke idea",
    message: "A vessel like this sketch.",
  };
  assert.deepEqual(enquirySchema.parse(e).attachments, []);
  const ids = [randomUUID(), randomUUID(), randomUUID()];
  assert.equal(enquirySchema.parse({ ...e, attachments: ids }).attachments.length, 3);
  assert.equal(
    enquirySchema.safeParse({ ...e, attachments: [...ids, randomUUID()] }).success,
    false,
  );
  // Ids only: a path or a URL can never be smuggled in as an attachment.
  assert.equal(
    enquirySchema.safeParse({ ...e, attachments: ["../../.env"] }).success,
    false,
  );
});
