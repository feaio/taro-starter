import type { CSSProperties, ReactNode } from "react";
import type { BottomBarItem } from "~/components/BottomBar";
import type { LayoutProps } from "~/components/Layout";

export interface NavigationMenuProps {
  homeUrl: string;
  menuButton: {
    top: number;
    bottom: number;
    height: number;
    left: number;
    right: number;
    width: number;
    marginRight: number;
  };
}

export interface NavigationBarProps {
  navTitle?: ReactNode;
  navHeight: number;
  statusBarHeight: number;
  menuButtonHeight: number;
  menuButtonTop: number;
  shouldShowNavigationMenu?: boolean;
  navRight?: ReactNode;
  homeUrl?: string;
  className?: string;
  style?: CSSProperties;
  shouldShowNavBar?: boolean;
  shouldShowTitle?: boolean;
  navTitleColor?: string;
  navBgColor?: string;
  renderCustomHeader?: (
    navHeight: number,
    statusBarHeight: number,
    safeAreaRight: number,
  ) => ReactNode;
}

export interface PageWrapperProps {
  /**
   * 页面主内容
   */
  children: ReactNode;

  /**
   * 页面标题（直接传入字符串或 ReactNode）
   */
  navTitle?: ReactNode;

  /**
   * 右侧自定义内容
   */
  navRight?: ReactNode;

  /**
   * 是否显示左侧返回/首页菜单（默认 true）
   */
  shouldShowNavigationMenu?: boolean;

  /**
   * 是否显示底部操作栏（默认 false）
   * @deprecated 建议使用 shouldShowBottomBar
   */
  shouldShowBottomActions?: boolean;

  /**
   * 是否显示底部导航栏 BottomBar（替代原 shouldShowBottomActions）
   */
  shouldShowBottomBar?: boolean;

  /**
   * 底部导航项配置（可选，不传则默认展示 4 项）
   */
  bottomBarItems?: BottomBarItem[];

  /**
   * 页面容器类名
   */
  className?: string;

  /**
   * 内容区域容器类名
   */
  contentClassName?: string;

  /**
   * 根容器内联样式
   */
  style?: CSSProperties;

  /**
   * 是否显示顶部导航栏（默认 true）
   */
  shouldShowNavBar?: boolean;

  /**
   * 是否显示标题文字（默认 true）
   */
  shouldShowTitle?: boolean;

  /**
   * 标题文字颜色
   */
  navTitleColor?: string;

  /**
   * 导航栏背景颜色
   */
  navBgColor?: string;

  /**
   * 是否启用下拉刷新（默认 false）
   */
  enablePullToRefresh?: boolean;

  /**
   * 下拉刷新触发的回调
   */
  onRefresh?: () => Promise<void>;

  /**
   * 是否正在刷新
   */
  isRefreshing?: boolean;

  /**
   * 自定义渲染导航栏头部的函数
   */
  renderCustomHeader?: (
    navHeight: number,
    statusBarHeight: number,
    safeAreaRight: number,
  ) => ReactNode;

  /**
   * 自定义背景类名，允许用户覆盖默认背景样式
   */
  backgroundClassName?: string;

  /**
   * 是否显示加载状态
   */
  loading?: boolean;

  /**
   * 是否需要检查隐私政策同意状态并全局弹窗（默认为 true，协议详情等特殊页面设为 false）
   */
  shouldCheckPrivacy?: boolean;
}
