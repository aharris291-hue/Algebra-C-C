/**
 * Unit 4, Lessons 1-5 generators: parts of quadratic expressions (S4.01), adding, subtracting
 * and multiplying polynomials (S4.02, S4.03), special products (S4.04), and factoring
 * (S4.05-S4.08). Keys are built from the factors; verify() re-reads the printed expression,
 * multiplies it out independently and checks the requested form.
 */
import type { GeneratorDef, Rng, SolutionStep, ProblemStep } from '../../core/curriculum/types';
import type { Misconception, MisconceptionTag } from '../../core/math/answers';
import { isCompletelyFactored, isExpandedForm } from '../../core/math/answers';
import { parseExpression } from '../../core/math/parser';
import { toPoly, Poly } from '../../core/math/poly';
import { polyTex, polyPlain } from '../../core/math/format';
import { p, makeProblem, makeChoice, choiceLabel, texToExpr } from './util';
import { X, lin, pTex, pPlain, linPlain, linTex, texPoly, plainPoly, mathOf, gcd, gcdAll, factorPairs, pairLabel } from './u4-common';

const EXPANDED_HINT = 'Type an answer like 2x^2 - 5x + 3.';
const FACTORED_HINT = 'Type an answer like 3x(x - 2) or (2x + 1)(x - 3).';

/** Keep misconceptions whose polynomial differs from the key and from each other. */
function polyMisconceptions(key: Poly, list: Array<{ poly: Poly; answer: string; tag: MisconceptionTag; feedback: string }>): Misconception[] {
  const seen: Poly[] = [key];
  const out: Misconception[] = [];
  for (const m of list) {
    if (seen.some((s) => s.equals(m.poly))) continue;
    seen.push(m.poly);
    out.push({ answer: m.answer, tag: m.tag, feedback: m.feedback });
  }
  return out;
}

/** verify(): printed expression and key are the same polynomial, and the key has the requested form. */
function verifySameAndForm(pr: Parameters<GeneratorDef['verify']>[0], vars: string[] = ['x']): string[] {
  if (pr.answer.kind !== 'expression') return ['unexpected kind'];
  const tex = mathOf(pr);
  if (!tex) return ['no expression'];
  const given = texPoly(tex);
  const key = plainPoly(pr.answer.value);
  const errs: string[] = [];
  if (!given.equals(key)) errs.push(`key ${pr.answer.value} != ${polyPlain(given, vars)}`);
  const node = parseExpression(pr.answer.value);
  if (pr.answer.form === 'expanded' && !isExpandedForm(node)) errs.push('key not expanded');
  if (pr.answer.form === 'factored' && !isCompletelyFactored(node)) errs.push('key not completely factored');
  return errs;
}

const nz = (rng: Rng, lo: number, hi: number) => rng.nonzeroInt(lo, hi);

/** TeX for terms in a chosen order, e.g. 7 - 5x + 3x^2. */
function termsTex(terms: Array<{ deg: number; coef: number }>): string {
  return terms
    .filter((t) => t.coef !== 0)
    .map((t, i) => {
      const a = Math.abs(t.coef);
      const body = t.deg === 0 ? String(a) : `${a === 1 ? '' : a}${t.deg === 1 ? 'x' : `x^{${t.deg}}`}`;
      if (i === 0) return t.coef < 0 ? `-${body}` : body;
      return t.coef < 0 ? ` - ${body}` : ` + ${body}`;
    })
    .join('');
}

// ---------------------------------------------------------------------------
// S4.01: parts of a quadratic expression
// ---------------------------------------------------------------------------

type Part = 'leading' | 'constant' | 'xcoef' | 'terms' | 'degree';
const PART_Q: Record<Part, string> = {
  leading: 'What is the **leading coefficient** of the expression below?',
  constant: 'What is the **constant term** of the expression below?',
  xcoef: 'What is the **coefficient of $x$** in the expression below?',
  terms: 'How many **terms** does the expression below have?',
  degree: 'What is the **degree** of the expression below?',
};
const CTX_LABELS = {
  start: 'The height of the ball, in feet, when it is thrown (at $t = 0$)',
  speed: 'The upward speed of the ball, in feet per second, when it is thrown',
  max: 'The greatest height the ball reaches',
  time: 'The number of seconds until the ball hits the ground',
};

function partValue(poly: Poly, part: Part): number {
  switch (part) {
    case 'leading':
      return poly.coeff('x', poly.degreeIn('x')).toInt();
    case 'constant':
      return poly.coeff('x', 0).toInt();
    case 'xcoef':
      return poly.coeff('x', 1).toInt();
    case 'terms':
      return poly.terms.size;
    case 'degree':
      return poly.degreeIn('x');
  }
}

