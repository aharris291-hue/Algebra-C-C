import type { LessonContent } from '../../../core/curriculum/types';

/**
 * U1L08 Arithmetic Sequences as Linear Functions (A.FGR.2.1, A.FGR.2.4)
 *
 * Math verified by hand (2026-10-04): every worked example, table and graph point below was recomputed independently.
 */
export const U1L08: LessonContent = {
  lessonId: 'U1L08',
  goal: 'Write an arithmetic sequence as a linear function $f(n) = dn + (a_1 - d)$ whose domain is the positive integers, graph it as separate points, and find which term has a given value.',
  needToKnow: [
    { t: 'p', text: 'This lesson connects two things you already know:' },
    {
      t: 'list',
      items: [
        '**Arithmetic sequences.** In $5, 8, 11, 14, \\dots$ the first term is $a_1 = 5$ and the common difference is $d = 3$. The explicit formula is $a_n = a_1 + (n - 1)d$.',
        '**Linear functions.** $y = mx + b$ has slope $m$ (the constant rate of change) and $y$-intercept $b$.',
      ],
    },
    { t: 'callout', variant: 'tip', title: 'Quick check', text: 'Simplify $5 + (n - 1)3$. (You should get $3n + 2$.) If that felt shaky, open **Teach Me Again** and choose the refresher.' },
  ],
  vocabulary: [
    { term: 'term number', meaning: 'The position $n$ of a term in a sequence: 1st, 2nd, 3rd, and so on.' },
    { term: 'common difference', meaning: 'The amount $d$ added to get from one term to the next. It plays the role of slope.' },
    { term: 'discrete', meaning: 'Made of separate points with gaps between them, not a connected line.' },
    { term: 'positive integers', meaning: 'The counting numbers $1, 2, 3, 4, \\dots$' },
  ],
  instruction: [
    { t: 'p', text: '### A sequence is a function' },
    { t: 'p', text: 'Every sequence matches a **term number** $n$ (the input) with a **term** $a_n$ (the output). Each position has exactly one term, so a sequence is a function. We can even write it with function notation: $f(n)$ means "the $n$th term."' },
    {
      t: 'table',
      caption: 'The sequence 5, 8, 11, 14, 17, ... as an input-output table.',
      headers: ['Term number n', 'Term f(n)'],
      rows: [
        ['1', '5'],
        ['2', '8'],
        ['3', '11'],
        ['4', '14'],
        ['5', '17'],
      ],
    },
    { t: 'p', text: 'Each time $n$ goes up by $1$, the output goes up by $3$. A constant rate of change means the function is **linear**, and the common difference is the slope: $d = m = 3$.' },
    { t: 'p', text: '### From the explicit formula to $f(n) = dn + (a_1 - d)$' },
    { t: 'p', text: 'Start with the explicit formula and distribute:' },
    { t: 'math', tex: 'a_n = 5 + (n - 1)(3) = 5 + 3n - 3 = 3n + 2' },
    { t: 'p', text: 'So $f(n) = 3n + 2$. Check it: $f(1) = 3(1) + 2 = 5$ and $f(4) = 3(4) + 2 = 14$. Both match the table.' },
    { t: 'p', text: 'The same thing happens for every arithmetic sequence:' },
    { t: 'math', tex: 'a_n = a_1 + (n - 1)d = dn + (a_1 - d) \\qquad \\text{so} \\qquad f(n) = dn + (a_1 - d)' },
    { t: 'callout', variant: 'why', title: 'Why subtract d from the first term?', text: 'The constant is the output when $n = 0$. To get from term 1 back to "term 0" you go back one step, so you subtract $d$ once: $5 - 3 = 2$. That is the $y$-intercept of the line the points sit on.' },
    {
      t: 'table',
      caption: 'Sequence words and linear-function words for the same idea.',
      headers: ['Sequence', 'Linear function'],
      rows: [
        ['term number $n$', 'input $x$'],
        ['term $a_n$', 'output $f(n)$'],
        ['common difference $d$', 'slope $m$'],
        ['$a_1 - d$ (the "zero-th" term)', '$y$-intercept $b$'],
      ],
    },
    { t: 'p', text: '### Domain and the graph: points, not a line' },
    { t: 'p', text: 'There is a 1st term and a 2nd term, but no "2.5th term" and no "0th term." So the **domain** of a sequence is the positive integers $\\{1, 2, 3, \\dots\\}$. Its graph is a set of separate (**discrete**) points that all fall on a line.' },
    {
      t: 'graph',
      caption: 'The sequence f(n) = 3n + 2 for n = 1 to 5. The dashed line y = 3x + 2 is shown only for comparison.',
      spec: {
        xMin: 0,
        xMax: 6,
        yMin: 0,
        yMax: 20,
        yStep: 2,
        xLabel: 'n',
        yLabel: 'f(n)',
        functions: [{ expr: '3x + 2', label: 'y = 3x + 2', dashed: true }],
        scatter: [
          { x: 1, y: 5 },
          { x: 2, y: 8 },
          { x: 3, y: 11 },
          { x: 4, y: 14 },
          { x: 5, y: 17 },
        ],
        points: [{ x: 0, y: 2, open: true, label: '(0, 2) not a term' }],
        ariaLabel: 'Five separate points at (1, 5), (2, 8), (3, 11), (4, 14) and (5, 17) lying on a dashed comparison line y = 3x + 2. An open circle at (0, 2) marks the y-intercept, which is not a term.',
      },
    },
    { t: 'callout', variant: 'warning', title: 'Do not connect the dots', text: 'The function $y = 3x + 2$ has domain all real numbers, so its graph is a solid line. The sequence $f(n) = 3n + 2$ has domain $\\{1, 2, 3, \\dots\\}$, so its graph is only the dots.' },
    { t: 'p', text: '### Which term has a given value?' },
    { t: 'p', text: 'To find which term equals $62$, set $f(n) = 62$ and solve:' },
    { t: 'math', tex: '3n + 2 = 62 \\;\\Rightarrow\\; 3n = 60 \\;\\Rightarrow\\; n = 20' },
    { t: 'p', text: 'So $62$ is the **20th term**. If the solution is not a positive integer, the value is **not** in the sequence. For example, $3n + 2 = 40$ gives $3n = 38$, so $n = 12.\\overline{6}$. There is no 12.67th term, so $40$ is not a term.' },
  ],
  examples: [
    {
      title: 'Write a sequence as a linear function',
      kind: 'introductory',
      problem: [{ t: 'p', text: 'Write the sequence $7, 11, 15, 19, \\dots$ as a linear function $f(n)$.' }],
      steps: [
        { text: 'Find the common difference.', tex: 'd = 11 - 7 = 4', why: 'Subtract any term from the next one. Check: $15 - 11 = 4$ and $19 - 15 = 4$, so the difference really is constant.' },
        { text: 'Find the constant $a_1 - d$.', tex: 'a_1 - d = 7 - 4 = 3', why: 'Going back one step from the first term gives the value at $n = 0$, which is the $y$-intercept.' },
        { text: 'Write the function.', tex: 'f(n) = 4n + 3', why: 'Use $f(n) = dn + (a_1 - d)$: the common difference is the slope.' },
        { text: 'Check two terms.', tex: 'f(1) = 4(1) + 3 = 7, \\quad f(4) = 4(4) + 3 = 19', why: 'Both match the given sequence, so the rule is right.' },
      ],
      answer: '$f(n) = 4n + 3$ with domain $\\{1, 2, 3, \\dots\\}$',
    },
    {
      title: 'A decreasing sequence and a term search',
      kind: 'intermediate',
      problem: [{ t: 'p', text: 'For the sequence $20, 17, 14, 11, \\dots$, write $f(n)$. Then find which term is $-10$.' }],
      steps: [
        { text: 'Find the common difference.', tex: 'd = 17 - 20 = -3', why: 'The terms go down, so $d$ is negative. A negative common difference means a negative slope.' },
        { text: 'Find the constant.', tex: 'a_1 - d = 20 - (-3) = 23', why: 'Subtracting a negative is adding: $20 + 3 = 23$.' },
        { text: 'Write the function.', tex: 'f(n) = -3n + 23', why: 'Check: $f(1) = -3 + 23 = 20$ and $f(4) = -12 + 23 = 11$.' },
        { text: 'Set the function equal to $-10$ and solve.', tex: '-3n + 23 = -10 \\;\\Rightarrow\\; -3n = -33 \\;\\Rightarrow\\; n = 11', why: 'Subtract $23$ from both sides, then divide by $-3$.' },
        { text: 'Check that $n$ is a positive integer.', tex: 'f(11) = -3(11) + 23 = -33 + 23 = -10', why: '$11$ is a positive integer, so $-10$ really is a term.' },
      ],
      answer: '$f(n) = -3n + 23$; $-10$ is the 11th term.',
    },
    {
      title: 'A common mistake: using the first term as the intercept',
      kind: 'common-mistake',
      problem: [{ t: 'p', text: 'A student writes the sequence $9, 14, 19, 24, \\dots$ as $f(n) = 5n + 9$. What went wrong, and what is the correct function?' }],
      steps: [
        { text: 'Test the student\'s rule at $n = 1$.', tex: 'f(1) = 5(1) + 9 = 14', why: 'The first term should be $9$, not $14$. The rule is off by one step.' },
        { text: 'Spot the error.', why: 'The student used the first term $a_1 = 9$ as the $y$-intercept. But the intercept is the value at $n = 0$, one step **before** the first term.' },
        { text: 'Find the correct constant.', tex: 'a_1 - d = 9 - 5 = 4', why: 'Go back one step from $a_1$ by subtracting $d$.' },
        { text: 'Write and check the correct rule.', tex: 'f(n) = 5n + 4: \\quad f(1) = 9, \\quad f(4) = 5(4) + 4 = 24', why: 'Both values match the sequence.' },
      ],
      answer: '$f(n) = 5n + 4$',
    },
    {
      title: 'Stadium seating',
      kind: 'real-world',
      problem: [{ t: 'p', text: 'In a section of a stadium, row 1 has 22 seats and each row has 4 more seats than the row in front of it. Write a function for the number of seats in row $n$. How many seats are in row 15? Which row has 102 seats?' }],
      steps: [
        { text: 'Identify $a_1$ and $d$.', tex: 'a_1 = 22, \\quad d = 4', why: 'Row 1 is the first term, and adding 4 seats each row is the common difference.' },
        { text: 'Write the function.', tex: 'f(n) = 4n + (22 - 4) = 4n + 18', why: 'Use $f(n) = dn + (a_1 - d)$. Check: $f(1) = 4 + 18 = 22$.' },
        { text: 'Find the seats in row 15.', tex: 'f(15) = 4(15) + 18 = 60 + 18 = 78', why: 'The input is the row number.' },
        { text: 'Find the row with 102 seats.', tex: '4n + 18 = 102 \\;\\Rightarrow\\; 4n = 84 \\;\\Rightarrow\\; n = 21', why: 'Solve for the input. $21$ is a positive integer, so it is a real row.' },
        { text: 'Think about the domain.', why: 'Row numbers are counting numbers, so the domain is $\\{1, 2, 3, \\dots\\}$ up to the last row in the section. There is no row 2.5.' },
      ],
      answer: '$f(n) = 4n + 18$; row 15 has 78 seats; row 21 has 102 seats.',
    },
    {
      title: 'Read a sequence from its graph',
      kind: 'intermediate',
      problem: [
        { t: 'p', text: 'The graph shows the first four terms of an arithmetic sequence. Write $f(n)$.' },
        {
          t: 'graph',
          spec: {
            xMin: 0,
            xMax: 6,
            yMin: 0,
            yMax: 10,
            xLabel: 'n',
            yLabel: 'f(n)',
            scatter: [
              { x: 1, y: 8 },
              { x: 2, y: 6 },
              { x: 3, y: 4 },
              { x: 4, y: 2 },
            ],
            ariaLabel: 'Four separate points at (1, 8), (2, 6), (3, 4) and (4, 2), each one lower than the last.',
          },
        },
      ],
      steps: [
        { text: 'Read the terms from the points.', tex: '8,\\ 6,\\ 4,\\ 2', why: 'Each point is (term number, term), so the $y$-values are the terms in order.' },
        { text: 'Find the common difference.', tex: 'd = 6 - 8 = -2', why: 'Each point is 2 units lower than the one before it, so the slope is $-2$.' },
        { text: 'Find the constant and write the rule.', tex: 'a_1 - d = 8 - (-2) = 10 \\;\\Rightarrow\\; f(n) = -2n + 10', why: 'Check: $f(4) = -8 + 10 = 2$, which matches the last point.' },
      ],
      answer: '$f(n) = -2n + 10$ with domain $\\{1, 2, 3, \\dots\\}$',
    },
    {
      title: 'Two terms that are far apart',
      kind: 'challenging',
      problem: [{ t: 'p', text: 'In an arithmetic sequence, $a_4 = 17$ and $a_9 = 37$. Write the sequence as a linear function $f(n)$ and find $a_1$.' }],
      steps: [
        { text: 'Treat the terms as points.', tex: '(4,\\ 17) \\text{ and } (9,\\ 37)', why: 'A term is an output and its position is the input, so $a_4 = 17$ is the point $(4, 17)$.' },
        { text: 'Find the slope, which is the common difference.', tex: 'd = \\frac{37 - 17}{9 - 4} = \\frac{20}{5} = 4', why: 'From term 4 to term 9 is 5 steps, and the value grows by 20, so each step adds 4.' },
        { text: 'Find the intercept using one point.', tex: '17 = 4(4) + b \\;\\Rightarrow\\; 17 = 16 + b \\;\\Rightarrow\\; b = 1', why: 'Substitute $n = 4$ and $f(4) = 17$ into $f(n) = 4n + b$.' },
        { text: 'Write the function and find $a_1$.', tex: 'f(n) = 4n + 1, \\quad a_1 = f(1) = 4(1) + 1 = 5', why: 'Check the other point: $f(9) = 36 + 1 = 37$.' },
      ],
      answer: '$f(n) = 4n + 1$ and $a_1 = 5$',
    },
  ],
  teachMeAgain: [
    {
      approach: 'visual',
      title: 'Stepping stones on a line',
      blocks: [
        { t: 'p', text: 'Picture the sequence $2, 5, 8, 11$ as stepping stones. Each stone is 1 step to the right and 3 steps up from the last one.' },
        {
          t: 'graph',
          spec: {
            xMin: 0,
            xMax: 5,
            yMin: 0,
            yMax: 12,
            xLabel: 'n',
            yLabel: 'f(n)',
            scatter: [
              { x: 1, y: 2 },
              { x: 2, y: 5 },
              { x: 3, y: 8 },
              { x: 4, y: 11 },
            ],
            segments: [
              { x1: 1, y1: 2, x2: 2, y2: 2, dashed: true },
              { x1: 2, y1: 2, x2: 2, y2: 5, dashed: true },
              { x1: 2, y1: 5, x2: 3, y2: 5, dashed: true },
              { x1: 3, y1: 5, x2: 3, y2: 8, dashed: true },
            ],
            ariaLabel: 'Points at (1, 2), (2, 5), (3, 8) and (4, 11). Dashed steps show moving right 1 and up 3 between the first three points.',
          },
        },
        { t: 'p', text: 'Right 1, up 3 every time: that is a slope of $3$, so $d = 3$. The stones line up, but you can only stand **on** a stone, never between them. That is why the graph is dots, not a line.' },
        { t: 'p', text: 'Step back once from the first stone: $2 - 3 = -1$. So $f(n) = 3n - 1$. Check: $f(4) = 12 - 1 = 11$.' },
      ],
    },
    {
      approach: 'step-by-step',
      title: 'A 3-step recipe',
      blocks: [
        {
          t: 'list',
          ordered: true,
          items: [
            '**Find $d$:** subtract the first term from the second. For $6, 10, 14, \\dots$: $d = 10 - 6 = 4$.',
            '**Step back once:** $a_1 - d = 6 - 4 = 2$.',
            '**Write and check:** $f(n) = 4n + 2$. Check $f(1) = 4 + 2 = 6$ and $f(3) = 12 + 2 = 14$.',
          ],
        },
        { t: 'callout', variant: 'tip', text: 'Always check $f(1)$. It must equal the first term. If it does not, you probably used $a_1$ instead of $a_1 - d$.' },
      ],
    },
    {
      approach: 'analogy',
      title: 'Floors in an elevator',
      blocks: [
        { t: 'p', text: 'An elevator stops only at floors 1, 2, 3, and so on. Suppose floor 1 is 15 feet above the street and every floor is 12 feet higher than the one below it.' },
        { t: 'list', items: ['Height of floor $n$: $f(n) = 12n + 3$. Check: $f(1) = 15$, $f(2) = 27$.', 'The elevator never stops at floor 2.5, so the inputs are only whole floor numbers.', 'The $+3$ is where "floor 0" would be. It is not a stop, just the starting height of the pattern.'] },
        { t: 'p', text: 'A sequence works the same way: it follows a linear rule, but it only "stops" at the positive integers.' },
      ],
    },
    {
      approach: 'prerequisite',
      title: 'Refresher: the explicit formula and distributing',
      blocks: [
        { t: 'p', text: 'The explicit formula is $a_n = a_1 + (n - 1)d$. To turn it into $y = mx + b$ form, distribute $d$ and combine the numbers.' },
        { t: 'math', tex: 'a_n = 10 + (n - 1)(6) = 10 + 6n - 6 = 6n + 4' },
        { t: 'list', items: ['Distribute: $(n - 1)(6) = 6n - 6$.', 'Combine constants: $10 - 6 = 4$.', 'With a negative $d$: $a_n = 3 + (n - 1)(-2) = 3 - 2n + 2 = -2n + 5$.'] },
      ],
    },
    {
      approach: 'simpler-example',
      title: 'Start with the even numbers',
      blocks: [
        { t: 'p', text: 'The sequence $2, 4, 6, 8, \\dots$ is just "double the term number": $f(n) = 2n$. Here $a_1 - d = 2 - 2 = 0$, so there is no constant.' },
        { t: 'p', text: 'Now shift every term up 1: $3, 5, 7, 9, \\dots$. The difference is still $2$, and $a_1 - d = 3 - 2 = 1$, so $f(n) = 2n + 1$. Check: $f(4) = 8 + 1 = 9$.' },
        { t: 'p', text: 'Which term is $41$? $2n + 1 = 41$, so $2n = 40$ and $n = 20$. It is the 20th term.' },
      ],
    },
  ],
  guided: [
    { generator: 'u1.seq-as-function', difficulty: 1 },
    { generator: 'u1.seq-explicit', difficulty: 1 },
    { generator: 'u1.seq-as-function', difficulty: 1 },
    { generator: 'u1.seq-as-function', difficulty: 2 },
  ],
  independent: {
    count: 8,
    reviewCount: 2,
    mix: [
      { generator: 'u1.seq-as-function', difficulty: 1, weight: 1 },
      { generator: 'u1.seq-as-function', difficulty: 2, weight: 3 },
      { generator: 'u1.seq-as-function', difficulty: 3, weight: 1 },
      { generator: 'u1.seq-explicit', difficulty: 2, weight: 1 },
      { generator: 'u1.write-two-points', difficulty: 1, weight: 1 },
    ],
  },
  quiz: {
    items: [
      { generator: 'u1.seq-as-function', difficulty: 2 },
      { generator: 'u1.seq-as-function', difficulty: 2 },
      { generator: 'u1.seq-as-function', difficulty: 3 },
      { generator: 'u1.seq-as-function', difficulty: 3 },
      { generator: 'u1.seq-explicit', difficulty: 2 },
      { generator: 'u1.write-two-points', difficulty: 2 },
    ],
  },
  summary: [
    'An arithmetic sequence is a **linear function** whose domain is the positive integers $\\{1, 2, 3, \\dots\\}$.',
    'As a function, $f(n) = dn + (a_1 - d)$: the common difference $d$ is the slope, and $a_1 - d$ is the $y$-intercept.',
    'The graph of a sequence is **separate points** on a line, not a connected line.',
    'To find which term has a value, solve $f(n) = \\text{value}$. If $n$ is not a positive integer, the value is not a term.',
  ],
  mastery: { quizPassScore: 0.8, practiceMinCorrect: 5 },
};
