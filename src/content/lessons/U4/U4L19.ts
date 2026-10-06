import type { LessonContent } from '../../../core/curriculum/types';

/**
 * U4L19 Comparing Functions Represented Differently (A.FGR.7.9)
 * Compare the maximum or minimum, vertex, intercepts, axis of symmetry and average rate of change of two
 * quadratics given as an equation, a table, a graph or a verbal description: find each feature from each
 * representation first, then compare (S4.21).
 *
 * Math verified by hand (2026-10-06): every vertex, intercept and axis of symmetry below was found two ways (from the given form and by substitution or symmetry), every table value was recomputed from its function, every average rate was recomputed as (f(b) - f(a))/(b - a), and every graph point was checked to lie on its curve.
 */
export const U4L19: LessonContent = {
  lessonId: 'U4L19',
  goal: 'Compare two quadratic functions that are given in different ways (an equation, a table, a graph or a description) by first finding the same key feature from each one, such as the maximum or minimum, the vertex, the intercepts, the axis of symmetry or the average rate of change, and then comparing.',
  needToKnow: [
    { t: 'p', text: 'You already know how to find key features of a parabola:' },
    {
      t: 'list',
      items: [
        '**Vertex** $(h, k)$: the turning point. Its $y$-value $k$ is the **maximum** if the parabola opens down and the **minimum** if it opens up.',
        '**Axis of symmetry** $x = h$: the vertical line through the vertex.',
        '**y-intercept**: the output when $x = 0$. **x-intercepts (zeros)**: the inputs where the output is $0$.',
        '**Average rate of change** on $[a, b]$: $\\frac{f(b) - f(a)}{b - a}$.',
      ],
    },
    { t: 'callout', variant: 'tip', title: 'Quick check', text: 'What are the vertex and the minimum value of $y = (x - 4)^2 - 7$? (You should get the vertex $(4, -7)$ and the minimum $-7$.) If that felt shaky, open **Teach Me Again** and choose the refresher.' },
  ],
  vocabulary: [
    { term: 'representation', meaning: 'A way of showing a function: an equation, a table, a graph or a verbal description.' },
    { term: 'maximum value', meaning: 'The greatest output of a downward-opening parabola: the $y$-value of its vertex.' },
    { term: 'minimum value', meaning: 'The least output of an upward-opening parabola: the $y$-value of its vertex.' },
    { term: 'key features', meaning: 'The vertex, the maximum or minimum, the axis of symmetry, the intercepts, and where the function increases or decreases.' },
  ],
  instruction: [
    { t: 'p', text: '### Find first, then compare' },
    { t: 'p', text: 'You cannot compare an equation with a table directly; they speak different languages. So translate: **find the same feature from each representation**, write the two answers side by side as numbers, and only then compare. **Why it works:** a feature like "the maximum value" is a single number no matter how the function is shown, so once both are numbers, comparing is easy.' },
    {
      t: 'table',
      caption: 'Where to find each feature in each representation.',
      headers: ['Representation', 'Vertex and max or min', 'y-intercept', 'Axis of symmetry'],
      rows: [
        ['vertex form $a(x - h)^2 + k$', 'read $(h, k)$', 'substitute $x = 0$', '$x = h$'],
        ['standard form $ax^2 + bx + c$', '$x = -\\frac{b}{2a}$, then substitute', '$c$', '$x = -\\frac{b}{2a}$'],
        ['factored form $a(x - r)(x - s)$', 'midpoint $\\frac{r + s}{2}$, then substitute', 'substitute $x = 0$', '$x = \\frac{r + s}{2}$'],
        ['table', 'where the outputs turn around', 'the output at $x = 0$', 'the $x$ in the middle of matching outputs'],
        ['graph', 'read the turning point', 'where it crosses the y-axis', 'the vertical line through the vertex'],
        ['description', 'read it from the words', 'read it, or use the given facts', 'midpoint of the zeros, or the vertex'],
      ],
    },
    { t: 'p', text: '### An example: an equation versus a table' },
    { t: 'p', text: 'Compare $f(x) = -2(x - 1)^2 + 8$ with the function $g$ in this table.' },
    {
      t: 'table',
      caption: 'Values of the function g.',
      headers: ['$x$', '$-1$', '$0$', '$1$', '$2$', '$3$'],
      rows: [['$g(x)$', '$5$', '$8$', '$9$', '$8$', '$5$']],
    },
    { t: 'p', text: 'The table rises to $9$ and then falls, and the outputs match in pairs around $x = 1$ ($8$ and $8$, $5$ and $5$). So the vertex of $g$ is $(1, 9)$ and its maximum is $9$. The vertex of $f$ is $(1, 8)$ and $a = -2 < 0$, so its maximum is $8$.' },
    {
      t: 'table',
      caption: 'The features of f and g side by side.',
      headers: ['Feature', '$f$', '$g$', 'Comparison'],
      rows: [
        ['maximum value', '$8$', '$9$', '$g$ is greater by $1$'],
        ['axis of symmetry', '$x = 1$', '$x = 1$', 'the same'],
        ['y-intercept', '$f(0) = -2 + 8 = 6$', '$g(0) = 8$', '$g$ is greater by $2$'],
        ['average rate on $[1, 3]$', '$\\frac{f(3) - f(1)}{2} = \\frac{0 - 8}{2} = -4$', '$\\frac{g(3) - g(1)}{2} = \\frac{5 - 9}{2} = -2$', '$f$ falls faster'],
      ],
    },
    { t: 'callout', variant: 'warning', title: 'Compare the feature, not the coefficient', text: 'A bigger $a$ does not mean a bigger maximum. The maximum is the $y$-value of the vertex, $k$. The value of $a$ tells how narrow the parabola is and which way it opens, which affects rates of change but not the height of the vertex.' },
    { t: 'callout', variant: 'tip', title: 'A table may not show the vertex', text: 'If the outputs in a table do not turn around, the vertex is not in the table. Use matching outputs to find the axis: if $g(0) = g(6)$, the axis is $x = 3$, halfway between.' },
    { t: 'callout', variant: 'realworld', title: 'Where this shows up', text: 'One friend\'s app shows a jump as a graph, another\'s gives a table of heights, and a coach describes a third in words. To decide whose jump went highest, you find the maximum of each first.' },
  ],
  examples: [
    {
      title: 'An equation versus a graph',
      kind: 'introductory',
      problem: [
        { t: 'p', text: 'Compare $f(x) = (x - 2)^2 - 5$ with the function $g$ graphed below. Which has the smaller minimum? Which has the axis of symmetry farther right? Which has the greater y-intercept?' },
        {
          t: 'graph',
          caption: 'The graph of g, with its vertex and y-intercept labeled.',
          spec: {
            xMin: -5,
            xMax: 3,
            yMin: -4,
            yMax: 6,
            functions: [{ expr: '(x + 1)^2 - 3', label: 'g' }],
            points: [
              { x: -1, y: -3, label: 'vertex (-1, -3)' },
              { x: 0, y: -2, label: '(0, -2)' },
            ],
            ariaLabel: 'An upward parabola g with vertex (-1, -3) that crosses the y-axis at (0, -2).',
          },
        },
      ],
      steps: [
        { text: 'Find the features of $f$.', tex: '\\text{vertex } (2, -5), \\quad \\text{min } -5, \\quad x = 2, \\quad f(0) = 4 - 5 = -1', why: 'Vertex form shows $(h, k) = (2, -5)$, and $a = 1 > 0$, so $-5$ is a minimum.' },
        { text: 'Find the features of $g$.', tex: '\\text{vertex } (-1, -3), \\quad \\text{min } -3, \\quad x = -1, \\quad g(0) = -2', why: 'Read the turning point and the y-axis crossing from the graph. It opens up, so the vertex gives the minimum.' },
        { text: 'Compare each pair.', why: '$-5 < -3$, so $f$ has the smaller minimum. $2 > -1$, so the axis of $f$ is farther right. $-1 > -2$, so $f$ has the greater y-intercept.' },
      ],
      answer: '$f$ has the smaller minimum ($-5$ vs. $-3$), the axis farther right ($x = 2$ vs. $x = -1$) and the greater y-intercept ($-1$ vs. $-2$).',
    },
    {
      title: 'Standard form versus a table',
      kind: 'intermediate',
      problem: [
        { t: 'p', text: 'Compare $f(x) = -x^2 + 4x + 1$ with the function $g$ in the table. Which has the greater maximum, and by how much? Which has its axis of symmetry farther right?' },
        {
          t: 'table',
          caption: 'Values of the function g.',
          headers: ['$x$', '$0$', '$1$', '$2$', '$3$', '$4$', '$5$', '$6$'],
          rows: [['$g(x)$', '$-8$', '$-3$', '$0$', '$1$', '$0$', '$-3$', '$-8$']],
        },
      ],
      steps: [
        { text: 'Find the vertex of $f$.', tex: 'x = -\\frac{4}{2(-1)} = 2, \\quad f(2) = -4 + 8 + 1 = 5', why: 'In standard form the axis is $x = -\\frac{b}{2a}$. Substitute to get the $y$-value. $a = -1 < 0$, so $5$ is a maximum.' },
        { text: 'Find the vertex of $g$.', tex: '(3, 1)', why: 'The outputs rise to $1$ at $x = 3$ and then fall, and they match in pairs around $x = 3$: $0$ and $0$, $-3$ and $-3$, $-8$ and $-8$.' },
        { text: 'Compare the maximums.', tex: '5 - 1 = 4', why: 'Both are numbers now, so subtract to find how much greater.' },
        { text: 'Compare the axes.', why: 'The axis of $g$ is $x = 3$ and the axis of $f$ is $x = 2$, so the axis of $g$ is farther right.' },
      ],
      answer: '$f$ has the greater maximum, by $4$ ($5$ vs. $1$). $g$ has its axis farther right ($x = 3$ vs. $x = 2$).',
    },
    {
      title: 'Factored form versus a description',
      kind: 'intermediate',
      problem: [{ t: 'p', text: 'Let $f(x) = 2(x + 1)(x - 5)$. The function $g$ is described this way: "Its graph opens upward, its x-intercepts are $0$ and $8$, and its minimum value is $-12$." Which has the lower minimum? Which has the greater y-intercept?' }],
      steps: [
        { text: 'Find the vertex of $f$.', tex: 'x = \\frac{-1 + 5}{2} = 2, \\quad f(2) = 2(3)(-3) = -18', why: 'The axis of symmetry is halfway between the zeros $-1$ and $5$. $a = 2 > 0$, so $-18$ is a minimum.' },
        { text: 'Find the features of $g$ from the words.', tex: '\\text{min } -12, \\quad \\text{axis } x = \\frac{0 + 8}{2} = 4, \\quad g(0) = 0', why: 'The minimum is given. Since $0$ is an x-intercept, the point $(0, 0)$ is on the graph, so the y-intercept is $0$.' },
        { text: 'Find the y-intercept of $f$.', tex: 'f(0) = 2(1)(-5) = -10', why: 'Substitute $x = 0$ into the factored form.' },
        { text: 'Compare.', why: '$-18 < -12$, so $f$ has the lower minimum. $0 > -10$, so $g$ has the greater y-intercept.' },
      ],
      answer: '$f$ has the lower minimum ($-18$ vs. $-12$); $g$ has the greater y-intercept ($0$ vs. $-10$).',
    },
    {
      title: 'A common mistake: misreading the vertex form',
      kind: 'common-mistake',
      problem: [
        { t: 'p', text: 'Compare $f(x) = -(x + 4)^2 + 6$ with the function $g$ graphed below. A student says: "The axis of $f$ is $x = 4$, which is farther right than the axis of $g$, $x = 1$." Is the student right?' },
        {
          t: 'graph',
          caption: 'The graph of g, with its vertex labeled.',
          spec: {
            xMin: -3,
            xMax: 5,
            yMin: -5,
            yMax: 5,
            functions: [{ expr: '-(x - 1)^2 + 3', label: 'g' }],
            points: [
              { x: 1, y: 3, label: 'vertex (1, 3)' },
              { x: 0, y: 2, label: '(0, 2)' },
            ],
            ariaLabel: 'A downward parabola g with vertex (1, 3) that crosses the y-axis at (0, 2).',
          },
        },
      ],
      steps: [
        { text: 'Rewrite $f$ to match $a(x - h)^2 + k$.', tex: 'f(x) = -(x - (-4))^2 + 6', why: 'Vertex form subtracts $h$. Adding $4$ is the same as subtracting $-4$, so $h = -4$, not $4$.' },
        { text: 'Find the axis of $f$.', tex: 'x = -4', why: 'The vertex of $f$ is $(-4, 6)$. Check: $f(-4) = -(0)^2 + 6 = 6$, the largest possible output.' },
        { text: 'Read the axis of $g$ and compare.', tex: 'x = 1 \\quad\\text{vs.}\\quad x = -4', why: 'The vertex of $g$ is $(1, 3)$. On a number line, $1$ is to the right of $-4$.' },
        { text: 'Compare the maximums too.', why: 'Both open down. The maximum of $f$ is $6$ and of $g$ is $3$, so $f$ has the greater maximum, even though its axis is farther left.' },
      ],
      answer: 'No. The axis of $f$ is $x = -4$, so $g$ (axis $x = 1$) has the axis farther right. The student flipped the sign of $h$.',
    },
    {
      title: 'Whose water rocket went higher?',
      kind: 'real-world',
      problem: [
        { t: 'p', text: 'In a science-club contest, Maya\'s water rocket has height $h(t) = -16t^2 + 48t + 5$ feet after $t$ seconds. Jordan launched his from a balcony, and his teammate recorded the table below. Whose rocket went higher, and by how much? Whose rocket climbed faster during the first second?' },
        {
          t: 'table',
          caption: 'Height of Jordan\'s rocket.',
          headers: ['$t$ (s)', '$0$', '$0.5$', '$1$', '$1.5$', '$2$'],
          rows: [['height (ft)', '$20$', '$32$', '$36$', '$32$', '$20$']],
        },
      ],
      steps: [
        { text: 'Find the maximum of Maya\'s rocket.', tex: 't = -\\frac{48}{2(-16)} = 1.5, \\quad h(1.5) = -16(2.25) + 72 + 5 = 41 \\text{ ft}', why: '$a = -16 < 0$, so the vertex is the highest point.' },
        { text: 'Find the maximum of Jordan\'s rocket.', tex: '36 \\text{ ft at } t = 1', why: 'The heights rise to $36$ and fall, matching in pairs around $t = 1$ ($32$ and $32$, $20$ and $20$).' },
        { text: 'Compare the maximums.', tex: '41 - 36 = 5 \\text{ ft}', why: 'Both are heights in feet, so subtract.' },
        { text: 'Compare average rates on $[0, 1]$.', tex: '\\text{Maya: } \\frac{h(1) - h(0)}{1 - 0} = \\frac{37 - 5}{1} = 32 \\text{ ft/s}, \\qquad \\text{Jordan: } \\frac{36 - 20}{1} = 16 \\text{ ft/s}', why: '$h(1) = -16 + 48 + 5 = 37$. The rate tells how fast each rocket climbed, on average, in the first second.' },
      ],
      answer: 'Maya\'s rocket went higher, by $5$ feet ($41$ ft vs. $36$ ft), and climbed faster in the first second ($32$ ft/s vs. $16$ ft/s). Jordan\'s started higher ($20$ ft vs. $5$ ft) and peaked sooner ($1$ s vs. $1.5$ s).',
    },
    {
      title: 'Three functions, three representations',
      kind: 'challenging',
      problem: [
        { t: 'p', text: 'Compare $f(x) = x^2 - 6x + 5$, the function $g$ in the graph, and a function $h$ described as: "It opens upward, its x-intercepts are $-2$ and $4$, and its y-intercept is $-16$." (a) Which has the least minimum? (b) Which has its axis farthest right? (c) Find each one\'s average rate of change on $[0, 2]$.' },
        {
          t: 'graph',
          caption: 'The graph of g, with its vertex and x-intercepts labeled.',
          spec: {
            xMin: -1,
            xMax: 5,
            yMin: -10,
            yMax: 10,
            yStep: 2,
            functions: [{ expr: '2(x - 2)^2 - 8', label: 'g' }],
            points: [
              { x: 2, y: -8, label: 'vertex (2, -8)' },
              { x: 0, y: 0, label: '(0, 0)' },
              { x: 4, y: 0, label: '(4, 0)' },
            ],
            ariaLabel: 'An upward parabola g with vertex (2, -8) that crosses the x-axis at (0, 0) and (4, 0).',
          },
        },
      ],
      steps: [
        { text: 'Features of $f$.', tex: 'x = -\\frac{-6}{2(1)} = 3, \\quad f(3) = 9 - 18 + 5 = -4', why: 'Standard form: the axis is $x = -\\frac{b}{2a}$. Opens up, so the minimum is $-4$.' },
        { text: 'Features of $g$.', tex: '\\text{vertex } (2, -8), \\quad \\text{min } -8, \\quad x = 2', why: 'Read from the graph. The zeros $0$ and $4$ agree: their midpoint is $2$.' },
        { text: 'Features of $h$: first find $a$.', tex: 'h(x) = a(x + 2)(x - 4), \\quad h(0) = a(2)(-4) = -8a = -16 \\;\\Longrightarrow\\; a = 2', why: 'The description gives the zeros, so start from factored form, and the y-intercept gives $a$. The minimum is not given, so we must build it.' },
        { text: 'The vertex of $h$.', tex: 'x = \\frac{-2 + 4}{2} = 1, \\quad h(1) = 2(3)(-3) = -18', why: 'The axis is the midpoint of the zeros; substitute to get the minimum.' },
        { text: '(a) and (b): compare.', why: 'Minimums: $-18 < -8 < -4$, so $h$ has the least. Axes: $x = 3$, $x = 2$, $x = 1$, so $f$ is farthest right.' },
        { text: '(c) Average rates on $[0, 2]$.', tex: 'f: \\frac{-3 - 5}{2} = -4, \\qquad g: \\frac{-8 - 0}{2} = -4, \\qquad h: \\frac{-16 - (-16)}{2} = 0', why: '$f(2) = 4 - 12 + 5 = -3$, $g(2) = -8$ from the graph, and $h(2) = 2(4)(-2) = -16$. $h$ gets $0$ because $[0, 2]$ is centered on its axis $x = 1$, so the two ends have equal outputs.' },
      ],
      answer: '(a) $h$ (minimum $-18$); (b) $f$ (axis $x = 3$); (c) $f$ and $g$ both $-4$, and $h$ is $0$.',
    },
  ],
  teachMeAgain: [
    {
      approach: 'visual',
      title: 'Put both on one graph',
      blocks: [
        { t: 'p', text: 'Here are $f(x) = -2(x - 1)^2 + 8$ and the table function $g(x) = -(x - 1)^2 + 9$ from the lesson, drawn together.' },
        {
          t: 'graph',
          caption: 'f and g share the axis x = 1. The vertex of g is 1 unit higher, and g is wider.',
          spec: {
            xMin: -3,
            xMax: 5,
            yMin: -4,
            yMax: 10,
            functions: [
              { expr: '-2(x - 1)^2 + 8', label: 'f' },
              { expr: '-(x - 1)^2 + 9', label: 'g' },
            ],
            points: [
              { x: 1, y: 8, label: 'f vertex (1, 8)' },
              { x: 1, y: 9, label: 'g vertex (1, 9)' },
              { x: 0, y: 6, label: '(0, 6)' },
              { x: 0, y: 8, label: '(0, 8)' },
            ],
            ariaLabel: 'Two downward parabolas with the same axis x = 1. The narrower one, f, has vertex (1, 8) and y-intercept (0, 6). The wider one, g, has vertex (1, 9) and y-intercept (0, 8).',
          },
        },
        { t: 'p', text: 'Now each comparison is something you can see: the higher peak is the greater maximum ($g$), the higher crossing of the y-axis is the greater y-intercept ($g$), and both peaks sit on the same vertical line. When you cannot draw both, finding the features does the same job with numbers.' },
      ],
    },
    {
      approach: 'simpler-example',
      title: 'Two equations in vertex form',
      blocks: [
        { t: 'p', text: 'Start with two functions shown the same way: $f(x) = (x - 3)^2 + 1$ and $g(x) = (x + 2)^2 - 4$.' },
        { t: 'list', items: [
          'Vertices: $f$ has $(3, 1)$ and $g$ has $(-2, -4)$.',
          'Both open up, so these give minimums: $1$ and $-4$. $g$ has the smaller minimum.',
          'Axes: $x = 3$ and $x = -2$. $f$ is farther right.',
        ] },
        { t: 'p', text: 'Comparing functions shown differently is exactly the same, with one extra first step: get the vertex out of each representation.' },
      ],
    },
    {
      approach: 'analogy',
      title: 'Comparing prices in different currencies',
      blocks: [
        { t: 'p', text: 'Your friend in Canada says a game costs $70$ Canadian dollars; you see it for $55$ U.S. dollars. You cannot compare $70$ with $55$ until you convert them to the **same** currency.' },
        { t: 'p', text: 'Representations are like currencies. An equation, a table, a graph and a description can all describe a maximum, but you have to "convert" each one to the same thing, a plain number, before you compare. Converting is the main work; comparing is the quick last step.' },
      ],
    },
    {
      approach: 'prerequisite',
      title: 'Refresher: the vertex from every form',
      blocks: [
        { t: 'list', items: [
          '**Vertex form** $y = 3(x + 1)^2 - 2$: read it, with the sign flipped inside: $(-1, -2)$.',
          '**Standard form** $y = x^2 - 8x + 10$: $x = -\\frac{-8}{2} = 4$, then $y = 16 - 32 + 10 = -6$, so $(4, -6)$.',
          '**Factored form** $y = (x - 1)(x - 7)$: midpoint $x = 4$, then $y = (3)(-3) = -9$, so $(4, -9)$.',
          '**Table** with outputs $7, 2, -1, -2, -1, 2, 7$ at $x = 0, 1, 2, 3, 4, 5, 6$: the outputs turn at $x = 3$, so $(3, -2)$.',
        ] },
        { t: 'p', text: 'The $y$-value of the vertex is the maximum (opens down) or the minimum (opens up).' },
      ],
    },
    {
      approach: 'step-by-step',
      title: 'Make a feature chart',
      blocks: [
        { t: 'list', ordered: true, items: [
          '**Read the question** and circle the feature it asks about (maximum, y-intercept, axis, rate...).',
          '**Make a chart** with one column for each function.',
          '**Fill in the feature for the first function** using the method for its representation.',
          '**Fill in the feature for the second function** the same way.',
          '**Compare the numbers** and answer in a sentence: "$g$ has the greater maximum, by $2$."',
          '**Check that you compared the right thing**: a maximum is a $y$-value, an axis is an $x$-value.',
        ] },
      ],
    },
    {
      approach: 'alternate-strategy',
      title: 'Turn the equation into a table',
      blocks: [
        { t: 'p', text: 'Instead of finding the vertex of $f(x) = -x^2 + 4x + 1$ with a formula, make a table of $f$ using the same inputs as the table of $g$ from the second worked example.' },
        {
          t: 'table',
          caption: 'f and g at the same inputs.',
          headers: ['$x$', '$0$', '$1$', '$2$', '$3$', '$4$', '$5$', '$6$'],
          rows: [
            ['$f(x)$', '$1$', '$4$', '$5$', '$4$', '$1$', '$-4$', '$-11$'],
            ['$g(x)$', '$-8$', '$-3$', '$0$', '$1$', '$0$', '$-3$', '$-8$'],
          ],
        },
        { t: 'p', text: 'Now both are tables. $f$ turns around at $(2, 5)$ and $g$ at $(3, 1)$, so $f$ has the greater maximum (by $4$) and $g$ has the axis farther right. Same answers as the formula, found a different way.' },
      ],
    },
  ],
  guided: [
    { generator: 'u4.compare-functions', difficulty: 1 },
    { generator: 'u4.compare-functions', difficulty: 1 },
    { generator: 'u4.compare-functions', difficulty: 1 },
    { generator: 'u4.compare-functions', difficulty: 1 },
  ],
  independent: {
    count: 8,
    reviewCount: 2,
    mix: [
      { generator: 'u4.compare-functions', difficulty: 1, weight: 1 },
      { generator: 'u4.compare-functions', difficulty: 2, weight: 2 },
      { generator: 'u4.compare-functions', difficulty: 3, weight: 1 },
    ],
  },
  quiz: {
    items: [
      { generator: 'u4.compare-functions', difficulty: 2 },
      { generator: 'u4.compare-functions', difficulty: 2 },
      { generator: 'u4.compare-functions', difficulty: 2 },
      { generator: 'u4.compare-functions', difficulty: 3 },
      { generator: 'u4.compare-functions', difficulty: 3 },
      { generator: 'u4.compare-functions', difficulty: 3 },
    ],
  },
  summary: [
    'To compare functions shown differently, first find the same feature from each representation, then compare the numbers.',
    'The maximum or minimum is the $y$-value of the vertex; the axis of symmetry is the $x$-value of the vertex, $x = h$.',
    'In a table, the vertex is where the outputs turn around, and the axis is halfway between matching outputs; in factored form, it is the midpoint of the zeros.',
    'Watch the sign in vertex form: $-(x + 4)^2 + 6$ has vertex $(-4, 6)$, and a bigger $a$ does not mean a bigger maximum.',
  ],
  mastery: { quizPassScore: 0.8, practiceMinCorrect: 5 },
};
