import type { MappingTypeMapping } from '@elastic/elasticsearch/lib/api/types';
import esClient from '@/config/elasticsearch';
import { logger } from '@/utils/logger';

// Settings tối ưu khi migrate: tắt refresh và replica để ghi nhanh nhất
const MIGRATE_SETTINGS = {
  number_of_shards: 1,
  number_of_replicas: 0,
  refresh_interval: '-1'
} as const;

// Settings khôi phục sau migrate
// Giữ replicas = 0 nếu single-node cluster, đổi thành 1 nếu có replica node
const PRODUCTION_SETTINGS = {
  number_of_replicas: 0,
  refresh_interval: '1s'
} as const;

export const indexService = {
  async exists(index: string): Promise<boolean> {
    return esClient.indices.exists({ index });
  },

  async create(index: string, mapping: MappingTypeMapping): Promise<void> {
    await esClient.indices.create({
      index,
      settings: MIGRATE_SETTINGS,
      mappings: mapping
    });
    logger.success(`Index "${index}" đã được tạo`);
  },

  async delete(index: string): Promise<void> {
    await esClient.indices.delete({ index });
    logger.warn(`Index "${index}" đã bị xóa`);
  },

  async reset(index: string, mapping: MappingTypeMapping): Promise<void> {
    if (await this.exists(index)) await this.delete(index);
    await this.create(index, mapping);
  },

  // Luôn gọi sau migrate (kể cả khi có lỗi) để index không bị kẹt
  // ở trạng thái refresh_interval = '-1' gây mất dữ liệu trên restart
  async restoreSettings(index: string): Promise<void> {
    await esClient.indices.putSettings({
      index,
      settings: PRODUCTION_SETTINGS
    });
    logger.info(`Index "${index}" đã khôi phục production settings`);
  },

  async refresh(index: string): Promise<void> {
    await esClient.indices.refresh({ index });
    logger.success(`Index "${index}" đã được refresh`);
  },

  async getStats(index: string): Promise<void> {
    const stats = await esClient.indices.stats({ index });
    const count = stats.indices?.[index]?.total?.docs?.count ?? 0;
    const bytes = stats.indices?.[index]?.total?.store?.size_in_bytes ?? 0;
    logger.info(
      `Stats: ${count} documents | ${(bytes / 1024 / 1024).toFixed(2)} MB`
    );
  }
};
