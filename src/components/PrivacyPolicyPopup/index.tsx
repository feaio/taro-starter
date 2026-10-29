import { Button, Popup } from "@taroify/core";
import { Text, View } from "@tarojs/components";
import Taro from "@tarojs/taro";
import { useCallback } from "react";
import { RouteNames } from "~/constants/routes";
import { usePrivacyStore } from "~/store";
import { navigateTo } from "~/utils/route";

export interface PrivacyPolicyPopupProps {
  /** 是否打开弹窗 */
  open: boolean;
  /** 关闭弹窗回调 */
  onClose?: () => void;
}

/**
 * PrivacyPolicyPopup：负责展示小程序隐私保护指引弹窗，处理用户同意、拒绝退出及跳转查看协议交互（单一职责 SRP）。
 * 依赖：usePrivacyStore、~/constants/routes、~/utils/route。不负责：页面渲染与全局布局管理。
 */
export default function PrivacyPolicyPopup({ open, onClose }: PrivacyPolicyPopupProps) {
  const { setAgreedPrivacy } = usePrivacyStore();

  const handleAgree = useCallback(() => {
    setAgreedPrivacy(true);
    onClose?.();
  }, [setAgreedPrivacy, onClose]);

  const handleDisagree = useCallback(() => {
    Taro.exitMiniProgram();
  }, []);

  const handleViewAgreement = useCallback((type: "privacy" | "user") => {
    navigateTo(type === "privacy" ? RouteNames.PRIVACY_POLICY : RouteNames.USER_AGREEMENT);
  }, []);

  // 空函数，阻止用户点击蒙层或按键默认关闭
  const handleClose = useCallback(() => {
    // 强制必须明确点击同意或拒绝
  }, []);

  return (
    <Popup
      open={open}
      placement="bottom"
      rounded
      onClose={handleClose}
    >
      <Popup.Backdrop closeable={false} />
      <View className="mx-auto max-w-md rounded-t-2xl bg-white p-6 shadow-lg space-y-4">
        <View className="text-center text-lg font-bold">taro-starter隐私保护指引</View>
        <View className="text-xs text-text leading-sm space-y-2">
          <View>
            点击"同意并继续"表示你已阅读并理解,
            <Text
              className="text-primary-6 underline"
              onClick={() => handleViewAgreement("user")}
            >
              《taro-starter用户协议》
            </Text>
            <Text>和</Text>
            <Text
              className="text-primary-6 underline"
              onClick={() => handleViewAgreement("privacy")}
            >
              《隐私政策》
            </Text>
            ，同意开启基本业务功能。
          </View>
          <View>
            当你在使用过程中自愿开启功能时，我们将告知提供该功能所必须收集的个人信息范围并征得你的单独同意。针对收集敏感个人信息、向第三方共享你的信息以及获取设备系统权限，我们都将单独征得你的同意。此外，还为你提供撤回同意与查询、更正、删除个人信息和注销账号的路径，更好地保护你的个人信息。
          </View>
          <View>
            若点击"不同意并退出"，你将无法使用我们的产品和服务，并会退出本小程序。
          </View>
        </View>
        <View className="space-y-2">
          <Button
            className="font-bold"
            color="primary"
            shape="round"
            block
            onClick={handleAgree}
          >
            同意并继续
          </Button>
          <Button
            className="font-bold"
            shape="round"
            block
            onClick={handleDisagree}
          >
            不同意并退出
          </Button>
        </View>
      </View>
    </Popup>
  );
}
