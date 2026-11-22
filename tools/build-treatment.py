#!/usr/bin/env python3
"""Assemble a treatment page from the homepage's shared parts + the page's own template and content.

  python3 tools/build-treatment.py pelvic-organ-prolapse

Reads
  index.html                                   icon sprite, header, mobile menu, hero dandelions, contact, footer,
                                               floating WhatsApp, action bar, cookie notice (copied, never changed)
  tools/treatment-src/<slug>.main.html         the page's <main> layout with {{SLOTS}}
  tools/treatment-src/<slug>.content.html      the live page's text, one block per slot: <!-- @SLOT --> ...
  tools/treatment-src/<slug>.head.html         <title>, description, canonical, JSON-LD
Writes
  treatments/<slug>.html

In WordPress the shared parts are header.php / footer.php; this script only keeps the static concept in sync.
"""
import re, sys, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
slug = sys.argv[1] if len(sys.argv) > 1 else "pelvic-organ-prolapse"
INFO = ["physiotherapy-treatment", "glossary", "pelvic-floor", "identifying-and-practice", "pelvic-floor-health-tips"]
PAGES = ["about", "contact", "testimonials"]                        # top-level site pages (אודות …): they live in pages/
info = slug in INFO                      # the "מרכז מידע" pages share the treatment template; they live in information/
plain = slug in PAGES
section = "pages" if plain else "information" if info else "treatments"
src = ROOT / "tools" / ("page-src" if plain else "information-src" if info else "treatment-src")
home = (ROOT / "index.html").read_text(encoding="utf-8")


def between(text, start, end, include=True):
    i = text.index(start)
    j = text.index(end, i) + (len(end) if include else 0)
    return text[i:j]


sprite = between(home, "<!-- SPRITE:START -->", "<!-- SPRITE:END -->")
header = between(home, "<header class=\"site-header\"", "</header>")
logo = between(home, "<a class=\"site-logo\"", "</a>").replace('href="index.html"', 'href="https://www.physiotherapy.co.il/"')   # home link (rewritten below)       # the big corner logo sits outside the header (scrolls away)
mobile = between(home, "<div class=\"mobile-menu\"", "</a>\n</div>")
contact = between(home, "  <!-- ===================================================================\n       7. CONTACT", "</section>")
tail = between(home, "<footer class=\"site-footer\">", "<!-- Accessibility:", include=False)

# dandelions (the hero's two, and the treatments one), copied with fresh ids so masks never clash
big = between(home, "<div class=\"hero__dandelions hero__dandelions--big\"", "</svg>\n      </div>")
small = between(home, "<div class=\"hero__dandelions hero__dandelions--small\"", "</svg>\n      </div>")
side = between(home, "<svg viewBox=\"-50 -40 910 620\" focusable=\"false\">", "</svg>")
# round 2 (Aviv): the seeded dandelion enters from the right edge of the hero: the treatments drawing (stem from the edge)
# carrying the seeded dandelion's drifting seeds on its head
_i = home.index('<g class="dandelion__seeds">')
_j = home.index('</g></g></g>', _i) + len('</g></g></g>')
seeds = home[_i:_j]
side_seeded = side.replace('<svg viewBox="-50 -40 910 620" focusable="false">', '<svg class="hero__dandelions-svg" viewBox="-50 -40 910 620" focusable="false">', 1)
_k = side_seeded.rindex('</g></g>')            # closes sway + dandelion
side_seeded = side_seeded[:_k] + '<g transform="translate(60 -170) scale(1.4) translate(105 -165)">' + seeds + '</g>' + side_seeded[_k:]
# round 4 (Aviv): one dandelion only; its stem runs on down past the hero and fades out softly as the page scrolls
big_long = (big.replace('viewBox="-300 40 440 900"', 'viewBox="-300 40 440 2040"', 1)
               .replace('x1="0" y1="980" x2="0" y2="1240"', 'x1="0" y1="2000" x2="0" y2="2100"', 1)
               .replace('d="M-200 1600C', 'd="M-195 2600L-200 1600C', 1)
               .replace('class="hero__dandelions hero__dandelions--big"', 'class="hero__dandelions hero__dandelions--big t-hero__long"', 1))
assert big_long.count("2600") == 1 and "2040" in big_long and "2000" in big_long
small = re.sub(r'\s*<!-- a second, small whole dandelion.*?</g></g>\n', "\n", small, flags=re.S)  # the twin stays on the homepage

