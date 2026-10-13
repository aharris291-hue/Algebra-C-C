/**
 * Release-audit regressions in the real UI:
 * - H2: the Parent Overview shows "Coming up" (next days, next assessment, milestones), XP and this
 *   week's lessons.
 * - M1: changing the PIN inside Parent Mode keeps Parent Mode working (no stale-PIN lockout).
 * - M3: a screen that crashes shows a friendly error with "Return to dashboard"; renderer errors
 *   (boundary, window errors, unhandled rejections) reach the main-process log, scrubbed.
 * - L1: text fields show the focus ring (not only a border colour), >= 3:1 colour.
 * - L2: Teach Me Again traps focus, closes on Escape and gives focus back to its button.
 * - L4: the "Minutes per day" input allows exactly what the service accepts.
 * - L5: restoring an archived student whose name is taken shows the reason.
 */
import { test, expect, Page, APIRequestContext } from '@playwright/test';

const PIN = '2580'; // the harness data is shared by every spec, so use the same Parent PIN

async function call(request: APIRequestContext, m: string, args: unknown[]) {
  const r = await (await request.post(`/api/${m}`, { data: JSON.stringify(args) })).json();
  if (!r.ok) throw new Error(m + ': ' + r.error);
  return r.value;
}

let n = 0;
async function newStudent(request: APIRequestContext, prefix = 'Audit') {
  const st = await call(request, 'getStatus', []);
  if (st.firstRun) await call(request, 'setupParent', [PIN]);
  const name = `${prefix} ${Date.now() % 1000000} ${n++}`; // separators keep names from different tests distinct
  const p = await call(request, 'createProfile', [PIN, name, 'spark']);
  await call(request, 'skipDiagnostic', [PIN, p.id]);
  return { id: p.id as number, name };
}

async function pick(page: Page, name: string) {
  await page.goto('/');
  const tile = page.locator('button.profile-tile', { hasText: name });
  await Promise.race([tile.waitFor(), page.getByRole('button', { name: 'Course map' }).waitFor()]);
  if (await tile.count()) await tile.click();
  await page.getByRole('button', { name: 'Course map' }).waitFor();
}

async function openParent(page: Page, studentName: string, pin = PIN) {
  await page.goto('/');
  await page.getByRole('button', { name: 'Parent Mode' }).click();
  await page.getByLabel('Parent PIN').fill(pin);
  await page.getByRole('button', { name: 'Open' }).click();
  await page.getByRole('heading', { name: 'Parent Mode' }).waitFor();
  // the student list loads after Parent Mode opens (the specs always have several students)
  const sel = page.getByLabel('Student', { exact: true });
  await expect(sel.locator('option', { hasText: studentName })).toHaveCount(1);
  await sel.selectOption({ label: studentName });
}

test('Parent Overview: Coming up, XP and this week\'s lessons (H2)', async ({ page, request }) => {
  await newStudent(request, 'AuditOther');
  const s = await newStudent(request);
  await openParent(page, s.name);
  // the selected student's dashboard (not the first student's, shown while it loads)
  await expect(page.locator('.headline')).toContainText(s.name);
  const card = page.locator('section.card', { has: page.getByRole('heading', { name: 'Coming up' }) });
  await expect(card).toBeVisible();
  await expect(card).toContainText('Next course days');
  await expect(card.locator('ol li').first()).toContainText('Day 1:');
  await expect(card.locator('ol li')).toHaveCount(5);
  await expect(card).toContainText('Next assessment');
  await expect(card).toContainText(/Unit 1.*after \d+ more course days/);
  await expect(card).toContainText('Level 2 in 100 XP');
  const eng = page.locator('section.card', { has: page.getByRole('heading', { name: 'Engagement' }) });
  await expect(eng).toContainText('XP');
  await expect(eng).toContainText('Lessons this week');
  await expect(eng).toContainText('0 of 5');
});

test('changing the PIN inside Parent Mode keeps Parent Mode working (M1)', async ({ page, request }) => {
  await newStudent(request, 'AuditOther');
  const s = await newStudent(request);
  await openParent(page, s.name);
  const NEW = '4826';
  const change = async (from: string, to: string) => {
    await page.getByRole('tab', { name: 'Backup & security' }).click();
    await page.getByLabel('Current PIN').fill(from);
    await page.getByLabel('New PIN').fill(to);
    await page.getByRole('button', { name: 'Change PIN' }).click();
    await expect(page.locator('.notice')).toContainText('PIN changed');
  };
  await change(PIN, NEW);
  try {
    // every tab keeps working with the session's (new) PIN; nothing counts as a wrong PIN
    for (let i = 0; i < 3; i++) {
      for (const t of ['Overview', 'Weekly report', 'Students & goals', 'Standards']) {
        await page.getByRole('tab', { name: t }).click();
        await expect(page.locator('.error-box')).toHaveCount(0);
      }
    }
    await page.getByRole('tab', { name: 'Overview' }).click();
    await expect(page.getByRole('heading', { name: 'Coming up' })).toBeVisible();
    expect(await call(request, 'verifyParentPin', [NEW])).toEqual({ ok: true });
  } finally {
    // the harness data is shared: put the PIN back
    expect((await call(request, 'changeParentPin', [NEW, PIN])).ok).toBe(true);
  }
  expect(await call(request, 'verifyParentPin', [PIN])).toEqual({ ok: true });
});

