/** Student settings (spec §30): theme, text size, motion, sound. */
import { useEffect, useState } from 'react';
import type { Settings as S } from '../../shared/api';
import { api, errorMessage } from '../api';

export function SettingsScreen(props: { profileId: number; onBack: () => void; onChange: (s: S) => void }) {
  const [s, setS] = useState<S | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    api.getSettings(props.profileId).then(setS);
  }, [props.profileId]);
  const update = async (patch: Partial<S>) => {
    try {
      const next = await api.updateSettings(props.profileId, patch);
      setS(next);
      props.onChange(next);
    } catch (e) {
      setError(errorMessage(e));
    }
  };
  if (!s) return <div className="page loading">Loading…</div>;
  return (
    <div className="page narrow">
      <header className="page-head">
        <button className="btn btn-quiet" onClick={props.onBack}>
          ← Dashboard
        </button>
        <h1>Settings</h1>
      </header>
      {error && (
        <div className="error-box" role="alert">
          {error}
        </div>
      )}
      <section className="card">
        <label className="field">
          <span>Theme</span>
          <select value={s.theme} onChange={(e) => update({ theme: e.target.value as S['theme'] })}>
            <option value="system">Match Windows</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </label>
        <label className="field">
          <span>Text size: {Math.round(s.textScale * 100)}%</span>
          <input type="range" min={0.9} max={1.4} step={0.05} value={s.textScale} onChange={(e) => update({ textScale: Number(e.target.value) })} />
        </label>
        <label className="check">
          <input type="checkbox" checked={s.reducedMotion} onChange={(e) => update({ reducedMotion: e.target.checked })} /> Reduce motion and animations
        </label>
        <label className="check">
          <input type="checkbox" checked={s.sound} onChange={(e) => update({ sound: e.target.checked })} /> Play quiet sounds for correct answers
        </label>
      </section>
    </div>
  );
}
