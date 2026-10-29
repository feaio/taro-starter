import type { UserConfigExport } from "@tarojs/cli";
import type { Plugin } from "vite";
import { resolve } from "node:path";
import { defineConfig } from "@tarojs/cli";
import { createSwcRegister, getModuleDefaultExport } from "@tarojs/helper";
import { createStyleImportPlugin } from "vite-plugin-style-import";
import devConfig from "./dev";
import prodConfig from "./prod";

/**
 * taroViteCompatPlugin：修复 @tarojs/vite-runner 在 watch 重编译、UnoCSS 虚拟模块解析与 Dart Sass 下的兼容性问题（单一职责 SRP）。
 * 1. 为 Vite 4 的 scss/sass 预处理器注入 silenceDeprecations: ["legacy-js-api"]，消除 Dart Sass legacy-js-api 废弃警告。
 * 2. 避免 taro:vite-multi-platform-plugin 对 "uno.css" 发起预解析并丢弃结果，从而消除 [unocss] "uno.css" is being imported multiple times 警告。
 * 3. 拦截 viteCompilerContext.collectNativeComponents，自动剔除 taro:vite-mini-emit 写入 page.config.usingComponents 的内部虚拟组件（comp / custom-wrapper），
 *    彻底消除 --watch 增量编译或异步依赖收集时误报“找不到页面依赖的自定义组件：.../src/comp”。
 */
function taroViteCompatPlugin(): Plugin {
  return {
    name: "taro:vite-compat-fix",
    enforce: "pre",
    config() {
      return {
        css: {
          preprocessorOptions: {
            scss: {
              silenceDeprecations: ["legacy-js-api"],
            },
            sass: {
              silenceDeprecations: ["legacy-js-api"],
            },
          },
        },
      };
    },
    configResolved(resolvedConfig) {
      const multiPlatformPlugin = resolvedConfig.plugins.find(
        p => p.name === "taro:vite-multi-platform-plugin",
      );
      if (multiPlatformPlugin && typeof multiPlatformPlugin.resolveId === "function") {
        const originalResolveId = multiPlatformPlugin.resolveId;
        multiPlatformPlugin.resolveId = function (source, importer, options) {
          if (
            source === "uno.css"
            || source.startsWith("virtual:uno")
            || source.includes("__uno.css")
          ) {
            return null;
          }
          return originalResolveId.call(this, source, importer, options);
        };
      }
    },
    buildStart() {
      const info = this.getModuleInfo("taro:compiler");
      const ctx = info?.meta?.viteCompilerContext;
      if (ctx && !ctx.__patchedCollectNativeComponents && typeof ctx.collectNativeComponents === "function") {
        ctx.__patchedCollectNativeComponents = true;
        const origCollect = ctx.collectNativeComponents.bind(ctx);
        ctx.collectNativeComponents = function (meta: any) {
          const usingComponents = meta?.config?.usingComponents;
          if (usingComponents && typeof usingComponents === "object") {
            delete usingComponents.comp;
            delete usingComponents["custom-wrapper"];
          }
          return origCollect(meta);
        };
      }
    },
  };
}

// https://taro-docs.jd.com/docs/next/config#defineconfig-辅助函数
export default defineConfig<"vite">(async (merge, { mode }) => {
  createSwcRegister({
    only: [filePath => filePath.includes("@unocss")],
  });
  const UnoCSS = getModuleDefaultExport(await import("@unocss/vite"));
  const baseConfig: UserConfigExport<"vite"> = {
    projectName: "taro-starter",
    date: "2025-01-21",
    designWidth: 750,
    deviceRatio: {
      640: 2.34 / 2,
      750: 1,
      375: 2,
      828: 1.81 / 2,
    },
    alias: {
      "~": resolve(process.cwd(), "src"),
    },
    sourceRoot: "src",
    // 开启多端同步调试
    outputRoot: `dist/${process.env.TARO_ENV}`,
    plugins: ["@tarojs/plugin-html"],
    defineConstants: {
      "process.env.TARO_API_BASE_URL": JSON.stringify(process.env.TARO_API_BASE_URL || ""),
      "process.env.TARO_S3_BASE_URL": JSON.stringify(process.env.TARO_S3_BASE_URL || ""),
    },
    copy: {
      patterns: [
      ],
      options: {
      },
    },
    framework: "react",
    compiler: {
      type: "vite",
      vitePlugins: [
        taroViteCompatPlugin(),
        createStyleImportPlugin({
          libs: [
            {
              libraryName: "@taroify/core",
              esModule: true,
              resolveStyle: (name: string) => `@taroify/core/${name}/style/index.js`,
              ensureStyleFile: true,
            },
            {
              libraryName: "@taroify/icons",
              esModule: true,
              resolveStyle: () => "@taroify/icons/style",
            },
          ],
        }),
        UnoCSS(),
      ],
    },
    mini: {
      postcss: {
        pxtransform: {
          enable: true,
          config: {

          },
        },
        url: {
          enable: true,
          config: {
            limit: 1024, // 设定转换尺寸上限
          },
        },
        cssModules: {
          enable: false, // 默认为 false，如需使用 css modules 功能，则设为 true
          config: {
            namingPattern: "module", // 转换模式，取值为 global/module
            generateScopedName: "[name]__[local]___[hash:base64:5]",
          },
        },
      },
    },
    h5: {
      publicPath: "/",
      staticDirectory: "static",
      esnextModules: ["@taroify"],
      router: {
        mode: "browser",
      },
      devServer: {
        port: 8888,
        host: "0.0.0.0",
        headers: {
          "Access-Control-Allow-Origin": "*", // 表示允许跨域
        },
        hmr: {
          overlay: false,
        },
      },
      postcss: {
        autoprefixer: {
          enable: true,
          config: {},
        },
        pxtransform: {
          enable: true,
          config: {},
        },
      },
    },
    rn: {
      appName: "taro-starter",
      postcss: {
        cssModules: {
          enable: false, // 默认为 false，如需使用 css modules 功能，则设为 true
        },
      },
    },
  };

  process.env.BROWSERSLIST_ENV = process.env.NODE_ENV;

  if (mode === "development" || process.env.NODE_ENV === "development") {
    // 本地开发构建配置（不混淆压缩）
    return merge({}, baseConfig, devConfig);
  }
  // 生产构建配置（默认开启压缩混淆等）
  return merge({}, baseConfig, prodConfig);
});
