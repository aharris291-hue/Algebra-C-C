/**
 * Unit 4, Lessons 16-19 generators: forms and maximum/minimum (S4.18), average rate of change
 * (S4.19), creating quadratic models (S4.20) and comparing functions (S4.21). verify() re-reads
 * the printed function, table, graph or story and re-derives the answer exactly.
 */
import type { GeneratorDef, Rng, ProblemStep, GraphSpec, Block } from '../../core/curriculum/types';
import type { Misconception } from '../../core/math/answers';
import { isVertexForm, isCompletelyFactored, isExpandedForm, parseRelation } from '../../core/math/answers';
import { parseExpression } from '../../core/math/parser';
import { toPoly, Poly } from '../../core/math/poly';
import { Rational } from '../../core/math/rational';
import { p, makeProblem, makeChoice, choiceLabel, numStr, Q, money } from './util';
import { tailTex } from './u4-common';
import { X, pTex, pPlain, plainPoly, ev, vertexOf, vtxTex, vtxPlain, vtxPoly, factTex, factPlain, factPoly, rhsPoly, mathBlocks, promptText, graphOf, subTex, coefTex } from './u4-common';

const nz = (rng: Rng, lo: number, hi: number) => rng.nonzeroInt(lo, hi);
const numSpec = (v: Rational, unit?: string) => ({ kind: 'number' as const, value: numStr(v), ...(unit ? { unit } : {}) });
const gexpr = (poly: Poly) => pPlain(poly).replace(/\s+/g, '');
type Hints = [string, string, string, string];

// ---------------------------------------------------------------------------
// S4.18: rewrite forms; maximum and minimum
// ---------------------------------------------------------------------------

export const genRewriteForms: GeneratorDef = {
  id: 'u4.rewrite-forms',
  skillId: 'S4.18',
  description: 'Rewrite a quadratic function among vertex, standard and factored form.',
  generate(rng, difficulty) {
    const mode = difficulty === 1 ? 'v2s' : difficulty === 2 ? rng.pick(['f2s', 's2f'] as const) : 'f2v';
    const a = mode === 'v2s' ? rng.pick([1, 2, 3, -1, -2]) : mode === 's2f' ? rng.pick([1, 1, -1, 2, 3]) : rng.pick([1, 2, -1, -2, 3]);
    let fromTex: string;
    let target: string;
    let form: 'expanded' | 'factored' | 'vertex';
    let f: Poly;
    const misconceptions: Misconception[] = [];
    let hints: Hints;
    let solution;
    const steps: ProblemStep[] = [];
    let r = 0;
    let s = 0;
    const pickZeros = (even: boolean) => {
      do {
        r = rng.int(-7, 7);
        s = rng.int(-7, 7);
      } while (r === s || r + s === 0 || r === 0 || s === 0 || (even && (r + s) % 2 !== 0));
    };
    if (mode === 'v2s') {
      const h = nz(rng, -6, 6);
      const k = rng.int(-9, 9);
      f = vtxPoly(a, h, k);
      fromTex = vtxTex(a, h, k);
      target = pPlain(f);
      form = 'expanded';
      const wrong = X([h * h, 0, 1]).scale(Q(a)).add(X([k]));
      misconceptions.push({ answer: pPlain(wrong), tag: 'distribution', feedback: '$(x - h)^{2}$ is $(x - h)(x - h)$, which has a middle term $-2hx$. It is not $x^{2} + h^{2}$.' });
      hints = ['Expand the square first: $(x - h)^{2} = (x - h)(x - h)$.', `$\\left(x ${h < 0 ? '+' : '-'} ${Math.abs(h)}\\right)^{2} = x^{2} ${h < 0 ? '+' : '-'} ${2 * Math.abs(h)}x + ${h * h}$.`, a === 1 ? 'Then add the constant.' : `Then multiply every term by $${a}$.`, 'Combine the constant terms last.'];
      solution = [
        { text: 'Expand the square.', tex: `${coefTex(a)}\\left(${pTex(X([h * h, -2 * h, 1]))}\\right)${k === 0 ? '' : k < 0 ? ` - ${-k}` : ` + ${k}`}`, why: '$(x - h)^{2} = x^{2} - 2hx + h^{2}$.' },
        { text: a === 1 ? 'Combine the constants.' : `Distribute $${a}$ and combine the constants.`, tex: pTex(f) },
      ];
    } else if (mode === 'f2s') {
      pickZeros(false);
      f = factPoly(a, r, s);
      fromTex = factTex(a, r, s);
      target = pPlain(f);
      form = 'expanded';
      const wrong = X([r * s, 0, 1]).scale(Q(a));
      misconceptions.push({ answer: pPlain(wrong), tag: 'distribution', feedback: 'Multiply every term of one binomial by every term of the other. The two middle products give the $x$ term.' });
      hints = ['Multiply the two binomials first, using the distributive property (or a box).', `The $x$ term comes from the two middle products: $${-s}x$ and $${-r}x$.`, a === 1 ? 'Combine like terms.' : `Then multiply every term by $${a}$.`, 'Check: the constant term should be $a$ times the product of the numbers in the binomials.'];
      solution = [
        { text: 'Multiply the binomials.', tex: `${coefTex(a)}${a === 1 ? '' : '\\left('}${pTex(factPoly(1, r, s))}${a === 1 ? '' : '\\right)'}`, why: `$x \\cdot x$, the two middle products $${-s}x + ${-r < 0 ? `(${-r}x)` : `${-r}x`}$, and $${-r} \\cdot ${subTex(-s)}$.` },
        ...(a === 1 ? [] : [{ text: `Distribute $${a}$.`, tex: pTex(f) }]),
      ];
    } else if (mode === 's2f') {
      pickZeros(false);
      f = factPoly(a, r, s);
      fromTex = pTex(f);
      target = factPlain(a, r, s);
      form = 'factored';
      misconceptions.push({ answer: factPlain(a, -r, -s), tag: 'sign-error', feedback: 'Multiply your answer back out. Check the sign of the $x$ term and the constant.' });
      hints = [a === 1 ? 'Look for two numbers that multiply to the constant and add to the $x$-coefficient.' : `Factor out the GCF, $${a}$, first.`, 'List factor pairs of the constant term inside.', 'Pick the pair whose sum is the $x$-coefficient (with signs).', 'Check by multiplying your factors back out.'];
      solution = [
        ...(a === 1 ? [] : [{ text: `Factor out $${a}$.`, tex: `${coefTex(a)}\\left(${pTex(factPoly(1, r, s))}\\right)` }]),
        { text: 'Factor the trinomial.', tex: factTex(a, r, s), why: `$${-r} \\cdot ${subTex(-s)} = ${r * s}$ and $${-r} + ${subTex(-s)} = ${-(r + s)}$.` },
      ];
    } else {
      pickZeros(true);
      f = factPoly(a, r, s);
      fromTex = factTex(a, r, s);
      const h = (r + s) / 2;
      const k = ev(f, h);
      target = vtxPlain(a, h, k);
      form = 'vertex';
      misconceptions.push({ answer: vtxPlain(a, -h, k), tag: 'vertex-sign', feedback: 'In vertex form $a(x - h)^{2} + k$, a vertex at $x = 3$ gives $(x - 3)^{2}$.' });
      hints = ['The vertex is halfway between the zeros.', `The zeros are $x = ${r}$ and $x = ${s}$.`, 'Substitute the $x$-value of the vertex into $f$ to get $k$.', `The value of $a$ stays the same: $a = ${a}$.`];
      solution = [
        { text: 'Find the zeros and their midpoint.', tex: `h = \\frac{${r} + ${subTex(s)}}{2} = ${h}`, why: 'A parabola is symmetric, so the vertex is halfway between the zeros.' },
        { text: 'Find $k$ by substituting.', tex: `k = f(${h}) = ${a < 0 ? `(${a})` : a} \\cdot ${subTex(h - r)} \\cdot ${subTex(h - s)} = ${k.toTex()}`, why: `$${h} - ${subTex(r)} = ${h - r}$ and $${h} - ${subTex(s)} = ${h - s}$.` },
        { text: 'Write vertex form with the same $a$.', tex: vtxTex(a, h, k), why: 'Both forms describe the same parabola, so the leading coefficient is the same.' },
      ];
      steps.push(
        { prompt: [p(`What is the $x$-coordinate of the vertex of $f(x) = ${fromTex}$?`)], answer: numSpec(Q(h)), hints: ['Find the zeros.', 'Average them.', `$\\frac{${r} + ${subTex(s)}}{2}$.`, 'Simplify.'], explanation: `$h = ${h}$.` },
        { prompt: [p(`What is $f(${h})$?`)], answer: numSpec(k), hints: [`Substitute $${h}$ into each factor.`, `$${h} - ${subTex(r)} = ${h - r}$.`, `$${h} - ${subTex(s)} = ${h - s}$.`, `Multiply those and $${a}$.`], explanation: `$k = ${k.toTex()}$.` },
        { prompt: [p('Write $f$ in vertex form.')], answer: { kind: 'expression', value: target, form }, inputHint: 'Type an answer like 2(x - 3)^2 + 1.', hints: ['Use $a(x - h)^{2} + k$.', `$a = ${a}$.`, `$h = ${h}$.`, `$k = ${k.toTex()}$.`], explanation: `$f(x) = ${vtxTex(a, h, k)}$.`, misconceptions },
      );
    }
    const formName = form === 'expanded' ? 'standard form' : form === 'factored' ? 'factored form' : 'vertex form';
    return makeProblem({
      skillId: 'S4.18',
      tags: mode === 'f2v' ? ['multi-step'] : [],
      prompt: [p(`Write the function in ${formName}.`), { t: 'math', tex: `f(x) = ${fromTex}` }],
      answer: { kind: 'expression', value: target, form },
      inputHint: form === 'expanded' ? 'Type an answer like 2x^2 - 4x + 1.' : form === 'factored' ? 'Type an answer like 2(x - 3)(x + 1).' : 'Type an answer like 2(x - 3)^2 + 1.',
      hints,
      solution,
      misconceptions,
      ...(steps.length ? { steps } : {}),
    });
  },
  verify(pr) {
    if (pr.answer.kind !== 'expression') return ['unexpected kind'];
    const f = rhsPoly(mathBlocks(pr)[0]);
    const n = parseExpression(pr.answer.value);
    const errs: string[] = [];
    // compare at several inputs (a different route from symbolic equality)
    for (const x of [-3, 0, 1, 2, 5]) if (!ev(f, x).eq(ev(toPoly(n), x))) errs.push(`differs at x = ${x}`);
    const form = pr.answer.form;
    if (form === 'vertex' && !isVertexForm(n)) errs.push('not vertex form');
    if (form === 'factored' && !isCompletelyFactored(n)) errs.push('not factored');
    if (form === 'expanded' && !isExpandedForm(n)) errs.push('not expanded');
    return errs;
  },
};

