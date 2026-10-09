/**
 * Lesson Quality Audit (spec follow-up 2), the measurable part: for every instructional lesson,
 * checks the ten required elements and prints one line per lesson plus every shortfall.
 * Run: npx tsx scripts/lesson-quality.ts [--json out.json]
 */
import { writeFileSync } from 'node:fs';
import { LESSON_CONTENT, GENERATORS } from '../src/content';
import { LESSON_BY_ID } from '../src/content/catalog';
import { produceProblem } from '../src/core/engine/problems';
import type { Block, Difficulty, LessonContent } from '../src/core/curriculum/types';

function text(blocks: Block[]): string {
  return JSON.stringify(blocks);
}

function words(s: string): number {
  return s.split(/\s+/).filter(Boolean).length;
}

export interface LessonQuality {
  lessonId: string;
  title: string;
  numbers: Record<string, number>;
  issues: string[];
}

export function auditLesson(l: LessonContent): LessonQuality {
  const meta = LESSON_BY_ID.get(l.lessonId);
  const issues: string[] = [];
  const n: Record<string, number> = {};

  // 98 clear learning objective
  n.goalWords = words(l.goal);
  if (n.goalWords < 8) issues.push('objective: goal is very short');
  if (!/\b(will|can|be able|learn|find|write|solve|use|graph|identify|explain|compare|interpret|model|describe|calculate|determine)\b/i.test(l.goal)) issues.push('objective: goal does not name what the student will do');

  // 99 age-appropriate explanation: instruction exists and is substantial
  const instr = text(l.instruction);
  n.instructionWords = words(instr.replace(/[{}"\[\],:]/g, ' '));
  n.instructionBlocks = l.instruction.length;
  if (n.instructionBlocks < 4) issues.push('explanation: fewer than 4 instruction blocks');
  n.needToKnowBlocks = l.needToKnow.length;
  if (!n.needToKnowBlocks) issues.push('explanation: no "What You Need to Know" refresher');

  // 100 multiple worked examples (and a common mistake / real-world)
  n.examples = l.examples.length;
  if (n.examples < 3) issues.push('examples: fewer than 3 worked examples');
  const kinds = new Set(l.examples.map((e) => e.kind));
  if (!kinds.has('common-mistake')) issues.push('examples: no common-mistake example');
  if (!kinds.has('real-world')) issues.push('examples: no real-world example');

  // 101 WHY: every worked step that does work should say why
  let steps = 0;
  let noWhy = 0;
  for (const e of l.examples)
    for (const s of e.steps) {
      steps++;
      if (!s.why || s.why.trim().length < 10) noWhy++;
    }
  n.exampleSteps = steps;
  n.stepsWithoutWhy = noWhy;
  if (steps && noWhy / steps > 0.25) issues.push(`why: ${noWhy} of ${steps} worked-example steps have no WHY`);
  if (!/why|because|reason|so that|this works/i.test(instr)) issues.push('why: instruction never explains why');

  // 102 guided practice, step by step
  n.guided = l.guided.length;
  if (n.guided < 2) issues.push('guided: fewer than 2 guided problems');

  // 103 progressive hints and 106 error-specific feedback: sample the lesson's generators
  const refs = [...l.guided, ...l.independent.mix, ...l.quiz.items];
  const gens = [...new Set(refs.map((r) => `${r.generator}|${r.difficulty}`))];
  let sampled = 0;
  let withMisc = 0;
  let guidedSteps = 0;
  let guidedSampled = 0;
  for (const g of gens) {
    const [id, d] = g.split('|');
    const gen = GENERATORS.get(id);
    if (!gen) {
      issues.push(`missing generator ${id}`);
      continue;
    }
    for (let s = 1; s <= 12; s++) {
      const { problem } = produceProblem(gen, s * 104729 + Number(d), Number(d) as Difficulty);
      sampled++;
      if (problem.misconceptions.length > 0 || problem.answer.kind === 'choice') withMisc++;
      if (l.guided.some((r) => r.generator === id && String(r.difficulty) === d)) {
        guidedSampled++;
        if (problem.steps?.length) guidedSteps++;
      }
    }
  }
  n.sampledProblems = sampled;
  n.errorFeedbackPct = Math.round((100 * withMisc) / Math.max(1, sampled));
  if (n.errorFeedbackPct < 80) issues.push(`feedback: only ${n.errorFeedbackPct}% of sampled problems have error-specific feedback`);
  n.guidedStepPct = Math.round((100 * guidedSteps) / Math.max(1, guidedSampled));
  if (guidedSampled && n.guidedStepPct < 50) issues.push(`guided: only ${n.guidedStepPct}% of guided problems are broken into steps`);

  // 104 independent practice
  n.independentCount = l.independent.count;
  n.independentGenerators = new Set(l.independent.mix.map((m) => m.generator)).size;
  if (n.independentCount < 6) issues.push('independent: fewer than 6 problems');
  const diffs = new Set(l.independent.mix.map((m) => m.difficulty));
  if (diffs.size < 2) issues.push('independent: only one difficulty level');

  // 105 short quiz, covering what was taught
  n.quizItems = l.quiz.items.length;
  if (n.quizItems < 4) issues.push('quiz: fewer than 4 items');
  if (meta) {
    const quizSkills = new Set(l.quiz.items.map((r) => GENERATORS.get(r.generator)?.skillId));
    const missing = meta.skillsAssessed.filter((s) => !quizSkills.has(s));
    // generators may produce several skills; only flag when no quiz generator ever produces the skill
    const produced = new Set<string>();
    for (const r of l.quiz.items) {
      const gen = GENERATORS.get(r.generator);
      if (!gen) continue;
      for (let s = 1; s <= 20; s++) produced.add(produceProblem(gen, s * 7 + r.difficulty, r.difficulty).problem.skillId);
    }
    const reallyMissing = missing.filter((s) => !produced.has(s));
    if (reallyMissing.length) issues.push(`quiz: assessed skill(s) ${reallyMissing.join(', ')} never appear in the quiz`);
    // every assessed skill should be taught: practiced in guided or independent work
    const practiced = new Set<string>();
    for (const r of [...l.guided, ...l.independent.mix]) {
      const gen = GENERATORS.get(r.generator);
      if (!gen) continue;
      for (let s = 1; s <= 20; s++) practiced.add(produceProblem(gen, s * 11 + r.difficulty, r.difficulty).problem.skillId);
    }
    const untaught = meta.skillsAssessed.filter((s) => !practiced.has(s));
    if (untaught.length) issues.push(`teach-before-test: skill(s) ${untaught.join(', ')} are quizzed but never practiced`);
  }

  // 107 mastery evaluation
  n.quizPass = l.mastery.quizPassScore;
  n.practiceMinCorrect = l.mastery.practiceMinCorrect;
  if (l.mastery.quizPassScore < 0.7) issues.push('mastery: quiz pass bar below 70%');
  if (l.mastery.practiceMinCorrect < 3) issues.push('mastery: fewer than 3 correct practice answers required');

  // Teach Me Again (spec C6) and summary
  n.teachAgain = l.teachMeAgain.length;
  if (n.teachAgain < 2) issues.push('teach-again: fewer than 2 alternative explanations');
  n.summary = l.summary.length;
  if (n.summary < 3) issues.push('summary: fewer than 3 summary points');

  return { lessonId: l.lessonId, title: meta?.title ?? '', numbers: n, issues };
}

if (require.main === module) {
  const all = [...LESSON_CONTENT.values()].map(auditLesson);
  for (const q of all) {
    const k = q.numbers;
    console.log(`${q.lessonId} ex=${k.examples} why-missing=${k.stepsWithoutWhy}/${k.exampleSteps} guided=${k.guided}(${k.guidedStepPct}% stepped) ind=${k.independentCount} quiz=${k.quizItems} feedback=${k.errorFeedbackPct}% tma=${k.teachAgain}${q.issues.length ? '\n   - ' + q.issues.join('\n   - ') : ''}`);
  }
  console.log(`\n${all.length} lessons, ${all.filter((q) => q.issues.length).length} with issues, ${all.reduce((s, q) => s + q.issues.length, 0)} issues`);
  const i = process.argv.indexOf('--json');
  if (i > 0) writeFileSync(process.argv[i + 1], JSON.stringify(all, null, 1));
}