# Header: mark "טיפולים" as the current section, the page itself as current in the menus
header = header.replace('class="primary-nav__link is-current" href="https://www.physiotherapy.co.il/" aria-current="page"',
                        'class="primary-nav__link" href="https://www.physiotherapy.co.il/"')
if plain:
    header = header.replace(f'<a class="primary-nav__link" href="pages/{slug}.html">', f'<a class="primary-nav__link is-current" href="pages/{slug}.html">')
elif info:
    header = header.replace('class="primary-nav__link primary-nav__toggle primary-nav__toggle--label"',
                            'class="primary-nav__link primary-nav__toggle primary-nav__toggle--label is-current"')
else:
    header = header.replace('<a class="primary-nav__link" href="https://www.physiotherapy.co.il/treatments/">',
                            '<a class="primary-nav__link is-current" href="https://www.physiotherapy.co.il/treatments/">')
    header = header.replace('<a class="primary-nav__link" href="treatments/index.html">',
                            '<a class="primary-nav__link is-current" href="treatments/index.html">')
page_url = "https://www.physiotherapy.co.il/treatments/" if slug == "index" else (f"https://www.physiotherapy.co.il/{slug}/" if plain else f"https://www.physiotherapy.co.il/{section}/{slug}/")
local_url = f"{section}/{slug}.html"           # the homepage links to redesigned pages by this relative path
def mark_current(s):
    for u in (page_url, local_url):
        s = s.replace(f'<a href="{u}">', f'<a href="{u}" aria-current="page">')
    return s
header = mark_current(header)
mobile = mark_current(mobile).replace('href="https://www.physiotherapy.co.il/" aria-current="page"', 'href="https://www.physiotherapy.co.il/"')
tail = mark_current(tail)

def assets(s):
    return s.replace('src="assets/', 'src="../assets/').replace('srcset="assets/', 'srcset="../assets/').replace(', assets/', ', ../assets/')

main = (src / f"{slug}.main.html").read_text(encoding="utf-8")
cpath = src / f"{slug}.content.html"
content = cpath.read_text(encoding="utf-8") if cpath.exists() else ""
blocks = dict(re.findall(r"<!-- @(\w+) -->\n(.*?)(?=\n<!-- @|\Z)", content, flags=re.S))
blocks.update({
    "DANDELION_BIG": "      " + big,
    "DANDELION_BIG_LONG": "      " + big_long,
    "DANDELION_SMALL": "      " + small,
    "DANDELION_SIDE": "          " + side,
    "DANDELION_SEEDED_SIDE": "        " + side_seeded,
    "CONTACT": contact,
})

# ---- shared page parts generated for every treatment page ----
TREATMENTS = ["men", "women", "urinary-incontinence", "fecal-incontinence", "pelvic-pain", "constipation",
              "pelvic-organ-prolapse", "pregnancy-and-birth", "guillarme", "treatment-techniques"]
RELATED = [("men", "גברים"), ("urinary-incontinence", "בריחת שתן\\שלפוחית רגיזה"), ("pregnancy-and-birth", "הריון ולידה"),
           ("women", "נשים"), ("constipation", "עצירות\\קשיי התרוקנות"), ("pelvic-organ-prolapse", "צניחת איברי אגן")]
def related_block():
    rows = []
    for s_, name in RELATED:
        url = f"https://www.physiotherapy.co.il/treatments/{s_}/"
        if s_ == slug:
            rows.append(f'        <li class="acc__item" data-reveal><a class="t-links__link" href="{url}" aria-current="page"><span class="acc__title">{name}</span><span class="t-links__here"><svg class="icon" aria-hidden="true"><use href="#i-capsule"/></svg><span class="visually-hidden">הדף הנוכחי</span></span></a></li>')
        else:
            rows.append(f'        <li class="acc__item" data-reveal><a class="t-links__link" href="{url}"><span class="acc__title">{name}</span><span class="t-links__go"><svg class="icon" aria-hidden="true"><use href="#i-arrow"/></svg></span></a></li>')
    return """  <!-- RELATED: the live page's "טיפולים" list (six links, same order on every treatment page) -->
  <section class="treatments t-related section" aria-labelledby="related-title">
    <div class="container treatments__grid">
      <header class="treatments__head">
        <h2 class="section-title" id="related-title" data-reveal>טיפולים</h2>
        <div class="treatments__dandelion" aria-hidden="true" data-reveal>
          """ + side + """
        </div>
      </header>
      <ul class="acc t-links" role="list">
""" + "\n".join(rows) + """
      </ul>
    </div>
  </section>"""

