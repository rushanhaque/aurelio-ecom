# Aurelio content source and implementation

The owner's local project at `D:\Code\Done ones\Aurelio` is the reference for this content pass. It is read only. The ecommerce implementation, database, checkout and manually managed catalog remain in the current project.

## Source mapping

| Information | Original source | Current implementation |
| --- | --- | --- |
| Seven collections, ordering, taglines and descriptions | `src/data/collections.js` | `app/lib/brand-content.ts`, homepage explorer, collection directory and seven detail pages |
| Nine materials, traits, notes, material and texture photographs | `src/data/materials.js`, `assets/Materials` | Material library, homepage material links, shop filter, admin suggestions |
| AF International, 2008 founding, family workshop, Moradabad, worldwide export | `src/pages/AboutPage.jsx` | Shared `app/lib/brand.ts`, about/craft pages, homepage, footer, journal, SEO |
| Address, appointment hours, phone, general and export email | `src/pages/ContactPage.jsx` | Contact page, bulk page and global footer |
| WhatsApp and Instagram | `src/components/sections/Footer.jsx` | Footer and contact links |
| Enquiry, Design, Sample, Forge, Finish, Delivery | `src/components/sections/Timeline.jsx` | Bulk commission process and journal |
| Material care topics | `src/pages/CareGuidePage.jsx` | Nine material-specific care sections; finish-dependent advice adapted conservatively |
| Customization, international shipping and variable lead times | `src/pages/LegalPage.jsx` FAQ | FAQ and commission content, with current preview status retained |
| Metal, wrought into permanence | `src/components/sections/Hero.jsx` | Homepage supporting headline |

## Canonical collections

Urns, Lighting, Furniture, Kitchenware, Decor, Accessories, Bespoke. The six retail collection IDs are shared by server product validation. Bespoke has a full editorial detail page and routes to an enquiry, not a purchasable SKU. Admin uses the same collection metadata as the storefront.

## Canonical materials

Brass, Copper, Patinated Steel, Bronze, Blown Glass, Wood, Aluminium, Porcelain, Ceramic. This full nine-entry data source takes precedence over the older six-panel homepage section, whose heading and entries disagreed. Original covers and textures have three locally hosted responsive WebP variants each.

## Deliberately excluded or adapted

The original collection module explicitly calls its image-generated products a demo catalog. Its product name recipes, stock implications and generated specifications were not imported. The original legal module identifies itself as portfolio/demo copy, so its lifetime structural warranty, deposit obligations and legal terms were not made into live store policies. Unverified testimonials/press ratings and inconsistent workshop counters were not added. Murano provenance and blanket material-safety/durability assurances were not copied from demo data as guarantees. Care instructions avoid universal acidic cleaning, sanding, appliance-safety or repair advice because actual product finishes are not yet specified.

Original imagery is presented as supplied editorial content, not proof of available inventory. Existing payment, shipping and email-preview limitations remain accurate. Source Formspree endpoints and falsely unconditional success handlers were not copied; the current validated local submission endpoints remain in use.

## Maintenance

- Edit shared business contacts/story in `app/lib/brand.ts`.
- Edit collection and material content in `app/lib/brand-content.ts`.
- `scripts/import-brand-content.mjs` can regenerate collection/material metadata and responsive imagery from the original project; it overwrites that generated metadata file. It parses only data literals with TypeScript's AST and does not execute the source project.
- Products are still created manually in `/admin`, with uploaded product photography.

## Validation

Nine commerce validation tests passed, including all six retail category IDs and rejection of Bespoke/old categories for product publication. Eighty-one HTTP smoke assertions passed, including the new material/about and seven collection detail routes. No products were added. Desktop and phone browser checks cover material texture toggling, all nine care links, collection navigation, seven-tab keyboard wrapping, material filtering, catalogue-request preselection and small-phone layout overflow.

## Bulk-enquiry catalogue (imported from aurelio.in)

At the owner's request, aurelio.in's catalogue is now listed on the collection pages as **enquiry-only pieces**. They have no price, stock or checkout, and they never enter the retail product database managed in `/admin`.

- `node scripts/import-catalogue.mjs ["D:/Code/Done ones/Aurelio"]` regenerates `app/lib/catalogue.json` and `public/images/catalogue/<collection>/<slug>-{480,960}.webp`. It reproduces aurelio.in's own rules exactly: same image folders, the same screenshot/duplicate exclusions, the same sort order, and the same `RECIPE` naming. So names and order match the live site. It evaluates only the `RECIPE` data literal, in an empty sandbox.
- 220 pieces: Urns 16, Lighting 15, Kitchenware 16, Decor 12, Accessories 161. Furniture has no imagery on aurelio.in; Bespoke routes to an enquiry.
- Pages: each collection lists its pieces (24 at a time); `/pieces/:slug` shows one piece with a quotation request prefilled into the bulk form and a WhatsApp link. All pieces are in the sitemap.
- Catalogue data is read on the server (`app/lib/catalogue.server.ts`) and never shipped in the client bundle.
- **Caveat:** aurelio.in assigns each piece's material and finish by rotating through four options per collection, not from the photograph. Some labels therefore don't match the image (e.g. a white enamel urn labelled "Cast bronze"). The piece page states that material and finish are confirmed with the quotation. Correct the labels in `catalogue.json` (or the source recipe) before relying on them.

## Section imagery audit

Each section's image was checked against what the section says.

| Section | Image | Source |
| --- | --- | --- |
| Finishes: "Hand-hammered, up close" (lens) | `images/finishes/hammered-brass-2400.webp` | **Generated** by `scripts/generate-hammered-brass.mjs`, composed for the three detail buttons: deep, crisp strikes at "The high points" (160,150), soft planishing at "The quieter marks" (410,210), and brushed grain turning from straight to spun at "The changing grain" (280,335). It is lit as a reflection of a studio softbox on brass, with satin roughness, oxidised hollows and filmic tone mapping, at 2400 px so it stays sharp at 2.4×. |
| Finishes: "One piece, many finishes" | `original/Lamptwo` and `LamptwoHover` | The real Solène table lamp from the archive, replacing a drawn SVG lamp. It has hotspots for shade, light source, stem and base, and the slider crossfades the off and lit photographs. |
| Finishes: "A finish for every room" | `brand/lightings`, `brand/furniture`, `brand/kitchenware` | Real settings (quiet home, boutique hotel, gathered table), replacing drawn SVG rooms. Each names the finish that suits it. |
| Home "For spaces with a story" | `brand/decor` | aurelio.in collection cover (boutique display). Previously reused the hero image; moved off `brand/furniture` so that photo appears once on the home page, in the rooms study. |
| Bulk enquiries hero | `brand/decor` | aurelio.in collection cover (boutique display). Previously the same image as About us. |
| Bulk commission stages | `images/stages/*.webp` | aurelio.in `HomePage/PathAPieceTravels`, one image per stage. Imported by `scripts/import-stage-images.mjs`. |
| Journal "The path a piece travels" | `brand/path` | aurelio.in `HomePage/WhereWeExcel/designanddrafting`, cropped to the hand at the drawing. Previously a furnished lounge. |

`brand/brass-texture` stays where it is accurate: the brass surface in the material atelier and on the materials page.
