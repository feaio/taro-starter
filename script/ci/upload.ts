#!/usr/bin/env node
/**
 * 小程序代码上传脚本
 * 使用 miniprogram-ci 自动上传小程序代码到微信平台
 * 上传完成后自动发送企业微信通知
 */

import { execSync } from "node:child_process";
import * as fs from "node:fs";
import * as path from "node:path";
import * as ci from "miniprogram-ci";

const DEFAULT_WECHAT_WEBHOOK_KEY = "900558c5-3a93-4dba-8ddf-b0107e955072";

/**
 * 加载 .env 文件
 */
function loadEnvFile(): void {
  const envPath = path.resolve(__dirname, "../../.env");
  if (!fs.existsSync(envPath)) {
    return;
  }

  try {
    const envContent = fs.readFileSync(envPath, "utf-8");
    const lines = envContent.split("\n");

    for (const line of lines) {
      // 跳过空行和注释
      const trimmedLine = line.trim();
      if (!trimmedLine || trimmedLine.startsWith("#")) {
        continue;
      }

      // 解析 KEY=VALUE 格式
      const equalIndex = trimmedLine.indexOf("=");
      if (equalIndex === -1) {
        continue;
      }

      const key = trimmedLine.substring(0, equalIndex).trim();
      let value = trimmedLine.substring(equalIndex + 1).trim();

      // 移除引号
      if ((value.startsWith("\"") && value.endsWith("\"")) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }

      // 如果环境变量未设置，则设置它
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }

    console.log("✅ 已加载 .env 文件");
  } catch (error) {
    console.warn("⚠️  加载 .env 文件失败:", (error as Error).message);
  }
}

// 加载 .env 文件
loadEnvFile();

// ==================== 类型定义 ====================

/**
 * 编译设置类型
 */
interface CompileSettings {
  es6?: boolean;
  es7?: boolean;
  minifyJS?: boolean;
  minifyWXML?: boolean;
  minifyWXSS?: boolean;
  minify?: boolean;
  codeProtect?: boolean;
  autoPrefixWXSS?: boolean;
}

/**
 * 上传结果类型
 */
interface UploadResult {
  version: string;
  desc: string;
  robot: number;
}

interface UploadConfig {
  appid: string;
  privateKeyPath: string;
  projectPath: string;
  robot: number;
  version: string;
  desc: string;
  setting: CompileSettings;
}

interface WebhookMessage {
  msgtype: string;
  text?: {
    content: string;
  };
  markdown?: {
    content: string;
  };
}

// ==================== 配置获取 ====================

/**
 * 从环境变量或 project.config.json 获取 AppID
 */
function getAppId(): string {
  // 优先从环境变量读取
  if (process.env.WECHAT_APPID) {
    return process.env.WECHAT_APPID;
  }

  // 从 project.config.json 读取
  try {
    const projectConfigPath = path.resolve(__dirname, "../../project.config.json");
    if (fs.existsSync(projectConfigPath)) {
      const projectConfig = JSON.parse(fs.readFileSync(projectConfigPath, "utf-8"));
      if (projectConfig.appid) {
        return projectConfig.appid;
      }
    }
  } catch {
    console.warn("⚠️  无法读取 project.config.json");
  }

  throw new Error("❌ 无法获取 AppID，请设置 WECHAT_APPID 环境变量或在 project.config.json 中配置 appid");
}

/**
 * 根据 AppID 自动获取密钥文件路径
 */
function getPrivateKeyPath(appid: string): string {
  // 如果环境变量指定了路径，优先使用
  if (process.env.WECHAT_PRIVATE_KEY_PATH) {
    return path.resolve(process.env.WECHAT_PRIVATE_KEY_PATH);
  }

  // 自动构建密钥文件路径: private.{appid}.key
  const projectRoot = path.resolve(__dirname, "./");
  const autoKeyPath = path.resolve(projectRoot, `private.${appid}.key`);

  return autoKeyPath;
}

/**
 * 从环境变量或默认值获取配置
 */
