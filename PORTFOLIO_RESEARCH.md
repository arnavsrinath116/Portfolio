# Portfolio Website: Research and Ideas

A running collection of inspiration, resources and ideas for building my portfolio.
Add to it whenever something catches your eye. Last updated: 2026-10-12.

---

## 0. My goals (fill this in first)

- **Who it's for:** _recruiters / clients / college apps / other devs?_
- **What I want them to do:** _email me / view resume / check GitHub?_
- **Three words for how it should feel:** _e.g. clean, playful, technical_
- **Top 3 to 5 projects to feature:**
  1.
  2.
  3.
- **Must-have pages:** Home · Projects · About · Contact · (Blog?) · (Resume?)

### Design direction (set 2026-10-12)

| Layer | Reference | What it gives |
|---|---|---|
| **Standard: colors, type, layout** | [Heron AI](references/sites/heron.md) ⭐ | Blueprint on warm paper: ink text, one orange accent, hairline grid, mono annotations. [Palette →](references/type-and-color/palette.md) |
| **Structure and user flow** | [Sahor](references/sites/sahor.md) | Content-first order, work filter + grid/list, circle wipe light↔dark, scroll *into* a hero object, contact form + book a call |
| **Motion and interaction** | [Lusion](references/motion/lusion.md) | Easing and duration tokens, letter-roll and dot-fill hovers, scroll-drawn line, card → full-width expand |
| **Technical touches** | [Igloo](references/sites/igloo.md) | Text scramble, story loader, projects as objects |
| **Project case-study pages** | [Midu: Nova](references/sections/projects/midu-nova.md) | Pinned expanding table of contents + big image cards |

**Brief:** Heron's look, with **better animations** (Lusion-level polish) and a **better user flow** (fast first paint, short pins, visible progress, best work early, reduced-motion and dark mode).

---

## 1. Inspiration galleries (where to browse)

