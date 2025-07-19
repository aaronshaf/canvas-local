import React from 'react';
import { View } from '@instructure/ui-view';
import { Heading } from '@instructure/ui-heading';
import { Tabs } from '@instructure/ui-tabs';
import { CourseGrid } from './CourseGrid';
import type { CourseData } from './CourseCard';
import { RecentActivity, type ActivityItem } from './RecentActivity';
import { Flex } from '@instructure/ui-flex';
import { Button } from '@instructure/ui-buttons';
import { IconPlusLine } from '@instructure/ui-icons';
import { SimpleSelect } from '@instructure/ui-simple-select';

export interface DashboardContentProps {
  courses: CourseData[];
  recentActivities: ActivityItem[];
  isLoading?: boolean;
  onCourseClick?: (courseId: string) => void;
  onActivityClick?: (activity: ActivityItem) => void;
  onAddCourse?: () => void;
}

export const DashboardContent: React.FC<DashboardContentProps> = ({
  courses,
  recentActivities,
  isLoading,
  onCourseClick,
  onActivityClick,
  onAddCourse,
}) => {
  const [selectedTab, setSelectedTab] = React.useState<'cards' | 'recent'>('cards');
  const [courseFilter, setCourseFilter] = React.useState<string>('all');

  const filteredCourses = React.useMemo(() => {
    if (courseFilter === 'all') return courses;
    return courses.filter((course) => course.enrollmentType === courseFilter);
  }, [courses, courseFilter]);

  const activeCourses = courses.filter((c) => c.progress === undefined || c.progress < 100);
  const upcomingAssignments = recentActivities.filter(
    (a) => a.type === 'assignment' && a.dueDate && a.dueDate > new Date(),
  );

  return (
    <View as="div">
      <View margin="0 0 large 0">
        <Flex gap="medium" wrap="wrap">
          <Flex.Item>
            <View background="brand" padding="medium" borderRadius="medium" minWidth="200px">
              <Heading level="h4" color="primary-inverse" margin="0 0 x-small 0">
                Active Courses
              </Heading>
              <Heading level="h2" color="primary-inverse" margin="0">
                {activeCourses.length}
              </Heading>
            </View>
          </Flex.Item>
          <Flex.Item>
            <View background="alert" padding="medium" borderRadius="medium" minWidth="200px">
              <Heading level="h4" color="primary-inverse" margin="0 0 x-small 0">
                Upcoming Assignments
              </Heading>
              <Heading level="h2" color="primary-inverse" margin="0">
                {upcomingAssignments.length}
              </Heading>
            </View>
          </Flex.Item>
          <Flex.Item>
            <View background="success" padding="medium" borderRadius="medium" minWidth="200px">
              <Heading level="h4" color="primary-inverse" margin="0 0 x-small 0">
                Unread Activities
              </Heading>
              <Heading level="h2" color="primary-inverse" margin="0">
                {recentActivities.filter((a) => a.unread).length}
              </Heading>
            </View>
          </Flex.Item>
        </Flex>
      </View>

      <Tabs
        onRequestTabChange={(_, { index }) => {
          setSelectedTab(index === 0 ? 'cards' : 'recent');
        }}
      >
        <Tabs.Panel
          renderTitle="Course Cards"
          isSelected={selectedTab === 'cards'}
          padding="medium 0"
        >
          <View margin="0 0 medium 0">
            <Flex justifyItems="space-between" alignItems="end">
              <Flex.Item>
                <SimpleSelect
                  renderLabel="Filter courses"
                  value={courseFilter}
                  onChange={(_, { value }) => setCourseFilter(value as string)}
                >
                  <SimpleSelect.Option id="all" value="all">
                    All Courses
                  </SimpleSelect.Option>
                  <SimpleSelect.Option id="student" value="student">
                    Student
                  </SimpleSelect.Option>
                  <SimpleSelect.Option id="teacher" value="teacher">
                    Teacher
                  </SimpleSelect.Option>
                  <SimpleSelect.Option id="ta" value="ta">
                    Teaching Assistant
                  </SimpleSelect.Option>
                </SimpleSelect>
              </Flex.Item>
              {onAddCourse && (
                <Flex.Item>
                  <Button onClick={onAddCourse} renderIcon={() => <IconPlusLine />}>
                    Add Course
                  </Button>
                </Flex.Item>
              )}
            </Flex>
          </View>
          <CourseGrid
            courses={filteredCourses}
            isLoading={isLoading}
            onCourseClick={onCourseClick}
          />
        </Tabs.Panel>
        <Tabs.Panel
          renderTitle="Recent Activity"
          isSelected={selectedTab === 'recent'}
          padding="medium 0"
        >
          <RecentActivity activities={recentActivities} onActivityClick={onActivityClick} />
        </Tabs.Panel>
      </Tabs>
    </View>
  );
};
