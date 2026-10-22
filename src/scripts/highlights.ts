/**
 * Block highlights on the major headings (.hl-block): each starts empty and the
 * accent wipes in behind its word the first time the heading comes into view.
 */
export function initHighlights({ reduce }: { reduce: boolean }) {
  if (reduce) return;
  // in a heading that comes in word by word, wordReveal.ts lands the block with the words
  const els = document.querySelectorAll<HTMLElement>('.hl-block');
  const io = new IntersectionObserver(
    (entries) =>
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      }),
    { threshold: 0.8 },
  );
  els.forEach((el) => {
    el.classList.add('is-armed');
    if (!el.closest('[data-words]')) io.observe(el);
  });
}
