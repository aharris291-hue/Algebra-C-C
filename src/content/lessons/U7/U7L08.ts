import type { LessonContent } from '../../../core/curriculum/types';

/**
 * U7L08 Lines of Best Fit and Correlation (A.DSR.10.5, A.MP.5)
 * What a line of best fit is (the least-squares line: the line that makes the sum of the squared residuals as
 * small as possible, idea only); getting the line and r with technology (Desmos: enter a table, then type
 * y1 ~ m x1 + b; a graphing calculator: enter L1 and L2, turn Stat Diagnostics on, run LinReg(ax+b)); reading
 * the output, writing the equation and predicting, rounding only at the end; interpreting r (sign = direction,
 * |r| = strength: |r| >= 0.8 strong, 0.5 <= |r| < 0.8 moderate, |r| < 0.5 weak; the closer |r| is to 1, the
 * better a line fits); deciding whether a prediction is reasonable (interpolation inside the data's x-range is
 * more reliable than extrapolation outside it; impossible values in context) (S7.08).
 *
 * Math verified by hand (2026-10-07): every regression below was computed exactly with linearRegression in
 * src/core/math/stats.ts and every prediction was recomputed with node, both from the unrounded output and from
 * the rounded equation shown, and the two agree after the stated rounding. Study hours (0.5..4) vs quiz score:
 * m = 7.547619, b = 57.892857, r = 0.987913 (r^2 = 0.975972); y = 7.55x + 57.89 gives 82.4275 at x = 3.25
 * (unrounded 82.4226), so 82.4; at x = 2 it predicts 72.99, residual 70 - 72.99 = -2.99. Slushies vs temperature
 * (60..95 F): m = 0.790476, b = -33.261905, r = 0.979389; y = 0.79x - 33.26 gives 28.36 at 78 (unrounded
 * 28.40), so 28; -1.66 at 40 (unrounded -1.64). Phone age (2..30 months) vs battery hours: m = -0.195536,
 * b = 15.791071, r = -0.973007; y = -0.196x + 15.79 gives 13.438 at 12 (unrounded 13.445), so 13.4, and
 * -0.674 at 84 (unrounded -0.634). Practice minutes (10..60) vs free-throw percent: m = 12/25 = 0.48 exactly,
 * b = 47.2, r = 0.979796 (r^2 = 0.96); 0.48(35) + 47.2 = 64, 0.48(120) + 47.2 = 104.8. Gaming hours (2..14) vs
 * GPA: m = -0.017021, b = 3.381915, r = -0.220527; y = -0.017x + 3.38 gives 3.278 at 6 (unrounded 3.2798), so
 * 3.28. Points (0,1), (1,2), (2,4), (3,5): m = 7/5, b = 0.9, r = 7/sqrt(50) = 0.989949; residuals 0.1, -0.3,
 * 0.3, -0.1, squares sum 0.2, versus 2/9 = 0.2222 for the line y = (4/3)x + 1 through the end points. Ball
 * heights 0, 48, 64, 48, 0 at t = 0..4 (h = -16t^2 + 64t): r = 0 exactly. Every scatter point and both ends of
 * every drawn line of fit were checked to lie inside their graph windows.
 */
