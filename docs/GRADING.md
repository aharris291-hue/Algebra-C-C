# Grading, mastery and XP

All three are computed in the main process from stored records (`src/core/engine/*`), so any number can be recomputed from the database.

## Course grade (`grading.ts`)

| Category | Weight | What counts |
|---|---|---|
| Lesson quizzes | 30% | Best attempt per lesson. A passed Show What You Know (≥ 85%) counts as that lesson's quiz. |
| Unit assessments | 45% | Best of the **first two** attempts per unit. |
| Semester assessment | 20% | Best attempt. |
| Practice completion | 5% | Share of started instructional lessons whose independent practice was completed (counted as soon as the practice set is complete; a tested-out lesson counts as complete). Review, assessment and project days have no independent practice and are not part of it. The lesson being worked on right now is left out until its practice is done, so opening a lesson never lowers the grade; a lesson left unfinished while the student moved on to a later day counts as incomplete. Accuracy in practice never lowers the grade. |

- Unit reviews, the checkpoint, cumulative and semester reviews, and the three capstone projects (days 85-87) are not graded: they give practice with hints and show which skills to review. Their answers still count toward skill mastery, like any practice.
- The diagnostic (placement check) is not graded. Its answers count toward skill mastery as diagnostic evidence (×1.5), and it can suggest Show What You Know lessons and warm-up practice; see below.
- Categories with no work yet are left out and the remaining weights are rescaled (e.g. quizzes only = 100% quizzes).
- Practice completion alone never produces a grade.
- Letters: A ≥ 90, B ≥ 80, C ≥ 70, below 70 F. Percentages are rounded to one decimal.
- Grade trend (Parent Dashboard): one point per day with graded work, each computed from the work and the practice completion as of that moment, plus a point for today whenever the grade has changed since; the last point always equals the current grade.
- Course map: a unit assessment shows its graded score (best of the first two attempts); the semester assessment its best attempt. A third or later unit-assessment attempt is a practice retake: it is labelled "practice retake, not graded" and never changes the shown score.

## Lesson flow and passing

- Quiz pass: 80% (per-lesson setting). Quizzes use deferred feedback and no hints.
- Saving a quiz, Show What You Know or assessment answer: an answer that cannot be read, or that is not written in the form the question asks for (e.g. slope-intercept instead of standard form, an exact √61 on a "round to the nearest tenth" question, an unsimplified 3 + 4), is **not saved**. The student sees what to fix (the message is the same whether the value is right or wrong, so it gives nothing away), and the question stays unanswered until a readable answer in the requested form is saved. A correct value in the wrong form is therefore never graded wrong unless the student chooses to keep it: saving the same answer a second time keeps it as written (so no one is ever stuck on a question), and it is then graded as written. Re-saving over a saved answer with a typo keeps the earlier saved answer and says so.
- A failed quiz leads to feedback, corrections, Teach Me Again and targeted practice on the missed skills, then a retake with new questions. Retakes are unlimited; the best score counts.
- The next lesson unlocks when a lesson is completed, tested out, or after **two honest quiz attempts**, so a student is never stuck. An attempt is honest when the student scored at least 50% on it, or solved (with or without hints, not by revealing the solution) at least one problem in the practice before it: guided or independent practice for the first attempt, the targeted practice for a retake. Hints always lead to a solved problem, so a struggling student who tries is never stranded; two attempts with every practice problem revealed and junk quiz answers do not unlock the next lesson. Lessons saved by older versions count every attempt.
- Show What You Know: the quiz plus two harder items, no hints, 85% to pass. Failing it has no penalty; the student learns the lesson normally. It is offered (on the course map too) until the first quiz attempt or a finished test-out, also when the lesson has been opened; starting it again before finishing resumes the same questions.
- Quiz and assessment times are active time: each gap between two actions counts at most 10 minutes and a gap that runs backwards (clock changed) counts zero, so closing the app overnight mid-quiz adds at most 10 minutes and a time is never negative. Results are saved to disk immediately.

## Skill mastery (`mastery.ts`)

Each skill's state is replayed from all counted answers in time order (deterministic).

