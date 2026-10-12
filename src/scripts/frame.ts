/** Zone letters follow the cursor across; zone numbers track scroll depth. */
export function initFrame() {
  const frame = document.querySelector<HTMLElement>('[data-frame]');
  if (!frame) return;
  const xs = Array.from(frame.querySelectorAll<HTMLElement>('[data-zone-x]'));
  const ys = Array.from(frame.querySelectorAll<HTMLElement>('[data-zone-y]'));
  let ix = -1;
  let iy = -1;

  const setX = (i: number) => {
    if (i === ix) return;
    xs[ix]?.classList.remove('is-active');
    xs[i]?.classList.add('is-active');
    ix = i;
  };
  const setY = (i: number) => {
    if (i === iy) return;
    ys[iy]?.classList.remove('is-active');
    ys[i]?.classList.add('is-active');
    iy = i;
  };

  window.addEventListener(
    'pointermove',
    (e) => {
      const r = frame.getBoundingClientRect();
      const t = (e.clientX - r.left) / r.width;
      setX(Math.min(xs.length - 1, Math.max(0, Math.floor(t * xs.length))));
    },
    { passive: true },
  );

  const onScroll = (y: number) => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const t = max > 0 ? y / max : 0;
    setY(Math.min(ys.length - 1, Math.floor(t * ys.length)));
  };
  window.addEventListener('scroll', () => onScroll(window.scrollY), { passive: true });
  onScroll(window.scrollY);
}
