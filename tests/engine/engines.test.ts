import { computeSkillState, Evidence, isStruggling } from '../../src/core/engine/mastery';
import { computeGrade, letterFor } from '../../src/core/engine/grading';
import { xpForAnswer, levelForXp, xpForLevel } from '../../src/core/engine/xp';
import { computeStreak, dayDiff, weekStart, localDate, addDays, dayQualifies } from '../../src/core/engine/dates';

const H = 3_600_000;
const D = 24 * H;
const ev = (at: number, correct: boolean, activity: Evidence['activity'] = 'independent', opts: Partial<Evidence> = {}): Evidence => ({ at, correct, activity, difficulty: 2, maxHintLevel: 0, attemptNumber: 1, ...opts });

describe('mastery engine', () => {
  it('starts NOT_STARTED and moves through stages with evidence', () => {
    expect(computeSkillState([]).stage).toBe('NOT_STARTED');
    expect(computeSkillState([ev(1, true)]).stage).toBe('LEARNING');
    const prof = [ev(1, true, 'guided'), ev(2, true), ev(3, true), ev(4, false), ev(5, true)];
    expect(computeSkillState(prof).stage).toBe('PROFICIENT');
  });
  it('requires formal evidence and enough independent work for MASTERED', () => {
    const practiceOnly = Array.from({ length: 8 }, (_, i) => ev((i * D) / 4, true));
    expect(computeSkillState(practiceOnly).stage).toBe('PROFICIENT');
    const withQuiz = [...practiceOnly, ev(2 * D, true, 'quiz'), ev(2 * D + 1, true, 'quiz')];
    expect(computeSkillState(withQuiz).stage).toBe('MASTERED');
  });
  it('MASTERED needs retention: perfect work within one sitting stays PROFICIENT', () => {
    const oneSitting = [...Array.from({ length: 10 }, (_, i) => ev(i * 60_000, true)), ev(11 * 60_000, true, 'quiz')];
    expect(computeSkillState(oneSitting).stage).toBe('PROFICIENT');
    const nextDay = [...oneSitting, ev(D, true, 'review')];
    expect(computeSkillState(nextDay).stage).toBe('MASTERED');
  });
  it('hinted or retried answers count less than independent ones', () => {
    const indep = computeSkillState([ev(1, true), ev(2, true), ev(3, true)]).score;
    const hinted = computeSkillState([ev(1, true, 'independent', { maxHintLevel: 3 }), ev(2, true, 'independent', { maxHintLevel: 3 }), ev(3, true, 'independent', { maxHintLevel: 3 })]).score;
    expect(hinted).toBeLessThan(indep);
    expect(computeSkillState([ev(1, true, 'independent', { maxHintLevel: 3 }), ev(2, true, 'independent', { maxHintLevel: 3 }), ev(3, true, 'independent', { maxHintLevel: 3 })]).stage).not.toBe('PROFICIENT');
  });
  it('early mistakes fade: recent success overrides a bad start', () => {
    const bad = Array.from({ length: 6 }, (_, i) => ev(i, false));
    const good = Array.from({ length: 10 }, (_, i) => ev(100 + (i * D) / 4, true));
    const quiz = [ev(3 * D, true, 'quiz')];
    expect(computeSkillState([...bad, ...good, ...quiz]).stage).toBe('MASTERED');
  });
  it('one spaced-review miss does not remove MASTERED', () => {
    const base = [...Array.from({ length: 8 }, (_, i) => ev((i * D) / 4, true)), ev(2 * D, true, 'quiz'), ev(2 * D + 1, true, 'quiz')];
    expect(computeSkillState(base).stage).toBe('MASTERED');
    const oneMiss = [...base, ev(10 * D, false, 'review')];
    expect(computeSkillState(oneMiss).stage).toBe('MASTERED');
    const manyMisses = [...oneMiss, ev(11 * D, false, 'review'), ev(12 * D, false, 'review'), ev(13 * D, false, 'review'), ev(14 * D, false, 'review')];
    expect(computeSkillState(manyMisses).stage).not.toBe('MASTERED');
  });
  it('is deterministic regardless of input order', () => {
    const items = [ev(5, true), ev(1, false), ev(3, true), ev(2, true, 'quiz'), ev(4, false)];
    expect(computeSkillState(items)).toEqual(computeSkillState([...items].reverse()));
  });
  it('schedules spaced review with growing intervals', () => {
    const base = [...Array.from({ length: 8 }, (_, i) => ev(i, true)), ev(9, true, 'quiz'), ev(10, true, 'quiz')];
    const s1 = computeSkillState(base);
    expect(s1.nextReviewAt).toBeGreaterThan(10);
    const s2 = computeSkillState([...base, ev(s1.nextReviewAt!, true, 'review')]);
    expect(s2.nextReviewAt! - s1.nextReviewAt!).toBeGreaterThan(s1.nextReviewAt! - 10);
  });
  it('detects struggling', () => {
    expect(isStruggling([ev(1, true), ev(2, false), ev(3, false)])).toBe(true);
    expect(isStruggling([ev(1, false), ev(2, true)])).toBe(false);
  });
});

