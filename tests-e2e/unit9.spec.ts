/**
 * Unit 9 in the real UI: a capstone project (one situation worked through nine parts, with a
 * wrong first try on each part, hints, results and the closing reflection), and the semester
 * assessment (every question answered, graded, then corrections).
 */
import { test, expect, Page } from '@playwright/test';

let profileId = 0;
let lessonId = 'U9L02';

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


async function newProfile(page: Page, name: string, before: string) {
  await page.goto('/');
  const status = await call(page, 'getStatus', []);
  if (status.firstRun) await call(page, 'setupParent', ['2580']);
  const prof = await call(page, 'createProfile', ['2580', name, 'wave']);
  profileId = prof.id;
  await page.request.get(`/__test/complete-before?profile=${profileId}&before=${before}`);
  await page.goto('/');
  await page.locator('.profile-tile, .hero-title').first().waitFor();
  const tile = page.getByRole('button', { name: new RegExp(name) });
  if (await tile.count()) await tile.click();
}



test('Unit 9: a capstone project from overview to reflection', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));

  await newProfile(page, 'Pia', 'U9L02');
  lessonId = 'U9L02';
  await expect(page.locator('.hero-title')).toHaveText('Capstone: Launches, Growth and Decay');
  await page.getByRole('button', { name: /START LEARNING|CONTINUE LEARNING/ }).click();
  await expect(page.locator('.section-title')).toHaveText('The project');
  await expect(page.locator('.project-parts li')).toHaveCount(9);
  await shot(page, 'u9l02-overview');
  await act(page, () => page.getByRole('button', { name: 'Start the project' }).click());
  await expect(page.locator('.section-title')).toHaveText('Project');
  await expect(page.locator('.project-recap summary')).toHaveText('Reread the situation');
  const first = page.locator('article.problem');
  await expect(first).toContainText('Part 1 of 9');
  await act(page, () => first.getByRole('button', { name: /hint/i }).first().click());
  await expect(first.locator('.hints li')).toHaveCount(1);
  await shot(page, 'u9l02-part1');
  await solveSet(page, { wrongFirst: true });
  await act(page, () => page.getByRole('button', { name: 'Finish the project' }).click());
  await expect(page.locator('.section-title')).toHaveText('Project results');
  await expect(page.locator('.score-line')).toContainText('0 of 9 right on the first try');
  await expect(page.locator('.project-wrapup')).toContainText('Looking back');
  await shot(page, 'u9l02-results');
  await page.getByRole('button', { name: 'Back to home' }).click();
  await expect(page.locator('.hero-title')).toHaveText('Capstone: Investigating Data');
  expect(errors).toEqual([]);
});

test('Unit 9: the semester assessment', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));

  await newProfile(page, 'Quinn', 'U9L06');
  lessonId = 'U9L06';
  await expect(page.locator('.hero-title')).toHaveText('Semester Assessment');
  const view = await call(page, 'openDay', [profileId, 'U9L06']);
  await page.getByRole('button', { name: /START LEARNING|CONTINUE LEARNING/ }).click();
  await expect(page.locator('.section-title')).toHaveText('Before you start');
  await expect(page.locator('.skill-chips li')).toHaveCount(20);
  await act(page, () => page.getByRole('button', { name: 'Start the assessment' }).click());
  await expect(page.locator('.problem-dots .dot')).toHaveCount(view.itemCount);
  await expect(page.locator('article.problem').getByRole('button', { name: /hint/i })).toHaveCount(0);
  await takeQuiz(page, 2);
  await expect(page.locator('.score-line')).toContainText(`${view.itemCount - 2} of ${view.itemCount} correct`);
  await expect(page.locator('.score-line')).toContainText('Passed');
  await expect(page.locator('.review-item.miss')).toHaveCount(2);
  await shot(page, 'u9l06-results');
  await solveSet(page, { scope: 'section.corrections' });
  await expect(page.getByRole('button', { name: 'Retake the assessment' })).toBeEnabled();
  expect(errors).toEqual([]);
});
