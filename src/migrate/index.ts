/**
 * CLI entry point cho Elasticsearch migration
 *
 * Usage:
 *   npm run migrate:es                   → migrate tất cả collections
 *   npm run migrate:es -- --drop         → migrate tất cả + reset index cũ
 *   npm run migrate:es -- movies         → chỉ migrate collection movies
 *   npm run migrate:es -- movies users   → migrate nhiều collections
 *   npm run migrate:es -- movies --drop  → migrate + drop index movies
 */

import 'dotenv/config';
import MongoDB from '@/config/db';
import { runMigration } from './services/migrationRunner';
import { logger } from '@/utils/logger';
import { CollectionMigrateConfig, MigrationResult } from './types';
import migrateConfig from './migrate.config';

const args = process.argv.slice(2);
const drop = args.includes('--drop');
const collections = args.filter((a) => !a.startsWith('--'));

function resolveTargets(): CollectionMigrateConfig[] {
  if (collections.length === 0) return migrateConfig;

  const targets: CollectionMigrateConfig[] = [];
  for (const name of collections) {
    const found = migrateConfig.find((c) => c.collectionName === name);
    if (!found)
      logger.warn(`"${name}" không có trong migrate.config.ts — bỏ qua`);
    else targets.push(found);
  }
  return targets;
}

type MigrationSummary = MigrationResult & {
  status: 'ok' | 'error';
  error?: string;
};

async function main(): Promise<void> {
  const targets = resolveTargets();

  if (targets.length === 0) {
    logger.warn('Không có collection nào để migrate!');
    return;
  }

  logger.info(
    `📦 Collections : ${targets.map((t) => t.collectionName).join(', ')}`
  );
  logger.info(`🗑  Drop mode   : ${drop}`);

  await MongoDB.connect();
  logger.success('MongoDB connected');

  const results: MigrationSummary[] = [];

  for (const cfg of targets) {
    try {
      const result = await runMigration(cfg, { dropIfExists: drop });
      results.push({ ...result, status: 'ok' });
    } catch (err: any) {
      logger.error(
        `Lỗi migrate "${cfg.collectionName}": ${err?.message ?? err}`
      );
      results.push({
        collectionName: cfg.collectionName,
        total: 0,
        success: 0,
        failed: 0,
        duration: 0,
        status: 'error',
        error: err?.message ?? String(err)
      });
    }
  }

  // ── Tổng kết ─────────────────────────────────────────
  const ok = results.filter((r) => r.status === 'ok');
  const error = results.filter((r) => r.status === 'error');

  console.log(`\n${'═'.repeat(50)}`);
  for (const r of results) {
    if (r.status === 'ok')
      logger.success(
        `${r.collectionName.padEnd(20)} ✔ ${r.success}/${r.total} (${logger.formatMs(r.duration)})`
      );
    else logger.error(`${r.collectionName.padEnd(20)} ✖ ${r.error}`);
  }
  console.log(`${'─'.repeat(50)}`);
  logger.info(`Thành công: ${ok.length} | Thất bại: ${error.length}`);

  if (error.length > 0) process.exitCode = 1;
}

main()
  .catch((err) => {
    logger.error('Lỗi không mong đợi:', err);
    process.exitCode = 1;
  })
  .finally(async () => {
    // Gọi process.exit tường minh để tránh process treo
    // do open handles (mongoose connection, ES keep-alive)
    process.exit(process.exitCode ?? 0);
  });
