/**
 * Graph-building answers (A.PAR.4.1, A.FGR.7.6, A.PAR.8.3: "graph ... on coordinate axes with labels
 * and scales"). The student draws on a first-quadrant grid of `cols` × `rows` squares: they type a
 * label for each axis, choose what one grid square is worth on each axis, place points on grid
 * intersections, and for an inequality choose a solid or dashed boundary and the side to shade.
 *
 * The response is a small JSON object (grid positions, not values, so the value of a point always
 * follows from the scale the student chose):
 *   {"p":[[gx,gy],...],"xs":"1","ys":"10","xl":"Time (hours)","yl":"Cost (dollars)","bd":"solid","sh":"above"}
 *
 * Grading is exact (rational arithmetic): every point must lie on the target line or curve, the
 * scales must fit the situation and put its key points on grid lines, the labels must name the right
 * quantities on the right axes, and an inequality needs the right boundary type and shaded side.
 */
import { Rational } from './rational';

export type GraphTarget =
  /** y = m·x + b */
  | { type: 'line'; m: string; b: string }
  /** y = a(x - h)² + k */
  | { type: 'parabola'; a: string; h: string; k: string }
  /** y = a·bˣ (whole-number x only) */
  | { type: 'exponential'; a: string; b: string }
  /** y op m·x + b */
  | { type: 'inequality'; m: string; b: string; op: '<' | '<=' | '>' | '>=' };

export interface GraphAxis {
  /** what one grid square can be worth, offered in a menu */
  options: string[];
  /** the largest value on this axis the situation needs to show */
  need: string;
  /** values on this axis that must land on grid lines (intercepts, the vertex, the starting value) */
  keys: string[];
  /** a good label, shown in the worked solution */
  label: string;
  /**
   * Words that name this axis's quantity: a typed label must mention one of them and must not mention
   * one of the other axis's. Whole words with an "s"/"es" plural, or a stem ending in "*" that matches
   * any word starting with it ("tutor*" for tutor, tutored, tutoring). A unit word (see UNITS) counts
   * only when it is listed here, i.e. when the unit alone names the quantity in this situation
   * ("dollars" for a cost); otherwise unit words are ignored when looking for the quantity.
   */
  words: string[];
  /**
   * The units this quantity may be written in (ids from UNITS); [] for a count with no unit. A label
   * with any other unit is wrong. Absent on specs saved before units were checked: no unit check.
   */
  units?: string[];
}

/** Units a student might write in a label, by id. Longer phrases are matched first. */
export const UNITS: Record<string, { name: string; forms: string[] }> = {
  second: { name: 'seconds', forms: ['seconds', 'second', 'secs', 'sec', 's'] },
  minute: { name: 'minutes', forms: ['minutes', 'minute', 'mins', 'min'] },
  hour: { name: 'hours', forms: ['hours', 'hour', 'hrs', 'hr', 'h'] },
  day: { name: 'days', forms: ['days', 'day'] },
  week: { name: 'weeks', forms: ['weeks', 'week'] },
  year: { name: 'years', forms: ['years', 'year', 'yrs', 'yr'] },
  sqft: { name: 'square feet', forms: ['square feet', 'square foot', 'sq. ft.', 'sq. ft', 'sq ft', 'sqft', 'ft²', 'ft^2', 'ft2'] },
  sqm: { name: 'square meters', forms: ['square meters', 'square meter', 'square metres', 'sq m', 'm²', 'm^2'] },
  foot: { name: 'feet', forms: ['feet', 'foot', 'ft'] },
  inch: { name: 'inches', forms: ['inches', 'inch'] },
  yard: { name: 'yards', forms: ['yards', 'yard', 'yd', 'yds'] },
  mile: { name: 'miles', forms: ['miles', 'mile', 'mi'] },
  meter: { name: 'meters', forms: ['meters', 'meter', 'metres', 'metre', 'cm', 'km'] },
  gallon: { name: 'gallons', forms: ['gallons', 'gallon', 'gal'] },
  liter: { name: 'liters', forms: ['liters', 'liter', 'litres', 'litre'] },
  quart: { name: 'quarts', forms: ['quarts', 'quart', 'qt'] },
  cup: { name: 'cups', forms: ['cups', 'cup'] },
  mg: { name: 'milligrams', forms: ['milligrams', 'milligram', 'mg'] },
  gram: { name: 'grams', forms: ['grams', 'gram', 'kg', 'kilograms', 'kilogram'] },
  pound: { name: 'pounds', forms: ['pounds', 'pound', 'lbs', 'lb'] },
  ounce: { name: 'ounces', forms: ['ounces', 'ounce', 'oz'] },
  dollar: { name: 'dollars', forms: ['dollars', 'dollar', 'usd', '$'] },
  cent: { name: 'cents', forms: ['cents', 'cent', '¢'] },
  percent: { name: 'percent', forms: ['percent', '%'] },
};

