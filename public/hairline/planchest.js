/**
 * Plan chest: an architect's flat file of five shallow drawers, every one of
 * them empty. The drawer under the pointer slides out on the lift curve and its
 * neighbours follow a little, staggered outwards from it. An open drawer shows
 * a bare floor and the dashed outline of the sheet that should lie in it. At
 * rest one drawer is left half open. The slider is the stagger, in ms.
 *
 * The pattern: discrete items, like Riffle. Tweens, a stagger by distance, and
 * a hit test on the chest's face, which never moves, or on the chosen drawer's
 * target pose, so a drawer sliding out from under the pointer keeps the choice.
 */
const {
  Cam, fillet, fit, hull, open, poly, proj, facing, prism, put, rings, ringAt, rrect, run,
  tdone, tset, tval, tween, disposer, mk, pointer, reflect, register, solid,
} = HL;

const N = 5, W = 150, D = 96, Z0 = 6, PITCH = 10, DH = 8.4, ZTOP = Z0 + N * PITCH;
const A = 4, B = W - 4, T = 1.4, R = 2.4, OUT = 44, NEAR = [OUT, 9, 3];
const REST = [2, 0.6, 18, 5, 1], LIT = 2; // bottom to top: one drawer left half open
const zb = (i) => Z0 + i * PITCH + (PITCH - DH) / 2;

/** A run of points ordered left to right on screen. */
const LR = (pts) => (pts[0][0] <= pts[pts.length - 1][0] ? pts : pts.slice().reverse());
/** A ring cut at the chest's face: what lies behind y = D is inside the chest, and never drawn. */
const cut = (ring) => ring.map((q) => (q.v < D ? { ...q, v: D } : q));

/** Drawer i pulled out by o: every path it draws, as d strings ("" for what a shut drawer hides). */
function drawer(P, front, i, o) {
  const z0 = zb(i), z1 = z0 + DH, zf = z0 + T, zm = (z0 + z1) / 2, yF = D + o + T;
  const outer = cut(rrect(A, D - 2 * R, B, yF, R, 4));
  const onFace = (u0, u1, h, r) => poly(rrect(u0, zm - h, u1, zm + h, r, 4).map((q) => P(q.u, yF, q.v)));
  const d = {
    body: poly(hull(ringAt(P, outer, z0).concat(ringAt(P, outer, z1)))),
    rim: "", seam: "", sheet: "", near: "", oTop: "", iFront: "", edge: "",
    // a brass label frame, empty, and a long pull
    label: onFace(A + 10, A + 30, 2.3, 0.8),
    pull: onFace(W / 2 - 16, W / 2 + 16, 1.2, 1.2),
  };
  if (o < 1.5) return d;
  const inner = cut(rrect(A + T, D - 2 * R, B - T, yF - T, R - T, 4));
  const iF = LR(ringAt(P, run(inner, front), z1)), oT = LR(ringAt(P, run(outer, front), z1)), oB = LR(ringAt(P, run(outer, front), z0));
  d.rim = poly(ringAt(P, inner, z1));
  d.seam = open([P(A + T, D, zf), P(A + T, yF - T - 1, zf)]);
  // the sheet that should be here: its outline on the bare floor, running back into the chest
  if (o > 12) {
    const f = fillet([[A + 8, D], [A + 8, yF - T - 6], [B - 10, yF - T - 6], [B - 10, D]], [0.01, 1.6, 1.6, 0.01], 3);
    d.sheet = open(f.slice(3, 13).map((p) => P(p[0], p[1], zf)));
  }
  // the front and right walls, one opaque piece from the rim down to the base
  d.near = poly([...iF, oT[oT.length - 1], ...oB.slice().reverse(), oT[0]]);
  d.oTop = open(oT);
  d.iFront = open(iF);
  d.edge = open([oT[0], ...oB, oT[oT.length - 1]]);
  return d;
}

