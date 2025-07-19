import { createFileRoute } from '@tanstack/react-router';
import { Heading } from '@instructure/ui-heading';
import { DashboardContent, type ActivityItem, type ActivityType } from '@panda/ui-components';
import { useAuth } from '../hooks/useAuth';
import { CourseService, ActivityService, type CourseStats, type Activity } from '@panda/shared-lib';
import { useEffectQuery } from '../hooks/useEffectQuery';

export const Route = createFileRoute('/_authenticated/dashboard')({
  component: DashboardPage,
});

function DashboardPage() {
  const { authState } = useAuth();
  const navigate = Route.useNavigate();

  const { data: courses = [], isLoading: coursesLoading } = useEffectQuery<CourseStats[], Error>({
    queryKey: ['courses'],
    queryFn: CourseService.getCoursesWithStats,
    enabled: authState.isAuthenticated,
  });

  const { data: activities = [], isLoading: activitiesLoading } = useEffectQuery<Activity[], Error>(
    {
      queryKey: ['activities', 'recent'],
      queryFn: ActivityService.getRecentActivities,
      enabled: authState.isAuthenticated,
      refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
    },
  );

  // Transform Activity to ActivityItem
  const activityItems: ActivityItem[] = activities.map((activity) => ({
    id: activity.id,
    type: activity.type as ActivityType,
    title: activity.title,
    courseName: activity.courseName,
    courseId: activity.courseId,
    timestamp: activity.timestamp,
    unread: activity.unread,
    dueDate: activity.dueDate,
    points: activity.points,
  }));

  const handleCourseClick = (courseId: string) => {
    navigate({ to: '/courses/$courseId', params: { courseId } });
  };

  const handleActivityClick = (activity: ActivityItem) => {
    console.log('Activity clicked:', activity);
    // TODO: Navigate to appropriate activity page
  };

  return (
    <>
      <Heading level="h2" margin="0 0 medium 0">
        Welcome back, {authState.user?.name || 'User'}!
      </Heading>
      <DashboardContent
        courses={courses}
        recentActivities={activityItems}
        isLoading={coursesLoading || activitiesLoading}
        onCourseClick={handleCourseClick}
        onActivityClick={handleActivityClick}
      />
    </>
  );
}
