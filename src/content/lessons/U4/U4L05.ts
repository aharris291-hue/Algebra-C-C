import type { LessonContent } from '../../../core/curriculum/types';

/**
 * U4L05 Factoring ax² + bx + c and Special Patterns (A.PAR.6.2, A.MP.7)
 * The a·c method (split the middle term, then factor by grouping), why grouping works, signs in the
 * second group, GCF first, difference of squares, perfect square trinomials, sums of squares that do
 * not factor, and a factoring decision checklist (S4.07, S4.08).
 *
 * Math verified by hand (2026-10-06): every a·c product, split of the middle term, grouping step, special-pattern factorization and numeric check below was multiplied back out and recomputed independently.
 */
export const U4L05: LessonContent = {
  lessonId: 'U4L05',
  goal: 'Factor trinomials whose leading coefficient is not 1, like $2x^2 + 7x + 3 = (2x + 1)(x + 3)$, using the a·c method, and recognize special patterns like $9x^2 - 25 = (3x + 5)(3x - 5)$ and $x^2 - 10x + 25 = (x - 5)^2$.',
  needToKnow: [
    { t: 'p', text: 'This lesson builds on the last two:' },
    {
      t: 'list',
      items: [
        '**GCF first.** $6x^2 + 15x - 9 = 3(2x^2 + 5x - 3)$.',
        '**Product and sum.** $x^2 - 2x - 24 = (x + 4)(x - 6)$ because $4 \\cdot (-6) = -24$ and $4 + (-6) = -2$.',
        '**Special products.** $(x + 6)(x - 6) = x^2 - 36$ and $(x - 5)^2 = x^2 - 10x + 25$.',
        '**Perfect squares.** $1, 4, 9, 16, 25, 36, 49, 64, 81, 100, \\dots$ and $(3x)^2 = 9x^2$.',
      ],
    },
    { t: 'callout', variant: 'tip', title: 'Quick check', text: 'Factor $x^2 + 2x - 15$. (You should get $(x + 5)(x - 3)$.) If that felt shaky, open **Teach Me Again** and choose the refresher.' },
  ],
  vocabulary: [
    { term: 'a·c method', meaning: 'For $ax^2 + bx + c$, find two numbers that multiply to $a \\cdot c$ and add to $b$, then use them to split the middle term.' },
    { term: 'factor by grouping', meaning: 'Group four terms into two pairs, take the GCF out of each pair, then take out the shared binomial.' },
    { term: 'difference of squares', meaning: 'A perfect square minus a perfect square: $a^2 - b^2 = (a + b)(a - b)$.' },
    { term: 'perfect square trinomial', meaning: 'A trinomial that is a binomial squared: $a^2 + 2ab + b^2 = (a + b)^2$ or $a^2 - 2ab + b^2 = (a - b)^2$.' },
    { term: 'sum of squares', meaning: 'A perfect square plus a perfect square, like $x^2 + 25$. It does not factor over the real numbers.' },
  ],
  instruction: [
    { t: 'p', text: '### When the leading coefficient is not 1' },
    { t: 'p', text: 'In $2x^2 + 7x + 3$ the leading coefficient is $a = 2$, so "multiply to $c$, add to $b$" is not enough. The **a·c method** fixes that with one extra step.' },
    {
      t: 'list',
      ordered: true,
      items: [
        '**Multiply $a \\cdot c$:** $2 \\cdot 3 = 6$.',
        '**Find two numbers that multiply to $a \\cdot c$ and add to $b$:** multiply to $6$, add to $7$: $1$ and $6$.',
        '**Split the middle term** using those numbers: $2x^2 + 7x + 3 = 2x^2 + 1x + 6x + 3$.',
        '**Factor by grouping:** $x(2x + 1) + 3(2x + 1)$.',
        '**Take out the shared binomial:** $(2x + 1)(x + 3)$.',
      ],
    },
    { t: 'p', text: '**Check by multiplying back:** $(2x + 1)(x + 3) = 2x^2 + 6x + x + 3 = 2x^2 + 7x + 3$. It matches.' },
    { t: 'callout', variant: 'why', title: 'Why splitting the middle term works', text: 'When you multiply two binomials, the middle term comes from **two** pieces added together, the outer and inner products. In $(2x + 1)(x + 3)$ those pieces are $6x$ and $1x$. Their coefficients multiply to $6 \\cdot 1 = 6$, which is always the same as $a \\cdot c = 2 \\cdot 3$. So finding numbers that multiply to $ac$ and add to $b$ recovers exactly those two hidden pieces, and grouping undoes the multiplication.' },
    { t: 'p', text: '### Watch the signs in the second group' },
    { t: 'p', text: 'Factor $2x^2 + 5x - 12$. Here $ac = 2(-12) = -24$, and we need a sum of $5$: the numbers are $8$ and $-3$.' },
    { t: 'math', tex: '2x^2 + 8x - 3x - 12 = 2x(x + 4) - 3(x + 4) = (x + 4)(2x - 3)' },
    { t: 'p', text: 'When the third term is negative, take a **negative** GCF from the second pair, so the two binomials match: $-3x - 12 = -3(x + 4)$.' },
    { t: 'callout', variant: 'tip', title: 'Both groups must leave the same binomial', text: 'If the two parentheses do not match after grouping, check the sign of the GCF you took from the second pair. Matching parentheses is a built-in check that you are on the right track.' },
    { t: 'p', text: '### GCF first, always' },
    { t: 'p', text: '$6x^2 + 15x - 9$ has a GCF of $3$. Take it out first so the numbers stay small:' },
    { t: 'math', tex: '6x^2 + 15x - 9 = 3(2x^2 + 5x - 3) = 3(2x - 1)(x + 3)' },
    { t: 'p', text: 'Inside, $ac = 2(-3) = -6$ and the numbers are $6$ and $-1$: $2x^2 + 6x - x - 3 = 2x(x + 3) - 1(x + 3) = (x + 3)(2x - 1)$.' },
    { t: 'p', text: '### Special pattern 1: difference of squares' },
    { t: 'p', text: 'Multiplying conjugates makes the middle terms cancel: $(a + b)(a - b) = a^2 - ab + ab - b^2 = a^2 - b^2$. Read it backwards to factor:' },
    { t: 'math', tex: 'a^2 - b^2 = (a + b)(a - b)' },
    {
      t: 'table',
      caption: 'Factoring differences of squares. Find what was squared to make each term.',
      headers: ['Expression', 'a squared', 'b squared', 'Factored'],
      rows: [
        ['$x^2 - 49$', '$x^2$, so $a = x$', '$49$, so $b = 7$', '$(x + 7)(x - 7)$'],
        ['$9x^2 - 25$', '$9x^2$, so $a = 3x$', '$25$, so $b = 5$', '$(3x + 5)(3x - 5)$'],
        ['$16x^2 - 1$', '$16x^2$, so $a = 4x$', '$1$, so $b = 1$', '$(4x + 1)(4x - 1)$'],
      ],
    },
    { t: 'callout', variant: 'warning', title: 'A sum of squares does not factor', text: '$x^2 + 25$ is **not** $(x + 5)(x - 5)$; that multiplies to $x^2 - 25$. And $(x + 5)^2 = x^2 + 10x + 25$ has a middle term. No pair of binomials with real numbers multiplies to $x^2 + 25$, so it is prime.' },
    { t: 'p', text: '### Special pattern 2: perfect square trinomials' },
    { t: 'p', text: 'Squaring a binomial gives $(a + b)^2 = a^2 + 2ab + b^2$ and $(a - b)^2 = a^2 - 2ab + b^2$. A trinomial fits this pattern when:' },
    {
      t: 'list',
      items: [
        'the first term is a perfect square, $a^2$,',
        'the last term is a perfect square, $b^2$, and it is **positive**,',
        'the middle term is $2ab$ or $-2ab$.',
      ],
    },
    { t: 'p', text: 'For $4x^2 + 12x + 9$: $4x^2 = (2x)^2$, $9 = 3^2$, and $2(2x)(3) = 12x$. All three fit, so $4x^2 + 12x + 9 = (2x + 3)^2$.' },
    { t: 'p', text: 'For $x^2 - 10x + 25$: $x^2 = (x)^2$, $25 = 5^2$, and $2(x)(5) = 10x$ with a minus sign. So $x^2 - 10x + 25 = (x - 5)^2$.' },
    { t: 'callout', variant: 'why', title: 'Why learn the patterns if the a·c method works?', text: 'The a·c method does work on these: for $x^2 - 10x + 25$ you would find $-5$ and $-5$. But spotting a pattern is much faster, and for a difference of squares like $x^2 - 49$ there is no middle term at all, which makes the pattern the natural tool. Seeing structure is a big part of algebra.' },
    { t: 'p', text: '### A factoring checklist' },
    {
      t: 'list',
      ordered: true,
      items: [
        '**Take out the GCF** (negative if the leading coefficient is negative).',
        '**Two terms?** Check for a difference of squares.',
        '**Three terms?** Check for a perfect square trinomial. Otherwise use product-sum (if $a = 1$) or the a·c method.',
        '**Check** that no factor can be factored again, and multiply back.',
      ],
    },
  ],
  examples: [
    {
      title: 'The a·c method, start to finish',
      kind: 'introductory',
      problem: [{ t: 'p', text: 'Factor $3x^2 + 14x + 8$.' }],
      steps: [
        { text: 'Check for a GCF.', why: '$3$, $14$ and $8$ share no common factor other than $1$, so there is no GCF to take out.' },
        { text: 'Multiply $a \\cdot c$.', tex: 'a \\cdot c = 3 \\cdot 8 = 24', why: 'The two hidden middle pieces always have coefficients whose product is $ac$.' },
        { text: 'Find two numbers that multiply to $24$ and add to $14$.', tex: '1 \\cdot 24 \\to 25, \\quad 2 \\cdot 12 \\to 14', why: 'Both $ac$ and $b$ are positive, so both numbers are positive. $2$ and $12$ work.' },
        { text: 'Split the middle term and group.', tex: '3x^2 + 2x + 12x + 8 = x(3x + 2) + 4(3x + 2)', why: '$2x + 12x = 14x$, so the expression has not changed. The GCF of $3x^2 + 2x$ is $x$, and the GCF of $12x + 8$ is $4$.' },
        { text: 'Take out the shared binomial.', tex: '(3x + 2)(x + 4)', why: 'Both groups contain $(3x + 2)$, so it comes out like any common factor.' },
        { text: 'Check by multiplying back.', tex: '(3x + 2)(x + 4) = 3x^2 + 12x + 2x + 8 = 3x^2 + 14x + 8', why: 'It matches the original.' },
      ],
      answer: '$(3x + 2)(x + 4)$',
    },
    {
      title: 'Negative middle and last terms',
      kind: 'intermediate',
      problem: [{ t: 'p', text: 'Factor $5x^2 - 13x - 6$.' }],
      steps: [
        { text: 'Multiply $a \\cdot c$.', tex: 'a \\cdot c = 5(-6) = -30', why: 'There is no GCF, so we go straight to the a·c method.' },
        { text: 'Find two numbers that multiply to $-30$ and add to $-13$.', tex: '2 \\cdot (-15) = -30, \\quad 2 + (-15) = -13', why: 'The product is negative, so the signs are opposite. The sum is negative, so the bigger number is negative.' },
        { text: 'Split the middle term and group.', tex: '5x^2 - 15x + 2x - 6 = 5x(x - 3) + 2(x - 3)', why: '$-15x + 2x = -13x$. The GCF of $5x^2 - 15x$ is $5x$, and the GCF of $2x - 6$ is $2$.' },
        { text: 'Take out the shared binomial.', tex: '(x - 3)(5x + 2)', why: 'Both groups contain $(x - 3)$.' },
        { text: 'Check by multiplying back.', tex: '(x - 3)(5x + 2) = 5x^2 + 2x - 15x - 6 = 5x^2 - 13x - 6', why: 'It matches.' },
      ],
      answer: '$(x - 3)(5x + 2)$',
    },
    {
      title: 'Spot the special patterns',
      kind: 'intermediate',
      problem: [{ t: 'p', text: 'Factor (a) $16x^2 - 81$ and (b) $9x^2 - 30x + 25$.' }],
      steps: [
        { text: '(a) Two terms with a minus between perfect squares: a difference of squares.', tex: '16x^2 = (4x)^2, \\quad 81 = 9^2', why: '$4x \\cdot 4x = 16x^2$ and $9 \\cdot 9 = 81$.' },
        { text: 'Use $a^2 - b^2 = (a + b)(a - b)$.', tex: '16x^2 - 81 = (4x + 9)(4x - 9)', why: 'Check: $(4x + 9)(4x - 9) = 16x^2 - 36x + 36x - 81 = 16x^2 - 81$. The middle terms cancel.' },
        { text: '(b) Test for a perfect square trinomial.', tex: '9x^2 = (3x)^2, \\quad 25 = 5^2, \\quad 2(3x)(5) = 30x', why: 'The first and last terms are perfect squares, the last is positive, and the middle has size $2ab$. The minus sign means $(a - b)^2$.' },
        { text: 'Write it as a square.', tex: '9x^2 - 30x + 25 = (3x - 5)^2', why: 'Check: $(3x - 5)(3x - 5) = 9x^2 - 15x - 15x + 25 = 9x^2 - 30x + 25$.' },
      ],
      answer: '(a) $(4x + 9)(4x - 9)$; (b) $(3x - 5)^2$',
    },
    {
      title: 'A common mistake: the sign in the second group',
      kind: 'common-mistake',
      problem: [{ t: 'p', text: 'A student factoring $2x^2 + x - 6$ writes $2x^2 + 4x - 3x - 6 = 2x(x + 2) - 3(x - 2)$ and gets stuck because the parentheses do not match. Find and fix the mistake.' }],
      steps: [
        { text: 'Check the split.', tex: 'ac = 2(-6) = -12, \\quad 4 \\cdot (-3) = -12, \\quad 4 + (-3) = 1', why: 'The numbers $4$ and $-3$ are correct, so the split $4x - 3x$ is fine.' },
        { text: 'Multiply the second group back out.', tex: '-3(x - 2) = -3x + 6', why: 'That gives $+6$, but the original has $-6$. The student took out $-3$ but did not divide the $-6$ by $-3$ correctly.' },
        { text: 'Take out $-3$ correctly.', tex: '-3x - 6 = -3(x + 2)', why: '$-3x \\div (-3) = x$ and $-6 \\div (-3) = +2$. Dividing by a negative flips the sign.' },
        { text: 'Finish and check.', tex: '2x(x + 2) - 3(x + 2) = (x + 2)(2x - 3)', why: 'Check: $(x + 2)(2x - 3) = 2x^2 - 3x + 4x - 6 = 2x^2 + x - 6$. It matches.' },
      ],
      answer: '$2x^2 + x - 6 = (x + 2)(2x - 3)$. The second group should be $-3(x + 2)$.',
    },
    {
      title: 'Dimensions of a phone screen',
      kind: 'real-world',
      problem: [{ t: 'p', text: 'The area of a rectangular phone screen is $6x^2 + 7x + 2$ square centimeters. Factor to find expressions for its length and width. Then find the dimensions when $x = 3$, and check them against the area.' }],
      steps: [
        { text: 'Use the a·c method.', tex: 'ac = 6 \\cdot 2 = 12, \\quad 3 \\cdot 4 = 12, \\quad 3 + 4 = 7', why: 'Area of a rectangle is length times width, so the factors are the side lengths. There is no GCF.' },
        { text: 'Split the middle term and group.', tex: '6x^2 + 3x + 4x + 2 = 3x(2x + 1) + 2(2x + 1)', why: '$3x + 4x = 7x$. The GCF of $6x^2 + 3x$ is $3x$; the GCF of $4x + 2$ is $2$.' },
        { text: 'Take out the shared binomial.', tex: '6x^2 + 7x + 2 = (2x + 1)(3x + 2)', why: 'Check: $(2x + 1)(3x + 2) = 6x^2 + 4x + 3x + 2 = 6x^2 + 7x + 2$.' },
        { text: 'Substitute $x = 3$.', tex: '2(3) + 1 = 7, \\quad 3(3) + 2 = 11', why: 'The sides are $7$ cm and $11$ cm.' },
        { text: 'Check against the area.', tex: '7 \\cdot 11 = 77, \\qquad 6(3)^2 + 7(3) + 2 = 54 + 21 + 2 = 77', why: 'Both ways give $77$ square centimeters, so the factoring agrees with the area.' },
      ],
      answer: 'Width $2x + 1$ and length $3x + 2$; when $x = 3$ the screen is $7$ cm by $11$ cm, area $77$ square centimeters.',
    },
    {
      title: 'GCF first, then a perfect square',
      kind: 'challenging',
      problem: [{ t: 'p', text: 'Factor $18x^2 - 48x + 32$ completely.' }],
      steps: [
        { text: 'Take out the GCF.', tex: '18x^2 - 48x + 32 = 2(9x^2 - 24x + 16)', why: '$2$ divides $18$, $48$ and $32$, and no larger number divides all three ($3$ does not divide $32$).' },
        { text: 'Test the trinomial inside for a perfect square.', tex: '9x^2 = (3x)^2, \\quad 16 = 4^2, \\quad 2(3x)(4) = 24x', why: 'All three conditions hold, and the middle sign is minus, so it is $(a - b)^2$ with $a = 3x$ and $b = 4$.' },
        { text: 'Write the complete factorization.', tex: '18x^2 - 48x + 32 = 2(3x - 4)^2', why: 'Keep the GCF in front.' },
        { text: 'Check by multiplying back.', tex: '(3x - 4)^2 = 9x^2 - 24x + 16, \\quad 2(9x^2 - 24x + 16) = 18x^2 - 48x + 32', why: 'It matches. A check with $x = 1$: $18 - 48 + 32 = 2$ and $2(3 - 4)^2 = 2(1) = 2$.' },
      ],
      answer: '$2(3x - 4)^2$',
    },
  ],
  teachMeAgain: [
    {
      approach: 'visual',
      title: 'The box method',
      blocks: [
        { t: 'p', text: 'Factor $2x^2 + 7x + 3$ with a 2-by-2 box. Put $2x^2$ in the top-left corner and $3$ in the bottom-right corner. The a·c numbers $1$ and $6$ give the other two boxes, $1x$ and $6x$.' },
        {
          t: 'table',
          caption: 'Box for 2x squared + 7x + 3 before finding the sides.',
          headers: ['times', '?', '?'],
          rows: [
            ['?', '$2x^2$', '$6x$'],
            ['?', '$1x$', '$3$'],
          ],
        },
        { t: 'p', text: 'Now find the GCF of each row and each column. Top row: $2x^2$ and $6x$ share $2x$. Bottom row: $1x$ and $3$ share $1$. Left column: $2x^2$ and $1x$ share $x$. Right column: $6x$ and $3$ share $3$.' },
        {
          t: 'table',
          caption: 'Box for 2x squared + 7x + 3 with its sides filled in.',
          headers: ['times', '$x$', '$+3$'],
          rows: [
            ['$2x$', '$2x^2$', '$6x$'],
            ['$+1$', '$1x$', '$3$'],
          ],
        },
        { t: 'p', text: 'The sides are $2x + 1$ and $x + 3$, so $2x^2 + 7x + 3 = (2x + 1)(x + 3)$.' },
      ],
    },
    {
      approach: 'simpler-example',
      title: 'Small numbers first',
      blocks: [
        { t: 'p', text: '$2x^2 + 5x + 2$: $ac = 4$, and $1 \\cdot 4 = 4$, $1 + 4 = 5$. Split: $2x^2 + x + 4x + 2 = x(2x + 1) + 2(2x + 1) = (2x + 1)(x + 2)$.' },
        { t: 'p', text: '$3x^2 + 4x + 1$: $ac = 3$, and $1 \\cdot 3 = 3$, $1 + 3 = 4$. Split: $3x^2 + x + 3x + 1 = x(3x + 1) + 1(3x + 1) = (3x + 1)(x + 1)$.' },
        { t: 'p', text: '$x^2 - 9$: two perfect squares with a minus, so $(x + 3)(x - 3)$.' },
        { t: 'p', text: '$x^2 + 6x + 9$: $9 = 3^2$ and $2 \\cdot 3 = 6$, so $(x + 3)^2$.' },
      ],
    },
    {
      approach: 'analogy',
      title: 'Checking a pattern like an ID card',
      blocks: [
        { t: 'p', text: 'A perfect square trinomial has to pass three checks, like a bouncer checking an ID: a perfect-square first term, a positive perfect-square last term, and a middle term equal to plus or minus twice the product of their square roots.' },
        { t: 'p', text: '$x^2 + 8x + 16$: $x^2$ yes, $16 = 4^2$ yes, $2(x)(4) = 8x$ yes. It gets in: $(x + 4)^2$.' },
        { t: 'p', text: '$x^2 + 10x + 16$: $x^2$ yes, $16 = 4^2$ yes, but $2(x)(4) = 8x$, not $10x$. It fails the check. It still factors the regular way: $2 \\cdot 8 = 16$, $2 + 8 = 10$, so $(x + 2)(x + 8)$.' },
        { t: 'p', text: 'A difference of squares needs only two checks: both terms are perfect squares, and there is a **minus** between them. $x^2 - 64$ passes; $x^2 + 64$ fails.' },
      ],
    },
    {
      approach: 'prerequisite',
      title: 'Refresher: special products and grouping',
      blocks: [
        {
          t: 'list',
          items: [
            'Conjugates: $(x + 7)(x - 7) = x^2 - 7x + 7x - 49 = x^2 - 49$. The middle terms cancel.',
            'Squaring a binomial: $(x - 5)^2 = (x - 5)(x - 5) = x^2 - 10x + 25$. The middle term is doubled: $2 \\cdot 5 = 10$.',
            'A shared binomial factors out like a number: $x(2x + 1) + 3(2x + 1)$ is "$x$ of something plus $3$ of the same thing", which is $(x + 3)$ of it: $(2x + 1)(x + 3)$.',
          ],
        },
      ],
    },
    {
      approach: 'step-by-step',
      title: 'The a·c method in 6 steps',
      blocks: [
        { t: 'p', text: 'Factor $4x^2 - 4x - 3$.' },
        {
          t: 'list',
          ordered: true,
          items: [
            '**GCF?** None ($4$, $4$ and $3$ share only $1$).',
            '**Multiply a·c:** $4(-3) = -12$.',
            '**Product $-12$, sum $-4$:** $2$ and $-6$.',
            '**Split:** $4x^2 + 2x - 6x - 3$.',
            '**Group:** $2x(2x + 1) - 3(2x + 1) = (2x + 1)(2x - 3)$.',
            '**Check:** $(2x + 1)(2x - 3) = 4x^2 - 6x + 2x - 3 = 4x^2 - 4x - 3$. It matches.',
          ],
        },
      ],
    },
    {
      approach: 'alternate-strategy',
      title: 'Guess and check with factor pairs',
      blocks: [
        { t: 'p', text: 'When $a$ and $c$ are small, you can try the possible binomials directly. For $2x^2 + 7x + 3$, the first terms must be $2x$ and $x$, and the last terms must be $1$ and $3$. There are two ways to place them:' },
        {
          t: 'table',
          caption: 'Trying the two arrangements for 2x squared + 7x + 3.',
          headers: ['Try', 'Outer + inner', 'Middle term'],
          rows: [
            ['$(2x + 3)(x + 1)$', '$2x + 3x$', '$5x$, no'],
            ['$(2x + 1)(x + 3)$', '$6x + x$', '$7x$, yes'],
          ],
        },
        { t: 'p', text: 'So $2x^2 + 7x + 3 = (2x + 1)(x + 3)$. This works well for small numbers, but the a·c method is more reliable when $a$ and $c$ have many factors.' },
      ],
    },
  ],
  guided: [
    { generator: 'u4.factor-ax2', difficulty: 1 },
    { generator: 'u4.factor-special', difficulty: 1 },
    { generator: 'u4.factor-ax2', difficulty: 1 },
    { generator: 'u4.factor-special', difficulty: 1 },
  ],
  independent: {
    count: 8,
    reviewCount: 2,
    mix: [
      { generator: 'u4.factor-ax2', difficulty: 1, weight: 1 },
      { generator: 'u4.factor-ax2', difficulty: 2, weight: 2 },
      { generator: 'u4.factor-ax2', difficulty: 3, weight: 1 },
      { generator: 'u4.factor-special', difficulty: 1, weight: 1 },
      { generator: 'u4.factor-special', difficulty: 2, weight: 2 },
      { generator: 'u4.factor-special', difficulty: 3, weight: 1 },
    ],
  },
  quiz: {
    items: [
      { generator: 'u4.factor-ax2', difficulty: 2 },
      { generator: 'u4.factor-ax2', difficulty: 2 },
      { generator: 'u4.factor-ax2', difficulty: 3 },
      { generator: 'u4.factor-special', difficulty: 2 },
      { generator: 'u4.factor-special', difficulty: 2 },
      { generator: 'u4.factor-special', difficulty: 3 },
    ],
  },
  summary: [
    'a·c method for $ax^2 + bx + c$: find two numbers that multiply to $ac$ and add to $b$, split the middle term, and factor by grouping: $2x^2 + 7x + 3 = 2x^2 + x + 6x + 3 = (2x + 1)(x + 3)$.',
    'When grouping, both parentheses must match; take a negative GCF from the second pair when its first term is negative.',
    'Difference of squares: $a^2 - b^2 = (a + b)(a - b)$, as in $9x^2 - 25 = (3x + 5)(3x - 5)$. A sum of squares like $x^2 + 25$ does not factor.',
    'Perfect square trinomials: $a^2 \\pm 2ab + b^2 = (a \\pm b)^2$, as in $4x^2 + 12x + 9 = (2x + 3)^2$. Take out any GCF first and check by multiplying back.',
  ],
  mastery: { quizPassScore: 0.8, practiceMinCorrect: 5 },
};
