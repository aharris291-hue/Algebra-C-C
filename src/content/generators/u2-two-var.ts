/**
 * Unit 2, Lessons 1-2 generators.
 * S2.02 write inequalities from words and situations.
 * S2.03 graph linear inequalities (boundary and shading) and read them from graphs.
 */
import type { GeneratorDef, Rng, Difficulty, Block, GraphSpec } from '../../core/curriculum/types';
import { Rational } from '../../core/math/rational';
import { linearTex, linearPlain } from '../../core/math/format';
import { toPoly } from '../../core/math/poly';
import { parseExpression } from '../../core/math/parser';
import { Q, p, makeProblem, numStr, money, makeChoice, choiceLabel, stringMisconceptions } from './util';
import { Op, OP_TEX, FLIP_OP, isStrict, isGreater, relTexToPlain, holds } from './u2-common';

// ---------------------------------------------------------------------------
// Phrases
// ---------------------------------------------------------------------------

/** What each phrase means. verify() reads phrases back through this table. */
export const PHRASE_OP: Record<string, Op> = {
  'at least': '>=',
  'no less than': '>=',
  'a minimum of': '>=',
  'at most': '<=',
  'no more than': '<=',
  'a maximum of': '<=',
  'more than': '>',
  'greater than': '>',
  'less than': '<',
  'fewer than': '<',
  'cannot exceed': '<=',
  exceeds: '>',
  'is under': '<',
};

/** Longest phrase from the table that appears in the text (bold markers ignored). */
export function findPhrase(text: string): string | null {
  const t = text.replace(/\*\*/g, '');
  let best: string | null = null;
  for (const ph of Object.keys(PHRASE_OP)) {
    const re = new RegExp(`(^|[^a-z])${ph}([^a-z]|$)`);
    if (re.test(t) && (!best || ph.length > best.length)) best = ph;
  }
  return best;
}

const PHRASE_HELP: Record<Op, string> = {
  '>=': '"At least" means that amount **or more**, so the amount itself counts: $\\ge$.',
  '<=': '"At most" or "no more than" means that amount **or less**, so the amount itself counts: $\\le$.',
  '>': '"More than" means bigger than the amount, and the amount itself does **not** count: $>$.',
  '<': '"Less than" or "fewer than" means smaller than the amount, and the amount itself does **not** count: $<$.',
};

interface OneVarTemplate {
  v: string;
  countable: boolean;
  text(ph: string, n: number): string;
  range: [number, number];
}

const ONE_VAR: OneVarTemplate[] = [
  { v: 'p', countable: true, range: [8, 40], text: (ph, n) => `The number of people $p$ on a ride must be ${ph} $${n}$.` },
  { v: 'b', countable: false, range: [20, 80], text: (ph, n) => `To start a phone update, the battery level $b$ (in percent) must be ${ph} $${n}$.` },
  { v: 'h', countable: false, range: [42, 54], text: (ph, n) => `To ride the coaster, a rider's height $h$ (in inches) must be ${ph} $${n}$.` },
  { v: 'm', countable: true, range: [30, 120], text: (ph, n) => `The number of minutes $m$ you can stream on a school night is ${ph} $${n}$.` },
  { v: 's', countable: true, range: [60, 95], text: (ph, n) => `To earn the badge, your score $s$ must be ${ph} $${n}$ points.` },
];

function oneVarPhrase(rng: Rng, countable: boolean): string {
  const list = ['at least', 'no less than', 'at most', 'no more than', 'more than', 'greater than', countable ? 'fewer than' : 'less than', 'a minimum of', 'a maximum of'];
  return rng.pick(list);
}

interface FeeTemplate {
  v: string;
  dir: 'up' | 'down';
  phrases: string[];
  text(start: string, rate: string, ph: string, target: string): string;
  ask: string;
}

const FEE: FeeTemplate[] = [
  { v: 'm', dir: 'up', phrases: ['at most', 'no more than', 'less than'], text: (s, r, ph, t) => `A gym charges a ${s} sign-up fee plus ${r} per month. Jordan can spend ${ph} ${t} in total.`, ask: 'Write an inequality for the number of months $m$ Jordan can afford.' },
  { v: 'g', dir: 'up', phrases: ['at most', 'no more than', 'less than'], text: (s, r, ph, t) => `A game costs ${s} and each extra level pack costs ${r}. Sam wants to spend ${ph} ${t} in total.`, ask: 'Write an inequality for the number of level packs $g$ Sam can buy.' },
  { v: 'h', dir: 'up', phrases: ['at least', 'more than', 'a minimum of'], text: (s, r, ph, t) => `Ava has ${s} saved and earns ${r} per hour at her job. She wants to have ${ph} ${t} by the end of summer.`, ask: 'Write an inequality for the number of hours $h$ Ava needs to work.' },
  { v: 'w', dir: 'down', phrases: ['at least', 'more than'], text: (s, r, ph, t) => `A gift card starts with ${s} on it, and Mia spends ${r} on it every week. She wants the card to still have ${ph} ${t} on it.`, ask: 'Write an inequality for the number of weeks $w$ that keep the balance high enough.' },
];

