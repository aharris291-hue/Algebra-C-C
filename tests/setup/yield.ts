import { afterEach } from 'vitest';

// Many generator tests are long synchronous loops. Yield to the event loop
// after each test so the worker can answer vitest's RPC calls; on a slow
// Windows CI runner a file full of back-to-back loops otherwise blocks it past
// the RPC timeout ("Timeout calling 'onTaskUpdate'").
afterEach(() => new Promise<void>((resolve) => setImmediate(resolve)));
