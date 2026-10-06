import type { LessonContent } from '../../../core/curriculum/types';

/**
 * U4L01 Interpreting Quadratic Expressions (A.PAR.6.1, A.MM.1.5)
 * Terms, coefficients, the leading coefficient, the constant term, factors, degree and standard form,
 * and what each part means in a situation: a projectile height, a rectangle area and a revenue model (S4.01).
 *
 * Math verified by hand (2026-10-06): every coefficient, standard-form rewrite, table value, substitution check, area and revenue below was recomputed independently.
 */
export const U4L01: LessonContent = {
  lessonId: 'U4L01',
  goal: 'Name the parts of a quadratic expression (terms, coefficients, the constant term, factors and degree) and explain what each part means in a real situation, like the $5$ in $h(t) = -16t^2 + 48t + 5$.',
  needToKnow: [
    { t: 'p', text: 'This lesson builds on three things you already know:' },
    {
      t: 'list',
      items: [
        '**Exponents.** $x^2$ means $x \\cdot x$. So $3x^2$ means $3 \\cdot x \\cdot x$.',
        '**Subtracting is adding the opposite.** $7 - 5x$ is the same as $7 + (-5x)$.',
        '**Function notation.** $h(2) = 37$ means "when the input is $2$, the output is $37$." To find $h(2)$, substitute $2$ for the variable.',
      ],
    },
    { t: 'callout', variant: 'tip', title: 'Quick check', text: 'If $f(x) = x^2 + 3$, what is $f(4)$? (You should get $16 + 3 = 19$.) If that felt shaky, open **Teach Me Again** and choose the refresher.' },
  ],
  vocabulary: [
    { term: 'term', meaning: 'One piece of an expression that is added or subtracted. The terms of $3x^2 - 5x + 7$ are $3x^2$, $-5x$ and $7$.' },
    { term: 'coefficient', meaning: 'The number multiplying the variable part of a term. In $-5x$, the coefficient is $-5$.' },
    { term: 'constant term', meaning: 'A term with no variable. In $3x^2 - 5x + 7$, the constant term is $7$.' },
    { term: 'leading coefficient', meaning: 'The coefficient of the term with the highest exponent. In $3x^2 - 5x + 7$, it is $3$.' },
    { term: 'factor', meaning: 'Something that is multiplied. In $4(x - 2)(x + 1)$, the factors are $4$, $x - 2$ and $x + 1$.' },
    { term: 'degree', meaning: 'The highest exponent of the variable. A **quadratic** expression has degree $2$.' },
    { term: 'standard form', meaning: 'A quadratic written as $ax^2 + bx + c$ with $a \\ne 0$: highest exponent first.' },
    { term: 'monomial, binomial, trinomial', meaning: 'An expression with one, two or three terms: $4x^2$, $x + 5$, $x^2 + 6x + 9$.' },
  ],
  instruction: [
    { t: 'p', text: '### What makes an expression quadratic?' },
    { t: 'p', text: 'A **quadratic expression** is a polynomial whose highest exponent is $2$. Its **standard form** is' },
    { t: 'math', tex: 'ax^2 + bx + c, \\qquad a \\ne 0' },
    { t: 'p', text: 'The $x^2$ term is what makes it quadratic. If $a$ were $0$, the $x^2$ term would disappear and you would have a linear expression $bx + c$. That is why $a$ cannot be $0$. The numbers $b$ and $c$ are allowed to be $0$: $x^2 - 9$ and $2x^2 + 6x$ are quadratic too.' },
    { t: 'p', text: '### Terms: the pieces you add' },
    { t: 'p', text: 'Plus and minus signs split an expression into **terms**. The sign in front of a term belongs to that term. Rewrite each subtraction as adding the opposite, and the coefficients are easy to read:' },
    { t: 'math', tex: '3x^2 - 5x + 7 = 3x^2 + (-5x) + 7' },
    {
      t: 'table',
      caption: 'The three terms of 3x squared minus 5x plus 7.',
      headers: ['Term', 'Coefficient', 'Exponent on x', 'Name'],
      rows: [
        ['$3x^2$', '$3$', '$2$', 'quadratic term; $3$ is the leading coefficient'],
        ['$-5x$', '$-5$', '$1$', 'linear term'],
        ['$7$', 'none (it is a constant)', '$0$', 'constant term'],
      ],
    },
    { t: 'p', text: 'This expression has three terms, so it is a **trinomial**. Its **degree** is $2$, the highest exponent.' },
    { t: 'callout', variant: 'warning', title: 'The sign travels with the term', text: 'In $3x^2 - 5x + 7$ the coefficient of $x$ is $-5$, not $5$. And when no number is written, the coefficient is $1$ or $-1$: in $x^2 - x + 4$, the coefficient of $x^2$ is $1$ and the coefficient of $x$ is $-1$, because $x = 1 \\cdot x$ and $-x = -1 \\cdot x$.' },
    { t: 'p', text: '### Put it in standard form first' },
    { t: 'p', text: 'The leading coefficient is the coefficient of the **highest-degree** term, not of whatever term is written first. Reorder the terms (keeping each sign with its term) from highest exponent to lowest:' },
    { t: 'math', tex: '4 + 2x - x^2 = -x^2 + 2x + 4' },
    { t: 'p', text: 'Now you can read it: the leading coefficient is $-1$, the coefficient of $x$ is $2$, and the constant term is $4$. Reordering is allowed because addition is commutative: $4 + 2x + (-x^2)$ can be added in any order.' },
    { t: 'p', text: '### Factors: the pieces you multiply' },
    { t: 'p', text: 'Terms are **added**. Factors are **multiplied**. The expression $4(x - 2)(x + 1)$ is one product with three factors: $4$, $x - 2$ and $x + 1$. It is still quadratic: each binomial factor contains one $x$, and $x \\cdot x = x^2$.' },
    { t: 'p', text: 'Factored form tells you things standard form hides. A product is $0$ when any factor is $0$, so $4(x - 2)(x + 1) = 0$ when $x = 2$ or $x = -1$. Check: $4(2 - 2)(2 + 1) = 4 \\cdot 0 \\cdot 3 = 0$.' },
    { t: 'callout', variant: 'tip', title: 'Factors inside a term', text: 'Even a single term has factors. The term $3x^2$ is $3 \\cdot x \\cdot x$, so $3$ and $x$ are factors of it. Ask yourself: is this piece being **added** (a term) or **multiplied** (a factor)?' },
    { t: 'p', text: '### Interpreting the parts in a situation' },
    { t: 'p', text: 'A volleyball is bumped straight up from a height of $5$ feet at $48$ feet per second. Its height in feet after $t$ seconds is' },
    { t: 'math', tex: 'h(t) = -16t^2 + 48t + 5' },
    {
      t: 'list',
      items: [
        '**The constant term $5$** is the height when $t = 0$: $h(0) = -16(0)^2 + 48(0) + 5 = 5$. The ball starts $5$ feet up.',
        '**The coefficient $48$** is the starting upward speed, $48$ feet per second. Alone, $48t$ would say the ball rises $48$ feet every second.',
        '**The leading coefficient $-16$** is the effect of gravity. It is negative because gravity pulls the ball down, and it is why the graph opens downward. (In feet, gravity gives $-16t^2$; in meters it would be about $-4.9t^2$.)',
      ],
    },
    {
      t: 'table',
      caption: 'Heights of the volleyball at several times.',
      headers: ['$t$ (seconds)', '$0$', '$0.5$', '$1$', '$1.5$', '$2$', '$3$'],
      rows: [['$h(t)$ (feet)', '$5$', '$25$', '$37$', '$41$', '$37$', '$5$']],
    },
    {
      t: 'graph',
      caption: 'The height of the volleyball rises to 41 feet at 1.5 seconds, then falls.',
      spec: {
        xMin: 0, xMax: 3.5, yMin: 0, yMax: 45, xStep: 0.5, yStep: 5, xLabel: 't (seconds)', yLabel: 'height (feet)',
        functions: [{ expr: '-16x^2+48x+5', label: 'h(t)', domain: [0, 3.1] }],
        points: [{ x: 0, y: 5, label: '(0, 5)' }, { x: 1.5, y: 41, label: '(1.5, 41)' }],
        ariaLabel: 'A downward-opening parabola starting at height 5 when t is 0, reaching a maximum of 41 feet at t = 1.5, back to 5 feet at t = 3, and hitting the ground just after t = 3.1.',
      },
    },
    { t: 'p', text: '### Area: factors are side lengths' },
    { t: 'p', text: 'A square game board is $x$ inches on each side. A designer adds $3$ inches to one side and $5$ inches to the other. The new area is $(x + 3)(x + 5)$. Here the **factors** $x + 3$ and $x + 5$ are the new **length and width**. Splitting the rectangle into pieces shows what each **term** of the expanded form means:' },
    {
      t: 'table',
      caption: 'Area model for (x + 3)(x + 5). Each cell is the area of one piece.',
      headers: ['times', '$x$', '$5$'],
      rows: [
        ['$x$', '$x^2$', '$5x$'],
        ['$3$', '$3x$', '$15$'],
      ],
    },
    { t: 'math', tex: '(x + 3)(x + 5) = x^2 + 5x + 3x + 15 = x^2 + 8x + 15' },
    { t: 'p', text: 'The term $x^2$ is the original square board, $8x$ is the two added strips together, and $15$ is the $3$ by $5$ corner piece. (You will practice multiplying like this in the next lesson.)' },
  ],
  examples: [
    {
      title: 'Name every part',
      kind: 'introductory',
      problem: [{ t: 'p', text: 'For $5x^2 - 3x + 8$, name the terms, the leading coefficient, the coefficient of $x$, the constant term, the degree and the number of terms.' }],
      steps: [
        { text: 'Rewrite subtraction as adding the opposite.', tex: '5x^2 + (-3x) + 8', why: 'The minus sign belongs to the $3x$ term, so writing it as $+(-3x)$ keeps the sign attached.' },
        { text: 'List the terms.', tex: '5x^2, \\quad -3x, \\quad 8', why: 'Terms are the pieces being added.' },
        { text: 'Read the coefficients and the constant.', tex: '\\text{leading coefficient } 5, \\quad \\text{coefficient of } x \\text{ is } -3, \\quad \\text{constant } 8', why: 'It is already in standard form, so the first coefficient is the leading coefficient. The constant term has no variable.' },
        { text: 'Find the degree and count the terms.', why: 'The highest exponent is $2$, so the degree is $2$ (quadratic). There are $3$ terms, so it is a trinomial.' },
      ],
      answer: 'Terms $5x^2$, $-3x$, $8$; leading coefficient $5$; coefficient of $x$ is $-3$; constant $8$; degree $2$; three terms (trinomial).',
    },
    {
      title: 'Terms out of order',
      kind: 'intermediate',
      problem: [{ t: 'p', text: 'Write $7 - 2x^2 + x$ in standard form. Then give the leading coefficient, the coefficient of $x$ and the constant term.' }],
      steps: [
        { text: 'Attach each sign to its term.', tex: '7, \\quad -2x^2, \\quad +x', why: 'The minus belongs to $2x^2$. The $x$ has a plus sign in front of it.' },
        { text: 'Order the terms from highest exponent to lowest.', tex: '-2x^2 + x + 7', why: 'Standard form is $ax^2 + bx + c$. Addition can be done in any order, so moving terms (with their signs) does not change the value.' },
        { text: 'Read the parts.', tex: 'a = -2, \\quad b = 1, \\quad c = 7', why: 'The coefficient of $x$ is $1$ because $x = 1 \\cdot x$. The leading coefficient is $-2$, not $7$: the $7$ was written first, but it is the constant term.' },
        { text: 'Check with a value, say $x = 1$.', tex: '7 - 2(1)^2 + 1 = 6, \\qquad -2(1)^2 + 1 + 7 = 6', why: 'Both forms give the same value, so the reordering kept the expression the same.' },
      ],
      answer: '$-2x^2 + x + 7$; leading coefficient $-2$; coefficient of $x$ is $1$; constant term $7$.',
    },
    {
      title: 'Reading factored form',
      kind: 'intermediate',
      problem: [{ t: 'p', text: 'Consider $3(x + 4)(x - 1)$. Name its factors, explain why it is quadratic, and find the value of $x$ that makes the factor $x - 1$ equal to $0$. What is the whole expression at that value?' }],
      steps: [
        { text: 'List what is being multiplied.', tex: '3, \\quad x + 4, \\quad x - 1', why: 'The expression is one product. Each piece of a product is a factor.' },
        { text: 'Explain the degree.', why: 'Each binomial factor has one $x$. Multiplying them gives $x \\cdot x = x^2$, and nothing gives a higher power, so the degree is $2$.' },
        { text: 'Make $x - 1 = 0$.', tex: 'x = 1', why: '$1 - 1 = 0$.' },
        { text: 'Evaluate the whole expression at $x = 1$.', tex: '3(1 + 4)(1 - 1) = 3 \\cdot 5 \\cdot 0 = 0', why: 'Anything times $0$ is $0$. When one factor is $0$, the whole product is $0$.' },
      ],
      answer: 'Factors $3$, $x + 4$, $x - 1$; degree $2$ because $x \\cdot x = x^2$; at $x = 1$ the expression equals $0$.',
    },
    {
      title: 'A common mistake: dropping the signs',
      kind: 'common-mistake',
      problem: [{ t: 'p', text: 'A student says that in $-x^2 + 6x - 9$ the leading coefficient is $1$ and the constant term is $9$. Find the mistakes and correct them.' }],
      steps: [
        { text: 'Rewrite with every sign attached.', tex: '-1x^2 + 6x + (-9)', why: '$-x^2$ means $-1 \\cdot x^2$, and $-9$ means $+(-9)$.' },
        { text: 'Read the leading coefficient.', tex: 'a = -1', why: 'The minus sign in front of $x^2$ belongs to the term. The student dropped it.' },
        { text: 'Read the constant term.', tex: 'c = -9', why: 'The minus sign in front of $9$ belongs to the constant term too.' },
        { text: 'Check by evaluating at $x = 0$.', tex: '-(0)^2 + 6(0) - 9 = -9', why: 'At $x = 0$ every variable term is $0$, so the value is the constant term. It is $-9$, not $9$.' },
      ],
      answer: 'The leading coefficient is $-1$ and the constant term is $-9$.',
    },
    {
      title: 'What the numbers mean for a volleyball',
      kind: 'real-world',
      problem: [{ t: 'p', text: 'A volleyball is bumped upward. Its height in feet after $t$ seconds is $h(t) = -16t^2 + 48t + 5$. Explain what $5$, $48$ and $-16$ mean, and find and interpret $h(1)$.' }],
      steps: [
        { text: 'Interpret the constant term.', tex: 'h(0) = -16(0)^2 + 48(0) + 5 = 5', why: 'At $t = 0$ every term with $t$ is $0$, so $5$ is the starting height: the ball leaves the player\'s arms $5$ feet above the floor.' },
        { text: 'Interpret the coefficient of $t$.', why: '$48t$ has units of feet: $48$ feet per second times $t$ seconds. So $48$ is the starting upward speed, $48$ feet per second.' },
        { text: 'Interpret the leading coefficient.', why: '$-16t^2$ is the effect of gravity. It is negative because gravity pulls the ball down, and it grows with $t^2$, so it eventually beats the $48t$ and the ball comes back down.' },
        { text: 'Find $h(1)$.', tex: 'h(1) = -16(1)^2 + 48(1) + 5 = -16 + 48 + 5 = 37', why: 'Substitute $1$ for $t$. Square first, then multiply, then add.' },
      ],
      answer: '$5$ is the starting height (feet), $48$ is the starting upward speed (feet per second), $-16$ is the effect of gravity. $h(1) = 37$: after $1$ second the ball is $37$ feet high.',
    },
    {
      title: 'Revenue from custom phone cases',
      kind: 'challenging',
      problem: [{ t: 'p', text: 'A student sells custom phone cases. If each case costs $p$ dollars, she expects to sell $120 - 4p$ cases a month, so her monthly revenue in dollars is $R(p) = p(120 - 4p)$. Explain what each factor means, explain the $120$ and the $-4$, and compare $R(10)$ and $R(15)$.' }],
      steps: [
        { text: 'Interpret the factors.', why: 'Revenue is (price per case) times (number of cases sold). So the factor $p$ is the price in dollars, and the factor $120 - 4p$ is the number of cases sold.' },
        { text: 'Interpret $120$ and $-4$ inside the second factor.', why: 'When $p = 0$ the number sold is $120$, so $120$ is how many people would take a free case. The $-4$ means each \\$1 increase in price loses $4$ sales.' },
        { text: 'Evaluate at $p = 10$ and $p = 15$.', tex: 'R(10) = 10(120 - 40) = 10 \\cdot 80 = 800, \\qquad R(15) = 15(120 - 60) = 15 \\cdot 60 = 900', why: 'Work inside the parentheses first, then multiply.' },
        { text: 'Look at the standard form.', tex: 'p(120 - 4p) = 120p - 4p^2 = -4p^2 + 120p', why: 'Distribute $p$ to both terms. The leading coefficient is $-4$ and the constant term is $0$: if the price is \\$0, the revenue is \\$0.' },
      ],
      answer: '$p$ is the price and $120 - 4p$ is the number sold. $R(10) = 800$ dollars and $R(15) = 900$ dollars, so the higher price earns \\$100 more, even though she sells fewer cases ($60$ instead of $80$).',
    },
  ],
  teachMeAgain: [
    {
      approach: 'visual',
      title: 'Color-code the parts',
      blocks: [
        { t: 'p', text: 'Break $2x^2 + 9x - 4$ apart at every plus and minus sign. Each piece is a term, and the sign in front goes with it.' },
        {
          t: 'table',
          caption: 'Each term of 2x squared plus 9x minus 4, split into its coefficient and its variable part.',
          headers: ['Term', 'Coefficient (the number)', 'Variable part', 'What kind'],
          rows: [
            ['$2x^2$', '$2$', '$x^2$', 'quadratic term (leading)'],
            ['$9x$', '$9$', '$x$', 'linear term'],
            ['$-4$', 'none', 'none', 'constant term'],
          ],
        },
        { t: 'p', text: 'The biggest exponent in the variable column is $2$, so the degree is $2$. Three rows means three terms: a trinomial.' },
      ],
    },
    {
      approach: 'analogy',
      title: 'Train cars and recipe ingredients',
      blocks: [
        { t: 'p', text: '**Terms are train cars.** Plus and minus signs are the couplings between cars. Each sign rides with the car that comes right after it. In $x^2 - 8x + 12$, the cars are $x^2$, $-8x$ and $+12$.' },
        { t: 'p', text: '**Factors are ingredients that get mixed together.** In $(x - 2)(x - 6)$ the two factors are multiplied, like ingredients combined into one dish. You cannot point to "a term" in that dish until you multiply it out.' },
        { t: 'p', text: 'Fun fact: those two are the same expression. $(x - 2)(x - 6) = x^2 - 8x + 12$. Check at $x = 3$: $(1)(-3) = -3$ and $9 - 24 + 12 = -3$.' },
      ],
    },
    {
      approach: 'prerequisite',
      title: 'Refresher: exponents, signs and substitution',
      blocks: [
        {
          t: 'list',
          items: [
            '$x^2$ means $x \\cdot x$. So when $x = 3$, $4x^2 = 4 \\cdot 9 = 36$. Square first, then multiply.',
            'A variable with no number in front has coefficient $1$: $x = 1x$. And $-x = -1x$.',
            'Subtracting is adding the opposite: $6 - 2x = 6 + (-2x)$, so the coefficient of $x$ is $-2$.',
            'In function notation, $h(0)$ means "substitute $0$." Every term with the variable becomes $0$, so $h(0)$ is always the constant term.',
          ],
        },
      ],
    },
    {
      approach: 'step-by-step',
      title: 'A 4-step checklist',
      blocks: [
        {
          t: 'list',
          ordered: true,
          items: [
            '**Is it multiplied out?** If you see a product like $2(x + 1)(x - 5)$, its pieces are **factors**. If you see pieces joined by $+$ and $-$, they are **terms**.',
            '**Put terms in standard form.** Highest exponent first, each sign attached: $10 + x - 3x^2$ becomes $-3x^2 + x + 10$.',
            '**Read the coefficients.** $a = -3$ (leading), $b = 1$, constant term $c = 10$.',
            '**Read the degree and count terms.** Highest exponent $2$, three terms.',
          ],
        },
        { t: 'callout', variant: 'tip', text: 'In a word problem, add a fifth step: ask "what are the units of this term?" The units tell you what it means.' },
      ],
    },
    {
      approach: 'alternate-strategy',
      title: 'Plug in numbers to find the meaning',
      blocks: [
        { t: 'p', text: 'If you are not sure what a part of a model means, test the model with easy numbers.' },
        { t: 'p', text: 'For a rocket launched from a $3$-foot stand, $h(t) = -16t^2 + 64t + 3$:' },
        {
          t: 'list',
          items: [
            'Try $t = 0$: $h(0) = 3$. The constant term is where it starts.',
            'Ignore gravity for a moment: $64t + 3$ would add $64$ feet each second. So $64$ is the starting speed in feet per second.',
            'Now include gravity: $h(1) = -16 + 64 + 3 = 51$, not $67$. The $-16t^2$ took away $16$ feet already, and it takes away more each second.',
          ],
        },
      ],
    },
    {
      approach: 'simpler-example',
      title: 'Start with two terms',
      blocks: [
        { t: 'p', text: '$x^2 + 4$: two terms (binomial). Leading coefficient $1$, no $x$ term (so $b = 0$), constant term $4$, degree $2$.' },
        { t: 'p', text: '$-3x^2 + 12x$: two terms. Leading coefficient $-3$, coefficient of $x$ is $12$, constant term $0$, degree $2$.' },
        { t: 'p', text: '$5x(x - 2)$: one product. Factors $5$, $x$ and $x - 2$. Degree $2$, because $x \\cdot x = x^2$.' },
        { t: 'p', text: 'Now try three terms: $x^2 - 7x + 10$ has leading coefficient $1$, coefficient of $x$ equal to $-7$, and constant term $10$.' },
      ],
    },
  ],
  guided: [
    { generator: 'u4.interpret-parts', difficulty: 1 },
    { generator: 'u4.interpret-parts', difficulty: 1 },
    { generator: 'u4.interpret-parts', difficulty: 1 },
    { generator: 'u4.interpret-parts', difficulty: 1 },
  ],
  independent: {
    count: 8,
    reviewCount: 2,
    mix: [
      { generator: 'u4.interpret-parts', difficulty: 1, weight: 1 },
      { generator: 'u4.interpret-parts', difficulty: 2, weight: 2 },
      { generator: 'u4.interpret-parts', difficulty: 3, weight: 2 },
    ],
  },
  quiz: {
    items: [
      { generator: 'u4.interpret-parts', difficulty: 2 },
      { generator: 'u4.interpret-parts', difficulty: 2 },
      { generator: 'u4.interpret-parts', difficulty: 2 },
      { generator: 'u4.interpret-parts', difficulty: 3 },
      { generator: 'u4.interpret-parts', difficulty: 3 },
      { generator: 'u4.interpret-parts', difficulty: 3 },
    ],
  },
  summary: [
    'Terms are added; the sign in front goes with the term. In $3x^2 - 5x + 7$ the terms are $3x^2$, $-5x$ and $7$.',
    'Write a quadratic in standard form $ax^2 + bx + c$ first. Then $a$ is the leading coefficient, $b$ is the coefficient of $x$, and $c$ is the constant term. The degree is $2$.',
    'Factors are multiplied: $4(x - 2)(x + 1)$ has factors $4$, $x - 2$ and $x + 1$. In an area, factors are side lengths.',
    'In context, ask what each part measures: in $h(t) = -16t^2 + 48t + 5$, $5$ is the starting height, $48$ the starting speed and $-16$ the pull of gravity.',
  ],
  mastery: { quizPassScore: 0.8, practiceMinCorrect: 5 },
};
