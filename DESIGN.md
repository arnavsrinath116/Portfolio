---
name: Arnav Srinath Portfolio
description: Sheet A-000 of a drawing set drafted live; slate sheet, sand linework, orange measurements, one living drop of mercury.
colors:
  slate: "#14171a"
  sand: "#e6dcc8"
  sand-2: "#b8af9d"
  sand-3: "#928b7c"
  line: "#4a4740"
  orange: "#ff6b2c"
  mercury-ink: "#14171a"
  mercury-silver: "#c9ccd0"
typography:
  display:
    fontFamily: "'Archivo Variable', 'Archivo', sans-serif"
    fontSize: "clamp(2.6rem, 7.1vw, 6rem)"
    fontWeight: 640
    lineHeight: 0.92
    letterSpacing: "-0.025em"
    fontVariation: "'wdth' 125"
  headline:
    fontFamily: "'Archivo Variable', 'Archivo', sans-serif"
    fontSize: "clamp(2.25rem, 6.4vw, 5.5rem)"
    fontWeight: 640
    lineHeight: 1
    letterSpacing: "-0.025em"
    fontVariation: "'wdth' 125"
  title:
    fontFamily: "'Archivo Variable', 'Archivo', sans-serif"
    fontSize: "clamp(1.5rem, 2.6vw, 2.25rem)"
    fontWeight: 620
    lineHeight: 1
    letterSpacing: "-0.02em"
    fontVariation: "'wdth' 125"
  lead:
    fontFamily: "'Archivo Variable', 'Archivo', sans-serif"
    fontSize: "clamp(1.6rem, 3.1vw, 2.75rem)"
    fontWeight: 560
    lineHeight: 1.04
    letterSpacing: "-0.02em"
    fontVariation: "'wdth' 112"
  body:
    fontFamily: "'Archivo Variable', 'Archivo', sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  body-note:
    fontFamily: "'Archivo Variable', 'Archivo', sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "'Geist Mono Variable', 'Geist Mono', ui-monospace, monospace"
    fontSize: "0.6875rem"
    fontWeight: 400
    letterSpacing: "0.06em"
    fontFeature: "'tnum' 1"
  label-micro:
    fontFamily: "'Geist Mono Variable', 'Geist Mono', ui-monospace, monospace"
    fontSize: "9px"
    fontWeight: 400
    letterSpacing: "0.06em"
    fontFeature: "'tnum' 1"
  annotation:
    fontFamily: "'Geist Mono Variable', 'Geist Mono', ui-monospace, monospace"
    fontSize: "10px"
    fontWeight: 400
    letterSpacing: "0.06em"
    fontFeature: "'tnum' 1"
rounded:
  none: "0px"
spacing:
  frame: "clamp(10px, 1.2vw, 18px)"
  gutter: "clamp(20px, 4vw, 64px)"
  header-h: "76px"
  header-h-compact: "64px"
  grid-minor: "24px"
  grid-major: "120px"
  section-top: "clamp(96px, 16vh, 180px)"
  section-bottom: "clamp(72px, 12vh, 140px)"
  footer-top: "clamp(80px, 14vh, 150px)"
components:
  bracket-link:
    textColor: "{colors.sand}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "0.55em 0.9em"
  bracket-link-hover:
    textColor: "{colors.orange}"
  menu-button:
    textColor: "{colors.sand}"
    typography: "{typography.label}"
    padding: "0.55em 0.9em"
  menu-button-open:
    textColor: "{colors.mercury-ink}"
  discipline-tag:
    textColor: "{colors.sand-2}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "0.5em 0.85em"
  title-block:
    backgroundColor: "rgb(20 23 26 / 0.86)"
    textColor: "{colors.sand}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "7px 12px 8px"
  index-row:
    textColor: "{colors.sand}"
    typography: "{typography.label}"
    padding: "18px 12px"
  menu-link:
    textColor: "{colors.mercury-ink}"
    typography: "{typography.headline}"
    padding: "0.08em 0.22em"
  menu-link-hover:
    textColor: "{colors.slate}"
  menu-link-drafting:
    textColor: "{colors.mercury-ink}"
    typography: "{typography.headline}"
  footer-email:
    textColor: "{colors.sand}"
    typography: "{typography.lead}"
    padding: "0.55em 0.9em"
  skip-link:
    backgroundColor: "{colors.sand}"
    textColor: "{colors.slate}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "10px 14px"
---

# Design System: Arnav Srinath Portfolio

## Overview

**Creative North Star: "The Live Drawing Sheet"**

