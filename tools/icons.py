"""
Icon source of truth for the Sivan Navot site.
Run:  python3 tools/icons.py
- writes one SVG per icon to assets/icons/<name>.svg
- rewrites the inline <svg> sprite between the SPRITE markers in index.html
Rules: 24x24 grid, 1.5 stroke, round caps + joins, no fills, currentColor.
"""
import pathlib, re
ROOT = pathlib.Path(__file__).resolve().parent.parent
ICONS = {
  # --- UI ---
  "arrow":        '<path d="M19 12H5"/><path d="M10.5 6.5 5 12l5.5 5.5"/>',
  "chevron-down": '<path d="M6.5 9.5 12 15l5.5-5.5"/>',
  "chevron-prev": '<path d="M9.5 6l6 6-6 6"/>',
  "chevron-next": '<path d="M14.5 6l-6 6 6 6"/>',
  "menu":         '<path d="M4 8.5h16"/><path d="M9 15.5h11"/>',
  "close":        '<path d="M6.5 6.5l11 11"/><path d="M17.5 6.5l-11 11"/>',
  "play":         '<path d="M9 6.8v10.4l8.2-5.2z"/>',
  "check":        '<path d="M5.5 12.5l4 4 9-9"/>',
  "alert":        '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5v5.5"/><path d="M12 16.3v.2"/>',
  # --- Contact ---
  "phone":        '<path d="M6 3.5h2.8l1.6 4.1-2.1 1.5a11.5 11.5 0 0 0 6.6 6.6l1.5-2.1 4.1 1.6V18a2.5 2.5 0 0 1-2.5 2.5C10.4 20.5 3.5 13.6 3.5 6A2.5 2.5 0 0 1 6 3.5z"/>',
  "whatsapp":     '<path d="M12 3.5a8.5 8.5 0 0 0-7.3 12.8L3.5 20.5l4.3-1.1A8.5 8.5 0 1 0 12 3.5z"/><path d="M9.2 8.6c-.3 2.9 3.2 6.5 6.2 6.2l.6-1.5-1.8-.9-.9.8a4.4 4.4 0 0 1-2.4-2.4l.8-.9-.9-1.8z"/>',
  "mail":         '<rect x="3.5" y="5.5" width="17" height="13" rx="2.5"/><path d="M4.5 7.5l7.5 5.5 7.5-5.5"/>',
  "pin":          '<path d="M12 20.8s-6.5-5.4-6.5-10.8a6.5 6.5 0 0 1 13 0c0 5.4-6.5 10.8-6.5 10.8z"/><circle cx="12" cy="10" r="2.3"/>',
  "fax":          '<path d="M7 8V3.5h7.5L17 6v2"/><rect x="3.5" y="8" width="17" height="8.5" rx="2"/><path d="M7 13.5h10v7H7z"/><path d="M16.5 10.8h.5"/>',
  "facebook":     '<rect x="3.5" y="3.5" width="17" height="17" rx="5"/><path d="M15.5 8H14a2 2 0 0 0-2 2v10.5"/><path d="M9.5 13h5"/>',
  # --- Treatments (domain) ---
  "pain":         '<circle cx="12" cy="12" r="2.3"/><path d="M7.4 8a6.5 6.5 0 0 0 0 8"/><path d="M16.6 8a6.5 6.5 0 0 1 0 8"/><path d="M4.6 5.2a10.5 10.5 0 0 0 0 13.6"/><path d="M19.4 5.2a10.5 10.5 0 0 1 0 13.6"/>',
  "support":      '<path d="M3.5 10c2 5.6 5 8.5 8.5 8.5s6.5-2.9 8.5-8.5"/><circle cx="12" cy="10.5" r="3"/>',
  "shield":       '<path d="M12 3.5l7 2.6v5.4c0 4.4-2.9 7.7-7 9-4.1-1.3-7-4.6-7-9V6.1z"/><path d="M9 12.2l2.1 2.1 4-4"/>',
  "flow":         '<path d="M4 6.5h10.5a3 3 0 0 1 0 6h-5a3 3 0 0 0 0 6H20"/><path d="M17 15.5l3 3-3 3"/>',
  "drop":         '<path d="M12 3.5s6 6.3 6 10.9a6 6 0 0 1-12 0C6 9.8 12 3.5 12 3.5z"/><path d="M9.3 14.6a2.7 2.7 0 0 0 2.7 2.7"/>',
  "urgency":      '<path d="M12 3.5s4.2 4.4 4.2 7.6a4.2 4.2 0 0 1-8.4 0c0-3.2 4.2-7.6 4.2-7.6z"/><path d="M3.5 19.5c1.4-1.1 2.8-1.1 4.2 0s2.9 1.1 4.3 0 2.9-1.1 4.3 0 2.8 1.1 4.2 0"/>',
  "book":         '<path d="M12 6.5C10 5 7 4.5 3.5 5v13c3.5-.5 6.5 0 8.5 1.5 2-1.5 5-2 8.5-1.5V5C17 4.5 14 5 12 6.5z"/><path d="M12 6.5v13"/>',
  "capsule":      '<rect x="3.5" y="8.25" width="17" height="7.5" rx="3.75"/>',
}
def svg(body, sym=None):
    attrs = 'viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"'
    if sym:
        return f'<symbol id="i-{sym}" {attrs}>{body}</symbol>'
    return f'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" {attrs}>{body}</svg>\n'
out = ROOT / "assets" / "icons"; out.mkdir(parents=True, exist_ok=True)
for name, body in ICONS.items():
    (out / f"{name}.svg").write_text(svg(body))
sprite = ('<svg xmlns="http://www.w3.org/2000/svg" style="display:none" aria-hidden="true">'
          + "".join(svg(b, n) for n, b in ICONS.items()) + "</svg>")
for idx in (ROOT / "index.html", ROOT / "design-system.html"):
  if idx.exists():
    html = idx.read_text()
    html = re.sub(r"<!-- SPRITE:START -->.*?<!-- SPRITE:END -->",
                  "<!-- SPRITE:START -->" + sprite.replace("\\", "\\\\") + "<!-- SPRITE:END -->", html, flags=re.S)
    idx.write_text(html)
print(f"{len(ICONS)} icons written")
