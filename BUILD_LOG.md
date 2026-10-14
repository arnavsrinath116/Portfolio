# Build Log

A running record of what has been built, what changed, and what's next.
Newest entries at the top. Add an entry whenever a meaningful chunk of work lands.

## Totals so far

| | |
|---|---|
| **Time spent** | ~6 h 10 min of build time (one Claude Code session, 2026-10-12 13:00 → 19:11 UTC) |
| **Usage** | Claude Pro plan, no extra paid usage. About **49% of one 5-hour limit** and **17% of the weekly limit** used as of 2026-10-12 19:11 UTC |
| **Context** | ~900k tokens of conversation in the session |
| **Commits** | 3 (`ad09e6f`, `0405d8d`, `cc7234b`) plus this update |

*Pro plans don't bill per request, so there's no dollar "credits" figure; the plan-limit percentages are the closest measure. Update these numbers at the end of each session.*

---

## 2026-10-14 · Cooked: UI kit distilled

The first version was too much, and its spec-sheet look (mono, uppercase tables) didn't match the case study. It is now about one screen on desktop:

- **Removed:** the colour token table (the palette swatches just above already cover it), the 10-row type table, the 3-size button grid, the pressable buttons and step dots, and the chef nav.
- **What remains:**
  - **Type:** five real Cooked lines (Display "Book a chef" → Caption), each labelled with size, line height and weight.
  - **Buttons:** one row of five (primary, CTA, outline, tint, disabled).
  - **Components:** live choice cards → Continue → the diner nav.
  - **Contrast:** one row of four calculated checks (Text 17.4 AAA, Body 8.9 AAA, Buttons 5.9 AA, Hints 3.5 large text only).
- **Style:** the case study's own language: white cards with soft rules, green kickers, Satoshi headings and pill buttons. The "UI kit" header uses the shared kicker and heading styles.
- **Motion:** cards rise, buttons and checks stagger, and a short demo plays once (a choice is picked, Continue turns on, the nav pill visits each tab).

---

## 2026-10-14 · Cooked: UI kit in "Plating up"

- **Placement:** a new block right after the moodboard, `CookedKit.astro`, rebuilt as live HTML from the Figma UI kit screenshots, not images:
  1. **Colour tokens:** three columns (light surfaces, green for interaction only, amber & text), 18 tokens with hex and role; ★ marks the key tokens.
  2. **Contrast:** 8 pairs.
  3. **Type scale:** 10 Satoshi steps, with token, size/line, weight, usage and a live sample.
  4. **Buttons:** 5 variants at 3 sizes, plus disabled.
  5. **Components:**
     - pressable 3D buttons (the face sinks on press);
     - step dots;
     - the Continue buttons (disabled → enabled, and green with mail/phone icons);
     - Vegetarian / Non-vegetarian choice cards;
     - diner and chef bottom navs with a sliding pill.
- **Contrast is calculated with the WCAG 2.1 formula, not copied from the kit.** The kit's numbers were off:

  | Pair | Kit said | Actual |
  |---|---|---|
  | tx-primary on white | 19.1 | 17.4 |
  | tx-secondary on white | 9.7 | 8.9 |
  | green-500 on white | 7.2 | 5.9 (AA, not AAA) |
  | green-700 on green-50 | 9.3 | 8.5 |
  | tx-muted on white | 4.6 AA | 3.5, AA large only (noted under the cards) |

  amber-900/700 aren't among the kit's swatches; the browns used are #5C3B00 and #8A5A00.
- **Motion:**
  - colour columns rise with their chips popping in;
  - ratio numbers count up and the grade badges pop;
  - type samples slide in;
  - button rows pop in sequence;
  - a one-time demo when the components arrive: the step dots advance, Continue turns on, and the nav pill visits each tab.
- **Interaction:** the components work: choice cards select and enable Continue, nav tabs move the pill, and pressables press. This works with reduced motion too.
- **Phones:** one-column tokens, 2×2 contrast cards, a stacked type scale with samples scaled down (and wrapping), and wrapped button rows.

---

## 2026-10-14 · Cooked: layout grids on the wireframes

- **Read from the UI kit:** the wireframes use one layout grid throughout: 4 columns, 24 px margins, 20 px gutters, plus a row band inset 48 px top and bottom. The same 4/24/20 column grid sits on the Home wireframe's frame and the final screens.
- **Overlay:** Figma's screenshot export never renders layout grids, so `Phone.astro` takes a `grid` prop and draws the grid over the screen in CSS:
  - in Figma's grid red, softened to 7.5% so the screens stay readable;
  - sized as fractions of the 390×844 screen, so it lines up at any phone size.
- **Caption** under the wireframes states the grid's specs.
- **Follow-up:** the grid is now shown on the Home wireframe only (the one with the grid applied in Figma); the other three are back to plain screens.

---

## 2026-10-14 · Cooked: the full user flow from FigJam

- **Replaced** the simplified two-lane flow with the full "Final user flow" from the FigJam board:
  - 95 shapes, 106 connectors (with their yes / no / "if new" labels), 6 grouped regions, 8 marker triangles and the board's notes;
  - read through the Figma plugin API into `src/data/cookedFlow.json`, keeping the board's own positions.
