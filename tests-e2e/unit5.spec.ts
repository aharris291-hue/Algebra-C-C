/**
 * Unit 5 in the real UI: the exponent-rules lesson (typing simplified monomials) and the percent
 * growth and compound interest lesson (typing y = a(b)^x equations and money), each from
 * instruction through guided practice, independent practice and the quiz.
 */
import { test, expect, Page } from '@playwright/test';

let profileId = 0;
let lessonId = 'U5L01';

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


test('Unit 5: exponent rules with simplified monomial answers', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));

  await newProfile(page, 'Kai', 'U5L01');
  lessonId = 'U5L01';
  await expect(page.locator('.hero-title')).toHaveText('Properties of Exponents');
  await page.getByRole('button', { name: /START LEARNING|CONTINUE LEARNING/ }).click();
  for (const next of ['What You Need to Know', 'Learn', 'Worked Examples', 'Guided Practice']) {
    await page.getByRole('button', { name: new RegExp(`Continue to ${next}`) }).click();
    await expect(page.locator('.section-title')).toHaveText(next);
  }
  await expect(page.locator('.katex').first()).toBeVisible();
  await shot(page, 'u5l01-guided');
  await solveSet(page);
  await act(page, () => page.getByRole('button', { name: /Continue to Independent Practice/ }).click());
  await expect(page.locator('.section-title')).toHaveText('Independent Practice');
  await solveSet(page, { wrongFirst: true });
  await act(page, () => page.getByRole('button', { name: /Continue to Quiz/ }).click());
  await takeQuiz(page, 0);
  await expect(page.locator('.score-big')).toHaveText('100%');
  await shot(page, 'u5l01-results');
  await page.getByRole('button', { name: /Continue to Mastery Check/ }).click();
  await expect(page.locator('.big-check')).toContainText('passed');
  await page.getByRole('button', { name: /Continue to Lesson Summary/ }).click();
  await page.getByRole('button', { name: /Finish lesson/ }).click();
  await expect(page.locator('.complete-title')).toHaveText('Lesson complete!');
  expect(errors).toEqual([]);
});

test('Unit 5: percent growth and compound interest with equations and money', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));

  await newProfile(page, 'Noor', 'U5L06');
  lessonId = 'U5L06';
  await expect(page.locator('.hero-title')).toHaveText('Percent Growth, Decay and Compound Interest');
  await page.getByRole('button', { name: /START LEARNING|CONTINUE LEARNING/ }).click();
  for (const next of ['What You Need to Know', 'Learn', 'Worked Examples', 'Guided Practice']) {
    await page.getByRole('button', { name: new RegExp(`Continue to ${next}`) }).click();
    await expect(page.locator('.section-title')).toHaveText(next);
  }
  await expect(page.locator('.katex').first()).toBeVisible();
  await shot(page, 'u5l06-guided');
  await solveSet(page);
  await act(page, () => page.getByRole('button', { name: /Continue to Independent Practice/ }).click());
  await expect(page.locator('.section-title')).toHaveText('Independent Practice');
  await solveSet(page, { wrongFirst: true });
  await act(page, () => page.getByRole('button', { name: /Continue to Quiz/ }).click());
  await takeQuiz(page, 0);
  await expect(page.locator('.score-big')).toHaveText('100%');
  await shot(page, 'u5l06-results');
  await page.getByRole('button', { name: /Continue to Mastery Check/ }).click();
  await expect(page.locator('.big-check')).toContainText('passed');
  await page.getByRole('button', { name: /Continue to Lesson Summary/ }).click();
  await page.getByRole('button', { name: /Finish lesson/ }).click();
  await expect(page.locator('.complete-title')).toHaveText('Lesson complete!');
  expect(errors).toEqual([]);
});
