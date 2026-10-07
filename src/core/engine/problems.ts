/**
 * Problem production pipeline. Every problem shown to a student passes:
 *   1. the generator's own independent verify() (re-derives the answer another way)
 *   2. generic checks: answer key accepted by its own checker (in the requested form),
 *      misconception answers are really wrong, hints present and non-revealing,
 *      worked solution present, guided steps self-consistent.
 * A problem that fails is rejected and the next seed is tried (spec §41, §44).
 */
import type { Difficulty, GeneratorDef, Problem, ProblemStep } from '../curriculum/types';
import { checkAnswer, AnswerSpec, exactValue, fixedPlaces } from '../math/answers';
import { createRng, deriveSeed } from './rng';

/** Text that the checker should accept as the key for a spec. */
export function canonicalInput(spec: AnswerSpec): string {
  switch (spec.kind) {
    case 'number':
      // a rounded answer is typed rounded (the exact key can be a very long fraction, e.g. compound interest)
      return spec.roundTo !== undefined ? fixedPlaces(exactValue(spec.value)!.rationalPart(), spec.roundTo) : spec.value;
    case 'expression':
    case 'equation':
    case 'inequality':
    case 'interval':
      return spec.value;
    case 'point':
      return `(${spec.x}, ${spec.y})`;
    case 'region-point':
      return `(${spec.example.x}, ${spec.example.y})`;
    case 'solutions':
      return spec.values.length === 0 ? 'no real solutions' : spec.values.join(', ');
    case 'choice':
      return spec.correct;
    case 'sequence-terms':
      return spec.values.join(', ');
  }
}

function leaksAnswer(hint: string, spec: AnswerSpec): boolean {
  if (spec.kind === 'choice') {
    const label = spec.options.find((o) => o.id === spec.correct)?.label ?? '';
    return label.length > 3 && hint.toLowerCase().includes(`answer is ${label.toLowerCase()}`);
  }
  const key = canonicalInput(spec).replace(/\s+/g, '');
  if (key.length === 0) return false;
  const h = hint.replace(/\s+/g, '').replace(/\$/g, '');
  const esc = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // "f(3) = key" or "answer is key" states the final answer. "x = key" (a variable being
  // assigned an input value) does not, so "=" preceded by a letter is ignored.
  return new RegExp(`(?<![a-zA-Z])=${esc}(?![0-9./])`).test(h) || new RegExp(`answeris${esc}(?![0-9./])`, 'i').test(h);
}

export function validateStep(step: ProblemStep, where: string): string[] {
  const errs: string[] = [];
  const self = checkAnswer(step.answer, canonicalInput(step.answer));
  if (self.status !== 'correct') errs.push(`${where}: key not accepted (${self.status}: ${self.message ?? ''})`);
  if (step.hints.length !== 4 || step.hints.some((h) => !h || !h.trim())) errs.push(`${where}: needs 4 hints`);
  for (const m of step.misconceptions ?? []) {
    const r = checkAnswer(step.answer, m.answer);
    if (r.status === 'correct' || r.status === 'wrong-form') errs.push(`${where}: misconception "${m.answer}" is actually correct`);
  }
  if (!step.explanation) errs.push(`${where}: missing explanation`);
  return errs;
}

export function validateProblem(p: Problem, gen: GeneratorDef): string[] {
  const errs: string[] = [];
  if (!p.prompt.length) errs.push('empty prompt');
  const self = checkAnswer(p.answer, canonicalInput(p.answer));
  if (self.status !== 'correct') errs.push(`answer key not accepted by checker (${self.status}: ${self.message ?? ''})`);
  if (p.hints.length !== 4 || p.hints.some((h) => !h || !h.trim())) errs.push('needs exactly 4 non-empty hints');
  p.hints.forEach((h, i) => {
    if (leaksAnswer(h, p.answer)) errs.push(`hint ${i + 1} states the final answer`);
  });
  for (const m of p.misconceptions) {
    let r;
    try {
      r = checkAnswer(p.answer, m.answer);
    } catch {
      errs.push(`misconception "${m.answer}" cannot be checked`);
      continue;
    }
    if (r.status === 'correct' || r.status === 'wrong-form') errs.push(`misconception "${m.answer}" equals the correct answer`);
    if (!m.feedback) errs.push('misconception without feedback');
    if (leaksAnswer(m.feedback, p.answer)) errs.push('misconception feedback reveals the answer');
  }
  if (!p.solution.length) errs.push('missing worked solution');
  p.steps?.forEach((s, i) => errs.push(...validateStep(s, `step ${i + 1}`)));
  try {
    errs.push(...gen.verify(p));
  } catch (e) {
    errs.push('verify() threw: ' + (e as Error).message);
  }
  return errs;
}

export interface ProduceResult {
  problem: Problem;
  /** seeds rejected before this one */
  rejected: Array<{ seed: number; errors: string[] }>;
}

export class GeneratorFailure extends Error {}

export function produceProblem(gen: GeneratorDef, seed: number, difficulty: Difficulty, maxTries = 25): ProduceResult {
  const rejected: ProduceResult['rejected'] = [];
  for (let i = 0; i < maxTries; i++) {
    const s = i === 0 ? seed : deriveSeed(seed, i);
    let p: Problem;
    try {
      p = gen.generate(createRng(s), difficulty);
    } catch (e) {
      rejected.push({ seed: s, errors: ['generate() threw: ' + (e as Error).message] });
      continue;
    }
    p = { ...p, id: `${gen.id}:${difficulty}:${s}`, seed: s, generatorId: gen.id, difficulty };
    const errs = validateProblem(p, gen);
    if (errs.length === 0) return { problem: p, rejected };
    rejected.push({ seed: s, errors: errs });
  }
  throw new GeneratorFailure(`${gen.id} could not produce a valid problem: ${JSON.stringify(rejected.slice(0, 3))}`);
}
