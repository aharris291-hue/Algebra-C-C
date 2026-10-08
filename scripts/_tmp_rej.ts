import { GENERATORS } from '../src/content';
import { produceProblem } from '../src/core/engine/problems';
for (const id of ['u1.solve-fx-graph','u1.eval-linear','u1.solve-fx','u1.solve-context']) {
  const gen = (GENERATORS as any).get ? (GENERATORS as any).get(id) : (GENERATORS as any)[id]; const reasons = new Map<string, number>();
  for (const d of [1,2,3] as const) for (let s=1;s<=300;s++){ const {rejected}=produceProblem(gen,s*7919+d,d); for(const r of rejected) for(const e of r.errors){const k=`d${d} ${e.slice(0,110)}`;reasons.set(k,(reasons.get(k)??0)+1);} }
  console.log(id, [...reasons].slice(0,6));
}
