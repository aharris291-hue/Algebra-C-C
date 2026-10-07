import type { LessonContent } from '../../../core/curriculum/types';

/**
 * U7L07 Linear Models: Slope and Intercept in Context (A.DSR.10.4)
 * A linear model y = ax + b for bivariate data, written with named variables and units; interpret the slope as
 * the predicted rate of change ("For each additional [1 x-unit], the predicted [y] increases (decreases) by |a|
 * [y-units]"), interpret the y-intercept ("When [x] is 0, the predicted [y] is [b]") and decide whether it makes
 * sense in context; find the predicted change in y for a change of k in x (a times k, with no b); and use the
 * model to predict, staying near the range of the data (S7.07).
 *
 * Math verified by hand (2026-10-07): each model fitted to plotted data is that data's least-squares line,
 * recomputed with node: battery data -> y = -12x + 98 exactly (r = -0.993); study data -> 5.2972x + 60.6787,
 * rounded to y = 5.3x + 60.7; basketball data -> 0.4484x - 1.1829, rounded to y = 0.45x - 1.2. Every prediction
 * and change was recomputed: battery 86, 74, 68 at x = 1, 2, 2.5, change -36 for 3 h and -6 for 0.5 h, 20% at
 * x = 6.5, 2% at x = 8; study 79.25 at x = 3.5, +10.6 for 2 h; basketball 9.6 at x = 24, 4.5 per 10 min; phone
 * 200 at x = 4, -135 for 3 years, -25 at x = 9; streamer 340 for 4 weeks (2050 - 1710), 1540 at week 4; game
 * -9 for 6 runs, x = 8 for 12 min, 9 min at x = 10, -6 at x = 20; arcade 5, 7, 9, 11, 13. Every scatter point
 * was checked to lie inside its window, and every line of fit stays inside its window across the whole x-range.
 */
