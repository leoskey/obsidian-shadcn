# 1.0.1

Shadcn 首个标准发行包，由 Clark Lei 维护。

- 一次安装，获得内置外观与实时本地笔记列表。
- 搜索标题、目录和标签，按目录筛选，选择默认顺序、名称或最近修改排序。
- 打开、新建真实 Markdown 文件；同名文件不覆盖。
- 外观可以单独关闭；不联网、不采集遥测。
- 完整示例库包含 24 篇内容笔记、首页、列表入口、插件与演示配置。

## 安装

正式发布后，可在 BRAT 中添加 `leoskey/obsidian-shadcn` 并启用 Shadcn。

手动安装：下载 `shadcn-1.0.1.zip`，将其中的 `shadcn-workspace` 文件夹放入目标库的 `.obsidian/plugins/`，重启 Obsidian 后启用 Shadcn。

完整体验：下载 `shadcn-demo-1.0.1.zip`，解压后将「Shadcn示例库」作为仓库打开，按提示允许社区插件并启用 Shadcn。

BRAT 与 Obsidian 使用的标准附件为 `main.js`、`manifest.json`、`styles.css`。`SHA256SUMS.txt` 提供其余七个附件的 SHA-256 校验值。

## 兼容与验证

最低版本为 Obsidian 1.8.7。已验证 macOS 上真实应用中的列表、搜索、筛选、新建、同名保护、外观开关和卸载清理；移动端和其他主题组合尚未实机验证。

## 许可

MIT。版权声明已嵌入 `styles.css`，另附 `LICENSE` 和 `THIRD_PARTY_NOTICES.md`。
