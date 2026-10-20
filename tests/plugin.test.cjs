const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const notices = [];
class TFile {}
class Plugin {
  async loadData() { return this.saved; }
  async saveData(value) { this.saved = value; }
  registerEvent() {}
  addSettingTab(tab) { this.settingsTab = tab; }
  registerMarkdownCodeBlockProcessor() {}
  addCommand(command) { this.command = command; }
  addRibbonIcon() {}
}
const classes = new Set();
const document = { body: { classList: {
  toggle(name, value) { value ? classes.add(name) : classes.delete(name); },
  remove(name) { classes.delete(name); }
} } };
const events = {};
const context = {
  module: { exports: {} }, console, document, window: globalThis,
  require(name) {
    assert.equal(name, 'obsidian');
    return { Plugin, TFile, MarkdownRenderChild: class {}, Modal: class {},
      Notice: class { constructor(message) { notices.push(message); } },
      PluginSettingTab: class { constructor(app, plugin) { this.plugin = plugin; } },
      Setting: class {}, normalizePath: s => s.replace(/\/+/g, '/').replace(/^\//, ''),
      getAllTags: cache => cache.tags || [] };
  }
};
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(__dirname, '../main.js'), 'utf8') +
  '\nmodule.exports.helpers = { collectEntries, selectEntries, notePath };', context);
const PluginClass = context.module.exports;
const { collectEntries, selectEntries, notePath } = PluginClass.helpers;

(async () => {
  assert.equal(notePath(' New.md ', '学习'), '学习/New.md');
  for (const name of ['', '.', '..', '../secret', 'a/b', 'a\\b', 'a:b', 'a\0b']) {
    assert.throws(() => notePath(name, '学习'));
  }
  const files = ['全部笔记.md', '首页.md', '导航/目录.md', '模板/日记.md', '学习/Beta.md', '项目/Alpha.md']
    .map((p, i) => Object.assign(new TFile(), { path: p, basename: p.split('/').pop().slice(0, -3), stat: { mtime: i } }));
  const app = {
    vault: {
      getMarkdownFiles: () => files,
      getAbstractFileByPath: p => files.find(f => f.path === p),
      async read() { return 'Original content'; },
      async create(p, content) {
        assert(!files.some(f => f.path === p), 'must not overwrite');
        const file = Object.assign(new TFile(), { path: p, content });
        files.push(file); return file;
      }
    },
    metadataCache: { getFileCache: file => ({ tags: file.basename === 'Alpha' ? ['#test'] : [] }) },
    workspace: {
      on(name, handler) { events[name] = handler; return {}; },
      getLeaf: () => ({ async openFile(file) { app.opened = file; }, async setViewState(state) { app.view = state; } })
    }
  };
  const entries = collectEntries(app, '全部笔记.md');
  assert.equal(entries.length, 2);
  assert.equal(selectEntries(entries, 'TEST', '', 'none')[0].title, 'Alpha');
  assert.equal(selectEntries(entries, '', '学习', 'none')[0].title, 'Beta');
  assert.equal(selectEntries(entries, 'missing', '', 'none').length, 0);
  assert.equal(selectEntries(entries, '', '', 'name')[0].title, 'Alpha');
  assert.equal(selectEntries(entries, '', '', 'modified')[0].title, 'Alpha');
  assert.equal(entries[0].title, 'Beta', 'sorting must not mutate source order');

  const plugin = new PluginClass(); plugin.app = app;
  await plugin.onload();
  assert(classes.has('shadcn-workspace'));
  plugin.settings.enableAppearance = false; plugin.applyAppearance();
  assert(!classes.has('shadcn-workspace'));
  plugin.settings.enableAppearance = true; plugin.applyAppearance();
  await plugin.openAllNotes();
  assert.equal(files.length, 6, 'existing index must not be overwritten');
  assert(notices.some(x => x.includes('保持不变')));
  files.splice(0, 1);
  await plugin.openAllNotes();
  assert.equal(files.length, 6);
  assert(app.opened.content.includes('```shadcn-list'));
  assert.equal(app.view.state.mode, 'preview');
  await plugin.command.callback();
  assert.equal(files.length, 6, 'opening twice must not duplicate files');
  plugin.onunload();
  assert(!classes.has('shadcn-workspace'));
  console.log('Passed: filenames, filtering, sorting, appearance lifecycle, index creation and overwrite protection.');
})().catch(error => { console.error(error); process.exitCode = 1; });
