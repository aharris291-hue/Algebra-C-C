import type { LessonContent } from '../../../core/curriculum/types';

/**
 * U6L06 Transformations of Exponential Functions (A.FGR.9.3)
 * The effects of g(x) = f(x) + k (vertical shift up k, or down |k| when k < 0) and g(x) = k·f(x) (vertical
 * stretch by a factor of k when k > 1, vertical compression when 0 < k < 1, reflection across the x-axis when
 * k < 0) on exponential functions f(x) = b^x and a(b)^x, shown with tables and with f and g graphed together;
 * what happens to the y-intercept and the horizontal asymptote (y = 0 moves to y = k under f(x) + k, and stays
 * y = 0 under k·f(x)); finding k from two graphs, from points, or from the new asymptote or y-intercept; two
 * transformations combined (S6.06).
 *
 * Math verified by hand (2026-10-07): every table value was recomputed (2^x: 1/4, 1/2, 1, 2, 4 and 2^x + 3:
 * 3.25, 3.5, 4, 5, 7; 3·2^x: 3, 6, 12; 0.5·2^x: 0.5, 1, 2; 3^x - 5: -4, -2, 4; 0.5^x - 3 at x = -2, 0: 1, -2;
 * 0.5·2^x at x = 1, 3: 1, 4; -2·2^x + 8: 7, 6, 4, 0, -8 at x = -1 to 3; 130(0.9)^t + 70: 200 at t = 0,
 * 146.76... at t = 5), every k was recomputed both as a difference g - f (shifts) and as a ratio g / f
 * (stretches) at two different x-values, every asymptote and y-intercept was rechecked, and every graph
 * point and asymptote segment was checked to lie on its curve or line and inside its window.
 */
