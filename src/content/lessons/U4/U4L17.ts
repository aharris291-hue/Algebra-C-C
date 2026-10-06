import type { LessonContent } from '../../../core/curriculum/types';

/**
 * U4L17 Average Rate of Change (A.FGR.7.7)
 * The average rate of change (f(b) - f(a))/(b - a) of a quadratic from an equation, a table and a graph, as the
 * slope of the secant line; units such as feet per second; why a linear function's rate is constant and a
 * quadratic's is not; comparing intervals; negative rates while an object falls (S4.19).
 *
 * Math verified by hand (2026-10-06): every function value below was recomputed by substitution, every average rate was recomputed as (f(b) - f(a))/(b - a) and checked against the shortcut a(p + q) + b, and every graph point and secant segment was checked to lie on its curve.
 */
export const U4L17: LessonContent = {
  lessonId: 'U4L17',
  goal: 'Find the average rate of change of a function over an interval, $\\frac{f(b) - f(a)}{b - a}$, from an equation, a table or a graph, explain it with units (like feet per second), and explain why a quadratic\'s rate of change is not constant while a linear function\'s is.',
  needToKnow: [
    { t: 'p', text: 'You already know how to find the **slope** between two points $(x_1, y_1)$ and $(x_2, y_2)$:' },
    { t: 'math', tex: 'm = \\frac{y_2 - y_1}{x_2 - x_1}' },
    { t: 'p', text: 'You also know how to evaluate a function: if $f(x) = x^2 + 2x$, then $f(3) = 9 + 6 = 15$. This lesson puts those two skills together.' },
    { t: 'callout', variant: 'tip', title: 'Quick check', text: 'Find the slope between $(1, 3)$ and $(3, 15)$. (You should get $\\frac{15 - 3}{3 - 1} = \\frac{12}{2} = 6$.) If that felt shaky, open **Teach Me Again** and choose the slope refresher.' },
  ],
  vocabulary: [
    { term: 'average rate of change', meaning: 'How much the output changes per unit of input, on average, over an interval: $\\frac{f(b) - f(a)}{b - a}$.' },
    { term: 'interval', meaning: 'The stretch of inputs you are looking at, from $x = a$ to $x = b$, written $[a, b]$ when both ends are included.' },
    { term: 'secant line', meaning: 'The straight line through two points on a curve. Its slope is the average rate of change between those points.' },
    { term: 'constant rate of change', meaning: 'A rate that is the same on every interval. Linear functions have one; quadratics do not.' },
    { term: 'units of a rate', meaning: 'Output units per input unit, such as feet per second or dollars per shirt.' },
  ],
  instruction: [
    { t: 'p', text: '### What the average rate of change measures' },
    { t: 'p', text: 'The **average rate of change** of $f$ from $x = a$ to $x = b$ is' },
    { t: 'math', tex: '\\text{average rate of change} = \\frac{f(b) - f(a)}{b - a} = \\frac{\\text{change in output}}{\\text{change in input}}' },
    { t: 'p', text: 'It is the slope formula, using the two points $(a, f(a))$ and $(b, f(b))$ on the graph. **Why it works:** slope measures how much $y$ changes for each $1$ unit of $x$. Dividing the total change in output by the total change in input spreads the change out evenly, so you get the change per unit, on average.' },
    { t: 'p', text: 'For example, for $f(x) = x^2$ on the interval $[1, 3]$:' },
    { t: 'math', tex: '\\frac{f(3) - f(1)}{3 - 1} = \\frac{9 - 1}{2} = \\frac{8}{2} = 4' },
    { t: 'p', text: 'On average, $f$ goes up $4$ for each $1$ that $x$ increases between $x = 1$ and $x = 3$.' },
    { t: 'p', text: '### The slope of the secant line' },
    { t: 'p', text: 'Draw a straight line through the two points on the curve. That line is the **secant line**, and its slope is the average rate of change. A steeper secant line means a faster average change.' },
    {
      t: 'graph',
      caption: 'Two secant lines on the graph of f(x) = x squared. The one from x = 3 to x = 4 is steeper.',
      spec: {
        xMin: -1,
        xMax: 5,
        yMin: -2,
        yMax: 18,
        yStep: 2,
        functions: [{ expr: 'x^2', label: 'f(x) = x^2' }],
        segments: [
          { x1: 1, y1: 1, x2: 3, y2: 9, color: '#d4572f', label: 'slope 4' },
          { x1: 3, y1: 9, x2: 4, y2: 16, color: '#1f8a5b', label: 'slope 7' },
        ],
        points: [
          { x: 1, y: 1, label: '(1, 1)' },
          { x: 3, y: 9, label: '(3, 9)' },
          { x: 4, y: 16, label: '(4, 16)' },
        ],
        ariaLabel: 'The parabola y = x squared. A secant segment joins (1, 1) and (3, 9) with slope 4. A steeper secant segment joins (3, 9) and (4, 16) with slope 7.',
      },
    },
    { t: 'p', text: 'From $x = 3$ to $x = 4$ the rate is $\\frac{16 - 9}{4 - 3} = 7$, which is bigger than $4$. The same function has different rates on different intervals.' },
    { t: 'p', text: '### Linear versus quadratic' },
    { t: 'p', text: 'Compare $g(x) = 3x + 1$ (linear) with $f(x) = x^2$ (quadratic) on intervals of length $1$:' },
    {
      t: 'table',
      caption: 'Average rates of change on intervals of length 1. The linear rate never changes; the quadratic rate grows by 2 each time.',
      headers: ['Interval', 'Rate of g(x) = 3x + 1', 'Rate of f(x) = x^2'],
      rows: [
        ['$[0, 1]$', '$\\frac{4 - 1}{1} = 3$', '$\\frac{1 - 0}{1} = 1$'],
        ['$[1, 2]$', '$\\frac{7 - 4}{1} = 3$', '$\\frac{4 - 1}{1} = 3$'],
        ['$[2, 3]$', '$\\frac{10 - 7}{1} = 3$', '$\\frac{9 - 4}{1} = 5$'],
        ['$[3, 4]$', '$\\frac{13 - 10}{1} = 3$', '$\\frac{16 - 9}{1} = 7$'],
      ],
    },
    { t: 'callout', variant: 'why', title: 'Why the linear rate is constant and the quadratic rate is not', text: 'A line has the same slope everywhere, so every secant line of a line is the line itself, with slope $3$. A parabola keeps bending. For $f(x) = x^2$ the jump from $x$ to $x + 1$ is $(x + 1)^2 - x^2 = 2x + 1$, which depends on $x$: the farther right you go, the bigger the jump. So a quadratic\'s rate of change keeps changing.' },
    { t: 'p', text: '### Units, and negative rates' },
    { t: 'p', text: 'A ball is thrown upward at $64$ feet per second from a balcony $80$ feet high, so its height is $h(t) = -16t^2 + 64t + 80$ feet after $t$ seconds.' },
    {
      t: 'table',
      caption: 'Height of the ball each second and the average rate of change over each 1-second interval.',
      headers: ['$t$ (s)', '$h(t)$ (ft)', 'Interval', 'Average rate (ft/s)'],
      rows: [
        ['$0$', '$80$', '', ''],
        ['$1$', '$128$', '$[0, 1]$', '$48$'],
        ['$2$', '$144$', '$[1, 2]$', '$16$'],
        ['$3$', '$128$', '$[2, 3]$', '$-16$'],
        ['$4$', '$80$', '$[3, 4]$', '$-48$'],
        ['$5$', '$0$', '$[4, 5]$', '$-80$'],
      ],
    },
    { t: 'p', text: 'The units are **output units per input unit**: feet per second. A **positive** rate means the ball is rising on average; a **negative** rate means it is falling. From $t = 3$ to $t = 4$ the ball drops $48$ feet, so the rate is $-48$ feet per second. The rates shrink, cross zero at the top ($t = 2$), and then grow more and more negative as the ball speeds up on the way down.' },
    { t: 'callout', variant: 'warning', title: 'Average means average', text: 'On $[0, 4]$ the rate is $\\frac{80 - 80}{4 - 0} = 0$ feet per second, even though the ball moved a lot. It went up and came back to the same height. The average rate only compares the two ends of the interval.' },
    { t: 'callout', variant: 'realworld', title: 'Where this shows up', text: 'Average speed on a road trip, how fast a phone battery drains between noon and 3 p.m., or how quickly a game\'s player count grew last month are all average rates of change.' },
  ],
  examples: [
    {
      title: 'From an equation',
      kind: 'introductory',
      problem: [{ t: 'p', text: 'Find the average rate of change of $f(x) = x^2 + 2x$ on the interval $[1, 3]$.' }],
      steps: [
        { text: 'Evaluate at the left end.', tex: 'f(1) = 1^2 + 2(1) = 3', why: 'The interval starts at $a = 1$, so we need the output there.' },
        { text: 'Evaluate at the right end.', tex: 'f(3) = 3^2 + 2(3) = 15', why: 'The interval ends at $b = 3$.' },
        { text: 'Divide the change in output by the change in input.', tex: '\\frac{f(3) - f(1)}{3 - 1} = \\frac{15 - 3}{2} = \\frac{12}{2} = 6', why: 'This is the slope between $(1, 3)$ and $(3, 15)$: change per unit of $x$.' },
      ],
      answer: 'The average rate of change is $6$: on average $f$ increases $6$ for each $1$ that $x$ increases.',
    },
    {
      title: 'From a table',
      kind: 'intermediate',
      problem: [
        { t: 'p', text: 'Use the table to find the average rate of change of $f$ on (a) $[0, 2]$, (b) $[1, 4]$ and (c) $[0, 4]$.' },
        {
          t: 'table',
          caption: 'Values of a quadratic function f.',
          headers: ['$x$', '$0$', '$1$', '$2$', '$3$', '$4$'],
          rows: [['$f(x)$', '$5$', '$2$', '$1$', '$2$', '$5$']],
        },
      ],
      steps: [
        { text: '(a) Read $f(0)$ and $f(2)$ and divide.', tex: '\\frac{f(2) - f(0)}{2 - 0} = \\frac{1 - 5}{2} = -2', why: 'A table gives the outputs directly, so no substitution is needed. The output went down, so the rate is negative.' },
        { text: '(b) Read $f(1)$ and $f(4)$ and divide.', tex: '\\frac{f(4) - f(1)}{4 - 1} = \\frac{5 - 2}{3} = 1', why: 'The input changed by $3$, not $1$, so divide by $3$.' },
        { text: '(c) Read $f(0)$ and $f(4)$ and divide.', tex: '\\frac{f(4) - f(0)}{4 - 0} = \\frac{5 - 5}{4} = 0', why: 'The ends have the same output, so the average change is $0$ even though $f$ went down and back up in between.' },
      ],
      answer: '(a) $-2$; (b) $1$; (c) $0$. Three different intervals give three different rates, because $f$ is not linear.',
    },
    {
      title: 'From a graph, with the secant line',
      kind: 'intermediate',
      problem: [
        { t: 'p', text: 'The graph shows $f(x) = -x^2 + 6x$. Find the average rate of change from $x = 1$ to $x = 4$.' },
        {
          t: 'graph',
          caption: 'The parabola f(x) = -x^2 + 6x with the secant line from (1, 5) to (4, 8).',
          spec: {
            xMin: -1,
            xMax: 7,
            yMin: -2,
            yMax: 10,
            functions: [{ expr: '-x^2 + 6x', label: 'f(x) = -x^2 + 6x' }],
            segments: [{ x1: 1, y1: 5, x2: 4, y2: 8, color: '#d4572f', label: 'secant' }],
            points: [
              { x: 1, y: 5, label: '(1, 5)' },
              { x: 4, y: 8, label: '(4, 8)' },
            ],
            ariaLabel: 'A downward parabola with vertex (3, 9) crossing the x-axis at 0 and 6. A secant segment joins the points (1, 5) and (4, 8) on the curve.',
          },
        },
      ],
      steps: [
        { text: 'Read the two points from the graph.', tex: '(1, 5) \\text{ and } (4, 8)', why: 'The points on the curve at $x = 1$ and $x = 4$ give $f(1)$ and $f(4)$. Check with the equation: $-1 + 6 = 5$ and $-16 + 24 = 8$.' },
        { text: 'Find the slope of the secant line.', tex: '\\frac{8 - 5}{4 - 1} = \\frac{3}{3} = 1', why: 'The average rate of change is the slope of the secant line through the two points.' },
        { text: 'Interpret.', why: 'The curve rises fast, peaks at $(3, 9)$ and starts falling, but from $x = 1$ to $x = 4$ it gains $3$ in output over $3$ in input: $1$ per unit on average.' },
      ],
      answer: 'The average rate of change is $1$.',
    },
    {
      title: 'A common mistake: mixed-up order and a missing denominator',
      kind: 'common-mistake',
      problem: [
        { t: 'p', text: 'Find the average rate of change of $f(x) = 2x^2 - 3$ on $[-1, 2]$. Two students got different answers:' },
        { t: 'list', items: ['Student A: $\\frac{5 - (-1)}{-1 - 2} = \\frac{6}{-3} = -2$', 'Student B: $f(2) - f(-1) = 5 - (-1) = 6$'] },
      ],
      steps: [
        { text: 'Evaluate carefully at both ends.', tex: 'f(-1) = 2(-1)^2 - 3 = 2 - 3 = -1, \\quad f(2) = 2(4) - 3 = 5', why: '$(-1)^2 = 1$, so $f(-1) = -1$. Squaring first, then multiplying by $2$, follows the order of operations.' },
        { text: 'Keep the same order on top and bottom.', tex: '\\frac{f(2) - f(-1)}{2 - (-1)} = \\frac{5 - (-1)}{2 + 1} = \\frac{6}{3} = 2', why: 'If the top starts with the output at $x = 2$, the bottom must start with $2$. Student A put $f(2)$ first on top but $-1$ first on the bottom, which flips the sign.' },
        { text: 'Remember to divide.', why: 'Student B found the total change, $6$, but the rate is change **per unit** of $x$. The input changed by $3$, so divide by $3$.' },
        { text: 'Check with the shortcut for quadratics.', tex: 'a(p + q) + b = 2(-1 + 2) + 0 = 2', why: 'For $f(x) = ax^2 + bx + c$ on $[p, q]$, the rate always simplifies to $a(p + q) + b$, so it is a quick way to check.' },
      ],
      answer: 'The average rate of change is $2$. Both students made an error: A mixed up the order, and B forgot to divide by the change in $x$.',
    },
    {
      title: 'A water balloon from a balcony',
      kind: 'real-world',
      problem: [{ t: 'p', text: 'At a summer party, Jaden launches a water balloon straight up at $64$ feet per second from a balcony $80$ feet high. Its height is $h(t) = -16t^2 + 64t + 80$ feet after $t$ seconds. Find the average rate of change on $[0, 1]$ and on $[3, 4]$, with units, and explain what each one means.' }],
      steps: [
        { text: 'Find the heights you need.', tex: 'h(0) = 80, \\quad h(1) = -16 + 64 + 80 = 128, \\quad h(3) = -144 + 192 + 80 = 128, \\quad h(4) = -256 + 256 + 80 = 80', why: 'Each rate needs the output at both ends of its interval.' },
        { text: 'Rate on $[0, 1]$.', tex: '\\frac{128 - 80}{1 - 0} = 48 \\text{ ft/s}', why: 'Feet of height divided by seconds of time gives feet per second.' },
        { text: 'Rate on $[3, 4]$.', tex: '\\frac{80 - 128}{4 - 3} = -48 \\text{ ft/s}', why: 'The height went **down** $48$ feet, so the change in output is negative.' },
        { text: 'Interpret.', why: 'In the first second the balloon rises an average of $48$ feet per second. From $3$ to $4$ seconds it falls an average of $48$ feet per second. The negative sign means falling.' },
      ],
      answer: '$48$ ft/s on $[0, 1]$ (rising) and $-48$ ft/s on $[3, 4]$ (falling at the same average speed).',
    },
    {
      title: 'When does the quadratic pull ahead?',
      kind: 'challenging',
      problem: [{ t: 'p', text: 'For $f(x) = x^2$, (a) show that the average rate of change on $[a, a + 1]$ is $2a + 1$. (b) On which interval of the form $[a, a + 1]$ is the rate $15$? (c) The linear function $g(x) = 4x$ has rate $4$ everywhere. On which of the intervals $[0, 1], [1, 2], [2, 3], \\dots$ is the rate of $f$ first greater than $4$?' }],
      steps: [
        { text: '(a) Write the rate with letters.', tex: '\\frac{(a + 1)^2 - a^2}{(a + 1) - a} = \\frac{a^2 + 2a + 1 - a^2}{1} = 2a + 1', why: 'Use the same formula with $a$ and $a + 1$ as the ends. Expanding $(a + 1)^2$ and canceling $a^2$ leaves $2a + 1$.' },
        { text: '(b) Set the rate equal to $15$.', tex: '2a + 1 = 15 \\;\\Longrightarrow\\; a = 7', why: 'The rate depends on where the interval starts, so we can solve for the start.' },
        { text: 'Check (b).', tex: '\\frac{8^2 - 7^2}{8 - 7} = \\frac{64 - 49}{1} = 15', why: 'Always confirm with the original formula.' },
        { text: '(c) List the rates of $f$.', tex: '[0,1]: 1, \\quad [1,2]: 3, \\quad [2,3]: 5', why: 'Using $2a + 1$ with $a = 0, 1, 2$. Each rate is $2$ more than the last because the parabola keeps getting steeper.' },
        { text: 'Compare with $4$.', why: 'The rate of $f$ is $1$ and $3$ (less than $4$) on the first two intervals and $5$ (greater than $4$) on $[2, 3]$. Once it passes $4$ it never drops back, because $2a + 1$ only grows.' },
      ],
      answer: '(a) $2a + 1$; (b) $[7, 8]$; (c) $[2, 3]$, where the rate of $f$ is $5$.',
    },
  ],
  teachMeAgain: [
    {
      approach: 'visual',
      title: 'Secant lines getting steeper',
      blocks: [
        { t: 'p', text: 'Look at three secant lines on $f(x) = x^2$, each over an interval of length $1$. Watch the slopes.' },
        {
          t: 'graph',
          caption: 'Secant lines of f(x) = x squared on [0, 1], [1, 2] and [2, 3] have slopes 1, 3 and 5.',
          spec: {
            xMin: -1,
            xMax: 4,
            yMin: -1,
            yMax: 10,
            functions: [{ expr: 'x^2', label: 'f(x) = x^2' }],
            segments: [
              { x1: 0, y1: 0, x2: 1, y2: 1, color: '#d4572f', label: 'slope 1' },
              { x1: 1, y1: 1, x2: 2, y2: 4, color: '#1f8a5b', label: 'slope 3' },
              { x1: 2, y1: 4, x2: 3, y2: 9, color: '#8a3fbf', label: 'slope 5' },
            ],
            points: [
              { x: 0, y: 0, label: '(0, 0)' },
              { x: 1, y: 1, label: '(1, 1)' },
              { x: 2, y: 4, label: '(2, 4)' },
              { x: 3, y: 9, label: '(3, 9)' },
            ],
            ariaLabel: 'The parabola y = x squared with three secant segments: (0, 0) to (1, 1) with slope 1, (1, 1) to (2, 4) with slope 3, and (2, 4) to (3, 9) with slope 5. Each one is steeper than the one before.',
          },
        },
        { t: 'p', text: 'Each step to the right, the secant line gets steeper: slopes $1$, $3$, $5$. If you drew secant lines on a straight line instead, every one would lie right on top of the line, with the same slope. That is the difference between a quadratic and a linear function.' },
      ],
    },
    {
      approach: 'simpler-example',
      title: 'Just read the table',
      blocks: [
        { t: 'p', text: 'Here is $f(x) = x^2$ as a table.' },
        {
          t: 'table',
          caption: 'Values of f(x) = x squared.',
          headers: ['$x$', '$0$', '$1$', '$2$', '$3$', '$4$'],
          rows: [['$f(x)$', '$0$', '$1$', '$4$', '$9$', '$16$']],
        },
        { t: 'p', text: 'From $x = 0$ to $x = 2$: the output went from $0$ to $4$, a change of $4$, over $2$ units. So $\\frac{4}{2} = 2$ per unit.' },
        { t: 'p', text: 'From $x = 2$ to $x = 4$: the output went from $4$ to $16$, a change of $12$, over $2$ units. So $\\frac{12}{2} = 6$ per unit.' },
        { t: 'p', text: 'Same length of interval, different rates. The function is speeding up.' },
      ],
    },
    {
      approach: 'analogy',
      title: 'Average speed on a road trip',
      blocks: [
        { t: 'p', text: 'You ride $120$ miles to a theme park in $2$ hours. Your **average speed** is $\\frac{120 \\text{ miles}}{2 \\text{ hours}} = 60$ miles per hour.' },
        { t: 'p', text: 'You did not go exactly $60$ the whole time: you sat at red lights and sped up on the highway. The average only uses the start and the end. That is exactly what the average rate of change does: (change in output) divided by (change in input), ignoring the wiggles in between.' },
        { t: 'p', text: 'And if you drove to the park and back home, your change in position would be $0$, so your average rate of change of position would be $0$ miles per hour, even though you drove $240$ miles.' },
      ],
    },
    {
      approach: 'prerequisite',
      title: 'Refresher: slope between two points',
      blocks: [
        { t: 'p', text: 'Slope is rise over run. For $(2, 3)$ and $(6, 11)$:' },
        { t: 'math', tex: 'm = \\frac{11 - 3}{6 - 2} = \\frac{8}{4} = 2' },
        { t: 'list', items: [
          'Subtract the $y$-values in one order.',
          'Subtract the $x$-values in the **same** order.',
          'Divide. A negative answer means the line goes down from left to right.',
        ] },
        { t: 'p', text: 'The average rate of change is this same slope, where the two points are $(a, f(a))$ and $(b, f(b))$. The only new part is finding $f(a)$ and $f(b)$ first.' },
      ],
    },
    {
      approach: 'step-by-step',
      title: 'A four-step recipe',
      blocks: [
        { t: 'p', text: 'Find the average rate of change of $f(x) = x^2 - 4x$ on $[1, 5]$.' },
        { t: 'list', ordered: true, items: [
          '**Name the ends:** $a = 1$, $b = 5$.',
          '**Find both outputs:** $f(1) = 1 - 4 = -3$ and $f(5) = 25 - 20 = 5$.',
          '**Subtract in the same order:** top $5 - (-3) = 8$, bottom $5 - 1 = 4$.',
          '**Divide and add units if there are any:** $\\frac{8}{4} = 2$.',
        ] },
        { t: 'p', text: 'So $f$ increases by $2$ per unit of $x$, on average, from $x = 1$ to $x = 5$.' },
      ],
    },
    {
      approach: 'alternate-strategy',
      title: 'A shortcut to check your answer',
      blocks: [
        { t: 'p', text: 'For any quadratic $f(x) = ax^2 + bx + c$, the average rate of change on $[p, q]$ simplifies to' },
        { t: 'math', tex: '\\frac{f(q) - f(p)}{q - p} = a(p + q) + b' },
        { t: 'p', text: 'The $c$ cancels when you subtract, and $q^2 - p^2 = (q - p)(q + p)$ lets you divide out $q - p$.' },
        { t: 'list', items: [
          '$f(x) = x^2 + 2x$ on $[1, 3]$: $1(1 + 3) + 2 = 6$. Matches the worked example.',
          '$f(x) = -x^2 + 6x$ on $[1, 4]$: $-1(1 + 4) + 6 = 1$. Matches.',
          '$h(t) = -16t^2 + 64t + 80$ on $[3, 4]$: $-16(3 + 4) + 64 = -48$. Matches.',
        ] },
        { t: 'p', text: 'Use the full formula for your answer and the shortcut as a check. Notice the shortcut depends on $p + q$, which is another way to see why the rate changes from interval to interval. For a line, $a = 0$ and the rate is always just $b$.' },
      ],
    },
  ],
  guided: [
    { generator: 'u4.avg-rate', difficulty: 1 },
    { generator: 'u4.avg-rate', difficulty: 1 },
    { generator: 'u4.avg-rate', difficulty: 1 },
    { generator: 'u4.avg-rate', difficulty: 1 },
  ],
  independent: {
    count: 8,
    reviewCount: 2,
    mix: [
      { generator: 'u4.avg-rate', difficulty: 1, weight: 1 },
      { generator: 'u4.avg-rate', difficulty: 2, weight: 2 },
      { generator: 'u4.avg-rate', difficulty: 3, weight: 1 },
    ],
  },
  quiz: {
    items: [
      { generator: 'u4.avg-rate', difficulty: 2 },
      { generator: 'u4.avg-rate', difficulty: 2 },
      { generator: 'u4.avg-rate', difficulty: 2 },
      { generator: 'u4.avg-rate', difficulty: 3 },
      { generator: 'u4.avg-rate', difficulty: 3 },
      { generator: 'u4.avg-rate', difficulty: 3 },
    ],
  },
  summary: [
    'The average rate of change of $f$ on $[a, b]$ is $\\frac{f(b) - f(a)}{b - a}$: the slope of the secant line through $(a, f(a))$ and $(b, f(b))$.',
    'Subtract in the same order on top and bottom, and always divide by the change in input.',
    'Its units are output units per input unit, like feet per second; a negative rate means the output is decreasing, like a ball falling.',
    'A linear function has the same rate on every interval; a quadratic\'s rate changes from interval to interval because the parabola keeps bending.',
  ],
  mastery: { quizPassScore: 0.8, practiceMinCorrect: 5 },
};
