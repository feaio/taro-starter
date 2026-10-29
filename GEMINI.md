# GEMINI.md — 项目架构与 AI 开发指南

> **重要说明**：本文件为 Gemini / Antigravity 在每次新会话开始时的必读上下文文档（详细完整版同步见 [AGENTS.md](./AGENTS.md)）。修改或新增功能前请直接参考本文档，无需重复全量扫描项目结构。

---

## 1. 核心架构速览

- **技术栈**：Taro `4.3.1` + React `18.3.1` + TypeScript `6.x`（Vite `4.x` / `@tarojs/vite-runner` 编译）+ UnoCSS (`@unocss/vite` + `unocss-applet`) + `@taroify/core` `1.0.x` + Zustand + React Query v5。
- **环境变量（`.env.*`）**：
  - 通过 `--env-prefix TARO_` 注入 `process.env.TARO_API_BASE_URL` 和 `process.env.TARO_S3_BASE_URL`。
  - **切勿**在 `src/` 下读取未在 `.env` 定义的 `process.env.XXX`（小程序端无全局 `process` 对象）。
- **S3 资源与图片组件**：
  - `src/utils/s3.ts` 提供 `resolveS3Url(url)`（别名 `getS3Url`），自动将相对路径拼接为完整 `TARO_S3_BASE_URL` 地址，对已是 `http(s)://`、`data:`、`wxfile://` 的完整地址原样返回。
  - `src/components/S3Image/index.tsx` 提供 `<S3Image />` 组件，Props 与 Taro 原生 `<Image />` 完全一致，同时支持 S3 相对路径与普通图片地址。
- **请求与认证（`src/utils/httpClient/`）**：
  - 无 `refresh_token`，采用 `ensureLoginWithQueue()` 单飞队列（`src/utils/httpClient/auth/requestQueue.ts`）保证并发请求等待唯一一次 `wx.login -> /auth/login`。
  - 白名单默认含 `/auth/login`，支持 `addApiWhitelist()` 或请求配置 `{ noAuth: true }`。
  - 接口返回 `401` 时自动触发 `handle401AndRetry()` 重新登录并重放原请求。
- **会员状态与动作拦截**：
  - 全局状态在 `src/store/useAuthStore.ts`（`accessToken`, `isMember`, `account`）。
  - 页面按钮/操作使用 `withMemberAuth(fn)`（`src/utils/memberGuard.ts`）拦截非会员并跳转 `/pages/login/index`（支持 `redirect` 与 `shouldReturn` 参数）。
- **页面布局与安全区**：
  - 统一使用 `src/components/PageWrapper`（别名 `src/components/Layout`），默认含 `h-full w-full`、顶部 `NavBar` 与底部 `BottomBar`。
  - 顶部导航与底部安全区高度计算统一在 `src/utils/safeArea.ts`（`getNavBarSafeHeight`、`getBottomSafeAreaHeight`，含内存级单例缓存）。
  - 底部导航栏 `src/components/BottomBar/index.tsx` 支持 3 或 4 个 Tab（默认：首页、在线课程、培训计划、我的），仅在 `TAB_BAR_ROUTES`（`src/constants/routes.ts`）配置的页面显示。
  - 分包配置在 `src/app.config.ts` 的 `subPackages` 中（如 `pages/course` 分包下的 `messages/index` 我的消息页，消息状态存储在 `src/store/useMessageStore.ts`）。
- **防循环依赖**：
  - `src/cache.ts` 必须直接从 `~/utils/cache` 导入 `createCache`，禁止从 `~/utils` 聚合入口导入。
