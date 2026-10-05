# Project Status

**Application:** Algebra C&C Learning Academy (Windows desktop, Electron + React + SQLite/WASM)
**Current version:** 0.4.0 (pre-release: Units 1 and 2 are complete end to end, days 1-18; Setup.exe not built yet)
**Current phase:** Curriculum content. Units 1-2 (days 1-18) done; Units 3-9, the checkpoint, cumulative review, capstones and semester days remain.
**Last updated:** 2026-10-05 (end of development session 3)

## Completed
- Georgia A:C&C standards verified against GaDOE sources; coverage matrix; 18-week / 90-day curriculum map (66 lessons, 8 unit reviews, 8 unit assessments, checkpoint, cumulative review, 3 capstones, semester review and assessment; 83 course skills)
- Exact math engine (rationals, parser, polynomials, exact radicals, every answer type, requested-form checks, misconception detection)
- Problem generation framework with automatic validation of every problem (answer, hints, leaks, solution, steps)
- Unit 1 complete: lessons U1L01-U1L10 (instruction, worked examples with WHY, guided and independent practice, quiz, Teach Me Again approaches), the Unit 1 Review (U1L11) and the Unit 1 Assessment (U1L12)
- 28 verified Unit 1 generators covering all 17 Unit 1 skills (function notation, slope and rate of change, writing and converting linear equations, intercepts, key features, domain and range, arithmetic sequences, linear models, unit rates, parent functions). Each lesson's math was re-checked by an independent reviewer; no math errors found, 3 wording fixes made
- Review and assessment days engine (works for every unit): review mixes every unit skill with extra items for weak skills; assessment has no hints, is graded at the end with a 70% bar, builds corrections, allows a retake after corrections, best of the first two attempts counts, XP awarded once
- Unit 2 complete (Analyzing Linear Inequalities): lessons U2L01-U2L04, the Unit 2 Review (U2L05) and the Unit 2 Assessment (U2L06). 12 verified generators cover all 6 Unit 2 skills: solving one-variable inequalities (with the flip rule), number lines, phrases to symbols, two-variable inequalities from situations, boundary line and shading, writing an inequality from a graph, testing solutions, possible/not possible in context (whole-number and non-negative counts), systems of inequalities, any point in a system's region, modeling with a system, and greatest/least whole numbers under two constraints. Independent reviewers re-checked all lesson math: no math errors; 5 wording fixes
- New answer type: "any point in the region" (every point that satisfies all constraints is accepted, with feedback naming the inequality a wrong point breaks; optional whole-number rule). New number-line graphic for one-variable inequalities. Inequality answers now say so when the wrong variable names are used
- Answer checking now accepts labelled answers ("a_n = 3n + 2", "C(m) = ...") and rate units ("12 per hour", "$/gallon")
- Engines: mastery (recency-weighted, retention required for Mastered, spaced review), grading, XP with anti-guessing, streaks
- Database: 17-table schema, crash-safe atomic saves, recovery from previous save/auto backups, migrations with safety backup, daily auto backups
- Services: Parent PIN (hashed, lockout, recovery code), profiles, settings, goals, practice engine, lesson player (10 gated sections, hints, step-by-step guided practice, Teach Me Again, quiz with deferred feedback, corrections, adaptive remediation, retakes, Show What You Know), achievements, student and parent dashboards, grade detail and trend, weekly report, assessment review, backup/restore, live answer preview
- Electron shell: single instance, sandboxed renderer, CSP, network blocked, validated IPC, crash logging, file dialogs for backups, printing
- React UI: first launch, profile picker, student dashboard (CONTINUE LEARNING), course map, skills, settings, lesson player, results, Parent Mode (overview, grades, mastery, assessments, time and support, weekly report, students and goals, backup and security)
- Packaging: electron-builder NSIS config, app icon, GitHub Actions Windows workflow; README.md and docs/GRADING.md

## In development
- Curriculum content: 14 of 66 lessons and 4 of 24 review/assessment days done (all of Units 1 and 2)

