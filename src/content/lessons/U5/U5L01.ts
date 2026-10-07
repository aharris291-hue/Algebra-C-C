import type { LessonContent } from '../../../core/curriculum/types';

/**
 * U5L01 Properties of Exponents (A.PAR.8.1, A.MP.7)
 * The product, quotient, power-of-a-power, power-of-a-product and power-of-a-quotient rules, each justified by
 * writing out the repeated multiplication; the divide-by-the-base pattern that makes x^0 = 1 and x^-n = 1/x^n;
 * simplifying monomials with coefficients and negative exponents; the classic traps (multiplying the bases,
 * adding exponents for a power of a power, -3^2 vs (-3)^2, 2^-3 is not negative, forgetting to raise the
 * coefficient) (S5.01).
 *
 * Math verified by hand (2026-10-07): every power of 2 in the pattern table and graph points (2^-3 = 1/8 through
 * 2^4 = 16) was recomputed, every rule example was checked by expanding the repeated multiplication and by
 * evaluating both sides at a number (x = 2, y = 3), every numerical answer (2^3 * 2^4 = 128, 3^5 / 3^2 = 27,
 * (1/2)^-3 = 8, (2/3)^-2 = 9/4, 6^0 + 2^-2 = 5/4, 6.4 * 10^10 / (4 * 10^6) = 16,000) was recomputed, and every
 * simplified monomial was checked against the original expression at x = 2, y = 3.
 */
