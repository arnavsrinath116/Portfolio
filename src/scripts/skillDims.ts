import { gsap } from 'gsap';
import { hDim, vDim, NS } from './dimension';

/**
 * Each skill sheet is dimensioned like a drawing: every sheet has its own one or
 * two dimensions, in its own places (the lettering of the title, the drawing's
 * box, the summary, the stage, the works list…), fixed per skill. They're
 * measured in px from the page as it is and drawn in as they come into view.
 */
const OFF = 20; // object to dimension line
type Box = { l: number; r: number; t: number; b: number };
type Pick = { sel: string; side: 'w-top' | 'w-bottom' | 'h-left' | 'h-right'; text?: boolean };

const SPOTS = {
  'title-w': { sel: '.sk-title', side: 'w-top', text: true },
  'view-h': { sel: '.sk-view', side: 'h-left' },
  'view-w': { sel: '.sk-view', side: 'w-bottom' },
  'summary-w': { sel: '.sk-summary', side: 'w-bottom', text: true },
  'tb-h': { sel: '.sk-tb', side: 'h-left' },
  'stage-w': { sel: '.sk-stage:not([hidden])', side: 'w-top' },
  'list-h': { sel: '.sk-list ol', side: 'h-right' },
} satisfies Record<string, Pick>;
type Spot = keyof typeof SPOTS;

// where each sheet is dimensioned: different on every sheet, the same every time it opens.
// Phones get their own set: no margin there for vertical dimensions, and the drawing box
// sits right above the title with no room between them for a line
const SHEETS: Record<string, { desk: Spot[]; phone: Spot[] }> = {
  '3d-modeling': { desk: ['title-w', 'list-h'], phone: ['stage-w'] },
  'ui-design': { desk: ['view-h', 'stage-w'], phone: ['summary-w'] },
  'graphic-design': { desk: ['summary-w'], phone: ['summary-w', 'stage-w'] },
  'product-sketching': { desk: ['title-w', 'view-h'], phone: ['summary-w'] },
  sketching: { desk: ['list-h', 'summary-w'], phone: ['stage-w'] },
  photography: { desk: ['view-w', 'tb-h'], phone: ['stage-w'] },
};

export function initSkillDims({ reduce }: { reduce: boolean }) {
  let io: IntersectionObserver | null = null;
  let timer = 0;

  document.addEventListener('pm:shown', (e) => {
    const { slug, scroller } = (e as CustomEvent<{ slug: string; scroller: HTMLElement }>).detail;
    if (!slug.startsWith('skill-')) return;
    const art = document.querySelector<HTMLElement>(`[data-project="${slug}"]`);
    if (!art) return;
    // wait for the sheet's rise-in to settle, so what's measured is where it rests
    clearTimeout(timer);
    timer = window.setTimeout(() => draw(art, scroller), reduce ? 0 : 650);
  });
  document.addEventListener('pm:hidden', () => {
    clearTimeout(timer);
    io?.disconnect();
  });

  const draw = (art: HTMLElement, scroller: HTMLElement) => {
    let svg = art.querySelector<SVGSVGElement>(':scope > .sk-dims');
    if (!svg) {
      svg = document.createElementNS(NS, 'svg');
      svg.setAttribute('class', 'annotations sk-dims');
      svg.setAttribute('aria-hidden', 'true');
      art.prepend(svg);
    }
    svg.replaceChildren();
    const a = art.getBoundingClientRect();
    // sized by CSS to the sheet itself: measuring scrollHeight would count this svg too, so it could
    // only ever grow, and hold the card's scroll open past its end
    const narrow = a.width < 700;

    const sheet = SHEETS[art.dataset.project!.replace('skill-', '')];
    if (!sheet) return;
    const picks: Pick[] = (narrow ? sheet.phone : sheet.desk).map((k) => SPOTS[k]).filter((p) => art.querySelector(p.sel));

    // the same element can carry two dimensions (the drawing's width and height)
    const tls = new Map<Element, gsap.core.Timeline[]>();
    io?.disconnect();
    io = new IntersectionObserver(
      (entries) =>
        entries.forEach((en) => {
          if (!en.isIntersecting) return;
          tls.get(en.target)?.forEach((t, i) => gsap.delayedCall(i * 0.35, () => void t.timeScale(0.3).play(0)));
          io!.unobserve(en.target);
        }),
      { root: scroller, threshold: 0.6 },
    );

    for (const p of picks) {
      const el = art.querySelector<HTMLElement>(p.sel)!;
      let r = el.getBoundingClientRect();
      if (p.text) {
        // the lettering's own extent, not its box
        const range = document.createRange();
        range.selectNodeContents(el);
        const rects = Array.from(range.getClientRects());
        if (rects.length) {
          const l = Math.min(...rects.map((q) => q.left));
          const rr = Math.max(...rects.map((q) => q.right));
          r = new DOMRect(l, r.top, rr - l, r.height);
        }
      }
      const b: Box = { l: r.left - a.left, r: r.right - a.left, t: r.top - a.top, b: r.bottom - a.top };
      const tl = gsap.timeline({ paused: true, defaults: { ease: 'none' } });
      if (p.side === 'w-top') hDim(svg, tl, 0, b.l, b.r, b.t, b.t - OFF, 'W ', b.r - b.l);
      else if (p.side === 'w-bottom') hDim(svg, tl, 0, b.l, b.r, b.b, b.b + OFF, 'W ', b.r - b.l, true);
      else if (p.side === 'h-left') vDim(svg, tl, 0, b.l - OFF, b.l, b.t, b.b, 'H ', b.b - b.t);
      else vDim(svg, tl, 0, b.r + OFF, b.r, b.t, b.b, 'H ', b.b - b.t);
      if (reduce) {
        tl.progress(1);
        continue;
      }
      tl.progress(0);
      tls.set(el, [...(tls.get(el) ?? []), tl]);
      io.observe(el);
    }
  };
}
