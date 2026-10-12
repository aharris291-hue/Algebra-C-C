/**
 * Answer checking regressions from QA: requested forms that were wrongly rejected, misconception
 * answers that could never match, exact values on "round to ..." questions, and the many ways a
 * student types numbers (unicode fractions and exponents, units, thousands separators).
 */
import { checkAnswer, requestedFormIssue, AnswerSpec, Misconception } from '../../src/core/math/answers';
import { misconceptionReachErrors } from '../../src/core/engine/problems';

const st = (spec: AnswerSpec, input: string, m?: Misconception[]) => checkAnswer(spec, input, m).status;

describe('requested forms accept every way of writing that form', () => {
  const vertexEq: AnswerSpec = { kind: 'equation', value: 'y = 0.5(x - 3)^2 - 5', form: 'vertex' };
  const vertexExpr: AnswerSpec = { kind: 'expression', value: '(1/2)(x-4)^2+3', form: 'vertex' };
  it('vertex form divided by a constant', () => {
    expect(st(vertexEq, 'y = (x-3)^2/2 - 5')).toBe('correct');
    expect(st(vertexExpr, '(x-4)^2/2+3')).toBe('correct');
    expect(st(vertexEq, 'y = 1/2(x-3)^2 - 5')).toBe('correct');
  });
  it('vertex form still rejects other forms', () => {
    expect(st(vertexEq, 'y = 0.5x^2 - 3x - 0.5')).toBe('wrong-form');
    expect(st(vertexEq, 'y = 0.5(x - 3)(x - 3) - 5')).toBe('wrong-form');
  });

  const ps1: AnswerSpec = { kind: 'equation', value: 'y - (-4) = (3/4)(x - (3))', form: 'point-slope' };
  const ps2: AnswerSpec = { kind: 'equation', value: 'y - (8) = (-3)(x - (1))', form: 'point-slope' };
  it('point-slope with the slope as a fraction after the binomial, a factored-out -1, and sides swapped', () => {
    expect(st(ps1, 'y + 4 = 3(x - 3)/4')).toBe('correct');
    expect(st(ps2, 'y - 8 = 3(1 - x)')).toBe('correct');
    expect(st(ps2, '-3(x - 1) = y - 8')).toBe('correct');
    expect(st({ kind: 'equation', value: 'y+3=1/2(x-1)', form: 'point-slope' }, 'y+3=(x-1)/2')).toBe('correct');
  });
  it('point-slope still rejects slope-intercept and expanded forms', () => {
    expect(st(ps2, 'y = -3(x-1) + 8')).toBe('wrong-form');
    expect(st(ps2, 'y-8=-3x+3')).toBe('wrong-form');
    expect(st(ps1, 'y + 4 = 3/4x - 9/4')).toBe('wrong-form');
  });
  it('standard form with the sides swapped', () => {
    expect(st({ kind: 'equation', value: '2x+3y=6', form: 'standard' }, '6=2x+3y')).toBe('correct');
    expect(st({ kind: 'equation', value: '2x+3y=6', form: 'standard' }, '2x = 6 - 3y')).toBe('wrong-form');
  });
  it('slope-intercept with a zero slope written out', () => {
    expect(st({ kind: 'equation', value: 'y=3', form: 'slope-intercept' }, 'y=0x+3')).toBe('correct');
    expect(st({ kind: 'equation', value: 'y=3x+1', form: 'slope-intercept' }, 'y=2x+x+1')).toBe('wrong-form');
  });
});

