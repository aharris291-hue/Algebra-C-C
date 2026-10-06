import type { LessonContent } from '../../../core/curriculum/types';

/**
 * U4L13 Graphing Quadratics: Key Features (A.FGR.7.3)
 * Vertex and axis of symmetry from vertex, standard (x = -b/(2a)) and factored form, x- and y-intercepts,
 * maximum or minimum from the sign of a, intervals of increase and decrease, positive and negative
 * intervals, end behavior, symmetric points, and graphing a parabola from a table (S4.15).
 *
 * Math verified by hand (2026-10-06): every vertex, axis, intercept, symmetric point, table value, interval and graph point below was recomputed independently and checked by substitution.
 */
export const U4L13: LessonContent = {
  lessonId: 'U4L13',
  goal: 'Find the key features of a parabola, such as $f(x) = -x^2 + 4x + 5$ with vertex $(2, 9)$, axis $x = 2$, $x$-intercepts $-1$ and $5$ and $y$-intercept $5$, and describe where it increases, decreases, is positive or negative, and what happens at its ends.',
  needToKnow: [
    { t: 'p', text: 'This lesson reads quadratics as graphs. You will need:' },
    {
      t: 'list',
      items: [
        '**Evaluating.** For $f(x) = -x^2 + 4x + 5$, $f(2) = -(2)^2 + 4(2) + 5 = -4 + 8 + 5 = 9$.',
        '**Solving by factoring.** $-x^2 + 4x + 5 = 0$ is $-(x - 5)(x + 1) = 0$, so $x = 5$ or $x = -1$.',
        '**Interval notation.** $(-\\infty, 2)$ means all numbers less than $2$; $(-1, 5)$ means all numbers between $-1$ and $5$. A parenthesis means the endpoint is not included.',
        '**Key features of a graph** from Unit 1: intercepts, increasing and decreasing, and maximum and minimum points.',
      ],
    },
    { t: 'callout', variant: 'tip', title: 'Quick check', text: 'What are the solutions of $(x - 2)(x - 4) = 0$? (You should get $x = 2$ and $x = 4$.) If that felt shaky, open **Teach Me Again** and choose the refresher.' },
  ],
  vocabulary: [
    { term: 'parabola', meaning: 'The U-shaped graph of a quadratic function.' },
    { term: 'vertex', meaning: 'The turning point of a parabola: its highest point if it opens down, its lowest point if it opens up.' },
    { term: 'axis of symmetry', meaning: 'The vertical line through the vertex, $x = h$. The parabola is a mirror image of itself across this line.' },
    { term: 'maximum and minimum', meaning: 'The greatest or least output. A parabola that opens down has a maximum value at its vertex; one that opens up has a minimum value there.' },
    { term: 'x-intercepts (zeros)', meaning: 'Where the graph meets the $x$-axis, so $f(x) = 0$. A parabola has two, one, or none.' },
    { term: 'y-intercept', meaning: 'Where the graph crosses the $y$-axis, the point $(0, f(0))$.' },
    { term: 'end behavior', meaning: 'What the outputs do as $x$ goes far to the left ($x \\to -\\infty$) and far to the right ($x \\to \\infty$).' },
  ],
  instruction: [
    { t: 'p', text: '### The parts of a parabola' },
    { t: 'p', text: 'Here is $f(x) = -x^2 + 4x + 5$. Every feature in this lesson is labeled on it.' },
    {
      t: 'graph',
      caption: 'A downward parabola with its vertex, axis of symmetry, intercepts and a pair of mirror points labeled.',
      spec: {
        xMin: -3,
        xMax: 7,
        yMin: -6,
        yMax: 11,
        functions: [{ expr: '-x^2 + 4x + 5', label: 'f(x) = -x^2 + 4x + 5' }],
        segments: [{ x1: 2, y1: -6, x2: 2, y2: 11, dashed: true, label: 'axis x = 2' }],
        points: [
          { x: 2, y: 9, label: 'vertex (2, 9)' },
          { x: -1, y: 0, label: '(-1, 0)' },
          { x: 5, y: 0, label: '(5, 0)' },
          { x: 0, y: 5, label: 'y-intercept (0, 5)' },
          { x: 4, y: 5, label: 'mirror point (4, 5)' },
        ],
        ariaLabel: 'A downward parabola with vertex (2, 9) and a dashed vertical axis of symmetry at x = 2. It crosses the x-axis at (-1, 0) and (5, 0), crosses the y-axis at (0, 5), and passes through the mirror point (4, 5).',
      },
    },
    {
      t: 'list',
      items: [
        '**Opens down**, because $a = -1 < 0$. So the vertex is the highest point and $9$ is the **maximum** value.',
        '**Vertex** $(2, 9)$ and **axis of symmetry** $x = 2$.',
        '**x-intercepts** $(-1, 0)$ and $(5, 0)$; **y-intercept** $(0, 5)$.',
        '**Symmetric points:** $(0, 5)$ is $2$ units left of the axis, so $(4, 5)$, $2$ units right, is also on the graph.',
      ],
    },
    { t: 'p', text: '### Three forms, three different views' },
    { t: 'p', text: 'The same function can be written three ways. Each form shows some features right away.' },
    {
      t: 'table',
      caption: 'Three equivalent forms of the same quadratic and what each one shows directly.',
      headers: ['Form', 'This function', 'Shows directly'],
      rows: [
        ['vertex form $a(x - h)^2 + k$', '$-(x - 2)^2 + 9$', 'vertex $(h, k) = (2, 9)$'],
        ['standard form $ax^2 + bx + c$', '$-x^2 + 4x + 5$', '$y$-intercept $c = 5$'],
        ['factored form $a(x - r)(x - s)$', '$-(x - 5)(x + 1)$', '$x$-intercepts $r = 5$, $s = -1$'],
      ],
    },
    { t: 'p', text: 'All three show $a = -1$, so all three tell you the parabola opens down.' },
    { t: 'p', text: '### Finding the vertex and axis from any form' },
    {
      t: 'list',
      items: [
        '**Vertex form** $a(x - h)^2 + k$: the vertex is $(h, k)$. Watch the sign: $2(x + 1)^2 - 8 = 2(x - (-1))^2 - 8$ has vertex $(-1, -8)$.',
        '**Standard form** $ax^2 + bx + c$: the axis is $x = -\\frac{b}{2a}$. Substitute that $x$ to get the $y$-coordinate. For $-x^2 + 4x + 5$: $x = -\\frac{4}{2(-1)} = 2$, and $f(2) = 9$.',
        '**Factored form** $a(x - r)(x - s)$: the axis is halfway between the zeros, $x = \\frac{r + s}{2}$. For $-(x - 5)(x + 1)$: $x = \\frac{5 + (-1)}{2} = 2$.',
      ],
    },
    { t: 'callout', variant: 'why', title: 'Why the axis is x = -b/(2a)', text: 'The quadratic formula gives the zeros as $\\frac{-b + \\sqrt{b^2 - 4ac}}{2a}$ and $\\frac{-b - \\sqrt{b^2 - 4ac}}{2a}$. The axis is exactly halfway between them. Averaging the two, the $+\\sqrt{\\;}$ and $-\\sqrt{\\;}$ cancel, leaving $-\\frac{b}{2a}$. The formula $x = -\\frac{b}{2a}$ still gives the axis when the parabola has no $x$-intercepts, even though this argument needs them.' },
    { t: 'p', text: '### Intercepts' },
    {
      t: 'list',
      items: [
        '**y-intercept:** substitute $x = 0$. In standard form this is just $c$. For $-(x - 5)(x + 1)$: $-(0 - 5)(0 + 1) = -(-5)(1) = 5$.',
        '**x-intercepts:** solve $f(x) = 0$. Factored form gives them directly. From vertex form, solve $a(x - h)^2 + k = 0$ with square roots: $-(x - 2)^2 + 9 = 0$ gives $(x - 2)^2 = 9$, so $x - 2 = \\pm 3$, and $x = 5$ or $x = -1$.',
      ],
    },
    { t: 'p', text: '### Maximum or minimum: look at the sign of a' },
    {
      t: 'table',
      caption: 'How the sign of a decides the shape and the features.',
      headers: ['', '$a > 0$ (opens up)', '$a < 0$ (opens down)'],
      rows: [
        ['vertex is the', 'lowest point', 'highest point'],
        ['$k$ is the', 'minimum value', 'maximum value'],
        ['decreasing on', '$(-\\infty, h)$', '$(h, \\infty)$'],
        ['increasing on', '$(h, \\infty)$', '$(-\\infty, h)$'],
        ['end behavior', 'as $x \\to \\pm\\infty$, $f(x) \\to \\infty$', 'as $x \\to \\pm\\infty$, $f(x) \\to -\\infty$'],
      ],
    },
    { t: 'p', text: '### Increasing, decreasing, positive and negative' },
    { t: 'p', text: 'Read the graph **from left to right**, like reading a sentence. For $f(x) = -x^2 + 4x + 5$:' },
    {
      t: 'list',
      items: [
        '**Increasing** (going uphill) on $(-\\infty, 2)$ and **decreasing** (going downhill) on $(2, \\infty)$. These are $x$-intervals, and they stop at the vertex\'s $x$-coordinate, $2$, not at $9$.',
        '**Positive** ($f(x) > 0$, above the $x$-axis) on $(-1, 5)$, between the zeros.',
        '**Negative** ($f(x) < 0$, below the $x$-axis) when $x < -1$ or $x > 5$.',
        '**End behavior:** as $x \\to -\\infty$, $f(x) \\to -\\infty$, and as $x \\to \\infty$, $f(x) \\to -\\infty$. Both ends point down.',
      ],
    },
    { t: 'callout', variant: 'warning', title: 'Open intervals at the vertex', text: 'Write $(-\\infty, 2)$ with a parenthesis at $2$. At the vertex the graph is turning, so it is neither going up nor going down at that exact point. Intervals are always about $x$-values.' },
    { t: 'p', text: '### Graphing a parabola from a table' },
    { t: 'p', text: 'To graph $g(x) = x^2 - 6x + 8$, find the axis first: $x = -\\frac{-6}{2(1)} = 3$. Then choose $x$-values centered on $3$ so the symmetry shows up in the table.' },
    {
      t: 'table',
      caption: 'Values of g(x) = x squared minus 6x plus 8, centered on the axis x = 3.',
      headers: ['$x$', '$0$', '$1$', '$2$', '$3$', '$4$', '$5$', '$6$'],
      rows: [['$g(x)$', '$8$', '$3$', '$0$', '$-1$', '$0$', '$3$', '$8$']],
    },
    {
      t: 'graph',
      caption: 'Plotting the table and connecting the points with a smooth U gives the parabola.',
      spec: {
        xMin: -1,
        xMax: 7,
        yMin: -3,
        yMax: 10,
        functions: [{ expr: 'x^2 - 6x + 8', label: 'g(x) = x^2 - 6x + 8' }],
        segments: [{ x1: 3, y1: -3, x2: 3, y2: 10, dashed: true, label: 'x = 3' }],
        points: [
          { x: 0, y: 8, label: '(0, 8)' },
          { x: 1, y: 3, label: '(1, 3)' },
          { x: 2, y: 0, label: '(2, 0)' },
          { x: 3, y: -1, label: 'vertex (3, -1)' },
          { x: 4, y: 0, label: '(4, 0)' },
          { x: 5, y: 3, label: '(5, 3)' },
          { x: 6, y: 8, label: '(6, 8)' },
        ],
        ariaLabel: 'An upward parabola through (0, 8), (1, 3), (2, 0), (3, -1), (4, 0), (5, 3) and (6, 8), with a dashed axis of symmetry at x = 3. The vertex (3, -1) is the lowest point.',
      },
    },
    { t: 'p', text: 'The outputs repeat in mirror pairs around $x = 3$: $3$ and $3$, $0$ and $0$, $8$ and $8$. Since $a = 1 > 0$, it opens up with **minimum** $-1$; it decreases on $(-\\infty, 3)$, increases on $(3, \\infty)$, is negative on $(2, 4)$, and is positive when $x < 2$ or $x > 4$.' },
    { t: 'callout', variant: 'realworld', title: 'Where this shows up', text: 'For a kicked ball, the vertex is the highest point and when it happens, the $x$-intercepts are kick-off and landing, and "increasing" is the time the ball is rising. Game designers use the axis of symmetry to make a jump arc look even.' },
  ],
  examples: [
    {
      title: 'Features from vertex form',
      kind: 'introductory',
      problem: [{ t: 'p', text: 'For $y = 2(x + 1)^2 - 8$, find the vertex, axis of symmetry, whether it has a maximum or minimum, the $y$-intercept and the $x$-intercepts.' }],
      steps: [
        { text: 'Match to $a(x - h)^2 + k$.', tex: '2(x + 1)^2 - 8 = 2(x - (-1))^2 + (-8)', why: 'Vertex form subtracts $h$, so $x + 1$ means $h = -1$.' },
        { text: 'Read the vertex and axis.', tex: '\\text{vertex } (-1, -8), \\quad \\text{axis } x = -1', why: 'The axis is the vertical line through the vertex.' },
        { text: 'Maximum or minimum?', why: '$a = 2 > 0$, so the parabola opens up. The vertex is the lowest point, so the **minimum** value is $-8$.' },
        { text: 'y-intercept: substitute $x = 0$.', tex: '2(0 + 1)^2 - 8 = 2 - 8 = -6', why: 'The $y$-axis is where $x = 0$.' },
        { text: 'x-intercepts: set $y = 0$ and use square roots.', tex: '2(x + 1)^2 = 8 \\Rightarrow (x + 1)^2 = 4 \\Rightarrow x + 1 = \\pm 2 \\Rightarrow x = 1 \\text{ or } x = -3', why: 'Isolate the square, then take both square roots. Check: $2(2)^2 - 8 = 0$ and $2(-2)^2 - 8 = 0$. The zeros $-3$ and $1$ are each $2$ units from the axis $x = -1$, as symmetry says.' },
      ],
      answer: 'Vertex $(-1, -8)$, axis $x = -1$, minimum $-8$, $y$-intercept $(0, -6)$, $x$-intercepts $(-3, 0)$ and $(1, 0)$',
    },
    {
      title: 'Features from standard form',
      kind: 'intermediate',
      problem: [{ t: 'p', text: 'For $f(x) = x^2 + 6x + 5$, find the axis of symmetry, vertex, intercepts, and the intervals where $f$ is increasing and decreasing.' }],
      steps: [
        { text: 'Axis: use $x = -\\frac{b}{2a}$ with $a = 1$, $b = 6$.', tex: 'x = -\\frac{6}{2(1)} = -3', why: 'The axis is halfway between the zeros, which the formula finds without solving.' },
        { text: 'Vertex: substitute $x = -3$.', tex: 'f(-3) = (-3)^2 + 6(-3) + 5 = 9 - 18 + 5 = -4', why: 'The vertex is on the axis, so its $y$-coordinate is the output there. Vertex $(-3, -4)$.' },
        { text: 'y-intercept.', tex: 'f(0) = 5', why: 'In standard form the constant $c$ is the output at $x = 0$.' },
        { text: 'x-intercepts: factor.', tex: 'x^2 + 6x + 5 = (x + 5)(x + 1) = 0 \\Rightarrow x = -5 \\text{ or } x = -1', why: '$5$ and $1$ multiply to $5$ and add to $6$. Their midpoint $\\frac{-5 + (-1)}{2} = -3$ matches the axis.' },
        { text: 'Increasing and decreasing.', why: '$a = 1 > 0$, so it opens up: it goes downhill until the vertex and uphill after. Decreasing on $(-\\infty, -3)$, increasing on $(-3, \\infty)$.' },
      ],
      answer: 'Axis $x = -3$, vertex $(-3, -4)$ (a minimum), $y$-intercept $(0, 5)$, $x$-intercepts $(-5, 0)$ and $(-1, 0)$; decreasing on $(-\\infty, -3)$, increasing on $(-3, \\infty)$',
    },
    {
      title: 'Features from factored form',
      kind: 'intermediate',
      problem: [{ t: 'p', text: 'For $y = -2(x - 1)(x - 5)$, find the $x$-intercepts, axis of symmetry, vertex, $y$-intercept, and where $y$ is positive.' }],
      steps: [
        { text: 'x-intercepts: set each factor to $0$.', tex: 'x - 1 = 0 \\Rightarrow x = 1, \\quad x - 5 = 0 \\Rightarrow x = 5', why: 'Zero product property. The constant $-2$ is never $0$, so it adds no zeros.' },
        { text: 'Axis: the midpoint of the zeros.', tex: 'x = \\frac{1 + 5}{2} = 3', why: 'The parabola is symmetric, so the axis sits exactly halfway between its two $x$-intercepts.' },
        { text: 'Vertex: substitute $x = 3$.', tex: 'y = -2(3 - 1)(3 - 5) = -2(2)(-2) = 8', why: 'Vertex $(3, 8)$. Since $a = -2 < 0$ it opens down, so $8$ is the maximum value.' },
        { text: 'y-intercept: substitute $x = 0$.', tex: 'y = -2(0 - 1)(0 - 5) = -2(-1)(-5) = -10', why: '$(-1)(-5) = 5$, and $-2 \\cdot 5 = -10$.' },
        { text: 'Positive interval.', why: 'Opening down, the graph is above the $x$-axis only between its zeros: positive on $(1, 5)$.' },
      ],
      answer: '$x$-intercepts $(1, 0)$ and $(5, 0)$, axis $x = 3$, vertex $(3, 8)$ (maximum), $y$-intercept $(0, -10)$, positive on $(1, 5)$',
    },
    {
      title: 'A common mistake: the sign of h',
      kind: 'common-mistake',
      problem: [{ t: 'p', text: 'A student says $y = (x + 4)^2 - 3$ has vertex $(4, -3)$ and axis $x = 4$. Find the mistake and fix it.' }],
      steps: [
        { text: 'Test the student vertex.', tex: 'x = 4: \\quad (4 + 4)^2 - 3 = 64 - 3 = 61', why: 'If $(4, -3)$ were on the graph, the output at $x = 4$ would be $-3$. It is $61$, so the claim is wrong.' },
        { text: 'Find the error.', why: 'Vertex form is $a(x - h)^2 + k$, with a **minus** in front of $h$. The student read the $+4$ as $h = 4$.' },
        { text: 'Rewrite to show $h$.', tex: '(x + 4)^2 - 3 = (x - (-4))^2 + (-3)', why: 'Adding $4$ is subtracting $-4$, so $h = -4$ and $k = -3$.' },
        { text: 'Check the corrected vertex.', tex: 'x = -4: \\quad (0)^2 - 3 = -3', why: 'At $x = -4$ the square is $0$, its smallest possible value, so the output $-3$ is the minimum. That is what a vertex of an upward parabola should be.' },
        { text: 'Confirm with standard form.', tex: '(x + 4)^2 - 3 = x^2 + 8x + 13, \\quad x = -\\frac{8}{2(1)} = -4', why: 'A second method gives the same axis.' },
      ],
      answer: 'Vertex $(-4, -3)$ and axis $x = -4$. In $(x + 4)^2$, $h$ is $-4$.',
    },
    {
      title: 'A kicked soccer ball',
      kind: 'real-world',
      problem: [{ t: 'p', text: 'A soccer ball is kicked from the ground at 64 feet per second. Its height in feet after $t$ seconds is $h(t) = -16t^2 + 64t$. Find the vertex and the $t$-intercepts, and explain what each means. When is the ball rising?' }],
      steps: [
        { text: 'Axis: $t = -\\frac{b}{2a}$ with $a = -16$, $b = 64$.', tex: 't = -\\frac{64}{2(-16)} = -\\frac{64}{-32} = 2', why: 'The highest point of the path is on the axis of symmetry.' },
        { text: 'Height at the vertex.', tex: 'h(2) = -16(4) + 64(2) = -64 + 128 = 64', why: 'Vertex $(2, 64)$. Since $a < 0$, this is a maximum: the ball reaches $64$ feet, $2$ seconds after the kick.' },
        { text: '$t$-intercepts: factor.', tex: '-16t^2 + 64t = -16t(t - 4) = 0 \\Rightarrow t = 0 \\text{ or } t = 4', why: 'Height $0$ happens at the kick ($t = 0$) and at landing ($t = 4$). Their midpoint, $2$, matches the axis.' },
        { text: 'When is it rising?', why: 'The height increases from the kick until the vertex, on $(0, 2)$, and decreases from $2$ until landing at $4$ seconds. The math function keeps going outside $0 \\le t \\le 4$, but the ball does not.' },
      ],
      answer: 'Vertex $(2, 64)$: highest point 64 feet at 2 seconds. Intercepts $t = 0$ (kick) and $t = 4$ (landing). Rising on $(0, 2)$.',
    },
    {
      title: 'All the features, with radical zeros',
      kind: 'challenging',
      problem: [{ t: 'p', text: 'Find the key features of $f(x) = 2x^2 - 8x + 5$: axis, vertex, maximum or minimum, $y$-intercept and its mirror point, $x$-intercepts (exact and rounded to the nearest hundredth), where $f$ is negative, and end behavior. Then sketch it.' }],
      steps: [
        { text: 'Axis and vertex.', tex: 'x = -\\frac{-8}{2(2)} = 2, \\quad f(2) = 2(4) - 16 + 5 = -3', why: 'Vertex $(2, -3)$. $a = 2 > 0$, so it opens up and $-3$ is the minimum value.' },
        { text: 'y-intercept and its mirror point.', tex: 'f(0) = 5, \\quad f(4) = 32 - 32 + 5 = 5', why: '$(0, 5)$ is $2$ units left of the axis, so $(4, 5)$, $2$ units right, has the same height.' },
        { text: 'x-intercepts: rewrite in vertex form and solve.', tex: '2(x - 2)^2 - 3 = 0 \\Rightarrow (x - 2)^2 = \\tfrac{3}{2} \\Rightarrow x = 2 \\pm \\sqrt{\\tfrac{3}{2}} = 2 \\pm \\tfrac{\\sqrt{6}}{2}', why: 'The vertex $(2, -3)$ and $a = 2$ give vertex form $2(x - 2)^2 - 3$, which expands back to $2x^2 - 8x + 5$. $\\sqrt{\\frac{3}{2}} = \\frac{\\sqrt{3}}{\\sqrt{2}} = \\frac{\\sqrt{6}}{2}$.' },
        { text: 'Round.', tex: '\\tfrac{\\sqrt{6}}{2} \\approx 1.2247 \\Rightarrow x \\approx 0.78 \\text{ or } x \\approx 3.22', why: 'Check with the quadratic formula: $\\frac{8 \\pm \\sqrt{64 - 40}}{4} = \\frac{8 \\pm \\sqrt{24}}{4} = 2 \\pm \\frac{\\sqrt{6}}{2}$.' },
        { text: 'Negative interval and end behavior.', why: 'Opening up, the graph is below the $x$-axis between its zeros: negative on $\\left(2 - \\frac{\\sqrt{6}}{2}, 2 + \\frac{\\sqrt{6}}{2}\\right)$, about $(0.78, 3.22)$. As $x \\to \\pm\\infty$, $f(x) \\to \\infty$.' },
        { text: 'Sketch from the features.', why: 'Plot the vertex, the two intercepts and the mirror pair, then draw a smooth U through them. The curve should dip below the $x$-axis only between about $0.78$ and $3.22$, bottoming out at $(2, -3)$.' },
      ],
      answer: 'Axis $x = 2$, vertex $(2, -3)$ (minimum $-3$), $y$-intercept $(0, 5)$ with mirror $(4, 5)$, $x$-intercepts $2 \\pm \\frac{\\sqrt{6}}{2} \\approx 0.78$ and $3.22$, negative between them, both ends rise.',
    },
  ],
  teachMeAgain: [
    {
      approach: 'visual',
      title: 'Fold the graph along the axis',
      blocks: [
        { t: 'p', text: 'Picture printing this graph and folding it along the dashed line $x = 3$. The two halves land exactly on top of each other. Every point has a mirror partner the same distance on the other side.' },
        {
          t: 'graph',
          caption: 'Mirror pairs sit at equal distances on each side of the axis x = 3.',
          spec: {
            xMin: -1,
            xMax: 7,
            yMin: -3,
            yMax: 10,
            functions: [{ expr: '(x - 3)^2 - 1', label: 'y = (x - 3)^2 - 1' }],
            segments: [{ x1: 3, y1: -3, x2: 3, y2: 10, dashed: true, label: 'fold line x = 3' }],
            points: [
              { x: 3, y: -1, label: 'vertex (3, -1)' },
              { x: 1, y: 3, label: '(1, 3)' },
              { x: 5, y: 3, label: '(5, 3)' },
              { x: 0, y: 8, label: '(0, 8)' },
              { x: 6, y: 8, label: '(6, 8)' },
            ],
            ariaLabel: 'An upward parabola with vertex (3, -1) and dashed axis x = 3. Mirror pairs (1, 3) and (5, 3), and (0, 8) and (6, 8), sit at equal distances from the axis.',
          },
        },
        { t: 'p', text: 'This is the same parabola as $x^2 - 6x + 8$. $(1, 3)$ is $2$ left of the axis and $(5, 3)$ is $2$ right. If you know one side of a parabola, you know the other side for free.' },
      ],
    },
    {
      approach: 'simpler-example',
      title: 'Start with y = x squared',
      blocks: [
        { t: 'p', text: 'The simplest parabola is $y = x^2$. Its vertex is $(0, 0)$, its axis is $x = 0$ (the $y$-axis), and since squares are never negative, $0$ is its **minimum**. It decreases on $(-\\infty, 0)$ and increases on $(0, \\infty)$, and both ends go up.' },
        { t: 'p', text: 'Now flip it: $y = -x^2$. Same vertex and axis, but every output is the opposite, so $0$ is now a **maximum**. It increases on $(-\\infty, 0)$, decreases on $(0, \\infty)$, and both ends go down.' },
        {
          t: 'graph',
          caption: 'y = x squared opens up with a minimum; y = negative x squared opens down with a maximum.',
          spec: {
            xMin: -4,
            xMax: 4,
            yMin: -9,
            yMax: 9,
            functions: [
              { expr: 'x^2', label: 'y = x^2' },
              { expr: '-x^2', label: 'y = -x^2', dashed: true },
            ],
            points: [{ x: 0, y: 0, label: 'vertex (0, 0)' }],
            ariaLabel: 'The parabola y = x^2 opening up and the dashed parabola y = -x^2 opening down, both with vertex at the origin.',
          },
        },
        { t: 'p', text: 'Every other parabola is one of these two, moved and stretched. The sign of $a$ decides which.' },
      ],
    },
    {
      approach: 'analogy',
      title: 'A hike over a hill',
      blocks: [
        { t: 'p', text: 'A downward parabola is a hill, and you hike it from left to right.' },
        { t: 'list', items: [
          '**Increasing** is the part where you climb. **Decreasing** is where you go down.',
          'The **vertex** is the summit. The **maximum** is how high the summit is (the $y$-value); the **axis** is where the summit is (the $x$-value).',
          'The **x-intercepts** are where the trail crosses sea level. Between them, you are above sea level (**positive**).',
          '**End behavior:** far out in both directions, the trail drops forever.',
        ] },
        { t: 'p', text: 'An upward parabola is a valley: you go down to the lowest point, the **minimum**, and then climb back up forever on both sides.' },
      ],
    },
    {
      approach: 'prerequisite',
      title: 'Refresher: zeros and intervals',
      blocks: [
        { t: 'list', items: [
          'Zero product property: if $(x - 2)(x + 3) = 0$, then $x - 2 = 0$ or $x + 3 = 0$, so $x = 2$ or $x = -3$.',
          'Watch signs: the factor $(x + 3)$ gives the zero $x = -3$, not $3$.',
          'Midpoint of two numbers: $\\frac{2 + (-3)}{2} = -\\frac{1}{2}$.',
          'Interval notation: $(-\\infty, 4)$ is $x < 4$; $(4, \\infty)$ is $x > 4$; $(1, 5)$ is $1 < x < 5$.',
          'The symbol $\\infty$ always gets a parenthesis, because infinity is not a number you can reach.',
        ] },
      ],
    },
    {
      approach: 'step-by-step',
      title: 'A 7-step feature checklist',
      blocks: [
        { t: 'p', text: 'Work through $f(x) = -x^2 + 2x + 3$.' },
        { t: 'list', ordered: true, items: [
          '**Sign of a:** $a = -1 < 0$, opens down, so the vertex is a maximum.',
          '**Axis:** $x = -\\frac{2}{2(-1)} = 1$.',
          '**Vertex:** $f(1) = -1 + 2 + 3 = 4$, so $(1, 4)$ and maximum $4$.',
          '**y-intercept:** $f(0) = 3$, so $(0, 3)$, and its mirror point is $(2, 3)$.',
          '**x-intercepts:** $-x^2 + 2x + 3 = -(x - 3)(x + 1) = 0$, so $x = 3$ and $x = -1$.',
          '**Intervals:** increasing on $(-\\infty, 1)$, decreasing on $(1, \\infty)$, positive on $(-1, 3)$, negative when $x < -1$ or $x > 3$.',
          '**End behavior:** as $x \\to \\pm\\infty$, $f(x) \\to -\\infty$.',
        ] },
      ],
    },
    {
      approach: 'alternate-strategy',
      title: 'Find the axis from a table',
      blocks: [
        { t: 'p', text: 'You do not need a formula if you have a table. Look for two inputs with the **same output**. The axis is halfway between them.' },
        {
          t: 'table',
          caption: 'Values of f(x) = x squared minus 2x minus 3.',
          headers: ['$x$', '$-1$', '$0$', '$1$', '$2$', '$3$'],
          rows: [['$f(x)$', '$0$', '$-3$', '$-4$', '$-3$', '$0$']],
        },
        { t: 'p', text: '$f(0) = f(2) = -3$, so the axis is $x = \\frac{0 + 2}{2} = 1$. The output there, $f(1) = -4$, is the smallest in the table, so the vertex is $(1, -4)$. The zeros are in the table too: $x = -1$ and $x = 3$. Check with the formula: $x = -\\frac{-2}{2(1)} = 1$.' },
      ],
    },
  ],
  guided: [
    { generator: 'u4.vertex-axis', difficulty: 1 },
    { generator: 'u4.intercepts', difficulty: 1 },
    { generator: 'u4.graph-features', difficulty: 1 },
    { generator: 'u4.vertex-axis', difficulty: 1 },
  ],
  independent: {
    count: 8,
    reviewCount: 2,
    mix: [
      { generator: 'u4.vertex-axis', difficulty: 1, weight: 1 },
      { generator: 'u4.vertex-axis', difficulty: 2, weight: 2 },
      { generator: 'u4.vertex-axis', difficulty: 3, weight: 1 },
      { generator: 'u4.intercepts', difficulty: 1, weight: 1 },
      { generator: 'u4.intercepts', difficulty: 2, weight: 1 },
      { generator: 'u4.intercepts', difficulty: 3, weight: 1 },
      { generator: 'u4.graph-features', difficulty: 1, weight: 1 },
      { generator: 'u4.graph-features', difficulty: 2, weight: 1 },
      { generator: 'u4.graph-features', difficulty: 3, weight: 1 },
    ],
  },
  quiz: {
    items: [
      { generator: 'u4.vertex-axis', difficulty: 2 },
      { generator: 'u4.vertex-axis', difficulty: 3 },
      { generator: 'u4.intercepts', difficulty: 2 },
      { generator: 'u4.intercepts', difficulty: 3 },
      { generator: 'u4.graph-features', difficulty: 2 },
      { generator: 'u4.graph-features', difficulty: 3 },
    ],
  },
  summary: [
    'The vertex is $(h, k)$ in $a(x - h)^2 + k$; in standard form the axis is $x = -\\frac{b}{2a}$; in factored form the axis is halfway between the zeros.',
    'The $y$-intercept is $f(0)$ ($c$ in standard form); the $x$-intercepts are the solutions of $f(x) = 0$.',
    'If $a > 0$ the parabola opens up and $k$ is a minimum; if $a < 0$ it opens down and $k$ is a maximum. That also sets the end behavior.',
    'Increasing, decreasing, positive and negative are $x$-intervals: they split at the vertex\'s $x$-value or at the zeros, with open endpoints.',
  ],
  mastery: { quizPassScore: 0.8, practiceMinCorrect: 5 },
};
