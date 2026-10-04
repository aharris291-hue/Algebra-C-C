import { Rational } from '../../src/core/math/rational';
import { parseExpression } from '../../src/core/math/parser';
import { toPoly, Poly } from '../../src/core/math/poly';
import { toSurd, Surd } from '../../src/core/math/surd';
import { checkAnswer, AnswerSpec, parseInterval, intervalsEqual, isCompletelyFactored, isVertexForm, isExpandedForm } from '../../src/core/math/answers';
import { polyTex, linearTex, quadTex, vertexFormTex, polyPlain } from '../../src/core/math/format';

const st = (spec: AnswerSpec, input: string) => checkAnswer(spec, input).status;

describe('Rational', () => {
  it('reduces and normalizes sign', () => {
    expect(Rational.of(4, -6).toString()).toBe('-2/3');
    expect(Rational.parse('0.75').toString()).toBe('3/4');
    expect(Rational.parse('-.5').toString()).toBe('-1/2');
    expect(Rational.parse('6/8').toString()).toBe('3/4');
  });
  it('arithmetic is exact', () => {
    const a = Rational.parse('0.1').add(Rational.parse('0.2'));
    expect(a.eq(Rational.parse('0.3'))).toBe(true);
    expect(Rational.of(2, 3).pow(-2).toString()).toBe('9/4');
  });
  it('rounds half away from zero', () => {
    expect(Rational.parse('2.345').round(2).toString()).toBe(Rational.parse('2.35').toString());
    expect(Rational.parse('-2.345').round(2).toString()).toBe(Rational.parse('-2.35').toString());
    expect(Rational.of(1, 3).round(3).toDecimalString()).toBe('0.333');
    expect(Rational.of(2, 3).toDecimalString(4)).toBe('0.6667');
  });
  it('floor works for negatives', () => {
    expect(Rational.of(-7, 2).floor()).toBe(-4n);
    expect(Rational.of(7, 2).floor()).toBe(3n);
  });
});

describe('parser', () => {
  const p = (s: string) => toPoly(parseExpression(s));
  it('implicit multiplication and precedence', () => {
    expect(p('2x+3').equals(Poly.fromCoeffs('x', [3, 2]))).toBe(true);
    expect(p('-x^2').equals(Poly.fromCoeffs('x', [0, 0, -1]))).toBe(true);
    expect(p('3(x-1)^2').equals(Poly.fromCoeffs('x', [3, -6, 3]))).toBe(true);
    expect(p('(x+2)(x-5)').equals(Poly.fromCoeffs('x', [-10, -3, 1]))).toBe(true);
    expect(p('1/2x').equals(Poly.fromCoeffs('x', [0, Rational.of(1, 2)]))).toBe(true);
    expect(p('2^3x').equals(Poly.fromCoeffs('x', [0, 8]))).toBe(true);
    expect(p('x·2 − 4').equals(Poly.fromCoeffs('x', [-4, 2]))).toBe(true);
    expect(p('x²+1').equals(Poly.fromCoeffs('x', [1, 0, 1]))).toBe(true);
    expect(p('3*-2').constantValue().toString()).toBe('-6');
    expect(p('2^-1').constantValue().toString()).toBe('1/2');
  });
  it('rejects ambiguous or broken input with friendly messages', () => {
    expect(() => parseExpression('x2')).toThrow(/\^/);
    expect(() => parseExpression('(x+1')).toThrow(/never closed/);
    expect(() => parseExpression('x+')).toThrow();
    expect(() => parseExpression('2 3')).toThrow(/Two numbers/);
    expect(() => parseExpression('')).toThrow();
    expect(() => parseExpression('3 $ 4')).toThrow();
  });
});

describe('surds', () => {
  const s = (x: string) => toSurd(parseExpression(x));
  it('simplifies square and cube roots', () => {
    expect(s('sqrt(50)').equals(s('5√2'))).toBe(true);
    expect(s('√72').toPlain()).toBe('6√2');
    expect(s('cbrt(54)').toPlain()).toBe('3∛2');
    expect(s('∛(-16)').toPlain()).toBe('-2∛2');
    expect(s('√(9/4)').toPlain()).toBe('3/2');
    expect(s('√(1/2)').equals(s('√2/2'))).toBe(true);
  });
  it('adds and multiplies', () => {
    expect(s('3√2 + 5√2').equals(s('8√2'))).toBe(true);
    expect(s('√12 + √27').equals(s('5√3'))).toBe(true);
    expect(s('√6 * √3').equals(s('3√2'))).toBe(true);
    expect(s('(2+√3)(2-√3)').equals(Surd.rational(1))).toBe(true);
    expect(s('(1+√2)^2').equals(s('3 + 2√2'))).toBe(true);
    expect(s('6/√3').equals(s('2√3'))).toBe(true);
  });
  it('distinguishes rational from irrational', () => {
    expect(s('√2 * √8').isRational()).toBe(true);
    expect(s('√2 + 1').isRational()).toBe(false);
  });
});

