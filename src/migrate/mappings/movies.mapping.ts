import type { MappingTypeMapping } from '@elastic/elasticsearch/lib/api/types';

export const moviesMapping: MappingTypeMapping = {
  // dynamic: false — ES chỉ index các field được khai báo tường minh
  // Field lạ vẫn được lưu trong _source nhưng KHÔNG tạo mapping mới
  // → tránh mapping explosion khi document có field ngoài dự kiến
  dynamic: false,
  properties: {
    // ── Định danh ────────────────────────────────────────
    id: { type: 'keyword' },
    id_number: { type: 'integer' },
    media_type: { type: 'keyword' },

    // ── Fulltext search ───────────────────────────────────
    title: {
      type: 'text',
      analyzer: 'standard',
      fields: { keyword: { type: 'keyword' } }
    },
    name: {
      type: 'text',
      analyzer: 'standard',
      fields: { keyword: { type: 'keyword' } }
    },
    original_name: { type: 'text', analyzer: 'standard' },
    overview: { type: 'text', analyzer: 'standard' },
    tagline: { type: 'text', analyzer: 'standard' },

    // ── Filter / Sort ─────────────────────────────────────
    status: { type: 'keyword' },
    adult: { type: 'boolean' },
    vip: { type: 'integer' },
    views: { type: 'integer' },
    popularity: { type: 'float' },
    vote_average: { type: 'float' },
    vote_count: { type: 'integer' },
    runtime: { type: 'integer' },
    duration: { type: 'integer' },
    original_language: { type: 'keyword' },
    origin_country: { type: 'keyword' },
    release_date: {
      type: 'date',
      format: 'yyyy-MM-dd||strict_date_optional_time||epoch_millis',
      ignore_malformed: true
    },
    first_air_date: {
      type: 'date',
      format: 'yyyy-MM-dd||strict_date_optional_time||epoch_millis',
      ignore_malformed: true
    },
    number_of_seasons: { type: 'integer' },
    number_of_episodes: { type: 'integer' },
    budget: { type: 'long' },
    revenue: { type: 'long' },

    // ── Genres ────────────────────────────────────────────
    genres: {
      type: 'object',
      dynamic: false,
      properties: {
        id: { type: 'integer' },
        name: { type: 'keyword' }
      }
    },

    // ── Production companies ──────────────────────────────
    production_companies: {
      type: 'object',
      dynamic: false,
      properties: {
        id: { type: 'integer' },
        name: { type: 'keyword' },
        origin_country: { type: 'keyword' },
        logo_path: { type: 'keyword', index: false }
      }
    },

    // ── Credits ───────────────────────────────────────────
    credits: {
      type: 'object',
      dynamic: false,
      properties: {
        cast: {
          type: 'nested',
          dynamic: false,
          properties: {
            id: { type: 'integer' },
            name: { type: 'text', fields: { keyword: { type: 'keyword' } } },
            character: { type: 'text' },
            order: { type: 'integer' },
            profile_path: { type: 'keyword', index: false }
          }
        },
        crew: {
          type: 'nested',
          dynamic: false,
          properties: {
            id: { type: 'integer' },
            name: { type: 'text', fields: { keyword: { type: 'keyword' } } },
            job: { type: 'keyword' },
            department: { type: 'keyword' },
            profile_path: { type: 'keyword', index: false }
          }
        }
      }
    },

    // ── Spoken languages ──────────────────────────────────
    spoken_languages: {
      type: 'object',
      dynamic: false,
      properties: {
        iso_639_1: { type: 'keyword' },
        name: { type: 'keyword' },
        english_name: { type: 'keyword' }
      }
    },

    // ── Ảnh (lưu trong _source nhưng không index) ─────────
    poster_path: { type: 'keyword', index: false },
    backdrop_path: { type: 'keyword', index: false },
    dominant_poster_color: { type: 'float', index: false },
    dominant_backdrop_color: { type: 'float', index: false },

    // ── Timestamps ────────────────────────────────────────
    createdAt: { type: 'date' },
    updatedAt: { type: 'date' },
    created_at: { type: 'date' },
    updated_at: { type: 'date' }
  }
};
