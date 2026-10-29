import { cache } from "~/cache";
import { useAuthStore } from "~/store";

/**
 * MockLoginResponse：全局 mock login 返回的数据结构。
 */
export interface MockLoginResponse {
  access_token: string;
  isMember: boolean;
}

/**
 * MockRegisterRequest：mock 注册会员请求参数。
 */
export interface MockRegisterRequest {
  account: string;
  password: string;
}

/**
 * MockRegisterResponse：mock 注册会员返回结果。
 */
export interface MockRegisterResponse {
  access_token: string;
  isMember: boolean;
  account: string;
}

/**
 * mockLoginApi：模拟全局登录接口，返回 access_token 和是否已属于会员，并同步写入 Zustand store（单一职责 SRP）。
 * 依赖：useAuthStore、cache。不负责：请求队列调度。
 */
export async function mockLoginApi(): Promise<MockLoginResponse> {
  return new Promise((resolve) => {
    setTimeout(() => {
      // 若本地已注册成为会员，保持会员状态；否则默认初始登录为非会员
      const cachedIsMember = Boolean(cache.getSync("isMember"));
      const existingToken = cache.getSync("access_token");
      const access_token = existingToken || `mock_token_${Date.now()}`;

      const result: MockLoginResponse = {
        access_token,
        isMember: cachedIsMember,
      };

      // 存储到全局 Zustand store 中
      useAuthStore.getState().setAuthData(result);
      resolve(result);
    }, 300);
  });
}

/**
 * mockRegisterMemberApi：模拟填写账号密码注册会员，完成后修改全局 store 中的会员状态（单一职责 SRP）。
 * 依赖：useAuthStore。不负责：页面跳转或表单 UI 渲染。
 */
export async function mockRegisterMemberApi(
  params: MockRegisterRequest,
): Promise<MockRegisterResponse> {
  const { account, password } = params;

  if (!account.trim() || !password.trim()) {
    throw new Error("账号和密码不能为空");
  }

  return new Promise((resolve) => {
    setTimeout(() => {
      const currentToken = useAuthStore.getState().accessToken || `mock_token_${Date.now()}`;
      const result: MockRegisterResponse = {
        access_token: currentToken,
        isMember: true,
        account: account.trim(),
      };

      // 注册完成后，修改 store
      useAuthStore.getState().setAuthData({
        access_token: result.access_token,
        isMember: true,
        account: result.account,
      });

      resolve(result);
    }, 400);
  });
}
