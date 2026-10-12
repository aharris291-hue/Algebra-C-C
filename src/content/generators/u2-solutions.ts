/**
 * Unit 2, Lesson 3 generators: solutions and constraints (S2.04).
 * Test points in an inequality, and decide what is possible in a situation.
 */
import type { GeneratorDef, Rng, Difficulty, SolutionStep, ProblemStep } from '../../core/curriculum/types';
import type { MisconceptionTag } from '../../core/math/answers';
import { Rational } from '../../core/math/rational';
import { linearTex, linearPlain } from '../../core/math/format';
import { toPoly } from '../../core/math/poly';
import { parseExpression } from '../../core/math/parser';
import { Q, p, makeProblem, numStr, money, makeChoice, choiceLabel, numberMisconceptions, decimalOrFraction } from './util';
import { coefTex } from '../../core/math/format';
import { Op, OP_TEX, isStrict, isGreater, relTexToPlain, holds, ptTex, stepChoice, lastStepErrors, stepLabel, optionMisList } from './u2-common';
import { SYS_CONTEXTS, buildSystem, countOf, ifThereAre } from './u2-contexts';

/** Both sides of a plain relation evaluated at (x, y). */
function sides(rel: string, x: Rational, y: Rational): [Rational, Rational] {
  const [l, r] = rel.split(/<=|>=|<|>|=/);
  const at = (e: string) => toPoly(parseExpression(e)).evaluate({ x, y });
  return [at(l), at(r)];
}

const TRUTH_WORD = (ok: boolean) => (ok ? 'true' : 'false');

/** One substitution line for the worked solution. */
function substitution(rel: string, op: Op, x: Rational, y: Rational): SolutionStep {
  const [l, r] = sides(rel, x, y);
  const ok = holds(rel, x, y);
  const onLine = l.eq(r);
  return {
    text: `Test ${ptTex(x, y)}: the left side is $${l.toTex()}$ and the right side is $${r.toTex()}$.`,
    tex: `${l.toTex()} ${OP_TEX[op]} ${r.toTex()}\\ \\text{is ${TRUTH_WORD(ok)}}`,
    why: onLine ? `The point is on the boundary line. ${isStrict(op) ? 'The symbol does not include equal, so it is **not** a solution.' : 'The symbol includes equal, so it **is** a solution.'}` : ok ? 'A true statement means the point is a solution.' : 'A false statement means the point is not a solution.',
  };
}

// ---------------------------------------------------------------------------
// S2.04: which point is a solution?
// ---------------------------------------------------------------------------

function pickInequality(rng: Rng, d: Difficulty): { tex: string; plain: string; op: Op } {
  const op = rng.pick(['<', '>', '<=', '>='] as Op[]);
  if (d === 1 || (d === 3 && rng.bool())) {
    const m = Q(rng.nonzeroInt(-3, 3));
    const b = Q(rng.int(-5, 5));
    return { tex: `y ${OP_TEX[op]} ${linearTex(m, b)}`, plain: `y ${op} ${linearPlain(m, b)}`, op };
  }
  const A = rng.nonzeroInt(-5, 5);
  const B = rng.nonzeroInt(-5, 5);
  const C = rng.int(-12, 12);
  const lhs = `${linearTex(Q(A), Q(0))} ${B < 0 ? '-' : '+'} ${Math.abs(B) === 1 ? '' : Math.abs(B)}y`;
  return { tex: `${lhs} ${OP_TEX[op]} ${C}`, plain: `${A}x + ${B}y ${op} ${C}`, op };
}

/** The sign hint, only when a negative number is in play (in the inequality or in a choice); otherwise a hint about order of work. */
function signHint(ineqTex: string, labels: string[]): string {
  return /-/.test(ineqTex) || labels.some((l) => l.includes('-'))
    ? 'Be careful with negative numbers: put them in parentheses when you substitute.'
    : 'Work out each side completely (multiply before you add) before you compare the two sides.';
}

const SOL_YES = (pt: string) => `Yes: the statement is true, so ${pt} is a solution.`;
const SOL_NO = (pt: string) => `No: the statement is false, so ${pt} is not a solution.`;