export const genInterpretParts: GeneratorDef = {
  id: 'u4.interpret-parts',
  skillId: 'S4.01',
  description: 'Name the terms, coefficients, constant term, degree and factors of a quadratic expression, including in context.',
  generate(rng, difficulty) {
    if (difficulty === 3) {
      const v = rng.pick([32, 48, 64, 80]);
      const h0 = rng.pick([3, 4, 5, 6, 8, 10]);
      const askStart = rng.bool();
      const asked = askStart ? h0 : v;
      const tex = `h(t) = -16t^{2} + ${v}t + ${h0}`;
      const correct = askStart ? CTX_LABELS.start : CTX_LABELS.speed;
      const answer = makeChoice(rng, correct, Object.values(CTX_LABELS).filter((l) => l !== correct));
      return makeProblem({
        skillId: 'S4.01',
        tags: ['real-world'],
        prompt: [p('A ball is thrown straight up. Its height in feet after $t$ seconds is'), { t: 'math', tex }, p(`What does the **${asked}** in the function represent?`)],
        answer,
        hints: [
          'Each term of the function means something about the ball.',
          'Try substituting $t = 0$, the moment the ball is thrown. Which terms are left?',
          'The term with $t$ to the first power is the part that grows steadily with time, like a speed times a time.',
          'The greatest height and the landing time come from solving or graphing, not from reading one number.',
        ],
        solution: askStart
          ? [{ text: 'Substitute $t = 0$.', tex: `h(0) = -16(0)^{2} + ${v}(0) + ${h0} = ${h0}`, why: `At the moment the ball is thrown its height is ${h0} feet, so the constant term is the starting height.` }]
          : [{ text: `The term $${v}t$ is (feet per second) times (seconds).`, why: `So $${v}$ is the upward speed, in feet per second, at the moment the ball is thrown. The $-16t^{2}$ term is gravity slowing it down.` }],
        misconceptions: [],
      });
    }
    if (difficulty === 2 && rng.int(0, 2) === 0) {
      // which is a factor?
      const k = rng.int(2, 6);
      const r1 = nz(rng, -7, 7);
      let r2 = nz(rng, -7, 7);
      while (r2 === r1 || r2 === -r1) r2 = nz(rng, -7, 7);
      const tex = `${k}\\left(${linTex(1, -r1)}\\right)\\left(${linTex(1, -r2)}\\right)`;
      const correct = rng.bool() ? r1 : r2;
      const fakes = [-correct, ...[1, 2, 3, 4, 5, 6, 7, 8].map((d) => correct + d)].filter((r) => r !== r1 && r !== r2 && r !== 0);
      const opts = [`$${linTex(1, -correct)}$`, ...rng.shuffle(fakes).slice(0, 3).map((r) => `$${linTex(1, -r)}$`)];
      const answer = makeChoice(rng, opts[0], opts.slice(1));
      return makeProblem({
        skillId: 'S4.01',
        tags: [],
        prompt: [p('Which expression is a **factor** of the expression below?'), { t: 'math', tex }],
        answer,
        hints: [
          'Factors are the parts that are **multiplied** together.',
          'This expression is already written as a product of a number and two binomials.',
          `Compare the signs carefully: $${linTex(1, -r1)}$ and $${linTex(1, r1)}$ are different factors.`,
          'Exactly one choice appears as a factor in the product.',
        ],
        solution: [{ text: `The expression is $${k}$ times $${linTex(1, -r1)}$ times $${linTex(1, -r2)}$.`, why: 'Each of these is a factor.' }, { text: `So $${linTex(1, -correct)}$ is a factor.` }],
        misconceptions: [],
      });
    }
    const a = nz(rng, -6, 9);
    const b = nz(rng, -9, 9);
    const c = nz(rng, -12, 12);
    const terms = [
      { deg: 2, coef: a },
      { deg: 1, coef: b },
      { deg: 0, coef: c },
    ];
    const shown = difficulty === 2 ? rng.pick([[2, 1, 0], [1, 0, 2], [0, 2, 1], [0, 1, 2]] as number[][]).map((i) => terms[i]) : terms;
    const tex = termsTex(shown);
    const poly = X([c, b, a]);
    const part = rng.pick<Part>(difficulty === 1 ? ['leading', 'constant', 'xcoef', 'terms', 'degree'] : ['leading', 'leading', 'constant', 'xcoef']);
    const val = partValue(poly, part);
    const pool = part === 'terms' || part === 'degree' ? [1, 2, 3, 4] : [a, b, c, -a, -b, -c, 2, 3].filter((x) => x !== val);
    const distract = [...new Set(pool.filter((x) => x !== val))].slice(0, 3);
    const answer = makeChoice(rng, `$${val}$`, distract.map((x) => `$${x}$`));
    const why: Record<Part, string> = {
      leading: `The leading coefficient multiplies the term with the highest power of $x$, which is $${a === 1 ? '' : a === -1 ? '-' : a}x^{2}$.`,
      constant: 'The constant term is the term with no variable.',
      xcoef: `The term with $x$ to the first power is $${termsTex([{ deg: 1, coef: b }])}$. Its coefficient includes the sign.`,
      terms: 'Terms are separated by $+$ and $-$ signs.',
      degree: 'The degree is the highest power of $x$ that appears.',
    };
    return makeProblem({
      skillId: 'S4.01',
      tags: [],
      prompt: [p(PART_Q[part]), { t: 'math', tex }],
      answer,
      hints: [
        'Write the expression in standard form, highest power first: $ax^{2} + bx + c$.',
        'A coefficient is the number multiplying a variable. A subtraction sign makes the coefficient negative.',
        'The constant term has no variable. Terms are separated by $+$ and $-$ signs.',
        'The leading term has the highest power of $x$. It does not have to be written first.',
      ],
      solution: [
        { text: 'Write the expression in standard form.', tex: polyTex(poly, ['x']), why: 'Ordering the terms by power makes each part easy to name.' },
        { text: `The answer is $${val}$.`, why: why[part] },
      ],
      misconceptions: [],
    });
  },
  verify(pr) {
    if (pr.answer.kind !== 'choice') return ['unexpected kind'];
    const tex = mathOf(pr)!;
    const texts = pr.prompt.filter((b) => b.t === 'p').map((b) => (b as { text: string }).text);
    const key = choiceLabel(pr.answer);
    if (tex.startsWith('h(t)')) {
      const h = toPoly(parseExpression(texToExpr(tex.split('=')[1])));
      const asked = Number(/the \*\*(\d+)\*\*/.exec(texts[1])![1]);
      const h0 = h.coeff('t', 0).toInt();
      const v = h.coeff('t', 1).toInt();
      if (h0 === v) return ['ambiguous number'];
      if (asked === h0) return key === CTX_LABELS.start ? [] : ['wrong key (start)'];
      if (asked === v) return key === CTX_LABELS.speed ? [] : ['wrong key (speed)'];
      return ['asked number not in function'];
    }
    const poly = texPoly(tex);
    if (texts[0].includes('factor')) {
      const hits = pr.answer.options.filter((o) => {
        const f = texPoly(o.label.slice(1, -1));
        const root = f.coeff('x', 0).neg().div(f.coeff('x', 1));
        return poly.evaluate({ x: root }).isZero();
      });
      if (hits.length !== 1) return [`${hits.length} options are factors`];
      return hits[0].id === pr.answer.correct ? [] : ['wrong key'];
    }
    const part = (Object.keys(PART_Q) as Part[]).find((k) => PART_Q[k] === texts[0]);
    if (!part) return ['unknown question'];
    const want = partValue(poly, part);
    const errs: string[] = [];
    if (key !== `$${want}$`) errs.push(`key ${key}, expected ${want}`);
    if (new Set(pr.answer.options.map((o) => o.label)).size !== pr.answer.options.length) errs.push('duplicate options');
    return errs;
  },
};

