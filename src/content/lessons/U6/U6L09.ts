import type { LessonContent } from '../../../core/curriculum/types';

/**
 * U6L09 Comparing Linear, Quadratic and Exponential Functions (A.FGR.9.5, A.FGR.7.9)
 * Identify the family from a table with equal x-steps (constant first differences = linear, constant second
 * differences = quadratic, constant ratios = exponential) or from an equation; compare values and average rates
 * of change of functions given as equations, tables, graphs and descriptions; explain why an increasing
 * exponential function eventually passes any linear or quadratic function: a line adds the same amount each
 * step, a quadratic adds an amount that grows by the same amount, but an exponential multiplies, so its
 * increases themselves keep multiplying (S6.09).
 *
 * Math verified by hand (2026-10-07): every table value was recomputed from its function with node, along with
 * its first differences, second differences and ratios; 2^x versus x^2 and 10x for x = 0..10 (2^x = x^2 at
 * x = 2 and x = 4, 2^x < x^2 at x = 3, 2^x > x^2 for every whole number x >= 5; 2^x < 10x for x = 1..5 and
 * 2^x > 10x for every whole number x >= 6, with the real crossing near x = 5.88; x^2 = 10x at x = 10); average
 * rates on [1, 3]: 4, 15 and 8 for 4x + 10, 5(2)^x and 2x^2; 100(2)^d versus 2000 + 500d (4500 vs 3200 on
 * day 5, 5000 vs 6400 on day 6) and the average rates 500, 375 and 2400; 2^x versus 50x + 20 (420 vs 256 at
 * x = 8, 470 vs 512 at x = 9); 1.5^x versus x^2 + 10 (154 vs 129.75 at x = 12, 179 vs 194.62 at x = 13) and the
 * step ratios ((x + 1)^2 + 10)/(x^2 + 10), which are below 1.151 and shrinking for x >= 13; every graph point
 * was checked to lie on its curve and inside its window, and every expression was parsed and evaluated with
 * src/core/math/parser.ts.
 */
