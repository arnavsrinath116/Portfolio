/**
 * The hero hologram: the Jet V1 Fusion model drawn straight onto the sheet as line art, laid
 * diagonally across the lower right. It reads like a technical illustration with hidden lines
 * removed: each part is an invisible solid that hides what's behind it, outlined at its
 * silhouette and drawn at its creases, all in the accent. No fills, no box.
 * It isn't interactive. Scrolling explodes it along its long axis: every part slides out
 * in proportion to where it sits on the axis, so the assembly opens up like an exploded
 * view, and the diagonal keeps the spread-out parts on the sheet.
 */
type Three = typeof import('three');

const EDGE_ANGLE = 40; // creases sharper than this are drawn; smooth curves are left to the silhouette
const OUTLINE = 1.15; // silhouette stroke, in CSS px

// the parts that turn, by their number in the Fusion export, and how fast (radians a second):
// the fan with its spinner and hub; the shaft; the six compressor blade rows; the turbine
// stages. Low pressure turns slower than high, like the real thing. Struts, flanges, casing
// rings and the nozzle guide vane ring (037, bolted to the casing) stay still, which is what
// makes the spin read.
const SPIN: Record<number, number> = {
  0: 1.4, 1: 1.4, 7: 1.4, // spinner, fan hub, fan blades
  2: 2.6, 3: 2.6, // small blade ring, shaft
  8: 3.2, 9: 3.2, 10: 3.2, 11: 3.2, 12: 3.2, 13: 3.2, // compressor
  14: 3.8, 15: 3.8, 16: 3.8, 17: 3.8, // turbine
};

// the casings round the blade rows, which ghost down as you scroll so the spinning blades
// inside show: high pressure core casing (023 outer case, 018 compressor case) and low pressure
// turbine casing (025 outer, 020 turbine case). The fan stator casing (021, 022) stays solid.
const GHOST = new Set([23, 18, 25, 20]);
const GHOST_MIN = 0.14; // how faint they get
const SPREAD = 0.85; // fully exploded: each part moves this many times its distance from the middle
// the view from the Fusion file: intake toward you at the lower left, seen a little from above,
// the exhaust going away to the upper right
const YAW = 0.78; // turned so the intake faces the viewer
const TILT = 0.42; // looked at from a little above
const LEAN = 0.32; // the axis leaned onto the corner's diagonal

export function initHeroJet({ reduce }: { reduce: boolean }) {
  const canvas = document.querySelector<HTMLCanvasElement>('[data-hero-jet]');
  if (!canvas) return;
  // the hero is above the fold: let the page settle (fonts, intro) before pulling in three.js
  const go = () => void start(canvas, reduce);
  if ('requestIdleCallback' in window) (window as Window & { requestIdleCallback: (cb: () => void, o?: object) => void }).requestIdleCallback(go, { timeout: 1500 });
  else setTimeout(go, 600);
}

