import type { LessonContent } from '../../../core/curriculum/types';

/**
 * U6L08 Geometric Sequences as Exponential Functions (A.FGR.9.4)
 * Rewrite a_n = a_1(r)^(n-1) as f(n) = a(b)^n with a = a_1 / r and b = r, domain the positive integers {1, 2, 3, ...};
 * graph a geometric sequence as separate points on an exponential curve; tell arithmetic, geometric and neither apart;
 * compare arithmetic (linear) and geometric (exponential) sequences, including where a geometric sequence with r > 1
 * passes an arithmetic one (S6.08).
 *
 * Math verified by hand (2026-10-07): every f(n) = (a_1 / r)(r)^n was checked to reproduce the listed terms at n = 1 and
 * at least one later n (1.5(2)^n, 2.5(2)^n, 243(1/3)^n, 192(1/4)^n, 2(3)^n, 3(2)^n, 0.5(2)^n, 0.25(2)^n, (4/3)(3)^n, (5/3)(3)^n, (2/3)(3)^n,
 * 16(1/2)^n); every graph point was recomputed from its formula; the arithmetic-versus-geometric tables were recomputed
 * term by term (50n + 50 vs 2^(n-1): 550 > 512 at n = 10, 600 < 1024 at n = 11; 20n vs 0.5(2)^(n-1): 180 > 128 at
 * n = 9, 200 < 256 at n = 10); and the "neither" sequence 1, 2, 4, 7, 11 was checked to have ratios 2, 2, 1.75, 1.57...
 * and differences 1, 2, 3, 4.
 */