/**
 * Guided steps for "which point is a solution of y op mx + b" (difficulty 1): test the first
 * option (its boundary height, then the verdict), then test the rest and choose.
 */
function isSolutionSteps(ineq: { tex: string; plain: string; op: Op }, first: { x: number; y: number }, answer: ReturnType<typeof makeChoice>): ProblemStep[] {
  const rhsTex = ineq.tex.split(/\\le|\\ge|<|>/)[1].trim();
  const rhsPoly = toPoly(parseExpression(ineq.plain.split(/<=|>=|<|>/)[1]));
  const rhs = rhsPoly.evaluate({ x: Q(first.x) });
  const wrongX = rhsPoly.evaluate({ x: Q(first.y) });
  const pt = ptTex(first.x, first.y);
  const ok = holds(ineq.plain, first.x, first.y);
  const verdictAns = stepChoice(ok ? SOL_YES(pt) : SOL_NO(pt), [ok ? SOL_NO(pt) : SOL_YES(pt)], first.x + first.y);
  const subTex = rhsTex.replace(/x/g, `(${first.x})`);
  return [
    {
      prompt: [p(`Test the first choice, ${pt}. Substitute $x = ${first.x}$ into the right side, $${rhsTex}$. What number do you get?`)],
      answer: { kind: 'number', value: numStr(rhs) },
      hints: [
        'In an ordered pair $(x, y)$ the first number is $x$.',
        `Replace $x$ with $${first.x}$: $${subTex}$.`,
        'Multiply first, then add or subtract.',
        first.x < 0 ? 'A negative times a negative is positive; a negative times a positive is negative.' : 'Keep track of the signs as you combine.',
      ],
      misconceptions: numberMisconceptions(rhs, [
        { value: wrongX, tag: 'other', feedback: `Use the $x$-value, $${first.x}$, the first number in the pair.` },
        { value: first.x === 0 ? null : rhsPoly.evaluate({ x: Q(-first.x) }), tag: 'sign-error', feedback: 'Check the sign of the product: put the input in parentheses and multiply carefully.' },
      ]),
      explanation: `$${subTex} = ${rhs.toTex()}$, so the boundary line is at height $${rhs.toTex()}$ when $x = ${first.x}$.`,
    },
    {
      prompt: [p(`Now compare: is $${first.y} ${OP_TEX[ineq.op]} ${rhs.toTex()}$ true? Is ${pt} a solution?`)],
      answer: verdictAns,
      hints: [
        'A point is a solution exactly when it makes the inequality true.',
        `Compare $${first.y}$ (the $y$-value) with $${rhs.toTex()}$.`,
        'On a number line, the number farther to the right is greater.',
        isStrict(ineq.op) ? 'If the two numbers are equal, a strict symbol ($<$ or $>$) makes the statement false.' : 'If the two numbers are equal, "or equal to" makes the statement true.',
      ],
      misconceptions: [{ answer: verdictAns.options.find((o) => o.id !== verdictAns.correct)!.id, tag: 'other', feedback: `Check the comparison $${first.y} ${OP_TEX[ineq.op]} ${rhs.toTex()}$ again: which number is bigger?` }],
      explanation: `$${first.y} ${OP_TEX[ineq.op]} ${rhs.toTex()}$ is ${ok ? 'true' : 'false'}, so ${pt} is ${ok ? '' : 'not '}a solution.`,
    },
    {
      prompt: [p('Test the other points the same way. Which point is a solution?')],
      answer,
      hints: [
        'Substitute each point: $x$ into the right side, then compare with its $y$-value.',
        'Only one choice makes the inequality true.',
        signHint(ineq.tex, answer.options.map((o) => o.label)),
        `If a point makes the two sides equal, it is on the boundary line. ${isStrict(ineq.op) ? 'Here that point would not be a solution.' : 'Here that point would be a solution.'}`,
      ],
      misconceptions: answer.options.filter((o) => o.id !== answer.correct).map((o) => ({ answer: o.id, tag: 'other' as const, feedback: `Substitute ${o.label} again: it makes the inequality false.` })),
      explanation: `${choiceLabel(answer)} is the only choice that makes $${ineq.tex}$ true.`,
    },
  ];
}