interface MaxCtx {
  story: Block[];
  v: string;
  f: Poly;
  fTex: string;
  unit: string;
  askWhen: string;
  askWhat: string;
  whenUnit: string;
}

function maxContext(rng: Rng): MaxCtx {
  const kind = rng.pick(['launch', 'fence', 'revenue'] as const);
  if (kind === 'launch') {
    const n = rng.int(1, 5);
    const v = 16 * n;
    const h0 = rng.int(0, 10);
    const f = Poly.fromCoeffs('t', [Q(h0), Q(v), Q(-16)]);
    const thing = rng.pick(['football', 'water balloon', 'baseball', 'rubber rocket', 'tennis ball']);
    return {
      story: [p(`A ${thing} is launched upward. Its height in feet after $t$ seconds is modeled by the function below.`)],
      v: 't',
      f,
      fTex: `h(t) = ${pTex(f, 't')}`,
      unit: 'feet',
      askWhen: 'How many seconds after launch does it reach its maximum height?',
      askWhat: 'What is the maximum height, in feet?',
      whenUnit: 'seconds',
    };
  }
  if (kind === 'fence') {
    const P = rng.pick([24, 40, 48, 60, 80, 100, 120]);
    const f = Poly.fromCoeffs('x', [Q(0), Q(P / 2), Q(-1)]);
    const what = rng.pick(['dog run', 'garden', 'chicken coop yard', 'play area']);
    return {
      story: [p(`You have $${P}$ feet of fencing to make a rectangular ${what}. If one side is $x$ feet long, the other side is $${P / 2} - x$ feet, so the area in square feet is modeled by the function below.`)],
      v: 'x',
      f,
      fTex: `A(x) = x\\left(${P / 2} - x\\right)`,
      unit: 'square feet',
      askWhen: 'What side length $x$ gives the maximum area?',
      askWhat: 'What is the maximum area, in square feet?',
      whenUnit: 'feet',
    };
  }
  // revenue: price p, sells N - m p
  const m = rng.pick([2, 4, 5, 10, 20]);
  const best = rng.pick([3, 4, 5, 6, 8, 10, 12]);
  const N = 2 * m * best;
  const [item, unitWord] = rng.pick([['phone cases', 'cases'], ['smoothies', 'smoothies'], ['tickets to a school play', 'tickets'], ['custom stickers', 'stickers'], ['tacos', 'tacos']] as const);
  const f = Poly.fromCoeffs('p', [Q(0), Q(N), Q(-m)]);
  return {
    story: [p(`A student business sells ${item}. At a price of $p$ dollars each, it sells $${N} - ${m}p$ ${unitWord} per day, so the daily revenue in dollars is modeled by the function below.`)],
    v: 'p',
    f,
    fTex: `R(p) = p\\left(${N} - ${m}p\\right)`,
    unit: 'dollars',
    askWhen: 'What price gives the maximum revenue?',
    askWhat: 'What is the maximum daily revenue, in dollars?',
    whenUnit: 'dollars',
  };
}

export const genMaxMin: GeneratorDef = {
  id: 'u4.max-min',
  skillId: 'S4.18',
  description: 'Find the maximum or minimum value of a quadratic function, including in context.',
  generate(rng, difficulty) {
    if (difficulty === 3) {
      const c = maxContext(rng);
      const { a, b, h, k } = vertexOf(c.f, c.v);
      const name = c.fTex.charAt(0);
      const misconceptions: Misconception[] = [{ answer: numStr(h), tag: 'graph-reading', feedback: `That is when (or where) the maximum happens. The question asks for the maximum value of $${name}$.` }];
      return makeProblem({
        skillId: 'S4.18',
        tags: ['real-world', 'multi-step'],
        prompt: [...c.story, { t: 'math', tex: c.fTex }, p(c.askWhat)],
        answer: numSpec(k, c.unit),
        hints: [
          'The maximum is at the vertex, because the parabola opens down.',
          c.fTex.includes('\\left(') ? 'Multiply it out to standard form, or average the two zeros, to find the vertex.' : `Use $${c.v} = -\\frac{b}{2a}$.`,
          `Find the input of the vertex, then substitute it into $${name}(${c.v})$.`,
          'The maximum value is the output, not the input.',
        ],
        solution: [
          ...(c.fTex.includes('\\left(') ? [{ text: 'Write in standard form.', tex: `${name}(${c.v}) = ${pTex(c.f, c.v)}` }] : []),
          { text: 'Find the input of the vertex.', tex: `${c.v} = -\\frac{${b.toTex()}}{2(${a.toTex()})} = ${h.toTex()}`, why: `$a = ${a.toTex()} < 0$, so the vertex is the highest point.` },
          { text: 'Substitute to find the maximum.', tex: `${name}(${h.toTex()}) = ${k.toTex()}`, why: c.unit === 'dollars' ? `The maximum revenue is ${money(k)}, at a price of ${money(h)}.` : `The maximum is $${k.toTex()}$ ${c.unit}.` },
        ],
        misconceptions,
        steps: [
          { prompt: [p(c.askWhen)], answer: numSpec(h), hints: [`$a = ${a.toTex()}$, $b = ${b.toTex()}$.`, `Use $${c.v} = -\\frac{b}{2a}$.`, `$2a = ${a.mul(2).toTex()}$.`, 'Simplify the fraction.'], explanation: `$${c.v} = ${h.toTex()}$ ${c.whenUnit}.` },
          { prompt: [p(c.askWhat)], answer: numSpec(k, c.unit), hints: [`Find $${name}(${h.toTex()})$.`, 'Substitute and square first.', 'Then multiply and add.', 'This is the output at the vertex.'], explanation: `$${name}(${h.toTex()}) = ${k.toTex()}$.`, misconceptions },
        ],
      });
    }
    const a = rng.pick([1, 2, 3, -1, -2, -3]);
    const h = nz(rng, -6, 6);
    let k = nz(rng, -12, 12);
    if (k === h) k += 1;
    const f = vtxPoly(a, h, k);
    const ftex = difficulty === 1 ? vtxTex(a, h, k) : pTex(f);
    const kind = a > 0 ? 'minimum' : 'maximum';
    const misconceptions: Misconception[] = [{ answer: String(h), tag: 'graph-reading', feedback: `That is where the ${kind} happens ($x$-value). The ${kind} value is the output, $f(x)$.` }];
    if (difficulty === 1 && -h !== k) misconceptions.push({ answer: String(-h), tag: 'vertex-sign', feedback: 'The minimum or maximum value is the $k$ in $a(x - h)^{2} + k$, the number added at the end.' });
    const { b } = vertexOf(f);
    return makeProblem({
      skillId: 'S4.18',
      tags: difficulty === 2 ? ['multi-step'] : [],
      prompt: [p('Does the function have a maximum or a minimum? Find that maximum or minimum value.'), { t: 'math', tex: `f(x) = ${ftex}` }],
      answer: numSpec(Q(k)),
      hints: [
        'If $a > 0$ the parabola opens up and has a minimum; if $a < 0$ it opens down and has a maximum.',
        'The maximum or minimum value is the $y$-value of the vertex.',
        difficulty === 1 ? 'In vertex form $a(x - h)^{2} + k$, read $k$.' : 'Find the vertex with $x = -\\frac{b}{2a}$, then substitute.',
        'The value is an output, not an input.',
      ],
      solution: [
        { text: `$a = ${a}$, so the parabola opens ${a > 0 ? 'up' : 'down'} and has a ${kind}.` },
        difficulty === 1
          ? { text: 'Read the vertex from vertex form.', tex: `(${h}, ${k})`, why: `The ${kind} value is $${k}$, at $x = ${h}$.` }
          : { text: 'Find the vertex.', tex: `x = -\\frac{${b.toTex()}}{2(${a})} = ${h},\\quad f(${h}) = ${k}`, why: `The ${kind} value is $${k}$, at $x = ${h}$.` },
      ],
      misconceptions,
      ...(difficulty === 2
        ? {
            steps: [
              { prompt: [p(`Find the $x$-value of the vertex of $f(x) = ${ftex}$.`)], answer: numSpec(Q(h)), hints: ['Use $x = -\\frac{b}{2a}$.', `$a = ${a}$, $b = ${b.toTex()}$.`, `$2a = ${2 * a}$.`, 'Watch the signs.'], explanation: `$x = ${h}$.` },
              { prompt: [p(`What is the ${kind} value, $f(${h})$?`)], answer: numSpec(Q(k)), hints: [`Substitute $${h}$.`, 'Square first.', 'Then multiply and add.', 'This is the output at the vertex.'], explanation: `$f(${h}) = ${k}$.`, misconceptions },
            ] as ProblemStep[],
          }
        : {}),
    });
  },
  verify(pr) {
    if (pr.answer.kind !== 'number') return ['unexpected kind'];
    const tex = mathBlocks(pr)[0];
    const v = /^[hARf]\((\w)\)/.exec(tex)?.[1] ?? 'x';
    const f = rhsPoly(tex);
    // complete the square: f = a(x + b/2a)^2 + (c - b^2/4a); then confirm nearby values are all on one side
    const [c, b, a] = f.coeffsIn(v);
    const best = c.sub(b.mul(b).div(a.mul(4)));
    const h = b.neg().div(a.mul(2));
    for (const d of [Q(1, 7), Q(1), Q(3), Q(-1, 7), Q(-1), Q(-3)]) if (ev(f, h.add(d), v).sub(best).sign() !== a.sign()) return ['not an extreme value'];
    return Q(pr.answer.value).eq(best) ? [] : [`expected ${best.toString()}`];
  },
};

