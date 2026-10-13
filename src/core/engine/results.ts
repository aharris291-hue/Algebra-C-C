/**
 * The skill summary shown with every graded set (quiz, Show What You Know, assessment, review):
 * what the student did well on and what needs practice. Pure, so the stored summary and a summary
 * rebuilt from an older saved assessment always agree.
 */

import { MAX_UNIT_ASSESSMENT_ATTEMPTS } from './grading';

/** A skill counts as a strength when at least this share of its items was right. */
export const DID_WELL_SHARE = 2 / 3;

export interface SkillSummary {
  didWell: string[];
  needsPractice: string[];
}

/**
 * didWell: skills answered right at least DID_WELL_SHARE of the time (so a skill with one slip in
 * three still shows as a strength, and a 4/6 quiz still names what went well), or, when no skill
 * reaches that, the skills that were at least half right; needsPractice: every
 * skill with a miss. A skill can be in both (mostly right, with one item to correct).
 * Both lists keep the order the skills first appear in.
 */
export function summarizeSkills(items: ReadonlyArray<{ skill: string; correct: boolean }>): SkillSummary {
  const tally = new Map<string, { right: number; total: number }>();
  for (const it of items) {
    const t = tally.get(it.skill) ?? { right: 0, total: 0 };
    t.total++;
    if (it.correct) t.right++;
    tally.set(it.skill, t);
  }
  const didWell: string[] = [];
  const needsPractice: string[] = [];
  for (const [skill, t] of tally) {
    if (t.right > 0 && t.right / t.total >= DID_WELL_SHARE - 1e-9) didWell.push(skill);
    if (t.right < t.total) needsPractice.push(skill);
  }
  // nothing at two thirds: still name the skills that were at least half right
  if (!didWell.length) for (const [skill, t] of tally) if (t.right > 0 && t.right * 2 >= t.total) didWell.push(skill);
  return { didWell, needsPractice };
}

/** What the recommended next step depends on (the same for a fresh result and one rebuilt from a saved row). */
export interface NextStepInput {
  /** the graded set: 'quiz', 'test-out', 'unit-assessment', 'semester-assessment', 'capstone', or a review day's kind */
  kind: string;
  passed: boolean;
  /** names of the skills with a miss */
  needsPractice: string[];
  /** number of items missed */
  missed: number;
  attemptNumber: number;
  /** an assessment that was already passed on an earlier attempt */
  alreadyPassed?: boolean;
}


/**
 * The recommended next step shown with every graded set. The one place this wording lives: the
 * results page right after grading, the summary stored with the assessment row, and the summary
 * rebuilt for a row saved before summaries were stored (v0.16) all come from here.
 */
export function nextStepFor(r: NextStepInput): string {
  const focus = r.needsPractice.join(', ');
  if (r.kind === 'test-out')
    return r.passed
      ? r.needsPractice.length
        ? `You tested out! Look over the question${r.missed === 1 ? '' : 's'} you missed below (${focus}), then continue to the summary and move on to the next lesson.`
        : 'You tested out with every question right! Continue to the summary and move on to the next lesson.'
      : 'No problem. Work through the lesson; it will make the quiz much easier.';
  if (r.kind === 'quiz')
    return r.passed
      ? r.needsPractice.length
        ? `Review the corrections for ${focus}, then finish the lesson.`
        : 'Great work. Finish the lesson and move on.'
      : `Use Teach Me Again and the targeted practice on ${focus}, then retake the quiz.`;
  if (r.kind === 'unit-assessment' || r.kind === 'semester-assessment') {
    const semester = r.kind === 'semester-assessment';
    const practiceRetake = !semester && r.attemptNumber > MAX_UNIT_ASSESSMENT_ATTEMPTS;
    const retakeHelp = semester
      ? 'Work through the corrections, then retake it. Your best attempt counts toward your grade.'
      : r.attemptNumber < MAX_UNIT_ASSESSMENT_ATTEMPTS
        ? 'Work through the corrections, then retake it. Your best of the first two attempts counts toward your grade.'
        : 'Work through the corrections. You can retake it for practice, but only the first two attempts count toward your grade.';
    return (
      (practiceRetake ? 'This was a practice retake: only the first two attempts count toward your grade. ' : '') +
      (r.passed ? (r.needsPractice.length ? 'Nice work. Fix the questions you missed in the corrections below, then move on.' : 'Outstanding. Move on to the next unit.') : `Not yet. Focus on ${focus}. ${retakeHelp}`) +
      (r.alreadyPassed ? ' You had already passed, so this retake earns no answer XP.' : '')
    );
  }
  if (r.kind === 'capstone')
    return r.needsPractice.length
      ? `Project complete. Before the semester review, go back over ${focus}. The lesson for each skill has Teach Me Again and more practice.`
      : 'Project complete, and every part right on the first try. On to the next day.';
  return r.needsPractice.length ? `Before the assessment, go back over ${focus}. The lesson for each skill has Teach Me Again and more practice.` : 'You are ready for the assessment.';
}