const esc = (w: string) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Every unit form in one regex, longest first, so "sq ft" is read before "ft"; group i is form i. */
const UNIT_FORMS: Array<{ id: string; form: string }> = Object.entries(UNITS)
  .flatMap(([id, u]) => u.forms.map((form) => ({ id, form })))
  .sort((a, b) => b.form.length - a.form.length);
const UNIT_RE = new RegExp(
  UNIT_FORMS.map(({ form }) => {
    const body = esc(form).replace(/ /g, '\\s*');
    // a one-letter unit ("s", "h") counts only alone in parentheses, as in "Time (h)": not "h (feet)", not "book(s)"
    if (form.length === 1 && /[a-z]/i.test(form)) return `((?<=(?:^|[^a-z])\\(\\s*)${body}(?=\\s*\\)))`;
    const before = /^[a-z0-9]/i.test(form) ? '(?<![a-z0-9])' : '';
    const after = /[a-z]$/i.test(form) ? '(?![a-z0-9])' : '';
    return `(${before}${body}${after})`;
  }).join('|'),
  'gi',
);

const UNIT_CACHE = new Map<string, { units: string[]; rest: string }>();

/** The units written in a label, and the label with every unit not named by `keep` blanked out. */
export function labelUnits(label: string, keep: string[] = []): { units: string[]; rest: string } {
  const key = `${label}\u0000${keep.join('\u0001')}`;
  const hit = UNIT_CACHE.get(key);
  if (hit) return hit;
  const units: string[] = [];
  const rest = label.toLowerCase().replace(UNIT_RE, (m: string, ...groups: unknown[]) => {
    const i = groups.findIndex((g) => g !== undefined);
    units.push(UNIT_FORMS[i].id);
    return keep.some((w) => wordRegex(w, true).test(m.replace(/\s+/g, ' '))) ? m : ' ';
  });
  const out = { units: [...new Set(units)], rest };
  if (UNIT_CACHE.size > 5000) UNIT_CACHE.clear();
  UNIT_CACHE.set(key, out);
  return out;
}

/** Does a label name the quantity of this axis? Unit words count only when the axis lists them. */
export function namesQuantity(label: string, axis: GraphAxis): boolean {
  return labelMentions(labelUnits(label, axis.words).rest, axis.words);
}

export interface GraphAnswer {
  kind: 'graph';
  target: GraphTarget;
  /** the rule being graphed, as plain text for the worked answer ("y = 15x + 40", "5x + 8y ≥ 40") */
  rule: string;
  cols: number;
  rows: number;
  x: GraphAxis;
  y: GraphAxis;
  /** distinct points the student must place (a parabola also needs its vertex and a point on each side) */
  minPoints: number;
}

/** What the renderer may see: no target, no accepted scales, no label words. */
export interface GraphConfig {
  cols: number;
  rows: number;
  xOptions: string[];
  yOptions: string[];
  curve: GraphTarget['type'];
  minPoints: number;
}

