import type { WechatAuthResponse } from "~/api/models/wechat";
import { cache } from "~/cache";
import { useAuthStore } from "~/store";

/**
 * saveAuthData：将登录接口返回的认证信息与会员状态同步写入 cache 与全局 Zustand store（单一职责 SRP）。
 */
export function saveAuthData(authData: WechatAuthResponse) {
  const isMember = Boolean(
    authData.isMember
    ?? authData.user_validated
    ?? cache.getSync("isMember"),
  );

  useAuthStore.getState().setAuthData({
    access_token: authData.access_token,
    isMember,
    user_validated: authData.user_validated,
    user_authed_at: authData.user_authed_at,
  });
}
