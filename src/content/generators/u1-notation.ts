/**
 * Unit 1, Lesson 2 generators: using function notation.
 * S1.03 solve f(x) = c (from a rule, a table, a graph, a situation).
 * S1.04 interpret function notation in context.
 */
import type { GeneratorDef, Problem, Rng, Difficulty } from '../../core/curriculum/types';
import { Rational } from '../../core/math/rational';
import { linearTex, linearPlain, decTex } from '../../core/math/format';
import { toPoly } from '../../core/math/poly';
import { parseExpression } from '../../core/math/parser';
import { Q, p, makeProblem, numberMisconceptions, numStr, sub, pickDistinct, FUNC_NAMES, makeChoice, choiceLabel, texToExpr, texValue } from './util';
import { buildContext, ctxRule, ctxStory } from './u1-contexts';

/** Evaluate a linear rule written in generator TeX at a value. */
function evalRule(ruleTex: string, v: string, at: Rational): Rational {
  return toPoly(parseExpression(texToExpr(ruleTex))).evaluate({ [v]: at });
}

function ruleSlope(ruleTex: string, v: string): Rational {
  const poly = toPoly(parseExpression(texToExpr(ruleTex)));
  return poly.evaluate({ [v]: Q(1) }).sub(poly.evaluate({ [v]: Q(0) }));
}

// ---------------------------------------------------------------------------
// S1.03: solve f(x) = c from a rule
// ---------------------------------------------------------------------------

function pickSolve(rng: Rng, d: Difficulty): { m: Rational; b: Rational; x: Rational } {
  if (d === 1) return { m: Q(rng.int(2, 9)), b: Q(rng.nonzeroInt(-9, 12)), x: Q(rng.int(1, 10)) };
  if (d === 2) {
    let m = Q(rng.nonzeroInt(-9, 9));
    while (m.abs().eq(1)) m = Q(rng.nonzeroInt(-9, 9));
    const x = Q(rng.nonzeroInt(-8, 8));
    const b = Q(rng.nonzeroInt(-12, 12));
    return { m, b, x: !m.isNegative() && !x.isNegative() && !b.isNegative() ? x.neg() : x };
  }
  if (rng.bool()) {
    // fractional slope, input a multiple of the denominator
    const den = rng.pick([2, 3, 4, 5]);
    let num = rng.nonzeroInt(-7, 7);
    while (num % den === 0 || Math.abs(num) === 1) num = rng.nonzeroInt(-7, 7);
    return { m: Q(num, den), b: Q(rng.nonzeroInt(-10, 10)), x: Q(den * rng.nonzeroInt(-4, 4)) };
  }
  // integer slope, fractional answer
  let m = Q(rng.nonzeroInt(-6, 6));
  while (m.abs().le(1)) m = Q(rng.nonzeroInt(-6, 6));
  const den = m.abs().toInt();
  let num = rng.nonzeroInt(-20, 20);
  while (num % den === 0) num = rng.nonzeroInt(-20, 20);
  return { m, b: Q(rng.nonzeroInt(-10, 10)), x: Q(num, den) };
}