export function graphConfig(spec: GraphAnswer): GraphConfig {
  return { cols: spec.cols, rows: spec.rows, xOptions: [...spec.x.options], yOptions: [...spec.y.options], curve: spec.target.type, minPoints: spec.minPoints };
}

export interface GraphResponse {
  p: Array<[number, number]>;
  xs?: string;
  ys?: string;
  xl?: string;
  yl?: string;
  bd?: 'solid' | 'dashed';
  sh?: 'above' | 'below';
}

export function parseGraphResponse(raw: string): GraphResponse | null {
  let o: unknown;
  try {
    o = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!o || typeof o !== 'object' || Array.isArray(o)) return null;
  const r = o as Record<string, unknown>;
  if (!Array.isArray(r.p)) return null;
  const pts: Array<[number, number]> = [];
  for (const q of r.p) {
    if (!Array.isArray(q) || q.length !== 2 || typeof q[0] !== 'number' || typeof q[1] !== 'number') return null;
    pts.push([q[0], q[1]]);
  }
  const str = (v: unknown) => (typeof v === 'string' ? v : undefined);
  return {
    p: pts,
    xs: str(r.xs),
    ys: str(r.ys),
    xl: str(r.xl),
    yl: str(r.yl),
    bd: r.bd === 'solid' || r.bd === 'dashed' ? r.bd : undefined,
    sh: r.sh === 'above' || r.sh === 'below' ? r.sh : undefined,
  };
}

/** The exact y-value of the target at x, or null where it has no rational value (bˣ at a fractional x). */
export function targetY(t: GraphTarget, x: Rational): Rational | null {
  switch (t.type) {
    case 'line':
    case 'inequality':
      return Rational.parse(t.m).mul(x).add(Rational.parse(t.b));
    case 'parabola': {
      const d = x.sub(Rational.parse(t.h));
      return Rational.parse(t.a).mul(d).mul(d).add(Rational.parse(t.k));
    }
    case 'exponential': {
      if (!x.isInteger() || x.isNegative()) return null;
      return Rational.parse(t.a).mul(Rational.parse(t.b).pow(x.toInt()));
    }
  }
}

export type ScaleIssue = 'too-small' | 'too-large' | 'between-lines';

/**
 * Does a scale suit this axis? It must show everything the situation needs, the graph must use at
 * least a quarter of the axis (not be squeezed into a corner), and the key values must land on grid lines.
 */
export function scaleIssue(axis: GraphAxis, squares: number, scale: Rational): ScaleIssue | null {
  if (scale.sign() <= 0) return 'too-small';
  const span = scale.mul(squares);
  const need = Rational.parse(axis.need);
  if (need.gt(span)) return 'too-small';
  if (need.mul(4).lt(span)) return 'too-large';
  for (const k of axis.keys) if (!Rational.parse(k).div(scale).isInteger()) return 'between-lines';
  return null;
}

export function acceptedScales(axis: GraphAxis, squares: number): string[] {
  return axis.options.filter((o) => scaleIssue(axis, squares, Rational.parse(o)) === null);
}

/**
 * Does a typed label mention one of the words (case-insensitive)? A word matches as a whole word with
 * an "s"/"es" plural; a word ending in "*" is a stem and matches any word that starts with it.
 */
export function labelMentions(label: string, words: string[]): boolean {
  const s = label.toLowerCase();
  return words.some((w) => wordRegex(w).test(s));
}

