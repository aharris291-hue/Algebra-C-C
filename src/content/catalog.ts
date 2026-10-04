/**
 * The complete 18-week semester: units, skills, and all 90 instructional days.
 *
 * Pacing follows the GaDOE curriculum map for block scheduling (one semester):
 *   U1 9-12 days, U2 3-6, U3 3-6, U4 18-21, U5 6-9, U6 12-15, U7 9-12, U8 6-9, U9 2-4.
 * Our allocation: 12 + 6 + 5 + 21 + 8 + 13 + 11 + 8 + 6 = 90 days = 18 weeks x 5 days.
 * Unit 9 is at the top of its range only because the spec also requires a
 * semester review and a semester assessment.
 */
import type { LessonKind, LessonMeta, Skill, Unit } from '../core/curriculum/types';

export const UNITS: Unit[] = [
  { id: 'U1', number: 1, title: 'Modeling Linear Functions', standards: ['A.FGR.2', 'A.MM.1'], gadoeBlockDays: [9, 12], description: 'Function notation, slope and rate of change, key features of linear graphs, domain and range, arithmetic sequences, and parent functions.' },
  { id: 'U2', number: 2, title: 'Analyzing Linear Inequalities', standards: ['A.PAR.4', 'A.MM.1'], gadoeBlockDays: [3, 6], description: 'Writing and graphing linear inequalities in two variables, constraints, and systems of inequalities.' },
  { id: 'U3', number: 3, title: 'Investigating Rational and Irrational Numbers', standards: ['A.NR.5', 'A.MM.1'], gadoeBlockDays: [3, 6], description: 'Rational and irrational numbers, and rewriting expressions with square roots and cube roots.' },
  { id: 'U4', number: 4, title: 'Modeling and Analyzing Quadratic Functions', standards: ['A.PAR.6', 'A.FGR.7', 'A.MM.1'], gadoeBlockDays: [18, 21], description: 'Quadratic expressions, factoring, solving quadratic equations, graphs, transformations, forms, and quadratic models.' },
  { id: 'U5', number: 5, title: 'Modeling and Analyzing Exponential Expressions and Equations', standards: ['A.PAR.8', 'A.MM.1'], gadoeBlockDays: [6, 9], description: 'Exponent rules, interpreting exponential expressions, growth and decay equations, and solving exponential equations.' },
  { id: 'U6', number: 6, title: 'Analyzing Exponential Functions', standards: ['A.FGR.9', 'A.MM.1'], gadoeBlockDays: [12, 15], description: 'Graphs and key features of exponential functions, transformations, geometric sequences, and comparing function types.' },
  { id: 'U7', number: 7, title: 'Investigating Data', standards: ['A.DSR.10', 'A.MM.1'], gadoeBlockDays: [9, 12], description: 'Center and spread, outliers, comparing distributions, scatter plots, lines of best fit, correlation, and causation.' },
  { id: 'U8', number: 8, title: 'Algebraic Connections to Geometric Concepts', standards: ['A.GSR.3', 'A.MM.1'], gadoeBlockDays: [6, 9], description: 'Distance, midpoint, parallel and perpendicular slopes, and perimeter and area on the coordinate plane.' },
  { id: 'U9', number: 9, title: 'Culminating Capstone', standards: ['A.MM.1'], gadoeBlockDays: [2, 4], description: 'Integrated modeling projects, semester review, and the semester assessment.' },
];

/** Prior-grade prerequisite skills, used by the diagnostic and by remediation. */
export const PREREQ_SKILLS: Skill[] = [
  { id: 'P.INT', unitId: 'P', name: 'Integer operations', description: 'Add, subtract, multiply and divide positive and negative numbers.', standards: [], prerequisites: [] },
  { id: 'P.FRAC', unitId: 'P', name: 'Fraction operations', description: 'Add, subtract, multiply and divide fractions.', standards: [], prerequisites: ['P.INT'] },
  { id: 'P.OOO', unitId: 'P', name: 'Order of operations', description: 'Evaluate numeric expressions in the correct order.', standards: [], prerequisites: ['P.INT'] },
  { id: 'P.EVAL', unitId: 'P', name: 'Evaluate expressions', description: 'Substitute values into algebraic expressions.', standards: [], prerequisites: ['P.OOO'] },
  { id: 'P.DIST', unitId: 'P', name: 'Distribute and combine like terms', description: 'Use the distributive property and combine like terms.', standards: [], prerequisites: ['P.INT'] },
  { id: 'P.SOLVE1', unitId: 'P', name: 'Solve linear equations', description: 'Solve one-variable linear equations, including multi-step equations.', standards: [], prerequisites: ['P.DIST'] },
  { id: 'P.INEQ1', unitId: 'P', name: 'Solve linear inequalities', description: 'Solve one-variable inequalities, flipping the sign when multiplying or dividing by a negative.', standards: [], prerequisites: ['P.SOLVE1'] },
  { id: 'P.COORD', unitId: 'P', name: 'Coordinate plane', description: 'Plot and read points in all four quadrants.', standards: [], prerequisites: [] },
  { id: 'P.SLOPE', unitId: 'P', name: 'Slope basics', description: 'Find slope as rise over run (Grade 8).', standards: [], prerequisites: ['P.COORD'] },
  { id: 'P.EXP', unitId: 'P', name: 'Exponents', description: 'Evaluate powers and use basic exponent meaning.', standards: [], prerequisites: ['P.INT'] },
  { id: 'P.ROOTS', unitId: 'P', name: 'Squares and square roots', description: 'Know perfect squares and cubes and their roots.', standards: [], prerequisites: ['P.EXP'] },
  { id: 'P.PCT', unitId: 'P', name: 'Percents', description: 'Convert percents to decimals and find percent of a number.', standards: [], prerequisites: ['P.FRAC'] },
];

const sk = (id: string, name: string, description: string, standards: string[], prerequisites: string[], essential = false): Skill => ({
  id,
  unitId: 'U' + id.slice(1, id.indexOf('.')),
  name,
  description,
  standards,
  prerequisites,
  essential,
});

