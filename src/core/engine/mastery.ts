/**
 * Skill mastery engine (spec §15, §16, §18).
 *
 * Mastery is a pure function of the stored attempt history: the same attempts always
 * give the same stage, so the Student and Parent dashboards (and any audit) agree.
 *
 * - Only the most recent evidence counts strongly (exponential recency weighting over a
 *   window), so early mistakes are not a permanent penalty.
 * - Independent, first-try, no-hint work counts most; hints and retries count less;
 *   quizzes and assessments carry more weight than practice.
 * - MASTERED has hysteresis: one miss during spaced review does not remove it.
 */

export type MasteryStage = 'NOT_STARTED' | 'LEARNING' | 'DEVELOPING' | 'PROFICIENT' | 'MASTERED';
export const STAGE_ORDER: MasteryStage[] = ['NOT_STARTED', 'LEARNING', 'DEVELOPING', 'PROFICIENT', 'MASTERED'];

export type EvidenceActivity = 'guided' | 'independent' | 'review' | 'quiz' | 'assessment' | 'diagnostic' | 'testout' | 'remediation';

export interface Evidence {
  at: number; // epoch ms
  correct: boolean;
  activity: EvidenceActivity;
  difficulty: 1 | 2 | 3;
  maxHintLevel: number; // 0 = no hints
  attemptNumber: number; // 1 = first try on this problem
}

export interface SkillState {
  stage: MasteryStage;
  score: number; // 0..1 weighted recent accuracy
  evidenceCount: number;
  independentCorrect: number;
  lastPracticedAt: number | null;
  masteredAt: number | null;
  /** when this skill should next appear in spaced review */
  nextReviewAt: number | null;
  /** consecutive successful spaced reviews (drives growing intervals) */
  reviewStreak: number;
}

export const MASTERY_POLICY = {
  window: 12,
  decay: 0.85,
  activityWeight: { guided: 0.5, remediation: 0.7, independent: 1.0, review: 1.0, quiz: 1.5, diagnostic: 1.5, assessment: 2.0, testout: 2.0 } as Record<EvidenceActivity, number>,
  difficultyWeightCorrect: { 1: 0.8, 2: 1.0, 3: 1.2 } as Record<number, number>,
  difficultyWeightIncorrect: { 1: 1.2, 2: 1.0, 3: 0.8 } as Record<number, number>,
  hintPenaltyPerLevel: 0.15,
  minHintedCredit: 0.3,
  retryCredit: 0.6,
  learningMinEvidence: 3,
  developingMinScore: 0.5,
  proficientMinScore: 0.75,
  proficientMinIndependent: 2,
  masteredMinScore: 0.88,
  masteredMinEvidence: 6,
  masteredMinIndependent: 4,
  /** a MASTERED skill only drops when the recent score falls below this */
  masteredDropBelow: 0.7,
  reviewIntervalsDays: [2, 4, 7, 14, 30],
};

const DAY = 86_400_000;

export function creditFor(e: Evidence): number {
  if (!e.correct) return 0;
  let c = e.attemptNumber > 1 ? MASTERY_POLICY.retryCredit : 1;
  if (e.maxHintLevel > 0) c = Math.max(MASTERY_POLICY.minHintedCredit, c - MASTERY_POLICY.hintPenaltyPerLevel * e.maxHintLevel);
  return c;
}

function isIndependent(e: Evidence): boolean {
  return e.correct && e.maxHintLevel === 0 && e.attemptNumber === 1 && e.activity !== 'guided' && e.activity !== 'remediation';
}

function isFormal(e: Evidence): boolean {
  return e.activity === 'quiz' || e.activity === 'assessment' || e.activity === 'testout';
}