- **`CookedFlow.astro`** draws it at build time as one SVG with right-angle connectors and arrowheads, in the Cooked palette:

  | Element | Style |
  |---|---|
  | Start | green circle |
  | Steps | white boxes with a black outline |
  | Decisions | turmeric-tint diamonds |
  | Inputs / outputs | green-tint parallelograms |
  | Control points | green triangles |
  | Set up + verify points | turmeric triangles |
  | Sign up & verification region | grey dashed area |
  | Role & personalisation region | turmeric dashed area |
  | Dashboard regions | green dashed area |

- **The key** sits under the map, using the same symbols.
- **Reading it:** the map fits the card by default. Click the map, or "Zoom in", to view it at 3000 px wide (2200 on phones), landing where you clicked; drag to move around; "Fit to card" returns.
- **Fit fixes:** labels shrink to fit their box when they wrap, boxes the board had stacked flush are nudged apart, and arrowheads are smaller.
- **Removed:** the old flow markup, CSS and its scroll animation.
- **Note:** the dev server needed `astro dev --force` after the base-path change ("Outdated Optimize Dep").

---

## 2026-10-14 · Publishing: GitHub Pages at /Portfolio/

- **Address:** the repo keeps its name, so the site is served from a sub-folder: **https://arnavsrinath116.github.io/Portfolio/**.
- **`astro.config.mjs`:** `site: 'https://arnavsrinath116.github.io'` and `base: '/Portfolio'`.
- **`src/lib/url.ts` → `withBase()`** prefixes every root-relative link with the base path:
  - Cooked images and the Phone frames;
  - the work-tile cover;
  - the 3D model URLs (`ModelViewer`);
  - the favicon;
  - the logo's home link;
  - the menu's Work/Skills links;
  - the Draco decoder path (`modelViewer.ts`, via `import.meta.env.BASE_URL`).
  - CSS `url()`s (the grain texture, Satoshi `@font-face`) are rewritten by Vite at build time.
- **`.github/workflows/deploy.yml`:** builds with `withastro/action@v3` (Node 24) and deploys with `actions/deploy-pages@v4` on every push to `main`. It can also be run by hand.
- **Checked** on the production build served under `/Portfolio/`:
  - zero failed requests and no script errors;
  - all three Fusion models load (Draco decoder found);
  - Satoshi loads;
  - the logo and menu links resolve inside `/Portfolio/`.
- **Local dev now runs at `http://localhost:4321/Portfolio/`**, because the base applies to dev too.
- **One-time on GitHub:** Settings → Pages → Source: "GitHub Actions".

---

## 2026-10-14 · Fix: stray dots before the arrow draws (Cooked)

- **Cause:** strokes "drawn" by a dash offset still paint their round line caps at zero length. So the turmeric arrow (curve and head) showed as two dots before its draw began, and the market curve showed one.
- **Fix:** each drawn stroke stays at opacity 0 until its draw starts, then is set visible in the same timeline.
- **Checked:** the arrow's opacity is 0 while the line is struck out, and 1 once it draws; no dots appear in the frames.

---

## 2026-10-14 · Hero card stack removed

- **Removed** the three fanned slate cards (Product / UX / HMI) from the hero: the markup and data in `Hero.astro`, their desktop and mobile styles, and `scripts/slabs.ts` with its `initSlabs()` call (pointer tilt and scroll fan).
- **The hero is now** the name, the intro line, the drafted dimensions (W, CAP, OFFSET) and the scroll cue. On phones the heading still sits centred in normal flow.
- **Checked** at desktop and 390 wide: no script errors, the dimensions still draw, and no sideways overflow.

---

## 2026-10-14 · Cooked: course menu moved to a side rail

- **Problem:** the course menu, a pill bar floating at the bottom of the card, sat over the booking journey's captions and read as clutter.
- **Fix:** it is now a slim vertical rail on the card's right edge, at mid-height, sticky within the card's scroll:
  - six small dots on a faint white capsule (so they read over photos and screens);
  - the current course stretches into a green bar;
  - names (course + Double Diamond stage) appear only on hover or keyboard focus, so nothing labels over the content;
  - on phones it is dots only.
- **Unchanged:** the links still jump to each course, and phase tracking still marks the current one (`is-active`, `aria-current`). It still appears once the hero has scrolled away.

---

## 2026-10-14 · Cooked: clean wireframes

- **Problem:** the "Wireframes, round one" images were exports of the outer Figma frames, which carry a grainy, dithered device border, so they read as screenshots.
- **Re-exported** only the inner 390×844 screens from the UI kit (`DietaryPreference`, `Dashboard`, `AvoidanceList`, `CuisineList`) as `ui-wf2-*.webp`, and deleted the old `ui-wf-*` files.
- **Shown in the same CSS phone frame as the final screens**, with a caption under each (Diet / Home / What to avoid / Cuisine), like the booking journey.
- **The dropped page** ("What to avoid") is dimmed and greyed with a small "Cut in testing" tag, in place of a big stamp covering the screen.
- **Phones:** the wireframes sit two by two at a readable size, where before they were three tiny screens.
- `Phone.astro` now takes an optional `w`/`h` for screens of other sizes.

---

## 2026-10-14 · Cooked: three story beats slowed back down

The owner wanted the narrative moments to breathe while the rest stays fast.