export const U7L08: LessonContent = {
  lessonId: 'U7L08',
  goal: 'Use technology to find the line of best fit and the correlation coefficient $r$ for a data set, use the line to make predictions, explain what $r$ says about the direction and strength of a linear association, and decide whether a prediction is reasonable.',
  needToKnow: [
    { t: 'p', text: 'This lesson builds on the last two:' },
    {
      t: 'list',
      items: [
        '**Scatter plots and association.** Direction (positive, negative, none), strength (strong, moderate, weak) and form (linear or nonlinear).',
        '**Linear models.** In $y = ax + b$, the slope $a$ is the predicted change in $y$ for each 1-unit increase in $x$, and $b$ is the predicted $y$ when $x = 0$.',
        '**Evaluating and rounding.** Substitute the $x$-value, compute, then round **once**, at the very end.',
      ],
    },
    { t: 'callout', variant: 'tip', title: 'Quick check', text: 'For the model $y = 2.5x + 12$, what is the predicted $y$ when $x = 4$? (You should get $2.5(4) + 12 = 10 + 12 = 22$.) If that felt shaky, open **Teach Me Again** and choose the refresher.' },
  ],
  vocabulary: [
    { term: 'line of best fit', meaning: 'The line that best describes a linear pattern in a scatter plot. In this course it is the least-squares regression line found with technology.' },
    { term: 'residual', meaning: 'Actual $y$ minus predicted $y$ for one data point. It is the vertical distance from the point to the line (positive above the line, negative below).' },
    { term: 'least squares', meaning: 'The rule technology uses to choose the line: it makes the sum of the squared residuals as small as possible.' },
    { term: 'correlation coefficient $r$', meaning: 'A number from $-1$ to $1$ that measures the direction and strength of a **linear** association.' },
    { term: 'interpolation', meaning: 'Predicting for an $x$-value inside the range of the data. Usually reliable when the fit is strong.' },
    { term: 'extrapolation', meaning: 'Predicting for an $x$-value outside the range of the data. Risky, because the pattern may not continue.' },
  ],
  instruction: [
    { t: 'p', text: '### What makes a line the "best" fit?' },
    { t: 'p', text: 'Eight students recorded how many hours they studied and their quiz scores. The points rise from left to right in a fairly straight band, so a line is a good model. But many lines could be drawn through the band. Which one is best?' },
    {
      t: 'graph',
      caption: 'Hours studied and quiz scores for 8 students, with the line of best fit y = 7.55x + 57.89.',
      spec: {
        xMin: 0,
        xMax: 4.5,
        yMin: 50,
        yMax: 100,
        xStep: 0.5,
        yStep: 5,
        xLabel: 'hours studied',
        yLabel: 'quiz score',
        scatter: [
          { x: 0.5, y: 62 },
          { x: 1, y: 65 },
          { x: 1.5, y: 71 },
          { x: 2, y: 70 },
          { x: 2.5, y: 78 },
          { x: 3, y: 80 },
          { x: 3.5, y: 85 },
          { x: 4, y: 88 },
        ],
        showLineOfFit: { m: 7.55, b: 57.89 },
        ariaLabel: 'Scatter plot of hours studied (0.5 to 4) against quiz score. The points are (0.5, 62), (1, 65), (1.5, 71), (2, 70), (2.5, 78), (3, 80), (3.5, 85) and (4, 88). They rise in a narrow, nearly straight band. The line of best fit y = 7.55x + 57.89 runs through the middle of the band, with some points a little above it and some a little below.',
      },
    },
    { t: 'p', text: 'For each point, the **residual** is $\\text{actual } y - \\text{predicted } y$: how far the point is above (positive) or below (negative) the line. For example, the line predicts $7.55(2) + 57.89 = 72.99$ for $2$ hours, but that student scored $70$, so the residual is $70 - 72.99 = -2.99$. The point is about $3$ points below the line.' },
    { t: 'p', text: 'The **least-squares regression line** is the one line that makes the **sum of the squared residuals as small as possible**. Squaring makes every residual positive (so points above and below cannot cancel out) and counts big misses much more than small ones. You will not compute this line by hand; technology does it for you.' },
    { t: 'p', text: '### Getting the line and $r$ with technology' },
    { t: 'p', text: '**In Desmos:**' },
    {
      t: 'list',
      ordered: true,
      items: [
        'Click **+** and choose **table**. Type the $x$-values in the $x_1$ column and the $y$-values in the $y_1$ column. The points appear on the graph.',
        'In a new line, type $y_1 \\sim mx_1 + b$. The symbol $\\sim$ is the tilde key, usually next to the 1 key. It means "fit this model to the data" instead of "equals".',
        'Desmos draws the line and lists the **parameters** $m$ (slope) and $b$ (intercept) and the **statistics** $r^2$ and $r$.',
      ],
    },
    { t: 'p', text: '**On a graphing calculator (TI-84 family):**' },
    {
      t: 'list',
      ordered: true,
      items: [
        'Press **STAT**, choose **1:Edit**, and type the $x$-values in **L1** and the $y$-values in **L2**.',
        'Turn diagnostics on once, so $r$ is shown: on a TI-84 Plus CE, press **MODE** and set **STAT DIAGNOSTICS** to **ON**; on older models, press **2nd** **CATALOG** (the **0** key), choose **DiagnosticOn** and press **ENTER** twice.',
        'Press **STAT**, move to **CALC**, choose **4:LinReg(ax+b)**, make sure Xlist is L1 and Ylist is L2, and choose **Calculate**.',
        'The screen shows $y = ax + b$ with the values of $a$ (slope), $b$ (intercept), $r^2$ and $r$.',
      ],
    },
    {
      t: 'table',
      caption: 'Technology output for the study data, and what to write.',
      headers: ['Technology shows', 'Meaning', 'Rounded'],
      rows: [
        ['$m = 7.54762$ (calculator: $a$)', 'slope', '$7.55$'],
        ['$b = 57.8929$', 'y-intercept', '$57.89$'],
        ['$r = 0.987913$', 'correlation coefficient', '$0.988$'],
        ['$r^2 = 0.975972$', 'the square of $r$ (used in later courses)', '$0.976$'],
      ],
    },
    { t: 'p', text: 'So the line of best fit is $y = 7.55x + 57.89$ with $r = 0.988$. To predict the score for $3.25$ hours of studying: $7.55(3.25) + 57.89 = 82.4275 \\approx 82.4$. Round only the final answer, the way the problem tells you.' },
    { t: 'callout', variant: 'tip', title: 'Use the equation you are given', text: 'Problems usually give the output already rounded, like "Line of best fit: $y = 7.55x + 57.89$, $r = 0.988$". Use that equation exactly as written. Rounding the slope and intercept a lot (for example to $y = 8x + 58$) can change your prediction noticeably.' },
    { t: 'p', text: '### What $r$ tells you' },
    {
      t: 'list',
      items: [
        '**Direction:** $r > 0$ means a positive association (the line goes up), $r < 0$ means a negative association (the line goes down). The sign of $r$ always matches the sign of the slope.',
        '**Strength:** look at the size of $r$ without its sign. $|r| \\geq 0.8$ is **strong**, $0.5 \\leq |r| < 0.8$ is **moderate**, and $|r| < 0.5$ is **weak**. $r = 1$ or $r = -1$ means every point is exactly on the line.',
        '**Goodness of fit:** the closer $|r|$ is to $1$, the closer the points are to the line, so the better the line fits and the more you can trust its predictions.',
      ],
    },
    {
      t: 'table',
      caption: 'Reading four values of r.',
      headers: ['$r$', 'Direction', 'Strength'],
      rows: [
        ['$0.92$', 'positive', 'strong ($0.92 \\geq 0.8$)'],
        ['$-0.67$', 'negative', 'moderate ($0.5 \\leq 0.67 < 0.8$)'],
        ['$0.31$', 'positive', 'weak ($0.31 < 0.5$)'],
        ['$-0.05$', 'essentially none', 'no linear association'],
      ],
    },
    { t: 'callout', variant: 'warning', title: 'r only measures straight-line patterns', text: 'A ball thrown upward has heights $0, 48, 64, 48, 0$ feet at $t = 0, 1, 2, 3, 4$ seconds. That is a perfect up-and-down (quadratic) pattern, yet $r = 0$. An $r$ near $0$ means **no linear** association, not "no relationship". Always look at the scatter plot too.' },
    { t: 'p', text: '### Is the prediction reasonable?' },
    { t: 'p', text: 'A basketball player tracked minutes of free-throw practice per day ($10$ to $60$ minutes) and her free-throw percentage. Technology gives $y = 0.48x + 47.2$ with $r = 0.980$.' },
    {
      t: 'graph',
      caption: 'Practice minutes and free-throw percentage. The data stop at 60 minutes, but the line keeps going and passes 100% before 120 minutes.',
      spec: {
        xMin: 0,
        xMax: 130,
        yMin: 40,
        yMax: 110,
        xStep: 10,
        yStep: 10,
        xLabel: 'minutes of practice per day',
        yLabel: 'free throws made (%)',
        scatter: [
          { x: 10, y: 51 },
          { x: 20, y: 59 },
          { x: 30, y: 60 },
          { x: 40, y: 68 },
          { x: 50, y: 69 },
          { x: 60, y: 77 },
        ],
        showLineOfFit: { m: 0.48, b: 47.2 },
        segments: [{ x1: 0, y1: 100, x2: 120, y2: 100, dashed: true, label: '100%' }],
        ariaLabel: 'Scatter plot of practice minutes against free-throw percentage, with points (10, 51), (20, 59), (30, 60), (40, 68), (50, 69) and (60, 77). The line of best fit y = 0.48x + 47.2 passes close to all of them and keeps rising to the right, crossing a dashed horizontal line at 100% at about 110 minutes.',
      },
    },
    {
      t: 'list',
      items: [
        '**Interpolation** (inside the data, $10 \\leq x \\leq 60$): for $35$ minutes, $0.48(35) + 47.2 = 64$, so about $64\\%$. With a strong $r$, this is reasonable.',
        '**Extrapolation** (outside the data): for $120$ minutes, $0.48(120) + 47.2 = 104.8$, so $104.8\\%$. That is **impossible**: nobody makes more than $100\\%$ of their shots. Improvement has to level off, so the straight-line pattern cannot continue forever.',
      ],
    },
    { t: 'callout', variant: 'why', title: 'Why extrapolation is risky', text: 'The data only show what happens between the smallest and largest $x$-values. Outside that range, nothing guarantees the pattern continues, and real quantities often level off, turn around or hit limits (no negative times or amounts, no percents over $100$). So: inside the range plus a strong $r$ means a reasonable prediction; far outside the range, or an impossible value, means do not trust it.' },
    { t: 'callout', variant: 'realworld', title: 'Where this shows up', text: 'Phone makers predict battery life from battery age, streaming services predict watch time from past viewing, and sports analysts predict points from minutes played. They all use regression lines, and they all have to be careful about predicting too far beyond their data.' },

    { t: 'callout', variant: 'tip', title: 'The graphing tool and rounding', text: 'The app\'s graphing tool works like Desmos: enter the table, run the linear regression, and read $a$ (or $m$), $b$ and $r$. Round only the final answer. For $x = 1, 2, 3, 4, 5, 6$ and $y = 3, 5, 6, 9, 10, 12$, the output is $\\hat{y} = 1.8x + 1.2$ with $r \\approx 0.993$. Do not find the slope from just two of the points: the line of best fit uses every point.' },
  ],
  examples: [
    {
      title: 'Read the output and make a prediction',
      kind: 'introductory',
      problem: [
        { t: 'p', text: 'For the study-hours data above, technology gives: **Line of best fit:** $y = 7.55x + 57.89$, $r = 0.988$, where $x$ is hours studied and $y$ is the quiz score. (a) Describe the association. (b) Predict the score for a student who studies $3.25$ hours, to the nearest tenth. (c) Is the prediction reasonable?' },
      ],
      steps: [
        { text: 'Read the sign of $r$.', tex: 'r = 0.988 > 0', why: 'A positive $r$ means a positive association: more study time goes with higher scores. It matches the positive slope $7.55$.' },
        { text: 'Read the size of $r$.', tex: '|r| = 0.988 \\geq 0.8', why: 'That is strong, and very close to $1$, so the points lie close to the line and the line fits well.' },
        { text: 'Substitute $x = 3.25$ into the equation.', tex: 'y = 7.55(3.25) + 57.89 = 24.5375 + 57.89 = 82.4275', why: 'The line gives the predicted $y$ for any $x$. Keep all the digits until the end.' },
        { text: 'Round to the nearest tenth.', tex: 'y \\approx 82.4', why: 'Round once, at the end, as the problem asks.' },
        { text: 'Check whether $x = 3.25$ is inside the data.', tex: '0.5 \\leq 3.25 \\leq 4', why: 'It is interpolation, and $r$ is strong, so the prediction is reasonable.' },
      ],
      answer: '(a) Strong positive linear association ($r = 0.988$). (b) About $82.4$ points. (c) Yes: $3.25$ hours is inside the data (interpolation) and the fit is strong.',
    },
    {
      title: 'From a table to a line with Desmos',
      kind: 'intermediate',
      problem: [
        { t: 'p', text: 'The school store tracked the high temperature and the number of slushies sold on 8 days.' },
        {
          t: 'table',
          caption: 'High temperature and slushies sold.',
          headers: ['High temperature (°F)', '$60$', '$65$', '$70$', '$75$', '$80$', '$85$', '$90$', '$95$'],
          rows: [['Slushies sold', '$14$', '$20$', '$19$', '$27$', '$30$', '$33$', '$41$', '$40$']],
        },
        { t: 'p', text: 'Use technology to find the line of best fit and $r$. Then predict the number of slushies sold on a $78°$F day.' },
      ],
      steps: [
        { text: 'Enter the data in a Desmos table ($x_1$ = temperature, $y_1$ = slushies), then type the regression.', tex: 'y_1 \\sim mx_1 + b', why: 'The tilde tells Desmos to find the least-squares line for the table. On a calculator, put the data in L1 and L2 and run LinReg(ax+b).' },
        { text: 'Read the output and round it.', tex: 'm = 0.790476 \\approx 0.79, \\quad b = -33.2619 \\approx -33.26, \\quad r = 0.979389 \\approx 0.979', why: 'Two decimal places for the slope and intercept are plenty for a prediction rounded to a whole number.' },
        { text: 'Write the line and describe the fit.', tex: 'y = 0.79x - 33.26, \\qquad r = 0.979', why: '$r$ is positive and $|r| \\geq 0.8$: a strong positive linear association. For each additional degree, the predicted number of slushies sold increases by $0.79$ slushies.' },
        { text: 'Predict for $78°$F.', tex: 'y = 0.79(78) - 33.26 = 61.62 - 33.26 = 28.36', why: '$78$ is between $60$ and $95$, so this is interpolation.' },
        { text: 'Round in context.', tex: 'y \\approx 28', why: 'You cannot sell part of a slushy, so round to a whole number.' },
      ],
      answer: '$y = 0.79x - 33.26$, $r = 0.979$ (strong positive). On a $78°$F day the store can expect to sell about $28$ slushies.',
    },
    {
      title: 'Phone batteries: which predictions make sense?',
      kind: 'real-world',
      problem: [
        { t: 'p', text: 'A tech blogger measured how many hours a full charge lasts for phones of different ages, from $2$ to $30$ months old.' },
        {
          t: 'graph',
          caption: 'Phone age and battery life, with the line of best fit y = -0.196x + 15.79.',
          spec: {
            xMin: 0,
            xMax: 36,
            yMin: 0,
            yMax: 18,
            xStep: 4,
            yStep: 2,
            xLabel: 'phone age (months)',
            yLabel: 'battery life (hours)',
            scatter: [
              { x: 2, y: 15.2 },
              { x: 6, y: 15 },
              { x: 10, y: 13.4 },
              { x: 14, y: 13.6 },
              { x: 18, y: 11.8 },
              { x: 22, y: 12 },
              { x: 26, y: 10.2 },
              { x: 30, y: 10.1 },
            ],
            showLineOfFit: { m: -0.196, b: 15.79 },
            ariaLabel: 'Scatter plot of phone age in months against battery life in hours, with points (2, 15.2), (6, 15), (10, 13.4), (14, 13.6), (18, 11.8), (22, 12), (26, 10.2) and (30, 10.1). The points fall from left to right in a narrow band, and the line of best fit y = -0.196x + 15.79 slopes down through them.',
          },
        },
        { t: 'p', text: 'Technology gives $y = -0.196x + 15.79$, $r = -0.973$. (a) Interpret $r$. (b) Predict the battery life of a $12$-month-old phone, to the nearest tenth of an hour. (c) Predict for an $84$-month-old (7-year-old) phone. Is that reasonable?' },
      ],
      steps: [
        { text: 'Interpret $r$.', tex: 'r = -0.973: \\quad \\text{negative}, \\; |r| \\geq 0.8', why: 'Negative: older phones tend to have shorter battery life. Strong: the points are close to the line, so the line fits well.' },
        { text: 'Predict for $12$ months.', tex: 'y = -0.196(12) + 15.79 = -2.352 + 15.79 = 13.438 \\approx 13.4', why: '$12$ is between $2$ and $30$ months (interpolation) and the fit is strong, so about $13.4$ hours is reasonable.' },
        { text: 'Predict for $84$ months.', tex: 'y = -0.196(84) + 15.79 = -16.464 + 15.79 = -0.674', why: 'Substituting works the same way, but $84$ is far outside the data (extrapolation).' },
        { text: 'Check the result against the context.', why: 'A battery cannot last a negative number of hours. The line keeps dropping forever, but a real battery\'s decline would slow down or the phone would simply stop holding a charge. The prediction is impossible, so it is not reasonable.' },
      ],
      answer: '(a) Strong negative linear association. (b) About $13.4$ hours, a reasonable interpolation. (c) About $-0.7$ hours, which is impossible: $84$ months is far outside the $2$ to $30$ month data, so this extrapolation should not be trusted.',
    },
    {
      title: 'A common mistake: "negative r means a weak fit"',
      kind: 'common-mistake',
      problem: [
        { t: 'p', text: 'Jaylen wants to predict the resale value of used phones. A line using **phone age** gives $r = -0.94$. A line using **storage size** gives $r = 0.71$. Jaylen says, "Storage size is the better predictor, because $0.71$ is bigger than $-0.94$." Is he right?' },
      ],
      steps: [
        { text: 'Separate the two jobs of $r$.', why: 'The **sign** of $r$ gives only the direction. The **size** $|r|$ gives the strength. Comparing $0.71$ with $-0.94$ as plain numbers mixes the two up.' },
        { text: 'Compare the sizes.', tex: '|-0.94| = 0.94, \\qquad |0.71| = 0.71, \\qquad 0.94 > 0.71', why: 'The age line has the larger $|r|$, so its points are closer to its line.' },
        { text: 'Classify each one.', tex: '0.94 \\geq 0.8 \\Rightarrow \\text{strong}, \\qquad 0.5 \\leq 0.71 < 0.8 \\Rightarrow \\text{moderate}', why: 'Using the course cut-offs for strong and moderate.' },
        { text: 'Read the direction of the age line.', why: 'Negative just means older phones tend to sell for less. That is a perfectly good, strong pattern to predict with.' },
      ],
      answer: 'No. Phone age is the better linear predictor: $|r| = 0.94$ (strong negative) beats $|r| = 0.71$ (moderate positive). A negative $r$ can be just as strong as a positive one.',
    },
    {
      title: 'When the line is not much help',
      kind: 'challenging',
      problem: [
        { t: 'p', text: 'A survey of 8 students compared hours of video games per week ($2$ to $14$ hours) with GPA. Technology gives $y = -0.017x + 3.38$, $r = -0.221$.' },
        {
          t: 'graph',
          caption: 'Hours of video games per week and GPA. The points are scattered with almost no trend.',
          spec: {
            xMin: 0,
            xMax: 16,
            yMin: 2,
            yMax: 4,
            xStep: 2,
            yStep: 0.5,
            xLabel: 'gaming hours per week',
            yLabel: 'GPA',
            scatter: [
              { x: 2, y: 3.2 },
              { x: 4, y: 3.7 },
              { x: 5, y: 2.9 },
              { x: 7, y: 3.6 },
              { x: 8, y: 3.1 },
              { x: 10, y: 3.4 },
              { x: 12, y: 2.8 },
              { x: 14, y: 3.3 },
            ],
            showLineOfFit: { m: -0.017, b: 3.38 },
            ariaLabel: 'Scatter plot of gaming hours per week against GPA, with points (2, 3.2), (4, 3.7), (5, 2.9), (7, 3.6), (8, 3.1), (10, 3.4), (12, 2.8) and (14, 3.3). The points bounce up and down with no clear trend, and the line of best fit y = -0.017x + 3.38 is almost flat.',
          },
        },
        { t: 'p', text: '(a) Describe the association. (b) Predict the GPA of a student who games $6$ hours a week, to the nearest hundredth. (c) How much should you trust that prediction?' },
      ],
      steps: [
        { text: 'Interpret $r$.', tex: 'r = -0.221, \\qquad |r| = 0.221 < 0.5', why: 'Negative, but weak. The slope $-0.017$ is also tiny: the line drops less than $0.02$ GPA points per extra hour.' },
        { text: 'Make the prediction.', tex: 'y = -0.017(6) + 3.38 = -0.102 + 3.38 = 3.278 \\approx 3.28', why: '$6$ is between $2$ and $14$, so this is interpolation.' },
        { text: 'Compare with the actual data near $x = 6$.', tex: '(5, 2.9), \\quad (7, 3.6)', why: 'Two students near $6$ hours have GPAs of $2.9$ and $3.6$, far from each other and from $3.28$. The points are spread far from the line.' },
        { text: 'Judge the prediction.', why: 'Interpolation is only reliable when the fit is strong. With a weak $r$, the line is barely better than guessing the average GPA.' },
      ],
      answer: '(a) A weak negative linear association ($r = -0.221$). (b) About $3.28$. (c) Not much: even though $6$ hours is inside the data, the weak $r$ means real GPAs vary a lot around the line.',
    },
  ],
  teachMeAgain: [
    {
      approach: 'visual',
      title: 'See the residuals',
      blocks: [
        { t: 'p', text: 'Here are four points with their least-squares line $y = 1.4x + 0.9$. Each dashed segment is a **residual**: the vertical gap from a point to the line.' },
        {
          t: 'graph',
          caption: 'Four points, the line y = 1.4x + 0.9, and dashed residual segments from each point to the line.',
          spec: {
            xMin: -0.5,
            xMax: 4,
            yMin: 0,
            yMax: 7,
            scatter: [
              { x: 0, y: 1 },
              { x: 1, y: 2 },
              { x: 2, y: 4 },
              { x: 3, y: 5 },
            ],
            showLineOfFit: { m: 1.4, b: 0.9 },
            segments: [
              { x1: 0, y1: 1, x2: 0, y2: 0.9, dashed: true },
              { x1: 1, y1: 2, x2: 1, y2: 2.3, dashed: true },
              { x1: 2, y1: 4, x2: 2, y2: 3.7, dashed: true },
              { x1: 3, y1: 5, x2: 3, y2: 5.1, dashed: true },
            ],
            ariaLabel: 'Points (0, 1), (1, 2), (2, 4) and (3, 5) with the line y = 1.4x + 0.9. Short dashed vertical segments connect each point to the line: (0, 1) is 0.1 above it, (1, 2) is 0.3 below it, (2, 4) is 0.3 above it and (3, 5) is 0.1 below it.',
          },
        },
        { t: 'p', text: 'The residuals are $0.1$, $-0.3$, $0.3$ and $-0.1$. Square them and add: $0.01 + 0.09 + 0.09 + 0.01 = 0.2$. No other line has a smaller total. The line through the first and last points, $y = \\frac{4}{3}x + 1$, has residuals $0$, $-\\frac{1}{3}$, $\\frac{1}{3}$, $0$, and its total is $\\frac{2}{9} \\approx 0.222$, a little bigger. That is what "least squares" means.' },
      ],
    },
    {
      approach: 'simpler-example',
      title: 'One small prediction, start to finish',
      blocks: [
        { t: 'p', text: 'A gamer recorded hours played and level reached. Technology gives $y = 1.4x + 0.9$, $r = 0.990$, for $x$ from $0$ to $3$ hours.' },
        {
          t: 'list',
          ordered: true,
          items: [
            '**Direction:** $r$ is positive, so more hours go with higher levels.',
            '**Strength:** $0.990 \\geq 0.8$, so strong. The line fits very well.',
            '**Predict for $2.5$ hours:** $1.4(2.5) + 0.9 = 3.5 + 0.9 = 4.4$, so the model predicts about level $4$.',
            '**Reasonable?** $2.5$ is between $0$ and $3$: interpolation with a strong fit, so yes.',
          ],
        },
      ],
    },
    {
      approach: 'analogy',
      title: 'r is a tightness meter; extrapolation is a long-range forecast',
      blocks: [
        { t: 'p', text: 'Think of the scatter plot as a crowd walking along a straight path. $r$ is a **tightness meter**: near $1$ or $-1$, everyone is walking right on the path; near $0$, people are wandering all over the field. The **sign** only tells you whether the path goes uphill ($+$) or downhill ($-$), not how tight the crowd is.' },
        { t: 'p', text: 'Predictions are like weather forecasts. Tomorrow\'s forecast (inside the data you know) is usually close. A forecast for a day three months away (far outside the data) is mostly a guess, and sometimes it says something silly, like a negative amount of rain.' },
      ],
    },
    {
      approach: 'prerequisite',
      title: 'Refresher: evaluating a line and rounding',
      blocks: [
        { t: 'p', text: 'To use $y = 0.79x - 33.26$ at $x = 78$:' },
        {
          t: 'list',
          ordered: true,
          items: [
            'Multiply first: $0.79 \\times 78 = 61.62$.',
            'Then add the intercept (here it is negative, so subtract): $61.62 - 33.26 = 28.36$.',
            'Round **only now**: to the nearest whole number, $28.36 \\approx 28$; to the nearest tenth, $28.4$.',
          ],
        },
        { t: 'p', text: 'Rounding means looking at the next digit: $5$ or more rounds up, $4$ or less stays. In $28.36$, the tenths digit is $3$, so the nearest whole number is $28$.' },
      ],
    },
    {
      approach: 'step-by-step',
      title: 'A routine for any regression problem',
      blocks: [
        {
          t: 'list',
          ordered: true,
          items: [
            '**Get the output.** Desmos: table, then $y_1 \\sim mx_1 + b$. Calculator: L1 and L2, diagnostics on, LinReg(ax+b). Or read it from the problem.',
            '**Write the line** $y = ax + b$ using the values given (or rounded as told).',
            '**Read $r$.** Sign: direction. $|r| \\geq 0.8$ strong, $0.5$ to $0.8$ moderate, below $0.5$ weak.',
            '**Predict.** Substitute $x$, compute, round once at the end.',
            '**Judge.** Is $x$ inside the data\'s range? Is the answer possible in context (no negative times or counts, no percent over $100$)? Is $r$ strong?',
          ],
        },
      ],
    },
    {
      approach: 'alternate-strategy',
      title: 'Check a prediction against the nearby data',
      blocks: [
        { t: 'p', text: 'Before trusting an answer from the equation, look at the actual data points with $x$-values close to yours.' },
        {
          t: 'list',
          items: [
            '**Study data:** the prediction for $3.25$ hours was $82.4$. The students at $3$ and $3.5$ hours scored $80$ and $85$. $82.4$ is right between them, so the prediction makes sense.',
            '**Gaming data:** the prediction for $6$ hours was $3.28$. The students at $5$ and $7$ hours had GPAs $2.9$ and $3.6$. They are far apart, which shows the weak fit: the prediction could easily be off by half a point.',
            '**Battery data:** for $84$ months there are **no** nearby points at all (the data stop at $30$), so there is nothing to check against. That alone is a warning sign.',
          ],
        },
      ],
    },
  ],
  guided: [
    { generator: 'u7.regression', difficulty: 1 },
    { generator: 'u7.regression', difficulty: 1 },
    { generator: 'u7.regression', difficulty: 2 },
    { generator: 'u7.regression', difficulty: 3 },
  ],
  independent: {
    count: 8,
    reviewCount: 2,
    mix: [
      { generator: 'u7.regression', difficulty: 1, weight: 2 },
      { generator: 'u7.regression', difficulty: 2, weight: 2 },
      { generator: 'u7.regression', difficulty: 3, weight: 2 },
    ],
  },
  quiz: {
    items: [
      { generator: 'u7.regression', difficulty: 1 },
      { generator: 'u7.regression', difficulty: 2 },
      { generator: 'u7.regression', difficulty: 2 },
      { generator: 'u7.regression', difficulty: 2 },
      { generator: 'u7.regression', difficulty: 3 },
      { generator: 'u7.regression', difficulty: 3 },
    ],
  },
  summary: [
    'The line of best fit (least-squares regression line) is the line that makes the sum of the squared residuals as small as possible; a residual is actual $y$ minus predicted $y$.',
    'Find it with technology: in Desmos, enter a table and type $y_1 \\sim mx_1 + b$; on a graphing calculator, enter L1 and L2, turn diagnostics on and run LinReg(ax+b).',
    'To predict, substitute $x$ into the equation you are given and round only the final answer.',
    'The sign of $r$ gives the direction; $|r|$ gives the strength ($\\geq 0.8$ strong, $0.5$ to $0.8$ moderate, $< 0.5$ weak). The closer $|r|$ is to $1$, the better the line fits.',
    'Predictions inside the range of the data (interpolation) with a strong $r$ are reasonable; predictions far outside it (extrapolation) are risky, and an impossible value in context means the prediction is not reasonable.',
  ],
  mastery: { quizPassScore: 0.8, practiceMinCorrect: 5 },
};