export const genIneqPhrases: GeneratorDef = {
  id: 'u2.ineq-phrases',
  skillId: 'S2.02',
  description: 'Translate words such as "at least" and "no more than" into inequalities.',
  generate(rng, difficulty) {
    if (difficulty === 1) {
      const tpl = rng.pick(ONE_VAR);
      const ph = oneVarPhrase(rng, tpl.countable);
      const n = rng.int(tpl.range[0], tpl.range[1]);
      const op = PHRASE_OP[ph];
      const lab = (o: Op) => `$${tpl.v} ${OP_TEX[o]} ${n}$`;
      const others = (['<', '>', '<=', '>='] as Op[]).filter((o) => o !== op);
      return makeProblem({
        skillId: 'S2.02',
        tags: ['word'],
        prompt: [p(tpl.text(`**${ph}**`, n)), p('Which inequality says the same thing?')],
        answer: makeChoice(rng, lab(op), others.map(lab)),
        hints: [
          'Decide two things: is the amount a lower limit or an upper limit, and does the amount itself count?',
          '"At least", "no less than" and "a minimum of" set a lower limit. "At most", "no more than" and "a maximum of" set an upper limit.',
          'Phrases with "than" alone ("more than", "less than", "fewer than") leave the amount itself out, so they use $<$ or $>$.',
          `Ask yourself: is $${tpl.v} = ${n}$ allowed? Is $${tpl.v} = ${n + 1}$ allowed?`,
        ],
        solution: [
          { text: `"${ph}" ${isGreater(op) ? 'sets a lower limit' : 'sets an upper limit'}.`, why: PHRASE_HELP[op] },
          { text: `So the inequality is $${tpl.v} ${OP_TEX[op]} ${n}$.`, why: `Check: $${tpl.v} = ${n}$ is ${isStrict(op) ? 'not ' : ''}allowed, which matches ${isStrict(op) ? 'a strict symbol' : 'a symbol with "or equal to"'}.` },
        ],
        misconceptions: [],
      });
    }
    if (difficulty === 2) {
      const tpl = rng.pick(FEE);
      const ph = rng.pick(tpl.phrases);
      const op = PHRASE_OP[ph];
      const start = Q(rng.int(2, 12) * 5);
      const rate = Q(rng.int(3, 15));
      // a target that leaves a whole number of steps
      const steps = rng.int(4, 12);
      const target = tpl.dir === 'up' ? start.add(rate.mul(Q(steps))) : start.sub(rate.mul(Q(steps)));
      const startFix = tpl.dir === 'down' && target.isNegative() ? start.add(rate.mul(Q(steps))) : start;
      const tgt = tpl.dir === 'down' ? startFix.sub(rate.mul(Q(steps))) : target;
      const coef = tpl.dir === 'up' ? rate : rate.neg();
      const lhs = linearPlain(coef, startFix, tpl.v);
      const answer = `${lhs} ${op} ${numStr(tgt)}`;
      const swapped = `${linearPlain(tpl.dir === 'up' ? startFix : startFix.neg(), rate, tpl.v)} ${op} ${numStr(tgt)}`;
      return makeProblem({
        skillId: 'S2.02',
        tags: ['word', 'real-world'],
        prompt: [p(`${tpl.text(money(startFix), money(rate), `**${ph}**`, money(tgt))} ${tpl.ask}`)],
        answer: { kind: 'inequality', value: answer },
        inputHint: `Type an inequality using ${tpl.v}, like 5${tpl.v} + 20 <= 100.`,
        hints: [
          `Write an expression for the total first. What is the amount after $${tpl.v}$ ${tpl.v === 'h' ? 'hours' : tpl.v === 'w' ? 'weeks' : tpl.v === 'm' ? 'months' : 'packs'}?`,
          `The amount that repeats (${money(rate)} each time) is multiplied by $${tpl.v}$. The one-time amount is ${tpl.dir === 'up' ? 'added' : 'where you start'}.`,
          PHRASE_HELP[op],
          `The total is $${linearTex(coef, startFix, tpl.v)}$. Compare it with ${money(tgt)} using the right symbol.`,
        ],
        solution: [
          { text: 'Write the total as an expression.', tex: linearTex(coef, startFix, tpl.v), why: `${money(rate)} ${tpl.dir === 'up' ? 'is added' : 'is taken away'} once for each unit of $${tpl.v}$, and ${money(startFix)} is the one-time starting amount.` },
          { text: `"${ph}" means $${OP_TEX[op]}$.`, why: PHRASE_HELP[op] },
          { text: 'Put them together.', tex: `${linearTex(coef, startFix, tpl.v)} ${OP_TEX[op]} ${tgt.toTex()}` },
        ],
        misconceptions: stringMisconceptions(answer, [{ answer: swapped, tag: 'equation-setup', feedback: `The amount that repeats each time gets multiplied by $${tpl.v}$; the one-time amount does not.` }]),
      });
    }
    // two-variable phrase
    const ctx = rng.pick(TWO_VAR_PHRASE);
    const ph = rng.pick(ctx.phrases);
    const op = PHRASE_OP[ph];
    const a = rng.int(ctx.a[0], ctx.a[1]);
    let b = rng.int(ctx.b[0], ctx.b[1]);
    while (b === a) b = rng.int(ctx.b[0], ctx.b[1]);
    const n = rng.int(ctx.n[0], ctx.n[1]);
    const lhs = `${a === 1 ? '' : a}${ctx.x} + ${b === 1 ? '' : b}${ctx.y}`;
    const answer = `${lhs} ${op} ${n}`;
    return makeProblem({
      skillId: 'S2.02',
      tags: ['word', 'real-world'],
      prompt: [p(ctx.text(a, b, `**${ph}**`, n)), p(`Write an inequality using $${ctx.x}$ and $${ctx.y}$.`)],
      answer: { kind: 'inequality', value: answer },
      inputHint: `Type an inequality using ${ctx.x} and ${ctx.y}.`,
      hints: [
        'Build the total first: (amount for each first item) times (how many) plus (amount for each second item) times (how many).',
        `The total is $${a === 1 ? '' : a}${ctx.x} + ${b === 1 ? '' : b}${ctx.y}$.`,
        PHRASE_HELP[op],
        `"${ph}" means $${OP_TEX[op]}$. Compare the total with $${n}$.`,
      ],
      solution: [
        { text: 'Write the total.', tex: `${a === 1 ? '' : a}${ctx.x} + ${b === 1 ? '' : b}${ctx.y}`, why: 'Each item contributes its amount times how many there are.' },
        { text: `"${ph}" means $${OP_TEX[op]}$.`, why: PHRASE_HELP[op] },
        { text: 'Write the inequality.', tex: `${a === 1 ? '' : a}${ctx.x} + ${b === 1 ? '' : b}${ctx.y} ${OP_TEX[op]} ${n}` },
      ],
      misconceptions: stringMisconceptions(answer, [{ answer: `${b === 1 ? '' : b}${ctx.x} + ${a === 1 ? '' : a}${ctx.y} ${op} ${n}`, tag: 'equation-setup', feedback: `Match each amount with its own variable: $${a}$ goes with $${ctx.x}$ and $${b}$ goes with $${ctx.y}$.` }]),
    });
  },
  verify(pr) {
    const text = pr.prompt.map((b) => (b.t === 'p' ? b.text : '')).join(' ');
    const ph = findPhrase(text);
    if (!ph) return ['no phrase found'];
    const op = PHRASE_OP[ph];
    const errs: string[] = [];
    if (pr.answer.kind === 'choice') {
      const lab = choiceLabel(pr.answer);
      const want = OP_TEX[op];
      if (!lab.includes(` ${want} `)) errs.push(`choice ${lab} does not use ${want}`);
      return errs;
    }
    if (pr.answer.kind !== 'inequality') return ['unexpected kind'];
    const nums = [...text.replace(/\*\*/g, '').matchAll(/(\d+(?:\.\d+)?)/g)].map((m) => Q(m[1]));
    const v = (pr.answer.value.match(/[a-z]/g) ?? []).filter((c, i, all) => all.indexOf(c) === i);
    let rebuilt: string;
    if (v.length === 1) {
      // fee templates: start, rate, target in reading order
      const [start, rate, target] = nums;
      const down = /spends/.test(text);
      rebuilt = `${numStr(start)} ${down ? '-' : '+'} ${numStr(rate)}${v[0]} ${op} ${numStr(target)}`;
    } else {
      const [a, b, n] = nums;
      rebuilt = `${numStr(a)}${v[0]} + ${numStr(b)}${v[1]} ${op} ${numStr(n)}`;
    }
    // compare the two relations at many points
    for (let i = -3; i <= 12; i++)
      for (let j = 0; j <= 12; j += 3) {
        const x = Q(i * 7 - 4);
        const y = Q(j * 5 - 2);
        const val = (r: string) => (v.length === 1 ? holds(r.replace(new RegExp(v[0], 'g'), 'x'), x) : holds(r.replace(new RegExp(v[0], 'g'), 'x').replace(new RegExp(v[1], 'g'), 'y'), x, y));
        if (val(rebuilt) !== val(pr.answer.value)) {
          errs.push(`answer ${pr.answer.value} differs from rebuilt ${rebuilt}`);
          return errs;
        }
      }
    return errs;
  },
};

