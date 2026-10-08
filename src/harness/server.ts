/**
 * Test harness: serves the built UI over http://localhost and runs the real services in
 * this Node process, so the full app can be driven in Chromium by Playwright on machines
 * where the Electron runtime isn't available. Never shipped in the installer.
 */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { boot } from '../main/bootstrap';
import { dispatch } from '../main/dispatch';
import { MemoryLogger } from '../main/logger';
import { getProblem } from '../main/services/practice';
import { canonicalInput } from '../core/engine/problems';
import { LESSONS } from '../content';

const root = path.resolve(__dirname, '..', 'renderer');
const port = Number(process.env.HARNESS_PORT ?? 5199);
const dataDir = process.env.HARNESS_DATA_DIR ?? fs.mkdtempSync(path.join(os.tmpdir(), 'acc-harness-'));
const MIME: Record<string, string> = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf', '.svg': 'image/svg+xml', '.png': 'image/png', '.json': 'application/json' };

async function main() {
  const log = new MemoryLogger();
  const { api, ctx } = await boot(dataDir, log, 'harness');
  // Test-only answer oracle for end-to-end tests. Enabled only with HARNESS_TEST_ANSWERS=1;
  // it exists only in the harness, which is never part of the installed app.
  const answers = (profileId: number, lessonId: string): Record<string, string> => {
    let st;
    if (lessonId === 'DIAGNOSTIC') {
      const prof = ctx.db.get<{ onboarding_json: string }>('SELECT onboarding_json FROM profiles WHERE id = ?', [profileId]);
      const run = prof ? JSON.parse(prof.onboarding_json).diagnosticRun : null;
      if (!run) return {};
      st = { practice: run.ps, corrections: run.review };
    } else {
      const row = ctx.db.get<{ state_json: string }>('SELECT state_json FROM lesson_progress WHERE profile_id = ? AND lesson_id = ?', [profileId, lessonId]);
      if (!row) return {};
      st = JSON.parse(row.state_json);
    }
    const out: Record<string, string> = {};
    for (const ps of [st.guided, st.independent, st.quiz, st.corrections, st.remediation?.practice, st.practice]) {
      if (!ps) continue;
      for (const s of ps.items) {
        const p = getProblem(s.generatorId, s.seed, s.difficulty);
        const stepMode = (ps.activity === 'guided' || ps.activity === 'remediation') && p.steps && p.steps.length > 0;
        const spec = stepMode && s.stepIndex < p.steps!.length ? p.steps![s.stepIndex].answer : p.answer;
        out[s.key] = spec.kind === 'choice' ? `#choice:${spec.options.findIndex((o) => o.id === spec.correct)}` : canonicalInput(spec);
      }
    }
    return out;
  };
  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url ?? '/', 'http://localhost');
    if (process.env.HARNESS_TEST_ANSWERS === '1' && url.pathname === '/__test/answers') {
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify(answers(Number(url.searchParams.get('profile')), String(url.searchParams.get('lesson')))));
      return;
    }
    // Test-only: mark every lesson before `before` complete for a profile, so later days can be tested directly.
    if (process.env.HARNESS_TEST_ANSWERS === '1' && url.pathname === '/__test/complete-before') {
      const pid = Number(url.searchParams.get('profile'));
      const before = String(url.searchParams.get('before'));
      const target = LESSONS.find((l) => l.id === before);
      if (!target) {
        res.writeHead(404).end();
        return;
      }
      for (const l of LESSONS) {
        if (l.day >= target.day) break;
        const state = l.kind === 'lesson' ? '{"v":1,"quizAttempts":1}' : '{"v":1,"day":true}';
        ctx.db.run("INSERT OR REPLACE INTO lesson_progress(profile_id, lesson_id, status, section, state_json, started_at, updated_at, completed_at) VALUES (?,?,'completed','summary',?,?,?,?)", [pid, l.id, state, Date.now(), Date.now(), Date.now()]);
      }
      res.writeHead(200, { 'content-type': 'application/json' }).end('{"ok":true}');
      return;
    }
    if (req.method === 'POST' && url.pathname.startsWith('/api/')) {
      const method = url.pathname.slice(5);
      let body = '';
      for await (const chunk of req) body += chunk;
      let args: unknown[] = [];
      try {
        args = JSON.parse(body || '[]');
      } catch {
        /* falls through to validation */
      }
      const r = await dispatch(api, log, method, args);
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify(r));
      return;
    }
    let file = path.join(root, decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname));
    if (!file.startsWith(root) || !fs.existsSync(file)) file = path.join(root, 'index.html');
    res.writeHead(200, { 'content-type': MIME[path.extname(file)] ?? 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
  });
  server.listen(port, '127.0.0.1', () => console.log(`harness on http://127.0.0.1:${port} data=${dataDir}`));
}
main();
