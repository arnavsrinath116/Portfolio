# Portfolio Plan: "The Drawing Set"

> **The idea in one line:** your portfolio is a **set of technical drawings**. Every page is a *sheet* with a border, a title block and a sheet number. Scrolling **drafts** the drawings: lines draw themselves, dimensions extend, CAD models explode and get cut open. It has the vibe of an architect's blueprint, but it's about **product, UX and HMI design**: the objects you design *and* the interfaces that control them.

Product truth lives in [PRODUCT.md](PRODUCT.md). References live in [references/](references/README.md).

---

## 1. Who it's for and what success looks like

| | |
|---|---|
| **Primary visitor** | A recruiter or hiring manager for product / UX / HMI roles, with about 60–120 seconds, usually on a laptop, sometimes on a phone |
| **Secondary visitor** | Portfolio reviewers and mentors who read the whole case study |
| **In 5 seconds they should know** | Your name, that you design **physical products and their interfaces**, and where the work is |
| **In 60 seconds** | They've seen your 3 projects, opened one, and know how to contact you or get your résumé |
| **What would feel wrong** | Waiting for a loader, scrolling through empty animated screens, a 3D model that traps the scroll, hard-to-read text, or "cool" that hides the work |

**The rule that keeps it clean:** *motion explains, never decorates.* Every animation either draws, measures, assembles, cuts open or annotates something real. If an effect doesn't help someone understand a project, it goes.

---

## 2. Visual system: "drafting on slate"

### Palette (contrast-checked against WCAG AA)

| Token | Hex | Use | Contrast on slate |
|---|---|---|---|
| `--slate` | `#14171A` | Page background (slate black, slightly cool) | — |
| `--slate-raised` | `#1C2024` | Cards, viewer background, title block | — |
| `--sand` | `#E6DCC8` | **Lines and primary text** (warm sand white) | 13.2:1 ✅ |
| `--sand-2` | `#B8AF9D` | Body text | 8.3:1 ✅ |
| `--sand-3` | `#928B7C` | Labels, captions, annotations | 5.3:1 ✅ (4.8:1 on raised ✅) |
| `--line` | `#4A4740` | Hairline grid, borders (**lines only, never text**) | 1.9:1 |
| `--orange` | `#FF6B2C` | Accent: dimensions, active states, CTAs, the "current" marker | 6.3:1 ✅ (readable as text too) |

- **Orange stays under ~5% of any screen.** It means "look here / this is live / this is a measurement."
- **Bonus: "Print mode" (light theme).** A toggle that flips the site to a blueprint *printed on paper*, using the Heron palette in [references/type-and-color/palette.md](references/type-and-color/palette.md). Dark is the default; light is the printed sheet.

### Type (two voices, like a real drawing)

| Voice | Suggested font (free) | Use |
|---|---|---|
| **Lettering** | **Archivo** (variable, with a *width* axis: use the expanded width for titles, like architectural lettering) | Headings in UPPERCASE with tight tracking, plus body text at normal width |
| **Annotation** | **Geist Mono** (alt: Martian Mono) | Sheet numbers, dimensions, labels, meta: `A-101`, `[01]`, `SCALE 1:1`, `REV 03` |

### Line language (what makes it feel authentic, not a costume)
Real drawings use **line weights** with meaning, so we will too:
- **0.5px hairline** `--line`: grid, construction lines
- **1px** `--sand`: object outlines, UI frames
- **1.5px** `--sand`: the hero drawing's main silhouette
- **1px dashed** `--sand-3`: hidden edges, future states, "not built yet"
- **1px** `--orange`: dimensions, leader lines, callouts, the active item

**Recurring elements on every page:**
- **Sheet border** with zone markers along the edges (`A B C D…` across, `1 2 3 4…` down). The current zone lights up orange as you scroll, which doubles as your **progress indicator** (fixing the thing Heron lacks).
- **Title block** (bottom-right, like every real drawing): project, sheet number, "Drawn by Arnav Srinath", date, scale, **REV** (revision = last updated).
- `+` registration marks at grid corners.

### Keeping "dark + blueprint" from looking generic
Dark backgrounds with one glowing accent are a very common AI look. We avoid it by:
- **No glow, no neon, no cyan.** Warm sand lines on slate are closer to chalk or white pencil on board than to a sci-fi HUD.
- **Real drafting conventions** (line weights, dimension styles, title blocks, section hatching) applied *precisely*. Authenticity is the style.
- **Your actual drawings.** Fusion 360 can export real technical drawings, so the line art is *your* work, not stock decoration.

