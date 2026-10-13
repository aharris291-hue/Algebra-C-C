/**
 * Axis labels on graph-building answers: every reasonable label a student might type for each
 * situation's quantity is accepted (inflections such as "tutored", "babysat", "sketch books"), and
 * labels that name the wrong quantity, name both quantities, use only a unit word shared with the other
 * axis, or give the wrong unit are rejected.
 */
import { describe, it, expect } from 'vitest';
import { checkAnswer, type AnswerSpec } from '../../src/core/math/answers';
import { canonicalGraphInput, checkGraph, graphSpecErrors, type GraphAnswer } from '../../src/core/math/graphAnswer';
import { produceProblem } from '../../src/core/engine/problems';
import { GRAPH_CONTEXT_GENERATORS } from '../../src/content/generators/graph-context';

interface Labels {
  good: string[];
  bad: string[];
}

/** By the key's own label for the axis: what must pass and what must fail on that axis. */
const SITUATIONS: Record<string, { x: Labels; y: Labels }> = {
  'Total cost (dollars)': {
    x: { good: ['Time (hours)', 'Hours', 'Time (hrs)', 'Number of hours', 't (hours)', 'Rental length (h)', 'Rental time', 'Hours rented', 'Duration (hr)'], bad: ['Minutes', 'Time (minutes)', 'Cost', 'x', 'Hours and cost', 'Time (dollars)'] },
    y: { good: ['Total cost (dollars)', 'Cost ($)', 'Total price', 'Amount paid ($)', 'Dollars', 'Money', 'Total ($)', 'Price', 'Total cost', 'Costs', 'Charge (dollars)', 'Amount spent'], bad: ['y', 'Hours', 'Cost per hour', 'Cost (gallons)', 'Time and cost', 'Water left'] },
  },
  'Water left (gallons)': {
    x: { good: ['Time (minutes)', 'Minutes', 'Time (min)', 'Number of minutes', 'Time elapsed (min)'], bad: ['Hours', 'Time (hours)', 'Time (s)', 'Water', 'Gallons per minute'] },
    y: { good: ['Water left (gallons)', 'Gallons left', 'Water (gal)', 'Gallons remaining', 'Water', 'Volume (gallons)', 'Amount of water'], bad: ['Cost ($)', 'Dollars', 'Water (liters)', 'Minutes', 'Gallons per minute'] },
  },
  'Hours tutoring': {
    x: { good: ['Hours babysitting', 'Babysitting hours', 'Hours babysat', 'Babysitting (h)', 'Babysitting time', 'Babysits', 'Baby-sitting hours'], bad: ['Hours', 'Time (hours)', 'Tutoring', 'Hours tutoring', 'babysitting tutoring', 'Babysitting (dollars)'] },
    y: { good: ['Hours tutoring', 'Tutoring hours', 'Hours tutored', 'Tutor hours', 'Tutoring (hrs)', 'Time tutoring'], bad: ['Hours', 'Babysitting', 'sketchbooks paint babysitting tutoring', 'Tutoring (minutes)', 'Tutoring ($)'] },
  },
  'Number of paint sets': {
    x: { good: ['Number of sketchbooks', 'Sketchbooks', '# of sketchbooks', 'Sketch books', 'Books', 'x = sketchbooks bought', 'Sketchbook(s)'], bad: ['Paint sets', 'x', 'Number', 'Sketchbooks and paint sets', 'Sketchbooks ($)', 'Cost'] },
    y: { good: ['Number of paint sets', 'Paint sets', 'Number of paint kits', 'Paint', 'Paints', 'Sets of paint', 'Paint set(s)'], bad: ['Sketchbooks', 'Number', 'y', 'Paint sets ($)', 'Paint and sketchbooks'] },
  },
  'Height (feet)': {
    x: { good: ['Time (seconds)', 'Time (s)', 'Seconds', 't (sec)', 'Time elapsed'], bad: ['Time (minutes)', 'Height', 'Feet', 'Time and height'] },
    y: { good: ['Height (feet)', 'Height (ft)', 'Height above ground', 'Height', 'How high (ft)', 'Heights'], bad: ['Feet', 'ft', 'Area (sq ft)', 'Square feet', 'Height (meters)', 'Height (sq ft)', 'Time', 'time height'] },
  },
  'Area (square feet)': {
    x: { good: ['Side length (feet)', 'Side length (ft)', 'Length of one side', 'Width (feet)', 'Length', 'Side', 'Width'], bad: ['Feet', 'ft', 'Area', 'Side length (sq ft)', 'Side length (seconds)', 'Length and area'] },
    y: { good: ['Area (square feet)', 'Area (sq ft)', 'Square feet', 'Pen area', 'Area', 'Area (ft²)', 'Area (sq. ft.)'], bad: ['Feet', 'Area (feet)', 'Height (ft)', 'Length', 'side area'] },
  },
  'Number of bacteria': {
    x: { good: ['Time (hours)', 'Hours', 'Time (h)', 'Hours since start', 'Time elapsed (hr)'], bad: ['Time (minutes)', 'Bacteria', 'Days', 'Hours of bacteria'] },
    y: { good: ['Number of bacteria', 'Bacteria', 'Bacteria count', 'Population', 'Number of cells', 'Colony size', 'Bacterium'], bad: ['Fish', 'Value ($)', 'Number', 'Bacteria (mg)', 'Hours', 'Medicine'] },
  },
  'Medicine left (mg)': {
    x: { good: ['Time (hours)', 'Hours', 'Time (h)', 'Hours since start'], bad: ['Time (minutes)', 'Medicine', 'Time (mg)'] },
    y: { good: ['Medicine left (mg)', 'Milligrams left', 'Medicine (mg)', 'Amount of medicine', 'Medicine', 'Medication (mg)', 'Dose remaining', 'mg', 'Drug in body (mg)'], bad: ['Bacteria', 'Medicine (grams)', 'Medicine (hours)', 'Hours', 'Medicine per hour'] },
  },
};

