/**
 * Curriculum data model. Lessons are data, not UI: the lesson engine renders any
 * lesson that satisfies these types, and tests validate every lesson against them.
 */
import type { AnswerSpec, Misconception } from '../math/answers';

export interface Unit {
  id: string; // "U1"
  number: number;
  title: string;
  standards: string[]; // parent standard codes
  description: string;
  /** GaDOE block-schedule range (days) used for pacing */
  gadoeBlockDays: [number, number];
}

export interface Skill {
  id: string; // "S1.01"
  unitId: string;
  name: string;
  description: string;
  standards: string[]; // expectation codes
  prerequisites: string[]; // skill ids (may be prior-grade "P.*" skills)
  /** true for skills that must be mastered before moving on (protected from test-out skipping) */
  essential?: boolean;
}

export type LessonKind =
  | 'lesson'
  | 'checkpoint' // mid-unit cumulative review + checkpoint quiz
  | 'unit-review'
  | 'unit-assessment'
  | 'cumulative-review'
  | 'capstone'
  | 'semester-review'
  | 'semester-assessment';

export interface LessonMeta {
  id: string; // "U1L01"
  unitId: string;
  number: number; // within unit
  /** 1..90 position in the semester */
  day: number;
  week: number; // 1..18
  title: string;
  kind: LessonKind;
  standards: string[]; // expectation codes (A.MM.1.x / A.MP.x included where emphasized)
  objectives: string[];
  /** lesson ids that should be complete (or tested out) first */
  prerequisites: string[];
  skillsTaught: string[];
  skillsAssessed: string[];
  /** skills from earlier lessons that are spiraled into this lesson's practice */
  reviewSkills: string[];
  durationMinutes: number;
  difficulty: 1 | 2 | 3;
}

// ---------------------------------------------------------------------------
// Content blocks. Inline math inside text uses $...$ (KaTeX). A literal dollar
// sign is written \$ .
// ---------------------------------------------------------------------------

export type Block =
  | { t: 'p'; text: string }
  | { t: 'math'; tex: string }
  | { t: 'list'; items: string[]; ordered?: boolean }
  | { t: 'callout'; variant: 'tip' | 'warning' | 'why' | 'realworld' | 'vocab'; title?: string; text: string }
  | { t: 'table'; headers: string[]; rows: string[][]; caption?: string }
  | { t: 'graph'; spec: GraphSpec; caption?: string }
  | { t: 'steps'; items: SolutionStep[] };

export interface GraphSpec {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
  xLabel?: string;
  yLabel?: string;
  /** grid spacing; default 1 */
  xStep?: number;
  yStep?: number;
  /** functions as parser-syntax strings in x, e.g. "2x+1" */
  functions?: Array<{ expr: string; color?: string; label?: string; dashed?: boolean; domain?: [number, number] }>;
  points?: Array<{ x: number; y: number; label?: string; open?: boolean; color?: string }>;
  segments?: Array<{ x1: number; y1: number; x2: number; y2: number; dashed?: boolean; color?: string; label?: string }>;
  /** shaded half-planes: boundary y = expr; side 'above' | 'below' */
  inequalities?: Array<{ boundary: string; side: 'above' | 'below'; strict: boolean; color?: string }>;
  /** vertical boundary x = c */
  verticalInequalities?: Array<{ x: number; side: 'left' | 'right'; strict: boolean; color?: string }>;
  /** discrete point plots (sequences, scatter plots) */
  scatter?: Array<{ x: number; y: number }>;
  showLineOfFit?: { m: number; b: number };
  ariaLabel: string;
}

export interface SolutionStep {
  /** what is done in this step, in words */
  text: string;
  /** the math after this step */
  tex?: string;
  /** why the step is valid */
  why?: string;
}

export interface WorkedExample {
  title: string;
  kind: 'introductory' | 'intermediate' | 'challenging' | 'real-world' | 'common-mistake';
  problem: Block[];
  steps: SolutionStep[];
  answer: string; // text/TeX summary of the result
}

export type TeachAgainApproach = 'visual' | 'simpler-example' | 'analogy' | 'prerequisite' | 'step-by-step' | 'alternate-strategy';

export interface TeachAgainVariant {
  approach: TeachAgainApproach;
  title: string;
  blocks: Block[];
}

// ---------------------------------------------------------------------------
// Problems (generated from seeded generators so every problem is reproducible)
// ---------------------------------------------------------------------------

export type Difficulty = 1 | 2 | 3;

export interface ProblemStep {
  prompt: Block[];
  answer: AnswerSpec;
  inputHint?: string;
  hints: [string, string, string, string];
  misconceptions?: Misconception[];
  /** shown after the step is answered correctly */
  explanation: string;
}

export interface Problem {
  /** generatorId + seed + difficulty, stable */
  id: string;
  generatorId: string;
  seed: number;
  difficulty: Difficulty;
  skillId: string;
  tags: Array<'real-world' | 'word' | 'application' | 'graph' | 'multi-step' | 'review'>;
  prompt: Block[];
  answer: AnswerSpec;
  /** e.g. "Type an ordered pair like (2, 5)" */
  inputHint?: string;
  /** Level 1 conceptual, 2 strategy, 3 part of next step, 4 strong guidance */
  hints: [string, string, string, string];
  solution: SolutionStep[];
  misconceptions: Misconception[];
  /** Optional step-by-step breakdown used in guided practice */
  steps?: ProblemStep[];
}

export interface GeneratorDef {
  id: string;
  skillId: string;
  description: string;
  generate(rng: Rng, difficulty: Difficulty): Problem;
  /**
   * Independent mathematical verification of a generated problem: re-derives the
   * answer by a different route (e.g. substitution) and returns a list of problems.
   * Empty list = verified.
   */
  verify(p: Problem): string[];
}

export interface Rng {
  next(): number; // [0,1)
  int(min: number, max: number): number; // inclusive
  pick<T>(arr: readonly T[]): T;
  nonzeroInt(min: number, max: number): number;
  shuffle<T>(arr: T[]): T[];
  bool(): boolean;
}

export interface ProblemRef {
  generator: string;
  difficulty: Difficulty;
}

export interface PracticePlan {
  /** number of problems */
  count: number;
  mix: Array<ProblemRef & { weight: number }>;
  /** number of spaced-review problems drawn from reviewSkills */
  reviewCount: number;
}

export interface MasteryCriteria {
  /** quiz score (0..1) required to complete the lesson */
  quizPassScore: number;
  /** independent practice minimum correct before quiz unlocks */
  practiceMinCorrect: number;
}

export interface LessonContent {
  lessonId: string;
  goal: string;
  needToKnow: Block[];
  instruction: Block[];
  examples: WorkedExample[];
  teachMeAgain: TeachAgainVariant[];
  guided: ProblemRef[];
  independent: PracticePlan;
  quiz: { items: ProblemRef[] };
  summary: string[];
  mastery: MasteryCriteria;
  /** optional vocabulary list */
  vocabulary?: Array<{ term: string; meaning: string }>;
}

/** Assessments (unit tests, semester exam, diagnostic, test-out) are assembled from blueprints. */
export interface AssessmentBlueprint {
  id: string;
  kind: 'unit-assessment' | 'semester-assessment' | 'diagnostic' | 'test-out' | 'checkpoint' | 'unit-review' | 'cumulative-review';
  title: string;
  items: ProblemRef[];
  /** minutes suggested */
  durationMinutes: number;
  hintsAllowed: boolean;
}
