import type { LessonContent } from '../../../core/curriculum/types';

/**
 * U3L03 Operations with Radicals (A.NR.5.1, A.NR.5.2)
 * Like radicals, simplifying before adding, multiplying radicals and coefficients, the distributive
 * property and FOIL, radicals with variables, and the link to closure (S3.05, S3.06, S3.07).
 *
 * Math verified by hand (2026-10-06): every sum, product, FOIL expansion, variable simplification and decimal check below was recomputed independently.
 */
export const U3L03: LessonContent = {
  lessonId: 'U3L03',
  goal: 'Add, subtract and multiply radical expressions, like $\\sqrt{12} + \\sqrt{27} = 5\\sqrt{3}$, $\\sqrt[3]{54} + 4\\sqrt[3]{2} = 7\\sqrt[3]{2}$ and $(3 + \\sqrt{2})(3 - \\sqrt{2}) = 7$, and simplify radicals that contain variables.',
  needToKnow: [
    { t: 'p', text: 'This lesson uses three things you already know:' },
    {
      t: 'list',
      items: [
        '**Simplest radical form.** Pull out the largest perfect square: $\\sqrt{72} = \\sqrt{36} \\cdot \\sqrt{2} = 6\\sqrt{2}$.',
        '**Combining like terms.** $3x + 4x = 7x$, but $3x + 4y$ cannot be combined.',
        '**The distributive property.** $2(x + 5) = 2x + 10$, and $(x + 2)(x + 3) = x^2 + 3x + 2x + 6 = x^2 + 5x + 6$.',
      ],
    },
    { t: 'callout', variant: 'tip', title: 'Quick check', text: 'Simplify $\\sqrt{12}$. (You should get $2\\sqrt{3}$, since $12 = 4 \\cdot 3$.) If that felt shaky, open **Teach Me Again** and choose the refresher.' },
  ],
  vocabulary: [
    { term: 'like radicals', meaning: 'Radicals with the same index and the same radicand, like $3\\sqrt{5}$ and $-2\\sqrt{5}$.' },
    { term: 'coefficient', meaning: 'The number multiplying a radical. In $7\\sqrt{2}$, the coefficient is $7$.' },
    { term: 'FOIL', meaning: 'First, Outer, Inner, Last: a way to make sure you multiply every term of one binomial by every term of the other.' },
    { term: 'conjugates', meaning: 'A pair like $3 + \\sqrt{2}$ and $3 - \\sqrt{2}$. Their product has no radical.' },
  ],
  instruction: [
    { t: 'p', text: '### Adding and subtracting: like radicals' },
    { t: 'p', text: 'Radicals combine just like like terms. Treat $\\sqrt{5}$ as the "unit," the way $x$ is the unit in $3x + 4x$. Add or subtract the coefficients and keep the radical the same:' },
    { t: 'math', tex: '3\\sqrt{5} + 4\\sqrt{5} = 7\\sqrt{5} \\qquad\\qquad 6\\sqrt{2} - \\sqrt{2} = 5\\sqrt{2}' },
    { t: 'p', text: 'Radicals are **like** only when they have the same index **and** the same radicand. $\\sqrt{5}$ and $\\sqrt{3}$ are not like, and neither are $\\sqrt{2}$ and $\\sqrt[3]{2}$. So $2\\sqrt{5} + 2\\sqrt{3}$ is already as simple as it gets.' },
    { t: 'p', text: '### Simplify first, then combine' },
    { t: 'p', text: 'Radicals that look different may become like radicals after you simplify them:' },
    { t: 'math', tex: '\\sqrt{12} + \\sqrt{27} = \\sqrt{4}\\sqrt{3} + \\sqrt{9}\\sqrt{3} = 2\\sqrt{3} + 3\\sqrt{3} = 5\\sqrt{3}' },
    { t: 'callout', variant: 'warning', title: 'You cannot add under the root', text: 'The square root of a sum is **not** the sum of the square roots. Test it with perfect squares: $\\sqrt{9} + \\sqrt{16} = 3 + 4 = 7$, but $\\sqrt{9 + 16} = \\sqrt{25} = 5$. Since $7 \\ne 5$, the rule $\\sqrt{a} + \\sqrt{b} = \\sqrt{a + b}$ is false.' },
    { t: 'p', text: '### Multiplying radicals' },
    { t: 'p', text: 'Multiplying uses the product property backward: $\\sqrt{a} \\cdot \\sqrt{b} = \\sqrt{ab}$. Multiply the radicands, then simplify.' },
    { t: 'math', tex: '\\sqrt{6} \\cdot \\sqrt{3} = \\sqrt{18} = \\sqrt{9} \\cdot \\sqrt{2} = 3\\sqrt{2}' },
    { t: 'p', text: 'With coefficients, multiply **outside times outside** and **inside times inside**:' },
    { t: 'math', tex: '(2\\sqrt{5})(3\\sqrt{10}) = (2 \\cdot 3)\\sqrt{5 \\cdot 10} = 6\\sqrt{50} = 6 \\cdot 5\\sqrt{2} = 30\\sqrt{2}' },
    { t: 'callout', variant: 'tip', title: 'Adding and multiplying follow different rules', text: 'To **add**, the radicals must be like, and the radicand stays the same: $2\\sqrt{3} + 5\\sqrt{3} = 7\\sqrt{3}$. To **multiply**, any two square roots work, and the radicands multiply: $\\sqrt{2} \\cdot \\sqrt{7} = \\sqrt{14}$.' },
    { t: 'p', text: '### Cube roots follow the same rules' },
    { t: 'p', text: 'Like cube roots combine just like like square roots, and the product rule works for cube roots too: $\\sqrt[3]{a} \\cdot \\sqrt[3]{b} = \\sqrt[3]{ab}$. The only change is that you look for perfect **cubes** ($8, 27, 64, 125, \\ldots$) instead of perfect squares.' },
    { t: 'math', tex: '\\sqrt[3]{54} + 4\\sqrt[3]{2} = \\sqrt[3]{27}\\sqrt[3]{2} + 4\\sqrt[3]{2} = 3\\sqrt[3]{2} + 4\\sqrt[3]{2} = 7\\sqrt[3]{2}' },
    { t: 'math', tex: '\\sqrt[3]{4} \\cdot \\sqrt[3]{6} = \\sqrt[3]{24} = \\sqrt[3]{8} \\cdot \\sqrt[3]{3} = 2\\sqrt[3]{3}' },
    { t: 'callout', variant: 'warning', title: 'Cube roots need perfect cubes', text: '$54 = 9 \\cdot 6$, but $9$ is a perfect **square**, not a perfect cube, so it does not come out of a cube root. Use $54 = 27 \\cdot 2$ instead. Also, $\\sqrt{2}$ and $\\sqrt[3]{2}$ are **not** like radicals: they have different indexes.' },
    { t: 'p', text: '### The distributive property and FOIL' },
    { t: 'p', text: 'Distribute exactly as you would with variables:' },
    { t: 'math', tex: '\\sqrt{2}(3 + \\sqrt{6}) = 3\\sqrt{2} + \\sqrt{12} = 3\\sqrt{2} + 2\\sqrt{3}' },
    { t: 'p', text: 'For two binomials, use FOIL. A special case happens with **conjugates**:' },
    { t: 'math', tex: '(3 + \\sqrt{2})(3 - \\sqrt{2}) = 9 - 3\\sqrt{2} + 3\\sqrt{2} - \\sqrt{2}\\sqrt{2} = 9 - 2 = 7' },
    { t: 'p', text: 'The middle terms cancel and $\\sqrt{2} \\cdot \\sqrt{2} = 2$, so the product is the rational number $7$.' },
    { t: 'p', text: '### Radicals with variables' },
    { t: 'callout', variant: 'vocab', title: 'Assume variables are positive', text: 'In this lesson every variable stands for a positive number, so a root like $\\sqrt{x^2}$ is simply $x$.' },
    { t: 'p', text: 'A square root undoes squaring, so it **halves an even exponent**: $\\sqrt{x^6} = x^3$, because $x^3 \\cdot x^3 = x^6$. For an odd exponent, split off one factor, which stays inside:' },
    { t: 'math', tex: '\\sqrt{x^5} = \\sqrt{x^4 \\cdot x} = x^2\\sqrt{x}' },
    { t: 'p', text: 'Do the number and the variable together:' },
    { t: 'math', tex: '\\sqrt{18x^5} = \\sqrt{9x^4} \\cdot \\sqrt{2x} = 3x^2\\sqrt{2x}' },
    { t: 'p', text: 'A cube root takes out **multiples of 3** in the exponent: $\\sqrt[3]{x^9} = x^3$, and $\\sqrt[3]{16x^7} = \\sqrt[3]{8x^6} \\cdot \\sqrt[3]{2x} = 2x^2\\sqrt[3]{2x}$.' },
    { t: 'p', text: '### Connecting to closure' },
    { t: 'p', text: 'Operations on irrational radicals can give either kind of number. The sum $\\sqrt{2} + \\sqrt{8} = \\sqrt{2} + 2\\sqrt{2} = 3\\sqrt{2}$ is irrational. But the product $\\sqrt{3} \\cdot \\sqrt{12} = \\sqrt{36} = 6$ is rational. That is why the irrational numbers are **not closed** under multiplication.' },
  ],
  examples: [
    {
      title: 'Combine like radicals',
      kind: 'introductory',
      problem: [{ t: 'p', text: 'Simplify $6\\sqrt{5} + 2\\sqrt{3} - 4\\sqrt{5}$.' }],
      steps: [
        { text: 'Find the like radicals.', tex: '6\\sqrt{5} \\text{ and } -4\\sqrt{5}', why: 'They have the same index (square root) and the same radicand ($5$). The $2\\sqrt{3}$ has a different radicand.' },
        { text: 'Combine their coefficients.', tex: '6\\sqrt{5} - 4\\sqrt{5} = 2\\sqrt{5}', why: 'Just like $6x - 4x = 2x$: subtract the coefficients and keep $\\sqrt{5}$.' },
        { text: 'Write the result.', tex: '2\\sqrt{5} + 2\\sqrt{3}', why: '$\\sqrt{5}$ and $\\sqrt{3}$ are not like radicals, and neither one simplifies, so this is the final answer.' },
      ],
      answer: '$2\\sqrt{5} + 2\\sqrt{3}$',
    },
    {
      title: 'A common mistake: adding under the root',
      kind: 'common-mistake',
      problem: [{ t: 'p', text: 'A student writes $\\sqrt{8} + \\sqrt{2} = \\sqrt{10}$. What went wrong, and what is the correct sum?' }],
      steps: [
        { text: 'Test the student rule with perfect squares.', tex: '\\sqrt{9} + \\sqrt{16} = 3 + 4 = 7, \\quad \\sqrt{9 + 16} = \\sqrt{25} = 5', why: 'If adding under the root worked, these would be equal. $7 \\ne 5$, so the rule $\\sqrt{a} + \\sqrt{b} = \\sqrt{a + b}$ is false.' },
        { text: 'Simplify $\\sqrt{8}$.', tex: '\\sqrt{8} = \\sqrt{4} \\cdot \\sqrt{2} = 2\\sqrt{2}', why: 'Simplify first to see whether the radicals are like.' },
        { text: 'Add the like radicals.', tex: '2\\sqrt{2} + \\sqrt{2} = 3\\sqrt{2}', why: '$\\sqrt{2}$ means $1\\sqrt{2}$, so the coefficients add: $2 + 1 = 3$.' },
        { text: 'Check with decimals.', tex: '\\sqrt{8} + \\sqrt{2} \\approx 2.83 + 1.41 = 4.24, \\quad 3\\sqrt{2} \\approx 4.24, \\quad \\sqrt{10} \\approx 3.16', why: '$3\\sqrt{2}$ matches; $\\sqrt{10}$ does not.' },
      ],
      answer: '$\\sqrt{8} + \\sqrt{2} = 3\\sqrt{2}$, not $\\sqrt{10}$.',
    },
    {
      title: 'Multiply radicals with coefficients',
      kind: 'intermediate',
      problem: [{ t: 'p', text: 'Multiply and simplify $(2\\sqrt{5})(3\\sqrt{10})$.' }],
      steps: [
        { text: 'Multiply the coefficients.', tex: '2 \\cdot 3 = 6', why: 'Multiplication can be done in any order, so group the outside numbers together.' },
        { text: 'Multiply the radicands.', tex: '\\sqrt{5} \\cdot \\sqrt{10} = \\sqrt{50}', why: 'Product property: $\\sqrt{a} \\cdot \\sqrt{b} = \\sqrt{ab}$.' },
        { text: 'Simplify the radical.', tex: '6\\sqrt{50} = 6 \\cdot \\sqrt{25} \\cdot \\sqrt{2} = 6 \\cdot 5\\sqrt{2}', why: '$25$ is the largest perfect square that divides $50$.' },
        { text: 'Multiply.', tex: '6 \\cdot 5\\sqrt{2} = 30\\sqrt{2}', why: 'The $5$ that came out of the root multiplies the coefficient $6$.' },
      ],
      answer: '$30\\sqrt{2}$',
    },
    {
      title: 'FOIL with radicals',
      kind: 'challenging',
      problem: [{ t: 'p', text: 'Multiply and simplify $(2\\sqrt{3} + 1)(\\sqrt{3} - 4)$.' }],
      steps: [
        { text: 'First.', tex: '2\\sqrt{3} \\cdot \\sqrt{3} = 2 \\cdot 3 = 6', why: '$\\sqrt{3} \\cdot \\sqrt{3} = \\sqrt{9} = 3$.' },
        { text: 'Outer.', tex: '2\\sqrt{3} \\cdot (-4) = -8\\sqrt{3}', why: 'Multiply the coefficients $2$ and $-4$; the $\\sqrt{3}$ stays.' },
        { text: 'Inner.', tex: '1 \\cdot \\sqrt{3} = \\sqrt{3}' },
        { text: 'Last.', tex: '1 \\cdot (-4) = -4' },
        { text: 'Combine like terms.', tex: '6 - 8\\sqrt{3} + \\sqrt{3} - 4 = 2 - 7\\sqrt{3}', why: 'Numbers combine with numbers ($6 - 4 = 2$) and $\\sqrt{3}$ terms with $\\sqrt{3}$ terms ($-8 + 1 = -7$).' },
        { text: 'Check with decimals.', tex: '(4.464)(-2.268) \\approx -10.12, \\quad 2 - 7(1.732) \\approx -10.12', why: 'Using $\\sqrt{3} \\approx 1.732$, both forms give the same value.' },
      ],
      answer: '$2 - 7\\sqrt{3}$',
    },
    {
      title: 'Adding and multiplying cube roots',
      kind: 'intermediate',
      problem: [{ t: 'p', text: 'Simplify (a) $\\sqrt[3]{16} - 5\\sqrt[3]{2}$ and (b) $(2\\sqrt[3]{5})(3\\sqrt[3]{25})$.' }],
      steps: [
        { text: '(a) Simplify $\\sqrt[3]{16}$.', tex: '\\sqrt[3]{16} = \\sqrt[3]{8} \\cdot \\sqrt[3]{2} = 2\\sqrt[3]{2}', why: '$8 = 2^3$ is the largest perfect cube that divides $16$.' },
        { text: '(a) Combine the like cube roots.', tex: '2\\sqrt[3]{2} - 5\\sqrt[3]{2} = -3\\sqrt[3]{2}', why: 'Both terms are cube roots of $2$, so subtract the coefficients: $2 - 5 = -3$.' },
        { text: '(b) Multiply outside times outside and inside times inside.', tex: '(2 \\cdot 3)\\sqrt[3]{5 \\cdot 25} = 6\\sqrt[3]{125}', why: 'The product rule $\\sqrt[3]{a} \\cdot \\sqrt[3]{b} = \\sqrt[3]{ab}$ works for cube roots just as it does for square roots.' },
        { text: '(b) Take the cube root.', tex: '6\\sqrt[3]{125} = 6 \\cdot 5 = 30', why: '$5 \\cdot 5 \\cdot 5 = 125$, so $\\sqrt[3]{125} = 5$ and the product is rational.' },
        { text: 'Check (a) with decimals.', tex: '\\sqrt[3]{16} - 5\\sqrt[3]{2} \\approx 2.520 - 6.300 = -3.780, \\quad -3\\sqrt[3]{2} \\approx -3.780', why: 'Using $\\sqrt[3]{2} \\approx 1.260$, both forms agree.' },
      ],
      answer: '(a) $-3\\sqrt[3]{2}$; (b) $30$.',
    },
    {
      title: 'A radical with variables',
      kind: 'intermediate',
      problem: [{ t: 'p', text: 'Simplify $\\sqrt{18x^5}$. Assume $x$ is positive.' }],
      steps: [
        { text: 'Split the number into a perfect square times the rest.', tex: '18 = 9 \\cdot 2', why: '$9$ is the largest perfect square that divides $18$.' },
        { text: 'Split the variable into the largest even power times the rest.', tex: 'x^5 = x^4 \\cdot x', why: 'Even exponents come out of a square root cleanly. $4$ is the largest even number not more than $5$.' },
        { text: 'Group the perfect squares and take their root.', tex: '\\sqrt{9x^4} \\cdot \\sqrt{2x} = 3x^2\\sqrt{2x}', why: '$\\sqrt{9} = 3$ and $\\sqrt{x^4} = x^2$ because $x^2 \\cdot x^2 = x^4$.' },
        { text: 'Check by squaring the outside part.', tex: '(3x^2)^2 \\cdot 2x = 9x^4 \\cdot 2x = 18x^5', why: 'Putting the outside part back under the root gives the original radicand.' },
      ],
      answer: '$3x^2\\sqrt{2x}$',
    },
    {
      title: 'Perimeter and area of a garden',
      kind: 'real-world',
      problem: [{ t: 'p', text: 'A rectangular garden bed is $\\sqrt{50}$ feet long and $\\sqrt{8}$ feet wide. Find its exact perimeter and area. Is each one rational or irrational?' }],
      steps: [
        { text: 'Simplify each side.', tex: '\\sqrt{50} = 5\\sqrt{2}, \\quad \\sqrt{8} = 2\\sqrt{2}', why: '$50 = 25 \\cdot 2$ and $8 = 4 \\cdot 2$. Now they are like radicals.' },
        { text: 'Perimeter: add all four sides.', tex: 'P = 2(5\\sqrt{2} + 2\\sqrt{2}) = 2(7\\sqrt{2}) = 14\\sqrt{2}', why: 'Perimeter is $2(\\text{length} + \\text{width})$. Add the like radicals, then double.' },
        { text: 'Area: multiply length by width.', tex: 'A = \\sqrt{50} \\cdot \\sqrt{8} = \\sqrt{400} = 20', why: 'Multiply the radicands. $400 = 20^2$, so the root is exactly $20$.' },
        { text: 'Classify.', why: '$14\\sqrt{2} \\approx 19.80$ is irrational (a nonzero rational times an irrational). The area $20$ is rational: the product of two irrationals can be rational.' },
      ],
      answer: 'Perimeter $14\\sqrt{2} \\approx 19.80$ ft (irrational); area $20$ square feet (rational).',
    },
  ],
  teachMeAgain: [
    {
      approach: 'visual',
      title: 'An area box for FOIL',
      blocks: [
        { t: 'p', text: 'To multiply $(2 + \\sqrt{3})(4 + \\sqrt{3})$, put one binomial across the top and the other down the side, then fill each box with a product.' },
        {
          t: 'table',
          caption: 'Each box is the row term times the column term.',
          headers: ['times', '$4$', '$\\sqrt{3}$'],
          rows: [
            ['$2$', '$8$', '$2\\sqrt{3}$'],
            ['$\\sqrt{3}$', '$4\\sqrt{3}$', '$3$'],
          ],
        },
        { t: 'p', text: 'Add all four boxes. Numbers: $8 + 3 = 11$. Radicals: $2\\sqrt{3} + 4\\sqrt{3} = 6\\sqrt{3}$.' },
        { t: 'math', tex: '(2 + \\sqrt{3})(4 + \\sqrt{3}) = 11 + 6\\sqrt{3}' },
      ],
    },
    {
      approach: 'analogy',
      title: 'Radicals are like units',
      blocks: [
        { t: 'p', text: 'Think of $\\sqrt{2}$ as a kind of coin, and $\\sqrt{3}$ as a different kind. $3$ quarters plus $2$ quarters is $5$ quarters, so $3\\sqrt{2} + 2\\sqrt{2} = 5\\sqrt{2}$.' },
        { t: 'p', text: '$3$ quarters plus $2$ dimes is not $5$ of anything, so $3\\sqrt{2} + 2\\sqrt{3}$ stays as it is.' },
        { t: 'p', text: 'Sometimes a coin is in disguise: $\\sqrt{8}$ is really $2\\sqrt{2}$, two of the $\\sqrt{2}$ coins. That is why you simplify before you combine.' },
      ],
    },
    {
      approach: 'step-by-step',
      title: 'Checklists for adding and multiplying',
      blocks: [
        { t: 'p', text: '**To add or subtract:**' },
        {
          t: 'list',
          ordered: true,
          items: [
            'Simplify every radical: $\\sqrt{75} - \\sqrt{12} = 5\\sqrt{3} - 2\\sqrt{3}$.',
            'Group like radicals (same index, same radicand).',
            'Combine the coefficients: $5 - 2 = 3$, giving $3\\sqrt{3}$.',
          ],
        },
        { t: 'p', text: '**To multiply:**' },
        {
          t: 'list',
          ordered: true,
          items: [
            'Multiply coefficients with coefficients: $(4\\sqrt{3})(2\\sqrt{6})$ gives $8$.',
            'Multiply radicands with radicands: $\\sqrt{3 \\cdot 6} = \\sqrt{18}$.',
            'Simplify: $8\\sqrt{18} = 8 \\cdot 3\\sqrt{2} = 24\\sqrt{2}$.',
          ],
        },
      ],
    },
    {
      approach: 'prerequisite',
      title: 'Refresher: simplifying and exponent rules',
      blocks: [
        {
          t: 'list',
          items: [
            'Simplest radical form: $\\sqrt{45} = \\sqrt{9} \\cdot \\sqrt{5} = 3\\sqrt{5}$.',
            'Like terms: $5y - 2y = 3y$, but $5y - 2z$ does not combine.',
            'Multiplying powers adds exponents: $x^2 \\cdot x^3 = x^5$, and $x^3 \\cdot x^3 = x^6$.',
            'A square root undoes a square: $\\sqrt{7^2} = 7$ and $\\sqrt{3} \\cdot \\sqrt{3} = 3$.',
          ],
        },
        { t: 'p', text: 'Radical operations are these same skills used together.' },
      ],
    },
    {
      approach: 'alternate-strategy',
      title: 'Divide the exponent by the index',
      blocks: [
        { t: 'p', text: 'For a variable under a root, divide its exponent by the index. The **quotient** goes outside, and the **remainder** stays inside.' },
        {
          t: 'table',
          caption: 'Quotient outside, remainder inside.',
          headers: ['Radical', 'Divide', 'Result'],
          rows: [
            ['$\\sqrt{x^6}$', '$6 \\div 2 = 3$ R $0$', '$x^3$'],
            ['$\\sqrt{x^7}$', '$7 \\div 2 = 3$ R $1$', '$x^3\\sqrt{x}$'],
            ['$\\sqrt[3]{x^7}$', '$7 \\div 3 = 2$ R $1$', '$x^2\\sqrt[3]{x}$'],
            ['$\\sqrt[3]{x^{11}}$', '$11 \\div 3 = 3$ R $2$', '$x^3\\sqrt[3]{x^2}$'],
          ],
        },
        { t: 'p', text: 'Handle the number separately: $\\sqrt{50x^7} = 5\\sqrt{2} \\cdot x^3\\sqrt{x} = 5x^3\\sqrt{2x}$.' },
      ],
    },
    {
      approach: 'simpler-example',
      title: 'Start with radicals that are already alike',
      blocks: [
        { t: 'p', text: '$\\sqrt{7} + \\sqrt{7} = 2\\sqrt{7}$, just like $a + a = 2a$.' },
        { t: 'p', text: '$5\\sqrt{7} - 3\\sqrt{7} = 2\\sqrt{7}$, just like $5a - 3a = 2a$.' },
        { t: 'p', text: 'Now multiply: $\\sqrt{7} \\cdot \\sqrt{7} = \\sqrt{49} = 7$. And $\\sqrt{2} \\cdot \\sqrt{8} = \\sqrt{16} = 4$.' },
        { t: 'p', text: 'One step harder: $\\sqrt{3} \\cdot \\sqrt{6} = \\sqrt{18} = 3\\sqrt{2}$. Multiply first, then simplify.' },
      ],
    },
  ],
  guided: [
    { generator: 'u3.add-radicals', difficulty: 1 },
    { generator: 'u3.multiply-radicals', difficulty: 1 },
    { generator: 'u3.radical-variables', difficulty: 1 },
    { generator: 'u3.add-radicals', difficulty: 1 },
  ],
  independent: {
    count: 8,
    reviewCount: 2,
    mix: [
      { generator: 'u3.add-radicals', difficulty: 1, weight: 1 },
      { generator: 'u3.add-radicals', difficulty: 2, weight: 2 },
      { generator: 'u3.add-radicals', difficulty: 3, weight: 1 },
      { generator: 'u3.multiply-radicals', difficulty: 1, weight: 1 },
      { generator: 'u3.multiply-radicals', difficulty: 2, weight: 2 },
      { generator: 'u3.multiply-radicals', difficulty: 3, weight: 1 },
      { generator: 'u3.radical-variables', difficulty: 1, weight: 1 },
      { generator: 'u3.radical-variables', difficulty: 2, weight: 2 },
      { generator: 'u3.radical-variables', difficulty: 3, weight: 1 },
    ],
  },
  quiz: {
    items: [
      { generator: 'u3.add-radicals', difficulty: 2 },
      { generator: 'u3.add-radicals', difficulty: 3 },
      { generator: 'u3.multiply-radicals', difficulty: 2 },
      { generator: 'u3.multiply-radicals', difficulty: 3 },
      { generator: 'u3.radical-variables', difficulty: 2 },
      { generator: 'u3.radical-variables', difficulty: 3 },
    ],
  },
  summary: [
    'Only **like radicals** (same index, same radicand) combine: add or subtract the coefficients. Simplify first: $\\sqrt{12} + \\sqrt{27} = 2\\sqrt{3} + 3\\sqrt{3} = 5\\sqrt{3}$.',
    '$\\sqrt{a} + \\sqrt{b}$ is **not** $\\sqrt{a + b}$: $\\sqrt{9} + \\sqrt{16} = 7$, but $\\sqrt{25} = 5$.',
    'To multiply, coefficients multiply with coefficients and radicands with radicands, then simplify. Use the distributive property or FOIL for sums: $(3 + \\sqrt{2})(3 - \\sqrt{2}) = 7$.',
    'With positive variables, a square root halves even exponents ($\\sqrt{x^6} = x^3$) and leaves one factor inside for odd ones ($\\sqrt{18x^5} = 3x^2\\sqrt{2x}$). A cube root takes out multiples of 3.',
    'Cube roots follow the same rules with perfect **cubes**: $\\sqrt[3]{54} + 4\\sqrt[3]{2} = 7\\sqrt[3]{2}$ and $\\sqrt[3]{4} \\cdot \\sqrt[3]{6} = \\sqrt[3]{24} = 2\\sqrt[3]{3}$.',
  ],
  mastery: { quizPassScore: 0.8, practiceMinCorrect: 5 },
};
