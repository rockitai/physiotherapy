# Design system · foundations

All values live in `assets/css/tokens.css`. Visual reference: `design-system.html`.

## Color
- **Brand (kept from the live site):** plum `#5A0954` (old CSS h1–h3, buttons), logo plum `#55004D`, orchid `#AF63A8` (old hero subtitle), green `#7EA403` (sampled from the homepage tiles), grey `#E5E6E7`, white.
- **Extensions:** plum 600–950 for hover/depth, orchid 300–400 + lavender 50–200 for soft surfaces, green 50–200 and 600–700, warm ivory page background, ink 500–900 neutrals.
- **Rules:** plum is the only action color. Green `#7EA403` is decorative (2.7:1 on white); text on green uses green-700 `#587400` (5.4:1). Body text ink-700 on ivory ≈ 11:1; secondary ink-500 ≈ 5.6:1. Section surfaces alternate ivory / white / lavender-50 / plum / green-50 – never two tinted sections in a row.

## Typography
- Display: **IBM Plex Sans Hebrew** (300 / 400 / 500): modern, clean, precise. Large headings use 300 (light) with tight tracking (−0.02 to −0.025em). Body/UI: **Assistant** (variable 300–700). Both self-hosted, Hebrew + Latin subsets, `font-display: swap`.
- Fluid scale (360→1440px): xs 13–14 · sm 15–16 · base 17–19 · lg 19–23 · xl 23–30 · 2xl 30–44 · 3xl 38–62 · display 46–88.
- Headings: weight 400, tracking −0.015em, `text-wrap: balance`. Body: line-height 1.75 (Hebrew needs air), max 62ch.
- Latin runs (phone, email, degrees) are wrapped in `dir="ltr"` so they never flip.

## Space & layout
- 4px base: 4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96 · 128. Section padding fluid 72→144px. Gutter 20→40px.
- Container 1240px. Breakpoints: 600 / 760 / 960 / 1100 (desktop nav) / 1200 / 1440. Mobile-first.
- Signature compositions: asymmetric 7/5 splits, sticky side headings, arch + capsule shapes.

## Radius & elevation
Radius sm 10 · md 18 · lg 28 · xl 44 · pill. Shadows are plum-tinted (`--shadow-1/2/3`), never grey/black.

## Iconography
24×24 grid, 1.5px stroke, round caps/joins, no fills, `currentColor`, 2px optical padding.
In content, an icon sits in a **capsule** (pill outline) – the bullet from the old site turned into a motif.
On hover the capsule fills plum and the icon turns white. Source: `tools/icons.py` → `assets/icons/*.svg` + inline sprite.
Avoid clichés (no crosses, stethoscopes, anatomy). Only use an icon when it helps scanning.

