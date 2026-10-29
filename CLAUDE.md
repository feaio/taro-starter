# AGENTS.md — 项目架构与 AI 开发指南

> **重要说明**：本文件为 AI 助手（Claude / Gemini / Cursor 等）在每次新会话开始时的必读上下文文档。修改或新增功能前请直接参考本文档，无需重复全量扫描项目结构。

---

## 1. 技术栈概览

- **核心框架**：Taro `4.2.0` + React `18.3` + TypeScript `6.x`（Webpack 5 编译）
- **样式方案**：UnoCSS（`unocss-applet` 小程序预设，支持 `rem2rpx` 自动转换 + Tabler/MDI/LineMD/Iconamoon 图标集）+ Sass + `@taroify/core` 组件库
- **状态管理**：
  - **客户端全局状态**：`zustand`（`src/store/`）+ 本地/内存双层缓存 `cache`（`src/cache.ts`）
  - **服务端状态**：`@tanstack/react-query` v5（`src/lib/react-query.ts`）
- **包管理器**：强制使用 `pnpm`

---

## 2. 目录结构与核心模块索引

```text
├── .env / .env.development / .env.test / .env.production  # 环境配置文件（通过 --env-prefix TARO_ 注入）
├── config/
│   ├── index.ts              # Taro Webpack5 编译配置（使用 defineConfig<"webpack5">）
│   ├── dev.ts / prod.ts      # 开发/生产构建合并项
├── src/
│   ├── app.config.ts         # Taro 全局配置（pages 主包注册、subPackages 分包注册、custom 导航栏、custom tabBar）
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
│   │   └── BottomBar/        # 底部贴底导航栏（支持 3 或 4 个 Tab 项，含底部安全区适配）
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
│       ├── safeArea.ts       # 顶部导航栏安全高度 getNavBarSafeHeight() 与底部安全区域高度 getBottomSafeAreaHeight()
│       ├── memberGuard.ts    # 全局非会员动作拦截器（withMemberAuth / checkMemberOrRedirect）
│       ├── route.ts          # 类型安全的路由跳转封装（navigateTo / redirectTo / switchTab / navigateBack / reLaunch）
│       └── env.ts            # 系统信息缓存与小程序运行环境检测
```

---

## 3. 核心机制与架构约定（修改代码必看）

### 3.1 环境配置与启动命令

- 启动脚本通过 `--mode` 自动读取对应 `.env.[mode]` 文件中以 `TARO_` 开头的变量：
  - `pnpm dev:weapp` → 默认 `development` 模式，读取 `.env.development`
  - `pnpm dev:weapp --mode test` → `test` 模式，读取 `.env.test`
  - `pnpm dev:weapp --mode production` 或 `pnpm build:weapp` → `production` 模式，读取 `.env.production`
- **严禁在 `src/` 业务代码中访问未在 `.env` 中定义的 `process.env.XXX` 变量**：
  - 小程序运行时没有 Node.js 的全局 `process` 对象，Babel 仅在编译期静态替换已声明的环境变量（`NODE_ENV`、`TARO_ENV`、`TARO_API_BASE_URL`、`TARO_S3_BASE_URL`）。若访问未定义的 `process.env.FOO`，编译后保留 `process.env.FOO` 会在小程序端触发 `ReferenceError: process is not defined`。

### 3.2 全局登录队列与 401 自动重登（无 `refresh_token`）

- **无 `refresh_token` 设计**：项目仅使用 `wx.login()` 获取 `code` 调用 `POST /auth/login` 换取 `access_token`。
- **单飞请求队列（`src/utils/httpClient/auth/requestQueue.ts`）**：
  - 所有非白名单 API 请求在进入 `authInterceptor` 时会调用 `ensureLoginWithQueue()`。
  - 若当前尚未登录或正在登录中，并发请求全部进入 `retryQueue` 挂起等待，全局仅发起**唯一一次** `Taro.login() -> /auth/login`，成功后唤醒所有挂起请求并注入 `Authorization: Bearer <access_token>`。
  - **API 白名单**：默认包含 `/auth/login`，可通过 `addApiWhitelist()` 动态添加，或在 `createFetch` / `http.request` 中传入 `{ noAuth: true }` 直接放行。
- **401 自动重登重放（`src/utils/httpClient/index.ts`）**：
  - 当业务请求返回 `401` 时，`request` 自动调用 `handle401AndRetry()`（即 `ensureLoginWithQueue(true)`），清除旧 Token 并重新执行 `wx.login -> /auth/login`，随后使用新 Token 自动重放原请求一次（`retryCount < 1`）。

### 3.3 会员状态与全局点击/动作拦截

- **状态存储**：`useAuthStore`（`src/store/useAuthStore.ts`）维护 `accessToken`、`isMember`、`account`，并与 `src/cache.ts` 同步持久化。
- **非会员拦截器（`src/utils/memberGuard.ts`）**：
  - 使用 `withMemberAuth(fn, options)` 包裹需要会员权限的点击回调或业务函数（参考 `src/pages/profile/index.tsx`）。
  - 当 `isMember === false` 时，自动拦截并跳转至 `/pages/login/index`，同时携带当前页面路径作为 `redirect` 参数。
- **独立登录/注册页（`src/pages/login/index.tsx`）**：
  - 支持接收路由参数 `redirect`（登录成功后重定向路径，自动区分 Tab 页 `switchTab` 与普通页 `redirectTo`）和 `shouldReturn`（未传 `redirect` 时是否 `navigateBack` 返回上一页，默认返回）。

### 3.4 全局布局（`PageWrapper` / `Layout`）、`NavBar` 与 `BottomBar`

- **页面包裹规范**：所有页面均使用 `<PageWrapper navTitle="...">` 包裹。`PageWrapper` 默认自带 `h-full w-full`，调用方无需在 `className` 中重复传 `h-full w-full`。
- **安全区域公共函数（`src/utils/safeArea.ts`）**：
  - 顶部导航安全高度：`getNavBarSafeHeight()`（返回 `navHeight`、`statusBarHeight`、`contentHeight`、`horizontalPadding` 等）。
  - 底部安全区域高度：`getBottomSafeAreaHeight(barContentHeight)`（返回 `bottomSafeHeight`、`barContentHeight`、`totalBottomBarHeight`）。
- **底部导航栏 `BottomBar`（`src/components/BottomBar/index.tsx`）**：
  - 固定贴底（`fixed bottom-0 left-0 right-0`），内含底部安全区域 `paddingBottom` 与等高占位元素。
  - 支持传入 3 个或 4 个导航项，默认 4 项为：**首页、在线课程、培训计划、我的**。
  - 仅在 `TAB_BAR_ROUTES` 指定的特定页面显示，其他页面（如登录页、协议页、分包内页）自动隐藏。

### 3.5 防循环依赖规范

- `src/cache.ts` 是最底层基础设施，必须直接 `import createCache from "~/utils/cache"`，**严禁**从 `~/utils` 聚合入口导入，也不要在 `src/utils/index.ts` 中重导出依赖了 `useAuthStore` 或 `cache` 的业务上层模块，以防小程序启动阶段出现循环引用导致 `undefined`。
