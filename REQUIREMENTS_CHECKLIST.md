# Requirements Checklist

Built from the master specification "Algebra_CC_Claude_Master_Prompt.pdf" (sections in brackets) and the project instructions.

Statuses: **NOT STARTED**, **IN PROGRESS**, **IMPLEMENTED** (works, not yet verified by tests), **TESTED** (verified by automated or recorded manual tests), **BLOCKED**.
A UI placeholder never counts as IMPLEMENTED. TESTED is only used when the underlying behavior was actually tested.

Last updated: 2026-10-08 (v0.12.0, development session 11: Unit 9 and the Windows build).

E2E = `tests-e2e/first-lesson.spec.ts`, `tests-e2e/unit-days.spec.ts` and `tests-e2e/unit2.spec.ts` (Playwright, real UI in Chromium + real services via the harness). Service tests = `tests/main/*.test.ts`.

## A. Curriculum and standards [§4, §5, §6, §56]

| ID | Requirement | Status | Evidence / notes |
|---|---|---|---|
| A1 | Verify current official Georgia A:C&C standards from GaDOE sources | TESTED | docs/STANDARDS_SOURCES.md; text cross-checked against two GaDOE documents |
| A2 | Standards coverage matrix | TESTED | docs/STANDARDS_COVERAGE.md (generated); tests/curriculum/catalog.test.ts checks every expectation is taught and assessed |
| A3 | Complete 18-week curriculum map, 4-5 activities/week, 30-45 min | TESTED | docs/CURRICULUM_MAP.md; test: 90 days, 5 per week, unit pacing inside GaDOE block ranges |
| A4 | Every lesson records standard ID, description, objective, prerequisites, skills taught, skills assessed | TESTED | src/content/catalog.ts; catalog test validates references |
| A5 | Curriculum stored as data, not hard-coded in UI | TESTED | Catalog + lesson content modules; lesson player renders data (service + E2E tests) |
| A6 | Lesson content for all 90 days (instruction, examples, practice, quizzes) | TESTED | All 66 instructional lessons (U1L01-U1L10, U2L01-U2L04, U3L01-U3L03, U4L01-U4L10, U4L12-U4L19, U5L01-U5L06, U6L01-U6L10, U7L01-U7L09, U8L01-U8L06), each math-reviewed independently; every one runs end to end in tests/main/all-lessons.test.ts. The 24 review, assessment, checkpoint and project days run through tests/main/days.test.ts (the 3 Unit 9 capstone projects as fixed 9-part task sets from one shared seed; tests/generators/u9-unit.test.ts) |
| A7 | Unit reviews, unit assessments, cumulative reviews, checkpoint, semester review, semester assessment | TESTED | Engine for every review/assessment kind TESTED (days service tests for Units 1-8, the Units 1-4 checkpoint and the Units 1-6 cumulative review + E2E on Unit 1 Review and Assessment). Content for Units 1-9: the checkpoint, the Units 1-6 cumulative review, both semester reviews and the semester assessment (service tests + E2E), and the 3 capstone projects (service tests + E2E) |
| A8 | Real-world contexts (gaming, sports, phones, money, jobs, shopping, transport, streaming, school) [§36] | IN PROGRESS | U1-U2 generators use gym, savings, phone battery and storage, rideshare, games, sports leagues, fitness apps, part-time jobs, bake sales, theater tickets, carnival prizes and team snacks; U4 generators add kicked and launched balls, water balloons, model rockets, fenced pens and gardens, picture frames, and student-business revenue (phone cases, smoothies, tickets); U5 generators add car and phone values, town populations, bacteria and cell counts, medicine in the body, video views, cooling tea, savings accounts and compound interest; U6 generators add town growth, followers, used-car values, medicine half-lives, bacteria doubling, savings plans (linear vs percent), lake fish, rumors and candles; U7 generators add screen time, gaming hours, phone storage, 5K times, headphone prices, playlists, team scores, battery life, video game sales, ice cream sales, car values, commutes, free throws, gas mileage, followers, bacteria and a food truck; U8 generators add scaled maps (home to school, library, skate park, stadium, campsite), meeting a friend halfway, park fencing and sod costs, street routes vs straight paths, bike paths and roads, and a building lot |
| A9 | Curriculum audit (follow-up prompt 1) | NOT STARTED | |

