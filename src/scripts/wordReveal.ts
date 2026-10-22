import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/**
 * Headings come into focus a word at a time. Each word starts faint, a few px blurred
 * and a touch low, and sharpens into place as it reaches you.
 *
 *   data-words           on the page: tied to the scroll, so scrolling back reverses it
 *   data-words="load"    at the top of a page: played once as it loads
 *   data-words="open"    in a card: played once each time its card opens (pm:shown)
 *
 * A heading's accent block (.hl-block) wipes in as its words land, not before. On the page it
 * follows the scroll too: it fills as the words sharpen and empties again as you scroll back.
 */
const FROM = { opacity: 0.14, filter: 'blur(6px)', yPercent: 22 };
const TO = { opacity: 1, filter: 'blur(0px)', yPercent: 0 };

// wrap each word in a span, keeping any spans the heading already has (accents, highlights)
function split(el: HTMLElement) {
  if (el.dataset.wordsSplit) return Array.from(el.querySelectorAll<HTMLElement>('.w'));
  el.dataset.wordsSplit = '';
  const walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  const texts: Text[] = [];
  while (walk.nextNode()) texts.push(walk.currentNode as Text);
  for (const t of texts) {
    const parts = t.data.split(/(\s+)/);
    if (parts.every((p) => !p.trim())) continue;
    const frag = document.createDocumentFragment();
    for (const p of parts) {
      if (!p) continue;
      if (!p.trim()) {
        frag.append(p);
        continue;
      }
      const w = document.createElement('span');
      w.className = 'w';
      w.textContent = p;
      frag.append(w);
    }
    t.replaceWith(frag);
  }
  return Array.from(el.querySelectorAll<HTMLElement>('.w'));
}

const land = (el: HTMLElement) => el.querySelectorAll('.hl-block').forEach((b) => b.classList.add('is-in'));

export function initWordReveal({ reduce }: { reduce: boolean }) {
  if (reduce) return;

  // on the page: scrubbed by the scroll as the heading rises through the lower part of the screen
  document.querySelectorAll<HTMLElement>('[data-words=""]').forEach((el) => {
    const words = split(el);
    const blocks = Array.from(el.querySelectorAll<HTMLElement>('.hl-block'));
    blocks.forEach((b) => b.classList.add('is-scrub'));
    gsap.fromTo(words, FROM, {
      ...TO,
      ease: 'none',
      stagger: 0.12,
      scrollTrigger: {
        trigger: el,
        // clamped, so a heading near the very end of the page still finishes before the scroll runs out
        start: 'clamp(top 94%)',
        end: 'clamp(top 52%)',
        scrub: true,
        // the block fills over the last stretch of the reveal, and its word turns to the
        // on-accent colour once the block is half across
        onUpdate: (st) => {
          const h = Math.min(1, Math.max(0, (st.progress - 0.55) / 0.4));
          blocks.forEach((b) => {
            b.style.setProperty('--hl', h.toFixed(3));
            b.classList.toggle('is-in', h > 0.5);
          });
        },
      },
    });
  });

  // at the top of a page: already in view, so it plays in once
  document.querySelectorAll<HTMLElement>('[data-words="load"]').forEach((el) => {
    gsap.fromTo(split(el), FROM, { ...TO, duration: 1, ease: 'expo.out', stagger: 0.08, delay: 0.2, onComplete: () => land(el) });
  });

  // in a card: the card's scroller starts at the top, so its title just plays in once
  const cardWords = new Map<HTMLElement, HTMLElement[]>();
  document.querySelectorAll<HTMLElement>('[data-words="open"]').forEach((el) => {
    const words = split(el);
    gsap.set(words, FROM);
    cardWords.set(el, words);
  });
  document.addEventListener('pm:shown', (e) => {
    const { slug } = (e as CustomEvent<{ slug: string }>).detail;
    const art = document.querySelector(`[data-project="${slug}"]`);
    if (!art) return;
    art.querySelectorAll<HTMLElement>('[data-words="open"]').forEach((el) => {
      const words = cardWords.get(el);
      if (!words) return;
      gsap.killTweensOf(words);
      gsap.fromTo(words, FROM, { ...TO, duration: 0.9, ease: 'expo.out', stagger: 0.07, delay: 0.25, onComplete: () => land(el) });
    });
  });
  document.addEventListener('pm:hidden', () => cardWords.forEach((words) => gsap.set(words, FROM)));

  ScrollTrigger.refresh();
}
