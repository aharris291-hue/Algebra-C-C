/**
 * Unit 1 Review and Unit 1 Assessment in the real UI: overview, mixed review with hints,
 * review results, then the assessment (no hints, graded at the end), corrections and results.
 */
import { test, expect, Page } from '@playwright/test';

let profileId = 0;
let lessonId = 'U1L11';

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

async function shot(page: Page, name: string) {
  if (process.env.E2E_SHOTS) await page.screenshot({ path: `${process.env.E2E_SHOTS}/${name}.png`, fullPage: true });
}

async function answers(page: Page): Promise<Record<string, string>> {
  const r = await page.request.get(`/__test/answers?profile=${profileId}&lesson=${lessonId}`);
  return r.json();
}

async function currentProblem(page: Page) {
  const art = page.locator('article.problem');
  await art.waitFor();
  return { art, key: (await art.getAttribute('data-key'))!, state: (await art.getAttribute('data-state'))! };
}

async function enter(page: Page, art: ReturnType<Page['locator']>, value: string, deferred: boolean) {
  if (value.startsWith('#choice:')) {
    const radio = art.getByRole('radio').nth(Number(value.slice(8)));
    if (deferred) {
      await radio.click();
      await act(page, () => art.getByRole('button', { name: /Save answer/ }).click());
    } else await act(page, () => radio.click());
  } else {
    await art.locator('input.answer-input').fill(value);
    await act(page, () => art.getByRole('button', { name: deferred ? /Save answer/ : 'Check answer' }).click());
  }
}

function wrongFor(value: string, choices: number): string {
  if (value.startsWith('#choice:')) return `#choice:${(Number(value.slice(8)) + 1) % choices}`;
  return '999';
}

/** Solve every problem in an immediate-feedback practice set the way a student would. */
async function solveSet(page: Page, opts: { wrongFirst?: boolean; scope?: string } = {}) {
  const root = opts.scope ? page.locator(opts.scope) : page.locator('body');
  for (let guard = 0; guard < 80; guard++) {
    const nav = root.locator('.practice-nav').last();
    const nextBtn = nav.getByRole('button', { name: /Next problem|Continue/ });
    if (await nextBtn.count()) {
      await act(page, () => nextBtn.click());
      continue;
    }
    await page.waitForTimeout(50);
    if ((await root.locator('article.problem').count()) === 0) return; // the set closed when finished
    const art = root.locator('article.problem');
    const key = (await art.getAttribute('data-key'))!;
    const state = (await art.getAttribute('data-state'))!;
    if (state !== 'open') return; // set finished
    const a = (await answers(page))[key];
    const isStep = (await art.locator('.guided-step.current').count()) > 0;
    if (opts.wrongFirst && !isStep && (await art.getAttribute('data-tried')) === null) {
      const choices = await art.getByRole('radio').count();
      await enter(page, art, wrongFor(a, Math.max(2, choices)), false);
      await expect(art.locator('.feedback')).toBeVisible();
      await art.evaluate((el) => el.setAttribute('data-tried', '1'));
    }
    await enter(page, art, a, false);
  }
  throw new Error('practice set did not finish');
}

async function takeQuiz(page: Page, wrong: number) {
  const n = await page.locator('.problem-dots .dot').count();
  for (let i = 0; i < n; i++) {
    const { art, key } = await currentProblem(page);
    const a = (await answers(page))[key];
    const choices = await art.getByRole('radio').count();
    await enter(page, art, i < wrong ? wrongFor(a, Math.max(2, choices)) : a, true);
    await expect(art.getByRole('button', { name: /Answer saved/ })).toBeVisible();
    if (i < n - 1) await act(page, () => page.getByRole('button', { name: 'Next →' }).click());
  }
  await act(page, () => page.getByRole('button', { name: 'Finish and grade' }).click());
}

test('unit review and unit assessment days', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/');
  const status = await call(page, 'getStatus', []);
  if (status.firstRun) await call(page, 'setupParent', ['2580']);
  const prof = await call(page, 'createProfile', ['2580', 'Riley', 'wave']);
  profileId = prof.id;
  await page.request.get(`/__test/complete-before?profile=${profileId}&before=U1L11`);

  await page.goto('/');
  await page.locator('.profile-tile, .hero-title').first().waitFor();
  const tile = page.getByRole('button', { name: /Riley/ });
  if (await tile.count()) await tile.click();
  await expect(page.locator('.hero-title')).toHaveText('Unit 1 Review');
  await page.getByRole('button', { name: /START LEARNING|CONTINUE LEARNING/ }).click();

  // review overview
  await expect(page.locator('.section-title')).toHaveText('What this review covers');
  await expect(page.locator('.skill-chips li')).toHaveCount(17);
  await act(page, () => page.getByRole('button', { name: 'Start the review' }).click());
  await expect(page.locator('.section-title')).toHaveText('Mixed review');
  // a hint on the first problem
  const first = page.locator('article.problem');
  await act(page, () => first.getByRole('button', { name: /hint/i }).first().click());
  await expect(first.locator('.hints li')).toHaveCount(1);
  await solveSet(page);
  await act(page, () => page.getByRole('button', { name: 'See my review results' }).click());
  await expect(page.locator('.score-line')).toContainText('right on the first try');
  await shot(page, 'review-results');
  await page.getByRole('button', { name: 'Back to home' }).click();

  // assessment
  lessonId = 'U1L12';
  await expect(page.locator('.hero-title')).toHaveText('Unit 1 Assessment');
  await page.getByRole('button', { name: /START LEARNING|CONTINUE LEARNING/ }).click();
  await expect(page.locator('.section-title')).toHaveText('Before you start');
  await act(page, () => page.getByRole('button', { name: 'Start the assessment' }).click());
  await expect(page.locator('.problem-dots .dot')).toHaveCount(23);
  await expect(page.locator('article.problem').getByRole('button', { name: /hint/i })).toHaveCount(0);
  await takeQuiz(page, 3);
  await expect(page.locator('.score-line')).toContainText('20 of 23 correct');
  await expect(page.locator('.score-line')).toContainText('Passed');
  await expect(page.locator('.review-item.miss')).toHaveCount(3);
  await shot(page, 'assessment-results');
  // corrections, then a retake becomes available
  await expect(page.getByRole('button', { name: 'Retake the assessment' })).toBeDisabled();
  await solveSet(page, { scope: 'section.corrections' });
  await expect(page.getByRole('button', { name: 'Retake the assessment' })).toBeEnabled();
  await act(page, () => page.getByRole('button', { name: 'Retake the assessment' }).click());
  await expect(page.locator('.section-title')).toHaveText('Assessment (attempt 2)');
  expect(errors).toEqual([]);
});
