/**
 * scroll-progress.js — thin top progress bar, rAF-throttled
 *
 * Hooks (index.html):
 *   .scroll-progress          wrapper element (aria-hidden="true" in HTML)
 *   [data-scroll-progress]    inner bar whose width is animated
 *
 * The outer wrapper carries aria-hidden="true" in the HTML, so screen readers
 * ignore the visual bar. A separate live region with role="progressbar" is
 * injected for AT consumers who want scroll-position feedback; it is visually
 * hidden and updates infrequently (every ~5 %) to avoid announcement floods.
 *
 * Throttling: one rAF per scroll/resize event burst; a single pending flag
 * prevents redundant frame requests (same pattern as IntersectionObserver
 * debounce but lighter).
 */

export function initScrollProgress() {
  const bar = document.querySelector('[data-scroll-progress]');
  if (!bar) return;

  // ── Accessible live region ────────────────────────────────────────────────
  // Injected once; lives outside the aria-hidden wrapper so AT can reach it.
  const liveRegion = document.createElement('div');
  liveRegion.setAttribute('role', 'progressbar');
  liveRegion.setAttribute('aria-valuemin', '0');
  liveRegion.setAttribute('aria-valuemax', '100');
  liveRegion.setAttribute('aria-valuenow', '0');
  liveRegion.setAttribute('aria-label', 'Прогресс чтения'); // "Reading progress"
  // Visually hidden, but present in the a11y tree
  Object.assign(liveRegion.style, {
    position: 'absolute',
    width:    '1px',
    height:   '1px',
    padding:  '0',
    margin:   '-1px',
    overflow: 'hidden',
    clip:     'rect(0,0,0,0)',
    whiteSpace: 'nowrap',
    border:   '0',
  });
  document.body.insertBefore(liveRegion, document.body.firstChild);

  // ── Throttle state ────────────────────────────────────────────────────────
  let rafId       = null;
  let lastPct     = -1;
  let lastATUpdate = -1; // last pct value sent to the live region

  // ── Core update ───────────────────────────────────────────────────────────
  const update = () => {
    rafId = null;
    const doc = document.documentElement;
    const max = (doc.scrollHeight - doc.clientHeight) || 1;
    const pct = Math.min(100, Math.max(0, Math.round((window.scrollY / max) * 100)));

    if (pct === lastPct) return;
    lastPct = pct;

    // Drive the visual bar with a CSS custom property so CSS can animate it
    // without a forced style recalculation on the element itself each frame.
    // Falls back to direct width assignment for environments without CSS vars.
    bar.style.setProperty('--progress', pct + '%');
    bar.style.width = pct + '%';

    // Update the AT live region only at ~5 % thresholds to avoid floods
    const bucket = Math.floor(pct / 5) * 5;
    if (bucket !== lastATUpdate) {
      lastATUpdate = bucket;
      liveRegion.setAttribute('aria-valuenow', String(pct));
    }
  };

  // ── Throttled scroll / resize handler ────────────────────────────────────
  const schedule = () => {
    if (rafId !== null) return; // already queued
    rafId = requestAnimationFrame(update);
  };

  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule, { passive: true });

  // Run immediately so the bar is correct on page load / back-navigation
  update();
}
