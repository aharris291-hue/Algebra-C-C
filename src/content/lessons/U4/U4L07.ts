import type { LessonContent } from '../../../core/curriculum/types';

/**
 * U4L07 Solving Quadratics with Square Roots (A.PAR.6.3, A.NR.5.1)
 * Isolate the square, take the square root of both sides with plus-or-minus, solve a(x - h)^2 = k,
 * give exact radical and decimal answers, and recognize no real solution when a square equals a negative (S4.10).
 *
 * Math verified by hand (2026-10-06): every solution below was substituted back into its equation, every radical was simplified twice, and every rounded decimal was recomputed independently.
 */
export const U4L07: LessonContent = {
  lessonId: 'U4L07',
  goal: 'Solve quadratic equations like $3x^2 = 60$ and $2(x - 3)^2 = 50$ by taking square roots, give **both** solutions in exact form (like $x = \\pm 2\\sqrt{5}$) and as decimals, and recognize when there is no real solution.',
  needToKnow: [
    { t: 'p', text: 'This lesson builds on three things you already know:' },
    {
      t: 'list',
      items: [
        '**Square roots of perfect squares.** $\\sqrt{49} = 7$ because $7 \\cdot 7 = 49$.',
        '**Simplest radical form.** Pull out the largest perfect square: $\\sqrt{20} = \\sqrt{4} \\cdot \\sqrt{5} = 2\\sqrt{5}$.',
        '**Undoing operations.** To solve $2y + 3 = 13$, subtract $3$, then divide by $2$. Undo the outside operations first.',
      ],
    },
    { t: 'callout', variant: 'tip', title: 'Quick check', text: 'Simplify $\\sqrt{48}$. (You should get $4\\sqrt{3}$, since $48 = 16 \\cdot 3$.) If that felt shaky, open **Teach Me Again** and choose the refresher.' },
  ],
  vocabulary: [
    { term: 'square root property', meaning: 'If $x^2 = k$ and $k > 0$, then $x = \\sqrt{k}$ or $x = -\\sqrt{k}$, written $x = \\pm\\sqrt{k}$.' },
    { term: 'plus or minus', meaning: 'The symbol $\\pm$. It packs two answers into one line: $x = \\pm 5$ means $x = 5$ or $x = -5$.' },
    { term: 'isolate the square', meaning: 'Get the squared part, like $x^2$ or $(x - 3)^2$, alone on one side before taking the square root.' },
    { term: 'exact answer', meaning: 'An answer with no rounding, like $2\\sqrt{5}$ or $-1 + 2\\sqrt{3}$.' },
    { term: 'approximate answer', meaning: 'A rounded decimal, like $2\\sqrt{5} \\approx 4.47$. Good for measuring, but not exact.' },
    { term: 'no real solution', meaning: 'No real number makes the equation true. This happens when a square must equal a negative number.' },
  ],
  instruction: [
    { t: 'p', text: '### Why there are two answers' },
    { t: 'p', text: 'Solve $x^2 = 49$. You know $7^2 = 49$. But also $(-7)^2 = (-7)(-7) = 49$. Both numbers work, so the equation has **two** solutions:' },
    { t: 'math', tex: 'x^2 = 49 \\quad\\Longrightarrow\\quad x = \\pm\\sqrt{49} = \\pm 7' },
    { t: 'p', text: 'The symbol $\\sqrt{49}$ by itself means only the positive root, $7$. When **you** take the square root of both sides of an equation, you must add the $\\pm$ yourself, because the negative number squares to the same value.' },
    { t: 'p', text: '### The square root property' },
    {
      t: 'table',
      caption: 'How many real solutions x squared equals k has, depending on the sign of k.',
      headers: ['If the square equals...', 'Solutions', 'Example'],
      rows: [
        ['a positive number $k$', 'two: $x = \\pm\\sqrt{k}$', '$x^2 = 9$ gives $x = \\pm 3$'],
        ['zero', 'one: $x = 0$', '$x^2 = 0$ gives $x = 0$'],
        ['a negative number', 'no real solution', '$x^2 = -4$ has none'],
      ],
    },
    { t: 'p', text: 'You can see all three cases on a graph. The solutions of $x^2 = k$ are the $x$-values where the parabola $y = x^2$ meets the horizontal line $y = k$.' },
    {
      t: 'graph',
      caption: 'The parabola y equals x squared meets y equals 9 twice, touches y equals 0 once, and never meets y equals negative 4.',
      spec: {
        xMin: -5,
        xMax: 5,
        yMin: -6,
        yMax: 12,
        yStep: 2,
        functions: [
          { expr: 'x^2', label: 'y = x^2' },
          { expr: '9', dashed: true, label: 'y = 9' },
          { expr: '-4', dashed: true, label: 'y = -4' },
        ],
        points: [
          { x: -3, y: 9, label: '(-3, 9)' },
          { x: 3, y: 9, label: '(3, 9)' },
          { x: 0, y: 0, label: '(0, 0)' },
        ],
        ariaLabel: 'The parabola y equals x squared with its lowest point at the origin. The dashed line y equals 9 crosses it at (-3, 9) and (3, 9). The dashed line y equals -4 lies below the parabola and never meets it.',
      },
    },
    { t: 'callout', variant: 'why', title: 'Why can a square never be negative?', text: 'A positive times a positive is positive, and a negative times a negative is also positive. Zero times zero is zero. So every real number squared is $0$ or more. An equation like $x^2 = -4$ asks for something impossible, so it has **no real solution**.' },
    { t: 'p', text: '### Step 1: isolate the square' },
    { t: 'p', text: 'Before you take a square root, get the squared part alone. Undo adding and subtracting first, then multiplying and dividing:' },
    { t: 'math', tex: '3x^2 = 60 \\;\\Longrightarrow\\; x^2 = 20 \\;\\Longrightarrow\\; x = \\pm\\sqrt{20} = \\pm 2\\sqrt{5} \\approx \\pm 4.47' },
    { t: 'p', text: 'The exact answer is $x = \\pm 2\\sqrt{5}$. The approximate answer is $x \\approx 4.47$ or $x \\approx -4.47$. Give the exact form unless a problem asks you to round.' },
    { t: 'p', text: '### Squared binomials: a(x - h)² = k' },
    { t: 'p', text: 'The same idea works when a whole binomial is squared. Treat $(x - 3)$ as one block:' },
    { t: 'math', tex: '2(x - 3)^2 = 50 \\;\\Longrightarrow\\; (x - 3)^2 = 25 \\;\\Longrightarrow\\; x - 3 = \\pm 5' },
    { t: 'p', text: 'Now split the $\\pm$ into two simple equations: $x - 3 = 5$ gives $x = 8$, and $x - 3 = -5$ gives $x = -2$. Check: $2(8 - 3)^2 = 2(25) = 50$ and $2(-2 - 3)^2 = 2(25) = 50$.' },
    { t: 'p', text: 'When the root is not a whole number, keep the $\\pm$ in the answer:' },
    { t: 'math', tex: '(x + 1)^2 = 12 \\;\\Longrightarrow\\; x + 1 = \\pm 2\\sqrt{3} \\;\\Longrightarrow\\; x = -1 \\pm 2\\sqrt{3}' },
    { t: 'p', text: 'As decimals, $2\\sqrt{3} \\approx 3.464$, so $x \\approx -1 + 3.464 = 2.46$ or $x \\approx -1 - 3.464 = -4.46$.' },
    { t: 'callout', variant: 'warning', title: 'Two traps', text: '**Forgetting the minus.** $(x - 2)^2 = 16$ has two solutions, $x = 6$ **and** $x = -2$. Writing only $x - 2 = 4$ loses one. **Rooting term by term.** In $x^2 + 9 = 25$ you may **not** take the root of each term to get $x + 3 = 5$. Subtract first: $x^2 = 16$, so $x = \\pm 4$.' },
    { t: 'callout', variant: 'tip', title: 'When does this method work?', text: 'Taking square roots works when the variable appears **only inside one squared part**, as in $5x^2 - 7 = 13$ or $4(x + 1)^2 = 48$. If there is also a separate $x$ term, as in $x^2 + 6x = 7$, you need another method (factoring, completing the square, or the quadratic formula).' },
    { t: 'callout', variant: 'realworld', title: 'Where this shows up', text: 'A dropped object falls about $16t^2$ feet in $t$ seconds, so "when does it fall $80$ feet?" means solving $16t^2 = 80$. The side of a square with area $A$ solves $s^2 = A$. In real situations you often keep only the positive root, because time and length cannot be negative.' },
  ],
  examples: [
    {
      title: 'Isolate, then take the root',
      kind: 'introductory',
      problem: [{ t: 'p', text: 'Solve $x^2 - 3 = 22$.' }],
      steps: [
        { text: 'Add $3$ to both sides to isolate $x^2$.', tex: 'x^2 = 25', why: 'The square root must be taken of the squared part **alone**, so undo the subtraction first.' },
        { text: 'Take the square root of both sides, with $\\pm$.', tex: 'x = \\pm\\sqrt{25} = \\pm 5', why: 'Both $5^2$ and $(-5)^2$ equal $25$.' },
        { text: 'Check both answers.', tex: '5^2 - 3 = 22, \\quad (-5)^2 - 3 = 25 - 3 = 22', why: 'Substituting each solution back in is the surest way to know it is right.' },
      ],
      answer: '$x = 5$ or $x = -5$ (written $x = \\pm 5$)',
    },
    {
      title: 'An answer in radical form',
      kind: 'intermediate',
      problem: [{ t: 'p', text: 'Solve $3x^2 = 60$. Give exact answers and answers rounded to the nearest hundredth.' }],
      steps: [
        { text: 'Divide both sides by $3$.', tex: 'x^2 = 20', why: '$3x^2$ means $3$ times $x^2$; dividing by $3$ isolates the square.' },
        { text: 'Take the square root of both sides, with $\\pm$.', tex: 'x = \\pm\\sqrt{20}', why: 'Both the positive and negative roots square to $20$.' },
        { text: 'Simplify the radical.', tex: '\\sqrt{20} = \\sqrt{4} \\cdot \\sqrt{5} = 2\\sqrt{5}', why: '$4$ is the largest perfect square that divides $20$.' },
        { text: 'Estimate.', tex: '2\\sqrt{5} \\approx 2(2.2361) = 4.4721 \\approx 4.47', why: '$16 < 20 < 25$, so $\\sqrt{20}$ is between $4$ and $5$. The decimal $4.47$ fits.' },
        { text: 'Check the exact answer.', tex: '3(2\\sqrt{5})^2 = 3(4 \\cdot 5) = 3(20) = 60', why: '$(2\\sqrt{5})^2 = 2^2 \\cdot (\\sqrt{5})^2 = 4 \\cdot 5$. The negative root gives the same square.' },
      ],
      answer: '$x = \\pm 2\\sqrt{5}$, about $x \\approx 4.47$ or $x \\approx -4.47$',
    },
    {
      title: 'A squared binomial with a coefficient',
      kind: 'intermediate',
      problem: [{ t: 'p', text: 'Solve $4(x + 1)^2 = 48$. Give exact answers and answers rounded to the nearest hundredth.' }],
      steps: [
        { text: 'Divide both sides by $4$.', tex: '(x + 1)^2 = 12', why: 'Isolate the squared binomial before taking a root.' },
        { text: 'Take the square root of both sides, with $\\pm$.', tex: 'x + 1 = \\pm\\sqrt{12} = \\pm 2\\sqrt{3}', why: '$\\sqrt{12} = \\sqrt{4} \\cdot \\sqrt{3} = 2\\sqrt{3}$, and both signs square to $12$.' },
        { text: 'Subtract $1$ from both sides.', tex: 'x = -1 \\pm 2\\sqrt{3}', why: 'This undoes the $+1$ inside the binomial. Both solutions shift by the same amount.' },
        { text: 'Write each decimal.', tex: '-1 + 3.4641 \\approx 2.46, \\quad -1 - 3.4641 \\approx -4.46', why: '$2\\sqrt{3} \\approx 2(1.7321) = 3.4641$.' },
        { text: 'Check one solution exactly.', tex: '4\\big((-1 + 2\\sqrt{3}) + 1\\big)^2 = 4(2\\sqrt{3})^2 = 4(12) = 48', why: 'The $-1$ and $+1$ cancel, leaving $(2\\sqrt{3})^2 = 4 \\cdot 3 = 12$.' },
      ],
      answer: '$x = -1 \\pm 2\\sqrt{3}$, about $x \\approx 2.46$ or $x \\approx -4.46$',
    },
    {
      title: 'A common mistake: losing the negative root',
      kind: 'common-mistake',
      problem: [{ t: 'p', text: 'A student solves $(x - 5)^2 = 36$ like this: "$x - 5 = 6$, so $x = 11$." What is missing? Find every solution.' }],
      steps: [
        { text: 'Spot the error.', why: 'The student took only the positive square root. But $(-6)^2 = 36$ too, so $x - 5$ could be $-6$.' },
        { text: 'Take the square root with $\\pm$.', tex: 'x - 5 = \\pm 6', why: 'The square root property always gives two cases when the square equals a positive number.' },
        { text: 'Solve each case.', tex: 'x - 5 = 6 \\Rightarrow x = 11 \\qquad x - 5 = -6 \\Rightarrow x = -1', why: 'Add $5$ to both sides of each equation.' },
        { text: 'Check the solution the student missed.', tex: '(-1 - 5)^2 = (-6)^2 = 36', why: '$x = -1$ really works, so leaving it out gives an incomplete answer.' },
      ],
      answer: '$x = 11$ or $x = -1$. The student lost $x = -1$ by skipping the $\\pm$.',
    },
    {
      title: 'How long does a dropped phone fall?',
      kind: 'real-world',
      problem: [{ t: 'p', text: 'A phone slips off a ledge 80 feet above the ground. It falls $16t^2$ feet in $t$ seconds, so it hits the ground when $16t^2 = 80$. How long does it fall? Give the exact time and the time to the nearest hundredth of a second.' }],
      steps: [
        { text: 'Divide both sides by $16$.', tex: 't^2 = 5', why: '$80 \\div 16 = 5$. Now the square is alone.' },
        { text: 'Take the square root, with $\\pm$.', tex: 't = \\pm\\sqrt{5}', why: 'Algebra gives both roots first. Then the situation decides which ones make sense.' },
        { text: 'Keep only the root that fits the situation.', tex: 't = \\sqrt{5}', why: 'Time after the phone is dropped cannot be negative, so $t = -\\sqrt{5}$ does not fit.' },
        { text: 'Round.', tex: '\\sqrt{5} \\approx 2.2361 \\approx 2.24', why: '$4 < 5 < 9$, so $\\sqrt{5}$ is between $2$ and $3$, a little more than $2$.' },
        { text: 'Check.', tex: '16(\\sqrt{5})^2 = 16 \\cdot 5 = 80', why: 'The phone falls exactly $80$ feet in $\\sqrt{5}$ seconds.' },
      ],
      answer: 'Exactly $\\sqrt{5}$ seconds, about $2.24$ seconds.',
    },
    {
      title: 'When a square equals a negative',
      kind: 'challenging',
      problem: [{ t: 'p', text: 'Solve $5 - 3(x + 2)^2 = 17$.' }],
      steps: [
        { text: 'Subtract $5$ from both sides.', tex: '-3(x + 2)^2 = 12', why: 'Undo the addition first. The $5$ is not part of the squared term.' },
        { text: 'Divide both sides by $-3$.', tex: '(x + 2)^2 = -4', why: 'Dividing $12$ by a negative number gives a negative: $12 \\div (-3) = -4$.' },
        { text: 'Decide whether a real number works.', why: 'A square is never negative, so no real value of $x + 2$ squares to $-4$. Do not write $x + 2 = \\pm 2$: $2^2$ is $4$, not $-4$.' },
        { text: 'Confirm another way.', why: 'The left side $5 - 3(x + 2)^2$ is $5$ minus something that is never negative, so it is at most $5$. It can never equal $17$.' },
      ],
      answer: 'No real solution.',
    },
  ],
  teachMeAgain: [
    {
      approach: 'visual',
      title: 'Where the parabola meets the line',
      blocks: [
        { t: 'p', text: 'Solving $(x - 2)^2 = 16$ is the same as asking: where does the graph of $y = (x - 2)^2$ reach a height of $16$?' },
        {
          t: 'graph',
          caption: 'The parabola y equals x minus 2 squared meets the line y equals 16 at x equals negative 2 and x equals 6.',
          spec: {
            xMin: -4,
            xMax: 8,
            yMin: -2,
            yMax: 20,
            yStep: 2,
            functions: [
              { expr: '(x-2)^2', label: 'y = (x - 2)^2' },
              { expr: '16', dashed: true, label: 'y = 16' },
            ],
            points: [
              { x: -2, y: 16, label: '(-2, 16)' },
              { x: 6, y: 16, label: '(6, 16)' },
            ],
            ariaLabel: 'A parabola with its lowest point at (2, 0). A dashed horizontal line at height 16 crosses it at (-2, 16) and (6, 16).',
          },
        },
        { t: 'p', text: 'The parabola is symmetric about $x = 2$, so the two crossings are the same distance from $2$: four steps left ($x = -2$) and four steps right ($x = 6$). That distance, $4$, is $\\sqrt{16}$. The $\\pm$ is the two sides of the parabola.' },
      ],
    },
    {
      approach: 'simpler-example',
      title: 'Start with the plain square',
      blocks: [
        { t: 'list', items: [
          '$x^2 = 25$: which numbers squared give $25$? Both $5$ and $-5$. So $x = \\pm 5$.',
          '$x^2 = 7$: no whole number works, so leave it as a root: $x = \\pm\\sqrt{7} \\approx \\pm 2.65$.',
          '$x^2 = 0$: only $0$ works, so there is one solution, $x = 0$.',
          '$x^2 = -9$: no real number squared is negative, so there is no real solution.',
          '$(x - 1)^2 = 4$: the block $x - 1$ is $2$ or $-2$, so $x = 3$ or $x = -1$.',
        ] },
        { t: 'p', text: 'Every harder problem in this lesson turns into one of these after you isolate the square.' },
      ],
    },
    {
      approach: 'analogy',
      title: 'Unwrapping a present',
      blocks: [
        { t: 'p', text: 'Think of $2(x - 3)^2 + 1 = 51$ as a present. The variable $x$ is the gift in the middle. It was wrapped in this order: subtract $3$, square, multiply by $2$, add $1$.' },
        { t: 'p', text: 'To unwrap it, peel the layers off in **reverse** order: subtract $1$ (giving $2(x - 3)^2 = 50$), divide by $2$ (giving $(x - 3)^2 = 25$), take the square root ($x - 3 = \\pm 5$), and add $3$ ($x = 8$ or $x = -2$).' },
        { t: 'p', text: 'The square root layer is special: the box could have held either a positive or a negative number, so it opens two ways. That is why you get two gifts, $8$ and $-2$.' },
      ],
    },
    {
      approach: 'prerequisite',
      title: 'Refresher: roots and simplest radical form',
      blocks: [
        { t: 'list', items: [
          'Perfect squares to know: $1, 4, 9, 16, 25, 36, 49, 64, 81, 100, 121, 144$.',
          'To simplify a root, pull out the largest perfect square: $\\sqrt{18} = \\sqrt{9} \\cdot \\sqrt{2} = 3\\sqrt{2}$, and $\\sqrt{75} = \\sqrt{25} \\cdot \\sqrt{3} = 5\\sqrt{3}$.',
          'A root squared gives back the radicand: $(\\sqrt{5})^2 = 5$, and $(3\\sqrt{2})^2 = 9 \\cdot 2 = 18$.',
          'A negative squared is positive: $(-4)^2 = 16$. That is where the second solution comes from.',
        ] },
        { t: 'p', text: 'So $x^2 = 18$ gives $x = \\pm\\sqrt{18} = \\pm 3\\sqrt{2}$.' },
      ],
    },
    {
      approach: 'step-by-step',
      title: 'A 5-step checklist',
      blocks: [
        { t: 'p', text: 'Solve $\\frac{1}{2}(x - 4)^2 = 9$.' },
        { t: 'list', ordered: true, items: [
          '**Isolate the square.** Multiply both sides by $2$: $(x - 4)^2 = 18$.',
          '**Check the sign.** $18$ is positive, so there are two real solutions. (Negative would mean no real solution; zero would mean one.)',
          '**Take the root with $\\pm$.** $x - 4 = \\pm\\sqrt{18} = \\pm 3\\sqrt{2}$.',
          '**Finish solving.** Add $4$: $x = 4 \\pm 3\\sqrt{2}$.',
          '**Decimals and check.** $3\\sqrt{2} \\approx 4.243$, so $x \\approx 8.24$ or $x \\approx -0.24$. Check: $\\frac{1}{2}(3\\sqrt{2})^2 = \\frac{1}{2}(18) = 9$.',
        ] },
      ],
    },
    {
      approach: 'alternate-strategy',
      title: 'Check it by factoring',
      blocks: [
        { t: 'p', text: 'When the number is a perfect square, you can also solve by factoring a difference of squares, and you get the same two answers.' },
        { t: 'math', tex: 'x^2 = 49 \\;\\Longrightarrow\\; x^2 - 49 = 0 \\;\\Longrightarrow\\; (x - 7)(x + 7) = 0' },
        { t: 'p', text: 'By the zero product property, $x - 7 = 0$ or $x + 7 = 0$, so $x = 7$ or $x = -7$. Factoring makes it clear why there are **two** solutions: there are two factors.' },
        { t: 'p', text: 'The square root method is faster, and it also handles numbers that are not perfect squares, like $x^2 = 20$, where factoring over the integers does not work.' },
      ],
    },
  ],
  guided: [
    { generator: 'u4.solve-sqrt', difficulty: 1 },
    { generator: 'u4.solve-sqrt', difficulty: 1 },
    { generator: 'u4.solve-sqrt', difficulty: 1 },
    { generator: 'u4.solve-sqrt', difficulty: 1 },
  ],
  independent: {
    count: 8,
    reviewCount: 2,
    mix: [
      { generator: 'u4.solve-sqrt', difficulty: 1, weight: 1 },
      { generator: 'u4.solve-sqrt', difficulty: 2, weight: 2 },
      { generator: 'u4.solve-sqrt', difficulty: 3, weight: 1 },
    ],
  },
  quiz: {
    items: [
      { generator: 'u4.solve-sqrt', difficulty: 2 },
      { generator: 'u4.solve-sqrt', difficulty: 2 },
      { generator: 'u4.solve-sqrt', difficulty: 2 },
      { generator: 'u4.solve-sqrt', difficulty: 3 },
      { generator: 'u4.solve-sqrt', difficulty: 3 },
      { generator: 'u4.solve-sqrt', difficulty: 3 },
    ],
  },
  summary: [
    'Isolate the square first, then take the square root of both sides: $3x^2 = 60$ becomes $x^2 = 20$.',
    'Always include $\\pm$: $x^2 = 20$ gives $x = \\pm 2\\sqrt{5}$, and $(x - 5)^2 = 36$ gives $x = 11$ or $x = -1$.',
    'Give exact answers in simplest radical form, and round only when asked: $x = -1 \\pm 2\\sqrt{3} \\approx 2.46$ or $-4.46$.',
    'If the square equals a negative number, like $(x + 2)^2 = -4$, there is no real solution. If it equals $0$, there is exactly one.',
  ],
  mastery: { quizPassScore: 0.8, practiceMinCorrect: 5 },
};
