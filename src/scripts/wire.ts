/**
 * Wireframe logos: each flat outline in an svg[data-wire] is sampled into
 * points, extruded into depth and drawn in perspective as a CAD wireframe —
 * front edge, faint back edge and the ribs between them. At rest the logos
 * sway slowly; over their tile they turn to face the pointer.
 */
const NS = 'http://www.w3.org/2000/svg';
const DEPTH = 16; // extrusion, in logo units (the logo box is 100)
const STEP = 1.6; // sampling step along each outline
const RIB = 11; // spacing of the edges drawn along curved outlines
const CAM = 240; // perspective distance

type Pt = [number, number];
type Shape = { pts: Pt[]; ribs: number[] };
type Wire = {
  svg: SVGSVGElement;
  shapes: Shape[];
  front: SVGPathElement;
  back: SVGPathElement;
  ribs: SVGPathElement;
  ry: number;
  rx: number;
  ty: number;
  tx: number;
  hover: boolean;
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
    const w: Wire = { svg, shapes, front, back, ribs, ry: -0.42, rx: -0.2, ty: -0.42, tx: -0.2, hover: false, phase: i * 1.7, visible: true };
    wires.push(w);

    // turn to face the pointer over the tile (or card hero) that holds it
    const host = svg.closest<HTMLElement>('[data-wire-host]');
    if (host && !reduce) {
      host.addEventListener('pointermove', (e) => {
        const r = host.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        w.hover = true;
        w.ty = px * 1.3;
        w.tx = -py * 0.9;
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
    const k = 1 - Math.exp(-dt * 6);
    for (const w of wires) {
      if (!w.visible) continue;
      if (!w.hover) {
        // idle: a slow turntable sway, a little different for each logo
        w.ty = Math.sin(t * 0.55 + w.phase) * 0.55;
        w.tx = -0.22 + Math.sin(t * 0.4 + w.phase * 1.3) * 0.08;
      }
      w.ry += (w.ty - w.ry) * k;
      w.rx += (w.tx - w.rx) * k;
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
