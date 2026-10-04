import type { LessonContent } from '../../../core/curriculum/types';

/**
 * U1L02 Using Function Notation: Inputs, Outputs and Context (A.FGR.2.4, A.MM.1.1)
 * Solving f(x) = c for the input, and reading function notation in a real situation.
 *
 * Math verified by hand (2026-10-04): every worked example, table and graph below was recomputed independently.
 */
export const U1L02: LessonContent = {
  lessonId: 'U1L02',
  goal: 'Tell the difference between $f(4)$ and $f(x) = 4$, solve $f(x) = c$ to find an input, and explain what statements like $C(4) = 60$ mean in a real situation.',
  needToKnow: [
    { t: 'p', text: 'This lesson builds on two skills you already have:' },
    {
      t: 'list',
      items: [
        '**Evaluate a function.** If $f(x) = 3x + 2$, then $f(4) = 3(4) + 2 = 12 + 2 = 14$.',
        '**Solve a two-step equation.** To solve $3x + 4 = 19$, subtract $4$ from both sides ($3x = 15$), then divide both sides by $3$ ($x = 5$).',
      ],
    },
    { t: 'callout', variant: 'tip', title: 'Quick check', text: 'Solve $2x - 5 = 9$. (You should get $x = 7$.) If that felt shaky, open **Teach Me Again** and choose the refresher.' },
  ],
  vocabulary: [
    { term: 'input', meaning: 'The value that goes into a function, usually $x$. It is the number inside the parentheses in $f(\\;)$.' },
    { term: 'output', meaning: 'The value that comes out, $f(x)$. It is the number after the equals sign in $f(a) = b$.' },
    { term: 'inverse operations', meaning: 'Operations that undo each other, like adding and subtracting, or multiplying and dividing.' },
    { term: 'context', meaning: 'The real situation a function describes, such as money saved or minutes on a phone.' },
    { term: 'units', meaning: 'What a number measures or counts: dollars, weeks, miles, lawns, percent.' },
  ],
  instruction: [
    { t: 'p', text: '### Two different questions' },
    { t: 'p', text: 'Function notation lets you ask two opposite questions. Use $f(x) = 3x + 2$ for both.' },
    {
      t: 'table',
      caption: 'Same function, opposite questions.',
      headers: ['Question', 'What you know', 'What you find', 'Work'],
      rows: [
        ['Find f(4)', 'the input, 4', 'the output', 'f(4) = 3(4) + 2 = 14'],
        ['Solve f(x) = 14', 'the output, 14', 'the input', '3x + 2 = 14, so x = 4'],
      ],
    },
    { t: 'callout', variant: 'why', title: 'How to tell them apart', text: 'Look at **where the number is**. A number **inside** the parentheses, like $f(4)$, is an input, so you evaluate. A number **after the equals sign**, like $f(x) = 14$, is an output, so you solve for $x$.' },
    { t: 'p', text: '### Solving f(x) = c' },
    { t: 'p', text: 'To solve $f(x) = c$, replace $f(x)$ with its rule, then undo the operations with **inverse operations**. Finally, **check** by putting your answer back into the function.' },
    { t: 'p', text: 'Example: $f(x) = 4x - 7$. Solve $f(x) = 13$.' },
    { t: 'math', tex: '\\begin{aligned} 4x - 7 &= 13 \\\\ 4x &= 20 \\\\ x &= 5 \\end{aligned}' },
    { t: 'p', text: 'Check: $f(5) = 4(5) - 7 = 20 - 7 = 13$. It works, so $x = 5$.' },
    { t: 'callout', variant: 'tip', title: 'Always check', text: 'Checking takes ten seconds: evaluate $f$ at your answer and make sure you get the output you were given.' },
    { t: 'p', text: '### Finding an input from a table or a graph' },
    { t: 'p', text: 'In a table, find the given value in the **output** column, then read the input that goes with it.' },
    {
      t: 'table',
      caption: 'f(x) = 3x - 2. To solve f(x) = 4, find 4 in the output column: the input is 2.',
      headers: ['x', 'f(x)'],
      rows: [
        ['-1', '-5'],
        ['0', '-2'],
        ['1', '1'],
        ['2', '4'],
        ['3', '7'],
      ],
    },
    { t: 'p', text: 'On a graph, outputs are on the vertical axis. To solve $f(x) = 3$, start at $3$ on the $y$-axis, go **across** to the line, then go **down** to the $x$-axis and read the input.' },
    {
      t: 'graph',
      caption: 'f(x) = (1/2)x + 1. Going across from y = 3 hits the line at (4, 3), so f(x) = 3 when x = 4.',
      spec: { xMin: -5, xMax: 5, yMin: -5, yMax: 5, functions: [{ expr: '(1/2)x + 1', label: 'f(x) = (1/2)x + 1' }], points: [{ x: 4, y: 3, label: '(4, 3)' }], segments: [{ x1: 0, y1: 3, x2: 4, y2: 3, dashed: true }, { x1: 4, y1: 3, x2: 4, y2: 0, dashed: true }], ariaLabel: 'Line f(x) = one half x plus 1 with the point (4, 3) marked; a dashed guide goes across from y = 3 to the line, then down to x = 4.' },
    },
    { t: 'p', text: '### Function notation in context' },
    { t: 'p', text: 'Say $T(n)$ is the total amount, in dollars, you earn after mowing $n$ lawns. Then $T(4) = 60$ is a full sentence in math. Translate it with this pattern:' },
    { t: 'callout', variant: 'realworld', title: 'Sentence pattern', text: '"When **[input, with units]**, **[output, with units]**." So $T(4) = 60$ means: **When you have mowed 4 lawns, you have earned \\$60 in total.**' },
    { t: 'p', text: 'You can go the other way too. Let $B(t)$ be your phone battery level, in percent, after $t$ hours of streaming. The sentence "After 3 hours of streaming, the battery is at 55%" becomes $B(3) = 55$. The question "When will the battery be at 20%?" means solve $B(t) = 20$.' },
    { t: 'callout', variant: 'warning', title: 'Units matter', text: 'An answer like "4 and 60" is not an interpretation. Say what each number counts: 4 **lawns**, 60 **dollars**.' },
  ],
  examples: [
    {
      title: 'Solve f(x) = c',
      kind: 'introductory',
      problem: [{ t: 'p', text: 'For $f(x) = 2x + 3$, solve $f(x) = 11$.' }],
      steps: [
        { text: 'Replace $f(x)$ with its rule.', tex: '2x + 3 = 11', why: 'The $11$ is after the equals sign, so it is an output. We need the input that produces it.' },
        { text: 'Subtract $3$ from both sides.', tex: '2x = 8', why: 'Subtracting undoes the $+3$. Doing the same thing to both sides keeps the equation balanced.' },
        { text: 'Divide both sides by $2$.', tex: 'x = 4', why: 'Dividing undoes multiplying by $2$.' },
        { text: 'Check by substituting.', tex: 'f(4) = 2(4) + 3 = 8 + 3 = 11 \\checkmark', why: 'The input $4$ gives the output $11$, so the answer is right.' },
      ],
      answer: '$x = 4$',
    },
    {
      title: 'Solve with a negative slope',
      kind: 'intermediate',
      problem: [{ t: 'p', text: 'For $g(x) = -5x + 4$, find the input $x$ so that $g(x) = 19$.' }],
      steps: [
        { text: 'Set the rule equal to $19$.', tex: '-5x + 4 = 19', why: '$g(x) = 19$ means the output is $19$.' },
        { text: 'Subtract $4$ from both sides.', tex: '-5x = 15', why: 'Undo the addition first, because it was the last operation done to $x$.' },
        { text: 'Divide both sides by $-5$.', tex: 'x = -3', why: 'A positive divided by a negative is negative: $15 \\div (-5) = -3$.' },
        { text: 'Check.', tex: 'g(-3) = -5(-3) + 4 = 15 + 4 = 19 \\checkmark', why: 'Negative times negative is positive, and $15 + 4 = 19$.' },
      ],
      answer: '$x = -3$',
    },
    {
      title: 'A common mistake: solving vs evaluating',
      kind: 'common-mistake',
      problem: [{ t: 'p', text: 'For $f(x) = 6x - 4$, a student is asked to solve $f(x) = 20$ and writes $f(20) = 6(20) - 4 = 116$. What went wrong? What is the correct answer?' }],
      steps: [
        { text: 'Spot the error.', why: 'The student put $20$ in as the **input**. But in $f(x) = 20$, the $20$ is after the equals sign, so it is the **output**. The student answered a different question.' },
        { text: 'Set the rule equal to $20$.', tex: '6x - 4 = 20', why: 'We want the input whose output is $20$.' },
        { text: 'Add $4$, then divide by $6$.', tex: '6x = 24 \\quad\\Rightarrow\\quad x = 4', why: 'Inverse operations: adding undoes $-4$, dividing undoes $\\times 6$.' },
        { text: 'Check.', tex: 'f(4) = 6(4) - 4 = 24 - 4 = 20 \\checkmark' },
      ],
      answer: '$x = 4$ (not $116$)',
    },
    {
      title: 'Saving for a new phone',
      kind: 'real-world',
      problem: [{ t: 'p', text: 'You already have \\$150 saved and add \\$25 each week. Your savings after $w$ weeks is $S(w) = 25w + 150$ dollars. (a) Explain what $S(8) = 350$ means. (b) After how many weeks will you have \\$500?' }],
      steps: [
        { text: 'Check that $S(8) = 350$ is true.', tex: 'S(8) = 25(8) + 150 = 200 + 150 = 350', why: 'It is good practice to confirm a statement before you interpret it.' },
        { text: '(a) Interpret with units.', why: 'The input $w = 8$ counts weeks, and the output $350$ is dollars. So: **after 8 weeks, you will have \\$350 saved.**' },
        { text: '(b) Write the question in notation.', tex: 'S(w) = 500', why: '\\$500 is an amount of money, which is an **output**. The number of weeks is the unknown input.' },
        { text: 'Solve.', tex: '25w + 150 = 500 \\;\\Rightarrow\\; 25w = 350 \\;\\Rightarrow\\; w = 14', why: 'Subtract $150$ from both sides, then divide by $25$: $350 \\div 25 = 14$.' },
        { text: 'Check and answer in a sentence.', tex: 'S(14) = 25(14) + 150 = 350 + 150 = 500 \\checkmark', why: 'A context question deserves a sentence with units: **after 14 weeks, you will have \\$500.**' },
      ],
      answer: '(a) After 8 weeks you have \\$350 saved. (b) $w = 14$: after 14 weeks you have \\$500.',
    },
    {
      title: 'Find the input from a graph',
      kind: 'intermediate',
      problem: [
        { t: 'p', text: 'Use the graph of $y = f(x)$ to solve $f(x) = -2$.' },
        { t: 'graph', spec: { xMin: -5, xMax: 5, yMin: -5, yMax: 5, functions: [{ expr: '-x + 2', label: 'y = f(x)' }], ariaLabel: 'A line falling from left to right through (0, 2) and (2, 0).' } },
      ],
      steps: [
        { text: 'Find $-2$ on the $y$-axis.', why: 'In $f(x) = -2$, the $-2$ is an output, and outputs are on the vertical axis.' },
        { text: 'Go straight across to the line. You reach the point $(4, -2)$.', tex: '(4,\\ -2)', why: 'Every point on the line at height $-2$ has output $-2$. A line that is not horizontal crosses that height exactly once.' },
        { text: 'Read the $x$-value.', tex: 'x = 4', why: 'The input is the $x$-coordinate of that point.' },
      ],
      answer: '$x = 4$',
    },
    {
      title: 'Solve with a fraction',
      kind: 'challenging',
      problem: [{ t: 'p', text: 'For $h(x) = \\frac{2}{3}x - 5$, solve $h(x) = 7$.' }],
      steps: [
        { text: 'Set the rule equal to $7$.', tex: '\\frac{2}{3}x - 5 = 7', why: 'The $7$ is the output.' },
        { text: 'Add $5$ to both sides.', tex: '\\frac{2}{3}x = 12', why: 'Undo the subtraction first.' },
        { text: 'Multiply both sides by $\\frac{3}{2}$.', tex: 'x = 12 \\cdot \\frac{3}{2} = \\frac{36}{2} = 18', why: 'Multiplying by the reciprocal $\\frac{3}{2}$ undoes multiplying by $\\frac{2}{3}$, because $\\frac{3}{2} \\cdot \\frac{2}{3} = 1$.' },
        { text: 'Check.', tex: 'h(18) = \\frac{2}{3}(18) - 5 = 12 - 5 = 7 \\checkmark', why: '$\\frac{2}{3}$ of $18$ is $12$ (one third of $18$ is $6$, so two thirds is $12$).' },
      ],
      answer: '$x = 18$',
    },
  ],
  teachMeAgain: [
    {
      approach: 'visual',
      title: 'Run the machine forward or backward',
      blocks: [
        { t: 'p', text: 'Picture $f(x) = 4x - 7$ as a machine: **times 4, then minus 7**.' },
        { t: 'math', tex: '\\text{Forward: } 5 \\;\\xrightarrow{\\;\\times 4\\;}\\; 20 \\;\\xrightarrow{\\;-7\\;}\\; 13 \\qquad f(5) = 13' },
        { t: 'p', text: 'To solve $f(x) = 13$, you know what came **out** and run the machine **backward**, undoing each step in reverse order:' },
        { t: 'math', tex: '\\text{Backward: } 13 \\;\\xrightarrow{\\;+7\\;}\\; 20 \\;\\xrightarrow{\\;\\div 4\\;}\\; 5 \\qquad x = 5' },
        { t: 'p', text: 'Forward finds an output. Backward finds an input.' },
      ],
    },
    {
      approach: 'step-by-step',
      title: 'A 4-step checklist for f(x) = c',
      blocks: [
        { t: 'list', ordered: true, items: ['**Rewrite**: replace $f(x)$ with its rule, so $f(x) = 13$ becomes $4x - 7 = 13$.', '**Undo adding or subtracting**: $4x = 20$.', '**Undo multiplying or dividing**: $x = 5$.', '**Check**: $f(5) = 4(5) - 7 = 13$. In a context, finish with a sentence and units.'] },
        { t: 'callout', variant: 'tip', text: 'Undo in the reverse order of the order of operations: addition and subtraction first, then multiplication and division.' },
      ],
    },
    {
      approach: 'prerequisite',
      title: 'Refresher: two-step equations',
      blocks: [
        { t: 'p', text: 'Whatever you do to one side of an equation, do to the other side.' },
        { t: 'list', items: ['$5x - 3 = 22$: add $3$ to get $5x = 25$, then divide by $5$ to get $x = 5$.', '$-2x + 1 = 9$: subtract $1$ to get $-2x = 8$, then divide by $-2$ to get $x = -4$.', 'Check the second one: $-2(-4) + 1 = 8 + 1 = 9$. It works.'] },
        { t: 'p', text: 'Solving $f(x) = c$ is exactly this skill, once you replace $f(x)$ with its rule.' },
      ],
    },
    {
      approach: 'analogy',
      title: 'Ordering pizza',
      blocks: [
        { t: 'p', text: 'Pizzas cost \\$10 each plus a \\$5 delivery fee, so $P(n) = 10n + 5$ is the total in dollars for $n$ pizzas.' },
        { t: 'list', items: ['**"How much for 3 pizzas?"** You know the input. Evaluate: $P(3) = 10(3) + 5 = 35$, so \\$35.', '**"The bill was \\$45. How many pizzas?"** You know the output. Solve $P(n) = 45$: $10n + 5 = 45$, so $10n = 40$ and $n = 4$ pizzas.'] },
        { t: 'p', text: 'Same function, opposite questions. Ask yourself: "Do I know the number of pizzas, or the bill?"' },
      ],
    },
    {
      approach: 'simpler-example',
      title: 'Build up one operation at a time',
      blocks: [
        { t: 'p', text: 'Let $f(x) = x + 5$. Solve $f(x) = 12$: $x + 5 = 12$, so $x = 7$.' },
        { t: 'p', text: 'Let $g(x) = 3x$. Solve $g(x) = 21$: $3x = 21$, so $x = 7$.' },
        { t: 'p', text: 'Now both operations. Let $h(x) = 3x + 5$. Solve $h(x) = 26$:' },
        { t: 'math', tex: '3x + 5 = 26 \\;\\Rightarrow\\; 3x = 21 \\;\\Rightarrow\\; x = 7' },
        { t: 'p', text: 'Check: $h(7) = 3(7) + 5 = 21 + 5 = 26$.' },
      ],
    },
    {
      approach: 'alternate-strategy',
      title: 'Make a table and look for the output',
      blocks: [
        { t: 'p', text: 'If you are stuck, try a few inputs and watch the outputs. For $f(x) = 2x + 3$ and $f(x) = 11$:' },
        {
          t: 'table',
          headers: ['x', 'f(x) = 2x + 3'],
          rows: [
            ['1', '5'],
            ['2', '7'],
            ['3', '9'],
            ['4', '11'],
          ],
        },
        { t: 'p', text: 'The output $11$ shows up when $x = 4$, so $x = 4$. This works well for whole-number answers. For harder numbers, use inverse operations, and use a table to check.' },
      ],
    },
  ],
  guided: [
    { generator: 'u1.solve-fx', difficulty: 1 },
    { generator: 'u1.solve-fx-graph', difficulty: 1 },
    { generator: 'u1.interpret-notation', difficulty: 1 },
    { generator: 'u1.solve-context', difficulty: 1 },
  ],
  independent: {
    count: 8,
    reviewCount: 2,
    mix: [
      { generator: 'u1.solve-fx', difficulty: 1, weight: 1 },
      { generator: 'u1.solve-fx', difficulty: 2, weight: 2 },
      { generator: 'u1.solve-fx', difficulty: 3, weight: 1 },
      { generator: 'u1.solve-fx-graph', difficulty: 2, weight: 1 },
      { generator: 'u1.solve-context', difficulty: 2, weight: 1 },
      { generator: 'u1.interpret-notation', difficulty: 2, weight: 2 },
      { generator: 'u1.eval-context', difficulty: 2, weight: 1 },
    ],
  },
  quiz: {
    items: [
      { generator: 'u1.solve-fx', difficulty: 2 },
      { generator: 'u1.solve-fx', difficulty: 3 },
      { generator: 'u1.solve-fx-graph', difficulty: 2 },
      { generator: 'u1.solve-context', difficulty: 2 },
      { generator: 'u1.interpret-notation', difficulty: 2 },
      { generator: 'u1.interpret-notation', difficulty: 3 },
    ],
  },
  summary: [
    'A number **inside** the parentheses, as in $f(4)$, is an input: evaluate. A number **after the equals sign**, as in $f(x) = 14$, is an output: solve for $x$.',
    'To solve $f(x) = c$, replace $f(x)$ with its rule, undo the operations with inverse operations, then check by substituting.',
    'In a table or graph, find the output first, then read the input that goes with it.',
    'Interpret $f(a) = b$ in context with a full sentence and units: "When [input with units], [output with units]."',
  ],
  mastery: { quizPassScore: 0.8, practiceMinCorrect: 5 },
};
