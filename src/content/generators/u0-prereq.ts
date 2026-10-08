/**
 * Prerequisite (Grade 6-8) generators P.* used by the diagnostic placement check and by remediation.
 *
 * Each generator has several problem shapes per difficulty (1 = basic, 2 = typical Grade 7-8 item,
 * 3 = the hardest typical Grade 8 item: negatives with fractions, distribution on both sides, flipping
 * an inequality, and so on). Answers are typed (numbers, expressions, inequalities, points, solution
 * lists) so a diagnostic item cannot be guessed; only the quadrant question is multiple choice.
 *
 * verify() never trusts the generator's arithmetic: it reads the numbers back out of the prompt
 * (or the graph / table block) and re-derives the key another way. Numeric expressions are
 * evaluated by the expression parser, equations and inequalities are checked by substituting the
 * key back in, percents are checked by running the relationship backwards, slopes from the points
 * actually shown, and coordinates from the plotted points.
 */
import type { GeneratorDef, Rng, Difficulty, Block, Problem, SolutionStep, GraphSpec } from '../../core/curriculum/types';
import type { AnswerSpec, Misconception, MisconceptionTag } from '../../core/math/answers';
import { exactValue, parseRelation, isExpandedForm } from '../../core/math/answers';
import { Rational } from '../../core/math/rational';
import { linearTex, linearPlain, plusTex } from '../../core/math/format';
import { toPoly } from '../../core/math/poly';
import { parseExpression } from '../../core/math/parser';
import { p, makeProblem, choiceLabel, numStr, Q, numberMisconceptions, stringMisconceptions, money } from './util';
import { Op, OP_TEX, FLIP_OP, sameOneVarSolutions, holds } from './u2-common';

// ---------------------------------------------------------------------------
// Shared building blocks
// ---------------------------------------------------------------------------

type Hints = [string, string, string, string];
type MC = { value: Rational | null; tag: MisconceptionTag; feedback: string };
interface Built {
  prompt: Block[];
  answer: AnswerSpec;
  hints: Hints;
  solution: SolutionStep[];
  mis?: Misconception[];
  tags?: Problem['tags'];
  inputHint?: string;
}
type Shape = (rng: Rng) => Built;

function makeGen(id: string, skillId: string, description: string, shapes: Record<Difficulty, Shape[]>, check: (pr: Problem) => string[]): GeneratorDef {
  return {
    id,
    skillId,
    description,
    generate(rng, difficulty) {
      const b = rng.pick(shapes[difficulty])(rng);
      return makeProblem({ skillId, tags: b.tags ?? [], prompt: b.prompt, answer: b.answer, inputHint: b.inputHint, hints: b.hints, solution: b.solution, misconceptions: b.mis ?? [] });
    },
    verify(pr) {
      try {
        return check(pr);
      } catch (e) {
        return ['verify could not re-read the problem: ' + (e as Error).message];
      }
    },
  };
}

const R = (n: number, d?: number) => Q(n, d);
/** Integer for display inside an expression: negatives in parentheses. */
const pi = (n: number) => (n < 0 ? `(${n})` : `${n}`);
/** Rational for display inside an expression: negatives in parentheses. */
const pq = (r: Rational) => (r.isNegative() ? `\\left(${r.toTex()}\\right)` : r.toTex());
/** Exact key: integers as integers, everything else as a fraction (the checker also accepts an equal decimal). */
const numAns = (r: Rational): AnswerSpec => ({ kind: 'number', value: r.toString() });
/** Key written as a decimal, for items that are about decimals (percent conversions, roots of decimals). */
const decAns = (r: Rational): AnswerSpec => ({ kind: 'number', value: numStr(r) });
const mis = (key: Rational, list: MC[]) => numberMisconceptions(key, list);
const gcdN = (a: number, b: number): number => (b === 0 ? Math.abs(a) : gcdN(b, a % b));
const lcmN = (a: number, b: number) => Math.abs(a * b) / gcdN(a, b);
const sgnWord = (n: number) => (n > 0 ? 'positive' : 'negative');
/** "1 unit", "3 units": a count with its noun, singular when the count is 1. */
const plural = (n: number, noun: string) => `${n} ${noun}${Math.abs(n) === 1 ? '' : 's'}`;

const INT_INPUT = 'Type an integer, like -12.';
const NUM_INPUT = 'Type a number. Use a fraction like -7/4 when the answer is not a whole number.';
const FRAC_INPUT = 'Type a fraction like 7/12 or -5/3 (a whole number or mixed number like 2 1/4 is fine too).';

/** Generator TeX to parser syntax: mixed numbers, nested \frac, roots, \div, brackets and exponent braces. */
export function texPlain(tex: string): string {
  let s = tex.replace(/\\left|\\right/g, '').replace(/\\dfrac|\\tfrac/g, '\\frac');
  s = s.replace(/\^\{([^{}]*)\}/g, '^($1)');
  s = s.replace(/(\d+)\\frac\{(\d+)\}\{(\d+)\}/g, '($1+$2/$3)');
  let prev = '';
  while (prev !== s) {
    prev = s;
    s = s.replace(/\\frac\{([^{}]*)\}\{([^{}]*)\}/g, '(($1)/($2))');
  }
  prev = '';
  while (prev !== s) {
    prev = s;
    s = s.replace(/\\sqrt\[3\]\{([^{}]*)\}/g, 'cbrt($1)').replace(/\\sqrt\{([^{}]*)\}/g, 'sqrt($1)');
  }
  return s
    .replace(/\\cdot|\\times/g, '*')
    .replace(/\\div/g, '/')
    .replace(/\[/g, '(')
    .replace(/\]/g, ')')
    .replace(/\\,|\\;|\\ /g, '')
    .replace(/[{}]/g, '');
}

/** Exact rational value of a constant expression written in generator TeX. */
function texVal(tex: string): Rational {
  const v = exactValue(texPlain(tex));
  if (!v || !v.isRational()) throw new Error('not a rational constant: ' + tex);
  return v.rationalPart();
}

const firstText = (pr: Problem) => (pr.prompt[0]?.t === 'p' ? pr.prompt[0].text : '');
const allText = (pr: Problem) => pr.prompt.map((b) => (b.t === 'p' ? b.text : '')).join(' ');
function keyOf(pr: Problem): Rational {
  if (pr.answer.kind !== 'number') throw new Error('expected a number answer');
  const v = exactValue(pr.answer.value);
  if (!v || !v.isRational()) throw new Error('key is not a rational number');
  return v.rationalPart();
}
const same = (key: Rational, want: Rational, what: string): string[] => (key.eq(want) ? [] : [`${what}: key is ${key.toString()} but re-derived ${want.toString()}`]);
const moneyNums = (text: string) => [...text.matchAll(/\\\$(\d+(?:\.\d+)?)/g)].map((m) => Q(m[1]));

/** "Evaluate $...$." shapes are re-evaluated by the expression parser. */
const evalPrompt = (tex: string): Block[] => [p(`Evaluate $${tex}$.`)];
function verifyEvaluate(pr: Problem): string[] | null {
  const m = /^Evaluate \$([^$]+)\$\.$/.exec(firstText(pr));
  if (!m) return null;
  return same(keyOf(pr), texVal(m[1]), 'expression value');
}

/** Coefficient-and-variable terms, e.g. [[3,'x'],[-2,'y'],[5,'']], as plain text and TeX. */
function termsOut(terms: Array<[Rational, string]>, tex: boolean): string {
  const ts = terms.filter(([c]) => !c.isZero());
  if (!ts.length) return '0';
  return ts
    .map(([c, v], i) => {
      const a = c.abs();
      const coef = tex ? a.toTex() : a.isInteger() ? a.toString() : `(${a.toString()})`;
      const body = v ? (a.eq(1) ? v : coef + v) : tex ? a.toTex() : a.toString();
      return i === 0 ? (c.isNegative() ? '-' : '') + body : (c.isNegative() ? ' - ' : ' + ') + body;
    })
    .join('');
}

/** A proper fraction a/b in lowest terms with b from the list. */
function properFrac(rng: Rng, dens: number[]): Rational {
  const b = rng.pick(dens);
  let a = rng.int(1, b - 1);
  while (gcdN(a, b) !== 1) a = rng.int(1, b - 1);
  return R(a, b);
}
/** Mixed-number TeX for a non-integer rational, e.g. 2\frac{1}{3} or -1\frac{3}{4}. */
function mixTex(r: Rational): string {
  const a = r.abs();
  const w = a.floor();
  const rest = a.sub(Q(w));
  const body = w === 0n ? rest.toTex() : `${w}\\frac{${rest.num}}{${rest.den}}`;
  return (r.isNegative() ? '-' : '') + body;
}
const fracParts = (r: Rational) => ({ n: Number(r.num), d: Number(r.den) });

// ---------------------------------------------------------------------------
// P.INT: integer operations
// ---------------------------------------------------------------------------

const intAdd: Shape = (rng) => {
  const a = rng.nonzeroInt(-15, 15);
  let bAbs = rng.int(2, 15);
  if (bAbs === Math.abs(a)) bAbs++;
  const b = a > 0 ? -bAbs : bAbs;
  const ans = a + b;
  const big = Math.abs(a) > Math.abs(b) ? a : b;
  const hi = Math.max(Math.abs(a), Math.abs(b));
  const lo = Math.min(Math.abs(a), Math.abs(b));
  const tex = `${a} + ${pi(b)}`;
  return {
    prompt: evalPrompt(tex),
    answer: numAns(R(ans)),
    inputHint: INT_INPUT,
    hints: [
      'On a number line, adding a positive number moves right and adding a negative number moves left.',
      'One number is positive and one is negative, so they partly cancel each other out.',
      `Compare their distances from 0, which are ${hi} and ${lo}. How much bigger is one than the other?`,
      `The answer has the same sign as ${big}, the number farther from 0. Subtract ${lo} from ${hi}, then attach that sign.`,
    ],
    solution: [
      { text: 'The signs are different, so subtract the smaller distance from 0 from the larger one.', tex: `${hi} - ${lo} = ${hi - lo}`, why: 'A positive amount and a negative amount cancel each other out, like gaining and losing points.' },
      { text: `Give the result the sign of $${big}$, the number farther from 0.`, tex: `${tex} = ${ans}`, why: `There is more ${sgnWord(big)} than ${sgnWord(-big)}, so what is left over is ${sgnWord(big)}.` },
    ],
    mis: mis(R(ans), [
      { value: R(Math.sign(ans) * (hi + lo)), tag: 'sign-error', feedback: 'You added the distances from 0. When the signs are different, the numbers partly cancel, so subtract the distances instead.' },
      { value: R(-ans), tag: 'sign-error', feedback: 'Check the sign. The answer takes the sign of the number that is farther from 0.' },
    ]),
  };
};

const intSubBelow: Shape = (rng) => {
  const a = rng.int(1, 9);
  const b = rng.int(a + 2, a + 14);
  const ans = a - b;
  return {
    prompt: evalPrompt(`${a} - ${b}`),
    answer: numAns(R(ans)),
    inputHint: INT_INPUT,
    hints: [
      'Subtracting a positive number means moving left on the number line.',
      `Start at ${a} and move ${b} units to the left. You will pass 0.`,
      `It takes ${plural(a, 'step')} to reach 0. Work out how many of the ${b} steps are still left after that.`,
      `The steps left over take you below 0, so the answer is negative. Its size is ${b} minus ${a}.`,
    ],
    solution: [
      { text: `Moving ${plural(a, 'unit')} left from ${a} reaches 0.`, tex: `${a} - ${a} = 0`, why: 'Subtracting takes you left on the number line.' },
      { text: `There are ${plural(b - a, 'more unit')} to move, and they go below 0.`, tex: `${a} - ${b} = ${ans}`, why: `You took away more than you had, so the result is negative: ${b} is bigger than ${a} by ${b - a}.` },
    ],
    mis: mis(R(ans), [{ value: R(b - a), tag: 'sign-error', feedback: 'You subtracted the smaller number from the bigger one. Here you take a bigger number away from a smaller one, so you end up below 0.' }]),
  };
};

const intMulDiv: Shape = (rng) => {
  const x = rng.int(2, 12);
  const y = rng.int(2, 9);
  const negFirst = rng.bool();
  if (rng.bool()) {
    const a = negFirst ? -x : x;
    const b = negFirst ? y : -y;
    const ans = a * b;
    const tex = rng.bool() ? `${a} \\cdot ${pi(b)}` : `(${a})(${b})`;
    return {
      prompt: evalPrompt(tex),
      answer: numAns(R(ans)),
      inputHint: INT_INPUT,
      hints: [
        'Multiply the numbers without their signs first, then decide the sign.',
        'Multiplying is repeated adding: adding a negative amount over and over gives a negative total.',
        'One factor is positive and one is negative. What sign does that give?',
        `Find ${x} times ${y}, then make it negative.`,
      ],
      solution: [
        { text: 'Multiply the sizes of the numbers.', tex: `${x} \\cdot ${y} = ${x * y}`, why: 'The size of a product does not depend on the signs.' },
        { text: 'Exactly one factor is negative, so the product is negative.', tex: `${tex} = ${ans}`, why: 'A positive times a negative is negative: for example, owing 4 dollars three times means owing 12 dollars.' },
      ],
      mis: mis(R(ans), [{ value: R(-ans), tag: 'sign-error', feedback: 'Check the sign. A positive number times a negative number is negative.' }]),
    };
  }
  // exactly one of dividend and divisor is negative, so the quotient is negative
  const q = -x;
  const dvs = negFirst ? y : -y;
  const dividend = q * dvs;
  const tex = `${dividend} \\div ${pi(dvs)}`;
  return {
    prompt: evalPrompt(tex),
    answer: numAns(R(q)),
    inputHint: INT_INPUT,
    hints: [
      'Divide the numbers without their signs first, then decide the sign.',
      'Division undoes multiplication, so the sign rules are the same as for multiplying.',
      'Exactly one of the two numbers is negative. What sign does the quotient get?',
      `Find ${Math.abs(dividend)} divided by ${y}, then choose the sign.`,
    ],
    solution: [
      { text: 'Divide the sizes of the numbers.', tex: `${Math.abs(dividend)} \\div ${y} = ${x}`, why: 'The size of a quotient does not depend on the signs.' },
      { text: `One number is negative and one is positive, so the quotient is negative.`, tex: `${tex} = ${q}`, why: `Check by multiplying back: $${q} \\cdot ${pi(dvs)} = ${dividend}$.` },
    ],
    mis: mis(R(q), [{ value: R(-q), tag: 'sign-error', feedback: 'Check the sign. When exactly one number is negative, the quotient is negative.' }]),
  };
};

const intTemp: Shape = (rng) => {
  const rose = rng.bool();
  const T = rose ? rng.int(-14, -2) : rng.int(-5, 9);
  const D = rose ? rng.int(3, 20) : rng.int(Math.max(T + 2, 4), T + 18);
  const ans = rose ? T + D : T - D;
  return {
    tags: ['word', 'real-world'],
    prompt: [p(`At 6 a.m. the temperature was $${T}^{\\circ}$F. By noon it had ${rose ? 'risen' : 'dropped'} ${plural(D, 'degree')}. What was the temperature at noon, in degrees Fahrenheit?`)],
    answer: numAns(R(ans)),
    inputHint: INT_INPUT,
    hints: [
      'Think of a thermometer as a vertical number line, with 0 in the middle.',
      rose ? 'A rise in temperature means adding.' : 'A drop in temperature means subtracting.',
      `Start at ${T} and move ${plural(D, 'degree')} ${rose ? 'up' : 'down'}.`,
      `Write it as ${T} ${rose ? '+' : '-'} ${D} and work it out, paying attention to where 0 is.`,
    ],
    solution: [
      { text: `Write the change as ${rose ? 'an addition' : 'a subtraction'}.`, tex: `${T} ${rose ? '+' : '-'} ${D}`, why: rose ? 'Rising temperatures move up the number line.' : 'Falling temperatures move down the number line.' },
      { text: 'Work it out on the number line.', tex: `${T} ${rose ? '+' : '-'} ${D} = ${ans}`, why: rose ? `Moving up ${D} from ${T}${T + D > 0 ? ` passes 0 after ${plural(-T, 'degree')}` : ''}.` : `Moving down ${D} from ${T}${T > 0 ? ` passes 0 after ${plural(T, 'degree')}` : ''}.` },
    ],
    mis: mis(R(ans), [
      { value: R(rose ? T - D : T + D), tag: 'sign-error', feedback: rose ? 'The temperature rose, so it moved up the number line.' : 'The temperature dropped, so it moved down the number line.' },
      { value: R(rose ? -T + D : -T - D), tag: 'sign-error', feedback: `The starting temperature is ${T < 0 ? 'below' : 'above'} 0. Keep its sign when you start.` },
    ]),
  };
};

const intSubNeg: Shape = (rng) => {
  const a = rng.nonzeroInt(-15, 15);
  const b = rng.int(2, 15);
  const ans = a + b;
  const tex = `${a} - (-${b})`;
  return {
    prompt: evalPrompt(tex),
    answer: numAns(R(ans)),
    inputHint: INT_INPUT,
    hints: [
      'Subtracting a number is the same as adding its opposite.',
      `The opposite of $-${b}$ is $${b}$.`,
      `Rewrite the problem as an addition: ${a} + ${b}.`,
      `Start at ${a} on the number line and move ${b} to the right.`,
    ],
    solution: [
      { text: 'Rewrite subtraction as adding the opposite.', tex: `${tex} = ${a} + ${b}`, why: 'Taking away a debt is the same as gaining money: removing a negative amount makes the total bigger.' },
      { text: 'Add.', tex: `${a} + ${b} = ${ans}`, why: 'Adding a positive number moves right on the number line.' },
    ],
    mis: mis(R(ans), [
      { value: R(a - b), tag: 'sign-error', feedback: 'Subtracting a negative number is the same as adding a positive number. Rewrite it as an addition first.' },
      { value: R(-ans), tag: 'sign-error', feedback: 'Check the sign of your result. Rewrite the subtraction as an addition and use the number line.' },
    ]),
  };
};

const intNegNeg: Shape = (rng) => {
  const x = rng.int(2, 12);
  const y = rng.int(2, 9);
  if (rng.bool()) {
    const ans = x * y;
    const tex = `(-${x})(-${y})`;
    return {
      prompt: evalPrompt(tex),
      answer: numAns(R(ans)),
      inputHint: INT_INPUT,
      hints: ['Multiply the sizes first, then decide the sign.', 'Count how many of the factors are negative.', 'Two negative factors: what sign does the product get?', `Find ${x} times ${y} and use the sign rule for two negatives.`],
      solution: [
        { text: 'Multiply the sizes.', tex: `${x} \\cdot ${y} = ${ans}`, why: 'The size of a product does not depend on the signs.' },
        { text: 'Both factors are negative, so the product is positive.', tex: `${tex} = ${ans}`, why: 'Multiplying by a negative flips the sign. Flipping twice brings you back to positive.' },
      ],
      mis: mis(R(ans), [{ value: R(-ans), tag: 'sign-error', feedback: 'A negative times a negative is positive. Check the sign of your product.' }]),
    };
  }
  const dividend = -x * y;
  const tex = `${dividend} \\div (-${y})`;
  return {
    prompt: evalPrompt(tex),
    answer: numAns(R(x)),
    inputHint: INT_INPUT,
    hints: ['Divide the sizes first, then decide the sign.', 'The sign rules for dividing are the same as for multiplying.', 'Both numbers are negative. What sign does that give?', `Find ${x * y} divided by ${y}, then choose the sign.`],
    solution: [
      { text: 'Divide the sizes.', tex: `${x * y} \\div ${y} = ${x}`, why: 'The size of a quotient does not depend on the signs.' },
      { text: 'Both numbers are negative, so the quotient is positive.', tex: `${tex} = ${x}`, why: `Check by multiplying back: $${x} \\cdot (-${y}) = ${dividend}$.` },
    ],
    mis: mis(R(x), [{ value: R(-x), tag: 'sign-error', feedback: 'A negative divided by a negative is positive. Check by multiplying your answer by the divisor.' }]),
  };
};

const intThree: Shape = (rng) => {
  const a = rng.nonzeroInt(-12, 12);
  const b = rng.nonzeroInt(-12, 12);
  const c = -rng.int(2, 12);
  const ans = a + b - c;
  const tex = `${a} + ${pi(b)} - (${c})`;
  return {
    prompt: evalPrompt(tex),
    answer: numAns(R(ans)),
    inputHint: INT_INPUT,
    hints: [
      'Addition and subtraction are done from left to right.',
      'Rewrite subtracting a negative as adding its opposite.',
      `Change $- (${c})$ into $+ ${-c}$, so every operation is an addition.`,
      `Add ${a} and ${b} first, then add ${-c}.`,
    ],
    solution: [
      { text: 'Rewrite subtracting a negative as adding a positive.', tex: `${tex} = ${a} + ${pi(b)} + ${-c}`, why: 'Subtracting a number is the same as adding its opposite.' },
      { text: 'Add from left to right.', tex: `${a + b} + ${-c} = ${ans}`, why: `First ${a} + ${pi(b)} = ${a + b}, then add ${-c}.` },
    ],
    mis: mis(R(ans), [
      { value: R(a + b + c), tag: 'sign-error', feedback: `Subtracting $${c}$ is the same as adding ${-c}. Two negative signs in a row make a plus.` },
      { value: R(-ans), tag: 'sign-error', feedback: 'Check the sign of your answer step by step on a number line.' },
    ]),
  };
};

const intElevation: Shape = (rng) => {
  const H = 5 * rng.int(4, 40);
  const L = -5 * rng.int(2, 18);
  const ans = H - L;
  return {
    tags: ['word', 'real-world'],
    prompt: [p(`The top of a hiking trail is at an elevation of $${H}$ feet. The lowest point, in a canyon below sea level, is at an elevation of $${L}$ feet. How many feet higher is the top than the lowest point?`)],
    answer: numAns(R(ans)),
    inputHint: 'Type a number of feet.',
    hints: [
      'Sea level is elevation 0. Below sea level is negative.',
      '"How much higher" is a difference: subtract the lower elevation from the higher one.',
      `Write it as ${H} - (${L}) and remember the rule for subtracting a negative.`,
      `The distance is ${H} feet down to sea level plus ${-L} more feet below it.`,
    ],
    solution: [
      { text: 'The difference in height is the higher elevation minus the lower one.', tex: `${H} - (${L})`, why: 'A difference tells how far apart two numbers are on the number line.' },
      { text: 'Subtracting a negative is adding its opposite.', tex: `${H} - (${L}) = ${H} + ${-L} = ${ans}`, why: `The top is ${H} feet above sea level and the canyon is ${-L} feet below it, so the distances add.` },
    ],
    mis: mis(R(ans), [{ value: R(H + L), tag: 'sign-error', feedback: 'The lowest point is below sea level, so the two distances from sea level add together. Subtracting a negative is adding.' }]),
  };
};

const intOrder: Shape = (rng) => {
  const a = -rng.int(2, 9);
  const b = rng.nonzeroInt(-9, 9);
  const d = rng.int(2, 6);
  const c = d * rng.int(2, 8);
  const ans = a * b + c / d;
  const tex = `${a}(${b}) - ${c} \\div (-${d})`;
  return {
    prompt: evalPrompt(tex),
    answer: numAns(R(ans)),
    inputHint: INT_INPUT,
    hints: [
      'Multiplication and division come before subtraction.',
      `Work out $${a}(${b})$ and $${c} \\div (-${d})$ separately before subtracting.`,
      'Watch the signs in each product and quotient.',
      `Your last step subtracts a negative number, which is the same as adding.`,
    ],
    solution: [
      { text: 'Multiply.', tex: `${a}(${b}) = ${a * b}`, why: `Multiplication comes before subtraction. ${b < 0 ? 'Two negatives give a positive.' : 'One negative factor gives a negative product.'}` },
      { text: 'Divide.', tex: `${c} \\div (-${d}) = ${-c / d}`, why: 'A positive divided by a negative is negative.' },
      { text: 'Subtract, which here means adding the opposite.', tex: `${a * b} - (${-c / d}) = ${ans}`, why: 'Subtracting a negative is the same as adding a positive.' },
    ],
    mis: mis(R(ans), [
      { value: R(a * b - c).div(R(-d)), tag: 'order-of-operations', feedback: 'Division comes before subtraction. Divide first, then subtract.' },
      { value: R(a * b - c / d), tag: 'sign-error', feedback: `$${c} \\div (-${d})$ is negative, and subtracting a negative means adding.` },
    ]),
  };
};

const intAbs: Shape = (rng) => {
  const a = -rng.int(3, 12);
  let b = rng.int(1, 12);
  if (a + b === 0) b++;
  const c = -rng.int(2, 6);
  const d = rng.int(2, 6);
  const ans = Math.abs(a + b) - c * d;
  const tex = `\\left|${a} + ${b}\\right| - (${c})(${d})`;
  return {
    prompt: evalPrompt(tex),
    answer: numAns(R(ans)),
    inputHint: INT_INPUT,
    hints: [
      'Absolute value bars act like parentheses: work inside them first.',
      `Add ${a} + ${b} first, then take the absolute value (its distance from 0).`,
      `Next multiply $(${c})(${d})$. Watch the sign.`,
      'Finish by subtracting. Subtracting a negative number is adding.',
    ],
    solution: [
      { text: 'Work inside the absolute value bars first.', tex: `\\left|${a} + ${b}\\right| = \\left|${a + b}\\right| = ${Math.abs(a + b)}`, why: 'Absolute value bars are a grouping symbol, and absolute value is distance from 0, which is never negative.' },
      { text: 'Multiply.', tex: `(${c})(${d}) = ${c * d}`, why: 'A negative times a positive is negative.' },
      { text: 'Subtract.', tex: `${Math.abs(a + b)} - (${c * d}) = ${ans}`, why: 'Subtracting a negative is the same as adding its opposite.' },
    ],
    mis: mis(R(ans), [
      { value: R(Math.abs(a) + b - c * d), tag: 'order-of-operations', feedback: 'Add the numbers inside the absolute value bars first, then take the absolute value of the result.' },
      { value: R(Math.abs(a + b) + c * d), tag: 'sign-error', feedback: 'The product is negative, and subtracting a negative means adding.' },
    ]),
  };
};

const intGroup: Shape = (rng) => {
  const a = -rng.int(1, 9);
  const b = rng.int(1, 9);
  const c = -rng.int(2, 6);
  const e = rng.nonzeroInt(-20, 20);
  const ans = (a - b) * c + e;
  const tex = `(${a} - ${b})(${c})${e < 0 ? ` - ${-e}` : ` + ${e}`}`;
  return {
    prompt: evalPrompt(tex),
    answer: numAns(R(ans)),
    inputHint: INT_INPUT,
    hints: [
      'Work inside the parentheses first.',
      `$${a} - ${b}$ starts below 0 and moves further left.`,
      'Then multiply. Count the negative factors to decide the sign.',
      `Add or subtract ${Math.abs(e)} last.`,
    ],
    solution: [
      { text: 'Parentheses first.', tex: `${a} - ${b} = ${a - b}`, why: 'Starting below 0 and subtracting moves further left, so the result is more negative.' },
      { text: 'Multiply.', tex: `(${a - b})(${c}) = ${(a - b) * c}`, why: 'Two negative factors give a positive product.' },
      { text: e < 0 ? 'Subtract.' : 'Add.', tex: `${(a - b) * c}${e < 0 ? ` - ${-e}` : ` + ${e}`} = ${ans}`, why: 'Addition and subtraction come last.' },
    ],
    mis: mis(R(ans), [
      { value: R((a + b) * c + e), tag: 'sign-error', feedback: `Check $${a} - ${b}$: starting at ${a} and moving ${b} more to the left gives a number farther below 0.` },
      { value: R(-(a - b) * c + e), tag: 'sign-error', feedback: 'Both factors in the product are negative, so the product is positive.' },
    ]),
  };
};

