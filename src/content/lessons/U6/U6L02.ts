import type { LessonContent } from '../../../core/curriculum/types';

/**
 * U6L02 Graphing Exponential Functions (A.FGR.9.2)
 * Graphing f(x) = a(b)^x + k from a table; the key features: the y-intercept (0, a + k), the horizontal
 * asymptote y = k (y = 0 when there is no shift) and why the graph never reaches it, whether the function is
 * increasing or decreasing (from the signs of a and b - 1), the x-intercept when there is one, and end
 * behavior written as "as x -> infinity, f(x) -> ..." (S6.02). Reviews evaluating exponential functions
 * (S6.01).
 *
 * Math verified by hand (2026-10-07): every table value and graph point was recomputed by substitution
 * (2^x at x = -3..3: 1/8, 1/4, 1/2, 1, 2, 4, 8; (1/2)^x at x = -3..2: 8, 4, 2, 1, 1/2, 1/4; 2^x - 4 at
 * x = -2..3: -3.75, -3.5, -3, -2, 0, 4; -3(2)^x at x = -1..2: -1.5, -3, -6, -12; 3(2)^x at x = -1..2: 1.5, 3,
 * 6, 12; 2(0.5)^x + 1 at x = -2..2: 9, 5, 3, 2, 1.5; 2(3)^x - 6 at x = -1..2: -16/3, -4, 0, 12;
 * -2(0.5)^x + 4 at x = -2..2: -4, 0, 2, 3, 3.5; 120(0.9)^m + 70: T(0) = 190, 0.9^5 = 0.59049,
 * T(5) = 140.8588), every y-intercept was rechecked as a + k,
 * every asymptote as y = k, every increasing/decreasing claim against two outputs, and every point was
 * checked to lie on its curve and inside its graph window.
 */
