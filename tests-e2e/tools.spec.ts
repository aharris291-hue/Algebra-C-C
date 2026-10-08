/** The built-in graphing tool inside a lesson: functions, points of interest, intersections, tables and a line of best fit. */
import { test, expect, Page } from '@playwright/test';

async function call(page: Page, method: string, args: unknown[]) {
  const r = await page.request.post(`/api/${method}`, { data: JSON.stringify(args) });
  const j = await r.json();
  if (!j.ok) throw new Error(`${method}: ${j.error}`);
  return j.value;
}

async function shot(page: Page, name: string) {
  if (process.env.E2E_SHOTS) await page.screenshot({ path: `${process.env.E2E_SHOTS}/${name}.png`, fullPage: true });
}

test('Graphing tool: graph, points of interest, intersection, table and best fit', async ({ page }) => {
  await page.goto('/');
  const status = await call(page, 'getStatus', []);
  if (status.firstRun) await call(page, 'setupParent', ['2580']);
  await call(page, 'createProfile', ['2580', 'Uma', 'bolt']);
  await page.goto('/');
  await page.locator('.profile-tile, .hero-title').first().waitFor();
  const tile = page.getByRole('button', { name: /Uma/ });
  if (await tile.count()) await tile.click();
  await page.getByRole('button', { name: 'START LEARNING' }).click();
  await expect(page.locator('.lesson-title')).toBeVisible();

  await page.getByRole('button', { name: 'Open the graphing tool' }).click();
  const tool = page.getByRole('dialog', { name: 'Graphing tool' });
  await tool.getByLabel('Graph 1').fill('y = x^2 - 4');
  await expect(tool.locator('.gt-poi')).toContainText('x-intercept: (-2, 0)');
  await expect(tool.locator('.gt-poi')).toContainText('x-intercept: (2, 0)');
  await expect(tool.locator('.gt-poi')).toContainText('minimum: (0, -4)');
  await tool.getByLabel('Graph 2').fill('y = x + 2');
  await expect(tool.locator('.gt-poi')).toContainText('intersection: (3, 5)');
  await expect(tool.locator('.gt-poi')).toContainText('intersection: (-2, 0)');
  await tool.getByLabel('Graph 3').fill('y = 2t');
  await expect(tool.locator('.gt-error')).toContainText('Use x as the variable');
  await tool.getByLabel('Graph 3').fill('y >= -x + 3');
  await expect(tool.locator('.gt-error')).toHaveCount(0);
  await expect(tool.locator('svg[aria-label*="y >= -x + 3"]')).toBeVisible();
  await shot(page, 'tool-graph');

  await tool.getByRole('tab', { name: 'Table' }).click();
  await tool.getByLabel('Start x').fill('-2');
  await expect(tool.locator('tbody tr').nth(0)).toHaveText('-20');
  await expect(tool.locator('tbody tr').nth(3)).toHaveText('1-3');

  await tool.getByRole('tab', { name: 'Data & best fit' }).click();
  await tool.locator('textarea').fill('1, 3\n2, 5\n3, 6\n4, 9\n5, 10\n6, 12');
  await expect(tool.locator('.gt-fit')).toHaveText(/y = 1\.8x \+ 1\.2\s+r = 0\.993$/);
  await tool.getByRole('button', { name: 'Fit the window to the data' }).click();
  await shot(page, 'tool-data');

  await tool.getByRole('button', { name: 'Close the graphing tool' }).click();
  await expect(tool).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Open the graphing tool' })).toBeVisible();
});
