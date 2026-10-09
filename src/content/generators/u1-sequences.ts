/**
 * Unit 1, Lessons 7-8 generators: arithmetic sequences.
 * S1.12 explicit formulas, S1.13 recursive formulas, S1.14 sequences as linear functions.
 * verify() always re-derives values by repeated addition (the recursive definition),
 * which is a different route from the explicit formula the generator uses.
 */
import type { GeneratorDef, Rng, Difficulty, Problem } from '../../core/curriculum/types';
import type { Misconception } from '../../core/math/answers';
import { Rational } from '../../core/math/rational';
import { linearPlain, linearTex } from '../../core/math/format';
import { toPoly } from '../../core/math/poly';
import { parseExpression } from '../../core/math/parser';
import { Q, p, math, makeProblem, numberMisconceptions, numStr, sub, makeChoice, choiceLabel, texToExpr } from './util';

function pickSeq(rng: Rng, d: Difficulty): { a1: Rational; d: Rational } {
  if (d === 1) return { a1: Q(rng.int(1, 12)), d: Q(rng.int(2, 9)) };
  if (d === 2) return { a1: Q(rng.int(-15, 20)), d: Q(rng.nonzeroInt(-9, 9)) };
  return { a1: Q(rng.int(-20, 30)), d: rng.bool() ? Q(rng.nonzeroInt(-12, -2)) : Q(rng.pick([1, 3, 5, -1, -3]), 2) };
}

const term = (a1: Rational, d: Rational, n: number) => a1.add(d.mul(n - 1));
const listTex = (a1: Rational, d: Rational, k: number) => `${Array.from({ length: k }, (_, i) => term(a1, d, i + 1).toTex()).join(',\\ ')},\\ \\dots`;
/** explicit formula a_1 + (n - 1)d simplified, in n */
const explicitPlain = (a1: Rational, d: Rational) => linearPlain(d, a1.sub(d), 'n');
const explicitTex = (a1: Rational, d: Rational) => linearTex(d, a1.sub(d), 'n');

/** Terms listed in a prompt's math block "3, 7, 11, ..." */
function termsFrom(tex: string): Rational[] {
  return tex
    .replace(/\\dots|\\ldots/g, '')
    .split(/,\\ |,/)
    .map((t) => t.trim())
    .filter((t) => t.length)
    .map((t) => toPoly(parseExpression(texToExpr(t))).constantValue());
}

/** Common difference from listed terms; null if not arithmetic. */
function diffOf(ts: Rational[]): Rational | null {
  const d = ts[1].sub(ts[0]);
  for (let i = 2; i < ts.length; i++) if (!ts[i].sub(ts[i - 1]).eq(d)) return null;
  return d;
}

/** n-th term by repeated addition */
function iterate(a1: Rational, d: Rational, n: number): Rational {
  let v = a1;
  for (let i = 1; i < n; i++) v = v.add(d);
  return v;
}

// ---------------------------------------------------------------------------
// Arithmetic sequences in real situations
// ---------------------------------------------------------------------------

interface SeqContext {
  story: (a1: number, d: number) => string;
  /** reads a_1 and d back out of the story */
  parse: RegExp;
  /** what a_n means, with n in TeX */
  term: string;
  /** "How many seats are in row 15?" */
  ask: (n: number) => string;
  unit: string;
  a1: [number, number];
  d: [number, number];
}

const SEQ_CONTEXTS: SeqContext[] = [
  {
    story: (a, d) => `Row 1 of a theater has ${a} seats, and each row after that has ${d} more seats than the row before it.`,
    parse: /Row 1 of a theater has (\d+) seats, and each row after that has (\d+) more seats/,
    term: 'the number of seats in row $n$',
    ask: (n) => `How many seats are in row ${n}?`,
    unit: 'seats',
    a1: [16, 30],
    d: [2, 6],
  },
  {
    story: (a, d) => `Renting a bike costs \\$${a} for 1 day, and each extra day adds \\$${d} to the cost.`,
    parse: /costs \\\$(\d+) for 1 day, and each extra day adds \\\$(\d+)/,
    term: 'the cost, in dollars, of renting the bike for $n$ days',
    ask: (n) => `How much does it cost, in dollars, to rent the bike for ${n} days?`,
    unit: 'dollars',
    a1: [15, 30],
    d: [5, 12],
  },
  {
    story: (a, d) => `Maya runs ${a} minutes in week 1 of a training plan, and each week she runs ${d} minutes more than the week before.`,
    parse: /runs (\d+) minutes in week 1 of a training plan, and each week she runs (\d+) minutes more/,
    term: 'the number of minutes Maya runs in week $n$',
    ask: (n) => `How many minutes will Maya run in week ${n}?`,
    unit: 'minutes',
    a1: [10, 20],
    d: [2, 5],
  },
  {
    story: (a, d) => `One stacking chair is ${a} inches tall. Each chair added to the stack makes it ${d} inches taller.`,
    parse: /One stacking chair is (\d+) inches tall\. Each chair added to the stack makes it (\d+) inches taller/,
    term: 'the height, in inches, of a stack of $n$ chairs',
    ask: (n) => `How tall, in inches, is a stack of ${n} chairs?`,
    unit: 'inches',
    a1: [30, 36],
    d: [2, 4],
  },
];

