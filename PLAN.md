# «Разворот» — Build Plan

Modern city/culture broadsheet magazine. Multipage, editorial, kinetic, premium.
Wide layout (`--container` 1280px), broken editorial grid, OKLCH theme tokens,
bilingual RU/EN, smooth clip-wipe reveals, real local editorial photography.

---

## Status

### Done (foundation — by lead architect)
- `css/settings.css` — OKLCH semantic tokens. `:root` = LIGHT (newsprint cream),
  `html[data-theme="dark"]` = DARK (deep, not flat black). Per-rubric accents
  (`--accent-city/culture/people/food`), fonts (Unbounded/Spectral/Onest),
  `--container` 1280px, `--pad-x`, `--section-gap`, `--ease`, reveal vars.
  `[data-rubric="…"]` resolves `--accent`. **No hardcoded colors anywhere else.**
- `css/base.css` — reset; `html{overflow-x:clip}` + `body{overflow-x:hidden}`;
  theme-driven body; base type; `.container/.u-wrap/.u-bleed`; **reveal contract
  declared ONCE** (`[data-reveal]`, `[data-reveal-head]` clip-wipe, reduced-motion
  shows all); scroll-progress bar; skip-link; focus-visible.
- `js/modules/reveal.js` — copied VERBATIM from advokat-praktika (IO threshold 0
  + rAF scroll-sweep). **Do not edit.**
- `js/modules/theme-toggle.js` — flips `html[data-theme]`, persists localStorage,
  syncs aria-pressed + sun/moon. Init theme set inline in `<head>` (no FOUC).
- `js/modules/lang-toggle.js` — swaps `textContent` (and `placeholder`/`alt`) of
  every element with BOTH `data-ru` + `data-en`; sets `html lang`, `document.title`
  (via `<title data-ru data-en>`), persists. Default RU.
- `js/modules/nav.js` — mobile burger panel (aria-expanded, Esc, outside-click).
- `js/modules/scroll-progress.js` — rAF-throttled top bar width.
- `js/modules/masthead.js` — smooth staggered clip-wipe of masthead lines (reuses
  reveal contract, no per-letter jump).
- `js/main.js` — shared ES-module entry; imports all modules in safe order.
- `css/blocks/header.css`, `masthead.css`, `lenta.css`, `newsletter.css`, `footer.css`.
- `index.html` — HOME. Shared header + footer, kinetic masthead, broken-grid lenta
  (1 hero feature + 2 wide + 6 standard cards), per-rubric colored kickers,
  newsletter with SVG-check success. All text bilingual, default RU. Local `<img>`
  with width/height + lazy + bilingual alt.

### To build (next agents — READ index.html first; reuse header/footer VERBATIM)
- **article.html** — full-bleed cover (`img/article-cover.jpg`), kinetic title
  (clip-wipe), rubric kicker (`data-rubric="people"`), author/date meta, long-form
  Spectral reading column (~68ch) using `feature.body_ru` / `feature.body_en`
  (6 paragraphs each — "Последний смотритель"), a floating pull-quote OUTSIDE the
  column, inline image, related-articles strip (reuse `.card`), scroll-progress bar.
  New block: `css/blocks/article.css`. Add `<link>` for it.
- **rubric.html** — rubric header with its color identity (`data-rubric="city"`
  default), filter row of rubrics (reuse nav rubric links styled as chips), editorial
  grid of that rubric's articles (reuse `.lenta` / `.card`). New block:
  `css/blocks/rubric.css`.

---

## Contracts (every builder MUST obey)

1. **Header + footer are identical across pages.** Copy the `<header class="site-header">…`
   and `<footer class="site-footer">…` blocks from `index.html` verbatim, including both
   toggle clusters. They wire up automatically via `js/main.js`.
2. **Tokens only.** Never hardcode a color. Use `var(--…)`. Per-rubric accent via
   `data-rubric` on the scope element → `--accent` resolves.
3. **Bilingual.** Every translatable text node carries `data-ru` + `data-en`, default
   text = RU. Images use `data-alt-ru` + `data-alt-en`. Page `<title>` carries both.
4. **Reveal.** Use `data-reveal` (rise) / `data-reveal-head` (clip-wipe). Blocks ONLY
   toggle `.is-revealed` — never restyle the contract. Optional stagger via
   inline `style="--d:120ms"`.
5. **No 390px overflow.** Don't introduce fixed widths > viewport. Mobile grid
   overrides MUST reuse the SAME `.card` / nth-child selectors as desktop.
6. **Scripts:** every page ends with the page-local snippet(s) it needs, then
   `<script type="module" src="js/main.js"></script>`.
7. **Fonts + favicon + theme-before-paint `<head>` script** identical to index.html.

---

## Assets (verified present in `img/`)
hero-feature.jpg, city-1.jpg, city-2.jpg, culture-1.jpg, culture-2.jpg,
people-1.jpg, people-2.jpg, food-1.jpg, food-2.jpg, article-cover.jpg

## Rubric → accent map
city = lime/green · culture = coral · people = blue · food = amber
(accents on tags/rules/kickers only — never body text; AA in both themes)
