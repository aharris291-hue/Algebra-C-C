import type { LessonContent } from '../../../core/curriculum/types';

/**
 * U8L02 The Midpoint Formula (A.GSR.3.2)
 * The midpoint of a segment on a number line as the average of the endpoints; on the coordinate plane as the
 * average of the x-coordinates and the average of the y-coordinates, M = ((x1 + x2)/2, (y1 + y2)/2), including
 * .5 coordinates; reading endpoints from a graph; the midpoint is the same distance from both endpoints; the
 * center of a circle as the midpoint of a diameter; a missing endpoint by x2 = 2xm - x1 or by "doubling the step"
 * (S8.02). Reviews the distance formula (S8.01).
 *
 * Math verified by hand (2026-10-08): number line -2 and 6: (-2 + 6)/2 = 2; A(-4, 1), B(2, 5): M(-1, 3);
 * (1, 2), (4, 7): (2.5, 4.5); A(1, -2), M(3, 1): step (+2, +3), B = (2*3 - 1, 2*1 - (-2)) = (5, 4); diameter
 * (-1, -3), (5, 1): center (2, -1), radius sqrt(3^2 + 2^2) = sqrt 13 from either end; (2, 3), (8, 7): (5, 5);
 * (-5, 4), (2, -3): (-1.5, 0.5); Maya (-3, 4), Leo (5, -2): (1, 1), each 5 blocks away (4^2 + 3^2 = 25), the
 * whole trip sqrt(64 + 36) = 10; mistake (-2, 6), (4, 0): correct (1, 3), subtracting gives (3, -3);
 * A(-3, 4), M(2, -1): B = (2*2 + 3, 2*(-1) - 4) = (7, -6), check (-3 + 7)/2 = 2, (4 - 6)/2 = -1; teach-again
 * (0, 1), (6, 5): (3, 3); number line 2 and 8: 5, -4 and 2: -1; (-7 + 2)/2 = -2.5, (-3 + -5)/2 = -4,
 * (3 + 6)/2 = 4.5; (-6, -1), (2, 5): (-2, 2), each 5 away (16 + 9 = 25); A(-1, 3), M(2, 1): step (+3, -2),
 * B(5, -1), formula 2*2 - (-1) = 5, 2*1 - 3 = -1. Every graph point and label was checked to lie inside its window.
 */