describe('formatting', () => {
  it('handles coefficient and sign edge cases', () => {
    expect(linearTex(1, 0)).toBe('x');
    expect(linearTex(-1, 3)).toBe('-x + 3');
    expect(linearTex(2, -5)).toBe('2x - 5');
    expect(linearTex(0, -5)).toBe('-5');
    expect(linearTex(Rational.of(-1, 2), 0)).toBe('-\\frac{1}{2}x');
    expect(quadTex(1, 0, -9)).toBe('x^{2} - 9');
    expect(quadTex(-2, 1, 0)).toBe('-2x^{2} + x');
    expect(vertexFormTex(1, 3, -2)).toBe('(x - 3)^{2} - 2');
    expect(vertexFormTex(-2, -1, 0)).toBe('-2(x + 1)^{2}');
    expect(vertexFormTex(1, 0, 4)).toBe('x^{2} + 4');
    expect(polyTex(Poly.const(0))).toBe('0');
  });
  it('plain output parses back to the same polynomial', () => {
    for (const coeffs of [[3, -2, 1], [0, Rational.of(1, 2)], [-7], [0, 0, -1], [Rational.of(-3, 4), 5, 2]]) {
      const pl = Poly.fromCoeffs('x', coeffs as never);
      expect(toPoly(parseExpression(polyPlain(pl))).equals(pl)).toBe(true);
    }
  });
});

describe('checkAnswer: numbers', () => {
  const spec: AnswerSpec = { kind: 'number', value: '-7/2' };
  it('accepts equivalent number formats', () => {
    expect(st(spec, '-7/2')).toBe('correct');
    expect(st(spec, '-3.5')).toBe('correct');
    expect(st(spec, '-3 1/2')).toBe('correct');
    expect(st(spec, '−3.50')).toBe('correct');
    expect(st(spec, '7/-2')).toBe('correct');
    expect(st(spec, '-14/4')).toBe('correct');
  });
  it('flags unsimplified expressions and wrong values', () => {
    expect(st(spec, '-7/2 + 0')).toBe('wrong-form');
    expect(st(spec, '3.5')).toBe('incorrect');
    expect(st(spec, 'x')).toBe('invalid');
    expect(st(spec, '')).toBe('invalid');
  });
  it('handles repeating decimals and rounding', () => {
    expect(checkAnswer({ kind: 'number', value: '1/3' }, '0.33').message).toMatch(/fraction/);
    expect(st({ kind: 'number', value: '1/3' }, '1/3')).toBe('correct');
    const r: AnswerSpec = { kind: 'number', value: '2/3', roundTo: 2 };
    expect(st(r, '0.67')).toBe('correct');
    expect(st(r, '0.66')).toBe('incorrect');
    expect(st(r, '2/3')).toBe('correct');
  });
  it('strips units and dollar signs', () => {
    expect(st({ kind: 'number', value: '45', unit: 'dollars' }, '$45')).toBe('correct');
    expect(st({ kind: 'number', value: '12' }, '12 ft')).toBe('correct');
  });
  it('applies misconception feedback', () => {
    const r = checkAnswer({ kind: 'number', value: '5' }, '-5', [{ answer: '-5', tag: 'sign-error', feedback: 'Check the sign.' }]);
    expect(r.status).toBe('incorrect');
    expect(r.misconception).toBe('sign-error');
    expect(r.message).toBe('Check the sign.');
  });
});

