import type { ReactNode } from "react";
import type { PageWrapperProps } from "./types";
import { ConfigProvider, PullRefresh } from "@taroify/core";
import { View } from "@tarojs/components";
import BottomBar from "~/components/BottomBar";
import LoadingAnimation from "~/components/LoadingAnimation";
import { useTheme } from "~/hooks/useTheme";
import Navigation from "./Navigation";

/**
 * PageWrapper（全局 Layout）：包裹所有页面的统一布局容器，默认自带 w-full h-full，集成顶部安全导航栏 NavBar、下拉刷新、Loading 遮罩及底部导航栏 BottomBar（单一职责 SRP）。
 * 依赖：Navigation、BottomBar、useTheme。不负责：具体页面业务逻辑。
 */
export default function PageWrapper({
  navTitle,
  navClassName,
  renderCustomHeader,
  children,
  isRefreshing,
  className = "",
  shouldShowNavigation = true,
  shouldShowNavigationMenu = true,
  shouldShowBottomActions = true,
  shouldShowBottomBar,
  bottomBarItems,
  onRefresh,
  enablePullToRefresh = false,
  backgroundClassName,
  loading = false,
}: PageWrapperProps) {
  const { getThemeVars } = useTheme();

  const showBottom = shouldShowBottomBar !== undefined ? shouldShowBottomBar : shouldShowBottomActions;

  // 判断 navTitle 是字符串还是 JSX 元素，并进行相应处理:
  const resolvedNavTitle: ReactNode
    = typeof navTitle === "string"
      ? (
          <View className="text-text font-bold">{navTitle}</View>
        )
      : (
          navTitle
        );

  // 主要内容：默认自带 h-full w-full，调用方无需重复传入
  const content = (
    <View className={`h-full w-full flex-1 ${className}`.trim()}>
      {children}
    </View>
  );

  // 动态计算背景样式：如果提供了 `backgroundClassName` 则优先使用，否则使用默认样式
  const wrapperBackgroundClass = backgroundClassName || "bg-gray-1 bg-opacity-10";

  return (
    <ConfigProvider theme={getThemeVars()}>
      <View className={`page-wrapper global-layout h-full min-h-screen w-full flex flex-col ${wrapperBackgroundClass} relative`}>
        {/* 顶部导航栏组件 */}
        {shouldShowNavigation && (
          <Navigation
            navTitle={resolvedNavTitle}
            navClassName={navClassName}
            shouldShowNavigationMenu={shouldShowNavigationMenu}
            renderCustomHeader={renderCustomHeader}
          />
        )}
        {/* 根据 enablePullToRefresh 决定是否启用下拉刷新 */}
        {enablePullToRefresh
          ? (
              <PullRefresh
                loading={isRefreshing}
                onRefresh={onRefresh}
                className="h-full w-full flex-1"
              >
                {content}
              </PullRefresh>
            )
          : (
              content
            )}
        {/* Loading遮罩层 */}
        {loading && (
          <View className="absolute inset-0 z-50 flex items-center justify-center bg-white bg-opacity-80">
            <LoadingAnimation />
          </View>
        )}
        {/* 底部导航栏组件 */}
        {showBottom && (
          <BottomBar items={bottomBarItems} />
        )}
      </View>
    </ConfigProvider>
  );
}
