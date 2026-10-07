import type { LessonContent } from '../../../core/curriculum/types';

/**
 * U7L02 Quartiles, IQR and Box Plots (A.DSR.10.1)
 * The five-number summary (minimum, Q1, median, Q3, maximum) with Q1 and Q3 as the medians of the lower and upper
 * halves, leaving the median out of both halves when the count is odd (the graphing-calculator method); odd and
 * even counts and unordered lists; the interquartile range IQR = Q3 - Q1 as the spread of the middle half and
 * the range = max - min; building a box plot from the five-number summary and reading one; each of the four
 * sections of a box plot holds about 25% of the data, so a longer section means more spread, not more data;
 * percents above or below a quartile (S7.02). Reviews mean and median (S7.01).
 *
 * Math verified by hand (2026-10-07): every five-number summary was recomputed from the sorted list
 * (2, 4, 5, 7, 8, 10, 13: halves 2, 4, 5 and 8, 10, 13, so 2, 4, 7, 10, 13 and IQR 6, and the wrong
 * include-the-median halves 2, 4, 5, 7 and 7, 8, 10, 13 give Q1 4.5 and Q3 9; 12, 15, 18, 20, 24, 25, 30, 34:
 * median (20 + 24)/2 = 22, Q1 (15 + 18)/2 = 16.5, Q3 (25 + 30)/2 = 27.5, IQR 11, range 22; 18, 7, 25, 12, 30, 9,
 * 15, 22, 11 sorted 7, 9, 11, 12, 15, 18, 22, 25, 30: Q1 (9 + 11)/2 = 10, median 15, Q3 (22 + 25)/2 = 23.5,
 * IQR 13.5, and the include-the-median method gives Q1 11, Q3 22; 1, 3, 5, 7, 9, 11: 1, 3, 6, 9, 11;
 * screen time box 60, 120, 150, 210, 300: IQR 90, range 240, 25% of 40 students = 10; 3, 5, 6, 8, 9, 12, 15, 20:
 * 3, 5.5, 8.5, 13.5, 20, IQR 8), every box has min <= Q1 <= median <= Q3 <= max inside its axis, and every
 * percent was checked as a count of quarters.
 */