// ---------------------------------------------------------------------------
// S4.19: average rate of change
// ---------------------------------------------------------------------------

const rateTex = (f1: Rational, f2: Rational, x1: number, x2: number, name = 'f') =>
  `\\frac{${name}(${x2}) - ${name}(${x1})}{${x2} - ${subTex(x1)}} = \\frac{${f2.toTex()} - ${subTex(f1)}}{${x2 - x1}} = ${f2.sub(f1).div(x2 - x1).toTex()}`;

export const genAvgRate: GeneratorDef = {
  id: 'u4.avg-rate',
  skillId: 'S4.19',
  description: 'Find the average rate of change of a quadratic function over an interval.',
  generate(rng, difficulty) {
    const rateMis = (f1: Rational, f2: Rational, x1: number, x2: number): Misconception[] => {
      const out: Misconception[] = [];
      const right = f2.sub(f1).div(x2 - x1);
      const noDiv = f2.sub(f1);
      if (!noDiv.eq(right)) out.push({ answer: numStr(noDiv), tag: 'slope-calc', feedback: 'Divide the change in output by the change in input.' });
      if (!f2.sub(f1).isZero()) {
        const flip = Q(x2 - x1).div(f2.sub(f1));
        if (!flip.eq(right) && !flip.eq(noDiv)) out.push({ answer: numStr(flip), tag: 'rise-run-swap', feedback: 'Average rate of change is change in output over change in input: $\\frac{f(b) - f(a)}{b - a}$.' });
      }
      const sum = f2.add(f1).div(x2 - x1);
      if (!sum.eq(right) && !out.some((o) => Q(o.answer).eq(sum))) out.push({ answer: numStr(sum), tag: 'sign-error', feedback: 'Subtract the outputs: $f(b) - f(a)$. Watch the signs of negative values.' });
      return out;
    };
    if (difficulty === 3) {
      const n = rng.int(2, 4);
      const v = 16 * n + rng.pick([0, 16]);
      const h0 = rng.int(0, 10);
      const f = Poly.fromCoeffs('t', [Q(h0), Q(v), Q(-16)]);
      const thing = rng.pick(['basketball', 'water balloon', 'soccer ball', 'paper airplane rocket']);
      const story = [p(`A ${thing} is launched upward. Its height in feet after $t$ seconds is modeled by the function below.`), { t: 'math' as const, tex: `h(t) = ${pTex(f, 't')}` }];
      if (rng.bool()) {
        // compare two one-second intervals
        // two one-second intervals while the ball is in the air (h(v/16) = h0 >= 0)
        const lastStart = v / 16 - 1;
        const i1 = rng.int(0, lastStart - 1);
        const i2 = rng.int(i1 + 1, lastStart);
        const askLess = rng.bool();
        const r = (t1: number) => ev(f, t1 + 1, 't').sub(ev(f, t1, 't'));
        const r1 = r(i1);
        const r2 = r(i2);
        const L1 = `From $t = ${i1}$ to $t = ${i1 + 1}$`;
        const L2 = `From $t = ${i2}$ to $t = ${i2 + 1}$`;
        const same = 'Both intervals have the same average rate of change';
        const correct = r1.eq(r2) ? same : r1.gt(r2) !== askLess ? L1 : L2;
        return makeProblem({
          skillId: 'S4.19',
          tags: ['real-world', 'multi-step'],
          prompt: [...story, p(`Over which interval does the height have the ${askLess ? 'smaller (more negative)' : 'greater'} average rate of change?`)],
          answer: makeChoice(rng, correct, [L1, L2, same].filter((x) => x !== correct)),
          hints: ['Find the average rate of change over each interval.', 'Use $\\frac{h(b) - h(a)}{b - a}$.', 'Each interval is $1$ second long, so the rate is just the change in height.', askLess ? 'Compare the two rates, including their signs: a negative rate is smaller than a positive one.' : 'Compare the two rates, including their signs.'],
          solution: [
            { text: 'First interval.', tex: rateTex(ev(f, i1, 't'), ev(f, i1 + 1, 't'), i1, i1 + 1, 'h'), why: 'The units are feet per second.' },
            { text: 'Second interval.', tex: rateTex(ev(f, i2, 't'), ev(f, i2 + 1, 't'), i2, i2 + 1, 'h'), why: 'The units are feet per second.' },
            { text: `Compare: $${r1.toTex()}$ and $${r2.toTex()}$.`, why: `Gravity slows the ${thing} on the way up and speeds it up on the way down, so a quadratic's average rate of change is different on different intervals.` },
          ],
          misconceptions: [],
          steps: [
            { prompt: [p(`What is the average rate of change of $h$ from $t = ${i1}$ to $t = ${i1 + 1}$?`)], answer: numSpec(r1, 'ft/s'), hints: [`Find $h(${i1})$ and $h(${i1 + 1})$.`, 'Subtract.', 'Divide by $1$.', 'Units: feet per second.'], explanation: `$${rateTex(ev(f, i1, 't'), ev(f, i1 + 1, 't'), i1, i1 + 1, 'h')}$ ft/s.` },
            { prompt: [p(`What is the average rate of change of $h$ from $t = ${i2}$ to $t = ${i2 + 1}$?`)], answer: numSpec(r2, 'ft/s'), hints: [`Find $h(${i2})$ and $h(${i2 + 1})$.`, 'Subtract.', 'Divide by $1$.', 'Units: feet per second.'], explanation: `$${rateTex(ev(f, i2, 't'), ev(f, i2 + 1, 't'), i2, i2 + 1, 'h')}$ ft/s.` },
          ],
        });
      }
      const land = v / 16; // h(t) > 0 at least until t = v/16 when h0 >= 0
      let t1: number;
      let t2: number;
      do {
        t1 = rng.int(0, land - 1);
        t2 = rng.int(t1 + 1, land);
      } while (t2 - t1 > 3);
      const f1 = ev(f, t1, 't');
      const f2 = ev(f, t2, 't');
      const rate = f2.sub(f1).div(t2 - t1);
      return makeProblem({
        skillId: 'S4.19',
        tags: ['real-world'],
        prompt: [...story, p(`Find the average rate of change of the height from $t = ${t1}$ to $t = ${t2}$ seconds. Include units.`)],
        answer: numSpec(rate, 'ft/s'),
        inputHint: 'Type a number like -24 (units ft/s are optional).',
        hints: ['Average rate of change $= \\frac{h(b) - h(a)}{b - a}$.', `Find $h(${t1})$ and $h(${t2})$.`, 'Subtract the heights, then divide by the change in time.', 'A negative rate means the height is going down on average.'],
        solution: [
          { text: 'Find the heights.', tex: `h(${t1}) = ${f1.toTex()},\\quad h(${t2}) = ${f2.toTex()}` },
          { text: 'Divide the change in height by the change in time.', tex: rateTex(f1, f2, t1, t2, 'h'), why: rate.isNegative() ? `On average the ${thing} falls $${rate.abs().toTex()}$ feet each second over this interval.` : rate.isZero() ? 'It ends at the same height it started, so the average rate is $0$.' : `On average the ${thing} rises $${rate.toTex()}$ feet each second over this interval.` },
        ],
        misconceptions: rateMis(f1, f2, t1, t2),
      });
    }
    const a = rng.pick([1, 2, -1, -2, 3]);
    const b = rng.int(-6, 6);
    const c = rng.int(-9, 9);
    const f = X([c, b, a]);
    let x1: number;
    let x2: number;
    do {
      x1 = rng.int(-4, 3);
      x2 = rng.int(x1 + 1, 5);
    } while (x2 - x1 < 2 || x2 - x1 > 5);
    const f1 = ev(f, x1);
    const f2 = ev(f, x2);
    const rate = f2.sub(f1).div(x2 - x1);
    const common = {
      skillId: 'S4.19',
      answer: numSpec(rate),
      hints: ['Average rate of change $= \\frac{f(b) - f(a)}{b - a}$: change in output over change in input.', `Find $f(${x1})$ and $f(${x2})$.`, 'Subtract in the same order on the top and the bottom.', `The change in input is $${x2} - ${subTex(x1)} = ${x2 - x1}$.`] as Hints,
      solution: [
        { text: 'Find the outputs at the endpoints.', tex: `f(${x1}) = ${f1.toTex()},\\quad f(${x2}) = ${f2.toTex()}` },
        { text: 'Use the average rate of change formula.', tex: rateTex(f1, f2, x1, x2), why: 'It is the slope of the line through the two points on the graph.' },
      ],
      misconceptions: rateMis(f1, f2, x1, x2),
      steps: [
        { prompt: [p(`What is $f(${x2}) - f(${x1})$?`)], answer: numSpec(f2.sub(f1)), hints: [`Find $f(${x2})$.`, `Find $f(${x1})$.`, 'Subtract.', 'Watch negative signs.'], explanation: `$${f2.toTex()} - ${subTex(f1)} = ${f2.sub(f1).toTex()}$.` },
        { prompt: [p('Now divide by the change in $x$. What is the average rate of change?')], answer: numSpec(rate), hints: [`The change in $x$ is $${x2 - x1}$.`, 'Divide.', 'Simplify the fraction.', 'Keep the sign.'], explanation: `$\\frac{${f2.sub(f1).toTex()}}{${x2 - x1}} = ${rate.toTex()}$.` },
      ] as ProblemStep[],
    };
    if (difficulty === 1) {
      return makeProblem({
        ...common,
        tags: [],
        prompt: [p(`Find the average rate of change of $f$ from $x = ${x1}$ to $x = ${x2}$.`), { t: 'math', tex: `f(x) = ${pTex(f)}` }],
      });
    }
    const xs = [];
    for (let x = x1 - 1; x <= x2 + 1; x++) if (xs.length < 7) xs.push(x);
    if (!xs.includes(x2)) xs.push(x2);
    return makeProblem({
      ...common,
      tags: [],
      prompt: [
        p(`The table shows values of a quadratic function $f$. Find the average rate of change of $f$ from $x = ${x1}$ to $x = ${x2}$.`),
        { t: 'table', headers: ['$x$', '$f(x)$'], rows: xs.map((x) => [`$${x}$`, `$${ev(f, x).toTex()}$`]) },
      ],
    });
  },
  verify(pr) {
    const text = promptText(pr);
    const tbl = (pr.prompt as Block[]).find((b) => b.t === 'table') as Extract<Block, { t: 'table' }> | undefined;
    let val: (x: number) => Rational;
    if (tbl) {
      const m = new Map(tbl.rows.map((r) => [Number(r[0].replace(/\$/g, '')), toPoly(parseExpression(r[1].replace(/\$/g, '').replace(/\\frac\{(-?\d+)\}\{(\d+)\}/, '($1/$2)'))).constantValue()]));
      // the table must be quadratic: constant nonzero second differences
      const xs = [...m.keys()].sort((x, y) => x - y);
      const d2 = xs.slice(2).map((x, i) => m.get(x)!.sub(m.get(xs[i + 1])!.mul(2)).add(m.get(xs[i])!));
      if (xs.some((x, i) => i > 0 && x - xs[i - 1] !== 1) || d2.some((d) => !d.eq(d2[0])) || d2[0].isZero()) return ['table is not a quadratic with step 1'];
      val = (x) => m.get(x)!;
    } else {
      const tex = mathBlocks(pr)[0];
      const v = tex.startsWith('h(t)') ? 't' : 'x';
      const f = rhsPoly(tex);
      val = (x) => ev(f, x, v);
    }
    if (pr.answer.kind === 'choice') {
      const re = /From \$t = (\d+)\$ to \$t = (\d+)\$/g;
      const ints = pr.answer.options.map((o) => [...o.label.matchAll(re)][0]).filter(Boolean).map((mm) => [Number(mm![1]), Number(mm![2])]);
      const rates = ints.map(([u, w]) => val(w).sub(val(u)).div(w - u));
      const label = choiceLabel(pr.answer);
      const less = /smaller/.test(text);
      const want = rates[0].eq(rates[1]) ? -1 : rates[0].gt(rates[1]) !== less ? 0 : 1;
      for (const [u, w] of ints) if (val(u).isNegative() || val(w).isNegative()) return ['interval after landing'];
      if (want === -1) return /same/.test(label) ? [] : ['should be same'];
      const mm = [...label.matchAll(re)][0];
      return mm && Number(mm[1]) === ints[want][0] ? [] : ['wrong interval'];
    }
    if (pr.answer.kind !== 'number') return ['unexpected kind'];
    const m = /from \$[xt] = (-?\d+)\$ to \$[xt] = (-?\d+)\$/.exec(text);
    if (!m) return ['cannot read interval'];
    const [a, b] = [Number(m[1]), Number(m[2])];
    if (/height/.test(text) && (val(a).isNegative() || val(b).isNegative())) return ['interval includes a negative height'];
    // the slope of the secant line, computed as the mean of the derivative-free midpoint formula a(x1 + x2) + b would reuse coefficients; use the raw definition
    const want = val(b).sub(val(a)).div(b - a);
    return Q(pr.answer.value).eq(want) ? [] : [`expected ${want.toString()}`];
  },
};

