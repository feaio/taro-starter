import type { ImageProps } from "@tarojs/components";
import { Image } from "@tarojs/components";
import { memo, useMemo } from "react";
import { resolveS3Url } from "~/utils/s3";

export type S3ImageProps = ImageProps;

/**
 * S3Image：兼容 S3 相对路径与普通完整 URL 的图片组件，Props 与 Taro 原生 Image 完全一致（单一职责 SRP / 里氏替换 LSP）。
 * 依赖：@tarojs/components Image、resolveS3Url。不负责：复杂业务状态管理。
 */
function S3ImageComponent({ src, ...restProps }: S3ImageProps) {
  const resolvedSrc = useMemo(() => resolveS3Url(src), [src]);

  return <Image src={resolvedSrc} {...restProps} />;
}

export const S3Image = memo(S3ImageComponent);
export default S3Image;
