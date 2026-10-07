import type { LessonContent } from '../../../core/curriculum/types';

/**
 * U5L02 Interpreting Exponential Expressions (A.PAR.8.1, A.MM.1.5)
 * The parts of y = a(b)^x: the initial value a (the value at x = 0, the y-intercept, because b^0 = 1) and the
 * growth factor (b > 1) or decay factor (0 < b < 1) that multiplies the output each time x goes up by 1;
 * converting between a factor and a percent rate with b = 1 + r and b = 1 - r; explaining each part of a model
 * in context with units; reading a and b from a table or graph (S5.02).
 *
 * Math verified by hand (2026-10-07): every table value and graph point was recomputed by substitution
 * (2(2)^x: 2, 4, 8, 16; 16(0.5)^x: 16, 8, 4, 2, 1; 80(0.75)^x: 80, 60, 45, 33.75; 400(1.5)^x: 400, 600, 900,
 * 1350), every ratio of consecutive outputs was rechecked, every factor/percent conversion was redone with
 * b = 1 + r or b = 1 - r, and the context values (24000(0.85) = 20400, 24000(0.85)^2 = 17340,
 * 2400(1.03) = 2472, 1.2^2 = 1.44, 1.2^4 = 2.0736, 1500(1.2)^4 = 3110.4) were recomputed.
 */