export const genIsSolution: GeneratorDef = {
  id: 'u2.is-solution',
  skillId: 'S2.04',
  description: 'Decide which points are solutions of a linear inequality in two variables.',
  generate(rng, difficulty) {
    const ineq = pickInequality(rng, difficulty);
    const askNot = difficulty === 2 && rng.bool();
    const pts: Array<{ x: number; y: number; ok: boolean; on: boolean }> = [];
    for (let x = -6; x <= 6; x++)
      for (let y = -8; y <= 8; y++) {
        const [l, r] = sides(ineq.plain, Q(x), Q(y));
        pts.push({ x, y, ok: holds(ineq.plain, x, y), on: l.eq(r) });
      }
    const want = !askNot;
    const pool = (ok: boolean, on?: boolean) => pts.filter((q) => q.ok === ok && (on === undefined || q.on === on));
    let correct: { x: number; y: number };
    let distractors: Array<{ x: number; y: number }>;
    const pickN = <T,>(arr: T[], n: number): T[] => rng.shuffle([...arr]).slice(0, n);
    if (difficulty === 3) {
      // a boundary point is in play
      const onPts = pts.filter((q) => q.on);
      if (onPts.length === 0) return genIsSolution.generate(rng, 2);
      const boundary = rng.pick(onPts);
      if (isStrict(ineq.op)) {
        // boundary point is a tempting wrong answer
        correct = rng.pick(pool(true, false));
        distractors = [boundary, ...pickN(pool(false, false), 2)];
      } else {
        // boundary point is the only solution offered
        correct = boundary;
        distractors = pickN(pool(false, false), 3);
      }
    } else {
      correct = rng.pick(pool(want, false));
      distractors = pickN(pool(!want, false), 3);
    }
    const opts = [correct, ...distractors];
    const answer = makeChoice(rng, ptTex(correct.x, correct.y), distractors.map((d) => ptTex(d.x, d.y)));
    const ordered = answer.options.map((o) => opts.find((q) => ptTex(q.x, q.y) === o.label)!);
    const misconceptions = optionMisList(
      answer,
      distractors.map((q): [string, MisconceptionTag, string] => {
        const pt = ptTex(q.x, q.y);
        const [l, r] = sides(ineq.plain, Q(q.x), Q(q.y));
        const cmp = `$${l.toTex()} ${OP_TEX[ineq.op]} ${r.toTex()}$`;
        if (askNot) return [pt, 'other', `Substitute ${pt}: ${cmp} is true, so ${pt} **is** a solution. The question asks for a point that is **not** a solution.`];
        if (l.eq(r)) return [pt, 'boundary-line', `${pt} is on the boundary line: it makes the two sides equal ($${l.toTex()} = ${r.toTex()}$). The symbol $${OP_TEX[ineq.op]}$ has no "or equal to", so a point on the boundary is not a solution.`];
        return [pt, 'arithmetic-error', `Substitute ${pt} again${/-/.test(ineq.tex) || q.x < 0 || q.y < 0 ? ', using parentheses for negatives' : ''}: ${cmp} is false, so ${pt} is not a solution.`];
      }),
    );
    return makeProblem({
      skillId: 'S2.04',
      tags: [],
      prompt: [p(`Which point is ${askNot ? '**not** ' : ''}a solution of $${ineq.tex}$?`)],
      answer,
      hints: [
        'A point is a solution when substituting it makes the inequality a **true** statement.',
        'Substitute the $x$-value and the $y$-value of each point, then compare the two sides.',
        signHint(ineq.tex, answer.options.map((o) => o.label)),
        `If a point makes the two sides exactly equal, it is on the boundary line. ${isStrict(ineq.op) ? 'Here the symbol has no "or equal to", so a boundary point is not a solution.' : 'Here the symbol includes "or equal to", so a boundary point is a solution.'}`,
      ],
      solution: [
        ...ordered.map((q) => substitution(ineq.plain, ineq.op, Q(q.x), Q(q.y))),
        { text: `So ${ptTex(correct.x, correct.y)} is the point that is ${askNot ? 'not ' : ''}a solution.`, why: askNot ? 'It is the only one that makes the inequality false.' : 'It is the only one that makes the inequality true.' },
      ],
      misconceptions,
      steps: difficulty === 1 ? isSolutionSteps(ineq, ordered[0], answer) : undefined,
    });
  },
  verify(pr) {
    if (pr.answer.kind !== 'choice') return ['unexpected kind'];
    const m = /^Which point is (\*\*not\*\* )?a solution of \$(.+)\$\?$/.exec((pr.prompt[0] as { text: string }).text);
    if (!m) return ['cannot parse'];
    const rel = relTexToPlain(m[2]);
    const want = !m[1];
    const errs: string[] = [];
    const pt = (lab: string) => {
      const q = /^\$\((-?\d+), (-?\d+)\)\$$/.exec(lab)!;
      return [Number(q[1]), Number(q[2])] as const;
    };
    const matching = pr.answer.options.filter((o) => holds(rel, ...pt(o.label)) === want);
    if (matching.length !== 1) errs.push(`${matching.length} options have the asked property`);
    else if (matching[0].id !== pr.answer.correct) errs.push('wrong key');
    if (new Set(pr.answer.options.map((o) => o.label)).size !== 4) errs.push('duplicate options');
    if (pr.steps?.length === 3) {
      // the first option, tested on its own: boundary height at its x (by bisecting the relation), then the verdict
      const [x0, y0] = pt(pr.answer.options[0].label);
      const s1 = pr.steps[0].answer;
      if (s1.kind !== 'number' || !holds(rel.replace(/<=|>=|<|>/, '='), x0, Rational.parse(s1.value))) errs.push('boundary-height step wrong');
      if (stepLabel(pr.steps[1]).startsWith('Yes') !== holds(rel, x0, y0)) errs.push('verdict step wrong');
      errs.push(...lastStepErrors(pr));
    }
    return errs;
  },
};

