import type { LessonContent } from '../../../core/curriculum/types';

/**
 * U7L05 Comparing Distributions (A.DSR.10.1, A.DSR.10.2, A.MP.3)
 * Comparing two groups from parallel box plots, dot plots and summary tables: check shape and outliers first, then
 * choose the measures (both roughly symmetric with no outliers: mean and standard deviation; either one skewed or
 * with an outlier: median and IQR for BOTH groups); compare center AND spread with numbers, units and context; the
 * group with the smaller spread is more consistent; overlap means the difference is a tendency, not a rule; answering
 * a statistical investigative question that compares two groups, without claiming cause and effect (S7.05).
 * Quartiles use the unit convention (medians of the halves, median left out when the count is odd); outliers use the
 * 1.5·IQR fences; standard deviation is the population standard deviation (divide by n).
 *
 * Math verified by hand (2026-10-07), and every value rechecked with a script: battery Brand A 14, 15, 16, 16, 17,
 * 18, 18, 19, 20, 21, 22 (14, 16, 18, 20, 22; IQR 4; fences 10 and 26) and Brand B 9, 11, 13, 14, 15, 16, 17, 19, 21,
 * 23, 25 (9, 13, 16, 21, 25; IQR 8; fences 1 and 33); 9 of 11 Brand A phones and 6 of 11 Brand B phones last at least
 * 16 hours; players 10, 12, 14, 14, 16, 16, 18, 20 (mean 120/8 = 15, SD 3) and 6, 9, 12, 15, 15, 18, 21, 24 (mean 15,
 * SD 5.61; fences -3 and 33); classes 62, 68, 70, 74, 76, 80, 82, 84, 86, 90, 95 (62, 70, 80, 86, 95; IQR 16; fences
 * 46 and 110) and 72, 76, 78, 80, 82, 85, 86, 87, 88, 90, 94 (72, 78, 85, 88, 94; IQR 10; fences 63 and 103);
 * allowances 5, 8, 10, 10, 12, 12, 14, 15, 15, 20 (Q1 10, median 12, Q3 15, IQR 5, mean 12.1, fences 2.5 and 22.5)
 * and 0, 10, 15, 15, 20, 20, 25, 25, 30, 60 (Q1 15, median 20, Q3 25, IQR 10, mean 22, fences 0 and 40, outlier 60,
 * 0 is on the fence so not an outlier); download speeds X 34, 37, 39, 40, 41, 42, 42, 43, 44, 45, 47, 50 (mean 42,
 * SD 4.14, median 42, IQR 44.5 - 39.5 = 5, fences 32 and 52) and Y 20, 26, 30, 32, 34, 35, 36, 38, 40, 42, 46, 53
 * (mean 36, SD 8.46, median 35.5, IQR 41 - 31 = 10, fences 16 and 56); purchases A 0, 0, 5, 5, 10, 10, 15, 20, 90
 * (mean 155/9 = 17.22, SD 26.47, Q1 2.5, median 10, Q3 17.5, IQR 15, upper fence 40, outlier 90) and B 5, 10, 10, 15,
 * 15, 20, 20, 25, 30 (mean 150/9 = 16.67, SD 7.45, Q1 10, median 15, Q3 22.5, IQR 12.5, fences -8.75 and 41.25);
 * sleep gamers 5.5, 6, 6, 6.5, 6.5, 7, 7, 7.5, 7.5, 8, 9.5 (5.5, 6, 7, 7.5, 9.5; IQR 1.5; fences 3.75 and 9.75) and
 * non-gamers 5, 7, 7.5, 8, 8, 8, 8.5, 8.5, 9, 9, 9.5 (Q1 7.5, median 8, Q3 9, IQR 1.5, fences 5.25 and 11.25, outlier
 * 5, whiskers 7 to 9.5); 9 of 11 gamers sleep 7.5 hours or less and 9 of 11 non-gamers sleep 7.5 hours or more;
 * Red 3, 4, 5, 6, 7 (mean 5, SD 1.41) and Blue 2, 6, 8, 10, 14 (mean 8, SD 4). Every box plot five-number summary is
 * in order and every plotted value lies inside its axis.
 */
