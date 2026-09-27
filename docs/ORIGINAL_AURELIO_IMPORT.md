# Original Aurelio section integration

Source: the owner's local project at `D:\Code\Done ones\Aurelio`. The source project was read only and remains unchanged. The live aurelio.in URL was not accessible through the web reader, so this integration uses the supplied source code and assets directly.

## Sections adapted

- **Selected Works:** all 12 entries and 24 rest/hover images from `src/components/sections/Gallery.jsx` and `assets/HomePage/Selected works`. Preserves the natural-ratio three-column collage, italic captions, crossfades, light-image zoom and brass underline. Adapts to two columns on tablet and one on phone. Buttons support mouse, keyboard and persistent tap overrides; an IntersectionObserver provides the original phone self-lighting effect. These are editorial archive entries, not products or inventory records.
- **The Aurelio Standard:** the principal manifesto and three making principles from `Manifesto.jsx`, with two-tone oversized serif typography and the background Roman numeral. Does not introduce new founding dates or certification claims.
- **Where we excel:** all five stages and their workshop images from `Atelier.jsx`. Adapted into a native horizontal scroll-snap filmstrip with touch, previous/next controls, keyboard navigation and a visible stage indicator. It does not hijack vertical scrolling. Stage four and five copy is lightly edited to avoid blanket finish/durability promises.

Implementation: `app/components/original-sections.tsx`, `app/original-sections.css`, and the existing homepage and motion controller. The catalog database and checkout are untouched.

## Images

29 originals converted into 480px and 960px WebP variants. Dimensions are recorded in `app/lib/original-image-sizes.json` to reserve layout space. Images are lazy loaded, decoded asynchronously and hosted locally. Reproducible import:

```powershell
node scripts/import-original-assets.mjs 'D:\Code\Done ones\Aurelio'
```

## Verified locally

- Route generation, TypeScript checks and optimized production build passed.
- Desktop 1440px: all 12 archive works render in three columns; lighting button state changes; workshop next control advances and aligns the second stage.
- Phone 390px and 320px: one-column archive, no horizontal page overflow, touch override of automatic lighting works, workshop arrow/keyboard navigation advances the visible stage.
- Browser console in the reviewed optimized build: no warnings or errors.
- Reduced-motion CSS disables transitions and the automatic phone-lighting observer is conditioned on no-preference. No field-performance certification is implied.
