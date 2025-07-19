import React from 'react';
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import {
  View,
  Flex,
  Navigation,
  Heading,
  IconButton,
  Breadcrumb,
  Responsive,
  Link,
  TruncateText,
} from '@instructure/ui';
import {
  IconDashboardLine,
  IconCoursesLine,
  IconCalendarMonthLine,
  IconInboxLine,
  IconDocumentLine,
  IconSettingsLine,
  IconQuestionLine,
  IconArrowOpenStartLine,
} from '@instructure/ui-icons';
import { useNavigate } from '@tanstack/react-router';
import { useAuth } from '../hooks/useAuth';

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: ({ context }) => {
    // If not authenticated, redirect to login
    const auth = (context as any).auth;
    if (!auth || !auth.authState.isAuthenticated) {
      throw redirect({
        to: '/',
      });
    }
  },
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const navigate = useNavigate();
  const { authState, logout } = useAuth();
  const pathname = window.location.pathname;

  React.useEffect(() => {
    if (!authState.isAuthenticated) {
      navigate({ to: '/' });
    }
  }, [authState.isAuthenticated, navigate]);

  const handleNavigation = (path: string) => {
    navigate({ to: path });
  };

  const getBreadcrumbs = () => {
    // TODO: Build breadcrumbs based on current route
    const parts = pathname.split('/').filter(Boolean);
    return parts.map((part) => part.charAt(0).toUpperCase() + part.slice(1));
  };

  return (
    <View as="div" height="100vh" background="primary">
      {/* Header */}
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
                screenReaderLabel="Settings"
                onClick={() => handleNavigation('/settings')}
              >
                <IconSettingsLine color="primary-inverse" />
              </IconButton>
              <IconButton
                withBackground={false}
                withBorder={false}
                screenReaderLabel="Help"
                onClick={() => handleNavigation('/help')}
              >
                <IconQuestionLine color="primary-inverse" />
              </IconButton>
              <IconButton
                withBackground={false}
                withBorder={false}
                screenReaderLabel="Logout"
                onClick={logout}
                title={authState.user?.name || 'User'}
              >
                <View
                  as="div"
                  width="24px"
                  height="24px"
                  background="primary"
                  borderRadius="circle"
                  textAlign="center"
                  display="inline-block"
                >
                  <span style={{ color: 'white', fontSize: '14px', fontWeight: 'bold' }}>
                    {(authState.user?.name || 'U').charAt(0).toUpperCase()}
                  </span>
                </View>
              </IconButton>
            </Flex>
          </Flex.Item>
        </Flex>
      </View>

      <Flex height="calc(100vh - 80px)">
        {/* Sidebar Navigation */}
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
                  handleNavigation('/dashboard');
                }}
                selected={pathname === '/dashboard'}
              />
              <Navigation.Item
                label="Courses"
                href="#"
                icon={<IconCoursesLine />}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavigation('/courses');
                }}
                selected={pathname.startsWith('/courses')}
              />
              <Navigation.Item
                label="Calendar"
                href="#"
                icon={<IconCalendarMonthLine />}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavigation('/calendar');
                }}
                selected={pathname === '/calendar'}
              />
              <Navigation.Item
                label="Inbox"
                href="#"
                icon={<IconInboxLine />}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavigation('/inbox');
                }}
                selected={pathname === '/inbox'}
              />
              <Navigation.Item
                label="Files"
                href="#"
                icon={<IconDocumentLine />}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavigation('/files');
                }}
                selected={pathname === '/files'}
              />
            </Navigation>
          </View>
        </Flex.Item>

        {/* Main Content Area */}
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
                    const breadcrumbs = getBreadcrumbs();
                    if (matches?.includes('tablet')) {
                      return (
                        <Breadcrumb label="breadcrumb">
                          {breadcrumbs.map((crumb) => (
                            <Breadcrumb.Link
                              key={crumb}
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                // Navigate to breadcrumb path
                              }}
                            >
                              {crumb}
                            </Breadcrumb.Link>
                          ))}
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
                            navigate({ to: '..' });
                          }}
                        >
                          <TruncateText>
                            {breadcrumbs[breadcrumbs.length - 1] || 'Back'}
                          </TruncateText>
                        </Link>
                      );
                  }}
                </Responsive>
              </View>
            </Flex.Item>

            {/* Page Content */}
            <Flex.Item shouldGrow>
              <View as="main" padding="large" background="secondary" height="100%" overflowY="auto">
                <Outlet />
              </View>
            </Flex.Item>
          </Flex>
        </Flex.Item>
      </Flex>
    </View>
  );
}
