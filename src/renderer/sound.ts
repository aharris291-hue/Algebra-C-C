/** Optional, quiet sound cues (off by default; turned on in Settings). */
let enabled = false;
let ctx: AudioContext | null = null;

export function setSoundEnabled(on: boolean): void {
  enabled = on;
}

export function playSound(kind: 'correct' | 'complete'): void {
  if (!enabled) return;
  try {
    ctx ??= new AudioContext();
    const notes = kind === 'correct' ? [660, 880] : [523, 659, 784];
    notes.forEach((f, i) => {
      const o = ctx!.createOscillator();
      const g = ctx!.createGain();
      o.frequency.value = f;
      o.type = 'sine';
      const t = ctx!.currentTime + i * 0.09;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.08, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.25);
      o.connect(g).connect(ctx!.destination);
      o.start(t);
      o.stop(t + 0.3);
    });
  } catch {
    /* audio is optional */
  }
}
