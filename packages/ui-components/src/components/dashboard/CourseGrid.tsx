import type React from 'react';
import { View } from '@instructure/ui-view';
import { Grid } from '@instructure/ui-grid';
import { CourseCard } from './CourseCard';
import type { CourseData } from './CourseCard';
import { Heading } from '@instructure/ui-heading';
import { Text } from '@instructure/ui-text';
import { Spinner } from '@instructure/ui-spinner';
import { Flex } from '@instructure/ui-flex';

export interface CourseGridProps {
  courses: CourseData[];
  isLoading?: boolean;
  onCourseClick?: (courseId: string) => void;
}

export const CourseGrid: React.FC<CourseGridProps> = ({ courses, isLoading, onCourseClick }) => {
  if (isLoading) {
    return (
      <Flex justifyItems="center" alignItems="center" height="400px">
        <Spinner renderTitle="Loading courses" size="large" />
      </Flex>
    );
  }

  if (courses.length === 0) {
    return (
      <View textAlign="center" padding="xx-large">
        <Heading level="h3" color="secondary" margin="0 0 small 0">
          No courses found
        </Heading>
        <Text color="secondary">You don't have any active courses at the moment.</Text>
      </View>
    );
  }

  return (
    <Grid colSpacing="medium" rowSpacing="medium">
      {courses.map((course) => (
        <Grid.Row key={course.id}>
          <Grid.Col width={{ small: 12, medium: 6, large: 4, xLarge: 3 }}>
            <CourseCard course={course} onClick={onCourseClick} />
          </Grid.Col>
        </Grid.Row>
      ))}
    </Grid>
  );
};
