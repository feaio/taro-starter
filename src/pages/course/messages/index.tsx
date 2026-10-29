import type { LmsMessageItem, MessageCategoryType } from "~/store";
import { Input, Text, View } from "@tarojs/components";
import { useMemo, useState } from "react";
import PageWrapper from "~/components/PageWrapper";
import {
  buildMessageContent,
  MESSAGE_CATEGORY_OPTIONS,
  MESSAGE_TYPE_META,
  useMessageStore,
} from "~/store";

/**
 * MESSAGE_TAG_UNOCSS_MAP：各业务消息分类对应的 UnoCSS 胶囊配色（单一职责 SRP）。
 */
const MESSAGE_TAG_UNOCSS_MAP: Record<MessageCategoryType, string> = {
  enroll: "bg-blue-50 text-blue-600",
  homework: "bg-orange-50 text-orange-600",
  course: "bg-purple-50 text-purple-600",
  class: "bg-emerald-50 text-emerald-600",
  exam: "bg-red-50 text-red-600",
};

/**
 * messageSearchText：提取单条消息可用于关键字检索的拼接文本（单一职责 SRP）。
 */
function messageSearchText(msg: LmsMessageItem): string {
  const meta = MESSAGE_TYPE_META[msg.type];
  const parts = [
    meta ? meta.label : "",
    buildMessageContent(msg),
    msg.hwName,
    msg.examName,
    msg.courseName,
    msg.className,
    msg.classNotice,
    msg.content,
  ];
  return parts.filter(Boolean).join(" ").toLowerCase();
}

/**
 * CourseMessagesPage：course 分包下的「我的消息」页面组件，全部采用 UnoCSS 原子化类名实现，支持关键字搜索、业务分类多选过滤、单条已读及一键已读（单一职责 SRP）。
 * 依赖：useMessageStore、PageWrapper。不负责：底层 Storage 序列化实现。
 */
export default function CourseMessagesPage() {
  const { messages, markRead, markAllRead } = useMessageStore();
  const [keyword, setKeyword] = useState("");
  /**
   * 空数组 =「全部」（默认，只高亮「全部」）
   * 非空 = 多选具体分类
   */
  const [selectedCategories, setSelectedCategories] = useState<MessageCategoryType[]>([]);

  const unreadCount = useMemo(
    () => messages.filter(m => !m.read).length,
    [messages],
  );

  const isAllMode = selectedCategories.length === 0;

  const handleToggleCategory = (key: "all" | MessageCategoryType) => {
    if (key === "all") {
      setSelectedCategories([]);
      return;
    }
    setSelectedCategories((prev) => {
      if (prev.includes(key)) {
        return prev.filter(k => k !== key);
      }
      return [...prev, key];
    });
  };

  const sortedFilteredMessages = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    const filtered = messages.filter((msg) => {
      if (!isAllMode && !selectedCategories.includes(msg.type)) {
        return false;
      }
      if (kw && !messageSearchText(msg).includes(kw)) {
        return false;
      }
      return true;
    });

    return [...filtered].sort((a, b) => {
      const ta = Date.parse(String(a.sentAt).replace(/-/g, "/"));
      const tb = Date.parse(String(b.sentAt).replace(/-/g, "/"));
      return (Number.isNaN(tb) ? 0 : tb) - (Number.isNaN(ta) ? 0 : ta);
    });
  }, [messages, keyword, isAllMode, selectedCategories]);

  const handleMarkAllRead = () => {
    if (unreadCount === 0) {
      return;
    }
    markAllRead();
  };

  return (
    <PageWrapper
      navTitle="我的消息"
      className="p-4 pb-8"
      shouldShowBottomBar={false}
    >
      <View className="space-y-4">
        {/* 顶部标题行与一键已读按钮 */}
        <View className="flex items-center justify-between gap-2.5">
          <Text className="flex-1 text-lg text-gray-800 font-bold">我的消息</Text>
          <View
            className={`shrink-0 border border-primary-6/35 rounded-full bg-primary-1 px-3.5 py-1.5 text-xs text-primary-6 font-semibold transition-opacity ${
              unreadCount === 0 ? "opacity-40" : "active:opacity-80"
            }`}
            onClick={handleMarkAllRead}
          >
            一键已读
          </View>
        </View>

        {/* 搜索框 + 6 宫格业务分类多选标签 */}
        <View className="space-y-2.5">
          <View className="flex items-center gap-2 border border-gray-200 rounded-2xl bg-white px-3.5 py-2.5 shadow-sm">
            <View className="i-tabler-search shrink-0 text-base text-gray-400" />
            <Input
              className="min-w-0 flex-1 bg-transparent text-xs text-gray-800"
              type="text"
              placeholder="搜索消息内容、标题关键字"
              value={keyword}
              onInput={e => setKeyword(e.detail.value)}
            />
          </View>

          <View className="grid grid-cols-3 gap-2">
            {MESSAGE_CATEGORY_OPTIONS.map((opt) => {
              const active = opt.key === "all"
                ? isAllMode
                : selectedCategories.includes(opt.key);
              return (
                <View
                  key={opt.key}
                  className={`box-border w-full border rounded-xl px-2 py-2 text-center text-xs font-semibold transition-all active:scale-98 ${
                    active
                      ? "border-primary-6/45 bg-primary-1 text-primary-6"
                      : "border-gray-200 bg-white text-gray-500"
                  }`}
                  onClick={() => handleToggleCategory(opt.key)}
                >
                  {opt.label}
                </View>
              );
            })}
          </View>
        </View>

        {/* 消息卡片列表 */}
        {sortedFilteredMessages.length === 0
          ? (
              <View className="py-12 text-center text-sm text-gray-500">
                暂无符合条件的消息
              </View>
            )
          : (
              <View className="space-y-2.5">
                {sortedFilteredMessages.map((msg) => {
                  const meta = MESSAGE_TYPE_META[msg.type] || { label: "系统通知", cls: "course" as const };
                  const tagColorClass = MESSAGE_TAG_UNOCSS_MAP[msg.type] || MESSAGE_TAG_UNOCSS_MAP.course;
                  const content = buildMessageContent(msg);
                  return (
                    <View
                      key={msg.id}
                      className={` border border-gray-100 rounded-2xl bg-white p-3.5 shadow-sm transition-all active:bg-gray-50 ${
                        msg.read ? "opacity-85" : ""
                      }`}
                      onClick={() => markRead(msg.id)}
                    >
                      <View className="mb-2 flex items-center justify-between gap-2">
                        <View className="min-w-0 inline-flex items-center gap-1.5">
                          {!msg.read && (
                            <View className="h-2 w-2 shrink-0 rounded-full bg-red-500 ring-2 ring-red-500/20" />
                          )}
                          <Text className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${tagColorClass}`}>
                            {meta.label}
                          </Text>
                        </View>
                        <Text className="shrink-0 text-xs text-gray-400 tabular-nums">
                          {msg.sentAt}
                        </Text>
                      </View>
                      <View className={`break-words text-xs leading-relaxed ${msg.read ? "text-gray-500" : "text-gray-800"}`}>
                        {content}
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
      </View>
    </PageWrapper>
  );
}
