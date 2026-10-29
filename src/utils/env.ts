import type { Environment } from "~/utils/httpClient/constants";
import Taro, { getAppAuthorizeSetting, getAppBaseInfo, getDeviceInfo, getWindowInfo } from "@tarojs/taro";
import { isEmpty } from "lodash-es";
import { cache } from "~/cache";

export interface SystemInfo {
  appBaseInfo: ReturnType<typeof getAppBaseInfo>;
  windowInfo: ReturnType<typeof getWindowInfo>;
  appAuthorizeSetting: ReturnType<typeof getAppAuthorizeSetting>;
  deviceInfo: ReturnType<typeof getDeviceInfo>;
}

/**
 * 异步获取系统信息并缓存
 * @param force - 是否强制从微信API重新获取系统信息
 * @returns 返回最新的系统信息
 */
export async function fetchAndCacheSystemInfoAsync(force: boolean = true): Promise<SystemInfo> {
  if (force) {
    // 如果 `force` 为 `true`，则强制从微信API获取最新的系统信息
    const systemInfo: SystemInfo = {
      appBaseInfo: getAppBaseInfo(),
      windowInfo: getWindowInfo(),
      appAuthorizeSetting: getAppAuthorizeSetting(),
      deviceInfo: getDeviceInfo(),
    };

    // 将获取到的系统信息保存到缓存中
    await cache.set("sysInfo", systemInfo);
    return systemInfo;
  } else {
    // 尝试从缓存中获取系统信息
    const cachedSystemInfo = await cache.get("sysInfo");

    if (isEmpty(cachedSystemInfo)) {
      // 如果缓存中没有系统信息，则从微信API获取最新的系统信息并缓存它
      const systemInfo: SystemInfo = {
        appBaseInfo: getAppBaseInfo(),
        windowInfo: getWindowInfo(),
        appAuthorizeSetting: getAppAuthorizeSetting(),
        deviceInfo: getDeviceInfo(),
      };

      // 将获取到的系统信息保存到缓存中
      await cache.set("sysInfo", systemInfo);
      return systemInfo;
    }
    // 如果缓存中有系统信息，则直接返回缓存内容
    return cachedSystemInfo;
  }
}

/**
 * getCurrentEnvironment：获取当前小程序运行环境（单一职责 SRP）。
 * 注意：具体的 API 地址（TARO_API_BASE_URL）在编译时由 Taro 根据 `--mode` 自动从对应的 `.env.[mode]` 注入到 `process.env.TARO_API_BASE_URL` 常量中，
 * 因此严禁在此处访问未在 `.env` 中定义的 `process.env.*` 属性，否则会导致小程序运行时报 `ReferenceError: process is not defined`。
 */
export function getCurrentEnvironment(): Environment {
  try {
    const accountInfo = Taro.getAccountInfoSync();
    const { envVersion } = accountInfo.miniProgram;

    switch (envVersion) {
      case "develop":
        return "development";
      case "trial":
        return "preview";
      case "release":
        return "production";
      default:
        return "development";
    }
  } catch {
    return "development";
  }
}
