/**
 * Block highlights on the major headings (.hl-block): each starts empty and the
 * orange wipes in behind its word the first time the heading comes into view.
 */
export function initHighlights({ reduce }: { reduce: boolean }) {
  if (reduce) return;
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
    io.observe(el);
  });
}
