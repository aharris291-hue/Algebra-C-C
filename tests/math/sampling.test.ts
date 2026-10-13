import { describe, it, expect } from 'vitest';
import { checkAnswer } from '../../src/core/math/answers';

const st = (spec: Parameters<typeof checkAnswer>[0], input: string) => checkAnswer(spec, input, []).status;

describe('numeric equivalence sampling (L2)', () => {
  it('includes negative inputs where both sides are defined', () => {
    expect(st({ kind: 'expression', value: 'sqrt(x^2)' }, 'x')).toBe('incorrect');
    expect(st({ kind: 'expression', value: 'x' }, 'sqrt(x^2)')).toBe('incorrect');
    expect(st({ kind: 'expression', value: 'abs(x)' }, 'sqrt(x^2)')).toBe('correct');
  });
  it('keeps the course convention in a simplify-the-radical question', () => {
    expect(st({ kind: 'expression', value: 'x', form: 'simplified-radical' }, 'sqrt(x^2)')).toBe('wrong-form');
    expect(st({ kind: 'expression', value: 'x^2*sqrt(x)', form: 'simplified-radical' }, 'sqrt(x^5)')).toBe('wrong-form');
    expect(st({ kind: 'expression', value: '2*x*sqrt(2)', form: 'simplified-radical' }, '2x√2')).toBe('correct');
    expect(st({ kind: 'expression', value: 'x*sqrt(x)' }, 'sqrt(x^3)')).toBe('correct');
    expect(st({ kind: 'expression', value: 'x^2*sqrt(x)' }, 'x^(5/2)')).toBe('correct');
  });
  it('a tiny added constant is not equivalent; true identities still are', () => {
    expect(st({ kind: 'expression', value: '2^x' }, '2^x+0.0000000001')).toBe('incorrect');
    expect(st({ kind: 'expression', value: '3*2^x' }, '6*2^(x-1)')).toBe('correct');
    expect(st({ kind: 'expression', value: '1000*1.02^(12*t)' }, '1000*(1.02^12)^t')).toBe('correct');
    expect(st({ kind: 'expression', value: '(x^2-1)/(x-1)' }, 'x+1')).not.toBe('incorrect');
    expect(st({ kind: 'expression', value: '5*(1/2)^x' }, '5*2^(-x)')).toBe('correct');
  });
  it('an exact irrational value on a "round to the nearest tenth" item asks for rounding', () => {
    const r = checkAnswer({ kind: 'number', value: '7.8', roundTo: 1 }, '√61', []);
    expect(r.status).toBe('wrong-form');
    expect(r.message).toMatch(/round/i);
    // a different exact value is still just wrong
    expect(st({ kind: 'number', value: '7.8', roundTo: 1 }, '√70')).toBe('incorrect');
    expect(st({ kind: 'number', value: '7.8', roundTo: 1 }, '7.8')).toBe('correct');
    expect(st({ kind: 'number', value: '7.8', roundTo: 1 }, '7.81')).toBe('correct');
  });
});
