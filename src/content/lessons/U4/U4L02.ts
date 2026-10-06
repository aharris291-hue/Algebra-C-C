import type { LessonContent } from '../../../core/curriculum/types';

/**
 * U4L02 Adding, Subtracting and Multiplying Polynomials (A.PAR.6.2)
 * Combining like terms, distributing the minus sign when subtracting, multiplying a monomial by a
 * polynomial, multiplying binomials with the area (box) model and FOIL, and closure (S4.02, S4.03).
 *
 * Math verified by hand (2026-10-06): every sum, difference, product, box-model cell, substitution check, area, perimeter and profit below was recomputed independently.
 */
export const U4L02: LessonContent = {
  lessonId: 'U4L02',
  goal: 'Add and subtract polynomials, like $(5x^2 - 3x + 4) - (2x^2 - 6x + 9) = 3x^2 + 3x - 5$, and multiply them, like $(x + 4)(x - 7) = x^2 - 3x - 28$, using the distributive property and the area model.',
  needToKnow: [
    { t: 'p', text: 'This lesson uses three things you already know:' },
    {
      t: 'list',
      items: [
        '**Like terms.** Terms with the same variable part combine: $3x + 5x = 8x$ and $4x^2 - x^2 = 3x^2$. But $x^2$ and $x$ are not like terms.',
        '**The distributive property.** $a(b + c) = ab + ac$, so $2(x + 5) = 2x + 10$ and $-3(x - 4) = -3x + 12$.',
        '**Multiplying powers.** $x \\cdot x = x^2$, because exponents add when the bases match: $x^1 \\cdot x^1 = x^{1+1}$.',
      ],
    },
    { t: 'callout', variant: 'tip', title: 'Quick check', text: 'Simplify $-2(x - 6)$. (You should get $-2x + 12$, because $(-2)(-6) = 12$.) If that felt shaky, open **Teach Me Again** and choose the refresher.' },
  ],
  vocabulary: [
    { term: 'polynomial', meaning: 'A sum of terms where each term is a number times a variable raised to a whole-number power, like $4x^2 - 3x + 1$.' },
    { term: 'like terms', meaning: 'Terms with exactly the same variable part, like $6x^2$ and $-2x^2$. Only like terms can be combined.' },
    { term: 'distributive property', meaning: '$a(b + c) = ab + ac$: multiply the outside by **every** term inside.' },
    { term: 'area model (box model)', meaning: 'A grid where each cell holds the product of one term from each factor. The cells add up to the full product.' },
    { term: 'FOIL', meaning: 'First, Outer, Inner, Last: a checklist for multiplying two binomials so no product is missed.' },
    { term: 'closure', meaning: 'A set is closed under an operation if doing it to members always gives a member. Polynomials are closed under adding, subtracting and multiplying.' },
  ],
  instruction: [
    { t: 'p', text: '### Adding polynomials: combine like terms' },
    { t: 'p', text: 'To add, drop the parentheses and combine like terms. It helps to line up like terms in columns:' },
    {
      t: 'table',
      caption: 'Adding 3x squared plus 5x minus 2 and x squared minus 7x plus 6, column by column.',
      headers: ['', '$x^2$ terms', '$x$ terms', 'constants'],
      rows: [
        ['first', '$3x^2$', '$+5x$', '$-2$'],
        ['second', '$+x^2$', '$-7x$', '$+6$'],
        ['sum', '$4x^2$', '$-2x$', '$+4$'],
      ],
    },
    { t: 'math', tex: '(3x^2 + 5x - 2) + (x^2 - 7x + 6) = 4x^2 - 2x + 4' },
    { t: 'callout', variant: 'why', title: 'Why x squared and x cannot combine', text: 'Think of $x^2$ as the area of an $x$ by $x$ square and $x$ as the area of a $1$ by $x$ strip. Three squares plus five strips is not eight of anything: the pieces are different shapes. That is why only like terms combine, just as $3$ quarters plus $5$ dimes is not $8$ quarters.' },
    { t: 'p', text: '### Subtracting polynomials: distribute the minus sign' },
    { t: 'p', text: 'A minus sign in front of parentheses means "subtract **all** of it." It works like multiplying by $-1$, so it changes the sign of **every** term inside:' },
    { t: 'math', tex: '(5x^2 - 3x + 4) - (2x^2 - 6x + 9) = 5x^2 - 3x + 4 - 2x^2 + 6x - 9' },
    { t: 'p', text: 'Now combine like terms: $5x^2 - 2x^2 = 3x^2$, $-3x + 6x = 3x$, and $4 - 9 = -5$.' },
    { t: 'math', tex: '= 3x^2 + 3x - 5' },
    { t: 'callout', variant: 'warning', title: 'The minus sign goes to every term', text: 'The most common mistake is changing only the first sign: writing $- 2x^2 - 6x + 9$ instead of $- 2x^2 + 6x - 9$. Subtracting $-6x$ is adding $6x$, and subtracting $+9$ is adding $-9$.' },
    { t: 'p', text: '**Check by substituting.** Pick an easy value like $x = 1$. The first polynomial is $5 - 3 + 4 = 6$ and the second is $2 - 6 + 9 = 5$, so the difference should be $6 - 5 = 1$. Our answer gives $3 + 3 - 5 = 1$. It matches.' },
    { t: 'p', text: '### Multiplying a monomial by a polynomial' },
    { t: 'p', text: 'Use the distributive property: multiply the monomial by each term. Multiply the coefficients and add the exponents.' },
    { t: 'math', tex: '3x(2x - 5) = 3x \\cdot 2x + 3x \\cdot (-5) = 6x^2 - 15x' },
    { t: 'p', text: '$3x \\cdot 2x = (3 \\cdot 2)(x \\cdot x) = 6x^2$, and $3x \\cdot (-5) = -15x$.' },
    { t: 'p', text: '### Multiplying two binomials: the area model' },
    { t: 'p', text: 'To multiply $(x + 4)(x - 7)$, make a box. Put one factor across the top and the other down the side. Each cell is the product of its row and column, just like the area of a small rectangle:' },
    {
      t: 'table',
      caption: 'Area model for (x + 4)(x - 7).',
      headers: ['times', '$x$', '$-7$'],
      rows: [
        ['$x$', '$x^2$', '$-7x$'],
        ['$4$', '$4x$', '$-28$'],
      ],
    },
    { t: 'p', text: 'Add all four cells, then combine the like terms $-7x + 4x = -3x$:' },
    { t: 'math', tex: '(x + 4)(x - 7) = x^2 - 7x + 4x - 28 = x^2 - 3x - 28' },
    { t: 'callout', variant: 'why', title: 'Why the box works', text: 'The box is the distributive property used twice: $(x + 4)(x - 7) = x(x - 7) + 4(x - 7) = (x^2 - 7x) + (4x - 28)$. The top row of the box is $x(x - 7)$ and the bottom row is $4(x - 7)$. Every term of one factor meets every term of the other exactly once.' },
    { t: 'p', text: '**FOIL** gives the same four products in a fixed order: **F**irst $x \\cdot x$, **O**uter $x \\cdot (-7)$, **I**nner $4 \\cdot x$, **L**ast $4 \\cdot (-7)$. FOIL only works for two binomials; the box works for any size.' },
    { t: 'p', text: '**Check:** at $x = 2$, $(2 + 4)(2 - 7) = 6 \\cdot (-5) = -30$, and $2^2 - 3(2) - 28 = 4 - 6 - 28 = -30$. It matches.' },
    { t: 'p', text: '### Closure' },
    { t: 'p', text: 'Add, subtract or multiply two polynomials and the answer is always another polynomial: whole-number exponents stay whole numbers when you add them, and coefficients stay numbers. So polynomials are **closed** under addition, subtraction and multiplication, just like the integers.' },
    { t: 'callout', variant: 'realworld', title: 'Profit is a subtraction', text: 'A team selling hoodies has revenue $R = -2x^2 + 60x$ and cost $C = 10x + 150$ (in dollars, for $x$ hoodies). Profit is $R - C = -2x^2 + 60x - 10x - 150 = -2x^2 + 50x - 150$. Notice the minus sign changed both $+10x$ and $+150$. At $x = 10$: revenue \\$400, cost \\$250, profit \\$150, and $-2(100) + 500 - 150 = 150$.' },
  ],
  examples: [
    {
      title: 'Add two polynomials',
      kind: 'introductory',
      problem: [{ t: 'p', text: 'Add $(2x^2 + 3x - 4) + (x^2 - 5x + 9)$.' }],
      steps: [
        { text: 'Remove the parentheses.', tex: '2x^2 + 3x - 4 + x^2 - 5x + 9', why: 'Adding a group is the same as adding each of its terms, so the signs inside stay the same.' },
        { text: 'Group like terms.', tex: '(2x^2 + x^2) + (3x - 5x) + (-4 + 9)', why: 'Only terms with the same variable part can combine. Addition can be regrouped in any order.' },
        { text: 'Combine.', tex: '3x^2 - 2x + 5', why: '$2 + 1 = 3$, $3 - 5 = -2$, and $-4 + 9 = 5$.' },
        { text: 'Check at $x = 1$.', tex: '(2 + 3 - 4) + (1 - 5 + 9) = 1 + 5 = 6, \\qquad 3 - 2 + 5 = 6', why: 'The original and the answer give the same value.' },
      ],
      answer: '$3x^2 - 2x + 5$',
    },
    {
      title: 'Multiply a monomial by a binomial',
      kind: 'intermediate',
      problem: [{ t: 'p', text: 'Multiply $-4x(3x - 2)$.' }],
      steps: [
        { text: 'Distribute $-4x$ to each term.', tex: '(-4x)(3x) + (-4x)(-2)', why: 'The distributive property: the outside multiplies every term inside, including its sign.' },
        { text: 'Multiply the first pair.', tex: '(-4x)(3x) = -12x^2', why: 'Coefficients: $(-4)(3) = -12$. Variables: $x \\cdot x = x^2$.' },
        { text: 'Multiply the second pair.', tex: '(-4x)(-2) = 8x', why: 'A negative times a negative is positive: $(-4)(-2) = 8$.' },
        { text: 'Write the result and check at $x = 1$.', tex: '-12x^2 + 8x; \\qquad -4(1)(3 - 2) = -4, \\quad -12 + 8 = -4', why: 'There are no like terms to combine, and the check matches.' },
      ],
      answer: '$-12x^2 + 8x$',
    },
    {
      title: 'Multiply two binomials with a box',
      kind: 'intermediate',
      problem: [{ t: 'p', text: 'Multiply $(x + 6)(x - 2)$.' }],
      steps: [
        { text: 'Set up the box with $x$ and $6$ down the side, $x$ and $-2$ across the top, and fill each cell.', tex: 'x \\cdot x = x^2, \\quad x \\cdot (-2) = -2x, \\quad 6 \\cdot x = 6x, \\quad 6 \\cdot (-2) = -12', why: 'Each cell is the product of its row term and column term, so every term of one binomial meets every term of the other.' },
        { text: 'Add the four cells.', tex: 'x^2 - 2x + 6x - 12', why: 'The full product is the sum of all the pieces, like the total area of the four small rectangles.' },
        { text: 'Combine the like terms in the middle.', tex: 'x^2 + 4x - 12', why: '$-2x + 6x = 4x$. The two $x$ terms always land on the diagonal of the box.' },
        { text: 'Check at $x = 3$.', tex: '(3 + 6)(3 - 2) = 9, \\qquad 9 + 12 - 12 = 9', why: 'Both give $9$.' },
      ],
      answer: '$x^2 + 4x - 12$',
    },
    {
      title: 'A common mistake: subtracting only the first term',
      kind: 'common-mistake',
      problem: [{ t: 'p', text: 'A student simplifies $(4x^2 + 2x - 3) - (x^2 - 5x + 6)$ and gets $3x^2 - 3x + 3$. Find the mistake and fix it.' }],
      steps: [
        { text: 'See what the student did.', why: 'The student subtracted $x^2$ but then kept $-5x$ and $+6$ as they were: $2x - 5x = -3x$ and $-3 + 6 = 3$. The minus sign only reached the first term.' },
        { text: 'Distribute the minus sign to every term.', tex: '4x^2 + 2x - 3 - x^2 + 5x - 6', why: 'Subtracting the whole group is multiplying it by $-1$: $-(x^2) = -x^2$, $-(-5x) = +5x$, $-(+6) = -6$.' },
        { text: 'Combine like terms.', tex: '3x^2 + 7x - 9', why: '$4 - 1 = 3$, $2 + 5 = 7$, and $-3 - 6 = -9$.' },
        { text: 'Check at $x = 1$.', tex: '(4 + 2 - 3) - (1 - 5 + 6) = 3 - 2 = 1', why: 'The correct answer gives $3 + 7 - 9 = 1$. The student answer gives $3 - 3 + 3 = 3$, which does not match.' },
      ],
      answer: '$3x^2 + 7x - 9$',
    },
    {
      title: 'Area and perimeter of a game map',
      kind: 'real-world',
      problem: [{ t: 'p', text: 'A rectangular level in a video game is $2x + 3$ tiles long and $x + 5$ tiles wide. Write expressions for its perimeter and its area. Then check both when $x = 10$.' }],
      steps: [
        { text: 'Perimeter: add all four sides.', tex: '2(2x + 3) + 2(x + 5) = 4x + 6 + 2x + 10 = 6x + 16', why: 'A rectangle has two lengths and two widths. Distribute the $2$s, then combine like terms.' },
        { text: 'Area: multiply length by width with a box.', tex: '2x \\cdot x = 2x^2, \\quad 2x \\cdot 5 = 10x, \\quad 3 \\cdot x = 3x, \\quad 3 \\cdot 5 = 15', why: 'Each cell is one term of $2x + 3$ times one term of $x + 5$.' },
        { text: 'Add the cells.', tex: '(2x + 3)(x + 5) = 2x^2 + 10x + 3x + 15 = 2x^2 + 13x + 15', why: '$10x + 3x = 13x$.' },
        { text: 'Check at $x = 10$.', tex: '\\text{length } 23, \\text{ width } 15: \\quad P = 2(23) + 2(15) = 76, \\quad A = 23 \\cdot 15 = 345', why: 'The expressions agree: $6(10) + 16 = 76$ and $2(100) + 13(10) + 15 = 345$.' },
      ],
      answer: 'Perimeter $6x + 16$ tiles; area $2x^2 + 13x + 15$ square tiles. At $x = 10$: $76$ and $345$.',
    },
    {
      title: 'Binomials with leading coefficients',
      kind: 'challenging',
      problem: [{ t: 'p', text: 'Multiply $(2x - 3)(3x + 5)$.' }],
      steps: [
        { text: 'First and Last.', tex: '(2x)(3x) = 6x^2, \\qquad (-3)(5) = -15', why: 'Multiply the coefficients and the variables separately. Keep the $-3$ negative: it is the second term of the first binomial.' },
        { text: 'Outer and Inner.', tex: '(2x)(5) = 10x, \\qquad (-3)(3x) = -9x', why: 'These are the two remaining cells of the box. They are the only like terms.' },
        { text: 'Add and combine.', tex: '6x^2 + 10x - 9x - 15 = 6x^2 + x - 15', why: '$10x - 9x = 1x$, written as $x$.' },
        { text: 'Check at $x = 2$.', tex: '(4 - 3)(6 + 5) = 1 \\cdot 11 = 11, \\qquad 6(4) + 2 - 15 = 11', why: 'Both sides give $11$, so the product is right.' },
      ],
      answer: '$6x^2 + x - 15$',
    },
  ],
  teachMeAgain: [
    {
      approach: 'visual',
      title: 'Build the rectangle',
      blocks: [
        { t: 'p', text: 'Picture a rectangle that is $x + 2$ wide and $x + 3$ tall. Cut it into four pieces along the plus signs:' },
        {
          t: 'table',
          caption: 'The rectangle for (x + 3)(x + 2) split into four pieces.',
          headers: ['times', '$x$', '$2$'],
          rows: [
            ['$x$', '$x^2$ (big square)', '$2x$ (strip)'],
            ['$3$', '$3x$ (strip)', '$6$ (small corner)'],
          ],
        },
        { t: 'p', text: 'Total area: $x^2 + 2x + 3x + 6 = x^2 + 5x + 6$. The two strips are like terms, so they combine. The big square and the corner are different shapes, so they stay separate.' },
      ],
    },
    {
      approach: 'simpler-example',
      title: 'Try it with plain numbers',
      blocks: [
        { t: 'p', text: 'You can multiply $12 \\cdot 13$ the same way, by writing $12 = 10 + 2$ and $13 = 10 + 3$:' },
        {
          t: 'table',
          caption: 'Area model for 12 times 13.',
          headers: ['times', '$10$', '$3$'],
          rows: [
            ['$10$', '$100$', '$30$'],
            ['$2$', '$20$', '$6$'],
          ],
        },
        { t: 'p', text: '$100 + 30 + 20 + 6 = 156$, and $12 \\cdot 13 = 156$. Polynomials work exactly like this, with $x$ in place of $10$: $(x + 2)(x + 3) = x^2 + 3x + 2x + 6 = x^2 + 5x + 6$.' },
      ],
    },
    {
      approach: 'analogy',
      title: 'Returning a whole bag',
      blocks: [
        { t: 'p', text: 'Subtracting a polynomial is like returning a whole bag of items to the store. You do not return only the first item; everything in the bag goes back.' },
        { t: 'p', text: 'If the bag holds $2x^2$, a coupon worth $-6x$, and $9$, returning it takes away $2x^2$, takes away the coupon (which **adds** $6x$ back), and takes away $9$:' },
        { t: 'math', tex: '-(2x^2 - 6x + 9) = -2x^2 + 6x - 9' },
        { t: 'p', text: 'Every sign inside flips.' },
      ],
    },
    {
      approach: 'prerequisite',
      title: 'Refresher: like terms, signs and exponents',
      blocks: [
        {
          t: 'list',
          items: [
            'Like terms have the **same variable and exponent**: $5x^2$ and $-x^2$ are like; $5x^2$ and $5x$ are not.',
            'Sign rules: $(-3)(4) = -12$, $(-3)(-4) = 12$. Subtracting a negative adds: $2 - (-5) = 7$.',
            'Multiplying powers adds exponents: $x \\cdot x = x^2$, $2x \\cdot 4x = 8x^2$.',
            'Distribute to every term: $-2(x^2 - 3x + 1) = -2x^2 + 6x - 2$.',
          ],
        },
      ],
    },
    {
      approach: 'step-by-step',
      title: 'A checklist for each operation',
      blocks: [
        {
          t: 'list',
          ordered: true,
          items: [
            '**Adding:** drop the parentheses, keep every sign, combine like terms.',
            '**Subtracting:** change the sign of **every** term in the second polynomial, then add.',
            '**Monomial times polynomial:** multiply the monomial by each term (coefficients multiply, exponents add).',
            '**Binomial times binomial:** make a $2$ by $2$ box (or use FOIL), fill all four cells, then combine the two middle terms.',
            '**Check:** substitute $x = 1$ or $x = 2$ into the original and your answer.',
          ],
        },
      ],
    },
    {
      approach: 'alternate-strategy',
      title: 'Distribute twice instead of a box',
      blocks: [
        { t: 'p', text: 'Split the first binomial and distribute each part across the second one:' },
        { t: 'math', tex: '(x - 5)(x + 3) = x(x + 3) - 5(x + 3)' },
        { t: 'math', tex: '= x^2 + 3x - 5x - 15 = x^2 - 2x - 15' },
        { t: 'p', text: 'Notice the $-5$ is distributed with its sign: $-5 \\cdot 3 = -15$. Check at $x = 1$: $(1 - 5)(1 + 3) = -16$, and $1 - 2 - 15 = -16$.' },
        { t: 'callout', variant: 'tip', text: 'Box, FOIL and distributing twice all give the same four products. Use whichever one helps you not miss a product.' },
      ],
    },
  ],
  guided: [
    { generator: 'u4.add-sub-poly', difficulty: 1 },
    { generator: 'u4.multiply-poly', difficulty: 1 },
    { generator: 'u4.add-sub-poly', difficulty: 1 },
    { generator: 'u4.multiply-poly', difficulty: 1 },
  ],
  independent: {
    count: 8,
    reviewCount: 2,
    mix: [
      { generator: 'u4.add-sub-poly', difficulty: 1, weight: 1 },
      { generator: 'u4.add-sub-poly', difficulty: 2, weight: 2 },
      { generator: 'u4.add-sub-poly', difficulty: 3, weight: 1 },
      { generator: 'u4.multiply-poly', difficulty: 1, weight: 1 },
      { generator: 'u4.multiply-poly', difficulty: 2, weight: 2 },
      { generator: 'u4.multiply-poly', difficulty: 3, weight: 1 },
    ],
  },
  quiz: {
    items: [
      { generator: 'u4.add-sub-poly', difficulty: 2 },
      { generator: 'u4.add-sub-poly', difficulty: 2 },
      { generator: 'u4.add-sub-poly', difficulty: 3 },
      { generator: 'u4.multiply-poly', difficulty: 2 },
      { generator: 'u4.multiply-poly', difficulty: 2 },
      { generator: 'u4.multiply-poly', difficulty: 3 },
    ],
  },
  summary: [
    'To add polynomials, combine like terms: only terms with the same variable part, like $3x^2$ and $x^2$, can combine.',
    'To subtract, change the sign of **every** term being subtracted: $-(2x^2 - 6x + 9) = -2x^2 + 6x - 9$.',
    'To multiply, distribute every term of one factor to every term of the other. A box or FOIL keeps track: $(x + 4)(x - 7) = x^2 - 7x + 4x - 28 = x^2 - 3x - 28$.',
    'Check any answer by substituting a small number like $x = 1$ into both the original and your result.',
  ],
  mastery: { quizPassScore: 0.8, practiceMinCorrect: 5 },
};
