import { Schema } from '@effect/schema';

export const CourseWorkflowState = Schema.Literal(
  'unpublished',
  'available',
  'completed',
  'deleted',
);

export const Course = Schema.Struct({
  id: Schema.Number,
  name: Schema.String,
  course_code: Schema.optional(Schema.String),
  workflow_state: CourseWorkflowState,
  account_id: Schema.optional(Schema.Number),
  start_at: Schema.optional(Schema.Date),
  end_at: Schema.optional(Schema.Date),
  enrollments_count: Schema.Number,
  hide_final_grades: Schema.Boolean,
  time_zone: Schema.optional(Schema.String),
  default_view: Schema.optional(Schema.String),
  syllabus_body: Schema.optional(Schema.String),
  created_at: Schema.Date,
  updated_at: Schema.Date,
  synced_at: Schema.Date,
});

export type Course = Schema.Schema.Type<typeof Course>;

export const CreateCourseInput = Schema.Struct({
  id: Schema.Number,
  name: Schema.String,
  course_code: Schema.optional(Schema.String),
  workflow_state: Schema.optional(CourseWorkflowState),
  account_id: Schema.optional(Schema.Number),
  start_at: Schema.optional(Schema.Date),
  end_at: Schema.optional(Schema.Date),
  enrollments_count: Schema.optional(Schema.Number),
  hide_final_grades: Schema.optional(Schema.Boolean),
  time_zone: Schema.optional(Schema.String),
  default_view: Schema.optional(Schema.String),
  syllabus_body: Schema.optional(Schema.String),
});

export type CreateCourseInput = Schema.Schema.Type<typeof CreateCourseInput>;
