# References

Screenshots, recordings and notes from sites I like. Save the file in the
right folder **and** add a row to the log at the bottom, so I remember *why*
I saved it. That note is what makes a reference useful later.

## Folders

| Folder | What goes here |
|---|---|
| `sites/` | Full-page screenshots of whole sites I like overall |
| `sections/hero/` | First screen: intro, name, headline, CTA |
| `sections/navigation/` | Menus, navbars, docks, command palettes |
| `sections/projects/` | Project grids, cards, case study pages |
| `sections/about/` | About and bio sections, photos, timelines |
| `sections/contact-footer/` | Contact sections and footers |
| `sections/details/` | Small touches: cursors, hover states, buttons, 404 pages, easter eggs |
| `motion/` | Screen recordings of animations and interactions (keep under ~10 MB, as `.mp4` or `.gif`) |
| `type-and-color/` | Fonts, type scales and color palettes I like |

## Naming

`sitename_what-it-shows.png`, lowercase with dashes. Examples:

- `rauno_dock-nav.png`
- `brittanychiang_project-list.png`
- `joshcomeau_like-button.mp4`

## Capturing on a Mac

- **⌘ + Shift + 4:** drag to screenshot an area
- **⌘ + Shift + 4, then Space:** screenshot one window
- **⌘ + Shift + 5:** record the screen (for `motion/`). Under *Options → Save to*, you can point it at this folder
- Full-page screenshot in Chrome: DevTools (⌘ + Option + I) → ⌘ + Shift + P → "Capture full size screenshot"
- Convert a large `.mov` recording to a small `.mp4`: `ffmpeg -i in.mov -vcodec libx264 -crf 28 -an out.mp4`

## Log

| Date | Site / link | File | What I like about it | Use it for |
|---|---|---|---|---|
| 2026-10-12 | [midu.design/nova](https://midu.design/nova) | `sections/projects/midu-nova*` ([notes](sections/projects/midu-nova.md)) | Pinned expanding table of contents beside big image cards, images scale up on scroll, minimal hero, prev/next buttons | **Project showcase / case study pages** |
| 2026-10-12 | [midu.design](https://midu.design/nova) | `sections/contact-footer/midu_footer-giant-wordmark.jpg` | Local time + city, giant gradient wordmark, clean link columns | Footer idea |
| 2026-10-12 | [sahor.work](https://sahor.work) | `sahor_*` in hero/, motion/, projects/, about/, contact-footer/ ([notes](sites/sahor.md)) | Real personal portfolio with the best flow: content first, dive into the hero 3D Mac, circle wipes light↔dark, work filter + grid/list toggle, "(Read)" cursor, contact form + book a call | **Site structure, navigation, project browsing, section transitions** |
| 2026-10-12 | [heronaiapp.com](https://heronaiapp.com) ⭐ | `heron_*` in sites/, hero/, details/, motion/, contact-footer/ ([notes](sites/heron.md), [palette](type-and-color/palette.md)) | Blueprint-on-paper theme, warm paper + ink + one orange accent, hairline grid, mono annotations, drafting loader, floor plan that assembles | **THE STANDARD: colors, type, layout.** Improve its animations and flow |
| 2026-10-12 | [lusion.co](https://lusion.co) | `motion/lusion_*` ([notes](motion/lusion.md)) | 13 animation patterns + their exact easing/duration tokens: rolling-digit loader, cursor physics hero, scroll-drawn line, card→full-width expand, letter-roll and dot-fill hovers, glass card menu | **Animation and interaction reference + motion tokens** |
| 2026-10-12 | [igloo.inc](https://www.igloo.inc) | `igloo_*` in sites/, hero/, projects/, details/ ([notes](sites/igloo.md)) | Full 3D scroll story, wireframe loader that builds the scene, projects frozen in ice, text scramble, mono monochrome UI, optional sound | **Overall vibe, hero, loader, text effects.** Take 1–2 ideas, not the whole thing |
| 2026-10-22 | [samaymaurya.com](https://samaymaurya.com) (via [Wall of Portfolios](https://www.wallofportfolios.in/portfolios/samay/)) ⭐ | `sections/about/samay_about-*` ([notes](sections/about/samay.md)) | About section as a pinned **fake browser window** whose tabs flip as you scroll: about me (polaroid, bio with inline icons, sticker chips), work log, travel journeys, playlist, gallery. Handwritten asides, "next: … ↓" pill, progress dashes | **My About section** |
| 2026-10-22 | [samaymaurya.com](https://samaymaurya.com) | `motion/samay_*` ([notes](motion/samay.md)) | The smoothest site I've saved: everything is **scroll-linked** (blur-to-focus word reveals, a 3D headset that flies at the camera into an iris, a curved work carousel, dark → light with mountains, a line that draws K2 at the end). Heavy Lenis (lerp 0.07, wheel ×0.8), Framer springs | **Motion and smoothness**, next to Lusion |
