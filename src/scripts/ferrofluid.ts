import { gsap } from 'gsap';

/**
 * Liquid-mercury cursor: ONE continuous body, never a chain of circles.
 *
 * The body is a single teardrop distance field (a round cone from the head to
 * a lagging tail). Springs drive the head (follows the pointer) and the tail
 * (follows the head), so speed stretches the drop and stopping lets it snap
 * back round. A damped "jelly" spring squashes the whole body on sharp turns
 * and clicks; a click also sends a ripple around its surface.
 *
 * Over an interactive element the same body flows onto the element's edge
 * and spreads around it from where you entered (Venom-style), thinning as it
 * goes; leaving drains it back into a drop that pulls away to the pointer.
 * Nearby elements tug the drop into a smooth bulge toward them.
 * The menu flood is the same liquid filling the screen.
 */

export interface Fluid {
  flood(open: boolean, x: number, y: number): Promise<void>;
}

const R = 11; // resting radius (px)
const R_WRAP = 4; // what is left of the drop once it has wrapped an element
const MAGNET_RANGE = 120;
const PAD = 6; // gap between an element and the liquid wrapped around it

const VERT = `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`;

const FRAG = `
precision highp float;
uniform vec2 uRes;
uniform float uDpr;
uniform float uTime;
uniform vec3 uHead;     // x, y, radius
uniform vec3 uTail;     // x, y, radius
uniform vec3 uWob;      // squash amount, squash angle, ripple amplitude
uniform vec3 uMag;      // dir.xy, bulge amplitude
uniform vec4 uRect;     // center.xy, half size.xy
uniform float uRectR;   // corner radius of the wrapped element (+ gap)
uniform float uRectP;   // how far the liquid has spread around (0..1)
uniform float uEntry;   // angle where it arrived
uniform float uRectOn;
uniform vec3 uFlood;    // center.xy, radius
uniform vec3 uHole;     // center.xy, radius
uniform float uInk;     // 0 = silver mercury (dark sheet), 1 = black ink (light sheet)

float smin(float a, float b, float k) {
  float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
  return mix(b, a, h) - k * h * (1.0 - h);
}
float sdBox(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + r;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}
float wrapAng(float a) { return atan(sin(a), cos(a)); }

// exact distance to a 2D round cone (circle r1 at a, circle r2 at b, tangent hull)
float sdRoundCone(vec2 p, vec2 a, vec2 b, float r1, float r2) {
  vec2 ba = b - a;
  float l2 = dot(ba, ba);
  float rr = r1 - r2;
  float a2 = l2 - rr * rr;
  float il2 = 1.0 / l2;
  vec2 pa = p - a;
  float y = dot(pa, ba);
  float z = y - l2;
  vec2 xv = pa * l2 - ba * y;
  float x2 = dot(xv, xv);
  float y2 = y * y * l2;
  float z2 = z * z * l2;
  float k = sign(rr) * rr * rr * x2;
  if (sign(z) * a2 * z2 > k) return sqrt(x2 + z2) * il2 - r2;
  if (sign(y) * a2 * y2 < k) return sqrt(x2 + y2) * il2 - r1;
  return (sqrt(x2 * a2 * il2) + y * rr) * il2 - r1;
}

vec2 jelly(vec2 v) {
  float c = cos(uWob.y);
  float s = sin(uWob.y);
  v = vec2(c * v.x + s * v.y, -s * v.x + c * v.y);
  return vec2(v.x / (1.0 + uWob.x), v.y * (1.0 + uWob.x)); // area-preserving squash
}

float body(vec2 p) {
  if (uHead.z < 0.05) return 1e4;
  vec2 q = jelly(p - uHead.xy);
  vec2 t = jelly(uTail.xy - uHead.xy);
  float d = dot(t, t) < 0.25 ? length(q) - uHead.z : sdRoundCone(q, vec2(0.0), t, uHead.z, uTail.z);

  // soft wobble running round the surface after a click (low order: no facets)
  float ang = atan(q.y, q.x);
  d -= uWob.z * sin(ang * 3.0 - uTime * 12.0);

  // a smooth single bulge leaning toward the nearest element (liquid tug)
  vec2 w = p - uHead.xy;
  float da = wrapAng(atan(w.y, w.x) - atan(uMag.y, uMag.x));
  float lean = pow(max(cos(da), 0.0), 3.0) * uMag.z;
  return d - lean * smoothstep(uHead.z * 3.0, 0.0, length(w));
}

float scene(vec2 p) {
  float d = body(p);

  if (uRectOn > 0.001) {
    vec2 rp = p - uRect.xy;
    float rd = sdBox(rp, uRect.zw, min(uRectR, min(uRect.z, uRect.w)));
    float a = atan(rp.y / max(uRect.w, 1.0), rp.x / max(uRect.z, 1.0));
    float ad = abs(wrapAng(a - uEntry)) / 3.14159;
    float th = (1.7 + 0.35 * sin(a * 3.0 + uTime * 1.6)) * uRectOn; // even line, slow undulation
    float ring = abs(rd) - th;
    ring += max(0.0, ad - uRectP) * 80.0;      // only where the liquid has reached
    d = smin(d, ring, 10.0);                    // joined to the drop: one body
  }

  if (uFlood.z > 0.5) {
    vec2 fp = p - uFlood.xy;
    float fa = atan(fp.y, fp.x);
    float wob = (sin(fa * 5.0 + uTime * 1.3) * 0.55 + sin(fa * 9.0 - uTime * 1.9) * 0.35)
              * min(uFlood.z * 0.05, 22.0);
    d = smin(d, length(fp) - uFlood.z - wob, 26.0);
  }
  if (uHole.z > 0.1) {
    d = max(d, -(length(p - uHole.xy) - uHole.z));
  }
  return d;
}

// Cool, neutral chrome. A crisp horizon splits a pale sky from a darker
// slate-grey floor; soft streaks are the studio lights. The floor never drops
// below ~0.58 so slate menu text set on the flood keeps >4.5:1 everywhere.
vec3 env(vec3 r, float pool) {
  float hz = r.y; // screen y points down: negative = sky
  vec3 sky = mix(vec3(0.80, 0.815, 0.83), vec3(0.93, 0.935, 0.94), smoothstep(0.0, -0.8, hz));
  vec3 flo = mix(vec3(0.58, 0.595, 0.615), vec3(0.65, 0.665, 0.68), smoothstep(0.0, 0.9, hz));
  float edge = mix(0.12, 0.02, pool);
  vec3 col = mix(sky, flo, smoothstep(-edge, edge, hz));
  col += vec3(0.28) * smoothstep(0.975, 0.997, dot(r, normalize(vec3(-0.55, -0.62, 0.55))));
  col += vec3(0.16) * smoothstep(0.985, 0.998, dot(r, normalize(vec3(0.5, -0.72, 0.48))));
  col += vec3(0.58, 0.77, 0.85) * smoothstep(0.8, 0.98, dot(r, normalize(vec3(0.95, 0.18, 0.25)))) * 0.4 * (1.0 - pool);
  return min(col, vec3(0.95));
}

// Black ink for the light sheet: the same studio, reflected in a dark liquid.
// Sky and floor sit low; the light streaks stay bright, so it still reads glossy.
vec3 envInk(vec3 r, float pool) {
  float hz = r.y;
  vec3 sky = mix(vec3(0.17, 0.18, 0.19), vec3(0.27, 0.28, 0.29), smoothstep(0.0, -0.8, hz));
  vec3 flo = mix(vec3(0.035, 0.04, 0.045), vec3(0.07, 0.075, 0.08), smoothstep(0.0, 0.9, hz));
  float edge = mix(0.12, 0.02, pool);
  vec3 col = mix(sky, flo, smoothstep(-edge, edge, hz));
  col += vec3(0.62) * smoothstep(0.975, 0.997, dot(r, normalize(vec3(-0.55, -0.62, 0.55))));
  col += vec3(0.32) * smoothstep(0.985, 0.998, dot(r, normalize(vec3(0.5, -0.72, 0.48))));
  col += vec3(0.58, 0.77, 0.85) * smoothstep(0.8, 0.98, dot(r, normalize(vec3(0.95, 0.18, 0.25)))) * 0.3 * (1.0 - pool);
  return min(col, vec3(0.92));
}

void main() {
  vec2 p = vec2(gl_FragCoord.x, uRes.y * uDpr - gl_FragCoord.y) / uDpr;
  float d = scene(p);

  float sd = scene(p - vec2(2.0, 5.0));
  float shadow = (1.0 - smoothstep(-2.0, 12.0, sd)) * 0.38;
  if (d > 1.5) {
    gl_FragColor = vec4(0.0, 0.0, 0.0, shadow);
    return;
  }

  float e = 0.75;
  vec2 g = vec2(scene(p + vec2(e, 0.0)) - d, scene(p + vec2(0.0, e)) - d) / e;
  float depth = clamp(-d / 11.0, 0.0, 1.0);
  float tilt = 1.0 - depth;
  tilt = tilt * tilt;
  vec3 n = normalize(vec3(g * tilt * 1.9, 1.0 - 0.5 * tilt));

  float pool = smoothstep(18.0, 60.0, -d);
  n.xy += pool * 0.16 * vec2(
    sin(p.x * 0.0032 + uTime * 0.22 + sin(p.y * 0.0041 - uTime * 0.17) * 1.6),
    cos(p.y * 0.0036 - uTime * 0.19 + sin(p.x * 0.0027 + uTime * 0.11) * 1.6));
  n.xy += pool * 0.06 * vec2(
    sin(p.x * 0.011 + uTime * 0.55 + sin(p.y * 0.008 + uTime * 0.3) * 2.0),
    cos(p.y * 0.012 - uTime * 0.45 + sin(p.x * 0.006) * 2.0));
  n = normalize(n);

  vec3 r = reflect(vec3(0.0, 0.0, -1.0), n);
  vec3 col = mix(env(r, pool), envInk(r, pool), uInk);
  float band = sin(p.x * 0.0042 + p.y * 0.0021 + uTime * 0.32 + 2.2 * sin(p.y * 0.0029 - uTime * 0.21));
  col += pool * vec3(0.06) * smoothstep(0.93, 0.995, band);
  float fres = pow(1.0 - max(n.z, 0.0), 3.0);
  col = mix(col, mix(vec3(0.16, 0.17, 0.18), vec3(0.02, 0.022, 0.025), uInk), fres * 0.55 * (1.0 - pool));
  col = min(col, vec3(0.95));

  float alpha = clamp(0.5 - d, 0.0, 1.0);
  float a = alpha + shadow * (1.0 - alpha);
  gl_FragColor = vec4(col * alpha, a);
}
`;

