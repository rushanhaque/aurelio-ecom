import { brand } from "./lib/brand";
import { collections } from "./lib/brand-content";
import { articles } from "./lib/journal";
import brandStyles from "./brand-content.css?url";
import operations from "./operations.css?url";
import refinement from "./refinement.css?url";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
  useRouteError,
  useLoaderData,
  Link,
  useRouteLoaderData,
  useLocation,
} from "react-router";
import type { ReactNode } from "react";
import { getProducts } from "../server/db";
import { frontendPreview } from "../server/preview-mode";
import { StoreProvider } from "./lib/store";
import {
  Header,
  Footer,
  GlobalPanels,
  RouteEffects,
} from "./components/layout";
import styles from "./styles.css?url";
import { AtelierMotion } from "./components/atelier-motion";
import interactions from "./interaction.css?url";
export const links = () => [
  { rel: "stylesheet", href: styles },
  { rel: "stylesheet", href: interactions },
  { rel: "stylesheet", href: brandStyles },
  { rel: "stylesheet", href: operations },
  { rel: "stylesheet", href: refinement },
  { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
];
export const meta = () => [
  { title: "Aurelio by AF International — Metal & Wood" },
  { name: "theme-color", content: "#072319" },
];
export async function loader({ context }: { context: { cspNonce?: unknown } }) {
  return {
    products: await getProducts(),
    frontendPreview: frontendPreview(),
    nonce: typeof context.cspNonce === "string" ? context.cspNonce : undefined,
    siteUrl: new URL(process.env.SITE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")).origin,
  };
}
export function Layout({ children }: { children: ReactNode }) {
  const data = useRouteLoaderData<typeof loader>("root");
  const location = useLocation();
  const canonical = `${data?.siteUrl || ""}${location.pathname}`;
  const product = data?.products.find(
    (p) => location.pathname === `/products/${p.slug}`,
  );
  const collection = collections.find(
    (c) => location.pathname === `/collections/${c.slug}`,
  );
  const article = articles.find(
    (a) => location.pathname === `/journal/${a.slug}`,
  );
  const description =
    product?.description ||
    article?.excerpt ||
    (collection
      ? `Explore Aurelio’s ${collection.name.toLowerCase()} collection. Metal and wood, made by hand in Moradabad. Retail objects and bulk enquiries.`
      : brand.story);
  return (
    <html lang="en" data-frontend-preview={data?.frontendPreview ? "true" : undefined}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        {data?.frontendPreview && <meta name="robots" content="noindex,nofollow" />}
        <Links nonce={data?.nonce} />
        <meta name="description" content={description} />
        {product && data && (
          <script
            type="application/ld+json"
            nonce={data.nonce}
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Product",
                name: product.name,
                description: product.description,
                image: [
                  `${data.siteUrl}${product.image}`,
                  ...(product.gallery || []).map(
                    (image) => `${data.siteUrl}${image}`,
                  ),
                ],
                sku: product.sku || product.id,
                material: product.material,
                brand: { "@type": "Brand", name: "Aurelio" },
                url: canonical,
              }).replace(/</g, "\\u003c"),
            }}
          />
        )}
        {data && (
          <>
            <link rel="canonical" href={canonical} />
            <meta property="og:site_name" content="Aurelio" />
            <meta
              property="og:type"
              content={product ? "product" : "website"}
            />
            <meta property="og:url" content={canonical} />
            <meta
              property="og:title"
              content={
                product
                  ? `${product.name} — Aurelio`
                  : "Aurelio — Metal & Wood, Made by Hand"
              }
            />
            <meta property="og:description" content={description} />
            <meta
              property="og:image"
              content={`${data.siteUrl}${product?.image || "/images/hero-1440.webp"}`}
            />
            <meta name="twitter:card" content="summary_large_image" />
          </>
        )}
        {(location.search ||
          /^\/(account|admin|orders|checkout|cart|wishlist|preferences|track-order)(\/|$)/.test(
            location.pathname,
          )) && <meta name="robots" content="noindex,follow" />}
      </head>
      <body>
        {children}
        <ScrollRestoration nonce={data?.nonce} />
        <Scripts nonce={data?.nonce} />
      </body>
    </html>
  );
}
export default function App() {
  const { products, frontendPreview: preview } = useLoaderData<typeof loader>();
  const location = useLocation();
  const unavailable = preview && /^\/(admin|cms|account|checkout|orders|quotes|track-order)(\/|$)/.test(location.pathname);
  return (
    <StoreProvider products={products}>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <Header />
      <main id="main">
        {unavailable ? <section className="container section"><p className="eyebrow">AURELIO / CLIENT PREVIEW</p><h1>This chapter is still taking shape.</h1><p>Accounts, ordering and the studio portal will open when the store launches.</p><Link className="button" to="/">Explore Aurelio ↗</Link></section> : <Outlet />}
      </main>
      <Footer />
      <GlobalPanels />
      <RouteEffects />
      <AtelierMotion />
    </StoreProvider>
  );
}
export function ErrorBoundary() {
  const error = useRouteError();
  return (
    <div className="error-page">
      <Link to="/" className="wordmark">
        AURELIO
      </Link>
      <p className="eyebrow">A MOMENT TO RESET</p>
      <h1>
        {isRouteErrorResponse(error) && error.status === 404
          ? "A little off the beaten path."
          : "Something interrupted the journey."}
      </h1>
      <p>Please return to the collection and try again.</p>
      <a className="button" href="/">
        Back to Aurelio <span>↗</span>
      </a>
    </div>
  );
}
