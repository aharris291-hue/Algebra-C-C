import type { LessonContent } from '../../../core/curriculum/types';

/**
 * U8L06 Coordinate Geometry in the Real World (A.GSR.3.1, A.GSR.3.2, A.MM.1.1, A.MM.1.3)
 * Modeling places on a map grid with a scale (1 unit = 1 block, 10 meters, 0.1 mile...): straight-line distance
 * with the distance formula, then scaled; walking along streets (horizontal plus vertical) versus the straight
 * route; a meeting point halfway (midpoint); fencing (perimeter) and sod (area) for a park, and cost = amount x
 * price; whether a new path is parallel or perpendicular to a road (slopes); the area of an irregular lot by the
 * box method. Lengths scale by k and areas by k squared (S8.06). Reviews midpoint (S8.02) and perimeter and area
 * on the coordinate plane (S8.04).
 *
 * Math verified by hand (2026-10-08): home H(1, 2) to school S(7, 10): sqrt(36 + 64) = 10 units = 1 mile at
 * 0.1 mile per unit, streets 6 + 8 = 14 units = 1.4 miles, difference 0.4 mile, and in miles
 * sqrt(0.6^2 + 0.8^2) = 1; park (2, 2), (10, 2), (10, 7), (2, 7) at 10 m per unit: 80 m by 50 m, perimeter
 * 26 units = 260 m, fencing 260 x $12 = $3,120, area 40 square units = 4,000 m^2; road through (0, 1) and
 * (8, 5) slope 1/2, path (2, 9) to (6, 1) slope -2, product -1; library L(1, 2) to pool P(6, 14):
 * sqrt(25 + 144) = 13 units = 2.6 km at 0.2 km per unit; Maya (1, 8) and Leo (9, 2): midpoint (5, 5), each
 * sqrt(16 + 9) = 5 units = 500 m, total 10 units = 1,000 m; dog park (1, 1), (9, 1), (9, 6), (1, 6) at 5 ft
 * per unit: 40 ft by 25 ft, perimeter 130 ft, 130 x $15 = $1,950, area 1,000 ft^2, 1,000 x $0.80 = $800,
 * corners scaled (5, 5), (45, 5), (45, 30), (5, 30); triangle lot (1, 1), (7, 1), (1, 5): 12 square units,
 * 60 m by 40 m legs, (1/2)(60)(40) = 1,200 m^2 (not 120); irregular lot A(1, 2), B(7, 1), C(9, 6), D(3, 8):
 * box 8 x 7 = 56, corner triangles 3 + 5 + 6 + 6 = 20, area 36 square units (shoelace agrees), at 20 ft per
 * unit 36 x 400 = 14,400 ft^2; 3 by 2 rectangle at 10 m per unit: 6 x 100 = 600 m^2; 3 by 4 rectangle at
 * 2 m per unit: 6 m by 8 m, perimeter 14 units = 28 m, area 12 x 4 = 48 m^2, diagonal 5 units = 10 m.
 */
