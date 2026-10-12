import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/**
 * Scroll measures the heading like a technical drawing: extension lines,
 * dimension lines with architectural ticks and counting values.
 * Every number is measured from the rendered type (CSS px → mm at 96 dpi).
 */
const NS = 'http://www.w3.org/2000/svg';
const PX_TO_MM = 25.4 / 96;
const TICK = 5;

type Attrs = Record<string, string | number>;
const make = <K extends keyof SVGElementTagNameMap>(tag: K, attrs: Attrs, parent: Element) => {
  const el = document.createElementNS(NS, tag);
  for (const k in attrs) el.setAttribute(k, String(attrs[k]));
  parent.appendChild(el);
  return el;
};

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
  const first = rects[0];
  const left = Math.min(...rects.map((r) => r.left)) - stage.left;
  const right = Math.max(...rects.map((r) => r.right)) - stage.left;
  const blockTop = el.getBoundingClientRect().top - stage.top;
  const baseline = blockTop + (lh - (fa + fd)) / 2 + fa;
  return { left: left, right: right, capTop: baseline - cap, baseline };
}

interface Built {
  tl: gsap.core.Timeline;
}

function hDim(
  svg: SVGSVGElement,
  tl: gsap.core.Timeline,
  at: number,
  x1: number,
  x2: number,
  fromY: number,
  y: number,
  label: string,
  value: number,
  labelBelow = false,
) {
  const g = make('g', { class: 'dim' }, svg);
  const up = y < fromY ? -1 : 1;
  const ext1 = make('line', { x1, y1: fromY + up * -6, x2: x1, y2: y + up * 6, pathLength: 1, class: 'ext' }, g);
  const ext2 = make('line', { x1: x2, y1: fromY + up * -6, x2, y2: y + up * 6, pathLength: 1, class: 'ext' }, g);
  const mid = (x1 + x2) / 2;
  const a = make('line', { x1: mid, y1: y, x2: x1, y2: y, pathLength: 1, class: 'dimline' }, g);
  const b = make('line', { x1: mid, y1: y, x2: x2, y2: y, pathLength: 1, class: 'dimline' }, g);
  const t1 = make('line', { x1: x1 - TICK, y1: y + TICK, x2: x1 + TICK, y2: y - TICK, class: 'tick' }, g);
  const t2 = make('line', { x1: x2 - TICK, y1: y + TICK, x2: x2 + TICK, y2: y - TICK, class: 'tick' }, g);
  const bg = make('rect', { class: 'label-bg' }, g);
  const txt = make('text', { x: mid, y: labelBelow ? y + 15 : y - 9, 'text-anchor': 'middle', class: 'dim-label' }, g);
  txt.textContent = `${label}${value.toFixed(1)}`;
  const bb = txt.getBBox();
  bg.setAttribute('x', String(bb.x - 6));
  bg.setAttribute('y', String(bb.y - 2));
  bg.setAttribute('width', String(bb.width + 12));
  bg.setAttribute('height', String(bb.height + 4));

  const counter = { v: 0 };
  tl.fromTo([ext1, ext2], { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.08, ease: 'none' }, at)
    .fromTo([a, b], { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.14, ease: 'none' }, at + 0.05)
    .fromTo([t1, t2], { scale: 0, transformOrigin: '50% 50%' }, { scale: 1, duration: 0.05, ease: 'none' }, at + 0.17)
    .fromTo([bg, txt], { opacity: 0 }, { opacity: 1, duration: 0.04, ease: 'none' }, at + 0.06)
    .fromTo(
      counter,
      { v: 0 },
      {
        v: value,
        duration: 0.16,
        ease: 'none',
        onUpdate: () => {
          txt.textContent = `${label}${counter.v.toFixed(1)}`;
        },
      },
      at + 0.06,
    );
}

function vDim(
  svg: SVGSVGElement,
  tl: gsap.core.Timeline,
  at: number,
  x: number,
  fromX: number,
  y1: number,
  y2: number,
  value: number,
) {
  const g = make('g', { class: 'dim' }, svg);
  const e1 = make('line', { x1: fromX - 6, y1, x2: x - 6, y2: y1, pathLength: 1, class: 'ext' }, g);
  const e2 = make('line', { x1: fromX - 6, y1: y2, x2: x - 6, y2, pathLength: 1, class: 'ext' }, g);
  const mid = (y1 + y2) / 2;
  const a = make('line', { x1: x, y1: mid, x2: x, y2: y1, pathLength: 1, class: 'dimline' }, g);
  const b = make('line', { x1: x, y1: mid, x2: x, y2: y2, pathLength: 1, class: 'dimline' }, g);
  const t1 = make('line', { x1: x - TICK, y1: y1 + TICK, x2: x + TICK, y2: y1 - TICK, class: 'tick' }, g);
  const t2 = make('line', { x1: x - TICK, y1: y2 + TICK, x2: x + TICK, y2: y2 - TICK, class: 'tick' }, g);
  const txt = make(
    'text',
    { x: x - 10, y: mid, 'text-anchor': 'middle', transform: `rotate(-90 ${x - 10} ${mid})`, class: 'dim-label' },
    g,
  );
  txt.textContent = `CAP ${value.toFixed(1)}`;
  const counter = { v: 0 };
  tl.fromTo([e1, e2], { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.07, ease: 'none' }, at)
    .fromTo([a, b], { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.1, ease: 'none' }, at + 0.05)
    .fromTo([t1, t2], { scale: 0, transformOrigin: '50% 50%' }, { scale: 1, duration: 0.04, ease: 'none' }, at + 0.13)
    .fromTo(txt, { opacity: 0 }, { opacity: 1, duration: 0.04, ease: 'none' }, at + 0.06)
    .fromTo(
      counter,
      { v: 0 },
      {
        v: value,
        duration: 0.12,
        ease: 'none',
        onUpdate: () => {
          txt.textContent = `CAP ${counter.v.toFixed(1)}`;
        },
      },
      at + 0.06,
    );
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
      hDim(svg, tl, 0.02, m1.left, m1.right, m1.capTop, m1.capTop - 34, 'W ', (m1.right - m1.left) * PX_TO_MM);
      // 2. cap height of the lettering
      vDim(svg, tl, 0.18, m1.left - 30, m1.left, m1.capTop, m1.baseline, (m1.baseline - m1.capTop) * PX_TO_MM);
      // 3. the indent of line two
      const oy = m2.capTop + (m2.baseline - m2.capTop) * 0.5;
      hDim(svg, tl, 0.32, m1.left, m2.left, oy, oy, 'OFFSET ', (m2.left - m1.left) * PX_TO_MM);
    } else {
      // below the word, so it never crosses the line above on narrow screens
      hDim(svg, tl, 0.04, m2.left, m2.right, m2.baseline, m2.baseline + 14, 'W ', (m2.right - m2.left) * PX_TO_MM, true);
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
