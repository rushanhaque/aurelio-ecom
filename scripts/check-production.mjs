import "dotenv/config";
import { readFileSync } from "node:fs";

// The shop address and legal details live in app/lib/brand.ts; read them as
// text so this script needs no TypeScript tooling.
const brand = readFileSync(new URL("../app/lib/brand.ts", import.meta.url), "utf8");
const field = (pattern) => {
  const m = brand.match(pattern);
  return Boolean(m && m[1].trim());
};
const env = (name) => (process.env[name] || "").trim();

const checks = [
  ["External MongoDB configured", Boolean(env("MONGODB_URI"))],
  ["Public HTTPS origin configured", /^https:\/\/[^/]+\/?$/.test(env("SITE_URL"))],
  ["Local email inbox disabled", env("LOCAL_EMAIL_PREVIEW") !== "true"],
  ["Admin secret has at least 32 characters", env("ADMIN_TOKEN").length >= 32],
  [
    "Email sent through SES with a sender address",
    env("EMAIL_PROVIDER") === "ses" && Boolean(env("EMAIL_FROM")),
  ],
  ["Studio notification address set (NOTIFY_EMAIL)", Boolean(env("NOTIFY_EMAIL"))],
  ["Behind the load balancer (TRUST_PROXY)", Boolean(env("TRUST_PROXY"))],
  ["Shopify shop address set (shopUrl in app/lib/brand.ts)", field(/shopUrl:\s*"([^"]*)"/)],
];
const warnings = [
  [
    "Grievance officer not named in app/lib/brand.ts (shown in the privacy policy)",
    !field(/grievanceOfficer:\s*\{[^}]*?name:\s*"([^"]*)"/s),
  ],
  ["INDEXING_ENABLED is still false (search engines will ignore the site)", env("INDEXING_ENABLED") !== "true"],
];
for (const [label, ok] of checks) console.log(`${ok ? "PASS" : "BLOCKED"} ${label}`);
for (const [label, on] of warnings) if (on) console.log(`WARN    ${label}`);
console.log(
  "Manual gates: sending domain verified in SES; privacy and terms reviewed; backups; real-device checks. See docs/LAUNCH_SETUP.md.",
);
if (checks.some(([, ok]) => !ok)) process.exitCode = 1;
