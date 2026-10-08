/**
 * Unit 1, Lesson 10 generators: parent functions; linear vs nonlinear (S1.17).
 */
import type { GeneratorDef, Rng } from '../../core/curriculum/types';
import { Rational } from '../../core/math/rational';
import { evalNumeric } from '../../core/math/evaluate';
import { parseExpression } from '../../core/math/parser';
import { toPoly } from '../../core/math/poly';
import { Q, p, math, makeProblem, makeChoice, choiceLabel, pickDistinct } from './util';

interface Parent {
  name: string;
  expr: string; // parser syntax for graphing
  tex: string;
  shape: string;
  domain: string;
  range: string;
}

const PARENTS: Parent[] = [
  { name: 'Linear', expr: 'x', tex: 'f(x) = x', shape: 'a straight line through the origin', domain: 'All real numbers', range: 'All real numbers' },
  { name: 'Quadratic', expr: 'x^2', tex: 'f(x) = x^2', shape: 'a U-shaped parabola with its lowest point at the origin', domain: 'All real numbers', range: '$y \\ge 0$' },
  { name: 'Absolute value', expr: 'abs(x)', tex: 'f(x) = |x|', shape: 'a V shape with its point at the origin', domain: 'All real numbers', range: '$y \\ge 0$' },
  { name: 'Cube root', expr: 'cbrt(x)', tex: 'f(x) = \\sqrt[3]{x}', shape: 'an S-shaped curve lying on its side, through $(-8, -2)$, the origin and $(8, 2)$', domain: 'All real numbers', range: 'All real numbers' },
  { name: 'Square root', expr: 'sqrt(x)', tex: 'f(x) = \\sqrt{x}', shape: 'half of a sideways parabola starting at the origin', domain: '$x \\ge 0$', range: '$y \\ge 0$' },
  { name: 'Exponential', expr: '2^x', tex: 'f(x) = 2^x', shape: 'a curve that stays above the $x$-axis and rises faster and faster', domain: 'All real numbers', range: '$y > 0$' },
];

/** Classify a graphed expression by its values (independent of the generator's labels). */
function fingerprint(expr: string): string {
  const ast = parseExpression(expr);
  const at = (x: number) => evalNumeric(ast, { x });
  const near = (a: number, b: number) => Math.abs(a - b) < 1e-9;
  if (!Number.isFinite(at(-1))) return 'Square root';
  if (near(at(0), 1) && near(at(1), 2) && near(at(2), 4)) return 'Exponential';
  if (near(at(8), 2) && near(at(-8), -2) && near(at(1), 1)) return 'Cube root';
  if (near(at(-2), 4) && near(at(3), 9)) return 'Quadratic';
  if (near(at(-2), 2) && near(at(3), 3)) return 'Absolute value';
  if (near(at(-2), -2) && near(at(3), 3)) return 'Linear';
  return '?';
}

// ---------------------------------------------------------------------------
// Comparing key features of the parent functions (A.FGR.2.5)
// ---------------------------------------------------------------------------

type Fn = (x: number) => number;
const grid = (lo: number, hi: number, step: number) => Array.from({ length: Math.round((hi - lo) / step) + 1 }, (_, i) => lo + i * step);
const strictlyUp = (f: Fn, lo: number, hi: number) => grid(lo, hi, 0.25).every((x, i, xs) => i === 0 || f(x) > f(xs[i - 1]));
const strictlyDown = (f: Fn, lo: number, hi: number) => grid(lo, hi, 0.25).every((x, i, xs) => i === 0 || f(x) < f(xs[i - 1]));
/** slope of the right-hand piece right next to 0: a sharp corner keeps a slope near 1, a smooth bottom flattens to 0 */
const slopeNearZero = (f: Fn) => (f(0.001) - f(0)) / 0.001;

/**
 * Each description is checked numerically against every parent's graph (sampled values only, no labels),
 * so verify() can confirm that exactly one parent fits it.
 */