export const U8L02: LessonContent = {
  lessonId: 'U8L02',
  goal: 'Find the midpoint of a segment by averaging the coordinates of its endpoints (the midpoint of $(-4, 1)$ and $(2, 5)$ is $(-1, 3)$), and work backward from a midpoint and one endpoint to find the other endpoint.',
  needToKnow: [
    { t: 'p', text: 'The midpoint formula is built on one idea you already know, the **average** (mean) of two numbers:' },
    {
      t: 'list',
      items: [
        '**Average of two numbers:** add them and divide by $2$. The average of $-3$ and $7$ is $\\frac{-3 + 7}{2} = \\frac{4}{2} = 2$.',
        '**Halves can be decimals:** $\\frac{-5}{2} = -2.5$ and $\\frac{9}{2} = 4.5$.',
        '**Plotting points:** $(x, y)$ means $x$ right (or left if negative) and $y$ up (or down if negative).',
      ],
    },
    { t: 'callout', variant: 'tip', title: 'Quick check', text: 'What number is halfway between $-6$ and $2$? ($\\frac{-6 + 2}{2} = \\frac{-4}{2} = -2$. Check: $-6$ to $-2$ is $4$ steps and $-2$ to $2$ is $4$ steps.) If that felt shaky, open **Teach Me Again** and choose the refresher.' },
  ],
  vocabulary: [
    { term: 'midpoint', meaning: 'The point on a segment that is exactly halfway between its endpoints. It splits the segment into two equal halves.' },
    { term: 'endpoint', meaning: 'One of the two points at the ends of a segment.' },
    { term: 'midpoint formula', meaning: '$M = \\left( \\frac{x_1 + x_2}{2}, \\frac{y_1 + y_2}{2} \\right)$: average the $x$-coordinates and average the $y$-coordinates.' },
    { term: 'bisect', meaning: 'To cut into two equal parts. The midpoint bisects a segment.' },
    { term: 'diameter', meaning: 'A segment through the center of a circle with both endpoints on the circle. Its midpoint is the center.' },
  ],
  instruction: [
    { t: 'p', text: '### Halfway on a number line' },
    { t: 'p', text: 'The point halfway between $-2$ and $6$ is the **average** of the two numbers: $\\frac{-2 + 6}{2} = \\frac{4}{2} = 2$. Check by counting: $-2$ to $2$ is $4$ steps and $2$ to $6$ is $4$ steps.' },
    { t: 'p', text: '### Halfway on the coordinate plane' },
    { t: 'p', text: 'A segment on the plane moves in two directions at once. The midpoint is halfway **across** and halfway **up**, so you average the $x$-coordinates and average the $y$-coordinates separately. For $A(-4, 1)$ and $B(2, 5)$:' },
    { t: 'math', tex: 'M = \\left( \\frac{-4 + 2}{2}, \\; \\frac{1 + 5}{2} \\right) = \\left( \\frac{-2}{2}, \\; \\frac{6}{2} \\right) = (-1, 3)' },
    {
      t: 'graph',
      caption: 'M(-1, 3) is halfway between A and B: 3 right and 2 up from A, then 3 right and 2 up again to B.',
      spec: {
        xMin: -6, xMax: 5, yMin: -1, yMax: 7, xStep: 1, yStep: 1,
        points: [
          { x: -4, y: 1, label: 'A(-4, 1)' },
          { x: -1, y: 3, label: 'M(-1, 3)' },
          { x: 2, y: 5, label: 'B(2, 5)' },
        ],
        segments: [{ x1: -4, y1: 1, x2: 2, y2: 5 }],
        ariaLabel: 'Segment from A(-4, 1) to B(2, 5) with its midpoint M(-1, 3).',
      },
    },
    { t: 'p', text: 'This gives the **midpoint formula**:' },
    { t: 'math', tex: 'M = \\left( \\frac{x_1 + x_2}{2}, \\; \\frac{y_1 + y_2}{2} \\right)' },
    { t: 'callout', variant: 'warning', title: 'Add, do not subtract', text: 'The distance formula **subtracts** coordinates (how far apart are they?). The midpoint formula **adds** them and divides by $2$ (what is their average?). Mixing the two up is the most common midpoint mistake.' },
    { t: 'p', text: '### Midpoints with halves' },
    { t: 'p', text: 'If a sum is odd, the coordinate ends in $.5$. For $(1, 2)$ and $(4, 7)$: $M = \\left( \\frac{5}{2}, \\frac{9}{2} \\right) = (2.5, 4.5)$. Both $2.5$ and $\\frac{5}{2}$ are correct ways to write it.' },
    { t: 'p', text: '### Working backward: a missing endpoint' },
    { t: 'p', text: 'Suppose you know one endpoint $A(1, -2)$ and the midpoint $M(3, 1)$. To get from $A$ to $M$ you move $2$ right and $3$ up. The midpoint is halfway, so take **the same step again** to reach $B$:' },
    { t: 'math', tex: 'B = (3 + 2, \\; 1 + 3) = (5, 4)' },
    {
      t: 'graph',
      caption: 'Double the step: A to M is (+2, +3), so M to B is (+2, +3) too.',
      spec: {
        xMin: -1, xMax: 8, yMin: -3, yMax: 6, xStep: 1, yStep: 1,
        points: [
          { x: 1, y: -2, label: 'A(1, -2)' },
          { x: 3, y: 1, label: 'M(3, 1)' },
          { x: 5, y: 4, label: 'B(5, 4)' },
        ],
        segments: [{ x1: 1, y1: -2, x2: 5, y2: 4 }],
        ariaLabel: 'Segment from A(1, -2) through midpoint M(3, 1) to the missing endpoint B(5, 4).',
      },
    },
    { t: 'p', text: 'There is also a formula version: since the midpoint is the average, $x_2 = 2x_M - x_1$ and $y_2 = 2y_M - y_1$. Here $x_2 = 2(3) - 1 = 5$ and $y_2 = 2(1) - (-2) = 4$. Always check by finding the midpoint of $A$ and your $B$.' },
    { t: 'p', text: '### The center of a circle' },
    { t: 'p', text: 'A diameter passes through the center of a circle, and the center is halfway along it. If a diameter has endpoints $(-1, -3)$ and $(5, 1)$, the center is $\\left( \\frac{-1 + 5}{2}, \\frac{-3 + 1}{2} \\right) = (2, -1)$. The radius is the distance from the center to either endpoint: $\\sqrt{3^2 + 2^2} = \\sqrt{13}$.' },
    { t: 'callout', variant: 'realworld', title: 'Where this shows up', text: 'Apps that suggest a place to meet "halfway" between two friends start from a midpoint. Builders find the center of a wall or a beam the same way: measure both ends and average.' },
  ],
  examples: [
    {
      title: 'A midpoint with whole numbers',
      kind: 'introductory',
      problem: [
        { t: 'p', text: 'Find the midpoint of the segment from $(2, 3)$ to $(8, 7)$.' },
        {
          t: 'graph',
          spec: {
            xMin: 0, xMax: 11, yMin: 0, yMax: 9, xStep: 1, yStep: 1,
            points: [
              { x: 2, y: 3, label: '(2, 3)' },
              { x: 8, y: 7, label: '(8, 7)' },
            ],
            segments: [{ x1: 2, y1: 3, x2: 8, y2: 7 }],
            ariaLabel: 'Segment from (2, 3) to (8, 7).',
          },
        },
      ],
      steps: [
        { text: 'Average the $x$-coordinates.', tex: '\\frac{2 + 8}{2} = \\frac{10}{2} = 5', why: 'Halfway across from $x = 2$ to $x = 8$ is $x = 5$: $3$ steps from each end.' },
        { text: 'Average the $y$-coordinates.', tex: '\\frac{3 + 7}{2} = \\frac{10}{2} = 5', why: 'Halfway up from $y = 3$ to $y = 7$ is $y = 5$: $2$ steps from each end.' },
        { text: 'Write the midpoint as an ordered pair.', tex: 'M = (5, 5)', why: 'The midpoint is a point, so it needs both coordinates. Look at the graph: $(5, 5)$ sits right in the middle of the segment.' },
      ],
      answer: 'The midpoint is $(5, 5)$.',
    },
    {
      title: 'Negative coordinates and halves',
      kind: 'intermediate',
      problem: [
        { t: 'p', text: 'Find the midpoint of the segment with endpoints $P(-5, 4)$ and $Q(2, -3)$.' },
        {
          t: 'graph',
          spec: {
            xMin: -7, xMax: 5, yMin: -5, yMax: 6, xStep: 1, yStep: 1,
            points: [
              { x: -5, y: 4, label: 'P(-5, 4)' },
              { x: 2, y: -3, label: 'Q(2, -3)' },
            ],
            segments: [{ x1: -5, y1: 4, x2: 2, y2: -3 }],
            ariaLabel: 'Segment from P(-5, 4) to Q(2, -3).',
          },
        },
      ],
      steps: [
        { text: 'Average the $x$-coordinates.', tex: '\\frac{-5 + 2}{2} = \\frac{-3}{2} = -1.5', why: 'The sum is odd, so the coordinate is a half. A midpoint does not have to land on a grid point.' },
        { text: 'Average the $y$-coordinates.', tex: '\\frac{4 + (-3)}{2} = \\frac{1}{2} = 0.5', why: 'Adding $-3$ is the same as subtracting $3$.' },
        { text: 'Check that the answer is sensible.', tex: '-5 < -1.5 < 2, \\qquad -3 < 0.5 < 4', why: 'A midpoint is always **between** the endpoints in both coordinates.' },
      ],
      answer: 'The midpoint is $(-1.5, 0.5)$, which can also be written $\\left( -\\frac{3}{2}, \\frac{1}{2} \\right)$.',
    },
    {
      title: 'Meeting halfway',
      kind: 'real-world',
      problem: [
        { t: 'p', text: 'On a town map where each grid unit is one block, Maya lives at $(-3, 4)$ and Leo lives at $(5, -2)$. They want to meet at the point exactly halfway between their houses. Where should they meet, and how far (straight-line) will each of them travel?' },
        {
          t: 'graph',
          spec: {
            xMin: -5, xMax: 8, yMin: -4, yMax: 6, xStep: 1, yStep: 1, xLabel: 'blocks east', yLabel: 'blocks north',
            points: [
              { x: -3, y: 4, label: 'Maya' },
              { x: 1, y: 1, label: 'meet' },
              { x: 5, y: -2, label: 'Leo' },
            ],
            segments: [{ x1: -3, y1: 4, x2: 5, y2: -2 }],
            ariaLabel: 'Maya at (-3, 4), Leo at (5, -2), and the meeting point (1, 1) halfway between them.',
          },
        },
      ],
      steps: [
        { text: 'Find the midpoint.', tex: 'M = \\left( \\frac{-3 + 5}{2}, \\; \\frac{4 + (-2)}{2} \\right) = \\left( \\frac{2}{2}, \\frac{2}{2} \\right) = (1, 1)', why: 'Halfway between two places is the average of their coordinates.' },
        { text: 'Find Maya\'s distance to the meeting point.', tex: '\\sqrt{(1 - (-3))^2 + (1 - 4)^2} = \\sqrt{16 + 9} = \\sqrt{25} = 5', why: 'This is the distance formula from the last lesson.' },
        { text: 'Check Leo\'s distance.', tex: '\\sqrt{(5 - 1)^2 + (-2 - 1)^2} = \\sqrt{16 + 9} = 5', why: 'A true midpoint is the **same** distance from both endpoints, so this is a good check. Together they cover $\\sqrt{8^2 + 6^2} = 10$ blocks, twice $5$.' },
      ],
      answer: 'They should meet at $(1, 1)$. Each of them travels $5$ blocks in a straight line.',
    },
    {
      title: 'Subtracting instead of adding',
      kind: 'common-mistake',
      problem: [
        { t: 'p', text: 'Riley was asked for the midpoint of $(-2, 6)$ and $(4, 0)$ and wrote $\\left( \\frac{4 - (-2)}{2}, \\frac{0 - 6}{2} \\right) = (3, -3)$. Is Riley right?' },
        {
          t: 'graph',
          spec: {
            xMin: -4, xMax: 7, yMin: -5, yMax: 8, xStep: 1, yStep: 1,
            points: [
              { x: -2, y: 6, label: '(-2, 6)' },
              { x: 4, y: 0, label: '(4, 0)' },
              { x: 1, y: 3, label: '(1, 3)' },
              { x: 3, y: -3, label: '(3, -3)?', color: '#d4572f' },
            ],
            segments: [{ x1: -2, y1: 6, x2: 4, y2: 0 }],
            ariaLabel: 'Segment from (-2, 6) to (4, 0) with its true midpoint (1, 3) on it, and Riley\'s point (3, -3) far below the segment.',
          },
        },
      ],
      steps: [
        { text: 'Look at Riley\'s point on the graph.', tex: '(3, -3)', why: 'It is not even on the segment, and $-3$ is not between the $y$-coordinates $0$ and $6$. A midpoint must be between the endpoints.' },
        { text: 'Name the mistake.', tex: '\\frac{x_2 - x_1}{2} \\text{ is half the change, not the midpoint}', why: 'Subtracting tells you how far apart the points are, which belongs in the distance formula. The midpoint is an **average**, so the coordinates are added.' },
        { text: 'Use the midpoint formula.', tex: 'M = \\left( \\frac{-2 + 4}{2}, \\; \\frac{6 + 0}{2} \\right) = \\left( \\frac{2}{2}, \\frac{6}{2} \\right) = (1, 3)', why: 'Add each pair of coordinates, then divide by $2$.' },
      ],
      answer: 'No. Riley subtracted. The midpoint is $(1, 3)$.',
    },
    {
      title: 'Finding the other endpoint',
      kind: 'challenging',
      problem: [{ t: 'p', text: 'The midpoint of $\\overline{AB}$ is $M(2, -1)$, and one endpoint is $A(-3, 4)$. Find the other endpoint $B$.' }],
      steps: [
        { text: 'Find the step from $A$ to $M$.', tex: '\\Delta x = 2 - (-3) = 5, \\qquad \\Delta y = -1 - 4 = -5', why: 'Going from $A$ to $M$ is $5$ right and $5$ down.' },
        { text: 'Take the same step again from $M$.', tex: 'B = (2 + 5, \\; -1 + (-5)) = (7, -6)', why: '$M$ is halfway, so the second half of the segment is exactly like the first half.' },
        { text: 'Confirm with the formula version.', tex: 'x_B = 2(2) - (-3) = 7, \\qquad y_B = 2(-1) - 4 = -6', why: 'Since $x_M = \\frac{x_A + x_B}{2}$, multiplying by $2$ and subtracting $x_A$ gives $x_B = 2x_M - x_A$ (and the same for $y$).' },
        { text: 'Check the midpoint of $A$ and $B$.', tex: '\\left( \\frac{-3 + 7}{2}, \\; \\frac{4 + (-6)}{2} \\right) = (2, -1) \\;\\checkmark', why: 'Averaging the endpoints gives back $M$, so $B$ is right. (A common wrong answer is $(-0.5, 1.5)$, the midpoint of $A$ and $M$.)' },
      ],
      answer: '$B = (7, -6)$.',
    },
  ],
  teachMeAgain: [
    {
      approach: 'visual',
      title: 'Halfway across and halfway up',
      blocks: [
        { t: 'p', text: 'The segment from $(0, 1)$ to $(6, 5)$ goes $6$ across and $4$ up. Its midpoint goes **half** of each: $3$ across and $2$ up from $(0, 1)$, which lands on $(3, 3)$.' },
        {
          t: 'graph',
          spec: {
            xMin: -1, xMax: 9, yMin: -1, yMax: 7, xStep: 1, yStep: 1,
            points: [
              { x: 0, y: 1, label: '(0, 1)' },
              { x: 3, y: 3, label: '(3, 3)' },
              { x: 6, y: 5, label: '(6, 5)' },
            ],
            segments: [
              { x1: 0, y1: 1, x2: 6, y2: 5 },
              { x1: 0, y1: 1, x2: 6, y2: 1, dashed: true },
              { x1: 6, y1: 1, x2: 6, y2: 5, dashed: true },
              { x1: 3, y1: 1, x2: 3, y2: 3, dashed: true },
            ],
            ariaLabel: 'Segment from (0, 1) to (6, 5) with midpoint (3, 3). A dashed run along y = 1 from x = 0 to 6 and a dashed rise at x = 6 from 1 to 5; a dashed line at x = 3 marks halfway across.',
          },
        },
        { t: 'p', text: 'The dashed line at $x = 3$ is halfway along the bottom leg, and it meets the segment at $y = 3$, halfway up. Averaging: $\\frac{0 + 6}{2} = 3$ and $\\frac{1 + 5}{2} = 3$.' },
      ],
    },
    {
      approach: 'simpler-example',
      title: 'One coordinate at a time',
      blocks: [
        { t: 'p', text: 'On a number line, halfway between $2$ and $8$ is $\\frac{2 + 8}{2} = 5$, and halfway between $-4$ and $2$ is $\\frac{-4 + 2}{2} = -1$.' },
        { t: 'p', text: 'A midpoint on the plane is just two of these number-line problems: one for the $x$-coordinates and one for the $y$-coordinates. For $(2, -4)$ and $(8, 2)$ the midpoint is $(5, -1)$.' },
      ],
    },
    {
      approach: 'analogy',
      title: 'The midpoint is an average location',
      blocks: [
        { t: 'p', text: 'If you scored $70$ on one quiz and $90$ on another, your average is $80$, right in the middle. The midpoint does the same thing with positions: it is the "average location" of the two endpoints.' },
        { t: 'p', text: 'You average quiz scores by adding, not subtracting. Midpoints work the same way: **add** and divide by $2$.' },
      ],
    },
    {
      approach: 'prerequisite',
      title: 'Refresher: averaging signed numbers',
      blocks: [
        {
          t: 'table',
          headers: ['Numbers', 'Sum', 'Average'],
          rows: [
            ['$-7$ and $2$', '$-5$', '$-2.5$'],
            ['$-3$ and $-5$', '$-8$', '$-4$'],
            ['$3$ and $6$', '$9$', '$4.5$'],
            ['$-6$ and $6$', '$0$', '$0$'],
          ],
        },
        { t: 'p', text: 'Add with sign rules first, then divide by $2$. An odd sum gives a $.5$ answer. The average is always between the two numbers, which is a quick check.' },
      ],
    },
    {
      approach: 'step-by-step',
      title: 'A routine with a built-in check',
      blocks: [
        { t: 'list', ordered: true, items: [
          '**Write** the endpoints $(x_1, y_1)$ and $(x_2, y_2)$.',
          '**Add** the $x$-coordinates and divide by $2$.',
          '**Add** the $y$-coordinates and divide by $2$.',
          '**Write** the answer as an ordered pair $(x, y)$.',
          '**Check** that each coordinate is between the endpoints\' coordinates.',
        ] },
        { t: 'p', text: 'Try it: $(-6, -1)$ and $(2, 5)$ give $\\left( \\frac{-4}{2}, \\frac{4}{2} \\right) = (-2, 2)$. Extra check: the distance from $(-2, 2)$ to each endpoint is $\\sqrt{4^2 + 3^2} = 5$, so it really is halfway.' },
      ],
    },
    {
      approach: 'alternate-strategy',
      title: 'Missing endpoint: count the step twice',
      blocks: [
        { t: 'p', text: 'Instead of the formula $x_2 = 2x_M - x_1$, you can count. With $A(-1, 3)$ and midpoint $M(2, 1)$:' },
        {
          t: 'graph',
          spec: {
            xMin: -3, xMax: 8, yMin: -3, yMax: 5, xStep: 1, yStep: 1,
            points: [
              { x: -1, y: 3, label: 'A(-1, 3)' },
              { x: 2, y: 1, label: 'M(2, 1)' },
              { x: 5, y: -1, label: 'B(5, -1)' },
            ],
            segments: [{ x1: -1, y1: 3, x2: 5, y2: -1 }],
            ariaLabel: 'Points A(-1, 3), M(2, 1) and B(5, -1) on one segment, with M in the middle.',
          },
        },
        { t: 'list', items: [
          'From $A$ to $M$: $3$ right, $2$ down.',
          'From $M$, go $3$ right and $2$ down again: $B = (5, -1)$.',
          'Formula check: $2(2) - (-1) = 5$ and $2(1) - 3 = -1$. Same answer.',
        ] },
      ],
    },
  ],
  guided: [
    { generator: 'u8.midpoint', difficulty: 1 },
    { generator: 'u8.midpoint', difficulty: 1 },
    { generator: 'u8.midpoint', difficulty: 2 },
    { generator: 'u8.midpoint', difficulty: 3 },
  ],
  independent: {
    count: 8,
    reviewCount: 2,
    mix: [
      { generator: 'u8.midpoint', difficulty: 1, weight: 2 },
      { generator: 'u8.midpoint', difficulty: 2, weight: 3 },
      { generator: 'u8.midpoint', difficulty: 3, weight: 3 },
    ],
  },
  quiz: {
    items: [
      { generator: 'u8.midpoint', difficulty: 1 },
      { generator: 'u8.midpoint', difficulty: 2 },
      { generator: 'u8.midpoint', difficulty: 2 },
      { generator: 'u8.midpoint', difficulty: 2 },
      { generator: 'u8.midpoint', difficulty: 3 },
      { generator: 'u8.midpoint', difficulty: 3 },
    ],
  },
  summary: [
    'The midpoint of a segment is halfway between its endpoints: average the $x$-coordinates and average the $y$-coordinates, $M = \\left( \\frac{x_1 + x_2}{2}, \\frac{y_1 + y_2}{2} \\right)$.',
    'The midpoint of $(-4, 1)$ and $(2, 5)$ is $(-1, 3)$; the midpoint of $(-5, 4)$ and $(2, -3)$ is $(-1.5, 0.5)$.',
    'The midpoint formula **adds** coordinates; the distance formula **subtracts** them. A midpoint is always between the endpoints and the same distance from each.',
    'To find a missing endpoint, take the step from the known endpoint to the midpoint and repeat it, or use $x_2 = 2x_M - x_1$ and $y_2 = 2y_M - y_1$. Then check by averaging.',
    'The center of a circle is the midpoint of any diameter.',
  ],
  mastery: { quizPassScore: 0.8, practiceMinCorrect: 5 },
};
