import type { LessonContent } from '../../../core/curriculum/types';

/**
 * U5L05 Exponential Constraints (A.PAR.8.4)
 * Why a(b)^x with a > 0 and b > 0 is always positive (never 0, never negative) and has the x-axis as a
 * horizontal asymptote; for t >= 0 a growth model never drops below its start and a decay model never rises
 * above it; whole-number contexts such as bacteria counted after whole hours; the constant-ratio test for a
 * table of data; and deciding whether a value is viable or nonviable in context, building on S2.04 (S5.05).
 *
 * Math verified by hand (2026-10-07): every model value below was recomputed with node (3(2)^x for x = -10..3,
 * 4(0.5)^x, 80(0.5)^x, 40(1.5)^x and 40(0.5)^x, 2000(1.04)^t for t = 0..6, 24000(0.85)^t for t = 0..7,
 * 100(2)^h for h = 0..6), every table ratio was recomputed by division, the two-point model through (1, 48)
 * and (3, 108) was re-derived (b^2 = 2.25, b = 1.5, a = 32) and checked at t = 2 and t = 4, and every graph
 * expression was parsed and evaluated at its labeled points with src/core/math/parser.ts.
 */
export const U5L05: LessonContent = {
  lessonId: 'U5L05',
  goal: 'Decide whether a value or a data point is possible (viable) or not possible (nonviable) for an exponential model $y = a(b)^x$, using the facts that the outputs are always positive, that growth never drops below the start and decay never rises above it, and that real counts must make sense in the situation.',
  needToKnow: [
    { t: 'p', text: 'This lesson puts together three ideas you already know:' },
    {
      t: 'list',
      items: [
        '**Exponential models.** In $y = a(b)^x$, $a$ is the initial value (the output when $x = 0$) and $b$ is the factor you multiply by each time $x$ goes up by $1$. If $b > 1$ it is growth; if $0 < b < 1$ it is decay.',
        '**Viable or nonviable (Unit 2).** A solution is viable when it fits the math **and** makes sense in the real situation. You cannot buy $-3$ shirts or $2.5$ tickets.',
        '**Zero and negative exponents.** $2^0 = 1$, $2^{-1} = \\frac{1}{2}$ and $2^{-3} = \\frac{1}{8}$.',
      ],
    },
    { t: 'callout', variant: 'tip', title: 'Quick check', text: 'Find $y = 5(2)^x$ when $x = 3$ and when $x = -1$. (You should get $5 \\cdot 8 = 40$ and $5 \\cdot \\frac{1}{2} = 2.5$.) If that felt shaky, open **Teach Me Again** and choose the refresher.' },
  ],
  vocabulary: [
    { term: 'constraint', meaning: 'A limit on the values that are allowed, either from the math (outputs must be positive) or from the situation (time cannot be negative, people come in whole numbers).' },
    { term: 'viable', meaning: 'Possible: the value fits the model **and** makes sense in the situation.' },
    { term: 'nonviable', meaning: 'Not possible: the model can never produce the value, or the value makes no sense in the situation.' },
    { term: 'horizontal asymptote', meaning: 'A horizontal line that a graph gets closer and closer to but never touches. For $y = a(b)^x$ with $a > 0$ and $b > 0$, it is the $x$-axis, $y = 0$.' },
    { term: 'common ratio', meaning: 'The number you get by dividing each output by the one before it, when the inputs go up by $1$. If it is the same every time, the data are exponential.' },
  ],
  instruction: [
    { t: 'p', text: '### An exponential model is always positive' },
    { t: 'p', text: 'Look at $y = 3(2)^x$. Going right, you keep multiplying by $2$. Going left, you keep **dividing** by $2$:' },
    {
      t: 'table',
      caption: 'Values of y = 3(2)^x. Moving left halves the output each time; it never reaches 0.',
      headers: ['$x$', '$-3$', '$-2$', '$-1$', '$0$', '$1$', '$2$', '$3$'],
      rows: [['$y$', '$0.375$', '$0.75$', '$1.5$', '$3$', '$6$', '$12$', '$24$']],
    },
    { t: 'p', text: 'Half of a positive number is still positive. You can halve $3$ as many times as you like (at $x = -10$ you get $3 \\cdot \\frac{1}{1024} \\approx 0.0029$), but you never land on $0$, and you never cross below it.' },
    {
      t: 'graph',
      caption: 'The graph of y = 3(2)^x gets closer and closer to the x-axis on the left but never touches it.',
      spec: {
        xMin: -6,
        xMax: 3,
        yMin: -2,
        yMax: 26,
        yStep: 2,
        functions: [{ expr: '3(2)^x', label: 'y = 3(2)^x' }],
        points: [
          { x: -2, y: 0.75, label: '(-2, 0.75)' },
          { x: -1, y: 1.5, label: '(-1, 1.5)' },
          { x: 0, y: 3, label: '(0, 3)' },
          { x: 1, y: 6, label: '(1, 6)' },
          { x: 2, y: 12, label: '(2, 12)' },
          { x: 3, y: 24, label: '(3, 24)' },
        ],
        ariaLabel: 'An increasing exponential curve through (-2, 0.75), (-1, 1.5), (0, 3), (1, 6), (2, 12) and (3, 24). On the left it flattens out just above the x-axis without ever touching it.',
      },
    },
    { t: 'callout', variant: 'why', title: 'Why the output can never be 0 or negative', text: 'When $a > 0$ and $b > 0$, the output $a(b)^x$ is the positive starting value $a$ multiplied by the positive number $b$ over and over (or, for negative $x$, divided by $b$ over and over). Positive times positive is positive, and positive divided by positive is positive. No step can ever produce $0$ or a negative number. The $x$-axis, $y = 0$, is a **horizontal asymptote**: the curve hugs it but never touches it.' },
    { t: 'p', text: 'So for any model like $y = 3(2)^x$ or $y = 80(0.5)^x$, the values $y = 0$ and $y = -5$ are **nonviable**. The model can never produce them.' },
    { t: 'p', text: '### Starting at time 0: growth stays above, decay stays below' },
    { t: 'p', text: 'In a real situation, $x$ usually stands for time since the start, so only $x \\ge 0$ counts. That adds another constraint.' },
    {
      t: 'graph',
      caption: 'For x at least 0, the growth model 40(1.5)^x stays on or above 40, and the decay model 40(0.5)^x stays on or below 40 but above 0.',
      spec: {
        xMin: -0.5,
        xMax: 4,
        yMin: -10,
        yMax: 150,
        yStep: 10,
        functions: [
          { expr: '40(1.5)^x', label: 'growth: y = 40(1.5)^x', domain: [0, 4] },
          { expr: '40(0.5)^x', label: 'decay: y = 40(0.5)^x', domain: [0, 4] },
          { expr: '40', label: 'start: y = 40', dashed: true },
        ],
        points: [
          { x: 0, y: 40, label: 'start (0, 40)' },
          { x: 1, y: 60, label: '(1, 60)' },
          { x: 2, y: 90, label: '(2, 90)' },
          { x: 3, y: 135, label: '(3, 135)' },
          { x: 1, y: 20, label: '(1, 20)' },
          { x: 2, y: 10, label: '(2, 10)' },
          { x: 3, y: 5, label: '(3, 5)' },
        ],
        ariaLabel: 'Two curves starting at (0, 40) with a dashed horizontal line at y = 40. The growth curve rises through (1, 60), (2, 90) and (3, 135), always above the line. The decay curve falls through (1, 20), (2, 10) and (3, 5), always below the line and above the x-axis.',
      },
    },
    {
      t: 'table',
      caption: 'The possible outputs of y = a(b)^x with a > 0, when x is time and x is at least 0.',
      headers: ['Model', 'Possible outputs for $x \\ge 0$', 'Nonviable outputs'],
      rows: [
        ['growth, $b > 1$', '$y \\ge a$', 'anything less than $a$ (including $0$ and negatives)'],
        ['decay, $0 < b < 1$', '$0 < y \\le a$', 'anything greater than $a$, and $0$ or less'],
      ],
    },
    { t: 'callout', variant: 'why', title: 'Why growth never dips below the start', text: 'A growth model starts at $a$ and every step multiplies by a number bigger than $1$, so every step makes the value bigger. It can never come back down below $a$. A decay model multiplies by a number between $0$ and $1$, so every step makes the value smaller, but still positive. It can never climb back above $a$.' },
    { t: 'p', text: '### Whole-number situations' },
    { t: 'p', text: 'Some situations only make sense with whole numbers, or are only checked at whole-number times. A lab starts with $100$ bacteria, and the count doubles every hour: $B = 100(2)^h$. If the lab counts **after each whole hour**, the only counts it can record are' },
    { t: 'math', tex: '100, \\; 200, \\; 400, \\; 800, \\; 1600, \\; 3200, \\; \\dots' },
    { t: 'p', text: 'A recorded count of $1000$ after a whole number of hours is nonviable: $800$ is too small ($h = 3$) and $1600$ is too big ($h = 4$), and there is no whole number of hours in between. A count of $6400$ is viable: $h = 6$.' },
    { t: 'p', text: '### Does a table fit an exponential model?' },
    { t: 'p', text: 'When the inputs go up by $1$ each time, an exponential model multiplies by the same $b$ each time. So divide each output by the one before it. If every ratio is the same, an exponential model fits; if not, it does not.' },
    {
      t: 'table',
      caption: 'Table A has a constant ratio of 3, so it is exponential. Table B does not; it adds 4 each time, so it is linear.',
      headers: ['$x$', '$0$', '$1$', '$2$', '$3$', 'Ratios'],
      rows: [
        ['Table A: $y$', '$5$', '$15$', '$45$', '$135$', '$3, 3, 3$'],
        ['Table B: $y$', '$4$', '$8$', '$12$', '$16$', '$2, 1.5, 1.\\overline{3}$'],
      ],
    },
    { t: 'p', text: 'Table A fits $y = 5(3)^x$. Table B starts by doubling, but the ratios change, so no exponential model fits all four points. And a table that contains $0$ or a negative output can **never** fit $y = a(b)^x$ with $a > 0$ and $b > 0$.' },
    { t: 'callout', variant: 'warning', title: 'Two different questions', text: '"Can the model produce this number?" is a math question. "Does this number make sense here?" is a context question. A value is viable only if the answer to **both** is yes. For example, $B = 100(2)^h$ does equal $1000$ at about $h = 3.3$, but if the lab only counts after whole hours, $1000$ will never be recorded.' },
    { t: 'callout', variant: 'realworld', title: 'Where this shows up', text: 'Scientists check whether lab data have a constant ratio before using an exponential model, a car dealer knows a depreciating car never becomes worth less than nothing, and a news report claiming a growing town "shrank below where it started" would mean the growth model no longer fits.' },
  ],
  examples: [
    {
      title: 'Can the output be 0 or negative?',
      kind: 'introductory',
      problem: [{ t: 'p', text: 'For $y = 4(0.5)^x$, decide whether each output is viable: (a) $y = 0.125$, (b) $y = 0$, (c) $y = -2$.' }],
      steps: [
        { text: 'Make a table.', tex: 'x = 0, 1, 2, 3, 4, 5: \\quad y = 4, \\; 2, \\; 1, \\; 0.5, \\; 0.25, \\; 0.125', why: 'Each step multiplies by $0.5$, which cuts the value in half.' },
        { text: '(a) Look for $0.125$.', tex: '4(0.5)^5 = 4 \\cdot \\frac{1}{32} = 0.125', why: '$0.125$ appears in the table at $x = 5$, so the model does produce it.' },
        { text: '(b) and (c) Ask whether halving can ever reach $0$ or go negative.', why: '$a = 4 > 0$ and $b = 0.5 > 0$. Half of a positive number is always positive, so the outputs get closer and closer to $0$ but never reach it, and never go below it.' },
      ],
      answer: '(a) viable, at $x = 5$; (b) nonviable; (c) nonviable. The outputs of $y = 4(0.5)^x$ are always greater than $0$.',
    },
    {
      title: 'Does an exponential model fit the data?',
      kind: 'intermediate',
      problem: [
        { t: 'p', text: 'Decide whether an exponential model fits each table. If one does, write it.' },
        {
          t: 'table',
          caption: 'Two data sets.',
          headers: ['$x$', '$0$', '$1$', '$2$', '$3$'],
          rows: [
            ['Table A: $y$', '$6$', '$18$', '$54$', '$162$'],
            ['Table B: $y$', '$6$', '$12$', '$18$', '$24$'],
          ],
        },
      ],
      steps: [
        { text: 'Table A: divide each output by the one before it.', tex: '\\frac{18}{6} = 3, \\quad \\frac{54}{18} = 3, \\quad \\frac{162}{54} = 3', why: 'The inputs go up by $1$ each time, so an exponential model would multiply by the same factor $b$ each time.' },
        { text: 'Table A: write the model.', tex: 'y = 6(3)^x', why: 'The ratio is a constant $3$, so $b = 3$. The output at $x = 0$ is $6$, so $a = 6$. Check: $6(3)^3 = 6 \\cdot 27 = 162$.' },
        { text: 'Table B: divide the same way.', tex: '\\frac{12}{6} = 2, \\quad \\frac{18}{12} = 1.5, \\quad \\frac{24}{18} = 1.\\overline{3}', why: 'The ratios are not all the same, so there is no single factor $b$ that works for every step.' },
        { text: 'Table B: name what it is instead.', tex: '12 - 6 = 18 - 12 = 24 - 18 = 6', why: 'It adds $6$ each time (a constant difference), so it is linear: $y = 6x + 6$.' },
      ],
      answer: 'Table A is exponential: $y = 6(3)^x$. Table B is not exponential (its ratios change); it is linear.',
    },
    {
      title: 'Growth never dips below the start',
      kind: 'intermediate',
      problem: [{ t: 'p', text: 'A town of $2000$ people grows by $4\\%$ a year, so its population is $P = 2000(1.04)^t$ after $t$ years, $t \\ge 0$. Is each population viable under the model? (a) $1800$, (b) $2080$, (c) $2500$.' }],
      steps: [
        { text: 'Name the constraint.', tex: 'b = 1.04 > 1, \\; t \\ge 0 \\;\\Rightarrow\\; P \\ge 2000', why: 'It is a growth model, and time starts at $0$. Each year multiplies by more than $1$, so the population never goes below its starting value.' },
        { text: '(a) Compare $1800$ with the start.', why: '$1800 < 2000$. The model would need to shrink, which growth never does for $t \\ge 0$. Nonviable.' },
        { text: '(b) Check one year.', tex: 'P(1) = 2000(1.04) = 2080', why: 'The model produces $2080$ exactly at $t = 1$. Viable.' },
        { text: '(c) Trap $2500$ between two years.', tex: 'P(5) \\approx 2433.3, \\quad P(6) \\approx 2530.6', why: '$2500$ is between these, and the model grows smoothly in between, so it reaches $2500$ partway through the sixth year. Viable.' },
      ],
      answer: '(a) nonviable (below the start); (b) viable at $t = 1$; (c) viable, between $t = 5$ and $t = 6$ years.',
    },
    {
      title: 'Bacteria counted every hour',
      kind: 'real-world',
      problem: [{ t: 'p', text: 'In biology class, Keisha\'s culture starts with $100$ bacteria and doubles every hour: $B = 100(2)^h$. She records the count once at the end of each whole hour, starting at $h = 0$. Which of these could appear in her notebook? (a) $800$, (b) $1000$, (c) $50$, (d) $3200$.' }],
      steps: [
        { text: 'List the counts she can record.', tex: 'h = 0, 1, 2, 3, 4, 5: \\quad B = 100, \\; 200, \\; 400, \\; 800, \\; 1600, \\; 3200', why: 'She only counts at whole hours, so only these outputs (and the larger ones after them) can appear.' },
        { text: '(a) $800$.', tex: '100(2)^3 = 800', why: 'It is on the list at $h = 3$. Viable.' },
        { text: '(b) $1000$.', why: '$800 < 1000 < 1600$, so $1000$ falls between $h = 3$ and $h = 4$. The culture does pass $1000$ at some moment, but not at a whole hour, so she never writes it down. Nonviable.' },
        { text: '(c) $50$.', why: '$100(2)^{-1} = 50$, but $h = -1$ is an hour **before** the experiment started. It is a growth model with $h \\ge 0$, so the count is never below $100$. Nonviable.' },
        { text: '(d) $3200$.', tex: '100(2)^5 = 3200', why: 'It is on the list at $h = 5$. Viable.' },
      ],
      answer: '$800$ (hour 3) and $3200$ (hour 5) are viable. $1000$ (not at a whole hour) and $50$ (before the start) are nonviable.',
    },
    {
      title: 'A common mistake: subtracting the percent each year',
      kind: 'common-mistake',
      problem: [{ t: 'p', text: 'A car is worth \\$24,000 and loses $15\\%$ of its value each year, so $V = 24000(0.85)^t$. A student says: "$15\\% \\times 7 = 105\\%$, so after $7$ years the car has lost more than all of its value and is worth a negative amount." Find the mistake.' }],
      steps: [
        { text: 'Check the claim against the constraint.', why: '$a = 24000 > 0$ and $b = 0.85 > 0$, so $V$ is always positive. A negative value is nonviable for this model, so the student\'s reasoning must be wrong somewhere.' },
        { text: 'Find the mistake.', why: 'Each year the car loses $15\\%$ of what it is worth **that year**, not $15\\%$ of the original \\$24,000. As the value shrinks, $15\\%$ of it is a smaller and smaller amount, so the percents cannot just be added.' },
        { text: 'Compute the real value.', tex: 'V(7) = 24000(0.85)^7 \\approx 7693.85', why: 'Multiply by $0.85$ seven times. After $7$ years the car keeps about $32\\%$ of its value.' },
        { text: 'Compare with simple subtraction.', tex: 'V(1) = 20400, \\quad V(2) = 17340', why: 'The first year loses \\$3,600, but the second year loses only $20400 - 17340 = 3060$ dollars, because $15\\%$ of a smaller value is smaller.' },
      ],
      answer: 'After $7$ years the car is worth about \\$7,693.85, not a negative amount. Under a decay model the value gets closer to \\$0 but never reaches it.',
    },
    {
      title: 'Which growth factor is viable?',
      kind: 'challenging',
      problem: [{ t: 'p', text: 'A plant-cover study fits a model $y = a(b)^t$ with $a > 0$ and $b > 0$. It measures $48$ square feet at $t = 1$ week and $108$ square feet at $t = 3$ weeks. (a) Find the model. (b) A second report says the cover was $20$ square feet at $t = 0$. Is that viable under this model? (c) Is $162$ square feet at $t = 4$ viable?' }],
      steps: [
        { text: 'Divide the two data points.', tex: '\\frac{a(b)^3}{a(b)^1} = \\frac{108}{48} \\;\\Rightarrow\\; b^2 = 2.25', why: 'From $t = 1$ to $t = 3$ the model multiplies by $b$ twice, and the $a$\'s cancel.' },
        { text: 'Pick the viable value of $b$.', tex: 'b = 1.5 \\quad (\\text{not } -1.5)', why: '$(-1.5)^2 = 2.25$ too, but the constraint $b > 0$ rules it out. A negative factor would make the outputs flip between positive and negative, which is nonviable for an area.' },
        { text: 'Find $a$.', tex: 'a(1.5)^1 = 48 \\;\\Rightarrow\\; a = 32, \\qquad y = 32(1.5)^t', why: 'Use either point. Check the other: $32(1.5)^3 = 32 \\cdot 3.375 = 108$.' },
        { text: '(b) Compare with the initial value.', why: 'The two measurements pin down one model, and it gives $32(1.5)^0 = 32$ square feet at $t = 0$, not $20$. Under this model, $20$ is nonviable. (Check: starting from $20$, one week later would be $20(1.5) = 30$, not $48$.)' },
        { text: '(c) Check $t = 4$.', tex: '32(1.5)^4 = 32 \\cdot 5.0625 = 162', why: 'The model produces exactly $162$ at $t = 4$. Viable.' },
      ],
      answer: '(a) $y = 32(1.5)^t$; (b) nonviable (the model gives $32$ at $t = 0$); (c) viable.',
    },
  ],
  teachMeAgain: [
    {
      approach: 'visual',
      title: 'Watch the curve hug the axis',
      blocks: [
        { t: 'p', text: 'Here is $y = 80(0.5)^x$. Every step to the right, the height is cut in half.' },
        {
          t: 'graph',
          caption: 'The decay curve y = 80(0.5)^x halves each step and flattens toward the x-axis without touching it.',
          spec: {
            xMin: -1,
            xMax: 8,
            yMin: -10,
            yMax: 90,
            yStep: 10,
            functions: [{ expr: '80(0.5)^x', label: 'y = 80(0.5)^x' }],
            points: [
              { x: 0, y: 80, label: '(0, 80)' },
              { x: 1, y: 40, label: '(1, 40)' },
              { x: 2, y: 20, label: '(2, 20)' },
              { x: 3, y: 10, label: '(3, 10)' },
              { x: 4, y: 5, label: '(4, 5)' },
              { x: 5, y: 2.5, label: '(5, 2.5)' },
              { x: 6, y: 1.25, label: '(6, 1.25)' },
            ],
            ariaLabel: 'A decreasing curve through (0, 80), (1, 40), (2, 20), (3, 10), (4, 5), (5, 2.5) and (6, 1.25). To the right it gets very close to the x-axis but stays above it.',
          },
        },
        { t: 'p', text: 'By $x = 6$ the curve is only $1.25$ above the axis, and it keeps getting closer, but it never touches. Every point of the curve is above the $x$-axis, so $0$ and every negative number are impossible outputs. And for $x \\ge 0$ the curve is never above its starting height of $80$.' },
      ],
    },
    {
      approach: 'simpler-example',
      title: 'Cutting a sandwich in half again and again',
      blocks: [
        { t: 'p', text: 'Start with $1$ sandwich. Cut it in half and keep one piece: $\\frac{1}{2}$. Cut that in half: $\\frac{1}{4}$. Then $\\frac{1}{8}$, $\\frac{1}{16}$, $\\frac{1}{32}$, ...' },
        { t: 'list', items: [
          'Is there ever **no** sandwich left? No. Half of a crumb is still a (smaller) crumb.',
          'Is there ever a **negative** amount of sandwich? No. You never cut off more than you have.',
          'Is there ever **more** than $1$ sandwich? No. Cutting only makes it smaller.',
        ] },
        { t: 'p', text: 'That is $y = 1(0.5)^x$. Every decay model works the same way: for $x \\ge 0$ the outputs stay between $0$ and the start, never equal to $0$ and never above the start.' },
      ],
    },
    {
      approach: 'analogy',
      title: 'Walking halfway to the wall',
      blocks: [
        { t: 'p', text: 'You stand $8$ meters from a wall. Each step, you walk **half** of the distance that is left: $8, 4, 2, 1, 0.5, \\dots$ meters away.' },
        { t: 'p', text: 'You get very close, but if you only ever cover half the remaining gap, there is always some gap left. You never reach the wall and you never walk through it. The wall is like the horizontal asymptote $y = 0$: the distance $8(0.5)^n$ hugs it but never touches it.' },
        { t: 'p', text: 'Now walk the other way, doubling your distance each step: $8, 16, 32, \\dots$ You can never end up closer than where you started. That is a growth model: never below its start for $n \\ge 0$.' },
      ],
    },
    {
      approach: 'prerequisite',
      title: 'Refresher: viable or nonviable',
      blocks: [
        { t: 'p', text: 'In Unit 2, a ticket plan like $5x + 8y \\le 100$ had solutions that were true in the math but impossible in real life, like $x = 2.5$ adult tickets or $y = -1$ student tickets.' },
        { t: 'list', items: [
          '**Math check:** does the value satisfy the equation or inequality?',
          '**Context check:** does it make sense? Counts of people, tickets or bacteria are whole numbers. Time starts at $0$. Lengths and prices are not negative.',
          '**Viable** means it passes both checks. **Nonviable** means it fails at least one.',
        ] },
        { t: 'p', text: 'This lesson uses the same two checks. The new part is the **math check** for exponentials: $y = a(b)^x$ with $a > 0$, $b > 0$ can only produce positive outputs.' },
      ],
    },
    {
      approach: 'step-by-step',
      title: 'A four-question routine',
      blocks: [
        { t: 'p', text: 'Is $y = 15$ viable for $y = 200(0.6)^t$, $t \\ge 0$? Is $y = 250$? Ask these questions in order:' },
        { t: 'list', ordered: true, items: [
          '**Is the value positive?** $15 > 0$ and $250 > 0$, so both pass. ($0$ or a negative would stop here as nonviable.)',
          '**Growth or decay?** $b = 0.6 < 1$, decay, so for $t \\ge 0$ the outputs satisfy $0 < y \\le 200$. $250 > 200$ fails: nonviable.',
          '**Is the model ever equal to it?** $200(0.6)^5 = 15.552$ and $200(0.6)^6 = 9.3312$, so $15$ is reached between $t = 5$ and $t = 6$.',
          '**Does the context allow that input?** If any time is allowed, $15$ is viable. If the value is only measured at whole numbers of $t$, $15$ is never recorded: nonviable.',
        ] },
      ],
    },
    {
      approach: 'alternate-strategy',
      title: 'Ratios versus differences',
      blocks: [
        { t: 'p', text: 'To test a table (inputs going up by $1$), compute **both** the differences and the ratios of the outputs.' },
        {
          t: 'table',
          caption: 'A constant difference means linear; a constant ratio means exponential.',
          headers: ['$y$-values', 'Differences', 'Ratios', 'Model'],
          rows: [
            ['$3, 6, 12, 24$', '$3, 6, 12$', '$2, 2, 2$', 'exponential: $y = 3(2)^x$'],
            ['$3, 6, 9, 12$', '$3, 3, 3$', '$2, 1.5, 1.\\overline{3}$', 'linear: $y = 3x + 3$'],
            ['$3, 6, 0, -6$', '$3, -6, -6$', '$2, 0, \\text{undefined}$', 'not exponential (has $0$ and a negative)'],
          ],
        },
        { t: 'p', text: 'Only a constant ratio makes an exponential model fit. A $0$ or a negative anywhere in the outputs rules out $y = a(b)^x$ with $a > 0$, $b > 0$ right away.' },
      ],
    },
  ],
  guided: [
    { generator: 'u5.exponential-constraints', difficulty: 1 },
    { generator: 'u5.exponential-constraints', difficulty: 1 },
    { generator: 'u5.exponential-constraints', difficulty: 2 },
    { generator: 'u5.exponential-constraints', difficulty: 2 },
  ],
  independent: {
    count: 8,
    reviewCount: 2,
    mix: [
      { generator: 'u5.exponential-constraints', difficulty: 1, weight: 2 },
      { generator: 'u5.exponential-constraints', difficulty: 2, weight: 3 },
      { generator: 'u5.exponential-constraints', difficulty: 3, weight: 3 },
    ],
  },
  quiz: {
    items: [
      { generator: 'u5.exponential-constraints', difficulty: 1 },
      { generator: 'u5.exponential-constraints', difficulty: 2 },
      { generator: 'u5.exponential-constraints', difficulty: 2 },
      { generator: 'u5.exponential-constraints', difficulty: 2 },
      { generator: 'u5.exponential-constraints', difficulty: 3 },
      { generator: 'u5.exponential-constraints', difficulty: 3 },
    ],
  },
  summary: [
    'If $a > 0$ and $b > 0$, then $a(b)^x$ is always positive: it is never $0$ and never negative. Its graph approaches the horizontal asymptote $y = 0$ but never touches it.',
    'For $t \\ge 0$, a growth model ($b > 1$) never goes below its start $a$, and a decay model ($0 < b < 1$) stays between $0$ and $a$, never above $a$.',
    'A table fits an exponential model only if the ratio of consecutive outputs is constant (with inputs going up by $1$).',
    'A value is viable only if the model can produce it **and** it makes sense in context: time starts at $0$, and counts made after whole hours can only be the listed whole-hour values.',
  ],
  mastery: { quizPassScore: 0.8, practiceMinCorrect: 5 },
};
