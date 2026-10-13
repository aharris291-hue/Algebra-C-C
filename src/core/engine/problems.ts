/**
 * Problem production pipeline. Every problem shown to a student passes:
 *   1. the generator's own independent verify() (re-derives the answer another way)
 *   2. generic checks: answer key accepted by its own checker (in the requested form),
 *      misconception answers are really wrong, hints present and non-revealing,
 *      worked solution present, guided steps self-consistent.
 * A problem that fails is rejected and the next seed is tried (spec §41, §44).
 */
import type { Difficulty, GeneratorDef, Problem, ProblemStep } from '../curriculum/types';
import { checkAnswer, AnswerSpec, Misconception, exactValue, fixedPlaces, misconceptionSpec } from '../math/answers';
import { canonicalGraphInput } from '../math/graphAnswer';
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
    case 'graph':
      return canonicalGraphInput(spec);
  }
}

/**
 * Each misconception, typed the way a student would write it, must be recognized as that
 * misconception (its own tag), so its targeted feedback can actually be shown.
 */
export function misconceptionReachErrors(spec: AnswerSpec, list: Misconception[] | undefined, where = ''): string[] {
  const errs: string[] = [];
  const pre = where ? `${where}: ` : '';
  for (const m of list ?? []) {
    let typed: string;
    try {
      typed = canonicalInput(misconceptionSpec(spec, m.answer));
    } catch (e) {
      errs.push(`${pre}misconception "${m.answer}" is not written as a ${spec.kind} answer (${(e as Error).message})`);
      continue;
    }
    const r = checkAnswer(spec, typed, list);
    if (r.status !== 'incorrect' || r.misconception !== m.tag) {
      errs.push(`${pre}misconception "${m.answer}" (${m.tag}) typed as "${typed}" is not recognized: ${r.status}${r.misconception ? ' ' + r.misconception : ''}`);
    }
  }
  return errs;
}

/** Relation symbols in hint text (TeX or Unicode), normalized to one character each. */
function normalizeRelations(text: string): string {
  return text
    .replace(/\\(?:leq?|leqslant)(?![a-zA-Z])/g, '≤')
    .replace(/\\(?:geq?|geqslant)(?![a-zA-Z])/g, '≥')
    .replace(/\\(?:neq?)(?![a-zA-Z])/g, '≠')
    .replace(/\\lt(?![a-zA-Z])/g, '<')
    .replace(/\\gt(?![a-zA-Z])/g, '>')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

/**
 * Does a hint (or misconception feedback) state the final answer? Caught: "= key" (not "x = key",
 * an input being assigned), a bound "y ≤ key" / "x > key" / "≠ key" (any relation symbol, TeX or
 * Unicode, so "y ≤ 102" when the greatest whole number is 102), "answer is key", and
 * "… is key" closing a sentence or clause ("so the greatest is 102.").
 */
export function leaksAnswer(hint: string, spec: AnswerSpec): boolean {
  // a drawing has no typed key to give away (its hints are checked by the generator tests)
  if (spec.kind === 'graph') return false;
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
  // (a "." after the key ends a sentence; only ".<digit>" continues the number)
  const notMore = '(?![0-9/^]|\\.[0-9])';
  if (new RegExp(`(?<![a-zA-Z])=${esc}${notMore}`).test(h) || new RegExp(`answeris${esc}${notMore}`, 'i').test(h)) return true;
  // The stronger checks read the hint with its spacing kept (so "y ≤ 3x" is not the key 3) and
  // with TeX spacing, bold and $ removed.
  const spaced = normalizeRelations(hint)
    .replace(/\\[,;!: ]/g, ' ')
    .replace(/\\(?:quad|qquad|text\{\s*\})/g, ' ')
    .replace(/\*\*|\$/g, '')
    .replace(/\s+/g, ' ');
  const loose = [...key].map((c) => c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('\\s*');
  const after = '(?!\\s*(?:[0-9/^]|\\.\\s*[0-9]))(?![a-zA-Z(])';
  // a bound that is the answer itself: "so y ≤ 102" when the greatest whole number is 102
  if (new RegExp(`[≤≥<>≠]\\s*${loose}${after}`).test(spaced)) return true;
  // "... is key" closing a sentence or clause ("so the greatest is 102.")
  if (new RegExp(`(?<![a-zA-Z])is\\s+${loose}\\s*(?:[.,;!]|$)`).test(spaced)) return true;
  return false;
}

export function validateStep(step: ProblemStep, where: string): string[] {
  const errs: string[] = [];
  const self = checkAnswer(step.answer, canonicalInput(step.answer));
  if (self.status !== 'correct') errs.push(`${where}: key not accepted (${self.status}: ${self.message ?? ''})`);
  if (step.hints.length !== 4 || step.hints.some((h) => !h || !h.trim())) errs.push(`${where}: needs 4 hints`);
  step.hints.forEach((h, i) => {
    if (leaksAnswer(h, step.answer)) errs.push(`${where}: hint ${i + 1} states the step's answer`);
  });
  for (const m of step.misconceptions ?? []) {
    const r = checkAnswer(step.answer, m.answer);
    if (r.status === 'correct' || r.status === 'wrong-form') errs.push(`${where}: misconception "${m.answer}" is actually correct`);
  }
  errs.push(...misconceptionReachErrors(step.answer, step.misconceptions, where));
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
  errs.push(...misconceptionReachErrors(p.answer, p.misconceptions));
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