const TWO_VAR_PHRASE: Array<{ x: string; y: string; a: [number, number]; b: [number, number]; n: [number, number]; phrases: string[]; text(a: number, b: number, ph: string, n: number): string }> = [
  { x: 'w', y: 't', a: [2, 3], b: [1, 1], n: [20, 45], phrases: ['at least', 'more than', 'a minimum of'], text: (a, b, ph, n) => `A soccer league gives $${a}$ points for each win $w$ and $${b}$ point for each tie $t$. To make the playoffs, a team's total points must be ${ph} $${n}$.` },
  { x: 'p', y: 'v', a: [3, 6], b: [40, 90], n: [800, 2000], phrases: ['at most', 'cannot exceed', 'is under', 'no more than'], text: (a, b, ph, n) => `Each photo $p$ uses $${a}$ MB of storage and each video $v$ uses $${b}$ MB. The storage you use ${ph === 'at most' || ph === 'no more than' ? `is ${ph}` : ph} $${n}$ MB.` },
  { x: 'r', y: 'c', a: [6, 12], b: [3, 5], n: [60, 150], phrases: ['at least', 'more than', 'a minimum of'], text: (a, b, ph, n) => `A fitness app gives $${a}$ stars for each run $r$ and $${b}$ stars for each cycling ride $c$. To win the weekly challenge, your star total must be ${ph} $${n}$.` },
];

