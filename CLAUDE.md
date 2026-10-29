# CLAUDE.md — 项目架构与 AI 开发指南

> **重要说明**：本文件与 [AGENTS.md](./AGENTS.md) 保持同步，为 AI 助手在每次新会话开始时的必读上下文文档。修改或新增功能前请直接参考本文档，无需重复全量扫描项目结构。

---

## 1. 技术栈概览

- **核心框架**：Taro `4.3.1` + React `18.3.1` + TypeScript `6.x`（Vite `4.x` / `@tarojs/vite-runner` 编译）
- **样式方案**：UnoCSS（`@unocss/vite` + `unocss-applet` 小程序预设，支持 `rem2rpx` 自动转换 + Tabler/MDI/LineMD/Iconamoon 图标集）+ Sass + `@taroify/core` `1.0.x` 组件库（通过 `vite-plugin-style-import` 按需引入样式）
- **状态管理**：
  - **客户端全局状态**：`zustand`（`src/store/`）+ 本地/内存双层缓存 `cache`（`src/cache.ts`）
  - **服务端状态**：`@tanstack/react-query` v5（`src/lib/react-query.ts`）
- **包管理器**：强制使用 `pnpm`

---

## 2. 目录结构与核心模块索引

```text
├── .env / .env.development / .env.test / .env.production  # 环境配置文件（通过 --env-prefix TARO_ 注入）
├── config/
│   ├── index.ts              # Taro Vite 编译配置（UnoCSS、vite-plugin-style-import、taroViteCompatPlugin）
│   ├── dev.ts / prod.ts      # 开发/生产构建合并项（dev.ts 开启 mini.debugReact: true 兼容 React 18 开发态）
├── docs/
│   └── taroify/              # Taroify 官方 AI 文档持久化目录（pnpm docs:taroify 更新）
│       ├── llms.txt          # 轻量文档索引（指南、组件、Hooks 列表与单页 .md 地址）
│       └── llms-full.txt     # 全量离线文档合集（按 url: https://taroify.com/components/<name>/index.md 检索）
├── script/
│   └── ci/
│       ├── upload.ts         # 微信小程序 CI 自动构建、上传与企微 Webhook 通知脚本（pnpm ci:upload）
│       └── README.md         # CI 脚本使用说明
├── skills/
│   └── taroify/SKILL.md      # Taroify 组件库 AI Skill 说明
├── docs/
│   └── taroify/              # Taroify 官方 AI 文档持久化目录（pnpm docs:taroify 更新）
│       ├── llms.txt          # 轻量文档索引（指南、组件、Hooks 列表与单页 .md 地址）
│       └── llms-full.txt     # 全量离线文档合集（按 url: https://taroify.com/components/<name>/index.md 检索）
├── skills/
│   └── taroify/SKILL.md      # Taroify 组件库 AI Skill 说明
├── src/
│   ├── app.config.ts         # Taro 全局配置（pages 主包注册、subPackages 分包注册、preloadRule、custom 导航栏、custom tabBar）
│   ├── app.tsx               # 应用入口（QueryClientProvider、启动时触发全局登录队列）
│   ├── cache.ts              # 内存 (RAM) + 本地存储 (Storage) 强类型缓存实例
│   ├── api/
│   │   ├── core/             # createApi 工厂与 React Query queryKeys
│   │   ├── endpoints/        # 模块化 API 端点定义（user.ts, wechat.ts）
│   │   ├── hooks/            # React Query 业务 Hooks（useUser.ts, useWechat.ts）
│   │   ├── models/           # 领域与接口数据模型类型
│   │   ├── wechat.ts         # 微信登录接口（POST /auth/login）
│   │   └── mockAuth.ts       # 会员注册等 Mock 接口（mockRegisterMemberApi）
│   ├── components/
│   │   ├── PageWrapper/      # 全局页面布局容器（Layout），默认自带 h-full w-full，内置顶部 NavBar 与底部 BottomBar
│   │   ├── Layout/           # PageWrapper 的别名导出
│   │   ├── NavBar/           # 顶部导航栏独立导出入口
│   │   ├── BottomBar/        # 底部贴底导航栏（支持 3 或 4 个 Tab 项，含底部安全区适配与未读红点）
│   │   ├── PrivacyPolicyPopup/ # 隐私保护指引弹窗组件（基于 @taroify/core Popup）
│   │   └── S3Image/          # S3/普通图片兼容组件（Props 与 Taro 原生 Image 完全一致，内部自动调用 resolveS3Url）
│   ├── constants/
│   │   ├── routes.ts         # RouteNames 枚举、PAGES 路径映射、TAB_BAR_ROUTES 底部导航路由集合
│   │   └── routeTypes.ts     # 各路由的强类型参数定义 RouteParamConfig
│   ├── pages/
│   │   ├── index/            # 首页（Tab 1）
│   │   ├── online-courses/   # 在线课程（Tab 2）
│   │   ├── training-plan/    # 培训计划（Tab 3）
│   │   ├── profile/          # 我的/个人中心（Tab 4，含任职轮播、学习地图、更改密码与消息入口）
│   │   ├── course/           # course 分包（root: "pages/course"）
│   │   │   └── messages/     # 分包页面：我的消息（/pages/course/messages/index）
│   │   ├── login/            # 独立会员登录/注册页（支持 redirect 重定向与 shouldReturn 返回控制）
│   │   └── agreements/       # 隐私政策与用户协议页
│   ├── store/
│   │   ├── useAuthStore.ts   # Zustand 全局认证与会员状态 Store（accessToken, isLoginCompleted, isMember, account）
│   │   └── useMessageStore.ts # Zustand 全局消息状态 Store（我的消息列表、单条已读、一键已读与未读数统计）
│   └── utils/
│       ├── httpClient/
│       │   ├── index.ts      # 统一请求出口（http.get/post/put/delete/patch, request, createFetch）与 401 自动重放
│       │   ├── apiClient.ts  # 底层 Taro.request 封装（识别 code === 200 及 401/403 错误）
│       │   ├── constants.ts  # 环境域名映射（读取 process.env.TARO_API_BASE_URL / TARO_S3_BASE_URL）
│       │   └── auth/
│       │       ├── requestQueue.ts # API 白名单管理 + 单飞登录等待队列（ensureLoginWithQueue）
│       │       ├── interceptor.ts  # 请求头 Bearer Token 注入与 handle401AndRetry
│       │       └── index.ts        # saveAuthData 同步写入 Store 与 Cache
│       ├── s3.ts             # S3 地址拼接工具函数（resolveS3Url / getS3Url / getS3BaseUrl）
│       ├── safeArea.ts       # 顶部导航栏安全高度 getNavBarSafeHeight() 与底部安全区域高度 getBottomSafeAreaHeight()（带内存级单例缓存）
│       ├── memberGuard.ts    # 全局非会员动作拦截器（withMemberAuth / checkMemberOrRedirect）
│       ├── route.ts          # 类型安全的路由跳转封装（navigateTo / redirectTo / switchTab / navigateBack / reLaunch）
│       └── env.ts            # 系统信息缓存与小程序运行环境检测
```

