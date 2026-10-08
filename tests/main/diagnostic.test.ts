/**
 * Diagnostic (placement) assessment: the evidence rule, the adaptive flow driven through the
 * service as the UI does, starting mastery, recommendations, warm-up practice, and the parent's
 * PIN-protected skip.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { AppDatabase } from '../../src/main/db/database';
import { MemoryLogger } from '../../src/main/logger';
import type { ServiceContext } from '../../src/main/services/context';
import { setupParent } from '../../src/main/services/parent';
import { createProfile, getProfile, setOnboarding } from '../../src/main/services/profiles';
import * as G from '../../src/main/services/diagnostic';
import { getCourse } from '../../src/main/services/lessons';
import { getProblem } from '../../src/main/services/practice';
import { skillStates } from '../../src/main/services/records';
import { createApi } from '../../src/main/services/api';
import { canonicalInput } from '../../src/core/engine/problems';
import { LESSONS, PREREQ_SKILLS, generatorsForSkill } from '../../src/content';
import type { DiagnosticView } from '../../src/shared/api';

async function makeCtx(): Promise<ServiceContext> {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'acc-diag-'));
  const log = new MemoryLogger();
  let t = Date.UTC(2026, 8, 1, 15, 0, 0);
  const { db } = await AppDatabase.open(dir, log, () => t);
  db.persistDelayMs = 0;
  return { db, log, now: () => (t += 20_000), tzOffset: () => 240, appVersion: 'test', dataDir: dir };
}

interface RunShape {
  skills: Array<{ skillId: string; group: string; answers: boolean[]; notLearned: boolean }>;
  cursor: number;
  ps: { items: Array<{ key: string; generatorId: string; seed: number; difficulty: 1 | 2 | 3; skillId: string }> };
}

function runState(ctx: ServiceContext, pid: number): RunShape {
  return JSON.parse(ctx.db.get<{ onboarding_json: string }>('SELECT onboarding_json FROM profiles WHERE id = ?', [pid])!.onboarding_json).diagnosticRun;
}

function rightAnswer(ctx: ServiceContext, pid: number, key: string): string {
  const s = runState(ctx, pid).ps.items.find((i) => i.key === key)!;
  return canonicalInput(getProblem(s.generatorId, s.seed, s.difficulty).answer);
}

function wrongAnswer(kind: string, right: string): string {
  const wrong: Record<string, string> = { choice: '__none__', number: '987654', point: '(987654, 1)', 'region-point': '(-987654, -987654)', 'sequence-terms': '987654, 1, 2', interval: '(987654, 987655)', solutions: 'x = 987654', expression: `(${right}) + 987654` };
  return wrong[kind] ?? right.replace(/(=|<=|>=|<|>)/, '$1 987654 +');
}

/** Answer until the diagnostic ends; `pattern(skillId, k)` says whether the k-th answer on a skill is right. */
function play(ctx: ServiceContext, pid: number, pattern: (skillId: string, k: number) => boolean | 'not-learned'): { view: DiagnosticView; asked: Map<string, number> } {
  let v = G.startDiagnostic(ctx, pid);
  const asked = new Map<string, number>();
  for (let guard = 0; v.phase === 'questions'; guard++) {
    if (guard > 200) throw new Error('diagnostic did not end');
    const st = runState(ctx, pid);
    const skill = st.skills[st.cursor].skillId;
    const k = asked.get(skill) ?? 0;
    asked.set(skill, k + 1);
    const p = v.problem!;
    const want = pattern(skill, k);
    if (want === 'not-learned') {
      v = G.diagnosticNotLearned(ctx, pid, p.key);
      continue;
    }
    const right = rightAnswer(ctx, pid, p.key);
    const before = st.ps.items.length;
    v = G.diagnosticSubmit(ctx, pid, p.key, want ? right : wrongAnswer(p.answerKind, right), 20_000);
    // every readable answer moves on (no feedback, no second try on the same question)
    if (v.phase === 'questions') expect(runState(ctx, pid).ps.items.length, `${p.answerKind}: ${v.problem?.lastFeedback?.message}`).toBe(before + 1);
  }
  return { view: v, asked };
}

