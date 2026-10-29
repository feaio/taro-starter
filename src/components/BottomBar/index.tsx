import type { ReactNode } from "react";
import { Text, View } from "@tarojs/components";
import { useDidShow } from "@tarojs/taro";
import { useMemo, useState } from "react";
import { PAGES, RouteNames, TAB_BAR_ROUTES } from "~/constants/routes";
import { normalizeRoutePath, resolveCurrentPagePath, switchTab } from "~/utils/route";
import { getBottomSafeAreaHeight } from "~/utils/safeArea";

/**
 * BottomBarItem：底部导航项数据结构。
 */
export interface BottomBarItem {
  route: RouteNames;
  label: string;
  icon: string;
  showDot?: boolean;
}

/**
 * DEFAULT_BOTTOM_BAR_ITEMS：默认通用 4 项底部导航配置（首页、发现、消息、我的）。
 */
export const DEFAULT_BOTTOM_BAR_ITEMS: BottomBarItem[] = [
  {
    route: RouteNames.HOME,
    label: "首页",
    icon: "i-tabler-home-filled",
  },
  {
    route: RouteNames.DISCOVER,
    label: "发现",
    icon: "i-tabler-compass-filled",
  },
  {
    route: RouteNames.MESSAGES,
    label: "消息",
    icon: "i-tabler-bell-filled",
  },
  {
    route: RouteNames.PROFILE,
    label: "我的",
    icon: "i-tabler-user-filled",
  },
];

export interface BottomBarProps {
  /**
   * 底部导航项列表，支持传入 2 个或多个导航项（默认使用首页、发现、消息、我的）
   */
  items?: BottomBarItem[];
  /**
   * 指定允许显示 BottomBar 的特定路由列表（默认仅在 TAB_BAR_ROUTES 页面出现）
   */
  visibleRoutes?: RouteNames[];
}

/**
 * BottomBar：全局贴底导航栏组件，适配底部安全区与激活态切换（单一职责 SRP）。
 * 依赖：~/constants/routes、~/utils/route、~/utils/safeArea。
 */
export default function BottomBar({
  items = DEFAULT_BOTTOM_BAR_ITEMS,
  visibleRoutes = TAB_BAR_ROUTES,
}: BottomBarProps) {
  const [currentPage, setCurrentPage] = useState<string>(() => resolveCurrentPagePath());
  // 安全区指标在设备会话期间恒定不变，使用 useMemo 直接读取内存缓存，消除每次切 Tab 的 setState 二次渲染
  const safeMetrics = useMemo(() => getBottomSafeAreaHeight(56), []);

  useDidShow(() => {
    const nextPath = resolveCurrentPagePath();
    setCurrentPage(prev => (prev === nextPath ? prev : nextPath));
  });

  const resolvedItems = items && items.length >= 2 ? items : DEFAULT_BOTTOM_BAR_ITEMS;

  // 判断当前页面是否属于允许展示 BottomBar 的特定页面
  const isVisiblePage = visibleRoutes.some((route) => {
    const allowedPath = normalizeRoutePath(PAGES[route]);
    return Boolean(currentPage) && currentPage === allowedPath;
  });

  const isCurrentTab = (route: RouteNames) => {
    const targetPath = normalizeRoutePath(PAGES[route]);
    return Boolean(currentPage) && currentPage === targetPath;
  };

  function handleTabSwitch(route: RouteNames) {
    if (!isCurrentTab(route)) {
      switchTab(route);
    }
  }

  if (!isVisiblePage) {
    return null;
  }

  const { barContentHeight, bottomSafeHeight, totalBottomBarHeight } = safeMetrics;

  return (
    <>
      <View
        className="bottom-bar fixed bottom-0 left-0 right-0 z-800 box-border border-t border-[#ECEEF2] bg-white/96 backdrop-blur-md"
        style={{
          height: `${totalBottomBarHeight}px`,
          paddingBottom: `${bottomSafeHeight}px`,
        }}
      >
        <View
          className="box-border w-full flex items-center justify-around px-2 pb-1 pt-2"
          style={{ height: `${barContentHeight}px` }}
        >
          {resolvedItems.map((item) => {
            const active = isCurrentTab(item.route);
            return (
              <BottomBarButton
                key={item.route}
                active={active}
                icon={item.icon}
                label={item.label}
                showUnreadDot={Boolean(item.showDot)}
                onClick={() => handleTabSwitch(item.route)}
              />
            );
          })}
        </View>
      </View>
      {/* 底部等高占位元素，防止贴底导航栏遮挡页面底部内容 */}
      <View
        className="bottom-bar__placeholder w-full shrink-0"
        style={{ height: `${totalBottomBarHeight}px` }}
      />
    </>
  );
}

interface BottomBarButtonProps {
  active: boolean;
  icon: string;
  label: ReactNode;
  showUnreadDot?: boolean;
  onClick: () => void;
}

/**
 * BottomBarButton：底部导航单项按钮渲染组件（单一职责 SRP）。
 */
function BottomBarButton({ active, icon, label, showUnreadDot = false, onClick }: BottomBarButtonProps) {
  return (
    <View
      className={`h-full flex flex-1 flex-col items-center justify-center gap-1 text-xxs font-medium transition-colors duration-150 active:opacity-75 ${
        active ? "text-[#217DC2]" : "text-[#9CA3AF]"
      }`}
      onClick={onClick}
    >
      <View className="relative h-5.5 w-5.5 flex-center">
        <View
          className={`${icon} h-5.5 w-5.5`}
          style={{ fontSize: "22px" }}
        />
        {showUnreadDot && (
          <View className="pointer-events-none absolute h-2 w-2 rounded-full bg-[#EF4444] ring-1.5 ring-white -right-1.25 -top-0.5" />
        )}
      </View>
      <Text className="text-xxs font-medium leading-none">{label}</Text>
    </View>
  );
}
