import mongoose from 'mongoose';
import type { MappingTypeMapping } from '@elastic/elasticsearch/lib/api/types';

// ── Pattern nhận diện thông minh cho String ───────────────────────────────

const TEXT_PATTERNS = [
  /overview/,
  /description/,
  /summary/,
  /content/,
  /body/,
  /bio/,
  /tagline/,
  /caption/,
  /note$/,
  /comment/,
  /review/,
  /plot/,
  /synopsis/,
  /detail/,
  /about/,
  /message/,
  /text$/
];

const KEYWORD_PATTERNS = [
  /^id$/i,
  /_id$/i,
  /^id_/,
  /slug/,
  /code/,
  /token/,
  /hash/,
  /^key/,
  /path$/,
  /url$/,
  /link$/,
  /href$/,
  /src$/,
  /type$/,
  /status$/,
  /state$/,
  /role$/,
  /gender$/,
  /format$/,
  /media_type/,
  /language$/,
  /country$/,
  /^iso_/,
  /locale$/,
  /color$/,
  /colour$/,
  /extension$/,
  /mime$/,
  /site$/,
  /platform$/,
  /department$/,
  /job$/,
  /^homepage$/,
  /^phone/,
  /^email/
];

function detectStringMapping(fieldName: string): Record<string, any> {
  const name = fieldName.toLowerCase();

  if (TEXT_PATTERNS.some((p) => p.test(name)))
    return {
      type: 'text',
      analyzer: 'standard',
      fields: { keyword: { type: 'keyword', ignore_above: 256 } }
    };

  if (KEYWORD_PATTERNS.some((p) => p.test(name))) return { type: 'keyword' };

  if (/name$|^name|title/.test(name))
    return {
      type: 'text',
      analyzer: 'standard',
      fields: { keyword: { type: 'keyword', ignore_above: 256 } }
    };

  return { type: 'keyword' };
}

// depth: 0 = top-level, 1 = 1 cấp lồng, 2+ = disabled
function schemaTypeToES(
  schemaType: mongoose.SchemaType,
  fieldName: string,
  depth = 0
): Record<string, any> {
  const instance = (schemaType as any).instance as string;

  switch (instance) {
    case 'ObjectId':
      return { type: 'keyword' };
    case 'Boolean':
      return { type: 'boolean' };
    case 'Date':
      return { type: 'date' };
    case 'Number':
      return { type: 'float' };
    case 'String':
      return detectStringMapping(fieldName);

    case 'Array': {
      const caster = (schemaType as any).caster;
      if (!caster) return { type: 'keyword' };

      if (caster.schema) {
        if (depth >= 1) return { type: 'object', enabled: false };
        return {
          type: 'nested',
          properties: schemaToProperties(caster.schema, depth + 1)
        };
      }
      return schemaTypeToES(caster, fieldName, depth);
    }

    case 'Embedded':
    case 'Subdocument': {
      if (depth >= 1) return { type: 'object', enabled: false };
      const subSchema = (schemaType as any).schema;
      return subSchema
        ? {
            type: 'object',
            properties: schemaToProperties(subSchema, depth + 1)
          }
        : { type: 'object', enabled: false };
    }

    case 'Map':
    case 'Mixed':
      return { type: 'object', enabled: false };

    default:
      return { type: 'keyword' };
  }
}

function schemaToProperties(
  schema: mongoose.Schema,
  depth = 0
): Record<string, any> {
  const properties: Record<string, any> = {};

  schema.eachPath((pathName, schemaType) => {
    if (['_id', '__v'].includes(pathName)) return;
    if (pathName.includes('.')) return;
    properties[pathName] = schemaTypeToES(schemaType, pathName, depth);
  });

  return properties;
}

// ── Public exports ────────────────────────────────────────────────────────

export function inferMappingFromModel(
  model: mongoose.Model<any>
): MappingTypeMapping {
  return { properties: schemaToProperties(model.schema) };
}

// Dùng console trực tiếp để tránh circular import với logger
export function logMapping(properties: Record<string, any>, indent = 0): void {
  const pad = ' '.repeat(indent);
  for (const [field, def] of Object.entries(properties)) {
    const type = (def as any).type ?? 'object';
    const notIdx = (def as any).index === false ? ' (not indexed)' : '';
    const nested = type === 'nested' ? ' [nested]' : '';
    console.log(
      `${pad}  ${field.padEnd(28 - indent)} → ${type}${nested}${notIdx}`
    );
    if ((def as any).properties) {
      logMapping((def as any).properties, indent + 4);
    }
  }
}
