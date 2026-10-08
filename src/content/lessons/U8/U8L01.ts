import type { LessonContent } from '../../../core/curriculum/types';

/**
 * U8L01 The Distance Formula (A.GSR.3.2, A.NR.5.1)
 * Horizontal and vertical distances as |x2 - x1| and |y2 - y1|; any segment as the hypotenuse of a right
 * triangle whose legs are the horizontal and vertical changes, which gives d = sqrt((x2 - x1)^2 + (y2 - y1)^2);
 * the order of the points does not matter because the changes are squared; exact answers in simplest radical form
 * (A.NR.5.1) and decimals rounded to the nearest tenth only when asked; comparing which point is closer by
 * comparing d^2; and a missing coordinate from a known distance (two answers) (S8.01). Reviews simplifying square
 * roots (S3.03).
 *
 * Math verified by hand (2026-10-08): (-3, 2) to (5, 2) is 8 and (4, -1) to (4, 6) is 7; (1, 1) to (4, 5) has legs
 * 3 and 4, so 9 + 16 = 25 and d = 5; (1, 2) to (7, 4): 36 + 4 = 40, sqrt 40 = 2 sqrt 10 = 6.32... = 6.3;
 * (-2, 1) to (4, 9): 36 + 64 = 100, d = 10; (-3, 4) to (2, -1): 25 + 25 = 50, sqrt 50 = 5 sqrt 2 = 7.07... = 7.1;
 * drone (-4, -2) to (2, 1) at 10 m per unit: 36 + 9 = 45, sqrt 45 = 3 sqrt 5 = 6.708 units = 67.08... = 67.1 m;
 * (-1, 3) to (5, -5): 36 + 64 = 100, d = 10 (the wrong 6 + 8 = 14, and the sign slip 5 - 1 = 4 gives 16 + 64 = 80);
 * (x, 5) and (2, -1) at distance 10: (x - 2)^2 + 36 = 100, (x - 2)^2 = 64, x = 10 or -6 (checks: 64 + 36 = 100 both);
 * closer point to P(1, 2): A(4, 6) has d^2 = 9 + 16 = 25, B(-2, -3) has d^2 = 9 + 25 = 34, so A; teach-again:
 * (-1, -2) to (3, 1): 16 + 9 = 25, d = 5; (0, 0) to (3, 4) = 5, (0, 0) to (1, 1) = sqrt 2 = 1.41... = 1.4;
 * sqrt 72 = 6 sqrt 2, sqrt 18 = 3 sqrt 2, sqrt 20 = 2 sqrt 5; (2, -3) to (-4, 5): 36 + 64 = 100, d = 10;
 * (-2, -1) to (4, 3) by counting: legs 6 and 4, 36 + 16 = 52, sqrt 52 = 2 sqrt 13 = 7.21... = 7.2; walking 6 + 3 = 9
 * blocks vs straight 6.7. Every graph point and label was checked to lie inside its window.
 */
