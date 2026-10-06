import type { LessonContent } from '../../../core/curriculum/types';

/**
 * U4L15 Transformations of Quadratic Functions (A.FGR.7.2)
 * The effects of f(x) + k, f(x + k), k·f(x) (vertical stretch, compression and reflection across the x-axis)
 * and f(kx) (horizontal compression and stretch), shown with tables and with f and g graphed together,
 * the "inside moves opposite" sign trap, and finding k from a pair of graphs or from a point (S4.17).
 *
 * Math verified by hand (2026-10-06): every table value, every transformed point (checked on both f and g), every vertex and every k below was recomputed independently, and every graph's function strings, window and labeled points were checked to agree with the text.
 */
export const U4L15: LessonContent = {
  lessonId: 'U4L15',
  goal: 'Describe how $g$ compares with $f$ when $g(x) = f(x) + k$, $f(x + k)$, $k \\cdot f(x)$ or $f(kx)$, such as "$f(x + 3)$ moves the graph 3 units **left**," and find $k$ from a pair of graphs or from a point.',
  needToKnow: [
    { t: 'p', text: 'This lesson builds on two things you already know:' },
    {
      t: 'list',
      items: [
        '**Function notation.** If $f(x) = x^2$, then $f(5) = 25$, and $f(x + 3)$ means "put $x + 3$ in for $x$": $f(x + 3) = (x + 3)^2$.',
        '**Vertex form.** The graph of $y = a(x - h)^2 + k$ has its vertex at $(h, k)$. For example, $y = (x + 3)^2 + 1$ has vertex $(-3, 1)$.',
      ],
    },
    { t: 'callout', variant: 'tip', title: 'Quick check', text: 'If $f(x) = x^2 - 1$, what is $f(x + 2)$? (You should get $(x + 2)^2 - 1$.) If that felt shaky, open **Teach Me Again** and choose the refresher.' },
  ],
  vocabulary: [
    { term: 'transformation', meaning: 'A change that moves, flips or reshapes a graph. Here $f$ is the starting function and $g$ is the new one.' },
    { term: 'translation (shift)', meaning: 'Sliding a graph up, down, left or right without changing its shape.' },
    { term: 'vertical stretch or compression', meaning: 'Multiplying every output by $k$. The graph is pulled away from the $x$-axis (stretch, $|k| > 1$) or squashed toward it (compression, $0 < |k| < 1$).' },
    { term: 'reflection across the x-axis', meaning: 'Flipping a graph upside down, so every point $(x, y)$ goes to $(x, -y)$. This happens to $k \\cdot f(x)$ when $k < 0$.' },
    { term: 'horizontal compression or stretch', meaning: 'Squeezing a graph toward the $y$-axis or pulling it away. $f(kx)$ does this: every $x$-coordinate is multiplied by $\\frac{1}{k}$.' },
  ],
  instruction: [
    { t: 'p', text: '### Outside changes outputs, inside changes inputs' },
    { t: 'p', text: 'We start with a function $f$ and build a new function $g$ from it. There are four basic moves. The big idea is **where** the number $k$ goes:' },
    { t: 'callout', variant: 'why', title: 'Why the place matters', text: 'In $f(x) + k$ and $k \\cdot f(x)$, the $k$ is **outside** $f$. It acts after $f$ has done its work, so it changes the outputs ($y$-values): the graph moves or stretches **up and down**. In $f(x + k)$ and $f(kx)$, the $k$ is **inside**. It changes the input before $f$ sees it, so the graph moves or stretches **left and right**, and, as you will see, in the direction you might not expect.' },
    { t: 'p', text: '### Adding outside: f(x) + k' },
    { t: 'p', text: 'Let $f(x) = x^2$ and $g(x) = f(x) + 3 = x^2 + 3$. Compare outputs at the same inputs:' },
    {
      t: 'table',
      caption: 'Every output of g is 3 more than the output of f at the same x.',
      headers: ['$x$', '$-2$', '$-1$', '$0$', '$1$', '$2$'],
      rows: [
        ['$f(x) = x^2$', '$4$', '$1$', '$0$', '$1$', '$4$'],
        ['$g(x) = x^2 + 3$', '$7$', '$4$', '$3$', '$4$', '$7$'],
      ],
    },
    {
      t: 'graph',
      caption: 'The graph of g (dashed) is the graph of f moved up 3 units. The vertex moves from (0, 0) to (0, 3).',
      spec: {
        xMin: -4,
        xMax: 4,
        yMin: -2,
        yMax: 10,
        functions: [
          { expr: 'x^2', label: 'f(x) = x^2' },
          { expr: 'x^2 + 3', label: 'g(x) = x^2 + 3', dashed: true },
        ],
        points: [
          { x: 0, y: 0, label: '(0, 0)' },
          { x: 0, y: 3, label: '(0, 3)' },
          { x: 2, y: 4, label: '(2, 4)' },
          { x: 2, y: 7, label: '(2, 7)' },
        ],
        ariaLabel: 'Two upward parabolas with the same shape. f(x) = x squared has vertex (0, 0) and passes through (2, 4). g(x) = x squared plus 3, dashed, has vertex (0, 3) and passes through (2, 7).',
      },
    },
    { t: 'p', text: '$f(x) + k$ shifts the graph **up** $k$ units, or **down** $|k|$ units when $k < 0$. For example, $f(x) - 5$ shifts down $5$.' },
    { t: 'p', text: '### Adding inside: f(x + k)' },
    { t: 'p', text: 'Now let $g(x) = f(x + 3) = (x + 3)^2$. Follow the input: $g$ first adds $3$ to $x$, then squares.' },
    {
      t: 'table',
      caption: 'g(x) = f(x + 3). The output f gives at an input, g gives at an x that is 3 smaller.',
      headers: ['$x$', '$x + 3$', '$g(x) = (x + 3)^2$'],
      rows: [
        ['$-5$', '$-2$', '$4$'],
        ['$-4$', '$-1$', '$1$'],
        ['$-3$', '$0$', '$0$'],
        ['$-2$', '$1$', '$1$'],
        ['$-1$', '$2$', '$4$'],
      ],
    },
    { t: 'p', text: 'The outputs $4, 1, 0, 1, 4$ are exactly the outputs of $f$ at $x = -2, -1, 0, 1, 2$, but $g$ makes them at $x = -5, -4, -3, -2, -1$. Every point is **3 units to the left**. In particular $g(-3) = f(0) = 0$, so the vertex moves from $(0, 0)$ to $(-3, 0)$.' },
    {
      t: 'graph',
      caption: 'The graph of g (dashed) is the graph of f moved 3 units left. The vertex moves from (0, 0) to (-3, 0).',
      spec: {
        xMin: -7,
        xMax: 4,
        yMin: -2,
        yMax: 10,
        functions: [
          { expr: 'x^2', label: 'f(x) = x^2' },
          { expr: '(x+3)^2', label: 'g(x) = (x + 3)^2', dashed: true },
        ],
        points: [
          { x: 0, y: 0, label: '(0, 0)' },
          { x: -3, y: 0, label: '(-3, 0)' },
          { x: 2, y: 4, label: '(2, 4)' },
          { x: -1, y: 4, label: '(-1, 4)' },
        ],
        ariaLabel: 'Two upward parabolas with the same shape. f(x) = x squared has vertex (0, 0) and passes through (2, 4). g(x) = (x plus 3) squared, dashed, has vertex (-3, 0) and passes through (-1, 4).',
      },
    },
    { t: 'callout', variant: 'warning', title: 'Inside moves opposite', text: 'The plus sign in $f(x + 3)$ moves the graph **left** 3, not right. $f(x + k)$ shifts **left** $k$ when $k > 0$, and $f(x - 3)$ (that is, $k = -3$) shifts **right** 3. Why: $g$ reaches the vertex when the inside, $x + 3$, equals $0$, and that happens at $x = -3$.' },
    { t: 'p', text: '### Multiplying outside: k · f(x)' },
    { t: 'p', text: 'Multiplying by $k$ outside multiplies **every output** by $k$:' },
    {
      t: 'table',
      caption: 'Each column multiplies the outputs of f(x) = x squared by a different k.',
      headers: ['$x$', '$f(x) = x^2$', '$2f(x)$', '$0.5f(x)$', '$-f(x)$'],
      rows: [
        ['$-2$', '$4$', '$8$', '$2$', '$-4$'],
        ['$-1$', '$1$', '$2$', '$0.5$', '$-1$'],
        ['$0$', '$0$', '$0$', '$0$', '$0$'],
        ['$1$', '$1$', '$2$', '$0.5$', '$-1$'],
        ['$2$', '$4$', '$8$', '$2$', '$-4$'],
      ],
    },
    {
      t: 'graph',
      caption: 'Above x = 2: f gives 4, 2f gives 8 (vertical stretch) and 0.5f gives 2 (vertical compression).',
      spec: {
        xMin: -4,
        xMax: 4,
        yMin: -1,
        yMax: 10,
        functions: [
          { expr: 'x^2', label: 'f(x) = x^2' },
          { expr: '2x^2', label: '2f(x) = 2x^2', dashed: true },
          { expr: '0.5x^2', label: '0.5f(x) = 0.5x^2', dashed: true },
        ],
        points: [
          { x: 2, y: 4, label: '(2, 4)' },
          { x: 2, y: 8, label: '(2, 8)' },
          { x: 2, y: 2, label: '(2, 2)' },
        ],
        ariaLabel: 'Three upward parabolas with vertex (0, 0). The narrowest, 2x squared, passes through (2, 8). The middle one, x squared, passes through (2, 4). The widest, 0.5x squared, passes through (2, 2).',
      },
    },
    {
      t: 'graph',
      caption: 'Multiplying by -1 flips the graph across the x-axis: (2, 4) goes to (2, -4).',
      spec: {
        xMin: -4,
        xMax: 4,
        yMin: -6,
        yMax: 6,
        functions: [
          { expr: 'x^2', label: 'f(x) = x^2' },
          { expr: '-x^2', label: '-f(x) = -x^2', dashed: true },
        ],
        points: [
          { x: 2, y: 4, label: '(2, 4)' },
          { x: 2, y: -4, label: '(2, -4)' },
        ],
        ariaLabel: 'An upward parabola x squared through (2, 4) and its mirror image, the downward parabola negative x squared through (2, -4). Both have vertex (0, 0).',
      },
    },
    { t: 'p', text: '$k \\cdot f(x)$ is a **vertical stretch** by a factor of $|k|$ when $|k| > 1$, a **vertical compression** by a factor of $|k|$ when $0 < |k| < 1$, and a **reflection across the $x$-axis** when $k < 0$. So $-2f(x)$ is a reflection across the $x$-axis together with a vertical stretch by a factor of $2$. Points on the $x$-axis do not move, because $k \\cdot 0 = 0$.' },
    { t: 'p', text: '### Multiplying inside: f(kx)' },
    { t: 'p', text: 'To see this one clearly, use a parabola whose vertex is **not** on the $y$-axis: $f(x) = (x - 4)^2$, with vertex $(4, 0)$. Let $g(x) = f(2x) = (2x - 4)^2$.' },
    {
      t: 'table',
      caption: 'g(x) = f(2x). g gives the same outputs as f at half the x-values.',
      headers: ['$x$', '$2x$', '$g(x) = f(2x)$', 'matching point of $f$'],
      rows: [
        ['$1$', '$2$', '$f(2) = 4$', '$(2, 4)$'],
        ['$2$', '$4$', '$f(4) = 0$', '$(4, 0)$'],
        ['$3$', '$6$', '$f(6) = 4$', '$(6, 4)$'],
      ],
    },
    {
      t: 'graph',
      caption: 'g(x) = f(2x) (dashed) is f squeezed toward the y-axis: every x-coordinate is cut in half, and every y-coordinate stays the same.',
      spec: {
        xMin: -1,
        xMax: 9,
        yMin: -1,
        yMax: 9,
        functions: [
          { expr: '(x-4)^2', label: 'f(x) = (x - 4)^2' },
          { expr: '(2x-4)^2', label: 'g(x) = f(2x) = (2x - 4)^2', dashed: true },
        ],
        points: [
          { x: 2, y: 4, label: '(2, 4)' },
          { x: 4, y: 0, label: '(4, 0)' },
          { x: 6, y: 4, label: '(6, 4)' },
          { x: 1, y: 4, label: '(1, 4)' },
          { x: 2, y: 0, label: '(2, 0)' },
          { x: 3, y: 4, label: '(3, 4)' },
        ],
        ariaLabel: 'f(x) = (x minus 4) squared has vertex (4, 0) and passes through (2, 4) and (6, 4). The dashed g(x) = (2x minus 4) squared is narrower, with vertex (2, 0), passing through (1, 4) and (3, 4).',
      },
    },
    { t: 'p', text: 'Each point $(a, b)$ of $f$ moves to $\\left(\\frac{a}{k}, b\\right)$. $f(kx)$ is a **horizontal compression by a factor of $\\frac{1}{k}$** when $k > 1$, and a **horizontal stretch** when $0 < k < 1$. For example, $f(0.5x)$ multiplies every $x$-coordinate by $2$, so the vertex $(4, 0)$ moves to $(8, 0)$.' },
    { t: 'callout', variant: 'tip', title: 'A special case: the parent function', text: 'For $f(x) = x^2$ itself, $f(2x) = (2x)^2 = 4x^2$, so the horizontal compression by $\\frac{1}{2}$ looks exactly like a vertical stretch by $4$. That only happens because the vertex is on the $y$-axis. With $f(x) = (x - 4)^2$ the two are different: $f(2x)$ has vertex $(2, 0)$, but $4f(x)$ keeps the vertex at $(4, 0)$.' },
    { t: 'p', text: '### Finding k' },
    { t: 'p', text: 'To find $k$, match one point of $f$ with the point of $g$ it moved to. The vertex is usually the easiest. Or, if you know one point on $g$, substitute it.' },
    {
      t: 'table',
      caption: 'How to find k for each rule.',
      headers: ['Rule', 'What happens', 'How to find k'],
      rows: [
        ['$g(x) = f(x) + k$', 'up $k$ (down if $k < 0$)', '$k$ = (new $y$) $-$ (old $y$) at a matching point'],
        ['$g(x) = f(x + k)$', 'left $k$ when $k > 0$; right when $k < 0$', '$k$ = (old $x$) $-$ (new $x$) of the vertex'],
        ['$g(x) = k \\cdot f(x)$', 'vertical stretch, compression, or reflection across the $x$-axis if $k < 0$', '$k = \\frac{g(x)}{f(x)}$ at the same $x$'],
        ['$g(x) = f(kx)$', 'horizontal compression by $\\frac{1}{k}$ when $k > 1$; stretch when $0 < k < 1$', '$k$ = (old $x$) $\\div$ (new $x$) at a matching point'],
      ],
    },
    { t: 'p', text: 'For example, if $f(x) = x^2$ and $g(x) = k \\cdot f(x)$ passes through $(2, 12)$, then $k \\cdot 2^2 = 12$, so $k = 3$.' },
    { t: 'callout', variant: 'realworld', title: 'Where this shows up', text: 'If a ball follows $h(t) = -16t^2 + 64t$ when thrown from the ground, the same throw from a 20-foot balcony follows $h(t) + 20$, and the same throw made 1 second later follows $h(t - 1)$. One graph, moved.' },
  ],
  examples: [
    {
      title: 'A vertical shift',
      kind: 'introductory',
      problem: [{ t: 'p', text: 'Let $f(x) = x^2$ and $g(x) = x^2 - 5$. Describe how the graph of $g$ compares with the graph of $f$, and give the vertex of $g$.' }],
      steps: [
        { text: 'Write $g$ in terms of $f$.', tex: 'g(x) = x^2 - 5 = f(x) - 5', why: 'The $-5$ is added **outside** $f$, after squaring, so it changes outputs.' },
        { text: 'Compare a few outputs.', tex: 'f(0) = 0,\\; g(0) = -5; \\qquad f(2) = 4,\\; g(2) = -1', why: 'At the same input, every output of $g$ is $5$ less than the output of $f$.' },
        { text: 'Describe the move.', why: '$f(x) + k$ with $k = -5$ shifts down $5$ units. The shape does not change.' },
        { text: 'Find the vertex.', tex: '(0, 0) \\to (0, -5)', why: 'Every point moves down $5$, the vertex included.' },
      ],
      answer: 'The graph of $g$ is the graph of $f$ shifted down 5 units. The vertex of $g$ is $(0, -5)$.',
    },
    {
      title: 'Find k from two graphs',
      kind: 'intermediate',
      problem: [
        { t: 'p', text: 'The graph shows $f(x) = (x - 1)^2$ and $g(x) = f(x + k)$. Find $k$.' },
        {
          t: 'graph',
          caption: 'f (solid) has vertex (1, 0). g (dashed) has vertex (-2, 0).',
          spec: {
            xMin: -6,
            xMax: 5,
            yMin: -1,
            yMax: 9,
            functions: [
              { expr: '(x-1)^2', label: 'f' },
              { expr: '(x+2)^2', label: 'g', dashed: true },
            ],
            points: [
              { x: 1, y: 0, label: '(1, 0)' },
              { x: -2, y: 0, label: '(-2, 0)' },
              { x: 3, y: 4, label: '(3, 4)' },
              { x: 0, y: 4, label: '(0, 4)' },
            ],
            ariaLabel: 'Two upward parabolas with the same shape. f has vertex (1, 0) and passes through (3, 4). The dashed g has vertex (-2, 0) and passes through (0, 4).',
          },
        },
      ],
      steps: [
        { text: 'Match the vertices.', tex: '(1, 0) \\to (-2, 0)', why: 'The rule is $f(x + k)$, a horizontal shift, so compare $x$-coordinates of matching points. The vertex is easiest to see.' },
        { text: 'Describe the shift.', why: '$-2$ is $3$ units to the left of $1$. The $y$-values did not change.' },
        { text: 'Turn the shift into $k$.', tex: 'k = (\\text{old } x) - (\\text{new } x) = 1 - (-2) = 3', why: '$f(x + k)$ shifts **left** $k$ when $k > 0$. A left shift of $3$ means $k = 3$, not $-3$.' },
        { text: 'Check with the formula.', tex: 'g(x) = f(x + 3) = (x + 3 - 1)^2 = (x + 2)^2', why: '$(x + 2)^2$ has vertex $(-2, 0)$, and $g(0) = 4$ matches the labeled point $(0, 4)$, which came from $(3, 4)$ on $f$.' },
      ],
      answer: '$k = 3$, so $g(x) = f(x + 3)$, the graph of $f$ shifted 3 units left.',
    },
    {
      title: 'Find k from one point',
      kind: 'intermediate',
      problem: [
        { t: 'p', text: 'Let $f(x) = (x - 1)^2 + 2$ and $g(x) = k \\cdot f(x)$. The graph of $g$ passes through $(3, -3)$. Find $k$ and describe the transformation.' },
        {
          t: 'graph',
          caption: 'f (solid) passes through (3, 6). g (dashed) passes through (3, -3).',
          spec: {
            xMin: -3,
            xMax: 5,
            yMin: -6,
            yMax: 8,
            functions: [
              { expr: '(x-1)^2 + 2', label: 'f' },
              { expr: '-0.5((x-1)^2 + 2)', label: 'g', dashed: true },
            ],
            points: [
              { x: 3, y: 6, label: '(3, 6)' },
              { x: 3, y: -3, label: '(3, -3)' },
              { x: 1, y: 2, label: '(1, 2)' },
              { x: 1, y: -1, label: '(1, -1)' },
            ],
            ariaLabel: 'f is an upward parabola with vertex (1, 2) passing through (3, 6). The dashed g is a wider downward parabola with vertex (1, -1) passing through (3, -3).',
          },
        },
      ],
      steps: [
        { text: 'Find $f$ at the same input.', tex: 'f(3) = (3 - 1)^2 + 2 = 4 + 2 = 6', why: '$k \\cdot f(x)$ multiplies the output at each $x$, so compare outputs at the **same** $x$, here $x = 3$.' },
        { text: 'Set up and solve.', tex: 'k \\cdot 6 = -3 \\quad\\Longrightarrow\\quad k = -\\frac{3}{6} = -\\frac{1}{2}', why: 'The point $(3, -3)$ is on $g$, so $g(3) = -3$.' },
        { text: 'Describe it.', why: '$k < 0$ gives a reflection across the $x$-axis, and $|k| = \\frac{1}{2}$ is between $0$ and $1$, so it is also a vertical compression by a factor of $\\frac{1}{2}$.' },
        { text: 'Check with the vertex.', tex: 'g(1) = -\\tfrac{1}{2} \\cdot f(1) = -\\tfrac{1}{2} \\cdot 2 = -1', why: 'The vertex $(1, 2)$ goes to $(1, -1)$: same $x$, output multiplied by $-\\frac{1}{2}$. That matches the dashed graph.' },
      ],
      answer: '$k = -\\frac{1}{2}$: a reflection across the $x$-axis and a vertical compression by a factor of $\\frac{1}{2}$.',
    },
    {
      title: 'A common mistake: moving the wrong way',
      kind: 'common-mistake',
      problem: [{ t: 'p', text: 'Let $f(x) = x^2$ and $g(x) = f(x + 3) + 1 = (x + 3)^2 + 1$. A student says, "The graph moves right 3 and up 1, so the vertex of $g$ is $(3, 1)$." Find the mistake and fix it.' }],
      steps: [
        { text: 'Test the student vertex.', tex: 'g(3) = (3 + 3)^2 + 1 = 37', why: 'If $(3, 1)$ were on $g$, then $g(3)$ would be $1$. It is $37$, so the student is wrong.' },
        { text: 'Find the error.', why: 'The $+3$ is **inside** $f$. Inside changes move opposite to the sign: $f(x + 3)$ shifts **left** 3.' },
        { text: 'Find where the inside is $0$.', tex: 'x + 3 = 0 \\quad\\Longrightarrow\\quad x = -3', why: 'The vertex of $x^2$ happens when its input is $0$, and the input here is $x + 3$.' },
        { text: 'Apply the outside change.', tex: 'g(-3) = 0^2 + 1 = 1', why: 'The $+1$ is outside, so it shifts up 1, the direction it looks.' },
      ],
      answer: 'The graph of $g$ is the graph of $f$ shifted **left** 3 and up 1. The vertex is $(-3, 1)$, not $(3, 1)$.',
    },
    {
      title: 'The same throw, moved',
      kind: 'real-world',
      problem: [
        { t: 'p', text: 'Thrown straight up from the ground at 64 feet per second, a ball has height $h(t) = -16t^2 + 64t$ feet after $t$ seconds. Its highest point is $64$ feet at $t = 2$. Describe each new function and give its highest point: (a) the same throw from a 20-foot balcony, $g(t) = h(t) + 20$; (b) the same throw from the ground, made 1 second later, $p(t) = h(t - 1)$.' },
        {
          t: 'graph',
          caption: 'h (solid), the balcony throw g (dashed) and the later throw p.',
          spec: {
            xMin: 0,
            xMax: 6,
            yMin: 0,
            yMax: 100,
            yStep: 10,
            xLabel: 't (seconds)',
            yLabel: 'height (feet)',
            functions: [
              { expr: '-16x^2 + 64x', label: 'h(t)', domain: [0, 4] },
              { expr: '-16x^2 + 64x + 20', label: 'g(t) = h(t) + 20', dashed: true, domain: [0, 4.29] },
              { expr: '-16(x-1)^2 + 64(x-1)', label: 'p(t) = h(t - 1)', domain: [1, 5] },
            ],
            points: [
              { x: 2, y: 64, label: '(2, 64)' },
              { x: 2, y: 84, label: '(2, 84)' },
              { x: 3, y: 64, label: '(3, 64)' },
            ],
            ariaLabel: 'Three downward parabola arcs. h starts at (0, 0), peaks at (2, 64) and lands at t = 4. g starts at (0, 20), peaks at (2, 84) and lands near t = 4.29. p starts at (1, 0), peaks at (3, 64) and lands at t = 5.',
          },
        },
      ],
      steps: [
        { text: '(a) Name the rule.', tex: 'g(t) = h(t) + 20', why: 'The $20$ is added outside $h$, to the height. So the graph shifts **up** $20$ feet. The timing does not change.' },
        { text: '(a) Find the highest point.', tex: 'g(2) = h(2) + 20 = 64 + 20 = 84', why: 'Every height is $20$ more, so the peak is still at $t = 2$ but now $84$ feet. Check: $-16(4) + 64(2) + 20 = -64 + 128 + 20 = 84$.' },
        { text: '(b) Name the rule.', tex: 'p(t) = h(t - 1) = h(t + k) \\text{ with } k = -1', why: 'The change is inside $h$. $h(t + k)$ shifts left $k$, and $k = -1$, so the graph shifts **right** $1$. That makes sense: later means farther right on a time axis.' },
        { text: '(b) Find the highest point.', tex: 'p(3) = h(3 - 1) = h(2) = 64', why: 'The peak happens when the inside, $t - 1$, equals $2$, so at $t = 3$. The height is unchanged.' },
      ],
      answer: '(a) Shifted up 20 feet: highest point 84 feet at $t = 2$ s. (b) Shifted right 1 second: highest point 64 feet at $t = 3$ s.',
    },
    {
      title: 'Find k for a horizontal compression',
      kind: 'challenging',
      problem: [
        { t: 'p', text: 'The graph shows $f(x) = (x - 6)^2 - 4$ and $g(x) = f(kx)$. Find $k$ and describe the transformation.' },
        {
          t: 'graph',
          caption: 'f (solid) has zeros 4 and 8 and vertex (6, -4). g (dashed) has zeros 2 and 4 and vertex (3, -4).',
          spec: {
            xMin: -1,
            xMax: 10,
            yMin: -5,
            yMax: 8,
            functions: [
              { expr: '(x-6)^2 - 4', label: 'f' },
              { expr: '(2x-6)^2 - 4', label: 'g', dashed: true },
            ],
            points: [
              { x: 4, y: 0, label: '(4, 0)' },
              { x: 8, y: 0, label: '(8, 0)' },
              { x: 6, y: -4, label: '(6, -4)' },
              { x: 2, y: 0, label: '(2, 0)' },
              { x: 3, y: -4, label: '(3, -4)' },
            ],
            ariaLabel: 'f is an upward parabola with vertex (6, -4) crossing the x-axis at 4 and 8. The dashed g is narrower, with vertex (3, -4), crossing the x-axis at 2 and 4.',
          },
        },
      ],
      steps: [
        { text: 'Match the vertices.', tex: '(6, -4) \\to (3, -4)', why: 'The rule $f(kx)$ changes only $x$-coordinates. The lowest value stayed $-4$, which confirms nothing vertical happened.' },
        { text: 'Solve for $k$.', tex: 'g(3) = f(3k) \\text{ must equal } f(6) \\quad\\Longrightarrow\\quad 3k = 6 \\quad\\Longrightarrow\\quad k = 2', why: '$g$ reaches the vertex when its inside, $kx$, equals $6$, the vertex input of $f$. That is $k = $ (old $x$) $\\div$ (new $x$).' },
        { text: 'Check with the zeros.', tex: '4 \\div 2 = 2, \\qquad 8 \\div 2 = 4', why: 'Each $x$-coordinate of $f$ divided by $k = 2$ should give the matching point of $g$, and the zeros $2$ and $4$ match the graph.' },
        { text: 'Check with the formula.', tex: 'g(2) = (2 \\cdot 2 - 6)^2 - 4 = 4 - 4 = 0', why: 'Substituting confirms $(2, 0)$ is on $g(x) = (2x - 6)^2 - 4$.' },
        { text: 'Describe it.', why: '$k = 2 > 1$, so this is a horizontal compression by a factor of $\\frac{1}{2}$. It is **not** the same as $2f(x)$, which would keep the vertex at $x = 6$ and drop the minimum to $-8$.' },
      ],
      answer: '$k = 2$: a horizontal compression by a factor of $\\frac{1}{2}$ toward the $y$-axis.',
    },
  ],
  teachMeAgain: [
    {
      approach: 'visual',
      title: 'Follow the points',
      blocks: [
        { t: 'p', text: 'A transformation moves **every point** the same way. Watch three points of $f(x) = x^2$ move to $g(x) = f(x - 2) - 1 = (x - 2)^2 - 1$.' },
        {
          t: 'graph',
          caption: 'Each dashed segment joins a point of f to the matching point of g: 2 right and 1 down.',
          spec: {
            xMin: -3,
            xMax: 5,
            yMin: -2,
            yMax: 5,
            functions: [
              { expr: 'x^2', label: 'f(x) = x^2' },
              { expr: '(x-2)^2 - 1', label: 'g(x) = (x - 2)^2 - 1', dashed: true },
            ],
            points: [
              { x: -1, y: 1, label: '(-1, 1)' },
              { x: 0, y: 0, label: '(0, 0)' },
              { x: 1, y: 1, label: '(1, 1)' },
              { x: 1, y: 0, label: '(1, 0)' },
              { x: 2, y: -1, label: '(2, -1)' },
              { x: 3, y: 0, label: '(3, 0)' },
            ],
            segments: [
              { x1: -1, y1: 1, x2: 1, y2: 0, dashed: true },
              { x1: 0, y1: 0, x2: 2, y2: -1, dashed: true },
              { x1: 1, y1: 1, x2: 3, y2: 0, dashed: true },
            ],
            ariaLabel: 'f(x) = x squared through (-1, 1), (0, 0) and (1, 1). Dashed segments join each to a point of g(x) = (x minus 2) squared minus 1: (1, 0), (2, -1) and (3, 0).',
          },
        },
        { t: 'p', text: '$(-1, 1) \\to (1, 0)$, $(0, 0) \\to (2, -1)$, $(1, 1) \\to (3, 0)$. The inside $-2$ moved every point **right** 2 (opposite its sign) and the outside $-1$ moved every point **down** 1 (the way it looks).' },
      ],
    },
    {
      approach: 'simpler-example',
      title: 'Just plug in numbers',
      blocks: [
        { t: 'p', text: 'Let $f(x) = x^2$. Compare $f(x) + 3$ with $f(x + 3)$ by computing:' },
        {
          t: 'table',
          caption: 'Outside 3 versus inside 3.',
          headers: ['$x$', '$f(x) + 3 = x^2 + 3$', '$f(x + 3) = (x + 3)^2$'],
          rows: [
            ['$-3$', '$12$', '$0$'],
            ['$0$', '$3$', '$9$'],
            ['$1$', '$4$', '$16$'],
          ],
        },
        { t: 'p', text: 'The smallest output of $x^2 + 3$ is $3$, at $x = 0$: the vertex went **up** to $(0, 3)$. The smallest output of $(x + 3)^2$ is $0$, at $x = -3$: the vertex went **left** to $(-3, 0)$. Same number, different place, different move.' },
      ],
    },
    {
      approach: 'analogy',
      title: 'Getting there early',
      blocks: [
        { t: 'p', text: 'Think of $x$ as time and $f$ as a schedule: $f(0)$ is where you are at time $0$. Now $g(x) = f(x + 3)$ means "at time $x$, $g$ is where $f$ will be at time $x + 3$." So $g$ is always **3 ahead**: it gets to every spot 3 time units **earlier**.' },
        { t: 'p', text: 'Earlier means to the **left** on a number line. That is why $+3$ inside moves the graph left. A change inside is a change to the clock, not to the place.' },
        { t: 'p', text: 'Changes outside, like $f(x) + 3$, are changes to the place itself (the height), so they go the way they look: $+3$ means up 3.' },
      ],
    },
    {
      approach: 'prerequisite',
      title: 'Refresher: substituting into f',
      blocks: [
        { t: 'p', text: 'Every transformation is just substitution. Let $f(x) = x^2 - 1$:' },
        { t: 'list', items: [
          '$f(x) + 2$: add after. $x^2 - 1 + 2 = x^2 + 1$.',
          '$f(x + 2)$: replace **every** $x$ with $(x + 2)$. $(x + 2)^2 - 1$.',
          '$3f(x)$: multiply the **whole** output. $3(x^2 - 1) = 3x^2 - 3$.',
          '$f(2x)$: replace $x$ with $(2x)$. $(2x)^2 - 1 = 4x^2 - 1$.',
          'Check one: $f(x + 2)$ at $x = 1$ is $f(3) = 9 - 1 = 8$, and $(1 + 2)^2 - 1 = 8$.',
        ] },
      ],
    },
    {
      approach: 'step-by-step',
      title: 'A checklist for finding k',
      blocks: [
        { t: 'p', text: '$f(x) = x^2 + 1$ and $g(x) = f(x) + k$ has vertex $(0, -3)$. Find $k$.' },
        { t: 'list', ordered: true, items: [
          '**Name the rule:** $f(x) + k$ is outside, so it moves the graph up or down.',
          '**Pick a matching point:** the vertex of $f$ is $(0, 1)$; the vertex of $g$ is $(0, -3)$.',
          '**Compare the right coordinate:** for up and down, compare $y$: $-3 - 1 = -4$.',
          '**Write $k$:** $k = -4$, a shift down 4.',
          '**Check:** $g(0) = f(0) - 4 = 1 - 4 = -3$. It matches.',
        ] },
        { t: 'p', text: 'For an inside rule, compare $x$-coordinates in step 3 instead, and remember that inside moves opposite.' },
      ],
    },
    {
      approach: 'alternate-strategy',
      title: 'Read the vertex from the formula',
      blocks: [
        { t: 'p', text: 'Instead of thinking about moves, write $g$ out and read its vertex from vertex form. Let $f(x) = (x - 1)^2 + 2$ and $g(x) = f(x + 4) - 3$.' },
        { t: 'math', tex: 'g(x) = \\big((x + 4) - 1\\big)^2 + 2 - 3 = (x + 3)^2 - 1 = \\big(x - (-3)\\big)^2 + (-1)' },
        { t: 'p', text: 'The vertex of $g$ is $(-3, -1)$, and the vertex of $f$ is $(1, 2)$. From $x = 1$ to $x = -3$ is **4 left**; from $y = 2$ to $y = -1$ is **3 down**. That agrees with the rules: $+4$ inside is left 4, and $-3$ outside is down 3.' },
      ],
    },
  ],
  guided: [
    { generator: 'u4.transform-describe', difficulty: 1 },
    { generator: 'u4.transform-find-k', difficulty: 1 },
    { generator: 'u4.transform-describe', difficulty: 1 },
    { generator: 'u4.transform-find-k', difficulty: 1 },
  ],
  independent: {
    count: 8,
    reviewCount: 2,
    mix: [
      { generator: 'u4.transform-describe', difficulty: 1, weight: 1 },
      { generator: 'u4.transform-describe', difficulty: 2, weight: 2 },
      { generator: 'u4.transform-describe', difficulty: 3, weight: 1 },
      { generator: 'u4.transform-find-k', difficulty: 1, weight: 1 },
      { generator: 'u4.transform-find-k', difficulty: 2, weight: 2 },
      { generator: 'u4.transform-find-k', difficulty: 3, weight: 1 },
    ],
  },
  quiz: {
    items: [
      { generator: 'u4.transform-describe', difficulty: 2 },
      { generator: 'u4.transform-describe', difficulty: 2 },
      { generator: 'u4.transform-describe', difficulty: 3 },
      { generator: 'u4.transform-find-k', difficulty: 2 },
      { generator: 'u4.transform-find-k', difficulty: 2 },
      { generator: 'u4.transform-find-k', difficulty: 3 },
    ],
  },
  summary: [
    'Outside changes act on outputs and go the way they look: $f(x) + k$ shifts up $k$ (down if $k < 0$).',
    'Inside changes act on inputs and move opposite: $f(x + k)$ shifts **left** $k$ when $k > 0$, so $f(x + 3)$ moves left 3 and $f(x - 3)$ moves right 3.',
    '$k \\cdot f(x)$ is a vertical stretch when $|k| > 1$, a vertical compression when $0 < |k| < 1$, and a reflection across the $x$-axis when $k < 0$. $f(kx)$ is a horizontal compression by a factor of $\\frac{1}{k}$ when $k > 1$ and a horizontal stretch when $0 < k < 1$.',
    'To find $k$, match a point of $f$ (the vertex is easiest) with the point of $g$ it moved to, or substitute a known point of $g$, then check.',
  ],
  mastery: { quizPassScore: 0.8, practiceMinCorrect: 5 },
};
