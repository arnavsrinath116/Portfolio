import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { sampleSpline, pointAtLength } from './guide';

/**
 * The Cooked case study. The story reads in order (problem, brief, the app, research, design,
 * result) and the motion follows the scroll without ever holding it:
 * - a green line draws itself down the margins, swapping sides between blocks, its pen tip
 *   riding at the reading point;
 * - headings and cards rise in as they arrive, numbers count, bars fill;
 * - a few moments play out as you scroll past them, in place: the seesaw tips, the question
 *   lights up word by word, "delivered" is struck out, the menu flips to food-first.
 * Nothing is pinned. With reduced motion everything is simply shown, and the line is drawn whole.
 */
const GREEN = '#337140';

export function initCookedCase({ reduce }: { reduce: boolean }) {
  const article = document.querySelector<HTMLElement>('[data-ck]');
  if (!article) return;
  let scroller: HTMLElement | null = null;
  let built = false;
  let active = false;

  // the card's hero images load lazily (not with the homepage), and are fetched the moment
  // someone shows intent to open it, so the hero is ready when the card lands
  const tile = document.querySelector<HTMLElement>('[data-open-project="cooked"]');
  const warm = () => {
    article.querySelectorAll<HTMLImageElement>('[data-ck-preload]').forEach((im) => {
      new Image().src = im.currentSrc || im.src;
    });
  };
  tile?.addEventListener('pointerenter', warm, { once: true });
  tile?.addEventListener('focus', warm, { once: true });
  tile?.addEventListener('touchstart', warm, { once: true, passive: true });

  // ---------------- green line ----------------
  const svg = article.querySelector<SVGSVGElement>('[data-ck-line]')!;
  const path = svg.querySelector<SVGPathElement>('.ck-line-path')!;
  const tip = svg.querySelector<SVGCircleElement>('.ck-line-tip')!;
  const halo = svg.querySelector<SVGCircleElement>('.ck-line-halo')!;
  let total = 0;
  let xs: number[] = [];
  let ys: number[] = [];
  let ls: number[] = [];
  let reach: number[] = []; // the furthest y the line has reached by each sample

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
    // on a narrow card there's no room to cross between blocks without cutting through the text,
    // so the line keeps to the left margin; on wider ones it swaps sides in each gap
    const narrow = W < 760;
    const pts = [{ x: narrow ? sideX.l : W / 2, y: hero.offsetHeight - 30 }];
    let side: 'l' | 'r' = 'l';
    article.querySelectorAll<HTMLElement>('.ck-chead, [data-ck-in]').forEach((el) => {
      const top = offsetTop(el);
      const h = el.offsetHeight;
      const cs = getComputedStyle(el);
      const y1 = top + Math.max(20, parseFloat(cs.paddingTop) * 0.8);
      const y2 = top + h - Math.max(20, parseFloat(cs.paddingBottom) * 0.8);
      if (y2 - y1 < 20) return;
      pts.push({ x: sideX[side], y: y1 }, { x: sideX[side], y: y2 });
      if (!narrow) side = side === 'l' ? 'r' : 'l';
    });
    pts.push({ x: narrow ? sideX.l : W / 2, y: H - 40 });
    pts.sort((a, b) => a.y - b.y);
    const sp = sampleSpline(pts);
    ({ xs, ys, ls, total } = sp);
    path.setAttribute('d', sp.d);
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
    const pt = pointAtLength({ xs, ys, ls }, len);
    for (const c of [tip, halo]) {
      c.setAttribute('cx', String(pt.x));
      c.setAttribute('cy', String(pt.y));
    }
    tip.style.opacity = halo.style.opacity = len > 2 && len < total - 2 ? '1' : '0';
  };

  // the drawn length eases toward the scroll position (wheel scrolling moves in steps; following
  // it raw made the line jump)
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
  const onScroll = () => {
    if (active) aim();
  };

  // ---------------- build (first show) ----------------
  const build = (sc: HTMLElement) => {
    sc.addEventListener('scroll', onScroll, { passive: true });

    // the chapter rail on the right edge appears once the hero has scrolled away
    const dock = article.querySelector<HTMLElement>('[data-ck-dock]');
    const hero = article.querySelector<HTMLElement>('.ck-hero');
    if (dock && hero)
      ScrollTrigger.create({
        trigger: hero,
        scroller: sc,
        start: 'top -35%',
        end: () => `+=${sc.scrollHeight}`,
        toggleClass: { targets: dock, className: 'is-on' },
      });
    // it rests folded to its dots; while a chapter's heading is on screen a pill names that chapter
    const rail = dock?.querySelector<HTMLElement>('.ck-dock');
    if (rail) {
      const now = rail.querySelector<HTMLElement>('[data-dock-now]');
      const sync = () => {
        const a = rail.querySelector<HTMLElement>('a.is-active');
        if (!a || !now) return;
        now.textContent = a.querySelector('.ck-dock-label')?.textContent ?? '';
        rail.style.setProperty('--now-y', `${a.offsetTop + a.offsetHeight / 2}px`);
      };
      sync();
      new MutationObserver(sync).observe(rail, { subtree: true, attributes: true, attributeFilter: ['class'] });
      const open = new Set<number>();
      article.querySelectorAll<HTMLElement>('.ck-chead').forEach((h, i) =>
        ScrollTrigger.create({
          trigger: h,
          scroller: sc,
          start: 'top 85%',
          end: 'bottom 15%',
          onToggle: (self) => {
            if (self.isActive) open.add(i);
            else open.delete(i);
            rail.classList.toggle('is-open', open.size > 0);
          },
        }),
      );
    }

    // the full user flow: fits the card by default; click or "Zoom in" to read it, drag to move around
    const view = article.querySelector<HTMLElement>('[data-cf-view]');
    const zoomBtn = article.querySelector<HTMLButtonElement>('[data-cf-zoom]');
    if (view && zoomBtn) {
      const setZoom = (on: boolean, at?: { x: number; y: number }) => {
        const r = view.getBoundingClientRect();
        const fx = at ? (at.x - r.left) / r.width : 0.5;
        const fy = at ? (at.y - r.top) / r.height : 0.3;
        view.classList.toggle('is-zoomed', on);
        zoomBtn.setAttribute('aria-pressed', String(on));
        zoomBtn.textContent = on ? 'Fit to card' : 'Zoom in';
        if (on) {
          // land on the spot that was clicked
          view.scrollLeft = fx * view.scrollWidth - view.clientWidth / 2;
          view.scrollTop = fy * view.scrollHeight - view.clientHeight / 2;
        }
      };
      zoomBtn.addEventListener('click', () => setZoom(!view.classList.contains('is-zoomed')));
      let drag: { x: number; y: number; l: number; t: number; moved: boolean } | null = null;
      view.addEventListener('pointerdown', (e) => {
        if (!view.classList.contains('is-zoomed')) return;
        drag = { x: e.clientX, y: e.clientY, l: view.scrollLeft, t: view.scrollTop, moved: false };
        view.setPointerCapture(e.pointerId);
      });
      view.addEventListener('pointermove', (e) => {
        if (!drag) return;
        const dx = e.clientX - drag.x;
        const dy = e.clientY - drag.y;
        if (Math.abs(dx) + Math.abs(dy) > 3) {
          drag.moved = true;
          view.classList.add('is-dragging');
        }
        view.scrollLeft = drag.l - dx;
        view.scrollTop = drag.t - dy;
      });
      const end = () => {
        drag = null;
        view.classList.remove('is-dragging');
      };
      view.addEventListener('pointerup', end);
      view.addEventListener('pointercancel', end);
      view.addEventListener('click', (e) => {
        if (!view.classList.contains('is-zoomed')) setZoom(true, { x: e.clientX, y: e.clientY });
      });
    }

    // ---- UI kit: the components respond (also with reduced motion) ----
    const kit = article.querySelector<HTMLElement>('[data-kit]');
    if (kit) {
      // choice cards: one selected at a time; choosing enables Continue
      const choices = Array.from(kit.querySelectorAll<HTMLButtonElement>('[data-kit-choice]'));
      const cont = kit.querySelector<HTMLButtonElement>('[data-kit-continue]');
      choices.forEach((c) =>
        c.addEventListener('click', () => {
          choices.forEach((o) => {
            o.classList.toggle('is-on', o === c);
            o.setAttribute('aria-pressed', String(o === c));
          });
          if (cont) cont.disabled = false;
        }),
      );
      // bottom navs: the pill slides to the tapped tab
      kit.querySelectorAll<HTMLElement>('[data-kit-nav]').forEach((nav) => {
        const tabs = Array.from(nav.querySelectorAll<HTMLElement>('.knav-tab'));
        const pick = (t: HTMLElement) => {
          tabs.forEach((o) => o.classList.toggle('is-on', o === t));
          nav.style.setProperty('--pw', `${t.offsetWidth}px`);
          nav.style.setProperty('--px', `${t.offsetLeft - 5}px`);
        };
        tabs.forEach((t) => t.addEventListener('click', () => pick(t)));
        new ResizeObserver(() => pick(tabs.find((t) => t.classList.contains('is-on')) ?? tabs[0])).observe(nav);
        (nav as HTMLElement & { _pick?: (t: HTMLElement) => void })._pick = pick;
      });
      // pressables: each press moves the step dots on
      const dots = Array.from(kit.querySelectorAll<HTMLElement>('[data-kit-dots] i'));
      let dot = 0;
      const step = () => {
        dot = (dot + 1) % dots.length;
        dots.forEach((d, k) => d.classList.toggle('is-on', k === dot));
      };
      kit.querySelectorAll('[data-kit-press]').forEach((b) => b.addEventListener('click', step));

      // the kit's parts sit behind tabs
      const bar = kit.querySelector<HTMLElement>('[data-kit-tabs]');
      const stage = kit.querySelector<HTMLElement>('[data-kit-stage]');
      const parts = Array.from(kit.querySelectorAll<HTMLButtonElement>('[data-kit-tab]'));
      const panels = Array.from(kit.querySelectorAll<HTMLElement>('[data-kit-panel]'));
      let part = 0;
      const place = () => {
        const t = parts[part];
        bar?.style.setProperty('--pw', `${t.offsetWidth}px`);
        bar?.style.setProperty('--ph', `${t.offsetHeight}px`);
        bar?.style.setProperty('--px', `${t.offsetLeft}px`);
        bar?.style.setProperty('--py', `${t.offsetTop}px`);
        // the first real placement lands in place; only later moves slide
        if (bar && !bar.dataset.set && t.offsetWidth) requestAnimationFrame(() => (bar.dataset.set = ''));
      };
      const open = (i: number) => {
        if (i === part || !stage) return;
        part = i;
        parts.forEach((t, k) => {
          t.classList.toggle('is-on', k === i);
          t.setAttribute('aria-selected', String(k === i));
          t.tabIndex = k === i ? 0 : -1;
        });
        panels.forEach((p, k) => (p.hidden = k !== i));
        place();
      };
      parts.forEach((t, i) => t.addEventListener('click', () => open(i)));
      // arrow keys move between the tabs, as in any tab list
      bar?.addEventListener('keydown', (e) => {
        const k = e.key;
        if (k !== 'ArrowRight' && k !== 'ArrowLeft') return;
        e.preventDefault();
        const i = (part + (k === 'ArrowRight' ? 1 : parts.length - 1)) % parts.length;
        open(i);
        parts[i].focus();
      });
      if (bar) new ResizeObserver(place).observe(bar);
    }


    if (reduce) return;

    const ST = (trigger: Element, extra: ScrollTrigger.Vars = {}): ScrollTrigger.Vars => ({ trigger, scroller: sc, ...extra });
    // arrivals follow the scroll for a short stretch as the element comes up the card
    const enter = (el: Element) => ST(el, { start: 'top 94%', end: 'top 74%', scrub: 0.35 });
    const q = <T extends Element = HTMLElement>(root: ParentNode, sel: string) => Array.from(root.querySelectorAll<T>(sel));
    const $ = (sel: string) => article.querySelector<HTMLElement>(sel);

    // chapter heads: the course and the title rise, the doodle turns as it passes
    q(article, '.ck-chead').forEach((h) => {
      gsap.fromTo(q(h, '.ck-course, .ck-ctitle'), { y: 54, autoAlpha: 0 }, { y: 0, autoAlpha: 1, stagger: 0.1, ease: 'power2.out', scrollTrigger: enter(h) });
      const art = h.querySelector('.ck-chead-art');
      if (art)
        gsap.fromTo(art, { rotation: -24, scale: 0.8, autoAlpha: 0 }, { rotation: 8, scale: 1, autoAlpha: 1, ease: 'none', scrollTrigger: ST(h, { start: 'top bottom', end: 'bottom top', scrub: 0.8 }) });
    });

    // headings and prose rise as they arrive
    q(article, '.ck-ch .ck-h, .ck-ch .ck-big, .ck-ch .ck-body, .ck-ch .ck-caption, .ck-insight, .ck-kicker, .ck-grid-note, .ck-prov, .ck-source, .ck-mood, .ck-persona-card, .ck-recipe, .ck-shift').forEach((el) =>
      gsap.fromTo(el, { y: 44, autoAlpha: 0 }, { y: 0, autoAlpha: 1, ease: 'power2.out', scrollTrigger: enter(el) }),
    );

    // rows of cards, phones and chips: dealt in one after another once the row is in view
    q(
      article,
      '.ck-who, .ck-stats, .ck-stake-key, .ck-steps, .ck-phones, .ck-journey, .ck-merch-row, .ck-pantry, .ck-quotes, .ck-notes, .ck-obs, .ck-needs, .ck-dirs, .ck-sketches, .ck-chips, .ck-said, .ck-others-grid',
    ).forEach((row) =>
      gsap.fromTo(
        row.children,
        { y: 26, autoAlpha: 0, scale: 0.94 },
        { y: 0, autoAlpha: 1, scale: 1, stagger: 0.07, duration: 0.55, ease: 'back.out(1.5)', scrollTrigger: ST(row, { start: 'top 88%', toggleActions: 'play none none reverse' }) },
      ),
    );

    // numbers count up and bars fill as they pass
    q(article, '.ck-pantry b, .ck-stats b').forEach((el) => {
      const txt = el.textContent ?? '';
      const m = txt.match(/^(\d+)(?:–(\d+))?(.*)$/);
      if (!m) return;
      const [, a1, a2, rest] = m;
      const o = { v: 0 };
      gsap.to(o, {
        v: 1,
        ease: 'power2.out',
        scrollTrigger: ST(el, { start: 'top 94%', end: 'top 70%', scrub: 0.35 }),
        onUpdate: () => {
          el.textContent = a2 ? `${Math.round(+a1 * o.v)}–${Math.round(+a2 * o.v)}${rest}` : `${Math.round(+a1 * o.v)}${rest}`;
        },
      });
    });
    q(article, '.ck-bar i').forEach((el) =>
      gsap.fromTo(el, { scaleX: 0 }, { scaleX: 1, transformOrigin: 'left center', ease: 'power2.out', scrollTrigger: ST(el, { start: 'top 94%', end: 'top 70%', scrub: 0.35 }) }),
    );

    // drawn strokes (the arrows): each path draws on as it passes
    q(article, '[data-draw]').forEach((d) => {
      const tl = gsap.timeline({ scrollTrigger: ST(d, { start: 'top 85%', end: 'top 55%', scrub: 0.4 }) });
      q<SVGPathElement>(d, 'path').forEach((p) => {
        const L = p.getTotalLength();
        tl.fromTo(p, { strokeDasharray: L, strokeDashoffset: L }, { strokeDashoffset: 0, ease: 'none', duration: 1 });
      });
    });

    // the problem: the seesaw tips toward convenience as you scroll past it
    const ss = $('[data-seesaw]');
    if (ss)
      gsap
        .timeline({ defaults: { ease: 'power2.inOut' }, scrollTrigger: ST(ss, { start: 'top 80%', end: 'center 45%', scrub: 0.6 }) })
        .fromTo(ss, { y: 60, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.6 })
        .fromTo(ss.querySelector('[data-beam]'), { rotation: 0, svgOrigin: '400 260' }, { rotation: -11, svgOrigin: '400 260', duration: 1 })
        .fromTo(ss.querySelector('[data-ss-left]'), { y: 0 }, { y: 50, duration: 1 }, '<')
        .fromTo(ss.querySelector('[data-ss-right]'), { y: 0 }, { y: -50, duration: 1 }, '<');

    // the brief: the question lights up word by word, its key words turn green
    const hm = $('[data-hmw]');
    if (hm)
      gsap
        .timeline({ scrollTrigger: ST(hm, { start: 'top 85%', end: 'bottom 45%', scrub: 0.4 }) })
        .fromTo(q(hm, '.w'), { opacity: 0.14 }, { opacity: 1, stagger: 0.1, duration: 0.25 })
        .fromTo(q(hm, '.w.k'), { color: '#14171a' }, { color: GREEN, duration: 0.5 });

    // "delivered to me" is struck out; "made for me" lands
    const sh = $('[data-shift]');
    if (sh)
      gsap
        .timeline({ scrollTrigger: ST(sh, { start: 'top 75%', end: 'bottom 55%', scrub: 0.5 }) })
        .fromTo(sh.querySelector('[data-strike]'), { scaleX: 0 }, { scaleX: 1, duration: 1 })
        .fromTo(sh.querySelector('.ck-shift-b'), { autoAlpha: 0, y: 24, scale: 0.92 }, { autoAlpha: 1, y: 0, scale: 1, duration: 1, ease: 'back.out(1.6)' });

    // research: the control dial swings from control-seeker to the middle
    const spec = $('[data-spec] span');
    if (spec) gsap.fromTo(spec, { left: '4%' }, { left: '50%', ease: 'power2.inOut', scrollTrigger: ST(spec, { start: 'top 85%', end: 'top 55%', scrub: 0.5 }) });

    // research: the five assumptions worth testing get their ticks
    q(article, '.ck-tick').forEach((t) =>
      gsap.fromTo(t, { scale: 0 }, { scale: 1, ease: 'back.out(3)', scrollTrigger: ST(t, { start: 'top 82%', toggleActions: 'play none none reverse' }) }),
    );

    // design: chef-first steps back, food-first lights up
    const pv = $('[data-pivot]');
    if (pv)
      gsap
        .timeline({ scrollTrigger: ST(pv, { start: 'top 80%', end: 'bottom 60%', scrub: 0.5 }) })
        .fromTo(pv.querySelector('.is-before'), { opacity: 1 }, { opacity: 0.6, duration: 1 })
        .fromTo(pv.querySelector('.is-after'), { boxShadow: '0 0 0 1px rgba(20,23,26,0.12)', scale: 0.97 }, { boxShadow: `0 0 0 3px ${GREEN}`, scale: 1, duration: 1 }, '<');

    // the result: the finale opens out
    const fin = $('[data-finale]');
    if (fin)
      gsap.fromTo(fin, { clipPath: 'inset(16% 20% round 28px)' }, { clipPath: 'inset(0% 0% round 0px)', ease: 'none', scrollTrigger: ST(fin, { start: 'top 95%', end: 'top 30%', scrub: 0.6 }) });
  };

  // ---------------- lifecycle ----------------
  let timer = 0;
  const remeasure = () => {
    ScrollTrigger.refresh();
    buildLine();
    aim(true);
  };

  document.addEventListener('pm:shown', (e) => {
    const { slug, scroller: sc } = (e as CustomEvent<{ slug: string; scroller: HTMLElement }>).detail;
    if (slug !== 'cooked') return;
    scroller = sc;
    active = true;
    if (!built) {
      built = true;
      build(sc);
      // images and late font loads change heights: re-measure the line and the triggers
      new ResizeObserver(() => {
        if (!active) return;
        clearTimeout(timer);
        timer = window.setTimeout(remeasure, 180);
      }).observe(article);
    }
    remeasure();
    // the wordmark lands with a little bounce each time the card opens
    const mark = article.querySelector('.ck-wordmark img');
    if (mark && !reduce) gsap.fromTo(mark, { scale: 0.82, rotation: -5 }, { scale: 1, rotation: 0, duration: 1, ease: 'elastic.out(1, 0.55)', delay: 0.1 });
  });
  document.addEventListener('pm:hidden', (e) => {
    if ((e as CustomEvent<{ slug: string }>).detail.slug === 'cooked') active = false;
  });
}
