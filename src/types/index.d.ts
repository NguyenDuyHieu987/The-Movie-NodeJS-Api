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
  role: string;
  avatar: string | number;
  auth_type: string;
  created_at?: string;
};