// ---------------------------------------------------------------------------
// S4.02: add and subtract polynomials
// ---------------------------------------------------------------------------

function randQuad(rng: Rng): Poly {
  for (;;) {
    const q = X([rng.int(-9, 9), rng.int(-9, 9), nz(rng, -6, 6)]);
    if (q.terms.size >= 2) return q;
  }
}
const paren = (q: Poly) => `\\left(${pTex(q)}\\right)`;

export const genAddSubPoly: GeneratorDef = {
  id: 'u4.add-sub-poly',
  skillId: 'S4.02',
  description: 'Add and subtract polynomials of degree 2 or less.',
  generate(rng, difficulty) {
    const P = randQuad(rng);
    const Qp = randQuad(rng);
    const R = randQuad(rng);
    let result: Poly;
    let tex: string;
    const mis: Array<{ poly: Poly; answer: string; tag: MisconceptionTag; feedback: string }> = [];
    if (difficulty === 1) {
      result = P.add(Qp);
      tex = `${paren(P)} + ${paren(Qp)}`;
    } else if (difficulty === 2) {
      result = P.sub(Qp);
      tex = `${paren(P)} - ${paren(Qp)}`;
      const lead = X([0, 0, Qp.coeff('x', 2).toNumber()]);
      const wrong = P.sub(lead).add(Qp.sub(lead));
      mis.push({ poly: wrong, answer: pPlain(wrong), tag: 'distribution', feedback: 'The minus sign in front of the parentheses changes the sign of **every** term inside, not just the first one.' });
      const added = P.add(Qp);
      mis.push({ poly: added, answer: pPlain(added), tag: 'sign-error', feedback: 'This problem subtracts the second polynomial. Change the sign of each of its terms, then combine.' });
    } else {
      result = P.sub(Qp).add(R);
      tex = `${paren(P)} - ${paren(Qp)} + ${paren(R)}`;
      const wrong = P.add(Qp).add(R);
      mis.push({ poly: wrong, answer: pPlain(wrong), tag: 'sign-error', feedback: 'Subtract the second polynomial: change the sign of every term inside its parentheses.' });
    }
    if (result.isZero()) return genAddSubPoly.generate(rng, difficulty);
    const solution: SolutionStep[] = [];
    if (difficulty >= 2) {
      const neg = Qp.neg();
      const parts = difficulty === 2 ? [P, neg] : [P, neg, R];
      solution.push({ text: 'Distribute the minus sign to every term in the second polynomial.', tex: parts.map((q, i) => (i === 0 ? pTex(q) : pTex(q).startsWith('-') ? ` - ${pTex(q).slice(1)}` : ` + ${pTex(q)}`)).join(''), why: 'Subtracting a polynomial means adding its opposite.' });
    }
    solution.push({ text: 'Combine like terms: $x^{2}$ terms together, $x$ terms together, and constants together.', tex: `= ${pTex(result)}` });
    return makeProblem({
      skillId: 'S4.02',
      tags: [],
      prompt: [p('Simplify. Write your answer in standard form.'), { t: 'math', tex }],
      answer: { kind: 'expression', value: pPlain(result), form: 'expanded' },
      inputHint: EXPANDED_HINT,
      hints: [
        'Only like terms can be combined: $x^{2}$ with $x^{2}$, $x$ with $x$, numbers with numbers.',
        difficulty === 1 ? 'Adding polynomials: the parentheses can just be dropped.' : 'A minus sign in front of parentheses changes the sign of every term inside.',
        'Line up like terms in columns if it helps.',
        'Write the answer with the highest power first.',
      ],
      solution,
      misconceptions: polyMisconceptions(result, mis),
    });
  },
  verify: (pr) => verifySameAndForm(pr),
};

// ---------------------------------------------------------------------------
// S4.03: multiply polynomials
// ---------------------------------------------------------------------------

