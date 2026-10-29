import { create } from "zustand";
import { cache } from "~/cache";

/**
 * PrivacyState：定义全局用户隐私协议同意状态及操作接口（接口隔离 ISP）。
 */
export interface PrivacyState {
  /** 用户是否已同意隐私政策 */
  hasAgreedPrivacy: boolean;
  /** 设置隐私政策同意状态并同步缓存 */
  setAgreedPrivacy: (agreed: boolean) => void;
}

/**
 * usePrivacyStore：只负责维护全局用户隐私协议同意状态，并同步持久化到 cache（单一职责 SRP）。
 * 依赖：zustand、~/cache。不负责：UI 弹窗渲染或路由跳转。
 */
export const usePrivacyStore = create<PrivacyState>(set => ({
  hasAgreedPrivacy: Boolean(cache.getSync("privacyAgreed")),
  setAgreedPrivacy: (agreed: boolean) => {
    cache.setSync("privacyAgreed", agreed);
    set({ hasAgreedPrivacy: agreed });
  },
}));
