export const APP_TOKEN_SECRET: string = process.env.APP_TOKEN_SECRET!.replace(
  /\\n/g,
  '\n'
);
export const APP_TOKEN_SECRET_VERIFY: string =
  process.env.APP_TOKEN_SECRET_VERIFY!.replace(/\\n/g, '\n');

export const SHORT_DATA_MOVIE_SELECT = {
  id: 1,
  media_type: 1,
  name: 1,
  type: 1,
  order: 1,
  path: 1,
  movieData: {
    adult: 1,
    backdrop_path: 1,
    release_date: 1,
    first_air_date: 1,
    last_air_date: 1,
    id: 1,
    modId: 1,
    id_number: 1,
    name: 1,
    original_name: 1,
    original_language: 1,
    origin_country: 1,
    overview: 1,
    poster_path: 1,
    media_type: 1,
    genres: 1,
    runtime: 1,
    episode_run_time: 1,
    dominant_backdrop_color: 1,
    dominant_poster_color: 1,
    views: 1,
    vip: 1,
    vote_average: 1,
    vote_count: 1,
    page_tmdb: 1,
    created_at: 1,
    updated_at: 1,
    createdAt: 1,
    updatedAt: 1
  }
};
