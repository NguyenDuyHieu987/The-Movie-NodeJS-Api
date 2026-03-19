import { MigrationProgress } from '../migrate/types';

const formatMs = (ms: number): string => {
  if (ms < 1000) return `${ms}ms`;
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  if (m === 0) return `${s}s`;
  return `${m}m ${s % 60}s`;
};

export const logger = {
  info: (msg: string) => console.log(`[ℹ️]    ${msg}`),
  success: (msg: string) => console.log(`[✅]   ${msg}`),
  warn: (msg: string) => console.warn(`[⚠️]    ${msg}`),
  error: (msg: string, err?: unknown) => {
    console.error(`[❌]    ${msg}`);
    if (err) console.error(err);
  },
  progress: (p: MigrationProgress) => {
    process.stdout.write(
      `\r[⏳]   ${p.current}/${p.total} (${p.percent}%) — elapsed: ${p.elapsed}   `
    );
    if (p.current === p.total) process.stdout.write('\n');
  },
  formatMs
};
