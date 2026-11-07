#!/usr/bin/env python3
"""Assemble the pages: inline Zafar's mark and Alpha's signature, stamp a content version on assets."""
import hashlib, pathlib, re
root = pathlib.Path(__file__).parent
brand = (root / "js/brand.js").read_text()
paths = re.search(r"export const MARK_PATHS = `(.*?)`;", brand, re.S).group(1)
MARK = f'<svg class="zmark" viewBox="30 30 640 825" aria-hidden="true">{paths}</svg>'
GRID = "".join(f'<line x1="{x}" y1="0" x2="{x}" y2="300"/>' for x in range(20, 520, 40)) + "".join(f'<line x1="0" y1="{y}" x2="520" y2="{y}"/>' for y in range(20, 300, 40))
ALPHA = '<a class="alpha-sig" href="https://alphaa.agency" target="_blank" rel="noopener"><img src="assets/brand/alpha-white.png" alt="Alpha Agency" width="34" height="26" loading="lazy"><span>Powered by Alpha Agency</span></a>'
files = sorted(p for p in root.rglob("*") if p.is_file() and ".git" not in p.parts and p.suffix in (".js", ".css", ".html", ".woff2", ".webp", ".jpg", ".png", ".mp4", ".svg") and not p.name.endswith(".src.html") and p.name not in ("index.html", "member.html", "admin.html"))
h = hashlib.sha1()
for p in files: h.update(p.read_bytes())
for p in root.glob("*.src.html"): h.update(p.read_bytes())
v = h.hexdigest()[:10]
for src in root.glob("*.src.html"):
    out = src.read_text().replace("__MARKPATHS__", paths).replace("__MARK__", MARK).replace("__GRID__", GRID).replace("__ALPHA__", ALPHA).replace("__V__", v)
    (root / src.name.replace(".src", "")).write_text(out)
print("built", v)
