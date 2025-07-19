import React from 'react';
import {
  CanvasThemeProvider,
  LoginForm,
  Dashboard,
  type CourseData,
  type ActivityItem,
} from '@canvas-local/ui-components';
import { useAuth } from './contexts/AuthContext';
import './App.css';

function App() {
  const { authState, login, logout, isLoading, error } = useAuth();
  const [courses] = React.useState<CourseData[]>([
    {
      id: '1',
      name: 'Introduction to Computer Science',
      courseCode: 'CS 101',
      term: 'Fall 2024',
      enrollmentType: 'student',
      color: '#1A73E8',
      assignmentsDue: 3,
      discussions: 2,
      announcements: 1,
      progress: 65,
    },
    {
      id: '2',
      name: 'Web Development Fundamentals',
      courseCode: 'WEB 201',
      term: 'Fall 2024',
      enrollmentType: 'student',
      color: '#0F9D58',
      assignmentsDue: 5,
      discussions: 0,
      announcements: 2,
      progress: 80,
    },
    {
      id: '3',
      name: 'Database Management Systems',
      courseCode: 'DB 301',
      term: 'Fall 2024',
      enrollmentType: 'student',
      color: '#EA4335',
      assignmentsDue: 2,
      discussions: 1,
      announcements: 0,
      progress: 45,
    },
  ]);

  const [activities] = React.useState<ActivityItem[]>([
    {
      id: '1',
      type: 'assignment',
      title: 'Project 3: Build a REST API',
      courseName: 'Web Development Fundamentals',
      timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      unread: true,
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      points: 100,
    },
    {
      id: '2',
      type: 'discussion',
      title: 'Week 5 Discussion: Database Normalization',
      courseName: 'Database Management Systems',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      unread: true,
    },
    {
      id: '3',
      type: 'announcement',
      title: 'Midterm Exam Schedule Posted',
      courseName: 'Introduction to Computer Science',
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
      unread: false,
    },
  ]);

  if (!authState.isAuthenticated) {
    return (
      <CanvasThemeProvider>
        <LoginForm onLogin={login} isLoading={isLoading} error={error} />
      </CanvasThemeProvider>
    );
  }

  return (
    <CanvasThemeProvider>
      <Dashboard
        userName={authState.user?.name || 'User'}
        courses={courses}
        recentActivities={activities}
        isLoading={isLoading}
        onLogout={logout}
        onNavigate={(section: string) => {
          console.log('Navigate to:', section);
        }}
        onCourseClick={(courseId: string) => {
          console.log('Open course:', courseId);
        }}
        onActivityClick={(activity: unknown) => {
          console.log('Open activity:', activity);
        }}
      />
    </CanvasThemeProvider>
  );
}

export default App;