// ---------------------------------------------------------------------------
// S2.04: possible or not possible in context
// ---------------------------------------------------------------------------

const verdict = (ok: boolean) => (ok ? 'Yes' : 'No');
const MEETS = (rel: string) => `True: $${rel}$ is a true statement, so the combination meets the condition.`;
const FAILS = (rel: string) => `False: $${rel}$ is a false statement, so the combination does not meet the condition.`;

/** Guided steps for a yes/no constraint question with whole numbers (difficulty 1): the total, the comparison, the verdict. */
function constraintSteps(ctx: (typeof SYS_CONTEXTS)[number], a: Rational, b: Rational, t: Rational, op: Op, x: Rational, y: Rational, answer: ReturnType<typeof makeChoice>): ProblemStep[] {
  const tot = a.mul(x).add(b.mul(y));
  const ok = holds(`${numStr(a)}x + ${numStr(b)}y ${op} ${numStr(t)}`, x, y);
  const cmpTex = `${tot.toTex()} ${OP_TEX[op]} ${t.toTex()}`;
  const cmp = stepChoice(ok ? MEETS(cmpTex) : FAILS(cmpTex), [ok ? FAILS(cmpTex) : MEETS(cmpTex)], tot.toNumber());
  return [
    {
      prompt: [p(`Substitute $x = ${x.toTex()}$ and $y = ${y.toTex()}$ into the left side, $${coefTex(a)}x + ${coefTex(b)}y$. What is the ${ctx.moneyWhat}, in dollars?`)],
      answer: { kind: 'number', value: numStr(tot) },
      hints: [
        `$x$ counts the ${ctx.xNoun} and $y$ counts the ${ctx.yNoun}.`,
        'Each kind adds (price times how many).',
        `Work out $${a.toTex()}(${x.toTex()})$ and $${b.toTex()}(${y.toTex()})$.`,
        'Add the two products.',
      ],
      misconceptions: numberMisconceptions(tot, [
        { value: b.mul(x).add(a.mul(y)), tag: 'equation-setup', feedback: `Match each price with its own item: ${money(a)} goes with the ${ctx.xNoun}.` },
        { value: a.add(b).add(x).add(y), tag: 'order-of-operations', feedback: 'Multiply each price by how many, then add. Do not add everything together.' },
      ]),
      explanation: `$${a.toTex()}(${x.toTex()}) + ${b.toTex()}(${y.toTex()}) = ${tot.toTex()}$.`,
    },
    {
      prompt: [p(`Compare the total with ${money(t)}. Is $${cmpTex}$ true?`)],
      answer: cmp,
      hints: [
        `The symbol is $${OP_TEX[op]}$: ${isGreater(op) ? 'the total must reach the goal' : 'the total must stay within the limit'}.`,
        `Is $${tot.toTex()}$ ${isGreater(op) ? 'at least' : 'at most'} $${t.toTex()}$?`,
        'If the two numbers are equal, "or equal to" makes the statement true.',
        'A true statement means the combination meets the condition.',
      ],
      misconceptions: [{ answer: cmp.options.find((o) => o.id !== cmp.correct)!.id, tag: 'other', feedback: `Compare $${tot.toTex()}$ and $${t.toTex()}$ again: which is bigger, and what does $${OP_TEX[op]}$ require?` }],
      explanation: `$${cmpTex}$ is ${ok ? 'true' : 'false'}.`,
    },
    {
      prompt: [p('Both numbers are whole and not negative, so they make sense as counts. Now answer the question.')],
      answer,
      hints: [
        'A combination is possible when it makes sense **and** makes the inequality true.',
        ok ? 'Your comparison was true.' : 'Your comparison was false.',
        'Choose the answer whose total and comparison match yours.',
        'Check that the prices are matched with the right items in the answer you pick.',
      ],
      misconceptions: answer.options.filter((o) => o.id !== answer.correct).map((o) => ({ answer: o.id, tag: 'other' as const, feedback: !o.label.includes('=') ? `That reason skips the check. Compare the total, $${tot.toTex()}$, with the condition.` : !o.label.includes(`= ${decimalOrFraction(tot)}$`) ? `That choice uses a different total. The ${ctx.moneyWhat} is $${tot.toTex()}$.` : `The total is right, but check the verdict: is $${cmpTex}$ true?` })),
      explanation: `${ok ? 'Yes' : 'No'}: the total is ${money(tot)}, and $${cmpTex}$ is ${ok ? 'true' : 'false'}.`,
    },
  ];
}

