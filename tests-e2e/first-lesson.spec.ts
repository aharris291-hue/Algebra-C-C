/**
 * The full first-lesson chain in the real UI (spec §35):
 * setup -> teach -> examples -> guided practice with a hint -> independent practice ->
 * quiz (fail) -> feedback -> Teach Me Again -> targeted practice -> retake (pass) ->
 * mastery -> lesson complete -> XP and dashboard -> Parent Mode reports.
 */
import { test, expect, Page } from '@playwright/test';

const LESSON = 'U1L01';
const PROFILE = 1;

/** Perform a UI action that calls the app and wait until its answer has been rendered. */
async function act(page: Page, fn: () => Promise<unknown>) {
  await Promise.all([page.waitForResponse((r) => r.url().includes('/api/') && !r.url().includes('previewAnswer')), fn()]);
  await page.waitForTimeout(60);
}

async function shot(page: Page, name: string) {
  if (process.env.E2E_SHOTS) await page.screenshot({ path: `${process.env.E2E_SHOTS}/${name}.png`, fullPage: true });
}

async function answers(page: Page): Promise<Record<string, string>> {
  const r = await page.request.get(`/__test/answers?profile=${PROFILE}&lesson=${LESSON}`);
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
async function solveSet(page: Page, opts: { wrongFirst?: boolean } = {}) {
  for (let guard = 0; guard < 80; guard++) {
    const nav = page.locator('.practice-nav').last();
    const nextBtn = nav.getByRole('button', { name: /Next problem|Continue/ });
    if (await nextBtn.count()) {
      await act(page, () => nextBtn.click());
      continue;
    }
    await page.waitForTimeout(50);
    if ((await page.locator('article.problem').count()) === 0) return; // the set closed when finished
    const { art, key, state } = await currentProblem(page);
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

test('first lesson, start to finish, in the real UI', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  if (process.env.E2E_DEBUG)
    page.on('response', async (r) => {
      if (!r.url().includes('/api/') || r.url().includes('preview')) return;
      const req = r.request().postData();
      const j = await r.json().catch(() => null);
      const v = j?.value;
      console.log(r.url().split('/api/')[1], req?.slice(0, 80), j?.ok, j?.error ?? '', v?.section ?? '', v?.practice ? `${v.practice.activity} cur=${v.practice.currentIndex} ans=${v.practice.problems.filter((p: { lastResponse?: string }) => p.lastResponse).length}` : '');
    });

  // first launch
  await page.goto('/');
  await page.getByRole('button', { name: 'Get started' }).click();
  const pins = page.locator('input[type=password]');
  await pins.nth(0).fill('2580');
  await pins.nth(1).fill('2580');
  await page.getByRole('button', { name: 'Create PIN' }).click();
  await expect(page.locator('.recovery-code')).toHaveText(/^[A-Z2-9]{4}-[A-Z2-9]{4}-[A-Z2-9]{4}$/);
  await page.getByLabel('I wrote down the recovery code').check();
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByLabel('First name or nickname').fill('Jordan');
  await page.getByRole('button', { name: 'Create profile' }).click();
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page.getByRole('heading', { name: 'Find a starting point' })).toBeVisible();
  await page.getByRole('button', { name: 'Later' }).click();

  // dashboard -> lesson
  await page.getByRole('button', { name: 'START LEARNING' }).click();
  await expect(page.locator('.section-title')).toHaveText("Today's Goal");
  for (const next of ['What You Need to Know', 'Learn', 'Worked Examples', 'Guided Practice']) {
    await page.getByRole('button', { name: new RegExp(`Continue to ${next}`) }).click();
    await expect(page.locator('.section-title')).toHaveText(next);
  }
  // can't skip guided practice
  await expect(page.getByRole('button', { name: /Continue to/ })).toHaveCount(0);

  // guided: a hint, then the steps
  const first = await currentProblem(page);
  await first.art.getByRole('button', { name: 'Get a hint' }).click();
  await expect(first.art.locator('.hint')).toHaveCount(1);
  await solveSet(page);
  await act(page, () => page.getByRole('button', { name: /Continue to Independent Practice/ }).click());

  // independent practice with some wrong first tries; reload mid-way to prove autosave
  await expect(page.locator('.section-title')).toHaveText('Independent Practice');
  await page.reload();
  await page.getByRole('button', { name: 'CONTINUE LEARNING' }).click();
  await expect(page.locator('.section-title')).toHaveText('Independent Practice');
  await solveSet(page, { wrongFirst: true });
  await shot(page, 'independent-done');
  await act(page, () => page.getByRole('button', { name: /Continue to Quiz/ }).click());

  // quiz: fail on purpose (3 of 6 wrong)
  await expect(page.getByRole('button', { name: /Get a hint/ })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Teach Me Again' })).toHaveCount(0);
  await takeQuiz(page, 3);
  await expect(page.locator('.score-big')).toHaveText('50%');
  await shot(page, 'results-fail');
  await expect(page.locator('.review-item.miss')).toHaveCount(3);
  await expect(page.locator('.corrections')).toBeVisible();
  await page.getByRole('button', { name: /Continue to Mastery Check/ }).click();

  // remediation: Teach Me Again, targeted practice, retake
  await page.locator('.mastery-retry').getByRole('button', { name: 'Teach Me Again' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await shot(page, 'teach-again');
  await page.getByRole('button', { name: 'Got it' }).click();
  await act(page, () => page.getByRole('button', { name: 'Start targeted practice' }).click());
  await solveSet(page);
  await act(page, () => page.getByRole('button', { name: 'Retake the quiz' }).click());
  await takeQuiz(page, 0);
  await expect(page.locator('.score-big')).toHaveText('100%');
  await page.getByRole('button', { name: /Continue to Mastery Check/ }).click();
  await expect(page.locator('.big-check')).toContainText('passed');
  await page.getByRole('button', { name: /Continue to Lesson Summary/ }).click();
  await page.getByRole('button', { name: /Finish lesson/ }).click();
  await expect(page.locator('.complete-title')).toHaveText('Lesson complete!');
  await shot(page, 'complete');

  // dashboard reflects it
  await page.getByRole('button', { name: 'Back to my dashboard' }).click();
  await expect(page.getByText('1 of 90 days complete')).toBeVisible();
  await shot(page, 'home-after');
  await expect(page.locator('.badge.earned')).not.toHaveCount(0);
  const xp = Number(await page.locator('.stat').filter({ hasText: 'Total XP' }).locator('.stat-value').innerText());
  expect(xp).toBeGreaterThan(0);
  await expect(page.locator('.hero-title')).toHaveText(/Function Notation: Inputs|all caught up/) // the next lesson, once its content ships;

  // Parent Mode
  await page.getByRole('button', { name: 'Switch user' }).click();
  await page.getByRole('button', { name: 'Parent Mode' }).click();
  await page.getByLabel('Parent PIN').fill('1111');
  await page.getByRole('button', { name: 'Open' }).click();
  await expect(page.getByRole('alert')).toContainText('not right');
  await page.getByLabel('Parent PIN').fill('2580');
  await page.getByRole('button', { name: 'Open' }).click();
  await expect(page.locator('.headline')).toContainText('completed 1 of 90 course days with a 100%');
  await shot(page, 'parent-overview');
  await page.getByRole('tab', { name: 'Assessments' }).click();
  await expect(page.locator('.data-table tbody tr')).toHaveCount(2);
  await page.getByRole('tab', { name: 'Weekly report' }).click();
  await expect(page.locator('.report')).toContainText('Functions and Function Notation');
  await shot(page, 'weekly-report');
  await page.getByRole('tab', { name: 'Time & support' }).click();
  await expect(page.locator('.card').filter({ hasText: 'Support used' })).toContainText('Teach Me Again');
  // the standards view: every expectation, where it is taught, and this student's progress
  await page.getByRole('tab', { name: 'Standards' }).click();
  await expect(page.locator('.standard-row')).toHaveCount(46);
  await page.getByLabel('Search').fill('A.FGR.2.4');
  await expect(page.locator('.standard-row')).toHaveCount(1);
  await page.locator('.standard-row summary').click();
  await expect(page.locator('.standard-detail')).toContainText('Functions and Function Notation (done)');
  await shot(page, 'parent-standards');

  expect(errors).toEqual([]);
});