---

## 3. 核心机制与架构约定（修改代码必看）

- **环境配置与启动命令**：
  - `pnpm dev:weapp`（默认读取 `.env.development`）、`pnpm dev:weapp --mode test`（读取 `.env.test`）、`pnpm build:weapp`（读取 `.env.production`）、`pnpm ci:upload`（自动构建并上传微信小程序）。
  - **严禁在 `src/` 业务代码中访问未在 `.env` 中定义的 `process.env.XXX` 变量**，否则编译后在小程序端会报 `ReferenceError: process is not defined`。
- **全局登录队列与 401 自动重登（无 `refresh_token`）**：
  - 所有非白名单 API 请求通过 `src/utils/httpClient/auth/requestQueue.ts` 的 `ensureLoginWithQueue()` 单飞队列等待 `wx.login -> /auth/login` 完成，自动注入 `Authorization: Bearer <access_token>`。
  - 遇到 `401` 时自动通过 `handle401AndRetry()` 重新登录并重放原请求一次。
- **会员拦截与独立登录页**：
  - 使用 `withMemberAuth(fn)`（`src/utils/memberGuard.ts`）包裹需要会员权限的操作，非会员自动跳转至 `/pages/login/index` 并支持登录成功后重定向或返回原页面。
- **全局布局与安全区**：
  - 页面统一使用 `<PageWrapper navTitle="...">`（或 `<Layout>`），默认自带 `h-full w-full`。
  - 顶部导航安全高度使用 `getNavBarSafeHeight()`，底部安全高度使用 `getBottomSafeAreaHeight()`（`src/utils/safeArea.ts`）。
  - 底部 `BottomBar` 支持 3 或 4 个导航项，仅在 `TAB_BAR_ROUTES` 指定的页面展示。
- **防循环依赖**：
  - `src/cache.ts` 必须直接 `import createCache from "~/utils/cache"`，严禁从 `~/utils` 聚合入口导入。
- **Taroify 组件库与本地 LLMs 文档检索**：
  - 使用 `@taroify/core` 组件前，先查阅 `docs/taroify/llms.txt` 索引，再用 `grep -n "url: https://taroify.com/components/<name>/index.md" docs/taroify/llms-full.txt` 定位行号并按需读取对应组件章节（详见 `skills/taroify/SKILL.md`）。
  - `config/index.ts` 已通过 `vite-plugin-style-import` 自动按需注入 `@taroify/core` 与 `@taroify/icons` 样式，业务代码中直接导入组件即可。