## B. Windows application [§2, §3, §42]

| ID | Requirement | Status | Evidence / notes |
|---|---|---|---|
| B1 | Architecture evaluated and explained | IMPLEMENTED | docs/ARCHITECTURE.md §1 |
| B2 | Runs on Windows 10/11 in its own window | IMPLEMENTED | src/main/main.ts (single window, single instance, sandboxed renderer). Bundled main process smoke-tested with a stub Electron (DB created, IPC answered). Not yet run on Windows |
| B3 | Setup.exe installer (NSIS) with Start Menu shortcut, optional Desktop shortcut | IMPLEMENTED | electron-builder NSIS config in package.json (per-user, Start Menu + Desktop shortcuts, keeps data on uninstall) and .github/workflows/build-windows.yml. Built by GitHub Actions on windows-latest (first build passed, run 37788713712). Installing on a real PC is K7 |
| B4 | Bundles all runtime dependencies; no Node/Python on student PC | IMPLEMENTED | Electron bundles the runtime; SQLite is WebAssembly (no native modules). Verify at clean install |
| B5 | Works offline | IMPLEMENTED | No network code; KaTeX fonts bundled; CSP blocks remote content; main process cancels every non-local request |
| B6 | Progress stored locally, survives app and Windows restarts | TESTED | Atomic SQLite persistence (database tests); resume after restart (lesson-flow test; E2E reload) |
| B7 | Progress preserved on update; user data separate from app files | IMPLEMENTED | Data in %APPDATA%\...\data, separate from program files; NSIS keeps app data. Update over install not yet tested on Windows |
| B8 | Schema versioning and migrations with safety backup | TESTED | Migration framework + safety backup before migrating; newer-schema refusal (database tests); backups upgraded in memory |
| B9 | Development project documentation (install deps, dev mode, tests, build, Setup.exe, install, data location, backup/restore, update) | IMPLEMENTED | README.md (install deps, dev, tests, build, Setup.exe, data location, backup/restore, update) |

## C. Lesson experience [§1, §7-§12, §35, §46]

| ID | Requirement | Status | Evidence / notes |
|---|---|---|---|
| C1 | Lesson sections: Today's Goal, What You Need to Know, Instruction, Worked Examples, Guided Practice, Independent Practice, Short Quiz, Feedback/Corrections, Mastery Evaluation, Lesson Summary | TESTED | All 10 sections, gated in order (lesson-flow test + E2E) |
| C2 | Teach before testing | TESTED | Cannot skip to practice or quiz (lesson-flow test + E2E) |
| C3 | Multiple worked examples per skill with WHY for each step; intro/intermediate/challenging/real-world/common-mistake | TESTED | U1L01: 6 worked examples (intro, 2 intermediate, common mistake, real world, challenging), each step with WHY; shown step by step (content test + E2E) |
| C4 | Guided practice step-by-step with intermediate-step evaluation; no immediate answer reveal | TESTED | Guided problems are answered step by step with feedback per step; answers hidden until finished (lesson-flow + E2E) |
| C5 | Progressive hints levels 1-4; full solution only after help attempted or in review; track hints, levels, attempts | TESTED | 4 progressive hints per problem/step with leak detection; solution only after 4 hints, 3 attempts, or 2+2; hints/levels/attempts recorded (generator + lesson-flow + E2E) |
| C6 | Teach Me Again: different approach, prominent, tracked, never penalized | TESTED | Teach Me Again: 5 approaches for U1L01, cycles unused ones, logged, no penalty; offered in every section except during the quiz (lesson-flow + E2E) |
| C7 | Independent practice mix (straightforward, moderate, challenging, application, word, cumulative review); track accuracy, attempts, hints, time, skill, difficulty | TESTED | Independent practice mix from lesson plan + spaced-review items; extras until the required correct count; accuracy/attempts/hints/time/skill/difficulty stored per attempt |
| C8 | Practice mistakes do not disproportionately harm grade | TESTED | Practice counts only toward a 5% completion category (grading tests) |
| C9 | First lesson demonstrates full chain Teach→Example→Guided→Hint→Independent→Quiz→Feedback→Mastery→XP→Dashboard | TESTED | E2E drives the whole chain in the real UI: Teach, Example, Guided, Hint, Independent, Quiz, Feedback, Mastery, XP, Dashboard, Parent report |
| C10 | Supportive language; never makes student feel unintelligent | IMPLEMENTED | Supportive feedback copy throughout; reviewed by hand |