export const U6L08: LessonContent = {
  lessonId: 'U6L08',
  goal: 'Write a geometric sequence as an exponential function $f(n) = a(b)^n$ whose domain is the positive integers, graph it as separate points, and compare arithmetic and geometric sequences.',
  needToKnow: [
    { t: 'p', text: 'This lesson connects ideas you already know:' },
    {
      t: 'list',
      items: [
        '**Geometric sequences.** In $3, 6, 12, 24, \\ldots$ the first term is $a_1 = 3$ and the common ratio is $r = 2$. The explicit formula is $a_n = a_1(r)^{n-1}$.',
        '**Arithmetic sequences are linear functions.** $5, 8, 11, \\ldots$ is $f(n) = 3n + 2$: the common difference is the slope, and $a_1 - d = 2$ is the value at $n = 0$.',
        '**Exponential functions.** In $f(x) = a(b)^x$, $a$ is the value at $x = 0$ and $b$ is the factor the output is multiplied by each time $x$ goes up by $1$.',
      ],
    },
    { t: 'callout', variant: 'tip', title: 'Quick check', text: 'Simplify $\\frac{2^5}{2}$ and $12 \\div \\frac{1}{3}$. (You should get $2^4 = 16$ and $36$.) If that felt shaky, open **Teach Me Again** and choose the refresher.' },
  ],
  vocabulary: [
    { term: 'term number', meaning: 'The position $n$ of a term: 1st, 2nd, 3rd, and so on. It is the input of the sequence.' },
    { term: 'common ratio', meaning: 'The number $r$ each term is multiplied by to get the next. It plays the role of the base $b$.' },
    { term: 'positive integers', meaning: 'The counting numbers $1, 2, 3, 4, \\ldots$ This is the domain of a sequence.' },
    { term: 'discrete', meaning: 'Made of separate points with gaps between them, not a connected curve.' },
  ],
  instruction: [
    { t: 'p', text: '### A geometric sequence is a function' },
    { t: 'p', text: 'A sequence matches each **term number** $n$ (the input) with one **term** (the output), so it is a function. In $3, 6, 12, 24, \\ldots$, every time $n$ goes up by $1$, the output is **multiplied** by $2$. A constant ratio is exactly what an exponential function has.' },
    {
      t: 'table',
      caption: 'The sequence 3, 6, 12, 24, 48, ... as an input-output table.',
      headers: ['Term number $n$', 'Term $f(n)$', 'Ratio to the term before'],
      rows: [
        ['$1$', '$3$', ''],
        ['$2$', '$6$', '$\\frac{6}{3} = 2$'],
        ['$3$', '$12$', '$\\frac{12}{6} = 2$'],
        ['$4$', '$24$', '$\\frac{24}{12} = 2$'],
        ['$5$', '$48$', '$\\frac{48}{24} = 2$'],
      ],
    },
    { t: 'p', text: '### From $a_n = a_1(r)^{n-1}$ to $f(n) = a(b)^n$' },
    { t: 'p', text: 'The exponent $n - 1$ is one less than $n$, so $r^{n-1}$ has one fewer factor of $r$ than $r^n$. That means $r^{n-1} = \\frac{r^n}{r}$. Use it to rewrite the explicit formula:' },
    { t: 'math', tex: 'a_n = 3(2)^{n-1} = 3 \\cdot \\frac{2^n}{2} = \\frac{3}{2}(2)^n = 1.5(2)^n' },
    { t: 'p', text: 'So $f(n) = 1.5(2)^n$. Check it: $f(1) = 1.5(2) = 3$ and $f(4) = 1.5(16) = 24$. Both match the table.' },
    { t: 'p', text: 'The same thing happens for every geometric sequence:' },
    { t: 'math', tex: 'a_n = a_1(r)^{n-1} = \\frac{a_1}{r}(r)^n \\qquad \\text{so} \\qquad f(n) = a(b)^n \\text{ with } a = \\frac{a_1}{r},\\ b = r' },
    { t: 'callout', variant: 'why', title: 'Why divide the first term by r?', text: 'In $f(n) = a(b)^n$, $a$ is the output when $n = 0$. To get from term 1 back to "term 0" you go back one step, and going back undoes one multiplication, so you **divide** by $r$ once: $\\frac{3}{2} = 1.5$. This is just like arithmetic sequences, where you **subtract** $d$ once to get $a_1 - d$.' },
    {
      t: 'table',
      caption: 'Sequence words and exponential-function words for the same idea.',
      headers: ['Geometric sequence', 'Exponential function'],
      rows: [
        ['term number $n$', 'input $x$'],
        ['term $a_n$', 'output $f(n)$'],
        ['common ratio $r$', 'base (growth or decay factor) $b$'],
        ['$\\frac{a_1}{r}$ (the "zero-th" term)', 'initial value $a$ ($y$-intercept)'],
      ],
    },
    { t: 'p', text: '### Domain and the graph: points on a curve' },
    { t: 'p', text: 'There is a 1st term and a 2nd term, but no "2.5th term" and no "0th term." So the **domain** of a sequence is the positive integers $\\{1, 2, 3, \\ldots\\}$. Its graph is a set of separate (**discrete**) points that all lie on an exponential curve.' },
    {
      t: 'graph',
      caption: 'The sequence f(n) = 1.5(2)^n for n = 1 to 5. The dashed curve y = 1.5(2)^x is shown only for comparison.',
      spec: {
        xMin: 0,
        xMax: 6,
        yMin: 0,
        yMax: 50,
        yStep: 5,
        xLabel: 'n',
        yLabel: 'f(n)',
        functions: [{ expr: '1.5*2^x', label: 'y = 1.5(2)^x', dashed: true, domain: [0, 5.1] }],
        scatter: [
          { x: 1, y: 3 },
          { x: 2, y: 6 },
          { x: 3, y: 12 },
          { x: 4, y: 24 },
          { x: 5, y: 48 },
        ],
        points: [{ x: 0, y: 1.5, open: true, label: '(0, 1.5) not a term' }],
        ariaLabel: 'Five separate points at (1, 3), (2, 6), (3, 12), (4, 24) and (5, 48) lying on a dashed comparison curve y = 1.5(2)^x that gets steeper to the right. An open circle at (0, 1.5) marks the y-intercept of the curve, which is not a term.',
      },
    },
    { t: 'callout', variant: 'warning', title: 'Do not connect the dots', text: 'The function $y = 1.5(2)^x$ has domain all real numbers, so its graph is a smooth curve. The sequence $f(n) = 1.5(2)^n$ has domain $\\{1, 2, 3, \\ldots\\}$, so its graph is only the dots.' },
    { t: 'callout', variant: 'tip', title: 'What about a negative ratio?', text: 'A sequence like $2, -6, 18, -54, \\ldots$ ($r = -3$) is still geometric, but it is **not** an exponential function, because the base of an exponential function must be positive. Its points zigzag above and below the axis instead of lying on one curve. In this lesson, the sequences you write as $f(n) = a(b)^n$ have $r > 0$.' },
    { t: 'p', text: '### Arithmetic or geometric?' },
    {
      t: 'table',
      caption: 'Comparing the two kinds of sequences.',
      headers: ['', 'Arithmetic', 'Geometric'],
      rows: [
        ['Next term', 'add $d$', 'multiply by $r$'],
        ['Test', 'differences are constant', 'ratios are constant'],
        ['Explicit formula', '$a_n = a_1 + (n - 1)d$', '$a_n = a_1(r)^{n-1}$'],
        ['As a function', 'linear: $f(n) = dn + (a_1 - d)$', 'exponential: $f(n) = \\frac{a_1}{r}(r)^n$'],
        ['Graph', 'points on a line', 'points on an exponential curve'],
        ['Domain', 'positive integers', 'positive integers'],
      ],
    },
    { t: 'p', text: 'Some sequences are **neither**. In $1, 4, 9, 16, \\ldots$ the differences are $3, 5, 7$ and the ratios are $4, 2.25, 1.\\overline{7}$, so nothing is constant.' },
    { t: 'p', text: '### Geometric growth always wins in the end' },
    { t: 'p', text: 'Compare the arithmetic sequence $100, 150, 200, \\ldots$ ($f(n) = 50n + 50$) with the geometric sequence $1, 2, 4, \\ldots$ ($g(n) = 0.5(2)^n$). The arithmetic one starts way ahead.' },
    {
      t: 'table',
      caption: 'Adding 50 each time versus doubling each time.',
      headers: ['$n$', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11'],
      rows: [
        ['arithmetic $50n + 50$', '100', '150', '200', '250', '300', '350', '400', '450', '500', '550', '600'],
        ['geometric $0.5(2)^n$', '1', '2', '4', '8', '16', '32', '64', '128', '256', '512', '1024'],
      ],
    },
    {
      t: 'graph',
      caption: 'Both sequences as points. The dashed line and dashed curve are shown only for comparison.',
      spec: {
        xMin: 0,
        xMax: 12,
        yMin: 0,
        yMax: 1100,
        yStep: 100,
        xLabel: 'n',
        yLabel: 'term value',
        functions: [
          { expr: '50x + 50', label: 'arithmetic', dashed: true, domain: [1, 11] },
          { expr: '0.5*2^x', label: 'geometric', dashed: true, domain: [1, 11] },
        ],
        scatter: [
          { x: 1, y: 100 }, { x: 2, y: 150 }, { x: 3, y: 200 }, { x: 4, y: 250 }, { x: 5, y: 300 }, { x: 6, y: 350 },
          { x: 7, y: 400 }, { x: 8, y: 450 }, { x: 9, y: 500 }, { x: 10, y: 550 }, { x: 11, y: 600 },
          { x: 1, y: 1 }, { x: 2, y: 2 }, { x: 3, y: 4 }, { x: 4, y: 8 }, { x: 5, y: 16 }, { x: 6, y: 32 },
          { x: 7, y: 64 }, { x: 8, y: 128 }, { x: 9, y: 256 }, { x: 10, y: 512 }, { x: 11, y: 1024 },
        ],
        points: [
          { x: 10, y: 512, label: '(10, 512)' },
          { x: 11, y: 1024, label: '(11, 1024)' },
        ],
        ariaLabel: 'Two sets of points for n = 1 to 11. The arithmetic points rise in a straight line from (1, 100) to (11, 600). The geometric points stay near the axis at first, (1, 1) up to (8, 128), then shoot up to (10, 512) and (11, 1024), passing above the line between n = 10 and n = 11.',
      },
    },
    { t: 'p', text: 'At $n = 10$ the arithmetic term is still bigger ($550 > 512$), but at $n = 11$ the geometric term passes it ($1024 > 600$) and never falls behind again. Adding $50$ grows the same amount every step, while doubling grows by more and more. **A geometric sequence with $r > 1$ (and a positive first term) eventually passes any arithmetic sequence**, no matter how far behind it starts.' },
  ],
  examples: [
    {
      title: 'Write a geometric sequence as an exponential function',
      kind: 'introductory',
      problem: [{ t: 'p', text: 'Write the sequence $5, 10, 20, 40, \\ldots$ as an exponential function $f(n) = a(b)^n$ and give its domain.' }],
      steps: [
        { text: 'Find the common ratio.', tex: 'r = \\frac{10}{5} = 2', why: 'Check: $\\frac{20}{10} = 2$ and $\\frac{40}{20} = 2$, so the ratio really is constant. The base is $b = r = 2$.' },
        { text: 'Find $a$ by stepping back one term.', tex: 'a = \\frac{a_1}{r} = \\frac{5}{2} = 2.5', why: 'Going back from term 1 to "term 0" undoes one multiplication by $2$.' },
        { text: 'Write the function.', tex: 'f(n) = 2.5(2)^n' },
        { text: 'Check two terms.', tex: 'f(1) = 2.5(2) = 5, \\quad f(4) = 2.5(16) = 40', why: 'Both match the sequence. Always check $f(1)$: it must be the first term.' },
      ],
      answer: '$f(n) = 2.5(2)^n$ with domain $\\{1, 2, 3, \\ldots\\}$',
    },
    {
      title: 'A decreasing geometric sequence',
      kind: 'intermediate',
      problem: [{ t: 'p', text: 'Write $48, 12, 3, 0.75, \\ldots$ as an exponential function $f(n)$.' }],
      steps: [
        { text: 'Find the common ratio.', tex: 'r = \\frac{12}{48} = \\frac{1}{4}', why: 'Check: $\\frac{3}{12} = \\frac{1}{4}$ and $\\frac{0.75}{3} = 0.25 = \\frac{1}{4}$. A ratio between $0$ and $1$ means exponential **decay**.' },
        { text: 'Find $a$.', tex: 'a = \\frac{48}{\\frac{1}{4}} = 48 \\cdot 4 = 192', why: 'Dividing by $\\frac{1}{4}$ is the same as multiplying by $4$. Stepping back from a shrinking sequence makes the number **bigger**.' },
        { text: 'Write the function.', tex: 'f(n) = 192\\left(\\tfrac{1}{4}\\right)^n' },
        { text: 'Check two terms.', tex: 'f(1) = \\frac{192}{4} = 48, \\quad f(3) = \\frac{192}{64} = 3', why: '$\\left(\\frac{1}{4}\\right)^3 = \\frac{1}{64}$. Both values match the sequence.' },
      ],
      answer: '$f(n) = 192\\left(\\frac{1}{4}\\right)^n$, or $192(0.25)^n$, with domain $\\{1, 2, 3, \\ldots\\}$',
    },
    {
      title: 'Arithmetic, geometric or neither?',
      kind: 'intermediate',
      problem: [{ t: 'p', text: 'Decide whether each sequence is arithmetic, geometric or neither. (a) $7, 4, 1, -2, \\ldots$ (b) $3, -6, 12, -24, \\ldots$ (c) $1, 2, 4, 7, 11, \\ldots$' }],
      steps: [
        { text: '(a) Find the differences.', tex: '4 - 7 = -3,\\quad 1 - 4 = -3,\\quad -2 - 1 = -3', why: 'The differences are constant, so (a) is **arithmetic** with $d = -3$.' },
        { text: '(b) Find the ratios.', tex: '\\frac{-6}{3} = -2,\\quad \\frac{12}{-6} = -2,\\quad \\frac{-24}{12} = -2', why: 'The ratios are constant, so (b) is **geometric** with $r = -2$. Alternating signs are a clue to a negative ratio.' },
        { text: '(c) Try both tests.', tex: '\\text{differences: } 1, 2, 3, 4 \\qquad \\text{ratios: } 2, 2, 1.75, \\ldots', why: 'The first two ratios are both $2$, which looks geometric, but $\\frac{7}{4} = 1.75$ breaks the pattern. Neither test works, so (c) is **neither**. Always check every pair.' },
      ],
      answer: '(a) arithmetic; (b) geometric; (c) neither.',
    },
    {
      title: 'A common mistake: using the first term as a',
      kind: 'common-mistake',
      problem: [{ t: 'p', text: 'A student writes the sequence $6, 18, 54, \\ldots$ as $f(n) = 6(3)^n$. What went wrong, and what is the correct function?' }],
      steps: [
        { text: 'Test the student\'s rule at $n = 1$.', tex: 'f(1) = 6(3)^1 = 18', why: 'The first term should be $6$, not $18$. The rule is one step ahead.' },
        { text: 'Spot the error.', why: 'The student used $a_1 = 6$ as $a$. But $a$ is the value at $n = 0$, one step **before** the first term. ($6$ would be correct in $6(3)^{n-1}$, which uses the exponent $n - 1$.)' },
        { text: 'Find the correct $a$.', tex: 'a = \\frac{a_1}{r} = \\frac{6}{3} = 2', why: 'Step back one term by dividing by $r$.' },
        { text: 'Write and check the correct rule.', tex: 'f(n) = 2(3)^n: \\quad f(1) = 6, \\quad f(3) = 2 \\cdot 27 = 54', why: 'Both values match the sequence.' },
      ],
      answer: '$f(n) = 2(3)^n$ (the same as $a_n = 6(3)^{n-1}$)',
    },
    {
      title: 'Two allowance plans',
      kind: 'real-world',
      problem: [{ t: 'p', text: 'Jordan can choose a weekly allowance. **Plan A** pays \\$20 in week 1 and \\$20 more each week than the week before. **Plan B** pays \\$0.50 in week 1 and doubles each week. Write each plan as a function of the week number $n$. In which week does Plan B first pay more than Plan A?' }],
      steps: [
        { text: 'Write Plan A.', tex: 'A(n) = 20n + (20 - 20) = 20n', why: 'Plan A adds \\$20 each week, so it is arithmetic with $a_1 = 20$, $d = 20$: a **linear** function.' },
        { text: 'Write Plan B.', tex: 'B(n) = 0.5(2)^{n-1} = \\frac{0.5}{2}(2)^n = 0.25(2)^n', why: 'Plan B multiplies by $2$ each week, so it is geometric with $a_1 = 0.5$, $r = 2$: an **exponential** function. Check: $B(1) = 0.25 \\cdot 2 = 0.5$.' },
        { text: 'Compare week by week near the crossover.', tex: 'A(9) = 180,\\ B(9) = 0.25(512) = 128 \\qquad A(10) = 200,\\ B(10) = 0.25(1024) = 256', why: 'In week 9 Plan A still pays more ($180 > 128$). In week 10 Plan B pays more ($256 > 200$).' },
        { text: 'Think about the domain.', why: 'Weeks are counted $1, 2, 3, \\ldots$, so we only compare whole-number weeks. After week 10 Plan B keeps doubling and stays ahead forever.' },
      ],
      answer: '$A(n) = 20n$ (linear), $B(n) = 0.25(2)^n$ (exponential); Plan B first pays more in week 10 (\\$256 vs \\$200).',
    },
    {
      title: 'Two terms that are far apart',
      kind: 'challenging',
      problem: [{ t: 'p', text: 'In a geometric sequence with a positive common ratio, $a_2 = 12$ and $a_5 = 96$. Write the sequence as an exponential function $f(n)$ and find $a_1$.' }],
      steps: [
        { text: 'Divide the later term by the earlier one.', tex: '\\frac{96}{12} = 8', why: 'Going from term 2 to term 5 multiplies by $r$ once for each step.' },
        { text: 'Count the steps and solve for $r$.', tex: 'r^{5 - 2} = r^3 = 8 \\;\\Rightarrow\\; r = 2', why: 'There are $3$ steps, so $r$ was multiplied in three times. $2 \\cdot 2 \\cdot 2 = 8$.' },
        { text: 'Find $a_1$ and then $a$.', tex: 'a_1 = \\frac{12}{2} = 6, \\qquad a = \\frac{a_1}{r} = \\frac{6}{2} = 3', why: 'Step back one term from $a_2$ to get $a_1$, then one more to get the value at $n = 0$.' },
        { text: 'Write and check.', tex: 'f(n) = 3(2)^n: \\quad f(2) = 3 \\cdot 4 = 12, \\quad f(5) = 3 \\cdot 32 = 96', why: 'The function passes through both given terms, $(2, 12)$ and $(5, 96)$.' },
      ],
      answer: '$f(n) = 3(2)^n$ and $a_1 = 6$',
    },
  ],
  teachMeAgain: [
    {
      approach: 'visual',
      title: 'Points on a curve, with one step back',
      blocks: [
        { t: 'p', text: 'Here is $8, 4, 2, 1$ (ratio $\\frac{1}{2}$) graphed as points. The dashed curve goes through all of them.' },
        {
          t: 'graph',
          spec: {
            xMin: 0,
            xMax: 5,
            yMin: 0,
            yMax: 18,
            yStep: 2,
            xLabel: 'n',
            yLabel: 'f(n)',
            functions: [{ expr: '16*(0.5)^x', label: 'y = 16(0.5)^x', dashed: true, domain: [0, 4.5] }],
            scatter: [
              { x: 1, y: 8 },
              { x: 2, y: 4 },
              { x: 3, y: 2 },
              { x: 4, y: 1 },
            ],
            points: [{ x: 0, y: 16, open: true, label: '(0, 16) not a term' }],
            ariaLabel: 'Four separate points at (1, 8), (2, 4), (3, 2) and (4, 1) on a dashed decreasing curve. An open circle at (0, 16) marks where the curve crosses the vertical axis; it is not a term.',
          },
        },
        { t: 'p', text: 'Follow the curve **backward** one step from $(1, 8)$. Going forward halves the value, so going back doubles it: $8 \\div \\frac{1}{2} = 16$. That open circle at $(0, 16)$ is $a$, so $f(n) = 16\\left(\\frac{1}{2}\\right)^n$. Check: $f(4) = \\frac{16}{16} = 1$.' },
      ],
    },
    {
      approach: 'step-by-step',
      title: 'A 3-step recipe',
      blocks: [
        {
          t: 'list',
          ordered: true,
          items: [
            '**Find $r$:** divide the second term by the first. For $4, 12, 36, \\ldots$: $r = \\frac{12}{4} = 3$.',
            '**Step back once:** $a = \\frac{a_1}{r} = \\frac{4}{3}$.',
            '**Write and check:** $f(n) = \\frac{4}{3}(3)^n$. Check $f(1) = \\frac{4}{3} \\cdot 3 = 4$ and $f(3) = \\frac{4}{3} \\cdot 27 = 36$.',
          ],
        },
        { t: 'callout', variant: 'tip', text: 'Always check $f(1)$. It must equal the first term. If you get the second term instead, you probably used $a_1$ instead of $\\frac{a_1}{r}$.' },
      ],
    },
    {
      approach: 'analogy',
      title: 'Rewinding a video one frame',
      blocks: [
        { t: 'p', text: 'Think of a sequence as a video of a growing number, and each frame is one term. Playing forward one frame multiplies by $r$.' },
        { t: 'list', items: ['Play forward: multiply by $r$. For $5, 15, 45$, each frame is $3$ times the last.', 'Rewind one frame from the first term: **divide** by $r$. $5 \\div 3 = \\frac{5}{3}$.', 'That rewound frame is "frame 0," the starting value $a$ of the exponential function: $f(n) = \\frac{5}{3}(3)^n$.'] },
        { t: 'p', text: 'Frame 0 is not actually in the video. The sequence only shows frames $1, 2, 3, \\ldots$, which is why its domain is the positive integers.' },
      ],
    },
    {
      approach: 'prerequisite',
      title: 'Refresher: the exponent and fraction facts you need',
      blocks: [
        {
          t: 'list',
          items: [
            'One fewer factor: $2^{n-1} = \\frac{2^n}{2}$. For example, $2^4 = 16$ and $\\frac{2^5}{2} = \\frac{32}{2} = 16$.',
            'So $a_1(r)^{n-1} = a_1 \\cdot \\frac{r^n}{r} = \\frac{a_1}{r}(r)^n$.',
            'Dividing by a fraction means multiplying by its reciprocal: $12 \\div \\frac{1}{3} = 12 \\cdot 3 = 36$.',
            'Constant **differences** mean arithmetic (linear). Constant **ratios** mean geometric (exponential).',
          ],
        },
        { t: 'p', text: 'Try it: $81, 27, 9, 3$ has $r = \\frac{1}{3}$, so $a = 81 \\div \\frac{1}{3} = 243$ and $f(n) = 243\\left(\\frac{1}{3}\\right)^n$. Check: $f(4) = \\frac{243}{81} = 3$.' },
      ],
    },
    {
      approach: 'simpler-example',
      title: 'Start with the powers of 2',
      blocks: [
        { t: 'p', text: 'The sequence $2, 4, 8, 16, \\ldots$ is just $f(n) = 2^n$: $2^1 = 2$, $2^2 = 4$, $2^3 = 8$. Here $a = \\frac{2}{2} = 1$, so there is no number out front.' },
        { t: 'p', text: 'Now cut every term in half: $1, 2, 4, 8, \\ldots$. The ratio is still $2$, and $a = \\frac{1}{2}$, so $f(n) = \\frac{1}{2}(2)^n$. Check: $f(4) = \\frac{1}{2} \\cdot 16 = 8$.' },
        { t: 'p', text: 'Compare with the arithmetic sequence $10, 20, 30, \\ldots$ ($f(n) = 10n$). At $n = 6$: $10(6) = 60$ but $\\frac{1}{2}(2)^6 = 32$. At $n = 7$: $70$ but $64$. At $n = 8$: $80$ but $128$. The doubling sequence passes the adding one at $n = 8$.' },
      ],
    },
    {
      approach: 'alternate-strategy',
      title: 'Use a table of differences and ratios',
      blocks: [
        { t: 'p', text: 'When you are not sure what kind of sequence you have, make one row of differences and one row of ratios.' },
        {
          t: 'table',
          caption: 'The sequence 2, 6, 18, 54.',
          headers: ['Terms', '$2$', '$6$', '$18$', '$54$'],
          rows: [
            ['Differences', '', '$4$', '$12$', '$36$'],
            ['Ratios', '', '$3$', '$3$', '$3$'],
          ],
        },
        { t: 'p', text: 'The ratios are constant, so it is geometric with $r = 3$, an exponential function: $f(n) = \\frac{2}{3}(3)^n$. If the differences had been constant instead, it would be arithmetic and linear. If neither row is constant, it is neither.' },
      ],
    },
  ],
  guided: [
    { generator: 'u6.geo-function', difficulty: 1 },
    { generator: 'u6.geo-function', difficulty: 1 },
    { generator: 'u6.geo-function', difficulty: 2 },
    { generator: 'u6.geo-function', difficulty: 2 },
  ],
  independent: {
    count: 8,
    reviewCount: 2,
    mix: [
      { generator: 'u6.geo-function', difficulty: 1, weight: 1 },
      { generator: 'u6.geo-function', difficulty: 2, weight: 2 },
      { generator: 'u6.geo-function', difficulty: 3, weight: 2 },
    ],
  },
  quiz: {
    items: [
      { generator: 'u6.geo-function', difficulty: 1 },
      { generator: 'u6.geo-function', difficulty: 2 },
      { generator: 'u6.geo-function', difficulty: 2 },
      { generator: 'u6.geo-function', difficulty: 2 },
      { generator: 'u6.geo-function', difficulty: 3 },
      { generator: 'u6.geo-function', difficulty: 3 },
    ],
  },
  summary: [
    'A geometric sequence with $r > 0$ is an **exponential function** whose domain is the positive integers $\\{1, 2, 3, \\ldots\\}$.',
    'As a function, $f(n) = a(b)^n$ with $b = r$ and $a = \\frac{a_1}{r}$: divide the first term by $r$ to step back to the value at $n = 0$. Always check that $f(1) = a_1$.',
    'The graph of a sequence is **separate points**: on a line for arithmetic, on an exponential curve for geometric.',
    'Arithmetic = add $d$ = constant differences = linear. Geometric = multiply by $r$ = constant ratios = exponential. If neither is constant, the sequence is neither.',
    'A geometric sequence with $r > 1$ (and a positive first term) eventually passes any arithmetic sequence, because its jumps keep getting bigger.',
  ],
  mastery: { quizPassScore: 0.8, practiceMinCorrect: 5 },
};