---

## 3. Site map and user flow

```
/                     Home: one scroll, content-first
/work/[project-1]     Sheet A-101: case study
/work/[project-2]     Sheet A-102: case study
/work/[project-3]     Sheet A-103: case study
/misc                 "Sketchbook": graphic design, sketches, photography, CAD studies
/about                (optional; can live on Home) longer story + résumé
/resume.pdf           Always one click away
/404                  "Sheet not found": a blank sheet with a title block
```

**The navigation is a sheet index:** `A-101 · A-102 · A-103 · SKETCHBOOK · ABOUT · RÉSUMÉ ↓ · CONTACT`. It's fixed at the top, in mono, with the current sheet underlined in orange.

### Home: section by section

| # | Section | Content | Scroll animation (synced to scroll) |
|---|---|---|---|
| 0 | **First paint** | Name and one-liner are **readable instantly**. No loader gate | The sheet border and title block draw in at the same time (≤1s, skippable) |
| 1 | **Hero** | **ARNAV SRINATH**, *"Product, UX & HMI designer. I design objects and the interfaces that control them."* Status pill: *"Open to internships · 2027"* (your call). Buttons: **View work** / **Résumé** | Your hero CAD model as a **line drawing** that rotates slowly with scroll. Orange dimension lines extend and their numbers count up |
| 2 | **Sheet index: 3 projects** | Three large "sheets": number, title, discipline tag (PRODUCT / UX / HMI), one-liner, key visual | Each sheet's drawing **drafts itself** as it enters. On hover, the line drawing turns into the real render or photo (wireframe → real, like Igloo and Heron) |
| 3 | **Disciplines** | Product · UX · HMI, each with 1 sentence + tools (Fusion 360, Figma…) | Three small isometric line icons draw in (like Heron's problem cards) |
| 4 | **Sketchbook teaser** | 6–8 misc pieces in a loose strip → link to /misc | Pieces slide in like papers on a desk, each with a small mono caption |
| 5 | **About strip** | Photo (line-art treatment or duotone in sand) + 3 short lines about you | Photo resolves from a hatched sketch to the real photo |
| 6 | **Contact** | *"If you've scrolled this far, we should probably talk."* (Sahor) + email + LinkedIn + résumé + your local time | The title block "stamps" APPROVED in orange when the section is reached (tiny, playful) |

**The recruiter fast path:** résumé and contact are in the nav from the first second, and every project card has a **"60-sec version"** link that jumps straight to the case study's TL;DR.

### Case study template (each project = one sheet)

1. **Title block header** (Midu-style hero): big title, discipline tag, meta row (**Role / Team / Duration / Tools**) aligned to the grid
2. **TL;DR card** (the 60-second version): problem → what you did → result, in 3 lines + one key image
3. **Pinned table of contents** (Midu): *01 Problem · 02 Research · 03 Concept · 04 Design · 05 Build/CAD · 06 Result · 07 Learnings*. The active step expands, and the sheet-border zone tracks progress
4. **Sections** alternate between short text and big visuals. Physical projects get the **CAD viewer** (§5) in "05 Build". UX/HMI projects get **interactive screens** and **redlines** (§6)
5. **Next sheet →** / **← Previous sheet**, Sahor/Midu style
6. Optional **"Full write-up on request" lock** for anything under NDA (Sahor)

### Miscellaneous: "Sketchbook"
- **Filters:** All · Graphic design · Sketches · Photography · CAD studies · Other. **View:** Grid / List, saved in the URL (Sahor)
- Each discipline is presented in its own medium:
  - **Photography** as a *contact sheet*: film frame numbers, a sand border, and click for full-bleed dark viewing
  - **Sketches** as *tracing paper*: on hover the sheet lifts and you see through it
  - **Graphic design** at full color. This is the one place color runs free, framed by the sheet
  - **CAD studies**: a small viewer, or a turntable GIF
- **Lightbox** with arrow keys, captions (title · year · medium · tools)

---

## 4. Scroll animation grammar

Every animation is **scrubbed by scroll** (it moves as you scroll and reverses when you scroll back) and comes from **one vocabulary of six moves**:

| Move | What it looks like | Tech |
|---|---|---|
| **DRAW** | Lines stroke themselves in | SVG `stroke-dashoffset` + GSAP ScrollTrigger `scrub` |
| **DIMENSION** | Orange dimension lines extend, end ticks pop, numbers count up | SVG + GSAP |
| **ASSEMBLE / EXPLODE** | CAD parts fly apart or snap together | Three.js, part positions tied to scroll progress |
| **SECTION** | A cutting plane slices the model and reveals the inside, with hatching | Three.js clipping plane |
| **ANNOTATE** | Leader lines draw from a part to a label (like Heron's violation markers) | SVG overlay anchored to 3D points |
| **PLOT** (page transitions) | A thin orange "plotter line" sweeps across between sheets | Astro View Transitions + CSS |

**Rules:**
- Content is **always readable** even if JavaScript fails or the animation hasn't run (final state first, motion added on top).
- **No pinned section longer than ~1.5 screens.** Something is always readable.
- **`prefers-reduced-motion`:** show every drawing in its finished state, with no scrubbing and no smooth scroll.
- **Hovers and buttons:** Lusion's timing (`cubic-bezier(0.35,0,0,1)`, 0.3–0.5s) and letter-roll text hovers, only on mouse devices (`@media (hover: hover)`).
- Smooth scroll with **Lenis** (keeps native scrolling, keyboard and anchors working).

---

## 5. The CAD viewer (yes, this is very doable)

### Pipeline: Fusion 360 → web
1. **In Fusion 360:** clean up the design, name the components (e.g. `housing`, `knob`, `pcb`), then **File → Export → FBX** (keeps components separate) or **OBJ**
2. **In Blender (free):** import, fix scale and orientation, simplify heavy meshes (Decimate), assign simple materials, then **export glTF Binary (.glb)**
3. **Compress:** `npx @gltf-transform/cli optimize model.glb out.glb --compress draco` (target **≤ 3–5 MB per model**)
4. **Also from Fusion:** the **Drawing workspace → export PDF/DXF → convert to SVG**. These real orthographic drawings become the line art that DRAWs on scroll

### Viewer features (in priority order)
| Priority | Feature |
|---|---|
| Must | Orbit / zoom / reset, **lazy-loaded** only when scrolled into view, **poster image** first, no scroll-trapping (on phones, 1 finger scrolls the page and you tap "Rotate" to interact) |
| Must | **Blueprint mode**: edges only, sand lines on slate (matches the site perfectly), toggling to **Render mode** (matte clay or real materials) |
| Should | **Explode slider** (and scroll-scrubbed explode in the case study) |
| Should | **Section cut slider** with hatching on the cut face |
| Should | **Hotspots**: click a part to see its name, material and a design note |
| Could | **Dimension overlay** (overall size in mm) |
| Could | **"View on your desk" in AR** on phones (via Google's `<model-viewer>` + USDZ export) |

**Tech:** Three.js via **React Three Fiber + drei** inside an Astro "island" (only loads on pages that use it). `drei/Edges` gives blueprint mode almost for free.

---

## 6. More ideas (you asked for these)

✅ = keeps it clean (recommended) · ⚠️ = cool but only if time allows

**Signature ideas, the ones people will remember**
- ✅ **Object ↔ interface pairing (HMI showcase).** CAD model on the left and its interface on the right. Turn the 3D knob and the screen UI updates. This literally demonstrates "I design objects *and* their interfaces"
- ✅ **Sketch → CAD → product morph.** One scroll takes a project from napkin sketch → line CAD → render → real photo. Process in one gesture
- ✅ **Redline mode (UX/HMI).** Toggle orange "redline" markups on your UI screens: the critiques and iterations that led to the final design. Reviewers *love* seeing process
- ✅ **Sheet-zone progress border.** The drawing-border zone letters double as a scroll progress indicator

**Small touches**
- ✅ Title block on every page with **REV + date** = "last updated" (shows the portfolio is alive)
- ✅ **Crosshair cursor** with tiny live x/y coordinates in mono (desktop only, subtle)
- ✅ **Before/after slider** for UI iterations
- ✅ **Exploded parts list (BOM table)**: hover a row and the part highlights in the 3D viewer
- ✅ **Print mode** (light theme = blueprint on paper), which also makes printing the site nice
- ✅ **"Sheet not found" 404** page
- ⚠️ Subtle pencil/plotter **sound**, off by default
- ⚠️ **Easter egg:** press `?` for keyboard shortcuts, or a Konami code where a plotter draws your self-portrait

**Practical career wins**
- ✅ **PDF portfolio export.** Many applications ask for a PDF. Generate one from the same content, styled as a printed drawing set
- ✅ **Résumé that matches** the site's title-block style
- ✅ **Share images (Open Graph)** per project, designed as sheets, so links look great in emails and LinkedIn
- ✅ **Privacy-friendly analytics** (Cloudflare Web Analytics or Umami) to see which projects reviewers open
- ✅ **Custom domain** (e.g. `arnavsrinath.com` / `.design`)

---

## 7. Tech stack and structure

| Layer | Choice | Why |
|---|---|---|
| Framework | **Astro** | Static, fast, content-first; "islands" load heavy 3D only where needed |
| Content | Astro **content collections** (Markdown/MDX) | Each project and misc piece is a file you can edit without touching layout code |
| Styling | Plain CSS with tokens (§2) | Full control over line weights and the grid |
| Motion | **GSAP + ScrollTrigger** (+ SplitText), **Lenis** | Industry standard for scroll-scrubbed animation; GSAP is free |
| 3D | **Three.js** via React Three Fiber + drei | Blueprint edges, explode, section cuts |
| Images | Astro `<Image>` (AVIF/WebP, responsive sizes) | Fast photos for the sketchbook |
| Hosting | **Cloudflare Pages** (or Vercel/Netlify) from the GitHub repo | Free, auto-deploys on every push |

```
src/
  content/projects/*.mdx      # 3 case studies
  content/misc/*.md           # sketchbook items
  components/sheet/           # SheetBorder, TitleBlock, GridMarks, Nav
  components/draw/            # DrawPath, Dimension, Leader, Hatch
  components/cad/             # CadViewer (island), Hotspot, ExplodeSlider
  layouts/Sheet.astro
  pages/ index, work/[slug], misc, about, 404
public/models/*.glb  public/drawings/*.svg  public/resume.pdf
```

**Performance budget:** home page under 1.5 MB before any 3D, text visible within 1s, Largest Contentful Paint under 2s, each model ≤ 5 MB and loaded only on demand, Lighthouse 90+ across the board.

---

## 8. What you need to gather (content checklist)

**For each of the 3 projects**
- [ ] Title + one-liner + discipline (Product / UX / HMI)
- [ ] Your role, team, duration, tools
- [ ] Problem, research, concept, design, build, result, learnings (rough notes are fine; we'll edit together)
- [ ] Sketches (scans or photos)
- [ ] Fusion 360 files → FBX export (+ Drawing-workspace PDF/DXF if possible)
- [ ] Renders and real prototype photos
- [ ] UI screens / prototype links (Figma) for UX/HMI work
- [ ] Any result you can honestly state (user tests, awards, shipped?)

**Sketchbook**
- [ ] Images + title, year, medium/tools, 1-line caption each

**About and contact**
- [ ] Headshot, 3-line bio + longer story, résumé PDF, email, LinkedIn (+ Behance/Dribbble?)

---

## 9. Build roadmap

| Phase | What | Skills to use |
|---|---|---|
| **0. Gather** | Content checklist above; pick the strongest project to build first | — |
| **1. Foundations** | Astro setup, tokens, fonts, sheet border, title block, grid, nav; deploy an empty site to the live URL | `impeccable`, `design-taste-frontend` |
| **2. Home (static)** | All home sections with real content, responsive, no motion yet | `impeccable`, `emil-design-eng` |
| **3. First case study** | Template + your **strongest** project, fully written | `impeccable` (critique) |
| **4. CAD pipeline** | One model end-to-end: Fusion → Blender → GLB → viewer with blueprint/render modes | `threejs` skills (install then) |
| **5. Motion layer** | DRAW / DIMENSION / EXPLODE / SECTION / ANNOTATE / PLOT, plus reduced motion | `animate`, `gsap-scrolltrigger`, `animation-performance`, `apple-design` |
| **6. The rest** | Projects 2 & 3, Sketchbook page, About, 404 | `prototype` (try variations), `find-animation-opportunities` |
| **7. Polish and test** | Accessibility, performance, SEO/share images, PDF export, analytics; **show it to 3 people for 60 seconds** and ask what they remember | `review-animations`, `impeccable audit`, `design:accessibility-review` |
| **8. Launch** | Domain, final résumé link, send it out | — |

**Order matters:** content and static layout first, then motion. A clean static site that's already "done" is the safety net. Motion is layered on top.

---

## 10. Decisions still open (for you)

1. **Project names**, and which one is the strongest (it goes first)
2. Status pill wording: *open to internships / full-time / freelance?* And when?
3. One page vs. a separate **About** page
4. **Print mode** (light theme): in v1 or later?
5. Which ambitious idea to build first: **Object ↔ interface pairing**, **sketch → product morph**, or **redline mode**? (Pick one for v1.)
6. Domain name
7. Any projects under NDA (use the "on request" lock)?
