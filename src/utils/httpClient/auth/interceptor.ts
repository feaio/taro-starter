import type { RequestConfig } from "~/utils/httpClient/apiClient";
import { useAuthStore } from "~/store";
import { ensureLoginWithQueue, isWhitelistedApi } from "./requestQueue";

/**
 * clearAuthState：清除所有认证状态并同步重置 store（单一职责 SRP）。
 */
export function clearAuthState() {
  useAuthStore.getState().clearAuth();
}

/**
 * attemptReLogin：触发重新登录（调用 wx.login -> /auth/login），与请求队列共享单飞锁（单一职责 SRP）。
 */
export async function attemptReLogin(): Promise<boolean> {
  try {
    const token = await ensureLoginWithQueue(true);
    return Boolean(token);
  } catch (error) {
    console.error("Relogin failed:", error);
    return false;
  }
}

/**
 * handle401AndRetry：处理 401 未授权错误，清理旧 token 并通过队列单飞机制重新调用 wx.login 登录（单一职责 SRP）。
 */
export async function handle401AndRetry(): Promise<boolean> {
  return attemptReLogin();
}

/**
 * authInterceptor：全局 API 请求认证拦截器（单一职责 SRP）。
 * - 自动注入公共请求头；
 * - 白名单内或标记 `noAuth: true` 的请求直接放行；
 * - 非白名单请求必须等待全局登录完成（未完成则进入重试等待队列）；
 * - 完成后自动注入 `Authorization: Bearer <access_token>` 请求头。
 */
export async function authInterceptor(config: RequestConfig): Promise<RequestConfig> {
  config.header = {
    ...config.header,
    "is-user": "true",
  };

  if (isWhitelistedApi(config.url, config.noAuth)) {
    return config;
  }

  // 确保全局登录已完成（未完成或正在重登时自动进入等待队列）
  const accessToken = await ensureLoginWithQueue(false);

  if (accessToken) {
    config.header.Authorization = `Bearer ${accessToken}`;
  }

  return config;
}

/**
 * authResponseInterceptor：全局响应拦截器（401 已由 request 层捕获并通过 handle401AndRetry 自动重登重试）（单一职责 SRP）。
 */
export function authResponseInterceptor(response: any) {
  return response;
}
