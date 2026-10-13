import { describe, it, expect } from 'vitest';
import { oneVarStats } from '../../src/core/math/graphing';

describe('graphing tool: one-variable statistics (L6)', () => {
  it('mean, median, SD, five-number summary and IQR of a typed list (course conventions)', () => {
    const { stats, bad } = oneVarStats('2, 4, 4, 4, 5, 5, 7, 9');
    expect(bad).toEqual([]);
    expect(stats!.n).toBe(8);
    expect(stats!.mean).toBe(5);
    expect(stats!.sd).toBe(2); // population σx
    expect(stats!.sampleSd).toBeCloseTo(2.13809, 4);
    expect([stats!.min, stats!.q1, stats!.median, stats!.q3, stats!.max]).toEqual([2, 4, 4.5, 6, 9]);
    expect(stats!.iqr).toBe(2);
  });
  it('odd count: the median is left out of both halves', () => {
    const { stats } = oneVarStats('1\n3\n5\n7\n9\n11\n13');
    expect([stats!.q1, stats!.median, stats!.q3]).toEqual([3, 7, 11]);
  });
  it('unreadable entries are reported, and quartiles need four values', () => {
    const r = oneVarStats('3 x 5; 7');
    expect(r.bad).toEqual(['x']);
    expect(r.stats!.n).toBe(3);
    expect(r.stats!.q1).toBeNull();
    expect(r.stats!.median).toBe(5);
    expect(oneVarStats('').stats).toBeNull();
  });
  it('exact arithmetic: decimals do not drift', () => {
    expect(oneVarStats('0.1, 0.2, 0.3').stats!.mean).toBe(0.2);
  });
});
