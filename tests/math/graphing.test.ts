/** The graphing tool's math: reading input, tables, points of interest, intersections, regression. */
import { parseGraphInput, pointsOfInterest, intersections, linearRegression, parseData, tableOfValues, fmt } from '../../src/core/math/graphing';

function fn(s: string) {
  const e = parseGraphInput(s);
  if (e.kind !== 'function') throw new Error(`${s}: ${JSON.stringify(e)}`);
  return e.ast;
}

describe('graphing tool', () => {
  it('reads functions, inequalities and vertical lines', () => {
    expect(parseGraphInput('y = 2x + 1').kind).toBe('function');
    expect(parseGraphInput('f(x) = x^2 - 4').kind).toBe('function');
    expect(parseGraphInput('3(0.5)^x').kind).toBe('function');
    expect(parseGraphInput('  ').kind).toBe('empty');
    expect(parseGraphInput('y >= -x + 3')).toMatchObject({ kind: 'inequality', side: 'above', strict: false });
    expect(parseGraphInput('y < 2x')).toMatchObject({ kind: 'inequality', side: 'below', strict: true });
    expect(parseGraphInput('y ≤ 4')).toMatchObject({ kind: 'inequality', side: 'below', strict: false });
    expect(parseGraphInput('x = 3')).toMatchObject({ kind: 'vertical', x: 3 });
    expect(parseGraphInput('x > -2')).toMatchObject({ kind: 'vertical', x: -2, side: 'right', strict: true });
    expect(parseGraphInput('y = 2t').kind).toBe('error');
    expect(parseGraphInput('y = 2x +').kind).toBe('error');
    expect(parseGraphInput('2y = x').kind).toBe('error');
  });

  it('tables of values', () => {
    expect(tableOfValues(fn('x^2'), -2, 1, 5).map((r) => r.y)).toEqual([4, 1, 0, 1, 4]);
    expect(tableOfValues(fn('2^x'), 0, 0.5, 3).map((r) => fmt(r.y))).toEqual(['1', '1.4142', '2']);
  });

  it('finds zeros, the y-intercept and turning points', () => {
    const q = pointsOfInterest(fn('x^2 - 2x - 3'), -10, 10);
    expect(q.filter((p) => p.kind === 'zero').map((p) => p.x)).toEqual([-1, 3]);
    expect(q.find((p) => p.kind === 'y-intercept')!.y).toBe(-3);
    const mn = q.find((p) => p.kind === 'minimum')!;
    expect(mn.x).toBeCloseTo(1, 6);
    expect(mn.y).toBeCloseTo(-4, 6);
    const h = pointsOfInterest(fn('-16x^2 + 48x + 4'), 0, 4);
    const mx = h.find((p) => p.kind === 'maximum')!;
    expect(mx.x).toBeCloseTo(1.5, 6);
    expect(mx.y).toBeCloseTo(40, 6);
    expect(h.find((p) => p.kind === 'zero')!.x).toBeCloseTo((48 + Math.sqrt(48 * 48 + 256)) / 32, 6);
    // a corner is a turning point; a double root is found; no false zero across a jump
    expect(pointsOfInterest(fn('abs(x - 2) - 1'), -10, 10).find((p) => p.kind === 'minimum')!.x).toBeCloseTo(2, 5);
    expect(pointsOfInterest(fn('(x-1)^2'), -10, 10).some((p) => p.kind === 'zero' && Math.abs(p.x - 1) < 1e-6)).toBe(true);
    expect(pointsOfInterest(fn('1/x'), -10, 10).filter((p) => p.kind === 'zero')).toEqual([]);
    // exponential: no zero, y-intercept a
    const e = pointsOfInterest(fn('3(2)^x'), -10, 10);
    expect(e.filter((p) => p.kind === 'zero')).toEqual([]);
    expect(e.find((p) => p.kind === 'y-intercept')!.y).toBe(3);
  });

  it('finds intersections (solving a system)', () => {
    const pts = intersections(fn('2x + 1'), fn('-x + 7'), -10, 10);
    expect(pts).toHaveLength(1);
    expect(pts[0].x).toBe(2);
    expect(pts[0].y).toBe(5);
    const two = intersections(fn('x^2'), fn('x + 2'), -10, 10).map((p) => p.x);
    expect(two).toEqual([-1, 2]);
  });

  it('line of best fit matches the least-squares formulas', () => {
    const { points, bad } = parseData('1, 3\n2 5\n(3, 6)\n4,9\n5,10\n6,12\noops');
    expect(bad).toEqual([7]);
    const r = linearRegression(points)!;
    // hand check: x̄ = 3.5, ȳ = 7.5, Sxx = 17.5, Sxy = 31.5, Syy = 57.5
    expect(r.m).toBeCloseTo(31.5 / 17.5, 10);
    expect(r.b).toBeCloseTo(7.5 - (31.5 / 17.5) * 3.5, 10);
    expect(r.r).toBeCloseTo(31.5 / Math.sqrt(17.5 * 57.5), 10);
    expect(fmt(r.m)).toBe("1.8");
    expect(linearRegression([{ x: 1, y: 1 }])).toBeNull();
    expect(linearRegression([{ x: 1, y: 1 }, { x: 1, y: 2 }])).toBeNull();
  });
});