export const U7L07: LessonContent = {
  lessonId: 'U7L07',
  goal: 'Use a linear model $y = ax + b$ for real data: explain what the slope and the $y$-intercept mean in context (with units), decide whether the intercept makes sense, find the predicted change in $y$ for a change in $x$, and use the model to make predictions.',
  needToKnow: [
    { t: 'p', text: 'This lesson puts together two things you already know:' },
    {
      t: 'list',
      items: [
        '**Slope-intercept form** $y = mx + b$: the slope $m$ is the change in $y$ for each increase of $1$ in $x$, and $b$ is the value of $y$ when $x = 0$.',
        '**Scatter plots** (last lesson): a strong linear association means the points cluster around a line.',
      ],
    },
    { t: 'callout', variant: 'tip', title: 'Quick check', text: 'For $y = 3x + 7$: what is $y$ when $x = 0$? ($7$.) How much does $y$ change when $x$ goes from $4$ to $5$? ($3$, the slope.) If that felt shaky, open **Teach Me Again** and choose the refresher.' },
  ],
  vocabulary: [
    { term: 'linear model', meaning: 'A line $y = ax + b$ used to describe and predict data that has a linear pattern. Its $y$-values are **predictions**, not exact facts.' },
    { term: 'predicted value', meaning: 'The $y$-value the model gives for a chosen $x$. Some books write it $\\hat{y}$ ("$y$-hat").' },
    { term: 'slope (in context)', meaning: 'The predicted change in the response variable for each increase of $1$ unit in the explanatory variable.' },
    { term: 'y-intercept (in context)', meaning: 'The predicted value of the response variable when the explanatory variable is $0$. It may or may not make sense.' },
    { term: 'extrapolation', meaning: 'Predicting for an $x$-value far outside the range of the data. It is risky because the pattern may not continue.' },
  ],
  instruction: [
    { t: 'p', text: '### A line that models data' },
    { t: 'p', text: 'Ten students streamed videos on fully charged phones and recorded how much battery was left. The points show a strong, negative, linear association, so a line describes them well. Technology finds the line of best fit (you will learn how in the next lesson):' },
    { t: 'math', tex: 'y = -12x + 98' },
    { t: 'p', text: 'where $x$ is the **hours of video streamed** and $y$ is the **predicted battery left (percent)**. You could also write it with words: $\\text{predicted battery} = -12(\\text{hours}) + 98$.' },
    {
      t: 'graph',
      caption: 'Hours of streaming versus battery left, with the model y = -12x + 98.',
      spec: {
        xMin: 0,
        xMax: 7,
        yMin: 0,
        yMax: 100,
        xStep: 1,
        yStep: 10,
        xLabel: 'hours streamed',
        yLabel: 'battery left (%)',
        scatter: [
          { x: 1, y: 88 }, { x: 1, y: 83 }, { x: 2, y: 75 }, { x: 2, y: 72 }, { x: 3, y: 65 },
          { x: 3, y: 61 }, { x: 4, y: 48 }, { x: 4, y: 54 }, { x: 5, y: 37 }, { x: 6, y: 25 },
        ],
        showLineOfFit: { m: -12, b: 98 },
        ariaLabel: 'Scatter plot of ten phones, hours streamed from 1 to 6 on the x-axis and battery left from 88 down to 25 percent on the y-axis. A straight line starts at 98 on the y-axis and falls 12 percent for every hour, passing through the middle of the points.',
      },
    },
    { t: 'p', text: 'The line does not go through every point. It shows the **overall trend**, so the $y$-values it gives are **predicted** values.' },
    { t: 'p', text: '### What the slope means' },
    { t: 'p', text: 'The slope is $-12$. Its units are **$y$-units per $x$-unit**: percent per hour. Use this sentence frame:' },
    { t: 'callout', variant: 'vocab', title: 'Slope sentence frame', text: '"For each additional **[1 $x$-unit]**, the predicted **[$y$]** increases (or decreases) by **[size of the slope] [$y$-units]**."' },
    { t: 'p', text: 'Here: **For each additional hour of streaming, the predicted battery left decreases by $12$ percentage points.** The slope is negative, so say **decreases** and use $12$, not $-12$ (saying "decreases by $-12$" would mean it goes up).' },
    { t: 'p', text: '### What the y-intercept means, and whether it makes sense' },
    { t: 'callout', variant: 'vocab', title: 'Intercept sentence frame', text: '"When **[$x$]** is $0$, the predicted **[$y$]** is **[$b$] [$y$-units]**." Then ask: can $x$ really be $0$ here, and is that predicted value possible?' },
    { t: 'p', text: 'Here: **When the hours streamed is $0$, the predicted battery left is $98\\%$.** That makes sense: a fully charged phone that has not streamed yet should be near $100\\%$. Sometimes the intercept does **not** make sense, for example if $x = 0$ is impossible or the predicted $y$ would be negative for something that cannot be negative. You will see one in the examples.' },
    { t: 'p', text: '### Using the model to predict' },
    { t: 'p', text: 'To predict, substitute the $x$-value. For $2.5$ hours of streaming:' },
    { t: 'math', tex: 'y = -12(2.5) + 98 = -30 + 98 = 68' },
    { t: 'p', text: 'The model predicts about $68\\%$ battery left after $2.5$ hours.' },
    { t: 'p', text: '### Predicted change for a change of k in x' },
    { t: 'p', text: 'Each extra unit of $x$ changes the prediction by the slope $a$, so $k$ extra units change it by $a \\cdot k$. The intercept is **not** part of a change; it is the same in both predictions and cancels.' },
    { t: 'math', tex: '\\text{predicted change in } y = a \\cdot k' },
    { t: 'p', text: 'Streaming $3$ more hours: $-12 \\cdot 3 = -36$, so the predicted battery drops $36$ percentage points. Streaming $30$ more minutes ($k = 0.5$ hour): $-12 \\cdot 0.5 = -6$ percentage points.' },
    { t: 'callout', variant: 'warning', title: 'Stay near the data', text: 'The data run from $1$ to $6$ hours. Predicting for $x = 2.5$ is safe because it is inside that range. Predicting far outside it is risky: at $x = 8$ hours the model says $2\\%$, and at $x = 9$ it would say $-10\\%$, which is impossible. A model is only trustworthy near the data it came from.' },
    { t: 'callout', variant: 'realworld', title: 'Why "predicted"?', text: 'Real phones vary: the two phones at $1$ hour had $88\\%$ and $83\\%$ left, while the model predicts $86\\%$. Saying "the **predicted** battery decreases by $12$" is accurate; saying "every phone loses exactly $12\\%$ per hour" is not.' },
  ],
  examples: [
    {
      title: 'Interpret the slope and intercept',
      kind: 'introductory',
      problem: [
        { t: 'p', text: 'For ten students, the model $y = 5.3x + 60.7$ relates $x$, the **hours studied**, to $y$, the **predicted quiz score** (points). The students studied between $1$ and $6$ hours. Interpret the slope and the $y$-intercept, and predict the score for $3.5$ hours of study.' },
        {
          t: 'graph',
          caption: 'Hours studied versus quiz score, with the model y = 5.3x + 60.7.',
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
            showLineOfFit: { m: 5.3, b: 60.7 },
            ariaLabel: 'Scatter plot of ten students, hours studied from 1 to 6 and quiz scores from 62 to 92, with a rising line that starts at about 61 on the y-axis and runs through the middle of the points.',
          },
        },
      ],
      steps: [
        { text: 'Identify the slope and the intercept.', tex: 'a = 5.3, \\qquad b = 60.7', why: 'In $y = ax + b$, the number multiplying $x$ is the slope and the number added on is the $y$-intercept.' },
        { text: 'Interpret the slope with the frame.', why: 'The slope is positive, so the prediction increases. Its units are points per hour: "For each additional hour studied, the predicted quiz score increases by $5.3$ points."' },
        { text: 'Interpret the intercept and check it.', why: '"When the hours studied is $0$, the predicted quiz score is $60.7$ points." This makes sense: a student can study $0$ hours, and $60.7$ is a possible score. It is a little outside the data ($1$ to $6$ hours), so treat it as a rough estimate.' },
        { text: 'Predict for $x = 3.5$.', tex: 'y = 5.3(3.5) + 60.7 = 18.55 + 60.7 = 79.25', why: '$3.5$ hours is inside the data range, so the prediction is reasonable.' },
      ],
      answer: 'Slope: for each additional hour studied, the predicted quiz score increases by $5.3$ points. Intercept: a student who studies $0$ hours has a predicted score of $60.7$ points (this makes sense). For $3.5$ hours, the predicted score is about $79.3$ points.',
    },
    {
      title: 'An intercept that does not make sense',
      kind: 'intermediate',
      problem: [
        { t: 'p', text: 'For ten basketball players who each played $12$ to $34$ minutes in a game, the model $y = 0.45x - 1.2$ relates $x$, the **minutes played**, to $y$, the **predicted points scored**. Interpret the slope and the $y$-intercept. Does the intercept make sense?' },
        {
          t: 'graph',
          caption: 'Minutes played versus points scored, with the model y = 0.45x - 1.2.',
          spec: {
            xMin: 0,
            xMax: 36,
            yMin: -2,
            yMax: 16,
            xStep: 4,
            yStep: 2,
            xLabel: 'minutes played',
            yLabel: 'points',
            scatter: [
              { x: 12, y: 2 }, { x: 15, y: 7 }, { x: 18, y: 7 }, { x: 20, y: 7 }, { x: 22, y: 9 },
              { x: 25, y: 12 }, { x: 28, y: 14 }, { x: 30, y: 11 }, { x: 32, y: 12 }, { x: 34, y: 13 },
            ],
            showLineOfFit: { m: 0.45, b: -1.2 },
            ariaLabel: 'Scatter plot of ten players, minutes played from 12 to 34 and points from 2 to 14. A rising line runs through the points and, extended to the left, crosses the y-axis just below zero, at -1.2.',
          },
        },
      ],
      steps: [
        { text: 'Interpret the slope.', tex: 'a = 0.45 \\text{ points per minute}', why: '"For each additional minute played, the predicted points scored increases by $0.45$ points." Because one minute is small, it can help to scale up: $10$ more minutes means $0.45 \\cdot 10 = 4.5$ more predicted points.' },
        { text: 'State the intercept with the frame.', tex: 'b = -1.2', why: '"When the minutes played is $0$, the predicted points scored is $-1.2$ points."' },
        { text: 'Check whether it makes sense.', why: 'A player cannot score a negative number of points, and a player who plays $0$ minutes scores exactly $0$. Also, $x = 0$ is far outside the data ($12$ to $34$ minutes).' },
        { text: 'Conclude.', why: 'The intercept just tells where the line crosses the axis. It is not meaningful in this context. The model is still useful inside $12$ to $34$ minutes, for example $0.45(24) - 1.2 = 9.6$ points for $24$ minutes.' },
      ],
      answer: 'Slope: for each additional minute played, the predicted points scored increases by $0.45$ points. Intercept: at $0$ minutes the predicted points scored is $-1.2$, which does **not** make sense (points cannot be negative, and $0$ minutes is far outside the data).',
    },
    {
      title: 'Reselling a phone',
      kind: 'real-world',
      problem: [
        { t: 'p', text: 'A resale website looked at used phones of one model that were $1$ to $6$ years old. The model $y = -45x + 380$ relates $x$, the **age of the phone (years)**, to $y$, the **predicted resale price (dollars)**. (a) Interpret the slope. (b) Predict the price of a $4$-year-old phone. (c) By how much does the predicted price change from age $2$ to age $5$? (d) Should you use the model for a $9$-year-old phone?' },
      ],
      steps: [
        { text: '(a) Interpret the slope.', tex: 'a = -45 \\text{ dollars per year}', why: 'The slope is negative, so the predicted price decreases: "For each additional year of age, the predicted resale price decreases by \\$45."' },
        { text: '(b) Substitute $x = 4$.', tex: 'y = -45(4) + 380 = -180 + 380 = 200', why: '$4$ years is inside the data ($1$ to $6$ years), so this is a reasonable prediction.' },
        { text: '(c) Find the change in $x$, then multiply by the slope.', tex: 'k = 5 - 2 = 3, \\qquad -45 \\cdot 3 = -135', why: 'Each year lowers the prediction by \\$45, so $3$ years lower it by \\$135. Check: $y(2) = 290$ and $y(5) = 155$, and $155 - 290 = -135$.' },
        { text: '(d) Try $x = 9$ and judge it.', tex: 'y = -45(9) + 380 = -405 + 380 = -25', why: 'A price of $-\\$25$ is impossible. $9$ years is far outside the data, so the straight-line pattern should not be trusted there (extrapolation).' },
      ],
      answer: '(a) For each additional year of age, the predicted resale price decreases by \\$45. (b) About \\$200. (c) It decreases by \\$135. (d) No: the model predicts $-\\$25$, which is impossible, because $9$ years is far outside the $1$-to-$6$-year data.',
    },
    {
      title: 'A common mistake: adding the intercept to a change',
      kind: 'common-mistake',
      problem: [
        { t: 'p', text: 'A new streamer\'s follower count is modeled by $y = 85x + 1200$, where $x$ is the **number of weeks since the streamer started** and $y$ is the **predicted number of followers**. The question asks, "By how much does the predicted number of followers change over the next $4$ weeks?" A student writes $85(4) + 1200 = 1540$ followers. What went wrong?' },
      ],
      steps: [
        { text: 'See what the student actually found.', tex: '85(4) + 1200 = 1540', why: 'Substituting $x = 4$ gives the predicted number of followers **at week $4$**, not a change.' },
        { text: 'Use the slope for a change.', tex: '85 \\cdot 4 = 340', why: 'Each additional week adds $85$ predicted followers, so $4$ weeks add $85 \\cdot 4$. The $1200$ is the starting point, and it does not change.' },
        { text: 'Check with two predictions, for example weeks $6$ and $10$.', tex: 'y(6) = 1710, \\quad y(10) = 2050, \\quad 2050 - 1710 = 340', why: 'Both predictions contain the $+1200$, so it cancels when you subtract. Any $4$-week stretch gives the same change, $340$.' },
      ],
      answer: 'The predicted change is $85 \\cdot 4 = 340$ followers. The student\'s $1540$ is the predicted number of followers at week $4$; the intercept $1200$ should not be added to a change.',
    },
    {
      title: 'Working backward from a prediction',
      kind: 'challenging',
      problem: [
        { t: 'p', text: 'In a racing game, players were timed on one level after $0$ to $10$ practice runs. The model $y = -1.5x + 24$ relates $x$, the **number of practice runs**, to $y$, the **predicted time to finish the level (minutes)**. (a) Interpret the slope and the intercept. (b) Find the predicted change in time after $6$ more practice runs. (c) After how many practice runs is the predicted time $12$ minutes? (d) What does the model predict for $20$ runs, and should you trust it?' },
      ],
      steps: [
        { text: '(a) Interpret the slope and intercept.', tex: 'a = -1.5, \\qquad b = 24', why: '"For each additional practice run, the predicted time decreases by $1.5$ minutes." "When the number of practice runs is $0$, the predicted time is $24$ minutes." That makes sense: a first-time player with no practice.' },
        { text: '(b) Multiply the slope by the change in $x$.', tex: '-1.5 \\cdot 6 = -9', why: 'Six more runs lower the predicted time by $9$ minutes, no matter how many runs the player had already done (within the data).' },
        { text: '(c) Set the prediction equal to $12$ and solve for $x$.', tex: '-1.5x + 24 = 12 \\;\\Rightarrow\\; -1.5x = -12 \\;\\Rightarrow\\; x = 8', why: 'This time we know $y$ and want $x$, so solve the equation. Check: $-1.5(8) + 24 = -12 + 24 = 12$.' },
        { text: '(d) Substitute $x = 20$ and judge.', tex: 'y = -1.5(20) + 24 = -30 + 24 = -6', why: 'A negative time is impossible. $20$ runs is far outside the data ($0$ to $10$), and in real life times level off instead of dropping forever.' },
      ],
      answer: '(a) For each additional practice run, the predicted time decreases by $1.5$ minutes; with $0$ runs the predicted time is $24$ minutes (meaningful). (b) $-9$ minutes (the predicted time drops by $9$ minutes). (c) $8$ practice runs. (d) $-6$ minutes, which is impossible, so the model should not be used that far outside the data.',
    },
  ],
  teachMeAgain: [
    {
      approach: 'visual',
      title: 'See the slope as a staircase step',
      blocks: [
        { t: 'p', text: 'On the battery model $y = -12x + 98$, start on the line at $1$ hour (predicted $86\\%$). Step **right $1$ hour** to $2$ hours: the line is now at $74\\%$, so you stepped **down $12$**.' },
        {
          t: 'graph',
          caption: 'Moving right 1 hour along the line moves down 12 percentage points. The line meets the y-axis at 98.',
          spec: {
            xMin: 0,
            xMax: 7,
            yMin: 0,
            yMax: 100,
            xStep: 1,
            yStep: 10,
            xLabel: 'hours streamed',
            yLabel: 'battery left (%)',
            showLineOfFit: { m: -12, b: 98 },
            segments: [
              { x1: 1, y1: 86, x2: 2, y2: 86, dashed: true, label: 'right 1 h' },
              { x1: 2, y1: 86, x2: 2, y2: 74, dashed: true, label: 'down 12' },
            ],
            points: [
              { x: 0, y: 98, label: '(0, 98)' },
              { x: 1, y: 86, label: '(1, 86)' },
              { x: 2, y: 74, label: '(2, 74)' },
            ],
            ariaLabel: 'The line y = -12x + 98 from (0, 98) down to (7, 14). A dashed step goes right from (1, 86) to (2, 86) and then down to (2, 74), showing a drop of 12 for 1 hour. The point (0, 98) marks the y-intercept.',
          },
        },
        { t: 'p', text: 'Every one-hour step along the line is the same: down $12$. That is what "for each additional hour, the predicted battery decreases by $12$ percentage points" means. The point where the line meets the $y$-axis, $(0, 98)$, is the intercept: $0$ hours, $98\\%$ predicted.' },
      ],
    },
    {
      approach: 'simpler-example',
      title: 'Arcade game cards',
      blocks: [
        { t: 'p', text: 'At an arcade, a simple model for the money on your game card is $y = 2x + 5$, where $x$ is the **number of games won** and $y$ is the **predicted credit (dollars)**.' },
        {
          t: 'table',
          caption: 'Predicted credit for 0 to 4 games won.',
          headers: ['Games won $x$', '$0$', '$1$', '$2$', '$3$', '$4$'],
          rows: [['Predicted credit $y$ (\\$)', '$5$', '$7$', '$9$', '$11$', '$13$']],
        },
        { t: 'p', text: '**Slope:** each extra game won adds \\$2, so "for each additional game won, the predicted credit increases by \\$2." **Intercept:** at $0$ games, \\$5, so "when the number of games won is $0$, the predicted credit is \\$5" (the starting credit, which makes sense). **Change:** winning $3$ more games adds $2 \\cdot 3 = \\$6$.' },
      ],
    },
    {
      approach: 'analogy',
      title: 'A price tag and a cover charge',
      blocks: [
        { t: 'p', text: 'Think of a model like a bill at a place that charges a **cover charge** plus a **price per item**.' },
        {
          t: 'list',
          items: [
            'The **intercept** is the cover charge: what you pay before you buy anything ($x = 0$).',
            'The **slope** is the price tag: how much each additional item adds.',
            'Buying $k$ more items adds (price) $\\times$ $k$ to the bill. The cover charge was already paid, so it does not get added again. That is why a change in $y$ is $a \\cdot k$, not $a \\cdot k + b$.',
          ],
        },
        { t: 'p', text: 'Sometimes the "cover charge" makes no sense (like $-1.2$ points for $0$ minutes of basketball). Then it is just where the line crosses the axis, not a real starting value.' },
      ],
    },
    {
      approach: 'prerequisite',
      title: 'Refresher: slope and y-intercept',
      blocks: [
        { t: 'p', text: 'For a line $y = ax + b$:' },
        {
          t: 'list',
          items: [
            'The **slope** $a = \\frac{\\text{change in } y}{\\text{change in } x}$. For $y = 4x + 1$, going from $x = 2$ to $x = 3$ changes $y$ from $9$ to $13$: a change of $4$, the slope.',
            'The **$y$-intercept** $b$ is $y$ when $x = 0$: $y = 4(0) + 1 = 1$.',
            'The **units of the slope** are $y$-units per $x$-unit. If $y$ is in dollars and $x$ is in hours, the slope is in dollars per hour.',
          ],
        },
        { t: 'p', text: 'The only new idea in this lesson is that the $y$-values are **predictions** for data, so each sentence says "the **predicted** ...".' },
      ],
    },
    {
      approach: 'step-by-step',
      title: 'Fill in the frames',
      blocks: [
        {
          t: 'list',
          ordered: true,
          items: [
            '**Name the variables and units.** $x$ = ? (units), $y$ = predicted ? (units).',
            '**Slope:** "For each additional [$1$ $x$-unit], the predicted [$y$] [increases if $a > 0$ / decreases if $a < 0$] by [$|a|$] [$y$-units]."',
            '**Intercept:** "When [$x$] is $0$, the predicted [$y$] is [$b$] [$y$-units]." Then check: is $x = 0$ possible and near the data? Is that $y$ possible?',
            '**Predict:** substitute the $x$-value, and check that it is near the range of the data.',
            '**Change for $k$ more units of $x$:** multiply $a \\cdot k$. Do not add $b$.',
          ],
        },
        { t: 'p', text: 'Example with $y = -45x + 380$ (phone age in years, predicted price in dollars): for each additional year of age, the predicted price decreases by \\$45; at age $0$ the predicted price is \\$380; for $2$ more years the predicted price changes by $-45 \\cdot 2 = -\\$90$.' },
      ],
    },
    {
      approach: 'alternate-strategy',
      title: 'Make a small table of predictions',
      blocks: [
        { t: 'p', text: 'If the sentences feel abstract, make a table of predictions and look at the numbers. For the game model $y = -1.5x + 24$ (practice runs, predicted minutes):' },
        {
          t: 'table',
          caption: 'Predicted times for 0 to 4 practice runs.',
          headers: ['Practice runs $x$', '$0$', '$1$', '$2$', '$3$', '$4$'],
          rows: [['Predicted time $y$ (min)', '$24$', '$22.5$', '$21$', '$19.5$', '$18$']],
        },
        {
          t: 'list',
          items: [
            'Each column to the right drops by $1.5$: that is the slope, minutes per run.',
            'The first column ($x = 0$) is the intercept, $24$ minutes.',
            'From $x = 1$ to $x = 4$ ($3$ more runs) the prediction goes from $22.5$ to $18$, a change of $-4.5 = -1.5 \\cdot 3$.',
          ],
        },
        { t: 'p', text: 'Subtracting two predictions always gives the same answer as slope times the change in $x$.' },
      ],
    },
  ],
  guided: [
    { generator: 'u7.linear-model', difficulty: 1 },
    { generator: 'u7.linear-model', difficulty: 1 },
    { generator: 'u7.linear-model', difficulty: 2 },
    { generator: 'u7.linear-model', difficulty: 2 },
  ],
  independent: {
    count: 8,
    reviewCount: 2,
    mix: [
      { generator: 'u7.linear-model', difficulty: 1, weight: 1 },
      { generator: 'u7.linear-model', difficulty: 2, weight: 2 },
      { generator: 'u7.linear-model', difficulty: 3, weight: 2 },
    ],
  },
  quiz: {
    items: [
      { generator: 'u7.linear-model', difficulty: 1 },
      { generator: 'u7.linear-model', difficulty: 2 },
      { generator: 'u7.linear-model', difficulty: 2 },
      { generator: 'u7.linear-model', difficulty: 2 },
      { generator: 'u7.linear-model', difficulty: 3 },
      { generator: 'u7.linear-model', difficulty: 3 },
    ],
  },
  summary: [
    'A linear model $y = ax + b$ describes the trend in data; its $y$-values are **predictions**, so name the variables with units and say "predicted".',
    'Slope: "For each additional [$1$ $x$-unit], the predicted [$y$] increases (decreases) by [$|a|$] [$y$-units]." Use "decreases" and the size of the slope when $a < 0$.',
    'Intercept: "When [$x$] is $0$, the predicted [$y$] is [$b$]." It is meaningful only if $x = 0$ makes sense (and is near the data) and the predicted value is possible.',
    'The predicted change in $y$ for a change of $k$ in $x$ is $a \\cdot k$; the intercept is not added.',
    'To predict, substitute $x$. Predictions inside the range of the data are more reliable than predictions far outside it, which can even be impossible values.',
  ],
  mastery: { quizPassScore: 0.8, practiceMinCorrect: 5 },
};
