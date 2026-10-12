/**
 * Active-time tracking in the real UI (spec §21):
 * - C3: idle detection uses a monotonic clock, so an idle student is not credited after the
 *   system clock moves back.
 * - C5: one heartbeat interval per session, so moving between screens does not drop time.
 */
import { test, expect, Page, APIRequestContext } from '@playwright/test';

const PIN = '2580';

async function call(request: APIRequestContext, m: string, args: unknown[]) {
  const r = await (await request.post(`/api/${m}`, { data: JSON.stringify(args) })).json();
  if (!r.ok) throw new Error(m + ': ' + r.error);
  return r.value;
}

let n = 0;
async function newStudent(request: APIRequestContext) {
  const st = await call(request, 'getStatus', []);
  if (st.firstRun) await call(request, 'setupParent', [PIN]);
  const name = `Timer${Date.now() % 100000}${n++}`;
  const p = await call(request, 'createProfile', [PIN, name, 'spark']);
  await call(request, 'skipDiagnostic', [PIN, p.id]);
  return { id: p.id, name };
}

function countBeats(page: Page) {
  const beats: number[] = [];
  page.on('request', (r) => {
    if (r.url().includes('/api/heartbeat')) beats.push(Date.now());
  });
  return beats;
}

async function pick(page: Page, name: string) {
  await page.goto('/');
  const tile = page.locator('button.profile-tile', { hasText: name });
  await Promise.race([tile.waitFor(), page.getByRole('button', { name: 'Course map' }).waitFor()]);
  if (await tile.count()) await tile.click();
  await page.getByRole('button', { name: 'Course map' }).waitFor();
}

test('an idle student is not credited after the system clock moves back', async ({ page, request }) => {
  const s = await newStudent(request);
  await page.clock.install({ time: new Date('2026-09-07T14:00:00Z') });
  const beats = countBeats(page);
  await pick(page, s.name);
  await page.mouse.move(100, 100);
  await page.clock.runFor(5 * 60_000); // 5 idle minutes
  expect(beats.length).toBeLessThanOrEqual(6); // at most the 90 s grace
  await page.mouse.move(120, 120);
  await page.clock.runFor(30_000);
  await page.clock.setSystemTime(new Date('2026-09-07T13:05:00Z')); // clock corrected back one hour
  const b0 = beats.length;
  await page.clock.runFor(10 * 60_000); // 10 idle minutes
  expect(beats.length - b0).toBeLessThanOrEqual(7);
});

test('time keeps counting while the student moves between screens', async ({ page, request }) => {
  const s = await newStudent(request);
  await page.clock.install({ time: new Date('2026-09-07T14:00:00Z') });
  const beats = countBeats(page);
  await pick(page, s.name);
  // 3 active minutes, switching between the dashboard and the course map every 10 s
  for (let i = 0; i < 18; i++) {
    await page.mouse.move(100 + i, 100);
    await page.clock.runFor(10_000);
    if (i % 2 === 0) await page.getByRole('button', { name: 'Course map' }).click();
    else await page.getByRole('button', { name: /Dashboard/ }).click();
  }
  expect(beats.length).toBeGreaterThanOrEqual(11); // 12 expected
});
