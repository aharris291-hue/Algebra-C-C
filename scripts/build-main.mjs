// Bundles the Electron main process, the preload script and the test harness with esbuild,
// and copies the SQLite WebAssembly binary next to them.
import { build } from 'esbuild';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const common = { bundle: true, platform: 'node', target: 'node20', sourcemap: true, external: ['electron'], logLevel: 'warning' };

await build({ ...common, entryPoints: ['src/main/main.ts'], outfile: 'dist/main/main.js', format: 'cjs' });
await build({ ...common, entryPoints: ['src/preload/preload.ts'], outfile: 'dist/main/preload.js', format: 'cjs' });
await build({ ...common, entryPoints: ['src/harness/server.ts'], outfile: 'dist/harness/server.js', format: 'cjs' });

const wasm = require.resolve('sql.js/dist/sql-wasm.wasm');
for (const dir of ['dist/main', 'dist/harness']) fs.copyFileSync(wasm, path.join(dir, 'sql-wasm.wasm'));
console.log('main, preload and harness built');
