import type { LessonContent } from '../../../core/curriculum/types';

/**
 * U4L18 Creating Quadratic Models (A.FGR.7.6, A.MM.1.2, A.MM.1.4)
 * Write y = a(x - h)^2 + k from the vertex and one more point, write y = a(x - r)(x - s) from the zeros and one
 * more point, write the projectile model h(t) = -16t^2 + v0 t + h0 from a description, model area with a fixed
 * perimeter A(x) = x(P/2 - x) and revenue = price times number sold, and graph a model with labels, a scale and a
 * sensible window (S4.20).
 *
 * Math verified by hand (2026-10-06): every model below was checked to pass through each of its given points (vertex, zeros and extra point), every value of a was re-solved, every maximum was recomputed from x = -b/(2a), every landing time was recomputed with the quadratic formula, and every table value was recomputed by substitution.
 */
export const U4L18: LessonContent = {
  lessonId: 'U4L18',
  goal: 'Write a quadratic function that models a situation: from a vertex and a point, from the zeros and a point, from a description of a launched object, or from an area or revenue situation, and graph the model with labeled axes, a sensible scale and a sensible window.',
  needToKnow: [
    { t: 'p', text: 'You already know the three forms of a quadratic and what each one shows:' },
    {
      t: 'list',
      items: [
        '**Vertex form** $y = a(x - h)^2 + k$ shows the vertex $(h, k)$.',
        '**Factored form** $y = a(x - r)(x - s)$ shows the zeros (x-intercepts) $r$ and $s$.',
        '**Standard form** $y = ax^2 + bx + c$ shows the y-intercept $c$; the vertex is at $x = -\\frac{b}{2a}$.',
      ],
    },
    { t: 'p', text: 'In every form, $a$ controls the direction and the width: $a > 0$ opens up, $a < 0$ opens down.' },
    { t: 'callout', variant: 'tip', title: 'Quick check', text: 'What is the vertex of $y = 3(x + 4)^2 - 1$? (You should get $(-4, -1)$: the sign inside the parentheses flips.) If that felt shaky, open **Teach Me Again** and choose the refresher.' },
  ],
  vocabulary: [
    { term: 'model', meaning: 'An equation that describes a real situation, so you can use math to answer questions about it.' },
    { term: 'leading coefficient', meaning: 'The number $a$ in front. Once you know the vertex or the zeros, one more point lets you solve for $a$.' },
    { term: 'zeros', meaning: 'The inputs where the function equals $0$; they are the x-intercepts of the graph.' },
    { term: 'revenue', meaning: 'The money brought in from sales: price per item times number of items sold.' },
    { term: 'viewing window', meaning: 'The part of the graph you choose to show: the smallest and largest $x$ and $y$ values on the axes.' },
  ],
  instruction: [
    { t: 'p', text: '### From the vertex and one more point' },
    { t: 'p', text: 'Many parabolas share the same vertex. They differ only in $a$. So the vertex gives you $h$ and $k$, and one more point pins down $a$.' },
    { t: 'p', text: 'Write the quadratic with vertex $(2, -3)$ that passes through $(4, 5)$.' },
    { t: 'math', tex: 'y = a(x - 2)^2 - 3 \\;\\Longrightarrow\\; 5 = a(4 - 2)^2 - 3 \\;\\Longrightarrow\\; 5 = 4a - 3 \\;\\Longrightarrow\\; a = 2' },
    { t: 'p', text: 'So $y = 2(x - 2)^2 - 3$. **Why it works:** the point $(4, 5)$ is on the graph, so its coordinates must make the equation true. Substituting leaves only one unknown, $a$, and you solve for it.' },
    {
      t: 'graph',
      caption: 'The parabola y = 2(x - 2)^2 - 3 with its vertex and the given point marked.',
      spec: {
        xMin: -1,
        xMax: 5,
        yMin: -4,
        yMax: 8,
        functions: [{ expr: '2(x - 2)^2 - 3', label: 'y = 2(x - 2)^2 - 3' }],
        points: [
          { x: 2, y: -3, label: 'vertex (2, -3)' },
          { x: 4, y: 5, label: '(4, 5)' },
        ],
        ariaLabel: 'An upward parabola with vertex (2, -3) passing through the point (4, 5) and, by symmetry, (0, 5).',
      },
    },
    { t: 'p', text: '### From the zeros and one more point' },
    { t: 'p', text: 'If the zeros are $r$ and $s$, the quadratic is $y = a(x - r)(x - s)$, because each factor is $0$ at its zero. Again, one more point gives $a$.' },
    { t: 'p', text: 'Write the quadratic with zeros $-1$ and $5$ and y-intercept $-10$.' },
    { t: 'math', tex: 'y = a(x + 1)(x - 5) \\;\\Longrightarrow\\; -10 = a(0 + 1)(0 - 5) \\;\\Longrightarrow\\; -10 = -5a \\;\\Longrightarrow\\; a = 2' },
    { t: 'p', text: 'So $y = 2(x + 1)(x - 5)$. The y-intercept is the point $(0, -10)$, so substitute $x = 0$ and $y = -10$.' },
    { t: 'p', text: '### Models from situations' },
    {
      t: 'table',
      caption: 'Three kinds of situations that give quadratic models.',
      headers: ['Situation', 'Model', 'What the letters mean'],
      rows: [
        ['an object launched straight up', '$h(t) = -16t^2 + v_0 t + h_0$', '$t$ seconds, $h$ feet, $v_0$ starting upward speed in ft/s, $h_0$ starting height in ft'],
        ['a rectangle with perimeter $P$', '$A(x) = x\\left(\\frac{P}{2} - x\\right)$', '$x$ is one side; the other side is half the perimeter minus $x$'],
        ['selling at a price', '$R = (\\text{price})(\\text{number sold})$', 'when the price goes up, fewer are sold'],
      ],
    },
    { t: 'p', text: '**Projectile.** A volleyball is bumped straight up from a height of $6$ feet with an upward speed of $32$ feet per second. Then $v_0 = 32$ and $h_0 = 6$, so $h(t) = -16t^2 + 32t + 6$. The $-16$ comes from gravity (half of $32$ feet per second squared), and it is negative because gravity pulls the ball down.' },
    { t: 'p', text: '**Area.** You have $40$ feet of fencing for a rectangular garden. If one side is $x$ feet, the two lengths and two widths add to $40$, so one length plus one width is $20$. The other side is $20 - x$, and the area is $A(x) = x(20 - x)$. Its zeros are $0$ and $20$, so the maximum is halfway, at $x = 10$: a $10$-by-$10$ square with area $100$ square feet.' },
    { t: 'p', text: '**Revenue.** If shirts sell for $(10 + x)$ dollars and the number sold is $(80 - 4x)$, the revenue is $R(x) = (10 + x)(80 - 4x)$. Revenue is always price times quantity.' },
    { t: 'p', text: '### Graphing a model: labels, scale and window' },
    {
      t: 'list',
      items: [
        '**Label the axes** with the quantity and units: "time (s)" and "height (ft)".',
        '**Choose the window from the situation.** Time starts at $0$ and ends when the ball lands, so the horizontal axis runs from $0$ to a bit past the landing time. Height cannot go below $0$, so the vertical axis runs from $0$ to a bit above the maximum.',
        '**Pick a scale** that fits: steps of $0.5$ second and $5$ feet here.',
        '**Draw only the part that makes sense** and mark the key points: the start, the top and the landing.',
      ],
    },
    {
      t: 'graph',
      caption: 'Height of the volleyball, h(t) = -16t^2 + 32t + 6, from the bump until it hits the floor.',
      spec: {
        xMin: 0,
        xMax: 2.5,
        yMin: 0,
        yMax: 25,
        xStep: 0.5,
        yStep: 5,
        xLabel: 'time (s)',
        yLabel: 'height (ft)',
        functions: [{ expr: '-16x^2 + 32x + 6', label: 'h(t)', domain: [0, 2.17] }],
        points: [
          { x: 0, y: 6, label: 'start (0, 6)' },
          { x: 1, y: 22, label: 'top (1, 22)' },
          { x: 2.17, y: 0, label: 'lands near 2.17 s' },
        ],
        ariaLabel: 'A downward parabola drawn from time 0 to about 2.17 seconds. It starts at 6 feet, reaches a maximum of 22 feet at 1 second, and reaches the floor at about 2.17 seconds. The horizontal axis is time in seconds, scaled by 0.5; the vertical axis is height in feet, scaled by 5.',
      },
    },
    { t: 'callout', variant: 'why', title: 'Why the window matters', text: 'A window from $-10$ to $10$ on both axes would show negative times and heights, and the whole flight would be squeezed into a tiny bump. Choosing the window from the situation makes the graph honest and easy to read.' },
    { t: 'callout', variant: 'realworld', title: 'Where this shows up', text: 'Coaches model the arc of a kick, game designers write jump physics with parabolas, and small businesses (or a club selling merch) model revenue to choose the best price.' },
  ],
  examples: [
    {
      title: 'Vertex and a point',
      kind: 'introductory',
      problem: [{ t: 'p', text: 'Write the equation of the parabola with vertex $(1, 4)$ that passes through $(3, -4)$.' }],
      steps: [
        { text: 'Start with vertex form.', tex: 'y = a(x - 1)^2 + 4', why: 'The vertex is $(h, k) = (1, 4)$, so $h = 1$ and $k = 4$.' },
        { text: 'Substitute the other point.', tex: '-4 = a(3 - 1)^2 + 4', why: 'The point $(3, -4)$ is on the graph, so $x = 3$ and $y = -4$ make the equation true.' },
        { text: 'Solve for $a$.', tex: '-4 = 4a + 4 \\;\\Longrightarrow\\; -8 = 4a \\;\\Longrightarrow\\; a = -2', why: '$(3 - 1)^2 = 4$. Subtract $4$, then divide by $4$.' },
        { text: 'Write and check.', tex: 'y = -2(x - 1)^2 + 4, \\quad -2(3 - 1)^2 + 4 = -8 + 4 = -4', why: 'The point checks. The negative $a$ makes sense: the point is below the vertex, so the parabola opens down.' },
      ],
      answer: '$y = -2(x - 1)^2 + 4$',
    },
    {
      title: 'Zeros and a point',
      kind: 'intermediate',
      problem: [{ t: 'p', text: 'A parabola has x-intercepts $2$ and $6$ and passes through $(1, 10)$. Write its equation in factored form.' }],
      steps: [
        { text: 'Start with factored form.', tex: 'y = a(x - 2)(x - 6)', why: 'Each zero $r$ gives a factor $(x - r)$, which is $0$ when $x = r$.' },
        { text: 'Substitute the point.', tex: '10 = a(1 - 2)(1 - 6) = a(-1)(-5) = 5a', why: 'The point $(1, 10)$ must satisfy the equation.' },
        { text: 'Solve for $a$.', tex: 'a = 2', why: 'Divide both sides by $5$.' },
        { text: 'Write and check.', tex: 'y = 2(x - 2)(x - 6), \\quad 2(-1)(-5) = 10', why: 'The point checks, and $x = 2$ and $x = 6$ still make $y = 0$.' },
      ],
      answer: '$y = 2(x - 2)(x - 6)$',
    },
    {
      title: 'Read the graph, then write the equation',
      kind: 'intermediate',
      problem: [
        { t: 'p', text: 'Write an equation in vertex form for the parabola shown.' },
        {
          t: 'graph',
          caption: 'A parabola with its vertex and its y-intercept labeled.',
          spec: {
            xMin: -6,
            xMax: 2,
            yMin: -6,
            yMax: 5,
            functions: [{ expr: '-(x + 2)^2 + 3' }],
            points: [
              { x: -2, y: 3, label: 'vertex (-2, 3)' },
              { x: 0, y: -1, label: '(0, -1)' },
            ],
            ariaLabel: 'A downward parabola with vertex (-2, 3) that crosses the y-axis at (0, -1). By symmetry it also passes through (-4, -1).',
          },
        },
      ],
      steps: [
        { text: 'Read the vertex and write vertex form.', tex: 'y = a(x - (-2))^2 + 3 = a(x + 2)^2 + 3', why: 'The vertex is $(-2, 3)$. Subtracting $-2$ gives $x + 2$.' },
        { text: 'Substitute the labeled point $(0, -1)$.', tex: '-1 = a(0 + 2)^2 + 3 = 4a + 3', why: 'Any point on the graph other than the vertex lets you find $a$; the y-intercept is easy because $x = 0$.' },
        { text: 'Solve for $a$.', tex: '-4 = 4a \\;\\Longrightarrow\\; a = -1', why: 'Subtract $3$, then divide by $4$. The graph opens down, so a negative $a$ is expected.' },
        { text: 'Write and check with another point.', tex: 'y = -(x + 2)^2 + 3, \\quad x = -4: \\; -(-2)^2 + 3 = -1', why: 'By symmetry, $(-4, -1)$ is also on the graph, and the equation gives $-1$ there too.' },
      ],
      answer: '$y = -(x + 2)^2 + 3$',
    },
    {
      title: 'A common mistake: the sign of h, and assuming a = 1',
      kind: 'common-mistake',
      problem: [{ t: 'p', text: 'Write the parabola with vertex $(-3, 2)$ through $(-1, 10)$. A student writes $y = (x - 3)^2 + 2$. Find the errors and fix them.' }],
      steps: [
        { text: 'Check the student\'s equation with the point.', tex: '(-1 - 3)^2 + 2 = 16 + 2 = 18 \\ne 10', why: 'A correct model must pass through every given point. It does not, so something is wrong.' },
        { text: 'Fix the sign of $h$.', tex: 'y = a(x - (-3))^2 + 2 = a(x + 3)^2 + 2', why: 'Vertex form is $x - h$. With $h = -3$, that becomes $x + 3$. The student\'s $(x - 3)$ puts the vertex at $x = 3$.' },
        { text: 'Do not assume $a = 1$: solve for it.', tex: '10 = a(-1 + 3)^2 + 2 = 4a + 2 \\;\\Longrightarrow\\; a = 2', why: 'The student left out $a$. Only the extra point can tell you what $a$ is.' },
        { text: 'Check.', tex: 'y = 2(x + 3)^2 + 2, \\quad 2(2)^2 + 2 = 10', why: 'Now the model passes through $(-1, 10)$, and its vertex is $(-3, 2)$.' },
      ],
      answer: '$y = 2(x + 3)^2 + 2$. Always check your model with the given point.',
    },
    {
      title: 'Modeling a soccer kick',
      kind: 'real-world',
      problem: [{ t: 'p', text: 'Aaliyah kicks a soccer ball from $3$ feet off the ground (she volleys it out of the air) with an upward speed of $48$ feet per second. (a) Write a model for its height. (b) How high is it after $1$ second? (c) When does it reach its highest point, and how high is that? (d) Choose a sensible window and graph the model.' }],
      steps: [
        { text: '(a) Fill in the projectile model.', tex: 'h(t) = -16t^2 + 48t + 3', why: 'In $h(t) = -16t^2 + v_0 t + h_0$, the upward speed is $v_0 = 48$ ft/s and the starting height is $h_0 = 3$ ft.' },
        { text: '(b) Evaluate at $t = 1$.', tex: 'h(1) = -16 + 48 + 3 = 35 \\text{ ft}', why: 'The input is time in seconds, so $h(1)$ is the height after $1$ second.' },
        { text: '(c) Find the vertex.', tex: 't = -\\frac{48}{2(-16)} = 1.5, \\quad h(1.5) = -16(2.25) + 72 + 3 = 39 \\text{ ft}', why: '$a = -16 < 0$, so the vertex is a maximum, at $t = -\\frac{b}{2a}$.' },
        { text: '(d) Find where the flight ends.', tex: 't = \\frac{-48 - \\sqrt{48^2 - 4(-16)(3)}}{2(-16)} = \\frac{48 + \\sqrt{2496}}{32} \\approx 3.06 \\text{ s}', why: 'The ball lands when $h(t) = 0$. The other solution, about $-0.06$, is before the kick, so reject it.' },
        { text: 'Choose the window and scale.', why: 'Time from $0$ to $3.5$ seconds in steps of $0.5$ covers the whole flight. Height from $0$ to $45$ feet in steps of $5$ fits the maximum of $39$ feet with a little room.' },
      ],
      answer: '(a) $h(t) = -16t^2 + 48t + 3$; (b) $35$ ft; (c) at $1.5$ s, $39$ ft high; (d) window $0 \\le t \\le 3.5$, $0 \\le h \\le 45$, with the flight ending near $3.06$ s.',
    },
    {
      title: 'The best price for phone cases',
      kind: 'challenging',
      problem: [{ t: 'p', text: 'A robotics club sells custom phone cases for \\$10 each and sells $80$ a month. A survey says that for each \\$1 increase in price, they will sell $4$ fewer cases. Write a revenue model, and find the price that brings in the most money.' }],
      steps: [
        { text: 'Define the variable.', why: 'Let $x$ be the number of \\$1 price increases. Then the price is $10 + x$ dollars and the number sold is $80 - 4x$.' },
        { text: 'Write the model.', tex: 'R(x) = (10 + x)(80 - 4x)', why: 'Revenue is price times number sold.' },
        { text: 'Find the zeros.', tex: '10 + x = 0 \\Rightarrow x = -10, \\qquad 80 - 4x = 0 \\Rightarrow x = 20', why: 'The model is already factored, so the zeros come straight from the factors.' },
        { text: 'The maximum is halfway between the zeros.', tex: 'x = \\frac{-10 + 20}{2} = 5', why: 'A parabola is symmetric, so its vertex is on the axis of symmetry, midway between the zeros. Here $R(x) = -4x^2 + 40x + 800$ opens down, so the vertex is a maximum. Check: $-\\frac{40}{2(-4)} = 5$.' },
        { text: 'Find the revenue and interpret.', tex: 'R(5) = (15)(60) = 900', why: 'Five \\$1 increases make the price \\$15, and they sell $80 - 20 = 60$ cases.' },
      ],
      answer: '$R(x) = (10 + x)(80 - 4x)$. The best price is \\$15, which sells $60$ cases for \\$900 a month.',
    },
  ],
  teachMeAgain: [
    {
      approach: 'visual',
      title: 'Same vertex, different a',
      blocks: [
        { t: 'p', text: 'All three parabolas below have vertex $(2, -3)$. Only one passes through the point $(4, 5)$.' },
        {
          t: 'graph',
          caption: 'Three parabolas with vertex (2, -3): a = 1, a = 2 and a = 3. Only a = 2 goes through (4, 5).',
          spec: {
            xMin: -1,
            xMax: 5,
            yMin: -4,
            yMax: 10,
            functions: [
              { expr: '(x - 2)^2 - 3', label: 'a = 1', dashed: true },
              { expr: '2(x - 2)^2 - 3', label: 'a = 2' },
              { expr: '3(x - 2)^2 - 3', label: 'a = 3', dashed: true },
            ],
            points: [
              { x: 2, y: -3, label: 'vertex (2, -3)' },
              { x: 4, y: 5, label: '(4, 5)' },
            ],
            ariaLabel: 'Three upward parabolas share the vertex (2, -3). At x = 4 the widest one (a = 1) is at 1, the middle one (a = 2) is at 5, passing through the marked point (4, 5), and the narrowest one (a = 3) is at 9.',
          },
        },
        { t: 'p', text: 'At $x = 4$ they reach $1$, $5$ and $9$. The vertex picks the family; the extra point picks the one member of the family you want. That is why you substitute the point to solve for $a$.' },
      ],
    },
    {
      approach: 'simpler-example',
      title: 'When a is already 1',
      blocks: [
        { t: 'p', text: 'Write a quadratic with $a = 1$ and zeros $1$ and $3$.' },
        { t: 'math', tex: 'y = (x - 1)(x - 3)' },
        { t: 'p', text: 'Check: at $x = 1$ the first factor is $0$, and at $x = 3$ the second factor is $0$. Expanded, it is $y = x^2 - 4x + 3$.' },
        { t: 'p', text: 'Now suppose it must also pass through $(0, 6)$. With $a = 1$ the y-intercept is $3$, so we need a different $a$: $6 = a(0 - 1)(0 - 3) = 3a$, so $a = 2$ and $y = 2(x - 1)(x - 3)$.' },
      ],
    },
    {
      approach: 'analogy',
      title: 'Pitching a tent',
      blocks: [
        { t: 'p', text: 'Think of the vertex as the top of a tent pole: it fixes where the peak is. But the same pole can hold up a steep, narrow tent or a wide, flat one. To know which, you need to know where one of the guy ropes hits the ground.' },
        { t: 'p', text: 'In a quadratic, the vertex $(h, k)$ is the pole and the extra point is the rope stake. The stake tells you how steep the sides are, which is the value of $a$. With zeros instead of a vertex, the two zeros are like two stakes, and one more point tells you how tall the tent is.' },
      ],
    },
    {
      approach: 'prerequisite',
      title: 'Refresher: substitute and solve for a',
      blocks: [
        { t: 'p', text: 'Finding $a$ is a one-variable equation. Take $y = a(x + 1)(x - 5)$ through $(2, -18)$:' },
        { t: 'list', ordered: true, items: [
          'Put in $x = 2$ and $y = -18$: $-18 = a(2 + 1)(2 - 5)$.',
          'Simplify each factor: $2 + 1 = 3$ and $2 - 5 = -3$, so $(3)(-3) = -9$, giving $-18 = -9a$.',
          'Divide: $a = \\frac{-18}{-9} = 2$.',
        ] },
        { t: 'p', text: 'Also remember the sign rule: a vertex at $(h, k)$ gives $(x - h)$, so $h = -1$ gives $(x + 1)$, and a zero at $-1$ gives the factor $(x + 1)$.' },
      ],
    },
    {
      approach: 'step-by-step',
      title: 'Which form should I start with?',
      blocks: [
        { t: 'list', ordered: true, items: [
          '**Given a vertex?** Start with $y = a(x - h)^2 + k$.',
          '**Given two zeros (x-intercepts)?** Start with $y = a(x - r)(x - s)$.',
          '**Given an object launched up or dropped?** Use $h(t) = -16t^2 + v_0 t + h_0$ (feet and seconds).',
          '**Given a fixed perimeter?** Use $A(x) = x\\left(\\frac{P}{2} - x\\right)$.',
          '**Given a price and a number sold?** Use revenue $=$ (price)(number sold).',
          '**Substitute the extra point** (if there is one), solve for $a$, and **check** the model with every given point.',
        ] },
      ],
    },
    {
      approach: 'alternate-strategy',
      title: 'Build a table to find the area model',
      blocks: [
        { t: 'p', text: 'If writing $A(x) = x(20 - x)$ for $40$ feet of fencing feels like magic, build it from a table. Try some widths; the length is the fencing left after the two widths, divided by $2$: $(40 - 2x) \\div 2 = 20 - x$.' },
        {
          t: 'table',
          caption: 'Rectangles with a perimeter of 40 feet.',
          headers: ['Width $x$ (ft)', 'Length (ft)', 'Area (sq ft)'],
          rows: [
            ['$2$', '$18$', '$36$'],
            ['$5$', '$15$', '$75$'],
            ['$8$', '$12$', '$96$'],
            ['$10$', '$10$', '$100$'],
            ['$12$', '$8$', '$96$'],
            ['$15$', '$5$', '$75$'],
          ],
        },
        { t: 'p', text: 'The length is always $20$ minus the width, so the area is $x(20 - x)$. The table also shows the symmetry: the areas rise to $100$ at $x = 10$ and fall back the same way. That matches the vertex of the model.' },
      ],
    },
  ],
  guided: [
    { generator: 'u4.write-vertex-form', difficulty: 1 },
    { generator: 'u4.write-factored-form', difficulty: 1 },
    { generator: 'u4.model-situation', difficulty: 1 },
    { generator: 'u4.model-situation', difficulty: 1 },
  ],
  independent: {
    count: 8,
    reviewCount: 2,
    mix: [
      { generator: 'u4.write-vertex-form', difficulty: 1, weight: 1 },
      { generator: 'u4.write-vertex-form', difficulty: 2, weight: 1 },
      { generator: 'u4.write-factored-form', difficulty: 1, weight: 1 },
      { generator: 'u4.write-factored-form', difficulty: 2, weight: 1 },
      { generator: 'u4.model-situation', difficulty: 1, weight: 1 },
      { generator: 'u4.model-situation', difficulty: 2, weight: 2 },
      { generator: 'u4.model-situation', difficulty: 3, weight: 1 },
    ],
  },
  quiz: {
    items: [
      { generator: 'u4.write-vertex-form', difficulty: 2 },
      { generator: 'u4.write-vertex-form', difficulty: 3 },
      { generator: 'u4.write-factored-form', difficulty: 2 },
      { generator: 'u4.write-factored-form', difficulty: 3 },
      { generator: 'u4.model-situation', difficulty: 2 },
      { generator: 'u4.model-situation', difficulty: 3 },
    ],
  },
  summary: [
    'From a vertex $(h, k)$ and a point, write $y = a(x - h)^2 + k$, substitute the point, and solve for $a$; watch the sign of $h$.',
    'From zeros $r$ and $s$ and a point, write $y = a(x - r)(x - s)$ and solve for $a$ the same way.',
    'Situations: $h(t) = -16t^2 + v_0 t + h_0$ for launched objects (feet and seconds), $A(x) = x\\left(\\frac{P}{2} - x\\right)$ for a fixed perimeter, and revenue $=$ price times number sold.',
    'Check every model with every given point, and graph it with labeled axes, a sensible scale and a window chosen from the situation.',
  ],
  mastery: { quizPassScore: 0.8, practiceMinCorrect: 5 },
};
