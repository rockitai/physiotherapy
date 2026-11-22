#!/usr/bin/env python3
"""Build the English site (en/) from the built Hebrew pages.

  python3 tools/make-en.py            # writes en/index.html, en/pages/*, en/information/*, en/treatments/*
  python3 tools/make-en.py --missing  # lists Hebrew text that has no translation yet (tools/en/missing.json)

Run it after tools/build-treatment.py, so the English pages always follow the Hebrew layout.

How it works
  * Every built Hebrew page is read as plain text (never re-serialised, so the markup stays byte-identical).
  * Translation units are the innermost text blocks (p, li, h1-h6, dt, dd, label, button, figcaption, …):
    their inner HTML, whitespace collapsed, is looked up in tools/en/*.json  {"<Hebrew inner HTML>": "<English inner HTML>"}.
    Inline markup (strong, a, br, span) is part of the unit, so word order can change freely.
  * Hebrew left outside those blocks (loose text, attributes such as alt / aria-label / content, JSON-LD strings)
    is looked up the same way.
  * The page is switched to lang="en" dir="ltr", gets assets/css/ltr.css (the few mirrored physical rules),
    deeper asset paths, mirrored arrow icons, and the language switch pointing back to its Hebrew twin.
In WordPress this is the job of a translation plugin (WPML / Polylang); the JSON files are the string tables.
"""
import html.parser, json, re, sys, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
TDIR = ROOT / "tools" / "en"
HEB = re.compile(r"[֐-׿]")
PAGES = (["index.html"] + [f"pages/{p}.html" for p in ("about", "contact", "testimonials")]
         + [f"information/{p}.html" for p in ("physiotherapy-treatment", "glossary", "pelvic-floor", "identifying-and-practice", "pelvic-floor-health-tips")]
         + [f"treatments/{p}.html" for p in ("index", "men", "women", "urinary-incontinence", "fecal-incontinence", "pelvic-pain", "constipation",
                                              "pelvic-organ-prolapse", "pregnancy-and-birth", "guillarme", "treatment-techniques")])
BLOCKS = {"p", "li", "h1", "h2", "h3", "h4", "h5", "h6", "dt", "dd", "td", "th", "figcaption", "blockquote", "label",
          "button", "summary", "legend", "option", "title", "caption", "time"}
VOID = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "source", "track", "wbr", "use", "path",
        "circle", "line", "rect", "ellipse", "polyline", "polygon", "stop"}
ATTRS = ("alt", "aria-label", "title", "placeholder", "content", "data-date", "data-label")


def norm(s):
    return re.sub(r"\s+", " ", s).strip()


class Tree(html.parser.HTMLParser):
    """Records each element's offsets: [tag, start, content_start, content_end, parent]."""
    def __init__(self, text):
        super().__init__(convert_charrefs=False)
        self.text = text
        self.lines = [0]
        for m in re.finditer("\n", text):
            self.lines.append(m.end())
        self.els, self.stack, self.attrs = [], [], []
        self.feed(text); self.close()

    def off(self):
        l, c = self.getpos()
        return self.lines[l - 1] + c

    def handle_starttag(self, tag, attrs):
        o = self.off()
        end = o + len(self.get_starttag_text())
        self.attrs.append((o, end))
        if tag in VOID:
            return
        el = [tag, o, end, None, self.stack[-1] if self.stack else None]
        self.els.append(el); self.stack.append(el)

    def handle_startendtag(self, tag, attrs):
        o = self.off()
        self.attrs.append((o, o + len(self.get_starttag_text())))

    def handle_endtag(self, tag):
        if tag in VOID:
            return
        o = self.off()
        for i in range(len(self.stack) - 1, -1, -1):
            if self.stack[i][0] == tag:
                for el in self.stack[i:]:
                    if el[3] is None:
                        el[3] = o
                del self.stack[i:]
                return


def load_table():
    t = {}
    for f in sorted(TDIR.glob("*.json")):
        if f.name == "missing.json":
            continue
        for k, v in json.loads(f.read_text(encoding="utf-8")).items():
            t[akey(norm(k))] = v
    return t