// ---------------------------------------------------------------------------
// S2.02: write a two-variable inequality from a situation
// ---------------------------------------------------------------------------

interface BudgetCtx {
  key: string;
  dir: 'max' | 'min';
  money: boolean;
  phrases: string[];
  xNoun: string;
  yNoun: string;
  a: [number, number];
  b: [number, number];
  /** setup sentence; numbers appear in the order a, b, total, extra */
  text(a: string, b: string, ph: string, total: string): string;
  extra?(f: string): string;
}

const BUDGET: BudgetCtx[] = [
  { key: 'snacks', dir: 'max', money: true, phrases: ['at most', 'no more than', 'less than'], xNoun: 'snacks', yNoun: 'drinks', a: [2, 5], b: [1, 4], text: (a, b, ph, t) => `Maya is buying snacks for ${a} each and drinks for ${b} each for a movie night. She can spend ${ph} ${t}.`, extra: (f) => `She already spent ${f} on decorations from the same money.` },
  { key: 'jobs', dir: 'min', money: true, phrases: ['at least', 'more than', 'a minimum of'], xNoun: 'hours babysitting', yNoun: 'hours tutoring', a: [10, 15], b: [16, 25], text: (a, b, ph, t) => `Leo earns ${a} per hour babysitting and ${b} per hour tutoring. He wants to earn ${ph} ${t} this month.`, extra: (f) => `He already earned ${f} this month from mowing a lawn.` },
  { key: 'game', dir: 'min', money: false, phrases: ['at least', 'more than', 'a minimum of'], xNoun: 'coins', yNoun: 'gems', a: [5, 20], b: [25, 60], text: (a, b, ph, t) => `In a video game, each coin is worth ${a} points and each gem is worth ${b} points. To unlock the next world you need ${ph} ${t} points.`, extra: (f) => `You already have ${f} points from a bonus round.` },
  { key: 'storage', dir: 'max', money: false, phrases: ['at most', 'no more than', 'less than'], xNoun: 'songs', yNoun: 'videos', a: [4, 9], b: [50, 120], text: (a, b, ph, t) => `Each song you download uses ${a} MB and each video uses ${b} MB. You want to use ${ph} ${t} MB of space.`, extra: (f) => `Your apps already use ${f} MB of that space.` },
  { key: 'fundraiser', dir: 'min', money: true, phrases: ['at least', 'more than', 'a minimum of'], xNoun: 'student tickets', yNoun: 'adult tickets', a: [3, 6], b: [7, 12], text: (a, b, ph, t) => `The drama club sells student tickets for ${a} each and adult tickets for ${b} each. The club needs to raise ${ph} ${t}.`, extra: (f) => `A local business already donated ${f}.` },
];

