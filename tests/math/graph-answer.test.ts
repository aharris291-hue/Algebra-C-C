/**
 * Graph-building answers (M5): exact grading of a drawn graph (labels, scales, points, boundary,
 * shading) and the four situation generators that use it.
 */
import { describe, it, expect } from 'vitest';
import { checkAnswer, answerToText, type AnswerSpec } from '../../src/core/math/answers';
import { canonicalGraphInput, graphConfig, graphSpecErrors, describeGraphResponse, type GraphAnswer } from '../../src/core/math/graphAnswer';
import { produceProblem, canonicalInput, misconceptionReachErrors } from '../../src/core/engine/problems';
import { GRAPH_CONTEXT_GENERATORS } from '../../src/content/generators/graph-context';
import { GENERATORS, LESSON_CONTENT } from '../../src/content';
import { stressGenerator } from '../generators/harness';

const resp = (o: Record<string, unknown>) => JSON.stringify(o);

// y = 15x + 40 for 0..8 hours: x need 8, y need 160
const LINE: GraphAnswer = {
  kind: 'graph',
  target: { type: 'line', m: '15', b: '40' },
  rule: 'y = 15x + 40',
  cols: 10,
  rows: 10,
  x: { options: ['0.5', '1', '2', '5'], need: '8', keys: [], label: 'Time (hours)', words: ['time', 'hour'] },
  y: { options: ['5', '10', '20', '25', '50'], need: '160', keys: ['40'], label: 'Cost (dollars)', words: ['cost', 'dollar'] },
  minPoints: 2,
};
const base = { xs: '1', ys: '20', xl: 'Hours', yl: 'Total cost ($)' };