const WORD_RES = new Map<string, RegExp>();
/** A word as a regex; `whole` matches only text that is exactly that word (a unit kept as a quantity word). */
function wordRegex(w: string, whole = false): RegExp {
  const k = whole ? `^${w}` : w;
  let re = WORD_RES.get(k);
  if (!re) {
    const stem = w.endsWith('*');
    const body = esc((stem ? w.slice(0, -1) : w).toLowerCase()).replace(/ /g, '\\s*');
    const start = /^[a-z0-9]/.test(body) ? '(?<![a-z])' : '';
    re = whole ? new RegExp(`^${body}${stem ? '[a-z]*' : '(?:s|es)?'}$`) : new RegExp(`${start}${body}${stem ? '' : '(?:s|es)?(?![a-z])'}`);
    WORD_RES.set(k, re);
  }
  return re;
}

const fmt = (r: Rational) => (r.isInteger() || r.isTerminatingDecimal() ? r.toDecimalString(6) : r.toString());

/** A label written with a unit this quantity is not measured in (none is fine). */
function unitIssue(label: string, axis: GraphAxis, name: string): string | null {
  if (!axis.units) return null;
  const wrong = labelUnits(label).units.filter((u) => !axis.units!.includes(u));
  if (!wrong.length) return null;
  const said = UNITS[wrong[0]].name;
  if (!axis.units.length) return `The quantity on the ${name} axis is a count, so it has no unit. Check the unit in your label: ${said} does not fit here.`;
  const want = axis.units.map((u) => UNITS[u].name);
  const list = [...new Set(want)].join(' or ');
  return `Check the unit in the ${name} axis label: in this situation that quantity is measured in ${list}, not ${said}.`;
}

export interface GraphCheck {
  status: 'correct' | 'incorrect' | 'invalid';
  message?: string;
  tag?: 'axis-labels' | 'graph-scale' | 'graph-reading' | 'boundary-line' | 'shading';
}

