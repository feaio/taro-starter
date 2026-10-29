import { ADAPTED_PAGES, RouteNames } from "~/constants/routes";

export default defineAppConfig({
  pages: [
    ADAPTED_PAGES[RouteNames.HOME],
    ADAPTED_PAGES[RouteNames.ONLINE_COURSES],
    ADAPTED_PAGES[RouteNames.TRAINING_PLAN],
    ADAPTED_PAGES[RouteNames.PROFILE],
    ADAPTED_PAGES[RouteNames.LOGIN],
    ADAPTED_PAGES[RouteNames.PRIVACY_POLICY],
    ADAPTED_PAGES[RouteNames.USER_AGREEMENT],
  ],
  subPackages: [
    {
      root: "pages/course",
      pages: [
        "messages/index",
      ],
    },
  ],
  preloadRule: {
    [ADAPTED_PAGES[RouteNames.HOME]]: {
      network: "all",
      packages: ["pages/course"],
    },
    [ADAPTED_PAGES[RouteNames.PROFILE]]: {
      network: "all",
      packages: ["pages/course"],
    },
  },
  window: {
    // 微信全局设置自定义导航栏
    navigationStyle: "custom",
    // 支付宝全局设置自定义导航栏
    // transparentTitle: "always",
    // 支付宝是否允许导航栏点击穿透。默认 NO，支持 YES / NO。
    // titlePenetrate: "YES",
    backgroundTextStyle: "light",
    navigationBarBackgroundColor: "#fff",
    navigationBarTitleText: "WeChat",
    navigationBarTextStyle: "black",
  },
  tabBar: {
    custom: true,
    list: [
      {
        pagePath: ADAPTED_PAGES[RouteNames.HOME],
        text: "首页",
      },
      {
        pagePath: ADAPTED_PAGES[RouteNames.ONLINE_COURSES],
        text: "在线课程",
      },
      {
        pagePath: ADAPTED_PAGES[RouteNames.TRAINING_PLAN],
        text: "培训计划",
      },
      {
        pagePath: ADAPTED_PAGES[RouteNames.PROFILE],
        text: "我的",
      },
    ],
  },
});
