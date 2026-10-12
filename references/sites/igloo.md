# Igloo Inc.

**Link:** https://www.igloo.inc · **Made by:** the studio [Abeto](https://abeto.co) (credited in the browser console) · **Saved:** 2026-10-12
**Category:** a full 3D, scroll-driven "experience" site. This is the extreme end, alongside Bruno Simon

> The whole site is one 3D scene. Scrolling moves a camera through a story: igloo → sky → ice crystals (their projects) → logo → portal. There's no normal page underneath.

## Screenshots, in scroll order

| # | File | What's happening |
|---|---|---|
| 1 | `sections/details/igloo_loader-1-crystal.jpg` | Loader: a tiny spinning ice crystal on flat gray |
| 2 | `sections/details/igloo_loader-2-wireframe.jpg` | The loader draws the igloo as a **wireframe blueprint** with numbered points while assets download |
| 3 | `sections/details/igloo_loader-3-materializing.jpg` | The wireframe fills in and starts glowing |
| 4 | `sections/hero/igloo_hero-1-reveal.jpg` | Cut to a photoreal snowy landscape |
| 5 | `sections/hero/igloo_hero-2-exploded-with-ui.jpg` | **Hero:** the igloo blocks float apart, glowing from inside, with number labels and lines between them. Minimal mono UI in the corners |
| 6 | `sites/igloo_scroll-1-camera-flight.jpg` | Camera flies up through clouds with rainbow light fringing |
| 7 | `sites/igloo_scroll-2-crystal-scrambled-text.jpg` | Ice crystals with **blurry, glitchy text** floating in the background |
| 8 | `sections/projects/igloo_project-frozen-in-ice.jpg` | **Projects:** each company's logo is *frozen inside an ice block*. Labels around it scramble ("LKVQCL") before resolving |
| 9 | `sections/details/igloo_logo-assembly.jpg` | Broken ring pieces fly together to form the Igloo logo |
| 10 | `sites/igloo_scroll-3-end-portal.jpg` | Ends by flying into a glowing tunnel |

## Design system

- **Palette:** almost monochrome. Cool grays (`#A0A5B1` background), white and ice-blue highlights. The **restraint** is what makes it look expensive
- **Type:** only **IBM Plex Mono** (Regular + Medium), small sizes, terminal/lab-report tone. Details like `// Copyright © 2026`, `////// Manifesto`, `Sound: Off`, `Scroll down to discover.`
- **Layout:** UI only in the four corners: logo top-left, manifesto top-right, scroll hint + sound toggle bottom-left. The 3D scene gets everything else

## Motion and interaction

- **Scroll moves the camera,** not the page. The page is exactly one screen tall, and the wheel drives the 3D timeline
- **The loader is part of the story:** the wireframe "blueprint" turns into the real scene. Nothing feels like waiting
- **Explode/assemble:** objects break into pieces and come back together (igloo blocks, logo rings)
- **Text scramble:** labels cycle through random characters before showing the real text
- **Post-processing:** bloom/glow, depth-of-field blur, chromatic aberration (the rainbow edges), floating particles
- **Sound design:** ambient music + wind + UI sounds for clicks, entering/leaving a project, text appearing. **Off by default,** with an easy toggle

## Tech (from the network requests and code)

- **Three.js** (~r165) with custom shaders, **GSAP** for timelines, a **Svelte** shell
- **KTX2/Basis** compressed textures + **Draco** compressed 3D models, so it stays loadable
- **MSDF text:** even the text is rendered *inside* WebGL, not as HTML
- **Web Audio** for the soundscape

## Steal this for my portfolio ✅

Pick 1 or 2 of these. Don't copy the whole thing.

- [ ] **Text scramble/decode effect** on headings, labels or my name. Cheap, fits a developer vibe, and works without 3D (GSAP ScrambleText is free now)
- [ ] **Monospace + monochrome UI** with corner-anchored labels (`// About`, `[01] Projects`). Instantly feels technical and intentional
- [ ] **A loader that tells a story**, e.g. a wireframe or code skeleton that "builds" into the hero, instead of a spinner
- [ ] **Projects as objects:** each project gets a 3D or 2.5D object (like the logos frozen in ice) that you click into
- [ ] **Explode → assemble** for my logo or initials on scroll
- [ ] **Optional sound, off by default** (subtle UI clicks)
- [ ] **Number labels connected by lines** on the hero, like a blueprint or diagram. Very "engineer"

## Watch out ⚠️

- **Accessibility:** all text is drawn in WebGL, so screen readers and search engines see an almost empty page (`<div id="webgl">`). No `prefers-reduced-motion` handling was found in the code. **For mine:** keep real HTML text on top of any 3D, and offer a reduced-motion version
- **Load time:** about 100 asset requests, and the scene took ~20–30s to fully appear here. Recruiters may not wait. **For mine:** show content immediately and load 3D progressively
- **Scale:** this was made by a specialist 3D studio. A realistic version for me is **one 3D hero moment** plus the cheaper tricks above (scramble text, mono UI, story loader)
- **Skills needed if I go this route:** the Three.js skills I held back (CloudAI-X/threejs-skills), plus the GSAP skills I already have
