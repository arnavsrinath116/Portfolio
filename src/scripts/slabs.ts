import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/**
 * Hero slate slabs: the stack tilts toward the cursor with light raking
 * across the stone, and fans open as the hero scrolls (scrubbed).
 */
export function initSlabs({ reduce }: { reduce: boolean }) {
  const stack = document.querySelector<HTMLElement>('[data-slabs]');
  const hero = document.querySelector<HTMLElement>('[data-hero]');
  if (!stack || !hero) return;
  const slabs = Array.from(stack.querySelectorAll<HTMLElement>('[data-slab]'));
  if (reduce) return;

  // fan out sideways with scroll (never upward into the heading); scaled to the
  // screen so the back slab never slides off a phone's edge
  const k = Math.min(1, window.innerWidth / 1100);
  const spread = [
    { x: -110 * k, y: 6, r: -2.2 },
    { x: -54 * k, y: 3, r: -1 },
    { x: 6 * k, y: -4, r: 0.5 },
  ];
  gsap
    .timeline({
      scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom bottom', scrub: 0.8 },
      defaults: { ease: 'none' },
    })
    // CSS variables, so the scroll fan and the pointer tilt compose in one transform
    .to(slabs, {
      '--fx': (i: number) => `${spread[i].x}px`,
      '--fy': (i: number) => `${spread[i].y}px`,
      '--fr': (i: number) => `${spread[i].r}deg`,
      duration: 1,
    });

  if (!window.matchMedia('(hover: hover)').matches) return;

  // pointer tilt + raking light (smoothed)
  const target = { rx: 0, ry: 0, lx: 30, ly: 20 };
  const cur = { ...target };
  let raf = 0;
  const loop = () => {
    let moving = false;
    for (const k of ['rx', 'ry', 'lx', 'ly'] as const) {
      cur[k] += (target[k] - cur[k]) * 0.09;
      if (Math.abs(target[k] - cur[k]) > 0.01) moving = true;
    }
    slabs.forEach((s, i) => {
      const depth = 0.55 + i * 0.25; // front slab tilts most
      s.style.setProperty('--rx', `${(cur.rx * depth).toFixed(3)}deg`);
      s.style.setProperty('--ry', `${(cur.ry * depth).toFixed(3)}deg`);
      s.style.setProperty('--lx', `${cur.lx.toFixed(1)}%`);
      s.style.setProperty('--ly', `${cur.ly.toFixed(1)}%`);
    });
    raf = moving ? requestAnimationFrame(loop) : 0;
  };
  window.addEventListener(
    'pointermove',
    (e) => {
      const r = stack.getBoundingClientRect();
      const nx = (e.clientX - (r.left + r.width / 2)) / window.innerWidth; // -0.5..0.5
      const ny = (e.clientY - (r.top + r.height / 2)) / window.innerHeight;
      target.ry = Math.max(-1, Math.min(1, nx * 2)) * 7;
      target.rx = Math.max(-1, Math.min(1, -ny * 2)) * 6;
      target.lx = ((e.clientX - r.left) / r.width) * 100;
      target.ly = ((e.clientY - r.top) / r.height) * 100;
      if (!raf) raf = requestAnimationFrame(loop);
    },
    { passive: true },
  );
  ScrollTrigger.refresh();
}