const FEATURES: Array<{ text: string; test: (f: Fn) => boolean; why: string }> = [
  {
    text: 'It is decreasing for $x < 0$, increasing for $x > 0$, and its graph has a sharp corner (vertex) at the origin.',
    test: (f) => strictlyDown(f, -5, 0) && strictlyUp(f, 0, 5) && slopeNearZero(f) > 0.5,
    why: 'Both $|x|$ and $x^2$ go down and then up, but $|x|$ turns at a sharp point (a V), while $x^2$ turns smoothly (a U).',
  },
  {
    text: 'It is decreasing for $x < 0$, increasing for $x > 0$, and its graph turns smoothly at its lowest point, the origin.',
    test: (f) => strictlyDown(f, -5, 0) && strictlyUp(f, 0, 5) && Math.abs(slopeNearZero(f)) < 0.01,
    why: 'Both $x^2$ and $|x|$ go down and then up, but $x^2$ turns smoothly (a U), while $|x|$ has a sharp corner (a V).',
  },
  {
    text: 'Its graph has no $x$-intercept.',
    test: (f) => {
      const ys = grid(-10, 10, 0.25).map(f).filter(Number.isFinite);
      return ys.every((y) => y > 0) || ys.every((y) => y < 0);
    },
    why: '$2^x$ is positive for every input, so it never reaches 0. Every other parent passes through $(0, 0)$, which is on the $x$-axis.',
  },
  {
    text: 'As $x$ decreases (moving left), the outputs get closer and closer to 0 but never reach it.',
    test: (f) => [-10, -20, -30].every((x) => Number.isFinite(f(x)) && f(x) > 0 && f(x) < 0.001) && strictlyUp(f, -10, 3),
    why: 'Each step left halves the output of $2^x$: $2^{-1} = \\tfrac{1}{2}$, $2^{-2} = \\tfrac{1}{4}$, and so on. Halving never reaches 0.',
  },
  {
    text: 'Its domain is not all real numbers.',
    test: (f) => grid(-10, 10, 0.25).some((x) => !Number.isFinite(f(x))),
    why: '$\\sqrt{x}$ is not a real number when $x$ is negative, so its domain is $x \\ge 0$. The other parents accept every real number.',
  },
  {
    text: 'It is increasing everywhere, and its rate of change is constant.',
    test: (f) => {
      const xs = grid(-6, 6, 1);
      const d = xs.slice(1).map((x, i) => f(x) - f(xs[i]));
      return d.every((v) => Number.isFinite(v) && Math.abs(v - d[0]) < 1e-9 && v > 0);
    },
    why: 'Only the linear parent $f(x) = x$ goes up by the same amount for every step right. That is what a straight line means.',
  },
  {
    text: 'Its range is all real numbers, but its graph is not a straight line: it rises more and more slowly as $x$ moves away from 0.',
    test: (f) => {
      const ys = grid(-10, 10, 0.5).map(f);
      if (!ys.every(Number.isFinite) || Math.min(...ys) > -2 || Math.max(...ys) < 2) return false;
      return f(9) - f(8) < f(2) - f(1) && strictlyUp(f, -10, 10);
    },
    why: '$\\sqrt[3]{x}$ takes every real value ($\\sqrt[3]{-8} = -2$, $\\sqrt[3]{8} = 2$), but it flattens out: going from 1 to 8 only raises the output from 1 to 2. The line $f(x) = x$ also has range all real numbers, but it is straight.',
  },
];

export const FEATURE_ASK = 'Which parent function has this feature?';

function featureProblem(rng: Rng) {
  const feat = rng.pick(FEATURES);
  const fits = PARENTS.filter((q) => {
    const ast = parseExpression(q.expr);
    return feat.test((x) => evalNumeric(ast, { x }));
  });
  if (fits.length !== 1) throw new Error('feature does not single out one parent');
  const fam = fits[0];
  const others = rng.shuffle(PARENTS.filter((q) => q !== fam).map((q) => q.name)).slice(0, 3);
  return makeProblem({
    skillId: 'S1.17',
    tags: [],
    prompt: [p(FEATURE_ASK), p(feat.text)],
    answer: makeChoice(rng, fam.name, others),
    hints: [
      'Picture each parent graph: line, V, U, half arch, S lying on its side, and the curve that hugs the $x$-axis on the left.',
      'For each choice, ask: where does it go up or down, where does it cross the axes, and what happens far to the left and right?',
      'Test a few inputs such as $-8$, $-1$, $0$, $1$ and $8$ in each choice and look at the outputs.',
      'Rule out every choice that breaks any part of the description. Exactly one should be left.',
    ],
    solution: [
      { text: 'Compare the description with each parent graph.', why: feat.why },
      { text: `Only the ${fam.name.toLowerCase()} parent fits.`, tex: fam.tex, why: `Its graph is ${fam.shape}.` },
    ],
    misconceptions: [],
  });
}

