# Final Release Audit: v0.17.0

Date: 2026-10-13. Audited commit: release-fixes-2 (merged to main as v0.17.0).

## How the audit was done

Three independent auditors treated the app as if another developer had built it. They used the status files only to find code, and verified each requirement by running the real services, the real UI in Chromium through the test harness, and the math engine. A "button or placeholder" was not counted.

- **Auditor 1:** spec §1-§20 (curriculum, standards, lessons, hints, Teach Me Again, answer checking, mastery, Test Out, remediation, spaced review, assessments, grading).
- **Auditor 2:** spec §21-§56 (motivation, dashboards, profiles, Parent PIN, weekly report, storage, autosave, backup/restore, privacy, time, streaks, first launch, diagnostic, accessibility, settings, error recovery, update safety, testing, build).
- **Auditor 3:** random lesson sampling and generated-math variation testing.

Every Critical, High and Medium finding was then fixed with a regression test. A fourth, fresh verifier re-ran every repro against the fixed code and searched for regressions. That pass found 1 High and 2 Medium regressions, which were also fixed and tested.

## Lesson sampling

Lessons were picked at random with seed 320261012, which gave 13 lessons:

| Part of semester | Days and lessons |
|---|---|
| Days 1-30 | 2 U1L02, 6 U1L06, 15 U2L03, 28 U4L05 |
| Days 31-60 | 40 U4L17, 46 U5L02, 47 U5L03, 48 U5L04 |
| Days 61-90 | 64 U6L12 (Unit 6 Review), 67 U7L02, 68 U7L03, 87 U9L03 (capstone), 89 U9L05 (Semester Review) |

For each lesson, the auditor checked by hand the instruction, every worked example and its WHY, and Teach Me Again. The auditor also solved problems from every generator the lesson uses before looking at the keys, then compared the keys, step keys, hints, explanations and mistake feedback.

**Result:** no math errors.

## Automated math testing

**Independent checker.** It has its own exact-fraction evaluator and does not use the app's verify() functions.
- It generated 90,600 problems (151 generators × 3 difficulties × 200 seeds), plus 46,500 more after the fixes.
- The answer key was accepted for every problem.
- 44,333 problems were re-solved from the problem data with 0 mismatches.
- Near-misses were rejected: sign errors, ±1, reciprocals, swapped coordinates, and flipped inequalities.
- Equivalent forms were accepted.

**Auditor 2 sweep.** 18,120 problems. Equivalent answer forms were accepted with 0 issues.

**Graph drawing (new in v0.17.0).** Across 3,600 generated problems at every scale and grid point:
- no point off the curve was accepted;
- no point on the curve was rejected.

## Test results (v0.17.0)

- **Unit, service and math tests:** 1,418 passing (`npm test`), in 49 files.
- **End-to-end tests:** 34 passing (Playwright, real UI and real services).
- **Lesson quality checker:** 66 of 66 lessons pass all 10 required elements.
- **Windows CI** (GitHub Actions, windows-latest): the same tests, the build and Setup.exe on every push to main.

## Requirements audit (after fixes)

| Spec | Requirement | Result | Notes |
|---|---|---|---|
| §1 | Core objectives 1-23 (course, GA standards, 18 weeks, 4-5 lessons a week, 30-45 min, teach first, examples, guided and independent practice, quizzes, assessments, feedback, progressive hints, mastery, strengths and weaknesses, remediation, spaced review, move ahead, progress, parent dashboard, saving, offline, installable) | PASS | Installation itself is PARTIAL (see §2) |
| §2 | Windows desktop app: own window, Setup.exe, Start Menu and Desktop shortcuts, bundled runtime, local storage, backup/restore | PARTIAL | Setup.exe builds and the full test suite passes on Windows CI. It has not yet been installed and launched on a real Windows 10/11 PC |
| §3 | Source, build and documentation | PASS | README, ARCHITECTURE, GRADING, TROUBLESHOOTING |
| §4 | Official 2021 GA standards; per-lesson standard, objective, prerequisites, skills | PASS | All 46 expectations have real lesson content (checked independently against the GaDOE map). Students now draw graphs with labels and scales (A.PAR.4.1, A.PAR.8.3, A.FGR.7.6) |
| §5 | Full 18-week map and GaDOE pacing | PASS | 90 days; unit day counts are inside GaDOE ranges |
| §6 | Curriculum stored as data | PASS | |
| §7 | 10 lesson sections in order | PASS | |
| §8 | Worked examples of every kind, with WHY on every step | PASS | |
| §9 | Step-by-step guided practice, no immediate reveal | PASS | |
| §10 | Hints levels 1-4, solution only after help, tracking | PASS | The hint leak check was widened, and the hints that gave answers away were fixed |
| §11 | Teach Me Again: different approach, never penalized, used as a support signal | PASS | Repeated use now shows as a support signal to the parent |
| §12 | Independent practice mix and tracking | PASS | |
| §13 | Answer validation and equivalence | PASS | |
| §14 | Error analysis | PASS | |
| §15 | Mastery stages, multi-factor, early mistakes not permanent | PASS | A drop is now at most one stage per sitting unless there are 3 or more misses |
| §16 | Show What You Know / Test Out | PASS | Results are now shown after a pass; a review day becomes optional once the unit is mastered |
| §17 | Adaptive remediation including prerequisites | PASS | Prerequisite refreshers added |
| §18 | Spaced review with hysteresis | PASS | |
| §19 | Quizzes and assessments: full records, Did Well / Needs Practice / Next Step | PASS | The next step is now stored and shown to the parent |
| §20 | Transparent, reproducible grading | PASS | Recomputed independently from raw tables |
| §21 | Motivation: XP, levels, badges, goals; no reward for guessing | PASS | |
| §22 | Student dashboard and exact resume | PASS | |
| §23 | Separate profiles | PASS | Isolation verified in service and UI tests |
| §24 | Parent dashboard | PASS | A "Coming up" card was added (next days, next assessment, milestones), plus XP and lessons this week |
| §25 | Weekly report | PASS | |
| §26 | Parent controls and PIN | PASS | Changing the PIN no longer breaks or locks Parent Mode |
| §27 | SQLite storage and schema versioning | PASS | Schema v2 migration tested on real v0.16 data and backups |
| §28 | Autosave and continue after a crash | PASS | |
| §29 | Backup and restore with validation | PASS | 9 kinds of malformed file were refused with the data unchanged |
| §30 | Privacy, offline | PASS | |
| §31 | Meaningful learning time | PASS | Only learning screens count toward time |
| §32 | Meaningful streak days | PASS | Menus no longer create a streak day |
| §33 | First launch | PASS | |
| §34 | Diagnostic | PASS | |
| §35 | First lesson | PASS | |
| §36 | Real-world contexts | PASS | |
| §37 | UX | PASS | |
| §38 | Accessibility | PASS | Focus ring and stage-label contrast meet WCAG; dialogs trap focus; graph drawing works by keyboard |
| §39 | Settings | PASS | |
| §40 | Local logging without student data | PASS | Renderer errors are now logged, with data scrubbed |
| §41 | Error recovery | PASS | Error boundary added. If every copy of the data is unreadable, the app offers to restore a backup or start fresh, and keeps the unreadable files |
| §42 | Update safety | PARTIAL | Data is kept separate and a backup is made before migration (tested). Updating over a real install still needs a Windows PC |
| §43 | Testing requirements | PARTIAL | Everything except the Windows install, update and uninstall checks |
| §44 | Math QA | PASS | |
| §45 | Dashboard consistency | PASS | 15 student/parent comparisons agree |
| §46 | Supportive tone | PASS | "Close" is now shown only for near-misses |
| §47 | Anti-guessing | PASS | |
| §48 | Completion criteria | PASS | Except the real-PC install |
| §49-§52 | Checklist, no shortcuts, development phases | PASS | Except phase 56 (clean-install test) |
| §53-§54 | Expandability, no external AI | PASS | |
| §55 | Deliverables | PASS | Except Setup.exe, which is PARTIAL until installed on a PC |