## D. Math accuracy and validation [§13, §14, §44]

| ID | Requirement | Status | Evidence / notes |
|---|---|---|---|
| D1 | Exact arithmetic (no floating-point grading) | TESTED | src/core/math/rational.ts; tests/math/engine.test.ts |
| D2 | Answer types: integers, decimals, fractions, expressions, equations, ordered pairs, multiple choice, solution sets, intervals, inequalities | TESTED | 33 checker tests (tests/math/engine.test.ts), including "any point in a region" answers for systems of inequalities, simplest-radical-form answers with variables and cube roots, factored over the integers, exact radical solution lists, and decimal-approximation feedback |
| D3 | Recognize equivalent answers (forms, order, notation) | TESTED | Polynomial canonical form, exact radicals, half-plane inequalities, interval/set-builder/inequality notation |
| D4 | Requested-form checks (factored, expanded, vertex, simplified radical, slope-intercept, point-slope, standard) | TESTED | Wrong-form answers get "equivalent but rewrite" feedback, not marked wrong |
| D5 | Graph interpretation responses | IN PROGRESS | SVG graph component and new number line; U1, U2 and U4 graph generators (function notation, slope, key features, domain/range, sequences, shaded half-planes, systems of inequalities, parabola features, intervals of increase/decrease, transformations from two graphs, writing equations from graphs, comparing a graph with an equation, writing y = a(b)^x from a graph, exponential key features with a dashed asymptote, finding k from two exponential graphs, average rate of change from labeled points) stress-tested. Unit 7 adds box plots (with outliers as dots), dot plots and histograms (new DataPlot component, every lesson plot checked for well-formed data) and scatter plots with lines of best fit; reading questions use box plots whose values sit on labeled ticks. Unit 8 adds labeled points, segments and polygons on the coordinate grid (distance, midpoint, parallel/perpendicular, area, classification and scaled maps). Other graph types come with their units |
| D6 | Misconception detection with targeted, non-revealing feedback | TESTED | Misconception answers produce targeted feedback and are tagged; repeated patterns reported to the parent |
| D7 | Every generated problem validated before use (answer, solution, hints, ambiguity); bad problems rejected | TESTED | produceProblem validates key, misconceptions, 4 hints (no leaks), solution and steps; retries on failure (generator tests) |
| D8 | Generators tested across many variations | TESTED | Each generator stress-tested over 300 seeds x 3 difficulties with independent verify() |

## E. Mastery, adaptivity, review [§15-§18]

| ID | Requirement | Status | Evidence / notes |
|---|---|---|---|
| E1 | Skill-level mastery stages NOT STARTED/LEARNING/DEVELOPING/PROFICIENT/MASTERED | TESTED | tests/engine/engines.test.ts |
| E2 | Mastery from recency, difficulty, independence, hints, attempts, quizzes, assessments, retention; early mistakes not permanent | TESTED | Recency, difficulty, independence, hints, retries, formal evidence; Mastered requires retention over 20+ hours (engine tests) |
| E3 | Show What You Know / Test Out; prerequisites and essential skills protected | TESTED | Show What You Know: quiz + 2 harder items, 85% bar; failure returns to the lesson with no penalty (lesson-flow test). Essential-skill protection is per lesson today; cross-lesson skipping is not offered |
| E4 | Adaptive remediation: identify skill, check prerequisites, adjust difficulty, new explanation, targeted examples, reassess, reintroduce later | TESTED | After a failed quiz: missed skills identified, easier targeted practice (difficulty from stage), Teach Me Again, retake with new questions (lesson-flow + E2E). Prerequisite-skill check across lessons IN PROGRESS |
| E5 | Spaced review of learned material; Mastered not lost after one mistake | IMPLEMENTED | Review intervals 2/4/7/14/30 days; due skills mixed into later practice; Mastered survives one miss (engine test). Long-horizon review behavior not yet tested end to end |