const intMean: Shape = (rng) => {
  let t: number[] = [];
  let m = 0;
  for (let i = 0; i < 50; i++) {
    m = -rng.int(1, 6);
    t = [rng.int(-12, 6), rng.int(-12, 6), rng.int(-12, 6)];
    const last = 4 * m - t.reduce((s, x) => s + x, 0);
    if (last >= -14 && last <= 10) {
      t.push(last);
      break;
    }
  }
  if (t.length < 4) t = [-3, 2, -9, -6];
  const sum = t.reduce((s, x) => s + x, 0);
  m = sum / 4;
  const sumAbs = t.reduce((s, x) => s + Math.abs(x), 0);
  return {
    tags: ['word', 'real-world', 'multi-step'],
    prompt: [p(`The low temperatures, in degrees Fahrenheit, on four winter days were $${t[0]}$, $${t[1]}$, $${t[2]}$ and $${t[3]}$. What was the mean (average) low temperature?`)],
    answer: numAns(R(m)),
    inputHint: INT_INPUT,
    hints: [
      'The mean is the total divided by the number of values.',
      'Add all four temperatures, keeping their signs.',
      'Positive and negative temperatures partly cancel when you add them.',
      'Divide the total by 4. A negative divided by a positive is negative.',
    ],
    solution: [
      { text: 'Add the four temperatures.', tex: `${t[0]} + ${pi(t[1])} + ${pi(t[2])} + ${pi(t[3])} = ${sum}`, why: 'The mean shares the total equally, so first find the total.' },
      { text: 'Divide by the number of days.', tex: `${sum} \\div 4 = ${m}`, why: 'Sharing the total over 4 days gives the typical (mean) value.' },
    ],
    mis: mis(R(m), [
      { value: R(-m), tag: 'sign-error', feedback: 'Check the sign. The total of the temperatures is negative, so the mean is too.' },
      { value: R(sumAbs, 4), tag: 'sign-error', feedback: 'Keep the negative signs when you add. Temperatures below 0 lower the total.' },
    ]),
  };
};

function verifyInt(pr: Problem): string[] {
  const ev = verifyEvaluate(pr);
  if (ev) return ev;
  const text = firstText(pr);
  const key = keyOf(pr);
  let m = /was \$(-?\d+)\^\{\\circ\}\$F\. By noon it had (risen|dropped) (\d+) degrees?/.exec(text);
  if (m) {
    // the change from 6 a.m. to noon, run backwards from the key, must give the stated change
    const change = key.sub(Q(m[1]));
    return same(change, Q(m[2] === 'risen' ? Number(m[3]) : -Number(m[3])), 'temperature change');
  }
  m = /elevation of \$(-?\d+)\$ feet\. The lowest point, in a canyon below sea level, is at an elevation of \$(-?\d+)\$ feet/.exec(text);
  if (m) return same(Q(m[2]).add(key), Q(m[1]), 'low point plus the difference reaches the top');
  m = /were \$(-?\d+)\$, \$(-?\d+)\$, \$(-?\d+)\$ and \$(-?\d+)\$/.exec(text);
  if (m) {
    // deviations from the mean add to zero
    const dev = [m[1], m[2], m[3], m[4]].reduce((s, x) => s.add(Q(x).sub(key)), Q(0));
    return dev.isZero() ? [] : ['deviations from the mean do not add to 0'];
  }
  return ['unrecognized prompt'];
}

export const genPrereqInt = makeGen(
  'p.int',
  'P.INT',
  'Integer operations: add, subtract, multiply and divide positive and negative numbers, including subtracting negatives, absolute value and short multi-step expressions.',
  { 1: [intAdd, intSubBelow, intMulDiv, intTemp], 2: [intSubNeg, intNegNeg, intThree, intElevation], 3: [intOrder, intAbs, intGroup, intMean] },
  verifyInt,
);

// ---------------------------------------------------------------------------
// P.FRAC: fraction operations
// ---------------------------------------------------------------------------

function commonDenSteps(x: Rational, y: Rational, op: '+' | '-'): { L: number; tex: string; lowest: boolean } {
  const a = fracParts(x);
  const b = fracParts(y);
  const L = lcmN(a.d, b.d);
  const xn = a.n * (L / a.d);
  const yn = b.n * (L / b.d);
  const top = op === '+' ? xn + yn : xn - yn;
  // lowest: the combined fraction needs no further simplifying
  return { L, tex: `\\frac{${xn}}{${L}} ${op} \\frac{${yn}}{${L}} = ${top < 0 ? '-' : ''}\\frac{${Math.abs(top)}}{${L}}`, lowest: gcdN(Math.abs(top), L) === 1 };
}

const fracAddSub: Shape = (rng) => {
  const dens = [2, 3, 4, 5, 6, 8, 10, 12];
  let x = properFrac(rng, dens);
  let y = properFrac(rng, dens);
  for (let i = 0; i < 30 && (x.den === y.den || x.eq(y)); i++) y = properFrac(rng, dens);
  if (x.den === y.den) y = x.den === 3n ? R(1, 4) : R(1, 3);
  const add = rng.bool();
  if (!add && x.lt(y)) [x, y] = [y, x];
  const op = add ? '+' : '-';
  const ans = add ? x.add(y) : x.sub(y);
  const a = fracParts(x);
  const b = fracParts(y);
  const cd = commonDenSteps(x, y, op);
  const tex = `${x.toTex()} ${op} ${y.toTex()}`;
  const across = a.d + (add ? b.d : -b.d) === 0 ? null : R(add ? a.n + b.n : a.n - b.n, add ? a.d + b.d : a.d - b.d);
  return {
    prompt: evalPrompt(tex),
    answer: numAns(ans),
    inputHint: FRAC_INPUT,
    hints: [
      `You can only ${add ? 'add' : 'subtract'} fractions that count pieces of the same size, so you need a common denominator.`,
      `Find the least common multiple of ${a.d} and ${b.d}.`,
      'Rewrite each fraction with that denominator by multiplying its top and bottom by the same number, which does not change its value.',
      `${add ? 'Add' : 'Subtract'} the new numerators, keep the common denominator, and simplify if you can.`,
    ],
    solution: [
      { text: `Use the common denominator ${cd.L}.${cd.lowest ? ' The result is already in lowest terms.' : ''}`, tex: `${tex} = ${cd.tex}`, why: `${cd.L} is the least common multiple of ${a.d} and ${b.d}. Multiplying top and bottom by the same number makes an equivalent fraction.` },
      ...(cd.lowest ? [] : [{ text: 'Simplify.', tex: `${tex} = ${ans.toTex()}`, why: 'Divide the numerator and denominator by any common factor; the value stays the same.' }]),
    ],
    mis: mis(ans, [{ value: across, tag: 'arithmetic-error', feedback: `You ${add ? 'added' : 'subtracted'} straight across the tops and bottoms. The denominator names the size of the pieces, so first rewrite both fractions with a common denominator.` }]),
  };
};

const fracMul: Shape = (rng) => {
  const x = properFrac(rng, [2, 3, 4, 5, 6, 8]);
  let y = properFrac(rng, [2, 3, 4, 5, 6, 9, 10]);
  if (y.eq(x)) y = R(2, 3).eq(x) ? R(3, 4) : R(2, 3);
  const ans = x.mul(y);
  const a = fracParts(x);
  const b = fracParts(y);
  const tex = `${x.toTex()} \\cdot ${y.toTex()}`;
  return {
    prompt: evalPrompt(tex),
    answer: numAns(ans),
    inputHint: FRAC_INPUT,
    hints: [
      'To multiply fractions you do not need a common denominator.',
      'Multiply numerator by numerator and denominator by denominator.',
      'You can simplify before multiplying if a top number and a bottom number share a factor.',
      `Find ${a.n} times ${b.n} over ${a.d} times ${b.d}, then simplify.`,
    ],
    solution: [
      { text: 'Multiply the numerators and the denominators.', tex: `${tex} = \\frac{${a.n} \\cdot ${b.n}}{${a.d} \\cdot ${b.d}} = \\frac{${a.n * b.n}}{${a.d * b.d}}`, why: `Taking $${x.toTex()}$ of $${y.toTex()}$ means cutting $${y.toTex()}$ into ${a.d} equal parts and taking ${a.n} of them.` },
      ...(gcdN(a.n * b.n, a.d * b.d) === 1 ? [] : [{ text: 'Simplify.', tex: `\\frac{${a.n * b.n}}{${a.d * b.d}} = ${ans.toTex()}`, why: 'Dividing the top and bottom by a common factor does not change the value.' }]),
    ],
    mis: mis(ans, [
      { value: x.add(y), tag: 'arithmetic-error', feedback: 'The problem multiplies the fractions, it does not add them.' },
      { value: a.d === b.d ? R(a.n * b.n, a.d) : null, tag: 'arithmetic-error', feedback: 'Multiply the denominators too, not just the numerators.' },
    ]),
  };
};

const fracOfWhole: Shape = (rng) => {
  let f = properFrac(rng, [3, 4, 5, 6, 8]);
  while (f.num < 2n) f = properFrac(rng, [3, 4, 5, 6, 8]);
  const { n: a, d: b } = fracParts(f);
  const N = b * rng.int(2, Math.floor(40 / b));
  const ans = R(N * a, b);
  return {
    tags: ['word', 'real-world'],
    prompt: [p(`There are ${N} students in a class, and $${f.toTex()}$ of them ride the bus to school. How many students ride the bus?`)],
    answer: numAns(ans),
    inputHint: 'Type a whole number.',
    hints: [
      `"$${f.toTex()}$ of" a number means multiply by $${f.toTex()}$.`,
      `The denominator ${b} says to split the class into ${b} equal groups.`,
      `Find the size of one group: ${N} divided by ${b}.`,
      `The numerator ${a} says to take ${a} of those groups.`,
    ],
    solution: [
      { text: `Split the ${N} students into ${b} equal groups.`, tex: `${N} \\div ${b} = ${N / b}`, why: `$\\frac{1}{${b}}$ of a number is one of ${b} equal parts.` },
      { text: `Take ${a} of the groups.`, tex: `${a} \\cdot ${N / b} = ${ans.toTex()}`, why: `$${f.toTex()}$ means ${a} parts out of ${b}, so multiply one part by ${a}.` },
    ],
    mis: mis(ans, [
      { value: R(N, b), tag: 'arithmetic-error', feedback: `That is $\\frac{1}{${b}}$ of the class. The fraction asks for ${a} of those equal parts.` },
      { value: R(N * b, a), tag: 'inverse-operation', feedback: 'Taking a fraction of a number gives a smaller number here. Multiply by the fraction instead of dividing by it.' },
    ]),
  };
};

const fracDiv: Shape = (rng) => {
  const x = properFrac(rng, [2, 3, 4, 5, 6, 8]);
  let y = properFrac(rng, [2, 3, 4, 5, 6, 8]);
  if (y.eq(x)) y = x.eq(R(1, 2)) ? R(3, 4) : R(1, 2);
  const ans = x.div(y);
  const b = fracParts(y);
  const tex = `${x.toTex()} \\div ${y.toTex()}`;
  return {
    prompt: evalPrompt(tex),
    answer: numAns(ans),
    inputHint: FRAC_INPUT,
    hints: [
      'Dividing by a fraction asks how many of that fraction fit into the first number.',
      'Dividing by a number is the same as multiplying by its reciprocal.',
      `Keep the first fraction, change $\\div$ to $\\cdot$, and flip the second fraction to $\\frac{${b.d}}{${b.n}}$.`,
      'Multiply the numerators and denominators, then simplify.',
    ],
    solution: [
      { text: 'Multiply by the reciprocal of the divisor.', tex: `${tex} = ${x.toTex()} \\cdot \\frac{${b.d}}{${b.n}}`, why: `Dividing by $${y.toTex()}$ undoes multiplying by it, and multiplying by $\\frac{${b.d}}{${b.n}}$ does exactly that.` },
      { text: 'Multiply and simplify.', tex: `${x.toTex()} \\cdot \\frac{${b.d}}{${b.n}} = ${ans.toTex()}`, why: 'Multiply top times top and bottom times bottom, then divide out common factors.' },
    ],
    mis: mis(ans, [
      { value: x.mul(y), tag: 'inverse-operation', feedback: 'You multiplied without flipping. To divide by a fraction, multiply by its reciprocal.' },
      { value: x.inv().mul(y), tag: 'inverse-operation', feedback: 'Flip the second fraction (the divisor), not the first one.' },
    ]),
  };
};

const fracMixed: Shape = (rng) => {
  const dens = [2, 3, 4, 5, 6, 8];
  const kind = rng.int(0, 2); // 0 add, 1 subtract with regrouping, 2 multiply
  let x = properFrac(rng, dens);
  let y = properFrac(rng, dens);
  for (let i = 0; i < 30 && x.den === y.den; i++) y = properFrac(rng, dens);
  if (kind === 1 && x.gt(y)) [x, y] = [y, x];
  if (kind === 1 && x.eq(y)) y = x.eq(R(1, 2)) ? R(3, 4) : R(1, 2);
  if (kind === 1 && x.gt(y)) [x, y] = [y, x];
  const w1 = kind === 2 ? rng.int(1, 3) : rng.int(2, 5);
  const w2 = kind === 2 ? rng.int(1, 3) : kind === 1 ? rng.int(1, w1 - 1) : rng.int(1, 4);
  const m1 = Q(w1).add(x);
  const m2 = Q(w2).add(y);
  const op = kind === 0 ? '+' : kind === 1 ? '-' : '\\cdot';
  const ans = kind === 0 ? m1.add(m2) : kind === 1 ? m1.sub(m2) : m1.mul(m2);
  const tex = `${mixTex(m1)} ${op} ${mixTex(m2)}`;
  const improper = `\\frac{${m1.num}}{${m1.den}} ${op} \\frac{${m2.num}}{${m2.den}}`;
  const wrong =
    kind === 0
      ? Q(w1 + w2).add(R(Number(x.num) + Number(y.num), Number(x.den) + Number(y.den)))
      : kind === 1
        ? Q(w1 - w2).add(y.sub(x))
        : Q(w1 * w2).add(x.mul(y));
  return {
    prompt: evalPrompt(tex),
    answer: numAns(ans),
    inputHint: FRAC_INPUT,
    hints: [
      'A mixed number is a whole number plus a fraction.',
      kind === 2 ? 'To multiply, first rewrite each mixed number as an improper fraction.' : 'Rewriting each mixed number as an improper fraction lets you avoid regrouping mistakes.',
      `$${mixTex(m1)}$ is $\\frac{${m1.num}}{${m1.den}}$. Rewrite $${mixTex(m2)}$ the same way.`,
      kind === 2 ? 'Multiply the improper fractions, then simplify.' : 'Use a common denominator, then combine the numerators.',
    ],
    solution: [
      { text: 'Rewrite the mixed numbers as improper fractions.', tex: `${tex} = ${improper}`, why: `For example, $${mixTex(m1)} = \\frac{${w1} \\cdot ${m1.den} + ${x.num}}{${m1.den}}$: the whole number ${w1} is ${w1 * Number(m1.den)} pieces of size $\\frac{1}{${m1.den}}$.` },
      { text: kind === 2 ? 'Multiply and simplify.' : 'Use a common denominator and combine.', tex: `${improper} = ${ans.toTex()}${ans.isInteger() || mixTex(ans) === ans.toTex() ? '' : ` = ${mixTex(ans)}`}`, why: kind === 2 ? 'Multiply top times top and bottom times bottom.' : 'Fractions with the same denominator count the same size pieces, so their numerators can be combined.' },
    ],
    mis: mis(ans, [
      {
        value: wrong,
        tag: 'arithmetic-error',
        feedback:
          kind === 2
            ? 'You multiplied the whole numbers and the fractions separately. That misses the cross pieces: change both mixed numbers to improper fractions first.'
            : kind === 1
              ? 'The second fraction part is bigger than the first, so you cannot subtract the fraction parts directly. Regroup one whole, or change to improper fractions.'
              : 'Add the fraction parts using a common denominator, not straight across.',
      },
    ]),
  };
};

const fracNegResult: Shape = (rng) => {
  const dens = [2, 3, 4, 5, 6, 8, 10];
  let x = properFrac(rng, dens);
  let y = properFrac(rng, dens);
  for (let i = 0; i < 30 && (x.den === y.den || x.eq(y)); i++) y = properFrac(rng, dens);
  if (x.eq(y)) y = x.eq(R(1, 2)) ? R(1, 3) : R(1, 2);
  if (x.gt(y)) [x, y] = [y, x];
  const ans = x.sub(y);
  const cd = commonDenSteps(x, y, '-');
  const tex = `${x.toTex()} - ${y.toTex()}`;
  return {
    prompt: evalPrompt(tex),
    answer: numAns(ans),
    inputHint: FRAC_INPUT,
    hints: [
      'Compare the two fractions first: is the answer going to be positive or negative?',
      'Rewrite both fractions with a common denominator.',
      'Subtract the numerators in the order they are written.',
      'You are taking away more than you start with, so the result is below 0.',
    ],
    solution: [
      { text: `Use the common denominator ${cd.L}.${cd.lowest ? ' The result is already in lowest terms.' : ''}`, tex: `${tex} = ${cd.tex}`, why: `Same-size pieces can be subtracted directly.${cd.lowest ? ` $${y.toTex()}$ is bigger than $${x.toTex()}$, so the difference is negative.` : ''}` },
      ...(cd.lowest ? [] : [{ text: 'Simplify.', tex: `${tex} = ${ans.toTex()}`, why: `$${y.toTex()}$ is bigger than $${x.toTex()}$, so the difference is negative.` }]),
    ],
    mis: mis(ans, [{ value: ans.neg(), tag: 'sign-error', feedback: 'You subtracted the smaller fraction from the larger one. The problem takes a larger fraction away from a smaller one, so the result is negative.' }]),
  };
};

const fracServings: Shape = (rng) => {
  const f = rng.pick([R(3, 4), R(2, 3), R(1, 2), R(1, 3), R(3, 8), R(1, 4)]);
  const { n: a, d: b } = fracParts(f);
  const j = rng.int(1, Math.max(1, Math.floor(32 / b)));
  const servings = b * j;
  const cups = a * j;
  return {
    tags: ['word', 'real-world'],
    prompt: [p(`How many $${f.toTex()}$-cup servings are in $${cups}$ cups of yogurt?`)],
    answer: numAns(R(servings)),
    inputHint: 'Type a whole number.',
    hints: [
      '"How many servings fit in" is a division question.',
      `Divide ${cups} by $${f.toTex()}$.`,
      'Dividing by a fraction is the same as multiplying by its reciprocal.',
      `Multiply ${cups} by $\\frac{${b}}{${a}}$.`,
    ],
    solution: [
      { text: 'Write a division.', tex: `${cups} \\div ${f.toTex()}`, why: 'The question asks how many groups of the serving size fit into the total.' },
      { text: 'Multiply by the reciprocal.', tex: `${cups} \\cdot \\frac{${b}}{${a}} = ${servings}`, why: `Each cup holds $\\frac{${b}}{${a}}$ servings, so ${cups} cups hold ${cups} times as many.` },
    ],
    mis: mis(R(servings), [{ value: Q(cups).mul(f), tag: 'inverse-operation', feedback: 'Each serving is less than a cup, so there must be more servings than cups. Divide by the serving size instead of multiplying.' }]),
  };
};

const fracTwoOps: Shape = (rng) => {
  const dens = [2, 3, 4, 6];
  for (;;) {
    const sgn = () => (rng.bool() ? 1 : -1);
    const x = properFrac(rng, dens).mul(Q(sgn()));
    const y = properFrac(rng, [2, 3, 4, 6, 8]);
    const z = properFrac(rng, dens).mul(Q(sgn()));
    if ((!x.isNegative() && !z.isNegative()) || x.abs().eq(z.abs())) continue;
    const mul = rng.bool();
    const plus = rng.bool();
    const prodFirst = rng.bool();
    const prod = mul ? x.mul(y) : x.div(y);
    const ans = prodFirst ? (plus ? prod.add(z) : prod.sub(z)) : plus ? z.add(prod) : z.sub(prod);
    if (ans.isZero() || ans.den > 24n || ans.num > 30n || ans.num < -30n) continue;
    const opT = mul ? '\\cdot' : '\\div';
    const pmT = plus ? '+' : '-';
    const prodTex = `${x.toTex()} ${opT} ${y.toTex()}`;
    const prodTexIn = `${pq(x)} ${opT} ${y.toTex()}`;
    const tex = prodFirst ? `${prodTex} ${pmT} ${pq(z)}` : `${z.toTex()} ${pmT} ${prodTexIn}`;
    const leftToRight = prodFirst ? null : mul ? (plus ? z.add(x) : z.sub(x)).mul(y) : (plus ? z.add(x) : z.sub(x)).div(y);
    return {
      tags: ['multi-step'],
      prompt: evalPrompt(tex),
      answer: numAns(ans),
      inputHint: FRAC_INPUT,
      hints: [
        'Order of operations still applies to fractions: multiply or divide before adding or subtracting.',
        `Start with $${prodTexIn}$.${mul ? '' : ' Dividing by a fraction means multiplying by its reciprocal.'}`,
        'Keep track of the signs: count the negative factors in that part.',
        `Then ${plus ? 'add' : 'subtract'} using a common denominator, and simplify.`,
      ],
      solution: [
        { text: mul ? 'Multiply first.' : 'Divide first, by multiplying by the reciprocal.', tex: `${prodTexIn} = ${prod.toTex()}`, why: 'Multiplication and division come before addition and subtraction.' },
        { text: plus ? 'Add.' : 'Subtract.', tex: prodFirst ? `${prod.toTex()} ${pmT} ${pq(z)} = ${ans.toTex()}` : `${z.toTex()} ${pmT} ${pq(prod)} = ${ans.toTex()}`, why: 'Rewrite with a common denominator, then combine the numerators, keeping track of signs.' },
      ],
      mis: mis(ans, [
        { value: leftToRight, tag: 'order-of-operations', feedback: `${mul ? 'Multiplication' : 'Division'} comes before ${plus ? 'addition' : 'subtraction'}, even when it is written second.` },
        { value: ans.neg(), tag: 'sign-error', feedback: 'Check the signs. Count the negative factors in the product, then combine carefully.' },
      ]),
    };
  }
};

const fracSubNeg: Shape = (rng) => {
  const dens = [2, 3, 4, 5, 6, 8];
  const x = properFrac(rng, dens).neg();
  let y = properFrac(rng, dens);
  for (let i = 0; i < 30 && (y.den === x.den || y.eq(x.neg())); i++) y = properFrac(rng, dens);
  if (y.eq(x.neg())) y = x.eq(R(-1, 2)) ? R(1, 3) : R(1, 2);
  const ans = x.add(y);
  const tex = `${x.toTex()} - ${pq(y.neg())}`;
  return {
    prompt: evalPrompt(tex),
    answer: numAns(ans),
    inputHint: FRAC_INPUT,
    hints: [
      'Subtracting a negative number is the same as adding its opposite.',
      `Rewrite it as $${x.toTex()} + ${y.toTex()}$.`,
      'Use a common denominator for the two fractions.',
      'One fraction is negative and one is positive, so they partly cancel. Decide which is larger in size.',
    ],
    solution: [
      { text: 'Rewrite subtracting a negative as adding.', tex: `${tex} = ${x.toTex()} + ${y.toTex()}`, why: 'Taking away a negative amount increases the total.' },
      { text: 'Use a common denominator and add.', tex: `${x.toTex()} + ${y.toTex()} = ${ans.toTex()}`, why: 'Same-size pieces can be combined; the sign of the result matches the fraction that is larger in size.' },
    ],
    mis: mis(ans, [{ value: x.sub(y), tag: 'sign-error', feedback: 'Subtracting a negative is adding. Rewrite the problem as an addition first.' }]),
  };
};

const fracNegMixed: Shape = (rng) => {
  const pairs: Array<[Rational, Rational]> = [
    [R(4, 3), R(9, 4)],
    [R(3, 2), R(8, 3)],
    [R(5, 2), R(6, 5)],
    [R(9, 4), R(8, 3)],
    [R(5, 4), R(12, 5)],
    [R(7, 3), R(9, 7)],
    [R(9, 2), R(4, 3)],
    [R(9, 4), R(10, 3)],
    [R(5, 3), R(9, 4)],
  ];
  const [u, v] = rng.pick(pairs);
  const divide = rng.bool();
  const bothNeg = rng.bool();
  const m1 = u.neg();
  const m2 = bothNeg ? v.neg() : v;
  // for division the divisor is shown as a fraction
  const d2 = divide ? m2.inv() : m2;
  const ans = divide ? m1.div(d2) : m1.mul(m2);
  const tex = divide ? `${mixTex(m1)} \\div ${pq(d2)}` : `\\left(${mixTex(m1)}\\right)\\left(${m2.isInteger() || m2.abs().lt(1) ? m2.toTex() : mixTex(m2)}\\right)`;
  const m2Shown = divide ? d2 : m2;
  return {
    tags: ['multi-step'],
    prompt: evalPrompt(tex),
    answer: numAns(ans),
    inputHint: FRAC_INPUT,
    hints: [
      'Rewrite each mixed number as an improper fraction first.',
      `$${mixTex(m1)}$ is $-\\frac{${u.num}}{${u.den}}$.`,
      divide ? 'Dividing by a fraction is the same as multiplying by its reciprocal.' : 'Multiply numerators and denominators. You can simplify across first.',
      `Decide the sign: ${bothNeg ? 'both numbers are negative' : 'exactly one number is negative'}.`,
    ],
    solution: [
      { text: 'Write the mixed number as an improper fraction.', tex: `${mixTex(m1)} = ${m1.toTex()}`, why: 'Improper fractions multiply and divide directly; mixed numbers do not.' },
      ...(divide ? [{ text: 'Multiply by the reciprocal of the divisor.', tex: `${m1.toTex()} \\div ${pq(d2)} = ${m1.toTex()} \\cdot ${pq(d2.inv())}`, why: 'Dividing by a number is multiplying by its reciprocal.' }] : []),
      { text: 'Multiply and simplify, then apply the sign rule.', tex: `${tex} = ${ans.toTex()}`, why: bothNeg ? 'Two negatives give a positive.' : 'One negative gives a negative.' },
    ],
    mis: mis(ans, [
      { value: ans.neg(), tag: 'sign-error', feedback: bothNeg ? 'Both numbers are negative, so the result is positive.' : 'Exactly one number is negative, so the result is negative.' },
      { value: divide ? m1.mul(m2Shown) : null, tag: 'inverse-operation', feedback: 'To divide by a fraction, multiply by its reciprocal. Flip the divisor.' },
    ]),
  };
};

function verifyFrac(pr: Problem): string[] {
  const ev = verifyEvaluate(pr);
  if (ev) return ev;
  const text = firstText(pr);
  const key = keyOf(pr);
  let m = /There are (\d+) students in a class, and \$\\frac\{(\d+)\}\{(\d+)\}\$ of them/.exec(text);
  // the bus riders, as a fraction of the class, must equal the stated fraction
  if (m) return same(key.div(Q(m[1])), R(Number(m[2]), Number(m[3])), 'fraction of the class');
  m = /How many \$\\frac\{(\d+)\}\{(\d+)\}\$-cup servings are in \$(\d+)\$ cups/.exec(text);
  if (m) return same(key.mul(R(Number(m[1]), Number(m[2]))), Q(m[3]), 'servings times serving size');
  return ['unrecognized prompt'];
}

export const genPrereqFrac = makeGen(
  'p.frac',
  'P.FRAC',
  'Fraction operations: add, subtract, multiply and divide fractions and mixed numbers, including negative fractions and two-operation expressions.',
  { 1: [fracAddSub, fracMul, fracOfWhole], 2: [fracDiv, fracMixed, fracNegResult, fracServings], 3: [fracTwoOps, fracSubNeg, fracNegMixed] },
  verifyFrac,
);

// ---------------------------------------------------------------------------
// P.OOO: order of operations
// ---------------------------------------------------------------------------

const OOO_H1 = 'Order of operations: grouping symbols first, then exponents, then multiplication and division from left to right, then addition and subtraction from left to right.';

function oooBuilt(tex: string, ans: number | Rational, steps: SolutionStep[], h2: string, h3: string, h4: string, wrong: MC[], tags: Problem['tags'] = []): Built {
  const key = typeof ans === 'number' ? R(ans) : ans;
  const solution = steps.map((st) => (st.why ? st : { ...st, why: 'It is the only operation left, so it is done last.' }));
  return { tags, prompt: evalPrompt(tex), answer: numAns(key), inputHint: NUM_INPUT, hints: [OOO_H1, h2, h3, h4], solution, mis: mis(key, wrong) };
}