## Remaining (largest first; full list in REQUIREMENTS_CHECKLIST.md)
1. Lesson content and verified generators for Units 3-9 (52 lessons). Unit reviews and assessments for those units will work automatically once their skills have generators
2. Checkpoint, cumulative review, semester review and semester assessment content checks (engine already supports them); the 3 capstone projects (not playable yet)
3. Diagnostic / placement assessment and the first-launch offer
4. Build Setup.exe on Windows (CI or PC) and run the clean-install, update and migration tests
5. Standards browser screen in Parent Mode; multi-profile isolation test; backup/restore E2E; troubleshooting guide; accessibility audit

## Known bugs
- None open. Fixed in session 2: unit-review E2E exposed no app bugs; generator issues found by the stress tests (fractional-slope table sometimes gave an integer slope; a rate context gave away its answer; unit-rate wording) were fixed before release. Fixed in session 1: Teach Me Again failed when no approach was chosen (optional argument arrived as null); stale Show What You Know results could mark a later quiz finished; graph curves were drawn flat outside the plot area; skills could reach Mastered in a single sitting (now requires retention on a later day).

## Tests completed (all passing)
- 234 automated tests (`npm test`): math engine 33, curriculum catalog 6, lesson content 84, generators 44 (all 40 generators over 300 seeds x 3 difficulties, each with an independent re-derivation), every written lesson run end to end through the lesson services 14, engines 18, database 7, lesson player 4, review/assessment days 4 (incl. Unit 2), app API 5, IPC validation 3
- End-to-end (`npm run test:e2e`, 3 tests): (0) Unit 2 in the real UI: number lines in Lesson 1, then Lesson 4 (shaded systems, any-point answers) through guided and independent practice; (1) Unit 1 Review and Unit 1 Assessment in the real UI: overview, hint, full mixed review, review results, 23-question assessment with no hints, 3 wrong answers graded 20/23 Passed, corrections, then the retake opens; (2) setup through Lesson 1 completion in the real UI, including a hint, wrong answers, a reload mid-lesson, a failed quiz, Teach Me Again, targeted practice, a passed retake, dashboard XP/achievements and Parent Mode reports
- Bundled Electron main process smoke-tested with a stub Electron (database created, IPC validation, logging)

## Tests remaining
- Windows: install, Start Menu/Desktop shortcuts, first launch, restart persistence, update over an older version, uninstall keeps data
- Long-horizon spaced review; multi-profile isolation; backup/restore through the UI; Units 3-9 generators and content

## Files created or modified this session
- Content: src/content/lessons/U2/U2L01-U2L04; src/content/generators/{u2-common,u2-contexts,u2-one-var,u2-two-var,u2-solutions,u2-systems}.ts; src/content/index.ts; util.ts (decimalOrFraction)
- Math engine: src/core/math/answers.ts (region-point answers, relationHolds, inequality variable check); src/core/engine/problems.ts; src/main/services/preview.ts; src/shared/api.ts
- UI: src/renderer/components/NumberLine.tsx (new), Blocks.tsx, Graph.tsx (boundary lines no longer run along the window edge), MathInput.tsx, styles.css; src/core/curriculum/types.ts (numberline block)
- Tests: tests/generators/u2-unit.test.ts, u2-list.ts, tests/main/all-lessons.test.ts (new), days.test.ts, tests/math/engine.test.ts, tests-e2e/unit2.spec.ts (new)
- docs/CURRICULUM_MAP.md, docs/STANDARDS_COVERAGE.md (regenerated), PROJECT_STATUS.md, REQUIREMENTS_CHECKLIST.md, package.json (0.4.0)

## Blockers
- Setup.exe: this cloud environment cannot download Electron or NSIS binaries. Either connect a GitHub repository (the included workflow then builds Setup.exe on Windows automatically) or run `npm ci && npm run dist:win` once on a Windows PC.

## Next recommended step
Unit 3 (Investigating Rational and Irrational Numbers: rational vs irrational, square and cube roots): lessons, verified generators and tests, the same way as Units 1-2. Its review and assessment days need no new engine work.
