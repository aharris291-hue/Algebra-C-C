# Grading, mastery and XP

All three are computed in the main process from stored records (`src/core/engine/*`), so any number can be recomputed from the database.

## Course grade (`grading.ts`)

| Category | Weight | What counts |
|---|---|---|
| Lesson quizzes | 30% | Best attempt per lesson. A passed Show What You Know (≥ 85%) counts as that lesson's quiz. |
| Unit assessments | 45% | Best of the **first two** attempts per unit. |
| Semester assessment | 20% | Best attempt. |
| Practice completion | 5% | Share of started lessons whose independent practice was completed. Accuracy in practice never lowers the grade. |

- Unit reviews, the checkpoint, cumulative and semester reviews, and the three capstone projects (days 85-87) are not graded: they give practice with hints and show which skills to review. Their answers still count toward skill mastery, like any practice.
- Categories with no work yet are left out and the remaining weights are rescaled (e.g. quizzes only = 100% quizzes).
- Practice completion alone never produces a grade.
- Letters: A ≥ 90, B ≥ 80, C ≥ 70, below 70 F. Percentages are rounded to one decimal.

## Lesson flow and passing

- Quiz pass: 80% (per-lesson setting). Quizzes use deferred feedback and no hints.
- A failed quiz leads to feedback, corrections, Teach Me Again and targeted practice on the missed skills, then a retake with new questions. Retakes are unlimited; the best score counts.
- The next lesson unlocks when a lesson is completed, tested out, or after two quiz attempts, so a student is never stuck.
- Show What You Know: the quiz plus two harder items, no hints, 85% to pass. Failing it has no penalty; the student learns the lesson normally.

## Skill mastery (`mastery.ts`)

Each skill's state is replayed from all counted answers in time order (deterministic).

- Score: weighted average of the last 12 answers. Newer answers weigh more (×0.85 per step back). Quizzes ×1.5, assessments and test-outs ×2, independent practice ×1, remediation ×0.7, guided ×0.5. Credit is reduced by hints (−0.15 per hint level, minimum 0.3) and retries (0.6).
- Learning: fewer than 3 answers or score < 0.5. Developing: score < 0.75 or fewer than 2 independent correct answers. Proficient: score ≥ 0.75 with ≥ 2 independent correct answers.
- **Mastered:** score ≥ 0.88, ≥ 6 answers, ≥ 4 independent correct answers, a correct quiz/assessment answer, **and independent correct work spanning at least 20 hours** (a later study day), so mastery means retained, not just done once.
- A mastered skill drops only if its score falls below 0.7 (one missed review does not remove it).
- Spaced review: Proficient/Mastered skills come back after 2, 4, 7, 14, 30 days; review items are mixed into later practice.

## XP (`xp.ts`)

- Correct answer: base by activity (guided 5, remediation 6, independent/review 10, quiz 15, assessment 20) × difficulty (1, 1.25, 1.5); second try ×0.5, later tries ×0.25; hints −20% per level (minimum 40%); multiple choice ×0.5.
- **No XP** for an answer flagged as guessing: a retry within 4 seconds, or 3 wrong answers within 30 seconds.
- One-time awards: lesson complete 50, quiz pass 25 (+25 at ≥ 90%), test-out 75, skill Proficient 20, skill Mastered 40.
- Levels: total XP for level L is 50·L·(L−1) (L2 = 100, L3 = 300, L4 = 600 …).

## Streaks (`dates.ts`)

A day counts (local calendar date) when the student answers at least 5 problems, studies at least 10 active minutes, or completes a lesson section. Active time counts only while the window is visible and the student has interacted in the last 90 seconds.
