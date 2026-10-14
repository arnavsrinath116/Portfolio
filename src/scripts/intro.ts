import { gsap } from 'gsap';


/**
 * Plotter sweep: an accent-blue carriage crosses the sheet and everything behind it
 * is revealed. Runs once per session; the inline head script decides whether
 * it is pending and guarantees content is never hidden for long.
 */
export function playIntro(): Promise<void> {
  const html = document.documentElement;
  if (!html.classList.contains('intro-pending')) return Promise.resolve();
  try {
    sessionStorage.setItem('as-intro', '1');
  } catch {}

  const els = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));
  const plotter = document.querySelector<HTMLElement>('[data-plotter]');
  const readout = document.querySelector<HTMLElement>('[data-plotter-readout]');
  if (!plotter || !readout) {
    html.classList.remove('intro-pending');
    return Promise.resolve();
  }

  // Take over from the CSS gate with inline clips we can drive per frame.
  const boxes = els.map((el) => el.getBoundingClientRect());
  els.forEach((el) => (el.style.clipPath = 'inset(0 100% 0 0)'));
  plotter.style.display = 'block';
  html.classList.remove('intro-pending');

  const vw = window.innerWidth;
  const state = { p: 0 };

  return new Promise((resolve) => {
    gsap.to(state, {
      p: 1,
      duration: 1.15,
      ease: 'power2.inOut',
      onUpdate() {
        const x = state.p * vw;
        plotter.style.transform = `translateX(${x}px)`;
        readout.textContent = `X ${String(Math.round(x)).padStart(4, '0')} px`;
        els.forEach((el, i) => {
          const r = boxes[i];
          const cut = Math.max(0, Math.min(r.width, r.right - x));
          el.style.clipPath = `inset(0 ${cut}px 0 0)`;
        });
      },
      onComplete() {
        els.forEach((el) => (el.style.clipPath = ''));
        gsap.to(plotter, {
          opacity: 0,
          duration: 0.35,
          ease: 'power1.out',
          onComplete: () => {
            plotter.style.display = 'none';
          },
        });
        resolve();
      },
    });
  });
}
