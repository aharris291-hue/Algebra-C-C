/**
 * Renders lesson text: inline math in $...$ (KaTeX), **bold**, and "### " headings.
 * A literal dollar sign is written \$ in content.
 */
import katex from 'katex';
import { Fragment, useMemo } from 'react';

const cache = new Map<string, string>();
function texToHtml(tex: string, display: boolean): string {
  const k = (display ? 'D' : 'I') + tex;
  let html = cache.get(k);
  if (html === undefined) {
    html = katex.renderToString(tex, { displayMode: display, throwOnError: false, strict: 'ignore', output: 'htmlAndMathml' });
    if (cache.size > 2000) cache.clear();
    cache.set(k, html);
  }
  return html;
}

export function Tex({ tex, display = false }: { tex: string; display?: boolean }) {
  const html = useMemo(() => texToHtml(tex, display), [tex, display]);
  return display ? <div className="math-display" dangerouslySetInnerHTML={{ __html: html }} /> : <span className="math-inline" dangerouslySetInnerHTML={{ __html: html }} />;
}

type Piece = { kind: 'text'; s: string } | { kind: 'math'; s: string };

export function splitMath(text: string): Piece[] {
  const out: Piece[] = [];
  let buf = '';
  let i = 0;
  while (i < text.length) {
    const c = text[i];
    if (c === '\\' && text[i + 1] === '$') {
      buf += '$';
      i += 2;
      continue;
    }
    if (c === '$') {
      // find the closing unescaped $
      let j = i + 1;
      while (j < text.length && !(text[j] === '$' && text[j - 1] !== '\\')) j++;
      if (j >= text.length) {
        buf += c;
        i++;
        continue;
      }
      if (buf) out.push({ kind: 'text', s: buf });
      buf = '';
      out.push({ kind: 'math', s: text.slice(i + 1, j) });
      i = j + 1;
      continue;
    }
    buf += c;
    i++;
  }
  if (buf) out.push({ kind: 'text', s: buf });
  return out;
}

function Bold({ s }: { s: string }) {
  const parts = s.split('**');
  return (
    <>
      {parts.map((p, i) => (i % 2 === 1 ? <strong key={i}>{p}</strong> : <Fragment key={i}>{p}</Fragment>))}
    </>
  );
}

/** Inline rich text (no block structure). */
export function Inline({ text }: { text: string }) {
  const pieces = useMemo(() => splitMath(text), [text]);
  // bold markers may span math; handle per text piece while tracking open state
  let bold = false;
  const nodes = pieces.map((p, i) => {
    if (p.kind === 'math') {
      const m = <Tex key={i} tex={p.s} />;
      return bold ? <strong key={i}>{m}</strong> : m;
    }
    const segs = p.s.split('**');
    const r = segs.map((seg, k) => {
      if (k > 0) bold = !bold;
      return bold ? <strong key={k}>{seg}</strong> : <Fragment key={k}>{seg}</Fragment>;
    });
    return <Fragment key={i}>{r}</Fragment>;
  });
  return <>{nodes}</>;
}

/** A paragraph of rich text; "### Heading" becomes a heading. */
export function RichParagraph({ text }: { text: string }) {
  if (text.startsWith('### ')) {
    return (
      <h3 className="content-h3">
        <Inline text={text.slice(4)} />
      </h3>
    );
  }
  return (
    <p>
      <Inline text={text} />
    </p>
  );
}

export { Bold };
