import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { sampleSpline, pointAtLength } from './guide';

/**
 * The Cooked case study: a light, illustrated card that plays like a motion
 * graphic as it scrolls. Everything is driven by the card's own scroller:
 * - a green line draws itself down the margins, swooping across between
 *   blocks, with its pen tip held at the reading point;
 * - sticky scenes run scrubbed timelines (the seesaw, the thought clouds,
 *   the assumption board, the HMW, the pivot, the booking journey);
 * - smaller blocks reveal with [data-a] (up, pop, left/right, spin, par,
 *   fill, draw, stagger) and numbers count with [data-count].
 * It builds the first time the card is shown and re-measures on every show.
 */
const GREEN = '#337140';

export function initCookedCase({ reduce }: { reduce: boolean }) {
  const article = document.querySelector<HTMLElement>('[data-ck]');
  if (!article) return;
  let scroller: HTMLElement | null = null;
  let built = false;

  // the card's hero images load lazily (not with the homepage), and are fetched the moment
  // someone shows intent to open it, so the hero is ready when the card lands
  const warm = () => {
    article.querySelectorAll<HTMLImageElement>('[data-ck-preload]').forEach((im) => {
      new Image().src = im.currentSrc || im.src;
    });
    tile?.removeEventListener('pointerenter', warm);
    tile?.removeEventListener('focus', warm);
  };
  const tile = document.querySelector<HTMLElement>('[data-open-project="cooked"]');
  tile?.addEventListener('pointerenter', warm, { once: true });
  tile?.addEventListener('focus', warm, { once: true });
  tile?.addEventListener('touchstart', warm, { once: true, passive: true });
  let active = false;

  // ---------------- green line ----------------
  const svg = article.querySelector<SVGSVGElement>('[data-ck-line]')!;
  const path = svg.querySelector<SVGPathElement>('.ck-line-path')!;
  const tip = svg.querySelector<SVGCircleElement>('.ck-line-tip')!;
  const halo = svg.querySelector<SVGCircleElement>('.ck-line-halo')!;
  let total = 0;
  // lookup table along the line: x, y, running length, and the furthest y reached so far
  let xs: number[] = [];
  let ys: number[] = [];
  let ls: number[] = [];
  let reach: number[] = [];

  const offsetTop = (el: HTMLElement) => {
    let y = 0;
    let n: HTMLElement | null = el;
    while (n && n !== article) {
      y += n.offsetTop;
      n = n.offsetParent as HTMLElement | null;
    }
    return y;
  };

  const buildLine = () => {
    const W = article.clientWidth;
    const H = article.scrollHeight;
    svg.setAttribute('width', String(W));
    svg.setAttribute('height', String(H));
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    const padEl = article.querySelector<HTMLElement>('.ck-block');
    const pad = padEl ? parseFloat(getComputedStyle(padEl).paddingLeft) : 40;
    const gutter = Math.max(11, pad * 0.42);
    const sideX = { l: gutter, r: W - gutter };

    const hero = article.querySelector<HTMLElement>('.ck-hero')!;
    const pts = [{ x: W / 2, y: hero.offsetHeight - 70 }];
    // each block the line passes: it hugs one margin alongside, then swaps sides in the gap
    let side: 'l' | 'r' = 'l';
    article.querySelectorAll<HTMLElement>('[data-ck-pt], [data-ck-rail]').forEach((el) => {
      if (el === hero) return;
      const top = offsetTop(el);
      const h = el.offsetHeight;
      const cs = getComputedStyle(el);
      const pt = Math.max(24, parseFloat(cs.paddingTop) * 0.8);
      const pb = Math.max(24, parseFloat(cs.paddingBottom) * 0.8);
      const rail = el.hasAttribute('data-ck-rail');
      const y1 = top + (rail ? 0 : pt);
      const y2 = top + h - (rail ? 0 : pb);
      if (y2 - y1 < 20) return;
      pts.push({ x: sideX[side], y: y1 }, { x: sideX[side], y: y2 });
      side = side === 'l' ? 'r' : 'l';
    });
    pts.push({ x: W / 2, y: H - 40 });
    pts.sort((a, b) => a.y - b.y);
    const s = sampleSpline(pts);
    ({ xs, ys, ls, total } = s);
    path.setAttribute('d', s.d);
    // dash units follow our measured length exactly, so the drawn end meets the pen tip
    path.setAttribute('pathLength', String(total));
    path.style.strokeDasharray = `${total}`;
    let maxY = -Infinity;
    reach = ys.map((y) => (maxY = Math.max(maxY, y)));
  };

  /** length along the line where it first reaches depth y, blended between samples */
  const lengthAtY = (y: number) => {
    let lo = 0;
    let hi = reach.length - 1;
    if (!reach.length || y <= reach[0]) return 0;
    if (y >= reach[hi]) return total;
    while (hi - lo > 1) {
      const mid = (lo + hi) >> 1;
      if (reach[mid] < y) lo = mid;
      else hi = mid;
    }
    const f = (y - reach[lo]) / (reach[hi] - reach[lo] || 1);
    return ls[lo] + (ls[hi] - ls[lo]) * f;
  };

  const placeTip = (len: number) => {
    path.style.strokeDashoffset = `${total - len}`;
    const p = pointAtLength({ xs, ys, ls }, len);
    for (const c of [tip, halo]) {
      c.setAttribute('cx', String(p.x));
      c.setAttribute('cy', String(p.y));
    }
    tip.style.opacity = halo.style.opacity = len > 2 && len < total - 2 ? '1' : '0';
  };

  // the drawn length eases toward the scroll position (native wheel scrolling moves in
  // ~100 px steps; following it raw made the line jump)
  let shown = 0;
  let goal = 0;
  let raf = 0;
  let last = 0;
  const ease = (now: number) => {
    const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
    last = now;
    shown += (goal - shown) * (1 - Math.exp(-dt * 11));
    if (Math.abs(goal - shown) < 0.5) shown = goal;
    placeTip(shown);
    raf = shown !== goal && active ? requestAnimationFrame(ease) : 0;
  };
  const aim = (snap = false) => {
    if (!scroller || !total) return;
    if (reduce) {
      path.style.strokeDashoffset = '0';
      tip.style.opacity = halo.style.opacity = '0';
      return;
    }
    // the pen tip rides at the reading point, a little below the middle of the card
    goal = lengthAtY(scroller.scrollTop + scroller.clientHeight * 0.62);
    if (snap) {
      shown = goal;
      placeTip(shown);
      return;
    }
    if (!raf) {
      last = performance.now();
      raf = requestAnimationFrame(ease);
    }
  };
  const drawLine = () => aim(true);
  const onScroll = () => {
    if (active) aim();
  };

  // ---------------- build (first show) ----------------
  const build = () => {
    const sc = scroller!;
    sc.addEventListener('scroll', onScroll, { passive: true });
    const ST = (trigger: Element, extra: ScrollTrigger.Vars = {}): ScrollTrigger.Vars => ({ trigger, scroller: sc, ...extra });
    const enter = (el: Element) => ST(el, { start: 'top 94%', end: 'top 74%', scrub: 0.35 });

    // the course menu appears once the hero has scrolled away
    const dock = article.querySelector<HTMLElement>('[data-ck-dock]');
    if (dock)
      ScrollTrigger.create(
        ST(article.querySelector('.ck-hero')!, { start: 'top -35%', end: () => `+=${sc.scrollHeight}`, toggleClass: { targets: dock, className: 'is-on' } }),
      );

    // the wordmark lands with a little bounce each time the card opens
    const mark = article.querySelector('.ck-wordmark img');

    if (reduce) {
      buildLine();
      drawLine();
      return mark;
    }

    // ---- generic reveals ----
    article.querySelectorAll<HTMLElement>('[data-a]').forEach((el) => {
      const kind = el.dataset.a;
      if (kind === 'up') gsap.from(el, { y: 54, autoAlpha: 0, ease: 'power2.out', scrollTrigger: enter(el) });
      else if (kind === 'pop')
        gsap.from(el, { scale: 0.55, autoAlpha: 0, rotation: gsap.utils.random(-8, 8), ease: 'back.out(2)', scrollTrigger: enter(el) });
      else if (kind === 'left' || kind === 'right')
        gsap.from(el, { x: kind === 'left' ? -110 : 110, rotation: kind === 'left' ? -8 : 8, autoAlpha: 0, ease: 'power2.out', scrollTrigger: enter(el) });
      else if (kind === 'spin')
        gsap.fromTo(
          el,
          { rotation: -28, scale: 0.78, autoAlpha: 0 },
          { rotation: 10, scale: 1, autoAlpha: 1, ease: 'none', scrollTrigger: ST(el, { start: 'top bottom', end: 'bottom top', scrub: 0.8 }) },
        );
      else if (kind === 'par') {
        const s = parseFloat(el.dataset.speed || '40');
        gsap.fromTo(el, { y: s }, { y: -s, ease: 'none', scrollTrigger: ST(el, { start: 'top bottom', end: 'bottom top', scrub: true }) });
      } else if (kind === 'fill')
        gsap.from(el, { scaleX: 0, ease: 'power2.out', scrollTrigger: ST(el, { start: 'top 94%', end: 'top 72%', scrub: 0.35 }) });
      else if (kind === 'fill-x') gsap.from(el, { scaleX: 0.15, autoAlpha: 0, ease: 'power3.out', scrollTrigger: enter(el) });
      else if (kind === 'stagger')
        gsap.from(el.children, {
          y: 22,
          autoAlpha: 0,
          scale: 0.92,
          stagger: 0.18,
          ease: 'back.out(1.6)',
          scrollTrigger: ST(el, { start: 'top 92%', end: 'top 70%', scrub: 0.35 }),
        });
      else if (kind === 'draw') {
        const tl = gsap.timeline({ scrollTrigger: ST(el, { start: 'top 90%', end: 'top 62%', scrub: 0.35 }) });
        el.querySelectorAll<SVGGeometryElement>('path').forEach((p) => {
          const L = p.getTotalLength();
          gsap.set(p, { opacity: 0 }); // hide the round cap's dot until drawing starts
          tl.set(p, { opacity: 1 }, 0.001).fromTo(p, { strokeDasharray: L, strokeDashoffset: L }, { strokeDashoffset: 0, ease: 'none', duration: 1 }, 0);
        });
        tl.from(el.querySelectorAll('circle'), { scale: 0, transformOrigin: 'center', ease: 'back.out(3)', duration: 0.25 });
      }
    });

    // ---- numbers count up ----
    article.querySelectorAll<HTMLElement>('[data-count]').forEach((el) => {
      const to = parseFloat(el.dataset.count!);
      const prefix = el.dataset.prefix;
      const low = prefix ? parseFloat(prefix) : 0;
      const o = { v: 0 };
      gsap.to(o, {
        v: 1,
        ease: 'power2.out',
        scrollTrigger: ST(el, { start: 'top 94%', end: 'top 72%', scrub: 0.35 }),
        onUpdate: () => {
          el.textContent = prefix ? `${Math.round(low * o.v)}–${Math.round(to * o.v)}` : String(Math.round(to * o.v));
        },
      });
    });

    // ---- sticky scenes ----
    const scene = (name: string) => article.querySelector<HTMLElement>(`[data-scene="${name}"]`);
    const tlFor = (el: HTMLElement, extra: ScrollTrigger.Vars = {}) =>
      gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: ST(el, { start: 'top top', end: 'bottom bottom', scrub: 0.4, ...extra }) });
    const q = <T extends Element = HTMLElement>(root: Element, sel: string) => Array.from(root.querySelectorAll<T>(sel));
    const hold = (tl: gsap.core.Timeline, d = 0.25) => tl.to({}, { duration: d });

    // starter: imagine → tired → no control → the seesaw tips to convenience
    const im = scene('imagine');
    if (im) {
      const [b1, b2, b3] = ['[data-b1]', '[data-b2]', '[data-b3]'].map((s) => im.querySelector(s)!);
      // the opener reads at a calmer pace than the rest: each beat holds before the next
      const tl = tlFor(im, { scrub: 0.8 });
      tl.to(b1, { autoAlpha: 0, y: -70, duration: 1 }, 0.7)
        .fromTo(b2, { autoAlpha: 0, y: 70 }, { autoAlpha: 1, y: 0, duration: 1 })
        .to(b2, { autoAlpha: 0, y: -70, duration: 1 }, '+=0.8')
        .fromTo(b3, { autoAlpha: 0, y: 70 }, { autoAlpha: 1, y: 0, duration: 1 })
        .fromTo(im.querySelector('[data-control]'), { scale: 1 }, { scale: 1.18, duration: 0.6, ease: 'back.out(3)' })
        .fromTo(im.querySelector('[data-seesaw]'), { autoAlpha: 0, y: 90 }, { autoAlpha: 1, y: 0, duration: 1 }, '<')
        .to(im.querySelector('[data-beam]'), { rotation: -11, svgOrigin: '400 260', duration: 1.6, ease: 'power2.inOut' })
        .to(im.querySelector('[data-ss-left]'), { y: 50, duration: 1.6, ease: 'power2.inOut' }, '<')
        .to(im.querySelector('[data-ss-right]'), { y: -50, duration: 1.6, ease: 'power2.inOut' }, '<');
      hold(tl, 0.8);
    }

    // discover: what we heard arrives as one slide: heading, figure and notes together
    const heard = article.querySelector<HTMLElement>('[data-heard]');
    if (heard)
      gsap
        .timeline({ scrollTrigger: ST(heard, { start: 'top 88%', end: 'top 50%', scrub: 0.35 }) })
        .from(heard.querySelector('.ck-h'), { autoAlpha: 0, y: 30, duration: 0.4 })
        .from(heard.querySelector('.ck-heard-fig'), { autoAlpha: 0, scale: 0.85, duration: 0.4 }, 0)
        .from(q(heard, '.ck-quote'), { autoAlpha: 0, y: 40, rotation: 0, scale: 0.9, stagger: 0.06, duration: 0.45, ease: 'back.out(1.6)' }, 0.1);

    // discover: twenty notes on the board, five carried forward
    const as = scene('assumptions');
    if (as) {
      const notes = q(as, '[data-note]');
      const tl = tlFor(as);
      tl.from(notes, {
        y: -160,
        rotation: () => gsap.utils.random(-28, 28),
        autoAlpha: 0,
        duration: 0.6,
        stagger: 0.05,
        ease: 'back.out(1.4)',
      })
        .to(
          notes.filter((n) => !n.hasAttribute('data-keep')),
          { autoAlpha: 0.24, scale: 0.93, duration: 0.8 },
          '+=0.3',
        )
        .from(q(as, '[data-tick]'), { scale: 0, autoAlpha: 0, stagger: 0.12, duration: 0.5, ease: 'back.out(3)' }, '<0.2')
        .from(as.querySelector('[data-assume-cap]'), { autoAlpha: 0, y: 22, duration: 0.5 });
      hold(tl);
    }

    // define: the control dial swings between the two kinds of diner, then settles
    const sp = scene('spectrum');
    if (sp) {
      const track = sp.querySelector('[data-spec-track]')!;
      const tl = tlFor(sp, { scrub: 0.8 });
      tl.fromTo(track, { '--p': '4%' }, { '--p': '96%', duration: 1.6, ease: 'power1.inOut' })
        .to(track, { '--p': '10%', duration: 1.4, ease: 'power1.inOut' })
        .to(track, { '--p': '50%', duration: 1.1, ease: 'power2.out' })
        .from(sp.querySelector('[data-spec-verdict]'), { autoAlpha: 0, y: 26, duration: 0.8 });
      hold(tl, 1);
    }

    // define: the HMW lights up word by word, then the insight lands
    const hm = scene('hmw');
    if (hm) {
      const tl = tlFor(hm);
      tl.to(q(hm, '.w'), { opacity: 1, stagger: 0.1, duration: 0.25 })
        .to(q(hm, '.w.k'), { color: GREEN, duration: 0.5 })
        .from(hm.querySelector('[data-insight]'), { autoAlpha: 0, y: 30, duration: 0.7 });
      hold(tl);
    }

    // define: "delivered to me" is struck out, "made for me" arrives
    const sh = scene('shift');
    if (sh) {
      const tl = tlFor(sh, { scrub: 0.8 });
      tl.from(sh.querySelector('[data-shift-a]'), { autoAlpha: 0, y: 30, duration: 0.8 })
        .to(sh.querySelector('[data-strike]'), { scaleX: 1, duration: 1 }, '+=0.3')
        .to(sh.querySelector('[data-shift-a]'), { opacity: 0.35, duration: 0.6 });
      // round line caps render as dots even at zero length, so each stroke stays hidden
      // until the moment it starts drawing
      q<SVGPathElement>(sh, '[data-arrow], [data-arrow-head]').forEach((p) => {
        const L = p.getTotalLength();
        gsap.set(p, { opacity: 0 });
        tl.set(p, { opacity: 1 }).fromTo(p, { strokeDasharray: L, strokeDashoffset: L }, { strokeDashoffset: 0, duration: 1 });
      });
      tl.from(sh.querySelector('[data-shift-b]'), { autoAlpha: 0, y: 34, scale: 0.9, duration: 1.1, ease: 'back.out(1.6)' });
      hold(tl, 0.9);
    }

    // develop: ideas fly onto the wall, some get crossed out, three make it to the plate
    const id = scene('ideas');
    if (id) {
      const ideas = q(id, '[data-idea]');
      const tl = tlFor(id);
      tl.from(ideas, {
        x: () => gsap.utils.random(-260, 260),
        y: () => gsap.utils.random(-220, 220),
        rotation: () => gsap.utils.random(-45, 45),
        scale: 0.5,
        autoAlpha: 0,
        stagger: 0.035,
        duration: 0.6,
        ease: 'power3.out',
      })
        .to(q(id, '[data-cut]'), { scaleX: 1, stagger: 0.2, duration: 0.4 }, '+=0.3')
        .to(
          ideas.filter((n) => n.classList.contains('is-cut')),
          { opacity: 0.45, duration: 0.4 },
          '<',
        )
        .from(q(id, '[data-keep-tag]'), { autoAlpha: 0, y: 10, scale: 0.6, stagger: 0.2, duration: 0.45, ease: 'back.out(2)' })
        .from(id.querySelector('[data-ideas-cap]'), { autoAlpha: 0, y: 20, duration: 0.4 });
      hold(tl);
    }

    // develop: the user flow fills in down both lanes
    const flow = article.querySelector<HTMLElement>('[data-ck-flow]');
    if (flow) {
      const tl = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: ST(flow, { start: 'top 78%', end: 'bottom 72%', scrub: 0.6 }) });
      tl.from(flow.querySelector('.ck-flow-start'), { autoAlpha: 0, y: 20, duration: 0.4 });
      q(flow, '.ck-flow-col').forEach((col) => {
        const nodes = q(col, '[data-flow-node]');
        tl.from(col.querySelector('[data-flow-rail]'), { scaleY: 0, duration: nodes.length * 0.35 }, 0.4);
        nodes.forEach((n, i) => tl.from(n, { autoAlpha: 0, scale: 0.8, duration: 0.25, ease: 'back.out(2)' }, 0.4 + i * 0.35));
      });
    }

    // develop: feedback flips chef-first to food-first
    const pv = scene('pivot');
    if (pv) {
      const a = pv.querySelector('[data-pivot-a]');
      const b = pv.querySelector('[data-pivot-b]');
      const toggle = pv.querySelector('.ck-toggle');
      const tl = tlFor(pv);
      tl.from([a, toggle, b], { autoAlpha: 0, y: 40, stagger: 0.15, duration: 0.6 })
        .fromTo(toggle, { backgroundColor: '#14171a' }, { backgroundColor: GREEN, duration: 0.6 })
        .to(pv.querySelector('[data-toggle-knob]'), { x: 40, duration: 0.6, ease: 'power2.inOut' }, '<')
        .to(pv.querySelector('[data-pivot-strike]'), { scaleX: 1, duration: 0.5 }, '<0.2')
        .to(a, { opacity: 0.4, duration: 0.5 }, '<')
        .to(b, { boxShadow: `0 0 0 3px ${GREEN}`, scale: 1.03, duration: 0.5 }, '<')
        .from(q(pv, '[data-pivot-chip]'), { autoAlpha: 0, y: 16, scale: 0.9, stagger: 0.1, duration: 0.4 });
      hold(tl);
    }

    // deliver: the booking journey slides past as you scroll down
    const jr = scene('journey');
    if (jr) {
      const track = jr.querySelector<HTMLElement>('[data-journey-track]')!;
      const stage = jr.querySelector<HTMLElement>('.ck-stage')!;
      const counter = jr.querySelector<HTMLElement>('[data-journey-i]')!;
      const steps = track.querySelectorAll('.ck-journey-step').length;
      const dist = () => Math.max(0, track.scrollWidth - stage.clientWidth);
      const tl = tlFor(jr, {
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const i = Math.min(steps, Math.max(1, Math.round(self.progress * 1.12 * (steps - 1)) + 1));
          counter.textContent = String(i).padStart(2, '0');
        },
      });
      tl.to(track, { x: () => -dist(), duration: 1 }).fromTo(
        jr.querySelector('[data-journey-line]'),
        { scaleX: 0 },
        { scaleX: 1, duration: 1 },
        0,
      );
      hold(tl, 0.12);
    }

    // dessert: the turmeric finale opens out
    const fin = article.querySelector<HTMLElement>('[data-finale]');
    if (fin)
      gsap.fromTo(
        fin,
        { clipPath: 'inset(18% 22% round 28px)' },
        { clipPath: 'inset(0% 0% round 28px)', ease: 'none', scrollTrigger: ST(fin, { start: 'top 95%', end: 'top 25%', scrub: 0.6 }) },
      );

    return mark;
  };

  // ---------------- lifecycle ----------------
  let mark: Element | null | undefined = null;
  let rebuildTimer = 0;
  const remeasure = () => {
    ScrollTrigger.refresh();
    buildLine();
    drawLine();
  };

  document.addEventListener('pm:shown', (e) => {
    const { slug, scroller: sc } = (e as CustomEvent<{ slug: string; scroller: HTMLElement }>).detail;
    if (slug !== 'cooked') return;
    scroller = sc;
    active = true;
    if (!built) {
      built = true;
      mark = build();
      // images and late font loads change heights: re-measure the line and the scenes
      new ResizeObserver(() => {
        if (!active) return;
        clearTimeout(rebuildTimer);
        rebuildTimer = window.setTimeout(remeasure, 180);
      }).observe(article);
    }
    remeasure();
    if (mark && !reduce)
      gsap.fromTo(mark, { scale: 0.82, rotation: -5 }, { scale: 1, rotation: 0, duration: 1, ease: 'elastic.out(1, 0.55)', delay: 0.1 });
  });
  document.addEventListener('pm:hidden', (e) => {
    if ((e as CustomEvent<{ slug: string }>).detail.slug === 'cooked') active = false;
  });
}
