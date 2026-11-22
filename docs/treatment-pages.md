# Treatment pages · design notes (sample: צניחת איברי אגן)

Open `treatments/pelvic-organ-prolapse.html` in a browser (works from the folder, no server).
Nothing here touches the live site. Homepage files are not changed: the page loads the same
`tokens / base / layout / components / sections / motion` CSS plus one new module, `assets/css/treatment.css`,
and one new script, `assets/js/treatment.js`.

## How the page is built
`python3 tools/build-treatment.py pelvic-organ-prolapse` assembles the page from
- `index.html` (copied, never edited): icon sprite, header, mobile menu, hero dandelions, contact section, footer,
  floating WhatsApp, mobile action bar, cookie notice. "טיפולים" is marked as the current menu section and the page
  itself as `aria-current` in every menu.
- `tools/treatment-src/<slug>.main.html`: the page layout with `{{SLOTS}}`.
- `tools/treatment-src/<slug>.content.html`: the live page's text, one block per slot.
- `tools/treatment-src/<slug>.head.html`: title, canonical, Open Graph, BreadcrumbList JSON-LD.
In WordPress the shared parts are header.php / footer.php and the slots are the page content (or ACF fields).

## Content check
The live page (saved by Aviv in `_source/`) has 21 text elements: H1, 6 H2, 9 paragraphs, 6 list items in the causes
list, plus the "טיפולים" list of 6 links. All are present word for word and in the original order (checked by script).
- Bold is added only as styling to the term before the dash in the causes list (the text is unchanged).
- Soft highlights (`.hl`, as on the homepage) on two phrases.
- The live page has no meta description; none was invented.
- The page's only image, `Dandelions.jpg` (empty alt, decorative), is reinterpreted as the homepage's line dandelions.
- Added UI only: breadcrumbs, the "בעמוד זה" in-page index, a "צור קשר" button, and the contact section/footer that the live page also has.

## What is reused from the homepage
| Homepage element | On the treatment page |
|---|---|
| Hero glows, white dissolve, blur-in entrance | page hero (`.hero.t-hero`), a title band; no buttons under the title (round 2), the floating WhatsApp button / phone action bar show from the first frame |
| The hero dandelions with pointer parallax | big one on the left; the seeded one enters from the right edge into the space under the title (one dandelion on phones) |
| "טיפולים נוספים": 4 : 7 columns, sticky title | the whole article: sticky in-page index + reading column |
| Intro subhead numbers (01, 02 in orchid) | numbered question headings `.t-h2` |
| Intro opening line (display font, light) | the first answer `.t-lead` |
| Pull-quote orchid rule drawing in | top of the sensations panel `.t-panel` |
| Lavender capsules, green hover of the path tiles | cause cards `.t-factors` |
| Sivan rising out of the lavender capsule (hero) | the treatment section `.t-care` |
| Treatments accordion rows + entering dandelion | related "טיפולים" list `.t-related` |
| Contact section, footer, action bar, WhatsApp button | unchanged |

## New components (all in treatment.css, tokens only)
- `.t-crumbs` breadcrumbs, capsule separators.
- `.t-toc` in-page index: sticky on desktop with scroll-spy (a small plum capsule marks the section being read),
  a lavender card at the top of the article on phones.
- `.t-panel` lavender capsule panel; `.t-factors` numbered cards (`--full`, `--w2` spans); `.t-steps` vertical path with
  capsule markers; `.t-care` portrait-in-capsule beside text.

## Variety across pages
Pages share the hero, headings, index and closing blocks; the middle is composed per content type:
photo + text (`.t-care`), cards (causes, characteristics), steps
(diagnosis, treatment process), panels (symptoms), and big typographic leads. Not every page uses every module.

## Round 2 (Aviv, 2026-11-19)
- Hero buttons removed; WhatsApp in the corner from the first frame (as on the homepage).
- The seeded dandelion enters from the right edge into the space between the title and the content; seeds fade before the title.
- Numbers centred in their capsules (no letter-spacing, fixed height, flex centring).
- Softer, slower hovers (cards: 2px lift, half-tint, 1.4s; link rows and index: colour only, ~1s).
- The draft anatomy illustration was removed (not approved by Sivan). Any medical illustration needs her sign-off first.

