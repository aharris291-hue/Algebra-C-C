/**
 * The in-app graphing tool's math (spec: Georgia ESL asks students to use interactive graphing
 * technology): reading what a student types, tables of values, points of interest (zeros,
 * turning points, y-intercept), intersections, and the least-squares line of best fit.
 * Everything is numeric and approximate (like a graphing calculator), never used for grading.
 */
import { parseExpression, variablesOf, Node } from './parser';
import { evalNumeric } from './evaluate';

export type GraphEntry =
  | { kind: 'function'; expr: string; ast: Node }
  | { kind: 'inequality'; expr: string; ast: Node; side: 'above' | 'below'; strict: boolean }
  | { kind: 'vertical'; x: number; side?: 'left' | 'right'; strict?: boolean }
  | { kind: 'empty' }
  | { kind: 'error'; message: string };

const OPS: Array<[string, 'above' | 'below' | 'eq', boolean]> = [
  ['>=', 'above', false],
  ['<=', 'below', false],
  ['≥', 'above', false],
  ['≤', 'below', false],
  ['>', 'above', true],
  ['<', 'below', true],
  ['=', 'eq', false],
];

function clean(s: string): string {
  return s.replace(/−/g, '-').replace(/\s+/g, ' ').trim();
}

/** Read one line typed into the graphing tool: "y = 2x + 1", "f(x) = x^2", "2^x", "y >= -x + 3", "x = 4". */
export function parseGraphInput(raw: string): GraphEntry {
  const s = clean(raw);
  if (!s) return { kind: 'empty' };
  for (const [op, side, strict] of OPS) {
    const i = s.indexOf(op);
    if (i < 0) continue;
    const lhs = s.slice(0, i).trim();
    const rhs = s.slice(i + op.length).trim();
    if (!rhs) return { kind: 'error', message: 'Type something after the sign.' };
    if (/^(y|[a-z]\s*\(\s*x\s*\))$/i.test(lhs)) {
      const ast = tryParse(rhs);
      if ('message' in ast) return { kind: 'error', message: ast.message };
      if (side === 'eq') return { kind: 'function', expr: rhs, ast: ast.ast };
      return { kind: 'inequality', expr: rhs, ast: ast.ast, side, strict };
    }
    if (/^x$/i.test(lhs)) {
      const v = tryParse(rhs);
      if ('message' in v) return { kind: 'error', message: v.message };
      if (variablesOf(v.ast).size) return { kind: 'error', message: 'For a vertical line, type x = a number, like x = 3.' };
      const x = evalNumeric(v.ast);
      if (side === 'eq') return { kind: 'vertical', x };
      return { kind: 'vertical', x, side: side === 'above' ? 'right' : 'left', strict };
    }
    return { kind: 'error', message: 'Start with y = (or y >, y ≤ …), or x = for a vertical line.' };
  }
  const ast = tryParse(s);
  if ('message' in ast) return { kind: 'error', message: ast.message };
  return { kind: 'function', expr: s, ast: ast.ast };
}

function tryParse(src: string): { ast: Node } | { message: string } {
  try {
    const ast = parseExpression(src);
    const extra = [...variablesOf(ast)].filter((v) => v !== 'x');
    if (extra.length) return { message: `Use x as the variable (I see ${extra.join(', ')}).` };
    return { ast };
  } catch (e) {
    return { message: (e as Error).message || 'That could not be read.' };
  }
}

export function valueAt(ast: Node, x: number): number {
  try {
    const y = evalNumeric(ast, { x });
    return Number.isFinite(y) ? y : NaN;
  } catch {
    return NaN;
  }
}

/** Round for display like a calculator (at most 4 decimals, no -0). */
export function fmt(n: number): string {
  if (!Number.isFinite(n)) return 'undefined';
  const r = Math.round(n * 10000) / 10000;
  return String(Object.is(r, -0) ? 0 : r);
}

export function tableOfValues(ast: Node, start: number, step: number, rows = 8): Array<{ x: number; y: number }> {
  const out: Array<{ x: number; y: number }> = [];
  for (let i = 0; i < rows; i++) {
    const x = +(start + i * step).toFixed(10);
    out.push({ x, y: valueAt(ast, x) });
  }
  return out;
}

function bisect(f: (x: number) => number, a: number, b: number): number {
  let fa = f(a);
  for (let i = 0; i < 80; i++) {
    const m = (a + b) / 2;
    const fm = f(m);
    if (fm === 0) return m;
    if (Math.sign(fm) === Math.sign(fa)) {
      a = m;
      fa = fm;
    } else b = m;
  }
  return (a + b) / 2;
}

