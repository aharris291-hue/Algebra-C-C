/** Top-level navigation, settings/theme, and the active-time heartbeat. */
import { useCallback, useEffect, useRef, useState } from 'react';
import type { AppStatus, Settings } from '../shared/api';
import { DEFAULT_SETTINGS } from '../shared/api';
import { api, errorMessage } from './api';
import { setSoundEnabled } from './sound';
import { FirstRun } from './screens/FirstRun';
import { Profiles } from './screens/Profiles';
import { Home } from './screens/Home';
import { CourseMap, SkillsView } from './screens/CourseMap';
import { LessonPlayer } from './screens/LessonPlayer';
import { DayPlayer } from './screens/DayPlayer';
import { DiagnosticPlayer } from './screens/DiagnosticPlayer';
import { GraphingTool } from './components/GraphingTool';
import { ParentMode } from './screens/Parent';
import { SettingsScreen } from './screens/Settings';

type Screen =
  | { name: 'loading' }
  | { name: 'first-run' }
  | { name: 'profiles' }
  | { name: 'home' }
  | { name: 'course' }
  | { name: 'skills' }
  | { name: 'settings' }
  | { name: 'lesson'; lessonId: string; testOut?: boolean }
  | { name: 'day'; lessonId: string }
  | { name: 'diagnostic' }
  | { name: 'parent'; back: 'profiles' | 'home' };

const HEARTBEAT_SECONDS = 15;
const IDLE_AFTER_MS = 90_000;