describe('the evidence rule', () => {
  it('needs more than one answer to call a skill weak, and two to call a course skill known', () => {
    const d = G.decideSkill;
    // prerequisite: a first right answer is enough
    expect(d('prereq', [true])).toBe('strong');
    expect(d('prereq', [false])).toBeNull();
    expect(d('prereq', [false, false])).toBe('needs-work');
    expect(d('prereq', [false, true])).toBeNull();
    expect(d('prereq', [false, true, true])).toBe('strong');
    expect(d('prereq', [false, true, false])).toBe('needs-work');
    // course skill: two right to show it, two wrong to call it still to learn
    expect(d('course', [true])).toBeNull();
    expect(d('course', [false])).toBeNull();
    expect(d('course', [true, true])).toBe('strong');
    expect(d('course', [false, false])).toBe('needs-work');
    expect(d('course', [true, false])).toBeNull();
    expect(d('course', [false, true])).toBeNull();
    expect(d('course', [true, false, true])).toBe('strong');
    expect(d('course', [false, true, false])).toBe('needs-work');
    expect(d('course', [true], true)).toBe('not-learned');
    // never more than three questions on a skill
    for (const g of ['prereq', 'course'] as const)
      for (let m = 0; m < 8; m++) expect(d(g, [!!(m & 1), !!(m & 2), !!(m & 4)])).not.toBeNull();
  });

  it('covers every prerequisite skill and the course probes, all with generators', () => {
    const plan = G.diagnosticPlan();
    expect(plan.filter((p) => p.group === 'prereq').map((p) => p.skillId)).toEqual(PREREQ_SKILLS.map((s) => s.id));
    expect(plan.filter((p) => p.group === 'course').map((p) => p.skillId)).toEqual(G.COURSE_PROBES);
    for (const p of plan) expect(generatorsForSkill(p.skillId).length, p.skillId).toBeGreaterThan(0);
    // each course probe is taught by a lesson the diagnostic can point to
    for (const s of G.COURSE_PROBES) expect(LESSONS.some((l) => l.kind === 'lesson' && l.skillsTaught.includes(s)), s).toBe(true);
  });
});