function seqContextProblem(rng: Rng, difficulty: Difficulty): Problem {
  const ctx = rng.pick(SEQ_CONTEXTS);
  const a1 = Q(rng.int(ctx.a1[0], ctx.a1[1]));
  const d = Q(rng.int(ctx.d[0], ctx.d[1]));
  const formula = explicitPlain(a1, d);
  const story = ctx.story(a1.toNumber(), d.toNumber());
  const buildHints: [string, string] = [
    `Term 1 is the first value in the story, and the common difference is the amount added each time.`,
    'Substitute them into $a_n = a_1 + (n - 1)d$, then simplify.',
  ];
  const buildSteps = [
    { text: 'Identify the first term and the common difference.', tex: `a_1 = ${a1.toTex()}, \\quad d = ${d.toTex()}`, why: `The story starts at ${a1.toTex()} ${ctx.unit} and adds ${d.toTex()} each time, so the values form an arithmetic sequence.` },
    { text: 'Write the explicit formula.', tex: `a_n = ${a1.toTex()} + (n - 1)(${d.toTex()}) = ${explicitTex(a1, d)}`, why: `To reach term $n$ from term 1 you add $d$ exactly $n - 1$ times.` },
  ];
  if (difficulty === 2) {
    return makeProblem({
      skillId: 'S1.12',
      tags: ['real-world', 'word'],
      prompt: [p(story), p(`Let $a_n$ be ${ctx.term}. Write an explicit formula for $a_n$.`)],
      answer: { kind: 'expression', value: formula, variables: ['n'] },
      inputHint: 'Type a formula in n, like 3 + (n - 1)5 or 5n - 2. You can start with a_n = .',
      hints: ['An amount that grows by the same number each step is an arithmetic sequence.', ...buildHints, 'Check: your formula should give the first value in the story when $n = 1$.'],
      solution: [...buildSteps, { text: 'Check with $n = 2$.', tex: `${explicitTex(a1, d).replace(/n/g, '(2)')} = ${term(a1, d, 2).toTex()}`, why: `That is ${a1.toTex()} + ${d.toTex()}, the second value.` }],
      misconceptions: [
        { answer: linearPlain(d, a1, 'n'), tag: 'sequence-index' as const, feedback: 'Check $n = 1$: your formula should give the first value. Use $(n - 1)d$, not $nd$.' },
        { answer: linearPlain(a1, d, 'n'), tag: 'formula-error' as const, feedback: 'The amount added each time multiplies $(n - 1)$; the first value is added on.' },
      ].filter((mc) => !toPoly(parseExpression(mc.answer)).equals(toPoly(parseExpression(formula)))),
    });
  }
  const n = rng.int(12, 30);
  const an = term(a1, d, n);
  return makeProblem({
    skillId: 'S1.12',
    tags: ['real-world', 'word', 'multi-step'],
    prompt: [p(story), p(ctx.ask(n))],
    answer: { kind: 'number', value: numStr(an), unit: ctx.unit },
    hints: ['Write an explicit formula first, so you do not have to list every term.', ...buildHints, `Then evaluate your formula at $n = ${n}$.`],
    solution: [...buildSteps, { text: `Evaluate at $n = ${n}$.`, tex: `a_{${n}} = ${a1.toTex()} + (${n} - 1)(${d.toTex()}) = ${a1.toTex()} + ${d.mul(n - 1).toTex()} = ${an.toTex()}`, why: `There are ${n - 1} steps of ${d.toTex()} between term 1 and term ${n}.` }],
    misconceptions: numberMisconceptions(an, [
      { value: a1.add(d.mul(n)), tag: 'sequence-index', feedback: `From term 1 to term ${n} there are ${n - 1} steps, not ${n}.` },
      { value: d.mul(n), tag: 'sequence-index', feedback: 'Start from the first value, then add the steps.' },
    ]),
    steps: [
      {
        prompt: [p(`Let $a_n$ be ${ctx.term}. Write an explicit formula for $a_n$.`)],
        answer: { kind: 'expression', value: formula, variables: ['n'] },
        inputHint: 'Type a formula in n. You can start with a_n = .',
        hints: buildHintsFour(buildHints),
        explanation: `$a_n = ${explicitTex(a1, d)}$.`,
      },
      {
        prompt: [p(`Now use your formula: find $a_{${n}}$.`)],
        answer: { kind: 'number', value: numStr(an) },
        hints: [`Substitute $n = ${n}$.`, 'Multiply first, then add.', `$${d.toTex()} \\cdot ${n}$ comes first.`, 'Then add the constant term.'],
        explanation: `$a_{${n}} = ${an.toTex()}$ ${ctx.unit}.`,
      },
    ],
  });
}

function buildHintsFour(h: [string, string]): [string, string, string, string] {
  return ['Find the first value and the amount added each time.', h[0], h[1], 'Check the formula at $n = 1$.'];
}

/** Re-read a situation's first term and common difference from its story. */
function parseSeqContext(text: string): { a1: Rational; d: Rational } | null {
  for (const c of SEQ_CONTEXTS) {
    const mm = c.parse.exec(text);
    if (mm) return { a1: Rational.parse(mm[1]), d: Rational.parse(mm[2]) };
  }
  return null;
}

// ---------------------------------------------------------------------------
// S1.12: explicit formulas
// ---------------------------------------------------------------------------

