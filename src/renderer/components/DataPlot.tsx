/**
 * Accessible SVG statistical displays: box plots (one or several on a shared axis, outliers
 * as dots), dot plots and histograms. Every number shown comes straight from the spec.
 */
import type { DataPlotSpec } from '../../core/curriculum/types';

const W = 480;
const PAD = 30;
const COLORS = ['#3557d4', '#d4572f', '#1f8a5b', '#8a3fbf'];

function ticksFor(min: number, max: number, step: number): number[] {
  const out: number[] = [];
  for (let x = Math.ceil(min / step - 1e-9) * step; x <= max + 1e-9; x += step) out.push(+x.toFixed(6));
  return out;
}

function Axis({ min, max, step, y, sx, label }: { min: number; max: number; step: number; y: number; sx: (x: number) => number; label?: string }) {
  const ticks = ticksFor(min, max, step);
  const every = ticks.length > 16 ? 2 : 1;
  return (
    <g>
      <line x1={sx(min)} x2={sx(max)} y1={y} y2={y} className="graph-axis" />
      {ticks.map((x, i) => (
        <g key={x}>
          <line x1={sx(x)} x2={sx(x)} y1={y} y2={y + 6} className="graph-axis" />
          {i % every === 0 && (
            <text x={sx(x)} y={y + 20} className="graph-tick" textAnchor="middle">
              {x}
            </text>
          )}
        </g>
      ))}
      {label && (
        <text x={(sx(min) + sx(max)) / 2} y={y + 38} className="graph-label" textAnchor="middle">
          {label}
        </text>
      )}
    </g>
  );
}

