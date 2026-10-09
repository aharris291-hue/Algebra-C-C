import type { LessonContent } from '../../../core/curriculum/types';

/**
 * U1L06 Domain and Range of Linear Functions (A.FGR.2.3)
 * Domain and range in interval, set-builder and inequality notation; sensible domains in context (S1.11).
 *
 * Math verified by hand (2026-10-04): every worked example, table and graph below was recomputed independently.
 */
export const U1L06: LessonContent = {
  lessonId: 'U1L06',
  goal: 'Write the domain and range of a linear function using inequalities, interval notation and set-builder notation, and choose a domain that makes sense in a real situation.',
  needToKnow: [
    { t: 'p', text: 'This lesson builds on two things you already know:' },
    {
      t: 'list',
      items: [
        '**Inputs and outputs.** The input is $x$ (left/right on a graph) and the output is $y$ or $f(x)$ (up/down).',
        '**Inequalities on a number line.** $x \\ge 2$ uses a closed (filled) dot at $2$ because $2$ is included. $x > 2$ uses an open dot because $2$ is not included.',
      ],
    },
    { t: 'callout', variant: 'tip', title: 'Quick check', text: 'For $f(x) = 3x - 2$, what is $f(4)$? (You should get $10$.) If that felt shaky, open **Teach Me Again** and choose the refresher.' },
  ],
  vocabulary: [
    { term: 'domain', meaning: 'All the input values ($x$-values) a function can use.' },
    { term: 'range', meaning: 'All the output values ($y$-values) a function produces.' },
    { term: 'interval notation', meaning: 'A way to write a set of numbers using its endpoints, like $[2, 5)$.' },
    { term: 'set-builder notation', meaning: 'A way to describe a set with a rule, like $\\{x \\mid x \\ge 2\\}$, read "all $x$ such that $x$ is at least 2."' },
    { term: 'discrete', meaning: 'Only separate values are allowed, like whole numbers of tickets.' },
    { term: 'continuous', meaning: 'Every value in an interval is allowed, like time or distance.' },
  ],
  instruction: [
    { t: 'p', text: '### What domain and range mean' },
    { t: 'p', text: 'The **domain** is every $x$-value the function uses. The **range** is every $y$-value it produces. On a graph, the domain is how far the graph reaches **left and right**, and the range is how far it reaches **down and up**.' },
    { t: 'p', text: 'A full non-horizontal line like $y = 2x - 4$ goes on forever in both directions, so it uses every $x$ and hits every $y$. Its domain and range are both **all real numbers**. A horizontal line like $y = 3$ still has domain all real numbers, but its range is just the single number $3$, written $\\{3\\}$.' },
    { t: 'p', text: '### Three ways to write a set of numbers' },
    {
      t: 'table',
      caption: 'The same set, written three ways.',
      headers: ['Inequality', 'Interval notation', 'Set-builder notation'],
      rows: [
        ['$x \\ge 2$', '$[2, \\infty)$', '$\\{x \\mid x \\ge 2\\}$'],
        ['$x < 5$', '$(-\\infty, 5)$', '$\\{x \\mid x < 5\\}$'],
        ['$-1 < x \\le 4$', '$(-1, 4]$', '$\\{x \\mid -1 < x \\le 4\\}$'],
        ['all real numbers', '$(-\\infty, \\infty)$', '$\\{x \\mid x \\in \\mathbb{R}\\}$'],
      ],
    },
    {
      t: 'list',
      items: [
        'A **square bracket** $[\\ ]$ means the endpoint **is included** (like $\\le$, $\\ge$, or a closed dot).',
        'A **parenthesis** $(\\ )$ means the endpoint is **not included** (like $<$, $>$, or an open dot).',
        '$\\infty$ and $-\\infty$ **always** get a parenthesis. Infinity is not a number you can land on.',
        'Always write the **smaller number first**: $[-3, 5)$, never $(5, -3]$.',
      ],
    },
    { t: 'p', text: '### Segments and rays' },
    { t: 'p', text: 'Sometimes only part of a line is drawn. A **segment** has two endpoints, and a **ray** has one endpoint and goes on forever in one direction. Look at each endpoint: a closed dot is included and an open dot is not.' },
    {
      t: 'graph',
      caption: 'f(x) = x + 1 for -2 <= x < 3. Closed dot at (-2, -1), open dot at (3, 4).',
      spec: { xMin: -5, xMax: 5, yMin: -3, yMax: 6, functions: [{ expr: 'x + 1', label: 'f(x) = x + 1', domain: [-2, 3] }], points: [{ x: -2, y: -1, label: '(-2, -1)' }, { x: 3, y: 4, label: '(3, 4)', open: true }], ariaLabel: 'A segment of the line y = x + 1 from a closed dot at (-2, -1) up to an open dot at (3, 4).' },
    },
    { t: 'p', text: 'The $x$-values run from $-2$ (included) to $3$ (not included), and the $y$-values run from $-1$ (included) to $4$ (not included):' },
    { t: 'math', tex: '\\text{Domain: } [-2, 3) \\qquad \\text{Range: } [-1, 4)' },
    { t: 'p', text: '### Domain that makes sense in context' },
    { t: 'p', text: 'In real life, not every input makes sense. Time cannot be negative. You cannot buy $2.5$ concert tickets. Ask two questions:' },
    {
      t: 'list',
      ordered: true,
      items: [
        '**What are the smallest and largest inputs that make sense?** (Often the start is $0$ and the end is when something runs out or hits a limit.)',
        '**Is the input continuous or discrete?** Time, distance and gallons can be any value (continuous). People, tickets and T-shirts come in whole numbers (discrete), so you list them: $\\{0, 1, 2, 3\\}$. A list with no end can use set-builder notation with a pattern, like $\\{x \\mid x = 1, 2, 3, \\dots\\}$, and the outputs of \\$10 tickets are $\\{y \\mid y = 10, 20, 30, \\dots\\}$.',
      ],
    },
    { t: 'callout', variant: 'why', title: 'Why find the range from the endpoints?', text: 'A linear function always moves steadily in one direction (or stays flat), so its smallest and largest outputs happen at the ends of the domain. Plug in each endpoint, then put the smaller output first.' },
  ],
  examples: [
    {
      title: 'Domain and range of a closed segment',
      kind: 'introductory',
      problem: [
        { t: 'p', text: 'Write the domain and range of the segment in interval and set-builder notation.' },
        { t: 'graph', spec: { xMin: -6, xMax: 4, yMin: -4, yMax: 4, functions: [{ expr: '(1/2)x + 1', domain: [-4, 2] }], points: [{ x: -4, y: -1, label: '(-4, -1)' }, { x: 2, y: 2, label: '(2, 2)' }], ariaLabel: 'A segment of the line y = (1/2)x + 1 with closed dots at (-4, -1) and (2, 2).' } },
      ],
      steps: [
        { text: 'Read the $x$-values from left to right: $-4$ to $2$.', why: 'Both dots are closed, so both endpoints are included and get square brackets.' },
        { text: 'Write the domain.', tex: '[-4, 2] \\quad \\text{or} \\quad \\{x \\mid -4 \\le x \\le 2\\}' },
        { text: 'Read the $y$-values from bottom to top: $-1$ to $2$.', why: 'The range is about heights, so look at the $y$-coordinates of the endpoints.' },
        { text: 'Write the range.', tex: '[-1, 2] \\quad \\text{or} \\quad \\{y \\mid -1 \\le y \\le 2\\}' },
      ],
      answer: 'Domain $[-4, 2]$; range $[-1, 2]$',
    },
    {
      title: 'A ray with an open endpoint',
      kind: 'intermediate',
      problem: [
        { t: 'p', text: 'The graph shows $f(x) = 2x - 1$ for $x > 1$. Find the domain and range.' },
        { t: 'graph', spec: { xMin: -3, xMax: 5, yMin: -3, yMax: 9, functions: [{ expr: '2x - 1', domain: [1, 5] }], points: [{ x: 1, y: 1, label: '(1, 1)', open: true }], ariaLabel: 'A ray of the line y = 2x - 1 starting at an open dot at (1, 1) and rising to the right forever.' } },
      ],
      steps: [
        { text: 'Write the domain.', tex: 'x > 1 \\;\\Rightarrow\\; (1, \\infty)', why: 'The open dot means $x = 1$ is not included, and the ray keeps going right forever, so the upper end is $\\infty$.' },
        { text: 'Find the output at the endpoint.', tex: 'f(1) = 2(1) - 1 = 1', why: 'The range starts at the height of the endpoint.' },
        { text: 'Write the range.', tex: 'y > 1 \\;\\Rightarrow\\; (1, \\infty)', why: 'The function is increasing, so outputs go up from $1$ forever. The value $1$ itself is not reached because the dot is open.' },
      ],
      answer: 'Domain $(1, \\infty)$; range $(1, \\infty)$',
    },
    {
      title: 'A common mistake: keeping the endpoints in x-order',
      kind: 'common-mistake',
      problem: [
        { t: 'p', text: 'For $f(x) = -2x + 3$ with domain $(-1, 3]$, a student writes the range as $(5, -3]$. What went wrong?' },
        { t: 'graph', spec: { xMin: -3, xMax: 5, yMin: -5, yMax: 7, functions: [{ expr: '-2x + 3', domain: [-1, 3] }], points: [{ x: -1, y: 5, label: '(-1, 5)', open: true }, { x: 3, y: -3, label: '(3, -3)' }], ariaLabel: 'A falling segment of y = -2x + 3 from an open dot at (-1, 5) down to a closed dot at (3, -3).' } },
      ],
      steps: [
        { text: 'Find both endpoint outputs.', tex: 'f(-1) = -2(-1) + 3 = 5 \\qquad f(3) = -2(3) + 3 = -3', why: 'For a linear function, the smallest and largest outputs are at the ends of the domain.' },
        { text: 'Spot the error.', why: 'The student copied the outputs in the order of the inputs. The function is decreasing, so the left end gives the **bigger** output. Intervals must go from smaller to larger, and $(5, -3]$ would be empty.' },
        { text: 'Match each bracket to its endpoint.', why: '$x = -1$ is excluded, so its output $5$ is excluded (parenthesis). $x = 3$ is included, so $-3$ is included (bracket).' },
        { text: 'Write the range smaller number first.', tex: '-3 \\le y < 5 \\;\\Rightarrow\\; [-3, 5)' },
      ],
      answer: 'The range is $[-3, 5)$.',
    },
    {
      title: 'Draining a water tank',
      kind: 'real-world',
      problem: [{ t: 'p', text: 'A 600-gallon tank drains at 50 gallons per minute. The water left after $t$ minutes is $W(t) = 600 - 50t$. Find a sensible domain and range.' }],
      steps: [
        { text: 'Find when the tank is empty.', tex: '0 = 600 - 50t \\;\\Rightarrow\\; 50t = 600 \\;\\Rightarrow\\; t = 12', why: 'Once the water reaches $0$, the model stops making sense: a tank cannot hold negative water.' },
        { text: 'Decide if the input is continuous.', why: 'Time can be any value, like $2.5$ minutes, so every $t$ from $0$ to $12$ works.' },
        { text: 'Write the domain.', tex: '[0, 12] \\quad \\text{or} \\quad \\{t \\mid 0 \\le t \\le 12\\}' },
        { text: 'Find the range from the endpoints.', tex: 'W(0) = 600, \\quad W(12) = 600 - 600 = 0 \\;\\Rightarrow\\; [0, 600]', why: 'Write the smaller output first.' },
      ],
      answer: 'Domain $[0, 12]$ minutes; range $[0, 600]$ gallons',
    },
    {
      title: 'Buying concert tickets',
      kind: 'real-world',
      problem: [{ t: 'p', text: 'Tickets cost \\$9 each, and each person may buy at most 6. The cost of $n$ tickets is $C(n) = 9n$. Find the domain and range.' }],
      steps: [
        { text: 'Decide if the input is discrete or continuous.', why: 'You can only buy whole tickets, so $n$ must be a whole number. The domain is a list, not an interval.' },
        { text: 'Write the domain.', tex: '\\{0, 1, 2, 3, 4, 5, 6\\}', why: 'From $0$ tickets up to the limit of $6$.' },
        { text: 'Find each output.', tex: '9(0) = 0,\\ 9(1) = 9,\\ 9(2) = 18,\\ 9(3) = 27,\\ 9(4) = 36,\\ 9(5) = 45,\\ 9(6) = 54' },
        { text: 'Write the range.', tex: '\\{0, 9, 18, 27, 36, 45, 54\\}', why: 'Writing $[0, 54]$ would wrongly include costs like \\$20 that no number of tickets can make.' },
      ],
      answer: 'Domain $\\{0, 1, 2, 3, 4, 5, 6\\}$; range $\\{0, 9, 18, 27, 36, 45, 54\\}$ (dollars)',
    },
    {
      title: 'Range from a domain, no graph',
      kind: 'challenging',
      problem: [{ t: 'p', text: 'The function $g(x) = 3x - 2$ has domain $[-1, 4)$. Write its range in interval notation and set-builder notation.' }],
      steps: [
        { text: 'Evaluate at the included endpoint.', tex: 'g(-1) = 3(-1) - 2 = -3 - 2 = -5', why: '$-1$ is included (bracket), so $-5$ is an output and is included.' },
        { text: 'Evaluate at the excluded endpoint.', tex: 'g(4) = 3(4) - 2 = 12 - 2 = 10', why: '$4$ is not included, so $10$ is never actually reached.' },
        { text: 'Order the outputs.', why: 'The slope $3$ is positive, so the function is increasing: $-5$ is the smallest output and $10$ is the upper boundary.' },
        { text: 'Write the range.', tex: '[-5, 10) \\quad \\text{or} \\quad \\{y \\mid -5 \\le y < 10\\}' },
      ],
      answer: 'Range $[-5, 10)$, or $\\{y \\mid -5 \\le y < 10\\}$',
    },
  ],
  teachMeAgain: [
    {
      approach: 'visual',
      title: 'Squash the graph onto each axis',
      blocks: [
        { t: 'p', text: 'Imagine shining a flashlight straight down on the graph. The shadow it makes on the $x$-axis is the **domain**. Now shine it from the side: the shadow on the $y$-axis is the **range**.' },
        {
          t: 'graph',
          spec: { xMin: -5, xMax: 5, yMin: -3, yMax: 6, functions: [{ expr: 'x + 1', domain: [-2, 3] }], points: [{ x: -2, y: -1 }, { x: 3, y: 4, open: true }], segments: [{ x1: -2, y1: 0, x2: 3, y2: 0, dashed: true, label: 'domain' }, { x1: 0, y1: -1, x2: 0, y2: 4, dashed: true, label: 'range' }], ariaLabel: 'Segment of y = x + 1 from a closed dot at (-2, -1) to an open dot at (3, 4). A dashed shadow on the x-axis runs from -2 to 3 and a dashed shadow on the y-axis runs from -1 to 4.' },
        },
        { t: 'p', text: 'The $x$-shadow runs from $-2$ to $3$, so the domain is $[-2, 3)$. The $y$-shadow runs from $-1$ to $4$, so the range is $[-1, 4)$. The open dot leaves a hole at the end of each shadow.' },
      ],
    },
    {
      approach: 'analogy',
      title: 'Brackets hug, parentheses do not',
      blocks: [
        { t: 'p', text: 'Think of a square bracket as arms that **hug** the number and keep it in the set. A parenthesis is a curved wall that gets close but **does not touch**.' },
        {
          t: 'list',
          items: [
            '$[2, 7]$: both $2$ and $7$ are hugged, so both are in.',
            '$(2, 7]$: $2$ is left out, $7$ is in.',
            '$[2, \\infty)$: you can never reach infinity to hug it, so it always gets a parenthesis.',
          ],
        },
        { t: 'p', text: 'Closed dot on a graph = hug = bracket. Open dot = no touch = parenthesis.' },
      ],
    },
    {
      approach: 'step-by-step',
      title: 'A 4-step routine',
      blocks: [
        {
          t: 'list',
          ordered: true,
          items: [
            '**Find the left and right ends** of the graph. Those $x$-values are the domain endpoints. An arrow means $\\infty$ or $-\\infty$.',
            '**Find the lowest and highest points.** Those $y$-values are the range endpoints.',
            '**Choose brackets:** closed dot $\\to$ $[\\ ]$, open dot or infinity $\\to$ $(\\ )$.',
            '**Write smaller number first.** Then translate if needed: $[-2, 3)$ is $\\{x \\mid -2 \\le x < 3\\}$.',
          ],
        },
        { t: 'callout', variant: 'tip', text: 'In a word problem, add a step 0: decide if the input must be whole numbers. If it must, list the values instead of using an interval.' },
      ],
    },
    {
      approach: 'prerequisite',
      title: 'Refresher: inequality symbols and dots',
      blocks: [
        {
          t: 'table',
          headers: ['Symbol', 'Meaning', 'Dot on a number line', 'Interval end'],
          rows: [
            ['$<$', 'less than', 'open', '$)$'],
            ['$\\le$', 'less than or equal to', 'closed', '$]$'],
            ['$>$', 'greater than', 'open', '$($'],
            ['$\\ge$', 'greater than or equal to', 'closed', '$[$'],
          ],
        },
        { t: 'p', text: 'Read $-1 < x \\le 4$ in two pieces: $x$ is more than $-1$ (open, so a parenthesis) and at most $4$ (closed, so a bracket). That gives $(-1, 4]$.' },
      ],
    },
    {
      approach: 'simpler-example',
      title: 'Start with a flat segment',
      blocks: [
        { t: 'p', text: 'Suppose $y = 2$ is drawn only from $x = 1$ to $x = 5$, with closed dots at both ends.' },
        { t: 'list', items: ['The $x$-values go from $1$ to $5$, so the domain is $[1, 5]$.', 'Every point has height $2$, so the range is just $\\{2\\}$.'] },
        { t: 'p', text: 'Now tilt it: $y = x$ from $x = 1$ to $x = 5$. The domain is still $[1, 5]$, and now the heights also go from $1$ to $5$, so the range is $[1, 5]$.' },
      ],
    },
  ],
  guided: [
    { generator: 'u1.domain-range', difficulty: 1 },
    { generator: 'u1.domain-range', difficulty: 1 },
    { generator: 'u1.key-features', difficulty: 1 },
    { generator: 'u1.domain-range', difficulty: 2 },
  ],
  independent: {
    count: 8,
    reviewCount: 2,
    mix: [
      { generator: 'u1.domain-range', difficulty: 1, weight: 2 },
      { generator: 'u1.domain-range', difficulty: 2, weight: 3 },
      { generator: 'u1.domain-range', difficulty: 3, weight: 3 },
      { generator: 'u1.key-features', difficulty: 2, weight: 1 },
      { generator: 'u1.intercepts-context', difficulty: 2, weight: 1 },
    ],
  },
  quiz: {
    items: [
      { generator: 'u1.domain-range', difficulty: 2 },
      { generator: 'u1.domain-range', difficulty: 2 },
      { generator: 'u1.domain-range', difficulty: 2 },
      { generator: 'u1.domain-range', difficulty: 3 },
      { generator: 'u1.domain-range', difficulty: 3 },
      { generator: 'u1.key-features', difficulty: 2 },
    ],
  },
  summary: [
    'The **domain** is all the $x$-values (inputs); the **range** is all the $y$-values (outputs).',
    'A square bracket means the endpoint is included; a parenthesis means it is not. $\\infty$ always gets a parenthesis. Write the smaller number first.',
    '$[2, \\infty)$, $x \\ge 2$ and $\\{x \\mid x \\ge 2\\}$ all describe the same set.',
    'A full non-horizontal line has domain and range $(-\\infty, \\infty)$. For a segment or ray, find the range by plugging in the endpoints.',
    'In context, the domain must make sense: use whole numbers for things you count, and an interval for things like time.',
  ],
  mastery: { quizPassScore: 0.8, practiceMinCorrect: 5 },
};
