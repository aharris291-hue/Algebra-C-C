/** Quiz / assessment results with item review (spec §16). */
import type { ResultsView } from '../../shared/api';
import { Blocks, Steps } from './Blocks';
import { Inline } from './RichText';
import { STAGE_LABEL } from '../labels';

function fmtDuration(ms: number): string {
  const m = Math.round(ms / 60000);
  return m < 1 ? 'under a minute' : `${m} minute${m === 1 ? '' : 's'}`;
}

export function Results({ r }: { r: ResultsView }) {
  return (
    <section className="results" aria-label="Results">
      <div className={`score-card ${r.passed ? 'passed' : 'not-yet'}`}>
        <div className="score-big">{r.percent}%</div>
        <div>
          <div className="score-line">
            {r.score} of {r.maxScore} correct · {r.passed ? 'Passed' : `Not yet (${r.passPercent}% passes)`}
          </div>
          <div className="score-sub">
            Attempt {r.attemptNumber} · {fmtDuration(r.durationMs)}
            {r.xpEarned > 0 && <span className="xp-chip">+{r.xpEarned} XP</span>}
          </div>
        </div>
      </div>
      {r.nextStep && (
        <p className="next-step">
          <strong>Next: </strong>
          {r.nextStep}
        </p>
      )}
      <div className="results-columns">
        {r.didWell.length > 0 && (
          <div>
            <h3>You did well on</h3>
            <ul>
              {r.didWell.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>
        )}
        {r.needsPractice.length > 0 && (
          <div>
            <h3>Keep practicing</h3>
            <ul>
              {r.needsPractice.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
      {r.skillChanges.length > 0 && (
        <div className="skill-changes">
          <h3>Skill mastery</h3>
          <ul>
            {r.skillChanges.map((c) => (
              <li key={c.skillId}>
                {c.skillName}: <span className={`stage stage-${c.before}`}>{STAGE_LABEL[c.before]}</span>
                {c.before !== c.after && (
                  <>
                    {' → '}
                    <span className={`stage stage-${c.after}`}>{STAGE_LABEL[c.after]}</span>
                  </>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
      <h3>Question review</h3>
      <ol className="review-list">
        {r.items.map((it) => (
          <li key={it.index} className={`review-item ${it.correct ? 'ok' : 'miss'}`}>
            <details open={!it.correct}>
              <summary>
                <span className="review-mark">{it.correct ? '✓' : '✗'}</span> Question {it.index + 1} · {it.skillName}
              </summary>
              <Blocks blocks={it.prompt} />
              <p>
                Your answer: <code>{it.response || '(blank)'}</code>
              </p>
              {!it.correct && (
                <>
                  <p>
                    Correct answer: <Inline text={it.correctAnswer} />
                  </p>
                  {it.feedback && (
                    <p className="review-feedback">
                      <Inline text={it.feedback} />
                    </p>
                  )}
                </>
              )}
              <Steps items={it.solution} />
            </details>
          </li>
        ))}
      </ol>
    </section>
  );
}
