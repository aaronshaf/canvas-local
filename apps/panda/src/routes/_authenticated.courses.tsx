import { createFileRoute } from '@tanstack/react-router';
import { View, Heading, Grid } from '@instructure/ui';
import { CourseCard } from '@panda/ui-components';
import { useEffectQuery } from '../hooks/useEffectQuery';
import { CourseService, type CourseStats } from '@panda/shared-lib';

export const Route = createFileRoute('/_authenticated/courses')({
  component: CoursesPage,
});

function CoursesPage() {
  const navigate = Route.useNavigate();

  const { data: courses = [], isLoading } = useEffectQuery<CourseStats[], Error>({
    queryKey: ['courses'],
    queryFn: CourseService.getCoursesWithStats,
  });

  const handleCourseClick = (courseId: string) => {
    navigate({ to: '/courses/$courseId', params: { courseId } });
  };

  return (
    <View>
      <Heading level="h2" margin="0 0 large 0">
        All Courses
      </Heading>

      <Grid colSpacing="large" rowSpacing="large">
        {courses.map((course) => (
          <Grid.Row key={course.id}>
            <Grid.Col width={{ small: 12, medium: 6, large: 4 }}>
              <CourseCard course={course} onClick={() => handleCourseClick(course.id)} />
            </Grid.Col>
          </Grid.Row>
        ))}
      </Grid>

      {!isLoading && courses.length === 0 && (
        <View margin="xx-large 0" textAlign="center">
          <Heading level="h3" color="secondary">
            No courses found
          </Heading>
        </View>
      )}
    </View>
  );
}
