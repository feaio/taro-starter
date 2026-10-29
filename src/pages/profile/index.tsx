import type { UserPositionItem } from "./profileData";
import { Input, Swiper, SwiperItem, Text, View } from "@tarojs/components";
import Taro, { getStorageSync, setStorageSync } from "@tarojs/taro";
import { useMemo, useState } from "react";
import PageWrapper from "~/components/PageWrapper";
import { RouteNames } from "~/constants/routes";
import { useAuthStore, useMessageStore } from "~/store";
import { withMemberAuth } from "~/utils/memberGuard";
import { navigateTo, switchTab } from "~/utils/route";
import { getPositionsForCarousel, PROFILE_USER_DATA } from "./profileData";

const LMS_DEMO_PASSWORD_KEY = "lms_demo_login_password";

/**
 * getDemoStoredPassword：读取本地演示密码（未设置时默认 123456，单一职责 SRP）。
 */
function getDemoStoredPassword(): string {
  try {
    const val = getStorageSync<string>(LMS_DEMO_PASSWORD_KEY);
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
    setStorageSync(LMS_DEMO_PASSWORD_KEY, pwd);
  } catch {
    // ignore
  }
}

/**
 * UserProfilePage：「我的」个人中心页面，完全采用 UnoCSS 原子化类名与项目通用组件结构实现，还原蓝色渐变头部、任职岗位横向轮播、学习地图/记录快捷卡、功能菜单与弹窗交互（单一职责 SRP）。
 * 依赖：useAuthStore、useMessageStore、withMemberAuth、PROFILE_USER_DATA。
 */
