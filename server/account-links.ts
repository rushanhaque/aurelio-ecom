import { randomBytes, createHash } from "node:crypto";
import { database } from "./db.ts";
export const digest = (value: string) =>
  createHash("sha256").update(value).digest("hex");
export const localEmailEnabled = () =>
  process.env.NODE_ENV !== "production" ||
  process.env.LOCAL_EMAIL_PREVIEW === "true";
export async function createAccountLink(
  customer: { id: string; email: string },
  purpose: "verify" | "reset",
) {
  const { db, client } = await database();
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(
    Date.now() + (purpose === "reset" ? 30 : 60) * 60000,
  );
  const url = new URL(
    "/account/link",
    process.env.SITE_URL || "http://localhost:3000",
  );
  // Fragments stay out of server/proxy request logs and referrer URLs.
  url.hash = new URLSearchParams({ token, purpose }).toString();
  const session = client.startSession();
  try {
    await session.withTransaction(async () => {
      await db
        .collection("accountLinks")
        .deleteMany({ customerId: customer.id, purpose }, { session });
      await db
        .collection("accountLinks")
        .insertOne(
          {
            tokenHash: digest(token),
            customerId: customer.id,
            purpose,
            expiresAt,
          },
          { session },
        );
      await db
        .collection("emailPreview")
        .insertOne(
          {
            to: customer.email,
            subject:
              purpose === "verify"
                ? "Verify your Aurelio email"
                : "Reset your Aurelio password",
            url: url.toString(),
            createdAt: new Date(),
            expiresAt,
            status: "local-preview-only",
          },
          { session },
        );
    });
  } finally {
    await session.endSession();
  }
}
