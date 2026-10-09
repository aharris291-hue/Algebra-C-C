import type { LessonContent } from '../../../core/curriculum/types';

/**
 * U2L04 Systems of Linear Inequalities (A.PAR.4.3, A.MM.1.2)
 * Includes matching a system to its graph and finding the corner of a graphed region that gives the greatest profit.
 * Finding and testing points in the solution region of a system (S2.05) and modeling a
 * situation with a system of constraints, including the greatest whole-number amount (S2.06).
 *
 * Math verified by hand (2026-10-05): every substitution, intersection, table, worked example and graph point below was recomputed independently.
 */
export const U2L04: LessonContent = {
  lessonId: 'U2L04',
  goal: 'Graph a system of two linear inequalities, find the region where the shadings overlap, test whether a point is a solution of the whole system, and use a system to model a real situation.',
  needToKnow: [
    { t: 'p', text: 'This lesson puts together skills from the last two lessons:' },
    {
      t: 'list',
      items: [
        '**Graph one inequality.** For $y \\ge x - 1$, draw a **solid** line $y = x - 1$ and shade **above** it. For $y < x - 1$, the line is **dashed** and you shade **below**.',
        '**Test a point.** $(3, 1)$ is a solution of $y \\le 2x$ because $1 \\le 2(3) = 6$ is true.',
        '**Possible in context.** Counts of things must be whole numbers and cannot be negative.',
      ],
    },
    { t: 'callout', variant: 'tip', title: 'Quick check', text: 'Is $(0, 0)$ a solution of $y > 2x - 3$? (Yes: $0 > -3$ is true.) If that felt shaky, open **Teach Me Again** and choose the refresher.' },
  ],
  vocabulary: [
    { term: 'system of inequalities', meaning: 'Two or more inequalities that must all be true at the same time.' },
    { term: 'solution of a system', meaning: 'An ordered pair that makes **every** inequality in the system true.' },
    { term: 'solution region', meaning: 'The part of the graph where all the shadings overlap.' },
    { term: 'constraint', meaning: 'A limit in a situation, written as an inequality. A system models a situation with several constraints.' },
  ],
  instruction: [
    { t: 'p', text: '### What is a system of inequalities?' },
    { t: 'p', text: 'A **system of inequalities** is a group of inequalities that must all be true at once. A **solution** of the system is a point that makes **every** inequality true. Passing just one is not enough.' },
    { t: 'math', tex: '\\begin{cases} y \\ge x - 1 \\\\ y < -2x + 5 \\end{cases}' },
    { t: 'p', text: '### Graphing a system' },
    {
      t: 'list',
      ordered: true,
      items: [
        'Graph the first inequality: $y = x - 1$ is **solid** (because of $\\ge$), shaded **above**.',
        'Graph the second inequality on the same grid: $y = -2x + 5$ is **dashed** (because of $<$), shaded **below**.',
        'The **solution region** is where the two shadings overlap.',
        'Test a point from the overlap in **both** inequalities to check your work.',
      ],
    },
    {
      t: 'graph',
      caption: 'The system y ≥ x - 1 and y < -2x + 5. The darker overlap is the solution region.',
      spec: { xMin: -5, xMax: 5, yMin: -5, yMax: 5, inequalities: [{ boundary: 'x - 1', side: 'above', strict: false }, { boundary: '-2x + 5', side: 'below', strict: true }], points: [{ x: 0, y: 0, label: '(0, 0)' }, { x: 3, y: 3, label: '(3, 3)' }, { x: 0, y: -3, label: '(0, -3)' }, { x: 2, y: 1, label: '(2, 1)' }], ariaLabel: 'A solid rising line y = x - 1 shaded above and a dashed falling line y = -2x + 5 shaded below. The lines cross at (2, 1). The overlap is the region to the left of the crossing, above the solid line and below the dashed line. Points (0, 0), (3, 3), (0, -3) and (2, 1) are marked.' },
    },
    {
      t: 'table',
      caption: 'Testing points in both inequalities.',
      headers: ['Point', '$y \\ge x - 1$', '$y < -2x + 5$', 'Solution of the system?'],
      rows: [
        ['$(0, 0)$', '$0 \\ge -1$: true', '$0 < 5$: true', 'yes'],
        ['$(3, 3)$', '$3 \\ge 2$: true', '$3 < -1$: false', 'no'],
        ['$(0, -3)$', '$-3 \\ge -1$: false', '$-3 < 5$: true', 'no'],
        ['$(2, 1)$', '$1 \\ge 1$: true', '$1 < 1$: false', 'no'],
      ],
    },
    { t: 'p', text: '### Points on a boundary' },
    { t: 'p', text: 'The two boundary lines cross at $(2, 1)$, because $2 - 1 = 1$ and $-2(2) + 5 = 1$. That point is on the solid line, which is fine, but it is also on the **dashed** line, so it fails $y < -2x + 5$ and is **not** a solution.' },
    { t: 'callout', variant: 'warning', title: 'Dashed means left out', text: 'A point on a **solid** boundary can be a solution, as long as it also passes the other inequality. For example, $(1, 0)$ is on the solid line ($0 \\ge 0$) and passes $0 < -2(1) + 5 = 3$, so it is a solution. A point on a **dashed** boundary is **never** a solution of the system.' },
    { t: 'p', text: '### Modeling with a system' },
    { t: 'p', text: 'The art club sells bracelets for \\$5 and tote bags for \\$8. They have supplies for **at most 20 items**, and they want to earn **at least \\$120**. Let $x$ be the number of bracelets and $y$ the number of tote bags.' },
    { t: 'math', tex: '\\begin{cases} x + y \\le 20 & \\text{at most 20 items} \\\\ 5x + 8y \\ge 120 & \\text{at least \\$120} \\\\ x \\ge 0,\\ y \\ge 0 & \\text{no negative items} \\end{cases}' },
    { t: 'p', text: 'To graph, solve each boundary for $y$: $x + y = 20$ becomes $y = 20 - x$, and $5x + 8y = 120$ becomes $8y = 120 - 5x$, so $y = 15 - 0.625x$. Both lines are solid, because the symbols are $\\le$ and $\\ge$.' },
    {
      t: 'graph',
      caption: 'Art club fundraiser: the possible combinations are the whole-number points in the overlap, between the two lines and in the first quadrant.',
      spec: { xMin: -2, xMax: 22, yMin: -2, yMax: 22, xStep: 2, yStep: 2, xLabel: 'bracelets', yLabel: 'tote bags', inequalities: [{ boundary: '20 - x', side: 'below', strict: false }, { boundary: '15 - 0.625x', side: 'above', strict: false }, { boundary: '0', side: 'above', strict: false }], verticalInequalities: [{ x: 0, side: 'right', strict: false }], points: [{ x: 4, y: 14, label: '(4, 14) possible' }, { x: 10, y: 5, label: '(10, 5) not enough money' }], ariaLabel: 'Solid line y = 20 - x shaded below and solid line y = 15 - 0.625x shaded above, with x at least 0 and y at least 0. The overlap is a thin triangle with corners (0, 15), (0, 20) and about (13.3, 6.7). The point (4, 14) is inside the overlap; the point (10, 5) is below the money line.' },
    },
    {
      t: 'list',
      items: [
        '$(4, 14)$: $4 + 14 = 18 \\le 20$ and $5(4) + 8(14) = 20 + 112 = 132 \\ge 120$. Both true, so selling 4 bracelets and 14 tote bags is **possible**.',
        '$(10, 5)$: $10 + 5 = 15 \\le 20$ is true, but $5(10) + 8(5) = 50 + 40 = 90 \\ge 120$ is false. **Not possible**: not enough money.',
      ],
    },
    { t: 'p', text: '**Greatest whole number.** If the club sells 6 bracelets, how many tote bags can it sell? Substitute $x = 6$ into both constraints:' },
    { t: 'math', tex: '6 + y \\le 20 \\;\\Rightarrow\\; y \\le 14 \\qquad\\quad 30 + 8y \\ge 120 \\;\\Rightarrow\\; 8y \\ge 90 \\;\\Rightarrow\\; y \\ge 11.25' },
    { t: 'p', text: 'The number of tote bags must be a whole number from $12$ to $14$. The **greatest** is $14$ (check: $6 + 14 = 20 \\le 20$ and $30 + 112 = 142 \\ge 120$), and the **least** is $12$ (check: $6 + 12 = 18 \\le 20$ and $30 + 96 = 126 \\ge 120$).' },
    { t: 'callout', variant: 'realworld', title: 'Round with the constraint in mind', text: 'From $y \\ge 11.25$, the least whole number is $12$: rounding **down** to $11$ would earn only $30 + 88 = 118$ dollars, which misses the goal. Always check that a rounded answer still makes **every** constraint true.' },
    { t: 'p', text: '### Reading a system from its graph' },
    { t: 'p', text: 'When a graph models a situation, read its **labels** and **scale** first: the axes say what $x$ and $y$ count, and the grid step tells you what each square is worth. To check that a graph matches a constraint such as $2x + 3y \\le 12$ with $x \\ge 0$ and $y \\ge 0$, check three things: the boundary line crosses the axes at the right places (here $(6, 0)$ and $(0, 4)$), the line is solid or dashed to match the symbol, and the shading is on the side where a test point like $(0, 0)$ makes the inequality true. $x \\ge 0$ and $y \\ge 0$ keep only the first quadrant.' },
    { t: 'p', text: '### The best plan is at a corner' },
    { t: 'p', text: 'Mia makes bracelets and tote bags for a craft fair. She has room for **at most 12 items**. A bracelet takes 1 hour and a tote bag takes 2 hours, and she has **at most 18 hours**. She makes a profit of \\$4 per bracelet and \\$7 per tote bag. Which plan earns the most?' },
    { t: 'math', tex: '\\begin{cases} x + y \\le 12 & \\text{items} \\\\ x + 2y \\le 18 & \\text{hours} \\\\ x \\ge 0,\\ y \\ge 0 \\end{cases} \\qquad P = 4x + 7y' },
    {
      t: 'graph',
      caption: 'Mia\'s craft fair plan: the solution region has four corners.',
      spec: { xMin: -1, xMax: 17, yMin: -1, yMax: 13, xLabel: 'bracelets', yLabel: 'tote bags', functions: [{ expr: '12 - x', label: 'items', domain: [0, 12] }, { expr: '9 - 0.5x', label: 'hours', domain: [0, 17] }], inequalities: [{ boundary: '12 - x', side: 'below', strict: false }, { boundary: '9 - 0.5x', side: 'below', strict: false }, { boundary: '0', side: 'above', strict: false }], verticalInequalities: [{ x: 0, side: 'right', strict: false }], points: [{ x: 0, y: 0, label: '(0, 0)' }, { x: 12, y: 0, label: '(12, 0)' }, { x: 6, y: 6, label: '(6, 6)' }, { x: 0, y: 9, label: '(0, 9)' }], ariaLabel: 'Solid line x + y = 12 and solid line x + 2y = 18, both shaded below, in the first quadrant. The region has corners (0, 0), (12, 0), (6, 6) and (0, 9).' },
    },
    { t: 'p', text: 'The two lines cross where $x + y = 12$ and $x + 2y = 18$ are both true. Subtracting the first equation from the second gives $y = 6$, so $x = 6$. A profit like $4x + 7y$ changes steadily as you move across the region, so its greatest value is always at a **corner**. Check each one:' },
    {
      t: 'table',
      headers: ['Corner', 'Profit $4x + 7y$'],
      rows: [
        ['$(0, 0)$', '$0$'],
        ['$(12, 0)$', '$4(12) = 48$'],
        ['$(6, 6)$', '$4(6) + 7(6) = 24 + 42 = 66$'],
        ['$(0, 9)$', '$7(9) = 63$'],
      ],
    },
    { t: 'p', text: 'The best plan is **6 bracelets and 6 tote bags**, for a profit of \\$66. Notice that making only tote bags (the item with the bigger profit) earns less, because tote bags use up the hours twice as fast.' },
  ],
  examples: [
    {
      title: 'Test a point in a system',
      kind: 'introductory',
      problem: [{ t: 'p', text: 'Is $(1, 2)$ a solution of the system $y > x$ and $y \\le -x + 4$?' }],
      steps: [
        { text: 'Test the first inequality.', tex: '2 > 1 \\quad \\text{true}', why: 'Substitute $x = 1$ and $y = 2$ into $y > x$.' },
        { text: 'Test the second inequality.', tex: '2 \\le -(1) + 4 \\;\\Rightarrow\\; 2 \\le 3 \\quad \\text{true}', why: 'A solution of a system must pass **every** inequality, so the second one must be checked too.' },
        { text: 'Decide.', why: 'Both statements are true, so the point is in the overlap of the two shaded regions.' },
      ],
      answer: 'Yes, $(1, 2)$ is a solution of the system.',
    },
    {
      title: 'Graph a system and name a solution',
      kind: 'intermediate',
      problem: [
        { t: 'p', text: 'Graph the system $y \\le 2x + 1$ and $y > -x - 2$. Then name one point in the solution region and check it.' },
        { t: 'graph', spec: { xMin: -5, xMax: 5, yMin: -5, yMax: 5, inequalities: [{ boundary: '2x + 1', side: 'below', strict: false }, { boundary: '-x - 2', side: 'above', strict: true }], points: [{ x: -1, y: -1, label: '(-1, -1)' }, { x: 2, y: 0, label: '(2, 0)' }], ariaLabel: 'A solid line y = 2x + 1 shaded below and a dashed line y = -x - 2 shaded above. The lines cross at (-1, -1). The overlap is the wedge to the right of the crossing point. The point (2, 0) is inside the overlap.' } },
      ],
      steps: [
        { text: 'Graph $y = 2x + 1$ as a solid line and shade below it.', why: 'The symbol $\\le$ includes the boundary (solid) and "$y$ less than" means below.' },
        { text: 'Graph $y = -x - 2$ as a dashed line and shade above it.', why: 'The symbol $>$ leaves the boundary out (dashed) and "$y$ greater than" means above.' },
        { text: 'Find where the lines cross.', tex: '2x + 1 = -x - 2 \\;\\Rightarrow\\; 3x = -3 \\;\\Rightarrow\\; x = -1,\\ y = 2(-1) + 1 = -1', why: 'The overlap is the wedge that opens to the right of $(-1, -1)$, between the two lines. The crossing point itself is on the dashed line, so it is **not** a solution.' },
        { text: 'Pick a point in the overlap, such as $(2, 0)$, and test it in both.', tex: '0 \\le 2(2) + 1 = 5 \\quad\\text{and}\\quad 0 > -(2) - 2 = -4', why: 'Both statements are true, so the point really is in the solution region.' },
      ],
      answer: 'The solution region is the wedge to the right of $(-1, -1)$ between the lines. One solution is $(2, 0)$.',
    },
    {
      title: 'Which point is a solution?',
      kind: 'intermediate',
      problem: [
        { t: 'p', text: 'Which of $(0, 1)$, $(3, 2)$, $(4, 1)$ and $(1, -3)$ is a solution of the system $y \\ge -x + 1$ and $y < x - 1$?' },
        { t: 'graph', spec: { xMin: -5, xMax: 5, yMin: -5, yMax: 5, inequalities: [{ boundary: '-x + 1', side: 'above', strict: false }, { boundary: 'x - 1', side: 'below', strict: true }], points: [{ x: 0, y: 1, label: '(0, 1)' }, { x: 3, y: 2, label: '(3, 2)' }, { x: 4, y: 1, label: '(4, 1)' }, { x: 1, y: -3, label: '(1, -3)' }], ariaLabel: 'A solid falling line y = -x + 1 shaded above and a dashed rising line y = x - 1 shaded below. They cross at (1, 0), and the overlap is the wedge opening to the right. (0, 1) is on the solid line, (3, 2) is on the dashed line, (4, 1) is inside the overlap, and (1, -3) is below the solid line.' } },
      ],
      steps: [
        { text: 'Test $(0, 1)$.', tex: '1 \\ge 1 \\text{ (true)}, \\quad 1 < -1 \\text{ (false)}', why: 'It is on the solid boundary, which is allowed, but it fails the second inequality.' },
        { text: 'Test $(3, 2)$.', tex: '2 \\ge -2 \\text{ (true)}, \\quad 2 < 2 \\text{ (false)}', why: 'It lies on the **dashed** line $y = x - 1$, so it cannot be a solution.' },
        { text: 'Test $(4, 1)$.', tex: '1 \\ge -3 \\text{ (true)}, \\quad 1 < 3 \\text{ (true)}', why: 'It passes both, so it is in the overlap.' },
        { text: 'Test $(1, -3)$.', tex: '-3 \\ge 0 \\text{ (false)}', why: 'Once one inequality fails, the point is not a solution of the system.' },
      ],
      answer: 'Only $(4, 1)$ is a solution of the system.',
    },
    {
      title: 'A common mistake: checking only one inequality',
      kind: 'common-mistake',
      problem: [{ t: 'p', text: 'For the system $y > 2x - 3$ and $y \\le -x + 6$, a student tests $(-1, 8)$ in the first inequality, gets $8 > -5$, and says "it is a solution." What went wrong? Is $(-1, 8)$ a solution?' }],
      steps: [
        { text: 'Check the student work on the first inequality.', tex: '8 > 2(-1) - 3 = -5 \\quad \\text{true}', why: 'This part is right: the point is in the first shaded region.' },
        { text: 'Spot the error.', why: 'A solution of a **system** must make **every** inequality true. The student never checked the second one.' },
        { text: 'Test the second inequality.', tex: '8 \\le -(-1) + 6 \\;\\Rightarrow\\; 8 \\le 7 \\quad \\text{false}', why: '$-(-1) = 1$, and $1 + 6 = 7$. Since $8$ is greater than $7$, the point is above that boundary, outside the second region.' },
        { text: 'Compare with a point that works, like $(1, 2)$.', tex: '2 > -1 \\text{ (true)}, \\quad 2 \\le 5 \\text{ (true)}', why: 'This point passes both inequalities, so it is in the overlap.' },
      ],
      answer: '$(-1, 8)$ is **not** a solution, because it fails $y \\le -x + 6$. A point such as $(1, 2)$ is a solution.',
    },
    {
      title: 'Car wash fundraiser',
      kind: 'real-world',
      problem: [{ t: 'p', text: 'The soccer team runs a car wash. A basic wash costs \\$10 and a deluxe wash costs \\$15. They have time for at most 30 washes and want to raise at least \\$360. Write a system, then decide whether 12 basic and 15 deluxe washes is possible.' }],
      steps: [
        { text: 'Name the variables.', tex: 'x = \\text{basic washes}, \\quad y = \\text{deluxe washes}', why: 'Each variable stands for a count, so it must be a whole number that is not negative.' },
        { text: 'Write one inequality for each constraint.', tex: '\\begin{cases} x + y \\le 30 \\\\ 10x + 15y \\ge 360 \\\\ x \\ge 0,\\ y \\ge 0 \\end{cases}', why: '"At most 30 washes" limits the total count; "at least \\$360" limits the money. Each wash type earns its price times the number of washes.' },
        { text: 'Test $(12, 15)$ in the count constraint.', tex: '12 + 15 = 27 \\le 30 \\quad \\text{true}', why: '27 washes fits the time they have.' },
        { text: 'Test $(12, 15)$ in the money constraint.', tex: '10(12) + 15(15) = 120 + 225 = 345 \\ge 360 \\quad \\text{false}', why: '\\$345 is \\$15 short of the goal, so this combination fails one constraint.' },
      ],
      answer: 'System: $x + y \\le 30$, $10x + 15y \\ge 360$, $x \\ge 0$, $y \\ge 0$. 12 basic and 15 deluxe washes is **not possible**: it raises only \\$345.',
    },
    {
      title: 'Part-time job hours',
      kind: 'challenging',
      problem: [{ t: 'p', text: 'Sam can work at most 15 hours a week. Sam earns \\$11 an hour as a lifeguard ($x$ hours) and \\$15 an hour tutoring ($y$ hours), and needs at least \\$180 this week. Shifts are scheduled in whole hours. If Sam lifeguards 6 hours, what are the least and the greatest numbers of tutoring hours that meet both constraints?' }],
      steps: [
        { text: 'Write the system.', tex: '\\begin{cases} x + y \\le 15 \\\\ 11x + 15y \\ge 180 \\end{cases}', why: 'One constraint limits the hours, the other sets the money goal.' },
        { text: 'Substitute $x = 6$ into the hours constraint.', tex: '6 + y \\le 15 \\;\\Rightarrow\\; y \\le 9', why: 'Subtract $6$ from both sides.' },
        { text: 'Substitute $x = 6$ into the money constraint.', tex: '66 + 15y \\ge 180 \\;\\Rightarrow\\; 15y \\ge 114 \\;\\Rightarrow\\; y \\ge 7.6', why: '$11 \\cdot 6 = 66$ and $180 - 66 = 114$. Dividing by the positive number $15$ keeps the symbol the same.' },
        { text: 'Combine and use whole numbers.', tex: '7.6 \\le y \\le 9 \\;\\Rightarrow\\; y = 8 \\text{ or } 9', why: '$7$ is too small, so the least whole number is $8$; the greatest is $9$.' },
        { text: 'Check the ends.', tex: '(6, 8):\\ 14 \\le 15,\\ 66 + 120 = 186 \\ge 180 \\qquad (6, 9):\\ 15 \\le 15,\\ 66 + 135 = 201 \\ge 180', why: 'Both combinations pass both constraints. And $(6, 7)$ earns only $66 + 105 = 171$ dollars, which is too little.' },
      ],
      answer: 'Least: $8$ tutoring hours. Greatest: $9$ tutoring hours.',
    },
    {
      title: 'Which corner gives the greatest profit?',
      kind: 'real-world',
      problem: [{ t: 'p', text: 'Dev builds birdhouses and stools. He can bring at most 10 items, a birdhouse takes 2 hours and a stool takes 3 hours, and he has at most 24 hours. The profit is \\$9 per birdhouse and \\$12 per stool. Which plan gives the greatest profit?' }],
      steps: [
        { text: 'Write the constraints and the profit.', tex: 'x + y \\le 10,\\quad 2x + 3y \\le 24,\\quad x \\ge 0,\\ y \\ge 0, \\qquad P = 9x + 12y', why: 'One inequality per limit; counts cannot be negative. Profit is (profit per item) times (how many), added.' },
        { text: 'Find where the two boundary lines cross.', tex: 'y = 10 - x \\;\\Rightarrow\\; 2x + 3(10 - x) = 24 \\;\\Rightarrow\\; 30 - x = 24 \\;\\Rightarrow\\; x = 6,\\ y = 4', why: 'At the crossing point both limits are used up exactly.' },
        { text: 'List all the corners.', tex: '(0, 0),\\ (10, 0),\\ (6, 4),\\ (0, 8)', why: '$(10, 0)$ is where the items line meets the $x$-axis ($2 \\cdot 10 = 20 \\le 24$, so the hours are fine), and $(0, 8)$ is where the hours line meets the $y$-axis ($3 \\cdot 8 = 24$).' },
        { text: 'Evaluate the profit at each corner.', tex: 'P(0,0) = 0,\\quad P(10,0) = 90,\\quad P(6,4) = 54 + 48 = 102,\\quad P(0,8) = 96', why: 'The greatest value of a linear expression over the region is at a corner, so these four checks are enough.' },
      ],
      answer: '6 birdhouses and 4 stools, for a profit of \\$102.',
    },
  ],
  teachMeAgain: [
    {
      approach: 'visual',
      title: 'Two highlighters',
      blocks: [
        { t: 'p', text: 'Shade each inequality in its own color, like two highlighters on the same page. Where the colors overlap, you get a darker region. **Only the darker region is the solution.**' },
        {
          t: 'graph',
          spec: { xMin: -5, xMax: 5, yMin: -5, yMax: 5, inequalities: [{ boundary: '3', side: 'below', strict: false }, { boundary: 'x', side: 'above', strict: true }], points: [{ x: 0, y: 2, label: '(0, 2)' }, { x: 4, y: 2, label: '(4, 2)' }, { x: 3, y: 3, label: '(3, 3)' }], ariaLabel: 'A solid horizontal line y = 3 shaded below and a dashed line y = x shaded above. They cross at (3, 3). The overlap is the wedge to the left of (3, 3), below y = 3 and above y = x. (0, 2) is in the overlap, (4, 2) is below y = x, and (3, 3) is where the lines cross.' },
          caption: 'The system y ≤ 3 and y > x.',
        },
        {
          t: 'list',
          items: [
            '$(0, 2)$ is in both colors: $2 \\le 3$ and $2 > 0$. A solution.',
            '$(4, 2)$ is only in the first color: $2 \\le 3$ is true, but $2 > 4$ is false. Not a solution.',
            '$(3, 3)$ is on the dashed line $y = x$: $3 > 3$ is false. Not a solution.',
          ],
        },
      ],
    },
    {
      approach: 'analogy',
      title: 'Making the team',
      blocks: [
        { t: 'p', text: 'To join the travel team, a player must have **at least a 2.0 GPA** and **go to at least 3 practices a week**. Each rule is one inequality.' },
        {
          t: 'list',
          items: [
            'A player with a 3.5 GPA who goes to 1 practice passes the first rule only. Not on the team.',
            'A player with a 1.8 GPA who goes to 4 practices passes the second rule only. Not on the team.',
            'A player with a 2.0 GPA who goes to exactly 3 practices passes both. On the team, because "at least" includes the boundary.',
          ],
        },
        { t: 'p', text: 'A system works the same way: a point is a solution only if it passes **every** rule.' },
      ],
    },
    {
      approach: 'step-by-step',
      title: 'A 5-step checklist for systems',
      blocks: [
        {
          t: 'list',
          ordered: true,
          items: [
            '**Get $y$ alone** in each inequality if needed (flip the symbol if you divide by a negative).',
            '**Draw each boundary**: solid for $\\le$ or $\\ge$, dashed for $<$ or $>$.',
            '**Shade each one**: above for $y >$ or $y \\ge$, below for $y <$ or $y \\le$.',
            '**Find the overlap.** That region is the solution.',
            '**Test a point** from the overlap in **both** original inequalities. Both must be true.',
          ],
        },
        { t: 'callout', variant: 'tip', text: 'In a word problem, also add $x \\ge 0$ and $y \\ge 0$ when the variables count real things, and use only whole-number points when the things cannot be split.' },
      ],
    },
    {
      approach: 'prerequisite',
      title: 'Refresher: getting y alone',
      blocks: [
        { t: 'p', text: 'To graph an inequality in standard form, solve it for $y$ first.' },
        {
          t: 'list',
          items: [
            '$x + y \\le 20$: subtract $x$ to get $y \\le -x + 20$. Solid line, shade below.',
            '$5x + 8y \\ge 120$: subtract $5x$ to get $8y \\ge -5x + 120$, then divide by $8$ to get $y \\ge -0.625x + 15$. Solid line, shade above.',
            '$2x - y < 4$: subtract $2x$ to get $-y < -2x + 4$, then divide by $-1$ **and flip** to get $y > 2x - 4$. Dashed line, shade above.',
          ],
        },
        { t: 'p', text: 'Try it: solve $3x + y > 6$ for $y$. Subtract $3x$: $y > -3x + 6$. Dashed line, shade above.' },
      ],
    },
    {
      approach: 'simpler-example',
      title: 'Start with the first quadrant',
      blocks: [
        { t: 'p', text: 'The system $x \\ge 0$ and $y \\ge 0$ is the simplest one. $x \\ge 0$ is everything on or to the right of the $y$-axis, and $y \\ge 0$ is everything on or above the $x$-axis. The overlap is the **first quadrant**, including the axes.' },
        { t: 'p', text: 'Now add one more inequality: $x + y \\le 4$. The overlap shrinks to a triangle with corners $(0, 0)$, $(4, 0)$ and $(0, 4)$.' },
        { t: 'list', items: ['$(1, 2)$: $1 \\ge 0$, $2 \\ge 0$, and $1 + 2 = 3 \\le 4$. A solution.', '$(3, 3)$: $3 + 3 = 6 \\le 4$ is false. Not a solution.', '$(-1, 2)$: $-1 \\ge 0$ is false. Not a solution.'] },
      ],
    },
    {
      approach: 'alternate-strategy',
      title: 'Use a check-mark table',
      blocks: [
        { t: 'p', text: 'You do not have to graph to test points. Make a table with one column per inequality and mark each test true or false. A point is a solution only if its whole row is true.' },
        {
          t: 'table',
          caption: 'The system y ≥ x - 1 and y < -2x + 5.',
          headers: ['Point', '$y \\ge x - 1$', '$y < -2x + 5$', 'Whole row true?'],
          rows: [
            ['$(1, 0)$', '$0 \\ge 0$: true', '$0 < 3$: true', 'yes, a solution'],
            ['$(-2, 4)$', '$4 \\ge -3$: true', '$4 < 9$: true', 'yes, a solution'],
            ['$(4, 2)$', '$2 \\ge 3$: false', '$2 < -3$: false', 'no'],
            ['$(2, 1)$', '$1 \\ge 1$: true', '$1 < 1$: false', 'no (on the dashed line)'],
          ],
        },
      ],
    },
  ],
  guided: [
    { generator: 'u2.system-test', difficulty: 1 },
    { generator: 'u2.system-point', difficulty: 1 },
    { generator: 'u2.model-system', difficulty: 1 },
    { generator: 'u2.max-in-context', difficulty: 1 },
  ],
  independent: {
    count: 8,
    reviewCount: 2,
    mix: [
      { generator: 'u2.system-test', difficulty: 1, weight: 1 },
      { generator: 'u2.system-test', difficulty: 2, weight: 2 },
      { generator: 'u2.system-point', difficulty: 2, weight: 1 },
      { generator: 'u2.model-system', difficulty: 1, weight: 1 },
      { generator: 'u2.model-system', difficulty: 2, weight: 1 },
      { generator: 'u2.max-in-context', difficulty: 1, weight: 1 },
      { generator: 'u2.max-in-context', difficulty: 2, weight: 1 },
      { generator: 'u2.max-in-context', difficulty: 3, weight: 1 },
      { generator: 'u2.is-solution', difficulty: 2, weight: 1 },
    ],
  },
  quiz: {
    items: [
      { generator: 'u2.system-test', difficulty: 2 },
      { generator: 'u2.system-test', difficulty: 3 },
      { generator: 'u2.system-point', difficulty: 2 },
      { generator: 'u2.model-system', difficulty: 2 },
      { generator: 'u2.max-in-context', difficulty: 2 },
      { generator: 'u2.max-in-context', difficulty: 3 },
    ],
  },
  summary: [
    'A **solution of a system** is a point that makes **every** inequality true. On a graph, it is in the region where all the shadings overlap.',
    'Test a point in **each** inequality. If any one is false, the point is not a solution.',
    'A point on a **solid** boundary can be a solution if it passes the other inequalities; a point on a **dashed** boundary never is.',
    'To model a situation, write one inequality per constraint, add $x \\ge 0$ and $y \\ge 0$ for real counts, and check that any rounded whole-number answer still passes every constraint.',
    'To find the best plan (greatest profit), evaluate the profit at each **corner** of the solution region and pick the largest.',
  ],
  mastery: { quizPassScore: 0.8, practiceMinCorrect: 5 },
};