describe('misconception answers match however the generator wrote them', () => {
  it('points written "(a, b)" or "a, b" or "a|b"', () => {
    const spec: AnswerSpec = { kind: 'point', x: '0', y: '30' };
    for (const answer of ['(0, -30)', '0, -30', '0|-30']) {
      const r = checkAnswer(spec, '(0, -30)', [{ answer, tag: 'sign-error', feedback: 'Check the signs.' }]);
      expect(r.misconception).toBe('sign-error');
    }
  });
  it('solution lists and sequence terms written with commas', () => {
    const sol: AnswerSpec = { kind: 'solutions', values: ['9', '-2'] };
    expect(checkAnswer(sol, '2, -9', [{ answer: '2, -9', tag: 'sign-error', feedback: 'f' }]).misconception).toBe('sign-error');
    expect(checkAnswer(sol, 'x = 2 or x = -9', [{ answer: 'x = 2 or x = -9', tag: 'sign-error', feedback: 'f' }]).misconception).toBe('sign-error');
    const seq: AnswerSpec = { kind: 'sequence-terms', values: ['8', '10', '12', '14'] };
    expect(checkAnswer(seq, '10, 12, 14, 16', [{ answer: '10, 12, 14, 16', tag: 'sequence-index', feedback: 'f' }]).misconception).toBe('sequence-index');
  });
  it('one malformed misconception does not hide the ones after it', () => {
    const spec: AnswerSpec = { kind: 'point', x: '1', y: '2' };
    const r = checkAnswer(spec, '(-1, 2)', [
      { answer: 'nonsense', tag: 'other', feedback: 'bad entry' },
      { answer: '(-1, 2)', tag: 'sign-error', feedback: 'Check the sign of x.' },
    ]);
    expect(r.misconception).toBe('sign-error');
  });
  it('a misconception in the wrong variable still gets its feedback (not "use the variable x")', () => {
    const spec: AnswerSpec = { kind: 'inequality', value: 'x < -1' };
    const r = checkAnswer(spec, 'y < -1', [{ answer: 'y < -1', tag: 'graph-reading', feedback: 'This boundary is vertical.' }]);
    expect(r.status).toBe('incorrect');
    expect(r.misconception).toBe('graph-reading');
  });
  it('problem validation reports a misconception a student could never trigger', () => {
    const spec: AnswerSpec = { kind: 'number', value: '5' };
    expect(misconceptionReachErrors(spec, [{ answer: '-5', tag: 'sign-error', feedback: 'f' }])).toEqual([]);
    // the second entry has the same answer, so its own tag can never be reached
    const errs = misconceptionReachErrors(spec, [
      { answer: '-5', tag: 'sign-error', feedback: 'f' },
      { answer: '-5', tag: 'inverse-operation', feedback: 'g' },
    ]);
    expect(errs.length).toBe(1);
    expect(misconceptionReachErrors({ kind: 'point', x: '1', y: '2' }, [{ answer: '7', tag: 'other', feedback: 'f' }]).length).toBe(1);
  });
});

describe('exact values on "round to ..." questions', () => {
  const dist: AnswerSpec = { kind: 'number', value: '7.810249675907', roundTo: 1 };
  it('the exact radical is not marked wrong; the student is asked to round it', () => {
    const r = checkAnswer(dist, '√61');
    expect(r.status).toBe('wrong-form');
    expect(r.message).toMatch(/exact value.*round/i);
    expect(st({ kind: 'number', value: '538.516480713450', roundTo: 1, unit: 'meters' }, '100√29')).toBe('wrong-form');
    expect(st(dist, '7.8')).toBe('correct');
  });
  it('a different irrational value is still wrong', () => {
    expect(st(dist, '√62')).toBe('incorrect');
  });
  it('π is read as a number', () => {
    expect(st({ kind: 'number', value: '12.566370614359', roundTo: 2 }, '4π')).toBe('wrong-form');
    expect(st({ kind: 'number', value: '12.566370614359', roundTo: 2 }, '4pi')).toBe('wrong-form');
    expect(st({ kind: 'number', value: '12' }, '4π')).toBe('incorrect');
  });
});

