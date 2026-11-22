#!/usr/bin/env python3
"""Make a single self-contained HTML file (CSS, JS, fonts, images inlined) for opening on a phone.
  python3 tools/inline.py <page.html> <out.html> ["old -> new" ...]   (optional href rewrites)"""
import sys, re, base64, pathlib, mimetypes
src = pathlib.Path(sys.argv[1]).resolve(); out = pathlib.Path(sys.argv[2])
base = src.parent
html = src.read_text(encoding="utf-8")
MIME = {".woff2": "font/woff2", ".webp": "image/webp", ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml"}
def data_uri(p):
    p = p.resolve()
    return f"data:{MIME.get(p.suffix, mimetypes.guess_type(p.name)[0])};base64," + base64.b64encode(p.read_bytes()).decode()
def css_inline(m):
    p = (base / m.group(1)).resolve()
    css = p.read_text(encoding="utf-8")
    css = re.sub(r'url\("?(\.\./[^")]+)"?\)', lambda u: f'url("{data_uri(p.parent / u.group(1))}")', css)
    return f"<style>\n{css}\n</style>"
html = re.sub(r'<link rel="stylesheet" href="([^"]+\.css)">', css_inline, html)
html = re.sub(r'<link rel="preload"[^>]*>\n?', "", html)
html = re.sub(r'<script src="([^"]+\.js)" defer></script>',
              lambda m: "<script>\n" + (base / m.group(1)).read_text(encoding="utf-8") + "\n</script>", html)
def img(m):
    attr, path = m.group(1), m.group(2)
    if path.startswith(("http", "data:")): return m.group(0)
    return f'{attr}="{data_uri(base / path)}"'
html = re.sub(r'(src)="([^"]+\.(?:webp|png|jpg|svg))"', img, html)
html = re.sub(r'\ssrcset="[^"]*"', "", html)   # src already holds the 1x image inline
for pair in sys.argv[3:]:
    old, new = pair.split(" -> ", 1); html = html.replace(old, new)
out.write_text(html, encoding="utf-8")
print("wrote", out, round(len(html) / 1024), "KB")
