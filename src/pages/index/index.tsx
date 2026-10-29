import { Avatar, Tag, Toast } from "@taroify/core";
import { Text, View } from "@tarojs/components";
import Taro from "@tarojs/taro";
import { useState } from "react";
import PageWrapper from "~/components/PageWrapper";
import { RouteNames } from "~/constants/routes";
import { useAuthStore } from "~/store";
import { withMemberAuth } from "~/utils/memberGuard";
import { navigateTo, switchTab } from "~/utils/route";
import "./index.scss";

const QUICK_ENTRIES = [
  { label: "权限守卫", icon: "i-tabler-shield-check", bg: "bg-blue-50", color: "text-blue-500", type: "auth" },
  { label: "生态发现", icon: "i-tabler-compass", bg: "bg-purple-50", color: "text-purple-500", type: "discover" },
  { label: "消息中心", icon: "i-tabler-bell", bg: "bg-emerald-50", color: "text-emerald-500", type: "messages" },
  { label: "个人中心", icon: "i-tabler-user", bg: "bg-orange-50", color: "text-orange-500", type: "profile" },
];

const STARTER_FEATURES = [
  {
    id: 1,
    title: "Single-Flight 并发请求队列",
    desc: "解决并发请求下 Token 自动刷新与无感重登的竞态问题",
    tag: "网络层",
    tagColor: "primary" as const,
  },
  {
    id: 2,
    title: "Zustand 全局状态与 Storage 持久化",
    desc: "轻量响应式状态，解耦业务模块，兼具高性能与良好可维护性",
    tag: "状态层",
    tagColor: "success" as const,
  },
  {
    id: 3,
    title: "自适应自定义导航栏与底部安全区",
    desc: "一套公式兼容 iOS、Android、小程序胶囊与 H5 异形屏",
    tag: "布局组件",
    tagColor: "warning" as const,
  },
  {
    id: 4,
    title: "细粒度权限拦截器 (MemberGuard)",
    desc: "通过高阶函数无缝包装事件处理，拦截未授权操作",
    tag: "守卫",
    tagColor: "primary" as const,
  },
];

const ARTICLES = [
  {
    id: "a1",
    title: "为什么大型小程序要把请求队列做成 Single-Flight 单飞模式？",
    summary: "深入剖析并发请求场景下 Token 失效重刷与初始静默登录的竞态问题与优雅解法。",
    reads: "3.2k 阅读",
    date: "10分钟前",
  },
  {
    id: "a2",
    title: "高内聚低耦合：前端状态层如何平衡持久化 Storage 与响应式 Store",
    summary: "对比本地缓存与 Zustand 的职责边界，避免状态不同步导致视图不刷新的常见陷阱。",
    reads: "2.8k 阅读",
    date: "2小时前",
  },
  {
    id: "a3",
    title: "全面屏时代的小程序顶部胶囊与底部 Home Indicator 安全区域计算指南",
    summary: "一套公式兼容 iOS、Android 与 H5 多端异形屏，告别固定像素硬编码。",
    reads: "5.1k 阅读",
    date: "昨天",
  },
  {
    id: "a4",
    title: "从零构建可扩展的多端组件库：主题变量与原子化样式的结合",
    summary: "如何利用 CSS Variables 配合 UnoCSS 实现丝滑的明暗主题切换与品牌色定制。",
    reads: "3天前",
  },
];

/**
 * Index：首页视图，展示 Taro Starter 开源跨端模版核心特性、功能组件演示及架构指南，支持完整纵向滚动（单一职责 SRP）。
 */
