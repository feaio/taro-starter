import { Toast } from "@taroify/core";
import { Text, View } from "@tarojs/components";
import { useMemo, useState } from "react";
import PageWrapper from "~/components/PageWrapper";

interface DemoMessage {
  id: string;
  type: "system" | "notification";
  title: string;
  content: string;
  time: string;
  read: boolean;
}

const INITIAL_MESSAGES: DemoMessage[] = [
  {
    id: "m-1",
    type: "system",
    title: "欢迎体验 Taro Starter 开源跨端模版",
    content: "本项目基于 Taro 4 与 React 18 构建，集成了 UnoCSS、Zustand 与全端安全区适配方案。",
    time: "10分钟前",
    read: false,
  },
  {
    id: "m-2",
    type: "notification",
    title: "样式引擎已升级至 UnoCSS 66.x",
    content: "全新升级的原子化样式规则集，编译更迅速，多端小程序样式隔离更彻底。",
    time: "2小时前",
    read: false,
  },
  {
    id: "m-3",
    type: "system",
    title: "跨端安全区自动适配检测",
    content: "已成功识别当前设备屏幕指标并自动注入底部贴底安全区内边距。",
    time: "昨天",
    read: true,
  },
  {
    id: "m-4",
    type: "notification",
    title: "网络请求 Single-Flight 机制运行中",
    content: "并发网络请求单飞队列已就绪，自动处理 Token 刷新与竞态问题。",
    time: "3天前",
    read: true,
  },
];

/**
 * MessagesPage：「消息」主页面，提供精美且简约的通知消息占位（单一职责 SRP）。
 */
export default function MessagesPage() {
  const [messages, setMessages] = useState<DemoMessage[]>(INITIAL_MESSAGES);
  const [filterType, setFilterType] = useState<"all" | "system" | "notification">("all");

  const unreadCount = useMemo(
    () => messages.filter(m => !m.read).length,
    [messages],
  );

  const filteredMessages = useMemo(() => {
    if (filterType === "all") {
      return messages;
    }
    return messages.filter(m => m.type === filterType);
  }, [messages, filterType]);

  const handleMarkAllRead = () => {
    if (unreadCount === 0) {
      Toast.open("暂无未读消息");
      return;
    }
    setMessages(prev => prev.map(m => ({ ...m, read: true })));
    Toast.open("已全部标记为已读");
  };

  const handleMessageClick = (id: string) => {
    setMessages(prev => prev.map(m => (m.id === id ? { ...m, read: true } : m)));
    Toast.open("已标记该消息为已读");
  };

  return (
    <PageWrapper
      navTitle="消息"
      shouldShowNavigationMenu={false}
    >
      <View className="p-4 space-y-4">
        {/* 顶部标题与一键已读操作 */}
        <View className="flex items-center justify-between">
          <View className="flex items-center gap-2">
            <Text className="text-lg text-gray-800 font-bold">通知中心</Text>
            {unreadCount > 0 && (
              <View className="rounded-full bg-red-500 px-2 py-0.5 text-xxs text-white font-semibold">
                {unreadCount}
                {" "}
                未读
              </View>
            )}
          </View>
          <View
            className={`border border-primary-6/30 rounded-full bg-primary-1 px-3 py-1 text-xs text-primary-6 font-medium transition-opacity ${
              unreadCount === 0 ? "opacity-40" : "active:opacity-80"
            }`}
            onClick={handleMarkAllRead}
          >
            全部已读
          </View>
        </View>

        {/* 消息分类 Tab */}
        <View className="flex items-center gap-2">
          {[
            { key: "all", label: "全部" },
            { key: "system", label: "系统通知" },
            { key: "notification", label: "功能动态" },
          ].map(tab => (
            <View
              key={tab.key}
              className={`rounded-full px-3.5 py-1 text-xs font-medium transition-all ${
                filterType === tab.key
                  ? "bg-primary-6 text-white shadow-sm"
                  : "bg-white text-gray-600 active:bg-gray-100"
              }`}
              onClick={() => setFilterType(tab.key as any)}
            >
              {tab.label}
            </View>
          ))}
        </View>

        {/* 消息列表 */}
        <View className="space-y-3">
          {filteredMessages.map(item => (
            <View
              key={item.id}
              className={`rounded-2xl bg-white p-4 shadow-sm transition-all active:bg-gray-50 ${
                item.read ? "opacity-80" : ""
              }`}
              onClick={() => handleMessageClick(item.id)}
            >
              <View className="flex items-center justify-between">
                <View className="flex items-center gap-2">
                  {!item.read && (
                    <View className="h-2 w-2 rounded-full bg-red-500 ring-2 ring-red-500/20" />
                  )}
                  <View
                    className={`h-7 w-7 flex-center rounded-lg text-sm ${
                      item.type === "system"
                        ? "bg-blue-50 text-blue-600"
                        : "bg-purple-50 text-purple-600"
                    }`}
                  >
                    <View
                      className={
                        item.type === "system"
                          ? "i-tabler-info-square-rounded"
                          : "i-tabler-bell"
                      }
                    />
                  </View>
                  <Text className="text-sm text-gray-800 font-semibold">
                    {item.title}
                  </Text>
                </View>
                <Text className="text-xxs text-gray-400 tabular-nums">
                  {item.time}
                </Text>
              </View>

              <Text className="mt-2 block pl-9 text-xs text-gray-500 leading-relaxed">
                {item.content}
              </Text>
            </View>
          ))}

          {filteredMessages.length === 0 && (
            <View className="py-16 text-center text-xs text-gray-400">
              暂无任何消息
            </View>
          )}
        </View>

        {/* 底部提示 */}
        <View className="py-4 text-center text-xs text-gray-400">
          —— 消息中心仅展示模版通知 ——
        </View>
      </View>
      <Toast id="toast" />
    </PageWrapper>
  );
}
