/**
 * Achievements (spec §20). Every achievement is earned from recorded learning evidence,
 * never from clicking around, and is awarded once.
 */
import type { Achievement } from '../../shared/api';
import { computeStreak } from '../../core/engine/dates';
import { ServiceContext, today } from './context';
import { logActivity } from './records';

interface Facts {
  correctAnswers: number;
  lessonsCompleted: number;
  quizzesPassed: number;
  perfectQuizzes: number;
  testOuts: number;
  proficientSkills: number;
  masteredSkills: number;
  longestStreak: number;
  teachAgainThenPassed: boolean;
  correctionsDone: number;
  unitAssessmentsPassed: number;
}

interface AchievementDef {
  id: string;
  title: string;
  description: string;
  icon: string;
  earned: (f: Facts) => boolean;
}

export const ACHIEVEMENTS: AchievementDef[] = [
  { id: 'first-correct', title: 'First Step', description: 'Answer your first problem correctly.', icon: 'spark', earned: (f) => f.correctAnswers >= 1 },
  { id: 'correct-50', title: 'Problem Solver', description: 'Answer 50 problems correctly.', icon: 'check', earned: (f) => f.correctAnswers >= 50 },
  { id: 'correct-250', title: 'Equation Engine', description: 'Answer 250 problems correctly.', icon: 'gear', earned: (f) => f.correctAnswers >= 250 },
  { id: 'first-lesson', title: 'Lesson One', description: 'Complete your first lesson.', icon: 'book', earned: (f) => f.lessonsCompleted >= 1 },
  { id: 'lessons-10', title: 'Ten Down', description: 'Complete 10 lessons.', icon: 'books', earned: (f) => f.lessonsCompleted >= 10 },
  { id: 'lessons-45', title: 'Halfway There', description: 'Complete 45 lessons and assessments.', icon: 'flag', earned: (f) => f.lessonsCompleted >= 45 },
  { id: 'first-quiz', title: 'Quiz Ready', description: 'Pass your first lesson quiz.', icon: 'star', earned: (f) => f.quizzesPassed >= 1 },
  { id: 'perfect-quiz', title: 'Perfect Score', description: 'Score 100% on a lesson quiz.', icon: 'trophy', earned: (f) => f.perfectQuizzes >= 1 },
  { id: 'test-out', title: 'Show What You Know', description: 'Test out of a lesson.', icon: 'rocket', earned: (f) => f.testOuts >= 1 },
  { id: 'proficient-5', title: 'Getting Solid', description: 'Reach Proficient on 5 skills.', icon: 'shield', earned: (f) => f.proficientSkills >= 5 },
  { id: 'mastered-1', title: 'Mastery', description: 'Master your first skill.', icon: 'crown', earned: (f) => f.masteredSkills >= 1 },
  { id: 'mastered-20', title: 'Skill Collector', description: 'Master 20 skills.', icon: 'gem', earned: (f) => f.masteredSkills >= 20 },
  { id: 'streak-3', title: 'On a Roll', description: 'Study 3 days in a row.', icon: 'flame', earned: (f) => f.longestStreak >= 3 },
  { id: 'streak-7', title: 'Week Strong', description: 'Study 7 days in a row.', icon: 'flame', earned: (f) => f.longestStreak >= 7 },
  { id: 'comeback', title: 'Comeback', description: 'Use Teach Me Again and then pass the quiz.', icon: 'refresh', earned: (f) => f.teachAgainThenPassed },
  { id: 'corrections', title: 'Learn From Mistakes', description: 'Finish 10 quiz corrections.', icon: 'pencil', earned: (f) => f.correctionsDone >= 10 },
  { id: 'unit-pass', title: 'Unit Complete', description: 'Pass a unit assessment.', icon: 'medal', earned: (f) => f.unitAssessmentsPassed >= 1 },
];

function num(ctx: ServiceContext, sql: string, params: unknown[]): number {
  const r = ctx.db.get<{ n: number | null }>(sql, params as never);
  return Number(r?.n ?? 0);
}