/** x-values in [lo, hi] where f crosses or touches 0 (sampled, then refined). */
function roots(f: (x: number) => number, lo: number, hi: number, n = 2000): number[] {
  const out: number[] = [];
  const h = (hi - lo) / n;
  let px = lo;
  let py = f(lo);
  for (let i = 1; i <= n; i++) {
    const x = lo + i * h;
    const y = f(x);
    if (Number.isFinite(py) && Number.isFinite(y)) {
      if (py === 0) out.push(px);
      else if (Math.sign(py) !== Math.sign(y) && y !== 0) {
        // a sign change across a jump (like 1/x) is not a root
        const r = bisect(f, px, x);
        if (Math.abs(f(r)) < 1e-6 * Math.max(1, Math.abs(py), Math.abs(y))) out.push(r);
      }
    }
    px = x;
    py = y;
  }
  if (Number.isFinite(py) && py === 0) out.push(px);
  return dedupe(out, h);
}

function dedupe(xs: number[], tol: number): number[] {
  const out: number[] = [];
  for (const x of xs.sort((a, b) => a - b)) if (!out.length || Math.abs(x - out[out.length - 1]) > tol * 1.5) out.push(x);
  return out;
}

export interface PointOfInterest {
  kind: 'zero' | 'y-intercept' | 'maximum' | 'minimum' | 'intersection';
  x: number;
  y: number;
}

/** Zeros, the y-intercept and turning points of one function inside the window. */
export function pointsOfInterest(ast: Node, xMin: number, xMax: number): PointOfInterest[] {
  const f = (x: number) => valueAt(ast, x);
  const out: PointOfInterest[] = [];
  for (const x of roots(f, xMin, xMax)) out.push({ kind: 'zero', x: snap(x), y: 0 });
  if (xMin <= 0 && xMax >= 0 && Number.isFinite(f(0))) out.push({ kind: 'y-intercept', x: 0, y: f(0) });
  // turning points: sign changes of the slope, refined by golden-section search
  const n = 1000;
  const h = (xMax - xMin) / n;
  let prev = f(xMin + h) - f(xMin);
  for (let i = 1; i < n; i++) {
    const x = xMin + i * h;
    const d = f(x + h) - f(x);
    if (Number.isFinite(prev) && Number.isFinite(d) && prev !== 0 && d !== 0 && Math.sign(prev) !== Math.sign(d)) {
      const isMax = prev > 0;
      const xe = golden((t) => (isMax ? -f(t) : f(t)), x - h, x + h);
      const ye = f(xe);
      // a corner like |x| is a turning point too; a jump (vertical asymptote) is not
      if (Number.isFinite(ye) && Math.abs(ye - f(x)) < Math.abs(prev) * 4 + 1e-9) out.push({ kind: isMax ? 'maximum' : 'minimum', x: snap(xe), y: ye });
    }
    if (d !== 0) prev = d;
  }
  return out;
}

function golden(f: (x: number) => number, a: number, b: number): number {
  const g = (Math.sqrt(5) - 1) / 2;
  let c = b - g * (b - a);
  let d = a + g * (b - a);
  for (let i = 0; i < 100; i++) {
    if (f(c) < f(d)) b = d;
    else a = c;
    c = b - g * (b - a);
    d = a + g * (b - a);
  }
  return (a + b) / 2;
}

/** Values within 1e-7 of a "nice" number (integer or hundredth) show as that number. */
function snap(x: number): number {
  const r = Math.round(x * 100) / 100;
  return Math.abs(r - x) < 1e-7 ? r : x;
}

export function intersections(a: Node, b: Node, xMin: number, xMax: number): PointOfInterest[] {
  const fa = (x: number) => valueAt(a, x);
  return roots((x) => fa(x) - valueAt(b, x), xMin, xMax).map((x) => ({ kind: 'intersection' as const, x: snap(x), y: fa(snap(x)) }));
}

/** Read data typed as lines of "x, y" (or "x y"). Returns the points and any lines that could not be read. */
export function parseData(text: string): { points: Array<{ x: number; y: number }>; bad: number[] } {
  const points: Array<{ x: number; y: number }> = [];
  const bad: number[] = [];
  text.split(/\r?\n/).forEach((line, i) => {
    const t = line.trim();
    if (!t) return;
    const parts = t.replace(/[()]/g, '').split(/[,;\t ]+/).filter(Boolean);
    const nums = parts.map(Number);
    if (nums.length === 2 && nums.every(Number.isFinite)) points.push({ x: nums[0], y: nums[1] });
    else bad.push(i + 1);
  });
  return { points, bad };
}

/** Least-squares line y = mx + b with the correlation coefficient r (what LinReg(ax+b) reports). */
export function linearRegression(pts: Array<{ x: number; y: number }>): { m: number; b: number; r: number } | null {
  const n = pts.length;
  if (n < 2) return null;
  const mx = pts.reduce((s, p) => s + p.x, 0) / n;
  const my = pts.reduce((s, p) => s + p.y, 0) / n;
  let sxx = 0;
  let syy = 0;
  let sxy = 0;
  for (const p of pts) {
    sxx += (p.x - mx) ** 2;
    syy += (p.y - my) ** 2;
    sxy += (p.x - mx) * (p.y - my);
  }
  if (sxx === 0) return null;
  const m = sxy / sxx;
  return { m, b: my - m * mx, r: syy === 0 ? NaN : sxy / Math.sqrt(sxx * syy) };
}
