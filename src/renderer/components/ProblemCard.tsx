/** One problem: prompt, guided steps, answer input, feedback, hints, and the worked solution. */
import { useEffect, useRef, useState } from 'react';
import type { ProblemView } from '../../shared/api';
import { Blocks, Steps } from './Blocks';
import { Inline } from './RichText';
import { MathInput } from './MathInput';
import { playSound } from '../sound';

export interface ProblemActions {
  submit(key: string, response: string, elapsedMs: number): Promise<void>;
  hint?(key: string): Promise<void>;
  reveal?(key: string): Promise<void>;
}

const DIFF = ['', 'Level 1', 'Level 2', 'Level 3'];

export function ProblemCard({ p, actions, deferred, busy }: { p: ProblemView; actions: ProblemActions; deferred: boolean; busy: boolean }) {
  const [value, setValue] = useState(deferred ? p.lastResponse ?? '' : '');
  const shownAt = useRef(Date.now());
  const stepKey = `${p.key}:${p.step?.index ?? 0}`;
  useEffect(() => {
    shownAt.current = Date.now();
    setValue(deferred ? p.lastResponse ?? '' : '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepKey]);

  // a quiet cue when an answer is checked correct (only if sound is on in Settings)
  const fbSig = `${stepKey}:${p.lastFeedback?.status}:${p.lastFeedback?.message}`;
  const lastSig = useRef(fbSig);
  useEffect(() => {
    if (fbSig !== lastSig.current && !deferred && p.lastFeedback?.status === 'correct') playSound('correct');
    lastSig.current = fbSig;
  }, [fbSig, deferred, p.lastFeedback]);

  const finished = p.state !== 'open';
  const kind = p.step?.answerKind ?? p.answerKind;
  const choices = p.step ? p.step.choices : p.choices;
  const submit = (v = value) => {
    if (!v.trim() || busy || finished) return;
    actions.submit(p.key, v, Date.now() - shownAt.current);
  };
  const saved = deferred && p.lastResponse !== undefined;
  const fb = p.lastFeedback;

  return (
    <article className={`problem ${finished ? "problem-finished" : ""}`} aria-labelledby={`pq-${p.key}`} data-key={p.key} data-state={p.state}>
      <header className="problem-head">
        <span id={`pq-${p.key}`} className="problem-number">
          Problem {p.index + 1}
          {p.total > 1 ? ` of ${p.total}` : ''}
        </span>
        <span className="problem-meta">
          {p.tags.includes('review') && <span className="tag tag-review">Review</span>}
          <span className="tag">{p.skillName}</span>
          <span className="tag tag-muted">{DIFF[p.difficulty]}</span>
        </span>
      </header>
      <div className="problem-prompt">
        <Blocks blocks={p.prompt} />
      </div>

      {p.step && (
        <div className="guided-steps">
          {p.step.completed.map((s, i) => (
            <div key={i} className="guided-step done">
              <span className="step-badge">✓ Step {i + 1}</span>
              <Blocks blocks={s.prompt} />
              <div className="step-explain">
                <Inline text={s.explanation} />
              </div>
            </div>
          ))}
          {!finished && (
            <div className="guided-step current">
              <span className="step-badge">
                Step {p.step.index + 1} of {p.step.total}
              </span>
              <Blocks blocks={p.step.prompt} />
            </div>
          )}
        </div>
      )}

      {!finished && (
        <div className="answer-area">
          {kind === 'choice' && choices ? (
            <div className="choices" role="radiogroup" aria-label="Answer choices">
              {choices.map((c) => (
                <button
                  key={c.id}
                  role="radio"
                  aria-checked={value === c.id}
                  className={`choice ${value === c.id ? 'choice-selected' : ''}`}
                  disabled={busy}
                  onClick={() => {
                    setValue(c.id);
                    if (!deferred) submit(c.id);
                  }}
                >
                  <Inline text={c.label} />
                </button>
              ))}
            </div>
          ) : (
            <MathInput kind={kind} value={value} onChange={setValue} onSubmit={() => submit()} disabled={busy} unit={p.unit} inputHint={p.step?.inputHint ?? p.inputHint} autoFocus label={`Answer for problem ${p.index + 1}`} />
          )}
          <div className="answer-actions">
            {(kind !== 'choice' || deferred) && (
              <button className="btn btn-primary" disabled={!value.trim() || busy} onClick={() => submit()}>
                {deferred ? (saved && value === p.lastResponse ? 'Answer saved ✓' : 'Save answer') : 'Check answer'}
              </button>
            )}
            {p.hintsAllowed && actions.hint && (
              <button className="btn" disabled={p.hintsRemaining === 0 || busy} onClick={() => actions.hint!(p.key)}>
                {p.hintsShown.length === 0 ? 'Get a hint' : p.hintsRemaining > 0 ? 'Next hint' : 'No more hints'}
              </button>
            )}
            {p.canReveal && actions.reveal && (
              <button className="btn btn-quiet" disabled={busy} onClick={() => actions.reveal!(p.key)}>
                Show me the solution
              </button>
            )}
          </div>
        </div>
      )}

      {p.hintsShown.length > 0 && (
        <ol className="hints" aria-label="Hints">
          {p.hintsShown.map((h, i) => (
            <li key={i} className="hint">
              <span className="hint-label">Hint {i + 1}</span>
              <Inline text={h} />
            </li>
          ))}
        </ol>
      )}

      {fb && !deferred && (
        <div className={`feedback feedback-${fb.status}`} role="status" aria-live="polite">
          <strong>{fb.status === 'correct' ? '✓ ' : fb.status === 'invalid' ? '? ' : fb.status === 'wrong-form' ? '≈ ' : '✗ '}</strong>
          <Inline text={fb.message} />
          {fb.xp ? <span className="xp-pop">+{fb.xp} XP</span> : null}
        </div>
      )}
      {fb && deferred && fb.status === 'invalid' && (
        <div className="feedback feedback-invalid" role="status">
          <Inline text={fb.message} />
        </div>
      )}
      {p.suggestion && !finished && <div className="suggestion">{p.suggestion}</div>}

      {finished && p.solution && (
        <details className="solution" open={p.state !== 'correct'}>
          <summary>
            {p.state === 'correct' ? 'See the worked solution' : 'Worked solution'}
            {p.correctAnswer && (
              <span className="correct-answer">
                {' '}
                · Answer: <Inline text={p.correctAnswer} />
              </span>
            )}
          </summary>
          <Steps items={p.solution} />
        </details>
      )}
    </article>
  );
}
