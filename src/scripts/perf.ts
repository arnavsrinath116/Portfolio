/**
 * Lite mode: weaker devices get the same site with the always-on extras switched off (dust,
 * the mercury cursor, smooth scrolling), 3D drawn at a lower pixel ratio, a lighter hero jet,
 * and solid panels instead of live glass blur. Strong devices see no difference.
 *
 * A device counts as weak with 4 or fewer CPU cores, 4 GB of memory or less (where the browser
 * says), data saver on, or reduced motion asked for. `?lite` / `?full` in the URL force it
 * either way, for testing; the choice sticks for the visit.
 */
type Nav = Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };

const pick = (): boolean => {
  const q = new URLSearchParams(location.search);
  try {
    if (q.has('lite')) sessionStorage.setItem('perf', 'lite');
    if (q.has('full')) sessionStorage.setItem('perf', 'full');
    const forced = sessionStorage.getItem('perf');
    if (forced) return forced === 'lite';
  } catch {
    /* storage blocked: decide from the device */
  }
  const n = navigator as Nav;
  return (
    (n.hardwareConcurrency ?? 8) <= 4 ||
    (n.deviceMemory ?? 8) <= 4 ||
    n.connection?.saveData === true ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
};

export const lite = pick();
document.documentElement.classList.toggle('is-lite', lite);

/** the most pixels per CSS pixel a WebGL scene draws: sharp on strong devices, lighter on weak */
export const maxDpr = (strong = 2) => Math.min(devicePixelRatio, lite ? 1.25 : strong);
