import { validateArgs, ARG_SCHEMA } from '../../src/main/ipc-schema';
import { API_METHODS } from '../../src/shared/api';

describe('IPC argument validation', () => {
  it('has a schema for every API method', () => {
    expect(Object.keys(ARG_SCHEMA).sort()).toEqual([...API_METHODS].sort());
  });
  it('accepts valid calls, including an omitted optional argument sent as null', () => {
    expect(validateArgs('submitAnswer', [1, 'U1L01', 'k', '3', 1000])).toBeNull();
    expect(validateArgs('teachMeAgain', [1, 'U1L01'])).toBeNull();
    expect(validateArgs('teachMeAgain', [1, 'U1L01', null])).toBeNull();
    expect(validateArgs('heartbeat', [1, null, 'quiz', 15])).toBeNull();
  });
  it('submit calls accept an optional trailing guided-step index (bug A8)', () => {
    for (const [m, head] of [
      ['submitAnswer', [1, 'U1L01', 'k', '3', 1000]],
      ['daySubmit', [1, 'U1D10', 'k', '3', 1000]],
      ['diagnosticReviewSubmit', [1, 'k', '3', 1000]],
    ] as Array<[string, unknown[]]>) {
      expect(validateArgs(m, head), m).toBeNull();
      expect(validateArgs(m, [...head, 2]), m).toBeNull();
      expect(validateArgs(m, [...head, null]), m).toBeNull(); // undefined sent over JSON
      expect(validateArgs(m, [...head, 1.5]), m).not.toBeNull();
      expect(validateArgs(m, [...head, '2']), m).not.toBeNull();
      expect(validateArgs(m, [...head, 2, 3]), m).not.toBeNull();
    }
  });
  it('rejects wrong types, extra arguments and unknown methods', () => {
    expect(validateArgs('getCourse', ['1'])).not.toBeNull();
    expect(validateArgs('getCourse', [1.5])).not.toBeNull();
    expect(validateArgs('getCourse', [1, 2])).not.toBeNull();
    expect(validateArgs('submitAnswer', [1, 'U1L01', 'k', 3, 1000])).not.toBeNull();
    expect(validateArgs('updateSettings', [1, [1]])).not.toBeNull();
    expect(validateArgs('dropTables', [])).not.toBeNull();
    expect(validateArgs('openLesson', [1])).not.toBeNull();
  });
});
