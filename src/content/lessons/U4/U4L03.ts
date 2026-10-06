import type { LessonContent } from '../../../core/curriculum/types';

/**
 * U4L03 Special Products (A.PAR.6.2, A.MP.7)
 * Squaring a binomial with the area picture, why (a + b)^2 is not a^2 + b^2, the patterns
 * (a + b)^2 = a^2 + 2ab + b^2 and (a - b)^2 = a^2 - 2ab + b^2, and conjugates giving a difference of squares (S4.04).
 *
 * Math verified by hand (2026-10-06): every square, conjugate product, middle term, area, mental-math product and substitution check below was recomputed independently.
 */
export const U4L03: LessonContent = {
  lessonId: 'U4L03',
  goal: 'Square a binomial with the pattern $(a + b)^2 = a^2 + 2ab + b^2$, explain why $(a + b)^2 \\ne a^2 + b^2$, and multiply conjugates with $(a + b)(a - b) = a^2 - b^2$.',
  needToKnow: [
    { t: 'p', text: 'This lesson builds on three things you already know:' },
    {
      t: 'list',
      items: [
        '**Multiplying binomials with a box.** $(x + 4)(x - 7) = x^2 - 7x + 4x - 28 = x^2 - 3x - 28$.',
        '**Squaring means times itself.** $5^2 = 5 \\cdot 5 = 25$ and $(-3)^2 = 9$.',
        '**Squaring a term squares every factor.** $(3x)^2 = 3x \\cdot 3x = 9x^2$, not $3x^2$.',
      ],
    },
    { t: 'callout', variant: 'tip', title: 'Quick check', text: 'What is $(4x)^2$? (You should get $16x^2$.) If that felt shaky, open **Teach Me Again** and choose the refresher.' },
  ],
  vocabulary: [
    { term: 'square of a binomial', meaning: 'A binomial times itself, like $(x + 5)^2 = (x + 5)(x + 5)$.' },
    { term: 'perfect square trinomial', meaning: 'The result of squaring a binomial, like $x^2 + 10x + 25$.' },
    { term: 'middle term', meaning: 'In $a^2 + 2ab + b^2$, the term $2ab$. It comes from the two matching rectangles in the area model.' },
    { term: 'conjugates', meaning: 'Two binomials that differ only in the sign between the terms, like $x + 6$ and $x - 6$.' },
    { term: 'difference of squares', meaning: 'One perfect square minus another, like $x^2 - 36$. It is what conjugates multiply to.' },
  ],
  instruction: [
    { t: 'p', text: '### Squaring a binomial' },
    { t: 'p', text: 'The exponent $2$ means "times itself," so $(x + 5)^2 = (x + 5)(x + 5)$. Multiply with a box:' },
    {
      t: 'table',
      caption: 'Area model for (x + 5) squared.',
      headers: ['times', '$x$', '$5$'],
      rows: [
        ['$x$', '$x^2$', '$5x$'],
        ['$5$', '$5x$', '$25$'],
      ],
    },
    { t: 'math', tex: '(x + 5)^2 = x^2 + 5x + 5x + 25 = x^2 + 10x + 25' },
    { t: 'p', text: 'Notice the two middle cells are **the same**, $5x$ and $5x$. That always happens when you square a binomial, and it is where the middle term $10x$ comes from.' },
    { t: 'p', text: '### Why the square of a sum is not the sum of the squares' },
    { t: 'p', text: 'Picture a big square with side $a + b$. Cut each side into a piece of length $a$ and a piece of length $b$. The big square splits into **four** pieces, not two:' },
    {
      t: 'table',
      caption: 'A square with side a + b is made of a square of area a squared, a square of area b squared, and two rectangles of area ab.',
      headers: ['times', '$a$', '$b$'],
      rows: [
        ['$a$', '$a^2$ (square)', '$ab$ (rectangle)'],
        ['$b$', '$ab$ (rectangle)', '$b^2$ (square)'],
      ],
    },
    { t: 'math', tex: '(a + b)^2 = a^2 + ab + ab + b^2 = a^2 + 2ab + b^2' },
    { t: 'p', text: 'If you write only $a^2 + b^2$, you have left out the two rectangles. Test with numbers: $(3 + 4)^2 = 7^2 = 49$, but $3^2 + 4^2 = 9 + 16 = 25$. The missing $24$ is exactly $2ab = 2 \\cdot 3 \\cdot 4$, and $25 + 24 = 49$.' },
    {
      t: 'graph',
      caption: 'The graphs of (x + 1) squared and x squared plus 1 are different curves, so the two expressions are not equal.',
      spec: {
        xMin: -4, xMax: 3, yMin: -1, yMax: 10, xLabel: 'x', yLabel: 'y',
        functions: [
          { expr: '(x+1)^2', label: 'y = (x + 1)^2' },
          { expr: 'x^2+1', label: 'y = x^2 + 1', dashed: true },
        ],
        points: [{ x: 0, y: 1, label: '(0, 1)' }, { x: 1, y: 4, label: '(1, 4)' }, { x: 1, y: 2, label: '(1, 2)' }],
        ariaLabel: 'Two parabolas. The solid one, (x + 1) squared, has its lowest point at (-1, 0). The dashed one, x squared plus 1, has its lowest point at (0, 1). They cross only at (0, 1); at x = 1 the solid curve is at 4 and the dashed curve is at 2.',
      },
    },
    { t: 'p', text: 'The two curves meet only where the missing middle term $2x$ is $0$, at $x = 0$. Everywhere else they differ by $2x$.' },
    { t: 'p', text: '### The two square patterns' },
    { t: 'math', tex: '(a + b)^2 = a^2 + 2ab + b^2 \\qquad\\qquad (a - b)^2 = a^2 - 2ab + b^2' },
    { t: 'p', text: 'In words: **square the first term, double the product of the two terms, square the last term.** With a minus sign, only the middle term is negative; the last term $b^2$ is positive because $(-b)(-b) = b^2$.' },
    { t: 'math', tex: '(x - 6)^2 = x^2 - 2(x)(6) + 6^2 = x^2 - 12x + 36' },
    { t: 'math', tex: '(2x - 3)^2 = (2x)^2 - 2(2x)(3) + 3^2 = 4x^2 - 12x + 9' },
    { t: 'callout', variant: 'warning', title: 'Square the whole first term', text: 'When the first term is $2x$, its square is $(2x)^2 = 4x^2$, not $2x^2$. Put each term in parentheses before you square it.' },
    { t: 'p', text: '### Conjugates: the middle terms cancel' },
    { t: 'p', text: 'Now multiply two binomials that differ only in the middle sign, like $(x + 6)(x - 6)$:' },
    {
      t: 'table',
      caption: 'Area model for (x + 6)(x - 6). The two middle cells are opposites.',
      headers: ['times', '$x$', '$-6$'],
      rows: [
        ['$x$', '$x^2$', '$-6x$'],
        ['$6$', '$6x$', '$-36$'],
      ],
    },
    { t: 'math', tex: '(x + 6)(x - 6) = x^2 - 6x + 6x - 36 = x^2 - 36' },
    { t: 'p', text: 'The middle cells $-6x$ and $6x$ add to $0$. In general,' },
    { t: 'math', tex: '(a + b)(a - b) = a^2 - ab + ab - b^2 = a^2 - b^2' },
    { t: 'p', text: 'The answer is a **difference of squares**: no middle term at all. For example, $(4x - 5)(4x + 5) = (4x)^2 - 5^2 = 16x^2 - 25$.' },
    { t: 'callout', variant: 'why', title: 'You have seen this before', text: 'In the radicals unit, $(3 + \\sqrt{2})(3 - \\sqrt{2}) = 9 - 2 = 7$. That was the same conjugate pattern, $a^2 - b^2$ with $a = 3$ and $b = \\sqrt{2}$.' },
    { t: 'callout', variant: 'tip', title: 'Mental math tricks', text: '$21 \\cdot 19 = (20 + 1)(20 - 1) = 400 - 1 = 399$. And $31^2 = (30 + 1)^2 = 900 + 60 + 1 = 961$. Looking for structure (A.MP.7) turns hard arithmetic into easy arithmetic.' },
    { t: 'p', text: 'These patterns matter later: in a few lessons you will run them **backward** to factor, and completing the square is built on $(a + b)^2 = a^2 + 2ab + b^2$.' },
  ],
  examples: [
    {
      title: 'Square a sum',
      kind: 'introductory',
      problem: [{ t: 'p', text: 'Expand $(x + 7)^2$.' }],
      steps: [
        { text: 'Identify $a$ and $b$.', tex: 'a = x, \\quad b = 7', why: 'The pattern $(a + b)^2 = a^2 + 2ab + b^2$ works for any two terms.' },
        { text: 'Square the first term, double the product, square the last term.', tex: 'x^2 + 2(x)(7) + 7^2', why: 'The middle term $2ab$ comes from the two matching rectangles $7x$ and $7x$ in the area model.' },
        { text: 'Simplify.', tex: 'x^2 + 14x + 49', why: '$2 \\cdot 7 = 14$ and $7^2 = 49$.' },
        { text: 'Check at $x = 1$.', tex: '(1 + 7)^2 = 64, \\qquad 1 + 14 + 49 = 64', why: 'Both give $64$.' },
      ],
      answer: '$x^2 + 14x + 49$',
    },
    {
      title: 'Square a difference with a coefficient',
      kind: 'intermediate',
      problem: [{ t: 'p', text: 'Expand $(3x - 4)^2$.' }],
      steps: [
        { text: 'Identify $a$ and $b$.', tex: 'a = 3x, \\quad b = 4', why: 'Use $(a - b)^2 = a^2 - 2ab + b^2$. The minus sign is already in the pattern, so $b$ is $4$.' },
        { text: 'Square the first term.', tex: '(3x)^2 = 9x^2', why: 'Both the $3$ and the $x$ get squared: $3x \\cdot 3x = 9x^2$.' },
        { text: 'Find the middle term.', tex: '-2(3x)(4) = -24x', why: 'Double the product of the two terms, with the minus sign from the pattern.' },
        { text: 'Square the last term and assemble.', tex: '9x^2 - 24x + 16', why: '$4^2 = 16$, and it is positive because $(-4)(-4) = 16$. Check at $x = 1$: $(3 - 4)^2 = 1$ and $9 - 24 + 16 = 1$.' },
      ],
      answer: '$9x^2 - 24x + 16$',
    },
    {
      title: 'Multiply conjugates',
      kind: 'intermediate',
      problem: [{ t: 'p', text: 'Multiply $(x + 9)(x - 9)$ and $(5x - 2)(5x + 2)$.' }],
      steps: [
        { text: 'Recognize conjugates.', why: 'Each pair has the same two terms with opposite signs between them, so the pattern $(a + b)(a - b) = a^2 - b^2$ applies.' },
        { text: 'First pair: $a = x$, $b = 9$.', tex: '(x + 9)(x - 9) = x^2 - 81', why: 'The middle products $-9x$ and $+9x$ cancel, leaving $x^2 - 9^2$.' },
        { text: 'Second pair: $a = 5x$, $b = 2$.', tex: '(5x - 2)(5x + 2) = (5x)^2 - 2^2 = 25x^2 - 4', why: 'The order of the factors does not matter. Square the whole first term: $(5x)^2 = 25x^2$.' },
        { text: 'Check each at $x = 1$.', tex: '(10)(-8) = -80 = 1 - 81, \\qquad (3)(7) = 21 = 25 - 4', why: 'Both products match their patterns.' },
      ],
      answer: '$x^2 - 81$ and $25x^2 - 4$',
    },
    {
      title: 'A common mistake: forgetting the middle term',
      kind: 'common-mistake',
      problem: [{ t: 'p', text: 'A student writes $(x + 4)^2 = x^2 + 16$. Show that this is wrong and give the correct expansion.' }],
      steps: [
        { text: 'Test with a number, say $x = 1$.', tex: '(1 + 4)^2 = 25, \\qquad 1^2 + 16 = 17', why: 'If two expressions are equal, they must give the same value for every $x$. One counterexample proves they are not equal.' },
        { text: 'Write the square as a product.', tex: '(x + 4)^2 = (x + 4)(x + 4)', why: 'The exponent applies to the whole binomial, not to each term separately.' },
        { text: 'Multiply all four pairs.', tex: 'x^2 + 4x + 4x + 16 = x^2 + 8x + 16', why: 'The student kept the two squares but dropped the two rectangles, $4x + 4x = 8x$.' },
        { text: 'Check the correct answer at $x = 1$.', tex: '1 + 8 + 16 = 25', why: 'It matches $(1 + 4)^2 = 25$.' },
      ],
      answer: '$(x + 4)^2 = x^2 + 8x + 16$, not $x^2 + 16$.',
    },
    {
      title: 'A border around a square photo',
      kind: 'real-world',
      problem: [{ t: 'p', text: 'A square photo is $x$ inches on each side. You print it with a $2$-inch border on every side. Write the area of the whole print and the area of just the border. Check when the photo is $6$ inches wide.' }],
      steps: [
        { text: 'Find the side of the whole print.', tex: 'x + 2 + 2 = x + 4', why: 'The border adds $2$ inches on the left **and** $2$ inches on the right (and the same top and bottom).' },
        { text: 'Square the side.', tex: '(x + 4)^2 = x^2 + 2(x)(4) + 4^2 = x^2 + 8x + 16', why: 'The area of a square is side squared. Use the pattern $(a + b)^2 = a^2 + 2ab + b^2$.' },
        { text: 'Subtract the photo to get the border.', tex: '(x^2 + 8x + 16) - x^2 = 8x + 16', why: 'Border = whole print minus the photo inside it.' },
        { text: 'Check at $x = 6$.', tex: '10^2 - 6^2 = 100 - 36 = 64, \\qquad 8(6) + 16 = 64', why: 'The print is $10$ by $10$, the photo is $6$ by $6$, and both ways give $64$ square inches.' },
      ],
      answer: 'Whole print $x^2 + 8x + 16$ square inches; border $8x + 16$ square inches; $64$ square inches when $x = 6$.',
    },
    {
      title: 'Two variables in the square',
      kind: 'challenging',
      problem: [{ t: 'p', text: 'Expand $(3x + 2y)^2$ and $(3x + 2y)(3x - 2y)$. Explain why the answers are so different.' }],
      steps: [
        { text: 'Square: $a = 3x$, $b = 2y$.', tex: '(3x)^2 + 2(3x)(2y) + (2y)^2 = 9x^2 + 12xy + 4y^2', why: 'Square the first term, double the product, square the last term. $2 \\cdot 3 \\cdot 2 = 12$.' },
        { text: 'Conjugates: same $a$ and $b$.', tex: '(3x)^2 - (2y)^2 = 9x^2 - 4y^2', why: 'In the conjugate box the middle cells are $-6xy$ and $+6xy$, which cancel.' },
        { text: 'Compare.', why: 'Squaring has two **equal** rectangles ($6xy + 6xy = 12xy$). Conjugates have two **opposite** rectangles ($6xy - 6xy = 0$). The last term changes sign too: $(2y)(2y) = 4y^2$, but $(2y)(-2y) = -4y^2$.' },
        { text: 'Check with $x = 1$, $y = 1$.', tex: '5^2 = 25 = 9 + 12 + 4, \\qquad (5)(1) = 5 = 9 - 4', why: 'Both patterns give the right values.' },
      ],
      answer: '$(3x + 2y)^2 = 9x^2 + 12xy + 4y^2$ and $(3x + 2y)(3x - 2y) = 9x^2 - 4y^2$.',
    },
  ],
  teachMeAgain: [
    {
      approach: 'visual',
      title: 'Count the pieces of the square',
      blocks: [
        { t: 'p', text: 'Draw a square with side $x + 3$. Split each side into $x$ and $3$. You get four pieces:' },
        {
          t: 'table',
          caption: 'The square with side x + 3 cut into four pieces.',
          headers: ['times', '$x$', '$3$'],
          rows: [
            ['$x$', '$x^2$ (big square)', '$3x$ (strip)'],
            ['$3$', '$3x$ (strip)', '$9$ (small square)'],
          ],
        },
        { t: 'p', text: 'Two squares **and two strips**: $x^2 + 3x + 3x + 9 = x^2 + 6x + 9$. If you only wrote $x^2 + 9$, you would be leaving two strips of the square on the floor.' },
      ],
    },
    {
      approach: 'simpler-example',
      title: 'Use numbers first',
      blocks: [
        { t: 'p', text: '$11^2 = (10 + 1)^2 = 100 + 2(10)(1) + 1 = 100 + 20 + 1 = 121$. And $11 \\cdot 11 = 121$. The middle $20$ is the $2ab$ part.' },
        { t: 'p', text: '$9^2 = (10 - 1)^2 = 100 - 20 + 1 = 81$. The middle term is negative; the last term is still $+1$.' },
        { t: 'p', text: '$12 \\cdot 8 = (10 + 2)(10 - 2) = 100 - 4 = 96$. Conjugates: no middle term.' },
        { t: 'p', text: 'Now swap $10$ for $x$: $(x + 1)^2 = x^2 + 2x + 1$, $(x - 1)^2 = x^2 - 2x + 1$, and $(x + 2)(x - 2) = x^2 - 4$.' },
      ],
    },
    {
      approach: 'analogy',
      title: 'Twins and opposites',
      blocks: [
        { t: 'p', text: 'In every binomial product, the box has two "middle" cells. Think of them as two siblings.' },
        { t: 'p', text: '**Squaring:** the siblings are **twins**. In $(x + 5)(x + 5)$ both are $5x$, so they add up: $10x$.' },
        { t: 'p', text: '**Conjugates:** the siblings are **opposites**. In $(x + 5)(x - 5)$ one is $5x$ and the other is $-5x$. Like a \\$5 deposit followed by a \\$5 withdrawal, they cancel to $0$, so $(x + 5)(x - 5) = x^2 - 25$.' },
      ],
    },
    {
      approach: 'prerequisite',
      title: 'Refresher: squaring terms and signs',
      blocks: [
        {
          t: 'list',
          items: [
            'Square every factor of a term: $(2x)^2 = 4x^2$, $(5y)^2 = 25y^2$.',
            'A negative squared is positive: $(-6)^2 = 36$. So the last term of $(a - b)^2$ is $+b^2$.',
            'An exponent outside parentheses applies to the whole group: $(x + 3)^2$ means $(x + 3)(x + 3)$.',
            'Multiply binomials with a box: every term of one meets every term of the other.',
          ],
        },
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
            '**Decide which pattern.** Same binomial twice, $(a \\pm b)^2$? Or the same terms with opposite signs, $(a + b)(a - b)$?',
            '**Name $a$ and $b$.** For $(4x - 1)^2$: $a = 4x$, $b = 1$.',
            '**Apply the pattern.** Square: $a^2 \\pm 2ab + b^2 = 16x^2 - 8x + 1$. Conjugates: $a^2 - b^2$.',
            '**Check at $x = 1$.** $(4 - 1)^2 = 9$ and $16 - 8 + 1 = 9$.',
          ],
        },
      ],
    },
    {
      approach: 'alternate-strategy',
      title: 'Just multiply it out',
      blocks: [
        { t: 'p', text: 'The patterns are shortcuts, not new rules. If you forget one, write the product and use FOIL:' },
        { t: 'math', tex: '(x - 8)^2 = (x - 8)(x - 8) = x^2 - 8x - 8x + 64 = x^2 - 16x + 64' },
        { t: 'math', tex: '(x + 8)(x - 8) = x^2 - 8x + 8x - 64 = x^2 - 64' },
        { t: 'p', text: 'After a few of these, you will notice the pattern yourself: squares always have a doubled middle term, and conjugates never have one.' },
      ],
    },
  ],
  guided: [
    { generator: 'u4.special-products', difficulty: 1 },
    { generator: 'u4.special-products', difficulty: 1 },
    { generator: 'u4.special-products', difficulty: 1 },
    { generator: 'u4.special-products', difficulty: 1 },
  ],
  independent: {
    count: 8,
    reviewCount: 2,
    mix: [
      { generator: 'u4.special-products', difficulty: 1, weight: 1 },
      { generator: 'u4.special-products', difficulty: 2, weight: 2 },
      { generator: 'u4.special-products', difficulty: 3, weight: 2 },
    ],
  },
  quiz: {
    items: [
      { generator: 'u4.special-products', difficulty: 2 },
      { generator: 'u4.special-products', difficulty: 2 },
      { generator: 'u4.special-products', difficulty: 2 },
      { generator: 'u4.special-products', difficulty: 3 },
      { generator: 'u4.special-products', difficulty: 3 },
      { generator: 'u4.special-products', difficulty: 3 },
    ],
  },
  summary: [
    'Squaring a binomial means multiplying it by itself: $(x + 5)^2 = (x + 5)(x + 5) = x^2 + 10x + 25$.',
    '$(a + b)^2 = a^2 + 2ab + b^2$ and $(a - b)^2 = a^2 - 2ab + b^2$. The area picture has two squares **and** two rectangles, so $(a + b)^2 \\ne a^2 + b^2$.',
    'Conjugates multiply to a difference of squares: $(a + b)(a - b) = a^2 - b^2$, because the middle terms cancel. Example: $(4x - 5)(4x + 5) = 16x^2 - 25$.',
    'Square the whole term: $(2x)^2 = 4x^2$. Check any expansion by substituting $x = 1$.',
  ],
  mastery: { quizPassScore: 0.8, practiceMinCorrect: 5 },
};
