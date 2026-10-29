// 定义每个路由可能的参数类型
import type {
  RouteNames,
} from "~/constants/routes";
import {
  PAGES,
} from "~/constants/routes";

// 定义路由参数的类型
export interface RouteParams {
  from?: string;
  userId?: string;
  friendId?: string;
  messageId?: string;
  fromProfile?: boolean;
  /** 登录/注册完成后重定向的目标路径 */
  redirect?: string;
  /** 登录/注册完成后是否返回上一页（"true" | "false" | boolean） */
  shouldReturn?: boolean | string;
}

// 定义每个路由的参数配置
export type RouteConfig = {
  [K in RouteNames]: {
    path: string;
    params: RouteParamConfig[K];
  };
};

// 定义每个路由的具体参数类型
export interface RouteParamConfig {
  [RouteNames.HOME]: Pick<RouteParams, "userId" | "from">;
  [RouteNames.DISCOVER]: Pick<RouteParams, "from">;
  [RouteNames.MESSAGES]: Pick<RouteParams, "from">;
  [RouteNames.PROFILE]: Pick<RouteParams, "from">;
  [RouteNames.LOGIN]: Pick<RouteParams, "redirect" | "shouldReturn" | "from">;
  [RouteNames.PRIVACY_POLICY]: Pick<RouteParams, never>;
  [RouteNames.USER_AGREEMENT]: Pick<RouteParams, never>;
}

// 路由配置对象
export const ROUTE_CONFIG: RouteConfig = Object.entries(PAGES).reduce(
  (acc, [key, path]) => ({
    ...acc,
    [key]: {
      path,
      params: {} as RouteParamConfig[keyof RouteParamConfig],
    },
  }),
  {} as RouteConfig,
);

// 获取特定路由的参数类型
export type RouteParamsFor<T extends RouteNames> = RouteParamConfig[T];
