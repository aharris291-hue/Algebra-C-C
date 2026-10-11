/**
 * Unit 2, Lesson 1 generators: one-variable inequalities (S2.01).
 * Solve (flipping the symbol when multiplying or dividing by a negative) and graph on a number line.
 */
import type { GeneratorDef, Rng, Difficulty, Block, ProblemStep } from '../../core/curriculum/types';
import { Rational } from '../../core/math/rational';
import { linearTex } from '../../core/math/format';
import { Q, p, makeProblem, numStr, makeChoice, choiceLabel, stringMisconceptions, texValue, numberMisconceptions } from './util';
import { toPoly } from '../../core/math/poly';
import { parseExpression } from '../../core/math/parser';
import { Op, OP_TEX, FLIP_OP, TOGGLE_STRICT, isStrict, isGreater, pickOp, relTexToPlain, sameOneVarSolutions, holds, stepChoice, idOf, lastStepErrors, stepLabel } from './u2-common';

const ineqPlain = (v: string, op: Op, k: Rational) => `${v} ${op} ${numStr(k)}`;
const ineqTex = (v: string, op: Op, k: Rational) => `${v} ${OP_TEX[op]} ${k.toTex()}`;

// ---------------------------------------------------------------------------
// S2.01: solve a one-variable inequality
// ---------------------------------------------------------------------------

interface SolveCase {
  /** left and right sides in TeX */
  lhs: string;
  rhs: string;
  op: Op;
  /** solution: x op2 k */
  k: Rational;
  solOp: Op;
  /** coefficient of x after collecting terms (sign decides a flip) */
  coef: Rational;
  /** constant on the right after collecting, i.e. coef·x op const */
  collected: Rational;
  kind: 'one-step-add' | 'one-step-mul' | 'two-step' | 'both-sides' | 'distribute';
  /** for both-sides / distribute: the intermediate form before isolating */
  note?: string;
}

function pickSolve(rng: Rng, d: Difficulty): SolveCase {
  const op = pickOp(rng);
  if (d === 1) {
    if (rng.bool()) {
      // x + b op c
      const b = Q(rng.nonzeroInt(-12, 12));
      const k = Q(rng.nonzeroInt(-10, 12));
      const c = k.add(b);
      return { lhs: linearTex(Q(1), b), rhs: c.toTex(), op, k, solOp: op, coef: Q(1), collected: k, kind: 'one-step-add' };
    }
    // a x op c with a positive or negative (one step, half the time a flip)
    let a = Q(rng.nonzeroInt(-9, 9));
    while (a.abs().le(1)) a = Q(rng.nonzeroInt(-9, 9));
    const k = Q(rng.nonzeroInt(-9, 9));
    const c = a.mul(k);
    return { lhs: linearTex(a, Q(0)), rhs: c.toTex(), op, k, solOp: a.isNegative() ? FLIP_OP[op] : op, coef: a, collected: c, kind: 'one-step-mul' };
  }
  if (d === 2) {
    // m x + b op c, negative m about 60% of the time
    let m = Q(rng.nonzeroInt(2, 9));
    if (rng.next() < 0.6) m = m.neg();
    const k = Q(rng.nonzeroInt(-9, 9));
    let b = Q(rng.nonzeroInt(-15, 15));
    const c = m.mul(k).add(b);
    if (rng.bool()) {
      // written b + m x so the x term is not first
      const lhs = `${b.toTex()} ${m.isNegative() ? '-' : '+'} ${m.abs().eq(1) ? '' : m.abs().toTex()}x`;
      return { lhs, rhs: c.toTex(), op, k, solOp: m.isNegative() ? FLIP_OP[op] : op, coef: m, collected: c.sub(b), kind: 'two-step' };
    }
    return { lhs: linearTex(m, b), rhs: c.toTex(), op, k, solOp: m.isNegative() ? FLIP_OP[op] : op, coef: m, collected: c.sub(b), kind: 'two-step' };
  }
  if (rng.bool()) {
    // a x + b op c x + e (variables on both sides); coefficient a - c may be negative; k may be a fraction
    let a = Q(rng.nonzeroInt(-8, 8));
    let c = Q(rng.nonzeroInt(-8, 8));
    while (a.eq(c)) c = Q(rng.nonzeroInt(-8, 8));
    const coef = a.sub(c);
    let k = Q(rng.nonzeroInt(-8, 8));
    if (rng.next() < 0.3 && coef.abs().gt(Q(1))) {
      // a fractional boundary
      let num = rng.nonzeroInt(-20, 20);
      while (num % coef.toInt() === 0) num = rng.nonzeroInt(-20, 20);
      k = Q(num).div(coef);
    }
    const b = Q(rng.nonzeroInt(-12, 12));
    // a k + b = c k + e  =>  e = (a - c) k + b
    const e = coef.mul(k).add(b);
    return { lhs: linearTex(a, b), rhs: linearTex(c, e), op, k, solOp: coef.isNegative() ? FLIP_OP[op] : op, coef, collected: e.sub(b), kind: 'both-sides' };
  }
  // m(x + h) op c with m negative half the time
  let m = Q(rng.nonzeroInt(2, 6));
  if (rng.bool()) m = m.neg();
  const h = Q(rng.nonzeroInt(-7, 7));
  const k = Q(rng.nonzeroInt(-8, 8));
  const c = m.mul(k.add(h));
  const inner = linearTex(Q(1), h);
  return { lhs: `${m.eq(-1) ? '-' : m.toTex()}(${inner})`, rhs: c.toTex(), op, k, solOp: m.isNegative() ? FLIP_OP[op] : op, coef: m, collected: c.sub(m.mul(h)), kind: 'distribute' };
}

