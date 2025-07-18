import type { Migration } from '../migrations';

const schema = `-- Canvas Local Database Schema
-- Version: 1.0.0

-- Enable foreign key constraints
PRAGMA foreign_keys = ON;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    short_name TEXT,
    sortable_name TEXT,
    avatar_url TEXT,
    email TEXT,
    locale TEXT,
    effective_locale TEXT,
    pronouns TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    synced_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Courses table
CREATE TABLE IF NOT EXISTS courses (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    course_code TEXT,
    workflow_state TEXT NOT NULL DEFAULT 'unpublished',
    account_id INTEGER,
    start_at DATETIME,
    end_at DATETIME,
    enrollments_count INTEGER DEFAULT 0,
    hide_final_grades BOOLEAN DEFAULT 0,
    time_zone TEXT,
    default_view TEXT,
    syllabus_body TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    synced_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Other tables would follow...`;

export const initialSchemaMigration: Migration = {
  version: 1,
  name: 'initial_schema',
  up: schema,
  down: `
    DROP TABLE IF EXISTS sync_status;
    DROP TABLE IF EXISTS grades;
    DROP TABLE IF EXISTS folders;
    DROP TABLE IF EXISTS files;
    DROP TABLE IF EXISTS pages;
    DROP TABLE IF EXISTS module_items;
    DROP TABLE IF EXISTS modules;
    DROP TABLE IF EXISTS discussion_entries;
    DROP TABLE IF EXISTS discussion_topics;
    DROP TABLE IF EXISTS submissions;
    DROP TABLE IF EXISTS assignments;
    DROP TABLE IF EXISTS enrollments;
    DROP TABLE IF EXISTS courses;
    DROP TABLE IF EXISTS users;
  `,
};
