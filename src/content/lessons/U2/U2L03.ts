import type { LessonContent } from '../../../core/curriculum/types';

/**
 * U2L03 Constraints: Possible or Not Possible? (A.PAR.4.2, A.MM.1.1)
 * Testing points in two-variable inequalities (solid vs dashed boundaries, reading a graph)
 * and interpreting solutions in context, including whole-number and non-negative limits (S2.04).
 *
 * Math verified by hand (2026-10-05): every substitution, table, worked example and graph point below was recomputed independently.
 */
export const U2L03: LessonContent = {
  lessonId: 'U2L03',
  goal: 'Decide whether a point is a solution of a two-variable inequality, by substituting or by reading a graph, and decide whether a solution is actually possible in a real situation.',
  needToKnow: [
    { t: 'p', text: 'This lesson builds on three things you already know:' },
    {
      t: 'list',
      items: [
        '**Substitute and simplify.** If $x = -2$, then $3x + 4 = 3(-2) + 4 = -6 + 4 = -2$. Multiply before you add.',
        '**Read an inequality symbol.** $<$ is "less than," $\\le$ is "less than or equal to," $>$ is "greater than," and $\\ge$ is "greater than or equal to."',
        '**Boundary lines.** When you graph $y \\le 2x + 1$ or $y \\ge 2x + 1$, the boundary is solid. When you graph $y < 2x + 1$ or $y > 2x + 1$, the boundary is dashed.',
      ],
    },
    { t: 'callout', variant: 'tip', title: 'Quick check', text: 'Is $5 \\le 5$ true? Is $5 < 5$ true? (The first is true, because $5$ equals $5$. The second is false, because $5$ is not less than itself.) If that felt shaky, open **Teach Me Again** and choose the refresher.' },
  ],
  vocabulary: [
    { term: 'solution of an inequality', meaning: 'An ordered pair $(x, y)$ that makes the inequality true when you substitute it.' },
    { term: 'boundary line', meaning: 'The line where the two sides of the inequality are equal. It separates solutions from non-solutions.' },
    { term: 'solid boundary', meaning: 'Used for $\\le$ or $\\ge$. Points on the line **are** solutions.' },
    { term: 'dashed boundary', meaning: 'Used for $<$ or $>$. Points on the line are **not** solutions.' },
    { term: 'constraint', meaning: 'A limit in a real situation, like a budget or a goal, written as an inequality.' },
    { term: 'possible (viable)', meaning: 'A combination that makes the constraint true **and** makes sense in the situation.' },
  ],
  instruction: [
    { t: 'p', text: '### What is a solution?' },
    { t: 'p', text: 'An inequality in two variables, like $y < 2x + 1$, has infinitely many solutions. A **solution** is an ordered pair $(x, y)$ that makes the inequality **true**. To test a point, substitute its $x$-value and its $y$-value, simplify, and decide whether the statement is true.' },
    { t: 'math', tex: '(3, 4):\\quad 4 < 2(3) + 1 \\;\\Rightarrow\\; 4 < 7 \\quad \\text{true, so } (3, 4) \\text{ is a solution}' },
    { t: 'math', tex: '(0, 5):\\quad 5 < 2(0) + 1 \\;\\Rightarrow\\; 5 < 1 \\quad \\text{false, so } (0, 5) \\text{ is not a solution}' },
    { t: 'callout', variant: 'warning', title: 'Keep x and y in order', text: 'In $(1, 4)$, $x = 1$ and $y = 4$. For $y < 2x + 1$ that gives $4 < 3$, which is false. If you mix them up and use $x = 4$, $y = 1$, you get $1 < 9$, which is true, and you would get the wrong answer.' },
    { t: 'p', text: '### Points on the boundary' },
    { t: 'p', text: 'The **boundary line** is where the two sides are equal. For $y \\le 2x + 1$ and for $y < 2x + 1$, the boundary is $y = 2x + 1$. The point $(1, 3)$ is on that line, because $2(1) + 1 = 3$. Watch what happens when we test it:' },
    {
      t: 'table',
      caption: 'The same point on the boundary, tested in two inequalities.',
      headers: ['Inequality', 'Test (1, 3)', 'Boundary', 'Is (1, 3) a solution?'],
      rows: [
        ['$y \\le 2x + 1$', '$3 \\le 3$ (true)', 'solid', 'yes'],
        ['$y < 2x + 1$', '$3 < 3$ (false)', 'dashed', 'no'],
      ],
    },
    { t: 'callout', variant: 'why', title: 'Why does the line style matter?', text: 'A point on the boundary makes the two sides **equal**. "Or equal to" ($\\le$, $\\ge$) allows that, so the line is solid and its points count. Strict symbols ($<$, $>$) do not allow equality, so the line is dashed and its points do not count.' },
    { t: 'p', text: '### Reading solutions from a graph' },
    { t: 'p', text: 'On the graph of an inequality, **every point in the shaded region is a solution** and every point in the unshaded region is not. A point exactly on the boundary is a solution only when the boundary is solid.' },
    {
      t: 'graph',
      caption: 'The graph of y ≥ -x + 2: a solid boundary with the region above it shaded.',
      spec: { xMin: -5, xMax: 5, yMin: -5, yMax: 5, inequalities: [{ boundary: '-x + 2', side: 'above', strict: false }], points: [{ x: 3, y: 2, label: 'A (3, 2)' }, { x: 0, y: 0, label: 'B (0, 0)' }, { x: 1, y: 1, label: 'C (1, 1)' }], ariaLabel: 'A solid line falling from left to right through (0, 2) and (2, 0), shaded above. Point A (3, 2) is in the shaded region, point B (0, 0) is in the unshaded region, and point C (1, 1) is on the solid line.' },
    },
    {
      t: 'list',
      items: [
        '**A $(3, 2)$** is in the shaded region. Check: $2 \\ge -3 + 2$, so $2 \\ge -1$, which is true. A solution.',
        '**B $(0, 0)$** is in the unshaded region. Check: $0 \\ge -(0) + 2$, so $0 \\ge 2$, which is false. Not a solution.',
        '**C $(1, 1)$** is on the solid boundary. Check: $1 \\ge -1 + 2$, so $1 \\ge 1$, which is true. A solution.',
      ],
    },
    { t: 'callout', variant: 'tip', title: 'Graph and algebra should agree', text: 'Reading a graph is quick, but a point near the line is easy to misjudge. When in doubt, substitute. If the graph and your substitution disagree, recheck both.' },
    { t: 'p', text: '### Constraints: possible or not possible?' },
    { t: 'p', text: 'In a real situation, an inequality is called a **constraint**: a limit such as a budget, a time limit or a goal. A combination is **possible** when it makes the inequality true **and** makes sense in the situation.' },
    { t: 'p', text: 'Movie night: tickets cost \\$8 each and snacks cost \\$5 each, and you have \\$40 to spend. If $x$ is the number of tickets and $y$ is the number of snacks, the constraint is $8x + 5y \\le 40$.' },
    {
      t: 'table',
      caption: 'Testing combinations against the constraint 8x + 5y ≤ 40.',
      headers: ['Combination (x, y)', 'Total cost', 'Inequality true?', 'Makes sense?', 'Possible?'],
      rows: [
        ['$(2, 4)$', '$8(2) + 5(4) = 36$', '$36 \\le 40$: yes', 'yes', 'possible'],
        ['$(5, 0)$', '$8(5) + 5(0) = 40$', '$40 \\le 40$: yes', 'yes', 'possible (spends exactly \\$40)'],
        ['$(3, 4)$', '$8(3) + 5(4) = 44$', '$44 \\le 40$: no', 'not needed', 'not possible (over budget)'],
        ['$(2.5, 2)$', '$8(2.5) + 5(2) = 30$', '$30 \\le 40$: yes', 'no: half a ticket', 'not possible'],
        ['$(-1, 5)$', '$8(-1) + 5(5) = 17$', '$17 \\le 40$: yes', 'no: negative tickets', 'not possible'],
      ],
    },
    {
      t: 'graph',
      caption: 'Movie night budget: the shaded region shows 8x + 5y ≤ 40. Only whole-number points in the region or on the solid edge are possible.',
      spec: { xMin: 0, xMax: 6, yMin: 0, yMax: 9, xLabel: 'tickets', yLabel: 'snacks', inequalities: [{ boundary: '-1.6x + 8', side: 'below', strict: false }], points: [{ x: 2, y: 4, label: '(2, 4) possible' }, { x: 5, y: 0, label: '(5, 0) possible' }, { x: 3, y: 4, label: '(3, 4) over budget' }], ariaLabel: 'A solid line from (0, 8) down to (5, 0), shaded below, in the first quadrant. The point (2, 4) is inside the shaded region, (5, 0) is on the line, and (3, 4) is above the line, outside the region.' },
    },
    { t: 'callout', variant: 'realworld', title: 'Whole numbers and no negatives', text: 'Counts of things, like tickets, shirts or songs, must be **whole numbers** and can never be **negative**. Some amounts, like hours or miles, can be decimals, but they still cannot be negative. So a point can make the inequality true and still be **not possible**, like $2.5$ tickets or $-3$ shirts.' },
  ],
  examples: [
    {
      title: 'Test one point',
      kind: 'introductory',
      problem: [{ t: 'p', text: 'Is $(2, -1)$ a solution of $y > -3x + 4$?' }],
      steps: [
        { text: 'Substitute $x = 2$ and $y = -1$.', tex: '-1 > -3(2) + 4', why: 'In the ordered pair $(2, -1)$, the first number is $x$ and the second is $y$.' },
        { text: 'Simplify the right side.', tex: '-1 > -6 + 4 \\;\\Rightarrow\\; -1 > -2', why: 'Multiply first: $-3 \\cdot 2 = -6$. Then add: $-6 + 4 = -2$.' },
        { text: 'Decide whether the statement is true.', why: 'On a number line, $-1$ is to the right of $-2$, so $-1$ is greater. The statement is true.' },
      ],
      answer: 'Yes, $(2, -1)$ is a solution, because $-1 > -2$ is true.',
    },
    {
      title: 'Testing points in standard form',
      kind: 'intermediate',
      problem: [{ t: 'p', text: 'Which of the points $(1, 2)$, $(4, 0)$ and $(0, -2)$ are solutions of $2x - 3y \\ge 6$?' }],
      steps: [
        { text: 'Test $(1, 2)$.', tex: '2(1) - 3(2) = 2 - 6 = -4; \\quad -4 \\ge 6 \\text{ is false}', why: 'Substitute both coordinates into the left side, then compare with $6$.' },
        { text: 'Test $(4, 0)$.', tex: '2(4) - 3(0) = 8 - 0 = 8; \\quad 8 \\ge 6 \\text{ is true}', why: '$8$ is greater than $6$.' },
        { text: 'Test $(0, -2)$.', tex: '2(0) - 3(-2) = 0 + 6 = 6; \\quad 6 \\ge 6 \\text{ is true}', why: 'A negative times a negative is positive: $-3 \\cdot (-2) = 6$. Since $6$ equals $6$, the point is on the boundary, and $\\ge$ includes the boundary.' },
      ],
      answer: '$(4, 0)$ and $(0, -2)$ are solutions; $(1, 2)$ is not.',
    },
    {
      title: 'Reading a graph with a dashed boundary',
      kind: 'intermediate',
      problem: [
        { t: 'p', text: 'The graph shows $y < \\frac{1}{2}x + 1$. Decide whether each point is a solution: $P(4, 1)$, $Q(2, 2)$ and $R(-2, -3)$.' },
        { t: 'graph', spec: { xMin: -5, xMax: 5, yMin: -5, yMax: 5, inequalities: [{ boundary: '0.5x + 1', side: 'below', strict: true }], points: [{ x: 4, y: 1, label: 'P' }, { x: 2, y: 2, label: 'Q' }, { x: -2, y: -3, label: 'R' }], ariaLabel: 'A dashed line rising gently through (0, 1) and (2, 2), shaded below. P (4, 1) is in the shaded region, Q (2, 2) is on the dashed line, and R (-2, -3) is in the shaded region.' } },
      ],
      steps: [
        { text: '$P(4, 1)$ is in the shaded region. Check it.', tex: '1 < \\tfrac{1}{2}(4) + 1 \\;\\Rightarrow\\; 1 < 3 \\quad \\text{true}', why: 'Points in the shaded region are solutions; the substitution confirms it.' },
        { text: '$Q(2, 2)$ sits on the dashed line. Check it.', tex: '2 < \\tfrac{1}{2}(2) + 1 \\;\\Rightarrow\\; 2 < 2 \\quad \\text{false}', why: 'A point on the boundary makes both sides equal, and $<$ does not allow equal. That is exactly why the line is dashed.' },
        { text: '$R(-2, -3)$ is in the shaded region. Check it.', tex: '-3 < \\tfrac{1}{2}(-2) + 1 \\;\\Rightarrow\\; -3 < 0 \\quad \\text{true}', why: '$\\frac{1}{2}(-2) = -1$, and $-1 + 1 = 0$.' },
      ],
      answer: '$P$ and $R$ are solutions. $Q$ is not, because it lies on the dashed boundary.',
    },
    {
      title: 'A common mistake: true is not always possible',
      kind: 'common-mistake',
      problem: [{ t: 'p', text: 'A school club sells candles for \\$6 and mugs for \\$9 and wants to raise at least \\$90, so $6x + 9y \\ge 90$, where $x$ is candles and $y$ is mugs. A student says selling $-3$ candles and $13$ mugs is possible "because $6(-3) + 9(13) = 99$, and $99 \\ge 90$." What went wrong? Give a combination that really is possible.' }],
      steps: [
        { text: 'Check the student arithmetic.', tex: '6(-3) + 9(13) = -18 + 117 = 99 \\ge 90', why: 'The math is correct: the point does make the inequality true.' },
        { text: 'Spot the error.', why: 'The club cannot sell a negative number of candles. A combination must make the inequality true **and** make sense, so $(-3, 13)$ is **not possible**.' },
        { text: 'Try a combination with whole, non-negative numbers, like $6$ candles and $6$ mugs.', tex: '6(6) + 9(6) = 36 + 54 = 90 \\ge 90', why: 'Both numbers are whole and not negative, and $90 \\ge 90$ is true because $\\ge$ allows equal. The club reaches its goal exactly.' },
      ],
      answer: '$(-3, 13)$ satisfies the inequality but is not possible, because you cannot sell $-3$ candles. A possible combination is $(6, 6)$, which raises exactly \\$90.',
    },
    {
      title: 'Concert tickets',
      kind: 'real-world',
      problem: [{ t: 'p', text: 'A group of friends has at most \\$300 for concert tickets. Floor tickets cost \\$45 and balcony tickets cost \\$30, so $45x + 30y \\le 300$, where $x$ is floor tickets and $y$ is balcony tickets. Is buying 2 floor and 6 balcony tickets possible? What about 4 floor and 5 balcony tickets?' }],
      steps: [
        { text: 'Test $(2, 6)$.', tex: '45(2) + 30(6) = 90 + 180 = 270; \\quad 270 \\le 300 \\text{ is true}', why: 'The total cost must be at most \\$300. The numbers are whole and not negative, so the combination makes sense.' },
        { text: 'Test $(4, 5)$.', tex: '45(4) + 30(5) = 180 + 150 = 330; \\quad 330 \\le 300 \\text{ is false}', why: '\\$330 is more than the \\$300 they have.' },
        { text: 'Interpret each result.', why: 'The first combination costs \\$270 and leaves \\$30 unspent. The second goes \\$30 over budget.' },
      ],
      answer: '2 floor and 6 balcony tickets is possible (\\$270). 4 floor and 5 balcony tickets is not possible (\\$330 is over budget).',
    },
    {
      title: 'The most you can buy',
      kind: 'challenging',
      problem: [{ t: 'p', text: 'Jada has a \\$50 gift card for a game store. Character skins cost \\$7 each and coin packs cost \\$4 each, so $7x + 4y \\le 50$, where $x$ is skins and $y$ is coin packs. If she buys 3 skins, what is the greatest number of coin packs she can buy?' }],
      steps: [
        { text: 'Substitute $x = 3$.', tex: '7(3) + 4y \\le 50 \\;\\Rightarrow\\; 21 + 4y \\le 50', why: 'The number of skins is fixed, so only $y$ is unknown.' },
        { text: 'Solve for $y$.', tex: '4y \\le 29 \\;\\Rightarrow\\; y \\le 7.25', why: 'Subtract $21$ from both sides, then divide by $4$. Dividing by a positive number keeps the symbol the same.' },
        { text: 'Choose the greatest whole number.', tex: 'y = 7', why: 'She cannot buy $0.25$ of a coin pack, so round **down** to the greatest whole number that is still at most $7.25$. Rounding up to $8$ would break the budget.' },
        { text: 'Check $7$ and $8$.', tex: '21 + 4(7) = 49 \\le 50 \\checkmark \\qquad 21 + 4(8) = 53 > 50', why: '$7$ coin packs fit the budget, and $8$ do not.' },
      ],
      answer: 'The greatest number is $7$ coin packs (total \\$49).',
    },
  ],
  teachMeAgain: [
    {
      approach: 'visual',
      title: 'Inside, outside, or on the fence',
      blocks: [
        { t: 'p', text: 'Think of the shaded region as a yard and the boundary line as its fence.' },
        {
          t: 'graph',
          spec: { xMin: -5, xMax: 5, yMin: -5, yMax: 5, inequalities: [{ boundary: 'x - 1', side: 'above', strict: true }], points: [{ x: -2, y: 2, label: 'inside (-2, 2)' }, { x: 3, y: -2, label: 'outside (3, -2)' }, { x: 2, y: 1, label: 'on the fence (2, 1)' }], ariaLabel: 'A dashed line rising through (0, -1) and (2, 1), shaded above. The point (-2, 2) is in the shaded region, (3, -2) is below the line, and (2, 1) is on the dashed line.' },
          caption: 'The graph of y > x - 1 with a dashed fence.',
        },
        {
          t: 'list',
          items: [
            '**Inside the yard** (shaded): a solution. $(-2, 2)$: $2 > -3$ is true.',
            '**Outside the yard** (unshaded): not a solution. $(3, -2)$: $-2 > 2$ is false.',
            '**On the fence**: a solution only if the fence is solid. This fence is dashed, so $(2, 1)$ is not a solution: $1 > 1$ is false.',
          ],
        },
      ],
    },
    {
      approach: 'analogy',
      title: 'The ride height rule',
      blocks: [
        { t: 'p', text: 'A roller coaster sign says "You must be **at least** 48 inches tall." A rider who is exactly 48 inches can ride. That is like $\\ge$ and a **solid** line: the boundary counts.' },
        { t: 'p', text: 'Another sign says "Riders must be **taller than** 48 inches." Now a rider who is exactly 48 inches cannot ride. That is like $>$ and a **dashed** line: the boundary does not count.' },
        { t: 'p', text: 'And even if a rule is met, the situation still has to make sense: nobody is $-5$ inches tall. In context, check the rule **and** check reality.' },
      ],
    },
    {
      approach: 'step-by-step',
      title: 'A 4-step checklist for any point',
      blocks: [
        {
          t: 'list',
          ordered: true,
          items: [
            '**Label the point.** For $(4, 7)$, write $x = 4$ and $y = 7$.',
            '**Substitute with parentheses.** For $y \\ge 2x - 3$: $7 \\ge 2(4) - 3$.',
            '**Simplify and decide.** $7 \\ge 5$ is true, so $(4, 7)$ is a solution.',
            '**In context, ask two more questions.** Does the situation need whole numbers? Can the values be negative? If the point breaks either rule, it is not possible.',
          ],
        },
        { t: 'callout', variant: 'tip', text: 'If you get "equal" in step 3, look at the symbol: $\\le$ or $\\ge$ means yes, $<$ or $>$ means no.' },
      ],
    },
    {
      approach: 'prerequisite',
      title: 'Refresher: true or false comparisons',
      blocks: [
        {
          t: 'list',
          items: [
            'On a number line, a number is **greater** than every number to its left: $-1 > -4$ is true, and $-4 > -1$ is false.',
            '$6 \\le 6$ is true ("less than **or equal to**"), but $6 < 6$ is false.',
            'Substitute negatives in parentheses: if $x = -2$, then $-3x + 1 = -3(-2) + 1 = 6 + 1 = 7$.',
          ],
        },
        { t: 'p', text: 'Try it: is $(-2, 5)$ a solution of $y < -3x + 1$? Substitute: $5 < 7$, which is true, so yes.' },
      ],
    },
    {
      approach: 'simpler-example',
      title: 'Start with y > x',
      blocks: [
        { t: 'p', text: 'The inequality $y > x$ just says "the second number is bigger than the first."' },
        { t: 'list', items: ['$(1, 5)$: is $5 > 1$? Yes, a solution.', '$(5, 1)$: is $1 > 5$? No.', '$(3, 3)$: is $3 > 3$? No. It is on the boundary $y = x$, and $>$ leaves the boundary out.'] },
        { t: 'p', text: 'Now add a little: $y > x + 2$. For $(1, 5)$: is $5 > 1 + 2 = 3$? Yes. Every inequality works the same way: substitute, simplify, decide.' },
      ],
    },
    {
      approach: 'alternate-strategy',
      title: 'Compare with the boundary height',
      blocks: [
        { t: 'p', text: 'Instead of substituting both numbers at once, find how high the boundary is at the point\'s $x$-value, then compare.' },
        { t: 'p', text: 'Is $(4, 7)$ a solution of $y \\ge 2x - 3$? At $x = 4$, the boundary is at $y = 2(4) - 3 = 5$.' },
        { t: 'list', items: ['The point\'s $y$ is $7$, which is **above** the boundary height $5$.', 'The inequality is $y \\ge \\ldots$, so the solutions are **on or above** the line.', 'So $(4, 7)$ is a solution.'] },
        { t: 'callout', variant: 'tip', text: 'This works when the inequality starts with $y$ by itself. If it is in standard form, like $2x - 3y \\ge 6$, just substitute both values directly.' },
      ],
    },
  ],
  guided: [
    { generator: 'u2.is-solution', difficulty: 1 },
    { generator: 'u2.constraint-context', difficulty: 1 },
    { generator: 'u2.is-solution', difficulty: 1 },
    { generator: 'u2.constraint-context', difficulty: 1 },
  ],
  independent: {
    count: 8,
    reviewCount: 2,
    mix: [
      { generator: 'u2.is-solution', difficulty: 1, weight: 1 },
      { generator: 'u2.is-solution', difficulty: 2, weight: 2 },
      { generator: 'u2.is-solution', difficulty: 3, weight: 1 },
      { generator: 'u2.constraint-context', difficulty: 1, weight: 1 },
      { generator: 'u2.constraint-context', difficulty: 2, weight: 2 },
      { generator: 'u2.constraint-context', difficulty: 3, weight: 1 },
      { generator: 'u2.ineq-from-graph', difficulty: 2, weight: 1 },
      { generator: 'u2.graph-ineq-features', difficulty: 2, weight: 1 },
    ],
  },
  quiz: {
    items: [
      { generator: 'u2.is-solution', difficulty: 2 },
      { generator: 'u2.is-solution', difficulty: 2 },
      { generator: 'u2.is-solution', difficulty: 3 },
      { generator: 'u2.constraint-context', difficulty: 2 },
      { generator: 'u2.constraint-context', difficulty: 2 },
      { generator: 'u2.constraint-context', difficulty: 3 },
    ],
  },
  summary: [
    'A **solution** of a two-variable inequality is an ordered pair that makes it true. To test a point, substitute $x$ and $y$ and decide whether the statement is true.',
    'A point on a **solid** boundary ($\\le$, $\\ge$) is a solution. A point on a **dashed** boundary ($<$, $>$) is not.',
    'On a graph, points in the shaded region are solutions and points in the unshaded region are not.',
    'In context, a combination is **possible** only if it makes the constraint true **and** makes sense: counts of things must be whole numbers, and real amounts cannot be negative.',
  ],
  mastery: { quizPassScore: 0.8, practiceMinCorrect: 5 },
};
