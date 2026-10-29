import type { Environment } from "~/utils/httpClient/constants";
import { getCurrentEnvironment } from "~/utils/env";
import domainConfig from "~/utils/httpClient/constants";

/**
 * ABSOLUTE_OR_SPECIAL_URI_PREFIXES：无需拼接 S3 基础域名的完整 URL 或本地协议前缀集合（单一职责 SRP）。
 */
const ABSOLUTE_OR_SPECIAL_URI_PREFIXES = [
  "http://",
  "https://",
  "//",
  "data:",
  "blob:",
  "wxfile://",
  "ttfile://",
  "file://",
] as const;

/**
 * isAbsoluteOrSpecialUrl：判断传入的资源地址是否已经是完整 URL 或本地特殊协议地址（单一职责 SRP）。
 * 依赖：ABSOLUTE_OR_SPECIAL_URI_PREFIXES。不负责：URL 拼接。
 */
export function isAbsoluteOrSpecialUrl(url: string): boolean {
  const trimmed = url.trim();
  return ABSOLUTE_OR_SPECIAL_URI_PREFIXES.some(prefix => trimmed.startsWith(prefix));
}

/**
 * getS3BaseUrl：获取当前小程序运行环境对应的 TARO_S3_BASE_URL（单一职责 SRP）。
 * 依赖：getCurrentEnvironment、domainConfig。不负责：路径拼接。
 */
export function getS3BaseUrl(): string {
  const currentEnv: Environment = getCurrentEnvironment();
  const envS3Url = typeof process !== "undefined" && process?.env?.TARO_S3_BASE_URL ? process.env.TARO_S3_BASE_URL : "";
  return domainConfig[currentEnv]?.s3_base_url || envS3Url || "";
}

/**
 * resolveS3Url（别名 getS3Url）：将相对 S3 路径/Key 拼接为完整的 S3 资源地址；若已是完整 URL 则原样返回（单一职责 SRP）。
 * 依赖：isAbsoluteOrSpecialUrl、getS3BaseUrl。不负责：UI 渲染。
 *
 * @param url S3 相对路径（如 "avatars/user1.png" 或 "/avatars/user1.png"）或普通完整图片 URL
 * @returns 完整可访问的资源 URL
 */
export function resolveS3Url(url?: string | null): string {
  if (!url) {
    return "";
  }

  const trimmedUrl = url.trim();
  if (!trimmedUrl) {
    return "";
  }

  // 若已经是 http(s)://、//、data:、wxfile:// 等完整地址，直接原样返回
  if (isAbsoluteOrSpecialUrl(trimmedUrl)) {
    return trimmedUrl;
  }

  const baseUrl = getS3BaseUrl().trim();
  if (!baseUrl) {
    return trimmedUrl;
  }

  const normalizedBase = baseUrl.replace(/\/+$/, "");
  const normalizedPath = trimmedUrl.replace(/^\/+/, "");

  return `${normalizedBase}/${normalizedPath}`;
}

export const getS3Url = resolveS3Url;
