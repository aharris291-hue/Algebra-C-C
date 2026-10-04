/**
 * Local diagnostic log (spec §40). Records errors and events with an area tag.
 * Never pass student names, answers or PINs to the logger.
 */
import fs from 'node:fs';
import path from 'node:path';

export interface Logger {
  info(area: string, msg: string): void;
  warn(area: string, msg: string): void;
  error(area: string, msg: string, err?: unknown): void;
}

export const nullLogger: Logger = { info() {}, warn() {}, error() {} };

export class FileLogger implements Logger {
  private file: string;
  constructor(dir: string, private maxBytes = 1_000_000) {
    fs.mkdirSync(dir, { recursive: true });
    this.file = path.join(dir, 'app.log');
  }
  private write(level: string, area: string, msg: string): void {
    try {
      if (fs.existsSync(this.file) && fs.statSync(this.file).size > this.maxBytes) {
        fs.renameSync(this.file, this.file + '.1');
      }
      fs.appendFileSync(this.file, `${new Date().toISOString()} ${level} [${area}] ${msg.replace(/\s+/g, ' ').slice(0, 2000)}\n`);
    } catch {
      /* logging must never crash the app */
    }
  }
  info(area: string, msg: string) {
    this.write('INFO', area, msg);
  }
  warn(area: string, msg: string) {
    this.write('WARN', area, msg);
  }
  error(area: string, msg: string, err?: unknown) {
    const detail = err instanceof Error ? ` | ${err.name}: ${err.message} | ${err.stack?.split('\n').slice(1, 4).join(' ')}` : '';
    this.write('ERROR', area, msg + detail);
  }
}

export class MemoryLogger implements Logger {
  lines: string[] = [];
  info(a: string, m: string) {
    this.lines.push(`INFO [${a}] ${m}`);
  }
  warn(a: string, m: string) {
    this.lines.push(`WARN [${a}] ${m}`);
  }
  error(a: string, m: string) {
    this.lines.push(`ERROR [${a}] ${m}`);
  }
}
