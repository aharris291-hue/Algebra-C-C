import type { LessonContent } from '../../../core/curriculum/types';

/**
 * U4L14 Domain and Range of Quadratic Functions (A.FGR.7.4, A.FGR.7.3)
 * The domain of every quadratic is all real numbers; the range is y >= k or y <= k from the vertex and
 * the sign of a; inequality, interval and set-builder notation with brackets and parentheses; finding the
 * vertex first from standard and factored form; and restricted domain and range in context, from launch
 * at t = 0 to landing, plus a restricted domain where an endpoint sets the range (S4.16).
 *
 * Math verified by hand (2026-10-06): every vertex, range, landing time, maximum height, endpoint value and graph point below was recomputed independently and checked by substitution.
 */
export const U4L14: LessonContent = {
  lessonId: 'U4L14',
  goal: 'Write the domain and range of a quadratic function, such as all real numbers and $y \\le 9$ for $f(x) = -(x - 2)^2 + 9$, in inequality, interval and set-builder notation, and restrict them to fit a real situation like a ball\'s flight from launch to landing.',
  needToKnow: [
    { t: 'p', text: 'This lesson uses the vertex from the last lesson and the domain and range ideas from Unit 1:' },
    {
      t: 'list',
      items: [
        '**Domain and range.** The domain is the set of all inputs ($x$-values). The range is the set of all outputs ($y$-values).',
        '**Finding the vertex.** In $a(x - h)^2 + k$ the vertex is $(h, k)$; in standard form the axis is $x = -\\frac{b}{2a}$.',
        '**Opening direction.** $a > 0$ opens up (the vertex is a minimum); $a < 0$ opens down (the vertex is a maximum).',
        '**Notation.** $y \\le 9$, $(-\\infty, 9]$ and $\\{y \\mid y \\le 9\\}$ all describe the same set. A bracket $[\\;]$ includes the endpoint; a parenthesis $(\\;)$ does not.',
      ],
    },
    { t: 'callout', variant: 'tip', title: 'Quick check', text: 'What is the vertex of $y = 2(x + 1)^2 - 8$, and does it open up or down? (You should get $(-1, -8)$, opening up.) If that felt shaky, open **Teach Me Again** and choose the refresher.' },
  ],
  vocabulary: [
    { term: 'domain', meaning: 'All the input values a function can use. For a quadratic with no context, every real number.' },
    { term: 'range', meaning: 'All the output values a function actually produces. For a quadratic, everything at or above the vertex, or at or below it.' },
    { term: 'interval notation', meaning: 'Writing a set as its endpoints, such as $[-8, \\infty)$. A bracket means the endpoint is included; $\\infty$ always gets a parenthesis.' },
    { term: 'set-builder notation', meaning: 'Writing a set as a rule, such as $\\{y \\mid y \\ge -8\\}$, read "all $y$ such that $y$ is at least $-8$."' },
    { term: 'reasonable domain', meaning: 'The inputs that make sense in a real situation, such as times from launch to landing. Also called a restricted domain.' },
  ],
  instruction: [
    { t: 'p', text: '### Domain: every real number' },
    { t: 'p', text: 'In $f(x) = ax^2 + bx + c$ you square, multiply and add. You can do all three to **any** real number, so nothing is ever left out. The domain of every quadratic function (with no context) is **all real numbers**:' },
    { t: 'math', tex: '\\text{domain: } (-\\infty, \\infty) \\quad\\text{or}\\quad \\{x \\mid x \\in \\mathbb{R}\\}' },
    { t: 'p', text: 'On a graph, the parabola keeps spreading left and right forever, even though the picture is cut off.' },
    { t: 'p', text: '### Range: start at the vertex' },
    { t: 'p', text: 'The outputs are a different story. A parabola that opens **down** never goes above its vertex. One that opens **up** never goes below its vertex. So the range is decided by the vertex height $k$ and the sign of $a$.' },
    {
      t: 'graph',
      caption: 'The downward parabola never rises above 9. The upward parabola never falls below -8.',
      spec: {
        xMin: -5,
        xMax: 6,
        yMin: -10,
        yMax: 11,
        yStep: 2,
        functions: [
          { expr: '-(x - 2)^2 + 9', label: 'f(x) = -(x - 2)^2 + 9' },
          { expr: '2(x + 1)^2 - 8', label: 'g(x) = 2(x + 1)^2 - 8', dashed: true },
        ],
        points: [
          { x: 2, y: 9, label: 'max (2, 9)' },
          { x: -1, y: -8, label: 'min (-1, -8)' },
        ],
        ariaLabel: 'Two parabolas. f(x) = -(x - 2)^2 + 9 opens down with its highest point at (2, 9). The dashed g(x) = 2(x + 1)^2 - 8 opens up with its lowest point at (-1, -8).',
      },
    },
    {
      t: 'table',
      caption: 'The domain and range of each parabola, written three ways.',
      headers: ['Function', '', 'Inequality', 'Interval', 'Set-builder'],
      rows: [
        ['$f(x) = -(x - 2)^2 + 9$', 'domain', 'all real numbers', '$(-\\infty, \\infty)$', '$\\{x \\mid x \\in \\mathbb{R}\\}$'],
        ['', 'range', '$y \\le 9$', '$(-\\infty, 9]$', '$\\{y \\mid y \\le 9\\}$'],
        ['$g(x) = 2(x + 1)^2 - 8$', 'domain', 'all real numbers', '$(-\\infty, \\infty)$', '$\\{x \\mid x \\in \\mathbb{R}\\}$'],
        ['', 'range', '$y \\ge -8$', '$[-8, \\infty)$', '$\\{y \\mid y \\ge -8\\}$'],
      ],
    },
    {
      t: 'numberline',
      caption: 'The range of f: every output 9 or less. The closed dot means 9 is included.',
      spec: { min: 0, max: 12, step: 1, rays: [{ from: 9, closed: true, dir: 'left' }], ariaLabel: 'A number line with a closed dot at 9 and shading to the left: y is less than or equal to 9.' },
    },
    { t: 'callout', variant: 'why', title: 'Why the bracket at the vertex', text: 'The vertex value is actually reached: $f(2) = -(0)^2 + 9 = 9$. So $9$ belongs in the range, and gets a bracket, $(-\\infty, 9]$. For any other $x$, $(x - 2)^2 > 0$, so $f(x) < 9$. Infinity is not a number the function reaches, so it always gets a parenthesis.' },
    { t: 'callout', variant: 'warning', title: 'Use k, not h', text: 'The range is about $y$-values, so it uses the **$y$-coordinate** of the vertex, $k$. For $f(x) = -(x - 2)^2 + 9$, the range is $y \\le 9$, not $y \\le 2$.' },
    { t: 'p', text: '### From standard or factored form: find the vertex first' },
    { t: 'p', text: 'For $f(x) = -2x^2 + 8x - 3$: the axis is $x = -\\frac{8}{2(-2)} = 2$, and $f(2) = -8 + 16 - 3 = 5$. The vertex is $(2, 5)$ and $a = -2 < 0$, so the range is $y \\le 5$, or $(-\\infty, 5]$.' },
    { t: 'p', text: 'Notice the $y$-intercept, $-3$, has nothing to do with the range boundary. Only the vertex does.' },
    { t: 'p', text: '### Restricting the domain to fit a situation' },
    { t: 'p', text: 'A ball is thrown upward from the edge of a 48-foot-high roof at 32 feet per second. Its height in feet after $t$ seconds is' },
    { t: 'math', tex: 'h(t) = -16t^2 + 32t + 48 = -16(t - 3)(t + 1)' },
    {
      t: 'list',
      items: [
        '**Launch:** $t = 0$, at height $h(0) = 48$ feet. Time before the throw does not count.',
        '**Top:** the axis is $t = -\\frac{32}{2(-16)} = 1$, and $h(1) = -16 + 32 + 48 = 64$ feet.',
        '**Landing:** $h(t) = 0$ when $t = 3$ or $t = -1$. Reject $t = -1$ (before the throw), so it lands at $t = 3$ seconds.',
      ],
    },
    {
      t: 'graph',
      caption: 'The solid piece is the actual flight, from launch at 0 seconds to landing at 3 seconds. The dashed curve is the rest of the math function.',
      spec: {
        xMin: -1.5,
        xMax: 4,
        yMin: -20,
        yMax: 80,
        xStep: 0.5,
        yStep: 10,
        xLabel: 'time (s)',
        yLabel: 'height (ft)',
        functions: [
          { expr: '-16x^2 + 32x + 48', label: 'full function', dashed: true },
          { expr: '-16x^2 + 32x + 48', label: 'the flight', domain: [0, 3] },
        ],
        points: [
          { x: 0, y: 48, label: 'launch (0, 48)' },
          { x: 1, y: 64, label: 'top (1, 64)' },
          { x: 3, y: 0, label: 'lands (3, 0)' },
        ],
        ariaLabel: 'A dashed downward parabola with zeros at -1 and 3 and vertex (1, 64). The solid part runs from (0, 48) up to (1, 64) and down to (3, 0).',
      },
    },
    {
      t: 'table',
      caption: 'The full function compared with the real flight.',
      headers: ['', 'Math function', 'Real flight'],
      rows: [
        ['domain', 'all real numbers', '$0 \\le t \\le 3$, or $[0, 3]$'],
        ['range', '$h \\le 64$', '$0 \\le h \\le 64$, or $[0, 64]$'],
      ],
    },
    { t: 'callout', variant: 'warning', title: 'The range goes down to 0, not to 48', text: 'The ball starts at $48$ feet, but it falls past $48$ on the way down, all the way to the ground. Every height from $0$ to $64$ happens at some moment, so the reasonable range is $[0, 64]$, not $[48, 64]$.' },
    { t: 'p', text: '### Reading domain and range from a graph or a table' },
    { t: 'p', text: 'When a function is given as a graph, read the domain **left to right** along the horizontal axis and the range **bottom to top** along the vertical axis. A stick dropped from $36$ feet has height $h(t) = -16t^2 + 36$; its graph starts at $(0, 36)$ and ends when it hits the ground at $(1.5, 0)$, because $-16(1.5)^2 + 36 = -36 + 36 = 0$. So the domain is $0 \\le t \\le 1.5$ and the range is $0 \\le h \\le 36$.' },
    { t: 'p', text: 'When a function is given only by a table, its domain is just the inputs listed. If a class records the number of handshakes $H(n)$ for groups of $n = 2, 3, 4, 5, 6$ students (outputs $1, 3, 6, 10, 15$), the domain is the set $\\{2, 3, 4, 5, 6\\}$, not the interval $2 \\le n \\le 6$: you cannot have $2.5$ students. A domain like this, made of separate values, is called **discrete**. The outputs, $\\{1, 3, 6, 10, 15\\}$, are the range.' },
    { t: 'callout', variant: 'realworld', title: 'Where this shows up', text: 'A drone camera, a launched water rocket, or a ball in a video game only exists for part of the math curve. Stating a reasonable domain and range tells a reader exactly which part of the model to trust.' },
  ],
  examples: [
    {
      title: 'Domain and range from vertex form',
      kind: 'introductory',
      problem: [{ t: 'p', text: 'Find the domain and range of $f(x) = (x - 3)^2 + 1$. Write the range in all three notations.' }],
      steps: [
        { text: 'Domain.', tex: '(-\\infty, \\infty)', why: 'Any real number can be substituted for $x$ in a quadratic, so the domain is all real numbers.' },
        { text: 'Find the vertex and the opening direction.', tex: '\\text{vertex } (3, 1), \\quad a = 1 > 0', why: 'Read $(h, k)$ from $a(x - h)^2 + k$. Positive $a$ means it opens up.' },
        { text: 'Decide the range direction.', why: 'Opening up, the vertex is the lowest point. The outputs start at $1$ and go up forever.' },
        { text: 'Write the range.', tex: 'y \\ge 1, \\quad [1, \\infty), \\quad \\{y \\mid y \\ge 1\\}', why: '$f(3) = 1$ is actually reached, so $1$ is included with a bracket. And $(x - 3)^2 \\ge 0$ means $f(x) \\ge 1$ for every $x$.' },
      ],
      answer: 'Domain: all real numbers, $(-\\infty, \\infty)$. Range: $y \\ge 1$, $[1, \\infty)$, $\\{y \\mid y \\ge 1\\}$.',
    },
    {
      title: 'Range from standard form',
      kind: 'intermediate',
      problem: [{ t: 'p', text: 'Find the range of $f(x) = x^2 + 4x + 7$.' }],
      steps: [
        { text: 'Find the axis.', tex: 'x = -\\frac{4}{2(1)} = -2', why: 'Standard form hides the vertex, so locate it with $x = -\\frac{b}{2a}$.' },
        { text: 'Find the vertex height.', tex: 'f(-2) = (-2)^2 + 4(-2) + 7 = 4 - 8 + 7 = 3', why: 'The vertex is $(-2, 3)$.' },
        { text: 'Use the sign of $a$.', why: '$a = 1 > 0$, so it opens up and $3$ is the minimum output.' },
        { text: 'Write the range.', tex: 'y \\ge 3 \\quad\\text{or}\\quad [3, \\infty)', why: 'Every output is $3$ or more. (This parabola never reaches the $x$-axis, since its lowest point is above it.)' },
      ],
      answer: 'Range: $y \\ge 3$, or $[3, \\infty)$',
    },
    {
      title: 'Range from factored form',
      kind: 'intermediate',
      problem: [{ t: 'p', text: 'Find the domain and range of $y = 3(x - 1)(x + 3)$.' }],
      steps: [
        { text: 'Domain.', tex: '(-\\infty, \\infty)', why: 'It is a quadratic with no context, so every real $x$ is allowed.' },
        { text: 'Find the zeros and the axis.', tex: 'x = 1, \\; x = -3 \\;\\Rightarrow\\; x = \\frac{1 + (-3)}{2} = -1', why: 'The axis is halfway between the zeros.' },
        { text: 'Find the vertex height.', tex: 'y = 3(-1 - 1)(-1 + 3) = 3(-2)(2) = -12', why: 'The vertex is $(-1, -12)$.' },
        { text: 'Write the range.', tex: 'y \\ge -12, \\quad [-12, \\infty), \\quad \\{y \\mid y \\ge -12\\}', why: '$a = 3 > 0$, so it opens up and $-12$ is the minimum.' },
      ],
      answer: 'Domain: all real numbers. Range: $y \\ge -12$, or $[-12, \\infty)$.',
    },
    {
      title: 'A common mistake: using h and the wrong direction',
      kind: 'common-mistake',
      problem: [{ t: 'p', text: 'A student says the range of $f(x) = -3(x + 2)^2 + 4$ is $y \\ge -2$. Find the mistakes and give the correct range.' }],
      steps: [
        { text: 'Test the claim with one output.', tex: 'f(0) = -3(2)^2 + 4 = -12 + 4 = -8', why: '$-8$ is an actual output, but $-8 \\ge -2$ is false. So $y \\ge -2$ cannot be the range.' },
        { text: 'Mistake 1: the wrong coordinate.', why: 'The vertex is $(-2, 4)$. The student used $-2$, the $x$-coordinate. The range is about outputs, so it must use $k = 4$.' },
        { text: 'Mistake 2: the wrong direction.', why: '$a = -3 < 0$, so the parabola opens down. The vertex is the **highest** point, so the outputs are at most $4$, not at least.' },
        { text: 'Write the correct range.', tex: 'y \\le 4 \\quad\\text{or}\\quad (-\\infty, 4]', why: 'Check: $f(-2) = 4$ is the largest output, and $f(0) = -8 \\le 4$ fits.' },
      ],
      answer: 'The range is $y \\le 4$, or $(-\\infty, 4]$. Use $k$, and let the sign of $a$ set the direction.',
    },
    {
      title: 'A water balloon dropped from a drone',
      kind: 'real-world',
      problem: [{ t: 'p', text: 'A drone hovering 144 feet above a field drops a water balloon. Its height in feet $t$ seconds after the drop is $h(t) = -16t^2 + 144$. Find a reasonable domain and range.' }],
      steps: [
        { text: 'Start time.', tex: 'h(0) = 144', why: 'The balloon is released at $t = 0$, $144$ feet up. Times before the drop are not part of the fall.' },
        { text: 'Landing time: solve $h(t) = 0$.', tex: '-16t^2 + 144 = 0 \\Rightarrow t^2 = 9 \\Rightarrow t = 3 \\;(\\text{reject } t = -3)', why: 'It hits the ground when the height is $0$. Negative time is before the drop.' },
        { text: 'Reasonable domain.', tex: '0 \\le t \\le 3, \\quad [0, 3]', why: 'The model describes the balloon only from release to impact.' },
        { text: 'Find the highest and lowest heights.', why: 'The vertex is $(0, 144)$: with $b = 0$ the axis is $t = 0$. So the balloon is highest at the moment of release and only falls after that. The lowest height is $0$, at the ground.' },
        { text: 'Reasonable range.', tex: '0 \\le h \\le 144, \\quad [0, 144]', why: 'Every height from the ground up to $144$ feet happens once during the fall.' },
      ],
      answer: 'Domain: $0 \\le t \\le 3$ seconds, $[0, 3]$. Range: $0 \\le h \\le 144$ feet, $[0, 144]$.',
    },
    {
      title: 'A racing track on a restricted domain',
      kind: 'challenging',
      problem: [
        { t: 'p', text: 'A game designer builds one valley-shaped piece of a racing track from $y = x^2 - 4x + 1$, using only $0 \\le x \\le 5$. Find the range of this piece.' },
        {
          t: 'graph',
          caption: 'The track piece runs from x = 0 to x = 5.',
          spec: {
            xMin: -1,
            xMax: 6,
            yMin: -4,
            yMax: 8,
            functions: [{ expr: 'x^2 - 4x + 1', label: 'track', domain: [0, 5] }],
            points: [
              { x: 0, y: 1, label: '(0, 1)' },
              { x: 2, y: -3, label: '(2, -3)' },
              { x: 5, y: 6, label: '(5, 6)' },
            ],
            ariaLabel: 'A piece of an upward parabola drawn only from x = 0 to x = 5. It starts at (0, 1), dips to its lowest point (2, -3), and rises to (5, 6).',
          },
        },
      ],
      steps: [
        { text: 'Find the vertex.', tex: 'x = -\\frac{-4}{2(1)} = 2, \\quad y = 4 - 8 + 1 = -3', why: 'The vertex $(2, -3)$ is inside $0 \\le x \\le 5$, so the piece includes the lowest point.' },
        { text: 'Find the outputs at both endpoints.', tex: 'x = 0: \\; y = 1, \\qquad x = 5: \\; y = 25 - 20 + 1 = 6', why: 'With a restricted domain, the graph stops at the endpoints, so the highest output must be at one of them.' },
        { text: 'Pick the lowest and highest outputs.', why: 'Lowest: $-3$ at the vertex. Highest: $6$ at $x = 5$, because $5$ is farther from the axis $x = 2$ (3 units) than $0$ is (2 units).' },
        { text: 'Write the range.', tex: '-3 \\le y \\le 6, \\quad [-3, 6]', why: 'The piece passes through every height from $-3$ to $6$. The value $1$ at the left end does not set a boundary because the track dips below it.' },
        { text: 'Compare with a piece that misses the vertex.', tex: '3 \\le x \\le 6: \\quad y(3) = -2, \\; y(6) = 13 \\;\\Rightarrow\\; [-2, 13]', why: 'If the vertex is outside the restricted domain, the graph only rises (or only falls) there, so both range endpoints come from the domain endpoints.' },
      ],
      answer: 'Range on $0 \\le x \\le 5$: $-3 \\le y \\le 6$, or $[-3, 6]$.',
    },
  ],
  teachMeAgain: [
    {
      approach: 'visual',
      title: 'Shadows on the axes',
      blocks: [
        { t: 'p', text: 'Imagine a light shining from far to the right, casting the graph\'s shadow onto the $y$-axis. The shadow is the **range**. A light from above casting a shadow onto the $x$-axis gives the **domain**.' },
        {
          t: 'graph',
          caption: 'The shadow of this parabola on the y-axis starts at -8 and goes up forever.',
          spec: {
            xMin: -5,
            xMax: 3,
            yMin: -10,
            yMax: 10,
            yStep: 2,
            functions: [
              { expr: '2(x + 1)^2 - 8', label: 'g(x) = 2(x + 1)^2 - 8' },
              { expr: '-8', label: 'y = -8', dashed: true },
            ],
            points: [{ x: -1, y: -8, label: 'vertex (-1, -8)' }],
            ariaLabel: 'An upward parabola with lowest point (-1, -8) and a dashed horizontal line at y = -8 touching the vertex. The graph is entirely on or above the line.',
          },
        },
        { t: 'p', text: 'The whole curve sits on or above the dashed line $y = -8$, touching it only at the vertex. So the range is $y \\ge -8$. The curve spreads left and right without end, so the domain is all real numbers.' },
      ],
    },
    {
      approach: 'simpler-example',
      title: 'Squares are never negative',
      blocks: [
        { t: 'list', items: [
          '$y = x^2$: a square is never negative, and $0^2 = 0$. Range $y \\ge 0$.',
          '$y = x^2 + 3$: add $3$ to every output. Range $y \\ge 3$.',
          '$y = -x^2$: the opposite of a square is never positive. Range $y \\le 0$.',
          '$y = -x^2 + 5$: add $5$. Range $y \\le 5$.',
        ] },
        { t: 'p', text: 'In each case the boundary is the vertex height, and the sign in front of $x^2$ decides "at least" or "at most." The domain is always all real numbers.' },
      ],
    },
    {
      approach: 'analogy',
      title: 'Floors and ceilings',
      blocks: [
        { t: 'p', text: 'An upward parabola is like a room with a **floor** at height $k$ and no roof: the graph touches the floor at the vertex and rises forever above it. Range: $y \\ge k$.' },
        { t: 'p', text: 'A downward parabola is like a balloon pressed against a ceiling, hanging down forever: the vertex is the **ceiling** at height $k$. Range: $y \\le k$.' },
        { t: 'p', text: 'In a real flight, there is also a hard floor: the ground. That is why a projectile\'s range stops at $0$.' },
      ],
    },
    {
      approach: 'prerequisite',
      title: 'Refresher: three ways to write a set',
      blocks: [
        {
          t: 'table',
          caption: 'The same sets written as inequalities, intervals and set-builder notation.',
          headers: ['In words', 'Inequality', 'Interval', 'Set-builder'],
          rows: [
            ['at most 9', '$y \\le 9$', '$(-\\infty, 9]$', '$\\{y \\mid y \\le 9\\}$'],
            ['at least -8', '$y \\ge -8$', '$[-8, \\infty)$', '$\\{y \\mid y \\ge -8\\}$'],
            ['from 0 to 64', '$0 \\le h \\le 64$', '$[0, 64]$', '$\\{h \\mid 0 \\le h \\le 64\\}$'],
            ['any real number', 'all real $x$', '$(-\\infty, \\infty)$', '$\\{x \\mid x \\in \\mathbb{R}\\}$'],
          ],
        },
        { t: 'p', text: 'Brackets $[\\;]$ go with $\\le$ and $\\ge$ (included). Parentheses $(\\;)$ go with $<$, $>$, and always with $\\infty$.' },
      ],
    },
    {
      approach: 'step-by-step',
      title: 'A 4-step routine for a projectile',
      blocks: [
        { t: 'p', text: 'A ball is kicked from the ground at 64 feet per second: $h(t) = -16t^2 + 64t$.' },
        { t: 'list', ordered: true, items: [
          '**Launch:** $t = 0$, height $h(0) = 0$.',
          '**Landing:** $-16t(t - 4) = 0$, so $t = 0$ or $t = 4$. It lands at $t = 4$.',
          '**Top:** $t = -\\frac{64}{2(-16)} = 2$ and $h(2) = -64 + 128 = 64$ feet.',
          '**Write them:** domain $0 \\le t \\le 4$, or $[0, 4]$; range $0 \\le h \\le 64$, or $[0, 64]$.',
        ] },
      ],
    },
    {
      approach: 'alternate-strategy',
      title: 'Complete the square to see the range',
      blocks: [
        { t: 'p', text: 'Instead of $x = -\\frac{b}{2a}$, rewrite in vertex form and reason about the square. For $f(x) = x^2 + 4x + 7$:' },
        { t: 'math', tex: 'x^2 + 4x + 7 = (x^2 + 4x + 4) + 3 = (x + 2)^2 + 3' },
        { t: 'p', text: 'Since $(x + 2)^2 \\ge 0$ for every $x$, adding $3$ gives $f(x) \\ge 3$. And $f(-2) = 0 + 3 = 3$, so $3$ is reached. Range: $[3, \\infty)$, the same answer as the vertex method.' },
      ],
    },
  ],
  guided: [
    { generator: 'u4.domain-range', difficulty: 1 },
    { generator: 'u4.domain-range', difficulty: 1 },
    { generator: 'u4.domain-range', difficulty: 1 },
    { generator: 'u4.domain-range', difficulty: 1 },
  ],
  independent: {
    count: 8,
    reviewCount: 2,
    mix: [
      { generator: 'u4.domain-range', difficulty: 1, weight: 2 },
      { generator: 'u4.domain-range', difficulty: 2, weight: 3 },
      { generator: 'u4.domain-range', difficulty: 3, weight: 3 },
    ],
  },
  quiz: {
    items: [
      { generator: 'u4.domain-range', difficulty: 2 },
      { generator: 'u4.domain-range', difficulty: 2 },
      { generator: 'u4.domain-range', difficulty: 2 },
      { generator: 'u4.domain-range', difficulty: 3 },
      { generator: 'u4.domain-range', difficulty: 3 },
      { generator: 'u4.domain-range', difficulty: 3 },
    ],
  },
  summary: [
    'The domain of every quadratic function, with no context, is all real numbers: $(-\\infty, \\infty)$.',
    'The range starts at the vertex height $k$: $y \\ge k$ if $a > 0$ (opens up), $y \\le k$ if $a < 0$ (opens down). Use $k$, not $h$.',
    'Write sets with brackets for included endpoints and parentheses for $\\infty$: $y \\le 9$ is $(-\\infty, 9]$ or $\\{y \\mid y \\le 9\\}$.',
    'In context, restrict to what makes sense: a projectile\'s domain runs from launch $t = 0$ to landing, and its range from $0$ to the maximum height.',
    'From a graph, read the domain left to right and the range bottom to top. From a table of whole-number inputs, the domain is the set of listed inputs, a discrete domain like $\{2, 3, 4, 5, 6\}$.',
  ],
  mastery: { quizPassScore: 0.8, practiceMinCorrect: 5 },
};
