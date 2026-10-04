# Project Status

**Application:** Algebra C&C Learning Academy (Windows desktop, Electron + React + SQLite/WASM)
**Current version:** 0.2.0 (pre-release: the full app works end to end for Lesson 1; Setup.exe not built yet)
**Current phase:** Platform complete (Phases 1-9 of the build plan). Next phase: curriculum content for the remaining 89 course days.
**Last updated:** 2026-10-04 (end of development session 1)

## Completed
- Georgia A:C&C standards verified against GaDOE sources; coverage matrix; 18-week / 90-day curriculum map (66 lessons, 8 unit reviews, 8 unit assessments, checkpoint, cumulative review, 3 capstones, semester review and assessment; 83 course skills)
- Exact math engine (rationals, parser, polynomials, exact radicals, every answer type, requested-form checks, misconception detection)
- Problem generation framework with automatic validation of every problem (answer, hints, leaks, solution, steps)
- Unit 1 Lesson 1 "Functions and Function Notation": full content and 5 verified generators
- Engines: mastery (recency-weighted, retention required for Mastered, spaced review), grading, XP with anti-guessing, streaks
- Database: 17-table schema, crash-safe atomic saves, recovery from previous save/auto backups, migrations with safety backup, daily auto backups
- Services: Parent PIN (hashed, lockout, recovery code), profiles, settings, goals, practice engine, lesson player (10 gated sections, hints, step-by-step guided practice, Teach Me Again, quiz with deferred feedback, corrections, adaptive remediation, retakes, Show What You Know), achievements, student and parent dashboards, grade detail and trend, weekly report, assessment review, backup/restore, live answer preview
- Electron shell: single instance, sandboxed renderer, CSP, network blocked, validated IPC, crash logging, file dialogs for backups, printing
- React UI: first launch, profile picker, student dashboard (CONTINUE LEARNING), course map, skills, settings, lesson player, results, Parent Mode (overview, grades, mastery, assessments, time and support, weekly report, students and goals, backup and security)
- Packaging: electron-builder NSIS config, app icon, GitHub Actions Windows workflow; README.md and docs/GRADING.md

## In development
- Curriculum content: 1 of 66 lessons done

## Remaining (largest first; full list in REQUIREMENTS_CHECKLIST.md)
1. Lesson content and verified generators for U1L02 through Unit 9 (65 lessons)
2. Unit reviews, unit assessments, checkpoint, cumulative review, capstones, semester review and semester assessment (assembled from the skills' generators)
3. Diagnostic / placement assessment and the first-launch offer
4. Build Setup.exe on Windows (CI or PC) and run the clean-install, update and migration tests
5. Standards browser screen in Parent Mode; multi-profile isolation test; backup/restore E2E; troubleshooting guide; accessibility audit

## Known bugs
- None open. Fixed this session: Teach Me Again failed when no approach was chosen (optional argument arrived as null); stale Show What You Know results could mark a later quiz finished; graph curves were drawn flat outside the plot area; skills could reach Mastered in a single sitting (now requires retention on a later day).

## Tests completed (all passing)
- 87 automated tests (`npm test`): math engine 31, curriculum catalog/content 12, generators 7 (300 seeds x 3 difficulties each), engines 18, database 7, lesson player 4, app API 5, IPC validation 3
- End-to-end (`npm run test:e2e`): setup through Lesson 1 completion in the real UI, including a hint, wrong answers, a reload mid-lesson, a failed quiz, Teach Me Again, targeted practice, a passed retake, dashboard XP/achievements and Parent Mode reports
- Bundled Electron main process smoke-tested with a stub Electron (database created, IPC validation, logging)

## Tests remaining
- Windows: install, Start Menu/Desktop shortcuts, first launch, restart persistence, update over an older version, uninstall keeps data
- Long-horizon spaced review; multi-profile isolation; backup/restore through the UI; every future lesson's generators and content

## Files created or modified this session
- src/main/services/{lessons,achievements,dashboard,backup,preview,api}.ts; src/main/{main,bootstrap,dispatch,ipc-schema}.ts; src/main/db/database.ts (in-memory upgrade)
- src/preload/preload.ts; src/harness/server.ts; scripts/{build-main,make-icon}.mjs
- src/renderer/** (App, api client, components, screens, styles)
- src/core/engine/mastery.ts (retention rule)
- tests/main/{lesson-flow,api,ipc}.test.ts; tests/engine/engines.test.ts; tests-e2e/first-lesson.spec.ts; playwright.config.ts; vite.config.ts
- package.json (build config, v0.2.0), build/icon.png, .github/workflows/build-windows.yml
- README.md, docs/GRADING.md, REQUIREMENTS_CHECKLIST.md, PROJECT_STATUS.md

## Blockers
- Setup.exe: this cloud environment cannot download Electron or NSIS binaries. Either connect a GitHub repository (the included workflow then builds Setup.exe on Windows automatically) or run `npm ci && npm run dist:win` once on a Windows PC.

## Next recommended step
Write Unit 1 lessons U1L02-U1L12 with their generators and verification tests, then the Unit 1 review and unit assessment, so Unit 1 is complete end to end.
