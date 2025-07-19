import { createFileRoute } from '@tanstack/react-router';
import { View, Heading, Tabs, Text } from '@instructure/ui';
import { useEffectQuery } from '../hooks/useEffectQuery';
import { CourseService } from '@canvas-local/shared-lib/services';
import { Effect } from 'effect';

export const Route = createFileRoute('/_authenticated/courses/$courseId')({
  component: CourseDetailPage,
});

function CourseDetailPage() {
  const { courseId } = Route.useParams();

  const { data: course, isLoading } = useEffectQuery({
    queryKey: ['course', courseId],
    queryFn: () =>
      Effect.tryPromise({
        try: async () => {
          // For now, just get from the courses list
          // Later we'll implement getCourseById
          const courses = await Effect.runPromise(CourseService.getCoursesWithStats());
          return courses.find((c) => c.id === courseId);
        },
        catch: (error) => new Error(String(error)),
      }),
  });

  if (isLoading) {
    return <Text>Loading course...</Text>;
  }

  if (!course) {
    return <Text>Course not found</Text>;
  }

  return (
    <View>
      <Heading level="h2" margin="0 0 medium 0">
        {course.name}
      </Heading>
      <Text color="secondary" size="large">
        {course.courseCode} • {course.term}
      </Text>

      <View margin="large 0 0 0">
        <Tabs>
          <Tabs.Panel renderTitle="Modules" isSelected>
            <View padding="medium">
              <Text>Modules content coming soon...</Text>
            </View>
          </Tabs.Panel>
          <Tabs.Panel renderTitle="Assignments">
            <View padding="medium">
              <Text>Assignments content coming soon...</Text>
            </View>
          </Tabs.Panel>
          <Tabs.Panel renderTitle="Discussions">
            <View padding="medium">
              <Text>Discussions content coming soon...</Text>
            </View>
          </Tabs.Panel>
          <Tabs.Panel renderTitle="Grades">
            <View padding="medium">
              <Text>Grades content coming soon...</Text>
            </View>
          </Tabs.Panel>
          <Tabs.Panel renderTitle="People">
            <View padding="medium">
              <Text>People content coming soon...</Text>
            </View>
          </Tabs.Panel>
        </Tabs>
      </View>
    </View>
  );
}