export const genMultiplyPoly: GeneratorDef = {
  id: 'u4.multiply-poly',
  skillId: 'S4.03',
  description: 'Multiply a monomial by a binomial and a binomial by a binomial.',
  generate(rng, difficulty) {
    if (difficulty === 1) {
      const kk = rng.pick([-4, -3, -2, 2, 3, 4, 5, 6]);
      const a = nz(rng, -5, 6);
      const b = nz(rng, -9, 9);
      const mono = X([0, kk]);
      const result = mono.mul(lin(a, b));
      const tex = `${kk}x\\left(${linTex(a, b)}\\right)`;
      const forgot = X([b, 0, kk * a]);
      return makeProblem({
        skillId: 'S4.03',
        tags: [],
        prompt: [p('Multiply. Write your answer in standard form.'), { t: 'math', tex }],
        answer: { kind: 'expression', value: pPlain(result), form: 'expanded' },
        inputHint: EXPANDED_HINT,
        hints: [
          'Use the distributive property: multiply the outside term by **each** term inside.',
          `Multiply $${kk}x$ by $${termsTex([{ deg: 1, coef: a }])}$. Then multiply $${kk}x$ by $${b}$.`,
          'When you multiply $x \\cdot x$, you get $x^{2}$.',
          kk < 0 || a < 0 || b < 0 ? 'Watch the signs: a negative times a positive is negative, and a negative times a negative is positive.' : 'Every product here is positive.',
        ],
        solution: [
          { text: 'Distribute to each term.', tex: `${kk < 0 ? `(${kk}x)` : `${kk}x`} \\cdot ${a < 0 ? `(${termsTex([{ deg: 1, coef: a }])})` : termsTex([{ deg: 1, coef: a }])} + ${kk < 0 ? `(${kk}x)` : `${kk}x`} \\cdot ${b < 0 ? `(${b})` : b}`, why: 'The distributive property: $a(b + c) = ab + ac$.' },
          { text: 'Multiply.', tex: `= ${pTex(result)}` },
        ],
        misconceptions: polyMisconceptions(result, [{ poly: forgot, answer: pPlain(forgot), tag: 'distribution', feedback: `Multiply $${kk}x$ by **both** terms in the parentheses, including the $${b}$.` }]),
      });
    }
    const a = difficulty === 2 ? 1 : rng.int(2, 5);
    const c = difficulty === 2 ? 1 : rng.int(1, 4) * (rng.int(0, 3) === 0 ? -1 : 1);
    const b = nz(rng, -9, 9);
    const d = nz(rng, -9, 9);
    if (gcd(a, b) !== 1 || gcd(c, d) !== 1) return genMultiplyPoly.generate(rng, difficulty);
    const result = lin(a, b).mul(lin(c, d));
    const mid = a * d + b * c;
    if (mid === 0) return genMultiplyPoly.generate(rng, difficulty);
    const tex = `\\left(${linTex(a, b)}\\right)\\left(${linTex(c, d)}\\right)`;
    const firstLast = X([b * d, 0, a * c]);
    const term = (coef: number, deg: number) => termsTex([{ deg, coef }]);
    const steps: ProblemStep[] = [
      {
        prompt: [p(`In $${tex}$, the two middle products are $${term(a, 1)} \\cdot ${d < 0 ? `(${d})` : d}$ and $${b < 0 ? `(${b})` : b} \\cdot ${c < 0 ? `(${term(c, 1)})` : term(c, 1)}$. Combined, what is the **coefficient of $x$**?`)],
        answer: { kind: 'number', value: String(mid) },
        hints: [`The first middle product is $${a * d}x$.`, `The second middle product is $${b * c}x$.`, 'Add the two coefficients.', 'Keep track of negative signs.'],
        explanation: `$${a * d}x + ${b * c < 0 ? `(${b * c}x)` : `${b * c}x`} = ${mid}x$.`,
      },
      {
        prompt: [p(`Now write the whole product $${tex}$ in standard form.`)],
        answer: { kind: 'expression', value: pPlain(result), form: 'expanded' },
        inputHint: EXPANDED_HINT,
        hints: [`First times first: $${term(a, 1)} \\cdot ${term(c, 1)} = ${term(a * c, 2)}$.`, `Last times last: $${b} \\cdot ${d < 0 ? `(${d})` : d} = ${b * d}$.`, `The middle term is $${term(mid, 1)}$.`, 'Write the terms from the highest power to the lowest.'],
        explanation: `$${tex} = ${pTex(result)}$.`,
      },
    ];
    return makeProblem({
      skillId: 'S4.03',
      tags: difficulty === 3 ? ['multi-step'] : [],
      prompt: [p('Multiply. Write your answer in standard form.'), { t: 'math', tex }],
      answer: { kind: 'expression', value: pPlain(result), form: 'expanded' },
      inputHint: EXPANDED_HINT,
      hints: [
        'Multiply every term in the first binomial by every term in the second: four products in all.',
        'A 2-by-2 box (area model) keeps the four products organized.',
        'The two middle products are both $x$ terms. Combine them.',
        'Check the sign of each product before you combine.',
      ],
      solution: [
        { text: 'Multiply each term of the first binomial by each term of the second.', tex: `${term(a * c, 2)} ${a * d < 0 ? '-' : '+'} ${term(Math.abs(a * d), 1)} ${b * c < 0 ? '-' : '+'} ${term(Math.abs(b * c), 1)} ${b * d < 0 ? '-' : '+'} ${Math.abs(b * d)}`, why: 'This is the distributive property used twice (first, outer, inner, last).' },
        { text: 'Combine the like terms in the middle.', tex: `= ${pTex(result)}` },
      ],
      misconceptions: polyMisconceptions(result, [{ poly: firstLast, answer: pPlain(firstLast), tag: 'distribution', feedback: 'You multiplied only the first terms and the last terms. There are four products: the two middle ones make the $x$ term.' }]),
      steps,
    });
  },
  verify: (pr) => verifySameAndForm(pr),
};

// ---------------------------------------------------------------------------
// S4.04: special products
// ---------------------------------------------------------------------------

