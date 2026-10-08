/** Course map (spec §6): all 90 days by unit, with status and Show What You Know. */
import { useEffect, useState } from 'react';
import type { CourseUnit, SkillMasteryView } from '../../shared/api';
import { api, errorMessage } from '../api';
import { KIND_LABEL, STAGE_LABEL } from '../labels';

const STATUS_LABEL: Record<string, string> = { locked: 'Locked', available: 'Ready', in_progress: 'In progress', completed: 'Complete', tested_out: 'Tested out', coming_soon: 'Coming in a later version' };

export function CourseMap(props: { profileId: number; onOpenLesson: (id: string, testOut?: boolean, kind?: string) => void; onBack: () => void }) {
  const [units, setUnits] = useState<CourseUnit[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  useEffect(() => {
    api.getCourse(props.profileId).then(
      (u) => {
        setUnits(u);
        const cur = u.find((x) => x.lessons.some((l) => l.status !== 'completed' && l.status !== 'tested_out'));
        setOpen(cur?.id ?? u[0]?.id ?? null);
      },
      (e) => setError(errorMessage(e)),
    );
  }, [props.profileId]);
  return (
    <div className="page">
      <header className="page-head">
        <button className="btn btn-quiet" onClick={props.onBack}>
          ← Dashboard
        </button>
        <h1>Course map</h1>
      </header>
      {error && (
        <div className="error-box" role="alert">
          {error}
        </div>
      )}
      {!units && !error && <p className="loading">Loading…</p>}
      {units?.map((u) => (
        <section key={u.id} className="unit">
          <button className="unit-head" aria-expanded={open === u.id} onClick={() => setOpen(open === u.id ? null : u.id)}>
            <span className="unit-num">Unit {u.number}</span>
            <span className="unit-title">{u.title}</span>
            <span className="unit-stats">
              {u.completedCount}/{u.lessons.length} days · {u.masteryPercent}% of skills proficient
            </span>
          </button>
          {open === u.id && (
            <ol className="lesson-list">
              {u.lessons.map((l) => (
                <li key={l.id} className={`lesson-row status-${l.status}`}>
                  <span className="lesson-day">
                    Week {l.week} · Day {l.day}
                  </span>
                  <span className="lesson-name">
                    {l.title}
                    {l.kind !== 'lesson' && <span className="tag">{KIND_LABEL[l.kind]}</span>}
                  </span>
                  <span className="lesson-status">
                    {STATUS_LABEL[l.status]}
                    {l.quizBest !== null && ` · best quiz ${l.quizBest}%`}
                  </span>
                  <span className="lesson-actions">
                    {(l.status === 'available' || l.status === 'in_progress') && l.kind === 'lesson' && (
                      <button className="btn btn-small btn-primary" onClick={() => props.onOpenLesson(l.id)}>
                        {l.status === 'in_progress' ? 'Continue' : 'Start'}
                      </button>
                    )}
                    {l.kind !== 'lesson' && l.hasContent && l.status !== 'locked' && l.status !== 'coming_soon' && (
                      <button className={`btn btn-small ${l.status === 'completed' ? '' : 'btn-primary'}`} onClick={() => props.onOpenLesson(l.id, false, l.kind)}>
                        {l.status === 'in_progress' ? 'Continue' : l.status === 'completed' ? 'Open' : 'Start'}
                      </button>
                    )}
                    {(l.status === 'completed' || l.status === 'tested_out') && l.kind === 'lesson' && (
                      <button className="btn btn-small" onClick={() => props.onOpenLesson(l.id)}>
                        Review
                      </button>
                    )}
                    {l.suggestedTestOut && l.canTestOut && l.status !== 'in_progress' && <span className="tag tag-ok" title="Your diagnostic showed you may already know this">Suggested</span>}
                    {l.canTestOut && l.status !== 'in_progress' && (
                      <button className={`btn btn-small ${l.suggestedTestOut ? 'btn-primary' : ''}`} onClick={() => props.onOpenLesson(l.id, true)} title="Take a short quiz. Score 85% or more to skip this lesson.">
                        Show What You Know
                      </button>
                    )}
                  </span>
                </li>
              ))}
            </ol>
          )}
        </section>
      ))}
    </div>
  );
}

export function SkillsView(props: { profileId: number; onBack: () => void }) {
  const [skills, setSkills] = useState<SkillMasteryView[] | null>(null);
  useEffect(() => {
    api.getSkillMastery(props.profileId).then(setSkills);
  }, [props.profileId]);
  const byUnit = new Map<string, SkillMasteryView[]>();
  for (const s of skills ?? []) byUnit.set(s.unitId, [...(byUnit.get(s.unitId) ?? []), s]);
  return (
    <div className="page">
      <header className="page-head">
        <button className="btn btn-quiet" onClick={props.onBack}>
          ← Dashboard
        </button>
        <h1>My skills</h1>
      </header>
      <p className="sub">
        Skills move from <b>Learning</b> to <b>Developing</b>, <b>Proficient</b> and <b>Mastered</b> as you answer correctly over time, especially without hints. Recent work counts most.
      </p>
      {[...byUnit.entries()].map(([unit, list]) => (
        <section key={unit} className="card">
          <h2>Unit {unit.slice(1)}</h2>
          <ul className="skill-list">
            {list.map((s) => (
              <li key={s.skillId}>
                <span>{s.name}</span>
                <span className={`stage stage-${s.stage}`}>{STAGE_LABEL[s.stage]}</span>
                {s.dueForReview && <span className="tag">Review due</span>}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
