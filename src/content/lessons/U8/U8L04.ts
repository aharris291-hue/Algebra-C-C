import type { LessonContent } from '../../../core/curriculum/types';

/**
 * U8L04 Perimeter and Area on the Coordinate Plane (A.GSR.3.1, A.GSR.3.2)
 * Perimeter and area of rectangles with horizontal and vertical sides from their vertices (side lengths by
 * subtracting coordinates); area of a triangle with a horizontal or vertical base (A = 1/2 bh, the height is the
 * perpendicular distance to the base, not a slanted side); perimeter with slanted sides by the distance formula,
 * exact in simplest radical form (combining like radicals) or rounded to the tenth at the end; area of a tilted
 * rectangle or right triangle from distance-formula side lengths (checked perpendicular by slopes); area of any
 * polygon by the box method (enclosing rectangle minus corner triangles) or by splitting (S8.04). Reviews the
 * distance formula (S8.01) and adding and subtracting radicals (S3.05).
 *
 * Math verified by hand (2026-10-08): every number below was recomputed with a node script:
 * rectangle (-3, -1), (4, -1), (4, 3), (-3, 3): 7 by 4, P = 22, A = 28; triangle (-2, -2), (4, -2), (1, 3): base 6,
 * height 5, A = 15, slanted sides sqrt(34) each, P = 6 + 2 sqrt(34) = 17.66 -> 17.7; right triangle (-3, 0), (1, 2),
 * (-1, 6): slopes 1/2 and -2, legs sqrt(20) = 2 sqrt(5) each, A = 10, box 4 x 6 = 24 minus 4 + 4 + 6 = 14 is 10,
 * hypotenuse sqrt(40) = 2 sqrt(10), P = 4 sqrt(5) + 2 sqrt(10) = 15.27; box triangle (-3, -2), (3, 0), (0, 4): box
 * 36 minus 6 + 6 + 9 = 21 is 15 (shoelace 15); rectangle (-4, -2), (3, -2), (3, 3), (-4, 3): 7 by 5, P = 24, A = 35;
 * triangle (-2, -1), (4, -1), (2, 3): A = 12, sides 6, sqrt(32) = 4 sqrt(2), sqrt(20) = 2 sqrt(5),
 * P = 6 + 4 sqrt(2) + 2 sqrt(5) = 16.13 -> 16.1; garden (0, 0), (6, 0), (6, 4), (2, 4): P = 14 + 2 sqrt(5) = 18.47
 * -> 18.5 m, A = 24 - 4 = 20 m^2 (and 16 + 4 = 20 by splitting); triangle (0, 0), (6, 0), (4, 5): A = 15, wrong
 * slanted "height" sqrt(41) = 6.40 gives 19.2; tilted rectangle (1, 0), (4, 3), (2, 5), (-1, 2): slopes 1 and -1,
 * sides 3 sqrt(2) and 2 sqrt(2), A = 12, box 25 minus 4.5 + 2 + 4.5 + 2 = 13 is 12, P = 10 sqrt(2) = 14.14 -> 14.1;
 * squares 3 by 2: P = 10, A = 6; triangle (0, 0), (4, 0), (0, 3): A = 6, hypotenuse 5, P = 12; sqrt(8) + sqrt(18) =
 * 5 sqrt(2); parallelogram (0, 0), (4, 0), (5, 3), (1, 3): sides 4 and sqrt(10), P = 8 + 2 sqrt(10) = 14.32 -> 14.3,
 * A = 4 x 3 = 12. Every graph point and label was checked to lie in its window.
 */
