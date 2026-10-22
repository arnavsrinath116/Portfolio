/**
 * The Music tab: a small modern room in three.js with cannon-es physics. A record rack on the
 * left wall holds the catalogue; a turntable sits on a sideboard. Grab anything (sleeves, the
 * ball, the blocks) and throw it; drop a sleeve on the turntable, or click one on the wall, and
 * its record goes on and plays. three.js and cannon-es load only when the tab is first opened,
 * and the room only renders while it's open and on screen.
 *
 * The music is generated in the browser (Web Audio), one original loop per record, so there are
 * no audio files and no licences to worry about. A record can carry `src` (an audio file you own)
 * to play that instead.
 */
type THREE_ = typeof import('three');
type CANNON_ = typeof import('cannon-es');

type Track = {
  title: string;
  artist: string;
  color: string;
  ink: string;
  bpm: number;
  root: number; // midi note of the key
  chords: number[][]; // semitones from the root, one chord per bar
  wave: OscillatorType;
  beat: boolean;
  /** your own recording, in public/: e.g. '/room/music/night-drive.mp3'. Without it, the loop above plays */
  src?: string;
  /**
   * a Spotify link to the song, e.g. 'https://open.spotify.com/track/…'. It plays in Spotify's own
   * compact player, shown in the room while it's on: the whole song for a visitor signed in to
   * Spotify in that browser, a 30-second preview otherwise (Spotify's rule for embeds).
   */
  spotify?: string;
};

// the catalogue: four songs, each played through Spotify. The loop settings stay
// as a fallback (a record without `spotify` or `src` plays its own generated loop).
const TRACKS: Track[] = [
  { title: 'Sailor Song', artist: 'Gigi Perez', spotify: 'https://open.spotify.com/track/2262bWmqomIaJXwCRHr13j', color: '#4f8aa3', ink: '#f4f0e8', bpm: 84, root: 57, wave: 'triangle', beat: true, chords: [[0, 3, 7, 10], [-4, 0, 3, 7], [3, 7, 10, 14], [-2, 2, 5, 9]] },
  { title: 'Experience (Reimagined)', artist: 'Ludovico Einaudi', spotify: 'https://open.spotify.com/track/68GdTctioc47DxFQ1XXr7P', color: '#1b2025', ink: '#94c4d9', bpm: 70, root: 52, wave: 'sine', beat: false, chords: [[0, 7, 11, 14], [-3, 4, 7, 11], [5, 9, 12, 16], [2, 5, 9, 12]] },
  { title: 'The Winner Is', artist: 'DeVotchKa & Mychael Danna', spotify: 'https://open.spotify.com/track/7wFEzF8FbofVlQS1OcbghM', color: '#e8b84a', ink: '#14171a', bpm: 98, root: 55, wave: 'triangle', beat: true, chords: [[0, 4, 7, 11], [-3, 0, 4, 7], [2, 5, 9, 12], [-5, -1, 2, 5]] },
  { title: 'Purpose Is Glorious', artist: 'Natalie Holt', spotify: 'https://open.spotify.com/track/14ttivyM8Dj0xichnst1Vd', color: '#2d3a2e', ink: '#d8b25a', bpm: 78, root: 48, wave: 'sine', beat: false, chords: [[0, 3, 7, 10], [5, 8, 12, 15], [3, 7, 10, 14], [-2, 3, 7, 10]] },
];

// ---------------------------------------------------------------------------------------------
// Spotify: the Embed iFrame API, loaded the first time a record with a link goes on
type SpotifyController = { loadUri(uri: string): void; play(): void; pause(): void; resume(): void; addListener(ev: string, fn: () => void): void };
type SpotifyApi = { createController(el: HTMLElement, opts: object, cb: (c: SpotifyController) => void): void };
declare global {
  interface Window {
    onSpotifyIframeApiReady?: (api: SpotifyApi) => void;
  }
}
let spotifyApi: Promise<SpotifyApi> | null = null;
const loadSpotify = () =>
  (spotifyApi ??= new Promise<SpotifyApi>((resolve) => {
    window.onSpotifyIframeApiReady = (api) => resolve(api);
    const tag = document.createElement('script');
    tag.src = 'https://open.spotify.com/embed/iframe-api/v1';
    tag.async = true;
    document.head.append(tag);
  }));
// 'https://open.spotify.com/track/ID?si=…' (or a 'spotify:track:ID' uri) → 'spotify:track:ID'
const spotifyUri = (link: string) => {
  if (link.startsWith('spotify:')) return link;
  const m = link.match(/open\.spotify\.com\/(?:intl-[a-z]+\/)?(track|album|playlist|episode)\/([A-Za-z0-9]+)/);
  return m ? `spotify:${m[1]}:${m[2]}` : link;
};