def units(text):
    """Yield (start, end, kind) spans of Hebrew to translate, non-overlapping, in order."""
    tr = Tree(text)
    spans = []
    # 1. block units: innermost block elements holding Hebrew text (outside <script>/<style>)
    skip = [(e[1], e[3]) for e in tr.els if e[0] in ("script", "style") and e[3]]
    def in_skip(a):
        return any(s <= a < e for s, e in skip)
    blocks = [e for e in tr.els if e[0] in BLOCKS and e[3] is not None and not in_skip(e[1])
              and HEB.search(re.sub(r"<[^>]*>", "", text[e[2]:e[3]]))]
    inner = []
    for e in blocks:
        if any(o is not e and e[2] <= o[1] < e[3] for o in blocks):
            continue                      # holds a smaller block with Hebrew: the smaller one is the unit
        inner.append(e)
    for e in inner:
        spans.append((e[2], e[3], "block"))
    covered = sorted((s, e) for s, e, _ in spans)
    def inside(a):
        return any(s <= a < e for s, e in covered)
    # 2. loose text runs with Hebrew outside the blocks
    for m in re.finditer(r">([^<]*)<", text):
        a, b = m.start(1), m.end(1)
        if HEB.search(m.group(1)) and not inside(a) and not in_skip(a):
            spans.append((a, b, "text"))
    # 3. attributes (also inside blocks: their own text never includes attributes)
    for s, e in tr.attrs:
        tag = text[s:e]
        if in_skip(s):
            continue
        for m in re.finditer(r'\s([\w-]+)="([^"]*)"', tag):
            if m.group(1) in ATTRS and HEB.search(m.group(2)):
                spans.append((s + m.start(2), s + m.end(2), "attr"))
    # 4. JSON-LD strings
    for s, e in skip:
        if 'application/ld+json' in text[s:s + 80]:
            for m in re.finditer(r'"((?:[^"\\]|\\.)*)"', text[s:e]):
                if HEB.search(m.group(1)):
                    spans.append((s + m.start(1), s + m.end(1), "json"))
    spans.sort()
    out, last = [], -1
    for sp in spans:                      # attributes inside block units are handled inside the block text
        if sp[0] >= last:
            out.append(sp); last = sp[1]
        elif sp[2] == "attr":
            pass
    return out


ATAG = re.compile(r"<a\b[^>]*>")


def akey(s):
    """Links differ per page (relative paths, aria-current), so inside a key every <a ...> is written as <a>."""
    return ATAG.sub("<a>", s)


def put_links(value, raw):
    tags = ATAG.findall(raw)
    it = iter(tags)
    out = re.sub(r"<a>", lambda m: next(it), value)
    assert value.count("<a>") == len(tags), ("link count differs", value[:80])
    return out


def runs(raw):
    return [t for t in re.findall(r">([^<]*)<", ">" + raw + "<") if HEB.search(t)]


def translate(text, table, missing, page):
    out, pos = [], 0
    for a, b, kind in units(text):
        out.append(text[pos:a])
        raw = text[a:b]
        key = norm(raw)
        lead = raw[:len(raw) - len(raw.lstrip())]; trail = raw[len(raw.rstrip()):]
        if kind == "block":
            k = akey(key)
            if k in table:
                out.append(lead + put_links(table[k], raw.strip()) + trail)
            else:
                pieces = sub_translate(raw, table)
                if pieces is not None:
                    out.append(pieces)
                else:
                    if len(runs(raw)) > 1:
                        missing.setdefault(k, page)
                    else:
                        for t in runs(raw):
                            if norm(t) not in table:
                                missing.setdefault(norm(t), page)
                        for m in re.finditer(r'\s([\w-]+)="([^"]*)"', raw):
                            if m.group(1) in ATTRS and HEB.search(m.group(2)) and norm(m.group(2)) not in table:
                                missing.setdefault(norm(m.group(2)), page)
                    out.append(raw)
        elif kind == "json":
            k2 = norm(json.loads('"' + raw + '"'))
            if k2 in table:
                out.append(json.dumps(table[k2], ensure_ascii=False)[1:-1])
            else:
                missing.setdefault(k2, page); out.append(raw)
        else:
            if key in table:
                v = table[key]
                out.append(lead + (v.replace('"', "&quot;") if kind == "attr" else v) + trail)
            else:
                missing.setdefault(key, page); out.append(raw)
        pos = b
    out.append(text[pos:])
    return "".join(out)


def sub_translate(raw, table):
    """A block whose Hebrew runs each have their own entry (a menu item, an accordion title + "current page"): translate them one by one."""
    ok = True
    def rep_text(m):
        nonlocal ok
        t = m.group(1)
        if not HEB.search(t):
            return m.group(0)
        k = norm(t)
        if k in table:
            lead = t[:len(t) - len(t.lstrip())]; trail = t[len(t.rstrip()):]
            return ">" + lead + table[k] + trail + "<"
        ok = False
        return m.group(0)
    def rep_attr(m):
        nonlocal ok
        k = norm(m.group(2))
        if m.group(1) in ATTRS and HEB.search(k):
            if k in table:
                return f' {m.group(1)}="{table[k]}"'
            ok = False
        return m.group(0)
    s = re.sub(r'\s([\w-]+)="([^"]*)"', rep_attr, raw)
    s = re.sub(r">([^<]*)<", rep_text, ">" + s + "<")[1:-1]
    return s if ok else None


ARROW_HE = '<symbol id="i-arrow"'


