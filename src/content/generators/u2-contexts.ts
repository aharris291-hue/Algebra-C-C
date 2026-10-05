/**
 * Shared real-world situations for Unit 2 constraint and system generators.
 * Each has a count constraint (x + y compared with N) and a money constraint
 * (a·x + b·y compared with T). Numbers appear in the text in the order a, b, N, T.
 */
import type { Rng } from '../../core/curriculum/types';
import { Rational } from '../../core/math/rational';
import { Q, money, numStr } from './util';
import type { Op } from './u2-common';

export interface SysContext {
  key: string;
  xNoun: string;
  yNoun: string;
  countOp: Op;
  moneyOp: Op;
  /** what the money total is: "money raised", "amount spent" */
  moneyWhat: string;
  /** what the count is */
  countWhat: string;
  a: [number, number];
  b: [number, number];
  n: [number, number];
  /** full setup with both constraints; phrases appear count first, then money */
  text(a: string, b: string, n: number, t: string): string;
  /** setup with only the money constraint (numbers a, b, T in order) */
  moneyText(a: string, b: string, t: string): string;
}

export const SYS_CONTEXTS: SysContext[] = [
  {
    key: 'bake-sale',
    xNoun: 'cookies',
    yNoun: 'brownies',
    countOp: '<=',
    moneyOp: '>=',
    moneyWhat: 'money raised',
    countWhat: 'treats baked',
    a: [1, 3],
    b: [2, 5],
    n: [30, 60],
    text: (a, b, n, t) => `The art club is selling cookies for ${a} each and brownies for ${b} each. They can bake **at most** $${n}$ treats in total, and they want to raise **at least** ${t}.`,
    moneyText: (a, b, t) => `The art club is selling cookies for ${a} each and brownies for ${b} each. They want to raise **at least** ${t}.`,
  },
  {
    key: 'prizes',
    xNoun: 'small prizes',
    yNoun: 'large prizes',
    countOp: '>=',
    moneyOp: '<=',
    moneyWhat: 'amount spent',
    countWhat: 'prizes bought',
    a: [1, 3],
    b: [4, 8],
    n: [15, 40],
    text: (a, b, n, t) => `For the school carnival, Jaylen is buying small prizes for ${a} each and large prizes for ${b} each. He needs **at least** $${n}$ prizes and can spend **at most** ${t}.`,
    moneyText: (a, b, t) => `For the school carnival, Jaylen is buying small prizes for ${a} each and large prizes for ${b} each. He can spend **at most** ${t}.`,
  },
  {
    key: 'jobs',
    xNoun: 'hours lifeguarding',
    yNoun: 'hours tutoring',
    countOp: '<=',
    moneyOp: '>=',
    moneyWhat: 'money earned',
    countWhat: 'hours worked',
    a: [10, 13],
    b: [15, 20],
    n: [12, 25],
    text: (a, b, n, t) => `Rosa earns ${a} per hour lifeguarding and ${b} per hour tutoring. She can work **at most** $${n}$ hours a week, and she wants to earn **at least** ${t} a week.`,
    moneyText: (a, b, t) => `Rosa earns ${a} per hour lifeguarding and ${b} per hour tutoring. She wants to earn **at least** ${t} this week.`,
  },
  {
    key: 'theater',
    xNoun: 'student tickets',
    yNoun: 'adult tickets',
    countOp: '<=',
    moneyOp: '>=',
    moneyWhat: 'ticket money',
    countWhat: 'tickets sold',
    a: [4, 7],
    b: [8, 12],
    n: [60, 120],
    text: (a, b, n, t) => `A community theater sells student tickets for ${a} and adult tickets for ${b}. It can sell **at most** $${n}$ tickets for a show, and the show needs to bring in **at least** ${t}.`,
    moneyText: (a, b, t) => `A community theater sells student tickets for ${a} and adult tickets for ${b}. The show needs to bring in **at least** ${t}.`,
  },
  {
    key: 'snacks',
    xNoun: 'granola bars',
    yNoun: 'fruit cups',
    countOp: '>=',
    moneyOp: '<=',
    moneyWhat: 'amount spent',
    countWhat: 'snacks bought',
    a: [1, 2],
    b: [2, 4],
    n: [20, 40],
    text: (a, b, n, t) => `Coach Lee is buying granola bars for ${a} each and fruit cups for ${b} each for the team. She needs **at least** $${n}$ snacks and can spend **at most** ${t}.`,
    moneyText: (a, b, t) => `Coach Lee is buying granola bars for ${a} each and fruit cups for ${b} each for the team. She can spend **at most** ${t}.`,
  },
];

export interface SysInstance {
  ctx: SysContext;
  a: Rational;
  b: Rational;
  n: number;
  t: Rational;
  countRel: string;
  moneyRel: string;
}

/** Pick numbers so the system has whole-number solutions and also whole-number non-solutions on the count line. */
export function buildSystem(rng: Rng, ctx: SysContext = rng.pick(SYS_CONTEXTS)): SysInstance {
  for (;;) {
    const a = rng.int(ctx.a[0], ctx.a[1]);
    let b = rng.int(ctx.b[0], ctx.b[1]);
    while (b === a) b = rng.int(ctx.b[0], ctx.b[1]);
    const n = rng.int(ctx.n[0], ctx.n[1]);
    const lo = Math.min(a, b) * n;
    const hi = Math.max(a, b) * n;
    // a money target strictly between the all-x and all-y totals, rounded to 5
    const t = Math.round((lo + (hi - lo) * (0.3 + 0.4 * rng.next())) / 5) * 5;
    if (t <= lo || t >= hi) continue;
    const A = Q(a);
    const B = Q(b);
    const T = Q(t);
    return { ctx, a: A, b: B, n, t: T, countRel: `x + y ${ctx.countOp} ${n}`, moneyRel: `${numStr(A)}x + ${numStr(B)}y ${ctx.moneyOp} ${numStr(T)}` };
  }
}

export function systemText(s: SysInstance): string {
  return s.ctx.text(money(s.a), money(s.b), s.n, money(s.t));
}
