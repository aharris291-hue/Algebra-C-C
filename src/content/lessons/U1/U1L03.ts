import type { LessonContent } from '../../../core/curriculum/types';

/**
 * U1L03 Slope as Rate of Change (A.FGR.2.2, A.MM.1.3)
 * Slope from two points, a table and a graph, and slope as a rate of change with units.
 *
 * Math verified by hand (2026-10-04): every worked example, table and graph below was recomputed independently.
 */
export const U1L03: LessonContent = {
  lessonId: 'U1L03',
  goal: 'Find the slope of a line from two points, a table, or a graph, and explain slope as a rate of change with units like "dollars per hour."',
  needToKnow: [
    { t: 'p', text: 'Slope is all about subtracting and dividing, so warm up with these:' },
    {
      t: 'list',
      items: [
        '**Subtract integers.** Subtracting a negative is adding: $3 - (-5) = 3 + 5 = 8$. And $-7 - 5 = -12$.',
        '**Divide with signs.** Same signs give a positive, different signs give a negative: $\\frac{-12}{4} = -3$ and $\\frac{-9}{-3} = 3$.',
        '**Simplify fractions.** $\\frac{6}{4} = \\frac{3}{2}$ because you can divide the top and bottom by $2$.',
      ],
    },
    { t: 'callout', variant: 'tip', title: 'Quick check', text: 'What is $\\frac{-1 - 7}{2 - (-2)}$? (You should get $\\frac{-8}{4} = -2$.) If that felt shaky, open **Teach Me Again** and choose the refresher.' },
  ],
  vocabulary: [
    { term: 'slope', meaning: 'How steep a line is: the change in $y$ divided by the change in $x$. Usually called $m$.' },
    { term: 'rise', meaning: 'The vertical change between two points (change in $y$).' },
    { term: 'run', meaning: 'The horizontal change between two points (change in $x$).' },
    { term: 'rate of change', meaning: 'How fast one quantity changes compared to another, such as miles per hour. For a line, it is the slope.' },
    { term: 'undefined', meaning: 'Has no value. Dividing by zero is undefined.' },
  ],
  instruction: [
    { t: 'p', text: '### Slope is rise over run' },
    { t: 'p', text: 'The **slope** of a line tells you how much $y$ changes every time $x$ goes up by $1$. Pick two points on the line, then count:' },
    { t: 'math', tex: 'm = \\frac{\\text{rise}}{\\text{run}} = \\frac{\\text{change in } y}{\\text{change in } x}' },
    {
      t: 'graph',
      caption: 'From (0, 1) to (3, 3): run 3 to the right, then rise 2 up. The slope is 2/3.',
      spec: { xMin: -5, xMax: 5, yMin: -5, yMax: 5, functions: [{ expr: '(2/3)x + 1', label: 'y = (2/3)x + 1' }], points: [{ x: 0, y: 1, label: '(0, 1)' }, { x: 3, y: 3, label: '(3, 3)' }], segments: [{ x1: 0, y1: 1, x2: 3, y2: 1, dashed: true, label: 'run 3' }, { x1: 3, y1: 1, x2: 3, y2: 3, dashed: true, label: 'rise 2' }], ariaLabel: 'Line through (0, 1) and (3, 3). A dashed run of 3 goes right from (0, 1) to (3, 1), then a dashed rise of 2 goes up to (3, 3).' },
    },
    { t: 'p', text: '### The slope formula' },
    { t: 'p', text: 'You do not need a graph. For any two points $(x_1, y_1)$ and $(x_2, y_2)$:' },
    { t: 'math', tex: 'm = \\frac{y_2 - y_1}{x_2 - x_1}' },
    { t: 'p', text: 'For $(1, 2)$ and $(4, 11)$:' },
    { t: 'math', tex: 'm = \\frac{11 - 2}{4 - 1} = \\frac{9}{3} = 3' },
    { t: 'callout', variant: 'warning', title: 'Keep the same order on top and bottom', text: 'Whichever point you start with on top, start with it on the bottom too. Starting with $(4, 11)$ instead gives $\\frac{2 - 11}{1 - 4} = \\frac{-9}{-3} = 3$, the same slope. Mixing the order, like $\\frac{11 - 2}{1 - 4} = \\frac{9}{-3} = -3$, gives the wrong sign.' },
    { t: 'p', text: '### Four kinds of slope' },
    {
      t: 'table',
      caption: 'Read every line from left to right.',
      headers: ['Slope', 'What the line does', 'Example points', 'Work'],
      rows: [
        ['Positive', 'goes up', '(0, 1) and (2, 5)', '(5 - 1)/(2 - 0) = 4/2 = 2'],
        ['Negative', 'goes down', '(0, 4) and (2, 0)', '(0 - 4)/(2 - 0) = -4/2 = -2'],
        ['Zero', 'is flat (horizontal)', '(1, 3) and (5, 3)', '(3 - 3)/(5 - 1) = 0/4 = 0'],
        ['Undefined', 'is straight up and down (vertical)', '(2, 1) and (2, 5)', '(5 - 1)/(2 - 2) = 4/0, undefined'],
      ],
    },
    { t: 'callout', variant: 'why', title: 'Why is vertical undefined?', text: 'A vertical line has a run of $0$, and you can never divide by $0$. A horizontal line has a rise of $0$, and $0$ divided by any nonzero number is just $0$. So "zero slope" and "no slope (undefined)" are different things.' },
    { t: 'p', text: '### Slope from a table' },
    { t: 'p', text: 'In a table, divide the change in $y$ by the change in $x$. Be careful when the $x$-values do **not** go up by the same amount each time:' },
    {
      t: 'table',
      caption: 'The y-values jump by 6, 9, then 12, but the x-values jump by 2, 3, then 4. Every rate is 3.',
      headers: ['x', 'y', 'change in y / change in x'],
      rows: [
        ['0', '4', ''],
        ['2', '10', '6/2 = 3'],
        ['5', '19', '9/3 = 3'],
        ['9', '31', '12/4 = 3'],
      ],
    },
    { t: 'p', text: '### Slope as a rate of change' },
    { t: 'p', text: 'In a real situation, slope has **units**: the units of $y$ **per** one unit of $x$. If you earn \\$30 for 2 hours of work and \\$75 for 5 hours:' },
    { t: 'math', tex: 'm = \\frac{75 - 30}{5 - 2} = \\frac{45}{3} = 15 \\ \\text{dollars per hour}' },
    { t: 'callout', variant: 'realworld', title: 'Say it in a sentence', text: 'The slope $15$ means **you earn \\$15 for each hour you work.** A negative rate means something is going down, like a phone battery losing charge.' },
  ],
  examples: [
    {
      title: 'Slope from two points',
      kind: 'introductory',
      problem: [{ t: 'p', text: 'Find the slope of the line through $(2, 3)$ and $(6, 11)$.' }],
      steps: [
        { text: 'Label the points.', tex: '(x_1, y_1) = (2, 3), \\quad (x_2, y_2) = (6, 11)', why: 'Labeling keeps the order the same on the top and the bottom.' },
        { text: 'Substitute into the slope formula.', tex: 'm = \\frac{11 - 3}{6 - 2}', why: 'Change in $y$ goes on top, change in $x$ on the bottom.' },
        { text: 'Simplify.', tex: 'm = \\frac{8}{4} = 2', why: 'The line rises $2$ units for every $1$ unit to the right.' },
      ],
      answer: '$m = 2$',
    },
    {
      title: 'Slope with negative numbers',
      kind: 'intermediate',
      problem: [{ t: 'p', text: 'Find the slope of the line through $(-3, 5)$ and $(1, -7)$.' }],
      steps: [
        { text: 'Substitute, using parentheses for negatives.', tex: 'm = \\frac{-7 - 5}{1 - (-3)}', why: 'Parentheses protect the negative sign of $x_1 = -3$.' },
        { text: 'Simplify the top and the bottom.', tex: 'm = \\frac{-12}{4}', why: '$-7 - 5 = -12$, and subtracting $-3$ is adding $3$: $1 + 3 = 4$.' },
        { text: 'Divide.', tex: 'm = -3', why: 'Different signs give a negative. The line goes down $3$ for every $1$ to the right.' },
      ],
      answer: '$m = -3$',
    },
    {
      title: 'A common mistake: mixed order and run over rise',
      kind: 'common-mistake',
      problem: [{ t: 'p', text: 'Find the slope through $(1, 4)$ and $(5, 12)$. One student got $-2$. Another got $\\frac{1}{2}$. What went wrong?' }],
      steps: [
        { text: 'Find the first student\'s error.', tex: '\\frac{12 - 4}{1 - 5} = \\frac{8}{-4} = -2 \\quad \\text{(wrong)}', why: 'The top starts with the second point ($12$) but the bottom starts with the first point ($1$). Mixing the order flips the sign.' },
        { text: 'Find the second student\'s error.', tex: '\\frac{5 - 1}{12 - 4} = \\frac{4}{8} = \\frac{1}{2} \\quad \\text{(wrong)}', why: 'That is run over rise. Slope is **rise over run**: change in $y$ on top.' },
        { text: 'Do it correctly.', tex: 'm = \\frac{12 - 4}{5 - 1} = \\frac{8}{4} = 2', why: 'Change in $y$ on top, change in $x$ on the bottom, and the same point first in both.' },
        { text: 'Sanity check.', why: 'As $x$ goes from $1$ to $5$, $y$ goes up from $4$ to $12$. The line goes up, so the slope must be positive.' },
      ],
      answer: '$m = 2$',
    },
    {
      title: 'Phone battery drain',
      kind: 'real-world',
      problem: [{ t: 'p', text: 'While gaming, a phone battery is at 84% after 2 hours and at 52% after 6 hours. The battery level goes down at a constant rate. Find the rate of change and explain what it means.' }],
      steps: [
        { text: 'Write the data as points (hours, percent).', tex: '(2, 84) \\text{ and } (6, 52)', why: 'Time is the input $x$ and battery level is the output $y$.' },
        { text: 'Find the slope.', tex: 'm = \\frac{52 - 84}{6 - 2} = \\frac{-32}{4} = -8', why: 'Change in battery level divided by change in time.' },
        { text: 'Attach units.', tex: '-8 \\ \\text{percent per hour}', why: 'The units are (units of $y$) per (unit of $x$): percent per hour.' },
        { text: 'Interpret.', why: 'The rate is negative because the battery is going down. **The battery loses 8% of its charge each hour of gaming.**' },
      ],
      answer: '$-8$ percent per hour: the battery drops 8% every hour.',
    },
    {
      title: 'A road trip table with uneven steps',
      kind: 'intermediate',
      problem: [
        { t: 'p', text: 'A family drives at a steady speed. Find the rate of change and give its units.' },
        {
          t: 'table',
          headers: ['Time (hours)', 'Distance (miles)'],
          rows: [
            ['1', '65'],
            ['3', '195'],
            ['4', '260'],
            ['7', '455'],
          ],
        },
      ],
      steps: [
        { text: 'Use the first two rows.', tex: '\\frac{195 - 65}{3 - 1} = \\frac{130}{2} = 65', why: 'The time jumps by $2$ hours here, not $1$, so you must divide by $2$.' },
        { text: 'Check with other rows.', tex: '\\frac{260 - 195}{4 - 3} = \\frac{65}{1} = 65, \\qquad \\frac{455 - 260}{7 - 4} = \\frac{195}{3} = 65', why: 'A constant rate between every pair of rows confirms the data is linear.' },
        { text: 'Attach units and interpret.', tex: '65 \\ \\text{miles per hour}', why: 'Miles (the $y$ units) per hour (the $x$ units). The family drives 65 miles each hour.' },
      ],
      answer: '65 miles per hour',
    },
    {
      title: 'Slope from a graph',
      kind: 'challenging',
      problem: [
        { t: 'p', text: 'Find the slope of the line.' },
        { t: 'graph', spec: { xMin: -5, xMax: 5, yMin: -5, yMax: 5, functions: [{ expr: '-1.5x + 1', label: 'line' }], points: [{ x: -2, y: 4 }, { x: 2, y: -2 }], ariaLabel: 'A line falling from left to right through the marked points (-2, 4) and (2, -2).' } },
      ],
      steps: [
        { text: 'Read two points where the line crosses grid corners.', tex: '(-2, 4) \\text{ and } (2, -2)', why: 'Points on exact grid corners give exact coordinates, so there is no guessing.' },
        { text: 'Count the rise and run from left to right.', tex: '\\text{rise} = -2 - 4 = -6, \\quad \\text{run} = 2 - (-2) = 4', why: 'Going right $4$ units, the line drops $6$ units, so the rise is negative.' },
        { text: 'Divide and simplify.', tex: 'm = \\frac{-6}{4} = -\\frac{3}{2}', why: 'Divide the top and bottom by $2$. The line goes down $3$ for every $2$ to the right.' },
      ],
      answer: '$m = -\\frac{3}{2}$',
    },
  ],
  teachMeAgain: [
    {
      approach: 'visual',
      title: 'Walk up the staircase',
      blocks: [
        { t: 'p', text: 'Think of a line as a staircase. Each step has a **run** (how far you walk forward) and a **rise** (how far you climb).' },
        { t: 'graph', caption: 'Each step: run 1, rise 2. Slope = 2/1 = 2.', spec: { xMin: -1, xMax: 5, yMin: -1, yMax: 7, functions: [{ expr: '2x', label: 'y = 2x' }], points: [{ x: 0, y: 0 }, { x: 1, y: 2 }, { x: 2, y: 4 }, { x: 3, y: 6 }], segments: [{ x1: 0, y1: 0, x2: 1, y2: 0, dashed: true }, { x1: 1, y1: 0, x2: 1, y2: 2, dashed: true }, { x1: 1, y1: 2, x2: 2, y2: 2, dashed: true }, { x1: 2, y1: 2, x2: 2, y2: 4, dashed: true }, { x1: 2, y1: 4, x2: 3, y2: 4, dashed: true }, { x1: 3, y1: 4, x2: 3, y2: 6, dashed: true }], ariaLabel: 'Line y = 2x through (0, 0), (1, 2), (2, 4) and (3, 6), with dashed stair steps of run 1 and rise 2 between the points.' } },
        { t: 'p', text: 'Every step is the same size, so the slope is the same everywhere on the line. Stairs going **down** as you walk right have a negative rise, so the slope is negative.' },
      ],
    },
    {
      approach: 'step-by-step',
      title: 'A 4-step checklist for the slope formula',
      blocks: [
        { t: 'list', ordered: true, items: ['**Label** the points: $(x_1, y_1)$ and $(x_2, y_2)$.', '**Top**: $y_2 - y_1$. Use parentheses for negatives.', '**Bottom**: $x_2 - x_1$, in the **same order** as the top.', '**Divide and simplify.** If the bottom is $0$, the slope is undefined.'] },
        { t: 'callout', variant: 'tip', text: 'Quick sign check: if the line goes up from left to right, your slope should be positive. If it goes down, negative.' },
      ],
    },
    {
      approach: 'prerequisite',
      title: 'Refresher: subtracting integers',
      blocks: [
        { t: 'list', items: ['Subtracting a negative is adding: $4 - (-3) = 4 + 3 = 7$.', 'Subtracting from a negative goes more negative: $-2 - 6 = -8$.', 'Same signs divide to a positive: $\\frac{-8}{-2} = 4$.', 'Different signs divide to a negative: $\\frac{-8}{2} = -4$.'] },
        { t: 'p', text: 'Try it: slope through $(-1, 2)$ and $(3, -6)$ is $\\frac{-6 - 2}{3 - (-1)} = \\frac{-8}{4} = -2$.' },
      ],
    },
    {
      approach: 'analogy',
      title: 'Speed is a slope',
      blocks: [
        { t: 'p', text: 'You already understand rates. "65 miles per hour" means every hour, the distance goes up 65 miles. That is a slope!' },
        { t: 'list', items: ['**Rise** = how much the distance changed (miles).', '**Run** = how much time passed (hours).', '**Slope** = miles divided by hours = miles per hour.'] },
        { t: 'p', text: 'Any rate works the same way: dollars per hour of work, texts per day, points per game. The word **per** means "divided by," and the thing before "per" goes on top.' },
      ],
    },
    {
      approach: 'simpler-example',
      title: 'Start with points that are easy to subtract',
      blocks: [
        { t: 'p', text: 'Points $(0, 0)$ and $(1, 3)$: go right $1$, up $3$. Slope $= \\frac{3}{1} = 3$.' },
        { t: 'p', text: 'Points $(0, 0)$ and $(2, 6)$: go right $2$, up $6$. Slope $= \\frac{6}{2} = 3$. Same line, same slope.' },
        { t: 'p', text: 'Now not starting at zero: $(1, 2)$ and $(3, 8)$. Right $3 - 1 = 2$, up $8 - 2 = 6$. Slope $= \\frac{6}{2} = 3$.' },
      ],
    },
    {
      approach: 'alternate-strategy',
      title: 'Add change columns to a table',
      blocks: [
        { t: 'p', text: 'Instead of the formula, write the change between rows right in the table, then divide.' },
        {
          t: 'table',
          headers: ['x', 'y', 'change in x', 'change in y', 'rate'],
          rows: [
            ['1', '7', '', '', ''],
            ['3', '3', '+2', '-4', '-4/2 = -2'],
            ['6', '-3', '+3', '-6', '-6/3 = -2'],
          ],
        },
        { t: 'p', text: 'The rate is $-2$ both times, so the slope is $-2$. This method makes uneven $x$ steps easy to spot.' },
      ],
    },
  ],
  guided: [
    { generator: 'u1.slope-points', difficulty: 1 },
    { generator: 'u1.slope-graph', difficulty: 1 },
    { generator: 'u1.slope-table', difficulty: 1 },
    { generator: 'u1.rate-context', difficulty: 1 },
  ],
  independent: {
    count: 8,
    reviewCount: 2,
    mix: [
      { generator: 'u1.slope-points', difficulty: 1, weight: 1 },
      { generator: 'u1.slope-points', difficulty: 2, weight: 2 },
      { generator: 'u1.slope-points', difficulty: 3, weight: 1 },
      { generator: 'u1.slope-table', difficulty: 2, weight: 1 },
      { generator: 'u1.slope-graph', difficulty: 2, weight: 1 },
      { generator: 'u1.rate-context', difficulty: 2, weight: 2 },
      { generator: 'u1.solve-fx', difficulty: 2, weight: 1 },
    ],
  },
  quiz: {
    items: [
      { generator: 'u1.slope-points', difficulty: 2 },
      { generator: 'u1.slope-points', difficulty: 3 },
      { generator: 'u1.slope-table', difficulty: 2 },
      { generator: 'u1.slope-graph', difficulty: 2 },
      { generator: 'u1.rate-context', difficulty: 2 },
      { generator: 'u1.rate-context', difficulty: 3 },
    ],
  },
  summary: [
    'Slope is rise over run: $m = \\frac{y_2 - y_1}{x_2 - x_1}$. Keep the same point first on the top and the bottom.',
    'Lines going up have positive slope, lines going down have negative slope, horizontal lines have slope $0$, and vertical lines have undefined slope.',
    'In a table, divide the change in $y$ by the change in $x$. Watch for $x$-values that do not go up by $1$.',
    'In context, slope is a rate of change: (units of $y$) **per** (unit of $x$), like dollars per hour.',
  ],
  mastery: { quizPassScore: 0.8, practiceMinCorrect: 5 },
};
