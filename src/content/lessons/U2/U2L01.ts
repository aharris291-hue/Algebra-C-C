import type { LessonContent } from '../../../core/curriculum/types';

/**
 * U2L01 Inequalities in One and Two Variables (A.PAR.4.1)
 * Solving and graphing one-variable inequalities (S2.01) and writing inequalities
 * from words and situations, including two-variable inequalities (S2.02).
 *
 * Math verified by hand (2026-10-05): every worked example, number line and check below was recomputed independently.
 */
export const U2L01: LessonContent = {
  lessonId: 'U2L01',
  goal: 'Solve one-variable inequalities (and know when to flip the symbol), graph the solutions on a number line, and write inequalities in one or two variables from words and real situations.',
  needToKnow: [
    { t: 'p', text: 'This lesson builds on two things you already know:' },
    {
      t: 'list',
      items: [
        '**Solving two-step equations.** To solve $3x - 5 = 10$, add $5$ to both sides ($3x = 15$), then divide by $3$ ($x = 5$).',
        '**Inequality symbols.** $<$ means "is less than," $>$ means "is greater than," $\\le$ means "is less than or equal to," and $\\ge$ means "is greater than or equal to."',
      ],
    },
    { t: 'callout', variant: 'tip', title: 'Quick check', text: 'Solve $4x + 7 = -5$. (You should get $x = -3$.) If that felt shaky, open **Teach Me Again** and choose the refresher.' },
  ],
  vocabulary: [
    { term: 'inequality', meaning: 'A math sentence that compares two expressions with $<$, $>$, $\\le$ or $\\ge$.' },
    { term: 'solution set', meaning: 'All the values that make an inequality true. For $x > 3$ that is every number bigger than $3$.' },
    { term: 'boundary point', meaning: 'The number where the solutions start, like $3$ in $x > 3$.' },
    { term: 'open circle', meaning: 'Used on a number line for $<$ or $>$: the boundary point is **not** a solution.' },
    { term: 'closed circle', meaning: 'Used on a number line for $\\le$ or $\\ge$: the boundary point **is** a solution.' },
    { term: 'two-variable inequality', meaning: 'An inequality with two unknowns, like $3x + 5y \\le 60$. Its solutions are pairs $(x, y)$.' },
  ],
  instruction: [
    { t: 'p', text: '### An inequality has many solutions' },
    { t: 'p', text: 'The equation $x + 4 = 7$ has one solution, $x = 3$. The inequality $x + 4 > 7$ has **infinitely many**: $3.5$, $4$, $10$ and $1000$ all work, because each one plus $4$ is more than $7$. The number $3$ itself does **not** work, because $3 + 4 = 7$ is not more than $7$.' },
    {
      t: 'table',
      caption: 'The four inequality symbols',
      headers: ['Symbol', 'Read it as', 'Boundary included?', 'Circle on a number line'],
      rows: [
        ['$<$', 'is less than', 'no', 'open'],
        ['$>$', 'is greater than', 'no', 'open'],
        ['$\\le$', 'is less than or equal to', 'yes', 'closed'],
        ['$\\ge$', 'is greater than or equal to', 'yes', 'closed'],
      ],
    },
    { t: 'p', text: '### Solving: just like an equation, with one exception' },
    { t: 'p', text: 'You can add or subtract the same number on both sides, and you can multiply or divide both sides by the same **positive** number. The symbol stays the same:' },
    { t: 'math', tex: 'x + 4 > 7 \\;\\Rightarrow\\; x > 3 \\qquad\\qquad 2x \\le 10 \\;\\Rightarrow\\; x \\le 5' },
    { t: 'p', text: 'The exception: **when you multiply or divide both sides by a negative number, flip the inequality symbol.**' },
    { t: 'callout', variant: 'why', title: 'Why does a negative flip the symbol?', text: 'Start with a true statement: $2 < 5$. Multiply both sides by $-1$ and you get $-2$ and $-5$. On a number line, $-2$ is to the **right** of $-5$, so $-2$ is the bigger number: $-2 > -5$. Multiplying by a negative mirrors every number across $0$, so the order of the two sides reverses. If you kept the symbol, you would write $-2 < -5$, which is false.' },
    {
      t: 'numberline',
      caption: '2 < 5, but after multiplying by -1 the order reverses: -5 < -2, which is the same as -2 > -5.',
      spec: { min: -6, max: 6, points: [{ x: -5, closed: true }, { x: -2, closed: true }, { x: 2, closed: true }, { x: 5, closed: true }], ariaLabel: 'Number line from -6 to 6 with dots at -5, -2, 2 and 5. 2 is left of 5, while -2 is right of -5.' },
    },
    { t: 'p', text: 'Example: solve $-3x \\le 12$. Divide both sides by $-3$ and flip the symbol:' },
    { t: 'math', tex: '-3x \\le 12 \\;\\Rightarrow\\; \\frac{-3x}{-3} \\ge \\frac{12}{-3} \\;\\Rightarrow\\; x \\ge -4' },
    { t: 'p', text: 'Check with an easy number from your answer, like $x = 0$ (it is $\\ge -4$): $-3(0) = 0$, and $0 \\le 12$ is true. Good.' },
    { t: 'p', text: '### Graphing the solutions on a number line' },
    {
      t: 'list',
      items: [
        '**Circle:** open for $<$ or $>$, closed (filled in) for $\\le$ or $\\ge$.',
        '**Shade:** toward the numbers that work. For $x \\ge -4$ shade to the right (bigger numbers); for $x < 2$ shade to the left (smaller numbers).',
      ],
    },
    {
      t: 'numberline',
      caption: 'x >= -4: closed circle at -4, shaded to the right.',
      spec: { min: -7, max: 3, rays: [{ from: -4, closed: true, dir: 'right' }], ariaLabel: 'Number line from -7 to 3 with a closed circle at -4 and shading to the right.' },
    },
    {
      t: 'numberline',
      caption: 'x < 2: open circle at 2, shaded to the left.',
      spec: { min: -3, max: 7, rays: [{ from: 2, closed: false, dir: 'left' }], ariaLabel: 'Number line from -3 to 7 with an open circle at 2 and shading to the left.' },
    },
    { t: 'callout', variant: 'tip', title: 'Put x on the left', text: 'When $x$ is written first, the tip of the symbol points the way you shade: $x < 2$ points left, $x \\ge -4$ points right. If your answer looks like $5 > x$, rewrite it as $x < 5$ first (read it from right to left).' },
    { t: 'p', text: '### Translating words into symbols' },
    {
      t: 'table',
      caption: 'Phrases that signal an inequality',
      headers: ['Phrase', 'Symbol', 'Example', 'Inequality'],
      rows: [
        ['at least, no less than, a minimum of', '$\\ge$', 'You must be at least 13 to join.', '$a \\ge 13$'],
        ['at most, no more than, a maximum of', '$\\le$', 'No more than 30 people fit in the room.', '$p \\le 30$'],
        ['more than, greater than, exceeds', '$>$', 'Her score exceeds 90.', '$s > 90$'],
        ['less than, fewer than, below', '$<$', 'Fewer than 8 tickets are left.', '$t < 8$'],
      ],
    },
    { t: 'callout', variant: 'warning', title: 'Two meanings of less than', text: '"$x$ **is** less than 5" is the inequality $x < 5$. But "5 less than $x$" is the expression $x - 5$ (start with $x$, take away 5). Look for the word **is** to spot an inequality.' },
    { t: 'p', text: '### Inequalities in two variables' },
    { t: 'p', text: 'Some situations have two unknown amounts. Suppose you have \\$60 to spend at a trampoline park. Each jump session costs \\$3 and each snack costs \\$5. Let $x$ be the number of jump sessions and $y$ the number of snacks. You can spend **at most** \\$60:' },
    { t: 'math', tex: '3x + 5y \\le 60' },
    { t: 'p', text: 'A solution is a **pair** of numbers. $(10, 6)$ works: $3(10) + 5(6) = 30 + 30 = 60$, and $60 \\le 60$ is true. $(15, 4)$ does not: $3(15) + 5(4) = 45 + 20 = 65$, and $65 \\le 60$ is false.' },
    { t: 'callout', variant: 'realworld', title: 'Build it like a sentence', text: 'Write (cost of one item) times (how many) for each item, add them, then choose the symbol from the words: a budget or limit ("at most") means $\\le$, a goal or minimum ("at least") means $\\ge$. Read carefully: "more than" means $>$.' },
  ],
  examples: [
    {
      title: 'A one-step inequality',
      kind: 'introductory',
      problem: [{ t: 'p', text: 'Solve $x - 6 \\ge -2$ and describe its graph on a number line.' }],
      steps: [
        { text: 'Add $6$ to both sides.', tex: 'x - 6 + 6 \\ge -2 + 6 \\;\\Rightarrow\\; x \\ge 4', why: 'Adding the same number to both sides keeps the inequality true, so the symbol does not change.' },
        { text: 'Check a number in the answer, like $x = 5$.', tex: '5 - 6 = -1 \\ge -2 \\checkmark', why: 'A number from the solution set should make the original inequality true.' },
        { text: 'Describe the graph.', why: 'The symbol $\\ge$ includes the boundary, so use a **closed** circle at $4$. Numbers greater than $4$ are to the right, so shade right.' },
      ],
      answer: '$x \\ge 4$: closed circle at $4$, shaded to the right.',
    },
    {
      title: 'Dividing by a negative',
      kind: 'intermediate',
      problem: [{ t: 'p', text: 'Solve $5 - 2x < 11$ and graph the solution.' }],
      steps: [
        { text: 'Subtract $5$ from both sides.', tex: '-2x < 6', why: 'Undo the addition first, just like solving an equation. Subtracting does not change the symbol.' },
        { text: 'Divide both sides by $-2$ and flip the symbol.', tex: 'x > -3', why: 'Dividing by a negative reverses the order of the two sides, so $<$ becomes $>$. Also $6 \\div (-2) = -3$.' },
        { text: 'Check $x = 0$, which is in the answer.', tex: '5 - 2(0) = 5 < 11 \\checkmark', why: 'Zero is greater than $-3$, so it should work, and it does.' },
        { text: 'Check $x = -5$, which is not in the answer.', tex: '5 - 2(-5) = 5 + 10 = 15, \\quad 15 < 11 \\text{ is false}', why: 'A number outside the answer should fail. It does, which confirms the flip was right.' },
        { text: 'Graph it.', why: '$>$ does not include $-3$, so use an **open** circle at $-3$ and shade to the right.' },
      ],
      answer: '$x > -3$: open circle at $-3$, shaded to the right.',
    },
    {
      title: 'A common mistake: forgetting to flip',
      kind: 'common-mistake',
      problem: [
        { t: 'p', text: 'A student solved $-4x \\ge 20$ and got $x \\ge -5$, graphed below. What went wrong, and what is the correct answer?' },
        { t: 'numberline', caption: 'The student graph of x >= -5.', spec: { min: -9, max: 1, rays: [{ from: -5, closed: true, dir: 'right' }], ariaLabel: 'Number line from -9 to 1 with a closed circle at -5 and shading to the right.' } },
      ],
      steps: [
        { text: 'Test a number from the student answer, like $x = 0$.', tex: '-4(0) = 0, \\quad 0 \\ge 20 \\text{ is false}', why: 'The student graph says $0$ is a solution, but it does not make the original inequality true. So the answer is wrong.' },
        { text: 'Spot the error.', why: 'The student divided by $-4$ but kept $\\ge$. Dividing by a negative must flip the symbol.' },
        { text: 'Divide by $-4$ and flip.', tex: 'x \\le -5', why: '$20 \\div (-4) = -5$, and $\\ge$ becomes $\\le$.' },
        { text: 'Check $x = -6$.', tex: '-4(-6) = 24, \\quad 24 \\ge 20 \\checkmark', why: '$-6$ is less than $-5$, so it should work, and it does.' },
      ],
      answer: '$x \\le -5$: closed circle at $-5$, shaded to the **left**.',
    },
    {
      title: 'Saving for a new phone',
      kind: 'real-world',
      problem: [{ t: 'p', text: 'Jordan has saved \\$90 and earns \\$12 per hour at a part-time job. He wants **at least** \\$450 for a new phone. Write and solve an inequality for the number of hours $h$ he must work.' }],
      steps: [
        { text: 'Write the inequality.', tex: '90 + 12h \\ge 450', why: 'His total is the \\$90 he has plus \\$12 for each hour. "At least" means $\\ge$.' },
        { text: 'Subtract $90$ from both sides.', tex: '12h \\ge 360', why: 'Undo the addition. $450 - 90 = 360$.' },
        { text: 'Divide both sides by $12$.', tex: 'h \\ge 30', why: 'Dividing by a positive number keeps the symbol. $360 \\div 12 = 30$.' },
        { text: 'Check $h = 30$.', tex: '90 + 12(30) = 90 + 360 = 450 \\ge 450 \\checkmark', why: 'Exactly 30 hours gives exactly \\$450, which counts because of "at least."' },
      ],
      answer: '$h \\ge 30$: Jordan must work at least 30 hours.',
    },
    {
      title: 'Variables on both sides',
      kind: 'challenging',
      problem: [{ t: 'p', text: 'Solve $3(x - 4) > 5x + 2$.' }],
      steps: [
        { text: 'Distribute the $3$.', tex: '3x - 12 > 5x + 2', why: 'The distributive property: $3 \\cdot x - 3 \\cdot 4$.' },
        { text: 'Subtract $5x$ from both sides.', tex: '-2x - 12 > 2', why: 'Collect the $x$-terms on one side. $3x - 5x = -2x$.' },
        { text: 'Add $12$ to both sides.', tex: '-2x > 14' },
        { text: 'Divide by $-2$ and flip.', tex: 'x < -7', why: 'Dividing by a negative reverses the symbol. $14 \\div (-2) = -7$. (You could instead subtract $3x$ first to get $-14 > 2x$, so $-7 > x$: the same answer with no flip.)' },
        { text: 'Check $x = -8$.', tex: '3(-8 - 4) = -36, \\quad 5(-8) + 2 = -38, \\quad -36 > -38 \\checkmark', why: '$-36$ is to the right of $-38$ on a number line, so it is greater. The answer checks.' },
      ],
      answer: '$x < -7$: open circle at $-7$, shaded to the left.',
    },
    {
      title: 'Team fundraiser goal',
      kind: 'real-world',
      problem: [{ t: 'p', text: 'The soccer team sells T-shirts for \\$15 and hats for \\$10. They want to raise **more than** \\$600. Let $x$ be the number of T-shirts and $y$ the number of hats. Write an inequality, then decide whether selling 30 T-shirts and 20 hats meets the goal.' }],
      steps: [
        { text: 'Write the money from each item.', tex: '15x \\text{ and } 10y', why: 'Price times the number sold gives the money from each item.' },
        { text: 'Add them and choose the symbol.', tex: '15x + 10y > 600', why: '"More than" means $>$. Exactly \\$600 would not be more than \\$600.' },
        { text: 'Substitute $x = 30$ and $y = 20$.', tex: '15(30) + 10(20) = 450 + 200 = 650', why: 'A pair is a solution if it makes the inequality true.' },
        { text: 'Compare.', tex: '650 > 600 \\checkmark', why: 'The total is more than \\$600, so the goal is met.' },
      ],
      answer: '$15x + 10y > 600$; 30 T-shirts and 20 hats raise \\$650, which meets the goal.',
    },
  ],
  teachMeAgain: [
    {
      approach: 'visual',
      title: 'See the flip on a number line',
      blocks: [
        { t: 'p', text: 'Put $3$ and $7$ on a number line: $3 < 7$ because $3$ is on the left.' },
        { t: 'p', text: 'Now multiply both by $-1$. The numbers jump across $0$ like a mirror: $3$ lands on $-3$ and $7$ lands on $-7$. Now $-7$ is on the left, so $-7 < -3$, which means $-3 > -7$.' },
        {
          t: 'numberline',
          caption: 'Mirroring across 0 swaps which number is on the left.',
          spec: { min: -8, max: 8, points: [{ x: -7, closed: true }, { x: -3, closed: true }, { x: 3, closed: true }, { x: 7, closed: true }], ariaLabel: 'Number line from -8 to 8 with dots at -7, -3, 3 and 7.' },
        },
        { t: 'p', text: 'That is all "flip the symbol" means: a negative mirrors the numbers, so the order reverses. Adding or subtracting just slides both numbers the same way, so the order stays.' },
      ],
    },
    {
      approach: 'analogy',
      title: 'Money you have vs money you owe',
      blocks: [
        { t: 'p', text: 'Having \\$2 is less than having \\$5: $2 < 5$.' },
        { t: 'p', text: 'Now think about **owing** money. Owing \\$5 ($-5$) is worse than owing \\$2 ($-2$). So $-5 < -2$, or $-2 > -5$.' },
        { t: 'p', text: 'Turning "have" into "owe" is multiplying by $-1$, and it flips which amount is better. That is why the inequality symbol flips too.' },
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
            '**Solve like an equation.** Undo adding or subtracting first. $-2x + 3 > 11$ becomes $-2x > 8$.',
            '**Watch the last step.** Dividing or multiplying by a negative? Flip the symbol. $-2x > 8$ becomes $x < -4$.',
            '**Check a number.** Try $x = -5$: $-2(-5) + 3 = 13$, and $13 > 11$ is true.',
            '**Graph it.** $<$ means an open circle at $-4$, shaded left.',
          ],
        },
        { t: 'callout', variant: 'tip', text: 'Ask "Did I multiply or divide by a negative?" at the very end of every problem. Only that move flips the symbol.' },
      ],
    },
    {
      approach: 'prerequisite',
      title: 'Refresher: solving equations and integers',
      blocks: [
        { t: 'list', items: ['Undo in reverse order: first undo $+$ or $-$, then undo $\\times$ or $\\div$.', '$12 \\div (-3) = -4$ and $-18 \\div (-6) = 3$: same signs give a positive, different signs give a negative.', 'On a number line, a number to the right is bigger: $-1 > -4$.', 'Solve $2x - 7 = 9$: add $7$ to get $2x = 16$, then divide by $2$ to get $x = 8$.'] },
        { t: 'p', text: 'Solving $2x - 7 > 9$ uses exactly the same steps and gives $x > 8$. Dividing by $2$, a positive number, keeps the symbol.' },
      ],
    },
    {
      approach: 'simpler-example',
      title: 'Start with numbers you can list',
      blocks: [
        { t: 'p', text: 'Which whole numbers make $x + 2 < 6$ true? Try them: $0 + 2 = 2$, $1 + 2 = 3$, $2 + 2 = 4$, $3 + 2 = 5$ all work. $4 + 2 = 6$ does not, because $6$ is not less than $6$.' },
        { t: 'p', text: 'Decimals like $3.9$ and negative numbers like $-2$ work too, so the full answer is $x < 4$: every number to the left of $4$, with an open circle at $4$.' },
        {
          t: 'numberline',
          caption: 'x < 4',
          spec: { min: -1, max: 8, rays: [{ from: 4, closed: false, dir: 'left' }], ariaLabel: 'Number line from -1 to 8 with an open circle at 4 and shading to the left.' },
        },
        { t: 'p', text: 'For "at most 4" you would include $4$ itself: $x \\le 4$, with a closed circle.' },
      ],
    },
    {
      approach: 'alternate-strategy',
      title: 'Keep the x-term positive',
      blocks: [
        { t: 'p', text: 'You can avoid dividing by a negative altogether. Move the $x$-term to the side where it will be positive.' },
        { t: 'math', tex: '-3x \\le 12 \\;\\Rightarrow\\; 0 \\le 12 + 3x \\;\\Rightarrow\\; -12 \\le 3x \\;\\Rightarrow\\; -4 \\le x' },
        { t: 'p', text: 'We added $3x$, subtracted $12$, then divided by $3$, a positive number, so the symbol never changed. Read $-4 \\le x$ from right to left: $x \\ge -4$. That matches the answer from flipping.' },
      ],
    },
  ],
  guided: [
    { generator: 'u2.solve-ineq', difficulty: 1 },
    { generator: 'u2.ineq-numberline', difficulty: 1 },
    { generator: 'u2.ineq-phrases', difficulty: 1 },
    { generator: 'u2.write-ineq-2var', difficulty: 1 },
  ],
  independent: {
    count: 8,
    reviewCount: 2,
    mix: [
      { generator: 'u2.solve-ineq', difficulty: 1, weight: 1 },
      { generator: 'u2.solve-ineq', difficulty: 2, weight: 2 },
      { generator: 'u2.solve-ineq', difficulty: 3, weight: 1 },
      { generator: 'u2.ineq-numberline', difficulty: 2, weight: 1 },
      { generator: 'u2.ineq-phrases', difficulty: 2, weight: 1 },
      { generator: 'u2.ineq-phrases', difficulty: 3, weight: 1 },
      { generator: 'u2.write-ineq-2var', difficulty: 2, weight: 1 },
    ],
  },
  quiz: {
    items: [
      { generator: 'u2.solve-ineq', difficulty: 2 },
      { generator: 'u2.solve-ineq', difficulty: 3 },
      { generator: 'u2.ineq-numberline', difficulty: 3 },
      { generator: 'u2.ineq-phrases', difficulty: 2 },
      { generator: 'u2.write-ineq-2var', difficulty: 2 },
      { generator: 'u2.write-ineq-2var', difficulty: 3 },
    ],
  },
  summary: [
    'Solve an inequality like an equation, but **flip the symbol when you multiply or divide by a negative** (because $2 < 5$ but $-2 > -5$).',
    'On a number line, use an open circle for $<$ or $>$ and a closed circle for $\\le$ or $\\ge$, then shade toward the numbers that work.',
    '"At least" and "no less than" mean $\\ge$; "at most" and "no more than" mean $\\le$; "more than" and "exceeds" mean $>$; "fewer than" means $<$.',
    'A two-variable inequality like $3x + 5y \\le 60$ has pairs $(x, y)$ as solutions. Check a pair by substituting both values.',
  ],
  mastery: { quizPassScore: 0.8, practiceMinCorrect: 5 },
};