describe('taking the diagnostic', () => {
  let ctx: ServiceContext;
  let pid: number;
  beforeEach(async () => {
    ctx = await makeCtx();
    setupParent(ctx, '2468');
    pid = createProfile(ctx, 'Sam', 'fox').id;
  });

  it('is offered to a new student and asks one question at a time with no hints or feedback', () => {
    let v = G.getDiagnostic(ctx, pid);
    expect(v.status).toBe('offered');
    expect(v.phase).toBe('intro');
    v = G.startDiagnostic(ctx, pid);
    expect(v.status).toBe('in_progress');
    expect(v.phase).toBe('questions');
    expect(v.part).toBe('prereq');
    const p = v.problem!;
    expect(p.hintsAllowed).toBe(false);
    expect(p.solution).toBeUndefined();
    expect(p.correctAnswer).toBeUndefined();
    // an unreadable answer is not counted and keeps the same question
    v = G.diagnosticSubmit(ctx, pid, p.key, p.answerKind === 'choice' ? '' : ')))', 1000);
    expect(v.problem!.key).toBe(p.key);
    expect(ctx.db.get<{ n: number }>("SELECT COUNT(*) AS n FROM attempts WHERE profile_id = ? AND activity = 'diagnostic'", [pid])!.n).toBe(0);
    // a wrong answer gives no right/wrong signal, just the next question
    v = G.diagnosticSubmit(ctx, pid, p.key, wrongAnswer(p.answerKind, rightAnswer(ctx, pid, p.key)), 20_000);
    expect(v.problem!.key).not.toBe(p.key);
    expect(v.problem!.lastFeedback).toBeUndefined();
    // the old question is gone; only the current one can be answered
    expect(() => G.diagnosticSubmit(ctx, pid, p.key, '1', 1000)).toThrow(/no longer active/);
    // a miss on a prerequisite gets a follow-up on the same skill, from another problem type when there is one
    const st = runState(ctx, pid);
    expect(st.cursor).toBe(0);
    expect(st.ps.items[1].skillId).toBe(st.ps.items[0].skillId);
    if (generatorsForSkill(st.skills[0].skillId).length > 1) expect(st.ps.items[1].generatorId).not.toBe(st.ps.items[0].generatorId);
    // the working state never reaches the UI through the profile
    expect('diagnosticRun' in getProfile(ctx, pid).onboarding).toBe(false);
  });

  it('a student who knows everything answers the fewest questions and is pointed to Show What You Know', () => {
    const { view, asked } = play(ctx, pid, () => true);
    expect(view.status).toBe('completed');
    expect(view.phase).toBe('results');
    for (const p of G.diagnosticPlan()) expect(asked.get(p.skillId), p.skillId).toBe(p.group === 'prereq' ? 1 : 2);
    const s = view.summary!;
    expect(s.skills.every((x) => x.verdict === 'strong')).toBe(true);
    expect(s.recommendedLessonId).toBe(LESSONS[0].id);
    const expected = [...new Set(G.COURSE_PROBES.map((sk) => LESSONS.find((l) => l.kind === 'lesson' && l.skillsTaught.includes(sk))!.id))];
    expect(new Set(s.testOutLessonIds)).toEqual(new Set(expected));
    expect(view.canReview).toBe(false);
    expect(() => G.startDiagnosticReview(ctx, pid)).toThrow(/nothing to warm up/);
    // starting mastery is recorded as diagnostic evidence
    const states = skillStates(ctx, pid);
    for (const p of G.diagnosticPlan()) expect(states.get(p.skillId)?.stage, p.skillId).not.toBe('NOT_STARTED');
    // the course map marks the suggested lessons, the profile carries the recommendation
    const course = getCourse(ctx, pid).flatMap((u) => u.lessons);
    for (const id of expected) expect(course.find((l) => l.id === id)!.suggestedTestOut).toBe(true);
    expect(course.filter((l) => l.suggestedTestOut).length).toBe(expected.length);
    expect(getProfile(ctx, pid).onboarding.diagnostic).toBe('completed');
    expect(getProfile(ctx, pid).onboarding.recommendedLessonId).toBe(LESSONS[0].id);
    // it cannot be started again without a parent
    expect(() => G.startDiagnostic(ctx, pid)).toThrow(/already done/);
  });

  it('one slip never decides a skill', () => {
    // prerequisites: miss the first, then get the next two; course skills: right, wrong, right
    const { view, asked } = play(ctx, pid, (skill, k) => (skill.startsWith('P.') ? k > 0 : k !== 1));
    for (const p of G.diagnosticPlan()) expect(asked.get(p.skillId), p.skillId).toBe(3);
    expect(view.summary!.skills.every((x) => x.verdict === 'strong')).toBe(true);
  });

  it('two misses mark a skill as needing work; warm-up practice is offered for weak prerequisites', () => {
    const weak = new Set(['P.FRAC', 'P.SLOPE']);
    const { view, asked } = play(ctx, pid, (skill) => !(weak.has(skill) || skill === 'S3.03'));
    for (const s of weak) expect(asked.get(s)).toBe(2);
    expect(asked.get('S3.03')).toBe(2);
    const s = view.summary!;
    expect(s.skills.filter((x) => x.verdict !== 'strong').map((x) => x.skillId).sort()).toEqual(['P.FRAC', 'P.SLOPE', 'S3.03']);
    expect(s.testOutLessonIds).not.toContain(LESSONS.find((l) => l.skillsTaught.includes('S3.03'))!.id);
    expect(s.headline).toMatch(/Fraction operations/);
    expect(view.canReview).toBe(true);

    // warm-up practice: hints, worked solutions, only the weak prerequisites
    let v = G.startDiagnosticReview(ctx, pid);
    expect(v.phase).toBe('review');
    expect(v.review!.problems[0].hintsAllowed).toBe(true);
    for (let guard = 0; !v.review!.complete; guard++) {
      expect(guard).toBeLessThan(30);
      const p = v.review!.problems[v.review!.currentIndex];
      expect(weak.has(p.skillId), p.skillId).toBe(true);
      if (p.state === 'open') {
        const st = runState(ctx, pid) as unknown as { review: RunShape['ps'] };
        const it = st.review.items.find((i) => i.key === p.key)!;
        v = G.diagnosticReviewHint(ctx, pid, p.key);
        expect(v.review!.problems[v.review!.currentIndex].hintsShown.length).toBe(1);
        v = G.diagnosticReviewSubmit(ctx, pid, p.key, canonicalInput(getProblem(it.generatorId, it.seed, it.difficulty).answer), 20_000);
        expect(v.review!.problems[v.review!.currentIndex].state).toBe('correct');
      }
      if (!v.review!.complete) v = G.diagnosticReviewNext(ctx, pid);
    }
    expect(v.review!.problems.length).toBe(4);
    v = G.closeDiagnosticReview(ctx, pid);
    expect(v.phase).toBe('results');
    expect(v.summary!.skills.length).toBe(G.diagnosticPlan().length);
  });

  it('"I haven\'t learned this yet" records no wrong answer and moves on', () => {
    const { view, asked } = play(ctx, pid, (skill) => (skill.startsWith('S') ? 'not-learned' : true));
    for (const s of G.COURSE_PROBES) expect(asked.get(s)).toBe(1);
    expect(view.summary!.skills.filter((x) => x.group === 'course').every((x) => x.verdict === 'not-learned')).toBe(true);
    expect(view.summary!.testOutLessonIds).toEqual([]);
    expect(ctx.db.get<{ n: number }>("SELECT COUNT(*) AS n FROM attempts WHERE profile_id = ? AND skill_id LIKE 'S%'", [pid])!.n).toBe(0);
    expect(skillStates(ctx, pid).has('S1.02')).toBe(false);
  });

  it('saves after every answer, so it can be paused and resumed', () => {
    let v = G.startDiagnostic(ctx, pid);
    const first = v.problem!.key;
    v = G.diagnosticSubmit(ctx, pid, first, rightAnswer(ctx, pid, first), 20_000);
    const second = v.problem!.key;
    // closing and reopening shows the same question; starting again resumes instead of restarting
    expect(G.getDiagnostic(ctx, pid).problem!.key).toBe(second);
    expect(G.startDiagnostic(ctx, pid).problem!.key).toBe(second);
    expect(G.getDiagnostic(ctx, pid).progress.answered).toBe(1);
    expect(getProfile(ctx, pid).onboarding.diagnostic).toBe('in_progress');
  });

  it('only a parent can skip it, and a parent can offer it again', async () => {
    const api = createApi(ctx);
    await expect(api.skipDiagnostic('0000', pid)).rejects.toThrow();
    expect(G.getDiagnostic(ctx, pid).status).toBe('offered');
    // the student UI cannot change the diagnostic status or the recommendation
    setOnboarding(ctx, pid, { diagnostic: 'skipped', recommendedLessonId: 'U9L06' } as never);
    expect(getProfile(ctx, pid).onboarding.diagnostic).toBe('offered');
    expect(getProfile(ctx, pid).onboarding.recommendedLessonId).toBeUndefined();
    let v = await api.skipDiagnostic('2468', pid);
    expect(v.status).toBe('skipped');
    expect(() => G.startDiagnostic(ctx, pid)).toThrow(/parent skipped/);
    v = await api.reofferDiagnostic('2468', pid);
    expect(v.status).toBe('offered');
    v = await api.startDiagnostic(pid);
    expect(v.phase).toBe('questions');
    await expect(api.reofferDiagnostic('1111', pid)).rejects.toThrow();
  });

  it('can be retaken after a parent offers it again, and the new run decides the new results', async () => {
    play(ctx, pid, (skill) => skill.startsWith('P.'));
    expect(getProfile(ctx, pid).onboarding.diagnosticSummary!.testOutLessonIds).toEqual([]);
    G.reofferDiagnostic(ctx, pid);
    const { view } = play(ctx, pid, () => true);
    expect(view.summary!.testOutLessonIds.length).toBeGreaterThan(0);
    // both runs' answers stay in the record
    expect(ctx.db.get<{ n: number }>("SELECT COUNT(*) AS n FROM attempts WHERE profile_id = ? AND activity = 'diagnostic'", [pid])!.n).toBeGreaterThan(G.diagnosticPlan().length * 2);
  });
});
