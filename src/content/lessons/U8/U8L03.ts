import type { LessonContent } from '../../../core/curriculum/types';

/**
 * U8L03 Parallel and Perpendicular Lines (A.GSR.3.1)
 * Parallel lines have equal slopes and different y-intercepts (the same line is not called parallel);
 * perpendicular lines have opposite-reciprocal slopes, so the product of their slopes is -1; a horizontal line
 * (slope 0) is perpendicular to a vertical line (undefined slope). Deciding parallel, perpendicular or neither
 * from slope-intercept form, standard form, or two pairs of points, and writing y = mx + b for the line through
 * a point parallel or perpendicular to a given line (S8.03). Reviews slope from points (S1.05) and writing
 * linear functions (S1.07).
 *
 * Math verified by hand (2026-10-08): every number below was recomputed with a node script:
 * y = 2x + 1 and y = 2x - 3 parallel; 4x - 2y = -2 is y = 2x + 1 (same line); slope triangle (3, 2) from (0, 1)
 * reaches (3, 3) and its 90-degree turn (-2, 3) reaches (-2, 4), slopes 2/3 and -3/2, product -1; slope table
 * 2 -> -1/2, -3/4 -> 4/3, 1/5 -> -5, -1 -> 1, 0 -> undefined; 2x + 3y = 6 is y = -(2/3)x + 2;
 * parallel to y = -(1/2)x + 3 through (4, -1): b = 1, perpendicular: b = -9; y = -4x + 7 -> 1/4, product -1;
 * 3x - 6y = 12 is y = (1/2)x - 2, with y = -2x + 5 product -1; Main St (-4, -2) to (4, 2) slope 1/2, bike path
 * (0, 3) to (2, -1) slope -2, Oak St (-4, 1) to (2, 4) slope 1/2 and (-4, 1) is not on y = (1/2)x;
 * perpendicular to y = (2/3)x - 1 through (2, 5): y = -(3/2)x + 8, while y = (3/2)x + 2 has product 1;
 * 3x - 2y = 8 is y = (3/2)x - 4, perpendicular through (6, -1): y = -(2/3)x + 3; y = (1/2)x turned gives (-1, 2),
 * slope -2; 4x + 2y = 10 is y = -2x + 5; parallel to y = 4x - 1 through (3, 2): y = 4x - 10; perpendicular
 * through (4, 3) by point-slope: y = -(1/4)x + 4. Every graph point and label was checked to lie in its window.
 */
