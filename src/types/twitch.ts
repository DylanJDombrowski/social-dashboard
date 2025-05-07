// src/types/twitch.ts

export interface TwitchProfile {
  id: string;
  login: string;
  display_name: string;
  profile_image_url: string;
  view_count: number;
  description?: string;
  broadcaster_type: string;
  created_at?: string;
  email?: string;
}

export interface TwitchFollowers {
  total: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  followers: any[];
}

export interface TwitchVideo {
  id: string;
  user_id: string;
  user_name: string;
  title: string;
  description: string;
  created_at: string;
  published_at: string;
  url: string;
  thumbnail_url: string;
  viewable: string;
  view_count: number;
  language: string;
  type: string;
  duration: string;
}

export interface TwitchStream {
  id: string;
  user_id: string;
  user_name: string;
  game_id: string;
  game_name: string;
  type: string;
  title: string;
  viewer_count: number;
  started_at: string;
  language: string;
  thumbnail_url: string;
  tag_ids: string[];
  is_mature: boolean;
}

export interface TwitchChannel {
  broadcaster_id: string;
  broadcaster_login: string;
  broadcaster_name: string;
  broadcaster_language: string;
  game_id: string;
  game_name: string;
  title: string;
  delay: number;
}

export interface FollowerDataPoint {
  name: string;
  Twitch: number;
}

export interface TwitchData {
  profile: TwitchProfile | null;
  followers: TwitchFollowers;
  videos: TwitchVideo[];
  isLive: boolean;
  streamInfo: TwitchStream | null;
  channelInfo: TwitchChannel | null;
  followerHistory: FollowerDataPoint[];
}