| Scene | Scroll length (screens) | Other changes |
|---|---|---|
| Imagine → tired → no CONTROL → seesaw | 2 → 3.2 | each beat holds ~0.7–0.8 before the next; end hold 0.8 |
| Control dial | 1.25 → 2 | slower swing (1.6 / 1.4 / 1.1); the verdict holds 1.0 |
| Delivered → made for me | 1.15 → 1.9 | slower strike, arrow and arrival; hold 0.9 |

- All three scenes use scrub 0.8 for a softer follow. Every other scene and reveal keeps the faster settings.
- The case study is now 27,400 px long (was 24,900). No errors.

---

## 2026-10-14 · Cooked: text spacing restored

- **Cause:** the case study's reset `.ck :is(h2, h3, p, ul, ol, …) { margin: 0 }` out-ranked every component rule once Astro's scoping attribute was added. Every `margin-top`/`margin-bottom` on headings, quotes, chip rows, lists and captions was silently zeroed, so text sat tight against the line above throughout.
- **Fix:** the resets use `:where(.ck) :where(…)` (no class weight), so component spacing applies as designed.
- **Persona card:** more space between the name, quote, chips and archetype line; the archetype line sits under a hairline.
- **Recipe card:** the ruled-paper background that ran through the text is replaced by one hairline between each step (18px above and below), with more space under the title.
- **Checked:** a full desktop pass with nothing too loose; close-ups of both cards.

---

## 2026-10-14 · Cooked: faster, leaner motion for a 20-second review

- **"What we heard"** is no longer a pinned scene. The quotes are sticky notes (turmeric, white and green tints, slight tilts, a tape strip), and the heading, figure and all six notes arrive together in one quick reveal. On phones the notes sit two to a row.
- **Pinned scenes** keep only what explains something, each with ~40–50% less scroll and shorter holds:

  | Scene | Scroll length (screens) |
  |---|---|
  | Imagine | 3.4 → 2 |
  | Assumptions | 2.4 → 1.4 |
  | Control dial | 1.9 → 1.25 |
  | HMW | 2.2 → 1.35 |
  | Shift | 1.8 → 1.15 |
  | Ideas | 2.6 → 1.5 |
  | Pivot | 2.4 → 1.4 |
  | Journey | 4.2 → 2.6 |

  Scene scrub is now 0.4 (was 0.7), and holds were cut from 0.6 to 0.25.
- **Reveals** finish within the first ~20% of the screen (`top 94%` → `top 74%`), with scrub 0.35. Note and idea staggers are roughly twice as fast.
- **Tighter rhythm:** block padding is `clamp(52px, 8vh, 100px)`, and chapter openers are ~62% of the card height.
- **Result:** the case study's scroll length went from 35,400 to 24,900 px, about 30% shorter, with all content kept. No errors, no overflow.

---

## 2026-10-14 · Smoother scroll lines

- **Stepping (introduced by the performance pass):** the new lookup table snapped to its nearest sample. On long stretches of a line the samples were about 35 px apart, so the line and pen tip moved in steps.
  - Samples are now spaced every ~6 px along the curve (adaptive per segment).
  - Positions blend between the two nearest samples (`pointAtLength()` in `guide.ts`), used by both the homepage guiding line and the Cooked line.
- **Cooked line followed raw wheel steps:** the card scrolls natively (Lenis is off inside it), and a mouse wheel moves in ~100 px steps. The drawn length and pen tip now ease toward the scroll position each frame (exponential smoothing, ~90 ms time constant).
- **Measured:** 18 wheel steps, tip position recorded every frame. The tip now moves on 155/157 frames on the homepage and 152/157 in Cooked, with a median of 7–10 px per frame, where before it sat still and jumped about 100 px once per wheel step.

---

## 2026-10-14 · Performance: opening lag removed, lighter first load

**Measured** on the production build with Chrome's CPU profiler and performance metrics:

| | Before | After |
|---|---|---|
| Script time while the Cooked card opens | 3,515 ms | ~45 ms |
| Script time scrolling the card for 3 s | 7,711 ms | ~60 ms |
| Layout while the card opens | 107 ms | ~52 ms |
| Homepage first load | 642 KB | 345 KB |

**Cause:** 15.5 s of the profile was SVG `getPointAtLength()`. Cooked's green line called it about 12,000 times to map its 73,000 px path on open, and again on every scroll frame for the pen tip. Each call re-walks the whole path.

**Fixes**
- **Line geometry:** `sampleSpline()` in `guide.ts` evaluates the same Catmull-Rom/Bézier curve in JS once, producing points and running length. The Cooked line and the homepage guiding line both read positions from this table now. `pathLength` is set so the dash length matches the table exactly.
- **Card morph:** the card's content is held at its final size while the card grows or shrinks, and only clipped. Before, the 35,000 px case study re-laid out at every in-between size.
- **Dust:** the background dust stops drawing while a case-study card covers the page.
- **Course menu:** dropped its `backdrop-filter`, which re-blurred the scrolling card every frame; the background is now near-solid.
- **Cooked hero images** (doodle frame and wordmark, 257 KB) no longer load with the homepage. They load lazily, and are fetched as soon as the Cooked tile is hovered, focused or touched.
- **Grain texture:** PNG (74 KB) → lossless WebP (33 KB).

**Checked:**
- The modal flow passes: open, phase tracking, switching, ×, Esc, deep link.
- A Cooked visual pass matches the earlier frames.
- No console errors.

