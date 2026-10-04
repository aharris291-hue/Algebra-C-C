# Requirements Checklist

Built from the master specification "Algebra_CC_Claude_Master_Prompt.pdf" (sections in brackets) and the project instructions.

Statuses: **NOT STARTED**, **IN PROGRESS**, **IMPLEMENTED** (works, not yet verified by tests), **TESTED** (verified by automated or recorded manual tests), **BLOCKED**.
A UI placeholder never counts as IMPLEMENTED. TESTED is only used when the underlying behavior was actually tested.

Last updated: 2026-10-04 (v0.1.0, Phase 1-2).

## A. Curriculum and standards [§4, §5, §6, §56]

| ID | Requirement | Status | Evidence / notes |
|---|---|---|---|
| A1 | Verify current official Georgia A:C&C standards from GaDOE sources | TESTED | docs/STANDARDS_SOURCES.md; text cross-checked against two GaDOE documents |
| A2 | Standards coverage matrix | TESTED | docs/STANDARDS_COVERAGE.md (generated); tests/curriculum/catalog.test.ts checks every expectation is taught and assessed |
| A3 | Complete 18-week curriculum map, 4-5 activities/week, 30-45 min | TESTED | docs/CURRICULUM_MAP.md; test: 90 days, 5 per week, unit pacing inside GaDOE block ranges |
| A4 | Every lesson records standard ID, description, objective, prerequisites, skills taught, skills assessed | TESTED | src/content/catalog.ts; catalog test validates references |
| A5 | Curriculum stored as data, not hard-coded in UI | IMPLEMENTED | catalog + lesson content modules; lesson engine renders data |
| A6 | Lesson content for all 90 days (instruction, examples, practice, quizzes) | IN PROGRESS | U1L01 in progress; remaining lessons NOT STARTED |
| A7 | Unit reviews, unit assessments, cumulative reviews, checkpoint, semester review, semester assessment | NOT STARTED | Days scheduled in catalog; blueprints not yet written |
| A8 | Real-world contexts (gaming, sports, phones, money, jobs, shopping, transport, streaming, school) [§36] | IN PROGRESS | Used in generators as they are written |
| A9 | Curriculum audit (follow-up prompt 1) | NOT STARTED | |

## B. Windows application [§2, §3, §42]

| ID | Requirement | Status | Evidence / notes |
|---|---|---|---|
| B1 | Architecture evaluated and explained | IMPLEMENTED | docs/ARCHITECTURE.md §1 |
| B2 | Runs on Windows 10/11 in its own window | IN PROGRESS | Electron main process being written |
| B3 | Setup.exe installer (NSIS) with Start Menu shortcut, optional Desktop shortcut | NOT STARTED | electron-builder config pending; build needs Windows or Windows CI (cloud sandbox cannot download Electron binaries) |
| B4 | Bundles all runtime dependencies; no Node/Python on student PC | NOT STARTED | Electron bundles runtime; verify at clean-install test |
| B5 | Works offline | IN PROGRESS | No network code; KaTeX and fonts bundled locally |
| B6 | Progress stored locally, survives app and Windows restarts | NOT STARTED | |
| B7 | Progress preserved on update; user data separate from app files | NOT STARTED | userData location chosen (ARCHITECTURE §5) |
| B8 | Schema versioning and migrations with safety backup | NOT STARTED | |
| B9 | Development project documentation (install deps, dev mode, tests, build, Setup.exe, install, data location, backup/restore, update) | NOT STARTED | |

## C. Lesson experience [§1, §7-§12, §35, §46]

