// src/lib/api/twitch.ts
import axios from "axios";
import {
  TwitchProfile,
  TwitchFollowers,
  TwitchVideo,
  TwitchStream,
  TwitchChannel,
  FollowerDataPoint,
} from "@/types/twitch";

const TWITCH_API_URL = "https://api.twitch.tv/helix";

// Helper to get the access token from cookies
export const getTwitchToken = (): string | null => {
  if (typeof document === "undefined") return null;

  const cookies = document.cookie.split(";").reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split("=");
    acc[key.trim()] = value;
    return acc;
  }, {} as Record<string, string>);

  return cookies.twitch_access_token || null;
};

// Create API client with auth headers
const createTwitchClient = () => {
  const token = getTwitchToken();
  if (!token) throw new Error("Not authenticated with Twitch");

  return axios.create({
    baseURL: TWITCH_API_URL,
    headers: {
      Authorization: `Bearer ${token}`,
      "Client-Id": process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID || "",
    },
  });
};

// Get user profile information
export const getUserProfile = async (): Promise<TwitchProfile | null> => {
  try {
    const client = createTwitchClient();
    const response = await client.get("/users");
    console.log("User profile response:", response.data);
    return response.data.data[0] || null;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
};

// Get channel information
export const getChannelInfo = async (
  userId: string
): Promise<TwitchChannel | null> => {
  try {
    const client = createTwitchClient();
    const response = await client.get(`/channels?broadcaster_id=${userId}`);
    console.log("Channel info response:", response.data);
    return response.data.data[0] || null;
  } catch (error) {
    console.error("Error fetching channel info:", error);
    return null;
  }
};

// Get follower count
export const getFollowers = async (
  userId: string
): Promise<TwitchFollowers> => {
  try {
    const client = createTwitchClient();
    // Using moderator:read:followers endpoint
    const response = await client.get(
      `/channels/followers?broadcaster_id=${userId}`
    );
    console.log("Followers response:", response.data);
    return {
      total: response.data.total || 0,
      followers: response.data.data || [],
    };
  } catch (error) {
    console.error("Error fetching followers:", error);
    return { total: 0, followers: [] };
  }
};

// Get stream information (if live)
export const getStreamInfo = async (
  userId: string
): Promise<TwitchStream | null> => {
  try {
    const client = createTwitchClient();
    const response = await client.get(`/streams?user_id=${userId}`);
    console.log("Stream info response:", response.data);
    return response.data.data[0] || null;
  } catch (error) {
    console.error("Error fetching stream info:", error);
    return null;
  }
};

// Get videos (past broadcasts)
export const getVideos = async (
  userId: string,
  limit = 5
): Promise<TwitchVideo[]> => {
  try {
    const client = createTwitchClient();
    const response = await client.get(
      `/videos?user_id=${userId}&first=${limit}`
    );
    console.log("Videos response:", response.data);
    return response.data.data || [];
  } catch (error) {
    console.error("Error fetching videos:", error);
    return [];
  }
};

// Generate monthly follower history
export const generateFollowerHistory = (
  totalFollowers: number
): FollowerDataPoint[] => {
  // Calculate a reasonable growth curve based on total followers
  const growthPercentage = 0.08; // Assume 8% monthly growth
  const currentMonth = new Date().getMonth();
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  // Get the last 5 months
  const months = [];
  for (let i = 4; i >= 0; i--) {
    const monthIndex = (currentMonth - i + 12) % 12;
    months.push(monthNames[monthIndex]);
  }

  // Calculate follower count for each month
  const followerData: FollowerDataPoint[] = [];
  const currentFollowers = totalFollowers;

  for (let i = 0; i < 5; i++) {
    const monthlyFollowers = Math.round(
      currentFollowers / Math.pow(1 + growthPercentage, 4 - i)
    );

    followerData.push({
      name: months[i],
      Twitch: monthlyFollowers,
    });
  }

  return followerData;
};