function getConfig(): UploadConfig {
  // 获取 AppID（优先环境变量，其次 project.config.json）
  const appid = getAppId();

  // 根据 AppID 自动获取密钥文件路径
  const privateKeyPath = getPrivateKeyPath(appid);

  // 检查密钥文件是否存在
  if (!fs.existsSync(privateKeyPath)) {
    throw new Error(
      `❌ 密钥文件不存在: ${privateKeyPath}\n`
      + `请确保密钥文件已放置在 script/ci 目录，文件名为: private.${appid}.key\n`
      + `或通过 WECHAT_PRIVATE_KEY_PATH 环境变量指定路径`,
    );
  }

  // 项目路径
  const projectPath = process.env.PROJECT_PATH || path.resolve(__dirname, "../../dist/weapp");

  // 无论构建目录是否存在，都重新构建以确保使用最新代码
  console.log("📦 开始执行生产环境构建...\n");
  try {
    console.log("📦 执行构建命令: NODE_ENV=production pnpm build:weapp");
    // 设置 NODE_ENV=production 确保使用生产环境配置（压缩、混淆等）
    execSync("pnpm build:weapp", {
      stdio: "inherit",
      cwd: path.resolve(__dirname, "../.."),
      env: {
        ...process.env,
        NODE_ENV: "production",
      },
    });
    console.log("\n✅ 构建完成\n");

    // 检查构建目录是否存在
    if (!fs.existsSync(projectPath)) {
      throw new Error(`❌ 构建完成但目录仍不存在: ${projectPath}`);
    }
  } catch (error) {
    const err = error as Error;
    throw new Error(`❌ 构建失败: ${err.message}\n请检查构建错误并重试`);
  }

  // 机器人编号（1-30，默认1）
  const robot = Number.parseInt(process.env.WECHAT_ROBOT || "1", 10);
  if (robot < 1 || robot > 30) {
    throw new Error("❌ 机器人编号必须在 1-30 之间");
  }

  // 版本号（优先使用环境变量，否则从 package.json 获取）
  let version: string = process.env.VERSION || "";
  if (!version) {
    try {
      const packageJsonPath = path.resolve(__dirname, "../../package.json");
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
      version = packageJson.version || "1.0.0";
    } catch {
      console.warn("⚠️  无法读取 package.json，使用默认版本号");
      version = "1.0.0";
    }
  }

  // 版本描述（优先使用环境变量，否则生成默认描述）
  let desc = process.env.VERSION_DESC;
  if (!desc) {
    try {
      // 尝试获取 Git 信息
      const branch = getGitBranch();
      const commit = getGitCommit();
      const author = getGitAuthor();
      desc = `[${branch}] ${commit.substring(0, 7)} - ${author}`;
    } catch {
      desc = `自动上传 - ${new Date().toLocaleString("zh-CN")}`;
    }
  }

  // 编译设置（从环境变量读取，默认使用生产环境配置）
  const setting: CompileSettings = {
    es6: process.env.ES6 !== "false",
    es7: process.env.ES7 === "true",
    minifyJS: process.env.MINIFY_JS !== "false",
    minifyWXML: process.env.MINIFY_WXML !== "false",
    minifyWXSS: process.env.MINIFY_WXSS !== "false",
    minify: process.env.MINIFY !== "false",
    codeProtect: process.env.CODE_PROTECT === "true",
    autoPrefixWXSS: process.env.AUTO_PREFIX_WXSS !== "false",
  };

  return {
    appid,
    privateKeyPath,
    projectPath,
    robot,
    version,
    desc,
    setting,
  };
}

/**
 * 获取 Git 分支名
 */
function getGitBranch(): string {
  try {
    return execSync("git rev-parse --abbrev-ref HEAD", { encoding: "utf-8" }).trim();
  } catch {
    return "unknown";
  }
}

/**
 * 获取 Git Commit Hash
 */
function getGitCommit(): string {
  try {
    return execSync("git rev-parse HEAD", { encoding: "utf-8" }).trim();
  } catch {
    return "unknown";
  }
}

/**
 * 获取 Git 作者
 */
function getGitAuthor(): string {
  try {
    return execSync("git log -1 --pretty=format:\"%an\"", { encoding: "utf-8" }).trim();
  } catch {
    return "unknown";
  }
}

/**
 * 获取 Git Commit 消息
 */
function getGitCommitMessage(): string {
  try {
    return execSync("git log -1 --pretty=format:\"%s\"", { encoding: "utf-8" }).trim();
  } catch {
    return "unknown";
  }
}

// ==================== Webhook 通知 ====================

/**
 * 发送企业微信 Webhook 通知
 */
