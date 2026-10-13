/**
 * Draw-a-graph answer input (answer kind 'graph'). The student types a label for each axis, chooses
 * what one grid square is worth on each axis, and places points on grid intersections; for an
 * inequality they also choose a solid or dashed boundary and the side to shade.
 *
 * Keyboard: focus the grid, move the cursor with the arrow keys, press Enter (or Space) to place or
 * remove a point at the cursor, Delete/Backspace to remove one. Mouse: click an intersection.
 * The value is the JSON response the main process grades (see core/math/graphAnswer.ts).
 */
import { useEffect, useId, useMemo, useState } from 'react';
import type { KeyboardEvent, MouseEvent, ReactElement } from 'react';
import type { GraphConfig, GraphResponse } from '../../core/math/graphAnswer';
import { parseGraphResponse } from '../../core/math/graphAnswer';

const CELL = 34;
const PAD_L = 56;
const PAD_B = 44;
const PAD_T = 14;
const PAD_R = 14;
const MAX_POINTS = 10;

function num(s: string | undefined): number | null {
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

function fmt(n: number): string {
  return String(Math.round(n * 1e6) / 1e6);
}

export function GraphInput(props: { config: GraphConfig; value: string; onChange: (v: string) => void; disabled?: boolean; label: string }) {
  const { config, value, onChange, disabled } = props;
  const id = useId().replace(/[^a-zA-Z0-9]/g, '');
  const parsed = useMemo<GraphResponse>(() => parseGraphResponse(value) ?? { p: [] }, [value]);
  const [cursor, setCursor] = useState<[number, number]>([0, 0]);
  const [announce, setAnnounce] = useState('');
  const W = PAD_L + config.cols * CELL + PAD_R;
  const H = PAD_T + config.rows * CELL + PAD_B;
  const sx = (gx: number) => PAD_L + gx * CELL;
  const sy = (gy: number) => PAD_T + (config.rows - gy) * CELL;
  const xs = num(parsed.xs);
  const ys = num(parsed.ys);
  const ineq = config.curve === 'inequality';

  const update = (patch: Partial<GraphResponse>) => {
    const next: GraphResponse = { ...parsed, ...patch };
    const out: Record<string, unknown> = { p: next.p };
    for (const k of ['xs', 'ys', 'xl', 'yl', 'bd', 'sh'] as const) if (next[k] !== undefined && next[k] !== '') out[k] = next[k];
    const anything = next.p.length > 0 || !!(next.xs || next.ys || next.xl || next.yl || next.bd || next.sh);
    onChange(anything ? JSON.stringify(out) : '');
  };

  const valueAt = (gx: number, gy: number) => (xs !== null && ys !== null ? `(${fmt(gx * xs)}, ${fmt(gy * ys)})` : `grid line ${gx} across, ${gy} up (choose the scales to see values)`);

  const toggle = (gx: number, gy: number) => {
    if (disabled) return;
    const has = parsed.p.some(([a, b]) => a === gx && b === gy);
    if (has) {
      update({ p: parsed.p.filter(([a, b]) => !(a === gx && b === gy)) });
      setAnnounce(`Point removed at ${valueAt(gx, gy)}.`);
    } else {
      if (parsed.p.length >= MAX_POINTS) {
        setAnnounce(`You can place up to ${MAX_POINTS} points. Remove one first.`);
        return;
      }
      update({ p: [...parsed.p, [gx, gy]] });
      setAnnounce(`Point placed at ${valueAt(gx, gy)}.`);
    }
  };

  useEffect(() => {
    setCursor(([a, b]) => [Math.min(a, config.cols), Math.min(b, config.rows)]);
  }, [config.cols, config.rows]);

  const onKey = (e: KeyboardEvent) => {
    if (disabled) return;
    let [gx, gy] = cursor;
    if (e.key === 'ArrowLeft') gx = Math.max(0, gx - 1);
    else if (e.key === 'ArrowRight') gx = Math.min(config.cols, gx + 1);
    else if (e.key === 'ArrowUp') gy = Math.min(config.rows, gy + 1);
    else if (e.key === 'ArrowDown') gy = Math.max(0, gy - 1);
    else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggle(gx, gy);
      return;
    } else if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault();
      if (parsed.p.some(([a, b]) => a === gx && b === gy)) toggle(gx, gy);
      return;
    } else return;
    e.preventDefault();
    setCursor([gx, gy]);
    setAnnounce(`Cursor at ${valueAt(gx, gy)}${parsed.p.some(([a, b]) => a === gx && b === gy) ? ', point placed here' : ''}.`);
  };

  const onClick = (e: MouseEvent<SVGSVGElement>) => {
    if (disabled) return;
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * W;
    const py = ((e.clientY - rect.top) / rect.height) * H;
    const gx = Math.round((px - PAD_L) / CELL);
    const gy = Math.round((PAD_T + config.rows * CELL - py) / CELL);
    if (gx < 0 || gy < 0 || gx > config.cols || gy > config.rows) return;
    setCursor([gx, gy]);
    toggle(gx, gy);
  };

  // the student's drawing: a line through the first two points (extended across the grid), or a path through the points in order of x
  const sorted = [...parsed.p].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  let drawing: ReactElement | null = null;
  let shade: ReactElement | null = null;
  if ((config.curve === 'line' || ineq) && parsed.p.length >= 2 && parsed.p[0][0] !== parsed.p[1][0]) {
    const [[x1, y1], [x2, y2]] = parsed.p;
    const slope = (y2 - y1) / (x2 - x1);
    const at = (gx: number) => y1 + slope * (gx - x1);
    const pts = [
      [0, at(0)],
      [config.cols, at(config.cols)],
    ];
    drawing = <line className={`gi-curve ${ineq && parsed.bd === 'dashed' ? 'gi-dashed' : ''}`} x1={sx(pts[0][0])} y1={sy(pts[0][1])} x2={sx(pts[1][0])} y2={sy(pts[1][1])} clipPath={`url(#gi-clip-${id})`} />;
    if (ineq && parsed.sh) {
      const edge = parsed.sh === 'above' ? config.rows + 50 : -50;
      const poly = [
        [0, at(0)],
        [config.cols, at(config.cols)],
        [config.cols, edge],
        [0, edge],
      ]
        .map(([a, b]) => `${sx(a)},${sy(b)}`)
        .join(' ');
      shade = <polygon className="gi-shade" points={poly} clipPath={`url(#gi-clip-${id})`} />;
    }
  } else if ((config.curve === 'parabola' || config.curve === 'exponential') && sorted.length >= 2) {
    drawing = <polyline className="gi-curve" points={sorted.map(([a, b]) => `${sx(a)},${sy(b)}`).join(' ')} />;
  }

  const tickEvery = (n: number) => (n > 12 ? 2 : 1);
  const scaleSelect = (axis: 'x' | 'y') => {
    const opts = axis === 'x' ? config.xOptions : config.yOptions;
    const cur = axis === 'x' ? parsed.xs : parsed.ys;
    return (
      <label className="gi-field">
        <span>{axis === 'x' ? 'Horizontal axis: one square =' : 'Vertical axis: one square ='}</span>
        <select value={cur ?? ''} disabled={disabled} onChange={(e) => update(axis === 'x' ? { xs: e.target.value || undefined } : { ys: e.target.value || undefined })} data-testid={`graph-scale-${axis}`}>
          <option value="">Choose…</option>
          {opts.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      </label>
    );
  };

  return (
    <div className="graph-input" role="group" aria-label={props.label}>
      <div className="gi-controls">
        <label className="gi-field">
          <span>Horizontal axis label</span>
          <input type="text" maxLength={30} value={parsed.xl ?? ''} disabled={disabled} placeholder="quantity (unit)" onChange={(e) => update({ xl: e.target.value })} data-testid="graph-label-x" />
        </label>
        {scaleSelect('x')}
        <label className="gi-field">
          <span>Vertical axis label</span>
          <input type="text" maxLength={30} value={parsed.yl ?? ''} disabled={disabled} placeholder="quantity (unit)" onChange={(e) => update({ yl: e.target.value })} data-testid="graph-label-y" />
        </label>
        {scaleSelect('y')}
      </div>
      <svg
        className="gi-svg"
        viewBox={`0 0 ${W} ${H}`}
        width={W}
        role="application"
        tabIndex={disabled ? -1 : 0}
        aria-label={`Graph grid, ${config.cols} squares across and ${config.rows} up. Use the arrow keys to move the cursor and Enter to place or remove a point.`}
        aria-describedby={`gi-help-${id}`}
        onKeyDown={onKey}
        onClick={onClick}
        data-testid="graph-grid"
      >
        <defs>
          <clipPath id={`gi-clip-${id}`}>
            <rect x={sx(0)} y={sy(config.rows)} width={config.cols * CELL} height={config.rows * CELL} />
          </clipPath>
        </defs>
        <rect className="gi-bg" x={sx(0)} y={sy(config.rows)} width={config.cols * CELL} height={config.rows * CELL} />
        {shade}
        {Array.from({ length: config.cols + 1 }, (_, i) => (
          <line key={`v${i}`} className={i === 0 ? 'gi-axis' : 'gi-grid'} x1={sx(i)} y1={sy(0)} x2={sx(i)} y2={sy(config.rows)} />
        ))}
        {Array.from({ length: config.rows + 1 }, (_, i) => (
          <line key={`h${i}`} className={i === 0 ? 'gi-axis' : 'gi-grid'} x1={sx(0)} y1={sy(i)} x2={sx(config.cols)} y2={sy(i)} />
        ))}
        {Array.from({ length: config.cols + 1 }, (_, i) =>
          i % tickEvery(config.cols) === 0 ? (
            <text key={`tx${i}`} className="gi-tick" x={sx(i)} y={sy(0) + 16} textAnchor="middle">
              {xs !== null ? fmt(i * xs) : i === 0 ? '0' : '?'}
            </text>
          ) : null,
        )}
        {Array.from({ length: config.rows + 1 }, (_, i) =>
          i > 0 && i % tickEvery(config.rows) === 0 ? (
            <text key={`ty${i}`} className="gi-tick" x={sx(0) - 6} y={sy(i) + 4} textAnchor="end">
              {ys !== null ? fmt(i * ys) : '?'}
            </text>
          ) : null,
        )}
        <text className="gi-axis-label" x={sx(config.cols / 2)} y={H - 6} textAnchor="middle">
          {parsed.xl || 'horizontal axis label'}
        </text>
        <text className="gi-axis-label" x={12} y={sy(config.rows / 2)} textAnchor="middle" transform={`rotate(-90 12 ${sy(config.rows / 2)})`}>
          {parsed.yl || 'vertical axis label'}
        </text>
        {drawing}
        {parsed.p.map(([gx, gy]) => (
          <circle key={`${gx},${gy}`} className="gi-point" cx={sx(gx)} cy={sy(gy)} r={6} />
        ))}
        {!disabled && <circle className="gi-cursor" cx={sx(cursor[0])} cy={sy(cursor[1])} r={10} />}
      </svg>
      <p id={`gi-help-${id}`} className="gi-help">
        Click an intersection, or focus the grid and use the arrow keys and Enter, to place or remove a point. Place at least {config.minPoints} point{config.minPoints === 1 ? '' : 's'}.
      </p>
      {ineq && (
        <div className="gi-controls">
          <fieldset className="gi-choice">
            <legend>Boundary line</legend>
            {(['solid', 'dashed'] as const).map((b) => (
              <label key={b}>
                <input type="radio" name={`gi-bd-${id}`} checked={parsed.bd === b} disabled={disabled} onChange={() => update({ bd: b })} data-testid={`graph-boundary-${b}`} /> {b === 'solid' ? 'Solid' : 'Dashed'}
              </label>
            ))}
          </fieldset>
          <fieldset className="gi-choice">
            <legend>Shade</legend>
            {(['above', 'below'] as const).map((s) => (
              <label key={s}>
                <input type="radio" name={`gi-sh-${id}`} checked={parsed.sh === s} disabled={disabled} onChange={() => update({ sh: s })} data-testid={`graph-shade-${s}`} /> {s === 'above' ? 'Above the line' : 'Below the line'}
              </label>
            ))}
          </fieldset>
        </div>
      )}
      <div className="gi-points">
        <span>Your points: </span>
        {parsed.p.length === 0 ? (
          <span className="gi-none">none yet</span>
        ) : (
          <ul aria-label="Placed points">
            {sorted.map(([gx, gy]) => (
              <li key={`${gx},${gy}`}>
                {xs !== null && ys !== null ? `(${fmt(gx * xs)}, ${fmt(gy * ys)})` : `(${gx}, ${gy} squares)`}{' '}
                <button type="button" className="btn btn-small btn-quiet" disabled={disabled} onClick={() => toggle(gx, gy)} aria-label={`Remove point ${xs !== null && ys !== null ? `(${fmt(gx * xs)}, ${fmt(gy * ys)})` : ''}`}>
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
        {parsed.p.length > 0 && (
          <button type="button" className="btn btn-small" disabled={disabled} onClick={() => update({ p: [] })}>
            Clear points
          </button>
        )}
      </div>
      <div className="sr-only" aria-live="polite" data-testid="graph-announce">
        {announce}
      </div>
    </div>
  );
}
