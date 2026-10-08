import { Rational } from '../../src/core/math/rational';
import { parseExpression } from '../../src/core/math/parser';
import { toPoly, Poly } from '../../src/core/math/poly';
import { toSurd, Surd } from '../../src/core/math/surd';
import { checkAnswer, AnswerSpec, parseInterval, intervalsEqual, isCompletelyFactored, isVertexForm, isExpandedForm } from '../../src/core/math/answers';
import { fiveNumber, iqr, stdDev, variance, outliers, linearRegression } from '../../src/core/math/stats';
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
  it('inequalities: one variable, other variables named, flipped forms', () => {
    const one: AnswerSpec = { kind: 'inequality', value: 'x >= -7/2' };
    expect(st(one, 'x >= -3.5')).toBe('correct');
    expect(st(one, '-3.5 <= x')).toBe('correct');
    expect(checkAnswer(one, 'x <= -7/2').misconception).toBe('inequality-direction');
    expect(st(one, 'x = -7/2')).toBe('invalid');
    const two: AnswerSpec = { kind: 'inequality', value: '3x + 5y <= 60' };
    expect(st(two, 'y <= -3/5x + 12')).toBe('correct');
    expect(st(two, '60 >= 5y + 3x')).toBe('correct');
    expect(st(two, '3a + 5b <= 60')).toBe('invalid'); // wrong variable names get a message, not a wrong mark
  });
  it('region points: any point satisfying every constraint is correct', () => {
    const spec: AnswerSpec = { kind: 'region-point', constraints: ['y <= 2x + 1', 'y > -x + 3'], example: { x: '3', y: '2' } };
    expect(st(spec, '(3, 2)')).toBe('correct');
    expect(st(spec, '(5, 1/2)')).toBe('correct');
    expect(st(spec, '(1.5, 4)')).toBe('correct'); // on the solid boundary y = 2x + 1
    expect(st(spec, '(0, 3)')).toBe('incorrect'); // on the dashed boundary y = -x + 3
    expect(checkAnswer(spec, '(2, 7)').message).toMatch(/does not make/);
    expect(st(spec, '(2)')).toBe('invalid');
    const whole: AnswerSpec = { kind: 'region-point', constraints: ['x + y <= 10', 'x >= 0', 'y >= 0'], example: { x: '2', y: '3' }, wholeNumbers: true };
    expect(st(whole, '(2, 3)')).toBe('correct');
    expect(st(whole, '(2.5, 3)')).toBe('incorrect');
    expect(st(whole, '(11, 0)')).toBe('incorrect');
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

describe('Unit 3 radical input', () => {
  it('reads sqrt, cbrt and root inside letter runs', () => {
    const spec: AnswerSpec = { kind: 'expression', value: '3x^2sqrt(2x)', form: 'simplified-radical' };
    expect(checkAnswer(spec, '3x^2sqrt(2x)').status).toBe('correct');
    expect(checkAnswer(spec, '3x^2*sqrt(2x)').status).toBe('correct');
    expect(checkAnswer(spec, 'sqrt(18x^5)').status).toBe('wrong-form');
    const c: AnswerSpec = { kind: 'expression', value: '-3cbrt(18)', form: 'simplified-radical' };
    expect(checkAnswer(c, '-3cbrt(18)').status).toBe('correct');
    expect(checkAnswer(c, 'cbrt(-486)').status).toBe('wrong-form');
    expect(checkAnswer(c, '3cbrt(18)').status).toBe('incorrect');
  });
  it('a decimal approximation of an irrational answer gets a specific message', () => {
    const spec: AnswerSpec = { kind: 'expression', value: '6sqrt(2)', form: 'simplified-radical' };
    const r = checkAnswer(spec, '8.485');
    expect(r.status).toBe('incorrect');
    expect(r.message).toMatch(/approximation/);
    expect(checkAnswer(spec, '6sqrt(2)').status).toBe('correct');
    expect(checkAnswer(spec, 'sqrt(72)').status).toBe('wrong-form');
  });
});

describe('Unit 4 quadratic answers', () => {
  it('factored form means factored over the integers', () => {
    const spec: AnswerSpec = { kind: 'expression', value: '(2x+1)(x-3)', form: 'factored' };
    expect(checkAnswer(spec, '(x-3)(2x+1)').status).toBe('correct');
    expect(checkAnswer(spec, '2(x+0.5)(x-3)').status).toBe('wrong-form');
    expect(checkAnswer(spec, '2x^2-5x-3').status).toBe('wrong-form');
    const g: AnswerSpec = { kind: 'expression', value: '2(x+3)(x-1)', form: 'factored' };
    expect(checkAnswer(g, '(2x+6)(x-1)').status).toBe('wrong-form');
    expect(checkAnswer(g, '2(x-1)(x+3)').status).toBe('correct');
  });
  it('solution lists with ± and radicals; decimals for exact radical solutions are flagged', () => {
    const spec: AnswerSpec = { kind: 'solutions', values: ['(3+sqrt(17))/4', '(3-sqrt(17))/4'] };
    expect(checkAnswer(spec, '(3 ± sqrt(17))/4').status).toBe('correct');
    expect(checkAnswer(spec, 'x = (3+sqrt17)/4, (3-sqrt17)/4').status).toBe('correct');
    const r = checkAnswer(spec, '1.78, -0.28');
    expect(r.status).toBe('incorrect');
    expect(r.message).toMatch(/approximations/);
    expect(checkAnswer({ kind: 'solutions', values: [] }, 'no real solutions').status).toBe('correct');
    expect(checkAnswer({ kind: 'solutions', values: ['1.79', '-2.79'], roundTo: 2 }, '1.79, -2.79').status).toBe('correct');
  });
});

describe('Unit 5 exponent and exponential answers', () => {
  it('simplified exponent form: one coefficient, each variable once, positive exponents', () => {
    const spec: AnswerSpec = { kind: 'expression', value: 'x^5/y^5', form: 'exponent-simplified' };
    expect(st(spec, 'x^5/y^5')).toBe('correct');
    expect(st(spec, 'x^5 y^-5')).toBe('wrong-form');
    expect(st(spec, '(x/y)^5')).toBe('wrong-form');
    expect(st(spec, 'x^2x^3/y^5')).toBe('wrong-form');
    expect(st(spec, 'x^5/y^4')).toBe('incorrect');
    const frac: AnswerSpec = { kind: 'expression', value: '3a^2/(4b^3)', form: 'exponent-simplified' };
    expect(st(frac, '3a^2/(4b^3)')).toBe('correct');
    expect(st(frac, '(3/4)a^2/b^3')).toBe('correct');
    expect(st(frac, '6a^2/(8b^3)')).toBe('wrong-form');
    expect(st(frac, '3a^2b^0/(4b^3)')).toBe('wrong-form');
    const neg: AnswerSpec = { kind: 'expression', value: '-8x^6y^3', form: 'exponent-simplified' };
    expect(st(neg, '-8x^6y^3')).toBe('correct');
    expect(st(neg, '(-2x^2y)^3')).toBe('wrong-form');
    expect(st({ kind: 'expression', value: '1/(8x^6)', form: 'exponent-simplified' }, '8^-1 x^-6')).toBe('wrong-form');
  });
  it('exponential equations in the form y = a(b)^x', () => {
    const spec: AnswerSpec = { kind: 'equation', value: 'y = 200(1.05)^x', form: 'exponential' };
    for (const s of ['y=200(1.05)^x', 'y = 200*1.05^x', '200(1.05)^x', 'y = 200(1+0.05)^x', '(1.05)^x*200 = y']) expect(st(spec, s)).toBe('correct');
    expect(st(spec, 'y = 210(1.05)^(x-1)')).toBe('wrong-form');
    expect(st(spec, 'y = 200(1.5)^x')).toBe('incorrect');
    expect(st({ kind: 'equation', value: 'y = 80(1/2)^x', form: 'exponential' }, 'y = 80(0.5)^x')).toBe('correct');
  });
  it('money answers with dollar signs and commas', () => {
    const spec: AnswerSpec = { kind: 'number', value: '8235.0474884514', roundTo: 2, unit: 'dollars' };
    expect(st(spec, '$8,235.05')).toBe('correct');
    expect(st(spec, '8235.05 dollars')).toBe('correct');
    expect(st(spec, '8235')).toBe('incorrect');
  });
});

describe('Unit 6 sequence and exponential answers', () => {
  it('geometric formulas with a negative ratio are compared at whole-number inputs', () => {
    const spec: AnswerSpec = { kind: 'expression', value: '5*(-2)^(n-1)', variables: ['n'] };
    expect(st(spec, '5(-2)^(n-1)')).toBe('correct');
    expect(st(spec, 'a_n = -2.5(-2)^n')).toBe('correct');
    expect(st(spec, '5(-2)^n')).toBe('incorrect');
    expect(st(spec, '5(2)^(n-1)')).toBe('incorrect');
    expect(st(spec, '-5(2)^(n-1)')).toBe('incorrect');
    const half: AnswerSpec = { kind: 'expression', value: '96*(-1/2)^(n-1)', variables: ['n'] };
    expect(st(half, '96(-0.5)^(n-1)')).toBe('correct');
    expect(st(half, '-192(-1/2)^n')).toBe('correct');
  });
  it('positive-ratio formulas accept a_1(r)^(n-1) and (a_1/r)(r)^n', () => {
    const spec: AnswerSpec = { kind: 'expression', value: '3*(2)^(n-1)', variables: ['n'] };
    expect(st(spec, '3(2)^(n-1)')).toBe('correct');
    expect(st(spec, 'f(n) = 1.5(2)^n')).toBe('correct');
    expect(st(spec, '6^(n-1)')).toBe('incorrect');
    expect(st(spec, '3(2)^n')).toBe('incorrect');
  });
  it('doubling-time models in any equivalent form', () => {
    const spec: AnswerSpec = { kind: 'equation', value: 'y = 200*(2)^(t/3)' };
    expect(st(spec, 'y = 200(2)^(t/3)')).toBe('correct');
    expect(st(spec, 'y = 200(2)^(t)')).toBe('incorrect');
  });
});

describe('statistics (Unit 7 conventions)', () => {
  const S = (xs: number[]) => xs.map((x) => Rational.parse(String(x)));
  it('five-number summary leaves the median out of both halves for an odd count', () => {
    const f = fiveNumber(S([13, 2, 8, 4, 10, 5, 7]));
    expect([f.min, f.q1, f.median, f.q3, f.max].map((x) => x.toString())).toEqual(['2', '4', '7', '10', '13']);
    const g = fiveNumber(S([1, 3, 4, 6, 9, 12]));
    expect([g.q1, g.median, g.q3].map((x) => x.toString())).toEqual(['3', '5', '9']);
    expect(iqr(S([1, 3, 4, 6, 9, 12])).toString()).toBe('6');
  });
  it('population standard deviation divides by n', () => {
    expect(stdDev(S([2, 4, 4, 4, 5, 5, 7, 9]))).toBe(2);
    expect(variance(S([1, 2, 3, 4])).toString()).toBe('5/4');
  });
  it('1.5 IQR outliers', () => {
    expect(outliers(S([1, 2, 3, 4, 5, 6, 7, 30])).map(String)).toEqual(['30']);
    expect(outliers(S([10, 11, 12, 13, 14]))).toEqual([]);
  });
  it('least-squares line and r', () => {
    const reg = linearRegression(S([1, 2, 3, 4, 5]), S([2, 4, 5, 4, 5]));
    expect(reg.a.toString()).toBe('3/5');
    expect(reg.b.toString()).toBe('11/5');
    expect(reg.r).toBeCloseTo(0.7746, 4);
    expect(linearRegression(S([1, 2, 3]), S([7, 5, 3])).r).toBeCloseTo(-1, 12);
  });
});

describe('Unit 7 data answers', () => {
  it('statistics with units, rounding and percents', () => {
    expect(st({ kind: 'number', value: '3', unit: 'minutes' }, '3 minutes')).toBe('correct');
    expect(st({ kind: 'number', value: '25', unit: '%' }, '25%')).toBe('correct');
    expect(st({ kind: 'number', value: '25', unit: '%' }, '75%')).toBe('incorrect');
    expect(st({ kind: 'number', value: '7.071067811865', roundTo: 1, unit: 'hours' }, '7.1')).toBe('correct');
    expect(st({ kind: 'number', value: '7.071067811865', roundTo: 1, unit: 'hours' }, '7.0')).toBe('incorrect');
    expect(st({ kind: 'number', value: '64.35', roundTo: 1 }, '64.4')).toBe('correct');
  });
  it('five-number summaries and one-SD intervals', () => {
    const five: AnswerSpec = { kind: 'sequence-terms', values: ['2', '4', '7', '10', '13'] };
    expect(st(five, '2, 4, 7, 10, 13')).toBe('correct');
    expect(st(five, '2 4 7 10 13')).toBe('correct');
    expect(st(five, '2, 4.5, 7, 9.5, 13')).toBe('incorrect');
    const within: AnswerSpec = { kind: 'interval', value: '[62, 78]' };
    expect(st(within, '[62, 78]')).toBe('correct');
    expect(st(within, '[54, 86]')).toBe('incorrect');
  });
});

describe('Unit 8 coordinate geometry answers', () => {
  it('exact distances must be in simplest radical form', () => {
    const spec: AnswerSpec = { kind: 'expression', value: '2sqrt(10)', form: 'simplified-radical' };
    expect(st(spec, '2sqrt(10)')).toBe('correct');
    expect(st(spec, 'sqrt(40)')).toBe('wrong-form');
    expect(st(spec, 'sqrt(10)')).toBe('incorrect');
    const per: AnswerSpec = { kind: 'expression', value: '7+2sqrt(5)', form: 'simplified-radical' };
    expect(st(per, '7 + 2sqrt(5)')).toBe('correct');
    expect(st(per, '2sqrt(5) + 7')).toBe('correct');
    expect(st(per, '9sqrt(5)')).toBe('incorrect');
  });
  it('midpoints with halves, missing coordinates and perpendicular lines', () => {
    const mid: AnswerSpec = { kind: 'point', x: '-1.5', y: '0.5' };
    expect(st(mid, '(-1.5, 0.5)')).toBe('correct');
    expect(st(mid, '(-3/2, 1/2)')).toBe('correct');
    expect(st(mid, '(0.5, -1.5)')).toBe('incorrect');
    const xs: AnswerSpec = { kind: 'solutions', values: ['-6', '10'], variable: 'x' };
    expect(st(xs, '10, -6')).toBe('correct');
    expect(st(xs, 'x = -6 or x = 10')).toBe('correct');
    expect(st(xs, '10')).not.toBe('correct');
    const line: AnswerSpec = { kind: 'equation', value: 'y = -3/2x + 4', form: 'slope-intercept' };
    expect(st(line, 'y = -1.5x + 4')).toBe('correct');
    expect(st(line, 'y = 2/3x + 4')).toBe('incorrect');
  });
});
