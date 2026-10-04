# Project Status

**Application:** Algebra C&C Learning Academy (Windows desktop)
**Current version:** 0.1.0 (pre-release, not installable yet)
**Current phase:** Phases 1-4 done (curriculum verified, curriculum map, architecture, data model). Phase 5-8 in progress (shell, profiles, lesson engine, math validation).
**Last updated:** 2026-10-04

## Completed
- Georgia A:C&C standards verified against GaDOE sources (docs/STANDARDS_SOURCES.md)
- Standards coverage matrix (docs/STANDARDS_COVERAGE.md, generated from data)
- 18-week / 90-day curriculum map with 86 course skills and 12 prerequisite skills (docs/CURRICULUM_MAP.md)
- Architecture and database design (docs/ARCHITECTURE.md)
- Exact math engine: rationals, parser, polynomials, radicals, answer checker with forms and misconceptions

## In development
- Lesson U1L01 content and generators (first full-chain lesson)
- Engines: mastery, grading, XP, streaks
- Database layer and services; Electron shell; React UI

## Remaining
See REQUIREMENTS_CHECKLIST.md (every NOT STARTED row). Largest items: lesson content for all 90 days, assessments, dashboards, backup/restore, installer.

## Known bugs
- None recorded yet.

## Tests completed
- tests/math/engine.test.ts: 31 tests (rational arithmetic, parser, surds, formatting, all answer kinds and forms) - passing
- tests/curriculum/catalog.test.ts: 6 tests (90 days, pacing, references, skills taught once and assessed, prerequisite order, standards coverage) - passing

## Tests remaining
- Generator verification across many seeds; engine tests; service/database tests; end-to-end UI flows; Windows install/update tests.

## Files created or modified
- package.json, tsconfig.json, vitest.config.ts, .gitignore
- src/core/math/{rational,parser,poly,surd,evaluate,format,answers}.ts
- src/core/curriculum/types.ts
- src/content/{standards,catalog}.ts
- scripts/gen-curriculum-docs.ts
- tests/math/engine.test.ts, tests/curriculum/catalog.test.ts
- docs/{ARCHITECTURE,CURRICULUM_MAP,STANDARDS_COVERAGE,STANDARDS_SOURCES}.md
- REQUIREMENTS_CHECKLIST.md, PROJECT_STATUS.md

## Blockers
- Setup.exe cannot be built in the cloud sandbox (GitHub downloads are blocked). Needs either a GitHub repository with the included Windows CI workflow, or one build run on a Windows PC.

## Next recommended step
Finish U1L01 (content + generators + verification tests), then the engines and database layer, then the Electron shell and lesson player.
