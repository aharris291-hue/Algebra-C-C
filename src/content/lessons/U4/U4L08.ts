import type { LessonContent } from '../../../core/curriculum/types';

/**
 * U4L08 Completing the Square (A.PAR.6.3, A.FGR.7.8)
 * The (b/2)^2 rule and its algebra-tile picture, completing the square to solve (whole-number and
 * radical answers), and rewriting in vertex form, including a != 1 by factoring a out of the x-terms (S4.11).
 *
 * Math verified by hand (2026-10-06): every solution below was substituted back into its equation, every vertex form was expanded back to standard form, and every rounded decimal was recomputed independently.
 */
export const U4L08: LessonContent = {
  lessonId: 'U4L08',
  goal: 'Complete the square to solve equations like $x^2 + 6x - 7 = 0$ and $x^2 - 4x - 3 = 0$, and to rewrite quadratics in vertex form, like $x^2 - 8x + 3 = (x - 4)^2 - 13$ and $2x^2 + 12x + 5 = 2(x + 3)^2 - 13$.',
  needToKnow: [
    { t: 'p', text: 'This lesson builds on two things you already know:' },
    {
      t: 'list',
      items: [
        '**Squaring a binomial.** $(x + 3)^2 = x^2 + 6x + 9$ and $(x - 4)^2 = x^2 - 8x + 16$. The middle term is twice the number, and the last term is the number squared.',
        '**Solving by square roots.** $(x + 3)^2 = 16$ gives $x + 3 = \\pm 4$, so $x = 1$ or $x = -7$.',
      ],
    },
    { t: 'callout', variant: 'tip', title: 'Quick check', text: 'Expand $(x + 5)^2$. (You should get $x^2 + 10x + 25$.) If that felt shaky, open **Teach Me Again** and choose the refresher.' },
  ],
  vocabulary: [
    { term: 'perfect square trinomial', meaning: 'A trinomial that equals a binomial squared, like $x^2 + 6x + 9 = (x + 3)^2$.' },
    { term: 'completing the square', meaning: 'Adding the right constant to $x^2 + bx$ to make a perfect square trinomial. The constant is $\\left(\\frac{b}{2}\\right)^2$.' },
    { term: 'vertex form', meaning: 'A quadratic written as $y = a(x - h)^2 + k$. Its vertex (turning point) is $(h, k)$.' },
    { term: 'vertex', meaning: 'The lowest or highest point of a parabola.' },
  ],
  instruction: [
    { t: 'p', text: '### The pattern behind a perfect square' },
    { t: 'p', text: 'Look at how a squared binomial expands:' },
    { t: 'math', tex: '(x + p)^2 = x^2 + 2px + p^2' },
    { t: 'p', text: 'The $x$-coefficient is $2p$, so the number $p$ is **half** of the $x$-coefficient, and the constant is that half, **squared**. So if you have $x^2 + bx$, the number that completes the square is' },
    { t: 'math', tex: '\\left(\\frac{b}{2}\\right)^2, \\qquad\\text{and then}\\qquad x^2 + bx + \\left(\\frac{b}{2}\\right)^2 = \\left(x + \\frac{b}{2}\\right)^2' },
    { t: 'p', text: 'For $x^2 + 6x$: half of $6$ is $3$, and $3^2 = 9$. So $x^2 + 6x + 9 = (x + 3)^2$. For $x^2 - 8x$: half of $-8$ is $-4$, and $(-4)^2 = 16$. So $x^2 - 8x + 16 = (x - 4)^2$.' },
    { t: 'p', text: '### The algebra-tile picture' },
    { t: 'p', text: 'Build $x^2 + 6x$ with tiles: one big $x$-by-$x$ square and six $x$-by-$1$ strips. Split the strips, $3$ along the top and $3$ down the side. The shape is **almost** a square. The missing corner is $3$ by $3$, which takes $9$ unit tiles. That is why the square is "completed" by adding $9$.' },
    {
      t: 'table',
      caption: 'Algebra tiles for x squared plus 6x plus 9, arranged as a square with side x plus 3. The nine unit tiles fill the missing corner.',
      headers: ['times', 'x', '1', '1', '1'],
      rows: [
        ['x', 'x² tile', 'x tile', 'x tile', 'x tile'],
        ['1', 'x tile', '1 (added)', '1 (added)', '1 (added)'],
        ['1', 'x tile', '1 (added)', '1 (added)', '1 (added)'],
        ['1', 'x tile', '1 (added)', '1 (added)', '1 (added)'],
      ],
    },
    { t: 'p', text: 'Count the tiles: one $x^2$, six $x$, and nine $1$s. Each side of the finished square is $x + 3$, so $x^2 + 6x + 9 = (x + 3)^2$.' },
    { t: 'p', text: '### Completing the square to solve' },
    { t: 'p', text: 'Solve $x^2 + 6x - 7 = 0$. Move the constant out of the way, add $\\left(\\frac{b}{2}\\right)^2$ to **both** sides, then solve by square roots:' },
    { t: 'math', tex: '\\begin{aligned} x^2 + 6x &= 7 \\\\ x^2 + 6x + 9 &= 7 + 9 \\\\ (x + 3)^2 &= 16 \\\\ x + 3 &= \\pm 4 \\\\ x = 1 \\quad&\\text{or}\\quad x = -7 \\end{aligned}' },
    { t: 'callout', variant: 'why', title: 'Why add to both sides?', text: 'An equation is a balance. Adding $9$ to only the left side would change the equation into a different one with different solutions. Adding $9$ to both sides keeps the two sides equal, so the solutions stay the same.' },
    { t: 'p', text: 'The answers do not have to be whole numbers. For $x^2 - 4x - 3 = 0$: $x^2 - 4x = 3$, add $4$, so $(x - 2)^2 = 7$ and $x = 2 \\pm \\sqrt{7}$ (about $4.65$ and $-0.65$).' },
    { t: 'p', text: '### Completing the square to write vertex form' },
    { t: 'p', text: 'For a function there is no "other side" to add to. Instead, **add and subtract** the same number, which is the same as adding $0$:' },
    { t: 'math', tex: '\\begin{aligned} y &= x^2 - 8x + 3 \\\\ &= (x^2 - 8x + 16) - 16 + 3 \\\\ &= (x - 4)^2 - 13 \\end{aligned}' },
    { t: 'p', text: 'In vertex form $y = a(x - h)^2 + k$ the vertex is $(h, k)$. Here $h = 4$ and $k = -13$, so the vertex is $(4, -13)$. The square $(x - 4)^2$ is never negative, so the smallest $y$ can be is $-13$, when $x = 4$.' },
    {
      t: 'graph',
      caption: 'The parabola y equals x squared minus 8x plus 3 has its vertex at (4, negative 13) and crosses the y-axis at 3.',
      spec: {
        xMin: -2,
        xMax: 10,
        yMin: -16,
        yMax: 8,
        yStep: 2,
        functions: [{ expr: 'x^2 - 8x + 3', label: 'y = x^2 - 8x + 3' }],
        points: [
          { x: 4, y: -13, label: 'vertex (4, -13)' },
          { x: 0, y: 3, label: '(0, 3)' },
        ],
        ariaLabel: 'An upward-opening parabola with its lowest point at (4, -13), crossing the y-axis at (0, 3).',
      },
    },
    { t: 'p', text: '### When the leading coefficient is not 1' },
    { t: 'p', text: 'The pattern needs $x^2$ with coefficient $1$. So for $y = 2x^2 + 12x + 5$, **factor the $2$ out of the $x$-terms** first, and complete the square inside the parentheses:' },
    { t: 'math', tex: '\\begin{aligned} y &= 2(x^2 + 6x) + 5 \\\\ &= 2(x^2 + 6x + 9 - 9) + 5 \\\\ &= 2(x + 3)^2 - 18 + 5 \\\\ &= 2(x + 3)^2 - 13 \\end{aligned}' },
    { t: 'callout', variant: 'warning', title: 'The number you subtract gets multiplied too', text: 'Inside the parentheses you added and subtracted $9$. When the $-9$ comes out, it is multiplied by the $2$ in front: $2(-9) = -18$. A common mistake is to subtract only $9$. Check with $x = 0$: the original gives $5$, and $2(0 + 3)^2 - 13 = 18 - 13 = 5$.' },
    { t: 'callout', variant: 'realworld', title: 'Why vertex form is useful', text: 'Vertex form shows the highest or lowest value right away. For a thrown ball, $h = -16(t - 2)^2 + 68$ tells you the ball reaches its maximum height of $68$ feet at $t = 2$ seconds, without graphing.' },
  ],
  examples: [
    {
      title: 'Solve by completing the square',
      kind: 'introductory',
      problem: [{ t: 'p', text: 'Solve $x^2 + 6x - 7 = 0$ by completing the square.' }],
      steps: [
        { text: 'Move the constant to the right side.', tex: 'x^2 + 6x = 7', why: 'This leaves room on the left to build a perfect square.' },
        { text: 'Find $\\left(\\frac{b}{2}\\right)^2$.', tex: '\\left(\\frac{6}{2}\\right)^2 = 3^2 = 9', why: 'Half the $x$-coefficient, squared, is the missing corner of the square.' },
        { text: 'Add $9$ to both sides and factor the left side.', tex: 'x^2 + 6x + 9 = 16 \\;\\Longrightarrow\\; (x + 3)^2 = 16', why: 'Adding the same number to both sides keeps the equation balanced. The left side is now a perfect square.' },
        { text: 'Take the square root with $\\pm$ and solve.', tex: 'x + 3 = \\pm 4 \\;\\Longrightarrow\\; x = 1 \\text{ or } x = -7', why: '$x + 3 = 4$ gives $1$; $x + 3 = -4$ gives $-7$.' },
        { text: 'Check both.', tex: '1 + 6 - 7 = 0, \\quad 49 - 42 - 7 = 0', why: 'Substitute into the original equation: $1^2 + 6(1) - 7$ and $(-7)^2 + 6(-7) - 7$.' },
      ],
      answer: '$x = 1$ or $x = -7$',
    },
    {
      title: 'Solutions with a radical',
      kind: 'intermediate',
      problem: [{ t: 'p', text: 'Solve $x^2 - 4x - 3 = 0$ by completing the square. Give exact answers and answers rounded to the nearest hundredth.' }],
      steps: [
        { text: 'Move the constant.', tex: 'x^2 - 4x = 3', why: 'Add $3$ to both sides.' },
        { text: 'Find $\\left(\\frac{b}{2}\\right)^2$.', tex: '\\left(\\frac{-4}{2}\\right)^2 = (-2)^2 = 4', why: 'Keep the sign when you halve: half of $-4$ is $-2$. Squaring makes it positive.' },
        { text: 'Add $4$ to both sides and factor.', tex: '(x - 2)^2 = 7', why: '$x^2 - 4x + 4 = (x - 2)^2$, and $3 + 4 = 7$.' },
        { text: 'Take the square root with $\\pm$ and solve.', tex: 'x - 2 = \\pm\\sqrt{7} \\;\\Longrightarrow\\; x = 2 \\pm \\sqrt{7}', why: '$7$ is not a perfect square, so the exact answer keeps the radical.' },
        { text: 'Round.', tex: '2 + 2.6458 \\approx 4.65, \\quad 2 - 2.6458 \\approx -0.65', why: '$\\sqrt{7} \\approx 2.6458$.' },
        { text: 'Check exactly.', tex: '(2 + \\sqrt{7})^2 - 4(2 + \\sqrt{7}) - 3 = (11 + 4\\sqrt{7}) - 8 - 4\\sqrt{7} - 3 = 0', why: '$(2 + \\sqrt{7})^2 = 4 + 4\\sqrt{7} + 7$. The radical terms cancel.' },
      ],
      answer: '$x = 2 \\pm \\sqrt{7}$, about $x \\approx 4.65$ or $x \\approx -0.65$',
    },
    {
      title: 'Rewrite in vertex form',
      kind: 'intermediate',
      problem: [{ t: 'p', text: 'Write $y = x^2 - 8x + 3$ in vertex form and name the vertex.' }],
      steps: [
        { text: 'Find $\\left(\\frac{b}{2}\\right)^2$ for $x^2 - 8x$.', tex: '\\left(\\frac{-8}{2}\\right)^2 = (-4)^2 = 16', why: 'This is the constant that makes $x^2 - 8x$ a perfect square.' },
        { text: 'Add and subtract $16$.', tex: 'y = (x^2 - 8x + 16) - 16 + 3', why: 'Adding $16$ and subtracting $16$ adds zero, so the function does not change.' },
        { text: 'Factor and combine.', tex: 'y = (x - 4)^2 - 13', why: '$x^2 - 8x + 16 = (x - 4)^2$, and $-16 + 3 = -13$.' },
        { text: 'Read the vertex.', tex: '(h, k) = (4, -13)', why: 'In $a(x - h)^2 + k$, the $h$ appears with a minus sign. $(x - 4)$ means $h = 4$.' },
        { text: 'Check by expanding.', tex: '(x - 4)^2 - 13 = x^2 - 8x + 16 - 13 = x^2 - 8x + 3', why: 'Expanding gives back the original, so the rewrite is correct.' },
      ],
      answer: '$y = (x - 4)^2 - 13$, vertex $(4, -13)$',
    },
    {
      title: 'A common mistake: forgetting to multiply by a',
      kind: 'common-mistake',
      problem: [{ t: 'p', text: 'A student rewrites $y = 2x^2 + 12x + 5$ as $2(x^2 + 6x + 9) + 5 - 9 = 2(x + 3)^2 - 4$. Find and fix the mistake.' }],
      steps: [
        { text: 'Test both forms at $x = 0$.', tex: '2(0)^2 + 12(0) + 5 = 5, \\quad 2(0 + 3)^2 - 4 = 18 - 4 = 14', why: 'Equal expressions give equal values for every $x$. Since $5 \\ne 14$, the student made an error.' },
        { text: 'Find what was really added.', tex: '2(x^2 + 6x + 9) = 2x^2 + 12x + 18', why: 'The $9$ is inside parentheses that are multiplied by $2$, so the student actually added $2 \\cdot 9 = 18$, not $9$.' },
        { text: 'Subtract what was really added.', tex: 'y = 2(x^2 + 6x + 9) + 5 - 18', why: 'To keep the function the same, subtract the $18$ that was added.' },
        { text: 'Simplify.', tex: 'y = 2(x + 3)^2 - 13', why: '$5 - 18 = -13$. Check at $x = 0$: $2(9) - 13 = 5$. It matches.' },
      ],
      answer: '$y = 2(x + 3)^2 - 13$, vertex $(-3, -13)$. The student subtracted $9$ instead of $18$.',
    },
    {
      title: 'The top of a thrown ball',
      kind: 'real-world',
      problem: [{ t: 'p', text: 'A ball is tossed upward from 4 feet above the ground. Its height in feet after $t$ seconds is $h = -16t^2 + 64t + 4$. Complete the square to find the maximum height and when it happens.' }],
      steps: [
        { text: 'Factor $-16$ out of the $t$-terms.', tex: 'h = -16(t^2 - 4t) + 4', why: 'Completing the square needs a leading coefficient of $1$ inside the parentheses. $64 \\div (-16) = -4$.' },
        { text: 'Complete the square inside.', tex: 'h = -16(t^2 - 4t + 4 - 4) + 4', why: 'Half of $-4$ is $-2$, and $(-2)^2 = 4$. Adding and subtracting $4$ adds zero.' },
        { text: 'Move the $-4$ out, multiplying by $-16$.', tex: 'h = -16(t - 2)^2 + 64 + 4', why: '$-16 \\cdot (-4) = 64$. The subtracted number gets multiplied by the factor in front.' },
        { text: 'Combine.', tex: 'h = -16(t - 2)^2 + 68', why: 'Now the vertex is $(2, 68)$.' },
        { text: 'Interpret.', why: 'The square $(t - 2)^2$ is never negative, so $-16(t - 2)^2$ is at most $0$. The height is largest, $68$ feet, when $t = 2$. Check at $t = 0$: $-16(4) + 68 = 4$ feet, the starting height.' },
      ],
      answer: 'Maximum height $68$ feet, at $t = 2$ seconds. Vertex form: $h = -16(t - 2)^2 + 68$.',
    },
    {
      title: 'An odd middle coefficient',
      kind: 'challenging',
      problem: [{ t: 'p', text: 'Solve $x^2 + 5x - 6 = 0$ by completing the square.' }],
      steps: [
        { text: 'Move the constant.', tex: 'x^2 + 5x = 6', why: 'Clear room on the left for the perfect square.' },
        { text: 'Find $\\left(\\frac{b}{2}\\right)^2$.', tex: '\\left(\\frac{5}{2}\\right)^2 = \\frac{25}{4}', why: 'Half of an odd number is a fraction. Keep it as a fraction; decimals would make it messier.' },
        { text: 'Add $\\frac{25}{4}$ to both sides.', tex: '\\left(x + \\frac{5}{2}\\right)^2 = 6 + \\frac{25}{4} = \\frac{24}{4} + \\frac{25}{4} = \\frac{49}{4}', why: 'Write $6$ as $\\frac{24}{4}$ to add fractions with a common denominator.' },
        { text: 'Take the square root with $\\pm$.', tex: 'x + \\frac{5}{2} = \\pm\\frac{7}{2}', why: '$\\sqrt{\\frac{49}{4}} = \\frac{\\sqrt{49}}{\\sqrt{4}} = \\frac{7}{2}$.' },
        { text: 'Solve each case.', tex: 'x = -\\frac{5}{2} + \\frac{7}{2} = 1, \\quad x = -\\frac{5}{2} - \\frac{7}{2} = -6', why: 'Subtract $\\frac{5}{2}$ from both sides.' },
        { text: 'Check.', tex: '1 + 5 - 6 = 0, \\quad 36 - 30 - 6 = 0', why: 'Both work. (This one also factors as $(x + 6)(x - 1) = 0$, which agrees.)' },
      ],
      answer: '$x = 1$ or $x = -6$',
    },
  ],
  teachMeAgain: [
    {
      approach: 'visual',
      title: 'Build the square with tiles',
      blocks: [
        { t: 'p', text: 'Picture $x^2 + 8x$ as tiles: one $x^2$ square and eight $x$-strips. Put half the strips, $4$, on the right side and $4$ along the bottom.' },
        {
          t: 'table',
          caption: 'Algebra tiles for x squared plus 8x. The 4 by 4 corner needs 16 unit tiles to finish the square.',
          headers: ['times', 'x', '1', '1', '1', '1'],
          rows: [
            ['x', 'x² tile', 'x tile', 'x tile', 'x tile', 'x tile'],
            ['1', 'x tile', 'missing', 'missing', 'missing', 'missing'],
            ['1', 'x tile', 'missing', 'missing', 'missing', 'missing'],
            ['1', 'x tile', 'missing', 'missing', 'missing', 'missing'],
            ['1', 'x tile', 'missing', 'missing', 'missing', 'missing'],
          ],
        },
        { t: 'p', text: 'The empty corner is $4$ by $4$, so it needs $16$ unit tiles. With them, the square has side $x + 4$: $x^2 + 8x + 16 = (x + 4)^2$. Notice $4$ is half of $8$, and $16 = 4^2$. That is the $\\left(\\frac{b}{2}\\right)^2$ rule.' },
        { t: 'p', text: 'To solve $x^2 + 8x = 9$, add the $16$ tiles to both sides: $(x + 4)^2 = 25$, so $x + 4 = \\pm 5$ and $x = 1$ or $x = -9$.' },
      ],
    },
    {
      approach: 'simpler-example',
      title: 'Spot the pattern first',
      blocks: [
        { t: 'p', text: 'Look at a few squares you can expand. In each row the last number is half the middle number, squared.' },
        {
          t: 'table',
          caption: 'Perfect square trinomials. The constant is always half the x-coefficient, squared.',
          headers: ['Binomial squared', 'Expanded', 'Half of middle', 'That half, squared'],
          rows: [
            ['$(x + 1)^2$', '$x^2 + 2x + 1$', '$1$', '$1$'],
            ['$(x + 2)^2$', '$x^2 + 4x + 4$', '$2$', '$4$'],
            ['$(x + 5)^2$', '$x^2 + 10x + 25$', '$5$', '$25$'],
            ['$(x - 3)^2$', '$x^2 - 6x + 9$', '$-3$', '$9$'],
          ],
        },
        { t: 'p', text: 'So to finish $x^2 + 10x + \\underline{\\quad}$, take half of $10$ (that is $5$) and square it: $25$.' },
      ],
    },
    {
      approach: 'analogy',
      title: 'The missing puzzle piece',
      blocks: [
        { t: 'p', text: 'Completing the square is like a jigsaw puzzle with one corner piece missing. The pieces you have, $x^2$ and $bx$, already make an L-shape. You figure out exactly what fits the hole, $\\left(\\frac{b}{2}\\right)^2$, and snap it in.' },
        { t: 'p', text: 'But you cannot just take a piece from nowhere. In an **equation**, you put the same piece on the other side too, so the balance stays even. In a **function**, you add the piece and immediately take it back out (add and subtract), so nothing changes in value.' },
      ],
    },
    {
      approach: 'prerequisite',
      title: 'Refresher: squares of binomials and square roots',
      blocks: [
        { t: 'list', items: [
          '$(x + p)^2 = x^2 + 2px + p^2$. So $(x + 6)^2 = x^2 + 12x + 36$ and $(x - 1)^2 = x^2 - 2x + 1$.',
          'Going backward: $x^2 - 14x + 49$ is $(x - 7)^2$, because $-7 + (-7) = -14$ and $(-7)^2 = 49$.',
          'Solving a squared binomial: $(x - 7)^2 = 5$ gives $x - 7 = \\pm\\sqrt{5}$, so $x = 7 \\pm \\sqrt{5}$.',
        ] },
        { t: 'p', text: 'Completing the square just links these: build the perfect square, then solve it with square roots.' },
      ],
    },
    {
      approach: 'step-by-step',
      title: 'A checklist for each job',
      blocks: [
        { t: 'p', text: '**To solve** $x^2 - 10x + 18 = 0$:' },
        { t: 'list', ordered: true, items: [
          'Move the constant: $x^2 - 10x = -18$.',
          'Half of $-10$ is $-5$; square it: $25$.',
          'Add $25$ to both sides: $(x - 5)^2 = 7$.',
          'Square roots: $x - 5 = \\pm\\sqrt{7}$, so $x = 5 \\pm \\sqrt{7}$ (about $7.65$ and $2.35$).',
        ] },
        { t: 'p', text: '**To write vertex form** of $y = 3x^2 - 12x + 1$:' },
        { t: 'list', ordered: true, items: [
          'Factor $a$ out of the $x$-terms: $y = 3(x^2 - 4x) + 1$.',
          'Half of $-4$ is $-2$; square it: $4$. Add and subtract it inside: $y = 3(x^2 - 4x + 4 - 4) + 1$.',
          'Move the $-4$ out, times $3$: $y = 3(x - 2)^2 - 12 + 1$.',
          'Combine: $y = 3(x - 2)^2 - 11$. Vertex $(2, -11)$. Check at $x = 0$: $3(4) - 11 = 1$. It matches.',
        ] },
      ],
    },
    {
      approach: 'alternate-strategy',
      title: 'Match the coefficients',
      blocks: [
        { t: 'p', text: 'Another way to get vertex form: expand the form you want and match it to what you have. Suppose $x^2 - 8x + 3 = (x - h)^2 + k$.' },
        { t: 'math', tex: '(x - h)^2 + k = x^2 - 2hx + h^2 + k' },
        { t: 'p', text: 'Match the $x$-terms: $-2h = -8$, so $h = 4$. Match the constants: $h^2 + k = 3$, so $16 + k = 3$ and $k = -13$.' },
        { t: 'p', text: 'Result: $(x - 4)^2 - 13$, the same as completing the square. This is a good way to **check** your answer, too.' },
      ],
    },
  ],
  guided: [
    { generator: 'u4.complete-square-solve', difficulty: 1 },
    { generator: 'u4.complete-square-vertex', difficulty: 1 },
    { generator: 'u4.complete-square-solve', difficulty: 1 },
    { generator: 'u4.complete-square-vertex', difficulty: 1 },
  ],
  independent: {
    count: 8,
    reviewCount: 2,
    mix: [
      { generator: 'u4.complete-square-solve', difficulty: 1, weight: 1 },
      { generator: 'u4.complete-square-solve', difficulty: 2, weight: 2 },
      { generator: 'u4.complete-square-solve', difficulty: 3, weight: 1 },
      { generator: 'u4.complete-square-vertex', difficulty: 1, weight: 1 },
      { generator: 'u4.complete-square-vertex', difficulty: 2, weight: 2 },
      { generator: 'u4.complete-square-vertex', difficulty: 3, weight: 1 },
    ],
  },
  quiz: {
    items: [
      { generator: 'u4.complete-square-solve', difficulty: 2 },
      { generator: 'u4.complete-square-solve', difficulty: 2 },
      { generator: 'u4.complete-square-solve', difficulty: 3 },
      { generator: 'u4.complete-square-vertex', difficulty: 2 },
      { generator: 'u4.complete-square-vertex', difficulty: 2 },
      { generator: 'u4.complete-square-vertex', difficulty: 3 },
    ],
  },
  summary: [
    'To complete the square on $x^2 + bx$, add $\\left(\\frac{b}{2}\\right)^2$: $x^2 + 6x + 9 = (x + 3)^2$. The tiles show it as the missing corner.',
    'To solve, add $\\left(\\frac{b}{2}\\right)^2$ to **both** sides, then use square roots: $x^2 - 4x - 3 = 0$ becomes $(x - 2)^2 = 7$, so $x = 2 \\pm \\sqrt{7}$.',
    'For vertex form, add and subtract $\\left(\\frac{b}{2}\\right)^2$: $x^2 - 8x + 3 = (x - 4)^2 - 13$, vertex $(4, -13)$.',
    'If $a \\ne 1$, factor $a$ out of the $x$-terms first, and multiply the subtracted number by $a$: $2x^2 + 12x + 5 = 2(x + 3)^2 - 13$.',
  ],
  mastery: { quizPassScore: 0.8, practiceMinCorrect: 5 },
};