def localise(page, text):
    depth = page.count("/")                 # 0 for index.html, 1 for pages/x.html
    up = "../" * (depth + 1)                # from en/... back to the site root
    # language + direction
    text = text.replace('<html lang="he" dir="rtl">', '<html lang="en" dir="ltr">', 1)
    text = text.replace('content="he_IL"', 'content="en_US"')
    # assets one level deeper
    pre = "../" * depth
    text = re.sub(r'((?:src|href|srcset)=")' + re.escape(pre) + r'assets/', r'\g<1>' + up + 'assets/', text)
    text = re.sub(r'(, )' + re.escape(pre) + r'assets/', r'\g<1>' + up + 'assets/', text)
    # the mirrored rules
    css = f'<link rel="stylesheet" href="{up}assets/css/motion.css">'
    assert css in text, page
    text = text.replace(css, css + f'\n  <link rel="stylesheet" href="{up}assets/css/ltr.css">', 1)
    # icons: the arrow points forward (right) and the slider chevrons swap
    text = re.sub(r'(<symbol id="i-arrow"[^>]*>)(.*?)(</symbol>)', lambda m: m.group(1) + '<path d="M5 12h14"/><path d="M13.5 6.5 19 12l-5.5 5.5"/>' + m.group(3), text, count=1, flags=re.S)
    p = re.search(r'(<symbol id="i-chevron-prev"[^>]*>)(.*?)(</symbol>)', text, re.S)
    n = re.search(r'(<symbol id="i-chevron-next"[^>]*>)(.*?)(</symbol>)', text, re.S)
    if p and n:
        pb, nb = p.group(2), n.group(2)
        text = text.replace(p.group(0), p.group(1) + nb + p.group(3)).replace(n.group(0), n.group(1) + pb + n.group(3))
    # language switch -> the Hebrew twin of this page
    twin = up + page
    text = re.sub(r'<a class="lang-switch"[^>]*>.*?</a>',
                  f'<a class="lang-switch" href="{twin}" hreflang="he" lang="he" data-lang-switch><span aria-hidden="true">עב</span><span class="visually-hidden">עברית</span></a>', text, count=1)
    text = re.sub(r'<a class="mobile-menu__lang"[^>]*>.*?</a>',
                  f'<a class="mobile-menu__lang" href="{twin}" hreflang="he" lang="he" data-lang-switch>עברית</a>', text, count=1)
    # English logo (Aviv, 2026-11-22: from her English business card, the pelvis drawn in the Hebrew logo's grey)
    text = re.sub(r'src="([./]*)assets/images/logo-sivan-navot\.svg" width="\d+" height="\d+"', r'src="\g<1>assets/images/logo-sivan-navot-en.svg" width="218" height="67"', text)
    # the switch stays to the left of the phone button: in LTR that means before it
    sw = re.search(r'\n      <!-- language switch.*?-->\n      <a class="lang-switch".*?</a>', text, re.S)
    call = re.search(r'\n      <a class="btn btn--primary btn--sm site-header__call".*?</a>', text, re.S)
    if sw and call and sw.start() > call.start():
        text = text[:sw.start()] + text[sw.end():]
        text = text[:call.start()] + sw.group(0) + text[call.start():]
    # the About page's language link
    text = re.sub(r'<a class="a-intro__en"[^>]*>.*?</a>',
                  f'<a class="a-intro__en" href="{twin}" hreflang="he" lang="he">עברית <svg class="icon" aria-hidden="true"><use href="#i-arrow"/></svg></a>', text, count=1)
    # English opening quotation mark; the English PFFM page on the live site
    text = text.replace('<span class="quote__mark" aria-hidden="true">”</span>', '<span class="quote__mark" aria-hidden="true">“</span>')
    text = text.replace('href="https://www.physiotherapy.co.il/pffm/"', 'href="https://www.physiotherapy.co.il/pffm-en/"')
    # canonical: the English address
    slug = page[:-5]
    url = "https://www.physiotherapy.co.il/en/" + ("" if slug == "index" else ("treatments/" if slug == "treatments/index" else slug.replace("pages/", "") + "/"))
    text = re.sub(r'<link rel="canonical" href="[^"]*">', f'<link rel="canonical" href="{url}">', text, count=1)
    text = re.sub(r'(<meta property="og:url" content=")[^"]*"', r'\g<1>' + url + '"', text, count=1)
    return text


ALLOWED = ("עב", "עברית")       # the switch back to Hebrew is written in Hebrew on purpose


def main():
    table = load_table()
    missing = {}
    report = "--missing" in sys.argv
    only = [a for a in sys.argv[1:] if not a.startswith("--")]
    for page in PAGES:
        if only and page not in only:
            continue
        src = (ROOT / page).read_text(encoding="utf-8")
        text = translate(src, table, missing, page)
        text = localise(page, text)
        body = re.sub(r"<!--.*?-->", "", text, flags=re.S)
        left = [m for m in re.findall(r"[֐-׿][֐-׿\s\"'״׳\-]*", body) if m.strip() not in ALLOWED]
        if not report:
            out = ROOT / "en" / page
            out.parent.mkdir(parents=True, exist_ok=True)
            out.write_text(text, encoding="utf-8")
            print(f"wrote en/{page}", "" if not left else f"  ({len(left)} Hebrew runs left)")
    if missing:
        (TDIR / "missing.json").write_text(json.dumps(missing, ensure_ascii=False, indent=1), encoding="utf-8")
        print(len(missing), "untranslated units -> tools/en/missing.json")
    elif (TDIR / "missing.json").exists():
        (TDIR / "missing.json").unlink()


if __name__ == "__main__":
    main()
