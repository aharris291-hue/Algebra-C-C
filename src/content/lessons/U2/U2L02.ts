import type { LessonContent } from '../../../core/curriculum/types';

/**
 * U2L02 Graphing Linear Inequalities (A.PAR.4.1)
 * Boundary lines (solid or dashed), shading above or below, test points, standard form,
 * horizontal and vertical boundaries, and writing the inequality shown by a graph (S2.03).
 *
 * Math verified by hand (2026-10-05): every worked example, graph point and test-point check below was recomputed independently.
 */
export const U2L02: LessonContent = {
  lessonId: 'U2L02',
  goal: 'Graph a linear inequality in two variables with the right boundary line (solid or dashed) and the right shading, check it with a test point, and write the inequality shown by a graph.',
  needToKnow: [
    { t: 'p', text: 'This lesson uses three things you already know:' },
    {
      t: 'list',
      items: [
        '**Graphing $y = mx + b$.** Plot the $y$-intercept $(0, b)$, then use the slope $m$ as rise over run to find more points.',
        '**Solving for $y$.** To rewrite $2x + y = 5$, subtract $2x$ from both sides: $y = -2x + 5$.',
        '**Flipping the symbol.** Multiplying or dividing an inequality by a negative number reverses it: $-y > 4$ becomes $y < -4$.',
      ],
    },
    { t: 'callout', variant: 'tip', title: 'Quick check', text: 'Is the point $(1, 4)$ on the line $y = 3x + 1$? (Yes: $3(1) + 1 = 4$.) If that felt shaky, open **Teach Me Again** and choose the refresher.' },
  ],
  vocabulary: [
    { term: 'linear inequality in two variables', meaning: 'An inequality like $y < 2x + 1$ or $3x + 2y \\ge 6$. Its solutions are points $(x, y)$.' },
    { term: 'boundary line', meaning: 'The line you get by replacing the inequality symbol with $=$. It separates the solutions from the non-solutions.' },
    { term: 'half-plane', meaning: 'All the points on one side of a line. The shaded half-plane holds the solutions.' },
    { term: 'solid line', meaning: 'Used for $\\le$ or $\\ge$: points on the line **are** solutions.' },
    { term: 'dashed line', meaning: 'Used for $<$ or $>$: points on the line are **not** solutions.' },
    { term: 'test point', meaning: 'A point not on the boundary that you substitute to decide which side to shade.' },
  ],
  instruction: [
    { t: 'p', text: '### From a line to a whole region' },
    { t: 'p', text: 'The solutions of $y = 2x + 1$ are the points **on** a line. The solutions of $y > 2x + 1$ are all the points whose $y$-value is **bigger** than the line at that $x$, so they fill the whole region above the line. Graphing an inequality takes three decisions.' },
    { t: 'p', text: '**1. Draw the boundary line.** Replace the symbol with $=$ and graph $y = mx + b$ as usual.' },
    { t: 'p', text: '**2. Solid or dashed?**' },
    {
      t: 'table',
      caption: 'The symbol decides the line and the side (when y is alone on the left).',
      headers: ['Inequality', 'Boundary line', 'Shade'],
      rows: [
        ['$y > mx + b$', 'dashed', 'above'],
        ['$y \\ge mx + b$', 'solid', 'above'],
        ['$y < mx + b$', 'dashed', 'below'],
        ['$y \\le mx + b$', 'solid', 'below'],
      ],
    },
    { t: 'p', text: '**3. Which side?** For $y >$ or $y \\ge$, the $y$-values are bigger than the line, so shade **above**. For $y <$ or $y \\le$, shade **below**.' },
    {
      t: 'graph',
      caption: 'y > 2x + 1: dashed boundary through (0, 1) and (1, 3), shaded above.',
      spec: { xMin: -5, xMax: 5, yMin: -5, yMax: 7, inequalities: [{ boundary: '2x + 1', side: 'above', strict: true }], points: [{ x: 0, y: 1, label: '(0, 1)' }, { x: 1, y: 3, label: '(1, 3)' }], ariaLabel: 'A dashed line through (0, 1) and (1, 3) with the region above it shaded.' },
    },
    { t: 'p', text: '### Check with a test point' },
    { t: 'p', text: 'Pick any point **not** on the line and substitute it. If it makes the inequality true, shade its side. If false, shade the other side. The origin $(0, 0)$ is usually easiest.' },
    { t: 'math', tex: 'y > 2x + 1: \\quad 0 > 2(0) + 1 \\;\\Rightarrow\\; 0 > 1 \\text{ is false}' },
    { t: 'p', text: 'So $(0, 0)$ is not a solution. The origin is below the line, so shade the other side: above. That matches the table.' },
    { t: 'callout', variant: 'warning', title: 'When the line goes through the origin', text: 'For $y \\le 3x$, the boundary passes through $(0, 0)$. Testing it gives $0 \\le 0$, which is true, but $(0, 0)$ is **on** the line, so it cannot tell you which side to shade. Use a point off the line, like $(1, 0)$: $0 \\le 3(1)$ is true, so shade the side containing $(1, 0)$, which is below the line.' },
    {
      t: 'graph',
      caption: 'y <= 3x: solid boundary through the origin. The test point (1, 0) is a solution, so its side (below) is shaded.',
      spec: { xMin: -4, xMax: 4, yMin: -6, yMax: 6, inequalities: [{ boundary: '3x', side: 'below', strict: false }], points: [{ x: 1, y: 0, label: 'test (1, 0)' }, { x: 1, y: 3, label: '(1, 3)' }], ariaLabel: 'A solid line through the origin and (1, 3) with the region below it shaded; the test point (1, 0) is in the shaded region.' },
    },
    { t: 'p', text: '### Inequalities in standard form' },
    { t: 'p', text: 'To graph $2x - 3y < 6$, solve for $y$ first. Watch the last step: dividing by $-3$ flips the symbol.' },
    { t: 'math', tex: '2x - 3y < 6 \\;\\Rightarrow\\; -3y < -2x + 6 \\;\\Rightarrow\\; y > \\tfrac{2}{3}x - 2' },
    { t: 'p', text: 'So the boundary is $y = \\frac{2}{3}x - 2$, dashed, shaded **above**. Test $(0, 0)$ in the original: $2(0) - 3(0) = 0 < 6$ is true, and the origin is above the line, so it agrees.' },
    {
      t: 'graph',
      caption: '2x - 3y < 6 is the same as y > (2/3)x - 2: dashed boundary, shaded above.',
      spec: { xMin: -6, xMax: 6, yMin: -6, yMax: 6, inequalities: [{ boundary: '(2/3)x - 2', side: 'above', strict: true }], points: [{ x: 0, y: -2, label: '(0, -2)' }, { x: 3, y: 0, label: '(3, 0)' }], ariaLabel: 'A dashed line through (0, -2) and (3, 0) with the region above it shaded.' },
    },
    { t: 'p', text: '### Horizontal and vertical boundaries' },
    { t: 'p', text: 'An inequality with only $y$, like $y \\le -1$, has a **horizontal** boundary $y = -1$. Shade below for $\\le$. An inequality with only $x$, like $x > 2$, has a **vertical** boundary $x = 2$. Shade to the **right** for $>$ (bigger $x$-values) and to the **left** for $<$.' },
    {
      t: 'graph',
      caption: 'x > 2: dashed vertical line at x = 2, shaded to the right.',
      spec: { xMin: -5, xMax: 5, yMin: -5, yMax: 5, verticalInequalities: [{ x: 2, side: 'right', strict: true }], ariaLabel: 'A dashed vertical line at x = 2 with the region to its right shaded.' },
    },
    {
      t: 'graph',
      caption: 'y <= -1: solid horizontal line at y = -1, shaded below.',
      spec: { xMin: -5, xMax: 5, yMin: -5, yMax: 5, inequalities: [{ boundary: '-1', side: 'below', strict: false }], ariaLabel: 'A solid horizontal line at y = -1 with the region below it shaded.' },
    },
    { t: 'p', text: '### Writing the inequality from a graph' },
    {
      t: 'list',
      ordered: true,
      items: [
        'Find the boundary line $y = mx + b$: read $b$ where it crosses the $y$-axis, and find $m$ from two points.',
        'Solid line? Use $\\le$ or $\\ge$. Dashed? Use $<$ or $>$.',
        'Shaded above? Use $>$ or $\\ge$. Shaded below? Use $<$ or $\\le$.',
        'Check a shaded point in your answer.',
      ],
    },
  ],
  examples: [
    {
      title: 'Read a graphed inequality',
      kind: 'introductory',
      problem: [
        { t: 'p', text: 'This is the graph of $y \\ge -x + 3$. Explain the boundary line, the type of line, and the shading, then check it with a test point.' },
        { t: 'graph', spec: { xMin: -5, xMax: 5, yMin: -5, yMax: 7, inequalities: [{ boundary: '-x + 3', side: 'above', strict: false }], points: [{ x: 0, y: 3, label: '(0, 3)' }, { x: 3, y: 0, label: '(3, 0)' }], ariaLabel: 'A solid line through (0, 3) and (3, 0) with the region above it shaded.' } },
      ],
      steps: [
        { text: 'Boundary: graph $y = -x + 3$.', tex: '(0,\\ 3),\\ (1,\\ 2),\\ (3,\\ 0)', why: 'Start at the $y$-intercept $3$, then use slope $-1$: down 1, right 1.' },
        { text: 'The line is solid.', why: 'The symbol $\\ge$ includes "equal to," so points on the line are solutions.' },
        { text: 'Shade above.', why: '$y \\ge$ means the $y$-values are at or above the line.' },
        { text: 'Test $(0, 0)$.', tex: '0 \\ge -(0) + 3 \\;\\Rightarrow\\; 0 \\ge 3 \\text{ is false}', why: 'The origin is not a solution and it is below the line, so the solutions are above. The shading is right.' },
      ],
      answer: 'Solid line through $(0, 3)$ and $(3, 0)$, shaded above.',
    },
    {
      title: 'Dashed line, shade below',
      kind: 'intermediate',
      problem: [{ t: 'p', text: 'Describe the graph of $y < \\frac{1}{2}x - 2$ and check it with a test point.' }],
      steps: [
        { text: 'Boundary: graph $y = \\frac{1}{2}x - 2$.', tex: '(0,\\ -2),\\ (2,\\ -1),\\ (4,\\ 0)', why: 'The $y$-intercept is $-2$. A slope of $\\frac{1}{2}$ means up 1, right 2.' },
        { text: 'Use a dashed line.', why: 'The symbol $<$ does not include "equal to," so points on the line are not solutions.' },
        { text: 'Shade below.', why: '$y <$ means the $y$-values are below the line.' },
        { text: 'Test $(0, 0)$.', tex: '0 < \\tfrac{1}{2}(0) - 2 \\;\\Rightarrow\\; 0 < -2 \\text{ is false}', why: 'The origin is above the line and is not a solution, so the solutions are below. It checks.' },
      ],
      answer: 'Dashed line through $(0, -2)$ and $(4, 0)$, shaded below.',
    },
    {
      title: 'A common mistake: not flipping in standard form',
      kind: 'common-mistake',
      problem: [
        { t: 'p', text: 'A student graphed $4x - 2y > 6$ by writing $y > 2x - 3$ and shading above, as shown. What went wrong, and what is the correct graph?' },
        { t: 'graph', caption: 'The student graph.', spec: { xMin: -5, xMax: 5, yMin: -6, yMax: 6, inequalities: [{ boundary: '2x - 3', side: 'above', strict: true }], points: [{ x: 0, y: -3, label: '(0, -3)' }, { x: 2, y: 1, label: '(2, 1)' }], ariaLabel: 'A dashed line through (0, -3) and (2, 1) with the region above it shaded.' } },
      ],
      steps: [
        { text: 'Test $(0, 0)$ in the original inequality.', tex: '4(0) - 2(0) = 0, \\quad 0 > 6 \\text{ is false}', why: 'The origin is not a solution, but it sits in the student shaded region. So the shading is wrong.' },
        { text: 'Subtract $4x$ from both sides.', tex: '-2y > -4x + 6', why: 'Get the $y$-term alone first. The symbol does not change when you subtract.' },
        { text: 'Divide by $-2$ and flip.', tex: 'y < 2x - 3', why: 'Dividing by a negative reverses the symbol. The student forgot this step.' },
        { text: 'Check a point below the line, like $(2, 0)$.', tex: '4(2) - 2(0) = 8, \\quad 8 > 6 \\checkmark', why: 'A point in the corrected region works in the original, so the corrected graph is right.' },
      ],
      answer: '$y < 2x - 3$: the same dashed line, but shaded **below**.',
    },
    {
      title: 'Arcade gift card',
      kind: 'real-world',
      problem: [
        { t: 'p', text: 'You have a \\$40 arcade gift card. Laser tag costs \\$10 per game and snacks cost \\$5 each. Let $x$ be the number of laser tag games and $y$ the number of snacks. Write and graph an inequality, then decide whether 2 games and 3 snacks fit the budget.' },
      ],
      steps: [
        { text: 'Write the inequality.', tex: '10x + 5y \\le 40', why: 'Total cost is price times number for each item. You can spend at most \\$40, so use $\\le$.' },
        { text: 'Solve for $y$.', tex: '5y \\le -10x + 40 \\;\\Rightarrow\\; y \\le -2x + 8', why: 'Subtract $10x$, then divide by $5$. Dividing by a positive number keeps the symbol.' },
        { text: 'Graph: solid line through $(0, 8)$ and $(4, 0)$, shaded below.', why: '$\\le$ gives a solid line (spending exactly \\$40 is allowed), and $y \\le$ means shade below. Test $(0, 0)$: $0 \\le 40$ is true, and the origin is below the line.' },
        { text: 'Check $(2, 3)$.', tex: '10(2) + 5(3) = 20 + 15 = 35 \\le 40 \\checkmark', why: 'The point is in the shaded region, so it fits the budget, with \\$5 left over.' },
      ],
      answer: '$10x + 5y \\le 40$, or $y \\le -2x + 8$. Yes, 2 games and 3 snacks cost \\$35.',
    },
    {
      title: 'Write the inequality from a graph',
      kind: 'challenging',
      problem: [
        { t: 'p', text: 'Write the inequality shown by the graph.' },
        { t: 'graph', spec: { xMin: -5, xMax: 5, yMin: -5, yMax: 5, inequalities: [{ boundary: '-2x + 1', side: 'above', strict: true }], points: [{ x: 0, y: 1, label: '(0, 1)' }, { x: 1, y: -1, label: '(1, -1)' }], ariaLabel: 'A dashed line through (0, 1) and (1, -1) with the region above it shaded.' } },
      ],
      steps: [
        { text: 'Read the $y$-intercept.', tex: 'b = 1', why: 'The line crosses the $y$-axis at $(0, 1)$.' },
        { text: 'Find the slope from two points.', tex: 'm = \\frac{-1 - 1}{1 - 0} = \\frac{-2}{1} = -2', why: 'Slope is the change in $y$ over the change in $x$.' },
        { text: 'Choose the symbol.', tex: 'y > -2x + 1', why: 'The line is dashed, so the symbol is strict ($<$ or $>$). The shading is above, so it is $>$.' },
        { text: 'Check a shaded point, like $(0, 3)$.', tex: '3 > -2(0) + 1 \\;\\Rightarrow\\; 3 > 1 \\checkmark', why: 'A point in the shaded region must make the inequality true.' },
      ],
      answer: '$y > -2x + 1$',
    },
    {
      title: 'A horizontal boundary',
      kind: 'intermediate',
      problem: [
        { t: 'p', text: 'Write the inequality shown by the graph.' },
        { t: 'graph', spec: { xMin: -5, xMax: 5, yMin: -5, yMax: 5, inequalities: [{ boundary: '-1', side: 'below', strict: false }], points: [{ x: 3, y: -1, label: '(3, -1)' }], ariaLabel: 'A solid horizontal line through (3, -1) at height -1 with the region below it shaded.' } },
      ],
      steps: [
        { text: 'Name the boundary line.', tex: 'y = -1', why: 'Every point on a horizontal line has the same $y$-value, here $-1$. Its slope is $0$, so there is no $x$-term.' },
        { text: 'Choose the symbol.', tex: 'y \\le -1', why: 'The line is solid, so use $\\le$ or $\\ge$. The shading is below, so it is $\\le$.' },
        { text: 'Check $(0, -3)$, which is shaded.', tex: '-3 \\le -1 \\checkmark', why: '$-3$ is to the left of $-1$ on a number line, so it is smaller. Notice $x$ can be anything.' },
      ],
      answer: '$y \\le -1$',
    },
  ],
  teachMeAgain: [
    {
      approach: 'visual',
      title: 'See which points are solutions',
      blocks: [
        { t: 'p', text: 'Here is $y \\le x + 1$ with three points checked.' },
        {
          t: 'graph',
          spec: { xMin: -5, xMax: 5, yMin: -5, yMax: 6, inequalities: [{ boundary: 'x + 1', side: 'below', strict: false }], points: [{ x: 0, y: 0, label: '(0, 0)' }, { x: 0, y: 3, label: '(0, 3)' }, { x: 2, y: 3, label: '(2, 3)' }], ariaLabel: 'A solid line through (0, 1) and (2, 3) with the region below it shaded. The point (0, 0) is in the shaded region, (0, 3) is above the line, and (2, 3) is on the line.' },
        },
        {
          t: 'list',
          items: [
            '$(0, 0)$: $0 \\le 0 + 1$ is true. It is in the shaded region.',
            '$(0, 3)$: $3 \\le 0 + 1$ is false. It is above the line, not shaded.',
            '$(2, 3)$: $3 \\le 2 + 1$ is true, since $3 \\le 3$. It is **on** the solid line, and solid means the line counts.',
          ],
        },
      ],
    },
    {
      approach: 'analogy',
      title: 'Lines on a tennis court',
      blocks: [
        { t: 'p', text: 'In tennis, a ball that lands **on** the painted line is in. That is a **solid** line: the boundary counts, like $\\le$ and $\\ge$.' },
        { t: 'p', text: 'Now imagine a rule where touching the line is out. That is a **dashed** line: the boundary does not count, like $<$ and $>$.' },
        { t: 'p', text: 'The shading is the part of the court that is in. $y >$ or $y \\ge$ means the in side is above the line; $y <$ or $y \\le$ means it is below.' },
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
            '**Get $y$ alone.** If you divide by a negative, flip the symbol. ($y \\ge 3x - 2$ is already done.)',
            '**Draw the boundary** $y = 3x - 2$: start at $(0, -2)$, then up 3, right 1 to $(1, 1)$.',
            '**Solid or dashed:** $\\ge$ includes equal, so solid.',
            '**Shade and test:** $y \\ge$ means above. Test $(0, 0)$: $0 \\ge -2$ is true, and the origin is above the line. It checks.',
          ],
        },
        { t: 'callout', variant: 'tip', text: 'If the line passes through $(0, 0)$, test a different point such as $(1, 0)$ or $(0, 1)$.' },
      ],
    },
    {
      approach: 'prerequisite',
      title: 'Refresher: graphing lines and flipping',
      blocks: [
        { t: 'list', items: ['In $y = mx + b$, plot $(0, b)$ first. For $y = -\\frac{2}{3}x + 4$, start at $(0, 4)$.', 'Slope is rise over run: $-\\frac{2}{3}$ means down 2, right 3, which lands on $(3, 2)$.', 'Solving $-y \\le 5$: divide by $-1$ and flip to get $y \\ge -5$.', 'Solving $6x + 3y > 9$: subtract $6x$ to get $3y > -6x + 9$, then divide by $3$ (no flip) to get $y > -2x + 3$.'] },
        { t: 'p', text: 'Once you can graph the line, the inequality only adds two choices: solid or dashed, and above or below.' },
      ],
    },
    {
      approach: 'alternate-strategy',
      title: 'Skip solving for y: use intercepts and a test point',
      blocks: [
        { t: 'p', text: 'For $3x + 2y \\le 6$ you can graph without solving for $y$.' },
        {
          t: 'list',
          ordered: true,
          items: [
            '**Intercepts of the boundary $3x + 2y = 6$:** $x = 0$ gives $y = 3$, so $(0, 3)$. $y = 0$ gives $x = 2$, so $(2, 0)$.',
            '**Line type:** $\\le$, so solid.',
            '**Test $(0, 0)$:** $3(0) + 2(0) = 0 \\le 6$ is true, so shade the side containing the origin.',
          ],
        },
        {
          t: 'graph',
          caption: '3x + 2y <= 6: solid line through (0, 3) and (2, 0), shaded on the origin side.',
          spec: { xMin: -4, xMax: 5, yMin: -4, yMax: 6, inequalities: [{ boundary: '-1.5x + 3', side: 'below', strict: false }], points: [{ x: 0, y: 3, label: '(0, 3)' }, { x: 2, y: 0, label: '(2, 0)' }], ariaLabel: 'A solid line through (0, 3) and (2, 0) with the region below it, containing the origin, shaded.' },
        },
        { t: 'p', text: 'The test point does the flipping for you: you never have to remember which way the symbol turns.' },
      ],
    },
    {
      approach: 'simpler-example',
      title: 'Start with flat and straight-up lines',
      blocks: [
        { t: 'p', text: '$y > 2$ means "every point whose $y$-value is more than 2." Draw a dashed horizontal line at $y = 2$ and shade above it.' },
        {
          t: 'graph',
          spec: { xMin: -5, xMax: 5, yMin: -5, yMax: 5, inequalities: [{ boundary: '2', side: 'above', strict: true }], ariaLabel: 'A dashed horizontal line at y = 2 with the region above it shaded.' },
        },
        { t: 'p', text: '$x \\le -1$ means "every point whose $x$-value is $-1$ or less." Draw a solid vertical line at $x = -1$ and shade to the left.' },
        {
          t: 'graph',
          spec: { xMin: -5, xMax: 5, yMin: -5, yMax: 5, verticalInequalities: [{ x: -1, side: 'left', strict: false }], ariaLabel: 'A solid vertical line at x = -1 with the region to its left shaded.' },
        },
        { t: 'p', text: 'A slanted line works the same way: the symbol still decides solid or dashed, and which side to shade.' },
      ],
    },
  ],
  guided: [
    { generator: 'u2.graph-ineq-features', difficulty: 1 },
    { generator: 'u2.ineq-from-graph', difficulty: 1 },
    { generator: 'u2.graph-ineq-features', difficulty: 1 },
    { generator: 'u2.ineq-from-graph', difficulty: 1 },
  ],
  independent: {
    count: 8,
    reviewCount: 2,
    mix: [
      { generator: 'u2.graph-ineq-features', difficulty: 1, weight: 1 },
      { generator: 'u2.graph-ineq-features', difficulty: 2, weight: 2 },
      { generator: 'u2.graph-ineq-features', difficulty: 3, weight: 1 },
      { generator: 'u2.ineq-from-graph', difficulty: 1, weight: 1 },
      { generator: 'u2.ineq-from-graph', difficulty: 2, weight: 2 },
      { generator: 'u2.ineq-from-graph', difficulty: 3, weight: 1 },
    ],
  },
  quiz: {
    items: [
      { generator: 'u2.graph-ineq-features', difficulty: 2 },
      { generator: 'u2.graph-ineq-features', difficulty: 3 },
      { generator: 'u2.ineq-from-graph', difficulty: 2 },
      { generator: 'u2.ineq-from-graph', difficulty: 2 },
      { generator: 'u2.ineq-from-graph', difficulty: 3 },
      { generator: 'u2.graph-ineq-features', difficulty: 2 },
    ],
  },
  summary: [
    'Graph the boundary by replacing the symbol with $=$. Use a solid line for $\\le$ or $\\ge$ and a dashed line for $<$ or $>$.',
    'With $y$ alone on the left, shade above for $y >$ or $y \\ge$ and below for $y <$ or $y \\le$. For $x > c$ shade right; for $x < c$ shade left.',
    'Check with a test point not on the line, usually $(0, 0)$. If the line goes through the origin, pick a different point like $(1, 0)$.',
    'In standard form, solve for $y$ first, and flip the symbol if you divide by a negative.',
  ],
  mastery: { quizPassScore: 0.8, practiceMinCorrect: 5 },
};
