import { Effect } from 'effect';
import { TauriApiClient } from '../api/tauri-client';

// Define the GraphQL query as a string for now
// TODO: Use generated types once codegen is properly set up
const GetCoursesQuery = `
  query GetCourses {
    allCourses {
      id
      _id
      name
      courseCode
      term {
        id
        _id
        name
      }
      enrollmentsConnection {
        edges {
          node {
            id
            _id
            state
            type
          }
        }
      }
    }
  }
`;

export interface CourseStats {
  id: string;
  name: string;
  courseCode: string;
  term: string;
  enrollmentType: 'student' | 'teacher' | 'ta' | 'observer';
  color: string;
  assignmentsDue: number;
  discussions: number;
  announcements: number;
  progress: number;
}

interface GraphQLCourse {
  id: string;
  _id: string;
  name: string;
  courseCode?: string;
  course_code?: string;
  term?: {
    id: string;
    _id: string;
    name: string;
  };
  enrollmentsConnection?: {
    edges?: Array<{
      node?: {
        id: string;
        _id: string;
        state: string;
        type: string;
      };
    }>;
  };
}

interface RestCourse {
  id: number;
  name: string;
  course_code?: string;
  courseCode?: string;
  enrollment_term_id?: string;
  course_color?: string;
  enrollments?: Array<{
    type: string;
  }>;
  course_progress?: {
    completed_at?: string;
    completed_count?: number;
    requirement_count?: number;
  };
}

export const CourseService = {
  getCourses: () =>
    TauriApiClient.graphql<{ allCourses: GraphQLCourse[] }>({
      query: GetCoursesQuery,
    }).pipe(
      Effect.map((data) => {
        const courses = data?.allCourses || [];

        // Transform to CourseStats format
        const colors = ['#1A73E8', '#0F9D58', '#EA4335', '#F9AB00', '#9C27B0', '#00BCD4'];

        return courses.map((course, index): CourseStats => {
          const enrollment = course.enrollmentsConnection?.edges?.[0]?.node;
          const rawType = enrollment?.type?.toLowerCase().replace('enrollment', '');
          const enrollmentType = rawType || 'student';

          return {
            id: course._id || course.id,
            name: course.name || 'Unnamed Course',
            courseCode: course.courseCode || course.course_code || '',
            term: course.term?.name || 'Current Term',
            enrollmentType: enrollmentType as 'student' | 'teacher' | 'ta' | 'observer',
            color: colors[index % colors.length] || '#1A73E8',
            assignmentsDue: 0, // TODO: Fetch from separate query
            discussions: 0, // TODO: Fetch from separate query
            announcements: 0, // TODO: Fetch from separate query
            progress: 0, // TODO: Calculate from course progress
          };
        });
      }),
    ),

  // For now, let's also provide a REST fallback that gets more complete data
  getCoursesWithStats: () =>
    TauriApiClient.rest<RestCourse[]>({
      method: 'GET',
      path: '/api/v1/courses',
      params: {
        enrollment_state: 'active',
        'include[]': ['total_scores', 'current_grading_period_scores', 'course_progress'],
      },
    }).pipe(
      Effect.map((courses) => {
        const colors = ['#1A73E8', '#0F9D58', '#EA4335', '#F9AB00', '#9C27B0', '#00BCD4'];

        return courses.map((course, index): CourseStats => {
          const rawEnrollmentType = course.enrollments?.[0]?.type
            ?.toLowerCase()
            .replace('enrollment', '');
          const enrollmentType = rawEnrollmentType || 'student';

          const progress = course.course_progress?.completed_at
            ? 100
            : Math.round(
                ((course.course_progress?.completed_count || 0) /
                  (course.course_progress?.requirement_count || 1)) *
                  100,
              );

          return {
            id: course.id.toString(),
            name: course.name || 'Unnamed Course',
            courseCode: course.course_code || course.courseCode || '',
            term: course.enrollment_term_id || 'Current Term',
            enrollmentType: enrollmentType as 'student' | 'teacher' | 'ta' | 'observer',
            color: course.course_color || colors[index % colors.length] || '#1A73E8',
            assignmentsDue: 0, // TODO: Fetch from assignments endpoint
            discussions: 0, // TODO: Fetch from discussions endpoint
            announcements: 0, // TODO: Fetch from announcements endpoint
            progress,
          };
        });
      }),
    ),
};