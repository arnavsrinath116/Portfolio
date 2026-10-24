/**
 * Fusion models in the skill card: matte slate solids with their CAD edges
 * drawn in sand, turned by hand. three.js and each model load only when a
 * viewer first scrolls into view; a viewer renders only while it is visible.
 * Models turn left and right only, and zoom a little either side of their framing
 * while ⌘ / Ctrl is held.
 *
 * A model marked for a section opens cut through its long axis (like a
 * section analysis in Fusion): the cut faces show in the accent blue.
 */
import { maxDpr } from './perf';
type Three = typeof import('three');
type Lib = {
  THREE: Three;
  GLTFLoader: typeof import('three/examples/jsm/loaders/GLTFLoader.js').GLTFLoader;
  DRACOLoader: typeof import('three/examples/jsm/loaders/DRACOLoader.js').DRACOLoader;
  OrbitControls: typeof import('three/examples/jsm/controls/OrbitControls.js').OrbitControls;
};

const SLATE = 0x4a535d;
const SAND = 0xe6dcc8;
const CUT = 0x4f8aa3; // the cut faces: a deep sand blue, the accent in shadow
const EDGE_ANGLE = 30; // degrees between faces before a crease is drawn
const OFF = 2; // section plane constant that clips nothing (the model fits a 2-unit box)

let lib: Promise<Lib> | null = null;
const loadLib = () =>
  (lib ??= Promise.all([
    import('three'),
    import('three/examples/jsm/loaders/GLTFLoader.js'),
    import('three/examples/jsm/loaders/DRACOLoader.js'),
    import('three/examples/jsm/controls/OrbitControls.js'),
  ]).then(([THREE, g, d, o]) => ({ THREE, GLTFLoader: g.GLTFLoader, DRACOLoader: d.DRACOLoader, OrbitControls: o.OrbitControls })));

type Viewer = { visible: boolean; tick: (dt: number) => void };

export function initModelViewers({ reduce }: { reduce: boolean }) {
  const figs = Array.from(document.querySelectorAll<HTMLElement>('[data-model]'));
  if (!figs.length) return;
  const viewers = new Map<HTMLElement, Viewer>();
  const starting = new Set<HTMLElement>();
  const onScreen = new Set<HTMLElement>(); // latest word from the observer, even mid-load

  const io = new IntersectionObserver(
    (entries) =>
      entries.forEach((e) => {
        const fig = e.target as HTMLElement;
        if (e.isIntersecting) onScreen.add(fig);
        else onScreen.delete(fig);
        const v = viewers.get(fig);
        if (v) {
          v.visible = e.isIntersecting;
          if (v.visible) kick();
        } else if (e.isIntersecting && !starting.has(fig)) {
          starting.add(fig);
          start(fig, reduce)
            .then((viewer) => {
              viewer.visible = onScreen.has(fig); // the card may have closed while it loaded
              viewers.set(fig, viewer);
              kick();
            })
            .catch((err) => {
              console.warn('model viewer', err);
              const s = fig.querySelector('[data-mv-status]');
              if (s) s.textContent = 'The 3D view isn’t available on this device';
            });
        }
      }),
    { rootMargin: '200px 0px' },
  );
  figs.forEach((f) => io.observe(f));

  // one loop for every viewer; it sleeps when none is on screen
  let raf = 0;
  let last = 0;
  const loop = (now: number) => {
    const dt = Math.max(0, Math.min(0.05, (now - last) / 1000));
    last = now;
    let any = false;
    viewers.forEach((v) => {
      if (!v.visible) return;
      any = true;
      v.tick(dt);
    });
    raf = any && !document.hidden ? requestAnimationFrame(loop) : 0;
  };
  function kick() {
    if (raf) return;
    last = performance.now();
    raf = requestAnimationFrame(loop);
  }
  document.addEventListener('visibilitychange', () => !document.hidden && kick());
}