describe('graph answers: exact grading', () => {
  it('accepts any two lattice points on the line with accepted scales and sensible labels', () => {
    // (0, 40) and (4, 100) at 1 per square and 20 per square: grid (0, 2) and (4, 5)
    expect(checkAnswer(LINE, resp({ ...base, p: [[0, 2], [4, 5]] })).status).toBe('correct');
    // more points are fine when they are all on the line
    expect(checkAnswer(LINE, resp({ ...base, p: [[0, 2], [4, 5], [8, 8]] })).status).toBe('correct');
    // the same line at another accepted scale (2 per square across)
    expect(checkAnswer(LINE, resp({ ...base, xs: '2', p: [[0, 2], [2, 5]] })).status).toBe('correct');
  });

  it('rejects a point off the line, exactly (no rounding)', () => {
    const r = checkAnswer(LINE, resp({ ...base, p: [[0, 2], [3, 4]] })); // (3, 80) but the line gives 85
    expect(r.status).toBe('incorrect');
    expect(r.misconception).toBe('graph-reading');
    expect(r.message).toContain('(3, 80)');
  });

  it('judges the scales: cut off, squeezed, key value between grid lines', () => {
    const cut = checkAnswer(LINE, resp({ ...base, xs: '0.5', p: [[0, 2], [8, 5]] }));
    expect(cut.misconception).toBe('graph-scale');
    expect(cut.message).toMatch(/cut off/);
    const squeezed = checkAnswer(LINE, resp({ ...base, xs: '5', p: [[0, 2], [4, 8]] }));
    expect(squeezed.message).toMatch(/squeezed/);
    const between = checkAnswer(LINE, resp({ ...base, ys: '25', p: [[0, 2], [2, 4]] })); // 40 is not a multiple of 25
    expect(between.message).toMatch(/between grid lines/);
  });

  it('judges the labels: missing is unreadable, wrong or swapped is incorrect', () => {
    expect(checkAnswer(LINE, resp({ ...base, xl: ' ', p: [[0, 2], [4, 5]] })).status).toBe('invalid');
    const swapped = checkAnswer(LINE, resp({ ...base, xl: 'Cost', yl: 'Time (hours)', p: [[0, 2], [4, 5]] }));
    expect(swapped.status).toBe('incorrect');
    expect(swapped.misconception).toBe('axis-labels');
    expect(swapped.message).toMatch(/wrong axes/);
    expect(checkAnswer(LINE, resp({ ...base, yl: 'y', p: [[0, 2], [4, 5]] })).misconception).toBe('axis-labels');
    // whole words only: "hourglass" is not "hour"
    expect(checkAnswer(LINE, resp({ ...base, xl: 'hourglass', p: [[0, 2], [4, 5]] })).misconception).toBe('axis-labels');
  });

  it('asks for what is missing without grading it', () => {
    expect(checkAnswer(LINE, resp({ ...base, p: [[0, 2]] })).status).toBe('invalid');
    expect(checkAnswer(LINE, resp({ xl: 'Hours', yl: 'Cost', p: [[0, 2], [4, 5]] })).status).toBe('invalid');
    expect(checkAnswer(LINE, resp({ ...base, ys: '7', p: [[0, 2], [4, 5]] })).status).toBe('invalid'); // not an offered scale
    expect(checkAnswer(LINE, resp({ ...base, p: [[0, 2], [11, 5]] })).status).toBe('invalid'); // off the grid
    expect(checkAnswer(LINE, resp({ ...base, p: [[0, 2], [1.5, 5]] })).status).toBe('invalid');
    expect(checkAnswer(LINE, 'not json').status).toBe('invalid');
    // a repeated point counts once
    expect(checkAnswer(LINE, resp({ ...base, p: [[0, 2], [0, 2]] })).status).toBe('invalid');
  });

  const INEQ: GraphAnswer = {
    kind: 'graph',
    target: { type: 'inequality', m: '-0.75', b: '6', op: '>=' },
    rule: '6x + 8y ≥ 48',
    cols: 10,
    rows: 10,
    x: { options: ['0.5', '1', '2'], need: '8', keys: ['8'], label: 'Hours babysitting', words: ['babysitting'] },
    y: { options: ['0.5', '1', '2'], need: '6', keys: ['6'], label: 'Hours tutoring', words: ['tutoring'] },
    minPoints: 2,
  };
  const ib = { xs: '1', ys: '1', xl: 'babysitting hours', yl: 'tutoring hours', p: [[0, 6], [8, 0]] };

  it('inequalities: boundary type and shaded side', () => {
    expect(checkAnswer(INEQ, resp({ ...ib, bd: 'solid', sh: 'above' })).status).toBe('correct');
    expect(checkAnswer(INEQ, resp({ ...ib, bd: 'dashed', sh: 'above' })).misconception).toBe('boundary-line');
    expect(checkAnswer(INEQ, resp({ ...ib, bd: 'solid', sh: 'below' })).misconception).toBe('shading');
    expect(checkAnswer(INEQ, resp({ ...ib })).status).toBe('invalid');
    // (4, 3) is on the boundary: 6·4 + 8·3 = 48
    expect(checkAnswer(INEQ, resp({ ...ib, p: [[4, 3], [8, 0]], bd: 'solid', sh: 'above' })).status).toBe('correct');
  });

  it('a misconception is recognized when the drawing is a correct drawing of the misconceived answer', () => {
    const mis = [
      { answer: JSON.stringify({ target: { op: '<=' } }), tag: 'shading' as const, feedback: 'Test (0, 0).' },
      { answer: JSON.stringify({ swapLabels: true }), tag: 'axis-labels' as const, feedback: 'Swapped.' },
    ];
    const r = checkAnswer(INEQ, resp({ ...ib, bd: 'solid', sh: 'below' }), mis);
    expect(r.message).toBe('Test (0, 0).');
    expect(misconceptionReachErrors(INEQ, mis)).toEqual([]);
  });

  const PARA: GraphAnswer = {
    kind: 'graph',
    target: { type: 'parabola', a: '-16', h: '2', k: '64' },
    rule: 'h = -16t^2 + 64t',
    cols: 10,
    rows: 10,
    x: { options: ['0.25', '0.5', '1'], need: '4', keys: ['2', '4'], label: 'Time (seconds)', words: ['time', 'second'] },
    y: { options: ['8', '10', '16'], need: '64', keys: ['64'], label: 'Height (feet)', words: ['height', 'feet'] },
    minPoints: 3,
  };
  it('parabolas need the vertex and a point on each side', () => {
    const pb = { xs: '1', ys: '8', xl: 'time (s)', yl: 'height (ft)' };
    expect(checkAnswer(PARA, resp({ ...pb, p: [[1, 6], [2, 8], [3, 6]] })).status).toBe('correct');
    expect(checkAnswer(PARA, resp({ ...pb, p: [[0, 0], [1, 6], [4, 0]] })).message).toMatch(/vertex/);
    expect(checkAnswer(PARA, resp({ ...pb, p: [[0, 0], [1, 6], [2, 8]] })).message).toMatch(/each side/);
    expect(checkAnswer(PARA, resp({ ...pb, ys: '10', p: [[1, 6], [2, 8], [3, 6]] })).misconception).toBe('graph-scale');
  });

  const EXP: GraphAnswer = {
    kind: 'graph',
    target: { type: 'exponential', a: '20', b: '2' },
    rule: 'y = 20(2)^x',
    cols: 6,
    rows: 10,
    x: { options: ['0.5', '1', '2'], need: '3', keys: ['1'], label: 'Time (hours)', words: ['time', 'hour'] },
    y: { options: ['10', '20', '50'], need: '160', keys: ['20'], label: 'Number of bacteria', words: ['bacteria'] },
    minPoints: 3,
  };
  it('exponentials need the starting value; a fractional input is never on a lattice point', () => {
    const eb = { xs: '1', ys: '20', xl: 'hours', yl: 'bacteria' };
    expect(checkAnswer(EXP, resp({ ...eb, p: [[0, 1], [1, 2], [3, 8]] })).status).toBe('correct');
    expect(checkAnswer(EXP, resp({ ...eb, p: [[1, 2], [2, 4], [3, 8]] })).message).toMatch(/starting value/);
    // a straight line through (0, 20), (1, 40), (2, 60) is not exponential
    expect(checkAnswer(EXP, resp({ ...eb, p: [[0, 1], [1, 2], [2, 3]] })).status).toBe('incorrect');
    // (0.5, 20√2) cannot be placed exactly: 0.5 per square, any y is off the curve
    expect(checkAnswer(EXP, resp({ ...eb, xs: '0.5', p: [[0, 1], [1, 1], [2, 2]] })).status).toBe('incorrect');
  });

  it('the key drawing, config, description and answer text', () => {
    for (const s of [LINE, INEQ, PARA, EXP]) {
      expect(graphSpecErrors(s)).toEqual([]);
      expect(checkAnswer(s, canonicalGraphInput(s)).status).toBe('correct');
      const cfg = graphConfig(s) as unknown as Record<string, unknown>;
      // the renderer never sees the target, accepted scales or label words
      expect(JSON.stringify(cfg)).not.toMatch(/target|need|keys|words|label/);
      expect(answerToText(s)).toContain(s.rule);
    }
    expect(describeGraphResponse(resp({ ...ib, bd: 'solid', sh: 'above' }))).toBe('points (0, 6), (8, 0); horizontal axis "babysitting hours", 1 per square; vertical axis "tutoring hours", 1 per square; solid boundary; shaded above');
  });
});

