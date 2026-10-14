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

async function start(fig: HTMLElement, reduce: boolean): Promise<Viewer> {
  const stage = fig.querySelector<HTMLElement>('[data-mv-stage]')!;
  const status = fig.querySelector<HTMLElement>('[data-mv-status]')!;
  const { THREE, GLTFLoader, DRACOLoader, OrbitControls } = await loadLib();

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
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
    idle = 0.001;
  });

  let resetting = false;
  fig.querySelector('[data-mv-reset]')?.addEventListener('click', () => {
    resetting = true;
    controls.autoRotate = false;
    idle = 0.001;
  });
  const sectionBtn = fig.querySelector<HTMLButtonElement>('[data-mv-section]');
  sectionBtn?.addEventListener('click', () => {
    const on = sectionBtn.getAttribute('aria-pressed') !== 'true';
    sectionBtn.setAttribute('aria-pressed', String(on));
    planeTarget = on ? 0 : OFF;
  });

  // the hint names the right key for this keyboard
  if (!/Mac|iPhone|iPad/.test(navigator.platform)) fig.querySelectorAll('[data-mv-key]').forEach((k) => (k.textContent = 'Ctrl'));

  const fadeBtn = fig.querySelector<HTMLButtonElement>('[data-mv-fade]');
  fadeBtn?.addEventListener('click', () => {
    const on = fadeBtn.getAttribute('aria-pressed') !== 'true';
    fadeBtn.setAttribute('aria-pressed', String(on));
    fadeTarget = on ? 0.18 : 1;
  });

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
      controls.update(dt);
      renderer.render(scene, camera);
    },
  };
}
