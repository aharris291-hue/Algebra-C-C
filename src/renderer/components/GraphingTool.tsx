/**
 * Built-in graphing tool (works offline): graph up to four functions or inequalities, change the
 * window, read a table of values, see zeros, turning points and intersections, and fit a line of
 * best fit to data. Like a graphing calculator, it is a tool for exploring and checking work.
 */
import { useMemo, useState } from 'react';
import type { GraphSpec } from '../../core/curriculum/types';
import { Graph } from './Graph';
import { parseGraphInput, pointsOfInterest, intersections, tableOfValues, parseData, linearRegression, fmt, GraphEntry, PointOfInterest } from '../../core/math/graphing';

const COLORS = ['#3557d4', '#d4572f', '#1f8a5b', '#8a3fbf'];
const STANDARD = { xMin: -10, xMax: 10, yMin: -8, yMax: 8 };
type Win = typeof STANDARD;

const POI_LABEL: Record<PointOfInterest['kind'], string> = { zero: 'x-intercept', 'y-intercept': 'y-intercept', maximum: 'maximum', minimum: 'minimum', intersection: 'intersection' };

export function GraphingTool(props: { onClose: () => void }) {
  const [rows, setRows] = useState<string[]>(['', '', '', '']);
  const [win, setWin] = useState<Win>(STANDARD);
  const [draftWin, setDraftWin] = useState<Record<keyof Win, string>>({ xMin: '-10', xMax: '10', yMin: '-8', yMax: '8' });
  const [tab, setTab] = useState<'graph' | 'table' | 'data'>('graph');
  const [tableRow, setTableRow] = useState(0);
  const [tStart, setTStart] = useState('0');
  const [tStep, setTStep] = useState('1');
  const [data, setData] = useState('');
  const [fit, setFit] = useState(true);

  const entries: GraphEntry[] = useMemo(() => rows.map(parseGraphInput), [rows]);
  const dataParsed = useMemo(() => parseData(data), [data]);
  const reg = useMemo(() => (fit ? linearRegression(dataParsed.points) : null), [fit, dataParsed]);

  const spec: GraphSpec = useMemo(() => {
    const s: GraphSpec = { ...win, functions: [], inequalities: [], verticalInequalities: [], segments: [], points: [], ariaLabel: 'Graphing tool' };
    const desc: string[] = [];
    entries.forEach((e, i) => {
      const color = COLORS[i];
      if (e.kind === 'function') {
        s.functions!.push({ expr: e.expr, color });
        desc.push(`y = ${e.expr}`);
      } else if (e.kind === 'inequality') {
        s.inequalities!.push({ boundary: e.expr, side: e.side, strict: e.strict, color });
        desc.push(`y ${e.side === 'above' ? '>' : '<'}${e.strict ? '' : '='} ${e.expr}`);
      } else if (e.kind === 'vertical') {
        if (e.side) s.verticalInequalities!.push({ x: e.x, side: e.side, strict: !!e.strict, color });
        else s.segments!.push({ x1: e.x, y1: win.yMin, x2: e.x, y2: win.yMax, color });
        desc.push(`x ${e.side ? (e.side === 'right' ? '>' : '<') : '='} ${e.x}`);
      }
    });
    if (dataParsed.points.length) {
      s.scatter = dataParsed.points;
      if (reg) s.showLineOfFit = { m: reg.m, b: reg.b };
      desc.push(`${dataParsed.points.length} data points`);
    }
    s.ariaLabel = `Graphing tool, x from ${win.xMin} to ${win.xMax}, y from ${win.yMin} to ${win.yMax}${desc.length ? ': ' + desc.join('; ') : ''}`;
    return s;
  }, [entries, win, dataParsed, reg]);

  const poi = useMemo(() => {
    const out: Array<PointOfInterest & { row: number; other?: number }> = [];
    const fns = entries.map((e, i) => ({ e, i })).filter((x) => x.e.kind === 'function' || x.e.kind === 'inequality') as Array<{ e: Extract<GraphEntry, { ast: unknown }>; i: number }>;
    for (const { e, i } of fns) for (const p of pointsOfInterest(e.ast, win.xMin, win.xMax)) if (p.y >= win.yMin && p.y <= win.yMax) out.push({ ...p, row: i });
    for (let a = 0; a < fns.length; a++)
      for (let b = a + 1; b < fns.length; b++)
        for (const p of intersections(fns[a].e.ast, fns[b].e.ast, win.xMin, win.xMax)) if (p.y >= win.yMin && p.y <= win.yMax) out.push({ ...p, row: fns[a].i, other: fns[b].i });
    return out.slice(0, 24);
  }, [entries, win]);

  const applyWin = () => {
    const n = Object.fromEntries(Object.entries(draftWin).map(([k, v]) => [k, Number(v)])) as Win;
    if (Object.values(n).every(Number.isFinite) && n.xMax > n.xMin && n.yMax > n.yMin) setWin(n);
  };
  const setBoth = (w: Win) => {
    setWin(w);
    setDraftWin({ xMin: String(w.xMin), xMax: String(w.xMax), yMin: String(w.yMin), yMax: String(w.yMax) });
  };
  const zoom = (f: number) => {
    const cx = (win.xMin + win.xMax) / 2;
    const cy = (win.yMin + win.yMax) / 2;
    const hx = ((win.xMax - win.xMin) / 2) * f;
    const hy = ((win.yMax - win.yMin) / 2) * f;
    const r = (v: number) => +v.toPrecision(6);
    setBoth({ xMin: r(cx - hx), xMax: r(cx + hx), yMin: r(cy - hy), yMax: r(cy + hy) });
  };
  const fitData = () => {
    const pts = dataParsed.points;
    if (!pts.length) return;
    const xs = pts.map((p) => p.x);
    const ys = pts.map((p) => p.y);
    const pad = (lo: number, hi: number) => {
      const span = hi - lo || 2;
      return [Math.floor(Math.min(0, lo - span * 0.1)), Math.ceil(hi + span * 0.1)];
    };
    const [x0, x1] = pad(Math.min(...xs), Math.max(...xs));
    const [y0, y1] = pad(Math.min(...ys), Math.max(...ys));
    setBoth({ xMin: x0, xMax: x1, yMin: y0, yMax: y1 });
  };

  const tableEntry = entries[tableRow];
  const table =
    (tableEntry?.kind === 'function' || tableEntry?.kind === 'inequality') && Number.isFinite(Number(tStart)) && Number(tStep) > 0 ? tableOfValues(tableEntry.ast, Number(tStart), Number(tStep), 10) : null;

  return (
    <aside className="graphing-tool" role="dialog" aria-label="Graphing tool">
      <header className="gt-head">
        <h2>Graphing tool</h2>
        <button className="btn btn-quiet" onClick={props.onClose} aria-label="Close the graphing tool">
          ✕ Close
        </button>
      </header>
      <div className="gt-rows">
        {rows.map((r, i) => {
          const e = entries[i];
          return (
            <label key={i} className="gt-row">
              <span className="gt-swatch" style={{ background: COLORS[i] }} aria-hidden />
              <input
                aria-label={`Graph ${i + 1}`}
                value={r}
                placeholder={i === 0 ? 'y = 2x + 1' : i === 1 ? 'y >= -x + 3' : i === 2 ? 'y = 3(0.5)^x' : 'x = 4'}
                onChange={(ev) => setRows(rows.map((x, j) => (j === i ? ev.target.value : x)))}
                spellCheck={false}
              />
              {e.kind === 'error' && <span className="gt-error">{e.message}</span>}
            </label>
          );
        })}
      </div>
      <nav className="tabs" role="tablist">
        {(['graph', 'table', 'data'] as const).map((t) => (
          <button key={t} role="tab" aria-selected={tab === t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t === 'graph' ? 'Graph' : t === 'table' ? 'Table' : 'Data & best fit'}
          </button>
        ))}
      </nav>

      {tab !== 'table' && <Graph spec={spec} />}

      {tab === 'graph' && (
        <>
          <div className="gt-window">
            {(['xMin', 'xMax', 'yMin', 'yMax'] as const).map((k) => (
              <label key={k}>
                <span>{k.replace('Min', ' min').replace('Max', ' max')}</span>
                <input inputMode="decimal" value={draftWin[k]} onChange={(e) => setDraftWin({ ...draftWin, [k]: e.target.value })} onBlur={applyWin} onKeyDown={(e) => e.key === 'Enter' && applyWin()} />
              </label>
            ))}
          </div>
          <div className="row-buttons">
            <button className="btn btn-small" onClick={() => zoom(0.5)}>
              Zoom in
            </button>
            <button className="btn btn-small" onClick={() => zoom(2)}>
              Zoom out
            </button>
            <button className="btn btn-small" onClick={() => setBoth(STANDARD)}>
              Standard window
            </button>
          </div>
          {poi.length > 0 && (
            <div className="gt-poi">
              <h3>Points of interest</h3>
              <ul>
                {poi.map((p, i) => (
                  <li key={i}>
                    <span className="gt-swatch" style={{ background: COLORS[p.row] }} aria-hidden />
                    {p.other !== undefined && <span className="gt-swatch" style={{ background: COLORS[p.other] }} aria-hidden />}
                    {POI_LABEL[p.kind]}: ({fmt(p.x)}, {fmt(p.y)})
                  </li>
                ))}
              </ul>
              <p className="sub">Values are rounded to 4 decimal places, like a calculator.</p>
            </div>
          )}
        </>
      )}

      {tab === 'table' && (
        <div className="gt-table">
          <div className="gt-window">
            <label>
              <span>Graph</span>
              <select value={tableRow} onChange={(e) => setTableRow(Number(e.target.value))}>
                {rows.map((r, i) => (
                  <option key={i} value={i}>
                    {i + 1}: {r || '(empty)'}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>Start x</span>
              <input inputMode="decimal" value={tStart} onChange={(e) => setTStart(e.target.value)} />
            </label>
            <label>
              <span>Step</span>
              <input inputMode="decimal" value={tStep} onChange={(e) => setTStep(e.target.value)} />
            </label>
          </div>
          {table ? (
            <table>
              <thead>
                <tr>
                  <th>x</th>
                  <th>y</th>
                </tr>
              </thead>
              <tbody>
                {table.map((r) => (
                  <tr key={r.x}>
                    <td>{fmt(r.x)}</td>
                    <td>{fmt(r.y)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="sub">Type a function in that row to see its table.</p>
          )}
        </div>
      )}

      {tab === 'data' && (
        <div className="gt-data">
          <label className="field">
            <span>Data: one point per line, x and y separated by a comma</span>
            <textarea rows={6} value={data} onChange={(e) => setData(e.target.value)} placeholder={'1, 3\n2, 5\n3, 6'} spellCheck={false} />
          </label>
          {dataParsed.bad.length > 0 && <p className="gt-error">Line {dataParsed.bad.join(', ')} could not be read. Type two numbers, like 4, 9.</p>}
          <div className="row-buttons">
            <label className="check">
              <input type="checkbox" checked={fit} onChange={(e) => setFit(e.target.checked)} /> Line of best fit
            </label>
            <button className="btn btn-small" onClick={fitData} disabled={!dataParsed.points.length}>
              Fit the window to the data
            </button>
          </div>
          {reg && (
            <p className="gt-fit" aria-live="polite">
              y = {fmt(reg.m)}x {reg.b < 0 ? '−' : '+'} {fmt(Math.abs(reg.b))} &nbsp; r = {fmt(reg.r)}
            </p>
          )}
          {fit && dataParsed.points.length === 1 && <p className="sub">A line of best fit needs at least two points.</p>}
        </div>
      )}
    </aside>
  );
}
