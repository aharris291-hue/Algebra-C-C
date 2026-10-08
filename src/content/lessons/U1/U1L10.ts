import type { LessonContent } from '../../../core/curriculum/types';

/**
 * U1L10 Parent Functions: Linear vs Nonlinear (A.FGR.2.5)
 *
 * Math verified by hand (2026-10-04): every key point, table difference and graph point below was recomputed independently.
 */
export const U1L10: LessonContent = {
  lessonId: 'U1L10',
  goal: 'Recognize the six parent functions $f(x) = x$, $|x|$, $x^2$, $\\sqrt{x}$, $\\sqrt[3]{x}$ and $2^x$ by name, equation and graph, compare their key features, and decide whether a function is linear or nonlinear from a table, an equation, or a graph.',
  needToKnow: [
    { t: 'p', text: 'You will use these skills from earlier lessons:' },
    {
      t: 'list',
      items: [
        '**Domain and range.** The domain is every input a function can use; the range is every output it can give. For $y = 2x + 1$, both are all real numbers.',
        '**Increasing and decreasing.** A graph is increasing where it goes up as you move to the right, and decreasing where it goes down.',
        '**Powers and roots.** $(-2)^2 = 4$, $(-2)^3 = -8$, $\\sqrt{9} = 3$, $\\sqrt[3]{8} = 2$, and $|-5| = 5$.',
      ],
    },
    { t: 'callout', variant: 'tip', title: 'Quick check', text: 'What is $(-3)^2$? What is $(-3)^3$? (You should get $9$ and $-27$.) If that felt shaky, open **Teach Me Again** and choose the refresher.' },
  ],
  vocabulary: [
    { term: 'parent function', meaning: 'The simplest function of a family, like $f(x) = x^2$ for all quadratic functions.' },
    { term: 'linear function', meaning: 'A function with a constant rate of change. Its graph is a straight line.' },
    { term: 'nonlinear function', meaning: 'A function whose rate of change is not constant. Its graph is not a single straight line.' },
    { term: 'first differences', meaning: 'The changes in $y$ from one row of a table to the next.' },
    { term: 'vertex', meaning: 'The turning point of a V-shaped or U-shaped graph.' },
  ],
  instruction: [
    { t: 'p', text: '### Families of functions' },
    { t: 'p', text: 'Functions come in families. Every member of a family has the same basic shape, and the simplest member is called the **parent function**. Knowing the six parents below lets you recognize a graph at a glance.' },
    {
      t: 'table',
      caption: 'The six parent functions.',
      headers: ['Family', 'Parent', 'Shape', 'Domain', 'Range', 'Key points'],
      rows: [
        ['Linear', '$f(x) = x$', 'straight line through $(0, 0)$', 'all real numbers', 'all real numbers', '$(-1, -1), (0, 0), (1, 1)$'],
        ['Absolute value', '$f(x) = |x|$', 'V with its vertex at $(0, 0)$', 'all real numbers', '$y \\ge 0$', '$(-1, 1), (0, 0), (1, 1)$'],
        ['Quadratic', '$f(x) = x^2$', 'U (a parabola) with its vertex at $(0, 0)$', 'all real numbers', '$y \\ge 0$', '$(-2, 4), (-1, 1), (0, 0), (1, 1), (2, 4)$'],
        ['Square root', '$f(x) = \\sqrt{x}$', 'half arch that starts at $(0, 0)$', '$x \\ge 0$', '$y \\ge 0$', '$(0, 0), (1, 1), (4, 2), (9, 3)$'],
        ['Cube root', '$f(x) = \\sqrt[3]{x}$', 'S lying on its side, through $(0, 0)$', 'all real numbers', 'all real numbers', '$(-8, -2), (-1, -1), (0, 0), (1, 1), (8, 2)$'],
        ['Exponential', '$f(x) = 2^x$', 'flat on the left, then shoots up', 'all real numbers', '$y > 0$', '$(-1, \\tfrac{1}{2}), (0, 1), (1, 2), (2, 4), (3, 8)$'],
      ],
    },
    {
      t: 'graph',
      caption: 'Linear f(x) = x and absolute value f(x) = |x|. Both pass through (0, 0) and (2, 2), but the V turns at its vertex.',
      spec: {
        xMin: -5,
        xMax: 5,
        yMin: -5,
        yMax: 5,
        functions: [
          { expr: 'x', label: 'f(x) = x' },
          { expr: 'abs(x)', label: 'f(x) = |x|' },
        ],
        points: [
          { x: 0, y: 0, label: '(0, 0)' },
          { x: 2, y: 2, label: '(2, 2)' },
          { x: -2, y: 2, label: '(-2, 2)' },
        ],
        ariaLabel: 'The line y = x rising through the origin, and the V-shaped graph of y = |x| with its vertex at the origin. Points marked at (0, 0), (2, 2) and (-2, 2).',
      },
    },
    {
      t: 'graph',
      caption: 'Quadratic f(x) = x² (a U) and cube root f(x) = ∛x (an S lying on its side).',
      spec: {
        xMin: -10,
        xMax: 10,
        yMin: -4,
        yMax: 12,
        xStep: 2,
        yStep: 2,
        functions: [
          { expr: 'x^2', label: 'f(x) = x²' },
          { expr: 'cbrt(x)', label: 'f(x) = ∛x' },
        ],
        points: [
          { x: 2, y: 4, label: '(2, 4)' },
          { x: -2, y: 4, label: '(-2, 4)' },
          { x: 8, y: 2, label: '(8, 2)' },
          { x: -8, y: -2, label: '(-8, -2)' },
        ],
        ariaLabel: 'A U-shaped parabola y = x squared through (-2, 4), (0, 0) and (2, 4), and the cube root curve, an S lying on its side, through (-8, -2), (0, 0) and (8, 2).',
      },
    },
    { t: 'callout', variant: 'why', title: 'Why can a cube root take negative inputs?', text: 'A square root asks "what number times itself gives this?" No real number squared is negative, so $\\sqrt{-8}$ is not real. A cube root asks "what number times itself **three** times gives this?" Since $(-2)(-2)(-2) = -8$, $\\sqrt[3]{-8} = -2$. Every real number has exactly one real cube root, so the domain **and** the range of $\\sqrt[3]{x}$ are all real numbers.' },
    {
      t: 'graph',
      caption: 'Square root f(x) = √x starts at (0, 0). Exponential f(x) = 2ˣ crosses the y-axis at (0, 1) and doubles every step to the right.',
      spec: {
        xMin: -3,
        xMax: 10,
        yMin: -1,
        yMax: 9,
        functions: [
          { expr: 'sqrt(x)', label: 'f(x) = √x', domain: [0, 10] },
          { expr: '2^x', label: 'f(x) = 2ˣ' },
        ],
        points: [
          { x: 0, y: 0, label: '(0, 0)' },
          { x: 4, y: 2, label: '(4, 2)' },
          { x: 9, y: 3, label: '(9, 3)' },
          { x: 0, y: 1, label: '(0, 1)' },
          { x: 3, y: 8, label: '(3, 8)' },
        ],
        ariaLabel: 'A square root curve starting at (0, 0) and rising slowly through (4, 2) and (9, 3), and an exponential curve that stays just above the x-axis on the left, crosses (0, 1) and rises steeply through (3, 8).',
      },
    },
    { t: 'callout', variant: 'why', title: 'Why does 2ˣ never touch the x-axis?', text: 'Moving left, each output is half of the one before: $2^0 = 1$, $2^{-1} = \\frac{1}{2}$, $2^{-2} = \\frac{1}{4}$, $2^{-3} = \\frac{1}{8}$. Halving a positive number always leaves a positive number, so the outputs get close to $0$ but never reach it. That is why the range is $y > 0$, not $y \\ge 0$.' },
    { t: 'p', text: '### Linear means a constant rate of change' },
    { t: 'p', text: '### Comparing key features' },
    { t: 'p', text: 'To tell parents apart, compare the same features you used for lines: where the graph **increases or decreases**, its **intercepts**, its **domain and range**, its **end behavior** (what happens far to the left and right), and whether it **curves** or turns at a sharp point.' },
    {
      t: 'table',
      caption: 'Key features of the six parent functions.',
      headers: ['Parent', 'Increasing / decreasing', 'x-intercept', 'End behavior', 'Curve'],
      rows: [
        ['$x$', 'increasing everywhere', '$(0, 0)$', 'down on the left, up on the right', 'straight, constant rate'],
        ['$|x|$', 'decreasing for $x < 0$, increasing for $x > 0$', '$(0, 0)$', 'up on both sides', 'sharp corner at the vertex'],
        ['$x^2$', 'decreasing for $x < 0$, increasing for $x > 0$', '$(0, 0)$', 'up on both sides', 'smooth U'],
        ['$\\sqrt{x}$', 'increasing (only $x \\ge 0$)', '$(0, 0)$', 'starts at the origin, rises slowly on the right', 'flattens as it goes'],
        ['$\\sqrt[3]{x}$', 'increasing everywhere', '$(0, 0)$', 'down on the left, up on the right', 'flattens as it goes, both ways'],
        ['$2^x$', 'increasing everywhere', 'none', 'approaches $0$ on the left, shoots up on the right', 'gets steeper and steeper'],
      ],
    },
    { t: 'p', text: 'Only one parent, $f(x) = x$, is **linear**. A function is linear when its rate of change is constant, so its graph is one straight line. In a table where $x$ goes up by the **same step** each time, a linear function has **equal first differences** in $y$.' },
    {
      t: 'table',
      caption: 'Equal x steps of 1. Only the first column of outputs has equal differences.',
      headers: ['$x$', '$y = 3x + 1$', '$y = x^2$', '$y = 2^x$'],
      rows: [
        ['0', '1', '0', '1'],
        ['1', '4', '1', '2'],
        ['2', '7', '4', '4'],
        ['3', '10', '9', '8'],
        ['4', '13', '16', '16'],
        ['differences', '3, 3, 3, 3 (linear)', '1, 3, 5, 7 (not linear)', '1, 2, 4, 8 (not linear)'],
      ],
    },
    { t: 'p', text: '### Spotting linear equations' },
    { t: 'p', text: 'An equation is linear if it can be written as $y = mx + b$. That means $x$ appears only to the **first power**, and it is not inside an absolute value, under a root, in an exponent, or in a denominator.' },
    {
      t: 'list',
      items: ['**Linear:** $y = 5 - 2x$, $\\;y = \\frac{x}{4}$ (that is $\\frac{1}{4}x$), $\\;3x + y = 6$ (that is $y = -3x + 6$).', '**Nonlinear:** $y = x^2 - 1$, $\\;y = |x| + 3$, $\\;y = \\sqrt{x}$, $\\;y = 3^x$, $\\;y = \\frac{4}{x}$.'],
    },
    { t: 'callout', variant: 'warning', title: 'Check the x steps first', text: 'Equal first differences only prove a function is linear when the $x$-values go up by equal steps. If the steps are uneven, compare $\\frac{\\text{change in } y}{\\text{change in } x}$ for each pair of rows instead.' },
  ],
  examples: [
    {
      title: 'Name the parent function from a graph',
      kind: 'introductory',
      problem: [
        { t: 'p', text: 'Which parent function is graphed? Is it linear or nonlinear? Give its domain and range.' },
        { t: 'graph', spec: { xMin: -5, xMax: 5, yMin: -2, yMax: 5, functions: [{ expr: 'abs(x)' }], points: [{ x: -3, y: 3, label: '(-3, 3)' }, { x: 0, y: 0, label: '(0, 0)' }, { x: 3, y: 3, label: '(3, 3)' }], ariaLabel: 'A V-shaped graph with its lowest point at (0, 0), passing through (-3, 3) and (3, 3).' } },
      ],
      steps: [
        { text: 'Describe the shape.', why: 'It is a V with a sharp corner (the vertex) at $(0, 0)$. A V shape belongs to the absolute value family.' },
        { text: 'Check the points with $f(x) = |x|$.', tex: '|-3| = 3, \\quad |0| = 0, \\quad |3| = 3', why: 'All three marked points fit the rule.' },
        { text: 'Decide linear or nonlinear.', why: 'On the left the slope is $-1$, and on the right it is $1$. The rate of change is not constant, so the function is **nonlinear**, even though each half is straight.' },
        { text: 'State the domain and range.', tex: '\\text{Domain: all real numbers} \\quad \\text{Range: } y \\ge 0', why: 'The V goes forever left and right, but its lowest point is $y = 0$.' },
      ],
      answer: 'Absolute value $f(x) = |x|$; nonlinear; domain all real numbers, range $y \\ge 0$.',
    },
    {
      title: 'An S lying on its side',
      kind: 'introductory',
      problem: [
        { t: 'p', text: 'Which parent function is graphed? Use the marked points to check, and give its domain and range.' },
        { t: 'graph', spec: { xMin: -10, xMax: 10, yMin: -6, yMax: 6, xStep: 2, functions: [{ expr: 'cbrt(x)' }], points: [{ x: -8, y: -2, label: '(-8, -2)' }, { x: 0, y: 0, label: '(0, 0)' }, { x: 8, y: 2, label: '(8, 2)' }], ariaLabel: 'An S-shaped curve lying on its side, rising slowly through (-8, -2), (0, 0) and (8, 2), and continuing to the left and right.' } },
      ],
      steps: [
        { text: 'Describe the shape.', why: 'The curve rises everywhere, is steepest at the origin and flattens out on both sides, like an S lying on its side. It keeps going to the left, so it is not the square root (which starts at the origin).' },
        { text: 'Check the points with $f(x) = \\sqrt[3]{x}$.', tex: '\\sqrt[3]{-8} = -2, \\quad \\sqrt[3]{0} = 0, \\quad \\sqrt[3]{8} = 2', why: '$(-2)^3 = -8$ and $2^3 = 8$, so all three points fit the cube root rule.' },
        { text: 'State the domain and range.', tex: '\\text{Domain: all real numbers} \\quad \\text{Range: all real numbers}', why: 'Every real number, positive or negative, has a cube root, and every real number is the cube root of something.' },
      ],
      answer: 'Cube root $f(x) = \\sqrt[3]{x}$; domain and range are all real numbers.',
    },
    {
      title: 'Linear or nonlinear from a table',
      kind: 'intermediate',
      problem: [
        { t: 'p', text: 'Is the function in the table linear? If so, write its equation.' },
        {
          t: 'table',
          headers: ['x', 'y'],
          rows: [
            ['-2', '7'],
            ['-1', '4'],
            ['0', '1'],
            ['1', '-2'],
            ['2', '-5'],
          ],
        },
      ],
      steps: [
        { text: 'Check the $x$ steps.', tex: '-2 \\to -1 \\to 0 \\to 1 \\to 2', why: 'The $x$-values go up by $1$ every time, so comparing first differences is fair.' },
        { text: 'Find the first differences in $y$.', tex: '4 - 7 = -3,\\quad 1 - 4 = -3,\\quad -2 - 1 = -3,\\quad -5 - (-2) = -3', why: 'All four differences are $-3$, so the rate of change is constant.' },
        { text: 'Conclude and write the rule.', tex: 'y = -3x + 1', why: 'The slope is $-3$ (change in $y$ per 1 step in $x$), and the row $x = 0$ gives the intercept $1$. Check: $-3(2) + 1 = -5$.' },
      ],
      answer: 'Linear: $y = -3x + 1$',
    },
    {
      title: 'Sort equations into linear and nonlinear',
      kind: 'intermediate',
      problem: [{ t: 'p', text: 'Which are linear? (a) $y = 4 - 3x$ (b) $y = x^2 + 1$ (c) $2x + y = 10$ (d) $y = \\frac{3}{x}$ (e) $y = 2^x$' }],
      steps: [
        { text: '(a) is already in $y = mx + b$ form.', tex: 'y = -3x + 4', why: '$x$ is to the first power. Slope $-3$, intercept $4$: **linear**.' },
        { text: '(b) has $x$ squared.', why: 'A squared variable makes a U-shaped graph from the quadratic family: **nonlinear**.' },
        { text: '(c) Solve for $y$.', tex: 'y = -2x + 10', why: 'Subtract $2x$ from both sides. It fits $y = mx + b$: **linear**.' },
        { text: '(d) has $x$ in the denominator.', why: 'Dividing by $x$ is not the same as multiplying by a constant. Check: $x = 1$ gives $3$, $x = 2$ gives $1.5$, $x = 3$ gives $1$. The differences $-1.5$ and $-0.5$ are not equal: **nonlinear**.' },
        { text: '(e) has $x$ in the exponent.', why: 'This is the exponential parent function: **nonlinear**.' },
      ],
      answer: 'Linear: (a) and (c). Nonlinear: (b), (d) and (e).',
    },
    {
      title: 'A common mistake: uneven x steps',
      kind: 'common-mistake',
      problem: [
        { t: 'p', text: 'A student looks at this table, sees the $y$-differences $2, 4, 6$, and says the function is nonlinear. Are they right?' },
        {
          t: 'table',
          headers: ['x', 'y'],
          rows: [
            ['1', '5'],
            ['2', '7'],
            ['4', '11'],
            ['7', '17'],
          ],
        },
      ],
      steps: [
        { text: 'Check the $x$ steps.', tex: '2 - 1 = 1,\\quad 4 - 2 = 2,\\quad 7 - 4 = 3', why: 'The $x$-values do **not** go up by equal steps, so unequal $y$-differences do not prove anything yet.' },
        { text: 'Compare the rate of change for each pair of rows.', tex: '\\frac{7 - 5}{1} = 2,\\quad \\frac{11 - 7}{2} = 2,\\quad \\frac{17 - 11}{3} = 2', why: 'Divide each change in $y$ by its change in $x$. The rate is $2$ every time.' },
        { text: 'Conclude and check with an equation.', tex: 'y = 2x + 3', why: 'A constant rate means linear. Check: $2(1) + 3 = 5$, $2(4) + 3 = 11$, $2(7) + 3 = 17$.' },
      ],
      answer: 'No. The function is linear: $y = 2x + 3$.',
    },
    {
      title: 'Viral video vs. savings',
      kind: 'real-world',
      problem: [
        { t: 'p', text: 'A video\'s total views double every day. A savings account grows by the same amount every week. Which situation is linear? Predict the next two values of each.' },
        {
          t: 'table',
          headers: ['Time', 'Video views (day)', 'Savings, dollars (week)'],
          rows: [
            ['0', '100', '100'],
            ['1', '200', '150'],
            ['2', '400', '200'],
            ['3', '800', '250'],
          ],
        },
      ],
      steps: [
        { text: 'Find the first differences for the video.', tex: '100,\\ 200,\\ 400', why: 'The time steps are equal (1 day), but the differences grow. The rate is not constant, so the views are **nonlinear**.' },
        { text: 'Find the first differences for the savings.', tex: '50,\\ 50,\\ 50', why: 'Equal steps and equal differences: the savings are **linear**, with rate \\$50 per week.' },
        { text: 'Name the families.', tex: 'V = 100 \\cdot 2^t, \\qquad S = 50t + 100', why: 'Doubling each step is the exponential pattern of $2^x$. Adding the same amount each step is linear.' },
        { text: 'Predict times 4 and 5.', tex: 'V:\\ 1600,\\ 3200 \\qquad S:\\ 300,\\ 350', why: 'Double $800$ twice; add \\$50 to \\$250 twice.' },
      ],
      answer: 'Savings are linear ($S = 50t + 100$); views are nonlinear (exponential). Next values: views 1,600 and 3,200; savings \\$300 and \\$350.',
    },
    {
      title: 'Which parents never go negative?',
      kind: 'challenging',
      problem: [{ t: 'p', text: 'Which of the six parent functions never have a negative output? Give the range of each one you choose, and explain.' }],
      steps: [
        { text: 'Rule out $x$ and $\\sqrt[3]{x}$.', tex: 'f(-2) = -2, \\qquad \\sqrt[3]{-8} = -2', why: 'Both give negative outputs for negative inputs, so their range is all real numbers.' },
        { text: 'Absolute value and squaring.', tex: '|-2| = 2, \\qquad (-2)^2 = 4', why: 'Absolute value is a distance, and a negative times a negative is positive. Both can equal $0$ at $x = 0$, so their range is $y \\ge 0$.' },
        { text: 'Square root.', tex: '\\sqrt{0} = 0, \\quad \\sqrt{4} = 2, \\quad \\sqrt{9} = 3', why: 'The square root symbol means the non-negative root, and only $x \\ge 0$ can go in. Its range is $y \\ge 0$.' },
        { text: 'Exponential.', tex: '2^{-3} = \\tfrac{1}{8}, \\quad 2^0 = 1, \\quad 2^3 = 8', why: 'Every power of $2$ is positive, and it never equals $0$. Its range is $y > 0$.' },
      ],
      answer: '$|x|$, $x^2$ and $\\sqrt{x}$ have range $y \\ge 0$; $2^x$ has range $y > 0$.',
    },
  ],
  teachMeAgain: [
    {
      approach: 'visual',
      title: 'Straight vs. curved',
      blocks: [
        { t: 'p', text: 'Compare $y = 2x$ and $y = x^2$. They meet at $(0, 0)$ and $(2, 4)$, but one is straight and one bends.' },
        {
          t: 'graph',
          spec: {
            xMin: -1,
            xMax: 5,
            yMin: -1,
            yMax: 17,
            yStep: 2,
            functions: [
              { expr: '2x', label: 'y = 2x' },
              { expr: 'x^2', label: 'y = x²' },
            ],
            points: [
              { x: 0, y: 0, label: '(0, 0)' },
              { x: 2, y: 4, label: '(2, 4)' },
              { x: 4, y: 8, label: '(4, 8)' },
              { x: 4, y: 16, label: '(4, 16)' },
            ],
            ariaLabel: 'The straight line y = 2x and the curve y = x squared crossing at (0, 0) and (2, 4). At x = 4 the line is at 8 and the curve is at 16.',
          },
        },
        { t: 'p', text: 'The line climbs the same $2$ units for every step right. The curve climbs faster and faster, so by $x = 4$ it is at $16$ while the line is at $8$. **Same steepness everywhere = linear.**' },
      ],
    },
    {
      approach: 'analogy',
      title: 'Cruise control vs. a hill',
      blocks: [
        { t: 'p', text: 'A car on cruise control at 60 miles per hour covers the same 60 miles every hour. Distance grows at a constant rate: that is **linear**.' },
        { t: 'p', text: 'A skateboard rolling down a hill goes a little farther each second than the second before, because it keeps speeding up. The rate keeps changing: that is **nonlinear**.' },
        { t: 'p', text: 'So ask: "Does the output change by the same amount for every equal step of input?" Yes means linear.' },
      ],
    },
    {
      approach: 'step-by-step',
      title: 'The table test in 3 steps',
      blocks: [
        {
          t: 'list',
          ordered: true,
          items: [
            '**Check the $x$ steps.** Are they all equal? If not, use $\\frac{\\text{change in } y}{\\text{change in } x}$ for each pair of rows.',
            '**Find the first differences** in $y$ (or the rates from step 1).',
            '**Decide.** All the same: linear. Any different: nonlinear.',
          ],
        },
        { t: 'p', text: 'Try it: $x = 0, 1, 2, 3$ and $y = 2, 3, 6, 11$. The steps are equal, and the differences are $1, 3, 5$. They are not the same, so it is nonlinear. (It is $y = x^2 + 2$.)' },
      ],
    },
    {
      approach: 'prerequisite',
      title: 'Refresher: powers, roots and absolute value',
      blocks: [
        {
          t: 'list',
          items: [
            'Squaring a negative gives a positive: $(-3)^2 = (-3)(-3) = 9$.',
            'Cubing a negative stays negative: $(-2)^3 = (-2)(-2)(-2) = -8$. That is why the cube root of a negative number is real: $\\sqrt[3]{-8} = -2$.',
            '$\\sqrt{25} = 5$ because $5^2 = 25$. There is no real $\\sqrt{-4}$, because no real number squared is negative.',
            'Absolute value is distance from $0$: $|-6| = 6$ and $|6| = 6$.',
            'Powers of $2$: $2^0 = 1$, $2^1 = 2$, $2^3 = 8$, and $2^{-1} = \\frac{1}{2}$.',
          ],
        },
      ],
    },
    {
      approach: 'simpler-example',
      title: 'Doubling vs. squaring in a table',
      blocks: [
        {
          t: 'table',
          headers: ['$x$', '$y = 2x$', '$y = x^2$'],
          rows: [
            ['0', '0', '0'],
            ['1', '2', '1'],
            ['2', '4', '4'],
            ['3', '6', '9'],
            ['4', '8', '16'],
          ],
        },
        { t: 'p', text: 'For $y = 2x$ the differences are $2, 2, 2, 2$: linear. For $y = x^2$ they are $1, 3, 5, 7$: nonlinear.' },
      ],
    },
    {
      approach: 'alternate-strategy',
      title: 'Read the equation instead',
      blocks: [
        { t: 'p', text: 'You can often tell without a table or graph. Look at where $x$ sits in the equation:' },
        { t: 'list', items: ['$x$ alone, maybe times a number, plus a number ($y = -4x + 7$): **linear**.', '$x$ with a power like $x^2$ or $x^3$: **nonlinear**.', '$x$ inside $|\\;\\;|$ or under $\\sqrt{\\;\\;}$ or $\\sqrt[3]{\\;\\;}$: **nonlinear**.', '$x$ in an exponent ($2^x$) or a denominator ($\\frac{1}{x}$): **nonlinear**.'] },
        { t: 'callout', variant: 'tip', text: 'Solve for $y$ first if you need to: $4x + 2y = 8$ becomes $y = -2x + 4$, which is linear.' },
      ],
    },
  ],
  guided: [
    { generator: 'u1.parent-functions', difficulty: 1 },
    { generator: 'u1.linear-vs-nonlinear', difficulty: 1 },
    { generator: 'u1.parent-functions', difficulty: 1 },
    { generator: 'u1.linear-vs-nonlinear', difficulty: 2 },
  ],
  independent: {
    count: 8,
    reviewCount: 2,
    mix: [
      { generator: 'u1.parent-functions', difficulty: 1, weight: 1 },
      { generator: 'u1.parent-functions', difficulty: 2, weight: 2 },
      { generator: 'u1.parent-functions', difficulty: 3, weight: 1 },
      { generator: 'u1.linear-vs-nonlinear', difficulty: 1, weight: 1 },
      { generator: 'u1.linear-vs-nonlinear', difficulty: 2, weight: 2 },
      { generator: 'u1.linear-vs-nonlinear', difficulty: 3, weight: 1 },
      { generator: 'u1.key-features', difficulty: 2, weight: 1 },
      { generator: 'u1.domain-range', difficulty: 2, weight: 1 },
    ],
  },
  quiz: {
    items: [
      { generator: 'u1.parent-functions', difficulty: 2 },
      { generator: 'u1.parent-functions', difficulty: 2 },
      { generator: 'u1.parent-functions', difficulty: 3 },
      { generator: 'u1.linear-vs-nonlinear', difficulty: 2 },
      { generator: 'u1.linear-vs-nonlinear', difficulty: 2 },
      { generator: 'u1.linear-vs-nonlinear', difficulty: 3 },
    ],
  },
  summary: [
    'The six parent functions are linear $x$ (line), absolute value $|x|$ (V), quadratic $x^2$ (U), square root $\\sqrt{x}$ (half arch from $(0, 0)$), cube root $\\sqrt[3]{x}$ (S lying on its side through $(-8, -2)$, $(0, 0)$, $(8, 2)$) and exponential $2^x$ (flat, then shooting up through $(0, 1)$).',
    'Domains: all real numbers except $\\sqrt{x}$, which needs $x \\ge 0$. Ranges: $|x|$, $x^2$ and $\\sqrt{x}$ have $y \\ge 0$; $2^x$ has $y > 0$; $x$ and $\\sqrt[3]{x}$ have all real numbers.',
    'Compare parents by their features: $|x|$ and $x^2$ both decrease then increase (sharp V vs smooth U); $2^x$ is the only one with no $x$-intercept; $\\sqrt{x}$ is the only one whose domain is limited.',
    'A function is **linear** when its rate of change is constant: equal first differences for equal $x$ steps, and a straight-line graph.',
    'An equation is linear when it can be written $y = mx + b$, with $x$ only to the first power.',
  ],
  mastery: { quizPassScore: 0.8, practiceMinCorrect: 5 },
};
