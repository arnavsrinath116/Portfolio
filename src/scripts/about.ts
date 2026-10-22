/**
 * About: a window that scrolls with the page like any section, open on its first tab. The other
 * tabs are there to choose: clicking one (or the "next" pill, or a progress dash) turns the
 * window to that chapter in place. The address and the dashes follow.
 * On phones and with reduced motion the chapters stack inside the window, and a tab jumps to its own.
 */
export function initAbout({ reduce }: { reduce: boolean }) {
  const sec = document.querySelector<HTMLElement>('[data-about-me]');
  if (!sec) return;
  const tabs = Array.from(sec.querySelectorAll<HTMLButtonElement>('[data-about-tab]'));
  const chaps = Array.from(sec.querySelectorAll<HTMLElement>('[data-about-chap]'));
  const dashes = Array.from(sec.querySelectorAll<HTMLElement>('[data-about-dash]'));
  const url = sec.querySelector<HTMLElement>('[data-about-url]');
  const next = sec.querySelector<HTMLButtonElement>('[data-about-next]');
  const n = chaps.length;
  const names = tabs.map((t) => t.querySelector('.ab-tt')?.textContent?.trim() ?? '');
  const slugs = ['about', 'work-log', 'kit', 'off-the-clock', 'music'];

  let cur = 0;
  const show = (i: number) => {
    if (i === cur) return;
    cur = i;
    chaps.forEach((c, k) => c.classList.toggle('is-on', k === i));
    tabs.forEach((t, k) => {
      t.classList.toggle('is-on', k === i);
      t.setAttribute('aria-selected', String(k === i));
    });
    dashes.forEach((d, k) => d.classList.toggle('is-on', k === i));
    if (url) url.textContent = slugs[i];
    if (next) next.textContent = i < n - 1 ? `Next · ${names[i + 1]} →` : `Back to · ${names[0]} ↺`;
    document.dispatchEvent(new CustomEvent('about:chapter', { detail: i }));
  };

  if (reduce || window.matchMedia('(max-width: 760px)').matches) {
    sec.classList.add('is-flat');
    tabs.forEach((t, i) =>
      t.addEventListener('click', () => {
        show(i);
        chaps[i].scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
      }),
    );
    return;
  }

  tabs.forEach((t, i) => t.addEventListener('click', () => show(i)));
  dashes.forEach((d, i) => d.addEventListener('click', () => show(i)));
  next?.addEventListener('click', () => show((cur + 1) % n));
  // arrow keys move between tabs, as in a tab list
  sec.querySelector('[role="tablist"]')?.addEventListener('keydown', (e) => {
    const k = (e as KeyboardEvent).key;
    if (k !== 'ArrowRight' && k !== 'ArrowLeft') return;
    e.preventDefault();
    const i = (cur + (k === 'ArrowRight' ? 1 : n - 1)) % n;
    show(i);
    tabs[i].focus();
  });
}
