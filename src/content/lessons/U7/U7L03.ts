import type { LessonContent } from '../../../core/curriculum/types';

/**
 * U7L03 Standard Deviation (A.DSR.10.1)
 * Deviations from the mean (value - mean) and why they always add to 0; the population standard deviation
 * sigma = sqrt( sum of (x - mean)^2 / n ) (divide by n) with a deviations table; interpreting sigma as a typical
 * distance of the values from the mean, in the units of the data; comparing spreads from dot plots without
 * computing; getting sigma-x from Desmos (stdevp) or a graphing calculator (1-Var Stats), and that Sx (divide by
 * n - 1, Desmos stdev) is a different value used for samples in later courses; the interval within one standard
 * deviation of the mean; adding a constant to every value moves the mean but does not change sigma (S7.03).
 * Reviews mean and median (S7.01).
 *
 * Math verified by hand (2026-10-07): every mean, deviation, squared deviation, sum, quotient and square root was
 * recomputed (2, 4, 4, 4, 5, 5, 7, 9: mean 5, deviations -3, -1, -1, -1, 0, 0, 2, 4 adding to 0, squares 9, 1, 1, 1,
 * 0, 0, 4, 16 summing to 32, 32/8 = 4, sigma = 2; 70, 75, 80, 85, 90: mean 80, squares 100, 25, 0, 25, 100 = 250,
 * 250/5 = 50, sigma = 7.07 -> 7.1, Sx = sqrt(250/4) = 7.91 -> 7.9; players 8, 9, 10, 10, 11, 12 and 4, 6, 10, 10, 14,
 * 16: both mean 10, sums of squares 10 and 104, sigma = sqrt(10/6) = 1.29 and sqrt(104/6) = 4.16; 2, 2, 8, 8:
 * mean 5, sigma 3; 45, 30, 60, 90, 30, 75, 50, 40: mean 52.5, sum of squares 3200, sigma = sqrt(400) = 20,
 * Sx = sqrt(3200/7) = 21.38; streaming mean 70 and sigma 8: [62, 78], and after +5: mean 75, sigma 8, [67, 83];
 * 4, 6, 8: mean 6, sigma sqrt(8/3) = 1.63, and 14, 16, 18: mean 16, same sigma), and every dot plot value lies
 * inside its axis.
 */
