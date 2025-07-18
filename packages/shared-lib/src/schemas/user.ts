import { Schema } from '@effect/schema';

export const User = Schema.Struct({
  id: Schema.Number,
  name: Schema.String,
  short_name: Schema.optional(Schema.String),
  sortable_name: Schema.optional(Schema.String),
  avatar_url: Schema.optional(Schema.String),
  email: Schema.optional(Schema.String),
  locale: Schema.optional(Schema.String),
  effective_locale: Schema.optional(Schema.String),
  pronouns: Schema.optional(Schema.String),
  created_at: Schema.Date,
  updated_at: Schema.Date,
  synced_at: Schema.Date,
});

export type User = Schema.Schema.Type<typeof User>;

export const CreateUserInput = Schema.Struct({
  id: Schema.Number,
  name: Schema.String,
  short_name: Schema.optional(Schema.String),
  sortable_name: Schema.optional(Schema.String),
  avatar_url: Schema.optional(Schema.String),
  email: Schema.optional(Schema.String),
  locale: Schema.optional(Schema.String),
  effective_locale: Schema.optional(Schema.String),
  pronouns: Schema.optional(Schema.String),
});

export type CreateUserInput = Schema.Schema.Type<typeof CreateUserInput>;