| ID | Requirement | Status | Evidence / notes |
|---|---|---|---|
| C1 | Lesson sections: Today's Goal, What You Need to Know, Instruction, Worked Examples, Guided Practice, Independent Practice, Short Quiz, Feedback/Corrections, Mastery Evaluation, Lesson Summary | NOT STARTED | Data model defined (src/core/curriculum/types.ts) |
| C2 | Teach before testing | NOT STARTED | Lesson player enforces section order |
| C3 | Multiple worked examples per skill with WHY for each step; intro/intermediate/challenging/real-world/common-mistake | NOT STARTED | WorkedExample type has kind + why per step |
| C4 | Guided practice step-by-step with intermediate-step evaluation; no immediate answer reveal | NOT STARTED | ProblemStep type defined |
| C5 | Progressive hints levels 1-4; full solution only after help attempted or in review; track hints, levels, attempts | NOT STARTED | Every Problem carries 4 hints |
| C6 | Teach Me Again: different approach, prominent, tracked, never penalized | NOT STARTED | TeachAgainVariant type defined |
| C7 | Independent practice mix (straightforward, moderate, challenging, application, word, cumulative review); track accuracy, attempts, hints, time, skill, difficulty | NOT STARTED | |
| C8 | Practice mistakes do not disproportionately harm grade | NOT STARTED | Grading policy: practice counts for completion only |
| C9 | First lesson demonstrates full chain Teach→Example→Guided→Hint→Independent→Quiz→Feedback→Mastery→XP→Dashboard | NOT STARTED | |
| C10 | Supportive language; never makes student feel unintelligent | IN PROGRESS | Answer-checker messages follow this |

## D. Math accuracy and validation [§13, §14, §44]

| ID | Requirement | Status | Evidence / notes |
|---|---|---|---|
| D1 | Exact arithmetic (no floating-point grading) | TESTED | src/core/math/rational.ts; tests/math/engine.test.ts |
| D2 | Answer types: integers, decimals, fractions, expressions, equations, ordered pairs, multiple choice, solution sets, intervals, inequalities | TESTED | 31 checker tests (tests/math/engine.test.ts) |
| D3 | Recognize equivalent answers (forms, order, notation) | TESTED | Polynomial canonical form, exact radicals, half-plane inequalities, interval/set-builder/inequality notation |
| D4 | Requested-form checks (factored, expanded, vertex, simplified radical, slope-intercept, point-slope, standard) | TESTED | Wrong-form answers get "equivalent but rewrite" feedback, not marked wrong |
| D5 | Graph interpretation responses | NOT STARTED | Graph component + reading questions pending |
| D6 | Misconception detection with targeted, non-revealing feedback | IN PROGRESS | Checker supports tagged misconception answers (tested); generators supply them |
| D7 | Every generated problem validated before use (answer, solution, hints, ambiguity); bad problems rejected | NOT STARTED | GeneratorDef.verify defined |
| D8 | Generators tested across many variations | NOT STARTED | |

## E. Mastery, adaptivity, review [§15-§18]

| ID | Requirement | Status | Evidence / notes |
|---|---|---|---|
| E1 | Skill-level mastery stages NOT STARTED/LEARNING/DEVELOPING/PROFICIENT/MASTERED | NOT STARTED | |
| E2 | Mastery from recency, difficulty, independence, hints, attempts, quizzes, assessments, retention; early mistakes not permanent | NOT STARTED | |
| E3 | Show What You Know / Test Out; prerequisites and essential skills protected | NOT STARTED | Skills flagged `essential` in catalog |
| E4 | Adaptive remediation: identify skill, check prerequisites, adjust difficulty, new explanation, targeted examples, reassess, reintroduce later | NOT STARTED | |
| E5 | Spaced review of learned material; Mastered not lost after one mistake | NOT STARTED | |

## F. Assessments and grading [§19, §20, §34]

| ID | Requirement | Status | Evidence / notes |
|---|---|---|---|
| F1 | Lesson quizzes, unit reviews, unit assessments, cumulative review, semester assessment | NOT STARTED | |
| F2 | Store date/time, score, duration, attempts, skills/standards, missed questions, hints, mastery changes | NOT STARTED | Schema designed |
| F3 | Results show What You Did Well, Needs More Practice, Recommended Next Step | NOT STARTED | |
| F4 | Transparent, documented grading system; categories separated; reproducible from stored data | NOT STARTED | |
| F5 | Diagnostic assessment with sufficient evidence; parent may skip | NOT STARTED | |

