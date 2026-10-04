/**
 * Database schema and migrations. Each migration runs once, in order, inside a
 * transaction. Never edit a released migration; add a new one.
 */

export interface Migration {
  version: number;
  description: string;
  sql: string;
}

export const MIGRATIONS: Migration[] = [
  {
    version: 1,
    description: 'Initial schema',
    sql: `
      CREATE TABLE meta (key TEXT PRIMARY KEY, value TEXT NOT NULL);

      CREATE TABLE parent (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        pin_hash TEXT NOT NULL,
        pin_salt TEXT NOT NULL,
        pin_iterations INTEGER NOT NULL,
        recovery_hash TEXT NOT NULL,
        recovery_salt TEXT NOT NULL,
        failed_attempts INTEGER NOT NULL DEFAULT 0,
        locked_until INTEGER NOT NULL DEFAULT 0,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      );

      CREATE TABLE profiles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        display_name TEXT NOT NULL,
        avatar TEXT NOT NULL DEFAULT 'spark',
        created_at INTEGER NOT NULL,
        archived INTEGER NOT NULL DEFAULT 0,
        settings_json TEXT NOT NULL DEFAULT '{}',
        onboarding_json TEXT NOT NULL DEFAULT '{}',
        last_active_at INTEGER
      );

      CREATE TABLE goals (
        profile_id INTEGER PRIMARY KEY REFERENCES profiles(id),
        weekly_lessons INTEGER NOT NULL DEFAULT 5,
        daily_minutes INTEGER NOT NULL DEFAULT 30,
        updated_at INTEGER NOT NULL
      );

      CREATE TABLE lesson_progress (
        profile_id INTEGER NOT NULL REFERENCES profiles(id),
        lesson_id TEXT NOT NULL,
        status TEXT NOT NULL,               -- in_progress | completed | tested_out
        section TEXT NOT NULL,
        state_json TEXT NOT NULL,
        started_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        completed_at INTEGER,
        tested_out INTEGER NOT NULL DEFAULT 0,
        quiz_best REAL,
        practice_complete INTEGER NOT NULL DEFAULT 0,
        PRIMARY KEY (profile_id, lesson_id)
      );

      CREATE TABLE attempts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        profile_id INTEGER NOT NULL REFERENCES profiles(id),
        lesson_id TEXT,
        activity TEXT NOT NULL,
        assessment_id INTEGER,
        skill_id TEXT NOT NULL,
        generator_id TEXT NOT NULL,
        seed INTEGER NOT NULL,
        difficulty INTEGER NOT NULL,
        problem_key TEXT NOT NULL,
        step_index INTEGER,
        response TEXT NOT NULL,
        status TEXT NOT NULL,               -- correct | incorrect | wrong-form | invalid
        correct INTEGER NOT NULL,
        attempt_number INTEGER NOT NULL,
        hints_used INTEGER NOT NULL,
        max_hint_level INTEGER NOT NULL,
        misconception TEXT,
        elapsed_ms INTEGER NOT NULL,
        counted INTEGER NOT NULL,           -- 1 if used as mastery evidence
        xp INTEGER NOT NULL DEFAULT 0,
        guessing INTEGER NOT NULL DEFAULT 0,
        local_date TEXT NOT NULL,
        created_at INTEGER NOT NULL
      );
      CREATE INDEX idx_attempts_profile_skill ON attempts(profile_id, skill_id, created_at);
      CREATE INDEX idx_attempts_profile_date ON attempts(profile_id, local_date);

      CREATE TABLE hint_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        profile_id INTEGER NOT NULL REFERENCES profiles(id),
        lesson_id TEXT,
        activity TEXT NOT NULL,
        skill_id TEXT NOT NULL,
        problem_key TEXT NOT NULL,
        step_index INTEGER,
        level INTEGER NOT NULL,
        local_date TEXT NOT NULL,
        created_at INTEGER NOT NULL
      );
      CREATE INDEX idx_hints_profile ON hint_events(profile_id, created_at);

      CREATE TABLE teach_again_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        profile_id INTEGER NOT NULL REFERENCES profiles(id),
        lesson_id TEXT NOT NULL,
        approach TEXT NOT NULL,
        local_date TEXT NOT NULL,
        created_at INTEGER NOT NULL
      );

      CREATE TABLE assessments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        profile_id INTEGER NOT NULL REFERENCES profiles(id),
        kind TEXT NOT NULL,                 -- quiz | unit-assessment | semester-assessment | diagnostic | test-out | checkpoint | unit-review | cumulative-review
        ref_id TEXT NOT NULL,               -- lesson id or unit id
        attempt_number INTEGER NOT NULL,
        status TEXT NOT NULL,               -- in_progress | completed | abandoned
        started_at INTEGER NOT NULL,
        finished_at INTEGER,
        duration_ms INTEGER,
        active_ms INTEGER NOT NULL DEFAULT 0,
        score REAL,
        max_score REAL,
        items_json TEXT NOT NULL,
        skills_json TEXT NOT NULL DEFAULT '[]',
        standards_json TEXT NOT NULL DEFAULT '[]',
        mastery_before_json TEXT,
        mastery_after_json TEXT,
        local_date TEXT NOT NULL
      );
      CREATE INDEX idx_assess_profile ON assessments(profile_id, kind, ref_id);

      CREATE TABLE skill_state (
        profile_id INTEGER NOT NULL REFERENCES profiles(id),
        skill_id TEXT NOT NULL,
        stage TEXT NOT NULL,
        score REAL NOT NULL,
        evidence_count INTEGER NOT NULL,
        last_practiced_at INTEGER,
        next_review_at INTEGER,
        mastered_at INTEGER,
        updated_at INTEGER NOT NULL,
        PRIMARY KEY (profile_id, skill_id)
      );

      CREATE TABLE skill_overrides (
        profile_id INTEGER NOT NULL REFERENCES profiles(id),
        skill_id TEXT NOT NULL,
        source TEXT NOT NULL,               -- diagnostic | test-out
        stage TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        PRIMARY KEY (profile_id, skill_id, source)
      );

      CREATE TABLE xp_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        profile_id INTEGER NOT NULL REFERENCES profiles(id),
        amount INTEGER NOT NULL,
        reason TEXT NOT NULL,
        ref TEXT,
        local_date TEXT NOT NULL,
        created_at INTEGER NOT NULL
      );
      CREATE INDEX idx_xp_profile ON xp_events(profile_id, created_at);

      CREATE TABLE achievements (
        profile_id INTEGER NOT NULL REFERENCES profiles(id),
        achievement_id TEXT NOT NULL,
        earned_at INTEGER NOT NULL,
        PRIMARY KEY (profile_id, achievement_id)
      );

      CREATE TABLE study_time (
        profile_id INTEGER NOT NULL REFERENCES profiles(id),
        local_date TEXT NOT NULL,
        lesson_id TEXT NOT NULL DEFAULT '',
        activity TEXT NOT NULL,
        active_seconds INTEGER NOT NULL,
        PRIMARY KEY (profile_id, local_date, lesson_id, activity)
      );

      CREATE TABLE activity_days (
        profile_id INTEGER NOT NULL REFERENCES profiles(id),
        local_date TEXT NOT NULL,
        problems_answered INTEGER NOT NULL DEFAULT 0,
        sections_completed INTEGER NOT NULL DEFAULT 0,
        active_seconds INTEGER NOT NULL DEFAULT 0,
        qualifying INTEGER NOT NULL DEFAULT 0,
        PRIMARY KEY (profile_id, local_date)
      );

      CREATE TABLE activity_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        profile_id INTEGER NOT NULL REFERENCES profiles(id),
        type TEXT NOT NULL,
        detail_json TEXT NOT NULL,
        local_date TEXT NOT NULL,
        created_at INTEGER NOT NULL
      );
      CREATE INDEX idx_log_profile ON activity_log(profile_id, created_at);

      CREATE TABLE weekly_reports (
        profile_id INTEGER NOT NULL REFERENCES profiles(id),
        week_start TEXT NOT NULL,
        report_json TEXT NOT NULL,
        generated_at INTEGER NOT NULL,
        PRIMARY KEY (profile_id, week_start)
      );
    `,
  },
];

export const CURRENT_SCHEMA_VERSION = MIGRATIONS[MIGRATIONS.length - 1].version;

export const REQUIRED_TABLES = [
  'meta',
  'parent',
  'profiles',
  'goals',
  'lesson_progress',
  'attempts',
  'hint_events',
  'teach_again_events',
  'assessments',
  'skill_state',
  'skill_overrides',
  'xp_events',
  'achievements',
  'study_time',
  'activity_days',
  'activity_log',
  'weekly_reports',
];