export const genSolveIneq: GeneratorDef = {
  id: 'u2.solve-ineq',
  skillId: 'S2.01',
  description: 'Solve a one-variable linear inequality, flipping the symbol when multiplying or dividing by a negative.',
  generate(rng, difficulty) {
    const s = pickSolve(rng, difficulty);
    const orig = `${s.lhs} ${OP_TEX[s.op]} ${s.rhs}`;
    const flips = s.coef.isNegative();
    const answer = ineqPlain('x', s.solOp, s.k);
    const collectedTex = `${linearTex(s.coef, Q(0))} ${OP_TEX[s.op]} ${s.collected.toTex()}`;
    const divideText = s.coef.eq(1) ? 'The $x$ is already by itself.' : `Divide both sides by $${s.coef.toTex()}$.${flips ? ' Dividing by a **negative** number reverses the order, so **flip the symbol**.' : ' It is positive, so the symbol stays the same.'}`;
    const firstStep =
      s.kind === 'one-step-add' || s.kind === 'one-step-mul'
        ? null
        : s.kind === 'two-step'
          ? 'Undo the constant term: add or subtract it on both sides.'
          : s.kind === 'both-sides'
            ? 'Collect the $x$ terms on the left and the numbers on the right.'
            : 'Distribute first, then undo the constant term.';
    const solution = [
      ...(firstStep ? [{ text: firstStep, tex: collectedTex, why: 'Adding or subtracting the same amount on both sides never changes the direction of an inequality.' }] : []),
      ...(s.kind === 'one-step-add'
        ? [{ text: `${addOrSub(s)} on both sides.`, tex: ineqTex('x', s.solOp, s.k), why: 'Adding or subtracting the same number on both sides keeps the inequality true and in the same direction.' }]
        : [{ text: divideText, tex: ineqTex('x', s.solOp, s.k), why: flips ? 'Multiplying or dividing by a negative reverses the order of numbers: $2 < 5$ but $-2 > -5$. Flipping the symbol keeps the statement true.' : 'Dividing by a positive number keeps numbers in the same order.' }]),
      {
        text: `Check with a number from your solution, $x = ${checkValue(s).toTex()}$.`,
        tex: checkTex(orig, s.op, checkValue(s)),
        why: `Substituting a value that satisfies $${ineqTex('x', s.solOp, s.k)}$ into the original inequality gives a true statement, and a value on the other side of $${s.k.toTex()}$ gives a false one.`,
      },
    ];
    const misconceptions = stringMisconceptions(answer, [
      ...(flips ? [{ answer: ineqPlain('x', s.op, s.k), tag: 'inequality-direction' as const, feedback: `You divided by $${s.coef.toTex()}$, a negative number. That reverses the order, so the inequality symbol must flip.` }] : []),
      ...(!flips && !s.coef.eq(1) ? [{ answer: ineqPlain('x', FLIP_OP[s.op], s.k), tag: 'inequality-direction' as const, feedback: `You only flip the symbol when you multiply or divide by a **negative** number. $${s.coef.toTex()}$ is positive.` }] : []),
      ...(s.kind === 'one-step-add' ? [{ answer: ineqPlain('x', s.solOp, s.k.add(texValue(s.rhs).sub(s.k).mul(Q(2)))), tag: 'inverse-operation' as const, feedback: 'Undo the constant with the **opposite** operation: if a number is added to $x$, subtract it from both sides; if it is subtracted, add it.' }] : []),
      { answer: ineqPlain('x', s.solOp, s.k.neg()), tag: 'sign-error' as const, feedback: 'Check the sign of your boundary number. Substitute it into the original inequality: both sides should be equal there.' },
    ]);
    const steps: ProblemStep[] | undefined = firstStep
      ? [
          {
            prompt: [p(`Solve $${orig}$. ${firstStep} What inequality do you get, with only an $x$ term on the left?`)],
            answer: { kind: 'inequality', value: `${numStr(s.coef)}x ${s.op} ${numStr(s.collected)}` },
            hints: [
              'Adding or subtracting on both sides does **not** change the symbol.',
              s.kind === 'distribute' ? `Multiply $${s.lhs.split('(')[0] || '1'}$ by each term inside the parentheses first.` : 'Move every $x$ term to the left and every number to the right.',
              `You should end with something like $${s.coef.isNegative() ? '-' : ''}ax ${OP_TEX[s.op]} c$.`,
              `The $x$ term is $${linearTex(s.coef, Q(0))}$. Work out the number on the right.`,
            ],
            explanation: `$${collectedTex}$. The symbol has not changed yet.`,
          },
          {
            prompt: [p(`Now solve $${collectedTex}$ for $x$.`)],
            answer: { kind: 'inequality', value: answer, form: 'solved' },
            hints: [
              `Divide both sides by $${s.coef.toTex()}$.`,
              flips ? 'You are dividing by a negative number. What happens to the symbol?' : 'You are dividing by a positive number, so the symbol stays the same.',
              `Work out $${s.collected.toTex()} \\div ${s.coef.isNegative() ? `(${s.coef.toTex()})` : s.coef.toTex()}$.`,
              flips ? 'Flip the symbol: $<$ becomes $>$ and $\\le$ becomes $\\ge$, and the other way around.' : 'Keep the same symbol.',
            ],
            misconceptions: flips ? [{ answer: ineqPlain('x', s.op, s.k), tag: 'inequality-direction', feedback: 'Dividing by a negative number flips the symbol.' }] : [],
            explanation: `$${ineqTex('x', s.solOp, s.k)}$.`,
          },
        ]
      : oneStepSteps(s, orig, answer);
    return makeProblem({
      skillId: 'S2.01',
      tags: difficulty === 3 ? ['multi-step'] : [],
      prompt: [p(`Solve the inequality $${orig}$.`)],
      answer: { kind: 'inequality', value: answer, form: 'solved' },
      inputHint: 'Type an inequality like x >= -3 (or x ≥ -3).',
      hints: [
        'Solve it like an equation, with one extra rule about the symbol.',
        firstStep ? firstStep : s.kind === 'one-step-add' ? 'Undo the addition or subtraction on both sides.' : `Divide both sides by the number multiplying $x$.`,
        flips ? 'At some point you divide by a **negative** number. That flips the inequality symbol.' : 'This time you never multiply or divide by a negative number, so the symbol keeps its direction.',
        s.kind === 'one-step-add'
          ? `${addOrSub(s)} on both sides, then check with a test value.`
          : `After collecting terms you have $${collectedTex}$. Isolate $x$ and check with a test value.`,
      ],
      solution,
      misconceptions,
      steps,
    });
  },
  verify(pr) {
    const text = (pr.prompt[0] as { text: string }).text;
    const m = /^Solve the inequality \$(.+)\$\.$/.exec(text);
    if (!m || pr.answer.kind !== 'inequality') return ['cannot parse prompt'];
    const orig = relTexToPlain(m[1]);
    const ans = pr.answer.value;
    const k = Rational.parse(ans.split(/<=|>=|<|>/)[1].trim());
    const errs: string[] = [];
    // the boundary makes both sides equal
    if (!holds(orig.replace(/<=|>=|<|>/, '='), k)) errs.push('boundary does not make the sides equal');
    if (!sameOneVarSolutions(orig, ans, k)) errs.push('solution set differs from the original inequality');
    if (pr.steps?.length === 3) {
      // one-step forms: re-read a and b from the left side a·x + b, and the number on the right
      const [l, r] = orig.split(/<=|>=|<|>/);
      const L = toPoly(parseExpression(l));
      const b = L.evaluate({ x: Q(0) });
      const a = L.evaluate({ x: Q(1) }).sub(b);
      const c = toPoly(parseExpression(r)).constantValue();
      const num = pr.steps.find((st) => st.answer.kind === 'number');
      if (!num || num.answer.kind !== 'number' || !Rational.parse(num.answer.value).eq(c.sub(b).div(a))) errs.push('boundary step is not (c - b) / a');
      const lab = stepLabel(pr.steps.find((st) => st.answer.kind === 'choice'));
      if (a.eq(Q(1))) {
        if (!new RegExp(`^${b.isNegative() ? 'Add' : 'Subtract'} \\$${b.abs().toTex()}\\$ .*both sides`).test(lab)) errs.push(`operation step "${lab}" does not undo ${b}`);
      } else if (/flips/.test(lab) !== a.isNegative()) errs.push('symbol step disagrees with the sign of the coefficient');
    }
    errs.push(...lastStepErrors(pr));
    return errs;
  },
};