/** Name -> rule, written out again here so verify() does not lean on the PARENTS table. */
const RULE_BY_NAME: Record<string, string> = {
  Linear: 'x',
  Quadratic: 'x*x',
  'Absolute value': 'abs(x)',
  'Cube root': 'cbrt(x)',
  'Square root': 'sqrt(x)',
  Exponential: '2^x',
};

function verifyFeature(description: string, a: { kind: 'choice'; options: { id: string; label: string }[]; correct: string }): string[] {
  const feat = FEATURES.find((q) => q.text === description);
  if (!feat) return ['unknown feature'];
  const passes = a.options.filter((o) => {
    const rule = RULE_BY_NAME[o.label];
    if (!rule) return false;
    const ast = parseExpression(rule);
    return feat.test((x) => evalNumeric(ast, { x }));
  });
  if (passes.length !== 1) return [`${passes.length} options fit the description`];
  return passes[0].id === a.correct ? [] : ['the keyed option does not fit the description'];
}

export const genParentFunctions: GeneratorDef = {
  id: 'u1.parent-functions',
  skillId: 'S1.17',
  description: 'Identify a parent function from its equation or graph, and recall its domain or range.',
  generate(rng, difficulty) {
    const fam = rng.pick(PARENTS);
    const names = PARENTS.map((q) => q.name);
    const others = rng.shuffle(names.filter((n) => n !== fam.name)).slice(0, 3);
    if (difficulty === 1) {
      return makeProblem({
        skillId: 'S1.17',
        tags: [],
        prompt: [p('Which parent function is this?'), math(fam.tex)],
        answer: makeChoice(rng, fam.name, others),
        hints: [
          'Look at what happens to $x$: is it raised to a power, inside a square root, inside absolute value bars, or used as an exponent?',
          'A power of 2 makes a quadratic, and $x$ with no power makes a linear function.',
          'If $x$ is the exponent, as in $2^x$, the function is exponential.',
          'The symbol $\\sqrt{\\ }$ is a square root, $\\sqrt[3]{\\ }$ (with a small 3) is a cube root, and $|\\ |$ means absolute value.',
        ],
        solution: [
          { text: 'Identify what is done to $x$.', tex: fam.tex, why: 'The operation applied to $x$ names the family.' },
          { text: `This is the ${fam.name.toLowerCase()} parent function.`, why: `Its graph is ${fam.shape}.` },
        ],
        misconceptions: [],
      });
    }
    if (difficulty === 2) {
      return makeProblem({
        skillId: 'S1.17',
        tags: ['graph'],
        prompt: [
          p('Which parent function is graphed?'),
          { t: 'graph', spec: { xMin: -9, xMax: 9, yMin: -4, yMax: 10, functions: [{ expr: fam.expr }], ariaLabel: `The graph is ${fam.shape}.` } },
        ],
        answer: makeChoice(rng, fam.name, others),
        hints: [
          'Is the graph a straight line, or does it curve or bend?',
          'A sharp V point means absolute value; a smooth U means quadratic.',
          'A curve that starts at a point and only goes right is a square root; an S shape lying on its side that keeps going left and right is a cube root.',
          'A curve that hugs the $x$-axis on the left and shoots up on the right is exponential.',
        ],
        solution: [
          { text: 'Describe the shape.', why: `The graph is ${fam.shape}.` },
          { text: `That is the ${fam.name.toLowerCase()} parent function.`, tex: fam.tex },
        ],
        misconceptions: [],
      });
    }
    if (rng.bool()) return featureProblem(rng);
    // domain or range
    const askRange = fam.name === 'Square root' || fam.name === 'Cube root' ? rng.bool() : true;
    const correct = askRange ? fam.range : fam.domain;
    const pool = ['All real numbers', '$y \\ge 0$', '$y > 0$', '$x \\ge 0$', '$y \\le 0$'].filter((o) => o !== correct);
    const distractors = rng.shuffle(pool).slice(0, 3);
    return makeProblem({
      skillId: 'S1.17',
      tags: [],
      prompt: [p(`What is the ${askRange ? 'range' : 'domain'} of the parent function $${fam.tex}$?`)],
      answer: makeChoice(rng, correct, distractors),
      hints: [
        askRange ? 'The range is the set of all outputs ($y$-values) the function can produce.' : 'The domain is the set of all inputs ($x$-values) you are allowed to use.',
        `Picture the graph: ${fam.shape}.`,
        askRange ? 'Can the output ever be negative? Can it be exactly 0?' : fam.name === 'Cube root' ? 'Can you take the cube root of a negative number? What number cubed gives $-8$?' : 'Can you take the square root of a negative number and get a real number?',
        'Try a few inputs, like $-4$, $0$ and $4$, and look at the outputs.',
      ],
      solution: [
        { text: 'Think about the graph.', why: `The graph is ${fam.shape}.` },
        { text: `The ${askRange ? 'range' : 'domain'} is: ${correct}.`, why: fam.name === 'Exponential' ? '$2^x$ is always positive, but it never reaches 0.' : fam.name === 'Square root' ? 'Square roots of negative numbers are not real, and a square root is never negative.' : fam.name === 'Cube root' ? 'Every real number has exactly one real cube root: $\\sqrt[3]{-8} = -2$ because $(-2)^3 = -8$. So any real number can go in, and any real number can come out.' : fam.name === 'Quadratic' || fam.name === 'Absolute value' ? 'Squares and absolute values are never negative, and both equal 0 when $x = 0$.' : 'The graph keeps going up and down forever.' },
      ],
      misconceptions: [],
    });
  },
  verify(pr) {
    if (pr.answer.kind !== 'choice') return ['wrong kind'];
    const label = choiceLabel(pr.answer);
    const first = (pr.prompt[0] as { text?: string }).text ?? '';
    if (first === FEATURE_ASK) return verifyFeature((pr.prompt[1] as { text: string }).text, pr.answer);
    const g = pr.prompt.find((b) => b.t === 'graph') as { spec: { functions: Array<{ expr: string }> } } | undefined;
    const mb = pr.prompt.find((b) => b.t === 'math') as { tex: string } | undefined;
    if (g) return fingerprint(g.spec.functions[0].expr) === label ? [] : ['graph is not the chosen family'];
    if (mb) {
      const expr = mb.tex.replace('f(x) = ', '').replace('\\sqrt[3]{x}', 'cbrt(x)').replace('\\sqrt{x}', 'sqrt(x)').replace('|x|', 'abs(x)');
      return fingerprint(expr) === label ? [] : ['equation is not the chosen family'];
    }
    // domain/range: sample the function numerically
    const text = (pr.prompt[0] as { text: string }).text;
    const mm = /(range|domain) of the parent function \$f\(x\) = (.+?)\$/.exec(text);
    if (!mm) return ['cannot parse'];
    const ast = parseExpression(mm[2].replace('\\sqrt[3]{x}', 'cbrt(x)').replace('\\sqrt{x}', 'sqrt(x)').replace('|x|', 'abs(x)'));
    const xs = Array.from({ length: 81 }, (_, i) => -10 + i * 0.25);
    const ys = xs.map((x) => evalNumeric(ast, { x }));
    const defined = xs.filter((_, i) => Number.isFinite(ys[i]));
    const vals = ys.filter((y) => Number.isFinite(y));
    let expect: string;
    if (mm[1] === 'domain') expect = defined[0] === 0 ? '$x \\ge 0$' : 'All real numbers';
    else {
      const min = Math.min(...vals);
      expect = min < -1 ? 'All real numbers' : min === 0 ? '$y \\ge 0$' : '$y > 0$';
    }
    return label === expect ? [] : [`expected ${expect}`];
  },
};

