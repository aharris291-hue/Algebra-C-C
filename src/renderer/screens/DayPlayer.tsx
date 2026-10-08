/**
 * Review, project and assessment days: an overview of the skills covered (for a capstone project,
 * the situation and its parts), then the problem set, then results with corrections (and a retake
 * for assessments). All logic lives in the
 * main process; this screen only shows what it returns.
 */
import { useCallback, useEffect, useState } from 'react';
import type { DayView } from '../../shared/api';
import { api, errorMessage } from '../api';
import { PracticePanel } from '../components/Practice';
import { Results } from '../components/Results';
import { Blocks } from '../components/Blocks';
import { STAGE_LABEL, KIND_LABEL } from '../labels';
import { playSound } from '../sound';

export function DayPlayer(props: { profileId: number; lessonId: string; onExit: () => void; setActivity: (lessonId: string | null, activity: string) => void }) {
  const { profileId, lessonId } = props;
  const [view, setView] = useState<DayView | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(async (fn: () => Promise<DayView>) => {
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
    run(() => api.openDay(profileId, lessonId));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileId, lessonId]);

  useEffect(() => {
    if (view) props.setActivity(lessonId, view.mode === 'assessment' ? 'assessment' : 'review');
    window.scrollTo({ top: 0 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view?.phase, lessonId]);

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
          <p className="loading">Opening…</p>
        )}
      </div>
    );
  }

  const assessment = view.mode === 'assessment';
  const project = view.project;
  const inTest = assessment && view.phase === 'practice';
  const actions = {
    submit: async (key: string, response: string, elapsed: number) => {
      await run(() => api.daySubmit(profileId, lessonId, key, response, elapsed));
    },
    hint: async (key: string) => {
      await run(() => api.dayHint(profileId, lessonId, key));
    },
    reveal: async (key: string) => {
      await run(() => api.dayReveal(profileId, lessonId, key));
    },
    next: async () => {
      await run(() => api.dayNext(profileId, lessonId));
    },
    select: async (i: number) => {
      await run(() => api.daySelect(profileId, lessonId, i));
    },
  };
  const finish = async () => {
    const v = await run(() => api.finishDay(profileId, lessonId));
    if (v?.results?.passed) playSound('complete');
  };

  return (
    <div className="lesson">
      <header className="lesson-head">
        <button className="btn btn-quiet" onClick={props.onExit} disabled={busy}>
          ← {inTest ? 'Save and exit' : 'Exit'}
        </button>
        <div className="lesson-title-block">
          <div className="lesson-unit">
            {view.unitTitle} · Day {view.day} · {KIND_LABEL[view.kind]}
          </div>
          <h1 className="lesson-title">{view.title}</h1>
        </div>
        <div className="lesson-xp" aria-label="XP earned today">
          +{view.xpThisDay} XP
        </div>
      </header>

      <main id="lesson-main" className="lesson-body" tabIndex={-1}>
        {error && (
          <div className="error-box" role="alert">
            {error}
          </div>
        )}

        {view.phase === 'overview' && project && (
          <section aria-label="Overview">
            <h2 className="section-title">The project</h2>
            <p className="lesson-goal">{project.goal}</p>
            <Blocks blocks={project.intro} />
            <h3>How you will work</h3>
            <ol>
              {project.plan.map((p, i) => (
                <li key={i}>{p}</li>
              ))}
            </ol>
            <h3>The {project.parts.length} parts</h3>
            <ol className="project-parts">
              {project.parts.map((p, i) => (
                <li key={i}>{p}</li>
              ))}
            </ol>
            <ul>
              <li>Every part uses the same situation and numbers. Each part repeats the numbers it needs.</li>
              <li>Hints and full solutions are available. This project is not graded; it shows which skills to brush up on before the semester review.</li>
            </ul>
            <h3>Skills</h3>
            <ul className="skill-chips">
              {view.skills.map((s) => (
                <li key={s.skillId}>
                  <span className="skill-name">{s.name}</span> <span className={`stage stage-${s.stage}`}>{STAGE_LABEL[s.stage]}</span>
                </li>
              ))}
            </ul>
            <button className="btn btn-primary btn-lg" disabled={busy} onClick={() => run(() => api.startDay(profileId, lessonId))}>
              Start the project
            </button>
          </section>
        )}

        {view.phase === 'overview' && !project && (
          <section aria-label="Overview">
            <h2 className="section-title">{assessment ? 'Before you start' : 'What this review covers'}</h2>
            {assessment ? (
              <ul>
                <li>
                  {view.itemCount} questions covering every skill in this unit. Key skills appear twice. Plan on about {view.durationMinutes} minutes; you can save and come back.
                </li>
                <li>No hints during the assessment. You can move between questions and change answers until you select Finish and grade.</li>
                <li>{view.passPercent}% passes. Afterwards you will see every question with a worked solution, correct what you missed, and can retake it. Your best of the first two attempts counts toward your grade.</li>
              </ul>
            ) : (
              <ul>
                <li>One or two problems on every skill in the unit, mixed together so you practice choosing the right method.</li>
                <li>Hints and full solutions are available. Skills that still need work get an extra problem.</li>
                <li>At the end you will see which skills to brush up on before the assessment.</li>
              </ul>
            )}
            <h3>Skills</h3>
            <ul className="skill-chips">
              {view.skills.map((s) => (
                <li key={s.skillId}>
                  <span className="skill-name">
                    {s.name}
                    {s.essential && <span className="tag">Key skill</span>}
                  </span>{' '}
                  <span className={`stage stage-${s.stage}`}>{STAGE_LABEL[s.stage]}</span>
                </li>
              ))}
            </ul>
            <button className="btn btn-primary btn-lg" disabled={busy} onClick={() => run(() => api.startDay(profileId, lessonId))}>
              {assessment ? 'Start the assessment' : 'Start the review'}
            </button>
          </section>
        )}

        {view.phase === 'practice' && view.practice && (
          <>
            <h2 className="section-title">{assessment ? `Assessment${view.attempts > 0 ? ` (attempt ${view.attempts + 1})` : ''}` : project ? 'Project' : 'Mixed review'}</h2>
            {project && (
              <details className="project-recap">
                <summary>Reread the situation</summary>
                <Blocks blocks={project.intro} />
              </details>
            )}
            <PracticePanel
              practice={view.practice}
              busy={busy}
              intro={assessment ? 'Answer every question. Nothing is graded until you select Finish and grade.' : project ? 'Work the parts in order. Use hints whenever you need them.' : 'Work each problem. Use hints whenever you need them.'}
              actions={{ ...actions, finishQuiz: assessment ? finish : undefined }}
            />
            {!assessment && view.practice.complete && (
              <div className="practice-nav">
                <button className="btn btn-primary btn-lg" disabled={busy} onClick={finish}>
                  {project ? 'Finish the project' : 'See my review results'}
                </button>
              </div>
            )}
          </>
        )}

        {view.phase === 'results' && view.results && (
          <>
            <h2 className="section-title">{assessment ? 'Results' : project ? 'Project results' : 'Review results'}</h2>
            <Results r={view.results} />
            {project && (
              <section className="project-wrapup" aria-label="Looking back">
                <h3>Looking back</h3>
                <Blocks blocks={project.wrapUp} />
              </section>
            )}
            {view.corrections && (
              <section className="corrections" aria-label="Corrections">
                <h3>Corrections</h3>
                <PracticePanel practice={view.corrections} busy={busy} intro="A fresh problem like each one you missed, with hints. Finish these before a retake." actions={actions} />
              </section>
            )}
            <div className="practice-nav">
              {assessment && (
                <button className="btn btn-primary" disabled={!view.canRetake || busy} title={view.retakeBlockedReason ?? ''} onClick={() => run(() => api.retakeDay(profileId, lessonId))}>
                  Retake the assessment
                </button>
              )}
              {view.retakeBlockedReason && <span className="foot-note">{view.retakeBlockedReason}</span>}
              <button className="btn" disabled={busy} onClick={props.onExit}>
                Back to home
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