const oooBasic: Shape = (rng) => {
  const k = rng.int(0, 4);
  if (k === 0) {
    const a = rng.int(2, 20);
    const b = rng.int(2, 9);
    const c = rng.int(2, 9);
    return oooBuilt(
      `${a} + ${b} \\cdot ${c}`,
      a + b * c,
      [
        { text: 'Multiply first.', tex: `${b} \\cdot ${c} = ${b * c}`, why: 'Multiplication comes before addition, even though the addition is written first.' },
        { text: 'Then add.', tex: `${a} + ${b * c} = ${a + b * c}` },
      ],
      'Is there a multiplication? It comes before addition.',
      `Work out $${b} \\cdot ${c}$ first.`,
      `Add ${a} to that product.`,
      [{ value: R((a + b) * c), tag: 'order-of-operations', feedback: 'You added first. Multiplication comes before addition, even when it is written second.' }],
    );
  }
  if (k === 1) {
    const c = rng.int(2, 6);
    const b = c * rng.int(2, 9);
    const a = rng.int(b / c + 3, 35);
    return oooBuilt(
      `${a} - ${b} \\div ${c}`,
      a - b / c,
      [
        { text: 'Divide first.', tex: `${b} \\div ${c} = ${b / c}`, why: 'Division comes before subtraction.' },
        { text: 'Then subtract.', tex: `${a} - ${b / c} = ${a - b / c}` },
      ],
      'Division comes before subtraction.',
      `Work out $${b} \\div ${c}$ first.`,
      `Subtract that quotient from ${a}.`,
      [{ value: R(a - b, c), tag: 'order-of-operations', feedback: 'You subtracted first. Division comes before subtraction.' }],
    );
  }
  if (k === 2) {
    const a = rng.int(2, 12);
    const b = rng.int(2, 12);
    const c = rng.int(2, 6);
    const front = rng.bool();
    const tex = front ? `${c}(${a} + ${b})` : `(${a} + ${b}) \\cdot ${c}`;
    return oooBuilt(
      tex,
      (a + b) * c,
      [
        { text: 'Work inside the parentheses first.', tex: `${a} + ${b} = ${a + b}`, why: 'Parentheses group the sum, so it is done before the multiplication.' },
        { text: 'Then multiply.', tex: `${a + b} \\cdot ${c} = ${(a + b) * c}` },
      ],
      'Parentheses come first.',
      `Find $${a} + ${b}$ before anything else.`,
      `Multiply that sum by ${c}.`,
      [{ value: R(front ? c * a + b : a + b * c), tag: 'order-of-operations', feedback: 'The parentheses mean the whole sum is multiplied. Do the addition inside them first.' }],
    );
  }
  if (k === 3) {
    const a = rng.int(2, 15);
    const b = rng.int(2, 9);
    return oooBuilt(
      `${a} + ${b}^{2}`,
      a + b * b,
      [
        { text: 'Evaluate the exponent first.', tex: `${b}^{2} = ${b} \\cdot ${b} = ${b * b}`, why: 'Exponents come before addition, and the exponent applies only to the number it is attached to.' },
        { text: 'Then add.', tex: `${a} + ${b * b} = ${a + b * b}` },
      ],
      'Exponents come before addition.',
      `$${b}^{2}$ means ${b} times ${b}, not ${b} times 2.`,
      `Square ${b}, then add ${a}.`,
      [
        { value: R((a + b) ** 2), tag: 'order-of-operations', feedback: 'The exponent applies only to the number it touches. Square first, then add.' },
        { value: R(a + 2 * b), tag: 'exponent-rule', feedback: `An exponent of 2 means multiply the number by itself, not by 2.` },
      ],
    );
  }
  const b = rng.int(4, 12);
  const c = rng.int(1, b - 2);
  const a = rng.int(b + c + 2, 40);
  return oooBuilt(
    `${a} - ${b} - ${c}`,
    a - b - c,
    [
      { text: 'Subtract from left to right.', tex: `${a} - ${b} = ${a - b}`, why: 'Addition and subtraction are done in order from left to right.' },
      { text: 'Subtract again.', tex: `${a - b} - ${c} = ${a - b - c}` },
    ],
    'With only subtraction, work from left to right.',
    `Start with $${a} - ${b}$.`,
    `Then subtract ${c} from that result.`,
    [{ value: R(a - (b - c)), tag: 'order-of-operations', feedback: `You worked out ${b} - ${c} first. Subtraction goes from left to right, so take ${b} away from ${a} first.` }],
  );
};

const oooMid: Shape = (rng) => {
  const k = rng.int(0, 3);
  if (k === 0) {
    const b = rng.int(2, 6);
    const c = rng.int(2, 6);
    const a = b * rng.int(2, 10);
    return oooBuilt(
      `${a} \\div ${b} \\cdot ${c}`,
      (a / b) * c,
      [
        { text: 'Divide first, because it comes first reading left to right.', tex: `${a} \\div ${b} = ${a / b}`, why: 'Multiplication and division have equal rank, so they are done left to right.' },
        { text: 'Then multiply.', tex: `${a / b} \\cdot ${c} = ${(a / b) * c}` },
      ],
      'Multiplication does not always come before division: they have equal rank.',
      'When operations have equal rank, work from left to right.',
      `Start with $${a} \\div ${b}$.`,
      [{ value: R(a, b * c), tag: 'order-of-operations', feedback: 'You multiplied first. Multiplication and division are done in order from left to right.' }],
    );
  }
  if (k === 1) {
    const d = rng.int(1, 6);
    const c = d + rng.int(2, 4);
    const b = rng.int(2, 5);
    const a = rng.int(2, 15);
    const s = (c - d) ** 2;
    return oooBuilt(
      `${a} + ${b}(${c} - ${d})^{2}`,
      a + b * s,
      [
        { text: 'Parentheses first.', tex: `${c} - ${d} = ${c - d}`, why: 'Grouping symbols come first.' },
        { text: 'Then the exponent.', tex: `${c - d}^{2} = ${s}`, why: 'Exponents come before multiplication.' },
        { text: 'Multiply, then add.', tex: `${a} + ${b} \\cdot ${s} = ${a} + ${b * s} = ${a + b * s}`, why: 'Multiplication comes before addition.' },
      ],
      'Start inside the parentheses.',
      'Square the result before multiplying.',
      `Multiply by ${b} and add ${a} last.`,
      [
        { value: R((a + b) * s), tag: 'order-of-operations', feedback: `You added ${a} + ${b} first. Multiplication comes before addition.` },
        { value: R(a + (b * (c - d)) ** 2), tag: 'order-of-operations', feedback: `The exponent applies only to the parentheses, not to ${b}. Square before multiplying.` },
      ],
    );
  }
  if (k === 2) {
    const c = rng.int(2, 5);
    const b = c * rng.int(2, 6);
    const d = rng.int(2, 4);
    const e = rng.int(1, 9);
    const a = (b / c) * d + rng.int(1, 20);
    return oooBuilt(
      `${a} - ${b} \\div ${c} \\cdot ${d} + ${e}`,
      a - (b / c) * d + e,
      [
        { text: 'Divide and multiply from left to right.', tex: `${b} \\div ${c} \\cdot ${d} = ${b / c} \\cdot ${d} = ${(b / c) * d}`, why: 'Multiplication and division come before addition and subtraction, and they go left to right.' },
        { text: 'Subtract and add from left to right.', tex: `${a} - ${(b / c) * d} + ${e} = ${a - (b / c) * d} + ${e} = ${a - (b / c) * d + e}`, why: 'Addition and subtraction also go left to right.' },
      ],
      `Find the multiplication and division in the middle: $${b} \\div ${c} \\cdot ${d}$.`,
      'Do that division and multiplication from left to right.',
      'Then do the subtraction and addition from left to right.',
      [
        { value: R(a).sub(R(b, c * d)).add(R(e)), tag: 'order-of-operations', feedback: 'Multiplication and division have equal rank: divide first here, because it comes first from left to right.' },
        { value: R(a - (b / c) * d - e), tag: 'order-of-operations', feedback: 'The last operation is addition. Subtraction and addition are done from left to right, so the minus sign does not apply to the last number.' },
      ],
    );
  }
  const b = rng.int(2, 6);
  const c = rng.int(2, 6);
  let a = rng.int(1, 20);
  while ((a + b * b) % c !== 0) a++;
  return oooBuilt(
    `\\frac{${a} + ${b}^2}{${c}}`,
    (a + b * b) / c,
    [
      { text: 'The fraction bar groups the whole numerator. Evaluate the exponent in it.', tex: `${b}^2 = ${b * b}`, why: 'A fraction bar acts like parentheses around the numerator and around the denominator.' },
      { text: 'Add in the numerator.', tex: `${a} + ${b * b} = ${a + b * b}` },
      { text: 'Divide.', tex: `\\frac{${a + b * b}}{${c}} = ${(a + b * b) / c}` },
    ],
    'A fraction bar is a grouping symbol: the whole top is divided by the whole bottom.',
    'Simplify the numerator completely first, starting with the exponent.',
    `Then divide the numerator by ${c}.`,
    [
      { value: R(a).add(R(b * b, c)), tag: 'order-of-operations', feedback: 'The fraction bar divides the whole numerator, not just the last term. Simplify the top first.' },
      { value: R(a + 2 * b, c), tag: 'exponent-rule', feedback: 'An exponent of 2 means multiply the number by itself, not by 2.' },
    ],
  );
};

const oooHard: Shape = (rng) => {
  const k = rng.int(0, 3);
  if (k === 0) {
    const a = rng.int(2, 6);
    const b = rng.int(2, 5);
    const c = rng.int(2, 5);
    const ans = -a * a + b * c * c;
    return oooBuilt(
      `-${a}^{2} + ${b}(-${c})^{2}`,
      ans,
      [
        { text: `Evaluate $-${a}^{2}$. The exponent applies only to ${a}.`, tex: `-${a}^{2} = -(${a} \\cdot ${a}) = ${-a * a}`, why: `Without parentheses, $-${a}^{2}$ means the opposite of $${a}^{2}$.` },
        { text: `Evaluate $(-${c})^{2}$. The parentheses make $-${c}$ the base.`, tex: `(-${c})^{2} = (-${c})(-${c}) = ${c * c}`, why: 'A negative times a negative is positive.' },
        { text: 'Multiply, then add.', tex: `${-a * a} + ${b} \\cdot ${c * c} = ${-a * a} + ${b * c * c} = ${ans}` },
      ],
      `Compare $-${a}^{2}$ and $(-${c})^{2}$: in which one is the negative sign part of the base?`,
      `$-${a}^{2}$ is the opposite of $${a}^{2}$, so it is negative.`,
      `$(-${c})^{2}$ multiplies two negatives. Then multiply by ${b} and add.`,
      [
        { value: R(a * a + b * c * c), tag: 'exponent-rule', feedback: `$-${a}^{2}$ means $-(${a}^{2})$: the exponent applies to ${a} only, so the result is negative.` },
        { value: R(-a * a - b * c * c), tag: 'exponent-rule', feedback: `$(-${c})^{2}$ is $(-${c})(-${c})$, which is positive.` },
      ],
      ['multi-step'],
    );
  }
  if (k === 1) {
    const c = rng.int(1, 6);
    const dd = rng.int(2, 3);
    const d = c + dd;
    const s = dd * dd;
    const e = rng.pick([2, 4, 8].filter((x) => x <= 8));
    let b = rng.int(1, 6);
    while ((b * s) % e !== 0) b++;
    const a = rng.int(2, 20);
    const ans = a - (b * s) / e;
    return oooBuilt(
      `${a} - ${b}(${c} - ${d})^{2} \\div ${e}`,
      ans,
      [
        { text: 'Parentheses first.', tex: `${c} - ${d} = ${c - d}`, why: 'Grouping symbols come first.' },
        { text: 'Exponent next.', tex: `(${c - d})^{2} = ${s}`, why: 'Squaring a negative number gives a positive number.' },
        { text: 'Multiply and divide from left to right.', tex: `${b} \\cdot ${s} \\div ${e} = ${b * s} \\div ${e} = ${(b * s) / e}`, why: 'Multiplication and division come before subtraction.' },
        { text: 'Subtract.', tex: `${a} - ${(b * s) / e} = ${ans}` },
      ],
      `Start inside the parentheses: $${c} - ${d}$ is negative.`,
      'Square that result. A negative number squared is positive.',
      `Multiply by ${b} and divide by ${e} before subtracting from ${a}.`,
      [
        { value: R((a - b) * s, e), tag: 'order-of-operations', feedback: `You subtracted ${a} - ${b} first. Multiplication and division come before subtraction.` },
        { value: R(a + (b * s) / e), tag: 'sign-error', feedback: `$(${c - d})^{2}$ is positive, because a negative times a negative is positive.` },
      ],
      ['multi-step'],
    );
  }
  if (k === 2) {
    for (;;) {
      const b = rng.int(2, 5);
      const c = rng.int(1, 6);
      const d = rng.int(1, 9);
      const e = rng.int(2, 5);
      const q = rng.nonzeroInt(-6, 6);
      const a = b * (c - d) - q * e;
      if (a <= 0 || a > 30) continue;
      const inner = -a + b * (c - d);
      const ans = inner / -e;
      return oooBuilt(
        `\\left[-${a} + ${b}(${c} - ${d})\\right] \\div (-${e})`,
        ans,
        [
          { text: 'Innermost parentheses first.', tex: `${c} - ${d} = ${c - d}`, why: 'Work from the inside of grouping symbols outward.' },
          { text: 'Inside the brackets, multiply and then add.', tex: `-${a} + ${b}(${c - d}) = -${a} + ${pi(b * (c - d))} = ${inner}`, why: 'Multiplication comes before addition inside the brackets too.' },
          { text: 'Divide.', tex: `${inner} \\div (-${e}) = ${ans}`, why: `${inner < 0 ? 'A negative divided by a negative is positive.' : 'A positive divided by a negative is negative.'}` },
        ],
        'Work from the inside out: parentheses, then the brackets, then the division.',
        `Inside the brackets, multiply $${b}(${c} - ${d})$ before adding $-${a}$.`,
        `The brackets simplify to a single number; divide it by $-${e}$.`,
        [
          { value: R(-ans), tag: 'sign-error', feedback: 'Check the sign of the final division. Count the negative numbers in it.' },
          { value: R((-a + b) * (c - d), -e), tag: 'order-of-operations', feedback: `Inside the brackets, multiply $${b}(${c} - ${d})$ before adding $-${a}$.` },
        ],
        ['multi-step'],
      );
    }
  }
  const b = rng.int(2, 6);
  const a = b * rng.nonzeroInt(-8, 8);
  const c = rng.int(2, 4);
  const d = rng.int(2, 4);
  const ans = (a / -b) * c - d * d;
  return oooBuilt(
    `${a} \\div (-${b}) \\cdot ${c} - ${d}^{2}`,
    ans,
    [
      { text: 'Exponent first.', tex: `${d}^{2} = ${d * d}`, why: 'Exponents come before multiplication, division and subtraction.' },
      { text: 'Divide and multiply from left to right.', tex: `${a} \\div (-${b}) \\cdot ${c} = ${a / -b} \\cdot ${c} = ${(a / -b) * c}`, why: 'Multiplication and division have equal rank, so go left to right.' },
      { text: 'Subtract.', tex: `${(a / -b) * c} - ${d * d} = ${ans}` },
    ],
    `Evaluate $${d}^{2}$ first.`,
    `Then go left to right: divide $${a}$ by $-${b}$ before multiplying by ${c}.`,
    'Subtract last, keeping track of signs.',
    [
      { value: R(a, -b * c).sub(R(d * d)), tag: 'order-of-operations', feedback: 'Multiplication and division are done left to right, so divide first here.' },
      { value: R((a / b) * c - d * d), tag: 'sign-error', feedback: `Check the sign of $${a} \\div (-${b})$.` },
    ],
    ['multi-step'],
  );
};

export const genPrereqOoo = makeGen(
  'p.ooo',
  'P.OOO',
  'Order of operations: evaluate numeric expressions with grouping symbols, exponents, left-to-right multiplication and division, fraction bars and negatives.',
  { 1: [oooBasic], 2: [oooMid], 3: [oooHard] },
  (pr) => verifyEvaluate(pr) ?? ['unrecognized prompt'],
);

// ---------------------------------------------------------------------------
// P.EVAL: evaluate algebraic expressions
// ---------------------------------------------------------------------------

function evalBuilt(exprTex: string, vals: Array<[string, Rational]>, ans: Rational, subTex: string, steps: SolutionStep[], h3: string, h4: string, wrong: MC[], formula?: string, tags: Problem['tags'] = []): Built {
  const assign = vals.map(([v, x]) => `$${v} = ${x.toTex()}$`).join(' and ');
  const text = formula ? `Use the formula $${formula} = ${exprTex}$ to find $${formula}$ when ${assign}.` : `Evaluate $${exprTex}$ when ${assign}.`;
  return {
    tags,
    prompt: [p(text)],
    answer: numAns(ans),
    inputHint: NUM_INPUT,
    hints: [
      'To evaluate, replace each variable with its value, then use the order of operations.',
      'Put each substituted value in parentheses, especially negative numbers, so the signs stay correct.',
      h3,
      h4,
    ],
    solution: [{ text: 'Substitute the values, using parentheses.', tex: subTex, why: 'Each letter stands for the number it is given; parentheses keep negative values and implied multiplication clear.' }, ...steps],
    mis: mis(ans, wrong),
  };
}

const evalBasic: Shape = (rng) => {
  const k = rng.int(0, 3);
  if (k === 0) {
    const a = rng.int(2, 9);
    const x = rng.int(2, 9);
    const b = rng.int(1, 12);
    const ans = a * x + b;
    return evalBuilt(
      `${a}x + ${b}`,
      [['x', R(x)]],
      R(ans),
      `${a}(${x}) + ${b}`,
      [{ text: 'Multiply, then add.', tex: `${a * x} + ${b} = ${ans}`, why: `$${a}x$ means ${a} times $x$.` }],
      `$${a}x$ means ${a} times $x$, not the digits ${a} and $x$ written side by side.`,
      `Multiply ${a} by ${x}, then add ${b}.`,
      [
        { value: R(Number(`${a}${x}`) + b), tag: 'other', feedback: `$${a}x$ means ${a} times $x$. Writing the digits side by side is not multiplying.` },
        { value: R(a + x + b), tag: 'other', feedback: `$${a}x$ means ${a} times $x$, so multiply instead of adding.` },
      ],
    );
  }
  if (k === 1) {
    const c1 = rng.int(2, 6);
    const c2 = rng.int(2, 6);
    const a = rng.int(1, 9);
    let b = rng.int(1, 9);
    if (b === a) b = a === 9 ? 8 : a + 1;
    const ans = c1 * a + c2 * b;
    return evalBuilt(
      `${c1}a + ${c2}b`,
      [
        ['a', R(a)],
        ['b', R(b)],
      ],
      R(ans),
      `${c1}(${a}) + ${c2}(${b})`,
      [{ text: 'Multiply, then add.', tex: `${c1 * a} + ${c2 * b} = ${ans}`, why: 'Multiplication comes before addition.' }],
      'Match each value to the right letter.',
      `Find ${c1} times $a$ and ${c2} times $b$, then add.`,
      [{ value: R(c1 * b + c2 * a), tag: 'other', feedback: 'Check which value goes with which letter: $a$ and $b$ have different values.' }],
    );
  }
  if (k === 2) {
    const x = rng.int(2, 9);
    const c = rng.int(1, 15);
    const ans = x * x + c;
    return evalBuilt(
      `x^{2} + ${c}`,
      [['x', R(x)]],
      R(ans),
      `(${x})^{2} + ${c}`,
      [{ text: 'Square, then add.', tex: `${x * x} + ${c} = ${ans}`, why: `$x^{2}$ means $x \\cdot x$.` }],
      `$x^{2}$ means $x$ times $x$, not $x$ times 2.`,
      `Square ${x}, then add ${c}.`,
      [{ value: R(2 * x + c), tag: 'exponent-rule', feedback: `$x^{2}$ means $x \\cdot x$, not $2 \\cdot x$.` }],
    );
  }
  if (rng.bool()) {
    const l = rng.int(3, 15);
    const w = rng.int(2, l - 1);
    const ans = 2 * l + 2 * w;
    return evalBuilt(
      `2l + 2w`,
      [
        ['l', R(l)],
        ['w', R(w)],
      ],
      R(ans),
      `2(${l}) + 2(${w})`,
      [{ text: 'Multiply, then add.', tex: `${2 * l} + ${2 * w} = ${ans}`, why: 'A rectangle has two lengths and two widths, which is what the formula adds up.' }],
      'The formula gives the perimeter of a rectangle.',
      `Double ${l}, double ${w}, then add.`,
      [
        { value: R(l * w), tag: 'formula-error', feedback: 'That is the area, length times width. Use the formula given: perimeter adds all four sides.' },
        { value: R(l + w), tag: 'formula-error', feedback: 'The formula doubles both the length and the width: the rectangle has two of each side.' },
      ],
      'P',
      ['real-world'],
    );
  }
  const b = 2 * rng.int(2, 9);
  const h = rng.int(3, 12);
  const ans = (b * h) / 2;
  return evalBuilt(
    `\\frac{1}{2}bh`,
    [
      ['b', R(b)],
      ['h', R(h)],
    ],
    R(ans),
    `\\frac{1}{2}(${b})(${h})`,
    [{ text: 'Multiply.', tex: `\\frac{1}{2} \\cdot ${b * h} = ${ans}`, why: 'A triangle is half of a rectangle with the same base and height.' }],
    'The formula gives the area of a triangle with base $b$ and height $h$.',
    `Multiply ${b} by ${h}, then take half.`,
    [{ value: R(b * h), tag: 'formula-error', feedback: 'Remember the $\\frac{1}{2}$ in the formula: a triangle is half of a rectangle.' }],
    'A',
    ['real-world'],
  );
};

const evalNeg: Shape = (rng) => {
  const k = rng.int(0, 3);
  if (k === 0) {
    const a = rng.int(2, 15);
    const b = rng.int(2, 9);
    const x = -rng.int(1, 9);
    const ans = a - b * x;
    return evalBuilt(
      `${a} - ${b}x`,
      [['x', R(x)]],
      R(ans),
      `${a} - ${b}(${x})`,
      [
        { text: 'Multiply.', tex: `${b}(${x}) = ${b * x}`, why: 'A positive times a negative is negative.' },
        { text: 'Subtract the negative, which means adding.', tex: `${a} - (${b * x}) = ${ans}`, why: 'Subtracting a negative is the same as adding its opposite.' },
      ],
      `Multiply ${b} by $${x}$ first. The product is negative.`,
      'Subtracting a negative number is the same as adding.',
      [{ value: R(a + b * x), tag: 'sign-error', feedback: `$x$ is negative, so $${b}x$ is negative, and subtracting a negative means adding.` }],
    );
  }
  if (k === 1) {
    const x = -rng.int(2, 6);
    const b = rng.int(2, 7);
    const ans = x * x - b * x;
    return evalBuilt(
      `x^{2} - ${b}x`,
      [['x', R(x)]],
      R(ans),
      `(${x})^{2} - ${b}(${x})`,
      [
        { text: 'Evaluate the power.', tex: `(${x})^{2} = ${x * x}`, why: 'A negative number times itself is positive.' },
        { text: 'Multiply.', tex: `${b}(${x}) = ${b * x}`, why: 'A positive times a negative is negative.' },
        { text: 'Subtract.', tex: `${x * x} - (${b * x}) = ${ans}`, why: 'Subtracting a negative is adding.' },
      ],
      `With the parentheses, $(${x})^{2}$ is a negative times a negative.`,
      `Find $(${x})^{2}$ and $${b}(${x})$ separately, then subtract.`,
      [
        { value: R(-x * x - b * x), tag: 'exponent-rule', feedback: `$(${x})^{2} = (${x})(${x})$, which is positive.` },
        { value: R(x * x + b * x), tag: 'sign-error', feedback: `$${b}x$ is negative here, and subtracting a negative means adding.` },
      ],
    );
  }
  if (k === 2) {
    for (;;) {
      const c = rng.pick([-5, -4, -3, -2, 2, 3, 4, 5]);
      const q = rng.nonzeroInt(-6, 6);
      const a = rng.int(-12, 12);
      const b = q * c - a;
      if (b === 0 || a === 0 || Math.abs(b) > 15) continue;
      return evalBuilt(
        `\\frac{a + b}{c}`,
        [
          ['a', R(a)],
          ['b', R(b)],
          ['c', R(c)],
        ],
        R(q),
        `\\frac{${a} + ${pi(b)}}{${c}}`,
        [
          { text: 'Simplify the numerator.', tex: `${a} + ${pi(b)} = ${a + b}`, why: 'The fraction bar groups the whole numerator.' },
          { text: 'Divide.', tex: `\\frac{${a + b}}{${c}} = ${q}`, why: 'Same signs give a positive quotient; different signs give a negative one.' },
        ],
        'The fraction bar means the whole sum $a + b$ is divided by $c$.',
        'Add first, then divide, and decide the sign of the quotient.',
        [
          { value: R(a).add(R(b, c)), tag: 'order-of-operations', feedback: 'The fraction bar divides the whole numerator. Add $a + b$ first.' },
          { value: R(-q), tag: 'sign-error', feedback: 'Check the sign of the quotient.' },
        ],
      );
    }
  }
  const a = rng.int(2, 6);
  const b = rng.int(1, 9);
  const x = -rng.int(1, 8);
  const ans = a * (x - b);
  return evalBuilt(
    `${a}(x - ${b})`,
    [['x', R(x)]],
    R(ans),
    `${a}(${x} - ${b})`,
    [
      { text: 'Parentheses first.', tex: `${x} - ${b} = ${x - b}`, why: 'Starting below 0 and subtracting moves further left.' },
      { text: 'Multiply.', tex: `${a}(${x - b}) = ${ans}`, why: 'A positive times a negative is negative.' },
    ],
    'Work inside the parentheses first.',
    `Find $${x} - ${b}$, then multiply by ${a}.`,
    [
      { value: R(a * x - b), tag: 'distribution', feedback: `${a} multiplies everything in the parentheses, including the ${b}.` },
      { value: R(a * (-x - b)), tag: 'sign-error', feedback: '$x$ is negative. Keep its sign when you substitute.' },
    ],
  );
};

