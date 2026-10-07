import type { LessonContent } from '../../../core/curriculum/types';

/**
 * U6L05 Average Rate of Change of Exponential Functions (A.FGR.9.2)
 * The average rate of change (f(x_2) - f(x_1))/(x_2 - x_1) of an exponential function from an equation, a table and a
 * graph, as the slope of a secant line; why the rate keeps growing over equal intervals for growth (each later
 * interval of length 1 has a rate b times the one before) and why its size shrinks toward 0 for decay; units
 * such as bacteria per hour and dollars per year; the rate is not the growth factor or the ratio (S6.05).
 *
 * Math verified by hand (2026-10-07): every function value was recomputed by substitution (3(2)^x: 3, 6, 12,
 * 24, 48; 64(0.5)^x: 64, 32, 16, 8, 4; 20000(0.8)^t: 20000, 16000, 12800, 10240; 2(3)^x: 2, 6, 18, 54, 162;
 * 32(0.5)^x: 32, 16, 8, 4, 2; 4(2)^x: 8 and 32 at x = 1 and 3; 500(2)^t: 500, 2000, 8000), every average rate
 * was recomputed as (f(x_2) - f(x_1))/(x_2 - x_1) and checked against the length-1 shortcut f(x)(b - 1) or the
 * factor b^d between intervals shifted by d, and every graph point and secant endpoint was checked to lie on
 * its curve and inside its window.
 */