/** Wording of the four symbol-decision options for a one-step multiply problem. */
export const SYMBOL_STAYS = (a: Rational) => `It stays the same, because $${a.toTex()}$ is positive.`;
export const SYMBOL_FLIPS = (a: Rational) => `It flips, because $${a.toTex()}$ is negative.`;
const SYMBOL_FLIPS_RIGHT = (c: Rational) => `It flips, because $${c.toTex()}$ on the right side is negative.`;
const SYMBOL_NEVER = 'It stays the same, because dividing never changes the symbol.';
const SYMBOL_DIVIDED = 'It flips, because you divided both sides.';

/**
 * Guided steps for the one-step forms (difficulty 1): x + b op c and a x op c.
 * Add form: choose the inverse operation, find the new right side, write the solution.
 * Multiply form: find the boundary c / a, decide whether the symbol flips, write the solution.
 */
function oneStepSteps(s: SolveCase, orig: string, answer: string): ProblemStep[] | undefined {
  const c = texValue(s.rhs);
  const solved: ProblemStep = {
    prompt: [p(`Now write the solution of $${orig}$ with $x$ alone on the left.`)],
    answer: { kind: 'inequality', value: answer, form: 'solved' },
    inputHint: 'Type an inequality like x >= -3 (or x ≥ -3).',
    hints: [
      'The boundary number goes on the right and $x$ on the left.',
      s.kind === 'one-step-add' ? 'Adding or subtracting the same number on both sides never changes the symbol.' : 'Use the symbol you decided on in the last step.',
      'Check with a test value: a number that fits your answer should make the original inequality true.',
      `Write $x$, then the symbol, then the number $${s.k.toTex()}$.`,
    ],
    misconceptions: stringMisconceptions(answer, [
      { answer: ineqPlain('x', FLIP_OP[s.solOp], s.k), tag: 'inequality-direction', feedback: s.kind === 'one-step-add' || !s.coef.isNegative() ? 'The symbol only flips when you multiply or divide by a **negative** number. Here it keeps its direction.' : 'You divided by a negative number, so the symbol must flip.' },
      { answer: ineqPlain('x', TOGGLE_STRICT[s.solOp], s.k), tag: 'inequality-direction', feedback: 'Keep the "or equal to" part exactly as it was. Solving never adds or removes it.' },
    ]),
    explanation: `$${ineqTex('x', s.solOp, s.k)}$: ${s.coef.isNegative() ? 'the symbol flipped because you divided by a negative number' : 'the symbol kept its direction'}.`,
  };
  if (s.kind === 'one-step-add') {
    const b = c.sub(s.k); // the left side is x + b
    const sub = !b.isNegative();
    const right = `${sub ? 'Subtract' : 'Add'} $${b.abs().toTex()}$ ${sub ? 'from' : 'to'} both sides.`;
    const wrong = `${sub ? 'Add' : 'Subtract'} $${b.abs().toTex()}$ ${sub ? 'to' : 'from'} both sides.`;
    const left = `${sub ? 'Subtract' : 'Add'} $${b.abs().toTex()}$ on the left side only.`;
    const opAns = stepChoice(right, [wrong, left], c.toNumber() + b.toNumber());
    return [
      {
        prompt: [p(`To get $x$ alone in $${orig}$, what should you do?`)],
        answer: opAns,
        hints: [
          'Undo what is being done to $x$ by using the **opposite** operation.',
          `On the left, $${b.abs().toTex()}$ is ${sub ? 'added to' : 'subtracted from'} $x$.`,
          'Whatever you do to one side, do to the other side too, so the two sides stay balanced.',
          `The opposite of ${sub ? 'adding' : 'subtracting'} is ${sub ? 'subtracting' : 'adding'}.`,
        ],
        misconceptions: [
          { answer: idOf(opAns, wrong), tag: 'inverse-operation', feedback: `That would make the left side $x ${sub ? '+' : '-'} ${b.abs().mul(Q(2)).toTex()}$. Use the **opposite** operation to undo it.` },
          { answer: idOf(opAns, left), tag: 'inverse-operation', feedback: 'Changing only one side breaks the balance. Do the same thing to **both** sides.' },
        ],
        explanation: `${right.replace(/\.$/, '')}: the opposite operation leaves $x$ by itself and keeps the inequality true.`,
      },
      {
        prompt: [p(`${right} What number is on the right side now?`)],
        answer: { kind: 'number', value: numStr(s.k) },
        hints: [
          `The right side starts as $${c.toTex()}$.`,
          `${sub ? 'Subtract' : 'Add'} $${b.abs().toTex()}$ ${sub ? 'from' : 'to'} it.`,
          'Use a number line if the signs are tricky.',
          `Start at $${c.toTex()}$ and move $${b.abs().toTex()}$ to the ${sub ? 'left' : 'right'}.`,
        ],
        misconceptions: numberMisconceptions(s.k, [
          { value: c.add(b), tag: 'inverse-operation', feedback: `You ${sub ? 'added' : 'subtracted'}. Undo the ${sub ? 'addition' : 'subtraction'} with the opposite operation.` },
          { value: s.k.neg(), tag: 'sign-error', feedback: 'Check the sign of your result with a number line.' },
        ]),
        explanation: `$${c.toTex()} ${sub ? '-' : '+'} ${b.abs().toTex()} = ${s.k.toTex()}$.`,
      },
      solved,
    ];
  }
  if (s.kind === 'one-step-mul') {
    const a = s.coef;
    const flips = a.isNegative();
    const correct = flips ? SYMBOL_FLIPS(a) : SYMBOL_STAYS(a);
    const distract = flips
      ? [SYMBOL_NEVER, `It stays the same, because $${c.toTex()}$ on the right side is ${c.isNegative() ? 'negative' : 'positive'}.`]
      : [SYMBOL_DIVIDED, ...(c.isNegative() ? [SYMBOL_FLIPS_RIGHT(c)] : [])];
    const symAns = stepChoice(correct, distract, a.toNumber() * 7 + c.toNumber());
    return [
      {
        prompt: [p(`To get $x$ alone in $${orig}$, divide both sides by $${a.toTex()}$. What is $${c.toTex()} \\div ${a.isNegative() ? `(${a.toTex()})` : a.toTex()}$?`)],
        answer: { kind: 'number', value: numStr(s.k) },
        hints: [
          `$${linearTex(a, Q(0))}$ means $${a.toTex()}$ times $x$, so dividing by $${a.toTex()}$ undoes it.`,
          'Divide the numbers first, then decide the sign.',
          'Same signs give a positive quotient; different signs give a negative quotient.',
          `Think: $${a.toTex()}$ times what number gives $${c.toTex()}$?`,
        ],
        misconceptions: numberMisconceptions(s.k, [
          { value: s.k.neg(), tag: 'sign-error', feedback: 'Check the sign: same signs give a positive answer, different signs give a negative answer.' },
          { value: c.sub(a), tag: 'inverse-operation', feedback: `$${linearTex(a, Q(0))}$ is a multiplication, so undo it by **dividing**, not subtracting.` },
        ]),
        explanation: `$${c.toTex()} \\div ${a.isNegative() ? `(${a.toTex()})` : a.toTex()} = ${s.k.toTex()}$, so the boundary is $${s.k.toTex()}$.`,
      },
      {
        prompt: [p(`You divided both sides of $${orig}$ by $${a.toTex()}$. What happens to the inequality symbol?`)],
        answer: symAns,
        hints: [
          'Only one move ever flips an inequality symbol.',
          'Multiplying or dividing both sides by a **negative** number reverses the order of numbers: $2 < 5$ but $-2 > -5$.',
          'The sign of the number on the right side does not matter. Only the number you divide by does.',
          `Is $${a.toTex()}$ positive or negative?`,
        ],
        misconceptions: symAns.options
          .filter((o) => o.id !== symAns.correct)
          .map((o) => ({
            answer: o.id,
            tag: 'inequality-direction' as const,
            feedback: o.label === SYMBOL_NEVER ? 'Dividing by a **negative** number does change the symbol, because it reverses the order of numbers.' : o.label === SYMBOL_DIVIDED ? 'Dividing by a **positive** number keeps numbers in the same order, so the symbol does not flip.' : /right/.test(o.label) ? 'The number on the right side does not decide a flip. Only dividing (or multiplying) by a negative number does.' : `Look again at the number you divided by, $${a.toTex()}$.`,
          })),
        explanation: flips ? `$${a.toTex()}$ is negative, so the symbol flips: $${OP_TEX[s.op]}$ becomes $${OP_TEX[s.solOp]}$.` : `$${a.toTex()}$ is positive, so the symbol keeps its direction.`,
      },
      solved,
    ];
  }
  return undefined;
}

