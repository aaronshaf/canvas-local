-- Panda Database Schema
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

-- Enrollments table
CREATE TABLE IF NOT EXISTS enrollments (
    id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL,
    course_id INTEGER NOT NULL,
    type TEXT NOT NULL,
    role TEXT NOT NULL,
    enrollment_state TEXT NOT NULL,
    last_activity_at DATETIME,
    total_activity_time INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    synced_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    UNIQUE(user_id, course_id, type)
);

-- Assignments table
CREATE TABLE IF NOT EXISTS assignments (
    id INTEGER PRIMARY KEY,
    course_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    due_at DATETIME,
    unlock_at DATETIME,
    lock_at DATETIME,
    points_possible REAL,
    grading_type TEXT NOT NULL DEFAULT 'points',
    submission_types TEXT,
    workflow_state TEXT NOT NULL DEFAULT 'unpublished',
    position INTEGER,
    peer_reviews BOOLEAN DEFAULT 0,
    automatic_peer_reviews BOOLEAN DEFAULT 0,
    group_category_id INTEGER,
    grade_group_students_individually BOOLEAN DEFAULT 0,
    anonymous_peer_reviews BOOLEAN DEFAULT 0,
    omit_from_final_grade BOOLEAN DEFAULT 0,
    moderated_grading BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    synced_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- Submissions table
CREATE TABLE IF NOT EXISTS submissions (
    id INTEGER PRIMARY KEY,
    assignment_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    submission_type TEXT,
    workflow_state TEXT NOT NULL,
    score REAL,
    grade TEXT,
    graded_at DATETIME,
    grader_id INTEGER,
    submitted_at DATETIME,
    attempt INTEGER DEFAULT 1,
    body TEXT,
    url TEXT,
    late BOOLEAN DEFAULT 0,
    missing BOOLEAN DEFAULT 0,
    excused BOOLEAN DEFAULT 0,
    seconds_late INTEGER DEFAULT 0,
    cached_due_date DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    synced_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (grader_id) REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE(assignment_id, user_id)
);

-- Discussion topics table
CREATE TABLE IF NOT EXISTS discussion_topics (
    id INTEGER PRIMARY KEY,
    course_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    message TEXT,
    user_id INTEGER NOT NULL,
    last_reply_at DATETIME,
    posted_at DATETIME,
    discussion_type TEXT,
    position INTEGER,
    pinned BOOLEAN DEFAULT 0,
    locked BOOLEAN DEFAULT 0,
    assignment_id INTEGER,
    workflow_state TEXT NOT NULL DEFAULT 'active',
    group_category_id INTEGER,
    allow_rating BOOLEAN DEFAULT 0,
    only_graders_can_rate BOOLEAN DEFAULT 0,
    sort_by_rating BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    synced_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE SET NULL
);

-- Discussion entries table
CREATE TABLE IF NOT EXISTS discussion_entries (
    id INTEGER PRIMARY KEY,
    discussion_topic_id INTEGER NOT NULL,
    parent_id INTEGER,
    user_id INTEGER NOT NULL,
    message TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    synced_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (discussion_topic_id) REFERENCES discussion_topics(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES discussion_entries(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Modules table
CREATE TABLE IF NOT EXISTS modules (
    id INTEGER PRIMARY KEY,
    course_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    position INTEGER,
    unlock_at DATETIME,
    require_sequential_progress BOOLEAN DEFAULT 0,
    prerequisite_module_ids TEXT,
    workflow_state TEXT NOT NULL DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    synced_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- Module items table
CREATE TABLE IF NOT EXISTS module_items (
    id INTEGER PRIMARY KEY,
    module_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    position INTEGER,
    indent INTEGER DEFAULT 0,
    type TEXT NOT NULL,
    content_id INTEGER,
    html_url TEXT,
    url TEXT,
    completion_requirement_type TEXT,
    completion_requirement_min_score REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    synced_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE
);

-- Pages table
CREATE TABLE IF NOT EXISTS pages (
    id INTEGER PRIMARY KEY,
    course_id INTEGER NOT NULL,
    url TEXT NOT NULL,
    title TEXT NOT NULL,
    body TEXT,
    user_id INTEGER,
    published BOOLEAN DEFAULT 0,
    front_page BOOLEAN DEFAULT 0,
    locked_for_user BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    synced_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE(course_id, url)
);

-- Files table
CREATE TABLE IF NOT EXISTS files (
    id INTEGER PRIMARY KEY,
    folder_id INTEGER,
    display_name TEXT NOT NULL,
    filename TEXT NOT NULL,
    content_type TEXT,
    size INTEGER,
    user_id INTEGER,
    url TEXT,
    thumbnail_url TEXT,
    preview_url TEXT,
    locked BOOLEAN DEFAULT 0,
    hidden BOOLEAN DEFAULT 0,
    locked_for_user BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    synced_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (folder_id) REFERENCES folders(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Folders table
CREATE TABLE IF NOT EXISTS folders (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    parent_folder_id INTEGER,
    context_type TEXT NOT NULL,
    context_id INTEGER NOT NULL,
    position INTEGER,
    locked BOOLEAN DEFAULT 0,
    hidden BOOLEAN DEFAULT 0,
    locked_for_user BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    synced_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_folder_id) REFERENCES folders(id) ON DELETE CASCADE
);

-- Grades table
CREATE TABLE IF NOT EXISTS grades (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    enrollment_id INTEGER NOT NULL,
    current_grade TEXT,
    final_grade TEXT,
    current_score REAL,
    final_score REAL,
    current_points REAL,
    unposted_current_grade TEXT,
    unposted_final_grade TEXT,
    unposted_current_score REAL,
    unposted_final_score REAL,
    unposted_current_points REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    synced_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (enrollment_id) REFERENCES enrollments(id) ON DELETE CASCADE,
    UNIQUE(enrollment_id)
);

-- Sync status table
CREATE TABLE IF NOT EXISTS sync_status (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    entity_type TEXT NOT NULL,
    entity_id INTEGER NOT NULL,
    last_sync DATETIME NOT NULL,
    sync_status TEXT NOT NULL,
    error_message TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(entity_type, entity_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_enrollments_user_id ON enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course_id ON enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_assignments_course_id ON assignments(course_id);
CREATE INDEX IF NOT EXISTS idx_assignments_due_at ON assignments(due_at);
CREATE INDEX IF NOT EXISTS idx_submissions_assignment_id ON submissions(assignment_id);
CREATE INDEX IF NOT EXISTS idx_submissions_user_id ON submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_discussion_topics_course_id ON discussion_topics(course_id);
CREATE INDEX IF NOT EXISTS idx_discussion_entries_topic_id ON discussion_entries(discussion_topic_id);
CREATE INDEX IF NOT EXISTS idx_modules_course_id ON modules(course_id);
CREATE INDEX IF NOT EXISTS idx_module_items_module_id ON module_items(module_id);
CREATE INDEX IF NOT EXISTS idx_pages_course_id ON pages(course_id);
CREATE INDEX IF NOT EXISTS idx_files_folder_id ON files(folder_id);
CREATE INDEX IF NOT EXISTS idx_folders_parent_id ON folders(parent_folder_id);
CREATE INDEX IF NOT EXISTS idx_folders_context ON folders(context_type, context_id);
CREATE INDEX IF NOT EXISTS idx_grades_enrollment_id ON grades(enrollment_id);
CREATE INDEX IF NOT EXISTS idx_sync_status_entity ON sync_status(entity_type, entity_id);

-- Update triggers for updated_at timestamps
CREATE TRIGGER update_users_timestamp AFTER UPDATE ON users
BEGIN
    UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER update_courses_timestamp AFTER UPDATE ON courses
BEGIN
    UPDATE courses SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER update_enrollments_timestamp AFTER UPDATE ON enrollments
BEGIN
    UPDATE enrollments SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER update_assignments_timestamp AFTER UPDATE ON assignments
BEGIN
    UPDATE assignments SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER update_submissions_timestamp AFTER UPDATE ON submissions
BEGIN
    UPDATE submissions SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER update_discussion_topics_timestamp AFTER UPDATE ON discussion_topics
BEGIN
    UPDATE discussion_topics SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER update_discussion_entries_timestamp AFTER UPDATE ON discussion_entries
BEGIN
    UPDATE discussion_entries SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER update_modules_timestamp AFTER UPDATE ON modules
BEGIN
    UPDATE modules SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER update_module_items_timestamp AFTER UPDATE ON module_items
BEGIN
    UPDATE module_items SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER update_pages_timestamp AFTER UPDATE ON pages
BEGIN
    UPDATE pages SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER update_files_timestamp AFTER UPDATE ON files
BEGIN
    UPDATE files SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER update_folders_timestamp AFTER UPDATE ON folders
BEGIN
    UPDATE folders SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER update_grades_timestamp AFTER UPDATE ON grades
BEGIN
    UPDATE grades SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER update_sync_status_timestamp AFTER UPDATE ON sync_status
BEGIN
    UPDATE sync_status SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;