## F. Assessments and grading [§19, §20, §34]

| ID | Requirement | Status | Evidence / notes |
|---|---|---|---|
| F1 | Lesson quizzes, unit reviews, unit assessments, cumulative review, semester assessment | TESTED | Lesson quizzes TESTED. Unit reviews and unit assessments TESTED for Units 1-8 (service tests; E2E for Unit 1). Units 1-4 checkpoint and the Units 1-6 cumulative review TESTED (service tests). Semester reviews and the semester assessment TESTED (service tests: coverage, no hints, corrections, retake, own grade category; E2E for the semester assessment) |
| F2 | Store date/time, score, duration, attempts, skills/standards, missed questions, hints, mastery changes | TESTED | assessments table: times, duration, score, attempts, skills, standards, items with responses and misconceptions, mastery before/after; parent can review every answer (api test + E2E) |
| F3 | Results show What You Did Well, Needs More Practice, Recommended Next Step | TESTED | Results show did well / keep practicing / next step / skill changes / item review (E2E) |
| F4 | Transparent, documented grading system; categories separated; reproducible from stored data | TESTED | docs/GRADING.md; computeGrade tests; grade recomputed from stored assessments |
| F5 | Diagnostic assessment with sufficient evidence; parent may skip | NOT STARTED | Diagnostic/placement assessment |

## G. Motivation [§21, §32, §47]

| ID | Requirement | Status | Evidence / notes |
|---|---|---|---|
| G1 | XP, levels | TESTED | XP rules and levels (engine tests); awarded once where required (lesson-flow test) |
| G2 | Streaks based on meaningful activity, reliable dates | TESTED | Local-date streaks with qualifying-day rule (engine tests) |
| G3 | Achievements/badges, mastery milestones, weekly goals, progress bars | TESTED | 17 achievements from recorded evidence, progress bars, weekly lesson goal (lesson-flow + api tests) |
| G4 | Anti-guessing: rapid guessing earns no meaningful XP; MC not primary | TESTED | Rapid retries / rapid wrong streaks earn 0 XP; choice items x0.5; most items are typed answers |

## H. Dashboards, profiles, parent tools [§22-§26, §45]

| ID | Requirement | Status | Evidence / notes |
|---|---|---|---|
| H1 | Student Dashboard with CONTINUE LEARNING primary; resume exactly | TESTED | CONTINUE LEARNING resumes the exact section and problem (E2E reload) |
| H2 | Multiple student profiles, fully separated data | IMPLEMENTED | Profiles separated by profile_id in every table; create/rename/archive in Parent Mode. Multi-profile isolation test NOT yet written |
| H3 | Parent PIN (local, hashed) | TESTED | PBKDF2-SHA256 150k, lockout, recovery-code reset (api test + E2E) |
| H4 | Parent Dashboard: all listed metrics, 30-second overview with drill-down | TESTED | Overview headline, grade detail, trend, assessments with drill-down, mastery by unit/standard, time, support, repeated errors, activity (api test + E2E) |
| H5 | Weekly parent report (auto-generated, week-over-week comparison) | TESTED | Weekly report with week-over-week comparison, printable (api test + E2E) |
| H6 | Parent controls: profiles, PIN reset, goals, curriculum/standards view, assessment review, backup/restore | IMPLEMENTED | Profiles, PIN change/reset, goals, assessment review, backup/restore in Parent Mode. Curriculum/standards browser screen NOT STARTED (API exists) |
| H7 | Student Mode cannot edit grades, completion, mastery, results, XP, progress | TESTED | Only main-process services write records; every IPC argument validated (ipc test) |
| H8 | Student and Parent dashboards agree (single source of truth) | TESTED | Student and parent dashboards read the same functions; agreement asserted in api test |

## I. Data, reliability, privacy [§27-§31, §40, §41]

