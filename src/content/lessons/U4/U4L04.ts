import type { LessonContent } from '../../../core/curriculum/types';

/**
 * U4L04 Factoring: GCF and x² + bx + c (A.PAR.6.2)
 * Factoring as un-multiplying, the greatest common factor (numbers and powers of x, negative
 * leading coefficients), the product-sum table for x² + bx + c, sign rules, area models, GCF first,
 * prime trinomials, and checking every factorization by multiplying back (S4.05, S4.06).
 *
 * Math verified by hand (2026-10-06): every GCF, factor pair, product-sum table, sign choice and factorization below was multiplied back out and recomputed independently.
 */
export const U4L04: LessonContent = {
  lessonId: 'U4L04',
  goal: 'Factor out the greatest common factor, like $8x^2 + 20x = 4x(2x + 5)$, and factor trinomials with leading coefficient 1, like $x^2 + 7x + 12 = (x + 3)(x + 4)$, then check by multiplying back.',
  needToKnow: [
    { t: 'p', text: 'Factoring is multiplying **in reverse**, so this lesson leans on what you just practiced:' },
    {
      t: 'list',
      items: [
        '**The distributive property.** $3x(2x - 5) = 6x^2 - 15x$.',
        '**Multiplying two binomials.** $(x + 3)(x + 4) = x^2 + 4x + 3x + 12 = x^2 + 7x + 12$.',
        '**Factor pairs of a number.** The factor pairs of $12$ are $1 \\cdot 12$, $2 \\cdot 6$ and $3 \\cdot 4$.',
        '**Integer signs.** A positive times a negative is negative; a negative times a negative is positive.',
      ],
    },
    { t: 'callout', variant: 'tip', title: 'Quick check', text: 'Multiply $(x - 2)(x + 5)$. (You should get $x^2 + 3x - 10$.) If that felt shaky, open **Teach Me Again** and choose the refresher.' },
  ],
  vocabulary: [
    { term: 'factor (verb)', meaning: 'Rewrite an expression as a product. Factoring $x^2 + 7x + 12$ gives $(x + 3)(x + 4)$.' },
    { term: 'factor (noun)', meaning: 'One of the things being multiplied. In $4x(2x + 5)$, the factors are $4x$ and $2x + 5$.' },
    { term: 'greatest common factor (GCF)', meaning: 'The largest expression that divides every term. The GCF of $8x^2$ and $20x$ is $4x$.' },
    { term: 'trinomial', meaning: 'A polynomial with three terms, like $x^2 - 2x - 24$.' },
    { term: 'leading coefficient', meaning: 'The number in front of the highest power. In $x^2 + 7x + 12$ it is $1$.' },
    { term: 'prime polynomial', meaning: 'A polynomial that cannot be factored using integers, like $x^2 + 5x + 3$.' },
    { term: 'completely factored', meaning: 'Factored until no factor can be broken down any further (no common factor left and no factorable trinomial left).' },
  ],
  instruction: [
    { t: 'p', text: '### Factoring is un-multiplying' },
    { t: 'p', text: 'When you multiply, you start with factors and get a product. When you **factor**, you start with the product and find the factors.' },
    { t: 'math', tex: '\\underbrace{4x(2x + 5)}_{\\text{factored}} \\;\\xrightarrow{\\text{multiply}}\\; \\underbrace{8x^2 + 20x}_{\\text{expanded}} \\;\\xrightarrow{\\text{factor}}\\; 4x(2x + 5)' },
    { t: 'callout', variant: 'why', title: 'Why bother factoring?', text: 'A factored form shows things the expanded form hides. In the next lessons you will solve equations like $x^2 + 7x + 12 = 0$, and that is easy only when the left side is written as $(x + 3)(x + 4)$. Factored forms also show the length and width of a rectangle from its area.' },
    { t: 'p', text: '### Step 1 is always: look for a GCF' },
    { t: 'p', text: 'The **greatest common factor** has two parts: the largest number that divides every coefficient, and the lowest power of $x$ that appears in **every** term.' },
    { t: 'p', text: 'For $12x^3 - 18x^2 + 30x$: the largest number dividing $12$, $18$ and $30$ is $6$. Every term has at least one $x$, and the lowest power is $x^1$. So the GCF is $6x$. Divide each term by $6x$:' },
    { t: 'math', tex: '12x^3 - 18x^2 + 30x = 6x(2x^2 - 3x + 5)' },
    { t: 'p', text: '**Check by multiplying back:** $6x \\cdot 2x^2 = 12x^3$, $6x \\cdot (-3x) = -18x^2$, $6x \\cdot 5 = 30x$. It matches.' },
    { t: 'callout', variant: 'warning', title: 'Take out the greatest factor, not just any factor', text: '$12x^2 + 18x = 2x(6x + 9)$ is true, but not finished: $6x + 9$ still has a common factor of $3$. The GCF of $12x^2$ and $18x$ is $6x$, so the complete answer is $12x^2 + 18x = 6x(2x + 3)$. Check: inside the parentheses there should be no common factor left.' },
    { t: 'p', text: 'When the leading coefficient is **negative**, take out a negative GCF so the leading term inside is positive. Every sign inside flips:' },
    { t: 'math', tex: '-4x^2 + 8x = -4x(x - 2)' },
    { t: 'p', text: 'Check: $-4x \\cdot x = -4x^2$ and $-4x \\cdot (-2) = +8x$.' },
    { t: 'p', text: '### Factoring x squared + bx + c' },
    { t: 'p', text: 'Look at what happens when you multiply $(x + p)(x + q)$:' },
    { t: 'math', tex: '(x + p)(x + q) = x^2 + qx + px + pq = x^2 + (p + q)x + pq' },
    { t: 'p', text: 'So to factor $x^2 + bx + c$, find two numbers $p$ and $q$ that **multiply to $c$** and **add to $b$**. That is the whole idea.' },
    { t: 'p', text: 'For $x^2 + 7x + 12$, list the factor pairs of $12$ and add each pair:' },
    {
      t: 'table',
      caption: 'Product-sum table for x squared + 7x + 12. The pair 3 and 4 multiplies to 12 and adds to 7.',
      headers: ['Factor pair of 12', 'Sum', 'Adds to 7?'],
      rows: [
        ['$1 \\cdot 12$', '$13$', 'no'],
        ['$2 \\cdot 6$', '$8$', 'no'],
        ['$3 \\cdot 4$', '$7$', 'yes'],
      ],
    },
    { t: 'math', tex: 'x^2 + 7x + 12 = (x + 3)(x + 4)' },
    { t: 'p', text: 'An **area model** shows why. A rectangle with sides $x + 3$ and $x + 4$ splits into four pieces whose areas add up to the trinomial: the two middle pieces $3x$ and $4x$ combine to $7x$.' },
    {
      t: 'table',
      caption: 'Area model for (x + 3)(x + 4). The four pieces add to x squared + 7x + 12.',
      headers: ['times', '$x$', '$+4$'],
      rows: [
        ['$x$', '$x^2$', '$4x$'],
        ['$+3$', '$3x$', '$12$'],
      ],
    },
    { t: 'p', text: '### Use the signs to narrow the search' },
    {
      t: 'table',
      caption: 'Sign rules for x squared + bx + c.',
      headers: ['If c is', 'and b is', 'then the two numbers are', 'Example'],
      rows: [
        ['positive', 'positive', 'both positive', '$x^2 + 7x + 12 = (x + 3)(x + 4)$'],
        ['positive', 'negative', 'both negative', '$x^2 - 9x + 20 = (x - 4)(x - 5)$'],
        ['negative', 'positive', 'opposite signs; the one larger in size (ignoring its sign) is positive', '$x^2 + 2x - 15 = (x + 5)(x - 3)$'],
        ['negative', 'negative', 'opposite signs; the one larger in size (ignoring its sign) is negative', '$x^2 - 4x - 21 = (x - 7)(x + 3)$'],
      ],
    },
    { t: 'callout', variant: 'why', title: 'Why the sign rules work', text: 'If $c$ is positive, the two numbers have the same sign (same signs multiply to a positive), and their sum $b$ tells you which sign. If $c$ is negative, the numbers have opposite signs, and the one with the bigger size wins the sum, so it gets the sign of $b$.' },
    { t: 'p', text: '### GCF first, then the trinomial' },
    { t: 'p', text: 'If every term shares a factor, take it out first. The trinomial left inside is smaller and easier:' },
    { t: 'math', tex: '2x^2 - 6x - 20 = 2(x^2 - 3x - 10) = 2(x - 5)(x + 2)' },
    { t: 'p', text: 'Inside: $-5 \\cdot 2 = -10$ and $-5 + 2 = -3$. Do not forget to write the $2$ in the final answer.' },
    { t: 'p', text: '### Some trinomials are prime' },
    { t: 'p', text: 'For $x^2 + 5x + 3$, the only factor pair of $3$ is $1 \\cdot 3$, which adds to $4$, not $5$. No pair of integers works, so $x^2 + 5x + 3$ is **prime**: it cannot be factored over the integers. Saying "prime" is a correct answer, not a failure.' },
    { t: 'callout', variant: 'tip', title: 'Always check by multiplying back', text: 'Multiplying your answer out takes 20 seconds and catches almost every sign mistake. If the product does not match the original exactly, the factoring is wrong.' },
  ],
  examples: [
    {
      title: 'Factor out the GCF',
      kind: 'introductory',
      problem: [{ t: 'p', text: 'Factor $8x^2 + 20x$ completely.' }],
      steps: [
        { text: 'Find the greatest number that divides both coefficients.', tex: '\\gcd(8, 20) = 4', why: 'Factors of $8$: $1, 2, 4, 8$. Factors of $20$: $1, 2, 4, 5, 10, 20$. The greatest one they share is $4$.' },
        { text: 'Find the lowest power of $x$ in every term.', tex: 'x^2 \\text{ and } x \\;\\Rightarrow\\; x', why: 'Both terms have at least one $x$, but $20x$ has only one, so only one $x$ can come out.' },
        { text: 'Divide each term by the GCF $4x$.', tex: '8x^2 + 20x = 4x(2x + 5)', why: '$8x^2 \\div 4x = 2x$ and $20x \\div 4x = 5$.' },
        { text: 'Check by multiplying back.', tex: '4x(2x + 5) = 8x^2 + 20x', why: 'The product matches the original, and $2x + 5$ has no common factor left, so this is completely factored.' },
      ],
      answer: '$8x^2 + 20x = 4x(2x + 5)$',
    },
    {
      title: 'A trinomial with all positive terms',
      kind: 'intermediate',
      problem: [{ t: 'p', text: 'Factor $x^2 + 11x + 24$.' }],
      steps: [
        { text: 'Decide the signs.', why: '$c = 24$ is positive and $b = 11$ is positive, so both numbers are positive.' },
        { text: 'List factor pairs of $24$ and their sums.', tex: '1 \\cdot 24 \\to 25, \\quad 2 \\cdot 12 \\to 14, \\quad 3 \\cdot 8 \\to 11, \\quad 4 \\cdot 6 \\to 10', why: 'We need a pair that multiplies to $c = 24$ and adds to $b = 11$, because $(x + p)(x + q) = x^2 + (p + q)x + pq$.' },
        { text: 'Write the factors using $3$ and $8$.', tex: 'x^2 + 11x + 24 = (x + 3)(x + 8)', why: '$3 \\cdot 8 = 24$ and $3 + 8 = 11$.' },
        { text: 'Check by multiplying back.', tex: '(x + 3)(x + 8) = x^2 + 8x + 3x + 24 = x^2 + 11x + 24', why: 'It matches. The order of the factors does not matter: $(x + 8)(x + 3)$ is the same answer.' },
      ],
      answer: '$(x + 3)(x + 8)$',
    },
    {
      title: 'A negative constant term',
      kind: 'intermediate',
      problem: [{ t: 'p', text: 'Factor $x^2 - 2x - 24$.' }],
      steps: [
        { text: 'Decide the signs.', why: '$c = -24$ is negative, so the two numbers have opposite signs. $b = -2$ is negative, so the bigger number (in size) is the negative one.' },
        { text: 'Look for a pair that multiplies to $-24$ and adds to $-2$.', tex: '1, -24 \\to -23, \\quad 2, -12 \\to -10, \\quad 3, -8 \\to -5, \\quad 4, -6 \\to -2', why: 'Only the bigger number is negative, so try each factor pair of $24$ with the larger one negative.' },
        { text: 'Write the factors.', tex: 'x^2 - 2x - 24 = (x + 4)(x - 6)', why: '$4 \\cdot (-6) = -24$ and $4 + (-6) = -2$.' },
        { text: 'Check by multiplying back.', tex: '(x + 4)(x - 6) = x^2 - 6x + 4x - 24 = x^2 - 2x - 24', why: 'The middle terms $-6x + 4x$ combine to $-2x$, matching the original.' },
      ],
      answer: '$(x + 4)(x - 6)$',
    },
    {
      title: 'A common mistake: right product, wrong sum',
      kind: 'common-mistake',
      problem: [{ t: 'p', text: 'A student factors $x^2 + 5x - 14$ as $(x + 2)(x - 7)$. Check the answer. If it is wrong, fix it.' }],
      steps: [
        { text: 'Multiply the student answer back out.', tex: '(x + 2)(x - 7) = x^2 - 7x + 2x - 14 = x^2 - 5x - 14', why: 'Multiplying back is the fastest way to test a factorization.' },
        { text: 'Compare with the original.', why: 'The product gives $-5x$, but the original has $+5x$. The student found numbers that multiply to $-14$ but add to $-5$ instead of $+5$. The sign on each number was backwards.' },
        { text: 'Choose the signs again.', tex: '-2 \\cdot 7 = -14, \\quad -2 + 7 = 5', why: '$c$ is negative, so the signs are opposite. $b = +5$ is positive, so the bigger number, $7$, must be the positive one.' },
        { text: 'Write and check the correct factors.', tex: '(x - 2)(x + 7) = x^2 + 7x - 2x - 14 = x^2 + 5x - 14', why: 'Now the product matches exactly.' },
      ],
      answer: 'The student is wrong. $x^2 + 5x - 14 = (x - 2)(x + 7)$.',
    },
    {
      title: 'Factoring the height of a tossed ball',
      kind: 'real-world',
      problem: [
        { t: 'p', text: 'A ball is tossed up from a 48-foot-high balcony. Its height in feet after $t$ seconds is $h(t) = -16t^2 + 32t + 48$. Factor the expression completely. Then use the factored form to find $h(1)$ and check it against the original.' },
        {
          t: 'graph',
          caption: 'Height of the ball over time. It starts at 48 feet, peaks at 64 feet after 1 second, and lands after 3 seconds.',
          spec: {
            xMin: -1,
            xMax: 4,
            yMin: -10,
            yMax: 70,
            xStep: 1,
            yStep: 10,
            xLabel: 't (seconds)',
            yLabel: 'h (feet)',
            functions: [{ expr: '-16x^2+32x+48', label: 'h(t)', domain: [0, 3] }],
            points: [
              { x: 0, y: 48, label: '(0, 48)' },
              { x: 1, y: 64, label: '(1, 64)' },
              { x: 3, y: 0, label: '(3, 0)' },
            ],
            ariaLabel: 'A downward-opening parabola for time 0 to 3 seconds, starting at height 48, rising to a peak of 64 at time 1, and reaching height 0 at time 3.',
          },
        },
      ],
      steps: [
        { text: 'Take out the GCF. Use a negative GCF because the leading coefficient is negative.', tex: '-16t^2 + 32t + 48 = -16(t^2 - 2t - 3)', why: '$16$ divides $16$, $32$ and $48$. Dividing by $-16$: $32 \\div (-16) = -2$ and $48 \\div (-16) = -3$, so every sign inside flips.' },
        { text: 'Factor the trinomial $t^2 - 2t - 3$.', tex: 't^2 - 2t - 3 = (t - 3)(t + 1)', why: 'We need numbers that multiply to $-3$ and add to $-2$: $-3$ and $1$.' },
        { text: 'Write the complete factorization.', tex: 'h(t) = -16(t - 3)(t + 1)', why: 'Keep the $-16$ in front; it is part of the factored form.' },
        { text: 'Check with $t = 1$ in both forms.', tex: '-16(1)^2 + 32(1) + 48 = 64, \\qquad -16(1 - 3)(1 + 1) = -16(-2)(2) = 64', why: 'Equal outputs for the same input is a quick test that the two forms match. Notice that the factor $t - 3$ equals $0$ when $t = 3$: that is when the ball lands, and next lessons use exactly that idea.' },
      ],
      answer: '$h(t) = -16(t - 3)(t + 1)$, and $h(1) = 64$ feet in both forms.',
    },
    {
      title: 'GCF with x, then a trinomial',
      kind: 'challenging',
      problem: [{ t: 'p', text: 'Factor $3x^3 - 12x^2 - 36x$ completely.' }],
      steps: [
        { text: 'Find the GCF.', tex: '\\gcd(3, 12, 36) = 3, \\text{ lowest power } x^1 \\;\\Rightarrow\\; 3x', why: '$3$ divides all three coefficients, and every term contains at least one $x$.' },
        { text: 'Factor out $3x$.', tex: '3x^3 - 12x^2 - 36x = 3x(x^2 - 4x - 12)', why: '$3x^3 \\div 3x = x^2$, $-12x^2 \\div 3x = -4x$, and $-36x \\div 3x = -12$.' },
        { text: 'Factor the trinomial inside.', tex: 'x^2 - 4x - 12 = (x - 6)(x + 2)', why: 'Numbers that multiply to $-12$ and add to $-4$: $-6$ and $2$.' },
        { text: 'Write the complete answer and check.', tex: '3x(x - 6)(x + 2) = 3x(x^2 - 4x - 12) = 3x^3 - 12x^2 - 36x', why: 'Multiply the binomials first, then distribute $3x$. It matches the original, and no factor can be broken down further.' },
      ],
      answer: '$3x(x - 6)(x + 2)$',
    },
  ],
  teachMeAgain: [
    {
      approach: 'visual',
      title: 'Build the rectangle',
      blocks: [
        { t: 'p', text: 'Think of $x^2 + 8x + 15$ as the area of a rectangle. The $x^2$ piece goes in one corner and the $15$ goes in the opposite corner.' },
        { t: 'p', text: 'The two leftover pieces must add to $8x$, and the numbers on the sides must multiply to $15$. Try $3$ and $5$: $3 \\cdot 5 = 15$ and $3x + 5x = 8x$.' },
        {
          t: 'table',
          caption: 'Area model for x squared + 8x + 15. The side lengths are x + 3 and x + 5.',
          headers: ['times', '$x$', '$+5$'],
          rows: [
            ['$x$', '$x^2$', '$5x$'],
            ['$+3$', '$3x$', '$15$'],
          ],
        },
        { t: 'p', text: 'Read the sides: $x^2 + 8x + 15 = (x + 3)(x + 5)$. If $x = 10$, the rectangle is $13$ by $15$, and $13 \\cdot 15 = 195 = 100 + 80 + 15$.' },
      ],
    },
    {
      approach: 'simpler-example',
      title: 'Start with small numbers',
      blocks: [
        { t: 'p', text: '$x^2 + 5x + 6$: which two numbers multiply to $6$ and add to $5$? $2$ and $3$. So $x^2 + 5x + 6 = (x + 2)(x + 3)$.' },
        { t: 'p', text: '$x^2 + 6x + 8$: multiply to $8$, add to $6$: $2$ and $4$. So $(x + 2)(x + 4)$.' },
        { t: 'p', text: '$x^2 - 5x + 6$: multiply to $+6$, add to $-5$: $-2$ and $-3$. So $(x - 2)(x - 3)$.' },
        { t: 'p', text: '$x^2 + x - 6$: multiply to $-6$, add to $+1$: $3$ and $-2$. So $(x + 3)(x - 2)$.' },
        { t: 'p', text: 'And a GCF: $5x + 10 = 5(x + 2)$, because $5$ divides both terms.' },
      ],
    },
    {
      approach: 'analogy',
      title: 'A number puzzle you already know',
      blocks: [
        { t: 'p', text: 'Factoring a trinomial is the classic "product and sum" puzzle: "I am thinking of two numbers. Their product is $12$ and their sum is $7$. What are they?" The answer, $3$ and $4$, is exactly what you need for $x^2 + 7x + 12 = (x + 3)(x + 4)$.' },
        { t: 'p', text: 'Taking out a GCF is like splitting a bill evenly. If three friends owe \\$12, \\$18 and \\$30, each total contains a \\$6 chunk: $6(2 + 3 + 5)$. In algebra, $12x^3 - 18x^2 + 30x = 6x(2x^2 - 3x + 5)$ pulls out the $6x$ chunk from every term.' },
      ],
    },
    {
      approach: 'prerequisite',
      title: 'Refresher: GCF of numbers and multiplying binomials',
      blocks: [
        {
          t: 'list',
          items: [
            'The GCF of $18$ and $24$: factors of $18$ are $1, 2, 3, 6, 9, 18$; factors of $24$ are $1, 2, 3, 4, 6, 8, 12, 24$. The greatest shared one is $6$.',
            'With variables, take the lowest power: the GCF of $x^3$ and $x^2$ is $x^2$, because $x^2$ divides both.',
            'Multiplying binomials: $(x + 2)(x + 6) = x^2 + 6x + 2x + 12 = x^2 + 8x + 12$. The last number is the **product** $2 \\cdot 6$, and the middle number is the **sum** $2 + 6$.',
            'That last fact, product gives $c$ and sum gives $b$, is the key to factoring.',
          ],
        },
      ],
    },
    {
      approach: 'step-by-step',
      title: 'A 5-step checklist',
      blocks: [
        { t: 'p', text: 'Factor $4x^2 + 4x - 48$.' },
        {
          t: 'list',
          ordered: true,
          items: [
            '**GCF?** All three coefficients are divisible by $4$: $4(x^2 + x - 12)$.',
            '**Signs?** Inside, $c = -12$ is negative, so the numbers have opposite signs; $b = +1$, so the bigger one is positive.',
            '**Product and sum:** multiply to $-12$, add to $1$: $4$ and $-3$.',
            '**Write it:** $4(x + 4)(x - 3)$. Keep the GCF in front.',
            '**Check:** $(x + 4)(x - 3) = x^2 + x - 12$, and $4(x^2 + x - 12) = 4x^2 + 4x - 48$. It matches.',
          ],
        },
      ],
    },
    {
      approach: 'alternate-strategy',
      title: 'Test with a number',
      blocks: [
        { t: 'p', text: 'Here is a second way to check a factorization: substitute an easy number for $x$ in both forms. If the factoring is right, the two values must be equal.' },
        { t: 'p', text: 'Is $x^2 - 9x + 20 = (x - 4)(x - 5)$? Try $x = 10$: the left side is $100 - 90 + 20 = 30$, and the right side is $(6)(5) = 30$. They match.' },
        { t: 'p', text: 'Is $x^2 + 5x - 14 = (x + 2)(x - 7)$? Try $x = 10$: the left side is $100 + 50 - 14 = 136$, and the right side is $(12)(3) = 36$. They do not match, so that factoring is wrong. (The correct one is $(x - 2)(x + 7)$: $(8)(17) = 136$.)' },
        { t: 'callout', variant: 'tip', text: 'One matching number is strong evidence, not proof. Multiplying the factors back out is the full check.' },
      ],
    },
  ],
  guided: [
    { generator: 'u4.factor-gcf', difficulty: 1 },
    { generator: 'u4.factor-trinomial', difficulty: 1 },
    { generator: 'u4.factor-gcf', difficulty: 1 },
    { generator: 'u4.factor-trinomial', difficulty: 1 },
  ],
  independent: {
    count: 8,
    reviewCount: 2,
    mix: [
      { generator: 'u4.factor-gcf', difficulty: 1, weight: 1 },
      { generator: 'u4.factor-gcf', difficulty: 2, weight: 2 },
      { generator: 'u4.factor-gcf', difficulty: 3, weight: 1 },
      { generator: 'u4.factor-trinomial', difficulty: 1, weight: 1 },
      { generator: 'u4.factor-trinomial', difficulty: 2, weight: 2 },
      { generator: 'u4.factor-trinomial', difficulty: 3, weight: 1 },
    ],
  },
  quiz: {
    items: [
      { generator: 'u4.factor-gcf', difficulty: 2 },
      { generator: 'u4.factor-gcf', difficulty: 3 },
      { generator: 'u4.factor-trinomial', difficulty: 2 },
      { generator: 'u4.factor-trinomial', difficulty: 2 },
      { generator: 'u4.factor-trinomial', difficulty: 3 },
      { generator: 'u4.factor-gcf', difficulty: 2 },
    ],
  },
  summary: [
    'Factoring undoes multiplying. Always look for a GCF first: the largest number dividing every coefficient times the lowest power of $x$ in every term, as in $12x^3 - 18x^2 + 30x = 6x(2x^2 - 3x + 5)$.',
    'To factor $x^2 + bx + c$, find two numbers that multiply to $c$ and add to $b$: $x^2 + 7x + 12 = (x + 3)(x + 4)$.',
    'Use the signs: $c$ positive means same signs (the sign of $b$); $c$ negative means opposite signs, with the bigger number taking the sign of $b$. If no pair works, the trinomial is prime.',
    'Check every answer by multiplying back out, and keep any GCF in the final answer: $2x^2 - 6x - 20 = 2(x - 5)(x + 2)$.',
  ],
  mastery: { quizPassScore: 0.8, practiceMinCorrect: 5 },
};
