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
