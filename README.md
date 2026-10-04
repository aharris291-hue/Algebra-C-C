# Algebra C&C Learning Academy

An offline Windows desktop app that teaches Georgia's 9th-grade **Algebra: Concepts & Connections** course with mastery-based lessons, exact answer checking, Parent Mode reports and local backups.

- Specification: `Algebra_CC_Claude_Master_Prompt.pdf` (project files)
- Current state: `PROJECT_STATUS.md` · requirements: `REQUIREMENTS_CHECKLIST.md`
- Design: `docs/ARCHITECTURE.md`, `docs/GRADING.md`, `docs/CURRICULUM_MAP.md`, `docs/STANDARDS_COVERAGE.md`

## For the family: installing and using

1. Run `AlgebraCC-Academy-Setup-<version>.exe`. Windows SmartScreen may warn because the installer is not code-signed: choose **More info → Run anyway**.
2. The installer adds a Start Menu shortcut and (optionally) a Desktop shortcut. No internet connection is needed, ever.
3. On first launch a parent creates a **Parent PIN**, writes down the **recovery code**, and adds the student.

**Where data lives:** `%APPDATA%\Algebra C&C Learning Academy\data\academy.sqlite` (with `academy.sqlite.prev`, the previous save). Automatic daily backups (last 14 days) are in `data\backups\auto`. The log is in `logs\app.log` and contains no names, answers or PINs.

**Back up:** Parent Mode → Backup & security → *Save a backup file* (`.accbackup`). Keep a copy on a USB drive or cloud folder.

**Restore:** Parent Mode → Backup & security → *Choose a backup file…*. The app checks the file (checksum, database integrity, version) and shows what it contains before anything changes, then saves the current data as a safety backup in `data\backups\safety`.

**Updating:** run the newer Setup.exe over the old version. Student data is stored separately from the program and is kept; the database is upgraded automatically after a safety backup. Uninstalling also keeps the data folder.

**Forgot the Parent PIN:** Parent Mode → *Forgot the PIN?* → enter the recovery code. A new recovery code is issued.

## For developers

Requirements: Node.js 22+, npm. Windows is required only to produce `Setup.exe` (or use the GitHub Actions workflow).

```bash
npm ci                 # install dependencies
npm test               # unit, math, curriculum, generator and service tests (vitest)
npm run build          # typecheck + bundle main/preload/harness (esbuild) + renderer (vite)
npm run test:e2e       # builds, starts the harness, drives Lesson 1 end to end in Chromium (Playwright)
npm run dev            # Electron + Vite dev server with hot reload (needs the Electron binary)
npm run dist:win       # build Setup.exe into release/ (run on Windows)
npx tsx scripts/gen-curriculum-docs.ts   # regenerate docs/CURRICULUM_MAP.md and docs/STANDARDS_COVERAGE.md
npm run make-icon      # regenerate build/icon.png
```

**Setup.exe from CI:** pushing to GitHub runs `.github/workflows/build-windows.yml` on `windows-latest`: tests, build, end-to-end test, then `electron-builder --win nsis`. Download `AlgebraCC-Academy-Setup` from the run's Artifacts.

**Test harness:** `node dist/harness/server.js` serves the built UI on `http://127.0.0.1:5199` and runs the real services in Node, so the full app can be used in a browser where Electron isn't available. With `HARNESS_TEST_ANSWERS=1` it exposes a test-only answer endpoint used by the end-to-end test. The harness is never packaged into the installer.

### Source layout

```
src/core/math        exact math engine: rationals, parser, polynomials, radicals, answer checking
src/core/engine      mastery, grading, XP, streak/date logic, problem validation, seeded RNG
src/core/curriculum  content types
src/content          standards, 90-day catalog, problem generators, lesson content
src/main             Electron main process: database, services (all business logic), IPC validation
src/preload          the only bridge to the UI
src/renderer         React UI (displays what the services return; never writes records)
src/harness          browser test harness
tests/, tests-e2e/   automated tests
```

Adding a lesson: write its generators in `src/content/generators/` (each with an independent `verify`), add a stress test in `tests/generators/`, write `src/content/lessons/U?/U?L??.ts`, and register both in `src/content/index.ts`. Every math claim is verified by tests before it ships.
