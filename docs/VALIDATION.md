# Local validation — 21 September 2026

- TypeScript route generation and type checking: passed.
- Optimized client and server production build: passed.
- Eight isolated commerce validation tests: passed.
- Sixty-three HTTP smoke assertions against the optimized local preview: passed. Includes SSR routes, real MongoDB form persistence, account sessions, invalid login, revoked sessions, protected admin access, cross-origin mutation rejection and real 404 responses.
- Separate disposable-database transaction test: passed for simultaneous identical checkout requests, changed-payload retries, authorized/private order access and competing orders for limited stock. That database was removed afterward. No test products were added to Aurelio’s storefront.
- Catalog confirmed empty. Temporary QA accounts, enquiries, messages and subscriptions removed using exact test identifiers.
- Browser review: desktop, 768px tablet, 390px phone and 320px small phone. No horizontal page overflow at those tested widths. Mobile menu and currency, search empty state, bag dialog, collection layouts and bulk form checked.
- Mobile bulk enquiry submitted successfully and verified by its saved reference, then that exact QA record was removed.
- Optimized-build browser console: no errors or warnings in the reviewed session.

## Scope of these checks

These are local checks, not a production performance or accessibility certification. No Lighthouse/Core Web Vitals field claim is made. Real product content, carrier/tax integrations, email delivery, payment webhooks and live fulfillment still require configuration and testing before launch. Product browsing and buying use the implemented templates; the public catalog remains empty at the owner’s request.

Editorial images use responsive WebP variants: the 1440px hero is approximately 128 KB and the 480px hero approximately 21 KB. Fonts are hosted locally. GSAP and ScrollTrigger load in separate chunks and reduced-motion preferences skip the scroll animation setup.
