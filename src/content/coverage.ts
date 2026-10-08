/**
 * Where each Georgia expectation is taught, reviewed and assessed, derived from the curriculum
 * data. Used by the generated docs (docs/STANDARDS_COVERAGE.md) and the Parent Mode standards view.
 */
import { LESSONS, SKILLS, UNIT_BY_ID } from './catalog';
import { EXPECTATIONS, BIG_IDEAS } from './standards';

const REVIEW_KINDS = ['unit-review', 'checkpoint', 'cumulative-review', 'semester-review'];
const ASSESSED_KINDS = ['unit-assessment', 'semester-assessment', 'capstone'];

export interface StandardCoverage {
  code: string;
  text: string;
  bigIdea: string;
  units: number[];
  skills: string[];
  taught: string[];
  reviewed: string[];
  assessed: string[];
}

export function standardsCoverage(): StandardCoverage[] {
  return EXPECTATIONS.map((e) => {
    const skills = SKILLS.filter((s) => s.standards.includes(e.code)).map((s) => s.id);
    const taught = LESSONS.filter((l) => l.kind === 'lesson' && (l.standards.includes(e.code) || l.skillsTaught.some((s) => skills.includes(s))));
    const reviewed = LESSONS.filter(
      (l) => !taught.includes(l) && (l.reviewSkills.some((s) => skills.includes(s)) || (REVIEW_KINDS.includes(l.kind) && (l.standards.includes(e.code) || l.skillsAssessed.some((s) => skills.includes(s))))),
    );
    const assessed = LESSONS.filter((l) => ASSESSED_KINDS.includes(l.kind) && (l.standards.includes(e.code) || l.skillsAssessed.some((s) => skills.includes(s))));
    return {
      code: e.code,
      text: e.text,
      bigIdea: BIG_IDEAS[e.bigIdea],
      units: [...new Set(taught.map((l) => UNIT_BY_ID.get(l.unitId)!.number))],
      skills,
      taught: taught.map((l) => l.id),
      reviewed: reviewed.map((l) => l.id),
      assessed: assessed.map((l) => l.id),
    };
  });
}