// ---- the view cube ----
// an orthographic cube drawn into a small svg, turned each frame by the camera's view of the model.
// Faces carry their outward normal and their label's right (u) and up (v), in model space (Y up, Z to the front).
type V3 = [number, number, number];
const FACES: { name: string; n: V3; u: V3; v: V3; az?: number }[] = [
  { name: 'FRONT', n: [0, 0, 1], u: [1, 0, 0], v: [0, 1, 0], az: 0 },
  { name: 'RIGHT', n: [1, 0, 0], u: [0, 0, -1], v: [0, 1, 0], az: Math.PI / 2 },
  { name: 'BACK', n: [0, 0, -1], u: [-1, 0, 0], v: [0, 1, 0], az: Math.PI },
  { name: 'LEFT', n: [-1, 0, 0], u: [0, 0, 1], v: [0, 1, 0], az: -Math.PI / 2 },
  { name: 'TOP', n: [0, 1, 0], u: [1, 0, 0], v: [0, 0, -1] },
  { name: 'BOTTOM', n: [0, -1, 0], u: [1, 0, 0], v: [0, 0, 1] },
];
const AXES: { name: string; d: V3 }[] = [
  { name: 'x', d: [1, 0, 0] },
  { name: 'y', d: [0, 1, 0] },
  { name: 'z', d: [0, 0, 1] },
];
const H = 0.5; // half the cube's side, in svg units
const add = (a: V3, b: V3, k = 1): V3 => [a[0] + b[0] * k, a[1] + b[1] * k, a[2] + b[2] * k];
const f3 = (n: number) => n.toFixed(3);

function viewCube(svg: SVGSVGElement) {
  const NS = 'http://www.w3.org/2000/svg';
  const el = <K extends keyof SVGElementTagNameMap>(tag: K, cls: string, parent: Element) => {
    const e = document.createElementNS(NS, tag);
    e.setAttribute('class', cls);
    parent.append(e);
    return e;
  };
  // the triad sits under the faces: its runs along the hidden edges show faintly through, its tips stand clear
  const axes = AXES.map((a) => ({
    ...a,
    line: el('line', `ax ax-${a.name}`, svg),
    label: el('text', `ax-l ax-${a.name}`, svg),
  }));
  axes.forEach((a) => (a.label.textContent = a.name.toUpperCase()));
  const faces = FACES.map((f) => {
    const g = el('g', 'cf', svg);
    const poly = el('polygon', '', g);
    const text = el('text', '', g);
    text.textContent = f.name;
    if (f.az !== undefined) g.dataset.az = String(f.az);
    return { ...f, g, poly, text };
  });
  const origin: V3 = [-H, -H, -H];

  // rot: model space to view space (x right, y up, z toward the viewer); svg y runs down
  return (rot: (v: V3) => V3) => {
    const p = (v: V3) => {
      const r = rot(v);
      return [r[0], -r[1]];
    };
    for (const a of axes) {
      const [x1, y1] = p(origin);
      const [x2, y2] = p(add(origin, a.d, 2 * H + 0.42));
      const [lx, ly] = p(add(origin, a.d, 2 * H + 0.6));
      a.line.setAttribute('x1', f3(x1));
      a.line.setAttribute('y1', f3(y1));
      a.line.setAttribute('x2', f3(x2));
      a.line.setAttribute('y2', f3(y2));
      a.label.setAttribute('x', f3(lx));
      a.label.setAttribute('y', f3(ly));
    }
    for (const f of faces) {
      // a convex cube: the faces turned toward the viewer never overlap, so no sorting
      const facing = rot(f.n)[2] > 0.002;
      f.g.style.display = facing ? '' : 'none';
      if (!facing) continue;
      const c: V3 = [f.n[0] * H, f.n[1] * H, f.n[2] * H];
      const corners = [
        [-1, -1],
        [1, -1],
        [1, 1],
        [-1, 1],
      ].map(([i, j]) => p(add(add(c, f.u, i * H), f.v, j * H)));
      f.poly.setAttribute('points', corners.map(([x, y]) => `${f3(x)},${f3(y)}`).join(' '));
      // the label lies flat on its face: an orthographic view of a plane is an affine map
      const [a, b] = p(f.u);
      const [cx, cy] = p(f.v);
      const [e, g] = p(c);
      f.text.setAttribute('transform', `matrix(${f3(a)} ${f3(b)} ${f3(-cx)} ${f3(-cy)} ${f3(e)} ${f3(g)})`);
    }
  };
}

