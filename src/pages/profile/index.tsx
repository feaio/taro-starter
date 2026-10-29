import { Input, Text, View } from "@tarojs/components";
import Taro, { getStorageSync, setStorageSync } from "@tarojs/taro";
import { useState } from "react";
import PageWrapper from "~/components/PageWrapper";
import { RouteNames } from "~/constants/routes";
import { useAuthStore } from "~/store";
import { withMemberAuth } from "~/utils/memberGuard";
import { navigateTo, switchTab } from "~/utils/route";
import { PROFILE_USER_DATA } from "./profileData";

const STARTER_DEMO_PASSWORD_KEY = "starter_demo_password";

/**
 * getDemoStoredPassword：读取本地演示密码（未设置时默认 123456，单一职责 SRP）。
 */
function getDemoStoredPassword(): string {
  try {
    const val = getStorageSync<string>(STARTER_DEMO_PASSWORD_KEY);
    return val && val.trim() ? val : "123456";
  } catch {
    return "123456";
  }
}

/**
 * setDemoStoredPassword：保存本地演示密码（单一职责 SRP）。
 */
function setDemoStoredPassword(pwd: string): void {
  try {
    setStorageSync(STARTER_DEMO_PASSWORD_KEY, pwd);
  } catch {
    // ignore
  }
}

/**
 * UserProfilePage：「我的」个人中心通用页面，采用 UnoCSS 原子化类名实现纯净通用的开发者个人中心（单一职责 SRP）。
 * 依赖：useAuthStore、withMemberAuth、PROFILE_USER_DATA。
 */