function UserProfilePage() {
  const { account, clearAuth } = useAuthStore();
  const { messages } = useMessageStore();

  const [activeSlide, setActiveSlide] = useState(0);
  const [showLearningMap, setShowLearningMap] = useState(false);
  const [learningMapPos, setLearningMapPos] = useState<"main" | "deputy">("main");

  // 岗位职责弹窗状态
  const [dutyModalData, setDutyModalData] = useState<UserPositionItem | null>(null);

  // 更改密码弹窗状态
  const [showPwdModal, setShowPwdModal] = useState(false);
  const [oldPwd, setOldPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [pwdError, setPwdError] = useState("");

  const sortedPositions = useMemo(
    () => getPositionsForCarousel(PROFILE_USER_DATA.positions),
    [],
  );

  const unreadCount = useMemo(
    () => messages.filter(m => !m.read).length,
    [messages],
  );

  const displayName = account || PROFILE_USER_DATA.name;

  // 复制门店编码
  const handleCopyStoreCode = (code: string) => {
    Taro.setClipboardData({
      data: code,
      success: () => {
        Taro.showToast({ title: "已复制门店编码", icon: "none" });
      },
    });
  };

  // 打开学习地图子视图
  const handleOpenLearningMap = withMemberAuth(() => {
    setShowLearningMap(true);
  });

  // 跳转学习记录（在线课程 Tab）
  const handleOpenLearningRecords = withMemberAuth(() => {
    switchTab(RouteNames.ONLINE_COURSES);
  });

  // 我的证书
  const handleOpenCertificates = withMemberAuth(() => {
    Taro.showToast({ title: "我的证书：暂未开放，敬请期待", icon: "none" });
  });

  // 我的收藏
  const handleOpenFavorites = withMemberAuth(() => {
    switchTab(RouteNames.ONLINE_COURSES);
  });

  // 跳转 course 分包下的「我的消息」页面
  const handleOpenMessages = () => {
    navigateTo(RouteNames.COURSE_MESSAGES, { from: "profile" });
  };

  // 进入管理端
  const handleOpenAdminPortal = withMemberAuth(() => {
    Taro.showToast({
      title: "管理端跳转：门店培训管理后台 (演示模式)",
      icon: "none",
    });
  });

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

  const currentMapData = PROFILE_USER_DATA.learningMap[learningMapPos];

  return (
    <PageWrapper
      navTitle={showLearningMap ? "学习地图 · 成长路径" : "我的"}
      shouldShowNavigationMenu={false}
    >
      <View className="min-h-full text-gray-800">
        {showLearningMap
          ? (
              /* 学习地图独立子视图 */
              <View className="p-4 pb-10 space-y-4">
                <View className="flex items-center gap-3">
                  <View
                    className="h-8 w-8 flex-center rounded-full bg-gray-100 text-lg text-gray-800 active:bg-gray-200"
                    onClick={() => setShowLearningMap(false)}
                  >
                    <View className="i-tabler-chevron-left" />
                  </View>
                  <Text className="text-lg text-gray-800 font-bold">学习地图 · 成长路径</Text>
                </View>

                <View className="flex flex-wrap gap-3">
                  <View
                    className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                      learningMapPos === "main"
                        ? "bg-primary-6 text-white"
                        : "bg-gray-100 text-gray-500"
                    }`}
                    onClick={() => setLearningMapPos("main")}
                  >
                    {PROFILE_USER_DATA.learningMap.main.positionName}
                  </View>
                  <View
                    className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                      learningMapPos === "deputy"
                        ? "bg-primary-6 text-white"
                        : "bg-gray-100 text-gray-500"
                    }`}
                    onClick={() => setLearningMapPos("deputy")}
                  >
                    {PROFILE_USER_DATA.learningMap.deputy.positionName}
                  </View>
                </View>

                <View className="flex flex-wrap items-center gap-3.5 text-xs text-gray-500">
                  <View className="inline-flex items-center gap-1.5">
                    <View className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    <Text>已完成</Text>
                  </View>
                  <View className="inline-flex items-center gap-1.5">
                    <View className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                    <Text>进行中</Text>
                  </View>
                  <View className="inline-flex items-center gap-1.5">
                    <View className="h-1.5 w-1.5 rounded-full bg-gray-400" />
                    <Text>未解锁</Text>
                  </View>
                </View>

                <View className="space-y-4">
                  {currentMapData.levels.map((level) => {
                    if (level.type === "locked") {
                      return (
                        <View
                          key={level.name}
                          className="border-l-4 border-gray-300 rounded-2xl bg-white p-4 opacity-85 shadow-sm space-y-2"
                        >
                          <View className="flex items-center gap-1.5 text-lg text-gray-800 font-bold">
                            <View className="i-tabler-lock text-base text-gray-400" />
                            <Text>{level.name}</Text>
                          </View>
                          <View className="rounded-xl bg-gray-100 px-3 py-2.5 text-xs text-gray-700 leading-relaxed">
                            {level.items[0]?.desc || "完成前置等级后解锁"}
                          </View>
                        </View>
                      );
                    }

                    const borderColor = level.type === "completed" ? "border-emerald-500" : "border-amber-500";
                    return (
                      <View
                        key={level.name}
                        className={`border-l-4 ${borderColor} rounded-2xl bg-white p-4 shadow-sm space-y-2`}
                      >
                        <View className="text-lg text-gray-800 font-bold">{level.name}</View>
                        {level.type === "completed" && (level.updateTime || level.enterTime) && (
                          <View className="text-xs text-gray-500">
                            {level.updateTime
                              ? `等级更新：${level.updateTime}`
                              : `入岗时间：${level.enterTime}`}
                          </View>
                        )}
                        <View className="space-y-2">
                          {level.items.map(item => (
                            <View
                              key={item.desc}
                              className="rounded-xl bg-gray-50 px-3 py-2.5 text-xs text-gray-800 leading-relaxed"
                            >
                              <View
                                className={`mr-2 inline-block h-2 w-2 rounded-full align-middle ${
                                  level.type === "completed" ? "bg-emerald-500" : "bg-amber-500"
                                }`}
                              />
                              <Text>{item.desc}</Text>
                              {level.type === "completed"
                                ? (
                                    <Text className="ml-2 inline-block rounded-full bg-emerald-100 px-2 py-0.5 text-xxs text-emerald-600">
                                      {item.time || "已完成"}
                                    </Text>
                                  )
                                : (
                                    <Text className="ml-2 inline-block rounded-full bg-amber-100 px-2 py-0.5 text-xxs text-amber-600">
                                      {item.progress || "进行中"}
                                    </Text>
                                  )}
                            </View>
                          ))}
                        </View>
                      </View>
                    );
                  })}
                </View>
              </View>
            )
          : (
              /* 个人中心主视图 */
              <>
                {/* 顶部蓝色渐变 Hero 区（用户信息 + 任职轮播） */}
                <View className="relative overflow-hidden from-[#4a9ad4] via-[#5aadff] to-[#f7f9fc] bg-gradient-to-b px-4 pb-2 pt-5">
                  {/* 装饰波纹与右上角插画 */}
                  <View className="pointer-events-none absolute inset-0 overflow-hidden">
                    <View className="absolute h-60 w-60 rounded-full bg-white/12 -left-16 -top-20" />
                    <View className="absolute h-50 w-50 rounded-full bg-white/10 -right-12 -top-2" />
                    <View className="absolute right-3 top-2 h-16 w-20 flex-col-center opacity-85">
                      <View className="i-tabler-school text-4xl text-white/90" />
                      <View className="h-2 w-10 rounded-sm bg-white/65 -mt-1" />
                    </View>
                  </View>

                  {/* 头像与姓名/管理员 */}
                  <View className="relative z-10 mb-4 flex items-center gap-3">
                    <View className="h-14 w-14 flex-center shrink-0 rounded-full bg-white/92 shadow-sm">
                      <View className="i-tabler-user-filled text-3xl text-slate-400" />
                    </View>
                    <View className="min-w-0 flex-1">
                      <Text className="mb-1 block text-xl text-white font-bold">
                        你好，
                        {displayName}
                      </Text>
                      <Text className="block text-xs text-white/80">
                        我的管理员：
                        {PROFILE_USER_DATA.adminName}
                      </Text>
                    </View>
                  </View>

                  {/* 任职信息横向轮播：主岗优先 */}
                  <View className="relative z-10">
                    <Swiper
                      className="h-40 w-full"
                      current={activeSlide}
                      onChange={e => setActiveSlide(e.detail.current)}
                      nextMargin={sortedPositions.length > 1 ? Taro.pxTransform(24) : "0px"}
                    >
                      {sortedPositions.map(pos => (
                        <SwiperItem key={pos.storeCode}>
                          <View className="box-border h-full px-1 py-1">
                            <View className="relative box-border h-full flex flex-col justify-between overflow-hidden rounded-2xl bg-white p-4 shadow-md">
                              {/* 右上角主岗/兼岗角标 */}
                              <View
                                className={`absolute right-0 top-0 rounded-bl-xl px-2.5 py-0.5 text-xxs text-white font-bold ${
                                  pos.type === "main" ? "bg-red-500" : "bg-orange-500"
                                }`}
                              >
                                {pos.typeLabel}
                              </View>

                              <View className="space-y-2.5">
                                <View className="flex items-center gap-2 pr-12">
                                  <View className="i-tabler-shield-filled shrink-0 text-xl text-primary-6" />
                                  <Text className="text-lg text-gray-800 font-bold leading-tight">
                                    {pos.name}
                                  </Text>
                                </View>

                                <View className="flex items-center gap-6 text-xs text-gray-500">
                                  <View className="flex items-center gap-1.5">
                                    <View className="i-tabler-chart-bar shrink-0 text-sm text-primary-6" />
                                    <Text>当前等级</Text>
                                    <Text className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-700 font-bold">
                                      {pos.currentLevel}
                                    </Text>
                                  </View>
                                  <View className="flex items-center gap-1.5">
                                    <View className="i-tabler-chart-bar shrink-0 text-sm text-purple-500" />
                                    <Text>目标等级</Text>
                                    <Text className="rounded-full bg-purple-100 px-2.5 py-0.5 text-xs text-purple-600 font-bold">
                                      {pos.targetLevel}
                                    </Text>
                                  </View>
                                </View>

                                <View className="text-xs text-gray-500 space-y-1">
                                  <View className="flex items-center gap-1.5">
                                    <Text className="text-xs text-gray-800 font-semibold font-mono">
                                      {pos.storeCode}
                                    </Text>
                                    <View
                                      className="i-tabler-copy text-sm text-gray-400 active:text-primary-6"
                                      onClick={() => handleCopyStoreCode(pos.storeCode)}
                                    />
                                  </View>
                                  <View className="flex items-start gap-1.5 text-xs text-gray-500">
                                    <View className="i-tabler-building-store mt-0.5 shrink-0 text-sm text-slate-400" />
                                    <Text className="truncate">{pos.storeName}</Text>
                                  </View>
                                </View>
                              </View>

                              <View className="flex justify-end">
                                <Text
                                  className="text-xs text-primary-6 font-medium active:opacity-80"
                                  onClick={() => setDutyModalData(pos)}
                                >
                                  查看岗位职责 ›
                                </Text>
                              </View>
                            </View>
                          </View>
                        </SwiperItem>
                      ))}
                    </Swiper>

                    {sortedPositions.length > 1 && (
                      <View className="flex-center gap-1.5 pb-1 pt-2">
                        {sortedPositions.map((pos, idx) => (
                          <View
                            key={pos.storeCode}
                            className={`h-1.5 w-1.5 rounded-full transition-all ${
                              idx === activeSlide ? "scale-125 bg-primary-6" : "bg-primary-6/25"
                            }`}
                            onClick={() => setActiveSlide(idx)}
                          />
                        ))}
                      </View>
                    )}
                  </View>
                </View>

                {/* 主体区域 */}
                <View className="px-4 pb-6 pt-2 space-y-4">
                  {/* 学习地图 / 学习记录 并排快捷入口 */}
                  <View className="grid grid-cols-2 gap-2.5">
                    <View
                      className="flex items-center gap-2.5 rounded-2xl bg-white p-3.5 shadow-sm transition-transform active:scale-98"
                      onClick={handleOpenLearningMap}
                    >
                      <View className="h-10 w-10 flex-center shrink-0 rounded-xl bg-primary-6/12 text-xl text-primary-6">
                        <View className="i-tabler-book" />
                      </View>
                      <View className="min-w-0 flex flex-col">
                        <Text className="text-sm text-gray-800 font-bold">学习地图</Text>
                        <Text className="truncate text-xxs text-gray-400">规划我的学习路径</Text>
                      </View>
                    </View>

                    <View
                      className="flex items-center gap-2.5 rounded-2xl bg-white p-3.5 shadow-sm transition-transform active:scale-98"
                      onClick={handleOpenLearningRecords}
                    >
                      <View className="h-10 w-10 flex-center shrink-0 rounded-xl bg-emerald-500/12 text-xl text-emerald-500">
                        <View className="i-tabler-file-check" />
                      </View>
                      <View className="min-w-0 flex flex-col">
                        <Text className="text-sm text-gray-800 font-bold">学习记录</Text>
                        <Text className="truncate text-xxs text-gray-400">查看我的学习历程</Text>
                      </View>
                    </View>
                  </View>

                  {/* 功能菜单组 1：我的证书 / 我的收藏 / 我的消息 */}
                  <View className="overflow-hidden rounded-2xl bg-white shadow-sm">
                    <View
                      className="flex items-center justify-between border-b border-gray-100 px-4 py-3.5 active:bg-gray-50"
                      onClick={handleOpenCertificates}
                    >
                      <View className="flex items-center gap-3">
                        <View className="i-tabler-certificate shrink-0 text-xl text-primary-6" />
                        <Text className="text-sm text-gray-800 font-medium">我的证书</Text>
                      </View>
                      <View className="i-tabler-chevron-right text-base text-slate-300" />
                    </View>

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
                      className="flex items-center justify-between px-4 py-3.5 active:bg-gray-50"
                      onClick={handleOpenMessages}
                    >
                      <View className="flex items-center gap-3">
                        <View className="i-tabler-bell-filled shrink-0 text-xl text-primary-6" />
                        <Text
                          className={`text-sm font-medium ${
                            unreadCount > 0 ? "text-red-500" : "text-gray-800"
                          }`}
                        >
                          我的消息
                        </Text>
                      </View>
                      <View className="flex items-center gap-1.5">
                        {unreadCount > 0 && (
                          <Text className="rounded-full bg-red-600 px-2 py-0.5 text-xxs text-white font-semibold">
                            {unreadCount > 99 ? "99+" : unreadCount}
                          </Text>
                        )}
                        <View className="i-tabler-chevron-right text-base text-slate-300" />
                      </View>
                    </View>
                  </View>

                  {/* 功能菜单组 2：进入管理端 / 更改密码 */}
                  <View className="overflow-hidden rounded-2xl bg-white shadow-sm">
                    <View
                      className="flex items-center justify-between border-b border-gray-100 px-4 py-3.5 active:bg-gray-50"
                      onClick={handleOpenAdminPortal}
                    >
                      <View className="flex items-center gap-3">
                        <View className="i-tabler-building shrink-0 text-xl text-primary-6" />
                        <Text className="text-sm text-gray-800 font-medium">进入管理端</Text>
                      </View>
                      <View className="i-tabler-chevron-right text-base text-slate-300" />
                    </View>

                    <View
                      className="flex items-center justify-between px-4 py-3.5 active:bg-gray-50"
                      onClick={handleOpenPwdModal}
                    >
                      <View className="flex items-center gap-3">
                        <View className="i-tabler-lock-filled shrink-0 text-xl text-primary-6" />
                        <Text className="text-sm text-gray-800 font-medium">更改密码</Text>
                      </View>
                      <View className="i-tabler-chevron-right text-base text-slate-300" />
                    </View>
                  </View>

                  {/* 退出登录 */}
                  <View
                    className="border border-red-100 rounded-full bg-white py-3 text-center text-sm text-red-500 font-semibold active:bg-red-50"
                    onClick={handleLogout}
                  >
                    退出登录
                  </View>
                </View>
              </>
            )}

        {/* 岗位职责弹窗 */}
        {dutyModalData && (
          <View
            className="fixed inset-0 z-50 flex-center bg-black/50 px-6"
            onClick={() => setDutyModalData(null)}
          >
            <View
              className="max-w-sm w-full rounded-3xl bg-white p-5"
              onClick={e => e.stopPropagation()}
            >
              <View className="mb-4 flex items-center justify-between border-b border-gray-100 pb-3">
                <Text className="text-lg text-gray-800 font-bold">
                  {dutyModalData.name}
                  {" "}
                  · 岗位职责
                </Text>
                <View
                  className="h-8 w-8 flex-center rounded-full bg-gray-100 text-gray-500 active:bg-gray-200"
                  onClick={() => setDutyModalData(null)}
                >
                  <View className="i-tabler-x text-base" />
                </View>
              </View>
              <View className="whitespace-pre-line text-sm text-gray-700 leading-relaxed">
                {dutyModalData.dutyDesc}
              </View>
            </View>
          </View>
        )}

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

export default UserProfilePage;