export const U7L02: LessonContent = {
  lessonId: 'U7L02',
  goal: 'Find the five-number summary and the interquartile range of a data set (like $2, 4, 7, 10, 13$ and IQR $= 6$ for $2, 4, 5, 7, 8, 10, 13$), draw a box plot from it, and read a box plot, knowing each of its four sections holds about $25\\%$ of the data.',
  needToKnow: [
    { t: 'p', text: 'Quartiles are built from medians, so everything here starts with the last lesson:' },
    {
      t: 'list',
      items: [
        '**Median of an odd count:** the middle value of the ordered list. $3, 5, 7, 9, 12$ has median $7$.',
        '**Median of an even count:** the mean of the two middle values. $30, 30, 40, 45, 50, 60, 75, 90$ has median $\\frac{45 + 50}{2} = 47.5$.',
        '**Percents of a whole:** $25\\%$ is one quarter, $50\\%$ is one half, $75\\%$ is three quarters. $25\\%$ of $40$ is $10$.',
      ],
    },
    { t: 'callout', variant: 'tip', title: 'Quick check', text: 'Find the median of $9, 4, 6, 1$. (Order it: $1, 4, 6, 9$, so the median is $\\frac{4 + 6}{2} = 5$.) If that felt shaky, open **Teach Me Again** and choose the refresher.' },
  ],
  vocabulary: [
    { term: 'quartiles', meaning: 'The three values that split ordered data into four groups of about the same size: $Q_1$, the median ($Q_2$) and $Q_3$.' },
    { term: 'first quartile ($Q_1$)', meaning: 'The median of the lower half of the data. About $25\\%$ of the data is below it.' },
    { term: 'third quartile ($Q_3$)', meaning: 'The median of the upper half of the data. About $75\\%$ of the data is below it.' },
    { term: 'five-number summary', meaning: 'Minimum, $Q_1$, median, $Q_3$, maximum, always in that order.' },
    { term: 'interquartile range (IQR)', meaning: '$Q_3 - Q_1$: how spread out the middle half of the data is.' },
    { term: 'range', meaning: 'Maximum $-$ minimum: how spread out all of the data is.' },
    { term: 'box plot', meaning: 'A graph of the five-number summary: a box from $Q_1$ to $Q_3$ with a line at the median, and whiskers out to the minimum and maximum. (In Lesson 4 you will see that outliers are drawn as separate dots and the whiskers stop at the last value that is not an outlier.)' },
  ],
  instruction: [
    { t: 'p', text: '### Cutting the data into quarters' },
    { t: 'p', text: 'The median cuts ordered data into two halves. The **quartiles** cut each half in half again, so the data is split into four parts with about the same number of values. Here are the hours $7$ friends played video games last week, in order:' },
    { t: 'math', tex: '2, \\; 4, \\; 5, \\; 7, \\; 8, \\; 10, \\; 13' },
    { t: 'list', ordered: true, items: [
      '**Median:** the middle (4th) value, $7$.',
      '**Lower half:** the values **below** the median: $2, 4, 5$. Its median is $Q_1 = 4$.',
      '**Upper half:** the values **above** the median: $8, 10, 13$. Its median is $Q_3 = 10$.',
    ] },
    { t: 'callout', variant: 'warning', title: 'Odd count: leave the median out', text: 'When there is an odd number of values, the median itself goes in **neither** half. This is the method graphing calculators use. If you included the $7$ in both halves you would get $Q_1 = 4.5$ and $Q_3 = 9$, which do not match a calculator.' },
    { t: 'p', text: 'With an **even** count, the data splits cleanly into two halves with nothing left over. Minutes of homework on $8$ nights:' },
    { t: 'math', tex: '\\underbrace{12, \\; 15, \\; 18, \\; 20}_{\\text{lower half}} \\;\\Big|\\; \\underbrace{24, \\; 25, \\; 30, \\; 34}_{\\text{upper half}}' },
    { t: 'p', text: 'Median $= \\frac{20 + 24}{2} = 22$, $Q_1 = \\frac{15 + 18}{2} = 16.5$ and $Q_3 = \\frac{25 + 30}{2} = 27.5$. Notice that the median, $Q_1$ and $Q_3$ do not have to be values in the data.' },
    { t: 'p', text: '### The five-number summary, IQR and range' },
    { t: 'p', text: 'The **five-number summary** lists the minimum, $Q_1$, median, $Q_3$ and maximum. For the gaming hours it is $2, 4, 7, 10, 13$. Two measures of spread come from it:' },
    { t: 'math', tex: '\\text{IQR} = Q_3 - Q_1 = 10 - 4 = 6 \\qquad\\qquad \\text{range} = \\max - \\min = 13 - 2 = 11' },
    { t: 'p', text: 'The **IQR** is the spread of the **middle half** of the data. The range depends only on the two most extreme values, so one unusual value can change it a lot. The IQR ignores the top and bottom quarters, which makes it **resistant** to outliers, just like the median.' },
    { t: 'p', text: '### Drawing a box plot' },
    { t: 'list', ordered: true, items: [
      'Draw a number line that covers the minimum to the maximum, with an even scale.',
      'Draw a box from $Q_1$ to $Q_3$.',
      'Draw a vertical line inside the box at the median.',
      'Draw whiskers from the box out to the minimum and to the maximum.',
    ] },
    {
      t: 'dataplot',
      caption: 'Box plot of the gaming hours 2, 4, 5, 7, 8, 10, 13: five-number summary 2, 4, 7, 10, 13.',
      spec: { kind: 'box', min: 0, max: 14, step: 1, axisLabel: 'hours of video games last week', boxes: [{ min: 2, q1: 4, median: 7, q3: 10, max: 13 }], ariaLabel: 'Box plot with whiskers from 2 to 4 and from 10 to 13, a box from 4 to 10, and a median line at 7.' },
    },
    { t: 'p', text: '### What each piece holds' },
    { t: 'p', text: 'The four pieces of a box plot (left whisker, left part of the box, right part of the box, right whisker) each hold about **one quarter** of the data. So about $25\\%$ of the values are below $Q_1$, $50\\%$ are below the median, $75\\%$ are below $Q_3$, and the box itself holds the middle $50\\%$.' },
    {
      t: 'dataplot',
      caption: 'Daily screen time for 40 students. Each section holds about 10 students (25%).',
      spec: { kind: 'box', min: 0, max: 320, step: 20, axisLabel: 'screen time (minutes per day)', boxes: [{ min: 60, q1: 120, median: 150, q3: 210, max: 300 }], ariaLabel: 'Box plot with minimum 60, Q1 120, median 150, Q3 210 and maximum 300.' },
    },
    { t: 'list', items: [
      'About $25\\%$ of the students, $10$ of the $40$, used their phones **more than $210$ minutes** a day.',
      'About $75\\%$ used them **more than $120$ minutes**: three of the four quarters are to the right of $Q_1$.',
      'The middle half used them between $120$ and $210$ minutes, so $\\text{IQR} = 210 - 120 = 90$ minutes.',
    ] },
    { t: 'callout', variant: 'why', title: 'Longer does not mean more', text: 'The right whisker (from $210$ to $300$) is much longer than the left part of the box (from $120$ to $150$), but **both** hold about $10$ students. A long section means those values are **spread out**; a short section means they are **bunched together**.' },
    { t: 'callout', variant: 'realworld', title: 'Where this shows up', text: 'College and test-score reports often give the "middle 50%" of scores, like "the middle 50% of admitted students scored from 1210 to 1390." That is exactly $Q_1$ to $Q_3$: the box of a box plot.' },
  ],
  examples: [
    {
      title: 'Five-number summary of an even count',
      kind: 'introductory',
      problem: [{ t: 'p', text: 'Minutes of homework on $8$ nights: $12, 15, 18, 20, 24, 25, 30, 34$. Find the five-number summary and the IQR.' }],
      steps: [
        { text: 'Check that the data is in order, and find the minimum and maximum.', tex: '\\min = 12, \\qquad \\max = 34', why: 'Quartiles only make sense on ordered data. This list is already from least to greatest.' },
        { text: 'Find the median.', tex: '\\frac{20 + 24}{2} = 22', why: '$8$ values is even, so the median is the mean of the 4th and 5th values.' },
        { text: 'Split into halves and find the quartiles.', tex: 'Q_1 = \\frac{15 + 18}{2} = 16.5, \\qquad Q_3 = \\frac{25 + 30}{2} = 27.5', why: 'The lower half is $12, 15, 18, 20$ and the upper half is $24, 25, 30, 34$. Each half has an even count, so each quartile is the mean of two values.' },
        { text: 'Find the IQR.', tex: '\\text{IQR} = 27.5 - 16.5 = 11', why: 'The middle half of the nights spans $11$ minutes.' },
      ],
      answer: 'Five-number summary: $12, 16.5, 22, 27.5, 34$. IQR $= 11$ minutes.',
    },
    {
      title: 'An unordered list with an odd count',
      kind: 'intermediate',
      problem: [{ t: 'p', text: 'The numbers of texts $9$ students sent before lunch were $18, 7, 25, 12, 30, 9, 15, 22, 11$. Find the IQR.' }],
      steps: [
        { text: 'Put the data in order.', tex: '7, \\; 9, \\; 11, \\; 12, \\; 15, \\; 18, \\; 22, \\; 25, \\; 30', why: 'The median and quartiles are positions in the **ordered** list.' },
        { text: 'Find the median.', tex: '\\text{median} = 15', why: 'With $9$ values, the 5th value has $4$ values on each side.' },
        { text: 'Find the halves, leaving the median out.', tex: '\\text{lower: } 7, 9, 11, 12 \\qquad \\text{upper: } 18, 22, 25, 30', why: 'The count is odd, so the median $15$ belongs to neither half.' },
        { text: 'Find the quartiles and the IQR.', tex: 'Q_1 = \\frac{9 + 11}{2} = 10, \\quad Q_3 = \\frac{22 + 25}{2} = 23.5, \\quad \\text{IQR} = 23.5 - 10 = 13.5', why: 'Each half has $4$ values, so each quartile is the mean of its two middle values.' },
      ],
      answer: 'IQR $= 13.5$ texts (five-number summary $7, 10, 15, 23.5, 30$).',
    },
    {
      title: 'Reading a screen-time box plot',
      kind: 'real-world',
      problem: [
        { t: 'p', text: 'The box plot shows daily screen time for $40$ students. (a) Find the IQR and the range. (b) About what percent of the students used their phones less than $150$ minutes a day? (c) About how many students used them more than $210$ minutes?' },
        {
          t: 'dataplot',
          spec: { kind: 'box', min: 0, max: 320, step: 20, axisLabel: 'screen time (minutes per day)', boxes: [{ min: 60, q1: 120, median: 150, q3: 210, max: 300 }], ariaLabel: 'Box plot with minimum 60, Q1 120, median 150, Q3 210 and maximum 300.' },
        },
      ],
      steps: [
        { text: 'Read the five-number summary.', tex: '60, \\; 120, \\; 150, \\; 210, \\; 300', why: 'Left whisker end, left edge of the box, line in the box, right edge of the box, right whisker end.' },
        { text: '(a) IQR and range.', tex: '\\text{IQR} = 210 - 120 = 90, \\qquad \\text{range} = 300 - 60 = 240', why: 'The IQR uses the edges of the box; the range uses the ends of the whiskers.' },
        { text: '(b) Below the median.', tex: '50\\%', why: '$150$ is the median, and half of the data is below the median.' },
        { text: '(c) Above $Q_3$.', tex: '25\\% \\text{ of } 40 = 0.25 \\times 40 = 10', why: 'Only the right whisker is above $Q_3 = 210$, and it holds one quarter of the data.' },
      ],
      answer: '(a) IQR $= 90$ minutes, range $= 240$ minutes. (b) About $50\\%$. (c) About $10$ students.',
    },
    {
      title: 'The longest section has the most data?',
      kind: 'common-mistake',
      problem: [{ t: 'p', text: 'Looking at the screen-time box plot (minimum $60$, $Q_1 = 120$, median $150$, $Q_3 = 210$, maximum $300$), Devon says: "The right whisker is the longest piece, so the most students are between $210$ and $300$ minutes." Is Devon right?' }],
      steps: [
        { text: 'Find the length of each piece.', tex: '120 - 60 = 60, \\quad 150 - 120 = 30, \\quad 210 - 150 = 60, \\quad 300 - 210 = 90', why: 'Devon is right that the right whisker is the longest piece, at $90$ minutes.' },
        { text: 'Recall what each piece holds.', tex: '\\text{each piece} \\approx 25\\% \\text{ of the data} = 10 \\text{ students}', why: 'The quartiles are defined by **counting** values, so every piece holds the same number of students no matter how long it is.' },
        { text: 'Interpret the length correctly.', tex: '\\text{longest piece} \\Rightarrow \\text{most spread out}', why: 'The $10$ students in the top quarter are spread over $90$ minutes. The $10$ students in the short piece ($120$ to $150$) are bunched into just $30$ minutes.' },
      ],
      answer: 'No. Each piece holds about $25\\%$ of the students ($10$ students). The long right whisker means the top quarter is spread out, not that it has more students.',
    },
    {
      title: 'Which box plot matches?',
      kind: 'challenging',
      problem: [
        { t: 'p', text: 'Which box plot matches the texts data $18, 7, 25, 12, 30, 9, 15, 22, 11$? Explain why the other one is wrong.' },
        {
          t: 'dataplot',
          spec: { kind: 'box', min: 0, max: 32, step: 2, axisLabel: 'texts sent before lunch', boxes: [{ label: 'A', min: 7, q1: 11, median: 15, q3: 22, max: 30 }, { label: 'B', min: 7, q1: 10, median: 15, q3: 23.5, max: 30 }], ariaLabel: 'Two box plots. A: 7, 11, 15, 22, 30. B: 7, 10, 15, 23.5, 30.' },
        },
      ],
      steps: [
        { text: 'Compare what is the same.', tex: '\\min = 7, \\quad \\text{median} = 15, \\quad \\max = 30', why: 'Both plots agree on these, so they cannot tell the plots apart. The difference is in the quartiles.' },
        { text: 'Find the quartiles from the ordered data.', tex: '7, 9, 11, 12, \\mathbf{15}, 18, 22, 25, 30 \\;\\Rightarrow\\; Q_1 = 10, \\; Q_3 = 23.5', why: 'With an odd count, leave out the median: the halves are $7, 9, 11, 12$ and $18, 22, 25, 30$.' },
        { text: 'Explain plot A.', tex: '7, 9, 11, 12, 15 \\Rightarrow 11, \\qquad 15, 18, 22, 25, 30 \\Rightarrow 22', why: 'Plot A put the median $15$ into **both** halves, which is not the method we (and graphing calculators) use.' },
      ],
      answer: 'Plot B ($7, 10, 15, 23.5, 30$). Plot A has the wrong quartiles because it included the median in both halves.',
    },
  ],
  teachMeAgain: [
    {
      approach: 'visual',
      title: 'See the four quarters',
      blocks: [
        { t: 'p', text: 'Here are $8$ data values shown as dots, with the box plot of the same data below it. Count the dots in each section.' },
        {
          t: 'dataplot',
          spec: { kind: 'dot', min: 0, max: 22, step: 1, axisLabel: 'value', values: [3, 5, 6, 8, 9, 12, 15, 20], ariaLabel: 'Dot plot with one dot each at 3, 5, 6, 8, 9, 12, 15 and 20.' },
        },
        {
          t: 'dataplot',
          spec: { kind: 'box', min: 0, max: 22, step: 1, axisLabel: 'value', boxes: [{ min: 3, q1: 5.5, median: 8.5, q3: 13.5, max: 20 }], ariaLabel: 'Box plot with minimum 3, Q1 5.5, median 8.5, Q3 13.5 and maximum 20.' },
        },
        { t: 'p', text: 'Two dots are left of $Q_1 = 5.5$ ($3$ and $5$), two are between $5.5$ and $8.5$ ($6$ and $8$), two are between $8.5$ and $13.5$ ($9$ and $12$), and two are right of $13.5$ ($15$ and $20$). Same count in every quarter, different widths. IQR $= 13.5 - 5.5 = 8$.' },
      ],
    },
    {
      approach: 'simpler-example',
      title: 'Six numbers',
      blocks: [
        { t: 'p', text: 'Take $1, 3, 5, 7, 9, 11$.' },
        { t: 'list', items: [
          'Median: $\\frac{5 + 7}{2} = 6$.',
          'Lower half $1, 3, 5$: $Q_1 = 3$. Upper half $7, 9, 11$: $Q_3 = 9$.',
          'Five-number summary: $1, 3, 6, 9, 11$. IQR $= 9 - 3 = 6$.',
        ] },
        { t: 'p', text: 'Every data set works this way: find the middle, then find the middle of each half.' },
      ],
    },
    {
      approach: 'analogy',
      title: 'A race with four groups of runners',
      blocks: [
        { t: 'p', text: 'Imagine $40$ runners crossing a finish line. Split them by finishing order into four groups of $10$. $Q_1$ is the time when the first group is done, the median is when half are done, and $Q_3$ is when three groups are done.' },
        { t: 'p', text: 'If the last $10$ runners straggle in over a long time, the last group covers a long stretch of the clock. It is still just $10$ runners. That long stretch is a long whisker.' },
      ],
    },
    {
      approach: 'prerequisite',
      title: 'Refresher: the median',
      blocks: [
        { t: 'list', items: [
          '**Odd count:** order the data and take the middle value. $4, 8, 9$: median $8$.',
          '**Even count:** order the data and average the two middle values. $4, 8, 9, 15$: median $\\frac{8 + 9}{2} = 8.5$.',
          'The median is a **position** in the ordered list, so you must order first.',
        ] },
        { t: 'p', text: 'A quartile is just a median of half the data, so if you can find a median, you can find a quartile.' },
      ],
    },
    {
      approach: 'step-by-step',
      title: 'A routine for any list',
      blocks: [
        { t: 'list', ordered: true, items: [
          '**Order** the data and count it ($n$).',
          '**Median:** the middle value ($n$ odd) or the mean of the two middle values ($n$ even).',
          '**Halves:** the values below the median and the values above it. If $n$ is odd, the median itself goes in neither half.',
          '**$Q_1$ and $Q_3$:** the median of each half.',
          '**Summary:** min, $Q_1$, median, $Q_3$, max. **IQR** $= Q_3 - Q_1$.',
        ] },
        { t: 'p', text: 'Check: with $2, 4, 5, 7, 8, 10, 13$ you should get $2, 4, 7, 10, 13$ and IQR $6$.' },
      ],
    },
    {
      approach: 'alternate-strategy',
      title: 'Let technology do the counting',
      blocks: [
        { t: 'p', text: '**Graphing calculator:** press STAT, choose EDIT, and type the data into L1. Then press STAT, choose CALC, and pick 1-Var Stats. Scroll down to see minX, Q1, Med, Q3 and maxX: the whole five-number summary.' },
        { t: 'p', text: 'Use technology to **check** your hand work on short lists, and to save time on long ones. Our method (leaving the median out of the halves when $n$ is odd) gives the same quartiles a graphing calculator shows.' },
      ],
    },
  ],
  guided: [
    { generator: 'u7.quartiles', difficulty: 1 },
    { generator: 'u7.quartiles', difficulty: 1 },
    { generator: 'u7.quartiles', difficulty: 2 },
    { generator: 'u7.quartiles', difficulty: 3 },
  ],
  independent: {
    count: 8,
    reviewCount: 2,
    mix: [
      { generator: 'u7.quartiles', difficulty: 1, weight: 2 },
      { generator: 'u7.quartiles', difficulty: 2, weight: 3 },
      { generator: 'u7.quartiles', difficulty: 3, weight: 3 },
    ],
  },
  quiz: {
    items: [
      { generator: 'u7.quartiles', difficulty: 1 },
      { generator: 'u7.quartiles', difficulty: 2 },
      { generator: 'u7.quartiles', difficulty: 2 },
      { generator: 'u7.quartiles', difficulty: 2 },
      { generator: 'u7.quartiles', difficulty: 3 },
      { generator: 'u7.quartiles', difficulty: 3 },
    ],
  },
  summary: [
    'The five-number summary is minimum, $Q_1$, median, $Q_3$, maximum. $Q_1$ and $Q_3$ are the medians of the lower and upper halves; with an odd count, leave the median out of both halves.',
    '$2, 4, 5, 7, 8, 10, 13$ has five-number summary $2, 4, 7, 10, 13$; $12, 15, 18, 20, 24, 25, 30, 34$ has $12, 16.5, 22, 27.5, 34$.',
    'IQR $= Q_3 - Q_1$ is the spread of the middle half of the data, and it is resistant to outliers. Range $=$ max $-$ min.',
    'A box plot draws a box from $Q_1$ to $Q_3$, a line at the median, and whiskers to the minimum and maximum.',
    'Each of the four sections of a box plot holds about $25\\%$ of the data. A longer section means the values there are more spread out, not that there are more of them.',
  ],
  mastery: { quizPassScore: 0.8, practiceMinCorrect: 5 },
};
