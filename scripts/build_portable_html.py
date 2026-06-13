from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DIST = ROOT / "dist"
INDEX = DIST / "index.html"
OUT = ROOT / "MateVentura_PORTABLE.html"
RELEASE_DIR = ROOT / "entrega_webapp"
RELEASE_OUT = RELEASE_DIR / "MateVentura.html"

html = INDEX.read_text(encoding="utf-8")

script_match = re.search(r'<script type="module" crossorigin src="(?P<src>[^"]+)"></script>', html)
style_match = re.search(r'<link rel="stylesheet" crossorigin href="(?P<href>[^"]+)">', html)

if not script_match or not style_match:
    raise SystemExit("No se encontraron los assets de Vite en dist/index.html")

script_path = DIST / script_match.group("src").lstrip("./")
style_path = DIST / style_match.group("href").lstrip("./")

if not script_path.exists():
    raise SystemExit(f"No existe el JavaScript compilado: {script_path}")
if not style_path.exists():
    raise SystemExit(f"No existe el CSS compilado: {style_path}")

js = script_path.read_text(encoding="utf-8")
css = style_path.read_text(encoding="utf-8")

html = html.replace(style_match.group(0), f"<style>\n{css}\n</style>")
html = html.replace(script_match.group(0), f"<script type=\"module\">\n{js}\n</script>")

banner = """<!--
MateVentura — versión portable.
Abre este archivo con doble clic. No requiere npm, servidor ni terminal.
El progreso se guarda localmente en el navegador.
-->
"""
html = html.replace("<!doctype html>\n", "<!doctype html>\n" + banner)

OUT.write_text(html, encoding="utf-8")
RELEASE_DIR.mkdir(exist_ok=True)
RELEASE_OUT.write_text(html, encoding="utf-8")

print(f"Portable creado: {OUT}")
print(f"Copia de entrega: {RELEASE_OUT}")
print(f"Tamaño: {OUT.stat().st_size} bytes")