describe('graph-building generators', () => {
  for (const gen of GRAPH_CONTEXT_GENERATORS) {
    it(`${gen.id} produces verified, drawable problems across 600 variations`, () => {
      const { rejectRate } = stressGenerator(gen, 200);
      expect(rejectRate).toBeLessThan(0.05);
    });

    it(`${gen.id}: misconceptions reachable, steps end in the graph, hints never state the rule`, () => {
      let withShapeMistake = 0;
      for (const d of [1, 2, 3] as const)
        for (let s = 1; s <= 60; s++) {
          const pr = produceProblem(gen, s * 101 + d, d).problem;
          const a = pr.answer as Extract<AnswerSpec, { kind: 'graph' }>;
          expect(a.kind).toBe('graph');
          expect(misconceptionReachErrors(a, pr.misconceptions)).toEqual([]);
          expect(pr.misconceptions.some((m) => m.tag === 'axis-labels')).toBe(true);
          if (pr.misconceptions.some((m) => m.tag !== 'axis-labels')) withShapeMistake++;
          expect(pr.steps?.at(-1)?.answer).toEqual(a);
          for (const h of [...pr.hints, ...(pr.steps ?? []).flatMap((st) => st.hints)]) {
            expect(h).not.toContain(a.rule);
            expect(h).not.toMatch(/per square/);
          }
          // the corrupted key (a different line or curve) is caught by verify()
          const t = a.target;
          const bad = { ...pr, answer: { ...a, target: 'b' in t && t.type !== 'exponential' ? { ...t, b: String(Number(t.b) + 1) } : t.type === 'parabola' ? { ...t, k: String(Number(t.k) + 1) } : { ...t, a: String(Number(t.a) + 1) } } as AnswerSpec };
          expect(gen.verify(bad).length).toBeGreaterThan(0);
          // and a wrong drawing (the key shifted up a square) is graded incorrect
          const key = JSON.parse(canonicalInput(a));
          key.p = key.p.map(([x, y]: [number, number]) => [x, y + 1]);
          expect(checkAnswer(a, JSON.stringify(key)).status).not.toBe('correct');
        }
      expect(withShapeMistake).toBeGreaterThan(90);
    });
  }

  it('the standards that ask for graphs with labels and scales are practiced in their lessons', () => {
    const where: Record<string, string> = { 'u1.graph-linear-context': 'U1L09', 'u2.graph-ineq-context': 'U2L02', 'u4.graph-quadratic-context': 'U4L18', 'u5.graph-exponential-context': 'U5L03' };
    for (const [g, lesson] of Object.entries(where)) {
      expect(GENERATORS.has(g)).toBe(true);
      const L = LESSON_CONTENT.get(lesson)!;
      expect(L.guided.some((x) => x.generator === g)).toBe(true);
      expect(L.independent.mix.some((x) => x.generator === g)).toBe(true);
      expect(L.quiz.items.some((x) => x.generator === g)).toBe(true);
    }
  });
});