export const genSpecialProducts: GeneratorDef = {
  id: 'u4.special-products',
  skillId: 'S4.04',
  description: 'Square a binomial and multiply conjugates.',
  generate(rng, difficulty) {
    const kind = difficulty === 1 ? 'square' : rng.pick(['square', 'conj'] as const);
    const twoVar = difficulty === 3 && kind === 'square' && rng.bool();
    const a = difficulty === 1 ? 1 : rng.int(difficulty === 2 && kind === 'conj' ? 1 : 2, 5);
    const b = nz(rng, -9, 9);
    const vars = ['x', 'y'];
    let tex: string;
    let result: Poly;
    let missing: Poly;
    let B2 = b;
    if (twoVar) {
      const B = Math.abs(b) > 5 ? Math.sign(b) * 3 : b;
      B2 = B;
      const left = new Poly(new Map([['x', toPoly(parseExpression(String(a))).constantValue()]])).add(new Poly(new Map([['y', toPoly(parseExpression(String(B))).constantValue()]])));
      result = left.mul(left);
      tex = `\\left(${polyTex(left, vars)}\\right)^{2}`;
      missing = toPoly(parseExpression(`${a * a}x^2 + ${B * B}y^2`));
    } else if (kind === 'square') {
      result = lin(a, b).mul(lin(a, b));
      tex = `\\left(${linTex(a, b)}\\right)^{2}`;
      missing = X([b * b, 0, a * a]);
    } else {
      const B = Math.abs(b);
      result = lin(a, B).mul(lin(a, -B));
      tex = `\\left(${linTex(a, B)}\\right)\\left(${linTex(a, -B)}\\right)`;
      missing = X([B * B, 0, a * a]);
    }
    // standard form: by powers of x (x^2, then xy, then y^2)
    const xyTerms = (fmt: 'plain' | 'tex') => {
      const mono = (coef: number, m: string) => ({ coef, m: fmt === 'tex' ? m.replace(/\^(\d)/, '^{$1}') : m });
      const ts = [mono(a * a, 'x^2'), mono(2 * a * B2, 'xy'), mono(B2 * B2, 'y^2')];
      return ts.map((t, i) => {
        const body = `${Math.abs(t.coef) === 1 ? '' : Math.abs(t.coef)}${t.m}`;
        return i === 0 ? (t.coef < 0 ? `-${body}` : body) : t.coef < 0 ? ` - ${body}` : ` + ${body}`;
      }).join('');
    };
    const plain = twoVar ? xyTerms('plain') : polyPlain(result, vars);
    const resultTex = twoVar ? xyTerms('tex') : polyTex(result, vars);
    const isSq = kind === 'square' || twoVar;
    const minus = isSq && B2 < 0;
    return makeProblem({
      skillId: 'S4.04',
      tags: [],
      prompt: [p('Multiply. Write your answer in standard form.'), { t: 'math', tex }],
      answer: { kind: 'expression', value: plain, form: 'expanded' },
      inputHint: EXPANDED_HINT,
      hints: [
        isSq ? 'Squaring means multiplying the binomial by itself: write it out twice.' : 'These binomials are conjugates: same terms, opposite signs in the middle.',
        isSq ? (minus ? 'Pattern: $(a - b)^{2} = a^{2} - 2ab + b^{2}$.' : 'Pattern: $(a + b)^{2} = a^{2} + 2ab + b^{2}$.') : 'Pattern: $(a + b)(a - b) = a^{2} - b^{2}$.',
        isSq ? `The middle term is **twice** the product of the two terms${minus ? ', and here it is negative' : ''}.` : 'The two middle products are opposites, so they cancel.',
        isSq ? (minus ? 'Do not forget the middle term: $(a - b)^{2}$ is not $a^{2} - b^{2}$.' : 'Do not forget the middle term: $(a + b)^{2}$ is not $a^{2} + b^{2}$.') : 'The answer has only two terms, and the constant is subtracted.',
      ],
      solution: [
        { text: isSq ? (minus ? 'Use the pattern $(a - b)^{2} = a^{2} - 2ab + b^{2}$.' : 'Use the pattern $(a + b)^{2} = a^{2} + 2ab + b^{2}$.') : 'Use the pattern $(a + b)(a - b) = a^{2} - b^{2}$.', why: isSq ? (minus ? 'Multiplying the binomial by itself gives two equal middle products, $(-ab) + (-ab) = -2ab$.' : 'Multiplying the binomial by itself gives two equal middle products, $ab + ab = 2ab$.') : 'The middle products $-ab$ and $+ab$ add to zero.' },
        { text: 'Simplify.', tex: `${tex} = ${resultTex}` },
      ],
      misconceptions: polyMisconceptions(result, [
        isSq
          ? { poly: missing, answer: polyPlain(missing, vars), tag: 'exponent-rule', feedback: minus ? 'Squaring a difference is not the same as squaring each term. $(a - b)^{2} = a^{2} - 2ab + b^{2}$: you are missing the middle term.' : 'Squaring a sum is not the same as squaring each term. $(a + b)^{2} = a^{2} + 2ab + b^{2}$: you are missing the middle term.' }
          : { poly: missing, answer: polyPlain(missing, vars), tag: 'sign-error', feedback: 'The last product is a positive times a negative, so the constant is **subtracted**: $(a + b)(a - b) = a^{2} - b^{2}$.' },
      ]),
    });
  },
  verify: (pr) => verifySameAndForm(pr, ['x', 'y']),
};

// ---------------------------------------------------------------------------
// S4.05: factor out the GCF
// ---------------------------------------------------------------------------

/** Quadratic with integer coefficients, content 1, that does not factor over the integers. */
function irreducibleQuad(rng: Rng): [number, number, number] {
  for (;;) {
    const a = rng.int(1, 5);
    const b = nz(rng, -9, 9);
    const c = nz(rng, -9, 9);
    if (gcdAll([a, b, c]) !== 1) continue;
    const D = b * b - 4 * a * c;
    if (D >= 0 && Number.isInteger(Math.sqrt(D))) continue;
    return [a, b, c];
  }
}

export const genFactorGcf: GeneratorDef = {
  id: 'u4.factor-gcf',
  skillId: 'S4.05',
  description: 'Factor the greatest common factor out of a polynomial.',
  generate(rng, difficulty) {
    let g = rng.int(2, 9);
    let k = 0; // power of x in the GCF
    let inner: Poly;
    if (difficulty === 1) {
      let a = rng.int(1, 6);
      let b = nz(rng, -9, 9);
      while (gcd(a, b) !== 1) b = nz(rng, -9, 9);
      if (rng.bool()) {
        k = 1;
        if (a === 1 && g === 1) a = 2;
      }
      inner = lin(a, b);
    } else {
      const [a, b, c] = irreducibleQuad(rng);
      inner = X([c, b, a]);
      if (difficulty === 3) k = rng.int(1, 2);
      if (difficulty === 3 && rng.bool()) g = rng.int(1, 4) * 2;
    }
    const xk = k === 0 ? Poly.const(1) : X(k === 1 ? [0, 1] : [0, 0, 1]);
    const full = inner.mul(xk).scale(toPoly(parseExpression(String(g))).constantValue());
    const gcfPlain = `${g}${k === 0 ? '' : k === 1 ? 'x' : 'x^2'}`;
    const gcfTex = `${g}${k === 0 ? '' : k === 1 ? 'x' : 'x^{2}'}`;
    const answer = `${gcfPlain}(${pPlain(inner)})`;
    const tex = pTex(full);
    return makeProblem({
      skillId: 'S4.05',
      tags: [],
      prompt: [p('Factor out the greatest common factor (GCF).'), { t: 'math', tex }],
      answer: { kind: 'expression', value: answer, form: 'factored' },
      inputHint: FACTORED_HINT,
      hints: [
        'The GCF is the largest number (and power of $x$) that divides **every** term.',
        'Find the GCF of the coefficients first, then the lowest power of $x$ that appears in every term.',
        'Divide each term by the GCF. The results go inside the parentheses.',
        'Check by multiplying back out: you should get the original expression.',
      ],
      solution: [
        { text: 'Find the GCF of all the terms.', tex: `\\text{GCF} = ${gcfTex}`, why: `$${g}$ is the largest number dividing every coefficient${k ? `, and $${k === 1 ? 'x' : 'x^{2}'}$ is the lowest power of $x$ in every term` : ''}.` },
        { text: 'Divide each term by the GCF and write the result in parentheses.', tex: `${tex} = ${gcfTex}\\left(${pTex(inner)}\\right)`, why: 'Multiplying back out gives the original expression, and the terms inside have no common factor left.' },
      ],
      misconceptions: [],
    });
  },
  verify: (pr) => verifySameAndForm(pr),
};