export default function UserProfilePage() {
  const { account, isMember, clearAuth } = useAuthStore();

  // 更改密码弹窗状态
  const [showPwdModal, setShowPwdModal] = useState(false);
  const [oldPwd, setOldPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [pwdError, setPwdError] = useState("");

  const displayName = account || PROFILE_USER_DATA.name;

  // 快速跳转至登录页面
  const handleGoLogin = () => {
    navigateTo(RouteNames.LOGIN);
  };

  // 查看收藏（受会员权限保护示例）
  const handleOpenFavorites = withMemberAuth(() => {
    Taro.showToast({ title: "查看收藏列表（演示）", icon: "none" });
  });

  // 查看足迹
  const handleOpenFootprint = () => {
    Taro.showToast({ title: "浏览足迹（演示）", icon: "none" });
  };

  // 跳转消息中心 Tab
  const handleOpenMessages = () => {
    switchTab(RouteNames.MESSAGES);
  };

  // 跳转隐私政策
  const handleOpenPrivacyPolicy = () => {
    navigateTo(RouteNames.PRIVACY_POLICY);
  };

  // 跳转用户服务协议
  const handleOpenUserAgreement = () => {
    navigateTo(RouteNames.USER_AGREEMENT);
  };

  // 关于弹窗
  const handleOpenAbout = () => {
    Taro.showModal({
      title: "关于 Taro Starter",
      content: "Taro Starter 是一个开源的企业级跨端多端开发模板，集成了 React 18、UnoCSS、Zustand 与常用跨端最佳实践。",
      showCancel: false,
      confirmText: "知道了",
    });
  };

  // 清除本地缓存
  const handleClearCache = () => {
    Taro.showModal({
      title: "清除缓存",
      content: "确定要清理小程序本地缓存数据吗？",
      success: (res) => {
        if (res.confirm) {
          try {
            Taro.clearStorageSync();
            Taro.showToast({ title: "缓存清理成功", icon: "success" });
          } catch {
            Taro.showToast({ title: "清理失败", icon: "none" });
          }
        }
      },
    });
  };

  // 打开更改密码弹窗
  const handleOpenPwdModal = withMemberAuth(() => {
    setOldPwd("");
    setNewPwd("");
    setConfirmPwd("");
    setPwdError("");
    setShowPwdModal(true);
  });

  // 提交修改密码
  const handleSubmitPassword = () => {
    setPwdError("");
    const oldP = oldPwd.trim();
    const newP = newPwd.trim();
    const newP2 = confirmPwd.trim();

    if (!oldP) {
      setPwdError("请输入旧密码");
      return;
    }
    if (!newP) {
      setPwdError("请输入新密码");
      return;
    }
    if (newP.length < 6) {
      setPwdError("新密码至少需要 6 位字符");
      return;
    }
    if (!newP2) {
      setPwdError("请再次确认新密码");
      return;
    }
    if (newP !== newP2) {
      setPwdError("两次输入的新密码不一致");
      return;
    }
    if (oldP !== getDemoStoredPassword()) {
      setPwdError("旧密码不正确");
      return;
    }
    if (newP === oldP) {
      setPwdError("新密码不能与旧密码相同");
      return;
    }

    setDemoStoredPassword(newP);
    setShowPwdModal(false);
    Taro.showToast({ title: "密码修改成功", icon: "success" });
  };

  // 退出登录
  const handleLogout = () => {
    Taro.showModal({
      title: "提示",
      content: "确定退出当前账号吗？",
      success: (res) => {
        if (res.confirm) {
          clearAuth();
          Taro.showToast({ title: "已安全退出", icon: "none" });
        }
      },
    });
  };

  return (
    <PageWrapper
      navTitle="我的"
      shouldShowNavigationMenu={false}
    >
      <View className="min-h-full text-gray-800">
        {/* 顶部渐变 Hero 用户区 */}
        <View className="relative overflow-hidden from-[#4a9ad4] via-[#5aadff] to-[#f7f9fc] bg-gradient-to-b px-4 pb-6 pt-5">
          {/* 装饰波纹 */}
          <View className="pointer-events-none absolute inset-0 overflow-hidden">
            <View className="absolute h-60 w-60 rounded-full bg-white/12 -left-16 -top-20" />
            <View className="absolute h-50 w-50 rounded-full bg-white/10 -right-12 -top-2" />
          </View>

          {/* 头像与用户信息 */}
          <View className="relative z-10 mb-4 flex items-center justify-between">
            <View className="flex items-center gap-3">
              <View className="h-14 w-14 flex-center shrink-0 rounded-full bg-white/92 shadow-sm">
                <View className="i-tabler-user-filled text-3xl text-slate-400" />
              </View>
              <View className="min-w-0">
                <View className="flex items-center gap-2">
                  <Text className="block text-xl text-white font-bold leading-tight">
                    {displayName}
                  </Text>
                  <View className="rounded-full bg-white/20 px-2 py-0.5 text-xxs text-white font-medium">
                    {isMember ? "会员" : "体验用户"}
                  </View>
                </View>
                <Text className="mt-1 block text-xs text-white/80">
                  {PROFILE_USER_DATA.bio}
                </Text>
              </View>
            </View>

            {!account && (
              <View
                className="shrink-0 border border-white/60 rounded-full bg-white/10 px-3 py-1 text-xs text-white font-semibold active:bg-white/20"
                onClick={handleGoLogin}
              >
                去登录
              </View>
            )}
          </View>

          {/* 个人统计数据卡片 */}
          <View className="relative z-10 grid grid-cols-3 gap-2 rounded-2xl bg-white p-3.5 shadow-md">
            {PROFILE_USER_DATA.stats.map(item => (
              <View
                key={item.id}
                className="flex flex-col items-center justify-center space-y-1 active:opacity-75"
                onClick={() => {
                  if (item.id === "favorites") {
                    handleOpenFavorites();
                  } else {
                    handleOpenFootprint();
                  }
                }}
              >
                <Text className="text-lg text-gray-800 font-bold tabular-nums">
                  {item.value}
                </Text>
                <Text className="text-xs text-gray-500 font-medium">
                  {item.label}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* 主体功能列表区域 */}
        <View className="px-4 pb-8 pt-2 space-y-4">
          {/* 功能分组 1：常用功能 */}
          <View className="overflow-hidden rounded-2xl bg-white shadow-sm">
            <View
              className="flex items-center justify-between border-b border-gray-100 px-4 py-3.5 active:bg-gray-50"
              onClick={handleOpenFavorites}
            >
              <View className="flex items-center gap-3">
                <View className="i-tabler-star-filled shrink-0 text-xl text-primary-6" />
                <Text className="text-sm text-gray-800 font-medium">我的收藏</Text>
              </View>
              <View className="i-tabler-chevron-right text-base text-slate-300" />
            </View>

            <View
              className="flex items-center justify-between border-b border-gray-100 px-4 py-3.5 active:bg-gray-50"
              onClick={handleOpenFootprint}
            >
              <View className="flex items-center gap-3">
                <View className="i-tabler-history shrink-0 text-xl text-primary-6" />
                <Text className="text-sm text-gray-800 font-medium">浏览历史</Text>
              </View>
              <View className="i-tabler-chevron-right text-base text-slate-300" />
            </View>

            <View
              className="flex items-center justify-between px-4 py-3.5 active:bg-gray-50"
              onClick={handleOpenMessages}
            >
              <View className="flex items-center gap-3">
                <View className="i-tabler-bell-filled shrink-0 text-xl text-primary-6" />
                <Text className="text-sm text-gray-800 font-medium">消息中心</Text>
              </View>
              <View className="i-tabler-chevron-right text-base text-slate-300" />
            </View>
          </View>

          {/* 功能分组 2：系统与安全 */}
          <View className="overflow-hidden rounded-2xl bg-white shadow-sm">
            <View
              className="flex items-center justify-between border-b border-gray-100 px-4 py-3.5 active:bg-gray-50"
              onClick={handleOpenPwdModal}
            >
              <View className="flex items-center gap-3">
                <View className="i-tabler-lock-filled shrink-0 text-xl text-primary-6" />
                <Text className="text-sm text-gray-800 font-medium">更改密码</Text>
              </View>
              <View className="i-tabler-chevron-right text-base text-slate-300" />
            </View>

            <View
              className="flex items-center justify-between px-4 py-3.5 active:bg-gray-50"
              onClick={handleClearCache}
            >
              <View className="flex items-center gap-3">
                <View className="i-tabler-trash-filled shrink-0 text-xl text-primary-6" />
                <Text className="text-sm text-gray-800 font-medium">清理缓存</Text>
              </View>
              <View className="i-tabler-chevron-right text-base text-slate-300" />
            </View>
          </View>

          {/* 功能分组 3：关于与条款 */}
          <View className="overflow-hidden rounded-2xl bg-white shadow-sm">
            <View
              className="flex items-center justify-between border-b border-gray-100 px-4 py-3.5 active:bg-gray-50"
              onClick={handleOpenPrivacyPolicy}
            >
              <View className="flex items-center gap-3">
                <View className="i-tabler-shield-check shrink-0 text-xl text-primary-6" />
                <Text className="text-sm text-gray-800 font-medium">隐私保护政策</Text>
              </View>
              <View className="i-tabler-chevron-right text-base text-slate-300" />
            </View>

            <View
              className="flex items-center justify-between border-b border-gray-100 px-4 py-3.5 active:bg-gray-50"
              onClick={handleOpenUserAgreement}
            >
              <View className="flex items-center gap-3">
                <View className="i-tabler-file-text shrink-0 text-xl text-primary-6" />
                <Text className="text-sm text-gray-800 font-medium">用户服务协议</Text>
              </View>
              <View className="i-tabler-chevron-right text-base text-slate-300" />
            </View>

            <View
              className="flex items-center justify-between px-4 py-3.5 active:bg-gray-50"
              onClick={handleOpenAbout}
            >
              <View className="flex items-center gap-3">
                <View className="i-tabler-info-circle shrink-0 text-xl text-primary-6" />
                <Text className="text-sm text-gray-800 font-medium">关于 Taro Starter</Text>
              </View>
              <View className="flex items-center gap-1.5">
                <Text className="text-xs text-gray-400">v1.0.0</Text>
                <View className="i-tabler-chevron-right text-base text-slate-300" />
              </View>
            </View>
          </View>

          {/* 退出登录 */}
          {account && (
            <View
              className="border border-red-100 rounded-full bg-white py-3 text-center text-sm text-red-500 font-semibold active:bg-red-50"
              onClick={handleLogout}
            >
              退出登录
            </View>
          )}
        </View>

        {/* 更改密码弹窗 */}
        {showPwdModal && (
          <View
            className="fixed inset-0 z-50 flex-center bg-black/50 px-6"
            onClick={() => setShowPwdModal(false)}
          >
            <View
              className="max-w-sm w-full rounded-3xl bg-white p-5"
              onClick={e => e.stopPropagation()}
            >
              <View className="mb-4 flex items-center justify-between border-b border-gray-100 pb-3">
                <Text className="text-lg text-gray-800 font-bold">更改密码</Text>
                <View
                  className="h-8 w-8 flex-center rounded-full bg-gray-100 text-gray-500 active:bg-gray-200"
                  onClick={() => setShowPwdModal(false)}
                >
                  <View className="i-tabler-x text-base" />
                </View>
              </View>

              <View className="space-y-3">
                <View className="space-y-1.5">
                  <Text className="block text-xs text-gray-500 font-medium">旧密码</Text>
                  <View className="border border-gray-200 rounded-xl bg-gray-50 px-3.5 py-2.5">
                    <Input
                      className="w-full text-sm text-gray-800"
                      password
                      placeholder="请输入当前密码"
                      value={oldPwd}
                      onInput={e => setOldPwd(e.detail.value)}
                    />
                  </View>
                </View>

                <View className="space-y-1.5">
                  <Text className="block text-xs text-gray-500 font-medium">新密码</Text>
                  <View className="border border-gray-200 rounded-xl bg-gray-50 px-3.5 py-2.5">
                    <Input
                      className="w-full text-sm text-gray-800"
                      password
                      placeholder="至少 6 位"
                      value={newPwd}
                      onInput={e => setNewPwd(e.detail.value)}
                    />
                  </View>
                </View>

                <View className="space-y-1.5">
                  <Text className="block text-xs text-gray-500 font-medium">确认新密码</Text>
                  <View className="border border-gray-200 rounded-xl bg-gray-50 px-3.5 py-2.5">
                    <Input
                      className="w-full text-sm text-gray-800"
                      password
                      placeholder="请再次输入新密码"
                      value={confirmPwd}
                      onInput={e => setConfirmPwd(e.detail.value)}
                    />
                  </View>
                </View>

                <View className="min-h-5 text-xs text-red-500">{pwdError}</View>

                <View className="flex gap-2.5 pt-1">
                  <View
                    className="flex-1 rounded-xl bg-gray-100 py-3 text-center text-sm text-gray-800 font-semibold active:bg-gray-200"
                    onClick={() => setShowPwdModal(false)}
                  >
                    取消
                  </View>
                  <View
                    className="flex-1 rounded-xl bg-primary-6 py-3 text-center text-sm text-white font-semibold active:opacity-90"
                    onClick={handleSubmitPassword}
                  >
                    确定
                  </View>
                </View>
              </View>
            </View>
          </View>
        )}
      </View>
    </PageWrapper>
  );
}