async function sendWebhookNotification(
  success: boolean,
  config: UploadConfig,
  error?: Error,
  uploadResult?: UploadResult,
): Promise<void> {
  const webhookKey = process.env.WECHAT_WEBHOOK_KEY || DEFAULT_WECHAT_WEBHOOK_KEY;
  if (!webhookKey) {
    console.warn("⚠️  未配置 WECHAT_WEBHOOK_KEY，跳过 Webhook 通知");
    return;
  }

  const webhookUrl = `https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=${webhookKey}`;

  let message: WebhookMessage;

  if (success && uploadResult) {
    // 成功消息
    const branch = getGitBranch();
    const commit = getGitCommit();
    const commitMsg = getGitCommitMessage();
    const author = getGitAuthor();

    const content = `✅ 小程序代码上传成功

📦 版本信息
• 版本号: ${config.version}
• 描述: ${config.desc}
• 机器人: ${config.robot}

📝 代码信息
• 分支: ${branch}
• Commit: ${commit.substring(0, 7)}
• 作者: ${author}
• 提交信息: ${commitMsg}

⏰ 上传时间: ${new Date().toLocaleString("zh-CN")}

💡 提示: 请在微信公众平台提交审核`;

    message = {
      msgtype: "text",
      text: {
        content,
      },
    };
  } else {
    // 错误消息
    const errorMsg = error?.message || "未知错误";
    const errorStack = error?.stack || "";

    const content = `❌ 小程序代码上传失败

🔴 错误信息: ${errorMsg}

📦 版本信息
• 版本号: ${config.version}
• 描述: ${config.desc}
• 机器人: ${config.robot}

📝 代码信息
• 分支: ${getGitBranch()}
• Commit: ${getGitCommit().substring(0, 7)}

⏰ 失败时间: ${new Date().toLocaleString("zh-CN")}

${errorStack ? `\n📋 错误堆栈:\n${errorStack.substring(0, 500)}` : ""}

⚠️  请检查错误信息并重试`;

    message = {
      msgtype: "text",
      text: {
        content,
      },
    };
  }

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(message),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Webhook 请求失败: ${response.status} ${errorText}`);
    }

    const result = await response.json();
    if (result.errcode !== 0) {
      throw new Error(`Webhook 返回错误: ${result.errcode} ${result.errmsg}`);
    }

    console.log("✅ Webhook 通知发送成功");
  } catch (error) {
    console.error("❌ Webhook 通知发送失败:", error);
    // Webhook 失败不应该阻止主流程，只记录错误
  }
}

// ==================== 上传逻辑 ====================

/**
 * 执行上传
 */
async function upload(config: UploadConfig): Promise<UploadResult> {
  console.log("🚀 开始上传小程序代码...\n");
  console.log("📋 上传配置:");
  console.log(`  • AppID: ${config.appid}`);
  console.log(`  • 项目路径: ${config.projectPath}`);
  console.log(`  • 密钥路径: ${config.privateKeyPath}`);
  console.log(`  • 机器人: ${config.robot}`);
  console.log(`  • 版本号: ${config.version}`);
  console.log(`  • 版本描述: ${config.desc}`);
  console.log(`  • 编译设置:`, config.setting);
  console.log("");

  // 创建项目实例
  const project = new ci.Project({
    appid: config.appid,
    type: "miniProgram",
    projectPath: config.projectPath,
    privateKeyPath: config.privateKeyPath,
    ignores: ["node_modules/**/*"],
  });

  // 执行上传
  const result = (await ci.upload({
    project,
    version: config.version,
    desc: config.desc,
    setting: config.setting,
    robot: config.robot,
    onProgressUpdate: (task) => {
      // 处理不同类型的 task 参数
      if (typeof task === "string") {
        console.log(`📤 上传进度: ${task}`);
      } else if (typeof task === "object" && task !== null) {
        // task 可能是对象，尝试提取有用信息
        const taskObj = task as Record<string, any>;
        if ("progress" in taskObj && typeof taskObj.progress === "number") {
          const desc = taskObj.desc || taskObj.message || "上传中...";
          console.log(`📤 上传进度: ${taskObj.progress}% - ${desc}`);
        } else if ("message" in taskObj) {
          console.log(`📤 上传进度: ${taskObj.message}`);
        } else if ("status" in taskObj) {
          console.log(`📤 上传状态: ${taskObj.status}`);
        } else {
          // 如果无法识别，使用 JSON 格式化显示
          console.log(`📤 上传进度:`, JSON.stringify(taskObj, null, 2));
        }
      } else {
        console.log(`📤 上传进度: ${String(task)}`);
      }
    },
  })) as any;

  // 转换返回结果
  return {
    version: result?.version || config.version,
    desc: result?.desc || config.desc,
    robot: result?.robot || config.robot,
  };
}

// ==================== 主函数 ====================

/**
 * 主函数
 */
async function main(): Promise<void> {
  let config: UploadConfig | undefined;
  let uploadResult: UploadResult | undefined;

  try {
    // 1. 获取配置
    console.log("📝 读取配置...");
    config = getConfig();
    console.log("✅ 配置读取成功\n");

    // 2. 执行上传
    uploadResult = await upload(config);

    // 3. 上传成功
    console.log("\n✅ 上传成功！");
    console.log(`📦 版本号: ${uploadResult.version}`);
    console.log(`📝 描述: ${uploadResult.desc}`);
    console.log(`🤖 机器人: ${uploadResult.robot}`);

    // 4. 发送成功通知
    await sendWebhookNotification(true, config, undefined, uploadResult);

    console.log("\n🎉 所有操作完成！");
    process.exit(0);
  } catch (error) {
    // 错误处理
    const err = error as Error;
    console.error("\n❌ 上传失败！");
    console.error("错误信息:", err.message);
    if (err.stack) {
      console.error("错误堆栈:", err.stack);
    }

    // 发送失败通知
    if (config) {
      await sendWebhookNotification(false, config, err);
    } else {
      console.error("❌ 配置未初始化，无法发送通知");
    }

    console.error("\n💡 请检查错误信息并重试");
    process.exit(1);
  }
}

// ==================== 执行 ====================

// 如果直接运行此脚本
if (require.main === module) {
  main().catch((error) => {
    console.error("❌ 未捕获的错误:", error);
    process.exit(1);
  });
}

export { getConfig, main, sendWebhookNotification };
