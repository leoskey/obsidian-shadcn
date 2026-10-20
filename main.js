const { Plugin, MarkdownRenderChild, Modal, Notice, setIcon, getAllTags, normalizePath, PluginSettingTab, Setting, TFile } = require('obsidian');

function collectEntries(app, sourcePath) {
  return app.vault.getMarkdownFiles()
    .filter(file => file.path !== sourcePath && file.path !== '首页.md' && !/^(导航|模板)\//.test(file.path))
    .map(file => {
      const cache = app.metadataCache.getFileCache(file) || {};
      const folder = file.path.includes('/') ? file.path.split('/')[0] : '笔记';
      const tags = (getAllTags(cache) || []).map(tag => tag.replace(/^#/, ''));
      return { file, title: file.basename, folder, tags, mtime: file.stat.mtime };
    });
}

function selectEntries(entries, query, folder, sort) {
  const search = query.trim().toLocaleLowerCase();
  const selected = entries.filter(entry => (!folder || entry.folder === folder) &&
    (!search || [entry.title, entry.folder, ...entry.tags].join(' ').toLocaleLowerCase().includes(search)));
  if (sort === 'name') selected.sort((a, b) => a.title.localeCompare(b.title, 'zh-CN'));
  if (sort === 'modified') selected.sort((a, b) => b.mtime - a.mtime);
  return selected;
}

function notePath(title, folder) {
  const name = title.trim().replace(/\.md$/i, '');
  if (!name || name === '.' || name === '..' || /[\\/:*?"<>|\u0000-\u001f]/.test(name)) {
    throw new Error('请填写有效名称，不包含斜杠、冒号等文件名符号。');
  }
  return normalizePath(`${folder}/${name}.md`);
}

class NewNoteModal extends Modal {
  constructor(app, folders) { super(app); this.folders = folders; }
  onOpen() {
    this.titleEl.setText('新建笔记');
    const form = this.contentEl.createEl('form', { cls: 'shadcn-new-note-form' });
    const nameLabel = form.createEl('label', { text: '名称' });
    const input = nameLabel.createEl('input', { type: 'text', attr: { placeholder: '未命名笔记', required: 'true', autocomplete: 'off' } });
    const folderLabel = form.createEl('label', { text: '目录' });
    const select = folderLabel.createEl('select');
    for (const folder of ['收件箱', ...this.folders.filter(x => x !== '收件箱')]) {
      select.createEl('option', { text: folder, attr: { value: folder } });
    }
    const button = form.createEl('button', { text: '创建并打开', type: 'submit', cls: 'mod-cta' });
    form.addEventListener('submit', async event => {
      event.preventDefault(); button.disabled = true;
      try {
        const target = notePath(input.value, select.value);
        if (this.app.vault.getAbstractFileByPath(target)) throw new Error('这个目录中已存在同名笔记。');
        if (!this.app.vault.getAbstractFileByPath(select.value)) await this.app.vault.createFolder(select.value);
        const name = target.split('/').pop().replace(/\.md$/, '');
        const file = await this.app.vault.create(target, `---\n类型: 笔记\ncssclasses: [shadcn-page]\n---\n\n# ${name}\n\n`);
        await this.app.workspace.getLeaf(false).openFile(file);
        this.close();
      } catch (error) { new Notice(error.message || '创建失败，请检查目录。'); button.disabled = false; }
    });
    window.setTimeout(() => input.focus(), 0);
  }
  onClose() { this.contentEl.empty(); }
}

class NoteList extends MarkdownRenderChild {
  constructor(app, element, sourcePath) {
    super(element); this.app = app; this.sourcePath = sourcePath;
    this.query = ''; this.folder = ''; this.sort = 'none'; this.timer = null;
  }
  onload() {
    const el = this.containerEl; el.addClass('shadcn-note-database');
    const toolbar = el.createDiv({ cls: 'shadcn-list-toolbar' });
    const tab = toolbar.createDiv({ cls: 'shadcn-list-tab' });
    setIcon(tab.createSpan({ cls: 'shadcn-control-icon' }), 'list');
    tab.createSpan({ text: '列表' });
    const tools = toolbar.createDiv({ cls: 'shadcn-list-tools' });
    const filter = tools.createEl('button', { text: '筛选', cls: 'shadcn-text-control', attr: { 'aria-expanded': 'false' } });
    const sort = tools.createEl('button', { text: '排序', cls: 'shadcn-text-control', attr: { 'aria-expanded': 'false' } });
    const search = tools.createEl('button', { cls: 'shadcn-icon-control', attr: { 'aria-label': '搜索笔记', 'aria-expanded': 'false' } });
    setIcon(search, 'search');
    const add = tools.createEl('button', { text: '新建', cls: 'shadcn-add-note mod-cta' });
    const controls = el.createDiv({ cls: 'shadcn-list-filters' }); controls.hidden = true;
    const folderLabel = controls.createEl('label', { text: '目录' });
    const folder = folderLabel.createEl('select', { attr: { 'aria-label': '按目录筛选' } });
    folder.createEl('option', { text: '全部目录', attr: { value: '' } });
    this.folderSelect = folder;
    const sortLabel = controls.createEl('label', { text: '排序' });
    const order = sortLabel.createEl('select', { attr: { 'aria-label': '笔记排序' } });
    for (const [value, text] of [['none', '默认顺序'], ['name', '名称'], ['modified', '最近修改']]) order.createEl('option', { text, attr: { value } });
    const searchBox = el.createDiv({ cls: 'shadcn-list-search' }); searchBox.hidden = true;
    const input = searchBox.createEl('input', { type: 'search', attr: { placeholder: '搜索标题、目录或标签…', 'aria-label': '搜索标题、目录或标签' } });
    this.rows = el.createDiv({ cls: 'shadcn-list-rows' });
    this.count = el.createDiv({ cls: 'shadcn-list-count', attr: { 'aria-live': 'polite' } });
    const toggle = event => {
      event.preventDefault(); controls.hidden = !controls.hidden;
      filter.setAttribute('aria-expanded', String(!controls.hidden)); sort.setAttribute('aria-expanded', String(!controls.hidden));
      if (!controls.hidden) (event.currentTarget === sort ? order : folder).focus();
    };
    this.registerDomEvent(filter, 'click', toggle);
    this.registerDomEvent(sort, 'click', toggle);
    this.registerDomEvent(folder, 'change', () => { this.folder = folder.value; this.renderRows(); });
    this.registerDomEvent(order, 'change', () => { this.sort = order.value; this.renderRows(); });
    this.registerDomEvent(search, 'click', () => {
      searchBox.hidden = !searchBox.hidden; search.setAttribute('aria-expanded', String(!searchBox.hidden));
      if (!searchBox.hidden) input.focus();
      else { input.value = ''; this.query = ''; this.renderRows(); }
    });
    this.registerDomEvent(input, 'input', () => { this.query = input.value; this.renderRows(); });
    this.registerDomEvent(input, 'keydown', event => {
      if (event.key === 'Escape') { input.value = ''; this.query = ''; this.renderRows(); }
    });
    this.registerDomEvent(add, 'click', () => new NewNoteModal(this.app, this.folders()).open());
    const update = () => { window.clearTimeout(this.timer); this.timer = window.setTimeout(() => this.renderRows(), 180); };
    for (const event of ['create', 'delete', 'rename', 'modify']) this.registerEvent(this.app.vault.on(event, update));
    this.registerEvent(this.app.metadataCache.on('changed', update));
    this.renderRows();
  }
  folders() { return [...new Set(collectEntries(this.app, this.sourcePath).map(entry => entry.folder))]; }
  renderRows() {
    if (!this.rows) return;
    const entries = collectEntries(this.app, this.sourcePath);
    const folders = [...new Set(entries.map(entry => entry.folder))];
    if (this.folder && !folders.includes(this.folder)) this.folder = '';
    this.folderSelect.empty(); this.folderSelect.createEl('option', { text: '全部目录', attr: { value: '' } });
    for (const folder of folders) this.folderSelect.createEl('option', { text: folder, attr: { value: folder } });
    this.folderSelect.value = this.folder;
    const selected = selectEntries(entries, this.query, this.folder, this.sort);
    this.rows.empty();
    for (const entry of selected) {
      const row = this.rows.createDiv({ cls: 'shadcn-note-row' });
      const link = row.createEl('a', { cls: 'shadcn-note-title internal-link', href: entry.file.path, attr: { 'data-href': entry.file.path } });
      setIcon(link.createSpan({ cls: 'shadcn-page-icon' }), 'file-text');
      link.createSpan({ cls: 'shadcn-note-name', text: entry.title });
      link.addEventListener('click', event => {
        event.preventDefault(); event.stopPropagation();
        this.app.workspace.getLeaf(event.metaKey || event.ctrlKey).openFile(entry.file);
      });
      const tags = row.createDiv({ cls: 'shadcn-note-tags' });
      for (const tag of (entry.tags.length ? entry.tags : [entry.folder]).slice(0, 2)) tags.createSpan({ cls: 'shadcn-gray-tag', text: tag });
      const date = new Date(entry.mtime);
      row.createEl('time', { cls: 'shadcn-note-date', text: new Intl.DateTimeFormat('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false }).format(date), attr: { datetime: date.toISOString(), title: '最近修改时间' } });
    }
    if (!selected.length) this.rows.createDiv({ cls: 'shadcn-list-empty', text: '没有匹配的笔记。试试其他目录或关键词。' });
    this.count.setText(`${selected.length} 篇笔记${selected.length !== entries.length ? ` / 共 ${entries.length} 篇` : ''}`);
  }
  onunload() { window.clearTimeout(this.timer); }
}

class WorkspaceSettings extends PluginSettingTab {
  constructor(app, plugin) { super(app, plugin); this.plugin = plugin; }
  display() {
    this.containerEl.empty();
    new Setting(this.containerEl)
      .setName('启用 Shadcn 风格外观')
      .setDesc('应用内置配色与排版。关闭后恢复当前主题，笔记列表仍可使用。')
      .addToggle(toggle => toggle.setValue(this.plugin.settings.enableAppearance).onChange(async value => {
        this.plugin.settings.enableAppearance = value;
        this.plugin.applyAppearance();
        await this.plugin.saveData(this.plugin.settings);
      }));
  }
}

module.exports = class ShadcnWorkspace extends Plugin {
  async onload() {
    this.settings = Object.assign({ enableAppearance: true }, await this.loadData());
    this.documents = new Set([document]);
    this.applyAppearance();
    this.registerEvent(this.app.workspace.on('window-open', win => {
      this.documents.add(win.doc);
      this.applyAppearance();
    }));
    this.registerEvent(this.app.workspace.on('window-close', win => this.documents.delete(win.doc)));
    this.addSettingTab(new WorkspaceSettings(this.app, this));
    this.registerMarkdownCodeBlockProcessor('shadcn-list', (_source, el, ctx) => {
      ctx.addChild(new NoteList(this.app, el, ctx.sourcePath));
    });
    const open = () => this.openAllNotes();
    this.addCommand({ id: 'open-all-notes', name: '打开全部笔记', callback: open });
    this.addRibbonIcon('list', '打开全部笔记', open);
  }
  applyAppearance() {
    for (const doc of this.documents) doc.body.classList.toggle('shadcn-workspace', this.settings.enableAppearance);
  }
  async openAllNotes() {
    try {
      const path = '全部笔记.md';
      let file = this.app.vault.getAbstractFileByPath(path);
      if (file && !(file instanceof TFile)) throw new Error('全部笔记.md 已被目录占用。');
      if (!file) {
        file = await this.app.vault.create(path, '---\ncssclasses: [shadcn-list-page]\n---\n\n# 全部笔记\n\n```shadcn-list\n```\n');
      } else if (!(await this.app.vault.read(file)).includes('```shadcn-list')) {
        new Notice('已有“全部笔记”文件，内容保持不变。可在其中添加 shadcn-list 代码块。');
      }
      const leaf = this.app.workspace.getLeaf(false);
      await leaf.openFile(file);
      await leaf.setViewState({ type: 'markdown', state: { file: file.path, mode: 'preview' } });
    } catch (error) { new Notice(error.message || '无法打开笔记列表。'); }
  }
  onunload() {
    for (const doc of this.documents) doc.body.classList.remove('shadcn-workspace');
    this.documents.clear();
  }
};
