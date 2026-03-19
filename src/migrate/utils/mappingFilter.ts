import type { MappingTypeMapping } from '@elastic/elasticsearch/lib/api/types';

type MappingProperties = Record<string, any>;

/**
 * Lọc sâu một document theo cấu trúc mapping.
 * Chỉ giữ lại field được khai báo trong mapping.properties (ở mọi cấp độ).
 * Field thừa từ MongoDB (cast_id, gender, known_for_department...) bị loại bỏ hoàn toàn.
 */
export function filterDocByMapping(
  doc: Record<string, any>,
  mapping: MappingTypeMapping
): Record<string, any> {
  return filterByProperties(doc, mapping.properties ?? {});
}

function filterByProperties(
  obj: Record<string, any>,
  properties: MappingProperties
): Record<string, any> {
  const result: Record<string, any> = {};

  for (const [field, def] of Object.entries(properties)) {
    if (!Object.prototype.hasOwnProperty.call(obj, field)) continue;

    const value = obj[field];
    if (value === undefined || value === null) {
      result[field] = value;
      continue;
    }

    const type = def.type;

    // nested: array of objects → lọc từng phần tử
    if (type === 'nested' && def.properties) {
      if (Array.isArray(value)) {
        result[field] = value.map((item: any) =>
          typeof item === 'object' && item !== null
            ? filterByProperties(item, def.properties)
            : item
        );
      } else {
        result[field] = value;
      }
      continue;
    }

    // object với properties → đệ quy
    if (type === 'object' && def.properties) {
      if (typeof value === 'object' && !Array.isArray(value)) {
        result[field] = filterByProperties(value, def.properties);
      } else if (Array.isArray(value)) {
        // object nhưng trong MongoDB lưu dạng array (edge case)
        result[field] = value.map((item: any) =>
          typeof item === 'object' && item !== null
            ? filterByProperties(item, def.properties)
            : item
        );
      } else {
        result[field] = value;
      }
      continue;
    }

    // Primitive hoặc object không có properties (enabled: false) → giữ nguyên
    result[field] = value;
  }

  return result;
}

/**
 * Extract danh sách top-level field từ mapping.
 * Dùng để build MongoDB projection.
 */
export function extractTopLevelFields(mapping: MappingTypeMapping): string[] {
  return Object.keys(mapping.properties ?? {});
}