function addOrSub(s: SolveCase): string {
  // one-step-add: the left side is x + b and the right side is k + b
  const b = texValue(s.rhs).sub(s.k);
  return b.isNegative() ? `Add $${b.abs().toTex()}$` : `Subtract $${b.toTex()}$`;
}

/** "left = 40 \le 45 = right" style check line. */
function checkTex(origTex: string, op: Op, t: Rational): string {
  const [l, r] = relTexToPlain(origTex).split(/<=|>=|<|>/);
  const at = (e: string) => toPoly(parseExpression(e)).evaluate({ x: t });
  return `\\text{left side} = ${at(l).toTex()},\\ \\text{right side} = ${at(r).toTex()}:\\ ${at(l).toTex()} ${OP_TEX[op]} ${at(r).toTex()} \\checkmark`;
}

/** A value in the solution set, for the check step. */
function checkValue(s: SolveCase): Rational {
  const below = s.k.isInteger() ? s.k.sub(Q(1)) : Q(s.k.floor());
  return isGreater(s.solOp) ? below.add(Q(2)) : below;
}

// ---------------------------------------------------------------------------
// S2.01: number line graphs
// ---------------------------------------------------------------------------

function describe(k: Rational, op: Op): string {
  return `${isStrict(op) ? 'Open' : 'Closed'} circle at $${k.toTex()}$, shaded to the ${isGreater(op) ? 'right' : 'left'}`;
}