describe('grading', () => {
  it('uses best quiz score, best of 2 unit attempts, rescales weights', () => {
    const g = computeGrade({
      quizAttempts: [
        { refId: 'U1L01', score: 4, maxScore: 6, finishedAt: 1 },
        { refId: 'U1L01', score: 6, maxScore: 6, finishedAt: 2 },
        { refId: 'U1L02', score: 4, maxScore: 5, finishedAt: 3 },
      ],
      unitAssessmentAttempts: [],
      semesterAssessmentAttempts: [],
      practice: { lessonsStarted: 2, lessonsPracticeComplete: 2 },
    });
    // quizzes: (100 + 80)/2 = 90 at weight .30; practice 100 at .05 -> (.30*90 + .05*100)/.35 = 91.43
    expect(g.percent).toBe(91.4);
    expect(g.letter).toBe('A');
    const g2 = computeGrade({
      quizAttempts: [{ refId: 'U1L01', score: 5, maxScore: 5, finishedAt: 1 }],
      unitAssessmentAttempts: [
        { refId: 'U1', score: 30, maxScore: 50, finishedAt: 5 },
        { refId: 'U1', score: 40, maxScore: 50, finishedAt: 6 },
        { refId: 'U1', score: 50, maxScore: 50, finishedAt: 7 }, // third attempt not counted
      ],
      semesterAssessmentAttempts: [],
      practice: { lessonsStarted: 0, lessonsPracticeComplete: 0 },
    });
    // quizzes 100 @.30, unit 80 @.45 -> (30 + 36)/.75 = 88
    expect(g2.percent).toBe(88);
    expect(g2.letter).toBe('B');
  });
  it('practice alone does not produce a grade', () => {
    const g = computeGrade({ quizAttempts: [], unitAssessmentAttempts: [], semesterAssessmentAttempts: [], practice: { lessonsStarted: 3, lessonsPracticeComplete: 1 } });
    expect(g.percent).toBeNull();
  });
  it('letter scale boundaries', () => {
    expect(letterFor(90)).toBe('A');
    expect(letterFor(89.9)).toBe('B');
    expect(letterFor(70)).toBe('C');
    expect(letterFor(69.9)).toBe('F');
  });
});

describe('XP', () => {
  const base = { activity: 'independent' as const, correct: true, difficulty: 2 as const, maxHintLevel: 0, attemptNumber: 1, isChoice: false, elapsedMs: 20000, recent: [], now: 1_000_000 };
  it('rewards correct independent work, less with hints/retries/choice', () => {
    expect(xpForAnswer(base).xp).toBe(13); // 10 * 1.25 = 12.5 -> 13
    expect(xpForAnswer({ ...base, maxHintLevel: 2 }).xp).toBe(8); // 12.5*.6=7.5->8
    expect(xpForAnswer({ ...base, attemptNumber: 2, elapsedMs: 10000 }).xp).toBe(6);
    expect(xpForAnswer({ ...base, isChoice: true }).xp).toBe(6);
    expect(xpForAnswer({ ...base, correct: false }).xp).toBe(0);
  });
  it('gives no XP for rapid guessing', () => {
    expect(xpForAnswer({ ...base, attemptNumber: 3, elapsedMs: 1500 }).xp).toBe(0);
    const recent = [{ at: 990_000, correct: false }, { at: 992_000, correct: false }, { at: 995_000, correct: false }];
    const r = xpForAnswer({ ...base, recent });
    expect(r.xp).toBe(0);
    expect(r.guessingSuspected).toBe(true);
  });
  it('levels follow 50L(L-1)', () => {
    expect(xpForLevel(2)).toBe(100);
    expect(levelForXp(0).level).toBe(1);
    expect(levelForXp(99).level).toBe(1);
    expect(levelForXp(100).level).toBe(2);
    expect(levelForXp(650).level).toBe(4);
  });
});

describe('dates and streaks', () => {
  it('date math', () => {
    expect(dayDiff('2026-02-27', '2026-03-01')).toBe(2);
    expect(dayDiff('2024-02-28', '2024-03-01')).toBe(2); // leap year
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
    expect(weekStart('2026-10-04')).toBe('2026-09-28'); // Sunday -> previous Monday
    expect(weekStart('2026-09-28')).toBe('2026-09-28');
    expect(localDate(Date.UTC(2026, 9, 4, 3, 0), 240)).toBe('2026-10-03'); // 3am UTC is 11pm EDT the day before
  });
  it('streak counts consecutive qualifying days and survives until end of today', () => {
    expect(computeStreak([], '2026-10-04').current).toBe(0);
    expect(computeStreak(['2026-10-02', '2026-10-03'], '2026-10-04').current).toBe(2);
    expect(computeStreak(['2026-10-02', '2026-10-03', '2026-10-04'], '2026-10-04')).toMatchObject({ current: 3, todayCounted: true });
    expect(computeStreak(['2026-10-01', '2026-10-02'], '2026-10-04').current).toBe(0);
    expect(computeStreak(['2026-09-01', '2026-09-02', '2026-09-03', '2026-09-04', '2026-10-03'], '2026-10-04')).toMatchObject({ current: 1, longest: 4 });
    expect(computeStreak(['2026-10-03', '2026-10-03'], '2026-10-04').current).toBe(1);
  });
  it('only meaningful activity qualifies', () => {
    expect(dayQualifies({ problemsAnswered: 0, activeSeconds: 30, sectionsCompleted: 0 })).toBe(false);
    expect(dayQualifies({ problemsAnswered: 5, activeSeconds: 0, sectionsCompleted: 0 })).toBe(true);
    expect(dayQualifies({ problemsAnswered: 0, activeSeconds: 600, sectionsCompleted: 0 })).toBe(true);
    expect(dayQualifies({ problemsAnswered: 1, activeSeconds: 60, sectionsCompleted: 1 })).toBe(true);
  });
});
