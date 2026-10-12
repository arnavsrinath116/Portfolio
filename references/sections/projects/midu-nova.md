# Midu Studio: Nova case study

**Link:** https://midu.design/nova · **Built with:** Framer · **Saved:** 2026-10-12
**Use it for:** the layout of each project's detail / case study page

| File | Shows |
|---|---|
| `midu-nova_hero.png` | Hero: big centered title, tags + year, two-column intro, warm glow |
| `midu-nova_sticky-toc-overview.jpg` | Pinned left panel with the "Overview" step expanded |
| `midu-nova_sticky-toc-challenge.jpg` | The same panel once you've scrolled to "The Challenge" |
| `midu-nova_full-page.png` | The whole page top to bottom (the pinned elements look misplaced here because of how it was captured) |
| `../contact-footer/midu_footer-giant-wordmark.jpg` | Prev/next project buttons + footer with a giant gradient wordmark |

## Page structure

1. **Hero:** pinned in place while the content scrolls up over it like a curtain
   - 82px title, medium weight, tight letter-spacing (−4%)
   - Meta line: `Banking, Fintech • 2023` (14px, 60% white)
   - Two short intro paragraphs side by side
   - Warm golden glow fading down into near-black (`#050505`)
2. **Cover image:** full-width, 16px rounded corners
3. **Story + images, two columns:**
   - **Left:** a pinned table of contents with 3 steps (*Overview → The Challenge → Product Design*). The active step **expands into a card** showing its heading and paragraph, and the others collapse to small pills
   - **Right:** large image cards (16px radius, cream `#F5EBD0` backgrounds with phone mockups)
4. **Prev/next project buttons:** `← Kiwe Bank` / `Pawradise →`
5. **Footer:** local time + city ("02:28 PM London, UK"), tagline, CTA, links, and a huge "MIDU" wordmark fading from red to black

## Motion

- **Scroll-linked scale-up:** image cards start at `scale(0.85–0.95)` and grow to `1` as they enter the screen. Subtle, and it makes each image feel like it's arriving
- **Accordion table of contents:** the expanded step follows your scroll position
- **Pinned hero:** content scrolls up over it
- **Marquee:** scrolling text inside one of the image cards

## Steal this for my portfolio ✅

- [ ] **The pinned, expanding table of contents.** It fits the case study template in PORTFOLIO_RESEARCH.md §4 (Problem → Approach → Result), and the reader always knows where they are
- [ ] **Short story steps paired with big visuals.** Each step is a 1-line headline + 2 lines of text, and the images do the rest
- [ ] **A minimal hero:** title, tags and year, nothing else
- [ ] **Images that scale up as they scroll in.** Cheap to build and feels polished
- [ ] **Prev/next project buttons** at the bottom so people keep browsing
- [ ] **A consistent card style:** one radius (16px), one background color per project
- [ ] **A personal footer:** my local time, plus maybe a giant name wordmark
- [ ] **A small status pill in the nav,** like their "3/5 slots for October". For me: *"Open to internships · Summer 2027"* or whatever fits

## Change for mine ✏️

- Their content is visual-only (Dribbble-style mockups). As a developer I should add **live demo + GitHub buttons in the hero**, a **tech stack line** in the meta row, and real results or numbers
- Give each project its **own accent color** (they use cream for Nova). This becomes the glow color in the hero, which is an easy way to make each project feel personal
- On mobile, the table of contents should collapse to a small progress bar or tabs at the top

## Rough build notes

- Pinned panel: `position: sticky; top: …` on the left column
- Active step: an `IntersectionObserver` on each section, or GSAP ScrollTrigger with `onToggle`, expanding with a height + opacity transition (see the `animate` skill for easing and duration)
- Image scale-up: GSAP ScrollTrigger with `scrub`, scaling from 0.9 to 1, or Motion's `useScroll` + `useTransform`
- Respect `prefers-reduced-motion`: drop the scaling and keep simple fades
