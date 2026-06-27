/* main.js — shared ES-module entry for every page.
   Order: theme + lang first (no flash of wrong state), then nav,
   scroll-progress, masthead, reveal. */

import { initThemeToggle }   from './modules/theme-toggle.js';
import { initLangToggle }    from './modules/lang-toggle.js';
import { initNav }           from './modules/nav.js';
import { initScrollProgress }from './modules/scroll-progress.js';
import { initMasthead }      from './modules/masthead.js';
import { initReveal }        from './modules/reveal.js';

function boot() {
  initThemeToggle();
  initLangToggle();
  initNav();
  initScrollProgress();
  initMasthead();
  initReveal();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot, { once: true });
} else {
  boot();
}
