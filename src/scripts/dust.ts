/**
 * Ambient dust: fine sand-coloured specks drifting behind the whole page.
 *
 * Each speck rides a slow flow field (like air in a still room). The cursor
 * acts like a hand moving through that air: specks near it are carried along
 * its direction of travel, curl round it in a soft vortex, and are nudged out
 * of its core, then settle back into the drift. Scrolling gives a touch of
 * parallax. Kept deliberately faint so it adds depth, not noise.
 */

interface Speck {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number; // size (px)
  a: number; // base alpha
  depth: number; // 0.4..1: deeper specks move and react less
  seed: number;
}

// the speck colour is the sheet's ink, read from the theme (and re-read when it flips)
const inkOf = () => getComputedStyle(document.documentElement).getPropertyValue('--ink-rgb').trim() || '230 220 200';
const RADIUS = 190; // reach of the cursor's influence

export function initDust({ reduce }: { reduce: boolean }) {
  const canvas = document.createElement('canvas');
  canvas.className = 'dust-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.prepend(canvas);
  const ctx = canvas.getContext('2d');
  let ink = inkOf();
  document.addEventListener('themechange', () => (ink = inkOf()));
  if (!ctx) return;

  let W = 0;
  let H = 0;
  let dpr = 1;
  let specks: Speck[] = [];
  const mouse = { x: -1e4, y: -1e4, vx: 0, vy: 0, active: false, lastT: 0 };
  let scrollY = window.scrollY;
  let scrollV = 0;
  let raf = 0;
  let last = performance.now();
  const t0 = last;

  const spawn = (): Speck => {
    const depth = 0.4 + Math.random() * 0.6;
    return {
      x: Math.random() * W,
      y: Math.random() * H,
      vx: 0,
      vy: 0,
      r: (0.8 + Math.random() * 1.3) * depth,
      a: (0.16 + Math.random() * 0.34) * depth,
      depth,
      seed: Math.random() * 1000,
    };
  };

  const resize = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    // density scales with area, capped so large screens stay light
    const target = Math.min(520, Math.round((W * H) / 4200));
    while (specks.length < target) specks.push(spawn());
    specks.length = target;
    draw(0);
  };

  /** Slow, smooth flow field: gentle curls, mostly drifting up and across. */
  const flow = (x: number, y: number, t: number, seed: number) => {
    const a =
      Math.sin(x * 0.0021 + t * 0.07 + seed) +
      Math.sin(y * 0.0027 - t * 0.05) * 0.8 +
      Math.sin((x + y) * 0.0013 + t * 0.04) * 0.6;
    return { x: Math.cos(a) * 7 + 2.5, y: Math.sin(a) * 7 - 3 };
  };

  const step = (dt: number, t: number) => {
    const speed = Math.hypot(mouse.vx, mouse.vy);
    const wake = mouse.active ? Math.min(speed / 900, 1) : 0;
    for (const s of specks) {
      const f = flow(s.x, s.y, t, s.seed);
      let ax = (f.x * s.depth - s.vx) * 1.6;
      let ay = (f.y * s.depth - s.vy) * 1.6;

      if (mouse.active) {
        const dx = s.x - mouse.x;
        const dy = s.y - mouse.y;
        const d = Math.hypot(dx, dy);
        if (d < RADIUS && d > 0.01) {
          const fall = (1 - d / RADIUS) ** 2 * s.depth;
          const nx = dx / d;
          const ny = dy / d;
          // carried along by the moving hand (wind)
          ax += mouse.vx * 2.4 * fall * wake;
          ay += mouse.vy * 2.4 * fall * wake;
          // curl round it (vortex), stronger while moving
          const swirl = (40 + 260 * wake) * fall;
          ax += -ny * swirl;
          ay += nx * swirl;
          // eased out of the core so it flows around, not through
          const push = 90 * fall * (1 - d / RADIUS);
          ax += nx * push;
          ay += ny * push;
        }
      }
      // scroll parallax: deeper specks lag the page a little
      ay -= scrollV * 0.9 * (1.1 - s.depth);

      s.vx += ax * dt;
      s.vy += ay * dt;
      s.x += s.vx * dt;
      s.y += s.vy * dt;

      // wrap softly at the edges
      if (s.x < -10) s.x += W + 20;
      else if (s.x > W + 10) s.x -= W + 20;
      if (s.y < -10) s.y += H + 20;
      else if (s.y > H + 10) s.y -= H + 20;
    }
    // the hand's own motion fades when it stops
    const k = Math.exp(-dt * 6);
    mouse.vx *= k;
    mouse.vy *= k;
    scrollV *= Math.exp(-dt * 5);
  };

  function draw(t: number) {
    ctx.clearRect(0, 0, W, H);
    for (const s of specks) {
      let a = s.a;
      if (mouse.active) {
        // specks catch a little more light near the cursor
        const d = Math.hypot(s.x - mouse.x, s.y - mouse.y);
        if (d < RADIUS) a += (1 - d / RADIUS) * 0.35 * s.depth;
      }
      // a slow shimmer so the field feels alive at rest
      a *= 0.8 + 0.2 * Math.sin(t * 0.8 + s.seed);
      ctx.fillStyle = `rgb(${ink} / ${Math.min(a, 0.75).toFixed(3)})`;
      const size = Math.max(0.6, s.r * 1.6);
      ctx.fillRect(s.x - size / 2, s.y - size / 2, size, size);
    }
  }

  const html = document.documentElement;
  const loop = (now: number) => {
    // never negative (rAF timestamps can precede the kick), never huge
    const dt = Math.max(0, Math.min(0.05, (now - last) / 1000));
    last = now;
    const t = (now - t0) / 1000;
    // a case-study card covers the page: the dust holds still underneath and costs nothing
    if (!html.classList.contains('pm-open')) {
      step(dt, t);
      draw(t);
    }
    raf = requestAnimationFrame(loop);
  };

  window.addEventListener('resize', resize);
  resize();
  if (reduce) return; // a still field of specks, no motion

  window.addEventListener(
    'pointermove',
    (e) => {
      if (e.pointerType === 'touch') return;
      const now = performance.now();
      const dt = Math.max(1 / 240, (now - (mouse.lastT || now)) / 1000);
      if (mouse.active) {
        // smoothed pointer velocity (px/s)
        const vx = (e.clientX - mouse.x) / dt;
        const vy = (e.clientY - mouse.y) / dt;
        mouse.vx += (Math.max(-3000, Math.min(3000, vx)) - mouse.vx) * 0.35;
        mouse.vy += (Math.max(-3000, Math.min(3000, vy)) - mouse.vy) * 0.35;
      }
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.lastT = now;
      mouse.active = true;
    },
    { passive: true },
  );
  document.documentElement.addEventListener('pointerleave', () => {
    mouse.active = false;
  });
  window.addEventListener(
    'scroll',
    () => {
      const y = window.scrollY;
      scrollV += Math.max(-80, Math.min(80, y - scrollY)) * 4;
      scrollY = y;
    },
    { passive: true },
  );

  document.addEventListener('visibilitychange', () => {
    if (document.hidden && raf) {
      cancelAnimationFrame(raf);
      raf = 0;
    } else if (!document.hidden && !raf) {
      last = performance.now();
      raf = requestAnimationFrame(loop);
    }
  });
  raf = requestAnimationFrame(loop);
}
