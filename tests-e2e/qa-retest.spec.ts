/**
 * QA retest regressions in the real UI:
 * - the diagnostic shows the message for an unreadable or wrong-form answer after Submit, and
 *   submitting the same wrong-form answer again keeps it (as quizzes do)
 * - a quiz answer refused for its form keeps its text and message together after moving to
 *   another question and back
 * - the save-failure banner appears right after the failing save (not at the next 15 s check)
 *   and goes away soon after saving works again
 */
import { test, expect, Page, APIRequestContext } from '@playwright/test';

const PIN = '2580'; // the harness data is shared by every spec, so use the same Parent PIN

async function call(request: APIRequestContext, m: string, args: unknown[]) {
  const r = await (await request.post(`/api/${m}`, { data: JSON.stringify(args) })).json();
  if (!r.ok) throw new Error(m + ': ' + r.error);
  return r.value;
}

let n = 0;
async function newStudent(request: APIRequestContext, skipDiagnostic = true) {
  const st = await call(request, 'getStatus', []);
  if (st.firstRun) await call(request, 'setupParent', [PIN]);
  const name = `Retest${Date.now() % 100000}${n++}`;
  const p = await call(request, 'createProfile', [PIN, name, 'spark']);
  if (skipDiagnostic) await call(request, 'skipDiagnostic', [PIN, p.id]);
  return { id: p.id as number, name };
}

async function pick(page: Page, name: string) {
  await page.goto('/');
  const tile = page.locator('button.profile-tile', { hasText: name });
  await Promise.race([tile.waitFor(), page.getByRole('button', { name: 'Course map' }).waitFor()]);
  if (await tile.count()) await tile.click();
  await page.getByRole('button', { name: 'Course map' }).waitFor();
}

async function answers(request: APIRequestContext, pid: number, lesson: string): Promise<Record<string, string>> {
  return (await request.get(`/__test/answers?profile=${pid}&lesson=${lesson}`)).json();
}

test('diagnostic: the message for an unreadable or wrong-form answer shows after Submit', async ({ page, request }) => {
  const s = await newStudent(request, false);
  await pick(page, s.name);
  await page.getByRole('button', { name: /Take the diagnostic/ }).click();
  await page.getByRole('button', { name: /Start the diagnostic/ }).click();
  const art = page.locator('article.problem');
  await art.waitFor();
  // answer with "I haven't learned this yet" until a typed (number) question comes up
  for (let g = 0; g < 40; g++) {
    const v = await call(request, 'getDiagnostic', [s.id]);
    if (v.problem?.answerKind === 'number') break;
    await page.getByRole('button', { name: /I haven't learned this yet/ }).click();
    await expect(art).not.toHaveAttribute('data-key', v.problem.key);
  }
  const key = await art.getAttribute('data-key');
  const inp = art.locator('input.answer-input');
  await inp.fill('2+');
  await page.getByRole('button', { name: 'Submit answer' }).click();
  await expect(art.locator('.feedback')).toBeVisible();
  await expect(inp).toHaveValue('2+');
  // wrong form (an unsimplified sum): the message offers to keep it, and the same text again is scored
  await inp.fill('1 + 1');
  await page.getByRole('button', { name: 'Submit answer' }).click();
  await expect(art.locator('.feedback')).toContainText('submit it again');
  await page.getByRole('button', { name: 'Submit answer' }).click();
  await expect(art).not.toHaveAttribute('data-key', key!);
});

test('quiz: a refused answer keeps its text and message after moving away and back', async ({ page, request }) => {
  const s = await newStudent(request);
  await request.get(`/__test/complete-before?profile=${s.id}&before=U1L04`);
  const L = 'U1L04';
  let v = await call(request, 'openLesson', [s.id, L]);
  for (let g = 0; g < 200 && v.section !== 'quiz'; g++) {
    if ((v.section === 'guided' || v.section === 'independent') && v.practice && !v.practice.complete) {
      const pr = v.practice.problems[v.practice.currentIndex];
      if (pr.state === 'open') {
        const a = (await answers(request, s.id, L))[pr.key];
        const resp = a.startsWith('#choice:') ? (pr.step ? pr.step.choices : pr.choices)[Number(a.slice(8))].id : a;
        v = await call(request, 'submitAnswer', [s.id, L, pr.key, resp, 20000, pr.step?.index]);
        continue;
      }
      const r = await (await request.post('/api/nextProblem', { data: JSON.stringify([s.id, L]) })).json();
      if (r.ok) {
        v = r.value;
        continue;
      }
    }
    v = await call(request, 'advanceSection', [s.id, L]);
  }
  expect(v.section).toBe('quiz');
  const typed = v.practice.problems.findIndex((p: { answerKind: string }) => p.answerKind !== 'choice');
  expect(typed).toBeGreaterThanOrEqual(0);
  await pick(page, s.name);
  await page.getByRole('button', { name: /CONTINUE LEARNING|START LEARNING/ }).click();
  const art = page.locator('article.problem');
  await art.waitFor();
  const dots = page.locator('nav.problem-dots button');
  await dots.nth(typed).click();
  await expect(art).toHaveAttribute('data-key', v.practice.problems[typed].key);
  const inp = art.locator('input.answer-input');
  await inp.fill('2+');
  await art.getByRole('button', { name: /Save answer/ }).click();
  await expect(art.locator('.feedback')).toContainText('not saved');
  await dots.nth(typed === 0 ? 1 : 0).click();
  await expect(art).not.toHaveAttribute('data-key', v.practice.problems[typed].key);
  await dots.nth(typed).click();
  await expect(art).toHaveAttribute('data-key', v.practice.problems[typed].key);
  // the message and the text it is about come back together
  await expect(inp).toHaveValue('2+');
  await expect(art.locator('.feedback')).toContainText('not saved');
  await expect(page.getByText(/0 of \d+ answered/)).toBeVisible();
});

test('the save-failure banner appears right after a failed save and clears once saving works', async ({ page, request }) => {
  const s = await newStudent(request);
  await pick(page, s.name);
  // every save fails, as a full or unplugged disk would
  await request.get('/__test/disk-failure?on=1');
  try {
    await page.getByRole('button', { name: /START LEARNING|CONTINUE LEARNING/ }).click();
    await expect(page.locator('.banner-error')).toBeVisible({ timeout: 5_000 });
  } finally {
    await request.get('/__test/disk-failure?on=0');
  }
  await expect(page.locator('.banner-error')).toHaveCount(0, { timeout: 40_000 });
});
