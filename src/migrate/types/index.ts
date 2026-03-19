import type { Model } from 'mongoose';
import type { MappingTypeMapping } from '@elastic/elasticsearch/lib/api/types';

// ── Per-collection config ─────────────────────────────────────────────────
export interface CollectionMigrateConfig {
  collectionName: string;
  model: Model<any>;
  indexName?: string; // mặc định = collectionName.toLowerCase()
  mapping?: MappingTypeMapping; // mapping tường minh (khuyên dùng) — nếu bỏ qua thì tự infer từ Mongoose schema
  excludeFields?: string[]; // blacklist: loại trừ trường khi không dùng mapping (bị bỏ qua nếu đã có mapping)
  buildDoc?: (doc: any) => Record<string, any>; // custom transform — ưu tiên cao nhất, ghi đè mapping/excludeFields
  options?: MigrationOptions;
}

// ── Migration options ─────────────────────────────────────────────────────
export interface MigrationOptions {
  batchSize?: number;
  dropIfExists?: boolean;
  refreshOnComplete?: boolean;
}

// ── Result / progress ─────────────────────────────────────────────────────
export interface MigrationResult {
  collectionName: string;
  total: number;
  success: number;
  failed: number;
  duration: number;
}

export interface BulkError {
  id: string;
  reason: string;
}

export interface MigrationProgress {
  current: number;
  total: number;
  percent: string;
  elapsed: string;
}
