import { Effect } from 'effect';
import { TauriApiClient } from '../api/tauri-client';

export interface Activity {
  id: string;
  type: 'assignment' | 'discussion' | 'announcement' | 'quiz';
  title: string;
  courseName: string;
  courseId: string;
  timestamp: Date;
  unread: boolean;
  dueDate?: Date;
  points?: number;
}

interface UpcomingEvent {
  assignment?: {
    id: number;
    name: string;
    created_at: string;
    due_at?: string;
    points_possible?: number;
  };
  title?: string;
  context_name?: string;
  context_code?: string;
}

interface Announcement {
  id: number;
  title: string;
  context_name?: string;
  context_code?: string;
  posted_at?: string;
  created_at: string;
  read_state?: string;
}

interface ActivityStreamItem {
  id: number;
  type: string;
  title: string;
  context_name?: string;
  course_id?: number;
  created_at: string;
  read_state?: string;
}

export const ActivityService = {
  getRecentActivities: (): Effect.Effect<Activity[], never, never> =>
    Effect.all([
      // Fetch assignments due soon
      TauriApiClient.rest<UpcomingEvent[]>({
        method: 'GET',
        path: '/api/v1/users/self/upcoming_events',
      }),

      // Fetch recent announcements
      TauriApiClient.rest<Announcement[]>({
        method: 'GET',
        path: '/api/v1/announcements',
        params: {
          context_codes: ['account_1'], // TODO: Get actual account context
          per_page: '10',
        },
      }),

      // Fetch unread discussions
      TauriApiClient.rest<ActivityStreamItem[]>({
        method: 'GET',
        path: '/api/v1/users/self/activity_stream',
        params: {
          per_page: '20',
        },
      }),
    ]).pipe(
      Effect.map(([upcomingEvents, announcements, activityStream]) => {
        const activities: Activity[] = [];

        // Process upcoming assignments
        for (const event of upcomingEvents) {
          if (event.assignment) {
            activities.push({
              id: event.assignment.id.toString(),
              type: 'assignment',
              title: event.title || event.assignment.name,
              courseName: event.context_name || 'Unknown Course',
              courseId: event.context_code?.replace('course_', '') || '',
              timestamp: new Date(event.assignment.created_at),
              unread: true,
              dueDate: event.assignment.due_at ? new Date(event.assignment.due_at) : undefined,
              points: event.assignment.points_possible,
            });
          }
        }

        // Process announcements
        for (const announcement of announcements) {
          activities.push({
            id: announcement.id.toString(),
            type: 'announcement',
            title: announcement.title,
            courseName: announcement.context_name || 'Unknown Course',
            courseId: announcement.context_code?.replace('course_', '') || '',
            timestamp: new Date(announcement.posted_at || announcement.created_at),
            unread: announcement.read_state === 'unread',
          });
        }

        // Process activity stream for discussions
        for (const item of activityStream) {
          if (item.type === 'DiscussionTopic' || item.type === 'Announcement') {
            activities.push({
              id: item.id.toString(),
              type: item.type === 'DiscussionTopic' ? 'discussion' : 'announcement',
              title: item.title,
              courseName: item.context_name || 'Unknown Course',
              courseId: item.course_id?.toString() || '',
              timestamp: new Date(item.created_at),
              unread: !item.read_state || item.read_state === 'unread',
            });
          }
        }

        // Sort by timestamp, most recent first
        return activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      }),
      Effect.catchAll(() =>
        // Return empty array on error
        Effect.succeed([]),
      ),
    ),
};
