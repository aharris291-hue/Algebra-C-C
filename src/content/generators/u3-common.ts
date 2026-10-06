/** Shared helpers for Unit 3 (rational and irrational numbers, radicals) generators. */
import { parseExpression } from '../../core/math/parser';
import { trySurd, Surd } from '../../core/math/surd';

/** Convert generator TeX with \sqrt, \sqrt[3], \frac, \cdot and \left( \right) back into parser syntax. */
export function radTexToPlain(tex: string): string {
  let s = tex.replace(/\\left|\\right/g, '').replace(/\\cdot|\\times/g, '*').replace(/\\,|\\;|\\ /g, '');
  for (let guard = 0; guard < 50 && /[{}]/.test(s); guard++) {
    s = s
      .replace(/\\frac\{([^{}]*)\}\{([^{}]*)\}/g, '(($1)/($2))')
      .replace(/\\sqrt\[3\]\{([^{}]*)\}/g, 'cbrt($1)')
      .replace(/\\sqrt\{([^{}]*)\}/g, 'sqrt($1)')
      .replace(/(?<!\\sqrt|\\sqrt\[3\]|\\frac|\})\{([^{}]*)\}/g, '($1)');
  }
  return s;
}

/** Exact value of a constant radical expression written in TeX, or null if it is outside the surd system. */
export function texSurd(tex: string): Surd | null {
  try {
    return trySurd(parseExpression(radTexToPlain(tex)));
  } catch {
    return null;
  }
}

export function plainSurd(plain: string): Surd | null {
  try {
    return trySurd(parseExpression(plain));
  } catch {
    return null;
  }
}

/** Largest k with k^index dividing n (n > 0), and the leftover factor. */
export function splitPower(n: number, index: 2 | 3): { out: number; inside: number } {
  let out = 1;
  let inside = Math.abs(n);
  for (let p = 2; Math.pow(p, index) <= inside; p++) {
    const pk = Math.pow(p, index);
    while (inside % pk === 0) {
      inside /= pk;
      out *= p;
    }
  }
  return { out, inside };
}

/** Radicands with no square factor other than 1. */
export const SQUAREFREE = [2, 3, 5, 6, 7, 10, 11, 13, 14, 15, 17, 19, 21, 22, 23];
/** Radicands with no cube factor other than 1. */
export const CUBEFREE = [2, 3, 4, 5, 6, 7, 9, 10, 11, 12, 15, 18];

/** "6sqrt(2)" style answer text for coef·√rad (rad 1 means a plain number). */
export function radPlain(coef: number, rad: number, index: 2 | 3 = 2): string {
  if (rad === 1) return String(coef);
  const fn = index === 2 ? 'sqrt' : 'cbrt';
  if (coef === 1) return `${fn}(${rad})`;
  if (coef === -1) return `-${fn}(${rad})`;
  return `${coef}${fn}(${rad})`;
}

export function radTex(coef: number, rad: number, index: 2 | 3 = 2): string {
  if (rad === 1) return String(coef);
  const r = index === 2 ? `\\sqrt{${rad}}` : `\\sqrt[3]{${rad}}`;
  if (coef === 1) return r;
  if (coef === -1) return `-${r}`;
  return `${coef}${r}`;
}

/** Join signed terms ("3sqrt(2)", "-sqrt(3)") into "3sqrt(2) - sqrt(3)". */
export function joinTerms(terms: string[]): string {
  const t = terms.filter((x) => x !== '0');
  if (!t.length) return '0';
  return t.map((x, i) => (i === 0 ? x : x.startsWith('-') ? ` - ${x.slice(1)}` : ` + ${x}`)).join('');
}

/** Parser-syntax text for a Surd with integer coefficients, e.g. "5 + 2sqrt(3) - cbrt(4)". */
export function surdPlain(s: Surd): string {
  return joinTerms(
    s.parts().map((q) => {
      if (!q.coef.isInteger()) throw new Error('surdPlain needs integer coefficients');
      return radPlain(q.coef.toInt(), q.index === 1 ? 1 : Number(q.radicand), q.index === 3 ? 3 : 2);
    }),
  );
}

/** True when every radical part of s has a radicand with no square (or cube) factor and integer coefficients. */
export function isSimplifiedSurd(s: Surd): boolean {
  return s.parts().every((q) => q.coef.isInteger() && (q.index === 1 || splitPower(Number(q.radicand), q.index as 2 | 3).out === 1));
}
