import type { LessonContent } from '../../../core/curriculum/types';

/**
 * U6L04 Linear vs Exponential Growth (A.FGR.9.2, A.MP.8)
 * Telling linear and exponential patterns apart: linear functions add the same amount over equal steps in x
 * (constant first differences), exponential functions multiply by the same factor over equal steps in x
 * (constant ratios); checking that the x-steps are equal first; "neither" tables; per-unit rates when the
 * x-steps are not 1; words like "50 dollars per month" versus "5% per month"; how an exponential pattern
 * always passes a linear one (S6.04).
 *
 * Math verified by hand (2026-10-07): every table was recomputed from its rule (4x + 2: 2, 6, 10, 14, 18;
 * 2(2)^x: 2, 4, 8, 16, 32; 80(0.5)^x: 80, 40, 20, 10, 5; x^2 + 1: 1, 2, 5, 10, 17; 16(1.5)^x: 16, 24, 36,
 * 54, 81; 3x + 1 at x = 0, 2, 3, 5: 1, 7, 10, 16; 5(2)^x at x = 0, 2, 4, 6: 5, 20, 80, 320), every first
 * difference and every ratio was recomputed, the follower models 1000 + 300n and 1000(1.2)^n were evaluated
 * for n = 0 to 6 (1.2^5 = 2.48832, 1.2^6 = 2.985984, so B first passes A in week 6), and every graph point
 * was checked to lie on its curve and inside its window.
 */