export const U6L06: LessonContent = {
  lessonId: 'U6L06',
  goal: 'Describe how the graph of $g$ compares with the graph of an exponential function $f$ when $g(x) = f(x) + k$ or $g(x) = k \\cdot f(x)$, including what happens to the $y$-intercept and the horizontal asymptote, and find $k$ from a pair of graphs.',
  needToKnow: [
    { t: 'p', text: 'This lesson builds on two things you already know:' },
    {
      t: 'list',
      items: [
        '**Transformations of quadratics (Unit 4).** $f(x) + k$ moves a graph up or down, and $k \\cdot f(x)$ stretches it, compresses it, or flips it across the $x$-axis. The same rules work for every kind of function.',
        '**Key features of exponential graphs.** $y = a(b)^x$ has $y$-intercept $(0, a)$ and horizontal asymptote $y = 0$. $y = a(b)^x + k$ has $y$-intercept $(0, a + k)$ and horizontal asymptote $y = k$.',
      ],
    },
    { t: 'callout', variant: 'tip', title: 'Quick check', text: 'Let $f(x) = 2^x$. What is $f(3)$? If $g(x) = f(x) + 5$, what is $g(3)$? (You should get $8$ and $13$.) If that felt shaky, open **Teach Me Again** and choose the refresher.' },
  ],
  vocabulary: [
    { term: 'transformation', meaning: 'A change that moves, flips or reshapes a graph. Here $f$ is the starting function and $g$ is the new one.' },
    { term: 'vertical shift', meaning: 'Sliding a graph straight up or down. $f(x) + k$ shifts up $k$ units, or down $|k|$ units when $k < 0$.' },
    { term: 'vertical stretch or compression', meaning: 'Multiplying every output by $k$. With $k > 1$ the graph is stretched away from the $x$-axis; with $0 < k < 1$ it is compressed toward it.' },
    { term: 'reflection across the x-axis', meaning: 'Flipping a graph upside down, so $(x, y)$ goes to $(x, -y)$. This happens to $k \\cdot f(x)$ when $k < 0$.' },
    { term: 'horizontal asymptote', meaning: 'A horizontal line $y = c$ that the graph gets closer and closer to at one end but never reaches. For $b^x$ it is $y = 0$.' },
  ],
  instruction: [
    { t: 'p', text: '### Adding outside: $f(x) + k$' },
    { t: 'p', text: 'Let $f(x) = 2^x$ and $g(x) = f(x) + 3 = 2^x + 3$. Compare outputs at the same inputs:' },
    {
      t: 'table',
      caption: 'Every output of g is 3 more than the output of f at the same x.',
      headers: ['$x$', '$-2$', '$-1$', '$0$', '$1$', '$2$'],
      rows: [
        ['$f(x) = 2^x$', '$\\frac{1}{4}$', '$\\frac{1}{2}$', '$1$', '$2$', '$4$'],
        ['$g(x) = 2^x + 3$', '$3\\frac{1}{4}$', '$3\\frac{1}{2}$', '$4$', '$5$', '$7$'],
      ],
    },
    {
      t: 'graph',
      caption: 'The graph of g (dashed) is the graph of f shifted up 3 units. The asymptote moves from y = 0 to y = 3 and the y-intercept moves from (0, 1) to (0, 4).',
      spec: {
        xMin: -4,
        xMax: 4,
        yMin: -2,
        yMax: 10,
        functions: [
          { expr: '2^x', label: 'f(x) = 2^x' },
          { expr: '2^x + 3', label: 'g(x) = 2^x + 3', dashed: true },
        ],
        segments: [{ x1: -4, y1: 3, x2: 4, y2: 3, dashed: true, color: '#8a8a8a', label: 'asymptote y = 3' }],
        points: [
          { x: 0, y: 1, label: '(0, 1)' },
          { x: 0, y: 4, label: '(0, 4)' },
          { x: 2, y: 4, label: '(2, 4)' },
          { x: 2, y: 7, label: '(2, 7)' },
        ],
        ariaLabel: 'Two increasing exponential curves with the same shape. f(x) = 2 to the x passes through (0, 1) and (2, 4) and approaches the x-axis on the left. g(x) = 2 to the x plus 3, dashed, passes through (0, 4) and (2, 7) and approaches the dashed horizontal line y = 3 on the left.',
      },
    },
    { t: 'p', text: '$f(x) + k$ shifts the graph **up** $k$ units, or **down** $|k|$ units when $k < 0$. Every point moves the same distance, so the asymptote moves too: **$y = 0$ becomes $y = k$**. The $y$-intercept $(0, 1)$ becomes $(0, 1 + k)$.' },
    { t: 'p', text: 'A shift down can make the graph cross the $x$-axis. $2^x - 4$ has asymptote $y = -4$, $y$-intercept $(0, -3)$, and crosses the $x$-axis at $(2, 0)$, because $2^2 - 4 = 0$.' },
    { t: 'p', text: '### Multiplying outside: $k \\cdot f(x)$' },
    { t: 'p', text: 'Now multiply every output of $f(x) = 2^x$ by a number:' },
    {
      t: 'table',
      caption: 'Each output of 3f is 3 times the output of f; each output of 0.5f is half of it.',
      headers: ['$x$', '$0$', '$1$', '$2$'],
      rows: [
        ['$f(x) = 2^x$', '$1$', '$2$', '$4$'],
        ['$3f(x) = 3 \\cdot 2^x$', '$3$', '$6$', '$12$'],
        ['$0.5f(x) = 0.5 \\cdot 2^x$', '$0.5$', '$1$', '$2$'],
      ],
    },
    {
      t: 'graph',
      caption: 'Above x = 2: f gives 4, 3f gives 12 (vertical stretch) and 0.5f gives 2 (vertical compression). All three still approach y = 0.',
      spec: {
        xMin: -3,
        xMax: 3,
        yMin: -1,
        yMax: 13,
        functions: [
          { expr: '2^x', label: 'f(x) = 2^x' },
          { expr: '3*2^x', label: '3f(x) = 3(2)^x', dashed: true },
          { expr: '0.5*2^x', label: '0.5f(x) = 0.5(2)^x', dashed: true },
        ],
        points: [
          { x: 0, y: 1, label: '(0, 1)' },
          { x: 0, y: 3, label: '(0, 3)' },
          { x: 2, y: 4, label: '(2, 4)' },
          { x: 2, y: 12, label: '(2, 12)' },
          { x: 2, y: 2, label: '(2, 2)' },
        ],
        ariaLabel: 'Three increasing exponential curves that all approach the x-axis on the left. The steepest, 3 times 2 to the x, passes through (0, 3) and (2, 12). The middle one, 2 to the x, passes through (0, 1) and (2, 4). The flattest, 0.5 times 2 to the x, passes through (2, 2).',
      },
    },
    {
      t: 'graph',
      caption: 'Multiplying by -1 flips the graph across the x-axis: (0, 1) goes to (0, -1) and (2, 4) goes to (2, -4). The asymptote is still y = 0.',
      spec: {
        xMin: -3,
        xMax: 3,
        yMin: -6,
        yMax: 6,
        functions: [
          { expr: '2^x', label: 'f(x) = 2^x' },
          { expr: '-(2^x)', label: '-f(x) = -(2^x)', dashed: true },
        ],
        points: [
          { x: 0, y: 1, label: '(0, 1)' },
          { x: 0, y: -1, label: '(0, -1)' },
          { x: 2, y: 4, label: '(2, 4)' },
          { x: 2, y: -4, label: '(2, -4)' },
        ],
        ariaLabel: 'The increasing curve 2 to the x through (0, 1) and (2, 4), above the x-axis, and its mirror image, the dashed curve negative 2 to the x through (0, -1) and (2, -4), below the x-axis. Both approach the x-axis on the left.',
      },
    },
    { t: 'p', text: '$k \\cdot f(x)$ is a **vertical stretch** by a factor of $k$ when $k > 1$, a **vertical compression** by a factor of $k$ when $0 < k < 1$, and a **reflection across the $x$-axis** when $k < 0$. So $-2f(x)$ is a reflection across the $x$-axis together with a vertical stretch by a factor of $2$.' },
    { t: 'callout', variant: 'why', title: 'Why the asymptote stays put for k·f(x) but moves for f(x) + k', text: 'Far to the left, $2^x$ gets closer and closer to $0$. Multiplying a number close to $0$ by $k$ gives another number close to $0$ (for example $3 \\times 0.001 = 0.003$), so $k \\cdot f(x)$ still approaches $y = 0$. Adding $k$ to a number close to $0$ gives a number close to $k$, so $f(x) + k$ approaches $y = k$. The $y$-intercept changes in both cases: $(0, 1)$ goes to $(0, 1 + k)$ for a shift and to $(0, k)$ for a stretch.' },
    { t: 'p', text: '### Finding k' },
    { t: 'p', text: 'Match a point of $f$ with the point of $g$ at the **same $x$**. Then:' },
    {
      t: 'table',
      caption: 'How to find k for each rule.',
      headers: ['Rule', 'What happens', 'How to find k'],
      rows: [
        ['$g(x) = f(x) + k$', 'shift up $k$ (down if $k < 0$); asymptote $y = 0$ becomes $y = k$', '$k = g(x) - f(x)$ at the same $x$, or read the new asymptote'],
        ['$g(x) = k \\cdot f(x)$', 'stretch ($k > 1$), compression ($0 < k < 1$), reflection across the $x$-axis ($k < 0$); asymptote stays $y = 0$', '$k = \\frac{g(x)}{f(x)}$ at the same $x$, such as new $y$-intercept $\\div$ old $y$-intercept'],
      ],
    },
    { t: 'p', text: 'Check a second pair of points to be sure which rule it is: a shift adds the **same amount** at every $x$; a stretch multiplies by the **same factor** at every $x$.' },
    { t: 'callout', variant: 'realworld', title: 'Where this shows up', text: 'If an account balance follows $f(t) = 500(1.04)^t$, then a friend who invests three times as much has $3f(t)$, and an account that also holds \\$200 in cash that never grows has $f(t) + 200$. A hot drink cooling toward room temperature is an exponential decay shifted up by the room temperature, as you will see below.' },
  ],
  examples: [
    {
      title: 'A vertical shift down',
      kind: 'introductory',
      problem: [{ t: 'p', text: 'Let $f(x) = 3^x$ and $g(x) = 3^x - 5$. Describe how the graph of $g$ compares with the graph of $f$, and give the $y$-intercept and the horizontal asymptote of $g$.' }],
      steps: [
        { text: 'Write $g$ in terms of $f$.', tex: 'g(x) = 3^x - 5 = f(x) - 5', why: 'The $-5$ is added **outside** $f$, after the power is found, so it changes outputs.' },
        { text: 'Compare a few outputs.', tex: 'f(0) = 1,\\; g(0) = -4; \\qquad f(2) = 9,\\; g(2) = 4', why: 'At the same input, every output of $g$ is $5$ less than the output of $f$.' },
        { text: 'Describe the move.', why: '$f(x) + k$ with $k = -5$ shifts the graph down $5$ units. The shape does not change.' },
        { text: 'Find the $y$-intercept and asymptote.', tex: '(0, 1) \\to (0, -4), \\qquad y = 0 \\to y = -5', why: 'Every point moves down $5$, and so does the line the graph approaches.' },
      ],
      answer: 'The graph of $g$ is the graph of $f$ shifted down 5 units. Its $y$-intercept is $(0, -4)$ and its asymptote is $y = -5$.',
    },
    {
      title: 'Find k from two graphs: a compression',
      kind: 'intermediate',
      problem: [
        { t: 'p', text: 'The graph shows $f(x) = 2^x$ and $g(x) = k \\cdot f(x)$. Find $k$ and describe the transformation.' },
        {
          t: 'graph',
          caption: 'f (solid) passes through (1, 2) and (3, 8). g (dashed) passes through (1, 1) and (3, 4).',
          spec: {
            xMin: -2,
            xMax: 4,
            yMin: -1,
            yMax: 10,
            functions: [
              { expr: '2^x', label: 'f' },
              { expr: '0.5*2^x', label: 'g', dashed: true },
            ],
            points: [
              { x: 1, y: 2, label: '(1, 2)' },
              { x: 3, y: 8, label: '(3, 8)' },
              { x: 1, y: 1, label: '(1, 1)' },
              { x: 3, y: 4, label: '(3, 4)' },
            ],
            ariaLabel: 'Two increasing exponential curves that approach the x-axis on the left. f passes through (1, 2) and (3, 8). The dashed g is lower, passing through (1, 1) and (3, 4).',
          },
        },
      ],
      steps: [
        { text: 'Match points at the same $x$.', tex: 'x = 1: (1, 2) \\to (1, 1); \\qquad x = 3: (3, 8) \\to (3, 4)', why: 'The rule $k \\cdot f(x)$ multiplies outputs, so compare $y$-values at the same $x$.' },
        { text: 'Divide to find $k$.', tex: 'k = \\frac{g(1)}{f(1)} = \\frac{1}{2}, \\qquad \\frac{g(3)}{f(3)} = \\frac{4}{8} = \\frac{1}{2}', why: 'For $g(x) = k \\cdot f(x)$, $k = \\frac{g(x)}{f(x)}$. Getting the same answer at two $x$-values confirms it.' },
        { text: 'Rule out a shift.', why: 'The differences are $1 - 2 = -1$ and $4 - 8 = -4$, which are not the same, so this is not $f(x) + k$. Also, both graphs approach $y = 0$, which a shift would have moved.' },
        { text: 'Describe it.', why: '$0 < \\frac{1}{2} < 1$, so the graph is compressed toward the $x$-axis.' },
      ],
      answer: '$k = \\frac{1}{2}$: $g(x) = \\frac{1}{2} \\cdot 2^x$ is a vertical compression of $f$ by a factor of $\\frac{1}{2}$.',
    },
    {
      title: 'Find k from the asymptote',
      kind: 'intermediate',
      problem: [
        { t: 'p', text: 'The graph shows $f(x) = \\left(\\frac{1}{2}\\right)^x$ and $g(x) = f(x) + k$. Find $k$.' },
        {
          t: 'graph',
          caption: 'f (solid) passes through (-2, 4) and (0, 1). g (dashed) passes through (-2, 1) and (0, -2) and approaches the dashed line y = -3.',
          spec: {
            xMin: -4,
            xMax: 4,
            yMin: -5,
            yMax: 9,
            functions: [
              { expr: '(0.5)^x', label: 'f' },
              { expr: '(0.5)^x - 3', label: 'g', dashed: true },
            ],
            segments: [{ x1: -4, y1: -3, x2: 4, y2: -3, dashed: true, color: '#8a8a8a', label: 'y = -3' }],
            points: [
              { x: -2, y: 4, label: '(-2, 4)' },
              { x: 0, y: 1, label: '(0, 1)' },
              { x: -2, y: 1, label: '(-2, 1)' },
              { x: 0, y: -2, label: '(0, -2)' },
            ],
            ariaLabel: 'Two decreasing exponential curves with the same shape. f passes through (-2, 4) and (0, 1) and approaches the x-axis on the right. The dashed g passes through (-2, 1) and (0, -2) and approaches the dashed horizontal line y = -3 on the right.',
          },
        },
      ],
      steps: [
        { text: 'Compare the asymptotes.', tex: 'y = 0 \\to y = -3', why: '$f(x) + k$ moves the asymptote from $y = 0$ to $y = k$, so $k$ is the new asymptote\'s value.' },
        { text: 'Check with matching points.', tex: 'g(0) - f(0) = -2 - 1 = -3, \\qquad g(-2) - f(-2) = 1 - 4 = -3', why: 'For a shift, $k = g(x) - f(x)$, and it must be the same at every $x$.' },
        { text: 'Write $g$.', tex: 'g(x) = \\left(\\frac{1}{2}\\right)^x - 3', why: 'Check: $\\left(\\frac{1}{2}\\right)^{-2} - 3 = 4 - 3 = 1$, which matches $(-2, 1)$.' },
      ],
      answer: '$k = -3$: the graph of $f$ is shifted down 3 units, and the asymptote is $y = -3$.',
    },
    {
      title: 'A common mistake: a stretch that looks like a shift',
      kind: 'common-mistake',
      problem: [
        { t: 'p', text: 'Let $f(x) = 2^x$. The graph of $g$ passes through $(0, 3)$ and $(2, 12)$. Priya says, "The $y$-intercept went from $1$ to $3$, so it moved up $2$: $g(x) = 2^x + 2$." Is she right?' },
      ],
      steps: [
        { text: 'Test Priya\'s rule at the second point.', tex: '2^2 + 2 = 6 \\ne 12', why: 'A rule has to work for **every** point, not just the $y$-intercept. Hers fails at $x = 2$.' },
        { text: 'Compare differences and ratios at both points.', tex: '\\text{differences: } 3 - 1 = 2,\\; 12 - 4 = 8 \\qquad \\text{ratios: } \\frac{3}{1} = 3,\\; \\frac{12}{4} = 3', why: 'A shift adds the same amount at every $x$; a stretch multiplies by the same factor. The differences are not equal but the ratios are, so this is a stretch.' },
        { text: 'Write $g$ and check.', tex: 'g(x) = 3 \\cdot 2^x: \\quad g(0) = 3,\\; g(2) = 3 \\cdot 4 = 12', why: 'Both points match.' },
        { text: 'Compare the asymptotes.', why: 'Priya\'s $2^x + 2$ would have asymptote $y = 2$. The real $g(x) = 3 \\cdot 2^x$ still has asymptote $y = 0$. Looking at the left side of the graph is another way to tell a shift from a stretch.' },
      ],
      answer: 'Priya is not right. $g(x) = 3 \\cdot 2^x = 3f(x)$, a vertical stretch by a factor of $3$, not a shift up $2$.',
    },
    {
      title: 'A cooling cup of cocoa',
      kind: 'real-world',
      problem: [
        { t: 'p', text: 'A cup of cocoa is $130$°F hotter than the room, and that difference shrinks by $10\\%$ each minute: $f(t) = 130(0.9)^t$. The room is $70$°F, so the cocoa\'s temperature is $T(t) = f(t) + 70$. Describe how the graph of $T$ compares with the graph of $f$, give its $y$-intercept and asymptote, and explain what they mean.' },
        {
          t: 'graph',
          caption: 'T(t) = 130(0.9)^t + 70 (dashed) is f(t) = 130(0.9)^t shifted up 70. T approaches the room temperature, 70°F.',
          spec: {
            xMin: 0,
            xMax: 30,
            yMin: 0,
            yMax: 220,
            xStep: 5,
            yStep: 20,
            xLabel: 't (minutes)',
            yLabel: 'degrees F',
            functions: [
              { expr: '130*(0.9)^x', label: 'f(t) = 130(0.9)^t' },
              { expr: '130*(0.9)^x + 70', label: 'T(t) = 130(0.9)^t + 70', dashed: true },
            ],
            segments: [{ x1: 0, y1: 70, x2: 30, y2: 70, dashed: true, color: '#8a8a8a', label: 'room temperature y = 70' }],
            points: [
              { x: 0, y: 130, label: '(0, 130)' },
              { x: 0, y: 200, label: '(0, 200)' },
            ],
            ariaLabel: 'Two decreasing exponential curves for t from 0 to 30 minutes. f starts at (0, 130) and approaches 0. The dashed T starts at (0, 200) and approaches the dashed horizontal line y = 70.',
          },
        },
      ],
      steps: [
        { text: 'Name the transformation.', why: '$T(t) = f(t) + 70$ adds $70$ outside $f$, so the graph of $T$ is the graph of $f$ shifted up $70$ units.' },
        { text: 'Find the $y$-intercept.', tex: 'T(0) = 130(0.9)^0 + 70 = 130 + 70 = 200', why: 'At $t = 0$ the power is $1$. The $y$-intercept moved from $(0, 130)$ up to $(0, 200)$: the cocoa starts at $200$°F.' },
        { text: 'Find the asymptote.', tex: 'y = 0 \\to y = 70', why: 'As $t$ grows, $130(0.9)^t$ gets closer and closer to $0$, so $T(t)$ gets closer and closer to $70$. The cocoa cools toward room temperature but, in this model, never quite reaches it.' },
        { text: 'Check one value.', tex: 'T(5) = 130(0.9)^5 + 70 = 130(0.59049) + 70 \\approx 146.8', why: 'After $5$ minutes the cocoa is about $147$°F, which is between $200$ and $70$, as the graph shows.' },
      ],
      answer: 'The graph of $T$ is the graph of $f$ shifted up 70. Its $y$-intercept is $(0, 200)$ (the starting temperature, 200°F) and its asymptote is $y = 70$ (the room temperature the cocoa approaches).',
    },
    {
      title: 'Two transformations at once',
      kind: 'challenging',
      problem: [
        { t: 'p', text: 'Let $f(x) = 2^x$ and $g(x) = -2f(x) + 8$. Describe the transformations, and find the $y$-intercept, the asymptote and the $x$-intercept of $g$.' },
        {
          t: 'graph',
          caption: 'f(x) = 2^x (solid) and g(x) = -2(2)^x + 8 (dashed), which approaches y = 8 on the left.',
          spec: {
            xMin: -3,
            xMax: 4,
            yMin: -10,
            yMax: 10,
            yStep: 2,
            functions: [
              { expr: '2^x', label: 'f(x) = 2^x' },
              { expr: '-2*2^x + 8', label: 'g(x) = -2(2)^x + 8', dashed: true },
            ],
            segments: [{ x1: -3, y1: 8, x2: 4, y2: 8, dashed: true, color: '#8a8a8a', label: 'y = 8' }],
            points: [
              { x: 0, y: 1, label: '(0, 1)' },
              { x: 2, y: 4, label: '(2, 4)' },
              { x: 0, y: 6, label: '(0, 6)' },
              { x: 2, y: 0, label: '(2, 0)' },
              { x: 3, y: -8, label: '(3, -8)' },
            ],
            ariaLabel: 'The increasing curve 2 to the x through (0, 1) and (2, 4). The dashed curve g decreases: it approaches the dashed line y = 8 on the left and passes through (0, 6), (2, 0) and (3, -8).',
          },
        },
      ],
      steps: [
        { text: 'Multiply first.', tex: '-2f(x) = -2 \\cdot 2^x', why: 'In $-2f(x) + 8$, the outputs of $f$ are multiplied by $-2$ first: a reflection across the $x$-axis and a vertical stretch by a factor of $2$. The asymptote is still $y = 0$.' },
        { text: 'Then shift.', tex: 'g(x) = -2 \\cdot 2^x + 8', why: 'Adding $8$ shifts that graph up $8$, so the asymptote moves from $y = 0$ to $y = 8$.' },
        { text: 'Find the $y$-intercept.', tex: 'g(0) = -2(1) + 8 = 6', why: 'Follow the point $(0, 1)$: multiply by $-2$ to get $-2$, then add $8$ to get $6$.' },
        { text: 'Find the $x$-intercept.', tex: '-2 \\cdot 2^x + 8 = 0 \\;\\Longrightarrow\\; 2^x = 4 \\;\\Longrightarrow\\; x = 2', why: 'Set $g(x) = 0$. Since $2^2 = 4$, $x = 2$. Check: $g(2) = -8 + 8 = 0$.' },
        { text: 'Check the order matters.', why: 'If you shifted first and then multiplied, you would get $-2(2^x + 8) = -2 \\cdot 2^x - 16$, with asymptote $y = -16$. In $-2f(x) + 8$, the $+8$ is outside the multiplication, so it comes last.' },
      ],
      answer: 'Reflect across the $x$-axis and stretch vertically by a factor of $2$, then shift up $8$. The $y$-intercept is $(0, 6)$, the asymptote is $y = 8$, and the $x$-intercept is $(2, 0)$.',
    },
  ],
  teachMeAgain: [
    {
      approach: 'visual',
      title: 'Watch the points move',
      blocks: [
        { t: 'p', text: 'The dashed segments show where three points of $f(x) = 2^x$ go under $g(x) = 3f(x)$.' },
        {
          t: 'graph',
          caption: 'Under 3f(x), (0, 1) moves up 2, (1, 2) moves up 4 and (2, 4) moves up 8. Points higher up move farther.',
          spec: {
            xMin: -3,
            xMax: 3,
            yMin: -1,
            yMax: 13,
            functions: [
              { expr: '2^x', label: 'f(x) = 2^x' },
              { expr: '3*2^x', label: 'g(x) = 3(2)^x', dashed: true },
            ],
            segments: [
              { x1: 0, y1: 1, x2: 0, y2: 3, dashed: true },
              { x1: 1, y1: 2, x2: 1, y2: 6, dashed: true },
              { x1: 2, y1: 4, x2: 2, y2: 12, dashed: true },
            ],
            points: [
              { x: 0, y: 1, label: '(0, 1)' },
              { x: 1, y: 2, label: '(1, 2)' },
              { x: 2, y: 4, label: '(2, 4)' },
              { x: 0, y: 3, label: '(0, 3)' },
              { x: 1, y: 6, label: '(1, 6)' },
              { x: 2, y: 12, label: '(2, 12)' },
            ],
            ariaLabel: 'f(x) = 2 to the x through (0, 1), (1, 2) and (2, 4). Dashed vertical segments join each to a point of g(x) = 3 times 2 to the x: (0, 3), (1, 6) and (2, 12). The segments get longer from left to right.',
          },
        },
        { t: 'p', text: 'A **stretch** moves each point a different distance (here $2$, $4$, $8$), because each $y$-value is tripled. Points near the $x$-axis barely move, so the asymptote $y = 0$ stays. A **shift** like $f(x) + 3$ would move every point exactly $3$ up, asymptote included.' },
      ],
    },
    {
      approach: 'simpler-example',
      title: 'Just plug in numbers',
      blocks: [
        { t: 'p', text: 'Let $f(x) = 2^x$. Compare $f(x) + 2$ with $2f(x)$ by computing:' },
        {
          t: 'table',
          caption: 'Adding 2 versus multiplying by 2.',
          headers: ['$x$', '$f(x) = 2^x$', '$f(x) + 2$', '$2f(x)$'],
          rows: [
            ['$0$', '$1$', '$3$', '$2$'],
            ['$1$', '$2$', '$4$', '$4$'],
            ['$3$', '$8$', '$10$', '$16$'],
          ],
        },
        { t: 'p', text: '$f(x) + 2$ is always exactly $2$ more: a shift up $2$. $2f(x)$ is always double: a vertical stretch by a factor of $2$, which pulls high points up a lot ($8 \\to 16$) and low points up only a little ($1 \\to 2$).' },
      ],
    },
    {
      approach: 'analogy',
      title: 'An elevator and a zoom button',
      blocks: [
        { t: 'p', text: 'Adding $k$ is like an **elevator**: the whole graph rides up (or down) the same number of floors. Even the "floor" it was approaching, the asymptote, rides along.' },
        { t: 'p', text: 'Multiplying by $k$ is like a **vertical zoom** that keeps the $x$-axis fixed: everything is measured from the $x$-axis and scaled. Something $1$ unit above the axis ends up $k$ units above; something $4$ units above ends up $4k$ units above. The $x$-axis itself does not move, so an asymptote along it stays there. A negative $k$ zooms and also flips the picture upside down.' },
      ],
    },
    {
      approach: 'prerequisite',
      title: 'Refresher: features of a(b)^x + k',
      blocks: [
        { t: 'p', text: 'You can read the key features of any exponential function straight from its equation:' },
        { t: 'list', items: [
          '**$y$-intercept:** put in $x = 0$. Since $b^0 = 1$, $y = a(b)^0 + k = a + k$. For $4(3)^x - 1$, it is $(0, 3)$.',
          '**Asymptote:** $a(b)^x$ gets close to $0$ at one end, so $a(b)^x + k$ gets close to $k$: the asymptote is $y = k$. For $4(3)^x - 1$, it is $y = -1$.',
          '**Above or below:** if $a > 0$ the graph stays above its asymptote; if $a < 0$ it stays below.',
        ] },
        { t: 'p', text: 'Transformations just change $a$ and $k$: multiplying $f(x) = 4(3)^x$ by $2$ gives $8(3)^x$, and adding $-1$ gives $4(3)^x - 1$.' },
      ],
    },
    {
      approach: 'step-by-step',
      title: 'A checklist for finding k',
      blocks: [
        { t: 'p', text: '$f(x) = 3^x$, and $g$ passes through $(0, -2)$ and $(1, -6)$. Is $g(x) = f(x) + k$ or $g(x) = k \\cdot f(x)$? Find $k$.' },
        { t: 'list', ordered: true, items: [
          '**Match points at the same $x$:** $f(0) = 1$ with $g(0) = -2$; $f(1) = 3$ with $g(1) = -6$.',
          '**Try differences:** $-2 - 1 = -3$ and $-6 - 3 = -9$. Not equal, so not a shift.',
          '**Try ratios:** $\\frac{-2}{1} = -2$ and $\\frac{-6}{3} = -2$. Equal, so $g(x) = -2f(x)$.',
          '**Describe:** $k = -2 < 0$, so a reflection across the $x$-axis and a vertical stretch by a factor of $2$.',
          '**Check:** $g(1) = -2 \\cdot 3^1 = -6$. It matches.',
        ] },
      ],
    },
    {
      approach: 'alternate-strategy',
      title: 'Use the asymptote and the y-intercept',
      blocks: [
        { t: 'p', text: 'Instead of comparing points one by one, look at two features of $g$ when $f(x) = a(b)^x$ (asymptote $y = 0$, $y$-intercept $(0, a)$):' },
        { t: 'list', items: [
          '**Did the asymptote move?** If $g$ approaches $y = k$ with $k \\ne 0$, it is a shift: $g(x) = f(x) + k$. For example, a new asymptote $y = 4$ means $k = 4$.',
          '**Asymptote still $y = 0$?** Then it is $k \\cdot f(x)$, and $k = \\frac{\\text{new } y\\text{-intercept}}{\\text{old } y\\text{-intercept}}$. For $f(x) = 5(2)^x$ and a new $y$-intercept of $(0, 15)$, $k = \\frac{15}{5} = 3$.',
        ] },
        { t: 'p', text: 'Then confirm with one more point. For $g(x) = 3 \\cdot 5(2)^x = 15(2)^x$, $g(1) = 30$, and $3 \\cdot f(1) = 3 \\cdot 10 = 30$.' },
      ],
    },
  ],
  guided: [
    { generator: 'u6.exp-transform', difficulty: 1 },
    { generator: 'u6.exp-transform', difficulty: 1 },
    { generator: 'u6.exp-transform', difficulty: 2 },
    { generator: 'u6.exp-transform', difficulty: 2 },
  ],
  independent: {
    count: 8,
    reviewCount: 2,
    mix: [
      { generator: 'u6.exp-transform', difficulty: 1, weight: 1 },
      { generator: 'u6.exp-transform', difficulty: 2, weight: 2 },
      { generator: 'u6.exp-transform', difficulty: 3, weight: 1 },
    ],
  },
  quiz: {
    items: [
      { generator: 'u6.exp-transform', difficulty: 1 },
      { generator: 'u6.exp-transform', difficulty: 2 },
      { generator: 'u6.exp-transform', difficulty: 2 },
      { generator: 'u6.exp-transform', difficulty: 2 },
      { generator: 'u6.exp-transform', difficulty: 3 },
      { generator: 'u6.exp-transform', difficulty: 3 },
    ],
  },
  summary: [
    '$f(x) + k$ shifts the graph up $k$ units (down $|k|$ when $k < 0$); the asymptote $y = 0$ becomes $y = k$, and the $y$-intercept goes up or down by $k$.',
    '$k \\cdot f(x)$ is a vertical stretch by a factor of $k$ when $k > 1$, a vertical compression when $0 < k < 1$, and a reflection across the $x$-axis when $k < 0$; the asymptote stays $y = 0$ and the $y$-intercept is multiplied by $k$.',
    'To find $k$, compare $f$ and $g$ at the same $x$: for a shift $k = g(x) - f(x)$ (or read the new asymptote); for a stretch $k = \\frac{g(x)}{f(x)}$.',
    'A shift adds the same amount at every $x$; a stretch multiplies by the same factor. Check two points to tell them apart.',
    'In $k_1 \\cdot f(x) + k_2$, multiply first, then shift: the asymptote is $y = k_2$.',
  ],
  mastery: { quizPassScore: 0.8, practiceMinCorrect: 5 },
};
