/** Content registry: lesson content and problem generators by id. */
import type { GeneratorDef, LessonContent } from '../core/curriculum/types';
import { U1_FUNCTION_GENERATORS } from './generators/u1-functions';
import { U1_NOTATION_GENERATORS } from './generators/u1-notation';
import { U1_SLOPE_GENERATORS } from './generators/u1-slope';
import { U1_LINEAR_GENERATORS } from './generators/u1-linear';
import { U1_DOMAIN_GENERATORS } from './generators/u1-domain';
import { U1_SEQUENCE_GENERATORS } from './generators/u1-sequences';
import { U1_MODELING_GENERATORS } from './generators/u1-modeling';
import { U1_PARENT_GENERATORS } from './generators/u1-parent';
import { U2_ONE_VAR_GENERATORS } from './generators/u2-one-var';
import { U2_TWO_VAR_GENERATORS } from './generators/u2-two-var';
import { U2_SOLUTION_GENERATORS } from './generators/u2-solutions';
import { U2_SYSTEM_GENERATORS } from './generators/u2-systems';
import { U1L01 } from './lessons/U1/U1L01';
import { U1L02 } from './lessons/U1/U1L02';
import { U1L03 } from './lessons/U1/U1L03';
import { U1L04 } from './lessons/U1/U1L04';
import { U1L05 } from './lessons/U1/U1L05';
import { U1L06 } from './lessons/U1/U1L06';
import { U1L07 } from './lessons/U1/U1L07';
import { U1L08 } from './lessons/U1/U1L08';
import { U1L09 } from './lessons/U1/U1L09';
import { U1L10 } from './lessons/U1/U1L10';
import { U2L01 } from './lessons/U2/U2L01';
import { U2L02 } from './lessons/U2/U2L02';
import { U2L03 } from './lessons/U2/U2L03';
import { U2L04 } from './lessons/U2/U2L04';

export const ALL_GENERATORS: readonly GeneratorDef[] = [
  ...U1_FUNCTION_GENERATORS,
  ...U1_NOTATION_GENERATORS,
  ...U1_SLOPE_GENERATORS,
  ...U1_LINEAR_GENERATORS,
  ...U1_DOMAIN_GENERATORS,
  ...U1_SEQUENCE_GENERATORS,
  ...U1_MODELING_GENERATORS,
  ...U1_PARENT_GENERATORS,
  ...U2_ONE_VAR_GENERATORS,
  ...U2_TWO_VAR_GENERATORS,
  ...U2_SOLUTION_GENERATORS,
  ...U2_SYSTEM_GENERATORS,
];

export const GENERATORS: ReadonlyMap<string, GeneratorDef> = new Map(ALL_GENERATORS.map((g) => [g.id, g]));

export const LESSON_CONTENT: ReadonlyMap<string, LessonContent> = new Map([U1L01, U1L02, U1L03, U1L04, U1L05, U1L06, U1L07, U1L08, U1L09, U1L10, U2L01, U2L02, U2L03, U2L04].map((l) => [l.lessonId, l]));

/** Generators that practice a skill (used for spaced review and remediation). */
export function generatorsForSkill(skillId: string): GeneratorDef[] {
  return [...GENERATORS.values()].filter((g) => g.skillId === skillId);
}

export { LESSONS, UNITS, SKILLS, PREREQ_SKILLS, LESSON_BY_ID, SKILL_BY_ID, UNIT_BY_ID } from './catalog';
export { STANDARDS, STANDARD_BY_CODE, EXPECTATIONS } from './standards';
