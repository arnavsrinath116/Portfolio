# Samay Maurya: motion and interaction

**Link:** https://samaymaurya.com · **Saved:** 2026-10-22 · About section notes: [sections/about/samay.md](../sections/about/samay.md)
**Why it matters:** the smoothest site in my references. Every big moment is **tied to the scroll** (it runs exactly as fast as you scroll, never on a timer you have to wait for), and the whole site tells one story: put on a headset → see the work → come back to the hills → "now I'm going to the mountains".

**Built with:** React (Vite) · **Lenis** smooth scroll · **Framer Motion** (scroll-linked values and springs) · **three.js** for the headset · Web Audio for optional sound. No GSAP.

## The motion, in scroll order

| # | Moment | What moves, and how | Frames |
|---|---|---|---|
| 1 | **Loader** | Orange screen, a `000%` counter bottom-left, mono labels in the corners ("visitor no. 81 · glad you dropped by"). At ~1% a construction line draws across; the wordmark **samay.** is drafted in thin guide lines and arcs, then **fills in solid** as the counter reaches 100% | `samay_01-loader-sketch-to-wordmark.jpg` |
| 2 | **Word-by-word blur reveal** | Big statements ("welcome to my *work section.*", "but first — put these on.") come in **one word at a time as you scroll**. Each word goes from **opacity 0.12–0.18, 5–6 px blur, 0.16–0.18 em lower → sharp and in place**. A squiggle underline draws itself in (`stroke-dashoffset`, 0.8 s) | `samay_02-scroll-blur-word-reveal.jpg` |
| 3 | **The headset** | A three.js **VR headset** appears small, **turns to face you** as you scroll, then **flies at the camera** until it fills the screen ("let's go look inside"). A **black circle (iris)** closes over it and you're "inside", on a dark page | `samay_03-headset-spin-zoom-iris.jpg` |
| 4 | **Work as a curved carousel** | Inside the headset, the case studies sit on a **curved screen**: a horizontal track that scrolls sideways as you scroll down, with each card **bending at the edges** like a wrap-around display. The cards are real UI. "More work" is a plain list at the end | `samay_04-curved-work-carousel.jpg` |
| 5 | **Dark → light** | "the work between the *case studies.*" blurs in on black, then the page **fades to his off-white paper** while a **mountain range** rises at the bottom, with labels for each category (mobile · web · AR/VR · shipped by me) | `samay_05-dark-to-light-mountains.jpg` |
| 6 | **UI wall → About** | A wall of phone screens, filterable by chip, scrolls up under a fade. The About heading slides in, and the **browser window rises and pins**; its tabs then flip with the scroll (see the about notes) | `samay_06-ui-wall-into-about.jpg` |
| 7 | **Outro** | "that's all from *my side.*" and "now I'm going to the *mountains.*" blur in word by word, then a **single line draws a mountain profile** across the page, peaking at **K2** with its height. It lands on the footer: "someday, *k2.*", résumé, email | `samay_07-outro-line-draws-k2.jpg` |

## The settings behind the smoothness

| What | His value | Mine now | Note |
|---|---|---|---|
| **Lenis** | `lerp: 0.07`, `wheelMultiplier: 0.8`, **off** for reduced motion | `lerp: 0.11` | Lower lerp = the page glides further after each wheel tick. ×0.8 means less distance per tick. Together the scroll feels heavier and calmer |
| **Main easing** | `cubic-bezier(.22, 1, .36, 1)` (used 28×) | **The same curve** (used 17×) | Same family already, so not the difference |
| **Overshoot ease** | `cubic-bezier(.34, 1.56, .64, 1)` for small pops (chips, stickers) | none | A small bounce on tiny things only |
| **Case study open** | Panel slides up from 100% with `scale(.97)` and opacity .5 → 1, `cubic-bezier(.16, 1, .3, 1)` | Card grows out of the clicked slab | Both good; his is simpler |
| **Springs** | Framer springs, e.g. `duration .42, bounce .16`; stiffness 220–550, damping 20–32 | GSAP tweens | Springs are why hovers and pops feel physical, not timed |
| **Hover / UI timing** | Mostly **0.16–0.2 s**, longer moves 0.3–0.45 s | similar | Fast feedback, slower travel |
| **Entrance** | opacity 0, `y: 10`, `blur(4px)` → 0 | rise + fade | The **blur** is the signature: things come *into focus*, not just into view |

## Why it feels so smooth
1. **Scroll-linked, not time-based.** The word reveals, headset, carousel and mountain line follow the scroll position directly, so there's never a lag or a wait, and scrolling back reverses everything exactly.
2. **Heavier smooth scroll** (lerp 0.07, wheel ×0.8) gives the whole site a calm, gliding pace.
3. **Only cheap properties move:** transform, opacity and a small blur. The headset is one canvas.
4. **One story, so transitions mean something:** the iris "puts you inside the headset", and the dark-to-light fade "takes you back outside".
5. **Small, consistent pacing cues:** "keep scrolling ↓" pills, progress dashes, and the pencil gauge on the right edge.
6. **Reduced motion respected:** smooth scroll turns off, and reveals become a plain fade.

## What I'd take for my site
- **The blur-to-focus word reveal** for my big section headings (Selected Work, Skills, the footer line). It suits a drawing coming into focus. Scroll-linked, words 0.15 → 1 opacity and 6 → 0 px blur.
- **A heavier Lenis:** try `lerp: 0.08` with `wheelMultiplier: 0.85` and compare with my current 0.11.
- **An "iris" or object-zoom section change:** the jet hologram could fly at the camera into the work section, like his headset.
- **A line that draws the ending:** a mountain/drawing line across the footer is very close to my blueprint style.
- **Springs with a little bounce** (`bounce ≈ 0.15`) for small pops: the dimension labels, chips, the view cube.

## What I wouldn't copy
- The **orange loader** you have to wait through.
- **Long pinned stretches:** the headset and the About tabs each take several screens of scrolling. Keep mine shorter, and let people click to jump.
