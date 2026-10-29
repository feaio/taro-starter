import type { WechatAuthRequest, WechatAuthResponse } from "~/api/models/wechat";
import { createFetch } from "~/utils/httpClient";

export type { WechatAuthRequest, WechatAuthResponse };

// 创建 API 请求函数 - 微信登录接口（对应 /auth/login）
export const wechatLoginOrRegisterApi
  = createFetch<WechatAuthRequest, WechatAuthResponse>("/auth/login", "POST", { noAuth: true });