export const U8L01: LessonContent = {
  lessonId: 'U8L01',
  goal: 'Find the distance between any two points on the coordinate plane with the distance formula, which is the Pythagorean theorem in disguise, and give the answer exactly in simplest radical form (like $\\sqrt{40} = 2\\sqrt{10}$) or rounded to the nearest tenth when asked.',
  needToKnow: [
    { t: 'p', text: 'This lesson puts two tools you already have together:' },
    {
      t: 'list',
      items: [
        '**The Pythagorean theorem:** in a right triangle with legs $a$ and $b$ and hypotenuse $c$, $a^2 + b^2 = c^2$. A triangle with legs $3$ and $4$ has hypotenuse $\\sqrt{9 + 16} = \\sqrt{25} = 5$.',
        '**Simplest radical form:** pull the largest perfect-square factor out of the square root. $\\sqrt{40} = \\sqrt{4 \\cdot 10} = 2\\sqrt{10}$.',
        '**Subtracting signed numbers:** $5 - (-3) = 8$ and $-4 - 2 = -6$. Squaring makes either sign positive: $(-6)^2 = 36$.',
      ],
    },
    { t: 'callout', variant: 'tip', title: 'Quick check', text: 'Simplify $\\sqrt{50}$. ($50 = 25 \\cdot 2$, so $\\sqrt{50} = 5\\sqrt{2}$.) If that felt shaky, open **Teach Me Again** and choose the refresher.' },
  ],
  vocabulary: [
    { term: 'distance', meaning: 'The length of the segment joining two points. It is never negative.' },
    { term: 'horizontal change ($\\Delta x$)', meaning: 'How far you move left or right from one point to the other: $x_2 - x_1$.' },
    { term: 'vertical change ($\\Delta y$)', meaning: 'How far you move up or down from one point to the other: $y_2 - y_1$.' },
    { term: 'hypotenuse', meaning: 'The longest side of a right triangle, across from the right angle.' },
    { term: 'distance formula', meaning: '$d = \\sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2}$, the distance between $(x_1, y_1)$ and $(x_2, y_2)$.' },
    { term: 'simplest radical form', meaning: 'A square root with no perfect-square factor left inside, like $2\\sqrt{10}$ instead of $\\sqrt{40}$.' },
  ],
  instruction: [
    { t: 'p', text: '### Straight across or straight up: just count' },
    { t: 'p', text: 'When two points share a $y$-coordinate, the segment is **horizontal** and its length is the difference of the $x$-coordinates. When they share an $x$-coordinate, the segment is **vertical** and its length is the difference of the $y$-coordinates. Use absolute value so the distance is never negative.' },
    { t: 'math', tex: '(-3, 2) \\text{ to } (5, 2): \\; |5 - (-3)| = 8 \\qquad\\qquad (4, -1) \\text{ to } (4, 6): \\; |6 - (-1)| = 7' },
    {
      t: 'graph',
      caption: 'A horizontal segment of length 8 and a vertical segment of length 7. You can count the grid squares.',
      spec: {
        xMin: -5, xMax: 9, yMin: -3, yMax: 8, xStep: 1, yStep: 1,
        points: [
          { x: -3, y: 2, label: '(-3, 2)' },
          { x: 5, y: 2, label: '(5, 2)' },
          { x: 4, y: -1, label: '(4, -1)' },
          { x: 4, y: 6, label: '(4, 6)' },
        ],
        segments: [
          { x1: -3, y1: 2, x2: 5, y2: 2 },
          { x1: 4, y1: -1, x2: 4, y2: 6 },
        ],
        ariaLabel: 'A horizontal segment from (-3, 2) to (5, 2) and a vertical segment from (4, -1) to (4, 6).',
      },
    },
    { t: 'p', text: '### A slanted segment is the hypotenuse of a right triangle' },
    { t: 'p', text: 'You cannot count squares along a slanted segment. Instead, draw a right triangle under it: one leg goes straight across and one leg goes straight up. From $A(1, 1)$ to $B(4, 5)$, the horizontal leg is $4 - 1 = 3$ and the vertical leg is $5 - 1 = 4$.' },
    {
      t: 'graph',
      caption: 'Segment AB is the hypotenuse. The legs are 3 (across) and 4 (up), so AB = 5.',
      spec: {
        xMin: -1, xMax: 8, yMin: -1, yMax: 7, xStep: 1, yStep: 1,
        points: [
          { x: 1, y: 1, label: 'A(1, 1)' },
          { x: 4, y: 5, label: 'B(4, 5)' },
          { x: 4, y: 1, label: 'C(4, 1)' },
        ],
        segments: [
          { x1: 1, y1: 1, x2: 4, y2: 5 },
          { x1: 1, y1: 1, x2: 4, y2: 1, dashed: true },
          { x1: 4, y1: 1, x2: 4, y2: 5, dashed: true },
        ],
        ariaLabel: 'Points A(1, 1), B(4, 5) and C(4, 1). Segment AB with dashed legs AC (length 3) and CB (length 4).',
      },
    },
    { t: 'math', tex: 'AB^2 = 3^2 + 4^2 = 9 + 16 = 25 \\quad\\Rightarrow\\quad AB = \\sqrt{25} = 5' },
    { t: 'p', text: '### The distance formula' },
    { t: 'p', text: 'Do the same thing with letters. The legs are $x_2 - x_1$ and $y_2 - y_1$, so the Pythagorean theorem becomes the **distance formula**:' },
    { t: 'math', tex: 'd = \\sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2}' },
    { t: 'p', text: 'Example: from $(1, 2)$ to $(7, 4)$.' },
    { t: 'math', tex: 'd = \\sqrt{(7 - 1)^2 + (4 - 2)^2} = \\sqrt{36 + 4} = \\sqrt{40} = \\sqrt{4 \\cdot 10} = 2\\sqrt{10} \\approx 6.3' },
    { t: 'callout', variant: 'tip', title: 'Order does not matter', text: 'Going from $(7, 4)$ to $(1, 2)$ instead gives $(1 - 7)^2 + (2 - 4)^2 = (-6)^2 + (-2)^2 = 36 + 4 = 40$, the same thing. Squaring turns a negative change positive, so either point can be "point 1".' },
    { t: 'p', text: '### Exact or rounded?' },
    { t: 'p', text: 'An **exact** answer keeps the square root in simplest radical form: $2\\sqrt{10}$. A **decimal** answer is an approximation: $2\\sqrt{10} \\approx 6.3$ to the nearest tenth. Give the exact form unless the problem says to round.' },
    { t: 'callout', variant: 'warning', title: 'The square root does not split over a sum', text: '$\\sqrt{36 + 64}$ is $\\sqrt{100} = 10$, **not** $\\sqrt{36} + \\sqrt{64} = 6 + 8 = 14$. Add the squares first, then take one square root.' },
    { t: 'p', text: '### Which point is closer?' },
    { t: 'p', text: 'To compare two distances you do not need the square roots: the bigger $d^2$ is the bigger distance. Is $P(1, 2)$ closer to $A(4, 6)$ or to $B(-2, -3)$?' },
    { t: 'math', tex: 'PA^2 = 3^2 + 4^2 = 25 \\qquad\\qquad PB^2 = (-3)^2 + (-5)^2 = 9 + 25 = 34' },
    { t: 'p', text: 'Since $25 < 34$, $A$ is closer ($PA = 5$, $PB = \\sqrt{34} \\approx 5.8$).' },
    { t: 'callout', variant: 'realworld', title: 'Where this shows up', text: 'A phone map that says a store is "0.6 miles away" is often giving the straight-line distance between two points, the distance formula on a map grid. Video games use the same formula to decide whether a character is close enough to pick something up.' },
  ],
  examples: [
    {
      title: 'A distance that comes out whole',
      kind: 'introductory',
      problem: [
        { t: 'p', text: 'Find the distance between $(-2, 1)$ and $(4, 9)$.' },
        {
          t: 'graph',
          spec: {
            xMin: -4, xMax: 8, yMin: -1, yMax: 11, xStep: 1, yStep: 1,
            points: [
              { x: -2, y: 1, label: '(-2, 1)' },
              { x: 4, y: 9, label: '(4, 9)' },
            ],
            segments: [
              { x1: -2, y1: 1, x2: 4, y2: 9 },
              { x1: -2, y1: 1, x2: 4, y2: 1, dashed: true },
              { x1: 4, y1: 1, x2: 4, y2: 9, dashed: true },
            ],
            ariaLabel: 'Segment from (-2, 1) to (4, 9) with dashed legs across to (4, 1) and up to (4, 9).',
          },
        },
      ],
      steps: [
        { text: 'Find the horizontal change.', tex: 'x_2 - x_1 = 4 - (-2) = 6', why: 'Subtracting a negative is adding: from $-2$ to $4$ is $6$ steps right, and you can count $6$ squares on the dashed leg.' },
        { text: 'Find the vertical change.', tex: 'y_2 - y_1 = 9 - 1 = 8', why: 'From $y = 1$ up to $y = 9$ is $8$ squares.' },
        { text: 'Square, add and take the square root.', tex: 'd = \\sqrt{6^2 + 8^2} = \\sqrt{36 + 64} = \\sqrt{100} = 10', why: 'The changes are the legs of a right triangle, and the segment is its hypotenuse (Pythagorean theorem).' },
      ],
      answer: 'The distance is $10$ units.',
    },
    {
      title: 'An answer in simplest radical form',
      kind: 'intermediate',
      problem: [{ t: 'p', text: 'Find the exact distance between $(-3, 4)$ and $(2, -1)$. Then round it to the nearest tenth.' }],
      steps: [
        { text: 'Substitute into the distance formula.', tex: 'd = \\sqrt{(2 - (-3))^2 + (-1 - 4)^2}', why: 'Use $(x_1, y_1) = (-3, 4)$ and $(x_2, y_2) = (2, -1)$. Parentheses keep the negative signs straight.' },
        { text: 'Simplify the changes and square them.', tex: '= \\sqrt{5^2 + (-5)^2} = \\sqrt{25 + 25} = \\sqrt{50}', why: '$(-5)^2 = 25$: squaring makes the downward change positive.' },
        { text: 'Write the root in simplest radical form.', tex: '\\sqrt{50} = \\sqrt{25 \\cdot 2} = 5\\sqrt{2}', why: '$25$ is the largest perfect square that divides $50$, and $\\sqrt{25} = 5$.' },
        { text: 'Round only at the end.', tex: '5\\sqrt{2} \\approx 5(1.414) \\approx 7.1', why: 'Rounding is a last step. The exact answer is $5\\sqrt{2}$.' },
      ],
      answer: '$d = 5\\sqrt{2} \\approx 7.1$ units.',
    },
    {
      title: 'How far does the drone fly?',
      kind: 'real-world',
      problem: [
        { t: 'p', text: 'On a map of a park, each grid unit is $10$ meters. A drone takes off at the fountain $F(-4, -2)$ and flies in a straight line to the picnic shelter $S(2, 1)$. How far does it fly, to the nearest tenth of a meter?' },
        {
          t: 'graph',
          spec: {
            xMin: -6, xMax: 5, yMin: -4, yMax: 3, xStep: 1, yStep: 1, xLabel: 'x (1 unit = 10 m)', yLabel: 'y',
            points: [
              { x: -4, y: -2, label: 'F(-4, -2)' },
              { x: 2, y: 1, label: 'S(2, 1)' },
            ],
            segments: [{ x1: -4, y1: -2, x2: 2, y2: 1 }],
            ariaLabel: 'Fountain F at (-4, -2) and shelter S at (2, 1) joined by a straight segment.',
          },
        },
      ],
      steps: [
        { text: 'Find the distance in grid units.', tex: 'FS = \\sqrt{(2 - (-4))^2 + (1 - (-2))^2} = \\sqrt{6^2 + 3^2} = \\sqrt{45}', why: 'The drone flies along the hypotenuse of a right triangle with legs $6$ and $3$ units.' },
        { text: 'Simplify the radical.', tex: '\\sqrt{45} = \\sqrt{9 \\cdot 5} = 3\\sqrt{5} \\approx 6.708 \\text{ units}', why: 'Keep extra decimals for now because we still have to multiply.' },
        { text: 'Convert grid units to meters.', tex: '6.708 \\times 10 \\approx 67.1 \\text{ m}', why: 'Each grid unit is $10$ meters, so multiply the length by $10$. Rounding before multiplying ($6.7 \\times 10 = 67$) would lose accuracy.' },
      ],
      answer: 'The drone flies $30\\sqrt{5} \\approx 67.1$ meters. (Walking along the grid lines would be $6 + 3 = 9$ units, or $90$ meters.)',
    },
    {
      title: 'Taking the square root too early',
      kind: 'common-mistake',
      problem: [{ t: 'p', text: 'Jordan found the distance from $(-1, 3)$ to $(5, -5)$ like this: $\\sqrt{6^2 + (-8)^2} = 6 + 8 = 14$. What went wrong, and what is the correct distance?' }],
      steps: [
        { text: 'Check the changes first.', tex: '5 - (-1) = 6, \\qquad -5 - 3 = -8', why: 'Jordan got these right. (A common slip is writing $5 - 1 = 4$; subtracting $-1$ means adding $1$.)' },
        { text: 'Find the mistake.', tex: '\\sqrt{6^2 + 8^2} \\neq 6 + 8', why: 'A square root does not split over addition. As a check, $\\sqrt{9 + 16} = \\sqrt{25} = 5$, but $3 + 4 = 7$.' },
        { text: 'Add the squares, then take one square root.', tex: '\\sqrt{36 + 64} = \\sqrt{100} = 10', why: 'The Pythagorean theorem says the **squares** of the legs add up to the **square** of the hypotenuse.' },
        { text: 'Make sure the answer is reasonable.', tex: '8 < 10 < 6 + 8', why: 'The hypotenuse must be longer than either leg but shorter than walking along both legs. $14$ equals the walk along both legs, so it cannot be the straight-line distance.' },
      ],
      answer: 'Jordan took square roots of each term. The correct distance is $10$ units.',
    },
    {
      title: 'Finding a missing coordinate',
      kind: 'challenging',
      problem: [
        { t: 'p', text: 'The point $(x, 5)$ is $10$ units from $(2, -1)$. Find every possible value of $x$.' },
        {
          t: 'graph',
          spec: {
            xMin: -7, xMax: 14, yMin: -3, yMax: 7, xStep: 1, yStep: 1,
            points: [
              { x: 2, y: -1, label: '(2, -1)' },
              { x: -6, y: 5, label: '(-6, 5)' },
              { x: 10, y: 5, label: '(10, 5)' },
            ],
            segments: [
              { x1: 2, y1: -1, x2: -6, y2: 5 },
              { x1: 2, y1: -1, x2: 10, y2: 5 },
              { x1: -6, y1: 5, x2: 10, y2: 5, dashed: true },
            ],
            ariaLabel: 'The point (2, -1) joined to (-6, 5) and to (10, 5). Both segments have length 10. A dashed line y = 5 holds both answers.',
          },
        },
      ],
      steps: [
        { text: 'Write the distance formula with the unknown.', tex: '\\sqrt{(x - 2)^2 + (5 - (-1))^2} = 10', why: 'The distance between the two points must equal $10$.' },
        { text: 'Square both sides and simplify.', tex: '(x - 2)^2 + 36 = 100 \\quad\\Rightarrow\\quad (x - 2)^2 = 64', why: 'Squaring both sides removes the square root. The vertical change is $6$, and $6^2 = 36$.' },
        { text: 'Take the square root of both sides.', tex: 'x - 2 = 8 \\quad \\text{or} \\quad x - 2 = -8', why: 'Both $8^2$ and $(-8)^2$ equal $64$, so there are two possibilities: $8$ to the right of $x = 2$, or $8$ to the left.' },
        { text: 'Solve and check.', tex: 'x = 10 \\quad \\text{or} \\quad x = -6', why: 'Check: $(10 - 2)^2 + 6^2 = 64 + 36 = 100$ and $(-6 - 2)^2 + 6^2 = 64 + 36 = 100$. Both are $10$ units away, as the graph shows.' },
      ],
      answer: '$x = 10$ or $x = -6$.',
    },
  ],
  teachMeAgain: [
    {
      approach: 'visual',
      title: 'Draw the triangle, see the formula',
      blocks: [
        { t: 'p', text: 'Every slanted segment on a grid has a right triangle hiding under it. Here is the segment from $(-1, -2)$ to $(3, 1)$ with its legs drawn in.' },
        {
          t: 'graph',
          spec: {
            xMin: -3, xMax: 7, yMin: -4, yMax: 3, xStep: 1, yStep: 1,
            points: [
              { x: -1, y: -2, label: '(-1, -2)' },
              { x: 3, y: 1, label: '(3, 1)' },
              { x: 3, y: -2, label: '(3, -2)' },
            ],
            segments: [
              { x1: -1, y1: -2, x2: 3, y2: 1 },
              { x1: -1, y1: -2, x2: 3, y2: -2, dashed: true },
              { x1: 3, y1: -2, x2: 3, y2: 1, dashed: true },
            ],
            ariaLabel: 'Segment from (-1, -2) to (3, 1) with a dashed horizontal leg of 4 to (3, -2) and a dashed vertical leg of 3 up to (3, 1).',
          },
        },
        { t: 'p', text: 'Count the legs: $4$ across and $3$ up. Then $4^2 + 3^2 = 16 + 9 = 25$, so the slanted segment is $\\sqrt{25} = 5$. The distance formula just does that counting with subtraction: $3 - (-1) = 4$ and $1 - (-2) = 3$.' },
      ],
    },
    {
      approach: 'simpler-example',
      title: 'Start at the origin',
      blocks: [
        { t: 'p', text: 'From $(0, 0)$ to $(3, 4)$: go $3$ right and $4$ up, so $d = \\sqrt{3^2 + 4^2} = \\sqrt{25} = 5$.' },
        { t: 'p', text: 'From $(0, 0)$ to $(1, 1)$: go $1$ right and $1$ up, so $d = \\sqrt{1^2 + 1^2} = \\sqrt{2} \\approx 1.4$. Most distances are not whole numbers, and that is fine: $\\sqrt{2}$ is the exact answer.' },
        { t: 'p', text: 'When neither point is the origin, the only new job is finding "how far right" and "how far up" by subtracting.' },
      ],
    },
    {
      approach: 'analogy',
      title: 'Cutting across the field',
      blocks: [
        { t: 'p', text: 'Picture a rectangular soccer field. To get from one corner to the opposite corner you could walk along two sidelines, or you could cut straight across. Cutting across is shorter, and it is the hypotenuse of the right triangle the two sidelines make.' },
        { t: 'p', text: 'The coordinate grid is the field. $\\Delta x$ is one sideline, $\\Delta y$ is the other, and the distance formula tells you the length of the shortcut. That is why the distance is always **less than** $|\\Delta x| + |\\Delta y|$ (unless the segment is horizontal or vertical).' },
      ],
    },
    {
      approach: 'prerequisite',
      title: 'Refresher: simplest radical form',
      blocks: [
        { t: 'p', text: 'To simplify $\\sqrt{n}$, find the **largest perfect square** that divides $n$ and take its root out front.' },
        {
          t: 'table',
          headers: ['Root', 'Largest perfect-square factor', 'Simplest form'],
          rows: [
            ['$\\sqrt{40}$', '$4$ ($40 = 4 \\cdot 10$)', '$2\\sqrt{10}$'],
            ['$\\sqrt{45}$', '$9$ ($45 = 9 \\cdot 5$)', '$3\\sqrt{5}$'],
            ['$\\sqrt{50}$', '$25$ ($50 = 25 \\cdot 2$)', '$5\\sqrt{2}$'],
            ['$\\sqrt{72}$', '$36$ ($72 = 36 \\cdot 2$)', '$6\\sqrt{2}$'],
            ['$\\sqrt{20}$', '$4$ ($20 = 4 \\cdot 5$)', '$2\\sqrt{5}$'],
          ],
        },
        { t: 'p', text: 'If you use a smaller square, keep going: $\\sqrt{72} = 3\\sqrt{8}$ is not finished, because $8 = 4 \\cdot 2$ still has a square inside. $3\\sqrt{8} = 3 \\cdot 2\\sqrt{2} = 6\\sqrt{2}$.' },
      ],
    },
    {
      approach: 'step-by-step',
      title: 'A five-step routine',
      blocks: [
        { t: 'list', ordered: true, items: [
          '**Label** the points $(x_1, y_1)$ and $(x_2, y_2)$. Either order works.',
          '**Subtract** to get $\\Delta x = x_2 - x_1$ and $\\Delta y = y_2 - y_1$. Use parentheses around negatives.',
          '**Square** each change. Both results are now positive.',
          '**Add** the squares and take **one** square root.',
          '**Simplify** the radical, and round only if the problem asks.',
        ] },
        { t: 'p', text: 'Try it on $(2, -3)$ and $(-4, 5)$: $\\Delta x = -4 - 2 = -6$, $\\Delta y = 5 - (-3) = 8$, $36 + 64 = 100$, so $d = 10$.' },
      ],
    },
    {
      approach: 'alternate-strategy',
      title: 'Skip the formula: count the legs',
      blocks: [
        { t: 'p', text: 'If you can sketch the points, you never have to memorize the formula. Plot them, draw the right triangle, count the legs, and use $a^2 + b^2 = c^2$.' },
        {
          t: 'graph',
          spec: {
            xMin: -4, xMax: 8, yMin: -3, yMax: 5, xStep: 1, yStep: 1,
            points: [
              { x: -2, y: -1, label: '(-2, -1)' },
              { x: 4, y: 3, label: '(4, 3)' },
            ],
            segments: [
              { x1: -2, y1: -1, x2: 4, y2: 3 },
              { x1: -2, y1: -1, x2: 4, y2: -1, dashed: true },
              { x1: 4, y1: -1, x2: 4, y2: 3, dashed: true },
            ],
            ariaLabel: 'Segment from (-2, -1) to (4, 3) with a dashed horizontal leg of 6 and a dashed vertical leg of 4.',
          },
        },
        { t: 'p', text: 'The legs are $6$ and $4$, so $c^2 = 36 + 16 = 52$ and $c = \\sqrt{52} = \\sqrt{4 \\cdot 13} = 2\\sqrt{13} \\approx 7.2$. Counting and subtracting always give the same legs, so both methods agree.' },
      ],
    },
  ],
  guided: [
    { generator: 'u8.distance', difficulty: 1 },
    { generator: 'u8.distance', difficulty: 1 },
    { generator: 'u8.distance', difficulty: 2 },
    { generator: 'u8.distance', difficulty: 3 },
  ],
  independent: {
    count: 8,
    reviewCount: 2,
    mix: [
      { generator: 'u8.distance', difficulty: 1, weight: 2 },
      { generator: 'u8.distance', difficulty: 2, weight: 3 },
      { generator: 'u8.distance', difficulty: 3, weight: 3 },
    ],
  },
  quiz: {
    items: [
      { generator: 'u8.distance', difficulty: 1 },
      { generator: 'u8.distance', difficulty: 2 },
      { generator: 'u8.distance', difficulty: 2 },
      { generator: 'u8.distance', difficulty: 2 },
      { generator: 'u8.distance', difficulty: 3 },
      { generator: 'u8.distance', difficulty: 3 },
    ],
  },
  summary: [
    'A horizontal or vertical distance is the difference of the coordinates that change: $|x_2 - x_1|$ or $|y_2 - y_1|$.',
    'A slanted segment is the hypotenuse of a right triangle with legs $\\Delta x$ and $\\Delta y$, which gives $d = \\sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2}$. The order of the points does not matter.',
    'Add the squares first, then take one square root: $\\sqrt{36 + 64} = 10$, not $6 + 8$.',
    'Give exact answers in simplest radical form ($\\sqrt{40} = 2\\sqrt{10}$) and round to the nearest tenth only when asked ($2\\sqrt{10} \\approx 6.3$).',
    'To find a missing coordinate, set the distance formula equal to the distance, square both sides, and remember the $\\pm$: $(x - 2)^2 = 64$ gives $x = 10$ or $x = -6$.',
  ],
  mastery: { quizPassScore: 0.8, practiceMinCorrect: 5 },
};
