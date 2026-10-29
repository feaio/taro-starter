import type { RequestConfig, ResponseResult } from "./apiClient";
import type { ApiPath, Environment } from "./constants";
import { getCurrentEnvironment } from "~/utils/env";
import {
  authInterceptor,
  authResponseInterceptor,
  handle401AndRetry,
} from "~/utils/httpClient/auth/interceptor";
import {
  addApiWhitelist,
  ensureLoginWithQueue,
  ensureMockLoginWithQueue,
  getApiWhitelist,
  isWhitelistedApi,
  removeApiWhitelist,
} from "~/utils/httpClient/auth/requestQueue";
import { apiRequest } from "./apiClient";
import domainConfig from "./constants";

// HTTP方法类型
export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "HEAD" | "OPTIONS" | "PATCH";

/**
 * formatUrl：根据当前小程序环境拼接 TARO_API_BASE_URL 与时间戳防缓存参数（单一职责 SRP）。
 */
function formatUrl(option: RequestConfig) {
  let url = option.url;
  // 如果已经是完整URL，先提取相对路径部分
  if (url.startsWith("http://") || url.startsWith("https://")) {
    try {
      const urlObj = new URL(url);
      url = (urlObj.pathname + urlObj.search) as ApiPath;
    } catch (error) {
      console.error("Invalid URL:", url, error);
      throw new Error("Invalid URL format");
    }
  }

  // 验证URL格式
  if (!url.startsWith("/")) {
    console.error("Invalid URL format: URL must start with /", url);
    throw new Error("Invalid URL format: URL must start with /");
  }

  // 动态获取当前小程序环境（development/preview/production）
  const currentEnv: Environment = getCurrentEnvironment();

  // 从配置中取对应环境的 API 地址前缀
  const domain = domainConfig[currentEnv].api_base_url;

  if (!domain) {
    console.error("Domain configuration error:", {
      currentEnv,
      url: option.url,
    });
    throw new Error(`Missing api_base_url for environment: ${currentEnv}`);
  }

  option.url = `${domain}${url}${url.includes("?") ? "&" : "?"}t=${Date.now()}` as ApiPath;
}

/**
 * 解析路径参数
 * 将 /api/users/:id 格式的URL中的 :id 替换为实际值
 */
function resolvePathParams(url: ApiPath, data: Record<string, any> | null): ApiPath {
  if (!data) {
    return url;
  }

  const originalUrl = url;
  const dataCopy = { ...data };

  const resolvedUrl = url.replace(/:([^/]+)/g, (_, param) => {
    if (dataCopy[param] === undefined) {
      console.warn(`Missing path parameter: ${param} for URL: ${originalUrl}`);
      return `:${param}`;
    }

    const value = String(dataCopy[param]);
    delete dataCopy[param];
    return value;
  }) as ApiPath;

  return resolvedUrl;
}

/**
 * request：核心 HTTP 请求调度器，串联白名单校验、登录队列拦截、URL 格式化及 401 自动重登重试（单一职责 SRP）。
 * @param config 请求配置
 * @param fullResponse 是否返回完整响应
 * @param retryCount 内部重试计数，防止 401 无限重试
 */
export async function request<T>(
  config: RequestConfig,
  fullResponse: boolean = false,
  retryCount: number = 0,
): Promise<T | ResponseResult<T>> {
  // 保存原始配置（未格式化 URL 前），以便 401 重新登录后准确重放请求
  const originalConfig: RequestConfig = {
    ...config,
    header: config.header ? { ...config.header } : undefined,
  };

  try {
    // 1. 应用认证与登录等待队列拦截器（此时 config.url 仍为相对路径，便于精确匹配白名单）
    config = await authInterceptor(config);

    // 2. 格式化完整 URL
    formatUrl(config);

    // 3. 发起底层请求
    const response = await apiRequest<T>(config);

    // 4. 应用响应拦截器
    const processedResponse = authResponseInterceptor(response);

    return fullResponse ? processedResponse : processedResponse.data;
  } catch (error: any) {
    // 遇到 401 且非白名单接口时，触发 wx.login -> /auth/login 重新登录并自动重放当前请求
    if (error?.statusCode === 401 && !isWhitelistedApi(originalConfig.url, originalConfig.noAuth)) {
      if (retryCount >= 1) {
        console.error("Request failed after 401 re-login retry:", error);
        throw error;
      }

      const reloginSuccess = await handle401AndRetry();
      if (reloginSuccess) {
        return request<T>(originalConfig, fullResponse, retryCount + 1);
      }
      throw new Error("Login required");
    }

    console.error("Request failed:", error);
    throw error;
  }
}

/**
 * createFetch：创建类型安全的单端点 API 请求函数（单一职责 SRP）。
 */
export function createFetch<REQ extends Record<string, any> | null, RES extends Record<string, any> | null>(
  url: ApiPath,
  method: HttpMethod,
  options?: { noAuth?: boolean },
) {
  function fetch(data: REQ): Promise<RES>;
  function fetch(data: REQ, fullResponse: true): Promise<ResponseResult<RES>>;
  function fetch(data: REQ, fullResponse: false): Promise<RES>;
  function fetch(data: REQ, fullResponse?: boolean): Promise<RES | ResponseResult<RES>> {
    const resolvedUrl = resolvePathParams(url, data);

    return request<RES>(
      {
        url: resolvedUrl,
        method,
        data,
        ...options,
      },
      fullResponse ?? false,
    );
  }

  return fetch;
}

/**
 * http：全局统一 API 调用封装对象，提供便捷的 get/post/put/delete/patch 调用方式（单一职责 SRP）。
 * 依赖：request。不负责：具体业务状态处理。
 */
export const http = {
  request,
  get<T = any>(url: ApiPath, data?: Record<string, any>, options?: Omit<RequestConfig, "url" | "method" | "data">) {
    return request<T>({ url, method: "GET", data, ...options }) as Promise<T>;
  },
  post<T = any>(url: ApiPath, data?: Record<string, any>, options?: Omit<RequestConfig, "url" | "method" | "data">) {
    return request<T>({ url, method: "POST", data, ...options }) as Promise<T>;
  },
  put<T = any>(url: ApiPath, data?: Record<string, any>, options?: Omit<RequestConfig, "url" | "method" | "data">) {
    return request<T>({ url, method: "PUT", data, ...options }) as Promise<T>;
  },
  delete<T = any>(url: ApiPath, data?: Record<string, any>, options?: Omit<RequestConfig, "url" | "method" | "data">) {
    return request<T>({ url, method: "DELETE", data, ...options }) as Promise<T>;
  },
  patch<T = any>(url: ApiPath, data?: Record<string, any>, options?: Omit<RequestConfig, "url" | "method" | "data">) {
    return request<T>({ url, method: "PATCH", data, ...options }) as Promise<T>;
  },
};

export {
  addApiWhitelist,
  ensureLoginWithQueue,
  ensureMockLoginWithQueue,
  getApiWhitelist,
  isWhitelistedApi,
  removeApiWhitelist,
};
export type { RequestConfig, ResponseResult };
