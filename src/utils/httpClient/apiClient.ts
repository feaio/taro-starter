import type { ApiPath } from "./constants";
import Taro from "@tarojs/taro";

// 定义API响应类型（兼容 code === 200 及 status === "success"）
export interface ApiResponse<T = any> {
  status?: "success" | "error";
  data?: T;
  code?: number;
  message?: string;
}

// 定义请求配置类型
export type RequestConfig<T = any> = Omit<Taro.request.Option<T>, "success" | "fail" | "complete"> & {
  url: ApiPath;
  noAuth?: boolean; // 是否跳过认证
};

// 定义响应结果类型
export interface ResponseResult<T = any> {
  data: T;
  statusCode: number;
  header: Record<string, any>;
  code?: number;
  message?: string;
}

/**
 * apiRequest：封装底层 Taro.request，统一处理 HTTP 状态码与业务响应码（单一职责 SRP）。
 * @param config 请求配置
 * @returns Promise<ResponseResult>
 */
export function apiRequest<T = any>(config: RequestConfig<T>): Promise<ResponseResult<T>> {
  const defaultConfig: Partial<Taro.request.Option> = {
    method: "GET",
    dataType: "json",
    responseType: "text",
    timeout: 30000,
  };

  const mergedConfig: Taro.request.Option = { ...defaultConfig, ...config };

  return new Promise((resolve, reject) => {
    Taro.request<ApiResponse<T>>({
      ...mergedConfig,
      success: (res) => {
        const { data, statusCode, header } = res;

        // 处理 HTTP 401 未授权状态码（以及业务层 code === 401）
        if (statusCode === 401 || data?.code === 401) {
          const error = new Error(data?.message || "Unauthorized");
          Object.assign(error, {
            data: data?.data,
            statusCode: 401,
            header,
            code: 401,
          });
          reject(error);
          return;
        }

        // 处理 HTTP 403 状态码（无权限）
        if (statusCode === 403 || data?.code === 403) {
          const error = new Error(data?.message || "无权限访问");
          Object.assign(error, {
            data: data?.data,
            statusCode: 403,
            header,
            code: 403,
          });
          reject(error);
          return;
        }

        if (data?.code === 200 || (data?.status === "success" && (data?.data !== undefined || data?.message))) {
          resolve({
            data: data.data as T,
            statusCode,
            header,
            code: data.code ?? statusCode,
            message: data.message,
          });
        } else {
          const error = new Error(data?.message || "请求失败");
          Object.assign(error, {
            data: data?.data,
            statusCode,
            header,
            code: data?.code ?? statusCode,
          });
          reject(error);
        }
      },
      fail: (err) => {
        const error = new Error(err.errMsg || "网络请求失败");
        Object.assign(error, {
          data: {} as T,
          statusCode: 500,
          header: {},
          code: 500,
        });
        reject(error);
      },
    });
  });
}