Every page is a sheet in a drawing set that is still being drafted. The sheet is slate, the linework and lettering are sand, and orange is the drafter's red pencil: it marks only what is measured, pointed at, or live right now. Scrolling does the drafting. It draws extension lines, counts dimensions up from zero, runs leaders out to notes and inks the name in the footer, so motion is the act of making the drawing and never ornament laid over it. The sheet keeps the conventions of a real one: a bordered frame with zone letters and numbers, registration crosses at the corners, a title block, a revision delta, a true-to-size scale bar, and dashed lines for anything not yet built.

Against that precise, flat, hairline world there is exactly one material with mass: a drop of liquid mercury that is the cursor. It trails, grows spikes toward anything clickable, crawls around a hovered control from the side you came in, splashes on click, and floods the whole screen to become the menu. Everything else stays paper-flat. Density is low: big expanded lettering, generous slate, and small mono data clustered at the edges where a drafter would put it. Headings are left-weighted and stepped rather than centred.

**Key Characteristics:**
- Slate ground, sand line and letter, orange reserved for measurement, leaders and live state.
- Line weight and line style carry meaning: hairline grid, 1px objects, dashed means not yet drawn.
- Two type voices only: Archivo at expanded width for lettering, Geist Mono uppercase for every measurement and piece of sheet data.
- Square everything: no radius anywhere in CSS.
- Mercury is the only depth, the only gradient, the only organic shape.
- Content-explaining motion is scrubbed by scroll; time-based motion is reserved for responses to input, the one-shot plotter intro, and the liquid itself.

## Colors

A near-monochrome drafting palette (cool slate, warm sand in three strengths, a warm-grey rule) with one saturated accent and one metallic material that appears only as liquid.