export const U8L06: LessonContent = {
  lessonId: 'U8L06',
  goal: 'Model a real place on a coordinate grid with a scale, then use distance, midpoint, slope, perimeter and area to answer questions about it (like a straight route of $10$ units $= 1$ mile, or a park of $40$ square units $= 4{,}000$ m$^2$), converting lengths by the scale and areas by the scale squared.',
  needToKnow: [
    { t: 'p', text: 'Every tool from this unit gets used today:' },
    {
      t: 'list',
      items: [
        '**Distance:** $d = \\sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2}$. Horizontal or vertical distances are just differences, like $10 - 2 = 8$.',
        '**Midpoint:** $M = \\left(\\frac{x_1 + x_2}{2}, \\frac{y_1 + y_2}{2}\\right)$.',
        '**Slope:** equal slopes mean parallel; slopes with product $-1$ mean perpendicular.',
        '**Perimeter and area:** perimeter adds the side lengths; a rectangle\'s area is length $\\times$ width; a triangle\'s is $\\frac{1}{2}bh$.',
      ],
    },
    { t: 'callout', variant: 'tip', title: 'Quick check', text: 'Find the distance from $(1, 2)$ to $(7, 10)$. (You should get $\\sqrt{6^2 + 8^2} = \\sqrt{100} = 10$.) If that felt shaky, open **Teach Me Again** and choose the refresher.' },
  ],
  vocabulary: [
    { term: 'scale', meaning: 'What one grid unit stands for in real life, such as $1$ unit $= 10$ meters.' },
    { term: 'straight-line distance', meaning: 'The distance "as the crow flies," found with the distance formula.' },
    { term: 'street (walking) distance', meaning: 'The distance when you can only move along horizontal and vertical streets: the horizontal change plus the vertical change.' },
    { term: 'square units', meaning: 'The unit of area on a grid. With a scale of $1$ unit $= k$ meters, each square unit is $k^2$ square meters.' },
    { term: 'box method', meaning: 'Finding the area of a polygon by drawing a rectangle around it and subtracting the right triangles in the corners.' },
  ],
  instruction: [
    { t: 'p', text: '### From a map to a grid' },
    { t: 'p', text: 'Put a coordinate grid over a map and every place becomes a point. The map\'s **scale** tells you what one unit means. Here a home is at $H(1, 2)$ and a school is at $S(7, 10)$, and $1$ unit $= 0.1$ mile.' },
    {
      t: 'graph',
      caption: 'The straight route from home to school (solid) and a route along the streets (dashed). 1 unit = 0.1 mile.',
      spec: {
        xMin: -1, xMax: 10, yMin: -1, yMax: 12,
        xLabel: 'x (1 unit = 0.1 mi)', yLabel: 'y',
        segments: [
          { x1: 1, y1: 2, x2: 7, y2: 10, color: '#3557d4' },
          { x1: 1, y1: 2, x2: 7, y2: 2, color: '#d4572f', dashed: true },
          { x1: 7, y1: 2, x2: 7, y2: 10, color: '#d4572f', dashed: true },
        ],
        points: [
          { x: 1, y: 2, label: 'H(1, 2)' },
          { x: 7, y: 10, label: 'S(7, 10)' },
        ],
        ariaLabel: 'Home at H(1, 2) and school at S(7, 10). A solid straight segment joins them. A dashed street route goes from H east to (7, 2), then north to S.',
      },
    },
    { t: 'list', ordered: true, items: [
      '**Straight line:** $\\sqrt{(7 - 1)^2 + (10 - 2)^2} = \\sqrt{36 + 64} = \\sqrt{100} = 10$ units.',
      '**Use the scale:** $10 \\times 0.1 = 1$ mile.',
      '**Along the streets:** $6$ units east plus $8$ units north is $14$ units $= 1.4$ miles. The straight route is $1.4 - 1 = 0.4$ mile shorter.',
    ] },
    { t: 'callout', variant: 'tip', title: 'Work in grid units, convert at the end', text: 'Do the geometry with the grid numbers, which are small and friendly, then multiply by the scale once. The straight route is always the shortest; the street route is the horizontal change plus the vertical change.' },
    { t: 'p', text: '### Which tool answers the question?' },
    { t: 'table', headers: ['The question asks for...', 'Use'], rows: [
      ['how far apart two places are', 'distance formula'],
      ['a point halfway between two places', 'midpoint formula'],
      ['whether a path runs parallel or at a right angle to a road', 'slopes'],
      ['fencing, trim or a border around a region', 'perimeter'],
      ['sod, paint, carpet or the size of a lot', 'area'],
      ['the cost', 'amount $\\times$ price per unit'],
    ], caption: 'Key words in a real-world problem point to the tool.' },
    { t: 'p', text: '### Scaling lengths and areas' },
    { t: 'p', text: 'A park has corners $(2, 2)$, $(10, 2)$, $(10, 7)$ and $(2, 7)$ on a grid where $1$ unit $= 10$ meters.' },
    {
      t: 'graph',
      caption: 'A rectangular park 8 units by 5 units. 1 unit = 10 meters.',
      spec: {
        xMin: -1, xMax: 13, yMin: -1, yMax: 9,
        segments: [
          { x1: 2, y1: 2, x2: 10, y2: 2, color: '#1f8a5b' },
          { x1: 10, y1: 2, x2: 10, y2: 7, color: '#1f8a5b' },
          { x1: 10, y1: 7, x2: 2, y2: 7, color: '#1f8a5b' },
          { x1: 2, y1: 7, x2: 2, y2: 2, color: '#1f8a5b' },
        ],
        points: [
          { x: 2, y: 2, label: '(2, 2)' },
          { x: 10, y: 2, label: '(10, 2)' },
          { x: 10, y: 7, label: '(10, 7)' },
          { x: 2, y: 7, label: '(2, 7)' },
        ],
        ariaLabel: 'Rectangle with corners (2, 2), (10, 2), (10, 7) and (2, 7).',
      },
    },
    { t: 'list', items: [
      '**Lengths:** the sides are $8$ units $= 80$ m and $5$ units $= 50$ m. The perimeter is $26$ units $= 260$ m.',
      '**Fencing cost** at \\$12 per meter: $260 \\times 12 = 3{,}120$, so \\$3,120.',
      '**Area:** $8 \\times 5 = 40$ square units. Each square unit is $10 \\text{ m} \\times 10 \\text{ m} = 100$ m$^2$, so the area is $40 \\times 100 = 4{,}000$ m$^2$. (Check: $80 \\times 50 = 4{,}000$.)',
    ] },
    { t: 'callout', variant: 'warning', title: 'Areas scale by the square', text: 'If $1$ unit $= k$ meters, multiply **lengths** by $k$ but **areas** by $k^2$. Multiplying $40$ square units by $10$ gives $400$, which is wrong: it stretches the park in only one direction.' },
    { t: 'p', text: '### Parallel or perpendicular paths' },
    { t: 'p', text: 'A straight road passes through $(0, 1)$ and $(8, 5)$. The city plans a new path from $(2, 9)$ to $(6, 1)$. Does the path cross the road at a right angle?' },
    {
      t: 'graph',
      caption: 'The road (blue) has slope 1/2 and the new path (orange) has slope -2.',
      spec: {
        xMin: -2, xMax: 13, yMin: -1, yMax: 11,
        segments: [
          { x1: 0, y1: 1, x2: 8, y2: 5, color: '#3557d4' },
          { x1: 2, y1: 9, x2: 6, y2: 1, color: '#d4572f' },
        ],
        points: [
          { x: 0, y: 1, label: '(0, 1)' },
          { x: 8, y: 5, label: '(8, 5)' },
          { x: 2, y: 9, label: '(2, 9)' },
          { x: 6, y: 1, label: '(6, 1)' },
        ],
        ariaLabel: 'A road segment from (0, 1) to (8, 5) and a path segment from (2, 9) to (6, 1) that crosses it.',
      },
    },
    { t: 'p', text: 'Road: $\\frac{5 - 1}{8 - 0} = \\frac{1}{2}$. Path: $\\frac{1 - 9}{6 - 2} = -2$. Since $\\frac{1}{2} \\cdot (-2) = -1$, the path is **perpendicular** to the road.' },
    { t: 'p', text: 'If the slopes were equal, the path would be **parallel** to the road; if they are not equal and do not multiply to $-1$, the answer is **neither**.' },
    { t: 'callout', variant: 'realworld', title: 'Where this shows up', text: 'City planners, landscapers and delivery apps all work this way: a map becomes coordinates, and distance, area and slope become miles, square feet of sod and the angle of a crosswalk.' },
  ],
  examples: [
    {
      title: 'Library to pool',
      kind: 'introductory',
      problem: [
        { t: 'p', text: 'On a town map, the library is at $L(1, 2)$ and the pool is at $P(6, 14)$, and $1$ unit $= 0.2$ kilometer. How far is it from the library to the pool in a straight line?' },
        {
          t: 'graph',
          spec: {
            xMin: -1, xMax: 10, yMin: -1, yMax: 16,
            segments: [{ x1: 1, y1: 2, x2: 6, y2: 14, color: '#3557d4' }],
            points: [
              { x: 1, y: 2, label: 'L(1, 2)' },
              { x: 6, y: 14, label: 'P(6, 14)' },
            ],
            ariaLabel: 'The library at L(1, 2) and the pool at P(6, 14), joined by a straight segment.',
          },
        },
      ],
      steps: [
        { text: 'Find the horizontal and vertical changes.', tex: '\\Delta x = 6 - 1 = 5, \\qquad \\Delta y = 14 - 2 = 12', why: 'These are the legs of a right triangle whose hypotenuse is the straight route.' },
        { text: 'Use the distance formula.', tex: 'd = \\sqrt{5^2 + 12^2} = \\sqrt{25 + 144} = \\sqrt{169} = 13 \\text{ units}', why: 'The distance formula is the Pythagorean theorem on the grid.' },
        { text: 'Convert with the scale.', tex: '13 \\times 0.2 = 2.6 \\text{ km}', why: 'Each unit is $0.2$ km, so $13$ units is $13$ times as far.' },
      ],
      answer: 'The pool is $13$ units, or $2.6$ km, from the library in a straight line.',
    },
    {
      title: 'Meeting halfway',
      kind: 'intermediate',
      problem: [
        { t: 'p', text: 'Maya lives at $M(1, 8)$ and Leo lives at $E(9, 2)$ on a grid where $1$ unit $= 100$ meters. They want to meet at the point exactly halfway between their homes. Where should they meet, and how far does each one walk in a straight line?' },
        {
          t: 'graph',
          spec: {
            xMin: -1, xMax: 12, yMin: -1, yMax: 10,
            segments: [{ x1: 1, y1: 8, x2: 9, y2: 2, color: '#3557d4' }],
            points: [
              { x: 1, y: 8, label: 'M(1, 8)' },
              { x: 9, y: 2, label: 'E(9, 2)' },
              { x: 5, y: 5, label: '(5, 5)', color: '#d4572f' },
            ],
            ariaLabel: 'Maya at M(1, 8) and Leo at E(9, 2), joined by a segment, with the meeting point (5, 5) in the middle.',
          },
        },
      ],
      steps: [
        { text: 'Average the coordinates.', tex: '\\left(\\frac{1 + 9}{2}, \\frac{8 + 2}{2}\\right) = (5, 5)', why: 'The midpoint is halfway in both directions: halfway across and halfway up.' },
        { text: 'Find Maya\'s walk to the midpoint.', tex: '\\sqrt{(5 - 1)^2 + (5 - 8)^2} = \\sqrt{16 + 9} = \\sqrt{25} = 5 \\text{ units}', why: 'The distance formula works for any two points, including a midpoint.' },
        { text: 'Convert and check.', tex: '5 \\times 100 = 500 \\text{ m}; \\qquad ME = \\sqrt{8^2 + 6^2} = 10 \\text{ units} = 1{,}000 \\text{ m}', why: 'The whole trip is $1{,}000$ m, and half of it is $500$ m, so each of them walks the same $500$ m.' },
      ],
      answer: 'They meet at $(5, 5)$, and each walks $5$ units $= 500$ meters.',
    },
    {
      title: 'Fencing and sod for a dog park',
      kind: 'real-world',
      problem: [
        { t: 'p', text: 'A dog park has corners $(1, 1)$, $(9, 1)$, $(9, 6)$ and $(1, 6)$ on a plan where $1$ unit $= 5$ feet. Fencing costs \\$15 per foot and sod costs \\$0.80 per square foot. What do the fence around the park and the sod covering it cost?' },
        {
          t: 'graph',
          spec: {
            xMin: -1, xMax: 12, yMin: -1, yMax: 8,
            segments: [
              { x1: 1, y1: 1, x2: 9, y2: 1, color: '#1f8a5b' },
              { x1: 9, y1: 1, x2: 9, y2: 6, color: '#1f8a5b' },
              { x1: 9, y1: 6, x2: 1, y2: 6, color: '#1f8a5b' },
              { x1: 1, y1: 6, x2: 1, y2: 1, color: '#1f8a5b' },
            ],
            points: [
              { x: 1, y: 1, label: '(1, 1)' },
              { x: 9, y: 1, label: '(9, 1)' },
              { x: 9, y: 6, label: '(9, 6)' },
              { x: 1, y: 6, label: '(1, 6)' },
            ],
            ariaLabel: 'Rectangular dog park with corners (1, 1), (9, 1), (9, 6) and (1, 6).',
          },
        },
      ],
      steps: [
        { text: 'Find the side lengths and convert them.', tex: '9 - 1 = 8 \\text{ units} = 40 \\text{ ft}, \\qquad 6 - 1 = 5 \\text{ units} = 25 \\text{ ft}', why: 'The sides are horizontal and vertical, so each length is a difference of coordinates. Each unit is $5$ ft.' },
        { text: 'Fencing goes around: perimeter.', tex: 'P = 2(40) + 2(25) = 130 \\text{ ft}; \\qquad 130 \\times \\$15 = \\$1{,}950', why: 'A fence follows the edge of the park, so it is a length, and cost = amount $\\times$ price per foot.' },
        { text: 'Sod covers the inside: area.', tex: 'A = 40 \\times 25 = 1{,}000 \\text{ ft}^2; \\qquad 1{,}000 \\times \\$0.80 = \\$800', why: 'Sod covers a surface, so it is measured in square feet. Using the converted lengths makes the area come out in square feet directly.' },
      ],
      answer: 'The fence is $130$ ft and costs \\$1,950. The sod is $1{,}000$ ft$^2$ and costs \\$800.',
    },
    {
      title: 'Scaling an area by the scale',
      kind: 'common-mistake',
      problem: [
        { t: 'p', text: 'A triangular lot has corners $(1, 1)$, $(7, 1)$ and $(1, 5)$ on a grid where $1$ unit $= 10$ meters. Jordan finds the area is $12$ square units and writes "$12 \\times 10 = 120$ m$^2$." What went wrong?' },
        {
          t: 'graph',
          spec: {
            xMin: -1, xMax: 10, yMin: -1, yMax: 7,
            segments: [
              { x1: 1, y1: 1, x2: 7, y2: 1 },
              { x1: 7, y1: 1, x2: 1, y2: 5 },
              { x1: 1, y1: 5, x2: 1, y2: 1 },
            ],
            points: [
              { x: 1, y: 1, label: '(1, 1)' },
              { x: 7, y: 1, label: '(7, 1)' },
              { x: 1, y: 5, label: '(1, 5)' },
            ],
            ariaLabel: 'Right triangle with corners (1, 1), (7, 1) and (1, 5).',
          },
        },
      ],
      steps: [
        { text: 'Check the area in square units.', tex: 'A = \\frac{1}{2}(6)(4) = 12 \\text{ square units}', why: 'The base runs from $x = 1$ to $x = 7$ and the height from $y = 1$ to $y = 5$. Jordan\'s $12$ is correct.' },
        { text: 'Find what one square unit is worth.', tex: '1 \\text{ square unit} = 10 \\text{ m} \\times 10 \\text{ m} = 100 \\text{ m}^2', why: 'A square unit is $1$ unit wide **and** $1$ unit tall, and both directions are scaled by $10$.' },
        { text: 'Scale the area correctly, and check with real lengths.', tex: '12 \\times 100 = 1{,}200 \\text{ m}^2; \\qquad \\tfrac{1}{2}(60)(40) = 1{,}200 \\; \\checkmark', why: 'Converting the base and height to meters first ($60$ m and $40$ m) gives the same answer.' },
      ],
      answer: 'Jordan multiplied the area by $10$ instead of $10^2 = 100$. The lot is $1{,}200$ m$^2$, not $120$ m$^2$.',
    },
    {
      title: 'An irregular lot by the box method',
      kind: 'challenging',
      problem: [
        { t: 'p', text: 'A plot of land has corners $A(1, 2)$, $B(7, 1)$, $C(9, 6)$ and $D(3, 8)$ on a survey grid where $1$ unit $= 20$ feet. Find its area in square feet.' },
        {
          t: 'graph',
          caption: 'The lot ABCD inside the dashed box from x = 1 to 9 and y = 1 to 8.',
          spec: {
            xMin: -1, xMax: 12, yMin: -1, yMax: 10,
            segments: [
              { x1: 1, y1: 2, x2: 7, y2: 1, color: '#3557d4' },
              { x1: 7, y1: 1, x2: 9, y2: 6, color: '#3557d4' },
              { x1: 9, y1: 6, x2: 3, y2: 8, color: '#3557d4' },
              { x1: 3, y1: 8, x2: 1, y2: 2, color: '#3557d4' },
              { x1: 1, y1: 1, x2: 9, y2: 1, dashed: true, color: '#8a3fbf' },
              { x1: 9, y1: 1, x2: 9, y2: 8, dashed: true, color: '#8a3fbf' },
              { x1: 9, y1: 8, x2: 1, y2: 8, dashed: true, color: '#8a3fbf' },
              { x1: 1, y1: 8, x2: 1, y2: 1, dashed: true, color: '#8a3fbf' },
            ],
            points: [
              { x: 1, y: 2, label: 'A(1, 2)' },
              { x: 7, y: 1, label: 'B(7, 1)' },
              { x: 9, y: 6, label: 'C(9, 6)' },
              { x: 3, y: 8, label: 'D(3, 8)' },
            ],
            ariaLabel: 'Quadrilateral lot with corners A(1, 2), B(7, 1), C(9, 6) and D(3, 8), inside a dashed rectangle with corners (1, 1), (9, 1), (9, 8) and (1, 8).',
          },
        },
      ],
      steps: [
        { text: 'Draw the smallest box around the lot.', tex: '\\text{box: } x \\text{ from } 1 \\text{ to } 9, \\; y \\text{ from } 1 \\text{ to } 8; \\quad 8 \\times 7 = 56 \\text{ square units}', why: 'The box uses the smallest and largest $x$ and $y$ of the corners, so every corner of the lot touches its edge.' },
        { text: 'Find the four corner triangles.', tex: '\\tfrac{1}{2}(6)(1) + \\tfrac{1}{2}(2)(5) + \\tfrac{1}{2}(6)(2) + \\tfrac{1}{2}(2)(6) = 3 + 5 + 6 + 6 = 20', why: 'Each side of the lot is the hypotenuse of a right triangle in a corner of the box. Its legs are the horizontal and vertical changes along that side: $AB$ has $6$ and $1$, $BC$ has $2$ and $5$, $CD$ has $6$ and $2$, and $DA$ has $2$ and $6$.' },
        { text: 'Subtract.', tex: '56 - 20 = 36 \\text{ square units}', why: 'The lot is what is left of the box after cutting off the corners.' },
        { text: 'Convert with the scale squared.', tex: '1 \\text{ square unit} = 20 \\times 20 = 400 \\text{ ft}^2; \\qquad 36 \\times 400 = 14{,}400 \\text{ ft}^2', why: 'An area scales by the square of the length scale.' },
      ],
      answer: 'The lot is $36$ square units, which is $14{,}400$ square feet.',
    },
  ],
  teachMeAgain: [
    {
      approach: 'visual',
      title: 'Count the real squares',
      blocks: [
        { t: 'p', text: 'This rectangle is $3$ units by $2$ units, so it covers $6$ grid squares. The scale is $1$ unit $= 10$ meters.' },
        {
          t: 'graph',
          caption: 'A 3 by 2 rectangle: 6 grid squares, each 10 m by 10 m.',
          spec: {
            xMin: -1, xMax: 6, yMin: -1, yMax: 5,
            segments: [
              { x1: 1, y1: 1, x2: 4, y2: 1, color: '#1f8a5b' },
              { x1: 4, y1: 1, x2: 4, y2: 3, color: '#1f8a5b' },
              { x1: 4, y1: 3, x2: 1, y2: 3, color: '#1f8a5b' },
              { x1: 1, y1: 3, x2: 1, y2: 1, color: '#1f8a5b' },
            ],
            points: [
              { x: 1, y: 1, label: '(1, 1)' },
              { x: 4, y: 3, label: '(4, 3)' },
            ],
            ariaLabel: 'Rectangle from (1, 1) to (4, 3), covering 6 grid squares.',
          },
        },
        { t: 'list', items: [
          'Each grid square is really $10$ m wide and $10$ m tall, so it covers $10 \\times 10 = 100$ m$^2$.',
          '$6$ squares $\\times 100$ m$^2 = 600$ m$^2$.',
          'Check with real lengths: $30 \\text{ m} \\times 20 \\text{ m} = 600$ m$^2$.',
        ] },
        { t: 'p', text: 'The side lengths ($3$ and $2$ units) are multiplied by $10$; the area is multiplied by $10 \\times 10 = 100$.' },
      ],
    },
    {
      approach: 'simpler-example',
      title: 'A small garden',
      blocks: [
        { t: 'p', text: 'A garden is $3$ units by $4$ units, and $1$ unit $= 2$ meters.' },
        { t: 'list', items: [
          '**Real sides:** $3 \\times 2 = 6$ m and $4 \\times 2 = 8$ m.',
          '**Perimeter:** $14$ units $\\times 2 = 28$ m (or $6 + 8 + 6 + 8 = 28$).',
          '**Area:** $12$ square units $\\times 2^2 = 48$ m$^2$ (or $6 \\times 8 = 48$).',
          '**Diagonal:** $\\sqrt{3^2 + 4^2} = 5$ units $\\times 2 = 10$ m.',
        ] },
        { t: 'p', text: 'Lengths (perimeter, diagonal) use the scale once. Areas use it twice.' },
      ],
    },
    {
      approach: 'analogy',
      title: 'Blowing up a photo',
      blocks: [
        { t: 'p', text: 'Print a photo $3$ times as wide and $3$ times as tall. Its border gets $3$ times as long, but it covers $3 \\times 3 = 9$ times as much paper, because it grew in two directions.' },
        { t: 'p', text: 'A map grid is a tiny photo of the real place. With $1$ unit $= 10$ m, every length on the real place is $10$ times the grid length, and every area is $100$ times the grid area.' },
      ],
    },
    {
      approach: 'prerequisite',
      title: 'Refresher: the unit\'s formulas',
      blocks: [
        { t: 'list', items: [
          '**Distance:** $(1, 2)$ to $(7, 10)$: $\\sqrt{6^2 + 8^2} = \\sqrt{100} = 10$.',
          '**Midpoint:** $(1, 8)$ and $(9, 2)$: $\\left(\\frac{1 + 9}{2}, \\frac{8 + 2}{2}\\right) = (5, 5)$.',
          '**Slope:** $(0, 1)$ to $(8, 5)$: $\\frac{4}{8} = \\frac{1}{2}$. A perpendicular slope is $-2$.',
          '**Rectangle:** $(2, 2)$ to $(10, 7)$ is $8$ by $5$: perimeter $26$, area $40$.',
          '**Triangle:** $A = \\frac{1}{2}bh$; base $6$ and height $4$ give $12$.',
        ] },
      ],
    },
    {
      approach: 'step-by-step',
      title: 'A routine for any map problem',
      blocks: [
        { t: 'list', ordered: true, items: [
          '**Plot** the places and sketch what is asked (a route, a midpoint, a boundary).',
          '**Choose the tool** from the key words: how far (distance), halfway (midpoint), parallel or right angle (slope), fence (perimeter), cover (area), cost (amount $\\times$ price).',
          '**Compute in grid units.**',
          '**Convert:** multiply lengths by the scale $k$ and areas by $k^2$.',
          '**Answer** with real units (m, ft, mi, m$^2$, dollars) and round only if told to.',
        ] },
        { t: 'p', text: 'Example: home $(1, 2)$, school $(7, 10)$, $1$ unit $= 0.1$ mile. How far (distance): $10$ units. Convert: $1$ mile.' },
      ],
    },
    {
      approach: 'alternate-strategy',
      title: 'Convert the coordinates first',
      blocks: [
        { t: 'p', text: 'Instead of converting at the end, you can multiply every coordinate by the scale first and then work in real units.' },
        { t: 'list', items: [
          '**Dog park** at $5$ ft per unit: $(1, 1), (9, 1), (9, 6), (1, 6)$ become $(5, 5), (45, 5), (45, 30), (5, 30)$ in feet. The sides are $40$ ft and $25$ ft, so the area is $1{,}000$ ft$^2$, already in square feet.',
          '**Home to school** at $0.1$ mile per unit: $(1, 2)$ and $(7, 10)$ become $(0.1, 0.2)$ and $(0.7, 1.0)$. The distance is $\\sqrt{0.6^2 + 0.8^2} = \\sqrt{0.36 + 0.64} = 1$ mile.',
        ] },
        { t: 'p', text: 'Both orders give the same answer. Converting at the end usually means easier numbers; converting first means you can never forget to square the scale for an area.' },
      ],
    },
  ],
  guided: [
    { generator: 'u8.geo-context', difficulty: 1 },
    { generator: 'u8.geo-context', difficulty: 1 },
    { generator: 'u8.geo-context', difficulty: 2 },
    { generator: 'u8.geo-context', difficulty: 3 },
  ],
  independent: {
    count: 8,
    reviewCount: 2,
    mix: [
      { generator: 'u8.geo-context', difficulty: 1, weight: 2 },
      { generator: 'u8.geo-context', difficulty: 2, weight: 3 },
      { generator: 'u8.geo-context', difficulty: 3, weight: 3 },
    ],
  },
  quiz: {
    items: [
      { generator: 'u8.geo-context', difficulty: 1 },
      { generator: 'u8.geo-context', difficulty: 2 },
      { generator: 'u8.geo-context', difficulty: 2 },
      { generator: 'u8.geo-context', difficulty: 2 },
      { generator: 'u8.geo-context', difficulty: 3 },
      { generator: 'u8.geo-context', difficulty: 3 },
    ],
  },
  summary: [
    'A map becomes a coordinate grid with a scale. Do the geometry in grid units, then convert: home $(1, 2)$ to school $(7, 10)$ is $10$ units, which is $1$ mile at $0.1$ mile per unit.',
    'Straight-line distance uses the distance formula; walking along streets is the horizontal change plus the vertical change ($6 + 8 = 14$ units), which is never shorter.',
    'Halfway means midpoint; parallel or at a right angle means slopes; fencing means perimeter; sod or the size of a lot means area; cost is amount $\\times$ price.',
    'With $1$ unit $= k$, multiply lengths by $k$ and areas by $k^2$: $40$ square units at $10$ m per unit is $40 \\times 100 = 4{,}000$ m$^2$, not $400$.',
    'For an irregular lot, use the box method (box minus corner triangles), then scale: $56 - 20 = 36$ square units, which is $36 \\times 400 = 14{,}400$ ft$^2$ at $20$ ft per unit.',
  ],
  mastery: { quizPassScore: 0.8, practiceMinCorrect: 5 },
};
