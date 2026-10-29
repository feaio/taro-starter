# 小程序 CI 脚本说明

## 📦 上传脚本 (upload.ts)

用于自动上传小程序代码到微信平台，并发送企业微信通知。

### 功能特性

- ✅ 自动构建并上传小程序代码
- ✅ 支持多机器人配置（1-30）
- ✅ 自动获取版本号和 Git 信息
- ✅ 上传成功后自动发送企业微信通知
- ✅ 完善的错误处理和通知机制
- ✅ 支持环境变量配置

### 使用方法

#### 1. 安装依赖

确保已安装 `miniprogram-ci`：

```bash
pnpm add -D miniprogram-ci
```

#### 2. 配置密钥

将微信小程序代码上传密钥文件放置在 `script/ci` 目录：

```
script/ci/
  └── private.{appid}.key
```

或者通过环境变量指定密钥路径：

```bash
export WECHAT_PRIVATE_KEY_PATH=/path/to/private.key
```

#### 3. 配置环境变量

在 CI/CD 环境或 `.env` 文件中配置以下环境变量：

**可选配置：**

```bash
# 小程序 AppID（默认从 project.config.json 读取）
WECHAT_APPID=wx_your_mini_program_appid

# 企业微信 Webhook Key（代码中已内置默认值，也可通过环境变量覆盖）
WECHAT_WEBHOOK_KEY=your-wechat-webhook-key

# 密钥文件路径（默认: ./script/ci/private.{appid}.key）
WECHAT_PRIVATE_KEY_PATH=./script/ci/private.key

# 项目构建路径（默认: ./dist/weapp）
PROJECT_PATH=./dist/weapp

# 机器人编号（默认: 1，范围: 1-30）
WECHAT_ROBOT=1

# 版本号（默认: 从 package.json 读取）
VERSION=1.0.0

# 版本描述（默认: 自动生成，包含分支和 commit 信息）
VERSION_DESC="[main] 修复登录问题"

# 编译设置（默认: true）
ES6=true              # ES6 转 ES5
ES7=false             # 增强编译
MINIFY_JS=true        # 压缩 JS
MINIFY_WXML=true      # 压缩 WXML
MINIFY_WXSS=true      # 压缩 WXSS
MINIFY=true           # 压缩所有代码
CODE_PROTECT=false    # 代码保护
AUTO_PREFIX_WXSS=true # 样式自动补全
```

#### 4. 执行上传

```bash
# 自动执行生产构建并上传
pnpm ci:upload
```
