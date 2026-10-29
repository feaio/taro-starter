import type { NavBarProps, NavigationProps } from "./types";
import type { NavBarMetrics } from "~/utils/safeArea";
import { View } from "@tarojs/components";
import { usePageScroll } from "@tarojs/taro";
import { useMemo, useRef, useState } from "react";
import NavigationMenu from "~/components/PageWrapper/NavigationMenu";
import { ADAPTED_PAGES, RouteNames } from "~/constants/routes";
import { getNavBarSafeHeight } from "~/utils/safeArea";

/**
 * NavBar：全局顶部导航栏渲染组件（单一职责 SRP）。
 * 依赖：NavigationMenu、NavBarMetrics。不负责：业务状态获取。
 */
export function NavBar({
  title,
  navClassName,
  renderCustomHeader,
  menuButton,
  shouldShowNavigationMenu,
}: NavBarProps & { menuButton: NavBarMetrics }) {
  const { navHeight, statusBarHeight, horizontalPadding } = menuButton;

  // 添加滚动状态跟踪，使用 ref 避免在 usePageScroll 回调中因闭包陈旧值重复触发 setState
  const [scrolled, setScrolled] = useState(false);
  const scrolledRef = useRef(false);

  // 监听页面滚动
  usePageScroll(({ scrollTop }) => {
    const shouldScroll = scrollTop > navHeight / 8;
    if (shouldScroll !== scrolledRef.current) {
      scrolledRef.current = shouldScroll;
      setScrolled(shouldScroll);
    }
  });

  return (
    <>
      {/* 实际的导航栏 - 动态样式 */}
      <View
        className={`navigation-bar fixed left-0 right-0 top-0 z-800 transition-all duration-300 ${
          scrolled ? "backdrop-blur-md bg-white/60" : ""
        }  ${navClassName || ""}`}
      >
        <View
          style={{
            height: `${navHeight}px`,
            paddingTop: `${statusBarHeight}px`,
          }}
        >
          {shouldShowNavigationMenu && (
            <NavigationMenu homeUrl={ADAPTED_PAGES[RouteNames.HOME]} menuButton={menuButton} />
          )}
          <View
            className="navigation-bar__content h-full flex flex-col items-center justify-center"
            style={{
              marginLeft: `${horizontalPadding}px`,
              marginRight: `${horizontalPadding}px`,
            }}
          >
            <View
              className={`navigation-bar__title font-chinese w-full text-ellipsis text-center text-base font-bold ${
                scrolled ? "text-text" : "text-text"
              }`}
            >
              {title}
            </View>
          </View>
        </View>
        {renderCustomHeader && renderCustomHeader(navHeight, statusBarHeight, horizontalPadding)}
      </View>
      {/* 占位元素，保持内容不被导航栏遮挡 */}
      <View className="navigation-bar__placeholder visibility-hidden relative top-[-999px]">
        <View style={{ height: `${navHeight}px`, width: "100%" }} />
        {renderCustomHeader?.(navHeight, statusBarHeight, horizontalPadding)}
      </View>
    </>
  );
}

/**
 * Navigation：全局顶部导航栏容器组件，调用带内存缓存的 getNavBarSafeHeight 计算顶部安全高度并驱动 NavBar 渲染，避免首次挂载二次重渲染（单一职责 SRP）。
 */
export default function Navigation({
  navTitle,
  navClassName,
  renderCustomHeader,
  shouldShowNavigationMenu,
}: NavigationProps) {
  const metrics = useMemo(() => getNavBarSafeHeight(), []);

  return (
    <NavBar
      title={navTitle}
      menuButton={metrics}
      shouldShowNavigationMenu={shouldShowNavigationMenu}
      navClassName={navClassName}
      renderCustomHeader={renderCustomHeader}
    />
  );
}
