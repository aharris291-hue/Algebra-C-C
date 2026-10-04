import type { MasteryStage } from '../core/engine/mastery';

export const STAGE_LABEL: Record<MasteryStage, string> = {
  NOT_STARTED: 'Not started',
  LEARNING: 'Learning',
  DEVELOPING: 'Developing',
  PROFICIENT: 'Proficient',
  MASTERED: 'Mastered',
};

export const KIND_LABEL: Record<string, string> = {
  lesson: 'Lesson',
  checkpoint: 'Checkpoint',
  'unit-review': 'Unit review',
  'unit-assessment': 'Unit assessment',
  'cumulative-review': 'Cumulative review',
  capstone: 'Capstone',
  'semester-review': 'Semester review',
  'semester-assessment': 'Semester assessment',
};

export const AVATAR_EMOJI: Record<string, string> = {
  spark: '✨',
  rocket: '🚀',
  wave: '🌊',
  mountain: '⛰️',
  planet: '🪐',
  bolt: '⚡',
  leaf: '🍃',
  compass: '🧭',
};

export function fmtMinutes(m: number): string {
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  return `${h} h ${m % 60} min`;
}

export function fmtDate(ms: number): string {
  return new Date(ms).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}