// ---------------------------------------------------------------------------
// S4.20: creating quadratic models
// ---------------------------------------------------------------------------

/** y = rhs answer text for equation answers. */
const yEq = (rhs: string) => `y = ${rhs}`;

function eqRhsPoly(value: string): Poly {
  const r = parseRelation(value);
  return toPoly(r.rhs);
}

export const genWriteVertexForm: GeneratorDef = {
  id: 'u4.write-vertex-form',
  skillId: 'S4.20',
  description: 'Write a quadratic equation in vertex form from the vertex and one more point.',
  generate(rng, difficulty) {
    const A = difficulty === 3 ? rng.pick([Q(1, 2), Q(-1, 2), Q(1, 4), Q(-1, 4), Q(1, 3), Q(-1, 3), Q(2), Q(-3)]) : Q(rng.pick([1, 2, 3, -1, -2, -3]));
    const h = difficulty === 2 ? rng.int(-3, 3) : nz(rng, -5, 5);
    const k = difficulty === 2 ? rng.int(-4, 4) : rng.int(-9, 9);
    const yInt = difficulty === 3 && A.isInteger();
    const d = A.isInteger() ? (difficulty === 2 ? rng.pick([1, 2, -1, -2]) : rng.pick([1, 2, 3, -1, -2])) : A.toString().endsWith('3') ? rng.pick([3, -3]) : rng.pick([2, -2, 4]);
    const x1 = yInt ? 0 : h + d;
    const f = vtxPoly(A, h, k);
    const y1 = ev(f, x1);
    const value = yEq(vtxPlain(A, h, k));
    const vtxText = `vertex $(${h}, ${k})$`;
    const ptText = `passes through $(${x1}, ${y1.toTex()})$`;
    const prompt: Block[] = [];
    if (difficulty === 2) {
      const ys = [k, y1.toNumber(), ev(f, h + 3).toNumber()];
      const lo = Math.min(...ys.filter((y) => Math.abs(y) < 30), 0) - 1;
      const hi = Math.max(...ys.filter((y) => Math.abs(y) < 30), 0) + 1;
      const spec: GraphSpec = {
        xMin: Math.min(h - 5, -1),
        xMax: Math.max(h + 5, 1),
        yMin: Math.floor(lo),
        yMax: Math.ceil(hi),
        yStep: hi - lo > 24 ? 5 : hi - lo > 12 ? 2 : 1,
        functions: [{ expr: gexpr(f) }],
        points: [{ x: h, y: k, label: `vertex (${h}, ${k})` }, { x: x1, y: y1.toNumber(), label: `(${x1}, ${y1.toString()})` }],
        ariaLabel: `A parabola with vertex (${h}, ${k}) passing through (${x1}, ${y1.toString()}).`,
      };
      prompt.push(p(`The parabola has ${vtxText} and ${ptText}, as labeled on the graph. Write its equation in vertex form.`), { t: 'graph', spec });
    } else prompt.push(p(`A parabola has ${vtxText} and ${ptText}${yInt ? ' (its $y$-intercept)' : ''}. Write its equation in vertex form, $y = a(x - h)^{2} + k$.`));
    const dd = x1 - h;
    const withVertex = `y = a${h === 0 ? 'x' : `\\left(x ${h < 0 ? '+' : '-'} ${Math.abs(h)}\\right)`}^{2}${tailTex(k)}`;
    const misconceptions: Misconception[] = [{ answer: yEq(vtxPlain(A, -h, k)), tag: 'vertex-sign', feedback: 'A vertex at $x = h$ gives $(x - h)^{2}$. For $h = 2$ that is $(x - 2)^{2}$; for $h = -2$ it is $(x + 2)^{2}$.' }];
    const wrongA = y1.sub(k);
    if (!wrongA.eq(A) && !h.toString().startsWith('0') && dd * dd !== 1) misconceptions.push({ answer: yEq(vtxPlain(wrongA, h, k)), tag: 'arithmetic-error', feedback: `After subtracting $k$, divide by $(x - h)^{2}$, which is $${dd * dd}$ here.` });
    return makeProblem({
      skillId: 'S4.20',
      tags: difficulty === 2 ? ['graph'] : [],
      prompt,
      answer: { kind: 'equation', value, form: 'vertex' },
      inputHint: 'Type an equation like y = 2(x - 3)^2 + 1.',
      hints: [
        'Start with $y = a(x - h)^{2} + k$ and put in the vertex.',
        `With the vertex: $${withVertex}$.`,
        `Substitute the other point, $x = ${x1}$ and $y = ${y1.toTex()}$, and solve for $a$.`,
        'Write the equation with your value of $a$, and check that the point works.',
      ],
      solution: [
        { text: 'Substitute the vertex.', tex: withVertex },
        { text: 'Substitute the other point.', tex: `${y1.toTex()} = a\\left(${dd}\\right)^{2}${tailTex(k)} \\Rightarrow ${y1.sub(k).toTex()} = ${dd * dd === 1 ? '' : dd * dd}a`, why: `$(${x1} - ${subTex(h)})^{2} = ${dd * dd}$.` },
        ...(dd * dd === 1 ? [] : [{ text: `Divide both sides by $${dd * dd}$.`, tex: `a = ${A.toTex()}` }]),
        { text: 'Write the equation.', tex: `y = ${vtxTex(A, h, k)}`, why: `Check: at $x = ${x1}$, $y = ${y1.toTex()}$.` },
      ],
      misconceptions: misconceptions.filter((m) => m.answer !== value),
      steps: [
        { prompt: [p(`Substitute the vertex and the point $(${x1}, ${y1.toTex()})$ into $y = a(x - h)^{2} + k$. What is $a$?`)], answer: numSpec(A), hints: [`$${y1.toTex()} = a(${x1} - ${subTex(h)})^{2}${tailTex(k)}$.`, `$(${x1} - ${subTex(h)})^{2} = ${dd * dd}$.`, k === 0 ? 'Here $k = 0$, so there is nothing to subtract.' : `${k < 0 ? 'Add' : 'Subtract'} $${Math.abs(k)}$ ${k < 0 ? 'to' : 'from'} both sides.`, dd * dd === 1 ? 'What is left is $a$.' : `Divide by $${dd * dd}$.`], explanation: `$a = ${A.toTex()}$.` },
        { prompt: [p('Write the equation in vertex form.')], answer: { kind: 'equation', value, form: 'vertex' }, inputHint: 'Type an equation like y = 2(x - 3)^2 + 1.', hints: ['Use $y = a(x - h)^{2} + k$.', `$a = ${A.toTex()}$.`, `$h = ${h}$ and $k = ${k}$.`, 'Watch the sign inside the parentheses.'], explanation: `$y = ${vtxTex(A, h, k)}$.`, misconceptions: misconceptions.filter((m) => m.answer !== value) },
      ],
    });
  },
  verify(pr) {
    if (pr.answer.kind !== 'equation') return ['unexpected kind'];
    const text = promptText(pr);
    const m = /vertex \$\((-?\d+), (-?\d+)\)\$ and passes through \$\((-?\d+), (-?[\d\\{}frac]+)\)\$/.exec(text);
    if (!m) return ['cannot read points'];
    const g = eqRhsPoly(pr.answer.value);
    const y1 = toPoly(parseExpression(m[4].replace(/\\frac\{(\d+)\}\{(\d+)\}/, '($1/$2)').replace(/^-\\frac/, '-'))).constantValue();
    const { h, k } = vertexOf(g);
    const errs: string[] = [];
    if (!h.eq(Number(m[1])) || !k.eq(Number(m[2]))) errs.push('wrong vertex');
    if (!ev(g, Number(m[3])).eq(y1)) errs.push('misses the point');
    const spec = graphOf(pr);
    if (spec) for (const q of spec.points ?? []) if (!ev(g, Q(String(q.x))).eq(Q(String(q.y)))) errs.push('graph point not on the answer');
    if (spec && !toPoly(parseExpression(spec.functions![0].expr)).equals(g)) errs.push('graph is a different parabola');
    return errs;
  },
};

