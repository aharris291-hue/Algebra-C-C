/**
 * Accessible SVG number line for one-variable inequalities: ticks, open or closed
 * endpoints, and shaded rays or segments of solutions.
 */
import type { NumberLineSpec } from '../../core/curriculum/types';

const W = 480;
const H = 74;
const PAD = 26;
const Y = 32;
const COLOR = '#3557d4';

export function NumberLine({ spec, caption }: { spec: NumberLineSpec; caption?: string }) {
  const { min, max } = spec;
  const step = spec.step ?? 1;
  const sx = (x: number) => PAD + ((x - min) / (max - min)) * (W - 2 * PAD);
  const ticks: number[] = [];
  for (let x = Math.ceil(min / step) * step; x <= max + 1e-9; x += step) ticks.push(+x.toFixed(6));
  const labelEvery = ticks.length > 16 ? 2 : 1;
  const dot = (x: number, closed: boolean, key: string) => <circle key={key} cx={sx(x)} cy={Y} r={6} fill={closed ? COLOR : "var(--surface)"} stroke={COLOR} strokeWidth={2.5} />;
  return (
    <figure className="graph numberline">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={spec.ariaLabel} className="graph-svg">
        <line x1={PAD - 14} x2={W - PAD + 14} y1={Y} y2={Y} className="graph-axis" />
        <path d={`M${PAD - 14},${Y} l8,-5 v10 z M${W - PAD + 14},${Y} l-8,-5 v10 z`} className="numberline-arrow" />
        {ticks.map((x, i) => (
          <g key={'t' + x}>
            <line x1={sx(x)} x2={sx(x)} y1={Y - 6} y2={Y + 6} className="graph-axis" />
            {i % labelEvery === 0 && (
              <text x={sx(x)} y={Y + 24} className="graph-tick" textAnchor="middle">
                {x}
              </text>
            )}
          </g>
        ))}
        {(spec.segments ?? []).map((s, i) => (
          <line key={'s' + i} x1={sx(s.from)} x2={sx(s.to)} y1={Y} y2={Y} stroke={COLOR} strokeWidth={6} />
        ))}
        {(spec.rays ?? []).map((r, i) => {
          const end = r.dir === 'right' ? W - PAD + 12 : PAD - 12;
          return (
            <g key={'r' + i}>
              <line x1={sx(r.from)} x2={end} y1={Y} y2={Y} stroke={COLOR} strokeWidth={6} />
              <path d={r.dir === 'right' ? `M${end + 4},${Y} l-11,-8 v16 z` : `M${end - 4},${Y} l11,-8 v16 z`} fill={COLOR} />
            </g>
          );
        })}
        {(spec.segments ?? []).flatMap((s, i) => [dot(s.from, s.fromClosed, 'sa' + i), dot(s.to, s.toClosed, 'sb' + i)])}
        {(spec.rays ?? []).map((r, i) => dot(r.from, r.closed, 'rd' + i))}
        {(spec.points ?? []).map((p, i) => dot(p.x, p.closed, 'p' + i))}
      </svg>
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  );
}
