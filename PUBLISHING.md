# Shadcn 发布准备

## GitHub Release 与 BRAT

当前版本为 **1.0.1**。发布标题、标签和 `manifest.json` 版本统一使用 `1.0.1`，不添加 `v` 前缀。

发布附件：

- `main.js`、`manifest.json`、`styles.css`：Obsidian / BRAT 安装所需的标准文件。
- `LICENSE`、`THIRD_PARTY_NOTICES.md`：许可与来源说明。MIT 版权声明也嵌入 `styles.css`，保证 BRAT 的三个文件中包含许可证。
- `shadcn-1.0.1.zip`：手动安装包。
- `shadcn-demo-1.0.1.zip`：含 24 篇笔记、两个入口页面、插件和演示配置的完整示例库。
- `SHA256SUMS.txt`：上述七个附件的校验值。

本地准备：

```sh
node --check main.js
node tests/plugin.test.cjs
python3 scripts/prepare_release.py
```

输出位于 `dist/release-1.0.1/`。该目录不提交到 Git。

仓库的 **Prepare release draft** 工作流会在版本标签推送后检查版本、执行测试、重新构建文件并创建草稿。也可从 Actions 页面手动运行。工作流只写入草稿，拒绝覆盖已经正式发布的版本。

检查 [Releases 页面](https://github.com/leoskey/obsidian-shadcn/releases) 的版本和附件，确认后选择 **Publish release**。草稿期间，公众和 BRAT 无法下载这些 Release 附件。正式发布后，可在 BRAT 中添加 `leoskey/obsidian-shadcn`。

参考：[Obsidian 发布说明](https://docs.obsidian.md/Plugins/Releasing/Submit%20your%20plugin)、[BRAT 开发者指南](https://github.com/TfTHacker/obsidian42-brat/blob/main/BRAT-DEVELOPER-GUIDE.md)。

## 社区商店提交材料

仓库地址：`https://github.com/leoskey/obsidian-shadcn`

| 字段 | 内容 |
| --- | --- |
| ID | `shadcn-workspace` |
| 名称 | Shadcn |
| 作者 | Clark Lei |
| 版本 | 1.0.1 |
| 最低 Obsidian 版本 | 1.8.7 |
| 描述 | Browse local notes with search, folder filters, sorting, and an optional Shadcn-inspired appearance. |
| 平台 | 插件使用 Obsidian 与 Web API；已验证 macOS，移动端尚未实机验证。 |
| 许可 | MIT；保留上游版权声明。 |

正式提交前需处理：

1. 正式发布标准 GitHub Release，使三个安装附件可公开下载。
2. 2026-10-20 已核对 Obsidian 官方插件索引，未发现同名 Shadcn 或同 ID `shadcn-workspace` 的条目；最终提交时仍需由社区目录确认可用性。
3. 现有样式继承了第三方主题代码，来源见 `THIRD_PARTY_NOTICES.md`。MIT 许可允许分发，但社区目录另有更严格的 fork 规则；提交前需确认该规则对本项目的适用情况，必要时取得符合规则的公开许可或改用独立实现。当前不能据此声明社区审核已通过或必然可上架。
4. 发布者登录 Obsidian Community 并连接自己的 GitHub 账号，确认维护承诺后提交仓库。本文档不表示已经提交。

参考：[社区目录设置与提交](https://docs.obsidian.md/community-directory/set-up-and-claim)、[开发者政策与 fork 规则](https://docs.obsidian.md/community-directory/developer-policies)。