export function App() {
  const [status, setStatus] = useState<AppStatus | null>(null);
  const [screen, setScreen] = useState<Screen>({ name: 'loading' });
  const [profileId, setProfileId] = useState<number | null>(null);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [fatal, setFatal] = useState<string | null>(null);
  const [toolOpen, setToolOpen] = useState(false);
  const activity = useRef<{ lessonId: string | null; activity: string }>({ lessonId: null, activity: 'dashboard' });
  const lastInput = useRef(Date.now());

  const start = useCallback(async () => {
    try {
      const s = await api.getStatus();
      setStatus(s);
      if (s.firstRun) return setScreen({ name: 'first-run' });
      const profiles = (await api.listProfiles()).filter((p) => !p.archived);
      if (profiles.length === 1) {
        setProfileId(profiles[0].id);
        setScreen({ name: 'home' });
      } else setScreen({ name: 'profiles' });
    } catch (e) {
      setFatal(errorMessage(e));
    }
  }, []);
  useEffect(() => {
    start();
  }, [start]);

  // per-profile settings
  useEffect(() => {
    if (profileId === null) return setSettings(DEFAULT_SETTINGS);
    api.getSettings(profileId).then(setSettings, () => setSettings(DEFAULT_SETTINGS));
  }, [profileId]);
  useEffect(() => {
    const root = document.documentElement;
    const dark = settings.theme === 'dark' || (settings.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    root.dataset.theme = dark ? 'dark' : 'light';
    root.style.fontSize = `${16 * settings.textScale}px`;
    root.dataset.motion = settings.reducedMotion ? 'reduced' : 'full';
    setSoundEnabled(settings.sound);
  }, [settings]);

  // Active study time: counted only while the window is visible and the student has
  // interacted recently (spec §21 time tracking).
  useEffect(() => {
    const mark = () => (lastInput.current = Date.now());
    const evs = ['keydown', 'pointerdown', 'wheel', 'pointermove'];
    evs.forEach((e) => window.addEventListener(e, mark, { passive: true }));
    const t = setInterval(() => {
      if (profileId === null || document.hidden || Date.now() - lastInput.current > IDLE_AFTER_MS) return;
      if (screen.name === 'parent' || screen.name === 'profiles' || screen.name === 'first-run') return;
      api.heartbeat(profileId, activity.current.lessonId, activity.current.activity, HEARTBEAT_SECONDS).catch(() => undefined);
    }, HEARTBEAT_SECONDS * 1000);
    return () => {
      clearInterval(t);
      evs.forEach((e) => window.removeEventListener(e, mark));
    };
  }, [profileId, screen.name]);

  useEffect(() => {
    if (screen.name !== 'lesson' && screen.name !== 'day' && screen.name !== 'diagnostic') activity.current = { lessonId: null, activity: screen.name === 'home' ? 'dashboard' : screen.name };
  }, [screen]);

  if (fatal)
    return (
      <div className="setup">
        <div className="setup-card">
          <h1>Something went wrong</h1>
          <p>{fatal}</p>
          <button className="btn" onClick={() => location.reload()}>
            Try again
          </button>
        </div>
      </div>
    );

  const banner = status?.recoveredFrom ? (
    <div className="banner" role="status">
      The app found a problem with its newest save and restored your progress from its {status.recoveredFrom === 'prev' ? 'previous save' : status.recoveredFrom === 'tmp' ? 'last save in progress' : 'automatic backup'}. Your recent work may be a few steps behind.
    </div>
  ) : status?.persistError ? (
    <div className="banner banner-error" role="alert">
      Progress could not be saved to disk: {status.persistError}
    </div>
  ) : null;

  const go = (s: Screen) => setScreen(s);
  const openLesson = (id: string, testOut?: boolean, kind?: string) => go(kind && kind !== 'lesson' ? { name: 'day', lessonId: id } : { name: 'lesson', lessonId: id, testOut });

  return (
    <div className="app">
      {banner}
      {screen.name === 'loading' && <div className="page loading">Starting…</div>}
      {screen.name === 'first-run' && (
        <FirstRun
          onDone={(id, diagnostic) => {
            setProfileId(id);
            api.setOnboarding(id, { introSeen: true }).catch(() => undefined);
            api.getStatus().then(setStatus);
            go(diagnostic ? { name: 'diagnostic' } : { name: 'home' });
          }}
        />
      )}
      {screen.name === 'profiles' && (
        <Profiles
          onPick={(id) => {
            setProfileId(id);
            go({ name: 'home' });
          }}
          onParent={() => go({ name: 'parent', back: 'profiles' })}
        />
      )}
      {screen.name === 'home' && profileId !== null && (
        <Home profileId={profileId} onOpenLesson={(id, kind) => openLesson(id, false, kind)} onCourse={() => go({ name: 'course' })} onSkills={() => go({ name: 'skills' })} onSettings={() => go({ name: 'settings' })} onSwitch={() => go({ name: 'profiles' })} onDiagnostic={() => go({ name: 'diagnostic' })} />
      )}
      {screen.name === 'course' && profileId !== null && <CourseMap profileId={profileId} onOpenLesson={openLesson} onBack={() => go({ name: 'home' })} />}
      {screen.name === 'skills' && profileId !== null && <SkillsView profileId={profileId} onBack={() => go({ name: 'home' })} />}
      {screen.name === 'settings' && profileId !== null && <SettingsScreen profileId={profileId} onBack={() => go({ name: 'home' })} onChange={setSettings} />}
      {screen.name === 'lesson' && profileId !== null && (
        <LessonPlayer
          key={`${screen.lessonId}:${screen.testOut ? 't' : 'n'}`}
          profileId={profileId}
          lessonId={screen.lessonId}
          testOut={screen.testOut}
          onExit={() => go({ name: 'home' })}
          onOpenLesson={(id) => openLesson(id)}
          setActivity={(lessonId, a) => (activity.current = { lessonId, activity: a })}
        />
      )}
      {screen.name === 'day' && profileId !== null && (
        <DayPlayer key={screen.lessonId} profileId={profileId} lessonId={screen.lessonId} onExit={() => go({ name: 'home' })} setActivity={(lessonId, a) => (activity.current = { lessonId, activity: a })} />
      )}
      {(screen.name === 'lesson' || screen.name === 'day') && profileId !== null && (
        <>
          {!toolOpen && (
            <button className="btn gt-launch" onClick={() => setToolOpen(true)} aria-label="Open the graphing tool">
              📈 Graphing tool
            </button>
          )}
          {toolOpen && <GraphingTool onClose={() => setToolOpen(false)} />}
        </>
      )}
      {screen.name === 'diagnostic' && profileId !== null && (
        <DiagnosticPlayer profileId={profileId} onExit={() => go({ name: 'home' })} onOpenLesson={(id) => openLesson(id)} setActivity={(lessonId, a) => (activity.current = { lessonId, activity: a })} />
      )}
      {screen.name === 'parent' && (
        <ParentMode
          onExit={() => {
            if (screen.back === 'home' && profileId !== null) go({ name: 'home' });
            else start();
          }}
          onRestored={() => {
            setProfileId(null);
            start();
          }}
        />
      )}
    </div>
  );
}
