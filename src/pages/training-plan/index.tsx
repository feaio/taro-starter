import { Tag } from "@taroify/core";
import { Text, View } from "@tarojs/components";
import PageWrapper from "~/components/PageWrapper";
import { withMemberAuth } from "~/utils/memberGuard";

/**
 * TrainingPlanPage：培训计划页面，使用全局 PageWrapper（Layout）包裹（单一职责 SRP）。
 */
export default function TrainingPlanPage() {
  const plans = [
    { id: "1", name: "新员工入职基础培训", status: "进行中", progress: "60%" },
    { id: "2", name: "前端架构师专项集训", status: "待开始", progress: "0%" },
    { id: "3", name: "代码质量与安全规范", status: "已完成", progress: "100%" },
  ];

  const handlePlanClick = withMemberAuth((name: string) => {
    console.log("查看培训计划:", name);
  });

  return (
    <PageWrapper
      navTitle="培训计划"
      className="p-4"
      shouldShowNavigationMenu={false}
    >
      <View className="space-y-4">
        <View className="rounded-2xl bg-indigo-600 p-5 text-white shadow-sm">
          <Text className="block text-lg font-bold">阶段性培训计划</Text>
          <Text className="mt-1 block text-xs opacity-90">科学规划学习路径，稳步达成目标</Text>
        </View>

        <View className="space-y-3">
          {plans.map(plan => (
            <View
              key={plan.id}
              className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm"
              onClick={() => handlePlanClick(plan.name)}
            >
              <View className="space-y-1">
                <Text className="block text-base text-gray-800 font-medium">{plan.name}</Text>
                <Text className="block text-xs text-gray-500">
                  当前进度：
                  {plan.progress}
                </Text>
              </View>
              <Tag color={plan.status === "已完成" ? "success" : "primary"} shape="rounded">
                {plan.status}
              </Tag>
            </View>
          ))}
        </View>
      </View>
    </PageWrapper>
  );
}