export function DataPlot({ spec, caption }: { spec: DataPlotSpec; caption?: string }) {
  if (spec.kind === 'histogram') {
    const H = 300;
    const left = PAD + 16;
    const lo = Math.min(...spec.bins.map((b) => b.from));
    const hi = Math.max(...spec.bins.map((b) => b.to));
    const top = Math.max(...spec.bins.map((b) => b.count));
    const yStep = spec.yStep ?? (top <= 12 ? 1 : top <= 30 ? 5 : 10);
    const yMax = Math.ceil((top + 0.5) / yStep) * yStep;
    const sx = (x: number) => left + ((x - lo) / (hi - lo)) * (W - left - PAD);
    const sy = (y: number) => H - 50 - (y / yMax) * (H - 70);
    const yTicks = ticksFor(0, yMax, yStep);
    return (
      <figure className="graph dataplot">
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={spec.ariaLabel} className="graph-svg">
          <rect x={0} y={0} width={W} height={H} className="graph-bg" />
          {yTicks.map((y) => (
            <g key={'y' + y}>
              <line x1={left} x2={W - PAD} y1={sy(y)} y2={sy(y)} className="graph-grid" />
              <text x={left - 6} y={sy(y) + 4} className="graph-tick" textAnchor="end">
                {y}
              </text>
            </g>
          ))}
          {spec.bins.map((b, i) => (
            <rect key={i} x={sx(b.from)} width={sx(b.to) - sx(b.from)} y={sy(b.count)} height={sy(0) - sy(b.count)} fill={COLORS[0]} fillOpacity={0.55} stroke={COLORS[0]} strokeWidth={1.5} />
          ))}
          <line x1={left} x2={W - PAD} y1={sy(0)} y2={sy(0)} className="graph-axis" />
          <line x1={left} x2={left} y1={sy(0)} y2={sy(yMax)} className="graph-axis" />
          {[...new Set(spec.bins.flatMap((b) => [b.from, b.to]))].map((x) => (
            <text key={'x' + x} x={sx(x)} y={sy(0) + 16} className="graph-tick" textAnchor="middle">
              {x}
            </text>
          ))}
          {spec.xLabel && (
            <text x={(left + W - PAD) / 2} y={H - 12} className="graph-label" textAnchor="middle">
              {spec.xLabel}
            </text>
          )}
          {spec.yLabel && (
            <text x={12} y={(sy(0) + sy(yMax)) / 2} className="graph-label" textAnchor="middle" transform={`rotate(-90 12 ${(sy(0) + sy(yMax)) / 2})`}>
              {spec.yLabel}
            </text>
          )}
        </svg>
        {caption && <figcaption>{caption}</figcaption>}
      </figure>
    );
  }
  const step = spec.step ?? 1;
  const left = spec.kind === 'box' && spec.boxes.some((b) => b.label) ? 80 : PAD;
  const sx = (x: number) => left + ((x - spec.min) / (spec.max - spec.min)) * (W - left - PAD);
  if (spec.kind === 'dot') {
    const counts = new Map<number, number>();
    const dots: Array<{ x: number; k: number }> = [];
    for (const v of [...spec.values].sort((a, b) => a - b)) {
      const k = counts.get(v) ?? 0;
      counts.set(v, k + 1);
      dots.push({ x: v, k });
    }
    const tallest = Math.max(1, ...counts.values());
    const R = 6;
    const axisY = 20 + tallest * (2 * R + 2) + 6;
    const H = axisY + (spec.axisLabel ? 48 : 30);
    return (
      <figure className="graph dataplot">
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={spec.ariaLabel} className="graph-svg">
          <rect x={0} y={0} width={W} height={H} className="graph-bg" />
          {dots.map((d, i) => (
            <circle key={i} cx={sx(d.x)} cy={axisY - R - 3 - d.k * (2 * R + 2)} r={R} fill={COLORS[0]} />
          ))}
          <Axis min={spec.min} max={spec.max} step={step} y={axisY} sx={sx} label={spec.axisLabel} />
        </svg>
        {caption && <figcaption>{caption}</figcaption>}
      </figure>
    );
  }
  const rowH = 64;
  const axisY = 16 + spec.boxes.length * rowH;
  const H = axisY + (spec.axisLabel ? 48 : 30);
  return (
    <figure className="graph dataplot">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={spec.ariaLabel} className="graph-svg">
        <rect x={0} y={0} width={W} height={H} className="graph-bg" />
        {ticksFor(spec.min, spec.max, step).map((x) => (
          <line key={'g' + x} x1={sx(x)} x2={sx(x)} y1={8} y2={axisY} className="graph-grid" />
        ))}
        {spec.boxes.map((b, i) => {
          const cy = 16 + i * rowH + rowH / 2;
          const c = COLORS[i % COLORS.length];
          const lo = b.min;
          const hi = b.max;
          return (
            <g key={i}>
              {b.label && (
                <text x={8} y={cy + 4} className="graph-label">
                  {b.label}
                </text>
              )}
              <line x1={sx(lo)} x2={sx(b.q1)} y1={cy} y2={cy} stroke={c} strokeWidth={2} />
              <line x1={sx(b.q3)} x2={sx(hi)} y1={cy} y2={cy} stroke={c} strokeWidth={2} />
              <line x1={sx(lo)} x2={sx(lo)} y1={cy - 9} y2={cy + 9} stroke={c} strokeWidth={2} />
              <line x1={sx(hi)} x2={sx(hi)} y1={cy - 9} y2={cy + 9} stroke={c} strokeWidth={2} />
              <rect x={sx(b.q1)} width={Math.max(1, sx(b.q3) - sx(b.q1))} y={cy - 18} height={36} fill={c} fillOpacity={0.15} stroke={c} strokeWidth={2} />
              <line x1={sx(b.median)} x2={sx(b.median)} y1={cy - 18} y2={cy + 18} stroke={c} strokeWidth={3} />
              {(b.outliers ?? []).map((o, j) => (
                <circle key={j} cx={sx(o)} cy={cy} r={4.5} fill="var(--surface)" stroke={c} strokeWidth={2} />
              ))}
            </g>
          );
        })}
        <Axis min={spec.min} max={spec.max} step={step} y={axisY} sx={sx} label={spec.axisLabel} />
      </svg>
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  );
}
