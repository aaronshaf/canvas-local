import type React from 'react';
import { View } from '@instructure/ui-view';
import { Heading } from '@instructure/ui-heading';
import { Text } from '@instructure/ui-text';
import { Link } from '@instructure/ui-link';
import { Flex } from '@instructure/ui-flex';
import { ProgressBar } from '@instructure/ui-progress';
import { Badge } from '@instructure/ui-badge';
import { IconAssignmentLine, IconDiscussionLine, IconQuizLine } from '@instructure/ui-icons';

export interface CourseData {
  id: string;
  name: string;
  courseCode: string;
  term: string;
  enrollmentType: 'student' | 'teacher' | 'ta' | 'observer';
  color?: string;
  assignmentsDue: number;
  discussions: number;
  announcements: number;
  progress?: number;
}

export interface CourseCardProps {
  course: CourseData;
  onClick?: (courseId: string) => void;
}

export const CourseCard: React.FC<CourseCardProps> = ({ course, onClick }) => {
  const cardColor = course.color || '#394B58';

  return (
    <View
      as="article"
      background="primary"
      borderWidth="small"
      borderRadius="medium"
      shadow="resting"
      cursor="pointer"
      onClick={() => onClick?.(course.id)}
      position="relative"
      height="280px"
    >
      <View
        background="brand"
        height="120px"
        style={{ backgroundColor: cardColor }}
        borderRadius="medium medium 0 0"
      />
      <View padding="medium">
        <Heading level="h3" margin="0 0 x-small 0">
          <Link
            isWithinText={false}
            onClick={(e) => {
              e.preventDefault();
              onClick?.(course.id);
            }}
          >
            {course.name}
          </Link>
        </Heading>
        <Text size="small" color="secondary">
          {course.courseCode} • {course.term}
        </Text>

        <Flex margin="medium 0 0 0" gap="small">
          {course.assignmentsDue > 0 && (
            <Flex.Item>
              <Badge count={course.assignmentsDue}>
                <IconAssignmentLine size="x-small" />
              </Badge>
            </Flex.Item>
          )}
          {course.discussions > 0 && (
            <Flex.Item>
              <Badge count={course.discussions}>
                <IconDiscussionLine size="x-small" />
              </Badge>
            </Flex.Item>
          )}
          {course.announcements > 0 && (
            <Flex.Item>
              <Badge count={course.announcements}>
                <IconQuizLine size="x-small" />
              </Badge>
            </Flex.Item>
          )}
        </Flex>

        {course.progress !== undefined && (
          <View margin="medium 0 0 0">
            <Text size="small" weight="normal">
              Course Progress
            </Text>
            <ProgressBar
              screenReaderLabel="Course completion"
              valueNow={course.progress}
              valueMax={100}
              size="small"
              margin="x-small 0 0 0"
            />
          </View>
        )}
      </View>
    </View>
  );
};
