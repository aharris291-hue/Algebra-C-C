/**
 * The lesson player (spec §7-§12): ten sections in order, autosaved by the app after every
 * action. The UI only displays what the main process returns.
 */
import { useCallback, useEffect, useState } from 'react';
import type { LessonView, SectionId, TeachAgainView } from '../../shared/api';
import { SECTION_TITLES } from '../../shared/api';
import { api, errorMessage } from '../api';
import { Blocks, Steps } from '../components/Blocks';
import { Inline } from '../components/RichText';
import { PracticePanel } from '../components/Practice';
import { Results } from '../components/Results';
import { STAGE_LABEL } from '../labels';
import { playSound } from '../sound';

export function LessonPlayer(props: { profileId: number; lessonId: string; testOut?: boolean; onExit: () => void; onOpenLesson: (id: string) => void; setActivity: (lessonId: string | null, activity: string) => void }) {
  const { profileId, lessonId } = props;
  const [view, setView] = useState<LessonView | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [teach, setTeach] = useState<TeachAgainView | null>(null);

  const run = useCallback(async (fn: () => Promise<LessonView>) => {
    setBusy(true);
    setError(null);
    try {
      const v = await fn();
      setView(v);
      return v;
    } catch (e) {
      setError(errorMessage(e));
      return null;
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    run(() => (props.testOut ? api.startTestOut(profileId, lessonId) : api.openLesson(profileId, lessonId)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileId, lessonId]);

  useEffect(() => {
    if (view) props.setActivity(lessonId, view.section);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view?.section, lessonId]);

  useEffect(() => {
    window.scrollTo({ top: 0 });
    document.getElementById('lesson-main')?.focus();
  }, [view?.section]);

  if (!view) {
    return (
      <div className="page">
        {error ? (
          <div className="error-box" role="alert">
            {error}
            <div>
              <button className="btn" onClick={props.onExit}>
                Back
              </button>
            </div>
          </div>
        ) : (
          <p className="loading">Opening the lesson…</p>
        )}
      </div>
    );
  }

  const furthest = Math.max(view.sections.indexOf(view.section), ...view.sectionsDone.map((s) => view.sections.indexOf(s)));
  const inQuiz = view.section === 'quiz' && !view.results;
  const testOutMode = view.section === 'quiz' && view.practice?.activity === 'testout';
  const done = view.status === 'completed' || view.status === 'tested_out';

  const actions = {
    submit: async (key: string, response: string, elapsed: number) => {
      await run(() => api.submitAnswer(profileId, lessonId, key, response, elapsed));
    },
    hint: async (key: string) => {
      await run(() => api.requestHint(profileId, lessonId, key));
    },
    reveal: async (key: string) => {
      await run(() => api.revealSolution(profileId, lessonId, key));
    },
    next: async () => {
      await run(() => api.nextProblem(profileId, lessonId));
    },
    select: async (i: number) => {
      await run(() => api.selectProblem(profileId, lessonId, i));
    },
  };

  const openTeach = async (approach?: string) => {
    setBusy(true);
    try {
      setTeach(await api.teachMeAgain(profileId, lessonId, approach));
      const v = await api.openLesson(profileId, lessonId);
      setView(v);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const advance = async () => {
    const v = await run(() => api.advanceSection(profileId, lessonId));
    if (v && (v.status === 'completed' || v.status === 'tested_out') && view.section === 'summary') playSound('complete');
  };

  return (
    <div className="lesson">
      <header className="lesson-head">
        <button className="btn btn-quiet" onClick={props.onExit} disabled={busy}>
          ← {inQuiz ? 'Save and exit' : 'Exit lesson'}
        </button>
        <div className="lesson-title-block">
          <div className="lesson-unit">
            {view.unitTitle} · Day {view.day}
          </div>
          <h1 className="lesson-title">{view.title}</h1>
        </div>
        <div className="lesson-xp" aria-label="XP earned in this lesson">
          +{view.xpThisLesson} XP
        </div>
      </header>

      {!testOutMode && (
        <nav className="section-nav" aria-label="Lesson sections">
          <ol>
            {view.sections.map((s, i) => {
              const isDone = view.sectionsDone.includes(s);
              const reachable = i <= furthest && !inQuiz;
              return (
                <li key={s}>
                  <button
                    className={`section-pill ${s === view.section ? 'current' : ''} ${isDone ? 'done' : ''}`}
                    aria-current={s === view.section ? 'step' : undefined}
                    disabled={!reachable || busy || s === view.section}
                    onClick={() => run(() => api.goToSection(profileId, lessonId, s))}
                  >
                    <span className="pill-num">{isDone ? '✓' : i + 1}</span>
                    <span className="pill-label">{SECTION_TITLES[s]}</span>
                  </button>
                </li>
              );
            })}
          </ol>
        </nav>
      )}

      <main id="lesson-main" className="lesson-body" tabIndex={-1}>
        <h2 className="section-title">{testOutMode ? 'Show What You Know' : SECTION_TITLES[view.section]}</h2>
        {error && (
          <div className="error-box" role="alert">
            {error}
          </div>
        )}
        <Section view={view} busy={busy} actions={actions} run={run} profileId={profileId} lessonId={lessonId} onTeach={openTeach} onOpenLesson={props.onOpenLesson} onExit={props.onExit} />
      </main>

      <footer className="lesson-foot">
        {!inQuiz ? (
          <button className="btn btn-teach" onClick={() => openTeach()} disabled={busy}>
            Teach Me Again
          </button>
        ) : (
          <span className="foot-note">Hints and Teach Me Again come back after the quiz.</span>
        )}
        <div className="foot-right">
          {!view.canAdvance && view.advanceBlockedReason && !inQuiz && <span className="foot-note">{view.advanceBlockedReason}</span>}
          {view.canAdvance && !done && (
            <button className="btn btn-primary btn-lg" onClick={advance} disabled={busy}>
              {view.section === 'summary' ? 'Finish lesson ✓' : `Continue to ${SECTION_TITLES[view.sections[view.sections.indexOf(view.section) + 1]]} →`}
            </button>
          )}
          {view.canAdvance && done && view.section !== 'summary' && (
            <button className="btn btn-primary" onClick={advance} disabled={busy}>
              Continue →
            </button>
          )}
        </div>
      </footer>

      {teach && (
        <TeachAgainDialog
          t={teach}
          options={view.teachAgainOptions}
          onClose={() => setTeach(null)}
          onAnother={(a) => openTeach(a)}
          busy={busy}
        />
      )}
    </div>
  );
}

type Run = (fn: () => Promise<LessonView>) => Promise<LessonView | null>;

function Section(props: {
  view: LessonView;
  busy: boolean;
  actions: Parameters<typeof PracticePanel>[0]['actions'];
  run: Run;
  profileId: number;
  lessonId: string;
  onTeach: (approach?: string) => void;
  onOpenLesson: (id: string) => void;
  onExit: () => void;
}) {
  const { view, busy, actions, run, profileId, lessonId } = props;
  const c = view.content;
  const s: SectionId = view.section;

  if (s === 'goal') {
    return (
      <div className="section-goal">
        {view.results?.kind === 'test-out' && !view.results.passed && (
          <aside className="callout callout-tip">
            <div className="callout-title">Show What You Know: {view.results.percent}%</div>
            You were close. This lesson will fill in the gaps, and the quiz at the end will feel much easier.
          </aside>
        )}
        <p className="goal-text">
          <Inline text={c.goal} />
        </p>
        <h3>By the end of this lesson you will be able to</h3>
        <ul>
          {view.objectives.map((o, i) => (
            <li key={i}>
              <Inline text={o} />
            </li>
          ))}
        </ul>
        <div className="goal-meta">
          <span>About {view.durationMinutes} minutes</span>
          <span>Week {view.week}</span>
        </div>
        <details className="standards">
          <summary>Georgia standards in this lesson</summary>
          <ul>
            {view.standards.map((st) => (
              <li key={st.code}>
                <strong>{st.code}</strong> {st.text}
              </li>
            ))}
          </ul>
        </details>
      </div>
    );
  }
  if (s === 'needToKnow') return <Blocks blocks={c.needToKnow} />;
  if (s === 'instruction') {
    return (
      <div className="instruction">
        <Blocks blocks={c.instruction} />
        {c.vocabulary.length > 0 && (
          <aside className="vocab">
            <h3>Vocabulary</h3>
            <dl>
              {c.vocabulary.map((v) => (
                <div key={v.term}>
                  <dt>{v.term}</dt>
                  <dd>
                    <Inline text={v.meaning} />
                  </dd>
                </div>
              ))}
            </dl>
          </aside>
        )}
      </div>
    );
  }
  if (s === 'examples') return <Examples view={view} />;
  if (s === 'guided' || s === 'independent') {
    if (!view.practice) return <p className="loading">Loading problems…</p>;
    const intro =
      s === 'guided'
        ? 'Work through these together, one step at a time. Hints are always free to use here.'
        : view.practice.requiredCorrect
          ? `Show you can do it on your own. Get ${view.practice.requiredCorrect} correct to unlock the quiz. Hints are available, and a hint lowers the XP for that problem a little.`
          : undefined;
    return (
      <>
        <PracticePanel practice={view.practice} actions={actions} busy={busy} intro={intro} />
        {view.practice.complete && s === 'independent' && <p className="done-note">Practice complete. Continue to the quiz when you are ready.</p>}
        {s === 'guided' && view.canAdvance && <p className="done-note">Guided practice complete. Continue to independent practice.</p>}
      </>
    );
  }
  if (s === 'quiz') {
    if (view.results) return <Results r={view.results} />;
    if (!view.practice) return <p className="loading">Loading the quiz…</p>;
    const testOut = view.practice.activity === 'testout';
    return (
      <>
        <p className="practice-intro">
          {testOut
            ? 'Answer every question without hints. Score 85% or better to skip this lesson. If not, no problem: you will learn it step by step.'
            : 'Answer every question, then select Finish and grade. You can go back and change answers before you finish. No hints during the quiz.'}
        </p>
        <PracticePanel practice={view.practice} actions={{ ...actions, hint: undefined, reveal: undefined, finishQuiz: async () => void (await run(() => api.finishQuiz(profileId, lessonId))) }} busy={busy} />
      </>
    );
  }
  if (s === 'feedback') {
    return (
      <>
        {view.results ? <Results r={view.results} /> : <p>Take the quiz to see your feedback.</p>}
        {view.corrections && (
          <section className="corrections">
            <h3>Corrections</h3>
            <p>Here is a fresh problem like each one you missed. Work it out with hints if you need them. Corrections help you learn and do not change your quiz score.</p>
            <PracticePanel practice={view.corrections} actions={actions} busy={busy} />
          </section>
        )}
      </>
    );
  }
  if (s === 'mastery') return <Mastery view={view} busy={busy} actions={actions} run={run} profileId={profileId} lessonId={lessonId} onTeach={props.onTeach} />;
  if (s === 'summary') {
    const done = view.status === 'completed' || view.status === 'tested_out';
    return (
      <div className="summary">
        <ul className="summary-list">
          {c.summary.map((x, i) => (
            <li key={i}>
              <Inline text={x} />
            </li>
          ))}
        </ul>
        {done && (
          <div className="complete-banner" role="status">
            <div className="complete-title">{view.status === 'tested_out' ? 'You tested out of this lesson!' : 'Lesson complete!'}</div>
            <p>Your progress is saved.</p>
            <button className="btn btn-primary btn-lg" onClick={props.onExit}>
              Back to my dashboard
            </button>
          </div>
        )}
      </div>
    );
  }
  return null;
}

function Examples({ view }: { view: LessonView }) {
  const [shown, setShown] = useState<Record<number, number>>({});
  return (
    <div className="examples">
      <p>Read each example. Try the next step in your head before you show it.</p>
      {view.content.examples.map((ex, i) => {
        const n = shown[i] ?? 0;
        return (
          <article key={i} className="example">
            <header>
              <span className={`tag tag-${ex.kind}`}>{EX_KIND[ex.kind]}</span>
              <h3>
                Example {i + 1}: <Inline text={ex.title} />
              </h3>
            </header>
            <Blocks blocks={ex.problem} />
            <Steps items={ex.steps} reveal={n} />
            {n < ex.steps.length ? (
              <div className="example-actions">
                <button className="btn" onClick={() => setShown({ ...shown, [i]: n + 1 })}>
                  Show step {n + 1}
                </button>
                <button className="btn btn-quiet" onClick={() => setShown({ ...shown, [i]: ex.steps.length })}>
                  Show all steps
                </button>
              </div>
            ) : (
              <div className="example-answer">
                <strong>Answer: </strong>
                <Inline text={ex.answer} />
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}

const EX_KIND: Record<string, string> = { introductory: 'Start here', intermediate: 'Building up', challenging: 'Challenge', 'real-world': 'Real world', 'common-mistake': 'Common mistake' };

function Mastery(props: { view: LessonView; busy: boolean; actions: Parameters<typeof PracticePanel>[0]['actions']; run: Run; profileId: number; lessonId: string; onTeach: (a?: string) => void }) {
  const { view, busy, run, profileId, lessonId } = props;
  const r = view.results;
  if (!r) return <p>Take the quiz first.</p>;
  if (r.passed) {
    return (
      <div className="mastery-pass">
        <p className="big-check">✓ Mastery check passed with {r.percent}%.</p>
        {r.skillChanges.length > 0 && (
          <ul>
            {r.skillChanges.map((c) => (
              <li key={c.skillId}>
                {c.skillName}: <span className={`stage stage-${c.after}`}>{STAGE_LABEL[c.after]}</span>
              </li>
            ))}
          </ul>
        )}
        <p>Skills keep growing as you practice. They come back in review so you keep them.</p>
      </div>
    );
  }
  const rem = view.remediation;
  return (
    <div className="mastery-retry">
      <p>
        You scored {r.percent}% and need {r.passPercent}%. That is normal on a first try, and here is the plan:
      </p>
      <ol className="plan">
        <li className={rem ? 'done' : ''}>Look at the skill again a different way with Teach Me Again.</li>
        <li className={rem && !rem.active ? 'done' : ''}>Do a few targeted practice problems{r.needsPractice.length ? ` on ${r.needsPractice.join(', ')}` : ''}.</li>
        <li>Retake the quiz with new questions. Your best score counts.</li>
      </ol>
      {!rem && (
        <div className="row-buttons">
          <button className="btn" onClick={() => props.onTeach()} disabled={busy}>
            Teach Me Again
          </button>
          <button className="btn btn-primary" onClick={() => run(() => api.startRemediation(profileId, lessonId))} disabled={busy}>
            Start targeted practice
          </button>
        </div>
      )}
      {rem && rem.active && view.practice && (
        <>
          <p className="practice-intro">{rem.reason}</p>
          <PracticePanel practice={view.practice} actions={props.actions} busy={busy} />
        </>
      )}
      {rem && !rem.active && (
        <div className="row-buttons">
          <p>Targeted practice done. You are ready.</p>
          <button className="btn btn-primary btn-lg" onClick={() => run(() => api.retakeQuiz(profileId, lessonId))} disabled={busy}>
            Retake the quiz
          </button>
        </div>
      )}
    </div>
  );
}

function TeachAgainDialog(props: { t: TeachAgainView; options: LessonView['teachAgainOptions']; onClose: () => void; onAnother: (approach?: string) => void; busy: boolean }) {
  const { t } = props;
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && props.onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [props]);
  return (
    <div className="modal-backdrop" onClick={props.onClose}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="teach-title" onClick={(e) => e.stopPropagation()}>
        <header className="modal-head">
          <h2 id="teach-title">
            Teach Me Again: <Inline text={t.title} />
          </h2>
          <button className="btn btn-quiet" onClick={props.onClose} aria-label="Close" autoFocus>
            ✕
          </button>
        </header>
        <div className="modal-body">
          <Blocks blocks={t.blocks} />
        </div>
        <footer className="modal-foot">
          <span className="foot-note">Other ways to see it:</span>
          {props.options
            .filter((o) => o.approach !== t.approach)
            .map((o) => (
              <button key={o.approach} className="btn btn-small" disabled={props.busy} onClick={() => props.onAnother(o.approach)}>
                {o.used ? '✓ ' : ''}
                <Inline text={o.title} />
              </button>
            ))}
          <button className="btn btn-primary" onClick={props.onClose}>
            Got it
          </button>
        </footer>
      </div>
    </div>
  );
}