const evalHard: Shape = (rng) => {
  const k = rng.int(0, 3);
  if (k === 0) {
    const x = -rng.int(2, 5);
    const y = rng.nonzeroInt(-6, 6);
    const b = rng.int(2, 5);
    const ans = -x * x + b * x * y;
    return evalBuilt(
      `-x^{2} + ${b}xy`,
      [
        ['x', R(x)],
        ['y', R(y)],
      ],
      R(ans),
      `-(${x})^{2} + ${b}(${x})(${y})`,
      [
        { text: 'Evaluate the power, then take its opposite.', tex: `-(${x})^{2} = -(${x * x}) = ${-x * x}`, why: `$-x^{2}$ means the opposite of $x^{2}$; the square is found first.` },
        { text: 'Multiply.', tex: `${b}(${x})(${y}) = ${b * x * y}`, why: 'Count the negative factors to get the sign.' },
        { text: 'Add.', tex: `${-x * x} + ${pi(b * x * y)} = ${ans}` },
      ],
      `$-x^{2}$ means the opposite of $x^{2}$. Square first: $(${x})^{2}$ is positive, so $-x^{2}$ is negative.`,
      `Then multiply $${b}(${x})(${y})$ and add the two parts.`,
      [
        { value: R(x * x + b * x * y), tag: 'exponent-rule', feedback: '$-x^{2}$ is the opposite of $x^{2}$. Square $x$ first, then take the opposite, so that part is negative.' },
        { value: R(-x * x - b * x * y), tag: 'sign-error', feedback: 'Check the sign of the product: count the negative factors.' },
      ],
      undefined,
      ['multi-step'],
    );
  }
  if (k === 1) {
    const dd = rng.pick([2, 3, 4, 5]);
    let n = rng.int(1, dd * 2);
    while (gcdN(n, dd) !== 1) n++;
    const x = R(-n, dd);
    const a = dd * rng.int(1, 4);
    const b = rng.nonzeroInt(-9, 9);
    const ans = x.mul(R(a)).add(R(b));
    return evalBuilt(
      linearTex(R(a), R(b)),
      [['x', x]],
      ans,
      `${a}\\left(${x.toTex()}\\right)${plusTex(R(b))}`,
      [
        { text: 'Multiply.', tex: `${a} \\cdot \\left(${x.toTex()}\\right) = ${x.mul(R(a)).toTex()}`, why: `Multiplying by $\\frac{${n}}{${dd}}$ means dividing by ${dd}${n > 1 ? ` and multiplying by ${n}` : ''}; a positive times a negative is negative.` },
        { text: b < 0 ? 'Subtract.' : 'Add.', tex: `${x.mul(R(a)).toTex()}${plusTex(R(b))} = ${ans.toTex()}` },
      ],
      `Multiply ${a} by $${x.toTex()}$: divide ${a} by ${dd} first to keep the numbers small.`,
      `The product is negative. Then ${b < 0 ? 'subtract' : 'add'} ${Math.abs(b)}.`,
      [{ value: x.neg().mul(R(a)).add(R(b)), tag: 'sign-error', feedback: '$x$ is negative, so the product is negative.' }],
    );
  }
  if (k === 2) {
    if (rng.bool()) {
      const j = -rng.int(1, 6);
      const F = 32 + 9 * j;
      const ans = 5 * j;
      return evalBuilt(
        `\\frac{5}{9}(F - 32)`,
        [['F', R(F)]],
        R(ans),
        `\\frac{5}{9}(${F} - 32)`,
        [
          { text: 'Parentheses first.', tex: `${F} - 32 = ${F - 32}`, why: 'The parentheses say to subtract before multiplying.' },
          { text: 'Multiply by $\\frac{5}{9}$.', tex: `\\frac{5}{9} \\cdot (${F - 32}) = ${ans}`, why: `${F - 32} divided by 9 is ${(F - 32) / 9}, and 5 times that is ${ans}.` },
        ],
        `Subtract 32 from ${F} first, because of the parentheses.`,
        'Then multiply by $\\frac{5}{9}$: divide by 9 and multiply by 5.',
        [
          { value: R(5 * F, 9).sub(R(32)), tag: 'order-of-operations', feedback: 'The parentheses mean subtract 32 first, then multiply by $\\frac{5}{9}$.' },
          { value: R(-ans), tag: 'sign-error', feedback: `${F} - 32 is negative, so the temperature in Celsius is negative.` },
        ],
        'C',
        ['real-world'],
      );
    }
    const j = -rng.int(1, 8);
    const C = 5 * j;
    const ans = 9 * j + 32;
    return evalBuilt(
      `\\frac{9}{5}C + 32`,
      [['C', R(C)]],
      R(ans),
      `\\frac{9}{5}(${C}) + 32`,
      [
        { text: 'Multiply first.', tex: `\\frac{9}{5}(${C}) = ${9 * j}`, why: `${C} divided by 5 is ${j}, and 9 times that is ${9 * j}. A positive times a negative is negative.` },
        { text: 'Add 32.', tex: `${9 * j} + 32 = ${ans}` },
      ],
      `Multiply $\\frac{9}{5}$ by ${C} first: divide by 5, then multiply by 9.`,
      'The product is negative. Add 32 last.',
      [
        { value: R(9 * (C + 32), 5), tag: 'order-of-operations', feedback: 'Multiplication comes before addition. Multiply by $\\frac{9}{5}$ first, then add 32.' },
        { value: R(-9 * j + 32), tag: 'sign-error', feedback: `$C$ is negative, so $\\frac{9}{5}C$ is negative.` },
      ],
      'F',
      ['real-world'],
    );
  }
  const x = rng.pick([-4, -3, -2]);
  const y = rng.nonzeroInt(-9, 9);
  const ans = R(x * x - y, 2 * x);
  const raw = `\\frac{${x * x - y}}{${2 * x}}`;
  return evalBuilt(
    `\\frac{x^{2} - y}{2x}`,
    [
      ['x', R(x)],
      ['y', R(y)],
    ],
    ans,
    `\\frac{(${x})^{2} - ${pi(y)}}{2(${x})}`,
    [
      { text: 'Simplify the numerator.', tex: `(${x})^{2} - ${pi(y)} = ${x * x} - ${pi(y)} = ${x * x - y}`, why: `A negative number squared is positive${y < 0 ? ', and subtracting a negative is adding' : ''}.` },
      { text: 'Simplify the denominator.', tex: `2(${x}) = ${2 * x}`, why: 'A positive times a negative is negative.' },
      { text: 'Divide and simplify.', tex: `${raw} = ${ans.toTex()}`, why: x * x - y > 0 ? 'A positive divided by a negative is negative. Write the result in lowest terms.' : 'A negative divided by a negative is positive. Write the result in lowest terms.' },
    ],
    'The fraction bar groups the whole numerator and the whole denominator.',
    `Work out the top and the bottom separately, then divide. $(${x})^{2}$ is positive.`,
    [
      { value: R(-x * x - y, 2 * x), tag: 'exponent-rule', feedback: 'A negative number squared is positive.' },
      { value: R(x * x + y, 2 * x), tag: 'sign-error', feedback: `Substitute $y$ with its sign: the numerator is $(${x})^{2} - ${pi(y)}$.` },
    ],
    undefined,
    ['multi-step'],
  );
};

function verifyEval(pr: Problem): string[] {
  const text = firstText(pr);
  const m = /^(?:Evaluate \$([^$]+)\$|Use the formula \$[A-Za-z] = ([^$]+)\$ to find \$[A-Za-z]\$) when (.+)\.$/.exec(text);
  if (!m) return ['unrecognized prompt'];
  const expr = texPlain(m[1] ?? m[2]);
  const vals = new Map<string, string>();
  for (const a of m[3].matchAll(/\$([a-zA-Z]) = ([^$]+)\$/g)) vals.set(a[1], texPlain(a[2]));
  // substitute every variable (in parentheses) and let the parser evaluate the result
  let bad = '';
  const subbed = expr.replace(/[a-zA-Z]+/g, (w) => {
    if (w === 'sqrt' || w === 'cbrt' || w === 'abs') return w;
    return w
      .split('')
      .map((c) => {
        const v = vals.get(c);
        if (v === undefined) bad = c;
        return `(${v})`;
      })
      .join('*');
  });
  if (bad) return [`no value given for ${bad}`];
  const v = exactValue(subbed);
  if (!v || !v.isRational()) return ['substituted expression is not a rational number'];
  return same(keyOf(pr), v.rationalPart(), 'substituted value');
}

export const genPrereqEval = makeGen(
  'p.eval',
  'P.EVAL',
  'Evaluate algebraic expressions and formulas by substitution, including negative and fractional values, -x^2, and fraction bars.',
  { 1: [evalBasic], 2: [evalNeg], 3: [evalHard] },
  verifyEval,
);

// ---------------------------------------------------------------------------
// P.DIST: distributive property and combining like terms
// ---------------------------------------------------------------------------

type Terms = Array<[Rational, string]>;
function distBuilt(exprTex: string, ans: Terms, steps: SolutionStep[], h2: string, h3: string, h4: string, wrong: Array<{ terms: Terms; tag: MisconceptionTag; feedback: string }>, tags: Problem['tags'] = []): Built {
  const key = termsOut(ans, false);
  const vars = ans.some(([, v]) => v === 'y') ? ['x', 'y'] : ['x'];
  return {
    tags,
    prompt: [p(`Simplify $${exprTex}$. Write your answer with no parentheses and with like terms combined.`)],
    answer: { kind: 'expression', value: key, form: 'expanded', variables: vars },
    inputHint: vars.length === 2 ? 'Type an expression like 3x - 2y + 5.' : 'Type an expression like 3x - 7.',
    hints: [
      exprTex.includes('(')
        ? 'The distributive property: $a(b + c) = ab + ac$. The number in front multiplies every term inside.'
        : 'There are no parentheses here, so simplifying means combining like terms: add up the terms that have the same variable part.',
      h2,
      h3,
      h4,
    ],
    solution: steps,
    mis: stringMisconceptions(
      key,
      wrong.map((w) => ({ answer: termsOut(w.terms, false), tag: w.tag, feedback: w.feedback })),
    ),
  };
}
const T = (c: number | Rational, v = ''): [Rational, string] => [typeof c === 'number' ? R(c) : c, v];

const distBasic: Shape = (rng) => {
  const k = rng.int(0, 2);
  if (k === 0) {
    const a = rng.int(2, 9);
    const b = rng.int(1, 5);
    const c = rng.nonzeroInt(-9, 9);
    const inner = linearTex(R(b), R(c));
    const ans: Terms = [T(a * b, 'x'), T(a * c)];
    return distBuilt(
      `${a}(${inner})`,
      ans,
      [{ text: `Multiply each term inside the parentheses by ${a}.`, tex: `${a}(${inner}) = ${a}\\cdot ${b === 1 ? 'x' : `${b}x`} ${c < 0 ? '-' : '+'} ${a} \\cdot ${Math.abs(c)} = ${termsOut(ans, true)}`, why: `${a} groups of $(${inner})$ contain ${a} copies of every term inside.` }],
      `Multiply ${a} by the $x$ term.`,
      `Then multiply ${a} by the constant term, keeping its sign.`,
      'Write the two products as one expression.',
      [{ terms: [T(a * b, 'x'), T(c)], tag: 'distribution', feedback: `${a} multiplies every term in the parentheses, including the constant.` }],
    );
  }
  const p1 = rng.int(1, 9);
  let r1 = rng.int(-6, 9) || 2;
  if (r1 === -p1) r1 = p1 + 1;
  const q = rng.nonzeroInt(-9, 12);
  const s = rng.nonzeroInt(-9, 9);
  const ans: Terms = [T(p1 + r1, 'x'), T(q + s)];
  const exprT = termsOut([T(p1, 'x'), T(q), T(r1, 'x'), T(s)], true);
  const allCombined: Terms = [T(p1 + r1 + q + s, 'x')];
  return distBuilt(
    exprT,
    ans,
    [
      { text: 'Group the like terms.', tex: `(${termsOut([T(p1, 'x'), T(r1, 'x')], true)}) + (${termsOut([T(q), T(s)], true)})`, why: 'Like terms have the same variable part, so they count the same kind of thing and can be added.' },
      { text: 'Combine.', tex: `${exprT} = ${termsOut(ans, true)}`, why: `${p1} + ${pi(r1)} = ${p1 + r1} for the $x$ terms and ${q} + ${pi(s)} = ${q + s} for the constants.` },
    ],
    'Like terms have exactly the same variable part. Numbers alone are like terms with each other.',
    'Add the coefficients of the $x$ terms, keeping each sign with the term after it.',
    'Then combine the constant terms. An $x$ term and a constant cannot be combined.',
    [{ terms: allCombined, tag: 'unlike-terms', feedback: 'Only like terms can be combined. An $x$ term and a plain number are not like terms.' }],
  );
};

const distMid: Shape = (rng) => {
  const k = rng.int(0, 2);
  if (k === 0) {
    const a = -rng.int(2, 7);
    const b = rng.int(1, 5);
    const c = rng.nonzeroInt(-9, 9);
    const inner = linearTex(R(b), R(c));
    const ans: Terms = [T(a * b, 'x'), T(a * c)];
    return distBuilt(
      `${a}(${inner})`,
      ans,
      [{ text: `Multiply each term inside by $${a}$.`, tex: `${a}(${inner}) = (${a})(${b === 1 ? 'x' : `${b}x`}) + (${a})(${c}) = ${termsOut(ans, true)}`, why: 'The negative number multiplies every term, so it changes the sign of every term inside.' }],
      `Multiply $${a}$ by the $x$ term.`,
      `Multiply $${a}$ by $${c}$ too. Use the sign rules: ${c < 0 ? 'a negative times a negative is positive' : 'a negative times a positive is negative'}.`,
      'Every term inside changes sign when you multiply by a negative.',
      [
        { terms: [T(a * b, 'x'), T(c)], tag: 'distribution', feedback: `$${a}$ multiplies every term in the parentheses, including the constant.` },
        { terms: [T(a * b, 'x'), T(-a * c)], tag: 'sign-error', feedback: `Check the sign of $(${a})(${c})$.` },
      ],
    );
  }
  if (k === 1) {
    const a = rng.int(2, 6);
    const b = rng.nonzeroInt(-8, 8);
    let c = rng.nonzeroInt(-6, 6);
    while (a + c === 0) c = rng.nonzeroInt(-6, 6);
    const ans: Terms = [T(a + c, 'x'), T(a * b)];
    const exprT = `${a}(${linearTex(R(1), R(b))}) ${c < 0 ? '-' : '+'} ${Math.abs(c) === 1 ? '' : Math.abs(c)}x`;
    return distBuilt(
      exprT,
      ans,
      [
        { text: 'Distribute.', tex: `${a}(${linearTex(R(1), R(b))}) = ${termsOut([T(a, 'x'), T(a * b)], true)}`, why: `${a} multiplies both terms inside the parentheses.` },
        { text: 'Combine like terms.', tex: `${termsOut([T(a, 'x'), T(a * b), T(c, 'x')], true)} = ${termsOut(ans, true)}`, why: 'The two $x$ terms are like terms, so add their coefficients.' },
      ],
      'Distribute first, then look for like terms.',
      `Multiply ${a} by both $x$ and $${b}$.`,
      'Combine the $x$ terms. The constant stays by itself.',
      [
        { terms: [T(a + c, 'x'), T(b)], tag: 'distribution', feedback: `${a} multiplies every term inside the parentheses, including the constant.` },
        { terms: [T(a + c + a * b, 'x')], tag: 'unlike-terms', feedback: 'An $x$ term and a constant are not like terms, so they cannot be combined.' },
      ],
    );
  }
  const d = rng.int(3, 15);
  const a = rng.int(2, 6);
  const b = rng.int(1, 8);
  const ans: Terms = [T(-a, 'x'), T(d - a * b)];
  return distBuilt(
    `${d} - ${a}(x + ${b})`,
    ans,
    [
      { text: `Distribute $-${a}$ (the subtraction belongs to the ${a}).`, tex: `${d} - ${a}(x + ${b}) = ${d} - ${a}x - ${a * b}`, why: `Subtracting ${a} groups of $(x + ${b})$ means subtracting ${a}x and subtracting ${a * b}.` },
      { text: 'Combine the constants.', tex: `${d} - ${a * b} - ${a}x = ${termsOut(ans, true)}`, why: 'The constants are like terms; the $x$ term stays separate.' },
    ],
    `The ${a} is multiplied first; you cannot subtract ${d} - ${a} first, because multiplication comes before subtraction.`,
    `Think of it as ${d} + (-${a})(x + ${b}), and multiply $-${a}$ by each term inside.`,
    'Then combine the constant terms.',
    [
      { terms: [T(-a, 'x'), T(d + a * b)], tag: 'sign-error', feedback: `The minus sign goes with the ${a}, so $-${a}$ multiplies both $x$ and ${b}. Check the sign of the constant term.` },
      { terms: [T(d - a, 'x'), T((d - a) * b)], tag: 'order-of-operations', feedback: `Multiplication comes before subtraction, so you cannot work out ${d} - ${a} first.` },
      { terms: [T(-a, 'x'), T(d + b)], tag: 'distribution', feedback: `$-${a}$ multiplies every term in the parentheses, including the ${b}.` },
    ],
  );
};

const distHard: Shape = (rng) => {
  const k = rng.int(0, 3);
  if (k === 0) {
    for (;;) {
      const a = rng.int(2, 5);
      const b = rng.int(1, 4);
      const c = rng.nonzeroInt(-6, 6);
      const d = rng.int(2, 5);
      const e = rng.int(1, 4);
      const f = rng.nonzeroInt(-6, 6);
      const cx = a * b - d * e;
      const cc = a * c - d * f;
      if (cx === 0 || cc === 0) continue;
      const ans: Terms = [T(cx, 'x'), T(cc)];
      const exprT = `${a}(${linearTex(R(b), R(c))}) - ${d}(${linearTex(R(e), R(f))})`;
      const expanded = termsOut([T(a * b, 'x'), T(a * c), T(-d * e, 'x'), T(-d * f)], true);
      return distBuilt(
        exprT,
        ans,
        [
          { text: `Distribute ${a} and $-${d}$.`, tex: `${exprT} = ${expanded}`, why: `The subtraction belongs to the ${d}, so $-${d}$ multiplies every term in the second parentheses.` },
          { text: 'Combine like terms.', tex: `${expanded} = ${termsOut(ans, true)}`, why: `${a * b} - ${d * e} = ${cx} for the $x$ terms and ${a * c} ${-d * f < 0 ? '-' : '+'} ${Math.abs(d * f)} = ${cc} for the constants.` },
        ],
        `Distribute ${a} into the first parentheses.`,
        `Distribute $-${d}$ into the second parentheses: it changes the sign of both terms inside.`,
        'Combine the $x$ terms and the constants separately.',
        [
          { terms: [T(cx, 'x'), T(a * c + f)], tag: 'distribution', feedback: `$-${d}$ multiplies every term in the second parentheses, including the constant.` },
          { terms: [T(cx, 'x'), T(a * c + d * f)], tag: 'sign-error', feedback: `Check the sign of $(-${d})(${f})$: the last constant changes sign too.` },
          { terms: [T(a * b + d * e, 'x'), T(a * c + d * f)], tag: 'sign-error', feedback: `The subtraction sign belongs to the ${d}. Multiply by $-${d}$, not ${d}.` },
        ],
        ['multi-step'],
      );
    }
  }
  if (k === 1) {
    const kk = rng.pick([2, 3, 4]);
    const b = kk * rng.int(1, 3);
    const c = kk * rng.nonzeroInt(-3, 3);
    const e = rng.nonzeroInt(-5, 5);
    const m = R(-1, kk);
    const cx = m.mul(R(b)).add(R(e));
    const cc = m.mul(R(c));
    if (cx.isZero()) return distHard(rng);
    const ans: Terms = [T(cx, 'x'), T(cc)];
    const exprT = `-\\frac{1}{${kk}}(${linearTex(R(b), R(c))}) ${e < 0 ? '-' : '+'} ${Math.abs(e) === 1 ? '' : Math.abs(e)}x`;
    return distBuilt(
      exprT,
      ans,
      [
        { text: `Multiply each term inside by $-\\frac{1}{${kk}}$.`, tex: `-\\frac{1}{${kk}}(${linearTex(R(b), R(c))}) = ${termsOut([T(-b / kk, 'x'), T(-c / kk)], true)}`, why: `Multiplying by $\\frac{1}{${kk}}$ divides by ${kk}, and the negative changes every sign.` },
        { text: 'Combine like terms.', tex: `${termsOut([T(-b / kk, 'x'), T(-c / kk), T(e, 'x')], true)} = ${termsOut(ans, true)}`, why: 'Add the coefficients of the $x$ terms; the constant stays.' },
      ],
      `Multiplying by $\\frac{1}{${kk}}$ is the same as dividing by ${kk}.`,
      'The factor is negative, so it changes the sign of every term inside.',
      'Then combine the two $x$ terms.',
      [
        { terms: [T(R(b, kk).add(R(e)), 'x'), T(R(c, kk))], tag: 'sign-error', feedback: 'The number in front is negative, so every term inside changes sign.' },
        { terms: [T(cx, 'x'), T(R(c))], tag: 'distribution', feedback: 'Multiply every term inside the parentheses, including the constant.' },
      ],
      ['multi-step'],
    );
  }
  if (k === 2) {
    const a = rng.int(2, 6);
    const b = rng.int(1, 4);
    const c = rng.nonzeroInt(-7, 7);
    const d = rng.int(1, 5);
    const e = rng.nonzeroInt(-8, 8);
    const cx = a * b - d;
    const cc = a * c - e;
    if (cx === 0 || cc === 0) return distHard(rng);
    const ans: Terms = [T(cx, 'x'), T(cc)];
    const inner2 = linearTex(R(d), R(e));
    const exprT = `${a}(${linearTex(R(b), R(c))}) - (${inner2})`;
    const expanded = termsOut([T(a * b, 'x'), T(a * c), T(-d, 'x'), T(-e)], true);
    return distBuilt(
      exprT,
      ans,
      [
        { text: `Distribute ${a}, and distribute the minus sign as $-1$.`, tex: `${exprT} = ${expanded}`, why: 'Subtracting a group means subtracting every term in it: $-(p + q) = -p - q$.' },
        { text: 'Combine like terms.', tex: `${expanded} = ${termsOut(ans, true)}`, why: 'Combine the $x$ terms and the constants separately.' },
      ],
      'A minus sign in front of parentheses means multiply every term inside by $-1$.',
      `Distribute ${a} into the first parentheses and $-1$ into the second.`,
      'Combine the $x$ terms and the constants separately.',
      [{ terms: [T(cx, 'x'), T(a * c + e)], tag: 'distribution', feedback: 'The minus sign applies to every term in the second parentheses, not just the first one.' }],
      ['multi-step'],
    );
  }
  for (;;) {
    const a = rng.int(2, 5);
    const pp = rng.nonzeroInt(-4, 4);
    const c = rng.int(2, 4);
    const q = rng.int(1, 3);
    const r = rng.nonzeroInt(-4, 4);
    const cx = a - c * q;
    const cy = a * pp - c * r;
    if (cx === 0 || cy === 0) continue;
    const ans: Terms = [T(cx, 'x'), T(cy, 'y')];
    const g1 = termsOut([T(1, 'x'), T(pp, 'y')], true);
    const g2 = termsOut([T(q, 'x'), T(r, 'y')], true);
    const exprT = `${a}(${g1}) - ${c}(${g2})`;
    const expanded = termsOut([T(a, 'x'), T(a * pp, 'y'), T(-c * q, 'x'), T(-c * r, 'y')], true);
    return distBuilt(
      exprT,
      ans,
      [
        { text: `Distribute ${a} and $-${c}$.`, tex: `${exprT} = ${expanded}`, why: `$-${c}$ multiplies both terms in the second parentheses.` },
        { text: 'Combine like terms.', tex: `${expanded} = ${termsOut(ans, true)}`, why: '$x$ terms combine with $x$ terms and $y$ terms with $y$ terms; $x$ and $y$ terms are not like terms.' },
      ],
      `Distribute ${a} into the first parentheses.`,
      `Distribute $-${c}$ into the second parentheses, changing both signs.`,
      'Combine the $x$ terms together and the $y$ terms together.',
      [
        { terms: [T(cx, 'x'), T(a * pp + r, 'y')], tag: 'distribution', feedback: `$-${c}$ multiplies every term in the second parentheses, including the $y$ term.` },
        { terms: [T(cx, 'x'), T(a * pp + c * r, 'y')], tag: 'sign-error', feedback: `Check the sign of the $y$ term from the second parentheses: $-${c}$ times $${termsOut([T(r, 'y')], true)}$.` },
        { terms: [T(cx + cy, 'x')], tag: 'unlike-terms', feedback: '$x$ terms and $y$ terms are not like terms, so they stay separate.' },
      ],
      ['multi-step'],
    );
  }
};

function verifyDist(pr: Problem): string[] {
  const m = /^Simplify \$([^$]+)\$\./.exec(firstText(pr));
  if (!m || pr.answer.kind !== 'expression') return ['unrecognized prompt'];
  const given = toPoly(parseExpression(texPlain(m[1])));
  const keyNode = parseExpression(pr.answer.value);
  const errs: string[] = [];
  if (!toPoly(keyNode).sub(given).isZero()) errs.push('key is not equivalent to the given expression');
  if (!isExpandedForm(keyNode)) errs.push('key is not fully simplified');
  return errs;
}

export const genPrereqDist = makeGen(
  'p.dist',
  'P.DIST',
  'Use the distributive property (including negative and fractional factors and subtracted groups) and combine like terms.',
  { 1: [distBasic], 2: [distMid], 3: [distHard] },
  verifyDist,
);

// ---------------------------------------------------------------------------
// P.SOLVE1 and P.INEQ1: linear equations and inequalities in one variable
// ---------------------------------------------------------------------------

/** A linear equation or inequality: shown as lhs op rhs; after expanding, m1 x + b1 op m2 x + b2. */
interface LinCase {
  lhs: string;
  rhs: string;
  m1: Rational;
  b1: Rational;
  m2: Rational;
  b2: Rational;
  /** how the first step starts */
  first: 'none' | 'constant' | 'collect' | 'distribute' | 'fraction';
  /** misconception: an alternate (wrongly expanded) equation, as [m1, b1, m2, b2] */
  wrongExpansions?: Array<{ e: [Rational, Rational, Rational, Rational]; tag: MisconceptionTag; feedback: string }>;
}
const solveLin = (m1: Rational, b1: Rational, m2: Rational, b2: Rational): Rational | null => (m1.eq(m2) ? null : b2.sub(b1).div(m1.sub(m2)));
const expandedTex = (c: LinCase, rel: string) => `${linearTex(c.m1, c.b1)} ${rel} ${linearTex(c.m2, c.b2)}`;

function firstHint(c: LinCase): string {
  switch (c.first) {
    case 'distribute':
      return 'Start by distributing to clear the parentheses. The number in front multiplies every term inside.';
    case 'collect':
      return 'There are $x$ terms on both sides. Add or subtract an $x$ term on both sides so $x$ appears on one side only.';
    case 'constant':
      return 'Undo the addition or subtraction first: add or subtract the same number on both sides.';
    case 'fraction':
      return 'Undo the constant term first, then deal with the fraction multiplying $x$ by multiplying by its reciprocal.';
    default:
      return 'Undo what is being done to $x$ with the opposite operation, on both sides.';
  }
}

function linSteps(c: LinCase, rel: string, flipTex: string | null): SolutionStep[] {
  const M = c.m1.sub(c.m2);
  const C = c.b2.sub(c.b1);
  const k = C.div(M);
  const steps: SolutionStep[] = [];
  if (c.first === 'distribute') steps.push({ text: 'Distribute to clear the parentheses.', tex: expandedTex(c, rel), why: 'The number in front of the parentheses multiplies every term inside.' });
  if (!c.m2.isZero() || !c.b1.isZero()) {
    const parts: string[] = [];
    if (!c.m2.isZero()) parts.push(`${c.m2.isNegative() ? 'add' : 'subtract'} $${linearTex(c.m2.abs(), R(0))}$`);
    if (!c.b1.isZero()) parts.push(`${c.b1.isNegative() ? 'add' : 'subtract'} $${c.b1.abs().toTex()}$`);
    const text = parts.join(' and ') + ' on both sides.';
    steps.push({ text: text[0].toUpperCase() + text.slice(1), tex: `${linearTex(M, R(0))} ${rel} ${C.toTex()}`, why: 'Adding or subtracting the same amount on both sides keeps the two sides balanced.' });
  }
  if (!M.eq(1)) {
    const how = M.isInteger() ? `Divide both sides by $${M.toTex()}$.` : `Multiply both sides by $${M.inv().toTex()}$, the reciprocal of $${M.toTex()}$.`;
    steps.push({ text: how + (flipTex ? (M.isNegative() ? ' The number is **negative**, so **flip the inequality symbol**.' : ' The number is positive, so the symbol stays the same.') : ''), tex: `x ${flipTex ?? '='} ${k.toTex()}`, why: flipTex && M.isNegative() ? 'Multiplying or dividing by a negative reverses the order of numbers: $2 < 5$ but $-2 > -5$. Flipping the symbol keeps the statement true.' : 'Undo the multiplication on $x$ with the opposite operation, on both sides.' });
  }
  return steps;
}

function solveBuilt(c: LinCase, opts: { prompt?: Block[]; setup?: SolutionStep; tags?: Problem['tags'] } = {}): Built {
  const k = solveLin(c.m1, c.b1, c.m2, c.b2)!;
  const M = c.m1.sub(c.m2);
  const eq = `${c.lhs} = ${c.rhs}`;
  const L = c.m1.mul(k).add(c.b1);
  const wrong: MC[] = [
    ...(c.wrongExpansions ?? []).map((w) => ({ value: solveLin(...w.e), tag: w.tag, feedback: w.feedback })),
    { value: k.neg(), tag: 'sign-error' as const, feedback: 'Check the sign of your answer by substituting it into the original equation: the two sides should be equal.' },
  ];
  return {
    tags: opts.tags ?? (c.first === 'distribute' || c.first === 'collect' ? ['multi-step'] : []),
    prompt: opts.prompt ?? [p(`Solve $${eq}$.`)],
    answer: numAns(k),
    inputHint: 'Type the value of x, like 5 or -3/2 (x = 5 is fine too).',
    hints: [
      'Solving means undoing what was done to $x$ while keeping both sides balanced: whatever you do to one side, do to the other.',
      firstHint(c),
      M.eq(1) ? 'Once the $x$ term is alone on one side, its coefficient is 1, so you are done after moving the numbers.' : `When the $x$ terms are together on one side, the number multiplying $x$ is $${M.toTex()}$.`,
      M.eq(1) ? 'Check by substituting your answer into the original equation.' : `${M.isInteger() ? `Divide both sides by $${M.toTex()}$` : `Multiply both sides by $${M.inv().toTex()}$`}, then check by substituting into the original equation.`,
    ],
    solution: [
      ...(opts.setup ? [opts.setup] : []),
      ...linSteps(c, '=', null),
      { text: `Check: substitute $x = ${k.toTex()}$ into the original equation.`, tex: `\\text{left side} = ${L.toTex()},\\ \\text{right side} = ${c.m2.mul(k).add(c.b2).toTex()}\\ \\checkmark`, why: 'A solution makes both sides equal, so substituting it back confirms the answer.' },
    ],
    mis: mis(k, wrong),
  };
}