export const genSolveFx: GeneratorDef = {
  id: 'u1.solve-fx',
  skillId: 'S1.03',
  description: 'Find the input x that makes f(x) equal a given output, for a linear rule.',
  generate(rng, difficulty) {
    const { m, b, x } = pickSolve(rng, difficulty);
    const f = difficulty === 1 ? 'f' : rng.pick(FUNC_NAMES);
    const c = m.mul(x).add(b);
    const rule = linearTex(m, b);
    const diff = c.sub(b);
    const undo = b.isNegative() ? `Add $${b.abs().toTex()}$ to both sides` : `Subtract $${b.toTex()}$ from both sides`;
    return makeProblem({
      skillId: 'S1.03',
      tags: [],
      prompt: [p(`For $${f}(x) = ${rule}$, find the value of $x$ that makes $${f}(x) = ${c.toTex()}$.`)],
      answer: { kind: 'number', value: numStr(x) },
      inputHint: 'Type the value of x. Fractions like -7/2 are fine.',
      hints: [
        `$${f}(x) = ${c.toTex()}$ tells you the **output**. You are looking for the **input** $x$ that produces it.`,
        `Set the rule equal to the output and solve: $${rule} = ${c.toTex()}$.`,
        `${undo}. That leaves $${linearTex(m, 0)}$ by itself on the left.`,
        `Once you have $${linearTex(m, 0)}$ on one side, divide both sides by $${m.toTex()}$. Then check by substituting your answer into the rule.`,
      ],
      solution: [
        { text: 'Set the rule equal to the output.', tex: `${rule} = ${c.toTex()}`, why: `$${f}(x) = ${c.toTex()}$ means the output is $${c.toTex()}$, so the rule must equal $${c.toTex()}$.` },
        { text: `${undo}.`, tex: `${linearTex(m, 0)} = ${diff.toTex()}`, why: 'Undo the addition or subtraction first: it was the last thing the rule did to $x$.' },
        { text: `Divide both sides by $${m.toTex()}$.`, tex: `x = ${x.toTex()}`, why: `Dividing undoes multiplying by $${m.toTex()}$.` },
        { text: 'Check by substituting.', tex: `${f}(${x.toTex()}) = ${m.toTex()}\\cdot ${sub(x)}${b.isNegative() ? ' - ' + b.abs().toTex() : ' + ' + b.toTex()} = ${m.mul(x).toTex()}${b.isNegative() ? ' - ' + b.abs().toTex() : ' + ' + b.toTex()} = ${c.toTex()}`, why: 'The input gives the required output, so the answer is right.' },
      ],
      misconceptions: numberMisconceptions(x, [
        { value: m.mul(c).add(b), tag: 'inverse-operation', feedback: `That's $${f}(${c.toTex()})$, the output for the input $${c.toTex()}$. Here $${c.toTex()}$ is the output, so solve for the input.` },
        { value: diff, tag: 'arithmetic-error', feedback: `You undid the constant correctly. One more step: $x$ is still being multiplied by $${m.toTex()}$.` },
        { value: c.add(b).div(m), tag: 'sign-error', feedback: `Check the first step. To undo ${b.isNegative() ? 'subtracting' : 'adding'} $${b.abs().toTex()}$, do the opposite.` },
        { value: c.div(m).sub(b), tag: 'order-of-operations', feedback: 'Undo the operations in reverse order: deal with the constant term first, then divide.' },
        { value: diff.mul(m), tag: 'inverse-operation', feedback: `To undo multiplying by $${m.toTex()}$, divide by it.` },
        { value: diff.div(m).neg(), tag: 'sign-error', feedback: 'Check the sign when you divide.' },
      ]),
      steps: [
        {
          prompt: [p(`Solve $${rule} = ${c.toTex()}$. First undo the constant term. What does $${linearTex(m, 0)}$ equal?`)],
          answer: { kind: 'number', value: numStr(diff) },
          hints: [
            'Undo addition or subtraction before multiplication.',
            b.isNegative() ? `The rule subtracts $${b.abs().toTex()}$, so add $${b.abs().toTex()}$ to both sides.` : `The rule adds $${b.toTex()}$, so subtract $${b.toTex()}$ from both sides.`,
            `Work out $${c.toTex()} ${b.isNegative() ? '+ ' + b.abs().toTex() : '- ' + b.toTex()}$.`,
            'Use a number line if the signs are tricky.',
          ],
          misconceptions: numberMisconceptions(diff, [{ value: c.add(b), tag: 'sign-error', feedback: 'Do the opposite of what the rule does to the constant.' }]),
          explanation: `$${linearTex(m, 0)} = ${diff.toTex()}$.`,
        },
        {
          prompt: [p(`Now solve $${linearTex(m, 0)} = ${diff.toTex()}$. What is $x$?`)],
          answer: { kind: 'number', value: numStr(x) },
          hints: [
            `$${linearTex(m, 0)}$ means $${m.toTex()}$ times $x$.`,
            `Undo multiplying by dividing both sides by $${m.toTex()}$.`,
            `Work out $${diff.toTex()} \\div ${sub(m)}$.`,
            'A fraction answer is fine if it does not divide evenly.',
          ],
          misconceptions: numberMisconceptions(x, [
            { value: diff.mul(m), tag: 'inverse-operation', feedback: 'Divide to undo multiplication.' },
            { value: x.neg(), tag: 'sign-error', feedback: 'Check the sign of your quotient.' },
          ]),
          explanation: `$x = ${x.toTex()}$.`,
        },
      ],
    });
  },
  verify(pr) {
    // Independent route: substitute the key into the rule and compare with the target output.
    const text = (pr.prompt[0] as { text: string }).text;
    const mm = /\$([fgh])\(x\) = (.+?)\$, find the value of \$x\$ that makes \$\1\(x\) = (.+?)\$/.exec(text);
    if (!mm || pr.answer.kind !== 'number') return ['cannot parse prompt'];
    const x = Rational.parse(pr.answer.value);
    const out = evalRule(mm[2], 'x', x);
    const target = texValue(mm[3]);
    const errs: string[] = [];
    if (!out.eq(target)) errs.push(`f(${x}) = ${out}, not ${target}`);
    if (ruleSlope(mm[2], 'x').isZero()) errs.push('constant rule has no unique input');
    return errs;
  },
};

