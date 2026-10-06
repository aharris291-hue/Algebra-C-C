/**
 * Parser for student-typed math. Accepts the ways a 9th grader is likely to type:
 *   2x+3, 2*x + 3, 3(x-1)^2, (x+2)(x-5), sqrt(50), √50, 3√2, cbrt(16), ∛16,
 *   1/2x (read left to right as (1/2)x), -x^2 (read as -(x^2)), 4.5, 2/3
 * and unicode variants (−, ×, ·, ÷, ², ³, ≤, ≥).
 *
 * The parser produces an AST. Interpretation (polynomial, exact radical, numeric)
 * lives in other modules so that each can be verified independently.
 */
import { Rational } from './rational';

export type Node =
  | { type: 'num'; value: Rational; text: string }
  | { type: 'var'; name: string }
  | { type: 'neg'; arg: Node }
  | { type: 'add'; left: Node; right: Node }
  | { type: 'sub'; left: Node; right: Node }
  | { type: 'mul'; left: Node; right: Node; implicit: boolean }
  | { type: 'div'; left: Node; right: Node }
  | { type: 'pow'; base: Node; exp: Node }
  | { type: 'func'; name: 'sqrt' | 'cbrt' | 'abs'; arg: Node; coefRoot?: boolean };

export class MathSyntaxError extends Error {
  /** Student-friendly explanation. */
  readonly friendly: string;
  constructor(friendly: string) {
    super(friendly);
    this.friendly = friendly;
  }
}

type Tok =
  | { k: 'num'; v: string }
  | { k: 'id'; v: string }
  | { k: 'op'; v: string }
  | { k: 'lp' }
  | { k: 'rp' }
  | { k: 'bar' }
  | { k: 'root'; v: 'sqrt' | 'cbrt' }
  | { k: 'end' };

const FUNC_NAMES = new Set(['sqrt', 'cbrt', 'abs']);

