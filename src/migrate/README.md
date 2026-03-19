# Elasticsearch Migration

Migrate data từ MongoDB sang Elasticsearch.  
Hỗ trợ mapping file tường minh, tự infer từ Mongoose schema, cursor-based pagination, retry tự động.

## Cấu trúc

```
migrate/
├── mappings/                 ← Mapping file cho từng collection
│   ├── movies.mapping.ts
│   └── users.mapping.ts
├── migrate.config.ts         ← Đăng ký collections
├── index.ts                  ← CLI entry point
├── config/index.ts           ← Global config (batch size...)
├── services/
│   ├── indexService.ts       ← Tạo / xóa / refresh ES index
│   ├── bulkService.ts        ← Bulk insert với retry + cursor pagination
│   └── migrationRunner.ts    ← Orchestrator
├── utils/
│   └── schemaInferrer.ts     ← Infer ES mapping từ Mongoose schema
└── types/index.ts
```

## Setup

```bash
npm install @elastic/elasticsearch
```

```json
// package.json
"scripts": {
  "migrate:es": "ts-node -r tsconfig-paths/register src/migrate/index.ts"
}
```

## Cách dùng

```bash
npm run migrate:es                    # migrate tất cả collections
npm run migrate:es -- --drop          # migrate tất cả + reset index cũ
npm run migrate:es -- movies          # chỉ 1 collection
npm run migrate:es -- movies users    # nhiều collections
npm run migrate:es -- movies --drop   # reset + migrate movies
```

## Thêm collection mới

### Bước 1 — Tạo file mapping

```typescript
// mappings/users.mapping.ts
import type { MappingTypeMapping } from '@elastic/elasticsearch/lib/api/types'

export const usersMapping: MappingTypeMapping = {
  properties: {
    username:   { type: 'text', fields: { keyword: { type: 'keyword' } } },
    email:      { type: 'keyword' },
    role:       { type: 'keyword' },
    createdAt:  { type: 'date' },
  },
}
```

### Bước 2 — Đăng ký trong migrate.config.ts

```typescript
import User from '@/models/user'
import { usersMapping } from './mappings/users.mapping'

{
  collectionName: 'users',
  model: User,
  mapping: usersMapping,
}
```

## Thứ tự ưu tiên buildDoc

| Ưu tiên | Config | Hành vi |
|---|---|---|
| 1 | `buildDoc` | Toàn quyền transform, ghi đè tất cả |
| 2 | `mapping`  | Whitelist tự động từ `mapping.properties` keys |
| 3 | `excludeFields` | Lấy tất cả, loại trừ các trường chỉ định |
| 4 | mặc định | Lấy tất cả (trừ `__v`) |

## Lưu ý khi dùng nested vs object

| Kiểu | Dùng khi |
|---|---|
| `nested` | Cần query kết hợp nhiều field trong cùng 1 phần tử array (vd: `cast.name` + `cast.character`) |
| `object` | Chỉ filter theo 1 field, hoặc không cần query kết hợp (vd: `genres.name`) |

`nested` tốn RAM hơn vì ES lưu mỗi phần tử array như 1 hidden document.
Mặc định dùng `object`, chỉ nâng lên `nested` khi cần thiết.
