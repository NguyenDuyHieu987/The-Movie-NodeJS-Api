import Movie from '@/models/movie';
// import User   from '@/models/user'
// import Genre  from '@/models/genre'

import { CollectionMigrateConfig } from './types';
import { moviesMapping } from './mappings/movies.mapping';
// import { usersMapping }  from './mappings/users.mapping'

const migrateConfig: CollectionMigrateConfig[] = [
  {
    collectionName: 'movies',
    model: Movie,
    // indexName: 'phim',   // optional: tên index khác tên collection

    // ── Cách 1 (khuyên dùng): mapping file tường minh ─────────────────
    //   • ES tạo index đúng type/analyzer/nested theo file
    //   • MongoDB tự động chỉ SELECT các trường có trong mapping
    //   • buildDoc tự extract whitelist từ mapping.properties
    mapping: moviesMapping

    // ── Cách 2: blacklist — lấy tất cả, loại trừ trường nặng ──────────
    // excludeFields: ['videos', 'images', 'rawData'],

    // ── Cách 3: buildDoc tuỳ chỉnh — toàn quyền, ưu tiên cao nhất ─────
    // buildDoc: (doc) => ({
    //   title:   doc.title,
    //   slug:    doc.slug,
    //   genres:  doc.genres?.map((g: any) => ({ id: g.id, name: g.name })),
    // }),

    // options: { batchSize: 200, dropIfExists: true },
  }

  // {
  //   collectionName: 'users',
  //   model: User,
  //   mapping: usersMapping,
  // },
];

export default migrateConfig;
