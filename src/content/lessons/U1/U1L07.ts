import type { LessonContent } from '../../../core/curriculum/types';

/**
 * U1L07 Arithmetic Sequences (A.FGR.2.1)
 * Common difference and explicit form a_n = a_1 + (n - 1)d (S1.12); recursive form and converting to explicit (S1.13).
 *
 * Math verified by hand (2026-10-04): every worked example, table and graph below was recomputed independently.
 */
export const U1L07: LessonContent = {
  lessonId: 'U1L07',
  goal: 'Find the common difference of an arithmetic sequence, write explicit and recursive formulas, find any term, and find which term has a given value.',
  needToKnow: [
    { t: 'p', text: 'This lesson builds on two things you already know:' },
    {
      t: 'list',
      items: [
        '**Evaluating a rule.** If $f(x) = 3x + 2$, then $f(20) = 3(20) + 2 = 62$.',
        '**Constant rate of change.** In a table where $y$ goes up by the same amount every time $x$ goes up by $1$, that amount is the slope.',
      ],
    },
    { t: 'callout', variant: 'tip', title: 'Quick check', text: 'Simplify $5 + (n - 1)3$. (You should get $3n + 2$.) If that felt shaky, open **Teach Me Again** and choose the refresher.' },
  ],
  vocabulary: [
    { term: 'sequence', meaning: 'An ordered list of numbers. Each number is a **term**.' },
    { term: 'term number $n$', meaning: 'The position of a term: 1st, 2nd, 3rd, and so on.' },
    { term: '$a_n$', meaning: 'The value of the $n$th term. $a_1$ is the first term and $a_4$ is the fourth term.' },
    { term: 'arithmetic sequence', meaning: 'A sequence where you add the same number each time to get the next term.' },
    { term: 'common difference $d$', meaning: 'The number added each time: $d = a_n - a_{n-1}$.' },
    { term: 'explicit formula', meaning: 'A rule that finds any term directly from $n$: $a_n = a_1 + (n - 1)d$.' },
    { term: 'recursive formula', meaning: 'A rule that finds each term from the term before it: $a_n = a_{n-1} + d$.' },
  ],
  instruction: [
    { t: 'p', text: '### What makes a sequence arithmetic' },
    { t: 'p', text: 'Look at $5, 8, 11, 14, 17, \\ldots$ Each term is $3$ more than the one before. A sequence that adds the **same number** every time is **arithmetic**, and that number is the **common difference** $d$. Here $d = 3$.' },
    { t: 'p', text: 'To find $d$, subtract any term minus the term **before** it: $8 - 5 = 3$, $11 - 8 = 3$, $14 - 11 = 3$. If the differences are not all equal, the sequence is not arithmetic. For example, $2, 4, 8, 16$ has differences $2, 4, 8$, so it is not arithmetic.' },
    { t: 'callout', variant: 'warning', title: 'Term number vs term value', text: 'In $a_4 = 14$, the **4** is the term number (the position) and **14** is the term value. "Which term is 14?" wants the answer $n = 4$, not $14$.' },
    {
      t: 'table',
      caption: 'The sequence 5, 8, 11, 14, 17, ...',
      headers: ['Term number $n$', '1', '2', '3', '4', '5'],
      rows: [['Term value $a_n$', '5', '8', '11', '14', '17']],
    },
    {
      t: 'graph',
      caption: 'Graphing (n, a_n) gives separate points that rise 3 each step.',
      spec: { xMin: 0, xMax: 6, yMin: 0, yMax: 20, yStep: 2, xLabel: 'n', yLabel: 'a_n', scatter: [{ x: 1, y: 5 }, { x: 2, y: 8 }, { x: 3, y: 11 }, { x: 4, y: 14 }, { x: 5, y: 17 }], ariaLabel: 'Five separate points at (1, 5), (2, 8), (3, 11), (4, 14) and (5, 17), each 3 units higher than the one before.' },
    },
    { t: 'p', text: '### The explicit formula' },
    { t: 'p', text: 'To reach the $n$th term, start at $a_1$ and add $d$ once for every **jump**. From term 1 to term $n$ there are $n - 1$ jumps, not $n$:' },
    { t: 'math', tex: 'a_n = a_1 + (n - 1)d' },
    { t: 'p', text: 'For $5, 8, 11, \\ldots$: $a_n = 5 + (n - 1)3$. The 20th term is:' },
    { t: 'math', tex: 'a_{20} = 5 + (20 - 1)3 = 5 + 19 \\cdot 3 = 5 + 57 = 62' },
    { t: 'p', text: 'You can also simplify the formula first: $a_n = 5 + 3n - 3 = 3n + 2$. Check: $3(20) + 2 = 62$. Notice that $3n + 2$ is a linear function with slope $3$, the common difference.' },
    { t: 'p', text: '### The recursive formula' },
    { t: 'p', text: 'A recursive formula gives a starting term and a rule for getting from one term to the next:' },
    { t: 'math', tex: 'a_1 = 5, \\qquad a_n = a_{n-1} + 3' },
    { t: 'p', text: 'Read $a_{n-1}$ as "the term before." So: start at $5$, then keep adding $3$. Recursive formulas are great for listing the next few terms. Explicit formulas are better for jumping straight to the 100th term.' },
    { t: 'callout', variant: 'why', title: 'Converting recursive to explicit', text: 'The recursive form already shows you $a_1$ (the starting term) and $d$ (the number added). Put them into $a_n = a_1 + (n - 1)d$. For $a_1 = 5$, $a_n = a_{n-1} + 3$, you get $a_n = 5 + (n - 1)3 = 3n + 2$.' },
  ],
  examples: [
    {
      title: 'Find d and extend the sequence',
      kind: 'introductory',
      problem: [{ t: 'p', text: 'Find the common difference of $20, 14, 8, 2, \\ldots$ and the next three terms.' }],
      steps: [
        { text: 'Subtract each term minus the one before it.', tex: '14 - 20 = -6,\\quad 8 - 14 = -6,\\quad 2 - 8 = -6', why: 'All the differences match, so the sequence is arithmetic.' },
        { text: 'So $d = -6$.', why: 'The terms are going down, so the common difference is negative.' },
        { text: 'Keep adding $-6$.', tex: '2 + (-6) = -4,\\quad -4 + (-6) = -10,\\quad -10 + (-6) = -16' },
      ],
      answer: '$d = -6$; the next three terms are $-4, -10, -16$.',
    },
    {
      title: 'Write the explicit formula and find a term',
      kind: 'intermediate',
      problem: [{ t: 'p', text: 'For $7, 11, 15, 19, \\ldots$, write an explicit formula and find $a_{25}$.' }],
      steps: [
        { text: 'Identify $a_1$ and $d$.', tex: 'a_1 = 7, \\quad d = 11 - 7 = 4' },
        { text: 'Substitute into the explicit formula.', tex: 'a_n = 7 + (n - 1)4', why: 'The pattern is: start at the first term and add $d$ once for each jump.' },
        { text: 'Simplify (optional).', tex: 'a_n = 7 + 4n - 4 = 4n + 3', why: 'Distribute the $4$, then combine $7 - 4 = 3$.' },
        { text: 'Find the 25th term.', tex: 'a_{25} = 4(25) + 3 = 100 + 3 = 103', why: 'Check with the unsimplified form: $7 + 24 \\cdot 4 = 7 + 96 = 103$.' },
      ],
      answer: '$a_n = 7 + (n - 1)4 = 4n + 3$; $a_{25} = 103$',
    },
    {
      title: 'A common mistake: using n instead of n - 1',
      kind: 'common-mistake',
      problem: [{ t: 'p', text: 'For $7, 11, 15, 19, \\ldots$, a student finds the 10th term as $7 + 10 \\cdot 4 = 47$. What went wrong?' }],
      steps: [
        { text: 'Count the jumps.', why: 'The first term, $7$, already counts as term 1. To get from term 1 to term 10, you add $d$ only **9** times, not 10.' },
        { text: 'Use $n - 1$.', tex: 'a_{10} = 7 + (10 - 1)4 = 7 + 9 \\cdot 4 = 7 + 36 = 43' },
        { text: 'Check by listing.', tex: '7, 11, 15, 19, 23, 27, 31, 35, 39, 43', why: 'The 10th number in the list is $43$. The student answer $47$ is actually the 11th term.' },
      ],
      answer: '$a_{10} = 43$',
    },
    {
      title: 'Which term has this value?',
      kind: 'challenging',
      problem: [{ t: 'p', text: 'In the sequence $-3, 2, 7, 12, \\ldots$, which term is $92$?' }],
      steps: [
        { text: 'Find $d$ and write the explicit formula.', tex: 'd = 2 - (-3) = 5; \\quad a_n = -3 + (n - 1)5 = 5n - 8', why: 'Distribute: $-3 + 5n - 5 = 5n - 8$.' },
        { text: 'Set the formula equal to the value.', tex: '5n - 8 = 92', why: '$92$ is a term **value**, so it goes where $a_n$ is. The unknown is the term **number** $n$.' },
        { text: 'Solve for $n$.', tex: '5n = 100 \\;\\Rightarrow\\; n = 20' },
        { text: 'Check.', tex: 'a_{20} = -3 + 19 \\cdot 5 = -3 + 95 = 92 \\checkmark', why: '$n$ must be a positive whole number. If you got a fraction, the value would not be in the sequence.' },
      ],
      answer: '$92$ is the 20th term ($n = 20$).',
    },
    {
      title: 'Recursive to explicit',
      kind: 'intermediate',
      problem: [{ t: 'p', text: 'A sequence is defined by $a_1 = 12$ and $a_n = a_{n-1} - 5$. List the first five terms and write an explicit formula.' }],
      steps: [
        { text: 'Start at $12$ and subtract $5$ each time.', tex: '12,\\ 7,\\ 2,\\ -3,\\ -8', why: '$a_{n-1}$ is the term before, so each term is the previous term minus $5$.' },
        { text: 'Read off $a_1$ and $d$.', tex: 'a_1 = 12, \\quad d = -5', why: 'Subtracting $5$ is the same as adding $-5$.' },
        { text: 'Write the explicit formula.', tex: 'a_n = 12 + (n - 1)(-5) = 12 - 5n + 5 = 17 - 5n', why: 'Distribute $-5$: $(n - 1)(-5) = -5n + 5$.' },
        { text: 'Check with the list.', tex: 'a_5 = 17 - 5(5) = 17 - 25 = -8 \\checkmark' },
      ],
      answer: '$12, 7, 2, -3, -8$; $a_n = 12 + (n - 1)(-5) = 17 - 5n$',
    },
    {
      title: 'Explicit to recursive',
      kind: 'intermediate',
      problem: [{ t: 'p', text: 'A sequence has explicit formula $a_n = 6n - 1$. Write a recursive formula for it.' }],
      steps: [
        { text: 'Find the first term by substituting $n = 1$.', tex: 'a_1 = 6(1) - 1 = 5', why: 'A recursive formula must start from the actual first term. The constant $-1$ is **not** $a_1$; it would be the value at $n = 0$.' },
        { text: 'Find the common difference.', tex: 'a_2 = 6(2) - 1 = 11, \\quad a_2 - a_1 = 11 - 5 = 6', why: 'Each time $n$ goes up by 1, $6n$ goes up by 6, so the coefficient of $n$ is the common difference.' },
        { text: 'Write the recursive formula.', tex: 'a_1 = 5, \\quad a_n = a_{n-1} + 6', why: 'Start at 5, and add 6 to each term to get the next. Check: $5, 11, 17$ matches $6n - 1$ for $n = 1, 2, 3$.' },
      ],
      answer: '$a_1 = 5,\\ a_n = a_{n-1} + 6$',
    },
    {
      title: 'Seats in a theater',
      kind: 'real-world',
      problem: [{ t: 'p', text: 'Row 1 of a theater has 22 seats, and each row after that has 4 more seats than the row before it. Write an explicit formula for $a_n$, the number of seats in row $n$, and find the number of seats in row 15.' }],
      steps: [
        { text: 'Identify the first term and the common difference.', tex: 'a_1 = 22, \\quad d = 4', why: 'The rows start at 22 seats and grow by the same 4 seats each row, so the seat counts form an arithmetic sequence.' },
        { text: 'Write the explicit formula.', tex: 'a_n = 22 + (n - 1)(4) = 22 + 4n - 4 = 4n + 18', why: 'Row $n$ is $n - 1$ rows after row 1, so 4 seats are added $n - 1$ times.' },
        { text: 'Find row 15.', tex: 'a_{15} = 4(15) + 18 = 60 + 18 = 78', why: 'Check by counting jumps: $22 + 14 \\cdot 4 = 22 + 56 = 78$.' },
      ],
      answer: '$a_n = 4n + 18$; row 15 has 78 seats.',
    },
    {
      title: 'Saving for a new phone',
      kind: 'real-world',
      problem: [{ t: 'p', text: 'You have \\$40 saved at the end of week 1 and add \\$15 every week after that. Write a recursive and an explicit formula for your savings at the end of week $n$. How much will you have at the end of week 12? In which week will you first have at least \\$300?' }],
      steps: [
        { text: 'Write the recursive formula.', tex: 'a_1 = 40, \\quad a_n = a_{n-1} + 15', why: 'You start with \\$40 and each week is the previous week plus \\$15.' },
        { text: 'Write the explicit formula.', tex: 'a_n = 40 + (n - 1)15 = 40 + 15n - 15 = 15n + 25' },
        { text: 'Find week 12.', tex: 'a_{12} = 15(12) + 25 = 180 + 25 = 205', why: 'Check: $40 + 11 \\cdot 15 = 40 + 165 = 205$.' },
        { text: 'Find when savings reach \\$300.', tex: '15n + 25 \\ge 300 \\;\\Rightarrow\\; 15n \\ge 275 \\;\\Rightarrow\\; n \\ge 18.\\overline{3}', why: 'Weeks are whole numbers, so round **up** to the next week.' },
        { text: 'Check weeks 18 and 19.', tex: 'a_{18} = 270 + 25 = 295 \\qquad a_{19} = 285 + 25 = 310', why: 'Week 18 is still short of \\$300; week 19 is the first week at or above it.' },
      ],
      answer: '$a_1 = 40,\\ a_n = a_{n-1} + 15$; $a_n = 15n + 25$; \\$205 at week 12; first at least \\$300 in week 19.',
    },
  ],
  teachMeAgain: [
    {
      approach: 'visual',
      title: 'See the jumps on a graph',
      blocks: [
        { t: 'p', text: 'Plot each term as a point $(n, a_n)$. For $4, 6, 8, 10, 12$:' },
        {
          t: 'graph',
          spec: { xMin: 0, xMax: 6, yMin: 0, yMax: 14, yStep: 2, xLabel: 'n', yLabel: 'a_n', scatter: [{ x: 1, y: 4 }, { x: 2, y: 6 }, { x: 3, y: 8 }, { x: 4, y: 10 }, { x: 5, y: 12 }], ariaLabel: 'Five separate points at (1, 4), (2, 6), (3, 8), (4, 10) and (5, 12), each 2 units higher than the one before.' },
        },
        { t: 'p', text: 'Every step right (one more term) goes up the same amount, $2$. That steady climb is the common difference, and it is why the points line up in a straight line. To reach the 5th point from the 1st, you take **4** steps: $4 + 4 \\cdot 2 = 12$.' },
      ],
    },
    {
      approach: 'analogy',
      title: 'Climbing stairs between floors',
      blocks: [
        { t: 'p', text: 'You start on floor 1 of a building. Each flight of stairs takes you up one floor.' },
        { t: 'list', items: ['To reach floor 2, you climb **1** flight.', 'To reach floor 10, you climb **9** flights, not 10.', 'To reach floor $n$, you climb $n - 1$ flights.'] },
        { t: 'p', text: 'In a sequence, $a_1$ is floor 1 and each flight adds $d$. That is exactly why the formula is $a_n = a_1 + (n - 1)d$.' },
      ],
    },
    {
      approach: 'step-by-step',
      title: 'A 4-step routine',
      blocks: [
        { t: 'p', text: 'Example: a stadium has 20 seats in row 1, and each row has 4 more seats than the row before. How many seats are in row 15?' },
        {
          t: 'list',
          ordered: true,
          items: [
            '**Find $a_1$:** the first term is $20$.',
            '**Find $d$:** each row adds $4$, so $d = 4$.',
            '**Fill in the formula:** $a_n = 20 + (n - 1)4$.',
            '**Plug in $n$:** $a_{15} = 20 + 14 \\cdot 4 = 20 + 56 = 76$ seats.',
          ],
        },
        { t: 'callout', variant: 'tip', text: 'The recursive version of this is $a_1 = 20$, $a_n = a_{n-1} + 4$. Both formulas describe the same rows of seats.' },
      ],
    },
    {
      approach: 'prerequisite',
      title: 'Refresher: distributing and negatives',
      blocks: [
        { t: 'list', items: ['Distribute: $(n - 1)3 = 3n - 3$.', 'Then combine: $5 + 3n - 3 = 3n + 2$.', 'With a negative $d$: $(n - 1)(-5) = -5n + 5$, so $12 + (n - 1)(-5) = 17 - 5n$.', 'Subtracting a negative: $2 - (-3) = 2 + 3 = 5$.'] },
        { t: 'p', text: 'Try it: simplify $10 + (n - 1)(-2)$. Distribute to get $10 - 2n + 2$, then combine to get $12 - 2n$.' },
      ],
    },
    {
      approach: 'alternate-strategy',
      title: 'The "term zero" shortcut',
      blocks: [
        { t: 'p', text: 'Here is another way to write the explicit formula. Step **backward** one term from $a_1$ to find a pretend "term 0":' },
        { t: 'math', tex: 'a_0 = a_1 - d' },
        { t: 'p', text: 'Then the formula is $a_n = dn + a_0$, just like $y = mx + b$. For $7, 11, 15, \\ldots$: $d = 4$ and $a_0 = 7 - 4 = 3$, so $a_n = 4n + 3$.' },
        { t: 'p', text: 'Check: $a_1 = 4(1) + 3 = 7$ and $a_3 = 4(3) + 3 = 15$. Both match the sequence, and it is the same answer as $7 + (n - 1)4$.' },
      ],
    },
  ],
  guided: [
    { generator: 'u1.seq-explicit', difficulty: 1 },
    { generator: 'u1.seq-explicit', difficulty: 1 },
    { generator: 'u1.seq-recursive', difficulty: 1 },
    { generator: 'u1.seq-explicit', difficulty: 2 },
  ],
  independent: {
    count: 8,
    reviewCount: 2,
    mix: [
      { generator: 'u1.seq-explicit', difficulty: 1, weight: 1 },
      { generator: 'u1.seq-explicit', difficulty: 2, weight: 2 },
      { generator: 'u1.seq-explicit', difficulty: 3, weight: 1 },
      { generator: 'u1.seq-recursive', difficulty: 1, weight: 1 },
      { generator: 'u1.seq-recursive', difficulty: 2, weight: 2 },
      { generator: 'u1.seq-recursive', difficulty: 3, weight: 1 },
      { generator: 'u1.slope-table', difficulty: 1, weight: 1 },
      { generator: 'u1.eval-linear', difficulty: 2, weight: 1 },
    ],
  },
  quiz: {
    items: [
      { generator: 'u1.seq-explicit', difficulty: 2 },
      { generator: 'u1.seq-explicit', difficulty: 2 },
      { generator: 'u1.seq-explicit', difficulty: 3 },
      { generator: 'u1.seq-recursive', difficulty: 2 },
      { generator: 'u1.seq-recursive', difficulty: 2 },
      { generator: 'u1.seq-recursive', difficulty: 3 },
    ],
  },
  summary: [
    'An **arithmetic sequence** adds the same number $d$ each time. Find $d$ by subtracting a term minus the term before it.',
    'Explicit formula: $a_n = a_1 + (n - 1)d$. Use $n - 1$ because there are $n - 1$ jumps from the first term to the $n$th.',
    'Recursive formula: give $a_1$, then $a_n = a_{n-1} + d$. To convert to explicit, put $a_1$ and $d$ into the explicit formula. To go from explicit to recursive, find $a_1$ by substituting $n = 1$, and use the coefficient of $n$ as $d$.',
    'In a real situation (seats per row, cost per extra day), the first value is $a_1$ and the amount added each time is $d$.',
    'To find **which term** has a value, set the formula equal to that value and solve for $n$. The answer is a position, not a value.',
  ],
  mastery: { quizPassScore: 0.8, practiceMinCorrect: 5 },
};
