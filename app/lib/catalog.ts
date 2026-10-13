/* Money for trade quotations, which the studio prices individually in the
   buyer's currency (see quote-editor). Amounts are kept in the smallest unit. */
export type Currency = "INR" | "USD" | "GBP" | "EUR";
export const quoteCurrencies: Currency[] = ["INR", "USD", "GBP", "EUR"];

export function money(amount: number, currency: Currency = "INR") {
  return new Intl.NumberFormat(currency === "INR" ? "en-IN" : "en-GB", {
    style: "currency",
    currency,
    minimumFractionDigits: amount % 100 ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(amount / 100);
}
