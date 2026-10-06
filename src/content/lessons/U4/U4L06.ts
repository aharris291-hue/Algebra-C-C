import type { LessonContent } from '../../../core/curriculum/types';

/**
 * U4L06 Solving Quadratics by Factoring (A.PAR.6.3)
 * The zero product property and why it needs a product equal to 0, rewriting in = 0 form first,
 * factoring completely, never dividing by x, constant factors, double roots, checking solutions,
 * the link to x-intercepts, and keeping only the solutions that make sense in context (S4.09).
 *
 * Math verified by hand (2026-10-06): every equation, factorization, solution, substitution check, graph intercept and context answer below was recomputed independently.
 */
export const U4L06: LessonContent = {
  lessonId: 'U4L06',
  goal: 'Solve quadratic equations like $x^2 + 2x - 15 = 0$ by factoring and the zero product property, check each solution, and decide which solutions make sense in a real situation.',
  needToKnow: [
    { t: 'p', text: 'This lesson puts factoring to work. You will need:' },
    {
      t: 'list',
      items: [
        '**Factoring trinomials.** $x^2 + 2x - 15 = (x + 5)(x - 3)$ and $2x^2 + 5x - 3 = (2x - 1)(x + 3)$.',
        '**Taking out a GCF.** $x^2 - 6x = x(x - 6)$ and $-16t^2 + 32t = -16t(t - 2)$.',
        '**Solving one-step and two-step linear equations.** $x + 5 = 0$ gives $x = -5$, and $2x - 1 = 0$ gives $x = \\tfrac{1}{2}$.',
      ],
    },
    { t: 'callout', variant: 'tip', title: 'Quick check', text: 'Factor $x^2 - 7x + 10$. (You should get $(x - 2)(x - 5)$.) If that felt shaky, open **Teach Me Again** and choose the refresher.' },
  ],
  vocabulary: [
    { term: 'quadratic equation', meaning: 'An equation that can be written as $ax^2 + bx + c = 0$ with $a \\ne 0$.' },
    { term: 'standard form', meaning: 'A quadratic equation with all terms on one side and $0$ on the other: $ax^2 + bx + c = 0$.' },
    { term: 'zero product property', meaning: 'If $A \\cdot B = 0$, then $A = 0$ or $B = 0$ (or both).' },
    { term: 'solution (root)', meaning: 'A value of the variable that makes the equation true.' },
    { term: 'zero of a function', meaning: 'An input that makes the output $0$. The zeros of $y = x^2 + 2x - 15$ are $-5$ and $3$, where the graph crosses the x-axis.' },
    { term: 'double root', meaning: 'A solution that comes from a repeated factor, like $x = 3$ in $(x - 3)^2 = 0$.' },
  ],
  instruction: [
    { t: 'p', text: '### The zero product property' },
    { t: 'p', text: 'If two numbers multiply to $0$, at least one of them must be $0$. There is no other way to get a product of zero.' },
    { t: 'math', tex: 'A \\cdot B = 0 \\quad \\Longrightarrow \\quad A = 0 \\;\\text{ or }\\; B = 0' },
    { t: 'p', text: 'So to solve $(x + 5)(x - 3) = 0$, set each factor equal to $0$:' },
    { t: 'math', tex: 'x + 5 = 0 \\;\\Rightarrow\\; x = -5 \\qquad \\text{or} \\qquad x - 3 = 0 \\;\\Rightarrow\\; x = 3' },
    { t: 'callout', variant: 'why', title: 'Why the other side must be zero', text: 'Zero is special. If $A \\cdot B = 6$, the factors could be $2$ and $3$, or $1$ and $6$, or $12$ and $\\tfrac{1}{2}$, or infinitely many other pairs, so knowing the product tells you nothing about either factor. Only a product of $0$ forces a factor to be $0$. That is why you must always get $0$ alone on one side **before** you factor.' },
    { t: 'p', text: '### The steps' },
    {
      t: 'list',
      ordered: true,
      items: [
        '**Rewrite in standard form**, with $0$ on one side: $ax^2 + bx + c = 0$.',
        '**Factor completely.** Take out a GCF first.',
        '**Set each factor equal to 0** (skip a constant factor like $2$, which can never be $0$).',
        '**Solve** each small equation.',
        '**Check** every solution in the **original** equation.',
      ],
    },
    { t: 'p', text: 'Example: solve $x^2 + x = 12$.' },
    { t: 'math', tex: '\\begin{aligned} x^2 + x - 12 &= 0 \\\\ (x + 4)(x - 3) &= 0 \\\\ x + 4 = 0 \\;\\text{ or }\\; x - 3 &= 0 \\\\ x = -4 \\;\\text{ or }\\; x &= 3 \\end{aligned}' },
    { t: 'p', text: '**Check:** $(-4)^2 + (-4) = 16 - 4 = 12$ and $3^2 + 3 = 9 + 3 = 12$. Both work.' },
    { t: 'callout', variant: 'warning', title: 'Never divide both sides by x', text: 'To solve $x^2 = 5x$, it is tempting to divide by $x$ and get $x = 5$. But that throws away a solution: $x = 0$ also works, since $0^2 = 5 \\cdot 0$. Dividing by $x$ is not allowed when $x$ might be $0$. Instead, subtract: $x^2 - 5x = 0$, so $x(x - 5) = 0$, and $x = 0$ or $x = 5$.' },
    { t: 'p', text: '### Solutions are x-intercepts' },
    { t: 'p', text: 'The solutions of $x^2 + 2x - 15 = 0$ are the inputs that make $y = x^2 + 2x - 15$ equal to $0$. On a graph, those are the points where the parabola crosses the x-axis.' },
    {
      t: 'graph',
      caption: 'The graph of y = x squared + 2x - 15 crosses the x-axis at x = -5 and x = 3, the two solutions.',
      spec: {
        xMin: -7,
        xMax: 5,
        yMin: -18,
        yMax: 10,
        xStep: 1,
        yStep: 2,
        functions: [{ expr: 'x^2+2x-15', label: 'y = x^2 + 2x - 15' }],
        points: [
          { x: -5, y: 0, label: '(-5, 0)' },
          { x: 3, y: 0, label: '(3, 0)' },
        ],
        ariaLabel: 'An upward-opening parabola with its lowest point at (-1, -16), crossing the x-axis at (-5, 0) and (3, 0).',
      },
    },
    { t: 'p', text: '### Special cases' },
    {
      t: 'list',
      items: [
        '**A constant factor:** $2(x - 4)(x + 1) = 0$. The $2$ can never be $0$, so the solutions come from the other factors: $x = 4$ or $x = -1$.',
        '**A double root:** $x^2 - 6x + 9 = 0$ factors as $(x - 3)^2 = 0$. Both factors give the same answer, so there is only one solution, $x = 3$. The graph just touches the x-axis there.',
        '**A factor of x:** in $x(x + 7) = 0$, the factor $x$ itself can be $0$, so $x = 0$ is a solution, along with $x = -7$.',
      ],
    },
    { t: 'p', text: '### Solutions in context' },
    { t: 'p', text: 'A ball is tossed up from a 48-foot balcony, and its height in feet after $t$ seconds is $h(t) = -16t^2 + 32t + 48$. When does it hit the ground? The ground is height $0$:' },
    { t: 'math', tex: '-16t^2 + 32t + 48 = 0 \\;\\Rightarrow\\; -16(t^2 - 2t - 3) = 0 \\;\\Rightarrow\\; -16(t - 3)(t + 1) = 0' },
    { t: 'p', text: 'So $t = 3$ or $t = -1$. Time $t = -1$ would be one second **before** the ball was tossed, so it does not fit the situation. The ball hits the ground after **3 seconds**.' },
    { t: 'callout', variant: 'realworld', title: 'Does the answer make sense?', text: 'Both solutions are correct for the equation, but the situation decides which ones count. Times after a launch cannot be negative, and lengths, widths and counts of people must be positive. Always say which solution you keep and why.' },
  ],
  examples: [
    {
      title: 'An equation that is already factored',
      kind: 'introductory',
      problem: [{ t: 'p', text: 'Solve $(x - 4)(x + 9) = 0$.' }],
      steps: [
        { text: 'Use the zero product property.', tex: 'x - 4 = 0 \\quad \\text{or} \\quad x + 9 = 0', why: 'The product is $0$, so at least one factor must be $0$.' },
        { text: 'Solve each equation.', tex: 'x = 4 \\quad \\text{or} \\quad x = -9', why: 'Add $4$ to both sides of the first; subtract $9$ from both sides of the second.' },
        { text: 'Check both solutions.', tex: '(4 - 4)(4 + 9) = 0 \\cdot 13 = 0, \\qquad (-9 - 4)(-9 + 9) = (-13) \\cdot 0 = 0', why: 'Each solution makes one factor $0$, so the product is $0$.' },
      ],
      answer: '$x = 4$ or $x = -9$',
    },
    {
      title: 'Factor, then solve',
      kind: 'intermediate',
      problem: [{ t: 'p', text: 'Solve $x^2 - 7x + 10 = 0$.' }],
      steps: [
        { text: 'Make sure one side is 0.', why: 'It already is, so we can factor right away.' },
        { text: 'Factor the trinomial.', tex: '(x - 2)(x - 5) = 0', why: 'We need two numbers that multiply to $10$ and add to $-7$: $-2$ and $-5$.' },
        { text: 'Set each factor equal to 0 and solve.', tex: 'x - 2 = 0 \\Rightarrow x = 2, \\qquad x - 5 = 0 \\Rightarrow x = 5', why: 'Zero product property.' },
        { text: 'Check in the original equation.', tex: '2^2 - 7(2) + 10 = 4 - 14 + 10 = 0, \\qquad 5^2 - 7(5) + 10 = 25 - 35 + 10 = 0', why: 'Both make the left side $0$.' },
      ],
      answer: '$x = 2$ or $x = 5$',
    },
    {
      title: 'Rearrange first, with a leading coefficient of 2',
      kind: 'intermediate',
      problem: [{ t: 'p', text: 'Solve $2x^2 + 5x = 3$.' }],
      steps: [
        { text: 'Rewrite in standard form.', tex: '2x^2 + 5x - 3 = 0', why: 'Subtract $3$ from both sides. The zero product property only works when one side is $0$.' },
        { text: 'Factor with the a·c method.', tex: '2x^2 + 6x - x - 3 = 2x(x + 3) - 1(x + 3) = (2x - 1)(x + 3) = 0', why: '$ac = -6$, and $6 \\cdot (-1) = -6$ with $6 + (-1) = 5$.' },
        { text: 'Set each factor equal to 0 and solve.', tex: '2x - 1 = 0 \\Rightarrow x = \\tfrac{1}{2}, \\qquad x + 3 = 0 \\Rightarrow x = -3', why: 'For $2x - 1 = 0$, add $1$ and then divide by $2$.' },
        { text: 'Check in the original equation.', tex: '2\\left(\\tfrac{1}{2}\\right)^2 + 5\\left(\\tfrac{1}{2}\\right) = \\tfrac{1}{2} + \\tfrac{5}{2} = 3, \\qquad 2(-3)^2 + 5(-3) = 18 - 15 = 3', why: 'Check in the **original** equation, $2x^2 + 5x = 3$, so that a mistake in rearranging would also show up.' },
      ],
      answer: '$x = \\tfrac{1}{2}$ or $x = -3$',
    },
    {
      title: 'A common mistake: dividing by x',
      kind: 'common-mistake',
      problem: [{ t: 'p', text: 'A student solves $x^2 = 6x$ by dividing both sides by $x$ and gets $x = 6$. What went wrong? Find all the solutions.' }],
      steps: [
        { text: 'Test $x = 0$ in the original equation.', tex: '0^2 = 6 \\cdot 0 \\;\\Rightarrow\\; 0 = 0', why: '$x = 0$ is a solution, but the student lost it. Dividing by $x$ secretly assumes $x \\ne 0$, and you cannot divide by $0$.' },
        { text: 'Rewrite in standard form instead.', tex: 'x^2 - 6x = 0', why: 'Subtracting $6x$ from both sides is always allowed and keeps every solution.' },
        { text: 'Factor out the GCF.', tex: 'x(x - 6) = 0', why: 'Both terms contain $x$.' },
        { text: 'Use the zero product property.', tex: 'x = 0 \\quad \\text{or} \\quad x - 6 = 0 \\Rightarrow x = 6', why: 'Check: $6^2 = 36$ and $6 \\cdot 6 = 36$. Both $0$ and $6$ work.' },
      ],
      answer: '$x = 0$ or $x = 6$. Never divide both sides by the variable; move everything to one side and factor.',
    },
    {
      title: 'When does the ball come back to balcony height?',
      kind: 'real-world',
      problem: [{ t: 'p', text: 'A ball is tossed up from a 48-foot balcony, and its height after $t$ seconds is $h(t) = -16t^2 + 32t + 48$ feet. When is the ball at a height of 48 feet? Explain what each solution means.' }],
      steps: [
        { text: 'Set the height equal to 48.', tex: '-16t^2 + 32t + 48 = 48', why: 'We want the times when the output $h(t)$ is $48$.' },
        { text: 'Rewrite in standard form.', tex: '-16t^2 + 32t = 0', why: 'Subtract $48$ from both sides so one side is $0$. Do not divide by $t$, or the solution $t = 0$ will be lost.' },
        { text: 'Factor out the GCF.', tex: '-16t(t - 2) = 0', why: 'The GCF of $-16t^2$ and $32t$ is $-16t$ (negative because the leading coefficient is negative). Check: $-16t \\cdot t = -16t^2$ and $-16t \\cdot (-2) = 32t$.' },
        { text: 'Use the zero product property.', tex: '-16t = 0 \\Rightarrow t = 0, \\qquad t - 2 = 0 \\Rightarrow t = 2', why: 'The factor $-16t$ is $0$ only when $t = 0$.' },
        { text: 'Check and interpret.', tex: 'h(2) = -16(4) + 32(2) + 48 = -64 + 64 + 48 = 48', why: 'Both times make sense here: $t = 0$ is the moment the ball leaves the balcony, and $t = 2$ is when it falls back past balcony height on the way down.' },
      ],
      answer: 'At $t = 0$ seconds (when it is tossed) and $t = 2$ seconds (on the way down).',
    },
    {
      title: 'A garden with a border',
      kind: 'challenging',
      problem: [{ t: 'p', text: 'A rectangular garden is 10 feet by 6 feet. You add a gravel border of the same width $x$ feet all the way around, and the garden plus border covers 96 square feet. How wide is the border?' }],
      steps: [
        { text: 'Write the outer dimensions.', tex: '\\text{length } 10 + 2x, \\quad \\text{width } 6 + 2x', why: 'The border adds $x$ on **both** ends of each side, so each dimension grows by $2x$.' },
        { text: 'Write the area equation and expand.', tex: '(10 + 2x)(6 + 2x) = 96 \\;\\Rightarrow\\; 60 + 32x + 4x^2 = 96', why: 'Area is length times width: $60 + 20x + 12x + 4x^2$.' },
        { text: 'Rewrite in standard form and take out the GCF.', tex: '4x^2 + 32x - 36 = 0 \\;\\Rightarrow\\; 4(x^2 + 8x - 9) = 0', why: 'Subtract $96$ from both sides. Every coefficient is divisible by $4$.' },
        { text: 'Factor and solve.', tex: '4(x + 9)(x - 1) = 0 \\;\\Rightarrow\\; x = -9 \\;\\text{ or }\\; x = 1', why: '$9 \\cdot (-1) = -9$ and $9 + (-1) = 8$. The factor $4$ is never $0$.' },
        { text: 'Choose the solution that fits and check.', tex: '(10 + 2)(6 + 2) = 12 \\cdot 8 = 96', why: 'A width cannot be negative, so reject $x = -9$. With $x = 1$ the outer rectangle is 12 ft by 8 ft, which covers 96 square feet.' },
      ],
      answer: 'The border is 1 foot wide. ($x = -9$ also solves the equation but is not a possible width.)',
    },
  ],
  teachMeAgain: [
    {
      approach: 'visual',
      title: 'See the solutions on a graph',
      blocks: [
        { t: 'p', text: 'Solve $x^2 - 2x - 8 = 0$. Factoring gives $(x - 4)(x + 2) = 0$, so $x = 4$ or $x = -2$.' },
        { t: 'p', text: 'Now look at the graph of $y = x^2 - 2x - 8$. It crosses the x-axis, where $y = 0$, at exactly those two inputs.' },
        {
          t: 'graph',
          caption: 'The graph of y = x squared - 2x - 8 crosses the x-axis at x = -2 and x = 4.',
          spec: {
            xMin: -5,
            xMax: 7,
            yMin: -10,
            yMax: 10,
            xStep: 1,
            yStep: 2,
            functions: [{ expr: 'x^2-2x-8', label: 'y = x^2 - 2x - 8' }],
            points: [
              { x: -2, y: 0, label: '(-2, 0)' },
              { x: 4, y: 0, label: '(4, 0)' },
            ],
            ariaLabel: 'An upward-opening parabola with its lowest point at (1, -9), crossing the x-axis at (-2, 0) and (4, 0).',
          },
        },
        { t: 'p', text: 'Each factor gives one crossing: $x + 2 = 0$ at $x = -2$, and $x - 4 = 0$ at $x = 4$.' },
      ],
    },
    {
      approach: 'simpler-example',
      title: 'Start with factored equations',
      blocks: [
        { t: 'p', text: '$x(x - 5) = 0$: either $x = 0$ or $x - 5 = 0$. Solutions: $x = 0$ or $x = 5$.' },
        { t: 'p', text: '$(x + 1)(x - 6) = 0$: either $x + 1 = 0$ or $x - 6 = 0$. Solutions: $x = -1$ or $x = 6$.' },
        { t: 'p', text: '$(x - 2)(x - 2) = 0$: both factors say $x = 2$. One solution: $x = 2$.' },
        { t: 'p', text: 'Now one that needs factoring first: $x^2 + 5x + 6 = 0$ becomes $(x + 2)(x + 3) = 0$, so $x = -2$ or $x = -3$.' },
      ],
    },
    {
      approach: 'analogy',
      title: 'Any zero wipes out the product',
      blocks: [
        { t: 'p', text: 'Think of a multiplication as a chain of switches wired in a row. The light stays on only if every switch is on. Zero is an "off" switch: if any factor is $0$, the whole product is $0$.' },
        { t: 'p', text: 'So when you see $(x + 5)(x - 3) = 0$, the light is off, and you ask: which switch could be off? Either $x + 5 = 0$ or $x - 3 = 0$. That gives $x = -5$ or $x = 3$.' },
        { t: 'p', text: 'If the equation were $(x + 5)(x - 3) = 7$, the light is on, and this trick tells you nothing. That is why you move everything to one side first.' },
      ],
    },
    {
      approach: 'prerequisite',
      title: 'Refresher: factoring and linear equations',
      blocks: [
        {
          t: 'list',
          items: [
            'Factor $x^2 + bx + c$ with two numbers that multiply to $c$ and add to $b$: $x^2 - x - 12 = (x - 4)(x + 3)$.',
            'Take out a GCF: $3x^2 + 12x = 3x(x + 4)$.',
            'Solve $x - 4 = 0$ by adding $4$: $x = 4$. Solve $x + 3 = 0$ by subtracting $3$: $x = -3$.',
            'Solve $3x - 2 = 0$ in two steps: $3x = 2$, so $x = \\tfrac{2}{3}$.',
          ],
        },
      ],
    },
    {
      approach: 'step-by-step',
      title: 'Five steps with a phone screen',
      blocks: [
        { t: 'p', text: 'A phone screen is 7 cm longer than it is wide, and its area is 60 square centimeters. If the width is $w$, then $w(w + 7) = 60$. Find the width.' },
        {
          t: 'list',
          ordered: true,
          items: [
            '**Standard form:** $w^2 + 7w = 60$, so $w^2 + 7w - 60 = 0$. (Do not set $w = 60$ or $w + 7 = 60$: the right side is not $0$.)',
            '**Factor:** multiply to $-60$, add to $7$: $12$ and $-5$. So $(w + 12)(w - 5) = 0$.',
            '**Set each factor to 0:** $w + 12 = 0$ or $w - 5 = 0$.',
            '**Solve:** $w = -12$ or $w = 5$.',
            '**Check and interpret:** a width cannot be negative, so $w = 5$. The screen is 5 cm by 12 cm, and $5 \\cdot 12 = 60$.',
          ],
        },
      ],
    },
    {
      approach: 'alternate-strategy',
      title: 'Find the zeros in a table',
      blocks: [
        { t: 'p', text: 'Another way to see the solutions of $x^2 - x - 6 = 0$: make a table of values for $x^2 - x - 6$ and look for outputs of $0$.' },
        {
          t: 'table',
          caption: 'Values of x squared - x - 6. The output is 0 at x = -2 and x = 3.',
          headers: ['$x$', '$-3$', '$-2$', '$-1$', '$0$', '$1$', '$2$', '$3$', '$4$'],
          rows: [['$x^2 - x - 6$', '$6$', '$0$', '$-4$', '$-6$', '$-6$', '$-4$', '$0$', '$6$']],
        },
        { t: 'p', text: 'The outputs are $0$ at $x = -2$ and $x = 3$. Factoring agrees: $x^2 - x - 6 = (x - 3)(x + 2)$, so $x = 3$ or $x = -2$.' },
        { t: 'callout', variant: 'tip', text: 'A table only finds solutions you happen to test. Factoring finds all of them, even fractions like $x = \\tfrac{1}{2}$.' },
      ],
    },
  ],
  guided: [
    { generator: 'u4.solve-factoring', difficulty: 1 },
    { generator: 'u4.solve-factoring', difficulty: 1 },
    { generator: 'u4.solve-factoring', difficulty: 1 },
    { generator: 'u4.solve-factoring', difficulty: 1 },
  ],
  independent: {
    count: 8,
    reviewCount: 2,
    mix: [
      { generator: 'u4.solve-factoring', difficulty: 1, weight: 1 },
      { generator: 'u4.solve-factoring', difficulty: 2, weight: 3 },
      { generator: 'u4.solve-factoring', difficulty: 3, weight: 2 },
    ],
  },
  quiz: {
    items: [
      { generator: 'u4.solve-factoring', difficulty: 2 },
      { generator: 'u4.solve-factoring', difficulty: 2 },
      { generator: 'u4.solve-factoring', difficulty: 2 },
      { generator: 'u4.solve-factoring', difficulty: 3 },
      { generator: 'u4.solve-factoring', difficulty: 3 },
      { generator: 'u4.solve-factoring', difficulty: 3 },
    ],
  },
  summary: [
    'Zero product property: if $A \\cdot B = 0$, then $A = 0$ or $B = 0$. It only works when one side is $0$.',
    'Steps: rewrite as $ax^2 + bx + c = 0$, factor completely, set each factor equal to $0$, solve, and check in the original equation.',
    'Never divide both sides by $x$: $x^2 = 5x$ becomes $x(x - 5) = 0$, so $x = 0$ or $x = 5$.',
    'The solutions are the x-intercepts of the graph. In context, keep only solutions that make sense: the ball $h(t) = -16(t - 3)(t + 1)$ lands at $t = 3$, not $t = -1$.',
  ],
  mastery: { quizPassScore: 0.8, practiceMinCorrect: 5 },
};
