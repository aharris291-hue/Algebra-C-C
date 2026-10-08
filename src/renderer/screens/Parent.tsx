/**
 * Parent Mode (spec §22, §24-§26, §29): PIN-protected reports, goals, profiles and backups.
 * The PIN is kept only in memory while Parent Mode is open and is re-checked by the main
 * process on every protected call.
 */
import { useEffect, useState } from 'react';
import type { ParentDashboard, ProfileSummary, ResultsView, WeeklyReport, BackupInfo, AppStatus } from '../../shared/api';
import { api, errorMessage, saveBackupFile, pickBackupFile, openDataFolder, printPage, isDesktop } from '../api';
import { AVATAR_EMOJI, STAGE_LABEL, fmtDate, fmtMinutes } from '../labels';
import { Results } from '../components/Results';
import { Progress, Stat } from './Home';

export function ParentMode(props: { onExit: () => void; onRestored: () => void }) {
  const [pin, setPin] = useState<string | null>(null);
  if (!pin) return <PinGate onOk={setPin} onCancel={props.onExit} />;
  return <ParentHome pin={pin} onExit={props.onExit} onRestored={props.onRestored} />;
}

function PinGate(props: { onOk: (pin: string) => void; onCancel: () => void }) {
  const [pin, setPin] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const [forgot, setForgot] = useState(false);
  const [code, setCode] = useState('');
  const [newPin, setNewPin] = useState('');
  const [newCode, setNewCode] = useState<string | null>(null);
  const submit = async () => {
    setMsg(null);
    const r = await api.verifyParentPin(pin);
    if (r.ok) return props.onOk(pin);
    setPin('');
    setMsg(r.lockedForSeconds ? `Too many tries. Wait ${r.lockedForSeconds} seconds and try again.` : `That PIN is not right.${r.attemptsLeft !== undefined ? ` ${r.attemptsLeft} tries left before a short wait.` : ''}`);
  };
  const reset = async () => {
    setMsg(null);
    const r = await api.resetParentPin(code, newPin);
    if (r.ok) setNewCode(r.recoveryCode ?? null);
    else setMsg(r.message ?? 'That did not work.');
  };
  return (
    <div className="setup">
      <div className="setup-card">
        {!forgot ? (
          <>
            <h1>Parent Mode</h1>
            <label className="field">
              <span>Parent PIN</span>
              <input type="password" inputMode="numeric" value={pin} maxLength={8} autoFocus onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))} onKeyDown={(e) => e.key === 'Enter' && pin && submit()} />
            </label>
            {msg && (
              <div className="error-box" role="alert">
                {msg}
              </div>
            )}
            <div className="row-buttons">
              <button className="btn" onClick={props.onCancel}>
                Cancel
              </button>
              <button className="btn btn-primary" disabled={pin.length < 4} onClick={submit}>
                Open
              </button>
            </div>
            <button className="btn btn-link" onClick={() => setForgot(true)}>
              Forgot the PIN?
            </button>
          </>
        ) : newCode ? (
          <>
            <h1>PIN changed</h1>
            <p>Your new recovery code is below. The old code no longer works. Write this one down.</p>
            <div className="recovery-code">{newCode}</div>
            <button className="btn btn-primary" onClick={() => props.onOk(newPin)}>
              Open Parent Mode
            </button>
          </>
        ) : (
          <>
            <h1>Reset the Parent PIN</h1>
            <label className="field">
              <span>Recovery code (from setup)</span>
              <input value={code} onChange={(e) => setCode(e.target.value)} autoFocus placeholder="XXXX-XXXX-XXXX" />
            </label>
            <label className="field">
              <span>New PIN (4 to 8 digits)</span>
              <input type="password" inputMode="numeric" value={newPin} maxLength={8} onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))} />
            </label>
            {msg && (
              <div className="error-box" role="alert">
                {msg}
              </div>
            )}
            <div className="row-buttons">
              <button className="btn" onClick={() => setForgot(false)}>
                Back
              </button>
              <button className="btn btn-primary" disabled={!code || newPin.length < 4} onClick={reset}>
                Reset PIN
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