// Spotify's player in the room: shown while a Spotify record is on
class Spot {
  ctl: SpotifyController | null = null;
  current = '';
  pending: Promise<SpotifyController> | null = null;
  constructor(private host: HTMLElement) {}
  private get card() {
    return this.host.querySelector<HTMLElement>('[data-room-spotify]');
  }
  async play(link: string) {
    const uri = spotifyUri(link);
    const card = this.card;
    if (!card) return;
    card.hidden = false;
    if (!this.ctl) {
      this.current = uri;
      this.pending ??= loadSpotify().then(
        (api) =>
          new Promise<SpotifyController>((resolve) =>
            api.createController(card.querySelector<HTMLElement>('[data-room-spotify-player]')!, { uri, width: '100%', height: 80 } /* Spotify's smallest player */, (c) => {
              c.addListener('ready', () => c.play());
              resolve(c);
            }),
          ),
      );
      this.ctl = await this.pending;
      // a different record went on while the player was loading
      if (this.current !== uri) this.ctl.loadUri(this.current);
      return;
    }
    if (this.current === uri) this.ctl.resume();
    else {
      this.current = uri;
      this.ctl.loadUri(uri);
      this.ctl.play();
    }
  }
  pause() {
    this.ctl?.pause();
  }
  hide() {
    this.pause();
    const card = this.card;
    if (card) card.hidden = true;
  }
}

// ---------------------------------------------------------------------------------------------
// the music: a tiny step sequencer, pads + bass + soft drums + vinyl crackle, through a low-pass
class Loops {
  ctx: AudioContext | null = null;
  out: GainNode | null = null;
  bus: BiquadFilterNode | null = null;
  timer = 0;
  next = 0;
  step = 0;
  track: Track | null = null;
  el: HTMLAudioElement | null = null;
  crackle: AudioBufferSourceNode | null = null;
  noise: AudioBuffer | null = null;
  constructor(private tube: Spot) {}

  private ensure() {
    if (this.ctx) return this.ctx;
    const ctx = new AudioContext();
    this.ctx = ctx;
    this.out = ctx.createGain();
    this.out.gain.value = 0;
    this.bus = ctx.createBiquadFilter();
    this.bus.type = 'lowpass';
    this.bus.frequency.value = 2400;
    this.bus.connect(this.out).connect(ctx.destination);
    const n = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const d = n.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    this.noise = n;
    return ctx;
  }

  play(t: Track) {
    this.stop(true);
    this.track = t;
    if (t.spotify) {
      void this.tube.play(t.spotify);
      return;
    }
    this.tube.hide();
    if (t.src) {
      // a path in /public, e.g. '/room/music/song.mp3'; the site's base path is added here
      this.el = new Audio(t.src.startsWith('http') ? t.src : `${import.meta.env.BASE_URL.replace(/\/$/, '')}${t.src}`);
      this.el.loop = true;
      this.el.volume = 0.6;
      void this.el.play();
      return;
    }
    const ctx = this.ensure();
    void ctx.resume();
    this.out!.gain.cancelScheduledValues(ctx.currentTime);
    this.out!.gain.setTargetAtTime(0.22, ctx.currentTime, 0.4);
    this.step = 0;
    this.next = ctx.currentTime + 0.08;
    this.timer = window.setInterval(() => this.schedule(), 25);
    // the crackle of the needle in the groove
    const c = ctx.createBufferSource();
    c.buffer = this.noise;
    c.loop = true;
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 3200;
    const g = ctx.createGain();
    g.gain.value = 0.012;
    c.connect(hp).connect(g).connect(this.out!);
    c.start();
    this.crackle = c;
  }

  stop(now = false) {
    clearInterval(this.timer);
    this.tube.pause();
    this.el?.pause();
    this.el = null;
    if (this.ctx && this.out) {
      const t = this.ctx.currentTime;
      this.out.gain.cancelScheduledValues(t);
      this.out.gain.setTargetAtTime(0, t, now ? 0.05 : 0.3);
    }
    const c = this.crackle;
    this.crackle = null;
    if (c) window.setTimeout(() => c.stop(), now ? 100 : 1200);
  }

  private schedule() {
    const ctx = this.ctx!;
    const t = this.track!;
    const eighth = 60 / t.bpm / 2;
    while (this.next < ctx.currentTime + 0.12) {
      this.note(this.step, this.next, eighth, t);
      this.next += eighth;
      this.step++;
    }
  }

