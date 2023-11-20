export declare type image = {
  backdrops: Array;
  logos: Array;
  posters: Array;
};

export declare type credit = {
  cast: Array;
  crew: Array;
};

export declare type user = {
  id: string;
  username: string;
  full_name: string;
  email: string;
  role: 'normal' | 'admin';
  avatar: string;
  auth_type: 'email' | 'facebook' | 'google';
  created_at: string;
  updated_at?: string;
};

export declare type SigupForm = {
  id: string;
  username: string;
  password: string;
  full_name: string;
  email: string;
  role: 'normal' | 'admin';
  avatar: string;
  auth_type: 'email' | 'facebook' | 'google';
  created_at: string;
  updated_at: string;
};

export declare type commentForm = {
  id: String;
  user_id: String;
  movie_id: String;
  content: String;
  username: String;
  user_avatar: String;
  movie_type: String;
  parent_id?: String = null;
  type: 'children' | 'parent';
  childrens?: Number;
  updated: Boolean;
  created_at?: string;
  updated_at?: string;
};

export type PaymentMethods = 'MOMO' | 'ZALOPAY' | 'VNPAY' | 'STRIPE';
