import { Button, Toast } from "@taroify/core";
import { Input, Text, View } from "@tarojs/components";
import Taro, { useRouter } from "@tarojs/taro";
import { useState } from "react";
import { mockRegisterMemberApi } from "~/api/mockAuth";
import PageWrapper from "~/components/PageWrapper";
import { PAGES, RouteNames, TAB_BAR_ROUTES } from "~/constants/routes";
import { useAuthStore } from "~/store";
import { navigateBack, reLaunch } from "~/utils/route";

/**
 * resolvePostLoginNavigation：处理登录/注册完成后的页面跳转逻辑（单一职责 SRP）。
 * - 若显式设置 shouldReturn 为 "false"，则不执行跳转；
 * - 若设置了 redirect 路径，则重定向至目标路径（自动识别 TabBar 页面与普通页面）；
 * - 若未设置 redirect，则返回上一页（若无上一页则回首页）。
 */
function resolvePostLoginNavigation(redirect?: string, shouldReturnParam?: string) {
  // 允许设置登录完成后是否返回/跳转：当显式传入 shouldReturn=false 且未指定 redirect 时留在当前页
  if (shouldReturnParam === "false" && !redirect) {
    return;
  }

  if (redirect) {
    const decodedRedirect = decodeURIComponent(redirect);
    const normalizedTarget = decodedRedirect.startsWith("/") ? decodedRedirect : `/${decodedRedirect}`;
    const targetWithoutQuery = normalizedTarget.split("?")[0];

    // 检查目标路径是否为 TabBar 页面
    const matchedTabRoute = TAB_BAR_ROUTES.find(
      routeKey => PAGES[routeKey] === targetWithoutQuery,
    );

    if (matchedTabRoute) {
      Taro.switchTab({ url: targetWithoutQuery });
    } else {
      Taro.redirectTo({
        url: normalizedTarget,
        fail: () => {
          reLaunch(RouteNames.HOME);
        },
      });
    }
    return;
  }

  // 未设置 redirect 时，默认返回上一页
  if (shouldReturnParam !== "false") {
    const pages = Taro.getCurrentPages();
    if (pages.length > 1) {
      navigateBack();
    } else {
      reLaunch(RouteNames.HOME);
    }
  }
}

/**
 * LoginPage：独立登录/注册会员页面，支持填写账号密码完成 mock 注册会员并更新全局 store，完成后按参数重定向或返回（单一职责 SRP）。
 * 依赖：mockRegisterMemberApi、useAuthStore、PageWrapper。
 */
export default function LoginPage() {
  const router = useRouter();
  const { isMember, account: currentAccount } = useAuthStore();

  const [account, setAccount] = useState(currentAccount || "");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const redirect = router.params?.redirect;
  const shouldReturn = router.params?.shouldReturn;

  const handleSubmit = async () => {
    if (!account.trim()) {
      Toast.open("请输入账号");
      return;
    }
    if (!password.trim()) {
      Toast.open("请输入密码");
      return;
    }

    try {
      setSubmitting(true);
      await mockRegisterMemberApi({
        account,
        password,
      });

      Toast.open("注册/登录会员成功");

      setTimeout(() => {
        resolvePostLoginNavigation(redirect, shouldReturn);
      }, 500);
    } catch (error: any) {
      Toast.open(error?.message || "操作失败，请重试");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageWrapper
      navTitle="会员登录 / 注册"
      className="p-6"
      shouldShowNavigationMenu={true}
      shouldShowBottomBar={false}
    >
      <View className="mt-6 rounded-3xl bg-white p-6 shadow-sm space-y-6">
        <View className="space-y-1">
          <Text className="block text-xl text-gray-800 font-bold">
            {isMember ? "已开通会员" : "欢迎注册 / 登录会员"}
          </Text>
          <Text className="block text-sm text-gray-500">
            填写账号与密码即可完成会员注册并解锁全部功能
          </Text>
        </View>

        <View className="space-y-4">
          <View className="space-y-1.5">
            <Text className="block text-sm text-gray-700 font-medium">账号</Text>
            <View className="border border-gray-200 rounded-xl bg-gray-50 px-4 py-3">
              <Input
                className="w-full text-base text-gray-800"
                placeholder="请输入会员账号"
                value={account}
                onInput={e => setAccount(e.detail.value)}
              />
            </View>
          </View>

          <View className="space-y-1.5">
            <Text className="block text-sm text-gray-700 font-medium">密码</Text>
            <View className="border border-gray-200 rounded-xl bg-gray-50 px-4 py-3">
              <Input
                className="w-full text-base text-gray-800"
                password
                placeholder="请输入会员密码"
                value={password}
                onInput={e => setPassword(e.detail.value)}
              />
            </View>
          </View>
        </View>

        <Button
          color="primary"
          shape="round"
          block
          loading={submitting}
          disabled={submitting}
          onClick={handleSubmit}
        >
          {isMember ? "更新会员登录信息" : "立即注册并登录"}
        </Button>
      </View>
      <Toast id="toast" />
    </PageWrapper>
  );
}