  private note(s: number, at: number, eighth: number, t: Track) {
    const ctx = this.ctx!;
    const bus = this.bus!;
    const e = s % 8;
    const chord = t.chords[Math.floor(s / 8) % t.chords.length];
    const hz = (m: number) => 440 * 2 ** ((m - 69) / 12);
    const tone = (m: number, start: number, len: number, type: OscillatorType, vol: number, attack = 0.02) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = type;
      o.frequency.value = hz(m);
      g.gain.setValueAtTime(0, start);
      g.gain.linearRampToValueAtTime(vol, start + attack);
      g.gain.setTargetAtTime(0, start + len * 0.8, len * 0.25);
      o.connect(g).connect(bus);
      o.start(start);
      o.stop(start + len * 1.6);
    };
    const hit = (freq: number, len: number, vol: number, type: BiquadFilterType) => {
      const src = ctx.createBufferSource();
      src.buffer = this.noise;
      const f = ctx.createBiquadFilter();
      f.type = type;
      f.frequency.value = freq;
      const g = ctx.createGain();
      g.gain.setValueAtTime(vol, at);
      g.gain.exponentialRampToValueAtTime(0.001, at + len);
      src.connect(f).connect(g).connect(bus);
      src.start(at, Math.random() * 0.5, len + 0.05);
    };
    // pads: the bar's chord, held
    if (e === 0) chord.forEach((n) => tone(t.root + 12 + n, at, eighth * 8, t.wave, 0.05, 0.12));
    // bass on the one and the three
    if (e === 0 || e === 4) tone(t.root - 12 + chord[0], at, eighth * 3.5, 'sine', 0.22, 0.01);
    if (t.beat) {
      if (e === 0 || e === 4) {
        // kick: a sine dropping fast
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.frequency.setValueAtTime(120, at);
        o.frequency.exponentialRampToValueAtTime(42, at + 0.14);
        g.gain.setValueAtTime(0.55, at);
        g.gain.exponentialRampToValueAtTime(0.001, at + 0.28);
        o.connect(g).connect(bus);
        o.start(at);
        o.stop(at + 0.3);
      }
      if (e === 2 || e === 6) hit(1800, 0.16, 0.12, 'bandpass');
      if (e % 2 === 1) hit(7000, 0.05, 0.05, 'highpass');
    }
    // a soft melody note now and then, from the chord, an octave up
    const r = Math.sin(s * 12.9898 + t.root * 78.233) * 43758.5453;
    const f = r - Math.floor(r); // 0–1, the same every time for this step
    if (e % 3 === 1 && f > 0.45) tone(t.root + 24 + chord[Math.floor(((f - 0.45) / 0.55) * chord.length) % chord.length], at, eighth * 2, 'sine', 0.04, 0.01);
  }
}

// ---------------------------------------------------------------------------------------------
export function initMusicRoom({ reduce }: { reduce: boolean }) {
  const host = document.querySelector<HTMLElement>('[data-room]');
  if (!host) return;
  const chap = host.closest<HTMLElement>('[data-about-chap]');
  const flat = () => !!host.closest('.is-flat');
  let inView = false;
  let open = flat() || !!chap?.classList.contains('is-on');
  let room: Awaited<ReturnType<typeof build>> | null = null;
  let building = false;

  const update = () => {
    const live = inView && (open || flat());
    if (live && !room && !building) {
      building = true;
      build(host, reduce)
        .then((r) => {
          room = r;
          update();
        })
        .catch((err) => {
          console.warn('music room', err);
          const s = host.querySelector('[data-room-status]');
          if (s) s.textContent = 'The room couldn’t load here.';
        });
    }
    room?.setLive(live);
  };
  new IntersectionObserver(([e]) => {
    inView = e.isIntersecting;
    update();
  }).observe(host);
  document.addEventListener('about:chapter', (e) => {
    open = (e as CustomEvent<number>).detail === Number(chap?.dataset.aboutChap);
    update();
  });
  // the music stops when you leave the About section altogether
  const about = document.querySelector('[data-about-me]');
  if (about)
    new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) room?.stop();
    }).observe(about);
}