const sgnTex = (b: number) => (b < 0 ? ` - ${-b}` : ` + ${b}`);
const lin = (m: number | Rational, b: number | Rational) => linearTex(typeof m === 'number' ? R(m) : m, typeof b === 'number' ? R(b) : b);

/** Cases for d1, d2 and d3. k is the solution (equations) or boundary (inequalities). */
function linCase(rng: Rng, d: Difficulty, ineq: boolean): LinCase {
  if (d === 1) {
    const s = rng.int(0, 3);
    const k = rng.nonzeroInt(-10, 12);
    if (s === 0) {
      const b = rng.nonzeroInt(-12, 12);
      return { lhs: lin(1, b), rhs: `${k + b}`, m1: R(1), b1: R(b), m2: R(0), b2: R(k + b), first: 'constant', wrongExpansions: [{ e: [R(1), R(-b), R(0), R(k + b)], tag: 'inverse-operation', feedback: 'Undo the constant with the opposite operation: if a number is added to $x$, subtract it from both sides; if it is subtracted, add it.' }] };
    }
    if (s === 1) {
      const a = ineq ? rng.int(2, 9) : rng.pick([-9, -8, -7, -6, -5, -4, -3, -2, 2, 3, 4, 5, 6, 7, 8, 9]);
      return { lhs: lin(a, 0), rhs: `${a * k}`, m1: R(a), b1: R(0), m2: R(0), b2: R(a * k), first: 'none', wrongExpansions: [{ e: [R(1), R(a), R(0), R(a * k)], tag: 'inverse-operation', feedback: `$${a}x$ means ${a} times $x$, so undo it by dividing, not by subtracting.` }] };
    }
    if (s === 2) {
      const a = rng.int(2, 8);
      const c = rng.nonzeroInt(-9, 9);
      return { lhs: `\\frac{x}{${a}}`, rhs: `${c}`, m1: R(1, a), b1: R(0), m2: R(0), b2: R(c), first: 'none', wrongExpansions: [{ e: [R(a), R(0), R(0), R(c)], tag: 'inverse-operation', feedback: `$x$ is divided by ${a}, so undo it by multiplying both sides by ${a}.` }] };
    }
    const a = rng.int(2, 9);
    const b = rng.nonzeroInt(-12, 12);
    return { lhs: lin(a, b), rhs: `${a * k + b}`, m1: R(a), b1: R(b), m2: R(0), b2: R(a * k + b), first: 'constant', wrongExpansions: [{ e: [R(a), R(-b), R(0), R(a * k + b)], tag: 'inverse-operation', feedback: 'Undo the constant with the opposite operation on both sides.' }] };
  }
  if (d === 2) {
    const s = rng.int(0, 3);
    const k = rng.nonzeroInt(-9, 9);
    if (s === 0) {
      const a = -rng.int(2, 9);
      const b = rng.nonzeroInt(-15, 15);
      if (rng.bool()) return { lhs: `${b} - ${-a === 1 ? '' : -a}x`, rhs: `${a * k + b}`, m1: R(a), b1: R(b), m2: R(0), b2: R(a * k + b), first: 'constant', wrongExpansions: [{ e: [R(-a), R(b), R(0), R(a * k + b)], tag: 'sign-error', feedback: `The $x$ term is $-${-a}x$: the minus sign belongs to it.` }] };
      return { lhs: lin(a, b), rhs: `${a * k + b}`, m1: R(a), b1: R(b), m2: R(0), b2: R(a * k + b), first: 'constant', wrongExpansions: [{ e: [R(a), R(-b), R(0), R(a * k + b)], tag: 'inverse-operation', feedback: 'Undo the constant with the opposite operation on both sides.' }] };
    }
    if (s === 1) {
      for (;;) {
        const a = rng.nonzeroInt(-8, 9);
        const c = rng.nonzeroInt(-8, 9);
        if (a === c) continue;
        if (ineq && a - c > 0 && rng.next() < 0.5) continue;
        const b = rng.nonzeroInt(-12, 12);
        const e = (a - c) * k + b;
        if (e === 0) continue;
        return { lhs: lin(a, b), rhs: lin(c, e), m1: R(a), b1: R(b), m2: R(c), b2: R(e), first: 'collect', wrongExpansions: [{ e: [R(a), R(b), R(-c), R(e)], tag: 'inverse-operation', feedback: 'To move an $x$ term to the other side, do the opposite operation on both sides: subtract it if it is added.' }] };
      }
    }
    if (s === 2) {
      const a = ineq ? -rng.int(2, 6) : rng.pick([-6, -5, -4, -3, -2, 2, 3, 4, 5, 6]);
      const b = rng.nonzeroInt(-7, 7);
      const c = a * (k + b);
      return { lhs: `${a}(${lin(1, b)})`, rhs: `${c}`, m1: R(a), b1: R(a * b), m2: R(0), b2: R(c), first: 'distribute', wrongExpansions: [{ e: [R(a), R(b), R(0), R(c)], tag: 'distribution', feedback: `${a} multiplies every term in the parentheses, including the ${b}.` }] };
    }
    const a = rng.int(2, 6);
    const neg = ineq && rng.bool();
    const b = rng.nonzeroInt(-9, 9);
    const kk = a * rng.nonzeroInt(-5, 5);
    const c = (neg ? -kk / a : kk / a) + b;
    return { lhs: `${neg ? '-' : ''}\\frac{x}{${a}}${sgnTex(b)}`, rhs: `${c}`, m1: R(neg ? -1 : 1, a), b1: R(b), m2: R(0), b2: R(c), first: 'fraction', wrongExpansions: [{ e: [R(neg ? -a : a), R(b), R(0), R(c)], tag: 'inverse-operation', feedback: `$x$ is divided by ${a}, so undo it by multiplying by ${a}, not dividing.` }] };
  }
  const s = rng.int(0, 3);
  if (s === 0) {
    for (;;) {
      const k = rng.nonzeroInt(-8, 8);
      const a = rng.pick([-5, -4, -3, -2, 2, 3, 4, 5]);
      const c = rng.pick([-5, -4, -3, -2, 2, 3, 4, 5]);
      if (a === c || (ineq && a - c > 0 && rng.bool())) continue;
      const b = rng.nonzeroInt(-6, 6);
      const num = a * (k - b) - c * k;
      if (num % c !== 0) continue;
      const dd = num / c;
      if (dd === 0 || dd === -b || Math.abs(dd) > 12) continue;
      return { lhs: `${a}(${lin(1, -b)})`, rhs: `${c}(${lin(1, dd)})`, m1: R(a), b1: R(-a * b), m2: R(c), b2: R(c * dd), first: 'distribute', wrongExpansions: [{ e: [R(a), R(-b), R(c), R(dd)], tag: 'distribution', feedback: 'The number in front of each set of parentheses multiplies every term inside, including the constant.' }] };
    }
  }
  if (s === 1) {
    for (;;) {
      const k = rng.nonzeroInt(-8, 8);
      const a = rng.pick([-4, -3, -2, 2, 3, 4]);
      const b = rng.int(1, 3);
      const c = rng.nonzeroInt(-6, 6);
      const dd = rng.int(1, 9);
      const e = rng.nonzeroInt(-6, 6);
      const M = a * b - e;
      if (M === 0 || (ineq && M > 0 && rng.bool())) continue;
      const f = a * b * k + a * c - dd - e * k;
      if (Math.abs(f) > 40 || f === 0) continue;
      return { lhs: `${a}(${lin(b, c)}) - ${dd}`, rhs: lin(e, f), m1: R(a * b), b1: R(a * c - dd), m2: R(e), b2: R(f), first: 'distribute', wrongExpansions: [{ e: [R(a * b), R(c - dd), R(e), R(f)], tag: 'distribution', feedback: `${a} multiplies every term in the parentheses, including the ${c}.` }] };
    }
  }
  if (s === 2) {
    const q = rng.int(2, 5);
    let pp = rng.int(1, q + 3);
    while (gcdN(pp, q) !== 1 || pp === q) pp++;
    const sign = ineq ? -1 : rng.bool() ? 1 : -1;
    const j = rng.nonzeroInt(-5, 5);
    const k = q * j;
    const b = rng.nonzeroInt(-9, 9);
    const m = R(sign * pp, q);
    const c = m.mul(R(k)).add(R(b));
    return { lhs: linearTex(m, R(b)), rhs: c.toTex(), m1: m, b1: R(b), m2: R(0), b2: c, first: 'fraction', wrongExpansions: [{ e: [m.inv(), R(b), R(0), c], tag: 'inverse-operation', feedback: `To undo multiplying by $${m.toTex()}$, multiply by its reciprocal $${m.inv().toTex()}$, not by $${m.toTex()}$ itself.` }] };
  }
  // fractional solution (equations) or a negative collected coefficient (inequalities)
  for (;;) {
    const a = rng.nonzeroInt(-8, 9);
    const c = rng.nonzeroInt(-8, 9);
    const M = a - c;
    if (Math.abs(M) < 2 || (ineq && M > 0)) continue;
    const n = rng.nonzeroInt(-20, 20);
    if (!ineq && n % M === 0) continue;
    if (ineq && n % M !== 0 && rng.bool()) continue;
    const b = rng.nonzeroInt(-12, 12);
    const e = b + n;
    if (e === 0) continue;
    return { lhs: lin(a, b), rhs: lin(c, e), m1: R(a), b1: R(b), m2: R(c), b2: R(e), first: 'collect', wrongExpansions: [{ e: [R(a), R(b), R(-c), R(e)], tag: 'inverse-operation', feedback: 'To move an $x$ term across, subtract it from both sides if it is added (or add it if it is subtracted).' }] };
  }
}

const solveShape =
  (d: Difficulty): Shape =>
  (rng) =>
    solveBuilt(linCase(rng, d, false));

const solveGym: Shape = (rng) => {
  const F = 5 * rng.int(2, 10);
  const r = 5 * rng.int(2, 8);
  const mth = rng.int(3, 14);
  const T = F + r * mth;
  const c: LinCase = { lhs: `${F} + ${r}x`, rhs: `${T}`, m1: R(r), b1: R(F), m2: R(0), b2: R(T), first: 'constant', wrongExpansions: [{ e: [R(r), R(-F), R(0), R(T)], tag: 'inverse-operation', feedback: 'The joining fee is part of the total, so subtract it before dividing.' }] };
  const b = solveBuilt(c, {
    tags: ['word', 'real-world'],
    prompt: [p(`A gym charges a one-time ${money(F)} joining fee plus ${money(r)} per month. Maya has paid ${money(T)} in total so far. How many months has she been a member?`)],
    setup: { text: 'Write an equation. Let $x$ be the number of months.', tex: `${F} + ${r}x = ${T}`, why: `The total is the fee plus ${r} dollars for each month.` },
  });
  // the later hints talk about $x$, so the first hint introduces it
  const hints: Hints = [`Let $x$ be the number of months. The total paid is the ${money(F)} joining fee plus ${money(r)} for each of the $x$ months, so write an equation that sets this equal to ${money(T)}.`, b.hints[1], b.hints[2], b.hints[3]];
  return { ...b, hints, inputHint: 'Type the number of months.', mis: mis(R(mth), [{ value: R(T + F, r), tag: 'inverse-operation', feedback: 'The joining fee is already included in the total. Subtract it, then divide by the monthly cost.' }, { value: R(T, r), tag: 'equation-setup', feedback: 'Part of the total paid is the one-time joining fee. Take it out before dividing by the monthly cost.' }]) };
};

function verifySolve(pr: Problem): string[] {
  const key = keyOf(pr);
  const text = firstText(pr);
  const g = /charges a one-time \\\$(\d+) joining fee plus \\\$(\d+) per month\. Maya has paid \\\$(\d+) in total/.exec(text);
  if (g) return same(Q(g[1]).add(Q(g[2]).mul(key)), Q(g[3]), 'fee plus monthly cost');
  const m = /^Solve \$([^$]+)\$\.$/.exec(text);
  if (!m) return ['unrecognized prompt'];
  const rel = parseRelation(texPlain(m[1]));
  const diff = toPoly(rel.lhs).sub(toPoly(rel.rhs));
  const errs: string[] = [];
  if (diff.variables().some((v) => v !== 'x') || diff.degreeIn('x') !== 1) errs.push('not a linear equation in x with one solution');
  if (!diff.evaluate({ x: key }).isZero()) errs.push('the key does not make the two sides equal');
  return errs;
}

export const genPrereqSolve1 = makeGen(
  'p.solve1',
  'P.SOLVE1',
  'Solve one-variable linear equations: one- and two-step, variables on both sides, distribution (on both sides), fraction coefficients and fractional solutions.',
  { 1: [solveShape(1)], 2: [solveShape(2), solveShape(2), solveShape(2), solveGym], 3: [solveShape(3)] },
  verifySolve,
);

const pickIneqOp = (rng: Rng): Op => rng.pick(['<', '>', '<=', '>='] as const);
const ineqText = (v: string, op: Op, k: Rational) => `${v} ${op} ${k.toString()}`;

function ineqBuilt(c: LinCase, op: Op, opts: { prompt?: Block[]; setup?: SolutionStep; tags?: Problem['tags']; v?: string } = {}): Built {
  const v = opts.v ?? 'x';
  const M = c.m1.sub(c.m2);
  const k = solveLin(c.m1, c.b1, c.m2, c.b2)!;
  const flips = M.isNegative();
  const solOp = flips ? FLIP_OP[op] : op;
  const key = ineqText(v, solOp, k);
  const orig = `${c.lhs} ${OP_TEX[op]} ${c.rhs}`;
  const misList: Misconception[] = [
    ...(flips ? [{ answer: ineqText(v, op, k), tag: 'inequality-direction' as const, feedback: 'At some point you divided (or multiplied) by a negative number. That reverses the order, so the inequality symbol must flip.' }] : []),
    ...(!flips && !M.eq(1) ? [{ answer: ineqText(v, FLIP_OP[op], k), tag: 'inequality-direction' as const, feedback: 'You only flip the symbol when you multiply or divide by a **negative** number. Here the number you divide by is positive.' }] : []),
    ...(c.wrongExpansions ?? []).flatMap((w) => {
      const kw = solveLin(...w.e);
      if (!kw) return [];
      const Mw = w.e[0].sub(w.e[2]);
      return [{ answer: ineqText(v, Mw.isNegative() ? FLIP_OP[op] : op, kw), tag: w.tag, feedback: w.feedback }];
    }),
    ...(k.isZero() ? [] : [{ answer: ineqText(v, solOp, k.neg()), tag: 'sign-error' as const, feedback: 'Check the sign of your boundary number: substituting it into the original inequality should make both sides equal.' }]),
  ];
  const checkVal = (() => {
    const below = k.isInteger() ? k.sub(R(1)) : Q(k.floor());
    return solOp === '>' || solOp === '>=' ? below.add(R(2)) : below;
  })();
  const at = (m: Rational, b: Rational) => m.mul(checkVal).add(b).toTex();
  return {
    tags: opts.tags ?? (c.first === 'distribute' || c.first === 'collect' ? ['multi-step'] : []),
    prompt: opts.prompt ?? [p(`Solve $${orig}$.`)],
    answer: { kind: 'inequality', value: key, form: 'solved' },
    inputHint: `Type an inequality like ${v} > -3 or ${v} <= 5.`,
    hints: [
      'Solve an inequality like an equation, with one extra rule about the symbol.',
      firstHint(c).replace(/\$x\$/g, `$${v}$`),
      flips
        ? c.m2.isZero()
          ? `The number multiplying $${v}$ is negative. Dividing or multiplying both sides by a negative number **flips** the symbol.`
          : `If you collect the $${v}$ terms on the left, their coefficient is negative, and dividing by a negative number **flips** the symbol. (Collecting them on the right avoids the flip; both ways give the same answer.)`
        : `Here you never need to multiply or divide by a negative number, so the symbol keeps its direction.`,
      `When the $${v}$ terms are together on one side, the number multiplying $${v}$ is $${M.toTex()}$. Isolate $${v}$, then test a number from your answer in the original inequality.`,
    ],
    solution: [
      ...(opts.setup ? [opts.setup] : []),
      ...linSteps(c, OP_TEX[op], OP_TEX[solOp]).map((s) => (v === 'x' ? s : { ...s, text: s.text.replace(/\$x\$/g, `$${v}$`), why: s.why?.replace(/\$x\$/g, `$${v}$`), tex: s.tex?.replace(/x/g, v) })),
      { text: `Check with a number in the solution, $${v} = ${checkVal.toTex()}$.`, tex: `\\text{left side} = ${at(c.m1, c.b1)},\\ \\text{right side} = ${at(c.m2, c.b2)}:\\ ${at(c.m1, c.b1)} ${OP_TEX[op]} ${at(c.m2, c.b2)}\\ \\checkmark`, why: 'A value from the solution set makes the original inequality true.' },
    ],
    mis: stringMisconceptions(key, misList),
  };
}

const ineqShape =
  (d: Difficulty): Shape =>
  (rng) => {
    const c = linCase(rng, d, true);
    return ineqBuilt(c, pickIneqOp(rng));
  };

const ineqWord: Shape = (rng) => {
  const F = rng.int(2, 12);
  const r = rng.int(2, 6);
  const n = rng.int(4, 15);
  const B = F + r * n;
  const c: LinCase = { lhs: `${F} + ${r}n`, rhs: `${B}`, m1: R(r), b1: R(F), m2: R(0), b2: R(B), first: 'constant' };
  return ineqBuilt(c, '<=', {
    v: 'n',
    tags: ['word', 'real-world'],
    prompt: [p(`A fair charges ${money(F)} to get in plus ${money(r)} for each ride. Ana can spend at most ${money(B)}. Write and solve an inequality for the number of rides $n$ she can take.`)],
    setup: { text: 'Write an inequality. "At most" means less than or equal to.', tex: `${F} + ${r}n \\le ${B}`, why: 'Her total cost, the entry fee plus the cost of the rides, cannot be more than her budget.' },
  });
};

function verifyIneq(pr: Problem): string[] {
  if (pr.answer.kind !== 'inequality') return ['expected an inequality answer'];
  const text = firstText(pr);
  let orig: string;
  let ans = pr.answer.value;
  const w = /A fair charges \\\$(\d+) to get in plus \\\$(\d+) for each ride\. Ana can spend at most \\\$(\d+)\./.exec(text);
  if (w) {
    orig = `${w[1]} + ${w[2]}x <= ${w[3]}`;
    ans = ans.replace(/n/g, 'x');
  } else {
    const m = /^Solve \$([^$]+)\$\.$/.exec(text);
    if (!m) return ['unrecognized prompt'];
    orig = texPlain(m[1].replace(/\\le(?![a-z])/g, '<=').replace(/\\ge(?![a-z])/g, '>='));
  }
  const parts = ans.split(/<=|>=|<|>/);
  if (parts.length !== 2 || parts[0].trim() !== 'x') return ['key is not of the form x op number'];
  const kv = exactValue(parts[1]);
  if (!kv || !kv.isRational()) return ['boundary is not a number'];
  const k = kv.rationalPart();
  const errs: string[] = [];
  if (!holds(orig.replace(/<=|>=|<|>/, '='), k)) errs.push('boundary does not make the two sides equal');
  if (!sameOneVarSolutions(orig, ans, k)) errs.push('solution set differs from the original inequality');
  return errs;
}

export const genPrereqIneq1 = makeGen(
  'p.ineq1',
  'P.INEQ1',
  'Solve one-variable linear inequalities, flipping the symbol when multiplying or dividing by a negative; includes distribution, variables on both sides, fraction coefficients and a budget context.',
  { 1: [ineqShape(1)], 2: [ineqShape(2), ineqShape(2), ineqShape(2), ineqWord], 3: [ineqShape(3)] },
  verifyIneq,
);

// ---------------------------------------------------------------------------
// P.COORD: the coordinate plane
// ---------------------------------------------------------------------------

interface LPt {
  x: number;
  y: number;
  label: string;
}
/** A fixed grid: 18 x 14 units, about the 380 x 300 plot-area aspect ratio. */
function coordGraph(points: LPt[], segments: Array<[LPt, LPt]> = []): GraphSpec {
  return {
    xMin: -9,
    xMax: 9,
    yMin: -7,
    yMax: 7,
    xStep: 1,
    yStep: 1,
    xLabel: 'x',
    yLabel: 'y',
    points: points.map((q) => ({ x: q.x, y: q.y, label: q.label })),
    ...(segments.length ? { segments: segments.map(([a, b]) => ({ x1: a.x, y1: a.y, x2: b.x, y2: b.y })) } : {}),
    ariaLabel: `Coordinate grid with labeled points ${points.map((q) => q.label).join(', ')}.`,
  };
}
const pairT = (x: number, y: number) => `(${x}, ${y})`;
function pointMis(kx: number, ky: number, list: Array<{ x: number; y: number; tag: MisconceptionTag; feedback: string }>): Misconception[] {
  const seen = new Set([`${kx}|${ky}`, `${ky}|${kx}`]);
  const out: Misconception[] = [];
  for (const m of list) {
    const s = `${m.x}|${m.y}`;
    if (seen.has(s)) continue;
    seen.add(s);
    out.push({ answer: s, tag: m.tag, feedback: m.feedback });
  }
  return out;
}
const POINT_INPUT = 'Type an ordered pair like (3, -2).';
const QUAD = ['Quadrant I', 'Quadrant II', 'Quadrant III', 'Quadrant IV'];
const quadOf = (x: number, y: number) => (x > 0 ? (y > 0 ? 0 : 3) : y > 0 ? 1 : 2);

const coordRead: Shape = (rng) => {
  const labels = rng.shuffle(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'M', 'N', 'P', 'Q', 'R', 'S']).slice(0, 4);
  const onAxis = rng.next() < 0.3;
  const quads = rng.shuffle([0, 1, 2, 3]);
  const pts: LPt[] = quads.map((q, i) => {
    const x = rng.int(1, 8) * (q === 0 || q === 3 ? 1 : -1);
    const y = rng.int(1, 6) * (q === 0 || q === 1 ? 1 : -1);
    return { x, y, label: labels[i] };
  });
  if (onAxis) {
    const ax = rng.bool();
    pts[0] = ax ? { x: rng.nonzeroInt(-8, 8), y: 0, label: labels[0] } : { x: 0, y: rng.nonzeroInt(-6, 6), label: labels[0] };
  }
  const T = onAxis ? pts[0] : rng.pick(pts);
  const tx = T.x;
  const ty = T.y;
  return {
    tags: ['graph'],
    prompt: [p(`What are the coordinates of point $${T.label}$?`), { t: 'graph', spec: coordGraph(pts) }],
    answer: { kind: 'point', x: String(tx), y: String(ty) },
    inputHint: POINT_INPUT,
    hints: [
      'An ordered pair $(x, y)$ gives the horizontal position first and the vertical position second.',
      `Start at the origin $(0, 0)$ and move left or right until you are directly above or below $${T.label}$.`,
      tx === 0 ? `$${T.label}$ is on the $y$-axis, so it is not left or right of the origin at all.` : ty === 0 ? `$${T.label}$ is on the $x$-axis, so it is not above or below the origin at all.` : `$${T.label}$ is ${tx > 0 ? 'right' : 'left'} of the $y$-axis and ${ty > 0 ? 'above' : 'below'} the $x$-axis. That tells you the sign of each coordinate.`,
      'Count grid squares from the origin: first horizontally, then vertically. Left and down are negative.',
    ],
    solution: [
      { text: `Horizontal: from the origin, $${T.label}$ is ${tx === 0 ? 'neither left nor right' : `${Math.abs(tx)} unit${Math.abs(tx) === 1 ? '' : 's'} ${tx > 0 ? 'right' : 'left'}`}.`, tex: `x = ${tx}`, why: 'Right of the $y$-axis is positive and left is negative.' },
      { text: `Vertical: $${T.label}$ is ${ty === 0 ? 'neither above nor below' : `${Math.abs(ty)} unit${Math.abs(ty) === 1 ? '' : 's'} ${ty > 0 ? 'up' : 'down'}`} from there.`, tex: `y = ${ty}`, why: 'Above the $x$-axis is positive and below is negative.' },
      { text: 'Write the ordered pair, $x$ first.', tex: `${T.label}${pairT(tx, ty)}` },
    ],
    mis: pointMis(tx, ty, [
      { x: -tx, y: ty, tag: 'sign-error', feedback: 'Check the sign of the $x$-coordinate: points left of the $y$-axis have negative $x$-coordinates.' },
      { x: tx, y: -ty, tag: 'sign-error', feedback: 'Check the sign of the $y$-coordinate: points below the $x$-axis have negative $y$-coordinates.' },
    ]),
  };
};

const coordMove: Shape = (rng) => {
  for (;;) {
    const x0 = rng.int(-6, 6);
    const y0 = rng.int(-5, 5);
    const h = rng.int(2, 8) * (rng.bool() ? 1 : -1);
    const v = rng.int(2, 7) * (rng.bool() ? 1 : -1);
    const x = x0 + h;
    const y = y0 + v;
    if (Math.abs(x) > 9 || Math.abs(y) > 9) continue;
    return {
      prompt: [p(`Start at the point $${pairT(x0, y0)}$. Move ${Math.abs(h)} units ${h > 0 ? 'right' : 'left'} and ${Math.abs(v)} units ${v > 0 ? 'up' : 'down'}. What point do you land on?`)],
      answer: { kind: 'point', x: String(x), y: String(y) },
      inputHint: POINT_INPUT,
      hints: [
        'Moving left or right changes only the $x$-coordinate. Moving up or down changes only the $y$-coordinate.',
        'Right adds to $x$ and left subtracts from $x$. Up adds to $y$ and down subtracts from $y$.',
        `Find the new $x$-coordinate: ${x0} ${h > 0 ? '+' : '-'} ${Math.abs(h)}.`,
        `Find the new $y$-coordinate: ${y0} ${v > 0 ? '+' : '-'} ${Math.abs(v)}.`,
      ],
      solution: [
        { text: `Horizontal move: ${h > 0 ? 'add' : 'subtract'} ${Math.abs(h)}.`, tex: `x = ${x0} ${h > 0 ? '+' : '-'} ${Math.abs(h)} = ${x}`, why: 'Left and right moves change only the $x$-coordinate.' },
        { text: `Vertical move: ${v > 0 ? 'add' : 'subtract'} ${Math.abs(v)}.`, tex: `y = ${y0} ${v > 0 ? '+' : '-'} ${Math.abs(v)} = ${y}`, why: 'Up and down moves change only the $y$-coordinate.' },
        { text: 'The new point:', tex: pairT(x, y) },
      ],
      mis: pointMis(x, y, [
        { x: x0 + v, y: y0 + h, tag: 'graph-reading', feedback: 'Left-right moves change the $x$-coordinate and up-down moves change the $y$-coordinate. Check which coordinate each move changes.' },
        { x: x0 - h, y, tag: 'sign-error', feedback: `Moving ${h > 0 ? 'right' : 'left'} ${h > 0 ? 'increases' : 'decreases'} the $x$-coordinate.` },
        { x, y: y0 - v, tag: 'sign-error', feedback: `Moving ${v > 0 ? 'up' : 'down'} ${v > 0 ? 'increases' : 'decreases'} the $y$-coordinate.` },
      ]),
    };
  }
};

