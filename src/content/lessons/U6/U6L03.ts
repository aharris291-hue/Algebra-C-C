import type { LessonContent } from '../../../core/curriculum/types';

/**
 * U6L03 Domain, Range and Intervals of Exponential Functions (A.FGR.9.2)
 * The domain of every exponential function is all real numbers; the range of a(b)^x + k is y > k when a > 0
 * and y < k when a < 0, with a parenthesis at k because the asymptote value is never reached; inequality,
 * interval and set-builder notation; an exponential function is increasing on (-inf, inf) or decreasing on
 * (-inf, inf); positive and negative intervals split at the x-intercept (2^x - 8 is negative on (-inf, 3) and
 * positive on (3, inf)), or the function is positive everywhere; and a reasonable domain and range in context
 * from the endpoint values, like B(t) = 100(2)^t on [0, 5] with range [100, 3200] (S6.03). Reviews domain and
 * range of linear functions (S1.11) and quadratics (S4.16).
 *
 * Math verified by hand (2026-10-07): every table value and graph point was recomputed by substitution
 * (3(2)^x - 5 at x = -2..2: -4.25, -3.5, -2, 1, 7; -2(3)^x + 6 at x = -1..1: 16/3, 4, 0, and g(2) = -12;
 * 2^x - 8 at x = 0..4: -7, -6, -4, 0, 8; 5(2)^x: f(-1) = 2.5, f(0) = 5; 4(0.5)^x - 2 at x = -1..2: 6, 2, 0, -1
 * with the zero 0.5^x = 1/2 -> x = 1; 2(3)^x + 1: f(0) = 3, f(-1) = 5/3, f(-2) = 11/9; 100(2)^t: B(0) = 100,
 * B(5) = 3200; 50(3)^d: V(0) = 50, V(4) = 4050; 400(0.5)^t: M(0) = 400, M(4) = 25, M(2) = 100), every range
 * was rechecked from the sign of a and the asymptote y = k, every positive/negative interval was tested with
 * one input on each side of the zero, and every point was checked to lie on its curve and inside its window.
 */
