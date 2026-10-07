import type { LessonContent } from '../../../core/curriculum/types';

/**
 * U7L01 Statistical Questions, Mean and Median (A.DSR.10.1, A.MM.1.5)
 * Statistical investigative questions (they anticipate variability, and may compare groups) versus questions with
 * one fixed answer; defining the variable to collect with its units and how it is measured; the mean as
 * sum / count and as the balance point; the median as the middle of the ordered data (the average of the two
 * middle values for an even count); mean and median from a dot plot and a frequency table; choosing the median
 * for skewed data or data with an outlier and the mean for symmetric data without outliers; a missing value
 * from a given mean (total = mean x count); how adding a value changes the mean and the median (S7.01).
 * Reviews fractions and decimals (P.FRAC).
 *
 * Math verified by hand (2026-10-07): every sum, mean and median was recomputed from the sorted list (points
 * 14, 9, 22, 17, 9, 18, 16: sum 105, mean 15, median 16; with 50 added: mean 155/8 = 19.375 (about 19.4), median 16.5;
 * streaming 45, 30, 60, 90, 30, 75, 50, 40: sum 420, mean 52.5, median (45 + 50)/2 = 47.5; games owned
 * 1, 2, 2, 3, 3, 3, 3, 4, 5, 8: sum 34, mean 3.4, median 3; game spending 5, 10, 15, 15, 20, 25, 30, 120: sum 240,
 * mean 30, median 17.5, and without 120: mean 120/7 = 17.14, median 15; 7, 3, 12, 5, 9: median 7; quiz scores
 * 82, 90, 75, 88, x with mean 85: 5 x 85 = 425, 425 - 335 = 90; sleep 6, 7, 7, 8, 9: mean 7.4, median 7; 4, 6, 8,
 * 10, 12: mean 8 and the deviations -4, -2, 0, 2, 4 balance to 0, and 4, 6, 8, 10, 50: mean 78/5 = 15.6, median 8;
 * 2, 4, 9: mean 5, median 4, and with 5 added: mean 20/4 = 5, median 4.5; pizza 1 + 2 + 3 + 6 = 12, 12/4 = 3), and every dot plot value lies inside its axis
 * and matches its frequency table.
 */
