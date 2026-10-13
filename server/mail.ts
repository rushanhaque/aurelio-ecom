import { database } from "./db.ts";

/* Outgoing email, behind one function so the rest of the server never cares how
   a message travels.

   EMAIL_PROVIDER decides it:
     ses    Amazon SES (production). Needs EMAIL_FROM, a sender verified in SES,
            and AWS credentials (an IAM role on the host; locally, the usual AWS
            variables). AWS_REGION picks the region (ap-south-1 for Mumbai).
     local  Nothing is sent. The message is stored in the "emailPreview"
            collection so it can be read in the studio (development only).
     none   Messages are dropped and a line is logged.
   When EMAIL_PROVIDER is not set: "local" outside production, "none" in it.

   Sending never throws: a failed email must not fail an enquiry.
   It returns whether the message was handed on. */

export type Mail = {
  to: string;
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
};

/* True while the studio's local inbox is the way mail "arrives" (development). */
export const localEmailEnabled = () =>
  process.env.NODE_ENV !== "production" ||
  process.env.LOCAL_EMAIL_PREVIEW === "true";

export function emailProvider(): "ses" | "local" | "none" {
  const set = process.env.EMAIL_PROVIDER;
  if (set === "ses" || set === "local" || set === "none") return set;
  return process.env.NODE_ENV === "production" ? "none" : "local";
}

const escape = (value: string) =>
  value.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );

/* A plain, readable HTML version of a text message: paragraphs, and bare links
   made clickable. Kept deliberately simple so every mail client shows it. */
export function htmlFromText(text: string) {
  const body = escape(text)
    .split(/\n{2,}/)
    .map((paragraph) =>
      `<p style="margin:0 0 16px">${paragraph.replace(/\n/g, "<br>")}</p>`.replace(
        /(https?:\/\/[^\s<]+)/g,
        '<a href="$1">$1</a>',
      ),
    )
    .join("");
  return `<div style="font-family:Georgia,'Times New Roman',serif;font-size:16px;line-height:1.6;color:#072319;max-width:560px">${body}</div>`;
}

let sesClient: any;
async function viaSes(mail: Mail) {
  const from = process.env.EMAIL_FROM;
  if (!from) throw new Error("EMAIL_FROM is not set.");
  const { SESv2Client, SendEmailCommand } = await import(
    "@aws-sdk/client-sesv2"
  );
  sesClient ||= new SESv2Client({
    region: process.env.AWS_REGION || "ap-south-1",
  });
  await sesClient.send(
    new SendEmailCommand({
      FromEmailAddress: from,
      Destination: { ToAddresses: [mail.to] },
      ReplyToAddresses: mail.replyTo ? [mail.replyTo] : undefined,
      Content: {
        Simple: {
          Subject: { Data: mail.subject, Charset: "UTF-8" },
          Body: {
            Text: { Data: mail.text, Charset: "UTF-8" },
            Html: {
              Data: mail.html || htmlFromText(mail.text),
              Charset: "UTF-8",
            },
          },
        },
      },
    }),
  );
}

export async function sendMail(mail: Mail) {
  const provider = emailProvider();
  try {
    if (provider === "ses") {
      await viaSes(mail);
      return true;
    }
    if (provider === "local") {
      const { db } = await database();
      await db.collection("emailPreview").insertOne({
        to: mail.to,
        subject: mail.subject,
        text: mail.text,
        // The first link in the message, which the studio's inbox shows.
        url: mail.text.match(/https?:\/\/\S+/)?.[0],
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        status: "local-preview-only",
      });
      return true;
    }
    console.log(
      JSON.stringify({ event: "mail.dropped", reason: "EMAIL_PROVIDER=none" }),
    );
    return false;
  } catch (error) {
    console.error(
      JSON.stringify({
        event: "mail.failed",
        provider,
        type: error instanceof Error ? error.name : "UnknownError",
      }),
    );
    return false;
  }
}

/* The studio's own copy of what matters (a new enquiry, message or quote).
   Goes to NOTIFY_EMAIL; if that is not set, nobody is told, and the record is
   still in the studio. */
export function notifyStudio(subject: string, text: string) {
  const to = process.env.NOTIFY_EMAIL;
  if (!to) return Promise.resolve(false);
  return sendMail({ to, subject: `[Aurelio] ${subject}`, text });
}
