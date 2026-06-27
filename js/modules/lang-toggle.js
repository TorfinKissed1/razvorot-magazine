/* lang-toggle.js — RU/EN language switch for Разворот.

   Swaps textContent of every element carrying BOTH data-ru and data-en
   to the active language. Default rendered text = RU. Also:
     - sets <html lang>;
     - updates document.title (data-title-ru / data-title-en on <html>
       if present, else a <title data-ru data-en>);
     - swaps placeholders for inputs/textarea and alt-text for images;
     - reflects state on [data-lang-toggle] buttons (.is-active on the
       РУ/EN option spans, aria-pressed, data-lang).

   Elements are queried at runtime — the translatable set differs per page.
   Persists the choice to localStorage('razvorot-lang'). */

const KEY = 'razvorot-lang';
const DEFAULT_LANG = 'ru';

function readInitial() {
  let stored = null;
  try { stored = localStorage.getItem(KEY); } catch (_) {}
  return stored === 'en' ? 'en' : DEFAULT_LANG;
}

function persist(lang) {
  try { localStorage.setItem(KEY, lang); } catch (_) {}
}

function apply(lang) {
  const isEn = lang === 'en';
  const root = document.documentElement;

  /* Bilingual text / placeholder swap. Skip <title>/<meta>: their value
     is handled below (title) or lives in an attribute (meta), and they
     carry no visible textContent worth clobbering. */
  document.querySelectorAll('[data-ru][data-en]').forEach((el) => {
    const val = isEn ? el.dataset.en : el.dataset.ru;
    if (val == null) return;

    const tag = el.tagName;
    if (tag === 'TITLE' || tag === 'META') return;

    if ((tag === 'INPUT' || tag === 'TEXTAREA') && el.hasAttribute('placeholder')) {
      el.setAttribute('placeholder', val);
    } else {
      el.textContent = val;
    }
  });

  /* Bilingual image alt-text. */
  document.querySelectorAll('[data-alt-ru][data-alt-en]').forEach((el) => {
    const val = isEn ? el.dataset.altEn : el.dataset.altRu;
    if (val != null) el.setAttribute('alt', val);
  });

  /* <html lang>. */
  root.setAttribute('lang', isEn ? 'en' : 'ru');

  /* document.title — prefer data-title-* on <html>, else a bilingual <title>. */
  const htmlTitle = isEn ? root.dataset.titleEn : root.dataset.titleRu;
  if (htmlTitle != null) {
    document.title = htmlTitle;
  } else {
    const titleEl = document.querySelector('title[data-ru][data-en]');
    if (titleEl) document.title = isEn ? titleEl.dataset.en : titleEl.dataset.ru;
  }

  /* Reflect state on every toggle button. */
  document.querySelectorAll('[data-lang-toggle]').forEach((btn) => {
    btn.setAttribute('aria-pressed', String(isEn));
    btn.dataset.lang = lang;

    const ru = btn.querySelector('.lang-toggle__ru');
    const en = btn.querySelector('.lang-toggle__en');
    if (ru) ru.classList.toggle('is-active', !isEn);
    if (en) en.classList.toggle('is-active', isEn);
  });
}

export function initLangToggle() {
  apply(readInitial());

  document.querySelectorAll('[data-lang-toggle]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const cur = root_lang() === 'en' ? 'en' : 'ru';
      const next = cur === 'en' ? 'ru' : 'en';
      apply(next);
      persist(next);
    });
  });
}

function root_lang() {
  return document.documentElement.getAttribute('lang');
}

export default initLangToggle;
