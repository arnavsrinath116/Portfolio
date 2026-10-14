import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { hDim, vDim } from './dimension';

/**
 * Scroll measures the heading like a technical drawing: extension lines,
 * dimension lines with architectural ticks and counting values.
 * Every number is measured from the rendered type, in CSS px.
 */
interface Metrics {
  left: number;
  right: number;
  capTop: number;
  baseline: number;
}

/** Glyph-accurate cap height and baseline for a single-line block of text. */
function measureLine(el: HTMLElement, stage: DOMRect): Metrics {
  const cs = getComputedStyle(el);
  const fs = parseFloat(cs.fontSize);
  const lh = parseFloat(cs.lineHeight) || fs;
  const c = document.createElement('canvas').getContext('2d')!;
  c.font = `${cs.fontWeight} ${fs}px ${cs.fontFamily}`;
  (c as CanvasRenderingContext2D & { fontStretch: string }).fontStretch = 'ultra-expanded';
  const m = c.measureText('H');
  const fa = m.fontBoundingBoxAscent;
  const fd = m.fontBoundingBoxDescent;
  const cap = m.actualBoundingBoxAscent;

  const range = document.createRange();
  range.selectNodeContents(el);
  const rects = Array.from(range.getClientRects());
  const left = Math.min(...rects.map((r) => r.left)) - stage.left;
  const right = Math.max(...rects.map((r) => r.right)) - stage.left;
  const blockTop = el.getBoundingClientRect().top - stage.top;
  const baseline = blockTop + (lh - (fa + fd)) / 2 + fa;
  return { left: left, right: right, capTop: baseline - cap, baseline };
}

interface Built {
  tl: gsap.core.Timeline;
}

export function initHeroAnnotations({ reduce }: { reduce: boolean }) {
  const hero = document.querySelector<HTMLElement>('[data-hero]');
  const stageEl = document.querySelector<HTMLElement>('[data-hero-stage]');
  const svg = document.querySelector<SVGSVGElement>('[data-annotations]');
  const l1 = document.querySelector<HTMLElement>('[data-line="1"]');
  const l2 = document.querySelector<HTMLElement>('[data-line="2"]');
  const cue = document.querySelector<HTMLElement>('.scroll-cue');
  if (!hero || !stageEl || !svg || !l1 || !l2) return;

  let built: Built | null = null;
  let st: ScrollTrigger | null = null;

  const build = () => {
    st?.kill();
    built?.tl.kill();
    svg.replaceChildren();

    const stage = stageEl.getBoundingClientRect();
    const W = stage.width;
    const mobile = W < 700;
    const tl = gsap.timeline({ paused: true, defaults: { ease: 'none' } });
    const m1 = measureLine(l1, stage);
    const m2 = measureLine(l2, stage);

    if (cue) tl.to(cue, { opacity: 0, duration: 0.08 }, 0);

    if (!mobile) {
      // 1. overall width of line one
      hDim(svg, tl, 0.02, m1.left, m1.right, m1.capTop, m1.capTop - 34, 'W ', (m1.right - m1.left));
      // 2. cap height of the lettering
      vDim(svg, tl, 0.18, m1.left - 30, m1.left, m1.capTop, m1.baseline, 'CAP ', (m1.baseline - m1.capTop));
      // 3. the indent of line two
      const oy = m2.capTop + (m2.baseline - m2.capTop) * 0.5;
      hDim(svg, tl, 0.32, m1.left, m2.left, oy, oy, 'OFFSET ', (m2.left - m1.left));
    } else {
      // below the word, so it never crosses the line above on narrow screens
      hDim(svg, tl, 0.04, m2.left, m2.right, m2.baseline, m2.baseline + 14, 'W ', (m2.right - m2.left), true);
    }

    tl.to({}, { duration: 0.12 }); // hold the finished drawing before the sheet moves on
    built = { tl };

    if (reduce) {
      tl.progress(1);
      return;
    }
    st = ScrollTrigger.create({
      trigger: hero,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.6,
      animation: tl,
    });
  };

  build();
  let timer = 0;
  new ResizeObserver(() => {
    clearTimeout(timer);
    timer = window.setTimeout(build, 180);
  }).observe(stageEl);
}
