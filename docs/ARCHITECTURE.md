# Architecture

## 1. Platform decision

**Choice: Electron + TypeScript + React, with SQLite (sql.js / WebAssembly) for storage, packaged with electron-builder into an NSIS `Setup.exe`.**

Alternatives evaluated against the spec's priorities (accuracy, learning, reliability, data integrity, offline, maintainability, UX):

| Option | Verdict |
|---|---|
| **Electron** (chosen) | Runs on Windows 10/11, own window, bundles its own runtime (no Node/Python needed on the student PC), mature NSIS installer with Start Menu/Desktop shortcuts, works fully offline, one language (TypeScript) for math engine, UI and tests. Cost: ~100 MB installer, acceptable for a desktop app. |
| Tauri (Rust + WebView2) | Smaller installer, but needs WebView2 on Windows 10 machines, adds Rust to the toolchain, and cross-building the installer is harder. Less maintainable for this project. |
| .NET WPF / WinUI | Native, but math rendering (KaTeX-quality) and rich interactive graphs are much harder; would need separate tooling for math tests. |
| Browser web app / PWA | Explicitly not acceptable per spec (must be an installed Windows program). |

**Database choice: sql.js** (SQLite compiled to WebAssembly) instead of native `better-sqlite3`. It is real SQLite (same file format, transactions, integrity checks) but has no native module to rebuild for each Electron version, which removes the most common Electron install/update failure. The database is small (a semester of attempts is a few MB), so holding it in memory and writing it to disk atomically is fast and safe.

## 2. Process layout and trust boundary

```
┌──────────────────────── Electron main process (Node) ────────────────────────┐
│ src/main/                                                                   │
│   main.ts            window, lifecycle, single-instance lock, crash handlers │
│   db/                sql.js database, schema migrations, atomic persistence  │
│   services/          ALL business rules: profiles, PIN, lessons, attempts,   │
│                      grading, mastery, XP, streaks, time, reports, backups   │
│   ipc.ts             typed IPC handlers (validates every argument)           │
│   logger.ts          local diagnostic log (no student answers or names)      │
└──────────────▲───────────────────────────────────────────────────────────────┘
               │ contextBridge (preload.ts) - a fixed, typed API; no Node in UI
┌──────────────┴─────────────── Renderer (React) ──────────────────────────────┐
│ src/renderer/   screens, lesson player, math input, KaTeX, SVG graphs        │
└──────────────────────────────────────────────────────────────────────────────┘
Shared pure code (no Electron, no DOM), fully unit-tested in Node:
  src/core/math/        exact arithmetic, parser, answer checking, formatting
  src/core/curriculum/  data types
  src/core/engine/      mastery, grading, XP/levels, streaks, scheduling, reports
  src/content/          standards, catalog (90 days), lesson content, generators
```

The renderer never computes or writes grades, mastery, XP or completion. It sends student *actions* (answer submitted, hint requested, Teach Me Again opened, section finished); the main process checks answers, records attempts, and derives everything else. That is how Student Mode is prevented from editing records (spec §26) and how both dashboards share one source of truth (spec §45).

`src/harness/` runs the same services behind a local HTTP endpoint so the real UI can be tested end-to-end in Chromium (Playwright) on any OS. It is a development tool only and is not shipped.

## 3. Curriculum data architecture (spec §6)

- `src/content/standards.ts`: every Georgia expectation (code, big idea, verbatim text).
- `src/content/catalog.ts`: units, skills (with standards, prerequisites, "essential" flag), and all 90 days with lesson metadata (ID, unit, week/day, kind, standards, objectives, prerequisites, duration, difficulty, skills taught/assessed, spaced-review relationships).
- `src/content/lessons/<unitId>/<lessonId>.ts`: lesson content (goal, need-to-know, instruction, worked examples with *why* for each step, Teach Me Again variants, guided/independent/quiz problem plans, summary, mastery criteria).
- `src/content/generators/`: seeded problem generators. Each generator returns a `Problem` (prompt, exact answer spec, 4-level hints, worked solution, misconception answers, optional guided steps) **and** a `verify()` that re-derives the answer by an independent route. Problems that fail verification are rejected and regenerated, never shown (spec §41, §44).
- Assessments are assembled from blueprints that reference generators, so retakes get fresh but equivalent problems.

Problems are reproducible: an attempt stores `generatorId + seed + difficulty`, so any stored attempt can be regenerated exactly for review and audits.

## 4. Math engine (spec §13, §14, §44)

- `Rational` (BigInt) for exact arithmetic. No floating-point comparisons in grading.
- `parser.ts` reads student input (implicit multiplication, unicode symbols, √, ∛, |x|) and gives friendly syntax messages.
- Equivalence: polynomials compared by exact canonical form; constant radicals compared in an exact `Surd` field (`6√2 == √72`); other expressions by deterministic numeric sampling.
- Forms: expanded, completely factored, vertex form, simplified radical, slope-intercept, point-slope, standard form. A correct-but-wrong-form answer is never marked wrong; the student is asked to finish rewriting.
- Answer kinds: number (exact or rounded), expression, equation, inequality (half-plane equivalence), ordered pair, solution set (with ±, double roots, "no real solutions"), interval (interval, set-builder, or inequality notation), sequence terms, multiple choice.
- Misconceptions: each problem lists answers produced by specific errors (sign, reciprocal slope, rise/run swap, distribution, etc.). Matching one gives targeted feedback without revealing the answer, and the tag is stored for the Parent Dashboard.