function allDescriptions(k: Rational, op: Op): { correct: string; distractors: string[] } {
  return {
    correct: describe(k, op),
    distractors: [describe(k, TOGGLE_STRICT[op]), describe(k, FLIP_OP[op]), describe(k, FLIP_OP[TOGGLE_STRICT[op]])],
  };
}

function numberLineBlock(k: number, op: Op): Block {
  const lo = k - 6;
  const hi = k + 6;
  return {
    t: 'numberline',
    spec: {
      min: lo,
      max: hi,
      rays: [{ from: k, closed: !isStrict(op), dir: isGreater(op) ? 'right' : 'left' }],
      ariaLabel: `Number line from ${lo} to ${hi} with ${isStrict(op) ? 'an open' : 'a closed'} circle at ${k} and the line shaded to the ${isGreater(op) ? 'right' : 'left'}.`,
    },
  };
}

const circleLabel = (k: number, closed: boolean, included: boolean) =>
  `${closed ? 'Closed' : 'Open'} circle: $${k}$ ${included ? '**is**' : 'is **not**'} a solution, so the symbol is ${included ? '$\\le$ or $\\ge$' : '$<$ or $>$'}.`;
const sideLabel = (k: number, greater: boolean) => `Numbers ${greater ? 'greater' : 'less'} than $${k}$`;