// ---------------------------------------------------------------------------
// S4.06: factor x^2 + bx + c
// ---------------------------------------------------------------------------

function pairStep(prod: number, sum: number, rng: Rng, pq: [number, number], prodLabel: string): ProblemStep {
  const key = pairLabel(Math.min(...pq), Math.max(...pq));
  const others = factorPairs(prod).filter(([u, v]) => u + v !== sum).map(([u, v]) => pairLabel(Math.min(u, v), Math.max(u, v)));
  const answer = makeChoice(rng, key, rng.shuffle([...new Set(others)]).slice(0, 3));
  return {
    prompt: [p(`Which two numbers multiply to $${prod}$ ${prodLabel} and add to $${sum}$?`)],
    answer,
    hints: ['List the factor pairs of the product.', prod < 0 ? 'The product is negative, so one number is negative and one is positive.' : sum < 0 ? 'The product is positive and the sum is negative, so both numbers are negative.' : 'The product and sum are positive, so both numbers are positive.', 'Check the sum of each pair.', `Only one pair adds to $${sum}$.`],
    explanation: `${key}: their product is $${prod}$ and their sum is $${sum}$.`,
  };
}

export const genFactorTrinomial: GeneratorDef = {
  id: 'u4.factor-trinomial',
  skillId: 'S4.06',
  description: 'Factor trinomials x^2 + bx + c, sometimes after factoring out a GCF.',
  generate(rng, difficulty) {
    let p1: number;
    let q1: number;
    for (;;) {
      p1 = difficulty === 1 ? rng.int(1, 9) : nz(rng, -9, 9);
      q1 = difficulty === 1 ? rng.int(1, 9) : nz(rng, -9, 9);
      if (p1 + q1 === 0) continue;
      if (difficulty >= 2 && p1 > 0 && q1 > 0) continue;
      break;
    }
    const k = difficulty === 3 ? rng.int(2, 4) : 1;
    const b = p1 + q1;
    const c = p1 * q1;
    const full = X([k * c, k * b, k]);
    const lo = Math.min(p1, q1);
    const hi = Math.max(p1, q1);
    const factors = lo === hi ? `(${linPlain(1, lo)})^2` : `(${linPlain(1, lo)})(${linPlain(1, hi)})`;
    const answer = k === 1 ? factors : `${k}${factors}`;
    const factorsTex = `\\left(${linTex(1, lo)}\\right)\\left(${linTex(1, hi)}\\right)`;
    const tex = pTex(full);
    const swapped = X([c, -b, 1]).scale(toPoly(parseExpression(String(k))).constantValue());
    const steps: ProblemStep[] = [];
    if (k > 1)
      steps.push({
        prompt: [p(`What is the greatest common factor of the coefficients in $${tex}$?`)],
        answer: { kind: 'number', value: String(k) },
        hints: ['Look at all three coefficients.', 'Find the largest number that divides each one.', `Try dividing each coefficient by ${k}.`, 'The GCF must divide every term.'],
        explanation: `$${tex} = ${k}\\left(${pTex(X([c, b, 1]))}\\right)$.`,
      });
    steps.push(pairStep(c, b, rng, [p1, q1], k > 1 ? '(the constant term inside)' : '(the constant term)'));
    steps.push({
      prompt: [p(`Now write $${tex}$ in completely factored form.`)],
      answer: { kind: 'expression', value: answer, form: 'factored' },
      inputHint: FACTORED_HINT,
      hints: ['Use the two numbers as the constants in the binomials.', 'Each binomial starts with $x$.', k > 1 ? `Keep the GCF $${k}$ in front.` : 'Check by multiplying back out.', 'The order of the binomials does not matter.'],
      explanation: `$${tex} = ${k > 1 ? k : ''}${factorsTex}$.`,
    });
    return makeProblem({
      skillId: 'S4.06',
      tags: k > 1 ? ['multi-step'] : [],
      prompt: [p('Factor completely.'), { t: 'math', tex }],
      answer: { kind: 'expression', value: answer, form: 'factored' },
      inputHint: FACTORED_HINT,
      hints: [
        k > 1 ? 'First factor out the greatest common factor.' : 'Look for two binomials $(x + m)(x + n)$ that multiply to this trinomial.',
        `You need two numbers that **multiply** to the constant term${k > 1 ? ' inside the parentheses' : ''} and **add** to the coefficient of $x$.`,
        'Use the signs: a negative product means one number is negative; a positive product with a negative sum means both are negative.',
        'Check your answer by multiplying the binomials back out.',
      ],
      solution: [
        ...(k > 1 ? [{ text: 'Factor out the GCF.', tex: `${tex} = ${k}\\left(${pTex(X([c, b, 1]))}\\right)`, why: `$${k}$ divides every coefficient.` }] : []),
        { text: `Find two numbers with product $${c}$ and sum $${b}$.`, tex: `${lo} \\cdot ${hi < 0 ? `(${hi})` : hi} = ${c}, \\quad ${lo} + ${hi < 0 ? `(${hi})` : hi} = ${b}`, why: '$(x + m)(x + n) = x^{2} + (m + n)x + mn$, so $m$ and $n$ must have this product and sum.' },
        { text: 'Write the factors.', tex: `${tex} = ${k > 1 ? k : ''}${factorsTex}` },
      ],
      misconceptions: polyMisconceptions(full, [{ poly: swapped, answer: k === 1 ? `(${linPlain(1, -lo)})(${linPlain(1, -hi)})` : `${k}(${linPlain(1, -lo)})(${linPlain(1, -hi)})`, tag: 'sign-error', feedback: 'Check the signs: multiply your binomials back out and compare the middle term.' }]),
      steps,
    });
  },
  verify: (pr) => verifySameAndForm(pr),
};

// ---------------------------------------------------------------------------
// S4.07: factor ax^2 + bx + c
// ---------------------------------------------------------------------------

