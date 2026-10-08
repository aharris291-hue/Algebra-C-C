import type { LessonContent } from '../../../core/curriculum/types';

/**
 * U1L09 Modeling with Linear Functions (A.MM.1.1, A.MM.1.3, A.MM.1.4, A.MM.1.5, A.FGR.2.2)
 *
 * Math verified by hand (2026-10-04): every worked example, conversion and graph point below was recomputed independently.
 */
export const U1L09: LessonContent = {
  lessonId: 'U1L09',
  goal: 'Choose the input and output quantities for a situation, build a linear model from a situation, a table, or two data points, explain what its slope and intercept mean (with units), use it to predict, and convert units, rates and areas with conversion factors.',
  needToKnow: [
    { t: 'p', text: 'You already know the pieces this lesson puts together:' },
    {
      t: 'list',
      items: [
        '**Slope is a rate of change.** From $(2, 18)$ to $(5, 12)$, the slope is $\\frac{12 - 18}{5 - 2} = \\frac{-6}{3} = -2$.',
        '**Slope-intercept form.** In $y = mx + b$, $m$ is the slope and $b$ is the starting value (the output when $x = 0$).',
        '**Multiplying fractions.** You can cancel a factor that appears on the top and the bottom: $\\frac{3}{4} \\cdot \\frac{4}{5} = \\frac{3}{5}$.',
      ],
    },
    { t: 'callout', variant: 'tip', title: 'Quick check', text: 'A line has slope $3$ and passes through $(0, 7)$. What is its equation? (You should get $y = 3x + 7$.) If that felt shaky, open **Teach Me Again** and choose the refresher.' },
  ],
  vocabulary: [
    { term: 'linear model', meaning: 'A linear function that describes a real situation, like $C(m) = 30m + 45$.' },
    { term: 'rate', meaning: 'A comparison of two quantities with different units, like 20 gallons per minute.' },
    { term: 'conversion factor', meaning: 'A fraction equal to 1 that changes units, like $\\frac{12 \\text{ in}}{1 \\text{ ft}}$.' },
    { term: 'dimensional analysis', meaning: 'Writing the units in a calculation so you can see them cancel and check that the answer has the right units.' },
    { term: 'reasonable domain', meaning: 'The input values that make sense in the situation.' },
  ],
  instruction: [
    { t: 'p', text: '### What makes a situation linear?' },
    { t: 'p', text: 'A situation can be modeled with a linear function when it changes at a **constant rate**: the same amount for each unit of input. Every linear model has two parts:' },
    {
      t: 'list',
      items: [
        '**Rate of change (slope $m$):** how much the output changes for each 1 unit of input. Its units are "output units per input unit."',
        '**Starting value (intercept $b$):** the output when the input is $0$.',
      ],
    },
    { t: 'p', text: '### Choosing the quantities' },
    { t: 'p', text: 'Before writing a model, decide which quantity is the **input** and which is the **output**. The output is what you want to find; the input is what it depends on. A hose fills a pool at 20 gallons per minute, and you want the water in the pool at any time: the input is the **time since filling started (minutes)** and the output is the **water in the pool (gallons)**. The rate, 20 gallons per minute, never changes, so it is not an input or an output: it becomes the slope.' },
    { t: 'callout', variant: 'tip', title: 'Let the units check you', text: 'The rate\'s units are always (output units) per (input unit). "Gallons per minute" tells you that minutes go in and gallons come out.' },
    { t: 'p', text: '### Building a model from a situation' },
    { t: 'p', text: 'A phone plan costs \\$30 per month plus a one-time \\$45 activation fee. The cost changes by \\$30 every month, so the slope is $30$. Before any months pass you already owe \\$45, so the intercept is $45$.' },
    { t: 'math', tex: 'C(m) = 30m + 45' },
    { t: 'p', text: 'Use the model to **predict**: one year of service costs $C(12) = 30(12) + 45 = 360 + 45 = 405$, or \\$405.' },
    { t: 'callout', variant: 'warning', title: 'Rate goes with the variable', text: 'The amount that repeats ("per month," "each hour," "for every mile") multiplies the variable. The one-time amount is the constant. Writing $C(m) = 45m + 30$ would mean a \\$45 monthly bill, which is a different plan.' },
    { t: 'p', text: '### Building a model from a table or two data points' },
    { t: 'p', text: 'When you are given data instead of a description, find the slope first with $m = \\frac{y_2 - y_1}{x_2 - x_1}$. Then find $b$: read it from the table if the input $0$ is listed, or substitute one point into $y = mx + b$ and solve. Always check your model with a second data point.' },
    { t: 'p', text: '### A reasonable domain' },
    { t: 'p', text: 'A model only makes sense for some inputs. For the phone plan, $m$ counts whole months, so the domain is $\\{0, 1, 2, 3, \\dots\\}$. A negative number of months, or $2.7$ months on a monthly bill, does not make sense. When the input can be any value in an interval (like time while driving), the domain is an interval, such as $0 \\le t \\le 6$.' },
    { t: 'p', text: '### Converting units and rates' },
    { t: 'p', text: 'Models often need the units to match. A **conversion factor** is a fraction whose top and bottom are equal amounts, so it equals $1$. Multiplying by it changes the units without changing the amount.' },
    { t: 'math', tex: '1 \\text{ mi} = 5280 \\text{ ft} \\qquad 1 \\text{ hr} = 3600 \\text{ s} \\qquad 1 \\text{ ft} = 12 \\text{ in} \\qquad 1 \\text{ in} = 2.54 \\text{ cm}' },
    { t: 'p', text: 'Choose each factor so the unit you want to get rid of is on the **opposite** side (top vs. bottom) and cancels. Here is $60$ miles per hour in feet per second:' },
    { t: 'math', tex: '\\frac{60 \\text{ mi}}{1 \\text{ hr}} \\cdot \\frac{5280 \\text{ ft}}{1 \\text{ mi}} \\cdot \\frac{1 \\text{ hr}}{3600 \\text{ s}} = \\frac{60 \\cdot 5280 \\text{ ft}}{3600 \\text{ s}} = \\frac{316{,}800 \\text{ ft}}{3600 \\text{ s}} = 88 \\text{ ft/s}' },
    { t: 'callout', variant: 'why', title: 'Why the units cancel', text: 'Miles is on the top of the first fraction and the bottom of the second, so miles cancel. Hours is on the bottom of the first fraction and the top of the third, so hours cancel. Only feet on top and seconds on the bottom are left, which is exactly the unit we wanted.' },
    { t: 'p', text: '### Area units' },
    { t: 'p', text: 'A **square foot** is a square 1 foot on each side. Since $1 \\text{ yd} = 3 \\text{ ft}$, a square yard is 3 feet by 3 feet, so $1 \\text{ yd}^2 = 3 \\times 3 = 9 \\text{ ft}^2$. Area conversions use the length factor **twice**, once for each dimension.' },
    { t: 'math', tex: '54 \\text{ ft}^2 \\cdot \\frac{1 \\text{ yd}}{3 \\text{ ft}} \\cdot \\frac{1 \\text{ yd}}{3 \\text{ ft}} = \\frac{54}{9} \\text{ yd}^2 = 6 \\text{ yd}^2' },
    { t: 'p', text: '### Units of the numbers in a model' },
    { t: 'p', text: 'Every number in a model has units. In $C(m) = 15m + 50$, the cost of a plan in dollars after $m$ months, the $15$ multiplies months, so it is a rate in **dollars per month**. The $50$ is added on its own, so it is in **dollars**, the same units as the output. That is why the terms can be added: $(\\text{dollars per month}) \\times (\\text{months}) = \\text{dollars}$.' },
  ],
  examples: [
    {
      title: 'A model from a table',
      kind: 'introductory',
      problem: [
        { t: 'p', text: 'A pool is being filled with a hose. Write a linear model for the number of gallons $G$ in the pool after $t$ minutes, and explain what the slope and intercept mean.' },
        {
          t: 'table',
          headers: ['Minutes t', 'Gallons G'],
          rows: [
            ['0', '150'],
            ['5', '250'],
            ['10', '350'],
            ['15', '450'],
          ],
        },
      ],
      steps: [
        { text: 'Find the rate of change.', tex: 'm = \\frac{250 - 150}{5 - 0} = \\frac{100}{5} = 20', why: 'Every 5 minutes adds 100 gallons. Check the next rows: $350 - 250 = 100$ and $450 - 350 = 100$, so the rate is constant and a linear model fits.' },
        { text: 'Read the starting value.', tex: 'b = 150', why: 'The table lists $t = 0$, so the output there is the intercept.' },
        { text: 'Write the model.', tex: 'G(t) = 20t + 150', why: 'Check the last row: $G(15) = 20(15) + 150 = 300 + 150 = 450$.' },
        { text: 'Interpret.', why: 'The slope means the hose adds **20 gallons per minute**. The intercept means the pool already held **150 gallons** when the hose was turned on.' },
      ],
      answer: '$G(t) = 20t + 150$: 20 gallons per minute, starting from 150 gallons.',
    },
    {
      title: 'A model from two data points',
      kind: 'intermediate',
      problem: [{ t: 'p', text: 'A candle is 18 cm tall after burning for 2 hours and 12 cm tall after burning for 5 hours. It burns at a constant rate. Write a model for its height $h$ after $t$ hours, find when it burns out, and give a reasonable domain.' }],
      steps: [
        { text: 'Write the data as points.', tex: '(2,\\ 18) \\text{ and } (5,\\ 12)', why: 'The input is time in hours, and the output is height in centimeters.' },
        { text: 'Find the slope.', tex: 'm = \\frac{12 - 18}{5 - 2} = \\frac{-6}{3} = -2', why: 'The slope is negative because the candle gets shorter: it loses 2 cm per hour.' },
        { text: 'Find the intercept.', tex: '18 = -2(2) + b \\;\\Rightarrow\\; 18 = -4 + b \\;\\Rightarrow\\; b = 22', why: 'Substitute one point into $h = -2t + b$. The candle started at 22 cm tall.' },
        { text: 'Write and check the model.', tex: 'h(t) = -2t + 22, \\quad h(5) = -10 + 22 = 12', why: 'The second point fits, so the model is right.' },
        { text: 'Find when it burns out.', tex: '-2t + 22 = 0 \\;\\Rightarrow\\; -2t = -22 \\;\\Rightarrow\\; t = 11', why: 'Burned out means the height is $0$.' },
        { text: 'Choose a reasonable domain.', tex: '0 \\le t \\le 11', why: 'Time starts at $0$, and after 11 hours there is no candle left. A negative height makes no sense.' },
      ],
      answer: '$h(t) = -2t + 22$; it burns out after 11 hours; domain $0 \\le t \\le 11$.',
    },
    {
      title: 'Saving for a new phone',
      kind: 'real-world',
      problem: [{ t: 'p', text: 'You have \\$120 saved and put away \\$35 every week from a part-time job. Write a model for your savings $S$ after $w$ weeks. After how many weeks will you have the \\$750 for a new phone?' }],
      steps: [
        { text: 'Identify the rate and the starting value.', tex: 'm = 35, \\quad b = 120', why: '\\$35 repeats every week, so it is the rate. The \\$120 is already saved at week 0.' },
        { text: 'Write the model.', tex: 'S(w) = 35w + 120' },
        { text: 'Set the model equal to the goal and solve.', tex: '35w + 120 = 750 \\;\\Rightarrow\\; 35w = 630 \\;\\Rightarrow\\; w = 18', why: 'Subtract 120, then divide by 35. Check: $35(18) = 630$ and $630 + 120 = 750$.' },
        { text: 'Think about the domain.', why: 'You save once a week, so $w$ is a whole number. The domain that matters here is $\\{0, 1, 2, \\dots, 18\\}$.' },
      ],
      answer: '$S(w) = 35w + 120$; you reach \\$750 after 18 weeks.',
    },
    {
      title: 'Converting a rate with two factors',
      kind: 'intermediate',
      problem: [{ t: 'p', text: 'A garden snail crawls about 3 inches per minute. How many centimeters per hour is that?' }],
      steps: [
        { text: 'Write the rate as a fraction.', tex: '\\frac{3 \\text{ in}}{1 \\text{ min}}', why: 'Writing the units lets you see what needs to cancel.' },
        { text: 'Multiply by factors that cancel inches and minutes.', tex: '\\frac{3 \\text{ in}}{1 \\text{ min}} \\cdot \\frac{2.54 \\text{ cm}}{1 \\text{ in}} \\cdot \\frac{60 \\text{ min}}{1 \\text{ hr}}', why: 'Inches is on top, so the first factor has inches on the bottom. Minutes is on the bottom, so the second factor has minutes on top.' },
        { text: 'Multiply the numbers.', tex: '3 \\cdot 2.54 \\cdot 60 = 7.62 \\cdot 60 = 457.2', why: 'Inches and minutes cancel, leaving centimeters per hour.' },
      ],
      answer: '$457.2$ cm per hour',
    },
    {
      title: 'Carpet in square yards',
      kind: 'real-world',
      problem: [{ t: 'p', text: 'A rug covers 54 square feet. Carpet is sold by the square yard. How many square yards is the rug? Use $1$ yard $= 3$ feet.' }],
      steps: [
        { text: 'Turn the length fact into an area fact.', tex: '1 \\text{ yd}^2 = (3 \\text{ ft})(3 \\text{ ft}) = 9 \\text{ ft}^2', why: 'A square yard is 3 feet long and 3 feet wide, so it holds a 3-by-3 grid of square feet.' },
        { text: 'Convert.', tex: '54 \\text{ ft}^2 \\cdot \\frac{1 \\text{ yd}^2}{9 \\text{ ft}^2} = 6 \\text{ yd}^2', why: 'The conversion factor equals 1, and square feet cancel. Square yards are bigger, so there are fewer of them.' },
        { text: 'Check the common mistake.', tex: '54 \\div 3 = 18 \;(\\text{wrong})', why: 'Dividing by 3 only converts one dimension. Area needs the factor twice.' },
      ],
      answer: '$6$ square yards',
    },
    {
      title: 'A common mistake: a factor upside down',
      kind: 'common-mistake',
      problem: [{ t: 'p', text: 'To change 45 miles per hour to feet per second, a student computes $45 \\cdot 5280 \\cdot 3600 = 855{,}360{,}000$ feet per second. What went wrong, and what is the correct answer?' }],
      steps: [
        { text: 'Write the units the student used.', tex: '\\frac{45 \\text{ mi}}{1 \\text{ hr}} \\cdot \\frac{5280 \\text{ ft}}{1 \\text{ mi}} \\cdot \\frac{3600 \\text{ s}}{1 \\text{ hr}}', why: 'Miles cancel, but hours are on the bottom twice and seconds end up on top. The result is in $\\text{ft} \\cdot \\text{s}/\\text{hr}^2$, not feet per second.' },
        { text: 'Flip the time factor so hours cancel.', tex: '\\frac{45 \\text{ mi}}{1 \\text{ hr}} \\cdot \\frac{5280 \\text{ ft}}{1 \\text{ mi}} \\cdot \\frac{1 \\text{ hr}}{3600 \\text{ s}}', why: 'Hours is on the bottom of the rate, so it must be on top of the factor.' },
        { text: 'Compute.', tex: '\\frac{45 \\cdot 5280}{3600} = \\frac{237{,}600}{3600} = 66', why: 'A car going 45 mph covers 66 feet each second. Also, a huge answer like 855 million feet per second should be a warning sign.' },
      ],
      answer: '$66$ ft/s',
    },
    {
      title: 'Road trip gas model',
      kind: 'challenging',
      problem: [{ t: 'p', text: 'A car starts a trip with 12 gallons of gas. It uses 1 gallon for every 30 miles and drives at a steady 60 miles per hour. Write a model for the gas $G$ left after $h$ hours. How much gas is left after 2.5 hours? What is a reasonable domain?' }],
      steps: [
        { text: 'Convert to gallons per hour.', tex: '\\frac{60 \\text{ mi}}{1 \\text{ hr}} \\cdot \\frac{1 \\text{ gal}}{30 \\text{ mi}} = \\frac{60}{30} \\text{ gal/hr} = 2 \\text{ gal/hr}', why: 'The input is hours, so the rate must be per hour. Miles cancel.' },
        { text: 'Write the model.', tex: 'G(h) = -2h + 12', why: 'The car uses gas, so the rate is negative. It starts with 12 gallons, so the intercept is $12$.' },
        { text: 'Predict at 2.5 hours.', tex: 'G(2.5) = -2(2.5) + 12 = -5 + 12 = 7', why: 'Substitute the input.' },
        { text: 'Find the reasonable domain.', tex: '-2h + 12 = 0 \\;\\Rightarrow\\; h = 6 \\;\\Rightarrow\\; 0 \\le h \\le 6', why: 'The tank is empty after 6 hours, and time starts at 0. The range is then $0 \\le G \\le 12$.' },
      ],
      answer: '$G(h) = -2h + 12$; 7 gallons left after 2.5 hours; domain $0 \\le h \\le 6$.',
    },
  ],
  teachMeAgain: [
    {
      approach: 'visual',
      title: 'See the model as a graph',
      blocks: [
        { t: 'p', text: 'Here is the phone plan $C(m) = 30m + 45$ for the first 6 months. Each dot is one month, because the bill only counts whole months.' },
        {
          t: 'graph',
          spec: {
            xMin: 0,
            xMax: 7,
            yMin: 0,
            yMax: 250,
            yStep: 25,
            xLabel: 'months',
            yLabel: 'cost ($)',
            scatter: [
              { x: 0, y: 45 },
              { x: 1, y: 75 },
              { x: 2, y: 105 },
              { x: 3, y: 135 },
              { x: 4, y: 165 },
              { x: 5, y: 195 },
              { x: 6, y: 225 },
            ],
            ariaLabel: 'Seven points for the phone plan: (0, 45), (1, 75), (2, 105), (3, 135), (4, 165), (5, 195) and (6, 225). Each point is 30 higher than the one before.',
          },
        },
        { t: 'list', items: ['**Where it starts** on the vertical axis is the intercept: \\$45 at month 0.', '**How steeply it climbs** is the slope: up \\$30 for each month to the right.'] },
      ],
    },
    {
      approach: 'step-by-step',
      title: 'A modeling checklist',
      blocks: [
        {
          t: 'list',
          ordered: true,
          items: [
            '**Name the variables.** A taxi charges \\$3 to start plus \\$2 per mile. Input: miles $x$. Output: cost $C$.',
            '**Find the rate** (the "per" amount): $m = 2$ dollars per mile.',
            '**Find the starting value** (the amount at input $0$): $b = 3$ dollars.',
            '**Write the model:** $C(x) = 2x + 3$.',
            '**Use it:** a 7-mile ride costs $C(7) = 2(7) + 3 = 14 + 3 = 17$, or \\$17.',
            '**Check the domain:** miles cannot be negative, so $x \\ge 0$.',
          ],
        },
      ],
    },
    {
      approach: 'analogy',
      title: 'Conversion factors are like making change',
      blocks: [
        { t: 'p', text: 'Four quarters are worth one dollar. So $\\frac{\\$1}{4 \\text{ quarters}}$ is a fraction equal to $1$: the top and bottom are the same amount of money.' },
        { t: 'math', tex: '20 \\text{ quarters} \\cdot \\frac{\\$1}{4 \\text{ quarters}} = \\$5' },
        { t: 'p', text: 'The word "quarters" cancels, just like miles or hours cancel in a rate conversion. You did not change how much money you have, only the unit you count it in.' },
      ],
    },
    {
      approach: 'prerequisite',
      title: 'Refresher: slope and canceling',
      blocks: [
        { t: 'list', items: ['Slope from two points: from $(1, 10)$ to $(4, 25)$, $m = \\frac{25 - 10}{4 - 1} = \\frac{15}{3} = 5$.', 'Find $b$: $10 = 5(1) + b$, so $b = 5$ and $y = 5x + 5$.', 'Canceling: $\\frac{3}{4} \\cdot \\frac{8}{9} = \\frac{3 \\cdot 8}{4 \\cdot 9} = \\frac{24}{36} = \\frac{2}{3}$. Units cancel the same way numbers do.'] },
      ],
    },
    {
      approach: 'alternate-strategy',
      title: 'Convert one unit at a time',
      blocks: [
        { t: 'p', text: 'If a long chain of factors feels like too much, change one unit per step. Convert $60$ miles per hour to feet per second:' },
        {
          t: 'list',
          ordered: true,
          items: ['**Hours to minutes:** 60 miles per hour is $60 \\div 60 = 1$ mile per minute.', '**Miles to feet:** 1 mile per minute is $5280$ feet per minute.', '**Minutes to seconds:** $5280 \\div 60 = 88$ feet per second.'],
        },
        { t: 'p', text: 'Same answer as the one-line method: $88$ ft/s.' },
      ],
    },
    {
      approach: 'simpler-example',
      title: 'Start with one conversion factor',
      blocks: [
        { t: 'p', text: 'Change $4$ feet to inches. You want inches on top and feet on the bottom so feet cancel:' },
        { t: 'math', tex: '4 \\text{ ft} \\cdot \\frac{12 \\text{ in}}{1 \\text{ ft}} = 48 \\text{ in}' },
        { t: 'p', text: 'Change $2.5$ hours to minutes: $2.5 \\text{ hr} \\cdot \\frac{60 \\text{ min}}{1 \\text{ hr}} = 150$ min.' },
        { t: 'p', text: 'A rate just has two units, so it may need two factors: one for the top unit and one for the bottom unit.' },
      ],
    },
  ],
  guided: [
    { generator: 'u1.linear-model', difficulty: 1 },
    { generator: 'u1.unit-rates', difficulty: 1 },
    { generator: 'u1.linear-model', difficulty: 1 },
    { generator: 'u1.unit-rates', difficulty: 2 },
  ],
  independent: {
    count: 8,
    reviewCount: 2,
    mix: [
      { generator: 'u1.linear-model', difficulty: 1, weight: 2 },
      { generator: 'u1.linear-model', difficulty: 2, weight: 2 },
      { generator: 'u1.linear-model', difficulty: 3, weight: 1 },
      { generator: 'u1.unit-rates', difficulty: 1, weight: 2 },
      { generator: 'u1.unit-rates', difficulty: 2, weight: 2 },
      { generator: 'u1.unit-rates', difficulty: 3, weight: 1 },
      { generator: 'u1.rate-context', difficulty: 2, weight: 1 },
      { generator: 'u1.write-context', difficulty: 2, weight: 1 },
      { generator: 'u1.domain-range', difficulty: 2, weight: 1 },
    ],
  },
  quiz: {
    items: [
      { generator: 'u1.linear-model', difficulty: 2 },
      { generator: 'u1.linear-model', difficulty: 2 },
      { generator: 'u1.linear-model', difficulty: 3 },
      { generator: 'u1.unit-rates', difficulty: 2 },
      { generator: 'u1.unit-rates', difficulty: 2 },
      { generator: 'u1.unit-rates', difficulty: 3 },
    ],
  },
  summary: [
    'A linear model fits a situation that changes at a **constant rate**. The rate is the slope; the starting value (input $0$) is the intercept.',
    'From a table or two points, find the slope first, then find $b$, then check the model with another data point.',
    'Always give the slope and intercept **units** and choose a **reasonable domain** for the situation.',
    'A conversion factor equals $1$. Place each one so the unwanted unit cancels: $60$ mi/hr $= 88$ ft/s.',
    'Choose the input (what the output depends on) and the output (what you want to find) before building a model. A constant rate is the slope, not an input.',
    'Area units are squared: $1 \\text{ yd}^2 = 9 \\text{ ft}^2$, so use the length factor twice. In a model, the number multiplying the input is in (output units) per (input unit); the constant has the output\'s units.',
  ],
  mastery: { quizPassScore: 0.8, practiceMinCorrect: 5 },
};
