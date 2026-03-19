import esClient from '@/config/elasticsearch';
import { MIGRATE_CONFIG } from '../config';
import { logger } from '@/utils/logger';
import { BulkError, MigrationResult } from '../types';

const RETRY_ATTEMPTS = 3;
const RETRY_DELAY_MS = 1000;

async function sleep(ms: number): Promise<void> {
  return new Promise((res) => setTimeout(res, ms));
}

export const bulkService = {
  async insertBatch(
    index: string,
    docs: any[],
    buildDoc: (doc: any) => Record<string, any>
  ): Promise<{ success: number; errors: BulkError[] }> {
    // Lọc document thiếu _id trước khi build operations
    const validDocs = docs.filter((doc) => {
      if (!doc._id) {
        logger.warn('Document thiếu _id — bỏ qua');
        return false;
      }
      return true;
    });

    if (validDocs.length === 0) return { success: 0, errors: [] };

    const operations = validDocs.flatMap((doc) => [
      { index: { _index: index, _id: doc._id.toString() } },
      buildDoc(doc)
    ]);

    // Retry với exponential backoff khi ES tạm thời quá tải
    let lastError: unknown;
    for (let attempt = 1; attempt <= RETRY_ATTEMPTS; attempt++) {
      try {
        const result = await esClient.bulk({ operations, refresh: false });

        const errors: BulkError[] = [];
        if (result.errors) {
          for (const item of result.items) {
            if (item.index?.error) {
              errors.push({
                id: item.index._id ?? 'unknown',
                reason: item.index.error.reason ?? 'unknown error'
              });
            }
          }
        }

        // operations = [action, body, action, body, ...]
        // → số document thực = operations.length / 2
        const docCount = operations.length / 2;
        return { success: docCount - errors.length, errors };
      } catch (err: unknown) {
        lastError = err;
        if (attempt < RETRY_ATTEMPTS) {
          const delay = RETRY_DELAY_MS * attempt;
          logger.warn(
            `Bulk request thất bại (lần ${attempt}/${RETRY_ATTEMPTS}) — thử lại sau ${delay}ms`
          );
          await sleep(delay);
        }
      }
    }

    throw lastError;
  },

  async runMigration(
    index: string,
    // Cursor-based pagination thay vì skip/limit
    // → tránh deep pagination O(n) trong MongoDB khi collection lớn
    fetchBatch: (lastId: string | null, limit: number) => Promise<any[]>,
    buildDoc: (doc: any) => Record<string, any>,
    total: number,
    batchSize: number = MIGRATE_CONFIG.BATCH_SIZE
  ): Promise<MigrationResult> {
    const startTime = Date.now();
    let processed = 0;
    let success = 0;
    let failed = 0;
    let lastId: string | null = null;
    const allErrors: BulkError[] = [];

    while (processed < total) {
      const docs = await fetchBatch(lastId, batchSize);
      if (docs.length === 0) break;

      const { success: batchSuccess, errors } = await this.insertBatch(
        index,
        docs,
        buildDoc
      );

      success += batchSuccess;
      failed += errors.length;
      processed += docs.length;
      allErrors.push(...errors);

      // Lấy _id cuối làm cursor cho batch kế tiếp
      lastId = docs[docs.length - 1]._id?.toString() ?? null;

      logger.progress({
        current: Math.min(processed, total),
        total,
        percent: ((Math.min(processed, total) / total) * 100).toFixed(1),
        elapsed: logger.formatMs(Date.now() - startTime)
      });
    }

    if (allErrors.length > 0) {
      logger.warn(`${allErrors.length} document lỗi:`);
      allErrors
        .slice(0, 10)
        .forEach((e) => logger.error(`  ID: ${e.id} — ${e.reason}`));
      if (allErrors.length > 10)
        logger.warn(`  ... và ${allErrors.length - 10} lỗi khác`);
    }

    return {
      collectionName: index,
      total,
      success,
      failed,
      duration: Date.now() - startTime
    };
  }
};
