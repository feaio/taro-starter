import type { z } from "zod";

/**
 * 自定义错误消息映射（适配 Zod v4）
 */
export const customErrorMap: z.ZodErrorMap = (issue) => {
  let message: string;
  switch (issue.code) {
    case "invalid_type":
      if (issue.input === undefined || issue.input === null) {
        message = "此项不能为空";
      } else {
        message = `期望类型为 ${issue.expected}`;
      }
      break;
    case "invalid_format":
      if (issue.format === "url") {
        message = "请输入有效的网址";
      } else if (issue.format === "email") {
        message = "请输入有效的邮箱地址";
      } else if (issue.format === "datetime") {
        message = "请输入有效的日期时间";
      } else {
        message = "请输入有效的格式";
      }
      break;
    case "too_small":
      if (issue.origin === "string") {
        if (issue.minimum === 1) {
          message = "此项不能为空";
        } else {
          message = `最少需要 ${issue.minimum} 个字符`;
        }
      } else if (issue.origin === "number") {
        message = `不能小于 ${issue.minimum}`;
      } else {
        message = `不能少于 ${issue.minimum} 项`;
      }
      break;
    case "too_big":
      if (issue.origin === "string") {
        message = `不能超过 ${issue.maximum} 个字符`;
      } else if (issue.origin === "number") {
        message = `不能大于 ${issue.maximum}`;
      } else {
        message = `不能超过 ${issue.maximum} 项`;
      }
      break;
    case "invalid_value":
      message = "选项无效";
      break;
    case "not_multiple_of":
      message = `必须是 ${issue.divisor} 的倍数`;
      break;
    default:
      message = issue.message || "输入格式错误";
  }
  return { message };
};