/** Grade a drawn graph exactly. `quiet` (misconception matching) skips building messages. */
export function checkGraph(spec: GraphAnswer, raw: string): GraphCheck {
  const r = parseGraphResponse(raw);
  if (!r) return { status: 'invalid', message: 'Draw your graph on the grid first.' };
  if (!r.xs || !r.ys || !spec.x.options.includes(r.xs) || !spec.y.options.includes(r.ys)) return { status: 'invalid', message: 'Choose a scale for each axis: what one grid square is worth.' };
  if (!r.xl?.trim() || !r.yl?.trim()) return { status: 'invalid', message: 'Type a label for each axis: the quantity and its unit.' };
  const ineq = spec.target.type === 'inequality';
  if (ineq && (!r.bd || !r.sh)) return { status: 'invalid', message: 'Choose a solid or dashed boundary line, and the side to shade.' };
  const seen = new Set<string>();
  const pts: Array<[number, number]> = [];
  for (const [gx, gy] of r.p) {
    if (!Number.isInteger(gx) || !Number.isInteger(gy) || gx < 0 || gy < 0 || gx > spec.cols || gy > spec.rows) return { status: 'invalid', message: 'Each point must sit on a grid intersection.' };
    const key = `${gx},${gy}`;
    if (seen.has(key)) continue;
    seen.add(key);
    pts.push([gx, gy]);
  }
  if (pts.length < spec.minPoints) {
    const need =
      spec.target.type === 'parabola'
        ? `Place at least ${spec.minPoints} points: the vertex and at least one point on each side of it.`
        : spec.target.type === 'inequality'
          ? `Place at least ${spec.minPoints} points on the boundary line.`
          : `Place at least ${spec.minPoints} points on the grid.`;
    return { status: 'invalid', message: need };
  }

  // labels: the input quantity across, the output quantity up. Each label names its own quantity and
  // not the other axis's (a label naming both quantities fits neither axis); unit words alone never
  // name a quantity; a unit, when written, must be one this quantity is measured in.
  const xl = r.xl!;
  const yl = r.yl!;
  const xOwn = namesQuantity(xl, spec.x);
  const yOwn = namesQuantity(yl, spec.y);
  const xOther = namesQuantity(xl, spec.y);
  const yOther = namesQuantity(yl, spec.x);
  if (xOther && !xOwn && yOther && !yOwn) return { status: 'incorrect', tag: 'axis-labels', message: 'Your labels are on the wrong axes. The quantity you choose or count (the input) goes across the bottom; the quantity that depends on it goes up the side.' };
  for (const [own, other, name] of [
    [xOwn, xOther, 'horizontal'],
    [yOwn, yOther, 'vertical'],
  ] as const)
    if (own && other) return { status: 'incorrect', tag: 'axis-labels', message: `The label on the ${name} axis names both quantities. Each label should name only the quantity on its own axis.` };
  for (const [label, axis, name] of [
    [xl, spec.x, 'horizontal'],
    [yl, spec.y, 'vertical'],
  ] as const) {
    const msg = unitIssue(label, axis, name);
    if (msg) return { status: 'incorrect', tag: 'axis-labels', message: msg };
  }
  if (!xOwn || !yOwn || xOther || yOther) {
    return {
      status: 'incorrect',
      tag: 'axis-labels',
      message: !xOwn || xOther ? 'The label on the horizontal axis should name the input quantity in this situation, with its unit.' : 'The label on the vertical axis should name the output quantity in this situation, with its unit.',
    };
  }

  // scales
  const xs = Rational.parse(r.xs);
  const ys = Rational.parse(r.ys);
  for (const [axis, sc, squares, name] of [
    [spec.x, xs, spec.cols, 'horizontal'],
    [spec.y, ys, spec.rows, 'vertical'],
  ] as const) {
    const issue = scaleIssue(axis, squares, sc);
    if (!issue) continue;
    const msg =
      issue === 'too-small'
        ? `With ${fmt(sc)} per square, the ${name} axis only reaches ${fmt(sc.mul(squares))}, so part of the graph is cut off. Choose a larger scale.`
        : issue === 'too-large'
          ? `With ${fmt(sc)} per square on the ${name} axis, the graph is squeezed into a small part of the grid. Choose a smaller scale so it spreads out.`
          : `With ${fmt(sc)} per square on the ${name} axis, important points of this graph fall between grid lines. Choose a scale that puts them on grid lines.`;
    return { status: 'incorrect', tag: 'graph-scale', message: msg };
  }

  // points: every one exactly on the line or curve
  const t = spec.target;
  const values = pts.map(([gx, gy]) => [xs.mul(gx), ys.mul(gy)] as const);
  for (const [x, y] of values) {
    const want = targetY(t, x);
    if (want === null || !want.eq(y)) {
      const what = t.type === 'inequality' ? 'boundary line' : t.type === 'line' ? 'line' : 'graph';
      return { status: 'incorrect', tag: 'graph-reading', message: `The point (${fmt(x)}, ${fmt(y)}) is not on the ${what}. Work out the output at ${fmt(x)} again, then place the point there.` };
    }
  }
  if (t.type === 'parabola') {
    const h = Rational.parse(t.h);
    if (!values.some(([x]) => x.eq(h))) return { status: 'incorrect', tag: 'graph-reading', message: 'Your points are on the parabola, but the vertex (its highest or lowest point) is not one of them. Plot the vertex too.' };
    if (!values.some(([x]) => x.lt(h)) || !values.some(([x]) => x.gt(h))) return { status: 'incorrect', tag: 'graph-reading', message: 'Plot at least one point on each side of the vertex, so the shape of the parabola shows.' };
  }
  if (t.type === 'exponential' && !values.some(([x]) => x.isZero()))
    return { status: 'incorrect', tag: 'graph-reading', message: 'Your points are on the curve. Plot the starting value too: the point where the input is 0.' };

  if (t.type === 'inequality') {
    const strict = t.op === '<' || t.op === '>';
    if ((r.bd === 'dashed') !== strict) return { status: 'incorrect', tag: 'boundary-line', message: 'The boundary is in the right place. Look at the symbol again: are the points on the boundary line solutions?' };
    const above = t.op === '>' || t.op === '>=';
    if ((r.sh === 'above') !== above) return { status: 'incorrect', tag: 'shading', message: 'The boundary line is right. Test a point that is not on the line to decide which side holds the solutions.' };
  }
  return { status: 'correct' };
}