export const genSeqExplicit: GeneratorDef = {
  id: 'u1.seq-explicit',
  skillId: 'S1.12',
  description: 'Find the common difference, a far term, the explicit formula, or which term has a given value.',
  generate(rng, difficulty) {
    if (difficulty > 1 && rng.int(0, 2) === 0) return seqContextProblem(rng, difficulty);
    const s = pickSeq(rng, difficulty);
    const { a1, d } = s;
    const listed = listTex(a1, d, 4);
    const task = difficulty === 1 ? rng.pick(['diff', 'term'] as const) : difficulty === 2 ? rng.pick(['formula', 'term'] as const) : rng.pick(['which', 'formula'] as const);
    const intro = [p('Here is an arithmetic sequence:'), math(listed)];
    if (task === 'diff') {
      return makeProblem({
        skillId: 'S1.12',
        tags: [],
        prompt: [...intro, p('What is the common difference?')],
        answer: { kind: 'number', value: numStr(d) },
        hints: [
          'In an arithmetic sequence you add the same number every time. That number is the common difference.',
          'Subtract any term from the term right after it.',
          `Try the second term minus the first term: $${term(a1, d, 2).toTex()} - ${sub(a1)}$.`,
          'Check with another pair of neighbouring terms. If the sequence goes down, the difference is negative.',
        ],
        solution: [
          { text: 'Subtract a term from the next term.', tex: `${term(a1, d, 2).toTex()} - ${sub(a1)} = ${d.toTex()}`, why: 'The common difference is what you add to get from one term to the next.' },
          { text: 'Check another pair.', tex: `${term(a1, d, 3).toTex()} - ${sub(term(a1, d, 2))} = ${d.toTex()}`, why: 'For an arithmetic sequence the difference is the same every time.' },
        ],
        misconceptions: numberMisconceptions(d, [
          { value: d.neg(), tag: 'sign-error', feedback: 'Subtract in order: a term minus the term **before** it.' },
          { value: a1, tag: 'sequence-index', feedback: 'That is the first term. The common difference is the change from one term to the next.' },
        ]),
      });
    }
    if (task === 'term') {
      const n = difficulty === 1 ? rng.int(8, 15) : rng.int(15, 40);
      const an = term(a1, d, n);
      return makeProblem({
        skillId: 'S1.12',
        tags: [],
        prompt: [...intro, p(`Find the ${n}th term, $a_{${n}}$.`)],
        answer: { kind: 'number', value: numStr(an) },
        hints: [
          'Use the explicit formula $a_n = a_1 + (n - 1)d$.',
          `Here $a_1 = ${a1.toTex()}$ and $d = ${d.toTex()}$.`,
          `To get from term 1 to term ${n} you add $d$ exactly $${n} - 1 = ${n - 1}$ times.`,
          `Compute $${a1.toTex()} + ${n - 1}\\cdot${sub(d)}$.`,
        ],
        solution: [
          { text: 'Identify the first term and common difference.', tex: `a_1 = ${a1.toTex()}, \\quad d = ${d.toTex()}` },
          { text: 'Substitute into the explicit formula.', tex: `a_{${n}} = ${a1.toTex()} + (${n} - 1)${sub(d)}`, why: `There are ${n - 1} jumps of $d$ between the 1st and ${n}th terms, not ${n}.` },
          { text: 'Simplify.', tex: `a_{${n}} = ${a1.toTex()} + ${d.mul(n - 1).toTex()} = ${an.toTex()}` },
        ],
        misconceptions: numberMisconceptions(an, [
          { value: a1.add(d.mul(n)), tag: 'sequence-index', feedback: `From term 1 to term ${n} there are ${n - 1} steps, not ${n}. Use $(n - 1)d$.` },
          { value: d.mul(n), tag: 'sequence-index', feedback: 'Start from the first term, then add the jumps.' },
          { value: a1.mul(n), tag: 'formula-error', feedback: 'Multiplying the first term by $n$ is not how arithmetic sequences grow. Add $d$ each time.' },
        ]),
      });
    }
    if (task === 'formula') {
      const formula = explicitPlain(a1, d);
      const wrong = (expr: string, tag: Misconception['tag'], feedback: string) => ({ answer: expr, tag, feedback });
      return makeProblem({
        skillId: 'S1.12',
        tags: [],
        prompt: [...intro, p('Write an explicit formula for $a_n$.')],
        answer: { kind: 'expression', value: formula, variables: ['n'] },
        inputHint: 'Type a formula in n, like 3 + (n - 1)5 or 5n - 2. You can start with a_n = .',
        hints: [
          'The explicit formula for an arithmetic sequence is $a_n = a_1 + (n - 1)d$.',
          'Find the first term $a_1$ and the common difference $d$.',
          `$a_1 = ${a1.toTex()}$. Subtract neighbouring terms to find $d$.`,
          'Substitute both into $a_1 + (n - 1)d$. You can leave it in that form or simplify it.',
        ],
        solution: [
          { text: 'Find $a_1$ and $d$.', tex: `a_1 = ${a1.toTex()}, \\quad d = ${term(a1, d, 2).toTex()} - ${sub(a1)} = ${d.toTex()}` },
          { text: 'Substitute.', tex: `a_n = ${a1.toTex()} + (n - 1)${sub(d)}`, why: 'Each term is the first term plus $(n - 1)$ jumps of size $d$.' },
          { text: 'Simplify (optional).', tex: `a_n = ${explicitTex(a1, d)}`, why: 'Distribute $d$ and combine the constants.' },
          { text: 'Check with $n = 2$.', tex: `${explicitTex(a1, d).replace(/n/g, '(2)')} = ${term(a1, d, 2).toTex()}`, why: 'It gives the second term, so the formula is right.' },
        ],
        misconceptions: [
          wrong(linearPlain(d, a1, 'n'), 'sequence-index', 'Check $n = 1$: your formula should give the first term. Use $(n - 1)d$, not $nd$.'),
          wrong(linearPlain(a1, d, 'n'), 'formula-error', 'The common difference multiplies $(n - 1)$; the first term is added on.'),
          wrong(linearPlain(d.neg(), a1.add(d), 'n'), 'sign-error', 'Check the sign of the common difference.'),
        ].filter((mc) => {
          const a = toPoly(parseExpression(mc.answer));
          const b = toPoly(parseExpression(formula));
          return !a.equals(b);
        }),
      });
    }
    // which term has value V
    const n = rng.int(12, 45);
    const V = term(a1, d, n);
    return makeProblem({
      skillId: 'S1.12',
      tags: ['multi-step'],
      prompt: [...intro, p(`Which term of the sequence is equal to $${V.toTex()}$? (Find $n$ so that $a_n = ${V.toTex()}$.)`)],
      answer: { kind: 'number', value: String(n) },
      inputHint: 'Type the term number n.',
      hints: [
        'Write the explicit formula, then set it equal to the value and solve for $n$.',
        `$a_n = ${a1.toTex()} + (n - 1)${sub(d)}$.`,
        `Solve $${a1.toTex()} + (n - 1)${sub(d)} = ${V.toTex()}$: first ${a1.isNegative() ? 'add ' + a1.abs().toTex() : 'subtract ' + a1.toTex()} on both sides.`,
        `Divide by $${d.toTex()}$ to get $n - 1$, then add 1.`,
      ],
      solution: [
        { text: 'Set the explicit formula equal to the value.', tex: `${a1.toTex()} + (n - 1)${sub(d)} = ${V.toTex()}` },
        { text: `${a1.isNegative() ? 'Add' : 'Subtract'} $${a1.abs().toTex()}$.`, tex: `(n - 1)${sub(d)} = ${V.sub(a1).toTex()}` },
        { text: `Divide by $${d.toTex()}$.`, tex: `n - 1 = ${V.sub(a1).div(d).toTex()}` },
        { text: 'Add 1.', tex: `n = ${n}`, why: 'The term number must be a positive whole number, and it is.' },
      ],
      misconceptions: numberMisconceptions(Q(n), [
        { value: Q(n - 1), tag: 'sequence-index', feedback: 'You found $n - 1$. Add 1 to get $n$.' },
        { value: V.div(d).isInteger() ? V.div(d) : null, tag: 'equation-setup', feedback: 'Dividing the value by $d$ ignores the first term. Use the explicit formula.' },
      ]),
    });
  },
  verify(pr) {
    const ctxSeq = parseSeqContext((pr.prompt[0] as { text?: string }).text ?? '');
    if (ctxSeq) {
      const a = pr.answer;
      const errs: string[] = [];
      if (a.kind === 'expression') {
        const poly = toPoly(parseExpression(a.value));
        for (let n = 1; n <= 6; n++) if (!poly.evaluate({ n: Q(n) }).eq(iterate(ctxSeq.a1, ctxSeq.d, n))) errs.push(`formula wrong at n = ${n}`);
        return errs;
      }
      const nm = /(\d+)\D*$/.exec((pr.prompt[1] as { text: string }).text);
      if (!nm || a.kind !== 'number') return ['cannot parse context ask'];
      if (!Rational.parse(a.value).eq(iterate(ctxSeq.a1, ctxSeq.d, Number(nm[1])))) errs.push('term mismatch');
      return errs;
    }
    const mathBlock = pr.prompt.find((b) => b.t === 'math') as { tex: string };
    const ts = termsFrom(mathBlock.tex);
    const d = diffOf(ts);
    if (!d) return ['listed terms are not arithmetic'];
    const ask = (pr.prompt[pr.prompt.length - 1] as { text: string }).text;
    const a = pr.answer;
    if (/common difference/.test(ask)) return a.kind === 'number' && Rational.parse(a.value).eq(d) ? [] : ['difference mismatch'];
    const tm = /Find the (\d+)th term/.exec(ask);
    if (tm) return a.kind === 'number' && Rational.parse(a.value).eq(iterate(ts[0], d, Number(tm[1]))) ? [] : ['term mismatch'];
    if (/explicit formula/.test(ask)) {
      if (a.kind !== 'expression') return ['wrong kind'];
      const poly = toPoly(parseExpression(a.value));
      for (let n = 1; n <= 6; n++) if (!poly.evaluate({ n: Q(n) }).eq(iterate(ts[0], d, n))) return [`formula wrong at n = ${n}`];
      return [];
    }
    const wm = /equal to \$(.+?)\$/.exec(ask);
    if (wm && a.kind === 'number') {
      const V = toPoly(parseExpression(texToExpr(wm[1]))).constantValue();
      const n = Number(a.value);
      if (!Number.isInteger(n) || n < 1) return ['n is not a positive integer'];
      return iterate(ts[0], d, n).eq(V) ? [] : ['a_n is not the value'];
    }
    return ['cannot classify'];
  },
};

