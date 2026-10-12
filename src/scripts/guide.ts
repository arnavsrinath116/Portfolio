import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/**
 * One guiding line, drawn by scroll from the work section down to the
 * contact slab. It weaves through the margins and passes behind the slate
 * panels; an orange pen tip rides its leading end.
 */
const NS = 'http://www.w3.org/2000/svg';

type P = { x: number; y: number };

/** Smooth path through points (Catmull–Rom → cubic Bézier). */
function spline(pts: P[]) {
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

export function initGuide({ reduce }: { reduce: boolean }) {
  const flow = document.querySelector<HTMLElement>('[data-flow]');
  const svg = document.querySelector<SVGSVGElement>('[data-guide]');
  const head = document.querySelector<HTMLElement>('.work-head');
  const product = document.querySelector<HTMLElement>('[data-panel="product"]');
  const ux = document.querySelector<HTMLElement>('[data-panel="ux"]');
  const hmi = document.querySelector<HTMLElement>('[data-panel="hmi"]');
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
      const dy = parseFloat(getComputedStyle(el).getPropertyValue('--rise')) || 0;
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
    const margin = Math.max(14, hd.l * 0.45);

    const pts: P[] = [
      { x: margin, y: hd.t - 70 },
      { x: hd.l + hd.w * 0.42, y: hd.t - 30 },
      { x: pr.l + pr.w * 0.55, y: pr.t + pr.h * 0.42 }, // behind the large slab
      { x: Math.min(W - margin, u.r + (W - u.r) * 0.5), y: (u.b + hm.t) / 2 }, // out in the right margin
      { x: hm.l + hm.w * 0.4, y: hm.t + hm.h * 0.6 }, // behind the HMI slab
      { x: margin, y: (Math.max(pr.b, hm.b) + c.t) / 2 }, // across the gap, left margin
      { x: c.l + c.w * 0.6, y: c.t }, // plugs into the contact slab
    ];
    path.setAttribute('d', spline(pts));
    const total = path.getTotalLength();
    path.style.strokeDasharray = `${total}`;

    const set = (p: number) => {
      path.style.strokeDashoffset = `${total * (1 - p)}`;
      const pt = path.getPointAtLength(total * p);
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

  // panels arrive together: one quick rise when the grid comes into view (not scrubbed,
  // so the small cards never trail behind the big one)
  if (!reduce) {
    const panels = gsap.utils.toArray<HTMLElement>('[data-panel]');
    if (panels.length) {
      gsap.set(panels, { '--rise': '90px', opacity: 0 });
      const tl = gsap.timeline({ scrollTrigger: { trigger: panels[0], start: 'top 80%', once: true } });
      // fade on an even curve so it reads; the rise eases out so it still lands quickly
      tl.to(panels, { opacity: 1, duration: 0.7, ease: 'power1.out', stagger: 0.07 }, 0);
      tl.to(panels, { '--rise': '0px', duration: 0.85, ease: 'power3.out', stagger: 0.07 }, 0);
    }
  }
}