export const U7L05: LessonContent = {
  lessonId: 'U7L05',
  goal: 'Compare two groups using parallel box plots, dot plots or summary tables: choose the right measures (median and IQR, or mean and standard deviation), compare both center and spread with numbers and units, say which group is more consistent, and use the comparison to answer a statistical question.',
  needToKnow: [
    { t: 'p', text: 'You can already find and read the **center** of a data set (mean or median) and its **spread** (IQR or standard deviation), and you can describe its **shape** and check for **outliers** with the fences $Q_1 - 1.5 \\cdot \\text{IQR}$ and $Q_3 + 1.5 \\cdot \\text{IQR}$.' },
    { t: 'p', text: 'Remember which measures are **resistant**: the median and IQR barely change when there is an outlier, but the mean and standard deviation can change a lot.' },
    { t: 'callout', variant: 'tip', title: 'Quick check', text: 'A data set is skewed right with one high outlier. Which measure of center describes a typical value better, the mean or the median? (The median, because the outlier pulls the mean toward the tail.) If that felt shaky, open **Teach Me Again** and choose the refresher.' },
  ],
  vocabulary: [
    { term: 'parallel box plots', meaning: 'Two or more box plots drawn on the same number line so the groups can be compared directly.' },
    { term: 'center', meaning: 'A typical value of the data: the median or the mean.' },
    { term: 'spread (variability)', meaning: 'How far apart the values are: the IQR or the standard deviation. The range is a rough measure because it depends only on the two most extreme values.' },
    { term: 'consistent', meaning: 'Having little spread. The group with the smaller IQR (or smaller standard deviation) is more consistent.' },
    { term: 'statistical investigative question', meaning: 'A question answered by collecting data that vary, such as "Do Brand A phones tend to have longer battery life than Brand B phones?"' },
  ],
  instruction: [
    { t: 'p', text: '### Two groups on one number line' },
    { t: 'p', text: 'A tech reviewer tested $11$ phones of Brand A and $11$ phones of Brand B, recording the hours each battery lasted while streaming video. **Parallel box plots** put both groups on the same scale.' },
    {
      t: 'dataplot',
      caption: 'Battery life while streaming, 11 phones of each brand. Neither group has outliers.',
      spec: {
        kind: 'box',
        min: 8,
        max: 26,
        step: 2,
        axisLabel: 'Battery life (hours)',
        boxes: [
          { label: 'Brand A', min: 14, q1: 16, median: 18, q3: 20, max: 22 },
          { label: 'Brand B', min: 9, q1: 13, median: 16, q3: 21, max: 25 },
        ],
        ariaLabel: 'Two box plots on an axis from 8 to 26 hours. Brand A: minimum 14, Q1 16, median 18, Q3 20, maximum 22. Brand B: minimum 9, Q1 13, median 16, Q3 21, maximum 25.',
      },
    },
    {
      t: 'table',
      caption: 'Read from the box plots.',
      headers: ['Brand', 'Min', '$Q_1$', 'Median', '$Q_3$', 'Max', 'IQR'],
      rows: [
        ['A', '$14$', '$16$', '$18$', '$20$', '$22$', '$20 - 16 = 4$'],
        ['B', '$9$', '$13$', '$16$', '$21$', '$25$', '$21 - 13 = 8$'],
      ],
    },
    { t: 'p', text: 'A complete comparison talks about **center and spread**:' },
    { t: 'list', items: [
      '**Center:** the median battery life of Brand A ($18$ hours) is $2$ hours more than that of Brand B ($16$ hours).',
      '**Spread:** Brand A\'s IQR ($4$ hours) is half of Brand B\'s ($8$ hours), so Brand A\'s battery life is **more consistent**. Brand B has both the shortest and the longest battery lives.',
    ] },
    { t: 'callout', variant: 'warning', title: 'Overlap means "tends to," not "always"', text: 'The boxes overlap a lot, so plenty of Brand B phones outlast plenty of Brand A phones. Say "Brand A phones **tend to** last longer," not "every Brand A phone lasts longer."' },
    { t: 'p', text: '### Choose the measures first' },
    {
      t: 'table',
      caption: 'Use the same measures for both groups so the comparison is fair.',
      headers: ['If ...', 'Compare centers with', 'Compare spreads with'],
      rows: [
        ['both groups are roughly symmetric with no outliers', 'the means', 'the standard deviations'],
        ['either group is skewed or has an outlier', 'the medians', 'the IQRs'],
      ],
    },
    { t: 'p', text: 'A box plot shows only the five-number summary, so from box plots we can compare only medians and IQRs. When we have the data and both groups are roughly symmetric with no outliers, the mean and standard deviation are the right choice, because they use every value.' },
    { t: 'p', text: '### Same center, different spread' },
    { t: 'p', text: 'Two basketball players each scored a total of $120$ points over $8$ games. Both dot plots are roughly symmetric with no outliers, so we compare means and standard deviations.' },
    {
      t: 'dataplot',
      caption: 'Player 1: points in 8 games. Mean 15, standard deviation 3.',
      spec: {
        kind: 'dot',
        min: 4,
        max: 26,
        step: 2,
        axisLabel: 'Player 1 points per game',
        values: [10, 12, 14, 14, 16, 16, 18, 20],
        ariaLabel: 'Dot plot of 8 values: one dot at 10, one at 12, two at 14, two at 16, one at 18 and one at 20.',
      },
    },
    {
      t: 'dataplot',
      caption: 'Player 2: points in 8 games. Mean 15, standard deviation about 5.6.',
      spec: {
        kind: 'dot',
        min: 4,
        max: 26,
        step: 2,
        axisLabel: 'Player 2 points per game',
        values: [6, 9, 12, 15, 15, 18, 21, 24],
        ariaLabel: 'Dot plot of 8 values: one dot each at 6, 9, 12, 18, 21 and 24, and two dots at 15.',
      },
    },
    { t: 'p', text: 'Both means are $120 \\div 8 = 15$ points per game, so neither player scores more on average. Player 1\'s standard deviation is $3$ points and Player 2\'s is about $5.6$ points, so **Player 1 is more consistent**: her scores are typically closer to $15$. If a coach needs a dependable scorer, that matters, even though the centers are equal.' },
    { t: 'p', text: '### Writing a full comparison' },
    { t: 'p', text: 'A strong comparison has four parts:' },
    { t: 'list', ordered: true, items: [
      'Name the measures you chose and why (shape and outliers).',
      'Compare the **centers** with numbers and units, in context.',
      'Compare the **spreads** with numbers and units, and say which group is more consistent.',
      'Answer the question that was asked, using "tends to."',
    ] },
    { t: 'callout', variant: 'vocab', title: 'Statistical investigative questions', text: 'A question like "Do Brand A phones tend to have longer battery life than Brand B phones?" is answered in four stages: **ask** the question, **collect** data from both groups, **analyze** with a display and the right measures, and **interpret** the results in context. Data from a small or unusual sample only supports a cautious answer.' },
    { t: 'callout', variant: 'realworld', title: 'Where this shows up', text: 'Comparing two phone plans\' download speeds, two teams\' scores, prices at two stores or study habits of two grades all use the same idea: compare a typical value **and** how much the values vary.' },

    { t: 'p', text: '### Comparing from summaries, and more than two groups' },
    { t: 'p', text: 'Sometimes you only get the numbers. Class A has mean $78$ and standard deviation $4$; Class B has mean $78$ and standard deviation $11$ (both roughly symmetric). Same mean, so the typical score is the same; Class A has the smaller standard deviation, so its scores are **more consistent**: they are typically only about $4$ points from $78$, while Class B\'s are typically about $11$ points away.' },
    { t: 'p', text: 'With three or more box plots, compare the same measures one group at a time. To find the greatest IQR, subtract $Q_3 - Q_1$ for each box. Do not be fooled by long whiskers: a group can have the greatest **range** but a narrow box, so its middle half is not the most spread out.' },
  ],
  examples: [
    {
      title: 'Reading parallel box plots',
      kind: 'introductory',
      problem: [
        { t: 'p', text: 'Two classes took the same algebra test. Which class has the greater median? By how much? Which class has the greater IQR, and which is more consistent?' },
        {
          t: 'dataplot',
          caption: 'Test scores for two classes of 11 students.',
          spec: {
            kind: 'box',
            min: 60,
            max: 100,
            step: 5,
            axisLabel: 'Test score',
            boxes: [
              { label: 'Class 1', min: 62, q1: 70, median: 80, q3: 86, max: 95 },
              { label: 'Class 2', min: 72, q1: 78, median: 85, q3: 88, max: 94 },
            ],
            ariaLabel: 'Two box plots on an axis from 60 to 100. Class 1: minimum 62, Q1 70, median 80, Q3 86, maximum 95. Class 2: minimum 72, Q1 78, median 85, Q3 88, maximum 94.',
          },
        },
      ],
      steps: [
        { text: 'Read the medians (the line inside each box).', tex: '\\text{Class 1: } 80 \\qquad \\text{Class 2: } 85', why: 'The median splits each class in half.' },
        { text: 'Subtract.', tex: '85 - 80 = 5 \\text{ points}', why: 'The difference of the medians tells how much higher a typical score is.' },
        { text: 'Find each IQR (the width of the box).', tex: '\\text{Class 1: } 86 - 70 = 16 \\qquad \\text{Class 2: } 88 - 78 = 10', why: 'The IQR is the spread of the middle half of the scores.' },
        { text: 'Decide which is more consistent.', why: 'The smaller IQR means the middle half of Class 2 is packed more tightly together.' },
      ],
      answer: 'Class 2 has the greater median, by $5$ points ($85$ vs. $80$). Class 1 has the greater IQR ($16$ vs. $10$ points), so Class 2\'s scores are more consistent.',
    },
    {
      title: 'Choosing the measures',
      kind: 'intermediate',
      problem: [
        { t: 'p', text: 'Ten 9th graders and ten 12th graders reported their weekly allowance. Which measures should be used to compare the groups? Then compare them.' },
        {
          t: 'dataplot',
          caption: '9th graders: weekly allowance in dollars.',
          spec: {
            kind: 'dot',
            min: 0,
            max: 60,
            step: 5,
            axisLabel: '9th graders: allowance (dollars)',
            values: [5, 8, 10, 10, 12, 12, 14, 15, 15, 20],
            ariaLabel: 'Dot plot of 10 values: 5, 8, 10, 10, 12, 12, 14, 15, 15 and 20, clustered between 5 and 20.',
          },
        },
        {
          t: 'dataplot',
          caption: '12th graders: weekly allowance in dollars.',
          spec: {
            kind: 'dot',
            min: 0,
            max: 60,
            step: 5,
            axisLabel: '12th graders: allowance (dollars)',
            values: [0, 10, 15, 15, 20, 20, 25, 25, 30, 60],
            ariaLabel: 'Dot plot of 10 values: 0, 10, 15, 15, 20, 20, 25, 25, 30 and 60. The 60 is far to the right of the others.',
          },
        },
      ],
      steps: [
        { text: 'Check the 12th graders for outliers.', tex: 'Q_1 = 15, \\; Q_3 = 25, \\; \\text{IQR} = 10; \\quad \\text{fences: } 15 - 15 = 0, \\; 25 + 15 = 40', why: 'Lower half $0, 10, 15, 15, 20$; upper half $20, 25, 25, 30, 60$. The value $60 > 40$, so it is an outlier. The $0$ sits exactly on the lower fence, so it is not an outlier.' },
        { text: 'Choose the measures.', tex: '\\text{median and IQR for both groups}', why: 'One group has an outlier, so use the resistant measures, and use the same measures for both groups so the comparison is fair.' },
        { text: 'Find the 9th graders\' median and IQR.', tex: '\\text{median} = \\frac{12 + 12}{2} = 12, \\quad Q_1 = 10, \\; Q_3 = 15, \\; \\text{IQR} = 5', why: 'Lower half $5, 8, 10, 10, 12$; upper half $12, 14, 15, 15, 20$.' },
        { text: 'Find the 12th graders\' median.', tex: '\\text{median} = \\frac{20 + 20}{2} = 20', why: 'The 5th and 6th values are both $20$.' },
        { text: 'Compare center and spread.', tex: '20 - 12 = 8 \\text{ dollars}, \\qquad \\text{IQR } 10 \\text{ vs. } 5', why: 'The 12th graders\' typical allowance is higher, and their allowances vary more.' },
      ],
      answer: 'Use the median and IQR, because the 12th graders have an outlier (\\$60). 12th graders tend to get more: their median is \\$20, \\$8 more than the 9th graders\' \\$12. The 9th graders are more consistent: IQR \\$5 vs. \\$10.',
    },
    {
      title: 'Choosing a phone carrier',
      kind: 'real-world',
      problem: [
        { t: 'p', text: 'Maya measured her phone\'s download speed $12$ times on each of two carriers. Both dot plots were roughly symmetric with no outliers. Use the summary table to write a full comparison and recommend a carrier.' },
        {
          t: 'table',
          caption: 'Download speeds in megabits per second (Mbps), 12 tests each. Standard deviations rounded to the nearest tenth.',
          headers: ['Carrier', 'Mean', 'Standard deviation', 'Median', 'IQR'],
          rows: [
            ['X', '$42.0$', '$4.1$', '$42$', '$5$'],
            ['Y', '$36.0$', '$8.5$', '$35.5$', '$10$'],
          ],
        },
      ],
      steps: [
        { text: 'Choose the measures.', tex: '\\text{mean and standard deviation}', why: 'Both distributions are roughly symmetric with no outliers, so the mean and standard deviation describe them well.' },
        { text: 'Compare centers.', tex: '42.0 - 36.0 = 6.0 \\text{ Mbps}', why: 'Carrier X\'s mean speed is $6$ Mbps faster.' },
        { text: 'Compare spreads.', tex: '4.1 < 8.5', why: 'Carrier X\'s speeds are typically about $4$ Mbps from its mean, while Carrier Y\'s are typically about $8.5$ Mbps from its mean, about twice as far. Carrier X is more consistent.' },
        { text: 'Answer the question in context.', why: 'Faster on average **and** more predictable is a clear win. If one carrier had been faster but much less consistent, the choice would depend on what Maya cares about more.' },
      ],
      answer: 'Carrier X tends to be faster: its mean speed is $42.0$ Mbps, $6.0$ Mbps more than Carrier Y\'s $36.0$ Mbps. Carrier X is also more consistent, with a standard deviation of $4.1$ Mbps compared with $8.5$ Mbps. Maya should choose Carrier X.',
    },
    {
      title: 'A common mistake: comparing means when there is an outlier',
      kind: 'common-mistake',
      problem: [
        { t: 'p', text: 'Nine freshmen and nine sophomores reported how many dollars they spent on in-game purchases last month.' },
        { t: 'list', items: ['Freshmen: $0, 0, 5, 5, 10, 10, 15, 20, 90$', 'Sophomores: $5, 10, 10, 15, 15, 20, 20, 25, 30$'] },
        { t: 'p', text: 'Sam wrote: "Freshmen spend more, because their mean is \\$17.22 and the sophomores\' mean is only \\$16.67." Is Sam right?' },
      ],
      steps: [
        { text: 'Check the freshmen for outliers.', tex: 'Q_1 = 2.5, \\; Q_3 = 17.5, \\; \\text{IQR} = 15, \\quad \\text{upper fence} = 17.5 + 22.5 = 40', why: 'Leave out the median $10$: lower half $0, 0, 5, 5$ and upper half $10, 15, 20, 90$. The value $90 > 40$, so it is an outlier.' },
        { text: 'See what the outlier does to the mean.', tex: '\\frac{155}{9} \\approx 17.22', why: 'Eight of the nine freshmen spent \\$20 or less. The single \\$90 pulls the mean above what almost every freshman spent.' },
        { text: 'Switch to the median and IQR for both groups.', tex: '\\text{Freshmen: median } 10, \\text{ IQR } 15 \\qquad \\text{Sophomores: median } 15, \\text{ IQR } 22.5 - 10 = 12.5', why: 'Sophomores: lower half $5, 10, 10, 15$ gives $Q_1 = 10$; upper half $20, 20, 25, 30$ gives $Q_3 = 22.5$.' },
        { text: 'Compare center and spread.', why: 'The sophomores\' median is \\$5 higher. Their IQR is a little smaller, so their spending is slightly more consistent. Sam also left out spread completely.' },
      ],
      answer: 'Sam is not right. Because the freshmen have an outlier (\\$90), compare medians and IQRs: sophomores tend to spend more (median \\$15 vs. \\$10), and their spending is slightly more consistent (IQR \\$12.50 vs. \\$15).',
    },
    {
      title: 'Answering a statistical investigative question',
      kind: 'challenging',
      problem: [
        { t: 'p', text: 'A student asked: "Do students who play video games on school nights tend to get less sleep than students who do not?" She surveyed $22$ classmates about their sleep last night (in hours).' },
        { t: 'list', items: ['Gamers: $5.5, 6, 6, 6.5, 6.5, 7, 7, 7.5, 7.5, 8, 9.5$', 'Non-gamers: $5, 7, 7.5, 8, 8, 8, 8.5, 8.5, 9, 9, 9.5$'] },
        {
          t: 'dataplot',
          caption: 'Hours of sleep for 11 gamers and 11 non-gamers. The non-gamers have one outlier, drawn as a dot.',
          spec: {
            kind: 'box',
            min: 4,
            max: 10,
            step: 0.5,
            axisLabel: 'Hours of sleep',
            boxes: [
              { label: 'Gamers', min: 5.5, q1: 6, median: 7, q3: 7.5, max: 9.5 },
              { label: 'Non-gamers', min: 7, q1: 7.5, median: 8, q3: 9, max: 9.5, outliers: [5] },
            ],
            ariaLabel: 'Two box plots on an axis from 4 to 10 hours. Gamers: minimum 5.5, Q1 6, median 7, Q3 7.5, maximum 9.5. Non-gamers: whiskers from 7 to 9.5, Q1 7.5, median 8, Q3 9, and an outlier dot at 5.',
          },
        },
      ],
      steps: [
        { text: 'Find each five-number summary.', tex: '\\text{Gamers: } 5.5, 6, 7, 7.5, 9.5 \\qquad \\text{Non-gamers: } 5, 7.5, 8, 9, 9.5', why: 'With $11$ values, the median is the 6th value; $Q_1$ and $Q_3$ are the middles of the five values on each side.' },
        { text: 'Check for outliers.', tex: '\\text{Non-gamers: } 7.5 - 1.5(1.5) = 5.25; \\quad \\text{Gamers: } 7.5 + 1.5(1.5) = 9.75', why: 'For non-gamers, $5 < 5.25$, so $5$ is an outlier. For gamers, the fences are $3.75$ and $9.75$, and $9.5$ is inside, so there are none.' },
        { text: 'Choose the measures.', why: 'One group has an outlier, so compare medians and IQRs.' },
        { text: 'Compare center and spread.', tex: '\\text{medians: } 8 - 7 = 1 \\text{ hour}, \\qquad \\text{IQRs: } 1.5 \\text{ and } 1.5', why: 'Both IQRs are $1.5$ hours, so the two groups are equally consistent in the middle half.' },
        { text: 'Interpret and be careful.', why: 'The gamers\' $Q_3$ ($7.5$) equals the non-gamers\' $Q_1$: about three-quarters of the gamers (9 of 11) slept $7.5$ hours or less, while about three-quarters of the non-gamers (9 of 11) slept $7.5$ hours or more. This is only one night and $22$ students, and a survey cannot show that gaming **causes** less sleep.' },
      ],
      answer: 'Yes, in this sample: gamers tend to sleep less. Their median was $7$ hours, $1$ hour less than the non-gamers\' $8$ hours, and both groups had the same IQR of $1.5$ hours. The conclusion is limited to this small sample and does not prove that gaming causes less sleep.',
    },
  ],
  teachMeAgain: [
    {
      approach: 'visual',
      title: 'Look at where the boxes sit and how wide they are',
      blocks: [
        { t: 'p', text: 'Look at the battery box plots again and ask two questions: **Which box sits farther right?** (center) **Which box is wider?** (spread)' },
        {
          t: 'dataplot',
          caption: 'Brand A\'s box sits a little to the right (higher median) and is half as wide (smaller IQR).',
          spec: {
            kind: 'box',
            min: 8,
            max: 26,
            step: 2,
            axisLabel: 'Battery life (hours)',
            boxes: [
              { label: 'Brand A', min: 14, q1: 16, median: 18, q3: 20, max: 22 },
              { label: 'Brand B', min: 9, q1: 13, median: 16, q3: 21, max: 25 },
            ],
            ariaLabel: 'Two box plots on an axis from 8 to 26 hours. Brand A: 14, 16, 18, 20, 22. Brand B: 9, 13, 16, 21, 25.',
          },
        },
        { t: 'p', text: 'Brand A\'s median line is at $18$, to the right of Brand B\'s at $16$: Brand A tends to last longer. Brand A\'s box is $4$ hours wide and Brand B\'s is $8$: Brand A is more consistent. One more view: Brand A\'s $Q_1$ is $16$, which is Brand B\'s median. In the data, $9$ of the $11$ Brand A phones lasted at least $16$ hours, but only $6$ of the $11$ Brand B phones did.' },
      ],
    },
    {
      approach: 'simpler-example',
      title: 'Two tiny teams',
      blocks: [
        { t: 'p', text: 'Points in five rounds of a game:' },
        { t: 'list', items: ['Team Red: $3, 4, 5, 6, 7$', 'Team Blue: $2, 6, 8, 10, 14$'] },
        { t: 'p', text: 'Both are symmetric with no outliers, so use the mean and standard deviation.' },
        { t: 'list', items: [
          '**Center:** Red\'s mean is $25 \\div 5 = 5$ points; Blue\'s is $40 \\div 5 = 8$ points. Blue scores $3$ more points per round on average.',
          '**Spread:** Red\'s standard deviation is about $1.4$ points; Blue\'s is $4$ points. Red is more consistent.',
        ] },
        { t: 'p', text: 'Full comparison: "Team Blue tends to score more (mean $8$ vs. $5$ points per round), but Team Red is more consistent (standard deviation about $1.4$ vs. $4$ points)."' },
      ],
    },
    {
      approach: 'analogy',
      title: 'Two archers',
      blocks: [
        { t: 'p', text: 'Picture two archers shooting at a target. To compare them you need two facts: **where** their arrows land on average (center) and **how tightly** the arrows are grouped (spread).' },
        { t: 'p', text: 'An archer whose arrows land near the bullseye but scattered everywhere is not the same as one whose arrows are in a tight cluster a little off center. Saying only "they average the same spot" leaves out half the story.' },
        { t: 'p', text: 'Data works the same way. "Group A has a higher median" is half a comparison. You also need "Group A is more (or less) consistent," with the IQR or standard deviation as evidence.' },
      ],
    },
    {
      approach: 'prerequisite',
      title: 'Refresher: picking measures from shape and outliers',
      blocks: [
        { t: 'list', ordered: true, items: [
          '**Look at the shape.** A tail on one side means skewed; matching sides mean symmetric.',
          '**Check for outliers** with the fences $Q_1 - 1.5 \\cdot \\text{IQR}$ and $Q_3 + 1.5 \\cdot \\text{IQR}$.',
          '**Both symmetric, no outliers:** compare means and standard deviations.',
          '**Either group skewed or with an outlier:** compare medians and IQRs for **both** groups.',
        ] },
        { t: 'p', text: 'Why? The mean and standard deviation get pulled by tails and outliers; the median and IQR are resistant. And both groups must be measured the same way, or the comparison is not fair.' },
      ],
    },
    {
      approach: 'step-by-step',
      title: 'A sentence frame for any comparison',
      blocks: [
        { t: 'p', text: 'Fill in the blanks, using the basketball players as an example.' },
        { t: 'list', ordered: true, items: [
          '**Measures:** "Both distributions are roughly symmetric with no outliers, so I compared means and standard deviations."',
          '**Center:** "The mean for Player 1 is $15$ points per game, the same as for Player 2."',
          '**Spread:** "Player 1\'s standard deviation is $3$ points, smaller than Player 2\'s $5.6$ points, so Player 1 is more consistent."',
          '**Answer:** "The players score about the same on average, but Player 1 is the more dependable scorer."',
        ] },
        { t: 'p', text: 'Every sentence has a **number**, a **unit** and the **context** (players, points per game).' },
      ],
    },
    {
      approach: 'alternate-strategy',
      title: 'Compare quarters of the data',
      blocks: [
        { t: 'p', text: 'Each box plot splits a group into four quarters. Lining up the quartiles of one group against the other gives a quick, concrete comparison.' },
        { t: 'p', text: 'In the sleep survey, the gamers\' $Q_3$ is $7.5$ hours and the non-gamers\' $Q_1$ is also $7.5$ hours. So about three-quarters of the gamers slept $7.5$ hours or less, while about three-quarters of the non-gamers slept $7.5$ hours or more. (In the actual data it is $9$ of $11$ in each group.)' },
        { t: 'p', text: 'When one group\'s box is almost entirely to the right of the other\'s, the difference in centers is strong. When the boxes mostly overlap, the difference is weak, even if the medians differ.' },
      ],
    },
  ],
  guided: [
    { generator: 'u7.compare', difficulty: 1 },
    { generator: 'u7.compare', difficulty: 1 },
    { generator: 'u7.compare', difficulty: 2 },
    { generator: 'u7.compare', difficulty: 2 },
  ],
  independent: {
    count: 8,
    reviewCount: 2,
    mix: [
      { generator: 'u7.compare', difficulty: 1, weight: 1 },
      { generator: 'u7.compare', difficulty: 2, weight: 2 },
      { generator: 'u7.compare', difficulty: 3, weight: 1 },
    ],
  },
  quiz: {
    items: [
      { generator: 'u7.compare', difficulty: 1 },
      { generator: 'u7.compare', difficulty: 2 },
      { generator: 'u7.compare', difficulty: 2 },
      { generator: 'u7.compare', difficulty: 2 },
      { generator: 'u7.compare', difficulty: 3 },
      { generator: 'u7.compare', difficulty: 3 },
    ],
  },
  summary: [
    'To compare two groups, compare **both** center and spread, with numbers, units and context.',
    'Check shape and outliers first. Both roughly symmetric with no outliers: use means and standard deviations. Either skewed or with an outlier: use medians and IQRs for both groups.',
    'The group with the smaller IQR or standard deviation is more consistent.',
    'On parallel box plots, the median line shows center and the width of the box (the IQR) shows spread. Overlapping boxes mean one group only "tends to" be higher.',
    'To answer a statistical investigative question, collect data from both groups, display and summarize them, and state a conclusion in context without claiming cause and effect.',
  ],
  mastery: { quizPassScore: 0.8, practiceMinCorrect: 5 },
};
