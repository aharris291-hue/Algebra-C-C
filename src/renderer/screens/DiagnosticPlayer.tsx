/**
 * The diagnostic (placement) check: an introduction, then one question at a time with no hints
 * and no right/wrong feedback, then what it found, where to start, and optional warm-up practice
 * on earlier-grade skills. Every decision is made in the main process.
 */
import { useCallback, useEffect, useState } from 'react';
import type { DiagnosticSkillResult, DiagnosticView } from '../../shared/api';
import { api, errorMessage } from '../api';
import { ProblemCard } from '../components/ProblemCard';
import { PracticePanel } from '../components/Practice';
import { Progress } from './Home';

const PART_LABEL = { prereq: 'Part 1 of 2: skills from earlier grades', course: 'Part 2 of 2: algebra you may already know' };

export function DiagnosticPlayer(props: { profileId: number; onExit: () => void; onOpenLesson: (id: string, testOut?: boolean) => void; setActivity: (lessonId: string | null, activity: string) => void }) {
  const { profileId } = props;
  const [view, setView] = useState<DiagnosticView | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(async (fn: () => Promise<DiagnosticView>) => {
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
    run(() => api.getDiagnostic(profileId));
    props.setActivity(null, 'diagnostic');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileId]);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [view?.phase]);

  if (!view)
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

  const asking = view.phase === 'questions';
  const s = view.summary;
  const pre = s?.skills.filter((x) => x.group === 'prereq') ?? [];
  const course = s?.skills.filter((x) => x.group === 'course') ?? [];

  return (
    <div className="lesson">
      <header className="lesson-head">
        <button className="btn btn-quiet" onClick={props.onExit} disabled={busy}>
          ← {asking ? 'Save and exit' : 'Back to home'}
        </button>
        <div className="lesson-title-block">
          <div className="lesson-unit">Getting started</div>
          <h1 className="lesson-title">Find your starting point</h1>
        </div>
        <div />
      </header>

      <main id="lesson-main" className="lesson-body" tabIndex={-1}>
        {error && (
          <div className="error-box" role="alert">
            {error}
          </div>
        )}

        {view.phase === 'intro' && view.status === 'skipped' && (
          <section aria-label="Diagnostic skipped">
            <p>A parent chose to skip the diagnostic. Start with the first lesson; a parent can offer the diagnostic again in Parent Mode.</p>
            <button className="btn btn-primary" onClick={props.onExit}>
              Back to home
            </button>
          </section>
        )}

        {view.phase === 'intro' && view.status !== 'skipped' && (
          <section aria-label="About the diagnostic">
            <h2 className="section-title">A quick check of what you already know</h2>
            <ul>
              <li>
                <b>Part 1</b> checks skills from earlier grades that algebra builds on, like fractions, negative numbers and solving equations. <b>Part 2</b> checks a few algebra skills you may already know.
              </li>
              <li>About {view.progress.skillsTotal * 2} short questions; it adapts to your answers, so it may be fewer. Plan on 20 to 30 minutes. You can save and come back.</li>
              <li>No hints, and you won't see right or wrong until the end. That's on purpose: this is not a test and it is not graded.</li>
              <li>If you haven't learned something yet, choose <b>I haven't learned this yet</b>. That's much better than guessing.</li>
              <li>One slip never decides a skill: when an answer is wrong, you get another question on that skill.</li>
            </ul>
            <div className="practice-nav">
              <button className="btn btn-primary btn-lg" disabled={busy} onClick={() => run(() => api.startDiagnostic(profileId))}>
                {view.status === 'in_progress' ? 'Continue the diagnostic' : 'Start the diagnostic'}
              </button>
              <button className="btn" disabled={busy} onClick={props.onExit}>
                Not now
              </button>
            </div>
          </section>
        )}

        {asking && view.problem && view.part && (
          <section aria-label="Diagnostic question">
            <h2 className="section-title">{PART_LABEL[view.part]}</h2>
            <Progress value={Math.round((100 * view.progress.skillsDone) / Math.max(1, view.progress.skillsTotal))} label={`${view.progress.skillsDone} of ${view.progress.skillsTotal} skills checked`} />
            <ProblemCard key={view.problem.key} p={view.problem} deferred busy={busy} submitLabel="Submit answer" actions={{ submit: async (key, response, elapsed) => void (await run(() => api.diagnosticSubmit(profileId, key, response, elapsed))) }} />
            <div className="practice-nav">
              <button className="btn btn-quiet" disabled={busy} onClick={() => run(() => api.diagnosticNotLearned(profileId, view.problem!.key))}>
                I haven't learned this yet
              </button>
            </div>
          </section>
        )}

        {view.phase === 'results' && s && (
          <section aria-label="Diagnostic results">
            <h2 className="section-title">What we found</h2>
            <p className="lesson-goal">{s.headline}</p>
            <div className="cards">
              <section className="card">
                <h3>Skills from earlier grades</h3>
                <SkillList items={pre} strongLabel="Solid" weakLabel="Needs a refresh" />
              </section>
              <section className="card">
                <h3>Algebra you may already know</h3>
                <SkillList items={course} strongLabel="Already know it" weakLabel="You'll learn this" />
              </section>
            </div>
            <h3>Where to start</h3>
            <p>
              Start with <b>{s.recommendedLessonTitle}</b>.
              {s.testOutLessonIds.length > 0 && ' Lessons on skills you already know are marked on the course map: try Show What You Know there to skip ahead.'}
            </p>
            <div className="practice-nav">
              <button className="btn btn-primary btn-lg" disabled={busy} onClick={() => props.onOpenLesson(s.recommendedLessonId)}>
                Start {s.recommendedLessonTitle}
              </button>
              {view.canReview && (
                <button className="btn" disabled={busy} onClick={() => run(() => api.startDiagnosticReview(profileId))}>
                  Warm-up practice on earlier skills
                </button>
              )}
              <button className="btn" disabled={busy} onClick={props.onExit}>
                Back to home
              </button>
            </div>
          </section>
        )}

        {view.phase === 'review' && view.review && (
          <section aria-label="Warm-up practice">
            <h2 className="section-title">Warm-up practice</h2>
            <PracticePanel
              practice={view.review}
              busy={busy}
              intro="Short practice on the earlier-grade skills that need a refresh. Hints and worked solutions are here whenever you need them."
              actions={{
                submit: async (key, response, elapsed) => void (await run(() => api.diagnosticReviewSubmit(profileId, key, response, elapsed))),
                hint: async (key) => void (await run(() => api.diagnosticReviewHint(profileId, key))),
                reveal: async (key) => void (await run(() => api.diagnosticReviewReveal(profileId, key))),
                next: async () => void (await run(() => api.diagnosticReviewNext(profileId))),
                select: async () => undefined,
              }}
            />
            <div className="practice-nav">
              <button className={`btn ${view.review.complete ? 'btn-primary btn-lg' : ''}`} disabled={busy} onClick={() => run(() => api.closeDiagnosticReview(profileId))}>
                {view.review.complete ? 'Done: back to my results' : 'Back to my results'}
              </button>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

function SkillList(props: { items: DiagnosticSkillResult[]; strongLabel: string; weakLabel: string }) {
  return (
    <ul className="skill-chips">
      {props.items.map((x) => (
        <li key={x.skillId}>
          <span className="skill-name">{x.name}</span>{' '}
          <span className={`stage ${x.verdict === 'strong' ? 'stage-PROFICIENT' : 'stage-LEARNING'}`}>{x.verdict === 'strong' ? props.strongLabel : x.verdict === 'not-learned' ? 'Not learned yet' : props.weakLabel}</span>
        </li>
      ))}
    </ul>
  );
}
