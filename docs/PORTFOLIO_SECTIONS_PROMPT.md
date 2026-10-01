# Prompt — five interactive "study" sections for my portfolio

> Copy everything below this line into the portfolio chat.

---

I want to add five interactive sections to my portfolio. Each one should feel like a small
**instrument** rather than a widget: the visitor makes one physical gesture, the page responds,
and in doing so it proves something true about how I work — without a paragraph telling them.

Before writing any code:

1. **Explore the repo.** Identify the framework, styling approach (CSS modules / Tailwind / plain
   CSS / styled-components), animation libraries already installed, the design tokens (colours,
   fonts, spacing, easing), and how projects are currently stored (MDX, JSON, CMS, hard-coded).
2. **Match the existing design language.** Reuse the existing tokens, type scale and motion
   curves. Do not introduce a new visual style or a heavy new dependency unless there is no
   reasonable alternative — and tell me before you do.
3. **Show me a short plan** (where each section will live, which files you will add/change, what
   data you need from me) and wait for my go-ahead. Ask me for any real data you need (project
   screenshots per milestone, GitHub username, commit history, constraints per project) rather
   than inventing it. Use clearly-marked placeholder data until I provide it.

## The design principle (apply to all five)

Every section follows the same three rules:

1. **One gesture.** Drag, hover, scrub, resize or pick. Never more than one primary interaction.
2. **One truth.** The interaction demonstrates a real quality of my work (engineering depth,
   process, responsiveness, consistency, problem-solving). If it is just decoration, cut it.
3. **Instrument framing.** Each section is framed like a lab study: a numbered label
   (`STUDY 01 — X-RAY`), thin crosshair corner marks, monospaced/tabular numerals, and a **live
   readout** that updates as the visitor interacts (e.g. `412 px · MOBILE · CLS 0.00`).

Build a shared `StudyFrame` component for this framing (label, corner marks, readout slot,
caption slot) so all five sections look like one series.

## Shared requirements

- **Accessibility:** every interaction must have a keyboard equivalent (arrow keys / buttons /
  range inputs with `aria-valuetext`). Readouts that change continuously go in an
  `aria-live="polite"` region but are throttled so screen readers are not spammed. Respect
  `prefers-reduced-motion`: show the final/static state and disable inertia, autoplay and
  looping animation.
- **Touch:** every gesture must work with a finger. Use pointer events + `setPointerCapture`,
  and `touch-action` set appropriately so dragging does not scroll the page.
- **Performance:** no layout thrash — animate `transform`/`opacity` or draw to `<canvas>`; batch
  pointer updates in `requestAnimationFrame`; lazy-load each section's heavy assets with
  `IntersectionObserver`; pause any loops when the section is off screen. No section may add
  more than ~30 KB gzipped of JS.
- **Responsive:** works from 320 px to 1920 px with no horizontal page scroll.
- **Fallback:** if JS fails, each section still shows a meaningful static image + caption.
- **Data-driven:** content lives in one data file per section (or in the existing project data
  source) so I can update it without touching component code.

---

## Study 01 — "Look underneath." (X-ray lens)

**Truth it proves:** the polish has real engineering behind it.

- A finished project screenshot fills a frame. A circular lens (~180 px, 120 px on mobile)
  follows the pointer. Inside the lens, the same region is shown in a different **layer**.
- Three layers, cycled with the scroll wheel while hovering, a segmented control, or keys 1/2/3:
  1. **Wireframe** — boxes/outlines of the layout.
  2. **Components** — the same area with component names labelled (`<ProjectCard/>`, `<Nav/>`).
  3. **Code** — a syntax-highlighted snippet of the component under the lens.
- Implementation: stack the layers as aligned images (or one image + an SVG overlay with
  component bounding boxes from a data file), and reveal the active layer through a CSS
  `clip-path: circle(r at x y)` driven by CSS custom properties. The code layer can be a
  pre-rendered image, or real highlighted text positioned per component region.
- **Readout:** `LAYER 2 / COMPONENTS · <ProjectCard /> · 38 LINES`
- Keyboard: arrow keys move the lens in 24 px steps; 1/2/3 switch layers.
- Mobile: the lens sits at a fixed spot; dragging moves it; a tap toggles layers.
- Data per project: `{ screenshot, wireframe, components: [{ name, x, y, w, h, codeSnippet }] }`.
- **Done when:** the lens tracks smoothly at 60 fps, all three layers line up pixel-perfectly
  with the screenshot, and the readout names the component under the lens centre.

## Study 02 — "Rewind the build." (process scrubber)

**Truth it proves:** I have a process; the final design was earned, not lucky.

- A large frame shows a project. Beneath it, a long horizontal timeline with tick marks for
  each milestone (sketch → wireframe → first build → redesign → launch).
- Dragging the playhead scrubs through milestone screenshots with a cross-fade (or a wipe) between
  adjacent frames, proportional to position between ticks.
- A "commit ticker" under the frame shows real commit messages for that period, scrolling past
  like a departures board as you scrub.