async function start(canvas: HTMLCanvasElement, reduce: boolean) {
  const [THREE, { GLTFLoader }, { DRACOLoader }] = await Promise.all([
    import('three') as Promise<Three>,
    import('three/examples/jsm/loaders/GLTFLoader.js'),
    import('three/examples/jsm/loaders/DRACOLoader.js'),
  ]);
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const draco = new DRACOLoader().setDecoderPath(`${base}/draco/`);
  const gltf = await new GLTFLoader().setDRACOLoader(draco).loadAsync(`${base}/models/jet.glb`);
  draco.dispose();

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'low-power' });
  // phones draw at 1.5× (sharp enough for line art, far less work for a small GPU)
  renderer.setPixelRatio(Math.min(devicePixelRatio, window.matchMedia('(pointer: coarse)').matches ? 1.5 : 2));
  renderer.autoClear = false; // the casings can take a pass of their own over the internals
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, -20, 20);
  camera.position.set(0, 0, 10);

  const ink = () => new THREE.Color(getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#94c4d9');
  // hidden-line removal: the solids write depth but no colour, so the sheet shows through
  // them while anything behind is hidden; pushed back a touch so their own edges sit on top
  const occluder = new THREE.MeshBasicMaterial({ colorWrite: false, polygonOffset: true, polygonOffsetFactor: 2, polygonOffsetUnits: 2 });
  const line = new THREE.LineBasicMaterial({ color: ink() });
  // the silhouette: each part's back faces pushed out along their normals by a fixed number of
  // pixels (an inverted hull), so round parts get a clean outline, like an isometric drawing
  const outline = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    uniforms: { uColor: { value: ink() }, uWidth: { value: OUTLINE * Math.min(devicePixelRatio, 2) }, uRes: { value: new THREE.Vector2(1, 1) } },
    vertexShader: `
      uniform float uWidth;
      uniform vec2 uRes;
      void main() {
        vec4 clip = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        vec2 n = (projectionMatrix * vec4(normalize(normalMatrix * normal), 0.0)).xy;
        float l = length(n);
        if (l > 1e-5) clip.xy += n / l * uWidth * 2.0 / uRes * clip.w;
        gl_Position = clip;
      }`,
    fragmentShader: `
      uniform vec3 uColor;
      uniform float uAlpha;
      void main() {
        gl_FragColor = vec4(uColor, uAlpha);
        #include <colorspace_fragment>
      }`,
  });
  outline.uniforms.uAlpha = { value: 1 };
  // the ghosting casings get their own see-through copies of the line and outline
  const ghostLine = new THREE.LineBasicMaterial({ color: ink(), transparent: true, depthWrite: false });
  const ghostOutline = outline.clone();
  ghostOutline.transparent = true;
  ghostOutline.depthWrite = false;

  // each part keeps its own group, so it can slide along the axis
  const assembly = new THREE.Group();
  const parts: { g: import('three').Group; x: number; spin: number }[] = [];
  const meshes: import('three').Mesh[] = [];
  gltf.scene.traverse((o) => {
    if ((o as import('three').Mesh).isMesh) meshes.push(o as import('three').Mesh);
  });
  for (const m of meshes) {
    m.updateWorldMatrix(true, false);
    const geom = m.geometry.clone().applyMatrix4(m.matrixWorld);
    geom.computeBoundingBox();
    // the outer and inner casings (each runs nearly the full length) are left out: the
    // hologram shows the engine's working parts
    if (geom.boundingBox!.max.x - geom.boundingBox!.min.x > 1) {
      geom.dispose();
      continue;
    }
    const cx = (geom.boundingBox!.min.x + geom.boundingBox!.max.x) / 2;
    if (!geom.attributes.normal) geom.computeVertexNormals();
    const edges = new THREE.EdgesGeometry(geom, EDGE_ANGLE);
    const g = new THREE.Group();
    const no = Number(/(\d{3})_/.exec(`${m.name} ${m.parent?.name ?? ''}`)?.[1] ?? -1);
    const ghost = GHOST.has(no);
    const solidBody = new THREE.Mesh(geom, occluder);
    solidBody.renderOrder = -1; // every hiding solid lays its depth down before any line is drawn
    const objs = [solidBody, new THREE.Mesh(geom, ghost ? ghostOutline : outline), new THREE.LineSegments(edges, ghost ? ghostLine : line)];
    if (ghost) objs.forEach((o) => o.layers.set(1)); // casings live on their own layer
    g.add(...objs);
    assembly.add(g);
    parts.push({ g, x: cx, spin: SPIN[no] ?? 0 });
    await new Promise((r) => setTimeout(r, 0)); // a big assembly never blocks a frame
  }
  // three-quarter view, then the whole thing leaned onto the diagonal
  assembly.rotation.y = YAW;
  const tilt = new THREE.Group();
  tilt.rotation.x = TILT;
  tilt.add(assembly);
  const lean = new THREE.Group();
  lean.rotation.z = LEAN;
  lean.add(tilt);
  scene.add(lean);

  // frame the fully exploded jet, so the spread never leaves the drawing area
  const frame = () => {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    renderer.getDrawingBufferSize(outline.uniforms.uRes.value);
    ghostOutline.uniforms.uRes.value.copy(outline.uniforms.uRes.value);
    solidRT.setSize(outline.uniforms.uRes.value.x, outline.uniforms.uRes.value.y);
    ghostRT.setSize(outline.uniforms.uRes.value.x, outline.uniforms.uRes.value.y);
    parts.forEach((p) => (p.g.position.x = p.x * SPREAD));
    lean.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(lean);
    const c = box.getCenter(new THREE.Vector3());
    const half = Math.max((box.max.x - box.min.x) / 2 / (w / h), (box.max.y - box.min.y) / 2) * 1.04;
    camera.left = c.x - half * (w / h);
    camera.right = c.x + half * (w / h);
    camera.top = c.y + half;
    camera.bottom = c.y - half;
    camera.updateProjectionMatrix();
  };

  let explode = -1;
  const place = () => {
    // assembled at the top of the page; fully exploded after ~60% of a screen of scrolling
    const t = reduce ? 0 : Math.min(1, Math.max(0, window.scrollY / (window.innerHeight * 0.6)));
    const p = t * t * (3 - 2 * t);
    if (p === explode) return false;
    explode = p;
    parts.forEach((part) => (part.g.position.x = part.x * SPREAD * p));
    return true;
  };
  // the two looks of the jet, drawn to off-screen frames and crossfaded while the casings go:
  // solid (the casings hide what's inside) and ghosted (they're faint lines, the blades show).
  // A crossfade, not a switch, so the blades fade in as the casings fade out
  const target = () => new THREE.WebGLRenderTarget(1, 1, { samples: 4 });
  const solidRT = target();
  const ghostRT = target();
  const mix = new THREE.ShaderMaterial({
    uniforms: { uA: { value: solidRT.texture }, uB: { value: ghostRT.texture }, uF: { value: 0 } },
    vertexShader: 'varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }',
    fragmentShader: `
      uniform sampler2D uA, uB;
      uniform float uF;
      varying vec2 vUv;
      void main() {
        // the frames hold premultiplied linear colour: un-premultiply, convert, premultiply again,
        // so a faint line keeps its own colour (converting the premultiplied value lightened
        // faint lines into a pale haze on the light sheet)
        vec4 c = mix(texture2D(uA, vUv), texture2D(uB, vUv), uF);
        gl_FragColor = vec4(c.rgb / max(c.a, 1e-5), 1.0);
        #include <colorspace_fragment>
        gl_FragColor = vec4(gl_FragColor.rgb * c.a, c.a);
      }`,
    blending: THREE.NoBlending,
    depthTest: false,
    depthWrite: false,
  });
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mix);
  quad.frustumCulled = false;
  const quadScene = new THREE.Scene();
  quadScene.add(quad);

  const casingAlpha = (a: number) => {
    ghostLine.opacity = a;
    ghostOutline.uniforms.uAlpha.value = a;
  };
  const renderSolid = () => {
    casingAlpha(1); // the casings at full strength: the assembled jet
    camera.layers.enableAll();
    renderer.render(scene, camera);
  };
  const renderGhost = () => {
    // everything else first, then the casings in a pass of their own, depth-tested against it:
    // solid parts in front still hide them, and the blades already drawn behind them stay
    // visible (a casing's own solid writes depth only, so it trims its far side and nothing else)
    casingAlpha(GHOST_MIN);
    camera.layers.set(0);
    renderer.render(scene, camera);
    camera.layers.set(1);
    renderer.render(scene, camera);
  };
  const draw = () => {
    // the casings ghost out over the first ~60% of the explosion, on an eased curve
    const k = Math.min(1, Math.max(0, explode) / 0.6);
    const f = k * k * (3 - 2 * k);
    // every frame goes through the same off-screen frames and the same blend, even at either
    // end: drawing straight to the canvas blends faint lines differently, which made them jump
    if (f < 0.999) {
      renderer.setRenderTarget(solidRT);
      renderer.clear();
      renderSolid();
    }
    if (f > 0.001) {
      renderer.setRenderTarget(ghostRT);
      renderer.clear();
      renderGhost();
    }
    renderer.setRenderTarget(null);
    renderer.clear();
    mix.uniforms.uF.value = f <= 0.001 ? 0 : f >= 0.999 ? 1 : f;
    camera.layers.enableAll(); // the ghost pass left the camera on the casings' layer only
    renderer.render(quadScene, camera);
  };

  frame();
  place();
  draw();
  canvas.classList.add('is-on');

  // the blades turn all the time (each part about the engine's axis, which is its own x),
  // exploded or not; it runs only while the hologram is on screen and the tab is visible.
  // Under reduced motion nothing turns and it redraws only when the scroll moves it.
  const spinning = parts.filter((p) => p.spin);
  let raf = 0;
  let last = 0;
  let onScreen = true;
  const tick = (now: number) => {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    spinning.forEach((p) => (p.g.rotation.x += p.spin * dt));
    place();
    draw();
    raf = onScreen && !document.hidden ? requestAnimationFrame(tick) : 0;
  };
  const run = () => {
    if (reduce || raf || !onScreen || document.hidden) return;
    last = performance.now();
    raf = requestAnimationFrame(tick);
  };
  new IntersectionObserver(([e]) => {
    onScreen = e.isIntersecting;
    run();
  }).observe(canvas);
  document.addEventListener('visibilitychange', run);
  run();

  // without the spin loop (reduced motion), a scroll or a change redraws once
  let queued = 0;
  const queue = () => {
    if (raf || queued) return;
    queued = requestAnimationFrame(() => {
      queued = 0;
      place();
      draw();
    });
  };
  window.addEventListener('scroll', queue, { passive: true });
  new ResizeObserver(() => {
    frame();
    explode = -1;
    queue();
  }).observe(canvas);
  // the hologram is drawn in the accent, which deepens on the light sheet
  document.addEventListener('themechange', () => {
    line.color = ink();
    outline.uniforms.uColor.value = ink();
    ghostLine.color = ink();
    ghostOutline.uniforms.uColor.value = ink();
    queue();
  });
}
