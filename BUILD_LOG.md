# Build Log

A running record of what has been built, what changed, and what's next.
Newest entries at the top. Add an entry whenever a meaningful chunk of work lands.

## Totals so far

| | |
|---|---|
| **Time spent** | **~19 h 50 min** of active build time over 9 days (2026-10-12 → 2026-10-21), all in Claude Code. "Active" counts the time between messages, leaving out any gap longer than 15 minutes |
| **Usage** | Claude Pro plan, **no extra paid usage**. At the last update (2026-10-21 09:36 UTC): **21%** of the current 5-hour limit and **20%** of this week's limit |
| **Tokens** | About **1.84 M** tokens written by Claude, and about **1.17 B** tokens of context re-read from the prompt cache, across about 230 messages from you |
| **Commits** | 33 on `main` (first `ad09e6f`, 2026-10-12), plus this update |
| **Site size** | About **31 MB** built: case-study images 6 MB, skill work 22 MB (including the 20 MB film), code 1.4 MB, 3D models 1.3 MB |

*Pro plans don't bill per request, so there's no dollar figure. The plan-limit percentages are the closest measure of credits used. Update these numbers at the end of each session.*

---|---|
| **Time spent** | ~6 h 10 min of build time (one Claude Code session, 2026-10-12 13:00 → 19:11 UTC) |
| **Usage** | Claude Pro plan, no extra paid usage. About **49% of one 5-hour limit** and **17% of the weekly limit** used as of 2026-10-12 19:11 UTC |
| **Context** | ~900k tokens of conversation in the session |
| **Commits** | 3 (`ad09e6f`, `0405d8d`, `cc7234b`) plus this update |

*Pro plans don't bill per request, so there's no dollar "credits" figure; the plan-limit percentages are the closest measure. Update these numbers at the end of each session.*

---

## 2026-10-21 · Write-ups for every work, a renamed skill, tidier galleries

- **Write-ups:** picking a work in a skill card now drops open a short write-up under it, with an accent rule down the side. The first work's write-up starts open.
  - Every finished work has one: 45–64 words, first person, plain English. Works still in drafting have none.
  - A work's `about` field holds the text. Without it, a faded placeholder shows.
- **Renamed:** "3D modeling" is now **3D modeling & animation**. The slug is unchanged, so links still work. The other-sheet links at the foot of a card now wrap below 1240 px, since the longer name makes the row wider.
- **Galleries:** a work with a single image no longer shows the left/right arrows or the `01 / 01` counter.

---

## 2026-10-20 · Traverse, a short film in 3D modeling

- **New work under 3D modeling:** "Traverse" (an animation), an Akela Studios short mixing LEGO stop-motion, hand-drawn 2D and 3D. It takes the "Animation" placeholder as work 05. 3D modeling now reads "05 works, +1 in drafting".
- **Compression:** the original is 155 MB (1080p H.264 at 11 Mbps, 1 min 45 s), over GitHub's 100 MB file limit.
  - Apple's presets were either too big (720p, 61 MB) or too small (480×272), so a small AVFoundation script (`AVAssetWriter`, run with `swift`) re-encodes it to 720p H.264 at 1.5 Mbps with 128 kbps AAC audio.
  - The moov atom is up front so playback starts while it downloads. Result: 20 MB, close to the original side by side.
- **`Film.astro`:** the renders' 16:9 frame on black with native controls, `preload="none"`. Before Play, only a 36 KB poster loads (the LEGO close-up at 0:28). It pauses when its card closes or it scrolls away.
- **Data:** a work can carry `video: { src, poster, width, height }`.

---

## 2026-10-20 · Nexo and Cooked app prototypes in UI design

- **New work under UI design:** "Nexo app" (a prototype), shown first. It replaces the "Prototype" placeholder. UI design now reads "01 works, +3 in drafting".
- **`Prototype.astro`, a stage for a Figma prototype:**
  - Before Play: a poster of three screens as phones (welcome, connect, connected), exported from the Figma file through the Figma MCP. Saved as `public/skills/ui-design/nexo-*.webp`, 13–26 KB each.
  - **Play prototype** swaps in the live Figma embed (`embed.figma.com/proto/…`, starting at Flow 1, scaled down, Figma UI hidden). The embed is heavy, so it never loads unless asked for.
  - "Open in Figma" links to the full prototype. On phones the frame turns 3:4, so the prototype isn't a stamp.
- **Needs the file shared:** the Figma file is private, so the embed shows Figma's log-in wall. Setting the file to "Anyone with the link can view" makes the embed work for everyone, with no code change.
- **Data:** a work can carry `prototype: { embed, link, screens, aspect?, corner? }`.
- **Cooked app prototype:** work 02 in UI design, from the "UI Kit Food" file.
  - The embed starts at Flow 3 (`563:4552`, the splash), which leads into onboarding.
  - Poster: onboarding ("Expert Chefs"), the home screen, and the chef sign-up's cuisine step, saved as `cooked-*.webp`, 28–59 KB each.
  - The screens are 402×874 with rounded corners baked in on Figma's dark canvas. The poster clips them to their own radius (`corner: '12.8% / 5.9%'`, `aspect: '402 / 874'`), so no dark corners show.
  - UI design now reads "02 works, +3 in drafting".