/** Critically-damped-ish spring step for one axis. */
const spring = (x: number, v: number, target: number, k: number, zeta: number, dt: number) => {
  const c = 2 * Math.sqrt(k) * zeta;
  v += ((target - x) * k - v * c) * dt;
  return [x + v * dt, v] as const;
};

export function initFluid(): Fluid | null {
  // The flood (menu) runs on every device; the cursor itself only with a mouse.
  const fine = window.matchMedia('(pointer: fine)').matches;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return null;

  const canvas = document.createElement('canvas');
  canvas.className = 'fluid-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  const gl = canvas.getContext('webgl', { premultipliedAlpha: true, alpha: true, antialias: false });
  if (!gl) return null;

  const compile = (type: number, src: string) => {
    const s = gl.createShader(type)!;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.warn('[fluid]', gl.getShaderInfoLog(s));
      return null;
    }
    return s;
  };
  const vs = compile(gl.VERTEX_SHADER, VERT);
  const fs = compile(gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) return null;
  const prog = gl.createProgram()!;
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    console.warn('[fluid]', gl.getProgramInfoLog(prog));
    return null;
  }
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'aPos');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

  const U = (n: string) => gl.getUniformLocation(prog, n);
  const u = {
    res: U('uRes'),
    dpr: U('uDpr'),
    time: U('uTime'),
    head: U('uHead'),
    tail: U('uTail'),
    wob: U('uWob'),
    mag: U('uMag'),
    rect: U('uRect'),
    rectR: U('uRectR'),
    rectP: U('uRectP'),
    entry: U('uEntry'),
    rectOn: U('uRectOn'),
    flood: U('uFlood'),
    hole: U('uHole'),
    ink: U('uInk'),
  };

  document.body.appendChild(canvas);
  document.documentElement.classList.add('has-flood');
  if (fine) document.documentElement.classList.add('has-fluid');

  // ---------------- state ----------------
  let W = 0;
  let H = 0;
  let dpr = 1;
  const mouse = { x: -300, y: -300, inside: false };
  const head = { x: -300, y: -300, vx: 0, vy: 0 };
  const tail = { x: -300, y: -300, vx: 0, vy: 0 };
  const size = { s: 0, v: 0, target: 0 }; // overall presence (appear / leave)
  const wob = { w: 0, v: 0, angle: 0, ripple: 0 };
  const mag = { x: 1, y: 0, amp: 0 };
  const wrap = { on: 0, p: 0, entry: 0, radius: 3, el: null as HTMLElement | null, leaving: false };
  const flood = { x: 0, y: 0, r: 0, hole: 0 };
  // silver on dark surfaces, black ink on light ones. An open case study brings its own
  // world (Cooked is light, the tracker's board is dark); otherwise the site's theme decides
  const pmCard = document.querySelector<HTMLElement>('[data-pm-card]');
  const inkTarget = () => {
    const world = pmCard?.dataset.theme;
    if (world === 'light') return 1;
    if (world === 'pcb') return 0;
    return document.documentElement.dataset.theme === 'light' ? 1 : 0;
  };
  const ink = { v: inkTarget() };
  let lastVx = 0;
  let lastVy = 0;
  let raf = 0;
  let last = performance.now();
  const t0 = last;

  const magnets = () => Array.from(document.querySelectorAll<HTMLElement>('[data-magnet]'));
  let magnetList = magnets();
  new MutationObserver(() => (magnetList = magnets())).observe(document.body, { childList: true, subtree: true });

  const resize = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    gl.viewport(0, 0, canvas.width, canvas.height);
    kick();
  };

  /** Point on the element's (padded) edge in the direction of `angle`. */
  const edgePoint = (r: DOMRect, angle: number) => {
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const hw = r.width / 2 + PAD;
    const hh = r.height / 2 + PAD;
    const dx = Math.cos(angle) * hw;
    const dy = Math.sin(angle) * hh;
    const t = Math.min(hw / Math.max(Math.abs(dx), 1e-3), hh / Math.max(Math.abs(dy), 1e-3));
    return { x: cx + dx * t, y: cy + dy * t };
  };

  // ---------------- input (mouse / pen only) ----------------
  if (fine) {
    window.addEventListener(
      'pointermove',
      (e) => {
        if (e.pointerType === 'touch') return;
        mouse.x = e.clientX;
        mouse.y = e.clientY;
        if (!mouse.inside) {
          // form a fresh drop where the pointer re-enters
          head.x = tail.x = mouse.x;
          head.y = tail.y = mouse.y;
          head.vx = head.vy = tail.vx = tail.vy = 0;
          mouse.inside = true;
        }
        size.target = 1;
        kick();
      },
      { passive: true },
    );
    document.documentElement.addEventListener('pointerleave', () => {
      mouse.inside = false;
      size.target = 0;
      kick();
    });

    window.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'touch') return;
      // a press squashes the drop and sends a ripple round it
      wob.v += 9;
      wob.angle = Math.random() * Math.PI;
      wob.ripple = 0.9;
      size.v -= 7;
      kick();
    });

    const enter = (el: HTMLElement) => {
      if (wrap.el === el && !wrap.leaving) return;
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      wrap.el = el;
      wrap.leaving = false;
      // follow the element's own corners: a round button gets a round ring
      const br = getComputedStyle(el).borderTopLeftRadius;
      const rad = br.endsWith('%') ? (parseFloat(br) / 100) * Math.min(r.width, r.height) : parseFloat(br) || 0;
      wrap.radius = Math.max(3, rad + PAD);
      wrap.entry = Math.atan2((mouse.y - cy) / (r.height / 2), (mouse.x - cx) / (r.width / 2));
      gsap.killTweensOf(wrap);
      gsap.to(wrap, { on: 1, duration: 0.2, ease: 'power2.out' });
      gsap.to(wrap, { p: 1, duration: 0.6, delay: 0.06, ease: 'power3.out' });
      kick();
    };
    const leave = () => {
      if (!wrap.el || wrap.leaving) return;
      wrap.leaving = true;
      gsap.killTweensOf(wrap);
      gsap.to(wrap, { p: 0, duration: 0.3, ease: 'power2.in' });
      gsap.to(wrap, {
        on: 0,
        duration: 0.18,
        delay: 0.24,
        ease: 'power2.in',
        onComplete: () => {
          wrap.el = null;
          wrap.leaving = false;
        },
      });
      kick();
    };
    // a wrapped element that is about to vanish (a closing card) lets go of the liquid
    document.addEventListener('fluid:release', leave);
    document.addEventListener('pointerover', (e) => {
      if (e.pointerType === 'touch') return;
      const el = (e.target as HTMLElement).closest<HTMLElement>('[data-magnet]');
      if (el) enter(el);
      else leave();
    });
  }

  // ---------------- simulation (fixed sub-steps: smooth at any frame rate) ----------------
  const SUB = 1 / 240;
  const step = (dt: number) => {
    // magnet: nearest interactive element within range (not while wrapped)
    let best = MAGNET_RANGE;
    let dirX = mag.x;
    let dirY = mag.y;
    const wrapped = wrap.el && !wrap.leaving;
    if (!wrapped) {
      for (const el of magnetList) {
        const r = el.getBoundingClientRect();
        if (r.width === 0) continue;
        const px = Math.max(r.left, Math.min(mouse.x, r.right));
        const py = Math.max(r.top, Math.min(mouse.y, r.bottom));
        const d = Math.hypot(px - mouse.x, py - mouse.y);
        if (d < best && d > 0.5) {
          best = d;
          dirX = (px - mouse.x) / d;
          dirY = (py - mouse.y) / d;
        }
      }
    }
    const pull = best < MAGNET_RANGE ? Math.pow(1 - best / MAGNET_RANGE, 1.4) : 0;
    const km = 1 - Math.exp(-dt * 10);
    mag.amp += (pull * 5 - mag.amp) * km;
    mag.x += (dirX - mag.x) * km;
    mag.y += (dirY - mag.y) * km;

    // where the body wants to be: the pointer, or the edge of the wrapped element
    let tx = mouse.x + mag.x * mag.amp * 0.8;
    let ty = mouse.y + mag.y * mag.amp * 0.8;
    let rect: DOMRect | null = null;
    if (wrap.el && wrap.on > 0.001) {
      rect = wrap.el.getBoundingClientRect();
      if (!wrap.leaving) {
        const ep = edgePoint(rect, wrap.entry);
        tx = ep.x;
        ty = ep.y;
      }
    }

    // dt is clamped >= 0 by the caller; always take at least one bounded step
    const n = Math.min(64, Math.max(1, Math.ceil(dt / SUB)));
    const h = dt / n;
    for (let i = 0; i < n; i++) {
      [head.x, head.vx] = spring(head.x, head.vx, tx, 820, 0.62, h);
      [head.y, head.vy] = spring(head.y, head.vy, ty, 820, 0.62, h);
      [tail.x, tail.vx] = spring(tail.x, tail.vx, head.x, 280, 0.8, h);
      [tail.y, tail.vy] = spring(tail.y, tail.vy, head.y, 280, 0.8, h);
      [size.s, size.v] = spring(size.s, size.v, size.target, 260, 0.45, h);
      [wob.w, wob.v] = spring(wob.w, wob.v, 0, 340, 0.18, h); // jelly: very underdamped
    }

    // keep the tail attached: never longer than the drop can stretch
    const dx = tail.x - head.x;
    const dy = tail.y - head.y;
    const len = Math.hypot(dx, dy);
    const maxLen = 30; // a drop, not a rod
    if (len > maxLen) {
      tail.x = head.x + (dx / len) * maxLen;
      tail.y = head.y + (dy / len) * maxLen;
    }

    // sharp changes of direction slosh the body
    const ax = head.vx - lastVx;
    const ay = head.vy - lastVy;
    const jerk = Math.hypot(ax, ay);
    if (jerk > 60) {
      wob.v += Math.min(jerk * 0.004, 1.2);
      wob.angle = Math.atan2(ay, ax);
    }
    lastVx = head.vx;
    lastVy = head.vy;
    wob.ripple *= Math.exp(-dt * 6);

    flood.hole += ((flood.r > 60 ? 7 : 0) - flood.hole) * (1 - Math.exp(-dt * 12));

    const moving =
      Math.abs(head.vx) + Math.abs(head.vy) + Math.abs(tail.vx) + Math.abs(tail.vy) > 1 ||
      Math.hypot(tx - head.x, ty - head.y) > 0.3 ||
      Math.abs(size.s - size.target) > 0.002 ||
      Math.abs(wob.w) + Math.abs(wob.v) > 0.002 ||
      wob.ripple > 0.02;
    return { busy: moving || mag.amp > 0.05 || wrap.on > 0.001 || flood.r > 0.5 || flood.hole > 0.05, rect, len };
  };

  // ---------------- render ----------------
  const render = (now: number, rect: DOMRect | null, len: number) => {
    const time = (now - t0) / 1000;
    const s = Math.max(0, size.s);
    // volume-ish: the drop thins as it stretches, and gives itself to the wrap
    const base = (R + (R_WRAP - R) * wrap.p) * s;
    const r1 = base * (1 - Math.min(len / 120, 0.18));
    const r2 = r1 * (1 - 0.45 * Math.min(len / 30, 1));

    gl.disable(gl.SCISSOR_TEST);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    let x0 = Math.min(head.x, tail.x) - r1 - 40;
    let y0 = Math.min(head.y, tail.y) - r1 - 40;
    let x1 = Math.max(head.x, tail.x) + r1 + 40;
    let y1 = Math.max(head.y, tail.y) + r1 + 40;
    if (rect) {
      x0 = Math.min(x0, rect.left - 30);
      y0 = Math.min(y0, rect.top - 30);
      x1 = Math.max(x1, rect.right + 30);
      y1 = Math.max(y1, rect.bottom + 30);
    }
    if (flood.r > 0.5) {
      x0 = 0;
      y0 = 0;
      x1 = W;
      y1 = H;
    }
    const sx = Math.max(0, Math.floor(x0 * dpr));
    const sy = Math.max(0, Math.floor((H - y1) * dpr));
    const sw = Math.min(canvas.width, Math.ceil(x1 * dpr)) - sx;
    const sh = Math.min(canvas.height, Math.ceil((H - y0) * dpr)) - sy;
    if (sw <= 0 || sh <= 0) return;
    gl.enable(gl.SCISSOR_TEST);
    gl.scissor(sx, sy, sw, sh);

    gl.uniform2f(u.res, W, H);
    gl.uniform1f(u.dpr, dpr);
    gl.uniform1f(u.time, time);
    gl.uniform3f(u.head, head.x, head.y, r1);
    gl.uniform3f(u.tail, tail.x, tail.y, Math.max(r2, 0.5));
    gl.uniform3f(u.wob, Math.max(-0.35, Math.min(0.35, wob.w)), wob.angle, wob.ripple * s);
    gl.uniform3f(u.mag, mag.x, mag.y, mag.amp * s);
    if (rect) {
      gl.uniform4f(u.rect, rect.left + rect.width / 2, rect.top + rect.height / 2, rect.width / 2 + PAD, rect.height / 2 + PAD);
      gl.uniform1f(u.rectR, wrap.radius);
    }
    gl.uniform1f(u.rectP, wrap.p);
    gl.uniform1f(u.entry, wrap.entry);
    gl.uniform1f(u.rectOn, rect ? wrap.on * s : 0);
    gl.uniform3f(u.flood, flood.x, flood.y, flood.r);
    gl.uniform3f(u.hole, head.x, head.y, flood.hole);
    gl.uniform1f(u.ink, ink.v);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };

  const loop = (now: number) => {
    // real elapsed time (sub-stepped), so the liquid stays true on slow frames
    // the rAF timestamp can precede the moment we were kicked: never negative
    const dt = Math.max(0, Math.min(0.12, (now - last) / 1000));
    last = now;
    const { busy, rect, len } = step(dt);
    render(now, rect, len);
    raf = busy ? requestAnimationFrame(loop) : 0;
  };
  function kick() {
    if (!raf) {
      last = performance.now();
      raf = requestAnimationFrame(loop);
    }
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden && raf) {
      cancelAnimationFrame(raf);
      raf = 0;
    } else if (!document.hidden) kick();
  });
  window.addEventListener('resize', resize);
  resize();
  const retint = () => {
    kick();
    gsap.to(ink, { v: inkTarget(), duration: 0.5, ease: 'power2.inOut', overwrite: true, onUpdate: kick });
  };
  document.addEventListener('themechange', retint);
  // the card takes on a case study's world as it opens, and gives it back once it has closed
  if (pmCard) new MutationObserver(retint).observe(pmCard, { attributes: true, attributeFilter: ['data-theme'] });

  return {
    flood(open, x, y) {
      flood.x = x;
      flood.y = y;
      const cover = Math.hypot(Math.max(x, W - x), Math.max(y, H - y)) + 90;
      kick();
      return new Promise((resolve) => {
        gsap.to(flood, {
          r: open ? cover : 0,
          duration: open ? 0.95 : 0.7,
          ease: open ? 'power3.inOut' : 'power3.in',
          onUpdate: kick,
          onComplete: () => resolve(),
        });
      });
    },
  };
}