| Site | Best for |
|---|---|
| [Godly](https://godly.website) | Cutting-edge motion and interaction. Thumbnails are animated |
| [Awwwards](https://www.awwwards.com/websites/portfolio/) | Award-level sites. Skews toward high-budget, animation-heavy work |
| [SiteInspire](https://www.siteinspire.com) | Clean, simple, no-gimmick design. Filter by style and type |
| [Minimal Gallery](https://minimal.gallery) | Minimal, typography-led sites |
| [Land-book](https://land-book.com) | Landing pages and portfolios, filterable |
| [Lapa Ninja](https://www.lapa.ninja) | Landing page sections, useful for hero ideas |
| [One Page Love](https://onepagelove.com) | Single-page sites, a good fit for a simple portfolio |
| [emmabostian/developer-portfolios](https://github.com/emmabostian/developer-portfolios) | Huge community list of real dev portfolios (~25k ⭐). Has a "Random Portfolio" link |
| [Dribbble](https://dribbble.com/search/portfolio-website) | Visual mockups. Good for layout ideas, but not real, shipped sites |

**Tip:** screenshot anything you like into [`references/`](references/README.md) and log one line about *why* you like it.

---

## 2. Standout portfolios to study

What's worth taking from each one, so you're borrowing ideas and not copying sites:

| Portfolio | Style | What to learn from it |
|---|---|---|
| [Brittany Chiang](https://brittanychiang.com) | Dark, two-column, minimal | The best-known dev portfolio. Sticky left nav with a scrolling right column, and a clear experience timeline. v4 is [open source](https://github.com/bchiang7/v4) (but don't clone it, because recruiters recognize it) |
| [Josh W. Comeau](https://www.joshwcomeau.com) | Playful, whimsical | Micro-interactions, sound effects and interactive blog posts. A personality-driven site |
| [Bruno Simon](https://bruno-simon.com) | 3D / WebGL | You drive a car around a 3D world to explore his projects. The extreme end of "the site *is* the portfolio" |
| [Rauno Freiberg](https://rauno.me) | Design engineer, crafted | Dock-style bottom nav and attention to tiny details. Includes a photography section |
| [Paco Coursey](https://paco.me) | Ultra minimal | Proves that a plain text list can feel premium when the typography is right |
| [Emil Kowalski](https://emilkowal.ski) | Minimal + craft | Creator of Sonner and Vaul. Short write-ups about how he builds UI |
| [Lee Robinson](https://leerob.com) | Minimal, content-first | Writing-focused. His site's source is a popular Next.js starter |

**Patterns that show up again and again:**
- A one-line intro ("I build X for Y") above the fold
- 2 to 4 *featured* projects, each with a live demo and source links
- A short, human About section, sometimes with photos or hobbies
- Small, polished details (hover states, cursor effects, dark mode) instead of big flashy effects

---

## 3. Templates and starters (to learn from or fork)

| Template | Stack | Notes |
|---|---|---|
| [Starfolio](https://astro.build/themes/details/starfolio/) | Astro + React + Tailwind + shadcn | MIT. SEO-ready (OG tags, sitemap). Port of dillionverma's template |
| [dillionverma/portfolio](https://github.com/dillionverma/portfolio) | Next.js + shadcn + Magic UI | MIT. Edit a single config file to fill it in |
| [AstroWind](https://github.com/onwidget/astrowind) | Astro + Tailwind | Blog and portfolio in one. Very fast |
| [Astro themes directory](https://astro.build/themes/?categories%5B%5D=portfolio) | Astro | Browse many portfolio themes |
| [Vercel portfolio templates](https://vercel.com/templates/portfolio) | Next.js mostly | One-click deploy |

> ⚠️ Recruiters see the same templates over and over. If you use one, **change it heavily**: your own layout, colors, type and content.

---

## 4. Content: what to put on the site

### Suggested structure
1. **Hero:** name, one-line description, and a primary CTA (e.g. "View my work" or "Get in touch")
2. **Featured projects (3 to 5 max):** quality over quantity. Two strong projects beat three average ones
3. **About:** short and human. What you're into, what you're learning, and what you're looking for
4. **Skills:** brief. Don't lead with a giant logo wall of technologies
5. **Contact:** email + GitHub + LinkedIn (+ resume PDF)

### Project case study template
**Visual reference:** [Midu: Nova](references/sections/projects/midu-nova.md), with a pinned expanding table of contents and big image cards.

Use the same structure for every project so readers know where to look:

```
## Project Name
One-line summary + screenshot/GIF + [Live demo] [Source code]

**Problem:** What was the problem, and who had it?
**My role:** Solo? Team? What did *I* specifically do?
**Approach:** Key decisions, tech stack, architecture diagram, trade-offs,
              and the options I rejected and why
**Result:** What happened, with honest numbers if I have them (users, speed, etc.)
**What I learned / would do differently:**
```

- Aim for a **3 to 5 minute read**. Someone who reads only the image captions should still get the story
- Show the process and the struggle, not just the final product
- Write notes *while* building, not afterwards

---

## 5. Recruiter checklist: mistakes to avoid

- [ ] No broken links or dead demos (test every link before sharing)
- [ ] Not only tutorial projects (recruiters recognize the to-do app and the weather app)
- [ ] Every project explains the problem, my contribution, the stack and the result
- [ ] Every project links to its code
- [ ] LinkedIn, GitHub, resume and site all tell the same story
- [ ] Works well on mobile
- [ ] Loads fast, and the first impression lands in under 30 seconds
- [ ] Animations don't get in the way of the content
- [ ] Most relevant work comes first, tailored to the roles I want
- [ ] **Ship it.** Don't spend months perfecting it. You can iterate after launch

**Bonus:** polish your [GitHub profile README](https://docs.github.com/en/account-and-profile/setting-up-and-managing-your-github-profile/customizing-your-profile/managing-your-profile-readme) and pinned repos. Technical reviewers often check those first.

---

## 6. Tech stack options

| Option | Good if… | Trade-off |
|---|---|---|
| **Plain HTML/CSS/JS** | Learning fundamentals, simple site | More manual work for a blog or reusable components |
| **[Astro](https://astro.build)** | Content-focused, static, very fast. Easy MDX blog | Less suited to app-like interactivity (though React islands work) |
| **[Next.js](https://nextjs.org)** | Already know React, or want server features | Heavier than needed for a static portfolio |
| **[Framer](https://www.framer.com) / [Webflow](https://webflow.com)** | Design-first, no code | Less to show off as an engineer, and costs money |

**Leaning toward:** _Astro + Tailwind? Decide here._

---

## 7. Design resources

### Fonts
- [Fontshare](https://www.fontshare.com): free, high-quality fonts from Indian Type Foundry (e.g. Satoshi, General Sans, Cabinet Grotesk). Free for commercial use
- [Google Fonts](https://fonts.google.com): open the "Popular Pairings" section on any specimen page
- [Typewolf](https://www.typewolf.com): which fonts real sites are using, plus pairing ideas
- [Fontpair](https://www.fontpair.co): proven Google Font combinations
- Pairing ideas: **General Sans + Satoshi**, **Bricolage Grotesque + Inter**, **Instrument Serif + Inter**
- Rule of thumb: a characterful heading font plus a calm, readable body font

### Color
- [Realtime Colors](https://www.realtimecolors.com): preview a palette on a real page layout
- [Coolors](https://coolors.co): palette generator
- [Radix Colors](https://www.radix-ui.com/colors): accessible scales with dark mode built in
- [Tailwind color palette](https://tailwindcss.com/docs/colors)

### Icons, images and mockups
- [Lucide](https://lucide.dev), [Phosphor](https://phosphoricons.com) and [Simple Icons](https://simpleicons.org) (brand/tech logos)
- [Shots.so](https://shots.so): nice device and browser mockups for project screenshots
- [Haikei](https://haikei.app): SVG blobs, waves and gradients for backgrounds

---

## 8. UI and animation libraries

| Library | What it is |
|---|---|
| [shadcn/ui](https://ui.shadcn.com) | Copy-paste base components. Many other libraries build on it |
| [Magic UI](https://magicui.design) | 150+ animated components (React + Tailwind + Motion). Mostly free |
| [Aceternity UI](https://ui.aceternity.com) | Flashier effects (aurora, beams, 3D cards). Mix of free and paid |
| [React Bits](https://reactbits.dev) | 110+ animated text, background and card components. Supports reduced motion |
| [Motion](https://motion.dev) (formerly Framer Motion) | React animation library. Open source |
| [GSAP](https://gsap.com) | Powerful animation engine (ScrollTrigger, SplitText…). Now free, including plugins |
| [Lenis](https://lenis.darkroom.engineering) | Smooth scrolling |
| [Three.js](https://threejs.org) / [React Three Fiber](https://r3f.docs.pmnd.rs) | 3D, if I go the Bruno Simon route |

> Use these sparingly. One or two signature interactions beat effects everywhere, and you should always respect `prefers-reduced-motion`.

---

## 9. Hosting and domain

| Host | Free tier notes |
|---|---|
| [Cloudflare Pages](https://pages.cloudflare.com) | Unmetered static bandwidth. Commercial use allowed |
| [GitHub Pages](https://pages.github.com) | Free for public repos. Static only |
| [Netlify](https://www.netlify.com) | Beginner-friendly, including drag-and-drop deploy |
| [Vercel](https://vercel.com) | Best Next.js experience. Hobby plan is **personal/non-commercial only** |

- All of them support custom domains with free HTTPS
- Domain registrars: [Cloudflare Registrar](https://www.cloudflare.com/products/registrar/) (sells at cost) or [Porkbun](https://porkbun.com)
- Students: check the [GitHub Student Developer Pack](https://education.github.com/pack) for a free domain and other perks
- _Domain idea:_ `arnavsrinath.com`? `arnav.dev`?

---

## 10. Quality checklist (before launch)

**Performance and SEO**
- [ ] Run [PageSpeed Insights](https://pagespeed.web.dev) / Lighthouse and aim for 90+ in every category
- [ ] Optimize images (WebP/AVIF, correct sizes, lazy loading)
- [ ] Title, meta description and Open Graph image (so links look good when shared). See [opengraph.xyz](https://www.opengraph.xyz) to preview
- [ ] Favicon, sitemap and a useful 404 page

**Accessibility**
- [ ] Work through [The A11y Project checklist](https://www.a11yproject.com/checklist/)
- [ ] Use the [WebAIM contrast checker](https://webaim.org/resources/contrastchecker/)
- [ ] Keyboard-only navigation works with visible focus states
- [ ] Meaningful alt text and a logical heading order (h1 → h2 → h3)
- [ ] `prefers-reduced-motion` respected
- Note: a perfect Lighthouse score ≠ accessible. It only catches automated issues

---

## 11. Ideas backlog 💡

Features and ideas I might add (brainstorm here and pick the best 1 or 2):

- [ ] Dark/light mode toggle
- [ ] Command palette (⌘K) to jump around the site
- [ ] "Now" page: what I'm working on or learning right now ([nownownow.com](https://nownownow.com))
- [ ] Blog / notes for writing about what I build
- [ ] Interactive terminal-style section
- [ ] Live data: GitHub contributions, currently playing on Spotify, recent commits
- [ ] Project filter by tag (web, ML, mobile…)
- [ ] Easter egg (Konami code, hidden page)
- [ ] Guestbook
- [ ] Custom cursor or a subtle hover effect on project cards
- [ ] Downloadable resume that stays in sync with the site
- [ ] Photo, hobbies or "outside of code" section for personality

---

## 12. Open questions / decisions

- [ ] Which framework? (see §6)
- [ ] One page or multiple pages?
- [ ] Blog: yes or no for v1?
- [ ] Visual direction: minimal / playful / bold / 3D?
- [ ] Domain name?

---

## 13. Claude skills for building it (animation + personality)

Checked on GitHub on 2026-10-12. ⭐ = GitHub stars.

**Installed 2026-10-12 (from emilkowalski/skills):** animate, review-animations, find-animation-opportunities, animation-performance, prototype, apple-design.

**Already installed before that:** impeccable, emil-design-eng, design-taste-frontend, high-end-visual-design, gpt-taste, ui-ux-pro-max, brand, motion-framer, and all 8 official GSAP skills (core, timeline, scrolltrigger, plugins, react, frameworks, performance, utils).

### Tier 1: recommended
| Skill | Repo | What it does |
|---|---|---|
| `animate` | [emilkowalski/skills](https://github.com/emilkowalski/skills) (46k⭐, MIT) | Builds an animation by deciding things in order: should it animate at all, why, which tool, which curve and duration, how it gets interrupted and how it exits |
| `review-animations` | same | Strict review of motion code. Flags anything that feels cheap, janky or overdone |
| `find-animation-opportunities` | same | Scans the UI for spots that *should* animate (and rejects the ones that shouldn't). Proposes exact values |
| `animation-performance` | same | Keeps animations at 60fps by animating only cheap properties and finding why a frame drops |
| `apple-design` | same | Apple-style fluid, physical motion for the web: springs, drag/swipe, momentum, translucent materials |
| `prototype` | same | Builds several *genuinely different* versions of a section behind a picker so you can flip through them live. Good for finding your own style |
| `make-interfaces-feel-better` | [jakubkrehel/make-interfaces-feel-better](https://github.com/jakubkrehel/make-interfaces-feel-better) (3.6k⭐, MIT) | Small details that add up: hover states, optical alignment, concentric border radius, shadows, hit areas, icon and type polish |
| `frontend-design` | [anthropics/skills](https://github.com/anthropics/skills) (181k⭐) | Anthropic's official skill for distinctive design that doesn't look like a template |
| `web-design-guidelines` | [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills) (32k⭐) | Audits the finished UI against Vercel's interface guidelines (accessibility, UX, consistency) |

### Tier 2: depends on stack and ambition
| Skill | Repo | When to add it |
|---|---|---|
| `react-view-transitions` | [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills) | Smooth page-to-page and shared-element transitions, if using React/Next.js |
| `threejs-*` (10 skills) | [CloudAI-X/threejs-skills](https://github.com/CloudAI-X/threejs-skills) (3.5k⭐, no license listed) | A 3D hero or scene: fundamentals, animation, interaction, shaders, post-processing, loaders |
| `algorithmic-art` | [anthropics/skills](https://github.com/anthropics/skills) | p5.js generative art (flow fields, particles), for a hero background unique to you |
| `animation-vocabulary` | [emilkowalski/skills](https://github.com/emilkowalski/skills) | Turns "the bouncy thing when it opens" into the real term, so you can ask for exactly the effect you want |

### Tier 3: niche (smaller projects, review before installing)
| Repo | Notable skills | Notes |
|---|---|---|
| [iart-ai/web-animation-skills](https://github.com/iart-ai/web-animation-skills) (37⭐, MIT) | svg-animation, page-transition-animation, micro-interaction, lottie-animation, gsap-web (with Lenis smooth scroll), accessible-animation | Covers gaps (SVG, Lenis), but it's a very small project |
| [freshtechbro/claudedesignskills](https://github.com/freshtechbro/claudedesignskills) (1k⭐, MIT) | rive-interactive, spline-interactive, lottie-animations, barba-js, locomotive-scroll, react-spring-physics | Last updated Nov 2025. Its GSAP and Motion skills duplicate the official ones you already have |
| [bfollington/terma](https://github.com/bfollington/terma) (52⭐, CC-BY-SA) | shadertoy | GLSL shaders for wild backgrounds |

**Skip:** HyperFrames (made for video, not websites) and any extra GSAP/Framer skills (already covered).

---

## Sources

- [Colorlib: Best Developer Portfolios 2026](https://colorlib.com/wp/developer-portfolios/)
- [Elementor: Web Developer Portfolio Examples](https://elementor.com/blog/best-web-developer-portfolio-examples/)
- [DevPlaybook: Best Developer Portfolio Examples](https://devplaybook.cc/blog/best-developer-portfolio-examples-2025)
- [Rockstar Developer University: Portfolio Examples](https://rockstardeveloperuniversity.com/web-developer-portfolio-examples/)
- [Creative Bloq: Website galleries](https://www.creativebloq.com/web-design/best-web-design-galleries-3132175)
- [DesignerUp: Inspiration galleries](https://designerup.co/blog/incredible-places-to-find-web-design-trends-and-inspiration-for-2024/)
- [Peerlist: How to write a case study as a developer](https://blog.peerlist.io/p/how-to-write-a-case-study-as-a-developer)
- [Tobias van Schneider: Writing project case studies](https://vanschneider.com/blog/portfolio-tips/write-project-case-studies-portfolio/)
- [Turing: Software engineer portfolio tips](https://turing.com/blog/software-engineer-portfolio-tips)
- [CodeSignal: Avoiding portfolio mistakes](https://codesignal.com/learn/courses/technical-portfolio-and-personal-branding-for-cs-students-1/lessons/avoiding-portfolio-mistakes)
- [Appwrite: Best free static hosting](https://appwrite.io/blog/post/best-free-static-website-hosting)
- [is-pro.dev: GitHub Pages vs Vercel vs Netlify](https://is-pro.dev/compare/github-pages-vs-vercel-vs-netlify/)
- [Made Good Designs: Fontshare](https://madegooddesigns.com/fontshare/)
- [HubSpot: Font pairing tools](https://blog.hubspot.com/marketing/how-to-pick-the-perfect-font-pairings)
- [PkgPulse: React Bits vs Aceternity vs Magic UI](https://www.pkgpulse.com/guides/react-bits-vs-aceternity-magic-ui-2026)
- [Aceternity: Portfolio examples that stand out](https://www.aceternity.com/blog/10-portfolio-website-examples-that-stand-out-in-2024)
