/** Content registry: lesson content and problem generators by id. */
import type { GeneratorDef, LessonContent } from '../core/curriculum/types';
import { U1_FUNCTION_GENERATORS } from './generators/u1-functions';
import { U1L01 } from './lessons/U1/U1L01';

export const GENERATORS: ReadonlyMap<string, GeneratorDef> = new Map([...U1_FUNCTION_GENERATORS].map((g) => [g.id, g]));

export const LESSON_CONTENT: ReadonlyMap<string, LessonContent> = new Map([U1L01].map((l) => [l.lessonId, l]));

/** Generators that practice a skill (used for spaced review and remediation). */
export function generatorsForSkill(skillId: string): GeneratorDef[] {
  return [...GENERATORS.values()].filter((g) => g.skillId === skillId);
}

export { LESSONS, UNITS, SKILLS, PREREQ_SKILLS, LESSON_BY_ID, SKILL_BY_ID, UNIT_BY_ID } from './catalog';
export { STANDARDS, STANDARD_BY_CODE, EXPECTATIONS } from './standards';
