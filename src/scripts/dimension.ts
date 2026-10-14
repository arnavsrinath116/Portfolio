import type { gsap } from 'gsap';

/**
 * Drafting dimensions drawn into an SVG and added to a (scroll-scrubbed)
 * timeline: extension lines, a dimension line that draws out from its centre,
 * architectural ticks, and a value that counts up in CSS pixels, written "px".
 */
export const NS = 'http://www.w3.org/2000/svg';
/** a measured length as it reads on the drawing: whole pixels, with the unit */
export const px = (v: number) => `${Math.round(v)} px`;
const TICK = 5;

type Attrs = Record<string, string | number>;
export const make = <K extends keyof SVGElementTagNameMap>(tag: K, attrs: Attrs, parent: Element) => {
  const el = document.createElementNS(NS, tag);
  for (const k in attrs) el.setAttribute(k, String(attrs[k]));
  parent.appendChild(el);
  return el;
};

const counterTween = (tl: gsap.core.Timeline, txt: SVGTextElement, label: string, value: number, at: number, d: number) => {
  const counter = { v: 0 };
  tl.fromTo(
    counter,
    { v: 0 },
    {
      v: value,
      duration: d,
      ease: 'none',
      onUpdate: () => {
        txt.textContent = `${label}${px(counter.v)}`;
      },
    },
    at,
  );
};

/** Horizontal dimension from x1 to x2, drawn at y, with extension lines from fromY. */
export function hDim(
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
  txt.textContent = `${label}${px(value)}`;
  const bb = txt.getBBox();
  bg.setAttribute('x', String(bb.x - 6));
  bg.setAttribute('y', String(bb.y - 2));
  bg.setAttribute('width', String(bb.width + 12));
  bg.setAttribute('height', String(bb.height + 4));

  tl.fromTo([ext1, ext2], { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.08, ease: 'none' }, at)
    .fromTo([a, b], { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.14, ease: 'none' }, at + 0.05)
    .fromTo([t1, t2], { scale: 0, transformOrigin: '50% 50%' }, { scale: 1, duration: 0.05, ease: 'none' }, at + 0.17)
    .fromTo([bg, txt], { opacity: 0 }, { opacity: 1, duration: 0.04, ease: 'none' }, at + 0.06);
  counterTween(tl, txt, label, value, at + 0.06, 0.16);
}

/** Vertical dimension from y1 to y2, drawn at x (either side of the object at fromX). */
export function vDim(
  svg: SVGSVGElement,
  tl: gsap.core.Timeline,
  at: number,
  x: number,
  fromX: number,
  y1: number,
  y2: number,
  label: string,
  value: number,
) {
  const g = make('g', { class: 'dim' }, svg);
  const side = x < fromX ? -1 : 1;
  const e1 = make('line', { x1: fromX + side * 6, y1, x2: x + side * 6, y2: y1, pathLength: 1, class: 'ext' }, g);
  const e2 = make('line', { x1: fromX + side * 6, y1: y2, x2: x + side * 6, y2, pathLength: 1, class: 'ext' }, g);
  const mid = (y1 + y2) / 2;
  const a = make('line', { x1: x, y1: mid, x2: x, y2: y1, pathLength: 1, class: 'dimline' }, g);
  const b = make('line', { x1: x, y1: mid, x2: x, y2: y2, pathLength: 1, class: 'dimline' }, g);
  const t1 = make('line', { x1: x - TICK, y1: y1 + TICK, x2: x + TICK, y2: y1 - TICK, class: 'tick' }, g);
  const t2 = make('line', { x1: x - TICK, y1: y2 + TICK, x2: x + TICK, y2: y2 - TICK, class: 'tick' }, g);
  const lx = x + side * 10;
  const txt = make(
    'text',
    { x: lx, y: mid, 'text-anchor': 'middle', transform: `rotate(-90 ${lx} ${mid})`, class: 'dim-label' },
    g,
  );
  txt.textContent = `${label}${px(value)}`;
  tl.fromTo([e1, e2], { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.07, ease: 'none' }, at)
    .fromTo([a, b], { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.1, ease: 'none' }, at + 0.05)
    .fromTo([t1, t2], { scale: 0, transformOrigin: '50% 50%' }, { scale: 1, duration: 0.04, ease: 'none' }, at + 0.13)
    .fromTo(txt, { opacity: 0 }, { opacity: 1, duration: 0.04, ease: 'none' }, at + 0.06);
  counterTween(tl, txt, label, value, at + 0.06, 0.12);
}