- Score: weighted average of the last 12 answers. Newer answers weigh more (×0.85 per step back). Quizzes ×1.5, assessments and test-outs ×2, independent practice ×1, remediation ×0.7, guided ×0.5. Credit is reduced by hints (−0.15 per hint level, minimum 0.3) and retries (0.6).
- Learning: fewer than 3 answers or score < 0.5 (a diagnostic answer counts as 1.5 answers here, so two correct placement answers are enough to set a starting stage). Developing: score < 0.75 or fewer than 2 independent correct answers. Proficient: score ≥ 0.75 with ≥ 2 independent correct answers.
- **Mastered:** score ≥ 0.88, ≥ 6 answers, ≥ 4 independent correct answers, a correct quiz/assessment answer, **and independent correct work spanning at least 20 hours** (a later study day), so mastery means retained, not just done once.
- A mastered skill drops only when its score falls below 0.7 **and** at least 2 of the answers since it was mastered (within the last 12) were misses. One miss never removes it, even on a unit assessment or an easy quiz item.
- Spaced review: Proficient/Mastered skills come back after 2, 4, 7, 14, 30 days; review items are mixed into later practice. The first review is 2 days after the skill reaches Proficient. Only an answer given once the skill is due counts as a review: a correct one moves to the next interval, a miss brings the skill back the next day and restarts the ladder. Correct practice before the due date keeps the current interval, counted from that latest work; a miss before then also brings it back the next day.

## Diagnostic / placement check (`diagnostic.ts`)

Offered after the first profile is created and on the home screen until it is taken; a parent can skip it (or offer it again) with the Parent PIN.

- Part 1 checks the 12 earlier-grade prerequisite skills; Part 2 probes 8 key course skills (S1.02, S1.05, S1.07, S1.09, S1.12, S2.01, S3.03, S5.01).
- One question at a time, no hints, no right/wrong feedback. "I haven't learned this yet" marks the skill not learned and records no wrong answer.
- Evidence rule (one slip never decides a skill): a prerequisite is shown by a first correct answer; after a miss, two misses mean it needs a refresh, and a miss then a correct answer goes to a third question. A course skill needs two correct answers; two misses mean it is still to learn; a split goes to a third question. At most 3 questions per skill.
- Starting mastery: the answers count as diagnostic evidence, so a course skill shown with two correct answers starts at Proficient (never Mastered, which needs quiz/assessment work on more than one day), and a skill with two misses stays Learning. A stage set by the diagnostic alone gives no milestone XP; that is earned in lessons.
- Results: each skill's verdict, a starting lesson (the first open lesson), Show What You Know suggestions for lessons whose course skill was shown (marked on the course map), and optional warm-up practice (hints, worked solutions) on prerequisites that need a refresh.

## XP (`xp.ts`)

- Correct answer: base by activity (guided 5, remediation 6, independent/review 10, quiz 15, assessment 20) × difficulty (1, 1.25, 1.5); second try ×0.5, later tries ×0.25; hints −20% per level (minimum 40%); multiple choice ×0.5. In guided steps, tries are counted per step: a slip on an earlier step does not make the final step a "second try". An answer sent again for a guided step that is already done (a double click) is ignored, not graded against the next step.
- **No XP** for an answer flagged as guessing: a retry within 4 seconds of the previous wrong try (timed by the main process from when that feedback was given), or 3 wrong answers within 30 seconds. Quiz, assessment and test-out answers are graded all at once when the set is finished, so they are left out of the "3 wrong in 30 seconds" count; corrections made right after a quiz are not called guessing.
- One-time awards: lesson complete 50, quiz pass 25 (+25 at ≥ 90%), test-out 75, skill Proficient 20, skill Mastered 40.
- Retakes cannot farm XP: a quiz or assessment retake pays answer XP only for improving on the best earlier attempt (the total paid for a lesson's quiz answers equals its best attempt), and a unit/semester assessment retake after a pass pays no answer XP. Remediation and correction answers earn at most 60 XP per lesson or day in total, below the pass bonuses, so failing on purpose never earns more than passing.
- Levels: total XP for level L is 50·L·(L−1) (L2 = 100, L3 = 300, L4 = 600 …).

## Streaks (`dates.ts`)

A day counts (local calendar date) when the student resolves at least 5 problems (wrong tries and answers flagged as guessing do not count), studies at least 10 active minutes, or completes a piece of practice work: a guided or independent practice set, a quiz, or a review/assessment/project day (reading lesson pages such as the goal, instruction or examples does not count on its own). Active time counts only while the window is visible and the student has interacted in the last 90 seconds (measured with a monotonic clock, so changing the system clock cannot credit idle time). One heartbeat timer runs for the whole session, so moving between screens does not drop time.

Minutes are rounded per day and every total adds up days, so today's, each week's and the all-time minutes always agree. A weekly report shows the current streak for this week; for a past week, the streak as it stood at the end of that week's last study day.