## G. Motivation [§21, §32, §47]

| ID | Requirement | Status | Evidence / notes |
|---|---|---|---|
| G1 | XP, levels | NOT STARTED | |
| G2 | Streaks based on meaningful activity, reliable dates | NOT STARTED | |
| G3 | Achievements/badges, mastery milestones, weekly goals, progress bars | NOT STARTED | |
| G4 | Anti-guessing: rapid guessing earns no meaningful XP; MC not primary | NOT STARTED | |

## H. Dashboards, profiles, parent tools [§22-§26, §45]

| ID | Requirement | Status | Evidence / notes |
|---|---|---|---|
| H1 | Student Dashboard with CONTINUE LEARNING primary; resume exactly | NOT STARTED | |
| H2 | Multiple student profiles, fully separated data | NOT STARTED | |
| H3 | Parent PIN (local, hashed) | NOT STARTED | |
| H4 | Parent Dashboard: all listed metrics, 30-second overview with drill-down | NOT STARTED | |
| H5 | Weekly parent report (auto-generated, week-over-week comparison) | NOT STARTED | |
| H6 | Parent controls: profiles, PIN reset, goals, curriculum/standards view, assessment review, backup/restore | NOT STARTED | |
| H7 | Student Mode cannot edit grades, completion, mastery, results, XP, progress | IN PROGRESS | Enforced by architecture: only main-process services write records |
| H8 | Student and Parent dashboards agree (single source of truth) | NOT STARTED | Both will read the same engine functions |

## I. Data, reliability, privacy [§27-§31, §40, §41]

| ID | Requirement | Status | Evidence / notes |
|---|---|---|---|
| I1 | SQLite local persistence of all listed data | NOT STARTED | |
| I2 | Autosave throughout; minimal loss on crash; "Continue where you left off" | NOT STARTED | |
| I3 | Backup/export and restore/import with validation, corruption protection, safety backup | NOT STARTED | |
| I4 | Privacy: no tracking/ads/accounts; offline | IN PROGRESS | No network dependencies in code |
| I5 | Meaningful time tracking with inactivity detection | NOT STARTED | |
| I6 | Local diagnostic logging without sensitive data | NOT STARTED | |
| I7 | Graceful error recovery (DB errors, malformed backups, bad lesson data, invalid problems) | NOT STARTED | |

## J. First launch and settings [§33, §37-§39]

| ID | Requirement | Status | Evidence / notes |
|---|---|---|---|
| J1 | First launch: welcome, create Parent PIN, first profile, explain mastery/XP, offer diagnostic, recommend start | NOT STARTED | |
| J2 | Modern, clean, teen-friendly UI | NOT STARTED | |
| J3 | Accessibility: keyboard nav, contrast, readable fonts, accessible forms, focus indicators, non-color-only correctness, text size, reduced motion, sound optional | NOT STARTED | |
| J4 | Settings per profile: sound, reduced animation, text size, daily goal, theme | NOT STARTED | |

## K. Testing and release [§43, §48, §49, §50, §55]

| ID | Requirement | Status | Evidence / notes |
|---|---|---|---|
| K1 | Automated unit tests (math, engines, services) | IN PROGRESS | 37 tests passing (math + curriculum) |
| K2 | Mathematics verification tests across many generated variations | NOT STARTED | |
| K3 | End-to-end tests of the full student and parent flows | NOT STARTED | Playwright + harness planned |
| K4 | Test list in §43 (fresh install … update/migration) | NOT STARTED | |
| K5 | Production build | NOT STARTED | |
| K6 | Windows Setup.exe | BLOCKED | Needs a Windows build machine or GitHub Actions (Electron binaries cannot be downloaded in this cloud sandbox) |
| K7 | Clean-install test on Windows | NOT STARTED | |
| K8 | Installation, backup, troubleshooting, rebuild documentation | NOT STARTED | |
| K9 | Optional AI architecture hook without exposing keys [§53, §54] | IMPLEMENTED | Design in docs/ARCHITECTURE.md §7; no AI dependency in core |