/** Weighted score over the recent window (newest first gets weight 1). */
export function recentScore(history: Evidence[]): number {
  const recent = history.slice(-MASTERY_POLICY.window).reverse();
  let num = 0;
  let den = 0;
  recent.forEach((e, rank) => {
    const dw = e.correct ? MASTERY_POLICY.difficultyWeightCorrect[e.difficulty] : MASTERY_POLICY.difficultyWeightIncorrect[e.difficulty];
    const w = Math.pow(MASTERY_POLICY.decay, rank) * MASTERY_POLICY.activityWeight[e.activity] * dw;
    num += w * creditFor(e);
    den += w;
  });
  return den === 0 ? 0 : num / den;
}

function baseStage(history: Evidence[], score: number): MasteryStage {
  if (history.length === 0) return 'NOT_STARTED';
  const recent = history.slice(-MASTERY_POLICY.window);
  const indep = recent.filter(isIndependent).length;
  if (history.length < MASTERY_POLICY.learningMinEvidence || score < MASTERY_POLICY.developingMinScore) return 'LEARNING';
  if (score < MASTERY_POLICY.proficientMinScore || indep < MASTERY_POLICY.proficientMinIndependent) return 'DEVELOPING';
  const formalCorrect = recent.some((e) => isFormal(e) && e.correct);
  if (score >= MASTERY_POLICY.masteredMinScore && history.length >= MASTERY_POLICY.masteredMinEvidence && indep >= MASTERY_POLICY.masteredMinIndependent && formalCorrect) return 'MASTERED';
  return 'PROFICIENT';
}

/** Replay evidence in time order to get the current state (deterministic). */
export function computeSkillState(evidence: Evidence[]): SkillState {
  const sorted = [...evidence].sort((a, b) => a.at - b.at);
  const history: Evidence[] = [];
  let stage: MasteryStage = 'NOT_STARTED';
  let masteredAt: number | null = null;
  let nextReviewAt: number | null = null;
  let reviewStreak = 0;
  let score = 0;
  for (const e of sorted) {
    history.push(e);
    score = recentScore(history);
    let s = baseStage(history, score);
    if (stage === 'MASTERED' && s !== 'MASTERED' && score >= MASTERY_POLICY.masteredDropBelow) s = 'MASTERED';
    if (s === 'MASTERED' && stage !== 'MASTERED') masteredAt = e.at;
    if (s !== 'MASTERED') masteredAt = null;
    stage = s;

    // spaced review scheduling
    if (stage === 'PROFICIENT' || stage === 'MASTERED') {
      if (e.activity === 'review' || e.activity === 'assessment' || e.activity === 'quiz' || e.activity === 'testout') {
        reviewStreak = e.correct ? reviewStreak + 1 : 0;
      }
      const ivs = MASTERY_POLICY.reviewIntervalsDays;
      const idx = Math.min(ivs.length - 1, reviewStreak + (stage === 'MASTERED' ? 1 : 0));
      nextReviewAt = e.correct ? e.at + ivs[idx] * DAY : e.at + DAY;
    } else if (stage === 'DEVELOPING' || stage === 'LEARNING') {
      reviewStreak = 0;
      nextReviewAt = e.at + DAY;
    }
  }
  const recent = history.slice(-MASTERY_POLICY.window);
  return {
    stage,
    score,
    evidenceCount: history.length,
    independentCorrect: recent.filter(isIndependent).length,
    lastPracticedAt: sorted.length ? sorted[sorted.length - 1].at : null,
    masteredAt: stage === 'MASTERED' ? masteredAt : null,
    nextReviewAt,
    reviewStreak,
  };
}

export function stageAtLeast(s: MasteryStage, min: MasteryStage): boolean {
  return STAGE_ORDER.indexOf(s) >= STAGE_ORDER.indexOf(min);
}

/** Struggle signal used by adaptive remediation: recent misses on a skill. */
export function isStruggling(evidence: Evidence[]): boolean {
  const recent = [...evidence].sort((a, b) => a.at - b.at).slice(-4);
  if (recent.length < 2) return false;
  const last2 = recent.slice(-2);
  return last2.every((e) => !e.correct) || recent.filter((e) => !e.correct).length >= 3;
}
