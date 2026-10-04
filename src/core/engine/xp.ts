/**
 * XP, levels and anti-guessing (spec §21, §47). XP rewards real learning behaviour:
 * correct work, independence, finishing lessons, and mastery gains. Wrong answers never
 * subtract XP, help (hints, Teach Me Again) is never penalized below zero, and rapid
 * guessing earns nothing.
 */

export type XpActivity = 'guided' | 'independent' | 'review' | 'quiz' | 'assessment' | 'diagnostic' | 'testout' | 'remediation';

export const XP_POLICY = {
  correctBase: { guided: 5, remediation: 6, independent: 10, review: 10, quiz: 15, assessment: 20, diagnostic: 5, testout: 15 } as Record<XpActivity, number>,
  difficultyMultiplier: { 1: 1, 2: 1.25, 3: 1.5 } as Record<number, number>,
  hintReductionPerLevel: 0.2,
  hintMinFactor: 0.4,
  secondAttemptFactor: 0.5,
  laterAttemptFactor: 0.25,
  choiceFactor: 0.5,
  /** an answer faster than this after the problem appeared, following a wrong try, is treated as a guess */
  rapidGuessMs: 4000,
  /** this many wrong answers within the window flags guessing */
  rapidWrongCount: 3,
  rapidWindowMs: 30_000,
  lessonComplete: 50,
  quizPass: 25,
  quizExcellentBonus: 25, // >= 90%
  testOutPass: 75,
  unitAssessmentComplete: 100,
  skillProficient: 20,
  skillMastered: 40,
  dailyGoalMet: 20,
  weeklyGoalMet: 75,
};

export interface AnswerXpInput {
  activity: XpActivity;
  correct: boolean;
  difficulty: 1 | 2 | 3;
  maxHintLevel: number;
  attemptNumber: number;
  isChoice: boolean;
  /** ms since the problem (or the previous try) was shown */
  elapsedMs: number;
  /** recent answers by this student (any problem), newest last */
  recent: Array<{ at: number; correct: boolean }>;
  now: number;
}

export interface AnswerXpResult {
  xp: number;
  guessingSuspected: boolean;
}

export function guessingSuspected(input: Pick<AnswerXpInput, 'attemptNumber' | 'elapsedMs' | 'recent' | 'now'>): boolean {
  if (input.attemptNumber > 1 && input.elapsedMs < XP_POLICY.rapidGuessMs) return true;
  const windowStart = input.now - XP_POLICY.rapidWindowMs;
  const wrongs = input.recent.filter((r) => r.at >= windowStart && !r.correct).length;
  return wrongs >= XP_POLICY.rapidWrongCount;
}

export function xpForAnswer(input: AnswerXpInput): AnswerXpResult {
  const guessing = guessingSuspected(input);
  if (!input.correct || guessing) return { xp: 0, guessingSuspected: guessing };
  let xp = XP_POLICY.correctBase[input.activity] * XP_POLICY.difficultyMultiplier[input.difficulty];
  if (input.attemptNumber === 2) xp *= XP_POLICY.secondAttemptFactor;
  else if (input.attemptNumber > 2) xp *= XP_POLICY.laterAttemptFactor;
  if (input.maxHintLevel > 0) xp *= Math.max(XP_POLICY.hintMinFactor, 1 - XP_POLICY.hintReductionPerLevel * input.maxHintLevel);
  if (input.isChoice) xp *= XP_POLICY.choiceFactor;
  return { xp: Math.max(1, Math.round(xp)), guessingSuspected: false };
}

/** Total XP needed to reach a level: L1 = 0, L2 = 100, L3 = 300, L4 = 600 ... (50·L·(L-1)). */
export function xpForLevel(level: number): number {
  return 50 * level * (level - 1);
}

export function levelForXp(totalXp: number): { level: number; current: number; needed: number; progress: number } {
  let level = 1;
  while (xpForLevel(level + 1) <= totalXp) level++;
  const base = xpForLevel(level);
  const next = xpForLevel(level + 1);
  return { level, current: totalXp - base, needed: next - base, progress: (totalXp - base) / (next - base) };
}

export const LEVEL_TITLES = ['Rookie', 'Explorer', 'Problem Solver', 'Pattern Finder', 'Equation Builder', 'Function Pro', 'Graph Master', 'Model Maker', 'Algebra Ace', 'Legend'];
export function levelTitle(level: number): string {
  return LEVEL_TITLES[Math.min(LEVEL_TITLES.length - 1, Math.floor((level - 1) / 2))];
}