export const U5L01: LessonContent = {
  lessonId: 'U5L01',
  goal: 'Use the product, quotient and power rules to simplify expressions like $x^3 \\cdot x^2$, $\\frac{x^5}{x^2}$ and $(2x^3)^2$, explain why each rule works, and evaluate zero and negative exponents like $5^0$ and $2^{-3}$.',
  needToKnow: [
    { t: 'p', text: 'An **exponent** counts how many times a **base** is used as a factor:' },
    { t: 'math', tex: '2^4 = \\underbrace{2 \\cdot 2 \\cdot 2 \\cdot 2}_{4 \\text{ factors}} = 16 \\qquad x^3 = x \\cdot x \\cdot x' },
    { t: 'p', text: 'In Unit 4 you multiplied monomials and polynomials, like $(3x)(4x^2) = 12x^3$ and $2x(x^2 + 3) = 2x^3 + 6x$. This lesson explains the exponent part of that work and pushes it further, to zero and negative exponents.' },
    { t: 'callout', variant: 'tip', title: 'Quick check', text: 'Write $x^4$ as a product, and find $3^3$. (You should get $x \\cdot x \\cdot x \\cdot x$ and $3 \\cdot 3 \\cdot 3 = 27$.) If that felt shaky, open **Teach Me Again** and choose the refresher.' },
  ],
  vocabulary: [
    { term: 'base', meaning: 'The number or variable being multiplied. In $5^3$ the base is $5$.' },
    { term: 'exponent', meaning: 'The small raised number that tells how many times the base is a factor. In $5^3$ the exponent is $3$, so $5^3 = 5 \\cdot 5 \\cdot 5 = 125$.' },
    { term: 'power', meaning: 'An expression with a base and an exponent, like $5^3$ or $x^7$.' },
    { term: 'zero exponent', meaning: 'Any nonzero base raised to the $0$ power equals $1$: $a^0 = 1$ when $a \\ne 0$.' },
    { term: 'negative exponent', meaning: 'A negative exponent means the reciprocal of the positive power: $a^{-n} = \\frac{1}{a^n}$ when $a \\ne 0$. It does **not** make the number negative.' },
    { term: 'simplified (exponents)', meaning: 'One numerical coefficient, each variable written once, and only positive exponents. For example, $\\frac{2x^3}{y^2}$ is simplified; $2x^3y^{-2}$ is not yet.' },
  ],
  instruction: [
    { t: 'p', text: '### The product rule: same base, add the exponents' },
    { t: 'p', text: 'Write out what $x^3 \\cdot x^2$ means and count the factors:' },
    { t: 'math', tex: 'x^3 \\cdot x^2 = (x \\cdot x \\cdot x)(x \\cdot x) = x^5' },
    { t: 'p', text: 'There are $3$ factors of $x$, then $2$ more, so $3 + 2 = 5$ factors in all. **Why it works:** multiplying powers of the same base just puts more copies of that base in one long product, so the counts add.' },
    { t: 'math', tex: 'a^m \\cdot a^n = a^{m + n}' },
    { t: 'p', text: 'With numbers: $2^3 \\cdot 2^4 = 2^7 = 128$. Check: $8 \\cdot 16 = 128$. The base stays $2$; you never multiply the bases.' },
    { t: 'p', text: '### The quotient rule: same base, subtract the exponents' },
    { t: 'math', tex: '\\frac{x^5}{x^2} = \\frac{x \\cdot x \\cdot x \\cdot \\cancel{x} \\cdot \\cancel{x}}{\\cancel{x} \\cdot \\cancel{x}} = x^3' },
    { t: 'p', text: 'Each $x$ on the bottom cancels one $x$ on top, because $\\frac{x}{x} = 1$. Two factors cancel, so $5 - 2 = 3$ are left.' },
    { t: 'math', tex: '\\frac{a^m}{a^n} = a^{m - n} \\quad (a \\ne 0)' },
    { t: 'p', text: 'With numbers: $\\frac{3^5}{3^2} = 3^3 = 27$. Check: $\\frac{243}{9} = 27$.' },
    { t: 'p', text: '### The power rules: a power raised to a power' },
    { t: 'p', text: '**Power of a power.** $(x^2)^3$ means three copies of $x^2$:' },
    { t: 'math', tex: '(x^2)^3 = x^2 \\cdot x^2 \\cdot x^2 = x^{2 + 2 + 2} = x^6' },
    { t: 'p', text: 'Adding $2$ three times is $2 \\cdot 3$, so you **multiply** the exponents: $(a^m)^n = a^{mn}$.' },
    { t: 'p', text: '**Power of a product.** $(2x)^3$ means three copies of $2x$, and every factor inside gets used three times:' },
    { t: 'math', tex: '(2x)^3 = (2x)(2x)(2x) = (2 \\cdot 2 \\cdot 2)(x \\cdot x \\cdot x) = 8x^3' },
    { t: 'p', text: 'So $(ab)^n = a^n b^n$. The coefficient gets raised to the power too. The same idea works for a fraction: $\\left(\\frac{a}{b}\\right)^n = \\frac{a^n}{b^n}$, for example $\\left(\\frac{x}{3}\\right)^2 = \\frac{x^2}{9}$.' },
    {
      t: 'table',
      caption: 'The rules of exponents, for a nonzero base. Each one comes from writing out the repeated multiplication.',
      headers: ['Rule', 'In symbols', 'Example'],
      rows: [
        ['Product', '$a^m \\cdot a^n = a^{m+n}$', '$x^4 \\cdot x^6 = x^{10}$'],
        ['Quotient', '$\\frac{a^m}{a^n} = a^{m-n}$', '$\\frac{x^9}{x^3} = x^6$'],
        ['Power of a power', '$(a^m)^n = a^{mn}$', '$(x^3)^4 = x^{12}$'],
        ['Power of a product', '$(ab)^n = a^n b^n$', '$(2x^3)^2 = 4x^6$'],
        ['Power of a quotient', '$\\left(\\frac{a}{b}\\right)^n = \\frac{a^n}{b^n}$', '$\\left(\\frac{x}{3}\\right)^2 = \\frac{x^2}{9}$'],
        ['Zero exponent', '$a^0 = 1$', '$5^0 = 1$'],
        ['Negative exponent', '$a^{-n} = \\frac{1}{a^n}$', '$2^{-3} = \\frac{1}{8}$'],
      ],
    },
    { t: 'p', text: '### Zero and negative exponents: follow the pattern' },
    { t: 'p', text: 'Start at $2^4 = 16$ and lower the exponent by $1$ each time. Each step down **divides by the base**, $2$. Keep the pattern going past $2^1$:' },
    {
      t: 'table',
      caption: 'Each time the exponent goes down by 1, the value is divided by 2.',
      headers: ['Power', '$2^4$', '$2^3$', '$2^2$', '$2^1$', '$2^0$', '$2^{-1}$', '$2^{-2}$', '$2^{-3}$'],
      rows: [['Value', '$16$', '$8$', '$4$', '$2$', '$1$', '$\\frac{1}{2}$', '$\\frac{1}{4}$', '$\\frac{1}{8}$']],
    },
    { t: 'p', text: 'Dividing $2$ by $2$ gives $1$, so $2^0 = 1$. Dividing again gives $\\frac{1}{2} = \\frac{1}{2^1}$, then $\\frac{1}{4} = \\frac{1}{2^2}$, then $\\frac{1}{8} = \\frac{1}{2^3}$. That is where the rules come from:' },
    { t: 'math', tex: 'a^0 = 1 \\qquad a^{-n} = \\frac{1}{a^n} \\qquad (a \\ne 0)' },
    {
      t: 'graph',
      caption: 'The points from the table lie on the curve y = 2^x. The heights stay positive even when x is negative.',
      spec: {
        xMin: -4,
        xMax: 5,
        yMin: -1,
        yMax: 17,
        yStep: 2,
        functions: [{ expr: '2^x', label: 'y = 2^x' }],
        points: [
          { x: -3, y: 0.125, label: '(-3, 1/8)' },
          { x: -1, y: 0.5, label: '(-1, 1/2)' },
          { x: 0, y: 1, label: '(0, 1)' },
          { x: 2, y: 4, label: '(2, 4)' },
          { x: 3, y: 8, label: '(3, 8)' },
          { x: 4, y: 16, label: '(4, 16)' },
        ],
        ariaLabel: 'The curve y = 2 to the x. It passes through (-3, 1/8), (-1, 1/2), (0, 1), (2, 4), (3, 8) and (4, 16). To the left it gets close to the x-axis but stays above it.',
      },
    },
    { t: 'callout', variant: 'why', title: 'The rules agree with each other', text: 'The quotient rule gives the same answers. $\\frac{x^3}{x^3} = x^{3 - 3} = x^0$, and anything nonzero divided by itself is $1$, so $x^0 = 1$. Also $\\frac{x^2}{x^5} = \\frac{x \\cdot x}{x \\cdot x \\cdot x \\cdot x \\cdot x} = \\frac{1}{x^3}$, and the quotient rule says it is $x^{2 - 5} = x^{-3}$. So $x^{-3} = \\frac{1}{x^3}$.' },
    { t: 'p', text: 'A negative exponent on a fraction flips the fraction: $\\left(\\frac{1}{2}\\right)^{-3} = \\frac{1}{(1/2)^3} = \\frac{1}{1/8} = 8$, and $\\left(\\frac{2}{3}\\right)^{-2} = \\left(\\frac{3}{2}\\right)^2 = \\frac{9}{4}$.' },
    { t: 'callout', variant: 'warning', title: 'Negative exponent does not mean negative number', text: '$2^{-3} = \\frac{1}{8}$, a small **positive** number. The negative sign in the exponent means "take the reciprocal," not "make it negative." Every power of a positive base is positive.' },
    { t: 'callout', variant: 'warning', title: 'Where is the negative sign?', text: '$(-3)^2 = (-3)(-3) = 9$, because the base is $-3$. But $-3^2 = -(3 \\cdot 3) = -9$, because the exponent only touches the $3$. Exponents come before the negative sign in the order of operations.' },
    { t: 'callout', variant: 'warning', title: 'These rules are for multiplying and dividing', text: 'There is no rule for adding powers: $x^2 + x^3$ cannot be combined, and it is **not** $x^5$. Check with $x = 2$: $4 + 8 = 12$, but $2^5 = 32$.' },
    { t: 'callout', variant: 'realworld', title: 'Where this shows up', text: 'Scientists write huge and tiny numbers with powers of $10$: a red blood cell is about $8 \\times 10^{-6}$ meters across, and Earth is about $1.5 \\times 10^{11}$ meters from the sun. Phone storage, computer memory and the spread of a viral video all use powers too.' },
  ],
  examples: [
    {
      title: 'One rule at a time',
      kind: 'introductory',
      problem: [{ t: 'p', text: 'Simplify (a) $x^4 \\cdot x^6$, (b) $\\frac{x^9}{x^3}$ and (c) $(x^3)^4$.' }],
      steps: [
        { text: '(a) Same base, multiplying: add the exponents.', tex: 'x^4 \\cdot x^6 = x^{4 + 6} = x^{10}', why: '$4$ factors of $x$ followed by $6$ more is $10$ factors of $x$.' },
        { text: '(b) Same base, dividing: subtract the exponents.', tex: '\\frac{x^9}{x^3} = x^{9 - 3} = x^6', why: 'The $3$ factors of $x$ on the bottom cancel $3$ of the $9$ on top, leaving $6$.' },
        { text: '(c) Power of a power: multiply the exponents.', tex: '(x^3)^4 = x^{3 \\cdot 4} = x^{12}', why: '$(x^3)^4$ is four copies of $x^3$: $3 + 3 + 3 + 3 = 12$ factors of $x$.' },
        { text: 'Check (b) with a number.', tex: 'x = 2: \\quad \\frac{2^9}{2^3} = \\frac{512}{8} = 64 = 2^6', why: 'Substituting a number is a fast way to catch a wrong rule. Notice that (b) is not $x^3$: you subtract the exponents, not divide them.' },
      ],
      answer: '(a) $x^{10}$; (b) $x^6$; (c) $x^{12}$.',
    },
    {
      title: 'Zero and negative exponents',
      kind: 'intermediate',
      problem: [{ t: 'p', text: 'Evaluate (a) $2^{-3}$, (b) $\\left(\\frac{1}{2}\\right)^{-3}$ and (c) $6^0 + 2^{-2}$.' }],
      steps: [
        { text: '(a) Rewrite the negative exponent as a reciprocal.', tex: '2^{-3} = \\frac{1}{2^3} = \\frac{1}{8}', why: 'In the pattern $8, 4, 2, 1, \\frac{1}{2}, \\frac{1}{4}, \\frac{1}{8}$, three steps below $2^0$ is $\\frac{1}{8}$. It is positive.' },
        { text: '(b) A negative exponent on a fraction flips it.', tex: '\\left(\\frac{1}{2}\\right)^{-3} = \\left(\\frac{2}{1}\\right)^{3} = 2^3 = 8', why: '$\\left(\\frac{1}{2}\\right)^{-3} = \\frac{1}{(1/2)^3} = \\frac{1}{1/8}$, and dividing $1$ by $\\frac{1}{8}$ gives $8$.' },
        { text: '(c) Evaluate each power, then add.', tex: '6^0 + 2^{-2} = 1 + \\frac{1}{4} = \\frac{5}{4}', why: 'Any nonzero base to the $0$ power is $1$, and $2^{-2} = \\frac{1}{2^2} = \\frac{1}{4}$. Exponents come before addition.' },
      ],
      answer: '(a) $\\frac{1}{8}$; (b) $8$; (c) $\\frac{5}{4}$.',
    },
    {
      title: 'Coefficients, two variables and a negative exponent',
      kind: 'intermediate',
      problem: [{ t: 'p', text: 'Simplify $\\frac{6x^5y^2}{3x^2y^4}$. Write the answer with positive exponents only.' }],
      steps: [
        { text: 'Divide the coefficients.', tex: '\\frac{6}{3} = 2', why: 'Coefficients are ordinary numbers, so you divide them normally. The exponent rules are only for the powers.' },
        { text: 'Use the quotient rule on each variable separately.', tex: 'x^{5 - 2} = x^3, \\qquad y^{2 - 4} = y^{-2}', why: 'Only powers with the same base combine, so handle $x$ and $y$ one at a time.' },
        { text: 'Rewrite the negative exponent.', tex: '2x^3y^{-2} = \\frac{2x^3}{y^2}', why: '$y^{-2} = \\frac{1}{y^2}$. That makes sense: there were more $y$\'s on the bottom ($4$) than on top ($2$), so $2$ of them are left on the bottom.' },
        { text: 'Check with $x = 2$, $y = 3$.', tex: '\\frac{6 \\cdot 32 \\cdot 9}{3 \\cdot 4 \\cdot 81} = \\frac{1728}{972} = \\frac{16}{9}, \\qquad \\frac{2 \\cdot 8}{9} = \\frac{16}{9}', why: 'Both forms give the same value, so the simplification is correct.' },
      ],
      answer: '$\\frac{2x^3}{y^2}$',
    },
    {
      title: 'Five common mistakes',
      kind: 'common-mistake',
      problem: [
        { t: 'p', text: 'Each of these is wrong. Find the mistake and fix it.' },
        { t: 'list', items: [
          '$2^3 \\cdot 2^4 = 4^7$',
          '$(x^3)^4 = x^7$',
          '$(2x^3)^2 = 2x^6$',
          '$-3^2 = 9$',
          '$2^{-3} = -8$',
        ] },
      ],
      steps: [
        { text: 'Do not multiply the bases.', tex: '2^3 \\cdot 2^4 = 2^7 = 128', why: '$2^3 \\cdot 2^4 = (2 \\cdot 2 \\cdot 2)(2 \\cdot 2 \\cdot 2 \\cdot 2)$: seven factors of $2$, not of $4$. Check: $8 \\cdot 16 = 128$, while $4^7 = 16{,}384$.' },
        { text: 'A power of a power multiplies the exponents.', tex: '(x^3)^4 = x^{12}', why: 'Four copies of $x^3$ is $3 + 3 + 3 + 3 = 12$ factors. Adding the exponents is the product rule, which is for $x^3 \\cdot x^4 = x^7$.' },
        { text: 'Raise the coefficient too.', tex: '(2x^3)^2 = 2^2 (x^3)^2 = 4x^6', why: '$(2x^3)^2 = (2x^3)(2x^3)$, and $2 \\cdot 2 = 4$. Every factor inside the parentheses gets the exponent.' },
        { text: 'The exponent touches only the $3$.', tex: '-3^2 = -(3^2) = -9', why: 'Without parentheses the base is $3$, not $-3$. Only $(-3)^2 = (-3)(-3) = 9$.' },
        { text: 'A negative exponent means a reciprocal.', tex: '2^{-3} = \\frac{1}{2^3} = \\frac{1}{8}', why: 'The pattern $2^0 = 1$, $2^{-1} = \\frac{1}{2}$, $2^{-2} = \\frac{1}{4}$ keeps dividing by $2$, so it never becomes negative.' },
      ],
      answer: '$2^7 = 128$; $x^{12}$; $4x^6$; $-9$; $\\frac{1}{8}$.',
    },
    {
      title: 'How many songs fit on a phone?',
      kind: 'real-world',
      problem: [{ t: 'p', text: 'Maya\'s phone has $64$ GB of free space, which is about $6.4 \\times 10^{10}$ bytes. A typical song file is about $4 \\times 10^6$ bytes. About how many songs can she store?' }],
      steps: [
        { text: 'Set up a division.', tex: '\\frac{6.4 \\times 10^{10}}{4 \\times 10^6}', why: 'To find how many songs fit, divide the total space by the size of one song. Both are in bytes, so the bytes cancel and the answer is a number of songs.' },
        { text: 'Divide the numbers in front and the powers of $10$ separately.', tex: '\\frac{6.4}{4} \\times \\frac{10^{10}}{10^6} = 1.6 \\times 10^{10 - 6} = 1.6 \\times 10^4', why: 'Multiplication can be regrouped, and the quotient rule says to subtract the exponents of the same base.' },
        { text: 'Write it as a regular number.', tex: '1.6 \\times 10^4 = 1.6 \\times 10{,}000 = 16{,}000', why: '$10^4$ is $1$ followed by $4$ zeros.' },
      ],
      answer: 'About $16{,}000$ songs.',
    },
    {
      title: 'Power of a product with negative exponents',
      kind: 'challenging',
      problem: [{ t: 'p', text: 'Simplify (a) $\\frac{(2x^3y^{-2})^2}{4xy}$ and (b) $(x^{-2}y^3)^{-2}$. Use positive exponents only.' }],
      steps: [
        { text: '(a) Square every factor in the parentheses.', tex: '(2x^3y^{-2})^2 = 2^2 x^{3 \\cdot 2} y^{-2 \\cdot 2} = 4x^6y^{-4}', why: 'Power of a product: the $2$, the $x^3$ and the $y^{-2}$ are each raised to the power $2$. A power of a power multiplies exponents, even negative ones.' },
        { text: 'Divide by $4xy$ one base at a time.', tex: '\\frac{4x^6y^{-4}}{4x^1y^1} = 1 \\cdot x^{6 - 1} y^{-4 - 1} = x^5y^{-5}', why: '$x$ means $x^1$. Subtracting exponents: $-4 - 1 = -5$.' },
        { text: 'Rewrite with positive exponents.', tex: 'x^5y^{-5} = \\frac{x^5}{y^5}', why: '$y^{-5} = \\frac{1}{y^5}$. A coefficient of $1$ does not need to be written.' },
        { text: '(b) Multiply each exponent by $-2$.', tex: '(x^{-2}y^3)^{-2} = x^{(-2)(-2)} y^{(3)(-2)} = x^4y^{-6} = \\frac{x^4}{y^6}', why: 'A negative times a negative is positive, so the $x$ ends up with exponent $4$. The $y$ gets $3 \\cdot (-2) = -6$, which moves it to the bottom.' },
        { text: 'Check (b) with $x = 2$, $y = 1$.', tex: '(2^{-2} \\cdot 1)^{-2} = \\left(\\frac{1}{4}\\right)^{-2} = 16, \\qquad \\frac{2^4}{1^6} = 16', why: 'The original and the simplified form agree.' },
      ],
      answer: '(a) $\\frac{x^5}{y^5}$; (b) $\\frac{x^4}{y^6}$.',
    },
  ],
  teachMeAgain: [
    {
      approach: 'visual',
      title: 'Watch the pattern on a graph',
      blocks: [
        { t: 'p', text: 'Plot the powers of $2$. Moving one step left on the graph means lowering the exponent by $1$, and the height is cut in half each time.' },
        {
          t: 'graph',
          caption: 'Powers of 2 from 2^-2 to 2^3. Every step to the left halves the height, so 2^0 = 1 and 2^-1 = 1/2.',
          spec: {
            xMin: -3,
            xMax: 4,
            yMin: -1,
            yMax: 9,
            functions: [{ expr: '2^x', label: 'y = 2^x', dashed: true }],
            points: [
              { x: -2, y: 0.25, label: '(-2, 1/4)' },
              { x: -1, y: 0.5, label: '(-1, 1/2)' },
              { x: 0, y: 1, label: '(0, 1)' },
              { x: 1, y: 2, label: '(1, 2)' },
              { x: 2, y: 4, label: '(2, 4)' },
              { x: 3, y: 8, label: '(3, 8)' },
            ],
            ariaLabel: 'Points (-2, 1/4), (-1, 1/2), (0, 1), (1, 2), (2, 4) and (3, 8) on the dashed curve y = 2 to the x. Each point is half as high as the point to its right.',
          },
        },
        { t: 'p', text: '$8 \\to 4 \\to 2 \\to 1 \\to \\frac{1}{2} \\to \\frac{1}{4}$. Halving $2$ gives $1$, so $2^0 = 1$. Halving again gives $\\frac{1}{2}$, so $2^{-1} = \\frac{1}{2}$. The points never go below the $x$-axis, which is why a negative exponent never makes a negative number.' },
      ],
    },
    {
      approach: 'simpler-example',
      title: 'Check every rule with small numbers',
      blocks: [
        { t: 'p', text: 'If you forget a rule, test it with $2$\'s, where you can do the arithmetic in your head.' },
        { t: 'list', items: [
          '**Product:** $2^3 \\cdot 2^2 = 8 \\cdot 4 = 32$, and $2^5 = 32$. So the exponents add: $3 + 2 = 5$.',
          '**Quotient:** $\\frac{2^5}{2^2} = \\frac{32}{4} = 8$, and $2^3 = 8$. So the exponents subtract: $5 - 2 = 3$.',
          '**Power of a power:** $(2^2)^3 = 4^3 = 64$, and $2^6 = 64$. So the exponents multiply: $2 \\cdot 3 = 6$.',
          '**Zero:** $\\frac{2^3}{2^3} = \\frac{8}{8} = 1$, and the quotient rule says $2^0$. So $2^0 = 1$.',
          '**Negative:** $\\frac{2^2}{2^5} = \\frac{4}{32} = \\frac{1}{8}$, and the quotient rule says $2^{-3}$. So $2^{-3} = \\frac{1}{8}$.',
        ] },
      ],
    },
    {
      approach: 'analogy',
      title: 'Counting factors, upstairs and downstairs',
      blocks: [
        { t: 'p', text: 'Think of an exponent as a **count** of how many copies of the base are in the product.' },
        { t: 'list', items: [
          'Multiplying is pouring two piles together: $3$ copies plus $2$ copies is $5$ copies, so $x^3 \\cdot x^2 = x^5$.',
          'Dividing is canceling copies on the bottom against copies on top: $5$ on top, $2$ on the bottom, $3$ left, so $\\frac{x^5}{x^2} = x^3$.',
          'A negative count means the copies are **downstairs**, under the fraction bar: $x^{-3} = \\frac{1}{x^3}$. Moving a factor across the fraction bar flips the sign of its exponent.',
          'A count of zero means no copies left at all, and an empty product is $1$, so $x^0 = 1$.',
        ] },
        { t: 'p', text: 'So $\\frac{x^2}{x^5}$ has $3$ more copies downstairs than upstairs: $\\frac{1}{x^3}$, or $x^{-3}$.' },
      ],
    },
    {
      approach: 'prerequisite',
      title: 'Refresher: what an exponent means, and multiplying monomials',
      blocks: [
        { t: 'p', text: 'An exponent is shorthand for repeated multiplication: $5^3 = 5 \\cdot 5 \\cdot 5 = 125$ and $x^4 = x \\cdot x \\cdot x \\cdot x$.' },
        { t: 'p', text: 'In Unit 4 you multiplied monomials like this:' },
        { t: 'math', tex: '(3x)(4x^2) = (3 \\cdot 4)(x \\cdot x^2) = 12x^3' },
        { t: 'p', text: 'The coefficients multiply as numbers ($3 \\cdot 4 = 12$). The variables are just counted: $x \\cdot x^2 = x \\cdot (x \\cdot x)$ is $3$ factors of $x$. That is the product rule. When you distributed $2x(x^2 + 3) = 2x^3 + 6x$, you used it again on the first term.' },
      ],
    },
    {
      approach: 'step-by-step',
      title: 'A recipe for simplifying a monomial',
      blocks: [
        { t: 'p', text: 'Simplify $(3x^{-2})(4x^5)$.' },
        { t: 'list', ordered: true, items: [
          '**Clear any outside exponent first** with the power rules. (None here.)',
          '**Combine the coefficients:** $3 \\cdot 4 = 12$.',
          '**Combine each variable separately:** $x^{-2} \\cdot x^5 = x^{-2 + 5} = x^3$.',
          '**Move negative exponents across the fraction bar** so every exponent is positive. (None left here.)',
          '**Check with a number:** at $x = 2$, $(3 \\cdot \\frac{1}{4})(4 \\cdot 32) = \\frac{3}{4} \\cdot 128 = 96$ and $12 \\cdot 8 = 96$.',
        ] },
        { t: 'p', text: 'So $(3x^{-2})(4x^5) = 12x^3$.' },
      ],
    },
    {
      approach: 'alternate-strategy',
      title: 'Write it out and cancel',
      blocks: [
        { t: 'p', text: 'You can always skip the rules and write every factor out. Simplify $\\frac{(2x^2)^3}{4x^4}$:' },
        { t: 'math', tex: '\\frac{(2x^2)^3}{4x^4} = \\frac{(2x^2)(2x^2)(2x^2)}{4x^4} = \\frac{8x^6}{4x^4} = \\frac{2 \\cdot \\cancel{4} \\cdot x \\cdot x \\cdot \\cancel{x^4}}{\\cancel{4} \\cdot \\cancel{x^4}} = 2x^2' },
        { t: 'p', text: 'With the rules: $(2x^2)^3 = 8x^6$, then $\\frac{8}{4} = 2$ and $x^{6 - 4} = x^2$. Same answer, $2x^2$. Writing it out is slower but it is a great way to check yourself when exponents get confusing.' },
      ],
    },
  ],
  guided: [
    { generator: 'u5.evaluate-powers', difficulty: 1 },
    { generator: 'u5.simplify-exponents', difficulty: 1 },
    { generator: 'u5.evaluate-powers', difficulty: 2 },
    { generator: 'u5.simplify-exponents', difficulty: 2 },
  ],
  independent: {
    count: 10,
    reviewCount: 2,
    mix: [
      { generator: 'u5.evaluate-powers', difficulty: 1, weight: 1 },
      { generator: 'u5.evaluate-powers', difficulty: 2, weight: 2 },
      { generator: 'u5.evaluate-powers', difficulty: 3, weight: 1 },
      { generator: 'u5.simplify-exponents', difficulty: 1, weight: 1 },
      { generator: 'u5.simplify-exponents', difficulty: 2, weight: 2 },
      { generator: 'u5.simplify-exponents', difficulty: 3, weight: 1 },
    ],
  },
  quiz: {
    items: [
      { generator: 'u5.evaluate-powers', difficulty: 1 },
      { generator: 'u5.evaluate-powers', difficulty: 2 },
      { generator: 'u5.evaluate-powers', difficulty: 3 },
      { generator: 'u5.simplify-exponents', difficulty: 1 },
      { generator: 'u5.simplify-exponents', difficulty: 2 },
      { generator: 'u5.simplify-exponents', difficulty: 2 },
      { generator: 'u5.simplify-exponents', difficulty: 3 },
    ],
  },
  summary: [
    'Same base, multiplying: add the exponents ($x^3 \\cdot x^2 = x^5$). Same base, dividing: subtract them ($\\frac{x^5}{x^2} = x^3$). Never multiply the bases.',
    'A power of a power multiplies the exponents ($(x^2)^3 = x^6$), and a power of a product raises every factor, coefficient included ($(2x^3)^2 = 4x^6$).',
    'Each step down in the exponent divides by the base, so $a^0 = 1$ and $a^{-n} = \\frac{1}{a^n}$ for $a \\ne 0$. A negative exponent means a reciprocal, not a negative number: $2^{-3} = \\frac{1}{8}$.',
    'Watch the base: $(-3)^2 = 9$ but $-3^2 = -9$.',
    'A simplified answer has one coefficient, each variable once and only positive exponents, like $\\frac{2x^3}{y^2}$. Check by substituting a number.',
  ],
  mastery: { quizPassScore: 0.8, practiceMinCorrect: 5 },
};