// ---------------------------------------------------------------------------
// Linear vs nonlinear
// ---------------------------------------------------------------------------

type Rule = { tex: string; f: (x: Rational) => Rational; linear: boolean; why: string };

function nonlinearRule(rng: Rng): Rule {
  const k = rng.pick(['sq', 'exp', 'sqoff'] as const);
  if (k === 'sq') {
    const a = rng.nonzeroInt(-3, 3);
    return { tex: `y = ${a === 1 ? '' : a === -1 ? '-' : a}x^2`, f: (x) => x.mul(x).mul(a), linear: false, why: 'it squares $x$' };
  }
  if (k === 'exp') {
    const b = rng.pick([2, 3]);
    return { tex: `y = ${b}^x`, f: (x) => Q(b).pow(x.toInt()), linear: false, why: '$x$ is an exponent' };
  }
  const c = rng.int(-5, 5);
  return { tex: `y = x^2 ${c < 0 ? '- ' + -c : '+ ' + c}`, f: (x) => x.mul(x).add(c), linear: false, why: 'it squares $x$' };
}

function linearRule(rng: Rng): Rule {
  const m = rng.nonzeroInt(-6, 6);
  const b = rng.int(-9, 9);
  return { tex: `y = ${m === 1 ? '' : m === -1 ? '-' : m}x ${b < 0 ? '- ' + -b : '+ ' + b}`, f: (x) => x.mul(m).add(b), linear: true, why: '' };
}

