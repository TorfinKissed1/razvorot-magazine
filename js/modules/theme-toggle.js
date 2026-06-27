/* theme-toggle.js — sets html[data-theme] on load, wires all [data-theme-toggle] buttons. */

const KEY = 'razvorot-theme';

function resolve() {
  try {
    const stored = localStorage.getItem(KEY);
    if (stored === 'dark' || stored === 'light') return stored;
  } catch (_) {}
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function apply(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  document.querySelectorAll('[data-theme-toggle]').forEach((btn) => {
    const isDark = theme === 'dark';
    btn.setAttribute('aria-pressed', String(isDark));
    const label = isDark
      ? (btn.dataset.labelLight || 'Светлая тема')
      : (btn.dataset.labelDark  || 'Тёмная тема');
    btn.setAttribute('aria-label', label);
    btn.setAttribute('title', label);
  });
}

function current() {
  return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
}

export function initThemeToggle() {
  /* Apply the resolved theme (localStorage → prefers-color-scheme → 'light') */
  apply(resolve());

  /* Wire every [data-theme-toggle] button to flip the theme */
  document.querySelectorAll('[data-theme-toggle]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const next = current() === 'dark' ? 'light' : 'dark';
      apply(next);
      try { localStorage.setItem(KEY, next); } catch (_) {}
    });
  });

  /* Follow OS-level changes only when the user has not set an explicit preference */
  const mq = window.matchMedia('(prefers-color-scheme: dark)');
  if (typeof mq.addEventListener === 'function') {
    mq.addEventListener('change', (e) => {
      let stored = null;
      try { stored = localStorage.getItem(KEY); } catch (_) {}
      if (!stored) apply(e.matches ? 'dark' : 'light');
    });
  }
}
