export declare type TImage = {
  backdrops: Array;
  logos: Array;
  posters: Array;
};

export declare type TCredit = {
  cast: Array;
  crew: Array;
};

export declare interface ModForm {
  id: string;
  media_type: string;
  name: string;
  type: string;
  order: number;
  path: string;
}

export declare interface ModListForm {
  _id: string;
  id: string;
  listMovieId: string[] | number[];
  modId: string;
}

export declare type RoleUser = 'normal' | 'admin';

export declare type User = {
  id: string;
  username: string;
  full_name: string;
  email: string;
  password: string;
  role: RoleUser;
  avatar: string;
  auth_type: string | 'email' | 'facebook' | 'google';
  status: string | 'active' | 'banned' | 'deleted';
  created_at: Date;
  updated_at: Date;
  createdAt?: Date;
  updatedAt?: Date;
};

export declare type SignupForm = {
  id: string;
  username: string;
  password: string;
  full_name: string;
  email: string;
  role: 'normal' | 'admin';
  avatar: string;
  auth_type: 'email' | 'facebook' | 'google';
  created_at: Date;
  updated_at: Date;
  createdAt?: Date;
  updatedAt?: Date;
};

export declare type CommentForm = {
  id: string;
  user_id: string;
  movie_id: string;
  content: string;
  username: string;
  user_avatar: string;
  movie_type: string;
  parent_id?: string | null;
  reply_to?: string | null;
  type: 'children' | 'parent';
  like: number;
  dislike: number;
  childrens?: number;
  updated: boolean | false;
  created_at: Date;
  updated_at: Date;
  createdAt?: Date;
  updatedAt?: Date;
};

export declare type LiveCommentForm = {
  id: string;
  user_id: string;
  broadcast_id: string;
  movie_id: string;
  content: string;
  timestamp: string;
  author: User;
  movie_type: string;
  parent_id?: string | null;
  reply_to?: string | null;
  type: 'children' | 'parent';
  created_at: Date;
  updated_at: Date;
  createdAt?: Date;
  updatedAt?: Date;
};

export declare type GenreForm = {
  _id: string;
  id: number;
  name: string;
  english_name: string;
  short_name: string;
};

export declare interface CountryForm {
  _id: string;
  iso_639_1: string;
  english_name: string;
  name: string;
  short_name: string;
}

export declare interface YearForm {
  _id: string;
  name: string;
}

export declare type MovieForm = {
  adult: boolean;
  backdrop_path: string;
  belongs_to_collection: Object;
  budget: number;
  genres: GenreForm[];
  homepage: string;
  id: string;
  season_id: string;
  series_id: string;
  imdb_id: string;
  name: string;
  original_language: string;
  original_name: string;
  overview: string;
  popularity: number;
  poster_path: string;
  production_companies: string[];
  production_countries: string[];
  release_date: string;
  revenue: number;
  runtime: number;
  spoken_languages: string[];
  status: string;
  tagline: string;
  media_type: string;
  video: boolean;
  vote_average: number;
  vote_count: number;
  dominant_backdrop_color: string[];
  dominant_poster_color: string[];
  views: number;
  vip: number | string;
  created_at: Date;
  updated_at: Date;
  createdAt?: Date;
  updatedAt?: Date;
};

export declare type EpisodeForm = {
  id: string;
  movie_id: string;
  season_id: string;
  series_id: string;
  name: string;
  overview: string;
  episode_type: string;
  episode_number: number;
  still_path: string;
  video_path: string;
  air_date: string;
  runtime: number;
  duration: number;
  vote_average: number;
  vote_count: number;
  dominant_still_color: string[];
  views: number;
  vip: number | string;
  created_at: Date;
  updated_at: Date;
  createdAt?: Date;
  updatedAt?: Date;
};

export type PaymentMethods = 'MOMO' | 'ZALOPAY' | 'VNPAY' | 'STRIPE';

export declare interface BroadcastForm {
  id: string;
  movie_id: string;
  episode_id: string;
  type: string;
  number_of_interactions: Number;
  backdrop_path: string;
  poster_path: string;
  release_time: string;
  name: string;
  description: string;
  created_at: Date;
  updated_at: Date;
  createdAt?: Date;
  updatedAt?: Date;
}