export const SKILLS: Skill[] = [
  // Unit 1
  sk('S1.01', 'Function notation', 'Decide whether a relation is a function and read f(x) notation.', ['A.FGR.2.4'], ['P.COORD'], true),
  sk('S1.02', 'Evaluate linear functions', 'Find f(a) for a linear function.', ['A.FGR.2.4'], ['P.EVAL', 'S1.01'], true),
  sk('S1.03', 'Solve f(x) = c', 'Find the input that gives a stated output.', ['A.FGR.2.4'], ['P.SOLVE1', 'S1.02'], true),
  sk('S1.04', 'Interpret function notation in context', 'Explain what statements like f(3) = 45 mean in a situation.', ['A.FGR.2.4', 'A.MM.1.1'], ['S1.02']),
  sk('S1.05', 'Slope from points and tables', 'Calculate slope from two points or a table.', ['A.FGR.2.2'], ['P.SLOPE', 'P.INT'], true),
  sk('S1.06', 'Rate of change in context', 'Interpret slope as a rate of change with units.', ['A.FGR.2.2', 'A.MM.1.3'], ['S1.05']),
  sk('S1.07', 'Write linear functions', 'Write a linear function from a slope and point, two points, or a context.', ['A.FGR.2.2', 'A.FGR.2.4'], ['S1.05'], true),
  sk('S1.08', 'Forms of linear equations', 'Convert among slope-intercept, point-slope, and standard form.', ['A.FGR.2.2'], ['S1.07', 'P.SOLVE1']),
  sk('S1.09', 'Intercepts', 'Find and interpret x- and y-intercepts.', ['A.FGR.2.2'], ['S1.03']),
  sk('S1.10', 'Key features of linear graphs', 'Describe increasing/decreasing and positive/negative intervals.', ['A.FGR.2.2'], ['S1.09']),
  sk('S1.11', 'Domain and range of linear functions', 'Write domain and range in interval and set-builder notation.', ['A.FGR.2.3'], ['S1.10']),
  sk('S1.12', 'Explicit arithmetic sequences', 'Find the common difference and write a_n = a_1 + (n - 1)d.', ['A.FGR.2.1'], ['S1.02'], true),
  sk('S1.13', 'Recursive arithmetic sequences', 'Write and use recursive formulas, and convert to explicit form.', ['A.FGR.2.1'], ['S1.12']),
  sk('S1.14', 'Sequences as linear functions', 'Connect arithmetic sequences to linear functions with integer domains.', ['A.FGR.2.1'], ['S1.12', 'S1.07']),
  sk('S1.15', 'Linear modeling', 'Build and use a linear model for a real situation.', ['A.MM.1.1', 'A.MM.1.4', 'A.MM.1.5', 'A.FGR.2.2'], ['S1.07', 'S1.06']),
  sk('S1.16', 'Units and rates', 'Convert units and rates using conversion factors.', ['A.MM.1.3'], ['P.FRAC']),
  sk('S1.17', 'Parent functions', 'Identify parent functions and compare linear with nonlinear graphs.', ['A.FGR.2.5'], ['S1.10']),
  // Unit 2
  sk('S2.01', 'One-variable inequalities', 'Solve and graph one-variable linear inequalities.', ['A.PAR.4.1'], ['P.INEQ1'], true),
  sk('S2.02', 'Write two-variable inequalities', 'Write a linear inequality in two variables from a situation.', ['A.PAR.4.1', 'A.MM.1.1'], ['S1.15']),
  sk('S2.03', 'Graph linear inequalities', 'Graph with a solid or dashed boundary and correct shading; write the inequality for a graph.', ['A.PAR.4.1'], ['S1.07', 'S2.01'], true),
  sk('S2.04', 'Solutions and constraints', 'Decide whether a point is a solution, possible or not possible.', ['A.PAR.4.2'], ['S2.03']),
  sk('S2.05', 'Systems of inequalities', 'Find and test points in the solution region of a system.', ['A.PAR.4.3'], ['S2.03', 'S2.04'], true),
  sk('S2.06', 'Modeling with constraints', 'Model a situation with a system of inequalities.', ['A.PAR.4.3', 'A.MM.1.2'], ['S2.02', 'S2.05']),
  // Unit 3
  sk('S3.01', 'Rational vs irrational', 'Classify numbers as rational or irrational.', ['A.NR.5.2'], ['P.ROOTS']),
  sk('S3.02', 'Closure reasoning', 'Explain whether sums and products are rational or irrational.', ['A.NR.5.2'], ['S3.01']),
  sk('S3.03', 'Simplify square roots', 'Rewrite square roots in simplest radical form.', ['A.NR.5.1'], ['P.ROOTS'], true),
  sk('S3.04', 'Simplify cube roots', 'Rewrite cube roots in simplest form.', ['A.NR.5.1'], ['P.ROOTS']),
  sk('S3.05', 'Add and subtract radicals', 'Combine like radicals.', ['A.NR.5.1'], ['S3.03']),
  sk('S3.06', 'Multiply radicals', 'Multiply radical expressions and simplify.', ['A.NR.5.1'], ['S3.03', 'P.DIST']),
  sk('S3.07', 'Radicals with variables', 'Simplify radical expressions that contain variables.', ['A.NR.5.1'], ['S3.03', 'P.EXP']),
  // Unit 4
  sk('S4.01', 'Interpret quadratic expressions', 'Explain the meaning of terms, factors and coefficients in context.', ['A.PAR.6.1'], ['S1.04']),
  sk('S4.02', 'Add and subtract polynomials', 'Add and subtract polynomials of degree 2 or less.', ['A.PAR.6.2'], ['P.DIST']),
  sk('S4.03', 'Multiply polynomials', 'Multiply monomials by binomials and binomials by binomials.', ['A.PAR.6.2'], ['S4.02'], true),
  sk('S4.04', 'Special products', 'Square binomials and multiply conjugates.', ['A.PAR.6.2'], ['S4.03']),
  sk('S4.05', 'Factor out the GCF', 'Factor the greatest common factor from a polynomial.', ['A.PAR.6.2'], ['S4.03'], true),
  sk('S4.06', 'Factor x² + bx + c', 'Factor trinomials with leading coefficient 1.', ['A.PAR.6.2'], ['S4.03'], true),
  sk('S4.07', 'Factor ax² + bx + c', 'Factor trinomials with leading coefficient other than 1.', ['A.PAR.6.2'], ['S4.06']),
  sk('S4.08', 'Factor special patterns', 'Factor differences of squares and perfect square trinomials.', ['A.PAR.6.2'], ['S4.04', 'S4.06']),
  sk('S4.09', 'Zero product property', 'Solve quadratic equations by factoring.', ['A.PAR.6.3'], ['S4.06'], true),
  sk('S4.10', 'Solve by square roots', 'Solve quadratic equations by taking square roots.', ['A.PAR.6.3'], ['S3.03']),
  sk('S4.11', 'Complete the square', 'Complete the square to solve and to write vertex form.', ['A.PAR.6.3', 'A.FGR.7.8'], ['S4.04', 'S4.10']),
  sk('S4.12', 'Quadratic formula', 'Solve with the quadratic formula and use the discriminant.', ['A.PAR.6.3'], ['S3.03', 'S4.10'], true),
  sk('S4.13', 'Quadratics in context', 'Interpret solutions and constraints in a context.', ['A.PAR.6.3', 'A.PAR.6.4'], ['S4.09', 'S4.12']),
  sk('S4.14', 'Quadratic function notation', 'Build, evaluate and interpret quadratic functions.', ['A.FGR.7.1'], ['S1.02', 'P.EXP']),
  sk('S4.15', 'Key features of parabolas', 'Find the vertex, axis, intercepts, intervals and end behavior.', ['A.FGR.7.3'], ['S4.14', 'S4.09'], true),
  sk('S4.16', 'Domain and range of quadratics', 'Relate domain and range to the graph and the context.', ['A.FGR.7.4'], ['S4.15', 'S1.11']),
  sk('S4.17', 'Transformations of quadratics', 'Describe effects of f(x)+k, kf(x), f(kx) and f(x+k) and find k.', ['A.FGR.7.2'], ['S4.15']),
  sk('S4.18', 'Forms and maximum/minimum', 'Rewrite quadratics in vertex, factored and standard form to reveal properties.', ['A.FGR.7.5', 'A.FGR.7.8'], ['S4.11', 'S4.15']),
  sk('S4.19', 'Average rate of change', 'Calculate and compare average rates of change.', ['A.FGR.7.7'], ['S1.05', 'S4.14']),
  sk('S4.20', 'Create quadratic models', 'Write quadratic functions from data points or situations.', ['A.FGR.7.6', 'A.MM.1.2'], ['S4.15', 'S4.18']),
  sk('S4.21', 'Compare functions', 'Compare key features of functions given in different forms.', ['A.FGR.7.9'], ['S4.15', 'S1.10']),
  // Unit 5
  sk('S5.01', 'Exponent properties', 'Use product, quotient, power, zero and negative exponent rules.', ['A.PAR.8.1'], ['P.EXP'], true),
  sk('S5.02', 'Interpret exponential expressions', 'Identify initial value, growth or decay factor, and rate.', ['A.PAR.8.1'], ['S5.01', 'P.PCT'], true),
  sk('S5.03', 'Write exponential equations', 'Write y = a·bˣ for growth and decay situations.', ['A.PAR.8.3'], ['S5.02'], true),
  sk('S5.04', 'Solve exponential equations', 'Solve equations by rewriting with like bases.', ['A.PAR.8.2'], ['S5.01']),
  sk('S5.05', 'Exponential constraints', 'Decide whether data points are possible under an exponential model.', ['A.PAR.8.4'], ['S5.03']),
  sk('S5.06', 'Percent change and interest', 'Model percent growth, decay and compound interest.', ['A.PAR.8.2', 'A.PAR.8.3', 'A.MM.1.2'], ['S5.03']),
  // Unit 6
  sk('S6.01', 'Exponential function notation', 'Evaluate and interpret exponential functions.', ['A.FGR.9.1'], ['S5.03', 'S1.02']),
  sk('S6.02', 'Key features of exponential graphs', 'Find intercepts, asymptote, intervals and end behavior.', ['A.FGR.9.2'], ['S6.01'], true),
  sk('S6.03', 'Domain and range of exponentials', 'Write domain and range in interval and set-builder notation.', ['A.FGR.9.2'], ['S6.02', 'S1.11']),
  sk('S6.04', 'Linear vs exponential growth', 'Use differences and ratios to identify linear or exponential patterns.', ['A.FGR.9.2'], ['S6.01', 'S1.05']),
  sk('S6.05', 'Exponential rate of change', 'Calculate average rate of change of exponential functions.', ['A.FGR.9.2'], ['S4.19', 'S6.01']),
  sk('S6.06', 'Exponential transformations', 'Describe effects of f(x) + k and k·f(x) and find k.', ['A.FGR.9.3'], ['S6.02', 'S4.17']),
  sk('S6.07', 'Geometric sequences', 'Find the common ratio and write explicit and recursive formulas.', ['A.FGR.9.4'], ['S1.13', 'S5.01'], true),
  sk('S6.08', 'Geometric sequences as functions', 'Connect geometric sequences to exponential functions.', ['A.FGR.9.4'], ['S6.07', 'S6.01']),
  sk('S6.09', 'Compare function families', 'Compare linear, quadratic and exponential functions in different forms.', ['A.FGR.9.5'], ['S6.04', 'S4.21']),
  sk('S6.10', 'Exponential models', 'Use exponential functions to model and answer questions.', ['A.FGR.9.1', 'A.FGR.9.2', 'A.MM.1.2'], ['S6.01', 'S5.06']),
  // Unit 7
  sk('S7.01', 'Mean and median', 'Calculate and choose measures of center.', ['A.DSR.10.1'], ['P.FRAC']),
  sk('S7.02', 'Quartiles and IQR', 'Find the five-number summary and IQR; read box plots.', ['A.DSR.10.1'], ['S7.01'], true),
  sk('S7.03', 'Standard deviation', 'Calculate and interpret standard deviation.', ['A.DSR.10.1'], ['S7.01']),
  sk('S7.04', 'Shape and outliers', 'Describe shape and identify outliers with the 1.5·IQR rule.', ['A.DSR.10.2'], ['S7.02']),
  sk('S7.05', 'Compare distributions', 'Compare center and spread of two or more data sets.', ['A.DSR.10.1', 'A.DSR.10.2'], ['S7.02', 'S7.03', 'S7.04']),
  sk('S7.06', 'Scatter plots and association', 'Describe direction, strength and form of an association.', ['A.DSR.10.3'], ['P.COORD']),
  sk('S7.07', 'Interpret linear models', 'Interpret slope and intercept of a model in context.', ['A.DSR.10.4'], ['S1.06', 'S7.06']),
  sk('S7.08', 'Line of best fit and r', 'Use the regression line and correlation coefficient to predict and judge fit.', ['A.DSR.10.5'], ['S7.07'], true),
  sk('S7.09', 'Choose a model', 'Decide whether linear, quadratic or exponential best fits data.', ['A.DSR.10.6'], ['S6.09', 'S7.06']),
  sk('S7.10', 'Correlation vs causation', 'Distinguish association from cause and effect.', ['A.DSR.10.7'], ['S7.06']),
  // Unit 8
  sk('S8.01', 'Distance formula', 'Find distances between points on the coordinate plane.', ['A.GSR.3.2'], ['S3.03', 'P.COORD'], true),
  sk('S8.02', 'Midpoint formula', 'Find midpoints and missing endpoints.', ['A.GSR.3.2'], ['P.COORD']),
  sk('S8.03', 'Parallel and perpendicular slopes', 'Use slopes to identify and write parallel and perpendicular lines.', ['A.GSR.3.1'], ['S1.05', 'S1.07'], true),
  sk('S8.04', 'Perimeter and area on the plane', 'Find perimeter and area of polygons from coordinates.', ['A.GSR.3.1', 'A.GSR.3.2'], ['S8.01']),
  sk('S8.05', 'Classify figures', 'Use slope and distance to classify triangles and quadrilaterals.', ['A.GSR.3.1', 'A.GSR.3.2'], ['S8.01', 'S8.03']),
  sk('S8.06', 'Coordinate geometry in context', 'Solve real-world problems with distance, midpoint, slope, area and perimeter.', ['A.GSR.3.1', 'A.GSR.3.2', 'A.MM.1.1'], ['S8.04']),
];

