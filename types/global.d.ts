/// <reference types="@tarojs/taro" />

declare module "*.png";
declare module "*.gif";
declare module "*.jpg";
declare module "*.jpeg";
declare module "*.svg";
declare module "*.css";
declare module "*.less";
declare module "*.scss";
declare module "*.sass";
declare module "*.styl";

declare namespace NodeJS {
  interface ProcessEnv {
    /** NODE 内置环境变量, 会影响到最终构建生成产物 */
    NODE_ENV: "development" | "production" | "test";
    /** 当前构建的平台 */
    TARO_ENV: "weapp" | "swan" | "alipay" | "h5" | "rn" | "tt" | "quickapp" | "qq" | "jd";
    /** 当前构建的小程序 appid */
    TARO_APP_ID: string;
    /** 后端 API 基础域名（由 .env.[mode] 自动注入） */
    TARO_API_BASE_URL: string;
    /** 静态资源 S3 基础域名（由 .env.[mode] 自动注入） */
    TARO_S3_BASE_URL: string;
  }
}
