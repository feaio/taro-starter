import Taro from "@tarojs/taro";
import { wechatLoginOrRegisterApi } from "~/api/wechat";
import { useAuthStore } from "~/store";
import { saveAuthData } from "./index";

/**
 * QueuedTask：等待全局登录（wx.login -> /auth/login）完成的挂起请求项。
 */
interface QueuedTask {
  resolve: (token: string) => void;
  reject: (reason?: any) => void;
}

/**
 * 默认 API 白名单列表：白名单内的路径直接放行，无需等待登录。
 */
const apiWhitelist = new Set<string>([
  "/auth/login",
  "/v1/api/wechat/login-or-register",
]);

let isLoggingIn = false;
const retryQueue: QueuedTask[] = [];

/**
 * addApiWhitelist：向全局 API 白名单中添加路径（单一职责 SRP）。
 */
export function addApiWhitelist(paths: string | string[]): void {
  const list = Array.isArray(paths) ? paths : [paths];
  list.forEach(p => apiWhitelist.add(p));
}

/**
 * removeApiWhitelist：从全局 API 白名单中移除路径（单一职责 SRP）。
 */
export function removeApiWhitelist(path: string): void {
  apiWhitelist.delete(path);
}

/**
 * getApiWhitelist：获取当前白名单列表快照（单一职责 SRP）。
 */
export function getApiWhitelist(): string[] {
  return Array.from(apiWhitelist);
}

/**
 * normalizePathname：提取 URL 的纯路径部分（不含域名与 query 参数），用于白名单比对（单一职责 SRP）。
 */
function normalizePathname(url: string): string {
  let cleanUrl = url;
  if (cleanUrl.startsWith("http://") || cleanUrl.startsWith("https://")) {
    try {
      const parsed = new URL(cleanUrl);
      cleanUrl = parsed.pathname;
    } catch {
      // ignore parse error
    }
  }
  return cleanUrl.split("?")[0];
}

/**
 * isWhitelistedApi：判断请求是否在白名单内或显式声明跳过认证（单一职责 SRP）。
 */
export function isWhitelistedApi(url: string, noAuth?: boolean): boolean {
  if (noAuth) {
    return true;
  }
  const pathname = normalizePathname(url);
  if (apiWhitelist.has(pathname)) {
    return true;
  }
  for (const pattern of apiWhitelist) {
    if (pathname.startsWith(pattern)) {
      return true;
    }
  }
  return false;
}

/**
 * flushQueue：当登录完成或失败时，统一唤醒并清空等待队列中的所有请求（单一职责 SRP）。
 */
function flushQueue(error: any, token: string = "") {
  while (retryQueue.length > 0) {
    const task = retryQueue.shift();
    if (task) {
      if (error) {
        task.reject(error);
      } else {
        task.resolve(token);
      }
    }
  }
}

/**
 * performWechatLogin：调用 wx.login 获取 code 并请求后端 /auth/login 接口完成登录（单一职责 SRP）。
 * 依赖：Taro.login、wechatLoginOrRegisterApi、saveAuthData。
 */
async function performWechatLogin(): Promise<string> {
  const loginRes = await Taro.login();
  if (!loginRes.code) {
    throw new Error("Failed to obtain WeChat login code");
  }

  const authResponse = await wechatLoginOrRegisterApi({ code: loginRes.code });
  if (!authResponse?.access_token) {
    throw new Error("Failed to retrieve access_token from /auth/login");
  }

  saveAuthData(authResponse);
  return authResponse.access_token;
}

/**
 * ensureLoginWithQueue：确保全局登录已完成；
 * - 若已存在有效 token 且非强制重新登录（forceRelogin = false），直接返回当前 token；
 * - 若未登录或收到 401 需要强制重登（forceRelogin = true），将所有并发请求加入等待队列，仅发起一次 `wx.login -> /auth/login`，完成后唤醒整个队列（单一职责 SRP）。
 * 依赖：performWechatLogin、useAuthStore。不负责：业务 HTTP 请求发送。
 */
export async function ensureLoginWithQueue(forceRelogin: boolean = false): Promise<string> {
  if (forceRelogin && !isLoggingIn) {
    useAuthStore.getState().clearAuth();
  }

  const { isLoginCompleted, accessToken } = useAuthStore.getState();
  if (!forceRelogin && isLoginCompleted && accessToken) {
    return accessToken;
  }

  return new Promise<string>((resolve, reject) => {
    retryQueue.push({ resolve, reject });

    if (!isLoggingIn) {
      isLoggingIn = true;
      performWechatLogin()
        .then((token) => {
          flushQueue(null, token);
        })
        .catch((err) => {
          flushQueue(err);
        })
        .finally(() => {
          isLoggingIn = false;
        });
    }
  });
}

/** 兼容旧函数命名 */
export const ensureMockLoginWithQueue = ensureLoginWithQueue;