const EQ_BANK: Array<{ tex: string; plain: string; linear: boolean; why: string }> = [
  { tex: '2x + 3y = 12', plain: '2x + 3y = 12', linear: true, why: 'Both variables appear only to the first power. Solving for $y$ gives $y = -\\frac{2}{3}x + 4$, a line.' },
  { tex: 'y = \\frac{x}{4} - 7', plain: 'y = x/4 - 7', linear: true, why: '$\\frac{x}{4}$ is the same as $\\frac{1}{4}x$, so the slope is $\\frac{1}{4}$.' },
  { tex: 'y = 5 - 3x', plain: 'y = 5 - 3x', linear: true, why: 'It is $y = -3x + 5$ written in a different order.' },
  { tex: 'y = 6', plain: 'y = 6', linear: true, why: 'A constant function is a horizontal line, which is linear with slope 0.' },
  { tex: 'y = x(x + 1)', plain: 'y = x(x + 1)', linear: false, why: 'Multiplying out gives $x^2 + x$, which has an $x^2$ term.' },
  { tex: 'y = 3x^2 + 1', plain: 'y = 3x^2 + 1', linear: false, why: 'The $x^2$ term makes it quadratic.' },
  { tex: 'y = 4^x', plain: 'y = 4^x', linear: false, why: '$x$ is an exponent, so the function is exponential.' },
  { tex: 'y = \\frac{8}{x}', plain: 'y = 8/x', linear: false, why: '$x$ is in the denominator, so equal steps in $x$ do not give equal changes in $y$.' },
  { tex: 'y = |x| - 2', plain: 'y = abs(x) - 2', linear: false, why: 'The absolute value makes a V shape, which bends at $x = 0$.' },
  { tex: 'y - 4 = 2(x + 1)', plain: 'y - 4 = 2(x + 1)', linear: true, why: 'This is point-slope form of a line with slope 2.' },
  { tex: 'y = \\sqrt[3]{x}', plain: 'y = cbrt(x)', linear: false, why: 'This is the cube root parent function. Its graph is an S lying on its side, not a line: $\\sqrt[3]{1} = 1$ but $\\sqrt[3]{8}$ is only $2$.' },
];

const YES = 'Linear';
const NO = 'Not linear';