// ---------------------------------------------------------------------------
// Lessons
// ---------------------------------------------------------------------------

interface LessonSeed {
  title: string;
  kind?: LessonKind;
  standards: string[];
  objectives: string[];
  taught: string[];
  assessed?: string[];
  review?: string[];
  minutes?: number;
  difficulty?: 1 | 2 | 3;
}

const UNIT_LESSONS: Record<string, LessonSeed[]> = {
  U1: [
    { title: 'Functions and Function Notation', standards: ['A.FGR.2.4', 'A.MP.6'], objectives: ['Decide whether a relation is a function.', 'Read and evaluate f(x) notation for linear functions.'], taught: ['S1.01', 'S1.02'], difficulty: 1 },
    { title: 'Using Function Notation: Inputs, Outputs and Context', standards: ['A.FGR.2.4', 'A.MM.1.1'], objectives: ['Solve f(x) = c for the input.', 'Interpret statements like f(4) = 60 in context.'], taught: ['S1.03', 'S1.04'], review: ['S1.02'] },
    { title: 'Slope as Rate of Change', standards: ['A.FGR.2.2', 'A.MM.1.3'], objectives: ['Find slope from two points, a table, or a graph.', 'Interpret slope as a rate of change with units.'], taught: ['S1.05', 'S1.06'], review: ['S1.02', 'S1.03'] },
    { title: 'Writing Linear Functions', standards: ['A.FGR.2.2', 'A.FGR.2.4'], objectives: ['Write a linear function from a slope and a point or from two points.', 'Convert among slope-intercept, point-slope and standard form.'], taught: ['S1.07', 'S1.08'], review: ['S1.05'] },
    { title: 'Graphs of Linear Functions and Key Features', standards: ['A.FGR.2.2'], objectives: ['Find and interpret intercepts.', 'Describe where a linear function is increasing, decreasing, positive and negative.'], taught: ['S1.09', 'S1.10'], review: ['S1.07', 'S1.03'] },
    { title: 'Domain and Range of Linear Functions', standards: ['A.FGR.2.3'], objectives: ['Write domain and range using interval and set-builder notation.', 'Choose a sensible domain and range for a real situation.'], taught: ['S1.11'], review: ['S1.10', 'S1.09'], difficulty: 2 },
    { title: 'Arithmetic Sequences', standards: ['A.FGR.2.1', 'A.MP.8'], objectives: ['Find the common difference of an arithmetic sequence.', 'Write and use explicit and recursive formulas.'], taught: ['S1.12', 'S1.13'], review: ['S1.02', 'S1.05'] },
    { title: 'Arithmetic Sequences as Linear Functions', standards: ['A.FGR.2.1', 'A.FGR.2.4'], objectives: ['Write an arithmetic sequence as a linear function with an integer domain.', 'Graph sequences as discrete points.'], taught: ['S1.14'], review: ['S1.12', 'S1.07'], difficulty: 2 },
    { title: 'Modeling with Linear Functions', standards: ['A.MM.1.1', 'A.MM.1.3', 'A.MM.1.4', 'A.MM.1.5', 'A.FGR.2.2'], objectives: ['Build a linear model from a situation, a table or two data points.', 'Convert units and rates and use them in models.'], taught: ['S1.15', 'S1.16'], review: ['S1.06', 'S1.07', 'S1.11'], difficulty: 2 },
    { title: 'Parent Functions: Linear vs Nonlinear', standards: ['A.FGR.2.5'], objectives: ['Identify the six parent functions by their graphs and equations.', 'Explain how linear graphs differ from nonlinear graphs.'], taught: ['S1.17'], review: ['S1.10', 'S1.11'] },
    { title: 'Unit 1 Review', kind: 'unit-review', standards: ['A.FGR.2.1', 'A.FGR.2.2', 'A.FGR.2.3', 'A.FGR.2.4', 'A.FGR.2.5', 'A.MM.1.3'], objectives: ['Review every Unit 1 skill and fix weak spots before the assessment.'], taught: [], assessed: ['S1.01', 'S1.02', 'S1.03', 'S1.04', 'S1.05', 'S1.06', 'S1.07', 'S1.08', 'S1.09', 'S1.10', 'S1.11', 'S1.12', 'S1.13', 'S1.14', 'S1.15', 'S1.16', 'S1.17'] },
    { title: 'Unit 1 Assessment', kind: 'unit-assessment', standards: ['A.FGR.2.1', 'A.FGR.2.2', 'A.FGR.2.3', 'A.FGR.2.4', 'A.FGR.2.5', 'A.MM.1.3'], objectives: ['Show mastery of modeling linear functions.'], taught: [], assessed: ['S1.01', 'S1.02', 'S1.03', 'S1.04', 'S1.05', 'S1.06', 'S1.07', 'S1.08', 'S1.09', 'S1.10', 'S1.11', 'S1.12', 'S1.13', 'S1.14', 'S1.15', 'S1.16', 'S1.17'], minutes: 45 },
  ],
  U2: [
    { title: 'Inequalities in One and Two Variables', standards: ['A.PAR.4.1'], objectives: ['Solve one-variable inequalities, including flipping the symbol.', 'Write linear inequalities in two variables from situations.'], taught: ['S2.01', 'S2.02'], review: ['S1.07', 'S1.15'] },
    { title: 'Graphing Linear Inequalities', standards: ['A.PAR.4.1'], objectives: ['Graph a linear inequality with the correct boundary line and shading.', 'Write the inequality shown by a graph.'], taught: ['S2.03'], review: ['S1.07', 'S1.09'], difficulty: 2 },
    { title: 'Constraints: Possible or Not Possible?', standards: ['A.PAR.4.2', 'A.MM.1.1'], objectives: ['Decide whether points are solutions.', 'Interpret solutions as possible or not possible in context.'], taught: ['S2.04'], review: ['S2.03', 'S1.04'] },
    { title: 'Systems of Linear Inequalities', standards: ['A.PAR.4.3', 'A.MM.1.2'], objectives: ['Find the solution region of a system by graphing.', 'Model situations with systems of inequalities.'], taught: ['S2.05', 'S2.06'], review: ['S2.03', 'S2.04'], difficulty: 2 },
    { title: 'Unit 2 Review', kind: 'unit-review', standards: ['A.PAR.4.1', 'A.PAR.4.2', 'A.PAR.4.3'], objectives: ['Review every Unit 2 skill.'], taught: [], assessed: ['S2.01', 'S2.02', 'S2.03', 'S2.04', 'S2.05', 'S2.06'] },
    { title: 'Unit 2 Assessment', kind: 'unit-assessment', standards: ['A.PAR.4.1', 'A.PAR.4.2', 'A.PAR.4.3'], objectives: ['Show mastery of linear inequalities.'], taught: [], assessed: ['S2.01', 'S2.02', 'S2.03', 'S2.04', 'S2.05', 'S2.06'], minutes: 40 },
  ],
  U3: [
    { title: 'Rational and Irrational Numbers', standards: ['A.NR.5.2', 'A.MP.3'], objectives: ['Classify numbers as rational or irrational.', 'Explain why sums and products of rational and irrational numbers are rational or irrational.'], taught: ['S3.01', 'S3.02'], review: ['S1.02'] },
    { title: 'Simplifying Square Roots and Cube Roots', standards: ['A.NR.5.1'], objectives: ['Rewrite square roots in simplest radical form.', 'Simplify cube roots.'], taught: ['S3.03', 'S3.04'], review: ['S3.01'] },
    { title: 'Operations with Radicals', standards: ['A.NR.5.1', 'A.NR.5.2'], objectives: ['Add, subtract and multiply radical expressions.', 'Simplify radical expressions with variables.'], taught: ['S3.05', 'S3.06', 'S3.07'], review: ['S3.03', 'S3.02'], difficulty: 2 },
    { title: 'Unit 3 Review', kind: 'unit-review', standards: ['A.NR.5.1', 'A.NR.5.2'], objectives: ['Review every Unit 3 skill.'], taught: [], assessed: ['S3.01', 'S3.02', 'S3.03', 'S3.04', 'S3.05', 'S3.06', 'S3.07'] },
    { title: 'Unit 3 Assessment', kind: 'unit-assessment', standards: ['A.NR.5.1', 'A.NR.5.2'], objectives: ['Show mastery of rational and irrational numbers.'], taught: [], assessed: ['S3.01', 'S3.02', 'S3.03', 'S3.04', 'S3.05', 'S3.06', 'S3.07'], minutes: 35 },
  ],
  U4: [
    { title: 'Interpreting Quadratic Expressions', standards: ['A.PAR.6.1', 'A.MM.1.5'], objectives: ['Name the parts of a quadratic expression.', 'Explain what terms, factors and coefficients mean in context.'], taught: ['S4.01'], review: ['S1.04', 'S3.03'] },
    { title: 'Adding, Subtracting and Multiplying Polynomials', standards: ['A.PAR.6.2'], objectives: ['Add and subtract polynomials.', 'Multiply a monomial by a binomial and a binomial by a binomial.'], taught: ['S4.02', 'S4.03'], review: ['S4.01'] },
    { title: 'Special Products', standards: ['A.PAR.6.2', 'A.MP.7'], objectives: ['Square a binomial.', 'Multiply conjugates to get a difference of squares.'], taught: ['S4.04'], review: ['S4.03'] },
    { title: 'Factoring: GCF and x² + bx + c', standards: ['A.PAR.6.2'], objectives: ['Factor out the greatest common factor.', 'Factor trinomials with leading coefficient 1.'], taught: ['S4.05', 'S4.06'], review: ['S4.03'], difficulty: 2 },
    { title: 'Factoring ax² + bx + c and Special Patterns', standards: ['A.PAR.6.2', 'A.MP.7'], objectives: ['Factor trinomials with leading coefficient other than 1.', 'Recognize and factor differences of squares and perfect square trinomials.'], taught: ['S4.07', 'S4.08'], review: ['S4.06', 'S4.04'], difficulty: 3 },
    { title: 'Solving Quadratics by Factoring', standards: ['A.PAR.6.3'], objectives: ['Use the zero product property.', 'Explain what solutions mean in context.'], taught: ['S4.09'], review: ['S4.06', 'S4.07'], difficulty: 2 },
    { title: 'Solving Quadratics with Square Roots', standards: ['A.PAR.6.3', 'A.NR.5.1'], objectives: ['Solve equations of the form a(x - h)² = k.', 'Give exact and approximate solutions.'], taught: ['S4.10'], review: ['S3.03', 'S4.09'] },
    { title: 'Completing the Square', standards: ['A.PAR.6.3', 'A.FGR.7.8'], objectives: ['Complete the square to solve quadratic equations.', 'Rewrite a quadratic in vertex form.'], taught: ['S4.11'], review: ['S4.04', 'S4.10'], difficulty: 3 },
    { title: 'The Quadratic Formula and the Discriminant', standards: ['A.PAR.6.3'], objectives: ['Solve any quadratic equation with the quadratic formula.', 'Use the discriminant to count real solutions.'], taught: ['S4.12'], review: ['S3.03', 'S4.10'], difficulty: 2 },
    { title: 'Choosing a Method and Quadratic Constraints', standards: ['A.PAR.6.3', 'A.PAR.6.4', 'A.MM.1.1'], objectives: ['Choose an efficient method for solving.', 'Decide whether solutions are possible in context.'], taught: ['S4.13'], review: ['S4.09', 'S4.10', 'S4.12'], difficulty: 2 },
    { title: 'Checkpoint: Units 1-4 Cumulative Review', kind: 'checkpoint', standards: ['A.FGR.2.4', 'A.PAR.4.1', 'A.NR.5.1', 'A.PAR.6.2', 'A.PAR.6.3'], objectives: ['Review earlier units and check progress on quadratic equations.'], taught: [], assessed: ['S1.07', 'S2.03', 'S3.03', 'S4.03', 'S4.06', 'S4.09', 'S4.10', 'S4.12'] },
    { title: 'Quadratic Functions and Function Notation', standards: ['A.FGR.7.1'], objectives: ['Evaluate quadratic functions.', 'Interpret function notation for quadratic models.'], taught: ['S4.14'], review: ['S1.02', 'S1.04'] },
    { title: 'Graphing Quadratics: Key Features', standards: ['A.FGR.7.3'], objectives: ['Find the vertex, axis of symmetry and intercepts.', 'Describe intervals of increase, decrease, and end behavior.'], taught: ['S4.15'], review: ['S4.09', 'S1.10'], difficulty: 2 },
    { title: 'Domain and Range of Quadratic Functions', standards: ['A.FGR.7.4', 'A.FGR.7.3'], objectives: ['Write domain and range of a quadratic function.', 'Restrict domain and range to fit a context.'], taught: ['S4.16'], review: ['S1.11', 'S4.15'] },
    { title: 'Transformations of Quadratic Functions', standards: ['A.FGR.7.2'], objectives: ['Describe the effect of f(x) + k, k·f(x), f(kx), and f(x + k).', 'Find k from a pair of graphs.'], taught: ['S4.17'], review: ['S4.15'], difficulty: 2 },
    { title: 'Forms of Quadratic Functions and Max/Min', standards: ['A.FGR.7.5', 'A.FGR.7.8'], objectives: ['Convert among standard, vertex and factored form.', 'Find and interpret maximum or minimum values in context.'], taught: ['S4.18'], review: ['S4.11', 'S4.15'], difficulty: 3 },
    { title: 'Average Rate of Change', standards: ['A.FGR.7.7'], objectives: ['Calculate average rate of change over an interval.', 'Compare quadratic and linear rates of change.'], taught: ['S4.19'], review: ['S1.05', 'S4.14'] },
    { title: 'Creating Quadratic Models', standards: ['A.FGR.7.6', 'A.MM.1.2', 'A.MM.1.4'], objectives: ['Write quadratic functions from points, area situations and projectile motion.', 'Graph models with labels and scales.'], taught: ['S4.20'], review: ['S4.18', 'S4.13'], difficulty: 3 },
    { title: 'Comparing Functions Represented Differently', standards: ['A.FGR.7.9'], objectives: ['Compare key features of functions given as graphs, tables, equations and descriptions.'], taught: ['S4.21'], review: ['S4.15', 'S1.10'], difficulty: 2 },
    { title: 'Unit 4 Review', kind: 'unit-review', standards: ['A.PAR.6.1', 'A.PAR.6.2', 'A.PAR.6.3', 'A.PAR.6.4', 'A.FGR.7.1', 'A.FGR.7.2', 'A.FGR.7.3', 'A.FGR.7.4', 'A.FGR.7.5', 'A.FGR.7.6', 'A.FGR.7.7', 'A.FGR.7.8', 'A.FGR.7.9'], objectives: ['Review every Unit 4 skill.'], taught: [], assessed: ['S4.01', 'S4.02', 'S4.03', 'S4.04', 'S4.05', 'S4.06', 'S4.07', 'S4.08', 'S4.09', 'S4.10', 'S4.11', 'S4.12', 'S4.13', 'S4.14', 'S4.15', 'S4.16', 'S4.17', 'S4.18', 'S4.19', 'S4.20', 'S4.21'] },
    { title: 'Unit 4 Assessment', kind: 'unit-assessment', standards: ['A.PAR.6.1', 'A.PAR.6.2', 'A.PAR.6.3', 'A.PAR.6.4', 'A.FGR.7.1', 'A.FGR.7.2', 'A.FGR.7.3', 'A.FGR.7.4', 'A.FGR.7.5', 'A.FGR.7.6', 'A.FGR.7.7', 'A.FGR.7.8', 'A.FGR.7.9'], objectives: ['Show mastery of quadratic expressions, equations and functions.'], taught: [], assessed: ['S4.01', 'S4.02', 'S4.03', 'S4.04', 'S4.05', 'S4.06', 'S4.07', 'S4.08', 'S4.09', 'S4.10', 'S4.11', 'S4.12', 'S4.13', 'S4.14', 'S4.15', 'S4.16', 'S4.17', 'S4.18', 'S4.19', 'S4.20', 'S4.21'], minutes: 50 },
  ],
  U5: [
    { title: 'Properties of Exponents', standards: ['A.PAR.8.1', 'A.MP.7'], objectives: ['Use the product, quotient and power rules.', 'Evaluate zero and negative exponents.'], taught: ['S5.01'], review: ['S4.03'] },
    { title: 'Interpreting Exponential Expressions', standards: ['A.PAR.8.1', 'A.MM.1.5'], objectives: ['Identify the initial value and growth or decay factor.', 'Convert between growth factor and percent rate.'], taught: ['S5.02'], review: ['S5.01', 'S4.01'] },
    { title: 'Writing Exponential Growth and Decay Equations', standards: ['A.PAR.8.3'], objectives: ['Write y = a·bˣ from a situation or two points.', 'Graph exponential equations with labels and scales.'], taught: ['S5.03'], review: ['S5.02', 'S1.15'], difficulty: 2 },
    { title: 'Solving Exponential Equations', standards: ['A.PAR.8.2'], objectives: ['Solve exponential equations by rewriting both sides with a common base.'], taught: ['S5.04'], review: ['S5.01'], difficulty: 2 },
    { title: 'Exponential Constraints', standards: ['A.PAR.8.4'], objectives: ['Decide whether data points are possible under an exponential model.'], taught: ['S5.05'], review: ['S5.03', 'S2.04'] },
    { title: 'Percent Growth, Decay and Compound Interest', standards: ['A.PAR.8.2', 'A.PAR.8.3', 'A.MM.1.2', 'A.MM.1.3'], objectives: ['Model percent change with exponential equations.', 'Use the compound interest formula.'], taught: ['S5.06'], review: ['S5.03', 'S5.02'], difficulty: 2 },
    { title: 'Unit 5 Review', kind: 'unit-review', standards: ['A.PAR.8.1', 'A.PAR.8.2', 'A.PAR.8.3', 'A.PAR.8.4'], objectives: ['Review every Unit 5 skill.'], taught: [], assessed: ['S5.01', 'S5.02', 'S5.03', 'S5.04', 'S5.05', 'S5.06'] },
    { title: 'Unit 5 Assessment', kind: 'unit-assessment', standards: ['A.PAR.8.1', 'A.PAR.8.2', 'A.PAR.8.3', 'A.PAR.8.4'], objectives: ['Show mastery of exponential expressions and equations.'], taught: [], assessed: ['S5.01', 'S5.02', 'S5.03', 'S5.04', 'S5.05', 'S5.06'], minutes: 40 },
  ],
  U6: [
    { title: 'Exponential Functions and Function Notation', standards: ['A.FGR.9.1'], objectives: ['Evaluate exponential functions.', 'Interpret statements in function notation.'], taught: ['S6.01'], review: ['S5.03', 'S1.04'] },
    { title: 'Graphing Exponential Functions', standards: ['A.FGR.9.2'], objectives: ['Graph exponential functions and identify the asymptote, intercept and end behavior.'], taught: ['S6.02'], review: ['S6.01'], difficulty: 2 },
    { title: 'Domain, Range and Intervals of Exponential Functions', standards: ['A.FGR.9.2'], objectives: ['Write domain and range in interval and set-builder notation.', 'Describe increasing, decreasing, positive and negative intervals.'], taught: ['S6.03'], review: ['S1.11', 'S4.16'] },
    { title: 'Linear vs Exponential Growth', standards: ['A.FGR.9.2', 'A.MP.8'], objectives: ['Use first differences and ratios to identify linear and exponential patterns.'], taught: ['S6.04'], review: ['S1.05', 'S5.02'] },
    { title: 'Average Rate of Change of Exponential Functions', standards: ['A.FGR.9.2'], objectives: ['Calculate average rate of change over intervals.', 'Explain why exponential rates of change keep growing.'], taught: ['S6.05'], review: ['S4.19'] },
    { title: 'Transformations of Exponential Functions', standards: ['A.FGR.9.3'], objectives: ['Describe the effects of f(x) + k and k·f(x).', 'Find k from graphs.'], taught: ['S6.06'], review: ['S4.17', 'S6.02'], difficulty: 2 },
    { title: 'Geometric Sequences', standards: ['A.FGR.9.4'], objectives: ['Find the common ratio.', 'Write explicit and recursive formulas.'], taught: ['S6.07'], review: ['S1.12', 'S1.13'] },
    { title: 'Geometric Sequences as Exponential Functions', standards: ['A.FGR.9.4'], objectives: ['Write geometric sequences as exponential functions.', 'Compare arithmetic and geometric sequences.'], taught: ['S6.08'], review: ['S6.07', 'S1.14'], difficulty: 2 },
    { title: 'Comparing Linear, Quadratic and Exponential Functions', standards: ['A.FGR.9.5', 'A.FGR.7.9'], objectives: ['Compare functions represented in different ways.', 'Explain why exponential growth eventually exceeds linear and quadratic growth.'], taught: ['S6.09'], review: ['S4.21', 'S6.04'], difficulty: 2 },
    { title: 'Modeling with Exponential Functions', standards: ['A.FGR.9.1', 'A.FGR.9.2', 'A.MM.1.2', 'A.MM.1.4'], objectives: ['Build exponential models and use them to answer questions in context.'], taught: ['S6.10'], review: ['S5.06', 'S6.02'], difficulty: 3 },
    { title: 'Cumulative Review: Units 1-6', kind: 'cumulative-review', standards: ['A.FGR.2.2', 'A.PAR.4.3', 'A.NR.5.1', 'A.PAR.6.3', 'A.FGR.7.3', 'A.PAR.8.3', 'A.FGR.9.2'], objectives: ['Keep earlier skills strong with mixed review.'], taught: [], assessed: ['S1.07', 'S1.11', 'S2.05', 'S3.05', 'S4.12', 'S4.15', 'S5.03', 'S6.02'] },
    { title: 'Unit 6 Review', kind: 'unit-review', standards: ['A.FGR.9.1', 'A.FGR.9.2', 'A.FGR.9.3', 'A.FGR.9.4', 'A.FGR.9.5'], objectives: ['Review every Unit 6 skill.'], taught: [], assessed: ['S6.01', 'S6.02', 'S6.03', 'S6.04', 'S6.05', 'S6.06', 'S6.07', 'S6.08', 'S6.09', 'S6.10'] },
    { title: 'Unit 6 Assessment', kind: 'unit-assessment', standards: ['A.FGR.9.1', 'A.FGR.9.2', 'A.FGR.9.3', 'A.FGR.9.4', 'A.FGR.9.5'], objectives: ['Show mastery of exponential functions.'], taught: [], assessed: ['S6.01', 'S6.02', 'S6.03', 'S6.04', 'S6.05', 'S6.06', 'S6.07', 'S6.08', 'S6.09', 'S6.10'], minutes: 45 },
  ],
  U7: [
    { title: 'Statistical Questions, Mean and Median', standards: ['A.DSR.10.1', 'A.MM.1.5'], objectives: ['Write statistical investigative questions.', 'Calculate mean and median and choose the better measure.'], taught: ['S7.01'], review: ['P.FRAC'] },
    { title: 'Quartiles, IQR and Box Plots', standards: ['A.DSR.10.1'], objectives: ['Find the five-number summary and interquartile range.', 'Read and build box plots.'], taught: ['S7.02'], review: ['S7.01'] },
    { title: 'Standard Deviation', standards: ['A.DSR.10.1'], objectives: ['Calculate standard deviation for small data sets.', 'Interpret standard deviation as typical distance from the mean.'], taught: ['S7.03'], review: ['S7.01'], difficulty: 2 },
    { title: 'Shape and Outliers', standards: ['A.DSR.10.2'], objectives: ['Describe the shape of a distribution.', 'Identify outliers with the 1.5·IQR rule and explain their effect.'], taught: ['S7.04'], review: ['S7.02'] },
    { title: 'Comparing Distributions', standards: ['A.DSR.10.1', 'A.DSR.10.2', 'A.MP.3'], objectives: ['Compare two data sets using appropriate center and spread.'], taught: ['S7.05'], review: ['S7.03', 'S7.04'], difficulty: 2 },
    { title: 'Scatter Plots and Association', standards: ['A.DSR.10.3'], objectives: ['Plot bivariate data.', 'Describe direction, strength and form.'], taught: ['S7.06'], review: ['S1.05'] },
    { title: 'Linear Models: Slope and Intercept in Context', standards: ['A.DSR.10.4'], objectives: ['Interpret the slope and intercept of a linear model for data.'], taught: ['S7.07'], review: ['S1.06', 'S7.06'] },
    { title: 'Lines of Best Fit and Correlation', standards: ['A.DSR.10.5', 'A.MP.5'], objectives: ['Use a regression line to make predictions.', 'Interpret the correlation coefficient r.'], taught: ['S7.08'], review: ['S7.07'], difficulty: 2 },
    { title: 'Choosing Models; Correlation vs Causation', standards: ['A.DSR.10.6', 'A.DSR.10.7'], objectives: ['Choose a linear, quadratic or exponential model from a graph.', 'Distinguish correlation from causation.'], taught: ['S7.09', 'S7.10'], review: ['S6.09', 'S7.08'] },
    { title: 'Unit 7 Review', kind: 'unit-review', standards: ['A.DSR.10.1', 'A.DSR.10.2', 'A.DSR.10.3', 'A.DSR.10.4', 'A.DSR.10.5', 'A.DSR.10.6', 'A.DSR.10.7'], objectives: ['Review every Unit 7 skill.'], taught: [], assessed: ['S7.01', 'S7.02', 'S7.03', 'S7.04', 'S7.05', 'S7.06', 'S7.07', 'S7.08', 'S7.09', 'S7.10'] },
    { title: 'Unit 7 Assessment', kind: 'unit-assessment', standards: ['A.DSR.10.1', 'A.DSR.10.2', 'A.DSR.10.3', 'A.DSR.10.4', 'A.DSR.10.5', 'A.DSR.10.6', 'A.DSR.10.7'], objectives: ['Show mastery of data analysis.'], taught: [], assessed: ['S7.01', 'S7.02', 'S7.03', 'S7.04', 'S7.05', 'S7.06', 'S7.07', 'S7.08', 'S7.09', 'S7.10'], minutes: 45 },
  ],
  U8: [
    { title: 'The Distance Formula', standards: ['A.GSR.3.2', 'A.NR.5.1'], objectives: ['Find the distance between two points.', 'Give exact (radical) and decimal answers.'], taught: ['S8.01'], review: ['S3.03'] },
    { title: 'The Midpoint Formula', standards: ['A.GSR.3.2'], objectives: ['Find the midpoint of a segment.', 'Find a missing endpoint.'], taught: ['S8.02'], review: ['S8.01'] },
    { title: 'Parallel and Perpendicular Lines', standards: ['A.GSR.3.1'], objectives: ['Identify parallel and perpendicular lines by slope.', 'Write equations of parallel and perpendicular lines.'], taught: ['S8.03'], review: ['S1.05', 'S1.07'], difficulty: 2 },
    { title: 'Perimeter and Area on the Coordinate Plane', standards: ['A.GSR.3.1', 'A.GSR.3.2'], objectives: ['Find perimeter and area of triangles and quadrilaterals from vertices.'], taught: ['S8.04'], review: ['S8.01', 'S3.05'], difficulty: 2 },
    { title: 'Classifying Figures with Coordinates', standards: ['A.GSR.3.1', 'A.GSR.3.2', 'A.MP.3'], objectives: ['Use slope and distance to classify triangles and quadrilaterals.'], taught: ['S8.05'], review: ['S8.03', 'S8.01'], difficulty: 3 },
    { title: 'Coordinate Geometry in the Real World', standards: ['A.GSR.3.1', 'A.GSR.3.2', 'A.MM.1.1', 'A.MM.1.3'], objectives: ['Solve real-world problems with distance, midpoint, slope, area and perimeter.'], taught: ['S8.06'], review: ['S8.02', 'S8.04'], difficulty: 2 },
    { title: 'Unit 8 Review', kind: 'unit-review', standards: ['A.GSR.3.1', 'A.GSR.3.2'], objectives: ['Review every Unit 8 skill.'], taught: [], assessed: ['S8.01', 'S8.02', 'S8.03', 'S8.04', 'S8.05', 'S8.06'] },
    { title: 'Unit 8 Assessment', kind: 'unit-assessment', standards: ['A.GSR.3.1', 'A.GSR.3.2'], objectives: ['Show mastery of coordinate geometry.'], taught: [], assessed: ['S8.01', 'S8.02', 'S8.03', 'S8.04', 'S8.05', 'S8.06'], minutes: 40 },
  ],
  U9: [
    { title: 'Capstone: Planning a Budget with Lines and Constraints', kind: 'capstone', standards: ['A.MM.1.1', 'A.MM.1.2', 'A.MM.1.4', 'A.FGR.2.2', 'A.PAR.4.3'], objectives: ['Model a real budget decision with linear functions and inequalities.'], taught: [], assessed: ['S1.15', 'S2.06', 'S2.05'], difficulty: 3 },
    { title: 'Capstone: Launches, Growth and Decay', kind: 'capstone', standards: ['A.MM.1.1', 'A.MM.1.2', 'A.FGR.7.6', 'A.FGR.9.2', 'A.PAR.8.3'], objectives: ['Model a launch with a quadratic and a population with an exponential function.'], taught: [], assessed: ['S4.20', 'S4.13', 'S6.10', 'S5.06'], difficulty: 3 },
    { title: 'Capstone: Investigating Data', kind: 'capstone', standards: ['A.MM.1.1', 'A.MM.1.5', 'A.DSR.10.1', 'A.DSR.10.5', 'A.GSR.3.2'], objectives: ['Answer a statistical question with data and connect to coordinate geometry.'], taught: [], assessed: ['S7.05', 'S7.08', 'S7.10', 'S8.06'], difficulty: 3 },
    { title: 'Semester Review: Units 1-4', kind: 'semester-review', standards: ['A.FGR.2.2', 'A.FGR.2.3', 'A.PAR.4.3', 'A.NR.5.1', 'A.PAR.6.3', 'A.FGR.7.3', 'A.FGR.7.8'], objectives: ['Review linear functions, inequalities, radicals and quadratics.'], taught: [], assessed: ['S1.07', 'S1.11', 'S1.12', 'S2.05', 'S3.05', 'S4.06', 'S4.12', 'S4.15', 'S4.18'] },
    { title: 'Semester Review: Units 5-8', kind: 'semester-review', standards: ['A.PAR.8.2', 'A.FGR.9.2', 'A.FGR.9.4', 'A.DSR.10.1', 'A.DSR.10.5', 'A.GSR.3.1', 'A.GSR.3.2'], objectives: ['Review exponentials, data and coordinate geometry.'], taught: [], assessed: ['S5.04', 'S5.06', 'S6.02', 'S6.07', 'S7.02', 'S7.08', 'S8.01', 'S8.03'] },
    { title: 'Semester Assessment', kind: 'semester-assessment', standards: ['A.FGR.2.1', 'A.FGR.2.2', 'A.FGR.2.3', 'A.FGR.2.4', 'A.PAR.4.1', 'A.PAR.4.3', 'A.NR.5.1', 'A.NR.5.2', 'A.PAR.6.2', 'A.PAR.6.3', 'A.FGR.7.3', 'A.FGR.7.8', 'A.PAR.8.2', 'A.PAR.8.3', 'A.FGR.9.2', 'A.FGR.9.4', 'A.DSR.10.1', 'A.DSR.10.5', 'A.GSR.3.1', 'A.GSR.3.2'], objectives: ['Show what you learned this semester.'], taught: [], assessed: ['S1.02', 'S1.07', 'S1.11', 'S1.12', 'S2.03', 'S2.05', 'S3.03', 'S3.05', 'S4.06', 'S4.12', 'S4.15', 'S4.18', 'S5.03', 'S5.04', 'S6.02', 'S6.07', 'S7.02', 'S7.08', 'S8.01', 'S8.03'], minutes: 60 },
  ],
};

