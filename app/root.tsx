import { brand } from "./lib/brand";
import { collections } from "./lib/brand-content";
import { articles } from "./lib/journal";
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
import type { Product } from "./lib/catalog";
import { getProducts } from "../server/db";
import { frontendPreview } from "../server/preview-mode";
import { StoreProvider } from "./lib/store";
import {
  Header,
  Footer,
  GlobalPanels,
  RouteEffects,
  NavigationProgress,
} from "./components/layout";
import { AtelierMotion } from "./components/atelier-motion";
import NotFound from "./routes/not-found";
/* One bundle for the seven global layers — see app.css for the cascade order. */
import styles from "./app.css?url";
/* The two faces that render the first screen. Fontsource reaches them through an
   @import nested inside the stylesheet, which is a three-hop discovery chain;
   preloading them lets the text paint in its real face on the first frame. */
import manrope from "@fontsource/manrope/files/manrope-latin-400-normal.woff2?url";
import cormorant from "@fontsource/cormorant-garamond/files/cormorant-garamond-latin-400-normal.woff2?url";
export const links = () => [
  {
    rel: "preload",
    href: manrope,
    as: "font",
    type: "font/woff2",
    crossOrigin: "anonymous" as const,
  },
  {
    rel: "preload",
    href: cormorant,
    as: "font",
    type: "font/woff2",
    crossOrigin: "anonymous" as const,
  },
  { rel: "stylesheet", href: styles },
  { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
];
export const meta = () => [
  { title: "Aurelio by AF International — Metal & Wood" },
  { name: "theme-color", content: "#072319" },
  { name: "color-scheme", content: "light" },
  { name: "format-detection", content: "telephone=no" },
];
export async function loader({ context }: { context: { cspNonce?: unknown } }) {
  return {
    products: await getProducts(),
    frontendPreview: frontendPreview(),
    nonce: typeof context.cspNonce === "string" ? context.cspNonce : undefined,
    siteUrl: new URL(
      process.env.SITE_URL ||
        (process.env.VERCEL_URL
          ? `https://${process.env.VERCEL_URL}`
          : "http://localhost:3000"),
    ).origin,
  };
}
/* Catalogue images are stored either as an uploaded path ("/uploads/…") or as
   the name of a prepared set ("vase" → /images/vase-1440.webp). Concatenating
   the raw value gave crawlers and social cards URLs like "/vase" that 404. */
function absoluteImage(siteUrl: string, image: string) {
  return `${siteUrl}${image.startsWith("/") ? image : `/images/${image}-1440.webp`}`;
}

function structuredData({
  siteUrl,
  canonical,
  pathname,
  product,
}: {
  siteUrl: string;
  canonical: string;
  pathname: string;
  product?: Product;
}) {
  const organization = {
    "@type": "Organization",
    "@id": `${siteUrl}/#organization`,
    name: `${brand.name} by ${brand.company}`,
    alternateName: brand.company,
    url: siteUrl,
    logo: `${siteUrl}/favicon.svg`,
    foundingDate: brand.founded,
    email: brand.email,
    telephone: brand.phone,
    sameAs: [brand.instagram],
    address: {
      "@type": "PostalAddress",
      streetAddress: brand.address[1],
      addressLocality: brand.city,
      postalCode: "244001",
      addressRegion: "Uttar Pradesh",
      addressCountry: "IN",
    },
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "customer service",
        email: brand.email,
        telephone: brand.phone,
      },
      {
        "@type": "ContactPoint",
        contactType: "sales",
        name: "Trade and bulk enquiries",
        email: brand.tradeEmail,
        telephone: brand.phone,
      },
    ],
  };
  const entries: object[] = [];
  if (pathname === "/")
    entries.push({
      "@context": "https://schema.org",
      "@graph": [
        organization,
        {
          "@type": "WebSite",
          "@id": `${siteUrl}/#website`,
          url: siteUrl,
          name: brand.name,
          publisher: { "@id": `${siteUrl}/#organization` },
          potentialAction: {
            "@type": "SearchAction",
            target: `${siteUrl}/shop?q={search_term_string}`,
            "query-input": "required name=search_term_string",
          },
        },
      ],
    });
  if (product) {
    entries.push({
      "@context": "https://schema.org",
      "@type": "Product",
      name: product.name,
      description: product.description,
      image: [product.image, ...(product.gallery || [])].map((image) =>
        absoluteImage(siteUrl, image),
      ),
      sku: product.sku || product.id,
      material: product.material,
      color: product.finish,
      brand: { "@type": "Brand", name: brand.name },
      url: canonical,
      // Without an offer, Google treats Product markup as invalid.
      offers: {
        "@type": "Offer",
        url: canonical,
        priceCurrency: "INR",
        price: (product.prices.INR / 100).toFixed(2),
        availability:
          product.stock > 0
            ? "https://schema.org/InStock"
            : "https://schema.org/OutOfStock",
        itemCondition: "https://schema.org/NewCondition",
        seller: { "@type": "Organization", name: organization.name },
      },
    });
    entries.push({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        ["Home", "/"],
        ["The collection", "/shop"],
        [product.name, pathname],
      ].map(([name, path], i) => ({
        "@type": "ListItem",
        position: i + 1,
        name,
        item: `${siteUrl}${path}`,
      })),
    });
  }
  return entries;
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
    <html
      lang="en"
      data-frontend-preview={data?.frontendPreview ? "true" : undefined}
    >
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        {data?.frontendPreview && (
          <meta name="robots" content="noindex,nofollow" />
        )}
        <Links nonce={data?.nonce} />
        <meta name="description" content={description} />
        {data &&
          structuredData({
            siteUrl: data.siteUrl,
            canonical,
            pathname: location.pathname,
            product,
          }).map((entry, i) => (
            <script
              key={i}
              type="application/ld+json"
              nonce={data.nonce}
              dangerouslySetInnerHTML={{
                __html: JSON.stringify(entry).replace(/</g, "\\u003c"),
              }}
            />
          ))}
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
              content={absoluteImage(data.siteUrl, product?.image || "hero")}
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
  const unavailable =
    preview &&
    /^\/(admin|cms|account|checkout|orders|quotes|track-order)(\/|$)/.test(
      location.pathname,
    );
  return (
    <StoreProvider products={products}>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      {/* RouteEffects writes here after each client-side navigation. */}
      <p
        id="route-announcer"
        className="sr-only"
        role="status"
        aria-live="polite"
      />
      <NavigationProgress />
      <Header />
      <main id="main" tabIndex={-1}>
        {unavailable ? (
          <section className="container section">
            <p className="eyebrow">AURELIO / CLIENT PREVIEW</p>
            <h1>This chapter is still taking shape.</h1>
            <p>
              Accounts, ordering and the studio portal will open when the store
              launches.
            </p>
            <Link className="button" to="/">
              Explore Aurelio ↗
            </Link>
          </section>
        ) : (
          <Outlet />
        )}
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
  const data = useRouteLoaderData<typeof loader>("root");
  // A missing page is not a broken site: when the root data loaded, keep the
  // header, search and footer around the 404 so it is never a dead end. The
  // bare page below is kept for real failures, including the root loader's.
  if (data && isRouteErrorResponse(error) && error.status === 404)
    return (
      <StoreProvider products={data.products}>
        <title>Page not found — Aurelio</title>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <Header />
        <main id="main" tabIndex={-1}>
          <NotFound />
        </main>
        <Footer />
        <GlobalPanels />
        <AtelierMotion />
      </StoreProvider>
    );
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
