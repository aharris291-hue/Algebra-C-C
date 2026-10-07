import type { LessonContent } from '../../../core/curriculum/types';

/**
 * U5L06 Percent Growth, Decay and Compound Interest (A.PAR.8.2, A.PAR.8.3, A.MM.1.2, A.MM.1.3)
 * Writing percent change as y = a(1 + r)^t or y = a(1 - r)^t after converting the percent to a decimal; the
 * value after t periods; why 10% growth for 2 years is 21% and a 20% decrease then a 20% increase is a 4% net
 * decrease; simple versus compound interest; A = P(1 + r/n)^(nt) for n = 1, 2, 4 and 12 and what each part
 * means; rounding money to the nearest cent only at the end; interest earned = A - P (S5.06).
 *
 * Math verified by hand (2026-10-07): every value below was recomputed with node at full precision and rounded
 * only at the end: 2400(1.03)^5 = 2782.26, 800(0.75)^3 = 337.50, 1.1^2 = 1.21, 0.8 * 1.2 = 0.96 and
 * 50 -> 40 -> 48, 1000(1.05)^3 = 1157.625 vs simple 1150, 1000(1 + 0.06/n)^(10n) = 1790.85, 1806.11, 1814.02,
 * 1819.40 for n = 1, 2, 4, 12, 2500(1.01)^24 = 3174.34, 1200(1.003)^60 = 1436.27 vs 1200(1.036)^5 = 1432.12,
 * 5000(1.05)^10 = 8144.47 vs 5000(1 + 0.049/12)^120 = 8153.44 (and 8169.70 if 1.0041 is rounded too early),
 * 3000(1.01125)^32 = 4291.35, 100(1.1)^3 = 133.10, and the graph points 1000(1.05)^10 = 1628.89 and
 * 1000(1.05)^20 = 2653.30 against 1000 + 50x; every graph expression was parsed and evaluated with
 * src/core/math/parser.ts.
 */
