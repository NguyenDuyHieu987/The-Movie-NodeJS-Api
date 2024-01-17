export declare type TImage = {
  backdrops: Array;
  logos: Array;
  posters: Array;
};

export declare type TCredit = {
  cast: Array;
  crew: Array;
};

export declare type RoleUser = 'normal' | 'admin';

export declare type User = {
  id: string;
  username: string;
  full_name: string;
  email: string;
  role: RoleUser;
  avatar: string;
  auth_type: string | 'email' | 'facebook' | 'google';
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

export type PaymentMethods = 'MOMO' | 'ZALOPAY' | 'VNPAY' | 'STRIPE';