export const genWriteIneq2Var: GeneratorDef = {
  id: 'u2.write-ineq-2var',
  skillId: 'S2.02',
  description: 'Write a linear inequality in two variables that models a situation.',
  generate(rng, difficulty) {
    const ctx = rng.pick(BUDGET);
    const ph = difficulty === 1 ? ctx.phrases[0] : rng.pick(ctx.phrases);
    const op = PHRASE_OP[ph];
    const a = Q(rng.int(ctx.a[0], ctx.a[1]));
    let b = Q(rng.int(ctx.b[0], ctx.b[1]));
    while (b.eq(a)) b = Q(rng.int(ctx.b[0], ctx.b[1]));
    const unitTotal = ctx.money ? 10 : ctx.key === 'storage' ? 100 : 50;
    const total = Q(rng.int(6, 20) * unitTotal);
    const fmt = (v: Rational) => (ctx.money ? money(v) : `$${v.toTex()}$`);
    const extra = difficulty === 3 && ctx.extra ? Q(ctx.money ? rng.int(2, 8) * 5 : rng.int(1, 4) * (unitTotal / 2)) : null;
    const lhs = `${numStr(a)}x + ${numStr(b)}y${extra ? ` + ${numStr(extra)}` : ''}`;
    const answer = `${lhs} ${op} ${numStr(total)}`;
    const lhsTex = `${a.toTex()}x + ${b.toTex()}y${extra ? ` + ${extra.toTex()}` : ''}`;
    const prompt = [
      p(`${ctx.text(fmt(a), fmt(b), `**${ph}**`, fmt(total))}${extra && ctx.extra ? ' ' + ctx.extra(fmt(extra)) : ''}`),
      p(`Let $x$ be the number of ${ctx.xNoun} and $y$ the number of ${ctx.yNoun}. Write an inequality for this situation.`),
    ];
    return makeProblem({
      skillId: 'S2.02',
      tags: ['word', 'real-world'],
      prompt,
      answer: { kind: 'inequality', value: answer },
      inputHint: 'Type an inequality using x and y, like 3x + 5y <= 60.',
      hints: [
        `Start with the total. Each of the ${ctx.xNoun} adds ${fmt(a)}, so $x$ of them add $${a.toTex()}x$.`,
        `Do the same for the ${ctx.yNoun}: $${b.toTex()}y$.${extra ? ` Then add the ${fmt(extra)} that is already counted.` : ''}`,
        PHRASE_HELP[op],
        `The total is $${lhsTex}$. Compare it with ${fmt(total)}.`,
      ],
      solution: [
        { text: `Amount from the ${ctx.xNoun}: $${a.toTex()}x$. Amount from the ${ctx.yNoun}: $${b.toTex()}y$.`, why: 'Amount for each one times how many.' },
        ...(extra ? [{ text: `Add the amount already counted: $${extra.toTex()}$.`, why: 'It is part of the same total, so it goes on the same side.' }] : []),
        { text: `"${ph}" means $${OP_TEX[op]}$.`, why: PHRASE_HELP[op] },
        { text: 'Write the inequality.', tex: `${lhsTex} ${OP_TEX[op]} ${total.toTex()}`, why: extra ? `Subtracting $${extra.toTex()}$ from both sides gives the same inequality, $${a.toTex()}x + ${b.toTex()}y ${OP_TEX[op]} ${total.sub(extra).toTex()}$.` : 'Any combination that makes this true fits the situation.' },
      ],
      misconceptions: stringMisconceptions(answer, [
        { answer: `${numStr(b)}x + ${numStr(a)}y${extra ? ` + ${numStr(extra)}` : ''} ${op} ${numStr(total)}`, tag: 'equation-setup', feedback: `Match each amount with its own variable: $x$ counts the ${ctx.xNoun}, so it goes with ${fmt(a)}.` },
        ...(extra ? [{ answer: `${numStr(a)}x + ${numStr(b)}y ${op} ${numStr(total)}`, tag: 'equation-setup' as const, feedback: `Don't forget the ${fmt(extra)} that is already part of the total.` }] : []),
        ...(extra ? [{ answer: `${numStr(a)}x + ${numStr(b)}y ${op} ${numStr(total.add(extra))}`, tag: 'equation-setup' as const, feedback: `The ${fmt(extra)} is already part of the total, so it uses up (or counts toward) the goal. It should make the right side smaller, not bigger.` }] : []),
      ]),
      steps: [
        {
          prompt: [...prompt.slice(0, 1), p(`First write an expression for the total${ctx.money ? ' in dollars' : ''} using $x$ and $y$.`)],
          answer: { kind: 'expression', value: `${numStr(a)}x + ${numStr(b)}y${extra ? ` + ${numStr(extra)}` : ''}`, variables: ['x', 'y'] },
          hints: ['Amount for each item times how many of that item.', `$x$ ${ctx.xNoun} give $${a.toTex()}x$.`, `$y$ ${ctx.yNoun} give $${b.toTex()}y$.`, extra ? `Add both parts and the ${fmt(extra)} already counted.` : 'Add the two parts.'],
          explanation: `The total is $${lhsTex}$.`,
        },
        {
          prompt: [p(`The total is $${lhsTex}$. The situation says **${ph}** ${fmt(total)}. Write the inequality.`)],
          answer: { kind: 'inequality', value: answer },
          hints: [PHRASE_HELP[op], 'Put the total on the left and the limit on the right.', `"${ph}" is ${isGreater(op) ? 'a lower limit' : 'an upper limit'}.`, `Use $${OP_TEX[op]}$.`],
          explanation: `$${lhsTex} ${OP_TEX[op]} ${total.toTex()}$.`,
        },
      ],
    });
  },
  verify(pr) {
    if (pr.answer.kind !== 'inequality') return ['unexpected kind'];
    const text = (pr.prompt[0] as { text: string }).text;
    const ph = findPhrase(text);
    if (!ph) return ['no phrase'];
    const op = PHRASE_OP[ph];
    const nums = [...text.replace(/\*\*/g, '').matchAll(/(\d+(?:\.\d+)?)/g)].map((m) => Q(m[1]));
    if (nums.length < 3) return ['numbers missing'];
    const [a, b, total, extra] = nums;
    const rebuilt = `${numStr(a)}x + ${numStr(b)}y ${extra ? `+ ${numStr(extra)}` : ''} ${op} ${numStr(total)}`;
    for (let x = 0; x <= 40; x += 3)
      for (let y = 0; y <= 40; y += 4) if (holds(rebuilt, x, y) !== holds(pr.answer.value, x, y)) return [`differs at (${x}, ${y})`];
    // the situation must have whole-number solutions and non-solutions
    return holds(rebuilt, 0, 0) !== holds(rebuilt, 100, 100) ? [] : ['degenerate situation'];
  },
};

// ---------------------------------------------------------------------------
// S2.03: boundary line and shading
// ---------------------------------------------------------------------------

const featureLabel = (strict: boolean, above: boolean) => `${strict ? 'Dashed' : 'Solid'} boundary line, shade ${above ? 'above' : 'below'} the line`;

function pickSlope(rng: Rng, d: Difficulty): Rational {
  if (d === 1) return Q(rng.nonzeroInt(-3, 3));
  if (rng.bool()) return Q(rng.nonzeroInt(-4, 4));
  const den = rng.pick([2, 3]);
  let num = rng.nonzeroInt(-5, 5);
  while (num % den === 0) num = rng.nonzeroInt(-5, 5);
  return Q(num, den);
}

