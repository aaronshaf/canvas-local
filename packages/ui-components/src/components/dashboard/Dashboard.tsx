import React from 'react';
import { View } from '@instructure/ui-view';
import { Heading } from '@instructure/ui-heading';
import { Flex } from '@instructure/ui-flex';
import { IconButton } from '@instructure/ui-buttons';
import {
  IconSettingsLine,
  IconCalendarMonthLine,
  IconInboxLine,
  IconQuestionLine,
  IconDashboardLine,
  IconCoursesLine,
  IconDocumentLine,
} from '@instructure/ui-icons';
import { Tray } from '@instructure/ui-tray';
import { Navigation } from '@instructure/ui-navigation';
import { List } from '@instructure/ui-list';
import { Link } from '@instructure/ui-link';
import { Badge } from '@instructure/ui-badge';
import { DashboardContent } from './DashboardContent';
import type { CourseData, ActivityItem } from './index';

export interface DashboardProps {
  userName: string;
  courses: CourseData[];
  recentActivities: ActivityItem[];
  isLoading?: boolean;
  onLogout: () => void;
  onNavigate?: (section: string) => void;
  onCourseClick?: (courseId: string) => void;
  onActivityClick?: (activity: ActivityItem) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  userName,
  courses,
  recentActivities,
  isLoading,
  onLogout,
  onNavigate,
  onCourseClick,
  onActivityClick,
}) => {
  const [trayOpen, setTrayOpen] = React.useState(false);

  return (
    <View as="div" height="100vh" background="primary">
      <View as="header" background="primary-inverse" padding="medium" shadow="resting">
        <Flex justifyItems="space-between" alignItems="center">
          <Flex.Item>
            <Heading level="h1" color="primary-inverse">
              Canvas Local
            </Heading>
          </Flex.Item>
          <Flex.Item>
            <Flex gap="small">
              <IconButton
                withBackground={false}
                withBorder={false}
                screenReaderLabel="Inbox"
                onClick={() => onNavigate?.('inbox')}
              >
                <Badge count={3}>
                  <IconInboxLine color="primary-inverse" />
                </Badge>
              </IconButton>
              <IconButton
                withBackground={false}
                withBorder={false}
                screenReaderLabel="Calendar"
                onClick={() => onNavigate?.('calendar')}
              >
                <IconCalendarMonthLine color="primary-inverse" />
              </IconButton>
              <IconButton
                withBackground={false}
                withBorder={false}
                screenReaderLabel="Help"
                onClick={() => onNavigate?.('help')}
              >
                <IconQuestionLine color="primary-inverse" />
              </IconButton>
              <IconButton
                withBackground={false}
                withBorder={false}
                screenReaderLabel="Settings"
                onClick={() => setTrayOpen(true)}
              >
                <IconSettingsLine color="primary-inverse" />
              </IconButton>
            </Flex>
          </Flex.Item>
        </Flex>
      </View>

      <Flex height="calc(100vh - 80px)">
        <Flex.Item width="240px" shouldGrow={false}>
          <Navigation
            label="Main navigation"
            toggleLabel={{
              expandedLabel: 'Minimize Navigation',
              minimizedLabel: 'Expand Navigation',
            }}
          >
            <Navigation.Item
              label="Dashboard"
              href="#"
              icon={<IconDashboardLine />}
              onClick={(e) => {
                e.preventDefault();
                onNavigate?.('dashboard');
              }}
              selected
            />
            <Navigation.Item
              label="Courses"
              href="#"
              icon={<IconCoursesLine />}
              onClick={(e) => {
                e.preventDefault();
                onNavigate?.('courses');
              }}
            />
            <Navigation.Item
              label="Calendar"
              href="#"
              icon={<IconCalendarMonthLine />}
              onClick={(e) => {
                e.preventDefault();
                onNavigate?.('calendar');
              }}
            />
            <Navigation.Item
              label="Inbox"
              href="#"
              icon={<IconInboxLine />}
              onClick={(e) => {
                e.preventDefault();
                onNavigate?.('inbox');
              }}
            >
              <Badge count={3} />
            </Navigation.Item>
            <Navigation.Item
              label="Files"
              href="#"
              icon={<IconDocumentLine />}
              onClick={(e) => {
                e.preventDefault();
                onNavigate?.('files');
              }}
            />
          </Navigation>
        </Flex.Item>
        <Flex.Item shouldGrow>
          <View as="main" padding="large" background="secondary">
            <Heading level="h2" margin="0 0 medium 0">
              Welcome back, {userName}!
            </Heading>
            <DashboardContent
              courses={courses}
              recentActivities={recentActivities}
              isLoading={isLoading}
              onCourseClick={onCourseClick}
              onActivityClick={onActivityClick}
            />
          </View>
        </Flex.Item>
      </Flex>

      <Tray
        label="User Settings"
        open={trayOpen}
        onDismiss={() => setTrayOpen(false)}
        size="small"
        placement="end"
      >
        <View as="div" padding="medium">
          <Heading level="h3" margin="0 0 medium 0">
            Settings
          </Heading>
          <List isUnstyled>
            <List.Item>
              <Link onClick={() => onNavigate?.('profile')}>Profile</Link>
            </List.Item>
            <List.Item>
              <Link onClick={() => onNavigate?.('notifications')}>Notifications</Link>
            </List.Item>
            <List.Item>
              <Link onClick={() => onNavigate?.('account')}>Account Settings</Link>
            </List.Item>
            <List.Item>
              <Link onClick={onLogout}>Logout</Link>
            </List.Item>
          </List>
        </View>
      </Tray>
    </View>
  );
};