export const U7L01: LessonContent = {
  lessonId: 'U7L01',
  goal: 'Tell a statistical question from a question with one answer, decide what data to collect, find the mean and median of a data set (like $15$ and $16$ for $14, 9, 22, 17, 9, 18, 16$), and choose the better measure of center when the data has an outlier or is skewed.',
  needToKnow: [
    { t: 'p', text: 'This unit is about **data**: lists of numbers collected from real people and things. You already know the skills you need to start:' },
    {
      t: 'list',
      items: [
        '**Putting numbers in order.** From least to greatest: $3, 5, 7, 9, 12$. Decimals too: $4.5 < 4.75 < 5$.',
        '**Dividing to share equally.** $105 \\div 7 = 15$, and $420 \\div 8 = 52.5$. A quotient does not have to be a whole number.',
        '**The number halfway between two numbers.** Add them and divide by $2$: halfway between $45$ and $50$ is $\\frac{45 + 50}{2} = 47.5$.',
      ],
    },
    { t: 'callout', variant: 'tip', title: 'Quick check', text: 'Put $8, 2, 6, 4$ in order, and find the number halfway between the two middle numbers. Then find $34 \\div 10$. (You should get $2, 4, 6, 8$, then $5$, then $3.4$.) If that felt shaky, open **Teach Me Again** and choose the refresher.' },
  ],
  vocabulary: [
    { term: 'statistical question', meaning: 'A question answered with data that **varies**, like "How many hours of sleep do students in my class usually get?" The answers are expected to be different from person to person.' },
    { term: 'variable', meaning: 'The quantity you measure or count for each person or thing, such as "minutes of screen time on Monday, from the phone\'s settings."' },
    { term: 'mean', meaning: 'The sum of the values divided by how many values there are. It is the "fair share" and the balance point of the data.' },
    { term: 'median', meaning: 'The middle value when the data is in order. With an even number of values, it is the mean of the two middle values.' },
    { term: 'outlier', meaning: 'A value far away from the rest of the data. (Lesson 4 gives an exact rule for deciding.)' },
    { term: 'skewed', meaning: 'Data with a long tail of values stretching out on one side.' },
  ],
  instruction: [
    { t: 'p', text: '### Statistical questions expect variability' },
    { t: 'p', text: 'A **statistical investigative question** is one you answer by collecting data that you expect to **vary**. A question with one fixed answer is not statistical, even if it has a number in it.' },
    {
      t: 'table',
      caption: 'The statistical questions expect many different answers.',
      headers: ['Not statistical (one answer)', 'Statistical (answers vary)'],
      rows: [
        ['How many minutes did I spend on my phone yesterday?', 'How many minutes per day do students in my class typically spend on their phones?'],
        ['How many points did our team score in Friday\'s game?', 'How many points does our team usually score in a game this season?'],
        ['What does the movie streaming plan cost per month?', 'How much do families in our school spend on streaming plans each month?'],
      ],
    },
    { t: 'p', text: 'The words **typically**, **usually** and **tend to** are clues that the asker expects the answers to vary and wants to know what is typical. Many good statistical questions **compare groups**:' },
    { t: 'list', items: [
      'Do 9th graders or 12th graders at our school tend to spend more time on social media on school nights?',
      'Do students who play a sport typically sleep more or less than students who do not?',
    ] },
    { t: 'p', text: '### Decide exactly what to collect' },
    { t: 'p', text: 'Before collecting, define the **variable**: what you will measure, its units, and how you will measure it. "Phone use" is too vague. Here is a clear version:' },
    { t: 'callout', variant: 'vocab', title: 'A well-defined variable', text: '**Variable:** screen time on Monday, in **minutes**, read from each student\'s phone screen-time setting. **Who:** every student in my first-period class. A clear definition means everyone measures the same thing in the same units, so the numbers can be compared.' },
    { t: 'p', text: 'If one person reports hours and another reports minutes, or one counts a whole week and another counts a day, the data is useless. Units matter.' },
    { t: 'p', text: '### The mean' },
    { t: 'p', text: 'A basketball player scored these points in $7$ games: $14, 9, 22, 17, 9, 18, 16$. The **mean** is the total divided by the number of values:' },
    { t: 'math', tex: '\\bar{x} = \\frac{\\text{sum of the values}}{\\text{number of values}} = \\frac{14 + 9 + 22 + 17 + 9 + 18 + 16}{7} = \\frac{105}{7} = 15' },
    { t: 'p', text: 'The symbol $\\bar{x}$ (say "x bar") means the mean. If the player had scored the same amount every game, with the same total, it would be $15$ points each game. That is why the mean is called the **fair share**.' },
    { t: 'p', text: '### The median' },
    { t: 'p', text: 'The **median** is the middle value **after putting the data in order**:' },
    { t: 'math', tex: '9, \\; 9, \\; 14, \\; \\mathbf{16}, \\; 17, \\; 18, \\; 22 \\qquad \\text{median} = 16' },
    { t: 'p', text: 'There are $7$ values, so the middle one is the 4th, with $3$ values on each side. With an **even** number of values there are two middle values, and the median is halfway between them. Minutes streamed on $8$ days, in order:' },
    { t: 'math', tex: '30, \\; 30, \\; 40, \\; \\mathbf{45}, \\; \\mathbf{50}, \\; 60, \\; 75, \\; 90 \\qquad \\text{median} = \\frac{45 + 50}{2} = 47.5' },
    { t: 'callout', variant: 'warning', title: 'Order first', text: 'The median is the middle of the **ordered** list, not the middle of the list as it was written. For $7, 3, 12, 5, 9$, the middle number as written is $12$, but in order ($3, 5, 7, 9, 12$) the median is $7$.' },
    { t: 'p', text: '### Data in a dot plot or a frequency table' },
    { t: 'p', text: 'Ten students said how many video games they own. Each dot is one student:' },
    {
      t: 'dataplot',
      caption: 'Video games owned by 10 students.',
      spec: { kind: 'dot', min: 0, max: 9, step: 1, axisLabel: 'video games owned', values: [1, 2, 2, 3, 3, 3, 3, 4, 5, 8], ariaLabel: 'Dot plot: one dot at 1, two at 2, four at 3, one at 4, one at 5 and one at 8.' },
    },
    {
      t: 'table',
      caption: 'The same data as a frequency table.',
      headers: ['Games owned', '1', '2', '3', '4', '5', '8'],
      rows: [['Number of students (frequency)', '1', '2', '4', '1', '1', '1']],
    },
    { t: 'p', text: 'For the sum, multiply each value by its frequency: $1(1) + 2(2) + 3(4) + 4(1) + 5(1) + 8(1) = 34$. The count is the number of dots, $1 + 2 + 4 + 1 + 1 + 1 = 10$, **not** the number of columns. So the mean is $34 \\div 10 = 3.4$ games.' },
    { t: 'p', text: 'For the median, count dots from the left. With $10$ values, the middle two are the 5th and 6th. Dots 4 through 7 are all at $3$, so the median is $\\frac{3 + 3}{2} = 3$ games.' },
    { t: 'p', text: '### Mean or median?' },
    { t: 'p', text: 'Eight friends said how much they spent on games last month (in dollars): $5, 10, 15, 15, 20, 25, 30, 120$. The mean is $240 \\div 8 = 30$ and the median is $\\frac{15 + 20}{2} = 17.5$.' },
    { t: 'p', text: 'Six of the eight friends spent **less** than the mean of \\$30, one spent exactly \\$30, and only one spent more. The one big value, \\$120, pulled the mean up. The median ignores how far out the \\$120 is: it only cares that it is the largest. So \\$17.50 describes a typical friend better.' },
    {
      t: 'table',
      caption: 'Removing the outlier 120 changes the mean much more than the median.',
      headers: ['', 'Mean', 'Median'],
      rows: [
        ['With \\$120', '$30$', '$17.5$'],
        ['Without \\$120', '$120 \\div 7 \\approx 17.14$', '$15$'],
      ],
    },
    { t: 'callout', variant: 'why', title: 'Why the mean moves so much', text: 'The mean uses the **size** of every value, so one huge value adds a lot to the sum. The median only uses the **order** of the values, so a value can move as far out as it likes without changing the middle. We say the median is **resistant** to outliers.' },
    { t: 'list', items: [
      '**Data with an outlier, or skewed (a long tail on one side):** use the **median**.',
      '**Roughly symmetric data with no outliers:** use the **mean**. The two will be close anyway, and the mean uses every value.',
    ] },
    { t: 'p', text: 'The same idea tells you what happens when a new value is **added**. Suppose the basketball player (points $9, 9, 14, 16, 17, 18, 22$; mean $15$, median $16$) scores $50$ in an eighth game. The mean jumps to $\\frac{105 + 50}{8} = \\frac{155}{8} \\approx 19.4$, but the median only moves to $\\frac{16 + 17}{2} = 16.5$. A new value far above the rest raises the mean a lot and the median a little.' },
    { t: 'p', text: '### A missing value' },
    { t: 'p', text: 'Because mean $=$ sum $\\div$ count, the **sum is mean $\\times$ count**. That lets you find a missing value. If $5$ quiz scores have a mean of $85$, they must add up to $5 \\times 85 = 425$. If four of them are $82, 90, 75, 88$ (sum $335$), the fifth is $425 - 335 = 90$.' },
    { t: 'callout', variant: 'realworld', title: 'Where this shows up', text: 'News stories about money often report the **median** household income or the **median** home price, not the mean, because a few very large incomes or mansions would pull the mean far above what a typical family has.' },
  ],
  examples: [
    {
      title: 'Mean and median of game scores',
      kind: 'introductory',
      problem: [{ t: 'p', text: 'A player\'s points in $7$ games were $14, 9, 22, 17, 9, 18, 16$. Find the mean and the median.' }],
      steps: [
        { text: 'Add the values.', tex: '14 + 9 + 22 + 17 + 9 + 18 + 16 = 105', why: 'The mean starts with the total. Every value counts, including both $9$s.' },
        { text: 'Divide by how many values there are.', tex: '\\bar{x} = \\frac{105}{7} = 15', why: 'There are $7$ games. Sharing $105$ points equally over $7$ games gives $15$ per game.' },
        { text: 'Put the values in order.', tex: '9, \\; 9, \\; 14, \\; 16, \\; 17, \\; 18, \\; 22', why: 'The median is the middle of the **ordered** list.' },
        { text: 'Find the middle value.', tex: '\\text{median} = 16', why: 'With $7$ values, the 4th value has $3$ values on each side.' },
      ],
      answer: 'Mean $= 15$ points, median $= 16$ points.',
    },
    {
      title: 'Median of an even count, from a dot plot',
      kind: 'intermediate',
      problem: [
        { t: 'p', text: 'The dot plot shows how many video games $10$ students own. Find the mean and the median.' },
        {
          t: 'dataplot',
          spec: { kind: 'dot', min: 0, max: 9, step: 1, axisLabel: 'video games owned', values: [1, 2, 2, 3, 3, 3, 3, 4, 5, 8], ariaLabel: 'Dot plot: one dot at 1, two at 2, four at 3, one at 4, one at 5 and one at 8.' },
        },
      ],
      steps: [
        { text: 'Count the dots.', tex: '1 + 2 + 4 + 1 + 1 + 1 = 10', why: 'Each dot is one student, so there are $10$ values, even though only $6$ different numbers appear.' },
        { text: 'Find the sum using value $\\times$ frequency.', tex: '1(1) + 2(2) + 3(4) + 4(1) + 5(1) + 8(1) = 1 + 4 + 12 + 4 + 5 + 8 = 34', why: 'The four dots at $3$ add $3 + 3 + 3 + 3 = 12$. Multiplying is a shortcut for that repeated adding.' },
        { text: 'Divide for the mean.', tex: '\\bar{x} = \\frac{34}{10} = 3.4', why: 'Sum divided by the number of values (dots), not by the number of columns.' },
        { text: 'Find the median.', tex: '\\text{5th and 6th values: } 3 \\text{ and } 3, \\quad \\text{median} = \\frac{3 + 3}{2} = 3', why: 'With $10$ values, there is no single middle value. Counting from the left, dots 4, 5, 6 and 7 are at $3$.' },
      ],
      answer: 'Mean $= 3.4$ games, median $= 3$ games.',
    },
    {
      title: 'Spending on games: which center is typical?',
      kind: 'real-world',
      problem: [
        { t: 'p', text: 'Eight friends spent these amounts on games last month, in dollars: $5, 10, 15, 15, 20, 25, 30, 120$. Find the mean and the median. Which better describes what a typical friend spent?' },
        {
          t: 'dataplot',
          spec: { kind: 'dot', min: 0, max: 130, step: 10, axisLabel: 'dollars spent on games', values: [5, 10, 15, 15, 20, 25, 30, 120], ariaLabel: 'Dot plot with seven dots between 5 and 30 and one dot far to the right at 120.' },
        },
      ],
      steps: [
        { text: 'Find the mean.', tex: '\\bar{x} = \\frac{5 + 10 + 15 + 15 + 20 + 25 + 30 + 120}{8} = \\frac{240}{8} = 30', why: 'Sum of all $8$ values divided by $8$.' },
        { text: 'Find the median.', tex: '\\text{median} = \\frac{15 + 20}{2} = 17.5', why: 'The list is already in order. With $8$ values, the middle two are the 4th and 5th.' },
        { text: 'Compare with the data.', tex: '6 \\text{ of } 8 \\text{ values} < 30', why: 'Six of the eight spent less than the mean and only one spent more, so the mean does not describe a typical friend. The outlier \\$120 pulled it up.' },
        { text: 'Choose.', tex: '\\text{median} = \\$17.50', why: 'The median is resistant to the outlier. Half the friends spent less than \\$17.50 and half spent more.' },
      ],
      answer: 'Mean \\$30, median \\$17.50. The median is the better description of a typical friend, because the outlier \\$120 pulls the mean above $6$ of the $8$ values.',
    },
    {
      title: 'The middle of the list as written',
      kind: 'common-mistake',
      problem: [{ t: 'p', text: 'Jordan recorded the number of songs on $5$ friends\' playlists: $7, 3, 12, 5, 9$. Jordan says the median is $12$ "because it is in the middle." What went wrong, and what is the median?' }],
      steps: [
        { text: 'Find Jordan\'s mistake.', tex: '7, \\; 3, \\; \\underline{12}, \\; 5, \\; 9', why: '$12$ is in the middle **position** of the list as it was written, but that order is just the order the data was collected in. It is actually the largest value.' },
        { text: 'Put the values in order.', tex: '3, \\; 5, \\; 7, \\; 9, \\; 12', why: 'The median has to be the middle **value**, with as many values below it as above it.' },
        { text: 'Take the middle value.', tex: '\\text{median} = 7', why: 'There are $2$ values below $7$ and $2$ above it. Jordan\'s $12$ has $4$ values below it and none above.' },
      ],
      answer: 'Jordan did not put the data in order first. The median is $7$ songs.',
    },
    {
      title: 'The missing quiz score',
      kind: 'challenging',
      problem: [{ t: 'p', text: 'Maya\'s mean on $5$ quizzes is $85$. Four of her scores are $82, 90, 75$ and $88$. (a) What is the fifth score? (b) She takes a sixth quiz and wants her mean to stay at least $85$. What is the lowest score she can get?' }],
      steps: [
        { text: '(a) Find the total the mean requires.', tex: '5 \\times 85 = 425', why: 'Mean $=$ sum $\\div$ count, so sum $=$ mean $\\times$ count.' },
        { text: 'Add the scores you know.', tex: '82 + 90 + 75 + 88 = 335' },
        { text: 'Subtract to find the missing score.', tex: '425 - 335 = 90', why: 'The five scores must add to $425$. Check: $\\frac{82 + 90 + 75 + 88 + 90}{5} = \\frac{425}{5} = 85$.' },
        { text: '(b) Find the total needed for 6 quizzes.', tex: '6 \\times 85 = 510, \\qquad 510 - 425 = 85', why: 'To keep a mean of $85$ over $6$ quizzes she needs a total of $510$. She already has $425$, so the sixth score must be at least $85$.' },
      ],
      answer: '(a) $90$. (b) At least $85$: a score exactly equal to the mean keeps the mean the same.',
    },
  ],
  teachMeAgain: [
    {
      approach: 'visual',
      title: 'The mean is the balance point',
      blocks: [
        { t: 'p', text: 'Picture the dot plot as a seesaw, with each dot a coin of the same weight. The **mean** is where you would put the support so it balances.' },
        {
          t: 'dataplot',
          caption: 'The values 4, 6, 8, 10, 12 balance at 8.',
          spec: { kind: 'dot', min: 0, max: 16, step: 1, values: [4, 6, 8, 10, 12], ariaLabel: 'Dot plot with one dot each at 4, 6, 8, 10 and 12.' },
        },
        { t: 'p', text: 'The distances from $8$ are $-4, -2, 0, 2, 4$, and they cancel: $-4 - 2 + 0 + 2 + 4 = 0$. Now slide the $12$ out to $50$. The seesaw tips, and the balance point moves right (to $15.6$). But the **median**, the middle dot, is still $8$.' },
      ],
    },
    {
      approach: 'simpler-example',
      title: 'Three numbers first',
      blocks: [
        { t: 'p', text: 'Take $2, 4, 9$.' },
        { t: 'list', items: [
          'Mean: $\\frac{2 + 4 + 9}{3} = \\frac{15}{3} = 5$.',
          'Median: already in order, the middle one is $4$.',
          'Add a fourth value, $5$: in order $2, 4, 5, 9$. Now the median is $\\frac{4 + 5}{2} = 4.5$, and the mean is $\\frac{20}{4} = 5$.',
        ] },
        { t: 'p', text: 'Bigger data sets work exactly the same way. There are just more numbers to add and order.' },
      ],
    },
    {
      approach: 'analogy',
      title: 'Sharing pizza and lining up by height',
      blocks: [
        { t: 'p', text: '**Mean = sharing.** If $4$ friends bring $1, 2, 3$ and $6$ slices of pizza and pile them together, there are $12$ slices. Shared equally, everyone gets $3$. That is the mean.' },
        { t: 'p', text: '**Median = lining up.** Line up $5$ students from shortest to tallest. The median height is the person in the middle of the line. If the tallest student were replaced by a professional basketball player, the middle person would not change, but the "fair share" of height (the mean) would go up.' },
      ],
    },
    {
      approach: 'prerequisite',
      title: 'Refresher: dividing and finding halfway',
      blocks: [
        { t: 'list', items: [
          '**Dividing into a decimal.** $34 \\div 10 = 3.4$; $420 \\div 8 = 52.5$; $120 \\div 7 \\approx 17.14$. Keep dividing past the decimal point instead of writing a remainder.',
          '**Halfway between two numbers.** Add and divide by $2$: halfway between $15$ and $20$ is $\\frac{35}{2} = 17.5$. Halfway between $3$ and $3$ is just $3$.',
          '**Ordering decimals.** Line up the decimal points: $17.14 < 17.5$ because $0.14 < 0.50$.',
        ] },
      ],
    },
    {
      approach: 'step-by-step',
      title: 'A checklist for any data set',
      blocks: [
        { t: 'p', text: 'Example: hours of sleep for $5$ students: $7, 9, 6, 8, 7$.' },
        { t: 'list', ordered: true, items: [
          '**Count the values:** $n = 5$.',
          '**Sum:** $7 + 9 + 6 + 8 + 7 = 37$.',
          '**Mean:** $37 \\div 5 = 7.4$ hours.',
          '**Order:** $6, 7, 7, 8, 9$.',
          '**Median:** $n$ is odd, so take the middle (3rd) value: $7$ hours. (If $n$ were even, average the two middle values.)',
          '**Choose:** no value is far from the others, so the mean $7.4$ is a fine summary.',
        ] },
      ],
    },
    {
      approach: 'alternate-strategy',
      title: 'Decide the measure before you compute',
      blocks: [
        { t: 'p', text: 'Look at the data first, then pick the measure. Ask: "Is there a value far from the rest, or a long tail on one side?"' },
        {
          t: 'table',
          caption: 'Choosing a measure of center by looking.',
          headers: ['Data', 'What you see', 'Better center'],
          rows: [
            ['$12, 14, 15, 15, 16, 18$', 'all close together', 'mean'],
            ['$5, 10, 15, 15, 20, 25, 30, 120$', '$120$ is far from the rest', 'median'],
            ['house prices on one street', 'one mansion', 'median'],
          ],
        },
        { t: 'p', text: 'This also tells you which number a question about "typical" is really asking for.' },
      ],
    },
  ],
  guided: [
    { generator: 'u7.center', difficulty: 1 },
    { generator: 'u7.center', difficulty: 1 },
    { generator: 'u7.center', difficulty: 2 },
    { generator: 'u7.center', difficulty: 3 },
  ],
  independent: {
    count: 8,
    reviewCount: 2,
    mix: [
      { generator: 'u7.center', difficulty: 1, weight: 2 },
      { generator: 'u7.center', difficulty: 2, weight: 3 },
      { generator: 'u7.center', difficulty: 3, weight: 3 },
    ],
  },
  quiz: {
    items: [
      { generator: 'u7.center', difficulty: 1 },
      { generator: 'u7.center', difficulty: 2 },
      { generator: 'u7.center', difficulty: 2 },
      { generator: 'u7.center', difficulty: 2 },
      { generator: 'u7.center', difficulty: 3 },
      { generator: 'u7.center', difficulty: 3 },
    ],
  },
  summary: [
    'A statistical question expects answers that **vary** ("How many hours do students in my class usually sleep?"), and often compares groups. Define the variable with its units and how it is measured before collecting.',
    'Mean $=$ sum $\\div$ number of values: $14, 9, 22, 17, 9, 18, 16$ has mean $\\frac{105}{7} = 15$. From a dot plot or frequency table, multiply each value by its frequency and divide by the number of dots.',
    'Median $=$ the middle of the **ordered** data; with an even count, the mean of the two middle values ($30, 30, 40, 45, 50, 60, 75, 90$ has median $47.5$).',
    'Use the median for skewed data or data with an outlier, because the median is resistant and the mean is pulled toward the outlier. Use the mean for symmetric data without outliers.',
    'A missing value: the sum is mean $\\times$ count. Five scores with mean $85$ total $425$.',
  ],
  mastery: { quizPassScore: 0.8, practiceMinCorrect: 5 },
};
