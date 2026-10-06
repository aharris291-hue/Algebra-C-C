import type { LessonContent } from '../../../core/curriculum/types';

/**
 * U4L10 Choosing a Method and Quadratic Constraints (A.PAR.6.3, A.PAR.6.4, A.MM.1.1)
 * Choosing among factoring, square roots, completing the square and the quadratic formula; the projectile
 * model h(t) = -16t^2 + vt + h0 in feet; and keeping only the solutions that make sense in context (S4.13).
 *
 * Math verified by hand (2026-10-06): every solution below was substituted back into its equation or model, every discriminant was recomputed, and every rounded time and length was recomputed independently.
 */
export const U4L10: LessonContent = {
  lessonId: 'U4L10',
  goal: 'Choose an efficient method (factoring, square roots, completing the square, or the quadratic formula) for a quadratic equation, and decide which solutions make sense in a real situation, such as rejecting a negative time when a ball hits the ground.',
  needToKnow: [
    { t: 'p', text: 'This lesson pulls together the four solving methods from Unit 4:' },
    {
      t: 'list',
      items: [
        '**Factoring:** $x^2 - 7x + 12 = 0$ becomes $(x - 3)(x - 4) = 0$, so $x = 3$ or $x = 4$.',
        '**Square roots:** $5x^2 = 80$ becomes $x^2 = 16$, so $x = \\pm 4$.',
        '**Completing the square:** $x^2 + 10x + 18 = 0$ becomes $(x + 5)^2 = 7$, so $x = -5 \\pm \\sqrt{7}$.',
        '**Quadratic formula:** $x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$ works on any $ax^2 + bx + c = 0$.',
      ],
    },
    { t: 'callout', variant: 'tip', title: 'Quick check', text: 'Solve $x^2 = 36$. (You should get $x = 6$ or $x = -6$.) If a method feels shaky, open **Teach Me Again** and choose the refresher.' },
  ],
  vocabulary: [
    { term: 'constraint', meaning: 'A limit the situation puts on the answer, like "time cannot be negative" or "a length must be positive."' },
    { term: 'reject a solution', meaning: 'Throw out a solution of the equation because it does not fit the situation. It still solves the equation; it just does not answer the question.' },
    { term: 'projectile', meaning: 'An object that is thrown, launched, or dropped and then moves only under gravity, like a ball or a rocket after its engine stops.' },
    { term: 'initial velocity', meaning: 'The starting upward speed of a projectile, $v$, in feet per second. Negative would mean thrown downward; zero means dropped.' },
    { term: 'initial height', meaning: 'The height $h_0$ where the projectile starts, at $t = 0$.' },
  ],
  instruction: [
    { t: 'p', text: '### Choosing a method' },
    { t: 'p', text: 'All four methods give the same correct answers. The goal is to pick the one that gets you there with the least work and the fewest chances for mistakes.' },
    {
      t: 'table',
      caption: 'Which solving method to try first, based on what the equation looks like.',
      headers: ['If the equation...', 'Try', 'Example'],
      rows: [
        ['factors easily, or has no constant term', 'factoring', '$x^2 - 7x + 12 = 0$, or $3x^2 + 6x = 0$'],
        ['has no separate x-term (just a square)', 'square roots', '$5x^2 - 80 = 0$, or $(x - 2)^2 = 9$'],
        ['has $a = 1$ and an even $b$, but does not factor', 'completing the square', '$x^2 + 10x + 18 = 0$'],
        ['is anything else, or has messy numbers', 'quadratic formula', '$3x^2 + 4x - 2 = 0$'],
      ],
    },
    { t: 'callout', variant: 'tip', title: 'Use the discriminant to decide', text: 'For whole-number $a$, $b$ and $c$, if $b^2 - 4ac$ is a **perfect square** (like $1, 4, 9, 16, \\dots$ or $0$), the quadratic factors over the integers, so factoring is a good choice. If it is not a perfect square, the answers involve radicals; use the formula or complete the square. If it is negative, stop: there are no real solutions.' },
    { t: 'p', text: 'For example, $3x^2 + 4x - 2 = 0$ has $b^2 - 4ac = 16 + 24 = 40$. That is not a perfect square, so skip factoring and use the formula:' },
    { t: 'math', tex: 'x = \\frac{-4 \\pm \\sqrt{40}}{6} = \\frac{-4 \\pm 2\\sqrt{10}}{6} = \\frac{-2 \\pm \\sqrt{10}}{3} \\approx 0.39 \\text{ or } -1.72' },
    { t: 'p', text: '### The projectile model' },
    { t: 'p', text: 'When an object is thrown straight up (or dropped) near Earth, its height in **feet** after $t$ **seconds** is modeled by' },
    { t: 'math', tex: 'h(t) = -16t^2 + vt + h_0' },
    {
      t: 'list',
      items: [
        '$-16$ comes from gravity: it is half of $32$ feet per second squared, the rate gravity pulls objects down. It is negative because gravity pulls the height down.',
        '$v$ is the initial upward velocity in feet per second.',
        '$h_0$ is the initial height in feet, the height at $t = 0$.',
      ],
    },
    { t: 'p', text: 'Suppose a ball is thrown upward at $48$ feet per second from a roof $64$ feet high: $h(t) = -16t^2 + 48t + 64$. It hits the ground when $h(t) = 0$:' },
    { t: 'math', tex: '-16t^2 + 48t + 64 = 0 \\;\\Longrightarrow\\; -16(t^2 - 3t - 4) = 0 \\;\\Longrightarrow\\; -16(t - 4)(t + 1) = 0' },
    { t: 'p', text: 'The equation has two solutions, $t = 4$ and $t = -1$. But the ball was thrown at $t = 0$, so a negative time is before the throw and does not fit. **Reject** $t = -1$. The ball lands after $4$ seconds.' },
    {
      t: 'graph',
      caption: 'Height of the ball from launch to landing. It starts at 64 feet, peaks at 100 feet, and lands at 4 seconds.',
      spec: {
        xMin: -1,
        xMax: 5,
        yMin: -20,
        yMax: 120,
        yStep: 20,
        xLabel: 'time (s)',
        yLabel: 'height (ft)',
        functions: [{ expr: '-16x^2 + 48x + 64', label: 'h(t)', domain: [0, 4] }],
        points: [
          { x: 0, y: 64, label: 'start (0, 64)' },
          { x: 1.5, y: 100, label: 'top (1.5, 100)' },
          { x: 4, y: 0, label: 'lands (4, 0)' },
        ],
        ariaLabel: 'A downward-opening parabola drawn only from time 0 to time 4. It starts at height 64, rises to a maximum of 100 feet at 1.5 seconds, and comes down to height 0 at 4 seconds.',
      },
    },
    { t: 'p', text: '### Constraints: keep only what makes sense' },
    { t: 'p', text: 'After you solve, ask: **what values are possible here?** Then test each solution.' },
    {
      t: 'table',
      caption: 'Common constraints in quadratic word problems.',
      headers: ['Situation', 'Constraint', 'So reject...'],
      rows: [
        ['time after a launch', 'time is at least 0 (and before landing)', 'negative times'],
        ['length, width, side of a shape', 'length is greater than 0', 'zero or negative lengths'],
        ['number of people or objects', 'a whole number, at least 0', 'fractions and negatives'],
        ['a plain number puzzle', 'any real number', 'nothing: keep both'],
      ],
    },
    { t: 'callout', variant: 'warning', title: 'Do not reject automatically', text: 'Not every second solution is wrong. When is the ball at a height of $96$ feet? Solving $-16t^2 + 48t + 64 = 96$ gives $t = 1$ and $t = 2$. **Both** fit: the ball passes $96$ feet on the way up and again on the way down. Reject a solution only when the situation rules it out.' },
    { t: 'callout', variant: 'realworld', title: 'Where this shows up', text: 'Engineers find when a launched rocket lands, builders find the width of a walkway that fits a space, and athletes study how long a ball stays in the air. In each case the math gives two answers and the situation decides which to keep.' },
  ],
  examples: [
    {
      title: 'Pick the best method',
      kind: 'introductory',
      problem: [{ t: 'p', text: 'Choose a method for each equation and solve: (a) $x^2 - 7x + 12 = 0$, (b) $5x^2 - 80 = 0$, (c) $x^2 + 10x + 18 = 0$, (d) $3x^2 + 4x - 2 = 0$.' }],
      steps: [
        { text: '(a) Factor.', tex: '(x - 3)(x - 4) = 0 \\;\\Longrightarrow\\; x = 3 \\text{ or } x = 4', why: 'Two numbers multiply to $12$ and add to $-7$: $-3$ and $-4$. Factoring is fastest when it works.' },
        { text: '(b) Use square roots.', tex: '5x^2 = 80 \\;\\Longrightarrow\\; x^2 = 16 \\;\\Longrightarrow\\; x = \\pm 4', why: 'There is no separate $x$-term, so isolate $x^2$ and take the root with $\\pm$.' },
        { text: '(c) Complete the square.', tex: 'x^2 + 10x + 25 = -18 + 25 \\;\\Longrightarrow\\; (x + 5)^2 = 7 \\;\\Longrightarrow\\; x = -5 \\pm \\sqrt{7}', why: '$a = 1$ and $b = 10$ is even, so $\\left(\\frac{10}{2}\\right)^2 = 25$ is easy. It does not factor: $b^2 - 4ac = 100 - 72 = 28$ is not a perfect square.' },
        { text: '(d) Use the formula.', tex: 'x = \\frac{-4 \\pm \\sqrt{16 + 24}}{6} = \\frac{-2 \\pm \\sqrt{10}}{3}', why: '$a = 3$ makes completing the square messy, and $40$ is not a perfect square, so it does not factor. $\\sqrt{40} = 2\\sqrt{10}$; divide each term by $2$.' },
      ],
      answer: '(a) $x = 3, 4$; (b) $x = \\pm 4$; (c) $x = -5 \\pm \\sqrt{7}$; (d) $x = \\frac{-2 \\pm \\sqrt{10}}{3}$',
    },
    {
      title: 'A rectangle with a given area',
      kind: 'intermediate',
      problem: [{ t: 'p', text: 'A rectangular garden is 4 feet longer than it is wide, and its area is 60 square feet. Find its width and length.' }],
      steps: [
        { text: 'Write an equation.', tex: 'w(w + 4) = 60', why: 'Let $w$ be the width. The length is $w + 4$, and area is width times length.' },
        { text: 'Write standard form.', tex: 'w^2 + 4w - 60 = 0', why: 'Distribute and subtract $60$ so one side is $0$.' },
        { text: 'Factor and solve.', tex: '(w + 10)(w - 6) = 0 \\;\\Longrightarrow\\; w = -10 \\text{ or } w = 6', why: 'The discriminant $16 + 240 = 256 = 16^2$ is a perfect square, so it factors: $10 \\cdot (-6) = -60$ and $10 + (-6) = 4$.' },
        { text: 'Apply the constraint.', tex: 'w = 6', why: 'A width must be positive, so reject $w = -10$.' },
        { text: 'Answer and check.', tex: 'w = 6, \\quad w + 4 = 10, \\quad 6 \\cdot 10 = 60', why: 'The area matches, and the length is $4$ more than the width.' },
      ],
      answer: 'Width 6 feet, length 10 feet.',
    },
    {
      title: 'When does the ball land?',
      kind: 'intermediate',
      problem: [{ t: 'p', text: 'A ball is thrown upward at 48 feet per second from a roof 64 feet high, so $h(t) = -16t^2 + 48t + 64$. When does it hit the ground?' }],
      steps: [
        { text: 'Set the height to $0$.', tex: '-16t^2 + 48t + 64 = 0', why: 'On the ground, the height is $0$ feet.' },
        { text: 'Factor out $-16$.', tex: '-16(t^2 - 3t - 4) = 0', why: 'Every term divides by $-16$: $48 \\div (-16) = -3$ and $64 \\div (-16) = -4$. This leaves a simple trinomial.' },
        { text: 'Factor and solve.', tex: '-16(t - 4)(t + 1) = 0 \\;\\Longrightarrow\\; t = 4 \\text{ or } t = -1', why: '$-4 \\cdot 1 = -4$ and $-4 + 1 = -3$. The factor $-16$ is never $0$, so only the binomials give solutions.' },
        { text: 'Apply the constraint.', tex: 't = 4', why: 'The ball is thrown at $t = 0$. A negative time is before the throw, so reject $t = -1$.' },
        { text: 'Check.', tex: 'h(4) = -16(16) + 48(4) + 64 = -256 + 192 + 64 = 0', why: 'The height at $4$ seconds really is $0$.' },
      ],
      answer: 'The ball hits the ground after 4 seconds.',
    },
    {
      title: 'A common mistake: rejecting a good solution',
      kind: 'common-mistake',
      problem: [{ t: 'p', text: 'For the same ball, $h(t) = -16t^2 + 48t + 64$, a student solves $h(t) = 96$ and gets $t = 1$ or $t = 2$. The student says, "A ball can only be in one place, so the answer is just $t = 1$." Is the student right?' }],
      steps: [
        { text: 'Re-solve to confirm the solutions.', tex: '-16t^2 + 48t - 32 = 0 \\;\\Longrightarrow\\; t^2 - 3t + 2 = 0 \\;\\Longrightarrow\\; (t - 1)(t - 2) = 0', why: 'Subtract $96$, then divide every term by $-16$. The solutions $t = 1$ and $t = 2$ are correct.' },
        { text: 'Check the constraint for each.', why: 'The ball is in the air from $t = 0$ to $t = 4$. Both $1$ and $2$ are in that range, so neither is ruled out.' },
        { text: 'Check both heights.', tex: 'h(1) = -16 + 48 + 64 = 96, \\quad h(2) = -64 + 96 + 64 = 96', why: 'Both times really give a height of $96$ feet.' },
        { text: 'Interpret.', why: 'The ball rises past $96$ feet at $1$ second, peaks at $100$ feet at $1.5$ seconds, and falls back past $96$ feet at $2$ seconds. It is at one place at a time, but it visits that height twice.' },
      ],
      answer: 'No. Both $t = 1$ s (going up) and $t = 2$ s (coming down) are correct. Reject a solution only when the situation rules it out.',
    },
    {
      title: 'A walkway around a pool',
      kind: 'real-world',
      problem: [{ t: 'p', text: 'A rectangular pool is 20 feet by 12 feet. A walkway of the same width $x$ goes all the way around it. The pool and walkway together cover 384 square feet. How wide is the walkway?' }],
      steps: [
        { text: 'Write an equation.', tex: '(20 + 2x)(12 + 2x) = 384', why: 'The walkway adds $x$ on **both** ends of each side, so each dimension grows by $2x$.' },
        { text: 'Expand and write standard form.', tex: '4x^2 + 64x + 240 = 384 \\;\\Longrightarrow\\; 4x^2 + 64x - 144 = 0', why: '$(20)(12) = 240$ and $20(2x) + 12(2x) = 64x$. Subtract $384$.' },
        { text: 'Divide by $4$ and factor.', tex: 'x^2 + 16x - 36 = 0 \\;\\Longrightarrow\\; (x + 18)(x - 2) = 0', why: 'Dividing by the common factor makes the numbers smaller. $18 \\cdot (-2) = -36$ and $18 + (-2) = 16$.' },
        { text: 'Apply the constraint.', tex: 'x = 2', why: 'A width must be positive, so reject $x = -18$.' },
        { text: 'Check.', tex: '(20 + 4)(12 + 4) = 24 \\cdot 16 = 384', why: 'The total area matches.' },
      ],
      answer: 'The walkway is 2 feet wide.',
    },
    {
      title: 'A rocket with messy numbers',
      kind: 'challenging',
      problem: [{ t: 'p', text: 'A model rocket is launched from a 5-foot platform at 80 feet per second, so $h(t) = -16t^2 + 80t + 5$. (a) When does it hit the ground? (b) When is it 100 feet high? Round to the nearest hundredth of a second.' }],
      steps: [
        { text: '(a) Set $h(t) = 0$ and multiply by $-1$.', tex: '16t^2 - 80t - 5 = 0', why: 'Multiplying both sides by $-1$ keeps the same solutions and makes $a$ positive, which means fewer sign mistakes.' },
        { text: 'Check the discriminant and pick a method.', tex: '(-80)^2 - 4(16)(-5) = 6400 + 320 = 6720', why: '$6720$ is not a perfect square ($81^2 = 6561$, $82^2 = 6724$), so the formula is the way to go.' },
        { text: 'Use the formula.', tex: 't = \\frac{80 \\pm \\sqrt{6720}}{32} \\approx \\frac{80 \\pm 81.9756}{32} \\approx 5.06 \\text{ or } -0.06', why: '$\\frac{161.9756}{32} \\approx 5.0617$ and $\\frac{-1.9756}{32} \\approx -0.0617$.' },
        { text: 'Apply the constraint for (a).', tex: 't \\approx 5.06', why: 'Reject $-0.06$: it is before the launch.' },
        { text: '(b) Set $h(t) = 100$, write standard form, multiply by $-1$.', tex: '16t^2 - 80t + 95 = 0, \\quad (-80)^2 - 4(16)(95) = 6400 - 6080 = 320', why: 'Subtract $100$ from both sides first: $5 - 100 = -95$.' },
        { text: 'Use the formula.', tex: 't = \\frac{80 \\pm \\sqrt{320}}{32} \\approx \\frac{80 \\pm 17.8885}{32} \\approx 3.06 \\text{ or } 1.94', why: '$\\frac{97.8885}{32} \\approx 3.0590$ and $\\frac{62.1115}{32} \\approx 1.9410$.' },
        { text: 'Apply the constraint for (b).', why: 'Both times are between launch ($t = 0$) and landing ($t \\approx 5.06$), so keep both: once on the way up and once on the way down.' },
      ],
      answer: '(a) about 5.06 seconds; (b) about 1.94 seconds and about 3.06 seconds.',
    },
  ],
  teachMeAgain: [
    {
      approach: 'visual',
      title: 'See the rejected solution on the graph',
      blocks: [
        { t: 'p', text: 'Here is the whole parabola $y = -16x^2 + 48x + 64$, dashed, with the part that actually describes the ball drawn solid, from $t = 0$ to $t = 4$.' },
        {
          t: 'graph',
          caption: 'The full parabola crosses zero at t equals negative 1 and t equals 4, but only the solid part from 0 to 4 describes the ball.',
          spec: {
            xMin: -2,
            xMax: 5,
            yMin: -40,
            yMax: 120,
            yStep: 20,
            xLabel: 'time (s)',
            yLabel: 'height (ft)',
            functions: [
              { expr: '-16x^2 + 48x + 64', dashed: true, label: 'equation' },
              { expr: '-16x^2 + 48x + 64', label: 'the ball', domain: [0, 4] },
            ],
            points: [
              { x: -1, y: 0, label: '(-1, 0) rejected' },
              { x: 4, y: 0, label: '(4, 0) lands' },
            ],
            ariaLabel: 'A dashed downward parabola crossing the time axis at -1 and 4. A solid copy covers only times 0 to 4. The point (-1, 0) is marked rejected and (4, 0) is marked lands.',
          },
        },
        { t: 'p', text: 'The equation does not know the ball was thrown at $t = 0$, so it happily gives $t = -1$ too. The graph shows that point lies outside the part of the curve that means anything for this ball.' },
      ],
    },
    {
      approach: 'simpler-example',
      title: 'A square patio',
      blocks: [
        { t: 'p', text: 'A square patio has an area of $49$ square feet. How long is each side?' },
        { t: 'math', tex: 's^2 = 49 \\;\\Longrightarrow\\; s = \\pm 7' },
        { t: 'p', text: 'The equation has two solutions, $7$ and $-7$. But a side length must be positive, so the side is $7$ feet. The $-7$ solves the equation but not the problem.' },
        { t: 'p', text: 'Compare a plain number puzzle: "A number squared plus three times the number is $10$." Then $x^2 + 3x - 10 = 0$, $(x + 5)(x - 2) = 0$, and **both** $x = 2$ and $x = -5$ work, because a number is allowed to be negative. Check: $25 - 15 = 10$.' },
      ],
    },
    {
      approach: 'analogy',
      title: 'Picking a tool from a toolbox',
      blocks: [
        { t: 'p', text: 'The four methods are like tools. **Factoring** is a screwdriver: quick and easy, but only when the screw fits. **Square roots** is a hammer: perfect for one job (an equation with just a square). **Completing the square** is a wrench that fits nicely when $a = 1$ and $b$ is even. The **quadratic formula** is a multi-tool: it always works, but takes more steps.' },
        { t: 'p', text: 'A good builder looks at the job before grabbing a tool. A good solver looks at the equation first.' },
        { t: 'p', text: 'And checking constraints is like checking that what you built actually fits the room: a shelf with a length of $-3$ feet will not fit anywhere.' },
      ],
    },
    {
      approach: 'prerequisite',
      title: 'Refresher: the four methods side by side',
      blocks: [
        { t: 'p', text: 'Here is one equation, $x^2 - 2x - 8 = 0$, solved all four ways. They all agree.' },
        { t: 'list', items: [
          '**Factoring:** $(x - 4)(x + 2) = 0$, so $x = 4$ or $x = -2$.',
          '**Completing the square:** $x^2 - 2x + 1 = 9$, so $(x - 1)^2 = 9$, $x - 1 = \\pm 3$, $x = 4$ or $x = -2$.',
          '**Formula:** $x = \\frac{2 \\pm \\sqrt{4 + 32}}{2} = \\frac{2 \\pm 6}{2}$, so $x = 4$ or $x = -2$.',
          '**Square roots** only applies once it is written as a square, which is what completing the square did.',
        ] },
        { t: 'p', text: 'Since they always agree, choose the one with the least work.' },
      ],
    },
    {
      approach: 'step-by-step',
      title: 'A 6-step plan for word problems',
      blocks: [
        { t: 'list', ordered: true, items: [
          '**Define the variable** with units: let $t$ be the time in seconds.',
          '**Write the equation** from the situation, for example $-16t^2 + 32t + 48 = 0$ for a ball thrown up at $32$ ft/s from $48$ ft.',
          '**Simplify and pick a method.** Divide by $-16$: $t^2 - 2t - 3 = 0$. Discriminant $4 + 12 = 16$, a perfect square, so factor.',
          '**Solve:** $(t - 3)(t + 1) = 0$, so $t = 3$ or $t = -1$.',
          '**Apply the constraint:** time must be at least $0$, so reject $t = -1$.',
          '**Answer in a sentence with units and check:** the ball lands after $3$ seconds. $-16(9) + 32(3) + 48 = -144 + 96 + 48 = 0$.',
        ] },
      ],
    },
    {
      approach: 'alternate-strategy',
      title: 'Estimate from the graph first',
      blocks: [
        { t: 'p', text: 'Before doing algebra, sketch or picture the situation to know what answer to expect. For the rocket $h(t) = -16t^2 + 80t + 5$:' },
        { t: 'list', items: [
          'It starts at $5$ feet, so it lands a little **after** the time it would take to come back to its starting height.',
          'Subtract the starting height: $h(t) - 5 = -16t^2 + 80t = -16t(t - 5)$, which is $0$ at $t = 0$ and $t = 5$. So the rocket is back at $5$ feet after $5$ seconds, and the landing time should be just over $5$ seconds.',
          'The formula gives about $5.06$ seconds and $-0.06$. The estimate tells you right away which one to keep.',
        ] },
        { t: 'p', text: 'An estimate also catches mistakes: if your algebra gave a landing time of $50$ seconds, you would know to look for an error.' },
      ],
    },
  ],
  guided: [
    { generator: 'u4.quadratic-context', difficulty: 1 },
    { generator: 'u4.quadratic-context', difficulty: 1 },
    { generator: 'u4.quadratic-context', difficulty: 1 },
    { generator: 'u4.quadratic-context', difficulty: 1 },
  ],
  independent: {
    count: 8,
    reviewCount: 2,
    mix: [
      { generator: 'u4.quadratic-context', difficulty: 1, weight: 1 },
      { generator: 'u4.quadratic-context', difficulty: 2, weight: 2 },
      { generator: 'u4.quadratic-context', difficulty: 3, weight: 1 },
    ],
  },
  quiz: {
    items: [
      { generator: 'u4.quadratic-context', difficulty: 2 },
      { generator: 'u4.quadratic-context', difficulty: 2 },
      { generator: 'u4.quadratic-context', difficulty: 2 },
      { generator: 'u4.quadratic-context', difficulty: 3 },
      { generator: 'u4.quadratic-context', difficulty: 3 },
      { generator: 'u4.quadratic-context', difficulty: 3 },
    ],
  },
  summary: [
    'Pick a method by looking first: factor when it factors, use square roots when there is just a square, complete the square when $a = 1$ and $b$ is even, and use the formula for anything else.',
    'A perfect-square discriminant means the quadratic factors over the integers; a negative one means no real solutions.',
    'The projectile model $h(t) = -16t^2 + vt + h_0$ gives height in feet after $t$ seconds; set $h(t) = 0$ to find when it lands.',
    'Check every solution against the situation: reject negative times and lengths, but keep both solutions when both fit, like passing $96$ feet going up and coming down.',
  ],
  mastery: { quizPassScore: 0.8, practiceMinCorrect: 5 },
};