/**
 * A correct drawing of a spec (the first accepted scales and the first grid points on the curve).
 * Throws when the spec cannot be drawn on its grid with an accepted scale.
 */
export function canonicalGraphInput(spec: GraphAnswer, scales?: { xs: string; ys: string }): string {
  const xsText = scales?.xs ?? acceptedScales(spec.x, spec.cols)[0];
  const ysText = scales?.ys ?? acceptedScales(spec.y, spec.rows)[0];
  if (xsText === undefined || ysText === undefined) throw new Error('no scale fits this graph');
  const xs = Rational.parse(xsText);
  const ys = Rational.parse(ysText);
  const t = spec.target;
  const cands: Array<[number, number, Rational]> = [];
  for (let gx = 0; gx <= spec.cols; gx++) {
    const x = xs.mul(gx);
    const y = targetY(t, x);
    if (y === null || y.isNegative()) continue;
    const gy = y.div(ys);
    if (!gy.isInteger() || gy.toInt() > spec.rows) continue;
    cands.push([gx, gy.toInt(), x]);
  }
  let chosen: Array<[number, number, Rational]>;
  if (t.type === 'parabola') {
    const h = Rational.parse(t.h);
    const v = cands.find((c) => c[2].eq(h));
    const left = cands.filter((c) => c[2].lt(h)).pop();
    const right = cands.find((c) => c[2].gt(h));
    if (!v || !left || !right) throw new Error('the vertex and a point on each side are not all on grid intersections');
    chosen = [left, v, right];
  } else if (t.type === 'exponential') {
    if (!cands.length || !cands[0][2].isZero()) throw new Error('the starting value is not on a grid intersection');
    chosen = cands.slice(0, Math.max(spec.minPoints, 2));
  } else chosen = cands.slice(0, Math.max(spec.minPoints, 2));
  if (chosen.length < spec.minPoints) throw new Error('not enough grid points on the graph');
  const resp: GraphResponse = { p: chosen.map((c) => [c[0], c[1]]), xs: xsText, ys: ysText, xl: spec.x.label, yl: spec.y.label };
  if (t.type === 'inequality') {
    resp.bd = t.op === '<' || t.op === '>' ? 'dashed' : 'solid';
    resp.sh = t.op === '>' || t.op === '>=' ? 'above' : 'below';
  }
  return JSON.stringify(resp);
}

/**
 * Problems with a graph question as posed: some scale must be accepted on each axis, and with EVERY
 * accepted pair of scales the graph must be drawable on grid intersections (so a student who picks any
 * accepted scale can finish) and its drawing graded correct.
 */
export function graphSpecErrors(spec: GraphAnswer): string[] {
  const errs: string[] = [];
  const xa = acceptedScales(spec.x, spec.cols);
  const ya = acceptedScales(spec.y, spec.rows);
  if (!xa.length) errs.push('no horizontal scale fits');
  if (!ya.length) errs.push('no vertical scale fits');
  if (namesQuantity(spec.y.label, spec.x) || namesQuantity(spec.x.label, spec.y)) errs.push('axis label words overlap');
  if (!namesQuantity(spec.x.label, spec.x) || !namesQuantity(spec.y.label, spec.y)) errs.push('a label does not name its own quantity');
  for (const [a, b] of [
    [spec.x, spec.y],
    [spec.y, spec.x],
  ] as const) {
    // a unit word may name a quantity only when the other axis is not measured in that unit
    const named = labelUnits(a.words.map((w) => w.replace(/\*$/, '')).join(' ; ')).units;
    if (b.units && named.some((u) => b.units!.includes(u))) errs.push('a quantity word is a unit of the other axis');
    if (a.units) for (const u of labelUnits(a.label).units) if (!a.units.includes(u)) errs.push(`the label "${a.label}" has a unit that is not accepted`);
  }
  for (const xs of xa)
    for (const ys of ya) {
      try {
        const r = checkGraph(spec, canonicalGraphInput(spec, { xs, ys }));
        if (r.status !== 'correct') errs.push(`scales ${xs}, ${ys}: drawing graded ${r.status}`);
      } catch (e) {
        errs.push(`scales ${xs}, ${ys}: ${(e as Error).message}`);
      }
    }
  return errs;
}

