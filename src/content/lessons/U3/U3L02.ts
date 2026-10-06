import type { LessonContent } from '../../../core/curriculum/types';

/**
 * U3L02 Simplifying Square Roots and Cube Roots (A.NR.5.1)
 * Perfect squares and cubes, the product property, the largest perfect-square factor,
 * factor trees, coefficients, cube roots of negatives, and estimating to check (S3.03, S3.04).
 *
 * Math verified by hand (2026-10-06): every simplification, factor tree, decimal estimate and real-world measurement below was recomputed independently.
 */
export const U3L02: LessonContent = {
  lessonId: 'U3L02',
  goal: 'Rewrite square roots in simplest radical form, like $\\sqrt{72} = 6\\sqrt{2}$, and simplify cube roots, like $\\sqrt[3]{54} = 3\\sqrt[3]{2}$, including cube roots of negative numbers.',
  needToKnow: [
    { t: 'p', text: 'This lesson builds on three things you already know:' },
    {
      t: 'list',
      items: [
        '**Square roots of perfect squares.** $\\sqrt{49} = 7$ because $7 \\cdot 7 = 49$.',
        '**Cube roots of perfect cubes.** $\\sqrt[3]{8} = 2$ because $2 \\cdot 2 \\cdot 2 = 8$.',
        '**Rational vs irrational.** $\\sqrt{2}$ is irrational: its decimal never ends and never repeats. So we keep it as $\\sqrt{2}$ instead of rounding.',
      ],
    },
    { t: 'callout', variant: 'tip', title: 'Quick check', text: 'What is $\\sqrt{81}$? What is $\\sqrt[3]{27}$? (You should get $9$ and $3$.) If that felt shaky, open **Teach Me Again** and choose the refresher.' },
  ],
  vocabulary: [
    { term: 'radical', meaning: 'An expression with a root symbol, like $\\sqrt{50}$ or $\\sqrt[3]{54}$.' },
    { term: 'radicand', meaning: 'The number under the root symbol. In $\\sqrt{50}$, the radicand is $50$.' },
    { term: 'index', meaning: 'The small number that tells which root. $\\sqrt[3]{\\ }$ has index 3. A plain $\\sqrt{\\ }$ has index 2.' },
    { term: 'perfect square', meaning: 'A whole number times itself: $1, 4, 9, 16, 25, 36, \\dots$' },
    { term: 'perfect cube', meaning: 'A whole number used as a factor three times: $1, 8, 27, 64, 125, \\dots$' },
    { term: 'simplest radical form', meaning: 'A square root whose radicand has no perfect-square factor other than $1$ (for a cube root, no perfect-cube factor other than $1$).' },
  ],
  instruction: [
    { t: 'p', text: '### Know your perfect squares and cubes' },
    { t: 'p', text: 'Simplifying is much faster when you can spot these numbers on sight.' },
    {
      t: 'table',
      caption: 'Perfect squares from 1 squared to 12 squared.',
      headers: ['n', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
      rows: [['n squared', '1', '4', '9', '16', '25', '36', '49', '64', '81', '100', '121', '144']],
    },
    {
      t: 'table',
      caption: 'Perfect cubes from 1 cubed to 10 cubed.',
      headers: ['n', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
      rows: [['n cubed', '1', '8', '27', '64', '125', '216', '343', '512', '729', '1000']],
    },
    { t: 'p', text: '### The product property' },
    { t: 'p', text: 'The square root of a product equals the product of the square roots (for numbers that are not negative):' },
    { t: 'math', tex: '\\sqrt{ab} = \\sqrt{a} \\cdot \\sqrt{b}' },
    { t: 'p', text: 'You can check it with numbers you know: $\\sqrt{4 \\cdot 9} = \\sqrt{36} = 6$, and $\\sqrt{4} \\cdot \\sqrt{9} = 2 \\cdot 3 = 6$. They match.' },
    { t: 'p', text: '### Simplifying a square root' },
    { t: 'p', text: 'To simplify $\\sqrt{72}$, split $72$ into a product where one factor is the **largest perfect square** that divides it. The factors of $72$ that are perfect squares are $4$, $9$ and $36$. The largest is $36$.' },
    { t: 'math', tex: '\\sqrt{72} = \\sqrt{36 \\cdot 2} = \\sqrt{36} \\cdot \\sqrt{2} = 6\\sqrt{2}' },
    { t: 'p', text: 'The radicand $2$ has no perfect-square factor except $1$, so $6\\sqrt{2}$ is in **simplest radical form**.' },
    { t: 'callout', variant: 'warning', title: 'A smaller perfect square is not wrong, just unfinished', text: 'If you use $4$ instead of $36$, you get $\\sqrt{72} = \\sqrt{4 \\cdot 18} = 2\\sqrt{18}$. That is equal to $\\sqrt{72}$, but it is **not** simplest form, because $18 = 9 \\cdot 2$ still has the perfect square $9$ inside. Keep going: $2\\sqrt{18} = 2 \\cdot 3\\sqrt{2} = 6\\sqrt{2}$. Using the largest perfect square gets you there in one step.' },
    { t: 'p', text: '### Square roots with a coefficient' },
    { t: 'p', text: 'A number in front of the root is a **coefficient**, and it means multiply. Simplify the root, then multiply what comes out by the coefficient:' },
    { t: 'math', tex: '3\\sqrt{50} = 3 \\cdot \\sqrt{25 \\cdot 2} = 3 \\cdot 5\\sqrt{2} = 15\\sqrt{2}' },
    { t: 'p', text: '### Check by estimating' },
    { t: 'p', text: 'Since $49 < 50 < 64$, $\\sqrt{50}$ is between $\\sqrt{49} = 7$ and $\\sqrt{64} = 8$, a little more than $7$. Our simplified form agrees: $5\\sqrt{2} \\approx 5(1.414) = 7.07$.' },
    {
      t: 'numberline',
      caption: 'The square root of 50 is about 7.07, between 7 and 8.',
      spec: { min: 6, max: 9, step: 0.5, points: [{ x: 7.07, closed: true }], ariaLabel: 'Number line from 6 to 9 with a dot just to the right of 7, at about 7.07, showing the square root of 50.' },
    },
    { t: 'p', text: '### Simplifying cube roots' },
    { t: 'p', text: 'Cube roots work the same way, but you look for the largest **perfect cube** factor:' },
    { t: 'math', tex: '\\sqrt[3]{54} = \\sqrt[3]{27 \\cdot 2} = \\sqrt[3]{27} \\cdot \\sqrt[3]{2} = 3\\sqrt[3]{2}' },
    { t: 'p', text: 'A cube root **can** have a negative radicand, because a negative number cubed is negative: $(-3)^3 = -27$, so $\\sqrt[3]{-27} = -3$. That means' },
    { t: 'math', tex: '\\sqrt[3]{-54} = \\sqrt[3]{-27 \\cdot 2} = -3\\sqrt[3]{2}' },
    { t: 'callout', variant: 'why', title: 'Why is the square root of -4 not a real number?', text: 'A square root asks "what number times itself gives this?" A positive times a positive is positive, and a negative times a negative is also positive: $2 \\cdot 2 = 4$ and $(-2)(-2) = 4$. No real number times itself gives $-4$, so $\\sqrt{-4}$ is **not a real number**. Cube roots are different: $(-2)(-2)(-2) = -8$, so $\\sqrt[3]{-8} = -2$.' },
    { t: 'callout', variant: 'realworld', title: 'Where these show up', text: 'The side of a square with area $A$ is $\\sqrt{A}$. The edge of a cube with volume $V$ is $\\sqrt[3]{V}$. The diagonal of a square often comes out as a square root too. Simplest radical form gives the **exact** length; a decimal gives an estimate you can measure.' },
  ],
  examples: [
    {
      title: 'Simplify a square root',
      kind: 'introductory',
      problem: [{ t: 'p', text: 'Write $\\sqrt{48}$ in simplest radical form.' }],
      steps: [
        { text: 'Find the largest perfect square that divides $48$.', tex: '48 = 16 \\cdot 3', why: 'Check the perfect squares: $4$ and $16$ both divide $48$, but $36$ does not. The largest is $16$.' },
        { text: 'Use the product property.', tex: '\\sqrt{48} = \\sqrt{16} \\cdot \\sqrt{3}', why: 'The square root of a product is the product of the square roots.' },
        { text: 'Take the square root of the perfect square.', tex: '\\sqrt{48} = 4\\sqrt{3}', why: '$\\sqrt{16} = 4$. The radicand $3$ has no perfect-square factor other than $1$, so we are done.' },
        { text: 'Estimate to check.', tex: '4\\sqrt{3} \\approx 4(1.732) = 6.93', why: '$36 < 48 < 49$, so $\\sqrt{48}$ should be between $6$ and $7$, very close to $7$. It is.' },
      ],
      answer: '$\\sqrt{48} = 4\\sqrt{3}$',
    },
    {
      title: 'A square root with a coefficient',
      kind: 'intermediate',
      problem: [{ t: 'p', text: 'Simplify $3\\sqrt{50}$.' }],
      steps: [
        { text: 'Find the largest perfect-square factor of $50$.', tex: '50 = 25 \\cdot 2', why: '$25$ divides $50$, and no larger perfect square ($36$ or $49$) does.' },
        { text: 'Simplify the root.', tex: '\\sqrt{50} = \\sqrt{25} \\cdot \\sqrt{2} = 5\\sqrt{2}', why: 'Product property, then $\\sqrt{25} = 5$.' },
        { text: 'Multiply by the coefficient.', tex: '3\\sqrt{50} = 3 \\cdot 5\\sqrt{2} = 15\\sqrt{2}', why: 'The $3$ in front means $3$ times the root. Numbers outside the root multiply with numbers outside.' },
        { text: 'Estimate to check.', tex: '3\\sqrt{50} \\approx 3(7.07) = 21.2, \\quad 15\\sqrt{2} \\approx 15(1.414) = 21.2', why: 'Both forms give the same value, so the simplification is right.' },
      ],
      answer: '$3\\sqrt{50} = 15\\sqrt{2}$',
    },
    {
      title: 'A common mistake: stopping too soon',
      kind: 'common-mistake',
      problem: [{ t: 'p', text: 'A student writes $\\sqrt{72} = \\sqrt{4 \\cdot 18} = 2\\sqrt{18}$ and stops. Is that simplest radical form? If not, finish it.' }],
      steps: [
        { text: 'Check the radicand $18$ for perfect-square factors.', tex: '18 = 9 \\cdot 2', why: 'Simplest form means **no** perfect-square factor other than $1$ is left inside. $18$ still contains $9$.' },
        { text: 'Simplify $\\sqrt{18}$.', tex: '2\\sqrt{18} = 2 \\cdot \\sqrt{9} \\cdot \\sqrt{2} = 2 \\cdot 3\\sqrt{2}', why: '$\\sqrt{9} = 3$ comes out of the root and multiplies the $2$ already outside.' },
        { text: 'Multiply.', tex: '2 \\cdot 3\\sqrt{2} = 6\\sqrt{2}', why: 'The student value $2\\sqrt{18}$ was equal to $\\sqrt{72}$, just unfinished.' },
        { text: 'The faster way: use the largest perfect square, $36$.', tex: '\\sqrt{72} = \\sqrt{36} \\cdot \\sqrt{2} = 6\\sqrt{2}', why: 'Starting with the largest perfect-square factor finishes in one step.' },
      ],
      answer: 'No. $\\sqrt{72} = 6\\sqrt{2}$.',
    },
    {
      title: 'Cube root of a negative number',
      kind: 'intermediate',
      problem: [{ t: 'p', text: 'Simplify $\\sqrt[3]{-54}$. Then explain why $\\sqrt{-54}$ is not a real number.' }],
      steps: [
        { text: 'Find the largest perfect-cube factor of $54$.', tex: '54 = 27 \\cdot 2', why: 'Check the perfect cubes $8, 27, 64, \\dots$: $27$ divides $54$, $8$ does not, and $64$ is too big.' },
        { text: 'Keep the negative with the perfect cube.', tex: '\\sqrt[3]{-54} = \\sqrt[3]{-27} \\cdot \\sqrt[3]{2}', why: '$-54 = (-27)(2)$, and the product property works for cube roots too.' },
        { text: 'Take the cube root of $-27$.', tex: '\\sqrt[3]{-54} = -3\\sqrt[3]{2}', why: '$(-3)(-3)(-3) = 9 \\cdot (-3) = -27$, so $\\sqrt[3]{-27} = -3$.' },
        { text: 'Compare with a square root.', why: 'Any real number times itself is $0$ or positive, so no real number squared is $-54$. The square root of a negative number is not real, but a cube root of a negative is negative.' },
      ],
      answer: '$\\sqrt[3]{-54} = -3\\sqrt[3]{2}$; $\\sqrt{-54}$ is not a real number.',
    },
    {
      title: 'Diagonal of a square garden',
      kind: 'real-world',
      problem: [{ t: 'p', text: 'A square garden is 5 meters on each side. A straight path runs corner to corner. By the Pythagorean theorem its length is $\\sqrt{5^2 + 5^2}$ meters. Find the exact length in simplest radical form and estimate it to the nearest hundredth.' }],
      steps: [
        { text: 'Simplify inside the root.', tex: '\\sqrt{5^2 + 5^2} = \\sqrt{25 + 25} = \\sqrt{50}', why: 'Square first, then add. Note $\\sqrt{25 + 25}$ is **not** $5 + 5$: you must add before taking the root.' },
        { text: 'Use the largest perfect-square factor.', tex: '\\sqrt{50} = \\sqrt{25} \\cdot \\sqrt{2} = 5\\sqrt{2}', why: '$50 = 25 \\cdot 2$ and $\\sqrt{25} = 5$.' },
        { text: 'Estimate.', tex: '5\\sqrt{2} \\approx 5(1.4142) = 7.071 \\approx 7.07', why: 'The diagonal must be longer than one side (5 m) but shorter than two sides together (10 m). $7.07$ m fits.' },
      ],
      answer: 'Exactly $5\\sqrt{2}$ meters, about $7.07$ meters.',
    },
    {
      title: 'Edge of a cube-shaped tank',
      kind: 'challenging',
      problem: [{ t: 'p', text: 'A cube-shaped fish tank holds 432 cubic inches of water when full. The edge length is $\\sqrt[3]{432}$ inches. Write it in simplest form and estimate it.' }],
      steps: [
        { text: 'Find the largest perfect-cube factor of $432$.', tex: '432 = 216 \\cdot 2', why: 'Try perfect cubes from the top: $343$ does not divide $432$, but $216 \\cdot 2 = 432$. So $216$ is the largest.' },
        { text: 'Use the product property.', tex: '\\sqrt[3]{432} = \\sqrt[3]{216} \\cdot \\sqrt[3]{2} = 6\\sqrt[3]{2}', why: '$6 \\cdot 6 \\cdot 6 = 216$, so $\\sqrt[3]{216} = 6$.' },
        { text: 'Estimate.', tex: '6\\sqrt[3]{2} \\approx 6(1.26) = 7.56', why: '$\\sqrt[3]{2} \\approx 1.26$. Check: $7^3 = 343$ and $8^3 = 512$, and $432$ is between them, so the edge is between $7$ and $8$ inches.' },
      ],
      answer: 'Exactly $6\\sqrt[3]{2}$ inches, about $7.56$ inches.',
    },
  ],
  teachMeAgain: [
    {
      approach: 'visual',
      title: 'Line up the factor pairs',
      blocks: [
        { t: 'p', text: 'List every way to write $72$ as a product, and mark the perfect squares.' },
        {
          t: 'table',
          caption: 'Factor pairs of 72. The largest perfect square is 36.',
          headers: ['Factor pair', 'Perfect square in the pair?'],
          rows: [
            ['1 and 72', 'only 1'],
            ['2 and 36', 'yes: 36'],
            ['3 and 24', 'no'],
            ['4 and 18', 'yes: 4'],
            ['6 and 12', 'no'],
            ['8 and 9', 'yes: 9'],
          ],
        },
        { t: 'p', text: 'The biggest perfect square on the list is $36$, so $\\sqrt{72} = \\sqrt{36} \\cdot \\sqrt{2} = 6\\sqrt{2}$.' },
        { t: 'p', text: 'Check where it lands: $64 < 72 < 81$, so $\\sqrt{72}$ is between $8$ and $9$. And $6\\sqrt{2} \\approx 6(1.414) = 8.49$.' },
        {
          t: 'numberline',
          caption: 'The square root of 72 is about 8.49, between 8 and 9.',
          spec: { min: 7, max: 10, step: 0.5, points: [{ x: 8.49, closed: true }], ariaLabel: 'Number line from 7 to 10 with a dot at about 8.49, between 8 and 9.' },
        },
      ],
    },
    {
      approach: 'analogy',
      title: 'Partners leave together',
      blocks: [
        { t: 'p', text: 'Think of the root symbol as a room, and the prime factors as people inside it. A square root lets people leave **only in pairs**, and each pair walks out as **one** person.' },
        { t: 'math', tex: '\\sqrt{72} = \\sqrt{2 \\cdot 2 \\cdot 2 \\cdot 3 \\cdot 3}' },
        { t: 'p', text: 'One pair of $2$s leaves as a single $2$. The pair of $3$s leaves as a single $3$. One $2$ has no partner, so it stays inside. Outside you have $2 \\cdot 3 = 6$; inside you have $2$. Answer: $6\\sqrt{2}$.' },
        { t: 'p', text: 'A cube root is stricter: people leave only in **groups of three**. $\\sqrt[3]{54} = \\sqrt[3]{2 \\cdot 3 \\cdot 3 \\cdot 3}$. The three $3$s leave as one $3$, and the $2$ stays: $3\\sqrt[3]{2}$.' },
      ],
    },
    {
      approach: 'step-by-step',
      title: 'A 4-step checklist',
      blocks: [
        {
          t: 'list',
          ordered: true,
          items: [
            '**Find the largest perfect square** that divides the radicand. For $\\sqrt{180}$: $180 \\div 36 = 5$, so use $36$.',
            '**Split it:** $\\sqrt{180} = \\sqrt{36} \\cdot \\sqrt{5}$.',
            '**Take the root you know:** $\\sqrt{36} = 6$, giving $6\\sqrt{5}$. If there was a coefficient, multiply it by the $6$.',
            '**Check:** is there a perfect square (other than $1$) left in the radicand? $5$ has none, so $\\sqrt{180} = 6\\sqrt{5}$.',
          ],
        },
        { t: 'callout', variant: 'tip', text: 'For a cube root, do the same four steps with perfect cubes: $8, 27, 64, 125, \\dots$' },
      ],
    },
    {
      approach: 'prerequisite',
      title: 'Refresher: squares, cubes and roots',
      blocks: [
        {
          t: 'list',
          items: [
            'Squaring means times itself: $6^2 = 6 \\cdot 6 = 36$. So $\\sqrt{36} = 6$.',
            'Cubing means a factor three times: $4^3 = 4 \\cdot 4 \\cdot 4 = 64$. So $\\sqrt[3]{64} = 4$.',
            'A negative cubed stays negative: $(-5)^3 = -125$. So $\\sqrt[3]{-125} = -5$.',
            'A negative squared is positive: $(-6)^2 = 36$. That is why no real number squares to a negative.',
          ],
        },
        { t: 'p', text: 'Memorize the perfect squares up to $144$ and the perfect cubes up to $1000$; then simplifying is just spotting them inside bigger numbers.' },
      ],
    },
    {
      approach: 'alternate-strategy',
      title: 'Use a factor tree',
      blocks: [
        { t: 'p', text: 'If you cannot spot the largest perfect square, break the radicand all the way into primes.' },
        { t: 'p', text: '$180 = 2 \\cdot 90 = 2 \\cdot 2 \\cdot 45 = 2 \\cdot 2 \\cdot 3 \\cdot 15 = 2 \\cdot 2 \\cdot 3 \\cdot 3 \\cdot 5$' },
        { t: 'math', tex: '\\sqrt{180} = \\sqrt{(2 \\cdot 2)(3 \\cdot 3) \\cdot 5} = 2 \\cdot 3 \\sqrt{5} = 6\\sqrt{5}' },
        { t: 'p', text: 'Each pair of equal primes comes out as one copy. For a cube root, circle groups of three: $250 = 2 \\cdot 5 \\cdot 5 \\cdot 5$, so $\\sqrt[3]{250} = 5\\sqrt[3]{2}$.' },
        { t: 'callout', variant: 'tip', text: 'A factor tree always gets you to simplest form, even if you start the tree with a small factor.' },
      ],
    },
    {
      approach: 'simpler-example',
      title: 'Start with a small number',
      blocks: [
        { t: 'p', text: '$\\sqrt{8}$: the perfect square $4$ divides $8$, and $8 = 4 \\cdot 2$. So $\\sqrt{8} = \\sqrt{4} \\cdot \\sqrt{2} = 2\\sqrt{2}$.' },
        { t: 'p', text: '$\\sqrt{12}$: $12 = 4 \\cdot 3$, so $\\sqrt{12} = 2\\sqrt{3}$.' },
        { t: 'p', text: '$\\sqrt{20}$: $20 = 4 \\cdot 5$, so $\\sqrt{20} = 2\\sqrt{5}$.' },
        { t: 'p', text: 'Now a cube root: $\\sqrt[3]{16}$. The perfect cube $8$ divides $16$, and $16 = 8 \\cdot 2$. So $\\sqrt[3]{16} = 2\\sqrt[3]{2}$.' },
      ],
    },
  ],
  guided: [
    { generator: 'u3.simplify-sqrt', difficulty: 1 },
    { generator: 'u3.simplify-cbrt', difficulty: 1 },
    { generator: 'u3.simplify-sqrt', difficulty: 1 },
    { generator: 'u3.simplify-cbrt', difficulty: 1 },
  ],
  independent: {
    count: 8,
    reviewCount: 2,
    mix: [
      { generator: 'u3.simplify-sqrt', difficulty: 1, weight: 1 },
      { generator: 'u3.simplify-sqrt', difficulty: 2, weight: 2 },
      { generator: 'u3.simplify-sqrt', difficulty: 3, weight: 1 },
      { generator: 'u3.simplify-cbrt', difficulty: 1, weight: 1 },
      { generator: 'u3.simplify-cbrt', difficulty: 2, weight: 2 },
      { generator: 'u3.simplify-cbrt', difficulty: 3, weight: 1 },
    ],
  },
  quiz: {
    items: [
      { generator: 'u3.simplify-sqrt', difficulty: 2 },
      { generator: 'u3.simplify-sqrt', difficulty: 2 },
      { generator: 'u3.simplify-sqrt', difficulty: 3 },
      { generator: 'u3.simplify-cbrt', difficulty: 2 },
      { generator: 'u3.simplify-cbrt', difficulty: 3 },
      { generator: 'u3.simplify-cbrt', difficulty: 2 },
    ],
  },
  summary: [
    'Product property: $\\sqrt{ab} = \\sqrt{a} \\cdot \\sqrt{b}$, and the same works for cube roots.',
    'Pull out the **largest** perfect square, as in $\\sqrt{72} = \\sqrt{36} \\cdot \\sqrt{2} = 6\\sqrt{2}$. Simplest form has no perfect-square factor other than $1$ left inside.',
    'For cube roots, pull out perfect cubes: $\\sqrt[3]{54} = 3\\sqrt[3]{2}$. A cube root of a negative is negative, $\\sqrt[3]{-54} = -3\\sqrt[3]{2}$, but $\\sqrt{-4}$ is not a real number.',
    'Check by estimating: $\\sqrt{50}$ is between $7$ and $8$, and $5\\sqrt{2} \\approx 7.07$.',
  ],
  mastery: { quizPassScore: 0.8, practiceMinCorrect: 5 },
};
