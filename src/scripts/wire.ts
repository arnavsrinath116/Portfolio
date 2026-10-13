/**
 * Wireframe logos: each flat outline in an svg[data-wire] is sampled into
 * points, extruded into depth and drawn in perspective as a CAD wireframe —
 * front edge, faint back edge and the ribs between them. At rest the logos
 * sway slowly; over their tile they ease round to face the pointer, blending
 * between the two so nothing ever snaps.
 */
const NS = 'http://www.w3.org/2000/svg';
const DEPTH = 16; // extrusion, in logo units (the logo box is 100)
const STEP = 1.6; // sampling step along each outline
const RIB = 11; // spacing of the edges drawn along curved outlines
const IDLE_Y = 0.36; // idle sway, radians either side
const IDLE_X = -0.16; // resting tilt: seen a little from above
const SPRING = 60;
const DAMP = 2 * Math.sqrt(SPRING);
const CAM = 420; // perspective distance: long, so the extrusion stays true at an angle

type Pt = [number, number];
type Shape = { pts: Pt[]; ribs: number[] };
type Wire = {
  svg: SVGSVGElement;
  shapes: Shape[];
  front: SVGPathElement;
  back: SVGPathElement;
  ribs: SVGPathElement;
  ry: number; // current turn
  rx: number;
  vy: number; // turn velocity (spring)
  vx: number;
  px: number; // pointer over the host, -0.5..0.5
  py: number;
  hover: boolean;
  h: number; // 0 = idle sway, 1 = following the pointer; eased between
  phase: number;
  visible: boolean;
};

let measure: SVGSVGElement | null = null;

/** sample an outline: needs a rendered path, so measure in an always-rendered hidden svg */
function sample(d: string): Shape {
  if (!measure) {
    measure = document.createElementNS(NS, 'svg');
    measure.setAttribute('aria-hidden', 'true');
    measure.style.cssText = 'position:absolute;width:0;height:0;visibility:hidden;pointer-events:none';
    document.body.appendChild(measure);
  }
  const p = document.createElementNS(NS, 'path');
  p.setAttribute('d', d);
  measure.appendChild(p);
  const len = p.getTotalLength();
  const n = Math.max(8, Math.round(len / STEP));
  const pts: Pt[] = [];
  for (let i = 0; i < n; i++) {
    const q = p.getPointAtLength((len * i) / n);
    pts.push([q.x - 50, q.y - 50]);
  }
  p.remove();
  // edges like a CAD wireframe: one at every corner, and spaced along curves
  // (silhouette lines), none along straight runs
  const ang = (a: Pt, b: Pt) => Math.atan2(b[1] - a[1], b[0] - a[0]);
  const turn = pts.map((_, i) => {
    const a = pts[(i - 2 + n) % n];
    const b = pts[i];
    const c = pts[(i + 2) % n];
    return Math.abs(Math.atan2(Math.sin(ang(b, c) - ang(a, b)), Math.cos(ang(b, c) - ang(a, b))));
  });
  const ribs: number[] = [];
  const step = len / n;
  let run = RIB;
  for (let i = 0; i < n; i++) {
    const corner = turn[i] > 0.5 && turn[i] >= turn[(i - 1 + n) % n] && turn[i] > turn[(i + 1) % n];
    const curved = turn[i] > 0.04;
    run += step;
    if (corner || (curved && run >= RIB)) {
      ribs.push(i);
      run = 0;
    }
  }
  return { pts, ribs };
}

