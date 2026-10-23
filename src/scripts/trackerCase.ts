import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { pointAtLength } from './guide';

/**
 * The productivity tracker case study: a dark circuit-board card.
 * - a copper trace (the bus) routes down the left edge with 45° jogs, drawing itself
 *   as the card scrolls; at each chapter a branch runs into the chapter's pad, and its
 *   via lights up when the current reaches it;
 * - the firmware's v6 state machine runs in the browser, with its own serial monitor;
 * - blocks reveal with [data-a] (up, stagger), the BOM total counts up, and the
 *   firmware log lands commit by commit.
 * It builds the first time the card is shown and re-measures on every show.
 */
const SLUG = 'productivity-tracker';
const SVGNS = 'http://www.w3.org/2000/svg';

export function initTrackerCase({ reduce }: { reduce: boolean }) {
  const article = document.querySelector<HTMLElement>('[data-tk]');
  if (!article) return;
  let scroller: HTMLElement | null = null;
  let built = false;
  let active = false;

  // warm the hero photo as soon as someone shows intent to open the card
  const tile = document.querySelector<HTMLElement>(`[data-open-project="${SLUG}"]`);
  const warm = () => {
    const im = article.querySelector<HTMLImageElement>('.tk-hero-shot img');
    if (im) new Image().src = im.currentSrc || im.src;
  };
  tile?.addEventListener('pointerenter', warm, { once: true });
  tile?.addEventListener('focus', warm, { once: true });
  tile?.addEventListener('touchstart', warm, { once: true, passive: true });

  // ---------------- the copper bus ----------------
  const svg = article.querySelector<SVGSVGElement>('[data-tk-bus]')!;
  const trace = svg.querySelector<SVGPathElement>('[data-tk-trace]')!;
  const glow = svg.querySelector<SVGPathElement>('[data-tk-glow]')!;
  const statics = svg.querySelector<SVGGElement>('[data-tk-static]')!;
  const viaLayer = svg.querySelector<SVGGElement>('[data-tk-vias]')!;
  const spark = svg.querySelector<SVGCircleElement>('[data-tk-spark]')!;
  const halo = svg.querySelector<SVGCircleElement>('[data-tk-halo]')!;
  let total = 0;
  let xs: number[] = [];
  let ys: number[] = [];
  let ls: number[] = [];
  // each via on the bus, how far along the bus it sits, and the chapter head it powers
  let nodes: { el: SVGGElement; at: number; head?: HTMLElement }[] = [];

  const offsetTop = (el: HTMLElement) => {
    let y = 0;
    let n: HTMLElement | null = el;
    while (n && n !== article) {
      y += n.offsetTop;
      n = n.offsetParent as HTMLElement | null;
    }
    return y;
  };
  const offsetLeft = (el: HTMLElement) => {
    let x = 0;
    let n: HTMLElement | null = el;
    while (n && n !== article) {
      x += n.offsetLeft;
      n = n.offsetParent as HTMLElement | null;
    }
    return x;
  };

  /** length along the (top-to-bottom) trace where it first reaches depth y */
  const lengthAtY = (y: number) => {
    if (!ys.length || y <= ys[0]) return 0;
    const last = ys.length - 1;
    if (y >= ys[last]) return total;
    let lo = 0;
    let hi = last;
    while (hi - lo > 1) {
      const mid = (lo + hi) >> 1;
      if (ys[mid] < y) lo = mid;
      else hi = mid;
    }
    const f = (y - ys[lo]) / (ys[hi] - ys[lo] || 1);
    return ls[lo] + (ls[hi] - ls[lo]) * f;
  };

  const buildBus = () => {
    const W = article.clientWidth;
    const H = article.scrollHeight;
    svg.setAttribute('width', String(W));
    svg.setAttribute('height', String(H));
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    const block = article.querySelector<HTMLElement>('.tk-block');
    const pad = block ? parseFloat(getComputedStyle(block).paddingLeft) : 40;
    const lane = [Math.max(10, pad * 0.42), Math.max(10, pad * 0.42) + Math.min(12, pad * 0.32)];

    // the route: straight runs joined by 45° jogs, alternating lanes before each chapter
    let x = lane[0];
    let lanei = 0;
    const pts: { x: number; y: number }[] = [{ x, y: 18 }];
    const juncs: { x: number; y: number; px: number; head: HTMLElement }[] = [];
    article.querySelectorAll<HTMLElement>('[data-tk-via]').forEach((head) => {
      const padEl = head.querySelector<HTMLElement>('.tk-pin span');
      if (!padEl) return;
      const jy = offsetTop(padEl) + padEl.offsetHeight / 2;
      lanei = 1 - lanei;
      const nx = lane[lanei];
      const jogY = jy - 70;
      if (jogY > pts[pts.length - 1].y + 10) {
        pts.push({ x, y: jogY }, { x: nx, y: jogY + Math.abs(nx - x) });
        x = nx;
      }
      juncs.push({ x, y: jy, px: offsetLeft(padEl), head });
    });
    const lastCh = article.querySelector<HTMLElement>('#tk-ship .tk-block');
    pts.push({ x, y: lastCh ? offsetTop(lastCh) + lastCh.offsetHeight - 30 : H - 60 });

    // lookup table: the vertices themselves (every segment is straight)
    xs = pts.map((p) => p.x);
    ys = pts.map((p) => p.y);
    ls = [0];
    for (let i = 1; i < pts.length; i++) ls.push(ls[i - 1] + Math.hypot(xs[i] - xs[i - 1], ys[i] - ys[i - 1]));
    total = ls[ls.length - 1];
    const d = pts.map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
    for (const t of [trace, glow]) {
      t.setAttribute('d', d);
      t.setAttribute('pathLength', String(total));
      t.style.strokeDasharray = `${total}`;
    }

    statics.replaceChildren();
    const ghost = document.createElementNS(SVGNS, 'path');
    ghost.setAttribute('class', 'tk-static');
    ghost.setAttribute('d', d);
    statics.append(ghost);

    // a branch into each chapter's pad, with a via where it leaves the bus
    viaLayer.replaceChildren();
    nodes = juncs.map((j) => {
      const g = document.createElementNS(SVGNS, 'g');
      const stub = document.createElementNS(SVGNS, 'path');
      stub.setAttribute('class', 'tk-stub');
      stub.setAttribute('d', `M${j.x} ${j.y} H${j.px}`);
      const via = document.createElementNS(SVGNS, 'circle');
      via.setAttribute('class', 'tk-via');
      via.setAttribute('cx', String(j.x));
      via.setAttribute('cy', String(j.y));
      via.setAttribute('r', '4.5');
      g.append(stub, via);
      viaLayer.append(g);
      return { el: g, at: lengthAtY(j.y), head: j.head };
    });
    // the end of the line: a terminal pad
    const end = document.createElementNS(SVGNS, 'circle');
    end.setAttribute('class', 'tk-via');
    end.setAttribute('cx', String(x));
    end.setAttribute('cy', String(ys[ys.length - 1]));
    end.setAttribute('r', '6');
    const endG = document.createElementNS(SVGNS, 'g');
    endG.append(end);
    viaLayer.append(endG);
    nodes.push({ el: endG, at: total - 1 });
  };

  const place = (len: number) => {
    trace.style.strokeDashoffset = glow.style.strokeDashoffset = `${total - len}`;
    const p = pointAtLength({ xs, ys, ls }, len);
    for (const c of [spark, halo]) {
      c.setAttribute('cx', String(p.x));
      c.setAttribute('cy', String(p.y));
    }
    spark.style.opacity = halo.style.opacity = len > 2 && len < total - 2 ? '1' : '0';
    // the via lights, and its chapter heading strikes on, once the current gets there
    for (const n of nodes) {
      const on = len >= n.at;
      n.el.classList.toggle('is-live', on);
      n.head?.classList.toggle('is-live', on);
    }
  };

  // the drawn length eases toward the reading point, so wheel steps don't make it jump
  let shown = 0;
  let goal = 0;
  let raf = 0;
  let last = 0;
  const ease = (now: number) => {
    const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
    last = now;
    shown += (goal - shown) * (1 - Math.exp(-dt * 10));
    if (Math.abs(goal - shown) < 0.5) shown = goal;
    place(shown);
    raf = shown !== goal && active ? requestAnimationFrame(ease) : 0;
  };
  const aim = (snap = false) => {
    if (!scroller || !total) return;
    if (reduce) {
      shown = goal = total;
      place(total);
      spark.style.opacity = halo.style.opacity = '0';
      return;
    }
    goal = lengthAtY(scroller.scrollTop + scroller.clientHeight * 0.6);
    if (snap) {
      shown = goal;
      place(shown);
      return;
    }
    if (!raf) {
      last = performance.now();
      raf = requestAnimationFrame(ease);
    }
  };
  const onScroll = () => {
    if (active) aim();
  };

  // ---------------- the firmware, in the browser (code v6) ----------------
  const initSim = () => {
    const sim = article.querySelector<HTMLElement>('[data-tk-sim]');
    if (!sim) return;
    const pad = sim.querySelector<HTMLButtonElement>('[data-sim-pad]')!;
    const ring = sim.querySelector<HTMLElement>('[data-sim-beep]')!;
    const out = sim.querySelector<HTMLElement>('[data-sim-out]')!;
    const time = sim.querySelector<HTMLElement>('[data-sim-time]')!;
    const stateEl = sim.querySelector<HTMLElement>('[data-sim-state]')!;
    const servo = sim.querySelector<HTMLElement>('[data-sim-servo]')!;
    const leds = Array.from(sim.querySelectorAll<HTMLElement>('[data-sim-led]'));
    const NAMES = ['IDLE', 'EDITING', 'LOCKED'];
    let state = 0;
    let work = 0;
    let busy = false;
    let pressedAt = 0;
    let holdTimer = 0;
    let audio: AudioContext | null = null;

    const print = (...lines: string[]) => {
      for (const l of lines) {
        const p = document.createElement('p');
        p.textContent = l;
        out.append(p);
      }
      while (out.children.length > 12) out.firstElementChild!.remove();
    };
    const render = () => {
      time.textContent = work ? `${work} min` : '-- min';
      stateEl.textContent = NAMES[state];
      leds.forEach((l, i) => l.classList.toggle('is-on', i === state));
    };
    // the buzzer: a quiet square wave, only ever after a press
    const beep = (ms: number, delay = 0) => {
      window.setTimeout(() => {
        ring.classList.remove('is-beep');
        void ring.offsetWidth;
        ring.classList.add('is-beep');
      }, delay);
      try {
        audio ??= new AudioContext();
        const t = audio.currentTime + delay / 1000;
        const osc = audio.createOscillator();
        const gain = audio.createGain();
        osc.type = 'square';
        osc.frequency.value = 2400;
        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.exponentialRampToValueAtTime(0.025, t + 0.01);
        gain.gain.setValueAtTime(0.025, t + ms / 1000 - 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + ms / 1000);
        osc.connect(gain).connect(audio.destination);
        osc.start(t);
        osc.stop(t + ms / 1000 + 0.02);
      } catch {
        /* no audio: the ring still pulses */
      }
    };

    const shortPress = () => {
      if (state === 0) {
        state = 1;
        work = 15;
        print('System ON: Editing Mode', 'Time: 15 mins');
        beep(500);
      } else if (state === 1) {
        work += 15;
        print(`Time Updated: ${work} mins`);
        beep(100);
      } else print('(locked: short presses are ignored)');
      render();
    };
    const longPress = () => {
      if (state === 1) {
        state = 2;
        print(`TIME LOCKED: System will run for ${work} mins.`);
        beep(200);
        beep(200, 300);
      } else if (state === 2) {
        busy = true;
        print('SHUTTING DOWN: Triggering Servo...');
        // the horn swings 0° → 180° and back, as triggerServoAction() does
        servo.style.rotate = '90deg';
        window.setTimeout(() => (servo.style.rotate = ''), 800);
        window.setTimeout(() => {
          beep(1000);
          state = 0;
          work = 0;
          print('System Idle.');
          render();
          busy = false;
        }, 1600);
      } else print('(idle: tap first to start)');
      render();
    };

    const down = () => {
      if (busy || pressedAt) return;
      pressedAt = performance.now();
      pad.classList.add('is-down');
      // a cue once the hold counts as a long press
      holdTimer = window.setTimeout(() => pad.classList.add('is-held'), 500);
    };
    const up = () => {
      if (!pressedAt) return;
      const held = performance.now() - pressedAt;
      pressedAt = 0;
      clearTimeout(holdTimer);
      pad.classList.remove('is-down', 'is-held');
      if (held < 500) shortPress();
      else longPress();
    };
    pad.addEventListener('pointerdown', (e) => {
      if (e.button !== 0) return;
      pad.setPointerCapture(e.pointerId);
      down();
    });
    pad.addEventListener('pointerup', up);
    pad.addEventListener('pointercancel', () => {
      pressedAt = 0;
      clearTimeout(holdTimer);
      pad.classList.remove('is-down', 'is-held');
    });
    pad.addEventListener('contextmenu', (e) => e.preventDefault());
    pad.addEventListener('keydown', (e) => {
      if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) {
        e.preventDefault();
        down();
      }
    });
    pad.addEventListener('keyup', (e) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        up();
      }
    });
    render();
  };

  // ---------------- build (first show) ----------------
  const build = () => {
    const sc = scroller!;
    sc.addEventListener('scroll', onScroll, { passive: true });
    const ST = (trigger: Element, extra: ScrollTrigger.Vars = {}): ScrollTrigger.Vars => ({ trigger, scroller: sc, ...extra });
    const enter = (el: Element) => ST(el, { start: 'top 94%', end: 'top 74%', scrub: 0.35 });

    initSim();
    initSonar(sc);

    // the LED rail appears once the hero has scrolled away
    const rail = article.querySelector<HTMLElement>('[data-tk-rail]');
    if (rail)
      ScrollTrigger.create(
        ST(article.querySelector('.tk-hero')!, { start: 'top -35%', end: () => `+=${sc.scrollHeight}`, toggleClass: { targets: rail, className: 'is-on' } }),
      );

    // it rests folded to its LEDs, and opens with every chapter's name while a chapter's
    // header is on screen; past the header, it folds again
    const panel = rail?.querySelector<HTMLElement>('.tk-rail');
    if (panel) {
      // the pill beside the rail carries the current name, lined up with its row
      const now = panel.querySelector<HTMLElement>('[data-rail-now]');
      const sync = () => {
        const a = panel.querySelector<HTMLElement>('a.is-active');
        if (!a || !now) return;
        now.textContent = a.querySelector('.tk-rail-tag b')?.textContent ?? '';
        panel.style.setProperty('--now-y', `${a.offsetTop + a.offsetHeight / 2}px`);
      };
      sync();
      new MutationObserver(sync).observe(panel, { subtree: true, attributes: true, attributeFilter: ['class'] });
      const open = new Set<number>();
      article.querySelectorAll<HTMLElement>('.tk-chead').forEach((h, i) =>
        ScrollTrigger.create(
          ST(h, {
            start: 'top 85%',
            end: 'bottom 15%',
            onToggle: (self) => {
              if (self.isActive) open.add(i);
              else open.delete(i);
              panel.classList.toggle('is-open', open.size > 0);
            },
          }),
        ),
      );
    }

    if (reduce) return;

    article.querySelectorAll<HTMLElement>('[data-a]').forEach((el) => {
      // explicit end values (fromTo): a re-measure mid-reveal must not become the resting pose
      if (el.dataset.a === 'up') gsap.fromTo(el, { y: 44, autoAlpha: 0 }, { y: 0, autoAlpha: 1, ease: 'power2.out', scrollTrigger: enter(el) });
      else if (el.dataset.a === 'stagger')
        gsap.fromTo(el.children, { y: 26, autoAlpha: 0, scale: 0.94 }, {
          y: 0,
          autoAlpha: 1,
          scale: 1,
          stagger: 0.14,
          ease: 'power2.out',
          scrollTrigger: ST(el, { start: 'top 92%', end: 'top 66%', scrub: 0.35 }),
        });
    });

    // the bill of materials: parts drop in one by one while the total counts up
    const bom = article.querySelector<HTMLElement>('.tk-bom');
    if (bom) {
      const tl = gsap.timeline({ scrollTrigger: ST(bom, { start: 'top 85%', end: 'bottom 70%', scrub: 0.4 }) });
      tl.from(bom.querySelectorAll('[data-tk-bom]'), { autoAlpha: 0, x: -18, stagger: 0.1, duration: 0.3, ease: 'power2.out' });
      const count = bom.querySelector<HTMLElement>('[data-tk-count]');
      if (count) {
        const to = parseFloat(count.dataset.tkCount!);
        const o = { v: 0 };
        tl.to(o, { v: to, duration: tl.duration(), ease: 'none', onUpdate: () => (count.textContent = Math.round(o.v).toLocaleString('en-IN')) }, 0);
      }
    }

    // the firmware log lands commit by commit, the version pill clicking in first
    article.querySelectorAll<HTMLElement>('[data-tk-commit]').forEach((c) => {
      const tl = gsap.timeline({ scrollTrigger: ST(c, { start: 'top 90%', end: 'top 70%', scrub: 0.35 }) });
      tl.from(c.querySelector('.tk-log-v'), { scale: 0.4, autoAlpha: 0, duration: 0.3, ease: 'back.out(2.5)' }).from(
        c.querySelector('div'),
        { x: 30, autoAlpha: 0, duration: 0.5, ease: 'power2.out' },
        0.1,
      );
    });

    // the schematic is plotted onto the board: a scan line sweeps across and leaves the drawing behind it
    const scan = article.querySelector<HTMLElement>('[data-tk-scan]');
    if (scan) {
      const line = scan.querySelector('[data-tk-scanline]');
      gsap
        .timeline({ scrollTrigger: ST(scan, { start: 'top 80%', end: 'top 30%', scrub: 0.5 }) })
        .fromTo(scan.querySelector('img'), { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', ease: 'none', duration: 1 }, 0)
        .fromTo(line, { left: '0%', opacity: 1 }, { left: '100%', ease: 'none', duration: 1 }, 0)
        .to(line, { opacity: 0, duration: 0.08 });
    }

    // the last upload fills with the scroll; "Done uploading." lands at 100%
    const up = article.querySelector<HTMLElement>('[data-tk-upload]');
    if (up) {
      const bar = up.querySelector<HTMLElement>('[data-up-bar]')!;
      const pct = up.querySelector<HTMLElement>('[data-up-pct]')!;
      const status = up.querySelector<HTMLElement>('[data-up-status]')!;
      const sum = up.querySelector<HTMLElement>('[data-up-sum]')!;
      const o = { v: 0 };
      const paint = () => {
        const p = Math.round(o.v * 100);
        bar.style.transform = `scaleX(${o.v})`;
        pct.textContent = `${p}%`;
        status.textContent = p >= 100 ? 'Done uploading.' : 'Uploading…';
        sum.style.opacity = p >= 100 ? '1' : '0.3';
      };
      paint();
      gsap.to(o, { v: 1, ease: 'none', onUpdate: paint, scrollTrigger: ST(up, { start: 'top 88%', end: 'top 50%', scrub: 0.4 }) });
    }
  };

  // ---------------- bench test 1: the ultrasonic sensor (v1–v5) ----------------
  let kickSonar: () => void = () => {};
  const initSonar = (sc: HTMLElement) => {
    const box = article.querySelector<HTMLElement>('[data-tk-sonar]');
    if (!box) return;
    const field = box.querySelector<SVGSVGElement>('[data-sonar-field]')!;
    const target = field.querySelector<SVGGElement>('[data-sonar-target]')!;
    const waves = field.querySelector<SVGGElement>('[data-sonar-waves]')!;
    const range = box.querySelector<HTMLInputElement>('[data-sonar-range]')!;
    const cmEl = box.querySelector<HTMLElement>('[data-sonar-cm]')!;
    const usEl = box.querySelector<HTMLElement>('[data-sonar-us]')!;
    const stateEl = box.querySelector<HTMLElement>('[data-sonar-state]')!;
    const echoPath = box.querySelector<SVGPathElement>('[data-sonar-echo]')!;
    const X = (cm: number) => 70 + (cm / 60) * 540;
    let d = 60;
    let on = false;
    let touched = false;

    const set = (cm: number) => {
      d = Math.min(60, Math.max(2, cm));
      // v5: start at 20 cm or closer, stop only once they're 30 cm or further away
      if (d <= 20) on = true;
      else if (d >= 30) on = false;
      // v1: the echo is the round trip, so the time is twice the distance over the speed of sound
      const us = Math.round((d * 2) / 0.034);
      target.setAttribute('transform', `translate(${X(d).toFixed(1)} 0)`);
      cmEl.textContent = d.toFixed(1);
      usEl.textContent = String(us);
      stateEl.textContent = on ? 'Sweeping' : 'Idle';
      box.classList.toggle('is-active', on);
      echoPath.setAttribute('d', `M44 58 H60 V44 H${(60 + Math.max(2, (us / 4000) * 210)).toFixed(1)} V58 H276`);
      if (document.activeElement !== range) range.value = String(Math.round(d * 2) / 2);
    };
    range.addEventListener('input', () => {
      touched = true;
      set(parseFloat(range.value));
    });
    const toCm = (e: PointerEvent) => {
      const pt = new DOMPoint(e.clientX, e.clientY).matrixTransform(field.getScreenCTM()!.inverse());
      return ((pt.x - 70) / 540) * 60;
    };
    let dragging = false;
    field.addEventListener('pointerdown', (e) => {
      dragging = touched = true;
      field.setPointerCapture(e.pointerId);
      set(toCm(e));
    });
    field.addEventListener('pointermove', (e) => dragging && set(toCm(e)));
    const stop = () => (dragging = false);
    field.addEventListener('pointerup', stop);
    field.addEventListener('pointercancel', stop);
    set(60);

    // until someone grabs it, scrolling walks a person up to the desk and away again,
    // which shows the hysteresis: on at 20 cm, still on through 20–30, off at 30
    if (!reduce)
      ScrollTrigger.create({
        trigger: box,
        scroller: sc,
        start: 'top 85%',
        end: 'bottom 25%',
        onUpdate: (self) => {
          if (touched) return;
          const p = self.progress;
          set(p < 0.5 ? 60 - 52 * (p / 0.5) : 8 + 36 * ((p - 0.5) / 0.5));
        },
      });

    // pings: an orange wave out, a green echo back, only while the bench is on screen
    if (reduce) return;
    const pings: number[] = [];
    let raf = 0;
    let seen = false;
    let lastEmit = 0;
    const SPEED = 0.5; // viewBox px per ms
    const A = 0.5; // half-angle of the wavefront, radians
    const frame = (now: number) => {
      if (now - lastEmit > 480) {
        pings.push(now);
        lastEmit = now;
      }
      const sx = 58;
      const sy = 88;
      const tx = X(d) - 9;
      const gap = tx - sx;
      let out = '';
      for (let i = pings.length - 1; i >= 0; i--) {
        const run = (now - pings[i]) * SPEED;
        if (run > gap * 2) {
          pings.splice(i, 1);
          continue;
        }
        const back = run > gap;
        const r = back ? run - gap : run;
        if (r < 4) continue;
        const c = Math.cos(A) * r;
        const h = Math.sin(A) * r;
        const op = (back ? 0.9 - (0.6 * r) / gap : 1 - (0.4 * r) / gap).toFixed(2);
        out += back
          ? `<path class="tk-ping tk-echo" opacity="${op}" d="M${tx - c} ${sy - h} A${r} ${r} 0 0 0 ${tx - c} ${sy + h}"/>`
          : `<path class="tk-ping" opacity="${op}" d="M${sx + c} ${sy - h} A${r} ${r} 0 0 1 ${sx + c} ${sy + h}"/>`;
      }
      waves.innerHTML = out;
      raf = seen && active ? requestAnimationFrame(frame) : 0;
    };
    const go = () => {
      box.classList.toggle('is-paused', !(seen && active));
      if (seen && active && !raf) raf = requestAnimationFrame(frame);
    };
    new IntersectionObserver(
      ([e]) => {
        seen = e.isIntersecting;
        go();
      },
      { root: sc },
    ).observe(box);
    kickSonar = go;
  };

  // ---------------- lifecycle ----------------
  let rebuildTimer = 0;
  const remeasure = () => {
    ScrollTrigger.refresh();
    buildBus();
    aim(true);
  };

  document.addEventListener('pm:shown', (e) => {
    const { slug, scroller: sc } = (e as CustomEvent<{ slug: string; scroller: HTMLElement }>).detail;
    if (slug !== SLUG) return;
    scroller = sc;
    active = true;
    if (!built) {
      built = true;
      build();
      // lazy images and fonts change heights: re-route the bus
      new ResizeObserver(() => {
        if (!active) return;
        clearTimeout(rebuildTimer);
        rebuildTimer = window.setTimeout(remeasure, 180);
      }).observe(article);
    }
    remeasure();
    kickSonar();
    if (!reduce) {
      // the title strikes on like a tube, then the callouts trace out from the part
      const title = article.querySelector<HTMLElement>('[data-tk-boot]');
      title?.classList.remove('is-booting');
      void title?.offsetWidth;
      title?.classList.add('is-booting');
      const leads = article.querySelectorAll<SVGPathElement>('[data-tk-lead]');
      gsap
        .timeline({ delay: 0.35 })
        .fromTo(article.querySelectorAll('.tk-dot'), { scale: 0 }, { scale: 1, duration: 0.35, stagger: 0.1, ease: 'back.out(3)' })
        .fromTo(leads, { strokeDasharray: 1, strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.45, stagger: 0.1, ease: 'power2.out' }, 0.15)
        .fromTo(article.querySelectorAll('.tk-callout'), { autoAlpha: 0, x: -6 }, { autoAlpha: 1, x: 0, duration: 0.35, stagger: 0.1, ease: 'power2.out' }, 0.45);
    }
  });
  document.addEventListener('pm:hidden', (e) => {
    if ((e as CustomEvent<{ slug: string }>).detail.slug === SLUG) active = false;
  });
}
