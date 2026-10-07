import type { LessonContent } from '../../../core/curriculum/types';

/**
 * U7L04 Shape and Outliers (A.DSR.10.2)
 * Describing the shape of a distribution from a dot plot or a histogram (symmetric, skewed left, skewed right; name
 * the skew by the side of the TAIL, not the peak); where the mean sits compared with the median for each shape;
 * the 1.5·IQR fences Q1 - 1.5·IQR and Q3 + 1.5·IQR; identifying outliers (strictly beyond a fence); modified box plots
 * that draw outliers as dots with whiskers stopping at the last non-outlier; the effect of an outlier on the mean,
 * median, standard deviation and IQR (median and IQR are resistant, mean and standard deviation are not) (S7.04).
 * Quartiles use the unit convention: medians of the lower and upper halves, leaving the median out of both halves
 * when the count is odd. Standard deviation is the population standard deviation (divide by n).
 *
 * Math verified by hand (2026-10-07), and every value rechecked with a script: points 8, 10, 10, 12, 12, 12, 14, 14,
 * 14, 14, 16, 16, 16, 18, 18, 20 (sum 224, mean 14, median 14); games installed 1, 1, 2, 2, 2, 2, 3, 3, 3, 4, 4, 5, 6,
 * 8, 10 (sum 56, mean 3.73, median 3); quiz 2, 4, 5, 6, 7, 8, 8, 9, 9, 9, 9, 10, 10, 10, 10 (sum 116, mean 7.73,
 * median 9); gaming hours 2, 3, 4, 4, 5, 5, 6, 7, 7, 8, 21 (Q1 4, median 5, Q3 7, IQR 3, fences -0.5 and 11.5, outlier
 * 21; mean 72/11 = 6.55, SD 4.89; without 21: mean 5.1, median 5, Q1 4, Q3 7, IQR 3, SD 1.81); level times 3, 11, 12,
 * 13, 13, 14, 15, 15, 16, 18 (Q1 12, median 13.5, Q3 15, IQR 3, fences 7.5 and 19.5, outlier 3, whiskers 11 to 18);
 * earnings 40, 45, 50, 50, 55, 60, 60, 65, 250 (Q1 47.5, median 55, Q3 62.5, IQR 15, fences 25 and 85, outlier 250,
 * mean 75, SD 62.3; without 250: mean 53.125, median 52.5, IQR 60 - 47.5 = 12.5, SD 7.9); points 10, 12, 13, 14, 15,
 * 16, 17, 18, 20, 25 (Q1 13, median 15.5, Q3 18, IQR 5, fences 5.5 and 25.5; 25 is not an outlier; replacing it with
 * any value from 20 up leaves Q3 = 18, so 26 is the smallest whole number that would be one); streaming histogram
 * 12 + 10 + 8 + 5 + 3 + 2 = 40 (20th and 21st values in the 5-10 bin; midpoint mean 415/40 = 10.375); scores
 * 4, 5, 5, 6, 6, 7, 20 (Q1 5, median 6, Q3 7, IQR 2, upper fence 10, mean 53/7 = 7.57; without 20 mean = median 5.5);
 * 2, 4, 5, 7, 8, 10, 13 (Q1 4, Q3 10, IQR 6, fences -5 and 19); quiz 3, 5, 6, 7, 7, 8, 8, 8, 9, 9, 9, 9, 10, 10, 10
 * (Q1 7, median 8, Q3 9, IQR 2, fences 4 and 12, outlier 3). Every box plot five-number summary is in order and
 * every plotted value lies inside its axis; every histogram's bins touch and have whole-number counts.
 */
