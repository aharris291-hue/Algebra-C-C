/**
 * Open access (owner request 2026-10-13): on a fresh profile every course day can be opened from the
 * course map, in any order. A late lesson opens directly, any section can be reached from the section
 * list, the quiz shows a tip (never a block) when guided practice was skipped, leaving the quiz for the
 * lesson pages is allowed and noted for the parent, and the dashboard still suggests the first day.
 */
import { test, expect, Page } from '@playwright/test';
import { fillAnswer } from './graph-helper';

const PIN = '2580';
const LATE = 'U8L03';

async function call(page: Page, method: string, args: unknown[]) {
  const r = await page.request.post(`/api/${method}`, { data: JSON.stringify(args) });
  const j = await r.json();
  if (!j.ok) throw new Error(`${method}: ${j.error}`);
  return j.value;
}

/** Perform a UI action that calls the app and wait until its answer has been rendered. */
async function act(page: Page, fn: () => Promise<unknown>) {
  await Promise.all([page.waitForResponse((r) => r.url().includes('/api/') && !r.url().includes('previewAnswer')), fn()]);
  await page.waitForTimeout(60);
}

test('a fresh profile opens a late lesson from the course map and moves freely inside it', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/');
  const status = await call(page, 'getStatus', []);
  if (status.firstRun) await call(page, 'setupParent', [PIN]);
  const name = `Roamer${Date.now() % 1_000_000}`;
  const prof = await call(page, 'createProfile', [PIN, name, 'spark']);
  await call(page, 'skipDiagnostic', [PIN, prof.id]);
  const course = (await call(page, 'getCourse', [prof.id])) as Array<{ id: string; number: number; lessons: Array<{ id: string; title: string; status: string }> }>;
  const lateUnit = course.find((u) => u.lessons.some((l) => l.id === LATE))!;
  const late = lateUnit.lessons.find((l) => l.id === LATE)!;
  const first = course[0].lessons[0];

  await page.goto('/');
  const tile = page.locator('button.profile-tile', { hasText: name });
  await Promise.race([tile.waitFor(), page.getByRole('button', { name: 'Course map' }).waitFor()]);
  if (await tile.count()) await tile.click();
  await expect(page.locator('.hero-title')).toHaveText(first.title);

  // course map: no locks; the first day is the suggested next one
  await page.getByRole('button', { name: 'Course map' }).click();
  await expect(page.getByText(/Open any lesson, review or assessment whenever you like/)).toBeVisible();
  await expect(page.locator(`li.lesson-row[data-lesson-id="${first.id}"] [data-testid="suggested-next"]`)).toBeVisible();
  await expect(page.getByText('Locked')).toHaveCount(0);
  const u1rows = page.locator('li.lesson-row');
  const n = await u1rows.count();
  expect(n).toBe(course[0].lessons.length);
  for (let i = 0; i < n; i++) await expect(u1rows.nth(i).getByRole('button', { name: /^(Start|Continue|Open|Review)$/ })).toBeEnabled();

  // open the late unit and start the late lesson directly
  await page.getByRole('button', { name: new RegExp(`Unit ${lateUnit.number}\\b`) }).click();
  const row = page.locator(`li.lesson-row[data-lesson-id="${LATE}"]`);
  await expect(row.locator('.lesson-status')).toContainText('Not started');
  await expect(row.getByRole('button', { name: 'Show What You Know' })).toBeVisible();
  await act(page, () => row.getByRole('button', { name: 'Start' }).click());
  await expect(page.locator('h1.lesson-title')).toHaveText(late.title);
  await expect(page.locator('.section-title')).toHaveText("Today's Goal");

  // jump straight to the quiz from the section list: a tip, not a block
  const pill = (label: string) => page.locator('nav.section-nav').getByRole('button', { name: new RegExp(label) });
  await expect(pill('Feedback')).toBeDisabled(); // nothing to show before a quiz
  await act(page, () => pill('Quiz').click());
  await expect(page.locator('.section-title')).toHaveText('Quiz');
  await expect(page.getByTestId('quiz-suggestion')).toContainText('Guided Practice');
  await expect(page.locator('.btn-teach')).toHaveCount(0); // closed-book inside the quiz
  const key0 = await page.locator('article.problem').getAttribute('data-key');

  // leave the quiz for the worked examples, then come back to the same questions
  await act(page, () => pill('Worked Examples').click());
  await expect(page.locator('.section-title')).toHaveText('Worked Examples');
  await expect(page.locator('.examples')).toBeVisible();
  await act(page, () => pill('Quiz').click());
  await expect(page.locator('article.problem')).toHaveAttribute('data-key', key0!);

  // answer every question and finish: graded normally, the visit noted
  const dots = await page.locator('.problem-dots .dot').count();
  for (let i = 0; i < dots; i++) {
    const art = page.locator('article.problem');
    const key = (await art.getAttribute('data-key'))!;
    const a = ((await (await page.request.get(`/__test/answers?profile=${prof.id}&lesson=${LATE}`)).json()) as Record<string, string>)[key];
    if (a.startsWith('#choice:')) await art.getByRole('radio').nth(Number(a.slice(8))).click();
    else await fillAnswer(art, a);
    await act(page, () => art.getByRole('button', { name: /Save answer/ }).click());
    await expect(art.getByRole('button', { name: /Answer saved/ })).toBeVisible();
    if (i < dots - 1) await act(page, () => page.getByRole('button', { name: 'Next →' }).click());
  }
  await act(page, () => page.getByRole('button', { name: 'Finish and grade' }).click());
  await expect(page.locator('.score-big')).toHaveText('100%');
  await expect(page.getByTestId('results-left-during')).toContainText('Worked Examples');

  // the dashboard still suggests the first day and offers the late lesson to pick up
  await page.getByRole('button', { name: /Exit lesson/ }).click();
  await expect(page.locator('.hero-title')).toHaveText(first.title);
  await expect(page.locator('.recent-lesson')).toContainText(late.title);

  // the parent sees the note with the quiz (information, not a penalty)
  const pd = await call(page, 'getParentDashboard', [PIN, prof.id]);
  const quiz = pd.assessments.find((a: { refId: string; kind: string }) => a.refId === LATE && a.kind === 'quiz');
  expect(quiz.percent).toBe(100);
  expect(quiz.leftDuring).toBe(1);
  expect(errors).toEqual([]);
});