export const U5L06: LessonContent = {
  lessonId: 'U5L06',
  goal: 'Write an exponential model for a percent increase or decrease, like $y = 2400(1.03)^t$ for a population growing $3\\%$ a year, find values after several periods, and use the compound interest formula $A = P\\left(1 + \\frac{r}{n}\\right)^{nt}$ to find an account balance and the interest earned.',
  needToKnow: [
    { t: 'p', text: 'This lesson builds on the last few lessons and on percents from middle school:' },
    {
      t: 'list',
      items: [
        '**Percent to decimal.** Divide by $100$: $3\\% = 0.03$, $15\\% = 0.15$, $4.5\\% = 0.045$, $0.5\\% = 0.005$.',
        '**Exponential models.** In $y = a(b)^t$, $a$ is the starting value and $b$ is the factor you multiply by each period. $b > 1$ is growth; $0 < b < 1$ is decay.',
        '**Growth and decay factors.** A factor of $1.08$ means $8\\%$ growth; a factor of $0.75$ means $25\\%$ decay.',
      ],
    },
    { t: 'callout', variant: 'tip', title: 'Quick check', text: 'What is $6\\%$ of \\$250, and what is \\$250 plus that amount? (You should get $0.06 \\times 250 = 15$ and $250 + 15 = 265$, which is the same as $250 \\times 1.06$.) If that felt shaky, open **Teach Me Again** and choose the refresher.' },
  ],
  vocabulary: [
    { term: 'growth rate', meaning: 'The percent an amount increases each period, written as a decimal $r$. The growth factor is $b = 1 + r$.' },
    { term: 'decay rate', meaning: 'The percent an amount decreases each period, written as a decimal $r$. The decay factor is $b = 1 - r$.' },
    { term: 'principal', meaning: 'The amount of money you start with in an account or loan, $P$.' },
    { term: 'simple interest', meaning: 'Interest paid only on the original principal: $I = Prt$. The balance grows by the same amount each year (linear).' },
    { term: 'compound interest', meaning: 'Interest paid on the principal **and** on the interest already earned, so the balance grows by a percent each period (exponential).' },
    { term: 'compounding period', meaning: 'How often interest is added: annually ($n = 1$), semiannually ($n = 2$), quarterly ($n = 4$) or monthly ($n = 12$).' },
  ],
  instruction: [
    { t: 'p', text: '### From a percent to a factor' },
    { t: 'p', text: 'A town has $2400$ people and grows by $3\\%$ each year. After one year it has the original $100\\%$ **plus** $3\\%$ more:' },
    { t: 'math', tex: '2400 + 0.03(2400) = 2400(1 + 0.03) = 2400(1.03)' },
    { t: 'p', text: 'Every year does the same thing to the new population, so after $t$ years you have multiplied by $1.03$ a total of $t$ times:' },
    { t: 'math', tex: 'y = 2400(1.03)^t' },
    { t: 'p', text: 'A decrease works the same way, but you keep what is **left**. A car worth \\$24,000 that loses $15\\%$ a year keeps $100\\% - 15\\% = 85\\%$ of its value each year: $V = 24000(1 - 0.15)^t = 24000(0.85)^t$.' },
    {
      t: 'table',
      caption: 'The two percent-change models. Convert the percent to a decimal r first.',
      headers: ['Change', 'Factor', 'Model', 'Example'],
      rows: [
        ['increase by $r$', '$b = 1 + r$', '$y = a(1 + r)^t$', '$3\\%$ growth: $b = 1.03$'],
        ['decrease by $r$', '$b = 1 - r$', '$y = a(1 - r)^t$', '$15\\%$ decay: $b = 0.85$'],
      ],
    },
    { t: 'callout', variant: 'warning', title: 'Convert the percent first', text: '$3\\%$ growth is $b = 1.03$, not $b = 1.3$ (that would be $30\\%$) and not $b = 3$ (that would triple). And $15\\%$ decay is $b = 0.85$, not $b = 0.15$: the factor is what is **kept**, not what is lost.' },
    { t: 'p', text: '### The value after t periods' },
    { t: 'p', text: 'Substitute the number of periods. After $5$ years the town has' },
    { t: 'math', tex: '2400(1.03)^5 \\approx 2782.26 \\approx 2782 \\text{ people}' },
    { t: 'p', text: 'People come in whole numbers, so round the final answer to $2782$.' },
    { t: 'p', text: '### Percents do not simply add up' },
    { t: 'p', text: 'Grow \\$100 by $10\\%$ for two years: \\$100 becomes \\$110, and then $10\\%$ of \\$110 is \\$11, so it becomes \\$121. The total increase is $21\\%$, not $20\\%$:' },
    { t: 'math', tex: '(1.10)^2 = 1.21 \\;\\Rightarrow\\; 21\\% \\text{ total increase}' },
    { t: 'p', text: 'The second year earned $10\\%$ of a **bigger** amount. Going the other way, a $20\\%$ decrease followed by a $20\\%$ increase does **not** get you back to the start:' },
    { t: 'math', tex: '(0.80)(1.20) = 0.96 \\;\\Rightarrow\\; 4\\% \\text{ net decrease}' },
    { t: 'p', text: '### Simple interest versus compound interest' },
    { t: 'p', text: 'Put \\$1,000 in an account paying $5\\%$ a year for $3$ years.' },
    {
      t: 'table',
      caption: 'Simple interest adds the same 50 dollars each year. Compound interest adds 5 percent of the current balance, so it adds a little more each year.',
      headers: ['Year', 'Simple interest balance', 'Compound interest balance (annually)'],
      rows: [
        ['$0$', '\\$1,000.00', '\\$1,000.00'],
        ['$1$', '\\$1,050.00', '$1000(1.05) =$ \\$1,050.00'],
        ['$2$', '\\$1,100.00', '$1000(1.05)^2 =$ \\$1,102.50'],
        ['$3$', '\\$1,150.00', '$1000(1.05)^3 = 1157.625 \\approx$ \\$1,157.63'],
      ],
    },
    { t: 'p', text: 'Simple interest pays $5\\%$ of the original \\$1,000 every year, so it is linear: $1000 + 50t$. Compound interest pays interest on the interest too, so it is exponential: $1000(1.05)^t$. Over a long time the difference gets big.' },
    {
      t: 'graph',
      caption: 'Over 20 years, compound interest (curve) pulls far ahead of simple interest (line) on the same 1000 dollars at 5 percent.',
      spec: {
        xMin: -1,
        xMax: 21,
        yMin: 0,
        yMax: 2800,
        xStep: 2,
        yStep: 200,
        xLabel: 'years',
        yLabel: 'balance (dollars)',
        functions: [
          { expr: '1000(1.05)^x', label: 'compound: 1000(1.05)^t', domain: [0, 20] },
          { expr: '1000 + 50x', label: 'simple: 1000 + 50t', dashed: true, domain: [0, 20] },
        ],
        points: [
          { x: 0, y: 1000, label: '(0, 1000)' },
          { x: 10, y: 1628.89, label: '(10, 1628.89)' },
          { x: 10, y: 1500, label: '(10, 1500)' },
          { x: 20, y: 2653.3, label: '(20, 2653.30)' },
          { x: 20, y: 2000, label: '(20, 2000)' },
        ],
        ariaLabel: 'Both graphs start at (0, 1000). The dashed simple-interest line rises to (10, 1500) and (20, 2000). The compound-interest curve bends upward through (10, 1628.89) to (20, 2653.30), ending well above the line.',
      },
    },
    { t: 'p', text: '### The compound interest formula' },
    { t: 'p', text: 'Banks often add interest more than once a year. If the yearly rate is $r$ and interest is added $n$ times a year, then each period pays $\\frac{r}{n}$, and in $t$ years there are $nt$ periods:' },
    { t: 'math', tex: 'A = P\\left(1 + \\frac{r}{n}\\right)^{nt}' },
    {
      t: 'list',
      items: [
        '$A$: the amount in the account after $t$ years.',
        '$P$: the principal, the starting amount.',
        '$r$: the yearly interest rate **as a decimal**.',
        '$n$: the number of times interest is added per year: $1$ (annually), $2$ (semiannually), $4$ (quarterly), $12$ (monthly).',
        '$t$: the number of years.',
      ],
    },
    { t: 'p', text: 'Here is \\$1,000 at $6\\%$ for $10$ years, compounded four different ways:' },
    {
      t: 'table',
      caption: 'More compounding periods per year means slightly more money, because interest starts earning interest sooner.',
      headers: ['Compounded', '$n$', 'Rate per period $\\frac{r}{n}$', 'Periods $nt$', 'Balance $A$'],
      rows: [
        ['annually', '$1$', '$0.06$', '$10$', '\\$1,790.85'],
        ['semiannually', '$2$', '$0.03$', '$20$', '\\$1,806.11'],
        ['quarterly', '$4$', '$0.015$', '$40$', '\\$1,814.02'],
        ['monthly', '$12$', '$0.005$', '$120$', '\\$1,819.40'],
      ],
    },
    { t: 'p', text: 'The **interest earned** is the balance minus what you put in: $A - P$. Compounded monthly, that is $1819.40 - 1000 = 819.40$ dollars of interest.' },
    { t: 'callout', variant: 'why', title: 'Why round only at the end', text: 'The factor $\\left(1 + \\frac{r}{n}\\right)$ gets multiplied by itself many times, so even a tiny rounding error inside it grows. Keep every digit in your calculator (type the whole formula at once), and round money to the nearest cent only in the final answer.' },
    { t: 'callout', variant: 'realworld', title: 'Where this shows up', text: 'Savings accounts, college funds, credit card debt (which compounds against you), a town\'s population, the value of a used car, and medicine leaving your body are all modeled with percent growth or decay.' },
  ],
  examples: [
    {
      title: 'Writing and using a growth model',
      kind: 'introductory',
      problem: [{ t: 'p', text: 'A town has $2400$ people and its population grows $3\\%$ per year. Write a model for the population after $t$ years and use it to estimate the population after $5$ years.' }],
      steps: [
        { text: 'Convert the percent.', tex: 'r = 3\\% = 0.03', why: 'The formula needs the rate as a decimal: divide by $100$.' },
        { text: 'Find the growth factor.', tex: 'b = 1 + r = 1.03', why: 'Each year the town keeps all $100\\%$ of its people and adds $3\\%$ more, so it is multiplied by $1.03$.' },
        { text: 'Write the model.', tex: 'y = 2400(1.03)^t', why: 'The starting value is $a = 2400$, and the factor is applied once per year.' },
        { text: 'Substitute $t = 5$.', tex: '2400(1.03)^5 \\approx 2782.26', why: 'Five years means multiplying by $1.03$ five times. Use the calculator for the whole expression, then round.' },
        { text: 'Round to fit the context.', tex: '\\approx 2782 \\text{ people}', why: 'You cannot have part of a person.' },
      ],
      answer: '$y = 2400(1.03)^t$; after $5$ years about $2782$ people.',
    },
    {
      title: 'A decay model',
      kind: 'intermediate',
      problem: [{ t: 'p', text: 'A new phone costs \\$800 and loses $25\\%$ of its value each year. Write a model for its value after $t$ years and find its value after $3$ years.' }],
      steps: [
        { text: 'Find the decay factor.', tex: 'b = 1 - 0.25 = 0.75', why: 'Losing $25\\%$ means keeping $75\\%$ each year.' },
        { text: 'Write the model.', tex: 'V = 800(0.75)^t', why: 'It starts at \\$800 and is multiplied by $0.75$ once a year.' },
        { text: 'Substitute $t = 3$.', tex: '800(0.75)^3 = 800(0.421875) = 337.5', why: '$0.75^3 = 0.421875$. This one comes out exactly.' },
        { text: 'Write it as money.', tex: '\\$337.50', why: 'Money is written to the nearest cent.' },
      ],
      answer: '$V = 800(0.75)^t$; after $3$ years the phone is worth \\$337.50.',
    },
    {
      title: 'Compounded quarterly',
      kind: 'intermediate',
      problem: [{ t: 'p', text: 'You deposit \\$2,500 in an account that pays $4\\%$ interest compounded quarterly. How much is in the account after $6$ years, and how much interest did it earn?' }],
      steps: [
        { text: 'Name the parts.', tex: 'P = 2500, \\; r = 0.04, \\; n = 4, \\; t = 6', why: '"Quarterly" means $4$ times a year, and $4\\% = 0.04$.' },
        { text: 'Find the rate per period and the number of periods.', tex: '\\frac{r}{n} = \\frac{0.04}{4} = 0.01, \\qquad nt = 4(6) = 24', why: 'Each quarter pays $1\\%$, and $6$ years has $24$ quarters.' },
        { text: 'Substitute and compute.', tex: 'A = 2500(1.01)^{24} \\approx 3174.3366', why: 'Keep all the digits until the end.' },
        { text: 'Round to the cent and find the interest.', tex: 'A \\approx \\$3174.34, \\qquad 3174.34 - 2500 = 674.34', why: 'Interest earned is the final amount minus the principal.' },
      ],
      answer: 'About \\$3,174.34 in the account, which includes \\$674.34 of interest.',
    },
    {
      title: 'A common mistake: down 20%, then up 20%',
      kind: 'common-mistake',
      problem: [{ t: 'p', text: 'A \\$50 jacket goes on sale for $20\\%$ off. A month later the store raises the sale price by $20\\%$. Jordan says, "It went down $20\\%$ and up $20\\%$, so it\'s back to \\$50." Is Jordan right?' }],
      steps: [
        { text: 'Apply the decrease.', tex: '50(0.80) = 40', why: '$20\\%$ off means keeping $80\\%$ of the price.' },
        { text: 'Apply the increase to the **new** price.', tex: '40(1.20) = 48', why: 'The $20\\%$ increase is $20\\%$ of \\$40, which is only \\$8. Jordan added back $20\\%$ of \\$50, which is \\$10.' },
        { text: 'Combine the factors to see the overall change.', tex: '(0.80)(1.20) = 0.96', why: 'Two changes in a row multiply. Keeping $96\\%$ means a $4\\%$ net decrease. Doing them in the other order gives the same thing: $50(1.20) = 60$, then $60(0.80) = 48$.' },
      ],
      answer: 'Jordan is wrong. The jacket costs \\$48, a $4\\%$ net decrease from \\$50. Percent changes multiply; they do not cancel by adding and subtracting.',
    },
    {
      title: 'Saving for a car',
      kind: 'real-world',
      problem: [{ t: 'p', text: 'Maya puts \\$1,200 from her summer job into a savings account that pays $3.6\\%$ interest compounded monthly. She plans to leave it for $5$ years, until she buys a car. (a) How much will she have? (b) How much interest will she earn? (c) How much more is that than if the interest were compounded annually?' }],
      steps: [
        { text: 'Name the parts.', tex: 'P = 1200, \\; r = 0.036, \\; n = 12, \\; t = 5', why: '"Monthly" means $n = 12$, and $3.6\\% = 0.036$.' },
        { text: 'Rate per month and number of months.', tex: '\\frac{0.036}{12} = 0.003, \\qquad nt = 12(5) = 60', why: 'Each month pays $0.3\\%$, and $5$ years is $60$ months.' },
        { text: '(a) Compute the balance.', tex: 'A = 1200(1.003)^{60} \\approx 1436.2738 \\approx \\$1436.27', why: 'Type the whole expression at once and round only the final answer to the nearest cent.' },
        { text: '(b) Interest earned.', tex: '1436.27 - 1200 = 236.27', why: 'Interest is the amount the account grew: $A - P$.' },
        { text: '(c) Compare with annual compounding.', tex: '1200(1.036)^5 \\approx 1432.12, \\qquad 1436.27 - 1432.12 = 4.15', why: 'With $n = 1$ the factor is $1.036$ and there are $5$ periods. Monthly compounding adds interest sooner, so it earns a little more.' },
      ],
      answer: '(a) \\$1,436.27; (b) \\$236.27 in interest; (c) \\$4.15 more than annual compounding (\\$1,432.12).',
    },
    {
      title: 'Which account wins?',
      kind: 'challenging',
      problem: [{ t: 'p', text: 'You have \\$5,000 to invest for $10$ years. Account A pays $5\\%$ compounded annually. Account B pays $4.9\\%$ compounded monthly. Which ends with more, and by how much? Then explain what goes wrong if you round $1 + \\frac{0.049}{12}$ to $1.0041$ before raising it to a power.' }],
      steps: [
        { text: 'Account A.', tex: '5000(1.05)^{10} \\approx 8144.4731 \\approx \\$8144.47', why: '$n = 1$, so the factor is $1.05$ and there are $10$ periods.' },
        { text: 'Account B.', tex: '5000\\left(1 + \\frac{0.049}{12}\\right)^{120} \\approx 8153.4423 \\approx \\$8153.44', why: '$n = 12$ and $nt = 120$. Enter $0.049/12$ inside the calculator expression instead of a rounded decimal.' },
        { text: 'Compare.', tex: '8153.44 - 8144.47 = 8.97', why: 'Account B has a lower rate, but compounding $12$ times a year lets the interest start earning interest sooner, and here that more than makes up the difference.' },
        { text: 'See the rounding error.', tex: '5000(1.0041)^{120} \\approx 8169.70', why: 'The true factor is $1.0040833\\ldots$. Rounding it up a little and then multiplying by it $120$ times adds up to \\$16.26 too much. Round only the final answer.' },
      ],
      answer: 'Account B ends with \\$8,153.44, which is \\$8.97 more than Account A\'s \\$8,144.47. Rounding the factor early would give \\$8,169.70, which is wrong.',
    },
  ],
  teachMeAgain: [
    {
      approach: 'visual',
      title: 'Line versus curve',
      blocks: [
        { t: 'p', text: 'Picture \\$100 growing two ways. Simple interest adds the same \\$10 every year. Compound interest adds $10\\%$ of whatever is there now.' },
        {
          t: 'graph',
          caption: 'Simple interest (dashed line) adds 10 dollars a year. Compound interest (curve) adds 10 percent of the current balance and pulls ahead.',
          spec: {
            xMin: -1,
            xMax: 11,
            yMin: 0,
            yMax: 280,
            yStep: 20,
            xLabel: 'years',
            yLabel: 'dollars',
            functions: [
              { expr: '100(1.1)^x', label: 'compound: 100(1.1)^t', domain: [0, 10] },
              { expr: '100 + 10x', label: 'simple: 100 + 10t', dashed: true, domain: [0, 10] },
            ],
            points: [
              { x: 0, y: 100, label: '(0, 100)' },
              { x: 2, y: 121, label: '(2, 121)' },
              { x: 2, y: 120, label: '(2, 120)' },
              { x: 10, y: 259.37, label: '(10, 259.37)' },
              { x: 10, y: 200, label: '(10, 200)' },
            ],
            ariaLabel: 'Both graphs start at (0, 100). After 2 years the curve is at 121 and the dashed line at 120. After 10 years the curve is at about 259.37 and the line at 200.',
          },
        },
        { t: 'p', text: 'At first the two are almost the same (\\$121 versus \\$120 after $2$ years). But the curve keeps getting steeper, because each year\'s $10\\%$ is taken from a bigger balance. After $10$ years compound interest has about \\$259.37 and simple interest only \\$200.' },
      ],
    },
    {
      approach: 'simpler-example',
      title: 'One year at a time',
      blocks: [
        { t: 'p', text: 'Start with \\$100 and grow it $10\\%$ each year. Do it by hand, one year at a time:' },
        {
          t: 'table',
          caption: 'Each year, 10 percent of the current amount is added.',
          headers: ['Year', 'Start of year', '$10\\%$ of it', 'End of year'],
          rows: [
            ['$1$', '\\$100.00', '\\$10.00', '\\$110.00'],
            ['$2$', '\\$110.00', '\\$11.00', '\\$121.00'],
            ['$3$', '\\$121.00', '\\$12.10', '\\$133.10'],
          ],
        },
        { t: 'p', text: 'Adding $10\\%$ is the same as multiplying by $1.1$. So after $3$ years you have $100(1.1)^3 = 133.1$, or \\$133.10, the same as the table. That is $y = a(1 + r)^t$ with $a = 100$ and $r = 0.10$.' },
      ],
    },
    {
      approach: 'analogy',
      title: 'A rolling snowball',
      blocks: [
        { t: 'p', text: 'A snowball rolling downhill picks up snow in proportion to how big it already is. A small snowball picks up a little; a big one picks up a lot. That is compound growth: the bigger it gets, the faster it grows.' },
        { t: 'p', text: 'Simple interest is like adding one scoop of snow every minute no matter how big the ball is. That is steady, linear growth.' },
        { t: 'p', text: 'Decay is the snowball melting: each hour it loses the same **percent** of what is left, so it loses less and less snow each hour, and it never melts below nothing.' },
      ],
    },
    {
      approach: 'prerequisite',
      title: 'Refresher: percents as decimals and factors',
      blocks: [
        { t: 'p', text: 'To turn a percent into a decimal, divide by $100$ (move the decimal point two places left).' },
        {
          t: 'table',
          caption: 'Percents, decimals, and the growth and decay factors they make.',
          headers: ['Percent', 'Decimal $r$', 'Growth factor $1 + r$', 'Decay factor $1 - r$'],
          rows: [
            ['$5\\%$', '$0.05$', '$1.05$', '$0.95$'],
            ['$12\\%$', '$0.12$', '$1.12$', '$0.88$'],
            ['$2.5\\%$', '$0.025$', '$1.025$', '$0.975$'],
            ['$40\\%$', '$0.4$', '$1.4$', '$0.6$'],
          ],
        },
        { t: 'p', text: 'Check: $5\\%$ of \\$200 is $0.05 \\times 200 = 10$, so a $5\\%$ raise gives \\$210, and $200 \\times 1.05 = 210$ too. A $5\\%$ cut gives \\$190, and $200 \\times 0.95 = 190$.' },
      ],
    },
    {
      approach: 'step-by-step',
      title: 'A five-step routine for compound interest',
      blocks: [
        { t: 'p', text: 'Find the balance after \\$3,000 is invested at $4.5\\%$ compounded quarterly for $8$ years.' },
        { t: 'list', ordered: true, items: [
          '**List the parts:** $P = 3000$, $r = 0.045$, $n = 4$, $t = 8$.',
          '**Rate per period:** $\\frac{r}{n} = \\frac{0.045}{4} = 0.01125$.',
          '**Number of periods:** $nt = 4 \\times 8 = 32$.',
          '**Compute in one go:** $A = 3000(1.01125)^{32} \\approx 4291.3542$.',
          '**Round at the end:** $A \\approx$ \\$4,291.35, and the interest earned is $4291.35 - 3000 =$ \\$1,291.35.',
        ] },
      ],
    },
    {
      approach: 'alternate-strategy',
      title: 'Think in multipliers',
      blocks: [
        { t: 'p', text: 'Instead of finding a percent and then adding or subtracting it, go straight to the multiplier. Every percent change is one multiplication:' },
        { t: 'list', items: [
          'Up $3\\%$: $\\times 1.03$. Down $15\\%$: $\\times 0.85$.',
          'Several changes in a row: multiply the multipliers. Up $10\\%$ twice: $1.1 \\times 1.1 = 1.21$, a $21\\%$ increase.',
          'Down $20\\%$ then up $20\\%$: $0.8 \\times 1.2 = 0.96$, a $4\\%$ decrease.',
          'To read the total change, compare the combined multiplier to $1$: $1.21$ is $0.21$ above $1$ ($+21\\%$); $0.96$ is $0.04$ below $1$ ($-4\\%$).',
        ] },
        { t: 'p', text: 'The compound interest formula is the same idea: $\\left(1 + \\frac{r}{n}\\right)$ is the multiplier for one period, and $nt$ says how many times to use it.' },
      ],
    },
  ],
  guided: [
    { generator: 'u5.percent-change', difficulty: 1 },
    { generator: 'u5.percent-change', difficulty: 2 },
    { generator: 'u5.compound-interest', difficulty: 1 },
    { generator: 'u5.compound-interest', difficulty: 2 },
  ],
  independent: {
    count: 10,
    reviewCount: 2,
    mix: [
      { generator: 'u5.percent-change', difficulty: 1, weight: 1 },
      { generator: 'u5.percent-change', difficulty: 2, weight: 2 },
      { generator: 'u5.percent-change', difficulty: 3, weight: 2 },
      { generator: 'u5.compound-interest', difficulty: 1, weight: 1 },
      { generator: 'u5.compound-interest', difficulty: 2, weight: 2 },
      { generator: 'u5.compound-interest', difficulty: 3, weight: 2 },
    ],
  },
  quiz: {
    items: [
      { generator: 'u5.percent-change', difficulty: 1 },
      { generator: 'u5.percent-change', difficulty: 2 },
      { generator: 'u5.percent-change', difficulty: 3 },
      { generator: 'u5.compound-interest', difficulty: 1 },
      { generator: 'u5.compound-interest', difficulty: 2 },
      { generator: 'u5.compound-interest', difficulty: 2 },
      { generator: 'u5.compound-interest', difficulty: 3 },
    ],
  },
  summary: [
    'Convert the percent to a decimal $r$. Growth by $r$ uses $y = a(1 + r)^t$; decay by $r$ uses $y = a(1 - r)^t$ (for $15\\%$ decay, $b = 0.85$, not $0.15$).',
    'Percent changes multiply, they do not add: $10\\%$ growth for $2$ years is $1.1^2 = 1.21$, a $21\\%$ increase, and down $20\\%$ then up $20\\%$ is $0.8 \\times 1.2 = 0.96$, a $4\\%$ decrease.',
    'Simple interest $I = Prt$ grows linearly; compound interest earns interest on interest and grows exponentially.',
    'Compound interest: $A = P\\left(1 + \\frac{r}{n}\\right)^{nt}$ with $n = 1, 2, 4, 12$ for annually, semiannually, quarterly, monthly. Interest earned is $A - P$.',
    'Keep every digit while you calculate and round money to the nearest cent only at the end.',
  ],
  mastery: { quizPassScore: 0.8, practiceMinCorrect: 6 },
};
