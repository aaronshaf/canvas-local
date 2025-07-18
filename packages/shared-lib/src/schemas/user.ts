import { Schema } from '@effect/schema';

export const User = Schema.Struct({
  id: Schema.String,
  name: Schema.String,
  email: Schema.String,
  avatar_url: Schema.optional(Schema.String),
  pronouns: Schema.optional(Schema.String),
  login_id: Schema.optional(Schema.String),
  sis_user_id: Schema.optional(Schema.String),
  short_name: Schema.optional(Schema.String),
  sortable_name: Schema.optional(Schema.String),
  locale: Schema.optional(Schema.String),
  effective_locale: Schema.optional(Schema.String),
});

export type User = Schema.Schema.Type<typeof User>;

export const CreateUserInput = Schema.pick(User, 
  'id', 'name', 'email', 'avatar_url', 'pronouns', 'login_id', 'sis_user_id'
);

export type CreateUserInput = Schema.Schema.Type<typeof CreateUserInput>;