type Tab = 'overview' | 'grades' | 'mastery' | 'assessments' | 'time' | 'report' | 'students' | 'data';
const TABS: Array<[Tab, string]> = [
  ['overview', 'Overview'],
  ['grades', 'Grades'],
  ['mastery', 'Mastery'],
  ['assessments', 'Assessments'],
  ['time', 'Time & support'],
  ['report', 'Weekly report'],
  ['students', 'Students & goals'],
  ['data', 'Backup & security'],
];

function ParentHome(props: { pin: string; onExit: () => void; onRestored: () => void }) {
  const { pin } = props;
  const [profiles, setProfiles] = useState<ProfileSummary[]>([]);
  const [pid, setPid] = useState<number | null>(null);
  const [tab, setTab] = useState<Tab>('overview');
  const [d, setD] = useState<ParentDashboard | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reload, setReload] = useState(0);

  useEffect(() => {
    api.listProfiles().then((l) => {
      setProfiles(l);
      const active = l.filter((p) => !p.archived);
      setPid((cur) => (cur && l.some((p) => p.id === cur) ? cur : active[0]?.id ?? null));
      if (!active.length) setTab('students');
    });
  }, [reload]);
  useEffect(() => {
    if (pid === null) return;
    setD(null);
    api.getParentDashboard(pin, pid).then(setD, (e) => setError(errorMessage(e)));
  }, [pid, pin, reload]);

  return (
    <div className="page parent">
      <header className="page-head">
        <button className="btn btn-quiet" onClick={props.onExit}>
          ← Leave Parent Mode
        </button>
        <h1>Parent Mode</h1>
        {profiles.filter((p) => !p.archived).length > 1 && (
          <select aria-label="Student" value={pid ?? ''} onChange={(e) => setPid(Number(e.target.value))}>
            {profiles
              .filter((p) => !p.archived)
              .map((p) => (
                <option key={p.id} value={p.id}>
                  {p.displayName}
                </option>
              ))}
          </select>
        )}
      </header>
      <nav className="tabs" role="tablist">
        {TABS.map(([t, label]) => (
          <button key={t} role="tab" aria-selected={tab === t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {label}
          </button>
        ))}
      </nav>
      {error && (
        <div className="error-box" role="alert">
          {error}
        </div>
      )}
      {tab === 'students' && <Students pin={pin} profiles={profiles} onChanged={() => setReload((x) => x + 1)} />}
      {tab === 'data' && <DataTab pin={pin} onRestored={props.onRestored} />}
      {tab !== 'students' && tab !== 'data' && pid !== null && !d && <p className="loading">Loading…</p>}
      {tab !== 'students' && tab !== 'data' && pid === null && <p>Add a student first.</p>}
      {d && tab === 'overview' && <Overview d={d} />}
      {d && tab === 'grades' && <Grades d={d} />}
      {d && tab === 'mastery' && <MasteryTab d={d} />}
      {d && tab === 'assessments' && <Assessments d={d} pin={pin} />}
      {d && tab === 'time' && <TimeSupport d={d} />}
      {d && tab === 'report' && pid !== null && <Report pin={pin} pid={pid} />}
    </div>
  );
}

const PACE_LABEL = { ahead: 'Ahead', 'on-track': 'On track', behind: 'Behind', 'not-started': 'Not started' };

