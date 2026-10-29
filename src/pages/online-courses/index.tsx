import { Tag } from "@taroify/core";
import { Text, View } from "@tarojs/components";
import PageWrapper from "~/components/PageWrapper";
import { withMemberAuth } from "~/utils/memberGuard";

/**
 * OnlineCoursesPage：在线课程页面，使用全局 PageWrapper（Layout）包裹（单一职责 SRP）。
 */
export default function OnlineCoursesPage() {
  const courses = [
    { id: "1", title: "Taro 4 多端架构实战", tag: "进阶", duration: "12 课时" },
    { id: "2", title: "React 18 核心原理与性能优化", tag: "核心", duration: "8 课时" },
    { id: "3", title: "TypeScript 类型体操与工程化", tag: "必修", duration: "10 课时" },
  ];

  const handleCourseClick = withMemberAuth((title: string) => {
    console.log("进入课程:", title);
  });

  return (
    <PageWrapper
      navTitle="在线课程"
      className="p-4"
      shouldShowNavigationMenu={false}
    >
      <View className="space-y-4">
        <View className="rounded-2xl bg-primary-6 p-5 text-white shadow-sm">
          <Text className="block text-lg font-bold">精品在线课程</Text>
          <Text className="mt-1 block text-xs opacity-90">随时随地提升专业技能</Text>
        </View>

        <View className="space-y-3">
          {courses.map(course => (
            <View
              key={course.id}
              className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm"
              onClick={() => handleCourseClick(course.title)}
            >
              <View className="space-y-1">
                <Text className="block text-base text-gray-800 font-medium">{course.title}</Text>
                <Text className="block text-xs text-gray-500">{course.duration}</Text>
              </View>
              <Tag color="primary" shape="rounded">
                {course.tag}
              </Tag>
            </View>
          ))}
        </View>
      </View>
    </PageWrapper>
  );
}