| ID | Requirement | Status | Evidence / notes |
|---|---|---|---|
| I1 | SQLite local persistence of all listed data | TESTED | 17-table schema (database tests) |
| I2 | Autosave throughout; minimal loss on crash; "Continue where you left off" | TESTED | Every action autosaved (transaction + 300 ms atomic flush); resume tested |
| I3 | Backup/export and restore/import with validation, corruption protection, safety backup | TESTED | Export, inspect, restore with checksum/integrity/version checks and safety backup; damaged files rejected (api test) |
| I4 | Privacy: no tracking/ads/accounts; offline | IMPLEMENTED | No accounts, ads, telemetry or network access |
| I5 | Meaningful time tracking with inactivity detection | IMPLEMENTED | 15 s heartbeat only while visible and active within 90 s; clamped server-side (api test covers clamping) |
| I6 | Local diagnostic logging without sensitive data | IMPLEMENTED | FileLogger with rotation; no names/answers/PINs logged (verified in smoke test log) |
| I7 | Graceful error recovery (DB errors, malformed backups, bad lesson data, invalid problems) | IN PROGRESS | DB recovery from tmp/prev/auto backup (database tests); unreadable lesson state restarts the lesson; friendly errors for invalid input and requests. Renderer crash reload implemented, untested |

## J. First launch and settings [§33, §37-§39]

| ID | Requirement | Status | Evidence / notes |
|---|---|---|---|
| J1 | First launch: welcome, create Parent PIN, first profile, explain mastery/XP, offer diagnostic, recommend start | IN PROGRESS | Welcome, Parent PIN, recovery code, first profile, mastery/XP explanation (E2E). Diagnostic offer NOT STARTED |
| J2 | Modern, clean, teen-friendly UI | IMPLEMENTED | Reviewed from screenshots of every main screen |
| J3 | Accessibility: keyboard nav, contrast, readable fonts, accessible forms, focus indicators, non-color-only correctness, text size, reduced motion, sound optional | IN PROGRESS | Keyboard-operable controls, focus rings, aria labels/live regions, symbols plus color for correctness, text size, reduced motion, optional sound. No formal accessibility audit yet |
| J4 | Settings per profile: sound, reduced animation, text size, daily goal, theme | IMPLEMENTED | Theme, text size, reduced motion, sound per profile; daily goal set by parent |

## K. Testing and release [§43, §48, §49, §50, §55]

| ID | Requirement | Status | Evidence / notes |
|---|---|---|---|
| K1 | Automated unit tests (math, engines, services) | TESTED | 87 automated tests passing |
| K2 | Mathematics verification tests across many generated variations | TESTED | Generator stress tests + independent verify for every U1 generator |
| K3 | End-to-end tests of the full student and parent flows | IN PROGRESS | E2E passing: first lesson + parent reports; Unit 1 Review and Assessment; Unit 2 lessons (number line, systems); Unit 3 Lesson 3 start to finish with typed radical answers; Unit 4 Lesson 6 start to finish with factored forms and solution lists; Unit 4 Lesson 13 start to finish with points, axis equations and interval answers; Unit 5 Lessons 1 and 6 start to finish with simplified exponent answers, y = a(b)^x equations and money; Unit 6 Lessons 3 and 7 start to finish with interval answers, sequence terms and formulas in n; Unit 7 Lessons 2 and 8 start to finish with box plots, five-number summaries, scatter plots and rounded predictions; Unit 8 Lessons 1 and 5 start to finish with simplest radical distances and classifying graphed polygons; a Unit 9 capstone project from overview to reflection; the semester assessment with corrections. Backup/restore and multi-profile E2E NOT STARTED |
| K4 | Test list in §43 (fresh install … update/migration) | IN PROGRESS | Covered: fresh start, setup, lesson, quiz fail/retake, resume, reports, backup/restore (service level). Not covered: Windows install, update, migration on real data |
| K5 | Production build | TESTED | npm run build succeeds; bundled main process smoke-tested |
| K6 | Windows Setup.exe | TESTED | GitHub Actions (windows-latest) runs npm test, the build and the full E2E suite on Windows, then electron-builder produces Setup.exe as the artifact "AlgebraCC-Academy-Setup" (first build: run 37788713712, passed). Not code-signed |
| K7 | Clean-install test on Windows | NOT STARTED | |
| K8 | Installation, backup, troubleshooting, rebuild documentation | IN PROGRESS | README covers install, backup, restore, update, rebuild. Troubleshooting guide NOT STARTED |
| K9 | Optional AI architecture hook without exposing keys [§53, §54] | IMPLEMENTED | Design in docs/ARCHITECTURE.md §7; no AI dependency in core |
