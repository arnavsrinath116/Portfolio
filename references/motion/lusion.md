# Lusion

**Link:** https://lusion.co · **Built with:** Astro + WebGL canvas + its own smooth-scroll system · **Saved:** 2026-10-12
**Use it for:** **animation and interaction**: how things move, hover, load and transition

> Unlike Igloo, this is a *normal readable website* (real HTML text, a clear layout) with 3D and motion layered on top. That's a realistic model for my portfolio.

## Look (for context)
- Light lavender-gray background (`#F0F1FA`-ish), black text, **one accent: electric blue** (`rgb(0, 22, 236)`)
- Fonts: **Aeonik** (headings and UI, uppercase small labels) + **IBM Plex Mono** (details)
- Pill-shaped buttons, rounded media cards, small `+` markers on a grid at the section edges

## Animation catalog

| # | Effect | Screenshot | How it works / how to rebuild |
|---|---|---|---|
| 1 | **Rolling-digit loader:** black screen, progress bar in the middle, and a big `000→100` counter bottom-left whose digits **roll vertically like an odometer** | `lusion_01-loader-rolling-counter.jpg` | Each digit is a column of 0–9 that slides with `translateY`. GSAP or CSS transitions |
| 2 | **3D physics hero:** glossy blue/white/black "jack" shapes tumble in a rounded frame | `lusion_02-hero-3d-physics.jpg` | Three.js + a physics engine (e.g. Rapier, cannon-es) |
| 3 | **Cursor pushes objects + liquid smear:** moving the mouse shoves the shapes away and leaves a **fluid distortion trail**. They drift back afterwards | `lusion_03-hero-cursor-push-smear.jpg` | Mouse position becomes a force in the physics world, plus a fluid/displacement post-process shader |
| 4 | **Header tagline hides on scroll.** Hero card scrolls away. **Huge heading** with an indented first line ("Bold Ideas, / Brought to Life") | `lusion_04-hero-scroll-out-big-heading.jpg` | Simple scroll-triggered fade/translate |
| 5 | **Scroll-drawn 3D line:** a thick blue tube **draws itself as you scroll** and weaves *behind and in front of* page elements | `lusion_05-scroll-line-duotone-card.jpg` | WebGL tube along a curve, with draw length tied to scroll. Cheaper 2D version: SVG path + `stroke-dashoffset` scrubbed by GSAP ScrollTrigger |
| 6 | **Duotone media cards:** all images and videos tinted blue so the page stays on-brand; the media cycles inside the card | `lusion_06-card-before-expand.jpg` | CSS `mix-blend-mode` or an SVG duotone filter, removed when the card expands |
| 7 | **Card expands into the full-width reel:** the small card grows to full width as you scroll, color returns, and **"PLAY" and "REEL" slide apart** around a pill play button | `lusion_07-reel-expanded-split-text.jpg` | Pinned section + scroll-scrubbed scale/clip-path. Words translate outward on X |
| 8 | **`+` grid markers twist into `×`** while scrolling through the reel | `lusion_07-…` / `lusion_08-…` | Rotate 45° scrubbed by scroll. Tiny detail, very satisfying |
| 9 | **Letter-roll hover:** on hover, text slides up and an identical copy slides in from below (menu links, buttons) | (it's a hover effect, so no still) | `.text` → `translateY(-100%)`, `.clone` from `translateY(100%)` → `0`. **0.4s `cubic-bezier(0.4, 0, 0.1, 1)`** |
| 10 | **Dot-fill button:** the small dot in a pill button **scales ×32 to flood the button blue** while the label shifts left | (hover) | `dot: translateX(4em) scale(32)`. Background change delayed **0.3s**, **0.5s `cubic-bezier(0.35, 0, 0, 1)`** |
| 11 | **Menu as stacked glass cards:** "MENU ••" turns into "CLOSE ⋮", and three cards (links, newsletter, Labs) drop in with a stagger and frosted blur | `lusion_09-menu-opening.jpg`, `lusion_10-menu-open.jpg` | Staggered `translateY` + opacity, plus `backdrop-filter: blur()` |
| 12 | **Arrow nudges and underline draws** on links: arrows slide off and back in, and underlines grow with `scaleX(0→1)` | (hover) | Standard. Use the easing below |
| 13 | **Sound toggle:** a small line icon turns into a wave when sound is on | `lusion_09-…` (top right) | SVG path morph |

## Their motion "tokens" (pulled from their CSS) ⭐

This is the most useful part. Consistent timing is why everything feels like one system:

| Token | Value | Used for |
|---|---|---|
| `--ease-out-strong` | `cubic-bezier(0.35, 0, 0, 1)` (most used, 32×) | Buttons, fills, reveals |
| `--ease-in-out` | `cubic-bezier(0.4, 0, 0.1, 1)` (26×) | Text rolls, nav, arrows |
| `--ease-expo-out` | `cubic-bezier(0.16, 1, 0.3, 1)` | Big entrances |
| `--dur-fast` | `0.3s` | Small hovers |
| `--dur-base` | `0.4s` | Text roll, most hovers |
| `--dur-slow` | `0.5s` | Background fills |
| Delay | `0.3s` on fills | Lets the text move first, *then* the color floods |

Hover effects only apply when the device has a mouse, via `@media (hover: hover)`, so touch devices don't get stuck hover states. **Copy that.**

## Steal this for my portfolio ✅

- [ ] **Adopt their motion tokens** (the easings and durations above) as my site's motion system. This alone makes everything feel coherent
- [ ] **Letter-roll hover** on nav links and buttons
- [ ] **Dot-fill pill buttons** for main CTAs ("View project", "Get in touch")
- [ ] **Rolling-digit loader counter.** Pairs well with Igloo's "story loader" idea
- [ ] **Scroll-drawn line** that weaves through sections (SVG version, no 3D needed)
- [ ] **Small card → full-width expand on scroll** for a featured project or demo video
- [ ] **Duotone media in my accent color** for consistency, with full color on hover or expand
- [ ] **Cursor-reactive hero.** Even a 2D version (particles or shapes pushed by the mouse) gives the "alive" feeling
- [ ] **`+` grid markers** that rotate on scroll. Cheap detail, adds polish
- [ ] **Hovers only for mouse users,** via `@media (hover: hover)`

## Watch out ⚠️
- No `prefers-reduced-motion` rules were found in their CSS. **For mine:** turn off the scroll-scrubbed and physics effects for reduced-motion users
- Load time: the loader ran ~30s before the hero appeared here. **For mine:** keep the real content visible immediately and treat 3D as an enhancement
- The custom smooth scroll overrides native scrolling (`scrollY` stays 0). It feels smooth but can break keyboard and anchor navigation. If I use smooth scroll, **Lenis** keeps native scroll intact

## Skills to use when building these
`animate` (choosing each effect) · `gsap-scrolltrigger` (scrubbed line, card expand, pinning) · `gsap-plugins` (SplitText for letter effects) · `animation-performance` (keep 60fps) · `review-animations` (final check) · `apple-design` (springy cursor physics)