/** Guided steps for reading a number line (difficulty 1): the circle, the shading, then the inequality. */
function numberLineSteps(k: number, op: Op, answer: string): ProblemStep[] {
  const closed = !isStrict(op);
  const greater = isGreater(op);
  const circle = stepChoice(circleLabel(k, closed, closed), [circleLabel(k, !closed, !closed), circleLabel(k, closed, !closed), circleLabel(k, !closed, closed)], k + 9);
  const side = stepChoice(sideLabel(k, greater), [sideLabel(k, !greater)], k + (closed ? 1 : 0));
  return [
    {
      prompt: [p(`Look at the circle at $${k}$. Is it open or closed, and what does that tell you?`)],
      answer: circle,
      hints: [
        'The circle marks the boundary number. Its style tells you whether the boundary itself is a solution.',
        'A filled-in circle is **closed**. An empty circle is **open**.',
        'Closed means the boundary is included ($\\le$ or $\\ge$). Open means it is left out ($<$ or $>$).',
        'First decide whether the circle is filled in, then match it with its meaning.',
      ],
      misconceptions: circle.options
        .filter((o) => o.id !== circle.correct)
        .map((o) => ({
          answer: o.id,
          tag: 'graph-reading' as const,
          feedback: o.label.startsWith(closed ? 'Closed' : 'Open')
            ? `You read the circle correctly, but ${closed ? 'a closed circle **includes** the boundary' : 'an open circle **leaves out** the boundary'}.`
            : `Look again: this circle is ${closed ? 'filled in, so it is closed' : 'empty, so it is open'}.`,
        })),
      explanation: closed ? `The circle is closed, so $${k}$ is a solution and the symbol has "or equal to".` : `The circle is open, so $${k}$ is not a solution and the symbol is strict.`,
    },
    {
      prompt: [p(`The shading goes to the **${greater ? 'right' : 'left'}** of $${k}$. Which numbers are solutions?`)],
      answer: side,
      hints: [
        'The shaded part of the line shows every solution.',
        'On a number line, numbers get larger as you move to the right.',
        'Pick a number in the shaded part and compare it with the boundary.',
        `Is $${greater ? k + 2 : k - 2}$, a shaded number, bigger or smaller than $${k}$?`,
      ],
      misconceptions: [{ answer: side.options.find((o) => o.id !== side.correct)!.id, tag: 'graph-reading', feedback: 'Numbers get larger to the right on a number line and smaller to the left.' }],
      explanation: `Shading to the ${greater ? 'right' : 'left'} means the solutions are ${greater ? 'greater' : 'less'} than $${k}$.`,
    },
    {
      prompt: [p('Now write the inequality in $x$ shown by the number line.')],
      answer: { kind: 'inequality', value: answer, form: 'solved' },
      inputHint: 'Type an inequality like x < 4 or x >= -2.',
      hints: [
        'Put $x$ on the left and the boundary number on the right.',
        `${greater ? 'Greater' : 'Less'} than means the symbol points ${greater ? 'away from' : 'toward'} $x$: $x ${greater ? '>' : '<'} \\ldots$`,
        `${closed ? 'A closed circle adds "or equal to".' : 'An open circle means no "or equal to".'}`,
        'Combine the direction and the circle type into one symbol.',
      ],
      misconceptions: stringMisconceptions(answer, [
        { answer: ineqPlain('x', TOGGLE_STRICT[op], Q(k)), tag: 'graph-reading', feedback: closed ? 'The circle is closed, so the boundary counts: use a symbol with "or equal to".' : 'The circle is open, so the boundary does not count: leave out "or equal to".' },
        { answer: ineqPlain('x', FLIP_OP[op], Q(k)), tag: 'inequality-direction', feedback: `The shading goes to the ${greater ? 'right' : 'left'}, toward ${greater ? 'larger' : 'smaller'} numbers.` },
      ]),
      explanation: `$${ineqTex('x', op, Q(k))}$.`,
    },
  ];
}

