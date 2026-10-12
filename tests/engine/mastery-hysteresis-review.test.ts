/**
 * Regression tests for the mastery engine (QA follow-up 3):
 * - B3: a single miss (even on a unit assessment or an easy quiz item) never removes MASTERED.
 * - B10: two correct placement (diagnostic) answers establish a starting stage, never MASTERED.
 * - B11: spaced review follows 2, 4, 7, 14, 30 days; only answers given once the skill is due count as reviews.
 */
import { computeSkillState, Evidence } from '../../src/core/engine/mastery';

const H = 3_600_000;
const D = 24 * H;
const ev = (at: number, correct: boolean, activity: Evidence['activity'] = 'independent', opts: Partial<Evidence> = {}): Evidence => ({ at, correct, activity, difficulty: 2, maxHintLevel: 0, attemptNumber: 1, ...opts });

/** practice + quiz on day 0, more practice on day 1: MASTERED */
function masteredHistory(): Evidence[] {
  const e: Evidence[] = [];
  for (let i = 0; i < 4; i++) e.push(ev(i * 60_000, true));
  for (let i = 0; i < 2; i++) e.push(ev(600_000 + i * 60_000, true, 'quiz'));
  for (let i = 0; i < 3; i++) e.push(ev(D + i * 60_000, true));
  return e;
}

describe('MASTERED hysteresis (spec §18: not lost after one mistake)', () => {
  it('one miss of any kind and difficulty never drops MASTERED', () => {
    for (const variant of [-1, 0, 4, 8])
      for (const kind of ['retry', 'hint', 'none'] as const)
        for (const act of ['assessment', 'testout', 'quiz', 'independent', 'review'] as const)
          for (const difficulty of [1, 2, 3] as const) {
            const e = masteredHistory();
            if (variant >= 0 && kind === 'retry') e[variant].attemptNumber = 2;
            if (variant >= 0 && kind === 'hint') e[variant].maxHintLevel = 1;
            if (computeSkillState(e).stage !== 'MASTERED') continue;
            const after = computeSkillState([...e, ev(3 * D, false, act, { difficulty })]);
            expect(after.stage, `${kind}@${variant} miss on ${act} d${difficulty} (score ${after.score.toFixed(3)})`).toBe('MASTERED');
          }
  });

  it('the exact QA case: one difficulty-1 unit-assessment miss after a perfect history', () => {
    const e = masteredHistory();
    expect(computeSkillState(e).stage).toBe('MASTERED');
    const after = computeSkillState([...e, ev(3 * D, false, 'assessment', { difficulty: 1 })]);
    expect(after.score).toBeLessThan(0.7); // the score does fall...
    expect(after.stage).toBe('MASTERED'); // ...but one miss is not enough to lose MASTERED
  });

  it('repeated misses still lower it', () => {
    const e = masteredHistory();
    const two = [...e, ev(3 * D, false, 'assessment', { difficulty: 1 }), ev(3 * D + 60_000, false, 'assessment', { difficulty: 1 })];
    expect(computeSkillState(two).stage).not.toBe('MASTERED');
  });
});

describe('placement (diagnostic) evidence sets a starting stage', () => {
  it('two correct diagnostic answers: PROFICIENT, never MASTERED', () => {
    const s = computeSkillState([ev(0, true, 'diagnostic'), ev(20_000, true, 'diagnostic')]);
    expect(s.stage).toBe('PROFICIENT');
    const many = computeSkillState(Array.from({ length: 6 }, (_, i) => ev(i * D, true, 'diagnostic')));
    expect(many.stage).not.toBe('MASTERED');
  });
  it('two missed diagnostic answers, or one right of three, stay LEARNING', () => {
    expect(computeSkillState([ev(0, false, 'diagnostic'), ev(20_000, false, 'diagnostic')]).stage).toBe('LEARNING');
    expect(computeSkillState([ev(0, false, 'diagnostic'), ev(1, true, 'diagnostic'), ev(2, false, 'diagnostic')]).stage).toBe('LEARNING');
  });
  it('one practice answer still needs three answers', () => {
    expect(computeSkillState([ev(0, true), ev(1, true)]).stage).toBe('LEARNING');
  });
});

describe('spaced review intervals 2, 4, 7, 14, 30 days', () => {
  it('a skill learned in one sitting (practice + quiz) is first reviewed after 2 days, not 14', () => {
    const e: Evidence[] = [];
    for (let i = 0; i < 5; i++) e.push(ev(i * 60_000, true));
    for (let i = 0; i < 3; i++) e.push(ev(600_000 + i * 60_000, true, 'quiz'));
    const s = computeSkillState(e);
    expect(s.stage).toBe('PROFICIENT');
    expect((s.nextReviewAt! - e[e.length - 1].at) / D).toBe(2);
    expect(s.reviewStreak).toBe(0);
  });

  it('correct answers given when due advance the ladder, even when stored as independent practice', () => {
    const e = masteredHistory();
    let s = computeSkillState(e);
    const gaps: number[] = [];
    for (let r = 0; r < 5; r++) {
      const due = s.nextReviewAt!;
      e.push(ev(due, true, 'independent', { difficulty: 3 }));
      s = computeSkillState(e);
      gaps.push((s.nextReviewAt! - due) / D);
    }
    expect(gaps).toEqual([4, 7, 14, 30, 30]);
    expect(s.stage).toBe('MASTERED');
  });

  it('a review missed when due starts over with a review the next day', () => {
    const e = masteredHistory();
    const s = computeSkillState(e);
    const after = computeSkillState([...e, ev(s.nextReviewAt!, false, 'review')]);
    expect(after.reviewStreak).toBe(0);
    expect(after.nextReviewAt! - s.nextReviewAt!).toBe(D);
  });
});
