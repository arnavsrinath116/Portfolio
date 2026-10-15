import type Lenis from 'lenis';

/**
 * Header sections: each link glides to its section, and the link for the section
 * you're reading is marked (aria-current), so the header doubles as a "you are here".
 */
export function initNav({ lenis }: { lenis: Lenis | null }) {
  const links = Array.from(document.querySelectorAll<HTMLAnchorElement>('[data-nav-link]'));
  if (!links.length) return;
  const byId = new Map(links.map((a) => [a.getAttribute('href')!.slice(1), a]));

  links.forEach((a) =>
    a.addEventListener('click', (e) => {
      const target = document.getElementById(a.getAttribute('href')!.slice(1));
      if (!target) return;
      e.preventDefault();
      if (lenis) lenis.scrollTo(target, { duration: 1.4 });
      else target.scrollIntoView({ behavior: 'smooth' });
      history.replaceState(null, '', a.getAttribute('href'));
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    }),
  );

  // the section crossing the middle of the screen is the one you're in
  const mark = (id: string | null) =>
    links.forEach((a) => (a === (id ? byId.get(id) : null) ? a.setAttribute('aria-current', 'location') : a.removeAttribute('aria-current')));
  const visible = new Set<string>();
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => (e.isIntersecting ? visible.add(e.target.id) : visible.delete(e.target.id)));
      // the last in page order wins when two overlap the band
      mark([...byId.keys()].filter((id) => visible.has(id)).pop() ?? null);
    },
    { rootMargin: '-45% 0px -50% 0px' },
  );
  byId.forEach((_, id) => {
    const el = document.getElementById(id);
    if (el) io.observe(el);
  });
}
