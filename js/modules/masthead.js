/* masthead.js — kinetic masthead. Reuses the clip-wipe reveal contract
   (no per-letter jump). Reveals [data-reveal-head] elements in the
   masthead on load with a smooth, staggered sweep. The reveal module
   already handles IO; this guarantees the masthead fires promptly on
   first paint even above the fold, and resolves the rubric kicker color. */

export function initMasthead() {
  const heads = document.querySelectorAll('[data-masthead] [data-reveal-head]');
  if (!heads.length) return;

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) {
    heads.forEach((el) => el.classList.add('is-revealed'));
    return;
  }

  /* Stagger the wipe on the next frame so the page has painted first. */
  requestAnimationFrame(() => {
    heads.forEach((el, i) => {
      const delay = i * 120;
      window.setTimeout(() => el.classList.add('is-revealed'), delay);
    });
  });
}
