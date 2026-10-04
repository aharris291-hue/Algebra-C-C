import { LESSONS, SKILLS, SKILL_BY_ID, UNITS, PREREQ_SKILLS } from '../../src/content/catalog';
import { EXPECTATIONS, STANDARD_BY_CODE } from '../../src/content/standards';

describe('semester catalog', () => {
  it('has exactly 90 days over 18 weeks, 5 per week', () => {
    expect(LESSONS.length).toBe(90);
    for (let w = 1; w <= 18; w++) expect(LESSONS.filter((l) => l.week === w).length).toBe(5);
  });
  it('unit day counts are within the GaDOE block ranges (U9 may use its upper bound + review/exam)', () => {
    for (const u of UNITS) {
      const n = LESSONS.filter((l) => l.unitId === u.id).length;
      if (u.id === 'U9') expect(n).toBeLessThanOrEqual(6);
      else {
        expect(n).toBeGreaterThanOrEqual(u.gadoeBlockDays[0]);
        expect(n).toBeLessThanOrEqual(u.gadoeBlockDays[1]);
      }
    }
  });
  it('every lesson references real standards and skills', () => {
    for (const l of LESSONS) {
      for (const s of l.standards) expect(STANDARD_BY_CODE.has(s), `${l.id} ${s}`).toBe(true);
      for (const s of [...l.skillsTaught, ...l.skillsAssessed, ...l.reviewSkills]) expect(SKILL_BY_ID.has(s), `${l.id} ${s}`).toBe(true);
    }
  });
  it('every skill is taught exactly once and assessed in its unit assessment', () => {
    for (const s of SKILLS) {
      const teaching = LESSONS.filter((l) => l.skillsTaught.includes(s.id));
      expect(teaching.length, s.id).toBe(1);
      const ua = LESSONS.find((l) => l.unitId === s.unitId && l.kind === 'unit-assessment');
      expect(ua?.skillsAssessed.includes(s.id), s.id).toBe(true);
    }
  });
  it('skills are taught after their in-course prerequisites', () => {
    const taughtDay = new Map<string, number>();
    for (const l of LESSONS) for (const s of l.skillsTaught) taughtDay.set(s, l.day);
    for (const s of SKILLS) {
      for (const p of s.prerequisites) {
        if (p.startsWith('P.')) continue;
        expect(taughtDay.get(p)! <= taughtDay.get(s.id)!, `${s.id} needs ${p}`).toBe(true);
      }
    }
    for (const p of PREREQ_SKILLS) expect(p.id.startsWith('P.')).toBe(true);
  });
  it('every Georgia expectation is taught by a lesson and appears in an assessment', () => {
    const skillStd = (code: string) => SKILLS.filter((s) => s.standards.includes(code)).map((s) => s.id);
    for (const e of EXPECTATIONS) {
      if (e.code.startsWith('A.MP')) continue;
      const taughtIn = LESSONS.filter((l) => l.kind === 'lesson' && (l.standards.includes(e.code) || l.skillsTaught.some((s) => skillStd(e.code).includes(s))));
      expect(taughtIn.length, `${e.code} not taught`).toBeGreaterThan(0);
      const assessedIn = LESSONS.filter((l) => (l.kind === 'unit-assessment' || l.kind === 'semester-assessment' || l.kind === 'capstone') && (l.standards.includes(e.code) || l.skillsAssessed.some((s) => skillStd(e.code).includes(s))));
      expect(assessedIn.length, `${e.code} not assessed`).toBeGreaterThan(0);
    }
  });
});