export const U8L04: LessonContent = {
  lessonId: 'U8L04',
  goal: 'Find the perimeter and area of rectangles, triangles and other polygons from the coordinates of their vertices: subtract coordinates for horizontal and vertical sides, use the distance formula for slanted sides (exact answers like $6 + 2\\sqrt{34}$ or rounded ones like $17.7$), and use $A = \\frac{1}{2}bh$ or the box method for area.',
  needToKnow: [
    { t: 'p', text: 'This lesson puts together three tools you already have:' },
    {
      t: 'list',
      items: [
        '**Horizontal and vertical lengths.** From $(-3, 2)$ to $(4, 2)$ the length is $|4 - (-3)| = 7$. Only one coordinate changes.',
        '**The distance formula.** $d = \\sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2}$. From $(1, 1)$ to $(4, 5)$: $\\sqrt{3^2 + 4^2} = \\sqrt{25} = 5$.',
        '**Simplifying and adding radicals.** $\\sqrt{20} = \\sqrt{4 \\cdot 5} = 2\\sqrt{5}$, and $2\\sqrt{5} + 3\\sqrt{5} = 5\\sqrt{5}$ (like radicals combine the way like terms do). $\\sqrt{2} + \\sqrt{5}$ cannot be combined.',
      ],
    },
    { t: 'callout', variant: 'tip', title: 'Quick check', text: 'Simplify $\\sqrt{8} + \\sqrt{18}$. (You should get $2\\sqrt{2} + 3\\sqrt{2} = 5\\sqrt{2}$.) If that felt shaky, open **Teach Me Again** and choose the refresher.' },
  ],
  vocabulary: [
    { term: 'vertex (plural vertices)', meaning: 'A corner point of a polygon. A polygon is named by its vertices in order around the figure, like $ABCD$.' },
    { term: 'perimeter', meaning: 'The total distance around a figure: the sum of all its side lengths. Measured in units.' },
    { term: 'area', meaning: 'The number of unit squares that cover the inside of a figure. Measured in square units.' },
    { term: 'base and height', meaning: 'For a triangle, the base is any side and the height is the **perpendicular** distance from the opposite vertex to the line containing the base.' },
    { term: 'box method', meaning: 'Find the area of a polygon by drawing the smallest rectangle around it with horizontal and vertical sides, then subtracting the right triangles (and rectangles) in the corners.' },
  ],
  instruction: [
    { t: 'p', text: '### Rectangles with horizontal and vertical sides' },
    { t: 'p', text: 'When a side is horizontal or vertical, you can find its length by subtracting coordinates. Rectangle $ABCD$ has vertices $A(-3, -1)$, $B(4, -1)$, $C(4, 3)$ and $D(-3, 3)$.' },
    {
      t: 'graph',
      caption: 'Rectangle ABCD is 7 units wide and 4 units tall.',
      spec: { xMin: -5, xMax: 7, yMin: -3, yMax: 5, segments: [{ x1: -3, y1: -1, x2: 4, y2: -1 }, { x1: 4, y1: -1, x2: 4, y2: 3 }, { x1: 4, y1: 3, x2: -3, y2: 3 }, { x1: -3, y1: 3, x2: -3, y2: -1 }], points: [{ x: -3, y: -1, label: 'A(-3, -1)' }, { x: 4, y: -1, label: 'B(4, -1)' }, { x: 4, y: 3, label: 'C(4, 3)' }, { x: -3, y: 3, label: 'D(-3, 3)' }], ariaLabel: 'Rectangle with vertices A(-3, -1), B(4, -1), C(4, 3) and D(-3, 3).' },
    },
    { t: 'list', items: [
      'Width $AB$: $|4 - (-3)| = 7$ units. Height $BC$: $|3 - (-1)| = 4$ units.',
      'Perimeter: $7 + 4 + 7 + 4 = 22$ units.',
      'Area: $7 \\times 4 = 28$ square units. (Count the squares on the grid: $7$ columns of $4$.)',
    ] },
    { t: 'p', text: '### Triangles with a horizontal base' },
    { t: 'p', text: 'Triangle $ABC$ has vertices $A(-2, -2)$, $B(4, -2)$ and $C(1, 3)$. The base $AB$ is horizontal, so its length is $|4 - (-2)| = 6$. The **height** is the straight-up distance from $C$ down to the base: $|3 - (-2)| = 5$.' },
    {
      t: 'graph',
      caption: 'Base AB = 6. The dashed height from C(1, 3) straight down to the base is 5.',
      spec: { xMin: -4, xMax: 7, yMin: -4, yMax: 5, segments: [{ x1: -2, y1: -2, x2: 4, y2: -2 }, { x1: 4, y1: -2, x2: 1, y2: 3 }, { x1: 1, y1: 3, x2: -2, y2: -2 }, { x1: 1, y1: 3, x2: 1, y2: -2, dashed: true, label: 'h = 5' }], points: [{ x: -2, y: -2, label: 'A(-2, -2)' }, { x: 4, y: -2, label: 'B(4, -2)' }, { x: 1, y: 3, label: 'C(1, 3)' }], ariaLabel: 'Triangle with vertices A(-2, -2), B(4, -2) and C(1, 3), with a dashed vertical height from C down to the base AB at (1, -2).' },
    },
    { t: 'math', tex: 'A = \\frac{1}{2}bh = \\frac{1}{2}(6)(5) = 15 \\text{ square units}' },
    { t: 'p', text: 'For the perimeter, the slanted sides need the distance formula:' },
    { t: 'math', tex: 'AC = \\sqrt{(1 - (-2))^2 + (3 - (-2))^2} = \\sqrt{9 + 25} = \\sqrt{34}, \\qquad BC = \\sqrt{(1 - 4)^2 + (3 - (-2))^2} = \\sqrt{9 + 25} = \\sqrt{34}' },
    { t: 'p', text: 'So the perimeter is $6 + \\sqrt{34} + \\sqrt{34} = 6 + 2\\sqrt{34}$ units exactly. The two $\\sqrt{34}$ terms are like radicals, so they combine; the $6$ does not combine with them. Rounded, $6 + 2\\sqrt{34} \\approx 17.7$ units.' },
    { t: 'callout', variant: 'warning', title: 'Round only at the end', text: 'Keep exact radicals until the last step, then round the total once. Rounding each side first can make the total come out a tenth off.' },
    { t: 'p', text: '### Tilted figures: use the distance formula for the sides' },
    { t: 'p', text: 'Triangle $RST$ has vertices $R(-3, 0)$, $S(1, 2)$ and $T(-1, 6)$. No side is horizontal or vertical. First check for a right angle with slopes: $RS$ has slope $\\frac{2 - 0}{1 - (-3)} = \\frac{1}{2}$ and $ST$ has slope $\\frac{6 - 2}{-1 - 1} = -2$. The product is $-1$, so the angle at $S$ is a right angle and the legs $RS$ and $ST$ are a base and a height.' },
    {
      t: 'graph',
      caption: 'Right triangle RST with its right angle at S. The dashed box is 4 by 6.',
      spec: { xMin: -6, xMax: 4, yMin: -1, yMax: 7, segments: [{ x1: -3, y1: 0, x2: 1, y2: 2 }, { x1: 1, y1: 2, x2: -1, y2: 6 }, { x1: -1, y1: 6, x2: -3, y2: 0 }, { x1: -3, y1: 0, x2: 1, y2: 0, dashed: true }, { x1: 1, y1: 0, x2: 1, y2: 6, dashed: true }, { x1: 1, y1: 6, x2: -3, y2: 6, dashed: true }, { x1: -3, y1: 6, x2: -3, y2: 0, dashed: true }], points: [{ x: -3, y: 0, label: 'R(-3, 0)' }, { x: 1, y: 2, label: 'S(1, 2)' }, { x: -1, y: 6, label: 'T(-1, 6)' }], ariaLabel: 'Right triangle with vertices R(-3, 0), S(1, 2) and T(-1, 6), inside a dashed 4 by 6 box with corners (-3, 0), (1, 0), (1, 6) and (-3, 6).' },
    },
    { t: 'math', tex: 'RS = \\sqrt{4^2 + 2^2} = \\sqrt{20} = 2\\sqrt{5}, \\qquad ST = \\sqrt{(-2)^2 + 4^2} = \\sqrt{20} = 2\\sqrt{5}' },
    { t: 'math', tex: 'A = \\frac{1}{2}(2\\sqrt{5})(2\\sqrt{5}) = \\frac{1}{2}(4 \\cdot 5) = 10 \\text{ square units}' },
    { t: 'p', text: 'The third side is $RT = \\sqrt{2^2 + 6^2} = \\sqrt{40} = 2\\sqrt{10}$, so the perimeter is $2\\sqrt{5} + 2\\sqrt{5} + 2\\sqrt{10} = 4\\sqrt{5} + 2\\sqrt{10} \\approx 15.3$ units.' },
    { t: 'p', text: '### The box method works for any polygon' },
    { t: 'p', text: 'Look at the dashed box around $RST$ above. It is $4$ wide and $6$ tall, so its area is $24$. The parts of the box **outside** the triangle are three right triangles, each with horizontal and vertical legs:' },
    { t: 'list', items: [
      'Bottom right, under $RS$: legs $4$ and $2$, area $\\frac{1}{2}(4)(2) = 4$.',
      'Top right, beside $ST$: legs $2$ and $4$, area $\\frac{1}{2}(2)(4) = 4$.',
      'Left, beside $RT$: legs $2$ and $6$, area $\\frac{1}{2}(2)(6) = 6$.',
    ] },
    { t: 'math', tex: 'A = 24 - (4 + 4 + 6) = 24 - 14 = 10 \\text{ square units} \\; \\checkmark' },
    { t: 'p', text: 'Same answer, and the box method does not need a right angle. It works for **any** triangle or polygon drawn on a grid.' },
    { t: 'callout', variant: 'why', title: 'Why subtracting works', text: 'The box is made of the triangle plus the corner pieces, with no overlaps and no gaps. So box $=$ triangle $+$ corners, which means triangle $=$ box $-$ corners. Every corner piece has horizontal and vertical legs, so its area is easy to find.' },
    { t: 'callout', variant: 'realworld', title: 'Where this shows up', text: 'Surveyors find the area of a plot of land from the coordinates of its corners, landscapers use perimeter to buy fencing and edging, and builders use area to order flooring, sod or paint.' },

    { t: 'p', text: '### Areas of parallelograms, rhombuses and squares' },
    { t: 'p', text: 'Any parallelogram (rhombuses included) has area **base × height**, where the height is the perpendicular distance between the base and the opposite side, not the length of a slanted side. For $A(0, 0)$, $B(5, 0)$, $C(7, 3)$, $D(2, 3)$, the base $AB$ is $5$ and the height is the vertical distance $3$, so the area is $15$ (the slanted side $AD = \\sqrt{13}$ is not the height). For a tilted square, find one side with the distance formula; the area is side$^2$, so for a side from $(0, 0)$ to $(1, 2)$ the area is $1^2 + 2^2 = 5$.' },
    { t: 'p', text: '### Sides with unknown lengths' },
    { t: 'p', text: 'When side lengths are expressions, write the perimeter (or area) formula with them and solve. A rectangle with length $x + 4$ and width $x$ has perimeter $2(x + 4) + 2x = 4x + 8$. If the perimeter is $28$, then $4x + 8 = 28$, so $x = 5$, the sides are $9$ and $5$, and the area is $45$.' },
  ],
  examples: [
    {
      title: 'Perimeter and area of a rectangle',
      kind: 'introductory',
      problem: [
        { t: 'p', text: 'Find the perimeter and area of rectangle $PQRS$ with $P(-4, -2)$, $Q(3, -2)$, $R(3, 3)$ and $S(-4, 3)$.' },
        {
          t: 'graph',
          spec: { xMin: -6, xMax: 6, yMin: -4, yMax: 5, segments: [{ x1: -4, y1: -2, x2: 3, y2: -2 }, { x1: 3, y1: -2, x2: 3, y2: 3 }, { x1: 3, y1: 3, x2: -4, y2: 3 }, { x1: -4, y1: 3, x2: -4, y2: -2 }], points: [{ x: -4, y: -2, label: 'P(-4, -2)' }, { x: 3, y: -2, label: 'Q(3, -2)' }, { x: 3, y: 3, label: 'R(3, 3)' }, { x: -4, y: 3, label: 'S(-4, 3)' }], ariaLabel: 'Rectangle with vertices P(-4, -2), Q(3, -2), R(3, 3) and S(-4, 3).' },
        },
      ],
      steps: [
        { text: 'Find the width $PQ$.', tex: 'PQ = |3 - (-4)| = 7', why: '$P$ and $Q$ have the same $y$-coordinate, so the side is horizontal and only $x$ changes.' },
        { text: 'Find the height $QR$.', tex: 'QR = |3 - (-2)| = 5', why: '$Q$ and $R$ have the same $x$-coordinate, so the side is vertical and only $y$ changes.' },
        { text: 'Add all four sides for the perimeter.', tex: 'P = 7 + 5 + 7 + 5 = 24', why: 'Opposite sides of a rectangle are equal, so $P = 2(7) + 2(5)$.' },
        { text: 'Multiply for the area.', tex: 'A = 7 \\times 5 = 35', why: 'A rectangle holds $7$ columns of $5$ unit squares.' },
      ],
      answer: 'Perimeter $24$ units; area $35$ square units.',
    },
    {
      title: 'A triangle: area and exact perimeter',
      kind: 'intermediate',
      problem: [
        { t: 'p', text: 'Triangle $JKL$ has vertices $J(-2, -1)$, $K(4, -1)$ and $L(2, 3)$. Find its area, and its perimeter both exactly and to the nearest tenth.' },
        {
          t: 'graph',
          spec: { xMin: -4, xMax: 7, yMin: -3, yMax: 5, segments: [{ x1: -2, y1: -1, x2: 4, y2: -1 }, { x1: 4, y1: -1, x2: 2, y2: 3 }, { x1: 2, y1: 3, x2: -2, y2: -1 }, { x1: 2, y1: 3, x2: 2, y2: -1, dashed: true }], points: [{ x: -2, y: -1, label: 'J(-2, -1)' }, { x: 4, y: -1, label: 'K(4, -1)' }, { x: 2, y: 3, label: 'L(2, 3)' }], ariaLabel: 'Triangle with vertices J(-2, -1), K(4, -1) and L(2, 3), with a dashed vertical height from L down to (2, -1).' },
        },
      ],
      steps: [
        { text: 'Base and height.', tex: 'b = JK = |4 - (-2)| = 6, \\qquad h = |3 - (-1)| = 4', why: '$JK$ is horizontal. The height is the vertical distance from $L$ to the line $y = -1$ that holds the base.' },
        { text: 'Area.', tex: 'A = \\frac{1}{2}(6)(4) = 12', why: 'Area of a triangle is half of base times height.' },
        { text: 'Slanted sides by the distance formula.', tex: 'JL = \\sqrt{4^2 + 4^2} = \\sqrt{32} = 4\\sqrt{2}, \\qquad KL = \\sqrt{(-2)^2 + 4^2} = \\sqrt{20} = 2\\sqrt{5}', why: '$\\sqrt{32} = \\sqrt{16 \\cdot 2}$ and $\\sqrt{20} = \\sqrt{4 \\cdot 5}$: pull out the largest perfect-square factor.' },
        { text: 'Add the sides.', tex: 'P = 6 + 4\\sqrt{2} + 2\\sqrt{5} \\approx 6 + 5.657 + 4.472 \\approx 16.1', why: '$\\sqrt{2}$ and $\\sqrt{5}$ are not like radicals, so the exact answer stays as three terms. Round only the final total.' },
      ],
      answer: 'Area $12$ square units; perimeter $6 + 4\\sqrt{2} + 2\\sqrt{5} \\approx 16.1$ units.',
    },
    {
      title: 'Fencing and soil for a garden',
      kind: 'real-world',
      problem: [
        { t: 'p', text: 'A school garden is drawn on a grid where $1$ unit $= 1$ meter. Its corners are $(0, 0)$, $(6, 0)$, $(6, 4)$ and $(2, 4)$. How many meters of fencing go around it (to the nearest tenth), and how many square meters of soil cover it?' },
        {
          t: 'graph',
          spec: { xMin: -1, xMax: 9, yMin: -1, yMax: 6, xLabel: 'meters', yLabel: 'meters', segments: [{ x1: 0, y1: 0, x2: 6, y2: 0 }, { x1: 6, y1: 0, x2: 6, y2: 4 }, { x1: 6, y1: 4, x2: 2, y2: 4 }, { x1: 2, y1: 4, x2: 0, y2: 0 }, { x1: 2, y1: 4, x2: 2, y2: 0, dashed: true }], points: [{ x: 0, y: 0, label: '(0, 0)' }, { x: 6, y: 0, label: '(6, 0)' }, { x: 6, y: 4, label: '(6, 4)' }, { x: 2, y: 4, label: '(2, 4)' }], ariaLabel: 'Garden with corners (0, 0), (6, 0), (6, 4) and (2, 4); a dashed line from (2, 4) down to (2, 0) splits it into a rectangle and a triangle.' },
        },
      ],
      steps: [
        { text: 'Find the three horizontal and vertical sides.', tex: '6 - 0 = 6, \\qquad 4 - 0 = 4, \\qquad 6 - 2 = 4', why: 'The bottom, right and top sides each change only one coordinate.' },
        { text: 'Find the slanted side from $(2, 4)$ to $(0, 0)$.', tex: '\\sqrt{2^2 + 4^2} = \\sqrt{20} = 2\\sqrt{5} \\approx 4.47', why: 'The left side is slanted, so it needs the distance formula.' },
        { text: 'Add for the perimeter.', tex: 'P = 6 + 4 + 4 + 2\\sqrt{5} = 14 + 2\\sqrt{5} \\approx 18.5 \\text{ m}', why: 'Fencing goes all the way around, so add every side. In real life you would buy a little extra, like $19$ meters.' },
        { text: 'Box method for the area.', tex: 'A = 6 \\times 4 - \\frac{1}{2}(2)(4) = 24 - 4 = 20 \\text{ m}^2', why: 'The $6$ by $4$ box around the garden has one empty corner triangle at the top left, with legs $2$ and $4$.' },
        { text: 'Check by splitting instead.', tex: '\\underbrace{4 \\times 4}_{\\text{rectangle}} + \\underbrace{\\tfrac{1}{2}(2)(4)}_{\\text{triangle}} = 16 + 4 = 20 \\; \\checkmark', why: 'The dashed line cuts the garden into a $4$ by $4$ rectangle and a right triangle. Two methods, one answer.' },
      ],
      answer: 'About $18.5$ meters of fencing (exactly $14 + 2\\sqrt{5}$) and $20$ square meters of soil.',
    },
    {
      title: 'The slanted side is not the height',
      kind: 'common-mistake',
      problem: [{ t: 'p', text: 'Triangle $ABC$ has vertices $A(0, 0)$, $B(6, 0)$ and $C(4, 5)$. Marcus found the area like this: "$AC = \\sqrt{41} \\approx 6.4$, so $A = \\frac{1}{2}(6)(6.4) = 19.2$." What went wrong?' }],
      steps: [
        { text: 'Find the base.', tex: 'AB = 6 - 0 = 6', why: 'Marcus got this part right: $AB$ is horizontal.' },
        { text: 'Find the real height.', tex: 'h = 5 - 0 = 5', why: 'The height must be **perpendicular** to the base. The base is horizontal, so the height is the vertical distance from $C$ down to the $x$-axis. The side $AC$ is slanted, so it is not the height.' },
        { text: 'Compute the area correctly.', tex: 'A = \\frac{1}{2}(6)(5) = 15', why: 'Using the slanted side made the triangle look bigger than it is: a slanted side is always longer than the height.' },
        { text: 'Check with the box method.', tex: '6 \\times 5 - \\frac{1}{2}(4)(5) - \\frac{1}{2}(2)(5) = 30 - 10 - 5 = 15 \\; \\checkmark', why: 'The $6$ by $5$ box has two empty corner triangles, left of $AC$ and right of $BC$.' },
      ],
      answer: 'The height is $5$, not $\\sqrt{41}$. The area is $15$ square units.',
    },
    {
      title: 'A tilted rectangle, two ways',
      kind: 'challenging',
      problem: [
        { t: 'p', text: 'Show that $A(1, 0)$, $B(4, 3)$, $C(2, 5)$ and $D(-1, 2)$ form a rectangle with a right angle at $B$, then find its perimeter and area.' },
        {
          t: 'graph',
          spec: { xMin: -3, xMax: 7, yMin: -1, yMax: 7, segments: [{ x1: 1, y1: 0, x2: 4, y2: 3 }, { x1: 4, y1: 3, x2: 2, y2: 5 }, { x1: 2, y1: 5, x2: -1, y2: 2 }, { x1: -1, y1: 2, x2: 1, y2: 0 }, { x1: -1, y1: 0, x2: 4, y2: 0, dashed: true }, { x1: 4, y1: 0, x2: 4, y2: 5, dashed: true }, { x1: 4, y1: 5, x2: -1, y2: 5, dashed: true }, { x1: -1, y1: 5, x2: -1, y2: 0, dashed: true }], points: [{ x: 1, y: 0, label: 'A(1, 0)' }, { x: 4, y: 3, label: 'B(4, 3)' }, { x: 2, y: 5, label: 'C(2, 5)' }, { x: -1, y: 2, label: 'D(-1, 2)' }], ariaLabel: 'Tilted rectangle with vertices A(1, 0), B(4, 3), C(2, 5) and D(-1, 2), inside a dashed 5 by 5 box with corners (-1, 0), (4, 0), (4, 5) and (-1, 5).' },
        },
      ],
      steps: [
        { text: 'Check the right angle at $B$ with slopes.', tex: 'm_{AB} = \\frac{3 - 0}{4 - 1} = 1, \\qquad m_{BC} = \\frac{5 - 3}{2 - 4} = -1, \\qquad 1 \\cdot (-1) = -1', why: 'Slopes that multiply to $-1$ mean $AB \\perp BC$. The same check works at every corner ($CD$ has slope $1$ and $DA$ has slope $-1$), so all four angles are right angles.' },
        { text: 'Find the side lengths.', tex: 'AB = \\sqrt{3^2 + 3^2} = \\sqrt{18} = 3\\sqrt{2}, \\qquad BC = \\sqrt{(-2)^2 + 2^2} = \\sqrt{8} = 2\\sqrt{2}', why: 'Opposite sides of a rectangle are equal, so $CD = 3\\sqrt{2}$ and $DA = 2\\sqrt{2}$.' },
        { text: 'Perimeter.', tex: 'P = 2(3\\sqrt{2}) + 2(2\\sqrt{2}) = 6\\sqrt{2} + 4\\sqrt{2} = 10\\sqrt{2} \\approx 14.1', why: 'All four sides are multiples of $\\sqrt{2}$, so they are like radicals and combine into one term.' },
        { text: 'Area from the side lengths.', tex: 'A = 3\\sqrt{2} \\cdot 2\\sqrt{2} = 6 \\cdot 2 = 12', why: 'Multiply the numbers outside and the radicals separately: $\\sqrt{2} \\cdot \\sqrt{2} = 2$.' },
        { text: 'Check with the box method.', tex: '5 \\times 5 - \\left(\\tfrac{1}{2}(3)(3) + \\tfrac{1}{2}(2)(2) + \\tfrac{1}{2}(3)(3) + \\tfrac{1}{2}(2)(2)\\right) = 25 - 13 = 12 \\; \\checkmark', why: 'The box runs from $x = -1$ to $4$ and $y = 0$ to $5$. Its four corner triangles have legs $3$ and $3$ (two of them) and $2$ and $2$ (two of them).' },
      ],
      answer: 'All slopes are $1$ or $-1$, so every angle is a right angle. Perimeter $10\\sqrt{2} \\approx 14.1$ units; area $12$ square units.',
    },

    {
      title: 'Solving for an unknown side',
      kind: 'intermediate',
      problem: [{ t: 'p', text: '(a) A rectangle has length $x + 4$ and width $x$, in units, and perimeter $28$ units. Find $x$ and the area. (b) Each side of a rhombus is $2x - 1$ units, and its perimeter is $36$ units. Find $x$ and the side length.' }],
      steps: [
        { text: '(a) Write the perimeter equation.', tex: '2(x + 4) + 2x = 28', why: 'A rectangle has two lengths and two widths.' },
        { text: 'Solve.', tex: '4x + 8 = 28 \\Rightarrow 4x = 20 \\Rightarrow x = 5', why: 'Combine like terms, then undo the addition and the multiplication.' },
        { text: 'Find the area.', tex: '(5 + 4)(5) = 9 \\cdot 5 = 45', why: 'Substitute $x = 5$ into each side, then use length × width. The answer is $45$ square units, not $x$.' },
        { text: '(b) All four sides of a rhombus are equal.', tex: '4(2x - 1) = 36 \\Rightarrow 2x - 1 = 9 \\Rightarrow x = 5', why: 'Divide both sides by $4$ first, then solve.' },
        { text: 'Find the side length.', tex: '2(5) - 1 = 9', why: 'Check: $4 \\cdot 9 = 36$.' },
      ],
      answer: '(a) $x = 5$ and the area is $45$ square units. (b) $x = 5$ and each side is $9$ units.',
    },
  ],
  teachMeAgain: [
    {
      approach: 'visual',
      title: 'Picture the box and its corners',
      blocks: [
        { t: 'p', text: 'Triangle $A(-3, -2)$, $B(3, 0)$, $C(0, 4)$ has no horizontal or vertical side. Draw the box around it: from $x = -3$ to $x = 3$ and from $y = -2$ to $y = 4$. That box is $6$ by $6$, area $36$.' },
        {
          t: 'graph',
          caption: 'The 6 by 6 box minus three corner triangles (areas 6, 6 and 9) leaves the triangle: 36 - 21 = 15.',
          spec: { xMin: -5, xMax: 6, yMin: -3, yMax: 6, segments: [{ x1: -3, y1: -2, x2: 3, y2: 0 }, { x1: 3, y1: 0, x2: 0, y2: 4 }, { x1: 0, y1: 4, x2: -3, y2: -2 }, { x1: -3, y1: -2, x2: 3, y2: -2, dashed: true }, { x1: 3, y1: -2, x2: 3, y2: 4, dashed: true }, { x1: 3, y1: 4, x2: -3, y2: 4, dashed: true }, { x1: -3, y1: 4, x2: -3, y2: -2, dashed: true }], points: [{ x: -3, y: -2, label: 'A(-3, -2)' }, { x: 3, y: 0, label: 'B(3, 0)' }, { x: 0, y: 4, label: 'C(0, 4)' }], ariaLabel: 'Triangle with vertices A(-3, -2), B(3, 0) and C(0, 4), inside a dashed 6 by 6 box with corners (-3, -2), (3, -2), (3, 4) and (-3, 4).' },
        },
        { t: 'list', items: [
          'Below $AB$: legs $6$ and $2$, area $\\frac{1}{2}(6)(2) = 6$.',
          'Right of $BC$: legs $4$ and $3$, area $\\frac{1}{2}(4)(3) = 6$.',
          'Left of $CA$: legs $3$ and $6$, area $\\frac{1}{2}(3)(6) = 9$.',
        ] },
        { t: 'p', text: 'Triangle area $= 36 - (6 + 6 + 9) = 36 - 21 = 15$ square units.' },
      ],
    },
    {
      approach: 'simpler-example',
      title: 'Count the squares',
      blocks: [
        { t: 'p', text: 'A rectangle from $(0, 0)$ to $(3, 2)$ covers $3$ columns of $2$ squares: area $6$. Walking around it you go $3 + 2 + 3 + 2 = 10$ units: perimeter $10$.' },
        { t: 'p', text: 'Now cut a $4$ by $3$ rectangle in half along its diagonal. The triangle $(0, 0)$, $(4, 0)$, $(0, 3)$ is half of $12$, so its area is $6$, which is exactly $\\frac{1}{2}bh = \\frac{1}{2}(4)(3)$. Its slanted side is $\\sqrt{4^2 + 3^2} = 5$, so its perimeter is $4 + 3 + 5 = 12$.' },
        {
          t: 'graph',
          spec: { xMin: -1, xMax: 6, yMin: -1, yMax: 5, segments: [{ x1: 0, y1: 0, x2: 4, y2: 0 }, { x1: 4, y1: 0, x2: 0, y2: 3 }, { x1: 0, y1: 3, x2: 0, y2: 0 }, { x1: 4, y1: 0, x2: 4, y2: 3, dashed: true }, { x1: 4, y1: 3, x2: 0, y2: 3, dashed: true }], points: [{ x: 0, y: 0, label: '(0, 0)' }, { x: 4, y: 0, label: '(4, 0)' }, { x: 0, y: 3, label: '(0, 3)' }], ariaLabel: 'Right triangle with vertices (0, 0), (4, 0) and (0, 3), drawn as half of a dashed 4 by 3 rectangle.' },
        },
      ],
    },
    {
      approach: 'analogy',
      title: 'Cutting a shape out of paper',
      blocks: [
        { t: 'p', text: 'Think of the box method like cutting a shape out of a sheet of paper. You start with the whole rectangular sheet, cut along the edges of the shape, and throw away the scraps in the corners. The shape you keep is the sheet minus the scraps.' },
        { t: 'p', text: 'Perimeter is different: it is like the length of ribbon you would glue around the edge of the shape you cut out. You add up every edge, and slanted edges are longer than they look on the grid, so measure them with the distance formula.' },
      ],
    },
    {
      approach: 'prerequisite',
      title: 'Refresher: distances and radicals',
      blocks: [
        { t: 'list', items: [
          '**Distance:** subtract the $x$s, subtract the $y$s, square both, add, take the square root. From $(1, 2)$ to $(3, 4)$: $\\sqrt{2^2 + 2^2} = \\sqrt{8}$.',
          '**Simplify:** pull out the largest perfect-square factor. $\\sqrt{8} = \\sqrt{4 \\cdot 2} = 2\\sqrt{2}$ and $\\sqrt{18} = \\sqrt{9 \\cdot 2} = 3\\sqrt{2}$.',
          '**Add like radicals:** add the numbers in front. $2\\sqrt{2} + 3\\sqrt{2} = 5\\sqrt{2}$, just like $2x + 3x = 5x$.',
          '**Unlike radicals stay apart:** $4\\sqrt{2} + 2\\sqrt{5}$ is already as simple as it gets.',
          '**Multiply radicals:** $\\sqrt{2} \\cdot \\sqrt{2} = 2$, so $3\\sqrt{2} \\cdot 2\\sqrt{2} = 6 \\cdot 2 = 12$.',
        ] },
      ],
    },
    {
      approach: 'step-by-step',
      title: 'A routine for any polygon',
      blocks: [
        { t: 'list', ordered: true, items: [
          '**Plot** the vertices and connect them in order.',
          '**Sides:** for each side, subtract coordinates if it is horizontal or vertical; otherwise use the distance formula.',
          '**Perimeter:** simplify each radical, add, and combine like radicals. Round only at the end if asked.',
          '**Area:** use length $\\times$ width or $\\frac{1}{2}bh$ if the sides are horizontal and vertical; otherwise use the box method.',
          '**Units:** perimeter in units, area in **square** units.',
        ] },
        { t: 'p', text: 'Try it on the parallelogram $(0, 0)$, $(4, 0)$, $(5, 3)$, $(1, 3)$. The sides are $4$, $\\sqrt{1^2 + 3^2} = \\sqrt{10}$, $4$ and $\\sqrt{10}$, so $P = 8 + 2\\sqrt{10} \\approx 14.3$ units. The base is $4$ and the height is $3$, so $A = 4 \\times 3 = 12$ square units.' },
      ],
    },
    {
      approach: 'alternate-strategy',
      title: 'Split instead of subtract',
      blocks: [
        { t: 'p', text: 'Instead of boxing a shape and subtracting, you can **cut it into pieces** whose areas are easy, then add them.' },
        { t: 'p', text: 'The garden $(0, 0)$, $(6, 0)$, $(6, 4)$, $(2, 4)$: a vertical cut at $x = 2$ makes a $4$ by $4$ rectangle (area $16$) and a right triangle with legs $2$ and $4$ (area $\\frac{1}{2}(2)(4) = 4$). Total: $16 + 4 = 20$ square units, the same as the box method ($24 - 4 = 20$).' },
        { t: 'p', text: 'For a tilted rectangle or right triangle, a third way is to use the distance formula for two perpendicular sides and multiply: for $A(1, 0)$, $B(4, 3)$, $C(2, 5)$, $D(-1, 2)$ that is $3\\sqrt{2} \\cdot 2\\sqrt{2} = 12$. Use one method to find the answer and another to check it.' },
      ],
    },
  ],
  guided: [
    { generator: 'u8.perim-area', difficulty: 1 },
    { generator: 'u8.perim-area', difficulty: 1 },
    { generator: 'u8.perim-area', difficulty: 2 },
    { generator: 'u8.perim-area', difficulty: 3 },
  ],
  independent: {
    count: 8,
    reviewCount: 2,
    mix: [
      { generator: 'u8.perim-area', difficulty: 1, weight: 2 },
      { generator: 'u8.perim-area', difficulty: 2, weight: 3 },
      { generator: 'u8.perim-area', difficulty: 3, weight: 3 },
    ],
  },
  quiz: {
    items: [
      { generator: 'u8.perim-area', difficulty: 1 },
      { generator: 'u8.perim-area', difficulty: 2 },
      { generator: 'u8.perim-area', difficulty: 2 },
      { generator: 'u8.perim-area', difficulty: 2 },
      { generator: 'u8.perim-area', difficulty: 3 },
      { generator: 'u8.perim-area', difficulty: 3 },
    ],
  },
  summary: [
    'For horizontal and vertical sides, subtract coordinates: the rectangle $(-3, -1)$, $(4, -1)$, $(4, 3)$, $(-3, 3)$ is $7$ by $4$, so $P = 22$ units and $A = 28$ square units.',
    'For a triangle, $A = \\frac{1}{2}bh$, where the height is perpendicular to the base. A slanted side is not the height.',
    'Slanted sides need the distance formula. Give exact perimeters in simplest radical form, combining like radicals ($6 + \\sqrt{34} + \\sqrt{34} = 6 + 2\\sqrt{34}$), and round only the final answer.',
    'For a tilted rectangle or right triangle, check the right angle with slopes, find two perpendicular sides with the distance formula, and multiply: $3\\sqrt{2} \\cdot 2\\sqrt{2} = 12$.',
    'The box method finds the area of any polygon on a grid: area of the enclosing rectangle minus the corner triangles, like $36 - 21 = 15$.',
  ],
  mastery: { quizPassScore: 0.8, practiceMinCorrect: 5 },
};
