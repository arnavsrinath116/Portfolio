# Heron AI ⭐ THE STANDARD

**Link:** https://heronaiapp.com · **Made by:** the agency Bearplus · **Built with:** Webflow + GSAP (ScrollTrigger, SplitText, TextPlugin) + Lenis smooth scroll + Swiper · **Saved:** 2026-10-12
**Role:** **the baseline for my portfolio,** especially **colors**, type and layout. Keep this look, but **improve the animations and the user flow**

> Theme: an **architect's blueprint on paper.** Warm off-white paper, ink-dark text, hairline grid lines, monospace annotations, and **one** hot orange-red accent used sparingly.

## 🎨 Color system (pulled from their CSS variables + sampled pixels)

| Role | Their token | Hex | Contrast on paper | Notes |
|---|---|---|---|---|
| **Paper (background)** | (textured image) | `#F5F4EF` | — | Warm off-white with a subtle paper grain. Never pure white |
| Paper alt / raised | — | `#F2F2F1` / `#EFEFEF` | — | Slightly different cells and cards |
| **Ink (primary text)** | `--content--primary` | `#282828` | 13.4:1 ✅ | Never pure black |
| Ink secondary | `--content--secondary` | `#414140` | 9.3:1 ✅ | Body copy |
| Ink tertiary | `--content--terriary` | `#282828` @ 72% | ~5.8:1 ✅ | Paragraphs, descriptions |
| Granite | `--content--granite-gray` | `#626260` | 5.6:1 ✅ | Labels, captions |
| Surface gray | `--content--surface` | `#72726F` | 4.4:1 ⚠️ | Large text only |
| **Hairline / muted** | `--content--border` | `#B3B3AF` | 1.9:1 ❌ (as text) | **Grid lines and borders only.** They also use it for gray "not yet revealed" text |
| **Brand accent** | `--content--brand` | `#FA3600` | 3.4:1 ⚠️ | Orange-red: CTAs, markers, progress line, highlights. **Only large text and UI shapes** |
| Accent (illustration) | — | `#DD6013` | 3.3:1 | Softer orange in illustrations |

### Fixes I need for accessibility
- Small orange text (like their "CONTACT US" link) fails. For accent **text** under 24px, use **`#D02C00`** (4.7:1 on paper) and keep `#FA3600` for shapes and big type
- White text on a `#FA3600` button is 3.8:1. Use **`#D02C00`** for the button background (white on it is 5.2:1) or make the label bigger and bolder
- For muted text that must be readable, use **`#6E6E6B`** (4.6:1), not `#B3B3AF`

### Dark mode (my addition; they don't have one)
| Role | Hex |
|---|---|
| Paper → Ink background | `#1C1C1B` |
| Ink → Paper text | `#F5F4EF` |
| Hairline | `#3A3A38` |
| Accent | `#FF5A26` (5.5:1 on `#1C1C1B`) |

## 🔤 Type
- **BT Grotesk** (400–700): all headings **UPPERCASE**, weight 600–700, **tight tracking (−2%)**, line-height 1.0. Body is 13–16px with slight negative tracking
- **Geist Mono** (500): tiny uppercase labels and annotations: `[01]`, `[SCROLL TO CONTINUE]`, `IBC 1015.3`, `001 INITIALIZE CORE SYSTEM`
- Free alternatives if I can't license BT Grotesk: **Geist** / **Inter Tight** / **Satoshi** for the grotesk, and **Geist Mono** (free) for the mono

## 📐 Layout language
- **Everything sits in a hairline grid** (`1px #B3B3AF`). The nav is literally grid cells, and the footer is a table of cells
- `+` crosshair marks at grid corners, dotted rulers on the edges, `[01]`-style numbering, and dimension lines with measurements. It all feels like a technical drawing
- Orange squares as small "markers" on the illustrations
- A marquee strip of mono labels (`FASTER ITERATIONS · FEWER MISTAKES · …`)

## 🎬 Animations they use

