import type { WechatAuthRequest, WechatAuthResponse } from "../models/wechat";
import { createApi } from "../core/apiFactory";

/**
 * 微信相关API端点
 */
export const wechatApi = createApi({
  /**
   * 微信登录或注册
   */
  loginOrRegister: {
    method: "POST",
    path: "/auth/login",
    params: {} as WechatAuthRequest,
    response: {} as WechatAuthResponse,
    options: { noAuth: true },
  },
});
