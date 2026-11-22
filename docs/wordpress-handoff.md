# WordPress handoff

The concept is static HTML/CSS/JS meant to become a theme (or child theme) template.
Nothing has been deployed and the live site is untouched.

## Enqueue
- CSS in this order: tokens, base, layout, components, sections, motion (`wp_enqueue_style` with dependencies).
- JS: all files are independent, dependency-free, `defer`. Enqueue in the footer.
- Fonts: copy `assets/fonts/`; add `<link rel="preload" as="font" type="font/woff2" crossorigin>` for the two Hebrew files.
- Icons: print the `<svg>` sprite once after `<body>` (e.g. `get_template_part('parts/icon-sprite')`). Regenerate with `python3 tools/icons.py`.
- Keep the inline `<script>document.documentElement.classList.add('js')</script>` in `<head>`.

## Dynamic parts
| Area | WordPress source |
|---|---|
| Header nav + dropdowns | `wp_nav_menu` (primary). Walker must output `.has-sub`, a `.primary-nav__toggle` button and `.subnav` |
| Mobile menu / footer columns | same menu, or the existing side menu |
| Hero, intro, tiles, treatment accordion | ACF fields or the existing page content (text must stay identical) |
| Testimonials | existing testimonials source |
| Contact form | **Gravity Forms #2** (existing). Keep its fields, consent, honeypot and CleanTalk. Style its markup with the `.field`, `.field__input`, `.checkbox`, `.btn` classes, or map GF classes to them. Remove `assets/js/form.js` once GF handles validation |
| Facebook | concept shows a link card; the old Page Plugin iframe can be restored inside `.fb-card` if wanted |
| Cookie notice | existing Elementor popup (replace the yellow marker with the real text); `ui.js` cookie part can be dropped |
| Accessibility | keep the existing **enable.co.il** widget script |
| SEO | keep the current SEO plugin output; the `<head>` here mirrors it |

## New features (need approval before launch)
- WhatsApp: hero button, floating button after the hero (≥960px), mobile action bar (call / WhatsApp / contact). WhatsApp uses `https://wa.me/972526623666`: confirm the number is on WhatsApp.

## Images
- Portrait cutout: `sivan-navot-portrait-cutout.webp/png` (595×890). Produced with an AI background removal; a studio-cut PNG at 2× would be even sharper.
- Logo: only a 235×93 PNG exists online. Ask for the original SVG/AI/PDF.

## Round 2 notes
- **Hero art** is one inline SVG (`.hero__art`): ring + portrait (`<image>` of the cutout webp, clipped) + dandelions. Keep it inline (it uses clipPaths and CSS animation). Replace the image href with the media-library URL. Alt text = the SVG `<title>`.
- **Accordion** (`assets/js/accordion.js`): buttons with `aria-expanded`/`aria-controls`, panels are `role="region"`. Panels are open when JS is off. The excerpt text and URLs are the same as the old cards.
- **Header** is a floating white capsule; `--header-h` (88px) reserves its space.
- **Parallax** helper in `ui.js` (`[data-parallax]`) only moves decorative layers.
- Quick-link section "טיפולים" was removed from the homepage at the owner's request.