// ---------------------------------------------------------------------------
// S1.03: find the input for an output from a table or a graph
// ---------------------------------------------------------------------------

export const genSolveFxGraph: GeneratorDef = {
  id: 'u1.solve-fx-graph',
  skillId: 'S1.03',
  description: 'Find the input that gives a stated output, using a table or a graph.',
  generate(rng, difficulty) {
    if (difficulty === 1) {
      const xs = pickDistinct(rng, 5, -4, 9).sort((u, w) => u - w);
      const ys = pickDistinct(rng, 5, -9, 15);
      const f = rng.pick(FUNC_NAMES);
      const i = rng.int(0, 4);
      const c = ys[i];
      // reading the wrong column: the output when the input is c
      const wrongCol = xs.indexOf(c) >= 0 ? Q(ys[xs.indexOf(c)]) : null;
      return makeProblem({
        skillId: 'S1.03',
        tags: [],
        prompt: [
          p(`The table shows some values of the function $${f}$.`),
          { t: 'table', headers: ['x', `${f}(x)`], rows: xs.map((x, k) => [String(x), String(ys[k])]) },
          p(`For which value of $x$ is $${f}(x) = ${c}$?`),
        ],
        answer: { kind: 'number', value: String(xs[i]) },
        inputHint: 'Type the x-value.',
        hints: [
          `$${f}(x) = ${c}$ means the **output** is $${c}$. You want the input.`,
          `Outputs are in the $${f}(x)$ column. Look there, not in the $x$ column.`,
          `Find $${c}$ in the $${f}(x)$ column.`,
          `Read across that row to the $x$ column.`,
        ],
        solution: [
          { text: `Find the output $${c}$ in the $${f}(x)$ column.`, why: `In $${f}(x) = ${c}$, the number on the right of the equals sign is an output.` },
          { text: 'Read the input in the same row.', tex: `${f}(${xs[i]}) = ${c}`, why: 'Each row pairs an input with its output.' },
          { text: `So $x = ${xs[i]}$.` },
        ],
        misconceptions: numberMisconceptions(Q(xs[i]), [{ value: wrongCol, tag: 'graph-reading', feedback: `That's $${f}(${c})$, the output when the input is $${c}$. Here $${c}$ is the output. Look for it in the $${f}(x)$ column.` }]),
      });
    }
    const m = difficulty === 3 ? Q(rng.pick([1, -1, 3, -3]), 2) : Q(rng.nonzeroInt(-3, 3));
    const b = Q(rng.int(-4, 4));
    const candidates: number[] = [];
    for (let x = -6; x <= 6; x++) {
      const y = m.mul(x).add(b);
      if (y.isInteger() && Math.abs(y.toNumber()) <= 7 && x !== 0 && !y.eq(x)) candidates.push(x);
    }
    const a = rng.pick(candidates);
    const c = m.mul(a).add(b);
    const evalAtC = m.mul(c).add(b);
    return makeProblem({
      skillId: 'S1.03',
      tags: ['graph'],
      prompt: [
        p('The graph shows the line $y = f(x)$.'),
        { t: 'graph', spec: { xMin: -8, xMax: 8, yMin: -8, yMax: 8, functions: [{ expr: linearPlain(m, b), label: 'y = f(x)' }], ariaLabel: `Graph of a line through (0, ${b.toString()}) with slope ${m.toString()}.` } },
        p(`Use the graph to find the value of $x$ for which $f(x) = ${c.toTex()}$.`),
      ],
      answer: { kind: 'number', value: numStr(Q(a)) },
      inputHint: 'Type the x-value.',
      hints: [
        `$f(x) = ${c.toTex()}$ gives the **output**, which is the $y$-value. You are looking for the $x$-value.`,
        `Find $${c.toTex()}$ on the $y$-axis.`,
        `Move straight across from $y = ${c.toTex()}$ until you hit the line.`,
        'From that point on the line, move straight up or down to the $x$-axis and read the value.',
      ],
      solution: [
        { text: `Find $y = ${c.toTex()}$ on the vertical axis.`, why: 'Outputs are on the $y$-axis.' },
        { text: 'Move horizontally to the line, then read the $x$-coordinate of that point.', tex: `(${a}, ${c.toTex()})`, why: 'The point on the line at height $' + c.toTex() + '$ has the input as its $x$-coordinate.' },
        { text: `So $f(${a}) = ${c.toTex()}$, which means $x = ${a}$.` },
      ],
      misconceptions: numberMisconceptions(Q(a), [
        { value: evalAtC.isInteger() ? evalAtC : null, tag: 'inverse-operation', feedback: `That's $f(${c.toTex()})$: you started on the $x$-axis. Here $${c.toTex()}$ is the output, so start on the $y$-axis.` },
        { value: Q(a).neg(), tag: 'sign-error', feedback: 'Check whether the point is left or right of the $y$-axis.' },
      ]),
    });
  },
  verify(pr) {
    if (pr.answer.kind !== 'number') return ['wrong answer kind'];
    const x = Rational.parse(pr.answer.value);
    const table = pr.prompt.find((b) => b.t === 'table') as { rows: string[][] } | undefined;
    const ask = (pr.prompt[pr.prompt.length - 1] as { text: string }).text;
    const cm = /f\(x\) = (-?\d+)\$|[gh]\(x\) = (-?\d+)\$/.exec(ask);
    if (!cm) return ['cannot parse ask'];
    const c = Q(Number(cm[1] ?? cm[2]));
    if (table) {
      const hits = table.rows.filter((r) => Q(Number(r[1])).eq(c));
      if (hits.length !== 1) return ['output does not appear exactly once'];
      return Q(Number(hits[0][0])).eq(x) ? [] : ['answer is not the matching input'];
    }
    const g = pr.prompt.find((b) => b.t === 'graph') as { spec: { functions: Array<{ expr: string }> } } | undefined;
    if (!g) return ['no table or graph'];
    const poly = toPoly(parseExpression(g.spec.functions[0].expr));
    if (!poly.evaluate({ x }).eq(c)) return ['f(answer) is not the output'];
    if (ruleSlope(g.spec.functions[0].expr, 'x').isZero()) return ['horizontal line'];
    return [];
  },
};