export const genIneqNumberLine: GeneratorDef = {
  id: 'u2.ineq-numberline',
  skillId: 'S2.01',
  description: 'Connect one-variable inequalities and their number-line graphs.',
  generate(rng, difficulty) {
    const op = pickOp(rng);
    const k = rng.int(-8, 8);
    const K = Q(k);
    if (difficulty === 1) {
      const answer = ineqPlain('x', op, K);
      return makeProblem({
        skillId: 'S2.01',
        tags: ['graph'],
        prompt: [p('Write the inequality in $x$ shown by this number line.'), numberLineBlock(k, op)],
        answer: { kind: 'inequality', value: answer, form: 'solved' },
        inputHint: 'Type an inequality like x < 4 or x >= -2.',
        hints: [
          'The circle marks the boundary number. The shaded part shows every solution.',
          'Shading to the right means greater than. Shading to the left means less than.',
          'An open circle means the boundary is **not** included ($<$ or $>$). A closed (filled) circle means it **is** included ($\\le$ or $\\ge$).',
          `The boundary is at $${k}$. Decide the direction and whether the circle is filled.`,
        ],
        solution: [
          { text: `Find the boundary: the circle is at $${k}$.`, why: 'The boundary number is where the solutions start.' },
          { text: `The circle is ${isStrict(op) ? 'open' : 'closed'}, so $${k}$ is ${isStrict(op) ? 'not ' : ''}a solution.`, why: isStrict(op) ? 'An open circle leaves the point out: use $<$ or $>$.' : 'A filled circle includes the point: use $\\le$ or $\\ge$.' },
          { text: `The shading goes to the ${isGreater(op) ? 'right' : 'left'}, toward ${isGreater(op) ? 'larger' : 'smaller'} numbers.`, tex: ineqTex('x', op, K), why: 'Numbers get larger to the right on a number line.' },
        ],
        misconceptions: stringMisconceptions(answer, [{ answer: ineqPlain('x', op, K.neg()), tag: 'graph-reading', feedback: 'Read the boundary number again; check its sign.' }]),
        steps: numberLineSteps(k, op, answer),
      });
    }
    let promptTex: string;
    let solveSteps: Array<{ text: string; tex?: string; why?: string }> = [];
    if (difficulty === 2) {
      // sometimes written with the number first, e.g. 4 > x
      if (rng.bool()) {
        promptTex = `${K.toTex()} ${OP_TEX[FLIP_OP[op]]} x`;
        solveSteps = [{ text: 'Read it with $x$ first.', tex: ineqTex('x', op, K), why: `"$${K.toTex()} ${OP_TEX[FLIP_OP[op]]} x$" and "$${ineqTex('x', op, K)}$" say the same thing; the symbol still points at the smaller side.` }];
      } else promptTex = ineqTex('x', op, K);
    } else {
      let m = Q(rng.nonzeroInt(2, 6));
      if (rng.next() < 0.7) m = m.neg();
      const b = Q(rng.nonzeroInt(-9, 9));
      const rawOp = m.isNegative() ? FLIP_OP[op] : op;
      promptTex = `${linearTex(m, b)} ${OP_TEX[rawOp]} ${m.mul(K).add(b).toTex()}`;
      solveSteps = [
        { text: `Undo the constant: ${b.isNegative() ? 'add' : 'subtract'} $${b.abs().toTex()}$ on both sides.`, tex: `${linearTex(m, Q(0))} ${OP_TEX[rawOp]} ${m.mul(K).toTex()}`, why: 'Adding or subtracting keeps the symbol the same.' },
        { text: `Divide by $${m.toTex()}$.${m.isNegative() ? ' It is negative, so flip the symbol.' : ''}`, tex: ineqTex('x', op, K), why: m.isNegative() ? 'Dividing by a negative reverses the order of numbers.' : 'Dividing by a positive keeps the order.' },
      ];
    }
    const { correct, distractors } = allDescriptions(K, op);
    const answer = makeChoice(rng, correct, distractors);
    return makeProblem({
      skillId: 'S2.01',
      tags: ['graph'],
      prompt: [p(`Which number-line graph shows the solutions of $${promptTex}$?`)],
      answer,
      hints: [
        difficulty === 3 ? 'Solve for $x$ first, the same way you would solve an equation. Watch for dividing by a negative.' : 'First decide which numbers are solutions: numbers bigger or smaller than the boundary?',
        'Use an open circle for $<$ or $>$ and a closed circle for $\\le$ or $\\ge$.',
        'Shade toward the solutions. Test a number: if it makes the inequality true, shade on its side.',
        `The boundary is $${K.toTex()}$. Test $x = ${k + 1}$: is it a solution?`,
      ],
      solution: [
        ...solveSteps,
        { text: `The boundary is $${K.toTex()}$. ${isStrict(op) ? 'It is not included, so use an open circle.' : 'It is included, so use a closed circle.'}`, why: isStrict(op) ? '$<$ and $>$ do not include the boundary.' : '$\\le$ and $\\ge$ include the boundary.' },
        { text: `Test $x = ${k + 1}$: it ${isGreater(op) ? 'is' : 'is not'} a solution, so shade to the ${isGreater(op) ? 'right' : 'left'}.`, why: 'The shaded side is the side whose numbers make the inequality true.' },
      ],
      misconceptions: [],
    });
  },
  verify(pr) {
    const errs: string[] = [];
    if (pr.answer.kind === 'inequality') {
      const nl = pr.prompt.find((b) => b.t === 'numberline');
      if (!nl || nl.t !== 'numberline') return ['no number line'];
      const ray = nl.spec.rays![0];
      // the graph's solution set, probed directly from the picture
      const inGraph = (t: Rational) => (t.eq(Q(ray.from)) ? ray.closed : ray.dir === 'right' ? t.gt(Q(ray.from)) : t.lt(Q(ray.from)));
      for (const d of [0, 0.5, 1, 7, -0.5, -1, -7]) {
        const t = Q(ray.from).add(Q(d * 2, 2));
        if (inGraph(t) !== holds(pr.answer.value, t)) errs.push(`graph and answer disagree at ${t}`);
      }
      if (pr.steps) {
        // the circle step and the shading step, read against the picture
        const circle = stepLabel(pr.steps[0]);
        if (circle.startsWith('Closed') !== ray.closed || /is \*\*not\*\*/.test(circle) === ray.closed) errs.push('circle step disagrees with the graph');
        if (/greater/.test(stepLabel(pr.steps[1])) !== (ray.dir === 'right')) errs.push('shading step disagrees with the graph');
        errs.push(...lastStepErrors(pr));
      }
      return errs;
    }
    if (pr.answer.kind !== 'choice') return ['unexpected answer kind'];
    const text = (pr.prompt[0] as { text: string }).text;
    const m = /solutions of \$(.+)\$\?$/.exec(text);
    if (!m) return ['cannot parse prompt'];
    const rel = relTexToPlain(m[1]);
    const lab = /^(Open|Closed) circle at \$(-?\d+)\$, shaded to the (left|right)$/.exec(choiceLabel(pr.answer));
    if (!lab) return ['cannot parse label'];
    const k = Q(Number(lab[2]));
    if (holds(rel, k) !== (lab[1] === 'Closed')) errs.push('circle type wrong');
    if (holds(rel, k.add(Q(3))) !== (lab[3] === 'right')) errs.push('shading direction wrong');
    if (holds(rel, k.sub(Q(3))) !== (lab[3] === 'left')) errs.push('shading direction wrong (left)');
    // every distractor must describe a different set
    if (pr.answer.options.length !== 4) errs.push('needs 4 options');
    return errs;
  },
};

export const U2_ONE_VAR_GENERATORS: GeneratorDef[] = [genSolveIneq, genIneqNumberLine];
