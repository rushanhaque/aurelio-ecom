import { brand } from "./lib/brand";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
  useRouteError,
  Link,
  useRouteLoaderData,
  useLocation,
} from "react-router";
import type { ReactNode } from "react";
import { frontendPreview } from "../server/preview-mode";
import { PageIntro } from "./components/page-intro";
/* Only the shared foundations and the homepage introduction. */
import styles from "./app.css?url";
/* The two faces that render the first screen. Fontsource reaches them through an
   @import nested inside the stylesheet, which is a three-hop discovery chain;
   preloading them lets the text paint in its real face on the first frame. */
import manrope from "@fontsource/manrope/files/manrope-latin-400-normal.woff2?url";
import cormorant from "@fontsource/cormorant-garamond/files/cormorant-garamond-latin-400-normal.woff2?url";
/* The italic cut sets the accent word of nearly every page title ("A family
   atelier."); without it in hand the title reflowed when it arrived. */
import cormorantItalic from "@fontsource/cormorant-garamond/files/cormorant-garamond-latin-400-italic.woff2?url";
export const links = () => [
  /* The stylesheet is the only thing that blocks the first paint, so it is
     requested ahead of the font preloads that would otherwise share its
     bandwidth. */
  { rel: "stylesheet", href: styles },
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
  {
    rel: "preload",
    href: cormorantItalic,
    as: "font",
    type: "font/woff2",
    crossOrigin: "anonymous" as const,
  },
  /* The wordmark face: the header mark on every page and the landing title. */
  {
    rel: "preload",
    href: "/fonts/cinzel-600.woff2",
    as: "font",
    type: "font/woff2",
    crossOrigin: "anonymous" as const,
  },
  { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
];
/* Only the title lives here: a route that exports its own meta replaces this
   list entirely, which silently dropped theme-color and friends on every such
   page. Tags every page needs are written straight into the Layout head. */
export const meta = () => [
  { title: "Aurelio by AF International — Metal & Wood" },
];
export async function loader({ context }: { context: { cspNonce?: unknown } }) {
  return {
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
/* Images are named by their prepared set ("hero" → /images/hero-1440.webp). */
function absoluteImage(siteUrl: string, image: string) {
  return `${siteUrl}/images/${image}-1440.webp`;
}

/* Runs before first paint: marks devices that would struggle with the heavier
   effects (blur, grain, scrubbed parallax) so CSS and the motion layer can
   lighten them. Everything still works and reveals; it just costs less. */
const perfProbe = `(function(){try{var n=navigator,c=n.connection||{},m=n.deviceMemory||8,h=n.hardwareConcurrency||8;if(c.saveData||m<=2||h<=2||(m<=4&&h<=4))document.documentElement.dataset.perf="lite"}catch(e){}})()`;

function structuredData({
  siteUrl,
  pathname,
}: {
  siteUrl: string;
  pathname: string;
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
        },
      ],
    });
  return entries;
}

export function Layout({ children }: { children: ReactNode }) {
  const data = useRouteLoaderData<typeof loader>("root");
  const location = useLocation();
  const canonical = `${data?.siteUrl || ""}${location.pathname}`;
  const description = brand.story;
  return (
    <html
      lang="en"
      data-frontend-preview={data?.frontendPreview ? "true" : undefined}
      suppressHydrationWarning
    >
      <head>
        <meta charSet="utf-8" />
        <script
          nonce={data?.nonce}
          dangerouslySetInnerHTML={{ __html: perfProbe }}
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#072319" />
        <meta name="color-scheme" content="light" />
        <meta name="format-detection" content="telephone=no" />
        <Meta />
        {data?.frontendPreview && (
          <meta name="robots" content="noindex,nofollow" />
        )}
        <Links nonce={data?.nonce} />
        <meta name="description" content={description} />
        {data &&
          structuredData({
            siteUrl: data.siteUrl,
            pathname: location.pathname,
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
            <meta property="og:type" content="website" />
            <meta property="og:url" content={canonical} />
            <meta
              property="og:title"
              content="Aurelio — Metal & Wood, Made by Hand"
            />
            <meta property="og:description" content={description} />
            <meta
              property="og:image"
              content={absoluteImage(data.siteUrl, "hero-film")}
            />
            <meta name="twitter:card" content="summary_large_image" />
          </>
        )}
        {location.search && <meta name="robots" content="noindex,follow" />}
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
  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <PageIntro />
      <main id="main" tabIndex={-1}>
        <Outlet />
      </main>
    </>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  const missing = isRouteErrorResponse(error) && error.status === 404;
  return (
    <main className="error-page">
      <title>
        {missing ? "Page not found — Aurelio" : "Aurelio — A moment to reset"}
      </title>
      <Link to="/" className="error-wordmark">
        AURELIO
      </Link>
      <h1>
        {missing ? "A little off the beaten path." : "A moment to reset."}
      </h1>
      <p>Please return to Aurelio and try again.</p>
      <a className="error-return" href="/">
        Back to Aurelio <span aria-hidden="true">↗</span>
      </a>
    </main>
  );
}
