import { gsap } from 'gsap';

/**
 * The liquid ring round a hovered link (.bracket) or control ([data-ring]): what the cursor used
 * to pour round a button, kept as the hover itself, with the cursor left alone.
 *
 * Each one gets an SVG ring: a rounded band following its own corners (a pill gets a pill, a
 * round logo a circle), just inside its box for text links and just outside for filled controls, drawn as flat comic line art (an
 * edge stroke under a narrower core stroke, on an offset shadow; colours in global.css). On
 * hover it runs round from the point nearest where the pointer came in, both ways at once, until
 * it closes; on leaving it drains back towards where the pointer left. Keyboard focus and the
 * header's current section show it closed. With reduced motion it simply appears.
 */
// where the band runs, from the element's box (negative: inside it). Text links keep it inside, so
// neighbouring links' rings, a few px apart in the header, never overlap; a control can set its
// own gap with data-ring="4" (outside, so the band rings a filled pill rather than covering it)
const PAD = -3;
const RADIUS = 6; // corner radius of the band on a square-cornered link
const OUT = 14; // room round the box for the band and its shadow

type Ring = {
  el: HTMLElement;
  svg: SVGSVGElement;
  paths: SVGPathElement[];
  w: number;
  h: number;
  pad: number;
  k: number; // the band's corner radius
  len: number; // how much of the ring is drawn, 0..1
  at: number; // where along the ring the drawn part is centred, 0..1
  hover: boolean;
};

const NS = 'http://www.w3.org/2000/svg';

export function initSelectRing({ reduce }: { reduce: boolean }) {
  const rings = new Map<HTMLElement, Ring>();

  // the band's path: a rounded rectangle, started at the middle of its top edge and run clockwise
  const shape = (r: Ring) => {
    const x0 = OUT - r.pad;
    const y0 = OUT - r.pad;
    const x1 = OUT + r.w + r.pad;
    const y1 = OUT + r.h + r.pad;
    const k = Math.min(r.k, (x1 - x0) / 2, (y1 - y0) / 2);
    const mx = (x0 + x1) / 2;
    return (
      `M${mx} ${y0}H${x1 - k}A${k} ${k} 0 0 1 ${x1} ${y0 + k}V${y1 - k}A${k} ${k} 0 0 1 ${x1 - k} ${y1}` +
      `H${x0 + k}A${k} ${k} 0 0 1 ${x0} ${y1 - k}V${y0 + k}A${k} ${k} 0 0 1 ${x0 + k} ${y0}Z`
    );
  };

  // where a point (in the link's own coordinates) falls along that path, 0..1
  const along = (r: Ring, x: number, y: number) => {
    const w = r.w + r.pad * 2;
    const h = r.h + r.pad * 2;
    const px = Math.min(Math.max(x + r.pad, 0), w);
    const py = Math.min(Math.max(y + r.pad, 0), h);
    // the nearest edge, then the distance along the perimeter from the top-middle, clockwise
    const dTop = py;
    const dRight = w - px;
    const dBottom = h - py;
    const dLeft = px;
    const m = Math.min(dTop, dRight, dBottom, dLeft);
    const P = 2 * (w + h);
    let s: number;
    if (m === dTop) s = px >= w / 2 ? px - w / 2 : P - (w / 2 - px);
    else if (m === dRight) s = w / 2 + py;
    else if (m === dBottom) s = w / 2 + h + (w - px);
    else s = w / 2 + h + w + (h - py);
    return (s / P) % 1;
  };

  const paint = (r: Ring) => {
    const L = Math.max(0, Math.min(1, r.len));
    const dash = L >= 0.999 ? '1 0' : `${L} ${1 - L}`;
    const off = String(-(r.at - L / 2));
    r.svg.style.visibility = L > 0.001 ? 'visible' : 'hidden';
    for (const p of r.paths) {
      p.style.strokeDasharray = dash;
      p.style.strokeDashoffset = off;
    }
  };

  const measure = (r: Ring) => {
    r.w = r.el.offsetWidth;
    r.h = r.el.offsetHeight;
    // follow the element's own corners, offset by the gap: a pill gets a pill, a circle a circle
    const br = getComputedStyle(r.el).borderTopLeftRadius;
    const own = br.endsWith('%') ? (parseFloat(br) / 100) * Math.min(r.w, r.h) : parseFloat(br) || 0;
    r.k = own > 0 ? Math.max(3, own + r.pad) : RADIUS;
    r.svg.setAttribute('width', String(r.w + OUT * 2));
    r.svg.setAttribute('height', String(r.h + OUT * 2));
    const d = shape(r);
    r.paths.forEach((p) => p.setAttribute('d', d));
    paint(r);
  };

  const shown = (r: Ring) => r.hover || r.el.matches(':focus-visible') || r.el.getAttribute('aria-current') === 'location';

  const run = (r: Ring, to: number, from?: { x: number; y: number }) => {
    if (from) {
      const b = r.el.getBoundingClientRect();
      r.at = along(r, from.x - b.left, from.y - b.top);
    }
    gsap.killTweensOf(r);
    if (reduce) {
      r.len = to;
      paint(r);
      return;
    }
    // it pours round quickly and settles; it drains a touch faster
    gsap.to(r, { len: to, duration: to ? 0.42 : 0.3, ease: to ? 'power3.out' : 'power2.in', onUpdate: () => paint(r) });
  };

  const sync = (r: Ring, from?: { x: number; y: number }) => run(r, shown(r) ? 1 : 0, from);

  document.querySelectorAll<HTMLElement>('.bracket, [data-ring]').forEach((el) => {
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('class', 'sel-ring');
    svg.setAttribute('aria-hidden', 'true');
    svg.style.left = `${-OUT}px`;
    svg.style.top = `${-OUT}px`;
    const paths = ['r-sh', 'r-edge', 'r-core'].map((c) => {
      const p = document.createElementNS(NS, 'path');
      p.setAttribute('class', c);
      p.setAttribute('pathLength', '1');
      svg.append(p);
      return p;
    });
    el.prepend(svg);
    // the ring sits behind the label, inside the element's own stacking context
    el.style.isolation = 'isolate';
    if (getComputedStyle(el).position === 'static') el.style.position = 'relative';
    const pad = el.dataset.ring ? parseFloat(el.dataset.ring) : PAD;
    const r: Ring = { el, svg, paths, w: 0, h: 0, pad: Number.isFinite(pad) ? pad : PAD, k: RADIUS, len: 0, at: 0.75, hover: false };
    rings.set(el, r);
    measure(r);

    el.addEventListener('pointerenter', (e) => {
      if (e.pointerType === 'touch') return;
      r.hover = true;
      sync(r, { x: e.clientX, y: e.clientY });
    });
    el.addEventListener('pointerleave', (e) => {
      if (e.pointerType === 'touch') return;
      r.hover = false;
      sync(r, { x: e.clientX, y: e.clientY });
    });
    el.addEventListener('focus', () => requestAnimationFrame(() => sync(r)));
    el.addEventListener('blur', () => sync(r));
    // the header marks the section you're reading
    new MutationObserver(() => sync(r)).observe(el, { attributes: true, attributeFilter: ['aria-current'] });
    sync(r);
  });

  // labels change size with fonts and the viewport
  const ro = new ResizeObserver((entries) => entries.forEach((e) => {
    const r = rings.get(e.target as HTMLElement);
    if (r) measure(r);
  }));
  rings.forEach((r) => ro.observe(r.el));
}
