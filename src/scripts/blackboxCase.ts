import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { pointAtLength } from './guide';

/**
 * BlackBox. A box that speaks in red light, so the page does too. The story reads in order (in
 * class, the brief, the box, the build, afterwards) and the motion follows the scroll without
 * ever holding it:
 * - the signal, a red line, runs down the margins from chapter to chapter, its tip a lit LED
 *   riding at the reading point; each chapter's LED switches on as it arrives;
 * - the classroom frames open out of the dark one by one, like the film's first shots;
 * - the brief's three rules light up, one LED at a time;
 * - the film's frames play as you scroll past them: turn, tap, glow, reply;
 * - the build log lights up entry by entry, in the order the week's files were saved;
 * - a 7 turns into a coffee cup, the sixteen icons switch on, and the coffee turns the right way up;
 * - the laser runs the cut sheet part by part, and the stack pulls apart to show its layers;
 * - one exchange plays down the two lanes, and the lessons light up one after another.
 * Nothing is pinned. With reduced motion everything is simply there, lit, and the line is drawn whole.
 */
export function initBlackboxCase({ reduce }: { reduce: boolean }) {
  const article = document.querySelector<HTMLElement>('[data-bb]');
  if (!article) return;
  const slug = article.dataset.project;
  let scroller: HTMLElement | null = null;
  let built = false;
  let active = false;

  const q = <T extends Element = HTMLElement>(root: ParentNode, sel: string) => Array.from(root.querySelectorAll<T>(sel));
  const clamp01 = gsap.utils.clamp(0, 1);

  // ---------------- the signal ----------------
  const svg = article.querySelector<SVGSVGElement>('[data-bb-line]')!;
  const path = svg.querySelector<SVGPathElement>('.bb-line-path')!;
  const glow = svg.querySelector<SVGPathElement>('.bb-line-glow')!;
  const tip = svg.querySelector<SVGCircleElement>('.bb-line-tip')!;
  const halo = svg.querySelector<SVGCircleElement>('.bb-line-halo')!;
  let total = 0;
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

  // the signal runs like a trace on a circuit board: straight down the margin beside each block, and
  // across in the gap between blocks, turning each corner on a small radius. It never crosses the copy.
  type P = { x: number; y: number };
  const trace = (st: P[]) => {
    const X = [st[0].x];
    const Y = [st[0].y];
    const L = [0];
    let d = `M${st[0].x.toFixed(1)} ${st[0].y.toFixed(1)}`;
    const push = (x: number, y: number) => {
      const n = X.length - 1;
      L.push(L[n] + Math.hypot(x - X[n], y - Y[n]));
      X.push(x);
      Y.push(y);
    };
    const line = (x: number, y: number) => {
      const n = X.length - 1;
      const x0 = X[n];
      const y0 = Y[n];
      const k = Math.max(1, Math.ceil(Math.hypot(x - x0, y - y0) / 8));
      for (let i = 1; i <= k; i++) push(x0 + ((x - x0) * i) / k, y0 + ((y - y0) * i) / k);
      d += `L${x.toFixed(1)} ${y.toFixed(1)}`;
    };
    const arc = (cx: number, cy: number, r: number, a0: number, a1: number, sweep: number) => {
      for (let i = 1; i <= 12; i++) {
        const a = a0 + ((a1 - a0) * i) / 12;
        push(cx + r * Math.cos(a), cy + r * Math.sin(a));
      }
      const n = X.length - 1;
      d += `A${r.toFixed(1)} ${r.toFixed(1)} 0 0 ${sweep} ${X[n].toFixed(1)} ${Y[n].toFixed(1)}`;
    };
    for (let i = 1; i < st.length; i++) {
      const a = { x: X[X.length - 1], y: Y[Y.length - 1] };
      const b = st[i];
      if (b.y <= a.y) continue;
      if (Math.abs(b.x - a.x) < 1) {
        line(b.x, b.y);
        continue;
      }
      const s = Math.sign(b.x - a.x);
      const ym = (a.y + b.y) / 2;
      const r = Math.max(2, Math.min(26, (b.y - a.y) / 2 - 1, Math.abs(b.x - a.x) / 2));
      line(a.x, ym - r);
      arc(a.x + s * r, ym - r, r, s > 0 ? Math.PI : 0, Math.PI / 2, s > 0 ? 0 : 1);
      line(b.x - s * r, ym);
      arc(b.x - s * r, ym + r, r, -Math.PI / 2, s > 0 ? 0 : -Math.PI, s > 0 ? 1 : 0);
      line(b.x, b.y);
    }
    return { d, xs: X, ys: Y, ls: L, total: L[L.length - 1] };
  };

  const buildLine = () => {
    const W = article.clientWidth;
    const H = article.scrollHeight;
    svg.setAttribute('width', String(W));
    svg.setAttribute('height', String(H));
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    const padEl = article.querySelector<HTMLElement>('.bb-block');
    const pad = padEl ? parseFloat(getComputedStyle(padEl).paddingLeft) : 40;
    const gutter = Math.max(10, pad * 0.42);
    const sideX = { l: gutter, r: W - gutter };
    const hero = article.querySelector<HTMLElement>('.bb-hero')!;
    // on a narrow card the line keeps to the left margin; on wider ones it runs down one margin for a
    // whole chapter and crosses to the other in the gap before the next chapter's title
    const narrow = W < 760;
    const st: P[] = [{ x: narrow ? sideX.l : W / 2, y: hero.offsetHeight - 24 }];
    let side: 'l' | 'r' = narrow ? 'l' : 'r';
    q(article, '.bb-chead, [data-bb-in]').forEach((el) => {
      if (!narrow && el.classList.contains('bb-chead')) side = side === 'l' ? 'r' : 'l';
      const top = offsetTop(el);
      const y1 = top + parseFloat(getComputedStyle(el).paddingTop);
      const y2 = top + el.offsetHeight;
      if (y2 - y1 < 20) return;
      st.push({ x: sideX[side], y: y1 }, { x: sideX[side], y: y2 });
    });
    const others = article.querySelector<HTMLElement>('.bb-others');
    st.push({ x: narrow ? sideX.l : W / 2, y: others ? offsetTop(others) : H - 40 });
    const sp = trace(st);
    ({ xs, ys, ls, total } = sp);
    for (const p of [path, glow]) {
      p.setAttribute('d', sp.d);
      p.setAttribute('pathLength', String(total));
      p.style.strokeDasharray = `${total}`;
    }
    let maxY = -Infinity;
    reach = ys.map((y) => (maxY = Math.max(maxY, y)));
  };

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
    path.style.strokeDashoffset = glow.style.strokeDashoffset = `${total - len}`;
    const pt = pointAtLength({ xs, ys, ls }, len);
    for (const c of [tip, halo]) {
      c.setAttribute('cx', String(pt.x));
      c.setAttribute('cy', String(pt.y));
    }
    tip.style.opacity = halo.style.opacity = len > 2 && len < total - 2 ? '1' : '0';
  };

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
      path.style.strokeDashoffset = glow.style.strokeDashoffset = '0';
      tip.style.opacity = halo.style.opacity = '0';
      return;
    }
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
    if (reduce) return;

    const ST = (trigger: Element, extra: ScrollTrigger.Vars = {}): ScrollTrigger.Vars => ({ trigger, scroller: sc, ...extra });
    const enter = (el: Element) => ST(el, { start: 'top 94%', end: 'top 68%', scrub: 0.4 });
    // a scrubbed trigger that only reports its progress
    const track = (trigger: Element, start: string, end: string, onP: (p: number) => void) =>
      ScrollTrigger.create(ST(trigger, { start, end, scrub: true, onUpdate: (s) => onP(s.progress), onRefresh: (s) => onP(s.progress) }));
    // lights a class on once its element reaches the reading point, and off again if you scroll back above it
    const light = (el: Element, cls: string, start = 'top 66%') =>
      ScrollTrigger.create(ST(el, { start, onEnter: () => el.classList.add(cls), onLeaveBack: () => el.classList.remove(cls) }));

    // the hero render drifts and dims as the card scrolls on
    const reel = article.querySelector<HTMLElement>('[data-bb-reel]');
    if (reel)
      gsap.fromTo(reel, { y: 0, filter: 'brightness(1)' }, { y: 70, filter: 'brightness(0.35)', ease: 'none', scrollTrigger: ST(reel, { start: 'top 10%', end: 'bottom top', scrub: true }) });

    // each chapter: its LED switches on as the signal arrives, and its title rises up from below
    q(article, '.bb-chead').forEach((h) => {
      h.classList.add('is-armed');
      light(h, 'is-lit', 'top 62%');
      const title = h.querySelector('.bb-ctitle');
      if (title)
        gsap.fromTo(
          title,
          { opacity: 0, y: 60, clipPath: 'inset(0% 0% 100% 0%)' },
          { opacity: 1, y: 0, clipPath: 'inset(0% 0% -20% 0%)', ease: 'power2.out', scrollTrigger: ST(h, { start: 'top 82%', end: 'bottom 62%', scrub: 0.5 }) },
        );
    });

    // copy rises into place
    q(article, '.bb-lead-line, .bb-verdict, .bb-idea-copy > *, .bb-bhead > *, .bb-flip-copy > *, .bb-v2-copy > *, .bb-note').forEach((el) =>
      gsap.fromTo(el, { opacity: 0, y: 28 }, { opacity: 1, y: 0, ease: 'none', scrollTrigger: enter(el) }),
    );
    // the verdict comes in from the right, where it lands
    const verdict = article.querySelector('.bb-verdict');
    if (verdict) gsap.fromTo(verdict, { x: 60 }, { x: 0, ease: 'none', scrollTrigger: ST(verdict, { start: 'top 95%', end: 'top 60%', scrub: 0.5 }) });

    // the problem: the three steps open out of the dark one after another, left to right
    const story = article.querySelector<HTMLElement>('.bb-story');
    if (story) {
      const tl = gsap.timeline({ scrollTrigger: ST(story, { start: 'top 90%', end: 'center 55%', scrub: 0.5 }) });
      q(story, '.bb-frame').forEach((f, i) => {
        const pic = f.querySelector('.bb-frame-pic');
        const im = f.querySelector('.bb-frame-pic img');
        const cap = q(f, 'figcaption > *');
        const at = i * 0.35;
        if (pic) tl.fromTo(pic, { clipPath: 'inset(0% 100% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', ease: 'power2.inOut', duration: 0.6 }, at);
        if (im) tl.fromTo(im, { scale: 1.15, filter: 'brightness(0.3)' }, { scale: 1, filter: 'brightness(1)', ease: 'power1.out', duration: 0.8 }, at);
        if (cap.length) tl.fromTo(cap, { opacity: 0, y: 16 }, { opacity: 1, y: 0, ease: 'power1.out', duration: 0.35, stagger: 0.08 }, at + 0.35);
      });
    }

    // photographs switch on: from a dark, slightly cropped frame to the full picture
    q(article, '.bb-idea-fig img, .bb-box-photo img, .bb-team img, .bb-play-fig img').forEach((im) =>
      gsap.fromTo(
        im,
        { clipPath: 'inset(6% 6% 6% 6% round 14px)', filter: 'brightness(0.2) saturate(0.3)', scale: 1.06 },
        {
          clipPath: 'inset(0% 0% 0% 0% round 0px)',
          filter: 'brightness(1) saturate(1)',
          scale: 1,
          ease: 'none',
          scrollTrigger: ST(im, { start: 'top 96%', end: 'top 55%', scrub: 0.5 }),
        },
      ),
    );

    // the brief: one LED, then its words
    q(article, '.bb-rules li').forEach((li, i) => {
      const dot = li.querySelector('i');
      const tl = gsap.timeline({ scrollTrigger: ST(li, { start: `top ${90 - i * 2}%`, end: `top ${64 - i * 2}%`, scrub: 0.4 }) });
      if (dot) tl.fromTo(dot, { scale: 0.2, opacity: 0.15, boxShadow: '0 0 0px 0px rgba(255,59,48,0)' }, { scale: 1, opacity: 1, boxShadow: '0 0 18px 4px rgba(255,59,48,0.55)', ease: 'none', duration: 0.5 });
      tl.fromTo(li, { color: 'rgba(243,241,237,0.12)', x: -24 }, { color: 'rgba(243,241,237,1)', x: 0, ease: 'none', duration: 0.6 }, 0.25);
    });

    // the box in use: the film's frames play as the block passes, and the beat they show lights up
    const play = article.querySelector<HTMLElement>('[data-bb-play]');
    if (play) {
      const frames = JSON.parse(play.dataset.frames ?? '[]') as string[];
      const img = play.querySelector<HTMLImageElement>('[data-bb-frame]');
      const count = play.querySelector<HTMLElement>('[data-bb-frame-n]');
      const beats = play.querySelector<HTMLElement>('.bb-beats');
      const items = beats ? q(beats, 'li') : [];
      beats?.classList.add('is-armed');
      // fetch the frames once the block is near, so the scrub never waits on the network
      ScrollTrigger.create(
        ST(play, {
          start: 'top 180%',
          once: true,
          onEnter: () =>
            frames.forEach((src) => {
              new Image().src = src;
            }),
        }),
      );
      let at = -1;
      const pad = (n: number) => String(n).padStart(2, '0');
      track(play, 'top 70%', 'bottom 40%', (p) => {
        const i = Math.min(frames.length - 1, Math.floor(p * frames.length));
        if (i === at || !img) return;
        at = i;
        img.src = frames[i];
        if (count) count.textContent = `${pad(i + 1)} / ${frames.length}`;
        const f = i / frames.length;
        items.forEach((li) => li.classList.toggle('is-on', f >= +li.dataset.from! - 0.001 && f < +li.dataset.to! - 0.001));
      });
    }

    // the wires run from each part into the board, then its pins light
    q(article, '.bb-pins li').forEach((li) => {
      const wire = li.querySelector('.bb-wire i');
      const pins = q(li, '.bb-pinset code');
      const tl = gsap.timeline({ scrollTrigger: ST(li, { start: 'top 88%', end: 'top 58%', scrub: 0.4 }) });
      if (wire) tl.fromTo(wire, { scaleX: 0 }, { scaleX: 1, ease: 'none', duration: 0.7 });
      if (pins.length) tl.fromTo(pins, { opacity: 0, x: -6 }, { opacity: 1, x: 0, ease: 'none', duration: 0.3, stagger: 0.08 }, 0.6);
    });

    // the build log lights up entry by entry, and each day's name slides in beside its first entry
    const log = article.querySelector<HTMLElement>('[data-bb-log]');
    if (log) {
      log.classList.add('is-armed');
      q(log, '.bb-entry').forEach((e) => light(e, 'is-lit', 'top 70%'));
      q(log, '.bb-day-h').forEach((d) => gsap.fromTo(d, { opacity: 0, x: -30 }, { opacity: 1, x: 0, ease: 'none', scrollTrigger: ST(d, { start: 'top 92%', end: 'top 70%', scrub: 0.4 }) }));
    }

    // Wednesday's 7 becomes Thursday's coffee cup: the matrix redraws itself row by row, the way it scans
    const morph = article.querySelector<HTMLElement>('[data-bb-morph]');
    if (morph) {
      const grid = morph.querySelector<HTMLElement>('.bb-morph-grid');
      const dots = grid ? (Array.from(grid.children) as HTMLElement[]) : [];
      grid?.classList.add('is-armed');
      track(morph, 'top 75%', 'bottom 45%', (p) => {
        const m = clamp01((p - 0.25) / 0.5);
        dots.forEach((d, i) => {
          const isB = m * dots.length > i;
          d.classList.toggle('on', isB ? d.classList.contains('b') : d.classList.contains('a'));
        });
        morph.style.setProperty('--mm', m > 0.5 ? '1' : '0');
      });
    }

    // the sheet of sixteen switches on, icon by icon
    const sheet = article.querySelector<HTMLElement>('.bb-sheet');
    if (sheet) {
      const icons = Array.from(sheet.children) as HTMLElement[];
      sheet.classList.add('is-armed');
      track(sheet, 'top 85%', 'top 35%', (p) => icons.forEach((d, i) => d.classList.toggle('is-lit', p * icons.length > i + 0.05)));
    }

    // the coffee icon, upside down as written, turns the right way up
    const flip = article.querySelector<HTMLElement>('[data-flip-grid]');
    if (flip) track(flip, 'top 80%', 'top 35%', (p) => flip.style.setProperty('--flip', `${gsap.parseEase('power2.inOut')(p) * 180}deg`));

    // the laser runs the sheet: the faces, then the band, one after another
    const cut = article.querySelector<HTMLElement>('[data-bb-cut]');
    if (cut) track(cut, 'top 80%', 'bottom 60%', (p) => cut.style.setProperty('--p', p.toFixed(4)));

    // the stack starts as the closed box and pulls apart to show its layers
    const stack = article.querySelector<HTMLElement>('[data-bb-stack]');
    if (stack) {
      const key = q(stack, '.bb-stack-key li');
      track(stack, 'top 80%', 'center 50%', (p) => {
        const e = gsap.parseEase('power3.inOut')(p);
        stack.style.setProperty('--e', e.toFixed(4));
        key.forEach((li, i) => (li.style.opacity = String(clamp01(e * 4 - i * 0.6))));
      });
    }

    // one exchange plays down the lanes; each note crosses from one box to the other
    const seq = article.querySelector<HTMLElement>('[data-bb-seq]');
    if (seq) {
      const evs = q(seq, '.bb-ev');
      const n = evs.length;
      track(seq, 'top 80%', 'bottom 60%', (p) => {
        const at = p * n;
        evs.forEach((ev, i) => {
          ev.classList.toggle('is-lit', at > i + 0.05);
          if (ev.classList.contains('is-msg')) {
            const local = clamp01(at - i);
            const toLeft = ev.classList.contains('to-l');
            const dot = ev.querySelector<HTMLElement>('.bb-msg i');
            if (dot) {
              dot.style.setProperty('--p', `${(toLeft ? 1 - local : local) * 100}%`);
              dot.style.setProperty('--o', local > 0 && local < 1 ? '1' : '0');
            }
          }
        });
      });
    }

    // what it taught me: each lesson brightens as it reaches the reading point
    q(article, '.bb-learn li').forEach((li) => {
      const b = li.querySelector('b');
      const p = li.querySelector('p');
      const tl = gsap.timeline({ scrollTrigger: ST(li, { start: 'top 88%', end: 'top 58%', scrub: 0.4 }) });
      if (b) tl.fromTo(b, { color: 'rgba(243,241,237,0.14)', y: 20 }, { color: 'rgba(243,241,237,1)', y: 0, ease: 'none', duration: 1 });
      if (p) tl.fromTo(p, { opacity: 0 }, { opacity: 1, ease: 'none', duration: 0.6 }, 0.4);
    });

    // lists come in one after another
    q(article, '.bb-others-grid').forEach((list) => {
      const items = Array.from(list.children) as HTMLElement[];
      if (!items.length) return;
      gsap.set(items, { opacity: 0, y: 24 });
      ScrollTrigger.create(
        ST(list, {
          start: 'top 92%',
          onEnter: () => gsap.to(items, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out', stagger: 0.07, overwrite: true }),
          onLeaveBack: () => gsap.to(items, { opacity: 0, y: 24, duration: 0.3, ease: 'power1.in', overwrite: true }),
        }),
      );
    });
  };

  // ---------------- lifecycle ----------------
  let timer = 0;
  const remeasure = () => {
    ScrollTrigger.refresh();
    buildLine();
    aim(true);
  };

  document.addEventListener('pm:shown', (e) => {
    const d = (e as CustomEvent<{ slug: string; scroller: HTMLElement }>).detail;
    if (d.slug !== slug) return;
    scroller = d.scroller;
    active = true;
    if (!built) {
      built = true;
      build(d.scroller);
      // images and late font loads change heights: re-measure the line and the triggers
      new ResizeObserver(() => {
        if (!active) return;
        clearTimeout(timer);
        timer = window.setTimeout(remeasure, 180);
      }).observe(article);
    }
    remeasure();

    // the box switches on each time the card opens: the logo, then the words, then the render
    if (!reduce) {
      gsap.fromTo(q(article, '.bb-hero-copy > *'), { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8, ease: 'expo.out', delay: 0.2, stagger: 0.07 });
      gsap.fromTo(article.querySelector('[data-bb-reel]'), { opacity: 0, scale: 0.96 }, { opacity: 1, scale: 1, duration: 1.1, ease: 'expo.out', delay: 0.3 });
    }
  });
  document.addEventListener('pm:hidden', (e) => {
    if ((e as CustomEvent<{ slug: string }>).detail.slug === slug) active = false;
  });
}