export const genWriteFactoredForm: GeneratorDef = {
  id: 'u4.write-factored-form',
  skillId: 'S4.20',
  description: 'Write a quadratic equation in factored form from its x-intercepts and one more point.',
  generate(rng, difficulty) {
    let r: number;
    let s: number;
    do {
      r = rng.int(-6, 6);
      s = rng.int(-6, 6);
    } while (r === s || r + s === 0);
    const A = difficulty === 1 ? Q(1) : Q(rng.pick([2, 3, -1, -2, -3, 1]));
    const f = factPoly(A, r, s);
    let x1 = 0;
    if (difficulty === 2) {
      const cands = [-3, -2, -1, 1, 2, 3, 4].filter((x) => x !== r && x !== s && x !== 0);
      x1 = rng.pick(cands);
    }
    if (difficulty === 3 && (r === 0 || s === 0)) x1 = [1, -1, 2].find((x) => x !== r && x !== s)!;
    const y1 = ev(f, x1);
    const value = yEq(factPlain(A, r, s));
    const zText = `$x$-intercepts $${r}$ and $${s}$`;
    const prompt: Block[] = [];
    if (difficulty === 1) prompt.push(p(`A parabola has ${zText} and a leading coefficient of $1$. Write its equation in factored form, $y = a(x - r)(x - s)$.`));
    else if (difficulty === 2) prompt.push(p(`A parabola has ${zText} and passes through $(${x1}, ${y1.toTex()})$. Write its equation in factored form, $y = a(x - r)(x - s)$.`));
    else {
      const ys = [y1.toNumber(), vertexOf(f).k.toNumber()];
      const lo = Math.min(...ys, 0) - 1;
      const hi = Math.max(...ys, 0) + 1;
      const spec: GraphSpec = {
        xMin: Math.min(r, s, x1) - 2,
        xMax: Math.max(r, s, x1) + 2,
        yMin: Math.floor(lo),
        yMax: Math.ceil(hi),
        yStep: hi - lo > 40 ? 10 : hi - lo > 20 ? 5 : hi - lo > 12 ? 2 : 1,
        functions: [{ expr: gexpr(f) }],
        points: [{ x: r, y: 0, label: `(${r}, 0)` }, { x: s, y: 0, label: `(${s}, 0)` }, { x: x1, y: y1.toNumber(), label: `(${x1}, ${y1.toString()})` }],
        ariaLabel: `A parabola crossing the x-axis at ${r} and ${s} and passing through (${x1}, ${y1.toString()}).`,
      };
      prompt.push(p(`The graph shows a parabola with ${zText}. It passes through $(${x1}, ${y1.toTex()})$. Write its equation in factored form.`), { t: 'graph', spec });
    }
    const misconceptions: Misconception[] = [{ answer: yEq(factPlain(A, -r, -s)), tag: 'sign-error', feedback: 'An $x$-intercept at $x = r$ comes from the factor $(x - r)$. For $x = 3$ use $(x - 3)$; for $x = -3$ use $(x + 3)$.' }];
    if (!A.eq(1)) misconceptions.push({ answer: yEq(factPlain(1, r, s)), tag: 'other', feedback: 'Those intercepts are right, but the parabola must also pass through the other point. Solve for $a$.' });
    const steps: ProblemStep[] = difficulty === 1 ? [] : [
      { prompt: [p(`Substitute $(${x1}, ${y1.toTex()})$ into $y = a(x - ${subTex(r)})(x - ${subTex(s)})$. What is $a$?`)], answer: numSpec(A), hints: [`$${y1.toTex()} = a(${x1} - ${subTex(r)})(${x1} - ${subTex(s)})$.`, `$(${x1} - ${subTex(r)})(${x1} - ${subTex(s)}) = ${(x1 - r) * (x1 - s)}$.`, `Divide $${y1.toTex()}$ by that number.`, 'Keep the sign.'], explanation: `$a = ${A.toTex()}$.` },
      { prompt: [p('Write the equation in factored form.')], answer: { kind: 'equation', value, form: 'factored' }, inputHint: 'Type an equation like y = 2(x - 1)(x + 3).', hints: ['Use $y = a(x - r)(x - s)$.', `$a = ${A.toTex()}$.`, 'Each intercept $r$ gives a factor $(x - r)$.', 'Watch the signs.'], explanation: `$y = ${factTex(A, r, s)}$.`, misconceptions },
    ];
    return makeProblem({
      skillId: 'S4.20',
      tags: difficulty === 3 ? ['graph'] : [],
      prompt,
      answer: { kind: 'equation', value, form: 'factored' },
      inputHint: 'Type an equation like y = 2(x - 1)(x + 3).',
      hints: [
        'An $x$-intercept at $x = r$ means $(x - r)$ is a factor.',
        `So the equation is $y = a\\left(x - ${subTex(r)}\\right)\\left(x - ${subTex(s)}\\right)$; simplify the signs.`,
        difficulty === 1 ? 'A leading coefficient of $1$ means $a = 1$.' : 'Substitute the other point to find $a$.',
        'Check: both intercepts should make $y = 0$.',
      ],
      solution: [
        { text: 'Write the factors from the intercepts.', tex: `y = a${factTex(1, r, s)}`, why: `$x = ${r}$ makes the first factor zero and $x = ${s}$ makes the second factor zero.` },
        ...(difficulty === 1 ? [] : [{ text: 'Substitute the other point to find $a$.', tex: `${y1.toTex()} = a(${x1 - r})(${x1 - s}) \\Rightarrow a = ${A.toTex()}` }]),
        { text: 'Write the equation.', tex: `y = ${factTex(A, r, s)}` },
      ],
      misconceptions,
      ...(steps.length ? { steps } : {}),
    });
  },
  verify(pr) {
    if (pr.answer.kind !== 'equation') return ['unexpected kind'];
    const text = promptText(pr);
    const z = /\$x\$-intercepts \$(-?\d+)\$ and \$(-?\d+)\$/.exec(text);
    if (!z) return ['cannot read zeros'];
    const g = eqRhsPoly(pr.answer.value);
    const errs: string[] = [];
    if (g.degreeIn('x') !== 2) errs.push('not quadratic');
    for (const zz of [z[1], z[2]]) if (!ev(g, Number(zz)).isZero()) errs.push(`${zz} is not a zero`);
    const pt = /passes through \$\((-?\d+), (-?\d+)\)\$/.exec(text);
    if (pt && !ev(g, Number(pt[1])).eq(Number(pt[2]))) errs.push('misses the point');
    if (/leading coefficient of \$1\$/.test(text) && !g.coeff('x', 2).eq(1)) errs.push('leading coefficient');
    return errs;
  },
};

