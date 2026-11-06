import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { hDim, vDim } from './dimension';

/**
 * Scroll-measured dimensions outside the hero. Tag an element:
 *   data-dim="w-top" | "w-bottom" | "h-left" | "h-right"   (space-separated)
 *   data-dim-text   measure the lettering, not the box
 * Each is drawn and counted up (in px, as measured) as the element scrolls into view.
 */
const OFFSET = 26; // distance from the object to its dimension line

// canvas only takes the keyword widths, so map the computed percentage onto the nearest one
const STRETCH: [number, string][] = [
  [50, 'ultra-condensed'], [62.5, 'extra-condensed'], [75, 'condensed'], [87.5, 'semi-condensed'], [100, 'normal'],
  [112.5, 'semi-expanded'], [125, 'expanded'], [150, 'extra-expanded'], [200, 'ultra-expanded'],
];
let ctx: CanvasRenderingContext2D | null = null;

/** How far a glyph's ink sits inside its advance box, on the left and on the right */
function bearings(ch: string, cs: CSSStyleDeclaration) {
  ctx ??= document.createElement('canvas').getContext('2d');
  if (!ctx) return { l: 0, r: 0 };
  ctx.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
  const pct = parseFloat(cs.fontStretch) || 100;
  const kw = STRETCH.reduce((a, b) => (Math.abs(b[0] - pct) < Math.abs(a[0] - pct) ? b : a))[1];
  (ctx as CanvasRenderingContext2D & { fontStretch: string }).fontStretch = kw;
  const m = ctx.measureText(ch);
  return { l: -m.actualBoundingBoxLeft, r: m.width - m.actualBoundingBoxRight };
}

/**
 * The lettering as it's seen: from the first letter's ink to the last letter's ink, and out to
 * the edges of any highlight block, which runs a little past the word it sits behind.
 */
function inkBox(el: HTMLElement) {
  const range = document.createRange();
  range.selectNodeContents(el);
  const rects = Array.from(range.getClientRects()).filter((q) => q.width > 0);
  if (!rects.length) return null;
  let l = Math.min(...rects.map((q) => q.left));
  let r = Math.max(...rects.map((q) => q.right));
  const text = (el.textContent ?? '').trim();
  if (text) {
    const cs = getComputedStyle(el);
    const t = cs.textTransform === 'uppercase' ? text.toUpperCase() : text;
    l += bearings(t[0], cs).l;
    r -= bearings(t[t.length - 1], cs).r;
  }
  el.querySelectorAll<HTMLElement>('.hl-block').forEach((b) => {
    const bb = b.getBoundingClientRect();
    const pb = getComputedStyle(b, '::before');
    l = Math.min(l, bb.left - parseFloat(pb.left || '0'));
    r = Math.max(r, bb.right - parseFloat(pb.right || '0'));
  });
  return { l, r };
}

export function initDims({ reduce }: { reduce: boolean }) {
  const host = document.querySelector<HTMLElement>('[data-flow]');
  const svg = document.querySelector<SVGSVGElement>('[data-dims]');
  if (!host || !svg) return;
  const targets = Array.from(document.querySelectorAll<HTMLElement>('[data-dim]'));
  let triggers: ScrollTrigger[] = [];

  const build = () => {
    triggers.forEach((t) => t.kill());
    triggers = [];
    svg.replaceChildren();
    const f = host.getBoundingClientRect();
    svg.setAttribute('width', String(f.width));
    svg.setAttribute('height', String(f.height));
    const narrow = f.width < 700; // phone margins are too tight for vertical dimensions

    for (const el of targets) {
      // layout box, or the lettering's extent. Subtract the element's live translate (entrance
      // rise, hover lift, and any CSS transition still running between them), not the variables:
      // mid-transition the variable and the drawn position disagree
      const t = getComputedStyle(el).transform;
      const dy = t && t !== 'none' ? new DOMMatrixReadOnly(t).m42 : 0;
      let r = el.getBoundingClientRect();
      if (el.hasAttribute('data-dim-text')) {
        const ink = inkBox(el);
        if (ink) r = new DOMRect(ink.l, r.top, ink.r - ink.l, r.height);
      }
      const box = { l: r.left - f.left, r: r.right - f.left, t: r.top - f.top - dy, b: r.bottom - f.top - dy };
      const tl = gsap.timeline({ paused: true, defaults: { ease: 'none' } });
      let at = 0;
      for (const s of (el.dataset.dim || '').split(/\s+/).filter(Boolean)) {
        if (s === 'w-top') hDim(svg, tl, at, box.l, box.r, box.t, box.t - OFFSET, 'W ', (box.r - box.l));
        else if (s === 'w-bottom')
          hDim(svg, tl, at, box.l, box.r, box.b, box.b + OFFSET, 'W ', (box.r - box.l), true);
        else if (s === 'h-left' && !narrow)
          vDim(svg, tl, at, box.l - OFFSET, box.l, box.t, box.b, 'H ', (box.b - box.t));
        else if (s === 'h-right' && !narrow)
          vDim(svg, tl, at, box.r + OFFSET, box.r, box.t, box.b, 'H ', (box.b - box.t));
        else continue;
        at += 0.14;
      }
      if (reduce) {
        tl.progress(1);
        continue;
      }
      triggers.push(
        ScrollTrigger.create({
          trigger: el,
          // clamp(): elements near the page end still finish drawing at max scroll
          start: 'clamp(top 88%)',
          end: 'clamp(top 42%)',
          scrub: 0.6,
          animation: tl,
        }),
      );
    }
  };

  build();
  let timer = 0;
  new ResizeObserver(() => {
    clearTimeout(timer);
    timer = window.setTimeout(() => {
      build();
      ScrollTrigger.refresh();
    }, 220);
  }).observe(host);
}
