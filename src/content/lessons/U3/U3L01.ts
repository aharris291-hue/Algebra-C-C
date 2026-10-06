import type { LessonContent } from '../../../core/curriculum/types';

/**
 * U3L01 Rational and Irrational Numbers (A.NR.5.2)
 * Classifying real numbers as rational or irrational (S3.01) and explaining whether
 * sums and products of rational and irrational numbers are rational or irrational (S3.02).
 *
 * Math verified by hand (2026-10-06): every worked example, decimal-to-fraction conversion, closure argument and approximation below was recomputed independently.
 */
export const U3L01: LessonContent = {
  lessonId: 'U3L01',
  goal: 'Sort numbers into the real number system, decide whether a number is rational or irrational, and explain why sums and products of rational and irrational numbers are rational or irrational.',
  needToKnow: [
    { t: 'p', text: 'This lesson builds on two things you already know:' },
    {
      t: 'list',
      items: [
        '**Perfect squares and square roots.** $\\sqrt{49} = 7$ because $7^2 = 49$. The first perfect squares are $1, 4, 9, 16, 25, 36, 49, 64, 81, 100$.',
        '**Fractions and decimals.** Divide the top by the bottom to get a decimal: $\\frac{3}{4} = 3 \\div 4 = 0.75$ and $\\frac{1}{3} = 0.333\\ldots$',
      ],
    },
    { t: 'callout', variant: 'tip', title: 'Quick check', text: 'What is $\\sqrt{81}$, and what is $\\frac{2}{5}$ as a decimal? (You should get $9$ and $0.4$.) If that felt shaky, open **Teach Me Again** and choose the refresher.' },
  ],
  vocabulary: [
    { term: 'natural numbers', meaning: 'The counting numbers $1, 2, 3, \\ldots$' },
    { term: 'whole numbers', meaning: 'The natural numbers and zero: $0, 1, 2, 3, \\ldots$' },
    { term: 'integers', meaning: 'The whole numbers and their opposites: $\\ldots, -2, -1, 0, 1, 2, \\ldots$' },
    { term: 'rational number', meaning: 'A number that can be written as $\\frac{a}{b}$, where $a$ and $b$ are integers and $b \\ne 0$.' },
    { term: 'irrational number', meaning: 'A real number that cannot be written as a ratio of integers. Its decimal never ends and never repeats.' },
    { term: 'real numbers', meaning: 'All the rational and irrational numbers together: every number on the number line.' },
    { term: 'closed', meaning: 'A set is closed under an operation if doing that operation on any two members always gives another member of the set.' },
  ],
  instruction: [
    { t: 'p', text: '### The real number system' },
    { t: 'p', text: 'Numbers come in families that fit inside each other, like nesting boxes. Each family adds new numbers to the one before it.' },
    {
      t: 'table',
      caption: 'Each of the first four sets contains every set above it. The irrational numbers are a separate set: no rational number is irrational.',
      headers: ['Set', 'What it adds', 'Examples'],
      rows: [
        ['Natural numbers', 'counting numbers', '$1, 2, 3, 50$'],
        ['Whole numbers', 'zero', '$0, 1, 2, 3$'],
        ['Integers', 'negatives', '$-12, -1, 0, 7$'],
        ['Rational numbers', 'fractions and their decimals', '$\\frac{2}{3}, -\\frac{5}{4}, 0.75, 0.\\overline{6}, 8$'],
        ['Irrational numbers', 'decimals that never end and never repeat', '$\\sqrt{2}, \\sqrt{13}, \\pi$'],
      ],
    },
    { t: 'p', text: 'Together, the rational and irrational numbers make up the **real numbers**. Every real number is either rational or irrational, never both.' },
    { t: 'p', text: '### Rational numbers' },
    { t: 'p', text: 'The word **rational** comes from **ratio**. A rational number can be written as a fraction $\\frac{a}{b}$ of two integers, with $b \\ne 0$.' },
    {
      t: 'list',
      items: [
        '**Every integer is rational:** $-6 = \\frac{-6}{1}$.',
        '**Terminating decimals are rational:** $0.75 = \\frac{75}{100} = \\frac{3}{4}$.',
        '**Repeating decimals are rational:** $0.\\overline{3} = 0.333\\ldots = \\frac{1}{3}$. The bar means the digits under it repeat forever.',
        '**Square roots of perfect squares are rational:** $\\sqrt{64} = 8$, and $\\sqrt{\\frac{4}{9}} = \\frac{2}{3}$ because $\\frac{2}{3} \\cdot \\frac{2}{3} = \\frac{4}{9}$.',
        '**Cube roots of perfect cubes are rational:** $\\sqrt[3]{27} = 3$ because $3 \\cdot 3 \\cdot 3 = 27$.',
      ],
    },
    { t: 'p', text: 'How do we know a repeating decimal is a fraction? Use the **subtract trick**. Call the number $x$, multiply so the repeating part lines up, and subtract:' },
    { t: 'math', tex: 'x = 0.333\\ldots \\qquad\\qquad 10x = 3.333\\ldots' },
    { t: 'math', tex: '10x - x = 3.333\\ldots - 0.333\\ldots \\;\\Rightarrow\\; 9x = 3 \\;\\Rightarrow\\; x = \\frac{3}{9} = \\frac{1}{3}' },
    { t: 'callout', variant: 'why', title: 'Why does the subtract trick work?', text: 'After multiplying by $10$, both numbers have exactly the same endless tail of $3$s after the decimal point. When you subtract, the tails cancel completely, and only whole numbers are left. If two digits repeat, multiply by $100$ instead so the tails still line up.' },
    { t: 'p', text: '### Irrational numbers' },
    { t: 'p', text: 'An **irrational** number cannot be written as a fraction of integers. Its decimal goes on forever **without** a repeating block.' },
    {
      t: 'list',
      items: [
        '**Square roots of whole numbers that are not perfect squares:** $\\sqrt{2} = 1.41421356\\ldots$ and $\\sqrt{13}$. Since $9 < 13 < 16$, $13$ is not a perfect square, so $\\sqrt{13}$ (a number between $3$ and $4$) is irrational.',
        '**Cube roots of whole numbers that are not perfect cubes:** $10$ is not a perfect cube (because $2^3 = 8$ and $3^3 = 27$), so $\\sqrt[3]{10}$, a number between $2$ and $3$, is irrational.',
        '**Pi:** $\\pi = 3.14159265\\ldots$, the ratio of a circle\'s circumference to its diameter.',
        '**Decimals with a pattern that never repeats:** $0.1010010001\\ldots$ (one more $0$ each time) never ends, and no block of digits repeats, so it is irrational.',
      ],
    },
    { t: 'callout', variant: 'warning', title: 'Approximations are not the real thing', text: '$\\frac{22}{7}$ and $3.14$ are handy **approximations** of $\\pi$, but they are rational, and $\\pi$ is not. In fact $\\frac{22}{7} = 3.142857\\ldots$ while $\\pi = 3.141592\\ldots$, so they differ already in the third decimal place. In the same way, a calculator shows $\\sqrt{2}$ as $1.414213562$ only because the screen runs out of room. The real $\\sqrt{2}$ keeps going forever.' },
    {
      t: 'numberline',
      caption: 'Rational and irrational numbers share one number line. Dots at 0.5, about 1.41 (square root of 2), 2, and about 3.14 (pi).',
      spec: { min: -1, max: 4, step: 0.5, points: [{ x: 0.5, closed: true }, { x: 1.41421356, closed: true }, { x: 2, closed: true }, { x: 3.14159265, closed: true }], ariaLabel: 'Number line from -1 to 4 with dots at 0.5, about 1.414 (square root of 2), 2, and about 3.142 (pi).' },
    },
    { t: 'p', text: '### Closure: what happens when you add or multiply?' },
    { t: 'p', text: '**Rational + rational is always rational.** Take any two rational numbers $\\frac{a}{b}$ and $\\frac{c}{d}$ (with $b \\ne 0$ and $d \\ne 0$):' },
    { t: 'math', tex: '\\frac{a}{b} + \\frac{c}{d} = \\frac{ad + bc}{bd} \\qquad\\qquad \\frac{a}{b} \\cdot \\frac{c}{d} = \\frac{ac}{bd}' },
    { t: 'p', text: 'The tops $ad + bc$ and $ac$ are integers, because adding and multiplying integers gives integers. The bottom $bd$ is an integer that is not $0$, because neither $b$ nor $d$ is $0$. So each answer is a fraction of integers: **rational + rational and rational $\\times$ rational are always rational.** We say the rational numbers are **closed** under addition and multiplication. Example: $\\frac{3}{4} + \\frac{1}{6} = \\frac{18 + 4}{24} = \\frac{22}{24} = \\frac{11}{12}$.' },
    { t: 'p', text: '**Rational + irrational is always irrational.** Here is a short proof by contradiction, using $3 + \\sqrt{5}$:' },
    {
      t: 'list',
      ordered: true,
      items: [
        '**Pretend** $3 + \\sqrt{5}$ is rational. Call it $q$, so $3 + \\sqrt{5} = q$.',
        'Subtract $3$ from both sides: $\\sqrt{5} = q - 3$.',
        'But $q - 3$ is rational minus rational, which is rational. That would make $\\sqrt{5}$ rational.',
        'We know $\\sqrt{5}$ is irrational, so the pretend statement must be false. $3 + \\sqrt{5}$ is irrational.',
      ],
    },
    { t: 'p', text: 'The same argument works for **any** rational number plus **any** irrational number.' },
    { t: 'p', text: '**Nonzero rational $\\times$ irrational is always irrational.** If $4\\sqrt{7}$ were a rational number $q$, then dividing by $4$ would give $\\sqrt{7} = \\frac{q}{4}$, which is rational. That is impossible. The one exception is zero: $0 \\cdot \\sqrt{5} = 0$, which is rational. (We cannot divide by $0$, so the argument breaks.)' },
    { t: 'p', text: '**Irrational + irrational and irrational $\\times$ irrational can go either way.** You have to check the actual numbers:' },
    {
      t: 'table',
      caption: 'Two irrationals can give a rational or an irrational result.',
      headers: ['Operation', 'Rational result', 'Irrational result'],
      rows: [
        ['sum', '$\\sqrt{2} + (-\\sqrt{2}) = 0$', '$\\sqrt{2} + \\sqrt{2} = 2\\sqrt{2}$'],
        ['product', '$\\sqrt{2} \\cdot \\sqrt{8} = \\sqrt{16} = 4$', '$\\sqrt{2} \\cdot \\sqrt{3} = \\sqrt{6}$'],
      ],
    },
    { t: 'callout', variant: 'realworld', title: 'Where irrational numbers show up', text: 'A square tile with an area of $2$ square feet has a side length of exactly $\\sqrt{2}$ feet, an irrational length. A circle with diameter $10$ cm has a circumference of exactly $10\\pi$ cm, also irrational. Builders and engineers use rounded values like $1.414$ or $31.4$, which are close enough to measure with but are not exact.' },
  ],
  examples: [
    {
      title: 'Sorting numbers into sets',
      kind: 'introductory',
      problem: [{ t: 'p', text: 'Classify each number as rational or irrational, and name the smallest set it belongs to: $-7$, $\\frac{5}{8}$, $\\sqrt{49}$, $\\sqrt{13}$, $0.25$.' }],
      steps: [
        { text: '$-7$ is an **integer**, so it is rational.', tex: '-7 = \\frac{-7}{1}', why: 'Any integer can be written over $1$, which makes it a ratio of integers.' },
        { text: '$\\frac{5}{8}$ is **rational** (not an integer).', why: 'It is already a fraction of two integers with a nonzero bottom.' },
        { text: '$\\sqrt{49}$ is a **natural number**, so it is rational.', tex: '\\sqrt{49} = 7', why: '$49$ is a perfect square, because $7^2 = 49$. A square root symbol does not automatically mean irrational.' },
        { text: '$\\sqrt{13}$ is **irrational**.', tex: '3 < \\sqrt{13} < 4', why: '$13$ is not a perfect square: it falls between $9$ and $16$, so its square root is between $3$ and $4$. The square root of a whole number that is not a perfect square is irrational.' },
        { text: '$0.25$ is **rational** (not an integer).', tex: '0.25 = \\frac{25}{100} = \\frac{1}{4}', why: 'A terminating decimal can always be written over a power of $10$.' },
      ],
      answer: 'Irrational: $\\sqrt{13}$. Rational: $-7$ (integer), $\\frac{5}{8}$, $\\sqrt{49} = 7$ (natural number), $0.25$.',
    },
    {
      title: 'A repeating decimal as a fraction',
      kind: 'intermediate',
      problem: [{ t: 'p', text: 'Show that $0.\\overline{27} = 0.272727\\ldots$ is rational by writing it as a fraction in lowest terms.' }],
      steps: [
        { text: 'Call the number $x$.', tex: 'x = 0.272727\\ldots' },
        { text: 'Multiply both sides by $100$.', tex: '100x = 27.272727\\ldots', why: 'Two digits repeat, so multiplying by $100$ shifts the decimal two places and lines up the repeating tails.' },
        { text: 'Subtract the first equation from the second.', tex: '100x - x = 27.2727\\ldots - 0.2727\\ldots \\;\\Rightarrow\\; 99x = 27', why: 'The endless tails are identical, so they cancel exactly.' },
        { text: 'Divide by $99$ and simplify.', tex: 'x = \\frac{27}{99} = \\frac{3}{11}', why: '$27$ and $99$ share a factor of $9$: $27 \\div 9 = 3$ and $99 \\div 9 = 11$.' },
        { text: 'Check by dividing.', tex: '3 \\div 11 = 0.272727\\ldots \\checkmark', why: 'Dividing the fraction back out should give the original decimal.' },
      ],
      answer: '$0.\\overline{27} = \\frac{3}{11}$, so it is rational.',
    },
    {
      title: 'Roots of fractions and cube roots',
      kind: 'intermediate',
      problem: [{ t: 'p', text: 'Decide whether each number is rational or irrational: $\\sqrt{\\frac{4}{9}}$, $\\sqrt[3]{27}$, $\\sqrt[3]{10}$, $\\sqrt{12}$.' }],
      steps: [
        { text: '$\\sqrt{\\frac{4}{9}}$ is rational.', tex: '\\sqrt{\\frac{4}{9}} = \\frac{2}{3}', why: 'Check: $\\frac{2}{3} \\cdot \\frac{2}{3} = \\frac{4}{9}$. Both $4$ and $9$ are perfect squares.' },
        { text: '$\\sqrt[3]{27}$ is rational.', tex: '\\sqrt[3]{27} = 3', why: 'A cube root asks "what number times itself three times gives $27$?" Since $3 \\cdot 3 \\cdot 3 = 27$, the answer is the integer $3$.' },
        { text: '$\\sqrt[3]{10}$ is irrational.', tex: '2 < \\sqrt[3]{10} < 3', why: '$2^3 = 8$ and $3^3 = 27$, so no integer cubes to $10$. The cube root of a whole number that is not a perfect cube is irrational.' },
        { text: '$\\sqrt{12}$ is irrational.', tex: '3 < \\sqrt{12} < 4', why: '$12$ is between the perfect squares $9$ and $16$, so it is not a perfect square, and its square root is irrational.' },
      ],
      answer: 'Rational: $\\sqrt{\\frac{4}{9}} = \\frac{2}{3}$ and $\\sqrt[3]{27} = 3$. Irrational: $\\sqrt[3]{10}$ and $\\sqrt{12}$.',
    },
    {
      title: 'A common mistake: trusting the calculator screen',
      kind: 'common-mistake',
      problem: [{ t: 'p', text: 'A student types $\\sqrt{2}$ into a calculator and sees $1.414213562$. The student says: "That decimal stops, so $\\sqrt{2}$ is rational." What went wrong?' }],
      steps: [
        { text: 'Spot the error.', why: 'The calculator only has room for about 10 digits, so it **rounds**. The screen shows an approximation, not the exact value.' },
        { text: 'Test the shorter decimal $1.4142$.', tex: '1.4142^2 = 1.99996164', why: 'If $1.4142$ were exactly $\\sqrt{2}$, its square would be exactly $2$. It is close but not equal, and the same happens with every decimal that stops.' },
        { text: 'Use what we know about $2$.', why: '$2$ is not a perfect square ($1 < 2 < 4$), so $\\sqrt{2}$ is irrational. Its decimal $1.41421356\\ldots$ never ends and never repeats.' },
      ],
      answer: '$\\sqrt{2}$ is irrational. $1.414213562$ is a rational approximation of it.',
    },
    {
      title: 'A square tile with area 2',
      kind: 'real-world',
      problem: [{ t: 'p', text: 'A square floor tile has an area of $2$ square feet. Find its exact side length and its exact perimeter. Are they rational or irrational? About how long is the perimeter?' }],
      steps: [
        { text: 'Find the side length.', tex: 's^2 = 2 \\;\\Rightarrow\\; s = \\sqrt{2} \\text{ ft}', why: 'The area of a square is side times side, so the side is the positive square root of the area.' },
        { text: 'Classify the side.', why: '$2$ is not a perfect square, so $\\sqrt{2}$ is irrational.' },
        { text: 'Find the perimeter.', tex: 'P = 4s = 4\\sqrt{2} \\text{ ft}', why: 'A square has four equal sides.' },
        { text: 'Classify the perimeter.', why: '$4$ is a nonzero rational number and $\\sqrt{2}$ is irrational. A nonzero rational times an irrational is always irrational.' },
        { text: 'Estimate for measuring.', tex: '4\\sqrt{2} \\approx 4(1.4142) = 5.6568 \\approx 5.66 \\text{ ft}', why: 'A tape measure needs a decimal, so we use a rounded (rational) approximation.' },
      ],
      answer: 'Side $\\sqrt{2}$ ft and perimeter $4\\sqrt{2}$ ft are both irrational; the perimeter is about $5.66$ ft.',
    },
    {
      title: 'When two irrationals combine',
      kind: 'challenging',
      problem: [{ t: 'p', text: 'Each expression combines two irrational numbers. Decide whether each result is rational or irrational: (a) $\\sqrt{2} \\cdot \\sqrt{8}$, (b) $\\sqrt{2} \\cdot \\sqrt{3}$, (c) $(3 + \\sqrt{2}) + (5 - \\sqrt{2})$.' }],
      steps: [
        { text: '(a) Multiply under one root.', tex: '\\sqrt{2} \\cdot \\sqrt{8} = \\sqrt{16} = 4', why: 'For non-negative numbers, $\\sqrt{a} \\cdot \\sqrt{b} = \\sqrt{ab}$. Since $16$ is a perfect square, the product is the rational number $4$.' },
        { text: '(b) Multiply under one root.', tex: '\\sqrt{2} \\cdot \\sqrt{3} = \\sqrt{6}', why: '$6$ is not a perfect square ($4 < 6 < 9$), so $\\sqrt{6}$ is irrational.' },
        { text: '(c) Check that both parts are irrational.', why: '$3 + \\sqrt{2}$ and $5 - \\sqrt{2}$ are each a rational plus (or minus) an irrational, so each one is irrational.' },
        { text: '(c) Add them.', tex: '(3 + \\sqrt{2}) + (5 - \\sqrt{2}) = 3 + 5 + \\sqrt{2} - \\sqrt{2} = 8', why: 'The $\\sqrt{2}$ parts are opposites, so they cancel, leaving the rational number $8$.' },
      ],
      answer: '(a) $4$, rational; (b) $\\sqrt{6}$, irrational; (c) $8$, rational. Two irrationals can give either kind of answer.',
    },
  ],
  teachMeAgain: [
    {
      approach: 'visual',
      title: 'Nesting boxes',
      blocks: [
        { t: 'p', text: 'Picture the number sets as boxes inside boxes:' },
        { t: 'math', tex: '\\text{Natural} \\subset \\text{Whole} \\subset \\text{Integers} \\subset \\text{Rational} \\subset \\text{Real}' },
        { t: 'p', text: 'The **irrational** numbers are in their own box, side by side with the rational box. Both boxes sit inside the big **real** box, and nothing is in both.' },
        {
          t: 'table',
          headers: ['Number', 'Rational box?', 'Irrational box?'],
          rows: [
            ['$5$', 'yes (natural, whole, integer too)', 'no'],
            ['$-\\frac{1}{2}$', 'yes', 'no'],
            ['$0.\\overline{6}$', 'yes ($= \\frac{2}{3}$)', 'no'],
            ['$\\sqrt{10}$', 'no', 'yes'],
            ['$\\pi$', 'no', 'yes'],
          ],
        },
      ],
    },
    {
      approach: 'step-by-step',
      title: 'A 4-question checklist',
      blocks: [
        {
          t: 'list',
          ordered: true,
          items: [
            '**Is it an integer or a fraction of integers?** Then it is rational. ($-3$, $\\frac{7}{2}$)',
            '**Is it a decimal that stops or repeats?** Then it is rational. ($0.6$, $0.\\overline{45}$)',
            '**Is it a root?** Simplify first. If the number under the square root is a perfect square (or under the cube root a perfect cube), it is rational: $\\sqrt{36} = 6$. If not, it is irrational: $\\sqrt{35}$.',
            '**Is it $\\pi$, or a decimal that never stops and never repeats?** Then it is irrational.',
          ],
        },
        { t: 'callout', variant: 'tip', text: 'For a sum or product, simplify first, then run the checklist on the answer. $\\sqrt{3} \\cdot \\sqrt{3} = 3$, which is rational.' },
      ],
    },
    {
      approach: 'prerequisite',
      title: 'Refresher: perfect squares, cubes and decimals',
      blocks: [
        { t: 'list', items: ['Perfect squares: $1, 4, 9, 16, 25, 36, 49, 64, 81, 100, 121, 144$. So $\\sqrt{144} = 12$.', 'Perfect cubes: $1, 8, 27, 64, 125$. So $\\sqrt[3]{64} = 4$ because $4 \\cdot 4 \\cdot 4 = 64$.', 'A fraction becomes a decimal by dividing: $\\frac{1}{8} = 1 \\div 8 = 0.125$ (stops) and $\\frac{2}{3} = 2 \\div 3 = 0.666\\ldots$ (repeats).', 'Fractions add with a common denominator: $\\frac{1}{2} + \\frac{1}{3} = \\frac{3}{6} + \\frac{2}{6} = \\frac{5}{6}$.'] },
        { t: 'p', text: 'Any number whose decimal stops or repeats came from a fraction, so it is rational.' },
      ],
    },
    {
      approach: 'analogy',
      title: 'A stain that will not wash out',
      blocks: [
        { t: 'p', text: 'Think of an irrational number as a stain and rational numbers as clean water.' },
        { t: 'list', items: ['Clean water plus clean water is still clean: rational + rational is rational.', 'Add clean water to a stain and the stain is still there: rational + irrational is irrational. Diluting with a nonzero amount (multiplying by a nonzero rational) does not remove it either.', 'Multiplying by $0$ throws everything away, stain included: $0 \\cdot \\sqrt{5} = 0$.', 'Two stains can sometimes cancel each other out, like $\\sqrt{2}$ and $-\\sqrt{2}$, which add to $0$. So irrational + irrational has to be checked case by case.'] },
      ],
    },
    {
      approach: 'simpler-example',
      title: 'Start with one-digit repeats',
      blocks: [
        { t: 'p', text: 'You already know $\\frac{1}{3} = 0.333\\ldots$ and $\\frac{2}{3} = 0.666\\ldots$ So repeating decimals come from fractions.' },
        { t: 'p', text: 'Try $x = 0.777\\ldots$ One digit repeats, so multiply by $10$:' },
        { t: 'math', tex: '10x = 7.777\\ldots \\qquad 10x - x = 7 \\qquad 9x = 7 \\qquad x = \\frac{7}{9}' },
        { t: 'p', text: 'Check: $7 \\div 9 = 0.777\\ldots$ It works. Every repeating decimal can be turned into a fraction this way, so every repeating decimal is rational.' },
      ],
    },
    {
      approach: 'alternate-strategy',
      title: 'Undo it to test closure',
      blocks: [
        { t: 'p', text: 'To decide whether rational + irrational could be rational, try to **undo** the addition.' },
        { t: 'p', text: 'Suppose $2 + \\sqrt{3}$ equaled some fraction, say $q$. Undo the $+2$ by subtracting $2$: $\\sqrt{3} = q - 2$. A fraction minus $2$ is still a fraction, so $\\sqrt{3}$ would be a fraction. It is not, so $2 + \\sqrt{3}$ cannot be a fraction.' },
        { t: 'p', text: 'The same move works for products: if $5\\sqrt{3} = q$, then dividing by $5$ gives $\\sqrt{3} = \\frac{q}{5}$, again impossible. That is why a nonzero rational times an irrational is irrational.' },
      ],
    },
  ],
  guided: [
    { generator: 'u3.classify-number', difficulty: 1 },
    { generator: 'u3.which-irrational', difficulty: 1 },
    { generator: 'u3.closure-type', difficulty: 1 },
    { generator: 'u3.classify-number', difficulty: 1 },
  ],
  independent: {
    count: 8,
    reviewCount: 2,
    mix: [
      { generator: 'u3.classify-number', difficulty: 1, weight: 1 },
      { generator: 'u3.classify-number', difficulty: 2, weight: 2 },
      { generator: 'u3.which-irrational', difficulty: 2, weight: 1 },
      { generator: 'u3.closure-type', difficulty: 1, weight: 1 },
      { generator: 'u3.closure-type', difficulty: 2, weight: 2 },
      { generator: 'u3.closure-type', difficulty: 3, weight: 1 },
    ],
  },
  quiz: {
    items: [
      { generator: 'u3.classify-number', difficulty: 2 },
      { generator: 'u3.classify-number', difficulty: 3 },
      { generator: 'u3.which-irrational', difficulty: 2 },
      { generator: 'u3.closure-type', difficulty: 2 },
      { generator: 'u3.closure-type', difficulty: 3 },
      { generator: 'u3.closure-type', difficulty: 2 },
    ],
  },
  summary: [
    'A **rational** number can be written as $\\frac{a}{b}$ with integers $a$ and $b \\ne 0$. Integers, terminating decimals and repeating decimals are all rational.',
    'An **irrational** number has a decimal that never ends and never repeats: square roots of non-perfect squares like $\\sqrt{2}$, cube roots of non-perfect cubes like $\\sqrt[3]{10}$, and $\\pi$. Values like $3.14$ and $\\frac{22}{7}$ are only rational approximations.',
    'Rational + rational and rational $\\times$ rational are always rational. Rational + irrational is always irrational, and so is a **nonzero** rational $\\times$ irrational ($0$ times anything is $0$).',
    'Irrational + irrational and irrational $\\times$ irrational can be either: $\\sqrt{2} \\cdot \\sqrt{8} = 4$ is rational, but $\\sqrt{2} \\cdot \\sqrt{3} = \\sqrt{6}$ is irrational.',
  ],
  mastery: { quizPassScore: 0.8, practiceMinCorrect: 5 },
};
