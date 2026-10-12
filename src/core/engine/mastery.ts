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
 * - MASTERED has hysteresis: a single miss (even on a unit assessment or an easy quiz item)
 *   never removes it; it drops only after repeated misses pull the recent score down, or when
 *   the score falls below the Developing threshold (e.g. only heavily hinted answers).
 * - Placement: answers from the diagnostic count 1.5x toward the minimum-evidence rule, so two
 *   correct placement answers can establish a starting stage (never MASTERED, which needs
 *   quiz/assessment evidence spread over time).
 * - Spaced review follows 2, 4, 7, 14, 30 days. Only an answer given once the skill is due
 *   (at or after nextReviewAt) counts as a review, and only independent work (first try, no
 *   hints) is a successful one; independent practice before then keeps the date measured from
 *   the latest independent work. Hinted or retried correct answers leave the schedule as it is.
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
  /** Mastered means retained: independent correct work must span at least this long (a later study day). */
  masteredMinSpanMs: 20 * 60 * 60 * 1000,
  /** a MASTERED skill only drops when the recent score falls below this ... */
  masteredDropBelow: 0.7,
  /** ... AND at least this many answers since it became MASTERED (within the window) were misses */
  masteredDropMinMisses: 2,
  /** weight of a diagnostic answer toward learningMinEvidence (2 placement answers = 3) */
  placementEvidenceWeight: 1.5,
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
  const evidenceAmount = history.reduce((n, e) => n + (e.activity === 'diagnostic' ? MASTERY_POLICY.placementEvidenceWeight : 1), 0);
  if (evidenceAmount < MASTERY_POLICY.learningMinEvidence || score < MASTERY_POLICY.developingMinScore) return 'LEARNING';
  if (score < MASTERY_POLICY.proficientMinScore || indep < MASTERY_POLICY.proficientMinIndependent) return 'DEVELOPING';
  const formalCorrect = recent.some((e) => isFormal(e) && e.correct);
  const indepTimes = recent.filter(isIndependent).map((e) => e.at);
  const retained = indepTimes.length > 0 && Math.max(...indepTimes) - Math.min(...indepTimes) >= MASTERY_POLICY.masteredMinSpanMs;
  if (score >= MASTERY_POLICY.masteredMinScore && history.length >= MASTERY_POLICY.masteredMinEvidence && indep >= MASTERY_POLICY.masteredMinIndependent && formalCorrect && retained) return 'MASTERED';
  return 'PROFICIENT';
}

/** Replay evidence in time order to get the current state (deterministic). */
export function computeSkillState(evidence: Evidence[]): SkillState {
  const sorted = [...evidence].sort((a, b) => a.at - b.at);
  const history: Evidence[] = [];
  let stage: MasteryStage = 'NOT_STARTED';
  let masteredAt: number | null = null;
  let masteredIdx = -1; // index in history where the current MASTERED run began
  let nextReviewAt: number | null = null;
  let reviewStreak = 0;
  let score = 0;
  const ivs = MASTERY_POLICY.reviewIntervalsDays;
  const intervalMs = (streak: number) => ivs[Math.min(ivs.length - 1, streak)] * DAY;
  for (const e of sorted) {
    history.push(e);
    const idx = history.length - 1;
    score = recentScore(history);
    let s = baseStage(history, score);
    if (stage === 'MASTERED' && s !== 'MASTERED') {
      // hysteresis: leave MASTERED only after repeated misses (never after one) that pull the score down
      const windowStart = Math.max(masteredIdx + 1, history.length - MASTERY_POLICY.window);
      const missesSince = history.slice(windowStart).filter((h) => !h.correct).length;
      // ... unless the score has fallen below the Developing threshold: then it drops whatever the
      // miss count (e.g. every answer right only after full hints is not mastery)
      const collapsed = score < MASTERY_POLICY.developingMinScore;
      if (!collapsed && (score >= MASTERY_POLICY.masteredDropBelow || missesSince < MASTERY_POLICY.masteredDropMinMisses)) s = 'MASTERED';
    }
    if (s === 'MASTERED' && stage !== 'MASTERED') {
      masteredAt = e.at;
      masteredIdx = idx;
    }
    if (s !== 'MASTERED') {
      masteredAt = null;
      masteredIdx = -1;
    }
    const wasReviewable = stage === 'PROFICIENT' || stage === 'MASTERED';
    stage = s;

    // spaced review scheduling (2, 4, 7, 14, 30 days)
    if (stage === 'PROFICIENT' || stage === 'MASTERED') {
      if (!wasReviewable || nextReviewAt === null) {
        // just reached PROFICIENT: first review after the first interval
        reviewStreak = 0;
        nextReviewAt = e.at + intervalMs(0);
      } else if (e.at >= nextReviewAt) {
        // the skill was due: this answer is a spaced review. Only independent work (first try, no
        // hints, not guided) is a successful review; a hinted or second-try answer leaves it due.
        if (isIndependent(e)) {
          reviewStreak += 1;
          nextReviewAt = e.at + intervalMs(reviewStreak);
        } else if (!e.correct) {
          reviewStreak = 0;
          nextReviewAt = e.at + DAY;
        }
      } else if (isIndependent(e)) {
        // practice before the review is due: keep the interval, measured from the latest correct work
        nextReviewAt = Math.max(nextReviewAt, e.at + intervalMs(reviewStreak));
      } else if (!e.correct) {
        // a miss before the review is due: start the interval ladder again, review tomorrow
        reviewStreak = 0;
        nextReviewAt = e.at + DAY;
      }
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
