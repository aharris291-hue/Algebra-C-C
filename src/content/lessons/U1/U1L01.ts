import type { LessonContent } from '../../../core/curriculum/types';

/**
 * U1L01 Functions and Function Notation (A.FGR.2.4)
 * The first lesson demonstrates the complete chain (spec §35):
 * Teach -> Example -> Guided Practice -> Hint -> Independent Practice -> Quiz -> Feedback -> Mastery -> XP -> Dashboard.
 *
 * Math verified by hand (2026-10-04): every worked example below was recomputed independently.
 */
export const U1L01: LessonContent = {
  lessonId: 'U1L01',
  goal: 'Decide whether a relation is a function, and use function notation like $f(3)$ to find outputs from a rule, a table, or a graph.',
  needToKnow: [
    { t: 'p', text: 'You already know how to do the two things this lesson builds on:' },
    {
      t: 'list',
      items: [
        '**Plot and read points.** In $(4, -2)$, the first number is $x$ (left/right) and the second is $y$ (up/down).',
        '**Substitute and use the order of operations.** If $x = -3$, then $2x + 5 = 2(-3) + 5 = -6 + 5 = -1$. Multiply before you add.',
      ],
    },
    { t: 'callout', variant: 'tip', title: 'Quick check', text: 'What is $4x - 1$ when $x = 2$? (You should get $7$.) If that felt shaky, open **Teach Me Again** and choose the refresher.' },
  ],
  vocabulary: [
    { term: 'relation', meaning: 'Any set of input-output pairs.' },
    { term: 'function', meaning: 'A relation where every input has exactly one output.' },
    { term: 'input', meaning: 'The value you put in, usually $x$.' },
    { term: 'output', meaning: 'The value you get out, usually $y$ or $f(x)$.' },
    { term: 'function notation', meaning: '$f(x)$, read "f of x": the output of function $f$ for input $x$.' },
  ],
  instruction: [
    { t: 'p', text: '### Relations and functions' },
    { t: 'p', text: 'A **relation** is any set of pairs that match an input with an output. You can show a relation as ordered pairs, a table, a graph, or a rule.' },
    { t: 'p', text: 'A **function** is a special relation: **every input has exactly one output.** Think of a vending machine. If pressing B4 sometimes gave chips and sometimes gave a cookie, the machine would be broken. A function never does that: the same input always gives the same output.' },
    {
      t: 'table',
      caption: 'A function: each input appears once.',
      headers: ['Input x', 'Output y'],
      rows: [
        ['1', '5'],
        ['2', '7'],
        ['3', '7'],
        ['4', '9'],
      ],
    },
    { t: 'callout', variant: 'why', title: 'Why is that table still a function?', text: 'The inputs 2 and 3 both have the output 7. That is allowed. Two different inputs can share an output, like two friends who have the same birthday. The only thing that breaks a function is **one input with two different outputs**.' },
    {
      t: 'table',
      caption: 'Not a function: the input 2 has two outputs.',
      headers: ['Input x', 'Output y'],
      rows: [
        ['1', '5'],
        ['2', '7'],
        ['2', '8'],
        ['4', '9'],
      ],
    },
    { t: 'p', text: '### Function notation' },
    { t: 'p', text: 'We name functions with letters like $f$, $g$ and $h$. The notation $f(x)$ is read "**f of x**" and means "the output of $f$ when the input is $x$." It does **not** mean $f$ times $x$.' },
    { t: 'math', tex: 'f(x) = 2x + 5 \\qquad \\text{is the same rule as} \\qquad y = 2x + 5' },
    { t: 'p', text: 'To find $f(3)$, replace every $x$ in the rule with $3$, then simplify:' },
    { t: 'math', tex: 'f(3) = 2(3) + 5 = 6 + 5 = 11' },
    { t: 'p', text: 'The statement $f(3) = 11$ says: when the input is $3$, the output is $11$. On a graph, that is the point $(3, 11)$.' },
    { t: 'callout', variant: 'warning', title: 'Use parentheses for negative inputs', text: 'For $f(-4)$, write $f(-4) = 2(-4) + 5 = -8 + 5 = -3$. Without parentheses it is easy to lose the negative sign.' },
    { t: 'p', text: '### Reading function notation from a table or a graph' },
    { t: 'p', text: 'In a table, $f(a)$ is the output in the row where the input is $a$. On a graph, $f(a)$ is the $y$-value of the point on the graph straight above or below $x = a$.' },
    {
      t: 'graph',
      caption: 'The graph of f(x) = 2x - 1. The point (2, 3) shows f(2) = 3.',
      spec: { xMin: -5, xMax: 5, yMin: -5, yMax: 7, functions: [{ expr: '2x - 1', label: 'f(x) = 2x - 1' }], points: [{ x: 2, y: 3, label: '(2, 3)' }], segments: [{ x1: 2, y1: 0, x2: 2, y2: 3, dashed: true }, { x1: 0, y1: 3, x2: 2, y2: 3, dashed: true }], ariaLabel: 'Line f(x) = 2x - 1 with the point (2, 3) marked; dashed guides go up from x = 2 and across to y = 3.' },
    },
  ],
  examples: [
    {
      title: 'Is it a function?',
      kind: 'introductory',
      problem: [{ t: 'p', text: 'Is the relation $\\{(3, 1), (-2, 4), (5, 1), (0, -6)\\}$ a function?' }],
      steps: [
        { text: 'List the inputs.', tex: '3,\\ -2,\\ 5,\\ 0', why: 'A function is broken only when an input repeats with a different output, so the inputs are what to check.' },
        { text: 'No input repeats.', why: 'The outputs $1$ and $1$ repeat, but they belong to different inputs ($3$ and $5$). That is allowed.' },
        { text: 'Conclusion: it **is** a function.' },
      ],
      answer: 'Yes, it is a function.',
    },
    {
      title: 'Evaluate with a negative input',
      kind: 'intermediate',
      problem: [{ t: 'p', text: 'For $g(x) = -3x + 4$, find $g(-2)$.' }],
      steps: [
        { text: 'Substitute $-2$ for $x$, using parentheses.', tex: 'g(-2) = -3(-2) + 4', why: 'The number inside $g(\\ )$ is the input, so it replaces $x$.' },
        { text: 'Multiply.', tex: 'g(-2) = 6 + 4', why: 'A negative times a negative is positive: $-3 \\cdot (-2) = 6$. Multiplication comes before addition.' },
        { text: 'Add.', tex: 'g(-2) = 10' },
      ],
      answer: '$g(-2) = 10$',
    },
    {
      title: 'A common mistake: f(3) is not f times 3',
      kind: 'common-mistake',
      problem: [{ t: 'p', text: 'For $f(x) = 5x - 2$, a student says $f(3) = 3f = 15x - 6$. What went wrong, and what is $f(3)$?' }],
      steps: [
        { text: 'Spot the error.', why: 'The student treated $f(3)$ as multiplication. In function notation, the parentheses hold the **input**, so $f(3)$ is a number, not an expression with $x$.' },
        { text: 'Substitute $3$ for $x$.', tex: 'f(3) = 5(3) - 2', why: 'Replace $x$ with the input.' },
        { text: 'Simplify.', tex: 'f(3) = 15 - 2 = 13', why: 'Multiply first, then subtract.' },
      ],
      answer: '$f(3) = 13$',
    },
    {
      title: 'Streaming subscription',
      kind: 'real-world',
      problem: [{ t: 'p', text: 'A streaming service charges a \\$5 setup fee plus \\$12 per month, so the total cost after $m$ months is $C(m) = 12m + 5$. Find $C(9)$ and explain what it means.' }],
      steps: [
        { text: 'Substitute $9$ for $m$.', tex: 'C(9) = 12(9) + 5', why: 'The input $m$ is the number of months.' },
        { text: 'Simplify.', tex: 'C(9) = 108 + 5 = 113', why: 'Multiply, then add.' },
        { text: 'Interpret.', why: 'The output is a cost in dollars, so $C(9) = 113$ means 9 months of the service cost a total of \\$113.' },
      ],
      answer: '$C(9) = 113$: nine months cost \\$113 in total.',
    },
    {
      title: 'Combining function values',
      kind: 'challenging',
      problem: [{ t: 'p', text: 'For $h(x) = 4x - 7$, find $2h(1) - h(-3)$.' }],
      steps: [
        { text: 'Find $h(1)$.', tex: 'h(1) = 4(1) - 7 = -3', why: 'Evaluate each function value separately first.' },
        { text: 'Find $h(-3)$.', tex: 'h(-3) = 4(-3) - 7 = -12 - 7 = -19', why: 'Use parentheses for the negative input.' },
        { text: 'Substitute the values.', tex: '2h(1) - h(-3) = 2(-3) - (-19)', why: 'Function values are numbers, so replace each one with its value.' },
        { text: 'Simplify.', tex: '-6 + 19 = 13', why: 'Subtracting a negative is the same as adding its opposite.' },
      ],
      answer: '$13$',
    },
    {
      title: 'Reading a graph',
      kind: 'intermediate',
      problem: [
        { t: 'p', text: 'Use the graph of $y = f(x)$ to find $f(-2)$.' },
        { t: 'graph', spec: { xMin: -5, xMax: 5, yMin: -5, yMax: 5, functions: [{ expr: '-x + 1', label: 'y = f(x)' }], ariaLabel: 'A line falling from left to right through (0, 1) and (1, 0).' } },
      ],
      steps: [
        { text: 'Find $-2$ on the $x$-axis.', why: 'The input of $f(-2)$ is $-2$, and inputs are on the horizontal axis.' },
        { text: 'Go straight up to the line. You reach the point $(-2, 3)$.', tex: '(-2,\\ 3)', why: 'The point on the graph above $x = -2$ has the output as its $y$-coordinate.' },
        { text: 'Read the $y$-value.', tex: 'f(-2) = 3' },
      ],
      answer: '$f(-2) = 3$',
    },
  ],
  teachMeAgain: [
    {
      approach: 'visual',
      title: 'Picture a function machine',
      blocks: [
        { t: 'p', text: 'Imagine a machine named $f$. You drop a number in the top, the machine follows its rule, and one number comes out the bottom.' },
        { t: 'math', tex: '3 \\;\\longrightarrow\\; \\boxed{\\;f: \\text{ double it, then add } 5\\;} \\;\\longrightarrow\\; 11' },
        { t: 'p', text: 'We write that trip as $f(3) = 11$: **the name of the machine, the input in parentheses, and the output after the equals sign.**' },
        { t: 'p', text: 'A relation is a function when the machine is reliable: the same input always produces the same single output.' },
      ],
    },
    {
      approach: 'step-by-step',
      title: 'A 3-step checklist for evaluating',
      blocks: [
        { t: 'list', ordered: true, items: ['**Copy the rule** and replace every $x$ with empty parentheses: $f(\\;) = 2(\\;) + 5$.', '**Write the input** inside each pair of parentheses: $f(-4) = 2(-4) + 5$.', '**Simplify** in order: multiply first ($-8$), then add ($-8 + 5 = -3$).'] },
        { t: 'callout', variant: 'tip', text: 'The empty parentheses trick keeps negative signs safe every time.' },
      ],
    },
    {
      approach: 'prerequisite',
      title: 'Refresher: negatives and order of operations',
      blocks: [
        { t: 'list', items: ['Positive times negative is negative: $3 \\cdot (-4) = -12$.', 'Negative times negative is positive: $-2 \\cdot (-5) = 10$.', 'Multiply before you add or subtract: $2 + 3 \\cdot 4 = 2 + 12 = 14$, not $20$.', 'Adding a negative moves left on a number line: $-8 + 5 = -3$.'] },
        { t: 'p', text: 'Try it: $-3(-2) + 4$. First $-3(-2) = 6$, then $6 + 4 = 10$.' },
      ],
    },
    {
      approach: 'analogy',
      title: 'Seats in a classroom',
      blocks: [
        { t: 'p', text: 'Think of students (inputs) and seats (outputs). A seating chart is a function if **every student has exactly one seat**.' },
        { t: 'list', items: ['Two students sharing one big table seat? Still a function: each student still has one assigned seat.', 'One student assigned to two different seats? Not a function: we would not know where that student sits.'] },
        { t: 'p', text: 'So when you check a relation, look at each input and ask: "Does this input go to just one output?"' },
      ],
    },
    {
      approach: 'simpler-example',
      title: 'Start with the easiest case',
      blocks: [
        { t: 'p', text: 'Let $f(x) = x + 10$. Then:' },
        { t: 'math', tex: 'f(1) = 1 + 10 = 11, \\quad f(2) = 2 + 10 = 12, \\quad f(0) = 0 + 10 = 10' },
        { t: 'p', text: 'Now add a multiplication. Let $g(x) = 3x$. Then $g(2) = 3(2) = 6$ and $g(5) = 3(5) = 15$.' },
        { t: 'p', text: 'Put them together: $h(x) = 3x + 10$ gives $h(2) = 3(2) + 10 = 6 + 10 = 16$.' },
      ],
    },
  ],
  guided: [
    { generator: 'u1.is-function', difficulty: 1 },
    { generator: 'u1.eval-linear', difficulty: 1 },
    { generator: 'u1.notation-table', difficulty: 1 },
    { generator: 'u1.eval-linear', difficulty: 2 },
  ],
  independent: {
    count: 8,
    reviewCount: 0,
    mix: [
      { generator: 'u1.is-function', difficulty: 2, weight: 1 },
      { generator: 'u1.eval-linear', difficulty: 1, weight: 1 },
      { generator: 'u1.eval-linear', difficulty: 2, weight: 2 },
      { generator: 'u1.eval-linear', difficulty: 3, weight: 1 },
      { generator: 'u1.eval-context', difficulty: 1, weight: 1 },
      { generator: 'u1.notation-table', difficulty: 2, weight: 1 },
      { generator: 'u1.notation-graph', difficulty: 1, weight: 1 },
    ],
  },
  quiz: {
    items: [
      { generator: 'u1.is-function', difficulty: 2 },
      { generator: 'u1.eval-linear', difficulty: 2 },
      { generator: 'u1.eval-linear', difficulty: 3 },
      { generator: 'u1.notation-table', difficulty: 2 },
      { generator: 'u1.eval-context', difficulty: 2 },
      { generator: 'u1.notation-graph', difficulty: 2 },
    ],
  },
  summary: [
    'A **function** gives every input exactly one output. Repeated outputs are fine; one input with two outputs is not.',
    '$f(x)$ is read "f of x" and means the output for input $x$. It is not multiplication.',
    'To evaluate $f(a)$, replace every $x$ with $(a)$ and simplify: multiply before adding.',
    '$f(a) = b$ means the point $(a, b)$ is on the graph of $f$.',
  ],
  mastery: { quizPassScore: 0.8, practiceMinCorrect: 5 },
};