export const U5L02: LessonContent = {
  lessonId: 'U5L02',
  goal: 'Identify the initial value $a$ and the growth or decay factor $b$ in an exponential expression $a(b)^x$, convert between a factor and a percent rate (like $1.08$ and $8\\%$ growth), and explain what each part of a model means in a real situation, with units.',
  needToKnow: [
    { t: 'p', text: 'This lesson uses three ideas you already have:' },
    {
      t: 'list',
      items: [
        '**Exponent rules (last lesson).** $b^0 = 1$ for any nonzero $b$, and $b^3 = b \\cdot b \\cdot b$, so the exponent counts how many times you multiply by $b$.',
        '**Parts of an expression (Unit 4).** You named the terms, coefficients and factors of expressions like $-16t^2 + 64t$ and explained what each part meant in context. Now you will do the same for $a(b)^x$, which is a product of two factors: $a$ and $b^x$.',
        '**Percents as decimals.** $8\\% = 0.08$, $25\\% = 0.25$, $100\\% = 1$.',
      ],
    },
    { t: 'callout', variant: 'tip', title: 'Quick check', text: 'What is $7^0$? Write $15\\%$ as a decimal. (You should get $1$ and $0.15$.) If those felt shaky, open **Teach Me Again** and choose the refresher.' },
  ],
  vocabulary: [
    { term: 'exponential function', meaning: 'A function of the form $y = a(b)^x$ with $a \\ne 0$, $b > 0$ and $b \\ne 1$. The variable is in the **exponent**.' },
    { term: 'initial value', meaning: 'The value of $a$: the output when $x = 0$, which is the $y$-intercept $(0, a)$ of the graph.' },
    { term: 'growth factor', meaning: 'The base $b$ when $b > 1$. Each time $x$ goes up by $1$, the output is multiplied by $b$ and gets bigger.' },
    { term: 'decay factor', meaning: 'The base $b$ when $0 < b < 1$. Each time $x$ goes up by $1$, the output is multiplied by $b$ and gets smaller.' },
    { term: 'percent rate of change', meaning: 'The percent $r$ the output grows or shrinks each step. Growth: $b = 1 + r$. Decay: $b = 1 - r$.' },
  ],
  instruction: [
    { t: 'p', text: '### The two parts of $a(b)^x$' },
    { t: 'p', text: 'An **exponential function** can be written' },
    { t: 'math', tex: 'y = a(b)^x \\qquad \\begin{aligned} a &= \\text{initial value} \\\\ b &= \\text{growth or decay factor} \\end{aligned}' },
    { t: 'p', text: '**Why $a$ is the initial value:** at $x = 0$, $y = a(b)^0 = a \\cdot 1 = a$. So $a$ is the starting amount and the graph crosses the $y$-axis at $(0, a)$.' },
    { t: 'p', text: '**Why $b$ is the factor:** raising $x$ by $1$ puts one more factor of $b$ into the product. So every time $x$ goes up by $1$, the output is **multiplied by $b$**. Here is $y = 3(2)^x$:' },
    {
      t: 'table',
      caption: 'Each output of y = 3(2)^x is 2 times the one before. The starting value at x = 0 is 3.',
      headers: ['$x$', '$0$', '$1$', '$2$', '$3$', '$4$'],
      rows: [
        ['$y = 3(2)^x$', '$3$', '$6$', '$12$', '$24$', '$48$'],
        ['How it was made', '$3$', '$3 \\cdot 2$', '$3 \\cdot 2 \\cdot 2$', '$3 \\cdot 2 \\cdot 2 \\cdot 2$', '$3 \\cdot 2 \\cdot 2 \\cdot 2 \\cdot 2$'],
      ],
    },
    { t: 'p', text: 'Compare that with a linear function, which **adds** the same amount each step. An exponential function **multiplies** by the same factor each step.' },
    { t: 'p', text: '### Growth or decay?' },
    { t: 'list', items: [
      'If $b > 1$, multiplying by $b$ makes the output bigger every step: **exponential growth**, and $b$ is the **growth factor**.',
      'If $0 < b < 1$, multiplying by $b$ makes the output smaller every step: **exponential decay**, and $b$ is the **decay factor**.',
      'If $b = 1$, nothing changes, so it is not exponential at all.',
    ] },
    {
      t: 'graph',
      caption: 'Growth: y = 2(2)^x starts at 2 and doubles. Decay: y = 16(0.5)^x starts at 16 and is cut in half each step.',
      spec: {
        xMin: -1,
        xMax: 5,
        yMin: -1,
        yMax: 18,
        yStep: 2,
        xLabel: 'x',
        yLabel: 'y',
        functions: [
          { expr: '2*2^x', label: 'growth: y = 2(2)^x', color: '#1f8a5b' },
          { expr: '16*(0.5)^x', label: 'decay: y = 16(0.5)^x', color: '#d4572f' },
        ],
        points: [
          { x: 0, y: 2, label: '(0, 2)', color: '#1f8a5b' },
          { x: 1, y: 4, label: '(1, 4)', color: '#1f8a5b' },
          { x: 2, y: 8, label: '(2, 8)', color: '#1f8a5b' },
          { x: 3, y: 16, label: '(3, 16)', color: '#1f8a5b' },
          { x: 0, y: 16, label: '(0, 16)', color: '#d4572f' },
          { x: 1, y: 8, label: '(1, 8)', color: '#d4572f' },
          { x: 2, y: 4, label: '(2, 4)', color: '#d4572f' },
          { x: 4, y: 1, label: '(4, 1)', color: '#d4572f' },
        ],
        ariaLabel: 'Two curves. The growth curve y = 2 times 2 to the x passes through (0, 2), (1, 4), (2, 8) and (3, 16) and rises faster and faster. The decay curve y = 16 times 0.5 to the x passes through (0, 16), (1, 8), (2, 4) and (4, 1) and falls toward the x-axis without reaching it.',
      },
    },
    { t: 'p', text: 'Each curve crosses the $y$-axis at its initial value: $(0, 2)$ and $(0, 16)$. The growth curve rises faster and faster. The decay curve drops quickly at first, then levels off toward the $x$-axis, because half of a small amount is an even smaller amount, but never $0$.' },
    { t: 'p', text: '### From factor to percent, and back' },
    { t: 'p', text: 'Growing by $8\\%$ means you keep the whole amount ($100\\%$) **and** add $8\\%$ more: $100\\% + 8\\% = 108\\%$, which is a factor of $1.08$. Shrinking by $25\\%$ means you keep $100\\% - 25\\% = 75\\%$, a factor of $0.75$.' },
    { t: 'math', tex: '\\text{growth: } b = 1 + r \\qquad \\text{decay: } b = 1 - r' },
    {
      t: 'table',
      caption: 'Converting between the factor b and the percent rate r.',
      headers: ['Factor $b$', 'Growth or decay', 'Rate $r$', 'In words'],
      rows: [
        ['$1.08$', 'growth', '$1.08 - 1 = 0.08$', 'grows $8\\%$ each step'],
        ['$1.5$', 'growth', '$1.5 - 1 = 0.5$', 'grows $50\\%$ each step'],
        ['$2$', 'growth', '$2 - 1 = 1$', 'grows $100\\%$ each step (doubles)'],
        ['$0.75$', 'decay', '$1 - 0.75 = 0.25$', 'decreases $25\\%$ each step'],
        ['$0.88$', 'decay', '$1 - 0.88 = 0.12$', 'decreases $12\\%$ each step'],
        ['$0.5$', 'decay', '$1 - 0.5 = 0.5$', 'decreases $50\\%$ each step (halves)'],
      ],
    },
    { t: 'callout', variant: 'warning', title: 'The factor is not the percent', text: 'In $V = 24{,}000(0.85)^t$, the value does **not** lose $85\\%$ each year. It **keeps** $85\\%$ and loses $1 - 0.85 = 0.15$, or $15\\%$. In the same way, a factor of $2$ is $100\\%$ growth, not $2\\%$ growth.' },
    { t: 'p', text: '### Every part has a meaning, with units' },
    { t: 'p', text: 'A town has $2{,}400$ people, and its population is modeled by $P(t) = 2400(1.03)^t$, where $t$ is the number of years from now.' },
    {
      t: 'table',
      caption: 'Interpreting each part of P(t) = 2400(1.03)^t in context.',
      headers: ['Part', 'What it is', 'Meaning in context'],
      rows: [
        ['$2400$', 'initial value $a$', 'There are $2{,}400$ people now, at $t = 0$ years.'],
        ['$1.03$', 'growth factor $b$', 'Each year the population is multiplied by $1.03$: it is $103\\%$ of the year before.'],
        ['$0.03$', 'percent rate $r$', 'The population grows $3\\%$ per year.'],
        ['$t$', 'exponent', 'The number of years, so the number of times the population has been multiplied by $1.03$.'],
        ['$P(t)$', 'output', 'The number of people after $t$ years. For example, $P(1) = 2400(1.03) = 2472$ people.'],
      ],
    },
    { t: 'callout', variant: 'why', title: 'Why the units of x matter', text: 'The factor $b$ is **per unit of $x$**. If $t$ is in years, $1.03$ is the change per year. If a model used months instead, the same $3\\%$ would mean $3\\%$ per month, which is a very different town. Always say "per year," "per hour" or "per day."' },
    { t: 'callout', variant: 'realworld', title: 'Where this shows up', text: 'Savings accounts and loans grow by a percent each year, a new car loses a percent of its value each year, medicine leaves your bloodstream by a percent each hour, and a viral post can gain a percent more views each day. Each one is $a(b)^x$.' },
  ],
  examples: [
    {
      title: 'Name the parts',
      kind: 'introductory',
      problem: [{ t: 'p', text: 'For each function, give the initial value and the factor, and say whether it shows growth or decay: (a) $y = 5(3)^x$, (b) $y = 80(0.25)^x$.' }],
      steps: [
        { text: '(a) Read $a$ and $b$ from $a(b)^x$.', tex: 'a = 5, \\quad b = 3', why: 'The number in front is $a$; the base of the exponent is $b$.' },
        { text: 'Decide growth or decay.', tex: '3 > 1 \\;\\Rightarrow\\; \\text{growth}', why: 'Multiplying by $3$ makes the output bigger each step: $5, 15, 45, \\dots$' },
        { text: '(b) Read $a$ and $b$.', tex: 'a = 80, \\quad b = 0.25', why: 'Same form, so same reading.' },
        { text: 'Decide growth or decay.', tex: '0 < 0.25 < 1 \\;\\Rightarrow\\; \\text{decay}', why: 'Multiplying by $0.25$ makes the output smaller each step: $80, 20, 5, \\dots$' },
      ],
      answer: '(a) Initial value $5$, growth factor $3$, growth. (b) Initial value $80$, decay factor $0.25$, decay.',
    },
    {
      title: 'Factors and percents',
      kind: 'intermediate',
      problem: [{ t: 'p', text: '(a) What percent rate does a factor of $1.045$ give? (b) What percent rate does a factor of $0.6$ give? (c) A phone battery loses $12\\%$ of its charge each hour. What is the decay factor?' }],
      steps: [
        { text: '(a) $1.045 > 1$, so it is growth. Use $b = 1 + r$.', tex: 'r = 1.045 - 1 = 0.045 = 4.5\\%', why: 'The $1$ is the original $100\\%$ you keep. Whatever is beyond $1$ is the growth.' },
        { text: '(b) $0.6 < 1$, so it is decay. Use $b = 1 - r$.', tex: 'r = 1 - 0.6 = 0.4 = 40\\%', why: 'Keeping $60\\%$ means losing $40\\%$. The factor tells you what is **left**, not what is lost.' },
        { text: '(c) Losing $12\\%$ means keeping $88\\%$.', tex: 'b = 1 - 0.12 = 0.88', why: 'Each hour the charge is multiplied by what remains: $100\\% - 12\\% = 88\\%$.' },
      ],
      answer: '(a) $4.5\\%$ growth; (b) $40\\%$ decay; (c) $b = 0.88$.',
    },
    {
      title: 'Read a and b from a graph',
      kind: 'intermediate',
      problem: [
        { t: 'p', text: 'The graph shows an exponential function through the labeled points. Find the initial value and the factor, and describe the percent rate.' },
        {
          t: 'graph',
          caption: 'An exponential function through (0, 80), (1, 60) and (2, 45).',
          spec: {
            xMin: -1,
            xMax: 6,
            yMin: -5,
            yMax: 90,
            yStep: 10,
            functions: [{ expr: '80*(0.75)^x', label: 'y = f(x)' }],
            points: [
              { x: 0, y: 80, label: '(0, 80)' },
              { x: 1, y: 60, label: '(1, 60)' },
              { x: 2, y: 45, label: '(2, 45)' },
            ],
            ariaLabel: 'A decreasing curve that crosses the y-axis at (0, 80) and passes through (1, 60) and (2, 45), leveling off toward the x-axis.',
          },
        },
      ],
      steps: [
        { text: 'The initial value is the $y$-intercept.', tex: 'a = 80', why: 'At $x = 0$ the output is $a(b)^0 = a$, and the graph shows $(0, 80)$.' },
        { text: 'Divide one output by the one before it.', tex: '\\frac{60}{80} = 0.75, \\qquad \\frac{45}{60} = 0.75', why: 'Each step multiplies by $b$, so the ratio of consecutive outputs is $b$. Checking two ratios confirms it is constant.' },
        { text: 'Convert to a percent.', tex: '0.75 < 1, \\quad r = 1 - 0.75 = 0.25 = 25\\%', why: 'A factor less than $1$ is decay, so use $b = 1 - r$.' },
        { text: 'Write the function.', tex: 'y = 80(0.75)^x', why: 'Putting $a$ and $b$ into $a(b)^x$. Next would be $45(0.75) = 33.75$ at $x = 3$.' },
      ],
      answer: 'Initial value $80$, decay factor $0.75$: the output decreases $25\\%$ each time $x$ increases by $1$. The function is $y = 80(0.75)^x$.',
    },
    {
      title: 'Three claims that are wrong',
      kind: 'common-mistake',
      problem: [
        { t: 'p', text: 'Each student made a mistake. Find and fix it.' },
        { t: 'list', items: [
          'Ava: "$y = 50(2)^x$ grows by $2\\%$ each step."',
          'Ben: "$y = 1200(0.6)^x$ decreases by $60\\%$ each step."',
          'Cam: "$y = 8(1.25)^x$ starts at $1.25$."',
        ] },
      ],
      steps: [
        { text: 'Fix Ava\'s rate.', tex: 'b = 2 = 1 + r \\;\\Rightarrow\\; r = 1 = 100\\%', why: 'A factor of $2$ means the output doubles: $50, 100, 200$. Going from $50$ to $100$ is an increase of $50$, which is $100\\%$ of $50$. Growing $2\\%$ would be a factor of $1.02$.' },
        { text: 'Fix Ben\'s rate.', tex: 'b = 0.6 = 1 - r \\;\\Rightarrow\\; r = 0.4 = 40\\%', why: 'Multiplying by $0.6$ keeps $60\\%$, so it loses $40\\%$: $1200 \\cdot 0.6 = 720$, a drop of $480$, and $\\frac{480}{1200} = 0.4$.' },
        { text: 'Fix Cam\'s starting value.', tex: 'x = 0: \\quad 8(1.25)^0 = 8 \\cdot 1 = 8', why: 'The initial value is the number in front, $a$. The base $1.25$ is the growth factor ($25\\%$ growth per step).' },
      ],
      answer: 'Ava: $100\\%$ growth (doubling), not $2\\%$. Ben: $40\\%$ decrease, not $60\\%$. Cam: it starts at $8$; $1.25$ is the growth factor.',
    },
    {
      title: 'What is the car worth?',
      kind: 'real-world',
      problem: [{ t: 'p', text: 'Destiny\'s family buys a new car. Its value in dollars $t$ years after they buy it is modeled by $V(t) = 24000(0.85)^t$. (a) What does $24000$ mean? (b) What does $0.85$ mean, and what is the percent rate? (c) Find $V(2)$ and explain it.' }],
      steps: [
        { text: '(a) $24000$ is the initial value.', tex: 'V(0) = 24000(0.85)^0 = 24000', why: 'At $t = 0$, the day they buy it, the car is worth \\$24,000. The units come from the output: dollars.' },
        { text: '(b) $0.85$ is the decay factor.', tex: 'r = 1 - 0.85 = 0.15 = 15\\%', why: 'Each year the value is multiplied by $0.85$, so the car keeps $85\\%$ of its value and **loses $15\\%$** per year. It is decay because $0.85 < 1$.' },
        { text: '(c) Evaluate at $t = 2$.', tex: 'V(2) = 24000(0.85)^2 = 24000(0.7225) = 17340', why: 'Two years means multiplying by $0.85$ twice: $24000 \\to 20400 \\to 17340$. Exponents come before multiplying by $24000$.' },
        { text: 'Interpret with units.', why: '$V(2) = 17340$ means two years after the purchase, the car is worth \\$17,340.' },
      ],
      answer: '(a) The car is worth \\$24,000 when new. (b) Each year it keeps $85\\%$ of its value, so it loses $15\\%$ per year. (c) $V(2) = 17{,}340$: after $2$ years it is worth \\$17,340.',
    },
    {
      title: 'A post goes viral',
      kind: 'challenging',
      problem: [{ t: 'p', text: 'The number of views of a video $d$ days after it is first counted is $V(d) = 1500(1.2)^d$. (a) Interpret $1500$ and $1.2$ with units. (b) Kiara says, "It grows $20\\%$ a day, so after $2$ days it has grown $40\\%$." Is she right? (c) Has the view count more than doubled after $4$ days?' }],
      steps: [
        { text: '(a) Read the parts.', tex: 'a = 1500, \\quad b = 1.2 = 1 + 0.2', why: 'At $d = 0$ the video has $1{,}500$ views. Each day the views are multiplied by $1.2$, a growth of $20\\%$ per day.' },
        { text: '(b) Two days means multiplying by $1.2$ twice.', tex: '(1.2)^2 = 1.44 = 1 + 0.44', why: 'The second day\'s $20\\%$ is taken of a bigger number, so the growth compounds. Over two days the views grow $44\\%$, not $40\\%$: $1500 \\to 1800 \\to 2160$, and $\\frac{2160}{1500} = 1.44$.' },
        { text: '(c) Four days means multiplying by $1.2$ four times.', tex: '(1.2)^4 = (1.44)^2 = 2.0736', why: 'The total factor is a little more than $2$, so the views have a little more than doubled: $1500(2.0736) = 3110.4$, about $3{,}110$ views.' },
      ],
      answer: '(a) $1{,}500$ views at the start; views grow $20\\%$ per day. (b) No: the 2-day factor is $1.44$, so $44\\%$ growth. (c) Yes, just barely: the 4-day factor is about $2.07$, about $3{,}110$ views.',
    },
  ],
  teachMeAgain: [
    {
      approach: 'visual',
      title: 'Up the ladder or down the ladder',
      blocks: [
        { t: 'p', text: 'Picture each step of $x$ as a rung. Growth multiplies by more than $1$ at every rung; decay multiplies by less than $1$.' },
        {
          t: 'table',
          caption: 'Same starting value, two different factors.',
          headers: ['$x$', '$0$', '$1$', '$2$', '$3$'],
          rows: [
            ['$y = 400(1.5)^x$ (growth)', '$400$', '$600$', '$900$', '$1350$'],
            ['$y = 400(0.5)^x$ (decay)', '$400$', '$200$', '$100$', '$50$'],
          ],
        },
        {
          t: 'graph',
          caption: 'Both curves start at (0, 400). The factor 1.5 bends the curve up; the factor 0.5 bends it down.',
          spec: {
            xMin: -1,
            xMax: 4,
            yMin: -50,
            yMax: 1500,
            yStep: 100,
            functions: [
              { expr: '400*(1.5)^x', label: 'y = 400(1.5)^x', color: '#1f8a5b' },
              { expr: '400*(0.5)^x', label: 'y = 400(0.5)^x', color: '#d4572f' },
            ],
            points: [
              { x: 0, y: 400, label: '(0, 400)' },
              { x: 1, y: 600, label: '(1, 600)', color: '#1f8a5b' },
              { x: 3, y: 1350, label: '(3, 1350)', color: '#1f8a5b' },
              { x: 1, y: 200, label: '(1, 200)', color: '#d4572f' },
              { x: 3, y: 50, label: '(3, 50)', color: '#d4572f' },
            ],
            ariaLabel: 'Two curves both starting at (0, 400). The growth curve rises through (1, 600) and (3, 1350). The decay curve falls through (1, 200) and (3, 50).',
          },
        },
        { t: 'p', text: 'The shared point $(0, 400)$ is the initial value. The factor decides which way the curve goes.' },
      ],
    },
    {
      approach: 'simpler-example',
      title: 'A penny that doubles',
      blocks: [
        { t: 'p', text: 'You start with $1$ penny and it doubles every day: $y = 1(2)^x$.' },
        { t: 'list', items: [
          'Day $0$: $1$ penny. That is $a = 1$, the start.',
          'Day $1$: $2$. Day $2$: $4$. Day $3$: $8$. Each day multiplies by $2$, so $b = 2$.',
          'Doubling means adding $100\\%$ of what you had: from $4$ to $8$ you added $4$, which is all of $4$. So $b = 2$ is $100\\%$ growth.',
        ] },
        { t: 'p', text: 'Now start with $64$ pennies and lose half each day: $y = 64(0.5)^x$ gives $64, 32, 16, 8$. The factor $0.5$ means you keep $50\\%$ and lose $50\\%$ each day.' },
      ],
    },
    {
      approach: 'analogy',
      title: 'Sales and sales tax',
      blocks: [
        { t: 'p', text: 'You already multiply by factors at the store.' },
        { t: 'list', items: [
          'A shirt is $15\\%$ off. You **pay** $85\\%$ of the price, so you multiply by $0.85$. That is a decay factor: $b = 1 - 0.15$.',
          'Sales tax is $8\\%$. You pay the price **plus** $8\\%$, which is $108\\%$, so you multiply by $1.08$. That is a growth factor: $b = 1 + 0.08$.',
        ] },
        { t: 'p', text: 'An exponential model is just that same multiplication happening again and again: a car that is "$15\\%$ off" every single year is $24000(0.85)^t$.' },
      ],
    },
    {
      approach: 'prerequisite',
      title: 'Refresher: percents, decimals and the zero exponent',
      blocks: [
        { t: 'p', text: 'To change a percent to a decimal, divide by $100$ (move the decimal point two places left): $8\\% = 0.08$, $45\\% = 0.45$, $4.5\\% = 0.045$, $100\\% = 1$.' },
        { t: 'p', text: 'To change a decimal to a percent, multiply by $100$: $0.15 = 15\\%$, $0.5 = 50\\%$, $1 = 100\\%$.' },
        { t: 'p', text: 'From last lesson, $b^0 = 1$ for any nonzero $b$. That is why $a(b)^0 = a$: the initial value is the number in front.' },
        { t: 'p', text: 'And from Unit 4: in $a(b)^x$, $a$ and $b^x$ are **factors** of a product, just like $3$ and $x^2$ are factors of $3x^2$. Each factor has its own job.' },
      ],
    },
    {
      approach: 'step-by-step',
      title: 'Four questions to ask about any model',
      blocks: [
        { t: 'p', text: 'Take $A(t) = 650(0.92)^t$, where $A$ is the amount of a medicine in milligrams in the body $t$ hours after a dose.' },
        { t: 'list', ordered: true, items: [
          '**What is $a$?** $650$. At $t = 0$ there are $650$ mg in the body.',
          '**What is $b$?** $0.92$. Each hour the amount is multiplied by $0.92$.',
          '**Growth or decay?** $0.92 < 1$, so decay.',
          '**What percent, per what?** $r = 1 - 0.92 = 0.08$: the amount decreases $8\\%$ **per hour**.',
        ] },
      ],
    },
    {
      approach: 'alternate-strategy',
      title: 'Use a table and the ratios',
      blocks: [
        { t: 'p', text: 'If you are not sure which number is which, make a table and look at it.' },
        {
          t: 'table',
          caption: 'Outputs of y = 200(1.1)^x.',
          headers: ['$x$', '$0$', '$1$', '$2$'],
          rows: [['$y$', '$200$', '$220$', '$242$']],
        },
        { t: 'list', items: [
          'The output at $x = 0$ is $200$: that is the initial value.',
          'Divide each output by the one before: $\\frac{220}{200} = 1.1$ and $\\frac{242}{220} = 1.1$. That ratio is the factor.',
          'From $200$ to $220$ is an increase of $20$, and $\\frac{20}{200} = 0.1 = 10\\%$. That matches $1.1 = 1 + 0.10$.',
        ] },
      ],
    },
  ],
  guided: [
    { generator: 'u5.interpret-exponential', difficulty: 1 },
    { generator: 'u5.interpret-exponential', difficulty: 1 },
    { generator: 'u5.interpret-exponential', difficulty: 2 },
    { generator: 'u5.interpret-exponential', difficulty: 3 },
  ],
  independent: {
    count: 8,
    reviewCount: 2,
    mix: [
      { generator: 'u5.interpret-exponential', difficulty: 1, weight: 1 },
      { generator: 'u5.interpret-exponential', difficulty: 2, weight: 2 },
      { generator: 'u5.interpret-exponential', difficulty: 3, weight: 2 },
    ],
  },
  quiz: {
    items: [
      { generator: 'u5.interpret-exponential', difficulty: 1 },
      { generator: 'u5.interpret-exponential', difficulty: 2 },
      { generator: 'u5.interpret-exponential', difficulty: 2 },
      { generator: 'u5.interpret-exponential', difficulty: 2 },
      { generator: 'u5.interpret-exponential', difficulty: 3 },
      { generator: 'u5.interpret-exponential', difficulty: 3 },
    ],
  },
  summary: [
    'In $y = a(b)^x$, $a$ is the initial value: the output at $x = 0$ and the $y$-intercept, because $b^0 = 1$.',
    'Each time $x$ goes up by $1$, the output is multiplied by $b$. If $b > 1$ it is growth; if $0 < b < 1$ it is decay.',
    'Growth rate: $b = 1 + r$, so $1.08$ means $8\\%$ growth. Decay rate: $b = 1 - r$, so $0.85$ means $15\\%$ decay, not $85\\%$. A factor of $2$ is $100\\%$ growth.',
    'In context, give every part its units: $V(t) = 24000(0.85)^t$ means the car is worth \\$24,000 new and loses $15\\%$ of its value per year.',
  ],
  mastery: { quizPassScore: 0.8, practiceMinCorrect: 5 },
};
