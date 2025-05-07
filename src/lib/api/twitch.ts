import axios, { AxiosError, AxiosRequestConfig } from "axios";

const TWITCH_API_URL = "https://api.twitch.tv/helix";

// Create an axios instance for Twitch API requests
const createTwitchClient = (accessToken: string) => {
  const client = axios.create({
    baseURL: TWITCH_API_URL,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Client-Id": process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID || "",
    },
  });

  // Add response interceptor to handle token refresh
  client.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as AxiosRequestConfig & {
        _retry?: boolean;
      };

      // If error is 401 and we haven't retried yet
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          // Try to refresh the token
          await fetch("/api/auth/twitch/refresh");

          // Get new token from cookie
          const cookies = document.cookie.split(";").reduce((acc, cookie) => {
            const [key, value] = cookie.trim().split("=");
            acc[key] = value;
            return acc;
          }, {} as Record<string, string>);

          const newToken = cookies.twitch_access_token;

          // Update Authorization header
          if (originalRequest.headers) {
            originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
          }

          // Retry the request
          return axios(originalRequest);
        } catch (refreshError) {
          // If refresh fails, redirect to home page
          window.location.href = "/?error=session_expired";
          return Promise.reject(refreshError);
        }
      }

      return Promise.reject(error);
    }
  );

  return client;
};

// Helper function to get token from cookies (client side)
export const getTwitchToken = () => {
  if (typeof document === "undefined") return null;

  const cookies = document.cookie.split(";").reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split("=");
    acc[key] = value;
    return acc;
  }, {} as Record<string, string>);

  return cookies.twitch_access_token;
};

// API functions

// Get user profile
export const getUserProfile = async () => {
  const token = getTwitchToken();
  if (!token) throw new Error("Not authenticated with Twitch");

  const client = createTwitchClient(token);
  const response = await client.get("/users");
  return response.data.data[0];
};

// Get follower count
export const getFollowerCount = async () => {
  const token = getTwitchToken();
  if (!token) throw new Error("Not authenticated with Twitch");

  const client = createTwitchClient(token);
  const user = await getUserProfile();

  const response = await client.get("/channels/followers", {
    params: { broadcaster_id: user.id },
  });

  return response.data.total;
};

// Get channel analytics
export const getChannelAnalytics = async () => {
  const token = getTwitchToken();
  if (!token) throw new Error("Not authenticated with Twitch");

  const client = createTwitchClient(token);
  const user = await getUserProfile();

  const response = await client.get("/analytics/channels", {
    params: {
      broadcaster_id: user.id,
    },
  });

  return response.data.data;
};

// Get stream information
export const getStreamInfo = async () => {
  const token = getTwitchToken();
  if (!token) throw new Error("Not authenticated with Twitch");

  const client = createTwitchClient(token);
  const user = await getUserProfile();

  const response = await client.get("/streams", {
    params: { user_id: user.id },
  });

  return response.data.data[0] || null; // Return stream data or null if not live
};

// Check if authenticated with Twitch
export const checkTwitchAuth = async () => {
  try {
    await getUserProfile();
    return true;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return false;
  }
};
