# Launch setup

This site is the atelier, the trade catalogue and the enquiry desk. **Retail sales run on Shopify**: every "Visit the shop" button, `/shop`, and the old `/shipping` and `/returns` addresses go to the Shopify store. Shopify handles products, checkout, payments, shipping, returns and the retail policies.

## Your actions

1. **Shopify.** Once the store exists, put its address in `app/lib/brand.ts` → `brand.shopUrl` (for example `https://shop.aurelio.in`). Until then the shop buttons open the Contact form with "The online shop" selected.
2. **`app/lib/brand.ts` → `legal`:** name the grievance officer (shown in the privacy policy) and check the address.
3. **Read** `/privacy`, `/terms` and `/faq`, and have them reviewed before launch.
4. **AWS** (below), then run `npm run check:production` until nothing is BLOCKED.

## Hosting (recommendation)

Small and cheap, about **$15–20 a month**:

- **Lightsail container service**, Micro plan, in Mumbai (`ap-south-1`). HTTPS and the load balancer are included.
- **MongoDB Atlas** in Mumbai. Real MongoDB is needed: quotations use transactions.
- **SES** for email (enquiry alerts and quotation links).
- No S3 is needed: pictures sent with an enquiry are stored in the database.
- **Optional, for speed across India and abroad: CloudFront** in front of Lightsail. It serves the images, fonts and scripts from edge locations near each visitor over HTTP/2 and HTTP/3. Its free tier covers a site this size. The app already marks those files as cacheable for a year.

## Speed

Measured locally through HTTPS/HTTP/2 (Lighthouse, simulated slow 4G phone): performance 88–93 on mobile and 97–98 on desktop, accessibility 100, best practices 100, layout shift 0. SEO shows 69 only because `INDEXING_ENABLED=false` asks search engines to stay away until launch. `npm run check:css` lists any CSS rules that no longer match anything in the code.

## Environment variables

See `.env.example`. `npm run check:production` lists anything missing without printing secrets.
