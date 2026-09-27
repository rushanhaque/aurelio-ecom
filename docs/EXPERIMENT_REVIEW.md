# Sensory atelier review

All eight requested concepts are available on the homepage, after the material atelier. Jump to `/#sensory-atelier` for the directory. No catalog products were created.

| # | Section / anchor | Review interaction |
|---|---|---|
| 1 | Time leaves a signature / `patina-study` | Scrub an illustrative patina overlay; preserve or embrace the finish. |
| 2 | The final polish / `polish-study` | Rub to reveal the surface; keyboard slider and reset are available. |
| 3 | The shadow theatre / `shadow-theatre` | Drag on the scene or move the sun slider to change the shadow. |
| 4 | Under the maker's lens / `makers-lens` | Move a magnifier across the texture; buttons select fixed details. |
| 5 | Anatomy of an object / `object-anatomy` | Scroll to separate lamp components, or override with the slider. |
| 6 | One object, three lives / `three-lives` | Switch the vessel between home, hotel and evening-table scenes. |
| 7 | The rhythm of the atelier / `atelier-rhythm` | Select workshop stills; optionally play a short synthesised sound sketch. |
| 8 | From your line to our hands / `your-line` | Change vessel proportions and material, switch drawing/form, carry choices into the enquiry. |

Each section is an exported component in `app/components/atelier-experiments.tsx`. Remove its component call and directory entry together when curating the final homepage. These review sections are code-managed, not CMS entries.

The patina, polish, anatomy, rooms and vessel are labelled illustrations. They are not verified product specifications, ageing predictions or purchase configurations. Actual workshop film/audio was not available; workshop stills and opt-in synthesised audio are used rather than represented as recordings. Final photo/film realism requires suitable supplied assets.

Images reuse existing responsive assets. Scroll tracking runs only while the anatomy section is visible; reduced-motion users can use its slider. Audio starts only on request and stops after a short sketch or when leaving the component. Rubbed areas use a bounded grid to retain strokes without accumulating unlimited pointer samples.

Validation: typecheck and production build; desktop and 390px mobile inspection; eight section anchors; patina state, polish gesture/reset, sun range, lens detail positions, anatomy manual override, room switch, sound-button state and bespoke brief handoff. Mobile viewport had no horizontal overflow. Sound playback was checked through UI state, not an acoustic recording. No form was submitted.