export const genGraphIneqFeatures: GeneratorDef = {
  id: 'u2.graph-ineq-features',
  skillId: 'S2.03',
  description: 'Decide the boundary line type and the side to shade for a linear inequality.',
  generate(rng, difficulty) {
    const op = rng.pick(['<', '>', '<=', '>='] as Op[]);
    let promptTex: string;
    let m: Rational;
    let b: Rational;
    let solved: Op = op; // y solved-op
    const pre: Array<{ text: string; tex?: string; why?: string }> = [];
    let stepAnswer: string | null = null;
    if (difficulty < 3) {
      m = pickSlope(rng, difficulty);
      b = Q(rng.int(-6, 6));
      if (difficulty === 2 && rng.bool()) {
        // reversed: mx + b op y  means  y FLIP(op) mx + b
        promptTex = `${linearTex(m, b)} ${OP_TEX[op]} y`;
        solved = FLIP_OP[op];
        pre.push({ text: 'Rewrite it with $y$ on the left.', tex: `y ${OP_TEX[solved]} ${linearTex(m, b)}`, why: `"$A ${OP_TEX[op]} y$" says the same thing as "$y ${OP_TEX[solved]} A$": turn the whole statement around and the symbol turns with it.` });
      } else promptTex = `y ${OP_TEX[op]} ${linearTex(m, b)}`;
    } else {
      // standard form Ax + By op C, B negative most of the time
      const A = rng.nonzeroInt(-6, 6);
      let B = rng.nonzeroInt(2, 6);
      if (rng.next() < 0.65) B = -B;
      const C = B * rng.int(-4, 4);
      m = Q(-A, B);
      b = Q(C, B);
      promptTex = `${linearTex(Q(A), Q(0))} ${B < 0 ? '-' : '+'} ${Math.abs(B) === 1 ? '' : Math.abs(B)}y ${OP_TEX[op]} ${C}`;
      solved = B < 0 ? FLIP_OP[op] : op;
      pre.push(
        { text: `Subtract $${linearTex(Q(A), Q(0))}$ from both sides.`, tex: `${B}y ${OP_TEX[op]} ${linearTex(Q(-A), Q(C))}`, why: 'Subtracting does not change the symbol.' },
        { text: `Divide both sides by $${B}$.${B < 0 ? ' It is negative, so flip the symbol.' : ''}`, tex: `y ${OP_TEX[solved]} ${linearTex(m, b)}`, why: B < 0 ? 'Dividing by a negative number reverses the order.' : 'Dividing by a positive number keeps the order.' },
      );
      stepAnswer = `y ${solved} ${linearPlain(m, b)}`;
    }
    const strict = isStrict(solved);
    const above = isGreater(solved);
    const correct = featureLabel(strict, above);
    const answer = makeChoice(rng, correct, [featureLabel(!strict, above), featureLabel(strict, !above), featureLabel(!strict, !above)]);
    const solution = [
      ...pre,
      { text: `The symbol is $${OP_TEX[solved]}$${strict ? ', with no "or equal to"' : ', which includes "or equal to"'}, so the boundary line is ${strict ? 'dashed' : 'solid'}.`, why: strict ? 'Points on the line make the two sides equal, and $<$ or $>$ does not allow equal, so the line is not part of the solution.' : 'Points on the line make the two sides equal, which $\\le$ and $\\ge$ allow, so the line is part of the solution.' },
      { text: `$y$ is ${above ? 'greater' : 'less'} than the line's value, so shade ${above ? 'above' : 'below'} the line.`, why: 'For each $x$, the larger $y$-values are higher up. A test point not on the line confirms it.' },
    ];
    const prompt = [p(`How should you graph $${promptTex}$?`)];
    return makeProblem({
      skillId: 'S2.03',
      tags: ['graph'],
      prompt,
      answer,
      hints: [
        difficulty === 3 ? 'Solve for $y$ first, so you can read the symbol. Watch out: dividing by a negative flips it.' : 'Two decisions: the type of line, and which side to shade.',
        '$<$ and $>$ give a dashed line (the line is not included). $\\le$ and $\\ge$ give a solid line.',
        'With $y$ by itself on the left, $y >$ or $y \\ge$ means shade above; $y <$ or $y \\le$ means shade below.',
        'Check with a test point such as $(0, 0)$ if it is not on the line: if it makes the inequality true, shade the side it is on.',
      ],
      solution,
      misconceptions: [],
      steps: stepAnswer
        ? [
            {
              prompt: [p(`Solve $${promptTex}$ for $y$.`)],
              answer: { kind: 'inequality', value: stepAnswer, form: 'solved', variable: 'y' },
              hints: ['Get the $y$ term alone first, then divide by its coefficient.', 'Subtracting a term from both sides keeps the symbol.', 'Dividing by a negative number flips the symbol.', `Divide every term by the coefficient of $y$.`],
              misconceptions: isStrict(op) === isStrict(solved) && solved !== op ? [{ answer: `y ${op} ${linearPlain(m, b)}`, tag: 'inequality-direction', feedback: 'You divided by a negative number, so the symbol must flip.' }] : [],
              explanation: `$y ${OP_TEX[solved]} ${linearTex(m, b)}$.`,
            },
            { prompt, answer, hints: ['Read the symbol in $y ' + OP_TEX[solved] + ' ' + linearTex(m, b) + '$.', 'Dashed for $<$ or $>$; solid for $\\le$ or $\\ge$.', '$y$ greater means above; $y$ less means below.', 'Test $(0, 0)$ if the line does not pass through it.'], explanation: correct + '.' },
          ]
        : undefined,
    });
  },
  verify(pr) {
    if (pr.answer.kind !== 'choice') return ['unexpected kind'];
    const m = /^How should you graph \$(.+)\$\?$/.exec((pr.prompt[0] as { text: string }).text);
    if (!m) return ['cannot parse'];
    const rel = relTexToPlain(m[1]);
    const lab = /^(Dashed|Solid) boundary line, shade (above|below)/.exec(choiceLabel(pr.answer));
    if (!lab) return ['cannot parse label'];
    const errs: string[] = [];
    // independent route: test points far above and far below the line, and a point on it
    const highTrue = holds(rel, 0, 10_000);
    const lowTrue = holds(rel, 0, -10_000);
    if (highTrue === lowTrue) errs.push('shading not one-sided');
    if ((lab[2] === 'above') !== highTrue) errs.push('shading side wrong');
    // boundary point: solve the equality for y at x = 0 by bisection on the exact relation
    const eq = rel.replace(/<=|>=|<|>/, '=');
    const [l, r] = eq.split('=');
    const lp = toPoly(parseExpression(l)).sub(toPoly(parseExpression(r)));
    const c0 = lp.evaluate({ x: Q(0), y: Q(0) });
    const c1 = lp.evaluate({ x: Q(0), y: Q(1) }).sub(c0);
    const yb = c0.neg().div(c1);
    if (holds(rel, 0, yb) !== (lab[1] === 'Solid')) errs.push('boundary type wrong');
    return errs;
  },
};

