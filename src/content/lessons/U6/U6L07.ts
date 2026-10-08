import type { LessonContent } from '../../../core/curriculum/types';

/**
 * U6L07 Geometric Sequences (A.FGR.9.4)
 * Common ratio r = a_n / a_(n-1) (including negative and fractional ratios), the explicit formula a_n = a_1(r)^(n-1)
 * and why the exponent is n - 1, the recursive formula a_1 = value, a_n = r·a_(n-1), converting recursive to explicit,
 * and finding which term has a given value (S6.07).
 *
 * Math verified by hand (2026-10-07): every listed term was recomputed by repeated multiplication AND by the explicit
 * formula (3(2)^(n-1), 5(3)^(n-1), 4(-3)^(n-1), 96(1/2)^(n-1), 2(3)^(n-1), 5(2)^(n-1), 81(-1/3)^(n-1),
 * 64(3/4)^(n-1) and the others), every ratio of consecutive terms was recomputed by division, every graph point was
 * checked against its formula, the "which term" answers were re-solved and substituted back, and the bouncing-ball
 * heights 64, 48, 36, 27, 20.25, 15.1875, 11.390625, 8.54296875 were recomputed to confirm bounce 8 is the first
 * under 10 inches.
 */
export const U6L07: LessonContent = {
  lessonId: 'U6L07',
  goal: 'Find the common ratio of a geometric sequence, write explicit and recursive formulas, find any term, and find which term has a given value.',
  needToKnow: [
    { t: 'p', text: 'This lesson builds on two things you already know:' },
    {
      t: 'list',
      items: [
        '**Arithmetic sequences.** In $5, 8, 11, 14, \\ldots$ you **add** $d = 3$ each time. The explicit formula is $a_n = a_1 + (n - 1)d$ and the recursive formula is $a_1 = 5$, $a_n = a_{n-1} + 3$.',
        '**Exponential functions.** In $y = a(b)^x$, the output is **multiplied** by $b$ every time $x$ goes up by $1$.',
      ],
    },
    { t: 'p', text: 'A geometric sequence is what you get when you mix the two ideas: a list of terms like a sequence, but built by multiplying like an exponential function.' },
    { t: 'callout', variant: 'tip', title: 'Quick check', text: 'Evaluate $3(2)^4$ and $(-3)^3$. (You should get $48$ and $-27$.) If that felt shaky, open **Teach Me Again** and choose the refresher.' },
  ],
  vocabulary: [
    { term: 'sequence', meaning: 'An ordered list of numbers. Each number is a **term**, and $a_n$ is the value of the $n$th term.' },
    { term: 'geometric sequence', meaning: 'A sequence where you **multiply** by the same nonzero number each time to get the next term.' },
    { term: 'common ratio $r$', meaning: 'The number you multiply by each time: $r = \\frac{a_n}{a_{n-1}}$, a term divided by the term before it.' },
    { term: 'explicit formula', meaning: 'A rule that finds any term directly from $n$: $a_n = a_1(r)^{n-1}$.' },
    { term: 'recursive formula', meaning: 'A rule that gives the first term and finds each term from the term before it: $a_1 = \\text{first term}$, $a_n = r \\cdot a_{n-1}$.' },
  ],
  instruction: [
    { t: 'p', text: '### What makes a sequence geometric' },
    { t: 'p', text: 'Look at $3, 6, 12, 24, 48, \\ldots$ Each term is **twice** the one before. A sequence that multiplies by the **same number** every time is **geometric**, and that number is the **common ratio** $r$. Here $r = 2$.' },
    { t: 'p', text: 'To find $r$, **divide** any term by the term **before** it: $\\frac{6}{3} = 2$, $\\frac{12}{6} = 2$, $\\frac{24}{12} = 2$, $\\frac{48}{24} = 2$. If the ratios are not all equal, the sequence is not geometric.' },
    {
      t: 'table',
      caption: 'Arithmetic adds the same number; geometric multiplies by the same number. Both start at 3, 6.',
      headers: ['Term number $n$', '1', '2', '3', '4', '5'],
      rows: [
        ['arithmetic: add $3$', '3', '6', '9', '12', '15'],
        ['geometric: multiply by $2$', '3', '6', '12', '24', '48'],
      ],
    },
    { t: 'callout', variant: 'warning', title: 'Two terms are not enough', text: '$3, 6, \\ldots$ could be arithmetic ($d = 3$) or geometric ($r = 2$). You need at least three terms, and you should check **every** ratio, not just the first one.' },
    {
      t: 'graph',
      caption: 'Graphing (n, a_n) for 3, 6, 12, 24, 48 gives separate points. Each one is twice as high as the one before, so the jumps keep getting bigger.',
      spec: { xMin: 0, xMax: 6, yMin: 0, yMax: 50, yStep: 5, xLabel: 'n', yLabel: 'a_n', scatter: [{ x: 1, y: 3 }, { x: 2, y: 6 }, { x: 3, y: 12 }, { x: 4, y: 24 }, { x: 5, y: 48 }], ariaLabel: 'Five separate points at (1, 3), (2, 6), (3, 12), (4, 24) and (5, 48). The gaps between them grow: 3, then 6, then 12, then 24.' },
    },
    { t: 'p', text: '### Negative and fractional ratios' },
    { t: 'p', text: 'The common ratio does not have to be a positive whole number.' },
    {
      t: 'list',
      items: [
        '**Negative ratio.** $2, -6, 18, -54, \\ldots$ has $r = \\frac{-6}{2} = -3$. Multiplying by a negative number flips the sign every time, so the terms **alternate** between positive and negative.',
        '**Fractional ratio.** $80, 40, 20, 10, 5, \\ldots$ has $r = \\frac{40}{80} = \\frac{1}{2}$. Multiplying by a number between $0$ and $1$ makes the terms get **smaller**. (It is not $r = -40$: that would be a common difference.)',
      ],
    },
    { t: 'p', text: '### The explicit formula, and why the exponent is $n - 1$' },
    { t: 'p', text: 'Write out how each term of $3, 6, 12, 24, \\ldots$ is built from the first term:' },
    {
      t: 'table',
      caption: 'Count the factors of 2: there is always one fewer than the term number.',
      headers: ['$n$', 'Term built from $a_1 = 3$', 'Factors of $2$'],
      rows: [
        ['$1$', '$3$', '$0$'],
        ['$2$', '$3 \\cdot 2$', '$1$'],
        ['$3$', '$3 \\cdot 2 \\cdot 2$', '$2$'],
        ['$4$', '$3 \\cdot 2 \\cdot 2 \\cdot 2$', '$3$'],
        ['$n$', '$3 \\cdot 2^{n-1}$', '$n - 1$'],
      ],
    },
    { t: 'p', text: 'The first term is not multiplied by $r$ at all. From term 1 to term $n$ there are $n - 1$ **jumps**, and each jump multiplies by $r$ once. So:' },
    { t: 'math', tex: 'a_n = a_1(r)^{n-1}' },
    { t: 'p', text: 'For $3, 6, 12, \\ldots$: $a_n = 3(2)^{n-1}$. The 10th term is:' },
    { t: 'math', tex: 'a_{10} = 3(2)^{10 - 1} = 3(2)^9 = 3 \\cdot 512 = 1536' },
    { t: 'callout', variant: 'warning', title: 'Exponent first, then multiply', text: 'In $3(2)^9$, only the $2$ is raised to the 9th power. Do $2^9 = 512$ first, then $3 \\cdot 512 = 1536$. Writing $6^9$ is wrong. With a negative ratio, keep it in parentheses: $(-3)^{n-1}$, because $(-3)^2 = 9$ but $-3^2 = -9$.' },
    { t: 'p', text: '### The recursive formula' },
    { t: 'p', text: 'A recursive formula gives a starting term and a rule for getting from one term to the next:' },
    { t: 'math', tex: 'a_1 = 3, \\qquad a_n = 2 \\cdot a_{n-1}' },
    { t: 'p', text: 'Read $a_{n-1}$ as "the term before." So: start at $3$, then keep multiplying by $2$. Recursive formulas are handy for listing the next few terms. Explicit formulas are better for jumping straight to the 30th term.' },
    { t: 'callout', variant: 'why', title: 'Converting recursive to explicit', text: 'The recursive form already shows you $a_1$ (the starting term) and $r$ (the number you multiply by). Put them into $a_n = a_1(r)^{n-1}$. For $a_1 = 3$, $a_n = 2 \\cdot a_{n-1}$, you get $a_n = 3(2)^{n-1}$.' },
    { t: 'callout', variant: 'realworld', title: 'Where this shows up', text: 'The heights of a bouncing ball, a rumor or a viral post passing from person to person, a tournament where half the teams are knocked out each round, and the number of cells after each division all follow geometric sequences.' },

    { t: 'callout', variant: 'warning', title: 'Dropped from a height is not a bounce', text: 'If a ball is dropped from $81$ feet and each bounce reaches $\\frac{2}{3}$ of the height it fell from, the first bounce is already $\\frac{2}{3}(81) = 54$ feet. So $a_1 = 54$ and $a_n = 54\\left(\\frac{2}{3}\\right)^{n-1}$, not $81\\left(\\frac{2}{3}\\right)^{n-1}$.' },
    { t: 'p', text: '### From an explicit formula back to a recursive one' },
    { t: 'p', text: 'In $a_n = 5(3)^{n-1}$, put $n = 1$: the exponent is $0$, so $a_1 = 5$. The base $3$ is the ratio, so each term is $3$ times the one before: $a_1 = 5$ and $a_n = 3a_{n-1}$. Check: $5, 15, 45, \\dots$ from both formulas.' },
  ],
  examples: [
    {
      title: 'Find r and extend the sequence',
      kind: 'introductory',
      problem: [{ t: 'p', text: 'Find the common ratio of $5, 15, 45, 135, \\ldots$ and the next three terms.' }],
      steps: [
        { text: 'Divide each term by the one before it.', tex: '\\frac{15}{5} = 3,\\quad \\frac{45}{15} = 3,\\quad \\frac{135}{45} = 3', why: 'All the ratios match, so the sequence is geometric. (The differences $10, 30, 90$ do not match, so it is not arithmetic.)' },
        { text: 'So $r = 3$.', why: 'Each term is $3$ times the term before it.' },
        { text: 'Keep multiplying by $3$.', tex: '135 \\cdot 3 = 405,\\quad 405 \\cdot 3 = 1215,\\quad 1215 \\cdot 3 = 3645' },
      ],
      answer: '$r = 3$; the next three terms are $405, 1215, 3645$.',
    },
    {
      title: 'A negative common ratio',
      kind: 'intermediate',
      problem: [{ t: 'p', text: 'For $4, -12, 36, -108, \\ldots$, write an explicit formula and find $a_6$.' }],
      steps: [
        { text: 'Find $r$.', tex: 'r = \\frac{-12}{4} = -3', why: 'Check another pair: $\\frac{36}{-12} = -3$. The signs alternate, which is the sign of a negative ratio.' },
        { text: 'Substitute into the explicit formula.', tex: 'a_n = 4(-3)^{n-1}', why: 'Keep $-3$ in parentheses so the whole negative number is raised to the power.' },
        { text: 'Find the 6th term.', tex: 'a_6 = 4(-3)^{5} = 4(-243) = -972', why: 'An odd power of a negative number is negative: $(-3)^5 = -243$.' },
        { text: 'Check by listing.', tex: '4,\\ -12,\\ 36,\\ -108,\\ 324,\\ -972', why: 'Multiplying by $-3$ two more times gives $-108 \\cdot (-3) = 324$ and $324 \\cdot (-3) = -972$. The 6th term matches.' },
      ],
      answer: '$a_n = 4(-3)^{n-1}$; $a_6 = -972$',
    },
    {
      title: 'A fractional common ratio',
      kind: 'intermediate',
      problem: [{ t: 'p', text: 'For $96, 48, 24, 12, \\ldots$, write a recursive formula and an explicit formula, then find $a_8$.' }],
      steps: [
        { text: 'Find $r$.', tex: 'r = \\frac{48}{96} = \\frac{1}{2}', why: 'Divide the second term by the first. The terms are getting smaller, so $r$ is between $0$ and $1$. Check: $\\frac{24}{48} = \\frac{12}{24} = \\frac{1}{2}$.' },
        { text: 'Write the recursive formula.', tex: 'a_1 = 96, \\quad a_n = \\tfrac{1}{2} \\cdot a_{n-1}', why: 'Start at $96$; each term is half the term before.' },
        { text: 'Write the explicit formula.', tex: 'a_n = 96\\left(\\tfrac{1}{2}\\right)^{n-1}', why: 'Put $a_1 = 96$ and $r = \\frac{1}{2}$ into $a_n = a_1(r)^{n-1}$.' },
        { text: 'Find the 8th term.', tex: 'a_8 = 96\\left(\\tfrac{1}{2}\\right)^{7} = \\frac{96}{128} = \\frac{3}{4} = 0.75', why: '$\\left(\\frac{1}{2}\\right)^7 = \\frac{1}{128}$. Check by halving: $12, 6, 3, 1.5, 0.75$ are terms 4 through 8.' },
      ],
      answer: '$a_1 = 96,\\ a_n = \\frac{1}{2} \\cdot a_{n-1}$; $a_n = 96\\left(\\frac{1}{2}\\right)^{n-1}$; $a_8 = 0.75$',
    },
    {
      title: 'A common mistake: using n instead of n - 1',
      kind: 'common-mistake',
      problem: [{ t: 'p', text: 'For $2, 6, 18, 54, \\ldots$, a student finds the 6th term as $2(3)^6 = 1458$. What went wrong?' }],
      steps: [
        { text: 'Count the jumps.', why: 'The first term, $2$, has not been multiplied by $3$ at all. To get from term 1 to term 6 you multiply by $3$ only **5** times, not 6.' },
        { text: 'Use $n - 1$ as the exponent.', tex: 'a_6 = 2(3)^{6 - 1} = 2(3)^5 = 2 \\cdot 243 = 486' },
        { text: 'Check by listing.', tex: '2,\\ 6,\\ 18,\\ 54,\\ 162,\\ 486', why: 'The 6th number in the list is $486$. The student answer $1458$ is actually the 7th term.' },
        { text: 'Watch for a second trap.', tex: '2(3)^5 \\ne 6^5 = 7776', why: 'Do the exponent before multiplying by $2$. Only the ratio $3$ is raised to the power.' },
      ],
      answer: '$a_6 = 2(3)^5 = 486$',
    },
    {
      title: 'Which term has this value?',
      kind: 'challenging',
      problem: [{ t: 'p', text: 'In the sequence $5, 10, 20, 40, \\ldots$, which term is $640$?' }],
      steps: [
        { text: 'Find $r$ and write the explicit formula.', tex: 'r = \\frac{10}{5} = 2; \\quad a_n = 5(2)^{n-1}' },
        { text: 'Set the formula equal to the value.', tex: '5(2)^{n-1} = 640', why: '$640$ is a term **value**, so it goes where $a_n$ is. The unknown is the term **number** $n$.' },
        { text: 'Divide both sides by $5$.', tex: '2^{n-1} = 128', why: 'Undo the multiplication by $5$ before dealing with the exponent.' },
        { text: 'Write $128$ as a power of $2$ and match exponents.', tex: '2^{n-1} = 2^7 \\;\\Rightarrow\\; n - 1 = 7 \\;\\Rightarrow\\; n = 8', why: '$2 \\cdot 2 \\cdot 2 \\cdot 2 \\cdot 2 \\cdot 2 \\cdot 2 = 128$. When the bases are the same, the exponents must be equal.' },
        { text: 'Check.', tex: 'a_8 = 5(2)^7 = 5 \\cdot 128 = 640 \\checkmark', why: 'Listing works too: $5, 10, 20, 40, 80, 160, 320, 640$ is eight terms.' },
      ],
      answer: '$640$ is the 8th term ($n = 8$).',
    },
    {
      title: 'Recursive to explicit with a negative fraction',
      kind: 'challenging',
      problem: [{ t: 'p', text: 'A sequence is defined by $a_1 = 81$ and $a_n = -\\frac{1}{3} \\cdot a_{n-1}$. List the first five terms and write an explicit formula.' }],
      steps: [
        { text: 'Start at $81$ and multiply by $-\\frac{1}{3}$ each time.', tex: '81,\\ -27,\\ 9,\\ -3,\\ 1', why: 'Multiplying by $-\\frac{1}{3}$ divides by $3$ and flips the sign: $81 \\cdot \\left(-\\frac{1}{3}\\right) = -27$, $-27 \\cdot \\left(-\\frac{1}{3}\\right) = 9$, and so on.' },
        { text: 'Read off $a_1$ and $r$.', tex: 'a_1 = 81, \\quad r = -\\tfrac{1}{3}', why: 'In $a_n = r \\cdot a_{n-1}$, the number multiplying the term before is the common ratio.' },
        { text: 'Write the explicit formula.', tex: 'a_n = 81\\left(-\\tfrac{1}{3}\\right)^{n-1}' },
        { text: 'Check with the list.', tex: 'a_5 = 81\\left(-\\tfrac{1}{3}\\right)^{4} = 81 \\cdot \\tfrac{1}{81} = 1 \\checkmark', why: 'An even power of a negative number is positive: $\\left(-\\frac{1}{3}\\right)^4 = \\frac{1}{81}$.' },
      ],
      answer: '$81, -27, 9, -3, 1$; $a_n = 81\\left(-\\frac{1}{3}\\right)^{n-1}$',
    },
    {
      title: 'A bouncing ball',
      kind: 'real-world',
      problem: [{ t: 'p', text: 'Maya drops a ball. Its first bounce reaches $64$ inches, and every bounce after that reaches $\\frac{3}{4}$ of the height of the bounce before. Write a recursive and an explicit formula for the height of bounce $n$. How high is the 4th bounce? Which bounce is the first one lower than $10$ inches?' }],
      steps: [
        { text: 'Write the recursive formula.', tex: 'a_1 = 64, \\quad a_n = \\tfrac{3}{4} \\cdot a_{n-1}', why: 'Bounce 1 is $64$ inches, and each bounce is $\\frac{3}{4}$ of the one before, so $r = \\frac{3}{4} = 0.75$.' },
        { text: 'Write the explicit formula.', tex: 'a_n = 64\\left(\\tfrac{3}{4}\\right)^{n-1}' },
        { text: 'Find the 4th bounce.', tex: 'a_4 = 64\\left(\\tfrac{3}{4}\\right)^{3} = 64 \\cdot \\tfrac{27}{64} = 27 \\text{ in}', why: 'Check by multiplying: $64 \\to 48 \\to 36 \\to 27$.' },
        { text: 'Keep multiplying by $0.75$ until the height drops below $10$.', tex: '27 \\to 20.25 \\to 15.1875 \\to 11.390625 \\to 8.54296875', why: 'These are bounces 5, 6, 7 and 8. Bounce 7 is still about $11.4$ inches; bounce 8 is about $8.5$ inches.' },
      ],
      answer: '$a_1 = 64,\\ a_n = \\frac{3}{4} \\cdot a_{n-1}$; $a_n = 64\\left(\\frac{3}{4}\\right)^{n-1}$; the 4th bounce is $27$ inches; bounce 8 is the first under $10$ inches.',
    },
  ],
  teachMeAgain: [
    {
      approach: 'visual',
      title: 'See the multiplying on a graph',
      blocks: [
        { t: 'p', text: 'Plot each term as a point $(n, a_n)$. For $80, 40, 20, 10, 5$ (ratio $\\frac{1}{2}$):' },
        {
          t: 'graph',
          spec: { xMin: 0, xMax: 6, yMin: 0, yMax: 90, yStep: 10, xLabel: 'n', yLabel: 'a_n', scatter: [{ x: 1, y: 80 }, { x: 2, y: 40 }, { x: 3, y: 20 }, { x: 4, y: 10 }, { x: 5, y: 5 }], ariaLabel: 'Five separate points at (1, 80), (2, 40), (3, 20), (4, 10) and (5, 5). Each point is half as high as the one before, so the drops shrink: 40, then 20, then 10, then 5.' },
        },
        { t: 'p', text: 'Each step to the right cuts the height in **half**. The drops are not equal ($40, 20, 10, 5$), so this is not arithmetic, but the **ratios** are all $\\frac{1}{2}$.' },
        { t: 'p', text: 'Now $2, -6, 18, -54$ (ratio $-3$):' },
        {
          t: 'graph',
          spec: { xMin: 0, xMax: 5, yMin: -60, yMax: 30, yStep: 10, xLabel: 'n', yLabel: 'a_n', scatter: [{ x: 1, y: 2 }, { x: 2, y: -6 }, { x: 3, y: 18 }, { x: 4, y: -54 }], ariaLabel: 'Four separate points at (1, 2), (2, -6), (3, 18) and (4, -54). They alternate above and below the horizontal axis and get farther from it each time.' },
        },
        { t: 'p', text: 'A negative ratio makes the points **zigzag** across the horizontal axis, getting farther away each time because the size of $r$ is $3$.' },
      ],
    },
    {
      approach: 'analogy',
      title: 'Passing a rumor',
      blocks: [
        { t: 'p', text: 'In round 1, $4$ students hear a rumor. In each new round, every student who just heard it tells $3$ new students, so each round has $3$ times as many new listeners as the round before.' },
        { t: 'list', items: ['Round 1: $4$ (nobody has passed it on yet).', 'Round 2: $4 \\cdot 3 = 12$ (one round of passing).', 'Round 5: $4 \\cdot 3 \\cdot 3 \\cdot 3 \\cdot 3 = 4(3)^4 = 324$ (**four** rounds of passing, not five).'] },
        { t: 'p', text: 'Round $n$ comes after $n - 1$ rounds of passing it on. That is exactly why the formula is $a_n = a_1(r)^{n-1}$: here $a_n = 4(3)^{n-1}$.' },
      ],
    },
    {
      approach: 'step-by-step',
      title: 'A 4-step routine',
      blocks: [
        { t: 'p', text: 'Example: find the 7th term of $1, 4, 16, 64, \\ldots$' },
        {
          t: 'list',
          ordered: true,
          items: [
            '**Find $a_1$:** the first term is $1$.',
            '**Find $r$:** divide a term by the one before it. $\\frac{4}{1} = 4$, $\\frac{16}{4} = 4$, so $r = 4$.',
            '**Fill in the formula:** $a_n = 1(4)^{n-1}$, which is just $4^{n-1}$.',
            '**Plug in $n$:** $a_7 = 4^{6} = 4096$.',
          ],
        },
        { t: 'callout', variant: 'tip', text: 'The recursive version is $a_1 = 1$, $a_n = 4 \\cdot a_{n-1}$. Check by listing: $1, 4, 16, 64, 256, 1024, 4096$. The 7th term is $4096$.' },
      ],
    },
    {
      approach: 'simpler-example',
      title: 'Start with doubling: 2, 4, 8, 16',
      blocks: [
        { t: 'p', text: 'Look at $2, 4, 8, 16, \\ldots$ one step at a time.' },
        {
          t: 'list',
          ordered: true,
          items: [
            '**Find the ratio:** $\\frac{4}{2} = 2$, $\\frac{8}{4} = 2$, $\\frac{16}{8} = 2$. Every term is $2$ times the one before, so $r = 2$.',
            '**Find the first term:** $a_1 = 2$.',
            '**Count the doublings:** term 1 is $2$ with no doublings, term 2 is $2 \\cdot 2$ (one doubling), term 3 is $2 \\cdot 2 \\cdot 2$ (two doublings), term 4 is $2 \\cdot 2 \\cdot 2 \\cdot 2$ (three doublings). Term $n$ has $n - 1$ doublings.',
            '**Write the formulas:** explicit $a_n = 2(2)^{n-1}$; recursive $a_1 = 2$, $a_n = 2 \\cdot a_{n-1}$.',
            '**Use it:** $a_6 = 2(2)^5 = 2 \\cdot 32 = 64$. Check by listing: $2, 4, 8, 16, 32, 64$.',
          ],
        },
      ],
    },
    {
      approach: 'prerequisite',
      title: 'Refresher: powers of negatives and fractions',
      blocks: [
        {
          t: 'list',
          items: [
            'Exponent before multiplying: $3(2)^4 = 3 \\cdot 16 = 48$, not $6^4$.',
            'A negative base in parentheses: $(-3)^2 = 9$, $(-3)^3 = -27$, $(-3)^4 = 81$. Even powers are positive, odd powers are negative.',
            'Without parentheses the negative is not raised: $-3^2 = -9$.',
            'A fraction to a power: $\\left(\\frac{1}{2}\\right)^3 = \\frac{1}{2} \\cdot \\frac{1}{2} \\cdot \\frac{1}{2} = \\frac{1}{8}$.',
            'Anything (except $0$) to the zero power is $1$: $5^0 = 1$, so $a_1 = a_1(r)^0$.',
          ],
        },
        { t: 'p', text: 'Try it: $2(-5)^3$. First $(-5)^3 = -125$, then $2 \\cdot (-125) = -250$.' },
      ],
    },
    {
      approach: 'alternate-strategy',
      title: 'Divide to find the ratio between far-apart terms',
      blocks: [
        { t: 'p', text: 'Suppose you only know $a_2 = 6$ and $a_5 = 162$ in a geometric sequence. From term 2 to term 5 is $3$ jumps, so you multiplied by $r$ three times:' },
        { t: 'math', tex: 'r^3 = \\frac{162}{6} = 27 \\;\\Rightarrow\\; r = 3' },
        { t: 'p', text: 'Step back one jump from $a_2$ to get $a_1$: $a_1 = \\frac{6}{3} = 2$. So $a_n = 2(3)^{n-1}$.' },
        { t: 'p', text: 'Check: $a_2 = 2(3)^1 = 6$ and $a_5 = 2(3)^4 = 2 \\cdot 81 = 162$. Both match. The number of jumps between two terms is the difference of their term numbers, which is the same idea as the $n - 1$ in the formula.' },
      ],
    },
  ],
  guided: [
    { generator: 'u6.geometric', difficulty: 1 },
    { generator: 'u6.geometric', difficulty: 1 },
    { generator: 'u6.geometric', difficulty: 2 },
    { generator: 'u6.geometric', difficulty: 2 },
  ],
  independent: {
    count: 8,
    reviewCount: 2,
    mix: [
      { generator: 'u6.geometric', difficulty: 1, weight: 1 },
      { generator: 'u6.geometric', difficulty: 2, weight: 2 },
      { generator: 'u6.geometric', difficulty: 3, weight: 1 },
    ],
  },
  quiz: {
    items: [
      { generator: 'u6.geometric', difficulty: 1 },
      { generator: 'u6.geometric', difficulty: 2 },
      { generator: 'u6.geometric', difficulty: 2 },
      { generator: 'u6.geometric', difficulty: 2 },
      { generator: 'u6.geometric', difficulty: 3 },
      { generator: 'u6.geometric', difficulty: 3 },
    ],
  },
  summary: [
    'A **geometric sequence** multiplies by the same number $r$ each time. Find $r$ by dividing a term by the term before it: $r = \\frac{a_n}{a_{n-1}}$.',
    'The common ratio can be negative (the terms alternate signs) or a fraction between $0$ and $1$ (the terms shrink).',
    'Explicit formula: $a_n = a_1(r)^{n-1}$. The exponent is $n - 1$ because there are $n - 1$ jumps from the first term to the $n$th. Do the exponent before multiplying by $a_1$.',
    'Recursive formula: $a_1 = \\text{first term}$, $a_n = r \\cdot a_{n-1}$. To convert to explicit, put $a_1$ and $r$ into the explicit formula.',
    'To find **which term** has a value, set $a_1(r)^{n-1}$ equal to it, divide by $a_1$, write both sides as powers of $r$ and match exponents.',
  ],
  mastery: { quizPassScore: 0.8, practiceMinCorrect: 5 },
};