function facts(ctx: ServiceContext, profileId: number): Facts {
  const days = ctx.db.all<{ local_date: string }>('SELECT local_date FROM activity_days WHERE profile_id = ? AND qualifying = 1', [profileId]).map((r) => r.local_date);
  const firstTeachAgain = num(ctx, 'SELECT MIN(created_at) AS n FROM teach_again_events WHERE profile_id = ?', [profileId]);
  return {
    correctAnswers: num(ctx, "SELECT COUNT(*) AS n FROM attempts WHERE profile_id = ? AND correct = 1 AND activity NOT IN ('diagnostic')", [profileId]),
    lessonsCompleted: num(ctx, "SELECT COUNT(*) AS n FROM lesson_progress WHERE profile_id = ? AND status IN ('completed','tested_out')", [profileId]),
    quizzesPassed: num(ctx, "SELECT COUNT(DISTINCT ref_id) AS n FROM assessments WHERE profile_id = ? AND kind = 'quiz' AND status = 'completed' AND score >= 0.8 * max_score", [profileId]),
    perfectQuizzes: num(ctx, "SELECT COUNT(*) AS n FROM assessments WHERE profile_id = ? AND kind = 'quiz' AND status = 'completed' AND max_score > 0 AND score = max_score", [profileId]),
    testOuts: num(ctx, "SELECT COUNT(*) AS n FROM lesson_progress WHERE profile_id = ? AND status = 'tested_out'", [profileId]),
    proficientSkills: num(ctx, "SELECT COUNT(*) AS n FROM skill_state WHERE profile_id = ? AND stage IN ('PROFICIENT','MASTERED')", [profileId]),
    masteredSkills: num(ctx, "SELECT COUNT(*) AS n FROM skill_state WHERE profile_id = ? AND stage = 'MASTERED'", [profileId]),
    longestStreak: computeStreak(days, today(ctx)).longest,
    teachAgainThenPassed:
      firstTeachAgain > 0 &&
      num(
        ctx,
        "SELECT COUNT(*) AS n FROM assessments a WHERE a.profile_id = ? AND a.kind = 'quiz' AND a.status = 'completed' AND a.score >= 0.8 * a.max_score AND EXISTS (SELECT 1 FROM teach_again_events t WHERE t.profile_id = a.profile_id AND t.lesson_id = a.ref_id AND t.created_at <= a.finished_at)",
        [profileId],
      ) > 0,
    correctionsDone: num(ctx, "SELECT COUNT(DISTINCT problem_key) AS n FROM attempts WHERE profile_id = ? AND activity = 'corrections' AND correct = 1", [profileId]),
    unitAssessmentsPassed: num(ctx, "SELECT COUNT(DISTINCT ref_id) AS n FROM assessments WHERE profile_id = ? AND kind = 'unit-assessment' AND status = 'completed' AND score >= 0.7 * max_score", [profileId]),
  };
}

/** Award any newly earned achievements; returns their ids. */
export function checkAchievements(ctx: ServiceContext, profileId: number): string[] {
  const have = new Set(ctx.db.all<{ achievement_id: string }>('SELECT achievement_id FROM achievements WHERE profile_id = ?', [profileId]).map((r) => r.achievement_id));
  const f = facts(ctx, profileId);
  const out: string[] = [];
  for (const a of ACHIEVEMENTS) {
    if (have.has(a.id) || !a.earned(f)) continue;
    ctx.db.run('INSERT OR IGNORE INTO achievements(profile_id, achievement_id, earned_at) VALUES (?,?,?)', [profileId, a.id, ctx.now()]);
    logActivity(ctx, profileId, 'achievement', { id: a.id, title: a.title });
    out.push(a.id);
  }
  return out;
}

export function listAchievements(ctx: ServiceContext, profileId: number): Achievement[] {
  const earned = new Map(ctx.db.all<{ achievement_id: string; earned_at: number }>('SELECT achievement_id, earned_at FROM achievements WHERE profile_id = ?', [profileId]).map((r) => [r.achievement_id, r.earned_at]));
  return ACHIEVEMENTS.map((a) => ({ id: a.id, title: a.title, description: a.description, icon: a.icon, earnedAt: earned.get(a.id) ?? null }));
}