**Note:** the dev server (`astro dev`) serves about 1.9 MB of unbundled modules, so it is always heavier than the real site.

---

## 2026-10-14 · Cooked cover on the work tile

- **Cover:** `public/projects/cooked/cover.webp` (2000×1160, 125 KB), composed from the project's own assets:
  - the deck's doodle frame on slate white;
  - the COOKED! wordmark with "Your food, your way" in green Satoshi;
  - three final screens (chef profile, home, customise dish) fanned in phone frames.
- **Data:** projects take an optional `cover: { src, alt }` (`projects.ts`). The tile shows it in place of the dashed placeholder, with a slight zoom on hover.
- **Checked:** at 1440 and 390 wide; the height dimension still spans the tile.

---

## 2026-10-14 · Fix: homepage dimensions and guiding line broken by the Cooked card

- **Symptom:** the height dimensions beside the first work tile and the contact slab were missing, and the guiding line's layer was mis-sized.
- **Cause:** the Cooked user-flow diagram used `data-flow`, the same attribute the homepage uses for its dimensions and guiding-line section.
  - The project card sits earlier in the page, so `dims.ts` and `guide.ts` found the hidden diagram first and measured it as 0px wide.
  - At a width of 0, the dimension code treated the page as a phone and skipped the height dimensions.
- **Fix:** renamed the Cooked hook to `data-ck-flow`.
- **Checked:** the dimension layer is full size again with all three dimensions, the guiding line is drawn, and the Cooked flow still animates.

---

## 2026-10-14 · Cooked: a bespoke, light, scroll-animated case study

**Why:** the dean's note that every portfolio uses the same Discover/Define labels, so each project should carry its own flavour. Cooked's deck is light and illustrated, so its card should be too.

