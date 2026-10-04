/** Student dashboard (spec §21): what to do next, progress, mastery, XP and streaks. */
import { useEffect, useState } from 'react';
import type { StudentDashboard } from '../../shared/api';
import { api, errorMessage } from '../api';
import { AVATAR_EMOJI, KIND_LABEL, STAGE_LABEL, fmtDate } from '../labels';

export function Home(props: { profileId: number; onOpenLesson: (id: string) => void; onCourse: () => void; onSkills: () => void; onSettings: () => void; onSwitch: () => void }) {
  const [d, setD] = useState<StudentDashboard | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    api.getStudentDashboard(props.profileId).then(setD, (e) => setError(errorMessage(e)));
  }, [props.profileId]);
  if (error)
    return (
      <div className="page">
        <div className="error-box" role="alert">
          {error}
        </div>
      </div>
    );
  if (!d) return <div className="page loading">Loading…</div>;
  const earned = d.achievements.filter((a) => a.earnedAt).sort((a, b) => (b.earnedAt ?? 0) - (a.earnedAt ?? 0));
  const next = d.achievements.filter((a) => !a.earnedAt).slice(0, 3);
  return (
    <div className="page home">
      <header className="top-bar">
        <div className="who">
          <span className="avatar" aria-hidden>
            {AVATAR_EMOJI[d.profile.avatar] ?? '✨'}
          </span>
          <div>
            <div className="hello">Hi, {d.profile.displayName}!</div>
            <div className="sub">
              Level {d.xp.level} · {d.xp.title}
            </div>
          </div>
        </div>
        <nav className="top-actions">
          <button className="btn btn-quiet" onClick={props.onCourse}>
            Course map
          </button>
          <button className="btn btn-quiet" onClick={props.onSkills}>
            My skills
          </button>
          <button className="btn btn-quiet" onClick={props.onSettings}>
            Settings
          </button>
          <button className="btn btn-quiet" onClick={props.onSwitch}>
            Switch user
          </button>
        </nav>
      </header>

      <section className="hero">
        {d.continueLesson ? (
          <>
            <div className="hero-text">
              <div className="hero-kicker">{d.continueLesson.resume ? 'Pick up where you left off' : 'Up next'}</div>
              <div className="hero-title">{d.continueLesson.title}</div>
              <div className="hero-sub">{d.continueLesson.unitTitle}</div>
            </div>
            <button className="btn btn-primary btn-xl" onClick={() => props.onOpenLesson(d.continueLesson!.lessonId)}>
              {d.continueLesson.resume ? 'CONTINUE LEARNING' : 'START LEARNING'}
            </button>
          </>
        ) : (
          <div className="hero-text">
            <div className="hero-title">You're all caught up!</div>
            <div className="hero-sub">More lessons are on the way in the next version. Review your skills in the meantime.</div>
          </div>
        )}
        <p className="today-goal">{d.todayGoal}</p>
      </section>

      <div className="cards">
        <section className="card">
          <h2>Semester</h2>
          <Progress value={d.semester.percent} label={`${d.semester.completedLessons} of ${d.semester.totalLessons} days complete`} />
          {d.currentUnit && (
            <>
              <h3>
                Unit {d.currentUnit.number}: {d.currentUnit.title}
              </h3>
              <Progress value={d.currentUnit.percent} label={`${d.currentUnit.percent}% of this unit`} />
            </>
          )}
          <div className="stat-row">
            <Stat label="Course week" value={String(d.semester.currentWeek)} />
            <Stat label="Grade" value={d.grade.percent === null ? '—' : `${d.grade.percent}% ${d.grade.letter}`} />
          </div>
        </section>

        <section className="card">
          <h2>XP and level</h2>
          <div className="level-line">
            <span className="level-badge">Lv {d.xp.level}</span> {d.xp.title}
          </div>
          <Progress value={Math.round(d.xp.progress * 100)} label={`${d.xp.current} / ${d.xp.needed} XP to level ${d.xp.level + 1}`} />
          <div className="stat-row">
            <Stat label="Total XP" value={String(d.xp.total)} />
            <Stat label="This week" value={`+${d.xp.thisWeek}`} />
          </div>
        </section>

        <section className="card">
          <h2>Streak and goals</h2>
          <div className="streak">
            <span className="flame" aria-hidden>
              🔥
            </span>
            <span className="streak-num">{d.streak.current}</span> day{d.streak.current === 1 ? '' : 's'}
            {d.streak.todayCounted ? <span className="tag tag-ok">Today counts ✓</span> : <span className="tag">Study today to keep it going</span>}
          </div>
          <Progress value={Math.min(100, Math.round((100 * d.weeklyGoal.lessonsDone) / Math.max(1, d.weeklyGoal.lessonsTarget)))} label={`${d.weeklyGoal.lessonsDone} of ${d.weeklyGoal.lessonsTarget} lessons this week`} />
          <Progress value={Math.min(100, Math.round((100 * d.todayMinutes) / Math.max(1, d.weeklyGoal.minutesTarget / 5)))} label={`${d.todayMinutes} of ${Math.round(d.weeklyGoal.minutesTarget / 5)} minutes today`} />
          <div className="sub">Longest streak: {d.streak.longest} days</div>
        </section>

        <section className="card">
          <h2>Skills</h2>
          <div className="skill-bars" aria-label="Skills by mastery level">
            {(
              [
                ['MASTERED', d.skills.mastered],
                ['PROFICIENT', d.skills.proficient],
                ['DEVELOPING', d.skills.developing],
                ['LEARNING', d.skills.learning],
              ] as const
            ).map(([k, n]) => (
              <div key={k} className="skill-bar-row">
                <span className={`stage stage-${k}`}>{STAGE_LABEL[k]}</span>
                <span>{n}</span>
              </div>
            ))}
            <div className="sub">
              {d.skills.total - d.skills.notStarted} of {d.skills.total} skills started
            </div>
          </div>
          {d.developingSkills.length > 0 && (
            <>
              <h3>Growing now</h3>
              <ul className="compact">
                {d.developingSkills.map((s) => (
                  <li key={s.skillId}>
                    {s.name} <span className={`stage stage-${s.stage}`}>{STAGE_LABEL[s.stage]}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
          {d.suggestedReview.length > 0 && (
            <>
              <h3>Due for review</h3>
              <ul className="compact">
                {d.suggestedReview.map((s) => (
                  <li key={s.skillId}>{s.name}</li>
                ))}
              </ul>
              <div className="sub">Review problems are mixed into your practice automatically.</div>
            </>
          )}
        </section>

        <section className="card">
          <h2>Coming up</h2>
          <ol className="compact">
            {d.upcoming.map((l) => (
              <li key={l.id}>
                <span className="tag tag-muted">Day {l.day}</span> {l.title}
                {l.kind !== 'lesson' && <span className="tag">{KIND_LABEL[l.kind]}</span>}
              </li>
            ))}
          </ol>
        </section>

        <section className="card">
          <h2>Achievements</h2>
          {earned.length === 0 && <p className="sub">Your first achievement is one correct answer away.</p>}
          <ul className="badges">
            {earned.map((a) => (
              <li key={a.id} className="badge earned" title={`${a.description} Earned ${fmtDate(a.earnedAt!)}`}>
                <span className="badge-title">{a.title}</span>
                <span className="badge-desc">{a.description}</span>
              </li>
            ))}
            {next.map((a) => (
              <li key={a.id} className="badge locked" title={a.description}>
                <span className="badge-title">{a.title}</span>
                <span className="badge-desc">{a.description}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

export function Progress({ value, label }: { value: number; label: string }) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div className="progress">
      <div className="progress-track" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={v} aria-label={label}>
        <div className="progress-fill" style={{ width: `${v}%` }} />
      </div>
      <div className="progress-label">{label}</div>
    </div>
  );
}

export function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="stat">
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}
