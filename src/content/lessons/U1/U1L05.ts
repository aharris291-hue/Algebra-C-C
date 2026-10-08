import type { LessonContent } from '../../../core/curriculum/types';

/**
 * U1L05 Graphs of Linear Functions and Key Features (A.FGR.2.2)
 * Intercepts (S1.09) and increasing/decreasing/positive/negative intervals (S1.10).
 *
 * Math verified by hand (2026-10-04): every worked example, table and graph below was recomputed independently.
 */
export const U1L05: LessonContent = {
  lessonId: 'U1L05',
  goal: 'Find the $x$- and $y$-intercepts of a line and explain what they mean, match an equation to its graph, read a graph of a real situation, and describe where a linear function is increasing, decreasing, positive and negative, its end behavior, and its maximum and minimum over an interval.',
  needToKnow: [
    { t: 'p', text: 'This lesson uses three things you already know:' },
    {
      t: 'list',
      items: [
        '**Slope-intercept form.** In $y = mx + b$, $m$ is the slope and $b$ is where the line crosses the $y$-axis.',
        '**Solving $f(x) = c$.** To solve $2x - 4 = 0$, add $4$ to get $2x = 4$, then divide by $2$ to get $x = 2$.',
        '**Inequality symbols.** $x > 2$ means "$x$ is greater than $2$" and $x \\le 2$ means "$x$ is less than or equal to $2$."',
      ],
    },
    { t: 'callout', variant: 'tip', title: 'Quick check', text: 'Solve $-3x + 6 = 0$. (You should get $x = 2$.) If that felt shaky, open **Teach Me Again** and choose the refresher.' },
  ],
  vocabulary: [
    { term: 'x-intercept', meaning: 'The point where a graph crosses the $x$-axis. Its $y$-value is $0$, so it looks like $(a, 0)$.' },
    { term: 'y-intercept', meaning: 'The point where a graph crosses the $y$-axis. Its $x$-value is $0$, so it looks like $(0, b)$.' },
    { term: 'increasing', meaning: 'The graph goes up as you move left to right (positive slope).' },
    { term: 'decreasing', meaning: 'The graph goes down as you move left to right (negative slope).' },
    { term: 'constant', meaning: 'The graph stays level (slope $0$), like $y = 3$.' },
    { term: 'positive / negative interval', meaning: 'The $x$-values where the graph is above the $x$-axis ($y > 0$) or below it ($y < 0$).' },
  ],
  instruction: [
    { t: 'p', text: '### Intercepts: where a line crosses the axes' },
    { t: 'p', text: 'Every point on the $y$-axis has $x = 0$, and every point on the $x$-axis has $y = 0$. That gives a simple rule: **to find one intercept, set the other variable equal to $0$.**' },
    {
      t: 'list',
      items: [
        '**$y$-intercept:** set $x = 0$ and solve for $y$. Write it as a point $(0, b)$.',
        '**$x$-intercept:** set $y = 0$ and solve for $x$. Write it as a point $(a, 0)$.',
      ],
    },
    { t: 'p', text: 'For $y = 2x - 4$:' },
    { t: 'math', tex: 'x = 0:\\ y = 2(0) - 4 = -4 \\;\\Rightarrow\\; (0, -4) \\qquad y = 0:\\ 0 = 2x - 4 \\;\\Rightarrow\\; x = 2 \\;\\Rightarrow\\; (2, 0)' },
    {
      t: 'graph',
      caption: 'y = 2x - 4 crosses the y-axis at (0, -4) and the x-axis at (2, 0).',
      spec: { xMin: -4, xMax: 6, yMin: -6, yMax: 6, functions: [{ expr: '2x - 4', label: 'y = 2x - 4' }], points: [{ x: 0, y: -4, label: '(0, -4)' }, { x: 2, y: 0, label: '(2, 0)' }], ariaLabel: 'Line y = 2x - 4 rising from left to right, with its y-intercept (0, -4) and x-intercept (2, 0) marked.' },
    },
    { t: 'p', text: 'The same rule works for standard form. For $3x + 4y = 12$: setting $x = 0$ gives $4y = 12$, so $y = 3$ and the $y$-intercept is $(0, 3)$. Setting $y = 0$ gives $3x = 12$, so $x = 4$ and the $x$-intercept is $(4, 0)$.' },
    { t: 'callout', variant: 'realworld', title: 'Intercepts tell a story', text: 'In a real situation, the $y$-intercept is usually the **starting amount** (when time is $0$). The $x$-intercept is usually **when the amount reaches $0$**, like when a gift card runs out or a phone battery dies.' },
    { t: 'p', text: '### Increasing, decreasing or constant' },
    { t: 'p', text: 'Read a graph the way you read a page: **left to right**. The slope tells you the direction right away.' },
    {
      t: 'table',
      caption: 'The sign of the slope decides the direction.',
      headers: ['Slope', 'Graph', 'Example'],
      rows: [
        ['$m > 0$', 'increasing (goes up)', '$y = 2x - 4$'],
        ['$m < 0$', 'decreasing (goes down)', '$y = -x + 3$'],
        ['$m = 0$', 'constant (level)', '$y = 3$'],
      ],
    },
    { t: 'p', text: '### Positive and negative intervals' },
    { t: 'p', text: 'A function is **positive** where its graph is **above** the $x$-axis ($y > 0$) and **negative** where it is **below** ($y < 0$). The answer is always a set of **$x$-values**, and the $x$-intercept is the boundary.' },
    { t: 'p', text: 'For $y = 2x - 4$, solve $2x - 4 > 0$: add $4$ to get $2x > 4$, then divide by $2$ to get $x > 2$. So the function is positive when $x > 2$ and negative when $x < 2$.' },
    { t: 'p', text: 'You can also write these as **intervals**. A parenthesis means the endpoint is **not** included, and $\\infty$ (infinity) always gets a parenthesis because you can never reach it.' },
    {
      t: 'table',
      caption: 'Key features of y = 2x - 4',
      headers: ['Feature', 'Inequality', 'Interval'],
      rows: [
        ['positive ($y > 0$)', '$x > 2$', '$(2, \\infty)$'],
        ['negative ($y < 0$)', '$x < 2$', '$(-\\infty, 2)$'],
      ],
    },
    { t: 'callout', variant: 'warning', title: 'Dividing by a negative flips the sign', text: 'For $y = -3x + 6$, solving $-3x + 6 > 0$ gives $-3x > -6$. Dividing by $-3$ flips the symbol: $x < 2$. A decreasing line is positive on the **left** of its $x$-intercept.' },
    { t: 'callout', variant: 'why', title: 'Why is the x-intercept left out?', text: 'At the $x$-intercept, $y = 0$ exactly. Zero is neither positive nor negative, so that one $x$-value belongs to neither interval.' },
    { t: 'p', text: '### Matching an equation to its graph' },
    { t: 'p', text: 'To pick the graph of $y = 2x - 3$, use the two numbers in the equation. The $y$-intercept $-3$ says the line crosses the $y$-axis at $(0, -3)$. The slope $2$ says that from there, 1 step right goes 2 up, to $(1, -1)$. A graph that crosses at $(0, 3)$ (sign of $b$ flipped), falls instead of rising (sign of $m$ flipped), or crosses at $(0, 2)$ with slope $-3$ (numbers switched) is a different line.' },
    { t: 'p', text: '### End behavior' },
    { t: 'p', text: '**End behavior** describes what the outputs do at the far ends of the graph: as $x \\to \\infty$ (moving right forever) and as $x \\to -\\infty$ (moving left forever). A non-horizontal line never levels off, so its outputs head to $\\infty$ or $-\\infty$, and only the **sign of the slope** decides which.' },
    {
      t: 'table',
      caption: 'End behavior of a line y = mx + b.',
      headers: ['Slope', 'As $x \\to \\infty$', 'As $x \\to -\\infty$', 'Example'],
      rows: [
        ['$m > 0$', '$f(x) \\to \\infty$', '$f(x) \\to -\\infty$', '$f(x) = 3x - 1$'],
        ['$m < 0$', '$f(x) \\to -\\infty$', '$f(x) \\to \\infty$', '$f(x) = -2x + 5$'],
      ],
    },
    { t: 'callout', variant: 'why', title: 'Why does the y-intercept not matter far away?', text: 'For $f(x) = -2x + 5$, try $x = 1000$: $f(1000) = -2000 + 5 = -1995$. The $+5$ hardly changes anything, and bigger inputs give even more negative outputs. So as $x \\to \\infty$, $f(x) \\to -\\infty$.' },
    { t: 'p', text: '### Maximum and minimum on an interval' },
    { t: 'p', text: 'A line that goes on forever has no highest or lowest point. But when a function is used only on an interval such as $-2 \\le x \\le 4$, it does. A line moves steadily in one direction, so the **maximum** (largest output) and **minimum** (smallest output) are at the two **endpoints** of the interval.' },
    { t: 'p', text: 'For $f(x) = 3x - 1$ on $[-2, 4]$: $f(-2) = -7$ and $f(4) = 11$. The slope is positive, so the function increases: the minimum is $-7$ (at $x = -2$) and the maximum is $11$ (at $x = 4$). The maximum **value** is the output $11$, not the input $4$.' },
    { t: 'p', text: '### Reading a graph of a real situation' },
    { t: 'p', text: 'A graph of a situation has labeled axes. The horizontal axis is the input (often time) and the vertical axis is the output, each with units. Read each point as "input, then output": on a graph of a tank with axes "time (hours)" and "water left (gallons)", the point $(0, 480)$ means that at 0 hours the tank holds 480 gallons, and $(24, 0)$ means that after 24 hours it is empty.' },
  ],
  examples: [
    {
      title: 'Find both intercepts',
      kind: 'introductory',
      problem: [{ t: 'p', text: 'Find the $x$- and $y$-intercepts of $y = -3x + 6$.' }],
      steps: [
        { text: 'For the $y$-intercept, set $x = 0$.', tex: 'y = -3(0) + 6 = 6', why: 'Every point on the $y$-axis has $x = 0$.' },
        { text: 'Write it as a point.', tex: '(0,\\ 6)' },
        { text: 'For the $x$-intercept, set $y = 0$ and solve.', tex: '0 = -3x + 6 \\;\\Rightarrow\\; 3x = 6 \\;\\Rightarrow\\; x = 2', why: 'Every point on the $x$-axis has $y = 0$. Adding $3x$ to both sides gives $3x = 6$.' },
        { text: 'Write it as a point.', tex: '(2,\\ 0)' },
      ],
      answer: '$x$-intercept $(2, 0)$; $y$-intercept $(0, 6)$',
    },
    {
      title: 'Intercepts from standard form',
      kind: 'intermediate',
      problem: [{ t: 'p', text: 'Find the intercepts of $2x - 5y = 10$.' }],
      steps: [
        { text: 'Set $y = 0$ for the $x$-intercept.', tex: '2x - 5(0) = 10 \\;\\Rightarrow\\; 2x = 10 \\;\\Rightarrow\\; x = 5', why: 'In standard form, setting one variable to $0$ makes its term disappear, so the other is quick to solve.' },
        { text: 'Set $x = 0$ for the $y$-intercept.', tex: '2(0) - 5y = 10 \\;\\Rightarrow\\; -5y = 10 \\;\\Rightarrow\\; y = -2', why: 'Divide both sides by $-5$: $10 \\div (-5) = -2$.' },
        { text: 'Check one point in the original equation.', tex: '2(0) - 5(-2) = 0 + 10 = 10 \\checkmark' },
      ],
      answer: '$x$-intercept $(5, 0)$; $y$-intercept $(0, -2)$',
    },
    {
      title: 'Describe all the key features',
      kind: 'intermediate',
      problem: [
        { t: 'p', text: 'For $f(x) = -\\frac{1}{2}x + 2$, tell whether $f$ is increasing or decreasing, and give the intervals where it is positive and negative.' },
        { t: 'graph', spec: { xMin: -4, xMax: 8, yMin: -4, yMax: 6, functions: [{ expr: '-0.5x + 2', label: 'f(x) = -(1/2)x + 2' }], points: [{ x: 0, y: 2, label: '(0, 2)' }, { x: 4, y: 0, label: '(4, 0)' }], ariaLabel: 'Line falling from left to right through (0, 2) and the x-intercept (4, 0).' } },
      ],
      steps: [
        { text: 'Look at the slope: $m = -\\frac{1}{2}$.', why: 'A negative slope means the line goes down from left to right, so $f$ is **decreasing**.' },
        { text: 'Find the $x$-intercept by setting $f(x) = 0$.', tex: '0 = -\\tfrac{1}{2}x + 2 \\;\\Rightarrow\\; \\tfrac{1}{2}x = 2 \\;\\Rightarrow\\; x = 4', why: 'The $x$-intercept is the boundary between positive and negative.' },
        { text: 'Decide which side is above the axis.', tex: 'f(0) = 2 > 0', why: 'Test a point: $x = 0$ is left of $4$ and gives a positive output, so the left side is positive.' },
        { text: 'Write the intervals.', tex: '\\text{positive: } x < 4,\\ (-\\infty, 4) \\qquad \\text{negative: } x > 4,\\ (4, \\infty)' },
      ],
      answer: 'Decreasing; positive on $(-\\infty, 4)$; negative on $(4, \\infty)$',
    },
    {
      title: 'End behavior and the largest and smallest outputs',
      kind: 'intermediate',
      problem: [{ t: 'p', text: '(a) Describe the end behavior of $f(x) = -2x + 5$. (b) The function $g(x) = 3x - 1$ is used only on $-2 \\le x \\le 4$. Find its maximum and minimum values.' }],
      steps: [
        { text: '(a) Use the sign of the slope.', tex: 'm = -2 < 0', why: 'A negative slope falls from left to right, and a line never levels off.' },
        { text: 'State the end behavior.', tex: '\\text{As } x \\to \\infty,\\ f(x) \\to -\\infty; \\qquad \\text{as } x \\to -\\infty,\\ f(x) \\to \\infty', why: 'Check with big inputs: $f(100) = -195$ and $f(-100) = 205$.' },
        { text: '(b) Evaluate $g$ at both endpoints.', tex: 'g(-2) = 3(-2) - 1 = -7, \\qquad g(4) = 3(4) - 1 = 11', why: 'A line changes steadily, so its largest and smallest outputs on a closed interval are at the endpoints.' },
        { text: 'Compare.', tex: '\\text{maximum } 11 \\text{ at } x = 4, \\qquad \\text{minimum } -7 \\text{ at } x = -2', why: 'The slope $3$ is positive, so the outputs grow from left to right: the smallest is at the left end and the largest at the right end.' },
      ],
      answer: '(a) As $x \\to \\infty$, $f(x) \\to -\\infty$; as $x \\to -\\infty$, $f(x) \\to \\infty$. (b) Maximum $11$ (at $x = 4$), minimum $-7$ (at $x = -2$).',
    },
    {
      title: 'Reading a graph of a draining tank',
      kind: 'real-world',
      problem: [
        { t: 'p', text: 'The graph shows the water left in a tank as it drains. What do the points $(0, 480)$ and $(24, 0)$ mean? Write a rule for $W(t)$.' },
        { t: 'graph', spec: { xMin: 0, xMax: 30, yMin: 0, yMax: 600, xStep: 5, yStep: 100, xLabel: 'time (hours)', yLabel: 'water left (gallons)', functions: [{ expr: '-20x + 480', domain: [0, 24] }], points: [{ x: 0, y: 480, label: '(0, 480)' }, { x: 24, y: 0, label: '(24, 0)' }], ariaLabel: 'A line graph with time in hours across and water left in gallons up, falling from (0, 480) to (24, 0).' } },
      ],
      steps: [
        { text: 'Read $(0, 480)$ with the axis labels.', why: 'Input first: at time 0 hours, the output is 480 gallons. The tank starts with 480 gallons. This is the vertical intercept.' },
        { text: 'Read $(24, 0)$.', why: 'After 24 hours, 0 gallons are left: the tank is empty. This is the horizontal intercept, and the graph stops there because the water cannot go below 0.' },
        { text: 'Find the rate from the two points.', tex: 'm = \\dfrac{0 - 480}{24 - 0} = -20', why: 'The tank loses 20 gallons each hour, so the rate is $-20$ gallons per hour.' },
        { text: 'Write the rule.', tex: 'W(t) = -20t + 480', why: 'Rate times time, plus the starting amount. Check: $W(24) = -480 + 480 = 0$.' },
      ],
      answer: '$(0, 480)$: the tank starts with 480 gallons. $(24, 0)$: it is empty after 24 hours. $W(t) = -20t + 480$.',
    },
    {
      title: 'A common mistake: using the y-intercept as the boundary',
      kind: 'common-mistake',
      problem: [{ t: 'p', text: 'A student says $f(x) = 2x - 4$ is positive on $(-4, \\infty)$ "because the $y$-intercept is $-4$." What went wrong, and what is the correct interval?' }],
      steps: [
        { text: 'Test the student answer.', tex: 'f(0) = 2(0) - 4 = -4', why: '$x = 0$ is inside $(-4, \\infty)$, but $f(0) = -4$ is negative. So the claim cannot be right.' },
        { text: 'Spot the error.', why: 'Positive and negative intervals are about where the graph crosses the **$x$-axis**. The boundary is the $x$-intercept, not the $y$-intercept.' },
        { text: 'Solve $f(x) > 0$.', tex: '2x - 4 > 0 \\;\\Rightarrow\\; 2x > 4 \\;\\Rightarrow\\; x > 2', why: 'Add $4$, then divide by $2$. Dividing by a positive number keeps the symbol the same.' },
        { text: 'Write the interval.', tex: '(2, \\infty)' },
      ],
      answer: '$f$ is positive on $(2, \\infty)$, that is, when $x > 2$.',
    },
    {
      title: 'Phone battery',
      kind: 'real-world',
      problem: [{ t: 'p', text: 'A phone has 80% battery and loses 10% each hour of video streaming. The battery level after $t$ hours is $B(t) = 80 - 10t$. Find both intercepts and explain what they mean. Is $B$ increasing or decreasing?' }],
      steps: [
        { text: 'Find the vertical intercept: set $t = 0$.', tex: 'B(0) = 80 - 10(0) = 80 \\;\\Rightarrow\\; (0, 80)', why: 'Time $0$ is the start, so this is the starting battery level: 80%.' },
        { text: 'Find the horizontal intercept: set $B(t) = 0$.', tex: '0 = 80 - 10t \\;\\Rightarrow\\; 10t = 80 \\;\\Rightarrow\\; t = 8 \\;\\Rightarrow\\; (8, 0)', why: 'The battery level is $0$ when the phone dies, so this tells when that happens: after 8 hours.' },
        { text: 'Check the direction.', why: 'The slope is $-10$ (percent per hour), which is negative, so $B$ is **decreasing**: the battery drains over time.' },
      ],
      answer: '$(0, 80)$: the phone starts at 80%. $(8, 0)$: the battery dies after 8 hours. $B$ is decreasing.',
    },
    {
      title: 'From two points to key features',
      kind: 'challenging',
      problem: [{ t: 'p', text: 'A line passes through $(-2, 5)$ and $(2, -3)$. Write its equation, find its $x$-intercept, and give the interval where it is positive.' }],
      steps: [
        { text: 'Find the slope.', tex: 'm = \\frac{-3 - 5}{2 - (-2)} = \\frac{-8}{4} = -2', why: 'Slope is the change in $y$ divided by the change in $x$.' },
        { text: 'Find $b$ using the point $(-2, 5)$.', tex: '5 = -2(-2) + b \\;\\Rightarrow\\; 5 = 4 + b \\;\\Rightarrow\\; b = 1', why: 'Any point on the line makes $y = mx + b$ true.' },
        { text: 'Write the equation and check the other point.', tex: 'y = -2x + 1; \\quad -2(2) + 1 = -3 \\checkmark' },
        { text: 'Find the $x$-intercept.', tex: '0 = -2x + 1 \\;\\Rightarrow\\; 2x = 1 \\;\\Rightarrow\\; x = \\tfrac{1}{2}', why: 'Set $y = 0$. The intercept does not have to be a whole number.' },
        { text: 'Find where it is positive.', tex: '-2x + 1 > 0 \\;\\Rightarrow\\; -2x > -1 \\;\\Rightarrow\\; x < \\tfrac{1}{2}', why: 'Dividing by $-2$ flips the symbol. This matches the picture: a decreasing line is above the axis on the left.' },
      ],
      answer: '$y = -2x + 1$; $x$-intercept $\\left(\\frac{1}{2}, 0\\right)$; positive on $\\left(-\\infty, \\frac{1}{2}\\right)$',
    },
  ],
  teachMeAgain: [
    {
      approach: 'visual',
      title: 'Walk along the graph',
      blocks: [
        { t: 'p', text: 'Picture yourself walking along the line from left to right.' },
        {
          t: 'graph',
          spec: { xMin: -5, xMax: 5, yMin: -4, yMax: 6, functions: [{ expr: '-x + 3', label: 'y = -x + 3' }], points: [{ x: 0, y: 3, label: '(0, 3)' }, { x: 3, y: 0, label: '(3, 0)' }], ariaLabel: 'Line y = -x + 3 falling from left to right, crossing the y-axis at (0, 3) and the x-axis at (3, 0).' },
        },
        {
          t: 'list',
          items: [
            'You are walking **downhill** the whole time, so the function is **decreasing**.',
            'You cross the $y$-axis at $(0, 3)$ and the $x$-axis at $(3, 0)$. Those are the intercepts.',
            'You are **above** the $x$-axis until $x = 3$, so the function is positive when $x < 3$, and negative when $x > 3$.',
          ],
        },
      ],
    },
    {
      approach: 'analogy',
      title: 'The x-axis is sea level',
      blocks: [
        { t: 'p', text: 'Think of the $x$-axis as sea level and the line as a hiking trail.' },
        {
          t: 'list',
          items: [
            '**Positive** means the trail is above sea level. **Negative** means it is underwater.',
            'The $x$-intercept is the exact spot where the trail meets the water. That spot is the boundary.',
            '**Increasing** is an uphill trail, **decreasing** is downhill, and **constant** is perfectly flat.',
          ],
        },
        { t: 'p', text: 'When someone asks "where is it positive?", they are asking "for which $x$-values is the trail above the water?"' },
      ],
    },
    {
      approach: 'step-by-step',
      title: 'A 4-step checklist',
      blocks: [
        {
          t: 'list',
          ordered: true,
          items: [
            '**$y$-intercept:** replace $x$ with $0$. For $y = 4x - 8$: $y = -8$, so $(0, -8)$.',
            '**$x$-intercept:** replace $y$ with $0$ and solve. $0 = 4x - 8$ gives $x = 2$, so $(2, 0)$.',
            '**Direction:** look at the sign of the slope. $m = 4 > 0$, so it is increasing.',
            '**Positive/negative:** use the $x$-intercept as the boundary. Increasing lines are positive on the right: $x > 2$, or $(2, \\infty)$. Negative: $x < 2$, or $(-\\infty, 2)$.',
          ],
        },
        { t: 'callout', variant: 'tip', text: 'Not sure which side is positive? Plug in $x = 0$. For $y = 4x - 8$, you get $-8$, so the side containing $0$ (the left) is negative.' },
      ],
    },
    {
      approach: 'prerequisite',
      title: 'Refresher: solving and inequalities',
      blocks: [
        { t: 'list', items: ['To solve $0 = 5x - 15$: add $15$ to both sides ($15 = 5x$), then divide by $5$ ($x = 3$).', 'To solve $5x - 15 > 0$: the same steps give $x > 3$.', 'If you multiply or divide by a **negative**, flip the symbol: $-2x > 6$ becomes $x < -3$.', 'Interval notation: $x > 3$ is $(3, \\infty)$ and $x < 3$ is $(-\\infty, 3)$.'] },
        { t: 'p', text: 'Try it: solve $-4x + 8 > 0$. Subtract $8$: $-4x > -8$. Divide by $-4$ and flip: $x < 2$.' },
      ],
    },
    {
      approach: 'simpler-example',
      title: 'Start with the easiest line',
      blocks: [
        { t: 'p', text: 'Take $y = x - 3$. Its slope is $1$, so it goes up.' },
        { t: 'math', tex: 'x = 0:\\ y = -3 \\qquad y = 0:\\ x = 3' },
        { t: 'p', text: 'So the intercepts are $(0, -3)$ and $(3, 0)$. The outputs are bigger than $0$ when $x$ is bigger than $3$: try $x = 5$, which gives $y = 2$. So the function is positive for $x > 3$ and negative for $x < 3$.' },
        { t: 'p', text: 'Now a level line: $y = 3$. It never crosses the $x$-axis, so it has no $x$-intercept. It is constant and positive for every $x$.' },
      ],
    },
  ],
  guided: [
    { generator: 'u1.intercepts', difficulty: 1 },
    { generator: 'u1.key-features', difficulty: 1 },
    { generator: 'u1.intercepts-context', difficulty: 1 },
    { generator: 'u1.key-features', difficulty: 2 },
  ],
  independent: {
    count: 8,
    reviewCount: 2,
    mix: [
      { generator: 'u1.intercepts', difficulty: 1, weight: 1 },
      { generator: 'u1.intercepts', difficulty: 2, weight: 2 },
      { generator: 'u1.intercepts-context', difficulty: 1, weight: 1 },
      { generator: 'u1.intercepts-context', difficulty: 2, weight: 1 },
      { generator: 'u1.key-features', difficulty: 1, weight: 2 },
      { generator: 'u1.key-features', difficulty: 2, weight: 2 },
      { generator: 'u1.key-features', difficulty: 3, weight: 1 },
      { generator: 'u1.write-two-points', difficulty: 2, weight: 1 },
      { generator: 'u1.solve-fx', difficulty: 2, weight: 1 },
    ],
  },
  quiz: {
    items: [
      { generator: 'u1.intercepts', difficulty: 2 },
      { generator: 'u1.intercepts', difficulty: 3 },
      { generator: 'u1.intercepts-context', difficulty: 2 },
      { generator: 'u1.key-features', difficulty: 2 },
      { generator: 'u1.key-features', difficulty: 2 },
      { generator: 'u1.key-features', difficulty: 3 },
    ],
  },
  summary: [
    'To find the $y$-intercept, set $x = 0$; to find the $x$-intercept, set $y = 0$. Write each as a point.',
    'In context, the $y$-intercept is usually the starting value and the $x$-intercept is when the amount reaches $0$.',
    'Positive slope means increasing, negative slope means decreasing, and slope $0$ means constant.',
    'A function is positive where its graph is above the $x$-axis and negative where it is below. The $x$-intercept is the boundary, and the answer is a set of $x$-values.',
    'End behavior: a line with $m > 0$ goes to $\\infty$ as $x \\to \\infty$ and to $-\\infty$ as $x \\to -\\infty$; a line with $m < 0$ does the opposite.',
    'On an interval like $[-2, 4]$, a line has its maximum and minimum values at the endpoints. Report the output, not the $x$-value.',
    'On a graph of a situation, read each point as (input, output) with the units on the axis labels.',
  ],
  mastery: { quizPassScore: 0.8, practiceMinCorrect: 5 },
};
