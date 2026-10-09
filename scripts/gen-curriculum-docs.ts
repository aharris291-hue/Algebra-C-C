/** Generates docs/CURRICULUM_MAP.md and docs/STANDARDS_COVERAGE.md from the curriculum data. Run: npx tsx scripts/gen-curriculum-docs.ts */
import fs from 'node:fs';
import path from 'node:path';
import { LESSONS, SKILLS, UNITS, SKILL_BY_ID, UNIT_BY_ID } from '../src/content/catalog';
import { STANDARDS } from '../src/content/standards';
import { standardsCoverage } from '../src/content/coverage';

const docs = path.resolve(__dirname, '..', 'docs');
fs.mkdirSync(docs, { recursive: true });

const kindLabel: Record<string, string> = {
  lesson: 'Lesson', checkpoint: 'Checkpoint', 'unit-review': 'Unit review', 'unit-assessment': 'Unit assessment',
  'cumulative-review': 'Cumulative review', capstone: 'Capstone', 'semester-review': 'Semester review', 'semester-assessment': 'Semester assessment',
};

let map = `# 18-Week Semester Curriculum Map\n\n_Generated from \`src/content/catalog.ts\` by \`scripts/gen-curriculum-docs.ts\`. Do not edit by hand._\n\n`;
map += `Course: Georgia **Algebra: Concepts & Connections** (2021 Georgia K-12 Mathematics Standards).\n\n`;
map += `Pacing: GaDOE curriculum map, block schedule (one semester). 90 instructional days = 18 weeks x 5 days, about 30-45 minutes each. `;
map += `Lesson quizzes are inside every lesson; spaced review is mixed into every lesson's practice in addition to the review days listed here.\n\n`;
map += `| Unit | Title | GaDOE block days | Our days |\n|---|---|---|---|\n`;
for (const u of UNITS) map += `| ${u.number} | ${u.title} | ${u.gadoeBlockDays[0]}-${u.gadoeBlockDays[1]} | ${LESSONS.filter((l) => l.unitId === u.id).length} |\n`;
map += `\n`;
for (let w = 1; w <= 18; w++) {
  map += `## Week ${w}\n\n| Day | ID | Unit | Title | Type | Standards | Skills |\n|---|---|---|---|---|---|---|\n`;
  for (const l of LESSONS.filter((x) => x.week === w)) {
    const skills = (l.kind === 'lesson' ? l.skillsTaught : l.skillsAssessed).map((s) => `${s} ${SKILL_BY_ID.get(s)!.name}`).join('; ');
    map += `| ${l.day} | ${l.id} | ${UNIT_BY_ID.get(l.unitId)!.number} | ${l.title} | ${kindLabel[l.kind]} | ${l.standards.join(', ')} | ${skills} |\n`;
  }
  map += `\n`;
}
map += `## Lesson objectives and prerequisites\n\n`;
for (const l of LESSONS) {
  map += `### ${l.id} ${l.title}\n- Type: ${kindLabel[l.kind]}, Week ${l.week}, Day ${l.day}, ${l.durationMinutes} min, difficulty ${l.difficulty}\n- Standards: ${l.standards.join(', ')}\n- Objectives: ${l.objectives.join(' ')}\n- Prerequisites: ${l.prerequisites.join(', ') || 'none'}\n- Skills taught: ${l.skillsTaught.join(', ') || 'none'}\n- Skills assessed: ${l.skillsAssessed.join(', ') || 'none'}\n- Spaced review: ${l.reviewSkills.join(', ') || 'chosen adaptively'}\n\n`;
}
fs.writeFileSync(path.join(docs, 'CURRICULUM_MAP.md'), map);

let cov = `# Standards Coverage Matrix\n\n_Generated from curriculum data by \`scripts/gen-curriculum-docs.ts\`. Do not edit by hand._\n\n`;
cov += `Source: GaDOE 2021 Algebra: Concepts & Connections standards; GaDOE HS Algebra Curriculum Map (NEW 2023). See STANDARDS_SOURCES.md.\n\n`;
cov += `Mathematical Practices (A.MP.1-8) and Mathematical Modeling (A.MM.1) are integrated across all units per the GaDOE curriculum map.\n\n`;
cov += `| Standard | Big idea | Unit | Taught in | Reviewed in | Assessed in |\n|---|---|---|---|---|---|\n`;
for (const c of standardsCoverage()) {
  cov += `| **${c.code}** | ${c.bigIdea} | ${c.units.join(', ')} | ${c.taught.join(', ')} | ${c.reviewed.join(', ') || 'spaced review'} | ${c.assessed.join(', ') || '-'} + lesson quizzes |\n`;
}
cov += `\n## Standard text\n\n`;
for (const s of STANDARDS) cov += `- **${s.code}**: ${s.text}\n`;
cov += `\n## Skills\n\n| Skill | Name | Standards | Prerequisites | Essential |\n|---|---|---|---|---|\n`;
for (const s of SKILLS) cov += `| ${s.id} | ${s.name} | ${s.standards.join(', ')} | ${s.prerequisites.join(', ')} | ${s.essential ? 'yes' : ''} |\n`;
fs.writeFileSync(path.join(docs, 'STANDARDS_COVERAGE.md'), cov);
console.log('wrote docs/CURRICULUM_MAP.md and docs/STANDARDS_COVERAGE.md');