export const U6L04: LessonContent = {
  lessonId: 'U6L04',
  goal: 'Decide whether a table, a graph or a situation is **linear** (it adds the same amount each equal step, so the first differences are constant) or **exponential** (it multiplies by the same factor each equal step, so the ratios are constant), and give the common difference or common ratio.',
  needToKnow: [
    { t: 'p', text: 'This lesson connects two ideas you already have:' },
    {
      t: 'list',
      items: [
        '**Slope from a table (Unit 1).** In a linear table, the slope is $\\frac{\\text{change in } y}{\\text{change in } x}$, and it is the same between every pair of rows.',
        '**Growth and decay factors (Unit 5).** In $y = a(b)^x$, every time $x$ goes up by $1$ the output is **multiplied** by $b$. A growth rate of $5\\%$ means $b = 1 + 0.05 = 1.05$; a decay rate of $20\\%$ means $b = 1 - 0.20 = 0.8$.',
      ],
    },
    { t: 'callout', variant: 'tip', title: 'Quick check', text: 'In the list $5, 8, 11, 14$, what is **added** each time? In the list $2, 6, 18, 54$, what is each number **multiplied** by? (You should get $3$ both times, but for different reasons.) If that felt shaky, open **Teach Me Again** and choose the refresher.' },
  ],
  vocabulary: [
    { term: 'first differences', meaning: 'The changes in $y$ from one row of a table to the next: (next $y$) $-$ (this $y$).' },
    { term: 'common difference', meaning: 'A first difference that is the same every time. Constant first differences over equal steps in $x$ mean the pattern is **linear**.' },
    { term: 'ratio of consecutive outputs', meaning: '(next $y$) $\\div$ (this $y$). It tells you what each output was multiplied by.' },
    { term: 'common ratio', meaning: 'A ratio that is the same every time. Constant ratios over equal steps in $x$ mean the pattern is **exponential**, and the ratio for a step of $1$ is the base $b$.' },
    { term: 'equal steps', meaning: 'The $x$-values go up by the same amount from row to row, like $0, 1, 2, 3$ or $0, 5, 10, 15$. Differences and ratios can only be compared when the steps are equal.' },
  ],
  instruction: [
    { t: 'p', text: '### Adding versus multiplying' },
    { t: 'p', text: 'Two patterns both start at $2$. Pattern A **adds $4$** each step. Pattern B **multiplies by $2$** each step.' },
    {
      t: 'table',
      caption: 'Pattern A adds 4 each time, so its differences are all 4. Pattern B doubles each time, so its ratios are all 2.',
      headers: ['$x$', '$0$', '$1$', '$2$', '$3$', '$4$'],
      rows: [
        ['A: $y = 4x + 2$', '$2$', '$6$', '$10$', '$14$', '$18$'],
        ['first differences of A', '', '$+4$', '$+4$', '$+4$', '$+4$'],
        ['B: $y = 2(2)^x$', '$2$', '$4$', '$8$', '$16$', '$32$'],
        ['first differences of B', '', '$+2$', '$+4$', '$+8$', '$+16$'],
        ['ratios of B', '', '$\\times 2$', '$\\times 2$', '$\\times 2$', '$\\times 2$'],
      ],
    },
    { t: 'p', text: 'A has a **common difference** of $4$, so it is **linear**. B\'s differences keep changing, but its **ratios** are all $2$: it has a **common ratio** of $2$, so it is **exponential**.' },
    { t: 'callout', variant: 'why', title: 'Why the tests work', text: 'For a linear function $f(x) = mx + b$, going from $x$ to $x + 1$ always adds $m$: $f(x + 1) - f(x) = m(x + 1) + b - (mx + b) = m$. For an exponential function $f(x) = a(b)^x$, going from $x$ to $x + 1$ puts one more factor of $b$ in the product: $\\frac{f(x + 1)}{f(x)} = \\frac{a \\cdot b^{x + 1}}{a \\cdot b^x} = b$. So "same amount added" means linear, and "same factor multiplied" means exponential.' },
    {
      t: 'graph',
      caption: 'Pattern A (a line) and pattern B (an exponential curve). B starts slower but passes A between x = 2 and x = 3.',
      spec: {
        xMin: -1,
        xMax: 5,
        yMin: -2,
        yMax: 36,
        yStep: 4,
        functions: [
          { expr: '4x + 2', label: 'A: y = 4x + 2', color: '#1f8a5b' },
          { expr: '2*2^x', label: 'B: y = 2(2)^x', color: '#d4572f' },
        ],
        points: [
          { x: 0, y: 2, label: '(0, 2)' },
          { x: 2, y: 10, label: '(2, 10)', color: '#1f8a5b' },
          { x: 3, y: 14, label: '(3, 14)', color: '#1f8a5b' },
          { x: 4, y: 18, label: '(4, 18)', color: '#1f8a5b' },
          { x: 2, y: 8, label: '(2, 8)', color: '#d4572f' },
          { x: 3, y: 16, label: '(3, 16)', color: '#d4572f' },
          { x: 4, y: 32, label: '(4, 32)', color: '#d4572f' },
        ],
        ariaLabel: 'A straight line y = 4x + 2 and an exponential curve y = 2 times 2 to the x, both through (0, 2). At x = 2 the line is higher, (2, 10) versus (2, 8). At x = 3 the curve is higher, (3, 16) versus (3, 14), and at x = 4 the curve is far higher, (4, 32) versus (4, 18).',
      },
    },
    { t: 'p', text: 'A line rises by the same amount every step. An exponential curve with growth rises by **more** every step, because each step multiplies a bigger number. That is why an exponential growth pattern always ends up passing a linear one, even if it starts out behind.' },
    { t: 'p', text: '### Decay has a common ratio too' },
    { t: 'p', text: 'The table $80, 40, 20, 10, 5$ (for $x = 0, 1, 2, 3, 4$) has differences $-40, -20, -10, -5$, which are not constant. Its ratios are $\\frac{40}{80} = \\frac{20}{40} = \\frac{10}{20} = \\frac{5}{10} = \\frac{1}{2}$. It is **exponential** with common ratio $\\frac{1}{2}$: exponential **decay**, $y = 80\\left(\\frac{1}{2}\\right)^x$.' },
    { t: 'p', text: '### Neither' },
    { t: 'p', text: 'Some patterns are neither. For $1, 2, 5, 10, 17$ (at $x = 0, 1, 2, 3, 4$) the differences are $1, 3, 5, 7$ and the ratios are $2, 2.5, 2, 1.7$. Neither is constant, so the pattern is neither linear nor exponential. (It is $y = x^2 + 1$, a quadratic.)' },
    { t: 'p', text: '### Check the x-steps first' },
    { t: 'callout', variant: 'warning', title: 'Equal steps in x', text: 'Differences and ratios only mean something when the $x$-values go up by the **same amount** each row. If the steps are uneven, like $x = 0, 2, 3, 5$, either use rows that are equally spaced, or divide each change in $y$ by its change in $x$ (the slope) to test for linear. A table can look like "neither" just because its $x$-steps are uneven.' },
    { t: 'p', text: 'Steps do not have to be $1$; they just have to be **equal**. If $x$ goes $0, 2, 4, 6$, constant differences still mean linear and constant ratios still mean exponential. The common ratio is then the factor for **2** units of $x$, which is $b^2$.' },
    { t: 'p', text: '### Reading the words' },
    {
      t: 'table',
      caption: 'A number "per" step means add it. A percent "per" step means multiply by a factor.',
      headers: ['Description', 'Each step you...', 'Type'],
      rows: [
        ['increases by \\$50 per month', 'add $50$', 'linear'],
        ['increases by $5\\%$ per month', 'multiply by $1.05$', 'exponential (growth)'],
        ['decreases by $20$ points per round', 'add $-20$', 'linear'],
        ['decreases by $20\\%$ per round', 'multiply by $0.8$', 'exponential (decay)'],
        ['doubles every year', 'multiply by $2$', 'exponential (growth)'],
      ],
    },
    { t: 'p', text: '**Why a percent is multiplying:** "$5\\%$ more" means the new amount is $100\\% + 5\\% = 105\\%$ of the old amount, which is $1.05$ times it. Since the old amount keeps getting bigger, $5\\%$ of it keeps getting bigger too, so the amount added is not the same each month.' },
    { t: 'callout', variant: 'realworld', title: 'Where this shows up', text: 'A gym that charges \\$10 more each month is linear. A savings account that earns $4\\%$ interest each year, a video that gets $30\\%$ more views each day, or a phone that loses $15\\%$ of its value each year is exponential.' },
  ],
  examples: [
    {
      title: 'Two tables',
      kind: 'introductory',
      problem: [
        { t: 'p', text: 'Is each table linear, exponential or neither? Give the common difference or common ratio.' },
        {
          t: 'table',
          caption: 'Tables P and Q.',
          headers: ['$x$', '$0$', '$1$', '$2$', '$3$', '$4$'],
          rows: [
            ['P: $y$', '$7$', '$10$', '$13$', '$16$', '$19$'],
            ['Q: $y$', '$3$', '$6$', '$12$', '$24$', '$48$'],
          ],
        },
      ],
      steps: [
        { text: 'Check the $x$-steps.', tex: '0, 1, 2, 3, 4', why: '$x$ goes up by $1$ each time, so the steps are equal and we can compare differences and ratios.' },
        { text: 'Find the first differences of P.', tex: '10 - 7 = 3,\\; 13 - 10 = 3,\\; 16 - 13 = 3,\\; 19 - 16 = 3', why: 'Every difference is $3$, so the same amount is added each step: P is linear.' },
        { text: 'Find the first differences of Q.', tex: '3,\\; 6,\\; 12,\\; 24', why: 'These are not constant, so Q is not linear. Check ratios next.' },
        { text: 'Find the ratios of Q.', tex: '\\frac{6}{3} = \\frac{12}{6} = \\frac{24}{12} = \\frac{48}{24} = 2', why: 'Every output is $2$ times the one before, so Q is exponential with common ratio $2$.' },
      ],
      answer: 'P is linear with common difference $3$ ($y = 3x + 7$). Q is exponential with common ratio $2$ ($y = 3(2)^x$).',
    },
    {
      title: 'Find the pattern, then the next value',
      kind: 'intermediate',
      problem: [
        { t: 'p', text: 'Decide whether the table is linear, exponential or neither. Then find $y$ when $x = 4$ and write an equation.' },
        {
          t: 'table',
          caption: 'A table with one missing value.',
          headers: ['$x$', '$0$', '$1$', '$2$', '$3$', '$4$'],
          rows: [['$y$', '$16$', '$24$', '$36$', '$54$', '?']],
        },
      ],
      steps: [
        { text: 'Try differences.', tex: '24 - 16 = 8,\\; 36 - 24 = 12,\\; 54 - 36 = 18', why: 'The differences change, so the pattern is not linear.' },
        { text: 'Try ratios.', tex: '\\frac{24}{16} = 1.5,\\; \\frac{36}{24} = 1.5,\\; \\frac{54}{36} = 1.5', why: 'The ratios are all $1.5$, so each output is multiplied by $1.5$: exponential growth with $b = 1.5$.' },
        { text: 'Find the next value.', tex: '54 \\times 1.5 = 81', why: 'Exponential means "multiply by the common ratio again," not "add the last difference again."' },
        { text: 'Write the equation.', tex: 'y = 16(1.5)^x', why: 'The value at $x = 0$ is $a = 16$, and the factor per step of $1$ is $b = 1.5$. Check: $16(1.5)^4 = 16 \\times 5.0625 = 81$.' },
      ],
      answer: 'Exponential with common ratio $1.5$; $y = 81$ when $x = 4$; $y = 16(1.5)^x$.',
    },
    {
      title: 'A common mistake: uneven x-steps',
      kind: 'common-mistake',
      problem: [
        { t: 'p', text: 'Devon says this table is **neither** linear nor exponential, because the differences $6, 3, 6$ are not constant. Is he right?' },
        {
          t: 'table',
          caption: 'Notice the x-values.',
          headers: ['$x$', '$0$', '$2$', '$3$', '$5$'],
          rows: [['$y$', '$1$', '$7$', '$10$', '$16$']],
        },
      ],
      steps: [
        { text: 'Check the $x$-steps.', tex: '2 - 0 = 2,\\; 3 - 2 = 1,\\; 5 - 3 = 2', why: 'The steps are $2, 1, 2$, not equal. Differences in $y$ can only be compared directly when the steps in $x$ are equal, and here they are not.' },
        { text: 'Divide each change in $y$ by its change in $x$.', tex: '\\frac{6}{2} = 3,\\; \\frac{3}{1} = 3,\\; \\frac{6}{2} = 3', why: 'This is the slope between each pair of rows. A line has the same slope everywhere.' },
        { text: 'Decide and write the rule.', tex: 'y = 3x + 1', why: 'The rate is a constant $3$ per unit of $x$, and $y = 1$ at $x = 0$. Check: $3(5) + 1 = 16$.' },
      ],
      answer: 'Devon is not right. The table is **linear** with slope $3$: $y = 3x + 1$. The differences looked uneven only because the $x$-steps were uneven.',
    },
    {
      title: 'Two ways to grow followers',
      kind: 'real-world',
      problem: [{ t: 'p', text: 'Two new gaming channels each have $1000$ followers. Channel A gains $300$ followers **per week**. Channel B grows by $20\\%$ **per week**. Which one is linear and which is exponential? Write a model for each, and find the first week when B has more followers than A.' }],
      steps: [
        { text: 'Read the words for A.', tex: 'A(n) = 1000 + 300n', why: '"$300$ per week" means the same number is **added** each week: linear, with a common difference of $300$.' },
        { text: 'Read the words for B.', tex: 'B(n) = 1000(1.2)^n', why: '"$20\\%$ per week" means each week B has $100\\% + 20\\% = 120\\%$ of the week before, so it is **multiplied** by $1.2$: exponential, with a common ratio of $1.2$.' },
        { text: 'Make a table, rounding B to whole followers.', tex: '\\begin{array}{c|ccccccc} n & 0 & 1 & 2 & 3 & 4 & 5 & 6 \\\\ \\hline A & 1000 & 1300 & 1600 & 1900 & 2200 & 2500 & 2800 \\\\ B & 1000 & 1200 & 1440 & 1728 & 2074 & 2488 & 2986 \\end{array}', why: 'Each A value is $300$ more than the last. Each B value is $1.2$ times the last, for example $1440 \\times 1.2 = 1728$.' },
        { text: 'Compare.', why: 'B is behind for weeks 1 through 5 (week 5: $2488 < 2500$) and ahead in week 6 ($2986 > 2800$). B\'s weekly gain started at $200$ but grows every week ($200, 240, 288, \\dots$), while A\'s gain is always $300$.' },
      ],
      answer: 'A is linear, $A(n) = 1000 + 300n$. B is exponential, $B(n) = 1000(1.2)^n$. B first has more followers in **week 6**.',
    },
    {
      title: 'Steps of 2',
      kind: 'challenging',
      problem: [
        { t: 'p', text: 'The table shows an exponential function $f(x) = a(b)^x$. Find $a$, $b$ and $f(1)$.' },
        {
          t: 'table',
          caption: 'The x-values go up by 2.',
          headers: ['$x$', '$0$', '$2$', '$4$', '$6$'],
          rows: [['$f(x)$', '$5$', '$20$', '$80$', '$320$']],
        },
      ],
      steps: [
        { text: 'Check the steps and the ratios.', tex: '\\frac{20}{5} = \\frac{80}{20} = \\frac{320}{80} = 4', why: 'The $x$-steps are all $2$, which is equal, so a constant ratio means exponential. The ratio $4$ is the factor for **2** units of $x$.' },
        { text: 'Turn the 2-step factor into $b$.', tex: 'b^2 = 4 \\;\\Longrightarrow\\; b = 2', why: 'Going up $2$ in $x$ multiplies by $b$ twice, which is $b^2$. For an exponential function $b > 0$, so $b = 2$, not $-2$.' },
        { text: 'Find $a$ and write $f$.', tex: 'a = f(0) = 5, \\quad f(x) = 5(2)^x', why: 'At $x = 0$, $b^0 = 1$, so the output is $a$.' },
        { text: 'Find $f(1)$ and check.', tex: 'f(1) = 5(2)^1 = 10, \\quad f(6) = 5(2)^6 = 5 \\cdot 64 = 320', why: 'Checking a value from the table confirms the equation. The common ratio is not $b$ here, which is the trap: if you used $4$ as the base you would get $5(4)^6 = 20480$, not $320$.' },
      ],
      answer: '$a = 5$, $b = 2$, so $f(x) = 5(2)^x$ and $f(1) = 10$.',
    },
  ],
  teachMeAgain: [
    {
      approach: 'visual',
      title: 'Dots that climb evenly or that take off',
      blocks: [
        { t: 'p', text: 'Plot each table as dots and look at the jumps from dot to dot.' },
        {
          t: 'graph',
          caption: 'Left to right, the linear dots (y = 3x + 1) climb by 3 each time. The exponential dots (y = 2^x) climb by 1, 2, 4, 8, 16.',
          spec: {
            xMin: -1,
            xMax: 6,
            yMin: -2,
            yMax: 34,
            yStep: 4,
            functions: [
              { expr: '3x + 1', label: 'linear: y = 3x + 1', color: '#1f8a5b', dashed: true },
              { expr: '2^x', label: 'exponential: y = 2^x', color: '#d4572f', dashed: true },
            ],
            points: [
              { x: 0, y: 1, label: '(0, 1)' },
              { x: 1, y: 4, color: '#1f8a5b' },
              { x: 2, y: 7, color: '#1f8a5b' },
              { x: 3, y: 10, color: '#1f8a5b' },
              { x: 4, y: 13, color: '#1f8a5b' },
              { x: 5, y: 16, label: '(5, 16)', color: '#1f8a5b' },
              { x: 1, y: 2, color: '#d4572f' },
              { x: 2, y: 4, color: '#d4572f' },
              { x: 3, y: 8, color: '#d4572f' },
              { x: 4, y: 16, color: '#d4572f' },
              { x: 5, y: 32, label: '(5, 32)', color: '#d4572f' },
            ],
            ariaLabel: 'Two sets of dots starting at (0, 1). The linear dots, (1, 4), (2, 7), (3, 10), (4, 13), (5, 16), rise by 3 each step along a straight dashed line. The exponential dots, (1, 2), (2, 4), (3, 8), (4, 16), (5, 32), rise by more each step along a dashed curve that bends upward.',
          },
        },
        { t: 'p', text: 'Equal jumps make a straight line: linear. Jumps that double make a curve that bends up faster and faster: exponential. If you can see the jumps getting bigger by the same **factor**, think ratios.' },
      ],
    },
    {
      approach: 'simpler-example',
      title: 'Two allowance plans',
      blocks: [
        { t: 'p', text: 'Plan 1: you get \\$1 the first week and \\$1 **more** each week after. Plan 2: you get \\$1 the first week and the amount **doubles** each week.' },
        {
          t: 'table',
          caption: 'Weekly allowance under each plan.',
          headers: ['Week', '$1$', '$2$', '$3$', '$4$', '$5$', '$6$'],
          rows: [
            ['Plan 1 (add 1)', '\\$1', '\\$2', '\\$3', '\\$4', '\\$5', '\\$6'],
            ['Plan 2 (double)', '\\$1', '\\$2', '\\$4', '\\$8', '\\$16', '\\$32'],
          ],
        },
        { t: 'p', text: 'Plan 1 adds the same amount: linear, common difference $1$. Plan 2 multiplies by the same amount: exponential, common ratio $2$. Ask yourself: "Did they **add** the same number, or **multiply** by the same number?"' },
      ],
    },
    {
      approach: 'analogy',
      title: 'Stairs and a snowball',
      blocks: [
        { t: 'p', text: 'A linear pattern is like climbing stairs: every step is the same height, no matter how high you already are. That is a constant difference.' },
        { t: 'p', text: 'An exponential pattern is like a snowball rolling downhill: the bigger it is, the more snow it picks up on the next roll. It grows by the same **fraction of itself** each time, such as $20\\%$ bigger. That is a constant ratio.' },
        { t: 'p', text: 'So "gains \\$50 per month" is stairs, and "gains $5\\%$ per month" is a snowball.' },
      ],
    },
    {
      approach: 'prerequisite',
      title: 'Refresher: differences, ratios and factors',
      blocks: [
        { t: 'list', items: [
          '**A difference** is a subtraction: from $12$ to $18$ the difference is $18 - 12 = 6$. From $18$ to $12$ it is $-6$.',
          '**A ratio** is a division: from $12$ to $18$ the ratio is $\\frac{18}{12} = 1.5$, so $18$ is $1.5$ times $12$. From $18$ to $12$ it is $\\frac{12}{18} = \\frac{2}{3}$.',
          '**Percent to factor:** growing by a rate $r$ (written as a decimal) multiplies by $1 + r$ (for $5\\%$, $r = 0.05$, so by $1.05$). Shrinking by a rate $r$ (written as a decimal) multiplies by $1 - r$ (for $20\\%$, $r = 0.2$, so by $0.8$).',
          '**Slope** is the difference in $y$ divided by the difference in $x$. When $x$ goes up by $1$ each row, the slope is just the difference in $y$.',
        ] },
      ],
    },
    {
      approach: 'step-by-step',
      title: 'A checklist for any table',
      blocks: [
        { t: 'p', text: 'Use this on $x = 1, 2, 3, 4$ with $y = 100, 90, 81, 72.9$.' },
        { t: 'list', ordered: true, items: [
          '**Check the $x$-steps.** $1, 2, 3, 4$: all steps are $1$. Equal, so keep going.',
          '**Find the differences.** $-10, -9, -8.1$. Not constant, so not linear.',
          '**Find the ratios.** $\\frac{90}{100} = 0.9$, $\\frac{81}{90} = 0.9$, $\\frac{72.9}{81} = 0.9$. Constant!',
          '**Decide.** Constant ratio $0.9$: exponential decay, losing $10\\%$ each step.',
          '**If neither was constant,** the answer is "neither."',
        ] },
      ],
    },
    {
      approach: 'alternate-strategy',
      title: 'The differences grow by the same factor',
      blocks: [
        { t: 'p', text: 'Here is another way to spot an exponential pattern: find the first differences, then check whether they grow by the same factor. For $y = 3^x$ at $x = 0, 1, 2, 3, 4$:' },
        {
          t: 'table',
          caption: 'For an exponential pattern, the first differences are themselves multiplied by b each step.',
          headers: ['$x$', '$0$', '$1$', '$2$', '$3$', '$4$'],
          rows: [
            ['$y = 3^x$', '$1$', '$3$', '$9$', '$27$', '$81$'],
            ['first differences', '', '$2$', '$6$', '$18$', '$54$'],
          ],
        },
        { t: 'p', text: 'Each difference is $3$ times the one before ($\\frac{6}{2} = \\frac{18}{6} = \\frac{54}{18} = 3$), so the differences grow by the same factor as the original pattern. That always happens for $y = a(b)^x$: the jump from $x$ to $x + 1$ is $a \\cdot b^x(b - 1)$, which is multiplied by $b$ each step. A linear pattern has differences that do not change at all.' },
      ],
    },
  ],
  guided: [
    { generator: 'u6.linear-or-exp', difficulty: 1 },
    { generator: 'u6.linear-or-exp', difficulty: 1 },
    { generator: 'u6.linear-or-exp', difficulty: 1 },
    { generator: 'u6.linear-or-exp', difficulty: 2 },
  ],
  independent: {
    count: 8,
    reviewCount: 2,
    mix: [
      { generator: 'u6.linear-or-exp', difficulty: 1, weight: 1 },
      { generator: 'u6.linear-or-exp', difficulty: 2, weight: 2 },
      { generator: 'u6.linear-or-exp', difficulty: 3, weight: 1 },
    ],
  },
  quiz: {
    items: [
      { generator: 'u6.linear-or-exp', difficulty: 1 },
      { generator: 'u6.linear-or-exp', difficulty: 2 },
      { generator: 'u6.linear-or-exp', difficulty: 2 },
      { generator: 'u6.linear-or-exp', difficulty: 2 },
      { generator: 'u6.linear-or-exp', difficulty: 3 },
      { generator: 'u6.linear-or-exp', difficulty: 3 },
    ],
  },
  summary: [
    'First check that the $x$-values go up in **equal steps**.',
    'Constant first differences (the same amount **added** each step) mean the pattern is **linear**.',
    'Constant ratios (the same factor **multiplied** each step) mean the pattern is **exponential**; for steps of $1$, the ratio is the base $b$.',
    'If neither the differences nor the ratios are constant, the pattern is neither linear nor exponential.',
    '"Increases by \\$50 per month" is linear; "increases by $5\\%$ per month" multiplies by $1.05$ each month, so it is exponential, and exponential growth eventually passes any linear growth.',
  ],
  mastery: { quizPassScore: 0.8, practiceMinCorrect: 5 },
};
