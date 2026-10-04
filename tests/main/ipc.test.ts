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