/** Normalise unicode and common typing variants before tokenising. */
export function normalizeInput(s: string): string {
  return s
    .replace(/[−‒–—﹣－]/g, '-')
    .replace(/[×·∙⋅]/g, '*')
    .replace(/÷/g, '/')
    .replace(/²/g, '^2')
    .replace(/³/g, '^3')
    .replace(/≤/g, '<=')
    .replace(/≥/g, '>=')
    .replace(/≠/g, '!=')
    .replace(/[\[{]/g, (c) => c) // brackets kept for interval/sets; expression parser rejects them
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenize(src: string): Tok[] {
  const s = normalizeInput(src);
  const out: Tok[] = [];
  let i = 0;
  while (i < s.length) {
    const c = s[i];
    if (c === ' ') {
      i++;
      continue;
    }
    if (/[0-9.]/.test(c)) {
      let j = i;
      while (j < s.length && /[0-9.]/.test(s[j])) j++;
      const v = s.slice(i, j);
      if ((v.match(/\./g) || []).length > 1 || v === '.') {
        throw new MathSyntaxError(`"${v}" isn't a number I can read. Check the decimal point.`);
      }
      out.push({ k: 'num', v });
      i = j;
      continue;
    }
    if (/[a-zA-Z]/.test(c)) {
      let j = i;
      while (j < s.length && /[a-zA-Z]/.test(s[j])) j++;
      const word = s.slice(i, j);
      const lower = word.toLowerCase();
      // A run of letters like "xy" means x*y: each letter is its own variable. Function names
      // may be glued to variables, as in "3xsqrt(2x)", so they are split out wherever they occur.
      let k = 0;
      while (k < lower.length) {
        const fn = ['sqrt', 'cbrt', 'abs', 'root'].find((f) => lower.startsWith(f, k));
        if (fn) {
          out.push({ k: 'id', v: fn === 'root' ? 'sqrt' : fn });
          k += fn.length;
        } else {
          out.push({ k: 'id', v: word[k] });
          k++;
        }
      }
      i = j;
      continue;
    }
    if (c === '√') {
      out.push({ k: 'root', v: 'sqrt' });
      i++;
      continue;
    }
    if (c === '∛') {
      out.push({ k: 'root', v: 'cbrt' });
      i++;
      continue;
    }
    if (c === '(') {
      out.push({ k: 'lp' });
      i++;
      continue;
    }
    if (c === ')') {
      out.push({ k: 'rp' });
      i++;
      continue;
    }
    if (c === '|') {
      out.push({ k: 'bar' });
      i++;
      continue;
    }
    if ('+-*/^'.includes(c)) {
      if (c === '*' && s[i + 1] === '*') {
        out.push({ k: 'op', v: '^' });
        i += 2;
        continue;
      }
      out.push({ k: 'op', v: c });
      i++;
      continue;
    }
    if (c === '[' || c === ']' || c === '{' || c === '}') {
      throw new MathSyntaxError('Use round parentheses ( ) for grouping in an expression.');
    }
    if (c === '=' || c === '<' || c === '>') {
      throw new MathSyntaxError('This answer should be an expression, not an equation or inequality.');
    }
    if (c === ',') {
      throw new MathSyntaxError('This answer should be a single expression. Remove the comma.');
    }
    throw new MathSyntaxError(`I don't recognize the symbol "${c}".`);
  }
  out.push({ k: 'end' });
  return out;
}

class Parser {
  private pos = 0;
  private barDepth = 0;
  constructor(private toks: Tok[]) {}

  private peek(): Tok {
    return this.toks[this.pos];
  }
  private next(): Tok {
    return this.toks[this.pos++];
  }

  parse(): Node {
    if (this.peek().k === 'end') throw new MathSyntaxError('The answer is empty.');
    const n = this.expr();
    const t = this.peek();
    if (t.k !== 'end') {
      if (t.k === 'rp') throw new MathSyntaxError('There is an extra closing parenthesis ")".');
      throw new MathSyntaxError('Part of the answer could not be read. Check for a missing operation sign.');
    }
    return n;
  }

  // expr := term (('+'|'-') term)*
  private expr(): Node {
    let left = this.unary();
    for (;;) {
      const t = this.peek();
      if (t.k === 'op' && (t.v === '+' || t.v === '-')) {
        this.next();
        const right = this.unary();
        left = t.v === '+' ? { type: 'add', left, right } : { type: 'sub', left, right };
      } else return left;
    }
  }

  // unary := ('-'|'+') unary | term
  private unary(): Node {
    const t = this.peek();
    if (t.k === 'op' && (t.v === '-' || t.v === '+')) {
      this.next();
      const arg = this.unary();
      return t.v === '-' ? { type: 'neg', arg } : arg;
    }
    return this.term();
  }

  // term := power ( ('*'|'/') power | implicit power )*
  private term(): Node {
    let left = this.power();
    for (;;) {
      const t = this.peek();
      if (t.k === 'op' && (t.v === '*' || t.v === '/')) {
        this.next();
        const nt = this.peek();
        if (nt.k === 'op' && (nt.v === '-' || nt.v === '+')) {
          // allow 3*-2 and 6/-3
          this.next();
          const right = this.power();
          const r: Node = nt.v === '-' ? { type: 'neg', arg: right } : right;
          left = t.v === '*' ? { type: 'mul', left, right: r, implicit: false } : { type: 'div', left, right: r };
        } else {
          const right = this.power();
          left = t.v === '*' ? { type: 'mul', left, right, implicit: false } : { type: 'div', left, right };
        }
      } else if (this.startsFactor(t)) {
        if (t.k === 'num' && (left.type === 'num' || (left.type === 'neg' && left.arg.type === 'num'))) {
          throw new MathSyntaxError('Two numbers are next to each other. Did you forget an operation sign?');
        }
        if (left.type === 'var' && t.k === 'num') {
          throw new MathSyntaxError(`Write exponents with ^. For example, type ${left.name}^2 instead of ${left.name}2.`);
        }
        if (t.k === 'bar' && this.barDepth > 0) return left; // closing bar
        const right = this.power();
        left = { type: 'mul', left, right, implicit: true };
      } else return left;
    }
  }

  private startsFactor(t: Tok): boolean {
    return t.k === 'num' || t.k === 'id' || t.k === 'lp' || t.k === 'root' || t.k === 'bar';
  }

  // power := primary ('^' unary)?   (right associative)
  private power(): Node {
    const base = this.primary();
    const t = this.peek();
    if (t.k === 'op' && t.v === '^') {
      this.next();
      const nt = this.peek();
      let exp: Node;
      if (nt.k === 'op' && (nt.v === '-' || nt.v === '+')) {
        this.next();
        const e = this.power();
        exp = nt.v === '-' ? { type: 'neg', arg: e } : e;
      } else {
        exp = this.power();
      }
      return { type: 'pow', base, exp };
    }
    return base;
  }

  private primary(): Node {
    const t = this.next();
    switch (t.k) {
      case 'num': {
        let value: Rational;
        try {
          value = Rational.parseDecimal(t.v);
        } catch {
          throw new MathSyntaxError(`"${t.v}" isn't a number I can read.`);
        }
        return { type: 'num', value, text: t.v };
      }
      case 'id': {
        if (t.v === 'sqrt' || t.v === 'cbrt' || t.v === 'abs') {
          const nt = this.peek();
          if (nt.k !== 'lp') {
            if (t.v === 'abs') throw new MathSyntaxError('Write abs(...) with parentheses.');
            // sqrt 5 or sqrt5
            const arg = this.power();
            return { type: 'func', name: t.v, arg };
          }
          this.next();
          if (this.peek().k === 'rp') throw new MathSyntaxError(`Put something inside ${t.v}( ).`);
          const arg = this.expr();
          this.expect('rp', 'A parenthesis was opened but never closed.');
          return { type: 'func', name: t.v, arg };
        }
        return { type: 'var', name: t.v };
      }
      case 'root': {
        // √x, √(x+1), √50, 3√2 handled by implicit multiplication. Radicand binds tightly:
        // √2x means (√2)x, the way textbooks print it.
        const nt = this.peek();
        if (nt.k === 'lp') {
          this.next();
          const arg = this.expr();
          this.expect('rp', 'A parenthesis was opened but never closed.');
          return { type: 'func', name: t.v, arg };
        }
        if (nt.k === 'num' || nt.k === 'id') {
          const a = this.next() as { k: 'num' | 'id'; v: string };
          const arg: Node =
            a.k === 'num' ? { type: 'num', value: Rational.parseDecimal(a.v), text: a.v } : { type: 'var', name: a.v };
          return { type: 'func', name: t.v, arg };
        }
        throw new MathSyntaxError('Put a number or parentheses right after the root symbol.');
      }
      case 'lp': {
        if (this.peek().k === 'rp') throw new MathSyntaxError('There are empty parentheses ( ).');
        const e = this.expr();
        this.expect('rp', 'A parenthesis was opened but never closed.');
        return e;
      }
      case 'bar': {
        this.barDepth++;
        const e = this.expr();
        this.barDepth--;
        this.expect('bar', 'An absolute value bar | was opened but never closed.');
        return { type: 'func', name: 'abs', arg: e };
      }
      case 'rp':
        throw new MathSyntaxError('There is a closing parenthesis ")" without a matching "(".');
      case 'op':
        if (t.v === '^') throw new MathSyntaxError('An exponent ^ needs a base in front of it.');
        throw new MathSyntaxError(`Two operation signs are next to each other near "${t.v}".`);
      case 'end':
        throw new MathSyntaxError('The answer seems to end too early. Is something missing after an operation sign?');
    }
    throw new MathSyntaxError('Something in the answer could not be read.');
  }

  private expect(k: Tok['k'], msg: string): void {
    const t = this.next();
    if (t.k !== k) throw new MathSyntaxError(msg);
  }
}

export function parseExpression(src: string): Node {
  return new Parser(tokenize(src)).parse();
}

/** Variables used in an AST, sorted. */
export function variablesOf(n: Node, acc: Set<string> = new Set()): Set<string> {
  switch (n.type) {
    case 'num':
      break;
    case 'var':
      acc.add(n.name);
      break;
    case 'neg':
    case 'func':
      variablesOf(n.arg, acc);
      break;
    case 'pow':
      variablesOf(n.base, acc);
      variablesOf(n.exp, acc);
      break;
    default:
      variablesOf(n.left, acc);
      variablesOf(n.right, acc);
  }
  return acc;
}

/** Count nodes of each type: used by form checks ("is it a single number?"). */
export function isPlainNumberLiteral(n: Node): boolean {
  if (n.type === 'num') return true;
  if (n.type === 'neg' && n.arg.type === 'num') return true;
  return false;
}

/** a/b or -a/b with integer literals. */
export function isSimpleFraction(n: Node): boolean {
  const core = n.type === 'neg' ? n.arg : n;
  if (core.type !== 'div') return false;
  const okInt = (x: Node) => x.type === 'num' && x.value.isInteger() && !x.text.includes('.');
  const okSignedInt = (x: Node) => okInt(x) || (x.type === 'neg' && okInt(x.arg));
  return okSignedInt(core.left) && okSignedInt(core.right);
}