export const U7L04: LessonContent = {
  lessonId: 'U7L04',
  goal: 'Describe the shape of a distribution as symmetric, skewed left or skewed right, predict whether the mean or the median is bigger from the shape, use the $1.5 \\cdot \\text{IQR}$ rule to find outliers, draw them as dots on a box plot, and explain how an outlier changes the mean, median, standard deviation and IQR.',
  needToKnow: [
    { t: 'p', text: 'You already know how to find the **five-number summary** (minimum, $Q_1$, median, $Q_3$, maximum) and the **interquartile range**, $\\text{IQR} = Q_3 - Q_1$. Remember: list the values in order, find the median, then $Q_1$ and $Q_3$ are the medians of the lower and upper halves. With an odd number of values, leave the median out of both halves.' },
    { t: 'p', text: 'You also know that the **mean** is the balance point (add the values, divide by how many) and the **standard deviation** is a typical distance of the values from the mean.' },
    { t: 'callout', variant: 'tip', title: 'Quick check', text: 'For $2, 4, 5, 7, 8, 10, 13$, the median is $7$, $Q_1 = 4$, $Q_3 = 10$ and $\\text{IQR} = 6$. If that felt shaky, open **Teach Me Again** and choose the refresher.' },
  ],
  vocabulary: [
    { term: 'distribution', meaning: 'All the values of a variable and how often each one happens. A dot plot or histogram shows a distribution.' },
    { term: 'symmetric', meaning: 'The left and right sides of the graph are close to mirror images. The mean and median are about the same.' },
    { term: 'skewed right', meaning: 'Most values pile up on the left and a long **tail** stretches to the **right** (toward bigger values). The mean is usually greater than the median.' },
    { term: 'skewed left', meaning: 'Most values pile up on the right and a long **tail** stretches to the **left** (toward smaller values). The mean is usually less than the median.' },
    { term: 'outlier', meaning: 'A value that is unusually far from the rest. In this course: any value below $Q_1 - 1.5 \\cdot \\text{IQR}$ or above $Q_3 + 1.5 \\cdot \\text{IQR}$.' },
    { term: 'fences', meaning: 'The cutoffs $Q_1 - 1.5 \\cdot \\text{IQR}$ (lower fence) and $Q_3 + 1.5 \\cdot \\text{IQR}$ (upper fence). Values beyond a fence are outliers.' },
    { term: 'resistant', meaning: 'A measure that barely changes when an outlier is added or removed. The median and IQR are resistant; the mean and standard deviation are not.' },
  ],
  instruction: [
    { t: 'p', text: '### Shape: where do the values pile up?' },
    { t: 'p', text: 'The **shape** of a distribution describes how the values are spread along the number line. There are three shapes to know.' },
    {
      t: 'dataplot',
      caption: 'Symmetric: points a player scored in 16 basketball games. The two sides are mirror images around 14.',
      spec: {
        kind: 'dot',
        min: 6,
        max: 22,
        step: 2,
        axisLabel: 'Points scored in a game',
        values: [8, 10, 10, 12, 12, 12, 14, 14, 14, 14, 16, 16, 16, 18, 18, 20],
        ariaLabel: 'Dot plot of 16 values: one dot at 8, two at 10, three at 12, four at 14, three at 16, two at 18 and one at 20. The stacks rise to a peak at 14 and fall evenly on both sides.',
      },
    },
    {
      t: 'dataplot',
      caption: 'Skewed right: number of mobile games installed on 15 students\' phones. Most values are small, and a tail stretches to the right.',
      spec: {
        kind: 'dot',
        min: 0,
        max: 11,
        step: 1,
        axisLabel: 'Games installed',
        values: [1, 1, 2, 2, 2, 2, 3, 3, 3, 4, 4, 5, 6, 8, 10],
        ariaLabel: 'Dot plot of 15 values: two dots at 1, four at 2, three at 3, two at 4, and one each at 5, 6, 8 and 10. The values pile up on the left and thin out in a long tail to the right.',
      },
    },
    {
      t: 'dataplot',
      caption: 'Skewed left: scores on a 10-point quiz for 15 students. Most scores are high, and a tail stretches to the left.',
      spec: {
        kind: 'dot',
        min: 0,
        max: 10,
        step: 1,
        axisLabel: 'Quiz score (out of 10)',
        values: [2, 4, 5, 6, 7, 8, 8, 9, 9, 9, 9, 10, 10, 10, 10],
        ariaLabel: 'Dot plot of 15 values: one dot each at 2, 4, 5, 6 and 7, two at 8, four at 9 and four at 10. The values pile up on the right and thin out in a long tail to the left.',
      },
    },
    { t: 'callout', variant: 'warning', title: 'Name the skew by the tail', text: 'The direction of the skew is the side where the **tail** is, not the side where the peak is. A pile on the left with a long tail on the right is skewed **right**. Think: "the tail tells the tale."' },
    { t: 'p', text: 'Histograms show shape the same way. The bars are the stacks of dots.' },
    {
      t: 'dataplot',
      caption: 'Skewed right: hours of video streamed last week by 40 students. The tallest bars are on the left; the tail is on the right.',
      spec: {
        kind: 'histogram',
        bins: [
          { from: 0, to: 5, count: 12 },
          { from: 5, to: 10, count: 10 },
          { from: 10, to: 15, count: 8 },
          { from: 15, to: 20, count: 5 },
          { from: 20, to: 25, count: 3 },
          { from: 25, to: 30, count: 2 },
        ],
        xLabel: 'Hours streamed per week',
        yLabel: 'Number of students',
        yStep: 2,
        ariaLabel: 'Histogram with bins of width 5 hours from 0 to 30. Counts: 12, 10, 8, 5, 3, 2. The bars get shorter from left to right.',
      },
    },
    {
      t: 'dataplot',
      caption: 'Roughly symmetric: reaction times of 32 players in a game. The bars rise to a peak in the middle and fall evenly.',
      spec: {
        kind: 'histogram',
        bins: [
          { from: 200, to: 220, count: 3 },
          { from: 220, to: 240, count: 7 },
          { from: 240, to: 260, count: 12 },
          { from: 260, to: 280, count: 7 },
          { from: 280, to: 300, count: 3 },
        ],
        xLabel: 'Reaction time (milliseconds)',
        yLabel: 'Number of players',
        yStep: 2,
        ariaLabel: 'Histogram with bins of width 20 milliseconds from 200 to 300. Counts: 3, 7, 12, 7, 3. The tallest bar is in the middle and the two sides match.',
      },
    },
    { t: 'p', text: '### Shape tells you about the mean and the median' },
    { t: 'p', text: 'The median is the middle value, so a few far-away values do not move it much. The mean is the **balance point**, so values far out in a tail pull it toward the tail.' },
    {
      t: 'table',
      caption: 'The three dot plots above. The mean is pulled toward the tail.',
      headers: ['Data', 'Shape', 'Mean', 'Median', 'Compare'],
      rows: [
        ['Points scored', 'symmetric', '$224 \\div 16 = 14$', '$14$', 'mean $=$ median'],
        ['Games installed', 'skewed right', '$56 \\div 15 \\approx 3.7$', '$3$', 'mean $>$ median'],
        ['Quiz scores', 'skewed left', '$116 \\div 15 \\approx 7.7$', '$9$', 'mean $<$ median'],
      ],
    },
    { t: 'callout', variant: 'why', title: 'Why the mean follows the tail', text: 'The mean uses the actual size of every value. In the games data, the $8$ and the $10$ add a lot to the sum, which raises the mean, but they are still just "two values above the middle" to the median. So for skewed data the median gives a better picture of a typical value, and we report the median and IQR instead of the mean and standard deviation.' },
    { t: 'p', text: '### Outliers and the 1.5 · IQR rule' },
    { t: 'p', text: 'An **outlier** is a value that is unusually far from the rest. "It looks far" is not a rule, so statisticians use **fences** built from the IQR:' },
    { t: 'math', tex: '\\text{lower fence} = Q_1 - 1.5 \\cdot \\text{IQR} \\qquad \\text{upper fence} = Q_3 + 1.5 \\cdot \\text{IQR}' },
    { t: 'p', text: 'Any value **below** the lower fence or **above** the upper fence is an outlier. A value exactly on a fence is not an outlier.' },
    { t: 'p', text: 'Eleven students reported how many hours they played video games last week: $2, 3, 4, 4, 5, 5, 6, 7, 7, 8, 21$.' },
    { t: 'list', ordered: true, items: [
      'Median: the 6th of 11 values, $5$.',
      'Lower half $2, 3, 4, 4, 5$ gives $Q_1 = 4$. Upper half $6, 7, 7, 8, 21$ gives $Q_3 = 7$.',
      '$\\text{IQR} = 7 - 4 = 3$, so $1.5 \\cdot \\text{IQR} = 4.5$.',
      'Lower fence: $4 - 4.5 = -0.5$. Upper fence: $7 + 4.5 = 11.5$.',
      'Nothing is below $-0.5$. Only $21$ is above $11.5$, so $21$ is the one outlier.',
    ] },
    { t: 'p', text: '### Modified box plots' },
    { t: 'p', text: 'A box plot shows an outlier as a separate **dot**. The whisker stops at the last value that is **not** an outlier. Here the upper whisker ends at $8$, not $21$.' },
    {
      t: 'dataplot',
      caption: 'Gaming hours with the outlier drawn as a dot. The whiskers run from 2 to 8, the last values inside the fences.',
      spec: {
        kind: 'box',
        min: 0,
        max: 22,
        step: 2,
        axisLabel: 'Hours of video games last week',
        boxes: [{ min: 2, q1: 4, median: 5, q3: 7, max: 8, outliers: [21] }],
        ariaLabel: 'Box plot with lower whisker from 2 to 4, box from 4 to 7 with the median at 5, upper whisker from 7 to 8, and a separate dot at 21.',
      },
    },
    { t: 'p', text: '### What an outlier does to each measure' },
    {
      t: 'table',
      caption: 'Gaming hours with and without the outlier 21 (standard deviations rounded to the nearest hundredth).',
      headers: ['Measure', 'With 21', 'Without 21', 'Changed a lot?'],
      rows: [
        ['Mean', '$72 \\div 11 \\approx 6.55$', '$51 \\div 10 = 5.1$', 'yes'],
        ['Median', '$5$', '$5$', 'no'],
        ['Standard deviation', '$\\approx 4.89$', '$\\approx 1.81$', 'yes'],
        ['IQR', '$3$', '$3$', 'no'],
      ],
    },
    { t: 'p', text: 'The mean and standard deviation use every value\'s size, so one extreme value pulls them a lot. The median and IQR depend only on the **middle** of the ordered list, so they barely move (here they did not move at all). We say the median and IQR are **resistant** to outliers.' },
    { t: 'callout', variant: 'tip', title: 'Do not just delete outliers', text: 'An outlier is a signal to look closer. It might be a typing mistake (someone meant $2.1$ hours), or it might be real (one student played a lot during a break). Only remove a value if it is an error, and say so when you report your results.' },
    { t: 'callout', variant: 'realworld', title: 'Where this shows up', text: 'Prices, incomes, followers and streaming hours are usually skewed right with high outliers. That is why news reports give the **median** home price or the **median** income, not the mean.' },
  ],
  examples: [
    {
      title: 'Shape from a dot plot',
      kind: 'introductory',
      problem: [
        { t: 'p', text: 'The dot plot shows the scores of 15 students on a 10-point quiz. Describe the shape. Then predict whether the mean or the median is greater, and check.' },
        {
          t: 'dataplot',
          caption: 'Quiz scores of 15 students.',
          spec: {
            kind: 'dot',
            min: 0,
            max: 10,
            step: 1,
            axisLabel: 'Quiz score (out of 10)',
            values: [2, 4, 5, 6, 7, 8, 8, 9, 9, 9, 9, 10, 10, 10, 10],
            ariaLabel: 'Dot plot of 15 values: one dot each at 2, 4, 5, 6 and 7, two at 8, four at 9 and four at 10.',
          },
        },
      ],
      steps: [
        { text: 'Find where the values pile up and where the tail is.', why: 'Most dots are stacked at $8$, $9$ and $10$. A few lonely dots ($2, 4, 5, 6$) trail off to the **left**.' },
        { text: 'Name the shape by the tail.', tex: '\\text{skewed left}', why: 'The skew is named for the side of the tail, which is the left.' },
        { text: 'Predict.', why: 'The low scores in the tail pull the mean down, so the mean should be less than the median.' },
        { text: 'Check the median.', tex: '\\text{median} = \\text{8th of 15 values} = 9', why: 'In order: $2, 4, 5, 6, 7, 8, 8, 9, \\dots$; the 8th value is $9$.' },
        { text: 'Check the mean.', tex: '\\frac{2 + 4 + 5 + 6 + 7 + 8 + 8 + 9 \\cdot 4 + 10 \\cdot 4}{15} = \\frac{116}{15} \\approx 7.7', why: 'Four $9$s and four $10$s make $36 + 40 = 76$; the rest add to $40$.' },
      ],
      answer: 'Skewed left. The mean (about $7.7$) is less than the median ($9$), as the shape predicts.',
    },
    {
      title: 'Fences and a modified box plot',
      kind: 'intermediate',
      problem: [
        { t: 'p', text: 'Ten players timed how many minutes it took them to beat the same game level: $3, 11, 12, 13, 13, 14, 15, 15, 16, 18$. Find the fences, identify any outliers, and check that the box plot below is drawn correctly.' },
        { t: 'dataplot', spec: { kind: 'box', min: 0, max: 20, step: 2, axisLabel: 'Minutes to beat the level', boxes: [{ min: 11, q1: 12, median: 13.5, q3: 15, max: 18, outliers: [3] }], ariaLabel: 'Box plot: whiskers from 11 to 18, box from 12 to 15, median 13.5, and a separate dot at 3.' }, caption: 'The outlier is drawn as a dot, and the lower whisker stops at 11.' },
      ],
      steps: [
        { text: 'Find the median and quartiles.', tex: '\\text{median} = \\frac{13 + 14}{2} = 13.5, \\quad Q_1 = 12, \\quad Q_3 = 15', why: 'With $10$ values the median is the mean of the 5th and 6th values. The lower half $3, 11, 12, 13, 13$ has middle $12$; the upper half $14, 15, 15, 16, 18$ has middle $15$.' },
        { text: 'Find the IQR and $1.5 \\cdot \\text{IQR}$.', tex: '\\text{IQR} = 15 - 12 = 3, \\quad 1.5 \\cdot 3 = 4.5', why: 'The fences are built from the IQR.' },
        { text: 'Find the fences.', tex: '12 - 4.5 = 7.5 \\qquad 15 + 4.5 = 19.5', why: 'Lower fence $= Q_1 - 1.5 \\cdot \\text{IQR}$; upper fence $= Q_3 + 1.5 \\cdot \\text{IQR}$.' },
        { text: 'Check each end of the list.', why: '$3 < 7.5$, so $3$ is an outlier. The next value, $11$, is inside. On the high side, $18 < 19.5$, so there are no high outliers.' },
        { text: 'Check the box plot.', why: 'The lower whisker stops at $11$, the smallest value that is not an outlier, and $3$ is drawn as a dot. (Maybe that player knew a shortcut!)' },
      ],
      answer: 'Fences $7.5$ and $19.5$; the only outlier is $3$ minutes. Box from $12$ to $15$ with median $13.5$, whiskers from $11$ to $18$, and a dot at $3$.',
    },
    {
      title: 'One big paycheck',
      kind: 'real-world',
      problem: [
        { t: 'p', text: 'Nine teens recorded what they earned last week (in dollars): $40, 45, 50, 50, 55, 60, 60, 65, 250$. The $250$ came from a teen who worked every day of spring break. Is $250$ an outlier? How do the mean, median, standard deviation and IQR change if it is removed?' },
        {
          t: 'dataplot',
          caption: 'Weekly earnings of nine teens, with the outlier drawn as a dot.',
          spec: {
            kind: 'box',
            min: 20,
            max: 260,
            step: 20,
            axisLabel: 'Earnings last week (dollars)',
            boxes: [{ min: 40, q1: 47.5, median: 55, q3: 62.5, max: 65, outliers: [250] }],
            ariaLabel: 'Box plot with whiskers from 40 to 65, a box from 47.5 to 62.5 with the median at 55, and a separate dot at 250.',
          },
        },
      ],
      steps: [
        { text: 'Find the quartiles and IQR.', tex: 'Q_1 = \\frac{45 + 50}{2} = 47.5, \\quad \\text{median} = 55, \\quad Q_3 = \\frac{60 + 65}{2} = 62.5, \\quad \\text{IQR} = 15', why: 'With $9$ values the median is the 5th, $55$. Leave it out: the lower half is $40, 45, 50, 50$ and the upper half is $60, 60, 65, 250$.' },
        { text: 'Check the upper fence.', tex: '62.5 + 1.5 \\cdot 15 = 62.5 + 22.5 = 85', why: '$250 > 85$, so $250$ is an outlier. (The lower fence is $47.5 - 22.5 = 25$, and no value is below it.)' },
        { text: 'Compare the mean with and without $250$.', tex: '\\frac{675}{9} = 75 \\quad \\text{vs.} \\quad \\frac{425}{8} \\approx 53.13', why: 'A "typical" pay of \\$75 is more than 8 of the 9 teens earned. One value pulled the mean up by about \\$22.' },
        { text: 'Compare the median and IQR.', tex: '\\text{median: } 55 \\to 52.5, \\qquad \\text{IQR: } 15 \\to 60 - 47.5 = 12.5', why: 'Without $250$ there are $8$ values: the median is $\\frac{50 + 55}{2} = 52.5$, $Q_1 = 47.5$ and $Q_3 = 60$. They change only a little because they depend on the middle of the list.' },
        { text: 'Compare the standard deviation.', tex: '\\approx 62.32 \\quad \\text{vs.} \\quad \\approx 7.88', why: 'The standard deviation measures distance from the mean, and $250$ is $175$ dollars from the mean, so it inflates the SD enormously.' },
      ],
      answer: '$250$ is an outlier (upper fence \\$85). Removing it drops the mean from \\$75 to about \\$53.13 and the SD from about \\$62.32 to about \\$7.88, but the median only moves from \\$55 to \\$52.50 and the IQR from \\$15 to \\$12.50. For data like this, report the median and IQR.',
    },
    {
      title: 'A common mistake: naming the skew by the peak',
      kind: 'common-mistake',
      problem: [
        { t: 'p', text: 'Jordan looked at the streaming histogram and said: "The tallest bars are on the left, so it is skewed left, and the mean should be less than the median." What went wrong?' },
        {
          t: 'dataplot',
          caption: 'Hours of video streamed last week by 40 students.',
          spec: {
            kind: 'histogram',
            bins: [
              { from: 0, to: 5, count: 12 },
              { from: 5, to: 10, count: 10 },
              { from: 10, to: 15, count: 8 },
              { from: 15, to: 20, count: 5 },
              { from: 20, to: 25, count: 3 },
              { from: 25, to: 30, count: 2 },
            ],
            xLabel: 'Hours streamed per week',
            yLabel: 'Number of students',
            yStep: 2,
            ariaLabel: 'Histogram with bins of width 5 hours from 0 to 30. Counts: 12, 10, 8, 5, 3, 2.',
          },
        },
      ],
      steps: [
        { text: 'Find the tail.', why: 'The bars shrink as you move right: $12, 10, 8, 5, 3, 2$. The long thin part (the tail) stretches to the **right**, toward $30$ hours.' },
        { text: 'Name the shape correctly.', tex: '\\text{skewed right}', why: 'Skew is named for the tail, not the peak. Jordan named it for the peak.' },
        { text: 'Locate the median.', why: 'With $40$ students the median is between the 20th and 21st values. The first bin holds $12$ students and the first two hold $12 + 10 = 22$, so the median is in the $5$ to $10$ hour bin.' },
        { text: 'Estimate the mean.', tex: '\\frac{2.5(12) + 7.5(10) + 12.5(8) + 17.5(5) + 22.5(3) + 27.5(2)}{40} = \\frac{415}{40} \\approx 10.4', why: 'Using the middle of each bin is a fair estimate. The heavy streamers in the tail pull the mean above $10$, past the median\'s bin.' },
      ],
      answer: 'The histogram is skewed **right**, so the estimated mean (about $10.4$ hours) is **greater** than the median (between $5$ and $10$ hours). Name the skew by the tail.',
    },
    {
      title: 'Far away, but not an outlier',
      kind: 'challenging',
      problem: [
        { t: 'p', text: 'A player\'s points in her last 10 rounds of an online trivia game were $10, 12, 13, 14, 15, 16, 17, 18, 20, 25$. (a) Is $25$ an outlier? (b) If $25$ were replaced by a bigger whole number, what is the smallest value that would be an outlier?' },
      ],
      steps: [
        { text: 'Find the quartiles.', tex: 'Q_1 = 13, \\quad \\text{median} = \\frac{15 + 16}{2} = 15.5, \\quad Q_3 = 18', why: 'Lower half $10, 12, 13, 14, 15$; upper half $16, 17, 18, 20, 25$.' },
        { text: 'Find the upper fence.', tex: '\\text{IQR} = 5, \\quad 18 + 1.5 \\cdot 5 = 25.5', why: 'The lower fence is $13 - 7.5 = 5.5$, and $10$ is above it.' },
        { text: '(a) Compare.', why: '$25 < 25.5$, so $25$ is **not** an outlier, even though it is $5$ points away from the next value. The rule decides, not your eyes.' },
        { text: '(b) Check that the fence stays put.', why: 'If the last value is replaced by any number $20$ or more, it is still the largest value. The upper half is still $16, 17, 18, 20, \\text{(new value)}$, so $Q_3 = 18$, the IQR is $5$ and the upper fence is still $25.5$.' },
        { text: 'Find the smallest whole number above the fence.', tex: '26 > 25.5', why: 'An outlier must be strictly above $25.5$, and the first whole number above it is $26$.' },
      ],
      answer: '(a) No: the upper fence is $25.5$ and $25 < 25.5$, so the box plot whisker reaches all the way to $25$. (b) $26$.',
    },
  ],
  teachMeAgain: [
    {
      approach: 'visual',
      title: 'Follow the tail',
      blocks: [
        { t: 'p', text: 'Picture the graph as an animal: the big hump is its body and the thin part is its tail. The **tail** points the way.' },
        {
          t: 'dataplot',
          caption: 'Test scores of 40 students: the body is on the right and the tail points left, so it is skewed left.',
          spec: {
            kind: 'histogram',
            bins: [
              { from: 50, to: 60, count: 2 },
              { from: 60, to: 70, count: 4 },
              { from: 70, to: 80, count: 8 },
              { from: 80, to: 90, count: 14 },
              { from: 90, to: 100, count: 12 },
            ],
            xLabel: 'Test score',
            yLabel: 'Number of students',
            yStep: 2,
            ariaLabel: 'Histogram with bins of width 10 from 50 to 100. Counts: 2, 4, 8, 14, 12. Most bars are tall on the right and the bars shrink toward the left.',
          },
        },
        { t: 'list', items: [
          'Tail points **left** (toward small numbers): skewed left. The few low scores drag the mean below the median.',
          'Tail points **right** (toward big numbers): skewed right. The few big values pull the mean above the median.',
          'No tail, both sides match: symmetric. The mean and median are about equal.',
        ] },
      ],
    },
    {
      approach: 'simpler-example',
      title: 'Seven scores and one big one',
      blocks: [
        { t: 'p', text: 'Seven friends played a mini-game. Their scores: $4, 5, 5, 6, 6, 7, 20$.' },
        { t: 'list', ordered: true, items: [
          'Median: the 4th value, $6$. $Q_1 = 5$ (from $4, 5, 5$) and $Q_3 = 7$ (from $6, 7, 20$).',
          '$\\text{IQR} = 7 - 5 = 2$, so $1.5 \\cdot \\text{IQR} = 3$.',
          'Upper fence: $7 + 3 = 10$. Since $20 > 10$, $20$ is an outlier.',
          'The mean is $53 \\div 7 \\approx 7.6$, bigger than the median $6$, because $20$ pulls it up. Without $20$, the mean and median are both $5.5$.',
        ] },
      ],
    },
    {
      approach: 'analogy',
      title: 'A pro player joins the group chat',
      blocks: [
        { t: 'p', text: 'Five friends each have about $200$ followers. Then a gamer with $2$ million followers joins their group.' },
        { t: 'p', text: 'The **mean** number of followers jumps to over $300{,}000$, which describes nobody in the group. The **median** barely moves, because it only asks "who is in the middle of the line?" and the pro just stands at the end.' },
        { t: 'p', text: 'That is what "resistant" means. The median and IQR look at positions in the ordered list, so one extreme person cannot drag them far. The mean and standard deviation use every value\'s size, so one extreme value changes them a lot.' },
      ],
    },
    {
      approach: 'prerequisite',
      title: 'Refresher: quartiles and the IQR',
      blocks: [
        { t: 'p', text: 'Use the list $2, 4, 5, 7, 8, 10, 13$ (already in order).' },
        { t: 'list', ordered: true, items: [
          'The median is the middle value: the 4th of 7, which is $7$.',
          'Leave the median out. Lower half: $2, 4, 5$, so $Q_1 = 4$. Upper half: $8, 10, 13$, so $Q_3 = 10$.',
          '$\\text{IQR} = Q_3 - Q_1 = 10 - 4 = 6$. This is the width of the box.',
          'Fences: $4 - 1.5(6) = -5$ and $10 + 1.5(6) = 19$. Every value is between them, so there are no outliers.',
        ] },
        { t: 'p', text: 'With an even number of values, split the list exactly in half; the median is the mean of the two middle values.' },
      ],
    },
    {
      approach: 'step-by-step',
      title: 'An outlier checklist',
      blocks: [
        { t: 'p', text: 'Quiz scores out of 10 for 15 students: $3, 5, 6, 7, 7, 8, 8, 8, 9, 9, 9, 9, 10, 10, 10$.' },
        { t: 'list', ordered: true, items: [
          '**Order** the data (done).',
          '**Median**: the 8th value, $8$.',
          '**Quartiles**: lower half $3, 5, 6, 7, 7, 8, 8$ gives $Q_1 = 7$; upper half $9, 9, 9, 9, 10, 10, 10$ gives $Q_3 = 9$.',
          '**IQR**: $9 - 7 = 2$; times $1.5$ is $3$.',
          '**Fences**: $7 - 3 = 4$ and $9 + 3 = 12$.',
          '**Check**: $3 < 4$, so $3$ is an outlier. No score is above $12$.',
          '**Box plot**: lower whisker stops at $5$, a dot at $3$.',
        ] },
      ],
    },
    {
      approach: 'alternate-strategy',
      title: 'Count box lengths',
      blocks: [
        { t: 'p', text: 'The IQR is the length of the box. The rule says a value is an outlier if it is more than $1.5$ **box lengths** past the edge of the box.' },
        { t: 'p', text: 'For the gaming hours ($Q_1 = 4$, $Q_3 = 7$, box length $3$), the value $21$ is $21 - 7 = 14$ hours past the box. That is $14 \\div 3 \\approx 4.7$ box lengths, far more than $1.5$, so $21$ is an outlier.' },
        { t: 'p', text: 'You can also check shape with numbers: if the mean is noticeably bigger than the median, expect a tail on the right; if it is noticeably smaller, expect a tail on the left. For the games-installed data, mean $\\approx 3.7 >$ median $3$, and the dot plot is indeed skewed right.' },
      ],
    },
  ],
  guided: [
    { generator: 'u7.shape-outliers', difficulty: 1 },
    { generator: 'u7.shape-outliers', difficulty: 1 },
    { generator: 'u7.shape-outliers', difficulty: 2 },
    { generator: 'u7.shape-outliers', difficulty: 2 },
  ],
  independent: {
    count: 8,
    reviewCount: 2,
    mix: [
      { generator: 'u7.shape-outliers', difficulty: 1, weight: 1 },
      { generator: 'u7.shape-outliers', difficulty: 2, weight: 2 },
      { generator: 'u7.shape-outliers', difficulty: 3, weight: 1 },
    ],
  },
  quiz: {
    items: [
      { generator: 'u7.shape-outliers', difficulty: 1 },
      { generator: 'u7.shape-outliers', difficulty: 2 },
      { generator: 'u7.shape-outliers', difficulty: 2 },
      { generator: 'u7.shape-outliers', difficulty: 2 },
      { generator: 'u7.shape-outliers', difficulty: 3 },
      { generator: 'u7.shape-outliers', difficulty: 3 },
    ],
  },
  summary: [
    'Shape is symmetric, skewed left or skewed right. Name the skew by the side of the **tail**, not the peak.',
    'Symmetric: mean $\\approx$ median. Skewed right: mean usually greater than median. Skewed left: mean usually less than median.',
    'Fences: $Q_1 - 1.5 \\cdot \\text{IQR}$ and $Q_3 + 1.5 \\cdot \\text{IQR}$. A value below the lower fence or above the upper fence is an outlier; a value exactly on a fence is not.',
    'Box plots draw outliers as dots, and the whiskers stop at the last values that are not outliers.',
    'An outlier changes the mean and standard deviation a lot, but the median and IQR are resistant. For skewed data or data with outliers, report the median and IQR.',
  ],
  mastery: { quizPassScore: 0.8, practiceMinCorrect: 5 },
};
