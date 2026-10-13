/**
 * Entering answers in end-to-end tests: typed answers go in the answer box; a graph answer (the
 * oracle gives its JSON) is drawn on the grid the way a student would: labels typed, scales chosen,
 * points placed with the keyboard (arrow keys + Enter) or the mouse.
 */
import type { Locator } from '@playwright/test';

interface Drawing {
  p: Array<[number, number]>;
  xs?: string;
  ys?: string;
  xl?: string;
  yl?: string;
  bd?: 'solid' | 'dashed';
  sh?: 'above' | 'below';
}

// the grid's drawing constants (GraphInput.tsx)
const CELL = 34;
const PAD_L = 56;
const PAD_T = 14;
const PAD_R = 14;
const PAD_B = 44;

async function gridSize(grid: Locator): Promise<{ cols: number; rows: number }> {
  const label = (await grid.getAttribute('aria-label')) ?? '';
  const m = /(\d+) squares across and (\d+) up/.exec(label);
  if (!m) throw new Error('graph grid has no size label');
  return { cols: Number(m[1]), rows: Number(m[2]) };
}

export async function drawGraph(art: Locator, d: Drawing, mode: 'keyboard' | 'mouse' = 'keyboard'): Promise<void> {
  const clear = art.getByRole('button', { name: 'Clear points' });
  if (await clear.count()) await clear.click();
  await art.getByTestId('graph-label-x').fill(d.xl ?? '');
  await art.getByTestId('graph-label-y').fill(d.yl ?? '');
  if (d.xs) await art.getByTestId('graph-scale-x').selectOption(d.xs);
  if (d.ys) await art.getByTestId('graph-scale-y').selectOption(d.ys);
  if (d.bd) await art.getByTestId(`graph-boundary-${d.bd}`).check();
  if (d.sh) await art.getByTestId(`graph-shade-${d.sh}`).check();
  const grid = art.getByTestId('graph-grid');
  const { cols, rows } = await gridSize(grid);
  if (mode === 'keyboard') {
    await grid.focus();
    // back to the origin, whatever the cursor's position (the cursor stops at the edges)
    for (let i = 0; i < cols; i++) await grid.press('ArrowLeft');
    for (let i = 0; i < rows; i++) await grid.press('ArrowDown');
    let cx = 0;
    let cy = 0;
    for (const [gx, gy] of d.p) {
      while (cx < gx) (await grid.press('ArrowRight'), cx++);
      while (cx > gx) (await grid.press('ArrowLeft'), cx--);
      while (cy < gy) (await grid.press('ArrowUp'), cy++);
      while (cy > gy) (await grid.press('ArrowDown'), cy--);
      await grid.press('Enter');
    }
  } else {
    const box = (await grid.boundingBox())!;
    const W = PAD_L + cols * CELL + PAD_R;
    const H = PAD_T + rows * CELL + PAD_B;
    for (const [gx, gy] of d.p) {
      await grid.click({ position: { x: ((PAD_L + gx * CELL) * box.width) / W, y: ((PAD_T + (rows - gy) * CELL) * box.height) / H } });
    }
  }
}

/** Type a value in the answer box, or draw it when the problem asks for a graph (a non-graph value draws one point, an unfinished graph). */
export async function fillAnswer(art: Locator, value: string): Promise<void> {
  if (await art.getByTestId('graph-grid').count()) {
    let d: Drawing | null = null;
    try {
      d = JSON.parse(value);
    } catch {
      d = null;
    }
    await drawGraph(art, d && Array.isArray(d.p) ? d : { p: [[0, 0]] });
    return;
  }
  await art.locator('input.answer-input').fill(value);
}