/** Whether a screen point lies inside a convex hull. */
function inside(h, [x, y]) {
  let s = 0;
  for (let k = 0; k < h.length; k++) {
    const a = h[k], b = h[(k + 1) % h.length], c = (b[0] - a[0]) * (y - a[1]) - (b[1] - a[1]) * (x - a[0]);
    if (Math.abs(c) < 1e-9) continue;
    if (s && Math.sign(c) !== s) return false;
    s = Math.sign(c);
  }
  return true;
}

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let stag = value;

  // fitted to the chest with a drawer pulled all the way, so no pose leaves the frame
  const C = Cam(45, 0.5, 1.42);
  fit(C, [[-1.5, -1.5, ZTOP + 5.5], [W + 1.5, -1.5, ZTOP + 5.5], [-1.5, D + 1.5, ZTOP + 5.5], [W, D, 0], [A, D + OUT + T, 0], [B, D + OUT + T, 0], [A, D + OUT + T, ZTOP], [0, 0, -10]], 200, 166);
  const P = proj(C), front = facing(C);

  const g = mk("g", {}, svg);
  const [plinth, plinthIn] = rings(4, 4, W - 4, D - 4, 3, 1.2);
  reflect(svg, g, P, front, plinth, 0, 12);
  put(solid(g), prism(P, front, plinth, plinthIn, 0, Z0));
  const [body, bodyIn] = rings(0, 0, W, D, 3, 1.4);
  put(solid(g), prism(P, front, body, bodyIn, Z0, ZTOP + 2));
  const [top, topIn] = rings(-1.5, -1.5, W + 1.5, D + 1.5, 4, 2);
  put(solid(g), prism(P, front, top, topIn, ZTOP + 2, ZTOP + 5.5));

  // drawers bottom to top: a higher drawer pulled further covers the one beneath it
  const CLS = { body: "sil", rim: "nf", seam: "nf lo", sheet: "dash nf", near: "fo", oTop: "nf lo", iFront: "nf", edge: "nf sil", label: "nf lo", pull: "nf" };
  const drawers = [];
  for (let i = 0; i < N; i++) {
    const grp = mk("g", {}, g), el = {};
    for (const k in CLS) el[k] = mk("path", { class: CLS[k] }, grp);
    drawers.push({ el, tw: tween(REST[i]), last: NaN });
  }

  function draw(i, o) {
    const dr = drawers[i];
    if (o === dr.last) return;
    dr.last = o;
    const d = drawer(P, front, i, o);
    for (const k in d) dr.el[k].setAttribute("d", d[k]);
  }

  // hit test: the chosen drawer's target pose first, then the chest's face, a plane that never moves
  const hulls = drawers.map((_, i) => {
    const ring = cut(rrect(A, D - 2 * R, B, D + OUT + T, R, 4));
    return hull(ringAt(P, ring, zb(i)).concat(ringAt(P, ring, zb(i) + DH)));
  });
  const p0 = P(0, D, 0), px = P(1, D, 0), pz = P(0, D, 1);
  const ex = [px[0] - p0[0], px[1] - p0[1]], ez = [pz[0] - p0[0], pz[1] - p0[1]], det = ex[0] * ez[1] - ex[1] * ez[0];
  let act = -1;
  function hit(p) {
    if (act >= 0 && inside(hulls[act], p)) return act;
    const qx = p[0] - p0[0], qy = p[1] - p0[1];
    const u = (qx * ez[1] - qy * ez[0]) / det, z = (ex[0] * qy - ex[1] * qx) / det;
    if (u < A - 2 || u > B + 2) return -1;
    const i = Math.floor((z - Z0) / PITCH);
    return i >= 0 && i < N ? i : -1;
  }

  const L = register(stage, (_dt, now) => {
    let moving = false;
    drawers.forEach((dr, i) => { draw(i, tval(dr.tw, now)); if (!tdone(dr.tw, now)) moving = true; });
    return moving;
  });
  bag.add(L.unregister);

  /** Pulls drawer a (-1 leaves the chest as it was found). The stagger spreads from the drawer pulled, or the one let go. */
  function setActive(a) {
    if (a === act) return;
    const now = performance.now(), from = a >= 0 ? a : act;
    act = a;
    drawers.forEach((dr, i) => {
      tset(dr.tw, a < 0 ? REST[i] : NEAR[Math.abs(i - a)] ?? 0, now, Math.abs(i - from) * stag);
      const lit = i === (a < 0 ? LIT : a);
      dr.el.body.classList.toggle("hi", lit);
      dr.el.edge.classList.toggle("hi", lit);
    });
    read.textContent = a < 0 ? "rest" : `drawer ${N - a} · 0`;
    L.wake();
  }

  drawers.forEach((dr, i) => {
    draw(i, REST[i]);
    dr.el.body.classList.toggle("hi", i === LIT);
    dr.el.edge.classList.toggle("hi", i === LIT);
  });
  read.textContent = "rest";

  bag.add(pointer(stage, { move: (p) => setActive(hit(p)), leave: () => setActive(-1) }));
  bag.add(() => svg.replaceChildren());

  return {
    set: (v) => { stag = v; },
    destroy: bag.dispose,
  };
}

hairline({
  name: "planchest",
  means: "A plan chest of five shallow drawers: the one under the pointer slides out, and every drawer is empty.",
  rules: [1, 2, 5, 6],
  range: [0, 45, 90],
  tour: [[170, 156], [170, 206], null],
  mount,
});