// ---------------------------------------------------------------------------
// S1.13: recursive formulas
// ---------------------------------------------------------------------------

const recTex = (a1: Rational, d: Rational) => `a_1 = ${a1.toTex()}, \\quad a_n = a_{n-1} ${d.isNegative() ? '- ' + d.abs().toTex() : '+ ' + d.toTex()}`;

function parseRec(tex: string): { a1: Rational; d: Rational } | null {
  const mm = /a_1 = (.+?), \\quad a_n = a_\{n-1\} ([+-]) (.+)$/.exec(tex);
  if (!mm) return null;
  const a1 = toPoly(parseExpression(texToExpr(mm[1]))).constantValue();
  const dv = toPoly(parseExpression(texToExpr(mm[3]))).constantValue();
  return { a1, d: mm[2] === '-' ? dv.neg() : dv };
}

export const genSeqRecursive: GeneratorDef = {
  id: 'u1.seq-recursive',
  skillId: 'S1.13',
  description: 'Use a recursive formula to list terms or find a term; convert a recursive formula to an explicit one; choose the recursive formula for a sequence.',
  generate(rng, difficulty) {
    const { a1, d } = pickSeq(rng, difficulty);
    const task = difficulty === 1 ? 'list' : difficulty === 2 ? rng.pick(['term', 'choose'] as const) : rng.pick(['explicit', 'toRecursive'] as const);
    const rec = recTex(a1, d);
    if (task === 'list') {
      const vals = [1, 2, 3, 4].map((n) => term(a1, d, n));
      return makeProblem({
        skillId: 'S1.13',
        tags: [],
        prompt: [p('A sequence is defined recursively:'), math(rec), p('List the first four terms.')],
        answer: { kind: 'sequence-terms', values: vals.map(numStr) },
        inputHint: 'Type four numbers separated by commas, like 5, 8, 11, 14.',
        hints: [
          'A recursive formula tells you the first term and how to get each term from the one before it.',
          `The first term is given: $a_1 = ${a1.toTex()}$.`,
          `To get $a_2$, ${d.isNegative() ? 'subtract ' + d.abs().toTex() + ' from' : 'add ' + d.toTex() + ' to'} $a_1$.`,
          'Keep going the same way to get $a_3$ and $a_4$.',
        ],
        solution: [
          { text: 'Start with the first term.', tex: `a_1 = ${a1.toTex()}`, why: 'The recursive formula gives it directly.' },
          { text: 'Apply the rule to each term to get the next.', tex: `a_2 = ${a1.toTex()} ${d.isNegative() ? '-' : '+'} ${d.abs().toTex()} = ${vals[1].toTex()},\\ a_3 = ${vals[2].toTex()},\\ a_4 = ${vals[3].toTex()}`, why: '$a_{n-1}$ means "the term before".' },
        ],
        misconceptions: [
          { answer: [2, 3, 4, 5].map((n) => numStr(term(a1, d, n))).join(', '), tag: 'sequence-index', feedback: 'The list should start with $a_1$ itself.' },
        ],
      });
    }
    if (task === 'term') {
      const n = rng.int(5, 8);
      const an = term(a1, d, n);
      return makeProblem({
        skillId: 'S1.13',
        tags: [],
        prompt: [p('A sequence is defined recursively:'), math(rec), p(`Find $a_{${n}}$.`)],
        answer: { kind: 'number', value: numStr(an) },
        hints: [
          'Start at $a_1$ and apply the rule over and over.',
          `Each step ${d.isNegative() ? 'subtracts ' + d.abs().toTex() : 'adds ' + d.toTex()}.`,
          `From $a_1$ to $a_{${n}}$ you apply the rule ${n - 1} times.`,
          `So add $${n - 1}$ copies of $${sub(d)}$ to $${a1.toTex()}$.`,
        ],
        solution: [
          { text: 'List terms until you reach the one you need.', tex: Array.from({ length: n }, (_, i) => `a_{${i + 1}} = ${term(a1, d, i + 1).toTex()}`).join(',\\ '), why: 'Each term is the previous term plus the common difference.' },
        ],
        misconceptions: numberMisconceptions(an, [
          { value: term(a1, d, n + 1), tag: 'sequence-index', feedback: `You applied the rule ${n} times. From $a_1$ to $a_{${n}}$ is only ${n - 1} steps.` },
          { value: term(a1, d, n - 1), tag: 'sequence-index', feedback: `Count again: you need to reach the ${n}th term.` },
        ]),
      });
    }
    if (task === 'choose') {
      const listed = listTex(a1, d, 4);
      const answer = makeChoice(rng, `$${recTex(a1, d)}$`, [`$${recTex(term(a1, d, 2), d)}$`, `$${recTex(a1, d.neg())}$`, `$${recTex(d, a1)}$`]);
      return makeProblem({
        skillId: 'S1.13',
        tags: [],
        prompt: [p('Which recursive formula describes this arithmetic sequence?'), math(listed)],
        answer,
        hints: [
          'A recursive formula needs the first term and the rule to get from one term to the next.',
          'The first term is the first number in the list.',
          'Subtract neighbouring terms to find what is added each time.',
          'Check your choice by generating the first three terms from it.',
        ],
        solution: [
          { text: 'Read the first term.', tex: `a_1 = ${a1.toTex()}` },
          { text: 'Find the common difference.', tex: `d = ${term(a1, d, 2).toTex()} - ${sub(a1)} = ${d.toTex()}`, why: 'It is the amount added to each term to get the next.' },
          { text: 'Write the recursive formula.', tex: recTex(a1, d) },
        ],
        misconceptions: [],
      });
    }
    if (task === 'toRecursive') {
      const ex = explicitTex(a1, d);
      const c0 = a1.sub(d);
      return makeProblem({
        skillId: 'S1.13',
        tags: ['multi-step'],
        prompt: [p('An arithmetic sequence has this explicit formula:'), math(`a_n = ${ex}`), p('Complete its recursive formula $a_1 = \\square, \\quad a_n = a_{n-1} + \\square$. Type the two missing numbers in order, separated by a comma.')],
        answer: { kind: 'sequence-terms', values: [numStr(a1), numStr(d)] },
        inputHint: 'Type two numbers separated by a comma: first a_1, then the number added each time.',
        hints: [
          'A recursive formula needs two things: the first term $a_1$, and what you add to each term to get the next one.',
          'Find $a_1$ by substituting $n = 1$ into the explicit formula.',
          'The number multiplying $n$ is the common difference: each time $n$ goes up by 1, the term goes up by that much.',
          'Check: substitute $n = 2$ as well. The difference $a_2 - a_1$ should be your second number.',
        ],
        solution: [
          { text: 'Find the first term.', tex: `a_1 = ${ex.replace(/n/g, '(1)')} = ${a1.toTex()}`, why: 'The recursive formula has to start from the actual first term.' },
          { text: 'Find the common difference.', tex: `a_2 = ${term(a1, d, 2).toTex()}, \\quad a_2 - a_1 = ${d.toTex()}`, why: 'In $a_n = dn + c$, the coefficient $d$ of $n$ is the amount added each step.' },
          { text: 'Write the recursive formula.', tex: recTex(a1, d), why: 'Start at $a_1$, and add the common difference to get each next term.' },
        ],
        misconceptions: [
          { answer: `${numStr(d)}|${numStr(a1)}`, tag: 'sequence-index' as const, feedback: 'Check the order: the first number is the first term $a_1$, the second is the amount added each time.' },
          { answer: `${numStr(c0)}|${numStr(d)}`, tag: 'sequence-index' as const, feedback: 'The constant term of the explicit formula is the value at $n = 0$, not the first term. Substitute $n = 1$.' },
        ].filter((mc) => mc.answer !== `${numStr(a1)}|${numStr(d)}`),
      });
    }
    // explicit from recursive
    const formula = explicitPlain(a1, d);
    return makeProblem({
      skillId: 'S1.13',
      tags: ['multi-step'],
      prompt: [p('A sequence is defined recursively:'), math(rec), p('Write an explicit formula for $a_n$.')],
      answer: { kind: 'expression', value: formula, variables: ['n'] },
      inputHint: 'Type a formula in n, like 3 + (n - 1)5. You can start with a_n = .',
      hints: [
        'The explicit formula is $a_n = a_1 + (n - 1)d$.',
        'The recursive formula gives you $a_1$ directly.',
        'The number added to $a_{n-1}$ each time is the common difference $d$.',
        `Substitute $a_1 = ${a1.toTex()}$ and $d$ into $a_1 + (n - 1)d$.`,
      ],
      solution: [
        { text: 'Read $a_1$ and $d$ from the recursive formula.', tex: `a_1 = ${a1.toTex()}, \\quad d = ${d.toTex()}`, why: `"$a_n = a_{n-1} ${d.isNegative() ? '-' : '+'} ${d.abs().toTex()}$" means each term is the one before ${d.isNegative() ? 'minus' : 'plus'} ${d.abs().toTex()}.` },
        { text: 'Substitute into the explicit form.', tex: `a_n = ${a1.toTex()} + (n - 1)${sub(d)} = ${explicitTex(a1, d)}` },
      ],
      misconceptions: [
        { answer: linearPlain(d, a1, 'n'), tag: 'sequence-index' as const, feedback: 'Check $n = 1$: the formula must give the first term. Use $(n - 1)d$.' },
      ].filter((mc) => !toPoly(parseExpression(mc.answer)).equals(toPoly(parseExpression(formula)))),
    });
  },
  verify(pr) {
    const mb = pr.prompt.find((b) => b.t === 'math') as { tex: string };
    const a = pr.answer;
    if (a.kind === 'choice') {
      const ts = termsFrom(mb.tex);
      const d = diffOf(ts);
      const r = parseRec(choiceLabel(a).replace(/^\$|\$$/g, ''));
      if (!d || !r) return ['cannot parse'];
      for (let n = 1; n <= 4; n++) if (!iterate(r.a1, r.d, n).eq(ts[n - 1])) return ['chosen formula does not generate the list'];
      const others = a.options.filter((o) => o.id !== a.correct).map((o) => parseRec(o.label.replace(/^\$|\$$/g, '')));
      if (others.some((o) => o && [1, 2, 3, 4].every((n) => iterate(o.a1, o.d, n).eq(ts[n - 1])))) return ['a distractor also fits'];
      return [];
    }
    if (/^a_n = /.test(mb.tex) && a.kind === 'sequence-terms') {
      // explicit -> recursive: a_1 from n = 1, d from consecutive terms of the explicit formula
      const poly = toPoly(parseExpression(texToExpr(mb.tex.replace(/^a_n = /, ''))));
      const v1 = poly.evaluate({ n: Q(1) });
      const dd = poly.evaluate({ n: Q(2) }).sub(v1);
      if (!dd.eq(poly.evaluate({ n: Q(7) }).sub(poly.evaluate({ n: Q(6) })))) return ['not arithmetic'];
      return a.values.length === 2 && Rational.parse(a.values[0]).eq(v1) && Rational.parse(a.values[1]).eq(dd) ? [] : ['recursive parts mismatch'];
    }
    const r = parseRec(mb.tex);
    if (!r) return ['cannot parse recursive formula'];
    if (a.kind === 'sequence-terms') return a.values.every((v, i) => Rational.parse(v).eq(iterate(r.a1, r.d, i + 1))) ? [] : ['terms mismatch'];
    if (a.kind === 'number') {
      const nm = /Find \$a_\{(\d+)\}\$/.exec((pr.prompt[2] as { text: string }).text);
      return nm && Rational.parse(a.value).eq(iterate(r.a1, r.d, Number(nm[1]))) ? [] : ['term mismatch'];
    }
    if (a.kind === 'expression') {
      const poly = toPoly(parseExpression(a.value));
      for (let n = 1; n <= 6; n++) if (!poly.evaluate({ n: Q(n) }).eq(iterate(r.a1, r.d, n))) return [`formula wrong at n = ${n}`];
      return [];
    }
    return ['unexpected kind'];
  },
};