function Overview({ d }: { d: ParentDashboard }) {
  const o = d.overview;
  return (
    <>
      <p className="headline">{o.headline}</p>
      <div className="cards">
        <section className="card">
          <h2>Progress</h2>
          <Progress value={o.semesterPercent} label={`${o.lessonsCompleted} of ${o.lessonsCompleted + o.lessonsRemaining} course days complete`} />
          <div className="stat-row">
            <Stat label="Grade" value={o.grade.percent === null ? '—' : `${o.grade.percent}% ${o.grade.letter}`} />
            <Stat label="Pace" value={PACE_LABEL[o.paceStatus]} />
          </div>
          <p className="sub">{o.paceDetail}</p>
          {o.currentUnit && <p className="sub">Current: {o.currentUnit}</p>}
        </section>
        <section className="card">
          <h2>Engagement</h2>
          <div className="stat-row">
            <Stat label="Streak" value={`${d.engagement.streak} d`} />
            <Stat label="Longest" value={`${d.engagement.longestStreak} d`} />
            <Stat label="Level" value={String(d.engagement.level)} />
          </div>
          <div className="stat-row">
            <Stat label="This week" value={fmtMinutes(d.time.thisWeekMinutes)} />
            <Stat label="All time" value={fmtMinutes(d.time.totalMinutes)} />
          </div>
        </section>
        <section className="card">
          <h2>Needs attention</h2>
          {d.needsAttention.length === 0 ? (
            <p className="sub">Nothing flagged right now.</p>
          ) : (
            <ul className="compact">
              {d.needsAttention.map((s) => (
                <li key={s.skillId}>
                  {s.name} <span className={`stage stage-${s.stage}`}>{STAGE_LABEL[s.stage]}</span>
                </li>
              ))}
            </ul>
          )}
          {d.support.repeatedErrors.length > 0 && (
            <>
              <h3>Repeated error patterns</h3>
              <ul className="compact">
                {d.support.repeatedErrors.map((e) => (
                  <li key={e.misconception}>
                    {e.label} ({e.count}×)
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>
        <section className="card">
          <h2>Strengths</h2>
          {d.strengths.length === 0 ? (
            <p className="sub">Strengths appear as skills reach Proficient.</p>
          ) : (
            <ul className="compact">
              {d.strengths.map((s) => (
                <li key={s.skillId}>
                  {s.name} <span className={`stage stage-${s.stage}`}>{STAGE_LABEL[s.stage]}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
        {d.profile.onboarding.diagnosticSummary && (
          <section className="card wide">
            <h2>Diagnostic</h2>
            <p>{d.profile.onboarding.diagnosticSummary.headline}</p>
            <ul className="compact">
              {d.profile.onboarding.diagnosticSummary.skills.map((s) => (
                <li key={s.skillId}>
                  {s.group === 'prereq' ? 'Earlier grade' : 'Course'}: {s.name}{' '}
                  <span className={`stage ${s.verdict === 'strong' ? 'stage-PROFICIENT' : 'stage-LEARNING'}`}>{s.verdict === 'strong' ? 'Shown' : s.verdict === 'not-learned' ? 'Not learned yet' : s.group === 'prereq' ? 'Needs a refresh' : 'To learn'}</span>{' '}
                  <span className="sub">
                    ({s.correct} of {s.answered} correct)
                  </span>
                </li>
              ))}
            </ul>
            <p className="sub">Taken {fmtDate(d.profile.onboarding.diagnosticSummary.completedAt)}. Suggested start: {d.profile.onboarding.diagnosticSummary.recommendedLessonTitle}.</p>
          </section>
        )}
        <section className="card wide">
          <h2>Recent activity</h2>
          {d.recentActivity.length === 0 ? (
            <p className="sub">No activity yet.</p>
          ) : (
            <ul className="activity">
              {d.recentActivity.map((a, i) => (
                <li key={i}>
                  <span className="sub">{new Date(a.at).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</span> {a.text}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}

function Grades({ d }: { d: ParentDashboard }) {
  const g = d.gradeDetail;
  return (
    <div className="cards">
      <section className="card wide">
        <h2>Course grade: {d.overview.grade.percent === null ? 'no graded work yet' : `${d.overview.grade.percent}% (${d.overview.grade.letter})`}</h2>
        <p className="sub">
          Lesson quizzes 30% (best attempt), unit assessments 45% (best of the first two attempts), semester assessment 20%, practice completion 5%. Until a category has work, its weight is shared among the others. A ≥ 90, B ≥ 80, C ≥ 70, below 70 is F.
        </p>
        <table className="data-table">
          <thead>
            <tr>
              <th>Category</th>
              <th>Weight</th>
              <th>Weight now</th>
              <th>Score</th>
            </tr>
          </thead>
          <tbody>
            {g.categories.map((c) => (
              <tr key={c.category}>
                <td>{c.label}</td>
                <td>{Math.round(c.weight * 100)}%</td>
                <td>{g.effectiveWeights[c.category] !== undefined ? `${Math.round(g.effectiveWeights[c.category] * 100)}%` : '—'}</td>
                <td>{c.percent === null ? '—' : `${c.percent}%`}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      {g.categories
        .filter((c) => c.items.length)
        .map((c) => (
          <section key={c.category} className="card">
            <h2>{c.label}</h2>
            <ul className="compact">
              {c.items.map((i) => (
                <li key={i.refId}>
                  {i.label}: <b>{i.percent}%</b> {i.attempts > 1 && <span className="sub">({i.attempts} attempts)</span>}
                </li>
              ))}
            </ul>
          </section>
        ))}
      {d.gradeTrend.length > 1 && (
        <section className="card wide">
          <h2>Grade over time</h2>
          <Trend points={d.gradeTrend} />
        </section>
      )}
    </div>
  );
}

function Trend({ points }: { points: Array<{ date: string; percent: number }> }) {
  const W = 600;
  const H = 160;
  const x = (i: number) => 30 + (i * (W - 50)) / Math.max(1, points.length - 1);
  const y = (p: number) => H - 20 - (p / 100) * (H - 40);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="trend" role="img" aria-label={`Grade trend from ${points[0].percent}% to ${points[points.length - 1].percent}%`}>
      {[70, 80, 90].map((g) => (
        <g key={g}>
          <line x1={30} x2={W - 20} y1={y(g)} y2={y(g)} className="graph-grid" />
          <text x={4} y={y(g) + 4} className="graph-tick">
            {g}
          </text>
        </g>
      ))}
      <polyline fill="none" stroke="var(--accent)" strokeWidth={2.5} points={points.map((p, i) => `${x(i)},${y(p.percent)}`).join(' ')} />
      {points.map((p, i) => (
        <circle key={i} cx={x(i)} cy={y(p.percent)} r={3.5} fill="var(--accent)">
          <title>
            {p.date}: {p.percent}%
          </title>
        </circle>
      ))}
    </svg>
  );
}

function MasteryTab({ d }: { d: ParentDashboard }) {
  return (
    <div className="cards">
      {d.masteryByUnit.map((u) => (
        <section key={u.unitId} className="card">
          <h2>{u.title}</h2>
          <Progress value={u.percentProficient} label={`${u.percentProficient}% of skills proficient or mastered`} />
          <details>
            <summary>Skills and standards</summary>
            <ul className="skill-list">
              {u.skills.map((s) => (
                <li key={s.skillId}>
                  <span>
                    {s.name} <span className="sub">{s.standards.join(', ')}</span>
                  </span>
                  <span className={`stage stage-${s.stage}`}>{STAGE_LABEL[s.stage]}</span>
                </li>
              ))}
            </ul>
          </details>
        </section>
      ))}
    </div>
  );
}

function Assessments({ d, pin }: { d: ParentDashboard; pin: string }) {
  const [detail, setDetail] = useState<ResultsView | null>(null);
  if (detail)
    return (
      <div>
        <button className="btn" onClick={() => setDetail(null)}>
          ← All assessments
        </button>
        <h2>{detail.title}</h2>
        <Results r={detail} />
      </div>
    );
  return (
    <section className="card wide">
      {d.assessments.length === 0 ? (
        <p className="sub">No quizzes or assessments yet.</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Assessment</th>
              <th>Attempt</th>
              <th>Score</th>
              <th>Time</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {d.assessments.map((a) => (
              <tr key={a.id}>
                <td>{fmtDate(a.date)}</td>
                <td>{a.title}</td>
                <td>{a.attemptNumber}</td>
                <td>{a.percent}%</td>
                <td>{Math.max(1, Math.round(a.durationMs / 60000))} min</td>
                <td>
                  <button className="btn btn-small" onClick={() => api.getAssessmentDetail(pin, d.profile.id, a.id).then(setDetail)}>
                    Review answers
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}

function TimeSupport({ d }: { d: ParentDashboard }) {
  const max = Math.max(30, ...d.time.byWeek.map((w) => w.minutes));
  return (
    <div className="cards">
      <section className="card wide">
        <h2>Study time by week</h2>
        <div className="bars" role="img" aria-label="Minutes studied in each of the last 8 weeks">
          {d.time.byWeek.map((w) => (
            <div key={w.weekStart} className="bar-col" title={`${w.minutes} minutes, ${w.lessons} lessons`}>
              <div className="bar" style={{ height: `${(100 * w.minutes) / max}%` }} />
              <div className="bar-label">{w.weekStart.slice(5)}</div>
              <div className="bar-value">{w.minutes}m</div>
            </div>
          ))}
        </div>
      </section>
      <section className="card">
        <h2>Support used</h2>
        <div className="stat-row">
          <Stat label="Answers" value={String(d.support.attempts)} />
          <Stat label="Hints" value={String(d.support.hintsUsed)} />
          <Stat label="Teach Me Again" value={String(d.support.teachAgainUses)} />
        </div>
        <p className="sub">First-try accuracy without hints: {d.support.firstTryAccuracy === null ? '—' : `${d.support.firstTryAccuracy}%`}</p>
        {d.support.teachAgainByLesson.length > 0 && (
          <>
            <h3>Teach Me Again by lesson</h3>
            <ul className="compact">
              {d.support.teachAgainByLesson.map((t) => (
                <li key={t.lessonId}>
                  {t.title}: {t.count}
                </li>
              ))}
            </ul>
          </>
        )}
      </section>
    </div>
  );
}

function Report({ pin, pid }: { pin: string; pid: number }) {
  const [r, setR] = useState<WeeklyReport | null>(null);
  const [week, setWeek] = useState<string | undefined>(undefined);
  useEffect(() => {
    api.getWeeklyReport(pin, pid, week).then(setR);
  }, [pin, pid, week]);
  if (!r) return <p className="loading">Loading…</p>;
  const shift = (days: number) => {
    const dt = new Date(r.weekStart + 'T12:00:00');
    dt.setDate(dt.getDate() + days);
    setWeek(dt.toISOString().slice(0, 10));
  };
  return (
    <section className="card wide report printable">
      <div className="row-buttons no-print">
        <button className="btn" onClick={() => shift(-7)}>
          ← Previous week
        </button>
        <button className="btn" onClick={() => shift(7)}>
          Next week →
        </button>
        <button className="btn btn-primary" onClick={() => printPage()}>
          Print / save as PDF
        </button>
      </div>
      <h2>
        Weekly report for {r.studentName}: {r.weekStart} to {r.weekEnd}
      </h2>
      <p className="headline">{r.summary}</p>
      <div className="stat-row">
        <Stat label="Lessons" value={String(r.lessonsCompleted.length)} />
        <Stat label="Minutes" value={String(r.minutes)} />
        <Stat label="Accuracy" value={r.accuracy === null ? '—' : `${r.accuracy}%`} />
        <Stat label="XP" value={`+${r.xpEarned}`} />
        <Stat label="Streak" value={`${r.streak} d`} />
      </div>
      {r.previous && (
        <p className="sub">
          Last week: {r.previous.lessons} lessons, {r.previous.minutes} minutes{r.previous.accuracy !== null ? `, ${r.previous.accuracy}% accuracy` : ''}.
        </p>
      )}
      <ReportList title="Lessons completed" items={r.lessonsCompleted.map((l) => l.title)} />
      <ReportList title="Quizzes and assessments" items={r.assessments.map((a) => `${a.title}: ${a.percent}%`)} />
      <ReportList title="Skills mastered" items={r.skillsMastered} />
      <ReportList title="Skills that reached Proficient" items={r.improvements} />
      <ReportList title="Needs attention" items={r.needsAttention} />
      <ReportList title="Recommended focus for next week" items={r.recommendedFocus} />
      <p className="sub">Generated {new Date(r.generatedAt).toLocaleString()}</p>
    </section>
  );
}

function ReportList({ title, items }: { title: string; items: string[] }) {
  return (
    <>
      <h3>{title}</h3>
      {items.length ? (
        <ul className="compact">
          {items.map((x, i) => (
            <li key={i}>{x}</li>
          ))}
        </ul>
      ) : (
        <p className="sub">None this week.</p>
      )}
    </>
  );
}

const DIAG_LABEL: Record<string, string> = { offered: 'not taken yet', in_progress: 'in progress', completed: 'done', skipped: 'skipped' };

function Students({ pin, profiles, onChanged }: { pin: string; profiles: ProfileSummary[]; onChanged: () => void }) {
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('spark');
  const [msg, setMsg] = useState<string | null>(null);
  const [editing, setEditing] = useState<{ id: number; name: string } | null>(null);
  const [confirmArchive, setConfirmArchive] = useState<number | null>(null);
  const [goals, setGoals] = useState<Record<number, { weeklyLessons: number; dailyMinutes: number }>>({});
  useEffect(() => {
    for (const p of profiles.filter((x) => !x.archived)) api.getParentDashboard(pin, p.id).then((d) => setGoals((g) => ({ ...g, [p.id]: d.goals })));
  }, [profiles, pin]);
  const add = async () => {
    setMsg(null);
    try {
      await api.createProfile(pin, name, avatar);
      setName('');
      onChanged();
    } catch (e) {
      setMsg(errorMessage(e));
    }
  };
  const diag = async (fn: () => Promise<unknown>, done: string) => {
    setMsg(null);
    try {
      await fn();
      setMsg(done);
      onChanged();
    } catch (e) {
      setMsg(errorMessage(e));
    }
  };
  const saveGoals = async (id: number) => {
    setMsg(null);
    try {
      await api.setGoals(pin, id, goals[id]);
      setMsg('Goals saved.');
    } catch (e) {
      setMsg(errorMessage(e));
    }
  };
  return (
    <div className="cards">
      {profiles.map((p) => (
        <section key={p.id} className="card">
          <h2>
            {AVATAR_EMOJI[p.avatar]} {p.displayName} {p.archived && <span className="tag">Archived</span>}
          </h2>
          <p className="sub">
            Created {fmtDate(p.createdAt)} · Level {p.level} · {p.xp} XP
          </p>
          {!p.archived && goals[p.id] && (
            <>
              <label className="field inline">
                <span>Lessons per week</span>
                <input type="number" min={1} max={10} value={goals[p.id].weeklyLessons} onChange={(e) => setGoals({ ...goals, [p.id]: { ...goals[p.id], weeklyLessons: Number(e.target.value) } })} />
              </label>
              <label className="field inline">
                <span>Minutes per day</span>
                <input type="number" min={10} max={180} step={5} value={goals[p.id].dailyMinutes} onChange={(e) => setGoals({ ...goals, [p.id]: { ...goals[p.id], dailyMinutes: Number(e.target.value) } })} />
              </label>
              <button className="btn btn-small" onClick={() => saveGoals(p.id)}>
                Save goals
              </button>
            </>
          )}
          {!p.archived && (
            <p className="sub">
              Diagnostic: {DIAG_LABEL[p.onboarding.diagnostic ?? 'offered']}{' '}
              {(p.onboarding.diagnostic ?? 'offered') === 'offered' || p.onboarding.diagnostic === 'in_progress' ? (
                <button className="btn btn-small" onClick={() => diag(() => api.skipDiagnostic(pin, p.id), 'The diagnostic was skipped.')}>
                  Skip it
                </button>
              ) : (
                <button className="btn btn-small" onClick={() => diag(() => api.reofferDiagnostic(pin, p.id), 'The diagnostic is offered again on the home screen.')}>
                  Offer it again
                </button>
              )}
            </p>
          )}
          <div className="row-buttons">
            {editing?.id === p.id ? (
              <>
                <input aria-label="New name" value={editing.name} maxLength={30} onChange={(e) => setEditing({ id: p.id, name: e.target.value })} />
                <button
                  className="btn btn-small btn-primary"
                  onClick={async () => {
                    try {
                      await api.updateProfile(pin, p.id, { displayName: editing.name });
                      setEditing(null);
                      onChanged();
                    } catch (e) {
                      setMsg(errorMessage(e));
                    }
                  }}
                >
                  Save
                </button>
              </>
            ) : (
              <button className="btn btn-small" onClick={() => setEditing({ id: p.id, name: p.displayName })}>
                Rename
              </button>
            )}
            <button
              className="btn btn-small"
              onClick={async () => {
                if (p.archived || confirmArchive === p.id) {
                  await api.updateProfile(pin, p.id, { archived: !p.archived });
                  setConfirmArchive(null);
                  onChanged();
                } else setConfirmArchive(p.id);
              }}
            >
              {p.archived ? 'Restore' : confirmArchive === p.id ? 'Confirm archive (progress is kept)' : 'Archive'}
            </button>
          </div>
        </section>
      ))}
      <section className="card">
        <h2>Add a student</h2>
        <label className="field">
          <span>First name or nickname</span>
          <input value={name} maxLength={30} onChange={(e) => setName(e.target.value)} />
        </label>
        <fieldset className="avatars">
          <legend>Icon</legend>
          {Object.entries(AVATAR_EMOJI).map(([k, e]) => (
            <button key={k} className={`avatar-pick ${avatar === k ? 'selected' : ''}`} aria-pressed={avatar === k} aria-label={k} onClick={() => setAvatar(k)}>
              {e}
            </button>
          ))}
        </fieldset>
        <button className="btn btn-primary" disabled={!name.trim()} onClick={add}>
          Add student
        </button>
      </section>
      {msg && (
        <div className="notice" role="status">
          {msg}
        </div>
      )}
    </div>
  );
}

function DataTab({ pin, onRestored }: { pin: string; onRestored: () => void }) {
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, setPending] = useState<{ name: string; data: string; info: BackupInfo } | null>(null);
  const [status, setStatus] = useState<AppStatus | null>(null);
  const [cur, setCur] = useState('');
  const [next, setNext] = useState('');
  useEffect(() => {
    api.getStatus().then(setStatus);
  }, []);
  const save = async () => {
    setMsg(null);
    try {
      const r = await saveBackupFile(pin);
      if (r.saved) setMsg(`Backup saved and verified${r.path ? `: ${r.path}` : ''}.`);
    } catch (e) {
      setMsg(errorMessage(e));
    }
  };
  const choose = async () => {
    setMsg(null);
    try {
      const f = await pickBackupFile();
      if (!f) return;
      const info = await api.inspectBackup(pin, f.data);
      if (!info.ok) return setMsg(info.reason ?? 'That file cannot be restored.');
      setPending({ ...f, info });
    } catch (e) {
      setMsg(errorMessage(e));
    }
  };
  const restore = async () => {
    if (!pending) return;
    try {
      const r = await api.restoreBackup(pin, pending.data);
      setMsg(r.message);
      setPending(null);
      if (r.ok) onRestored();
    } catch (e) {
      setMsg(errorMessage(e));
    }
  };
  const changePin = async () => {
    const r = await api.changeParentPin(cur, next);
    setMsg(r.ok ? 'PIN changed. Use the new PIN next time you open Parent Mode.' : r.message ?? 'The PIN was not changed.');
    if (r.ok) {
      setCur('');
      setNext('');
    }
  };
  return (
    <div className="cards">
      <section className="card">
        <h2>Back up</h2>
        <p>Save all students' progress to one file. Keep a copy on a USB drive or cloud folder. The app also keeps 14 days of automatic backups on this computer.</p>
        <button className="btn btn-primary" onClick={save}>
          Save a backup file
        </button>
      </section>
      <section className="card">
        <h2>Restore</h2>
        <p>Replace all progress on this computer with a backup file. Current data is saved as a safety backup first.</p>
        {!pending ? (
          <button className="btn" onClick={choose}>
            Choose a backup file…
          </button>
        ) : (
          <div className="confirm">
            <p>
              <b>{pending.name}</b>
              <br />
              Made {pending.info.createdAt ? new Date(pending.info.createdAt).toLocaleString() : 'at an unknown time'} by version {pending.info.appVersion}.
              <br />
              Students: {pending.info.profiles?.join(', ') || 'none'}
            </p>
            <p>Restoring also restores the Parent PIN that was set when the backup was made.</p>
            <div className="row-buttons">
              <button className="btn" onClick={() => setPending(null)}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={restore}>
                Restore this backup
              </button>
            </div>
          </div>
        )}
      </section>
      <section className="card">
        <h2>Change Parent PIN</h2>
        <label className="field">
          <span>Current PIN</span>
          <input type="password" inputMode="numeric" value={cur} maxLength={8} onChange={(e) => setCur(e.target.value.replace(/\D/g, ''))} />
        </label>
        <label className="field">
          <span>New PIN</span>
          <input type="password" inputMode="numeric" value={next} maxLength={8} onChange={(e) => setNext(e.target.value.replace(/\D/g, ''))} />
        </label>
        <button className="btn" disabled={cur.length < 4 || next.length < 4} onClick={changePin}>
          Change PIN
        </button>
      </section>
      <section className="card">
        <h2>About</h2>
        <p>Version {status?.version}</p>
        <p className="sub">Data folder: {status?.dataDir}</p>
        {isDesktop && (
          <button className="btn btn-small" onClick={() => openDataFolder()}>
            Open data folder
          </button>
        )}
        {status?.recoveredFrom && <p className="notice">At the last start, the app recovered data from its {status.recoveredFrom} copy.</p>}
      </section>
      {msg && (
        <div className="notice" role="status">
          {msg}
        </div>
      )}
    </div>
  );
}