describe('number and list input', () => {
  it('unicode fractions, superscripts, symbols', () => {
    expect(st({ kind: 'expression', value: 'x/2' }, '½x')).toBe('correct');
    expect(st({ kind: 'number', value: '5/2' }, '2½')).toBe('correct');
    expect(st({ kind: 'number', value: '-7/4' }, '-1¾')).toBe('correct');
    expect(st({ kind: 'expression', value: 'x/2 + 5/2' }, '½x + 2½')).toBe('correct');
    expect(st({ kind: 'expression', value: '√2/2', form: 'simplified-radical' }, '½√2')).toBe('correct');
    expect(st({ kind: 'expression', value: '6x^5y^2', form: 'exponent-simplified' }, '6x⁵y²')).toBe('correct');
    expect(st({ kind: 'expression', value: 'x^10' }, 'x¹⁰')).toBe('correct');
    expect(st({ kind: 'equation', value: 'y=-x/2+1', form: 'slope-intercept' }, 'y=−½x+1')).toBe('correct');
    expect(st({ kind: 'inequality', value: 'x>=3' }, 'x ⩾ 3')).toBe('correct');
    expect(st({ kind: 'inequality', value: 'x<=3' }, 'x ⩽ 3')).toBe('correct');
    expect(st({ kind: 'expression', value: '3n+2' }, 'aₙ = 3n+2')).toBe('correct');
  });
  it('money, percents and units', () => {
    expect(st({ kind: 'number', value: '-12.5', unit: 'dollars' }, '−$12.50')).toBe('correct');
    expect(st({ kind: 'number', value: '25', unit: '%' }, '25 percent')).toBe('correct');
    expect(st({ kind: 'number', value: '25' }, '25%')).toBe('correct');
    expect(st({ kind: 'number', value: '3', unit: 'square feet' }, '3 ft²')).toBe('correct');
    expect(st({ kind: 'number', value: '3', unit: 'square feet' }, '3 ft^2')).toBe('correct');
    expect(st({ kind: 'number', value: '1200' }, '1 200')).toBe('correct');
  });
  it('words that change the value are never dropped', () => {
    expect(st({ kind: 'number', value: '3' }, '3 dozen')).not.toBe('correct');
    expect(st({ kind: 'number', value: '36' }, '3 dozen')).toBe('wrong-form');
    expect(st({ kind: 'number', value: '3', unit: 'dollars' }, '3 percent')).not.toBe('correct');
    expect(st({ kind: 'number', value: '5' }, '5 thousand')).not.toBe('correct');
    expect(st({ kind: 'number', value: '10', unit: 'thousand dollars' }, '10 thousand')).toBe('correct');
  });
  it('dollars typed for an answer in thousands of dollars get a units message', () => {
    const spec: AnswerSpec = { kind: 'number', value: '10', unit: 'thousand dollars' };
    const r = checkAnswer(spec, '$10,000');
    expect(r.status).toBe('wrong-form');
    expect(r.message).toMatch(/thousand dollars/);
    const w = checkAnswer(spec, '$12,000');
    expect(w.status).toBe('incorrect');
    expect(w.misconception).toBe('units');
  });
  it('thousands separators in lists and points', () => {
    expect(st({ kind: 'solutions', values: ['1000', '-2'] }, '1,000 or -2')).toBe('correct');
    expect(st({ kind: 'solutions', values: ['1', '-2'] }, '1,-2')).toBe('correct');
    expect(st({ kind: 'sequence-terms', values: ['1200', '2400', '4800'] }, '1,200, 2,400, 4,800')).toBe('correct');
    expect(st({ kind: 'point', x: '1200', y: '5' }, '(1,200, 5)')).toBe('correct');
    expect(st({ kind: 'point', x: '3', y: '500' }, '(3,500)')).toBe('correct');
    expect(st({ kind: 'point', x: '3', y: '-2' }, 'x=3, y=-2')).toBe('correct');
  });
  it('function notation for a named equation', () => {
    expect(st({ kind: 'equation', value: 'C=5n+20' }, 'C(n) = 5n + 20')).toBe('correct');
  });
});

describe('requested-form check used by quizzes (does not depend on the value)', () => {
  it('flags the form the same way for right and wrong values', () => {
    const spec: AnswerSpec = { kind: 'equation', value: '2x+3y=6', form: 'standard' };
    expect(requestedFormIssue(spec, 'y = -2/3x + 2')).toMatch(/standard form/);
    expect(requestedFormIssue(spec, 'y = 5x + 2')).toMatch(/standard form/);
    expect(requestedFormIssue(spec, '2x + 3y = 6')).toBeNull();
    expect(requestedFormIssue(spec, '4x + 3y = 6')).toBeNull();
    const fact: AnswerSpec = { kind: 'expression', value: '(x+2)(x+3)', form: 'factored' };
    expect(requestedFormIssue(fact, 'x^2+5x+6')).not.toBeNull();
    expect(requestedFormIssue(fact, 'x^2+5x+4')).not.toBeNull();
    expect(requestedFormIssue(fact, '(x+1)(x+3)')).toBeNull();
    const round: AnswerSpec = { kind: 'number', value: '7.810249675907', roundTo: 1 };
    expect(requestedFormIssue(round, '√61')).toMatch(/Round/);
    expect(requestedFormIssue(round, '√62')).toMatch(/Round/);
    expect(requestedFormIssue(round, '7.8')).toBeNull();
    expect(requestedFormIssue({ kind: 'number', value: '5' }, '2+3')).toMatch(/single number/);
  });
});