export function initWire({ reduce }: { reduce: boolean }) {
  const wires: Wire[] = [];

  document.querySelectorAll<SVGSVGElement>('[data-wire]').forEach((svg, i) => {
    const src = Array.from(svg.querySelectorAll<SVGPathElement>('.wire-src'));
    if (!src.length) return;
    const shapes = src.map((p) => sample(p.getAttribute('d')!));
    src.forEach((p) => p.remove());
    const mk = (cls: string) => {
      const el = document.createElementNS(NS, 'path');
      el.setAttribute('class', cls);
      return el;
    };
    const back = mk('wire-back');
    const ribs = mk('wire-ribs');
    const front = mk('wire-front');
    svg.append(back, ribs, front);
    const phase = i * 1.7;
    const w: Wire = {
      svg, shapes, front, back, ribs,
      ry: Math.sin(phase) * IDLE_Y, rx: IDLE_X, vy: 0, vx: 0,
      px: 0, py: 0, hover: false, h: 0, phase, visible: true,
    };
    wires.push(w);

    // turn to face the pointer over the tile (or card hero) that holds it
    const host = svg.closest<HTMLElement>('[data-wire-host]');
    if (host && !reduce) {
      host.addEventListener('pointermove', (e) => {
        if (e.pointerType === 'touch') return;
        const r = host.getBoundingClientRect();
        w.px = Math.max(-0.5, Math.min(0.5, (e.clientX - r.left) / r.width - 0.5));
        w.py = Math.max(-0.5, Math.min(0.5, (e.clientY - r.top) / r.height - 0.5));
        w.hover = true;
      });
      host.addEventListener('pointerleave', () => (w.hover = false));
    }
    draw(w);
  });
  if (!wires.length || reduce) return;

  const io = new IntersectionObserver((entries) =>
    entries.forEach((e) => {
      const w = wires.find((x) => x.svg === e.target);
      if (w) w.visible = e.isIntersecting;
    }),
  );
  wires.forEach((w) => io.observe(w.svg));

  let last = performance.now();
  const tick = (now: number) => {
    const dt = Math.max(0, Math.min(0.05, (now - last) / 1000));
    last = now;
    const t = now / 1000;
    const kh = 1 - Math.exp(-dt * 3.5);
    for (const w of wires) {
      if (!w.visible) continue;
      // idle: a slow turntable sway, a little different for each logo
      const iy = Math.sin(t * 0.42 + w.phase) * IDLE_Y;
      const ix = IDLE_X + Math.sin(t * 0.31 + w.phase * 1.3) * 0.05;
      // pointer: turn toward it, within a modest range
      const fy = w.px * 0.8;
      const fx = IDLE_X - w.py * 0.5;
      w.h += ((w.hover ? 1 : 0) - w.h) * kh;
      const ty = iy + (fy - iy) * w.h;
      const tx = ix + (fx - ix) * w.h;
      // critically damped spring: smooth start and stop, no overshoot
      w.vy += (SPRING * (ty - w.ry) - DAMP * w.vy) * dt;
      w.vx += (SPRING * (tx - w.rx) - DAMP * w.vx) * dt;
      w.ry += w.vy * dt;
      w.rx += w.vx * dt;
      draw(w);
    }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

function draw(w: Wire) {
  const cy = Math.cos(w.ry);
  const sy = Math.sin(w.ry);
  const cx = Math.cos(w.rx);
  const sx = Math.sin(w.rx);
  const proj = (x: number, y: number, z: number): Pt => {
    // rotate about y, then x, then perspective
    const x1 = x * cy + z * sy;
    const z1 = -x * sy + z * cy;
    const y1 = y * cx - z1 * sx;
    const z2 = y * sx + z1 * cx;
    const s = CAM / (CAM + z2);
    return [50 + x1 * s, 50 + y1 * s];
  };
  const f = (n: number) => n.toFixed(2);
  let front = '';
  let back = '';
  let ribs = '';
  const zf = -DEPTH / 2;
  const zb = DEPTH / 2;
  for (const sh of w.shapes) {
    const F = sh.pts.map(([x, y]) => proj(x, y, zf));
    const B = sh.pts.map(([x, y]) => proj(x, y, zb));
    front += `M${F.map((p) => `${f(p[0])} ${f(p[1])}`).join('L')}Z`;
    back += `M${B.map((p) => `${f(p[0])} ${f(p[1])}`).join('L')}Z`;
    for (const i of sh.ribs) ribs += `M${f(F[i][0])} ${f(F[i][1])}L${f(B[i][0])} ${f(B[i][1])}`;
  }
  w.front.setAttribute('d', front);
  w.back.setAttribute('d', back);
  w.ribs.setAttribute('d', ribs);
}
