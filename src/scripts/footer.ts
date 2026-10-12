import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const NS = 'http://www.w3.org/2000/svg';

/**
 * The footer name is lettered like a drafter would: guide lines first,
 * construction points per letter, then the outlines are inked, scrubbed
 * by the last stretch of scroll.
 */
export function initFooter({ reduce }: { reduce: boolean }) {
  const wrap = document.querySelector<HTMLElement>('[data-wordmark-wrap]');
  const svg = document.querySelector<SVGSVGElement>('[data-wordmark]');
  const text = document.querySelector<SVGTextElement>('[data-wm-text]');
  const guides = document.querySelector<SVGGElement>('[data-wm-guides]');
  const points = document.querySelector<SVGGElement>('[data-wm-points]');
  if (!wrap || !svg || !text || !guides || !points) return;

  // Fit the lettering to the full sheet width at its natural spacing (no
  // squeezing), then size the viewBox to the cap height so nothing floats.
  const WIDTH = 1000;
  const MARGIN = 14;
  const fs0 = parseFloat(getComputedStyle(text).fontSize);
  const fs = (fs0 * WIDTH) / text.getComputedTextLength();
  text.style.fontSize = `${fs}px`;
  const c = document.createElement('canvas').getContext('2d')!;
  c.font = `640 ${fs}px "Archivo Variable"`;
  (c as CanvasRenderingContext2D & { fontStretch: string }).fontStretch = 'ultra-expanded';
  const cap = c.measureText('H').actualBoundingBoxAscent || fs * 0.7;
  const baseline = MARGIN + cap;
  const capY = MARGIN;
  text.setAttribute('y', String(baseline));
  svg.setAttribute('viewBox', `0 0 ${WIDTH} ${baseline + MARGIN}`);

  const guideLines = [capY, baseline - cap / 2, baseline].map((y) => {
    const l = document.createElementNS(NS, 'line');
    Object.entries({ x1: -12, x2: 1012, y1: y, y2: y, class: 'guide', pathLength: 1 }).forEach(([k, v]) =>
      l.setAttribute(k, String(v)),
    );
    guides.appendChild(l);
    return l;
  });

  // a construction point at each letter's left baseline and right cap corner
  const marks: SVGPathElement[] = [];
  const s = 5;
  const n = text.getNumberOfChars();
  for (let i = 0; i < n; i++) {
    if (!text.textContent?.[i]?.trim()) continue;
    const ext = text.getExtentOfChar(i);
    for (const [x, y] of [
      [ext.x, baseline],
      [ext.x + ext.width, capY],
    ]) {
      const p = document.createElementNS(NS, 'path');
      p.setAttribute('d', `M${x - s},${y}H${x + s}M${x},${y - s}V${y + s}`);
      p.setAttribute('class', 'cpoint');
      points.appendChild(p);
      marks.push(p);
    }
  }

  const DASH = 1400;
  text.style.strokeDasharray = String(DASH);
  guideLines.forEach((l) => (l.style.strokeDasharray = '1'));

  const tl = gsap.timeline({ paused: true, defaults: { ease: 'none' } });
  tl.fromTo(guideLines, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.25, stagger: 0.05 }, 0)
    .fromTo(marks, { opacity: 0, scale: 0, transformOrigin: '50% 50%' }, { opacity: 1, scale: 1, duration: 0.05, stagger: 0.012 }, 0.12)
    .fromTo(text, { strokeDashoffset: DASH }, { strokeDashoffset: 0, duration: 0.6 }, 0.28)
    .to(marks, { opacity: 0.35, duration: 0.15 }, 0.85)
    .fromTo(text, { fillOpacity: 0 }, { fill: 'var(--sand)', fillOpacity: 0.05, duration: 0.15 }, 0.85);

  if (reduce) {
    tl.progress(1);
    return;
  }
  ScrollTrigger.create({
    trigger: wrap,
    start: 'top 92%',
    end: 'bottom bottom',
    scrub: 0.6,
    animation: tl,
  });
}
