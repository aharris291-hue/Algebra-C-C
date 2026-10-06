import type { LessonContent } from '../../../core/curriculum/types';

/**
 * U4L12 Quadratic Functions and Function Notation (A.FGR.7.1)
 * What a quadratic function is, evaluating f(x) at positive and negative inputs with parentheses,
 * the (-3)^2 versus -3^2 trap (including -x^2 at a negative x), solving f(x) = value, and reading
 * statements like h(2) = 52, h(0) and h(t) = 0 in a context with units (S4.14).
 *
 * Math verified by hand (2026-10-06): every function value, table entry, solution of f(x) = value (substituted back), graph point and context interpretation below was recomputed independently.
 */
export const U4L12: LessonContent = {
  lessonId: 'U4L12',
  goal: 'Evaluate quadratic functions like $f(x) = x^2 + 2x - 3$ at positive and negative inputs, solve equations like $f(x) = 5$, and explain what a statement like $h(2) = 52$ means in a real situation, with units.',
  needToKnow: [
    { t: 'p', text: 'This lesson connects quadratics to the function ideas from Unit 1. You will need:' },
    {
      t: 'list',
      items: [
        '**Function notation.** $f(x)$ is read "f of x." It means the **output** of the function $f$ when the **input** is $x$. It does not mean $f$ times $x$.',
        '**Order of operations.** Exponents come before multiplication, and multiplication before addition and subtraction: $2 \\cdot 3^2 = 2 \\cdot 9 = 18$, not $6^2$.',
        '**Squaring a negative.** $(-3)^2 = (-3)(-3) = 9$, but $-3^2 = -(3 \\cdot 3) = -9$. The parentheses decide whether the negative sign is squared.',
        '**Solving by factoring.** $x^2 + 2x - 8 = 0$ factors as $(x + 4)(x - 2) = 0$, so $x = -4$ or $x = 2$.',
      ],
    },
    { t: 'callout', variant: 'tip', title: 'Quick check', text: 'What are $(-4)^2$ and $-4^2$? (You should get $16$ and $-16$.) If those felt shaky, open **Teach Me Again** and choose the refresher.' },
  ],
  vocabulary: [
    { term: 'quadratic function', meaning: 'A function that can be written $f(x) = ax^2 + bx + c$ with $a \\ne 0$. Its graph is a U-shaped curve called a parabola.' },
    { term: 'function notation', meaning: 'Writing $f(x)$ for the output of $f$ at input $x$. For example, $f(3) = 12$ says "when the input is $3$, the output is $12$."' },
    { term: 'evaluate', meaning: 'Find the output for a given input by substituting the input for the variable and simplifying.' },
    { term: 'input and output', meaning: 'The input is the value you put in (often $x$ or time $t$). The output is the value the function gives back ($f(x)$ or $h(t)$).' },
    { term: 'zero of a function', meaning: 'An input that makes the output $0$. A zero of $f$ is an $x$-intercept of its graph.' },
  ],
  instruction: [
    { t: 'p', text: '### What makes a function quadratic' },
    { t: 'p', text: 'A **quadratic function** has the form $f(x) = ax^2 + bx + c$ with $a \\ne 0$. The highest power of $x$ is $2$. Here is one you will use all lesson:' },
    { t: 'math', tex: 'f(x) = x^2 + 2x - 3' },
    { t: 'p', text: 'Each input $x$ gives exactly one output $f(x)$. Making a table of inputs and outputs shows the pattern:' },
    {
      t: 'table',
      caption: 'Inputs and outputs of f(x) = x squared plus 2x minus 3.',
      headers: ['$x$', '$-4$', '$-3$', '$-2$', '$-1$', '$0$', '$1$', '$2$'],
      rows: [['$f(x)$', '$5$', '$0$', '$-3$', '$-4$', '$-3$', '$0$', '$5$']],
    },
    {
      t: 'graph',
      caption: 'The points from the table lie on a parabola that opens upward.',
      spec: {
        xMin: -6,
        xMax: 4,
        yMin: -6,
        yMax: 8,
        functions: [{ expr: 'x^2 + 2x - 3', label: 'f(x) = x^2 + 2x - 3' }],
        points: [
          { x: -4, y: 5, label: '(-4, 5)' },
          { x: -3, y: 0, label: '(-3, 0)' },
          { x: -1, y: -4, label: '(-1, -4)' },
          { x: 0, y: -3, label: '(0, -3)' },
          { x: 1, y: 0, label: '(1, 0)' },
          { x: 2, y: 5, label: '(2, 5)' },
        ],
        ariaLabel: 'An upward parabola through (-4, 5), (-3, 0), (-1, -4), (0, -3), (1, 0) and (2, 5). Its lowest point is (-1, -4).',
      },
    },
    { t: 'callout', variant: 'why', title: 'Why the outputs repeat', text: 'Notice $f(-4) = 5$ and $f(2) = 5$, and $f(-3) = f(1) = 0$. A parabola is symmetric, so two different inputs can give the same output. That is why an equation like $f(x) = 5$ can have **two** answers.' },
    { t: 'p', text: '### Evaluating: replace x with the input, in parentheses' },
    { t: 'p', text: 'To find $f(-3)$, replace **every** $x$ with $(-3)$, keeping the parentheses, and follow the order of operations:' },
    { t: 'math', tex: 'f(-3) = (-3)^2 + 2(-3) - 3 = 9 - 6 - 3 = 0' },
    { t: 'p', text: 'The parentheses matter because the whole input, sign included, is what gets squared: $(-3)^2 = 9$.' },
    { t: 'callout', variant: 'warning', title: 'The negative sign in front of x squared', text: 'For $g(x) = -x^2 + 4x$, the term $-x^2$ means "square $x$, then take the opposite." So $g(-3) = -(-3)^2 + 4(-3) = -9 - 12 = -21$. The square $(-3)^2 = 9$ is positive, and the negative in front makes it $-9$. A common wrong answer is $9 - 12 = -3$, which squares the front negative too.' },
    {
      t: 'table',
      caption: 'Squaring with and without parentheses.',
      headers: ['Expression', 'Meaning', 'Value'],
      rows: [
        ['$(-3)^2$', 'square $-3$', '$9$'],
        ['$-3^2$', 'the opposite of $3^2$', '$-9$'],
        ['$-x^2$ at $x = -3$', '$-(-3)^2$, the opposite of $9$', '$-9$'],
        ['$2x^2$ at $x = -3$', '$2(-3)^2 = 2 \\cdot 9$', '$18$'],
      ],
    },
    { t: 'p', text: '### Solving f(x) = a value: work backward' },
    { t: 'p', text: 'Evaluating goes **input to output**. Solving $f(x) = 5$ goes **output to input**: which $x$ values give an output of $5$? Set the rule equal to $5$ and solve.' },
    { t: 'math', tex: 'x^2 + 2x - 3 = 5 \\;\\Longrightarrow\\; x^2 + 2x - 8 = 0 \\;\\Longrightarrow\\; (x + 4)(x - 2) = 0' },
    { t: 'p', text: 'So $x = -4$ or $x = 2$. Both appear in the table above: $f(-4) = 5$ and $f(2) = 5$. On the graph, the horizontal line $y = 5$ meets the parabola at those two inputs.' },
    {
      t: 'graph',
      caption: 'The line y = 5 crosses the parabola at x = -4 and x = 2, the two solutions of f(x) = 5.',
      spec: {
        xMin: -6,
        xMax: 4,
        yMin: -6,
        yMax: 8,
        functions: [
          { expr: 'x^2 + 2x - 3', label: 'f(x)' },
          { expr: '5', label: 'y = 5', dashed: true },
        ],
        points: [
          { x: -4, y: 5, label: '(-4, 5)' },
          { x: 2, y: 5, label: '(2, 5)' },
        ],
        ariaLabel: 'The upward parabola f(x) = x^2 + 2x - 3 and the dashed horizontal line y = 5. They meet at (-4, 5) and (2, 5).',
      },
    },
    { t: 'callout', variant: 'tip', title: 'When there is no x-term', text: 'For $f(x) = x^2 - 4$, solving $f(x) = 21$ needs only square roots: $x^2 - 4 = 21$, so $x^2 = 25$ and $x = \\pm 5$. Check: $5^2 - 4 = 21$ and $(-5)^2 - 4 = 21$.' },
    { t: 'p', text: '### Function notation in a real situation' },
    { t: 'p', text: 'A ball is tossed upward from the top of a 60-foot stadium press box at 28 feet per second. Its height in feet $t$ seconds after the toss is' },
    { t: 'math', tex: 'h(t) = -16t^2 + 28t + 60' },
    { t: 'p', text: 'The **input** $t$ is time in **seconds**. The **output** $h(t)$ is height in **feet**. Every statement in function notation is a sentence about time and height.' },
    {
      t: 'table',
      caption: 'Height of the tossed ball at half-second intervals.',
      headers: ['$t$ (s)', '$0$', '$0.5$', '$1$', '$1.5$', '$2$', '$2.5$', '$3$'],
      rows: [['$h(t)$ (ft)', '$60$', '$70$', '$72$', '$66$', '$52$', '$30$', '$0$']],
    },
    {
      t: 'list',
      items: [
        '$h(2) = -16(2)^2 + 28(2) + 60 = -64 + 56 + 60 = 52$. **Meaning:** $2$ seconds after the toss, the ball is $52$ feet above the ground.',
        '$h(0) = 60$. **Meaning:** at the moment of the toss ($0$ seconds), the ball is $60$ feet up. This is the starting height.',
        '$h(t) = 0$ asks **when** the height is $0$, which is when the ball hits the ground. Factoring, $-16t^2 + 28t + 60 = -4(4t + 5)(t - 3)$, so $t = 3$ or $t = -1.25$. A negative time is before the toss, so the ball lands after $3$ seconds.',
      ],
    },
    {
      t: 'graph',
      caption: 'Height of the ball from the toss until it lands at 3 seconds.',
      spec: {
        xMin: -0.5,
        xMax: 3.5,
        yMin: -10,
        yMax: 80,
        xStep: 0.5,
        yStep: 10,
        xLabel: 'time (s)',
        yLabel: 'height (ft)',
        functions: [{ expr: '-16x^2 + 28x + 60', label: 'h(t)', domain: [0, 3] }],
        points: [
          { x: 0, y: 60, label: 'h(0) = 60' },
          { x: 2, y: 52, label: 'h(2) = 52' },
          { x: 3, y: 0, label: 'h(3) = 0' },
        ],
        ariaLabel: 'A downward parabola drawn from time 0 to time 3. It starts at height 60, rises a little above 70, passes through (2, 52) and reaches height 0 at 3 seconds.',
      },
    },
    { t: 'callout', variant: 'warning', title: 'Input or output?', text: 'In $h(2) = 52$, the number **inside** the parentheses is the input (time, $2$ seconds) and the number after the equals sign is the output (height, $52$ feet). "When is the ball 30 feet high?" is the equation $h(t) = 30$, not $h(30)$. $h(30)$ would be the height after $30$ seconds.' },
    { t: 'callout', variant: 'realworld', title: 'Where this shows up', text: 'Sports apps, video game physics engines and engineers all use height functions like $h(t)$. Writing $h(1.5) = 66$ is a short, exact way to say "one and a half seconds in, the ball is 66 feet high."' },
  ],
  examples: [
    {
      title: 'Evaluate at a positive input',
      kind: 'introductory',
      problem: [{ t: 'p', text: 'For $f(x) = 2x^2 - 3x + 1$, find $f(3)$ and $f(0)$.' }],
      steps: [
        { text: 'Replace each $x$ with $(3)$.', tex: 'f(3) = 2(3)^2 - 3(3) + 1', why: 'Function notation $f(3)$ means the output when the input is $3$, so $3$ goes wherever $x$ was.' },
        { text: 'Square first.', tex: '= 2(9) - 3(3) + 1', why: 'Exponents come before multiplication. Squaring $2 \\cdot 3$ first would give $36$, which is wrong.' },
        { text: 'Multiply, then add and subtract.', tex: '= 18 - 9 + 1 = 10', why: 'Finish the order of operations from left to right.' },
        { text: 'Now find $f(0)$.', tex: 'f(0) = 2(0)^2 - 3(0) + 1 = 1', why: 'Every term with an $x$ becomes $0$, so only the constant $c = 1$ is left. $f(0)$ is always the constant term.' },
      ],
      answer: '$f(3) = 10$ and $f(0) = 1$',
    },
    {
      title: 'Evaluate at a negative input',
      kind: 'intermediate',
      problem: [{ t: 'p', text: 'For $f(x) = 2x^2 - 3x + 1$, find $f(-2)$.' }],
      steps: [
        { text: 'Replace each $x$ with $(-2)$, in parentheses.', tex: 'f(-2) = 2(-2)^2 - 3(-2) + 1', why: 'The parentheses keep the negative sign attached to the input.' },
        { text: 'Square the input.', tex: '= 2(4) - 3(-2) + 1', why: '$(-2)^2 = (-2)(-2) = 4$. A negative times a negative is positive.' },
        { text: 'Multiply.', tex: '= 8 + 6 + 1', why: '$-3(-2) = +6$. Subtracting a negative amount adds.' },
        { text: 'Add.', tex: '= 15', why: '$8 + 6 + 1 = 15$.' },
      ],
      answer: '$f(-2) = 15$',
    },
    {
      title: 'Solve f(x) = 21',
      kind: 'intermediate',
      problem: [{ t: 'p', text: 'For $f(x) = x^2 - 4$, find every $x$ with $f(x) = 21$.' }],
      steps: [
        { text: 'Set the rule equal to the output.', tex: 'x^2 - 4 = 21', why: '$f(x) = 21$ asks which inputs give an output of $21$, so the rule $x^2 - 4$ must equal $21$.' },
        { text: 'Isolate $x^2$.', tex: 'x^2 = 25', why: 'Add $4$ to both sides.' },
        { text: 'Take square roots.', tex: 'x = 5 \\quad\\text{or}\\quad x = -5', why: 'Both $5^2$ and $(-5)^2$ equal $25$, so there are two inputs. Forgetting $-5$ loses half the answer.' },
        { text: 'Check both.', tex: 'f(5) = 25 - 4 = 21, \\quad f(-5) = 25 - 4 = 21', why: 'Substituting back confirms each input really gives $21$.' },
      ],
      answer: '$x = 5$ or $x = -5$',
    },
    {
      title: 'A common mistake: squaring the front negative',
      kind: 'common-mistake',
      problem: [{ t: 'p', text: 'For $g(x) = -x^2 + 5x$, a student finds $g(-2)$ like this: $(-2)^2 = 4$, so $g(-2) = 4 - 10 = -6$. Find the mistake and give the correct value.' }],
      steps: [
        { text: 'Write the substitution with parentheses.', tex: 'g(-2) = -(-2)^2 + 5(-2)', why: 'Only the $x$ is replaced. The negative sign in front of $x^2$ stays where it is.' },
        { text: 'Find the error.', why: 'The student treated $-x^2$ as $(-x)^2$. But $-x^2$ means "square $x$, then take the opposite." The student squared $-2$ correctly to get $4$ but then dropped the negative in front.' },
        { text: 'Square, then take the opposite.', tex: '-(-2)^2 = -(4) = -4', why: 'Exponents before the opposite: $(-2)^2 = 4$, and the front negative makes it $-4$.' },
        { text: 'Finish.', tex: 'g(-2) = -4 - 10 = -14', why: '$5(-2) = -10$.' },
        { text: 'Sanity check with the graph idea.', why: 'Since $g(x) = -x^2 + 5x$ has $a = -1 < 0$, its outputs get very negative for inputs far from the vertex. A negative input like $-2$ giving a fairly negative output makes sense.' },
      ],
      answer: '$g(-2) = -14$, not $-6$. In $-x^2$, square first, then apply the negative.',
    },
    {
      title: 'Reading a basketball shot',
      kind: 'real-world',
      problem: [{ t: 'p', text: 'A basketball is shot from a height of 6 feet at 24 feet per second. Its height in feet after $t$ seconds is $h(t) = -16t^2 + 24t + 6$. (a) Find $h(1)$ and explain what it means. (b) What does $h(0) = 6$ mean? (c) Which equation answers "When is the ball 10 feet high, at rim level?"' }],
      steps: [
        { text: '(a) Evaluate $h(1)$.', tex: 'h(1) = -16(1)^2 + 24(1) + 6 = -16 + 24 + 6 = 14', why: 'The input $1$ replaces $t$. $1^2 = 1$.' },
        { text: 'Interpret with units.', why: 'The input is time in seconds and the output is height in feet, so $h(1) = 14$ means: $1$ second after the shot, the ball is $14$ feet above the floor.' },
        { text: '(b) Interpret $h(0) = 6$.', why: 'An input of $0$ seconds is the instant the ball is released, so the ball leaves the shooter\'s hands $6$ feet above the floor.' },
        { text: '(c) Choose the equation.', tex: 'h(t) = 10 \\quad\\Longrightarrow\\quad -16t^2 + 24t + 6 = 10', why: 'The question gives a height (an output) and asks for a time (an input). So the height function is set **equal** to $10$. Writing $h(10)$ would mean the height after $10$ seconds, a different question.' },
      ],
      answer: '(a) $h(1) = 14$: one second after the shot, the ball is 14 feet high. (b) It is released 6 feet above the floor. (c) $h(t) = 10$.',
    },
    {
      title: 'Two widths, one area',
      kind: 'challenging',
      problem: [{ t: 'p', text: 'You have 60 feet of fencing for a rectangular dog run. If the width is $w$ feet, the length is $30 - w$ feet and the area in square feet is $A(w) = w(30 - w)$. (a) Find and interpret $A(10)$. (b) Solve $A(w) = 200$. (c) Solve $A(w) = 225$.' }],
      steps: [
        { text: '(a) Evaluate $A(10)$.', tex: 'A(10) = 10(30 - 10) = 10(20) = 200', why: 'Replace $w$ with $10$. A width of $10$ feet leaves $30 - 10 = 20$ feet for the length.' },
        { text: 'Interpret.', why: 'The input is width in feet and the output is area in square feet: a dog run $10$ feet wide has an area of $200$ square feet.' },
        { text: '(b) Set up $A(w) = 200$ in standard form.', tex: 'w(30 - w) = 200 \\;\\Longrightarrow\\; 30w - w^2 = 200 \\;\\Longrightarrow\\; w^2 - 30w + 200 = 0', why: 'Distribute, then move every term to one side (add $w^2$ and subtract $30w$ from both sides) so the zero product property can be used.' },
        { text: 'Factor and solve.', tex: '(w - 10)(w - 20) = 0 \\;\\Longrightarrow\\; w = 10 \\;\\text{or}\\; w = 20', why: '$-10$ and $-20$ multiply to $200$ and add to $-30$. Check: $A(20) = 20 \\cdot 10 = 200$.' },
        { text: 'Interpret both answers.', why: 'Width $10$ gives a $10$ by $20$ run, and width $20$ gives a $20$ by $10$ run. Same rectangle turned sideways, so both widths make sense.' },
        { text: '(c) Solve $A(w) = 225$.', tex: 'w^2 - 30w + 225 = 0 \\;\\Longrightarrow\\; (w - 15)^2 = 0 \\;\\Longrightarrow\\; w = 15', why: 'This time there is only one solution: a $15$ by $15$ square. $225$ square feet is the largest area this fencing can enclose, the top of the parabola.' },
      ],
      answer: '(a) $A(10) = 200$: a 10-foot-wide run has an area of 200 square feet. (b) $w = 10$ or $w = 20$. (c) $w = 15$ only.',
    },
  ],
  teachMeAgain: [
    {
      approach: 'visual',
      title: 'Read the answers off the graph',
      blocks: [
        { t: 'p', text: 'Every point on the graph of $f$ is (input, output). To **evaluate** $f(-3)$, go to $x = -3$ and read the height of the curve. To **solve** $f(x) = 5$, go to height $5$ and read every $x$ where the curve is that high.' },
        {
          t: 'graph',
          caption: 'Evaluate by going up from an input. Solve by going across from an output.',
          spec: {
            xMin: -6,
            xMax: 4,
            yMin: -6,
            yMax: 8,
            functions: [
              { expr: 'x^2 + 2x - 3', label: 'f(x) = x^2 + 2x - 3' },
              { expr: '5', label: 'y = 5', dashed: true },
            ],
            points: [
              { x: -3, y: 0, label: 'f(-3) = 0' },
              { x: -4, y: 5, label: 'x = -4' },
              { x: 2, y: 5, label: 'x = 2' },
            ],
            ariaLabel: 'The parabola f(x) = x^2 + 2x - 3 with the point (-3, 0) marked, and the dashed line y = 5 meeting the parabola at (-4, 5) and (2, 5).',
          },
        },
        { t: 'p', text: 'At $x = -3$ the curve is at height $0$, so $f(-3) = 0$. The line $y = 5$ hits the curve twice, at $x = -4$ and $x = 2$, so $f(x) = 5$ has two solutions.' },
      ],
    },
    {
      approach: 'simpler-example',
      title: 'Start with f(x) = x squared',
      blocks: [
        { t: 'p', text: 'Take the simplest quadratic, $f(x) = x^2$:' },
        { t: 'list', items: [
          '$f(3) = 3^2 = 9$ and $f(-3) = (-3)^2 = 9$. Squaring makes the sign disappear.',
          'So $f(x) = 9$ has two answers, $x = 3$ and $x = -3$.',
        ] },
        { t: 'p', text: 'Now put a negative in front: $g(x) = -x^2$.' },
        { t: 'list', items: [
          '$g(3) = -(3)^2 = -9$ and $g(-3) = -(-3)^2 = -9$.',
          'Square first, then apply the front negative. The output of $-x^2$ is never positive.',
        ] },
      ],
    },
    {
      approach: 'analogy',
      title: 'A vending machine',
      blocks: [
        { t: 'p', text: 'Think of $f$ as a vending machine. You type in a code (the input) and one snack comes out (the output). $f(2) = 5$ says "type $2$, get $5$."' },
        { t: 'p', text: '**Evaluating** is typing a code and seeing what drops. **Solving** $f(x) = 5$ is the reverse: you want snack $5$, so which codes give it? With a quadratic machine, often two different codes give the same snack, like $2$ and $-4$ here.' },
        { t: 'p', text: 'In a real situation, the machine has labeled buttons. For $h(t)$, you type a time in seconds and get a height in feet, so $h(2) = 52$ reads "at $2$ seconds, $52$ feet up."' },
      ],
    },
    {
      approach: 'prerequisite',
      title: 'Refresher: exponents and negatives',
      blocks: [
        { t: 'list', items: [
          '$(-5)^2 = (-5)(-5) = 25$: the parentheses say the negative is part of what is squared.',
          '$-5^2 = -(5 \\cdot 5) = -25$: without parentheses, only the $5$ is squared.',
          '$3(-2)^2 = 3 \\cdot 4 = 12$: square first, then multiply.',
          '$-4(-3) = 12$: a negative times a negative is positive.',
          '$-x^2$ at $x = -5$ is $-(-5)^2 = -25$.',
          'On a calculator, type the parentheses: $(-5)^2$, not $-5^2$.',
        ] },
      ],
    },
    {
      approach: 'step-by-step',
      title: 'A 4-step routine for evaluating',
      blocks: [
        { t: 'p', text: 'Find $f(-4)$ for $f(x) = -2x^2 + 3x + 7$.' },
        { t: 'list', ordered: true, items: [
          '**Rewrite with empty parentheses** for every $x$: $f(\\;) = -2(\\;)^2 + 3(\\;) + 7$.',
          '**Fill in the input:** $f(-4) = -2(-4)^2 + 3(-4) + 7$.',
          '**Square first:** $(-4)^2 = 16$, so $-2(16) + 3(-4) + 7$.',
          '**Multiply, then add:** $-32 - 12 + 7 = -37$.',
        ] },
        { t: 'p', text: 'So $f(-4) = -37$. The empty-parentheses step makes it almost impossible to lose a negative sign.' },
      ],
    },
    {
      approach: 'alternate-strategy',
      title: 'Use the factored form',
      blocks: [
        { t: 'p', text: 'Since $x^2 + 2x - 3 = (x + 3)(x - 1)$, you can evaluate $f(x) = x^2 + 2x - 3$ with the factored form instead. Fewer squares means fewer sign errors.' },
        { t: 'list', items: [
          '$f(-3) = (-3 + 3)(-3 - 1) = (0)(-4) = 0$.',
          '$f(-4) = (-4 + 3)(-4 - 1) = (-1)(-5) = 5$.',
          '$f(2) = (2 + 3)(2 - 1) = (5)(1) = 5$.',
        ] },
        { t: 'p', text: 'These match the table: $f(-3) = 0$, $f(-4) = 5$, $f(2) = 5$. Equivalent forms always give the same output, so pick the form that makes the arithmetic easiest.' },
      ],
    },
  ],
  guided: [
    { generator: 'u4.evaluate-quadratic', difficulty: 1 },
    { generator: 'u4.interpret-notation', difficulty: 1 },
    { generator: 'u4.evaluate-quadratic', difficulty: 1 },
    { generator: 'u4.interpret-notation', difficulty: 1 },
  ],
  independent: {
    count: 8,
    reviewCount: 2,
    mix: [
      { generator: 'u4.evaluate-quadratic', difficulty: 1, weight: 1 },
      { generator: 'u4.evaluate-quadratic', difficulty: 2, weight: 2 },
      { generator: 'u4.evaluate-quadratic', difficulty: 3, weight: 2 },
      { generator: 'u4.interpret-notation', difficulty: 1, weight: 1 },
      { generator: 'u4.interpret-notation', difficulty: 2, weight: 1 },
      { generator: 'u4.interpret-notation', difficulty: 3, weight: 1 },
    ],
  },
  quiz: {
    items: [
      { generator: 'u4.evaluate-quadratic', difficulty: 2 },
      { generator: 'u4.evaluate-quadratic', difficulty: 2 },
      { generator: 'u4.evaluate-quadratic', difficulty: 3 },
      { generator: 'u4.interpret-notation', difficulty: 2 },
      { generator: 'u4.interpret-notation', difficulty: 3 },
      { generator: 'u4.interpret-notation', difficulty: 3 },
    ],
  },
  summary: [
    'A quadratic function has the form $f(x) = ax^2 + bx + c$ with $a \\ne 0$, and $f(3)$ means the output when the input is $3$.',
    'To evaluate, put the input in parentheses everywhere $x$ appears and square first: $(-3)^2 = 9$, but $-x^2$ at $x = -3$ is $-9$.',
    'To solve $f(x) = 5$, set the rule equal to $5$ and solve. A quadratic can have two inputs with the same output.',
    'In context, the input and output carry units: $h(2) = 52$ means "after 2 seconds, 52 feet high," $h(0)$ is the starting height, and $h(t) = 0$ asks when it hits the ground.',
  ],
  mastery: { quizPassScore: 0.8, practiceMinCorrect: 5 },
};