describe('checkAnswer: expressions and forms', () => {
  it('accepts any equivalent polynomial', () => {
    const spec: AnswerSpec = { kind: 'expression', value: 'x^2 - x - 6' };
    expect(st(spec, '(x-3)(x+2)')).toBe('correct');
    expect(st(spec, '-6 - x + x^2')).toBe('correct');
    expect(st(spec, 'x^2 + x - 6')).toBe('incorrect');
    expect(st(spec, 'y^2 - y - 6')).toBe('invalid');
  });
  it('expanded form', () => {
    const spec: AnswerSpec = { kind: 'expression', value: 'x^2 - x - 6', form: 'expanded' };
    expect(st(spec, 'x^2 - x - 6')).toBe('correct');
    expect(st(spec, '(x-3)(x+2)')).toBe('wrong-form');
    expect(st(spec, 'x^2 + 2x - 3x - 6')).toBe('wrong-form');
    expect(isExpandedForm(parseExpression('3x^2 - 2x + 1'))).toBe(true);
  });
  it('factored form', () => {
    const spec: AnswerSpec = { kind: 'expression', value: '2x^2 + 2x - 12', form: 'factored' };
    expect(st(spec, '2(x+3)(x-2)')).toBe('correct');
    expect(st(spec, '(2x+6)(x-2)')).toBe('wrong-form');
    expect(st(spec, '2x^2+2x-12')).toBe('wrong-form');
    expect(isCompletelyFactored(parseExpression('(x+3)^2'))).toBe(true);
    expect(isCompletelyFactored(parseExpression('x(x^2-4)'))).toBe(false);
    expect(isCompletelyFactored(parseExpression('(x^2+4)(x-1)'))).toBe(true);
    expect(isCompletelyFactored(parseExpression('(3x-2)(x+5)'))).toBe(true);
  });
  it('vertex form', () => {
    expect(isVertexForm(parseExpression('2(x-3)^2+1'))).toBe(true);
    expect(isVertexForm(parseExpression('-(x+4)^2'))).toBe(true);
    expect(isVertexForm(parseExpression('(x-1)^2 - 3 + 2'))).toBe(false);
    expect(isVertexForm(parseExpression('x^2 - 6x + 10'))).toBe(false);
    const spec: AnswerSpec = { kind: 'expression', value: 'x^2 - 6x + 10', form: 'vertex' };
    expect(st(spec, '(x-3)^2+1')).toBe('correct');
    expect(st(spec, 'x^2-6x+10')).toBe('wrong-form');
    expect(st(spec, '(x+3)^2+1')).toBe('incorrect');
  });
  it('simplified radicals', () => {
    const spec: AnswerSpec = { kind: 'expression', value: '5√2', form: 'simplified-radical' };
    expect(st(spec, '5√2')).toBe('correct');
    expect(st(spec, '5sqrt(2)')).toBe('correct');
    expect(st(spec, '√50')).toBe('wrong-form');
    expect(st(spec, '2√2 + 3√2')).toBe('wrong-form');
    expect(st(spec, '5√3')).toBe('incorrect');
    const s2: AnswerSpec = { kind: 'expression', value: '√6/3', form: 'simplified-radical' };
    expect(st(s2, '√6/3')).toBe('correct');
    expect(st(s2, '2/√6')).toBe('wrong-form');
    const s3: AnswerSpec = { kind: 'expression', value: '3 + 2√2', form: 'simplified-radical' };
    expect(st(s3, '2√2 + 3')).toBe('correct');
    expect(st(s3, '(1+√2)^2')).toBe('wrong-form'); // equal, but not multiplied out
  });
  it('algebraic radicals compare numerically', () => {
    const spec: AnswerSpec = { kind: 'expression', value: '3x√2' };
    expect(st(spec, '√(18x^2)')).toBe('correct');
  });
});

describe('checkAnswer: equations and inequalities', () => {
  it('linear equations in any equivalent form', () => {
    const spec: AnswerSpec = { kind: 'equation', value: 'y = 2x + 3' };
    expect(st(spec, 'y=2x+3')).toBe('correct');
    expect(st(spec, '2x - y = -3')).toBe('correct');
    expect(st(spec, 'y - 5 = 2(x - 1)')).toBe('correct');
    expect(st(spec, 'f(x) = 2x + 3')).toBe('correct');
    expect(st(spec, '2x+3')).toBe('correct');
    expect(st(spec, 'y = 3x + 2')).toBe('incorrect');
  });
  it('enforces requested equation forms', () => {
    const si: AnswerSpec = { kind: 'equation', value: 'y = 2x + 3', form: 'slope-intercept' };
    expect(st(si, 'y = 2x + 3')).toBe('correct');
    expect(st(si, 'y = 3 + 2x')).toBe('correct');
    expect(st(si, '2x - y = -3')).toBe('wrong-form');
    const sf: AnswerSpec = { kind: 'equation', value: 'y = 2x + 3', form: 'standard' };
    expect(st(sf, '2x - y = -3')).toBe('correct');
    expect(st(sf, '-2x + y = 3')).toBe('correct');
    expect(st(sf, 'y = 2x + 3')).toBe('wrong-form');
    const ps: AnswerSpec = { kind: 'equation', value: 'y = 2x + 3', form: 'point-slope' };
    expect(st(ps, 'y - 5 = 2(x - 1)')).toBe('correct');
    expect(st(ps, 'y - 7 = 2(x - 2)')).toBe('correct');
    expect(st(ps, 'y = 2x + 3')).toBe('wrong-form');
  });
  it('exponential equations compare as functions', () => {
    const spec: AnswerSpec = { kind: 'equation', value: 'y = 3(2)^x' };
    expect(st(spec, 'y = 3*2^x')).toBe('correct');
    expect(st(spec, 'y = 6^x')).toBe('incorrect');
  });
  it('inequalities: half-plane equivalence and direction', () => {
    const spec: AnswerSpec = { kind: 'inequality', value: 'y > 2x - 1' };
    expect(st(spec, 'y > 2x - 1')).toBe('correct');
    expect(st(spec, '2x - y < 1')).toBe('correct');
    expect(st(spec, '-2x + y > -1')).toBe('correct');
    expect(checkAnswer(spec, 'y < 2x - 1').misconception).toBe('inequality-direction');
    expect(checkAnswer(spec, 'y >= 2x - 1').misconception).toBe('boundary-line');
    expect(st(spec, 'y > 2x + 1')).toBe('incorrect');
  });
});