## Round 3 (Aviv, 2026-11-21)
- Text raised: one title line of space between the title and the content.
- Cause cards (04): no green hover; the bold term lifts gently (4px, 1.2s).

## Round 4 (Aviv, 2026-11-21)
- One dandelion only: the seeded one is removed.
- The big dandelion's head sits level with the H1 (treatment.js sets `--t-head` from the title's position).
- Its stem is longer (drawing extended in the build, `DANDELION_BIG_LONG`) and runs on below the hero, fading out softly down the page; it still sways, pivoting at the foot of the stem.
- Phones show the same dandelion, smaller.

## Rollout to all treatment pages (2026-11-21, after Aviv approved the sample)
All 10 pages are built the same way: `python3 tools/build-treatment.py <slug>`. Shared parts are generated by the build:
`{{HERO}}` (from `@H1` / `@CRUMB` in the content file), `{{RELATED}}` (the live "טיפולים" list, current page marked),
`{{PORTRAIT}}`, `{{CTA_BTN}}`, `{{CALL}}`. accordion.js / video.js are
added only to pages that use them. Links between redesigned pages (menus, footer, related list, in-text links, homepage) point
to the local files; canonical / Open Graph / JSON-LD stay on the live URLs.

| Page | Composition |
|---|---|
| צניחת איברי אגן | index · lead · panel · cause cards · steps · Sivan beside the treatment |
| גברים | one column · lead · panel · two links as arrow rows · Sivan beside the last paragraph |
| נשים | the opening quote set large · Sivan beside the invitation |
| בריחת שתן\שלפוחית רגיזה | index · panel · three types as numbered cards (definitions in the card) · video |
| בריחת צואה\גזים | one column · panel · closing |
| כאבים | index · panel · men / women side by side · video |
| עצירות\קשיי התרוקנות | cause cards · signs as capsule ticks · statement panel |
| הריון ולידה | index of the three chapters · questions in the homepage accordion · return to activity on the path · tips as cards · 2 videos |
| שיטת גיארם (A.P.E) | index · video · panel · indications as ticks · Sivan beside her experience (keeps its meta description) |
| טכניקות טיפוליות | five full-width hairline rows, title beside text |

Content check: every heading, paragraph and list item of each saved page is present word for word (script). Only the
empty `<h2>&nbsp;</h2>` on the pregnancy page is dropped. The pregnancy chapter titles (tab labels on the live page)
are kept as headings. Videos use the homepage player shell (nothing loads until play).
New modules (treatment.css): `.t-article--plain`, `.t-prose--lg`, `.t-more`, `.t-checks`, `.t-cards`, `.t-duo`, `.t-rows`,
`.t-media`, `.t-path`, `.t-faq`, `.t-group`, `.t-care--prose`.
Removed (Aviv, 2026-11-21): the closing block (portrait + contact) at the end of six pages; the link rows on גברים now run the full width of the panel above.
Phone files: `treatments/<slug>-standalone.html` and `index-standalone.html` (single files, linked to each other).

## Treatments index (Aviv, 2026-11-21)
The live `/treatments/` is an empty archive. `treatments/index.html` (built with `build-treatment.py index`) lists all ten
treatments, in the menu's order and with the menu's names, each linking to its page. The menu, mobile menu, footer and
breadcrumbs "טיפולים" now link to it. In WordPress: a "טיפולים" page (or the treatments archive template) with this list.

## Fixes (Aviv, 2026-11-21, batch 3)
- "טיפולים" submenu ends with a "כל הטיפולים" link to the treatments index (homepage + all pages).
- צניחת איברי אגן, causes: the dash after each bold term removed (Aviv's request); the term sits on its own line.
- נשים: no portrait; the two paragraphs in the lavender capsule. גיארם 03: no portrait.
- בריחת צואה: the opening paragraph split in two (definition set large, the rest as reading text; same words).
- עצירות: the six causes as numbered capsules (`.t-pills`) sized to their words.