export const genFactorAx2: GeneratorDef = {
  id: 'u4.factor-ax2',
  skillId: 'S4.07',
  description: 'Factor trinomials with leading coefficient other than 1 using the a·c method.',
  generate(rng, difficulty) {
    let a1: number, a2: number, p1: number, q1: number;
    for (;;) {
      a1 = difficulty === 1 ? 1 : rng.int(1, 3);
      a2 = difficulty === 1 ? rng.pick([2, 3]) : rng.pick([2, 3, 5]);
      p1 = difficulty === 1 ? rng.int(1, 5) : nz(rng, -7, 7);
      q1 = difficulty === 1 ? rng.int(1, 5) : nz(rng, -7, 7);
      if (gcd(a1, p1) !== 1 || gcd(a2, q1) !== 1) continue;
      if (a1 * q1 + a2 * p1 === 0) continue;
      if (difficulty >= 2 && p1 > 0 && q1 > 0) continue;
      break;
    }
    const k = difficulty === 3 ? rng.int(2, 3) : 1;
    const A = a1 * a2;
    const B = a1 * q1 + a2 * p1;
    const C = p1 * q1;
    const full = X([k * C, k * B, k * A]);
    const factorsPlain = `(${linPlain(a1, p1)})(${linPlain(a2, q1)})`;
    const factorsTex = `\\left(${linTex(a1, p1)}\\right)\\left(${linTex(a2, q1)}\\right)`;
    const answer = k === 1 ? factorsPlain : `${k}${factorsPlain}`;
    const tex = pTex(full);
    const m = a1 * q1;
    const n = a2 * p1;
    const swapPoly = lin(a1, q1).mul(lin(a2, p1)).scale(toPoly(parseExpression(String(k))).constantValue());
    const inner = X([C, B, A]);
    const steps: ProblemStep[] = [
      ...(k > 1
        ? [
            {
              prompt: [p(`What is the greatest common factor of the coefficients in $${tex}$?`)],
              answer: { kind: 'number' as const, value: String(k) },
              hints: ['Look at all three coefficients.', 'Find the largest number that divides each one.', `Try dividing each coefficient by ${k}.`, 'The GCF must divide every term.'] as [string, string, string, string],
              explanation: `$${tex} = ${k}\\left(${pTex(inner)}\\right)$.`,
            },
          ]
        : []),
      {
        prompt: [p(`For $${pTex(inner)}$, what is $a \\cdot c$?`)],
        answer: { kind: 'number', value: String(A * C) },
        hints: [`$a = ${A}$ is the coefficient of $x^{2}$.`, `$c = ${C}$ is the constant term.`, 'Multiply them, keeping the sign.', 'A negative times a positive is negative.'],
        explanation: `$a \\cdot c = ${A} \\cdot ${C < 0 ? `(${C})` : C} = ${A * C}$.`,
      },
      pairStep(A * C, B, rng, [m, n], '($a \\cdot c$)'),
      {
        prompt: [p(`Split the middle term using those numbers, group, and factor. Write $${tex}$ in completely factored form.`)],
        answer: { kind: 'expression', value: answer, form: 'factored' },
        inputHint: FACTORED_HINT,
        hints: [`Rewrite the middle term: $${pTex(X([0, B]))} = ${pTex(X([0, m]))} ${n < 0 ? '-' : '+'} ${pTex(X([0, Math.abs(n)]))}$.`, 'Group the first two terms and the last two terms.', 'Factor the GCF out of each group. The same binomial should appear twice.', 'Factor out that common binomial.'],
        explanation: `$${tex} = ${k > 1 ? k : ''}${factorsTex}$.`,
      },
    ];
    return makeProblem({
      skillId: 'S4.07',
      tags: ['multi-step'],
      prompt: [p('Factor completely.'), { t: 'math', tex }],
      answer: { kind: 'expression', value: answer, form: 'factored' },
      inputHint: FACTORED_HINT,
      hints: [
        k > 1 ? 'First factor out the greatest common factor.' : 'Find $a \\cdot c$, the leading coefficient times the constant.',
        k > 1 ? 'For the trinomial inside the parentheses, find two numbers that multiply to $a \\cdot c$ and add to $b$.' : 'Find two numbers that multiply to $a \\cdot c$ and add to $b$.',
        'Use those two numbers to split the middle term into two terms, then factor by grouping.',
        'Check by multiplying your binomials back out.',
      ],
      solution: [
        ...(k > 1 ? [{ text: 'Factor out the GCF.', tex: `${tex} = ${k}\\left(${pTex(inner)}\\right)`, why: `$${k}$ divides every coefficient.` }] : []),
        { text: `${k > 1 ? `For the trinomial inside, $${pTex(inner)}$, find` : 'Find'} two numbers with product $a \\cdot c = ${A * C}$ and sum $b = ${B}$.`, tex: `${m} \\text{ and } ${n}`, why: `$${m} \\cdot ${n < 0 ? `(${n})` : n} = ${A * C}$ and $${m} + ${n < 0 ? `(${n})` : n} = ${B}$.` },
        { text: 'Split the middle term and factor by grouping.', tex: `${termsTex([{ deg: 2, coef: A }, { deg: 1, coef: m }, { deg: 1, coef: n }, { deg: 0, coef: C }])} = ${a1 === 1 ? '' : a1}x\\left(${linTex(a2, q1)}\\right) ${p1 < 0 ? '-' : '+'} ${Math.abs(p1)}\\left(${linTex(a2, q1)}\\right)`, why: 'Grouping two terms at a time reveals a common binomial factor.' },
        { text: 'Write the factors.', tex: `${tex} = ${k > 1 ? k : ''}${factorsTex}` },
      ],
      misconceptions: polyMisconceptions(full, [{ poly: swapPoly, answer: k === 1 ? `(${linPlain(a1, q1)})(${linPlain(a2, p1)})` : `${k}(${linPlain(a1, q1)})(${linPlain(a2, p1)})`, tag: 'factoring', feedback: 'Multiply your binomials back out: the middle term does not match. Try the constants the other way around.' }]),
      steps,
    });
  },
  verify: (pr) => verifySameAndForm(pr),
};

// ---------------------------------------------------------------------------
// S4.08: special patterns
// ---------------------------------------------------------------------------

const PATTERNS = { dos: 'A difference of two squares', pst: 'A perfect square trinomial' } as const;

