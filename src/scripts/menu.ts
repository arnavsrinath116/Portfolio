import { gsap } from 'gsap';
import type Lenis from 'lenis';
import type { Fluid } from './ferrofluid';

/**
 * MENU floods the screen with mercury from the point you clicked; the sheet
 * index is set on the liquid. Esc, the button, or any link closes it again.
 */
export function initMenu({ fluid, lenis, reduce }: { fluid: Fluid | null; lenis: Lenis | null; reduce: boolean }) {
  const btn = document.querySelector<HTMLButtonElement>('[data-menu-toggle]');
  const menu = document.querySelector<HTMLElement>('[data-menu]');
  const label = document.querySelector<HTMLElement>('[data-menu-label]');
  const surface = document.querySelector<HTMLElement>('[data-menu-surface]');
  if (!btn || !menu || !label || !surface) return;
  const html = document.documentElement;
  const rows = Array.from(menu.querySelectorAll<HTMLElement>('[data-menu-row]'));
  let open = false;
  let busy = false;
  let origin = { x: 0, y: 0 };

  const focusables = () =>
    [btn, ...Array.from(menu.querySelectorAll<HTMLElement>('a[href]'))].filter((el) => !el.hasAttribute('disabled'));

  const show = async (x: number, y: number) => {
    if (busy || open) return;
    busy = true;
    open = true;
    origin = { x, y };
    html.classList.add('menu-open');
    menu.hidden = false;
    btn.setAttribute('aria-expanded', 'true');
    label.textContent = 'Close';
    lenis?.stop();

    gsap.set(rows, { opacity: 0, y: 28 });
    if (fluid) {
      fluid.flood(true, x, y);
    } else if (!reduce) {
      gsap.fromTo(
        surface,
        { clipPath: `circle(0px at ${x}px ${y}px)` },
        { clipPath: `circle(150vmax at ${x}px ${y}px)`, duration: 0.8, ease: 'power3.inOut' },
      );
    }
    await gsap.to(rows, {
      opacity: 1,
      y: 0,
      duration: reduce ? 0 : 0.6,
      ease: 'expo.out',
      stagger: 0.06,
      delay: reduce ? 0 : 0.42,
    });
    busy = false;
    menu.querySelector<HTMLElement>('a[href]')?.focus({ preventScroll: true });
  };

  const hide = async (then?: () => void) => {
    if (busy || !open) return;
    busy = true;
    await gsap.to(rows, { opacity: 0, y: -12, duration: reduce ? 0 : 0.22, ease: 'power2.in', stagger: 0.02 });
    if (fluid) await fluid.flood(false, origin.x, origin.y);
    else if (!reduce)
      await gsap.to(surface, {
        clipPath: `circle(0px at ${origin.x}px ${origin.y}px)`,
        duration: 0.55,
        ease: 'power3.in',
      });
    menu.hidden = true;
    html.classList.remove('menu-open');
    btn.setAttribute('aria-expanded', 'false');
    label.textContent = 'Menu';
    lenis?.start();
    open = false;
    busy = false;
    if (then) then();
    else btn.focus({ preventScroll: true });
  };

  btn.addEventListener('click', (e) => {
    const r = btn.getBoundingClientRect();
    const fromPointer = e.detail > 0;
    const x = fromPointer ? e.clientX : r.left + r.width / 2;
    const y = fromPointer ? e.clientY : r.top + r.height / 2;
    if (open) hide();
    else show(x, y);
  });

  menu.querySelectorAll<HTMLAnchorElement>('[data-menu-close]').forEach((a) =>
    a.addEventListener('click', (e) => {
      const href = a.getAttribute('href');
      if (!href?.startsWith('#')) return;
      e.preventDefault();
      hide(() => {
        const target = document.querySelector<HTMLElement>(href);
        if (!target) return;
        if (lenis) lenis.scrollTo(target, { duration: 1.4 });
        else target.scrollIntoView();
        target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
      });
    }),
  );

  document.addEventListener('keydown', (e) => {
    if (!open) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      hide();
    } else if (e.key === 'Tab') {
      const f = focusables();
      const i = f.indexOf(document.activeElement as HTMLElement);
      const next = e.shiftKey ? (i <= 0 ? f.length - 1 : i - 1) : i === f.length - 1 ? 0 : i + 1;
      e.preventDefault();
      f[next]?.focus();
    }
  });

  document.querySelector<HTMLAnchorElement>('[data-to-top]')?.addEventListener('click', (e) => {
    if (!lenis) return;
    e.preventDefault();
    lenis.scrollTo(0, { duration: 1.6 });
  });
}
