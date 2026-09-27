# From fire to feeling

The homepage now follows a narrative order: the idea → the making → the workshop → selected works → light and form → the Aurelio standard → the visitor's own chapter.

## Motion design

- Hero titles enter through separate typographic masks. Supporting text follows with a short stagger.
- The introduction gains ink word by word as it moves through the viewport.
- A three-act story pairs casting, handwork and a finished lantern with individual narrative passages. At widths above 900px, native sticky positioning holds the scene while a GSAP timeline changes chapters, reveals images through a narrow aperture, lifts title lines and draws a brass SVG thread. The progress rule follows the same timeline.
- On phones and tablets, all three acts stay in normal document flow with lighter image and title reveals. Reduced-motion users receive the static, fully expanded story.
- Gallery frames reveal on entry, with captions following. Fine pointers add restrained perspective tilt and a local light reflection. Original image crossfades and mobile tap overrides remain available.
- A floating chapter navigator links directly to the idea, making, objects and commission sections. Active chapter state uses IntersectionObserver. It includes a direct shop link and is suppressed while dialogs are open.
- Section rules draw into view; existing magnetic controls, light slider, scene changes and form exploration remain in place.

## Implementation constraints

Motion uses the existing dynamically imported GSAP bundle. No new dependency, video download or external service was introduced. ScrollTrigger, matchMedia contexts and pointer listeners are cleaned up on route changes. Server-rendered content remains visible before animation setup; keyboard focus overrides gallery clipping. Imported imagery uses the existing local responsive assets. No catalog records were added.

## Local review

Desktop 1440px: verified first, middle and last acts; sticky stage at top 0; scroll progress changes; chapter navigation works. Phone 390px: resized from desktop and confirmed all three panels become visible in normal flow. Phone 320px: page width equals content width, chapter navigator fits, gallery keyboard activation updates its pressed state. Browser console in the reviewed optimized build had no warnings or errors. TypeScript and production build are checked separately in the build workflow. This is not a claim of measured production Core Web Vitals.
