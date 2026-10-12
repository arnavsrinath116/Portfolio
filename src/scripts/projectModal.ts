import { gsap } from 'gsap';
import type Lenis from 'lenis';

/**
 * Project cards: the clicked slab grows into a large card floating over the
 * page (geometry, corner radius and colour animate together), the case study
 * rises in, and the card scrolls on its own. × / Esc / backdrop shrink it back
 * into the slab it came from. "Other case studies" swaps the project inside
 * the same card. The address carries #project-<slug> (or #skill-<slug> for a
 * software card) for shareable links.
 */
export function initProjectModal({ lenis, reduce }: { lenis: Lenis | null; reduce: boolean }) {
  const modal = document.querySelector<HTMLElement>('[data-pm]');
  const card = document.querySelector<HTMLElement>('[data-pm-card]');
  const scroller = document.querySelector<HTMLElement>('[data-pm-scroll]');
  const backdrop = document.querySelector<HTMLElement>('[data-pm-backdrop]');
  const closeBtn = document.querySelector<HTMLButtonElement>('[data-pm-close]');
  if (!modal || !card || !scroller || !backdrop || !closeBtn) return;
  const html = document.documentElement;
  const articles = new Map(
    Array.from(modal.querySelectorAll<HTMLElement>('[data-project]')).map((a) => [a.dataset.project!, a]),
  );
  const triggers = () => Array.from(document.querySelectorAll<HTMLElement>('[data-open-project]'));

  let open = false;
  let busy = false;
  let currentSlug = '';
  let source: HTMLElement | null = null;
  let observer: IntersectionObserver | null = null;

  // case studies are keyed by slug ("ux"), software cards by "skill-<slug>"
  const hashOf = (key: string) => (key.startsWith('skill-') ? `#${key}` : `#project-${key}`);
  const keyOf = (hash: string) => {
    const m = hash.match(/^#(?:project-(.+)|(skill-.+))$/);
    const key = m ? (m[1] ?? m[2]) : '';
    return articles.has(key) ? key : '';
  };

  const slabColor = (el: HTMLElement | null) => (el ? getComputedStyle(el).backgroundColor : '');
  const finalBox = () => {
    const prevT = card.style.cssText;
    card.style.cssText = '';
    const r = card.getBoundingClientRect();
    card.style.cssText = prevT;
    return r;
  };
  const place = (r: DOMRect, radius: number) => {
    card.style.top = `${r.top}px`;
    card.style.left = `${r.left}px`;
    card.style.width = `${r.width}px`;
    card.style.height = `${r.height}px`;
    card.style.borderRadius = `${radius}px`;
  };

  // ---- double diamond tracking inside the card's own scroll ----
  const ORDER = ['discover', 'define', 'develop', 'deliver', 'outcome'];
  const track = (article: HTMLElement) => {
    observer?.disconnect();
    const halves = Array.from(article.querySelectorAll<SVGPathElement>('[data-half]'));
    const links = Array.from(article.querySelectorAll<HTMLAnchorElement>('[data-phase-link]'));
    const set = (key: string) => {
      const idx = ORDER.indexOf(key);
      halves.forEach((h) => {
        const i = ORDER.indexOf(h.dataset.half!);
        h.classList.toggle('is-active', i === idx);
        h.classList.toggle('is-done', i < idx || key === 'outcome');
      });
      links.forEach((a) => {
        const on = a.dataset.phaseLink === key;
        a.classList.toggle('is-active', on);
        if (on) {
          a.setAttribute('aria-current', 'step');
          const bar = a.closest('ol');
          if (bar && bar.scrollWidth > bar.clientWidth) {
            const x = a.getBoundingClientRect().left - bar.getBoundingClientRect().left + bar.scrollLeft;
            bar.scrollTo({ left: x - bar.clientWidth / 2 + a.offsetWidth / 2, behavior: 'smooth' });
          }
        } else a.removeAttribute('aria-current');
      });
    };
    observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && set((e.target as HTMLElement).dataset.phase!)),
      { root: scroller, rootMargin: '-45% 0px -50% 0px' },
    );
    article.querySelectorAll<HTMLElement>('[data-phase]').forEach((s) => observer!.observe(s));
    set('discover');
  };

  // where a section sits in the card's scroll, clear of the sticky phase bar on narrow screens
  const sectionTop = (el: HTMLElement) => {
    const nav = el.closest('[data-project]')?.querySelector<HTMLElement>('[data-diamond-nav]');
    const pinned = nav && innerWidth <= 900 ? nav.offsetHeight + 16 : 24;
    return el.getBoundingClientRect().top - scroller.getBoundingClientRect().top + scroller.scrollTop - pinned;
  };

  const show = (slug: string) => {
    articles.forEach((a, s) => (a.hidden = s !== slug));
    currentSlug = slug;
    scroller.scrollTop = 0;
    const article = articles.get(slug)!;
    track(article);
    return article;
  };

  const riseIn = (article: HTMLElement, delay = 0) =>
    gsap.fromTo(
      article.querySelectorAll('[data-pc-rise], .pc-body'),
      { opacity: 0, y: 26 },
      { opacity: 1, y: 0, duration: reduce ? 0 : 0.7, ease: 'expo.out', stagger: 0.07, delay },
    );

  const focusables = () =>
    Array.from(card.querySelectorAll<HTMLElement>('button, a[href]')).filter((el) => el.offsetParent !== null);

  async function openProject(slug: string, from: HTMLElement | null) {
    if (busy || open || !articles.has(slug)) return;
    busy = true;
    open = true;
    source = from;
    modal.hidden = false;
    html.classList.add('pm-open');
    lenis?.stop();
    history.replaceState(null, '', hashOf(slug));
    const article = show(slug);
    gsap.set(article.querySelectorAll('[data-pc-rise], .pc-body'), { opacity: 0 });
    closeBtn.style.opacity = '0';

    const end = finalBox();
    const start = from?.getBoundingClientRect();
    if (start && !reduce) {
      place(start, 14);
      card.classList.add('is-moving');
      card.style.backgroundColor = slabColor(from);
      from!.style.visibility = 'hidden';
      gsap.to(backdrop, { opacity: 1, duration: 0.5, ease: 'power2.out' });
      // the case study starts rising as the card settles, not after it stops
      riseIn(article, 0.52);
      await gsap.to(card, {
        top: end.top,
        left: end.left,
        width: end.width,
        height: end.height,
        borderRadius: 18,
        backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--slate-3').trim(),
        duration: 0.8,
        ease: 'expo.inOut',
      });
    } else {
      gsap.set(backdrop, { opacity: 1 });
      riseIn(article);
    }
    card.style.cssText = '';
    card.classList.remove('is-moving');
    gsap.to(closeBtn, { opacity: 1, duration: 0.3 });
    // the card is in place: from here it can be closed even while the text still rises
    busy = false;
    closeBtn.focus({ preventScroll: true });
  }

  async function closeProject() {
    if (busy || !open) return;
    busy = true;
    const article = articles.get(currentSlug)!;
    const rising = article.querySelectorAll('[data-pc-rise], .pc-body');
    gsap.killTweensOf(rising);
    document.dispatchEvent(new Event('fluid:release'));
    closeBtn.style.pointerEvents = 'none';
    const target = source && document.contains(source) ? source.getBoundingClientRect() : null;
    if (!reduce) {
      await gsap.to([closeBtn, ...article.querySelectorAll('[data-pc-rise], .pc-body, .pc-others')], {
        opacity: 0,
        duration: 0.22,
        ease: 'power2.in',
      });
    }
    if (target && !reduce) {
      place(card.getBoundingClientRect(), 18);
      card.classList.add('is-moving');
      gsap.to(backdrop, { opacity: 0, duration: 0.6, ease: 'power2.inOut' });
      await gsap.to(card, {
        top: target.top,
        left: target.left,
        width: target.width,
        height: target.height,
        borderRadius: 14,
        backgroundColor: slabColor(source),
        duration: 0.7,
        ease: 'expo.inOut',
      });
    }
    if (source) source.style.visibility = '';
    closeBtn.style.pointerEvents = '';
    modal.hidden = true;
    card.style.cssText = '';
    card.classList.remove('is-moving');
    gsap.set([backdrop], { opacity: 0 });
    gsap.set([closeBtn, ...article.querySelectorAll('[data-pc-rise], .pc-body, .pc-others')], { clearProps: 'opacity,transform' });
    observer?.disconnect();
    html.classList.remove('pm-open');
    lenis?.start();
    history.replaceState(null, '', location.pathname + location.search);
    open = false;
    busy = false;
    source?.focus({ preventScroll: true });
  }

  async function switchProject(slug: string) {
    if (busy || !open || slug === currentSlug) return;
    busy = true;
    const old = articles.get(currentSlug)!;
    await gsap.to(old, { opacity: 0, y: -16, duration: reduce ? 0 : 0.25, ease: 'power2.in' });
    gsap.set(old, { clearProps: 'opacity,transform' });
    // the slab this card returns to on close follows the project now shown
    source = document.querySelector<HTMLElement>(`[data-open-project="${slug}"]`) ?? source;
    triggers().forEach((t) => (t.style.visibility = t === source ? 'hidden' : ''));
    const article = show(slug);
    history.replaceState(null, '', hashOf(slug));
    busy = false;
    closeBtn.focus({ preventScroll: true });
    riseIn(article);
  }

  // ---- wiring ----
  triggers().forEach((t) =>
    t.addEventListener('click', (e) => {
      e.preventDefault();
      openProject(t.dataset.openProject!, t);
    }),
  );
  modal.addEventListener('click', (e) => {
    const sw = (e.target as HTMLElement).closest<HTMLElement>('[data-switch-project]');
    if (sw) switchProject(sw.dataset.switchProject!);
    const link = (e.target as HTMLElement).closest<HTMLAnchorElement>('[data-phase-link]');
    if (link) {
      e.preventDefault();
      const t = modal.querySelector<HTMLElement>(link.getAttribute('href')!);
      if (t) scroller.scrollTo({ top: sectionTop(t), behavior: reduce ? 'auto' : 'smooth' });
    }
  });
  closeBtn.addEventListener('click', closeProject);
  backdrop.addEventListener('click', closeProject);
  document.addEventListener('keydown', (e) => {
    if (!open) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      closeProject();
    } else if (e.key === 'Tab') {
      const f = focusables();
      const i = f.indexOf(document.activeElement as HTMLElement);
      const next = e.shiftKey ? (i <= 0 ? f.length - 1 : i - 1) : i === f.length - 1 ? 0 : i + 1;
      e.preventDefault();
      f[next]?.focus();
    }
  });

  // deep link: /#project-ux or /#skill-figma opens that card, on load or when the hash changes later
  const fromHash = () => {
    const key = keyOf(location.hash);
    if (!key) return;
    if (open) switchProject(key);
    else openProject(key, document.querySelector<HTMLElement>(`[data-open-project="${key}"]`));
  };
  window.addEventListener('hashchange', fromHash);
  const initial = keyOf(location.hash);
  if (initial) setTimeout(() => openProject(initial, null), 300); // no slab in view yet: the card fades in
}
