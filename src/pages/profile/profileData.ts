/**
 * 个人中心统计指标项数据类型
 */
export interface ProfileStatItem {
  id: string;
  label: string;
  value: number | string;
}

/**
 * 个人中心用户基础档案数据类型
 */
export interface ProfileUserData {
  name: string;
  avatarUrl: string;
  bio: string;
  email: string;
  stats: ProfileStatItem[];
}

/**
 * PROFILE_USER_DATA：个人中心通用演示档案数据，无任何具体业务逻辑（单一职责 SRP）。
 */
export const PROFILE_USER_DATA: ProfileUserData = {
  name: "Taro 开发者",
  avatarUrl: "https://avatars.githubusercontent.com/u/17453452?v=4",
  bio: "专注于高质量跨端开发，探索 Taro 与 React 生态最佳实践",
  email: "developer@example.com",
  stats: [
    { id: "favorites", label: "我的收藏", value: 12 },
    { id: "footprint", label: "浏览足迹", value: 36 },
    { id: "stars", label: "获得点赞", value: 128 },
  ],
};
