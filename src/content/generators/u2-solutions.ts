/**
 * Unit 2, Lesson 3 generators: solutions and constraints (S2.04).
 * Test points in an inequality, and decide what is possible in a situation.
 */
import type { GeneratorDef, Rng, Difficulty, SolutionStep } from '../../core/curriculum/types';
import { Rational } from '../../core/math/rational';
import { linearTex, linearPlain } from '../../core/math/format';
import { toPoly } from '../../core/math/poly';
import { parseExpression } from '../../core/math/parser';
import { Q, p, makeProblem, numStr, money, makeChoice, choiceLabel, numberMisconceptions, decimalOrFraction } from './util';
import { coefTex } from '../../core/math/format';
import { Op, OP_TEX, isStrict, isGreater, relTexToPlain, holds, ptTex } from './u2-common';
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
    return makeProblem({
      skillId: 'S2.04',
      tags: [],
      prompt: [p(`Which point is ${askNot ? '**not** ' : ''}a solution of $${ineq.tex}$?`)],
      answer,
      hints: [
        'A point is a solution when substituting it makes the inequality a **true** statement.',
        'Substitute the $x$-value and the $y$-value of each point, then compare the two sides.',
        'Be careful with negative numbers: put them in parentheses when you substitute.',
        `If a point makes the two sides exactly equal, it is on the boundary line. ${isStrict(ineq.op) ? 'Here the symbol has no "or equal to", so a boundary point is not a solution.' : 'Here the symbol includes "or equal to", so a boundary point is a solution.'}`,
      ],
      solution: [
        ...ordered.map((q) => substitution(ineq.plain, ineq.op, Q(q.x), Q(q.y))),
        { text: `So ${ptTex(correct.x, correct.y)} is the point that is ${askNot ? 'not ' : ''}a solution.`, why: askNot ? 'It is the only one that makes the inequality false.' : 'It is the only one that makes the inequality true.' },
      ],
      misconceptions: [],
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
    return errs;
  },
};

// ---------------------------------------------------------------------------
// S2.04: possible or not possible in context
// ---------------------------------------------------------------------------

const verdict = (ok: boolean) => (ok ? 'Yes' : 'No');

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
    if (c.reason === 'fraction' || c.reason === 'negative') {
      const why = c.reason === 'fraction' ? `there cannot be $${D(c.x)}$ ${ctx.xNoun}; it has to be a whole number` : `there cannot be a negative number of ${ctx.yNoun}`;
      correct = `No. It makes the inequality true, but ${why}.`;
      distractors = [`Yes. ${sub}, and ${cmp(tot)}, so it works.`, `No. ${sub}, so it makes the inequality false.`, 'Yes. Every point that makes the inequality true is possible.'];
    } else {
      correct = `${verdict(ok)}. ${sub}, and ${cmp(tot)}.`;
      distractors = [`${verdict(!ok)}. ${sub}, and ${cmp(tot)}.`];
      if (!swappedTot.eq(tot)) distractors.push(`${verdict(holds(rel, c.y, c.x))}. ${swapped}, and ${cmp(swappedTot)}.`, `${verdict(!holds(rel, c.y, c.x))}. ${swapped}, and ${cmp(swappedTot)}.`);
      else distractors.push(`${verdict(!ok)}. Only whole numbers can be tested.`, `${verdict(ok)}. The total does not matter here.`);
    }
    const qText = `Is it possible to have ${countOf(ctx, 'x', decimalOrFraction(c.x))} and ${countOf(ctx, 'y', decimalOrFraction(c.y))}?`;
    return makeProblem({
      skillId: 'S2.04',
      tags: ['real-world', 'word'],
      prompt: [setup, p(qText)],
      answer: makeChoice(rng, correct, distractors),
      hints: [
        'Two questions: does the combination make sense in real life, and does it make the inequality true?',
        `Substitute $x = ${decimalOrFraction(c.x)}$ and $y = ${decimalOrFraction(c.y)}$: ${ctx.xNoun} go with ${money(a)} and ${ctx.yNoun} with ${money(b)}.`,
        `Compare the total with ${money(t)} using $${OP_TEX[op]}$.`,
        ctx.key === 'jobs' ? 'Hours worked cannot be negative, even when the numbers fit.' : 'Counts of things like tickets or items cannot be negative or fractions, even when the numbers fit.',
      ],
      solution: [
        { text: 'Check that the numbers make sense.', why: c.reason === 'fraction' ? `$${decimalOrFraction(c.x)}$ is not a whole number, so it cannot be a count of ${ctx.xNoun}.` : c.reason === 'negative' ? `$${c.y.toTex()}$ is negative, and a count cannot be negative.` : 'Both are whole numbers, so they could happen.' },
        { text: 'Substitute into the inequality.', tex: `${a.toTex()}(${decimalOrFraction(c.x)}) + ${b.toTex()}(${decimalOrFraction(c.y)}) = ${decimalOrFraction(tot)}`, why: `Then compare: is $${decimalOrFraction(tot)} ${OP_TEX[op]} ${t.toTex()}$? It is ${TRUTH_WORD(holds(rel, c.x, c.y))}.` },
        { text: `So the answer is: ${correct}`, why: c.reason === 'fraction' || c.reason === 'negative' ? 'A solution of the inequality still has to make sense in the situation.' : ok ? 'It is a solution and it makes sense, so it is possible.' : 'It is not a solution, so it is not possible.' },
      ],
      misconceptions: [],
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
