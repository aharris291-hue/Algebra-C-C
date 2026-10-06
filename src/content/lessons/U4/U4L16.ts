import type { LessonContent } from '../../../core/curriculum/types';

/**
 * U4L16 Forms of Quadratic Functions and Max/Min (A.FGR.7.5, A.FGR.7.8)
 * Standard, vertex and factored form and what each one shows (y-intercept, vertex, zeros); rewriting
 * vertex -> standard and factored -> standard by expanding, standard -> factored by factoring,
 * factored -> vertex with the midpoint of the zeros, and standard -> vertex by completing the square;
 * maximum and minimum values and where they happen, including a launched ball, a fenced area and revenue (S4.18).
 *
 * Math verified by hand (2026-10-06): every rewritten form below was expanded back to standard form, every vertex was recomputed with x = -b/(2a) and substitution, every zero was substituted back, and every graph's function string, window and labeled points were checked to agree with the text.
 */
export const U4L16: LessonContent = {
  lessonId: 'U4L16',
  goal: 'Rewrite a quadratic among standard, vertex and factored form, such as $x^2 - 2x - 8 = (x - 4)(x + 2) = (x - 1)^2 - 9$, and use the right form to find the $y$-intercept, the zeros, and the maximum or minimum value and where it happens, including in real situations.',
  needToKnow: [
    { t: 'p', text: 'This lesson builds on three things you already know:' },
    {
      t: 'list',
      items: [
        '**Expanding.** $(x - 3)^2 = x^2 - 6x + 9$ and $(x + 2)(x - 4) = x^2 - 2x - 8$.',
        '**Factoring.** $x^2 + x - 12 = (x + 4)(x - 3)$, because $4 \\cdot (-3) = -12$ and $4 + (-3) = 1$.',
        '**Completing the square.** $x^2 + 6x + 5 = (x^2 + 6x + 9) - 9 + 5 = (x + 3)^2 - 4$.',
      ],
    },
    { t: 'callout', variant: 'tip', title: 'Quick check', text: 'Expand $(x + 5)(x - 1)$. (You should get $x^2 + 4x - 5$.) If that felt shaky, open **Teach Me Again** and choose the refresher.' },
  ],
  vocabulary: [
    { term: 'standard form', meaning: '$f(x) = ax^2 + bx + c$. The $y$-intercept is $c$.' },
    { term: 'vertex form', meaning: '$f(x) = a(x - h)^2 + k$. The vertex is $(h, k)$.' },
    { term: 'factored form', meaning: '$f(x) = a(x - r)(x - s)$. The zeros ($x$-intercepts) are $r$ and $s$.' },
    { term: 'maximum value', meaning: 'The greatest output of a function. A parabola that opens down ($a < 0$) has a maximum value, the $y$-coordinate of its vertex.' },
    { term: 'minimum value', meaning: 'The least output of a function. A parabola that opens up ($a > 0$) has a minimum value, the $y$-coordinate of its vertex.' },
  ],
  instruction: [
    { t: 'p', text: '### One parabola, three forms' },
    { t: 'p', text: 'These three formulas are the **same function**. Expand any of them and you get $x^2 - 2x - 8$:' },
    { t: 'math', tex: 'f(x) = x^2 - 2x - 8 = (x - 4)(x + 2) = (x - 1)^2 - 9' },
    { t: 'p', text: 'Each form puts a different feature of the graph in plain sight:' },
    {
      t: 'table',
      caption: 'What each form shows, using f(x) = x squared minus 2x minus 8.',
      headers: ['Form', 'General', 'Shows you', 'For this f'],
      rows: [
        ['standard', '$ax^2 + bx + c$', '$y$-intercept $(0, c)$', '$(0, -8)$'],
        ['vertex', '$a(x - h)^2 + k$', 'vertex $(h, k)$, so the max or min', '$(1, -9)$, minimum $-9$'],
        ['factored', '$a(x - r)(x - s)$', 'zeros $r$ and $s$', '$x = 4$ and $x = -2$'],
      ],
    },
    {
      t: 'graph',
      caption: 'The graph of f with the y-intercept, the vertex and the two zeros labeled.',
      spec: {
        xMin: -4,
        xMax: 6,
        yMin: -10,
        yMax: 6,
        yStep: 2,
        functions: [{ expr: 'x^2 - 2x - 8', label: 'f(x) = x^2 - 2x - 8' }],
        points: [
          { x: 0, y: -8, label: 'y-intercept (0, -8)' },
          { x: 1, y: -9, label: 'vertex (1, -9)' },
          { x: -2, y: 0, label: '(-2, 0)' },
          { x: 4, y: 0, label: '(4, 0)' },
        ],
        ariaLabel: 'An upward parabola crossing the y-axis at (0, -8), with its lowest point at (1, -9), crossing the x-axis at (-2, 0) and (4, 0).',
      },
    },
    { t: 'callout', variant: 'why', title: 'Why each form shows its feature', text: '**Standard:** at $x = 0$ the terms $ax^2$ and $bx$ are $0$, so $f(0) = c$. **Factored:** a product is $0$ only when a factor is $0$, so $f(x) = 0$ exactly when $x = r$ or $x = s$. **Vertex:** $(x - h)^2$ is never negative and equals $0$ only at $x = h$, so $f(h) = k$ is the lowest output when $a > 0$ and the highest when $a < 0$. The number $a$ is the **same** in all three forms.' },
    { t: 'p', text: '### Vertex or factored form to standard form: expand' },
    { t: 'p', text: 'Square or multiply out the binomials first, then distribute $a$, then combine like terms:' },
    { t: 'math', tex: '\\begin{aligned} 2(x - 3)^2 - 5 &= 2(x^2 - 6x + 9) - 5 = 2x^2 - 12x + 13 \\\\ 2(x - 1)(x + 4) &= 2(x^2 + 3x - 4) = 2x^2 + 6x - 8 \\end{aligned}' },
    { t: 'p', text: '### Standard form to factored form: factor' },
    { t: 'p', text: 'For $x^2 + x - 12$, look for two numbers that multiply to $-12$ and add to $1$: they are $4$ and $-3$. So $x^2 + x - 12 = (x + 4)(x - 3)$, with zeros $x = -4$ and $x = 3$. (Not every quadratic factors over the integers; if none do, use another form.)' },
    { t: 'p', text: '### Factored form to vertex form: use the midpoint' },
    { t: 'p', text: 'A parabola is symmetric, so its vertex sits **halfway between the zeros**. For $f(x) = (x + 1)(x - 5)$, the zeros are $-1$ and $5$:' },
    { t: 'math', tex: 'h = \\frac{-1 + 5}{2} = 2, \\qquad k = f(2) = (2 + 1)(2 - 5) = 3(-3) = -9, \\qquad f(x) = (x - 2)^2 - 9' },
    { t: 'p', text: 'Keep the same $a$ (here $a = 1$). Check by expanding both: $(x + 1)(x - 5) = x^2 - 4x - 5$ and $(x - 2)^2 - 9 = x^2 - 4x + 4 - 9 = x^2 - 4x - 5$.' },
    { t: 'p', text: '### Standard form to vertex form: complete the square' },
    { t: 'p', text: 'Add and subtract $\\left(\\frac{b}{2}\\right)^2$. If $a \\ne 1$, factor $a$ out of the $x$-terms first, and remember the number you subtract gets multiplied by $a$:' },
    { t: 'math', tex: '\\begin{aligned} x^2 + 6x + 5 &= (x^2 + 6x + 9) - 9 + 5 = (x + 3)^2 - 4 \\\\ 2x^2 - 8x + 3 &= 2(x^2 - 4x) + 3 = 2(x^2 - 4x + 4) - 8 + 3 = 2(x - 2)^2 - 5 \\end{aligned}' },
    { t: 'p', text: 'A quick check for the vertex of $ax^2 + bx + c$: $x = -\\frac{b}{2a}$. For $2x^2 - 8x + 3$, $x = \\frac{8}{4} = 2$ and $f(2) = 8 - 16 + 3 = -5$, so the vertex is $(2, -5)$, matching $2(x - 2)^2 - 5$.' },
    { t: 'p', text: '### Maximum or minimum, and where it happens' },
    { t: 'p', text: 'If $a > 0$ the parabola opens up and the vertex is the **minimum**. If $a < 0$ it opens down and the vertex is the **maximum**. The max or min **value** is the $y$-coordinate $k$, and it happens at $x = h$.' },
    {
      t: 'table',
      caption: 'Reading the maximum or minimum from vertex form.',
      headers: ['Function', 'Vertex form', 'Opens', 'Result'],
      rows: [
        ['$x^2 - 2x - 8$', '$(x - 1)^2 - 9$', 'up ($a = 1$)', 'minimum $-9$ at $x = 1$'],
        ['$-(x - 1)(x - 7)$', '$-(x - 4)^2 + 9$', 'down ($a = -1$)', 'maximum $9$ at $x = 4$'],
        ['$2x^2 - 8x + 3$', '$2(x - 2)^2 - 5$', 'up ($a = 2$)', 'minimum $-5$ at $x = 2$'],
      ],
    },
    { t: 'callout', variant: 'warning', title: 'Value versus location', text: '"What is the maximum?" asks for the output $k$. "When or where does it happen?" asks for the input $h$. For $-(x - 4)^2 + 9$ the maximum is $9$, and it happens at $x = 4$. Also watch the sign: $(x - 4)$ means $h = +4$, and $(x + 3)$ means $h = -3$.' },
    { t: 'p', text: '### In context: the most area from a fixed fence' },
    { t: 'p', text: 'You have 40 feet of fence for a rectangular garden. If one side is $x$ feet, the two lengths and two widths add to $40$, so the other side is $20 - x$ feet and the area is $A(x) = x(20 - x)$. That is factored form with zeros $0$ and $20$, so the maximum is halfway, at $x = 10$: $A(10) = 10 \\cdot 10 = 100$ square feet.' },
    {
      t: 'table',
      caption: 'Areas of rectangles with a perimeter of 40 feet. The area is greatest for the 10-by-10 square.',
      headers: ['side $x$ (ft)', '$5$', '$8$', '$10$', '$12$', '$15$'],
      rows: [['area $A(x)$ (sq ft)', '$75$', '$96$', '$100$', '$96$', '$75$']],
    },
    {
      t: 'graph',
      caption: 'Area of a rectangle with a 40-foot perimeter. The highest point is (10, 100).',
      spec: {
        xMin: 0,
        xMax: 20,
        yMin: 0,
        yMax: 120,
        xStep: 2,
        yStep: 10,
        xLabel: 'side x (feet)',
        yLabel: 'area (square feet)',
        functions: [{ expr: 'x(20 - x)', label: 'A(x) = x(20 - x)', domain: [0, 20] }],
        points: [
          { x: 10, y: 100, label: 'maximum (10, 100)' },
          { x: 5, y: 75, label: '(5, 75)' },
          { x: 15, y: 75, label: '(15, 75)' },
        ],
        ariaLabel: 'A downward parabola from (0, 0) to (20, 0) with its highest point at (10, 100). It passes through (5, 75) and (15, 75).',
      },
    },
    { t: 'callout', variant: 'realworld', title: 'Where this shows up', text: 'The highest point a launched ball reaches, the biggest pen you can fence, and the price that brings in the most money are all vertices of parabolas. Write the model, find the vertex, and say what $h$ and $k$ mean in the situation.' },
  ],
  examples: [
    {
      title: 'Vertex form to standard form',
      kind: 'introductory',
      problem: [{ t: 'p', text: 'Write $f(x) = 2(x - 3)^2 - 5$ in standard form. Then give the vertex, the minimum value, and the $y$-intercept.' }],
      steps: [
        { text: 'Square the binomial.', tex: '(x - 3)^2 = x^2 - 6x + 9', why: '$(x - 3)^2$ means $(x - 3)(x - 3)$. The middle term is $2(-3)x = -6x$, and the last is $(-3)^2 = 9$. It is **not** $x^2 + 9$.' },
        { text: 'Distribute the $2$, then combine.', tex: '2(x^2 - 6x + 9) - 5 = 2x^2 - 12x + 18 - 5 = 2x^2 - 12x + 13', why: 'The $2$ multiplies every term in the parentheses before the $-5$ is added.' },
        { text: 'Read the vertex from vertex form.', tex: '(h, k) = (3, -5)', why: '$(x - 3)$ means $h = 3$. Since $a = 2 > 0$, the parabola opens up, so $-5$ is the minimum value, at $x = 3$.' },
        { text: 'Read the $y$-intercept from standard form.', tex: 'f(0) = 13', why: 'Check with the vertex form: $2(0 - 3)^2 - 5 = 18 - 5 = 13$. Both forms agree.' },
      ],
      answer: '$f(x) = 2x^2 - 12x + 13$. Vertex $(3, -5)$, minimum value $-5$ at $x = 3$, $y$-intercept $13$.',
    },
    {
      title: 'Standard to factored to vertex form',
      kind: 'intermediate',
      problem: [{ t: 'p', text: 'Write $f(x) = x^2 - 6x - 16$ in factored form and in vertex form. Give the zeros and the vertex.' }],
      steps: [
        { text: 'Factor.', tex: 'x^2 - 6x - 16 = (x - 8)(x + 2)', why: 'We need two numbers that multiply to $-16$ and add to $-6$: $-8$ and $2$. Check: $(-8)(2) = -16$ and $-8 + 2 = -6$.' },
        { text: 'Read the zeros.', tex: 'x = 8 \\quad\\text{or}\\quad x = -2', why: 'The factor $(x - 8)$ is $0$ when $x = 8$, and $(x + 2)$ is $0$ when $x = -2$.' },
        { text: 'Find $h$ with the midpoint.', tex: 'h = \\frac{8 + (-2)}{2} = 3', why: 'The parabola is symmetric, so the vertex is halfway between the zeros.' },
        { text: 'Find $k$ by substituting.', tex: 'k = f(3) = (3 - 8)(3 + 2) = (-5)(5) = -25', why: 'The vertex is on the graph, so its $y$-value is $f(h)$.' },
        { text: 'Write vertex form and check.', tex: '(x - 3)^2 - 25 = x^2 - 6x + 9 - 25 = x^2 - 6x - 16', why: '$a = 1$ in every form. Expanding gives back the original, so the rewrite is right.' },
      ],
      answer: 'Factored: $(x - 8)(x + 2)$, zeros $8$ and $-2$. Vertex form: $(x - 3)^2 - 25$, vertex $(3, -25)$.',
    },
    {
      title: 'Complete the square to find the minimum',
      kind: 'intermediate',
      problem: [{ t: 'p', text: 'Write $f(x) = x^2 - 8x + 10$ in vertex form. What is the minimum value, and where does it happen?' }],
      steps: [
        { text: 'Find the number that completes the square.', tex: '\\left(\\frac{-8}{2}\\right)^2 = (-4)^2 = 16', why: 'Half of $b = -8$ is $-4$, and squaring it gives $16$.' },
        { text: 'Add and subtract it.', tex: 'x^2 - 8x + 16 - 16 + 10 = (x - 4)^2 - 6', why: 'Adding $16$ and subtracting $16$ adds $0$, so the function does not change. The first three terms make a perfect square.' },
        { text: 'Read the minimum.', tex: '\\text{vertex } (4, -6)', why: '$a = 1 > 0$, so the parabola opens up and the vertex is the lowest point.' },
        { text: 'Check with $x = -\\frac{b}{2a}$.', tex: 'x = \\frac{8}{2} = 4, \\qquad f(4) = 16 - 32 + 10 = -6', why: 'A second method gives the same vertex.' },
      ],
      answer: '$f(x) = (x - 4)^2 - 6$. The minimum value is $-6$, at $x = 4$.',
    },
    {
      title: 'A common mistake with a not equal to 1',
      kind: 'common-mistake',
      problem: [{ t: 'p', text: 'A student rewrites $f(x) = 3x^2 - 12x + 7$ like this: $3(x^2 - 4x + 4) + 7 - 4 = 3(x - 2)^2 + 3$, and says the minimum is $3$. Find the mistake and fix it.' }],
      steps: [
        { text: 'Test with $x = 0$.', tex: 'f(0) = 7, \\qquad 3(0 - 2)^2 + 3 = 15', why: 'The two expressions should be equal for every $x$. They are not, so the rewrite is wrong.' },
        { text: 'Find the error.', why: 'Inside the parentheses the student added $4$. But that $4$ is multiplied by the $3$ in front, so they really added $3 \\cdot 4 = 12$. They must subtract $12$, not $4$.' },
        { text: 'Rewrite correctly.', tex: '3(x^2 - 4x) + 7 = 3(x^2 - 4x + 4) - 12 + 7 = 3(x - 2)^2 - 5', why: 'Factor $3$ out of the $x$-terms, complete the square inside, then subtract $3 \\cdot 4 = 12$ outside.' },
        { text: 'Check by expanding.', tex: '3(x^2 - 4x + 4) - 5 = 3x^2 - 12x + 12 - 5 = 3x^2 - 12x + 7', why: 'It matches the original. Also $x = -\\frac{-12}{2 \\cdot 3} = 2$ and $f(2) = 12 - 24 + 7 = -5$.' },
      ],
      answer: '$f(x) = 3(x - 2)^2 - 5$. The minimum value is $-5$ (at $x = 2$), not $3$.',
    },
    {
      title: 'Maximum height of a ball',
      kind: 'real-world',
      problem: [
        { t: 'p', text: 'A ball is launched upward from 6 feet above the ground at 48 feet per second. Its height after $t$ seconds is $h(t) = -16t^2 + 48t + 6$ feet. When does it reach its maximum height, and what is that height?' },
        {
          t: 'graph',
          caption: 'The height of the ball over time. The highest point is (1.5, 42).',
          spec: {
            xMin: 0,
            xMax: 4,
            yMin: 0,
            yMax: 50,
            xStep: 0.5,
            yStep: 5,
            xLabel: 't (seconds)',
            yLabel: 'height (feet)',
            functions: [{ expr: '-16x^2 + 48x + 6', label: 'h(t)', domain: [0, 3.12] }],
            points: [
              { x: 1.5, y: 42, label: 'maximum (1.5, 42)' },
              { x: 0, y: 6, label: '(0, 6)' },
            ],
            ariaLabel: 'A downward arc starting at (0, 6), rising to its highest point (1.5, 42), and landing a little after t = 3.1 seconds.',
          },
        },
      ],
      steps: [
        { text: 'Decide max or min.', why: '$a = -16 < 0$, so the parabola opens down and the vertex is the highest point. That fits a ball that goes up and comes down.' },
        { text: 'Find when: $t = -\\frac{b}{2a}$.', tex: 't = -\\frac{48}{2(-16)} = \\frac{48}{32} = 1.5', why: 'The vertex input of $at^2 + bt + c$ is $-\\frac{b}{2a}$, with $a = -16$ and $b = 48$.' },
        { text: 'Find the height: substitute.', tex: 'h(1.5) = -16(2.25) + 48(1.5) + 6 = -36 + 72 + 6 = 42', why: 'The maximum value is the output at the vertex. $1.5^2 = 2.25$.' },
        { text: 'Check with vertex form.', tex: '-16(t^2 - 3t) + 6 = -16(t - 1.5)^2 + 36 + 6 = -16(t - 1.5)^2 + 42', why: 'Completing the square: half of $-3$ is $-1.5$, and $(-1.5)^2 = 2.25$. Adding $2.25$ inside really adds $-16(2.25) = -36$, so add $36$ outside.' },
      ],
      answer: 'The ball reaches its maximum height of 42 feet at $t = 1.5$ seconds.',
    },
    {
      title: 'The price that brings in the most money',
      kind: 'challenging',
      problem: [{ t: 'p', text: 'A club sells 120 T-shirts a week at \\$10 each. For each \\$1 the price goes up, it sells 5 fewer shirts. With $x$ price increases of \\$1, the weekly revenue is $R(x) = (10 + x)(120 - 5x)$ dollars. What price gives the maximum revenue, and what is that revenue?' }],
      steps: [
        { text: 'See the factored form.', tex: 'R(x) = (10 + x)(120 - 5x)', why: 'Revenue is price times number sold. This is already a product of two linear factors, so its zeros are easy to find.' },
        { text: 'Find the zeros.', tex: '10 + x = 0 \\Rightarrow x = -10, \\qquad 120 - 5x = 0 \\Rightarrow x = 24', why: 'At $x = -10$ the price is \\$0, and at $x = 24$ the club sells no shirts. Either way the revenue is \\$0.' },
        { text: 'Use the midpoint.', tex: 'x = \\frac{-10 + 24}{2} = 7', why: 'The maximum happens halfway between the zeros. It is a maximum because the $x^2$-coefficient is $1 \\cdot (-5) = -5 < 0$.' },
        { text: 'Find the maximum revenue.', tex: 'R(7) = (10 + 7)(120 - 35) = 17 \\cdot 85 = 1445', why: 'The price is $10 + 7 = 17$ dollars and $120 - 5(7) = 85$ shirts sell.' },
        { text: 'Check in standard form.', tex: 'R(x) = -5x^2 + 70x + 1200, \\qquad x = -\\frac{70}{2(-5)} = 7', why: 'Expanding: $1200 - 50x + 120x - 5x^2$. And $R(7) = -245 + 490 + 1200 = 1445$, the same.' },
      ],
      answer: 'A price of \\$17 (7 increases) gives the maximum weekly revenue of \\$1445.',
    },
  ],
  teachMeAgain: [
    {
      approach: 'visual',
      title: 'Point each form at the graph',
      blocks: [
        { t: 'p', text: 'Here is $f(x) = (x - 2)(x - 6)$ with each feature labeled by the form that shows it.' },
        {
          t: 'graph',
          caption: 'Zeros 2 and 6 from factored form, vertex (4, -4) halfway between them, and y-intercept (0, 12) from standard form.',
          spec: {
            xMin: -1,
            xMax: 8,
            yMin: -6,
            yMax: 14,
            yStep: 2,
            functions: [{ expr: '(x-2)(x-6)', label: 'f(x) = (x - 2)(x - 6)' }],
            points: [
              { x: 2, y: 0, label: '(2, 0)' },
              { x: 6, y: 0, label: '(6, 0)' },
              { x: 4, y: -4, label: 'vertex (4, -4)' },
              { x: 0, y: 12, label: '(0, 12)' },
            ],
            segments: [{ x1: 4, y1: -6, x2: 4, y2: 14, dashed: true, label: 'x = 4' }],
            ariaLabel: 'An upward parabola crossing the x-axis at (2, 0) and (6, 0), with vertex (4, -4) on the dashed line x = 4, and crossing the y-axis at (0, 12).',
          },
        },
        { t: 'list', items: [
          '**Factored** $(x - 2)(x - 6)$: zeros $2$ and $6$.',
          '**Vertex** $(x - 4)^2 - 4$: halfway between $2$ and $6$ is $4$, and $f(4) = (2)(-2) = -4$.',
          '**Standard** $x^2 - 8x + 12$: the $y$-intercept is $12$.',
        ] },
      ],
    },
    {
      approach: 'simpler-example',
      title: 'Start with easy zeros',
      blocks: [
        { t: 'p', text: 'Take $f(x) = (x - 2)(x - 6)$. The zeros are $2$ and $6$. The middle is $4$. Then $f(4) = (4 - 2)(4 - 6) = 2(-2) = -4$. So $f(x) = (x - 4)^2 - 4$.' },
        { t: 'p', text: 'Check both ways by expanding: $(x - 2)(x - 6) = x^2 - 8x + 12$, and $(x - 4)^2 - 4 = x^2 - 8x + 16 - 4 = x^2 - 8x + 12$. Same function, so the minimum value is $-4$, at $x = 4$.' },
      ],
    },
    {
      approach: 'analogy',
      title: 'Three ways to describe one place',
      blocks: [
        { t: 'p', text: 'You can describe your school by its street address, by its map coordinates, or by directions from your house. All three describe the **same place**, but each one answers a different question fastest.' },
        { t: 'p', text: 'The three forms work the same way. Want the starting value ($y$-intercept)? Use **standard form**. Want where it hits zero? Use **factored form**. Want the highest or lowest point? Use **vertex form**. Rewriting does not change the parabola; it just changes which question is easy.' },
      ],
    },
    {
      approach: 'prerequisite',
      title: 'Refresher: the moves you need',
      blocks: [
        { t: 'list', items: [
          'Squaring a binomial: $(x - 5)^2 = x^2 - 10x + 25$. The middle term is twice the number.',
          'Multiplying binomials: $(x + 3)(x - 7) = x^2 - 7x + 3x - 21 = x^2 - 4x - 21$.',
          'Factoring: $x^2 - 4x - 21$ needs two numbers with product $-21$ and sum $-4$: $-7$ and $3$.',
          'Completing the square: for $x^2 + 10x$, add $\\left(\\frac{10}{2}\\right)^2 = 25$, so $x^2 + 10x + 25 = (x + 5)^2$.',
          'Midpoint of two numbers: add and divide by $2$. The midpoint of $-3$ and $7$ is $\\frac{-3 + 7}{2} = 2$.',
        ] },
      ],
    },
    {
      approach: 'step-by-step',
      title: 'Completing the square when a is not 1',
      blocks: [
        { t: 'p', text: 'Write $f(x) = -2x^2 + 12x - 7$ in vertex form and find its maximum.' },
        { t: 'list', ordered: true, items: [
          '**Factor $a$ out of the $x$-terms:** $-2(x^2 - 6x) - 7$. Check: $-2 \\cdot (-6x) = 12x$.',
          '**Complete the square inside:** half of $-6$ is $-3$, and $(-3)^2 = 9$, so add $9$ inside the parentheses: $-2(x^2 - 6x + 9) - 7$, for now.',
          '**Balance it:** adding $9$ inside really added $-2 \\cdot 9 = -18$, so add $18$ outside: $-2(x^2 - 6x + 9) - 7 + 18$.',
          '**Write vertex form:** $-2(x - 3)^2 + 11$.',
          '**Read the result:** $a = -2 < 0$, so the maximum value is $11$, at $x = 3$.',
          '**Check:** $-2(x^2 - 6x + 9) + 11 = -2x^2 + 12x - 18 + 11 = -2x^2 + 12x - 7$.',
        ] },
      ],
    },
    {
      approach: 'alternate-strategy',
      title: 'Skip the square: use x = -b/(2a)',
      blocks: [
        { t: 'p', text: 'If you only need the maximum or minimum, you do not have to rewrite at all. For $f(x) = -2x^2 + 12x - 7$:' },
        { t: 'math', tex: 'x = -\\frac{b}{2a} = -\\frac{12}{2(-2)} = 3, \\qquad f(3) = -2(9) + 12(3) - 7 = -18 + 36 - 7 = 11' },
        { t: 'p', text: 'The maximum value is $11$, at $x = 3$, the same as completing the square gave. And now you can write vertex form directly: $a$ stays $-2$, so $f(x) = -2(x - 3)^2 + 11$.' },
      ],
    },
  ],
  guided: [
    { generator: 'u4.rewrite-forms', difficulty: 1 },
    { generator: 'u4.max-min', difficulty: 1 },
    { generator: 'u4.rewrite-forms', difficulty: 1 },
    { generator: 'u4.max-min', difficulty: 1 },
  ],
  independent: {
    count: 8,
    reviewCount: 2,
    mix: [
      { generator: 'u4.rewrite-forms', difficulty: 1, weight: 1 },
      { generator: 'u4.rewrite-forms', difficulty: 2, weight: 2 },
      { generator: 'u4.rewrite-forms', difficulty: 3, weight: 1 },
      { generator: 'u4.max-min', difficulty: 1, weight: 1 },
      { generator: 'u4.max-min', difficulty: 2, weight: 2 },
      { generator: 'u4.max-min', difficulty: 3, weight: 2 },
    ],
  },
  quiz: {
    items: [
      { generator: 'u4.rewrite-forms', difficulty: 2 },
      { generator: 'u4.rewrite-forms', difficulty: 2 },
      { generator: 'u4.rewrite-forms', difficulty: 3 },
      { generator: 'u4.max-min', difficulty: 2 },
      { generator: 'u4.max-min', difficulty: 3 },
      { generator: 'u4.max-min', difficulty: 3 },
    ],
  },
  summary: [
    'Standard form $ax^2 + bx + c$ shows the $y$-intercept $c$; vertex form $a(x - h)^2 + k$ shows the vertex $(h, k)$; factored form $a(x - r)(x - s)$ shows the zeros $r$ and $s$. The number $a$ is the same in all three.',
    'Expand to get standard form. Factor to get factored form. Complete the square, or use the midpoint of the zeros and substitute, to get vertex form. Expand your answer to check it.',
    'If $a > 0$ the vertex is a minimum; if $a < 0$ it is a maximum. The max or min value is $k$, and it happens at $x = h$ (also $x = -\\frac{b}{2a}$).',
    'In context, say what the vertex means: for a ball with $h(t) = -16t^2 + v_0 t + h_0$, the vertex $t$-value is when it is highest and the vertex height is how high it gets.',
  ],
  mastery: { quizPassScore: 0.8, practiceMinCorrect: 5 },
};