async function build(host: HTMLElement, reduce: boolean) {
  const [THREE, CANNON, { GLTFLoader }, { DRACOLoader }] = (await Promise.all([
    import('three'),
    import('cannon-es'),
    import('three/examples/jsm/loaders/GLTFLoader.js'),
    import('three/examples/jsm/loaders/DRACOLoader.js'),
  ])) as [THREE_, CANNON_, typeof import('three/examples/jsm/loaders/GLTFLoader.js'), typeof import('three/examples/jsm/loaders/DRACOLoader.js')];
  const canvas = host.querySelector<HTMLCanvasElement>('[data-room-canvas]')!;
  const status = host.querySelector<HTMLElement>('[data-room-status]');
  const nowEl = host.querySelector<HTMLElement>('[data-room-now]');
  const toggle = host.querySelector<HTMLButtonElement>('[data-room-toggle]');
  const tidyBtn = host.querySelector<HTMLButtonElement>('[data-room-tidy]');
  const touch = window.matchMedia('(pointer: coarse)').matches;
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');

  // ---- renderer, scene, camera ----
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#231b1e');
  // the camera stands back in the room, facing the window, as in the Blender preview
  // (Blender's (x, y, z) is three's (x, z, -y))
  const camera = new THREE.PerspectiveCamera(36, 16 / 9, 0.05, 40);
  // close in on the table, the window, the records and the shelf, a little above eye level
  const camHome = new THREE.Vector3(0.1, 1.55, 1.8);
  const look = new THREE.Vector3(0.1, 1.12, -1.5);
  const HFOV = 66; // degrees
  const camPos = new THREE.Vector3();
  camera.position.copy(camHome);
  camera.lookAt(look);

  // ---- the room, modelled and light-baked in Blender (tools/room/build_room.py) ----
  const draco = new DRACOLoader().setDecoderPath(`${base}/draco/`);
  const gltf = await new GLTFLoader().setDRACOLoader(draco).loadAsync(`${base}/room/room.glb`);
  draco.dispose();
  const room = gltf.scene;
  // the bake already holds the sunset's light and shadow: show it as it is, unlit and un-tonemapped
  room.traverse((o) => {
    const m = o as import('three').Mesh;
    if (!m.isMesh) return;
    const src = m.material as import('three').MeshStandardMaterial;
    const map = src.emissiveMap ?? src.map;
    if (map) map.colorSpace = THREE.SRGBColorSpace;
    m.material = new THREE.MeshBasicMaterial({ map, toneMapped: false });
    src.dispose();
  });
  scene.add(room);
  const marker = (name: string, fallback: [number, number, number]) => {
    const o = room.getObjectByName(name);
    return o ? o.getWorldPosition(new THREE.Vector3()) : new THREE.Vector3(...fallback);
  };
  const platterAtBake = marker('M_Platter', [0.3, 0.855, -1.3]);

  // ---- light for the live things, matched to the bake: the low warm sun through the window ----
  scene.add(new THREE.HemisphereLight('#ffd6b8', '#5a3f34', 1.1));
  const sun = new THREE.DirectionalLight('#ffb27a', 2.2);
  const SUN_DIR = new THREE.Vector3(0.28, -0.82, 0.55).normalize();
  sun.target.position.set(0.2, 0.6, -0.6);
  sun.position.copy(sun.target.position).addScaledVector(SUN_DIR, -6);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -3, right: 3, top: 3, bottom: -3, near: 1, far: 14 });
  sun.shadow.camera.updateProjectionMatrix();
  sun.shadow.radius = 4;
  sun.shadow.bias = -0.0005;
  scene.add(sun, sun.target);
  const lamp = new THREE.PointLight('#ffc27a', 1.4, 3, 2);
  lamp.position.copy(marker('M_Lamp', [1.83, 2.0, -1.5]));
  scene.add(lamp);
  // the baked surfaces are unlit, so live shadows fall on invisible catchers laid over them
  const catcher = (w: number, d: number, x: number, y: number, z: number) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), new THREE.ShadowMaterial({ opacity: 0.32 }));
    m.rotation.x = -Math.PI / 2;
    m.position.set(x, y, z);
    m.receiveShadow = true;
    scene.add(m);
  };
  catcher(4.8, 4.4, 0.2, 0.002, 0.2); // floor
  catcher(2.0, 0.8, 0.25, 0.762, -1.25); // table top

  // ---- materials for the live things ----
  const mat = (color: string, rough = 0.85, metal = 0) => new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal });
  const M = {
    alu: mat('#c9ccd1', 0.3, 0.85),
    black: mat('#141517', 0.4),
    vinyl: mat('#0d0d0e', 0.3),
    ledge: mat('#e9e0cf', 0.7),
  };
  const box = (w: number, h: number, d: number, m: import('three').Material, x: number, y: number, z: number, shadow = true) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
    mesh.position.set(x, y, z);
    mesh.castShadow = shadow;
    mesh.receiveShadow = true;
    scene.add(mesh);
    return mesh;
  };

  // the room's bounds, for keeping carried things inside
  const B = { x0: -2.05, x1: 2.45, y1: 2.7, z0: -1.85, z1: 2.3 };

  // ---- the record player's live parts, on the baked plinth ----
  const top = 0.845; // the plinth's top
  const tt = new THREE.Group();
  tt.position.set(platterAtBake.x, top, platterAtBake.z);
  scene.add(tt);
  // an invisible pick volume over the whole deck, so a carried record knows it's over it
  const deck = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.1, 0.36), new THREE.MeshBasicMaterial({ visible: false }));
  deck.position.set(0.05, 0, 0);
  tt.add(deck);
  const platter = new THREE.Mesh(new THREE.CylinderGeometry(0.155, 0.155, 0.02, 64), M.alu);
  platter.position.set(0, 0.01, 0);
  platter.receiveShadow = true; // no live shadow: the baked table under it can't stop one reaching the floor
  tt.add(platter);
  const mat2 = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.003, 64), mat('#2a2522', 0.95));
  mat2.position.set(0, 0.0215, 0);
  tt.add(mat2);
  const record = new THREE.Group(); // the vinyl on the platter, while one plays
  const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.004, 64), M.vinyl);
  const labelMat = new THREE.MeshStandardMaterial({ color: '#94c4d9', roughness: 0.8 });
  const label = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.005, 48), labelMat);
  label.position.y = 0.0006;
  const groove = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.0015, 4, 64), M.black);
  groove.rotation.x = Math.PI / 2;
  groove.position.y = 0.0025;
  record.add(disc, label, groove);
  const REC_Y = 0.026;
  record.position.set(0, REC_Y, 0);
  record.visible = false;
  tt.add(record);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.006, 8, 64), new THREE.MeshBasicMaterial({ color: '#94c4d9', transparent: true, opacity: 0, toneMapped: false }));
  ring.rotation.x = Math.PI / 2;
  ring.position.set(0, 0.03, 0);
  tt.add(ring);
  const spindle = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.02, 12), M.alu);
  spindle.position.set(0, 0.032, 0);
  tt.add(spindle);
  // the tonearm: a post, an arm, a headshell; it swings in from its rest
  const arm = new THREE.Group();
  arm.position.set(0.21, 0.01, -0.12);
  tt.add(arm);
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.014, 0.05, 16), M.alu);
  post.position.y = 0.01;
  arm.add(post);
  const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.25, 12), M.alu);
  rod.rotation.x = Math.PI / 2;
  rod.position.set(0, 0.03, 0.125);
  arm.add(rod);
  const shell = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.008, 0.035), M.black);
  shell.position.set(0, 0.026, 0.255);
  arm.add(shell);
  const weight = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.03, 16), M.black);
  weight.rotation.x = Math.PI / 2;
  weight.position.set(0, 0.03, -0.03);
  arm.add(weight);
  // the arm points to the front at rest and swings left over the record to play: its pivot sits
  // right of and behind the platter, so the needle (0.255 out) lands 0.12 from the spindle, in the grooves
  const ARM_REST = 0.05;
  const ARM_PLAY = -0.56;
  arm.rotation.y = ARM_REST;
  // the smoked dust cover, hinged open at the back
  const hinge = new THREE.Group();
  hinge.position.set(0.05, 0, -0.18);
  hinge.rotation.x = -1.35;
  tt.add(hinge);
  const coverMat = new THREE.MeshPhysicalMaterial({ color: '#2a2a2e', roughness: 0.05, metalness: 0, transparent: true, opacity: 0.28, depthWrite: false, side: THREE.DoubleSide });
  const cover = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.11, 0.36), coverMat);
  cover.position.set(0, 0.055, 0.18);
  cover.renderOrder = 2;
  hinge.add(cover);
  const coverEdges = new THREE.LineSegments(new THREE.EdgesGeometry(cover.geometry), new THREE.LineBasicMaterial({ color: '#6b6a70', transparent: true, opacity: 0.6 }));
  coverEdges.position.copy(cover.position);
  hinge.add(coverEdges);

  // the catalogue: two ledges on the wall left of the window, the records face-out on them
  const WALL_Z = -2.0;
  const LEDGES = [1.12, 0.62];
  // no shadows from the wall by the window: the real sun can't reach it
  LEDGES.forEach((y) => box(1.2, 0.025, 0.12, M.ledge, -1.55, y, WALL_Z + 0.06, false));
  LEDGES.forEach((y) => box(1.2, 0.03, 0.012, M.ledge, -1.55, y + 0.02, WALL_Z + 0.115, false)); // a lip, so they don't slide off

  // ---- sleeves: each a record, its cover painted in tools/room/make_textures.py ----
  const texLoader = new THREE.TextureLoader();
  const cover0 = (i: number) => {
    const t = texLoader.load(`${base}/room/cover${i}.jpg`);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    return t;
  };
  const SLEEVE = 0.31;
  const sleeveGeo = new THREE.BoxGeometry(SLEEVE, SLEEVE, 0.014);
  type Thing = {
    mesh: import('three').Mesh;
    body: import('cannon-es').Body | null;
    home: { p: import('three').Vector3; q: import('three').Quaternion };
    shape: import('cannon-es').Shape;
    mass: number;
    track?: number;
  };
  const things: Thing[] = [];
  const sleeves: Thing[] = [];
  TRACKS.forEach((t, i) => {
    const face = new THREE.MeshStandardMaterial({ map: cover0(i), roughness: 0.7 });
    const edge = mat(t.color, 0.8);
    // box faces: +z is the front, facing the room
    const mesh = new THREE.Mesh(sleeveGeo, [edge, edge, edge, edge, face, edge]);
    mesh.receiveShadow = true; // casts a shadow only once it's off its ledge (wake)
    // two records a ledge, centred on it
    const shelf = Math.floor(i / 2);
    const slot = i % 2;
    const p = new THREE.Vector3(-1.76 + slot * 0.42, LEDGES[shelf] + 0.0125 + SLEEVE / 2, WALL_Z + 0.07);
    const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(-0.1, 0, 0)); // leaning back on the wall
    mesh.position.copy(p);
    mesh.quaternion.copy(q);
    mesh.userData.pick = true;
    scene.add(mesh);
    const th: Thing = { mesh, body: null, home: { p, q }, shape: new CANNON.Box(new CANNON.Vec3(SLEEVE / 2, SLEEVE / 2, 0.007)), mass: 0.25, track: i };
    mesh.userData.thing = th;
    things.push(th);
    sleeves.push(th);
  });

  // ---- physics: the room's solid parts, as boxes and planes ----
  const world = new CANNON.World({ gravity: new CANNON.Vec3(0, -9.82, 0) });
  world.allowSleep = true;
  world.broadphase = new CANNON.SAPBroadphase(world);
  const surface = new CANNON.Material('s');
  world.defaultContactMaterial.friction = 0.4;
  world.defaultContactMaterial.restitution = 0.25;
  const fixed = (shape: import('cannon-es').Shape, x: number, y: number, z: number, q?: import('cannon-es').Quaternion) => {
    const b = new CANNON.Body({ mass: 0, material: surface });
    b.addShape(shape);
    b.position.set(x, y, z);
    if (q) b.quaternion.copy(q);
    world.addBody(b);
    return b;
  };
  const plane = (x: number, y: number, z: number, ax: number, ay: number) => {
    const q = new CANNON.Quaternion();
    q.setFromEuler(ax, ay, 0);
    return fixed(new CANNON.Plane(), x, y, z, q);
  };
  plane(0, 0, 0, -Math.PI / 2, 0); // floor
  plane(0, 0, WALL_Z, 0, 0); // the back wall, and the window (as if glazed)
  plane(-2.2, 0, 0, 0, Math.PI / 2); // left wall
  plane(2.6, 0, 0, 0, -Math.PI / 2); // the right edge of the room
  plane(0, 0, 2.5, 0, Math.PI); // in front of the camera
  plane(0, 2.9, 0, Math.PI / 2, 0); // ceiling
  const half = (x: number, y: number, z: number) => new CANNON.Vec3(x / 2, y / 2, z / 2);
  fixed(new CANNON.Box(half(2.0, 0.05, 0.8)), 0.25, 0.735, -1.25); // table top
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) fixed(new CANNON.Box(half(0.07, 0.71, 0.07)), 0.25 + sx * 0.92, 0.355, -1.25 + sz * 0.32);
  fixed(new CANNON.Box(half(0.46, 0.085, 0.36)), platterAtBake.x + 0.05, 0.8025, platterAtBake.z); // the record player
  fixed(new CANNON.Box(half(0.34, 0.31, 0.14)), -0.44, 0.915, -1.5); // the records leaning on the wall
  fixed(new CANNON.Box(half(0.33, 0.05, 0.33)), -0.27, 0.785, -1.13); // the flat pile
  fixed(new CANNON.Box(half(0.22, 0.15, 0.16)), -0.07, 0.835, -1.47); // the books
  fixed(new CANNON.Box(half(2.46, 0.04, 0.24)), 0.3, 0.93, -1.94); // the sill
  fixed(new CANNON.Box(half(0.95, 2.0, 0.4)), 2.05, 1.0, -1.55); // the record shelf
  LEDGES.forEach((y) => fixed(new CANNON.Box(half(1.2, 0.025, 0.12)), -1.55, y, WALL_Z + 0.06));

  const wake = (th: Thing) => {
    if (th.body) return th.body;
    const b = new CANNON.Body({ mass: th.mass, material: surface, linearDamping: 0.12, angularDamping: 0.3 });
    b.addShape(th.shape);
    b.position.set(th.mesh.position.x, th.mesh.position.y, th.mesh.position.z);
    b.quaternion.set(th.mesh.quaternion.x, th.mesh.quaternion.y, th.mesh.quaternion.z, th.mesh.quaternion.w);
    b.sleepSpeedLimit = 0.08;
    th.mesh.castShadow = true;
    world.addBody(b);
    th.body = b;
    return b;
  };
  const rest = (th: Thing) => {
    if (!th.body) return;
    world.removeBody(th.body);
    th.body = null;
  };

  // ---- tweens: a sleeve flying to the stand, a record dropping on ----
  type Tw = { o: import('three').Object3D; p0: import('three').Vector3; p1: import('three').Vector3; q0: import('three').Quaternion; q1: import('three').Quaternion; t: number; d: number; arc: number; done?: () => void };
  let tweens: Tw[] = [];
  const fly = (o: import('three').Object3D, p1: import('three').Vector3, q1: import('three').Quaternion, d = 0.8, arc = 0.35, done?: () => void) => {
    tweens = tweens.filter((t) => t.o !== o);
    tweens.push({ o, p0: o.position.clone(), p1: p1.clone(), q0: o.quaternion.clone(), q1: q1.clone(), t: 0, d: reduce ? 0.01 : d, arc, done });
  };
  const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2);

  // ---- playing ----
  const loops = new Loops(new Spot(host));
  // the record playing stands on the table beside the player, leaning back
  const standP = new THREE.Vector3(platterAtBake.x + 0.5, 0.76 + SLEEVE / 2 + 0.004, -1.58);
  const standQ = new THREE.Quaternion().setFromEuler(new THREE.Euler(-0.12, -0.15, 0));
  let playing: Thing | null = null;
  let paused = false;
  let armTarget = ARM_REST;
  let spin = 0;
  const setNow = () => {
    if (!nowEl) return;
    if (!playing) nowEl.textContent = 'Pick a record';
    else {
      const t = TRACKS[playing.track!];
      nowEl.textContent = `${t.title} · ${t.artist}`;
    }
    host.classList.toggle('is-playing', !!playing && !paused);
    if (toggle) {
      toggle.disabled = !playing;
      toggle.textContent = playing && !paused ? 'Pause' : 'Play';
    }
  };
  const play = (th: Thing) => {
    if (playing === th) return;
    if (playing) {
      const prev = playing;
      rest(prev);
      fly(prev.mesh, prev.home.p, prev.home.q, 0.9, 0.35, () => (prev.mesh.castShadow = false));
    }
    rest(th);
    playing = th;
    paused = false;
    fly(th.mesh, standP, standQ, 0.9, 0.4);
    const t = TRACKS[th.track!];
    labelMat.color.set(t.color);
    record.visible = true;
    record.position.y = 0.32;
    armTarget = ARM_REST;
    loops.stop(true);
    window.setTimeout(() => {
      if (playing !== th) return;
      armTarget = ARM_PLAY;
      loops.play(t);
      setNow();
    }, reduce ? 0 : 900);
    setNow();
  };
  const stop = () => {
    loops.stop();
    paused = true;
    armTarget = ARM_REST;
    setNow();
  };
  toggle?.addEventListener('click', () => {
    if (!playing) return;
    if (paused) {
      paused = false;
      armTarget = ARM_PLAY;
      loops.play(TRACKS[playing.track!]);
      setNow();
    } else stop();
  });
  const tidy = () => {
    things.forEach((th) => {
      rest(th);
      if (th === playing) return;
      fly(th.mesh, th.home.p, th.home.q, 0.8, 0.2, () => {
        if (th.track === undefined) wake(th);
        else th.mesh.castShadow = false; // back on its ledge
      });
    });
  };
  tidyBtn?.addEventListener('click', tidy);

  // is a point over the turntable?
  const platterAt = new THREE.Vector3();
  const near = (p: { x: number; z: number }, r: number) => {
    platter.getWorldPosition(platterAt);
    return Math.hypot(p.x - platterAt.x, p.z - platterAt.z) < r;
  };

  // ---- picking and dragging ----
  const ray = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  const picks = things.map((t) => t.mesh);
  const joint = new CANNON.Body({ mass: 0 });
  joint.collisionFilterGroup = 0;
  joint.collisionFilterMask = 0;
  world.addBody(joint);
  let held: { th: Thing; c: import('cannon-es').PointToPointConstraint; plane: import('three').Plane; damp: number } | null = null;
  let over = false; // a carried record is over the turntable
  let down: { x: number; y: number; th: Thing | null } | null = null;
  const hitAt = (e: PointerEvent) => {
    const r = canvas.getBoundingClientRect();
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
  };
  const v = new THREE.Vector3();
  canvas.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    hitAt(e);
    const hit = ray.intersectObjects(picks, false)[0];
    const th = (hit?.object.userData.thing as Thing) ?? null;
    down = { x: e.clientX, y: e.clientY, th };
    if (!th || touch || th === playing) return; // phones: tap to play, no dragging
    tweens = tweens.filter((t) => t.o !== th.mesh);
    const b = wake(th);
    b.wakeUp();
    const local = b.pointToLocalFrame(new CANNON.Vec3(hit.point.x, hit.point.y, hit.point.z));
    joint.position.set(hit.point.x, hit.point.y, hit.point.z);
    const c = new CANNON.PointToPointConstraint(b, local, joint, new CANNON.Vec3(0, 0, 0), 60);
    world.addConstraint(c);
    // carried on a plane facing the camera through the grabbed point, so it follows the pointer
    // one to one; lifted a little first so it clears whatever it sat on
    const n = camera.getWorldDirection(new THREE.Vector3()).negate();
    const grab = hit.point.clone();
    grab.y += th.track !== undefined ? 0 : 0.12;
    held = { th, c, plane: new THREE.Plane().setFromNormalAndCoplanarPoint(n, grab), damp: b.angularDamping };
    b.angularDamping = 0.95; // no wild spinning while it's held
    canvas.setPointerCapture(e.pointerId);
    host.classList.add('is-grabbing');
  });
  canvas.addEventListener('pointermove', (e) => {
    hitAt(e);
    if (!held) {
      if (!touch) host.classList.toggle('is-over', ray.intersectObjects(picks, false).length > 0);
      return;
    }
    // carrying a record over the player: it hovers above the platter, and the ring lights
    over = held.th.track !== undefined && ray.intersectObject(deck, false).length > 0;
    if (over) {
      platter.getWorldPosition(v);
      joint.position.set(v.x, v.y + 0.3, v.z);
      return;
    }
    const p = ray.ray.intersectPlane(held.plane, v);
    if (!p) return;
    joint.position.set(Math.max(B.x0, Math.min(B.x1, p.x)), Math.max(0.05, Math.min(B.y1, p.y)), Math.max(B.z0, Math.min(B.z1, p.z)));
  });
  const release = (e: PointerEvent) => {
    const moved = down ? Math.hypot(e.clientX - down.x, e.clientY - down.y) : 99;
    const th = down?.th ?? null;
    down = null;
    const wasOver = over;
    over = false;
    if (held) {
      if (held.th.body) held.th.body.angularDamping = held.damp;
      world.removeConstraint(held.c);
      held = null;
      host.classList.remove('is-grabbing');
    }
    // a click on a sleeve plays it; so does letting one go anywhere over the turntable
    if (th && th.track !== undefined) {
      if (moved < 6 || wasOver) play(th);
      else if (th.body && near(th.body.position, 0.45)) play(th);
    }
  };
  canvas.addEventListener('pointerup', release);
  canvas.addEventListener('pointercancel', release);

  // where the camera rests for this frame's shape: back along its line of sight when too narrow
  const camHomeFor = (out: import('three').Vector3) => {
    const vfov = (2 * Math.atan(Math.tan((HFOV * Math.PI) / 360) / camera.aspect) * 180) / Math.PI;
    const k = vfov > 64 ? Math.tan((vfov * Math.PI) / 360) / Math.tan((64 * Math.PI) / 360) : 1;
    // a tall (phone) frame crops the sides instead, so the table stays the size of the scene
    return out.copy(look).add(camHome.clone().sub(look).multiplyScalar(camera.aspect < 1 ? 1.15 : Math.min(k, 1.8)));
  };

  // ---- size ----
  const size = () => {
    const w = host.clientWidth;
    const h = host.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // the width stays framed: a narrow frame gets a taller view, then steps back once that's tall enough
    const vfov = (2 * Math.atan(Math.tan((HFOV * Math.PI) / 360) / camera.aspect) * 180) / Math.PI;
    camera.fov = Math.min(vfov, 64);
    camHomeFor(camPos);
    camera.position.copy(camPos);
    camera.lookAt(look);
    camera.updateProjectionMatrix();
  };
  size();
  new ResizeObserver(size).observe(host);

  // ---- the loop ----
  const clock = new THREE.Clock();
  let parX = 0;
  let parY = 0;
  host.addEventListener('pointermove', (e) => {
    const r = host.getBoundingClientRect();
    parX = (e.clientX - r.left) / r.width - 0.5;
    parY = (e.clientY - r.top) / r.height - 0.5;
  });
  const tick = () => {
    const dt = Math.min(clock.getDelta(), 1 / 20);
    world.fixedStep(1 / 60, dt);
    for (const th of things) {
      if (!th.body) continue;
      th.mesh.position.set(th.body.position.x, th.body.position.y, th.body.position.z);
      th.mesh.quaternion.set(th.body.quaternion.x, th.body.quaternion.y, th.body.quaternion.z, th.body.quaternion.w);
      // a sleeve let go over the turntable plays
      if (th.track !== undefined && held?.th !== th && th !== playing) {
        if (near(th.body.position, 0.32) && th.body.position.y < top + 0.6) play(th);
      }
    }
    tweens = tweens.filter((tw) => {
      tw.t = Math.min(1, tw.t + dt / tw.d);
      const k = ease(tw.t);
      tw.o.position.lerpVectors(tw.p0, tw.p1, k);
      tw.o.position.y += Math.sin(Math.PI * k) * tw.arc;
      tw.o.quaternion.slerpQuaternions(tw.q0, tw.q1, k);
      if (tw.t >= 1) tw.done?.();
      return tw.t < 1;
    });
    // the record settles onto the platter, then spins at 33⅓
    record.position.y += (REC_Y - record.position.y) * (1 - Math.exp(-dt * 6));
    spin += ((playing && !paused ? 3.49 : 0) - spin) * (1 - Math.exp(-dt * (playing && !paused ? 1.5 : 3)));
    platter.rotation.y += spin * dt;
    record.rotation.y += spin * dt;
    arm.rotation.y += (armTarget - arm.rotation.y) * (1 - Math.exp(-dt * 3));
    const ringMat = ring.material as import('three').MeshBasicMaterial;
    ringMat.opacity += ((over ? 0.9 : 0) - ringMat.opacity) * (1 - Math.exp(-dt * 10));
    // a touch of parallax as the pointer moves
    if (!reduce) {
      camHomeFor(camPos);
      camera.position.x += (camPos.x + parX * 0.25 - camera.position.x) * 0.05;
      camera.position.y += (camPos.y - parY * 0.12 - camera.position.y) * 0.05;
      camera.lookAt(look);
    }
    renderer.render(scene, camera);
  };

  if (import.meta.env.DEV) {
    const at = (o: import('three').Object3D) => {
      const p = o.getWorldPosition(new THREE.Vector3()).project(camera);
      const r = canvas.getBoundingClientRect();
      return { x: r.left + ((p.x + 1) / 2) * r.width, y: r.top + ((1 - p.y) / 2) * r.height };
    };
    (window as unknown as { __room: unknown }).__room = { sleeve: (i: number) => at(sleeves[i].mesh), platter: () => at(platter), tracks: TRACKS };
  }

  status?.remove();
  host.classList.add('is-ready');
  setNow();
  return {
    setLive(live: boolean) {
      if (live) clock.getDelta(); // no jump after a pause
      renderer.setAnimationLoop(live ? tick : null);
    },
    stop() {
      if (playing && !paused) stop();
    },
  };
}