describe('checkAnswer: points, solutions, intervals', () => {
  it('ordered pairs', () => {
    const spec: AnswerSpec = { kind: 'point', x: '3', y: '-2' };
    expect(st(spec, '(3, -2)')).toBe('correct');
    expect(st(spec, '3,-2')).toBe('correct');
    expect(st(spec, '(6/2, -2.0)')).toBe('correct');
    expect(checkAnswer(spec, '(-2, 3)').misconception).toBe('graph-reading');
    expect(st(spec, '(3)')).toBe('invalid');
  });
  it('solution sets with ±, order-independent, missing solution', () => {
    const spec: AnswerSpec = { kind: 'solutions', values: ['3', '-2'] };
    expect(st(spec, 'x = 3 or x = -2')).toBe('correct');
    expect(st(spec, '-2, 3')).toBe('correct');
    expect(st(spec, '{-2, 3}')).toBe('correct');
    expect(checkAnswer(spec, 'x = 3').misconception).toBe('missing-solution');
    expect(st(spec, '3, 2')).toBe('incorrect');
    const pm: AnswerSpec = { kind: 'solutions', values: ['1 + √5', '1 - √5'] };
    expect(st(pm, 'x = 1 ± √5')).toBe('correct');
    expect(st(pm, '1+-sqrt(5)')).toBe('correct');
    expect(st(pm, '(2 ± √20)/2')).toBe('correct');
    const none: AnswerSpec = { kind: 'solutions', values: [] };
    expect(st(none, 'no real solutions')).toBe('correct');
    expect(st(none, 'x = 0')).toBe('incorrect');
    const dbl: AnswerSpec = { kind: 'solutions', values: ['4', '4'] };
    expect(st(dbl, 'x = 4')).toBe('correct');
    const rounded: AnswerSpec = { kind: 'solutions', values: ['1 + √5', '1 - √5'], roundTo: 2 };
    expect(st(rounded, '3.24, -1.24')).toBe('correct');
    expect(st(rounded, '3.23, -1.24')).toBe('incorrect');
  });
  it('intervals in every notation', () => {
    const spec: AnswerSpec = { kind: 'interval', value: '[0, ∞)' };
    expect(st(spec, '[0, inf)')).toBe('correct');
    expect(st(spec, '{x | x >= 0}')).toBe('correct');
    expect(st(spec, 'x ≥ 0')).toBe('correct');
    expect(st(spec, '0 <= x')).toBe('correct');
    expect(checkAnswer(spec, '(0, ∞)').misconception).toBe('interval-endpoint');
    expect(st(spec, '[0, ∞]')).toBe('invalid');
    const all: AnswerSpec = { kind: 'interval', value: '(-∞, ∞)' };
    expect(st(all, 'all real numbers')).toBe('correct');
    expect(st(all, '{x | x ∈ ℝ}')).toBe('correct');
    const b: AnswerSpec = { kind: 'interval', value: '[-2, 5)' };
    expect(st(b, '-2 <= x < 5')).toBe('correct');
    expect(intervalsEqual(parseInterval('{y | y < 1/2}'), parseInterval('(-inf, 0.5)'))).toBe(true);
  });
  it('sequence terms', () => {
    const spec: AnswerSpec = { kind: 'sequence-terms', values: ['7', '9', '11'] };
    expect(st(spec, '7, 9, 11')).toBe('correct');
    expect(st(spec, '7, 9')).toBe('invalid');
    expect(st(spec, '7, 9, 12')).toBe('incorrect');
  });
});

describe('absolute value is not confused with its argument', () => {
  it('|x| is not equivalent to x', () => {
    expect(st({ kind: 'expression', value: 'abs(x)' }, 'x')).toBe('incorrect');
    expect(st({ kind: 'expression', value: 'abs(x)' }, '|x|')).toBe('correct');
  });
});
