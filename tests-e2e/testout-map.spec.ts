/**
 * Course map: Show What You Know stays available whenever the service allows it (QA B9).
 * Peeking at a lesson creates its in-progress record; the button must still be offered then,
 * and must disappear once a quiz attempt or a finished test-out makes it unavailable.
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
  const name = `Peeker${Date.now() % 100000}${n++}`;
  const p = await call(request, 'createProfile', [PIN, name, 'spark']);
  await call(request, 'skipDiagnostic', [PIN, p.id]);
  return { id: p.id as number, name };
}

async function courseMapRow(page: Page, name: string, lessonTitle: string) {
  await page.goto('/');
  const tile = page.locator('button.profile-tile', { hasText: name });
  await Promise.race([tile.waitFor(), page.getByRole('button', { name: 'Course map' }).waitFor()]);
  if (await tile.count()) await tile.click();
  await page.getByRole('button', { name: 'Course map' }).click();
  const row = page.locator('li.lesson-row', { hasText: lessonTitle }).first();
  await row.waitFor();
  return row;
}

test('Show What You Know is still offered after peeking at the lesson', async ({ page, request }) => {
  const s = await newStudent(request);
  const course = await call(request, 'getCourse', [s.id]);
  const first = course[0].lessons[0];
  await call(request, 'openLesson', [s.id, first.id]); // peek: the lesson is now in progress
  const row = await courseMapRow(page, s.name, first.title);
  await expect(row.locator('.lesson-status')).toContainText('In progress');
  await expect(row.getByRole('button', { name: 'Show What You Know' })).toBeVisible();
  await expect(row.getByRole('button', { name: 'Continue' })).toBeVisible();
});

test('Show What You Know is not offered after a finished test-out', async ({ page, request }) => {
  const s = await newStudent(request);
  const course = await call(request, 'getCourse', [s.id]);
  const first = course[0].lessons[0];
  let v = await call(request, 'startTestOut', [s.id, first.id]);
  for (const p of v.practice.problems) v = await call(request, 'submitAnswer', [s.id, first.id, p.key, p.answerKind === 'choice' ? p.choices[0].id : '987654', 30_000]);
  v = await call(request, 'finishQuiz', [s.id, first.id]);
  expect(v.results.passed).toBe(false);
  const row = await courseMapRow(page, s.name, first.title);
  await expect(row.getByRole('button', { name: 'Continue' })).toBeVisible();
  await expect(row.getByRole('button', { name: 'Show What You Know' })).toHaveCount(0);
});