// ---------------------------------------------------------------------------
// S1.03: solve f(x) = c in a real-world situation
// ---------------------------------------------------------------------------

export const genSolveContext: GeneratorDef = {
  id: 'u1.solve-context',
  skillId: 'S1.03',
  description: 'Find the input that gives a stated output in a real-world linear function.',
  generate(rng, difficulty) {
    const ctx = buildContext(rng, difficulty === 1 ? ['gym', 'savings', 'hike', 'tank'] : undefined);
    const a = Q(rng.int(2, Math.max(3, ctx.maxInput)));
    const y = ctx.m.mul(a).add(ctx.b);
    const { f, v, m, b } = ctx;
    const rule = ctxRule(ctx);
    const diff = y.sub(b);
    const undo = b.isNegative() ? `add $${decTex(b.abs())}$ to both sides` : `subtract $${decTex(b)}$ from both sides`;
    return makeProblem({
      skillId: 'S1.03',
      tags: ['real-world', 'word'],
      prompt: [p(ctxStory(ctx)), p(`Find the value of $${v}$ that makes $${f}(${v}) = ${decTex(y)}$.`)],
      answer: { kind: 'number', value: numStr(a), unit: ctx.inUnits },
      inputHint: `Type the number of ${ctx.inUnits}.`,
      hints: [
        `$${f}(${v}) = ${decTex(y)}$ gives the **output** (${ctx.outWord(y)}). You are looking for the input: the number of ${ctx.inUnits}.`,
        `Write an equation: $${rule} = ${decTex(y)}$.`,
        `First ${undo}.`,
        `Then divide both sides by $${decTex(m)}$. Check your answer by substituting it into the rule.`,
      ],
      solution: [
        { text: 'Set the rule equal to the output.', tex: `${rule} = ${decTex(y)}`, why: `$${f}(${v}) = ${decTex(y)}$ says the output is ${ctx.outWord(y)}.` },
        { text: `${undo[0].toUpperCase()}${undo.slice(1)}.`, tex: `${linearTex(m, 0, v, true)} = ${decTex(diff)}`, why: 'Undo the constant term first.' },
        { text: `Divide both sides by $${decTex(m)}$.`, tex: `${v} = ${decTex(a)}`, why: `Dividing undoes multiplying by $${decTex(m)}$.` },
        { text: 'Interpret.', why: `${ctx.says(ctx.inWord(a), ctx.outWord(y))} In function notation, $${f}(${decTex(a)}) = ${decTex(y)}$.` },
      ],
      misconceptions: numberMisconceptions(a, [
        { value: m.mul(y).add(b), tag: 'inverse-operation', feedback: `That's $${f}(${decTex(y)})$. The number ${decTex(y)} is the output here, so solve for the input.` },
        { value: diff, tag: 'arithmetic-error', feedback: `Good first step. Now undo the multiplication by $${decTex(m)}$.` },
        { value: y.add(b).div(m), tag: 'sign-error', feedback: `To undo ${b.isNegative() ? 'subtracting' : 'adding'} the constant, do the opposite operation.` },
        { value: y.div(m), tag: 'equation-setup', feedback: 'Remember the starting amount in the rule. Undo it before you divide.' },
      ]),
    });
  },
  verify(pr) {
    const story = (pr.prompt[0] as { text: string }).text;
    const ask = (pr.prompt[1] as { text: string }).text;
    const rm = /\$([A-Z])\(([a-z])\) = (.+?)\$ gives/.exec(story);
    const am = /\$[A-Z]\([a-z]\) = (.+?)\$/.exec(ask);
    if (!rm || !am || pr.answer.kind !== 'number') return ['cannot parse'];
    const out = evalRule(rm[3], rm[2], Rational.parse(pr.answer.value));
    if (!out.eq(Rational.parse(am[1]))) return [`${rm[1]}(answer) = ${out}, not ${am[1]}`];
    if (!Rational.parse(pr.answer.value).isInteger() || Rational.parse(pr.answer.value).isNegative()) return ['input is not a sensible count'];
    return [];
  },
};

