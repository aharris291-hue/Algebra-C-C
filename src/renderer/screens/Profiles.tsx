/** Profile picker shown at launch. */
import { useEffect, useState } from 'react';
import type { ProfileSummary } from '../../shared/api';
import { api } from '../api';
import { AVATAR_EMOJI } from '../labels';

export function Profiles(props: { onPick: (id: number) => void; onParent: () => void }) {
  const [list, setList] = useState<ProfileSummary[] | null>(null);
  useEffect(() => {
    api.listProfiles().then((l) => setList(l.filter((p) => !p.archived)));
  }, []);
  return (
    <div className="setup">
      <div className="setup-card wide">
        <h1>Who is learning today?</h1>
        <div className="profile-grid">
          {list?.map((p) => (
            <button key={p.id} className="profile-tile" onClick={() => props.onPick(p.id)}>
              <span className="avatar big" aria-hidden>
                {AVATAR_EMOJI[p.avatar] ?? '✨'}
              </span>
              <span className="profile-name">{p.displayName}</span>
              <span className="sub">Level {p.level}</span>
            </button>
          ))}
          {list && list.length === 0 && <p>No student profiles yet. Add one in Parent Mode.</p>}
        </div>
        <button className="btn btn-quiet" onClick={props.onParent}>
          Parent Mode
        </button>
      </div>
    </div>
  );
}