export const U8L03: LessonContent = {
  lessonId: 'U8L03',
  goal: 'Use slopes to tell whether two lines are parallel (equal slopes), perpendicular (slopes multiply to $-1$, like $\\frac{2}{3}$ and $-\\frac{3}{2}$) or neither, and write the equation $y = mx + b$ of a line through a point that is parallel or perpendicular to a given line.',
  needToKnow: [
    { t: 'p', text: 'Everything in this lesson is about **slope**, so you will use these Unit 1 skills:' },
    {
      t: 'list',
      items: [
        '**Slope from two points.** For $(1, 2)$ and $(4, 8)$: $m = \\frac{8 - 2}{4 - 1} = \\frac{6}{3} = 2$.',
        '**Slope-intercept form.** In $y = mx + b$, $m$ is the slope and $b$ is the $y$-intercept. In $y = -3x + 4$ the slope is $-3$.',
        '**Solving for $y$.** $2x + y = 5$ becomes $y = -2x + 5$ by subtracting $2x$ from both sides.',
      ],
    },
    { t: 'callout', variant: 'tip', title: 'Quick check', text: 'What is the slope of $6x + 2y = 8$? (Solve for $y$: $2y = -6x + 8$, so $y = -3x + 4$ and the slope is $-3$.) If that felt shaky, open **Teach Me Again** and choose the refresher.' },
  ],
  vocabulary: [
    { term: 'parallel lines', meaning: 'Lines in the same plane that never meet. Non-vertical parallel lines have **equal slopes** and **different** $y$-intercepts.' },
    { term: 'perpendicular lines', meaning: 'Lines that meet at a right angle ($90^\\circ$). Their slopes are opposite reciprocals, so the product of the slopes is $-1$.' },
    { term: 'reciprocal', meaning: 'The fraction flipped upside down. The reciprocal of $\\frac{2}{3}$ is $\\frac{3}{2}$, and the reciprocal of $5$ is $\\frac{1}{5}$.' },
    { term: 'opposite reciprocal', meaning: 'Flip the fraction **and** change its sign. The opposite reciprocal of $\\frac{2}{3}$ is $-\\frac{3}{2}$; of $-4$ it is $\\frac{1}{4}$.' },
    { term: 'undefined slope', meaning: 'The slope of a vertical line like $x = 2$. The run is $0$, and we cannot divide by $0$.' },
  ],
  instruction: [
    { t: 'p', text: '### Parallel lines: same slope' },
    { t: 'p', text: 'Two lines with the **same slope** rise at the same rate, so the distance between them never changes and they never cross. Here are $y = 2x + 1$ and $y = 2x - 3$. Both have slope $2$; they start at different places on the $y$-axis.' },
    {
      t: 'graph',
      caption: 'y = 2x + 1 and y = 2x - 3 both have slope 2, so they are parallel.',
      spec: { xMin: -5, xMax: 5, yMin: -5, yMax: 5, functions: [{ expr: '2x + 1', label: 'y = 2x + 1' }, { expr: '2x - 3', label: 'y = 2x - 3' }], points: [{ x: 0, y: 1, label: '(0, 1)' }, { x: 0, y: -3, label: '(0, -3)' }], ariaLabel: 'Two parallel lines with slope 2: y = 2x + 1 crossing the y-axis at (0, 1) and y = 2x - 3 crossing it at (0, -3).' },
    },
    { t: 'callout', variant: 'warning', title: 'The same line is not "parallel"', text: 'If two equations have the same slope **and** the same $y$-intercept, they are the **same line**, not two parallel lines. For example $4x - 2y = -2$ rewrites as $-2y = -4x - 2$, so $y = 2x + 1$: it is the line $y = 2x + 1$ written a different way. Always compare the $y$-intercepts too.' },
    { t: 'p', text: '### Perpendicular lines: opposite reciprocal slopes' },
    { t: 'p', text: 'Start at $(0, 1)$ on the line with slope $\\frac{2}{3}$: run $3$, rise $2$ to reach $(3, 3)$. Now turn that slope triangle a quarter turn ($90^\\circ$) counterclockwise. The run of $3$ becomes a rise of $3$, and the rise of $2$ becomes a run of $2$ to the **left**. From $(0, 1)$ that reaches $(-2, 4)$.' },
    {
      t: 'graph',
      caption: 'Turning the slope triangle (run 3, rise 2) a quarter turn gives (run -2, rise 3). The slopes 2/3 and -3/2 belong to perpendicular lines.',
      spec: { xMin: -5, xMax: 5, yMin: -2, yMax: 6, functions: [{ expr: '(2/3)x + 1', label: 'y = (2/3)x + 1' }, { expr: '-1.5x + 1', label: 'y = -(3/2)x + 1' }], points: [{ x: 0, y: 1, label: '(0, 1)' }, { x: 3, y: 3, label: '(3, 3)' }, { x: -2, y: 4, label: '(-2, 4)' }], segments: [{ x1: 0, y1: 1, x2: 3, y2: 1, dashed: true }, { x1: 3, y1: 1, x2: 3, y2: 3, dashed: true }, { x1: 0, y1: 1, x2: -2, y2: 1, dashed: true }, { x1: -2, y1: 1, x2: -2, y2: 4, dashed: true }], ariaLabel: 'Line y = (2/3)x + 1 through (0, 1) and (3, 3) with a dashed run of 3 and rise of 2, and the perpendicular line y = -(3/2)x + 1 through (0, 1) and (-2, 4) with a dashed run of 2 to the left and a rise of 3.' },
    },
    { t: 'p', text: 'The new slope is $\\frac{\\text{rise}}{\\text{run}} = \\frac{3}{-2} = -\\frac{3}{2}$. The fraction **flipped** (the reciprocal) and the sign **changed** (the opposite). Multiply the two slopes:' },
    { t: 'math', tex: '\\frac{2}{3} \\cdot \\left(-\\frac{3}{2}\\right) = -\\frac{6}{6} = -1' },
    { t: 'p', text: 'This is the test for perpendicular lines: **the product of their slopes is $-1$**. To find a perpendicular slope, flip the fraction and change the sign.' },
    {
      t: 'table',
      caption: 'Parallel slopes are equal; perpendicular slopes are opposite reciprocals.',
      headers: ['Given slope', 'Parallel slope', 'Perpendicular slope', 'Check the product'],
      rows: [
        ['$2$', '$2$', '$-\\frac{1}{2}$', '$2 \\cdot \\left(-\\frac{1}{2}\\right) = -1$'],
        ['$-\\frac{3}{4}$', '$-\\frac{3}{4}$', '$\\frac{4}{3}$', '$-\\frac{3}{4} \\cdot \\frac{4}{3} = -1$'],
        ['$\\frac{1}{5}$', '$\\frac{1}{5}$', '$-5$', '$\\frac{1}{5} \\cdot (-5) = -1$'],
        ['$-1$', '$-1$', '$1$', '$-1 \\cdot 1 = -1$'],
        ['$0$ (horizontal)', '$0$', 'undefined (vertical)', 'no product: use the picture'],
      ],
    },
    { t: 'p', text: '### Horizontal and vertical lines' },
    { t: 'p', text: 'A horizontal line such as $y = 3$ has slope $0$. A vertical line such as $x = -2$ has an undefined slope. You cannot multiply an undefined slope, but the graph shows they meet at a right angle, just like the $x$- and $y$-axes. **Every horizontal line is perpendicular to every vertical line.** Two horizontal lines (like $y = 3$ and $y = -1$) are parallel, and so are two vertical lines.' },
    {
      t: 'graph',
      caption: 'The horizontal line y = 3 and the vertical line x = -2 meet at a right angle at (-2, 3).',
      spec: { xMin: -5, xMax: 5, yMin: -5, yMax: 5, segments: [{ x1: -5, y1: 3, x2: 5, y2: 3 }, { x1: -2, y1: -5, x2: -2, y2: 5 }], points: [{ x: -2, y: 3, label: '(-2, 3)' }], ariaLabel: 'The horizontal line y = 3 and the vertical line x = -2 crossing at a right angle at the point (-2, 3).' },
    },
    { t: 'p', text: '### Equations in standard form' },
    { t: 'p', text: 'To compare slopes, first get each equation into slope-intercept form. For $2x + 3y = 6$:' },
    { t: 'math', tex: '\\begin{aligned} 3y &= -2x + 6 && \\text{subtract } 2x \\\\ y &= -\\frac{2}{3}x + 2 && \\text{divide every term by } 3 \\end{aligned}' },
    { t: 'p', text: 'The slope is $-\\frac{2}{3}$. A line parallel to it has slope $-\\frac{2}{3}$, and a line perpendicular to it has slope $\\frac{3}{2}$.' },
    { t: 'p', text: '### Writing the equation of a parallel or perpendicular line' },
    { t: 'p', text: 'Find the line through $(4, -1)$ that is (a) parallel and (b) perpendicular to $y = -\\frac{1}{2}x + 3$. The given slope is $-\\frac{1}{2}$.' },
    { t: 'list', items: [
      '**(a) Parallel:** $m = -\\frac{1}{2}$. Put in the point: $-1 = -\\frac{1}{2}(4) + b = -2 + b$, so $b = 1$. The line is $y = -\\frac{1}{2}x + 1$.',
      '**(b) Perpendicular:** $m = 2$ (flip $-\\frac{1}{2}$ to $-2$, then change the sign to $2$; check $-\\frac{1}{2} \\cdot 2 = -1$). Put in the point: $-1 = 2(4) + b = 8 + b$, so $b = -9$. The line is $y = 2x - 9$.',
    ] },
    {
      t: 'graph',
      caption: 'Through (4, -1): y = -(1/2)x + 1 is parallel to y = -(1/2)x + 3, and y = 2x - 9 is perpendicular to it.',
      spec: { xMin: -4, xMax: 11, yMin: -6, yMax: 6, functions: [{ expr: '-0.5x + 3', label: 'given: y = -(1/2)x + 3' }, { expr: '-0.5x + 1', label: 'parallel: y = -(1/2)x + 1' }, { expr: '2x - 9', label: 'perpendicular: y = 2x - 9' }], points: [{ x: 4, y: -1, label: '(4, -1)' }], ariaLabel: 'The given line y = -(1/2)x + 3, the parallel line y = -(1/2)x + 1 and the perpendicular line y = 2x - 9, with the last two passing through the point (4, -1).' },
    },
    { t: 'callout', variant: 'why', title: 'Why the point decides b', text: 'The slope tells you the **direction** of the new line. There are many lines with that direction, all parallel to each other. The point picks out the **one** that passes through it, and that fixes $b$.' },
    { t: 'callout', variant: 'realworld', title: 'Where this shows up', text: 'City planners lay out streets that run parallel or cross at right angles, carpenters check that shelves are perpendicular to walls, and video-game designers use opposite-reciprocal slopes to make objects bounce off walls at the right angle.' },
  ],
  examples: [
    {
      title: 'Parallel and perpendicular slopes',
      kind: 'introductory',
      problem: [{ t: 'p', text: 'The line $y = -4x + 7$ is given. What is the slope of a line parallel to it? What is the slope of a line perpendicular to it?' }],
      steps: [
        { text: 'Read the slope of the given line.', tex: 'y = -4x + 7 \\;\\Rightarrow\\; m = -4', why: 'In $y = mx + b$, the number multiplying $x$ is the slope.' },
        { text: 'Parallel slope: keep it the same.', tex: 'm_{\\parallel} = -4', why: 'Parallel lines rise or fall at exactly the same rate.' },
        { text: 'Perpendicular slope: flip and change the sign.', tex: '-4 = -\\frac{4}{1} \\;\\Rightarrow\\; \\text{flip: } -\\frac{1}{4} \\;\\Rightarrow\\; \\text{change sign: } \\frac{1}{4}', why: 'Writing $-4$ as the fraction $-\\frac{4}{1}$ makes the flip easy to see.' },
        { text: 'Check the perpendicular slope with the product.', tex: '-4 \\cdot \\frac{1}{4} = -1 \\; \\checkmark', why: 'Perpendicular slopes always multiply to $-1$.' },
      ],
      answer: 'Parallel slope $-4$; perpendicular slope $\\frac{1}{4}$.',
    },
    {
      title: 'Parallel, perpendicular or neither?',
      kind: 'intermediate',
      problem: [{ t: 'p', text: 'Are the lines $3x - 6y = 12$ and $y = -2x + 5$ parallel, perpendicular or neither?' }],
      steps: [
        { text: 'Rewrite the standard-form equation in slope-intercept form.', tex: '\\begin{aligned} -6y &= -3x + 12 \\\\ y &= \\frac{1}{2}x - 2 \\end{aligned}', why: 'Subtract $3x$ from both sides, then divide every term by $-6$. Dividing $-3x$ by $-6$ gives $+\\frac{1}{2}x$.' },
        { text: 'List both slopes.', tex: 'm_1 = \\frac{1}{2}, \\qquad m_2 = -2', why: 'The second equation is already in $y = mx + b$ form.' },
        { text: 'Are they equal?', tex: '\\frac{1}{2} \\ne -2', why: 'Different slopes, so the lines are not parallel.' },
        { text: 'Multiply them.', tex: '\\frac{1}{2} \\cdot (-2) = -1', why: 'A product of $-1$ means the slopes are opposite reciprocals.' },
      ],
      answer: 'Perpendicular: the slopes $\\frac{1}{2}$ and $-2$ multiply to $-1$.',
    },
    {
      title: 'Streets on a city map',
      kind: 'real-world',
      problem: [
        { t: 'p', text: 'On a city map grid, Main Street runs through $(-4, -2)$ and $(4, 2)$. A new bike path runs through $(0, 3)$ and $(2, -1)$, and Oak Street runs through $(-4, 1)$ and $(2, 4)$. Is the bike path perpendicular to Main Street? Is Oak Street parallel to Main Street?' },
        {
          t: 'graph',
          caption: 'Main Street (blue), bike path (orange), Oak Street (green).',
          spec: { xMin: -6, xMax: 6, yMin: -4, yMax: 6, segments: [{ x1: -4, y1: -2, x2: 4, y2: 2, color: '#3557d4' }, { x1: 0, y1: 3, x2: 2, y2: -1, color: '#d4572f' }, { x1: -4, y1: 1, x2: 2, y2: 4, color: '#1f8a5b' }], points: [{ x: -4, y: -2, label: '(-4, -2)' }, { x: 4, y: 2, label: '(4, 2)' }, { x: 0, y: 3, label: '(0, 3)' }, { x: 2, y: -1, label: '(2, -1)' }, { x: -4, y: 1, label: '(-4, 1)' }, { x: 2, y: 4, label: '(2, 4)' }], ariaLabel: 'Map grid with Main Street from (-4, -2) to (4, 2), a bike path from (0, 3) to (2, -1), and Oak Street from (-4, 1) to (2, 4).' },
        },
      ],
      steps: [
        { text: 'Slope of Main Street.', tex: 'm = \\frac{2 - (-2)}{4 - (-4)} = \\frac{4}{8} = \\frac{1}{2}', why: 'Slope is the change in $y$ over the change in $x$; subtracting a negative means adding.' },
        { text: 'Slope of the bike path.', tex: 'm = \\frac{-1 - 3}{2 - 0} = \\frac{-4}{2} = -2', why: 'Use the same order (second point minus first point) on the top and the bottom.' },
        { text: 'Test the bike path.', tex: '\\frac{1}{2} \\cdot (-2) = -1', why: 'The product is $-1$, so the bike path meets Main Street at a right angle.' },
        { text: 'Slope of Oak Street, and is it a different line?', tex: 'm = \\frac{4 - 1}{2 - (-4)} = \\frac{3}{6} = \\frac{1}{2}', why: 'Same slope as Main Street. Main Street is $y = \\frac{1}{2}x$, and $(-4, 1)$ is not on it ($\\frac{1}{2}(-4) = -2 \\ne 1$), so Oak Street is a different line. Equal slopes and different lines means parallel.' },
      ],
      answer: 'Yes, the bike path is perpendicular to Main Street (slopes $\\frac{1}{2}$ and $-2$). Yes, Oak Street is parallel to Main Street (both slopes $\\frac{1}{2}$, different lines).',
    },
    {
      title: 'Flip, but forget the sign',
      kind: 'common-mistake',
      problem: [{ t: 'p', text: 'Write the equation of the line through $(2, 5)$ perpendicular to $y = \\frac{2}{3}x - 1$. Kayla wrote $y = \\frac{3}{2}x + 2$. What went wrong, and what is the right answer?' }],
      steps: [
        { text: 'Test Kayla\'s slope with the product.', tex: '\\frac{2}{3} \\cdot \\frac{3}{2} = 1 \\ne -1', why: 'Kayla flipped the fraction but did not change the sign. Her line passes through $(2, 5)$, but it does not make a right angle with the given line.' },
        { text: 'Find the correct perpendicular slope.', tex: '\\frac{2}{3} \\;\\Rightarrow\\; -\\frac{3}{2}', why: 'Flip **and** change the sign. Check: $\\frac{2}{3} \\cdot \\left(-\\frac{3}{2}\\right) = -1$.' },
        { text: 'Put the point into $y = mx + b$ and solve for $b$.', tex: '5 = -\\frac{3}{2}(2) + b \\;\\Rightarrow\\; 5 = -3 + b \\;\\Rightarrow\\; b = 8', why: 'The line must pass through $(2, 5)$, so $x = 2$ and $y = 5$ make the equation true.' },
        { text: 'Write and check the line.', tex: 'y = -\\frac{3}{2}x + 8, \\qquad -\\frac{3}{2}(2) + 8 = 5 \\; \\checkmark', why: 'Checking the point catches arithmetic slips.' },
      ],
      answer: 'Kayla forgot to change the sign. The correct line is $y = -\\frac{3}{2}x + 8$.',
    },
    {
      title: 'Perpendicular to a standard-form line',
      kind: 'challenging',
      problem: [{ t: 'p', text: 'Write the equation, in slope-intercept form, of the line through $(6, -1)$ that is perpendicular to $3x - 2y = 8$.' }],
      steps: [
        { text: 'Find the slope of the given line.', tex: '\\begin{aligned} -2y &= -3x + 8 \\\\ y &= \\frac{3}{2}x - 4 \\end{aligned}', why: 'Subtract $3x$, then divide every term by $-2$. The slope is $\\frac{3}{2}$.' },
        { text: 'Find the perpendicular slope.', tex: 'm = -\\frac{2}{3}', why: 'Flip $\\frac{3}{2}$ to $\\frac{2}{3}$ and change the sign. Check: $\\frac{3}{2} \\cdot \\left(-\\frac{2}{3}\\right) = -1$.' },
        { text: 'Use the point to find $b$.', tex: '-1 = -\\frac{2}{3}(6) + b \\;\\Rightarrow\\; -1 = -4 + b \\;\\Rightarrow\\; b = 3', why: '$-\\frac{2}{3} \\cdot 6 = -\\frac{12}{3} = -4$; then add $4$ to both sides.' },
        { text: 'Write and check.', tex: 'y = -\\frac{2}{3}x + 3, \\qquad -\\frac{2}{3}(6) + 3 = -1 \\; \\checkmark', why: 'The point $(6, -1)$ is on the new line, and the slopes multiply to $-1$.' },
      ],
      answer: '$y = -\\frac{2}{3}x + 3$',
    },
  ],
  teachMeAgain: [
    {
      approach: 'visual',
      title: 'Turn the slope triangle',
      blocks: [
        { t: 'p', text: 'The line $y = \\frac{1}{2}x$ goes from $(0, 0)$ to $(2, 1)$: run $2$, rise $1$. Turn that triangle a quarter turn counterclockwise around $(0, 0)$. Now it goes up $2$ and left $1$, reaching $(-1, 2)$.' },
        {
          t: 'graph',
          caption: 'Run 2, rise 1 turns into rise 2, run -1. Slope 1/2 becomes slope -2.',
          spec: { xMin: -5, xMax: 5, yMin: -4, yMax: 4, functions: [{ expr: '(1/2)x', label: 'y = (1/2)x' }, { expr: '-2x', label: 'y = -2x' }], points: [{ x: 0, y: 0 }, { x: 2, y: 1, label: '(2, 1)' }, { x: -1, y: 2, label: '(-1, 2)' }], segments: [{ x1: 0, y1: 0, x2: 2, y2: 0, dashed: true }, { x1: 2, y1: 0, x2: 2, y2: 1, dashed: true }, { x1: 0, y1: 0, x2: -1, y2: 0, dashed: true }, { x1: -1, y1: 0, x2: -1, y2: 2, dashed: true }], ariaLabel: 'Line y = (1/2)x through (0, 0) and (2, 1) with a dashed run of 2 and rise of 1, and the perpendicular line y = -2x through (0, 0) and (-1, 2) with a dashed run of 1 to the left and a rise of 2.' },
        },
        { t: 'p', text: 'The new slope is $\\frac{2}{-1} = -2$. The rise and run **swapped places** (that is the flip) and one of them **changed direction** (that is the sign change). The lines cross at a perfect corner.' },
      ],
    },
    {
      approach: 'simpler-example',
      title: 'Whole-number slopes first',
      blocks: [
        { t: 'list', items: [
          '**Slope $2$.** Write it as $\\frac{2}{1}$. Flip: $\\frac{1}{2}$. Change the sign: $-\\frac{1}{2}$. Check: $2 \\cdot \\left(-\\frac{1}{2}\\right) = -1$.',
          '**Slope $1$.** Flip: $1$. Change the sign: $-1$. The lines $y = x$ and $y = -x$ make a big X with four right angles.',
          '**Slope $-3$.** Flip: $-\\frac{1}{3}$. Change the sign: $\\frac{1}{3}$. Check: $-3 \\cdot \\frac{1}{3} = -1$.',
        ] },
        { t: 'p', text: 'Parallel is even easier: the parallel slope is just the **same** number.' },
      ],
    },
    {
      approach: 'analogy',
      title: 'Railroad tracks and street corners',
      blocks: [
        { t: 'p', text: '**Parallel lines are railroad tracks.** The two rails are always the same distance apart because they have the same steepness. If one rail tilted even a little more, the train would crash where they meet.' },
        { t: 'p', text: '**Perpendicular lines are a street corner.** When you turn a corner, "forward" becomes "sideways" and "sideways" becomes "forward": that swap is the flip of rise and run. And if one street goes uphill to the right, the cross street goes downhill to the right: that is the sign change.' },
      ],
    },
    {
      approach: 'prerequisite',
      title: 'Refresher: finding the slope',
      blocks: [
        { t: 'list', items: [
          '**From two points:** $m = \\frac{y_2 - y_1}{x_2 - x_1}$. For $(-1, 4)$ and $(3, -4)$: $m = \\frac{-4 - 4}{3 - (-1)} = \\frac{-8}{4} = -2$.',
          '**From $y = mx + b$:** read $m$. In $y = \\frac{3}{5}x - 2$, $m = \\frac{3}{5}$.',
          '**From standard form:** solve for $y$ first. $4x + 2y = 10 \\Rightarrow 2y = -4x + 10 \\Rightarrow y = -2x + 5$, so $m = -2$.',
        ] },
        { t: 'callout', variant: 'warning', title: 'Divide every term', text: 'When you divide to get $y$ alone, divide **both** terms on the right. $2y = -4x + 10$ gives $y = -2x + 5$, not $y = -2x + 10$.' },
      ],
    },
    {
      approach: 'step-by-step',
      title: 'A routine for writing the new line',
      blocks: [
        { t: 'list', ordered: true, items: [
          '**Find the slope** of the given line (solve for $y$ if it is in standard form).',
          '**Choose the new slope:** the same slope for parallel, the opposite reciprocal for perpendicular.',
          '**Substitute the point** into $y = mx + b$ and solve for $b$.',
          '**Write** $y = mx + b$ with your $m$ and $b$.',
          '**Check** that the point makes the equation true.',
        ] },
        { t: 'p', text: 'Try it: parallel to $y = 4x - 1$ through $(3, 2)$. Slope $4$; $2 = 4(3) + b = 12 + b$, so $b = -10$. The line is $y = 4x - 10$. Check: $4(3) - 10 = 2$.' },
      ],
    },
    {
      approach: 'alternate-strategy',
      title: 'Use point-slope form',
      blocks: [
        { t: 'p', text: 'Instead of solving for $b$, write the line in point-slope form $y - y_1 = m(x - x_1)$ and then simplify.' },
        { t: 'p', text: 'Perpendicular to $y = 4x - 1$ through $(4, 3)$: the slope is $-\\frac{1}{4}$.' },
        { t: 'math', tex: '\\begin{aligned} y - 3 &= -\\frac{1}{4}(x - 4) \\\\ y - 3 &= -\\frac{1}{4}x + 1 \\\\ y &= -\\frac{1}{4}x + 4 \\end{aligned}' },
        { t: 'p', text: 'Check: $-\\frac{1}{4}(4) + 4 = 3$, and $4 \\cdot \\left(-\\frac{1}{4}\\right) = -1$. Both methods give the same line; use whichever you find easier.' },
      ],
    },
  ],
  guided: [
    { generator: 'u8.parallel-perp', difficulty: 1 },
    { generator: 'u8.parallel-perp', difficulty: 1 },
    { generator: 'u8.parallel-perp', difficulty: 2 },
    { generator: 'u8.parallel-perp', difficulty: 3 },
  ],
  independent: {
    count: 8,
    reviewCount: 2,
    mix: [
      { generator: 'u8.parallel-perp', difficulty: 1, weight: 2 },
      { generator: 'u8.parallel-perp', difficulty: 2, weight: 3 },
      { generator: 'u8.parallel-perp', difficulty: 3, weight: 3 },
    ],
  },
  quiz: {
    items: [
      { generator: 'u8.parallel-perp', difficulty: 1 },
      { generator: 'u8.parallel-perp', difficulty: 2 },
      { generator: 'u8.parallel-perp', difficulty: 2 },
      { generator: 'u8.parallel-perp', difficulty: 2 },
      { generator: 'u8.parallel-perp', difficulty: 3 },
      { generator: 'u8.parallel-perp', difficulty: 3 },
    ],
  },
  summary: [
    'Parallel lines have equal slopes and different $y$-intercepts. Equal slopes **and** equal intercepts means the same line, not parallel lines.',
    'Perpendicular lines have opposite-reciprocal slopes: flip the fraction and change the sign. Their slopes multiply to $-1$, like $\\frac{2}{3} \\cdot \\left(-\\frac{3}{2}\\right) = -1$.',
    'A horizontal line (slope $0$) is perpendicular to a vertical line (undefined slope).',
    'Put standard-form equations into $y = mx + b$ before comparing slopes: $3x - 6y = 12$ becomes $y = \\frac{1}{2}x - 2$.',
    'To write a parallel or perpendicular line through a point, choose the new slope, substitute the point to find $b$, and check: through $(4, -1)$, $y = -\\frac{1}{2}x + 1$ is parallel and $y = 2x - 9$ is perpendicular to $y = -\\frac{1}{2}x + 3$.',
  ],
  mastery: { quizPassScore: 0.8, practiceMinCorrect: 5 },
};
