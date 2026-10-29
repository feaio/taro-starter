import type { MenuButtonInfo } from "~/components/PageWrapper/types";
import Taro from "@tarojs/taro";

/**
 * NavBarMetrics：顶部导航栏安全区域及尺寸计算结果接口。
 */
export interface NavBarMetrics extends MenuButtonInfo {
  /** 导航栏总安全高度（含状态栏高度 + 胶囊区高度及上下间距，单位 px） */
  navHeight: number;
  /** 导航栏内容区高度（不含状态栏高度，单位 px） */
  contentHeight: number;
  /** 胶囊按钮占用的左右安全内边距（单位 px） */
  horizontalPadding: number;
}

/**
 * BottomSafeAreaMetrics：底部安全区域及底部导航栏尺寸计算结果接口。
 */
export interface BottomSafeAreaMetrics {
  /** 底部安全区域高度（Home Indicator 区域高度，单位 px） */
  bottomSafeHeight: number;
  /** 底部导航栏内容区高度（不含安全区，单位 px） */
  barContentHeight: number;
  /** 底部导航栏总高度（内容区高度 + 底部安全区域高度，单位 px） */
  totalBottomBarHeight: number;
}

// 内存级单例缓存：设备屏幕安全区与胶囊几何信息在单次会话内恒定不变，缓存后可消除每次切 Tab 时的同步跨线程 IPC 开销
let cachedNavBarMetrics: NavBarMetrics | null = null;
let cachedBottomSafeHeight: number | null = null;

/**
 * getNavBarSafeHeight：计算并返回顶部导航栏安全高度及胶囊布局指标，带内存缓存（单一职责 SRP）。
 * 依赖：@tarojs/taro getWindowInfo / getMenuButtonBoundingClientRect。不负责：组件渲染。
 */
export function getNavBarSafeHeight(): NavBarMetrics {
  if (cachedNavBarMetrics) {
    return cachedNavBarMetrics;
  }

  try {
    const windowInfo = Taro.getWindowInfo();
    const statusBarHeight = windowInfo?.statusBarHeight || 0;
    const windowWidth = windowInfo?.windowWidth || 375;

    let menuButtonInfo: {
      top: number;
      height: number;
      width: number;
      right: number;
    };

    if (process.env.TARO_ENV === "h5" || typeof Taro.getMenuButtonBoundingClientRect !== "function") {
      menuButtonInfo = {
        top: 7,
        height: 32,
        width: 87,
        right: windowWidth - 7,
      };
    } else {
      const rect = Taro.getMenuButtonBoundingClientRect();
      menuButtonInfo = rect && rect.height
        ? rect
        : {
            top: statusBarHeight + 4,
            height: 32,
            width: 87,
            right: windowWidth - 7,
          };
    }

    const gap = Math.max(0, menuButtonInfo.top - statusBarHeight);
    const navHeight = menuButtonInfo.top + menuButtonInfo.height + gap;
    const contentHeight = Math.max(0, navHeight - statusBarHeight);
    const marginRight = Math.max(0, windowWidth - menuButtonInfo.right);
    const horizontalPadding = menuButtonInfo.width + marginRight * 2;

    cachedNavBarMetrics = {
      top: menuButtonInfo.top,
      height: menuButtonInfo.height,
      statusBarHeight,
      width: menuButtonInfo.width,
      marginRight,
      navHeight,
      contentHeight,
      horizontalPadding,
    };
    return cachedNavBarMetrics;
  } catch (error) {
    console.error("计算顶部导航栏安全高度失败:", error);
    return {
      top: 24,
      height: 32,
      statusBarHeight: 20,
      width: 87,
      marginRight: 7,
      navHeight: 60,
      contentHeight: 40,
      horizontalPadding: 101,
    };
  }
}

/**
 * getBottomSafeAreaHeight：公共底部安全区域高度计算函数，计算设备底部 Home Indicator 安全区高度及 BottomBar 总高度，带内存缓存（单一职责 SRP）。
 * 依赖：@tarojs/taro getWindowInfo。不负责：组件渲染。
 * @param barContentHeight 底部栏内容高度（默认 56px）
 */
export function getBottomSafeAreaHeight(barContentHeight: number = 56): BottomSafeAreaMetrics {
  if (cachedBottomSafeHeight !== null) {
    return {
      bottomSafeHeight: cachedBottomSafeHeight,
      barContentHeight,
      totalBottomBarHeight: barContentHeight + cachedBottomSafeHeight,
    };
  }

  try {
    const windowInfo = Taro.getWindowInfo();
    const screenHeight = windowInfo?.screenHeight || 0;
    const safeAreaBottom = windowInfo?.safeArea?.bottom || screenHeight;

    // 底部安全距离 = 屏幕总高度 - 安全区域底部坐标
    const bottomSafeHeight = Math.max(0, screenHeight - safeAreaBottom);
    cachedBottomSafeHeight = bottomSafeHeight;

    return {
      bottomSafeHeight,
      barContentHeight,
      totalBottomBarHeight: barContentHeight + bottomSafeHeight,
    };
  } catch (error) {
    console.error("计算底部安全区域高度失败:", error);
    return {
      bottomSafeHeight: 0,
      barContentHeight,
      totalBottomBarHeight: barContentHeight,
    };
  }
}
