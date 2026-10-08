/**
 * The diagnostic (placement) check in the real UI: offered on the home screen, one question at a
 * time with no feedback, a second question after a miss, "I haven't learned this yet", results
 * with a starting point, warm-up practice on a weak earlier-grade skill, Show What You Know
 * suggestions on the course map, and the parent's view.
 */
import { test, expect, Page } from '@playwright/test';

let profileId = 0;
const lessonId = 'DIAGNOSTIC';

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


async function newProfile(page: Page, name: string) {
  await page.goto('/');
  const status = await call(page, 'getStatus', []);
  if (status.firstRun) await call(page, 'setupParent', ['2580']);
  const prof = await call(page, 'createProfile', ['2580', name, 'leaf']);
  profileId = prof.id;
  await page.goto('/');
  await page.locator('.profile-tile, .hero-title').first().waitFor();
  const tile = page.getByRole('button', { name: new RegExp(name) });
  if (await tile.count()) await tile.click();
}

async function submitDiag(page: Page, art: ReturnType<Page['locator']>, value: string) {
  if (value.startsWith('#choice:')) await art.getByRole('radio').nth(Number(value.slice(8))).click();
  else await art.locator('input.answer-input').fill(value);
  await act(page, () => art.getByRole('button', { name: 'Submit answer' }).click());
}

test('Diagnostic: from the home screen offer to a starting point and warm-up practice', async ({ page }) => {
  test.setTimeout(240_000);
  await newProfile(page, 'Sage');
  await expect(page.getByRole('heading', { name: 'Find your starting point' })).toBeVisible();
  await page.getByRole('button', { name: 'Take the diagnostic' }).click();
  await expect(page.getByRole('heading', { name: 'A quick check of what you already know' })).toBeVisible();
  await act(page, () => page.getByRole('button', { name: 'Start the diagnostic' }).click());
  await shot(page, 'diag-1-question');

  let asked = 0;
  let firstCourse = true;
  for (let guard = 0; guard < 120; guard++) {
    if ((await page.locator('article.problem').count()) === 0) break;
    const { art, key } = await currentProblem(page);
    asked++;
    // no hints and no right/wrong feedback during the diagnostic
    await expect(art.getByRole('button', { name: /hint/i })).toHaveCount(0);
    const part = await page.locator('.section-title').textContent();
    if (part!.includes('Part 2') && firstCourse) {
      firstCourse = false;
      await act(page, () => page.getByRole('button', { name: "I haven't learned this yet" }).click());
      await expect(page.locator('article.problem')).not.toHaveAttribute('data-key', key);
      continue;
    }
    const a = (await answers(page))[key];
    // miss the first two questions: the first skill gets a second question before it is called weak
    if (asked <= 2) {
      const choices = await art.getByRole('radio').count();
      await submitDiag(page, art, wrongFor(a, Math.max(2, choices)));
      await expect(page.locator('.feedback')).toHaveCount(0);
      if (asked === 1) await expect(page.locator('.lesson-body')).toContainText('0 of');
    } else await submitDiag(page, art, a);
  }
  await expect(page.getByRole('heading', { name: 'What we found' })).toBeVisible();
  await shot(page, 'diag-2-results');
  await expect(page.locator('.lesson-goal')).toContainText('Integer operations');
  await expect(page.getByText('Needs a refresh')).toHaveCount(1);
  await expect(page.getByText('Not learned yet')).toHaveCount(1);
  await expect(page.getByText('Already know it')).toHaveCount(7);

  // warm-up practice on the weak earlier-grade skill, with hints
  await act(page, () => page.getByRole('button', { name: 'Warm-up practice on earlier skills' }).click());
  await expect(page.getByRole('heading', { name: 'Warm-up practice' })).toBeVisible();
  await expect(page.locator('article.problem .tag').first()).toBeVisible();
  await solveSet(page, { wrongFirst: true, scope: 'section.practice' });
  await act(page, () => page.getByRole('button', { name: 'Done: back to my results' }).click());
  await expect(page.getByRole('heading', { name: 'What we found' })).toBeVisible();

  // the course map marks lessons to try Show What You Know on
  await page.getByRole('button', { name: 'Back to home' }).last().click();
  await expect(page.getByRole('heading', { name: 'Find your starting point' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'My diagnostic results' })).toBeVisible();
  await page.getByRole('button', { name: 'Course map' }).click();
  await expect(page.locator('.tag', { hasText: 'Suggested' }).first()).toBeVisible();
  await shot(page, 'diag-3-course-map');

  // the results give a starting point that opens the lesson
  await page.getByRole('button', { name: /Dashboard/ }).click();
  await page.getByRole('button', { name: 'My diagnostic results' }).click();
  await page.getByRole('button', { name: /^Start / }).click();
  await expect(page.locator('.lesson-title')).toBeVisible();

  // the parent sees the results
  const d = await call(page, 'getParentDashboard', ['2580', profileId]);
  expect(d.profile.onboarding.diagnostic).toBe('completed');
  expect(d.profile.onboarding.diagnosticSummary.skills.find((s: { skillId: string }) => s.skillId === 'P.INT').verdict).toBe('needs-work');
});

test('Diagnostic: a parent can skip it, and the student cannot start it then', async ({ page }) => {
  await newProfile(page, 'Tess');
  await expect(page.getByRole('button', { name: 'Take the diagnostic' })).toBeVisible();
  const bad = await page.request.post('/api/skipDiagnostic', { data: JSON.stringify(['0000', profileId]) });
  expect((await bad.json()).ok).toBe(false);
  await call(page, 'skipDiagnostic', ['2580', profileId]);
  await page.reload();
  await page.locator('.profile-tile, .hero-title').first().waitFor();
  const tile = page.getByRole('button', { name: /Tess/ });
  if (await tile.count()) await tile.click();
  await expect(page.locator('.hero-title')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Take the diagnostic' })).toHaveCount(0);
  const start = await page.request.post('/api/startDiagnostic', { data: JSON.stringify([profileId]) });
  expect((await start.json()).error).toMatch(/parent skipped/);
});
