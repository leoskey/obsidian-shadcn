"""Validate metadata and stage the exact assets required by BRAT and Obsidian."""
from pathlib import Path
import hashlib
import json
import os
import re
import shutil
import subprocess
import sys
import zipfile

ROOT = Path(__file__).resolve().parent.parent
manifest = json.loads((ROOT / 'manifest.json').read_text())
version = manifest['version']
assert re.fullmatch(r'\d+\.\d+\.\d+', version), 'Use a numeric x.y.z version.'
assert manifest['id'] == 'shadcn-workspace'
assert manifest['name'] == 'Shadcn' and manifest['author'] == 'Clark Lei'
assert len(manifest['description']) <= 250 and manifest['description'].endswith('.')
assert json.loads((ROOT / 'versions.json').read_text())[version] == manifest['minAppVersion']
if os.environ.get('GITHUB_REF_TYPE') == 'tag':
    assert os.environ['GITHUB_REF_NAME'] == version, 'Tag must match manifest version, without a v prefix.'
assert f'# {version}' in (ROOT / 'RELEASE_NOTES.md').read_text()

for script in ['build.py', 'build_demo.py']:
    subprocess.run([sys.executable, str(ROOT / 'scripts' / script)], cwd=ROOT, check=True)
assert (ROOT / 'LICENSE').read_text().strip() in (ROOT / 'styles.css').read_text()

stage = ROOT / 'dist' / f'release-{version}'
stage.mkdir(parents=True, exist_ok=True)
sources = [ROOT / name for name in ['main.js', 'manifest.json', 'styles.css', 'LICENSE', 'THIRD_PARTY_NOTICES.md']]
sources += [ROOT / 'downloads' / f'shadcn-{version}.zip', ROOT / 'downloads' / f'shadcn-demo-{version}.zip']
for source in sources:
    shutil.copyfile(source, stage / source.name)
checksums = ''.join(f'{hashlib.sha256(source.read_bytes()).hexdigest()}  {source.name}\n' for source in sources)
(stage / 'SHA256SUMS.txt').write_text(checksums)
expected = {p.name for p in sources} | {'SHA256SUMS.txt'}
assert {p.name for p in stage.iterdir()} == expected, 'Staging directory contains unexpected files.'
with zipfile.ZipFile(stage / f'shadcn-{version}.zip') as archive:
    for name in ['main.js', 'manifest.json', 'styles.css']:
        assert archive.read(f"{manifest['id']}/{name}") == (stage / name).read_bytes()
with zipfile.ZipFile(stage / f'shadcn-demo-{version}.zip') as archive:
    assert len(archive.namelist()) == 36
    for name in ['main.js', 'manifest.json', 'styles.css']:
        assert archive.read(f"Shadcn示例库/.obsidian/plugins/{manifest['id']}/{name}") == (stage / name).read_bytes()
print(f'Release {version}: {len(expected)} validated assets in {stage.relative_to(ROOT)}')
