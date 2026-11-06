import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/**
 * The Man the God Wore. A film case, so the motion borrows from film and follows the scroll
 * without ever holding it:
 * - each chapter's photograph develops as it arrives, from a dark, cropped frame to the full print;
 * - headings and copy rise in, the field counts count up, lists come in one after another;
 * - a few moments play in place: the old title is struck out, the verse and the pull lines light up
 *   word by word, the costume diagrams are drawn top to bottom.
 * Nothing is pinned. With reduced motion everything is simply there.
 */
export function initDocumentaryCase({ reduce }: { reduce: boolean }) {
  const article = document.querySelector<HTMLElement>('[data-dc]');
  if (!article) return;
  const slug = article.dataset.project;
  let built = false;
  let active = false;

  const q = <T extends Element = HTMLElement>(root: ParentNode, sel: string) => Array.from(root.querySelectorAll<T>(sel));


  // ---------------- word by word ----------------
  // wrap each word of an element's own text (not its <cite>) so the words can light up in turn
  const words = (el: HTMLElement) => {
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, {
      acceptNode: (n) => (n.parentElement?.closest('cite') ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT),
    });
    const nodes: Text[] = [];
    while (walker.nextNode()) nodes.push(walker.currentNode as Text);
    nodes.forEach((t) => {
      const frag = document.createDocumentFragment();
      t.data.split(/(\s+)/).forEach((part) => {
        if (!part) return;
        if (/^\s+$/.test(part)) frag.append(part);
        else {
          const w = document.createElement('span');
          w.className = 'dc-w';
          w.textContent = part;
          frag.append(w);
        }
      });
      t.replaceWith(frag);
    });
    return q(el, '.dc-w');
  };

  // ---------------- build (first show) ----------------
  const build = (sc: HTMLElement) => {
    if (reduce) return;

    const ST = (trigger: Element, extra: ScrollTrigger.Vars = {}): ScrollTrigger.Vars => ({ trigger, scroller: sc, ...extra });
    const enter = (el: Element) => ST(el, { start: 'top 94%', end: 'top 70%', scrub: 0.4 });

    // the hero: the poster drifts and dims as the card scrolls on
    const frame = article.querySelector<HTMLElement>('[data-dc-frame]');
    const poster = frame?.querySelector('.dc-poster');
    if (frame && poster)
      gsap.fromTo(poster, { yPercent: 0, scale: 1.04 }, { yPercent: 10, scale: 1.12, opacity: 0.55, ease: 'none', scrollTrigger: ST(frame, { start: 'top top', end: 'bottom top', scrub: true }) });

    // headings and copy rise into place as they come up the card
    q(article, '.dc-rhead, .dc-ch-head, .dc-copy > p, .dc-label, .dc-shift, .dc-made-lg, .dc-thanks').forEach((el) =>
      gsap.fromTo(el, { opacity: 0, y: 26 }, { opacity: 1, y: 0, ease: 'none', scrollTrigger: enter(el) }),
    );

    // each chapter's photograph develops as the chapter arrives: from a dark crop to the full print
    q(article, '.dc-ch').forEach((ch) => {
      const im = ch.querySelector('.dc-ch-cover img');
      if (!im) return;
      gsap.fromTo(
        im,
        { clipPath: 'inset(9% 12% 9% 12% round 4px)', filter: 'brightness(0.25) saturate(0.2) contrast(1.2)', scale: 1.08 },
        {
          clipPath: 'inset(0% 0% 0% 0% round 4px)',
          filter: 'brightness(1) saturate(1) contrast(1)',
          scale: 1,
          ease: 'none',
          scrollTrigger: ST(ch, { start: 'top 90%', end: 'top 20%', scrub: 0.5 }),
        },
      );
    });
    const group = article.querySelector('.dc-group img');
    if (group)
      gsap.fromTo(group, { filter: 'brightness(0.25) saturate(0.2)', scale: 1.06 }, { filter: 'brightness(1) saturate(1)', scale: 1, ease: 'none', scrollTrigger: ST(group, { start: 'top 95%', end: 'top 40%', scrub: 0.5 }) });

    // the field in numbers counts up as it passes
    q(article, '.dc-counts b').forEach((b) => {
      const m = (b.textContent ?? '').match(/^(\d+)(.*)$/);
      if (!m) return;
      const to = +m[1];
      const rest = m[2];
      const o = { v: 0 };
      gsap.to(o, {
        v: to,
        ease: 'none',
        onUpdate: () => (b.textContent = `${Math.round(o.v)}${rest}`),
        scrollTrigger: ST(b, { start: 'top 95%', end: 'top 65%', scrub: 0.4 }),
      });
    });

    // lists come in one after another, like cuts
    q(article, '.dc-counts, .dc-gaps, .dc-povs, .dc-kit, .dc-arc, .dc-sound-list, .dc-finds, .dc-outputs, .dc-people, .dc-others-grid').forEach((list) => {
      const items = Array.from(list.children) as HTMLElement[];
      if (!items.length) return;
      gsap.set(items, { opacity: 0, y: 30 });
      ScrollTrigger.create(
        ST(list, {
          start: 'top 88%',
          onEnter: () => gsap.to(items, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', stagger: 0.08, overwrite: true }),
          onLeaveBack: () => gsap.to(items, { opacity: 0, y: 30, duration: 0.3, ease: 'power1.in', overwrite: true }),
        }),
      );
    });

    // the old title is struck out in red, then the new one comes up
    const shift = article.querySelector<HTMLElement>('.dc-shift');
    if (shift) {
      const old = shift.querySelector('s');
      const now = shift.querySelector('b');
      const tl = gsap.timeline({ scrollTrigger: ST(shift, { start: 'top 82%', end: 'top 45%', scrub: 0.5 }) });
      if (old) tl.fromTo(old, { '--strike': 0 }, { '--strike': 1, ease: 'none', duration: 1 });
      if (now) tl.fromTo(now, { opacity: 0, y: 14, letterSpacing: '0.04em' }, { opacity: 1, y: 0, letterSpacing: '-0.02em', ease: 'none', duration: 0.8 }, 0.6);
    }

    // the opening verse and the pull lines light up a word at a time
    q(article, '.dc-verse, .dc-pull').forEach((el) => {
      const ws = words(el);
      gsap.fromTo(ws, { opacity: 0.16 }, { opacity: 1, ease: 'none', stagger: 0.1, scrollTrigger: ST(el, { start: 'top 85%', end: 'top 45%', scrub: 0.4 }) });
    });

    // the costume diagrams are drawn from the crown down
    q(article, '.dc-dias img').forEach((im, i) =>
      gsap.fromTo(
        im,
        { clipPath: 'inset(0% 0% 100% 0%)' },
        { clipPath: 'inset(0% 0% 0% 0%)', ease: 'none', scrollTrigger: ST(im, { start: `top ${92 - i * 4}%`, end: `top ${45 - i * 4}%`, scrub: 0.5 }) },
      ),
    );

    // the chenda photograph drifts against the list of sounds
    const chenda = article.querySelector('.dc-sound-fig img');
    if (chenda) gsap.fromTo(chenda, { yPercent: -6, scale: 1.1 }, { yPercent: 6, scale: 1.1, ease: 'none', scrollTrigger: ST(chenda, { start: 'top bottom', end: 'bottom top', scrub: true }) });
  };

  // ---------------- lifecycle ----------------
  let timer = 0;
  const remeasure = () => ScrollTrigger.refresh();

  document.addEventListener('pm:shown', (e) => {
    const d = (e as CustomEvent<{ slug: string; scroller: HTMLElement }>).detail;
    if (d.slug !== slug) return;
    active = true;
    if (!built) {
      built = true;
      build(d.scroller);
      // lazy images and late fonts change heights: re-measure the triggers
      new ResizeObserver(() => {
        if (!active) return;
        clearTimeout(timer);
        timer = window.setTimeout(remeasure, 180);
      }).observe(article);
    }
    remeasure();

    // the viewfinder closes in on the frame and the title card comes up each time the card opens
    if (!reduce) {
      gsap.fromTo(q(article, '.dc-mark'), { scale: 1.9, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.9, ease: 'expo.out', delay: 0.15, stagger: 0.05 });
      gsap.fromTo(q(article, '.dc-titlecard > *'), { opacity: 0, y: 22 }, { opacity: 1, y: 0, duration: 0.9, ease: 'expo.out', delay: 0.3, stagger: 0.1 });
      gsap.fromTo(article.querySelector('.dc-poster'), { scale: 1.16 }, { scale: 1.04, duration: 1.6, ease: 'expo.out' });
    }
  });
  document.addEventListener('pm:hidden', (e) => {
    if ((e as CustomEvent<{ slug: string }>).detail.slug === slug) active = false;
  });
}
