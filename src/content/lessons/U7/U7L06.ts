import type { LessonContent } from '../../../core/curriculum/types';

/**
 * U7L06 Scatter Plots and Association (A.DSR.10.3)
 * Plot bivariate data from a table with the explanatory variable on the x-axis and the response variable on the
 * y-axis; describe an association by direction (positive, negative, no association), strength (strong, moderate,
 * weak) and form (linear, nonlinear), and point out clusters and outliers; a first look at the correlation
 * coefficient r (sign = direction, size = strength of a LINEAR pattern, with the unit cut-offs |r| >= 0.8 strong,
 * 0.5 <= |r| < 0.8 moderate, |r| < 0.5 weak); and describe an association in context (S7.06).
 *
 * Math verified by hand (2026-10-07): every r below was computed from its data with node (population formula
 * r = Sxy / sqrt(Sxx * Syy)): study hours vs quiz score r = 0.957; screen time vs sleep r = -0.7735; jersey
 * number vs points r = -0.0742; punt height vs time (h = 64t - 16t^2 at t = 0, 0.5, ..., 4) r = 0 exactly, by
 * symmetry about t = 2; game hours vs level r = 0.541 with the point (2, 24) and r = 0.9974 without it; phone age
 * vs battery health r = -0.9887; practice hours vs free throws r = 0.9878; the matching plots have r = 0.8515,
 * -0.9507, 0.0981 and -0.3982; the five-point warm-up has r = 0.9934. The quadrant count for the study data
 * (lines at the means x = 3.1 and y = 77.1) is 4 upper right, 5 lower left, 1 upper left, 0 lower right. Every
 * scatter point was checked to lie inside its graph window.
 */
