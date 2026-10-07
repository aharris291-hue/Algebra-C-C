import type { LessonContent } from '../../../core/curriculum/types';

/**
 * U6L01 Exponential Functions and Function Notation (A.FGR.9.1)
 * Writing exponential functions as f(x) = a(b)^x; evaluating them at whole-number, zero and negative inputs
 * (exponent first, then multiply by a; a negative exponent means a reciprocal, never a negative output);
 * fraction and decimal bases like 16(1/2)^x; reading statements in function notation such as P(3) = 2662 as
 * "input 3 hours, output 2662 bacteria"; telling "find f(4)" apart from "solve f(x) = 96"; and solving
 * f(x) = value with a common base (S6.01). Reviews writing y = a(b)^x (S5.03) and interpreting function
 * notation in context (S1.04).
 *
 * Math verified by hand (2026-10-07): every table value and graph point was recomputed by substitution
 * (3(2)^x at x = -2..3: 3/4, 3/2, 3, 6, 12, 24; 16(1/2)^x at x = -1..4: 32, 16, 8, 4, 2, 1;
 * 5(3)^x: f(2) = 45, f(0) = 5, f(-1) = 5/3; 48(1/2)^x: h(3) = 6, h(0) = 48, h(-2) = 192; 4(3)^x: f(2) = 36,
 * f(-1) = 4/3, and the wrong answers 12^2 = 144 and -12 were checked as the errors described;
 * 2000(1.1)^t: 1.1^3 = 1.331, P(3) = 2662, P(0) = 2000; 800(0.75)^t: V(1) = 600, V(2) = 450, V(3) = 337.5;
 * 500(2)^t: B(-1) = 250, B(4) = 8000; the solved equations 3(2)^x = 96 -> 2^x = 32 -> x = 5,
 * 500(2)^t = 8000 -> 2^t = 16 -> t = 4, each checked by substitution;
 * 2^-3 = 1/8, 5(2)^3 = 40, 200(1.5)^2 = 450, 10(3)^-2 = 10/9).
 */