// ---------------------------------------------------------------------------
// S2.03: write the inequality shown by a graph
// ---------------------------------------------------------------------------

export const genIneqFromGraph: GeneratorDef = {
  id: 'u2.ineq-from-graph',
  skillId: 'S2.03',
  description: 'Write the linear inequality shown by a graph with a boundary line and shading.',
  generate(rng, difficulty) {
    const strict = rng.bool();
    const above = rng.bool();
    const vertical = difficulty === 3 && rng.next() < 0.25;
    if (vertical) {
      const c = rng.nonzeroInt(-5, 5);
      const right = above;
      const op: Op = right ? (strict ? '>' : '>=') : strict ? '<' : '<=';
      const answer = `x ${op} ${c}`;
      const spec: GraphSpec = { xMin: -8, xMax: 8, yMin: -8, yMax: 8, verticalInequalities: [{ x: c, side: right ? 'right' : 'left', strict }], ariaLabel: `Coordinate plane with a ${strict ? 'dashed' : 'solid'} vertical line at x = ${c} and the region to its ${right ? 'right' : 'left'} shaded.` };
      return makeProblem({
        skillId: 'S2.03',
        tags: ['graph'],
        prompt: [p('Write the inequality shown by the graph.'), { t: 'graph', spec }],
        answer: { kind: 'inequality', value: answer },
        inputHint: 'Type an inequality like y < 2x + 1 or x >= 3.',
        hints: [
          'The boundary is a **vertical** line. Every point on a vertical line has the same $x$-value.',
          `The line is at $x = ${c}$, so the inequality only involves $x$.`,
          'Shading to the right means larger $x$-values; to the left means smaller.',
          `${strict ? 'A dashed line means the line is not included.' : 'A solid line means the line is included.'}`,
        ],
        solution: [
          { text: `The boundary is the vertical line $x = ${c}$.`, why: 'Every point on it has $x$-coordinate $' + c + '$.' },
          { text: `The shading is to the ${right ? 'right' : 'left'}, where $x$ is ${right ? 'greater' : 'less'} than $${c}$.`, why: '$x$-values increase to the right.' },
          { text: `The line is ${strict ? 'dashed, so it is not included' : 'solid, so it is included'}.`, tex: `x ${OP_TEX[op]} ${c}` },
        ],
        misconceptions: stringMisconceptions(answer, [{ answer: `y ${op} ${c}`, tag: 'graph-reading', feedback: 'This boundary is vertical, so it is an $x = $ line, not a $y = $ line.' }]),
      });
    }
    let m = pickSlope(rng, difficulty);
    if (difficulty === 2 && rng.next() < 0.15) m = Q(0);
    // keep the intercept and a second lattice point inside the window
    const b = Q(rng.int(-4, 4));
    const run = m.isInteger() ? 1 : Number(m.toString().split('/')[1]);
    const rise = m.mul(Q(run));
    const op: Op = above ? (strict ? '>' : '>=') : strict ? '<' : '<=';
    const rhs = linearPlain(m, b);
    const answer = `y ${op} ${rhs}`;
    const spec: GraphSpec = {
      xMin: -8,
      xMax: 8,
      yMin: -8,
      yMax: 8,
      inequalities: [{ boundary: rhs, side: above ? 'above' : 'below', strict }],
      points: difficulty < 3 ? [{ x: 0, y: b.toNumber() }, { x: run, y: b.add(rise).toNumber() }] : [],
      ariaLabel: `Coordinate plane with a ${strict ? 'dashed' : 'solid'} line through (0, ${b.toNumber()}) and (${run}, ${b.add(rise).toNumber()}), shaded ${above ? 'above' : 'below'} the line.`,
    };
    const misc = [
      ...(m.isZero() ? [] : [{ answer: `y ${op} ${linearPlain(m.neg(), b)}`, tag: 'sign-error' as const, feedback: 'Check the sign of the slope: does the line go up or down from left to right?' }]),
      ...(!m.isZero() && !m.inv().eq(m) ? [{ answer: `y ${op} ${linearPlain(m.inv(), b)}`, tag: 'rise-run-swap' as const, feedback: 'Slope is rise over run: the vertical change on top.' }] : []),
      ...(!b.isZero() && !m.isZero() && !b.eq(m) ? [{ answer: `y ${op} ${linearPlain(b, m)}`, tag: 'equation-setup' as const, feedback: 'In $y = mx + b$, the slope multiplies $x$ and the $y$-intercept is added on.' }] : []),
    ];
    return makeProblem({
      skillId: 'S2.03',
      tags: ['graph'],
      prompt: [p('Write the inequality shown by the graph.'), { t: 'graph', spec }],
      answer: { kind: 'inequality', value: answer },
      inputHint: 'Type an inequality like y < 2x + 1 or y >= -3.',
      hints: [
        'Start with the boundary line: find its $y$-intercept and its slope.',
        `The line crosses the $y$-axis at $(0, ${b.toTex()})$. ${m.isZero() ? 'It is horizontal.' : 'Count rise over run between two grid points on the line.'}`,
        `The line is ${strict ? 'dashed, so use $<$ or $>$' : 'solid, so use $\\le$ or $\\ge$'}.`,
        `The shading is ${above ? 'above' : 'below'} the line, so $y$ is ${above ? 'greater' : 'less'} than the line's value.`,
      ],
      solution: [
        { text: `The boundary line has $y$-intercept $${b.toTex()}$ and slope $${m.toTex()}$.`, tex: `y = ${linearTex(m, b)}`, why: m.isZero() ? 'A horizontal line has slope $0$.' : `From $(0, ${b.toTex()})$ the line ${rise.isNegative() ? 'falls' : 'rises'} $${rise.abs().toTex()}$ for every $${run}$ to the right, so the slope is $${rise.toTex()} \\div ${run} = ${m.toTex()}$.` },
        { text: `The line is ${strict ? 'dashed: points on it are not solutions' : 'solid: points on it are solutions'}.`, why: strict ? 'Dashed means $<$ or $>$.' : 'Solid means $\\le$ or $\\ge$.' },
        { text: `The shading is ${above ? 'above' : 'below'} the line.`, tex: `y ${OP_TEX[op]} ${linearTex(m, b)}`, why: `Points ${above ? 'above' : 'below'} the line have ${above ? 'larger' : 'smaller'} $y$-values than the line. Test $(0, ${b.add(Q(above ? 2 : -2)).toTex()})$, a shaded point: it makes the inequality true.` },
      ],
      misconceptions: stringMisconceptions(answer, misc),
    });
  },
  verify(pr) {
    if (pr.answer.kind !== 'inequality') return ['unexpected kind'];
    const g = pr.prompt.find((b) => b.t === 'graph') as Extract<Block, { t: 'graph' }> | undefined;
    if (!g) return ['no graph'];
    const ans = pr.answer.value;
    const errs: string[] = [];
    if (g.spec.verticalInequalities?.length) {
      const v = g.spec.verticalInequalities[0];
      if (holds(ans, v.x, 3) === v.strict) errs.push('boundary inclusion');
      if (holds(ans, v.x + 2, 0) !== (v.side === 'right')) errs.push('side');
      if (holds(ans, v.x - 2, 0) !== (v.side === 'left')) errs.push('side left');
      return errs;
    }
    const q = g.spec.inequalities![0];
    const f = toPoly(parseExpression(q.boundary));
    for (const x of [-3, 0, 2, 5]) {
      const yb = f.evaluate({ x: Q(x) });
      if (holds(ans, x, yb) === q.strict) errs.push(`boundary inclusion at x=${x}`);
      if (holds(ans, x, yb.add(Q(1, 2))) !== (q.side === 'above')) errs.push(`side at x=${x}`);
      if (holds(ans, x, yb.sub(Q(1, 2))) !== (q.side === 'below')) errs.push(`side below at x=${x}`);
    }
    // marked points lie on the boundary and inside the window
    for (const pt of g.spec.points ?? []) {
      if (!f.evaluate({ x: Q(pt.x) }).eq(Q(pt.y))) errs.push('marked point off the line');
      if (Math.abs(pt.x) > 8 || Math.abs(pt.y) > 8) errs.push('marked point outside window');
    }
    return errs;
  },
};

export const U2_TWO_VAR_GENERATORS: GeneratorDef[] = [genIneqPhrases, genWriteIneq2Var, genGraphIneqFeatures, genIneqFromGraph];
