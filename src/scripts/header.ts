/** Header slides away while reading down, returns the moment you scroll up. */
export function initHeader() {
  const header = document.querySelector<HTMLElement>('[data-header]');
  if (!header) return;
  let last = 0;

  const update = (y: number) => {
    const delta = y - last;
    if (Math.abs(delta) < 4) return;
    const hide = delta > 0 && y > 140;
    header.classList.toggle('is-hidden', hide);
    last = y;
  };


  // Native scroll fires for wheel, touch, keys, anchors and Lenis alike.
  window.addEventListener('scroll', () => update(window.scrollY), { passive: true });

  // Keyboard users must never lose the header.
  header.addEventListener('focusin', () => header.classList.remove('is-hidden'));
}