PORTRAIT = """<figure class="t-portrait" data-reveal>
              <span class="t-portrait__cap"><img class="t-portrait__img" src="../assets/images/sivan-navot-portrait-cutout-full.webp" alt="סיון נבות (Sivan Navot), פיזיותרפיסטית מומחית בשיקום רצפת האגן" width="691" height="890" loading="lazy"></span>
              <img class="t-portrait__img t-portrait__img--top" src="../assets/images/sivan-navot-portrait-cutout-full.webp" alt="" aria-hidden="true" width="691" height="890" loading="lazy">
            </figure>"""
CTA_BTN = """<a class="btn btn--primary btn--lg t-care__cta" href="#contact">
                צור קשר
                <svg class="icon icon--move" aria-hidden="true"><use href="#i-arrow"/></svg>
              </a>"""
CALL = """<a class="t-toc__call" href="tel:052-6623666">
            <span class="arrow-link__icon"><svg class="icon" aria-hidden="true"><use href="#i-phone"/></svg></span>
            <span dir="ltr">052-6623666</span>
          </a>"""
def hero_block():
    h1 = blocks["H1"].strip(); crumb = blocks.get("CRUMB", h1).strip()
    mod = " t-hero__title--long" if len(h1) > 24 else ""
    mid = ("" if slug == "index" else '<li><a href="https://www.physiotherapy.co.il/treatments/">טיפולים</a></li>\n          ')
    if info: mid = '<li><span>מרכז מידע</span></li>\n          '   # no hub page (Aviv): the section name is plain text
    if plain: mid = ""
    bare = "HERO_BARE" in blocks          # about (Aviv): no visible page title, the H1 stays for screen readers and SEO
    hcls = " t-hero--bare" if bare else ""
    if bare: mod += " visually-hidden"
    extra = ("\n" + blocks["HERO_EXTRA"].rstrip()) if "HERO_EXTRA" in blocks else ""   # contact: actions under the title
    return f"""  <!-- HERO: shared by every treatment page (approved on the sample page): one long-stemmed dandelion, head level with the title -->
  <section class="hero t-hero{hcls}" aria-labelledby="page-title" data-hero-parallax>
    <div class="hero__bg" aria-hidden="true">
      <span class="hero__glow hero__glow--a"></span>
      <span class="hero__glow hero__glow--b"></span>
    </div>
    <div class="t-hero__deco" aria-hidden="true">
      {big_long}
    </div>
    <div class="container t-hero__text">
      <nav class="t-crumbs" aria-label="פירורי לחם" data-hero-item>
        <ol role="list">
          <li><a href="https://www.physiotherapy.co.il/">דף הבית</a></li>
          {mid}<li><span aria-current="page">{crumb}</span></li>
        </ol>
      </nav>
      <h1 class="t-hero__title{mod}" id="page-title" data-hero-item>{h1}</h1>{extra}
    </div>
  </section>"""
if "FORM_NOTE" in blocks:   # contact (Aviv): a small note under the message field
    _m = '<textarea class="field__input field__input--area" id="f-msg" name="input_4" rows="3"></textarea>\n'
    assert _m in blocks["CONTACT"]
    blocks["CONTACT"] = blocks["CONTACT"].replace(_m, _m + blocks["FORM_NOTE"].rstrip() + "\n", 1)
blocks.update({"RELATED": related_block(), "PORTRAIT": PORTRAIT, "CTA_BTN": CTA_BTN, "CALL": CALL})
if "H1" in blocks: blocks["HERO"] = hero_block()
def fill(m):
    key = m.group(1)
    if key not in blocks:
        raise SystemExit(f"missing block {key}")
    return blocks[key].rstrip()
main = re.sub(r"\{\{(\w+)\}\}", fill, main)
extra_js = ("<script src=\"../assets/js/accordion.js\" defer></script>\n" if "data-accordion" in main else "") + ("<script src=\"../assets/js/video.js\" defer></script>\n" if "data-video" in main else "") + ("<script src=\"../assets/js/gallery.js\" defer></script>\n" if "data-gallery" in main else "")
head = (src / f"{slug}.head.html").read_text(encoding="utf-8").rstrip()