| # | Effect | Screenshot |
|---|---|---|
| 1 | **Drafting loader:** the building is **drawn line by line** while an **orange horizontal progress line** with a `%` sweeps across. A spec table and a `001…010` "boot log" type out | `sections/details/heron_loader-1/2/3*.jpg` |
| 2 | Loader → hero: line art **fills in** to the finished illustration, and the headline lines rise from a mask | `sections/hero/heron_hero.jpg` |
| 3 | Headings reveal **line by line from behind a mask** (SplitText), staggered across columns | `sites/heron_03-problem-cards-line-reveal.jpg` |
| 4 | **Pinned phrase that fills gray → ink** as you scroll ("RIGHT THERE WITH YOU" → "FOR THE WHOLE DESIGN") | `motion/heron_pinned-phrase-gray-to-black.jpg` |
| 5 | **Floor plan assembles:** wall segments slide in → furniture appears → dimension lines → orange violation markers `01 02 03` | `motion/heron_floorplan-1/2/3*.jpg` |
| 6 | **Interactive demo:** "[CLICK ON VIOLATION]" opens the issue | `motion/heron_floorplan-3…` |
| 7 | Orange callout cards pop onto an illustration in a cycle | `sites/heron_04-why-us-callouts.jpg` |
| 8 | **Grid lines draw first, then content fades in** (footer) | `sites/heron_05-footer-grid-drawing-empty.jpg` |
| 9 | Giant **outlined blueprint wordmark** with construction points, plus a 3D isometric logo | `sections/contact-footer/heron_footer-blueprint-wordmark.jpg` |
| 10 | Nav and button text roll on hover (text + clone, like Lusion) | — |

## ⚠️ Where I can do better (the brief: "better animations and user flow")

**User flow problems I noticed:**
1. **Too much scroll-jacking with nothing on screen.** The pinned phrases take several screens of scrolling for about 6 words, and the footer shows an empty grid before its content appears. Users think the page is broken
2. **Loader gate:** you wait for the drafting animation before you can see anything
3. **No sense of progress.** It's hard to know how long the page is or where you are
4. **The interactive demo is hidden** behind the pinned sections; the most impressive part comes late
5. **Low-contrast gray text** (`#B3B3AF`) used for content
6. **No reduced-motion** handling, and no dark mode

**My upgrades:**
- **Fast first paint:** show the hero immediately and run the drafting animation *on* the visible hero (≤1.5s), skippable. Or play it only on the first visit (remember it with `sessionStorage`)
- **Short pins:** keep every pinned section to ≤1.5 screens of scroll, and always have something moving or readable
- **A progress indicator** in blueprint style: a thin orange line or `[03/07]` section counter in the corner, plus a mini table of contents (ties in Midu's pinned table of contents)
- **Interactive demo early:** put my best project's live, clickable demo in the first 2 screens
- **Better motion system:** use Lusion's easing tokens for every hover and reveal. Draw grid lines *with* the content, not before it
- **Click-to-skip and keyboard navigation** for every pinned or animated section. Respect `prefers-reduced-motion`
- **Dark mode** (palette above): "blueprint on paper" by day and "blueprint on blackboard" by night. A personal touch they don't have

## Steal this ✅
- [ ] **The whole color system** (with my accessibility fixes + dark mode)
- [ ] **Blueprint / technical-drawing theme.** It's perfect for an engineer: hairline grid, `+` marks, `[01]` numbering, mono annotations, dimension lines
- [ ] **Drafting loader** (short, skippable) where my hero illustration draws itself
- [ ] **Line-by-line masked heading reveals**
- [ ] **Things that assemble on scroll** (like the floor plan). For me: a project's architecture diagram builds itself, piece by piece
- [ ] **Click-to-explore markers** on diagrams, e.g. click a part of my project's architecture to read about it
- [ ] **Outlined blueprint wordmark** of my name in the footer
- [ ] **A "boot log" in mono** (`001 LOAD PROJECTS…`), which also echoes Igloo's terminal feel
