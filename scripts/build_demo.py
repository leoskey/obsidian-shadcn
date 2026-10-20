"""Package the public example vault with the current plugin. Python 3 only."""
from pathlib import Path
import json
import shutil
import zipfile

ROOT = Path(__file__).resolve().parent.parent
vault = ROOT / 'examples/Shadcn示例库'
notes = sorted(p for p in vault.rglob('*.md') if '.obsidian' not in p.relative_to(vault).parts)
assert len(notes) == 26, 'Expected 24 sample notes, a home page and an index.'
manifest = json.loads((ROOT / 'manifest.json').read_text())
plugin = vault / '.obsidian/plugins' / manifest['id']
plugin.mkdir(parents=True, exist_ok=True)
assets = ['main.js', 'manifest.json', 'styles.css', 'LICENSE', 'THIRD_PARTY_NOTICES.md']
for name in assets:
    shutil.copyfile(ROOT / name, plugin / name)

def leaf(identifier, kind, state, title, icon):
    return {'id': identifier, 'type': 'leaf', 'state': {
        'type': kind, 'state': state, 'title': title, 'icon': icon}}

workspace = {
    'main': {'id': 'main', 'type': 'split', 'direction': 'vertical', 'children': [
        {'id': 'main-tabs', 'type': 'tabs', 'children': [leaf('main-note', 'markdown', {
            'file': '全部笔记.md', 'mode': 'preview', 'source': False}, '全部笔记', 'lucide-file')]}]},
    'left': {'id': 'left', 'type': 'split', 'direction': 'horizontal', 'width': 265, 'children': [
        {'id': 'left-tabs', 'type': 'tabs', 'children': [
            leaf('files', 'file-explorer', {'sortOrder': 'alphabetical', 'autoReveal': False}, 'Files', 'lucide-folder-closed'),
            leaf('search', 'search', {'query': ''}, 'Search', 'lucide-search'),
            leaf('bookmarks', 'bookmarks', {}, 'Bookmarks', 'lucide-bookmark')]}]},
    'right': {'id': 'right', 'type': 'split', 'direction': 'horizontal', 'width': 280, 'collapsed': True, 'children': [
        {'id': 'right-tabs', 'type': 'tabs', 'children': [leaf('outline', 'outline', {}, 'Outline', 'lucide-list')]}]},
    'active': 'main-note', 'lastOpenFiles': ['首页.md', '全部笔记.md']}
configs = {
    'app.json': {'showInlineTitle': False, 'propertiesInDocument': 'hidden'},
    'appearance.json': {'theme': 'moonstone', 'cssTheme': '', 'enabledCssSnippets': [], 'showRibbon': False},
    'workspace.json': workspace,
    'community-plugins.json': [manifest['id']],
    'core-plugins.json': ['file-explorer', 'global-search', 'bookmarks', 'outline', 'command-palette', 'backlink']}
for name, data in configs.items():
    (vault / '.obsidian' / name).write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n')

output = ROOT / 'downloads' / f"shadcn-demo-{manifest['version']}.zip"
files = notes + [vault / '.obsidian' / name for name in configs] + [plugin / name for name in assets]
with zipfile.ZipFile(output, 'w', zipfile.ZIP_DEFLATED) as archive:
    for file in files:
        archive.write(file, 'Shadcn示例库/' + file.relative_to(vault).as_posix())
with zipfile.ZipFile(output) as archive:
    assert len(archive.namelist()) == 36
    assert not any('/.git/' in name or name.endswith('data.json') for name in archive.namelist())
    assert json.loads(archive.read(f"Shadcn示例库/.obsidian/plugins/{manifest['id']}/manifest.json"))['name'] == 'Shadcn'
print(output.name)
