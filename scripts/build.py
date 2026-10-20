"""Build the optional appearance and a single-install ZIP using Python 3."""
from pathlib import Path
import json
import re
import zipfile

ROOT = Path(__file__).resolve().parent.parent
manifest = json.loads((ROOT / 'manifest.json').read_text())
upstream = (ROOT / 'vendor/upstream-theme.css').read_text()
upstream = re.sub(r'\s*!important\b', '', upstream)
appearance = (ROOT / 'appearance.css').read_text()
scoped = upstream + '\n' + appearance
# A scope's root must use :scope explicitly; bare body selectors target descendants.
scoped = re.sub(r'\bbody\b', ':scope', scoped)
scoped = re.sub(r'(?<![\w:-])\.theme-(light|dark)', r':scope.theme-\1', scoped)
license_text = (ROOT / 'LICENSE').read_text().strip()
css = '/*!\n' + license_text + '\n*/\n'
css += '/* Shadcn by Clark Lei. See THIRD_PARTY_NOTICES.md for provenance. */\n'
css += (ROOT / 'list.css').read_text()
css += '\n@scope (body.shadcn-workspace) {\n' + scoped + '\n}\n'
(ROOT / 'styles.css').write_text(css)
dist = ROOT / 'downloads'
dist.mkdir(exist_ok=True)
target = dist / f"shadcn-{manifest['version']}.zip"
files = ['main.js', 'manifest.json', 'styles.css', 'LICENSE', 'THIRD_PARTY_NOTICES.md', 'README.md']
with zipfile.ZipFile(target, 'w', zipfile.ZIP_DEFLATED) as archive:
    for name in files:
        archive.write(ROOT / name, f"{manifest['id']}/{name}")
with zipfile.ZipFile(target) as archive:
    assert set(archive.namelist()) == {f"{manifest['id']}/{name}" for name in files}
print(target.name)
