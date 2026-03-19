import { indexService } from './indexService';
import { bulkService } from './bulkService';
import { inferMappingFromModel, logMapping } from '../utils/schemaInferrer';
import {
  filterDocByMapping,
  extractTopLevelFields
} from '../utils/mappingFilter';
import { MIGRATE_CONFIG } from '../config';
import { logger } from '@/utils/logger';
import {
  CollectionMigrateConfig,
  MigrationOptions,
  MigrationResult
} from '../types';

export async function runMigration(
  cfg: CollectionMigrateConfig,
  options: MigrationOptions = {}
): Promise<MigrationResult> {
  const merged = { ...options, ...cfg.options };
  const {
    batchSize = MIGRATE_CONFIG.BATCH_SIZE,
    dropIfExists = false,
    refreshOnComplete = MIGRATE_CONFIG.REFRESH_ON_COMPLETE
  } = merged;

  const indexName = cfg.indexName ?? cfg.collectionName.toLowerCase();
  const startTime = Date.now();

  logger.info(`\n${'─'.repeat(50)}`);
  logger.info(`Collection : ${cfg.collectionName}`);
  logger.info(`Index      : ${indexName}`);

  // ── 1. Xác định mapping ────────────────────────────────
  const mapping = cfg.mapping ?? inferMappingFromModel(cfg.model);
  logger.info(`Fields (${Object.keys(mapping.properties ?? {}).length}):`);
  logMapping(mapping.properties ?? {});

  // ── 2. Tạo / reset index ──────────────────────────────
  if (dropIfExists) {
    await indexService.reset(indexName, mapping);
  } else if (!(await indexService.exists(indexName))) {
    await indexService.create(indexName, mapping);
  } else {
    logger.warn(
      `Index "${indexName}" đã tồn tại — bỏ qua (dùng --drop để reset)`
    );
  }

  // ── 3. Đếm tổng ───────────────────────────────────────
  const total = await cfg.model.countDocuments();
  logger.info(`Tổng documents: ${total}`);

  if (total === 0) {
    logger.warn('Collection trống!');
    return {
      collectionName: cfg.collectionName,
      total: 0,
      success: 0,
      failed: 0,
      duration: 0
    };
  }

  // ── 4. Xây dựng buildDoc theo thứ tự ưu tiên ──────────
  //
  //   1. buildDoc tuỳ chỉnh  — toàn quyền, dev tự chịu trách nhiệm lọc
  //   2. mapping file        — deep filter: lọc field ở mọi cấp (top-level,
  //                            nested, object con) theo đúng mapping.properties.
  //                            Field thừa từ MongoDB bị loại hoàn toàn.
  //   3. excludeFields       — lấy tất cả, loại trừ một số field top-level
  //   4. mặc định            — lấy tất cả (trừ __v)
  const buildDoc: (doc: any) => Record<string, any> = (() => {
    if (cfg.buildDoc) {
      logger.info('Chế độ: buildDoc tuỳ chỉnh');
      return cfg.buildDoc;
    }

    if (cfg.mapping) {
      logger.info(
        `Chế độ: mapping file — deep filter theo ${Object.keys(cfg.mapping.properties ?? {}).length} trường`
      );
      return (doc: any) => filterDocByMapping(doc, cfg.mapping!);
    }

    if (cfg.excludeFields && cfg.excludeFields.length > 0) {
      const excluded = new Set(['__v', ...cfg.excludeFields]);
      logger.info(`Chế độ: blacklist — loại trừ: ${[...excluded].join(', ')}`);
      return (doc: any) => {
        const { _id, ...rest } = doc;
        for (const field of excluded) delete rest[field];
        return rest;
      };
    }

    logger.info('Chế độ: mặc định — lấy tất cả (trừ __v)');
    return (doc: any) => {
      const { _id, __v, ...rest } = doc;
      return rest;
    };
  })();

  // ── 5. MongoDB projection ──────────────────────────────
  // Chỉ SELECT top-level fields cần thiết để giảm data transfer.
  // buildDoc (bước 4) vẫn là lớp lọc chính xác cuối cùng.
  const mongoProjection: Record<string, 1> | undefined =
    cfg.mapping && !cfg.buildDoc
      ? extractTopLevelFields(cfg.mapping).reduce<Record<string, 1>>(
          (acc, f) => {
            acc[f] = 1;
            return acc;
          },
          {}
        )
      : undefined;

  logger.info(`Bắt đầu migrate (batch: ${batchSize})...`);

  // ── 6. Chạy migration ─────────────────────────────────
  let result: MigrationResult;
  try {
    result = await bulkService.runMigration(
      indexName,
      (lastId, limit) =>
        cfg.model
          .find(lastId ? { _id: { $gt: lastId } } : {}, mongoProjection ?? {})
          .sort({ _id: 1 })
          .limit(limit)
          .lean(),
      buildDoc,
      total,
      batchSize
    );
  } finally {
    // Luôn restore dù thành công hay lỗi
    // → tránh index kẹt refresh_interval = '-1' sau crash
    try {
      await indexService.restoreSettings(indexName);
    } catch (restoreErr: any) {
      logger.warn(
        `Không thể restore settings cho "${indexName}": ${restoreErr?.message}`
      );
    }
  }

  // ── 7. Refresh ────────────────────────────────────────
  if (refreshOnComplete) await indexService.refresh(indexName);

  // ── 8. Stats ──────────────────────────────────────────
  await indexService.getStats(indexName);

  logger.success(`"${cfg.collectionName}" hoàn tất!`);
  logger.info(`✔ Thành công : ${result.success}`);
  logger.info(`✖ Thất bại   : ${result.failed}`);
  logger.info(`⏱ Thời gian  : ${logger.formatMs(result.duration)}`);
  logger.info(`⏱ Tổng       : ${logger.formatMs(Date.now() - startTime)}`);

  return result;
}
