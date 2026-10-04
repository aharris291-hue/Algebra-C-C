/**
 * Shared real-world linear situations for Unit 1 generators.
 * Every context is y = m·x + b with exact rational m and b, so answers stay exact.
 */
import type { Rng } from '../../core/curriculum/types';
import { Rational } from '../../core/math/rational';
import { linearTexDec, decTex } from '../../core/math/format';
import { Q, money } from './util';

export interface LinearContext {
  key: string;
  /** function name and input variable */
  f: string;
  v: string;
  m: Rational;
  b: Rational;
  /** largest sensible whole-number input (inputs are 1..maxInput) */
  maxInput: number;
  /** neutral one-sentence description that does not reveal any numbers */
  topic: string;
  /** situation sentence without the rule */
  setup: string;
  /** describes what f(v) gives, e.g. "the total cost in dollars after $m$ months" */
  outputDesc: string;
  /** "4 months" */
  inWord(a: Rational): string;
  /** "\$60" or "70%" */
  outWord(y: Rational): string;
  /** units of the output for number answers ('dollars', '%', 'feet') */
  outUnit: string;
  /** units of the input, plural ('months') and singular ('month') */
  inUnits: string;
  inUnit: string;
  /** units of the rate, e.g. "dollars per month" */
  rateUnit: string;
  /** what the starting value b means */
  startMeaning: string;
  /** what the rate m means, in words */
  rateMeaning: string;
  isMoney: boolean;
  /** a sentence stating f(a) = y in context; always mentions the input before the output */
  says(aWord: string, yWord: string): string;
}

/** Rule as TeX with decimals, e.g. "25m + 40". */
export function ctxRule(c: LinearContext): string {
  return linearTexDec(c.m, c.b, c.v);
}

/** Full story with the rule: setup + "So f(v) = rule." */
export function ctxStory(c: LinearContext): string {
  return `${c.setup} The function $${c.f}(${c.v}) = ${ctxRule(c)}$ gives ${c.outputDesc}.`;
}

const dollars = (y: Rational) => money(y);
const plain = (unit: string) => (y: Rational) => `${decTex(y)} ${unit}`;

type Builder = (rng: Rng) => LinearContext;