const coordReflect: Shape = (rng) => {
  const x = rng.nonzeroInt(-8, 8);
  const y = rng.nonzeroInt(-6, 6);
  const axis = rng.bool() ? 'x' : 'y';
  const rx = axis === 'y' ? -x : x;
  const ry = axis === 'x' ? -y : y;
  return {
    prompt: [p(`Reflect the point $${pairT(x, y)}$ across the $${axis}$-axis. What are the coordinates of its image?`)],
    answer: { kind: 'point', x: String(rx), y: String(ry) },
    inputHint: POINT_INPUT,
    hints: [
      'A reflection is a mirror image: the axis is the mirror, and the image is the same distance from it on the other side.',
      axis === 'x' ? 'Reflecting across the $x$-axis flips the point up or down.' : 'Reflecting across the $y$-axis flips the point left or right.',
      axis === 'x' ? 'Up-down position is the $y$-coordinate. Which coordinate changes?' : 'Left-right position is the $x$-coordinate. Which coordinate changes?',
      'One coordinate stays the same and the other becomes its opposite.',
    ],
    solution: [
      { text: axis === 'x' ? 'The $x$-axis is horizontal, so the point flips vertically: keep $x$ and take the opposite of $y$.' : 'The $y$-axis is vertical, so the point flips horizontally: take the opposite of $x$ and keep $y$.', tex: `${pairT(x, y)} \\to ${pairT(rx, ry)}`, why: `The image is the same distance from the ${axis}-axis, on the other side.` },
    ],
    mis: pointMis(rx, ry, [
      { x: axis === 'x' ? -x : x, y: axis === 'x' ? y : -y, tag: 'graph-reading', feedback: `That is a reflection across the other axis. Reflecting across the $${axis}$-axis changes the ${axis === 'x' ? '$y$' : '$x$'}-coordinate.` },
      { x: -x, y: -y, tag: 'sign-error', feedback: 'Only one coordinate changes sign in a reflection across one axis.' },
    ]),
  };
};

const coordQuadrant: Shape = (rng) => {
  const x = rng.nonzeroInt(-9, 9);
  const y = rng.nonzeroInt(-9, 9);
  const q = quadOf(x, y);
  // options in the usual order I, II, III, IV
  const ch: AnswerSpec = { kind: 'choice', options: QUAD.map((label, i) => ({ id: 'abcd'[i], label })), correct: 'abcd'[q] };
  return {
    prompt: [p(`In which quadrant is the point $${pairT(x, y)}$?`)],
    answer: ch,
    hints: [
      'The axes split the plane into four quadrants, numbered I, II, III, IV counterclockwise starting at the top right.',
      'The sign of $x$ tells you right (positive) or left (negative) of the $y$-axis.',
      'The sign of $y$ tells you above (positive) or below (negative) the $x$-axis.',
      `This point is ${x > 0 ? 'right' : 'left'} of the $y$-axis and ${y > 0 ? 'above' : 'below'} the $x$-axis.`,
    ],
    solution: [
      { text: `$x = ${x}$ is ${sgnWord(x)} and $y = ${y}$ is ${sgnWord(y)}.`, why: 'Signs of the coordinates tell which side of each axis the point is on.' },
      { text: `${x > 0 ? 'Right' : 'Left'} and ${y > 0 ? 'up' : 'down'} is ${QUAD[q]}.`, why: 'Quadrant I is (+, +), II is (-, +), III is (-, -), IV is (+, -).' },
    ],
  };
};

const coordDescribe: Shape = (rng) => {
  const a = rng.int(1, 8);
  const b = rng.int(1, 7);
  const left = rng.bool();
  const below = rng.bool();
  const x = left ? -a : a;
  const y = below ? -b : b;
  return {
    prompt: [p(`A point is ${plural(a, 'unit')} ${left ? 'left' : 'right'} of the $y$-axis and ${plural(b, 'unit')} ${below ? 'below' : 'above'} the $x$-axis. What are its coordinates?`)],
    answer: { kind: 'point', x: String(x), y: String(y) },
    inputHint: POINT_INPUT,
    hints: [
      'The distance from the $y$-axis is horizontal, so it gives the $x$-coordinate.',
      'The distance from the $x$-axis is vertical, so it gives the $y$-coordinate.',
      'Left of the $y$-axis is negative; below the $x$-axis is negative.',
      'Write the ordered pair with the $x$-coordinate first.',
    ],
    solution: [
      { text: `${plural(a, 'unit')} ${left ? 'left' : 'right'} of the $y$-axis:`, tex: `x = ${x}`, why: 'Distance from the $y$-axis is measured left-right, which is the $x$-direction.' },
      { text: `${plural(b, 'unit')} ${below ? 'below' : 'above'} the $x$-axis:`, tex: `y = ${y}`, why: 'Distance from the $x$-axis is measured up-down, which is the $y$-direction.' },
      { text: 'The point:', tex: pairT(x, y) },
    ],
    mis: pointMis(x, y, [
      { x: y, y: x, tag: 'graph-reading', feedback: 'Distance from the $y$-axis is horizontal, so it is the $x$-coordinate.' },
      { x: -x, y, tag: 'sign-error', feedback: 'Check the sign of the $x$-coordinate: left is negative, right is positive.' },
      { x, y: -y, tag: 'sign-error', feedback: 'Check the sign of the $y$-coordinate: below is negative, above is positive.' },
    ]),
  };
};

const coordDistance: Shape = (rng) => {
  const horiz = rng.bool();
  const lim = horiz ? 8 : 6;
  const a = -rng.int(1, lim);
  const b = rng.int(1, lim);
  const c = rng.nonzeroInt(-6, 6);
  const [P, Q2] = rng.bool() ? [a, b] : [b, a];
  const p1 = horiz ? { x: P, y: c } : { x: c, y: P };
  const p2 = horiz ? { x: Q2, y: c } : { x: c, y: Q2 };
  const dist = b - a;
  return {
    prompt: [p(`How far apart are the points $${pairT(p1.x, p1.y)}$ and $${pairT(p2.x, p2.y)}$?`)],
    answer: numAns(R(dist)),
    inputHint: 'Type a number of units.',
    hints: [
      `The points have the same ${horiz ? '$y$' : '$x$'}-coordinate, so they lie on a ${horiz ? 'horizontal' : 'vertical'} line.`,
      `Only the ${horiz ? '$x$' : '$y$'}-coordinates differ: ${P} and ${Q2}.`,
      'The points are on opposite sides of an axis, so find each distance to the axis and add them.',
      `Distance from ${a} to 0 is ${-a}; distance from 0 to ${b} is ${b}.`,
    ],
    solution: [
      { text: `The points have the same ${horiz ? '$y$' : '$x$'}-coordinate, so measure along the ${horiz ? '$x$' : '$y$'}-direction.`, why: 'On a horizontal or vertical line, the distance is how far apart the changing coordinates are.' },
      { text: 'Add the distances to the axis on each side (or subtract the coordinates and take the absolute value).', tex: `|${b} - (${a})| = ${-a} + ${b} = ${dist}`, why: 'Distance is never negative, and the two points are on opposite sides of 0.' },
    ],
    mis: mis(R(dist), [{ value: R(Math.abs(b + a)), tag: 'sign-error', feedback: 'The points are on opposite sides of an axis, so their distances from it add. Subtracting a negative coordinate means adding.' }]),
  };
};

const coordRect: Shape = (rng) => {
  for (;;) {
    const x1 = rng.int(-8, 8);
    const x2 = rng.int(-8, 8);
    const y1 = rng.int(-6, 6);
    const y2 = rng.int(-6, 6);
    if (Math.abs(x1 - x2) < 3 || Math.abs(y1 - y2) < 2) continue;
    if ([x1, x2].every((v) => v > 0) || [x1, x2].every((v) => v < 0)) continue;
    const A = { x: x1, y: y1, label: 'A' };
    const B = { x: x2, y: y1, label: 'B' };
    const C = { x: x2, y: y2, label: 'C' };
    return {
      tags: ['graph'],
      prompt: [p(`$A${pairT(x1, y1)}$, $B${pairT(x2, y1)}$ and $C${pairT(x2, y2)}$ are three vertices of rectangle $ABCD$. What are the coordinates of $D$?`), { t: 'graph', spec: coordGraph([A, B, C], [[A, B], [B, C]]) }],
      answer: { kind: 'point', x: String(x1), y: String(y2) },
      inputHint: POINT_INPUT,
      hints: [
        'In a rectangle the sides meet at right angles, and here the sides run along grid lines.',
        '$D$ is the fourth corner, connected to both $C$ and $A$.',
        '$D$ is directly above or below $A$, so it has the same $x$-coordinate as $A$.',
        '$D$ is directly left or right of $C$, so it has the same $y$-coordinate as $C$.',
      ],
      solution: [
        { text: '$AB$ is horizontal and $BC$ is vertical, so the rectangle has sides along the grid lines.', why: `$A$ and $B$ share the $y$-coordinate ${y1}; $B$ and $C$ share the $x$-coordinate ${x2}.` },
        { text: '$DA$ must be vertical (parallel to $BC$), so $D$ has the $x$-coordinate of $A$. $CD$ must be horizontal (parallel to $AB$), so $D$ has the $y$-coordinate of $C$.', tex: `D${pairT(x1, y2)}`, why: 'Opposite sides of a rectangle are parallel.' },
      ],
      mis: pointMis(x1, y2, [
        { x: x2, y: y1 === y2 ? y1 + 1 : y1, tag: 'graph-reading', feedback: 'That is already a vertex of the rectangle. $D$ is the corner that is still missing.' },
        { x: -x1, y: y2, tag: 'sign-error', feedback: 'Check the sign of the $x$-coordinate: $D$ is directly above or below $A$.' },
      ]),
    };
  }
};

const coordReflectMove: Shape = (rng) => {
  for (;;) {
    const x = rng.nonzeroInt(-6, 6);
    const y = rng.nonzeroInt(-5, 5);
    const axis = rng.bool() ? 'x' : 'y';
    const amt = rng.int(2, 6);
    const dir = axis === 'y' ? rng.pick(['right', 'left']) : rng.pick(['up', 'down']);
    const s = dir === 'right' || dir === 'up' ? amt : -amt;
    const rx = axis === 'y' ? -x + s : x;
    const ry = axis === 'x' ? -y + s : y;
    const wx = axis === 'y' ? -(x + s) : x;
    const wy = axis === 'x' ? -(y + s) : y;
    if (Math.abs(rx) > 9 || Math.abs(ry) > 9) continue;
    return {
      tags: ['multi-step'],
      prompt: [p(`Reflect $P${pairT(x, y)}$ across the $${axis}$-axis, then move the image ${amt} units ${dir}. Where does $P$ end up?`)],
      answer: { kind: 'point', x: String(rx), y: String(ry) },
      inputHint: POINT_INPUT,
      hints: [
        'Do the two moves in the order given: the reflection first, then the slide.',
        `Reflecting across the $${axis}$-axis changes the sign of the ${axis === 'x' ? '$y$' : '$x$'}-coordinate only.`,
        `Moving ${dir} changes the ${axis === 'x' ? '$y$' : '$x$'}-coordinate of the image.`,
        `Start from the reflected point, then ${s > 0 ? 'add' : 'subtract'} ${amt}.`,
      ],
      solution: [
        { text: `Reflect across the $${axis}$-axis.`, tex: `${pairT(x, y)} \\to ${pairT(axis === 'y' ? -x : x, axis === 'x' ? -y : y)}`, why: `The image is the same distance from the ${axis}-axis on the other side, so the ${axis === 'x' ? 'y' : 'x'}-coordinate becomes its opposite.` },
        { text: `Move ${amt} units ${dir}.`, tex: `${pairT(axis === 'y' ? -x : x, axis === 'x' ? -y : y)} \\to ${pairT(rx, ry)}`, why: `${dir === 'right' || dir === 'left' ? 'Left-right moves change $x$' : 'Up-down moves change $y$'}; ${s > 0 ? 'right and up add' : 'left and down subtract'}.` },
      ],
      mis: pointMis(rx, ry, [
        { x: wx, y: wy, tag: 'other', feedback: 'Do the steps in the order given: reflect first, then slide the image.' },
        { x: axis === 'y' ? x + s : x, y: axis === 'x' ? y + s : y, tag: 'graph-reading', feedback: `Do not skip the reflection: it changes the sign of the ${axis === 'x' ? '$y$' : '$x$'}-coordinate.` },
      ]),
    };
  }
};

function verifyCoord(pr: Problem): string[] {
  const text = firstText(pr);
  const a = pr.answer;
  const keyPt = () => {
    if (a.kind !== 'point') throw new Error('expected a point answer');
    return { x: Number(a.x), y: Number(a.y) };
  };
  const pt = (want: { x: number; y: number }, what: string) => {
    const k = keyPt();
    return k.x === want.x && k.y === want.y ? [] : [`${what}: key (${k.x}, ${k.y}) but re-derived (${want.x}, ${want.y})`];
  };
  let m = /^What are the coordinates of point \$([A-Z])\$\?$/.exec(text);
  if (m) {
    const g = pr.prompt.find((b) => b.t === 'graph');
    if (!g || g.t !== 'graph') return ['no graph'];
    const hits = (g.spec.points ?? []).filter((q) => q.label === m![1]);
    if (hits.length !== 1) return ['labeled point not found exactly once'];
    const { xMin, xMax, yMin, yMax } = g.spec;
    if (hits[0].x < xMin || hits[0].x > xMax || hits[0].y < yMin || hits[0].y > yMax) return ['point is off the grid'];
    return pt(hits[0], 'plotted point');
  }
  m = /^Start at the point \$\((-?\d+), (-?\d+)\)\$\. Move (\d+) units (right|left) and (\d+) units (up|down)\./.exec(text);
  if (m) {
    // the move from the start to the key must be the described move
    const k = keyPt();
    const dx = k.x - Number(m[1]);
    const dy = k.y - Number(m[2]);
    return dx === (m[4] === 'right' ? 1 : -1) * Number(m[3]) && dy === (m[6] === 'up' ? 1 : -1) * Number(m[5]) ? [] : ['the move to the key is not the described move'];
  }
  m = /^Reflect the point \$\((-?\d+), (-?\d+)\)\$ across the \$([xy])\$-axis\./.exec(text);
  if (m) {
    // the axis must be the perpendicular bisector of the segment from P to its image
    const k = keyPt();
    const x = Number(m[1]);
    const y = Number(m[2]);
    const ok = m[3] === 'x' ? k.x === x && k.y + y === 0 : k.y === y && k.x + x === 0;
    return ok ? [] : ['key is not the mirror image'];
  }
  m = /^In which quadrant is the point \$\((-?\d+), (-?\d+)\)\$\?$/.exec(text);
  if (m) {
    const x = Number(m[1]);
    const y = Number(m[2]);
    const want = x > 0 && y > 0 ? 'Quadrant I' : x < 0 && y > 0 ? 'Quadrant II' : x < 0 && y < 0 ? 'Quadrant III' : x > 0 && y < 0 ? 'Quadrant IV' : 'none';
    return a.kind === 'choice' && choiceLabel(a) === want ? [] : ['wrong quadrant'];
  }
  m = /^A point is (\d+) units? (left|right) of the \$y\$-axis and (\d+) units? (below|above) the \$x\$-axis\./.exec(text);
  if (m) {
    const k = keyPt();
    const ok = Math.abs(k.x) === Number(m[1]) && Math.sign(k.x) === (m[2] === 'right' ? 1 : -1) && Math.abs(k.y) === Number(m[3]) && Math.sign(k.y) === (m[4] === 'above' ? 1 : -1);
    return ok ? [] : ['key does not match the description'];
  }
  m = /^How far apart are the points \$\((-?\d+), (-?\d+)\)\$ and \$\((-?\d+), (-?\d+)\)\$\?$/.exec(text);
  if (m) {
    const [x1, y1, x2, y2] = m.slice(1, 5).map(Number);
    if (x1 !== x2 && y1 !== y2) return ['points are not on a horizontal or vertical line'];
    return same(keyOf(pr), R(Math.abs(x1 - x2) + Math.abs(y1 - y2)), 'distance');
  }
  m = /^\$A\((-?\d+), (-?\d+)\)\$, \$B\((-?\d+), (-?\d+)\)\$ and \$C\((-?\d+), (-?\d+)\)\$ are three vertices of rectangle/.exec(text);
  if (m) {
    const [ax, ay, bx, by, cx, cy] = m.slice(1, 7).map(Number);
    const d = keyPt();
    // ABCD is a parallelogram (diagonals bisect each other) with a right angle at B
    const para = ax + cx === bx + d.x && ay + cy === by + d.y;
    const right = (ax - bx) * (cx - bx) + (ay - by) * (cy - by) === 0;
    return para && right ? [] : ['ABCD is not a rectangle'];
  }
  m = /^Reflect \$P\((-?\d+), (-?\d+)\)\$ across the \$([xy])\$-axis, then move the image (\d+) units (right|left|up|down)\./.exec(text);
  if (m) {
    // undo the steps in reverse order and arrive back at P
    const k = keyPt();
    const s = Number(m[4]) * (m[5] === 'right' || m[5] === 'up' ? 1 : -1);
    let bx = k.x - (m[5] === 'right' || m[5] === 'left' ? s : 0);
    let by = k.y - (m[5] === 'up' || m[5] === 'down' ? s : 0);
    if (m[3] === 'x') by = -by;
    else bx = -bx;
    return bx === Number(m[1]) && by === Number(m[2]) ? [] : ['undoing the moves does not return to P'];
  }
  return ['unrecognized prompt'];
}

export const genPrereqCoord = makeGen(
  'p.coord',
  'P.COORD',
  'The coordinate plane: read labeled points in all four quadrants and on the axes, describe positions, quadrants, moves and reflections, distances along grid lines, and the missing vertex of a rectangle.',
  { 1: [coordRead, coordRead, coordDescribe], 2: [coordMove, coordReflect, coordQuadrant, coordRead], 3: [coordDistance, coordRect, coordReflectMove] },
  verifyCoord,
);

// ---------------------------------------------------------------------------
// P.SLOPE: slope as rise over run
// ---------------------------------------------------------------------------

const SLOPE_INPUT = 'Type the slope as an integer or a fraction, like 3 or -2/5.';
function slopeBuilt(prompt: Block[], x1: number, y1: number, x2: number, y2: number, intro: string, tags: Problem['tags'] = []): Built {
  const dy = y2 - y1;
  const dx = x2 - x1;
  const m = R(dy, dx);
  return {
    tags,
    prompt,
    answer: numAns(m),
    inputHint: SLOPE_INPUT,
    hints: [
      'Slope measures steepness: how much $y$ changes for each 1-unit change in $x$.',
      'Slope is rise over run: (change in $y$) divided by (change in $x$).',
      'Subtract in the same order on the top and the bottom: start with the same point both times.',
      `The change in $y$ is ${y2} - ${pi(y1)} and the change in $x$ is ${x2} - ${pi(x1)}. Divide and simplify.`,
    ],
    solution: [
      { text: intro, tex: `(${x1}, ${y1})\\ \\text{and}\\ (${x2}, ${y2})` },
      { text: 'Find the rise and the run.', tex: `\\text{rise} = ${y2} - ${pi(y1)} = ${dy},\\quad \\text{run} = ${x2} - ${pi(x1)} = ${dx}`, why: 'Rise is the vertical change and run is the horizontal change between the two points.' },
      { text: 'Divide rise by run and simplify.', tex: `m = \\frac{${dy}}{${dx}}${`\\frac{${dy}}{${dx}}` === m.toTex() ? '' : ` = ${m.toTex()}`}`, why: m.isZero() ? 'The rise is 0, so the line is horizontal: it does not go up or down at all.' : m.isNegative() ? 'The rise and run have opposite signs, so the line goes down from left to right: the slope is negative.' : 'The rise and run have the same sign, so the line goes up from left to right: the slope is positive.' },
    ],
    mis: mis(m, [
      { value: dy === 0 ? null : R(dx, dy), tag: 'slope-reciprocal', feedback: 'Slope is rise over run: the change in $y$ goes on top and the change in $x$ goes on the bottom.' },
      { value: m.neg(), tag: 'sign-error', feedback: 'Check the signs. Subtract the coordinates in the same order on the top and the bottom.' },
    ]),
  };
}

function slopePair(rng: Rng, opts: { pos?: boolean; frac?: boolean; scale?: boolean }): [number, number, number, number] {
  for (;;) {
    const q = opts.frac ? rng.int(2, 5) : 1;
    let pp = opts.frac ? rng.int(1, 6) : rng.int(1, 5);
    if (opts.frac) while (gcdN(pp, q) !== 1) pp++;
    if (!opts.pos && rng.next() < 0.65) pp = -pp;
    const s = opts.scale ? rng.int(1, 3) : opts.frac ? 1 : rng.int(1, 3);
    const run = q * s;
    const rise = pp * s;
    const x1 = rng.int(-7, 7);
    const y1 = rng.int(-8, 8);
    const x2 = x1 + run;
    const y2 = y1 + rise;
    if (Math.abs(x2) > 9 || Math.abs(y2) > 12) continue;
    return rng.bool() ? [x1, y1, x2, y2] : [x2, y2, x1, y1];
  }
}

const slopeTwoPoints =
  (opts: { pos?: boolean; frac?: boolean; scale?: boolean }): Shape =>
  (rng) => {
    const [x1, y1, x2, y2] = slopePair(rng, opts);
    return slopeBuilt([p(`Find the slope of the line through $${pairT(x1, y1)}$ and $${pairT(x2, y2)}$.`)], x1, y1, x2, y2, 'Use the two points.');
  };

const slopeGraph =
  (pos: boolean): Shape =>
  (rng) => {
    for (;;) {
      const q = rng.int(1, 4);
      let pp = rng.int(1, 4);
      while (gcdN(pp, q) !== 1) pp++;
      if (!pos) pp = -pp;
      const s = q === 1 ? rng.int(2, 3) : rng.int(1, 2);
      const A = { x: rng.int(-7, 3), y: rng.int(-5, 5), label: 'A' };
      const B = { x: A.x + q * s, y: A.y + pp * s, label: 'B' };
      if (Math.abs(B.x) > 8 || Math.abs(B.y) > 6) continue;
      const m = R(pp, q);
      const b = R(A.y).sub(m.mul(R(A.x)));
      const spec: GraphSpec = { ...coordGraph([A, B]), functions: [{ expr: linearPlain(m, b) }], ariaLabel: `A line through the labeled points A and B on a coordinate grid.` };
      return slopeBuilt([p('Find the slope of the line shown. It passes through the labeled points $A$ and $B$.'), { t: 'graph', spec }], A.x, A.y, B.x, B.y, 'Read the coordinates of $A$ and $B$ from the grid.', ['graph']);
    }
  };

const slopeTable =
  (easy: boolean): Shape =>
  (rng) => {
    const step = easy ? 1 : rng.int(2, 3);
    const q = easy ? 1 : step;
    let pp = easy ? rng.int(1, 6) : rng.nonzeroInt(-7, 7);
    if (!easy && pp % q === 0 && rng.bool()) pp += 1;
    if (pp === 0) pp = -1;
    const m = R(pp, q);
    const x0 = easy ? rng.int(0, 2) : rng.int(-4, 1);
    const y0 = rng.int(-10, 10);
    const xs = [0, 1, 2, 3].map((i) => x0 + i * step);
    const ys = xs.map((x) => R(y0).add(m.mul(R(x - x0))));
    const rows = xs.map((x, i) => [String(x), numStr(ys[i])]);
    const dy = ys[1].sub(ys[0]);
    const ans = m;
    return {
      prompt: [p('The table shows points on a line. What is the slope of the line?'), { t: 'table', headers: ['$x$', '$y$'], rows }],
      answer: numAns(ans),
      inputHint: SLOPE_INPUT,
      hints: [
        'Slope is the change in $y$ divided by the change in $x$.',
        'Pick two rows of the table and compare them.',
        `From one row to the next, $x$ goes up by ${step}. How much does $y$ change?`,
        `Divide the change in $y$ by ${step}.`,
      ],
      solution: [
        { text: 'Compare the first two rows.', tex: `\\Delta x = ${xs[1]} - ${pi(xs[0])} = ${step},\\quad \\Delta y = ${numStr(ys[1])} - ${pq(ys[0])} = ${dy.toTex()}`, why: 'Any two points on a line give the same slope.' },
        { text: 'Divide.', tex: `m = \\frac{${dy.toTex()}}{${step}}${`\\frac{${dy.toTex()}}{${step}}` === ans.toTex() ? '' : ` = ${ans.toTex()}`}`, why: 'Slope is change in $y$ over change in $x$; it is the same between every pair of rows, which is why the points lie on a line.' },
      ],
      mis: mis(ans, [
        { value: dy.isZero() ? null : R(step).div(dy), tag: 'slope-reciprocal', feedback: 'Put the change in $y$ on top and the change in $x$ on the bottom.' },
        { value: step === 1 ? null : dy, tag: 'slope-calc', feedback: `$x$ goes up by ${step} each row, not by 1. Divide the change in $y$ by the change in $x$.` },
        { value: ans.neg(), tag: 'sign-error', feedback: 'Check the sign: is $y$ going up or down as $x$ increases?' },
      ]),
    };
  };

const slopeTank: Shape = (rng) => {
  const r = rng.int(2, 9);
  const t1 = rng.int(1, 4);
  const t2 = t1 + rng.int(2, 6);
  const g1 = r * t2 + rng.int(5, 40);
  const g2 = g1 - r * (t2 - t1);
  return {
    tags: ['word', 'real-world'],
    prompt: [p(`A tank is being drained at a constant rate. After ${plural(t1, 'minute')} it holds ${g1} gallons, and after ${t2} minutes it holds ${g2} gallons. What is the slope of the line that models the water in the tank (the rate of change, in gallons per minute)?`)],
    answer: numAns(R(-r)),
    inputHint: 'Type the slope (gallons per minute) as a number.',
    hints: [
      'The two data points are (time, gallons).',
      'Slope is the change in gallons divided by the change in time.',
      'The water is going down, so think about the sign.',
      `Change in gallons: ${g2} - ${g1}. Change in time: ${t2} - ${t1}.`,
    ],
    solution: [
      { text: 'Write the points as (minutes, gallons).', tex: `(${t1}, ${g1})\\ \\text{and}\\ (${t2}, ${g2})` },
      { text: 'Divide the change in gallons by the change in minutes.', tex: `m = \\frac{${g2} - ${g1}}{${t2} - ${t1}} = \\frac{${g2 - g1}}{${t2 - t1}} = ${-r}`, why: 'The slope is the rate of change. It is negative because the amount of water decreases over time.' },
    ],
    mis: mis(R(-r), [
      { value: R(r), tag: 'sign-error', feedback: 'The water is draining, so the amount goes down over time. The rate of change is negative.' },
      { value: R(t2 - t1, g2 - g1), tag: 'slope-reciprocal', feedback: 'Gallons per minute means gallons on top and minutes on the bottom.' },
    ]),
  };
};

const slopeMissing: Shape = (rng) => {
  for (;;) {
    const m = rng.nonzeroInt(-4, 4);
    const x1 = rng.int(-6, 3);
    const x2 = x1 + rng.int(2, 5);
    const y1 = rng.int(-8, 8);
    const y2 = y1 + m * (x2 - x1);
    if (Math.abs(y2) > 20) continue;
    const swap = rng.bool();
    const shownA = swap ? `(${x2}, k)` : `(${x1}, ${y1})`;
    const shownB = swap ? `(${x1}, ${y1})` : `(${x2}, k)`;
    return {
      tags: ['multi-step'],
      prompt: [p(`A line with slope $${m}$ passes through the points $${shownA}$ and $${shownB}$. What is the value of $k$?`)],
      answer: numAns(R(y2)),
      inputHint: 'Type the value of k.',
      hints: [
        'Slope tells how much $y$ changes for each 1-unit increase in $x$.',
        `From $x = ${x1}$ to $x = ${x2}$, the run is ${x2 - x1}.`,
        `The rise must be the slope times the run: $${m}$ times ${x2 - x1}.`,
        `Start at $y = ${y1}$ and add the rise.`,
      ],
      solution: [
        { text: 'Find the run.', tex: `${x2} - ${pi(x1)} = ${x2 - x1}`, why: 'Run is the change in $x$.' },
        { text: 'The rise is the slope times the run.', tex: `\\text{rise} = ${m} \\cdot ${x2 - x1} = ${m * (x2 - x1)}`, why: 'Slope is rise over run, so rise = slope × run.' },
        { text: 'Add the rise to the starting $y$-value.', tex: `k = ${y1} + ${pi(m * (x2 - x1))} = ${y2}`, why: `Check: $\\frac{${y2} - ${pi(y1)}}{${x2} - ${pi(x1)}} = ${m}$.` },
      ],
      mis: mis(R(y2), [
        { value: R(y1 - m * (x2 - x1)), tag: 'sign-error', feedback: `Moving right from $x = ${x1}$ to $x = ${x2}$, $y$ ${m > 0 ? 'increases' : 'decreases'} because the slope is ${m > 0 ? 'positive' : 'negative'}.` },
        { value: R(y1).add(R(x2 - x1, m)), tag: 'slope-reciprocal', feedback: 'Slope is rise over run, so the rise is the slope times the run, not the run divided by the slope.' },
      ]),
    };
  }
};

