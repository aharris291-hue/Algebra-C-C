import type { LessonContent } from '../../../core/curriculum/types';

/**
 * U5L04 Solving Exponential Equations (A.PAR.8.2)
 * Solve exponential equations by rewriting both sides as powers of a common base and setting the exponents equal:
 * why b^m = b^n gives m = n when b > 0 and b != 1; rewriting 4, 8, 16, 27, 1/9 and 1 as powers; distributing an
 * outside exponent, (2^2)^(x+1) = 2^(2x+2); dividing first when the power has a coefficient (3 * 2^x = 48); fraction
 * bases, (1/2)^x = 2^(-x); and checking by substitution (S5.04).
 *
 * Math verified by hand (2026-10-07): every power in the tables was recomputed, every equation below was re-solved
 * and its solution substituted back into the ORIGINAL equation (both sides computed separately, e.g. 4^6 = 4096 =
 * 8^4, (1/2)^(-4) = 16, 800(1/2)^5 = 25, 27^2 = 729 = (1/9)^(-3)), each common-mistake answer was shown to fail its
 * check, and the graph intersection (3, 8) was checked to lie on y = 2^x.
 */
export const U5L04: LessonContent = {
  lessonId: 'U5L04',
  goal: 'Solve exponential equations such as $4^{x+1} = 8^{x-1}$ by rewriting both sides as powers of the same base, setting the exponents equal, and checking the answer by substitution.',
  needToKnow: [
    { t: 'p', text: 'You will use three exponent rules from earlier in this unit:' },
    {
      t: 'list',
      items: [
        '**Power of a power:** $(b^m)^n = b^{mn}$. For example, $(2^3)^2 = 2^6$.',
        '**Negative exponents:** $b^{-n} = \\frac{1}{b^n}$. For example, $3^{-2} = \\frac{1}{9}$.',
        '**Zero exponent:** $b^0 = 1$ for any $b \\ne 0$.',
      ],
    },
    { t: 'callout', variant: 'tip', title: 'Quick check', text: 'Write $\\frac{1}{8}$ as a power of $2$. (You should get $2^{-3}$, because $2^3 = 8$ and the negative exponent makes the reciprocal.) If that felt shaky, open **Teach Me Again** and choose the refresher.' },
  ],
  vocabulary: [
    { term: 'exponential equation', meaning: 'An equation with the variable in an exponent, such as $2^x = 32$.' },
    { term: 'base', meaning: 'The number being raised to a power. In $5^{2x}$ the base is $5$.' },
    { term: 'common base', meaning: 'One base that both sides of an equation can be written with, such as $2$ for $4^x = 8$, because $4 = 2^2$ and $8 = 2^3$.' },
    { term: 'equal powers, equal exponents', meaning: 'If $b > 0$, $b \\ne 1$ and $b^m = b^n$, then $m = n$.' },
    { term: 'check by substitution', meaning: 'Put your answer back into the original equation and compute both sides to see that they are equal.' },
  ],
  instruction: [
    { t: 'p', text: '### The variable is in the exponent' },
    { t: 'p', text: 'In $2^x = 32$ you are asking, "$2$ to what power is $32$?" Count: $2, 4, 8, 16, 32$. That is $2^5$, so' },
    { t: 'math', tex: '2^x = 2^5 \\;\\Longrightarrow\\; x = 5' },
    { t: 'p', text: '### Why equal powers mean equal exponents' },
    { t: 'p', text: 'The powers of $2$ keep growing: each one is double the one before, so no two different exponents give the same output. If $2^x = 2^5$, the only possibility is $x = 5$. You can see it on a graph: the horizontal line $y = 8$ crosses $y = 2^x$ exactly once, at $x = 3$.' },
    {
      t: 'graph',
      caption: 'The graph of y = 2^x crosses the line y = 8 only once, at (3, 8). So 2^x = 8 has exactly one solution, x = 3.',
      spec: {
        xMin: -2,
        xMax: 5,
        yMin: -1,
        yMax: 18,
        yStep: 2,
        functions: [
          { expr: '2^x', label: 'y = 2^x' },
          { expr: '8', label: 'y = 8', dashed: true },
        ],
        points: [{ x: 3, y: 8, label: '(3, 8)' }],
        ariaLabel: 'The increasing curve y = 2 to the x and the horizontal dashed line y = 8. They meet at exactly one point, (3, 8).',
      },
    },
    { t: 'callout', variant: 'why', title: 'Why the base must be positive and not 1', text: 'With base $1$, every power is $1$: $1^3 = 1^7$, but $3 \\ne 7$. With base $-1$, $(-1)^2 = (-1)^4 = 1$, but $2 \\ne 4$. For a positive base other than $1$, the powers always go up (base $> 1$) or always go down (base between $0$ and $1$), so each output comes from exactly one exponent.' },
    { t: 'p', text: '### Know your powers' },
    { t: 'p', text: 'To find a common base, you need to recognize numbers as powers.' },
    {
      t: 'table',
      caption: 'Powers to recognize. Negative exponents give the reciprocals.',
      headers: ['Base', 'Exponent 1', 'Exponent 2', 'Exponent 3', 'Exponent 4', 'Exponent 5', 'Exponent $-1$', 'Exponent $-2$'],
      rows: [
        ['$2$', '$2$', '$4$', '$8$', '$16$', '$32$', '$\\frac{1}{2}$', '$\\frac{1}{4}$'],
        ['$3$', '$3$', '$9$', '$27$', '$81$', '$243$', '$\\frac{1}{3}$', '$\\frac{1}{9}$'],
        ['$5$', '$5$', '$25$', '$125$', '$625$', '$3125$', '$\\frac{1}{5}$', '$\\frac{1}{25}$'],
      ],
    },
    { t: 'p', text: 'Also remember $1 = b^0$ for any base. So $4 = 2^2$, $8 = 2^3$, $16 = 2^4$, $27 = 3^3$, $\\frac{1}{9} = 3^{-2}$, and $1 = 3^0$.' },
    { t: 'p', text: '### Rewrite, multiply the whole exponent, then set exponents equal' },
    { t: 'p', text: 'Solve $4^x = 8$. $8$ is not a whole-number power of $4$, but $4$ and $8$ are both powers of $2$:' },
    { t: 'math', tex: '4^x = 8 \\;\\Longrightarrow\\; (2^2)^x = 2^3 \\;\\Longrightarrow\\; 2^{2x} = 2^3 \\;\\Longrightarrow\\; 2x = 3 \\;\\Longrightarrow\\; x = \\tfrac{3}{2}' },
    { t: 'p', text: '**Check:** $4^{3/2} = (2^2)^{3/2} = 2^3 = 8$. It works.' },
    { t: 'p', text: 'When the exponent is an expression, the outside exponent multiplies **all** of it. Use parentheses:' },
    { t: 'math', tex: '4^{x+1} = (2^2)^{x+1} = 2^{2(x+1)} = 2^{2x+2}' },
    { t: 'p', text: '### Divide first when there is a coefficient' },
    { t: 'p', text: 'In $3 \\cdot 2^x = 48$, the $3$ is not part of the power. Get the power alone first:' },
    { t: 'math', tex: '3 \\cdot 2^x = 48 \\;\\Longrightarrow\\; 2^x = 16 \\;\\Longrightarrow\\; 2^x = 2^4 \\;\\Longrightarrow\\; x = 4' },
    { t: 'p', text: '**Check:** $3 \\cdot 2^4 = 3 \\cdot 16 = 48$. It works. (Do not multiply $3 \\cdot 2 = 6$ first: $6^x$ is a different expression from $3 \\cdot 2^x$.)' },
    {
      t: 'list',
      ordered: true,
      items: [
        '**Isolate the power** (divide away any coefficient).',
        '**Write each side as a power of the same base.**',
        '**Multiply exponents** with the power-of-a-power rule, using parentheses.',
        '**Set the exponents equal** and solve the equation you get.',
        '**Check** by substituting into the original equation.',
      ],
    },
    { t: 'callout', variant: 'warning', title: 'The exponent is not a multiplier', text: 'For $4^x = 8$ it is tempting to say $x = 2$ "because $4 \\cdot 2 = 8$." But $4^2 = 16$, not $8$. The exponent tells you how many times to multiply $4$ by itself, so check: $4^2 = 4 \\cdot 4 = 16 \\ne 8$.' },
    { t: 'callout', variant: 'warning', title: 'Fraction bases are negative exponents', text: '$\\left(\\frac{1}{2}\\right)^x = (2^{-1})^x = 2^{-x}$. So $\\left(\\frac{1}{2}\\right)^x = 16$ becomes $2^{-x} = 2^4$, giving $-x = 4$ and $x = -4$, not $4$.' },
    { t: 'callout', variant: 'tip', title: 'When there is no common base', text: 'Some equations, like $2^x = 10$, cannot be rewritten with a common base, because $10$ is not a whole-number power of $2$. The answer is between $3$ and $4$ (since $2^3 = 8$ and $2^4 = 16$). You can estimate it with a graph or a table; later math courses use logarithms to find it exactly.' },
    { t: 'callout', variant: 'realworld', title: 'Where this shows up', text: 'How many hours until a doubling bacteria culture reaches a target, how many half-lives until a medicine drops to a safe level, or how many rounds of a single-elimination tournament are needed for $64$ teams ($2^x = 64$, so $6$ rounds) are all exponential equations.' },
  ],
  examples: [
    {
      title: 'Same base right away',
      kind: 'introductory',
      problem: [{ t: 'p', text: 'Solve $3^{x+1} = 81$.' }],
      steps: [
        { text: 'Write $81$ as a power of $3$.', tex: '3^{x+1} = 3^4', why: '$3 \\cdot 3 \\cdot 3 \\cdot 3 = 81$, so $81 = 3^4$. Now both sides have base $3$.' },
        { text: 'Set the exponents equal.', tex: 'x + 1 = 4', why: 'The base $3$ is positive and not $1$, so equal powers must have equal exponents.' },
        { text: 'Solve.', tex: 'x = 3', why: 'Subtract $1$ from both sides.' },
        { text: 'Check.', tex: '3^{3+1} = 3^4 = 81', why: 'Substitute into the original equation; both sides are $81$.' },
      ],
      answer: '$x = 3$',
    },
    {
      title: 'Rewrite one side',
      kind: 'intermediate',
      problem: [{ t: 'p', text: 'Solve $9^x = 27$.' }],
      steps: [
        { text: 'Find a common base.', tex: '9 = 3^2, \\quad 27 = 3^3', why: '$27$ is not a whole-number power of $9$, but both $9$ and $27$ are powers of $3$.' },
        { text: 'Rewrite both sides.', tex: '(3^2)^x = 3^3 \\;\\Longrightarrow\\; 3^{2x} = 3^3', why: 'Power of a power: multiply the exponents, $2 \\cdot x = 2x$.' },
        { text: 'Set the exponents equal and solve.', tex: '2x = 3 \\;\\Longrightarrow\\; x = \\tfrac{3}{2}', why: 'Same base on both sides, so the exponents match.' },
        { text: 'Check.', tex: '9^{3/2} = (3^2)^{3/2} = 3^3 = 27', why: 'Rewriting $9$ as $3^2$ again and multiplying exponents gives $27$, the right side.' },
      ],
      answer: '$x = \\frac{3}{2}$',
    },
    {
      title: 'Variables on both sides',
      kind: 'intermediate',
      problem: [{ t: 'p', text: 'Solve $4^{x+1} = 8^{x-1}$.' }],
      steps: [
        { text: 'Write both bases as powers of $2$.', tex: '(2^2)^{x+1} = (2^3)^{x-1}', why: '$4 = 2^2$ and $8 = 2^3$, so $2$ is a common base.' },
        { text: 'Multiply each outside exponent by the **whole** inside exponent.', tex: '2^{2(x+1)} = 2^{3(x-1)} \\;\\Longrightarrow\\; 2^{2x+2} = 2^{3x-3}', why: 'Power of a power: $(b^m)^n = b^{mn}$. Distribute to every term of $x + 1$ and $x - 1$.' },
        { text: 'Set the exponents equal and solve.', tex: '2x + 2 = 3x - 3 \\;\\Longrightarrow\\; 5 = x', why: 'Subtract $2x$ from both sides, then add $3$.' },
        { text: 'Check.', tex: '4^{5+1} = 4^6 = 4096, \\quad 8^{5-1} = 8^4 = 4096', why: 'Compute each side of the original equation separately. They match.' },
      ],
      answer: '$x = 5$',
    },
    {
      title: 'A common mistake: not multiplying the whole exponent',
      kind: 'common-mistake',
      problem: [
        { t: 'p', text: 'A student solved $4^{x+1} = 32$ like this:' },
        { t: 'math', tex: '2^{2x+1} = 2^5 \\;\\Longrightarrow\\; 2x + 1 = 5 \\;\\Longrightarrow\\; x = 2' },
        { t: 'p', text: 'Find the error and fix it.' },
      ],
      steps: [
        { text: 'Check the student\'s answer.', tex: '4^{2+1} = 4^3 = 64 \\ne 32', why: 'Substituting into the original equation shows $x = 2$ is wrong.' },
        { text: 'Find the error.', tex: '(2^2)^{x+1} = 2^{2(x+1)} = 2^{2x+2}, \\text{ not } 2^{2x+1}', why: 'The $2$ must multiply the **whole** exponent $x + 1$. The student multiplied only the $x$.' },
        { text: 'Solve correctly.', tex: '2^{2x+2} = 2^5 \\;\\Longrightarrow\\; 2x + 2 = 5 \\;\\Longrightarrow\\; x = \\tfrac{3}{2}', why: '$32 = 2^5$. Subtract $2$, then divide by $2$.' },
        { text: 'Check.', tex: '4^{3/2 + 1} = 4^{5/2} = (2^2)^{5/2} = 2^5 = 32', why: 'Now both sides are $32$.' },
      ],
      answer: '$x = \\frac{3}{2}$. Put parentheses around the exponent before you multiply.',
    },
    {
      title: 'A common mistake: a fraction base',
      kind: 'common-mistake',
      problem: [{ t: 'p', text: 'A student says $\\left(\\frac{1}{2}\\right)^x = 16$ has the solution $x = 4$, "because $2^4 = 16$." Is that right?' }],
      steps: [
        { text: 'Check the student\'s answer.', tex: '\\left(\\tfrac{1}{2}\\right)^4 = \\tfrac{1}{16} \\ne 16', why: 'Raising a number less than $1$ to a positive power makes it smaller, not bigger.' },
        { text: 'Rewrite the fraction base as a power of $2$.', tex: '\\left(\\tfrac{1}{2}\\right)^x = (2^{-1})^x = 2^{-x}', why: '$\\frac{1}{2} = 2^{-1}$ by the negative exponent rule, and power of a power gives $-1 \\cdot x = -x$.' },
        { text: 'Set the exponents equal.', tex: '2^{-x} = 2^4 \\;\\Longrightarrow\\; -x = 4 \\;\\Longrightarrow\\; x = -4', why: '$16 = 2^4$, so the exponents must match.' },
        { text: 'Check.', tex: '\\left(\\tfrac{1}{2}\\right)^{-4} = 2^4 = 16', why: 'A negative exponent flips the fraction: $\\left(\\frac{1}{2}\\right)^{-4} = \\left(\\frac{2}{1}\\right)^4 = 16$.' },
      ],
      answer: 'No. The solution is $x = -4$.',
    },
    {
      title: 'How long until the medicine is low?',
      kind: 'real-world',
      problem: [{ t: 'p', text: 'Priya\'s doctor explains that an $800$-milligram dose of a medicine is cut in half every hour, so $M = 800\\left(\\frac{1}{2}\\right)^t$ milligrams remain after $t$ hours. After how many hours are $25$ milligrams left?' }],
      steps: [
        { text: 'Set up the equation.', tex: '800\\left(\\tfrac{1}{2}\\right)^t = 25', why: 'We want the time $t$ when the amount $M$ equals $25$.' },
        { text: 'Divide first to isolate the power.', tex: '\\left(\\tfrac{1}{2}\\right)^t = \\tfrac{25}{800} = \\tfrac{1}{32}', why: 'The $800$ multiplies the power, so divide both sides by $800$ before rewriting.' },
        { text: 'Rewrite with base $2$.', tex: '2^{-t} = 2^{-5}', why: '$\\frac{1}{2} = 2^{-1}$, so $\\left(\\frac{1}{2}\\right)^t = 2^{-t}$; and $\\frac{1}{32} = \\frac{1}{2^5} = 2^{-5}$.' },
        { text: 'Set the exponents equal.', tex: '-t = -5 \\;\\Longrightarrow\\; t = 5', why: 'Same base, so the exponents match.' },
        { text: 'Check and interpret.', tex: '800\\left(\\tfrac{1}{2}\\right)^5 = \\tfrac{800}{32} = 25', why: 'Halving five times: $800 \\to 400 \\to 200 \\to 100 \\to 50 \\to 25$.' },
      ],
      answer: 'After $5$ hours, $25$ milligrams are left.',
    },
    {
      title: 'Both sides rewritten, with a fraction',
      kind: 'challenging',
      problem: [{ t: 'p', text: 'Solve $27^x = \\left(\\frac{1}{9}\\right)^{x-5}$.' }],
      steps: [
        { text: 'Write both bases as powers of $3$.', tex: '27 = 3^3, \\quad \\tfrac{1}{9} = 3^{-2}', why: '$3^3 = 27$ and $\\frac{1}{9} = \\frac{1}{3^2} = 3^{-2}$.' },
        { text: 'Rewrite and multiply exponents.', tex: '3^{3x} = 3^{-2(x-5)} = 3^{-2x+10}', why: 'Distribute $-2$ to both terms: $-2 \\cdot x = -2x$ and $-2 \\cdot (-5) = +10$.' },
        { text: 'Set the exponents equal and solve.', tex: '3x = -2x + 10 \\;\\Longrightarrow\\; 5x = 10 \\;\\Longrightarrow\\; x = 2', why: 'Add $2x$ to both sides, then divide by $5$.' },
        { text: 'Check.', tex: '27^2 = 729, \\quad \\left(\\tfrac{1}{9}\\right)^{2-5} = \\left(\\tfrac{1}{9}\\right)^{-3} = 9^3 = 729', why: 'Both sides of the original equation equal $729$.' },
      ],
      answer: '$x = 2$',
    },
  ],
  teachMeAgain: [
    {
      approach: 'visual',
      title: 'Where does the curve hit the line?',
      blocks: [
        { t: 'p', text: 'Solving $3^x = 9$ means finding where the graph of $y = 3^x$ reaches the height $9$.' },
        {
          t: 'graph',
          caption: 'y = 3^x meets y = 9 at (2, 9), and meets y = 1/3 at (-1, 1/3).',
          spec: {
            xMin: -3,
            xMax: 3,
            yMin: -1,
            yMax: 12,
            functions: [
              { expr: '3^x', label: 'y = 3^x' },
              { expr: '9', label: 'y = 9', dashed: true },
            ],
            points: [
              { x: 2, y: 9, label: '(2, 9)' },
              { x: -1, y: 1 / 3, label: '(-1, 1/3)' },
            ],
            ariaLabel: 'The increasing curve y = 3 to the x and the dashed horizontal line y = 9, which meet at (2, 9). The point (-1, 1/3) is also marked on the curve.',
          },
        },
        { t: 'p', text: 'The curve meets the line once, at $x = 2$, so $3^x = 9$ has the one solution $x = 2$. The marked point $(-1, \\frac{1}{3})$ shows that a fraction like $\\frac{1}{3}$ comes from a negative exponent: $3^{-1} = \\frac{1}{3}$.' },
      ],
    },
    {
      approach: 'simpler-example',
      title: 'Count up the powers',
      blocks: [
        { t: 'p', text: 'Solve $2^x = 8$ by listing powers of $2$: $2^1 = 2$, $2^2 = 4$, $2^3 = 8$. So $x = 3$.' },
        { t: 'p', text: 'Now solve $2^{x-1} = 8$. The exponent $x - 1$ must be $3$, so $x - 1 = 3$ and $x = 4$. Check: $2^{4-1} = 2^3 = 8$.' },
        { t: 'p', text: 'Every problem in this lesson works like this. The extra steps (rewriting $4$ as $2^2$, dividing first) just get it into the form "same base $=$ same base."' },
      ],
    },
    {
      approach: 'analogy',
      title: 'Speak the same language',
      blocks: [
        { t: 'p', text: 'Is $3$ feet the same as $36$ inches? You cannot compare until both are in the same unit: $3$ feet $= 36$ inches, so yes.' },
        { t: 'p', text: 'Exponential equations are the same. In $4^x = 8$ the two sides are in different "units": base $4$ and base $8$. Translate both into base $2$: $2^{2x} = 2^3$. Once the bases match, you can compare the exponents directly: $2x = 3$.' },
      ],
    },
    {
      approach: 'prerequisite',
      title: 'Refresher: power of a power and negative exponents',
      blocks: [
        { t: 'list', items: [
          '$(b^m)^n = b^{mn}$: $(2^3)^2 = 2^3 \\cdot 2^3 = 2^6$.',
          'With an expression, use parentheses and distribute: $(3^2)^{x-4} = 3^{2(x-4)} = 3^{2x-8}$.',
          '$b^{-n} = \\frac{1}{b^n}$: $5^{-2} = \\frac{1}{25}$, so $\\frac{1}{25} = 5^{-2}$.',
          'A fraction base flips to a negative exponent: $\\left(\\frac{1}{3}\\right)^x = (3^{-1})^x = 3^{-x}$.',
          '$b^0 = 1$, so an equation like $7^{x-2} = 1$ means $7^{x-2} = 7^0$, and $x = 2$.',
        ] },
      ],
    },
    {
      approach: 'step-by-step',
      title: 'The five-step method on one problem',
      blocks: [
        { t: 'p', text: 'Solve $5 \\cdot 3^{2x} = 405$.' },
        { t: 'list', ordered: true, items: [
          '**Isolate the power:** divide by $5$ to get $3^{2x} = 81$.',
          '**Common base:** $81 = 3^4$, so $3^{2x} = 3^4$.',
          '**Multiply exponents:** nothing to do here; the left side is already a single power of $3$.',
          '**Set exponents equal:** $2x = 4$, so $x = 2$.',
          '**Check:** $5 \\cdot 3^{2 \\cdot 2} = 5 \\cdot 3^4 = 5 \\cdot 81 = 405$. It works.',
        ] },
      ],
    },
    {
      approach: 'alternate-strategy',
      title: 'Any common base works',
      blocks: [
        { t: 'p', text: 'Solve $16^x = 64$. You might pick base $2$ or base $4$; both give the same answer.' },
        { t: 'list', items: [
          '**Base 2:** $16 = 2^4$ and $64 = 2^6$, so $2^{4x} = 2^6$, $4x = 6$, $x = \\frac{3}{2}$.',
          '**Base 4:** $16 = 4^2$ and $64 = 4^3$, so $4^{2x} = 4^3$, $2x = 3$, $x = \\frac{3}{2}$.',
        ] },
        { t: 'p', text: 'Check: $16^{3/2} = (4^2)^{3/2} = 4^3 = 64$. If you are unsure which base to use, try the smallest one, like $2$, $3$ or $5$: every power of $4$, $8$ or $16$ is also a power of $2$.' },
      ],
    },
  ],
  guided: [
    { generator: 'u5.solve-exponential', difficulty: 1 },
    { generator: 'u5.solve-exponential', difficulty: 1 },
    { generator: 'u5.solve-exponential', difficulty: 2 },
    { generator: 'u5.solve-exponential', difficulty: 2 },
  ],
  independent: {
    count: 8,
    reviewCount: 2,
    mix: [
      { generator: 'u5.solve-exponential', difficulty: 1, weight: 1 },
      { generator: 'u5.solve-exponential', difficulty: 2, weight: 2 },
      { generator: 'u5.solve-exponential', difficulty: 3, weight: 1 },
    ],
  },
  quiz: {
    items: [
      { generator: 'u5.solve-exponential', difficulty: 1 },
      { generator: 'u5.solve-exponential', difficulty: 2 },
      { generator: 'u5.solve-exponential', difficulty: 2 },
      { generator: 'u5.solve-exponential', difficulty: 2 },
      { generator: 'u5.solve-exponential', difficulty: 3 },
      { generator: 'u5.solve-exponential', difficulty: 3 },
    ],
  },
  summary: [
    'If $b > 0$, $b \\ne 1$ and $b^m = b^n$, then $m = n$: equal powers of the same base have equal exponents.',
    'Isolate the power first (divide away a coefficient), then write both sides as powers of a common base, like $4 = 2^2$, $27 = 3^3$, $\\frac{1}{9} = 3^{-2}$, $1 = b^0$.',
    'An outside exponent multiplies the whole inside exponent: $(2^2)^{x+1} = 2^{2x+2}$; a fraction base becomes a negative exponent: $\\left(\\frac{1}{2}\\right)^x = 2^{-x}$.',
    'Always check by substituting into the original equation and computing both sides.',
  ],
  mastery: { quizPassScore: 0.8, practiceMinCorrect: 5 },
};