page = f"""<!doctype html>
<html lang="he" dir="rtl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
{head}
  <meta name="theme-color" content="#fbf9f7">
  <link rel="icon" href="../assets/images/favicon.svg" type="image/svg+xml">
  <link rel="icon" href="../assets/images/favicon-32.png" sizes="32x32" type="image/png">
  <link rel="apple-touch-icon" href="../assets/images/apple-touch-icon.png">

  <link rel="stylesheet" href="../assets/css/tokens.css">
  <link rel="stylesheet" href="../assets/css/base.css">
  <link rel="stylesheet" href="../assets/css/layout.css">
  <link rel="stylesheet" href="../assets/css/components.css">
  <link rel="stylesheet" href="../assets/css/sections.css">
  <link rel="stylesheet" href="../assets/css/treatment.css">
  <link rel="stylesheet" href="../assets/css/motion.css">

  <script>document.documentElement.classList.add('js');</script>
</head>
<body class="page-treatment{(" page-" + slug) if plain else ""}">
{sprite}
<a class="skip-link" href="#main">דילוג לתוכן</a>

<!-- HEADER: same as the homepage (header.php); "טיפולים" marked as the current section -->
{assets(logo)}
{assets(header)}

{assets(mobile)}

<main id="main">

{assets(main)}
</main>

{assets(tail)}<!-- Accessibility: the live site runs the enable.co.il widget. Keep its script tag in WordPress. -->

<script src="../assets/js/header.js" defer></script>
<script src="../assets/js/nav.js" defer></script>
<script src="../assets/js/reveal.js" defer></script>
<script src="../assets/js/form.js" defer></script>
<script src="../assets/js/ui.js" defer></script>
{extra_js}<script src="../assets/js/treatment.js" defer></script>
</body>
</html>
"""
page = re.sub(r'(<a\b[^>]*?href=")https://www\.physiotherapy\.co\.il/contact/"', r'\g<1>pages/contact.html"', page)
page = re.sub(r'(<a\b[^>]*?href=")https://www\.physiotherapy\.co\.il/testimonials/"', r'\g<1>pages/testimonials.html"', page)   # the contact page is redesigned too
# Concept links between redesigned pages: from treatments/ the homepage is ../index.html and sibling pages are local.
# (In WordPress all of these are the normal permalinks.)
if plain:
    page = page.replace('href="treatments/', 'href="../treatments/').replace('href="information/', 'href="../information/').replace('href="pages/', 'href="')
elif info:
    page = page.replace('href="treatments/', 'href="../treatments/').replace('href="information/', 'href="').replace('href="pages/', 'href="../pages/')
else:
    page = page.replace('href="treatments/', 'href="').replace('href="information/', 'href="../information/').replace('href="pages/', 'href="../pages/')
tpre = "../treatments/" if (info or plain) else ""
page = page.replace('href="https://www.physiotherapy.co.il/"', 'href="../index.html"')
page = re.sub(r'(<a\b[^>]*?href=")https://www\.physiotherapy\.co\.il/treatments/"', r'\g<1>' + tpre + 'index.html"', page)
for t_ in INFO:
    page = re.sub(r'(<a\b[^>]*?href=")https://www\.physiotherapy\.co\.il/information/' + re.escape(t_) + r'/"', r'\g<1>' + ("" if info else "../information/") + t_ + '.html"', page)
for t_ in TREATMENTS:
    page = re.sub(r'(<a\b[^>]*?href=")https://www\.physiotherapy\.co\.il/treatments/' + re.escape(t_) + r'/"', r'\g<1>' + tpre + t_ + '.html"', page)
page = page.replace(f'<a href="{page_url}"', f'<a href="{slug}.html"').replace(f'class="t-links__link" href="{page_url}"', f'class="t-links__link" href="{slug}.html"')

# English twin (tools/make-en.py writes en/<section>/<slug>.html): the language switch and hreflang alternates
page = page.replace('href="en/index.html"', f'href="../en/{section}/{slug}.html"')
_en = "https://www.physiotherapy.co.il/en/" + ("treatments/" if slug == "index" else f"{slug}/" if plain else f"{section}/{slug}/")
page = re.sub(r'(<link rel="canonical" href="([^"]*)">)', lambda m: m.group(1) + f'\n  <link rel="alternate" hreflang="he" href="{m.group(2)}">\n  <link rel="alternate" hreflang="en" href="{_en}">', page, count=1)

out = ROOT / section / f"{slug}.html"
out.parent.mkdir(exist_ok=True)
out.write_text(page, encoding="utf-8")
print("wrote", out.relative_to(ROOT), len(page), "bytes")
