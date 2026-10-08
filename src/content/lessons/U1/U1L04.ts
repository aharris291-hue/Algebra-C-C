import type { LessonContent } from '../../../core/curriculum/types';

/**
 * U1L04 Writing Linear Functions (A.FGR.2.2, A.FGR.2.4)
 * Writing y = mx + b from a slope and a point, two points, or a context, and converting
 * among slope-intercept, point-slope and standard form.
 *
 * Math verified by hand (2026-10-04): every worked example, table and graph below was recomputed independently.
 */
export const U1L04: LessonContent = {
  lessonId: 'U1L04',
  goal: 'Write the equation of a line from a slope and a point, from two points, or from a real situation or its graph, and rewrite it in slope-intercept, point-slope, or standard form.',
  needToKnow: [
    { t: 'p', text: 'You will use these skills over and over in this lesson:' },
    {
      t: 'list',
      items: [
        '**Find slope from two points.** For $(1, 2)$ and $(3, 8)$: $m = \\frac{8 - 2}{3 - 1} = \\frac{6}{2} = 3$.',
        '**Solve a one-step equation.** If $7 = 6 + b$, subtract $6$ from both sides: $b = 1$.',
        '**Distribute.** $3(x - 2) = 3x - 6$ and $-2(x + 4) = -2x - 8$.',
      ],
    },
    { t: 'callout', variant: 'tip', title: 'Quick check', text: 'What is the slope through $(2, 1)$ and $(4, 9)$? (You should get $\\frac{8}{2} = 4$.) If that felt shaky, open **Teach Me Again** and choose the refresher.' },
  ],
  vocabulary: [
    { term: 'slope-intercept form', meaning: '$y = mx + b$, where $m$ is the slope and $b$ is the $y$-intercept.' },
    { term: 'y-intercept', meaning: 'Where a line crosses the $y$-axis. It is the point $(0, b)$, the output when the input is $0$.' },
    { term: 'point-slope form', meaning: '$y - y_1 = m(x - x_1)$, where $m$ is the slope and $(x_1, y_1)$ is a point on the line.' },
    { term: 'standard form', meaning: '$Ax + By = C$, where $A$, $B$ and $C$ are integers and $A \\ge 0$.' },
  ],
  instruction: [
    { t: 'p', text: '### Slope-intercept form' },
    { t: 'p', text: 'Every non-vertical line can be written as $y = mx + b$, or in function notation $f(x) = mx + b$. The **slope** $m$ tells how steep it is. The number $b$ is the **$y$-intercept**: the line crosses the $y$-axis at $(0, b)$.' },
    {
      t: 'graph',
      caption: 'y = 2x + 3 crosses the y-axis at (0, 3) and passes through (1, 5) and (3, 9).',
      spec: { xMin: -5, xMax: 5, yMin: -3, yMax: 10, functions: [{ expr: '2x + 3', label: 'y = 2x + 3' }], points: [{ x: 0, y: 3, label: '(0, 3)' }, { x: 1, y: 5, label: '(1, 5)' }, { x: 3, y: 9, label: '(3, 9)' }], ariaLabel: 'Line y = 2x + 3 rising from left to right, crossing the y-axis at (0, 3) and passing through (1, 5) and (3, 9).' },
    },
    { t: 'p', text: '### From a slope and a point' },
    { t: 'p', text: 'Say the slope is $3$ and the line passes through $(2, 7)$. You know $m$, so find $b$ by putting the point into $y = mx + b$:' },
    { t: 'math', tex: '\\begin{aligned} 7 &= 3(2) + b \\\\ 7 &= 6 + b \\\\ 1 &= b \\end{aligned}' },
    { t: 'p', text: 'So the line is $y = 3x + 1$. Check: $3(2) + 1 = 7$. It passes through $(2, 7)$.' },
    { t: 'p', text: '### From two points' },
    { t: 'p', text: 'With two points, find the slope first, then use either point to find $b$. For $(1, 5)$ and $(3, 9)$:' },
    { t: 'math', tex: 'm = \\frac{9 - 5}{3 - 1} = \\frac{4}{2} = 2, \\qquad 5 = 2(1) + b \\;\\Rightarrow\\; b = 3' },
    { t: 'p', text: 'So $y = 2x + 3$. Check with the **other** point: $2(3) + 3 = 9$. It works.' },
    { t: 'p', text: '### From a context' },
    { t: 'p', text: 'In a real situation, the **rate** is the slope and the **starting amount** is the $y$-intercept. A gym charges a \\$25 sign-up fee plus \\$15 per month. The cost after $n$ months is:' },
    { t: 'math', tex: 'C(n) = 15n + 25' },
    { t: 'callout', variant: 'realworld', title: 'Look for the clue words', text: '"Per," "each" and "every" usually point to the **slope**. "Fee," "starting," "initial" and "already has" usually point to the **$y$-intercept**.' },
    { t: 'p', text: '### Three forms of the same line' },
    { t: 'p', text: '**Point-slope form** $y - y_1 = m(x - x_1)$ lets you write a line straight from a slope and a point. With $m = 3$ and $(2, 7)$: $y - 7 = 3(x - 2)$. Distribute and solve for $y$ to get back to slope-intercept form:' },
    { t: 'math', tex: 'y - 7 = 3x - 6 \\;\\Rightarrow\\; y = 3x + 1' },
    { t: 'p', text: '**Standard form** $Ax + By = C$ puts $x$ and $y$ on the same side. Use **integers** for $A$, $B$ and $C$, and make $A \\ge 0$. To convert $y = \\frac{2}{3}x - 4$:' },
    { t: 'math', tex: '\\begin{aligned} 3y &= 2x - 12 && \\text{multiply every term by 3} \\\\ -2x + 3y &= -12 && \\text{subtract } 2x \\\\ 2x - 3y &= 12 && \\text{multiply by } -1 \\text{ so } A \\ge 0 \\end{aligned}' },
    {
      t: 'table',
      caption: 'One line, three forms. All of them pass through (2, 7) with slope 3.',
      headers: ['Form', 'Pattern', 'This line'],
      rows: [
        ['Slope-intercept', 'y = mx + b', 'y = 3x + 1'],
        ['Point-slope', 'y - y1 = m(x - x1)', 'y - 7 = 3(x - 2)'],
        ['Standard', 'Ax + By = C', '3x - y = -1'],
      ],
    },
    { t: 'callout', variant: 'why', title: 'Why have three forms?', text: 'Each one shows something quickly. Slope-intercept shows the slope and starting value. Point-slope is the fastest to write from a point. Standard form is handy for finding intercepts and for situations like "$2$ adult tickets and $3$ student tickets cost \\$36."' },
  ],
  examples: [
    {
      title: 'Write a line from a slope and a point',
      kind: 'introductory',
      problem: [{ t: 'p', text: 'Write the equation of the line with slope $4$ that passes through $(2, 3)$.' }],
      steps: [
        { text: 'Put $m$, $x$ and $y$ into $y = mx + b$.', tex: '3 = 4(2) + b', why: 'The point $(2, 3)$ is on the line, so $x = 2$ and $y = 3$ must make the equation true.' },
        { text: 'Solve for $b$.', tex: '3 = 8 + b \\;\\Rightarrow\\; b = -5', why: 'Subtract $8$ from both sides: $3 - 8 = -5$.' },
        { text: 'Write the equation and check.', tex: 'y = 4x - 5; \\quad 4(2) - 5 = 3 \\checkmark', why: 'Plugging the point back in confirms the line goes through it.' },
      ],
      answer: '$y = 4x - 5$',
    },
    {
      title: 'Write a line from two points',
      kind: 'intermediate',
      problem: [{ t: 'p', text: 'Write the equation of the line through $(-2, 8)$ and $(4, -4)$.' }],
      steps: [
        { text: 'Find the slope.', tex: 'm = \\frac{-4 - 8}{4 - (-2)} = \\frac{-12}{6} = -2', why: 'You need $m$ before you can find $b$.' },
        { text: 'Use one point to find $b$.', tex: '8 = -2(-2) + b \\;\\Rightarrow\\; 8 = 4 + b \\;\\Rightarrow\\; b = 4', why: 'Any point on the line works. Negative times negative is positive: $-2(-2) = 4$.' },
        { text: 'Write the equation.', tex: 'y = -2x + 4' },
        { text: 'Check with the other point.', tex: '-2(4) + 4 = -8 + 4 = -4 \\checkmark', why: 'Using the point you did **not** use to find $b$ catches mistakes in the slope.' },
      ],
      answer: '$y = -2x + 4$',
    },
    {
      title: 'Ride-share pricing',
      kind: 'real-world',
      problem: [{ t: 'p', text: 'A ride-share app charges a flat fee plus a fixed amount per mile. A 4-mile ride costs \\$14 and a 7-mile ride costs \\$23. Write a function $C(d)$ for the cost of a $d$-mile ride, and explain what the slope and $y$-intercept mean.' }],
      steps: [
        { text: 'Write the data as points (miles, dollars).', tex: '(4, 14) \\text{ and } (7, 23)', why: 'Miles is the input and cost is the output.' },
        { text: 'Find the slope (the rate).', tex: 'm = \\frac{23 - 14}{7 - 4} = \\frac{9}{3} = 3', why: 'Three more miles cost \\$9 more, so each mile costs \\$3.' },
        { text: 'Find the starting amount $b$.', tex: '14 = 3(4) + b \\;\\Rightarrow\\; 14 = 12 + b \\;\\Rightarrow\\; b = 2', why: 'Substitute one data point into $C(d) = 3d + b$.' },
        { text: 'Write the function and check.', tex: 'C(d) = 3d + 2; \\quad C(7) = 21 + 2 = 23 \\checkmark', why: 'The other data point fits, so the function is right.' },
        { text: 'Interpret.', why: 'The slope means **each mile costs \\$3**. The $y$-intercept means **there is a \\$2 flat fee** before any miles are driven.' },
      ],
      answer: '$C(d) = 3d + 2$: \\$3 per mile plus a \\$2 flat fee.',
    },
    {
      title: 'From a graph of a situation to a rule',
      kind: 'real-world',
      problem: [
        { t: 'p', text: 'A candle burns down at a steady rate. The graph shows its height. Write a rule for $H(t)$, the height in centimeters after $t$ hours.' },
        { t: 'graph', spec: { xMin: 0, xMax: 16, yMin: 0, yMax: 40, xStep: 2, yStep: 5, xLabel: 'time (hours)', yLabel: 'candle height (cm)', functions: [{ expr: '-2.5x + 30', domain: [0, 12] }], points: [{ x: 0, y: 30, label: '(0, 30)' }, { x: 12, y: 0, label: '(12, 0)' }], ariaLabel: 'A line graph with time in hours across and candle height in centimeters up, falling from (0, 30) to (12, 0).' } },
      ],
      steps: [
        { text: 'Read the starting value from the vertical axis.', tex: '(0, 30) \;\\Rightarrow\; b = 30', why: 'At 0 hours the candle is 30 cm tall. The point where the input is 0 gives the constant term.' },
        { text: 'Find the rate from the two marked points.', tex: 'm = \\frac{0 - 30}{12 - 0} = -\\frac{30}{12} = -2.5', why: 'Change in output over change in input. The graph falls, so the rate is negative: the candle loses 2.5 cm each hour.' },
        { text: 'Write the rule and check.', tex: 'H(t) = -2.5t + 30; \\quad H(12) = -30 + 30 = 0 \\checkmark', why: 'Rate times input plus starting value. The other marked point fits.' },
      ],
      answer: '$H(t) = -2.5t + 30$: the candle starts 30 cm tall and burns 2.5 cm per hour.',
    },
    {
      title: 'A common mistake: signs in point-slope form',
      kind: 'common-mistake',
      problem: [{ t: 'p', text: 'Write the line with slope $3$ through $(-2, 5)$. A student writes $y - 5 = 3(x - 2)$. What went wrong? Give the correct equation in slope-intercept form.' }],
      steps: [
        { text: 'Spot the error.', why: 'Point-slope form subtracts $x_1$: $x - x_1$. Here $x_1 = -2$, so it is $x - (-2)$, which is $x + 2$. The student dropped the negative sign.' },
        { text: 'Write it correctly.', tex: 'y - 5 = 3(x - (-2)) = 3(x + 2)', why: 'Subtracting a negative is adding.' },
        { text: 'Distribute and solve for $y$.', tex: 'y - 5 = 3x + 6 \\;\\Rightarrow\\; y = 3x + 11', why: 'Add $5$ to both sides: $6 + 5 = 11$.' },
        { text: 'Check the point.', tex: '3(-2) + 11 = -6 + 11 = 5 \\checkmark', why: 'The student\'s line, $y = 3x - 1$, gives $3(-2) - 1 = -7$ at $x = -2$, not $5$, so it misses the point.' },
      ],
      answer: '$y - 5 = 3(x + 2)$, which is $y = 3x + 11$',
    },
    {
      title: 'Convert to standard form',
      kind: 'intermediate',
      problem: [{ t: 'p', text: 'Write $y = -\\frac{3}{4}x + 2$ in standard form $Ax + By = C$ with integers and $A \\ge 0$.' }],
      steps: [
        { text: 'Multiply every term by $4$.', tex: '4y = -3x + 8', why: 'Multiplying by the denominator clears the fraction: $4 \\cdot \\left(-\\frac{3}{4}x\\right) = -3x$ and $4 \\cdot 2 = 8$.' },
        { text: 'Add $3x$ to both sides.', tex: '3x + 4y = 8', why: 'Standard form has the $x$ and $y$ terms together on the left.' },
        { text: 'Check the rules and a point.', tex: '3(0) + 4(2) = 8 \\checkmark', why: '$A = 3$, $B = 4$, $C = 8$ are integers and $A \\ge 0$. The $y$-intercept $(0, 2)$ of the original line still works.' },
      ],
      answer: '$3x + 4y = 8$',
    },
    {
      title: 'From standard form to the other two forms',
      kind: 'challenging',
      problem: [{ t: 'p', text: 'Rewrite $6x - 3y = 9$ in slope-intercept form. Then write it in point-slope form using the point where $x = 1$.' }],
      steps: [
        { text: 'Subtract $6x$ from both sides.', tex: '-3y = -6x + 9', why: 'Get the $y$ term alone on one side.' },
        { text: 'Divide every term by $-3$.', tex: 'y = 2x - 3', why: '$-6x \\div (-3) = 2x$ and $9 \\div (-3) = -3$. Divide **every** term, not just the first one.' },
        { text: 'Find the point where $x = 1$.', tex: 'y = 2(1) - 3 = -1 \\;\\Rightarrow\\; (1, -1)', why: 'Point-slope form needs a point on the line.' },
        { text: 'Write point-slope form.', tex: 'y - (-1) = 2(x - 1) \\;\\Rightarrow\\; y + 1 = 2(x - 1)', why: 'Subtracting $-1$ becomes $+1$.' },
        { text: 'Check in the original equation.', tex: '6(1) - 3(-1) = 6 + 3 = 9 \\checkmark', why: 'The point $(1, -1)$ satisfies the standard form, so all three forms describe the same line.' },
      ],
      answer: '$y = 2x - 3$ and $y + 1 = 2(x - 1)$',
    },
  ],
  teachMeAgain: [
    {
      approach: 'visual',
      title: 'Start at b, then step by the slope',
      blocks: [
        { t: 'p', text: 'Read $y = 2x - 1$ as directions: **start at $-1$ on the $y$-axis, then go up $2$ and right $1$, again and again.**' },
        { t: 'graph', caption: 'Start at (0, -1). Each step: right 1, up 2.', spec: { xMin: -5, xMax: 5, yMin: -5, yMax: 5, functions: [{ expr: '2x - 1', label: 'y = 2x - 1' }], points: [{ x: 0, y: -1, label: 'start (0, -1)' }, { x: 1, y: 1, label: '(1, 1)' }, { x: 2, y: 3, label: '(2, 3)' }], segments: [{ x1: 0, y1: -1, x2: 1, y2: -1, dashed: true }, { x1: 1, y1: -1, x2: 1, y2: 1, dashed: true }, { x1: 1, y1: 1, x2: 2, y2: 1, dashed: true }, { x1: 2, y1: 1, x2: 2, y2: 3, dashed: true }], ariaLabel: 'Line y = 2x - 1 starting at the y-intercept (0, -1), with dashed steps of right 1 and up 2 to (1, 1) and then (2, 3).' } },
        { t: 'p', text: 'Writing an equation is the reverse: find where the line starts on the $y$-axis ($b$) and how it steps ($m$).' },
      ],
    },
    {
      approach: 'step-by-step',
      title: 'A 4-step checklist for two points',
      blocks: [
        { t: 'list', ordered: true, items: ['**Slope**: for $(1, 5)$ and $(3, 9)$, $m = \\frac{9 - 5}{3 - 1} = 2$.', '**Substitute** one point and $m$ into $y = mx + b$: $5 = 2(1) + b$.', '**Solve for $b$**: $b = 3$.', '**Write and check**: $y = 2x + 3$. The other point: $2(3) + 3 = 9$. It works.'] },
        { t: 'callout', variant: 'tip', text: 'Always check with the point you did not use. It catches slope mistakes for free.' },
      ],
    },
    {
      approach: 'analogy',
      title: 'Starting amount plus a rate',
      blocks: [
        { t: 'p', text: 'Most linear situations sound like: "**start** with some amount, then **add the same amount each time**."' },
        { t: 'list', items: ['A new phone costs \\$50 to activate, then \\$20 per month: $C(x) = 20x + 50$.', 'You have \\$80 and spend \\$6 per lunch: $M(x) = -6x + 80$.', 'A plant is 4 cm tall and grows 2 cm per week: $H(x) = 2x + 4$.'] },
        { t: 'p', text: 'The rate is always $m$ and the starting amount is always $b$. A rate that takes things away is negative.' },
      ],
    },
    {
      approach: 'prerequisite',
      title: 'Refresher: distributing and solving for b',
      blocks: [
        { t: 'list', items: ['Distribute to every term inside: $3(x + 2) = 3x + 6$.', 'A negative outside flips both signs: $-2(x - 4) = -2x + 8$.', 'Solve for $b$: $5 = 3(-2) + b$ means $5 = -6 + b$, so add $6$: $b = 11$.'] },
        { t: 'p', text: 'These are the only algebra moves you need to write and convert linear equations.' },
      ],
    },
    {
      approach: 'simpler-example',
      title: 'Start with the y-intercept already given',
      blocks: [
        { t: 'p', text: 'Slope $2$ through $(0, 5)$: the point is on the $y$-axis, so $b = 5$ right away. The line is $y = 2x + 5$.' },
        { t: 'p', text: 'Slope $2$ through $(1, 7)$: now solve $7 = 2(1) + b$, so $b = 5$. Same line, $y = 2x + 5$.' },
        { t: 'p', text: 'The only difference: when the point is not on the $y$-axis, you need one extra step to find $b$.' },
      ],
    },
    {
      approach: 'alternate-strategy',
      title: 'Write point-slope first, then simplify',
      blocks: [
        { t: 'p', text: 'Skip solving for $b$. Plug the slope and a point straight into $y - y_1 = m(x - x_1)$, then simplify.' },
        { t: 'p', text: 'For $(1, 5)$ and $(3, 9)$ with $m = 2$, using $(1, 5)$:' },
        { t: 'math', tex: 'y - 5 = 2(x - 1) \\;\\Rightarrow\\; y - 5 = 2x - 2 \\;\\Rightarrow\\; y = 2x + 3' },
        { t: 'p', text: 'Using $(3, 9)$ instead: $y - 9 = 2(x - 3)$, so $y - 9 = 2x - 6$ and $y = 2x + 3$. Either point gives the same line.' },
      ],
    },
  ],
  guided: [
    { generator: 'u1.write-slope-point', difficulty: 1 },
    { generator: 'u1.write-two-points', difficulty: 1 },
    { generator: 'u1.write-context', difficulty: 1 },
    { generator: 'u1.convert-forms', difficulty: 1 },
  ],
  independent: {
    count: 8,
    reviewCount: 2,
    mix: [
      { generator: 'u1.write-slope-point', difficulty: 2, weight: 1 },
      { generator: 'u1.write-two-points', difficulty: 2, weight: 2 },
      { generator: 'u1.write-two-points', difficulty: 3, weight: 1 },
      { generator: 'u1.write-context', difficulty: 2, weight: 1 },
      { generator: 'u1.write-context', difficulty: 3, weight: 1 },
      { generator: 'u1.convert-forms', difficulty: 1, weight: 1 },
      { generator: 'u1.convert-forms', difficulty: 2, weight: 1 },
      { generator: 'u1.slope-points', difficulty: 2, weight: 1 },
    ],
  },
  quiz: {
    items: [
      { generator: 'u1.write-slope-point', difficulty: 2 },
      { generator: 'u1.write-two-points', difficulty: 2 },
      { generator: 'u1.write-two-points', difficulty: 3 },
      { generator: 'u1.write-context', difficulty: 2 },
      { generator: 'u1.convert-forms', difficulty: 2 },
      { generator: 'u1.convert-forms', difficulty: 3 },
    ],
  },
  summary: [
    'In $y = mx + b$, $m$ is the slope and $b$ is the $y$-intercept, the point $(0, b)$.',
    'From a slope and a point, substitute into $y = mx + b$ and solve for $b$. From two points, find the slope first, then do the same.',
    'In context, the rate ("per," "each") is the slope and the starting amount ("fee," "initial") is the $y$-intercept. On a graph of a situation, read the starting amount where the input is 0, and find the rate from two marked points.',
    'Point-slope form is $y - y_1 = m(x - x_1)$. Standard form is $Ax + By = C$ with integers and $A \\ge 0$. Convert by distributing and moving terms.',
  ],
  mastery: { quizPassScore: 0.8, practiceMinCorrect: 5 },
};
