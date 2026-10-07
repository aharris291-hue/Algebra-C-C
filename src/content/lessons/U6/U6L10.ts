import type { LessonContent } from '../../../core/curriculum/types';

/**
 * U6L10 Modeling with Exponential Functions (A.FGR.9.1, A.FGR.9.2, A.MM.1.2, A.MM.1.4)
 * Build an exponential model from a starting value and a percent rate or factor, from a doubling time,
 * A(t) = a(2)^(t/k), from a half-life, A(t) = a(1/2)^(t/k), or from two data points; answer "how much after t"
 * by substituting and "when" by counting whole periods or extending a table or graph (no logarithms); explain
 * what each part of the model means, with units; say where a model stops making sense (nothing can double
 * forever); compare two models (S6.10).
 *
 * Math verified by hand (2026-10-07): every value below was recomputed with node at full precision and rounded
 * only at the end: 250(1.06)^12 = 503.05; 500(2)^(t/3) = 500, 1000, 2000, 4000, 8000, 16000, 32000 for
 * t = 0, 3, ..., 18, and 32000/500 = 64 = 2^6; 2^(1/3) = 1.2599; the mistaken 500(2)^(3*3) = 256000 versus
 * 500(2)^(3/3) = 1000; 400(1/2)^(t/6) = 400, 200, 100, 50, 25, 12.5 for t = 0, 6, ..., 30, and 400/50 = 8 = 2^3;
 * 12000(1.04)^t = 12480, 12979.2, 13498.37, 14038.30, 14599.83, 15183.83 for t = 1..6; from (0, 50) and
 * (2, 72), b^2 = 1.44 so b = 1.2, 50(1.2)^1 = 60 and 50(1.2)^5 = 124.416; 900(0.8)^t versus 700(0.9)^t is
 * 720 vs 630, 576 vs 567, 460.80 vs 510.30, 368.64 vs 459.27 for t = 1..4, with the real crossing near
 * t = 2.13; every graph point was checked to lie on its curve and inside its window, and every expression was
 * parsed and evaluated with src/core/math/parser.ts.
 */
