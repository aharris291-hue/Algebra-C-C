/** Shared helpers for Unit 2 (inequalities) generators. */
import type { Rng, Problem, ProblemStep } from '../../core/curriculum/types';
import { Rational } from '../../core/math/rational';
import { parseRelation, relationHolds, checkAnswer } from '../../core/math/answers';
import { canonicalInput } from '../../core/engine/problems';
import { texToExpr, Q } from './util';

export type Op = '<' | '>' | '<=' | '>=';
export const OPS: readonly Op[] = ['<', '>', '<=', '>='];

export const OP_TEX: Record<Op, string> = { '<': '<', '>': '>', '<=': '\\le', '>=': '\\ge' };
export const FLIP_OP: Record<Op, Op> = { '<': '>', '>': '<', '<=': '>=', '>=': '<=' };
/** The same direction with the other strictness (< and <=). */
export const TOGGLE_STRICT: Record<Op, Op> = { '<': '<=', '<=': '<', '>': '>=', '>=': '>' };

export const isStrict = (op: Op) => op === '<' || op === '>';
export const isGreater = (op: Op) => op === '>' || op === '>=';

export function pickOp(rng: Rng): Op {
  return rng.pick(OPS);
}

/** Convert generator TeX for a relation ("2x + 1 \le 7") into checker syntax ("2x + 1 <= 7"). */
export function relTexToPlain(tex: string): string {
  return texToExpr(tex.replace(/\\le(?![a-z])|\\leq/g, '<=').replace(/\\ge(?![a-z])|\\geq/g, '>=').replace(/\\lt/g, '<').replace(/\\gt/g, '>'));
}

/** Does the typed relation hold at (x, y)? */
const parsed = new Map<string, ReturnType<typeof parseRelation>>();

export function holds(rel: string, x: Rational | number, y: Rational | number = 0): boolean {
  let r = parsed.get(rel);
  if (!r) {
    r = parseRelation(rel);
    if (parsed.size > 5000) parsed.clear();
    parsed.set(rel, r);
  }
  return relationHolds(r, Q(x as never), Q(y as never));
}

/**
 * Do two one-variable relations in x have the same solution set? Compared at the boundary,
 * just inside and outside it, and far away on both sides.
 */
export function sameOneVarSolutions(a: string, b: string, boundary: Rational): boolean {
  const probes = [boundary, boundary.add(Q(1, 3)), boundary.sub(Q(1, 3)), boundary.add(Q(1)), boundary.sub(Q(1)), boundary.add(Q(50)), boundary.sub(Q(50))];
  return probes.every((t) => holds(a, t) === holds(b, t));
}

/** Integer lattice points (x, y) with |x|, |y| <= r that satisfy every relation, nearest the origin first. */
export function latticeSolutions(rels: string[], r: number, strictInterior = false): Array<{ x: number; y: number }> {
  const out: Array<{ x: number; y: number }> = [];
  for (let x = -r; x <= r; x++)
    for (let y = -r; y <= r; y++) {
      if (!rels.every((rel) => holds(rel, x, y))) continue;
      // interior: not on any boundary line
      if (strictInterior && rels.some((rel) => holds(rel.replace(/<=|>=|<|>/, '='), x, y))) continue;
      out.push({ x, y });
    }
  return out.sort((p, q) => p.x * p.x + p.y * p.y - (q.x * q.x + q.y * q.y));
}

/** Point label for a choice option. */
export const ptTex = (x: Rational | number, y: Rational | number) => `$(${Q(x as never).toTex()}, ${Q(y as never).toTex()})$`;

// ---------------------------------------------------------------------------
// Guided steps (shared by the Unit 2 generators)
// ---------------------------------------------------------------------------

/**
 * A multiple-choice answer for a guided step. The option order comes from `salt` (a number
 * taken from the problem), not from the generator's rng, so adding steps never changes which
 * problem a seed produces.
 */
export function stepChoice(correct: string, distractors: string[], salt: number): { kind: 'choice'; options: { id: string; label: string }[]; correct: string } {
  const labels = [correct, ...distractors.filter((d, i, all) => d !== correct && all.indexOf(d) === i)];
  const shift = Math.abs(Math.trunc(salt)) % labels.length;
  const order = labels.map((_, i) => (i + shift) % labels.length);
  const options = order.map((k, i) => ({ id: 'abcdefgh'[i], label: labels[k] }));
  return { kind: 'choice', options, correct: 'abcdefgh'[order.indexOf(0)] };
}

/** Option id of a label in a choice answer ('' when absent). */
export function idOf(a: { options: { id: string; label: string }[] }, label: string): string {
  return a.options.find((o) => o.label === label)?.id ?? '';
}

/** Problems shared by every stepped generator: the last step must finish the problem. */
export function lastStepErrors(pr: Problem): string[] {
  if (!pr.steps?.length) return [];
  const last = pr.steps[pr.steps.length - 1];
  const r = checkAnswer(pr.answer, canonicalInput(last.answer));
  return r.status === 'correct' ? [] : [`last step answer ${canonicalInput(last.answer)} does not finish the problem (${r.status})`];
}

/** The correct label of a step's choice answer. */
export function stepLabel(st: ProblemStep | undefined): string {
  if (!st || st.answer.kind !== 'choice') return '';
  const a = st.answer;
  return a.options.find((o) => o.id === a.correct)?.label ?? '';
}