export const U6L01: LessonContent = {
  lessonId: 'U6L01',
  goal: 'Evaluate an exponential function like $f(x) = 3(2)^x$ at any input, including $0$ and negative inputs such as $f(-2) = \\frac{3}{4}$, and explain what a statement in function notation, like $P(3) = 2662$, means in a real situation.',
  needToKnow: [
    { t: 'p', text: 'This lesson puts together three things you already know:' },
    {
      t: 'list',
      items: [
        '**Function notation (Unit 1).** $f(3)$ means "the output of $f$ when the input is $3$." It does **not** mean $f$ times $3$.',
        '**Zero and negative exponents (Unit 5).** $b^0 = 1$, and $b^{-n} = \\frac{1}{b^n}$. So $2^{-3} = \\frac{1}{8}$, a small positive number.',
        '**Exponential equations (Unit 5).** In $y = a(b)^x$, $a$ is the initial value and $b$ is the growth or decay factor. Exponents come before multiplying, so $5(2)^3 = 5 \\cdot 8 = 40$, not $10^3$.',
      ],
    },
    { t: 'callout', variant: 'tip', title: 'Quick check', text: 'What is $2^{-3}$? What is $5(2)^3$? (You should get $\\frac{1}{8}$ and $40$.) If those felt shaky, open **Teach Me Again** and choose the refresher.' },
  ],
  vocabulary: [
    { term: 'exponential function', meaning: 'A function $f(x) = a(b)^x$ with $a \\ne 0$, $b > 0$ and $b \\ne 1$. The input $x$ is in the **exponent**.' },
    { term: 'function notation', meaning: 'Writing $f(x)$ for the output of a function $f$ at the input $x$. Read $f(4)$ as "$f$ of $4$."' },
    { term: 'evaluate', meaning: 'Find the output for a given input: put the input in for $x$ and simplify.' },
    { term: 'input and output', meaning: 'The input is the value inside the parentheses (often a time). The output is the value of the function (often an amount, with units).' },
    { term: 'base', meaning: 'The number $b$ being raised to the power $x$. In $16\\left(\\frac{1}{2}\\right)^x$ the base is $\\frac{1}{2}$.' },
  ],
  instruction: [
    { t: 'p', text: '### Exponential functions in function notation' },
    { t: 'p', text: 'In Unit 5 you wrote equations like $y = 3(2)^x$. Writing the same rule in **function notation** gives it a name and makes the input easy to see:' },
    { t: 'math', tex: 'f(x) = 3(2)^x \\qquad f(\\text{input}) = \\text{output}' },
    { t: 'p', text: 'To **evaluate** $f(4)$, replace every $x$ with $4$. Then work the exponent **first**, and multiply by $a$ last:' },
    { t: 'math', tex: 'f(4) = 3(2)^4 = 3(16) = 48' },
    { t: 'callout', variant: 'warning', title: 'Exponent first, then multiply', text: 'The exponent belongs only to the base $2$, not to $3 \\cdot 2$. So $3(2)^4 = 3 \\cdot 16 = 48$. Multiplying first gives $6^4 = 1296$, which is wrong.' },
    { t: 'p', text: '### Zero and negative inputs' },
    { t: 'p', text: 'The input can be any real number. Here is $f(x) = 3(2)^x$ for inputs from $-2$ to $3$:' },
    {
      t: 'table',
      caption: 'Moving right multiplies the output by 2. Moving left divides it by 2.',
      headers: ['$x$', '$-2$', '$-1$', '$0$', '$1$', '$2$', '$3$'],
      rows: [
        ['Work', '$3 \\cdot 2^{-2} = 3 \\cdot \\frac{1}{4}$', '$3 \\cdot 2^{-1} = 3 \\cdot \\frac{1}{2}$', '$3 \\cdot 2^0 = 3 \\cdot 1$', '$3 \\cdot 2$', '$3 \\cdot 4$', '$3 \\cdot 8$'],
        ['$f(x)$', '$\\frac{3}{4}$', '$\\frac{3}{2}$', '$3$', '$6$', '$12$', '$24$'],
      ],
    },
    { t: 'p', text: 'Look at $f(0) = 3$: that is the initial value $a$, because $2^0 = 1$. And $f(-2) = \\frac{3}{4}$: a negative input gives a reciprocal, so the output is **small**, but it is still **positive**.' },
    {
      t: 'graph',
      caption: 'The points from the table lie on the curve f(x) = 3(2)^x. Left of the y-axis the outputs shrink toward 0 but stay positive.',
      spec: {
        xMin: -3,
        xMax: 4,
        yMin: -2,
        yMax: 26,
        yStep: 2,
        xLabel: 'x',
        yLabel: 'f(x)',
        functions: [{ expr: '3*2^x', label: 'f(x) = 3(2)^x' }],
        points: [
          { x: -2, y: 0.75, label: '(-2, 3/4)' },
          { x: -1, y: 1.5, label: '(-1, 3/2)' },
          { x: 0, y: 3, label: '(0, 3)' },
          { x: 1, y: 6, label: '(1, 6)' },
          { x: 2, y: 12, label: '(2, 12)' },
          { x: 3, y: 24, label: '(3, 24)' },
        ],
        ariaLabel: 'An increasing curve through (-2, 3/4), (-1, 3/2), (0, 3), (1, 6), (2, 12) and (3, 24). To the left it gets closer and closer to the x-axis without touching it.',
      },
    },
    { t: 'callout', variant: 'warning', title: 'A negative input does not make a negative output', text: '$f(-2) = 3(2)^{-2}$ is $3 \\cdot \\frac{1}{4} = \\frac{3}{4}$, not $-12$. The negative exponent means "take the reciprocal," so it divides instead of multiplying. When $a > 0$, every output of $a(b)^x$ is positive.' },
    { t: 'p', text: '### Fraction and decimal bases' },
    { t: 'p', text: 'The same steps work when the base is between $0$ and $1$. For $g(x) = 16\\left(\\frac{1}{2}\\right)^x$:' },
    {
      t: 'list',
      items: [
        '$g(3) = 16\\left(\\frac{1}{2}\\right)^3 = 16 \\cdot \\frac{1}{8} = 2$',
        '$g(0) = 16 \\cdot 1 = 16$',
        '$g(-1) = 16\\left(\\frac{1}{2}\\right)^{-1} = 16 \\cdot 2 = 32$, because the reciprocal of $\\frac{1}{2}$ is $2$.',
      ],
    },
    { t: 'p', text: 'So for a decay function, a negative input gives a **bigger** output: going back in time, there was more.' },
    { t: 'p', text: '### Reading a statement in function notation' },
    { t: 'p', text: 'A scientist models a colony of bacteria with $P(t) = 2000(1.1)^t$, where $P(t)$ is the number of bacteria $t$ hours after she starts watching. The statement $P(3) = 2662$ has two parts:' },
    {
      t: 'table',
      caption: 'What each part of P(3) = 2662 means.',
      headers: ['Part', 'What it is', 'Meaning in context'],
      rows: [
        ['$3$', 'the input $t$', '$3$ hours after she starts watching'],
        ['$2662$', 'the output $P(t)$', 'there are $2{,}662$ bacteria'],
        ['$P(3) = 2662$', 'the whole statement', 'After $3$ hours, the colony has $2{,}662$ bacteria.'],
      ],
    },
    { t: 'p', text: 'Check it: $P(3) = 2000(1.1)^3 = 2000(1.331) = 2662$. And $P(0) = 2000$ says she started with $2{,}000$ bacteria.' },
    { t: 'p', text: '### Two kinds of questions' },
    {
      t: 'list',
      items: [
        '**Find $f(4)$.** You know the **input**. Substitute and simplify to get the output.',
        '**Solve $f(x) = 96$.** You know the **output**. Find the input that produces it.',
      ],
    },
    { t: 'p', text: 'For $f(x) = 3(2)^x$, solving $f(x) = 96$ uses the common-base idea from Unit 5:' },
    { t: 'math', tex: '3(2)^x = 96 \\;\\Rightarrow\\; 2^x = 32 \\;\\Rightarrow\\; 2^x = 2^5 \\;\\Rightarrow\\; x = 5' },
    { t: 'callout', variant: 'why', title: 'Why divide by a first', text: 'The exponent is only on the $2$, so get $2^x$ by itself first: divide both sides by $3$. Then write $32$ as a power of $2$. Check: $f(5) = 3(32) = 96$.' },
    { t: 'callout', variant: 'realworld', title: 'Where this shows up', text: 'Bank balances, the value of a phone, the number of people who have seen a post, and the amount of medicine in your body are all exponential functions of time. "$V(2) = 450$" is a short way to say "after $2$ years the phone is worth \\$450."' },
  ],
  examples: [
    {
      title: 'Evaluate at positive, zero and negative inputs',
      kind: 'introductory',
      problem: [{ t: 'p', text: 'For $f(x) = 5(3)^x$, find $f(2)$, $f(0)$ and $f(-1)$.' }],
      steps: [
        { text: 'Find $f(2)$.', tex: 'f(2) = 5(3)^2 = 5(9) = 45', why: 'Replace $x$ with $2$. Square the $3$ first, then multiply by $5$.' },
        { text: 'Find $f(0)$.', tex: 'f(0) = 5(3)^0 = 5(1) = 5', why: 'Any nonzero base to the power $0$ is $1$, so $f(0)$ is always the initial value $a$.' },
        { text: 'Find $f(-1)$.', tex: 'f(-1) = 5(3)^{-1} = 5 \\cdot \\frac{1}{3} = \\frac{5}{3}', why: 'A negative exponent means the reciprocal: $3^{-1} = \\frac{1}{3}$. The output is smaller than $5$ but still positive.' },
      ],
      answer: '$f(2) = 45$, $f(0) = 5$, $f(-1) = \\frac{5}{3}$',
    },
    {
      title: 'A fraction base',
      kind: 'intermediate',
      problem: [{ t: 'p', text: 'For $h(x) = 48\\left(\\frac{1}{2}\\right)^x$, find $h(3)$, $h(0)$ and $h(-2)$.' }],
      steps: [
        { text: 'Find $h(3)$.', tex: 'h(3) = 48\\left(\\frac{1}{2}\\right)^3 = 48 \\cdot \\frac{1}{8} = 6', why: 'Cube the base first: $\\left(\\frac{1}{2}\\right)^3 = \\frac{1}{8}$. Taking $\\frac{1}{8}$ of $48$ gives $6$.' },
        { text: 'Find $h(0)$.', tex: 'h(0) = 48 \\cdot 1 = 48', why: 'The initial value, as always.' },
        { text: 'Find $h(-2)$.', tex: 'h(-2) = 48\\left(\\frac{1}{2}\\right)^{-2} = 48 \\cdot 2^2 = 48 \\cdot 4 = 192', why: 'The reciprocal of $\\frac{1}{2}$ is $2$, so $\\left(\\frac{1}{2}\\right)^{-2} = 2^2 = 4$. This is a decay function, so going to the left (back in time) the output gets bigger.' },
      ],
      answer: '$h(3) = 6$, $h(0) = 48$, $h(-2) = 192$',
    },
    {
      title: 'Two evaluating mistakes',
      kind: 'common-mistake',
      problem: [{ t: 'p', text: 'For $f(x) = 4(3)^x$, Jordan writes $f(2) = 144$ and $f(-1) = -12$. Find each mistake and fix it.' }],
      steps: [
        { text: 'Find where $144$ came from.', tex: '(4 \\cdot 3)^2 = 12^2 = 144', why: 'Jordan multiplied $4 \\cdot 3$ first and then squared. But the exponent belongs only to the base $3$.' },
        { text: 'Fix $f(2)$.', tex: 'f(2) = 4(3)^2 = 4(9) = 36', why: 'Exponent first, then multiply by $a$.' },
        { text: 'Find where $-12$ came from.', why: 'Jordan treated the exponent $-1$ like multiplying by $-1$: $4 \\cdot 3 \\cdot (-1) = -12$. A negative exponent does not make anything negative.' },
        { text: 'Fix $f(-1)$.', tex: 'f(-1) = 4(3)^{-1} = 4 \\cdot \\frac{1}{3} = \\frac{4}{3}', why: '$3^{-1}$ is the reciprocal of $3$. With $a = 4 > 0$, every output is positive, so $-12$ was impossible anyway.' },
      ],
      answer: '$f(2) = 36$ (not $144$) and $f(-1) = \\frac{4}{3}$ (not $-12$).',
    },
    {
      title: 'What is the phone worth?',
      kind: 'real-world',
      problem: [{ t: 'p', text: 'The value in dollars of Malik\'s phone $t$ years after he buys it is $V(t) = 800(0.75)^t$. (a) Find $V(0)$ and explain it. (b) Find $V(2)$ and explain what $V(2) = 450$ means. (c) Find the value after $3$ years.' }],
      steps: [
        { text: '(a) Evaluate at $t = 0$.', tex: 'V(0) = 800(0.75)^0 = 800', why: 'At $t = 0$, the day he buys it, the phone is worth \\$800. That is the initial value.' },
        { text: '(b) Evaluate at $t = 2$.', tex: 'V(2) = 800(0.75)^2 = 800(0.5625) = 450', why: 'Square $0.75$ first. You can check it step by step: $800 \\to 600 \\to 450$, multiplying by $0.75$ each year.' },
        { text: 'Interpret $V(2) = 450$.', why: 'The input $2$ is the time, $2$ years after buying it. The output $450$ is the value in dollars. So $2$ years after Malik buys it, the phone is worth \\$450.' },
        { text: '(c) Evaluate at $t = 3$.', tex: 'V(3) = 800(0.75)^3 = 800(0.421875) = 337.5', why: 'Or one more year from $V(2)$: $450(0.75) = 337.5$. Money is written to the cent: \\$337.50.' },
      ],
      answer: '(a) $V(0) = 800$: the phone costs \\$800 new. (b) $V(2) = 450$: after $2$ years it is worth \\$450. (c) $V(3) = 337.50$, so \\$337.50.',
    },
    {
      title: 'Before the count and solving for the time',
      kind: 'challenging',
      problem: [{ t: 'p', text: 'A lab culture doubles every hour. The number of cells $t$ hours after the first count is $B(t) = 500(2)^t$. (a) Find $B(-1)$ and explain what it means. (b) Solve $B(t) = 8000$ and explain your answer.' }],
      steps: [
        { text: '(a) Evaluate at $t = -1$.', tex: 'B(-1) = 500(2)^{-1} = 500 \\cdot \\frac{1}{2} = 250', why: 'A negative time is before the first count. Going back one hour undoes one doubling, so the count is cut in half.' },
        { text: 'Interpret $B(-1) = 250$.', why: 'One hour before the first count, there were $250$ cells (if the culture was already growing this way).' },
        { text: '(b) Now the output is known. Get $2^t$ alone.', tex: '500(2)^t = 8000 \\;\\Rightarrow\\; 2^t = 16', why: 'Divide both sides by $500$. The exponent is only on the $2$.' },
        { text: 'Write both sides with base $2$.', tex: '2^t = 2^4 \\;\\Rightarrow\\; t = 4', why: 'Equal powers of the same base have equal exponents. Check: $B(4) = 500(16) = 8000$.' },
        { text: 'Interpret.', why: '$B(4) = 8000$: $4$ hours after the first count, there are $8{,}000$ cells.' },
      ],
      answer: '(a) $B(-1) = 250$: one hour before the first count there were $250$ cells. (b) $t = 4$: the culture reaches $8{,}000$ cells $4$ hours after the first count.',
    },
  ],
  teachMeAgain: [
    {
      approach: 'visual',
      title: 'Walk along the table',
      blocks: [
        { t: 'p', text: 'Start at $x = 0$, where the output is $a$. Each step to the right multiplies by $b$. Each step to the left divides by $b$.' },
        {
          t: 'table',
          caption: 'For f(x) = 3(2)^x: right means times 2, left means divided by 2.',
          headers: ['$x$', '$-2$', '$-1$', '$0$', '$1$', '$2$'],
          rows: [
            ['$f(x)$', '$\\frac{3}{4}$', '$\\frac{3}{2}$', '$3$', '$6$', '$12$'],
            ['How you got there', '$\\frac{3}{2} \\div 2$', '$3 \\div 2$', 'start: $a = 3$', '$3 \\times 2$', '$6 \\times 2$'],
          ],
        },
        { t: 'p', text: 'Dividing a positive number by $2$ never makes it negative or zero. That is why $f(-2) = \\frac{3}{4}$ is small and positive.' },
      ],
    },
    {
      approach: 'simpler-example',
      title: 'Powers of 2 with no coefficient',
      blocks: [
        { t: 'p', text: 'Take the simplest one, $f(x) = 2^x$.' },
        { t: 'list', items: [
          '$f(3) = 2^3 = 8$ and $f(1) = 2^1 = 2$.',
          '$f(0) = 2^0 = 1$.',
          '$f(-1) = 2^{-1} = \\frac{1}{2}$ and $f(-3) = 2^{-3} = \\frac{1}{8}$.',
        ] },
        { t: 'p', text: 'Now put a coefficient in front: for $g(x) = 10(2)^x$, just multiply each of those by $10$. So $g(3) = 80$, $g(0) = 10$ and $g(-1) = 5$.' },
      ],
    },
    {
      approach: 'analogy',
      title: 'A machine with a slot',
      blocks: [
        { t: 'p', text: 'Think of $f$ as a machine. You drop a number into the slot (the input), the machine runs its rule, and a number comes out (the output). $f(4) = 48$ is a receipt: "I put in $4$ and got $48$."' },
        { t: 'p', text: 'For $f(x) = 3(2)^x$ the rule is: "raise $2$ to the input, then multiply by $3$." The order matters, the same way you have to put the bread in the toaster before you butter it.' },
        { t: 'p', text: 'Solving $f(x) = 96$ is running the machine backwards: you see the $96$ that came out and figure out which input went in ($5$).' },
      ],
    },
    {
      approach: 'prerequisite',
      title: 'Refresher: negative exponents and order of operations',
      blocks: [
        { t: 'p', text: 'A negative exponent means a reciprocal: $b^{-n} = \\frac{1}{b^n}$.' },
        { t: 'list', items: [
          '$2^{-3} = \\frac{1}{2^3} = \\frac{1}{8}$',
          '$10^{-2} = \\frac{1}{100} = 0.01$',
          '$\\left(\\frac{1}{3}\\right)^{-2} = 3^2 = 9$, because the reciprocal of $\\frac{1}{3}$ is $3$.',
        ] },
        { t: 'p', text: 'Order of operations: exponents come before multiplication. In $200(1.5)^2$, first $1.5^2 = 2.25$, then $200 \\cdot 2.25 = 450$. In $10(3)^{-2}$, first $3^{-2} = \\frac{1}{9}$, then $10 \\cdot \\frac{1}{9} = \\frac{10}{9}$.' },
      ],
    },
    {
      approach: 'step-by-step',
      title: 'A 3-step routine',
      blocks: [
        { t: 'p', text: 'To evaluate $f(x) = a(b)^x$ at an input:' },
        { t: 'list', ordered: true, items: [
          '**Substitute.** Write the input in place of $x$, in parentheses: $f(-2) = 3(2)^{-2}$.',
          '**Power first.** Work out $b$ to that power: $2^{-2} = \\frac{1}{4}$.',
          '**Multiply by $a$.** $3 \\cdot \\frac{1}{4} = \\frac{3}{4}$. In context, add the units of the output.',
        ] },
        { t: 'p', text: 'To interpret $f(\\text{input}) = \\text{output}$ in context, say both parts in one sentence: "After [input with units], [output with units]."' },
      ],
    },
    {
      approach: 'alternate-strategy',
      title: 'Count the multiplications',
      blocks: [
        { t: 'p', text: 'You can evaluate without exponent rules by repeating the factor. For $V(t) = 800(0.75)^t$:' },
        { t: 'list', items: [
          '$V(2)$: start at $800$ and multiply by $0.75$ twice: $800 \\to 600 \\to 450$.',
          '$V(3)$: one more time: $450 \\to 337.5$.',
          'For a negative input, divide instead. For $B(t) = 500(2)^t$, $B(-1)$ is $500 \\div 2 = 250$.',
        ] },
        { t: 'p', text: 'The exponent just counts how many times to multiply by the factor (or, if it is negative, how many times to divide).' },
      ],
    },
  ],
  guided: [
    { generator: 'u6.evaluate-exp', difficulty: 1 },
    { generator: 'u6.evaluate-exp', difficulty: 1 },
    { generator: 'u6.evaluate-exp', difficulty: 2 },
    { generator: 'u6.evaluate-exp', difficulty: 3 },
  ],
  independent: {
    count: 8,
    reviewCount: 2,
    mix: [
      { generator: 'u6.evaluate-exp', difficulty: 1, weight: 2 },
      { generator: 'u6.evaluate-exp', difficulty: 2, weight: 3 },
      { generator: 'u6.evaluate-exp', difficulty: 3, weight: 3 },
    ],
  },
  quiz: {
    items: [
      { generator: 'u6.evaluate-exp', difficulty: 1 },
      { generator: 'u6.evaluate-exp', difficulty: 2 },
      { generator: 'u6.evaluate-exp', difficulty: 2 },
      { generator: 'u6.evaluate-exp', difficulty: 2 },
      { generator: 'u6.evaluate-exp', difficulty: 3 },
      { generator: 'u6.evaluate-exp', difficulty: 3 },
    ],
  },
  summary: [
    'To evaluate $f(x) = a(b)^x$, substitute the input, work the power first, then multiply by $a$: $f(4) = 3(2)^4 = 48$, not $6^4$.',
    '$f(0) = a$, the initial value. A negative input means a reciprocal, so $f(-2) = 3(2)^{-2} = \\frac{3}{4}$: small, but still positive.',
    'In $P(3) = 2662$, the $3$ is the input (3 hours) and $2662$ is the output (2,662 bacteria): "after 3 hours there are 2,662 bacteria."',
    '"Find $f(4)$" gives the input; "solve $f(x) = 96$" gives the output. Solve by getting $b^x$ alone and using a common base: $2^x = 32 = 2^5$, so $x = 5$.',
  ],
  mastery: { quizPassScore: 0.8, practiceMinCorrect: 5 },
};