describe('graph axis labels for every situation', () => {
  for (const gen of GRAPH_CONTEXT_GENERATORS) {
    it(`${gen.id}: reasonable labels pass and wrong ones fail on each axis`, () => {
      const seen = new Set<string>();
      for (const d of [1, 2, 3] as const)
        for (let s = 1; s <= 40; s++) {
          const pr = produceProblem(gen, s * 7919 + d, d).problem;
          const a = pr.answer as Extract<AnswerSpec, { kind: 'graph' }>;
          const sit = SITUATIONS[a.y.label];
          expect(sit, `situation "${a.y.label}" has a label list`).toBeDefined();
          seen.add(a.y.label);
          const key = JSON.parse(canonicalGraphInput(a));
          for (const [axis, field] of [
            ['x', 'xl'],
            ['y', 'yl'],
          ] as const) {
            for (const label of sit[axis].good) expect(checkAnswer(a, JSON.stringify({ ...key, [field]: label })).status, `${a[axis].label}: "${label}" should pass`).toBe('correct');
            for (const label of sit[axis].bad) {
              const r = checkAnswer(a, JSON.stringify({ ...key, [field]: label }));
              expect(r.status, `${a[axis].label}: "${label}" should fail`).toBe('incorrect');
              expect(r.misconception).toBe('axis-labels');
            }
          }
          // the same label naming both quantities is right on neither axis
          const both = `${a.x.label} and ${a.y.label}`;
          expect(checkAnswer(a, JSON.stringify({ ...key, xl: both, yl: both })).status).toBe('incorrect');
          expect(graphSpecErrors(a)).toEqual([]);
        }
      expect(seen.size).toBeGreaterThanOrEqual(1);
    });
  }
});

// y = -16(t - 2)² + 64: the shared unit "ft" names neither height nor area on its own
const BALL: GraphAnswer = {
  kind: 'graph',
  target: { type: 'parabola', a: '-16', h: '2', k: '64' },
  rule: 'h = -16t^2 + 64t',
  cols: 10,
  rows: 10,
  x: { options: ['0.5', '1'], need: '4', keys: ['2', '4'], label: 'Time (seconds)', words: ['time', 'second', 'sec'], units: ['second'] },
  y: { options: ['8', '10'], need: '64', keys: ['64'], label: 'Height (feet)', words: ['height', 'high'], units: ['foot'] },
  minPoints: 3,
};

describe('graph labels: units and quantities', () => {
  const key = JSON.parse(canonicalGraphInput(BALL));
  const grade = (o: Record<string, unknown>) => checkGraph(BALL, JSON.stringify({ ...key, ...o }));

  it('a label naming both quantities fits neither axis', () => {
    const r = grade({ xl: 'time height', yl: 'time height' });
    expect(r.status).toBe('incorrect');
    expect(r.message).toMatch(/names both quantities/);
  });

  it('a unit word alone never names the quantity, and a wrong unit is rejected with a message', () => {
    expect(grade({ yl: 'Feet' }).status).toBe('incorrect');
    const area = grade({ yl: 'Area (sq ft)' });
    expect(area.status).toBe('incorrect');
    const wrongUnit = grade({ yl: 'Height (meters)' });
    expect(wrongUnit.status).toBe('incorrect');
    expect(wrongUnit.message).toMatch(/measured in feet, not meters/);
    expect(grade({ xl: 'Time (minutes)' }).message).toMatch(/measured in seconds, not minutes/);
  });

  it('a label without a unit, or with the right unit in any common form, is fine', () => {
    for (const yl of ['Height', 'Height (ft)', 'height in feet', 'Height (Feet)']) expect(grade({ yl }).status).toBe('correct');
    for (const xl of ['Time', 'Time (s)', 't (sec)', 'Seconds']) expect(grade({ xl }).status).toBe('correct');
  });

  it('a count takes no unit', () => {
    const counts: GraphAnswer = { ...BALL, y: { ...BALL.y, label: 'Number of bacteria', words: ['bacteri*'], units: [] } };
    const k = JSON.parse(canonicalGraphInput(counts));
    expect(checkGraph(counts, JSON.stringify({ ...k, yl: 'Bacteria' })).status).toBe('correct');
    const r = checkGraph(counts, JSON.stringify({ ...k, yl: 'Bacteria ($)' }));
    expect(r.status).toBe('incorrect');
    expect(r.message).toMatch(/count, so it has no unit/);
  });

  it('specs saved before units were checked still grade (no unit check, unit words still never name a quantity)', () => {
    const legacy: GraphAnswer = { ...BALL, y: { ...BALL.y, words: ['height', 'feet', 'foot', 'ft', 'high'], units: undefined } };
    const k = JSON.parse(canonicalGraphInput(legacy));
    expect(checkGraph(legacy, JSON.stringify({ ...k, yl: 'Height (meters)' })).status).toBe('correct');
    expect(checkGraph(legacy, JSON.stringify({ ...k, yl: 'Area (sq ft)' })).status).toBe('incorrect');
  });
});