export const U6L09: LessonContent = {
  lessonId: 'U6L09',
  goal: 'Tell whether a function is linear, quadratic or exponential from a table or an equation, compare the values and average rates of change of functions shown in different ways, and explain why an exponential growth function always ends up passing any linear or quadratic function.',
  needToKnow: [
    { t: 'p', text: 'You already have the tools for this lesson:' },
    {
      t: 'list',
      items: [
        '**First differences**: subtract each output from the next one. Constant first differences mean **linear**.',
        '**Second differences**: the differences of the first differences. Constant second differences mean **quadratic**.',
        '**Ratios**: divide each output by the one before it. A constant ratio means **exponential**.',
        '**Average rate of change** on $[a, b]$: $\\frac{f(b) - f(a)}{b - a}$, the change in output per unit of input.',
      ],
    },
    { t: 'callout', variant: 'tip', title: 'Quick check', text: 'The outputs $3, 6, 12, 24$ come from $x = 0, 1, 2, 3$. Are the first differences constant? Is the ratio constant? (You should get differences $3, 6, 12$, which are not constant, and a ratio of $2$ every time, so the pattern is exponential.) If that felt shaky, open **Teach Me Again** and choose the refresher.' },
  ],
  vocabulary: [
    { term: 'function family', meaning: 'A group of functions with the same basic shape and rule, such as linear ($mx + b$), quadratic ($ax^2 + bx + c$) or exponential ($a(b)^x$).' },
    { term: 'first differences', meaning: 'The changes between consecutive outputs in a table with equal steps in $x$.' },
    { term: 'second differences', meaning: 'The changes between consecutive first differences. They are constant for a quadratic function.' },
    { term: 'common ratio', meaning: 'The number each output is multiplied by to get the next one when the $x$-steps are equal. It is constant for an exponential function.' },
    { term: 'eventually exceeds', meaning: 'Passes and then stays above for every larger input.' },
  ],
  instruction: [
    { t: 'p', text: '### Three families, three fingerprints' },
    { t: 'p', text: 'Each family leaves its own fingerprint in a table when the $x$-values go up by the same step. Here are $y = 3x + 2$, $y = x^2 + 1$ and $y = 2(3)^x$ for $x = 0$ to $4$.' },
    {
      t: 'table',
      caption: 'One function from each family, with the pattern that identifies it.',
      headers: ['$x$', '$0$', '$1$', '$2$', '$3$', '$4$', 'Pattern'],
      rows: [
        ['linear $3x + 2$', '$2$', '$5$', '$8$', '$11$', '$14$', 'first differences all $3$'],
        ['quadratic $x^2 + 1$', '$1$', '$2$', '$5$', '$10$', '$17$', 'first differences $1, 3, 5, 7$; second differences all $2$'],
        ['exponential $2(3)^x$', '$2$', '$6$', '$18$', '$54$', '$162$', 'ratios all $3$'],
      ],
    },
    { t: 'p', text: '**Why it works:** a linear function **adds** the same amount (the slope) each step. A quadratic adds an amount that itself goes up by the same amount each step, so the **second** differences are constant. An exponential function **multiplies** by the same factor each step, so the **ratios** are constant.' },
    { t: 'callout', variant: 'warning', title: 'Check the x-steps first', text: 'Differences and ratios only work when the $x$-values go up by the same amount. If a table jumps from $x = 1$ to $x = 2$ to $x = 5$, the differences are not comparable. Use the equation, or only compare rows with equal steps.' },
    { t: 'p', text: 'With an equation, look at where $x$ sits: $x$ to the first power is linear ($7 - 2x$), $x^2$ as the highest power is quadratic ($4x^2 - x$), and $x$ **in the exponent** is exponential ($5(1.2)^x$).' },
    { t: 'p', text: '### Comparing functions shown in different ways' },
    { t: 'p', text: 'Just like with quadratics, **find the same thing from each representation**, then compare the numbers. To compare values at $x = 4$, find each function\'s output at $4$. To compare growth on an interval, find each average rate of change $\\frac{f(b) - f(a)}{b - a}$ on that interval.' },
    { t: 'p', text: '### The race: exponential growth always wins in the end' },
    { t: 'p', text: 'Compare $y = 10x$, $y = x^2$ and $y = 2^x$ for whole numbers $x$.' },
    {
      t: 'table',
      caption: 'Values of 10x, x squared and 2 to the x. The exponential starts small and then passes both.',
      headers: ['$x$', '$0$', '$1$', '$2$', '$3$', '$4$', '$5$', '$6$', '$7$', '$8$', '$9$', '$10$'],
      rows: [
        ['$10x$', '$0$', '$10$', '$20$', '$30$', '$40$', '$50$', '$60$', '$70$', '$80$', '$90$', '$100$'],
        ['$x^2$', '$0$', '$1$', '$4$', '$9$', '$16$', '$25$', '$36$', '$49$', '$64$', '$81$', '$100$'],
        ['$2^x$', '$1$', '$2$', '$4$', '$8$', '$16$', '$32$', '$64$', '$128$', '$256$', '$512$', '$1024$'],
      ],
    },
    { t: 'p', text: 'At first $10x$ is far ahead. $2^x$ ties $x^2$ at $x = 2$ and $x = 4$ (both $4$, then both $16$), falls just behind at $x = 3$ ($8 < 9$), and is ahead for **every** whole number from $x = 5$ on. It passes $10x$ between $x = 5$ and $x = 6$ ($32 < 50$ but $64 > 60$), so it is ahead of $10x$ for every whole number from $x = 6$ on. By $x = 10$, $2^x$ is more than ten times as big as either one.' },
    {
      t: 'graph',
      caption: 'The curve 2^x starts below the line 10x and the parabola x^2, then passes both.',
      spec: {
        xMin: -1,
        xMax: 8,
        yMin: 0,
        yMax: 130,
        yStep: 10,
        functions: [
          { expr: '2^x', label: 'y = 2^x', domain: [-1, 7] },
          { expr: 'x^2', label: 'y = x^2', domain: [0, 8] },
          { expr: '10x', label: 'y = 10x', dashed: true, domain: [0, 8] },
        ],
        points: [
          { x: 4, y: 16, label: '(4, 16)' },
          { x: 6, y: 60, label: '(6, 60)' },
          { x: 6, y: 64, label: '(6, 64)' },
          { x: 7, y: 128, label: '(7, 128)' },
        ],
        ariaLabel: 'Three graphs for x from 0 to 8. The dashed line y = 10x rises steadily to 80. The parabola y = x^2 rises to 64. The curve y = 2^x stays low at first, meets the parabola at (4, 16), passes the line between x = 5 and x = 6 (64 versus 60 at x = 6) and shoots up to (7, 128).',
      },
    },
    { t: 'callout', variant: 'why', title: 'Why the exponential always wins', text: 'Look at how much each function **increases** from one whole number to the next. $10x$ always increases by $10$. $x^2$ increases by $2x + 1$: $1, 3, 5, 7, \\ldots$, which grows by only $2$ each time. $2^x$ increases by $2^x$ itself: $1, 2, 4, 8, 16, \\ldots$, so its increases **double** every time. Doubling increases eventually outrun increases that grow by a fixed amount, and once the exponential is ahead its lead only gets bigger. This is true for any growing exponential, even a slow one like $1.01^x$: it eventually passes every linear and quadratic function. It can just take a long time.' },
    { t: 'callout', variant: 'realworld', title: 'Where this shows up', text: 'A plan that pays a fixed amount each week is linear; a balance that earns a percent is exponential. A video that gains a set number of views per day is linear; one whose views double each day is exponential. Early on, the linear one often looks better, but the exponential one takes over.' },
  ],
  examples: [
    {
      title: 'Name the family from a table',
      kind: 'introductory',
      problem: [
        { t: 'p', text: 'Each table uses $x = 0, 1, 2, 3, 4$. Decide whether each function is linear, quadratic or exponential.' },
        {
          t: 'table',
          caption: 'Three functions A, B and C.',
          headers: ['$x$', '$0$', '$1$', '$2$', '$3$', '$4$'],
          rows: [
            ['A', '$20$', '$17$', '$14$', '$11$', '$8$'],
            ['B', '$4$', '$7$', '$12$', '$19$', '$28$'],
            ['C', '$81$', '$27$', '$9$', '$3$', '$1$'],
          ],
        },
      ],
      steps: [
        { text: 'Check that the $x$-steps are equal.', tex: '0, 1, 2, 3, 4', why: 'Each step is $1$, so differences and ratios can be compared fairly.' },
        { text: 'Table A: find the first differences.', tex: '17 - 20 = -3, \\; 14 - 17 = -3, \\; 11 - 14 = -3, \\; 8 - 11 = -3', why: 'The output drops by the same amount each step, so A is linear (with slope $-3$).' },
        { text: 'Table B: first, then second differences.', tex: '\\text{first: } 3, 5, 7, 9 \\qquad \\text{second: } 2, 2, 2', why: 'The first differences are not constant, but they go up by the same amount, $2$, each time. Constant second differences mean quadratic.' },
        { text: 'Table C: find the ratios. They all equal $\\frac{1}{3}$.', tex: '\\frac{27}{81}, \\; \\frac{9}{27}, \\; \\frac{3}{9}, \\; \\frac{1}{3}', why: 'Each output is $\\frac{1}{3}$ of the one before, a constant ratio, so C is exponential (decay).' },
      ],
      answer: 'A is linear (first differences all $-3$), B is quadratic (second differences all $2$) and C is exponential (ratio $\\frac{1}{3}$).',
    },
    {
      title: 'An equation, a table and a graph',
      kind: 'intermediate',
      problem: [
        { t: 'p', text: 'Let $f(x) = 4x + 10$. The function $g$ is given in the table, and $h$ is the quadratic graphed below. (a) Which function is greatest at $x = 1$? At $x = 4$? (b) Which has the greatest average rate of change on $[1, 3]$?' },
        {
          t: 'table',
          caption: 'Values of the function g.',
          headers: ['$x$', '$0$', '$1$', '$2$', '$3$', '$4$'],
          rows: [['$g(x)$', '$5$', '$10$', '$20$', '$40$', '$80$']],
        },
        {
          t: 'graph',
          caption: 'The graph of the quadratic h, with four points labeled.',
          spec: {
            xMin: -1,
            xMax: 5,
            yMin: 0,
            yMax: 40,
            yStep: 5,
            functions: [{ expr: '2x^2', label: 'h', domain: [-1, 4.4] }],
            points: [
              { x: 0, y: 0, label: '(0, 0)' },
              { x: 1, y: 2, label: '(1, 2)' },
              { x: 3, y: 18, label: '(3, 18)' },
              { x: 4, y: 32, label: '(4, 32)' },
            ],
            ariaLabel: 'An upward parabola h with vertex (0, 0) passing through (1, 2), (3, 18) and (4, 32).',
          },
        },
      ],
      steps: [
        { text: 'Find each value at $x = 1$.', tex: 'f(1) = 4 + 10 = 14, \\quad g(1) = 10, \\quad h(1) = 2', why: 'Substitute into the equation, read the table, and read the labeled point on the graph.' },
        { text: 'Find each value at $x = 4$.', tex: 'f(4) = 16 + 10 = 26, \\quad g(4) = 80, \\quad h(4) = 32', why: 'Same three methods. The order has changed completely: $f$ led at $x = 1$, but $g$ leads at $x = 4$.' },
        { text: 'Find each average rate on $[1, 3]$.', tex: 'f: \\frac{22 - 14}{2} = 4, \\quad g: \\frac{40 - 10}{2} = 15, \\quad h: \\frac{18 - 2}{2} = 8', why: '$f(3) = 12 + 10 = 22$. The rate of a line is always its slope, $4$; the other two rates depend on the interval.' },
        { text: 'Compare.', why: 'At $x = 1$: $14 > 10 > 2$. At $x = 4$: $80 > 32 > 26$. On $[1, 3]$: $15 > 8 > 4$. The table doubles each step ($5, 10, 20, 40, 80$), so $g$ is exponential, and it is already growing fastest.' },
      ],
      answer: '(a) $f$ is greatest at $x = 1$ ($14$); $g$ is greatest at $x = 4$ ($80$). (b) $g$ has the greatest average rate on $[1, 3]$: $15$, versus $8$ for $h$ and $4$ for $f$.',
    },
    {
      title: 'Two videos go head to head',
      kind: 'real-world',
      problem: [
        { t: 'p', text: 'Maya\'s dance video already has $2000$ views and gains $500$ views a day, so its views after $d$ days are $A(d) = 2000 + 500d$. Jordan\'s new video has $100$ views, and its views **double** every day: $B(d) = 100(2)^d$. (a) On which day does Jordan\'s video first have more views? (b) Compare the average rates of change on days $0$ to $4$ and on days $4$ to $6$.' },
      ],
      steps: [
        { text: 'Identify the families.', tex: 'A: \\text{linear (adds 500)}, \\qquad B: \\text{exponential (multiplies by 2)}', why: '"Gains $500$ a day" is a constant difference; "doubles every day" is a constant ratio.' },
        {
          text: 'Make a table for whole days.',
          tex: '\\begin{array}{c|ccccccc} d & 0 & 1 & 2 & 3 & 4 & 5 & 6 \\\\ \\hline A(d) & 2000 & 2500 & 3000 & 3500 & 4000 & 4500 & 5000 \\\\ B(d) & 100 & 200 & 400 & 800 & 1600 & 3200 & 6400 \\end{array}',
          why: 'Views come in whole days here, so check each day until $B$ passes $A$.',
        },
        { text: 'Find the first day $B > A$.', tex: 'd = 5: \\; 3200 < 4500, \\qquad d = 6: \\; 6400 > 5000', why: 'On day $5$ Jordan is still behind; on day $6$ he is ahead, and since $B$ doubles while $A$ only adds $500$, he stays ahead.' },
        { text: 'Average rates on $[0, 4]$.', tex: 'A: \\frac{4000 - 2000}{4} = 500, \\qquad B: \\frac{1600 - 100}{4} = 375 \\text{ views per day}', why: 'Early on, the linear video is gaining views faster.' },
        { text: 'Average rates on $[4, 6]$.', tex: 'A: \\frac{5000 - 4000}{2} = 500, \\qquad B: \\frac{6400 - 1600}{2} = 2400 \\text{ views per day}', why: 'The linear rate never changes, but the exponential rate keeps growing, which is why $B$ catches up and pulls away.' },
      ],
      answer: '(a) Day $6$ ($6400$ views versus $5000$). (b) On days $0$ to $4$, $A$ gains $500$ views per day and $B$ only $375$; on days $4$ to $6$, $A$ still gains $500$ per day but $B$ gains $2400$. (In real life a video cannot double forever, but while it does, it wins.)',
    },
    {
      title: 'A common mistake: judging from the first few rows',
      kind: 'common-mistake',
      problem: [
        { t: 'p', text: 'A student makes a table of $f(x) = 50x + 20$ and $g(x) = 2^x$ for $x = 0$ to $4$ and gets $f$: $20, 70, 120, 170, 220$ and $g$: $1, 2, 4, 8, 16$. The student says, "$f$ is way ahead and gaining, so $f$ will always be bigger." Is the student right?' },
      ],
      steps: [
        { text: 'Notice the families.', tex: 'f: \\text{linear}, \\qquad g: \\text{exponential growth } (b = 2 > 1)', why: 'An exponential growth function eventually passes every linear function, no matter how far behind it starts. A few rows cannot show "always".' },
        { text: 'Keep the table going.', tex: '\\begin{array}{c|ccccc} x & 5 & 6 & 7 & 8 & 9 \\\\ \\hline f(x) & 270 & 320 & 370 & 420 & 470 \\\\ g(x) & 32 & 64 & 128 & 256 & 512 \\end{array}', why: '$f$ adds $50$ each time; $g$ doubles each time.' },
        { text: 'Find where $g$ passes $f$.', tex: 'x = 8: \\; 256 < 420, \\qquad x = 9: \\; 512 > 470', why: 'By $x = 9$, $g$ is adding $256$ in one step (from $256$ to $512$), far more than the $50$ that $f$ adds.' },
        { text: 'Explain why it stays ahead.', why: 'From here on, $g$ increases by $512$, then $1024$, then $2048$, ... while $f$ keeps increasing by only $50$. The gap gets bigger every step.' },
      ],
      answer: 'No. $g(x) = 2^x$ passes $f(x) = 50x + 20$ at $x = 9$ ($512 > 470$) and stays ahead forever. The early rows only show that $f$ starts ahead.',
    },
    {
      title: 'A slow exponential versus a quadratic',
      kind: 'challenging',
      problem: [
        { t: 'p', text: 'Let $q(x) = x^2 + 10$ and $e(x) = 1.5^x$. (a) Find the first whole number $x$ for which $e(x) > q(x)$. (b) Explain why $e$ stays ahead for every larger whole number.' },
      ],
      steps: [
        { text: 'Compare small values.', tex: 'q(0) = 10 > e(0) = 1, \\quad q(4) = 26 > e(4) \\approx 5.06, \\quad q(8) = 74 > e(8) \\approx 25.63', why: 'The quadratic starts far ahead, and the exponential grows slowly at first because $1.5$ is close to $1$.' },
        { text: 'Check the values where they get close.', tex: 'x = 12: \\; 154 > 129.75 \\qquad x = 13: \\; 179 < 194.62', why: '$1.5^{12} \\approx 129.75$ and $1.5^{13} \\approx 194.62$, while $q(12) = 144 + 10$ and $q(13) = 169 + 10$.' },
        { text: 'Compare how each grows per step from $x = 13$ on.', tex: 'e: \\times 1.5 \\text{ every step}, \\qquad q: \\frac{q(14)}{q(13)} = \\frac{206}{179} \\approx 1.151', why: 'The exponential always multiplies by $1.5$. The quadratic\'s step ratio $\\frac{(x + 1)^2 + 10}{x^2 + 10}$ is only about $1.151$ at $x = 13$, and it gets closer to $1$ as $x$ grows ($1.141$ at $x = 14$, $1.132$ at $x = 15$).' },
        { text: 'Conclude.', why: 'Once $e$ is ahead, it multiplies by more than $q$ does every step, so the gap only widens.' },
      ],
      answer: '(a) $x = 13$ ($194.62 > 179$). (b) After that, $e$ multiplies by $1.5$ each step while $q$ multiplies by about $1.15$ or less, so $e$ stays ahead and pulls away.',
    },

    {
      title: 'A graph, an equation and a description',
      kind: 'intermediate',
      problem: [
        { t: 'p', text: 'The function $f$ is graphed below. $g(x) = 5(1.5)^x + 1$. The function $h$ has an output of $100$ when $x = 0$, and its output increases by $20$ each time $x$ increases by $1$. (a) Which has the greater $y$-intercept, $f$ or $g$? (b) Which has the greater growth factor, $f$ or $g$? (c) Which is greater at $x = 4$, $f$ or $h$?' },
        {
          t: 'graph',
          caption: 'The graph of f, with its asymptote y = 0 dashed.',
          spec: {
            xMin: -3,
            xMax: 4,
            yMin: -2,
            yMax: 18,
            yStep: 2,
            functions: [{ expr: '3*2^x' }, { expr: '0', dashed: true, color: '#888888' }],
            points: [
              { x: -1, y: 1.5, label: '(-1, 1.5)' },
              { x: 0, y: 3, label: '(0, 3)' },
              { x: 1, y: 6, label: '(1, 6)' },
              { x: 2, y: 12, label: '(2, 12)' },
            ],
            ariaLabel: 'An increasing exponential curve through (-1, 1.5), (0, 3), (1, 6) and (2, 12), approaching the x-axis on the left.',
          },
        },
      ],
      steps: [
        { text: '(a) Find each $y$-intercept.', tex: 'f(0) = 3, \\qquad g(0) = 5(1.5)^0 + 1 = 5 + 1 = 6', why: 'Read the labeled point on the $y$-axis for $f$; substitute $x = 0$ for $g$. Any nonzero number to the $0$ power is $1$, but the $+1$ still counts.' },
        { text: '(b) Find each growth factor.', tex: 'f: \\frac{6}{3} = \\frac{12}{6} = 2, \\qquad g: 1.5', why: 'On the graph (asymptote $y = 0$), each step of $1$ in $x$ multiplies the output by $2$. In the equation, the factor is the base.' },
        { text: '(c) Find each value at $x = 4$.', tex: 'f(4) = 3(2)^4 = 48, \\qquad h(4) = 100 + 20(4) = 180', why: 'The graph gives $f(x) = 3(2)^x$ (start $3$, factor $2$). The description is linear: start at $100$ and add $20$ four times.' },
        { text: 'Compare.', why: '$6 > 3$, so $g$ has the greater $y$-intercept; $2 > 1.5$, so $f$ has the greater growth factor; $180 > 48$, so $h$ is greater at $x = 4$. The exponential $f$ does pass $h$ later: $f(6) = 192 < h(6) = 220$, but $f(7) = 384 > h(7) = 240$.' },
      ],
      answer: '(a) $g$ ($6$ versus $3$). (b) $f$ (factor $2$ versus $1.5$). (c) $h$ ($180$ versus $48$), although $f$ passes $h$ at $x = 7$.',
    },
  ],
  teachMeAgain: [
    {
      approach: 'visual',
      title: 'Zoom out',
      blocks: [
        { t: 'p', text: 'On a small window, $2^x$ looks weak. Zoom out to $x = 10$ and the picture changes completely.' },
        {
          t: 'graph',
          caption: 'Zoomed out to x = 10, the curve 2^x towers over x^2 and 10x, which meet at (10, 100).',
          spec: {
            xMin: -1,
            xMax: 11,
            yMin: 0,
            yMax: 1100,
            yStep: 100,
            functions: [
              { expr: '2^x', label: 'y = 2^x', domain: [0, 10] },
              { expr: 'x^2', label: 'y = x^2', domain: [0, 10] },
              { expr: '10x', label: 'y = 10x', dashed: true, domain: [0, 10] },
            ],
            points: [
              { x: 10, y: 1024, label: '(10, 1024)' },
              { x: 10, y: 100, label: '(10, 100)' },
            ],
            ariaLabel: 'For x from 0 to 10, the line y = 10x and the parabola y = x^2 stay near the bottom and meet at (10, 100). The curve y = 2^x stays flat at first, then shoots up to (10, 1024).',
          },
        },
        { t: 'p', text: 'At $x = 10$ the line and the parabola are both at $100$, while the exponential is at $1024$. The line and parabola look almost flat next to it.' },
      ],
    },
    {
      approach: 'simpler-example',
      title: 'Add 2 or double?',
      blocks: [
        { t: 'p', text: 'Start two piles at $1$ coin. Pile A gets $2$ more coins each day. Pile B doubles each day.' },
        {
          t: 'table',
          caption: 'Adding 2 each day versus doubling each day.',
          headers: ['Day', '$0$', '$1$', '$2$', '$3$', '$4$', '$5$'],
          rows: [
            ['A: add $2$', '$1$', '$3$', '$5$', '$7$', '$9$', '$11$'],
            ['B: double', '$1$', '$2$', '$4$', '$8$', '$16$', '$32$'],
          ],
        },
        { t: 'p', text: 'Pile A is ahead on days $1$ and $2$. On day $3$, B passes it ($8 > 7$), and after that the doubling pile adds more every day ($8$, then $16$, then $32$) while A adds only $2$. Adding the same amount is linear; multiplying by the same amount is exponential.' },
      ],
    },
    {
      approach: 'analogy',
      title: 'The tortoise with a rocket',
      blocks: [
        { t: 'p', text: 'A linear function is a runner who keeps the same speed. A quadratic is a runner who speeds up by the same amount every second. An exponential is a tortoise strapped to a rocket that **doubles** its speed every second.' },
        { t: 'p', text: 'The tortoise starts painfully slow, so the runners take the lead. But doubling speed beats "a little faster each second" eventually, and once the tortoise passes them, it is going so fast they never catch up.' },
      ],
    },
    {
      approach: 'prerequisite',
      title: 'Refresher: differences and ratios',
      blocks: [
        { t: 'p', text: 'For outputs $2, 6, 18, 54$ at $x = 0, 1, 2, 3$:' },
        { t: 'list', items: [
          '**First differences:** $6 - 2 = 4$, $18 - 6 = 12$, $54 - 18 = 36$. Not constant, so not linear.',
          '**Second differences:** $12 - 4 = 8$, $36 - 12 = 24$. Not constant, so not quadratic.',
          '**Ratios:** $\\frac{6}{2} = 3$, $\\frac{18}{6} = 3$, $\\frac{54}{18} = 3$. Constant, so exponential: $y = 2(3)^x$.',
        ] },
        { t: 'p', text: 'Check: $2(3)^3 = 2 \\cdot 27 = 54$. The starting value $2$ is the output at $x = 0$, and the ratio $3$ is the base.' },
      ],
    },
    {
      approach: 'step-by-step',
      title: 'A routine for any comparison',
      blocks: [
        { t: 'list', ordered: true, items: [
          '**Name each family.** Table: check the $x$-steps, then first differences, second differences, ratios. Equation: where is $x$? Graph: line, parabola, or a curve that flattens toward a horizontal line on one side?',
          '**Find what the question asks for** from each representation: a value at one $x$, or an average rate $\\frac{f(b) - f(a)}{b - a}$ on an interval.',
          '**Line the numbers up** in a small chart, one column per function.',
          '**Compare and answer** in a sentence, with units if there are any.',
          '**For "eventually" questions,** remember: an exponential growth function passes every linear and quadratic function. To find **when**, keep extending a table until it passes.',
        ] },
      ],
    },
    {
      approach: 'alternate-strategy',
      title: 'Watch the increases, not the values',
      blocks: [
        { t: 'p', text: 'Instead of comparing the outputs, compare how much each function **adds** per step. That tells you who will win long before the values cross.' },
        {
          t: 'table',
          caption: 'The increase from x to x + 1 for each function.',
          headers: ['From $x$ to $x + 1$', '$0 \\to 1$', '$1 \\to 2$', '$2 \\to 3$', '$3 \\to 4$', '$4 \\to 5$', '$5 \\to 6$', '$6 \\to 7$'],
          rows: [
            ['$10x$ adds', '$10$', '$10$', '$10$', '$10$', '$10$', '$10$', '$10$'],
            ['$x^2$ adds', '$1$', '$3$', '$5$', '$7$', '$9$', '$11$', '$13$'],
            ['$2^x$ adds', '$1$', '$2$', '$4$', '$8$', '$16$', '$32$', '$64$'],
          ],
        },
        { t: 'p', text: 'From $x = 4$ on, $2^x$ adds more per step than $10x$ does, and the amount it adds keeps doubling. The amount $x^2$ adds grows by only $2$ each step. A function that adds more and more each step will catch up to and pass one that adds less, even if it started behind.' },
      ],
    },
  ],
  guided: [
    { generator: 'u6.compare-families', difficulty: 1 },
    { generator: 'u6.compare-families', difficulty: 1 },
    { generator: 'u6.compare-families', difficulty: 2 },
    { generator: 'u6.compare-families', difficulty: 2 },
  ],
  independent: {
    count: 8,
    reviewCount: 2,
    mix: [
      { generator: 'u6.compare-families', difficulty: 1, weight: 1 },
      { generator: 'u6.compare-families', difficulty: 2, weight: 2 },
      { generator: 'u6.compare-families', difficulty: 3, weight: 2 },
    ],
  },
  quiz: {
    items: [
      { generator: 'u6.compare-families', difficulty: 1 },
      { generator: 'u6.compare-families', difficulty: 2 },
      { generator: 'u6.compare-families', difficulty: 2 },
      { generator: 'u6.compare-families', difficulty: 2 },
      { generator: 'u6.compare-families', difficulty: 3 },
      { generator: 'u6.compare-families', difficulty: 3 },
    ],
  },
  summary: [
    'With equal $x$-steps: constant first differences mean linear, constant second differences mean quadratic, and constant ratios mean exponential.',
    'To compare functions shown in different ways, find the same thing (a value or an average rate of change) from each one, then compare the numbers.',
    'A line adds the same amount each step and a quadratic adds an amount that grows steadily, but an exponential multiplies, so the amount it adds keeps multiplying too.',
    'An exponential growth function eventually exceeds every linear and quadratic function: $2^x > x^2$ for every whole number $x \\geq 5$, and $2^x > 10x$ for every whole number $x \\geq 6$.',
    'A few rows of a table cannot show which function is bigger "always"; extend the table to see where the exponential passes.',
  ],
  mastery: { quizPassScore: 0.8, practiceMinCorrect: 5 },
};
