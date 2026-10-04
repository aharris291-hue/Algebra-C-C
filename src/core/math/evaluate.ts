/** Floating-point evaluation, used for graphing and as a last-resort equivalence check. */
import type { Node } from './parser';

export function evalNumeric(n: Node, env: Record<string, number> = {}): number {
  switch (n.type) {
    case 'num':
      return n.value.toNumber();
    case 'var': {
      const v = env[n.name];
      return v === undefined ? NaN : v;
    }
    case 'neg':
      return -evalNumeric(n.arg, env);
    case 'add':
      return evalNumeric(n.left, env) + evalNumeric(n.right, env);
    case 'sub':
      return evalNumeric(n.left, env) - evalNumeric(n.right, env);
    case 'mul':
      return evalNumeric(n.left, env) * evalNumeric(n.right, env);
    case 'div': {
      const d = evalNumeric(n.right, env);
      return d === 0 ? NaN : evalNumeric(n.left, env) / d;
    }
    case 'pow': {
      const b = evalNumeric(n.base, env);
      const e = evalNumeric(n.exp, env);
      if (b < 0 && !Number.isInteger(e)) return NaN;
      return Math.pow(b, e);
    }
    case 'func': {
      const a = evalNumeric(n.arg, env);
      if (n.name === 'sqrt') return a < 0 ? NaN : Math.sqrt(a);
      if (n.name === 'cbrt') return Math.cbrt(a);
      return Math.abs(a);
    }
  }
}

/** Deterministic pseudo-random sample points (no Math.random, so results are reproducible). */
export function samplePoints(vars: string[], count: number, positiveOnly: boolean): Array<Record<string, number>> {
  const pts: Array<Record<string, number>> = [];
  let seed = 12345;
  const rnd = () => {
    seed = (seed * 1103515245 + 12345) % 2147483648;
    return seed / 2147483648;
  };
  for (let i = 0; i < count; i++) {
    const p: Record<string, number> = {};
    for (const v of vars) {
      const mag = 0.37 + rnd() * 4.1;
      p[v] = positiveOnly ? mag : rnd() < 0.5 ? -mag : mag;
    }
    pts.push(p);
  }
  return pts;
}

function close(a: number, b: number): boolean {
  if (!Number.isFinite(a) || !Number.isFinite(b)) return false;
  const scale = Math.max(1, Math.abs(a), Math.abs(b));
  return Math.abs(a - b) <= 1e-9 * scale;
}

/**
 * Numeric identity test over random points. Returns true/false, or null when too
 * few sample points were in both domains to decide.
 */
export function numericallyEquivalent(a: Node, b: Node, vars: string[], assumePositive = false): boolean | null {
  for (const positiveOnly of assumePositive ? [true] : [false, true]) {
    let valid = 0;
    for (const p of samplePoints(vars, 24, positiveOnly)) {
      const x = evalNumeric(a, p);
      const y = evalNumeric(b, p);
      const xOk = Number.isFinite(x);
      const yOk = Number.isFinite(y);
      if (!xOk && !yOk) continue;
      if (xOk !== yOk) {
        // differing domains: only conclusive on the positive pass
        if (positiveOnly) return false;
        continue;
      }
      if (!close(x, y)) return false;
      valid++;
    }
    if (valid >= 8) return true;
  }
  return null;
}

/** True if the AST takes a square root of an expression containing a variable. */
export function hasVariableRadical(n: Node): boolean {
  switch (n.type) {
    case 'num':
    case 'var':
      return false;
    case 'func': {
      if (n.name !== 'sqrt') return hasVariableRadical(n.arg);
      const hasVar = (x: Node): boolean =>
        x.type === 'var' ? true : x.type === 'num' ? false : x.type === 'neg' || x.type === 'func' ? hasVar(x.arg) : x.type === 'pow' ? hasVar(x.base) || hasVar(x.exp) : hasVar(x.left) || hasVar(x.right);
      return hasVar(n.arg) || hasVariableRadical(n.arg);
    }
    case 'neg':
      return hasVariableRadical(n.arg);
    case 'pow':
      return hasVariableRadical(n.base) || hasVariableRadical(n.exp);
    default:
      return hasVariableRadical(n.left) || hasVariableRadical(n.right);
  }
}
