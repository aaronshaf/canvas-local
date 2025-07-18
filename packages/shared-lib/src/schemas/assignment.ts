import { Schema } from '@effect/schema';

export const GradingType = Schema.Literal(
  'pass_fail',
  'percent',
  'letter_grade',
  'gpa_scale',
  'points',
  'not_graded',
);

export const WorkflowState = Schema.Literal('unpublished', 'published', 'deleted');

export const Assignment = Schema.Struct({
  id: Schema.Number,
  course_id: Schema.Number,
  name: Schema.String,
  description: Schema.optional(Schema.String),
  due_at: Schema.optional(Schema.Date),
  unlock_at: Schema.optional(Schema.Date),
  lock_at: Schema.optional(Schema.Date),
  points_possible: Schema.optional(Schema.Number),
  grading_type: GradingType,
  submission_types: Schema.optional(Schema.String),
  workflow_state: WorkflowState,
  position: Schema.optional(Schema.Number),
  peer_reviews: Schema.Boolean,
  automatic_peer_reviews: Schema.Boolean,
  group_category_id: Schema.optional(Schema.Number),
  grade_group_students_individually: Schema.Boolean,
  anonymous_peer_reviews: Schema.Boolean,
  omit_from_final_grade: Schema.Boolean,
  moderated_grading: Schema.Boolean,
  created_at: Schema.Date,
  updated_at: Schema.Date,
  synced_at: Schema.Date,
});

export type Assignment = Schema.Schema.Type<typeof Assignment>;

export const CreateAssignmentInput = Schema.Struct({
  id: Schema.Number,
  course_id: Schema.Number,
  name: Schema.String,
  description: Schema.optional(Schema.String),
  due_at: Schema.optional(Schema.Date),
  unlock_at: Schema.optional(Schema.Date),
  lock_at: Schema.optional(Schema.Date),
  points_possible: Schema.optional(Schema.Number),
  grading_type: Schema.optional(GradingType),
  submission_types: Schema.optional(Schema.String),
  workflow_state: Schema.optional(WorkflowState),
  position: Schema.optional(Schema.Number),
  peer_reviews: Schema.optional(Schema.Boolean),
  automatic_peer_reviews: Schema.optional(Schema.Boolean),
  group_category_id: Schema.optional(Schema.Number),
  grade_group_students_individually: Schema.optional(Schema.Boolean),
  anonymous_peer_reviews: Schema.optional(Schema.Boolean),
  omit_from_final_grade: Schema.optional(Schema.Boolean),
  moderated_grading: Schema.optional(Schema.Boolean),
});

export type CreateAssignmentInput = Schema.Schema.Type<typeof CreateAssignmentInput>;