- **Readout:** `COMMIT 214 / 380 · WEEK 6 · "refactor grid to subgrid"`
- An optional ▶ button auto-plays the whole history in ~8 seconds (disabled with reduced motion).
- Implementation: preload milestone images once the section is near the viewport; blend the two
  nearest frames by opacity. Commit data can be exported once with
  `git log --pretty=format:'%h|%ad|%s' --date=short` into a JSON file — no runtime GitHub calls.
- Keyboard: the playhead is a range input; Home/End jump to sketch/launch.
- Data: `{ milestones: [{ label, date, image }], commits: [{ hash, date, message }] }`.
- **Done when:** scrubbing is continuous (not jumpy), the commit ticker stays in sync with the
  playhead, and it works with drag, keys and the play button.

## Study 03 — "Resize me." (responsive proof)

**Truth it proves:** my layouts genuinely adapt; this is demonstrated live, not claimed.

- A live project is rendered inside a device-less frame (an `<iframe>` of the deployed project,
  or a local responsive demo component). The right edge of the frame has a vertical grab handle.
- Dragging the handle changes the frame width from 320 px to the available max (up to 1920 px,
  scaled to fit with `transform: scale()` so the true CSS width is preserved inside).
- Breakpoint markers sit above the frame (`MOBILE · TABLET · LAPTOP · DESKTOP`) and light up as you
  cross them. Snap gently (magnetic, ±8 px) to each breakpoint.
- **Readout:** `412 px · MOBILE · LAYOUT SHIFT 0.00` (if measuring real CLS is impractical, show
  the current breakpoint name and the number of columns instead — never fake a metric).
- Implementation: the iframe keeps its real width; the wrapper scales it to fit, so media
  queries fire correctly. Disable pointer events on the iframe while dragging so the handle
  does not lose the pointer. Check the target site allows framing (`X-Frame-Options`/CSP); if not,
  use a local demo build.
- Keyboard: the handle is a focusable slider; arrows ±16 px, Shift+arrows ±80 px, keys M/T/L/D
  jump to breakpoints.
- **Done when:** the embedded layout reflows live at every width, the readout is accurate, and
  the page itself never scrolls horizontally.

## Study 04 — "The seismograph." (consistency study)

**Truth it proves:** I ship steadily, over years, not in one burst.

- A strip of paper scrolls under a needle, drawing a seismograph line: the amplitude for each
  week is my real contribution count. Big events (launches, releases, talks) appear as annotated
  spikes with a small flag and label.
- Dragging the paper left/right (or scrolling horizontally) moves through time; the needle
  redraws as the paper passes. The paper has a faint grid and year markers.
- **Readout:** `WEEK 32 · 2025 · 41 CONTRIBUTIONS · LONGEST STREAK 96 DAYS`
- Implementation: draw on `<canvas>` with device-pixel-ratio scaling; smooth the line with a
  Catmull-Rom spline; add slight needle jitter for character (none with reduced motion). Fetch
  contribution data at **build time** (GitHub GraphQL `contributionsCollection`, with a token
  stored in an environment variable, never shipped to the client) and save it as static JSON.
  Annotated events come from a small hand-written data file.
- Keyboard: arrows move one week, PageUp/PageDown move one year; focusing an event flag reads its
  label.
- **Done when:** the line reflects real data, events line up with their dates, and dragging feels
  physical (light inertia on release, none with reduced motion).

## Study 05 — "Bring me a problem." (constraint machine)

**Truth it proves:** I have solved the exact problem the visitor has.

- A row of constraint "chips": *Tight deadline*, *Legacy codebase*, *Small budget*, *Needs SEO*,
  *Accessibility*, *Performance*, *Design system*, *Real-time data* (adapt to my actual work).
- Selecting one or more chips physically rearranges the project cards below (FLIP animation:
  measure positions, reorder, animate from the old position to the new one). Matching projects
  rise to the top and expand to show a one-line story for that constraint
  ("Shipped in 9 days — scoped to 3 core flows and cut the rest"). Non-matches dim and shrink.
- **Readout:** `2 CONSTRAINTS · 4 MATCHING PROJECTS · BEST FIT: <project name>`
- A final card always says "Not listed? Tell me your constraint →" and links to contact with the
  selected constraints prefilled in the message (via a query parameter).
- Implementation: each project gets `constraints: { [key]: "one-line story" }` in its data. Rank
  by number of matches, then by recency. Use the Web Animations API or the existing animation
  library for FLIP; no layout-library dependency needed.
- Keyboard: chips are toggle buttons (`aria-pressed`); the result count is announced politely.
- **Done when:** toggling chips reorders cards smoothly without layout jumps, the stories shown
  match the selected constraints, and the contact link carries the selection.

---

## Build order and delivery

1. Shared `StudyFrame` + tokens → Study 03 (Resize me, quickest to prove the framing) → 05 → 02 →
   01 → 04 (needs the build-time data step).
2. After each study: run the type checker/linter and tests, check it in a browser at 375 px and
   1440 px, with keyboard only, and with reduced motion on. Show me a screenshot before moving on.
3. Do not commit or deploy without asking me.
4. At the end, give me a short list of every placeholder that still needs my real data.
