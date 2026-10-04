/**
 * Georgia K-12 Mathematics Standards (adopted 2021, implemented 2023-24):
 * Algebra: Concepts & Connections.
 *
 * Text transcribed from the GaDOE standards document "2021 Algebra: Concepts &
 * Connections Standards" and cross-checked against the GaDOE "HS Algebra
 * Mathematics Curriculum Map (NEW 2023)". See docs/STANDARDS_SOURCES.md.
 */

export type BigIdea = 'MP' | 'MM' | 'NR' | 'PAR' | 'FGR' | 'GSR' | 'DSR';

export interface Standard {
  code: string;
  /** Parent standard code for expectations, e.g. A.FGR.2 for A.FGR.2.3 */
  parent?: string;
  bigIdea: BigIdea;
  text: string;
}

export const BIG_IDEAS: Record<BigIdea, string> = {
  MP: 'Mathematical Practices',
  MM: 'Mathematical Modeling',
  NR: 'Numerical Reasoning',
  PAR: 'Patterning & Algebraic Reasoning',
  FGR: 'Functional & Graphical Reasoning',
  GSR: 'Geometric & Spatial Reasoning',
  DSR: 'Data & Statistical Reasoning',
};

export const STANDARDS: Standard[] = [
  // Mathematical Practices (apply to every unit)
  { code: 'A.MP.1', bigIdea: 'MP', text: 'Make sense of problems and persevere in solving them.' },
  { code: 'A.MP.2', bigIdea: 'MP', text: 'Reason abstractly and quantitatively.' },
  { code: 'A.MP.3', bigIdea: 'MP', text: 'Construct viable arguments and critique the reasoning of others.' },
  { code: 'A.MP.4', bigIdea: 'MP', text: 'Model with mathematics.' },
  { code: 'A.MP.5', bigIdea: 'MP', text: 'Use appropriate tools strategically.' },
  { code: 'A.MP.6', bigIdea: 'MP', text: 'Attend to precision.' },
  { code: 'A.MP.7', bigIdea: 'MP', text: 'Look for and make use of structure.' },
  { code: 'A.MP.8', bigIdea: 'MP', text: 'Look for and express regularity in repeated reasoning.' },

  // Mathematical Modeling
  { code: 'A.MM.1', bigIdea: 'MM', text: 'Apply mathematics to real-life situations; model real-life phenomena using mathematics.' },
  { code: 'A.MM.1.1', parent: 'A.MM.1', bigIdea: 'MM', text: 'Explain applicable, mathematical problems using a mathematical model.' },
  { code: 'A.MM.1.2', parent: 'A.MM.1', bigIdea: 'MM', text: 'Create mathematical models to explain phenomena that exist in the natural sciences, social sciences, liberal arts, fine and performing arts, and/or humanities domains.' },
  { code: 'A.MM.1.3', parent: 'A.MM.1', bigIdea: 'MM', text: 'Use units of measure (linear, area, capacity, rates, and time) as a way to make sense of conceptual problems; identify, use, and record appropriate units of measure within the given framework, within data displays, and on graphs; convert units and rates using proportional reasoning given a conversion factor; use units within multi-step problems and formulas; interpret units of input and resulting units of output.' },
  { code: 'A.MM.1.4', parent: 'A.MM.1', bigIdea: 'MM', text: 'Use various mathematical representations and structures with this information to represent and solve real-life problems.' },
  { code: 'A.MM.1.5', parent: 'A.MM.1', bigIdea: 'MM', text: 'Define appropriate quantities for the purpose of descriptive modeling.' },

  // Unit 1: Modeling Linear Functions
  { code: 'A.FGR.2', bigIdea: 'FGR', text: 'Construct and interpret arithmetic sequences as functions, algebraically and graphically, to model and explain real-life phenomena. Use formal notation to represent linear functions and the key characteristics of graphs of linear functions, and informally compare linear and non-linear functions using parent graphs.' },
  { code: 'A.FGR.2.1', parent: 'A.FGR.2', bigIdea: 'FGR', text: 'Use mathematically applicable situations algebraically and graphically to build and interpret arithmetic sequences as functions whose domain is a subset of the integers.' },
  { code: 'A.FGR.2.2', parent: 'A.FGR.2', bigIdea: 'FGR', text: 'Construct and interpret the graph of a linear function that models real-life phenomena and represent key characteristics of the graph using formal notation.' },
  { code: 'A.FGR.2.3', parent: 'A.FGR.2', bigIdea: 'FGR', text: 'Relate the domain and range of a linear function to its graph and, where applicable, to the quantitative relationship it describes. Use formal interval and set notation to describe the domain and range of linear functions.' },
  { code: 'A.FGR.2.4', parent: 'A.FGR.2', bigIdea: 'FGR', text: 'Use function notation to build and evaluate linear functions for inputs in their domains and interpret statements that use function notation in terms of a mathematical framework.' },
  { code: 'A.FGR.2.5', parent: 'A.FGR.2', bigIdea: 'FGR', text: 'Analyze the difference between linear functions and nonlinear functions by informally analyzing the graphs of various parent functions (linear, quadratic, exponential, absolute value, square root, and cube root parent curves).' },

  // Unit 2: Analyzing Linear Inequalities
  { code: 'A.PAR.4', bigIdea: 'PAR', text: 'Create, analyze, and solve linear inequalities in two variables and systems of linear inequalities to model real-life phenomena.' },
  { code: 'A.PAR.4.1', parent: 'A.PAR.4', bigIdea: 'PAR', text: 'Create and solve linear inequalities in two variables to represent relationships between quantities including mathematically applicable situations; graph inequalities on coordinate axes with labels and scales.' },
  { code: 'A.PAR.4.2', parent: 'A.PAR.4', bigIdea: 'PAR', text: 'Represent constraints of linear inequalities and interpret data points as possible or not possible.' },
  { code: 'A.PAR.4.3', parent: 'A.PAR.4', bigIdea: 'PAR', text: 'Solve systems of linear inequalities by graphing, including systems representing a mathematically applicable situation.' },

  // Unit 3: Investigating Rational and Irrational Numbers
  { code: 'A.NR.5', bigIdea: 'NR', text: 'Investigate rational and irrational numbers and rewrite expressions involving square roots and cube roots.' },
  { code: 'A.NR.5.1', parent: 'A.NR.5', bigIdea: 'NR', text: 'Rewrite algebraic and numeric expressions involving radicals.' },
  { code: 'A.NR.5.2', parent: 'A.NR.5', bigIdea: 'NR', text: 'Using numerical reasoning, show and explain that the sum or product of rational numbers is rational, the sum of a rational number and an irrational number is irrational, and the product of a nonzero rational number and an irrational number is irrational.' },

  // Unit 4: Modeling and Analyzing Quadratic Functions
  { code: 'A.PAR.6', bigIdea: 'PAR', text: 'Build quadratic expressions and equations to represent and model real-life phenomena; solve quadratic equations in contextual situations.' },
  { code: 'A.PAR.6.1', parent: 'A.PAR.6', bigIdea: 'PAR', text: 'Interpret quadratic expressions and parts of a quadratic expression that represent a quantity in terms of its context.' },
  { code: 'A.PAR.6.2', parent: 'A.PAR.6', bigIdea: 'PAR', text: 'Fluently choose and produce an equivalent form of a quadratic expression to reveal and explain properties of the quantity represented by the expression.' },
  { code: 'A.PAR.6.3', parent: 'A.PAR.6', bigIdea: 'PAR', text: 'Create and solve quadratic equations in one variable and explain the solution in the framework of applicable phenomena.' },
  { code: 'A.PAR.6.4', parent: 'A.PAR.6', bigIdea: 'PAR', text: 'Represent constraints by quadratic equations and interpret data points as possible or not possible in a modeling framework.' },
  { code: 'A.FGR.7', bigIdea: 'FGR', text: 'Construct and interpret quadratic functions from data points to model and explain real-life phenomena; describe key characteristics of the graph of a quadratic function to explain a contextual situation for which the graph serves as a model.' },
  { code: 'A.FGR.7.1', parent: 'A.FGR.7', bigIdea: 'FGR', text: 'Use function notation to build and evaluate quadratic functions for inputs in their domains and interpret statements that use function notation in terms of a given framework.' },
  { code: 'A.FGR.7.2', parent: 'A.FGR.7', bigIdea: 'FGR', text: 'Identify the effect on the graph generated by a quadratic function when replacing f(x) with f(x) + k, k f(x), f(kx), and f(x + k) for specific values of k (both positive and negative); find the value of k given the graphs.' },
  { code: 'A.FGR.7.3', parent: 'A.FGR.7', bigIdea: 'FGR', text: 'Graph and analyze the key characteristics of quadratic functions.' },
  { code: 'A.FGR.7.4', parent: 'A.FGR.7', bigIdea: 'FGR', text: 'Relate the domain and range of a quadratic function to its graph and, where applicable, to the quantitative relationship it describes.' },
  { code: 'A.FGR.7.5', parent: 'A.FGR.7', bigIdea: 'FGR', text: 'Rewrite a quadratic function representing a mathematically applicable situation to reveal the maximum or minimum value of the function it defines. Explain what the value describes in context.' },
  { code: 'A.FGR.7.6', parent: 'A.FGR.7', bigIdea: 'FGR', text: 'Create quadratic functions in two variables to represent relationships between quantities; graph quadratic functions on the coordinate axes with labels and scales.' },
  { code: 'A.FGR.7.7', parent: 'A.FGR.7', bigIdea: 'FGR', text: 'Estimate, calculate, and interpret the average rate of change of a quadratic function and make comparisons to the average rate of change of linear functions.' },
  { code: 'A.FGR.7.8', parent: 'A.FGR.7', bigIdea: 'FGR', text: 'Write a function defined by a quadratic expression in different but equivalent forms to reveal and explain different properties of the function.' },
  { code: 'A.FGR.7.9', parent: 'A.FGR.7', bigIdea: 'FGR', text: 'Compare characteristics of two functions each represented in a different way.' },

  // Unit 5: Modeling and Analyzing Exponential Expressions and Equations
  { code: 'A.PAR.8', bigIdea: 'PAR', text: 'Create and analyze exponential expressions and equations to represent and model real-life phenomena; solve exponential equations in mathematically applicable situations.' },
  { code: 'A.PAR.8.1', parent: 'A.PAR.8', bigIdea: 'PAR', text: 'Interpret exponential expressions and parts of an exponential expression that represent a quantity in terms of its framework.' },
  { code: 'A.PAR.8.2', parent: 'A.PAR.8', bigIdea: 'PAR', text: 'Create exponential equations in one variable and use them to solve problems, including mathematically applicable situations.' },
  { code: 'A.PAR.8.3', parent: 'A.PAR.8', bigIdea: 'PAR', text: 'Create exponential equations in two variables to represent relationships between quantities, including in mathematically applicable situations; graph equations on coordinate axes with labels and scales.' },
  { code: 'A.PAR.8.4', parent: 'A.PAR.8', bigIdea: 'PAR', text: 'Represent constraints by exponential equations and interpret data points as possible or not possible in a modeling environment.' },

  // Unit 6: Analyzing Exponential Functions
  { code: 'A.FGR.9', bigIdea: 'FGR', text: 'Construct and analyze the graph of an exponential function to explain a contextually relevant situation for which the graph serves as a model; compare exponential with linear and quadratic functions.' },
  { code: 'A.FGR.9.1', parent: 'A.FGR.9', bigIdea: 'FGR', text: 'Use function notation to build and evaluate exponential functions for inputs in their domains and interpret statements that use function notation in terms of a context.' },
  { code: 'A.FGR.9.2', parent: 'A.FGR.9', bigIdea: 'FGR', text: 'Graph and analyze the key characteristics of simple exponential functions based on mathematically applicable situations.' },
  { code: 'A.FGR.9.3', parent: 'A.FGR.9', bigIdea: 'FGR', text: 'Identify the effect on the graph generated by an exponential function when replacing f(x) with f(x) + k, and k f(x), for specific values of k (both positive and negative); find the value of k given the graphs.' },
  { code: 'A.FGR.9.4', parent: 'A.FGR.9', bigIdea: 'FGR', text: 'Use mathematically applicable situations algebraically and graphically to build and interpret geometric sequences as functions whose domain is a subset of the integers.' },
  { code: 'A.FGR.9.5', parent: 'A.FGR.9', bigIdea: 'FGR', text: 'Compare characteristics of two functions each represented in a different way.' },

  // Unit 7: Investigating Data
  { code: 'A.DSR.10', bigIdea: 'DSR', text: 'Collect, analyze, and interpret univariate quantitative data to answer statistical investigative questions that compare groups to solve real-life problems; Represent bivariate data on a scatter plot and fit a function to the data to answer statistical questions and solve real-life problems.' },
  { code: 'A.DSR.10.1', parent: 'A.DSR.10', bigIdea: 'DSR', text: 'Use statistics appropriate to the shape of the data distribution to compare and represent center (median and mean) and variability (interquartile range, standard deviation) of two or more distributions by hand and using technology.' },
  { code: 'A.DSR.10.2', parent: 'A.DSR.10', bigIdea: 'DSR', text: 'Interpret differences in shape, center, and variability of the distributions based on the investigation, accounting for possible effects of extreme data points (outliers).' },
  { code: 'A.DSR.10.3', parent: 'A.DSR.10', bigIdea: 'DSR', text: 'Represent data on two quantitative variables on a scatter plot and describe how the variables are related.' },
  { code: 'A.DSR.10.4', parent: 'A.DSR.10', bigIdea: 'DSR', text: 'Interpret the slope (predicted rate of change) and the intercept (constant term) of a linear model based on the investigation of the data.' },
  { code: 'A.DSR.10.5', parent: 'A.DSR.10', bigIdea: 'DSR', text: 'Calculate the line of best fit and interpret the correlation coefficient, r, of a linear fit using technology. Use r to describe the strength of the goodness of fit of the regression. Use the linear function to make predictions and assess how reasonable the prediction is in context.' },
  { code: 'A.DSR.10.6', parent: 'A.DSR.10', bigIdea: 'DSR', text: 'Decide which type of function is most appropriate by observing graphed data.' },
  { code: 'A.DSR.10.7', parent: 'A.DSR.10', bigIdea: 'DSR', text: 'Distinguish between correlation and causation.' },

  // Unit 8: Algebraic Connections to Geometric Concepts
  { code: 'A.GSR.3', bigIdea: 'GSR', text: 'Solve problems involving distance, midpoint, slope, area, and perimeter to model and explain real-life phenomena.' },
  { code: 'A.GSR.3.1', parent: 'A.GSR.3', bigIdea: 'GSR', text: 'Solve real-life problems involving slope, parallel lines, perpendicular lines, area, and perimeter.' },
  { code: 'A.GSR.3.2', parent: 'A.GSR.3', bigIdea: 'GSR', text: 'Apply the distance formula, midpoint formula, and slope of line segments to solve real-world problems.' },
];

export const STANDARD_BY_CODE: ReadonlyMap<string, Standard> = new Map(STANDARDS.map((s) => [s.code, s]));

/** Expectation-level codes (the ones lessons are aligned to and coverage is measured on). */
export const EXPECTATIONS = STANDARDS.filter((s) => s.parent !== undefined);
