# Taro Starter

一个基于 Taro 4 + React 18 + TypeScript + UnoCSS 的多端小程序与 H5 开发模板。

## 特性

- **技术栈**：Taro 4.0 + React 18 + TypeScript + UnoCSS
- **多端适配**：支持微信、支付宝、百度、字节跳动、QQ、京东等小程序平台及 H5
- **UI 组件库**：集成 Taroify UI 组件库
- **状态管理**：集成 Zustand 与 React Query，兼顾客户端全局状态与服务端状态管理
- **请求与鉴权**：统一的 API 调用封装、白名单机制、请求队列拦截及会员权限校验
- **工程化规范**：内置 ESLint、Stylelint、Commitlint、Husky 等开发规范工具

## 环境要求

- Node.js 18+
- pnpm 9.15.0+

## 快速开始

### 安装依赖

```bash
pnpm install
```

### 环境变量配置

项目中的 `.env` 及 `.env.*` 文件不纳入 Git 管理，仓库仅保留 `.env.example` 作为配置模板。

本地开发或构建前，请先基于 `.env.example` 复制创建 `.env` 文件，并根据实际需要几个环境就创建哪几个对应的 `.env.<mode>`（即 `.env.endfix`）文件（例如 `.env.development`、`.env.test`、`.env.production` 等）：

```bash
# 创建默认环境变量文件
cp .env.example .env

# 按需创建对应环境的配置文件（需要几个环境就创建哪几个）
cp .env.example .env.development
cp .env.example .env.test
cp .env.example .env.production
```

### 本地开发

```bash
# 微信小程序
pnpm dev:weapp

# H5
pnpm dev:h5
```

### 生产构建

```bash
# 微信小程序
pnpm build:weapp

# H5
pnpm build:h5
```

## 目录结构

```text
├── src
│   ├── api                # API 接口定义与 Mock
│   ├── components         # 公共组件（Layout / PageWrapper / NavBar / BottomBar 等）
│   ├── constants          # 路由与全局常量定义
│   ├── hooks              # 自定义 Hooks
│   ├── pages              # 页面视图
│   ├── store              # Zustand 全局状态管理
│   ├── types              # 全局类型定义
│   ├── utils              # 工具函数（HTTP 封装、路由、权限拦截等）
│   ├── app.config.ts      # Taro 应用配置
│   ├── app.scss           # 全局样式
│   └── app.tsx            # 应用入口
├── config                 # 编译与环境配置
├── types                  # 全局类型声明
├── .env.example           # 环境变量配置示例
├── tsconfig.json          # TypeScript 配置
└── package.json           # 项目依赖与脚本
```

## 开源协议

[MIT](./LICENSE)