export const U6L10: LessonContent = {
  lessonId: 'U6L10',
  goal: 'Build an exponential model for a real situation, from a starting value and a growth or decay rate, a doubling time, a half-life or two data points, and use it to find an amount at a given time, find when an amount is reached, explain what each part means, and say when the model stops making sense.',
  needToKnow: [
    { t: 'p', text: 'This lesson puts together several things you already know:' },
    {
      t: 'list',
      items: [
        '**Percent change as a factor.** Growth by $r$: $b = 1 + r$ ($6\\%$ growth is $b = 1.06$). Decay by $r$: $b = 1 - r$ ($20\\%$ decay is $b = 0.8$).',
        '**The model $y = a(b)^t$.** $a$ is the starting amount (the y-intercept, the value at $t = 0$) and $b$ is the factor for each period.',
        '**Powers of 2.** $2^1 = 2$, $2^2 = 4$, $2^3 = 8$, $2^4 = 16$, $2^5 = 32$, $2^6 = 64$, $2^7 = 128$. Knowing these makes doubling and half-life questions quick.',
      ],
    },
    { t: 'callout', variant: 'tip', title: 'Quick check', text: 'A phone worth \\$600 loses $25\\%$ of its value each year. What is its decay factor, and what is it worth after $1$ year? (You should get $b = 0.75$ and $600(0.75) = 450$ dollars.) If that felt shaky, open **Teach Me Again** and choose the refresher.' },
  ],
  vocabulary: [
    { term: 'exponential model', meaning: 'An equation like $A(t) = a(b)^t$ that describes an amount that is multiplied by the same factor every period.' },
    { term: 'initial value', meaning: 'The amount at the start, when $t = 0$. In $a(b)^t$ it is $a$.' },
    { term: 'doubling time', meaning: 'The time it takes a growing amount to double. If it is $k$ units, the model is $A(t) = a(2)^{t/k}$.' },
    { term: 'half-life', meaning: 'The time it takes a decaying amount to fall to half. If it is $k$ units, the model is $A(t) = a\\left(\\frac{1}{2}\\right)^{t/k}$.' },
    { term: 'limitation of a model', meaning: 'A place where the model stops matching reality, such as a population that cannot keep growing forever because it runs out of space or food.' },
  ],
  instruction: [
    { t: 'p', text: '### Building a model from a rate' },
    { t: 'p', text: 'To model an amount that changes by the same **percent** every period, you need two things: where it starts ($a$) and what it is multiplied by each period ($b$).' },
    {
      t: 'table',
      caption: 'How the words in a problem turn into a model.',
      headers: ['The problem says', 'Factor $b$', 'Model'],
      rows: [
        ['starts at $250$, grows $6\\%$ per month', '$1 + 0.06 = 1.06$', '$M(t) = 250(1.06)^t$'],
        ['starts at \\$900, loses $20\\%$ per year', '$1 - 0.20 = 0.8$', '$V(t) = 900(0.8)^t$'],
        ['starts at $80$, triples each day', '$3$', '$N(t) = 80(3)^t$'],
      ],
    },
    { t: 'p', text: '### Doubling time and half-life' },
    { t: 'p', text: 'Sometimes you are told **how long** it takes to double, not the percent. Bacteria that start at $500$ and double every $3$ hours double once in $3$ hours, twice in $6$ hours, and so on. In $t$ hours they double $\\frac{t}{3}$ times:' },
    { t: 'math', tex: 'A(t) = 500(2)^{t/3}' },
    { t: 'p', text: 'The same idea works for a **half-life**. A $400$ mg dose of medicine with a half-life of $6$ hours is cut in half every $6$ hours:' },
    { t: 'math', tex: 'M(t) = 400\\left(\\frac{1}{2}\\right)^{t/6}' },
    {
      t: 'table',
      caption: 'The general models. The exponent t/k counts how many doubling or halving periods have passed.',
      headers: ['Situation', 'Model', 'What $\\frac{t}{k}$ means'],
      rows: [
        ['doubles every $k$ units', '$A(t) = a(2)^{t/k}$', 'the number of doublings'],
        ['halves every $k$ units (half-life $k$)', '$A(t) = a\\left(\\frac{1}{2}\\right)^{t/k}$', 'the number of half-lives'],
      ],
    },
    { t: 'callout', variant: 'why', title: 'Why the exponent is t/k', text: 'Check it: at $t = 3$ hours, $A(3) = 500(2)^{3/3} = 500(2)^1 = 1000$. Exactly one doubling, as it should be. At $t = 6$, $A(6) = 500(2)^2 = 2000$: two doublings. Dividing the time by the doubling time counts the doublings.' },
    {
      t: 'graph',
      caption: 'Bacteria starting at 500 and doubling every 3 hours.',
      spec: {
        xMin: -1,
        xMax: 19,
        yMin: 0,
        yMax: 34000,
        xStep: 1,
        yStep: 4000,
        xLabel: 'hours',
        yLabel: 'bacteria',
        functions: [{ expr: '500(2)^(x/3)', label: 'A(t) = 500(2)^(t/3)', domain: [0, 18] }],
        points: [
          { x: 0, y: 500, label: '(0, 500)' },
          { x: 9, y: 4000, label: '(9, 4000)' },
          { x: 12, y: 8000, label: '(12, 8000)' },
          { x: 15, y: 16000, label: '(15, 16000)' },
          { x: 18, y: 32000, label: '(18, 32000)' },
        ],
        ariaLabel: 'An increasing curve starting at (0, 500), passing through (9, 4000), (12, 8000) and (15, 16000), and reaching (18, 32000). Each 3 hours the height doubles.',
      },
    },
    { t: 'p', text: '### Answering "when" questions without logarithms' },
    { t: 'p', text: '**If the numbers work out to a power of 2,** count periods. When do the bacteria reach $32000$? $\\frac{32000}{500} = 64 = 2^6$, so that is $6$ doublings, or $6 \\times 3 = 18$ hours.' },
    { t: 'p', text: '**Otherwise, use a table (or a graph).** A town of $12000$ people grows $4\\%$ per year: $P(t) = 12000(1.04)^t$. When does it pass $15000$? Extend a table until it does:' },
    {
      t: 'table',
      caption: 'The town passes 15000 people during year 6.',
      headers: ['Year $t$', '$4$', '$5$', '$6$'],
      rows: [['$P(t)$', '$\\approx 14038$', '$\\approx 14600$', '$\\approx 15184$']],
    },
    { t: 'p', text: 'After $5$ years it is still under $15000$, and after $6$ years it is over, so it first passes $15000$ in year $6$.' },
    { t: 'p', text: '### Building a model from two points' },
    { t: 'p', text: 'A pond has $50$ fish now and $72$ fish $2$ years later, growing exponentially. Then $a = 50$, and two years of growth multiply by $b \\cdot b = b^2$:' },
    { t: 'math', tex: '50b^2 = 72 \\;\\Rightarrow\\; b^2 = 1.44 \\;\\Rightarrow\\; b = 1.2 \\;\\Rightarrow\\; F(t) = 50(1.2)^t' },
    { t: 'p', text: 'Only the positive square root makes sense, because a growth factor is positive. Check: $F(1) = 60$ and $F(2) = 50(1.44) = 72$. The fish population grows $20\\%$ per year.' },
    { t: 'p', text: '### What the parts mean, and where the model breaks' },
    { t: 'p', text: 'In $A(t) = 500(2)^{t/3}$: $500$ is the number of bacteria at the start, $2$ means the amount doubles, $3$ is the doubling time in **hours**, $t$ is the time in hours, and $A(t)$ is the number of bacteria. Always say the units.' },
    { t: 'callout', variant: 'warning', title: 'No model works forever', text: 'At this rate, after $3$ days ($72$ hours) the dish would hold $500(2)^{24}$, more than $8$ **billion** bacteria. Real bacteria run out of food and space long before that. Exponential growth models usually fit only for a limited time. Also, a model may give decimals (like $14599.83$ people) where only whole numbers make sense, so round to fit the situation.' },
    { t: 'callout', variant: 'realworld', title: 'Where this shows up', text: 'Doctors use half-lives to decide how often to give medicine. Scientists use them to date fossils with carbon-14. Health officials watch how fast cases of an illness double, and banks, car dealers and city planners use percent growth and decay every day.' },
  ],
  examples: [
    {
      title: 'A model from a growth rate',
      kind: 'introductory',
      problem: [{ t: 'p', text: 'A new climbing gym opens with $250$ members, and membership grows $6\\%$ per month. Write a model for the number of members after $t$ months and use it to estimate the membership after $1$ year.' }],
      steps: [
        { text: 'Find the initial value and the factor.', tex: 'a = 250, \\qquad b = 1 + 0.06 = 1.06', why: 'The gym starts with $250$ members. Growing $6\\%$ means keeping all the members and adding $6\\%$ more, so multiply by $1.06$.' },
        { text: 'Write the model.', tex: 'M(t) = 250(1.06)^t', why: 'The factor is applied once per month, so $t$ is in months.' },
        { text: 'Match the units.', tex: '1 \\text{ year} = 12 \\text{ months} \\;\\Rightarrow\\; t = 12', why: 'The rate is per month, so time must be measured in months.' },
        { text: 'Substitute and round.', tex: 'M(12) = 250(1.06)^{12} \\approx 503.05 \\approx 503', why: 'Members are whole people, so round the final answer.' },
      ],
      answer: '$M(t) = 250(1.06)^t$; after $1$ year ($12$ months) about $503$ members, roughly double the start.',
    },
    {
      title: 'Doubling time',
      kind: 'intermediate',
      problem: [{ t: 'p', text: 'A sample has $500$ bacteria, and the number doubles every $3$ hours. (a) Write a model. (b) How many bacteria are there after $12$ hours? (c) When will there be $32000$ bacteria?' }],
      steps: [
        { text: '(a) Write the model.', tex: 'A(t) = 500(2)^{t/3}', why: 'The amount doubles (factor $2$) once every $3$ hours, so after $t$ hours it has doubled $\\frac{t}{3}$ times.' },
        { text: '(b) Substitute $t = 12$.', tex: 'A(12) = 500(2)^{12/3} = 500(2)^4 = 500(16) = 8000', why: '$12$ hours is $4$ doubling periods.' },
        { text: '(c) Find how many times the amount is multiplied.', tex: '\\frac{32000}{500} = 64', why: 'Dividing the target by the start tells how much bigger it must get.' },
        { text: 'Count the doublings and convert to hours.', tex: '64 = 2^6 \\;\\Rightarrow\\; \\frac{t}{3} = 6 \\;\\Rightarrow\\; t = 18', why: 'Getting $64$ times bigger takes $6$ doublings, and each one takes $3$ hours.' },
      ],
      answer: '(a) $A(t) = 500(2)^{t/3}$; (b) $8000$ bacteria; (c) after $18$ hours.',
    },
    {
      title: 'Half-life',
      kind: 'intermediate',
      problem: [{ t: 'p', text: 'A patient takes $400$ mg of a medicine that has a half-life of $6$ hours. (a) Write a model for the amount left in the body after $t$ hours. (b) How much is left after $1$ day? (c) After how many hours are $50$ mg left?' }],
      steps: [
        { text: '(a) Write the model.', tex: 'M(t) = 400\\left(\\frac{1}{2}\\right)^{t/6}', why: 'Half of what is left disappears every $6$ hours, so the factor is $\\frac{1}{2}$ and $\\frac{t}{6}$ counts the half-lives.' },
        { text: '(b) Change $1$ day to hours and substitute.', tex: 'M(24) = 400\\left(\\frac{1}{2}\\right)^{4} = \\frac{400}{16} = 25', why: '$1$ day is $24$ hours, which is $\\frac{24}{6} = 4$ half-lives: $400 \\to 200 \\to 100 \\to 50 \\to 25$.' },
        { text: '(c) Count the halvings.', tex: '\\frac{400}{50} = 8 = 2^3 \\;\\Rightarrow\\; 3 \\text{ half-lives} \\;\\Rightarrow\\; 3 \\times 6 = 18', why: 'Getting $8$ times smaller takes $3$ halvings, each $6$ hours long. Check: $M(18) = 400\\left(\\frac{1}{2}\\right)^3 = 50$.' },
      ],
      answer: '(a) $M(t) = 400\\left(\\frac{1}{2}\\right)^{t/6}$; (b) $25$ mg after $1$ day; (c) after $18$ hours.',
    },
    {
      title: 'A common mistake: multiplying instead of dividing in the exponent',
      kind: 'common-mistake',
      problem: [{ t: 'p', text: 'For bacteria that start at $500$ and double every $3$ hours, a student writes $A(t) = 500(2)^{3t}$. Is the student\'s model right?' }],
      steps: [
        { text: 'Test the model at one doubling time.', tex: '500(2)^{3 \\cdot 3} = 500(2)^9 = 256000', why: 'After $3$ hours the bacteria should have doubled exactly once, to $1000$. The student\'s model says $256000$, which is $9$ doublings.' },
        { text: 'Think about what the exponent should count.', tex: '\\text{doublings} = \\frac{\\text{time}}{\\text{time per doubling}} = \\frac{t}{3}', why: 'If each doubling takes $3$ hours, the number of doublings is the time **divided** by $3$. The exponent $3t$ means $3$ doublings every hour.' },
        { text: 'Write and check the correct model.', tex: 'A(t) = 500(2)^{t/3}, \\qquad A(3) = 500(2)^1 = 1000', why: 'Plugging in the doubling time should always give exactly twice the start.' },
      ],
      answer: 'No. The exponent should be $\\frac{t}{3}$, not $3t$: $A(t) = 500(2)^{t/3}$. A quick check is to substitute the doubling time and make sure you get exactly double.',
    },
    {
      title: 'When does the town pass 15,000?',
      kind: 'real-world',
      problem: [{ t: 'p', text: 'A town has $12000$ people, and its population is growing $4\\%$ per year. The town council says it will need a second high school when the population passes $15000$. (a) Write a model. (b) Explain what $12000$ and $1.04$ mean, with units. (c) In which year will the town pass $15000$ people? (d) Name one limitation of the model.' }],
      steps: [
        { text: '(a) Write the model.', tex: 'P(t) = 12000(1.04)^t', why: 'The starting population is $12000$, and $4\\%$ growth means a factor of $1 + 0.04 = 1.04$ per year.' },
        { text: '(b) Interpret the parts.', why: '$12000$ is the population (in people) now, at $t = 0$. $1.04$ means each year the population is $104\\%$ of the year before: it grows by $4\\%$ of the current population, so it adds more people each year. $t$ is the number of years from now.' },
        { text: '(c) Make a table of whole years.', tex: '\\begin{array}{c|cccccc} t & 1 & 2 & 3 & 4 & 5 & 6 \\\\ \\hline P(t) & 12480 & 12979.2 & 13498.37 & 14038.30 & 14599.83 & 15183.83 \\end{array}', why: '$15000$ is not $12000$ times a nice power, so counting periods will not work. Extend the table until the population passes $15000$.' },
        { text: 'Read the answer from the table.', tex: 'P(5) \\approx 14600 < 15000 < P(6) \\approx 15184', why: 'The population is still under $15000$ after $5$ years and over it after $6$, so it passes $15000$ during year $6$.' },
        { text: '(d) A limitation.', why: 'Real towns rarely grow at exactly the same percent every year: jobs, housing and land change the rate. The model is a reasonable estimate for the next several years, not forever. It also gives decimals, but people come in whole numbers.' },
      ],
      answer: '(a) $P(t) = 12000(1.04)^t$. (b) $12000$ people now; the population is multiplied by $1.04$ ($4\\%$ growth) each year. (c) In year $6$ (about $15184$ people). (d) The growth rate will not stay exactly $4\\%$ forever, so the model only works for a limited time.',
    },
    {
      title: 'Which phone keeps its value?',
      kind: 'challenging',
      problem: [
        { t: 'p', text: 'Phone A costs \\$900 and loses $20\\%$ of its value each year. Phone B costs \\$700 and loses $10\\%$ each year. (a) Write a model for each. (b) After how many whole years is Phone B worth more than Phone A? (c) What does the graph show about the gap after that?' },
        {
          t: 'graph',
          caption: 'Values of the two phones over 6 years.',
          spec: {
            xMin: -1,
            xMax: 7,
            yMin: 0,
            yMax: 1000,
            yStep: 100,
            xLabel: 'years',
            yLabel: 'value (dollars)',
            functions: [
              { expr: '900(0.8)^x', label: 'A: 900(0.8)^t', domain: [0, 6] },
              { expr: '700(0.9)^x', label: 'B: 700(0.9)^t', dashed: true, domain: [0, 6] },
            ],
            points: [
              { x: 0, y: 900, label: '(0, 900)' },
              { x: 0, y: 700, label: '(0, 700)' },
              { x: 3, y: 460.8, label: '(3, 460.80)' },
              { x: 3, y: 510.3, label: '(3, 510.30)' },
            ],
            ariaLabel: 'Two decreasing curves. Phone A starts at (0, 900) and falls faster, reaching (3, 460.80). Phone B, dashed, starts at (0, 700), falls more slowly and is above A by (3, 510.30). They cross a little after year 2.',
          },
        },
      ],
      steps: [
        { text: '(a) Write the models.', tex: 'A(t) = 900(0.8)^t, \\qquad B(t) = 700(0.9)^t', why: 'Losing $20\\%$ keeps $80\\%$ ($b = 0.8$); losing $10\\%$ keeps $90\\%$ ($b = 0.9$).' },
        { text: '(b) Compare year by year.', tex: '\\begin{array}{c|cccc} t & 1 & 2 & 3 & 4 \\\\ \\hline A(t) & 720 & 576 & 460.80 & 368.64 \\\\ B(t) & 630 & 567 & 510.30 & 459.27 \\end{array}', why: 'Each year, multiply A\'s value by $0.8$ and B\'s by $0.9$. After $2$ years A is still ahead by \\$9; after $3$ years B is ahead.' },
        { text: '(c) Read the gap from the graph.', why: 'The curves cross a little after year $2$. After that the gap keeps growing (\\$49.50 at year $3$, \\$90.63 at year $4$), because A loses a bigger percent every year.' },
      ],
      answer: '(a) $A(t) = 900(0.8)^t$ and $B(t) = 700(0.9)^t$. (b) After $3$ years (\\$510.30 versus \\$460.80). (c) The curves cross a little after year $2$, and Phone B stays ahead by more and more each year.',
    },
  ],
  teachMeAgain: [
    {
      approach: 'visual',
      title: 'See the half-lives',
      blocks: [
        { t: 'p', text: 'Every $6$ hours, the medicine curve drops to half its height. Follow the points: each one is half the one before.' },
        {
          t: 'graph',
          caption: 'Medicine with a half-life of 6 hours, starting at 400 mg.',
          spec: {
            xMin: -3,
            xMax: 33,
            yMin: 0,
            yMax: 450,
            xStep: 3,
            yStep: 50,
            xLabel: 'hours',
            yLabel: 'mg left',
            functions: [{ expr: '400(1/2)^(x/6)', label: 'M(t) = 400(1/2)^(t/6)', domain: [0, 30] }],
            points: [
              { x: 0, y: 400, label: '(0, 400)' },
              { x: 6, y: 200, label: '(6, 200)' },
              { x: 12, y: 100, label: '(12, 100)' },
              { x: 18, y: 50, label: '(18, 50)' },
              { x: 24, y: 25, label: '(24, 25)' },
              { x: 30, y: 12.5, label: '(30, 12.5)' },
            ],
            ariaLabel: 'A decreasing curve starting at (0, 400) and passing through (6, 200), (12, 100), (18, 50), (24, 25) and (30, 12.5). It gets closer and closer to 0 without reaching it.',
          },
        },
        { t: 'p', text: 'To answer "when is $50$ mg left?", find $50$ on the vertical axis and read across to the curve: $18$ hours. The curve gets close to $0$ but never reaches it, because half of something is never nothing.' },
      ],
    },
    {
      approach: 'simpler-example',
      title: 'Double, double, double',
      blocks: [
        { t: 'p', text: 'You have \\$5, and every $2$ weeks the amount doubles. Make a table one period at a time:' },
        {
          t: 'table',
          caption: 'Five dollars doubling every 2 weeks.',
          headers: ['Weeks $t$', '$0$', '$2$', '$4$', '$6$', '$8$'],
          rows: [
            ['Doublings $\\frac{t}{2}$', '$0$', '$1$', '$2$', '$3$', '$4$'],
            ['Amount', '\\$5', '\\$10', '\\$20', '\\$40', '\\$80'],
          ],
        },
        { t: 'p', text: 'The number of doublings is the weeks divided by $2$, so the model is $A(t) = 5(2)^{t/2}$. Check: $A(8) = 5(2)^4 = 5(16) = 80$. It matches the table.' },
      ],
    },
    {
      approach: 'analogy',
      title: 'A pizza that keeps getting cut in half',
      blocks: [
        { t: 'p', text: 'Imagine a giant pizza, and every hour someone eats half of what is left. One hour: half is left. Two hours: a quarter. Three hours: an eighth. That is half-life: the **same fraction** disappears each period, so the amount eaten gets smaller each time, and there is always a sliver left.' },
        { t: 'p', text: 'Doubling is the reverse, like a rumor where everyone who knows it tells one new person every day. The number who know doubles each day. It cannot go on forever, though: the school runs out of people to tell. That is a limitation of the model.' },
      ],
    },
    {
      approach: 'prerequisite',
      title: 'Refresher: the parts of a(b)^t',
      blocks: [
        { t: 'list', items: [
          '**$a$ is the starting amount**, the value when $t = 0$, because $b^0 = 1$. In $300(1.05)^t$, the start is $300$.',
          '**$b$ is the factor per period.** $b > 1$ is growth and $0 < b < 1$ is decay.',
          '**Percent to factor:** growth by $r$ gives $b = 1 + r$; decay by $r$ gives $b = 1 - r$. So $5\\%$ growth is $1.05$, and $30\\%$ decay is $0.7$.',
          '**Factor to percent:** $b = 1.12$ is $12\\%$ growth; $b = 0.9$ is $10\\%$ decay.',
        ] },
        { t: 'p', text: 'Example: a \\$300 bike loses $30\\%$ of its value each year: $V(t) = 300(0.7)^t$. After $2$ years, $300(0.49) = 147$ dollars.' },
      ],
    },
    {
      approach: 'step-by-step',
      title: 'A routine for any modeling problem',
      blocks: [
        { t: 'list', ordered: true, items: [
          '**Find the start $a$** and its units.',
          '**Find the factor:** $1 + r$ for growth, $1 - r$ for decay, $2$ for doubling, $\\frac{1}{2}$ for half-life.',
          '**Find the period.** If the change happens every $k$ units, the exponent is $\\frac{t}{k}$. If it happens every $1$ unit, the exponent is just $t$.',
          '**Write the model** and check it: at $t = 0$ you should get $a$, and after one period you should get $a$ times the factor.',
          '**Answer the question.** "How much after $t$?" Substitute. "When?" Count periods if it is a power of the factor; otherwise extend a table.',
          '**Make sense of it.** Round to fit the context, give units, and ask whether the model still makes sense that far out.',
        ] },
      ],
    },
    {
      approach: 'alternate-strategy',
      title: 'Count periods instead of using the formula',
      blocks: [
        { t: 'p', text: 'You do not always need to substitute into a formula. You can just **count periods**.' },
        { t: 'list', items: [
          '**How much after $t$?** Count periods, then double (or halve) that many times. Medicine: $400$ mg, half-life $6$ hours, after $24$ hours. $24 \\div 6 = 4$ half-lives: $400 \\to 200 \\to 100 \\to 50 \\to 25$ mg.',
          '**When does it reach a value?** Keep doubling (or halving) until you get there, then multiply the number of periods by the period length. Bacteria: $500 \\to 1000 \\to 2000 \\to 4000 \\to 8000 \\to 16000 \\to 32000$ is $6$ doublings, and $6 \\times 3 = 18$ hours.',
        ] },
        { t: 'p', text: 'This is exactly what the exponent $\\frac{t}{k}$ does for you, so use whichever way makes more sense to you, and check one with the other.' },
      ],
    },
  ],
  guided: [
    { generator: 'u6.exp-model', difficulty: 1 },
    { generator: 'u6.exp-model', difficulty: 1 },
    { generator: 'u6.exp-model', difficulty: 2 },
    { generator: 'u6.exp-model', difficulty: 2 },
  ],
  independent: {
    count: 10,
    reviewCount: 2,
    mix: [
      { generator: 'u6.exp-model', difficulty: 1, weight: 1 },
      { generator: 'u6.exp-model', difficulty: 2, weight: 2 },
      { generator: 'u6.exp-model', difficulty: 3, weight: 2 },
    ],
  },
  quiz: {
    items: [
      { generator: 'u6.exp-model', difficulty: 1 },
      { generator: 'u6.exp-model', difficulty: 2 },
      { generator: 'u6.exp-model', difficulty: 2 },
      { generator: 'u6.exp-model', difficulty: 2 },
      { generator: 'u6.exp-model', difficulty: 3 },
      { generator: 'u6.exp-model', difficulty: 3 },
    ],
  },
  summary: [
    'An exponential model $A(t) = a(b)^t$ needs a starting amount $a$ and a factor per period $b$: $1 + r$ for growth by $r$, $1 - r$ for decay by $r$.',
    'Doubling every $k$ units: $A(t) = a(2)^{t/k}$. Half-life of $k$ units: $A(t) = a\\left(\\frac{1}{2}\\right)^{t/k}$. The exponent $\\frac{t}{k}$ counts the periods, so divide, do not multiply.',
    'To answer "when", count whole periods if the amount is the start times a power of the factor ($\\frac{32000}{500} = 64 = 2^6$); otherwise extend a table or read a graph.',
    'Explain each part of a model with units, round to fit the context, and remember that real growth cannot continue forever, so a model only works for a limited time.',
    'To compare two models, make a table or graph of both and find where one passes the other.',
  ],
  mastery: { quizPassScore: 0.8, practiceMinCorrect: 6 },
};
