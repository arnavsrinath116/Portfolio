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
        const range = document.createRange();
        range.selectNodeContents(el);
        const rects = Array.from(range.getClientRects());
        if (rects.length) {
          const l = Math.min(...rects.map((q) => q.left));
          const rr = Math.max(...rects.map((q) => q.right));
          r = new DOMRect(l, r.top, rr - l, r.height);
        }
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
