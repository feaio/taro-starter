// 定义域名配置（直接读取启动命令根据 --mode 自动加载的 .env.[mode] 中的环境变量）
const domainConfig = {
  production: {
    api_base_url: process.env.TARO_API_BASE_URL,
    s3_base_url: process.env.TARO_S3_BASE_URL,
  },
  test: {
    api_base_url: process.env.TARO_API_BASE_URL,
    s3_base_url: process.env.TARO_S3_BASE_URL,
  },
  preview: {
    api_base_url: process.env.TARO_API_BASE_URL,
    s3_base_url: process.env.TARO_S3_BASE_URL,
  },
  development: {
    api_base_url: process.env.TARO_API_BASE_URL,
    s3_base_url: process.env.TARO_S3_BASE_URL,
  },
} as const;

// 定义环境类型
export type Environment = keyof typeof domainConfig;

// 定义API版本类型
export type ApiVersion = keyof typeof domainConfig[Environment];

// 定义URL路径类型
export type ApiPath = `/${string}`;

// 定义完整URL类型
export type FullUrl = `http://${string}` | `https://${string}`;

export default domainConfig;