export const genModelSituation: GeneratorDef = {
  id: 'u4.model-situation',
  skillId: 'S4.20',
  description: 'Write a quadratic model for a projectile, an area or a revenue situation.',
  generate(rng, difficulty) {
    const kind = difficulty === 1 ? 'launch' : difficulty === 2 ? rng.pick(['fence', 'frame'] as const) : rng.pick(['revenue', 'frame'] as const);
    let story: string;
    let value: string;
    let v = 'x';
    const misconceptions: Misconception[] = [];
    let hints: Hints;
    let solution;
    let inputHint: string;
    if (kind === 'launch') {
      const v0 = rng.pick([24, 32, 40, 48, 56, 64, 80]);
      const h0 = rng.int(2, 60);
      const thing = rng.pick(['ball', 'water balloon', 'beanbag', 'softball']);
      v = 't';
      story = `A ${thing} is thrown straight up from a height of $${h0}$ feet with an initial velocity of $${v0}$ feet per second. Write a function $h(t)$ for its height in feet after $t$ seconds. Use $h(t) = -16t^{2} + v_0 t + h_0$.`;
      value = `-16t^2 + ${v0}t + ${h0}`;
      inputHint = 'Type an expression in t, like -16t^2 + 20t + 5.';
      if (h0 !== v0) misconceptions.push({ answer: `-16t^2 + ${h0}t + ${v0}`, tag: 'equation-setup', feedback: '$v_0$, the initial velocity, multiplies $t$. $h_0$, the starting height, is the constant.' });
      misconceptions.push({ answer: `16t^2 + ${v0}t + ${h0}`, tag: 'sign-error', feedback: 'Gravity pulls the object down, so the $t^{2}$ term is $-16t^{2}$.' });
      hints = ['$v_0$ is the initial (upward) velocity and $h_0$ is the starting height.', `Here $v_0 = ${v0}$.`, `And $h_0 = ${h0}$.`, 'Substitute both into $-16t^{2} + v_0 t + h_0$.'];
      solution = [
        { text: 'Identify the values.', why: `$v_0 = ${v0}$ ft/s and $h_0 = ${h0}$ ft.` },
        { text: 'Substitute.', tex: `h(t) = ${pTex(Poly.fromCoeffs('t', [Q(h0), Q(v0), Q(-16)]), 't')}`, why: 'The $-16t^{2}$ comes from gravity, in feet and seconds.' },
      ];
    } else if (kind === 'fence') {
      const P = rng.pick([20, 30, 36, 40, 50, 64, 80, 100]);
      const what = rng.pick(['garden', 'dog pen', 'skate area', 'volleyball court']);
      story = `A rectangular ${what} is enclosed by $${P}$ feet of fencing. One side is $x$ feet long. Write a function $A(x)$ for the area of the ${what} in square feet.`;
      value = `x(${P / 2} - x)`;
      inputHint = 'Type an expression in x, like x(15 - x).';
      misconceptions.push({ answer: `x(${P} - x)`, tag: 'equation-setup', feedback: `The perimeter is $2$ lengths plus $2$ widths, so one length plus one width is $${P / 2}$, not $${P}$.` });
      misconceptions.push({ answer: `x(${P / 2} + x)`, tag: 'equation-setup', feedback: 'As one side gets longer, the other must get shorter.' });
      hints = ['Area of a rectangle $=$ length $\\times$ width.', `The perimeter is $${P}$, so one length plus one width is $\\frac{${P}}{2} = ${P / 2}$.`, `If one side is $x$, the other side is $${P / 2} - x$.`, 'Multiply the two sides.'];
      solution = [
        { text: 'Find the other side.', tex: `2x + 2w = ${P} \\Rightarrow w = ${P / 2} - x`, why: 'Two lengths and two widths use up all the fencing.' },
        { text: 'Multiply length by width.', tex: `A(x) = x\\left(${P / 2} - x\\right) = ${pTex(X([0, P / 2, -1]))}` },
      ];
    } else if (kind === 'frame') {
      const L = rng.pick([8, 10, 12, 14, 16, 20]);
      let W = rng.pick([6, 8, 10, 12]);
      if (W >= L) W = L - 2;
      const what = rng.pick(['photo', 'poster', 'painting', 'jersey display']);
      story = `${[8, 11, 18].includes(L) ? 'An' : 'A'} ${L} inch by ${W} inch ${what} gets a frame that is $x$ inches wide on every side. Write a function $A(x)$ for the total area, in square inches, of the ${what} and frame together.`;
      value = `(${L} + 2x)(${W} + 2x)`;
      inputHint = 'Type an expression in x, like (10 + 2x)(8 + 2x).';
      misconceptions.push({ answer: `(${L} + x)(${W} + x)`, tag: 'equation-setup', feedback: 'The frame is on both ends of each side, so each dimension grows by $2x$.' });
      misconceptions.push({ answer: `${L * W} + 4x`, tag: 'equation-setup', feedback: 'Find the new length and the new width first, then multiply them.' });
      hints = ['Draw the picture with the frame around it.', 'The frame adds $x$ on the left and $x$ on the right.', `So the new length is $${L} + 2x$ and the new width is $${W} + 2x$.`, 'Area $=$ length $\\times$ width.'];
      solution = [
        { text: 'Find the outer dimensions.', tex: `\\text{length} = ${L} + 2x,\\quad \\text{width} = ${W} + 2x`, why: 'The frame adds $x$ to each end of each side.' },
        { text: 'Multiply.', tex: `A(x) = \\left(${L} + 2x\\right)\\left(${W} + 2x\\right) = ${pTex(X([L * W, 2 * (L + W), 4]))}` },
      ];
    } else {
      const p0 = rng.pick([5, 8, 10, 12, 15, 20]);
      const n0 = rng.pick([100, 120, 150, 200, 240, 300]);
      const d = rng.pick([2, 4, 5, 10]);
      const item = rng.pick(['concert T-shirts', 'phone cases', 'smoothies', 'game tokens']);
      story = `A club sells ${item} for ${money(p0)} each and sells $${n0}$ per week. For every ${money(1)} increase in price, it sells $${d}$ fewer. Let $x$ be the number of ${money(1)} increases. Write a function $R(x)$ for the weekly revenue in dollars.`;
      value = `(${p0} + x)(${n0} - ${d}x)`;
      inputHint = 'Type an expression in x, like (10 + x)(200 - 5x).';
      misconceptions.push({ answer: `(${p0} + x)(${n0} - x)`, tag: 'equation-setup', feedback: `Each increase loses $${d}$ sales, so after $x$ increases the club sells $${n0} - ${d}x$.` });
      misconceptions.push({ answer: `(${p0} - x)(${n0} - ${d}x)`, tag: 'sign-error', feedback: 'The price goes up by $1$ dollar for each increase.' });
      hints = ['Revenue $=$ price $\\times$ number sold.', `After $x$ increases, the price is $${p0} + x$ dollars.`, `After $x$ increases, the number sold is $${n0} - ${d}x$.`, 'Multiply the two expressions.'];
      solution = [
        { text: 'Write the price and the number sold.', tex: `\\text{price} = ${p0} + x,\\quad \\text{sold} = ${n0} - ${d}x` },
        { text: 'Multiply.', tex: `R(x) = \\left(${p0} + x\\right)\\left(${n0} - ${d}x\\right) = ${pTex(X([p0 * n0, n0 - d * p0, -d]))}`, why: 'Revenue is price times quantity.' },
      ];
    }
    return makeProblem({
      skillId: 'S4.20',
      tags: ['real-world'],
      prompt: [p(story)],
      answer: { kind: 'expression', value, variables: [v] },
      inputHint,
      hints,
      solution,
      misconceptions,
    });
  },
  verify(pr) {
    if (pr.answer.kind !== 'expression') return ['unexpected kind'];
    const text = promptText(pr);
    const g = plainPoly(pr.answer.value);
    let m: RegExpExecArray | null;
    if ((m = /from a height of \$(\d+)\$ feet with an initial velocity of \$(\d+)\$/.exec(text))) {
      const [h0, v0] = [Number(m[1]), Number(m[2])];
      // physical checks: starts at h0, leading -16, and h(1) - h(0) = v0 - 16
      const errs: string[] = [];
      if (!ev(g, 0, 't').eq(h0)) errs.push('wrong starting height');
      if (!g.coeff('t', 2).eq(-16)) errs.push('wrong gravity term');
      if (!ev(g, 1, 't').sub(ev(g, 0, 't')).eq(v0 - 16)) errs.push('wrong velocity');
      return errs;
    }
    if ((m = /enclosed by \$(\d+)\$ feet of fencing/.exec(text))) {
      const P = Number(m[1]);
      // a rectangle with side x and perimeter P: area at x = 1 is P/2 - 1; area is 0 at x = 0 and x = P/2
      const errs: string[] = [];
      if (!ev(g, 0).isZero() || !ev(g, P / 2).isZero()) errs.push('degenerate rectangles must have area 0');
      if (!ev(g, 1).eq(P / 2 - 1)) errs.push('wrong area at x = 1');
      return errs;
    }
    if ((m = /An? (\d+) inch by (\d+) inch/.exec(text))) {
      const [L, W] = [Number(m[1]), Number(m[2])];
      const errs: string[] = [];
      if (!ev(g, 0).eq(L * W)) errs.push('no-frame area');
      if (!ev(g, 1).eq((L + 2) * (W + 2))) errs.push('1-inch frame area');
      if (!ev(g, 3).eq((L + 6) * (W + 6))) errs.push('3-inch frame area');
      return errs;
    }
    if ((m = /for \\\$(\d+) each and sells \$(\d+)\$ per week\. For every \\\$1 increase in price, it sells \$(\d+)\$ fewer/.exec(text))) {
      const [p0, n0, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
      const errs: string[] = [];
      for (const x of [0, 1, 4]) if (!ev(g, x).eq((p0 + x) * (n0 - d * x))) errs.push(`revenue after ${x} increases`);
      return errs;
    }
    return ['unknown story'];
  },
};

// ---------------------------------------------------------------------------
// S4.21: compare functions represented differently
// ---------------------------------------------------------------------------

type Feature = 'yint' | 'max' | 'min' | 'axis' | 'rate';

/** Quadratic through a table of (x, y) with x consecutive: finite differences. */
function fromTable(rows: Array<[number, Rational]>): Poly {
  const [[x0, y0], [, y1], [, y2]] = rows;
  const a = y2.sub(y1.mul(2)).add(y0).div(2);
  // y = a(x - x0)^2 + b'(x - x0) + y0 with b' = y1 - y0 - a
  const bp = y1.sub(y0).sub(a);
  const s = X([-x0, 1]);
  return s.mul(s).scale(a).add(s.scale(bp)).add(Poly.const(y0));
}

function feature(f: Poly, ft: Feature): Rational {
  if (ft === 'yint') return ev(f, 0);
  if (ft === 'rate') return ev(f, 2).sub(ev(f, 0)).div(2);
  const { h, k } = vertexOf(f);
  return ft === 'axis' ? h : k;
}

const FEAT_TEXT: Record<Feature, { noun: string; greater: string }> = {
  yint: { noun: '$y$-intercept', greater: 'greater $y$-intercept' },
  max: { noun: 'maximum value', greater: 'greater maximum value' },
  min: { noun: 'minimum value', greater: 'greater minimum value' },
  axis: { noun: 'axis of symmetry', greater: 'axis of symmetry farther to the right' },
  rate: { noun: 'average rate of change from $x = 0$ to $x = 2$', greater: 'greater average rate of change from $x = 0$ to $x = 2$' },
};

export const genCompareFunctions: GeneratorDef = {
  id: 'u4.compare-functions',
  skillId: 'S4.21',
  description: 'Compare key features of two quadratic functions given as an equation, a table or a graph.',
  generate(rng, difficulty) {
    const ft: Feature = difficulty === 1 ? rng.pick(['yint', 'axis'] as const) : rng.pick(['max', 'min', 'max', 'min', 'rate'] as const);
    const sign = ft === 'max' ? -1 : ft === 'min' ? 1 : rng.pick([1, -1]);
    const mk = () => {
      const a = sign * rng.pick([1, 2]);
      const h = rng.int(-4, 4);
      const k = rng.int(-8, 8);
      return { a, h, k, f: vtxPoly(a, h, k) };
    };
    const F = mk();
    let G = mk();
    // allow ties sometimes; otherwise make sure the features differ
    const tie = difficulty < 3 && rng.int(0, 5) === 0;
    for (let guard = 0; guard < 50; guard++) {
      const eq = feature(F.f, ft).eq(feature(G.f, ft));
      if (tie ? eq : !eq) break;
      G = mk();
      if (tie) G = { ...G, ...(ft === 'axis' ? { h: F.h } : ft === 'yint' ? {} : { k: F.k }) } as typeof G;
      G.f = vtxPoly(G.a, G.h, G.k);
    }
    if (tie && ft === 'yint') {
      // shift G so its y-intercept matches F's
      const d = ev(F.f, 0).sub(ev(G.f, 0)).toInt();
      G = { ...G, k: G.k + d, f: vtxPoly(G.a, G.h, G.k + d) };
    }
    const fForm = rng.pick(['standard', 'vertex'] as const);
    const fTex = `f(x) = ${fForm === 'standard' ? pTex(F.f) : vtxTex(F.a, F.h, F.k)}`;
    const rep: 'table' | 'graph' | 'words' = difficulty === 1 ? 'table' : ft === 'rate' ? rng.pick(['table', 'graph'] as const) : rng.pick(['table', 'graph', 'words'] as const);
    const useTable = rep === 'table';
    const gk = ev(G.f, G.h + 1);
    let gBlock: Block;
    if (rep === 'table') {
      const xs = ft === 'rate' ? [-1, 0, 1, 2, 3] : [-2, -1, 0, 1, 2].map((d) => G.h + d).concat(ft === 'yint' && Math.abs(G.h) > 2 ? [0] : []);
      gBlock = { t: 'table', headers: ['$x$', '$g(x)$'], rows: xs.sort((x, y) => x - y).filter((x, i, all) => all.indexOf(x) === i).map((x) => [`$${x}$`, `$${ev(G.f, x).toTex()}$`]) };
    } else if (rep === 'graph') {
      const pts = ft === 'rate' ? [0, 2].map((x) => ({ x, y: ev(G.f, x).toNumber(), label: `(${x}, ${ev(G.f, x).toString()})` })) : [{ x: G.h, y: G.k, label: `(${G.h}, ${G.k})` }];
      const ys = [G.k, ev(G.f, G.h + 3).toNumber(), ...pts.map((q) => q.y)];
      const lo = Math.min(...ys, -1) - 1;
      const hi = Math.max(...ys, 1) + 1;
      const step = hi - lo > 16 ? 2 : 1;
      gBlock = {
        t: 'graph',
        spec: {
          xMin: Math.min(G.h - 5, -1),
          xMax: Math.max(G.h + 5, 3),
          yMin: Math.floor(lo / step) * step,
          yMax: Math.ceil(hi / step) * step,
          yStep: step,
          functions: [{ expr: gexpr(G.f), label: 'y = g(x)' }],
          points: pts,
          ariaLabel: `A parabola g opening ${G.a > 0 ? 'up' : 'down'} with vertex (${G.h}, ${G.k}).`,
        },
      };
    } else gBlock = p(`Function $g$ is a quadratic function whose graph opens ${G.a > 0 ? 'up' : 'down'}, has its vertex at $(${G.h}, ${G.k})$, and passes through $(${G.h + 1}, ${gk.toTex()})$.`);
    const fv = feature(F.f, ft);
    const gv = feature(G.f, ft);
    const T = FEAT_TEXT[ft];
    const prompt: Block[] = [p(`Function $f$ is given by an equation, and function $g$ is ${rep === 'words' ? 'described in words' : `given by a ${rep}`}.`), { t: 'math', tex: fTex }, gBlock];
    const findF = ft === 'rate' ? `$f(0) = ${ev(F.f, 0).toTex()}$ and $f(2) = ${ev(F.f, 2).toTex()}$, so the rate is $\\frac{${ev(F.f, 2).toTex()} - ${subTex(ev(F.f, 0))}}{2} = ${fv.toTex()}$.` : ft === 'yint' ? `$f(0) = ${fv.toTex()}$` : fForm === 'vertex' ? `From vertex form, the vertex of $f$ is $(${F.h}, ${F.k})$.` : `$x = -\\frac{b}{2a} = ${F.h}$ and $f(${F.h}) = ${F.k}$, so the vertex of $f$ is $(${F.h}, ${F.k})$.`;
    const findG =
      ft === 'rate'
        ? `From the ${rep}, $g(0) = ${ev(G.f, 0).toTex()}$ and $g(2) = ${ev(G.f, 2).toTex()}$, so the rate is $\\frac{${ev(G.f, 2).toTex()} - ${subTex(ev(G.f, 0))}}{2} = ${gv.toTex()}$.`
        : rep === 'words'
          ? `The vertex of $g$ is $(${G.h}, ${G.k})$, so its axis is $x = ${G.h}$. With $a(1)^{2} = ${gk.toTex()} - ${subTex(G.k)}$, $a = ${G.a}$, so $g(x) = ${vtxTex(G.a, G.h, G.k)}$${ft === 'yint' ? ` and $g(0) = ${gv.toTex()}$` : ''}.`
          : ft === 'yint'
            ? `From the ${rep}, $g(0) = ${gv.toTex()}$.`
            : useTable
              ? `The table is symmetric around $x = ${G.h}$, so the vertex of $g$ is $(${G.h}, ${G.k})$.`
              : `From the graph, the vertex of $g$ is $(${G.h}, ${G.k})$.`;
    const hints: Hints = [
      `Find the ${T.noun} of each function separately first.`,
      ft === 'rate' ? 'Average rate of change $= \\frac{\\text{output at } 2 - \\text{output at } 0}{2 - 0}$.' : ft === 'yint' ? 'The $y$-intercept is the output when $x = 0$.' : ft === 'axis' ? 'The axis of symmetry is $x = h$, through the vertex.' : `The ${T.noun} is the $y$-value of the vertex.`,
      ft === 'yint' ? 'For $f$, substitute $x = 0$.' : ft === 'rate' ? 'For $f$, substitute $x = 0$ and $x = 2$.' : fForm === 'vertex' ? 'Vertex form $a(x - h)^{2} + k$ shows the vertex $(h, k)$.' : 'For $f$, use $x = -\\frac{b}{2a}$ to find the vertex.',
      ft === 'rate' || ft === 'yint' ? `For $g$, read the outputs from the ${rep === 'words' ? 'description: build $g(x) = a(x - h)^{2} + k$ first' : rep}.` : rep === 'words' ? 'The description gives the vertex directly.' : useTable ? 'In a table, the vertex is where the outputs stop going one way and turn around; the values on each side match.' : 'On the graph, read the labeled vertex.',
    ];
    if (difficulty === 3) {
      const diff = fv.sub(gv).abs();
      return makeProblem({
        skillId: 'S4.21',
        tags: ['multi-step'],
        prompt: [...prompt, p(`How much greater is the larger ${T.noun} than the smaller one?`)],
        answer: numSpec(diff),
        hints,
        solution: [
          { text: `Find the ${T.noun} of $f$.`, why: findF },
          { text: `Find the ${T.noun} of $g$.`, why: findG },
          { text: 'Subtract the smaller from the larger.', tex: `${(fv.gt(gv) ? fv : gv).toTex()} - ${subTex(fv.gt(gv) ? gv : fv)} = ${diff.toTex()}` },
        ],
        misconceptions: fv.add(gv).abs().eq(diff) ? [] : [{ answer: numStr(fv.add(gv).abs()), tag: 'sign-error', feedback: 'Find the difference by subtracting the values, and watch negative signs.' }],
        steps: [
          { prompt: [p(`What is the ${T.noun} of $f$?`)], answer: numSpec(fv), hints: ['Use the equation.', ft === 'rate' ? 'Find $f(0)$ and $f(2)$.' : fForm === 'vertex' ? 'Read $k$.' : 'Find the vertex.', ft === 'rate' ? 'Subtract and divide by $2$.' : 'It is a $y$-value.', 'Check the sign.'], explanation: findF },
          { prompt: [p(`What is the ${T.noun} of $g$?`)], answer: numSpec(gv), hints: [`Use the ${rep === 'words' ? 'description' : rep}.`, ft === 'rate' ? 'Find $g(0)$ and $g(2)$.' : 'Find the vertex.', ft === 'rate' ? 'Subtract and divide by $2$.' : 'It is a $y$-value.', 'Check the sign.'], explanation: findG },
        ],
      });
    }
    const L = (w: string) => (w === 'same' ? `They have the same ${T.noun}` : `$${w}$ has the ${T.greater}`);
    const correct = fv.gt(gv) ? L('f') : gv.gt(fv) ? L('g') : L('same');
    return makeProblem({
      skillId: 'S4.21',
      tags: [],
      prompt: [...prompt, p(`Which function has the ${T.greater}?`)],
      answer: makeChoice(rng, correct, [L('f'), L('g'), L('same')].filter((x) => x !== correct)),
      hints,
      solution: [
        { text: `Find the ${T.noun} of $f$.`, why: findF },
        { text: `Find the ${T.noun} of $g$.`, why: findG },
        { text: `Compare: $${fv.toTex()}$ and $${gv.toTex()}$.`, why: `${correct}.` },
      ],
      misconceptions: [],
    });
  },
  verify(pr) {
    const fTex = mathBlocks(pr)[0];
    const f = rhsPoly(fTex);
    const tbl = (pr.prompt as Block[]).find((b) => b.t === 'table') as Extract<Block, { t: 'table' }> | undefined;
    let g: Poly;
    if (tbl) {
      const rows = tbl.rows.map((r) => [Number(r[0].replace(/\$/g, '')), Q(r[1].replace(/\$/g, ''))] as [number, Rational]);
      // fit from three consecutive rows, then confirm every row
      const consec = rows.findIndex((r, i) => i + 2 < rows.length && rows[i + 1][0] === r[0] + 1 && rows[i + 2][0] === r[0] + 2);
      g = fromTable(rows.slice(consec, consec + 3));
      if (rows.some(([x, y]) => !ev(g, x).eq(y))) return ['table is not one quadratic'];
    } else if (graphOf(pr)) g = toPoly(parseExpression(graphOf(pr)!.functions![0].expr));
    else {
      const m = /opens (up|down), has its vertex at \$\((-?\d+), (-?\d+)\)\$, and passes through \$\((-?\d+), (-?\d+)\)\$/.exec(promptText(pr));
      if (!m) return ['cannot read description'];
      const [h, k, x1, y1] = [m[2], m[3], m[4], m[5]].map(Number);
      const a = Q(y1 - k, (x1 - h) * (x1 - h));
      if ((a.sign() > 0) !== (m[1] === 'up')) return ['description direction is inconsistent'];
      g = vtxPoly(a, h, k);
    }
    const text = promptText(pr);
    const ft = (Object.keys(FEAT_TEXT) as Feature[]).find((k) => text.includes(FEAT_TEXT[k].greater) || text.includes(`larger ${FEAT_TEXT[k].noun}`));
    if (!ft) return ['unknown feature'];
    // the feature must exist: a maximum needs a < 0, a minimum a > 0
    if (ft === 'max' && (f.coeff('x', 2).sign() > 0 || g.coeff('x', 2).sign() > 0)) return ['a function has no maximum'];
    if (ft === 'min' && (f.coeff('x', 2).sign() < 0 || g.coeff('x', 2).sign() < 0)) return ['a function has no minimum'];
    const fv = feature(f, ft);
    const gv = feature(g, ft);
    if (pr.answer.kind === 'number') return Q(pr.answer.value).eq(fv.sub(gv).abs()) && !fv.eq(gv) ? [] : ['wrong difference'];
    if (pr.answer.kind !== 'choice') return ['unexpected kind'];
    const label = choiceLabel(pr.answer);
    const want = fv.gt(gv) ? /^\$f\$ has/ : gv.gt(fv) ? /^\$g\$ has/ : /^They have the same/;
    return want.test(label) ? [] : ['wrong key'];
  },
};

export const U4_MODEL_GENERATORS: GeneratorDef[] = [genRewriteForms, genMaxMin, genAvgRate, genWriteVertexForm, genWriteFactoredForm, genModelSituation, genCompareFunctions];
