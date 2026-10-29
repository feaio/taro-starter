import Taro, { getCurrentInstance } from "@tarojs/taro";
import { RouteNames } from "~/constants/routes";
import { useAuthStore } from "~/store";
import { navigateTo } from "~/utils/route";

/**
 * MemberGuardOptions：会员点击/动作拦截配置项。
 */
export interface MemberGuardOptions {
  /** 登录/注册完成后需要重定向的目标路径（若不传则默认使用当前页面路径） */
  redirect?: string;
  /** 登录/注册完成后是否返回上一页（默认 true） */
  shouldReturn?: boolean;
  /** 非会员拦截时的提示语（可选） */
  toastMessage?: string;
}

/**
 * getCurrentPageFullPath：获取当前页面包含查询参数的完整路径（单一职责 SRP）。
 */
function getCurrentPageFullPath(): string {
  const router = getCurrentInstance().router;
  if (!router?.path) {
    return "";
  }
  const path = router.path.startsWith("/") ? router.path : `/${router.path}`;
  return path;
}

/**
 * checkMemberOrRedirect：检查当前用户是否已属于会员；若非会员则自动跳转到独立登录/注册页面（单一职责 SRP）。
 * 依赖：useAuthStore、~/utils/route。
 * @returns boolean - 已是会员返回 true，非会员返回 false 并触发跳转
 */
export function checkMemberOrRedirect(options?: MemberGuardOptions): boolean {
  const { isMember } = useAuthStore.getState();

  if (isMember) {
    return true;
  }

  if (options?.toastMessage) {
    Taro.showToast({
      title: options.toastMessage,
      icon: "none",
      duration: 1500,
    });
  }

  const redirect = options?.redirect ?? getCurrentPageFullPath();
  const shouldReturn = options?.shouldReturn ?? true;

  navigateTo(RouteNames.LOGIN, {
    redirect: redirect || undefined,
    shouldReturn: String(shouldReturn),
  });

  return false;
}

/**
 * withMemberAuth：全局会员动作拦截高阶函数，包装任意点击事件或业务动作；
 * 当用户为会员时直接执行原函数，当用户非会员时拦截并跳转到登录/注册页（单一职责 SRP）。
 * 依赖：checkMemberOrRedirect。不负责：具体业务回调逻辑。
 */
export function withMemberAuth<T extends (...args: any[]) => any>(
  action: T,
  options?: MemberGuardOptions,
): (...args: Parameters<T>) => ReturnType<T> | undefined {
  return (...args: Parameters<T>): ReturnType<T> | undefined => {
    if (!checkMemberOrRedirect(options)) {
      return undefined;
    }
    return action(...args);
  };
}
