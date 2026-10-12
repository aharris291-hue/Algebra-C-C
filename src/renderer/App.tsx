/** Top-level navigation, settings/theme, and the active-time heartbeat. */
import { useCallback, useEffect, useRef, useState } from 'react';
import type { AppStatus, Settings } from '../shared/api';
import { DEFAULT_SETTINGS, SAVE_STATUS_EVENT } from '../shared/api';
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
/** Monotonic time for idle detection: unlike Date.now() it does not jump when the system clock is changed. */
const mono = () => performance.now();

export function App() {
  const [status, setStatus] = useState<AppStatus | null>(null);
  const [screen, setScreen] = useState<Screen>({ name: 'loading' });
  const [profileId, setProfileId] = useState<number | null>(null);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [fatal, setFatal] = useState<string | null>(null);
  const [toolOpen, setToolOpen] = useState(false);
  const activity = useRef<{ lessonId: string | null; activity: string }>({ lessonId: null, activity: 'dashboard' });
  const lastInput = useRef(mono());
  // read by the single heartbeat interval, so screen changes do not restart it
  const profileRef = useRef<number | null>(null);
  const screenRef = useRef<Screen['name']>('loading');
  profileRef.current = profileId;
  screenRef.current = screen.name;

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
  // interacted recently (spec §21 time tracking). One interval for the whole session: it reads
  // the current profile and screen from refs, so moving between screens never drops the
  // partly elapsed interval. Idle time uses a monotonic clock, so moving the system clock
  // back cannot make an idle student look active.
  useEffect(() => {
    const mark = () => (lastInput.current = mono());
    const evs = ['keydown', 'pointerdown', 'wheel', 'pointermove'];
    evs.forEach((e) => window.addEventListener(e, mark, { passive: true }));
    const t = setInterval(() => {
      const pid = profileRef.current;
      const idleMs = mono() - lastInput.current;
      if (pid === null || document.hidden || !(idleMs >= 0 && idleMs <= IDLE_AFTER_MS)) return;
      const name = screenRef.current;
      if (name === 'parent' || name === 'profiles' || name === 'first-run' || name === 'loading') return;
      api.heartbeat(pid, activity.current.lessonId, activity.current.activity, HEARTBEAT_SECONDS).catch(() => undefined);
    }, HEARTBEAT_SECONDS * 1000);
    return () => {
      clearInterval(t);
      evs.forEach((e) => window.removeEventListener(e, mark));
    };
  }, []);

  // Save status: a background save can fail at any time (disk full, file locked). Every call
  // result carries `saveError` while saving is failing; the API client re-announces it as a
  // window event so the warning appears at once. As a fallback the status is re-checked with
  // each heartbeat tick. The warning disappears as soon as a save succeeds.
  const showSaveError = useCallback((persistError: string | undefined) => {
    setStatus((prev) => (prev === null || prev.persistError === persistError ? prev : { ...prev, persistError }));
  }, []);
  useEffect(() => {
    const onSave = (e: Event) => showSaveError((e as CustomEvent<{ saveError?: string }>).detail?.saveError);
    window.addEventListener(SAVE_STATUS_EVENT, onSave);
    const t = setInterval(() => {
      api.getStatus().then((s) => showSaveError(s.persistError), () => undefined);
    }, HEARTBEAT_SECONDS * 1000);
    return () => {
      window.removeEventListener(SAVE_STATUS_EVENT, onSave);
      clearInterval(t);
    };
  }, [showSaveError]);

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

  const banner = (
    <>
      {status?.persistError && (
        <div className="banner banner-error" role="alert">
          {status.persistError}
        </div>
      )}
      {status?.recoveredFrom && (
        <div className="banner" role="status">
          The app found a problem with its newest save and restored your progress from its {status.recoveredFrom === 'prev' ? 'previous save' : status.recoveredFrom === 'tmp' ? 'last save in progress' : 'automatic backup'}. Your recent work may be a few steps behind.
        </div>
      )}
    </>
  );

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