export const genConstraintContext: GeneratorDef = {
  id: 'u2.constraint-context',
  skillId: 'S2.04',
  description: 'Decide whether a combination is possible in a situation described by an inequality.',
  generate(rng, difficulty) {
    const sys = buildSystem(rng, rng.pick(SYS_CONTEXTS));
    const { ctx, a, b, t } = sys;
    const op = ctx.moneyOp;
    const rel = `${numStr(a)}x + ${numStr(b)}y ${op} ${numStr(t)}`;
    const relTex = `${coefTex(a)}x + ${coefTex(b)}y ${OP_TEX[op]} ${t.toTex()}`;
    const setup = p(`${ctx.moneyText(money(a), money(b), money(t))} This is described by $${relTex}$, where $x$ is the number of ${ctx.xNoun} and $y$ is the number of ${ctx.yNoun}.`);
    const total = (x: Rational, y: Rational) => a.mul(x).add(b.mul(y));
    if (difficulty === 3) {
      // greatest (for <=) or least (for >=) whole number of y, given x
      const xMax = t.div(a).floor();
      const X = Q(rng.int(1, Math.max(1, Number(xMax) - 1)));
      const rest = t.sub(a.mul(X));
      const exact = rest.div(b);
      const y = isGreater(op) ? (exact.isInteger() ? exact : Q(exact.floor()).add(Q(1))) : Q(exact.floor());
      if (y.isNegative() || (isGreater(op) && y.isZero())) return genConstraintContext.generate(rng, 2);
      const word = isGreater(op) ? 'least' : 'greatest';
      return makeProblem({
        skillId: 'S2.04',
        tags: ['real-world', 'word'],
        prompt: [setup, p(`${ifThereAre(ctx, X.toNumber())}, what is the **${word}** whole number of ${ctx.yNoun} that works?`)],
        answer: { kind: 'number', value: numStr(y) },
        inputHint: 'Type a whole number.',
        hints: [
          `Substitute $x = ${X.toTex()}$ into the inequality.`,
          `That gives $${a.mul(X).toTex()} + ${coefTex(b)}y ${OP_TEX[op]} ${t.toTex()}$. Solve for $y$.`,
          `You should get $y ${OP_TEX[op]}$ a number that may not be whole. Only whole numbers make sense here.`,
          isGreater(op) ? 'For "at least", round **up**: rounding down would fall short.' : 'For "at most", round **down**: rounding up would go over.',
        ],
        solution: [
          { text: `Substitute $x = ${X.toTex()}$.`, tex: `${a.mul(X).toTex()} + ${coefTex(b)}y ${OP_TEX[op]} ${t.toTex()}` },
          { text: `Subtract $${a.mul(X).toTex()}$ from both sides.`, tex: `${coefTex(b)}y ${OP_TEX[op]} ${rest.toTex()}`, why: 'Subtracting keeps the symbol the same.' },
          { text: `Divide by $${b.toTex()}$.`, tex: `y ${OP_TEX[op]} ${exact.isInteger() ? exact.toTex() : `${exact.toTex()} \\approx ${exact.round(2).toDecimalString(2)}`}`, why: 'Dividing by a positive number keeps the symbol the same.' },
          { text: `The ${word} whole number that works is $${y.toTex()}$.`, why: `Check: $${total(X, y).toTex()}$ ${holds(rel, X, y) ? 'works' : 'fails'}, but ${countOf(ctx, 'y', isGreater(op) ? y.sub(Q(1)).toTex() : y.add(Q(1)).toTex())} would give $${total(X, isGreater(op) ? y.sub(Q(1)) : y.add(Q(1))).toTex()}$, which does not.` },
        ],
        misconceptions: numberMisconceptions(y, [
          { value: isGreater(op) ? Q(exact.floor()) : Q(exact.floor()).add(Q(1)), tag: 'other', feedback: isGreater(op) ? `Check it: that many ${ctx.yNoun} falls just short. Round up instead.` : `Check it: that many ${ctx.yNoun} goes over the limit. Round down instead.` },
          { value: t.div(b).isInteger() ? t.div(b) : Q(t.div(b).floor()), tag: 'equation-setup', feedback: `Don't forget the ${countOf(ctx, 'x', X.toTex())}: that amount uses up part of the total first.` },
        ]),
      });
    }
    // yes / no question
    type Case = { x: Rational; y: Rational; reason: 'fits' | 'fails' | 'fraction' | 'negative' };
    const kind: Case['reason'] = difficulty === 2 ? rng.pick(ctx.key === 'jobs' ? (['fits', 'fails', 'negative'] as const) : (['fits', 'fails', 'fraction', 'negative'] as const)) : rng.pick(['fits', 'fails'] as const);
    let c: Case | null = null;
    for (let guard = 0; guard < 200 && !c; guard++) {
      let x = Q(rng.int(1, 30));
      let y = Q(rng.int(1, 30));
      if (kind === 'fraction') x = x.add(Q(1, 2));
      if (kind === 'negative') y = Q(-rng.int(1, 4));
      const ok = holds(rel, x, y);
      // fraction and negative cases must satisfy the inequality, so the trap is real
      if ((kind === 'fits' && ok) || (kind === 'fails' && !ok) || ((kind === 'fraction' || kind === 'negative') && ok)) {
        // keep totals near the target so the check matters
        if (total(x, y).sub(t).abs().le(t.mul(Q(1, 2)))) c = { x, y, reason: kind };
      }
    }
    if (!c) return genConstraintContext.generate(rng, 1);
    const tot = total(c.x, c.y);
    const ok = c.reason === 'fits';
    const cmp = (v: Rational) => `$${decimalOrFraction(v)} ${holds(`${numStr(v)} ${op} ${numStr(t)}`, 0, 0) ? OP_TEX[op] : op === '<=' ? '>' : '<'} ${t.toTex()}$`;
    const D = decimalOrFraction;
    const sub = `$${a.toTex()}(${D(c.x)}) + ${b.toTex()}(${D(c.y)}) = ${D(tot)}$`;
    const swappedTot = b.mul(c.x).add(a.mul(c.y));
    const swapped = `$${b.toTex()}(${D(c.x)}) + ${a.toTex()}(${D(c.y)}) = ${D(swappedTot)}$`;
    let correct: string;
    let distractors: string[];
    /** feedback for each distractor, in the same order */
    let wrongFb: Array<[MisconceptionTag, string]>;
    const swapFb: [MisconceptionTag, string] = ['equation-setup', `This choice multiplies each price by the wrong count: ${money(a)} goes with the ${ctx.xNoun} ($x$) and ${money(b)} goes with the ${ctx.yNoun} ($y$).`];
    if (c.reason === 'fraction' || c.reason === 'negative') {
      const why = c.reason === 'fraction' ? `there cannot be $${D(c.x)}$ ${ctx.xNoun}; it has to be a whole number` : `there cannot be a negative number of ${ctx.yNoun}`;
      correct = `No. It makes the inequality true, but ${why}.`;
      distractors = [`Yes. ${sub}, and ${cmp(tot)}, so it works.`, `No. ${sub}, so it makes the inequality false.`, 'Yes. Every point that makes the inequality true is possible.'];
      wrongFb = [
        ['other', `You checked the inequality, but not whether the numbers make sense in the situation. Look at each number: could it really be a number of ${ctx.xNoun} or ${ctx.yNoun}?`],
        ['other', `Compare again: ${cmp(tot)} is a true statement, so the inequality is not false. This reason does not hold.`],
        ['other', 'Not every solution of the inequality fits the situation. The numbers also have to make sense in real life, so check each one.'],
      ];
    } else {
      correct = `${verdict(ok)}. ${sub}, and ${cmp(tot)}.`;
      distractors = [`${verdict(!ok)}. ${sub}, and ${cmp(tot)}.`];
      wrongFb = [['other', 'Read the comparison in this choice again. A true comparison means the combination meets the condition, and a false one means it does not. Does the Yes or No match it?']];
      if (!swappedTot.eq(tot)) {
        distractors.push(`${verdict(holds(rel, c.y, c.x))}. ${swapped}, and ${cmp(swappedTot)}.`, `${verdict(!holds(rel, c.y, c.x))}. ${swapped}, and ${cmp(swappedTot)}.`);
        wrongFb.push(swapFb, swapFb);
      } else {
        distractors.push(`${verdict(!ok)}. Only whole numbers can be tested.`, `${verdict(ok)}. The total does not matter here.`);
        wrongFb.push(['other', `Any combination of counts can be tested: substitute the numbers and compare the total with ${money(t)}.`], ['other', `The total is exactly what the condition is about. Substitute the numbers and compare the total with ${money(t)}.`]);
      }
    }
    const answer = makeChoice(rng, correct, distractors);
    const misconceptions = optionMisList(answer, distractors.map((d, i): [string, MisconceptionTag, string] => [d, wrongFb[i][0], wrongFb[i][1]]));
    const qText = `Is it possible to have ${countOf(ctx, 'x', decimalOrFraction(c.x))} and ${countOf(ctx, 'y', decimalOrFraction(c.y))}?`;
    return makeProblem({
      skillId: 'S2.04',
      tags: ['real-world', 'word'],
      prompt: [setup, p(qText)],
      answer,
      hints: [
        'Two questions: does the combination make sense in real life, and does it make the inequality true?',
        `Substitute $x = ${decimalOrFraction(c.x)}$ and $y = ${decimalOrFraction(c.y)}$: ${ctx.xNoun} go with ${money(a)} and ${ctx.yNoun} with ${money(b)}.`,
        `Compare the total with ${money(t)} using $${OP_TEX[op]}$.`,
        ctx.key === 'jobs' ? 'Hours worked cannot be negative, even when the numbers fit.' : 'Counts of things like tickets or items cannot be negative or fractions, even when the numbers fit.',
      ],
      steps: difficulty === 1 ? constraintSteps(ctx, a, b, t, op, c.x, c.y, answer) : undefined,
      solution: [
        { text: 'Check that the numbers make sense.', why: c.reason === 'fraction' ? `$${decimalOrFraction(c.x)}$ is not a whole number, so it cannot be a count of ${ctx.xNoun}.` : c.reason === 'negative' ? `$${c.y.toTex()}$ is negative, and a count cannot be negative.` : 'Both are whole numbers, so they could happen.' },
        { text: 'Substitute into the inequality.', tex: `${a.toTex()}(${decimalOrFraction(c.x)}) + ${b.toTex()}(${decimalOrFraction(c.y)}) = ${decimalOrFraction(tot)}`, why: `Then compare: is $${decimalOrFraction(tot)} ${OP_TEX[op]} ${t.toTex()}$? It is ${TRUTH_WORD(holds(rel, c.x, c.y))}.` },
        { text: `So the answer is: ${correct}`, why: c.reason === 'fraction' || c.reason === 'negative' ? 'A solution of the inequality still has to make sense in the situation.' : ok ? 'It is a solution and it makes sense, so it is possible.' : 'It is not a solution, so it is not possible.' },
      ],
      misconceptions,
    });
  },
  verify(pr) {
    const text = (pr.prompt[0] as { text: string }).text;
    const m = /described by \$(.+?)\$/.exec(text);
    if (!m) return ['cannot parse'];
    const rel = relTexToPlain(m[1]);
    const q = (pr.prompt[1] as { text: string }).text;
    const errs: string[] = [];
    if (pr.answer.kind === 'number') {
      const mm = /If there (?:are|is) \$(\d+)\$/.exec(q);
      const X = Q(Number(mm![1]));
      const y = Rational.parse(pr.answer.value);
      const greater = /least/.test(q);
      // brute force over whole numbers
      let best: Rational | null = null;
      for (let k = 0; k <= 400; k++) if (holds(rel, X, k)) best = greater ? (best ?? Q(k)) : Q(k);
      if (!best || !best.eq(y)) errs.push(`brute force gives ${best}, key ${y}`);
      return errs;
    }
    if (pr.answer.kind !== 'choice') return ['unexpected kind'];
    const mm = /Is it possible to have \$(.+?)\$ .+ and \$(.+?)\$/.exec(q);
    if (!mm) return ['cannot parse question'];
    const x = Rational.parse(mm[1]);
    const y = Rational.parse(mm[2]);
    const possible = x.isInteger() && y.isInteger() && !x.isNegative() && !y.isNegative() && holds(rel, x, y);
    if (choiceLabel(pr.answer).startsWith('Yes') !== possible) errs.push('verdict wrong');
    // every claim the key makes about the inequality must be true
    const truth = holds(rel, x, y);
    const keyLab = choiceLabel(pr.answer);
    if (/makes the inequality false/.test(keyLab) && truth) errs.push('key claims the inequality is false');
    if (/makes the inequality true/.test(keyLab) && !truth) errs.push('key claims the inequality is true');
    if (/cannot be \$/.test(keyLab) && x.isInteger()) errs.push('key claims a whole number is a fraction');
    if (/negative number/.test(keyLab) && !y.isNegative() && !x.isNegative()) errs.push('key claims a negative count');
    if (/Every point that makes the inequality true is possible|Only whole numbers can be tested|The total does not matter/.test(keyLab)) errs.push('key gives an invalid reason');
    if (pr.steps?.length === 3) {
      const s1 = pr.steps[0].answer;
      const [l] = sides(rel, x, y);
      if (s1.kind !== 'number' || !Rational.parse(s1.value).eq(l)) errs.push('total step wrong');
      if (stepLabel(pr.steps[1]).startsWith('True') !== truth) errs.push('comparison step wrong');
      errs.push(...lastStepErrors(pr));
    }
    // the correct option's stated comparison must be true
    const lab = choiceLabel(pr.answer);
    const totM = / = (-?\d+(?:\.\d+)?)\$/.exec(lab);
    if (totM) {
      const tot = Rational.parse(totM[1]);
      const [l] = sides(rel, x, y);
      if (!tot.eq(l)) errs.push('stated total wrong');
    }
    return errs;
  },
};

export const U2_SOLUTION_GENERATORS: GeneratorDef[] = [genIsSolution, genConstraintContext];
