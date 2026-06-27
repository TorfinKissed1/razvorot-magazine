/**
 * nav.js — burger toggle + sticky header
 *
 * Hooks (index.html):
 *   [data-nav-toggle]   burger <button aria-expanded aria-controls="nav-panel">
 *   [data-nav-panel]    mobile panel <div id="nav-panel" data-open="false">
 *   .site-header        receives .is-sticky when scrolled past its own height
 *
 * Accessibility:
 *   - aria-expanded mirrors open/closed state on the burger button
 *   - data-open drives CSS visibility (no inline display toggling)
 *   - Focus trap: Tab / Shift+Tab cycle within the open panel
 *   - Escape closes the panel and returns focus to the burger
 *   - Panel links close the panel on activation
 *   - pointerdown (not click) for outside-dismiss avoids swallowed click events
 *   - body[data-nav-open] lets CSS lock scroll without JS style mutation
 */

export function initNav() {
  markCurrentRubric();

  const header = document.querySelector('.site-header');
  const burger = document.querySelector('[data-nav-toggle]');
  const panel  = document.querySelector('[data-nav-panel]');

  if (!burger || !panel) return;

  // ── Sticky header ─────────────────────────────────────────────────────────

  if (header) {
    let headerHeight = header.offsetHeight;
    let rafId        = null;
    let lastY        = -1;

    // Re-measure when header resizes (fonts, layout shifts)
    if (typeof ResizeObserver !== 'undefined') {
      new ResizeObserver(() => { headerHeight = header.offsetHeight; }).observe(header);
    }

    const onScroll = () => {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        const y = window.scrollY;
        if (y === lastY) return;
        lastY = y;
        header.classList.toggle('is-sticky', y > headerHeight);
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // handle back-navigation where page may already be scrolled
  }

  // ── State helpers ─────────────────────────────────────────────────────────

  const isOpen = () => burger.getAttribute('aria-expanded') === 'true';

  const openPanel = () => {
    burger.setAttribute('aria-expanded', 'true');
    panel.setAttribute('data-open', 'true');
    document.body.setAttribute('data-nav-open', 'true');
    const focusable = getFocusable();
    if (focusable.length) focusable[0].focus();
  };

  const closePanel = (returnFocus = true) => {
    burger.setAttribute('aria-expanded', 'false');
    panel.setAttribute('data-open', 'false');
    document.body.removeAttribute('data-nav-open');
    if (returnFocus) burger.focus();
  };

  // ── Focus trap ────────────────────────────────────────────────────────────

  function getFocusable() {
    return Array.from(
      panel.querySelectorAll(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    ).filter(el => el.offsetParent !== null); // exclude hidden elements
  }

  const trapFocus = (e) => {
    if (!isOpen() || e.key !== 'Tab') return;
    const focusable = getFocusable();
    if (!focusable.length) return;
    const first = focusable[0];
    const last  = focusable[focusable.length - 1];
    if (e.shiftKey) {
      if (document.activeElement === first) { e.preventDefault(); last.focus(); }
    } else {
      if (document.activeElement === last)  { e.preventDefault(); first.focus(); }
    }
  };

  // ── Event wiring ──────────────────────────────────────────────────────────

  burger.addEventListener('click', () => { isOpen() ? closePanel() : openPanel(); });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen()) closePanel();
    trapFocus(e);
  });

  // Close when a nav link inside the panel is activated
  panel.addEventListener('click', (e) => {
    if (e.target.closest('a')) closePanel(false);
  });

  // Outside-click dismiss (pointerdown fires before click, avoids event-order issues)
  document.addEventListener('pointerdown', (e) => {
    if (isOpen() && !panel.contains(e.target) && !burger.contains(e.target)) {
      closePanel();
    }
  });

  // Reset to closed state when viewport widens to desktop breakpoint
  window.addEventListener('resize', () => {
    if (window.innerWidth > 860 && isOpen()) closePanel(false);
  }, { passive: true });
}

/**
 * Mark the current rubric in the header nav and filter chips.
 *
 * The active rubric is read from the page's [data-rubric] context block
 * (.rubric-head on rubric.html). Any nav link or filter chip whose own
 * data-rubric matches gets aria-current="page". On pages without a rubric
 * context (index.html, article.html), nothing is marked — so screen readers
 * never announce a rubric link as the current page when it isn't.
 */
function markCurrentRubric() {
  const context = document.querySelector('.rubric-head[data-rubric]');
  if (!context) return;

  const current = context.dataset.rubric;
  document
    .querySelectorAll(`.site-nav__link[data-rubric="${current}"], .rubric-chip[data-rubric="${current}"]`)
    .forEach((el) => el.setAttribute('aria-current', 'page'));
}
