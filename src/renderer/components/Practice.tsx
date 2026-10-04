/** A practice set (guided, independent, quiz, corrections, remediation) with navigation. */
import type { PracticeView } from '../../shared/api';
import { ProblemCard, ProblemActions } from './ProblemCard';

export function PracticePanel(props: {
  practice: PracticeView;
  actions: ProblemActions & { next(): Promise<void>; select(i: number): Promise<void>; finishQuiz?(): Promise<void> };
  busy: boolean;
  title?: string;
  intro?: string;
}) {
  const { practice, actions, busy } = props;
  const cur = practice.problems[practice.currentIndex];
  const deferred = practice.deferredFeedback;
  const answered = practice.problems.filter((p) => p.lastResponse !== undefined && p.lastResponse !== '').length;
  const allAnswered = deferred && practice.problems.every((p) => p.lastResponse !== undefined && p.lastResponse !== '');
  const curDone = cur && cur.state !== 'open';
  const isLast = practice.currentIndex >= practice.problems.length - 1;

  return (
    <section className="practice" aria-label={props.title ?? 'Practice'}>
      {props.intro && <p className="practice-intro">{props.intro}</p>}
      <nav className="problem-dots" aria-label="Problems">
        {practice.problems.map((p, i) => {
          const status = deferred ? (p.lastResponse ? 'answered' : 'open') : p.state;
          const canGo = deferred || i <= practice.currentIndex;
          return (
            <button
              key={p.key}
              className={`dot dot-${status} ${i === practice.currentIndex ? 'dot-current' : ''}`}
              aria-label={`Problem ${i + 1}, ${status === 'open' ? 'not answered' : status}`}
              aria-current={i === practice.currentIndex ? 'step' : undefined}
              disabled={!canGo || busy}
              onClick={() => actions.select(i)}
            >
              {i + 1}
            </button>
          );
        })}
        {practice.requiredCorrect ? (
          <span className="practice-progress">
            {practice.correctCount} of {practice.requiredCorrect} correct needed
          </span>
        ) : deferred ? (
          <span className="practice-progress">
            {answered} of {practice.problems.length} answered
          </span>
        ) : null}
      </nav>
      {cur && <ProblemCard key={cur.key} p={cur} actions={actions} deferred={deferred} busy={busy} />}
      <div className="practice-nav">
        {deferred ? (
          <>
            <button className="btn" disabled={practice.currentIndex === 0 || busy} onClick={() => actions.select(practice.currentIndex - 1)}>
              ← Previous
            </button>
            {!isLast && (
              <button className="btn" disabled={busy} onClick={() => actions.select(practice.currentIndex + 1)}>
                Next →
              </button>
            )}
            {actions.finishQuiz && (
              <button className="btn btn-primary" disabled={!allAnswered || busy} onClick={() => actions.finishQuiz!()} title={allAnswered ? '' : 'Answer every question first'}>
                Finish and grade
              </button>
            )}
          </>
        ) : (
          curDone &&
          !practice.complete && (
            <button className="btn btn-primary" autoFocus disabled={busy} onClick={() => actions.next()}>
              {isLast ? 'Continue' : 'Next problem →'}
            </button>
          )
        )}
      </div>
    </section>
  );
}
