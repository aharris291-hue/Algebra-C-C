/** First launch (spec §39): welcome, Parent PIN, recovery code, first student, how it works. */
import { useState } from 'react';
import { api, errorMessage } from '../api';
import { AVATAR_EMOJI } from '../labels';

type Step = 'welcome' | 'pin' | 'recovery' | 'student' | 'how' | 'diagnostic';

export function FirstRun(props: { onDone: (profileId: number, startDiagnostic: boolean) => void }) {
  const [step, setStep] = useState<Step>('welcome');
  const [pin, setPin] = useState('');
  const [pin2, setPin2] = useState('');
  const [code, setCode] = useState('');
  const [wrote, setWrote] = useState(false);
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('spark');
  const [profileId, setProfileId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const createPin = async () => {
    setError(null);
    if (pin !== pin2) return setError('The two PINs do not match.');
    setBusy(true);
    try {
      const r = await api.setupParent(pin);
      setCode(r.recoveryCode);
      setStep('recovery');
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };
  const createStudent = async () => {
    setError(null);
    setBusy(true);
    try {
      const p = await api.createProfile(pin, name, avatar);
      setProfileId(p.id);
      setStep('how');
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="setup">
      <div className="setup-card">
        {step === 'welcome' && (
          <>
            <h1>Welcome to Algebra C&amp;C Learning Academy</h1>
            <p>
              This app teaches Georgia's 9th grade <b>Algebra: Concepts &amp; Connections</b> course, one lesson at a time. It works completely offline, and all progress is saved on this computer.
            </p>
            <p>Setup takes about two minutes. A parent or guardian should do the first step.</p>
            <button className="btn btn-primary btn-lg" onClick={() => setStep('pin')} autoFocus>
              Get started
            </button>
          </>
        )}
        {step === 'pin' && (
          <>
            <h1>Create a Parent PIN</h1>
            <p>The Parent PIN protects Parent Mode: progress reports, goals, student profiles and backups. Students do not need it to learn.</p>
            <label className="field">
              <span>PIN (4 to 8 digits)</span>
              <input type="password" inputMode="numeric" autoComplete="new-password" value={pin} maxLength={8} onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))} autoFocus />
            </label>
            <label className="field">
              <span>Type it again</span>
              <input type="password" inputMode="numeric" autoComplete="new-password" value={pin2} maxLength={8} onChange={(e) => setPin2(e.target.value.replace(/\D/g, ''))} onKeyDown={(e) => e.key === 'Enter' && createPin()} />
            </label>
            {error && (
              <div className="error-box" role="alert">
                {error}
              </div>
            )}
            <button className="btn btn-primary btn-lg" disabled={pin.length < 4 || busy} onClick={createPin}>
              Create PIN
            </button>
          </>
        )}
        {step === 'recovery' && (
          <>
            <h1>Save your recovery code</h1>
            <p>If you ever forget the Parent PIN, this code lets you set a new one. Write it down and keep it somewhere safe. It is shown only once.</p>
            <div className="recovery-code" aria-label="Recovery code">
              {code}
            </div>
            <label className="check">
              <input type="checkbox" checked={wrote} onChange={(e) => setWrote(e.target.checked)} /> I wrote down the recovery code
            </label>
            <button className="btn btn-primary btn-lg" disabled={!wrote} onClick={() => setStep('student')}>
              Continue
            </button>
          </>
        )}
        {step === 'student' && (
          <>
            <h1>Add your student</h1>
            <label className="field">
              <span>First name or nickname</span>
              <input value={name} maxLength={30} onChange={(e) => setName(e.target.value)} autoFocus />
            </label>
            <fieldset className="avatars">
              <legend>Pick an icon</legend>
              {Object.entries(AVATAR_EMOJI).map(([k, e]) => (
                <button key={k} className={`avatar-pick ${avatar === k ? 'selected' : ''}`} aria-pressed={avatar === k} aria-label={k} onClick={() => setAvatar(k)}>
                  {e}
                </button>
              ))}
            </fieldset>
            {error && (
              <div className="error-box" role="alert">
                {error}
              </div>
            )}
            <button className="btn btn-primary btn-lg" disabled={!name.trim() || busy} onClick={createStudent}>
              Create profile
            </button>
          </>
        )}
        {step === 'how' && (
          <>
            <h1>How it works</h1>
            <ul className="how-list">
              <li>
                <b>Lessons</b> follow the Georgia course in order: learn, see examples, practice with hints, then a short quiz.
              </li>
              <li>
                <b>Mastery</b> grows as you answer correctly over time. Skills move from Learning to Developing, Proficient and Mastered. Missed something? You get a different explanation and targeted practice, then try again.
              </li>
              <li>
                <b>XP and levels</b> come from real learning: correct answers, finished lessons and mastered skills. Guessing quickly earns nothing.
              </li>
              <li>
                <b>Streaks</b> count days with real study: at least 5 problems, 10 minutes, or a finished lesson section.
              </li>
              <li>
                <b>Show What You Know</b> lets you test out of a lesson you already understand.
              </li>
            </ul>
            <button className="btn btn-primary btn-lg" onClick={() => setStep('diagnostic')} autoFocus>
              Continue
            </button>
          </>
        )}
        {step === 'diagnostic' && (
          <>
            <h1>Find a starting point</h1>
            <p>
              The diagnostic is a short, ungraded check (20 to 30 minutes) of the earlier-grade skills algebra builds on, plus a few algebra skills {name.trim() || 'your student'} may already know. It sets
              starting skill levels, suggests lessons to test out of, and offers warm-up practice where it helps. One wrong answer never decides a skill.
            </p>
            <p>It can be taken now or later from the home screen. A parent can skip it.</p>
            {error && (
              <div className="error-box" role="alert">
                {error}
              </div>
            )}
            <button className="btn btn-primary btn-lg" onClick={() => profileId && props.onDone(profileId, true)} autoFocus>
              Take the diagnostic now
            </button>
            <div className="setup-secondary">
              <button className="btn" onClick={() => profileId && props.onDone(profileId, false)}>
                Later
              </button>
              <button
                className="btn btn-quiet"
                disabled={busy}
                onClick={async () => {
                  if (!profileId) return;
                  setBusy(true);
                  setError(null);
                  try {
                    await api.skipDiagnostic(pin, profileId);
                    props.onDone(profileId, false);
                  } catch (e) {
                    setError(errorMessage(e));
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                Skip it (parent)
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
