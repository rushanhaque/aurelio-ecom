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
