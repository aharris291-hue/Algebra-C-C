import { describe, it, expect } from 'vitest';
import { ALL_GENERATORS } from '../../src/content';
import { createRng } from '../../src/core/engine/rng';
import type { Difficulty, Problem } from '../../src/core/curriculum/types';

/** Every string a student can see (prompt, hints, steps, explanations, solution, feedback) and the keys. */
function strings(p: Problem): string[] {
  const out: string[] = [];
  const walk = (v: unknown) => {
    if (typeof v === 'string') out.push(v);
    else if (Array.isArray(v)) v.forEach(walk);
    else if (v && typeof v === 'object') Object.values(v).forEach(walk);
  };
  // misconception answers are only matched against input, never shown: their feedback is
  const feedback = (ms: Problem['misconceptions'] | undefined) => (ms ?? []).map((m) => m.feedback);
  walk({ prompt: p.prompt, answer: p.answer, hints: p.hints, solution: p.solution, feedback: feedback(p.misconceptions) });
  for (const st of p.steps ?? []) walk({ prompt: st.prompt, answer: st.answer, hints: st.hints, explanation: st.explanation, feedback: feedback(st.misconceptions) });
  return out;
}

/** Badly formatted arithmetic that shared helpers (coefTex, sub, plusTex) exist to avoid. */
export const TEXT_RULES: Array<[string, RegExp]> = [
  ['coefficient 1 or -1 written out (write x, -x)', /(?:^|[=+(]\s*|-)1(?![0-9.,])(?:[a-z](?![a-z])|\\sqrt)/],
  ['"+ -n" (write "- n")', /\+\s*-\s*[0-9a-z\\(]/],
  ['"a - -b" (parenthesize the negative)', /(?:[0-9a-z)}]\s*)-\s*-\s*[0-9a-z\\]/],
  ['"÷ -n" (parenthesize the negative)', /(?:÷|\\div)\s*-/],
];

describe('generated text uses clean signs and coefficients', () => {
  it('no "-1x", "1x", "+ -", "- -" or "÷ -" in any generator (all difficulties, 80 seeds)', { timeout: 300_000 }, () => {
    const bad = new Map<string, string>();
    for (const g of ALL_GENERATORS) {
      for (const d of [1, 2, 3] as Difficulty[]) {
        for (let s = 1; s <= 80; s++) {
          let p: Problem;
          try {
            p = g.generate(createRng(s * 104729 + d), d);
          } catch {
            continue;
          }
          for (const t of strings(p)) {
            const text = t.replace(/\\left|\\right/g, '').replace(/\\,|\;|\\!|\\ /g, ' ');
            for (const [name, re] of TEXT_RULES) {
              const m = re.exec(text);
              if (m && !bad.has(`${g.id} ${name}`)) bad.set(`${g.id} ${name}`, `d${d}: …${text.slice(Math.max(0, m.index - 40), m.index + 30)}…`);
            }
          }
        }
      }
    }
    expect([...bad.entries()].map(([k, v]) => `${k}: ${v}`)).toEqual([]);
  });
});
