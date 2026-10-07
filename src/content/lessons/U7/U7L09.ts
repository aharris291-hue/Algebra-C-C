import type { LessonContent } from '../../../core/curriculum/types';

/**
 * U7L09 Choosing Models; Correlation vs Causation (A.DSR.10.6, A.DSR.10.7)
 * Choose a linear, quadratic or exponential model for data from its scatter plot (straight band; rises then
 * falls or falls then rises; curve that keeps getting steeper or flattens toward 0) and from a table of
 * approximate data with equal x-steps (nearly constant first differences = linear, nearly constant second
 * differences or a turn = quadratic, nearly constant ratios = exponential), and use the context to decide which
 * model makes sense, including where a model gives impossible values (S7.09). Correlation does not imply
 * causation: a correlation can come from a lurking (confounding) variable, from cause running the other way,
 * or from coincidence; only a randomized experiment, with random assignment to a treatment and a control group,
 * can show cause and effect (S7.10).
 *
 * Math verified by hand (2026-10-07): every difference, second difference and ratio quoted was recomputed with
 * node: table A 12.1, 15.0, 17.9, 21.1, 23.9, 27.0 (differences 2.9, 2.9, 3.2, 2.8, 3.1); table B 2.1, 7.0,
 * 15.9, 29.1, 45.9, 67.0 (differences 4.9, 8.9, 13.2, 16.8, 21.1; second differences 4.0, 4.3, 3.6, 4.3; ratios
 * 3.33, 2.27, 1.83, 1.58, 1.46); table C 8, 12, 18.1, 27, 40.4, 60.8 (differences 4, 6.1, 8.9, 13.4, 20.4;
 * second differences 2.1, 2.8, 4.5, 7; ratios 1.5, 1.508, 1.492, 1.496, 1.505); video views 120, 250, 480,
 * 1010, 1950, 4100 (ratios 2.083, 1.92, 2.104, 1.931, 2.103); savings 20, 34, 51, 63, 80, 95, 108, 124
 * (differences 14, 17, 12, 17, 15, 13, 16); phone resale values 800, 640, 515, 410, 330, 262 (ratios 0.8,
 * 0.805, 0.796, 0.805, 0.794); its least-squares line from linearRegression in src/core/math/stats.ts is
 * m = -745/7 = -106.428571, b = 758.904762, r = -0.987773, which is 0 near t = 7.13 and gives -92.52 at t = 8,
 * while 800(0.8)^t gives 262.14 at t = 5 and 134.22 at t = 8. Every scatter point and the drawn line of fit were
 * checked to lie inside their windows, and every expression was parsed with src/core/math/parser.ts.
 */
