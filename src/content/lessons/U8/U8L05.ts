import type { LessonContent } from '../../../core/curriculum/types';

/**
 * U8L05 Classifying Figures with Coordinates (A.GSR.3.1, A.GSR.3.2, A.MP.3)
 * Using slope (parallel: equal slopes; perpendicular: product -1) and distance (equal sides) as evidence to
 * classify triangles (right or not; scalene or isosceles, since lattice-point triangles are never equilateral)
 * and quadrilaterals by their most specific name (square, rectangle, rhombus, parallelogram, trapezoid); which
 * evidence proves which name; a rhombus is not a square without a right angle; the diagonal (midpoint) test as a
 * second method; the fourth vertex D = A + C - B that makes ABCD a parallelogram (S8.05). Reviews slopes of
 * parallel and perpendicular lines (S8.03) and the distance formula (S8.01).
 *
 * Math verified by hand (2026-10-08): triangle A(1, 1), B(4, 5), C(8, 2): slopes AB 4/3, BC -3/4, AC 1/7,
 * (4/3)(-3/4) = -1, AB = BC = 5, AC = sqrt(50) = 5sqrt(2), 25 + 25 = 50 (isosceles right triangle);
 * J(1, 2), K(3, 6), L(9, 3): slopes JK 2, KL -1/2, JL 1/8, JK = sqrt(20) = 2sqrt(5), KL = sqrt(45) = 3sqrt(5),
 * JL = sqrt(65), 20 + 45 = 65 (scalene right triangle, right angle at K); rectangle A(1, 3), B(3, 1), C(8, 6),
 * D(6, 8): slopes -1, 1, -1, 1, AB = CD = sqrt(8) = 2sqrt(2), BC = DA = sqrt(50) = 5sqrt(2); square cones
 * P(2, 1), Q(6, 2), R(5, 6), S(1, 5): sides (4, 1), (-1, 4), (-4, -1), (1, -4), all sqrt(17), slopes 1/4, -4,
 * (1/4)(-4) = -1, diagonals PR = QS = sqrt(34); rhombus A(1, 1), B(4, 2), C(5, 5), D(2, 4): all sides sqrt(10),
 * slopes 1/3 and 3 (product 1, not -1), diagonals AC = sqrt(32) = 4sqrt(2) slope 1 and BD = sqrt(8) = 2sqrt(2)
 * slope -1, both midpoints (3, 3); trapezoid (1, 1), (9, 1), (7, 4), (3, 4): slopes 0, -3/2, 0, 3/2;
 * parallelogram A(1, 2), B(5, 1), C(7, 5): D = (1 + 7 - 5, 2 + 5 - 1) = (3, 6), AB = DC = (4, -1),
 * BC = AD = (2, 4), slopes -1/4 and 2 (product -1/2), AB = sqrt(17), BC = sqrt(20) = 2sqrt(5), diagonal
 * midpoints (4, 3.5) and (4, 3.5), the wrong D = B + C - A = (11, 4); rectangle (1, 1), (6, 1), (6, 4), (1, 4):
 * sides 5 and 3; square E(8, 2), F(11, 3), G(10, 6), H(7, 5): sides (3, 1), (-1, 3), (-3, -1), (1, -3), all
 * sqrt(10), slopes 1/3 and -3 (product -1).
 */