function buildLessons(): LessonMeta[] {
  const out: LessonMeta[] = [];
  let day = 0;
  let prevId: string | null = null;
  for (const unit of UNITS) {
    const seeds = UNIT_LESSONS[unit.id];
    seeds.forEach((s, i) => {
      day++;
      const id = `${unit.id}L${String(i + 1).padStart(2, '0')}`;
      const kind = s.kind ?? 'lesson';
      out.push({
        id,
        unitId: unit.id,
        number: i + 1,
        day,
        week: Math.ceil(day / 5),
        title: s.title,
        kind,
        standards: s.standards,
        objectives: s.objectives,
        prerequisites: prevId ? [prevId] : [],
        skillsTaught: s.taught,
        skillsAssessed: s.assessed ?? s.taught,
        reviewSkills: s.review ?? [],
        durationMinutes: s.minutes ?? (kind === 'lesson' ? 40 : 35),
        difficulty: s.difficulty ?? 1,
      });
      prevId = id;
    });
  }
  return out;
}

export const LESSONS: LessonMeta[] = buildLessons();
export const LESSON_BY_ID: ReadonlyMap<string, LessonMeta> = new Map(LESSONS.map((l) => [l.id, l]));
export const SKILL_BY_ID: ReadonlyMap<string, Skill> = new Map([...PREREQ_SKILLS, ...SKILLS].map((s) => [s.id, s]));
export const UNIT_BY_ID: ReadonlyMap<string, Unit> = new Map(UNITS.map((u) => [u.id, u]));
export const SEMESTER_DAYS = 90;
export const SEMESTER_WEEKS = 18;
