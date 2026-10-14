import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/**
 * One guiding line, drawn by scroll from the work section, through the
 * skills, down to the contact slab. It weaves through the margins and passes
 * behind the slate panels; an accent pen tip rides its leading end.
 */
const NS = 'http://www.w3.org/2000/svg';

type P = { x: number; y: number };

/** Smooth path through points (Catmull–Rom → cubic Bézier). */
export function spline(pts: P[]) {
  let d = `M${pts[0].x},${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const c1 = { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 };
    const c2 = { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 };
    d += ` C${c1.x},${c1.y} ${c2.x},${c2.y} ${p2.x},${p2.y}`;
  }
  return d;
}

/**
 * The same curve as spline(), evaluated in JS: the path string plus a lookup
 * table of points and running length. Reading positions from the table is
 * constant-time; SVG getPointAtLength() re-walks the whole path on every call,
 * which on a long line costs milliseconds per call.
 */
export function sampleSpline(pts: P[], spacing = 6) {
  const xs: number[] = [pts[0].x];
  const ys: number[] = [pts[0].y];
  const ls: number[] = [0];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const c1 = { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 };
    const c2 = { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 };
    // a sample every few pixels along the segment, so steps are never visible
    const steps = Math.min(600, Math.max(12, Math.ceil(Math.hypot(p2.x - p1.x, p2.y - p1.y) / spacing)));
    for (let k = 1; k <= steps; k++) {
      const t = k / steps;
      const u = 1 - t;
      const x = u * u * u * p1.x + 3 * u * u * t * c1.x + 3 * u * t * t * c2.x + t * t * t * p2.x;
      const y = u * u * u * p1.y + 3 * u * u * t * c1.y + 3 * u * t * t * c2.y + t * t * t * p2.y;
      const n = xs.length - 1;
      ls.push(ls[n] + Math.hypot(x - xs[n], y - ys[n]));
      xs.push(x);
      ys.push(y);
    }
  }
  return { d: spline(pts), xs, ys, ls, total: ls[ls.length - 1] };
}

/** A point at a given length along a sampled spline, blended between the two nearest samples. */
export function pointAtLength(s: { xs: number[]; ys: number[]; ls: number[] }, len: number) {
  const { xs, ys, ls } = s;
  if (len <= 0) return { x: xs[0], y: ys[0] };
  let lo = 0;
  let hi = ls.length - 1;
  if (len >= ls[hi]) return { x: xs[hi], y: ys[hi] };
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (ls[mid] < len) lo = mid;
    else hi = mid;
  }
  const f = (len - ls[lo]) / (ls[hi] - ls[lo] || 1);
  return { x: xs[lo] + (xs[hi] - xs[lo]) * f, y: ys[lo] + (ys[hi] - ys[lo]) * f };
}

export function initGuide({ reduce }: { reduce: boolean }) {
  const flow = document.querySelector<HTMLElement>('[data-flow]');
  const svg = document.querySelector<SVGSVGElement>('[data-guide]');
  const head = document.querySelector<HTMLElement>('.work-head');
  // the three work tiles by position: the lead slab, then the two stacked beside it
  const product = document.querySelector<HTMLElement>('[data-slot="a"]');
  const ux = document.querySelector<HTMLElement>('[data-slot="b"]');
  const hmi = document.querySelector<HTMLElement>('[data-slot="c"]');
  const skills = document.querySelector<HTMLElement>('[data-skills]');
  const contact = document.querySelector<HTMLElement>('[data-contact]');
  if (!flow || !svg || !head || !product || !ux || !hmi || !contact) return;

  const path = document.createElementNS(NS, 'path');
  path.setAttribute('class', 'guide-path');
  const tip = document.createElementNS(NS, 'circle');
  tip.setAttribute('class', 'guide-tip');
  tip.setAttribute('r', '4');
  const halo = document.createElementNS(NS, 'circle');
  halo.setAttribute('class', 'guide-halo');
  halo.setAttribute('r', '10');
  svg.append(path, halo, tip);

  let st: ScrollTrigger | null = null;

  const build = () => {
    st?.kill();
    const f = flow.getBoundingClientRect();
    // layout box, ignoring any scroll-driven y offset GSAP has applied
    const rel = (el: HTMLElement) => {
      const r = el.getBoundingClientRect();
      const t = getComputedStyle(el).transform; // live translate, transitions included
      const dy = t && t !== 'none' ? new DOMMatrixReadOnly(t).m42 : 0;
      return { l: r.left - f.left, r: r.right - f.left, t: r.top - f.top - dy, b: r.bottom - f.top - dy, w: r.width, h: r.height };
    };
    const W = f.width;
    svg.setAttribute('viewBox', `0 0 ${W} ${f.height}`);
    svg.setAttribute('width', String(W));
    svg.setAttribute('height', String(f.height));

    const hd = rel(head);
    const pr = rel(product);
    const u = rel(ux);
    const hm = rel(hmi);
    const c = rel(contact);
    const sk = skills ? rel(skills) : null;
    const margin = Math.max(14, hd.l * 0.45);

    const pts: P[] = [
      { x: margin, y: hd.t - 70 },
      { x: hd.l + hd.w * 0.42, y: hd.t - 30 },
      { x: pr.l + pr.w * 0.55, y: pr.t + pr.h * 0.42 }, // behind the large slab
      { x: Math.min(W - margin, u.r + (W - u.r) * 0.5), y: (u.b + hm.t) / 2 }, // out in the right margin
      { x: hm.l + hm.w * 0.4, y: hm.t + hm.h * 0.6 }, // behind the HMI slab
      ...(sk
        ? [
            { x: margin, y: (Math.max(pr.b, hm.b) + sk.t) / 2 }, // across the gap, left margin
            { x: sk.l + sk.w * 0.58, y: sk.t + sk.h * 0.45 }, // behind the skill tiles
            { x: W - margin, y: (sk.b + c.t) / 2 }, // out in the right margin
          ]
        : [{ x: margin, y: (Math.max(pr.b, hm.b) + c.t) / 2 }]),
      { x: c.l + c.w * 0.6, y: c.t }, // plugs into the contact slab
    ];
    const table = sampleSpline(pts);
    const { d, total } = table;
    path.setAttribute('d', d);
    path.setAttribute('pathLength', String(total)); // dash units match the table's length
    path.style.strokeDasharray = `${total}`;


    const set = (p: number) => {
      path.style.strokeDashoffset = `${total * (1 - p)}`;
      const pt = pointAtLength(table, total * p);
      for (const el of [tip, halo]) {
        el.setAttribute('cx', String(pt.x));
        el.setAttribute('cy', String(pt.y));
      }
      const on = p > 0.002 && p < 0.998 ? 1 : 0;
      tip.style.opacity = halo.style.opacity = String(on);
    };

    if (reduce) {
      set(1);
      return;
    }
    set(0);
    st = ScrollTrigger.create({
      trigger: flow,
      start: 'top 78%',
      end: 'bottom bottom',
      scrub: 0.9,
      onUpdate: (self) => set(self.progress),
    });
  };

  build();
  let timer = 0;
  new ResizeObserver(() => {
    clearTimeout(timer);
    timer = window.setTimeout(() => {
      build();
      ScrollTrigger.refresh();
    }, 200);
  }).observe(flow);

  // each grid's panels arrive together: one quick rise when the grid comes into view
  // (not scrubbed, so the small cards never trail behind the big one)
  if (!reduce) {
    document.querySelectorAll<HTMLElement>('[data-rise-group]').forEach((group) => {
      const panels = gsap.utils.toArray<HTMLElement>(group.querySelectorAll('[data-panel]'));
      if (!panels.length) return;
      gsap.set(panels, { '--rise': '90px', opacity: 0 });
      const tl = gsap.timeline({ scrollTrigger: { trigger: panels[0], start: 'top 80%', once: true } });
      // fade on an even curve so it reads; the rise eases out so it still lands quickly
      tl.to(panels, { opacity: 1, duration: 0.7, ease: 'power1.out', stagger: 0.07 }, 0);
      tl.to(panels, { '--rise': '0px', duration: 0.85, ease: 'power3.out', stagger: 0.07 }, 0);
    });
  }
}