const slopeHorizontal: Shape = (rng) => {
  const y = rng.nonzeroInt(-8, 8);
  const x1 = rng.int(-8, 0);
  const x2 = rng.int(1, 8);
  return slopeBuilt([p(`Find the slope of the line through $${pairT(x1, y)}$ and $${pairT(x2, y)}$.`)], x1, y, x2, y, 'Use the two points.');
};

function verifySlope(pr: Problem): string[] {
  const text = firstText(pr);
  const key = keyOf(pr);
  const ratio = (x1: number, y1: number, x2: number, y2: number) => {
    if (x1 === x2) throw new Error('vertical line');
    return R(y1 - y2, x1 - x2);
  };
  let m = /^Find the slope of the line through \$\((-?\d+), (-?\d+)\)\$ and \$\((-?\d+), (-?\d+)\)\$\.$/.exec(text);
  if (m) {
    const [x1, y1, x2, y2] = m.slice(1, 5).map(Number);
    return same(key, ratio(x1, y1, x2, y2), 'slope from the points');
  }
  if (/^Find the slope of the line shown\./.test(text)) {
    const g = pr.prompt.find((b) => b.t === 'graph');
    if (!g || g.t !== 'graph') return ['no graph'];
    const A = g.spec.points?.find((q) => q.label === 'A');
    const B = g.spec.points?.find((q) => q.label === 'B');
    const f = g.spec.functions?.[0];
    if (!A || !B || !f) return ['graph is missing A, B or the line'];
    const errs: string[] = [];
    // the drawn line must pass through both labeled points
    for (const q of [A, B]) {
      const v = exactValue(f.expr.replace(/x/g, `(${q.x})`));
      if (!v || !v.rationalPart().eq(R(q.y))) errs.push(`line does not pass through ${q.label}`);
    }
    return [...errs, ...same(key, ratio(A.x, A.y, B.x, B.y), 'slope from the graph')];
  }
  if (/^The table shows points on a line\./.test(text)) {
    const t = pr.prompt.find((b) => b.t === 'table');
    if (!t || t.t !== 'table') return ['no table'];
    const pts = t.rows.map((r) => [Q(r[0]), Q(r[1])]);
    const errs: string[] = [];
    // every pair of rows must give the key (so the points really are on one line)
    for (let i = 0; i < pts.length; i++)
      for (let j = i + 1; j < pts.length; j++) if (!pts[j][1].sub(pts[i][1]).eq(key.mul(pts[j][0].sub(pts[i][0])))) errs.push(`rows ${i + 1} and ${j + 1} do not fit the slope`);
    return errs;
  }
  m = /After (\d+) minutes? it holds (\d+) gallons, and after (\d+) minutes it holds (\d+) gallons\./.exec(text);
  if (m) {
    const [t1, g1, t2, g2] = m.slice(1, 5).map(Number);
    // predicting the second amount from the first with the key slope
    return same(R(g1).add(key.mul(R(t2 - t1))), R(g2), 'predicted gallons');
  }
  m = /^A line with slope \$(-?\d+)\$ passes through the points \$\((-?\d+), (-?\d+|k)\)\$ and \$\((-?\d+), (-?\d+|k)\)\$\./.exec(text);
  if (m) {
    const s = Q(m[1]);
    const p1 = { x: Number(m[2]), y: m[3] === 'k' ? key : Q(m[3]) };
    const p2 = { x: Number(m[4]), y: m[5] === 'k' ? key : Q(m[5]) };
    return same(p2.y.sub(p1.y).div(R(p2.x - p1.x)), s, 'slope with k substituted');
  }
  return ['unrecognized prompt'];
}

export const genPrereqSlope = makeGen(
  'p.slope',
  'P.SLOPE',
  'Slope as rise over run: from two points, a graph, a table or a rate context, including negative, fractional and zero slopes and a missing coordinate.',
  {
    1: [slopeTwoPoints({ pos: true }), slopeGraph(true), slopeTable(true)],
    2: [slopeTwoPoints({ frac: true }), slopeTable(false), slopeTank, slopeGraph(false)],
    3: [slopeTwoPoints({ frac: true, scale: true }), slopeTwoPoints({ frac: true, scale: true }), slopeTwoPoints({ frac: true, scale: true }), slopeMissing, slopeMissing, slopeHorizontal],
  },
  verifySlope,
);

// ---------------------------------------------------------------------------
// P.EXP: exponents
// ---------------------------------------------------------------------------

function powSteps(base: string, n: number, val: Rational): SolutionStep {
  return { text: `Write $${base}^{${n}}$ as repeated multiplication.`, tex: `${base}^{${n}} = ${Array(n).fill(base).join(' \\cdot ')} = ${val.toTex()}`, why: `The exponent ${n} says how many times the base is used as a factor.` };
}

const expBasic: Shape = (rng) => {
  const k = rng.int(0, 2);
  if (k === 0) {
    const [b, n] = rng.pick([
      [2, 3], [2, 4], [2, 5], [2, 6], [3, 3], [3, 4], [4, 3], [5, 3], [3, 2], [6, 2], [7, 2], [8, 2], [9, 2], [4, 2], [5, 4],
    ] as Array<[number, number]>);
    const v = R(b ** n);
    return {
      prompt: evalPrompt(`${b}^{${n}}`),
      answer: numAns(v),
      inputHint: INT_INPUT,
      hints: ['An exponent tells how many times to use the base as a factor.', `$${b}^{${n}}$ means ${n} factors of ${b} multiplied together, not ${b} times ${n}.`, `Write out ${Array(n).fill(b).join(' × ')}.`, 'Multiply two at a time.'],
      solution: [powSteps(String(b), n, v)],
      mis: mis(v, [
        { value: R(b * n), tag: 'exponent-rule', feedback: `An exponent is repeated multiplication, not multiplication by the exponent. $${b}^{${n}}$ means ${n} factors of ${b}.` },
        { value: R(n ** b), tag: 'exponent-rule', feedback: 'The base is the big number and the exponent is the small raised number. Use the base as the repeated factor.' },
      ]),
    };
  }
  if (k === 1) {
    const n = rng.int(2, 6);
    const v = R(10 ** n);
    return {
      prompt: evalPrompt(`10^{${n}}`),
      answer: numAns(v),
      inputHint: INT_INPUT,
      hints: ['An exponent tells how many times to use the base as a factor.', `$10^{${n}}$ means ${n} factors of 10.`, 'Each factor of 10 adds one zero.', `Write 1 followed by ${n} zeros.`],
      solution: [{ text: `Multiply ${n} tens.`, tex: `10^{${n}} = ${Array(n).fill('10').join(' \\cdot ')} = ${v.toString()}`, why: 'Each factor of 10 shifts the digits one place, adding a zero.' }],
      mis: mis(v, [{ value: R(10 * n), tag: 'exponent-rule', feedback: `$10^{${n}}$ is ${n} factors of 10 multiplied together, not 10 times ${n}.` }]),
    };
  }
  const a = rng.int(2, 5);
  const b = rng.int(2, 4);
  const v = R(a * a + b ** 3);
  return {
    prompt: evalPrompt(`${a}^{2} + ${b}^{3}`),
    answer: numAns(v),
    inputHint: INT_INPUT,
    hints: ['Evaluate each power first, then add.', `$${a}^{2}$ means ${a} × ${a}.`, `$${b}^{3}$ means ${b} × ${b} × ${b}.`, 'Add the two results.'],
    solution: [powSteps(String(a), 2, R(a * a)), powSteps(String(b), 3, R(b ** 3)), { text: 'Add.', tex: `${a * a} + ${b ** 3} = ${v.toString()}`, why: 'Exponents come before addition.' }],
    mis: mis(v, [{ value: R(2 * a + 3 * b), tag: 'exponent-rule', feedback: 'An exponent means repeated multiplication of the base, not multiplying the base by the exponent.' }]),
  };
};

const expMid: Shape = (rng) => {
  const k = rng.int(0, 3);
  if (k === 0) {
    const b = rng.int(2, 5);
    // mostly even powers, where (-b)^n and -b^n differ; odd powers practice the sign of a negative base
    const n = rng.next() < 0.7 ? (b <= 3 ? rng.pick([2, 4]) : 2) : 3;
    const paren = rng.bool();
    const v = paren ? R((-b) ** n) : R(-(b ** n));
    const other = paren ? R(-(b ** n)) : R((-b) ** n);
    const tex = paren ? `(-${b})^{${n}}` : `-${b}^{${n}}`;
    return {
      prompt: evalPrompt(tex),
      answer: numAns(v),
      inputHint: INT_INPUT,
      hints: [
        'Decide what the base is: the exponent applies only to what it is directly attached to.',
        paren ? `With parentheses, the base is $-${b}$, so you multiply ${n} factors of $-${b}$.` : `Without parentheses, the base is ${b}; the negative sign is applied after the power: $-(${b}^{${n}})$.`,
        paren ? `Count the negative factors: ${n} of them. An ${n % 2 === 0 ? 'even' : 'odd'} number of negative factors gives a ${n % 2 === 0 ? 'positive' : 'negative'} product.` : `Find $${b}^{${n}}$ first, then take its opposite.`,
        paren ? `Multiply ${Array(n).fill(`(-${b})`).join('')}.` : `$${b}^{${n}}$ is positive, so the answer is its opposite.`,
      ],
      solution: [
        paren
          ? { text: `The base is $-${b}$.`, tex: `(-${b})^{${n}} = ${Array(n).fill(`(-${b})`).join('')} = ${v.toString()}`, why: `There are ${n} negative factors. Pairs of negatives multiply to positives${n % 2 ? ', and one negative is left over' : ''}.` }
          : { text: `The base is ${b}; the negative is applied after.`, tex: `-${b}^{${n}} = -(${Array(n).fill(b).join(' \\cdot ')}) = ${v.toString()}`, why: 'Exponents come before taking the opposite (which is like multiplying by -1).' },
      ],
      mis: mis(v, [
        { value: other, tag: 'exponent-rule', feedback: paren ? `The parentheses make $-${b}$ the base, so the negative is multiplied ${n} times.` : `Without parentheses, the exponent applies only to ${b}. Find $${b}^{${n}}$, then take the opposite.` },
        { value: R(-b * n), tag: 'exponent-rule', feedback: 'An exponent means repeated multiplication of the base, not multiplying by the exponent.' },
      ]),
    };
  }
  if (k === 1) {
    const f = rng.pick([R(1, 2), R(2, 3), R(3, 4), R(1, 3), R(2, 5), R(3, 2)]);
    const n = f.num === 1n || f.eq(R(2, 3)) || f.eq(R(1, 2)) ? rng.int(2, 3) : 2;
    const v = f.pow(n);
    return {
      prompt: evalPrompt(`\\left(${f.toTex()}\\right)^{${n}}`),
      answer: numAns(v),
      inputHint: FRAC_INPUT,
      hints: ['The parentheses make the whole fraction the base.', `Multiply ${n} copies of $${f.toTex()}$.`, 'Raise the numerator and the denominator to the power.', `Find $${f.num}^{${n}}$ and $${f.den}^{${n}}$.`],
      solution: [{ text: 'Use the fraction as a repeated factor.', tex: `\\left(${f.toTex()}\\right)^{${n}} = \\frac{${f.num}^{${n}}}{${f.den}^{${n}}} = ${v.toTex()}`, why: 'Multiplying fractions multiplies the numerators and the denominators, so each gets the exponent.' }],
      mis: mis(v, [
        { value: R(Number(f.num) ** n, Number(f.den)), tag: 'exponent-rule', feedback: 'The whole fraction is the base, so the denominator is raised to the power too.' },
        { value: f.mul(R(n)), tag: 'exponent-rule', feedback: 'An exponent means repeated multiplication, not multiplying by the exponent.' },
      ]),
    };
  }
  if (k === 2) {
    const b = rng.int(2, 3);
    const m = rng.int(2, 3);
    const n = rng.int(1, 3);
    const v = R(b ** (m + n));
    return {
      prompt: evalPrompt(`${b}^{${m}} \\cdot ${b}^{${n}}`),
      answer: numAns(v),
      inputHint: INT_INPUT,
      hints: ['Count the factors of the base.', `$${b}^{${m}}$ is ${m} factors of ${b} and $${b}^{${n}}$ is ${n} factor${n === 1 ? '' : 's'} of ${b}.`, `Altogether there are ${m} + ${n} factors of ${b}.`, `Multiply that many ${b}s, or evaluate each power and multiply.`],
      solution: [
        { text: 'Same base: add the exponents.', tex: `${b}^{${m}} \\cdot ${b}^{${n}} = ${b}^{${m + n}}`, why: `There are ${m} factors of ${b} and then ${n} more, so ${m + n} in all.` },
        { text: 'Evaluate.', tex: `${b}^{${m + n}} = ${v.toString()}` },
      ],
      mis: mis(v, [
        { value: R(b ** (m * n)), tag: 'exponent-rule', feedback: 'When you multiply powers with the same base, the factors are counted together, so add the exponents (do not multiply them).' },
        { value: R((b * b) ** (m + n)), tag: 'exponent-rule', feedback: 'Keep the base the same; do not multiply the bases together.' },
      ]),
    };
  }
  const b = rng.int(2, 12);
  const neg = rng.bool();
  const tex = neg ? `(-${b})^{0} + ${b}^{1}` : `${b}^{0} + ${b}^{1}`;
  const v = R(1 + b);
  // the base of the zero power: -b when it is in parentheses
  const zb = neg ? `(-${b})` : `${b}`;
  const zv = neg ? -b : b;
  return {
    prompt: evalPrompt(tex),
    answer: numAns(v),
    inputHint: INT_INPUT,
    hints: [
      'Think about the pattern: each time the exponent goes down by 1, you divide by the base.',
      `$${b}^{1}$ is just ${b}: a single factor of ${b}.`,
      neg ? `In $(-${b})^{0}$ the parentheses make $-${b}$ the base. $(-${b})^{1} = -${b}$, and dividing by the base $-${b}$ gives $(-${b})^{0}$.` : `$${b}^{1} = ${b}$, and dividing by the base ${b} gives $${b}^{0}$.`,
      'Any nonzero number to the power 0 is 1, even a negative one.',
    ],
    solution: [
      { text: 'Evaluate the power with exponent 0.', tex: `${zb}^{0} = 1`, why: `Going from $${zb}^{1}$ to $${zb}^{0}$ divides by the base: $${zv} \\div ${pi(zv)} = 1$. This works for any nonzero base, negative ones too.` },
      { text: 'Add.', tex: `1 + ${b} = ${v.toString()}`, why: `Any number to the power 1 is itself, so $${b}^{1} = ${b}$.` },
    ],
    mis: mis(v, [
      { value: R(b), tag: 'exponent-rule', feedback: 'A nonzero number to the power 0 is 1, not 0.' },
      { value: R(2 * b), tag: 'exponent-rule', feedback: 'A number to the power 0 is 1, not the number itself.' },
      { value: neg ? R(b - 1) : null, tag: 'exponent-rule', feedback: 'The parentheses make $-' + b + '$ the base, and any nonzero base to the power 0 is 1.' },
    ]),
  };
};

const expHard: Shape = (rng) => {
  const k = rng.int(0, 3);
  if (k === 0) {
    const [b, n] = rng.pick([[2, 1], [2, 2], [2, 3], [3, 1], [3, 2], [4, 1], [5, 2], [10, 2], [10, 3], [4, 2]] as Array<[number, number]>);
    const v = R(1, b ** n);
    return {
      prompt: evalPrompt(`${b}^{-${n}}`),
      answer: numAns(v),
      inputHint: FRAC_INPUT,
      hints: ['A negative exponent does not make the number negative.', 'Each step down in the exponent divides by the base: $b^{1}$, $b^{0} = 1$, $b^{-1} = \\frac{1}{b}$, ...', `$${b}^{-${n}}$ is the reciprocal of $${b}^{${n}}$.`, `Find $${b}^{${n}}$ and write 1 over it.`],
      solution: [
        { text: 'A negative exponent means the reciprocal.', tex: `${b}^{-${n}} = \\frac{1}{${b}^{${n}}}`, why: `Dividing by ${b} again and again past $${b}^{0} = 1$ gives fractions with ${b} in the denominator.` },
        { text: 'Evaluate.', tex: `\\frac{1}{${b ** n}}${v.isTerminatingDecimal() ? ` = ${numStr(v)}` : ''}` },
      ],
      mis: mis(v, [
        { value: R(-(b ** n)), tag: 'exponent-rule', feedback: 'A negative exponent means a reciprocal, not a negative number.' },
        { value: R(-b * n), tag: 'exponent-rule', feedback: 'A negative exponent means a reciprocal; an exponent is never multiplied by the base.' },
        { value: R(-1, b ** n), tag: 'exponent-rule', feedback: 'The reciprocal of a positive number is positive. A negative exponent does not change the sign.' },
      ]),
    };
  }
  if (k === 1) {
    const a = rng.int(2, 5);
    const c = rng.int(2, 3);
    const v = R(-a * a + (-c) ** 3);
    return {
      tags: ['multi-step'],
      prompt: evalPrompt(`-${a}^{2} + (-${c})^{3}`),
      answer: numAns(v),
      inputHint: INT_INPUT,
      hints: ['Find the base of each power: is the negative sign inside parentheses or not?', `$-${a}^{2}$ is the opposite of $${a}^{2}$.`, `$(-${c})^{3}$ has three negative factors.`, 'Evaluate each part, then add.'],
      solution: [
        { text: `$-${a}^{2}$: the base is ${a}.`, tex: `-${a}^{2} = -(${a} \\cdot ${a}) = ${-a * a}`, why: 'Without parentheses, the exponent applies only to the number.' },
        { text: `$(-${c})^{3}$: the base is $-${c}$.`, tex: `(-${c})^{3} = (-${c})(-${c})(-${c}) = ${(-c) ** 3}`, why: 'An odd number of negative factors gives a negative product.' },
        { text: 'Add.', tex: `${-a * a} + (${(-c) ** 3}) = ${v.toString()}`, why: 'Adding two negative numbers gives a more negative number.' },
      ],
      mis: mis(v, [
        { value: R(a * a + (-c) ** 3), tag: 'exponent-rule', feedback: `$-${a}^{2}$ means $-(${a}^{2})$, which is negative.` },
        { value: R(-a * a + c ** 3), tag: 'sign-error', feedback: `$(-${c})^{3}$ has three negative factors, so it is negative.` },
      ]),
    };
  }
  if (k === 2) {
    if (rng.bool()) {
      const b = rng.int(2, 5);
      const n = rng.int(2, 4);
      const m = n + rng.int(1, b === 2 ? 4 : 2);
      const v = R(b ** (m - n));
      return {
        prompt: evalPrompt(`\\frac{${b}^{${m}}}{${b}^{${n}}}`),
        answer: numAns(v),
        inputHint: INT_INPUT,
        hints: ['Write the top and bottom as repeated factors.', `There are ${m} factors of ${b} on top and ${n} on the bottom.`, 'Each factor on the bottom cancels one factor on top.', `Subtract to find how many factors of ${b} are left on top, then multiply them out.`],
        solution: [
          { text: 'Same base: subtract the exponents.', tex: `\\frac{${b}^{${m}}}{${b}^{${n}}} = ${b}^{${m} - ${n}} = ${b}^{${m - n}}`, why: `${n} factors of ${b} on the bottom cancel ${n} of the ${m} factors on top.` },
          { text: 'Evaluate.', tex: `${b}^{${m - n}} = ${v.toString()}` },
        ],
        mis: mis(v, [
          { value: m % n === 0 ? R(b ** (m / n)) : null, tag: 'exponent-rule', feedback: 'When you divide powers with the same base, subtract the exponents; do not divide them.' },
          { value: R(1 ** (m - n)), tag: 'exponent-rule', feedback: 'Keep the base: the bases do not divide to 1, the factors cancel.' },
        ]),
      };
    }
    const b = rng.int(2, 3);
    const m = 2;
    const n = b === 2 ? rng.int(2, 3) : 2;
    const v = R(b ** (m * n));
    return {
      prompt: evalPrompt(`\\left(${b}^{${m}}\\right)^{${n}}`),
      answer: numAns(v),
      inputHint: INT_INPUT,
      hints: [`The base $${b}^{${m}}$ is used ${n} times as a factor.`, `Each copy of $${b}^{${m}}$ has ${m} factors of ${b}.`, `${n} copies with ${m} factors each: how many factors of ${b}?`, 'Multiply the exponents, then evaluate.'],
      solution: [
        { text: 'Power of a power: multiply the exponents.', tex: `\\left(${b}^{${m}}\\right)^{${n}} = ${b}^{${m} \\cdot ${n}} = ${b}^{${m * n}}`, why: `${n} groups of ${m} factors make ${m * n} factors of ${b}.` },
        { text: 'Evaluate.', tex: `${b}^{${m * n}} = ${v.toString()}` },
      ],
      mis: mis(v, [{ value: R(b ** (m + n)), tag: 'exponent-rule', feedback: 'A power of a power multiplies the exponents: there are several groups, each with the same number of factors.' }]),
    };
  }
  const n = rng.int(2, 4);
  const dd = rng.int(2, 3);
  const f = R(-1, dd);
  const v = f.pow(n);
  return {
    prompt: evalPrompt(`\\left(-\\frac{1}{${dd}}\\right)^{${n}}`),
    answer: numAns(v),
    inputHint: FRAC_INPUT,
    hints: ['The parentheses make $-\\frac{1}{' + dd + '}$ the base.', `Multiply ${n} copies of $-\\frac{1}{${dd}}$.`, `An ${n % 2 === 0 ? 'even' : 'odd'} number of negative factors gives a ${n % 2 === 0 ? 'positive' : 'negative'} result.`, `The denominator is $${dd}^{${n}}$.`],
    solution: [{ text: 'Multiply the repeated factors.', tex: `\\left(-\\frac{1}{${dd}}\\right)^{${n}} = \\frac{(-1)^{${n}}}{${dd}^{${n}}} = ${v.toTex()}`, why: `${n} negative factors: ${n % 2 === 0 ? 'they pair up into positives' : 'after pairing, one negative is left'}.` }],
    mis: mis(v, [
      { value: v.neg(), tag: 'sign-error', feedback: `Count the negative factors: ${n} of them.` },
      { value: R(-n, dd), tag: 'exponent-rule', feedback: 'An exponent means repeated multiplication, not multiplying by the exponent.' },
    ]),
  };
};

export const genPrereqExp = makeGen(
  'p.exp',
  'P.EXP',
  'Exponents: evaluate powers of whole numbers, negatives (including -b^n versus (-b)^n), fractions, zero and negative exponents, and products, quotients and powers of powers.',
  { 1: [expBasic], 2: [expMid], 3: [expHard] },
  (pr) => verifyEvaluate(pr) ?? ['unrecognized prompt'],
);

// ---------------------------------------------------------------------------
// P.ROOTS: perfect squares, cubes and their roots
// ---------------------------------------------------------------------------

const rootsBasic: Shape = (rng) => {
  const k = rng.int(0, 2);
  if (k === 0) {
    const n = rng.int(2, 15);
    return {
      prompt: evalPrompt(`\\sqrt{${n * n}}`),
      answer: numAns(R(n)),
      inputHint: INT_INPUT,
      hints: ['The square root of a number is the number that, multiplied by itself, gives it.', `Which number times itself is ${n * n}?`, 'Think of the perfect squares: 1, 4, 9, 16, 25, 36, 49, 64, 81, 100, 121, 144, 169, 196, 225.', 'Check your answer by squaring it.'],
      solution: [{ text: `Find the number whose square is ${n * n}.`, tex: `${n}^{2} = ${n * n}`, why: 'Square root undoes squaring.' }, { text: 'So:', tex: `\\sqrt{${n * n}} = ${n}`, why: 'The square root symbol asks for the positive number whose square is under it.' }],
      mis: mis(R(n), [{ value: R(n * n, 2), tag: 'other', feedback: 'Taking a square root is not dividing by 2. Find the number that times itself gives the number under the root.' }]),
    };
  }
  if (k === 1) {
    const n = rng.int(2, 6);
    return {
      prompt: evalPrompt(`\\sqrt[3]{${n ** 3}}`),
      answer: numAns(R(n)),
      inputHint: INT_INPUT,
      hints: ['The cube root of a number is the number that, used as a factor three times, gives it.', `Which number times itself times itself is ${n ** 3}?`, 'Perfect cubes: 1, 8, 27, 64, 125, 216.', 'Check by cubing your answer.'],
      solution: [{ text: `Find the number whose cube is ${n ** 3}.`, tex: `${n}^{3} = ${n} \\cdot ${n} \\cdot ${n} = ${n ** 3}`, why: 'Cube root undoes cubing.' }, { text: 'So:', tex: `\\sqrt[3]{${n ** 3}} = ${n}`, why: 'The cube root asks for the number whose cube is under it.' }],
      mis: mis(R(n), [{ value: R(n ** 3, 3), tag: 'other', feedback: 'A cube root is not dividing by 3. Find the number that, multiplied by itself three times, gives the number.' }]),
    };
  }
  const n = rng.int(3, 15);
  const unit = rng.pick(['feet', 'meters', 'inches', 'centimeters']);
  return {
    tags: ['word', 'real-world'],
    prompt: [p(`A square has an area of $${n * n}$ square ${unit}. How long is each side, in ${unit}?`)],
    answer: numAns(R(n)),
    inputHint: 'Type a number.',
    hints: ['The area of a square is side × side.', 'You need a number that, times itself, gives the area.', 'That is the square root of the area.', 'Check by squaring your answer.'],
    solution: [{ text: 'The area of a square is $s^{2}$, so the side is the square root of the area.', tex: `s = \\sqrt{${n * n}} = ${n}`, why: `${n} × ${n} = ${n * n}.` }],
    mis: mis(R(n), [
      { value: R(n * n, 4), tag: 'formula-error', feedback: 'Dividing by 4 finds a side from the perimeter, not from the area. Area is side times side.' },
      { value: R(n * n, 2), tag: 'other', feedback: 'A square root is not half the number. Find the number that times itself gives the area.' },
    ]),
  };
};

