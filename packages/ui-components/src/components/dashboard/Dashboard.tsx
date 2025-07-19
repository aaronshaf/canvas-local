import { useState } from 'react';
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
  IconArrowOpenStartLine,
} from '@instructure/ui-icons';
import { Tray } from '@instructure/ui-tray';
import { Navigation } from '@instructure/ui-navigation';
import { List } from '@instructure/ui-list';
import { Link } from '@instructure/ui-link';
import { Badge } from '@instructure/ui-badge';
import { Breadcrumb } from '@instructure/ui-breadcrumb';
import { Responsive } from '@instructure/ui-responsive';
import { TruncateText } from '@instructure/ui-truncate-text';
import { DashboardContent } from './DashboardContent';
import type { CourseData, ActivityItem } from './index';

import type { FC } from 'react';

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

export const Dashboard: FC<DashboardProps> = ({
  userName,
  courses,
  recentActivities,
  isLoading,
  onLogout,
  onNavigate,
  onCourseClick,
  onActivityClick,
}) => {
  const [trayOpen, setTrayOpen] = useState(false);

  return (
    <View as="div" height="100vh" background="primary">
      <View as="header" background="primary-inverse" padding="medium" shadow="resting">
        <Flex justifyItems="space-between" alignItems="center">
          <Flex.Item>
            <Heading level="h1" color="primary-inverse">
              Panda
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
          <View
            as="div"
            height="100%"
            background="secondary"
            borderWidth="0 small 0 0"
            borderColor="primary"
          >
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
          </View>
        </Flex.Item>
        <Flex.Item shouldGrow>
          <Flex direction="column" height="100%">
            {/* Breadcrumb Area */}
            <Flex.Item>
              <View
                as="div"
                padding="small medium"
                background="secondary"
                borderWidth="0 0 small 0"
                borderColor="primary"
              >
                <Responsive
                  query={{
                    tablet: { minWidth: 768 },
                  }}
                >
                  {(_, matches) => {
                    if (matches?.includes('tablet')) {
                      return (
                        <Breadcrumb label="breadcrumb">
                          <Breadcrumb.Link
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              onNavigate?.('dashboard');
                            }}
                          >
                            Dashboard
                          </Breadcrumb.Link>
                        </Breadcrumb>
                      );
                    }
                    return (
                      <Link
                        href="#"
                        isWithinText={false}
                        renderIcon={IconArrowOpenStartLine}
                        onClick={(e) => {
                          e.preventDefault();
                          onNavigate?.('dashboard');
                        }}
                      >
                        <TruncateText>Dashboard</TruncateText>
                      </Link>
                    );
                  }}
                </Responsive>
              </View>
            </Flex.Item>

            {/* Main Content Area */}
            <Flex.Item shouldGrow>
              <View as="main" padding="large" background="secondary" height="100%" overflowY="auto">
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
