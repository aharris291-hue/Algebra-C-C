/**
 * Unit 1, Lesson 6 generator: domain and range of linear functions (S1.11).
 */
import type { GeneratorDef, GraphSpec } from '../../core/curriculum/types';
import type { Misconception } from '../../core/math/answers';
import { parseInterval, intervalsEqual, intervalToText, intervalToTex, type Interval } from '../../core/math/answers';
import { Rational } from '../../core/math/rational';
import { linearPlain, linearTex, decTex } from '../../core/math/format';
import { toPoly } from '../../core/math/poly';
import { parseExpression } from '../../core/math/parser';
import { Q, p, makeProblem, texToExpr } from './util';
import { buildContext, DECREASING_KEYS } from './u1-contexts';

const ALL: Interval = { lo: null, loClosed: false, hi: null, hiClosed: false };

function ivText(iv: Interval): string {
  return intervalToText(iv);
}

/** Interval answer misconceptions, dropping duplicates of the key. */
function ivMisconceptions(key: Interval, list: Array<{ iv: Interval; tag: Misconception['tag']; feedback: string }>): Misconception[] {
  const seen: Interval[] = [key];
  const out: Misconception[] = [];
  for (const l of list) {
    if (seen.some((s) => intervalsEqual(s, l.iv))) continue;
    seen.push(l.iv);
    out.push({ answer: ivText(l.iv), tag: l.tag, feedback: l.feedback });
  }
  return out;
}