test('goals input limits and archive/restore errors in Students & goals (L4, L5)', async ({ page, request }) => {
  const s = await newStudent(request);
  await openParent(page, s.name);
  await page.getByRole('tab', { name: 'Students & goals' }).click();
  const card = page.locator('section.card', { has: page.getByRole('heading', { name: s.name }) });
  const minutes = card.getByLabel('Minutes per day');
  await expect(minutes).toHaveAttribute('max', '120');
  await expect(minutes).toHaveAttribute('min', '10');
  await expect(card.getByLabel('Lessons per week')).toHaveAttribute('max', '10');
  await minutes.fill('120');
  await card.getByRole('button', { name: 'Save goals' }).click();
  await expect(page.locator('.notice')).toHaveText('Goals saved.');
  // archive it, add another student with the same name, then try to restore the archived one
  await card.getByRole('button', { name: 'Archive' }).click();
  await card.getByRole('button', { name: /Confirm archive/ }).click();
  await expect(card.locator('.tag', { hasText: 'Archived' })).toBeVisible();
  await page.getByLabel('First name or nickname').fill(s.name);
  await page.getByRole('button', { name: 'Add student' }).click();
  // wait until the new student is added (two cards with this name: active and archived)
  await expect(page.locator('section.card').filter({ has: page.getByRole('heading', { name: s.name }) })).toHaveCount(2);
  const archived = page.locator('section.card', { has: page.locator('.tag', { hasText: 'Archived' }) }).filter({ has: page.getByRole('heading', { name: s.name }) });
  await archived.getByRole('button', { name: 'Restore' }).click();
  await expect(page.locator('.notice')).toContainText(`Another active student is already named "${s.name}"`);
});

test('a text field shows the focus ring when focused (L1)', async ({ page, request }) => {
  const s = await newStudent(request);
  await openParent(page, s.name);
  await page.getByRole('tab', { name: 'Students & goals' }).click();
  const input = page.getByLabel('First name or nickname');
  await input.click();
  const style = await input.evaluate((el) => {
    const cs = getComputedStyle(el);
    return { style: cs.outlineStyle, width: cs.outlineWidth, color: cs.outlineColor, shadow: cs.boxShadow };
  });
  expect(style.style).toBe('solid');
  expect(style.width).toBe('3px');
  expect(style.color).toBe('rgb(29, 42, 138)');
  expect(style.shadow).toContain('rgb(255, 255, 255)');
  // a button reached with the keyboard has the same ring
  await page.keyboard.press('Shift+Tab');
  const btn = await page.evaluate(() => getComputedStyle(document.activeElement!).outlineColor);
  expect(btn).toBe('rgb(29, 42, 138)');
});

test('Teach Me Again: focus is trapped, Escape closes, focus returns to the button (L2)', async ({ page, request }) => {
  const s = await newStudent(request);
  await pick(page, s.name);
  await page.getByRole('button', { name: /START LEARNING/ }).click();
  const teachBtn = page.locator('.lesson-foot').getByRole('button', { name: 'Teach Me Again' });
  await teachBtn.focus();
  await page.keyboard.press('Enter');
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  const inDialog = () => page.evaluate(() => !!document.activeElement?.closest('[role="dialog"]'));
  await expect.poll(inDialog).toBe(true);
  for (let i = 0; i < 25; i++) {
    await page.keyboard.press(i % 5 === 4 ? 'Shift+Tab' : 'Tab');
    expect(await inDialog(), `Tab ${i + 1}`).toBe(true);
  }
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(teachBtn).toBeFocused();
  // the "Got it" button closes it the same way
  await page.keyboard.press('Enter');
  await expect(dialog).toBeVisible();
  await dialog.getByRole('button', { name: 'Got it' }).click();
  await expect(dialog).toHaveCount(0);
  await expect(teachBtn).toBeFocused();
});

test('a crashing screen shows a friendly error, and renderer errors reach the log (M3)', async ({ page, request }) => {
  const s = await newStudent(request);
  const logLines = async (): Promise<string[]> => (await request.get('/__test/renderer-log')).json();
  const before = (await logLines()).length;
  // the dashboard data comes back malformed: the Home screen throws while rendering
  await page.route('**/api/getStudentDashboard', (route) => route.fulfill({ contentType: 'application/json', body: JSON.stringify({ ok: true, value: { achievements: [] } }) }));
  await page.goto('/');
  const tile = page.locator('button.profile-tile', { hasText: s.name });
  await tile.click();
  await expect(page.getByRole('heading', { name: 'Something went wrong on this screen' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Return to dashboard' })).toBeFocused();
  await expect.poll(async () => (await logLines()).slice(before).some((l) => /\] boundary: TypeError/.test(l))).toBe(true);
  // the data is fine again: "Return to dashboard" brings the dashboard back
  await page.unroute('**/api/getStudentDashboard');
  await page.getByRole('button', { name: 'Return to dashboard' }).click();
  await expect(page.getByRole('button', { name: 'Course map' })).toBeVisible();
  // window errors and unhandled rejections are logged too, without the quoted text
  await page.evaluate(() => {
    setTimeout(() => {
      throw new Error('window boom "Sam typed 2x+3"');
    });
    Promise.reject(new Error('rejected boom'));
  });
  await expect.poll(async () => (await logLines()).slice(before).some((l) => l.includes('] error: Error: window boom "…"'))).toBe(true);
  await expect.poll(async () => (await logLines()).slice(before).some((l) => l.includes('] unhandledrejection: Error: rejected boom'))).toBe(true);
  expect((await logLines()).join('\n')).not.toContain('2x+3');
});