export const U7L03: LessonContent = {
  lessonId: 'U7L03',
  goal: 'Calculate the standard deviation of a small data set with a deviations table (for $2, 4, 4, 4, 5, 5, 7, 9$ it is $2$), get it from technology as $\\sigma_x$, and interpret it as a typical distance of the values from the mean.',
  needToKnow: [
    { t: 'p', text: 'Standard deviation is built from the mean and a few calculator skills you already have:' },
    {
      t: 'list',
      items: [
        '**The mean (Lesson 1).** Sum $\\div$ count: $2, 4, 4, 4, 5, 5, 7, 9$ has mean $\\frac{40}{8} = 5$.',
        '**Squaring a negative.** $(-3)^2 = 9$, but $-3^2 = -9$. Use parentheses: a squared number is never negative.',
        '**Square roots.** $\\sqrt{4} = 2$ and $\\sqrt{50} \\approx 7.07$, because $7.07^2 \\approx 50$.',
      ],
    },
    { t: 'callout', variant: 'tip', title: 'Quick check', text: 'Find the mean of $70, 75, 80, 85, 90$, then find $(-10)^2$ and $\\sqrt{50}$ to the nearest tenth. (You should get $80$, $100$ and $7.1$.) If that felt shaky, open **Teach Me Again** and choose the refresher.' },
  ],
  vocabulary: [
    { term: 'deviation', meaning: 'How far a value is from the mean, with a sign: value $-$ mean. Positive above the mean, negative below.' },
    { term: 'standard deviation ($\\sigma$)', meaning: 'A typical distance of the values from the mean: $\\sigma = \\sqrt{\\frac{\\sum (x - \\bar{x})^2}{n}}$. Bigger means more spread out.' },
    { term: '$\\sum$ (sigma, capital)', meaning: '"Add them all up." $\\sum (x - \\bar{x})^2$ means square every deviation, then add.' },
    { term: '$\\sigma_x$ and $S_x$', meaning: 'What a calculator shows. $\\sigma_x$ divides by $n$ and is the one we use. $S_x$ divides by $n - 1$; it is used for samples in later courses.' },
  ],
  instruction: [
    { t: 'p', text: '### Measuring spread from the mean' },
    { t: 'p', text: 'Two basketball players both average $10$ points a game over $6$ games. Are they the same kind of player?' },
    {
      t: 'dataplot',
      caption: 'Player A: 8, 9, 10, 10, 11, 12.',
      spec: { kind: 'dot', min: 0, max: 20, step: 2, axisLabel: 'Player A points per game', values: [8, 9, 10, 10, 11, 12], ariaLabel: 'Dot plot of 8, 9, 10, 10, 11 and 12, all close to 10.' },
    },
    {
      t: 'dataplot',
      caption: 'Player B: 4, 6, 10, 10, 14, 16.',
      spec: { kind: 'dot', min: 0, max: 20, step: 2, axisLabel: 'Player B points per game', values: [4, 6, 10, 10, 14, 16], ariaLabel: 'Dot plot of 4, 6, 10, 10, 14 and 16, spread far from 10.' },
    },
    { t: 'p', text: 'Same mean, but Player A is **consistent** and Player B is **streaky**: B\'s scores are much farther from $10$. The **standard deviation** puts a number on that: roughly, how far is a typical value from the mean?' },
    { t: 'p', text: '### Deviations' },
    { t: 'p', text: 'A **deviation** is value $-$ mean. Here are the hours of video games $8$ friends played last week, with mean $\\bar{x} = 5$:' },
    {
      t: 'table',
      caption: 'The deviations table for 2, 4, 4, 4, 5, 5, 7, 9 (mean 5).',
      headers: ['$x$', '$x - \\bar{x}$', '$(x - \\bar{x})^2$'],
      rows: [
        ['$2$', '$-3$', '$9$'],
        ['$4$', '$-1$', '$1$'],
        ['$4$', '$-1$', '$1$'],
        ['$4$', '$-1$', '$1$'],
        ['$5$', '$0$', '$0$'],
        ['$5$', '$0$', '$0$'],
        ['$7$', '$2$', '$4$'],
        ['$9$', '$4$', '$16$'],
        ['**sum**', '$0$', '$32$'],
      ],
    },
    { t: 'callout', variant: 'why', title: 'Why we square', text: 'The deviations **always** add up to $0$: the mean is the balance point, so the negatives cancel the positives exactly. Averaging them would say every data set has no spread. Squaring makes every deviation positive (and counts big misses more), so they no longer cancel.' },
    { t: 'p', text: '### The formula' },
    { t: 'math', tex: '\\sigma = \\sqrt{\\frac{\\sum (x - \\bar{x})^2}{n}}' },
    { t: 'list', ordered: true, items: [
      'Find the mean $\\bar{x}$.',
      'Find each deviation $x - \\bar{x}$.',
      'Square each deviation.',
      'Add the squares and divide by $n$, the number of values: $\\frac{32}{8} = 4$.',
      'Take the square root: $\\sigma = \\sqrt{4} = 2$.',
    ] },
    { t: 'p', text: 'The square root at the end undoes the squaring, so $\\sigma$ is back in the **units of the data**: $2$ hours.' },
    { t: 'p', text: '### What it means' },
    { t: 'p', text: '**The standard deviation is a typical distance of the values from the mean.** For the gaming hours, the friends typically played about $2$ hours more or less than the mean of $5$ hours. Some were closer (the two $5$s) and some were farther (the $9$), but $2$ hours is a typical gap.' },
    { t: 'p', text: 'For the two players above, $\\sigma_A = \\sqrt{\\frac{10}{6}} \\approx 1.3$ points and $\\sigma_B = \\sqrt{\\frac{104}{6}} \\approx 4.2$ points. B\'s larger standard deviation says B\'s games typically land farther from the $10$-point average. You could have predicted which was larger just by looking: **the more the dots spread away from the mean, the larger $\\sigma$**.' },
    { t: 'p', text: '### Using technology' },
    { t: 'p', text: 'By hand is for small data sets and for understanding. For anything bigger, use technology. With the streaming data $45, 30, 60, 90, 30, 75, 50, 40$ (minutes):' },
    { t: 'list', items: [
      '**Desmos:** type **stdevp([45,30,60,90,30,75,50,40])**. The **p** stands for **population**, which divides by $n$. It shows $20$.',
      '**Graphing calculator:** press STAT, choose EDIT and type the data into L1. Then STAT, CALC, 1-Var Stats. Read the line **$\\sigma x = 20$**.',
    ] },
    { t: 'callout', variant: 'warning', title: 'σx, not Sx', text: 'The calculator also shows $S_x \\approx 21.38$ right above $\\sigma x$, and Desmos **stdev** (no p) gives that same $21.38$. $S_x$ divides by $n - 1$ instead of $n$; it is used when the data is a sample from a bigger group, which you will study in later courses. In this course, always use $\\sigma_x$.' },
    { t: 'p', text: '### Within one standard deviation, and adding a constant' },
    { t: 'p', text: 'Students in a club stream a mean of $70$ minutes a day with $\\sigma = 8$ minutes. Values **within one standard deviation of the mean** are between $70 - 8 = 62$ and $70 + 8 = 78$ minutes: the interval $[62, 78]$. For many data sets, most of the values (often around two thirds) land in this interval.' },
    { t: 'p', text: 'If every student streams $5$ more minutes a day, every value moves up $5$. The mean moves up to $75$, but every value is still the same distance from the mean, so $\\sigma$ **stays $8$**. Adding a constant slides the whole dot plot over without spreading it out.' },
    { t: 'callout', variant: 'realworld', title: 'Where this shows up', text: 'Factories use standard deviation to keep products consistent: a soda machine with a tiny $\\sigma$ fills every bottle almost exactly the same. Coaches use it too: a pitcher whose speeds have a small $\\sigma$ is consistent from pitch to pitch.' },
  ],
  examples: [
    {
      title: 'Standard deviation with a table',
      kind: 'introductory',
      problem: [{ t: 'p', text: 'Four friends charged their phones these numbers of times last week: $2, 2, 8, 8$. Find the standard deviation.' }],
      steps: [
        { text: 'Find the mean.', tex: '\\bar{x} = \\frac{2 + 2 + 8 + 8}{4} = \\frac{20}{4} = 5', why: 'Every deviation is measured from the mean, so it comes first.' },
        { text: 'Find each deviation and square it.', tex: '-3, -3, 3, 3 \\;\\to\\; 9, 9, 9, 9', why: 'Value $-$ mean: $2 - 5 = -3$ and $8 - 5 = 3$. Squaring removes the signs: $(-3)^2 = 9$.' },
        { text: 'Add the squares and divide by $n$.', tex: '\\frac{9 + 9 + 9 + 9}{4} = \\frac{36}{4} = 9', why: 'Divide by $n = 4$, the number of values.' },
        { text: 'Take the square root.', tex: '\\sigma = \\sqrt{9} = 3', why: 'This undoes the squaring and puts the answer back in "charges."' },
      ],
      answer: '$\\sigma = 3$ charges. That makes sense: every value is exactly $3$ away from the mean $5$.',
    },
    {
      title: 'Test scores, to the nearest tenth',
      kind: 'intermediate',
      problem: [{ t: 'p', text: 'Five test scores are $70, 75, 80, 85, 90$. Find the standard deviation to the nearest tenth, and check it with technology.' }],
      steps: [
        { text: 'Find the mean.', tex: '\\bar{x} = \\frac{400}{5} = 80', why: '$70 + 75 + 80 + 85 + 90 = 400$.' },
        { text: 'Deviations and squares.', tex: '-10, -5, 0, 5, 10 \\;\\to\\; 100, 25, 0, 25, 100', why: 'Check: the deviations add to $0$, as they always must.' },
        { text: 'Add, divide by $n$, take the root.', tex: '\\sigma = \\sqrt{\\frac{250}{5}} = \\sqrt{50} \\approx 7.07', why: 'The sum of the squares is $250$ and $n = 5$.' },
        { text: 'Round and check.', tex: '\\sigma \\approx 7.1', why: 'Desmos **stdevp([70,75,80,85,90])** or the calculator\'s $\\sigma x$ gives $7.0710...$ If you see $7.9$, you read $S_x$ (it divides $250$ by $4$).' },
      ],
      answer: '$\\sigma \\approx 7.1$ points: the scores are typically about $7$ points from the mean of $80$.',
    },
    {
      title: 'Which player is more consistent?',
      kind: 'real-world',
      problem: [
        { t: 'p', text: 'Over $6$ games, Player A scored $8, 9, 10, 10, 11, 12$ and Player B scored $4, 6, 10, 10, 14, 16$. Without computing, which has the greater standard deviation? Then compute both to check, and describe what the numbers mean.' },
        {
          t: 'dataplot',
          spec: { kind: 'dot', min: 0, max: 20, step: 2, axisLabel: 'Player A points per game', values: [8, 9, 10, 10, 11, 12], ariaLabel: 'Dot plot of 8, 9, 10, 10, 11 and 12.' },
        },
        {
          t: 'dataplot',
          spec: { kind: 'dot', min: 0, max: 20, step: 2, axisLabel: 'Player B points per game', values: [4, 6, 10, 10, 14, 16], ariaLabel: 'Dot plot of 4, 6, 10, 10, 14 and 16.' },
        },
      ],
      steps: [
        { text: 'Compare by looking.', tex: '\\bar{x}_A = \\bar{x}_B = 10', why: 'Both means are $\\frac{60}{6} = 10$. B\'s dots are much farther from $10$, so B should have the greater $\\sigma$.' },
        { text: 'Player A.', tex: '\\text{deviations } -2, -1, 0, 0, 1, 2; \\quad \\sigma_A = \\sqrt{\\frac{4 + 1 + 0 + 0 + 1 + 4}{6}} = \\sqrt{\\frac{10}{6}} \\approx 1.3', why: 'Square each deviation, add, divide by $n = 6$, take the root.' },
        { text: 'Player B.', tex: '\\text{deviations } -6, -4, 0, 0, 4, 6; \\quad \\sigma_B = \\sqrt{\\frac{36 + 16 + 0 + 0 + 16 + 36}{6}} = \\sqrt{\\frac{104}{6}} \\approx 4.2', why: 'Same steps. The bigger deviations make much bigger squares.' },
        { text: 'Interpret in context.', tex: '\\sigma_A \\approx 1.3 < \\sigma_B \\approx 4.2', why: 'A typically scores within about $1.3$ points of $10$; B typically scores about $4.2$ points away from $10$. A is more consistent.' },
      ],
      answer: 'Player B has the greater standard deviation ($\\approx 4.2$ points vs $\\approx 1.3$ points). Both average $10$ points, but Player A is more consistent.',
    },
    {
      title: 'The deviations add to zero',
      kind: 'common-mistake',
      problem: [{ t: 'p', text: 'For the gaming hours $2, 4, 4, 4, 5, 5, 7, 9$ (mean $5$), Riley adds the deviations, $-3 - 1 - 1 - 1 + 0 + 0 + 2 + 4 = 0$, and says "the standard deviation is $0$." What is wrong, and what is $\\sigma$?' }],
      steps: [
        { text: 'Check Riley\'s claim against the data.', tex: '\\sigma = 0 \\iff \\text{every value equals the mean}', why: 'A standard deviation of $0$ would mean no spread at all, but these values range from $2$ to $9$. So $0$ cannot be right.' },
        { text: 'Find the mistake.', tex: '\\sum (x - \\bar{x}) = 0 \\text{ for every data set}', why: 'The mean is the balance point, so the deviations **always** cancel. Riley skipped the squaring step.' },
        { text: 'Square, add, divide by $n$.', tex: '\\frac{9 + 1 + 1 + 1 + 0 + 0 + 4 + 16}{8} = \\frac{32}{8} = 4', why: 'The squares are all positive, so they cannot cancel.' },
        { text: 'Take the square root.', tex: '\\sigma = \\sqrt{4} = 2', why: 'Do not stop at $4$: without the root the answer would be in "square hours."' },
      ],
      answer: 'Riley forgot to square the deviations, and the deviations always add to $0$. The standard deviation is $\\sigma = 2$ hours.',
    },
    {
      title: 'Within one standard deviation, then add 5',
      kind: 'challenging',
      problem: [{ t: 'p', text: 'Students in a club stream a mean of $70$ minutes per day, with a standard deviation of $8$ minutes. (a) What interval is within one standard deviation of the mean? (b) Next month every student streams exactly $5$ more minutes per day. What are the new mean, standard deviation and interval?' }],
      steps: [
        { text: '(a) Go one standard deviation each way.', tex: '[70 - 8, \\; 70 + 8] = [62, 78]', why: '"Within one standard deviation" means no more than $\\sigma = 8$ minutes from the mean in either direction.' },
        { text: '(b) New mean.', tex: '70 + 5 = 75', why: 'Every value goes up $5$, so the total goes up $5n$ and the mean goes up $5$.' },
        { text: 'New standard deviation.', tex: '\\sigma = 8', why: 'Each value and the mean both moved up $5$, so every deviation $x - \\bar{x}$ is unchanged. Same deviations, same $\\sigma$.' },
        { text: 'New interval.', tex: '[75 - 8, \\; 75 + 8] = [67, 83]', why: 'The interval slides up $5$ but keeps the same width, $16$ minutes.' },
      ],
      answer: '(a) $[62, 78]$ minutes. (b) Mean $75$ minutes, standard deviation still $8$ minutes, interval $[67, 83]$.',
    },
  ],
  teachMeAgain: [
    {
      approach: 'visual',
      title: 'Bunched or spread',
      blocks: [
        { t: 'p', text: 'Both dot plots have mean $10$. Imagine measuring the distance from each dot to $10$.' },
        {
          t: 'dataplot',
          caption: 'Small standard deviation: the dots hug the mean.',
          spec: { kind: 'dot', min: 0, max: 20, step: 2, values: [8, 9, 10, 10, 11, 12], ariaLabel: 'Dot plot of 8, 9, 10, 10, 11 and 12.' },
        },
        {
          t: 'dataplot',
          caption: 'Large standard deviation: the dots are far from the mean.',
          spec: { kind: 'dot', min: 0, max: 20, step: 2, values: [4, 6, 10, 10, 14, 16], ariaLabel: 'Dot plot of 4, 6, 10, 10, 14 and 16.' },
        },
        { t: 'p', text: 'In the first plot the distances are $2, 1, 0, 0, 1, 2$; in the second they are $6, 4, 0, 0, 4, 6$. The standard deviation is a kind of typical distance: about $1.3$ for the first and about $4.2$ for the second.' },
      ],
    },
    {
      approach: 'simpler-example',
      title: 'When every value is the same distance away',
      blocks: [
        { t: 'p', text: 'Take $2, 2, 8, 8$. The mean is $5$, and **every** value is exactly $3$ away from it.' },
        { t: 'math', tex: '\\sigma = \\sqrt{\\frac{9 + 9 + 9 + 9}{4}} = \\sqrt{9} = 3' },
        { t: 'p', text: 'When every distance is the same, the standard deviation is exactly that distance. When the distances differ, $\\sigma$ lands somewhere among them, as a typical distance.' },
      ],
    },
    {
      approach: 'analogy',
      title: 'Darts around the bullseye',
      blocks: [
        { t: 'p', text: 'Think of the mean as the bullseye and each value as a dart. Two players can be centered on the same bullseye (same mean), but one player\'s darts are tightly grouped and the other\'s are scattered all over the board.' },
        { t: 'p', text: 'The standard deviation measures how far a typical dart lands from the bullseye. Tight group: small $\\sigma$. Scattered: large $\\sigma$. Moving the whole board $5$ inches to the right moves the bullseye too, but the darts are just as scattered as before.' },
      ],
    },
    {
      approach: 'prerequisite',
      title: 'Refresher: squares, roots and the order of steps',
      blocks: [
        { t: 'list', items: [
          '**Squaring a negative:** $(-6)^2 = (-6)(-6) = 36$. On a calculator, type the parentheses.',
          '**Square roots:** $\\sqrt{9} = 3$ because $3^2 = 9$. $\\sqrt{50}$ is between $7$ and $8$ because $49 < 50 < 64$; a calculator gives $7.07$.',
          '**Order inside the formula:** square each deviation **first**, then add, then divide, then take the root last.',
        ] },
      ],
    },
    {
      approach: 'step-by-step',
      title: 'Fill in the table',
      blocks: [
        { t: 'p', text: 'Example: $4, 6, 8$.' },
        {
          t: 'table',
          caption: 'Mean 6.',
          headers: ['$x$', '$x - \\bar{x}$', '$(x - \\bar{x})^2$'],
          rows: [
            ['$4$', '$-2$', '$4$'],
            ['$6$', '$0$', '$0$'],
            ['$8$', '$2$', '$4$'],
            ['**sum**', '$0$', '$8$'],
          ],
        },
        { t: 'list', ordered: true, items: [
          'Mean: $\\frac{18}{3} = 6$.',
          'Middle column: value minus mean. Check that it adds to $0$.',
          'Right column: square the middle column, then add: $8$.',
          'Divide by $n = 3$ and take the root: $\\sigma = \\sqrt{\\frac{8}{3}} \\approx 1.6$.',
        ] },
        { t: 'p', text: 'Now add $10$ to each value: $14, 16, 18$. The mean is $16$, and the deviations are still $-2, 0, 2$, so $\\sigma$ is still about $1.6$.' },
      ],
    },
    {
      approach: 'alternate-strategy',
      title: 'Let technology compute, you interpret',
      blocks: [
        { t: 'p', text: 'For real data, compute with technology and spend your effort on the meaning.' },
        { t: 'list', items: [
          '**Desmos:** **stdevp([45,30,60,90,30,75,50,40])** gives $20$. (**stdev** without the p gives $S_x \\approx 21.38$; do not use it here.)',
          '**Graphing calculator:** STAT, EDIT, type into L1; then STAT, CALC, 1-Var Stats; read $\\sigma x = 20$, not $Sx$.',
          '**Interpret:** the mean is $52.5$ minutes, and a typical day was about $20$ minutes above or below that.',
        ] },
      ],
    },
  ],
  guided: [
    { generator: 'u7.std-dev', difficulty: 1 },
    { generator: 'u7.std-dev', difficulty: 1 },
    { generator: 'u7.std-dev', difficulty: 2 },
    { generator: 'u7.std-dev', difficulty: 3 },
  ],
  independent: {
    count: 8,
    reviewCount: 2,
    mix: [
      { generator: 'u7.std-dev', difficulty: 1, weight: 2 },
      { generator: 'u7.std-dev', difficulty: 2, weight: 3 },
      { generator: 'u7.std-dev', difficulty: 3, weight: 3 },
    ],
  },
  quiz: {
    items: [
      { generator: 'u7.std-dev', difficulty: 1 },
      { generator: 'u7.std-dev', difficulty: 2 },
      { generator: 'u7.std-dev', difficulty: 2 },
      { generator: 'u7.std-dev', difficulty: 2 },
      { generator: 'u7.std-dev', difficulty: 3 },
      { generator: 'u7.std-dev', difficulty: 3 },
    ],
  },
  summary: [
    'A deviation is value $-$ mean. The deviations always add to $0$, so we square them before adding.',
    'Standard deviation: $\\sigma = \\sqrt{\\frac{\\sum (x - \\bar{x})^2}{n}}$. For $2, 4, 4, 4, 5, 5, 7, 9$: the squares add to $32$, $\\frac{32}{8} = 4$, and $\\sigma = 2$.',
    'The standard deviation is a typical distance of the values from the mean, in the units of the data. More spread in a dot plot means a larger $\\sigma$.',
    'Technology: Desmos **stdevp** or the calculator\'s $\\sigma x$ from 1-Var Stats. $S_x$ (Desmos **stdev**) divides by $n - 1$ and is a different value.',
    'Within one standard deviation of the mean is $[\\bar{x} - \\sigma, \\bar{x} + \\sigma]$, like $[62, 78]$ for mean $70$ and $\\sigma = 8$. Adding a constant to every value adds it to the mean but does not change $\\sigma$.',
  ],
  mastery: { quizPassScore: 0.8, practiceMinCorrect: 5 },
};