export const U6L03: LessonContent = {
  lessonId: 'U6L03',
  goal: 'Write the domain and range of an exponential function, such as all real numbers and $y > -5$ for $f(x) = 3(2)^x - 5$, in interval and set-builder notation, and describe where it is increasing, decreasing, positive and negative.',
  needToKnow: [
    { t: 'p', text: 'This lesson uses the asymptote from the last lesson and the notation from earlier units:' },
    {
      t: 'list',
      items: [
        '**The asymptote (last lesson).** $f(x) = a(b)^x + k$ approaches the line $y = k$ but never reaches it. It stays above $y = k$ when $a > 0$ and below it when $a < 0$.',
        '**Domain and range (Units 1 and 4).** The domain is all the inputs; the range is all the outputs. For a parabola, the range started at the vertex.',
        '**Notation.** $y > 0$, $(0, \\infty)$ and $\\{y \\mid y > 0\\}$ all describe the same set. A parenthesis means the endpoint is **not** included; a bracket means it is.',
      ],
    },
    { t: 'callout', variant: 'tip', title: 'Quick check', text: 'What is the asymptote of $f(x) = 2^x + 3$, and is the graph above or below it? Write "$y < 4$" in interval notation. (You should get $y = 3$, above, and $(-\\infty, 4)$.) If that felt shaky, open **Teach Me Again** and choose the refresher.' },
  ],
  vocabulary: [
    { term: 'domain', meaning: 'All the inputs a function can use. For every exponential function with no context, all real numbers.' },
    { term: 'range', meaning: 'All the outputs a function actually produces. For $a(b)^x + k$, everything on one side of the asymptote value $k$, but not $k$ itself.' },
    { term: 'interval notation', meaning: 'Writing a set by its endpoints, like $(-5, \\infty)$. Parentheses for endpoints not included and for $\\infty$; brackets for endpoints included.' },
    { term: 'set-builder notation', meaning: 'Writing a set as a rule, like $\\{y \\mid y > -5\\}$, read "all $y$ such that $y$ is greater than $-5$."' },
    { term: 'positive / negative interval', meaning: 'The $x$-values where the graph is above the $x$-axis ($f(x) > 0$) or below it ($f(x) < 0$).' },
  ],
  instruction: [
    { t: 'p', text: '### Domain: every real number' },
    { t: 'p', text: 'You can raise a positive base to **any** exponent: a whole number, $0$, a negative number, or a fraction. So nothing is ever left out of the inputs. The domain of every exponential function (with no context) is all real numbers:' },
    { t: 'math', tex: '\\text{domain: } (-\\infty, \\infty) \\quad\\text{or}\\quad \\{x \\mid x \\in \\mathbb{R}\\}' },
    { t: 'p', text: '### Range: one side of the asymptote' },
    { t: 'p', text: 'For $f(x) = 3(2)^x$, the outputs are always positive, they get as close to $0$ as you like, and they grow without bound. So the range is $y > 0$, or $(0, \\infty)$.' },
    { t: 'callout', variant: 'why', title: 'Why a parenthesis at 0', text: 'For a parabola, the vertex value is actually reached, so it got a bracket. Here there is no input with $3(2)^x = 0$, because $2^x > 0$ for every $x$. The asymptote value is approached but never reached, so it gets a parenthesis: $(0, \\infty)$, not $[0, \\infty)$.' },
    { t: 'p', text: 'Adding $k$ moves every output, and the asymptote, by $k$. For $f(x) = 3(2)^x - 5$, the outputs are all greater than $-5$:' },
    {
      t: 'graph',
      caption: 'f(x) = 3(2)^x - 5 stays above its dashed asymptote y = -5. Its range is y > -5.',
      spec: {
        xMin: -5,
        xMax: 3,
        yMin: -7,
        yMax: 9,
        yStep: 2,
        xLabel: 'x',
        yLabel: 'y',
        functions: [
          { expr: '3*2^x - 5', label: 'f(x) = 3(2)^x - 5' },
          { expr: '-5', label: 'asymptote y = -5', dashed: true },
        ],
        points: [
          { x: -2, y: -4.25, label: '(-2, -4.25)' },
          { x: -1, y: -3.5, label: '(-1, -3.5)' },
          { x: 0, y: -2, label: '(0, -2)' },
          { x: 1, y: 1, label: '(1, 1)' },
          { x: 2, y: 7, label: '(2, 7)' },
        ],
        ariaLabel: 'An increasing curve through (-2, -4.25), (-1, -3.5), (0, -2), (1, 1) and (2, 7). On the left it flattens toward a dashed line at y = -5, always staying above it.',
      },
    },
    { t: 'p', text: 'When $a < 0$ the graph is **below** its asymptote. For $g(x) = -2(3)^x + 6$, every output is less than $6$, so the range is $y < 6$.' },
    {
      t: 'table',
      caption: 'Domain and range written three ways.',
      headers: ['Function', '', 'Inequality', 'Interval', 'Set-builder'],
      rows: [
        ['$f(x) = 3(2)^x - 5$', 'domain', 'all real numbers', '$(-\\infty, \\infty)$', '$\\{x \\mid x \\in \\mathbb{R}\\}$'],
        ['', 'range', '$y > -5$', '$(-5, \\infty)$', '$\\{y \\mid y > -5\\}$'],
        ['$g(x) = -2(3)^x + 6$', 'domain', 'all real numbers', '$(-\\infty, \\infty)$', '$\\{x \\mid x \\in \\mathbb{R}\\}$'],
        ['', 'range', '$y < 6$', '$(-\\infty, 6)$', '$\\{y \\mid y < 6\\}$'],
      ],
    },
    { t: 'math', tex: 'f(x) = a(b)^x + k: \\qquad \\text{range } y > k \\text{ if } a > 0, \\qquad y < k \\text{ if } a < 0' },
    { t: 'callout', variant: 'warning', title: 'The range starts at k, not at the y-intercept', text: 'The $y$-intercept of $3(2)^x - 5$ is $-2$, but the range is not $y > -2$: $f(-1) = -3.5$ is an output too. To the left of the $y$-axis the graph keeps going down toward $-5$. Only $k$ sets the boundary.' },
    { t: 'p', text: '### Increasing and decreasing' },
    { t: 'p', text: 'A parabola turns around at its vertex. An exponential graph never turns: it goes the same direction the whole way. So the interval is always the whole domain:' },
    {
      t: 'list',
      items: [
        '$f(x) = 3(2)^x - 5$ ($a > 0$, $b > 1$) is **increasing on $(-\\infty, \\infty)$**.',
        '$g(x) = -2(3)^x + 6$ ($a < 0$, $b > 1$) is **decreasing on $(-\\infty, \\infty)$**.',
      ],
    },
    { t: 'p', text: '### Positive and negative intervals' },
    { t: 'p', text: 'These are the $x$-values where the graph is above the $x$-axis (positive) or below it (negative). They split at the $x$-intercept, if there is one. For $f(x) = 2^x - 8$, the zero is where $2^x = 8 = 2^3$, so $x = 3$:' },
    {
      t: 'graph',
      caption: 'f(x) = 2^x - 8 is below the x-axis to the left of x = 3 and above it to the right.',
      spec: {
        xMin: -4,
        xMax: 5,
        yMin: -10,
        yMax: 10,
        yStep: 2,
        xLabel: 'x',
        yLabel: 'y',
        functions: [
          { expr: '2^x - 8', label: 'f(x) = 2^x - 8' },
          { expr: '-8', label: 'asymptote y = -8', dashed: true },
        ],
        points: [
          { x: 0, y: -7, label: '(0, -7)' },
          { x: 2, y: -4, label: '(2, -4)' },
          { x: 3, y: 0, label: '(3, 0)' },
          { x: 4, y: 8, label: '(4, 8)' },
        ],
        ariaLabel: 'An increasing curve through (0, -7), (2, -4), (3, 0) and (4, 8), above a dashed asymptote at y = -8. It crosses the x-axis at (3, 0).',
      },
    },
    {
      t: 'list',
      items: [
        '**Negative on $(-\\infty, 3)$:** for example, $f(2) = 4 - 8 = -4 < 0$.',
        '**Positive on $(3, \\infty)$:** for example, $f(4) = 16 - 8 = 8 > 0$.',
        'At $x = 3$ itself, $f(3) = 0$, which is neither positive nor negative, so both intervals use a parenthesis at $3$.',
      ],
    },
    { t: 'p', text: 'For $g(x) = -2(3)^x + 6$, the zero is where $3^x = 3$, so $x = 1$. It is decreasing, so it is **positive on $(-\\infty, 1)$** and **negative on $(1, \\infty)$**.' },
    { t: 'p', text: 'If the graph never crosses the $x$-axis, there is no split. For $3(2)^x$ or $3(2)^x + 1$, the range is entirely above $0$, so the function is positive on $(-\\infty, \\infty)$ and never negative.' },
    { t: 'callout', variant: 'tip', title: 'Intervals are x-values', text: 'Increasing, decreasing, positive and negative intervals are written with **$x$-values**. The range is written with **$y$-values**. Do not mix them: "positive on $(3, \\infty)$" is about inputs; "range $(-8, \\infty)$" is about outputs.' },
    { t: 'p', text: '### Domain and range in context' },
    { t: 'p', text: 'A sample has $100$ bacteria and doubles every hour, so $B(t) = 100(2)^t$. The scientist watches for $5$ hours. Time only runs from $t = 0$ to $t = 5$, so the **reasonable domain** is $0 \\le t \\le 5$, or $[0, 5]$.' },
    { t: 'p', text: 'Because $B$ is increasing, its smallest output is at the start and its largest at the end: $B(0) = 100$ and $B(5) = 100(32) = 3200$. The **reasonable range** is $100 \\le B \\le 3200$, or $[100, 3200]$. Brackets this time, because both endpoints really happen.' },
    { t: 'callout', variant: 'realworld', title: 'Where this shows up', text: 'Any real model has a limited window: a savings account from the day it opens until you take the money out, or medicine from the dose until the next one. Stating the reasonable domain and range tells a reader which part of the curve to trust.' },

    { t: 'p', text: '### Reading the range from a graph' },
    { t: 'p', text: 'On a graph, find the dashed asymptote and ask which side of it the curve is on. If the asymptote is $y = -2$ and the curve is above it and rises without bound, the range is $(-2, \\infty)$: every output above $-2$ happens, but $-2$ itself never does.' },
    { t: 'p', text: '### Counting inputs: discrete domains' },
    { t: 'p', text: 'Sometimes the input **counts** something, so only whole numbers make sense. That kind of domain is called **discrete**: a list of separate values, not an interval.' },
    { t: 'list', items: [
      '**Bounces:** if $h(n) = 6(0.75)^n$ is the height of the $n$th bounce, the domain is the positive integers $1, 2, 3, \\dots$ There is no bounce $2.5$.',
      '**Rounds of a tournament:** $T(r) = 32\\left(\\frac{1}{2}\\right)^r$ teams are left after $r$ rounds, and the tournament stops when $1$ team is left, at $r = 5$. The domain is the integers $0, 1, 2, 3, 4, 5$.',
      '**Items in an order:** if building the $n$th engine of a $20$-engine order takes $h(n) = 50(0.9)^n$ person-hours, the domain is the integers $1, 2, \\dots, 20$.',
      '**Time:** time flows continuously, so a $5$-hour experiment has the interval $[0, 5]$ as its domain, including times like $2.5$ hours.',
    ] },
    { t: 'callout', variant: 'tip', title: 'Ask what the input stands for', text: 'Count it (bounces, rounds, people, engines)? Use whole numbers, and check where the count starts and stops. Measure it (time, distance)? Use an interval.' },
  ],
  examples: [
    {
      title: 'Domain and range of a growth function',
      kind: 'introductory',
      problem: [{ t: 'p', text: 'Find the domain and range of $f(x) = 5(2)^x$. Write each in interval and set-builder notation.' }],
      steps: [
        { text: 'Domain.', tex: '(-\\infty, \\infty), \\quad \\{x \\mid x \\in \\mathbb{R}\\}', why: 'Any real number can be an exponent, so every input works.' },
        { text: 'Find the asymptote and which side the graph is on.', tex: 'y = 0, \\quad a = 5 > 0', why: 'There is no $+k$, so $k = 0$. A positive $a$ puts the graph above the asymptote.' },
        { text: 'Test a few outputs.', tex: 'f(-1) = 2.5, \\quad f(0) = 5, \\quad f(-10) = \\tfrac{5}{1024}', why: 'They are all positive, and going left they shrink toward $0$ without reaching it.' },
        { text: 'Range.', tex: 'y > 0, \\quad (0, \\infty), \\quad \\{y \\mid y > 0\\}', why: 'A parenthesis at $0$ because $0$ is never an output.' },
      ],
      answer: 'Domain: $(-\\infty, \\infty)$ or $\\{x \\mid x \\in \\mathbb{R}\\}$. Range: $(0, \\infty)$ or $\\{y \\mid y > 0\\}$.',
    },
    {
      title: 'Everything about a shifted decay function',
      kind: 'intermediate',
      problem: [{ t: 'p', text: 'For $g(x) = 4(0.5)^x - 2$, find the domain and range, where $g$ is increasing or decreasing, and where it is positive and negative.' }],
      steps: [
        { text: 'Domain.', tex: '(-\\infty, \\infty)', why: 'Every exponential function accepts all real inputs.' },
        { text: 'Range.', tex: 'y > -2, \\quad (-2, \\infty), \\quad \\{y \\mid y > -2\\}', why: 'The asymptote is $y = k = -2$, and $a = 4 > 0$ puts the graph above it.' },
        { text: 'Increasing or decreasing.', tex: '\\text{decreasing on } (-\\infty, \\infty)', why: '$a > 0$ and $0 < b < 1$. Check: $g(-1) = 4(2) - 2 = 6$ and $g(1) = 4(0.5) - 2 = 0$, so the output went down.' },
        { text: 'Find the zero.', tex: '4(0.5)^x = 2 \\;\\Rightarrow\\; (0.5)^x = 0.5 \\;\\Rightarrow\\; x = 1', why: 'Set $g(x) = 0$, get the power alone, and match exponents.' },
        { text: 'Positive and negative.', tex: '\\text{positive on } (-\\infty, 1), \\quad \\text{negative on } (1, \\infty)', why: 'It is decreasing, so it is above the $x$-axis before the zero and below after. Check: $g(0) = 2 > 0$ and $g(2) = 4(0.25) - 2 = -1 < 0$.' },
      ],
      answer: 'Domain $(-\\infty, \\infty)$; range $(-2, \\infty)$; decreasing on $(-\\infty, \\infty)$; positive on $(-\\infty, 1)$; negative on $(1, \\infty)$.',
    },
    {
      title: 'Two wrong ranges',
      kind: 'common-mistake',
      problem: [{ t: 'p', text: 'For $f(x) = 2(3)^x + 1$, Tyler says the range is $[1, \\infty)$ and Aaliyah says it is $y \\ge 3$. Who is right?' }],
      steps: [
        { text: 'Find the correct boundary.', tex: 'y = 1, \\quad a = 2 > 0', why: 'The asymptote is $y = k = 1$, and the graph is above it. So the boundary is $1$, which Tyler got right.' },
        { text: 'Check Tyler\'s bracket.', tex: '2(3)^x + 1 = 1 \\;\\Rightarrow\\; 3^x = 0', why: 'No power of $3$ is $0$, so $1$ is never an output. The bracket is wrong; it must be a parenthesis.' },
        { text: 'Check Aaliyah\'s answer.', tex: 'f(-1) = 2 \\cdot \\tfrac{1}{3} + 1 = \\tfrac{5}{3}', why: '$\\frac{5}{3}$ is an output, but $\\frac{5}{3} \\ge 3$ is false. Aaliyah used the $y$-intercept $f(0) = 3$, but the graph keeps going down to the left of the $y$-axis.' },
        { text: 'Write the correct range.', tex: 'y > 1, \\quad (1, \\infty), \\quad \\{y \\mid y > 1\\}', why: 'Every output is greater than $1$, and outputs get as close to $1$ as you like (for example $f(-2) = \\frac{11}{9}$).' },
      ],
      answer: 'Neither. The range is $y > 1$, or $(1, \\infty)$: the boundary is the asymptote $k = 1$, with a parenthesis because $1$ is never reached.',
    },
    {
      title: 'Views of a video',
      kind: 'real-world',
      problem: [
        { t: 'p', text: 'A video had $50$ views when it was posted, and its views tripled every day for the next $4$ days: $V(d) = 50(3)^d$, for $0 \\le d \\le 4$. Find a reasonable domain and range.' },
        {
          t: 'graph',
          caption: 'The model only runs from day 0 to day 4.',
          spec: {
            xMin: -1,
            xMax: 5,
            yMin: 0,
            yMax: 4500,
            yStep: 500,
            xLabel: 'days',
            yLabel: 'views',
            functions: [{ expr: '50*3^x', label: 'V(d) = 50(3)^d', domain: [0, 4] }],
            points: [
              { x: 0, y: 50, label: '(0, 50)' },
              { x: 4, y: 4050, label: '(4, 4050)' },
            ],
            ariaLabel: 'An increasing curve drawn only from (0, 50) to (4, 4050).',
          },
        },
      ],
      steps: [
        { text: 'Reasonable domain.', tex: '0 \\le d \\le 4, \\quad [0, 4]', why: 'The model covers the day it was posted, $d = 0$, through day $4$. Both endpoints are included.' },
        { text: 'Find the output at each end.', tex: 'V(0) = 50, \\qquad V(4) = 50(81) = 4050', why: '$3^4 = 81$. Because $V$ is increasing, the smallest output is at the start and the largest at the end.' },
        { text: 'Reasonable range.', tex: '50 \\le V \\le 4050, \\quad [50, 4050]', why: 'Brackets, because $50$ and $4050$ both actually happen. The model\'s asymptote $V = 0$ does not matter here, since the domain stops at $d = 0$.' },
      ],
      answer: 'Domain: $0 \\le d \\le 4$ days, $[0, 4]$. Range: $50 \\le V \\le 4050$ views, $[50, 4050]$.',
    },
    {
      title: 'Medicine that wears off',
      kind: 'challenging',
      problem: [{ t: 'p', text: 'A patient takes a $400$-milligram dose. The amount left in the body after $t$ hours is $M(t) = 400(0.5)^t$, and the model is used until the next dose at $t = 4$. (a) Find the reasonable domain and range. (b) Compare them with the domain and range of $M$ with no context.' }],
      steps: [
        { text: '(a) Reasonable domain.', tex: '0 \\le t \\le 4, \\quad [0, 4]', why: 'From the moment of the dose until the next one.' },
        { text: 'Find the outputs at the endpoints.', tex: 'M(0) = 400, \\qquad M(4) = 400 \\cdot \\tfrac{1}{16} = 25', why: '$M$ is decreasing ($0 < b < 1$), so this time the **largest** output is at the start and the **smallest** is at the end.' },
        { text: 'Reasonable range.', tex: '25 \\le M \\le 400, \\quad [25, 400]', why: 'Write the smaller number first in an interval, even though it happens last in time. Every amount between them happens once, for example $M(2) = 100$.' },
        { text: '(b) With no context.', tex: '\\text{domain } (-\\infty, \\infty), \\quad \\text{range } (0, \\infty)', why: 'The math function takes any input and approaches its asymptote $M = 0$ without reaching it. The context cuts both down to the part that is real.' },
      ],
      answer: '(a) Domain $[0, 4]$ hours; range $[25, 400]$ milligrams. (b) With no context: domain $(-\\infty, \\infty)$, range $(0, \\infty)$.',
    },
  ],
  teachMeAgain: [
    {
      approach: 'visual',
      title: 'The shadow on the y-axis',
      blocks: [
        { t: 'p', text: 'Shine a light from the right so the graph casts a shadow on the $y$-axis. That shadow is the range.' },
        {
          t: 'graph',
          caption: 'g(x) = -2(3)^x + 6 is entirely below its dashed asymptote y = 6, and it reaches down forever.',
          spec: {
            xMin: -4,
            xMax: 2,
            yMin: -8,
            yMax: 8,
            yStep: 2,
            functions: [
              { expr: '-2*3^x + 6', label: 'g(x) = -2(3)^x + 6' },
              { expr: '6', label: 'y = 6', dashed: true },
            ],
            points: [
              { x: -1, y: 16 / 3, label: '(-1, 16/3)' },
              { x: 0, y: 4, label: '(0, 4)' },
              { x: 1, y: 0, label: '(1, 0)' },
            ],
            ariaLabel: 'A decreasing curve below a dashed line at y = 6, passing through (-1, 16/3), (0, 4) and (1, 0) and dropping steeply to the right.',
          },
        },
        { t: 'p', text: 'The shadow covers everything below $6$ but never $6$ itself: range $(-\\infty, 6)$. The graph is above the $x$-axis left of $(1, 0)$ and below it to the right: positive on $(-\\infty, 1)$, negative on $(1, \\infty)$.' },
      ],
    },
    {
      approach: 'simpler-example',
      title: 'Start with 2^x and move it',
      blocks: [
        { t: 'list', items: [
          '$y = 2^x$: outputs are always positive. Range $(0, \\infty)$.',
          '$y = 2^x + 3$: every output goes up $3$. Range $(3, \\infty)$.',
          '$y = 2^x - 8$: every output goes down $8$. Range $(-8, \\infty)$.',
          '$y = -2^x$: every output is the opposite of a positive number. Range $(-\\infty, 0)$.',
        ] },
        { t: 'p', text: 'The domain is $(-\\infty, \\infty)$ every time. Only the range changes, and it always uses a parenthesis at the asymptote.' },
      ],
    },
    {
      approach: 'analogy',
      title: 'A line you can never step on',
      blocks: [
        { t: 'p', text: 'Imagine the asymptote $y = k$ is a painted line on the floor, and you are only allowed to stay on one side of it. You can stand as close to it as you want, a tenth of an inch, a hundredth, but never on it.' },
        { t: 'p', text: 'That is why the range is $y > k$ (or $y < k$) and never $y \\ge k$. In a quadratic, the vertex was a spot you actually stood on, so it got a bracket. The asymptote is a spot you never reach, so it gets a parenthesis.' },
      ],
    },
    {
      approach: 'prerequisite',
      title: 'Refresher: three ways to write a set',
      blocks: [
        {
          t: 'table',
          caption: 'The same sets in inequality, interval and set-builder notation.',
          headers: ['In words', 'Inequality', 'Interval', 'Set-builder'],
          rows: [
            ['greater than -5', '$y > -5$', '$(-5, \\infty)$', '$\\{y \\mid y > -5\\}$'],
            ['less than 6', '$y < 6$', '$(-\\infty, 6)$', '$\\{y \\mid y < 6\\}$'],
            ['from 100 to 3200', '$100 \\le y \\le 3200$', '$[100, 3200]$', '$\\{y \\mid 100 \\le y \\le 3200\\}$'],
            ['any real number', 'all real $x$', '$(-\\infty, \\infty)$', '$\\{x \\mid x \\in \\mathbb{R}\\}$'],
          ],
        },
        { t: 'p', text: 'Parentheses go with $<$ and $>$ and always with $\\infty$. Brackets go with $\\le$ and $\\ge$. In an interval, the smaller number is always written first.' },
      ],
    },
    {
      approach: 'step-by-step',
      title: 'A routine for any a(b)^x + k',
      blocks: [
        { t: 'p', text: 'Example: $f(x) = -4(2)^x + 16$.' },
        { t: 'list', ordered: true, items: [
          '**Domain:** always $(-\\infty, \\infty)$.',
          '**Asymptote:** $y = k = 16$.',
          '**Range:** $a = -4 < 0$, so below the asymptote: $y < 16$, or $(-\\infty, 16)$.',
          '**Direction:** $a < 0$ and $b > 1$, so decreasing on $(-\\infty, \\infty)$.',
          '**Zero:** $-4(2)^x + 16 = 0$ gives $2^x = 4$, so $x = 2$. Decreasing, so positive on $(-\\infty, 2)$ and negative on $(2, \\infty)$.',
        ] },
        { t: 'p', text: 'Check with one input on each side: $f(0) = -4 + 16 = 12 > 0$ and $f(3) = -32 + 16 = -16 < 0$.' },
      ],
    },
    {
      approach: 'alternate-strategy',
      title: 'Use a sign table for positive and negative',
      blocks: [
        { t: 'p', text: 'Once you know the zero, test one input on each side instead of picturing the graph. For $f(x) = 2^x - 8$, the zero is $x = 3$.' },
        {
          t: 'table',
          caption: 'One test input on each side of the zero x = 3.',
          headers: ['Interval', 'Test $x$', '$f(x) = 2^x - 8$', 'Sign'],
          rows: [
            ['$(-\\infty, 3)$', '$0$', '$1 - 8 = -7$', 'negative'],
            ['$(3, \\infty)$', '$4$', '$16 - 8 = 8$', 'positive'],
          ],
        },
        { t: 'p', text: 'An exponential function crosses the $x$-axis at most once, because it only goes one direction. So one test on each side is enough.' },
      ],
    },
  ],
  guided: [
    { generator: 'u6.exp-domain-range', difficulty: 1 },
    { generator: 'u6.exp-domain-range', difficulty: 1 },
    { generator: 'u6.exp-domain-range', difficulty: 2 },
    { generator: 'u6.exp-domain-range', difficulty: 3 },
  ],
  independent: {
    count: 8,
    reviewCount: 2,
    mix: [
      { generator: 'u6.exp-domain-range', difficulty: 1, weight: 2 },
      { generator: 'u6.exp-domain-range', difficulty: 2, weight: 3 },
      { generator: 'u6.exp-domain-range', difficulty: 3, weight: 3 },
    ],
  },
  quiz: {
    items: [
      { generator: 'u6.exp-domain-range', difficulty: 1 },
      { generator: 'u6.exp-domain-range', difficulty: 2 },
      { generator: 'u6.exp-domain-range', difficulty: 2 },
      { generator: 'u6.exp-domain-range', difficulty: 2 },
      { generator: 'u6.exp-domain-range', difficulty: 3 },
      { generator: 'u6.exp-domain-range', difficulty: 3 },
    ],
  },
  summary: [
    'The domain of every exponential function, with no context, is all real numbers: $(-\\infty, \\infty)$ or $\\{x \\mid x \\in \\mathbb{R}\\}$.',
    'The range of $a(b)^x + k$ is $y > k$, or $(k, \\infty)$, when $a > 0$, and $y < k$, or $(-\\infty, k)$, when $a < 0$. Use a parenthesis at $k$: the asymptote value is never reached. The $y$-intercept does not set the range.',
    'An exponential function is increasing on $(-\\infty, \\infty)$ or decreasing on $(-\\infty, \\infty)$. Positive and negative intervals split at the $x$-intercept, like $2^x - 8$: negative on $(-\\infty, 3)$, positive on $(3, \\infty)$.',
    'In context, the reasonable domain is the time window, and the range runs between the outputs at its endpoints: $B(t) = 100(2)^t$ on $[0, 5]$ has range $[100, 3200]$.',
  ],
  mastery: { quizPassScore: 0.8, practiceMinCorrect: 5 },
};