export const genFactorSpecial: GeneratorDef = {
  id: 'u4.factor-special',
  skillId: 'S4.08',
  description: 'Factor differences of squares and perfect square trinomials.',
  generate(rng, difficulty) {
    const kind = rng.pick(['dos', 'pst'] as const);
    const a = difficulty === 1 ? 1 : difficulty === 2 ? rng.int(2, 5) : rng.int(1, 3);
    let b = rng.int(1, 9);
    while (gcd(a, b) !== 1) b = rng.int(1, 9);
    const sign = kind === 'pst' && rng.bool() ? -1 : 1;
    const k = difficulty === 3 ? rng.int(2, 5) : 1;
    const kQ = toPoly(parseExpression(String(k))).constantValue();
    let inner: Poly;
    let ans: string;
    let ansTex: string;
    let wrong: { poly: Poly; answer: string; feedback: string };
    if (kind === 'dos') {
      inner = lin(a, -b).mul(lin(a, b));
      ans = `(${linPlain(a, -b)})(${linPlain(a, b)})`;
      ansTex = `\\left(${linTex(a, -b)}\\right)\\left(${linTex(a, b)}\\right)`;
      const sq = lin(a, -b).mul(lin(a, -b));
      wrong = { poly: sq.scale(kQ), answer: `${k === 1 ? '' : k}(${linPlain(a, -b)})^2`, feedback: 'Multiply that back out: a square gives a middle term. A difference of squares factors as $(a - b)(a + b)$.' };
    } else {
      inner = lin(a, sign * b).mul(lin(a, sign * b));
      ans = `(${linPlain(a, sign * b)})^2`;
      ansTex = `\\left(${linTex(a, sign * b)}\\right)^{2}`;
      const dos = lin(a, b).mul(lin(a, -b));
      wrong = { poly: dos.scale(kQ), answer: `${k === 1 ? '' : k}(${linPlain(a, b)})(${linPlain(a, -b)})`, feedback: 'Multiply that back out: the middle terms cancel, so it cannot make this trinomial. A perfect square trinomial factors as $(a + b)^{2}$ or $(a - b)^{2}$.' };
    }
    const full = inner.scale(kQ);
    const answer = k === 1 ? ans : `${k}${ans}`;
    const tex = pTex(full);
    const aTerm = a === 1 ? 'x' : `${a}x`;
    return makeProblem({
      skillId: 'S4.08',
      tags: [],
      prompt: [p('Factor completely.'), { t: 'math', tex }],
      answer: { kind: 'expression', value: answer, form: 'factored' },
      inputHint: FACTORED_HINT,
      hints: [
        k > 1 ? 'First factor out the greatest common factor.' : 'Check whether the first and last terms are perfect squares.',
        kind === 'dos' ? 'Two terms with a minus sign between perfect squares: $a^{2} - b^{2} = (a - b)(a + b)$.' : 'Three terms where the first and last are perfect squares: try $(a \\pm b)^{2} = a^{2} \\pm 2ab + b^{2}$.',
        kind === 'dos' ? `${k > 1 ? 'After taking out the GCF, write' : 'Write'} each term as a square: $${a * a === 1 ? '' : a * a}x^{2} = (${aTerm})^{2}$.` : `Check the middle term: is it $2 \\cdot ${aTerm} \\cdot ${b}$?`,
        'Check by multiplying back out.',
      ],
      solution: [
        ...(k > 1 ? [{ text: 'Factor out the GCF.', tex: `${tex} = ${k}\\left(${pTex(inner)}\\right)`, why: `$${k}$ divides every coefficient.` }] : []),
        kind === 'dos'
          ? { text: 'Recognize a difference of two squares.', tex: `${pTex(inner)} = ${a === 1 ? 'x' : `(${aTerm})`}^{2} - ${b}^{2}`, why: 'Both terms are perfect squares and they are subtracted.' }
          : { text: 'Recognize a perfect square trinomial.', tex: `${pTex(inner)} = ${a === 1 ? 'x' : `(${aTerm})`}^{2} ${sign < 0 ? '-' : '+'} 2(${aTerm})(${b}) + ${b}^{2}`, why: `The first and last terms are perfect squares, and the middle term is ${sign < 0 ? 'minus ' : ''}twice the product of their square roots.` },
        { text: 'Write the factors.', tex: `${tex} = ${k > 1 ? k : ''}${ansTex}` },
      ],
      misconceptions: polyMisconceptions(full, [{ ...wrong, tag: 'factoring' }]),
      steps: [
        ...(k > 1
          ? [
              {
                prompt: [p(`What is the greatest common factor of the coefficients in $${tex}$?`)],
                answer: { kind: 'number' as const, value: String(k) },
                hints: ['Look at every coefficient.', 'Find the largest number that divides each one.', `Try dividing each coefficient by ${k}.`, 'The GCF must divide every term.'] as [string, string, string, string],
                explanation: `$${tex} = ${k}\\left(${pTex(inner)}\\right)$.`,
              },
            ]
          : []),
        {
          prompt: [p(`Which pattern does $${pTex(inner)}$ fit?`)],
          answer: makeChoice(rng, PATTERNS[kind], Object.values(PATTERNS).filter((l) => l !== PATTERNS[kind])),
          hints: ['Count the terms.', 'Two perfect squares subtracted: difference of squares.', 'Three terms with perfect squares first and last: check the middle term.', 'A perfect square trinomial has a middle term equal to twice the product of the square roots.'],
          explanation: kind === 'dos' ? 'Two perfect squares with a minus sign between them.' : 'The first and last terms are perfect squares and the middle term is twice the product of their square roots.',
        },
        {
          prompt: [p(`Now factor $${tex}$ completely.`)],
          answer: { kind: 'expression', value: answer, form: 'factored' },
          inputHint: FACTORED_HINT,
          hints: [kind === 'dos' ? '$a^{2} - b^{2} = (a - b)(a + b)$.' : '$a^{2} \\pm 2ab + b^{2} = (a \\pm b)^{2}$.', `Here $a = ${aTerm}$ and $b = ${b}$.`, k > 1 ? `Keep the GCF $${k}$ in front.` : 'Check the sign in each factor.', 'Check by multiplying back out.'],
          explanation: `$${tex} = ${k > 1 ? k : ''}${ansTex}$.`,
        },
      ],
    });
  },
  verify: (pr) => verifySameAndForm(pr),
};

export const U4_POLY_GENERATORS: GeneratorDef[] = [genInterpretParts, genAddSubPoly, genMultiplyPoly, genSpecialProducts, genFactorGcf, genFactorTrinomial, genFactorAx2, genFactorSpecial];
