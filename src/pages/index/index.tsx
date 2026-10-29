import { Avatar, Tag, Toast } from "@taroify/core";
import { Image, Text, View } from "@tarojs/components";
import Taro, { useLoad } from "@tarojs/taro";
import { useState } from "react";
import { cache } from "~/cache";
import PageWrapper from "~/components/PageWrapper";
import PrivacyPolicyPopup from "~/components/PrivacyPolicyPopup";
import { RouteNames } from "~/constants/routes";
import { useAuthStore } from "~/store";
import { withMemberAuth } from "~/utils/memberGuard";
import { switchTab } from "~/utils/route";
import "./index.scss";

const QUICK_ENTRIES = [
  { label: "热门课程", icon: "i-tabler-flame", bg: "bg-orange-50", color: "text-orange-500", route: RouteNames.ONLINE_COURSES },
  { label: "学习计划", icon: "i-tabler-calendar-check", bg: "bg-blue-50", color: "text-blue-500", route: RouteNames.TRAINING_PLAN },
  { label: "技能认证", icon: "i-tabler-certificate", bg: "bg-emerald-50", color: "text-emerald-500", route: RouteNames.TRAINING_PLAN },
  { label: "名师答疑", icon: "i-tabler-messages", bg: "bg-purple-50", color: "text-purple-500", route: RouteNames.PROFILE },
];

const FEATURED_COURSES = [
  {
    id: 1,
    title: "Taro 4 跨端企业级实战与架构设计",
    instructor: "林导师 · 资深前端架构师",
    students: 1280,
    lessons: 24,
    tag: "精选进阶",
    tagColor: "primary" as const,
    progress: 65,
  },
  {
    id: 2,
    title: "React 18 并发渲染与 Zustand 状态管理最佳实践",
    instructor: "陈导师 · 核心技术专家",
    students: 960,
    lessons: 18,
    tag: "高分必学",
    tagColor: "success" as const,
    progress: 30,
  },
  {
    id: 3,
    title: "TypeScript 6 类型体操与全栈工程化体系搭建",
    instructor: "王导师 · 开源项目维护者",
    students: 2150,
    lessons: 32,
    tag: "限时热门",
    tagColor: "warning" as const,
    progress: 0,
  },
  {
    id: 4,
    title: "UnoCSS 原子化 CSS 与多端视觉还原技巧",
    instructor: "赵导师 · UI 工程专家",
    students: 740,
    lessons: 12,
    tag: "实战速成",
    tagColor: "primary" as const,
    progress: 100,
  },
];

const WEEKLY_TASKS = [
  { id: "t1", day: "周一", title: "完成小程序自定义导航栏与安全区适配", time: "45 分钟", done: true },
  { id: "t2", day: "周二", title: "掌握单飞请求队列与 401 自动无感重登", time: "60 分钟", done: true },
  { id: "t3", day: "周三", title: "练习高阶函数拦截器与会员权限路由守卫", time: "50 分钟", done: false },
  { id: "t4", day: "周四", title: "深入 React Query 服务端缓存与乐观更新", time: "90 分钟", done: false },
  { id: "t5", day: "周五", title: "多端打包构建优化与分包加载策略实操", time: "60 分钟", done: false },
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
    reads: "1.9k 阅读",
    date: "3天前",
  },
];

/**
 * Index：首页视图，包含学习概览、快捷金刚区、推荐课程、本周打卡计划及技术专栏列表，支持完整纵向滚动（单一职责 SRP）。
 */
