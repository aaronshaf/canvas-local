import { Schema } from '@effect/schema';

export const SubmissionWorkflowState = Schema.Literal(
  'unsubmitted',
  'submitted',
  'graded',
  'pending_review',
);

export const Submission = Schema.Struct({
  id: Schema.Number,
  assignment_id: Schema.Number,
  user_id: Schema.Number,
  submission_type: Schema.optional(Schema.String),
  workflow_state: SubmissionWorkflowState,
  score: Schema.optional(Schema.Number),
  grade: Schema.optional(Schema.String),
  graded_at: Schema.optional(Schema.Date),
  grader_id: Schema.optional(Schema.Number),
  submitted_at: Schema.optional(Schema.Date),
  attempt: Schema.Number,
  body: Schema.optional(Schema.String),
  url: Schema.optional(Schema.String),
  late: Schema.Boolean,
  missing: Schema.Boolean,
  excused: Schema.Boolean,
  seconds_late: Schema.Number,
  cached_due_date: Schema.optional(Schema.Date),
  created_at: Schema.Date,
  updated_at: Schema.Date,
  synced_at: Schema.Date,
});

export type Submission = Schema.Schema.Type<typeof Submission>;

export const CreateSubmissionInput = Schema.Struct({
  id: Schema.Number,
  assignment_id: Schema.Number,
  user_id: Schema.Number,
  submission_type: Schema.optional(Schema.String),
  workflow_state: SubmissionWorkflowState,
  score: Schema.optional(Schema.Number),
  grade: Schema.optional(Schema.String),
  graded_at: Schema.optional(Schema.Date),
  grader_id: Schema.optional(Schema.Number),
  submitted_at: Schema.optional(Schema.Date),
  attempt: Schema.optional(Schema.Number),
  body: Schema.optional(Schema.String),
  url: Schema.optional(Schema.String),
  late: Schema.optional(Schema.Boolean),
  missing: Schema.optional(Schema.Boolean),
  excused: Schema.optional(Schema.Boolean),
  seconds_late: Schema.optional(Schema.Number),
  cached_due_date: Schema.optional(Schema.Date),
});

export type CreateSubmissionInput = Schema.Schema.Type<typeof CreateSubmissionInput>;
