/**
 * Colour contrast of the theme tokens in styles.css (audit L1, L3): the focus ring must be >= 3:1
 * against every page background and against its halo, in light and dark themes; stage pill text
 * (Learning, Mastered, ...) must be >= 4.5:1 on its pill.
 */
import fs from 'node:fs';
import path from 'node:path';

const css = fs.readFileSync(path.resolve(__dirname, '../../src/renderer/styles.css'), 'utf8');

function block(selector: string): Record<string, string> {
  const i = css.indexOf(`${selector} {`);
  if (i < 0) throw new Error('no block ' + selector);
  const body = css.slice(css.indexOf('{', i) + 1, css.indexOf('}', i));
  const out: Record<string, string> = {};
  for (const m of body.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) out[m[1]] = m[2].trim();
  return out;
}
const light = block(':root');
const dark = { ...light, ...block(":root[data-theme='dark']") };

function lum(hex: string): number {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? [...h].map((c) => c + c).join('') : h;
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
export function contrast(a: string, b: string): number {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
}

describe.each([
  ['light', light],
  ['dark', dark],
] as const)('%s theme', (_name, t) => {
  it('the focus ring is >= 3:1 against the page, cards, panels and its own halo', () => {
    expect(t['--focus']).toMatch(/^#[0-9a-f]{6}$/i);
    for (const bg of ['--bg', '--surface', '--surface-2', '--accent-soft', '--focus-halo']) {
      expect(contrast(t['--focus'], t[bg]), `${bg} ${t[bg]}`).toBeGreaterThanOrEqual(3);
    }
  });
  it('stage pill text is >= 4.5:1 on its pill', () => {
    for (const stage of ['not-started', 'learning', 'developing', 'proficient', 'mastered']) {
      const ink = t[`--stage-${stage}-ink`];
      const bg = t[`--stage-${stage}-bg`];
      expect(contrast(ink, bg), `${stage}: ${ink} on ${bg}`).toBeGreaterThanOrEqual(4.5);
    }
  });
});

describe('focus styles', () => {
  it('draws the two-colour ring on :focus-visible and on focused text fields (not only a border colour)', () => {
    const ring = /outline:\s*3px solid var\(--focus\);\s*outline-offset:\s*2px;\s*box-shadow:\s*0 0 0 2px var\(--focus-halo\);/;
    expect(css).toMatch(new RegExp(String.raw`:focus-visible \{\s*` + ring.source));
    expect(css).toMatch(new RegExp(String.raw`input:focus,\s*textarea:focus,\s*select:focus \{\s*` + ring.source));
    // no text-field rule removes the outline again
    expect(css).not.toMatch(/\.answer-input:focus \{[^}]*outline:\s*none/);
  });
  it('the stage pills use the theme tokens', () => {
    for (const s of ['NOT_STARTED', 'LEARNING', 'DEVELOPING', 'PROFICIENT', 'MASTERED']) {
      const tok = s.toLowerCase().replace('_', '-');
      expect(css).toContain(`.stage-${s} {\n  background: var(--stage-${tok}-bg);\n  color: var(--stage-${tok}-ink);`);
    }
    expect(css).not.toMatch(/:root\[data-theme='dark'\] \.stage-/);
  });
});
