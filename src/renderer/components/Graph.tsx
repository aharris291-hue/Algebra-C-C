/**
 * Accessible SVG graph for lessons and problems: grid, axes, function curves, points,
 * segments, shaded inequalities and scatter plots. Curves are sampled from the same exact
 * parser the grader uses, so a graph always matches its rule.
 */
import { useId, useMemo } from 'react';
import type { GraphSpec } from '../../core/curriculum/types';
import { parseExpression } from '../../core/math/parser';
import { evalNumeric } from '../../core/math/evaluate';

const W = 440;
const H = 360;
const PAD = 30;
const COLORS = ['#3557d4', '#d4572f', '#1f8a5b', '#8a3fbf'];

function niceStep(range: number): number {
  const rough = range / 10;
  const p = Math.pow(10, Math.floor(Math.log10(rough)));
  for (const m of [1, 2, 5, 10]) if (m * p >= rough) return m * p;
  return 10 * p;
}

export function Graph({ spec, caption }: { spec: GraphSpec; caption?: string }) {
  const { xMin, xMax, yMin, yMax } = spec;
  const clipId = 'clip' + useId().replace(/[^a-zA-Z0-9]/g, '');
  const sx = (x: number) => PAD + ((x - xMin) / (xMax - xMin)) * (W - 2 * PAD);
  const sy = (y: number) => H - PAD - ((y - yMin) / (yMax - yMin)) * (H - 2 * PAD);
  const xStep = spec.xStep ?? (xMax - xMin <= 24 ? 1 : niceStep(xMax - xMin));
  const yStep = spec.yStep ?? (yMax - yMin <= 24 ? 1 : niceStep(yMax - yMin));

  const curves = useMemo(() => {
    return (spec.functions ?? []).map((f, idx) => {
      let ast;
      try {
        ast = parseExpression(f.expr);
      } catch {
        return null;
      }
      const [d0, d1] = f.domain ?? [xMin, xMax];
      const segs: string[] = [];
      let cur = '';
      const N = 400;
      for (let i = 0; i <= N; i++) {
        const x = d0 + ((d1 - d0) * i) / N;
        let y: number;
        try {
          y = evalNumeric(ast, { x });
        } catch {
          y = NaN;
        }
        // points far outside the window are dropped; the plot area is clipped, so nothing is drawn outside it
        const visible = Number.isFinite(y) && y >= yMin - 4 * (yMax - yMin) && y <= yMax + 4 * (yMax - yMin);
        if (!visible) {
          if (cur) segs.push(cur);
          cur = '';
          continue;
        }
        cur += `${cur ? 'L' : 'M'}${sx(x).toFixed(1)},${sy(y).toFixed(1)}`;
      }
      if (cur) segs.push(cur);
      return { d: segs.join(' '), color: f.color ?? COLORS[idx % COLORS.length], dashed: f.dashed, label: f.label };
    });
  }, [spec, xMin, xMax, yMin, yMax]);

  const shades = useMemo(() => {
    return (spec.inequalities ?? []).map((q, idx) => {
      let ast;
      try {
        ast = parseExpression(q.boundary);
      } catch {
        return null;
      }
      const pts: string[] = [];
      const N = 200;
      for (let i = 0; i <= N; i++) {
        const x = xMin + ((xMax - xMin) * i) / N;
        const y = Math.max(yMin, Math.min(yMax, evalNumeric(ast, { x })));
        pts.push(`${sx(x).toFixed(1)},${sy(y).toFixed(1)}`);
      }
      const edgeY = q.side === 'above' ? yMax : yMin;
      const poly = [...pts, `${sx(xMax)},${sy(edgeY)}`, `${sx(xMin)},${sy(edgeY)}`].join(' ');
      const line = 'M' + pts.join(' L');
      return { poly, line, color: q.color ?? COLORS[idx % COLORS.length], strict: q.strict };
    });
  }, [spec, xMin, xMax, yMin, yMax]);

  const gridX: number[] = [];
  for (let x = Math.ceil(xMin / xStep) * xStep; x <= xMax + 1e-9; x += xStep) gridX.push(+x.toFixed(6));
  const gridY: number[] = [];
  for (let y = Math.ceil(yMin / yStep) * yStep; y <= yMax + 1e-9; y += yStep) gridY.push(+y.toFixed(6));
  const labelEvery = (n: number) => (n > 16 ? 2 : 1);
  const lx = labelEvery(gridX.length);
  const ly = labelEvery(gridY.length);
  const axisX = yMin <= 0 && yMax >= 0 ? sy(0) : sy(yMin);
  const axisY = xMin <= 0 && xMax >= 0 ? sx(0) : sx(xMin);

  return (
    <figure className="graph">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={spec.ariaLabel} className="graph-svg">
        <defs>
          <clipPath id={clipId}>
            <rect x={PAD} y={PAD} width={W - 2 * PAD} height={H - 2 * PAD} />
          </clipPath>
        </defs>
        <rect x={PAD} y={PAD} width={W - 2 * PAD} height={H - 2 * PAD} className="graph-bg" />
        {gridX.map((x) => (
          <line key={'gx' + x} x1={sx(x)} x2={sx(x)} y1={PAD} y2={H - PAD} className="graph-grid" />
        ))}
        {gridY.map((y) => (
          <line key={'gy' + y} y1={sy(y)} y2={sy(y)} x1={PAD} x2={W - PAD} className="graph-grid" />
        ))}
        {shades.map((s, i) => s && <polygon key={'sh' + i} points={s.poly} fill={s.color} opacity={0.16} />)}
        {shades.map((s, i) => s && <path key={'sl' + i} clipPath={`url(#${clipId})`} d={s.line} stroke={s.color} strokeWidth={2.2} fill="none" strokeDasharray={s.strict ? '7 5' : undefined} />)}
        {(spec.verticalInequalities ?? []).map((v, i) => {
          const x = sx(v.x);
          const x2 = v.side === 'right' ? W - PAD : PAD;
          return (
            <g key={'vi' + i}>
              <rect x={Math.min(x, x2)} y={PAD} width={Math.abs(x2 - x)} height={H - 2 * PAD} fill={v.color ?? COLORS[0]} opacity={0.16} />
              <line x1={x} x2={x} y1={PAD} y2={H - PAD} stroke={v.color ?? COLORS[0]} strokeWidth={2.2} strokeDasharray={v.strict ? '7 5' : undefined} />
            </g>
          );
        })}
        <line x1={PAD} x2={W - PAD} y1={axisX} y2={axisX} className="graph-axis" />
        <line y1={PAD} y2={H - PAD} x1={axisY} x2={axisY} className="graph-axis" />
        {gridX.filter((_, i) => i % lx === 0).map((x) =>
          x === 0 ? null : (
            <text key={'tx' + x} x={sx(x)} y={Math.min(H - PAD + 14, axisX + 14)} className="graph-tick" textAnchor="middle">
              {x}
            </text>
          ),
        )}
        {gridY.filter((_, i) => i % ly === 0).map((y) =>
          y === 0 ? null : (
            <text key={'ty' + y} x={Math.max(PAD - 4, axisY - 5)} y={sy(y) + 4} className="graph-tick" textAnchor="end">
              {y}
            </text>
          ),
        )}
        {spec.xLabel && (
          <text x={W - PAD} y={H - 6} className="graph-label" textAnchor="end">
            {spec.xLabel}
          </text>
        )}
        {spec.yLabel && (
          <text x={6} y={PAD - 10} className="graph-label">
            {spec.yLabel}
          </text>
        )}
        {curves.map((c, i) => c && <path key={'c' + i} clipPath={`url(#${clipId})`} d={c.d} stroke={c.color} strokeWidth={2.6} fill="none" strokeDasharray={c.dashed ? '7 5' : undefined} />)}
        {(spec.segments ?? []).map((s, i) => (
          <line key={'s' + i} x1={sx(s.x1)} y1={sy(s.y1)} x2={sx(s.x2)} y2={sy(s.y2)} stroke={s.color ?? '#666'} strokeWidth={1.8} strokeDasharray={s.dashed ? '5 4' : undefined} />
        ))}
        {(spec.scatter ?? []).map((p, i) => (
          <circle key={'sc' + i} cx={sx(p.x)} cy={sy(p.y)} r={4} className="graph-scatter" />
        ))}
        {spec.showLineOfFit && <line x1={sx(xMin)} y1={sy(spec.showLineOfFit.m * xMin + spec.showLineOfFit.b)} x2={sx(xMax)} y2={sy(spec.showLineOfFit.m * xMax + spec.showLineOfFit.b)} stroke={COLORS[1]} strokeWidth={2} />}
        {(spec.points ?? []).map((p, i) => (
          <g key={'p' + i}>
            <circle cx={sx(p.x)} cy={sy(p.y)} r={5} fill={p.open ? 'var(--surface)' : p.color ?? COLORS[1]} stroke={p.color ?? COLORS[1]} strokeWidth={2} />
            {p.label && (
              <text x={sx(p.x) + 8} y={sy(p.y) - 8} className="graph-point-label">
                {p.label}
              </text>
            )}
          </g>
        ))}
      </svg>
      {(caption || curves.some((c) => c?.label)) && (
        <figcaption>
          {caption}
          {curves.filter((c) => c?.label).length > 0 && (
            <span className="graph-legend">
              {curves.map((c, i) =>
                c?.label ? (
                  <span key={i} className="legend-item">
                    <span className="legend-swatch" style={{ background: c.color }} />
                    {c.label}
                  </span>
                ) : null,
              )}
            </span>
          )}
        </figcaption>
      )}
    </figure>
  );
}
