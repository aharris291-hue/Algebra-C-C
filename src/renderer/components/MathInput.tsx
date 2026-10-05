/**
 * Answer box with a symbol bar and a live preview of how the app reads the input
 * (spec §13). The preview never says whether the answer is right.
 */
import { useEffect, useRef, useState } from 'react';
import type { AnswerKind } from '../../shared/api';
import { api } from '../api';
import { Tex } from './RichText';

const SYMBOLS: Record<string, Array<{ label: string; insert: string; title: string }>> = {
  base: [
    { label: 'x²', insert: '^2', title: 'Squared' },
    { label: 'xⁿ', insert: '^', title: 'Exponent' },
    { label: '√', insert: '√(', title: 'Square root' },
    { label: '( )', insert: '()', title: 'Parentheses' },
    { label: '÷ /', insert: '/', title: 'Fraction or divide' },
    { label: '−', insert: '-', title: 'Minus or negative' },
  ],
  relation: [
    { label: '=', insert: '=', title: 'Equals' },
    { label: '<', insert: '<', title: 'Less than' },
    { label: '>', insert: '>', title: 'Greater than' },
    { label: '≤', insert: '≤', title: 'Less than or equal to' },
    { label: '≥', insert: '≥', title: 'Greater than or equal to' },
  ],
  solutions: [
    { label: '±', insert: '±', title: 'Plus or minus' },
    { label: ',', insert: ', ', title: 'Separate answers' },
  ],
  interval: [
    { label: '[', insert: '[', title: 'Included endpoint' },
    { label: '(', insert: '(', title: 'Excluded endpoint' },
    { label: '∞', insert: '∞', title: 'Infinity' },
  ],
};

const EXAMPLES: Partial<Record<AnswerKind, string>> = {
  number: 'Example: 12, -3.5 or 7/2',
  expression: 'Example: 3x^2 - 2x + 1',
  equation: 'Example: y = 2x + 3',
  inequality: 'Example: x > 4 or y ≤ -2x + 1',
  point: 'Example: (3, -2)',
  'region-point': 'Example: (3, -2)',
  solutions: 'Example: x = 2, x = -5 (or "no real solutions")',
  interval: 'Example: [2, 7) or x > 3',
  'sequence-terms': 'Example: 4, 7, 10',
};

export function MathInput(props: { kind: AnswerKind; value: string; onChange: (v: string) => void; onSubmit: () => void; disabled?: boolean; unit?: string; inputHint?: string; autoFocus?: boolean; label: string }) {
  const { kind, value, onChange, onSubmit, disabled } = props;
  const ref = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<{ tex: string | null; error: string | null }>({ tex: null, error: null });

  useEffect(() => {
    if (props.autoFocus) ref.current?.focus();
  }, [props.autoFocus]);

  useEffect(() => {
    if (!value.trim()) {
      setPreview({ tex: null, error: null });
      return;
    }
    let live = true;
    const t = setTimeout(() => {
      api.previewAnswer(value, kind).then((p) => live && setPreview(p)).catch(() => live && setPreview({ tex: null, error: null }));
    }, 180);
    return () => {
      live = false;
      clearTimeout(t);
    };
  }, [value, kind]);

  const insert = (s: string) => {
    const el = ref.current;
    if (!el) return;
    const start = el.selectionStart ?? value.length;
    const end = el.selectionEnd ?? value.length;
    const next = value.slice(0, start) + s + value.slice(end);
    onChange(next);
    requestAnimationFrame(() => {
      el.focus();
      const pos = s === '()' ? start + 1 : start + s.length;
      el.setSelectionRange(pos, pos);
    });
  };

  const groups = [SYMBOLS.base];
  if (kind === 'equation' || kind === 'inequality' || kind === 'interval') groups.push(SYMBOLS.relation);
  if (kind === 'solutions') groups.push(SYMBOLS.solutions);
  if (kind === 'interval') groups.push(SYMBOLS.interval);

  return (
    <div className="math-input">
      <div className="symbol-bar" role="toolbar" aria-label="Math symbols">
        {groups.flat().map((s) => (
          <button key={s.label} type="button" className="symbol" title={s.title} aria-label={s.title} onClick={() => insert(s.insert)} disabled={disabled}>
            {s.label}
          </button>
        ))}
      </div>
      <div className="input-row">
        <input
          ref={ref}
          className="answer-input"
          aria-label={props.label}
          value={value}
          disabled={disabled}
          spellCheck={false}
          autoComplete="off"
          maxLength={300}
          placeholder={props.inputHint ?? EXAMPLES[kind] ?? 'Type your answer'}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && value.trim()) {
              e.preventDefault();
              onSubmit();
            }
          }}
        />
        {props.unit && <span className="answer-unit">{props.unit}</span>}
      </div>
      <div className="preview" aria-live="polite">
        {preview.tex && (
          <>
            <span className="preview-label">The app reads: </span>
            <Tex tex={preview.tex} />
          </>
        )}
        {preview.error && <span className="preview-error">{preview.error}</span>}
      </div>
    </div>
  );
}
