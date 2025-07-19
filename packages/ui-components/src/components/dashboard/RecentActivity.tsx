import type React from 'react';
import { View } from '@instructure/ui-view';
import { List } from '@instructure/ui-list';
import { Text } from '@instructure/ui-text';
import { Link } from '@instructure/ui-link';
import { Flex } from '@instructure/ui-flex';
import { Heading } from '@instructure/ui-heading';
import { Badge } from '@instructure/ui-badge';
import {
  IconAssignmentLine,
  IconDiscussionLine,
  IconAnnouncementLine,
  IconQuizLine,
  IconModuleLine,
} from '@instructure/ui-icons';

export type ActivityType = 'assignment' | 'discussion' | 'announcement' | 'quiz' | 'module';

export interface ActivityItem {
  id: string;
  type: ActivityType;
  title: string;
  courseName: string;
  courseId: string;
  timestamp: Date;
  unread?: boolean;
  dueDate?: Date;
  points?: number;
  author?: {
    name: string;
    avatarUrl?: string;
  };
}

export interface RecentActivityProps {
  activities: ActivityItem[];
  onActivityClick?: (activity: ActivityItem) => void;
}

const getActivityIcon = (type: ActivityType) => {
  switch (type) {
    case 'assignment':
      return <IconAssignmentLine />;
    case 'discussion':
      return <IconDiscussionLine />;
    case 'announcement':
      return <IconAnnouncementLine />;
    case 'quiz':
      return <IconQuizLine />;
    case 'module':
      return <IconModuleLine />;
  }
};

const formatTimeAgo = (date: Date): string => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 60) {
    return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  }
  if (hours < 24) {
    return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  }
  return `${days} day${days !== 1 ? 's' : ''} ago`;
};

export const RecentActivity: React.FC<RecentActivityProps> = ({ activities, onActivityClick }) => {
  return (
    <View as="section">
      <Heading level="h3" margin="0 0 medium 0">
        Recent Activity
      </Heading>
      {activities.length === 0 ? (
        <View textAlign="center" padding="large" background="secondary">
          <Text color="secondary">No recent activity</Text>
        </View>
      ) : (
        <List isUnstyled>
          {activities.map((activity) => (
            <List.Item key={activity.id}>
              <View
                padding="small"
                background={activity.unread ? 'brand' : 'primary'}
                borderRadius="medium"
                margin="0 0 small 0"
                cursor="pointer"
                onClick={() => onActivityClick?.(activity)}
              >
                <Flex gap="small">
                  <Flex.Item shouldShrink={false}>
                    <View color="brand">{getActivityIcon(activity.type)}</View>
                  </Flex.Item>
                  <Flex.Item shouldGrow>
                    <Link
                      isWithinText={false}
                      onClick={(e) => {
                        e.preventDefault();
                        onActivityClick?.(activity);
                      }}
                    >
                      {activity.title}
                    </Link>
                    <Flex gap="small" margin="x-small 0 0 0">
                      <Text size="small" color="secondary">
                        {activity.courseName}
                      </Text>
                      <Text size="small" color="secondary">
                        •
                      </Text>
                      <Text size="small" color="secondary">
                        {formatTimeAgo(activity.timestamp)}
                      </Text>
                      {activity.dueDate && (
                        <>
                          <Text size="small" color="secondary">
                            •
                          </Text>
                          <Text size="small" color="danger">
                            Due {activity.dueDate.toLocaleDateString()}
                          </Text>
                        </>
                      )}
                    </Flex>
                  </Flex.Item>
                  {activity.unread && (
                    <Flex.Item>
                      <Badge
                        count={1}
                        countUntil={1}
                        formatOutput={() => 'New'}
                        type="count"
                        standalone
                      />
                    </Flex.Item>
                  )}
                </Flex>
              </View>
            </List.Item>
          ))}
        </List>
      )}
    </View>
  );
};