export const U6L02: LessonContent = {
  lessonId: 'U6L02',
  goal: 'Graph an exponential function like $f(x) = 2^x - 4$ and identify its key features: the $y$-intercept $(0, -3)$, the horizontal asymptote $y = -4$, whether it is increasing or decreasing, and its end behavior.',
  needToKnow: [
    { t: 'p', text: 'This lesson builds on the last lesson and on the key features you found for parabolas:' },
    {
      t: 'list',
      items: [
        '**Evaluating (last lesson).** $f(-2) = 3(2)^{-2} = \\frac{3}{4}$: power first, then multiply. Negative inputs give reciprocals, not negative numbers.',
        '**Initial value (Unit 5).** In $a(b)^x$, the output at $x = 0$ is $a$, because $b^0 = 1$.',
        '**Key features (Unit 4).** You described parabolas by their $y$-intercept, where they increase or decrease, and end behavior: what $f(x)$ does as $x \\to \\infty$ and $x \\to -\\infty$.',
      ],
    },
    { t: 'callout', variant: 'tip', title: 'Quick check', text: 'For $f(x) = 2^x$, find $f(-3)$ and $f(3)$. (You should get $\\frac{1}{8}$ and $8$.) If that felt shaky, open **Teach Me Again** and choose the refresher.' },
  ],
  vocabulary: [
    { term: 'horizontal asymptote', meaning: 'A horizontal line $y = k$ that the graph gets closer and closer to at one end but never reaches. Draw it as a dashed line.' },
    { term: 'y-intercept', meaning: 'The point where the graph crosses the $y$-axis, $(0, f(0))$. For $a(b)^x + k$ it is $(0, a + k)$.' },
    { term: 'x-intercept', meaning: 'A point where the graph crosses the $x$-axis, where $f(x) = 0$. Many exponential graphs have none.' },
    { term: 'end behavior', meaning: 'What the outputs do as $x$ goes far right ($x \\to \\infty$) and far left ($x \\to -\\infty$).' },
    { term: 'increasing / decreasing', meaning: 'Increasing: the graph goes up from left to right. Decreasing: it goes down. An exponential function does one or the other everywhere.' },
  ],
  instruction: [
    { t: 'p', text: '### Graph from a table' },
    { t: 'p', text: 'Start with the two simplest exponential functions, $f(x) = 2^x$ and $g(x) = \\left(\\frac{1}{2}\\right)^x$:' },
    {
      t: 'table',
      caption: 'Outputs of 2^x and (1/2)^x. Each row is the other row read backwards.',
      headers: ['$x$', '$-3$', '$-2$', '$-1$', '$0$', '$1$', '$2$', '$3$'],
      rows: [
        ['$f(x) = 2^x$', '$\\frac{1}{8}$', '$\\frac{1}{4}$', '$\\frac{1}{2}$', '$1$', '$2$', '$4$', '$8$'],
        ['$g(x) = \\left(\\frac{1}{2}\\right)^x$', '$8$', '$4$', '$2$', '$1$', '$\\frac{1}{2}$', '$\\frac{1}{4}$', '$\\frac{1}{8}$'],
      ],
    },
    {
      t: 'graph',
      caption: 'Growth f(x) = 2^x rises to the right. Decay g(x) = (1/2)^x falls to the right. Both cross the y-axis at (0, 1) and hug the x-axis at one end.',
      spec: {
        xMin: -4,
        xMax: 4,
        yMin: -1,
        yMax: 9,
        xLabel: 'x',
        yLabel: 'y',
        functions: [
          { expr: '2^x', label: 'f(x) = 2^x', color: '#1f8a5b' },
          { expr: '(0.5)^x', label: 'g(x) = (1/2)^x', color: '#d4572f' },
        ],
        points: [
          { x: 0, y: 1, label: '(0, 1)' },
          { x: 1, y: 2, label: '(1, 2)', color: '#1f8a5b' },
          { x: 2, y: 4, label: '(2, 4)', color: '#1f8a5b' },
          { x: 3, y: 8, label: '(3, 8)', color: '#1f8a5b' },
          { x: -1, y: 2, label: '(-1, 2)', color: '#d4572f' },
          { x: -2, y: 4, label: '(-2, 4)', color: '#d4572f' },
          { x: -3, y: 8, label: '(-3, 8)', color: '#d4572f' },
        ],
        ariaLabel: 'Two curves crossing at (0, 1). f(x) = 2 to the x rises through (1, 2), (2, 4) and (3, 8) and flattens toward the x-axis on the left. g(x) = one half to the x rises to the left through (-1, 2), (-2, 4) and (-3, 8) and flattens toward the x-axis on the right.',
      },
    },
    { t: 'p', text: 'Read the key features of $f(x) = 2^x$ from the table and graph:' },
    {
      t: 'list',
      items: [
        '**$y$-intercept:** $(0, 1)$, because $2^0 = 1$.',
        '**Horizontal asymptote:** $y = 0$ (the $x$-axis). To the left the outputs are $\\frac{1}{2}, \\frac{1}{4}, \\frac{1}{8}, \\dots$: closer and closer to $0$, never $0$.',
        '**$x$-intercept:** none, because the graph never reaches $y = 0$.',
        '**Increasing** everywhere: each step right doubles the output.',
        '**End behavior:** as $x \\to \\infty$, $f(x) \\to \\infty$; as $x \\to -\\infty$, $f(x) \\to 0$.',
      ],
    },
    { t: 'p', text: 'For $g(x) = \\left(\\frac{1}{2}\\right)^x$ everything flips left to right: it is **decreasing**, and as $x \\to \\infty$, $g(x) \\to 0$; as $x \\to -\\infty$, $g(x) \\to \\infty$.' },
    { t: 'callout', variant: 'why', title: 'Why the graph never touches the asymptote', text: 'A positive base to any power is positive: $b^x > 0$ for every $x$. You can halve a number forever and it gets tiny, but it never becomes $0$. So $2^x$ is never $0$, and the graph of $y = 2^x$ never reaches the line $y = 0$.' },
    { t: 'p', text: '### Shifting up or down: the asymptote moves to $y = k$' },
    { t: 'p', text: 'Now add a constant: $f(x) = a(b)^x + k$. Every output moves by $k$, so the whole graph, asymptote included, slides up or down. For $f(x) = 2^x - 4$:' },
    {
      t: 'table',
      caption: 'Each output of 2^x - 4 is 4 less than the output of 2^x.',
      headers: ['$x$', '$-2$', '$-1$', '$0$', '$1$', '$2$', '$3$'],
      rows: [['$f(x) = 2^x - 4$', '$-3.75$', '$-3.5$', '$-3$', '$-2$', '$0$', '$4$']],
    },
    {
      t: 'graph',
      caption: 'f(x) = 2^x - 4 with its horizontal asymptote y = -4 (dashed). The graph crosses the y-axis at (0, -3) and the x-axis at (2, 0).',
      spec: {
        xMin: -5,
        xMax: 4,
        yMin: -6,
        yMax: 6,
        xLabel: 'x',
        yLabel: 'y',
        functions: [
          { expr: '2^x - 4', label: 'f(x) = 2^x - 4' },
          { expr: '-4', label: 'asymptote y = -4', dashed: true },
        ],
        points: [
          { x: -1, y: -3.5, label: '(-1, -3.5)' },
          { x: 0, y: -3, label: '(0, -3)' },
          { x: 1, y: -2, label: '(1, -2)' },
          { x: 2, y: 0, label: '(2, 0)' },
          { x: 3, y: 4, label: '(3, 4)' },
        ],
        ariaLabel: 'An increasing curve through (-1, -3.5), (0, -3), (1, -2), (2, 0) and (3, 4). On the left it flattens toward a dashed horizontal line at y = -4 without touching it.',
      },
    },
    {
      t: 'list',
      items: [
        '**Asymptote:** $y = -4$. Since $2^x > 0$, $2^x - 4 > -4$ always.',
        '**$y$-intercept:** $f(0) = 1 - 4 = -3$, so $(0, -3)$. In general it is $(0, a + k)$.',
        '**$x$-intercept:** $2^x - 4 = 0$ when $2^x = 4 = 2^2$, so $(2, 0)$.',
        '**End behavior:** as $x \\to \\infty$, $f(x) \\to \\infty$; as $x \\to -\\infty$, $f(x) \\to -4$.',
      ],
    },
    { t: 'callout', variant: 'warning', title: 'The y-intercept is a + k, not a', text: 'Without a shift, the $y$-intercept of $a(b)^x$ is $a$. With a shift, evaluate: $f(0) = a(b)^0 + k = a + k$. For $2^x - 4$ that is $1 + (-4) = -3$.' },
    { t: 'p', text: '### When a is negative' },
    { t: 'p', text: 'A negative $a$ makes every output the opposite, so the graph flips over the asymptote. For $f(x) = -3(2)^x$: $f(-1) = -1.5$, $f(0) = -3$, $f(1) = -6$, $f(2) = -12$.' },
    {
      t: 'graph',
      caption: 'f(x) = -3(2)^x lies below its asymptote y = 0 and falls faster and faster to the right.',
      spec: {
        xMin: -4,
        xMax: 3,
        yMin: -14,
        yMax: 2,
        yStep: 2,
        xLabel: 'x',
        yLabel: 'y',
        functions: [{ expr: '-3*2^x', label: 'f(x) = -3(2)^x' }],
        points: [
          { x: -1, y: -1.5, label: '(-1, -1.5)' },
          { x: 0, y: -3, label: '(0, -3)' },
          { x: 1, y: -6, label: '(1, -6)' },
          { x: 2, y: -12, label: '(2, -12)' },
        ],
        ariaLabel: 'A decreasing curve below the x-axis through (-1, -1.5), (0, -3), (1, -6) and (2, -12). On the left it rises toward the x-axis without touching it.',
      },
    },
    { t: 'p', text: 'It is **decreasing**, the asymptote is still $y = 0$, and the end behavior is: as $x \\to \\infty$, $f(x) \\to -\\infty$; as $x \\to -\\infty$, $f(x) \\to 0$.' },
    { t: 'p', text: '### The four cases' },
    {
      t: 'table',
      caption: 'How the signs of a and b decide the shape of f(x) = a(b)^x + k. The asymptote is always y = k.',
      headers: ['', '$b > 1$', '$0 < b < 1$'],
      rows: [
        ['$a > 0$ (above $y = k$)', 'increasing; as $x \\to \\infty$, $f(x) \\to \\infty$; as $x \\to -\\infty$, $f(x) \\to k$', 'decreasing; as $x \\to \\infty$, $f(x) \\to k$; as $x \\to -\\infty$, $f(x) \\to \\infty$'],
        ['$a < 0$ (below $y = k$)', 'decreasing; as $x \\to \\infty$, $f(x) \\to -\\infty$; as $x \\to -\\infty$, $f(x) \\to k$', 'increasing; as $x \\to \\infty$, $f(x) \\to k$; as $x \\to -\\infty$, $f(x) \\to -\\infty$'],
      ],
    },
    { t: 'callout', variant: 'tip', title: 'A graphing routine', text: '(1) Draw the asymptote $y = k$ as a dashed line. (2) Plot the $y$-intercept $(0, a + k)$. (3) Plot two or three more points, such as $x = -1, 1, 2$. (4) Draw a smooth curve through them that flattens toward the asymptote at one end.' },
    { t: 'callout', variant: 'realworld', title: 'Where this shows up', text: 'A hot drink cools toward room temperature, and a phone battery charges toward $100\\%$. Each curve levels off at a horizontal asymptote, the value it approaches but never quite reaches.' },
  ],
  examples: [
    {
      title: 'Key features of a growth function',
      kind: 'introductory',
      problem: [{ t: 'p', text: 'Graph $f(x) = 3(2)^x$. Give the $y$-intercept, the asymptote, whether it increases or decreases, and its end behavior.' }],
      steps: [
        { text: 'Make a table.', tex: 'f(-1) = 1.5, \\; f(0) = 3, \\; f(1) = 6, \\; f(2) = 12', why: 'Choose inputs on both sides of $0$ so you can see both ends of the graph. For example, $f(-1) = 3 \\cdot \\frac{1}{2} = 1.5$.' },
        { text: '$y$-intercept.', tex: '(0, 3)', why: '$f(0) = 3(1) = 3$, the initial value $a$.' },
        { text: 'Asymptote.', tex: 'y = 0', why: 'There is no $+k$, so $k = 0$. The outputs to the left, $1.5, 0.75, \\dots$, get close to $0$ but never reach it.' },
        { text: 'Increasing or decreasing.', why: '$a = 3 > 0$ and $b = 2 > 1$, so each step right doubles a positive output: increasing.' },
        { text: 'End behavior.', tex: 'x \\to \\infty: f(x) \\to \\infty; \\qquad x \\to -\\infty: f(x) \\to 0', why: 'Doubling forever grows without bound; halving forever approaches the asymptote.' },
      ],
      answer: '$y$-intercept $(0, 3)$; asymptote $y = 0$; increasing; as $x \\to \\infty$, $f(x) \\to \\infty$, and as $x \\to -\\infty$, $f(x) \\to 0$.',
    },
    {
      title: 'A decay function shifted up',
      kind: 'intermediate',
      problem: [{ t: 'p', text: 'Graph $g(x) = 2(0.5)^x + 1$ and give its key features.' }],
      steps: [
        { text: 'Draw the asymptote first.', tex: 'y = 1', why: 'In $a(b)^x + k$ the asymptote is $y = k$, and here $k = 1$.' },
        { text: 'Find the $y$-intercept.', tex: 'g(0) = 2(1) + 1 = 3', why: 'The $y$-intercept is $a + k = 2 + 1$.' },
        { text: 'Plot more points.', tex: 'g(-2) = 9, \\; g(-1) = 5, \\; g(1) = 2, \\; g(2) = 1.5', why: 'For example, $g(-1) = 2(0.5)^{-1} + 1 = 2(2) + 1 = 5$ and $g(2) = 2(0.25) + 1 = 1.5$.' },
        {
          text: 'Draw the curve.',
          why: 'Connect the points smoothly. To the right the curve flattens toward $y = 1$ but stays above it, because $2(0.5)^x > 0$.',
        },
        { text: 'Direction and end behavior.', tex: 'x \\to \\infty: g(x) \\to 1; \\qquad x \\to -\\infty: g(x) \\to \\infty', why: '$a > 0$ and $0 < b < 1$, so it is decreasing: the outputs go $9, 5, 3, 2, 1.5$.' },
      ],
      answer: 'Asymptote $y = 1$; $y$-intercept $(0, 3)$; no $x$-intercept; decreasing; as $x \\to \\infty$, $g(x) \\to 1$, and as $x \\to -\\infty$, $g(x) \\to \\infty$.',
    },
    {
      title: 'Three wrong features',
      kind: 'common-mistake',
      problem: [
        { t: 'p', text: 'For $h(x) = 2(3)^x - 6$, Rosa says: "The $y$-intercept is $2$, the asymptote is the $x$-axis, and it has no $x$-intercept because exponential graphs never cross the $x$-axis." Fix each claim.' },
        {
          t: 'graph',
          caption: 'The graph of h(x) = 2(3)^x - 6 and the dashed line y = -6.',
          spec: {
            xMin: -5,
            xMax: 3,
            yMin: -8,
            yMax: 14,
            yStep: 2,
            functions: [
              { expr: '2*3^x - 6', label: 'h(x) = 2(3)^x - 6' },
              { expr: '-6', label: 'y = -6', dashed: true },
            ],
            points: [
              { x: 0, y: -4, label: '(0, -4)' },
              { x: 1, y: 0, label: '(1, 0)' },
              { x: 2, y: 12, label: '(2, 12)' },
            ],
            ariaLabel: 'An increasing curve through (0, -4), (1, 0) and (2, 12). On the left it flattens toward a dashed line at y = -6.',
          },
        },
      ],
      steps: [
        { text: 'Fix the $y$-intercept.', tex: 'h(0) = 2(3)^0 - 6 = 2 - 6 = -4', why: 'Rosa used $a = 2$ and forgot the shift. The $y$-intercept is $a + k$, so $(0, -4)$.' },
        { text: 'Fix the asymptote.', tex: 'y = -6', why: 'The $-6$ moves every output, and the asymptote with them. Since $2(3)^x > 0$, $h(x) > -6$, and $h(x)$ gets close to $-6$ as $x \\to -\\infty$.' },
        { text: 'Fix the $x$-intercept claim.', tex: '2(3)^x - 6 = 0 \\;\\Rightarrow\\; 3^x = 3 \\;\\Rightarrow\\; x = 1', why: 'Only the graph of $a(b)^x$ with no shift avoids the $x$-axis. This graph sits above $y = -6$, starts below the $x$-axis and rises through it. Check: $h(1) = 6 - 6 = 0$.' },
      ],
      answer: '$y$-intercept $(0, -4)$, asymptote $y = -6$, and $x$-intercept $(1, 0)$.',
    },
    {
      title: 'Coffee cooling to room temperature',
      kind: 'real-world',
      problem: [
        { t: 'p', text: 'Ji-woo pours a cup of coffee in a $70^\\circ$F room. Its temperature in degrees Fahrenheit $m$ minutes later is $T(m) = 120(0.9)^m + 70$. Find the $T$-intercept and the asymptote, and explain what each means. Then describe the end behavior.' },
        {
          t: 'graph',
          caption: 'The coffee cools quickly at first, then levels off toward the room temperature, 70 degrees.',
          spec: {
            xMin: -2,
            xMax: 40,
            yMin: 0,
            yMax: 200,
            xStep: 5,
            yStep: 20,
            xLabel: 'time (min)',
            yLabel: 'temperature (°F)',
            functions: [
              { expr: '120*(0.9)^x + 70', label: 'T(m) = 120(0.9)^m + 70', domain: [0, 40] },
              { expr: '70', label: 'room temperature y = 70', dashed: true },
            ],
            points: [
              { x: 0, y: 190, label: '(0, 190)' },
              { x: 5, y: 140.8588, label: '(5, about 140.9)' },
            ],
            ariaLabel: 'A decreasing curve starting at (0, 190), passing through about (5, 140.9), and flattening toward a dashed horizontal line at 70 degrees as time increases.',
          },
        },
      ],
      steps: [
        { text: 'Find the starting temperature.', tex: 'T(0) = 120(1) + 70 = 190', why: 'The intercept is $a + k$. At $m = 0$, when it is poured, the coffee is $190^\\circ$F.' },
        { text: 'Find the asymptote.', tex: 'T = 70', why: 'The asymptote is $y = k$ with $k = 70$. This is the room temperature: the coffee cools toward it.' },
        { text: 'Check one more value.', tex: 'T(5) = 120(0.59049) + 70 = 140.8588', why: 'After $5$ minutes it is about $140.9^\\circ$F. The difference from the room, $120$ degrees at the start, is multiplied by $0.9$ each minute.' },
        { text: 'End behavior.', tex: 'm \\to \\infty: \\; T(m) \\to 70', why: '$a > 0$ and $0 < b < 1$, so $T$ is decreasing and levels off at $70$. In the model the coffee never gets colder than the room, which matches real life.' },
      ],
      answer: 'The $T$-intercept is $(0, 190)$: the coffee is $190^\\circ$F when poured. The asymptote $T = 70$ is the room temperature. As $m \\to \\infty$, $T(m) \\to 70$: the coffee keeps cooling toward $70^\\circ$F.',
    },
    {
      title: 'Negative a and a decay base',
      kind: 'challenging',
      problem: [{ t: 'p', text: 'Graph $f(x) = -2(0.5)^x + 4$. Find the asymptote, both intercepts, whether it increases or decreases, and its end behavior.' }],
      steps: [
        { text: 'Asymptote and $y$-intercept.', tex: 'y = 4, \\qquad f(0) = -2 + 4 = 2', why: '$k = 4$, and the $y$-intercept is $a + k$. Because $a < 0$, the graph lies **below** $y = 4$.' },
        { text: 'Make a table.', tex: 'f(-2) = -4, \\; f(-1) = 0, \\; f(1) = 3, \\; f(2) = 3.5', why: 'For example, $f(-2) = -2(0.5)^{-2} + 4 = -2(4) + 4 = -4$ and $f(1) = -2(0.5) + 4 = 3$.' },
        { text: '$x$-intercept.', tex: '-2(0.5)^x + 4 = 0 \\;\\Rightarrow\\; (0.5)^x = 2 \\;\\Rightarrow\\; x = -1', why: '$(0.5)^{-1} = 2$, so $x = -1$. The table agrees: $f(-1) = 0$.' },
        { text: 'Increasing or decreasing.', why: 'The outputs go $-4, 0, 2, 3, 3.5$ from left to right: increasing. A negative $a$ flips a decreasing decay curve, so it rises.' },
        { text: 'End behavior.', tex: 'x \\to \\infty: f(x) \\to 4; \\qquad x \\to -\\infty: f(x) \\to -\\infty', why: 'To the right, $(0.5)^x$ shrinks toward $0$, so $f(x)$ rises toward $4$. To the left, $(0.5)^x$ grows without bound, and multiplying by $-2$ sends $f(x)$ down without bound.' },
        {
          text: 'Sketch it.',
          why: 'Dashed line $y = 4$, then the points $(-2, -4)$, $(-1, 0)$, $(0, 2)$, $(1, 3)$, $(2, 3.5)$, with the curve flattening just under $y = 4$ on the right.',
        },
      ],
      answer: 'Asymptote $y = 4$; $y$-intercept $(0, 2)$; $x$-intercept $(-1, 0)$; increasing; as $x \\to \\infty$, $f(x) \\to 4$, and as $x \\to -\\infty$, $f(x) \\to -\\infty$.',
    },
  ],
  teachMeAgain: [
    {
      approach: 'visual',
      title: 'See the asymptote as a dashed floor',
      blocks: [
        { t: 'p', text: 'Every exponential graph has one dashed line it hugs. Find it first, and the rest of the picture follows.' },
        {
          t: 'graph',
          caption: 'g(x) = 2(0.5)^x + 1 floats above its dashed floor y = 1 and gets closer to it the farther right you go.',
          spec: {
            xMin: -3,
            xMax: 6,
            yMin: -1,
            yMax: 10,
            functions: [
              { expr: '2*(0.5)^x + 1', label: 'g(x) = 2(0.5)^x + 1' },
              { expr: '1', label: 'y = 1', dashed: true },
            ],
            points: [
              { x: -2, y: 9, label: '(-2, 9)' },
              { x: -1, y: 5, label: '(-1, 5)' },
              { x: 0, y: 3, label: '(0, 3)' },
              { x: 1, y: 2, label: '(1, 2)' },
              { x: 2, y: 1.5, label: '(2, 1.5)' },
            ],
            ariaLabel: 'A decreasing curve through (-2, 9), (-1, 5), (0, 3), (1, 2) and (2, 1.5), flattening toward a dashed line at y = 1 on the right.',
          },
        },
        { t: 'p', text: 'The floor is at $y = 1$ (the $+1$). The curve crosses the $y$-axis $2$ above the floor, at $3$ (the $a = 2$). It goes down to the right because $0.5 < 1$.' },
      ],
    },
    {
      approach: 'simpler-example',
      title: 'Just 2^x, then move it',
      blocks: [
        { t: 'list', items: [
          '$y = 2^x$: outputs $\\frac{1}{2}, 1, 2, 4$ at $x = -1, 0, 1, 2$. $y$-intercept $1$, asymptote $y = 0$, increasing.',
          '$y = 2^x + 3$: add $3$ to every output: $3.5, 4, 5, 7$. $y$-intercept $4$, asymptote $y = 3$, still increasing.',
          '$y = -2^x$: take the opposite of every output: $-\\frac{1}{2}, -1, -2, -4$. $y$-intercept $-1$, asymptote $y = 0$, now decreasing.',
        ] },
        { t: 'p', text: 'Adding $k$ slides the picture up or down. A negative in front flips it over the asymptote.' },
      ],
    },
    {
      approach: 'analogy',
      title: 'Walking halfway to the wall',
      blocks: [
        { t: 'p', text: 'Stand $8$ feet from a wall. Each second, walk half of the distance that is left: $8, 4, 2, 1, \\frac{1}{2}, \\dots$ feet away. You get as close as you like, but you never touch the wall.' },
        { t: 'p', text: 'That is $d(t) = 8\\left(\\frac{1}{2}\\right)^t$, and the wall is the asymptote $d = 0$. If you measured from a line painted $3$ feet behind the wall instead, every distance would be $3$ feet longer: $8\\left(\\frac{1}{2}\\right)^t + 3$. You would get closer and closer to $3$ feet away from that line, so the asymptote moves up to $3$.' },
      ],
    },
    {
      approach: 'prerequisite',
      title: 'Refresher: end behavior arrows',
      blocks: [
        { t: 'p', text: 'The arrow $\\to$ is read "goes to" or "approaches."' },
        { t: 'list', items: [
          '"As $x \\to \\infty$" means "as $x$ gets larger and larger" (far right on the graph).',
          '"As $x \\to -\\infty$" means "as $x$ gets more and more negative" (far left).',
          '"$f(x) \\to \\infty$" means the outputs grow without bound. "$f(x) \\to 3$" means the outputs get closer and closer to $3$.',
        ] },
        { t: 'p', text: 'For a parabola that opens up, both ends go to $\\infty$. For an exponential function, one end goes to $\\pm\\infty$ and the other end levels off at the asymptote.' },
      ],
    },
    {
      approach: 'step-by-step',
      title: 'Read the features straight from the equation',
      blocks: [
        { t: 'p', text: 'For $f(x) = a(b)^x + k$, answer these in order. Example: $f(x) = 5(2)^x - 1$.' },
        { t: 'list', ordered: true, items: [
          '**Asymptote:** $y = k$. Here $y = -1$.',
          '**$y$-intercept:** $(0, a + k)$. Here $(0, 5 - 1) = (0, 4)$.',
          '**Above or below:** above the asymptote if $a > 0$, below if $a < 0$. Here above.',
          '**Direction:** for $a > 0$, increasing if $b > 1$ and decreasing if $0 < b < 1$ (reverse both when $a < 0$). Here $b = 2$: increasing.',
          '**End behavior:** the end that levels off goes to $k$. Here as $x \\to -\\infty$, $f(x) \\to -1$, and as $x \\to \\infty$, $f(x) \\to \\infty$.',
        ] },
      ],
    },
    {
      approach: 'alternate-strategy',
      title: 'Test far-away inputs',
      blocks: [
        { t: 'p', text: 'Not sure about the end behavior? Plug in a big input and a very negative one. For $f(x) = 2^x - 4$:' },
        { t: 'list', items: [
          '$f(10) = 1024 - 4 = 1020$. Big and getting bigger, so as $x \\to \\infty$, $f(x) \\to \\infty$.',
          '$f(-10) = \\frac{1}{1024} - 4 \\approx -3.999$. Just above $-4$, so as $x \\to -\\infty$, $f(x) \\to -4$.',
        ] },
        { t: 'p', text: 'The value the outputs settle near is the asymptote, $y = -4$.' },
      ],
    },
  ],
  guided: [
    { generator: 'u6.exp-features', difficulty: 1 },
    { generator: 'u6.exp-features', difficulty: 1 },
    { generator: 'u6.exp-features', difficulty: 2 },
    { generator: 'u6.exp-features', difficulty: 3 },
  ],
  independent: {
    count: 8,
    reviewCount: 2,
    mix: [
      { generator: 'u6.exp-features', difficulty: 1, weight: 2 },
      { generator: 'u6.exp-features', difficulty: 2, weight: 3 },
      { generator: 'u6.exp-features', difficulty: 3, weight: 3 },
    ],
  },
  quiz: {
    items: [
      { generator: 'u6.exp-features', difficulty: 1 },
      { generator: 'u6.exp-features', difficulty: 2 },
      { generator: 'u6.exp-features', difficulty: 2 },
      { generator: 'u6.exp-features', difficulty: 2 },
      { generator: 'u6.exp-features', difficulty: 3 },
      { generator: 'u6.exp-features', difficulty: 3 },
    ],
  },
  summary: [
    'The graph of $f(x) = a(b)^x + k$ has the horizontal asymptote $y = k$ ($y = 0$ when there is no shift). It gets closer and closer to that line but never reaches it, because $b^x > 0$.',
    'The $y$-intercept is $(0, a + k)$. There is an $x$-intercept only when the graph is shifted across the $x$-axis, like $2^x - 4$ at $(2, 0)$.',
    'With $a > 0$, the function is increasing if $b > 1$ and decreasing if $0 < b < 1$. A negative $a$ flips the graph below the asymptote and reverses the direction.',
    'End behavior: one end goes to $\\infty$ or $-\\infty$ and the other approaches $k$. For $2^x - 4$: as $x \\to \\infty$, $f(x) \\to \\infty$; as $x \\to -\\infty$, $f(x) \\to -4$.',
  ],
  mastery: { quizPassScore: 0.8, practiceMinCorrect: 5 },
};
