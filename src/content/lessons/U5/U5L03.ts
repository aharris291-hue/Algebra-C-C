import type { LessonContent } from '../../../core/curriculum/types';

/**
 * U5L03 Writing Exponential Growth and Decay Equations (A.PAR.8.3)
 * Write y = a(b)^x from words (doubles, triples, is cut in half), from a table, from a graph with labeled points and
 * from two points that do not include the y-intercept (divide the outputs to get b to the power of the gap, take the
 * root, then back-solve for a); contrast constant ratios with the constant differences of linear models; graph a
 * growth model and a decay model with axis labels and a sensible scale (S5.03).
 *
 * Math verified by hand (2026-10-07): every table value and graph point was recomputed by substitution into its
 * model (50(2)^x, 80(0.5)^x, 4(1.5)^x, 10(0.6)^x, 64(0.75)^x and the others), every ratio of consecutive outputs was
 * recomputed by division, every two-point model was re-solved (b from the quotient of the outputs and the gap in x,
 * then a = y / b^x) and checked to pass through BOTH given points, and the linear-versus-exponential table was
 * checked for constant differences and constant ratios.
 */
export const U5L03: LessonContent = {
  lessonId: 'U5L03',
  goal: 'Write an exponential equation $y = a(b)^x$ from a description, a table, a graph or two points, and graph exponential growth and decay models with labeled axes and a sensible scale.',
  needToKnow: [
    { t: 'p', text: 'Last lesson you learned to read an exponential model $y = a(b)^x$:' },
    {
      t: 'list',
      items: [
        '$a$ is the **initial value**: the value of $y$ when $x = 0$.',
        '$b$ is the **growth factor** if $b > 1$ or the **decay factor** if $0 < b < 1$: each time $x$ goes up by $1$, $y$ is multiplied by $b$.',
      ],
    },
    { t: 'p', text: 'You also know how to build a **linear** model $y = mx + b$ from a starting value and a constant rate of change. This lesson does the same kind of building for exponential models, but with multiplying instead of adding.' },
    { t: 'callout', variant: 'tip', title: 'Quick check', text: 'In $y = 200(0.9)^x$, what are the initial value and the factor, and is it growth or decay? (You should get initial value $200$, factor $0.9$, decay, because $0.9 < 1$.) If that felt shaky, open **Teach Me Again** and choose the refresher.' },
  ],
  vocabulary: [
    { term: 'exponential model', meaning: 'An equation $y = a(b)^x$ with $a \\ne 0$, $b > 0$ and $b \\ne 1$, where the output is multiplied by the same number $b$ each time $x$ goes up by $1$.' },
    { term: 'initial value', meaning: 'The number $a$: the value of $y$ when $x = 0$, because $b^0 = 1$.' },
    { term: 'common ratio', meaning: 'The number you get by dividing an output by the output just before it. In an exponential table it is the same every time, and it equals $b$.' },
    { term: 'growth factor', meaning: 'A value of $b$ greater than $1$, such as $2$ for "doubles" or $3$ for "triples".' },
    { term: 'decay factor', meaning: 'A value of $b$ between $0$ and $1$, such as $\\frac{1}{2} = 0.5$ for "is cut in half".' },
  ],
  instruction: [
    { t: 'p', text: '### What a and b mean' },
    { t: 'p', text: 'In $y = a(b)^x$, put in $x = 0$:' },
    { t: 'math', tex: 'y = a(b)^0 = a \\cdot 1 = a' },
    { t: 'p', text: 'So **$a$ is the starting value**, the output when $x = 0$. Each time $x$ goes up by $1$, you multiply by one more $b$, so **$b$ is what each output is multiplied by** to get the next one.' },
    { t: 'p', text: '### Add or multiply? Differences versus ratios' },
    { t: 'p', text: 'Both of these tables start at $3$ and go to $9$. Look at how they keep going.' },
    {
      t: 'table',
      caption: 'A linear model adds the same amount each time; an exponential model multiplies by the same amount each time.',
      headers: ['$x$', '$0$', '$1$', '$2$', '$3$', '$4$'],
      rows: [
        ['linear $y = 6x + 3$', '$3$', '$9$', '$15$', '$21$', '$27$'],
        ['exponential $y = 3(3)^x$', '$3$', '$9$', '$27$', '$81$', '$243$'],
      ],
    },
    { t: 'p', text: 'For the linear model, **subtract**: $9 - 3 = 6$, $15 - 9 = 6$, $21 - 15 = 6$. The differences are constant, so it adds $6$ each time.' },
    { t: 'p', text: 'For the exponential model, the differences are $6, 18, 54, 162$, which are not constant. Instead, **divide**: $\\frac{9}{3} = 3$, $\\frac{27}{9} = 3$, $\\frac{81}{27} = 3$, $\\frac{243}{81} = 3$. The **ratios** are constant, so it multiplies by $3$ each time, and $b = 3$.' },
    { t: 'callout', variant: 'why', title: 'Why dividing finds b', text: 'If the next output is the previous output times $b$, then the next output divided by the previous one is exactly $b$. In symbols, $\\frac{a \\cdot b^{x+1}}{a \\cdot b^{x}} = b$. Subtracting finds a constant **added** amount; dividing finds a constant **multiplied** amount.' },
    { t: 'p', text: '### From words' },
    {
      t: 'table',
      caption: 'Words that tell you the factor b.',
      headers: ['The words say', 'Factor $b$', 'Model if it starts at 50'],
      rows: [
        ['doubles each hour', '$2$', '$y = 50(2)^x$'],
        ['triples each hour', '$3$', '$y = 50(3)^x$'],
        ['is cut in half each hour', '$\\frac{1}{2} = 0.5$', '$y = 50(0.5)^x$'],
        ['grows to $1.5$ times as much each hour', '$1.5$', '$y = 50(1.5)^x$'],
      ],
    },
    { t: 'p', text: '### From a table or a graph' },
    { t: 'p', text: 'Find the output at $x = 0$: that is $a$. Then divide each output by the one before it: that common ratio is $b$. On a graph, read the labeled points and do the same thing. If the points are not one unit apart in $x$, you need the two-point method below.' },
    { t: 'p', text: '### From two points that do not include x = 0' },
    { t: 'p', text: 'Suppose the graph passes through $(1, 6)$ and $(3, 54)$. Neither point has $x = 0$, so you cannot read $a$ directly.' },
    {
      t: 'list',
      ordered: true,
      items: [
        '**Divide the outputs.** $\\frac{54}{6} = 9$. From $x = 1$ to $x = 3$ is $2$ steps, so you multiplied by $b$ twice: $b^2 = 9$.',
        '**Take the root.** $b = 3$. (Use the positive root, because $b$ must be positive.)',
        '**Back-solve for $a$.** At $x = 1$, $y = 6$: $6 = a(3)^1$, so $a = 2$.',
        '**Check both points.** $2(3)^1 = 6$ and $2(3)^3 = 2 \\cdot 27 = 54$. Both work, so $y = 2(3)^x$.',
      ],
    },
    { t: 'callout', variant: 'warning', title: 'The first point you are given is not always a', text: '$a$ is the value at $x = 0$ only. For the points $(1, 6)$ and $(3, 54)$, writing $y = 6(3)^x$ would give $y = 18$ at $x = 1$, not $6$. Always back-solve for $a$ and check.' },
    { t: 'p', text: '### Graphing a growth model' },
    { t: 'p', text: 'A lab culture starts with $50$ bacteria and doubles every hour, so $y = 50(2)^x$, where $x$ is hours and $y$ is the number of bacteria. The values are $50, 100, 200, 400, 800, 1600$ for $x = 0$ to $5$. They get large fast, so the vertical axis needs big steps: $200$ bacteria per grid line.' },
    {
      t: 'graph',
      caption: 'Bacteria growth y = 50(2)^x for 0 to 5 hours. Vertical scale: 200 bacteria per grid line.',
      spec: {
        xMin: 0,
        xMax: 6,
        yMin: 0,
        yMax: 1800,
        xStep: 1,
        yStep: 200,
        xLabel: 'time (hours)',
        yLabel: 'number of bacteria',
        functions: [{ expr: '50*2^x', label: 'y = 50(2)^x', domain: [0, 5] }],
        points: [
          { x: 0, y: 50, label: '(0, 50)' },
          { x: 1, y: 100, label: '(1, 100)' },
          { x: 2, y: 200, label: '(2, 200)' },
          { x: 3, y: 400, label: '(3, 400)' },
          { x: 4, y: 800, label: '(4, 800)' },
          { x: 5, y: 1600, label: '(5, 1600)' },
        ],
        ariaLabel: 'An increasing curve that starts at (0, 50) and passes through (1, 100), (2, 200), (3, 400), (4, 800) and (5, 1600), getting steeper as it goes. The horizontal axis is time in hours, scaled by 1; the vertical axis is the number of bacteria, scaled by 200.',
      },
    },
    { t: 'p', text: '### Graphing a decay model' },
    { t: 'p', text: 'A patient takes an $80$-milligram dose of a medicine, and half of what is left leaves the body each hour, so $y = 80(0.5)^x$. The values are $80, 40, 20, 10, 5, 2.5$ for $x = 0$ to $5$. Here a scale of $10$ milligrams per grid line fits.' },
    {
      t: 'graph',
      caption: 'Medicine in the body, y = 80(0.5)^x, for 0 to 6 hours. Vertical scale: 10 mg per grid line.',
      spec: {
        xMin: 0,
        xMax: 6,
        yMin: 0,
        yMax: 90,
        xStep: 1,
        yStep: 10,
        xLabel: 'time (hours)',
        yLabel: 'medicine left (mg)',
        functions: [{ expr: '80*(0.5)^x', label: 'y = 80(0.5)^x', domain: [0, 6] }],
        points: [
          { x: 0, y: 80, label: '(0, 80)' },
          { x: 1, y: 40, label: '(1, 40)' },
          { x: 2, y: 20, label: '(2, 20)' },
          { x: 3, y: 10, label: '(3, 10)' },
          { x: 4, y: 5, label: '(4, 5)' },
        ],
        ariaLabel: 'A decreasing curve that starts at (0, 80) and passes through (1, 40), (2, 20), (3, 10) and (4, 5), flattening out toward the horizontal axis without touching it. The horizontal axis is time in hours, scaled by 1; the vertical axis is milligrams of medicine left, scaled by 10.',
      },
    },
    {
      t: 'list',
      items: [
        '**Label both axes** with the quantity and its units.',
        '**Start the window at $0$** when time and amounts cannot be negative.',
        '**Choose the vertical scale from the biggest value you show**, so the graph fills the grid: steps of $200$ for values up to $1600$, steps of $10$ for values up to $80$.',
        '**Plot and label a few exact points**, then draw a smooth curve through them.',
      ],
    },
    { t: 'callout', variant: 'realworld', title: 'Where this shows up', text: 'Bacteria and viral videos that double, medicine and caffeine leaving your body, a bouncing ball losing height, and the value of a car or phone dropping over time are all modeled with $y = a(b)^x$.' },
  ],
  examples: [
    {
      title: 'From words: a colony that triples',
      kind: 'introductory',
      problem: [{ t: 'p', text: 'A colony of $120$ bacteria triples every hour. Write an equation for the number of bacteria $y$ after $x$ hours, and use it to find how many there are after $4$ hours.' }],
      steps: [
        { text: 'Find $a$.', tex: 'a = 120', why: 'The colony starts with $120$ bacteria, which is the amount at $x = 0$.' },
        { text: 'Find $b$.', tex: 'b = 3', why: '"Triples" means the amount is multiplied by $3$ every hour. It is not "add $3$".' },
        { text: 'Write the model.', tex: 'y = 120(3)^x', why: 'Put $a$ and $b$ into $y = a(b)^x$.' },
        { text: 'Evaluate at $x = 4$.', tex: 'y = 120(3)^4 = 120 \\cdot 81 = 9720', why: 'Do the exponent first: $3^4 = 81$. Then multiply by $120$. (Multiplying $120 \\cdot 3$ first and then raising to the 4th power would be wrong.)' },
      ],
      answer: '$y = 120(3)^x$; after $4$ hours there are $9720$ bacteria.',
    },
    {
      title: 'From a table',
      kind: 'intermediate',
      problem: [
        { t: 'p', text: 'Write an exponential equation for the table.' },
        {
          t: 'table',
          caption: 'Values of an exponential function.',
          headers: ['$x$', '$0$', '$1$', '$2$', '$3$'],
          rows: [['$y$', '$64$', '$48$', '$36$', '$27$']],
        },
      ],
      steps: [
        { text: 'Read $a$ at $x = 0$.', tex: 'a = 64', why: '$a$ is always the output when $x = 0$.' },
        { text: 'Divide each output by the one before it.', tex: '\\frac{48}{64} = 0.75, \\quad \\frac{36}{48} = 0.75, \\quad \\frac{27}{36} = 0.75', why: 'Dividing finds what each output is multiplied by. The ratio is the same every time, so the table really is exponential.' },
        { text: 'Write the model.', tex: 'y = 64(0.75)^x', why: '$b = 0.75$. Since $0.75 < 1$, this is decay: each output is $75\\%$ of the one before.' },
        { text: 'Check a value.', tex: '64(0.75)^3 = 64 \\cdot 0.421875 = 27', why: 'The model reproduces the last entry in the table.' },
      ],
      answer: '$y = 64(0.75)^x$',
    },
    {
      title: 'From a graph with labeled points',
      kind: 'intermediate',
      problem: [
        { t: 'p', text: 'Write the equation of the exponential function graphed below.' },
        {
          t: 'graph',
          caption: 'An exponential curve through three labeled points.',
          spec: {
            xMin: -1,
            xMax: 4,
            yMin: 0,
            yMax: 16,
            yStep: 2,
            functions: [{ expr: '4*(1.5)^x' }],
            points: [
              { x: 0, y: 4, label: '(0, 4)' },
              { x: 1, y: 6, label: '(1, 6)' },
              { x: 2, y: 9, label: '(2, 9)' },
            ],
            ariaLabel: 'An increasing exponential curve passing through the labeled points (0, 4), (1, 6) and (2, 9). The vertical axis is scaled by 2.',
          },
        },
      ],
      steps: [
        { text: 'Read the y-intercept.', tex: 'a = 4', why: 'The point $(0, 4)$ is where the graph crosses the $y$-axis, so the value at $x = 0$ is $4$.' },
        { text: 'Divide consecutive outputs.', tex: '\\frac{6}{4} = 1.5, \\quad \\frac{9}{6} = 1.5', why: 'The points are $1$ unit apart in $x$, so each ratio is one factor of $b$.' },
        { text: 'Write and check.', tex: 'y = 4(1.5)^x, \\quad 4(1.5)^2 = 4 \\cdot 2.25 = 9', why: 'The model passes through $(2, 9)$. It is growth because $1.5 > 1$, which matches the rising graph.' },
      ],
      answer: '$y = 4(1.5)^x$',
    },
    {
      title: 'A common mistake: subtracting instead of dividing',
      kind: 'common-mistake',
      problem: [
        { t: 'p', text: 'A student looked at this table, saw that $y$ goes up by $5$ from $x = 0$ to $x = 1$, and wrote $y = 5x + 5$. Find the error and write the correct equation.' },
        {
          t: 'table',
          caption: 'The table the student used.',
          headers: ['$x$', '$0$', '$1$', '$2$', '$3$'],
          rows: [['$y$', '$5$', '$10$', '$20$', '$40$']],
        },
      ],
      steps: [
        { text: 'Test the student\'s equation on the whole table.', tex: 'x = 2: \\; 5(2) + 5 = 15 \\ne 20', why: 'A model has to fit every row, not just the first two.' },
        { text: 'Look at the differences.', tex: '10 - 5 = 5, \\quad 20 - 10 = 10, \\quad 40 - 20 = 20', why: 'The differences are not constant, so the table is not linear.' },
        { text: 'Look at the ratios instead.', tex: '\\frac{10}{5} = 2, \\quad \\frac{20}{10} = 2, \\quad \\frac{40}{20} = 2', why: 'The ratios are constant, so the output is multiplied by $2$ each time: exponential with $b = 2$.' },
        { text: 'Write and check.', tex: 'y = 5(2)^x, \\quad 5(2)^3 = 5 \\cdot 8 = 40', why: '$a = 5$ is the value at $x = 0$, and the model fits the last row.' },
      ],
      answer: '$y = 5(2)^x$. Check the ratios, not just the first difference.',
    },
    {
      title: 'A bouncing ball',
      kind: 'real-world',
      problem: [{ t: 'p', text: 'Marcus drops a ball from a height of $10$ feet. On each bounce it rises to $0.6$ of its previous height. (a) Write a model for the height $y$ of the ball after bounce number $x$. (b) How high does it go after the 3rd bounce? (c) Choose labels and a scale for a graph.' }],
      steps: [
        { text: '(a) Find $a$ and $b$.', tex: 'a = 10, \\quad b = 0.6', why: 'Before any bounces ($x = 0$) the height is $10$ feet. Each bounce multiplies the height by $0.6$.' },
        { text: 'Write the model.', tex: 'y = 10(0.6)^x', why: '$0 < 0.6 < 1$, so this is decay, which makes sense: the ball never bounces higher than before.' },
        { text: '(b) Evaluate at $x = 3$.', tex: '10(0.6)^3 = 10 \\cdot 0.216 = 2.16 \\text{ ft}', why: '$0.6 \\cdot 0.6 \\cdot 0.6 = 0.216$.' },
        { text: '(c) Choose labels and a scale.', why: 'The horizontal axis is "bounce number" from $0$ to $5$ in steps of $1$; the vertical axis is "height (ft)" from $0$ to $12$ in steps of $2$, which fits the starting height of $10$ feet. The points are $(0, 10)$, $(1, 6)$, $(2, 3.6)$, $(3, 2.16)$ and $(4, 1.296)$.' },
      ],
      answer: '(a) $y = 10(0.6)^x$; (b) $2.16$ feet; (c) bounce number $0$ to $5$ by $1$s, height $0$ to $12$ feet by $2$s.',
    },
    {
      title: 'Two points, neither on the y-axis',
      kind: 'challenging',
      problem: [{ t: 'p', text: 'An exponential function $y = a(b)^x$ passes through $(2, 12)$ and $(5, 96)$. Write its equation.' }],
      steps: [
        { text: 'Divide the later output by the earlier one.', tex: '\\frac{96}{12} = 8', why: 'Going from $x = 2$ to $x = 5$ multiplies the output by $b$ once for each step.' },
        { text: 'Count the steps and set up the power.', tex: 'b^{5 - 2} = b^3 = 8', why: 'There are $3$ steps from $x = 2$ to $x = 5$, so the output was multiplied by $b$ three times.' },
        { text: 'Take the cube root.', tex: 'b = 2', why: '$2 \\cdot 2 \\cdot 2 = 8$. Do **not** divide $8$ by $3$: the $3$ is an exponent, not a factor.' },
        { text: 'Back-solve for $a$ using $(2, 12)$.', tex: '12 = a(2)^2 = 4a \\;\\Longrightarrow\\; a = 3', why: 'The point $(2, 12)$ makes the equation true. $a$ is not $12$, because $12$ is the value at $x = 2$, not at $x = 0$.' },
        { text: 'Check both points.', tex: '3(2)^2 = 12, \\quad 3(2)^5 = 3 \\cdot 32 = 96', why: 'A correct model passes through every given point.' },
      ],
      answer: '$y = 3(2)^x$',
    },
  ],
  teachMeAgain: [
    {
      approach: 'visual',
      title: 'Same start, different factor',
      blocks: [
        { t: 'p', text: 'All three graphs start at $(0, 4)$, so they all have $a = 4$. Only $b$ is different.' },
        {
          t: 'graph',
          caption: 'Three exponential graphs with a = 4: b = 2, b = 1.5 and b = 0.5.',
          spec: {
            xMin: -1,
            xMax: 4,
            yMin: 0,
            yMax: 20,
            yStep: 2,
            functions: [
              { expr: '4*2^x', label: 'b = 2' },
              { expr: '4*(1.5)^x', label: 'b = 1.5', dashed: true },
              { expr: '4*(0.5)^x', label: 'b = 0.5' },
            ],
            points: [
              { x: 0, y: 4, label: '(0, 4)' },
              { x: 1, y: 8, label: '(1, 8)' },
              { x: 1, y: 6, label: '(1, 6)' },
              { x: 1, y: 2, label: '(1, 2)' },
            ],
            ariaLabel: 'Three exponential curves all crossing the y-axis at (0, 4). At x = 1, the b = 2 curve is at 8, the b = 1.5 curve is at 6, and the b = 0.5 curve is at 2. The first two rise to the right; the b = 0.5 curve falls toward the x-axis.',
          },
        },
        { t: 'p', text: 'Where a graph crosses the $y$-axis tells you $a$. One step to the right tells you $b$: $\\frac{8}{4} = 2$, $\\frac{6}{4} = 1.5$, $\\frac{2}{4} = 0.5$. Rising graphs have $b > 1$; falling graphs have $0 < b < 1$.' },
      ],
    },
    {
      approach: 'simpler-example',
      title: 'Doubling pennies',
      blocks: [
        { t: 'p', text: 'You put $3$ pennies in a jar on day $0$, and every day you double what is in the jar.' },
        {
          t: 'table',
          caption: 'Pennies in the jar.',
          headers: ['Day $x$', '$0$', '$1$', '$2$', '$3$', '$4$'],
          rows: [['Pennies $y$', '$3$', '$6$', '$12$', '$24$', '$48$']],
        },
        { t: 'p', text: 'Day $3$ is $3 \\cdot 2 \\cdot 2 \\cdot 2 = 3(2)^3 = 24$. Day $x$ is $3$ multiplied by $x$ twos, so $y = 3(2)^x$. The starting amount is $a = 3$, and the "doubling" is $b = 2$.' },
      ],
    },
    {
      approach: 'analogy',
      title: 'A copy machine on repeat',
      blocks: [
        { t: 'p', text: 'Picture a copy machine set to $150\\%$. You copy a $4$-inch picture, then copy the copy, then copy that copy. The sizes are $4$, $6$, $9$, $13.5$ inches. Every copy is $1.5$ times the one before, no matter how big it already is.' },
        { t: 'p', text: 'That is exactly $y = a(b)^x$: $a = 4$ is the original picture, $b = 1.5$ is the machine setting, and $x$ is how many times you pressed copy. Set the machine to $50\\%$ instead and you get decay: $y = 4(0.5)^x$.' },
      ],
    },
    {
      approach: 'prerequisite',
      title: 'Refresher: exponents and roots you need',
      blocks: [
        { t: 'list', items: [
          '$b^0 = 1$ for any $b \\ne 0$. That is why $a(b)^0 = a$.',
          '$b^3$ means $b \\cdot b \\cdot b$: three factors of $b$, not $3 \\cdot b$.',
          'Order of operations: in $5(2)^3$, do $2^3 = 8$ first, then $5 \\cdot 8 = 40$.',
          'Undoing a power: if $b^2 = 25$ then $b = 5$ (positive root); if $b^3 = 27$ then $b = 3$; if $b^2 = \\frac{1}{4}$ then $b = \\frac{1}{2}$.',
        ] },
        { t: 'p', text: 'With these, the two-point method is just: divide, take the root, back-solve.' },
      ],
    },
    {
      approach: 'step-by-step',
      title: 'A recipe for any exponential model',
      blocks: [
        { t: 'list', ordered: true, items: [
          '**Find $a$:** the value at $x = 0$ (the starting amount, the $y$-intercept, or the table entry under $0$).',
          '**Find $b$:** words ("doubles" is $2$, "halves" is $0.5$) or divide one output by the one before it.',
          '**No point at $x = 0$?** Divide the outputs of the two points to get $b^{\\text{gap}}$, take the root, then substitute one point to solve for $a$.',
          '**Write** $y = a(b)^x$.',
          '**Check** your equation with every given point.',
        ] },
      ],
    },
    {
      approach: 'alternate-strategy',
      title: 'Two equations, then divide them',
      blocks: [
        { t: 'p', text: 'For the points $(2, 12)$ and $(5, 96)$, substitute each point into $y = a(b)^x$ to get two equations:' },
        { t: 'math', tex: '96 = a \\cdot b^5 \\qquad 12 = a \\cdot b^2' },
        { t: 'p', text: 'Divide the first equation by the second. The $a$ cancels, and the quotient rule for exponents subtracts the exponents:' },
        { t: 'math', tex: '\\frac{96}{12} = \\frac{a \\cdot b^5}{a \\cdot b^2} \\;\\Longrightarrow\\; 8 = b^3 \\;\\Longrightarrow\\; b = 2' },
        { t: 'p', text: 'Then $12 = a(2)^2$ gives $a = 3$, so $y = 3(2)^x$. This shows **why** the gap in $x$ becomes the exponent on $b$.' },
      ],
    },
  ],
  guided: [
    { generator: 'u5.write-exponential', difficulty: 1 },
    { generator: 'u5.write-exponential', difficulty: 1 },
    { generator: 'u5.write-exponential', difficulty: 2 },
    { generator: 'u5.write-exponential', difficulty: 2 },
  ],
  independent: {
    count: 8,
    reviewCount: 2,
    mix: [
      { generator: 'u5.write-exponential', difficulty: 1, weight: 1 },
      { generator: 'u5.write-exponential', difficulty: 2, weight: 2 },
      { generator: 'u5.write-exponential', difficulty: 3, weight: 1 },
    ],
  },
  quiz: {
    items: [
      { generator: 'u5.write-exponential', difficulty: 1 },
      { generator: 'u5.write-exponential', difficulty: 2 },
      { generator: 'u5.write-exponential', difficulty: 2 },
      { generator: 'u5.write-exponential', difficulty: 2 },
      { generator: 'u5.write-exponential', difficulty: 3 },
      { generator: 'u5.write-exponential', difficulty: 3 },
    ],
  },
  summary: [
    'In $y = a(b)^x$, $a$ is the value at $x = 0$ and $b$ is what each output is multiplied by when $x$ goes up by $1$.',
    'Linear tables have constant differences (subtract); exponential tables have constant ratios (divide). "Doubles" means $b = 2$, "triples" $b = 3$, "is cut in half" $b = 0.5$.',
    'From two points not on the $y$-axis: divide the outputs to get $b$ raised to the gap in $x$, take the root, then substitute a point to solve for $a$.',
    'Check every model with every given point, and graph it with labeled axes and a vertical scale chosen to fit the largest value.',
  ],
  mastery: { quizPassScore: 0.8, practiceMinCorrect: 5 },
};