/**
 * A misconception's answer for a graph is a JSON object of fields that replace the real answer's:
 * {"target":{"m":"40","b":"15"}} (slope and intercept swapped), {"target":{"op":">"}} (dashed
 * instead of solid), {"swapLabels":true}. The student's drawing matches the misconception when it is a
 * correct drawing of the changed answer.
 */
export function graphWithOverride(spec: GraphAnswer, answer: string): GraphAnswer {
  const o = JSON.parse(answer) as { target?: Partial<GraphTarget>; swapLabels?: boolean };
  if (!o || typeof o !== 'object') throw new Error('graph misconception is not an object');
  let out: GraphAnswer = { ...spec, target: { ...spec.target, ...(o.target ?? {}) } as GraphTarget };
  if (o.swapLabels) out = { ...out, x: { ...out.x, label: spec.y.label, words: spec.y.words, units: spec.y.units }, y: { ...out.y, label: spec.x.label, words: spec.x.words, units: spec.x.units } };
  return out;
}

/** Keep the misconceptions a student could actually draw on this grid (and that differ from the key). */
export function drawableGraphMisconceptions<M extends { answer: string }>(spec: GraphAnswer, list: M[]): M[] {
  return list.filter((m) => {
    try {
      const alt = graphWithOverride(spec, m.answer);
      return checkGraph(spec, canonicalGraphInput(alt)).status === 'incorrect';
    } catch {
      return false;
    }
  });
}

/** A readable description of a drawn graph, for results pages. */
export function describeGraphResponse(raw: string): string | null {
  const r = parseGraphResponse(raw);
  if (!r) return null;
  let xs: Rational | null = null;
  let ys: Rational | null = null;
  try {
    xs = r.xs ? Rational.parse(r.xs) : null;
    ys = r.ys ? Rational.parse(r.ys) : null;
  } catch {
    xs = ys = null;
  }
  const pts = r.p.map(([gx, gy]) => (xs && ys ? `(${fmt(xs.mul(gx))}, ${fmt(ys.mul(gy))})` : `(square ${gx}, square ${gy})`));
  const parts = [`points ${pts.length ? pts.join(', ') : '(none)'}`];
  parts.push(`horizontal axis "${r.xl ?? ''}"${r.xs ? `, ${r.xs} per square` : ''}`);
  parts.push(`vertical axis "${r.yl ?? ''}"${r.ys ? `, ${r.ys} per square` : ''}`);
  if (r.bd) parts.push(`${r.bd} boundary`);
  if (r.sh) parts.push(`shaded ${r.sh}`);
  return parts.join('; ');
}

/** The answer in words, for the worked solution. */
export function graphAnswerText(spec: GraphAnswer): string {
  const t = spec.target;
  const xs = acceptedScales(spec.x, spec.cols);
  const ys = acceptedScales(spec.y, spec.rows);
  const extra = t.type === 'inequality' ? `, ${t.op === '<' || t.op === '>' ? 'dashed' : 'solid'} boundary line, shaded ${t.op === '>' || t.op === '>=' ? 'above' : 'below'}` : '';
  return `the graph of ${spec.rule}${extra}; horizontal axis "${spec.x.label}" (${xs.join(' or ')} per square), vertical axis "${spec.y.label}" (${ys.join(' or ')} per square)`;
}
