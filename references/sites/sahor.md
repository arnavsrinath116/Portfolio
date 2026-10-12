# Sahor: personal portfolio

**Link:** https://sahor.work · **Who:** Sahor Debbarma, a product designer in London · **Built with:** Framer · **Saved:** 2026-10-12
**Why it matters:** the only *personal portfolio* in my references, and it has the **best user flow** of all of them. Use it as the model for **structure, navigation and project browsing**, and for the **light → dark section transitions**

> Monochrome (light gray `#F1F1F1` + black), a hairline 5-column grid (same idea as Heron), an elegant italic serif mixed with a clean sans, and a few big "wow" moments that never block the content.

## The flow (top to bottom)

| # | Section | What happens | Screenshot |
|---|---|---|---|
| 1 | **Intro** | Page starts **dark**, then the "lights turn on": it fades to light gray and the grid lines appear | `hero/sahor_hero-1-dark-intro.jpg` → `hero/sahor_hero-2-lights-on.jpg` |
| 2 | **Hero** | Wordmark *sahor*`.design` (italic serif + sans). Three tags `+Product Design +Visual Design +Motion`. A 3D **Macintosh** whose screen says *"hello"*. Custom dot cursor. Status pill **"✳ Open to work"** top-right | `hero/sahor_hero-2-lights-on.jpg` |
| 3 | **Dive into the screen** | Scrolling zooms **into the Mac's screen**, which becomes a grayscale field of daisies | `motion/sahor_01-scroll-into-mac-screen.jpg` |
| 4 | **Short bio** | Paragraph **fills gray → black** as you scroll | `motion/sahor_02…` → `motion/sahor_03…` |
| 5 | **Circle transition → Work** | A **black circle expands from the center** and floods the page dark | `motion/sahor_04-circle-reveal-to-dark.jpg` |
| 6 | **Selected Work** | Outlined italic *Selected* behind a solid **Work**. **Filter:** (All) Product · Websites · Experiments. **View:** (Grid) (List). Projects staggered across the grid; **thumbnails are autoplaying videos**; the cursor turns into a **"(Read)"** pill on hover | `projects/sahor_work-grid-read-cursor.jpg` |
| 7 | **List view** | Text rows (Title (Category) + one-line description). Hover a row → **preview appears on the right** + a small square marker. View state saved in the URL (`?list=yes`) | `projects/sahor_work-list-hover-preview.jpg` |
| 8 | **Circle closes → About** | The black circle **shrinks back** to light. Giant outlined italic *About* | `motion/sahor_05-circle-close-to-light.jpg` |
| 9 | **About** | Black-and-white photo + bio text that wraps around it | `about/sahor_about-photo-bio.jpg` |
| 10 | **Contact** | 3D flip phone labelled `phone.obj` like a selected object in a 3D app. *"If you've scrolled this far, we should probably talk."* Email link, **inline message form**, **(Book a Meeting)** button, giant outlined *Let's Talk* | `contact-footer/sahor_contact-lets-talk.jpg` |
| 11 | **Footer bar** | `Sahor Debbarma ✤ (WIP 2019 – Present)`, a playful "work in progress" date range | same |
| 12 | **Case study page** | Title + subtitle + meta row on the grid (Company / Industry / Duration) → demo video → a hatched **"🔒 Full case study available on request"** panel | `projects/sahor_case-study-hero-meta.jpg`, `projects/sahor_case-study-locked-nda.jpg` |

## Small details worth copying
- **Parentheses as a UI language:** `(Work) (About) (Contact)`, `(All)`, `(Grid)`, `(Read)`, `(Send)`, `(Book a Meeting)`. One consistent typographic idea everywhere
- **Nav text swaps to "(Clicked)"** after you click it, a tiny moment of feedback
- **Logo `sahor.dsn`** in mono, a short code-like handle
- **Mixed type:** Instrument Serif *italic* (display) + Inter (UI) + Bricolage Grotesque. Outlined (stroke-only) giant italic words as section titles

## Why the flow is better than Heron's
1. **Content first.** No loader gate. The hero is there immediately, and the intro "lights on" fade is under a second
2. **Work appears within ~3 scrolls,** and you can **filter and switch views** to browse your way
3. **Wow moments run *alongside* the scroll,** not as long empty pinned sections (the dive into the Mac, the circle wipes)
4. **Clear section boundaries:** the light → dark → light circles make it obvious you've moved from intro to work to about
5. **Several ways to get in touch** at the end: email, form, booking a meeting
6. **NDA-friendly case studies:** public summary + video, with the full study on request

## Weaknesses / what I'd do differently
- No sense of progress either (no section counter)
- The bio fill and the dive into the screen still need several scrolls. Keep my versions shorter
- Nothing tells you about filters or list view until you reach them
- Monochrome only. **Mine adds Heron's orange accent** for CTAs and active states

## Steal this ✅
- [ ] **Overall information architecture:** Hero → short bio → **Work (filter + grid/list)** → About → Contact (form + email + book a call)
- [ ] **Circle wipe transition** between light and dark sections, in both directions. With Heron's palette: paper → ink for the Work section, then back to paper
- [ ] **A 3D object in the hero that you scroll *into*.** For me as a developer: a retro terminal or laptop whose screen shows code / `hello`, then the camera dives in
- [ ] **Filter + Grid/List toggle** for projects, with state in the URL
- [ ] **A cursor label on hover** ("(Read)", or "(View case)" for mine)
- [ ] **Autoplaying muted video thumbnails** for projects
- [ ] **"Open to work" status pill** in the nav (same idea as Midu's "slots" pill)
- [ ] **Friendly last-section copy:** "If you've scrolled this far, we should probably talk."
- [ ] **A `.obj`-style label** on a 3D object. Nerdy detail, fits a developer
- [ ] **"WIP 2019 – Present"** footer line for personality
- [ ] **Case study meta row** (Role / Stack / Duration for mine) and a "full write-up on request" option for private work