export const genDomainRange: GeneratorDef = {
  id: 'u1.domain-range',
  skillId: 'S1.11',
  description: 'Write the domain or range of a graphed line, ray or segment, or of a real-world linear function, in interval or set-builder notation.',
  generate(rng, difficulty) {
    const askDomain = rng.bool();
    const word = askDomain ? 'domain' : 'range';
    const notationHint = 'Type interval notation like [-2, 5) or (-inf, 3], set-builder like {x | x >= 2}, or an inequality like -2 <= x < 5.';
    if (difficulty === 3) {
      const ctx = buildContext(rng, DECREASING_KEYS);
      const { f, v, m, b } = ctx;
      const end = b.div(m.neg()); // input where the output reaches 0
      const key: Interval = askDomain ? { lo: Q(0), loClosed: true, hi: end, hiClosed: true } : { lo: Q(0), loClosed: true, hi: b, hiClosed: true };
      const story = `${ctx.setup} The function $${f}(${v}) = ${linearTex(m, b, v, true)}$ gives ${ctx.outputDesc}, from the start until it reaches 0.`;
      return makeProblem({
        skillId: 'S1.11',
        tags: ['real-world', 'word'],
        prompt: [p(story), p(`What is the ${word} of $${f}$ in this situation? (The input can be any number of ${ctx.inUnits}, including parts of ${ctx.inUnit === 'hour' ? 'an' : 'a'} ${ctx.inUnit}.)`)],
        answer: { kind: 'interval', value: ivText(key) },
        inputHint: notationHint,
        hints: [
          askDomain ? `The domain is every input that makes sense: the ${ctx.inUnits} from the start until the output reaches 0.` : 'The range is every output the situation actually produces.',
          `The situation starts at $${v} = 0$, when $${f}(0) = ${decTex(b)}$.`,
          `It ends when $${f}(${v}) = 0$. Solve $${linearTex(m, b, v, true)} = 0$ to find that input.`,
          'Both the start and the end really happen, so both endpoints are included: use square brackets.',
        ],
        solution: [
          { text: 'Find the starting point.', tex: `${f}(0) = ${decTex(b)}`, why: `At $${v} = 0$, ${ctx.startMeaning}.` },
          { text: 'Find when the output reaches 0.', tex: `${linearTex(m, b, v, true)} = 0 \\;\\Rightarrow\\; ${v} = ${decTex(end)}`, why: `${ctx.rateMeaning[0].toUpperCase()}${ctx.rateMeaning.slice(1)}, so the output hits 0 after ${decTex(end)} ${ctx.inUnits}.` },
          {
            text: askDomain ? 'The inputs run from 0 to that time.' : 'The outputs run from 0 up to the starting value.',
            tex: askDomain ? `0 \\le ${v} \\le ${decTex(end)} \\quad\\text{or}\\quad [0, ${decTex(end)}]` : `0 \\le ${f}(${v}) \\le ${decTex(b)} \\quad\\text{or}\\quad [0, ${decTex(b)}]`,
            why: 'Negative inputs or outputs would not make sense here, so the function is limited to this interval.',
          },
        ],
        misconceptions: ivMisconceptions(key, [
          { iv: ALL, tag: 'interval-endpoint', feedback: 'A real situation has limits. Inputs and outputs here cannot be negative, and the output stops at 0.' },
          { iv: askDomain ? { lo: Q(0), loClosed: true, hi: b, hiClosed: true } : { lo: Q(0), loClosed: true, hi: end, hiClosed: true }, tag: 'graph-reading', feedback: askDomain ? 'That interval describes the outputs. The domain is about the inputs.' : 'That interval describes the inputs. The range is about the outputs.' },
          { iv: { lo: Q(0), loClosed: true, hi: null, hiClosed: false }, tag: 'interval-endpoint', feedback: 'The situation ends when the output reaches 0, so the interval has an upper end.' },
        ]),
      });
    }
    // graphs: line (d1 sometimes), segment, or ray
    const m = Q(rng.nonzeroInt(-2, 2));
    const b = Q(rng.int(-3, 3));
    const shape = difficulty === 1 ? rng.pick(['line', 'segment', 'segment'] as const) : rng.pick(['segment', 'ray'] as const);
    const fx = (x: number) => m.mul(x).add(b);
    let x1 = rng.int(-6, 0);
    let x2 = rng.int(1, 6);
    while (Math.abs(fx(x1).toNumber()) > 8 || Math.abs(fx(x2).toNumber()) > 8) {
      x1 = rng.int(-4, 0);
      x2 = rng.int(1, 4);
    }
    const open1 = difficulty === 2 ? rng.bool() : false;
    const open2 = difficulty === 2 ? !open1 || rng.bool() : false;
    const spec: GraphSpec = { xMin: -9, xMax: 9, yMin: -9, yMax: 9, ariaLabel: '' };
    let key: Interval;
    let describe: string;
    if (shape === 'line') {
      spec.functions = [{ expr: linearPlain(m, b) }];
      spec.ariaLabel = `A line with slope ${m.toString()} that continues forever in both directions.`;
      describe = 'The line continues forever in both directions.';
      key = ALL;
    } else if (shape === 'segment') {
      spec.functions = [{ expr: linearPlain(m, b), domain: [x1, x2] }];
      spec.points = [
        { x: x1, y: fx(x1).toNumber(), open: open1, label: `(${x1}, ${fx(x1).toString()})` },
        { x: x2, y: fx(x2).toNumber(), open: open2, label: `(${x2}, ${fx(x2).toString()})` },
      ];
      const ends = `(${x1}, ${fx(x1).toString()}) ${open1 ? 'open' : 'closed'} and (${x2}, ${fx(x2).toString()}) ${open2 ? 'open' : 'closed'}`;
      spec.ariaLabel = `A line segment with endpoints ${ends}.`;
      describe = `The graph is a segment. ${open1 || open2 ? 'An open circle means that endpoint is **not** included; a' : 'A'} filled dot means the endpoint is included.`;
      if (askDomain) key = { lo: Q(x1), loClosed: !open1, hi: Q(x2), hiClosed: !open2 };
      else {
        const [ya, yb] = [fx(x1), fx(x2)];
        key = ya.lt(yb) ? { lo: ya, loClosed: !open1, hi: yb, hiClosed: !open2 } : { lo: yb, loClosed: !open2, hi: ya, hiClosed: !open1 };
      }
    } else {
      const toRight = rng.bool();
      const x0 = toRight ? x1 : x2;
      const y0 = fx(x0);
      const openEnd = rng.bool();
      spec.functions = [{ expr: linearPlain(m, b), domain: toRight ? [x0, 30] : [-30, x0] }];
      spec.points = [{ x: x0, y: y0.toNumber(), open: openEnd, label: `(${x0}, ${y0.toString()})` }];
      spec.ariaLabel = `A ray starting at (${x0}, ${y0.toString()}) with ${openEnd ? 'an open' : 'a closed'} endpoint, continuing forever to the ${toRight ? 'right' : 'left'}.`;
      describe = `The graph is a ray: it starts at $(${x0}, ${y0.toTex()})$ (${openEnd ? 'an open circle, so that point is **not** included' : 'a filled dot, so that point is included'}) and continues forever to the ${toRight ? 'right' : 'left'}.`;
      if (askDomain) key = toRight ? { lo: Q(x0), loClosed: !openEnd, hi: null, hiClosed: false } : { lo: null, loClosed: false, hi: Q(x0), hiClosed: !openEnd };
      else {
        // outputs go up forever if (moving right and increasing) or (moving left and decreasing)
        const up = toRight === !m.isNegative();
        key = up ? { lo: y0, loClosed: !openEnd, hi: null, hiClosed: false } : { lo: null, loClosed: false, hi: y0, hiClosed: !openEnd };
      }
    }
    const flipped: Interval = { ...key, loClosed: !key.loClosed, hiClosed: !key.hiClosed };
    const misc: Array<{ iv: Interval; tag: Misconception['tag']; feedback: string }> = [];
    if (shape !== 'line') {
      // domain/range mix-up
      if (shape === 'segment') {
        const other = askDomain
          ? (() => {
              const [ya, yb] = [fx(x1), fx(x2)];
              return ya.lt(yb) ? { lo: ya, loClosed: !open1, hi: yb, hiClosed: !open2 } : { lo: yb, loClosed: !open2, hi: ya, hiClosed: !open1 };
            })()
          : { lo: Q(x1), loClosed: !open1, hi: Q(x2), hiClosed: !open2 };
        misc.push({ iv: other, tag: 'graph-reading', feedback: askDomain ? 'Those are the $y$-values (the range). The domain uses the $x$-values.' : 'Those are the $x$-values (the domain). The range uses the $y$-values.' });
      }
      misc.push({ iv: ALL, tag: 'interval-endpoint', feedback: 'This graph does not go on forever in both directions. Look at where it starts or stops.' });
    }
    return makeProblem({
      skillId: 'S1.11',
      tags: ['graph'],
      prompt: [p(`What is the ${word} of the function graphed below? ${describe}`), { t: 'graph', spec }],
      answer: { kind: 'interval', value: ivText(key) },
      inputHint: notationHint,
      hints: [
        askDomain ? 'The domain is the set of all $x$-values (inputs) the graph uses. Look left to right.' : 'The range is the set of all $y$-values (outputs) the graph reaches. Look bottom to top.',
        askDomain ? 'Find the leftmost and rightmost $x$-values on the graph. If the graph keeps going, that side goes to infinity.' : 'Find the lowest and highest points on the graph. If the graph keeps going up or down, that side goes to infinity.',
        'A filled dot means the endpoint is included: use a square bracket [ or ]. An open circle means it is not: use a parenthesis ( or ).',
        'Infinity always gets a parenthesis, and the smaller number is written first.',
      ],
      solution: [
        { text: askDomain ? 'Read the inputs from left to right.' : 'Read the outputs from bottom to top.', why: askDomain ? 'Domain means all possible inputs.' : 'Range means all possible outputs.' },
        { text: shape === 'line' ? 'A non-horizontal line keeps going in both directions, so it uses every real number.' : 'Check each end: included (filled dot), excluded (open circle), or continuing forever.', why: 'The type of bracket shows whether an endpoint is part of the set.' },
        { text: `The ${word} is:`, tex: `${intervalToTex(key)}` },
      ],
      misconceptions: ivMisconceptions(key, [...misc, ...(shape === 'line' ? [] : [{ iv: flipped, tag: 'interval-endpoint' as const, feedback: 'Check each endpoint: a filled dot is included (bracket), an open circle is not (parenthesis).' }])]),
    });
  },
  verify(pr) {
    if (pr.answer.kind !== 'interval') return ['wrong kind'];
    const got = parseInterval(pr.answer.value);
    const askDomain = /What is the domain/.test((pr.prompt[0] as { text: string }).text) || /What is the domain/.test((pr.prompt[1] as { text?: string })?.text ?? '');
    const g = pr.prompt.find((b) => b.t === 'graph') as { spec: GraphSpec } | undefined;
    let expect: Interval;
    if (!g) {
      const story = (pr.prompt[0] as { text: string }).text;
      const rm = /\$([A-Z])\(([a-z])\) = (.+?)\$ gives/.exec(story);
      if (!rm) return ['cannot parse'];
      const poly = toPoly(parseExpression(texToExpr(rm[3])));
      const start = poly.evaluate({ [rm[2]]: Q(0) });
      // scan for the zero by bisection-free exact solve: f(t) = start + slope*t
      const slope = poly.evaluate({ [rm[2]]: Q(1) }).sub(start);
      const zero = start.neg().div(slope);
      if (!poly.evaluate({ [rm[2]]: zero }).isZero() || zero.isNegative()) return ['bad zero'];
      expect = askDomain ? { lo: Q(0), loClosed: true, hi: zero, hiClosed: true } : { lo: Q(0), loClosed: true, hi: start, hiClosed: true };
    } else {
      const fn = g.spec.functions![0];
      const poly = toPoly(parseExpression(fn.expr));
      const at = (x: number) => poly.evaluate({ x: Q(x) });
      const pts = g.spec.points ?? [];
      for (const pt of pts) if (!at(pt.x).eq(pt.y)) return ['marked point not on line'];
      const closedAt = (x: number) => !pts.find((pt) => pt.x === x)?.open;
      const [d0, d1] = fn.domain ?? [-Infinity, Infinity];
      const loX = d0 <= g.spec.xMin ? null : d0;
      const hiX = d1 >= g.spec.xMax ? null : d1;
      if (askDomain) expect = { lo: loX === null ? null : Q(loX), loClosed: loX !== null && closedAt(loX), hi: hiX === null ? null : Q(hiX), hiClosed: hiX !== null && closedAt(hiX) };
      else {
        // outputs at each end (null = unbounded in that direction)
        const ends: Array<{ y: Rational | null; dir: number; closed: boolean }> = [];
        const slope = at(1).sub(at(0));
        ends.push(loX === null ? { y: null, dir: -slope.sign(), closed: false } : { y: at(loX), dir: 0, closed: closedAt(loX) });
        ends.push(hiX === null ? { y: null, dir: slope.sign(), closed: false } : { y: at(hiX), dir: 0, closed: closedAt(hiX) });
        const finite = ends.filter((e) => e.y !== null) as Array<{ y: Rational; closed: boolean }>;
        const goesUp = ends.some((e) => e.y === null && e.dir > 0);
        const goesDown = ends.some((e) => e.y === null && e.dir < 0);
        const lowest = finite.length ? finite.reduce((a, c) => (c.y.lt(a.y) ? c : a)) : null;
        const highest = finite.length ? finite.reduce((a, c) => (c.y.gt(a.y) ? c : a)) : null;
        expect = {
          lo: goesDown || !lowest ? null : lowest.y,
          loClosed: !goesDown && !!lowest && lowest.closed,
          hi: goesUp || !highest ? null : highest.y,
          hiClosed: !goesUp && !!highest && highest.closed,
        };
      }
    }
    return intervalsEqual(got, expect) ? [] : [`expected ${intervalToText(expect)}, got ${pr.answer.value}`];
  },
};

export const U1_DOMAIN_GENERATORS = [genDomainRange];

