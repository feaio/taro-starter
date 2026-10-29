---
name: taroify
description: Taroify (@taroify/core & @taroify/icons) UI 组件库文档与使用指南。当在项目中编写、修改或排查 Taroify 组件（如 Button、Popup、Dialog、Field、Form、Tabs、Toast 等）或定制主题样式时使用。
---

# Taroify 组件库使用指南

本项目已将 Taroify 官方 AI 文档持久化在仓库本地目录 `docs/taroify/` 中：

- **索引文件（优先读取）**：`docs/taroify/llms.txt`（在线地址：`https://taroify.com/llms.txt`）
  - 包含所有指南、70+ 组件、Hooks 的分类列表及对应的 `.md` 文档链接。
- **全量离线文档（按需检索）**：`docs/taroify/llms-full.txt`（在线地址：`https://taroify.com/llms-full.txt`）
  - 单文件汇总全部 Taroify 文档，每个章节以 `url: https://taroify.com/components/<component-name>/index.md` 分隔。

## 推荐检索流程（节省上下文）

1. **先读索引**：查看 `docs/taroify/llms.txt`，确认目标组件名称与对应的文档 URL（如 `https://taroify.com/components/popup/index.md`）。
2. **精准定位全量文档**：
   - 使用 `grep -n "url: https://taroify.com/components/<name>/index.md" docs/taroify/llms-full.txt` 找到对应组件的起始行号，再按行号范围读取该组件的 Props、Events、子组件（如 `Popup.Backdrop`）与 CSS 变量说明；
   - 或直接在线读取单页 Markdown（如 `https://taroify.com/components/<name>/index.md`）。
3. **不要一次性全量读取 `docs/taroify/llms-full.txt`**（约 1.8 万行），请始终通过 `grep` 定位具体组件章节后按需读取。

## 本项目 Taroify 集成约定

1. **自动按需引入样式（无需手动 import style）**：
   - `config/index.ts` 已按官方 Vite 指南配置 `vite-plugin-style-import`（`createStyleImportPlugin`），自动解析 `@taroify/core/${name}/style/index.js`（开启 `ensureStyleFile: true`）与 `@taroify/icons/style`。
   - 在业务代码中直接导入组件即可：
     ```tsx
     import { Button, Popup } from "@taroify/core";
     ```
2. **更新本地离线文档**：
   - 当升级 `@taroify/core` 版本后，可运行 `pnpm docs:taroify` 重新拉取最新的 `llms.txt` 与 `llms-full.txt`。