**Sources** (read only, nothing changed in them):
- the final deck PDF: 27 slides, with 45 embedded illustrations extracted at full quality;
- the FigJam board: brief, interviews, assumptions, AEIOU, behaviour patterns, persona, ideation, flows, feedback;
- the Figma UI kit: 25 final screens exported, plus mid-fi wireframes and paper sketches.
- Images are WebP in `public/projects/cooked/`, about 2.7 MB in total, loaded lazily.
- The interview call screenshot was left out (interviewees' faces), and quotes are attributed by initial only.

**Built**
- `components/project/cooked/CookedCase.astro` (+ `Phone.astro`), with motion in `scripts/cookedCase.ts`.
- **The modal** now supports per-project themes (`data-theme`, `data-card-bg`): the dark slab blooms into a light card. It also announces `pm:shown` / `pm:hidden` so scroll-driven case studies can measure themselves.
- **Light world:**
  - slate-white `#F4F5F2` background with slate-black text, and no orange;
  - the deck's palette: green `#337140` and turmeric `#F4B63F`;
  - the deck's type, Satoshi, self-hosted from Fontshare under the ITF Free Font License, with the licence in `public/fonts/satoshi/`.
- **Menu courses in place of the Double Diamond labels**, each with the stage named small beneath it:
  - Starter: the problem
  - 01 Gathering the ingredients (Discover)
  - 02 Writing the recipe (Define)
  - 03 Testing in the kitchen (Develop)
  - 04 Plating up (Deliver)
  - Dessert: the outcome
  - A floating course menu at the foot of the card tracks the current course and jumps to any of them.
- **The green line** draws down the margins as you scroll, swooping across between blocks, with a pen tip held at the reading point.
- **Scenes:** sticky, scrubbed scroll timelines for each set piece:
  - "Imagine this" and a seesaw tipping towards convenience;
  - interview quotes popping as thought clouds;
  - an assumption board where 20 notes drop in and 5 are ticked;
  - a control dial;
  - the HMW lighting up word by word;
  - "delivered to me" struck out and becoming "made for me";
  - an ideation wall where ideas are crossed out and 3 tagged as making it to the plate;
  - the user flow drawing down two lanes;
  - the chef-first → food-first toggle;
  - a 10-screen booking journey scrolling sideways;
  - a turmeric finale that opens out.
- **Blocks:** stats count up and bars fill.
- **Reduced motion:** everything shown as finished.

**Tested** (real-time headless Chrome, 1440×900 and 390×844):
- desktop 89 frames and phone 72 frames, end to end;
- no console errors and no sideways overflow;
- the line is drawn to the end.

**Needs from the owner:** role and team (hidden until known), the "future" direction, and a check of which ideas truly fed the final features.

---

## 2026-10-14 · First real project: Cooked (UI/UX)

- **Cooked** replaces the first placeholder: discipline UI/UX, duration 4 months, link `#project-cooked`.
- **Tools:** set to Figma for now, so it no longer shows under Fusion 360 in the Skills card. This needs confirming.
- **Work tiles** now show each project's name, with its discipline as a small orange label above it and a one-line `note` from `projects.ts`. Before, the tile showed only the discipline.
- **Tiles are laid out by position, not name:**
  - The first project is the large lead slab and carries the height dimension; the next two stack beside it.
  - The CSS classes are `panel-a`, `panel-b` and `panel-c`.
  - The guiding line follows `data-slot`.
  - So real projects can take any slot.
- **Checked:** the dimension spans the tile exactly, and `#project-cooked` opens the card with title Cooked, UI/UX and 4 months.

---

## 2026-10-13 · Fix: Product height dimension out of line with its box

- **Symptom:** the H dimension beside the Product card sat about 18px lower than the card.
- **Cause:** the cards move by `translateY(var(--rise) + var(--lift))`, and that move has a CSS transition. The dimensions and the guiding line subtracted the `--rise` value when measuring. But if they measured while the card was still sliding in (a re-layout during the entrance does this), the value and the drawn position disagreed.
- **Fix:** both now subtract the element's live translate, read from its computed transform matrix, so the entrance, the hover lift and any transition in progress are all accounted for.
- **Tested:** the dimension spans the card's top to bottom exactly (299–867px), both settled and after a resize mid-entrance.

---

## 2026-10-13 · BlackBox: Opacity in place of Section

- The BlackBox viewer no longer has a section cut.
- Its **Opacity** button fades only the **Shell** and **Lid** to about 18% over roughly 0.3s, so the dock, holder and mounts inside show through. Clicking it again brings them back.
- Which parts fade is set per model by part name (`fade` in `skills.ts`).
- See-through parts stop hiding what's behind them while faded.

---

## 2026-10-13 · BlackBox model updated from Fusion

- **Re-exported BlackBox** from the live Fusion session, including edits not yet saved in Fusion (the Fusion file itself was not saved or changed).
- **New parts:** it now has 6 visible parts. The new ones are the **Lid** and the **dot-matrix holder**.
- **Size:** the model is now 64 × 64 × 72 mm, and its GLB is 116 KB.
- **Card text:** the size, part count and caption are updated.
- **Fixed `tools/fusion/fexec.mjs`:** it broke on the space in the project folder's path (`%20` in the URL path), so it now uses `fileURLToPath`.

---

## 2026-10-13 · Fusion models: turn left/right only, zoom on a held key

**Changed** (after feedback: free orbit flipped the models, and scrolling kept zooming them)
- **Turning:** models now turn left and right only. The up/down angle is locked to the starting view, so a model can't tip over or flip. The controls are back on orbit with the polar angle fixed; the left/right arrow keys still turn a focused model.
- **Zoom only while ⌘ (Ctrl on Windows) is held, or with a trackpad pinch.** A plain scroll over a model always scrolls the card. The hint shows the right key for the keyboard as a keycap.
- **Touch:** a vertical swipe over a model scrolls the card; a sideways swipe turns it.
- **Dev setup:** the three.js modules are now pre-bundled in `astro.config.mjs` (Vite `optimizeDeps`). This stops the dev server failing with "Outdated Optimize Dep" whenever the viewer's imports change.

**Tested** (real-time headless Chrome):
- A vertical drag leaves the model upright; a sideways drag turns it.
- ⌘-scroll zooms without moving the card.
- A plain scroll moves the card.
- No errors.

---

## 2026-10-13 · Fusion models: free orbit and zoom

**Fixed**
- **Drag and zoom never reached the models.** The faded "Loading model" label sat on top of the canvas and caught every drag and scroll, so the only motion visible was the automatic spin. It now ignores the pointer.

**Changed**
- **Free orbit:** the controls switched from orbit to trackball, so a model turns any way, over the top and underneath as well. It glides a little after you let go.
- **Zoom:**
  - A plain scroll or pinch over a model zooms it, from 0.6× to 1.45× of its framing, in gentle steps.
  - At either limit the scroll passes on and moves the card, so a model never traps the page.
  - For 0.4s after a zoom the card stays still, so trackpad momentum doesn't jolt it.
- **Lighting for every side:** a headlamp travels with the camera and the hemisphere's ground light is brighter, so the undersides read as clearly as the tops.
- **Reset view** also levels the camera, because the trackball can roll it.
- **Hint** now reads "Drag to orbit · scroll or pinch to zoom".

**Tested** (real-time headless Chrome):
- Dragging carries the camera right over the top of the piston.
- Four zoom-in scroll steps zoom without moving the card.
- Further scrolling past the zoom-out limit scrolls the card on.
- No errors.

---

## 2026-10-13 · Fusion models in the Fusion skill card

**Built**
- **Fusion connected:** turned on Fusion's built-in MCP server (Preferences › General › API › Fusion MCP Server, port 27182) and registered it in `.mcp.json`. Designs are read straight from the Fusion app.
- **Three designs** chosen by the owner, exported from Fusion with only their visible bodies:

  | Design | Fusion project | Parts | Size (mm) |
  |---|---|---|---|
  | Turbojet engine (*Jet*) | complex › TurboJet | 38 | 1330.8 × 667.9 × 667.7 |
  | Piston and connecting rod (*piston automated*) | Piston engine | 3 | 50 × 105 × 81.4 |
  | BlackBox casing (*BlackBox*) | My Work | 6 (was 4) | 64 × 64 × 72 (was 40 tall) |

- **Pipeline** (`tools/fusion/`, run with `export-model.sh <name> <file id>`):
  1. Fusion exports each visible body as STL, along with its place in the assembly. Fusion writes sub-component bodies in local coordinates, so without the transform the jet's core collapsed onto one point.
  2. Blender, running headless, places and cleans the parts, reduces each to a triangle budget with a minimum per part so big curved shells stay smooth, and smooths curves while keeping sharp CAD edges.
  3. It exports a Draco-compressed GLB. About 90 MB of STL became about 1.1 MB: jet 985 KB, piston 157 KB, BlackBox 12 KB.
- **Viewer** (`components/ModelViewer.astro`, `scripts/modelViewer.ts`), in the matte slate style the owner picked:
  - **Look:** slate solids with sand edge lines at creases only, and the real size shown in mono.
  - **Section:** the jet and BlackBox open with a section cut that sweeps through, with cut faces in orange like Fusion's section analysis. A Section button toggles it.
  - **Controls:** drag to turn; pinch or ⌘-scroll to zoom, while a plain scroll still scrolls the card; arrow keys turn a focused model; Reset view.
  - **Motion:** a slow turntable spin at rest that comes back after a pause. Reduced motion keeps it still.
  - **Framing:** each model is framed to its actual silhouette, filling about 84% of the stage.
  - **Loading:** three.js (about 170 KB gzipped) and each model load only when a viewer scrolls into view. Viewers render only while visible, and the main bundle grew about 6 KB.

**Tested** (real-time headless Chrome, desktop and 390px):
- All three load.
- The section shows the full engine core.
- Dragging rotates; a plain wheel over a model scrolls the card.
- No horizontal overflow and no console errors.

**Note:** installing three.js needed the dev server restarted (`astro dev stop`, then `astro dev --force`), because Vite had cached the old dependencies.

**Needs from the owner:** year and own wording for each caption (the current captions are drafts).

---

## 2026-10-13 · Skills: truer logos, steadier hover

**Changed**
- **Fusion logo:** redrawn as the current Autodesk Fusion product tile: a square face, the lighter folded strip on its left, and the bold "F" top-left. The 3D extrusion supplies the tile's darker side.
- **Blender logo:** now the official mark's outline (path data from Simple Icons, CC0), converted into the logo box: the eye, the ring with its three prongs, and the ring's opening.
- **Hover, fixed:** it felt wonky for three reasons.
  1. The whole tile lifted, so with the pointer near its bottom edge the hover switched on and off in a loop. Now the link stays still as the hit area and only the slab inside lifts (4px).
  2. The logo snapped from its idle sway to following the pointer. Now the two blend over about a third of a second, and the turn runs on a critically damped spring, so it starts and stops smoothly without overshooting.
  3. The turn range and perspective were too strong, so the extrusion warped at an angle. The range is now about 20° either way, with a longer camera.
- The hover uses a fast-start curve, so it responds immediately.
- The expanding card now morphs from the tile's slab.

**Tested** (real-time headless Chrome):
- The pointer resting 2px inside a tile's bottom edge stays hovered (16 of 16 samples).
- The logos render.
- Opening, switching and closing the card all still work, with no script errors.

---

## 2026-10-13 · Skills section with wireframe logos

**Built**
- **Skills section** (`components/Skills.astro`) under Selected Work: four slate tiles for Fusion 360, Illustrator, Figma and Blender, four across on desktop and two on phones.
- **Wireframe logos** (`components/WireLogo.astro` + `scripts/wire.ts`): each logo is a line-art outline (`src/data/skills.ts`) that the script extrudes into a 3D CAD-style wireframe.
  - It draws the front edge, a faint back edge, and connecting edges at every corner and along the curves.
  - The logos sway slowly like a turntable, turn to face the pointer over their tile, and turn orange on hover.
  - Without JavaScript they show as flat outlines; with reduced motion they stay still.
- **Skill cards:** clicking a tile opens the same expanding card as the case studies (`components/project/SkillContent.astro`), with the same ×, Esc, scroll and switching. Each card has:
  - a large turning logo;
  - the case studies that used the tool. These are found automatically from each project's `tools` list, and open the case study in the same card;
  - a grid of works made with the tool;
  - links to the other three tools.
  - Links: `#skill-<slug>`.
- **Guiding line** now runs through the skills section on its way to the contact slab.
- **Menu:** added a Skills link.
- **Entrances:** each grid (work, skills) fades and rises in on its own when it comes into view.

**Tested** (real-time headless Chrome, 1440×900 and 390×844):
- The logos render and turn, and hover works.
- Opening a card, jumping from it to a case study, and closing all work.
- No horizontal overflow and no script errors.

**Needs from the owner:** for each tool, how long it has been used and the real works (title, type, year, one-line caption, image).

---

## 2026-10-13 · Project case studies as expanding cards (Double Diamond)

**Built**
- **Data:** `src/data/projects.ts` holds the 3 projects (Product, UX, HMI). Each has a title, summary, role/team/duration/tools, four Double Diamond phases (intent, body, number of media slots), an outcome and learnings. All content is a **placeholder** until the owner sends the projects.
- **Project card** (`components/project/ProjectModal.astro`, `ProjectContent.astro`, `scripts/projectModal.ts`). A project never becomes a full webpage; it stays a card floating over the page.
  - **Opening:** the clicked slab itself grows into the card. Position, size, corner radius and colour all morph together (0.8s, expo in-out). The page dims behind it, and the case study starts rising in as the card settles.
  - **Inside:** the card has its own scroll, while the page behind stays put.
  - **The × button** is pinned top-right and always visible. Esc and clicking outside also close the card.
  - **Closing:** the card shrinks back into the slab it came from.
  - **Other case studies** at the bottom of each card swap the project inside the same card.
  - **Links:** the address carries `#project-<slug>`, so a card can be linked to directly. It also opens when the hash changes on an already-loaded page.
- **Accessibility:** focus moves into the card and is trapped there while it is open, then returns to the slab on close. Reduced motion skips the morph.
- **Double Diamond navigator** (`components/project/DiamondNav.astro`): a line-art double diamond pinned in the card.
  - The half for the phase you're reading fills orange, and earlier halves stay faintly filled.
  - The matching link is marked (`aria-current`).
  - On phones it becomes a slim pinned bar next to the ×. Its tabs scroll, keep the active one centred, and fade at the edge.
- **Cursor:** the liquid ring now follows an element's own corners (round around the round ×). It lets go when the card closes.
- **Work cards** open the project card ("Open case study") and lift on hover. The scroll-rise and the hover lift combine through CSS variables (`--rise`, `--lift`).
- **Faster card entrance:** the three work cards used to rise one by one, each tied to its own scroll position, so the small ones trailed behind. Now all three rise together in one timed move as the grid comes into view: a 0.7s fade on an even curve so it reads, and a 90px rise that eases out in 0.85s, 70ms apart.
- **Replaced** the earlier `/work/<slug>/` pages and their View Transition, after feedback that the card should stay a card.

**Tested** (real-time headless Chrome, 1440×900 and 390×844):
- Open, phase tracking, scroll lock, switching projects, ×, Esc (including mid-animation) and deep links all work.
- The × is visible and clickable at every scroll position.
- No horizontal overflow on phones.

**Needs from the owner:** for each project, the title, one-line summary, role, team, duration and tools; text for each of the four phases; images, sketches and CAD renders; and the outcome and learnings.

---

## 2026-10-13 · Header bar removed

- The owner felt the solid header bar was a heavy block of colour that took away from the page.
- `Header.astro` now has no background and no bottom line. Only the isometric AS logo and the MENU button float over the page.
- The bar itself ignores clicks (`pointer-events: none`) so you can interact with whatever is behind it; the logo and menu remain clickable.
- Still hides on scroll down and returns on scroll up; on the mercury menu the logo and CLOSE stay in ink.
- Tested: menu opens and closes, 61 fps.

---

## 2026-10-13 · Ambient dust particles (whole page)

**Why:** the hero felt empty. The owner wanted a subtle particle system that moves with the mouse, "flowing dust/sand" style. Their screen recording couldn't be opened (macOS had already deleted the temp file), so this was built from their description.

**Built** (`src/scripts/dust.ts`, fixed canvas behind every section):
- About 300 sand-coloured specks at 1440×900 (scales with screen area, capped at 520), each with its own depth, size and brightness.
- At rest they drift on a slow, curling flow field, like dust in a still room, with a faint shimmer.
- **Cursor = a hand through the air:** nearby specks are carried along its direction of travel, curl round it in a soft vortex, are eased out of its core, and catch a bit more light. Then they settle back into the drift.
- Scrolling adds a little depth parallax.
- Reduced motion shows a still field. Touch devices get the drift only. It pauses when the tab is hidden, and time steps are clamped (≥ 0, ≤ 50 ms).

**Tested** in real-time headless Chrome: 61 fps with the dust and the mercury cursor running together.

---

## 2026-10-13 · Dimension animations across the page (tried, then removed)

- Built a page-wide `data-dim` system that measured the work heading, panels, contact slab and footer name on scroll.
- **Owner reviewed it and asked to remove them all**, so the system (`dims.ts`, the overlay SVG and the `data-dim` tags) was deleted.
- **Kept:** the hero heading's three dimensions (W, CAP, OFFSET), now drawn through the shared helper `src/scripts/dimension.ts`.
- Verified in real-time headless Chrome: 0 dimensions below the hero, 3 in the hero.
- **Then re-added in exactly three places at the owner's request** (`src/scripts/dims.ts` restored, `data-dim` tags):
  - width above "Selected work" (`data-dim="w-top" data-dim-text`)
  - height left of the Product panel (`h-left`)
  - height right of the contact slab (`h-right`)
  - Tested: 3 on desktop; 1 on phone (heights are skipped where margins are too narrow).

---

## 2026-10-12 · Fix: page stuck on a blank screen (cursor freeze)

**Symptom:** in a real browser the page stayed blank with the plotter stuck at `X 0000.0` and the tab loading forever.

**Cause:** the cursor's physics loop sub-steps each frame (`while (n--)`). A frame's timestamp can be slightly *earlier* than the moment the loop was woken, giving a negative elapsed time and a negative step count, so the loop never ended and froze the page before the intro ran. Headless tests use simulated time, which hid it.

**Fixed** (`src/scripts/ferrofluid.ts`): elapsed time is clamped to ≥ 0 and the loop is bounded (1–64 steps). The dev server was restarted with a fresh dependency cache.

**Cursor polish found by the new test:**
- Magnetic "spikes" (which rendered as cracks) are replaced by a smooth bulge toward the nearby button.
- The wrap ring is now an even liquid line, with no beaded chain look.
- The drop's stretch is capped at 30px, so pulling away from a button makes a short teardrop, not a rod.
- The click ripple is a soft low-order wobble instead of a faceted star.

**Also fixed:** "In progress" tags in the menu read "Inprogress" (inherited tight tracking); on phones the fanned slabs slid off-screen (the fan now scales with screen width).

**How it's tested now:** two CDP scripts drive real headless Chrome in real time (not the throttled preview pane):
- Desktop 800×500 cursor test: rest, flick, settle, magnet, wrap, pull-away, click, menu flood/open/close. Result: **61 fps**, menu opens and closes, 0 errors.
- Phone 390×844 touch test: hero, measured hero, work panels, footer, menu. Result: no horizontal overflow, cursor correctly off on touch, menu opens.

---

## 2026-10-12 · Round 2: less blueprint, slate surfaces, guiding line, one-blob cursor

**Why:** owner feedback on round 1: too literally a blueprint, wanted more slate surfaces, more scroll line animation, and a smoother cursor that is one blob instead of merging circles.

**Changed**
- **Less blueprint:** removed the drafting grid, the title blocks, the SHEET/REV labels, the scale bar and the "drawing index". Monospace is now only for real measurements (dimension lines, plotter readout, frame zone markers). Kept: sheet border, plotter-sweep intro, scroll-measured heading.
- **Slate surfaces:** new slate scale in `src/styles/tokens.css` (`--slate-2/3/4`, lit top edge, layered slab shadow, 14px radius).
  - Hero: a stack of three slate slabs (Product / UX / HMI) that tilts toward the cursor with raking light and fans out sideways on scroll (`src/scripts/slabs.ts`).
  - Work: `src/components/Work.astro` has three slate panels (large Product, plus UX and HMI), marked "Case study in progress", rising in with scroll.
  - Footer: contact now sits on a slate slab, with plain text links instead of mono.
- **Guiding line:** `src/scripts/guide.ts` draws one continuous line with scroll, from the work section to the contact slab. It weaves through the margins and passes *behind* the panels, with an orange pen tip.
- **Cursor rewrite** (`src/scripts/ferrofluid.ts`): a single teardrop distance field (round cone, head to lagging tail) driven by springs. It stretches with speed, snaps round at rest and has a jelly squash on sharp turns; a click sends a ripple. On hover the same body flows onto the element's edge and wraps it (Venom-style), then drains back into a drop. Physics are sub-stepped on real elapsed time, so motion stays correct on slow frames.
- Layout: below 900px wide the hero stacks in normal flow, so slabs never overlap the heading.
- Removed: `DrawingIndex.astro`, `RevMark.astro`, `ScaleBar.astro`, `scripts/grid.ts`.

**Verified:** production build passes; desktop 1440 hero/work/footer screenshots; 800×500 layout; the drop renders as one body at rest. Headless Chrome confirms all scripts run without errors.

**Not yet verified / open**
- The cursor **in motion** (stretch, jelly, wrap) still needs a real-browser check. The in-app browser pane throttled to ~2 fps during testing, so motion couldn't be judged there.
- `DESIGN.md` and `.impeccable/design.json` describe **round 1** and need regenerating for round 2.
- The impeccable finish review hasn't been re-run for round 2.

---

## 2026-10-12 · Round 1: first page (header, hero, footer, cursor)

**Built** (Astro 7 + GSAP/ScrollTrigger + Lenis + WebGL; self-hosted Archivo + Geist Mono):
- Dark "drawing set" world: slate `#14171A`, sand `#E6DCC8`, orange `#FF6B2C` (all contrast-checked).
- Plotter-sweep intro (once per session, skipped under reduced motion).
- Hero: "ARNAV SRINATH'S / PORTFOLIO", measured on scroll with live dimension lines in true millimetres.
- Header: isometric AS cube (3D CSS) and a [ MENU ] button with bracket hover; hides on scroll down.
- Mercury ferrofluid cursor (WebGL): magnetic spikes, envelop ring, click splash. Menu opens as a mercury flood from the click point (also on touch; flat silver fallback without WebGL).
- Footer: the outlined name drafts itself on scroll; contact links and local time.
- Accessibility: reduced-motion versions, keyboard menu (Esc, focus trap), themed focus/selection/scrollbar, cursor only on fine pointers.

**Process:** 20-question brief with the owner → `PRODUCT.md` + direction contract (`.impeccable/surfaces/`) → build → two inspection rounds → independent finish review (fix → fix → **ship**) → `DESIGN.md` written by the documenter.

---

## 2026-10-12 · Research and planning

- `PORTFOLIO_RESEARCH.md`: inspiration, resources, recruiter checklist, stack and hosting notes.
- `references/`: breakdowns plus screenshots of Midu (case studies), Igloo (3D/tech touches), Lusion (motion + easing tokens), Heron AI (colours/layout) and Sahor (structure/flow).
- `PLAN.md`: the full site plan (site map, CAD viewer pipeline, idea list, roadmap).
- Design skills installed: impeccable, emil-design-eng, animate, review-animations, find-animation-opportunities, animation-performance, prototype, apple-design.

---

## Next up
1. Owner to try the cursor by hand and say how it feels; tune spring stiffness, stretch and wrap speed from that.
2. Re-run the finish review and regenerate `DESIGN.md` for round 2.
3. Fill the placeholders in `src/data/site.ts`: email, LinkedIn, résumé, city.
4. Start the first case study (strongest project) and the Fusion 360 → GLB CAD pipeline (see `PLAN.md` §5).