export const U7L09: LessonContent = {
  lessonId: 'U7L09',
  goal: 'Choose a linear, quadratic or exponential model for a data set from its graph, a table of approximate values and the context, and explain why a correlation between two variables does not by itself show that one causes the other.',
  needToKnow: [
    { t: 'p', text: 'You will use two earlier ideas:' },
    {
      t: 'list',
      items: [
        '**The three function families** from Unit 6. With equal $x$-steps: constant first differences mean linear, constant second differences mean quadratic, and a constant ratio means exponential.',
        '**Correlation** from the last two lessons. $r$ measures the direction and strength of a linear association; a strong $r$ means the points lie close to a line.',
      ],
    },
    { t: 'callout', variant: 'tip', title: 'Quick check', text: 'The outputs $5, 10, 20, 40$ come from $x = 0, 1, 2, 3$. Are the differences constant, or the ratios? (Differences $5, 10, 20$ are not constant; ratios are all $2$, so the pattern is exponential.) If that felt shaky, open **Teach Me Again** and choose the refresher.' },
  ],
  vocabulary: [
    { term: 'model', meaning: 'A function (linear, quadratic, exponential, ...) chosen to describe the pattern in data and make predictions.' },
    { term: 'causation', meaning: 'A change in one variable actually **produces** a change in the other.' },
    { term: 'lurking (confounding) variable', meaning: 'A third variable, not part of the study, that affects both variables and can make them look related.' },
    { term: 'observational study', meaning: 'Researchers only observe or survey; they do not assign anyone to a group.' },
    { term: 'randomized experiment', meaning: 'Researchers **randomly assign** subjects to a treatment group and a control group, then compare the results.' },
  ],
  instruction: [
    { t: 'p', text: '### Part 1: Which model fits the data?' },
    { t: 'p', text: 'Real data are never perfect, so the fingerprints from Unit 6 show up as **nearly** constant. Start with the scatter plot and look at its overall shape.' },
    {
      t: 'table',
      caption: 'What each model looks like in a scatter plot and in a table with equal x-steps.',
      headers: ['Model', 'Scatter plot', 'Table of approximate data'],
      rows: [
        ['linear', 'points in a straight band', 'first differences nearly constant'],
        ['quadratic', 'rises then falls (or falls then rises), symmetric-looking curve', 'second differences nearly constant; the values turn around'],
        ['exponential', 'curve that gets steeper and steeper (growth), or drops quickly and then flattens toward $0$ (decay)', 'ratios nearly constant'],
      ],
    },
    {
      t: 'graph',
      caption: 'Linear: money saved over 8 weeks grows by about the same amount each week.',
      spec: {
        xMin: 0,
        xMax: 9,
        yMin: 0,
        yMax: 140,
        yStep: 20,
        xLabel: 'week',
        yLabel: 'savings ($)',
        scatter: [
          { x: 1, y: 20 },
          { x: 2, y: 34 },
          { x: 3, y: 51 },
          { x: 4, y: 63 },
          { x: 5, y: 80 },
          { x: 6, y: 95 },
          { x: 7, y: 108 },
          { x: 8, y: 124 },
        ],
        ariaLabel: 'Scatter plot of week (1 to 8) against savings in dollars: (1, 20), (2, 34), (3, 51), (4, 63), (5, 80), (6, 95), (7, 108), (8, 124). The points form a straight, rising band.',
      },
    },
    {
      t: 'graph',
      caption: 'Quadratic: money raised at a school concert rises and then falls as the ticket price goes up.',
      spec: {
        xMin: 0,
        xMax: 45,
        yMin: 0,
        yMax: 60,
        xStep: 5,
        yStep: 10,
        xLabel: 'ticket price ($)',
        yLabel: 'money raised (hundreds of $)',
        scatter: [
          { x: 5, y: 20 },
          { x: 10, y: 35 },
          { x: 15, y: 44 },
          { x: 20, y: 50 },
          { x: 25, y: 49 },
          { x: 30, y: 45 },
          { x: 35, y: 34 },
          { x: 40, y: 20 },
        ],
        ariaLabel: 'Scatter plot of ticket price in dollars against money raised in hundreds of dollars: (5, 20), (10, 35), (15, 44), (20, 50), (25, 49), (30, 45), (35, 34), (40, 20). The points rise to a peak near 20 to 25 dollars and then fall, making an upside-down U.',
      },
    },
    {
      t: 'graph',
      caption: 'Exponential: a video\'s views roughly double every day.',
      spec: {
        xMin: 0,
        xMax: 6,
        yMin: 0,
        yMax: 4500,
        yStep: 500,
        xLabel: 'day',
        yLabel: 'views',
        scatter: [
          { x: 0, y: 120 },
          { x: 1, y: 250 },
          { x: 2, y: 480 },
          { x: 3, y: 1010 },
          { x: 4, y: 1950 },
          { x: 5, y: 4100 },
        ],
        ariaLabel: 'Scatter plot of day (0 to 5) against views: (0, 120), (1, 250), (2, 480), (3, 1010), (4, 1950), (5, 4100). The points stay low at first and then shoot up, each one about twice the one before.',
      },
    },
    { t: 'p', text: 'Check a table the same way you did in Unit 6, but accept small wobbles. The views above have ratios $\\frac{250}{120} \\approx 2.08$, $\\frac{480}{250} = 1.92$, $\\frac{1010}{480} \\approx 2.10$, $\\frac{1950}{1010} \\approx 1.93$ and $\\frac{4100}{1950} \\approx 2.10$, all close to $2$: exponential.' },
    { t: 'callout', variant: 'why', title: 'Why context matters', text: 'Data only cover a limited range, and two different models can both look fine there. The situation tells you how the pattern should behave **beyond** the data. Money raised by ticket price must eventually fall (at a very high price, nobody comes), so a model that turns around (quadratic) fits the story. A phone\'s value loses about the same **percent** each year and can never drop below \\$0, which is how exponential decay behaves, while a line would eventually go negative. A thrown ball goes up and comes down: quadratic. Savings with the same deposit each week: linear.' },
    { t: 'p', text: '### Part 2: Correlation is not causation' },
    { t: 'p', text: 'In a beach town, days with more ice cream sales also have more sunburns. The correlation is strong. Does eating ice cream cause sunburns? No. **Hot, sunny weather** makes people buy more ice cream **and** makes them spend more time in the sun. The weather is a **lurking variable**: it drives both, so the two rise and fall together without one causing the other.' },
    {
      t: 'list',
      items: [
        '**A lurking variable** can create a correlation: shoe size and reading level of elementary students are correlated because **older** kids have bigger feet and read better.',
        '**The cause can run the other way:** students who get tutoring tend to have lower grades, but it is low grades that lead students to get tutoring, not tutoring that lowers grades.',
        '**It can be coincidence:** with enough data sets, some unrelated things will line up by chance.',
      ],
    },
    { t: 'callout', variant: 'warning', title: 'Even a strong r is not proof', text: 'An $r$ of $0.95$ says the points are close to a line. It says nothing about **why**. A correlation is a reason to investigate, not a conclusion.' },
    { t: 'p', text: '**Only a randomized experiment can show cause and effect.** Researchers **randomly assign** subjects to a treatment group (which gets the thing being tested) and a control group (which does not). Random assignment spreads out every lurking variable (age, effort, money, sleep, anything) evenly between the groups, so if the groups end up clearly different, the treatment is the only reasonable explanation. An **observational study**, where people choose for themselves (like a survey), cannot rule out lurking variables, so it can show a correlation but not causation.' },
    { t: 'callout', variant: 'realworld', title: 'Where this shows up', text: 'Headlines like "Teens who play sports get better grades" are usually based on surveys. Before believing "sports raise grades", ask: did the researchers randomly assign who played? If not, a lurking variable (time management, family support, school rules about grades for athletes) could explain it.' },
  ],
  examples: [
    {
      title: 'Choose a model from a scatter plot',
      kind: 'introductory',
      problem: [
        { t: 'p', text: 'Look back at the three scatter plots in the lesson: savings by week, money raised by ticket price, and video views by day. Choose a linear, quadratic or exponential model for each.' },
      ],
      steps: [
        { text: 'Savings by week: look at the shape.', tex: '\\text{straight rising band} \\Rightarrow \\text{linear}', why: 'The savings go up by about the same amount each week (differences $14, 17, 12, 17, 15, 13, 16$, all near $15$).' },
        { text: 'Money raised by ticket price: look at the shape.', tex: '\\text{rises, peaks, falls} \\Rightarrow \\text{quadratic}', why: 'A turn-around (a highest point in the middle) is the sign of a quadratic. A line cannot turn around, and an exponential curve does not either.' },
        { text: 'Views by day: look at the shape.', tex: '\\text{flat, then steeper and steeper} \\Rightarrow \\text{exponential}', why: 'The jumps keep growing, and the ratios are all close to $2$, so the views roughly double each day.' },
      ],
      answer: 'Savings: linear. Money raised: quadratic. Video views: exponential.',
    },
    {
      title: 'Choose a model from a table of approximate data',
      kind: 'intermediate',
      problem: [
        { t: 'p', text: 'Each data set uses $x = 0, 1, 2, 3, 4, 5$. Choose the best model for each.' },
        {
          t: 'table',
          caption: 'Three sets of approximate data.',
          headers: ['$x$', '$0$', '$1$', '$2$', '$3$', '$4$', '$5$'],
          rows: [
            ['A', '$12.1$', '$15.0$', '$17.9$', '$21.1$', '$23.9$', '$27.0$'],
            ['B', '$2.1$', '$7.0$', '$15.9$', '$29.1$', '$45.9$', '$67.0$'],
            ['C', '$8$', '$12$', '$18.1$', '$27$', '$40.4$', '$60.8$'],
          ],
        },
      ],
      steps: [
        { text: 'A: first differences.', tex: '2.9, \\; 2.9, \\; 3.2, \\; 2.8, \\; 3.1', why: 'All close to $3$, so A is linear.' },
        { text: 'B: first differences, then second differences.', tex: '\\text{first: } 4.9, 8.9, 13.2, 16.8, 21.1 \\qquad \\text{second: } 4.0, 4.3, 3.6, 4.3', why: 'The first differences grow, but they grow by about the same amount (near $4$) each time. Nearly constant second differences mean quadratic.' },
        { text: 'C: first and second differences.', tex: '\\text{first: } 4, 6.1, 8.9, 13.4, 20.4 \\qquad \\text{second: } 2.1, 2.8, 4.5, 7', why: 'Even the second differences keep growing, so C is not quadratic. Try ratios.' },
        { text: 'C: ratios.', tex: '\\tfrac{12}{8} = 1.5, \\; \\tfrac{18.1}{12} \\approx 1.508, \\; \\tfrac{27}{18.1} \\approx 1.492, \\; \\tfrac{40.4}{27} \\approx 1.496, \\; \\tfrac{60.8}{40.4} \\approx 1.505', why: 'All close to $1.5$, so each value is about $1.5$ times the one before: exponential.' },
      ],
      answer: 'A is linear (differences near $3$), B is quadratic (second differences near $4$), C is exponential (ratios near $1.5$).',
    },
    {
      title: 'Phone resale value: let the context decide',
      kind: 'real-world',
      problem: [
        { t: 'p', text: 'Maria tracked the resale value of a phone that cost \\$800: \\$800, \\$640, \\$515, \\$410, \\$330 and \\$262 after $0$ to $5$ years. Technology gives the line of best fit $y = -106.43x + 758.90$ with $r = -0.988$. Her friend says, "$r$ is so strong that the line must be the right model." Which model should Maria use to estimate the value after $8$ years?' },
        {
          t: 'graph',
          caption: 'Phone resale values with the line of best fit (solid) and the exponential model 800(0.8)^x (dashed).',
          spec: {
            xMin: 0,
            xMax: 9,
            yMin: -200,
            yMax: 900,
            yStep: 100,
            xLabel: 'years',
            yLabel: 'value ($)',
            scatter: [
              { x: 0, y: 800 },
              { x: 1, y: 640 },
              { x: 2, y: 515 },
              { x: 3, y: 410 },
              { x: 4, y: 330 },
              { x: 5, y: 262 },
            ],
            showLineOfFit: { m: -106.43, b: 758.9 },
            functions: [{ expr: '800(0.8)^x', label: 'y = 800(0.8)^x', dashed: true, domain: [0, 9] }],
            ariaLabel: 'Scatter plot of years (0 to 5) against phone value in dollars: (0, 800), (1, 640), (2, 515), (3, 410), (4, 330), (5, 262). The points curve downward and level off. The straight line of best fit cuts through them and keeps falling, going below 0 a little after year 7. The dashed exponential curve passes through the points and flattens out above 0.',
          },
        },
      ],
      steps: [
        { text: 'Look at the shape.', why: 'The points drop fast and then level off. That bend is visible even though $r$ is strong; a line just cannot bend.' },
        { text: 'Check the ratios.', tex: '\\tfrac{640}{800} = 0.8, \\; \\tfrac{515}{640} \\approx 0.805, \\; \\tfrac{410}{515} \\approx 0.796, \\; \\tfrac{330}{410} \\approx 0.805, \\; \\tfrac{262}{330} \\approx 0.794', why: 'The value keeps about $80\\%$ each year, a nearly constant ratio, so the data are exponential: about $y = 800(0.8)^x$.' },
        { text: 'Test the line at $8$ years.', tex: 'y = -106.43(8) + 758.90 = -92.54', why: 'A phone cannot be worth a negative amount. The line crosses $0$ a little after year $7$.' },
        { text: 'Use the exponential model at $8$ years.', tex: 'y = 800(0.8)^8 \\approx 134.22', why: 'Exponential decay shrinks by the same percent each year and never goes below $0$, which matches how phone values really behave.' },
      ],
      answer: 'The exponential model $y = 800(0.8)^x$, which gives about \\$134 after $8$ years. A strong $r$ only means a line is close to the points over the data; the bend in the scatter plot, the nearly constant ratios and the context (a value that loses a percent each year and cannot go negative) all point to exponential.',
    },
    {
      title: 'Find the lurking variable',
      kind: 'intermediate',
      problem: [
        { t: 'p', text: 'Data from an elementary school show a strong positive correlation between students\' shoe sizes and their reading scores. A parent concludes that bigger feet help kids read. What is a better explanation?' },
      ],
      steps: [
        { text: 'Ask whether one could really cause the other.', why: 'Feet do not do the reading, and reading does not make feet grow. Direct cause in either direction makes no sense.' },
        { text: 'Look for a third variable that affects both.', tex: '\\text{age} \\to \\text{shoe size}, \\qquad \\text{age} \\to \\text{reading score}', why: 'The school has students from kindergarten to 5th grade. Older students have bigger feet **and** have had more years of reading practice.' },
        { text: 'Explain the correlation.', why: 'Age is the lurking variable. If you compared only students of the same age, the correlation would mostly disappear.' },
      ],
      answer: 'Age (grade level) is a lurking variable: older students have bigger feet and also read better. The correlation does not show that shoe size affects reading.',
    },
    {
      title: 'A common mistake: treating a correlation as a cause',
      kind: 'common-mistake',
      problem: [
        { t: 'p', text: 'A survey of 500 high school students finds a moderate negative correlation ($r = -0.6$) between daily hours of phone screen time and GPA. A student writes: "This proves that screen time lowers grades, so cutting screen time will raise your GPA." What is wrong?' },
      ],
      steps: [
        { text: 'Identify the type of study.', why: 'It is a **survey**, an observational study. Students chose their own screen time; nobody was assigned to use more or less.' },
        { text: 'Name possible lurking variables.', tex: '\\text{sleep}, \\; \\text{homework time}, \\; \\text{after-school job}, \\; \\text{family rules}', why: 'For example, a student who works late at a job may have less time for homework **and** more evening scrolling. That alone could produce the correlation.' },
        { text: 'Consider the other direction.', why: 'A student who is struggling in class might give up and spend more time on the phone. Then low grades lead to more screen time, not the other way around.' },
        { text: 'Say what the data do show.', why: 'There is an association: students with more screen time **tend to** have lower GPAs. Screen time **might** be part of the cause, but this survey cannot tell. A randomized experiment would be needed.' },
      ],
      answer: 'A correlation from a survey does not prove causation. Lurking variables (sleep, homework time, jobs, family rules) or cause running the other way could explain it. The correct conclusion: screen time and GPA are negatively associated in these students.',
    },
    {
      title: 'Design a study that can show cause and effect',
      kind: 'challenging',
      problem: [
        { t: 'p', text: 'A company says its new math practice app raises quiz scores. Which study could show that the app **causes** higher scores? (a) Survey students and compare the scores of those who already use the app with those who do not. (b) Randomly assign 60 volunteers: 30 use the app for a month and 30 do not, then compare their quiz scores. (c) Track one class\'s scores before and after the whole class starts using the app.' },
      ],
      steps: [
        { text: 'Check study (a).', why: 'Students chose for themselves. Students who download a math app may already be more motivated, so motivation is a lurking variable. Observational: no causation.' },
        { text: 'Check study (c).', why: 'There is no control group. Scores might rise anyway, because the class had a month more instruction or the later quiz was easier.' },
        { text: 'Check study (b).', why: 'It has a treatment group and a control group, and **random assignment** spreads motivation, ability, sleep and everything else evenly between the groups. The only planned difference is the app.' },
        { text: 'Describe what result would show cause.', tex: '\\text{app mean } 84 \\text{ vs. no-app mean } 78 \\Rightarrow 84 - 78 = 6 \\text{ points}', why: 'If the app group scores clearly higher (say $6$ points on average), the app is the most reasonable explanation, because random assignment ruled out the lurking variables.' },
      ],
      answer: 'Study (b), the randomized experiment. Random assignment to an app group and a no-app group is the only design here that can show the app causes higher scores; (a) has lurking variables and (c) has no control group.',
    },
  ],
  teachMeAgain: [
    {
      approach: 'visual',
      title: 'Three shapes side by side',
      blocks: [
        { t: 'p', text: 'Here are the three model shapes on one graph. When you look at a scatter plot, ask which of these the cloud of points follows.' },
        {
          t: 'graph',
          caption: 'A line, a parabola that rises then falls, and an exponential curve that gets steeper and steeper.',
          spec: {
            xMin: 0,
            xMax: 6,
            yMin: 0,
            yMax: 20,
            yStep: 2,
            functions: [
              { expr: '2x+3', label: 'linear', domain: [0, 6] },
              { expr: '-1.5(x-3)^2+16', label: 'quadratic', domain: [0, 6] },
              { expr: '2^x', label: 'exponential', dashed: true, domain: [0, 4.3] },
            ],
            ariaLabel: 'Three curves for x from 0 to 6: the straight line y = 2x + 3 rising steadily from 3 to 15; the parabola y = -1.5(x - 3)^2 + 16 rising from 2.5 to a peak of 16 at x = 3 and falling back to 2.5 at x = 6; and the dashed exponential y = 2^x starting at 1, staying low, then climbing steeply to about 20 at x = 4.3.',
          },
        },
        { t: 'p', text: 'Straight: linear. Turns around: quadratic. Starts flat and then keeps getting steeper (or drops fast and then flattens): exponential.' },
      ],
    },
    {
      approach: 'simpler-example',
      title: 'Two small cases',
      blocks: [
        { t: 'p', text: '**Model:** a streaming channel\'s subscribers are $100, 151, 199, 250, 302$ in months $0$ to $4$. Differences: $51, 48, 51, 52$, all near $50$. Linear.' },
        { t: 'p', text: '**Causation:** in summer, both pool visits and lemonade sales go up. Does swimming make people buy lemonade? No: hot weather causes both. Hot weather is the lurking variable.' },
      ],
    },
    {
      approach: 'analogy',
      title: 'The rooster and the sunrise',
      blocks: [
        { t: 'p', text: 'Every morning the rooster crows, and then the sun comes up. The two always happen together. But if the rooster stays quiet one morning, the sun still rises. Things happening together, even every time, does not mean one makes the other happen.' },
        { t: 'p', text: 'Now picture wet sidewalks and people carrying umbrellas. They show up together all the time, but umbrellas do not wet sidewalks. A third thing, **rain**, causes both. That third thing is a lurking variable.' },
        { t: 'p', text: 'A randomized experiment is like flipping a coin to decide which days the rooster is allowed to crow. If the sun rose on both kinds of days, you would know crowing does not matter.' },
      ],
    },
    {
      approach: 'prerequisite',
      title: 'Refresher: differences and ratios with messy numbers',
      blocks: [
        { t: 'p', text: 'For $y$-values $10, 20, 41, 79, 162$ at $x = 0, 1, 2, 3, 4$:' },
        {
          t: 'list',
          items: [
            '**First differences:** $10, 21, 38, 83$. Far from constant, so not linear.',
            '**Second differences:** $11, 17, 45$. Still growing, so not quadratic.',
            '**Ratios:** $\\frac{20}{10} = 2$, $\\frac{41}{20} = 2.05$, $\\frac{79}{41} \\approx 1.93$, $\\frac{162}{79} \\approx 2.05$. All close to $2$: exponential.',
          ],
        },
        { t: 'p', text: '"Nearly constant" means the numbers bounce around one value without trending up or down. Real data always wobble a little.' },
      ],
    },
    {
      approach: 'step-by-step',
      title: 'Two routines',
      blocks: [
        { t: 'p', text: '**Choosing a model:**' },
        {
          t: 'list',
          ordered: true,
          items: [
            'Look at the scatter plot: straight, turning, or getting steeper (or flattening toward $0$)?',
            'If you have a table with equal $x$-steps, check first differences, then second differences, then ratios.',
            'Check the context: should the quantity turn around, keep growing by a percent, or change by the same amount each time? Could the model give impossible values?',
          ],
        },
        { t: 'p', text: '**Judging a cause-and-effect claim:**' },
        {
          t: 'list',
          ordered: true,
          items: [
            'Is there a correlation? (That is all the data can show without an experiment.)',
            'Could a lurking variable affect both? Could the cause run the other way?',
            'Was it a randomized experiment with a control group? Only then can you conclude cause and effect.',
          ],
        },
      ],
    },
    {
      approach: 'alternate-strategy',
      title: 'Start with the story, then check the numbers',
      blocks: [
        { t: 'p', text: 'Before computing anything, ask what the situation **should** do:' },
        {
          t: 'list',
          items: [
            '"Adds the same amount each time" (weekly pay, a fixed deposit, a steady pace): **linear**.',
            '"Goes up and comes back down" (a thrown ball, profit as the price rises): **quadratic**.',
            '"Grows or shrinks by the same percent" (viral views, interest, a value that loses $20\\%$ a year): **exponential**.',
          ],
        },
        { t: 'p', text: 'Then confirm with the graph or the table. For cause and effect, tell the story the other way too: "What else could make both of these go up?" If you can think of a believable answer, the correlation alone does not prove anything.' },
      ],
    },
  ],
  guided: [
    { generator: 'u7.choose-model', difficulty: 1 },
    { generator: 'u7.choose-model', difficulty: 2 },
    { generator: 'u7.causation', difficulty: 1 },
    { generator: 'u7.causation', difficulty: 2 },
  ],
  independent: {
    count: 8,
    reviewCount: 2,
    mix: [
      { generator: 'u7.choose-model', difficulty: 1, weight: 1 },
      { generator: 'u7.choose-model', difficulty: 2, weight: 2 },
      { generator: 'u7.choose-model', difficulty: 3, weight: 1 },
      { generator: 'u7.causation', difficulty: 1, weight: 1 },
      { generator: 'u7.causation', difficulty: 2, weight: 2 },
      { generator: 'u7.causation', difficulty: 3, weight: 1 },
    ],
  },
  quiz: {
    items: [
      { generator: 'u7.choose-model', difficulty: 1 },
      { generator: 'u7.choose-model', difficulty: 2 },
      { generator: 'u7.causation', difficulty: 2 },
      { generator: 'u7.causation', difficulty: 2 },
      { generator: 'u7.choose-model', difficulty: 3 },
      { generator: 'u7.causation', difficulty: 3 },
    ],
  },
  summary: [
    'From a scatter plot: a straight band is linear, a turn-around is quadratic, and a curve that keeps getting steeper (or drops fast and flattens toward $0$) is exponential.',
    'From a table of approximate data with equal $x$-steps: nearly constant first differences mean linear, nearly constant second differences mean quadratic, and nearly constant ratios mean exponential.',
    'Use the context to choose and check a model: a strong $r$ does not mean a line is the right model, and a model that gives impossible values (like a negative price) is the wrong one there.',
    'Correlation does not imply causation: a lurking variable, cause running the other way, or coincidence can explain a correlation, no matter how strong $r$ is.',
    'Only a randomized experiment, with random assignment to a treatment group and a control group, can show cause and effect.',
  ],
  mastery: { quizPassScore: 0.8, practiceMinCorrect: 5 },
};
