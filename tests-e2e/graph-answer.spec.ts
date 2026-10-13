/**
 * Drawing a graph as an answer (A.PAR.4.1: "graph inequalities on coordinate axes with labels and
 * scales"): in Lesson U2L02's guided practice the student labels the axes, chooses the scales, places
 * the boundary points with the keyboard, picks the boundary and shading, gets targeted feedback for
 * the wrong side, then redraws with the mouse and is graded correct. Also checks that the graphing
 * tool button never covers the main action button (1280px window).
 */
import { test, expect, Page, Locator } from '@playwright/test';
import { drawGraph, fillAnswer } from './graph-helper';

let profileId = 0;
const lessonId = 'U2L02';

async function call(page: Page, method: string, args: unknown[]) {
  const r = await page.request.post(`/api/${method}`, { data: JSON.stringify(args) });
  const j = await r.json();
  if (!j.ok) throw new Error(`${method}: ${j.error}`);
  return j.value;
}

async function act(page: Page, fn: () => Promise<unknown>) {
  await Promise.all([page.waitForResponse((r) => r.url().includes('/api/') && !r.url().includes('previewAnswer')), fn()]);
  await page.waitForTimeout(60);
}

async function answers(page: Page): Promise<Record<string, string>> {
  const r = await page.request.get(`/__test/answers?profile=${profileId}&lesson=${lessonId}`);
  return r.json();
}

function overlap(a: { x: number; y: number; width: number; height: number }, b: { x: number; y: number; width: number; height: number }) {
  return a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height;
}

async function enterTyped(page: Page, art: Locator, value: string) {
  if (value.startsWith('#choice:')) await act(page, () => art.getByRole('radio').nth(Number(value.slice(8))).click());
  else {
    await fillAnswer(art, value);
    await act(page, () => art.getByRole('button', { name: 'Check answer' }).click());
  }
}

test('Graph answers: label, scale, plot with the keyboard and the mouse, boundary and shading', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/');
  const status = await call(page, 'getStatus', []);
  if (status.firstRun) await call(page, 'setupParent', ['2580']);
  const prof = await call(page, 'createProfile', ['2580', 'Gale', 'wave']);
  profileId = prof.id;
  await page.request.get(`/__test/complete-before?profile=${profileId}&before=${lessonId}`);
  await page.goto('/');
  await page.locator('.profile-tile, .hero-title').first().waitFor();
  const tile = page.getByRole('button', { name: /Gale/ });
  if (await tile.count()) await tile.click();
  await expect(page.locator('.hero-title')).toHaveText('Graphing Linear Inequalities');
  await page.getByRole('button', { name: /START LEARNING|CONTINUE LEARNING/ }).click();
  for (const next of ['What You Need to Know', 'Learn', 'Worked Examples', 'Guided Practice']) {
    await page.getByRole('button', { name: new RegExp(`Continue to ${next}`) }).click();
    await expect(page.locator('.section-title')).toHaveText(next);
  }

  let drew = false;
  let checkedOverlap = false;
  for (let guard = 0; guard < 60 && !drew; guard++) {
    const nextBtn = page.locator('.practice-nav').last().getByRole('button', { name: /Next problem/ });
    if (await nextBtn.count()) {
      await act(page, () => nextBtn.click());
      continue;
    }
    const art = page.locator('article.problem');
    await art.waitFor();
    if ((await art.getAttribute('data-state')) !== 'open') break;
    const key = (await art.getAttribute('data-key'))!;
    const a = (await answers(page))[key];

    if (!checkedOverlap && (await art.getByRole('button', { name: 'Check answer' }).count())) {
      // L7: the graphing tool button sits in the header and never covers the main action button
      const tool = page.getByRole('button', { name: 'Open the graphing tool' });
      await expect(tool).toBeVisible();
      expect(overlap((await tool.boundingBox())!, (await art.getByRole('button', { name: 'Check answer' }).boundingBox())!)).toBe(false);
      checkedOverlap = true;
    }

    if (!(await art.getByTestId('graph-grid').count())) {
      await enterTyped(page, art, a);
      continue;
    }

    // the drawing step: first with the keyboard, shading the wrong side
    const right = JSON.parse(a);
    expect(right.bd).toBeTruthy();
    expect(right.sh).toBeTruthy();
    const wrong = { ...right, sh: right.sh === 'above' ? 'below' : 'above' };
    await drawGraph(art, wrong, 'keyboard');
    await expect(art.getByTestId('graph-announce')).toContainText('Point placed at');
    await expect(art.locator('.gi-point')).toHaveCount(right.p.length);
    // the tick labels follow the chosen scale
    await expect(art.locator('.gi-tick').first()).toHaveText('0');
    await act(page, () => art.getByRole('button', { name: 'Check answer' }).click());
    await expect(art.locator('.feedback-incorrect')).toBeVisible();
    await expect(art.locator('.feedback')).toContainText('Shade the side');

    // an unfinished drawing is not graded: it asks for what is missing
    await art.getByRole('button', { name: 'Clear points' }).click();
    await act(page, () => art.getByRole('button', { name: 'Check answer' }).click());
    await expect(art.locator('.feedback-invalid')).toContainText('Place at least 2 points');

    // then with the mouse, correctly
    await drawGraph(art, right, 'mouse');
    await expect(art.locator('.gi-point')).toHaveCount(right.p.length);
    if (process.env.E2E_SHOTS) await art.screenshot({ path: `${process.env.E2E_SHOTS}/graph-answer.png` });
    await act(page, () => art.getByRole('button', { name: 'Check answer' }).click());
    await expect(art.locator('.feedback-correct')).toBeVisible();
    drew = true;
  }
  expect(drew).toBe(true);
  expect(checkedOverlap).toBe(true);
  expect(errors).toEqual([]);
});