// ---------------------------------------------------------------------------
// S1.14: arithmetic sequences as linear functions
// ---------------------------------------------------------------------------

const DOMAIN_CORRECT = 'The positive integers: $\\{1, 2, 3, 4, \\dots\\}$';

export const genSeqAsFunction: GeneratorDef = {
  id: 'u1.seq-as-function',
  skillId: 'S1.14',
  description: 'Treat an arithmetic sequence as a linear function f(n) = dn + b on the positive integers: slope from a dot graph, domain, f(n) rule, and which term has a value.',
  generate(rng, difficulty) {
    const { a1, d } = pickSeq(rng, difficulty === 3 ? 2 : difficulty);
    const f = 'f';
    if (difficulty === 1) {
      if (rng.bool()) {
        const answer = makeChoice(rng, DOMAIN_CORRECT, ['All real numbers', 'All numbers $x \\ge 1$, including decimals like $2.5$', 'All integers: $\\{\\dots, -2, -1, 0, 1, 2, \\dots\\}$']);
        return makeProblem({
          skillId: 'S1.14',
          tags: [],
          prompt: [p(`The arithmetic sequence $${listTex(a1, d, 4)}$ can be written as the function $${f}(n) = ${explicitTex(a1, d)}$, where $${f}(n)$ is the $n$th term.`), p('What is the domain of this function?')],
          answer,
          hints: [
            'The input $n$ is a term number: first, second, third, and so on.',
            'Is there a "2.5th term"? Is there a "0th term" or a "-3rd term"?',
            'Term numbers are counting numbers.',
            'The domain is every possible term number.',
          ],
          solution: [
            { text: 'The input $n$ counts terms.', why: 'You can talk about the 1st, 2nd or 10th term, but not the 2.5th or the -1st term.' },
            { text: 'So the domain is the positive integers.', tex: '\\{1, 2, 3, 4, \\dots\\}', why: 'That is why the graph of a sequence is a set of separate dots, not a solid line.' },
          ],
          misconceptions: [],
        });
      }
      // common difference = slope from a dot graph
      const pts = [1, 2, 3, 4, 5].map((n) => ({ x: n, y: term(a1, d, n).toNumber() }));
      const ys = pts.map((q) => q.y);
      const yMin = Math.min(0, ...ys) - 2;
      const yMax = Math.max(0, ...ys) + 2;
      return makeProblem({
        skillId: 'S1.14',
        tags: ['graph'],
        prompt: [
          p('The graph shows the first five terms of an arithmetic sequence. The horizontal axis is the term number $n$ and the vertical axis is the term value.'),
          { t: 'graph', spec: { xMin: 0, xMax: 6, yMin, yMax, yStep: yMax - yMin > 30 ? 5 : yMax - yMin > 15 ? 2 : 1, scatter: pts, xLabel: 'n', yLabel: 'a_n', ariaLabel: `Five dots: ${pts.map((q) => `(${q.x}, ${q.y})`).join(', ')}.` } },
          p('What is the common difference? (This is also the slope of the linear function that fits the dots.)'),
        ],
        answer: { kind: 'number', value: numStr(d) },
        hints: [
          'Each dot is (term number, term value).',
          'The common difference is how much the value changes from one dot to the next.',
          `The first two dots are $(1, ${a1.toTex()})$ and $(2, ${term(a1, d, 2).toTex()})$.`,
          'Since the term number goes up by 1 each time, the change in value is the slope.',
        ],
        solution: [
          { text: 'Read two neighbouring dots.', tex: `(1, ${a1.toTex()}),\\ (2, ${term(a1, d, 2).toTex()})`, why: 'Neighbouring dots are one term apart.' },
          { text: 'Find the change in value.', tex: `${term(a1, d, 2).toTex()} - ${sub(a1)} = ${d.toTex()}`, why: 'The run is 1, so rise over run is just the rise.' },
        ],
        misconceptions: numberMisconceptions(d, [
          { value: a1, tag: 'graph-reading', feedback: 'That is the first term. The common difference is the change from one dot to the next.' },
          { value: d.neg(), tag: 'sign-error', feedback: 'Are the dots going up or down from left to right?' },
        ]),
      });
    }
    if (difficulty === 2) {
      const formula = explicitPlain(a1, d);
      return makeProblem({
        skillId: 'S1.14',
        tags: [],
        prompt: [p('Write this arithmetic sequence as a linear function $f(n) = mn + b$ in simplest form, where $f(n)$ is the $n$th term.'), math(listTex(a1, d, 4))],
        answer: { kind: 'expression', value: formula, variables: ['n'], form: 'expanded' },
        inputHint: 'Type the rule in n, like 4n - 1.',
        hints: [
          'The slope $m$ of the function is the common difference.',
          'The constant $b$ is the value the pattern would have at $n = 0$: one step before the first term.',
          `To go back one step from $a_1 = ${a1.toTex()}$, ${d.isNegative() ? 'add ' + d.abs().toTex() : 'subtract ' + d.toTex()}.`,
          'Or write $a_1 + (n - 1)d$ and simplify it by distributing.',
        ],
        solution: [
          { text: 'Find the common difference: it is the slope.', tex: `m = ${d.toTex()}`, why: 'Each time $n$ goes up by 1, the term changes by $d$.' },
          { text: 'Find the value at $n = 0$.', tex: `b = ${a1.toTex()} - ${sub(d)} = ${a1.sub(d).toTex()}`, why: 'Going back one step from the first term gives the "zeroth" term, which is the $y$-intercept of the line through the dots.' },
          { text: 'Write the function.', tex: `f(n) = ${explicitTex(a1, d)}`, why: 'Check: $f(1)$ gives the first term.' },
        ],
        misconceptions: [
          { answer: linearPlain(d, a1, 'n'), tag: 'sequence-index' as const, feedback: 'Check $f(1)$: it should equal the first term. The constant is one step **before** the first term.' },
          { answer: linearPlain(a1, d, 'n'), tag: 'formula-error' as const, feedback: 'The slope is the common difference, not the first term.' },
        ].filter((mc) => !toPoly(parseExpression(mc.answer)).equals(toPoly(parseExpression(formula)))),
      });
    }
    // which term number has value V, given f(n)
    const n = rng.int(10, 40);
    const V = term(a1, d, n);
    const rule = explicitTex(a1, d);
    return makeProblem({
      skillId: 'S1.14',
      tags: ['multi-step'],
      prompt: [p(`The $n$th term of an arithmetic sequence is given by $f(n) = ${rule}$. Which term of the sequence equals $${V.toTex()}$?`)],
      answer: { kind: 'number', value: String(n) },
      inputHint: 'Type the term number n.',
      hints: [
        `Solve $f(n) = ${V.toTex()}$ for $n$.`,
        `Set up the equation $${rule} = ${V.toTex()}$.`,
        'Undo the constant, then divide by the coefficient of $n$.',
        'The answer must be a positive whole number because it is a term number.',
      ],
      solution: [
        { text: 'Set the rule equal to the value.', tex: `${rule} = ${V.toTex()}`, why: 'We need the input $n$ that gives this output.' },
        { text: 'Solve for $n$.', tex: `${linearTex(d, 0, 'n')} = ${V.sub(a1.sub(d)).toTex()} \\;\\Rightarrow\\; n = ${n}`, why: `Undo the constant, then divide by $${d.toTex()}$.` },
        { text: 'Check that it makes sense.', why: `$${n}$ is a positive integer, so it is a real term number: the ${n}th term is $${V.toTex()}$.` },
      ],
      misconceptions: numberMisconceptions(Q(n), [
        { value: d.mul(V).add(a1.sub(d)), tag: 'inverse-operation', feedback: `That is $f(${V.toTex()})$. Here $${V.toTex()}$ is the output, so solve for $n$.` },
        { value: Q(n - 1), tag: 'sequence-index', feedback: 'Check your solving steps. Substitute your answer to see whether it gives the value.' },
      ]),
    });
  },
  verify(pr) {
    const a = pr.answer;
    const text = pr.prompt.map((b) => (b.t === 'p' ? b.text : b.t === 'math' ? b.tex : '')).join(' ');
    if (a.kind === 'choice') {
      if (choiceLabel(a) !== DOMAIN_CORRECT) return ['domain answer is not the positive integers'];
      const fm = /f\(n\) = (.+?)\$/.exec(text);
      const lm = /sequence \$(.+?)\$ can be/.exec(text);
      if (!fm || !lm) return ['cannot parse'];
      const ts = termsFrom(lm[1]);
      const poly = toPoly(parseExpression(texToExpr(fm[1])));
      return ts.every((t, i) => poly.evaluate({ n: Q(i + 1) }).eq(t)) ? [] : ['rule does not match the listed terms'];
    }
    const g = pr.prompt.find((b) => b.t === 'graph') as { spec: { scatter: Array<{ x: number; y: number }> } } | undefined;
    if (g && a.kind === 'number') {
      const ys = g.spec.scatter.map((q) => Q(q.y));
      const d = diffOf(ys);
      return d && d.eq(Rational.parse(a.value)) ? [] : ['difference mismatch'];
    }
    const mb = pr.prompt.find((b) => b.t === 'math') as { tex: string } | undefined;
    if (mb && a.kind === 'expression') {
      const ts = termsFrom(mb.tex);
      const d = diffOf(ts);
      if (!d) return ['not arithmetic'];
      const poly = toPoly(parseExpression(a.value));
      for (let n = 1; n <= 6; n++) if (!poly.evaluate({ n: Q(n) }).eq(iterate(ts[0], d, n))) return [`rule wrong at n = ${n}`];
      return [];
    }
    const wm = /f\(n\) = (.+?)\$\. Which term of the sequence equals \$(.+?)\$/.exec(text);
    if (wm && a.kind === 'number') {
      const poly = toPoly(parseExpression(texToExpr(wm[1])));
      const V = toPoly(parseExpression(texToExpr(wm[2]))).constantValue();
      const n = Number(a.value);
      if (!Number.isInteger(n) || n < 1) return ['n is not a positive integer'];
      const a1 = poly.evaluate({ n: Q(1) });
      const d = poly.evaluate({ n: Q(2) }).sub(a1);
      return iterate(a1, d, n).eq(V) ? [] : ['term mismatch'];
    }
    return ['cannot classify'];
  },
};

export const U1_SEQUENCE_GENERATORS = [genSeqExplicit, genSeqRecursive, genSeqAsFunction];