export default function Index() {
  const [isToggled, setIsToggled] = useState(false);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const { isMember, account } = useAuthStore();

  useLoad(() => {
    const hasAgreed = cache.getSync("privacyAgreed");
    if (!hasAgreed) {
      setShowPrivacyPolicy(true);
    }
  });

  if (showPrivacyPolicy) {
    return (
      <PageWrapper
        navTitle="首页"
        shouldShowBottomActions={false}
      >
        <PrivacyPolicyPopup
          open={showPrivacyPolicy}
          onClose={() => setShowPrivacyPolicy(false)}
        />
      </PageWrapper>
    );
  }

  const toggleSwitch = () => {
    setIsToggled(prev => !prev);
  };

  const handleVipCourseClick = withMemberAuth((courseTitle: string) => {
    Toast.open(`开始学习：${courseTitle}`);
  });

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
                  {isMember ? "尊享会员" : "体验版"}
                </Tag>
              </View>
              <Text className="mt-0.5 block text-xs text-gray-500">
                今日已坚持学习 45 分钟，继续保持！
              </Text>
            </View>
          </View>
          <Avatar src="https://avatars.githubusercontent.com/u/17453452?v=4" size="large" />
        </View>

        {/* 2. 主视觉横幅 Banner */}
        <View
          className="relative overflow-hidden rounded-3xl bg-primary-6 p-5 text-white shadow-md"
          onClick={() => switchTab(RouteNames.ONLINE_COURSES)}
        >
          <View className="relative z-10 space-y-2">
            <View className="inline-block rounded-full bg-white/20 px-3 py-0.5 text-xs font-medium">
              2026 秋季特训营
            </View>
            <Text className="block text-xl font-bold">前端多端架构师进阶之路</Text>
            <Text className="block text-xs text-white/85">
              涵盖 Taro 4 · React 18 · TypeScript · 高并发架构实战
            </Text>
            <View className="pt-2">
              <View className="inline-flex items-center rounded-full bg-white px-4 py-1.5 text-xs text-primary-6 font-bold shadow-sm">
                立即探索课程
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
              className="flex flex-col items-center justify-center space-y-1.5"
              onClick={() => switchTab(entry.route)}
            >
              <View className={`h-12 w-12 flex items-center justify-center rounded-2xl ${entry.bg}`}>
                <View className={`${entry.icon} text-2xl ${entry.color}`} />
              </View>
              <Text className="text-xs text-gray-700 font-medium">{entry.label}</Text>
            </View>
          ))}
        </View>

        {/* 4. 学习数据与交互卡片区 */}
        <View className="flex space-x-4">
          <View
            className="flex-1 rounded-2xl bg-indigo-600 p-4 text-white shadow-sm"
            onClick={() => switchTab(RouteNames.TRAINING_PLAN)}
          >
            <View className="mb-1 flex items-center justify-between">
              <Text className="text-sm font-medium opacity-90">累计学习时长</Text>
              <View className="i-tabler-chart-bar text-lg opacity-80" />
            </View>
            <View className="my-2 flex items-baseline space-x-1">
              <Text className="text-3xl font-bold">32.5</Text>
              <Text className="text-xs opacity-80">小时</Text>
            </View>
            <Avatar.Group>
              {[1, 2, 3].map(i => (
                <Avatar key={i} src={`https://avatars.githubusercontent.com/u/17453452?v=${i}`} size="small" />
              ))}
            </Avatar.Group>
            <Text className="mt-2 block text-xs opacity-85">已超越 86% 的同期学员</Text>
          </View>

          <View className="flex-1 space-y-3">
            <View className="rounded-2xl bg-white p-3.5 shadow-sm">
              <View className="mb-2 flex items-center justify-between">
                <View className="flex items-center space-x-1.5">
                  <View className="i-mdi-bell-ring text-base text-purple-500" />
                  <Text className="text-sm text-gray-800 font-medium">每日学习提醒</Text>
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
                {isToggled ? "已开启 20:00 晚间提醒" : "点击开启晚间提醒"}
              </Text>
            </View>

            <View
              className="rounded-2xl bg-white p-3.5 shadow-sm"
              onClick={() => switchTab(RouteNames.ONLINE_COURSES)}
            >
              <View className="flex items-center space-x-2">
                <View className="h-8 w-8 flex items-center justify-center rounded-xl bg-emerald-50">
                  <View className="i-tabler-award text-lg text-emerald-600" />
                </View>
                <View>
                  <Text className="block text-sm text-gray-800 font-medium">阶段测评</Text>
                  <Text className="block text-xs text-gray-500">本周还有 1 次待完成</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* 5. 精选在线课程（点击带会员拦截体验） */}
        <View className="space-y-3">
          <View className="flex items-center justify-between">
            <View className="flex items-center space-x-2">
              <Text className="text-lg text-gray-800 font-bold">精选在线课程</Text>
              <Tag color="primary" shape="rounded">
                {FEATURED_COURSES.length}
              </Tag>
            </View>
            <View
              className="flex items-center text-sm text-primary-6 font-medium"
              onClick={() => switchTab(RouteNames.ONLINE_COURSES)}
            >
              <Text>全部课程</Text>
              <View className="i-tabler-chevron-right text-base" />
            </View>
          </View>

          <View className="space-y-3">
            {FEATURED_COURSES.map(course => (
              <View
                key={course.id}
                className="rounded-2xl bg-white p-4 shadow-sm space-y-3"
                onClick={() => handleVipCourseClick(course.title)}
              >
                <View className="flex items-start justify-between">
                  <View className="flex-1 pr-2 space-y-1">
                    <Text className="block text-base text-gray-800 font-semibold leading-snug">
                      {course.title}
                    </Text>
                    <Text className="block text-xs text-gray-500">{course.instructor}</Text>
                  </View>
                  <Tag color={course.tagColor} shape="rounded">
                    {course.tag}
                  </Tag>
                </View>

                <View className="space-y-1.5">
                  <View className="flex items-center justify-between text-xs text-gray-500">
                    <Text>
                      共
                      {course.lessons}
                      {" "}
                      节 ·
                      {" "}
                      {course.students}
                      {" "}
                      人在学
                    </Text>
                    <Text className="text-primary-6 font-medium">
                      学习进度
                      {" "}
                      {course.progress}
                      %
                    </Text>
                  </View>
                  <View className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                    <View
                      className="h-full rounded-full bg-primary-6"
                      style={{ width: `${course.progress}%` }}
                    />
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* 6. 本周培训打卡计划 */}
        <View className="space-y-3">
          <View className="flex items-center justify-between">
            <Text className="text-lg text-gray-800 font-bold">本周培训日程</Text>
            <View
              className="flex items-center text-sm text-primary-6 font-medium"
              onClick={() => switchTab(RouteNames.TRAINING_PLAN)}
            >
              <Text>查看计划</Text>
              <View className="i-tabler-chevron-right text-base" />
            </View>
          </View>

          <View className="rounded-2xl bg-white p-4 shadow-sm space-y-3">
            {WEEKLY_TASKS.map(task => (
              <View
                key={task.id}
                className="flex items-center justify-between border-b border-gray-50 pb-3 last:border-none last:pb-0"
              >
                <View className="flex items-center space-x-3">
                  <View
                    className={`h-8 w-10 flex items-center justify-center rounded-lg text-xs font-bold ${
                      task.done ? "bg-emerald-50 text-emerald-600" : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {task.day}
                  </View>
                  <View className="space-y-0.5">
                    <Text
                      className={`block text-sm font-medium ${
                        task.done ? "text-gray-400 line-through" : "text-gray-800"
                      }`}
                    >
                      {task.title}
                    </Text>
                    <Text className="block text-xs text-gray-400">
                      预计耗时：
                      {task.time}
                    </Text>
                  </View>
                </View>
                <View
                  className={
                    task.done
                      ? "i-tabler-circle-check-filled text-xl text-emerald-500"
                      : "i-tabler-circle text-xl text-gray-300"
                  }
                />
              </View>
            ))}
          </View>
        </View>

        {/* 7. 堆叠式卡片展示区 */}
        <View className="space-y-3">
          <View className="flex items-center justify-between">
            <Text className="text-lg text-gray-800 font-bold">最新动态</Text>
            <Text className="text-xs text-gray-400">实时更新</Text>
          </View>
          <View className="relative m-0" style={{ height: Taro.pxTransform(230) }}>
            {[1, 2, 3].map((item, index) => (
              <View
                key={item}
                className="absolute w-full"
                style={{
                  top: 0,
                  left: 0,
                  right: 0,
                  transform: `translateY(${Taro.pxTransform(index * 70)}) scale(${1 - index * 0.04})`,
                  zIndex: 4 - index,
                }}
              >
                <View className="flex items-center rounded-xl bg-white p-4 shadow-md">
                  <Image
                    className="mr-3 h-9 w-9 rounded-full"
                    src={`https://avatars.githubusercontent.com/u/17453452?v=${item}`}
                  />
                  <View className="flex-1">
                    <View className="text-sm text-gray-800 font-semibold">
                      实战训练营第
                      {" "}
                      {item}
                      {" "}
                      期已开启报名
                    </View>
                    <View className="truncate text-xs text-gray-500">
                      完成全部课时与实操考核即可获取结业认证证书
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* 8. 技术专栏文章列表（加长页面以充分测试顶部毛玻璃导航栏与底部贴底安全区滚动效果） */}
        <View className="space-y-3">
          <View className="flex items-center justify-between">
            <Text className="text-lg text-gray-800 font-bold">技术实战专栏</Text>
            <Text className="text-xs text-gray-400">每周精选深度好文</Text>
          </View>

          <View className="space-y-3">
            {ARTICLES.map(article => (
              <View
                key={article.id}
                className="rounded-2xl bg-white p-4 shadow-sm space-y-2"
                onClick={() => handleVipCourseClick(article.title)}
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
          —— 已经到底啦，快去开启今日学习吧 ——
        </View>
      </View>
      <Toast id="toast" />
    </PageWrapper>
  );
}
