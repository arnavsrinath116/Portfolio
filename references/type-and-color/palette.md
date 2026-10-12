# Heron-based light palette ("Print mode")

> **Update 2026-10-12:** the main site is **dark** (slate black + sand white + orange). See [PLAN.md §2](../../PLAN.md). This light palette is kept for the optional **Print mode** (blueprint printed on paper).

# My portfolio palette (based on Heron AI)

Source: [Heron AI breakdown](../sites/heron.md). Their colors, with my accessibility fixes and a dark mode added.
Contrast ratios are checked against WCAG (4.5:1 for normal text, 3:1 for large text and UI).

```css
:root {
  /* Surfaces */
  --paper:        #F5F4EF;  /* page background (+ subtle grain texture) */
  --paper-raised: #EFEFEC;  /* cards, alt cells */

  /* Ink */
  --ink:          #282828;  /* headings, primary text      13.4:1 */
  --ink-2:        #414140;  /* body text                     9.3:1 */
  --ink-3:        #626260;  /* labels, captions              5.6:1 */
  --ink-muted:    #6E6E6B;  /* quiet but readable text       4.6:1 */

  /* Lines */
  --hairline:     #B3B3AF;  /* grid lines, borders ONLY (1.9:1 — never text) */

  /* Accent */
  --accent:       #FA3600;  /* shapes, markers, big type, progress line (3.4:1) */
  --accent-text:  #D02C00;  /* accent text < 24px, button backgrounds (4.7:1; white on it 5.2:1) */
}

[data-theme="dark"] {
  --paper:        #1C1C1B;
  --paper-raised: #242423;
  --ink:          #F5F4EF;
  --ink-2:        #D9D8D3;
  --ink-3:        #A3A39F;
  --ink-muted:    #8F8F8B;
  --hairline:     #3A3A38;
  --accent:       #FF5A26;  /* 5.5:1 on dark paper */
  --accent-text:  #FF6B3D;  /* 6.0:1 */
}
```

## Rules
- **One accent only.** Orange appears in <5% of the screen: CTAs, markers, the progress line, one highlight per section
- **Never pure white or pure black.** Always paper and ink
- Gray `--hairline` is for **lines**, never for text people need to read
- Every project can borrow the orange for its markers, but its *own* color appears only inside its media (screenshots, demos)

## Fonts
| Use | Font | Free? |
|---|---|---|
| Headings (UPPERCASE, 600–700, tracking −2%, line-height 1.0) | BT Grotesk → **Geist / Inter Tight** as free stand-ins | Geist ✅ |
| Labels and annotations (mono, uppercase, small) | **Geist Mono** | ✅ |
| Body | Same grotesk, 15–17px, slight negative tracking | ✅ |
