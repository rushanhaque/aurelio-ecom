import "dotenv/config";
const checks = [
  ["External MongoDB configured", Boolean(process.env.MONGODB_URI)],
  [
    "Public HTTPS origin configured",
    /^https:\/\/[^/]+\/?$/.test(process.env.SITE_URL || ""),
  ],
  [
    "Unpaid checkout simulations disabled",
    process.env.ALLOW_PREVIEW_ORDERS !== "true",
  ],
  ["Local email inbox disabled", process.env.LOCAL_EMAIL_PREVIEW !== "true"],
  [
    "Admin secret has at least 32 characters",
    (process.env.ADMIN_TOKEN || "").length >= 32,
  ],
];
for (const [label, ok] of checks)
  console.log(`${ok ? "PASS" : "BLOCKED"} ${label}`);
console.log(
  "Manual release gates: payment integration; shipping/tax/duties; sending domain; MFA/roles; approved policies; backups; real-device accessibility/performance. See docs/IMPLEMENTATION_STATUS.md.",
);
if (checks.some(([, ok]) => !ok)) process.exitCode = 1;