## Illustration
- **One line language:** every illustration is a thin, even line (1.4–1.5px, non-scaling, round caps). Dandelions appear only in the hero.
- **Hero (current):** a soft lavender arch with an offset hairline outline (the first concept's framing). The portrait is clipped to the arch below its spring line, so her head rises past the top. The arch's bottom lines up with the "בריאות. שגרה. שלווה." line. Earlier variants kept for comparison: `index-hero-upright.html` (upright capsule ring) and `index-hero-capsule.html` (capsule on its side).
- **Hero hand-off:** the hero glows fade out with scroll (`--hero-fade`, set in ui.js), the hero's bottom dissolves into white, and the dandelion stems fade out before the section edge.
- **Dandelions (hero):** two large, simplified heads (12 rays, 3-prong tips). Their stems start below the bottom of the hero (clipped by the section) and rise above the photo. Both stand side by side on the outer side, so the portrait sits in the middle between them and the text: one bends over toward the portrait and breathes, the other releases seeds.
- **Category tiles:** minimal continuous-line drawings, two strokes at most (man, woman, pregnancy in profile, open book with א/ת). No dandelions, no halos. Source: `assets/illustrations/line-*.svg`.

## Surfaces
Solid surfaces only (the iOS-style glass effect was tried in round 2 and removed at Aviv's request). The nav is a floating white capsule with a soft plum shadow; buttons are solid plum / white-outline.

## Motion
- Easing: `--ease-out` cubic-bezier(.22,1,.36,1) for entrances, `--ease-in-out` for state changes.
- Durations: 160 (color) · 280 (hover) · 600 (small UI) · `--dur-reveal` 1100 (scroll reveals) · `--dur-enter` 1500 (hero). Stagger 140ms. Slowed in round 2.
- Hero load (~4.5s, unhurried): text rises line by line; the arch opens upward like a curtain and its outline draws itself; Sivan rises into place; the dandelion stems grow up from the bottom of the frame, then the heads open and seeds start drifting.
- Reveal = fade + 32px rise, once. Intro highlights draw in under the key sentence; the quote rule draws in. Hover = ≤ 6px lift, arrow nudges toward reading direction.
- Intro has a very light parallax on the hairline ring watermark (off under reduced motion). Accordion opens with a height + fade transition.
- `prefers-reduced-motion` sets every duration to 0 and stops the loops.

## Components
Buttons (primary / ghost / light; sm 42 / md 48 / lg 56; hover, active, focus, disabled, loading) · arrow link · text link · chip ·
icon button · round button · header with scroll state · dropdown nav · mobile menu dialog · path tile · accordion row · video player ·
quote slide · contact list · Facebook card · form fields (default, hover, focus, error, valid) · checkbox · mobile action bar · cookie card.

## Header on scroll
On desktop, once the page scrolls the logo disappears, the phone button collapses to its icon, and the capsule tightens around the menu.

## Experiment: illustrated hero (index-hero-illustrated.html, 2026-11-19)
- Phylo-inspired layout: centred H1/H2/actions, no portrait, framed by line illustrations. Same text and links as index.html.
- Files: `assets/css/hero-illustrated.css`, `assets/js/hero-illustrated.js` (only loaded by this variant). index.html is unchanged.
- Pieces: pelvis traced from the logo and enlarged, with an added orchid pelvic-floor "hammock" (top right); PFFM fascia net (top left, sage);
  single-line pregnancy figure; meadow along the bottom with dandelions, grass and a drop with ripples; loose seeds drifting.
- Motion (approximated; phylo.bio could not be fetched from the build environment): text blur-in and rise, illustrations blur in and their lines draw,
  slow idle float per piece, dandelion sway, drop and ripples loop, pointer parallax by depth (fine pointers), scroll parallax, fade-out on scroll.
  All disabled under prefers-reduced-motion.

## Round 6 (2026-11-19): main hero is centred, no portrait
- index.html hero: centred H1/H2/actions (from the illustrated experiment), title and hero buttons 25% smaller,
  logo pelvis (enlarged, with pelvic-floor hammock) top on the start side, the two original dandelions bottom on the end side, gradient glows kept.
  Motion: text blur-in, pelvis blur-in + line draw + idle float, pointer/scroll depth parallax (ui.js, `[data-hero-parallax]`).
- On phones the hero buttons keep a 46px tap height (25% of 52 would fall below the 44px minimum).
- Flat UI: buttons have no shadow, lift or light sweep (hover = colour only); the fixed header, its dropdown and the mobile action bar use a hairline border instead of a shadow.
- The arch + portrait hero is kept as index-hero-arch.html.

## Round 7 (2026-11-19): text right, portrait in a turned-U frame
- Pelvis illustration removed from index.html (still in index-hero-illustrated.html).
- Title +15% over round 6 (0.8625 of the original scale), moved up with the buttons; title, motto and buttons aligned right.
- Portrait back: flat lavender-200 panel below the text on the right, rounded on its inner (left) end and running off the right page edge
  (a U frame turned 90°). Entrance: the panel slides open from the edge, then Sivan rises inside. Dandelions stay on the left.

## Round 8 (2026-11-19): Sivan peeks out of the capsule
- Capsule is lower (--cap-h) and runs from the right edge to mid-screen (ui.js widens it only if her shoulders would fall outside).
- The cutout is 1.34x the capsule height, so the top half of her head rises above it. Her face is placed under "האגן"
  (the word is wrapped in `<span data-head-anchor>`, text unchanged; ui.js sets --head-x).
- The hero is one screen tall and the photo sits at its bottom, so the whole capsule is in the first frame.
- Title and hero buttons +10% (0.95 of the original title scale, buttons 46px). Dandelions zoomed in (44vw, anchored under the header).
- The cutout's straight-cropped right side fades into the capsule (CSS mask).

## Round 9 (2026-11-19): Sivan comes out of a capsule from the left
- New image `sivan-navot-portrait-cutout-full.webp/png` (691×890): the cutout's straight-cropped right shoulder was completed
  (sweater tone extended with a natural shoulder curve). Replace with a studio cutout when one exists.
- Slim lavender capsule enters from the left page edge; Sivan stands at its rounded end, clipped to it below its top edge
  (two copies of the image: one inside the capsule, one clipped to what rises above it). Face under "האגן"; ui.js sizes the capsule.
- Whole capsule fits in the first screen (--img-h uses min(34vw, 46svh)).
- Dandelions split: the larger one on the left below the menu; the small one (with seeds) on the right, its head under "צור קשר" (ui.js).
- Header: no frame or background at the top; when scrolled, a warm beige translucent capsule (rgba of --beige-100, backdrop blur) with a soft shadow.
- Hero phone + WhatsApp buttons: no outline, light mint-sage fill (--mint-100, hover --mint-200).

## Round 10 (2026-11-19): floating capsule
- The capsule is a free-floating pill (half the round-9 length), Sivan + capsule 10% smaller and raised; Sivan still comes out of its rounded right end.
  ui.js centres it between the word "האגן" and the large dandelion's head.
- Large dandelion slightly bigger; its full stem now shows and fades out above the hero bottom (CSS mask in px).
- Small dandelion bigger (closer to its head); stem base moved right and bowed to the left.
- Hero phone/WhatsApp fill: --sage-100 (#e5eadb), a 15% tint of --green-700 (the floating WhatsApp button); hover --sage-200. Gap between hero buttons 14px.
- All buttons: soft hover. Colour eases over 0.6s and the button floats up 3px (0.7s, gentle curve). No shadow.

## Round 11 (2026-11-19): capsule = the logo's "ס"
- Capsule proportions taken from the logo's "ס" (about 2.4 : 1): --cap-h = 0.5 x --img-h, width = 1.2 x --img-h. Raised with the photo.
- Title + buttons a little lower; the right dandelions follow the CTA (ui.js).
- Right dandelion zoomed in, slightly right, stem bowed round to the left; a second small whole dandelion beside it (kept on screen by ui.js).
- Hero phone/WhatsApp sage strengthened: --sage-100 #dee3cc (20% tint of --green-700), hover --sage-200 #cdd5b3.

## Round 12 (2026-11-19): text inside the capsule
- Capsule extended to the left (--text-w = 1.05 x --img-h) and holds NEW copy supplied by Aviv, grey (--ink-500), right-aligned next to Sivan:
  "פיזיותרפיסטית (B.P.T., M.Sc.PT) מומחית בשיקום רצפת האגן, חוקרת ומפתחת שיטת PFFM, Pelvic Floor Fascial Mobilization."
  On phones the capsule is too short for it, so it sits as a caption just under the capsule.
- Capsule, caption and Sivan enter together in one soft blur-in (the separate capsule-open / photo-rise animations were removed).
- Right dandelions: more space between them, the left one higher, the small one further right. Seeds fade out before they reach the buttons
  (CSS mask; ui.js sets --fade-top).

## Round 13 (2026-11-19)
- Hero: Sivan -10% (--img-h); capsule text broken into three lines (after "האגן," and after "PFFM,"); the capsule's text part is sized by ui.js to the
  longest line (shorter on the left) and the capsule never reaches the left dandelion's stem.
- Section 2: video 15% smaller (.intro__media width 85%); the offset grey block behind it is now a lavender capsule.
- Section 3: four tall light-lavender capsules (aspect 5:7, radius 999px) with line icons recreated from Aviv's set (man, woman with bun,
  pregnant profile, open book). Hover: capsule turns sage green, floats up and grows 3%, icon and label turn green (0.7–0.8s soft easing).
- Section 5: the full-bleed plum band is gone; the testimonials sit in one big light-lavender capsule (48px radius on phones). Text recoloured for a light ground.

## Round 15 (2026-11-19)
- Hero caption: 16px more air between the text and Sivan.
- Intro: ui.js scales the pull quote so the top of its first line and the baseline of its last line meet the video frame's top and bottom edges (desktop, from 1024px).
- Treatments: a dandelion enters from the screen's right edge and arches up under the title; it draws, opens and sways like the hero's left one, started on scroll (desktop columns only).
- Path icons: man's head 16% wider, woman's 12% wider. Glossary button in two lines ("מילון" above).
- Testimonials: big frame removed; each review is a light-lavender capsule; the title sits in the same 4 : 7 column as "טיפולים נוספים".
- Contact section background: --sage-100 (the hero buttons' light sage).

## Round 16 (2026-11-19)
- Phones, hero: the capsule spans the width and holds the caption beside a smaller Sivan (50vw); the left dandelion's head floats just under the buttons (ui.js); the seeded dandelion peeks out from under the capsule; the small twin is hidden.
- Phones, header: no phone icon (dialling stays in the hero and the action bar). Action bar: WhatsApp in --green-700, the dial button narrower.
- Contact: lavender-to-sage gradient instead of flat sage.
- Glossary tile label: "מונחים ואבחנות" (Aviv's wording), same height as the other labels.
- Removed: the "היכרות" eyebrow, the capsule icon under "טיפולים נוספים".
- Testimonials: previous / next on both ends of the review capsule.

## Round 17 (2026-11-19)
- Contact: white fading into soft lavender glows and ending in the footer's lavender (no hard-edged block, no green).
- Hero dandelions grow in together with the text (stem from 0.15s, heads open at ~1.1s).
- Desktop hero: title, motto and buttons 15% larger.
- Phones: capsule raised toward the centre; the seeded dandelion is replaced by a big dandelion entering from the right edge and arching up under the capsule (.hero__dandelions--side).

## Round 18 (2026-11-19)
- Hero (all widths): a location line under the buttons — pin icon, "בן גוריון, הרצליה | רמת החייל, תל אביב" (.hero__where).
- Phones: name ×1.2, field up to 33px on one line; capsule lower (15svh + 1rem from the bottom); caption text a little larger; the side dandelion is narrower so it enters from the right with its head toward the centre.
- Desktop: the treatments dandelion sits further below its title.

## Round 19 (2026-11-19)
- Desktop: motto ×1.3; the location line sits inside the capsule under the caption (.hero__caption-where); the line under the buttons shows on phones only.
- Phones: ui.js stacks location line → left dandelion head → capsule → right dandelion head with ~30px air between each; the left stem fades out (--cut) before the capsule, so nothing touches.

## Round 20 (2026-11-19)
- Desktop: more air above the location line inside the capsule.
- Phones: motto ×1.2; Sivan in her own capsule entering from the right edge; the paragraph in a second capsule underneath entering from the left edge; the right dandelion's head sits in the space beside the paragraph capsule (ui.js places all three and grows the hero if needed).

## Round 21 (2026-11-19)
- Phones: Sivan's capsule is centred on the same line as the left dandelion's head and clears it sideways (ui.js shrinks Sivan if the screen is too narrow); the paragraph capsule rises with it and the right dandelion's head stays centred on the paragraph.
- index-standalone.html: one self-contained file (CSS, JS, fonts, images inlined) for opening on a phone; rebuild with the inliner when index.html changes.

## Round 22 (2026-11-19)
- Desktop: caption text larger; the location line further down and slightly larger. ui.js lowers the capsule when Sivan would reach the buttons on narrower screens.
- Phones: the left dandelion's head sits above Sivan's capsule, just under the location line; the whole hero moved up (less top padding and tighter gaps) so it fits a Safari viewport.

## Round 23
- Desktop: Sivan's capsule (photo, text and location line together) raised: `.hero__photo` bottom `clamp(6.5rem, 19vh, 12rem)` (was `clamp(4.5rem, 14vh, 9rem)`). The round 22 JS still lowers it on narrower screens if Sivan would reach the buttons.
- Round 23b: ui.js now lines up the top of Sivan's head (2.8% down the cutout) with the vertical middle of the WhatsApp button, whenever her hair (right edge ≈ photo right − 0.33 × --img-h) stays at least 24px left of that button (≈1366px and wider). On narrower desktops the round 22 rule still keeps her below the buttons.

## Round 24
- Mobile: the right (side) dandelion moved down so the top of its head sits 14px under the paragraph capsule (ui.js: `top = paraBottom + 14 - 0.011 × width`), and 10vw further in (`right: calc(28vw - 0.813 * 56vw)`). Hero min-height also covers its head plus a little stem.

## Round 25
- Desktop (≥1024px): the caption paragraph sits lower in Sivan's capsule, with more air above it: `.hero__caption { padding-top: 18px }` and the location line's margin-top becomes `calc(1.7em - 8px)`. The paragraph moves down about 13px and the location line about 5px. Tablets keep the round 22 spacing because their capsule is shorter.

## Round 26
- Mobile: six seeds lift off the right dandelion's head and fade upward (`.hero__side-seeds` in `.hero__deco`, `@keyframes side-seed` in motion.css). ui.js fits their box to the empty space right of the paragraph capsule and under Sivan's capsule (overflow hidden + top fade mask), so they never pass over any other element. Hidden on desktop and with reduced motion.
