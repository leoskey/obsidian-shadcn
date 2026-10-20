# Shadcn

由 **Clark Lei** 维护的 Obsidian 插件：一次安装，同时获得 Shadcn 风格外观和本地笔记列表，无需另装主题或 CSS 片段。

This Obsidian plugin combines a Shadcn-inspired appearance with a live local note list. Install one plugin, with no separate theme download.

## 真实应用截图

以下截图直接拍摄于 **Obsidian 1.8.7**，运行本仓库的 Shadcn 1.0.1 插件和公开示例笔记。

全部笔记：紧凑列表、标签、修改时间，以及搜索、筛选和新建入口。

![Shadcn 在真实 Obsidian 中的笔记列表](images/app-list.png)

项目正文：标题、提示块、表格和任务清单。

![Shadcn 在真实 Obsidian 中的项目笔记](images/app-note.png)

插件设置：显示名称 **Shadcn**，作者 **Clark Lei**。

![Obsidian 已安装的 Shadcn 插件](images/app-settings.png)

截图使用浅色模式，关闭行内标题和左侧功能区，左侧栏宽度为 265 px。这些配置已包含在下方的独立示例库中。

## 体验示例库

[下载完整示例库](https://github.com/leoskey/obsidian-shadcn/raw/refs/heads/main/downloads/shadcn-demo-1.0.1.zip)，解压后在 Obsidian 中选择「打开文件夹作为仓库」，打开 **Shadcn示例库**。按 Obsidian 提示允许社区插件，并启用 **Shadcn**，再打开「全部笔记」。

示例库已包含插件、演示配置和 **24 篇内容笔记**，分为项目、学习、阅读、生活、灵感和收件箱六类，另有首页和全部笔记入口。无需再单独下载主题或插件。

所有示例都是为本项目编写的公开内容，可以直接修改。Markdown 源文件位于 [examples/Shadcn示例库](examples/Shadcn示例库)。

## 功能

- 浅色与深色配色、简洁侧栏、紧凑笔记行、标签和最近修改日期。
- 搜索标题、目录和标签；按顶层目录筛选；默认顺序、名称和最近修改排序。
- 点击打开笔记；Command / Control 点击打开新标签页。
- 新建真实 Markdown 文件，拒绝覆盖同名文件。
- 笔记创建、修改、删除和重命名后自动刷新。
- 外观开关关闭后恢复当前主题，列表继续工作；停用插件会移除外观样式。
- 不发送网络请求，不包含遥测，不自动下载其他插件。

## 安装

目前尚未提交 Obsidian 社区目录审核，请手动安装：

1. [下载安装包](https://github.com/leoskey/obsidian-shadcn/raw/refs/heads/main/downloads/shadcn-1.0.1.zip)，解压出 `shadcn-workspace` 文件夹。
2. 将文件夹放入目标仓库的 `.obsidian/plugins/` 中。确认 `main.js`、`manifest.json`、`styles.css` 直接位于 `.obsidian/plugins/shadcn-workspace/`，避免多套一层目录。
3. 保存编辑内容，完全退出并重新打开 Obsidian。
4. 在「设置 → 第三方插件」按 Obsidian 提示允许社区插件，并启用 **Shadcn**。
5. 按 Command / Control P，运行 **Shadcn: 打开全部笔记**，或点击左侧工具栏的列表图标。

插件首次运行该命令时会创建 `全部笔记.md`。已存在的同名文件不会被覆盖；若文件里没有列表代码块，插件会提示手动添加。

如果只有仓库源码，可运行 `python3 scripts/build.py` 生成 ZIP，也可以直接复制根目录的 `main.js`、`manifest.json`、`styles.css` 和许可证文件。

建议使用 Obsidian 默认主题，外观选择「浅色」以接近参考图。其他主题的强制样式可能影响结果。设置中的 **启用 Shadcn 风格外观** 可单独关闭，插件不会改写外观配置或切换主题。

## 在自己的页面中插入列表

添加以下代码块，在阅读视图中查看：

````markdown
```shadcn-list
```
````

若需要宽版列表布局，在页面属性中添加 `cssclasses: [shadcn-list-page]`，可参考 `examples/全部笔记.md`。

列表排除当前列表页面、根目录的 `首页.md`，以及 `导航/` 和 `模板/` 下的笔记。目录筛选显示顶层目录；默认顺序沿用 Obsidian 返回顺序，不重新排序。无标签的笔记显示所属顶层目录，根目录笔记显示「笔记」。新建对话框默认提供「收件箱」目录，不存在时会在创建笔记时建立该目录。

日期使用设备的本地时区，表示文件最近修改时间。首次安装不会改动已有笔记内容或目录顺序。

## 开发与验证

无 npm 运行依赖或构建依赖；`main.js` 即插件源码。

```sh
node --check main.js
node tests/plugin.test.cjs
python3 scripts/build.py
python3 scripts/build_demo.py
```

最低支持版本为 Obsidian 1.8.7。桌面原生测试结果见 `TESTING.md`。移动端尚未实机验证。

`build_demo.py` 会重建仓库内示例库的演示配置并生成示例 ZIP；它只处理 `examples/Shadcn示例库`。

## 许可与署名

本项目采用 MIT 许可证。上游版权声明与许可证保留在 `vendor/LICENSE`，来源和修改说明见 `THIRD_PARTY_NOTICES.md`。

本项目是独立社区插件，所有笔记保存在本地仓库。