No requirement is FAIL or NOT IMPLEMENTED.

## Release blockers

| # | Severity | Blocker | Status |
|---|---|---|---|
| 1 | High | Non-learning screens counted as study time and could make a streak day | Fixed, tested |
| 2 | High | Parent dashboard never showed upcoming lessons, assessments or milestones | Fixed, tested |
| 3 | High | Skipping an optional review left both dashboards on the old unit (regression found by the verifier) | Fixed, tested |
| 4 | Medium | Changing the PIN broke and could lock Parent Mode | Fixed, tested |
| 5 | Medium | App quit with no in-app recovery when every data copy was unreadable | Fixed, tested |
| 6 | Medium | No error boundary; renderer errors were not logged | Fixed, tested |
| 7 | Medium | A level-2 hint gave the answer (u2.max-in-context) | Fixed; detector widened |
| 8 | Medium | Capstone tasks appeared in unit reviews and assessments | Fixed, tested |
| 9 | Medium | Remediation ignored prerequisites | Fixed, tested |
| 10 | Medium | Next step was missing from stored results | Fixed (schema v2), tested |
| 11 | Medium | Students never drew graphs | Fixed: new graph answer kind, 4 generators, 4 lessons |
| 12 | Medium | Graph labels could be gamed, or were rejected when correct (verifier) | Fixed, tested |
| 13 | Medium | An ambiguous answer option in u5.interpret-exponential | Fixed |
| 14 | Release | **The Setup.exe has not yet been installed, launched, updated and uninstalled on a real Windows 10/11 PC** | **Open: needs Adam's PC** |

Low findings (contrast, focus, wording, formatting, sampling edge cases, the one-variable stats tool and others) were fixed as well. Details are in the commit history.

## Remaining known issues

- **Equivalent equations.** A step answer that is an equivalent equation with the same solution set (for example `x - 2 = -(2(x - 2))` for `x - 2 = 2(x - 2)`) is accepted. This is mathematically sound and was left as is.
- **`y/3 = 2^x`** is not recognised as equivalent to `y = 3(2)^x`.
- **Thousand-dollar answers.** Typing the right dollar amount for a "thousand dollars" answer gets a "give it in thousand dollars" message, which hints that the value is right.
- **Assessments in progress.** While a unit or semester assessment is in progress, all lessons are closed until it is finished. (Superseded 2026-10-13 by open access: lessons stay open; visits during an assessment are noted on it for the parent. See docs/GRADING.md.)
- **Unsigned installer.** Windows SmartScreen shows "unknown publisher".

## Windows build

To build on a Windows PC with Node 20+:

```
npm ci
npm test
npm run dist:win
```

This produces `release/AlgebraCC-Academy-Setup-<version>.exe`.

GitHub Actions builds the same installer on every push to main (Actions tab, workflow "Build Windows installer", artifact "AlgebraCC-Academy-Setup").

## Release status

**NOT READY.** One step remains: the clean-install check on a real Windows PC (blocker 14). Every Critical and High software issue is fixed and tested. Once these steps pass on Adam's PC, the release is READY:

1. Install Setup.exe.
2. Use the Start Menu and Desktop shortcuts.
3. Complete a lesson.
4. Restart Windows and check that progress is kept.
5. Install the next build over it and check that progress is kept.
6. Uninstall and check that the data folder remains.
