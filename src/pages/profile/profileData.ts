/**
 * 任职岗位卡片数据类型
 */
export interface UserPositionItem {
  type: "main" | "deputy";
  typeLabel: "主岗" | "兼岗";
  name: string;
  currentLevel: string;
  targetLevel: string;
  storeCode: string;
  storeName: string;
  province: string;
  city: string;
  district: string;
  dutyDesc: string;
}

/**
 * 学习地图单个条目数据类型
 */
export interface LearningMapEntryItem {
  desc: string;
  time?: string;
  progress?: string;
  locked?: boolean;
}

/**
 * 学习地图等级阶段数据类型
 */
export interface LearningMapLevel {
  name: string;
  type: "completed" | "in_progress" | "locked";
  enterTime?: string;
  updateTime?: string;
  items: LearningMapEntryItem[];
}

/**
 * 学习地图岗位成长路径数据类型
 */
export interface PositionLearningMap {
  positionName: string;
  levels: LearningMapLevel[];
}

/**
 * 个人中心完整用户档案数据类型
 */
export interface ProfileUserData {
  name: string;
  adminName: string;
  positions: UserPositionItem[];
  learningMap: {
    main: PositionLearningMap;
    deputy: PositionLearningMap;
  };
}

/**
 * PROFILE_USER_DATA：个人中心演示档案数据（单一职责 SRP）。
 */
export const PROFILE_USER_DATA: ProfileUserData = {
  name: "张明远",
  adminName: "李志远",
  positions: [
    {
      type: "main",
      typeLabel: "主岗",
      name: "高级工程师",
      currentLevel: "L2",
      targetLevel: "L3",
      storeCode: "CNSCN340433",
      storeName: "星云科技研发中心 · 杭州西溪园区",
      province: "浙江省",
      city: "杭州市",
      district: "西湖区",
      dutyDesc: "1. 负责核心业务系统的架构设计与模块研发；\n2. 配合技术主管完成疑难问题排查与性能优化；\n3. 参与新技术预研与团队内训工作；\n4. 协助团队完成跨端工程化建设与技术支持。",
    },
    {
      type: "deputy",
      typeLabel: "兼岗",
      name: "技术培训师",
      currentLevel: "L1",
      targetLevel: "L2",
      storeCode: "CNSCN340434",
      storeName: "星云科技 · 上海浦东创新中心",
      province: "上海市",
      city: "上海市",
      district: "浦东新区",
      dutyDesc: "1. 负责团队内部技术培训课程的开发与讲授；\n2. 跟进新员工技术能力评估与提升计划；\n3. 定期组织技术案例分享会；\n4. 对接培训资源，推动技术规范落地。",
    },
  ],
  learningMap: {
    main: {
      positionName: "高级工程师",
      levels: [
        {
          name: "准一级",
          type: "completed",
          enterTime: "2024-01-05",
          items: [
            { desc: "入职培训【研发岗位新人基础学习课程】", time: "2024-01-05 18:00:00" },
          ],
        },
        {
          name: "L1",
          type: "completed",
          updateTime: "2024-02-20",
          items: [
            { desc: "等级课程【研发岗位L1等级课程】", time: "2024-02-05 18:00:00" },
            { desc: "等级培训【研发岗位L1等级培训】（免训申请通过）", time: "2024-02-15 17:00:00" },
            { desc: "等级认证【研发岗位L1等级认证】", time: "2024-02-25 17:00:00" },
          ],
        },
        {
          name: "L2",
          type: "in_progress",
          items: [
            { desc: "等级课程【研发岗位L2进阶课程】", progress: "60%" },
            { desc: "实操评估【高可用架构设计与性能调优】", progress: "35%" },
          ],
        },
        {
          name: "L3 (目标)",
          type: "locked",
          items: [
            { desc: "完成当前L2等级全部认证后解锁", locked: true },
          ],
        },
      ],
    },
    deputy: {
      positionName: "技术培训师",
      levels: [
        {
          name: "准一级",
          type: "completed",
          enterTime: "2024-06-01",
          items: [
            { desc: "入职培训【技术培训师新人课程】", time: "2024-06-01 14:00:00" },
          ],
        },
        {
          name: "L1",
          type: "completed",
          updateTime: "2024-08-15",
          items: [
            { desc: "等级课程【培训师基础技能课程】", time: "2024-08-10 10:00:00" },
            { desc: "等级认证【L1等级认证】", time: "2024-08-20 16:00:00" },
          ],
        },
        {
          name: "L2",
          type: "in_progress",
          items: [
            { desc: "等级课程【高级培训技巧】", progress: "30%" },
            { desc: "微课开发工作坊", progress: "10%" },
          ],
        },
      ],
    },
  },
};

/**
 * getPositionsForCarousel：返回主岗优先排序的任职列表（单一职责 SRP）。
 */
export function getPositionsForCarousel(positions: UserPositionItem[]): UserPositionItem[] {
  return [...positions].sort((a, b) => {
    if (a.type === "main" && b.type !== "main") {
      return -1;
    }
    if (a.type !== "main" && b.type === "main") {
      return 1;
    }
    return 0;
  });
}
