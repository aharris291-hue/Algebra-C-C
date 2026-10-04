/**
 * Live preview of what the student typed (spec §13): shows how the app reads the input as
 * formatted math, or a friendly message explaining what it can't read. It never says
 * whether an answer is right.
 */
import type { AnswerKind } from '../../shared/api';
import { parseExpression, MathSyntaxError } from '../../core/math/parser';
import { astTex } from '../../core/math/format';
import { parseRelations, parseInterval, intervalToTex, parseSolutionList } from '../../core/math/answers';

const REL_TEX: Record<string, string> = { '=': '=', '<': '<', '>': '>', '<=': '\\le', '>=': '\\ge' };

function friendly(e: unknown): string {
  if (e instanceof MathSyntaxError) return e.friendly;
  return 'The app cannot read this yet. Check for a missing number or symbol.';
}

export function previewAnswer(input: string, kind: AnswerKind): { tex: string | null; error: string | null } {
  if (typeof input !== 'string') return { tex: null, error: null };
  const s = input.trim();
  if (!s || s.length > 300) return { tex: null, error: null };
  try {
    switch (kind) {
      case 'choice':
        return { tex: null, error: null };
      case 'number':
      case 'expression':
        return { tex: astTex(parseExpression(s)), error: null };
      case 'equation':
      case 'inequality': {
        const { parts, ops } = parseRelations(s);
        if (!ops.length) return { tex: astTex(parts[0]), error: kind === 'equation' ? 'Include an equals sign, like y = 2x + 1.' : 'Include an inequality sign, like x > 3.' };
        let tex = astTex(parts[0]);
        ops.forEach((op, i) => (tex += ` ${REL_TEX[op]} ${astTex(parts[i + 1])}`));
        return { tex, error: null };
      }
      case 'point': {
        const m = s.match(/^\(?\s*([^,]+?)\s*,\s*([^,]+?)\s*\)?$/);
        if (!m) return { tex: null, error: 'Write a point as (x, y), for example (3, -2).' };
        return { tex: `\\left(${astTex(parseExpression(m[1]))},\\ ${astTex(parseExpression(m[2]))}\\right)`, error: null };
      }
      case 'interval':
        return { tex: intervalToTex(parseInterval(s)), error: null };
      case 'solutions': {
        const sols = parseSolutionList(s);
        if (sols === 'none') return { tex: '\\text{no real solutions}', error: null };
        return { tex: sols.map((n) => `x = ${astTex(n)}`).join(',\\quad '), error: null };
      }
      case 'sequence-terms': {
        const terms = s.split(/\s*,\s*/).filter(Boolean);
        return { tex: terms.map((t) => astTex(parseExpression(t))).join(',\\ '), error: null };
      }
    }
  } catch (e) {
    return { tex: null, error: friendly(e) };
  }
  return { tex: null, error: null };
}
