/**
 * Transparent grading (spec §20). Documented in docs/GRADING.md; every number here
 * can be recomputed from stored records.
 *
 * Categories and weights:
 *   Lesson quizzes        30%  best score of each lesson quiz (or the test-out score for a tested-out lesson)
 *   Unit assessments      45%  best of up to 2 attempts per unit assessment
 *   Semester assessment   20%  best attempt
 *   Practice completion    5%  share of started lessons whose practice was finished (effort, not accuracy)
 *
 * Categories with no data yet are left out and the remaining weights are rescaled, so an
 * early-semester grade reflects only the work done so far. Independent practice accuracy
 * never lowers the grade (spec §12: practice mistakes must not disproportionately harm it).
 */

export const GRADE_WEIGHTS = { quizzes: 0.3, unitAssessments: 0.45, semesterAssessment: 0.2, practice: 0.05 } as const;
export type GradeCategory = keyof typeof GRADE_WEIGHTS;

export const LETTER_SCALE: Array<{ min: number; letter: string }> = [
  { min: 90, letter: 'A' },
  { min: 80, letter: 'B' },
  { min: 70, letter: 'C' },
  { min: 0, letter: 'F' },
];
export const MAX_UNIT_ASSESSMENT_ATTEMPTS = 2;

export interface ScoredItem {
  refId: string; // lesson id or unit id
  score: number; // points earned
  maxScore: number;
  finishedAt: number;
}

export interface GradeInputs {
  quizAttempts: ScoredItem[]; // includes test-out attempts mapped to the lesson id
  unitAssessmentAttempts: ScoredItem[];
  semesterAssessmentAttempts: ScoredItem[];
  practice: { lessonsStarted: number; lessonsPracticeComplete: number };
}

export interface CategoryResult {
  category: GradeCategory;
  weight: number;
  percent: number | null; // null = no data
  items: Array<{ refId: string; percent: number; attempts: number }>;
}

export interface GradeResult {
  percent: number | null;
  letter: string | null;
  categories: CategoryResult[];
  effectiveWeights: Partial<Record<GradeCategory, number>>;
}

function bestPerRef(items: ScoredItem[], maxAttempts?: number): Array<{ refId: string; percent: number; attempts: number }> {
  const byRef = new Map<string, ScoredItem[]>();
  for (const it of [...items].sort((a, b) => a.finishedAt - b.finishedAt)) {
    const list = byRef.get(it.refId) ?? [];
    list.push(it);
    byRef.set(it.refId, list);
  }
  const out: Array<{ refId: string; percent: number; attempts: number }> = [];
  for (const [refId, list] of byRef) {
    const counted = maxAttempts ? list.slice(0, maxAttempts) : list;
    const best = Math.max(...counted.map((i) => (i.maxScore > 0 ? (100 * i.score) / i.maxScore : 0)));
    out.push({ refId, percent: round1(best), attempts: list.length });
  }
  return out.sort((a, b) => (a.refId < b.refId ? -1 : 1));
}

export function round1(x: number): number {
  return Math.round(x * 10) / 10;
}

function mean(xs: number[]): number | null {
  return xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null;
}

export function letterFor(percent: number): string {
  return LETTER_SCALE.find((s) => percent >= s.min)!.letter;
}

export function computeGrade(input: GradeInputs): GradeResult {
  const quizItems = bestPerRef(input.quizAttempts);
  const unitItems = bestPerRef(input.unitAssessmentAttempts, MAX_UNIT_ASSESSMENT_ATTEMPTS);
  const semItems = bestPerRef(input.semesterAssessmentAttempts);
  const practicePct = input.practice.lessonsStarted > 0 ? (100 * input.practice.lessonsPracticeComplete) / input.practice.lessonsStarted : null;

  const categories: CategoryResult[] = [
    { category: 'quizzes', weight: GRADE_WEIGHTS.quizzes, percent: mean(quizItems.map((i) => i.percent)), items: quizItems },
    { category: 'unitAssessments', weight: GRADE_WEIGHTS.unitAssessments, percent: mean(unitItems.map((i) => i.percent)), items: unitItems },
    { category: 'semesterAssessment', weight: GRADE_WEIGHTS.semesterAssessment, percent: mean(semItems.map((i) => i.percent)), items: semItems },
    { category: 'practice', weight: GRADE_WEIGHTS.practice, percent: practicePct, items: [] },
  ];
  const withData = categories.filter((c) => c.percent !== null);
  // Practice completion alone is not a grade: require at least one scored category.
  if (!withData.some((c) => c.category !== 'practice')) {
    return { percent: null, letter: null, categories: categories.map((c) => ({ ...c, percent: c.percent === null ? null : round1(c.percent) })), effectiveWeights: {} };
  }
  const totalW = withData.reduce((a, c) => a + c.weight, 0);
  const effectiveWeights: Partial<Record<GradeCategory, number>> = {};
  let pct = 0;
  for (const c of withData) {
    const w = c.weight / totalW;
    effectiveWeights[c.category] = round1(w * 100) / 100;
    pct += w * (c.percent as number);
  }
  const percent = round1(pct);
  return { percent, letter: letterFor(percent), categories: categories.map((c) => ({ ...c, percent: c.percent === null ? null : round1(c.percent) })), effectiveWeights };
}