export const U7L06: LessonContent = {
  lessonId: 'U7L06',
  goal: 'Make a scatter plot from a table of paired data, describe the association by its direction, strength and form, spot clusters and outliers, read what the sign and size of r tell you, and describe the association in context.',
  needToKnow: [
    { t: 'p', text: 'So far in this unit every data set had **one** variable, like test scores or heights. Now each person or object gives **two** numbers, and we ask whether they are related. You already know how to:' },
    {
      t: 'list',
      items: [
        '**Plot an ordered pair** $(x, y)$: go right $x$ along the horizontal axis and up $y$ along the vertical axis.',
        '**Read a slope**: a line that rises from left to right has a positive slope; a line that falls has a negative slope.',
      ],
    },
    { t: 'callout', variant: 'tip', title: 'Quick check', text: 'Where is the point $(3, 80)$? (Right $3$, up $80$.) Does a line through $(1, 2)$ and $(4, 8)$ rise or fall? (It rises: the slope is $\\frac{8 - 2}{4 - 1} = 2$.) If either felt shaky, open **Teach Me Again** and choose the refresher.' },
  ],
  vocabulary: [
    { term: 'bivariate data', meaning: 'Data with two variables measured on each individual, such as hours studied and quiz score for each student.' },
    { term: 'scatter plot', meaning: 'A graph of bivariate data: each individual is one point $(x, y)$.' },
    { term: 'explanatory variable', meaning: 'The variable that may help explain or predict the other one. It goes on the $x$-axis.' },
    { term: 'response variable', meaning: 'The variable we think responds to the explanatory variable. It goes on the $y$-axis.' },
    { term: 'association', meaning: 'A pattern in a scatter plot: knowing $x$ tells you something about the likely value of $y$.' },
    { term: 'correlation coefficient $r$', meaning: 'A number from $-1$ to $1$ that measures the direction and strength of a **linear** association.' },
    { term: 'outlier', meaning: 'A point that falls far away from the overall pattern of the other points.' },
    { term: 'cluster', meaning: 'A group of points that sit close together, apart from other groups.' },
  ],
  instruction: [
    { t: 'p', text: '### Making a scatter plot' },
    { t: 'p', text: 'Ten students recorded how many hours they studied for a quiz and their score out of $100$.' },
    {
      t: 'table',
      caption: 'Hours studied and quiz score for ten students.',
      headers: ['Hours studied', '$1$', '$1$', '$2$', '$2$', '$3$', '$3$', '$4$', '$4$', '$5$', '$6$'],
      rows: [['Quiz score', '$62$', '$68$', '$70$', '$75$', '$74$', '$80$', '$83$', '$79$', '$88$', '$92$']],
    },
    { t: 'p', text: 'First decide which variable explains the other. Studying could help explain the score, not the other way around, so **hours studied is the explanatory variable** ($x$-axis) and **quiz score is the response variable** ($y$-axis). Each student becomes one point, like $(1, 62)$ and $(6, 92)$. Two students can share an $x$-value; they are just two points stacked in the same column.' },
    {
      t: 'graph',
      caption: 'Hours studied versus quiz score. The points climb from lower left to upper right in a fairly tight band.',
      spec: {
        xMin: 0,
        xMax: 7,
        yMin: 0,
        yMax: 100,
        xStep: 1,
        yStep: 10,
        xLabel: 'hours studied',
        yLabel: 'quiz score',
        scatter: [
          { x: 1, y: 62 }, { x: 1, y: 68 }, { x: 2, y: 70 }, { x: 2, y: 75 }, { x: 3, y: 74 },
          { x: 3, y: 80 }, { x: 4, y: 83 }, { x: 4, y: 79 }, { x: 5, y: 88 }, { x: 6, y: 92 },
        ],
        ariaLabel: 'Scatter plot of ten points with hours studied from 1 to 6 on the x-axis and quiz score from 62 to 92 on the y-axis. The points rise from (1, 62) and (1, 68) at the lower left to (6, 92) at the upper right, staying close to a straight line.',
      },
    },
    { t: 'p', text: '### Describing the association: direction, strength, form' },
    {
      t: 'list',
      items: [
        '**Direction.** **Positive** association: as $x$ increases, $y$ tends to increase (points go up to the right). **Negative** association: as $x$ increases, $y$ tends to decrease (points go down to the right). **No association**: no up or down trend.',
        '**Strength.** How closely the points follow the pattern. **Strong**: a tight band. **Moderate**: a clear trend with a fair amount of scatter. **Weak**: a trend you can barely see.',
        '**Form.** **Linear** if the points follow a straight-line pattern; **nonlinear** if they follow a curve.',
        '**Unusual features.** An **outlier** is a point far from the pattern. **Clusters** are separate groups of points.',
      ],
    },
    { t: 'p', text: 'The study data show a **strong, positive, linear association**. In context: *students who studied more hours tended to score higher on the quiz.* Notice the word **tended**: the student with $(3, 74)$ scored lower than one who studied $2$ hours and got $75$. An association describes the overall trend, not every single point.' },
    { t: 'p', text: '### A first look at the correlation coefficient $r$' },
    { t: 'p', text: 'Technology (Desmos or a graphing calculator) can compute a number $r$ that measures a **linear** association. For the study data, $r \\approx 0.96$.' },
    {
      t: 'list',
      items: [
        '$r$ is always between $-1$ and $1$.',
        '**The sign gives the direction:** $r > 0$ is positive, $r < 0$ is negative.',
        '**The size (ignoring the sign) gives the strength:** $|r| \\geq 0.8$ strong, $0.5 \\leq |r| < 0.8$ moderate, $|r| < 0.5$ weak. $r = 1$ or $r = -1$ means every point is exactly on a line.',
        '**$r$ near $0$** means no **linear** association. There could still be a curved pattern, so always look at the plot.',
      ],
    },
    { t: 'p', text: 'Here are two more data sets. Each point is one student.' },
    {
      t: 'graph',
      caption: 'Daily phone screen time versus hours of sleep: a moderate negative linear association, r about -0.77.',
      spec: {
        xMin: 0,
        xMax: 9,
        yMin: 0,
        yMax: 10,
        xStep: 1,
        yStep: 1,
        xLabel: 'screen time (h/day)',
        yLabel: 'sleep (h)',
        scatter: [
          { x: 2, y: 9 }, { x: 3, y: 8.5 }, { x: 3, y: 7 }, { x: 4, y: 8 }, { x: 5, y: 7.5 },
          { x: 5, y: 6.5 }, { x: 6, y: 7 }, { x: 7, y: 6 }, { x: 7, y: 7.5 }, { x: 8, y: 6 },
        ],
        ariaLabel: 'Scatter plot of ten points, screen time from 2 to 8 hours per day on the x-axis and sleep from 6 to 9 hours on the y-axis. The points drift down from (2, 9) to (8, 6) with noticeable scatter, such as (3, 7) and (7, 7.5).',
      },
    },
    { t: 'p', text: 'Screen time and sleep: **moderate, negative, linear**, with $r \\approx -0.77$. Students with more daily screen time tended to sleep fewer hours. The negative sign tells the direction; $|-0.77| = 0.77$ is between $0.5$ and $0.8$, so the strength is moderate.' },
    {
      t: 'graph',
      caption: 'Jersey number versus points per game: no association, r about -0.07.',
      spec: {
        xMin: 0,
        xMax: 50,
        yMin: 0,
        yMax: 16,
        xStep: 5,
        yStep: 2,
        xLabel: 'jersey number',
        yLabel: 'points per game',
        scatter: [
          { x: 3, y: 12 }, { x: 7, y: 4 }, { x: 10, y: 15 }, { x: 12, y: 8 }, { x: 15, y: 10 },
          { x: 21, y: 6 }, { x: 23, y: 14 }, { x: 30, y: 9 }, { x: 33, y: 5 }, { x: 45, y: 11 },
        ],
        ariaLabel: 'Scatter plot of ten basketball players, jersey number from 3 to 45 on the x-axis and points per game from 4 to 15 on the y-axis. The points are spread all over with no upward or downward trend.',
      },
    },
    { t: 'p', text: 'Jersey number and points per game: **no association** ($r \\approx -0.07$, very close to $0$). Knowing a player\'s jersey number tells you nothing useful about how many points they score.' },
    { t: 'callout', variant: 'warning', title: 'Negative does not mean weak', text: 'The sign of $r$ is only the direction. $r = -0.95$ is a **strong** association (going down), much stronger than $r = 0.4$. Compare strengths by ignoring the signs: $0.95 > 0.4$.' },
    { t: 'p', text: '### Clusters' },
    { t: 'p', text: 'Sometimes points form separate groups. This plot shows the price and battery life of twelve phones.' },
    {
      t: 'graph',
      caption: 'Phone price versus battery life: two clusters, budget phones and premium phones.',
      spec: {
        xMin: 0,
        xMax: 12,
        yMin: 0,
        yMax: 24,
        xStep: 1,
        yStep: 2,
        xLabel: 'price (hundreds of dollars)',
        yLabel: 'battery life (h)',
        scatter: [
          { x: 1, y: 10 }, { x: 1.5, y: 9 }, { x: 2, y: 12 }, { x: 2, y: 11 }, { x: 2.5, y: 13 }, { x: 3, y: 11 },
          { x: 8, y: 19 }, { x: 8.5, y: 21 }, { x: 9, y: 18 }, { x: 9.5, y: 22 }, { x: 10, y: 20 }, { x: 11, y: 23 },
        ],
        ariaLabel: 'Scatter plot of twelve phones. Six budget phones sit together at prices from 100 to 300 dollars with 9 to 13 hours of battery life. Six premium phones sit together at prices from 800 to 1100 dollars with 18 to 23 hours of battery life. There is a big empty gap between the two groups.',
      },
    },
    { t: 'p', text: 'There are two clusters: cheaper phones with about $9$ to $13$ hours of battery life, and expensive phones with about $18$ to $23$ hours. When you see clusters, say so, and describe what makes the groups different.' },
    { t: 'callout', variant: 'realworld', title: 'Describe it in context', text: 'A complete description names the direction, strength and form, mentions any outliers or clusters, and uses the **actual variables**: "There is a moderate, negative, linear association between daily screen time and hours of sleep: students with more screen time tended to sleep less." Avoid "$x$ goes up and $y$ goes down."' },

    { t: 'callout', variant: 'tip', title: 'Plotting from a table', text: 'Each row of a table is one point: the first column is $x$ (across) and the second is $y$ (up). When you check a plot against a table, check **every** point. A plot with one point too high, or with two $y$-values switched, can look almost right.' },
  ],
  examples: [
    {
      title: 'Plot the data and find the direction',
      kind: 'introductory',
      problem: [
        { t: 'p', text: 'A basketball coach recorded how many hours each player practiced free throws in a week and how many free throws (out of $20$) the player made at the next practice. Name the explanatory and response variables, plot the data, and describe the direction of the association.' },
        {
          t: 'table',
          caption: 'Practice hours and free throws made out of 20 for seven players.',
          headers: ['Practice hours', '$1$', '$2$', '$3$', '$4$', '$5$', '$6$', '$7$'],
          rows: [['Free throws made', '$6$', '$8$', '$9$', '$11$', '$12$', '$15$', '$15$']],
        },
        { t: 'graph', spec: { xMin: 0, xMax: 8, yMin: 0, yMax: 20, xStep: 1, yStep: 2, xLabel: 'Practice hours', yLabel: 'Free throws made', scatter: [{ x: 1, y: 6 }, { x: 2, y: 8 }, { x: 3, y: 9 }, { x: 4, y: 11 }, { x: 5, y: 12 }, { x: 6, y: 15 }, { x: 7, y: 15 }], ariaLabel: 'Scatter plot of free throws made against practice hours: (1, 6), (2, 8), (3, 9), (4, 11), (5, 12), (6, 15), (7, 15).' }, caption: 'The data plotted, so you can check your own graph.' },
      ],
      steps: [
        { text: 'Choose the explanatory variable.', tex: 'x = \\text{practice hours}, \\qquad y = \\text{free throws made}', why: 'Practicing could help explain how many shots go in, so practice hours is explanatory ($x$-axis) and free throws made is the response ($y$-axis).' },
        { text: 'Turn each column into an ordered pair.', tex: '(1, 6), (2, 8), (3, 9), (4, 11), (5, 12), (6, 15), (7, 15)', why: 'Each player is one point: their $x$-value from the top row and their $y$-value from the bottom row.' },
        {
          text: 'Plot the points on axes that fit the data: $x$ from $0$ to $8$, $y$ from $0$ to $20$.',
          why: 'Free throws are out of $20$, so a $y$-axis to $20$ shows every possible score. Label both axes with the variable names.',
        },
        { text: 'Read the direction.', why: 'Moving right (more practice), the points move up (more free throws made). As $x$ increases, $y$ tends to increase, so the association is positive. The points also hug a straight line, so it is strong and linear.' },
      ],
      answer: 'Explanatory: practice hours ($x$). Response: free throws made ($y$). The scatter plot shows a **positive** association (in fact strong and linear): players who practiced more hours tended to make more free throws.',
    },
    {
      title: 'Direction, strength, form and an outlier',
      kind: 'intermediate',
      problem: [
        { t: 'p', text: 'Ten players of an online game reported how many hours they played last week and the highest level they reached. Describe the association, including anything unusual.' },
        {
          t: 'graph',
          caption: 'Hours played versus highest level reached for ten players.',
          spec: {
            xMin: 0,
            xMax: 11,
            yMin: 0,
            yMax: 26,
            xStep: 1,
            yStep: 2,
            xLabel: 'hours played',
            yLabel: 'level reached',
            scatter: [
              { x: 2, y: 5 }, { x: 3, y: 8 }, { x: 4, y: 9 }, { x: 5, y: 12 }, { x: 6, y: 13 },
              { x: 7, y: 16 }, { x: 8, y: 18 }, { x: 9, y: 20 }, { x: 10, y: 22 }, { x: 2, y: 24 },
            ],
            ariaLabel: 'Scatter plot of ten players. Nine points rise in a nearly straight line from (2, 5) to (10, 22). One point, (2, 24), sits far above the others at the upper left.',
          },
        },
      ],
      steps: [
        { text: 'Look at the overall pattern first.', why: 'Nine of the ten points rise from $(2, 5)$ to $(10, 22)$, so the direction is positive.' },
        { text: 'Judge strength and form from those points.', why: 'They lie very close to a straight line, so the pattern is strong and linear.' },
        { text: 'Look for points that break the pattern.', tex: '(2, 24)', why: 'This player played only $2$ hours but reached level $24$, far above where the pattern predicts (about level $5$). That is an outlier. Maybe the player started the week at a high level or bought a level boost.' },
        { text: 'See how much the outlier matters to $r$.', tex: 'r \\approx 0.54 \\text{ with it}, \\qquad r \\approx 0.997 \\text{ without it}', why: 'One point far from the line makes $r$ drop from strong to moderate. That is why you should always look at the plot, not just the number.' },
      ],
      answer: 'A strong, positive, linear association between hours played and level reached, with one outlier at $(2, 24)$. Players who played more hours tended to reach higher levels. The outlier lowers $r$ from about $0.997$ to about $0.54$.',
    },
    {
      title: 'Phone age and battery health',
      kind: 'real-world',
      problem: [
        { t: 'p', text: 'A phone\'s battery health is the percent of its original capacity it can still hold. Ten phones were checked. Describe the association in context, and say what $r \\approx -0.99$ tells you.' },
        {
          t: 'table',
          caption: 'Age and battery health for ten phones.',
          headers: ['Age (years)', '$0.5$', '$1$', '$1$', '$1.5$', '$2$', '$2$', '$2.5$', '$3$', '$3.5$', '$4$'],
          rows: [['Battery health (%)', '$99$', '$96$', '$94$', '$92$', '$90$', '$87$', '$86$', '$83$', '$81$', '$78$']],
        },
        {
          t: 'graph',
          caption: 'Phone age versus battery health.',
          spec: {
            xMin: 0,
            xMax: 4.5,
            yMin: 0,
            yMax: 100,
            xStep: 0.5,
            yStep: 10,
            xLabel: 'age (years)',
            yLabel: 'battery health (%)',
            scatter: [
              { x: 0.5, y: 99 }, { x: 1, y: 96 }, { x: 1, y: 94 }, { x: 1.5, y: 92 }, { x: 2, y: 90 },
              { x: 2, y: 87 }, { x: 2.5, y: 86 }, { x: 3, y: 83 }, { x: 3.5, y: 81 }, { x: 4, y: 78 },
            ],
            ariaLabel: 'Scatter plot of ten phones, age from 0.5 to 4 years on the x-axis and battery health from 99 down to 78 percent on the y-axis. The points fall steadily in a nearly straight line.',
          },
        },
      ],
      steps: [
        { text: 'Identify the variables.', tex: 'x = \\text{age (years)}, \\qquad y = \\text{battery health (\\%)}', why: 'Getting older could explain a weaker battery, so age is the explanatory variable.' },
        { text: 'Direction: read the plot and the sign of $r$.', why: 'The points fall from left to right, and $r$ is negative. Both say: negative association.' },
        { text: 'Strength: use the size of $r$.', tex: '|-0.99| = 0.99 \\geq 0.8', why: 'The size is at least $0.8$, so the association is strong. The points really do form a tight band.' },
        { text: 'Form and unusual features.', why: 'The points follow a straight-line pattern with no outliers or clusters, so the form is linear.' },
        { text: 'Put it in context.', why: 'Use the real variable names and the word "tended", because the trend is about phones in general, not a promise about one phone.' },
      ],
      answer: 'There is a strong, negative, linear association between a phone\'s age and its battery health: older phones tended to have lower battery health. $r \\approx -0.99$ is negative (direction) and very close to $-1$ (very strong linear pattern).',
    },
    {
      title: 'A common mistake: "r is 0, so there is no relationship"',
      kind: 'common-mistake',
      problem: [
        { t: 'p', text: 'A soccer player punts a ball. A video app measures its height every half second. A student types the data into a calculator, gets $r = 0$, and says, "Time and height have no relationship." Is that right?' },
        {
          t: 'table',
          caption: 'Time after the kick and height of the ball.',
          headers: ['Time (s)', '$0$', '$0.5$', '$1$', '$1.5$', '$2$', '$2.5$', '$3$', '$3.5$', '$4$'],
          rows: [['Height (ft)', '$0$', '$28$', '$48$', '$60$', '$64$', '$60$', '$48$', '$28$', '$0$']],
        },
      ],
      steps: [
        { text: 'Plot the data before trusting $r$.', why: 'The points rise from $(0, 0)$ to $(2, 64)$ and then fall back to $(4, 0)$: a clear arch.' },
        {
          text: 'Look at the shape.',
          why: 'The points lie exactly on a curve (a parabola). Knowing the time tells you the height exactly, so the relationship is very strong.',
        },
        { text: 'Explain why $r = 0$.', why: '$r$ only measures **linear** (straight-line) association. The left half goes up and the right half goes down by the same amounts, so no single line fits, and the upward and downward parts cancel out to $r = 0$.' },
        { text: 'Correct the statement.', why: 'Say "no **linear** association", and describe the real pattern: strong and nonlinear.' },
      ],
      answer: 'No. There is a strong **nonlinear** association: the height goes up and then back down along a curve. $r = 0$ only means there is no **linear** association. Always look at the scatter plot.',
    },
    {
      title: 'Match each plot to its r',
      kind: 'challenging',
      problem: [
        { t: 'p', text: 'The four scatter plots below have correlation coefficients $-0.95$, $-0.40$, $0.10$ and $0.85$ (in some order). Match each plot to its $r$.' },
        {
          t: 'graph',
          caption: 'Plot P.',
          spec: {
            xMin: 0, xMax: 11, yMin: 0, yMax: 11, xStep: 1, yStep: 1,
            scatter: [{ x: 1, y: 2 }, { x: 2, y: 2 }, { x: 3, y: 2 }, { x: 4, y: 5 }, { x: 5, y: 3 }, { x: 6, y: 9 }, { x: 7, y: 5 }, { x: 8, y: 7 }, { x: 9, y: 7 }, { x: 10, y: 10 }],
            ariaLabel: 'Plot P: ten points that rise clearly from the lower left, near (1, 2), to the upper right, (10, 10), with some scatter.',
          },
        },
        {
          t: 'graph',
          caption: 'Plot Q.',
          spec: {
            xMin: 0, xMax: 11, yMin: 0, yMax: 11, xStep: 1, yStep: 1,
            scatter: [{ x: 1, y: 10 }, { x: 2, y: 8 }, { x: 3, y: 8 }, { x: 4, y: 8 }, { x: 5, y: 6 }, { x: 6, y: 5 }, { x: 7, y: 5 }, { x: 8, y: 4 }, { x: 9, y: 1 }, { x: 10, y: 3 }],
            ariaLabel: 'Plot Q: ten points that fall steadily from (1, 10) at the upper left to the lower right, staying in a narrow band.',
          },
        },
        {
          t: 'graph',
          caption: 'Plot R.',
          spec: {
            xMin: 0, xMax: 11, yMin: 0, yMax: 11, xStep: 1, yStep: 1,
            scatter: [{ x: 1, y: 7 }, { x: 2, y: 5 }, { x: 3, y: 2 }, { x: 4, y: 3 }, { x: 5, y: 5 }, { x: 6, y: 4 }, { x: 7, y: 5 }, { x: 8, y: 3 }, { x: 9, y: 9 }, { x: 10, y: 4 }],
            ariaLabel: 'Plot R: ten points scattered between heights 2 and 9 with no clear upward or downward trend.',
          },
        },
        {
          t: 'graph',
          caption: 'Plot S.',
          spec: {
            xMin: 0, xMax: 11, yMin: 0, yMax: 11, xStep: 1, yStep: 1,
            scatter: [{ x: 1, y: 5 }, { x: 2, y: 8 }, { x: 3, y: 7 }, { x: 4, y: 6 }, { x: 5, y: 5 }, { x: 6, y: 3 }, { x: 7, y: 2 }, { x: 8, y: 5 }, { x: 9, y: 6 }, { x: 10, y: 5 }],
            ariaLabel: 'Plot S: ten points that drift slightly downward overall, from around 8 on the left to around 5 on the right, with a lot of scatter.',
          },
        },
      ],
      steps: [
        { text: 'Sort by direction.', why: 'Q and S trend downward, so they get the two negative values. P trends upward. R has no clear trend.' },
        { text: 'Match the negative plots by strength.', tex: 'Q: -0.95, \\qquad S: -0.40', why: 'Q is a tight band (strong), so it gets the value with the larger size, $|-0.95| = 0.95$. S is loose and barely trends down (weak), so it gets $-0.40$.' },
        { text: 'Match the remaining two.', tex: 'P: 0.85, \\qquad R: 0.10', why: 'P clearly rises with some scatter: strong positive, $0.85$. R has no visible trend, so it gets the value closest to $0$.' },
        { text: 'Check with the cut-offs.', why: '$0.95$ and $0.85$ are at least $0.8$ (strong); $0.40$ and $0.10$ are below $0.5$ (weak, or no association for $0.10$). That matches what the plots look like.' },
      ],
      answer: 'P: $r = 0.85$, Q: $r = -0.95$, R: $r = 0.10$, S: $r = -0.40$. (Computed from the plotted points: $0.85$, $-0.95$, $0.10$ and $-0.40$ to two decimal places.)',
    },
  ],
  teachMeAgain: [
    {
      approach: 'visual',
      title: 'Draw an oval around the points',
      blocks: [
        { t: 'p', text: 'Imagine drawing the smallest oval that holds all the points. The **tilt** of the oval gives the direction, and how **skinny** it is gives the strength.' },
        {
          t: 'list',
          items: [
            'Oval tilts **up** to the right: positive. Tilts **down**: negative. A round blob with no tilt: no association.',
            'A **skinny** oval (like a hot dog): strong. A **medium** oval (like an egg): moderate. A **fat** oval (almost a circle): weak.',
          ],
        },
        { t: 'p', text: 'The study-hours plot fits in a skinny oval tilting up: strong positive ($r \\approx 0.96$). The screen-time plot fits in an egg tilting down: moderate negative ($r \\approx -0.77$). The jersey-number plot is a round blob: no association ($r \\approx -0.07$).' },
        { t: 'p', text: 'If the points bend like a rainbow or a smile, an oval is the wrong shape: the form is nonlinear.' },
      ],
    },
    {
      approach: 'simpler-example',
      title: 'Just five points',
      blocks: [
        { t: 'p', text: 'Five soccer players: number of practices per week ($x$) and goals scored this season ($y$).' },
        {
          t: 'graph',
          caption: 'Five points that rise steadily.',
          spec: {
            xMin: 0, xMax: 6, yMin: 0, yMax: 10, xStep: 1, yStep: 1,
            xLabel: 'practices per week', yLabel: 'goals',
            scatter: [{ x: 1, y: 2 }, { x: 2, y: 4 }, { x: 3, y: 5 }, { x: 4, y: 7 }, { x: 5, y: 8 }],
            ariaLabel: 'Five points at (1, 2), (2, 4), (3, 5), (4, 7) and (5, 8), climbing almost in a straight line.',
          },
        },
        { t: 'p', text: 'Ask three questions. **Up or down?** Up, so positive. **Tight or loose?** Very tight, so strong. **Straight or curved?** Straight, so linear. Together: a strong, positive, linear association ($r \\approx 0.99$). In context: players who practiced more often tended to score more goals.' },
      ],
    },
    {
      approach: 'analogy',
      title: 'r is a tilt-and-tightness meter',
      blocks: [
        { t: 'p', text: 'Think of $r$ as a meter with a needle that runs from $-1$ on the left, through $0$ in the middle, to $1$ on the right.' },
        {
          t: 'list',
          items: [
            'The **side** the needle is on is the direction: left of $0$ is negative, right of $0$ is positive.',
            'How **far** the needle is from the middle is the strength: near the ends ($-1$ or $1$) the points line up tightly; near the middle they are scattered.',
          ],
        },
        { t: 'p', text: 'So $r = -0.9$ and $r = 0.9$ are equally strong; they just point in opposite directions. The meter only reads **straight-line** patterns, so a perfect curve can still read near $0$.' },
      ],
    },
    {
      approach: 'prerequisite',
      title: 'Refresher: plotting points and choosing axes',
      blocks: [
        { t: 'p', text: 'A point $(x, y)$ means: start at $(0, 0)$, go **right** $x$, then **up** $y$. So $(4, 83)$ is right $4$ and up $83$.' },
        { t: 'p', text: 'To decide which variable goes where, ask: "Which one might help explain or predict the other?" That one is the **explanatory** variable and goes on the horizontal $x$-axis. The other is the **response** and goes on the vertical $y$-axis.' },
        {
          t: 'list',
          items: [
            'Hours of practice and points scored: practice is explanatory ($x$), points is the response ($y$).',
            'Age of a phone and battery health: age is explanatory ($x$), battery health is the response ($y$).',
          ],
        },
        { t: 'p', text: 'Choose axis scales that cover the smallest and largest values, and label each axis with its variable and units.' },
      ],
    },
    {
      approach: 'step-by-step',
      title: 'A routine for describing any scatter plot',
      blocks: [
        {
          t: 'list',
          ordered: true,
          items: [
            '**Direction:** up to the right (positive), down to the right (negative), or neither (no association)?',
            '**Strength:** tight (strong), clear but scattered (moderate), or barely visible (weak)? If $r$ is given, use $|r| \\geq 0.8$ strong, $0.5 \\leq |r| < 0.8$ moderate, $|r| < 0.5$ weak.',
            '**Form:** straight-line pattern (linear) or curve (nonlinear)?',
            '**Unusual features:** any outliers far from the pattern, or separate clusters?',
            '**Context:** write one sentence with the real variable names, like "Phones that were older tended to have lower battery health."',
          ],
        },
      ],
    },
    {
      approach: 'alternate-strategy',
      title: 'Count the points in four boxes',
      blocks: [
        { t: 'p', text: 'Draw a vertical line at the mean of the $x$-values and a horizontal line at the mean of the $y$-values. This cuts the plot into four boxes.' },
        { t: 'p', text: 'For the study data, the means are $\\bar{x} = 3.1$ hours and $\\bar{y} = 77.1$ points.' },
        {
          t: 'table',
          caption: 'Where the ten study-data points fall.',
          headers: ['Box', 'Points', 'Count'],
          rows: [
            ['upper right (more hours, higher score)', '$(4, 83), (4, 79), (5, 88), (6, 92)$', '$4$'],
            ['lower left (fewer hours, lower score)', '$(1, 62), (1, 68), (2, 70), (2, 75), (3, 74)$', '$5$'],
            ['upper left', '$(3, 80)$', '$1$'],
            ['lower right', 'none', '$0$'],
          ],
        },
        { t: 'p', text: 'Most points ($9$ of $10$) are in the upper-right and lower-left boxes, so the association is **positive**. If most points were in the upper-left and lower-right boxes, it would be negative. If the points were spread about evenly over all four boxes, there would be no association. (This is the same idea the formula for $r$ uses.)' },
      ],
    },
  ],
  guided: [
    { generator: 'u7.scatter', difficulty: 1 },
    { generator: 'u7.scatter', difficulty: 1 },
    { generator: 'u7.scatter', difficulty: 2 },
    { generator: 'u7.scatter', difficulty: 2 },
  ],
  independent: {
    count: 8,
    reviewCount: 2,
    mix: [
      { generator: 'u7.scatter', difficulty: 1, weight: 1 },
      { generator: 'u7.scatter', difficulty: 2, weight: 2 },
      { generator: 'u7.scatter', difficulty: 3, weight: 2 },
    ],
  },
  quiz: {
    items: [
      { generator: 'u7.scatter', difficulty: 1 },
      { generator: 'u7.scatter', difficulty: 2 },
      { generator: 'u7.scatter', difficulty: 2 },
      { generator: 'u7.scatter', difficulty: 2 },
      { generator: 'u7.scatter', difficulty: 3 },
      { generator: 'u7.scatter', difficulty: 3 },
    ],
  },
  summary: [
    'A scatter plot shows bivariate data: put the explanatory variable on the $x$-axis and the response variable on the $y$-axis, one point per individual.',
    'Describe an association by direction (positive, negative or none), strength (strong, moderate or weak) and form (linear or nonlinear), and point out any outliers or clusters.',
    'The correlation coefficient $r$ is between $-1$ and $1$: its sign gives the direction and its size gives the strength ($|r| \\geq 0.8$ strong, $0.5 \\leq |r| < 0.8$ moderate, $|r| < 0.5$ weak).',
    '$r$ near $0$ means no **linear** association; a curved pattern can still be strong, so always look at the plot. A single outlier can change $r$ a lot.',
    'Describe the association in context with the real variables and the word "tended": "Students who studied more hours tended to score higher."',
  ],
  mastery: { quizPassScore: 0.8, practiceMinCorrect: 5 },
};