- **Bigger, and a clean cursor (later the same day):**
  - The prototype's frame is tall now: `clamp(560px, 82vh, 860px)`, or `clamp(520px, 78vh, 700px)` on phones. The embedded phone takes most of the screen height.
  - The poster phones are sized by width so three always fit. Phones show just the middle one, large.
  - **Whole phone in view:** the embed asks Figma to fit (`scaling=contain`) instead of only shrinking the screen (`scale-down`). Figma draws its device bezel round the screen, so with `scale-down` the iPhone ran off the bottom of the stage.
  - Cursor (`ferrofluid.ts`): a cross-origin iframe swallows pointer events and sends none on the way in, so the drop froze at the embed's edge with Figma's cursor beside it. When moves stop within 12 px of an embed, the drop now fades out and the embed's own cursor takes over. It re-forms on the next move outside.

---

## 2026-10-20 · Debrecen Drive, the first photographs

- **New work under Photography:** "Debrecen Drive" (motorsport), shown first. Three panned drift shots: a white E36, a yellow E36 and a blue S14. Photography now reads "01 works, +3 in drafting".
- **Prep:** cropped off the thin dark frame each screenshot carried. Upscaled to 2000 px wide (from about 950–1170 px) with a Lanczos resample and a light unsharp mask, then saved as webp at about 120 KB each in `public/skills/photography/`.
  - I tried an ML upscale (Pixelmator Pro's Super Resolution, scripted). The app wouldn't open documents from a script, so this is a classic resample: smoother and larger, but it can't invent detail. For a true 3× ML upscale, run them through Super Resolution and drop the exports over these files.

---

## 2026-10-20 · Product sketches: hand mixer, flight seat handle, steering HMI

- **New work under Product sketching:** "Hand mixer" (a marker render), shown first. It replaces the "Marker render" placeholder. The image is at `public/skills/product-sketching/hand-mixer-01.webp`. Then "Flight seat handle" (another marker render) as work 02: `flight-seat-handle-01.webp`. The skill now reads "02 works, +3 in drafting".
- **Steering HMI:** work 03, four concept sheets: indicators, media controls, wipers and cruise control (the drawn sheets 2 to 5, in order).
  - Each sheet ranks the wheel's controls by importance, then sketches them as gestures.
  - The sheets were reduced from 2000 px to 1400 px webp, about 145 KB each, at `steering-hmi-0N-<name>.webp`.
- **Gallery `fit` and coloured grounds:** an image can be shown whole (`fit: 'contain'`) instead of filling the wide frame. The square sheets need this so nothing is cropped.
  - `ground` can be a colour too. The sheets sit on `#d8cfc0`, sampled from their paper, so they read as a page on its own paper with no seam.
- **Gallery ground:** an image can say what it sits on (`ground: 'light'` for a sketch on white paper). The stage then turns white under it, so no dark hairline shows round its rounded corners. It switches per image as you step through.

---

## 2026-10-20 · Aston Martin lighting study, and an image gallery for skill work

- **New work under 3D modeling:** "Aston Martin lighting study" (a render). It takes the old "Render" placeholder slot as work 04. Its images are `aston-martin-01.webp` (three-quarter front) and `-02.webp` (close on the headlight and wheel), in `public/skills/3d-modeling/`.
- **`Gallery.astro`, the stage for image work:**
  - The same 16:9 rounded frame as the 3D viewer, on black so a render never flashes a light frame while it loads.
  - Left and right buttons sit over the image's edges. A counter (`01 / 01`) and the work's kind sit underneath. The arrow keys step through too, and it wraps round.
  - With one image the buttons show but are dimmed. They come alive once there's a second image.
- **Data:** a work can now carry `images: [{ src, alt, width, height }]`. To add more renders, drop them in the same folder and add entries to that work's `images` list.

---

## 2026-10-20 · Two new skills: Product sketching and Sketching

- **Where they sit:** S-04 and S-05, between Graphic design and Photography. Photography is now S-06.
- **Product sketching:** fineliner and markers. Works: ideation, form study, marker render, exploded view. Icon: a sketch pad with a cylinder drawn on it.
- **Sketching:** pencil and sketchbook. Works: observation, perspective, sketchbook. Icon: a tipped pencil.
- **Dimensions:** each sheet has its own fixed dimension spots (`skillDims.ts`).
- **Skills index fix:** with six rows, the square drawing viewport grew taller and so wider than its column. It ran under the S-01… numbers and hid its right-hand registration crosses.
  - It now stays in its column (`min-width: 0`, no forced square) and takes the index's height.
  - The numbers stand off it by about the gap between a number and its icon: 44 px and 42 px at 1440 wide.
- **Placeholders:** every work is "In drafting", and the tools and one-liners are placeholders to swap for the real ones.
- **Skill cards end sooner:** the padding under the other-sheet links dropped from up to 64 px to 28 px.
  - The real culprit was the dimension overlay (`skillDims.ts`). Its height was set from the sheet's `scrollHeight`, which counted the overlay itself, so it only ever grew. A taller stage, an earlier padding, or the rise-in could leave it holding the card's scroll open well past the end.
  - The overlay is now sized by CSS to the sheet (`width/height: 100%`), so the scroll ends just under the links.
- **Other skills, one line:** the links to the other five sheets at the foot of a skill card now sit on one line, spread across its width. The names scale down a touch to fit. Below 1100 px wide they wrap again, left-aligned.

---

## 2026-10-20 · View cube, viewer cleanup, light-mode start

- **View cube on every 3D viewer:** a Fusion-style ViewCube in the stage's top-right corner (92 px, 64 px on phones).
  - What it shows: six labelled faces and an X/Y/Z triad (red, green, blue) from the back-bottom-left corner. It turns with the camera and with the arrow-key turn.
  - How it's drawn (`modelViewer.ts`): an orthographic cube in an SVG, redrawn each frame from the camera's view of the model. Only the faces turned toward the viewer are drawn. Each label is laid flat on its face with an affine `matrix()`.
  - Dragging the cube turns the model with it: a drag across the cube is half a turn. The tilt stays locked, the same as dragging the model.
  - Clicking a side face swings the camera round the model on the locked tilt to look straight at that face. TOP goes back to the home view.
    A drag never counts as a click.
  - A bare home icon sits in the cube's top-right corner and resets the view. It replaces the Reset view button in the bar, which is gone.
  - A picked view locks: the turntable stays off and the face stays lit in the accent. Dragging, the arrow keys or the home icon unlock it.
  - Faces are slightly see-through, so the triad shows faintly behind them. They take the accent on hover and follow the light and dark themes.
- **Section and Opacity on the stage:** both buttons moved off the bar into the viewport's bottom-right corner. When off, they sit on a wash of the page so they read over the model. The bar under the viewer is now just size and part count.
- **Section and Opacity buttons:** they now read as the viewer's main controls. They have an accent outline and a soft pulse until either one is tried.
- **Viewer cleanup:** removed the hint under the viewer and the work captions. The skills footer moved up.
- **Theme:** the site always opens in light mode, and the toggle no longer remembers a choice.

---

## 2026-10-20 · Progressive blur at the screen edges

- **The effect:** content softens as it slides under the top of the screen and off the bottom.
- **How (`src/components/EdgeBlur.astro`, on both pages):** fixed bands, 96 px at the top and 72 px at the bottom. Each is five stacked `backdrop-filter` layers (1, 2, 4, 8, 16 px), each masked to a thinner band nearer the edge, so the blur builds up with no hard line.
- **Layering:** it sits above the page but under the header and under an open case-study card, and never takes the pointer.
- **Touch screens:** three layers and shorter bands, since backdrop blur is costly on a phone's GPU.
- **Softened (later the same day):** the first pass was too harsh.
  - The blur now tops out at 6 px instead of 16 px, in gentler steps (0.5, 1, 2, 3.5, 6 px).
  - Each layer fades in over an overlapping ramp, so no step shows.
  - The bands are taller, so the haze builds slowly: 120 px at the top and 90 px at the bottom.

---

## 2026-10-20 · Mobile pass

Audited at 390 px across the homepage, both case studies, a skill sheet and All projects. There was no horizontal overflow anywhere; the fixes are touch targets, small type, and work phones don't need to do.

- **Performance:**
  - On touch screens the liquid cursor isn't created at all: no canvas, no WebGL context, no render loop. The menu flood it also served is gone.
  - The hero jet renders at up to 1.5× device pixels on touch screens (was 2×).
- **Touch targets:**
  - Header tabs are 40 px tall on phones.
  - Résumé, the theme switch and Home get invisible enlarged hit areas on coarse pointers.
  - The Cooked course dots and the tracker chapter LEDs become full 40 px targets on touch.
  - The skill sheet's "Used in" links are taller.
- **Small type:** the tracker hero callouts go up from 9 to 11 px on phones, and the skill sheet's labels (Sheet, Tools, Works, list heads, kinds) up from 10 to 11 px.
- **Reading:** on screens 600 px and narrower, the homepage guide line drops to 45% opacity, since it runs closer to the text there.

---

## 2026-10-18 · Cursor keeps its size while moving

- **Size:** the arrow no longer shrinks when it moves. Its size used to drop by up to 18% as the trail grew (volume borrowed for the trail); the trail is now extra, not taken from the arrow.
- **Stretch:** it lengthens along the motion with the width held, where the area-preserving version used to narrow it. The brief squash on stopping stays.

---

## 2026-10-17 · Cursor: smoother trail; the bead follows the pointer

- **Trail:** it's now a jointed chain that bends with the path. A middle joint follows the head and the tail follows the middle, both critically damped, so it draws out and reels back in without wobble.
  - **No jolt:** a soft `tanh` limit replaces the hard length clamp, so it never jolts at full stretch.
  - **No pop:** the streak's width grows in with its length.
  - **Settles fully:** the animation keeps running until the trail has fully retracted, instead of freezing part-way.
- **Wrap:** while the cursor wraps a button, its bead rides the ring to whichever side the pointer is on (eased the short way round). Before, it stayed parked where it entered, which felt like the cursor was stuck.

---

## 2026-10-17 · Cursor goes flat: comic line art

- **No more 3D chrome:** the cursor (and the ring it wraps round buttons) is now flat comic line art instead of shaded mercury: a bold 1.8 px ink outline round a flat fill, plus a crisp offset shadow (2.5, 3 px, 22%).
  - **Dark sheet:** sand fill, near-black ink.
  - **Light sheet:** white fill, slate ink.
- **The wrap ring:** thickened (3.2 px) so its fill shows inside the outline.
- **Unchanged:** all the motion (arrow shape, speed squash and stretch, sphere on a fast throw, the arrow-shaped trail, the wrap).
- **How:** the fragment shader's environment shading is replaced by an outline/fill split on the distance field, anti-aliased to one device pixel.

---

## 2026-10-17 · Mercury cursor, arrow-shaped

- **The shape:** the liquid cursor's head is now a pointer arrow instead of a round drop. Its tip sits on the pointer, and it's still the same mercury: silver and glossy on the dark sheet, black ink on the light one.
- **Speed-reactive squash and stretch:** the arrow stretches along its direction of travel in proportion to speed (up to 30% at about 3,200 px/s), area-preserving, about its middle. The stretch is sprung, so when it stops it overshoots into a brief squash, then settles.
- **Sphere when thrown:** fast enough (from about 2,200 px/s) it pulls into a sphere quickly, then takes about a second to become an arrow again.
- **Trail:** the whole body smears out behind it along the way it's moving. A smooth tapered streak (a round cone, as wide as the arrow where it leaves it and ending in a round 1 px line) joined to the body, so its edges stay clean.
- **Shadow:** softer and lighter, a wide falloff at 16% instead of a tight one at 38%.
- **Performance:** the arrow's polygon distance is unrolled edge by edge (no nested loop), so the smear stays cheap.
- **Unchanged:** the click wobble, the lean toward nearby buttons, and the liquid ring that wraps a hovered button.
- **How:** a new `uMove` uniform (stretch, angle, sphere blend). The shader blends the arrow distance into a circle and joins the trail cone with a smooth union.
- **How:** `sdArrow`, an exact polygon distance (7 vertices), replaces the circle in the shader's `body()`, scaled with the drop's size. `jelly()` now rotates back after its squash, so the arrow keeps pointing up-left while it wobbles.

---

## 2026-10-16 · All projects: a projects page

- **New page `/projects/` (`src/pages/projects.astro`):** the full drawing set.
  - **Header:** a "Back to the front page" link, "All projects" (block highlight on "projects"), and a short note.
  - **Case studies:** every project as a wide sheet: cover, sheet number (P-01…), discipline, title, note, duration and tools, "Open case study".
  - **Models & side builds:** the finished 3D pieces (M-01…) from the 3D modelling skill.
  - **Cards:** they open in the same expanding card as the homepage (the page carries its own `ProjectModal`), with deep links `/projects/#project-<slug>`.
  - **Chrome:** the page ends on the same contact footer.
- **Homepage:** Selected work shows the first three projects (`projects.slice(0, 3)`).
  - **Under the grid:** "Three on the wall. The rest are in the drawers." and an "Explore more projects" button to the new page.
- **Header tabs work from any page:** Work and Skills point at `/#work` and `/#skills`. `nav.ts` scrolls when the section is on the page, and otherwise lets the link navigate; Contact stays in-page, since every page ends on it.

---

## 2026-10-16 · About section: tried and parked

An About section drawn as an exploded assembly of Arnav (portrait at the centre; car, piston, plane, ESP32, phone, Bézier, camera, cube and ⌘Z key around it; a humorous parts list) was built and then taken out for now. It's saved on the local branch `draft/about-exploded` (`src/components/About.astro`, `src/scripts/aboutDrawing.ts`) to revisit. A simpler version (heading, portrait slot, two paragraphs, an "Off the clock" line) was also tried and taken out.

---

## 2026-10-16 · Résumé button

Feedback from a friend: the résumé should be reachable from anywhere. (Section tones were tried, first blended, then as solid bands, and taken out for now.)

- **Résumé button:** in the top bar after the tabs, the bar's only filled control, in the accent with dark ink and a download arrow. It opens `site.resume` (`/resume.pdf`, served from `public/resume.pdf`) in a new tab.
  - The footer's Résumé link now shows too.
  - On phones the button tightens and drops its icon, so the logo, three tabs, Résumé and the switch fit at 390 px.
  - **Still needed:** the PDF itself, at `public/resume.pdf`.

---

## 2026-10-16 · Jet V1 hologram in the hero

- **What it is:** the Jet V1 Fusion model (`public/models/jet.glb`, 38 parts) is drawn straight onto the hero as accent line art, with no box or panel, styled like an isometric technical illustration with hidden lines removed:
  - **Hiding:** every part is an invisible solid (depth only, no colour, drawn before any line) that hides what's behind it.
  - **Silhouettes:** an inverted-hull shader outlines each part at a constant 1.15 px.
  - **Creases:** creases sharper than 40° are drawn on top.
  - **Glow:** a soft CSS glow in dark mode.
- **Casings left out:** the outer and inner casings (any part nearly the jet's full length) aren't drawn, so the hologram shows the engine's working parts from the start.
- **Placement:** it sits across the lower right, fully on the first screen (canvas 68vw × 80svh, 12vw past the right edge, a 10% fade at its base), drawn behind the title so the lettering stays on top.
  - **The view, matched to the Fusion file:** the intake faces you at the lower left, seen a little from above, with the exhaust going away to the upper right (yaw 0.78, tilt 0.42, lean 0.32 rad).
  - **No hard cut:** the hero stage no longer clips (`overflow: visible`, with `overflow-x: clip` on the hero), so the jet overhangs the hero's foot and its bottom mask fades it out.
- **Not interactive:** `pointer-events: none`, `aria-hidden`.
- **Exploded view on scroll:** every part slides along the jet's axis by 0.85× its distance from the middle, with smoothstep easing, from assembled at the top to fully exploded after 60% of a screen. The camera frames the fully exploded jet, so the spread stays on the sheet.
- **Spinning blades:** the rotating parts turn about the engine's axis all the time, assembled or exploded. Struts, flanges and casing rings stay still, which is what makes the spin read.
  - **Which parts:** identified from the Fusion export numbers by drawing every part end-on.
    - Fan: spinner, hub and blades, at 1.4 rad/s.
    - Shaft and small ring: 2.6 rad/s.
    - Six compressor rows: 3.2 rad/s.
    - Four turbine stages: 3.8 rad/s. The rear flange ring with the nozzle guide vanes (037) is bolted to the casing and stays still.
  - **When it runs:** the loop only runs while the hologram is on screen and the tab is visible. Under reduced motion nothing turns.
- **Casings ghost on scroll:** as the explosion runs, the casings round the blade rows drop to 14% opacity over its first half, so the spinning blades inside show.
  - **Which parts:**
    - High-pressure core casing: 023 outer and 018 compressor case.
    - Low-pressure turbine casing: 025 outer and 020 turbine case.
    - The fan stator casing (021 fan case, 022 stator ring) stays solid.
  - **How:** the jet is rendered two ways and crossfaded on an eased curve over the first 60% of the explosion, so the blades fade in as the casings fade out instead of popping in.
    - Solid: the casings hide what's inside.
    - Ghosted: the casings at 14% in a pass of their own layer, after the rest and depth-tested against it. Solid parts in front still hide them, while the blades already drawn behind them stay visible.
    - Each look renders to a 4× MSAA target, and a full-screen quad mixes them. Every frame takes this same path, even at either end; switching to direct canvas rendering blended the faint lines differently and made them jump.
    - The outline shader applies the output colour space, so its colour is identical in every path.
    - The blend un-premultiplies before converting to sRGB and premultiplies after, so faint casing lines stay their own blue. Converting the premultiplied value had turned them into a pale haze on the light sheet. Checked in both themes, at the top and through the fade.
- **Rendering and loading:** it renders only when the scroll changes it, and three.js and the model load at idle after the page settles. It follows the theme, in deep blue lines on the light sheet. Under reduced motion it stays assembled.
- **Peek cards:** the cover peek cards moved to the bottom left, half off the foot of the sheet. The scroll cue folds into their label ("↓ Next · Selected work", the arrow still nudging), and they fade as you scroll.
- **Code:** `src/scripts/heroJet.ts`; canvas in `Hero.astro`.

---

## 2026-10-15 · Reveals always land in place; Cooked opener centred

- **Bug: reveals could freeze in their start pose.** Cooked's UI-kit buttons rested shrunk to 92% and 22 px low.
  - **Cause:** the reveals were `gsap.from()`, which records the resting pose from the page. When the card re-measured (on open, or as images loaded) while an element was still in its start pose, that start pose became the "end", so the tween animated from start to start.
  - **Fix:** every reveal in Cooked (`up`, `pop`, `left`/`right`, `fill`, `fill-x`, `stagger`) and in the tracker (`up`, `stagger`) is now a `fromTo()` with explicit end values.
  - **Staggered rows:** in Cooked these also play through once in view (0.5 s, 0.07 s apart), instead of scrubbing with the scroll, so a row is never caught half-arrived.
- **Centring:** "CONTROL." in the Cooked opener scaled up after layout and pushed the centred line off-centre (growing it from the middle overlapped "up" instead). It is now laid out at its full grown size (1.18em), so the line centres true, and the scene grows it from 1/1.18 to 1, from its left edge.

---

## 2026-10-15 · Header stays transparent

The scrolled header backing (translucent fill, blur and hairline) is removed. Only the logo, the tabs and the switch float over the page, which the header already hides while you read down.

---

## 2026-10-15 · Hero scrolls immediately

The hero was a 200vh track (170vh on phones) with the title pinned: the first screen of scrolling only scrubbed the dimension drawing while the page stood still, and people thought scrolling was broken.

- **No pinning:** the hero is now one screen (`100svh`), so the first scroll moves the page.
- **The drawing:** the hero dimensions (W, CAP, OFFSET; one W on phones) are still drawn by the scroll, but without holding it. They draw in over the first 10% of a screen (scrub 0.25), so one or two wheel steps bring them in while the page moves. Under reduced motion they're simply there.
- **Fading on scroll:** the scroll cue fades out with the work peek over the first 30% of a screen of scrolling.

---

## 2026-10-15 · Hero: no false bottom

The first screen showed only the title on an empty sheet, with a small grey "Scroll" in the corner, so it read as a finished page (a false bottom).

- **Peek:** the covers of the first two projects (Cooked, Productivity tracker) sit at the bottom right of the hero, cut roughly in half by the edge of the sheet, under a mono "Next · Selected work" label.
  - The cut-off cards say there's more below, and what it is.
  - Clicking them goes to the work, and hovering lifts the cards.
  - They rise slightly and fade out over the first ~45% of a screen of scrolling, once they've done their job.
- **Scroll cue:** the arrow beside "Scroll" now nudges downward on a slow loop. It holds still under reduced motion.

---

## 2026-10-15 · Real contact email

- **Email:** `site.email` is now 116.arnavsrinath@gmail.com, which every mailto link uses; the footer is the main one.
- **Clicking it:** opens a new Gmail draft in a new tab, already addressed to that email (`mail.google.com/mail/?view=cm&fs=1&to=…`), instead of a `mailto:` link, which does nothing without a desktop mail app.
- **Phones:** the footer address scales to stay on one line (`clamp(0.75rem, 3.7vw, 1.125rem)`, no wrap) instead of breaking mid-domain. Checked at 390 and 340 px.
- **Still placeholders in `site.ts`:** LinkedIn, Résumé and city.

---

## 2026-10-15 · Black ink cursor in light mode

- **Light mode:** the mercury cursor becomes black ferrofluid on the light sheet. Its blob, trail and the ring it wraps around buttons are all ink.
- **How:** the shader has a second environment, `envInk`. It reflects the same studio in a dark liquid, with the sky and floor near black and the light streaks kept bright so it still reads glossy. The edge darkens to ink.
- **Switching:** a `uInk` uniform (0 = silver, 1 = ink) eases over 0.5 s when the theme flips, and starts at the saved theme on load.
- **Case studies:** each brings its own cursor. Cooked's light world gets the ink cursor, and the tracker's dark board gets silver, whatever the site's mode. Skill cards follow the site. It watches the card's `data-theme`: it changes as a card opens and returns to the site's mode once the card has closed.

---

## 2026-10-15 · Header tabs instead of the menu; a sun/moon switch

- **Menu removed:** the mercury flood menu (`Menu.astro`, `menu.ts`) is gone. The mercury cursor itself stays.
- **Header tabs:** Work, Skills and Contact sit on the header as bracket links.
  - Each glides to its section (Lenis, 1.4 s) and moves focus there.
  - The section you're reading is marked with `aria-current`: it shows in the accent with its brackets drawn.
  - Sketchbook and About aren't listed, since they have no pages yet.
- **Theme switch:** the light/dark button is now a pill switch (`role="switch"`, on = light). Both marks are faint in the track, and a sand knob carrying the current one (moon or sun, drawn SVG) springs across, with the icons rotating as they swap.
- **Cursor on the switch:** the button is the pill itself (no padding, 13 px radius), so the mercury cursor, which follows the hovered element's corner radius, wraps it as a pill instead of a box.
- **No brackets under the mercury:** with the mercury cursor running, a hovered bracket link hides its brackets, since the liquid already outlines it. Keyboard focus and touch-screen hovers keep them.
- **Header backing:** once the page scrolls, the header gets a translucent sheet-coloured backing with a blur and a hairline, so content never reads through the tabs.
- **Phones:** tighter tabs and padding, so the logo, three tabs and the switch fit at 390 px.

---

## 2026-10-15 · Light / dark toggle

- **The toggle:** a mono bracket button beside MENU, with two small swatches (filled = the mode you're in). It reads "LIGHT" in dark mode and "DARK" in light mode. It's hidden while the mercury menu is open.
- **Remembering it:** the choice is saved in `localStorage` (`as-theme`) and applied in `<head>` before first paint, so there's no flash. The default is dark. It crossfades with the View Transitions API where the browser has it, and switches instantly under reduced motion.
- **Light mode keeps the same scheme, inverted, in `tokens.css` `:root[data-theme='light']`:**
  - sand paper (`#ece6da`) for the sheet, with slabs stepping lighter instead of darker and soft warm shadows;
  - slate lettering in three strengths, with `--sand-3` at about 4.5:1 on paper;
  - the same sand blue for highlight blocks and selection (`--accent-fill`), always with dark ink (`--on-accent`);
  - a deeper tone of it, `#2f6a84`, for lines and small text so they read on paper.
- **Wiring:**
  - Hard-coded alphas now use channel tokens: `rgb(var(--ink-rgb) / a)` and `rgb(var(--bg-rgb) / a)`.
  - The dust canvas reads `--ink-rgb` and re-reads it on a `themechange` event.
  - The browser's `theme-color` follows the mode.
- **Case studies:** each keeps its own world. The tracker's circuit board pins the dark tokens on its card, and Cooked was already light.

---

## 2026-10-15 · Accent: orange → sand blue

- **The colour:** the site accent is now **sand blue, `#94c4d9`**, a dusty light blue that sits with the sand linework. It has about 9.7:1 contrast on the slate, and slate text on a blue block reads the same.
- **The token:** `--orange` is renamed `--accent` (39 uses). The hard-coded spots follow it:
  - the case-study nav's fill;
  - the favicon's top face;
  - the mercury cursor's glint;
  - the 3D viewer's section-cut faces, now a deep sand blue (`#4f8aa3`).
- **Unchanged:** the case studies keep their own worlds, so Cooked stays green and the tracker keeps its copper traces (`--tk-copper` pinned to `#ff6b2c`).

---

## 2026-10-15 · Cooked: a sharper opener and three directions

From the review draft (branch `draft/review-feedback`), only these were kept; everything else stayed as it was.

- **Opener:** "Imagine this. A long day…" is replaced with a straight problem statement: "Ordering in is easy." → "Knowing how it's made isn't. Oil, spice, hygiene: you don't get a say." → "Convenience wins. You give up control."
- **Three directions:** "Ideas on the wall" (14 sticky notes) becomes three wide cards, each saying what it was and why it was cut or kept. Two are cut and struck through; the kept one is outlined and tagged "→ Built". Caption: "3 directions · 1 made it to the plate". The cards stack on phones.
  - Teach them to cook.
  - Guide the household cook.
  - Book a chef, made your way.

---

## 2026-10-15 · Block highlights on the major headings

- **What it is:** one word of each major heading sits on a solid orange block with slate lettering, like a highlighter: hero **Srinath’s**, Selected **work**, **Skills**, and the footer's **talk**.
- **Motion:** the block wipes in left to right (0.7 s) the first time the heading comes into view, and the lettering turns dark as it's covered. The hero's waits 1.4 s, for the intro plotter.
- **Fallbacks:** without the script, or with reduced motion, the blocks are simply there.
- **Code:** `.hl-block` in `global.css` and `src/scripts/highlights.ts`. The script arms the blocks at start-up, so they never flash full and then empty.

---

## 2026-10-15 · Key words in the accent

A word or two per block is now set in orange with a global `.hl` class. Highlighted phrases don't break across lines.

- **Hero:** "I design **objects** and the **interfaces** that control them."
- **Selected work:** "…each told through the **Double Diamond**…"
- **Skills:** "What I **can do**, as a set of sheets."
- **Footer:** "…we should probably **talk**."
- **Skill summaries:** wrap words in `*asterisks*` in `skills.ts` to highlight them.
  - 3D modeling: **print and fit**
  - UI design: **clickable prototypes**
  - Graphic design: **explain**
  - Photography: **Light**

The case studies already had their own accents: orange in the tracker, green in Cooked.

---

## 2026-10-15 · Dimensions in px; skill sheets get dimensioned

- **Every drafting dimension now reads in px, with the unit written:**
  - the hero (`W 1081 px`, `CAP 66 px`, `OFFSET 278 px`);
  - the flow dimensions on the homepage;
  - the plotter readout (`X 0412 px`).
- **Values:** whole pixels, measured from the rendered page; `dimension.ts` exports `px()` for the format. The 3D viewer's part sizes stay in mm, because they're real object sizes, not page dimensions.
- **Skill sheets (`skillDims.ts`):** every sheet has its own fixed one or two dimensions, in different places on each sheet but the same every time it opens. They're measured in px and drawn in as they come into view (the second follows the first).

  | Sheet | Desktop | Phone |
  |---|---|---|
  | 3D modeling | title width + works list height | stage width |
  | UI design | drawing height + stage width | summary width |
  | Graphic design | summary width | summary width + stage width |
  | Photography | drawing width + title block height | stage width |

- **Phones** have their own set: there's no margin for vertical dimensions, and the drawing box sits right above the title. Labels knock out on the card's slate.

---

## 2026-10-15 · Skills redrawn as a sheet set

Feedback: the skill cards looked templated, with too much text and no blueprint feel.

- **Homepage: a drawing index, not four icon cards.**
  - One slab: a drafting-grid viewport with registration crosses on the left, and the sheet list on the right.
  - Rows S-01 to S-04 show the sheet number, a small turning wireframe, the name, the tools, and the works count or a dashed "In drafting".
  - Hovering or focusing a row puts its wireframe in the viewport and turns the row orange.
  - On phones the viewport drops and each row keeps its small drawing.
- **Skill card: one drawing sheet.**
  - **Head:** the title and a one-line summary, with the wireframe in a gridded viewport.
  - **Title block:** Sheet, Tools, Works (built count, with "+N in drafting"), and Used in (links to the case studies).
  - **Work:** one stage with a numbered works list beside it; picking a row puts that piece on the stage.
  - **Next sheets:** a row of links to the other sheets.
- **Less text:**
  - Summaries cut to one line, and captions shortened.
  - "Year TBD", "Since TBD" and the placeholder captions are gone.
  - Unbuilt slots are `pending` works, drawn as dashed "In drafting" sheets with no copy.
- **Fixes:**
  - The card viewport's wireframe collapsed to zero width on phones (its percentage padding was measured against the whole header); it's now sized directly.
  - Long titles fit on phones.

---

## 2026-10-15 · Photography: the kit, in line art

- **The kit:** a block on the Photography card with the two cameras as small line drawings in the site's sand linework, each captioned with its name and nothing else (no panels, callouts or specs, by request).
  - **Canon EOS 500D**, drawn from the front.
  - **iPhone 15**, drawn from the back.
- **Motion:** the strokes ink in, in order, when the kit comes into view on an open card. Under reduced motion they're simply there.
- **Tools line:** Photography reads iPhone 15 · Canon EOS 500D.
- **Code:**
  - `src/components/project/CameraKit.astro`.
  - `Skill.kit` is a list of `{ name, art }`.
  - The card's block heading styles are global within the card, so the kit shares them.

---

## 2026-10-15 · Photography skill

- A fourth skill: **Photography** ("Products, places and people"), with a drawn camera icon and four placeholder photo slots.
- Its tools are still to add: `tools: []` hides the tools line on the card, and the tile keeps an empty line so the four names stay aligned.
- The grid is four a row on desktop, two a row below 1100px and one a row on phones.

---

## 2026-10-15 · Skills are skills, not software

Feedback from the dean: a skill is what you can do, not the program you do it in.

- **The four software tiles are now three skills:**
  - **3D modeling** (Fusion 360 · Blender): the three Fusion models, plus the render, animation and material placeholders that were under Blender.
  - **UI design** (Figma · FigJam).
  - **Graphic design** (Illustrator).
- **Icons:** each skill gets a drawn icon instead of a brand logo (an isometric cube, a laid-out phone screen, a pen nib). They still extrude into the 3D wireframe.
- **Tools line:** the software appears as a small mono line under each skill, on the tile and on the card.
- **Data:** `Skill.maker` is replaced by `Skill.tools`. A case study is linked from a skill's card when its `tools` include any of the skill's tools, so the tracker shows under 3D modeling and Cooked under UI design.
- **Copy:**
  - Section note: "What I can do, and the tools I do it with."
  - Card headings: "Case studies that use it" and "Other skills".
- **Layout:**
  - Three tiles a row on desktop.
  - On phones, one per row with the icon beside the words.
- **Links:** card links are now `#skill-3d-modeling`, `#skill-ui-design` and `#skill-graphic-design`; the old `#skill-fusion`-style links no longer open a card.

---

## 2026-10-15 · Productivity tracker: more electronics, cleaner board

- **Headings power on:** each chapter heading sits unlit (sand-3) until the copper trace reaches its pad, then it strikes on with a two-stutter flicker, like a tube. The hero title does the same when the card opens. Under reduced motion, everything is simply lit.
- **Bench test 1, the sensor (new):** an HC-SR04 demo running the v1–v5 logic.
  - Orange pings go out and green echoes come back. Echo time is `d × 2 / 0.034` µs, and a mini scope shows the TRIG and ECHO pulses.
  - It switches on at ≤ 20 cm and only off at ≥ 30 cm (v5 hysteresis). A servo dial sweeps while it's on.
  - Scrolling walks a person up to the desk and back, so the hysteresis plays out by itself. Dragging or the slider takes over.
  - The pings run only while the demo is on screen.
- **Scene sketches:** kept as the original pencil-on-paper photos, rotated upright and renamed by their handwritten labels (`scene-1-dorm`, `scene-2-library`, `scene-3-cafe`; the old file names had the café and dorm swapped).
- **Whiteboard maths:** kept as the original photos.
- **Solo project:** removed the Team field from the hero; the project data now says `team: 'Solo'`, and "The problem we picked up" reads "I".
- **Exposure fix:** the side view through the clear panel (`final-3`) was washed out. Its black point is reset, the midtones are pulled down and colour is restored a little.
- **Enclosure images cleaned up:**
  - The block-out lost its black box and stray pink selection edges, and now sits on the card's panel colour with a matching border.
  - The Fusion frame and laser-cut layout are cropped to the model and the sketch, with no Fusion panels or toolbars.
- **Scans as linework:** the form sketches and the circuit diagram are processed into light linework on transparency (`*-ink.webp`), so they sit on the dark board instead of as white paper. The schematic is revealed by a copper scan line as you scroll.
- **Hero:** removed the eyebrow line. Callouts are now vias on the part with 45° leader traces that draw out when the card opens.
- **Ship it:** the stats grid is replaced by a "Done uploading." progress bar that fills with the scroll, followed by the summary line.
- **Other changes:**
  - Perfboard-dot background.
  - Real micro-servo horn on the button simulator.
  - Copper text selection and focus ring.
  - BOM row hover.
  - Whiteboard pair sized to equal heights.
  - Larger sensor-ruler lettering on phones.
- **Performance:** removed the `drop-shadow` filter from the 14,000 px trace, which repainted on every scroll frame; the glow is now a second faint stroke. The hero photo is lazy (warmed on tile hover), and every image decodes async with intrinsic sizes.

---

## 2026-10-14 · Productivity tracker case study

The UX placeholder tile is now **Productivity tracker** (Product, Makers Studio "Tinkering with Tech", 4 months, solo project). It has its own case study, built from the A3/A4 boards, the code document and the Fusion model.

- **Look:** a near-black circuit board (`data-theme="pcb"`, card `#101316`, faint 24 px grid). A copper trace routes down the left edge with 45° jogs and draws itself with the card's scroll, a spark at its tip. At each chapter a branch runs into the chapter's numbered pad, and its via lights up when the current arrives. An LED rail on the right tracks the chapter.
- **Headings read as a build log**, with the Double Diamond stage in small print: Power on (Discover) → Read the signal (Define) → Breadboard it → Write the firmware (Develop) → Solder it down → Build the enclosure (Deliver) → Ship it (Outcome).
- **The electronics work, shown:**
  - round-1 parts (each with its job, e.g. IR "the phone trap");
  - the final BOM with a running ₹1,838 total that counts up as the parts drop in;
  - bench, breadboard and soldering photos, and the motor/encoder whiteboard maths;
  - the 7 firmware versions as a commit log with the key line of each;
  - the circuit diagram.
- **Firmware simulator:** code v6's state machine runs in the browser.
  - Tap to start or add 15 min; hold for more than 500 ms to lock; hold again to finish (the servo arm swings).
  - It beeps quietly, only after a press, and prints the firmware's real `Serial.println` lines to a serial monitor.
  - It works with the keyboard (Space or Enter) and with reduced motion.
- **Enclosure:** form sketches, block-out, Fusion frame, laser-cut layout, plus the Fusion "Final Box" model in the 3D viewer (`public/models/finalbox.glb`, 34 KB).
- **Assets:** 55 webp images in `public/projects/tracker/` (about 2.4 MB, lazy). The storyboard was rotated upright and cropped. The stock persona photo and the photos of other students observed during research were left out.
- **Tiles:** `cover.focus` (CSS object-position) keeps a cover's subject in frame. The tracker's tile shows the box's two sensor "eyes".
- **Files:**
  - `src/components/project/tracker/TrackerCase.astro`
  - `src/scripts/trackerCase.ts`
  - hooks in `ProjectModal.astro` and `main.ts`
- **Still to fill:** the role.

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
