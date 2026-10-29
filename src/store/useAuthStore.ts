import { create } from "zustand";
import { cache } from "~/cache";

/**
 * AuthState：定义全局认证与会员状态及操作方法接口（接口隔离 ISP）。
 */
export interface AuthState {
  /** 访问令牌 */
  accessToken: string;
  /** 是否已完成全局初始登录 */
  isLoginCompleted: boolean;
  /** 是否已经属于注册会员 */
  isMember: boolean;
  /** 注册会员账号 */
  account: string;
  /**
   * 设置登录态信息（存储 access_token 和 isMember 到 store 与本地缓存）
   */
  setAuthData: (payload: {
    access_token: string;
    isMember: boolean;
    account?: string;
    user_validated?: boolean;
    user_authed_at?: string;
  }) => void;
  /**
   * 注册会员成功后更新会员状态
   */
  setMemberStatus: (isMember: boolean, account?: string) => void;
  /**
   * 清除登录与会员状态
   */
  clearAuth: () => void;
}

/**
 * useAuthStore：只负责维护全局认证 Token 与会员身份状态，并同步持久化到 cache（单一职责 SRP）。
 * 依赖：zustand、~/cache。不负责：网络请求发送、路由跳转或 UI 渲染。
 */
export const useAuthStore = create<AuthState>(set => ({
  accessToken: cache.getSync("access_token") || "",
  isLoginCompleted: Boolean(cache.getSync("access_token")),
  isMember: Boolean(cache.getSync("isMember") || cache.getSync("user_validated")),
  account: cache.getSync("account") || "",

  setAuthData: ({ access_token, isMember, account, user_validated, user_authed_at }) => {
    cache.setSync("access_token", access_token);
    cache.setSync("isMember", isMember);
    if (user_validated !== undefined) {
      cache.setSync("user_validated", user_validated);
    }
    if (user_authed_at !== undefined) {
      cache.setSync("user_authed_at", user_authed_at);
    }
    if (account !== undefined) {
      cache.setSync("account", account);
    }
    set(state => ({
      accessToken: access_token,
      isLoginCompleted: Boolean(access_token),
      isMember,
      account: account !== undefined ? account : state.account,
    }));
  },

  setMemberStatus: (isMember, account) => {
    cache.setSync("isMember", isMember);
    cache.setSync("user_validated", isMember);
    if (account !== undefined) {
      cache.setSync("account", account);
    }
    set(state => ({
      isMember,
      account: account !== undefined ? account : state.account,
    }));
  },

  clearAuth: () => {
    cache.removeSync("access_token");
    cache.removeSync("isMember");
    cache.removeSync("user_validated");
    cache.removeSync("user_authed_at");
    cache.removeSync("account");
    cache.removeSync("user");
    set({
      accessToken: "",
      isLoginCompleted: false,
      isMember: false,
      account: "",
    });
  },
}));
