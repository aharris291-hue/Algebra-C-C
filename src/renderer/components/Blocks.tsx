/** Renders lesson content blocks. */
import type { Block, SolutionStep } from '../../core/curriculum/types';
import { Inline, RichParagraph, Tex } from './RichText';
import { Graph } from './Graph';

const CALLOUT_LABEL: Record<string, string> = { tip: 'Tip', warning: 'Watch out', why: 'Why it works', realworld: 'In real life', vocab: 'Vocabulary' };

export function Steps({ items, reveal }: { items: SolutionStep[]; reveal?: number }) {
  const shown = reveal === undefined ? items : items.slice(0, reveal);
  return (
    <ol className="steps">
      {shown.map((s, i) => (
        <li key={i} className="step">
          <div className="step-text">
            <Inline text={s.text} />
          </div>
          {s.tex && <Tex tex={s.tex} display />}
          {s.why && (
            <div className="step-why">
              <span className="why-label">Why: </span>
              <Inline text={s.why} />
            </div>
          )}
        </li>
      ))}
    </ol>
  );
}

export function BlockView({ b }: { b: Block }) {
  switch (b.t) {
    case 'p':
      return <RichParagraph text={b.text} />;
    case 'math':
      return <Tex tex={b.tex} display />;
    case 'list': {
      const items = b.items.map((it, i) => (
        <li key={i}>
          <Inline text={it} />
        </li>
      ));
      return b.ordered ? <ol className="content-list">{items}</ol> : <ul className="content-list">{items}</ul>;
    }
    case 'callout':
      return (
        <aside className={`callout callout-${b.variant}`}>
          <div className="callout-title">{b.title ?? CALLOUT_LABEL[b.variant]}</div>
          <div>
            <Inline text={b.text} />
          </div>
        </aside>
      );
    case 'table':
      return (
        <div className="table-wrap">
          <table className="content-table">
            {b.caption && (
              <caption>
                <Inline text={b.caption} />
              </caption>
            )}
            <thead>
              <tr>
                {b.headers.map((h, i) => (
                  <th key={i} scope="col">
                    <Inline text={h} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {b.rows.map((r, i) => (
                <tr key={i}>
                  {r.map((c, j) => (
                    <td key={j}>
                      <Inline text={c} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case 'graph':
      return <Graph spec={b.spec} caption={b.caption} />;
    case 'steps':
      return <Steps items={b.items} />;
  }
}

export function Blocks({ blocks }: { blocks: Block[] }) {
  return (
    <div className="blocks">
      {blocks.map((b, i) => (
        <BlockView key={i} b={b} />
      ))}
    </div>
  );
}