export const genLinearVsNonlinear: GeneratorDef = {
  id: 'u1.linear-vs-nonlinear',
  skillId: 'S1.17',
  description: 'Decide from a table or an equation whether a function is linear.',
  generate(rng, difficulty) {
    if (difficulty === 2) {
      const e = rng.pick(EQ_BANK);
      return makeProblem({
        skillId: 'S1.17',
        tags: [],
        prompt: [p('Is this equation a linear function?'), math(e.tex)],
        answer: makeChoice(rng, e.linear ? YES : NO, [e.linear ? NO : YES]),
        hints: [
          'A linear equation can be written as $y = mx + b$.',
          'Look for $x$ raised to a power other than 1, $x$ in an exponent, $x$ in a denominator, or $x$ inside absolute value bars or a square root.',
          'Multiply out or rearrange the equation if you need to.',
          'Equations like $Ax + By = C$ are linear even though $y$ is not by itself.',
        ],
        solution: [
          { text: 'Check how $x$ and $y$ appear.', tex: e.tex, why: e.why },
          { text: e.linear ? 'So the equation is linear.' : 'So the equation is not linear.' },
        ],
        misconceptions: [],
      });
    }
    // table, equal steps (d1) or uneven steps (d3)
    const linear = rng.bool();
    const rule = linear ? linearRule(rng) : nonlinearRule(rng);
    let xs: number[];
    if (difficulty === 1) {
      const x0 = rng.int(-2, 1);
      xs = [0, 1, 2, 3, 4].map((k) => x0 + k);
    } else {
      xs = pickDistinct(rng, 5, -3, 6).sort((u, w) => u - w);
      if (rule.tex.includes('^x')) xs = xs.map((x) => Math.max(x, 0)).filter((x, i, arr) => arr.indexOf(x) === i);
      if (xs.length < 4) xs = [0, 1, 3, 4];
    }
    const ys = xs.map((x) => rule.f(Q(x)));
    const diffs = ys.slice(1).map((y, i) => y.sub(ys[i]));
    return makeProblem({
      skillId: 'S1.17',
      tags: [],
      prompt: [p('Does this table show a linear function?'), { t: 'table', headers: ['x', 'y'], rows: xs.map((x, i) => [String(x), ys[i].toString()]) }],
      answer: makeChoice(rng, linear ? YES : NO, [linear ? NO : YES]),
      hints: [
        'A function is linear when its rate of change is constant.',
        difficulty === 1 ? 'The $x$-values go up by 1 each time. Find the change in $y$ between each pair of rows.' : 'The $x$-values do not go up by the same amount, so compare rates: change in $y$ divided by change in $x$.',
        'If every rate (or difference) is the same, the function is linear.',
        'One different rate is enough to show the function is not linear.',
      ],
      solution: [
        {
          text: difficulty === 1 ? 'Find the change in $y$ for each step of 1 in $x$.' : 'Find the rate of change between each pair of rows.',
          tex: (difficulty === 1 ? diffs : diffs.map((d, i) => d.div(xs[i + 1] - xs[i]))).map((d) => d.toTex()).join(',\\ '),
          why: 'A constant rate of change is what makes a graph a straight line.',
        },
        { text: linear ? 'The rate is the same every time, so the function is linear.' : 'The rate changes, so the function is not linear.' },
      ],
      misconceptions: [],
    });
  },
  verify(pr) {
    if (pr.answer.kind !== 'choice') return ['wrong kind'];
    const says = choiceLabel(pr.answer) === YES;
    const table = pr.prompt.find((b) => b.t === 'table') as { rows: string[][] } | undefined;
    if (table) {
      const pts = table.rows.map((r) => [Rational.parse(r[0]), Rational.parse(r[1])] as const);
      const rates = pts.slice(1).map((q, i) => q[1].sub(pts[i][1]).div(q[0].sub(pts[i][0])));
      const isLinear = rates.every((r) => r.eq(rates[0]));
      return isLinear === says ? [] : ['classification mismatch'];
    }
    const mb = pr.prompt.find((b) => b.t === 'math') as { tex: string };
    const e = EQ_BANK.find((q) => q.tex === mb.tex);
    if (!e) return ['unknown equation'];
    // independent check: a relation is linear iff (lhs - rhs) is a polynomial of total degree <= 1 that involves y
    let isLinear = false;
    try {
      const [l, r] = e.plain.split('=');
      const poly = toPoly(parseExpression(l)).sub(toPoly(parseExpression(r)));
      isLinear = poly.degree() <= 1 && !poly.coeff('y', 1).isZero();
    } catch {
      isLinear = false; // not a polynomial (exponent, division by x, absolute value)
    }
    return isLinear === says ? [] : ['classification mismatch'];
  },
};

export const U1_PARENT_GENERATORS = [genParentFunctions, genLinearVsNonlinear];
