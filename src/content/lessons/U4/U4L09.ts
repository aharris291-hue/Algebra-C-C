import type { LessonContent } from '../../../core/curriculum/types';

/**
 * U4L09 The Quadratic Formula and the Discriminant (A.PAR.6.3)
 * Write the equation in standard form, identify a, b and c with their signs, apply the formula,
 * simplify the radical and the fraction, and use the discriminant to count real solutions and x-intercepts (S4.12).
 *
 * Math verified by hand (2026-10-06): every discriminant, every solution (substituted back into its equation) and every rounded decimal below was recomputed independently.
 */
export const U4L09: LessonContent = {
  lessonId: 'U4L09',
  goal: 'Solve any quadratic equation with the quadratic formula, such as $2x^2 - 3x - 1 = 0$ giving $x = \\frac{3 \\pm \\sqrt{17}}{4}$, and use the discriminant $b^2 - 4ac$ to tell whether there are two, one, or no real solutions.',
  needToKnow: [
    { t: 'p', text: 'This lesson builds on three things you already know:' },
    {
      t: 'list',
      items: [
        '**Standard form.** A quadratic equation in standard form looks like $ax^2 + bx + c = 0$, with everything on one side and $0$ on the other.',
        '**Simplest radical form.** $\\sqrt{28} = \\sqrt{4} \\cdot \\sqrt{7} = 2\\sqrt{7}$.',
        '**Signs with exponents.** $(-3)^2 = 9$, but $-3^2 = -9$. Use parentheses when you square a negative number.',
      ],
    },
    { t: 'callout', variant: 'tip', title: 'Quick check', text: 'For $2x^2 - 3x - 1 = 0$, what are $a$, $b$ and $c$? (You should get $a = 2$, $b = -3$, $c = -1$. The sign belongs to the number.) If that felt shaky, open **Teach Me Again** and choose the refresher.' },
  ],
  vocabulary: [
    { term: 'standard form', meaning: 'A quadratic equation written as $ax^2 + bx + c = 0$ with $a \\ne 0$.' },
    { term: 'quadratic formula', meaning: 'The solutions of $ax^2 + bx + c = 0$ are $x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$.' },
    { term: 'discriminant', meaning: 'The expression $b^2 - 4ac$ under the square root in the formula. Its sign tells how many real solutions there are.' },
    { term: 'x-intercept', meaning: 'A point where a graph crosses or touches the $x$-axis. The real solutions of $ax^2 + bx + c = 0$ are the $x$-intercepts of $y = ax^2 + bx + c$.' },
  ],
  instruction: [
    { t: 'p', text: '### One formula that always works' },
    { t: 'p', text: 'Factoring only works on some quadratics, and square roots only work when there is no separate $x$-term. The **quadratic formula** works on every quadratic equation:' },
    { t: 'math', tex: 'ax^2 + bx + c = 0 \\quad\\Longrightarrow\\quad x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}' },
    { t: 'callout', variant: 'why', title: 'Where does the formula come from?', text: 'It is what you get by completing the square on $ax^2 + bx + c = 0$ with letters instead of numbers. Divide by $a$, move $\\frac{c}{a}$ to the right, add $\\left(\\frac{b}{2a}\\right)^2$ to both sides, and you reach $\\left(x + \\frac{b}{2a}\\right)^2 = \\frac{b^2 - 4ac}{4a^2}$. Taking square roots and subtracting $\\frac{b}{2a}$ gives the formula. So the formula is completing the square, done once for every equation.' },
    { t: 'p', text: '### Step 1: standard form, then a, b and c' },
    { t: 'p', text: 'The formula only works when the equation is in the form $ax^2 + bx + c = 0$. If it is not, rearrange first. Then read off $a$, $b$ and $c$ **with their signs**.' },
    {
      t: 'table',
      caption: 'Reading a, b and c from equations in standard form.',
      headers: ['Equation', 'a', 'b', 'c'],
      rows: [
        ['$2x^2 - 3x - 1 = 0$', '$2$', '$-3$', '$-1$'],
        ['$x^2 + 2x - 15 = 0$', '$1$', '$2$', '$-15$'],
        ['$3x^2 - 5x - 2 = 0$ (from $3x^2 = 5x + 2$)', '$3$', '$-5$', '$-2$'],
        ['$x^2 - 9 = 0$', '$1$', '$0$', '$-9$'],
      ],
    },
    { t: 'p', text: '### Step 2: substitute carefully' },
    { t: 'p', text: 'Solve $2x^2 - 3x - 1 = 0$ with $a = 2$, $b = -3$, $c = -1$. Find the discriminant first, using parentheses for negatives:' },
    { t: 'math', tex: 'b^2 - 4ac = (-3)^2 - 4(2)(-1) = 9 + 8 = 17' },
    { t: 'math', tex: 'x = \\frac{-(-3) \\pm \\sqrt{17}}{2(2)} = \\frac{3 \\pm \\sqrt{17}}{4}' },
    { t: 'p', text: 'Since $\\sqrt{17} \\approx 4.1231$, the decimals are $x \\approx \\frac{7.1231}{4} \\approx 1.78$ and $x \\approx \\frac{-1.1231}{4} \\approx -0.28$.' },
    { t: 'callout', variant: 'warning', title: 'Watch the signs', text: 'When $b$ is negative, $-b$ is **positive**: $-(-3) = 3$. And $b^2$ is never negative: $(-3)^2 = 9$. When $a$ and $c$ have opposite signs, $-4ac$ is positive: $-4(2)(-1) = +8$.' },
    { t: 'p', text: '### Step 3: simplify the radical and the fraction' },
    { t: 'p', text: 'For $x^2 - 6x + 4 = 0$: the discriminant is $(-6)^2 - 4(1)(4) = 36 - 16 = 20$, so' },
    { t: 'math', tex: 'x = \\frac{6 \\pm \\sqrt{20}}{2} = \\frac{6 \\pm 2\\sqrt{5}}{2} = 3 \\pm \\sqrt{5}' },
    { t: 'p', text: 'Simplify $\\sqrt{20} = 2\\sqrt{5}$ first. Then divide **every** term on top by $2$: $\\frac{6}{2} = 3$ and $\\frac{2\\sqrt{5}}{2} = \\sqrt{5}$. You cannot cancel the $2$ with only one of the terms.' },
    { t: 'p', text: '### The discriminant counts the solutions' },
    { t: 'p', text: 'The discriminant $b^2 - 4ac$ sits under the square root. Its sign decides what happens:' },
    {
      t: 'table',
      caption: 'What the discriminant says about the solutions and the graph.',
      headers: ['Discriminant', 'Real solutions', 'x-intercepts of the graph', 'Example'],
      rows: [
        ['positive', 'two', 'crosses the x-axis twice', '$x^2 - 4 = 0$: $0 - 4(1)(-4) = 16$'],
        ['zero', 'one', 'touches the x-axis once, at the vertex', '$x^2 - 4x + 4 = 0$: $16 - 16 = 0$'],
        ['negative', 'none', 'never meets the x-axis', '$x^2 + 2x + 5 = 0$: $4 - 20 = -16$'],
      ],
    },
    {
      t: 'graph',
      caption: 'Three parabolas: one crosses the x-axis twice, one touches it once, and one never reaches it.',
      spec: {
        xMin: -5,
        xMax: 5,
        yMin: -5,
        yMax: 10,
        functions: [
          { expr: 'x^2 - 4', label: 'y = x^2 - 4 (two)' },
          { expr: 'x^2 - 4x + 4', label: 'y = x^2 - 4x + 4 (one)', dashed: true },
          { expr: 'x^2 + 2x + 5', label: 'y = x^2 + 2x + 5 (none)' },
        ],
        points: [
          { x: -2, y: 0, label: '(-2, 0)' },
          { x: 2, y: 0, label: '(2, 0)' },
        ],
        ariaLabel: 'Three upward parabolas. y equals x squared minus 4 crosses the x-axis at (-2, 0) and (2, 0). y equals x squared minus 4x plus 4 touches the x-axis only at (2, 0). y equals x squared plus 2x plus 5 has its lowest point at (-1, 4), above the x-axis.',
      },
    },
    { t: 'callout', variant: 'tip', title: 'Why the sign matters', text: 'If $b^2 - 4ac > 0$, the $\\pm$ gives two different numbers. If it is $0$, adding and subtracting $\\sqrt{0} = 0$ gives the same number twice, so there is one solution, $x = \\frac{-b}{2a}$. If it is negative, the square root is not a real number, so there are no real solutions.' },
    { t: 'callout', variant: 'realworld', title: 'Where this shows up', text: 'Will a thrown ball ever reach a certain height? Set the height formula equal to that height and check the discriminant. Negative means it never gets that high; zero means it just reaches it at the very top.' },
  ],
  examples: [
    {
      title: 'Use the formula on a simple equation',
      kind: 'introductory',
      problem: [{ t: 'p', text: 'Solve $x^2 + 2x - 15 = 0$ with the quadratic formula.' }],
      steps: [
        { text: 'Identify $a$, $b$ and $c$.', tex: 'a = 1, \\quad b = 2, \\quad c = -15', why: 'The equation is already in standard form. The $-$ in front of $15$ belongs to $c$.' },
        { text: 'Find the discriminant.', tex: 'b^2 - 4ac = 2^2 - 4(1)(-15) = 4 + 60 = 64', why: 'Computing it first keeps the work under the root organized. $-4(1)(-15) = +60$.' },
        { text: 'Substitute into the formula.', tex: 'x = \\frac{-2 \\pm \\sqrt{64}}{2(1)} = \\frac{-2 \\pm 8}{2}', why: '$\\sqrt{64} = 8$, and $2a = 2$.' },
        { text: 'Split the $\\pm$.', tex: 'x = \\frac{-2 + 8}{2} = 3, \\quad x = \\frac{-2 - 8}{2} = -5', why: 'The plus gives one solution and the minus gives the other.' },
        { text: 'Check.', tex: '9 + 6 - 15 = 0, \\quad 25 - 10 - 15 = 0', why: 'Substitute: $3^2 + 2(3) - 15$ and $(-5)^2 + 2(-5) - 15$. (This one also factors, $(x + 5)(x - 3)$, which agrees.)' },
      ],
      answer: '$x = 3$ or $x = -5$',
    },
    {
      title: 'Solutions with a radical',
      kind: 'intermediate',
      problem: [{ t: 'p', text: 'Solve $2x^2 - 3x - 1 = 0$. Give exact answers and answers rounded to the nearest hundredth.' }],
      steps: [
        { text: 'Identify $a$, $b$ and $c$.', tex: 'a = 2, \\quad b = -3, \\quad c = -1', why: 'Read each coefficient with its sign.' },
        { text: 'Find the discriminant.', tex: '(-3)^2 - 4(2)(-1) = 9 + 8 = 17', why: '$17$ is positive, so there are two real solutions. It is not a perfect square, so they will be irrational.' },
        { text: 'Substitute into the formula.', tex: 'x = \\frac{-(-3) \\pm \\sqrt{17}}{2(2)} = \\frac{3 \\pm \\sqrt{17}}{4}', why: '$-b = -(-3) = 3$ and $2a = 4$. $\\sqrt{17}$ has no perfect-square factor, so it is already simplest.' },
        { text: 'Round.', tex: '\\frac{3 + 4.1231}{4} \\approx 1.78, \\quad \\frac{3 - 4.1231}{4} \\approx -0.28', why: '$\\sqrt{17} \\approx 4.1231$ (between $4$ and $5$, since $16 < 17 < 25$).' },
        { text: 'Check a decimal.', tex: '2(1.7808)^2 - 3(1.7808) - 1 \\approx 6.3425 - 5.3424 - 1 \\approx 0', why: 'Using the more precise decimal $1.7808$ (not the rounded $1.78$), the left side comes out to about $0.0001$, essentially $0$. The tiny leftover is from rounding.' },
      ],
      answer: '$x = \\frac{3 \\pm \\sqrt{17}}{4}$, about $x \\approx 1.78$ or $x \\approx -0.28$',
    },
    {
      title: 'Count solutions with the discriminant',
      kind: 'intermediate',
      problem: [{ t: 'p', text: 'Without solving, tell how many real solutions each equation has: (a) $x^2 - 6x + 9 = 0$, (b) $3x^2 + 2x + 4 = 0$, (c) $2x^2 + 7x - 3 = 0$.' }],
      steps: [
        { text: '(a) $a = 1$, $b = -6$, $c = 9$.', tex: '(-6)^2 - 4(1)(9) = 36 - 36 = 0', why: 'A discriminant of $0$ means exactly one real solution. The graph touches the $x$-axis at its vertex.' },
        { text: '(b) $a = 3$, $b = 2$, $c = 4$.', tex: '2^2 - 4(3)(4) = 4 - 48 = -44', why: 'A negative discriminant means no real solutions, because no real number is the square root of a negative.' },
        { text: '(c) $a = 2$, $b = 7$, $c = -3$.', tex: '7^2 - 4(2)(-3) = 49 + 24 = 73', why: 'A positive discriminant means two real solutions. The graph crosses the $x$-axis twice.' },
      ],
      answer: '(a) one real solution, (b) no real solutions, (c) two real solutions',
    },
    {
      title: 'A common mistake: skipping standard form',
      kind: 'common-mistake',
      problem: [{ t: 'p', text: 'To solve $3x^2 = 5x + 2$, a student uses $a = 3$, $b = 5$, $c = 2$ and gets $x = \\frac{-5 \\pm 1}{6}$, so $x = -\\frac{2}{3}$ or $x = -1$. Find the mistake and solve correctly.' }],
      steps: [
        { text: 'Test one of the student answers.', tex: 'x = -1: \\quad 3(-1)^2 = 3, \\quad 5(-1) + 2 = -3', why: '$3 \\ne -3$, so $x = -1$ is not a solution. Something went wrong.' },
        { text: 'Find the error.', why: 'The formula needs $ax^2 + bx + c = 0$. The student read $b$ and $c$ while they were still on the right side, so their signs are wrong.' },
        { text: 'Rewrite in standard form.', tex: '3x^2 - 5x - 2 = 0 \\quad\\Longrightarrow\\quad a = 3, \\; b = -5, \\; c = -2', why: 'Subtract $5x$ and $2$ from both sides. Moving a term across the equals sign changes its sign.' },
        { text: 'Use the formula.', tex: 'x = \\frac{5 \\pm \\sqrt{25 + 24}}{6} = \\frac{5 \\pm 7}{6}', why: '$b^2 - 4ac = (-5)^2 - 4(3)(-2) = 25 + 24 = 49$, and $\\sqrt{49} = 7$.' },
        { text: 'Split and check.', tex: 'x = \\frac{12}{6} = 2, \\quad x = \\frac{-2}{6} = -\\frac{1}{3}', why: 'Check $x = 2$: $3(4) = 12$ and $5(2) + 2 = 12$. Check $x = -\\frac{1}{3}$: $3 \\cdot \\frac{1}{9} = \\frac{1}{3}$ and $-\\frac{5}{3} + 2 = \\frac{1}{3}$.' },
      ],
      answer: '$x = 2$ or $x = -\\frac{1}{3}$. Always write the equation in standard form before reading $a$, $b$ and $c$.',
    },
    {
      title: 'Will the ball reach that height?',
      kind: 'real-world',
      problem: [{ t: 'p', text: 'A ball is thrown upward from 5 feet above the ground at 40 feet per second. Its height in feet after $t$ seconds is $h = -16t^2 + 40t + 5$. Does the ball reach 30 feet? Does it reach 35 feet?' }],
      steps: [
        { text: 'Set the height to $30$ and write standard form.', tex: '-16t^2 + 40t + 5 = 30 \\;\\Longrightarrow\\; -16t^2 + 40t - 25 = 0', why: 'Subtract $30$ from both sides so the right side is $0$.' },
        { text: 'Find the discriminant.', tex: '40^2 - 4(-16)(-25) = 1600 - 1600 = 0', why: '$a = -16$, $b = 40$, $c = -25$. $4 \\cdot 16 \\cdot 25 = 1600$, and two negatives make $4(-16)(-25)$ positive, so it is subtracted.' },
        { text: 'Interpret the zero.', tex: 't = \\frac{-40}{2(-16)} = \\frac{-40}{-32} = 1.25', why: 'One solution means the ball reaches $30$ feet at exactly one moment: the very top of its path. Check: $-16(1.5625) + 50 + 5 = -25 + 55 = 30$.' },
        { text: 'Repeat for $35$ feet.', tex: '-16t^2 + 40t - 30 = 0: \\quad 40^2 - 4(-16)(-30) = 1600 - 1920 = -320', why: 'A negative discriminant means no real time $t$ works.' },
        { text: 'Answer the question.', why: 'The ball just reaches $30$ feet (its maximum height) at $1.25$ seconds, and it never reaches $35$ feet.' },
      ],
      answer: 'Yes, it reaches 30 feet exactly once, at $t = 1.25$ s (its highest point). It never reaches 35 feet.',
    },
    {
      title: 'Rearrange, simplify and reduce',
      kind: 'challenging',
      problem: [{ t: 'p', text: 'Solve $2x^2 + 1 = 6x$. Give exact answers in simplest form and answers rounded to the nearest hundredth.' }],
      steps: [
        { text: 'Write standard form.', tex: '2x^2 - 6x + 1 = 0 \\quad\\Longrightarrow\\quad a = 2, \\; b = -6, \\; c = 1', why: 'Subtract $6x$ from both sides.' },
        { text: 'Find the discriminant.', tex: '(-6)^2 - 4(2)(1) = 36 - 8 = 28', why: 'Positive, so two real solutions. Not a perfect square, so they involve a radical.' },
        { text: 'Substitute and simplify the radical.', tex: 'x = \\frac{6 \\pm \\sqrt{28}}{4} = \\frac{6 \\pm 2\\sqrt{7}}{4}', why: '$\\sqrt{28} = \\sqrt{4} \\cdot \\sqrt{7} = 2\\sqrt{7}$, and $2a = 4$.' },
        { text: 'Reduce the fraction.', tex: 'x = \\frac{2(3 \\pm \\sqrt{7})}{4} = \\frac{3 \\pm \\sqrt{7}}{2}', why: 'Every term on top ($6$ and $2\\sqrt{7}$) has a factor of $2$, so you may divide the top and bottom by $2$.' },
        { text: 'Round.', tex: '\\frac{3 + 2.6458}{2} \\approx 2.82, \\quad \\frac{3 - 2.6458}{2} \\approx 0.18', why: '$\\sqrt{7} \\approx 2.6458$.' },
        { text: 'Check exactly.', tex: 'x = \\tfrac{3 + \\sqrt{7}}{2}: \\quad 2x^2 + 1 = (8 + 3\\sqrt{7}) + 1 = 9 + 3\\sqrt{7} = 6x', why: '$x^2 = \\frac{9 + 6\\sqrt{7} + 7}{4} = \\frac{16 + 6\\sqrt{7}}{4}$, so $2x^2 = 8 + 3\\sqrt{7}$. And $6x = 3(3 + \\sqrt{7}) = 9 + 3\\sqrt{7}$.' },
      ],
      answer: '$x = \\frac{3 \\pm \\sqrt{7}}{2}$, about $x \\approx 2.82$ or $x \\approx 0.18$',
    },
  ],
  teachMeAgain: [
    {
      approach: 'visual',
      title: 'See the discriminant on a graph',
      blocks: [
        { t: 'p', text: 'The solutions of $ax^2 + bx + c = 0$ are where $y = ax^2 + bx + c$ meets the $x$-axis. Here is $y = x^2 - 6x + 4$, with discriminant $36 - 16 = 20$.' },
        {
          t: 'graph',
          caption: 'The parabola y equals x squared minus 6x plus 4 crosses the x-axis near 0.76 and 5.24.',
          spec: {
            xMin: -1,
            xMax: 7,
            yMin: -6,
            yMax: 6,
            functions: [{ expr: 'x^2 - 6x + 4', label: 'y = x^2 - 6x + 4' }],
            points: [
              { x: 0.76, y: 0, label: 'about 0.76' },
              { x: 5.24, y: 0, label: 'about 5.24' },
              { x: 3, y: -5, label: 'vertex (3, -5)' },
            ],
            ariaLabel: 'An upward parabola with vertex (3, -5) crossing the x-axis at about 0.76 and about 5.24.',
          },
        },
        { t: 'p', text: 'The discriminant $20$ is positive, and the graph crosses twice, at $x = 3 \\pm \\sqrt{5} \\approx 0.76$ and $5.24$. The two crossings sit the same distance, $\\sqrt{5} \\approx 2.24$, on each side of the vertex $x = 3$. The $\\pm$ in the formula is that "same distance each side."' },
      ],
    },
    {
      approach: 'simpler-example',
      title: 'Try it where you already know the answer',
      blocks: [
        { t: 'p', text: 'You know $x^2 - 9 = 0$ has solutions $x = \\pm 3$. Use the formula with $a = 1$, $b = 0$, $c = -9$:' },
        { t: 'math', tex: 'x = \\frac{-0 \\pm \\sqrt{0^2 - 4(1)(-9)}}{2(1)} = \\frac{\\pm\\sqrt{36}}{2} = \\frac{\\pm 6}{2} = \\pm 3' },
        { t: 'p', text: 'Same answer. The formula agrees with the methods you already trust. Now it can handle the equations those methods cannot.' },
      ],
    },
    {
      approach: 'analogy',
      title: 'A recipe that always works',
      blocks: [
        { t: 'p', text: 'The quadratic formula is like a recipe. Factoring is a shortcut that only works if you happen to have the right ingredients; the recipe works every time, as long as you measure carefully.' },
        { t: 'p', text: 'The ingredients are $a$, $b$ and $c$, and they must come from standard form, like reading a recipe written in the right units. Measure the signs carefully: a wrong sign is like using salt instead of sugar.' },
        { t: 'p', text: 'The discriminant is like tasting before you serve: one quick calculation, $b^2 - 4ac$, tells you if you will get two dishes, one, or none.' },
      ],
    },
    {
      approach: 'prerequisite',
      title: 'Refresher: negatives and radicals',
      blocks: [
        { t: 'list', items: [
          'Squaring a negative: $(-5)^2 = 25$. On a calculator, type the parentheses.',
          'Opposite of a negative: $-(-5) = 5$.',
          'Multiplying signs: $-4(3)(-2) = 24$, because two negatives make a positive.',
          'Simplifying a root: $\\sqrt{48} = \\sqrt{16} \\cdot \\sqrt{3} = 4\\sqrt{3}$.',
          'Reducing: $\\frac{8 \\pm 4\\sqrt{3}}{4} = 2 \\pm \\sqrt{3}$, because both $8$ and $4\\sqrt{3}$ divide by $4$.',
        ] },
      ],
    },
    {
      approach: 'step-by-step',
      title: 'A 5-step checklist',
      blocks: [
        { t: 'p', text: 'Solve $x^2 + 4x = 1$.' },
        { t: 'list', ordered: true, items: [
          '**Standard form:** $x^2 + 4x - 1 = 0$.',
          '**List a, b, c with signs:** $a = 1$, $b = 4$, $c = -1$.',
          '**Discriminant:** $4^2 - 4(1)(-1) = 16 + 4 = 20$. Positive, so two real solutions.',
          '**Formula:** $x = \\frac{-4 \\pm \\sqrt{20}}{2} = \\frac{-4 \\pm 2\\sqrt{5}}{2}$.',
          '**Simplify:** divide each term by $2$: $x = -2 \\pm \\sqrt{5}$, about $0.24$ and $-4.24$.',
        ] },
      ],
    },
    {
      approach: 'alternate-strategy',
      title: 'Complete the square instead',
      blocks: [
        { t: 'p', text: 'Solve $x^2 - 6x + 4 = 0$ by completing the square, and compare with the formula.' },
        { t: 'math', tex: 'x^2 - 6x = -4 \\;\\Longrightarrow\\; x^2 - 6x + 9 = 5 \\;\\Longrightarrow\\; (x - 3)^2 = 5 \\;\\Longrightarrow\\; x = 3 \\pm \\sqrt{5}' },
        { t: 'p', text: 'The formula gave $x = \\frac{6 \\pm 2\\sqrt{5}}{2} = 3 \\pm \\sqrt{5}$, the same answer. That is no accident: the formula **is** completing the square, worked out once in general. When $a = 1$ and $b$ is even, completing the square can be quicker.' },
      ],
    },
  ],
  guided: [
    { generator: 'u4.quadratic-formula', difficulty: 1 },
    { generator: 'u4.discriminant', difficulty: 1 },
    { generator: 'u4.quadratic-formula', difficulty: 1 },
    { generator: 'u4.discriminant', difficulty: 1 },
  ],
  independent: {
    count: 8,
    reviewCount: 2,
    mix: [
      { generator: 'u4.quadratic-formula', difficulty: 1, weight: 1 },
      { generator: 'u4.quadratic-formula', difficulty: 2, weight: 2 },
      { generator: 'u4.quadratic-formula', difficulty: 3, weight: 2 },
      { generator: 'u4.discriminant', difficulty: 1, weight: 1 },
      { generator: 'u4.discriminant', difficulty: 2, weight: 1 },
      { generator: 'u4.discriminant', difficulty: 3, weight: 1 },
    ],
  },
  quiz: {
    items: [
      { generator: 'u4.quadratic-formula', difficulty: 2 },
      { generator: 'u4.quadratic-formula', difficulty: 2 },
      { generator: 'u4.quadratic-formula', difficulty: 3 },
      { generator: 'u4.quadratic-formula', difficulty: 3 },
      { generator: 'u4.discriminant', difficulty: 2 },
      { generator: 'u4.discriminant', difficulty: 3 },
    ],
  },
  summary: [
    'Write the equation in standard form $ax^2 + bx + c = 0$ first, then read $a$, $b$ and $c$ with their signs.',
    'The quadratic formula $x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$ solves every quadratic equation. Use parentheses for negatives: $(-3)^2 = 9$.',
    'Simplify the radical, then divide **every** term on top: $\\frac{6 \\pm 2\\sqrt{5}}{2} = 3 \\pm \\sqrt{5}$.',
    'The discriminant $b^2 - 4ac$ counts real solutions and $x$-intercepts: positive means two, zero means one, negative means none.',
  ],
  mastery: { quizPassScore: 0.8, practiceMinCorrect: 5 },
};