// ---------------------------------------------------------------------------
// S1.04: interpret function notation in context
// ---------------------------------------------------------------------------

/** Numbers mentioned in a sentence, in order (handles \$ amounts, decimals and negatives). */
function numbersIn(s: string): Rational[] {
  return [...s.replace(/\\\$/g, '').matchAll(/-?\d+(?:\.\d+)?/g)].map((m) => Rational.parse(m[0]));
}

export const genInterpretNotation: GeneratorDef = {
  id: 'u1.interpret-notation',
  skillId: 'S1.04',
  description: 'Explain what a statement like C(4) = 60 means in context, or write a sentence in function notation.',
  generate(rng, difficulty) {
    const ctx = buildContext(rng);
    const { f, v } = ctx;
    const a = Q(rng.int(2, Math.max(3, ctx.maxInput)));
    const y = ctx.m.mul(a).add(ctx.b);
    const story = ctxStory(ctx);
    if (difficulty === 2) {
      const sentence = ctx.says(ctx.inWord(a), ctx.outWord(y));
      const answer = makeChoice(rng, `$${f}(${decTex(a)}) = ${decTex(y)}$`, [
        `$${f}(${decTex(y)}) = ${decTex(a)}$`,
        `$${decTex(a)} \\cdot ${f} = ${decTex(y)}$`,
        `$${f}(0) = ${decTex(y)}$`,
      ]);
      return makeProblem({
        skillId: 'S1.04',
        tags: ['real-world', 'word'],
        prompt: [p(story), p(`Which statement in function notation means: "${sentence}"`)],
        answer,
        hints: [
          `In $${f}(${v})$, the value inside the parentheses is the input (${ctx.inUnits}), and $${f}(${v})$ itself is the output.`,
          `Which number in the sentence is a number of ${ctx.inUnits}? That goes inside the parentheses.`,
          `The other number is the output, so it goes after the equals sign.`,
          `You can check a choice with the rule: substitute the input and see if you get the output.`,
        ],
        solution: [
          { text: `The input is ${ctx.inWord(a)}, so it goes inside the parentheses.`, why: `$${v}$ stands for the number of ${ctx.inUnits}.` },
          { text: `The output is ${ctx.outWord(y)}, so it goes after the equals sign.`, tex: `${f}(${decTex(a)}) = ${decTex(y)}` },
          { text: 'Check with the rule.', tex: `${f}(${decTex(a)}) = ${decTex(ctx.m)}(${decTex(a)})${ctx.b.isNegative() ? ' - ' + decTex(ctx.b.abs()) : ' + ' + decTex(ctx.b)} = ${decTex(y)}`, why: 'The statement is true for this function.' },
        ],
        misconceptions: [],
      });
    }
    if (difficulty === 3) {
      // meaning of the starting value f(0) = b
      const b = ctx.b;
      const answer = makeChoice(rng, ctx.says(ctx.inWord(Q(0)), ctx.outWord(b)), [
        `Each ${ctx.inUnit} changes the output by ${ctx.outWord(b)}.`,
        ctx.says(ctx.inWord(b.abs()), ctx.outWord(Q(0))),
        `The output is ${ctx.outWord(b)} for every number of ${ctx.inUnits}.`,
      ]);
      return makeProblem({
        skillId: 'S1.04',
        tags: ['real-world', 'word'],
        prompt: [p(story), p(`What does the statement $${f}(0) = ${decTex(b)}$ mean in this situation?`)],
        answer,
        hints: [
          `In $${f}(0)$, the input is $0$ ${ctx.inUnits}.`,
          'An input of 0 describes the situation at the very start.',
          `The output $${decTex(b)}$ is ${ctx.outputDesc.replace(/,? (after|for a) .*/, '')}.`,
          'Pick the choice that says what the output is when the input is 0.',
        ],
        solution: [
          { text: `The input is $0$: zero ${ctx.inUnits}.`, why: 'Inside the parentheses is always the input.' },
          { text: `The output is ${ctx.outWord(b)}.`, tex: `${f}(0) = ${decTex(ctx.m)}(0)${b.isNegative() ? ' - ' + decTex(b.abs()) : ' + ' + decTex(b)} = ${decTex(b)}`, why: `This is ${ctx.startMeaning}.` },
          { text: 'So the statement describes the starting value.' },
        ],
        misconceptions: [],
      });
    }
    const answer = makeChoice(rng, ctx.says(ctx.inWord(a), ctx.outWord(y)), [
      ctx.says(ctx.inWord(y.abs()), ctx.outWord(a)),
      `Each ${ctx.inUnit} changes the output by ${ctx.outWord(y)}.`,
      `$${f}$ multiplied by ${decTex(a)} equals ${decTex(y)}.`,
    ]);
    return makeProblem({
      skillId: 'S1.04',
      tags: ['real-world', 'word'],
      prompt: [p(story), p(`What does the statement $${f}(${decTex(a)}) = ${decTex(y)}$ mean in this situation?`)],
      answer,
      hints: [
        `In $${f}(${decTex(a)})$, the number inside the parentheses is the input: a number of ${ctx.inUnits}.`,
        `The number after the equals sign is the output. Here the output measures ${ctx.outputDesc.replace(/,? (after|for a) .*/, '')}.`,
        `So the statement connects ${ctx.inWord(a)} with an output of ${ctx.outWord(y)}.`,
        'Function notation is not multiplication. Rule out any choice that multiplies.',
      ],
      solution: [
        { text: `Identify the input: ${ctx.inWord(a)}.`, why: `$${v}$ is the number of ${ctx.inUnits}, and it goes inside the parentheses.` },
        { text: `Identify the output: ${ctx.outWord(y)}.`, why: `$${f}(${v})$ is ${ctx.outputDesc}.` },
        { text: 'Put them in a sentence.', why: ctx.says(ctx.inWord(a), ctx.outWord(y)) },
      ],
      misconceptions: [],
    });
  },
  verify(pr) {
    if (pr.answer.kind !== 'choice') return ['wrong answer kind'];
    const story = (pr.prompt[0] as { text: string }).text;
    const ask = (pr.prompt[1] as { text: string }).text;
    const rm = /\$([A-Z])\(([a-z])\) = (.+?)\$ gives/.exec(story);
    if (!rm) return ['cannot parse rule'];
    const label = choiceLabel(pr.answer);
    const errs: string[] = [];
    const sm = /\$[A-Z]\((-?[\d.]+)\) = (-?[\d.]+)\$/.exec(ask);
    if (sm) {
      // the statement must be true for the rule, and the correct sentence must name the input first, then the output
      const a = Rational.parse(sm[1]);
      const y = Rational.parse(sm[2]);
      if (!evalRule(rm[3], rm[2], a).eq(y)) errs.push('statement is false for the rule');
      const nums = numbersIn(label);
      if (nums.length < 2 || !nums[0].eq(a) || !nums[1].eq(y)) errs.push(`correct sentence does not pair input ${a} with output ${y}`);
    } else {
      const lm = /\$[A-Z]\((-?[\d.]+)\) = (-?[\d.]+)\$/.exec(label);
      const nums = numbersIn(ask.split('means:')[1] ?? '');
      if (!lm || nums.length < 2) return ['cannot parse notation choice'];
      const a = Rational.parse(lm[1]);
      const y = Rational.parse(lm[2]);
      if (!evalRule(rm[3], rm[2], a).eq(y)) errs.push('chosen notation is false for the rule');
      if (!nums[0].eq(a) || !nums[1].eq(y)) errs.push('notation does not match the sentence');
    }
    if (pr.answer.options.length < 3) errs.push('too few distinct options');
    return errs;
  },
};

export const U1_NOTATION_GENERATORS = [genSolveFx, genSolveFxGraph, genSolveContext, genInterpretNotation];