export default function Index() {
  const [isToggled, setIsToggled] = useState(false);
  const { isMember, account } = useAuthStore();

  const toggleSwitch = () => {
    setIsToggled(prev => !prev);
  };

  // 受会员权限保护的功能点击演示
  const handleVipFeatureClick = withMemberAuth((featureTitle: string) => {
    Toast.open(`已激活专属功能：${featureTitle}`);
  });

  const handleQuickEntryClick = (type: string) => {
    switch (type) {
      case "auth":
        navigateTo(RouteNames.LOGIN);
        break;
      case "discover":
        switchTab(RouteNames.DISCOVER);
        break;
      case "messages":
        switchTab(RouteNames.MESSAGES);
        break;
      case "profile":
        switchTab(RouteNames.PROFILE);
        break;
      default:
        break;
    }
  };

  return (
    <PageWrapper
      navTitle="首页"
      shouldShowNavigationMenu={false}
    >
      <View className="p-4 space-y-6">
        {/* 1. 顶部欢迎与用户信息区 */}
        <View
          className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm"
          onClick={() => switchTab(RouteNames.PROFILE)}
        >
          <View className="flex items-center space-x-3">
            <View className="wave-hand text-3xl">👋</View>
            <View>
              <View className="flex items-center space-x-2">
                <Text className="text-lg text-gray-800 font-bold">
                  你好，
                  {account || "开发者"}
                </Text>
                <Tag color={isMember ? "success" : "primary"} shape="rounded">
                  {isMember ? "会员用户" : "体验用户"}
                </Tag>
              </View>
              <Text className="mt-0.5 block text-xs text-gray-500">
                欢迎使用 Taro Starter 开源跨端模版
              </Text>
            </View>
          </View>
          <Avatar src="https://avatars.githubusercontent.com/u/17453452?v=4" size="large" />
        </View>

        {/* 2. 主视觉横幅 Banner */}
        <View className="relative overflow-hidden rounded-3xl bg-primary-6 p-5 text-white shadow-md">
          <View className="relative z-10 space-y-2">
            <View className="inline-block rounded-full bg-white/20 px-3 py-0.5 text-xs font-medium">
              Taro 4 + React 18 Starter
            </View>
            <Text className="block text-xl font-bold">企业级跨端开发脚手架</Text>
            <Text className="block text-xs text-white/85">
              开箱即用 · UnoCSS 原子化 · Zustand 状态管理 · 路由安全守卫
            </Text>
            <View className="pt-2">
              <View
                className="inline-flex items-center rounded-full bg-white px-4 py-1.5 text-xs text-primary-6 font-bold shadow-sm active:opacity-90"
                onClick={() => switchTab(RouteNames.DISCOVER)}
              >
                探索发现生态
                <View className="i-tabler-arrow-right ml-1 text-sm" />
              </View>
            </View>
          </View>
        </View>

        {/* 3. 金刚区快捷入口 */}
        <View className="grid grid-cols-4 gap-3 rounded-2xl bg-white p-4 shadow-sm">
          {QUICK_ENTRIES.map(entry => (
            <View
              key={entry.label}
              className="flex flex-col items-center justify-center space-y-1.5 active:opacity-75"
              onClick={() => handleQuickEntryClick(entry.type)}
            >
              <View className={`h-12 w-12 flex items-center justify-center rounded-2xl ${entry.bg}`}>
                <View className={`${entry.icon} text-2xl ${entry.color}`} />
              </View>
              <Text className="text-xs text-gray-700 font-medium">{entry.label}</Text>
            </View>
          ))}
        </View>

        {/* 4. 模版技术指标与交互卡片区 */}
        <View className="flex space-x-4">
          <View className="flex-1 rounded-2xl bg-indigo-600 p-4 text-white shadow-sm">
            <View className="mb-1 flex items-center justify-between">
              <Text className="text-sm font-medium opacity-90">模版集成度</Text>
              <View className="i-tabler-chart-bar text-lg opacity-80" />
            </View>
            <View className="my-2 flex items-baseline space-x-1">
              <Text className="text-3xl font-bold">100</Text>
              <Text className="text-xs opacity-80">%</Text>
            </View>
            <Text className="mt-2 block text-xs opacity-85">TypeScript 严格模式覆盖</Text>
          </View>

          <View className="flex-1 space-y-3">
            <View className="rounded-2xl bg-white p-3.5 shadow-sm">
              <View className="mb-2 flex items-center justify-between">
                <View className="flex items-center space-x-1.5">
                  <View className="i-mdi-bell-ring text-base text-purple-500" />
                  <Text className="text-sm text-gray-800 font-medium">功能开关演示</Text>
                </View>
              </View>
              <View className="my-1.5 flex justify-center">
                <View
                  className={`h-6 w-12 cursor-pointer rounded-full p-1 transition-all duration-300 ${isToggled ? "bg-primary-6" : "bg-gray-200"}`}
                  onClick={toggleSwitch}
                >
                  <View
                    className="h-4 w-4 transform rounded-full bg-white shadow-md transition-transform duration-300 ease-in-out"
                    style={{ transform: isToggled ? `translateX(${Taro.pxTransform(48)})` : "translateX(0)" }}
                  />
                </View>
              </View>
              <Text className="block text-center text-xs text-gray-500">
                {isToggled ? "当前状态：已开启" : "当前状态：已关闭"}
              </Text>
            </View>
          </View>
        </View>

        {/* 5. 核心特性与模块演示 */}
        <View className="space-y-3">
          <View className="flex items-center justify-between">
            <View className="flex items-center space-x-2">
              <Text className="text-lg text-gray-800 font-bold">核心功能特性</Text>
              <Tag color="primary" shape="rounded">
                {STARTER_FEATURES.length}
              </Tag>
            </View>
          </View>

          <View className="space-y-3">
            {STARTER_FEATURES.map(feature => (
              <View
                key={feature.id}
                className="rounded-2xl bg-white p-4 shadow-sm space-y-2 active:bg-gray-50"
                onClick={() => handleVipFeatureClick(feature.title)}
              >
                <View className="flex items-start justify-between">
                  <View className="flex-1 pr-2 space-y-1">
                    <Text className="block text-base text-gray-800 font-semibold leading-snug">
                      {feature.title}
                    </Text>
                    <Text className="block text-xs text-gray-500">{feature.desc}</Text>
                  </View>
                  <Tag color={feature.tagColor} shape="rounded">
                    {feature.tag}
                  </Tag>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* 6. 技术专栏文章列表 */}
        <View className="space-y-3">
          <View className="flex items-center justify-between">
            <Text className="text-lg text-gray-800 font-bold">技术实战专栏</Text>
            <Text className="text-xs text-gray-400">跨端架构深度好文</Text>
          </View>

          <View className="space-y-3">
            {ARTICLES.map(article => (
              <View
                key={article.id}
                className="rounded-2xl bg-white p-4 shadow-sm space-y-2 active:bg-gray-50"
                onClick={() => Toast.open(`正在阅读：${article.title}`)}
              >
                <Text className="block text-base text-gray-800 font-semibold leading-snug">
                  {article.title}
                </Text>
                <Text className="block text-xs text-gray-500 leading-relaxed">
                  {article.summary}
                </Text>
                <View className="flex items-center justify-between pt-1 text-xs text-gray-400">
                  <Text>{article.reads}</Text>
                  <Text>{article.date}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* 底部到底提示 */}
        <View className="py-4 text-center text-xs text-gray-400">
          —— Taro Starter 助力高效跨端开发 ——
        </View>
      </View>
      <Toast id="toast" />
    </PageWrapper>
  );
}