## 5. Local database (spec §27-29, §42)

Location: `%APPDATA%\Algebra C&C Learning Academy\data\academy.sqlite` (Electron `userData`), separate from `C:\Program Files\...`, so installs/updates/uninstalls never touch it.

Persistence: every change runs in a SQLite transaction in memory; the database is then exported and written to `academy.sqlite.tmp`, flushed (`fsync`), and atomically renamed over `academy.sqlite`. The previous file is kept as `academy.sqlite.prev`. A crash at any point leaves either the old or the new complete file. Writes are batched within ~300 ms and flushed immediately for assessments and on quit.

Daily automatic backups (last 14 days) go to `...\backups\auto\`. A safety backup is always created before a restore or a schema migration.

### Schema (version 1)

| Table | Purpose |
|---|---|
| `meta(key, value)` | `schema_version`, `app_version`, `created_at`, install id |
| `parent(id=1, pin_hash, pin_salt, pin_iterations, recovery_hash, recovery_salt, created_at, updated_at, failed_attempts, locked_until)` | Parent PIN (PBKDF2-SHA256) and one-time recovery code |
| `profiles(id, display_name, avatar, created_at, archived, settings_json, onboarding_json)` | Student profiles; per-profile settings (sound, reduced motion, text size, theme, daily goal) |
| `lesson_progress(profile_id, lesson_id, status, section, state_json, started_at, updated_at, completed_at, tested_out, quiz_best, xp_awarded)` | Lesson state and exact resume point (autosave) |
| `attempts(id, profile_id, lesson_id, activity, assessment_id, skill_id, generator_id, seed, difficulty, problem_index, step_index, response, status, correct, attempt_number, hints_used, max_hint_level, misconception, elapsed_ms, counted, created_at)` | Every answer submitted |
| `hint_events(id, profile_id, lesson_id, activity, skill_id, generator_id, seed, level, created_at)` | Every hint revealed |
| `teach_again_events(id, profile_id, lesson_id, approach, created_at)` | Teach Me Again usage (never penalized) |
| `assessments(id, profile_id, kind, ref_id, attempt_number, started_at, finished_at, duration_ms, score, max_score, status, items_json, skills_json, mastery_before_json, mastery_after_json)` | Quizzes, unit/semester assessments, diagnostic, test-out |
| `skill_state(profile_id, skill_id, stage, score, evidence_count, last_practiced_at, next_review_at, mastered_at, updated_at)` | Cached mastery; always recomputable from `attempts` |
| `xp_events(id, profile_id, amount, reason, ref, created_at)` | XP ledger; XP total = sum |
| `achievements(profile_id, achievement_id, earned_at)` | Badges |
| `study_sessions(id, profile_id, date, lesson_id, activity, active_seconds, started_at, ended_at)` | Active learning time (inactivity excluded) |
| `activity_days(profile_id, date, qualifying, details_json)` | Streak days (only meaningful learning counts) |
| `activity_log(id, profile_id, type, detail_json, created_at)` | Recent activity feed |
| `weekly_reports(profile_id, week_start, report_json, generated_at)` | Generated weekly parent reports |
| `goals(profile_id, weekly_lessons, daily_minutes, updated_at)` | Parent-adjustable goals |

Derived values (grade, XP total, level, streak, mastery stage, completion %) are computed by pure functions in `src/core/engine` from these tables, so every number on both dashboards is reproducible from stored data (spec §20, §45).

### Migrations

`src/main/db/migrations.ts` holds an ordered list of migrations. On startup: open DB → read `schema_version` → if older, write a safety backup → run each migration in a transaction → bump the version. A database from a *newer* app version is never modified; the app shows an explanation instead.

## 6. Backup and restore (spec §29)

Backup file (`.accbackup`) = JSON envelope `{ format, formatVersion, appVersion, schemaVersion, createdAt, profiles[], sha256, database (base64 SQLite) }`.

Restore validation, before anything is changed: parse JSON → check format → verify SHA-256 → open the database in memory → `PRAGMA integrity_check` → required tables present → schema version supported (older ones are migrated in memory) → show the parent what the file contains. Only then is a safety backup of current data written and the restore applied atomically.

## 7. Security and privacy (spec §26, §30)

- Parent PIN: 4-8 digits, PBKDF2-SHA256 with random salt; failed-attempt lockout; reset with the recovery code shown once at setup, or with a documented local reset procedure that does not delete student data.
- No network access is needed or used. No analytics, ads, accounts or telemetry. CSP blocks remote content; the renderer has no Node access.
- Logs (`...\logs\app.log`, rotated) record errors, not names or answers.
- Optional AI tutoring later would go through a main-process service with the key stored in Windows Credential Manager, never in the renderer (spec §54).

## 8. Packaging (spec §2, §3)

electron-builder NSIS target: per-user install, Start Menu shortcut, optional Desktop shortcut, uninstaller that keeps user data. `npm run dist:win` produces `release/Algebra-CC-Learning-Academy-Setup-<version>.exe`. The build must run on Windows (or a Windows CI runner) because it downloads Electron's Windows binaries.