async function start(fig: HTMLElement, reduce: boolean): Promise<Viewer> {
  const stage = fig.querySelector<HTMLElement>('[data-mv-stage]')!;
  const status = fig.querySelector<HTMLElement>('[data-mv-status]')!;
  const { THREE, GLTFLoader, DRACOLoader, OrbitControls } = await loadLib();

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(maxDpr());
  renderer.localClippingEnabled = true;
  stage.prepend(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 16 / 9, 0.05, 100);
  // a soft hemisphere, a key, a rim, and a headlamp that travels with the camera so the
  // side facing the viewer always reads
  scene.add(new THREE.HemisphereLight(0xdfe3e8, 0x3a4048, 1.0));
  const head = new THREE.DirectionalLight(0xffffff, 0.75);
  head.position.set(0.6, 0.8, 0); // a little above and right of the lens, aimed at the model
  camera.add(head);
  scene.add(camera);
  const key = new THREE.DirectionalLight(0xffffff, 1.3);
  key.position.set(2.5, 3.5, 2.5);
  const rim = new THREE.DirectionalLight(0xffe6cc, 0.55);
  rim.position.set(-3, 1.2, -2.5);
  scene.add(key, rim);

  // the section: clips the half nearest the viewer's starting side
  const plane = new THREE.Plane(new THREE.Vector3(0, 0, -1), OFF);
  const sectioned = fig.hasAttribute('data-section');
  let planeTarget = sectioned ? 0 : OFF;
  const clipping = [plane];

  const solid = new THREE.MeshStandardMaterial({
    color: SLATE,
    roughness: 0.82,
    metalness: 0.05,
    side: THREE.FrontSide,
    clippingPlanes: clipping,
    polygonOffset: true, // push faces back a touch so the edges sit cleanly on top
    polygonOffsetFactor: 1,
    polygonOffsetUnits: 1,
  });
  // inside faces only show through the cut; offset further back so they never bleed at silhouettes
  const cut = new THREE.MeshBasicMaterial({
    color: CUT,
    side: THREE.BackSide,
    clippingPlanes: clipping,
    polygonOffset: true,
    polygonOffsetFactor: 3,
    polygonOffsetUnits: 3,
  });
  const edgeMat = new THREE.LineBasicMaterial({ color: SAND, transparent: true, opacity: 0.55, clippingPlanes: clipping });

  // ---- load ----
  const draco = new DRACOLoader().setDecoderPath(`${import.meta.env.BASE_URL.replace(/\/$/, '')}/draco/`);
  const gltf = await new GLTFLoader().setDRACOLoader(draco).loadAsync(fig.dataset.model!, (e) => {
    if (e.total) status.textContent = `Loading model ${Math.round((e.loaded / e.total) * 100)}%`;
  });
  draco.dispose();
  const model = new THREE.Group();
  const meshes: import('three').Mesh[] = [];
  gltf.scene.traverse((o) => {
    if ((o as import('three').Mesh).isMesh) meshes.push(o as import('three').Mesh);
  });
  // parts the Opacity button turns see-through (e.g. a casing's shell and lid), so what's inside shows
  const fadeNames = (fig.dataset.fade ?? '').split(',').filter(Boolean);
  const fadeSolid = solid.clone();
  fadeSolid.transparent = true;
  const fadeEdge = edgeMat.clone();
  let fade = 1;
  let fadeTarget = 1;
  for (const m of meshes) {
    m.updateWorldMatrix(true, false);
    const geom = m.geometry.clone().applyMatrix4(m.matrixWorld);
    const name = `${m.name} ${m.parent?.name ?? ''}`;
    const faded = fadeNames.some((n) => name.includes(n));
    model.add(new THREE.Mesh(geom, faded ? fadeSolid : solid));
    if (!faded) model.add(new THREE.Mesh(geom, cut));
    // creases only: smooth curves stay clean. Yield between parts so a big assembly never blocks a frame.
    model.add(new THREE.LineSegments(new THREE.EdgesGeometry(geom, EDGE_ANGLE), faded ? fadeEdge : edgeMat));
    await new Promise((r) => setTimeout(r, 0));
  }
  scene.add(model);

  // ---- framing ----
  const box = new THREE.Box3().setFromObject(model);
  const sphere = box.getBoundingSphere(new THREE.Sphere());
  // a few thousand of the model's own points: framing the real silhouette, not its box
  const samples: import('three').Vector3[] = [];
  const total = meshes.reduce((n, m) => n + m.geometry.attributes.position.count, 0);
  const every = Math.max(1, Math.floor(total / 4000));
  for (const m of meshes) {
    const pos = m.geometry.attributes.position;
    for (let i = 0; i < pos.count; i += every) samples.push(new THREE.Vector3().fromBufferAttribute(pos, i).applyMatrix4(m.matrixWorld));
  }
  const home = new THREE.Vector3(1.15, 0.75, 1.35).normalize();
  const FILL = 0.84; // the model fills this much of the stage from the starting view
  let fitDist = 6;
  // frame the model as seen from the home view (a bounding sphere or box leaves long, round parts tiny)
  const fit = () => {
    const pos = camera.position.clone();
    const quat = camera.quaternion.clone();
    let d = sphere.radius * 3;
    for (let k = 0; k < 5; k++) {
      camera.position.copy(home).multiplyScalar(d).add(sphere.center);
      camera.lookAt(sphere.center);
      camera.updateMatrixWorld();
      let m = 0;
      for (const c of samples) {
        const v = c.clone().project(camera);
        m = Math.max(m, Math.abs(v.x), Math.abs(v.y));
      }
      d *= m / FILL;
    }
    fitDist = d;
    camera.position.copy(pos);
    camera.quaternion.copy(quat);
  };
  const size = () => {
    const w = stage.clientWidth;
    const h = stage.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    fit();
  };
  size();
  new ResizeObserver(size).observe(stage);
  camera.position.copy(home).multiplyScalar(fitDist * 1.25).add(sphere.center); // eases in from further out

  // orbit left and right only: the up/down angle is locked to the starting view, so a model
  // can't be tipped over or flipped
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.copy(sphere.center);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.enablePan = false;
  controls.rotateSpeed = 0.8;
  controls.zoomSpeed = 0.6;
  controls.minPolarAngle = controls.maxPolarAngle = Math.acos(home.y);
  controls.autoRotate = !reduce;
  controls.autoRotateSpeed = 0.7;
  const setZoomRange = () => {
    // zoom a little either side of the framed view
    controls.minDistance = fitDist * 0.6;
    controls.maxDistance = fitDist * 1.45;
  };
  setZoomRange();
  new ResizeObserver(setZoomRange).observe(stage);
  // touch: a vertical swipe still scrolls the card; sideways turns the model, two fingers pinch-zoom
  renderer.domElement.style.touchAction = 'pan-y';

  // zoom only while ⌘ / Ctrl is held (a trackpad pinch counts): a plain scroll is always the card's
  stage.addEventListener(
    'wheel',
    (e) => {
      if (!(e.metaKey || e.ctrlKey)) e.stopPropagation();
    },
    { capture: true },
  );

  // resting: a slow turntable; touched: stays where it was left, then drifts again after a pause
  let idle = 0;
  const unlock = () => fig.querySelectorAll('.cf.is-locked').forEach((g) => g.classList.remove('is-locked'));
  controls.addEventListener('start', () => {
    controls.autoRotate = false;
    resetting = false;
    idle = 0;
  });
  controls.addEventListener('end', () => (idle = 0.001));

  // keyboard: left and right arrows turn the model
  stage.addEventListener('keydown', (e) => {
    const step = 0.18;
    if (e.key === 'ArrowLeft') model.rotation.y -= step;
    else if (e.key === 'ArrowRight') model.rotation.y += step;
    else return;
    e.preventDefault();
    controls.autoRotate = false;
    turnTo = null;
    unlock();
    idle = 0.001;
  });

  let resetting = false;
  // the home button by the cube
  fig.querySelectorAll('[data-mv-reset]').forEach((b) =>
    b.addEventListener('click', () => {
      resetting = true;
      turnTo = null;
      unlock();
      controls.autoRotate = false;
      idle = 0.001;
    }),
  );
  const sectionBtn = fig.querySelector<HTMLButtonElement>('[data-mv-section]');
  sectionBtn?.addEventListener('click', () => {
    const on = sectionBtn.getAttribute('aria-pressed') !== 'true';
    sectionBtn.setAttribute('aria-pressed', String(on));
    planeTarget = on ? 0 : OFF;
  });

  // the feature buttons call for a click until one has been tried
  [sectionBtn, fig.querySelector('[data-mv-fade]')].forEach((b) => b?.addEventListener('click', () => fig.classList.add('is-tried')));

  const fadeBtn = fig.querySelector<HTMLButtonElement>('[data-mv-fade]');
  fadeBtn?.addEventListener('click', () => {
    const on = fadeBtn.getAttribute('aria-pressed') !== 'true';
    fadeBtn.setAttribute('aria-pressed', String(on));
    fadeTarget = on ? 0.18 : 1;
  });

  // the view cube: a side face swings the camera round to look straight at it, TOP goes back home.
  // Either way the view then holds (no turntable) and its face stays lit, until the model is turned again.
  let turnTo: number | null = null;
  const sph = new THREE.Spherical();
  const offset = new THREE.Vector3();
  const cubeSvg = fig.querySelector<SVGSVGElement>('[data-mv-cube]');
  const drawCube = cubeSvg ? viewCube(cubeSvg) : null;
  const pickFace = (face: SVGGElement) => {
    const az = face.dataset.az === undefined ? undefined : Number(face.dataset.az);
    controls.autoRotate = false;
    idle = 0;
    unlock();
    face.classList.add('is-locked');
    if (az === undefined) {
      turnTo = null;
      resetting = true;
    } else {
      resetting = false;
      turnTo = az;
    }
  };
  controls.addEventListener('start', () => {
    turnTo = null;
    unlock();
  });
  // dragging the cube turns the model round with it: across the cube is half a turn
  // (pointer capture sends the click to the svg, not the face, so a press that never moved picks here)
  let cubeDragged = false;
  if (cubeSvg) {
    let lastX = 0;
    let downX = 0;
    cubeSvg.addEventListener('pointerdown', (e) => {
      if (e.button !== 0) return;
      cubeSvg.setPointerCapture(e.pointerId);
      lastX = downX = e.clientX;
      cubeDragged = false;
      cubeSvg.classList.add('is-dragging');
    });
    cubeSvg.addEventListener('pointermove', (e) => {
      if (!cubeSvg.hasPointerCapture(e.pointerId)) return;
      if (!cubeDragged && Math.abs(e.clientX - downX) < 3) return;
      if (!cubeDragged) {
        cubeDragged = true;
        unlock();
        controls.autoRotate = false;
        resetting = false;
        turnTo = null;
        idle = 0;
      }
      offset.copy(camera.position).sub(controls.target);
      sph.setFromVector3(offset);
      sph.theta -= ((e.clientX - lastX) / cubeSvg.clientWidth) * Math.PI;
      camera.position.copy(controls.target).add(offset.setFromSpherical(sph));
      lastX = e.clientX;
    });
    const release = (e: PointerEvent) => {
      if (!cubeSvg.hasPointerCapture(e.pointerId)) return;
      cubeSvg.releasePointerCapture(e.pointerId);
      cubeSvg.classList.remove('is-dragging');
      if (cubeDragged) idle = 0.001;
      else {
        const face = document.elementFromPoint(e.clientX, e.clientY)?.closest<SVGGElement>('.cf');
        if (face && cubeSvg.contains(face)) pickFace(face);
      }
      cubeDragged = false;
    };
    cubeSvg.addEventListener('pointerup', release);
    cubeSvg.addEventListener('pointercancel', release);
  }
  const view = new THREE.Quaternion();
  const tmp = new THREE.Vector3();
  const rot = (v: V3): V3 => {
    tmp.set(v[0], v[1], v[2]).applyQuaternion(view);
    return [tmp.x, tmp.y, tmp.z];
  };

  // reveal: the canvas fades up as the camera settles in, and the section sweeps through
  stage.classList.add('is-ready');
  if (reduce) {
    camera.position.copy(home).multiplyScalar(fitDist).add(sphere.center);
    plane.constant = planeTarget;
  }

  const homePos = () => home.clone().multiplyScalar(fitDist).add(sphere.center);
  let intro = reduce ? 0 : 1;
  return {
    visible: true,
    tick(dt) {
      if (intro > 0) {
        // dolly in from further out during the first second
        camera.position.lerp(homePos(), 1 - Math.exp(-dt * 3.2));
        intro -= dt;
      }
      if (resetting) {
        camera.position.lerp(homePos(), 1 - Math.exp(-dt * 5));
        model.rotation.y += (0 - model.rotation.y) * (1 - Math.exp(-dt * 5));
        if (camera.position.distanceTo(homePos()) < 0.01) resetting = false;
      }
      if (idle > 0 && !reduce) {
        idle += dt;
        if (idle > 5 && !resetting) {
          controls.autoRotate = true;
          idle = 0;
        }
      }
      plane.constant += (planeTarget - plane.constant) * (1 - Math.exp(-dt * (reduce ? 60 : 2.6)));
      if (Math.abs(fadeTarget - fade) > 0.001) {
        fade += (fadeTarget - fade) * (1 - Math.exp(-dt * (reduce ? 60 : 6)));
        fadeSolid.opacity = fade;
        fadeSolid.depthWrite = fade > 0.98; // see-through parts mustn't hide what's behind them
        fadeEdge.opacity = 0.55 * Math.max(fade, 0.45);
      }
      if (turnTo !== null) {
        // round the model on the locked tilt, never through it; the arrow keys' turn unwinds alongside
        const k = 1 - Math.exp(-dt * (reduce ? 60 : 6));
        offset.copy(camera.position).sub(controls.target);
        sph.setFromVector3(offset);
        let d = (turnTo - sph.theta) % (Math.PI * 2);
        if (d > Math.PI) d -= Math.PI * 2;
        if (d < -Math.PI) d += Math.PI * 2;
        sph.theta += d * k;
        camera.position.copy(controls.target).add(offset.setFromSpherical(sph));
        model.rotation.y += (0 - model.rotation.y) * k;
        if (Math.abs(d) < 0.001 && Math.abs(model.rotation.y) < 0.001) turnTo = null;
      }
      controls.update(dt);
      renderer.render(scene, camera);
      if (drawCube) {
        // the model as the camera sees it: undo the camera's turn, keep the model's own
        view.copy(camera.quaternion).invert().multiply(model.quaternion);
        drawCube(rot);
      }
    },
  };
}
