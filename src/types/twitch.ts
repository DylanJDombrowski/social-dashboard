// types/twitch.ts

export interface TwitchTokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  scope: string[];
  token_type: string;
}

export interface TwitchUser {
  id: string;
  login: string;
  display_name: string;
  type: string;
  broadcaster_type: string;
  description: string;
  profile_image_url: string;
  offline_image_url: string;
  view_count: number;
  email?: string;
  created_at: string;
}

export interface TwitchUserResponse {
  data: TwitchUser[];
}

export interface TwitchUserInfo {
  id: string;
  login: string;
  display_name: string;
  profile_image_url: string;
  authenticated: boolean;
  expires_at: string;
}

export interface TwitchAuthError {
  error: string;
  status: number;
  message: string;
}
