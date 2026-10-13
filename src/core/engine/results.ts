/**
 * The skill summary shown with every graded set (quiz, Show What You Know, assessment, review):
 * what the student did well on and what needs practice. Pure, so the stored summary and a summary
 * rebuilt from an older saved assessment always agree.
 */

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