export const U8L05: LessonContent = {
  lessonId: 'U8L05',
  goal: 'Use slopes and distances as evidence to classify a triangle (right or not, scalene or isosceles) and a quadrilateral by its most specific name (square, rectangle, rhombus, parallelogram or trapezoid), and find the fourth vertex that makes a parallelogram.',
  needToKnow: [
    { t: 'p', text: 'Classifying a figure means **proving** what it is, and the proof uses three tools from this unit:' },
    {
      t: 'list',
      items: [
        '**Slope:** $m = \\frac{y_2 - y_1}{x_2 - x_1}$. From $(1, 1)$ to $(4, 5)$ the slope is $\\frac{4}{3}$.',
        '**Parallel and perpendicular:** parallel sides have **equal** slopes. Perpendicular sides have slopes that are **opposite reciprocals**, so their product is $-1$: $\\frac{4}{3} \\cdot \\left(-\\frac{3}{4}\\right) = -1$. A horizontal side (slope $0$) is perpendicular to a vertical side (undefined slope).',
        '**Distance:** $d = \\sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2}$. From $(1, 1)$ to $(4, 5)$ the distance is $\\sqrt{9 + 16} = 5$.',
      ],
    },
    { t: 'callout', variant: 'tip', title: 'Quick check', text: 'Are slopes $2$ and $-\\frac{1}{2}$ perpendicular? (Yes: $2 \\cdot \\left(-\\frac{1}{2}\\right) = -1$.) What is the distance from $(0, 0)$ to $(1, 3)$? ($\\sqrt{1 + 9} = \\sqrt{10}$.) If either felt shaky, open **Teach Me Again** and choose the refresher.' },
  ],
  vocabulary: [
    { term: 'scalene triangle', meaning: 'A triangle with no two sides the same length.' },
    { term: 'isosceles triangle', meaning: 'A triangle with at least two sides the same length.' },
    { term: 'equilateral triangle', meaning: 'A triangle with all three sides the same length. (A triangle whose corners all have whole-number coordinates can never be equilateral.)' },
    { term: 'right triangle', meaning: 'A triangle with one right ($90^\\circ$) angle: two of its sides are perpendicular.' },
    { term: 'parallelogram', meaning: 'A quadrilateral with **both** pairs of opposite sides parallel.' },
    { term: 'rectangle', meaning: 'A parallelogram with four right angles.' },
    { term: 'rhombus', meaning: 'A parallelogram with four sides of equal length.' },
    { term: 'square', meaning: 'A parallelogram with four right angles **and** four equal sides. It is a rectangle and a rhombus at the same time.' },
    { term: 'trapezoid', meaning: 'A quadrilateral with **exactly one** pair of parallel sides.' },
    { term: 'most specific name', meaning: 'The name that tells the most. A square is also a rectangle, a rhombus and a parallelogram, but "square" is its most specific name.' },
  ],
  instruction: [
    { t: 'p', text: '### Evidence, not eyesight' },
    { t: 'p', text: 'A shape can **look** like a square and be slightly off. In coordinate geometry you prove what a figure is with numbers: **slopes** tell you which sides are parallel or perpendicular, and **distances** tell you which sides are equal. Name each figure with vertices in order around it: quadrilateral $ABCD$ has sides $AB$, $BC$, $CD$ and $DA$, and diagonals $AC$ and $BD$.' },
    { t: 'p', text: '### Classifying a triangle' },
    { t: 'p', text: 'A triangle is classified two ways. **By its sides:** compare the three lengths (scalene: all different; isosceles: at least two equal). **By its angles:** it is a **right triangle** if two of its sides are perpendicular. Take $A(1, 1)$, $B(4, 5)$ and $C(8, 2)$.' },
    {
      t: 'graph',
      caption: 'Triangle ABC. Sides AB and BC meet at a right angle at B.',
      spec: {
        xMin: -2, xMax: 12, yMin: -1, yMax: 10,
        segments: [
          { x1: 1, y1: 1, x2: 4, y2: 5, color: '#3557d4' },
          { x1: 4, y1: 5, x2: 8, y2: 2, color: '#d4572f' },
          { x1: 8, y1: 2, x2: 1, y2: 1, color: '#1f8a5b' },
        ],
        points: [
          { x: 1, y: 1, label: 'A(1, 1)' },
          { x: 4, y: 5, label: 'B(4, 5)' },
          { x: 8, y: 2, label: 'C(8, 2)' },
        ],
        ariaLabel: 'Triangle with vertices A(1, 1), B(4, 5) and C(8, 2). The sides from A to B and from B to C meet at B.',
      },
    },
    { t: 'table', headers: ['Side', 'Slope', 'Length'], rows: [
      ['$AB$', '$\\frac{5 - 1}{4 - 1} = \\frac{4}{3}$', '$\\sqrt{3^2 + 4^2} = 5$'],
      ['$BC$', '$\\frac{2 - 5}{8 - 4} = -\\frac{3}{4}$', '$\\sqrt{4^2 + 3^2} = 5$'],
      ['$AC$', '$\\frac{2 - 1}{8 - 1} = \\frac{1}{7}$', '$\\sqrt{7^2 + 1^2} = \\sqrt{50} = 5\\sqrt{2}$'],
    ], caption: 'Slopes and lengths of the sides of triangle ABC.' },
    { t: 'p', text: '$\\frac{4}{3} \\cdot \\left(-\\frac{3}{4}\\right) = -1$, so $AB \\perp BC$ and the right angle is at $B$. Two sides have length $5$, so the triangle is **isosceles**. Together: $\\triangle ABC$ is an **isosceles right triangle**.' },
    { t: 'callout', variant: 'why', title: 'A second way to check the right angle', text: 'The converse of the Pythagorean theorem says: if the two shorter sides squared add up to the longest side squared, the triangle is a right triangle. Here $5^2 + 5^2 = 25 + 25 = 50 = (\\sqrt{50})^2$. Both methods agree, as they always will.' },
    { t: 'p', text: '### The quadrilateral family' },
    { t: 'p', text: 'Parallelograms, rectangles, rhombuses and squares are one family: a rectangle and a rhombus are each special parallelograms, and a square is both. A trapezoid is separate: it has exactly one pair of parallel sides, so it is never a parallelogram. Always give the **most specific** name your evidence proves.' },
    { t: 'table', headers: ['Name', 'What you must prove', 'Evidence from coordinates'], rows: [
      ['Trapezoid', 'Exactly one pair of opposite sides parallel', 'One pair of opposite sides has equal slopes; the other pair does not'],
      ['Parallelogram', 'Both pairs of opposite sides parallel', '$AB$ and $CD$ have equal slopes, and $BC$ and $DA$ have equal slopes'],
      ['Rectangle', 'Parallelogram with right angles', 'Parallelogram, and adjacent sides have slopes with product $-1$ (sides not all equal)'],
      ['Rhombus', 'Parallelogram with four equal sides', 'All four side lengths equal, and no right angle'],
      ['Square', 'Rectangle and rhombus', 'All four side lengths equal **and** adjacent sides perpendicular'],
    ], caption: 'How to prove each name. Check from the top down, then go as far as the evidence lets you.' },
    { t: 'callout', variant: 'warning', title: 'Equal sides are not enough for a square', text: 'Four equal sides prove a **rhombus**. A rhombus is a square only if it also has a right angle, so you must check slopes too. In the same way, right angles alone prove a rectangle, and you need equal sides to upgrade it to a square.' },
    { t: 'p', text: 'Here is a trapezoid. The top and bottom are parallel (both slope $0$), but the left and right sides have slopes $\\frac{3}{2}$ and $-\\frac{3}{2}$, which are not equal. Exactly one pair is parallel.' },
    {
      t: 'graph',
      caption: 'Trapezoid ABCD: AB and DC are horizontal, so they are parallel; BC and AD are not.',
      spec: {
        xMin: -1, xMax: 11, yMin: -1, yMax: 6,
        segments: [
          { x1: 1, y1: 1, x2: 9, y2: 1, color: '#3557d4' },
          { x1: 9, y1: 1, x2: 7, y2: 4, color: '#d4572f' },
          { x1: 7, y1: 4, x2: 3, y2: 4, color: '#3557d4' },
          { x1: 3, y1: 4, x2: 1, y2: 1, color: '#d4572f' },
        ],
        points: [
          { x: 1, y: 1, label: 'A(1, 1)' },
          { x: 9, y: 1, label: 'B(9, 1)' },
          { x: 7, y: 4, label: 'C(7, 4)' },
          { x: 3, y: 4, label: 'D(3, 4)' },
        ],
        ariaLabel: 'Trapezoid with vertices A(1, 1), B(9, 1), C(7, 4) and D(3, 4). The bottom side AB and the top side DC are horizontal.',
      },
    },
    { t: 'p', text: '### Building a parallelogram' },
    { t: 'p', text: 'If you know three vertices $A$, $B$ and $C$ of parallelogram $ABCD$, the fourth is found with one move. In a parallelogram, side $DC$ is a copy of side $AB$, so **the step from $B$ to $A$ is the same as the step from $C$ to $D$**. (Side $AD$ is also a copy of side $BC$, so the step from $B$ to $C$, taken from $A$, lands on the same $D$.)' },
    { t: 'math', tex: 'D = (x_A + x_C - x_B, \\; y_A + y_C - y_B)' },
    { t: 'callout', variant: 'realworld', title: 'Where this shows up', text: 'Builders check that a frame is "square" (has right angles) by measuring its diagonals, and surveyors mark property corners with coordinates. A deck, a patio or a soccer field is only a true rectangle if the numbers say so.' },
  ],
  examples: [
    {
      title: 'Is it a right triangle?',
      kind: 'introductory',
      problem: [
        { t: 'p', text: 'Triangle $JKL$ has vertices $J(1, 2)$, $K(3, 6)$ and $L(9, 3)$. Is it a right triangle? Is it scalene or isosceles?' },
        {
          t: 'graph',
          spec: {
            xMin: -2, xMax: 12, yMin: -1, yMax: 10,
            segments: [
              { x1: 1, y1: 2, x2: 3, y2: 6 },
              { x1: 3, y1: 6, x2: 9, y2: 3 },
              { x1: 9, y1: 3, x2: 1, y2: 2 },
            ],
            points: [
              { x: 1, y: 2, label: 'J(1, 2)' },
              { x: 3, y: 6, label: 'K(3, 6)' },
              { x: 9, y: 3, label: 'L(9, 3)' },
            ],
            ariaLabel: 'Triangle with vertices J(1, 2), K(3, 6) and L(9, 3).',
          },
        },
      ],
      steps: [
        { text: 'Find the slope of every side.', tex: 'm_{JK} = \\frac{6 - 2}{3 - 1} = 2, \\quad m_{KL} = \\frac{3 - 6}{9 - 3} = -\\frac{1}{2}, \\quad m_{JL} = \\frac{3 - 2}{9 - 1} = \\frac{1}{8}', why: 'A right angle is where two perpendicular sides meet, and slopes tell us which sides are perpendicular.' },
        { text: 'Look for a pair with product $-1$.', tex: '2 \\cdot \\left(-\\frac{1}{2}\\right) = -1', why: '$JK$ and $KL$ are perpendicular, so the right angle is at $K$, the vertex they share.' },
        { text: 'Find the side lengths.', tex: 'JK = \\sqrt{2^2 + 4^2} = \\sqrt{20} = 2\\sqrt{5}, \\quad KL = \\sqrt{6^2 + 3^2} = \\sqrt{45} = 3\\sqrt{5}, \\quad JL = \\sqrt{8^2 + 1^2} = \\sqrt{65}', why: 'Classifying by sides means comparing all three lengths.' },
        { text: 'Check with the Pythagorean theorem.', tex: '20 + 45 = 65 \\; \\checkmark', why: 'The squares of the two legs add to the square of the longest side, which confirms the right angle.' },
      ],
      answer: 'Yes. $JK \\perp KL$ (slopes $2$ and $-\\frac{1}{2}$), so it is a right triangle with the right angle at $K$. All three sides are different, so it is a **scalene right triangle**.',
    },
    {
      title: 'A tilted rectangle',
      kind: 'intermediate',
      problem: [
        { t: 'p', text: 'Give the most specific name for quadrilateral $ABCD$ with $A(1, 3)$, $B(3, 1)$, $C(8, 6)$ and $D(6, 8)$.' },
        {
          t: 'graph',
          spec: {
            xMin: -2, xMax: 12, yMin: -1, yMax: 10,
            segments: [
              { x1: 1, y1: 3, x2: 3, y2: 1 },
              { x1: 3, y1: 1, x2: 8, y2: 6 },
              { x1: 8, y1: 6, x2: 6, y2: 8 },
              { x1: 6, y1: 8, x2: 1, y2: 3 },
            ],
            points: [
              { x: 1, y: 3, label: 'A(1, 3)' },
              { x: 3, y: 1, label: 'B(3, 1)' },
              { x: 8, y: 6, label: 'C(8, 6)' },
              { x: 6, y: 8, label: 'D(6, 8)' },
            ],
            ariaLabel: 'Quadrilateral with vertices A(1, 3), B(3, 1), C(8, 6) and D(6, 8), tilted on the grid.',
          },
        },
      ],
      steps: [
        { text: 'Find the slopes of the four sides.', tex: 'm_{AB} = \\frac{1 - 3}{3 - 1} = -1, \\quad m_{BC} = \\frac{6 - 1}{8 - 3} = 1, \\quad m_{CD} = \\frac{8 - 6}{6 - 8} = -1, \\quad m_{DA} = \\frac{3 - 8}{1 - 6} = 1', why: 'Slopes answer two questions at once: which sides are parallel, and which are perpendicular.' },
        { text: 'Check opposite sides.', tex: 'm_{AB} = m_{CD} = -1, \\qquad m_{BC} = m_{DA} = 1', why: 'Both pairs of opposite sides are parallel, so $ABCD$ is at least a parallelogram.' },
        { text: 'Check adjacent sides.', tex: '(-1)(1) = -1', why: 'Adjacent sides are perpendicular, so every angle is a right angle: $ABCD$ is at least a rectangle.' },
        { text: 'Compare adjacent side lengths.', tex: 'AB = \\sqrt{2^2 + 2^2} = \\sqrt{8} = 2\\sqrt{2}, \\qquad BC = \\sqrt{5^2 + 5^2} = \\sqrt{50} = 5\\sqrt{2}', why: 'A rectangle is a square only if its sides are all equal. $2\\sqrt{2} \\ne 5\\sqrt{2}$, so it is not a square.' },
      ],
      answer: '$ABCD$ is a **rectangle** (not a square): opposite sides are parallel, adjacent sides are perpendicular, and $AB = 2\\sqrt{2}$ while $BC = 5\\sqrt{2}$.',
    },
    {
      title: 'Did the coach set up a square?',
      kind: 'real-world',
      problem: [
        { t: 'p', text: 'A soccer coach puts cones on a grid where $1$ unit $= 1$ yard, at $P(2, 1)$, $Q(6, 2)$, $R(5, 6)$ and $S(1, 5)$, for a passing drill that needs a square. Is $PQRS$ a square?' },
        {
          t: 'graph',
          spec: {
            xMin: -1, xMax: 9, yMin: -1, yMax: 7,
            xLabel: 'yards', yLabel: 'yards',
            segments: [
              { x1: 2, y1: 1, x2: 6, y2: 2 },
              { x1: 6, y1: 2, x2: 5, y2: 6 },
              { x1: 5, y1: 6, x2: 1, y2: 5 },
              { x1: 1, y1: 5, x2: 2, y2: 1 },
            ],
            points: [
              { x: 2, y: 1, label: 'P(2, 1)' },
              { x: 6, y: 2, label: 'Q(6, 2)' },
              { x: 5, y: 6, label: 'R(5, 6)' },
              { x: 1, y: 5, label: 'S(1, 5)' },
            ],
            ariaLabel: 'Four cones at P(2, 1), Q(6, 2), R(5, 6) and S(1, 5), joined in order to make a tilted quadrilateral.',
          },
        },
      ],
      steps: [
        { text: 'Find the run and rise of each side.', tex: 'PQ: (4, 1), \\quad QR: (-1, 4), \\quad RS: (-4, -1), \\quad SP: (1, -4)', why: 'The run and rise give both the slope (rise over run) and the length (Pythagorean theorem) of each side.' },
        { text: 'Find the lengths.', tex: 'PQ = QR = RS = SP = \\sqrt{4^2 + 1^2} = \\sqrt{17} \\approx 4.1 \\text{ yd}', why: 'Every side has legs $4$ and $1$, so all four sides are equal: at least a rhombus.' },
        { text: 'Find the slopes of two adjacent sides.', tex: 'm_{PQ} = \\frac{1}{4}, \\quad m_{QR} = \\frac{4}{-1} = -4, \\quad \\frac{1}{4} \\cdot (-4) = -1', why: 'Equal sides alone could be a rhombus, so we need a right angle too. Opposite sides have the same run and rise (up to sign), so they have equal slopes, and every corner is a right angle.' },
      ],
      answer: 'Yes. All four sides are $\\sqrt{17}$ yards and adjacent sides are perpendicular (slopes $\\frac{1}{4}$ and $-4$), so $PQRS$ is a **square**.',
    },
    {
      title: 'Four equal sides, so a square?',
      kind: 'common-mistake',
      problem: [
        { t: 'p', text: 'For $A(1, 1)$, $B(4, 2)$, $C(5, 5)$ and $D(2, 4)$, Maya finds that all four sides have length $\\sqrt{10}$ and says "$ABCD$ is a square." Is she right?' },
        {
          t: 'graph',
          spec: {
            xMin: -1, xMax: 8, yMin: -1, yMax: 7,
            segments: [
              { x1: 1, y1: 1, x2: 4, y2: 2 },
              { x1: 4, y1: 2, x2: 5, y2: 5 },
              { x1: 5, y1: 5, x2: 2, y2: 4 },
              { x1: 2, y1: 4, x2: 1, y2: 1 },
            ],
            points: [
              { x: 1, y: 1, label: 'A' },
              { x: 4, y: 2, label: 'B' },
              { x: 5, y: 5, label: 'C' },
              { x: 2, y: 4, label: 'D' },
            ],
            ariaLabel: 'Quadrilateral with vertices A(1, 1), B(4, 2), C(5, 5) and D(2, 4). It leans like a diamond.',
          },
        },
      ],
      steps: [
        { text: 'Confirm her side lengths.', tex: 'AB = \\sqrt{3^2 + 1^2}, \\; BC = \\sqrt{1^2 + 3^2}, \\; CD = \\sqrt{3^2 + 1^2}, \\; DA = \\sqrt{1^2 + 3^2}, \\text{ all } \\sqrt{10}', why: 'Maya\'s lengths are correct, so $ABCD$ is a rhombus.' },
        { text: 'Check an angle with slopes.', tex: 'm_{AB} = \\frac{1}{3}, \\quad m_{BC} = \\frac{3}{1} = 3, \\quad \\frac{1}{3} \\cdot 3 = 1 \\ne -1', why: '$\\frac{1}{3}$ and $3$ are reciprocals but not **opposite** reciprocals, so $AB$ and $BC$ are not perpendicular. There is no right angle at $B$.' },
        { text: 'Name the mistake.', tex: '\\text{4 equal sides} \\Rightarrow \\text{rhombus}; \\quad \\text{rhombus} + \\text{right angle} \\Rightarrow \\text{square}', why: 'She proved only half of what a square needs. Without a right angle, the most specific name is rhombus.' },
      ],
      answer: 'No. The sides are all $\\sqrt{10}$, but adjacent slopes $\\frac{1}{3}$ and $3$ multiply to $1$, not $-1$, so there are no right angles. $ABCD$ is a **rhombus**, not a square.',
    },
    {
      title: 'Find the fourth vertex, then classify',
      kind: 'challenging',
      problem: [
        { t: 'p', text: 'Three vertices of parallelogram $ABCD$ are $A(1, 2)$, $B(5, 1)$ and $C(7, 5)$. Find $D$, then give the most specific name for $ABCD$.' },
        {
          t: 'graph',
          spec: {
            xMin: -1, xMax: 10, yMin: -1, yMax: 8,
            segments: [
              { x1: 1, y1: 2, x2: 5, y2: 1 },
              { x1: 5, y1: 1, x2: 7, y2: 5 },
              { x1: 7, y1: 5, x2: 3, y2: 6, dashed: true },
              { x1: 3, y1: 6, x2: 1, y2: 2, dashed: true },
            ],
            points: [
              { x: 1, y: 2, label: 'A(1, 2)' },
              { x: 5, y: 1, label: 'B(5, 1)' },
              { x: 7, y: 5, label: 'C(7, 5)' },
              { x: 3, y: 6, label: 'D(3, 6)' },
            ],
            ariaLabel: 'Points A(1, 2), B(5, 1) and C(7, 5) with sides AB and BC drawn, and the fourth vertex D(3, 6) joined to C and A with dashed sides.',
          },
        },
      ],
      steps: [
        { text: 'Find the step from $B$ to $A$.', tex: 'A - B = (1 - 5, \\; 2 - 1) = (-4, 1)', why: 'In parallelogram $ABCD$, side $CD$ is parallel to and as long as side $BA$, so the step from $C$ to $D$ equals the step from $B$ to $A$.' },
        { text: 'Take the same step from $C$.', tex: 'D = (7 - 4, \\; 5 + 1) = (3, 6)', why: 'This is $D = (x_A + x_C - x_B, \\; y_A + y_C - y_B)$. Or take the step from $B$ to $C$, $(2, 4)$, starting from $A$: $(1 + 2, 2 + 4) = (3, 6)$, the same $D$. Using $B + C - A = (11, 4)$ instead would give a parallelogram with the vertices in a different order, not $ABCD$.' },
        { text: 'Check: the diagonals share a midpoint.', tex: '\\text{mid } AC = \\left(\\tfrac{1 + 7}{2}, \\tfrac{2 + 5}{2}\\right) = (4, 3.5), \\quad \\text{mid } BD = \\left(\\tfrac{5 + 3}{2}, \\tfrac{1 + 6}{2}\\right) = (4, 3.5)', why: 'The diagonals of a parallelogram bisect each other, so matching midpoints confirm $D$.' },
        { text: 'Test for right angles and equal sides.', tex: 'm_{AB} = -\\frac{1}{4}, \\; m_{BC} = 2, \\; -\\frac{1}{4} \\cdot 2 = -\\frac{1}{2}; \\quad AB = \\sqrt{17}, \\; BC = \\sqrt{20} = 2\\sqrt{5}', why: 'The product is not $-1$, so there is no right angle (not a rectangle or square). The adjacent sides are different lengths (not a rhombus).' },
      ],
      answer: '$D = (3, 6)$. $ABCD$ has no right angles and unequal adjacent sides, so its most specific name is **parallelogram**.',
    },
  ],
  teachMeAgain: [
    {
      approach: 'visual',
      title: 'Rhombus or square? Look at the corners',
      blocks: [
        { t: 'p', text: 'Both shapes below have four equal sides. Only one has square corners.' },
        {
          t: 'graph',
          caption: 'Left: rhombus ABCD with sides of slope 1/3 and 3. Right: square EFGH with sides of slope 1/3 and -3.',
          spec: {
            xMin: -1, xMax: 13, yMin: -2, yMax: 9,
            segments: [
              { x1: 1, y1: 1, x2: 4, y2: 2, color: '#d4572f' },
              { x1: 4, y1: 2, x2: 5, y2: 5, color: '#d4572f' },
              { x1: 5, y1: 5, x2: 2, y2: 4, color: '#d4572f' },
              { x1: 2, y1: 4, x2: 1, y2: 1, color: '#d4572f' },
              { x1: 8, y1: 2, x2: 11, y2: 3, color: '#1f8a5b' },
              { x1: 11, y1: 3, x2: 10, y2: 6, color: '#1f8a5b' },
              { x1: 10, y1: 6, x2: 7, y2: 5, color: '#1f8a5b' },
              { x1: 7, y1: 5, x2: 8, y2: 2, color: '#1f8a5b' },
            ],
            points: [
              { x: 1, y: 1, label: 'A' }, { x: 4, y: 2, label: 'B' }, { x: 5, y: 5, label: 'C' }, { x: 2, y: 4, label: 'D' },
              { x: 8, y: 2, label: 'E' }, { x: 11, y: 3, label: 'F' }, { x: 10, y: 6, label: 'G' }, { x: 7, y: 5, label: 'H' },
            ],
            ariaLabel: 'Rhombus A(1, 1), B(4, 2), C(5, 5), D(2, 4) on the left and square E(8, 2), F(11, 3), G(10, 6), H(7, 5) on the right.',
          },
        },
        { t: 'list', items: [
          '**Rhombus $ABCD$:** $AB$ goes right $3$, up $1$ (slope $\\frac{1}{3}$); $BC$ goes right $1$, up $3$ (slope $3$). Product $1$: no right angle.',
          '**Square $EFGH$:** $EF$ goes right $3$, up $1$ (slope $\\frac{1}{3}$); $FG$ goes **left** $1$, up $3$ (slope $-3$). Product $-1$: right angle.',
        ] },
        { t: 'p', text: 'Turning a side a quarter turn swaps its run and rise **and** flips one sign. That sign flip is what makes slopes opposite reciprocals.' },
      ],
    },
    {
      approach: 'simpler-example',
      title: 'A rectangle that sits straight',
      blocks: [
        { t: 'p', text: 'Start with $A(1, 1)$, $B(6, 1)$, $C(6, 4)$ and $D(1, 4)$.' },
        { t: 'list', items: [
          '$AB$ and $DC$ are horizontal (slope $0$); $BC$ and $AD$ are vertical (undefined slope). Both pairs of opposite sides are parallel: a parallelogram.',
          'A horizontal side meets a vertical side at a right angle: a rectangle.',
          '$AB = 6 - 1 = 5$ and $BC = 4 - 1 = 3$. The sides are not all equal, so it is **not** a square.',
        ] },
        { t: 'p', text: 'Most specific name: **rectangle**. A tilted figure works exactly the same way; the slopes and lengths just take more arithmetic.' },
      ],
    },
    {
      approach: 'analogy',
      title: 'Clubs inside clubs',
      blocks: [
        { t: 'p', text: 'If someone asks what you do after school, "a club" is true but not helpful. "The robotics club" is better. Some students are in two clubs at once, and naming both says the most.' },
        { t: 'p', text: 'Quadrilaterals work the same way: think of clubs. Every rectangle and every rhombus belongs to the **parallelogram** club. The **rectangle** club and the **rhombus** club are two smaller clubs inside it, and a **square** belongs to both of them at once. The most specific name is the smallest club your evidence proves the shape belongs to.' },
        { t: 'p', text: 'And like a detective, you only name what you can prove. "It looks square" is a hunch; "all sides are $\\sqrt{17}$ and adjacent slopes multiply to $-1$" is proof.' },
      ],
    },
    {
      approach: 'prerequisite',
      title: 'Refresher: slopes and distances',
      blocks: [
        { t: 'list', items: [
          '**Slope** from $(2, 1)$ to $(6, 2)$: $\\frac{2 - 1}{6 - 2} = \\frac{1}{4}$.',
          '**Opposite reciprocal** of $\\frac{1}{4}$: flip it to $4$ and change the sign to $-4$. Check: $\\frac{1}{4} \\cdot (-4) = -1$.',
          '**Parallel** lines have equal slopes, like $\\frac{1}{4}$ and $\\frac{1}{4}$.',
          '**Distance** from $(2, 1)$ to $(6, 2)$: $\\sqrt{4^2 + 1^2} = \\sqrt{17}$.',
          '**Simplifying:** $\\sqrt{50} = \\sqrt{25 \\cdot 2} = 5\\sqrt{2}$ and $\\sqrt{20} = \\sqrt{4 \\cdot 5} = 2\\sqrt{5}$.',
        ] },
      ],
    },
    {
      approach: 'step-by-step',
      title: 'A routine for any quadrilateral',
      blocks: [
        { t: 'list', ordered: true, items: [
          '**Slopes:** find the slopes of $AB$, $BC$, $CD$ and $DA$.',
          '**Parallel pairs:** compare $AB$ with $CD$ and $BC$ with $DA$. One pair equal: **trapezoid** (stop). Both pairs equal: parallelogram (keep going).',
          '**Right angle?** Multiply the slopes of $AB$ and $BC$. If the product is $-1$ (or one is horizontal and one vertical), it has right angles.',
          '**Equal sides?** Find $AB$ and $BC$ with the distance formula. In a parallelogram, if these two are equal, all four are.',
          '**Name it:** right angles and equal sides: **square**. Right angles only: **rectangle**. Equal sides only: **rhombus**. Neither: **parallelogram**.',
        ] },
        { t: 'p', text: 'Try it on $A(1, 3)$, $B(3, 1)$, $C(8, 6)$, $D(6, 8)$: slopes $-1, 1, -1, 1$; product $-1$; $AB = 2\\sqrt{2}$, $BC = 5\\sqrt{2}$. Rectangle.' },
      ],
    },
    {
      approach: 'alternate-strategy',
      title: 'Use the diagonals instead',
      blocks: [
        { t: 'p', text: 'The two diagonals $AC$ and $BD$ can classify a quadrilateral too:' },
        { t: 'list', items: [
          'Diagonals have the **same midpoint** (they bisect each other): parallelogram.',
          '...and the diagonals are **equal in length**: rectangle.',
          '...and the diagonals are **perpendicular**: rhombus.',
          '...and both: square.',
        ] },
        { t: 'p', text: 'For $A(1, 1)$, $B(4, 2)$, $C(5, 5)$, $D(2, 4)$: both diagonals have midpoint $(3, 3)$, so it is a parallelogram. $AC = \\sqrt{32} = 4\\sqrt{2}$ and $BD = \\sqrt{8} = 2\\sqrt{2}$ are not equal, so it is not a rectangle. Slopes $1$ and $-1$ multiply to $-1$, so the diagonals are perpendicular: **rhombus**. The same answer as the side method.' },
        { t: 'p', text: 'For triangles, you can skip slopes and use the converse of the Pythagorean theorem: if $a^2 + b^2 = c^2$ for the side lengths, with $c$ the longest, it is a right triangle.' },
      ],
    },
  ],
  guided: [
    { generator: 'u8.classify', difficulty: 1 },
    { generator: 'u8.classify', difficulty: 1 },
    { generator: 'u8.classify', difficulty: 2 },
    { generator: 'u8.classify', difficulty: 3 },
  ],
  independent: {
    count: 8,
    reviewCount: 2,
    mix: [
      { generator: 'u8.classify', difficulty: 1, weight: 2 },
      { generator: 'u8.classify', difficulty: 2, weight: 3 },
      { generator: 'u8.classify', difficulty: 3, weight: 3 },
    ],
  },
  quiz: {
    items: [
      { generator: 'u8.classify', difficulty: 1 },
      { generator: 'u8.classify', difficulty: 2 },
      { generator: 'u8.classify', difficulty: 2 },
      { generator: 'u8.classify', difficulty: 2 },
      { generator: 'u8.classify', difficulty: 3 },
      { generator: 'u8.classify', difficulty: 3 },
    ],
  },
  summary: [
    'Prove a classification with numbers: equal slopes mean parallel sides, slopes with product $-1$ mean perpendicular sides, and the distance formula compares side lengths.',
    'A triangle is a right triangle if two sides are perpendicular (or $a^2 + b^2 = c^2$); it is isosceles if at least two sides are equal and scalene if none are. $A(1, 1)$, $B(4, 5)$, $C(8, 2)$ is an isosceles right triangle.',
    'Trapezoid: exactly one pair of parallel sides. Parallelogram: both pairs. Rectangle: a parallelogram with right angles. Rhombus: four equal sides. Square: both right angles and four equal sides.',
    'Four equal sides prove only a rhombus: $A(1, 1)$, $B(4, 2)$, $C(5, 5)$, $D(2, 4)$ has sides $\\sqrt{10}$ but slopes $\\frac{1}{3}$ and $3$, so it is not a square. Always give the most specific name you can prove.',
    'The fourth vertex of parallelogram $ABCD$ is $D = (x_A + x_C - x_B, \\; y_A + y_C - y_B)$; check it by showing the diagonals have the same midpoint.',
  ],
  mastery: { quizPassScore: 0.8, practiceMinCorrect: 5 },
};
