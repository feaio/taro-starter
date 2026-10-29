import { getStorageSync, setStorageSync } from "@tarojs/taro";
import { create } from "zustand";

/**
 * 消息业务分类类型定义
 */
export type MessageCategoryType = "enroll" | "homework" | "course" | "class" | "exam";

/**
 * 单条消息数据结构定义
 */
export interface LmsMessageItem {
  id: string;
  type: MessageCategoryType;
  read: boolean;
  sentAt: string;
  hwName?: string;
  submitStart?: string;
  submitEnd?: string;
  examName?: string;
  examStart?: string;
  courseName?: string;
  classStart?: string;
  className?: string;
  classNotice?: string;
  content?: string;
}

const STORAGE_KEY = "lms_messages_v3";
const DEFAULT_USER_NAME = "张明远";

/**
 * 业务分类元数据：供标签样式与搜索词提取共用
 */
export const MESSAGE_TYPE_META: Record<MessageCategoryType, { label: string; cls: MessageCategoryType }> = {
  enroll: { label: "报名通知", cls: "enroll" },
  homework: { label: "作业通知", cls: "homework" },
  course: { label: "课程通知", cls: "course" },
  class: { label: "班级通知", cls: "class" },
  exam: { label: "考试通知", cls: "exam" },
};

/**
 * 分类筛选按钮配置列表
 */
export const MESSAGE_CATEGORY_OPTIONS: Array<{ key: "all" | MessageCategoryType; label: string }> = [
  { key: "all", label: "全部" },
  { key: "enroll", label: "报名通知" },
  { key: "homework", label: "作业通知" },
  { key: "course", label: "课程通知" },
  { key: "class", label: "班级通知" },
  { key: "exam", label: "考试通知" },
];

/**
 * buildMessageContent：根据消息类型与模板参数拼接标准通知正文（单一职责 SRP）。
 * @param msg 消息实体
 * @param userName 接收人姓名，默认「张明远」
 */
export function buildMessageContent(msg: LmsMessageItem, userName = DEFAULT_USER_NAME): string {
  const n = userName || DEFAULT_USER_NAME;
  switch (msg.type) {
    case "enroll":
      return `尊敬的${n}您好，您报名的「${msg.courseName}」已审核通过，开课时间：${msg.classStart}，请按时参加培训。`;
    case "homework":
      return `尊敬的${n}您好，${msg.hwName}作业已发布，作业提交时间：${msg.submitStart}～${msg.submitEnd}，请关注作业信息，尽快提交作业。`;
    case "course":
      return `尊敬的${n}您好，${msg.courseName}课程上线了，请尽快登录在线学习平台完成。`;
    case "class":
      return `尊敬的${n}您好，您所在班级「${msg.className}」有新通知：${msg.classNotice}，请及时查看。`;
    case "exam":
      return `尊敬的${n}您好，${msg.examName}考试已发布，考试开始时间：${msg.examStart}，请关注信息，别错过考试时间。`;
    default:
      return msg.content || "";
  }
}

/**
 * getDefaultMessages：生成初始的 10 条默认业务通知消息（单一职责 SRP）。
 */
export function getDefaultMessages(): LmsMessageItem[] {
  return [
    {
      id: "m1",
      type: "homework",
      read: false,
      sentAt: "2026-05-18 09:15:00",
      hwName: "跨端架构设计实操作业",
      submitStart: "2026-05-18 08:00:00",
      submitEnd: "2026-05-25 23:59:59",
    },
    {
      id: "m2",
      type: "exam",
      read: false,
      sentAt: "2026-05-17 14:30:00",
      examName: "研发岗位-L1等级认证考试",
      examStart: "2026-05-20 09:00:00",
    },
    {
      id: "m3",
      type: "course",
      read: false,
      sentAt: "2026-05-16 10:00:00",
      courseName: "高可用系统架构L1等级课程",
    },
    {
      id: "m4",
      type: "enroll",
      read: false,
      sentAt: "2026-05-18 08:45:00",
      courseName: "新员工入职基础培训班",
      classStart: "2026-05-22 09:00:00",
    },
    {
      id: "m5",
      type: "homework",
      read: false,
      sentAt: "2026-05-10 16:20:00",
      hwName: "工程化规范与代码评审复盘作业",
      submitStart: "2026-05-10 08:00:00",
      submitEnd: "2026-05-15 18:00:00",
    },
    {
      id: "m6",
      type: "course",
      read: false,
      sentAt: "2026-05-08 11:30:00",
      courseName: "入职培训·研发岗位（含安全规范与研发流程）",
    },
    {
      id: "m7",
      type: "class",
      read: false,
      sentAt: "2026-05-15 15:40:00",
      className: "2026年5月研发L1认证班",
      classNotice: "明日上午 9:00 集合签到，请携带工牌与笔记本",
    },
    {
      id: "m8",
      type: "enroll",
      read: false,
      sentAt: "2026-05-12 09:00:00",
      courseName: "前端架构进阶实训班",
      classStart: "2026-05-28 13:30:00",
    },
    {
      id: "m9",
      type: "exam",
      read: false,
      sentAt: "2026-05-11 18:00:00",
      examName: "技术规范阶段性测验",
      examStart: "2026-05-19 14:00:00",
    },
    {
      id: "m10",
      type: "class",
      read: false,
      sentAt: "2026-05-09 10:20:00",
      className: "架构师专项强化班（二期）",
      classNotice: "课程地点变更为研发中心 3 楼培训教室",
    },
  ];
}

/**
 * loadPersistedMessages：从小程序 Storage 读取消息列表，若无则写入并返回默认数据（单一职责 SRP）。
 */
function loadPersistedMessages(): LmsMessageItem[] {
  try {
    const raw = getStorageSync<LmsMessageItem[] | string>(STORAGE_KEY);
    if (Array.isArray(raw) && raw.length > 0) {
      return raw;
    }
    if (typeof raw === "string" && raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // ignore storage read error
  }
  const defaults = getDefaultMessages();
  savePersistedMessages(defaults);
  return defaults;
}

/**
 * savePersistedMessages：将消息列表持久化到小程序 Storage（单一职责 SRP）。
 */
function savePersistedMessages(list: LmsMessageItem[]): void {
  try {
    setStorageSync(STORAGE_KEY, list);
  } catch {
    // ignore storage write error
  }
}

interface MessageState {
  messages: LmsMessageItem[];
  /** 获取当前未读消息数量 */
  getUnreadCount: () => number;
  /** 将指定消息标记为已读 */
  markRead: (id: string) => void;
  /** 一键将全部未读消息标记为已读 */
  markAllRead: () => void;
}

/**
 * useMessageStore：全局消息状态管理 Store，负责「我的消息」列表读写、已读状态变更与未读数统计（单一职责 SRP）。
 * 依赖：@tarojs/taro Storage。不负责：视图筛选 UI 渲染。
 */
export const useMessageStore = create<MessageState>((set, get) => ({
  messages: loadPersistedMessages(),
  getUnreadCount: () => get().messages.filter(m => !m.read).length,
  markRead: (id: string) => {
    const current = get().messages;
    const target = current.find(m => m.id === id);
    if (!target || target.read) {
      return;
    }
    const next = current.map(m => (m.id === id ? { ...m, read: true } : m));
    savePersistedMessages(next);
    set({ messages: next });
  },
  markAllRead: () => {
    const current = get().messages;
    if (current.every(m => m.read)) {
      return;
    }
    const next = current.map(m => ({ ...m, read: true }));
    savePersistedMessages(next);
    set({ messages: next });
  },
}));