const BUILDERS: Record<string, Builder> = {
  gym(rng) {
    const fee = Q(rng.pick([20, 25, 30, 40, 50]));
    const monthly = Q(rng.pick([15, 18, 20, 25, 30]));
    return {
      key: 'gym', topic: 'The total cost of a gym membership depends on how many months you belong.', says: (a, y) => `The total cost for ${a} is ${y}.`, f: 'C', v: 'm', m: monthly, b: fee, maxInput: 24,
      setup: `A gym charges a ${money(fee)} sign-up fee plus ${money(monthly)} per month.`,
      outputDesc: 'the total cost, in dollars, after $m$ months',
      inWord: (a) => `${a.toTex()} month${a.eq(1) ? '' : 's'}`, outWord: dollars, outUnit: 'dollars', inUnits: 'months', inUnit: 'month',
      rateUnit: 'dollars per month', startMeaning: `the ${money(fee)} sign-up fee (the cost at 0 months)`, rateMeaning: `the cost goes up ${money(monthly)} each month`, isMoney: true,
    };
  },
  savings(rng) {
    const start = Q(rng.pick([40, 60, 75, 120, 150]));
    const weekly = Q(rng.pick([15, 20, 25, 30, 35]));
    return {
      key: 'savings', topic: 'Riley saves the same amount from a part-time job every week.', says: (a, y) => `After ${a}, Riley has ${y} saved.`, f: 'S', v: 'w', m: weekly, b: start, maxInput: 30,
      setup: `Riley has ${money(start)} saved and adds ${money(weekly)} from a part-time job every week.`,
      outputDesc: 'the savings, in dollars, after $w$ weeks',
      inWord: (a) => `${a.toTex()} week${a.eq(1) ? '' : 's'}`, outWord: dollars, outUnit: 'dollars', inUnits: 'weeks', inUnit: 'week',
      rateUnit: 'dollars per week', startMeaning: `the ${money(start)} Riley had saved at the start`, rateMeaning: `the savings grow by ${money(weekly)} each week`, isMoney: true,
    };
  },
  battery(rng) {
    const drain = Q(rng.pick([5, 8, 10, 12, 20]));
    return {
      key: 'battery', topic: "A phone's battery drains at a steady rate while it streams video.", says: (a, y) => `After ${a} of streaming, the battery is at ${y}.`, f: 'B', v: 'h', m: drain.neg(), b: Q(100), maxInput: Math.floor(100 / drain.toNumber()) - 1,
      setup: `A phone starts at 100% battery. While streaming video it loses ${drain.toTex()}% of its charge each hour.`,
      outputDesc: 'the battery level, in percent, after $h$ hours',
      inWord: (a) => `${a.toTex()} hour${a.eq(1) ? '' : 's'}`, outWord: (y) => `${decTex(y)}%`, outUnit: '%', inUnits: 'hours', inUnit: 'hour',
      rateUnit: 'percent per hour', startMeaning: 'the phone starts fully charged at 100%', rateMeaning: `the battery drops ${drain.toTex()} percentage points each hour`, isMoney: false,
    };
  },
  tank(rng) {
    const start = Q(rng.pick([300, 400, 480, 600]));
    const rate = Q(rng.pick([10, 12, 15, 20]));
    return {
      key: 'tank', topic: 'A water tank drains at a steady rate.', says: (a, y) => `After ${a}, ${y} of water are left in the tank.`, f: 'W', v: 't', m: rate.neg(), b: start, maxInput: Math.floor(start.toNumber() / rate.toNumber()) - 1,
      setup: `A water tank holds ${start.toTex()} gallons. It drains at a steady ${rate.toTex()} gallons per minute.`,
      outputDesc: 'the gallons of water left after $t$ minutes',
      inWord: (a) => `${a.toTex()} minute${a.eq(1) ? '' : 's'}`, outWord: plain('gallons'), outUnit: 'gallons', inUnits: 'minutes', inUnit: 'minute',
      rateUnit: 'gallons per minute', startMeaning: `the tank starts with ${start.toTex()} gallons`, rateMeaning: `the tank loses ${rate.toTex()} gallons each minute`, isMoney: false,
    };
  },
  hike(rng) {
    const start = Q(rng.pick([800, 1200, 1500, 2000]));
    const climb = Q(rng.pick([250, 300, 400, 450]));
    return {
      key: 'hike', topic: 'A hiker climbs a mountain trail at a steady rate.', says: (a, y) => `After ${a} of hiking, the hiker is at an elevation of ${y}.`, f: 'E', v: 't', m: climb, b: start, maxInput: 8,
      setup: `A hiker starts at a trailhead ${start.toTex()} feet above sea level and climbs ${climb.toTex()} feet each hour.`,
      outputDesc: 'the elevation, in feet, after $t$ hours',
      inWord: (a) => `${a.toTex()} hour${a.eq(1) ? '' : 's'}`, outWord: plain('feet'), outUnit: 'feet', inUnits: 'hours', inUnit: 'hour',
      rateUnit: 'feet per hour', startMeaning: `the trailhead is ${start.toTex()} feet above sea level`, rateMeaning: `the hiker gains ${climb.toTex()} feet of elevation each hour`, isMoney: false,
    };
  },
  rideshare(rng) {
    const base = Q(rng.pick(['2.5', '3', '3.5', '4']));
    const perMile = Q(rng.pick(['1.5', '2', '2.25', '2.5']));
    return {
      key: 'rideshare', topic: 'A rideshare fare depends on the length of the ride.', says: (a, y) => `A ride of ${a} costs ${y}.`, f: 'F', v: 'd', m: perMile, b: base, maxInput: 20,
      setup: `A rideshare app charges a ${money(base)} pickup fee plus ${money(perMile)} per mile.`,
      outputDesc: 'the fare, in dollars, for a $d$-mile ride',
      inWord: (a) => `${a.toTex()} mile${a.eq(1) ? '' : 's'}`, outWord: dollars, outUnit: 'dollars', inUnits: 'miles', inUnit: 'mile',
      rateUnit: 'dollars per mile', startMeaning: `the ${money(base)} pickup fee`, rateMeaning: `the fare goes up ${money(perMile)} for each mile`, isMoney: true,
    };
  },
  carwash(rng) {
    const supplies = Q(rng.pick([30, 40, 45, 60]));
    const price = Q(rng.pick([5, 6, 8, 10]));
    return {
      key: 'carwash', topic: "The school band's car wash profit depends on how many cars are washed.", says: (a, y) => `After washing ${a}, the band's profit is ${y}.`, f: 'P', v: 'c', m: price, b: supplies.neg(), maxInput: 40,
      setup: `The school band holds a car wash. Supplies cost ${money(supplies)}, and each car washed brings in ${money(price)}.`,
      outputDesc: 'the profit, in dollars, after washing $c$ cars',
      inWord: (a) => `${a.toTex()} car${a.eq(1) ? '' : 's'}`, outWord: dollars, outUnit: 'dollars', inUnits: 'cars', inUnit: 'car',
      rateUnit: 'dollars per car', startMeaning: `the band starts ${money(supplies)} in the hole because of supplies`, rateMeaning: `each car adds ${money(price)} to the profit`, isMoney: true,
    };
  },
  candle(rng) {
    const h0 = Q(rng.pick([24, 30, 36]));
    const burn = Q(rng.pick([2, 3]));
    return {
      key: 'candle', topic: 'A lit candle burns down at a steady rate.', says: (a, y) => `After burning for ${a}, the candle is ${y} tall.`, f: 'H', v: 't', m: burn.neg(), b: h0, maxInput: Math.floor(h0.toNumber() / burn.toNumber()) - 1,
      setup: `A candle is ${h0.toTex()} centimeters tall when it is lit. It burns down ${burn.toTex()} centimeters each hour.`,
      outputDesc: 'the height of the candle, in centimeters, after $t$ hours',
      inWord: (a) => `${a.toTex()} hour${a.eq(1) ? '' : 's'}`, outWord: plain('centimeters'), outUnit: 'centimeters', inUnits: 'hours', inUnit: 'hour',
      rateUnit: 'centimeters per hour', startMeaning: `the candle is ${h0.toTex()} cm tall before it burns`, rateMeaning: `the candle gets ${burn.toTex()} cm shorter each hour`, isMoney: false,
    };
  },
};

export const CONTEXT_KEYS = Object.keys(BUILDERS);

export function buildContext(rng: Rng, keys: readonly string[] = CONTEXT_KEYS): LinearContext {
  return BUILDERS[rng.pick(keys)](rng);
}

/** Contexts where the rate is positive / negative (useful when a lesson wants one kind). */
export const INCREASING_KEYS = ['gym', 'savings', 'hike', 'rideshare', 'carwash'];
export const DECREASING_KEYS = ['battery', 'tank', 'candle'];
