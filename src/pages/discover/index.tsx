import { Tag, Toast } from "@taroify/core";
import { Input, Text, View } from "@tarojs/components";
import { useState } from "react";
import PageWrapper from "~/components/PageWrapper";

const CATEGORY_TAGS = [
  { id: "all", label: "全部" },
  { id: "components", label: "基础组件" },
  { id: "layout", label: "布局模版" },
  { id: "hooks", label: "实用 Hooks" },
  { id: "utils", label: "工具函数" },
];

const DISCOVER_ITEMS = [
  {
    id: 1,
    title: "自适应沉浸式导航栏组件",
    desc: "支持微信胶囊定位、安全区域换算与毛玻璃视觉效果",
    category: "基础组件",
    stars: 256,
    icon: "i-tabler-navigation",
    tagColor: "primary" as const,
  },
  {
    id: 2,
    title: "全端通用 SafeArea 底部工具类",
    desc: "解决 iOS Home Indicator 与 Android 全面屏白条遮挡",
    category: "工具函数",
    stars: 189,
    icon: "i-tabler-device-mobile",
    tagColor: "success" as const,
  },
  {
    id: 3,
    title: "Zustand 轻量持久化状态管理器",
    desc: "模块化 Store 设计，自动同步 Taro 本地 Storage 缓存",
    category: "实用 Hooks",
    stars: 342,
    icon: "i-tabler-database",
    tagColor: "warning" as const,
  },
  {
    id: 4,
    title: "UnoCSS 跨端原子化样式规则集",
    desc: "开箱即用类 Tailwind CSS 写法，小程序体积零冗余",
    category: "布局模版",
    stars: 420,
    icon: "i-tabler-palette",
    tagColor: "primary" as const,
  },
];

/**
 * DiscoverPage：「发现」主页面，提供精美且简约的组件与模版生态占位（单一职责 SRP）。
 */
export default function DiscoverPage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [keyword, setKeyword] = useState("");

  const filteredItems = DISCOVER_ITEMS.filter((item) => {
    const matchCat = activeCategory === "all" || item.category === activeCategory;
    const matchKw = !keyword.trim() || item.title.includes(keyword) || item.desc.includes(keyword);
    return matchCat && matchKw;
  });

  const handleCardClick = (title: string) => {
    Toast.open(`已选择：${title}`);
  };

  return (
    <PageWrapper
      navTitle="发现"
      shouldShowNavigationMenu={false}
    >
      <View className="p-4 space-y-4">
        {/* 顶部搜索框占位 */}
        <View className="flex items-center gap-2.5 rounded-2xl bg-white px-4 py-2.5 shadow-sm">
          <View className="i-tabler-search text-base text-gray-400" />
          <Input
            className="w-full text-xs text-gray-800"
            placeholder="搜索组件、工具类或开发模版..."
            value={keyword}
            onInput={e => setKeyword(e.detail.value)}
          />
        </View>

        {/* 轮播精选 Banner 占位 */}
        <View className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-600 p-5 text-white shadow-sm">
          <View className="space-y-1.5">
            <View className="inline-block rounded-full bg-white/20 px-2.5 py-0.5 text-xxs font-medium">
              精选推荐
            </View>
            <Text className="block text-lg font-bold">探索生态与最佳实践</Text>
            <Text className="block text-xs text-white/85">
              内置常用跨端 UI 模式、高阶拦截器与规范示例
            </Text>
          </View>
        </View>

        {/* 分类标签栏 */}
        <View className="flex items-center gap-2 overflow-x-auto pb-1">
          {CATEGORY_TAGS.map(cat => (
            <View
              key={cat.id}
              className={`shrink-0 rounded-full px-3.5 py-1 text-xs font-medium transition-all ${
                activeCategory === cat.id
                  ? "bg-primary-6 text-white shadow-sm"
                  : "bg-white text-gray-600 active:bg-gray-100"
              }`}
              onClick={() => setActiveCategory(cat.id)}
            >
              {cat.label}
            </View>
          ))}
        </View>

        {/* 发现卡片列表 */}
        <View className="space-y-3">
          {filteredItems.map(item => (
            <View
              key={item.id}
              className="flex items-start justify-between rounded-2xl bg-white p-4 shadow-sm transition-all active:bg-gray-50"
              onClick={() => handleCardClick(item.title)}
            >
              <View className="flex items-start gap-3">
                <View className="h-10 w-10 flex-center shrink-0 rounded-xl bg-primary-1 text-xl text-primary-6">
                  <View className={item.icon} />
                </View>
                <View className="space-y-1">
                  <Text className="block text-sm text-gray-800 font-semibold">
                    {item.title}
                  </Text>
                  <Text className="block text-xs text-gray-500 leading-relaxed">
                    {item.desc}
                  </Text>
                  <View className="flex items-center gap-3 pt-1 text-xxs text-gray-400">
                    <View className="flex items-center gap-1">
                      <View className="i-tabler-tag text-xs" />
                      <Text>{item.category}</Text>
                    </View>
                    <View className="flex items-center gap-1">
                      <View className="i-tabler-star-filled text-xs text-amber-400" />
                      <Text>{item.stars}</Text>
                    </View>
                  </View>
                </View>
              </View>

              <Tag color={item.tagColor} shape="rounded">
                演示
              </Tag>
            </View>
          ))}

          {filteredItems.length === 0 && (
            <View className="py-12 text-center text-xs text-gray-400">
              暂无匹配的内容
            </View>
          )}
        </View>

        {/* 页面底部到底提示 */}
        <View className="py-4 text-center text-xs text-gray-400">
          —— 发现更多精彩内容 ——
        </View>
      </View>
      <Toast id="toast" />
    </PageWrapper>
  );
}
