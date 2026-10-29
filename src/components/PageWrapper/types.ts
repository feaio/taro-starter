import type { ReactNode } from "react";
import type { BottomBarItem } from "~/components/BottomBar";

/**
 * 菜单按钮信息接口
 * Menu button information interface
 */
export interface MenuButtonInfo {
  /**
   * 按钮顶部距离屏幕顶部的距离（单位像素）
   */
  top: number;

  /**
   * 按钮高度（单位像素）
   */
  height: number;

  /**
   * 状态栏高度（单位像素）
   */
  statusBarHeight: number;

  /**
   * 按钮宽度（单位像素）
   */
  width: number;

  /**
   * 按钮右边距（单位像素）
   */
  marginRight: number;
}

/**
 * Navigation 组件的 props 接口
 */
export interface NavigationProps {
  /**
   * 导航栏标题
   */
  navTitle?: ReactNode;

  /**
   * 导航栏自定义类名
   */
  navClassName?: string;

  /**
   * 是否显示导航菜单
   */
  shouldShowNavigationMenu: boolean;

  /**
   * 自定义渲染导航栏头部的函数
   */
  renderCustomHeader?: (
    navHeight: number,
    statusBarHeight: number,
    safeAreaRight: number,
  ) => ReactNode;
}

/**
 * NavBar 组件的 props 接口
 */
export interface NavBarProps extends NavigationProps {
  /**
   * 导航栏标题
   */
  title: ReactNode;

  /**
   * 菜单按钮信息
   */
  menuButton: MenuButtonInfo;
}

/**
 * NavigationMenu 组件的 props 接口
 */
export interface NavigationMenuProps {
  /**
   * 首页 URL
   */
  homeUrl: string;

  /**
   * 菜单按钮信息
   */
  menuButton: MenuButtonInfo;
}

/**
 * PageWrapper（全局 Layout）组件的 props 接口
 */
export interface PageWrapperProps {
  /**
   * 容器类名
   */
  className?: string;

  /**
   * 子组件
   */
  children: ReactNode;

  /**
   * 是否显示顶部导航栏
   */
  shouldShowNavigation?: boolean;

  /**
   * 是否显示顶部导航返回/首页菜单
   */
  shouldShowNavigationMenu?: boolean;

  /**
   * 是否显示底部导航栏（兼容旧属性名）
   */
  shouldShowBottomActions?: boolean;

  /**
   * 是否显示底部导航栏（BottomBar）
   */
  shouldShowBottomBar?: boolean;

  /**
   * 自定义底部导航项（支持 3 个或 4 个）
   */
  bottomBarItems?: BottomBarItem[];

  /**
   * 导航栏标题
   */
  navTitle?: ReactNode;

  /**
   * 导航栏自定义类名
   */
  navClassName?: string;

  /**
   * 是否启用下拉刷新
   */
  enablePullToRefresh?: boolean;

  /**
   * 刷新回调函数
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
}