export const U6L05: LessonContent = {
  lessonId: 'U6L05',
  goal: 'Find the average rate of change of an exponential function over an interval, $\\frac{f(x_2) - f(x_1)}{x_2 - x_1}$, from an equation, a table or a graph, give it with units, and explain why, for exponential growth, the rate keeps getting bigger over equal intervals.',
  needToKnow: [
    { t: 'p', text: 'In Unit 4 you found the **average rate of change** of a quadratic. The formula works for any function:' },
    { t: 'math', tex: '\\text{average rate of change on } [x_1, x_2] = \\frac{f(x_2) - f(x_1)}{x_2 - x_1}' },
    { t: 'p', text: 'You also know how to evaluate an exponential function: if $f(x) = 3(2)^x$, then $f(3) = 3 \\cdot 8 = 24$. Remember to do the power **before** multiplying by $3$.' },
    { t: 'callout', variant: 'tip', title: 'Quick check', text: 'Find the average rate of change of $f(x) = x^2$ on $[1, 3]$. (You should get $\\frac{9 - 1}{3 - 1} = 4$.) If that felt shaky, open **Teach Me Again** and choose the refresher.' },
  ],
  vocabulary: [
    { term: 'average rate of change', meaning: 'The change in output divided by the change in input over an interval: $\\frac{f(x_2) - f(x_1)}{x_2 - x_1}$. It is how much the output changes per unit of input, on average.' },
    { term: 'secant line', meaning: 'The straight line through two points on a curve. Its slope is the average rate of change between those points.' },
    { term: 'equal intervals', meaning: 'Intervals of the same length, like $[0, 1]$, $[1, 2]$, $[2, 3]$ or $[0, 2]$, $[2, 4]$. Rates are only fair to compare on equal intervals.' },
    { term: 'growth factor', meaning: 'The base $b$ in $a(b)^x$ when $b > 1$. It tells you what the output is **multiplied** by each step. It is not the same thing as the rate of change.' },
    { term: 'units of a rate', meaning: 'Output units per input unit, such as bacteria per hour or dollars per year.' },
  ],
  instruction: [
    { t: 'p', text: '### Same formula, new kind of function' },
    { t: 'p', text: 'For $f(x) = 2^x$ on the interval $[1, 3]$:' },
    { t: 'math', tex: '\\frac{f(3) - f(1)}{3 - 1} = \\frac{8 - 2}{2} = \\frac{6}{2} = 3' },
    { t: 'p', text: 'On average, $f$ goes up $3$ for each $1$ that $x$ increases between $x = 1$ and $x = 3$. Notice that the rate, $3$, is **not** the base, $2$. The base tells you what you **multiply** by; the rate tells you how much you **add**, on average, per unit.' },
    { t: 'p', text: '### The rate keeps growing' },
    { t: 'p', text: 'Here is $f(x) = 3(2)^x$ on four intervals of length $1$, next to the linear function $g(x) = 10x + 3$:' },
    {
      t: 'table',
      caption: 'Average rates of change on intervals of length 1. The linear rate never changes; the exponential rate doubles each time.',
      headers: ['Interval', 'Rate of $f(x) = 3(2)^x$', 'Rate of $g(x) = 10x + 3$'],
      rows: [
        ['$[0, 1]$', '$\\frac{6 - 3}{1} = 3$', '$10$'],
        ['$[1, 2]$', '$\\frac{12 - 6}{1} = 6$', '$10$'],
        ['$[2, 3]$', '$\\frac{24 - 12}{1} = 12$', '$10$'],
        ['$[3, 4]$', '$\\frac{48 - 24}{1} = 24$', '$10$'],
      ],
    },
    {
      t: 'graph',
      caption: 'Secant lines of f(x) = 3(2)^x on [0, 1], [1, 2] and [2, 3]. Each one is twice as steep as the one before.',
      spec: {
        xMin: -1,
        xMax: 4,
        yMin: -2,
        yMax: 28,
        yStep: 4,
        functions: [{ expr: '3*2^x', label: 'f(x) = 3(2)^x' }],
        segments: [
          { x1: 0, y1: 3, x2: 1, y2: 6, color: '#d4572f', label: 'slope 3' },
          { x1: 1, y1: 6, x2: 2, y2: 12, color: '#1f8a5b', label: 'slope 6' },
          { x1: 2, y1: 12, x2: 3, y2: 24, color: '#8a3fbf', label: 'slope 12' },
        ],
        points: [
          { x: 0, y: 3, label: '(0, 3)' },
          { x: 1, y: 6, label: '(1, 6)' },
          { x: 2, y: 12, label: '(2, 12)' },
          { x: 3, y: 24, label: '(3, 24)' },
        ],
        ariaLabel: 'The exponential curve y = 3 times 2 to the x, rising faster and faster. Three secant segments join (0, 3) to (1, 6) with slope 3, (1, 6) to (2, 12) with slope 6, and (2, 12) to (3, 24) with slope 12.',
      },
    },
    { t: 'callout', variant: 'why', title: 'Why an exponential rate keeps growing', text: 'Over an interval of length $1$, the change is $f(x + 1) - f(x) = a \\cdot b^{x + 1} - a \\cdot b^x = a \\cdot b^x(b - 1) = f(x)(b - 1)$. So the jump is a fixed multiple ($b - 1$) of the **current amount**. For $3(2)^x$, $b - 1 = 1$, so each jump equals the current value: $3, 6, 12, 24$. As the amount grows, the jumps grow too, and each one is $b$ times the one before. A linear function adds the same amount no matter how big it already is, so its rate stays the same.' },
    { t: 'p', text: 'Because of this, the rate of $f$ ($3, 6, 12, 24, \\dots$) eventually passes the rate of **any** linear function, here $10$. Exponential growth always wins in the long run.' },
    { t: 'p', text: '### Decay: negative rates that shrink toward 0' },
    { t: 'p', text: 'For $f(x) = 64(0.5)^x$, the outputs at $x = 0, 1, 2, 3, 4$ are $64, 32, 16, 8, 4$. The rates on $[0, 1], [1, 2], [2, 3], [3, 4]$ are' },
    { t: 'math', tex: '-32, \\quad -16, \\quad -8, \\quad -4' },
    {
      t: 'graph',
      caption: 'Secant lines of f(x) = 64(0.5)^x. They slope down and get flatter as the curve approaches its asymptote, y = 0.',
      spec: {
        xMin: -1,
        xMax: 5,
        yMin: -4,
        yMax: 72,
        yStep: 8,
        functions: [{ expr: '64*(0.5)^x', label: 'f(x) = 64(0.5)^x' }],
        segments: [
          { x1: 0, y1: 64, x2: 1, y2: 32, color: '#d4572f', label: 'slope -32' },
          { x1: 1, y1: 32, x2: 2, y2: 16, color: '#1f8a5b', label: 'slope -16' },
          { x1: 2, y1: 16, x2: 3, y2: 8, color: '#8a3fbf', label: 'slope -8' },
        ],
        points: [
          { x: 0, y: 64, label: '(0, 64)' },
          { x: 1, y: 32, label: '(1, 32)' },
          { x: 2, y: 16, label: '(2, 16)' },
          { x: 3, y: 8, label: '(3, 8)' },
        ],
        ariaLabel: 'A decreasing exponential curve y = 64 times 0.5 to the x that flattens toward the x-axis. Secant segments join (0, 64) to (1, 32) with slope -32, (1, 32) to (2, 16) with slope -16, and (2, 16) to (3, 8) with slope -8.',
      },
    },
    { t: 'p', text: 'Every rate is **negative** because the output is going down. The rates get **closer to $0$** (each is half the one before) because the amount being lost is half of a smaller and smaller amount. The graph flattens out toward its horizontal asymptote, $y = 0$.' },
    { t: 'p', text: '### Units' },
    { t: 'p', text: 'A car worth \\$20,000 loses $20\\%$ of its value each year, so its value is $V(t) = 20000(0.8)^t$ dollars after $t$ years.' },
    {
      t: 'table',
      caption: 'The car loses less money each year, because 20% of a smaller value is a smaller amount.',
      headers: ['$t$ (years)', '$V(t)$ (dollars)', 'Interval', 'Average rate (dollars per year)'],
      rows: [
        ['$0$', '$20000$', '', ''],
        ['$1$', '$16000$', '$[0, 1]$', '$-4000$'],
        ['$2$', '$12800$', '$[1, 2]$', '$-3200$'],
        ['$3$', '$10240$', '$[2, 3]$', '$-2560$'],
      ],
    },
    { t: 'p', text: 'The units are **output units per input unit**: dollars per year. The car loses an average of \\$4000 per year in the first year but only \\$2560 per year in the third year. The percent lost stays $20\\%$, but the **dollar** amount lost shrinks.' },
    { t: 'callout', variant: 'warning', title: 'Compare equal intervals', text: 'To say the rate is "growing," compare intervals of the **same length**, such as $[0, 2]$ and $[2, 4]$. A longer interval is not automatically a bigger rate, and the rate on a long interval is an average of fast and slow parts.' },
    { t: 'callout', variant: 'realworld', title: 'Where this shows up', text: 'How many new people catch a cold per day during an outbreak, how many dollars per year a savings account earns, or how fast a hot drink cools in degrees per minute are all average rates of change of exponential models.' },
  ],
  examples: [
    {
      title: 'From an equation',
      kind: 'introductory',
      problem: [{ t: 'p', text: 'Find the average rate of change of $f(x) = 5(3)^x$ on the interval $[0, 2]$.' }],
      steps: [
        { text: 'Evaluate at the left end.', tex: 'f(0) = 5(3)^0 = 5(1) = 5', why: 'Any nonzero number to the power $0$ is $1$, so $f(0)$ is the initial value $a = 5$.' },
        { text: 'Evaluate at the right end.', tex: 'f(2) = 5(3)^2 = 5(9) = 45', why: 'Do the power first: $3^2 = 9$, then multiply by $5$. Not $15^2$.' },
        { text: 'Divide the change in output by the change in input.', tex: '\\frac{f(2) - f(0)}{2 - 0} = \\frac{45 - 5}{2} = \\frac{40}{2} = 20', why: 'This is the slope of the secant line through $(0, 5)$ and $(2, 45)$.' },
      ],
      answer: 'The average rate of change is $20$: on average $f$ increases $20$ for each $1$ that $x$ increases from $x = 0$ to $x = 2$.',
    },
    {
      title: 'From a table, on two intervals',
      kind: 'intermediate',
      problem: [
        { t: 'p', text: 'The table shows an exponential function $g$. Find the average rate of change on $[1, 3]$ and on $[2, 4]$. How do they compare?' },
        {
          t: 'table',
          caption: 'Values of an exponential function g.',
          headers: ['$x$', '$0$', '$1$', '$2$', '$3$', '$4$'],
          rows: [['$g(x)$', '$2$', '$6$', '$18$', '$54$', '$162$']],
        },
      ],
      steps: [
        { text: 'Rate on $[1, 3]$.', tex: '\\frac{g(3) - g(1)}{3 - 1} = \\frac{54 - 6}{2} = \\frac{48}{2} = 24', why: 'Read the outputs from the table; the input changes by $2$, so divide by $2$.' },
        { text: 'Rate on $[2, 4]$.', tex: '\\frac{g(4) - g(2)}{4 - 2} = \\frac{162 - 18}{2} = \\frac{144}{2} = 72', why: 'Same length of interval, just $1$ unit later.' },
        { text: 'Compare.', tex: '\\frac{72}{24} = 3', why: 'The ratios in the table are all $3$, so $g(x) = 2(3)^x$. Sliding the interval $1$ unit right multiplies both ends by $3$, so the change, and the rate, is multiplied by $3$ too.' },
      ],
      answer: 'The rate is $24$ on $[1, 3]$ and $72$ on $[2, 4]$. The later interval has a rate $3$ times as big.',
    },
    {
      title: 'From a graph of decay',
      kind: 'intermediate',
      problem: [
        { t: 'p', text: 'The graph shows $f(x) = 32(0.5)^x$. Find the average rate of change on $[0, 2]$ and on $[2, 4]$.' },
        {
          t: 'graph',
          caption: 'f(x) = 32(0.5)^x with secant lines on [0, 2] and [2, 4].',
          spec: {
            xMin: -1,
            xMax: 6,
            yMin: -2,
            yMax: 36,
            yStep: 4,
            functions: [{ expr: '32*(0.5)^x', label: 'f(x) = 32(0.5)^x' }],
            segments: [
              { x1: 0, y1: 32, x2: 2, y2: 8, color: '#d4572f', label: 'secant on [0, 2]' },
              { x1: 2, y1: 8, x2: 4, y2: 2, color: '#1f8a5b', label: 'secant on [2, 4]' },
            ],
            points: [
              { x: 0, y: 32, label: '(0, 32)' },
              { x: 2, y: 8, label: '(2, 8)' },
              { x: 4, y: 2, label: '(4, 2)' },
            ],
            ariaLabel: 'A decreasing exponential curve through (0, 32), (2, 8) and (4, 2) that flattens toward the x-axis. A steep secant segment joins (0, 32) and (2, 8); a flatter one joins (2, 8) and (4, 2).',
          },
        },
      ],
      steps: [
        { text: 'Read the points and check them.', tex: '(0, 32),\\; (2, 8),\\; (4, 2)', why: 'Check with the equation: $32(0.5)^2 = 32(0.25) = 8$ and $32(0.5)^4 = 32(0.0625) = 2$.' },
        { text: 'Rate on $[0, 2]$.', tex: '\\frac{8 - 32}{2 - 0} = \\frac{-24}{2} = -12', why: 'The output went **down**, so the rate is negative.' },
        { text: 'Rate on $[2, 4]$.', tex: '\\frac{2 - 8}{4 - 2} = \\frac{-6}{2} = -3', why: 'Still negative, but much closer to $0$.' },
        { text: 'Interpret.', why: 'Sliding an interval $2$ units right multiplies the rate by $0.5^2 = 0.25$: $-12 \\times 0.25 = -3$. The function keeps decreasing, but more and more slowly, as the curve flattens toward $y = 0$.' },
      ],
      answer: '$-12$ on $[0, 2]$ and $-3$ on $[2, 4]$. Both are negative (decreasing), and the second is smaller in size: the decay slows down.',
    },
    {
      title: 'A common mistake: the rate is not the ratio or the base',
      kind: 'common-mistake',
      problem: [
        { t: 'p', text: 'Find the average rate of change of $f(x) = 4(2)^x$ on $[1, 3]$. Two students answered:' },
        { t: 'list', items: ['Student A: $\\frac{f(3)}{f(1)} = \\frac{32}{8} = 4$', 'Student B: "The base is $2$, so the rate of change is $2$."'] },
      ],
      steps: [
        { text: 'Evaluate at both ends.', tex: 'f(1) = 4(2)^1 = 8, \\quad f(3) = 4(2)^3 = 4(8) = 32', why: 'We need the actual outputs at $x = 1$ and $x = 3$.' },
        { text: 'Subtract, then divide by the change in $x$.', tex: '\\frac{f(3) - f(1)}{3 - 1} = \\frac{32 - 8}{2} = \\frac{24}{2} = 12', why: 'The average rate of change is a **difference** divided by a difference: how much is added per unit of $x$.' },
        { text: 'Explain Student A\'s error.', why: 'Dividing $f(3)$ by $f(1)$ finds the **ratio**, $4$: the output was multiplied by $4$ over the interval. That is $2^2$, the growth factor for $2$ units, not a rate of change.' },
        { text: 'Explain Student B\'s error.', why: 'The base $2$ is the factor the output is **multiplied** by each step. A rate of change measures how much is **added** per step, which for an exponential function changes from interval to interval.' },
      ],
      answer: 'The average rate of change is $12$. Student A found the ratio and Student B gave the growth factor; neither is the rate of change.',
    },
    {
      title: 'A growing bacteria culture',
      kind: 'real-world',
      problem: [{ t: 'p', text: 'In a biology lab, a bacteria culture starts with $500$ bacteria and doubles every hour, so $P(t) = 500(2)^t$ after $t$ hours. Find the average rate of change on $[0, 2]$ and on $[2, 4]$, with units, and explain why the second is bigger.' }],
      steps: [
        { text: 'Find the populations you need.', tex: 'P(0) = 500, \\quad P(2) = 500(4) = 2000, \\quad P(4) = 500(16) = 8000', why: 'Each rate needs the output at both ends of its interval.' },
        { text: 'Rate on $[0, 2]$.', tex: '\\frac{2000 - 500}{2 - 0} = \\frac{1500}{2} = 750 \\text{ bacteria per hour}', why: 'Bacteria divided by hours gives bacteria per hour.' },
        { text: 'Rate on $[2, 4]$.', tex: '\\frac{8000 - 2000}{4 - 2} = \\frac{6000}{2} = 3000 \\text{ bacteria per hour}', why: 'Same length of interval, $2$ hours later.' },
        { text: 'Explain.', why: 'Each hour the culture adds as many new bacteria as it already has. From hour $2$ to hour $4$ there are $4$ times as many bacteria to start with ($2000$ versus $500$), so they add $4$ times as many per hour: $750 \\times 4 = 3000$.' },
      ],
      answer: '$750$ bacteria per hour on $[0, 2]$ and $3000$ bacteria per hour on $[2, 4]$. The rate is $2^2 = 4$ times as big because the population doubled twice in between.',
    },
    {
      title: 'When does the exponential rate pass a linear rate?',
      kind: 'challenging',
      problem: [{ t: 'p', text: 'Let $f(x) = 2^x$ and $g(x) = 8x$. (a) Show that the average rate of change of $f$ on $[n, n + 1]$ is $2^n$. (b) On which of the intervals $[0, 1], [1, 2], [2, 3], \\dots$ is the rate of $f$ first **greater** than the rate of $g$?' }],
      steps: [
        { text: '(a) Write the rate with letters.', tex: '\\frac{2^{n + 1} - 2^n}{(n + 1) - n} = \\frac{2 \\cdot 2^n - 2^n}{1} = 2^n', why: '$2^{n + 1} = 2 \\cdot 2^n$, and two of something minus one of it leaves one of it.' },
        { text: 'Find the rate of $g$.', tex: '\\frac{8(n + 1) - 8n}{1} = 8', why: '$g$ is linear with slope $8$, so its rate is $8$ on every interval.' },
        { text: '(b) List the rates of $f$.', tex: '[0,1]: 1, \\quad [1,2]: 2, \\quad [2,3]: 4, \\quad [3,4]: 8, \\quad [4,5]: 16', why: 'Using $2^n$ with $n = 0, 1, 2, 3, 4$. Each rate doubles.' },
        { text: 'Compare with $8$.', why: 'On $[3, 4]$ the rates are equal ($8 = 8$), so that is not "greater." On $[4, 5]$ the rate of $f$ is $16 > 8$, and from then on it only keeps doubling.' },
        { text: 'Check (b) directly.', tex: '\\frac{f(5) - f(4)}{5 - 4} = \\frac{32 - 16}{1} = 16', why: 'Always confirm with the original formula.' },
      ],
      answer: '(a) $2^n$; (b) $[4, 5]$, where the rate of $f$ is $16$ and the rate of $g$ is $8$.',
    },
  ],
  teachMeAgain: [
    {
      approach: 'visual',
      title: 'Compare a line and a curve over the same intervals',
      blocks: [
        { t: 'p', text: 'The line $g(x) = 3x + 1$ and the curve $f(x) = 2^x$ both pass through $(0, 1)$. Look at their secant lines on $[0, 1]$, $[1, 2]$, $[2, 3]$ and $[3, 4]$.' },
        {
          t: 'graph',
          caption: 'The secant lines of the curve get steeper (slopes 1, 2, 4, 8). Every secant line of the line is the line itself (slope 3).',
          spec: {
            xMin: -1,
            xMax: 5,
            yMin: -1,
            yMax: 17,
            yStep: 2,
            functions: [
              { expr: '2^x', label: 'f(x) = 2^x', color: '#d4572f' },
              { expr: '3x + 1', label: 'g(x) = 3x + 1', color: '#1f8a5b', dashed: true },
            ],
            segments: [
              { x1: 0, y1: 1, x2: 1, y2: 2, color: '#d4572f', label: 'slope 1' },
              { x1: 1, y1: 2, x2: 2, y2: 4, color: '#d4572f', label: 'slope 2' },
              { x1: 2, y1: 4, x2: 3, y2: 8, color: '#d4572f', label: 'slope 4' },
              { x1: 3, y1: 8, x2: 4, y2: 16, color: '#d4572f', label: 'slope 8' },
            ],
            points: [
              { x: 0, y: 1, label: '(0, 1)' },
              { x: 2, y: 4, label: '(2, 4)' },
              { x: 4, y: 16, label: '(4, 16)' },
              { x: 4, y: 13, label: '(4, 13)', color: '#1f8a5b' },
            ],
            ariaLabel: 'The curve y = 2 to the x and the dashed line y = 3x + 1, both through (0, 1). Secant segments on the curve join (0, 1), (1, 2), (2, 4), (3, 8) and (4, 16), with slopes 1, 2, 4 and 8. The line reaches (4, 13).',
          },
        },
        { t: 'p', text: 'The curve starts out flatter than the line (slopes $1$ and $2$ are less than $3$), but its secant lines double in steepness every step. By $[2, 3]$ its slope, $4$, is already steeper than the line\'s, and it never looks back.' },
      ],
    },
    {
      approach: 'simpler-example',
      title: 'Just read a doubling table',
      blocks: [
        { t: 'p', text: 'A video has $100$ views and the number doubles every day.' },
        {
          t: 'table',
          caption: 'Views each day and the views gained during each day.',
          headers: ['Day', '$0$', '$1$', '$2$', '$3$', '$4$'],
          rows: [
            ['Views', '$100$', '$200$', '$400$', '$800$', '$1600$'],
            ['Gained that day', '', '$100$', '$200$', '$400$', '$800$'],
          ],
        },
        { t: 'p', text: 'Over each $1$-day interval, the average rate of change is just the views gained: $100$, then $200$, $400$, $800$ views per day. The video is not gaining the same number each day; it gains more every day, because doubling a bigger number adds more.' },
      ],
    },
    {
      approach: 'analogy',
      title: 'A rumor spreading at school',
      blocks: [
        { t: 'p', text: 'One person knows a rumor. Every period, each person who knows it tells one new person, so the number who know it doubles: $1, 2, 4, 8, 16, \\dots$' },
        { t: 'p', text: 'In the first period only $1$ new person hears it. By the fifth period $16$ new people hear it, because there are $16$ tellers. The more people who know, the faster it spreads. That is exactly why an exponential rate of change keeps growing: the amount added depends on the amount you already have.' },
        { t: 'p', text: 'A linear pattern would be like one announcement per period that reaches the same $5$ new people every time, no matter how many already know.' },
      ],
    },
    {
      approach: 'prerequisite',
      title: 'Refresher: average rate of change',
      blocks: [
        { t: 'p', text: 'The average rate of change is the slope between two points on the graph, $(x_1, f(x_1))$ and $(x_2, f(x_2))$:' },
        { t: 'math', tex: '\\frac{f(x_2) - f(x_1)}{x_2 - x_1}' },
        { t: 'list', items: [
          'Find both outputs first. For $f(x) = 2(3)^x$: $f(1) = 2(3) = 6$ and $f(2) = 2(9) = 18$. Do the power before multiplying.',
          'Subtract outputs and inputs in the **same order**: $\\frac{18 - 6}{2 - 1}$.',
          'Divide: $\\frac{12}{1} = 12$. A negative answer means the function is decreasing on that interval.',
        ] },
      ],
    },
    {
      approach: 'step-by-step',
      title: 'A four-step recipe with units',
      blocks: [
        { t: 'p', text: 'A savings account has $A(t) = 1000(1.1)^t$ dollars after $t$ years. Find the average rate of change on $[0, 2]$.' },
        { t: 'list', ordered: true, items: [
          '**Name the ends:** $a = 0$, $b = 2$.',
          '**Find both outputs:** $A(0) = 1000$ and $A(2) = 1000(1.21) = 1210$.',
          '**Subtract in the same order:** top $1210 - 1000 = 210$, bottom $2 - 0 = 2$.',
          '**Divide and add units:** $\\frac{210}{2} = 105$ dollars per year.',
        ] },
        { t: 'p', text: 'The account earned \\$100 in the first year and \\$110 in the second, which averages to \\$105 per year. Each year it earns more than the year before, because $10\\%$ of a bigger balance is more money.' },
      ],
    },
    {
      approach: 'alternate-strategy',
      title: 'A shortcut to check: multiply the last rate by b',
      blocks: [
        { t: 'p', text: 'For $f(x) = a(b)^x$, sliding an interval $1$ unit to the right multiplies both of its outputs by $b$, so it multiplies the rate by $b$ too. More generally, sliding $d$ units multiplies the rate by $b^d$.' },
        { t: 'list', items: [
          '$f(x) = 3(2)^x$: the rate on $[0, 1]$ is $3$, so on $[1, 2]$ it is $3 \\times 2 = 6$, on $[2, 3]$ it is $12$. Matches the lesson table.',
          '$P(t) = 500(2)^t$: the rate on $[0, 2]$ is $750$, so on $[2, 4]$ it is $750 \\times 2^2 = 3000$. Matches the bacteria example.',
          '$f(x) = 32(0.5)^x$: the rate on $[0, 2]$ is $-12$, so on $[2, 4]$ it is $-12 \\times 0.5^2 = -3$. Matches the decay example.',
        ] },
        { t: 'p', text: 'Use the full formula for your answer and the shortcut as a check. It also shows why growth rates keep growing ($b > 1$ makes them bigger) and decay rates shrink toward $0$ ($0 < b < 1$ makes them smaller in size).' },
      ],
    },
  ],
  guided: [
    { generator: 'u6.exp-rate', difficulty: 1 },
    { generator: 'u6.exp-rate', difficulty: 1 },
    { generator: 'u6.exp-rate', difficulty: 1 },
    { generator: 'u6.exp-rate', difficulty: 2 },
  ],
  independent: {
    count: 8,
    reviewCount: 2,
    mix: [
      { generator: 'u6.exp-rate', difficulty: 1, weight: 1 },
      { generator: 'u6.exp-rate', difficulty: 2, weight: 2 },
      { generator: 'u6.exp-rate', difficulty: 3, weight: 1 },
    ],
  },
  quiz: {
    items: [
      { generator: 'u6.exp-rate', difficulty: 1 },
      { generator: 'u6.exp-rate', difficulty: 2 },
      { generator: 'u6.exp-rate', difficulty: 2 },
      { generator: 'u6.exp-rate', difficulty: 2 },
      { generator: 'u6.exp-rate', difficulty: 3 },
      { generator: 'u6.exp-rate', difficulty: 3 },
    ],
  },
  summary: [
    'The average rate of change of $f$ on $[x_1, x_2]$ is $\\frac{f(x_2) - f(x_1)}{x_2 - x_1}$, the slope of the secant line, for exponential functions too.',
    'The rate is a difference divided by a difference. It is not the base and not the ratio of the two outputs.',
    'Its units are output units per input unit, like bacteria per hour or dollars per year.',
    'For exponential growth, the rate keeps getting bigger over equal intervals (each interval of length $1$ has a rate $b$ times the one before), because the amount added depends on the amount you already have. A linear function\'s rate stays the same.',
    'For exponential decay, the rates are negative and shrink toward $0$ as the graph flattens toward its asymptote.',
  ],
  mastery: { quizPassScore: 0.8, practiceMinCorrect: 5 },
};