const rootsMid: Shape = (rng) => {
  const k = rng.int(0, 4);
  if (k === 0) {
    const n = rng.int(2, 12);
    return {
      prompt: evalPrompt(`-\\sqrt{${n * n}}`),
      answer: numAns(R(-n)),
      inputHint: INT_INPUT,
      hints: ['The negative sign is outside the root.', `First find $\\sqrt{${n * n}}$.`, 'The square root symbol gives the positive root.', 'Then take the opposite.'],
      solution: [{ text: 'Find the square root, then take the opposite.', tex: `-\\sqrt{${n * n}} = -(${n}) = ${-n}`, why: 'The $\\sqrt{\\ }$ symbol means the positive square root; the minus sign in front makes it negative.' }],
      mis: mis(R(-n), [{ value: R(n), tag: 'sign-error', feedback: 'The negative sign outside the root still applies. Take the opposite of the square root.' }]),
    };
  }
  if (k === 1) {
    const n = rng.int(2, 5);
    return {
      prompt: evalPrompt(`\\sqrt[3]{-${n ** 3}}`),
      answer: numAns(R(-n)),
      inputHint: INT_INPUT,
      hints: ['A cube root can be negative, because a negative number cubed is negative.', `Which number, used as a factor three times, gives $-${n ** 3}$?`, `Start with $\\sqrt[3]{${n ** 3}}$, then think about the sign.`, 'Three negative factors give a negative product.'],
      solution: [{ text: 'Find the number whose cube is the given number.', tex: `(${-n})^{3} = (${-n})(${-n})(${-n}) = -${n ** 3}`, why: 'Three negative factors multiply to a negative.' }, { text: 'So:', tex: `\\sqrt[3]{-${n ** 3}} = ${-n}`, why: 'Unlike square roots, cube roots of negative numbers exist.' }],
      mis: mis(R(-n), [{ value: R(n), tag: 'sign-error', feedback: `${n} cubed is positive. The number under the cube root is negative, so the cube root is negative.` }]),
    };
  }
  if (k === 2) {
    const a = rng.int(1, 9);
    let b = rng.int(a + 1, 12);
    while (gcdN(a, b) !== 1) b++;
    const v = R(a, b);
    return {
      prompt: evalPrompt(`\\sqrt{\\frac{${a * a}}{${b * b}}}`),
      answer: numAns(v),
      inputHint: FRAC_INPUT,
      hints: ['The square root of a fraction is the root of the top over the root of the bottom.', `Find $\\sqrt{${a * a}}$.`, `Find $\\sqrt{${b * b}}$.`, 'Check by squaring your fraction.'],
      solution: [{ text: 'Take the square root of the numerator and of the denominator.', tex: `\\sqrt{\\frac{${a * a}}{${b * b}}} = \\frac{\\sqrt{${a * a}}}{\\sqrt{${b * b}}} = ${v.toTex()}`, why: `$\\left(${v.toTex()}\\right)^{2} = \\frac{${a * a}}{${b * b}}$, so this is the square root.` }],
      mis: mis(v, [{ value: R(a, b * b), tag: 'radical-simplify', feedback: 'Take the square root of the denominator too.' }]),
    };
  }
  if (k === 3) {
    const n = rng.int(1, 9);
    const v = R(n, 10);
    const sq = R(n * n, 100);
    return {
      prompt: evalPrompt(`\\sqrt{${numStr(sq)}}`),
      answer: decAns(v),
      inputHint: 'Type a decimal or a fraction.',
      hints: ['Write the decimal as a fraction first.', `$${numStr(sq)} = \\frac{${n * n}}{100}$.`, 'Take the square root of the top and the bottom.', 'Check by squaring your answer.'],
      solution: [{ text: 'Rewrite as a fraction and take square roots.', tex: `\\sqrt{${numStr(sq)}} = \\sqrt{\\frac{${n * n}}{100}} = \\frac{${n}}{10} = ${numStr(v)}`, why: `Check: $${numStr(v)} \\times ${numStr(v)} = ${numStr(sq)}$.` }],
      mis: mis(v, [{ value: R(n, 100), tag: 'other', feedback: `Check by squaring: hundredths times hundredths gives ten-thousandths. The answer must square to ${numStr(sq)}.` }]),
    };
  }
  const cube = rng.bool();
  if (cube) {
    const n = rng.int(2, 5);
    const N = -(n ** 3);
    return {
      prompt: [p(`Solve $x^{3} = ${N}$.`)],
      answer: { kind: 'solutions', values: [String(-n)], variable: 'x' },
      inputHint: 'Type the solution, like x = 4. If there is more than one, separate them with commas.',
      hints: ['Undo cubing with a cube root.', `Which number, used as a factor three times, gives ${N}?`, 'A negative number cubed is negative.', 'A cube has only one real cube root.'],
      solution: [{ text: 'Take the cube root of both sides.', tex: `x = \\sqrt[3]{${N}} = ${-n}`, why: `$(${-n})^{3} = ${N}$. Only one real number has this cube.` }],
      mis: [{ answer: String(n), tag: 'sign-error', feedback: `${n} cubed is positive, but the right side is negative.` }],
    };
  }
  const n = rng.int(2, 12);
  return {
    prompt: [p(`Solve $x^{2} = ${n * n}$.`)],
    answer: { kind: 'solutions', values: [String(n), String(-n)], variable: 'x' },
    inputHint: 'Type every solution, separated by commas, like x = 4, -4.',
    hints: ['Undo squaring with a square root.', `Which numbers, multiplied by themselves, give ${n * n}?`, 'A negative number squared is also positive.', 'There are two solutions.'],
    solution: [{ text: 'Take the square root of both sides, keeping both signs.', tex: `x = \\pm\\sqrt{${n * n}} = \\pm ${n}`, why: `Both $${n}^{2}$ and $(${-n})^{2}$ equal ${n * n}.` }],
    mis: n * n % 2 === 0 ? [{ answer: `${(n * n) / 2}|${-(n * n) / 2}`, tag: 'other', feedback: 'Undo squaring with a square root, not by dividing by 2.' }] : [],
  };
};

const rootsHard: Shape = (rng) => {
  const k = rng.int(0, 3);
  if (k === 0) {
    const [a, b, c] = rng.pick([[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 15, 17], [9, 12, 15], [12, 16, 20], [7, 24, 25]] as Array<[number, number, number]>);
    const shown = rng.bool() ? `\\sqrt{${a}^2 + ${b}^2}` : `\\sqrt{${a * a} + ${b * b}}`;
    return {
      tags: ['multi-step'],
      prompt: evalPrompt(shown),
      answer: numAns(R(c)),
      inputHint: INT_INPUT,
      hints: ['The root symbol acts as a grouping symbol: simplify everything under it first.', 'Add the numbers under the root before taking the square root.', `The total under the root is a perfect square.`, 'You cannot take the root of each part separately.'],
      solution: [
        { text: 'Simplify under the root.', tex: `${a * a} + ${b * b} = ${c * c}`, why: 'Everything under the root symbol is grouped, like parentheses.' },
        { text: 'Take the square root.', tex: `\\sqrt{${c * c}} = ${c}`, why: `$${c}^{2} = ${c * c}$.` },
      ],
      mis: mis(R(c), [{ value: R(a + b), tag: 'radical-simplify', feedback: 'The square root of a sum is not the sum of the square roots. Add under the root first.' }]),
    };
  }
  if (k === 1) {
    const kk = rng.int(2, 11);
    const N = kk * kk + rng.int(1, 2 * kk);
    return {
      prompt: [p(`The number $\\sqrt{${N}}$ is between two consecutive whole numbers. What is the smaller one?`)],
      answer: numAns(R(kk)),
      inputHint: 'Type a whole number.',
      hints: ['Compare the number under the root with perfect squares.', `Find the perfect squares just below and just above ${N}.`, 'If $a^{2} < N < b^{2}$, then $\\sqrt{N}$ is between $a$ and $b$.', 'Give the smaller of the two whole numbers.'],
      solution: [
        { text: `${N} is between two consecutive perfect squares.`, tex: `${kk}^{2} = ${kk * kk} < ${N} < ${(kk + 1) ** 2} = ${kk + 1}^{2}`, why: 'Square roots keep the order of positive numbers.' },
        { text: 'Take square roots.', tex: `${kk} < \\sqrt{${N}} < ${kk + 1}`, why: `So the smaller whole number is ${kk}.` },
      ],
      mis: mis(R(kk), [
        { value: R(kk + 1), tag: 'other', feedback: 'That is the larger of the two whole numbers. The question asks for the smaller one.' },
        { value: R(Math.floor(N / 2)), tag: 'other', feedback: 'A square root is not half of a number. Compare with perfect squares.' },
      ]),
    };
  }
  if (k === 2) {
    const a = rng.int(2, 3);
    const n = rng.int(2, 10);
    const c = rng.int(2, 4);
    const v = a * n + c;
    return {
      tags: ['multi-step'],
      prompt: evalPrompt(`${a}\\sqrt{${n * n}} - \\sqrt[3]{-${c ** 3}}`),
      answer: numAns(R(v)),
      inputHint: INT_INPUT,
      hints: ['Evaluate each root first.', `$${a}\\sqrt{${n * n}}$ means ${a} times the square root.`, `The cube root of a negative number is negative.`, 'Subtracting a negative number is adding.'],
      solution: [
        { text: 'Evaluate the roots.', tex: `\\sqrt{${n * n}} = ${n},\\quad \\sqrt[3]{-${c ** 3}} = ${-c}`, why: `$${n}^{2} = ${n * n}$ and $(${-c})^{3} = -${c ** 3}$.` },
        { text: 'Multiply, then subtract.', tex: `${a} \\cdot ${n} - (${-c}) = ${a * n} + ${c} = ${v}`, why: 'Subtracting a negative is the same as adding.' },
      ],
      mis: mis(R(v), [
        { value: R(a * n - c), tag: 'sign-error', feedback: 'The cube root is negative, and subtracting a negative means adding.' },
        { value: R(a * n * n - c), tag: 'other', feedback: 'Take the square root before multiplying.' },
      ]),
    };
  }
  const a = rng.int(2, 4);
  const n = rng.int(2, 7);
  const b = rng.nonzeroInt(-12, 12);
  const c = a * n * n + b;
  return {
    tags: ['multi-step'],
    prompt: [p(`Solve $${a}x^{2}${plusTex(R(b))} = ${c}$.`)],
    answer: { kind: 'solutions', values: [String(n), String(-n)], variable: 'x' },
    inputHint: 'Type every solution, separated by commas, like x = 4, -4.',
    hints: ['Get $x^{2}$ by itself first, the same way you would isolate $x$.', `${b < 0 ? 'Add' : 'Subtract'} ${Math.abs(b)} on both sides, then divide by ${a}.`, 'Then undo the square with a square root.', 'Remember that a negative number squared is also positive.'],
    solution: [
      { text: `${b < 0 ? 'Add' : 'Subtract'} ${Math.abs(b)} on both sides.`, tex: `${a}x^{2} = ${a * n * n}`, why: 'Keep the equation balanced.' },
      { text: `Divide by ${a}.`, tex: `x^{2} = ${n * n}`, why: 'Now $x^{2}$ is alone.' },
      { text: 'Take the square root, keeping both signs.', tex: `x = \\pm ${n}`, why: `Both $${n}^{2}$ and $(${-n})^{2}$ equal ${n * n}.` },
    ],
    mis: [{ answer: `${n * n}|${-n * n}`, tag: 'other', feedback: 'You found $x^{2}$. Take the square root to find $x$.' }],
  };
};

function verifyRoots(pr: Problem): string[] {
  const ev = verifyEvaluate(pr);
  if (ev) return ev;
  const text = firstText(pr);
  let m = /^A square has an area of \$(\d+)\$ square \w+\./.exec(text);
  if (m) {
    const k = keyOf(pr);
    return k.isNegative() || !k.mul(k).eq(Q(m[1])) ? ['side squared is not the area'] : [];
  }
  m = /^The number \$\\sqrt\{(\d+)\}\$ is between two consecutive whole numbers\./.exec(text);
  if (m) {
    const k = keyOf(pr);
    const N = Q(m[1]);
    return k.mul(k).lt(N) && k.add(R(1)).mul(k.add(R(1))).gt(N) && !k.isNegative() ? [] : ['key squared and its successor squared do not surround N'];
  }
  m = /^Solve \$([^$]+)\$\.$/.exec(text);
  if (m && pr.answer.kind === 'solutions') {
    const rel = parseRelation(texPlain(m[1]));
    const diff = toPoly(rel.lhs).sub(toPoly(rel.rhs));
    const deg = diff.degreeIn('x');
    const vals = pr.answer.values.map((v) => exactValue(v)?.rationalPart());
    const errs: string[] = [];
    if (vals.some((v) => !v)) return ['a solution is not a number'];
    for (const v of vals) if (!diff.evaluate({ x: v! }).isZero()) errs.push(`x = ${v!.toString()} does not satisfy the equation`);
    if (new Set(vals.map((v) => v!.toString())).size !== vals.length) errs.push('repeated solution');
    // a quadratic has at most 2 roots; x^3 = c (c real) has exactly one real root
    const need = deg === 2 ? 2 : 1;
    if (vals.length !== need) errs.push(`expected ${need} solution(s)`);
    return errs;
  }
  return ['unrecognized prompt'];
}

export const genPrereqRoots = makeGen(
  'p.roots',
  'P.ROOTS',
  'Perfect squares and cubes: square and cube roots (including negatives, fractions and decimals), x^2 = p and x^3 = p, estimating a root between whole numbers, and roots of sums.',
  { 1: [rootsBasic], 2: [rootsMid], 3: [rootsHard] },
  verifyRoots,
);

// ---------------------------------------------------------------------------
// P.PCT: percents
// ---------------------------------------------------------------------------

const pctToDec =
  (pool: number[]): Shape =>
  (rng) => {
    const pc = Q(rng.pick(pool));
    const v = pc.div(R(100));
    const s = numStr(pc);
    return {
      prompt: [p(`Write ${s}% as a decimal.`)],
      answer: decAns(v),
      inputHint: 'Type a decimal, like 0.4.',
      hints: ['Percent means "per hundred".', `${s}% means ${s} out of 100.`, 'Divide by 100 to change a percent to a decimal.', 'Dividing by 100 moves the decimal point two places to the left. Add zeros as placeholders if you need them.'],
      solution: [{ text: 'Divide by 100.', tex: `${s}\\% = \\frac{${s}}{100} = ${numStr(v)}`, why: 'Percent means per hundred, so the percent number is a number of hundredths.' }],
      mis: mis(v, [
        { value: pc.div(R(10)), tag: 'percent-rate', feedback: 'Move the decimal point two places, not one: percent means per hundred.' },
        { value: pc.div(R(1000)), tag: 'percent-rate', feedback: 'Move the decimal point exactly two places: percent means per hundred.' },
        { value: pc, tag: 'percent-rate', feedback: 'Write the percent as a decimal by dividing by 100.' },
      ]),
    };
  };

const decToPct: Shape = (rng) => {
  const d = R(rng.pick([4, 6, 12, 25, 35, 45, 60, 75, 8, 2, 85, 125, 150]), 100);
  const v = d.mul(R(100));
  return {
    prompt: [p(`Write ${numStr(d)} as a percent.`)],
    answer: numAns(v),
    inputHint: 'Type the percent, like 45 or 45%.',
    hints: ['A percent is a number of hundredths.', `How many hundredths is ${numStr(d)}?`, 'Multiply by 100 to change a decimal to a percent.', 'Multiplying by 100 moves the decimal point two places to the right.'],
    solution: [{ text: 'Multiply by 100.', tex: `${numStr(d)} = \\frac{${numStr(v)}}{100} = ${numStr(v)}\\%`, why: 'Percent means per hundred, so count the hundredths.' }],
    mis: mis(v, [
      { value: d.mul(R(10)), tag: 'percent-rate', feedback: 'Move the decimal point two places, not one: a percent counts hundredths.' },
      { value: d, tag: 'percent-rate', feedback: 'To write a decimal as a percent, multiply by 100.' },
    ]),
  };
};

const pctOf: Shape = (rng) => {
  const pc = rng.pick([10, 20, 25, 30, 40, 50, 60, 75, 5, 15]);
  const step = pc % 25 === 0 ? 4 : pc % 10 === 0 ? 10 : 20;
  const N = step * rng.int(2, 15);
  const v = R(pc * N, 100);
  return {
    prompt: [p(`Find ${pc}% of ${N}.`)],
    answer: numAns(v),
    inputHint: 'Type a number.',
    hints: ['"Percent of" means multiply by the percent written as a decimal or fraction.', `${pc}% is $\\frac{${pc}}{100}$, or ${numStr(R(pc, 100))}.`, `You could find 1% of ${N} first by dividing by 100, or 10% by dividing by 10.`, `Multiply ${N} by ${numStr(R(pc, 100))}.`],
    solution: [{ text: 'Change the percent to a decimal and multiply.', tex: `${numStr(R(pc, 100))} \\times ${N} = ${numStr(v)}`, why: `${pc}% of a number is ${pc} hundredths of it.` }],
    mis: mis(v, [
      { value: R(pc * N, 10), tag: 'percent-rate', feedback: 'Percent means per hundred: divide by 100, not 10.' },
      { value: R(pc * N), tag: 'percent-rate', feedback: 'Change the percent to a decimal (divide by 100) before multiplying.' },
    ]),
  };
};

const pctWhat: Shape = (rng) => {
  const whole = rng.pick([20, 25, 40, 50, 80, 200]);
  const pc = rng.pick([10, 20, 30, 40, 60, 70, 80, 90, 15, 35, 45, 5].filter((x) => (x * whole) % 100 === 0));
  const part = (pc * whole) / 100;
  return {
    prompt: [p(`What percent of ${whole} is ${part}?`)],
    answer: numAns(R(pc)),
    inputHint: 'Type the percent, like 45 or 45%.',
    hints: ['A percent compares a part to the whole, out of 100.', `Write the part over the whole: $\\frac{${part}}{${whole}}$.`, 'Change the fraction to a decimal, then to a percent.', 'Multiply the decimal by 100.'],
    solution: [
      { text: 'Write part over whole.', tex: `\\frac{${part}}{${whole}} = ${numStr(R(part, whole))}`, why: 'The fraction tells what part of the whole you have.' },
      { text: 'Change to a percent.', tex: `${numStr(R(part, whole))} \\times 100 = ${pc}\\%`, why: 'Percent means per hundred.' },
    ],
    mis: mis(R(pc), [
      { value: R(part, whole), tag: 'percent-rate', feedback: 'That is the decimal. Multiply by 100 to write it as a percent.' },
      { value: R(whole * 100, part), tag: 'percent-rate', feedback: 'Put the part on top and the whole on the bottom.' },
    ]),
  };
};

const pctWhole: Shape = (rng) => {
  const pc = rng.pick([10, 20, 25, 40, 50, 75, 30, 60]);
  const step = pc % 25 === 0 ? 4 : pc % 20 === 0 ? 5 : 10;
  const whole = step * rng.int(2, 20);
  const part = (pc * whole) / 100;
  return {
    prompt: [p(`${part} is ${pc}% of what number?`)],
    answer: numAns(R(whole)),
    inputHint: 'Type a number.',
    hints: ['Let the unknown number be $n$. "Of" means multiply.', `Write the equation: ${part} = ${numStr(R(pc, 100))} × $n$.`, `Divide both sides by ${numStr(R(pc, 100))}.`, `Or: if ${part} is ${pc}%, find 1% first, then 100%.`],
    solution: [
      { text: 'Write an equation.', tex: `${part} = ${numStr(R(pc, 100))}n`, why: `${pc}% of the unknown number is ${part}.` },
      { text: 'Divide by the decimal.', tex: `n = ${part} \\div ${numStr(R(pc, 100))} = ${whole}`, why: `Check: ${pc}% of ${whole} is ${part}.` },
    ],
    mis: mis(R(whole), [{ value: R(pc * part, 100), tag: 'percent-rate', feedback: `${part} is the part. You need the whole, which is bigger than ${part} because ${pc}% is less than 100%.` }]),
  };
};

const pctSale: Shape = (rng) => {
  const pc = rng.pick([10, 20, 25, 30, 40, 50, 15]);
  const step = pc % 25 === 0 ? 4 : pc % 10 === 0 ? 10 : 20;
  const P = step * rng.int(2, 12);
  const disc = R(pc * P, 100);
  const v = R(P).sub(disc);
  const item = rng.pick(['jacket', 'pair of headphones', 'backpack', 'video game']);
  return {
    tags: ['word', 'real-world'],
    prompt: [p(`A ${item} costs ${money(P)}. It is on sale for ${pc}% off. What is the sale price, in dollars?`)],
    answer: { kind: 'number', value: numStr(v), unit: 'dollars' },
    inputHint: 'Type an amount in dollars, like 34.50.',
    hints: ['The discount is a percent of the original price.', `Find ${pc}% of ${money(P)}.`, 'Subtract the discount from the original price.', `Or: paying ${100 - pc}% of the price gives the sale price directly.`],
    solution: [
      { text: 'Find the discount.', tex: `${numStr(R(pc, 100))} \\times ${P} = ${numStr(disc)}`, why: `${pc}% off means you save ${pc} hundredths of the price.` },
      { text: 'Subtract it from the original price.', tex: `${P} - ${numStr(disc)} = ${numStr(v)}`, why: `Equivalently, you pay ${100 - pc}% of the price: ${numStr(R(100 - pc, 100))} × ${P}.` },
    ],
    mis: mis(v, [
      { value: disc, tag: 'percent-rate', feedback: 'That is the amount you save. The sale price is what is left to pay.' },
      { value: R(P - pc), tag: 'percent-rate', feedback: `${pc}% off is not ${pc} dollars off. Find ${pc}% of the price.` },
    ]),
  };
};

const pctChange: Shape = (rng) => {
  const a = rng.pick([20, 25, 40, 50, 60, 80, 120, 200]);
  const pc = rng.pick([10, 20, 25, 50, 75, 5, 30, 15].filter((x) => (x * a) % 100 === 0));
  const up = rng.bool();
  const b = up ? a + (pc * a) / 100 : a - (pc * a) / 100;
  return {
    tags: ['word', 'real-world'],
    prompt: [p(`The price of a concert ticket went from ${money(a)} to ${money(b)}. What is the percent ${up ? 'increase' : 'decrease'}?`)],
    answer: numAns(R(pc)),
    inputHint: 'Type the percent, like 45 or 45%.',
    hints: ['Percent change compares the amount of change to the original amount.', `Find the amount of change: the difference between ${money(a)} and ${money(b)}.`, `Divide the change by the original price, ${money(a)}.`, 'Multiply by 100 to write it as a percent.'],
    solution: [
      { text: 'Find the amount of change.', tex: `${up ? `${b} - ${a}` : `${a} - ${b}`} = ${Math.abs(b - a)}`, why: 'The change is how much the price went up or down.' },
      { text: 'Divide by the original amount and change to a percent.', tex: `\\frac{${Math.abs(b - a)}}{${a}} = ${numStr(R(Math.abs(b - a), a))} = ${pc}\\%`, why: 'Percent change is always measured against the starting value.' },
    ],
    mis: mis(R(pc), [
      { value: R(100 * Math.abs(b - a), b), tag: 'percent-rate', feedback: 'Divide by the original (starting) price, not the new price.' },
      { value: R(Math.abs(b - a)), tag: 'percent-rate', feedback: 'That is the change in dollars. Compare it to the original price to get a percent.' },
    ]),
  };
};

const pctTax: Shape = (rng) => {
  const r = rng.pick([5, 6, 7, 8, 4, 10]);
  const P = rng.int(12, 90);
  const tax = R(r * P, 100);
  const v = R(P).add(tax);
  return {
    tags: ['word', 'real-world'],
    prompt: [p(`A meal costs ${money(P)} before tax. The sales tax rate is ${r}%. What is the total cost with tax, in dollars?`)],
    answer: { kind: 'number', value: numStr(v), unit: 'dollars' },
    inputHint: 'Type an amount in dollars, like 34.50.',
    hints: ['Sales tax is a percent of the price, added on.', `${r}% as a decimal is ${numStr(R(r, 100))}. Be careful with the zero.`, `Find the tax: ${numStr(R(r, 100))} × ${P}.`, 'Add the tax to the price.'],
    solution: [
      { text: 'Find the tax.', tex: `${numStr(R(r, 100))} \\times ${P} = ${numStr(tax)}`, why: `${r}% means ${r} hundredths, which is ${numStr(R(r, 100))}.` },
      { text: 'Add it to the price.', tex: `${P} + ${numStr(tax)} = ${money(v).replace('\\$', '')}`, why: `Equivalently, the total is ${100 + r}% of the price: ${numStr(R(100 + r, 100))} × ${P}.` },
    ],
    mis: mis(v, [
      { value: tax, tag: 'percent-rate', feedback: 'That is just the tax. Add it to the price of the meal.' },
      { value: R(P).add(R(r * P, 10)), tag: 'percent-rate', feedback: `${r}% is ${numStr(R(r, 100))} as a decimal, not ${numStr(R(r, 10))}.` },
      { value: R(P + r), tag: 'percent-rate', feedback: `The tax is ${r}% of the price, not ${r} dollars.` },
    ]),
  };
};

const pctTwoStep: Shape = (rng) => {
  for (;;) {
    const pc = rng.pick([10, 20, 25, 40, 50]);
    const r = rng.pick([5, 6, 8, 10]);
    const step = pc % 25 === 0 ? 4 : 10;
    const P = step * rng.int(3, 15);
    const sale = R(P).mul(R(100 - pc, 100));
    if (!sale.isInteger()) continue;
    const v = sale.mul(R(100 + r, 100));
    return {
      tags: ['word', 'real-world', 'multi-step'],
      prompt: [p(`A pair of shoes costs ${money(P)}. They are ${pc}% off, and then ${r}% sales tax is added to the sale price. What is the final cost, in dollars?`)],
      answer: { kind: 'number', value: numStr(v), unit: 'dollars' },
      inputHint: 'Type an amount in dollars, like 34.50.',
      hints: ['Work in the order the story happens: discount first, then tax.', `Find the sale price: take ${pc}% off ${money(P)}.`, 'The tax is a percent of the sale price, not of the original price.', `Multiply the sale price by ${numStr(R(100 + r, 100))} to add the tax.`],
      solution: [
        { text: 'Apply the discount.', tex: `${P} \\times ${numStr(R(100 - pc, 100))} = ${numStr(sale)}`, why: `${pc}% off means paying ${100 - pc}% of the price.` },
        { text: 'Add the tax on the sale price.', tex: `${numStr(sale)} \\times ${numStr(R(100 + r, 100))} = ${numStr(v)}`, why: `Adding ${r}% tax means paying ${100 + r}% of the sale price.` },
      ],
      mis: mis(v, [
        { value: R(P).mul(R(100 - pc + r, 100)), tag: 'percent-rate', feedback: 'You cannot combine the two percents, because the tax is a percent of the sale price, not of the original price.' },
        { value: sale, tag: 'percent-rate', feedback: 'That is the sale price. Remember to add the sales tax.' },
      ]),
    };
  }
};

function verifyPct(pr: Problem): string[] {
  const text = firstText(pr);
  const key = keyOf(pr);
  let m = /^Write (\d+(?:\.\d+)?)% as a decimal\.$/.exec(text);
  if (m) return same(key.mul(R(100)), Q(m[1]), 'decimal times 100');
  m = /^Write (\d+(?:\.\d+)?) as a percent\.$/.exec(text);
  if (m) return same(key.div(R(100)), Q(m[1]), 'percent over 100');
  m = /^Find (\d+)% of (\d+)\.$/.exec(text);
  if (m) return same(key.div(Q(m[2])).mul(R(100)), Q(m[1]), 'part over whole as a percent');
  m = /^What percent of (\d+) is (\d+)\?$/.exec(text);
  if (m) return same(key.mul(Q(m[1])).div(R(100)), Q(m[2]), 'percent of the whole');
  m = /^(\d+) is (\d+)% of what number\?$/.exec(text);
  if (m) return same(key.mul(Q(m[2])).div(R(100)), Q(m[1]), 'percent of the whole');
  const money2 = moneyNums(text);
  m = /It is on sale for (\d+)% off\./.exec(text);
  if (m) return same(money2[0].sub(key).div(money2[0]).mul(R(100)), Q(m[1]), 'discount as a percent of the price');
  m = /went from \\\$\d+ to \\\$\d+\. What is the percent (increase|decrease)\?/.exec(text);
  if (m) return same(money2[0].mul(R(100).add(m[1] === 'increase' ? key : key.neg())).div(R(100)), money2[1], 'new price from the percent change');
  m = /The sales tax rate is (\d+)%\./.exec(text);
  if (m) return same(key.div(money2[0]).sub(R(1)).mul(R(100)), Q(m[1]), 'tax rate from the total');
  m = /They are (\d+)% off, and then (\d+)% sales tax/.exec(text);
  if (m) {
    // undo the tax, then measure the discount
    const sale = key.div(R(100).add(Q(m[2])).div(R(100)));
    return same(money2[0].sub(sale).div(money2[0]).mul(R(100)), Q(m[1]), 'discount recovered from the final cost');
  }
  return ['unrecognized prompt'];
}

export const genPrereqPct = makeGen(
  'p.pct',
  'P.PCT',
  'Percents: convert between percents and decimals (including 5% and 0.5%), find a percent of a number, the percent, or the whole, discounts, sales tax, percent change and a discount-then-tax problem.',
  {
    1: [pctToDec([10, 20, 25, 30, 35, 40, 45, 50, 60, 64, 75, 80, 85, 90, 12, 18]), decToPct, pctOf],
    2: [pctToDec([1, 2, 3, 4, 5, 6, 7, 8, 9]), pctWhat, pctWhole, pctSale],
    3: [pctChange, pctTax, pctTwoStep, pctToDec([0.5, 0.25, 0.8, 125, 150, 175, 250, 12.5, 7.5, 2.5])],
  },
  verifyPct,
);

export const PREREQ_GENERATORS: GeneratorDef[] = [genPrereqInt, genPrereqFrac, genPrereqOoo, genPrereqEval, genPrereqDist, genPrereqSolve1, genPrereqIneq1, genPrereqCoord, genPrereqSlope, genPrereqExp, genPrereqRoots, genPrereqPct];