### Primary
- **Plotter Orange** (#ff6b2c): Dimension lines, ticks and values, leader lines and anchor dots, the active zone letter or number on the frame, the plotter carriage and its X readout, construction points on the footer wordmark, the top face of the logo cube, the status square in the drawing index, hover and focus colour of bracket links, the focus outline, and the text selection fill (with slate text). 6.33:1 on slate, so it is legal as small text. It never covers an area larger than a line, a tick or a 9px square.

### Neutral
- **Drafting Slate** (#14171a): The sheet. Page background, scrollbar track, the knock-out fill behind dimension labels, and the ink colour of text set on mercury (as `mercury-ink`). Also `theme-color`.
- **Sand Lettering** (#e6dcc8): Primary lettering and object linework: hero title, title-block values, index cells, the footer wordmark outline, body text. 13.22:1 on slate.
- **Sand Secondary** (#b8af9d): Supporting text one step down: discipline tags, the index note, status text. 8.27:1 on slate.
- **Sand Tertiary** (#928b7c): Sheet metadata and construction: header sheet line, zone characters, table headers, title-block field names, footer block, scroll cue text, extension lines, registration marks, rev delta outline, scale bar, tag brackets, the pending-title dash. 5.32:1 on slate, the floor for any text.
- **Rule Grey** (#4a4740): Structural 1px rules only: sheet border, header underline, title-block and index cell rules, footer rules, wordmark guide lines, scrollbar thumb. 1.94:1 on slate; it is never used for text.
- **Mercury Silver** (#c9ccd0): The flat stand-in for the mercury flood when WebGL is unavailable (or under reduced motion). Slate ink on it measures 11.16:1.

The live mercury is shaded in the shader, not from tokens: a pale sky (about #edeef0) over a slate-grey floor (about #94989d), clamped at 0.95 white, with small drops darkening to about #292b2e at the rim and catching a faint orange glint. Slate ink on the floor tone measures 6.2:1; orange on it measures 1.02:1.

### Named Rules
**The Red Pencil Rule.** Orange means "measured, pointed at, or live". It marks dimensions, leaders, the active zone, the plotter, focus and hover, and nothing decorative. If it is not a line, a tick, a dot, a small square or a state change, it is not orange.

**The No Orange On Mercury Rule.** Orange fails on liquid metal (1.02:1). On the flood, every text colour is full slate ink, hover stays ink and the brackets carry the state; hierarchy on mercury comes from weight and line style, never from fading or colour.

**The Contrast Floor Rule.** Sand Tertiary (5.32:1) is the faintest text on slate. Rule Grey is for lines only.

## Typography

**Display Font:** Archivo Variable (with Archivo, sans-serif), width axis loaded
**Label/Mono Font:** Geist Mono Variable (with Geist Mono, ui-monospace, monospace)

**Character:** Archivo pushed to an expanded width (set through `font-stretch`: 125% on desktop lettering, 112% for the footer voice, 108–112% where narrow screens need it) reads like stencilled drawing lettering: wide, flat-topped, engineered. Geist Mono, always uppercase with 0.06em tracking and tabular numerals, is the drafter's annotation hand for every number, code and field label.

### Hierarchy
- **Display** (640, clamp(2.6rem, 7.1vw, 6rem), 0.92, wdth 125, −0.025em, uppercase): The hero name, two stacked lines with line two indented 2.9em (1.1em on mobile, where it drops to clamp(2.2rem, 11.2vw, 3.4rem) at wdth 112). Balanced wrap.
- **Headline** (640, clamp(2.25rem, 6.4vw, 5.5rem), 1, wdth 125, uppercase): Menu sheet links on the mercury flood. Sheets still being drawn drop to weight 380 with a 1px dashed underline. Mobile: clamp(2rem, 10.6vw, 3rem) at wdth 108.
- **Title** (620, clamp(1.5rem, 2.6vw, 2.25rem), 1, wdth 125, −0.02em, uppercase): Section headings such as the drawing index.
- **Lead** (560, clamp(1.6rem, 3.1vw, 2.75rem), 1.04, wdth 112, −0.02em, sentence case, max 18ch): The footer's conversational line. The footer email uses the same voice at 520, clamp(1.125rem, 1.9vw, 1.625rem).
- **Body** (400, 1rem, 1.5): Running text. Notes run at 0.9375rem / 1.55, max 34ch, in Sand Secondary.
- **Label** (Geist Mono 400, 0.6875rem, 0.06em, uppercase, tabular): Sheet data, title-block values, header sheet line, footer block, clock label. Interactive mono (menu button, tags, footer links, index table) steps up to 0.75rem.
- **Label Micro** (Geist Mono, 9px): Frame zone characters, table column heads, title-block field names, wordmark guide labels. Field names and headers only, always in Sand Tertiary.
- **Annotation** (Geist Mono, 10px, 0.06em, tabular): Dimension values, leader notes and the plotter readout, drawn in SVG at true pixel size.

### Named Rules
**The Two Hands Rule.** Archivo letters names and statements; Geist Mono writes measurements, codes and sheet data. A number that measures something is always mono and tabular; a heading is never mono.

**The Measured Truth Rule.** Every dimension shown is measured from the rendered type at runtime (CSS px to mm at 96 dpi, 25.4/96) and counts up from 0.0 as it is drawn. Annotations never show invented values; the lettering note states the real spec (Archivo, wdth 125, wght 640, track −0.025em).

## Layout

The viewport is a drawing sheet. A fixed 1px border sits inset by `frame` (clamp(10px, 1.2vw, 18px)) on all sides; the frame margin itself holds zone markers, columns A–H across the top and rows 1–6 down the left, divided by Rule Grey ticks. The active column follows the pointer and the active row follows scroll progress, so the frame doubles as the progress indicator. Registration crosses (11px, 1px Sand Tertiary) sit on all four corners. Zones hide at 700px and below; the border and crosses stay.

Content sits inside `frame + gutter` (gutter clamp(20px, 4vw, 64px)). The fixed header (76px, 64px at ≤800px) spans the sheet width in a 1fr / auto / 1fr grid: logo left, sheet line centred, MENU right; the sheet line hides at ≤800px.

The hero is a 205vh scroll track (175vh at ≤700px) with a 100svh sticky stage, so the drawing completes while the type stays still. Behind it a live drafting grid is drawn on canvas, aligned to the frame origin: minor lines every 24px, major every 120px, registration crosses at major intersections. The title block sits bottom-right, the scroll cue bottom-left.

Sections below use asymmetric two-column grids: the drawing index runs 4fr / 7fr (single column at ≤860px; the discipline column drops at ≤520px); the footer runs 6fr / 3fr / 2fr (2 columns at ≤860px). The footer wordmark is fitted to the full sheet width at its natural spacing, and its viewBox is sized to cap height.

Breakpoints observed: 860px (grids collapse), 800px (header compacts), 700px (mobile type, zones off, hero track shortens, annotations simplify), 520px (index drops a column).

## Elevation & Depth

The sheet is flat. There are no box shadows anywhere in CSS. Depth is conveyed by the mercury alone: the WebGL field casts a soft contact shadow (offset 2px, 5px, up to 0.38 alpha) onto the sheet, and its surface is shaded as polished chrome reflecting a studio environment. A fixed film grain (256px tile, 4.5% opacity) sits over the slate and under the cursor to give the board tooth. The header and title block separate from content with a slate fill, not a shadow; the title block uses slate at 86% so the grid ghosts through.

### Named Rules
**The One Material Rule.** Mercury is the only thing on the sheet with depth, gradient, reflection or curvature. Everything drawn on the sheet stays flat line and flat letter.

## Shapes

Square and drawn. Every CSS corner is 0; there is no radius token above `none`. Recurring forms come from drafting conventions:

- **Brackets**: two 0.42em open square brackets in 1px currentColor framing a label (2px on the mercury flood). Static on tags, animated on links.
- **Architectural ticks**: 45° slashes (5px half-length, 1.25px) at dimension line ends, never arrowheads.
- **Crosses**: registration and construction marks, 1px hairline plus signs.
- **Revision delta**: a 1px Sand Tertiary triangle around the revision numeral, sized so the numeral reads as a number.
- **Graphic scale bar**: four alternating filled and open 2.5mm cells, true to size at 96 dpi.
- **Isometric cube**: the AS monogram is a true CSS 3D cube at isometric angles (rotateX −35.264°, rotateY −45°), 1px edges, orange top face.
- **Icons**: one drawn set on a 12px grid, 1.25 stroke, square caps (arrow up-right, arrow down, arrow up), inline SVG.

**The Line Weight Rule.** Weight and style are semantic. Hairline (canvas alpha 2.6% minor / 5.5% major) is the grid. 1px is every object, rule and outline. 1.25px is ticks and icons. 2px brackets exist only on mercury, where the medium is louder. Dashed (1px) means not yet built: pending titles, unfinished sheets, rows in drafting.

## Components

### Bracket Link (the button of this world)
Quiet mono text that is framed by a pair of drafting brackets on interaction.
- **Shape:** square (0px); padding 0.55em 0.9em; brackets are 0.42em wide, 1px currentColor.
- **Default:** Sand text, brackets invisible and parked 0.9em outside each side.
- **Hover (hover-capable devices only) / Focus-visible:** text turns Plotter Orange and both brackets slide in to frame the label (transform `dur-base` / `ease-out`, opacity `dur-fast`). Focus uses the brackets in place of the outline.
- **On mercury:** brackets thicken to 2px, text stays ink and darkens to slate on hover; never orange.
- Used for MENU, footer links, the footer email (which also carries a 1px Rule Grey underline that clears on hover), and menu contact links.

### Menu Button
A Bracket Link reading MENU with two 3px square dots; when open it reads CLOSE and the dots rotate 90° (`dur-slow`). `aria-expanded` and `aria-controls` are kept in sync.

### Discipline Tags
Static bracketed mono chips (PRODUCT · UX · HMI): Sand Secondary text, 1px Sand Tertiary brackets, padding 0.5em 0.85em. Not interactive.

### Title Block
A drafting title block in mono: 1px Rule Grey outer border and cell dividers, slate at 86% fill, a full-width Title row above Sheet / Drawn by / Date / Rev cells. Field names in Label Micro Sand Tertiary, values in Sand. The Rev cell carries the revision delta.

### Drawing Index
A real table: Rule Grey 1px header rule, 9px column heads, 18px row padding, and dashed Rule Grey row rules because every row is still in drafting. Pending titles are a dashed Sand Tertiary line with an accessible label; status is a 6px orange-outlined square plus "In drafting" in Sand Secondary.

### Navigation (Header + Menu)
- **Header:** fixed, slate fill, 1px Rule Grey bottom rule. Slides up out of view (0.6s `ease-out`) when reading down past 140px and returns on any upward scroll; it always returns when anything inside it receives focus. While the menu is open it turns transparent and its contents switch to mercury ink.
- **Logo cube:** hover or focus spins the cube a full turn (1.1s `ease-inout`).
- **Menu:** a modal dialog drawn on the mercury flood. Rows are sheet-code + link on a 14vw / 1fr grid, separated by slate rules at 22% alpha. Sheets that exist are Bracket Links; sheets still being drawn are not links, set at weight 380 with a dashed underline and an "In drafting" mono tag. On mobile the sheet code follows the link, never above it. Focus is trapped, Esc closes, focus returns to the button, and in-page links close the menu then scroll.

### Signature: Mercury Cursor and Flood
A full-screen WebGL signed-distance field, shaded as cool polished mercury.
- **Head:** a 10px drop on a spring (stiffness 640, damping 36) with a 9-drop trail smooth-unioned behind it.
- **Magnet:** within 130px of any `[data-magnet]` element, spikes grow out of the drop toward it.
- **Envelop:** hovering a magnet shrinks the head to 5.5px while a liquid ring crawls around the element from the side the pointer entered (on 0.18s, crawl 0.55s `power3.out`; release 0.32s / 0.2s `power2.in`).
- **Splash:** pointer-down throws 7 droplets that slow, are pulled back and are reabsorbed.
- **Flood:** opening the menu grows a wobbling pool from the click point to cover the screen (0.95s `power3.inOut`; closes in 0.7s `power3.in`); the pointer parts a small hole in it. Keyboard opening floods from the button's centre.
- **Fallbacks:** without WebGL, the menu is flat Mercury Silver revealed by a circular clip (0.8s open, 0.55s close). Under reduced motion there is no fluid at all and the silver menu appears instantly. The native cursor is hidden only when the fluid cursor is actually running.

### Scroll-Drafted Annotations
On the hero, scroll scrubs (0.6 smoothing) a drafting sequence over the heading: overall width of line one, cap height, the indent of line two, a leader to the lettering spec, and a leader to the scope note, then a hold. Extension lines are Sand Tertiary; dimension lines, ticks, values and leaders are orange; labels sit on slate knock-outs. Values count up from 0.0 as each line draws. The sequence is rebuilt on resize. On narrow screens it reduces to one width dimension under PORTFOLIO and a vertical leader under the tags.

### Footer Wordmark
The name, outlined at 1px Sand (non-scaling stroke), is lettered by scroll: CAP, mid and BASE guide lines draw first, orange construction crosses pop in at each letter's corners, the outline inks, then the crosses fade to 35% and a 5% sand fill settles in.

### Plotter Intro
Once per session, an orange 1px carriage with a 9px square head and an X readout in mm sweeps left to right (1.15s `power2.inOut`), revealing each `[data-reveal]` element as it passes, then fades (0.35s). A failsafe removes the gate after 2.6s; it never runs under reduced motion.

### Motion grammar
- **Easings:** `ease-out` cubic-bezier(0.35, 0, 0, 1) for state changes; `ease-inout` cubic-bezier(0.4, 0, 0.1, 1) for travel; `ease-expo` cubic-bezier(0.16, 1, 0.3, 1) (GSAP `expo.out`) for arrivals. Durations `dur-fast` 0.3s, `dur-base` 0.4s, `dur-slow` 0.5s.
- **Scroll:** Lenis smooth scroll (lerp 0.11) feeding ScrollTrigger; drawings scrub with 0.6 smoothing and use linear easing inside the timeline so position equals progress.
- **Arrivals:** menu rows rise 28px and fade in with `expo.out` 0.6s, stagger 0.06s, after a 0.42s flood lead; they leave upward 12px in 0.22s `power2.in`.
- **Anchored travel:** in-page jumps scroll 1.4s; back to top 1.6s.

## Do's and Don'ts

### Do:
- **Do** keep orange to lines, ticks, dots, small squares and state changes (#ff6b2c), per The Red Pencil Rule.
- **Do** set every measurement, code and field label in Geist Mono uppercase, 0.06em tracking, tabular numerals.
- **Do** measure real values from the rendered page before showing them as dimensions, and count them up as they draw.
- **Do** mark anything unbuilt with a 1px dashed line and say "In drafting" honestly instead of linking to nothing.
- **Do** tie explanatory motion to scroll with scrub, and give every scrubbed drawing a finished static state (`progress(1)`) for reduced motion.
- **Do** gate hover effects behind `(hover: hover)` and mirror each one on `:focus-visible`; the default focus ring is a 1px orange outline offset 6px.
- **Do** run the mercury cursor only on fine pointers and hide the native cursor only when it is running; touch devices keep the flood menu and the native experience.
- **Do** keep text on mercury in full slate ink at ≥6:1, using weight and dashed underline for hierarchy.
- **Do** return the header whenever focus enters it, trap focus in the open menu, and close it on Esc.

### Don't:
- **Don't** put orange text, hover colour or accents on the mercury flood (1.02:1).
- **Don't** add border radius, box shadows, gradients or glass to anything drawn on the sheet; mercury is the only material with depth.
- **Don't** use Rule Grey (#4a4740) for text, or anything fainter than Sand Tertiary (#928b7c) for text on slate.
- **Don't** use arrowheads on dimensions; use 45° architectural ticks.
- **Don't** set headings in mono or measurements in Archivo.
- **Don't** let any intro or animation hide content when it fails: gates must have a timeout and a reduced-motion bypass.
