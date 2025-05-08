// src/lib/api/youtube.ts
import axios from "axios";
import {
  YouTubeChannel,
  YouTubeVideo,
  SubscriberDataPoint,
  YouTubeChannelResponse,
  YouTubeVideosResponse,
  YouTubeSubscriptionResponse,
} from "@/types/youtube";

const YOUTUBE_API_URL = "https://www.googleapis.com/youtube/v3";

// Helper to get the access token from cookies
export const getYouTubeToken = (): string | null => {
  if (typeof document === "undefined") return null;

  const cookies = document.cookie.split(";").reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split("=");
    acc[key.trim()] = value;
    return acc;
  }, {} as Record<string, string>);

  return cookies.youtube_access_token || null;
};

// Create API client with auth headers
const createYouTubeClient = () => {
  const token = getYouTubeToken();
  if (!token) throw new Error("Not authenticated with YouTube");

  return axios.create({
    baseURL: YOUTUBE_API_URL,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// Get the authenticated user's YouTube channel
export const getChannelInfo = async (): Promise<YouTubeChannel | null> => {
  try {
    const client = createYouTubeClient();
    const response = await client.get<YouTubeChannelResponse>("/channels", {
      params: {
        part: "snippet,statistics",
        mine: true,
      },
    });
    console.log("Channel info response:", response.data);
    return response.data.items[0] || null;
  } catch (error) {
    console.error("Error fetching channel info:", error);
    return null;
  }
};

// Get the authenticated user's most recent videos
export const getVideos = async (maxResults = 10): Promise<YouTubeVideo[]> => {
  try {
    const client = createYouTubeClient();

    // First, get the channel ID
    const channelInfo = await getChannelInfo();
    if (!channelInfo) throw new Error("Could not fetch channel info");

    const channelId = channelInfo.id;

    // Then, get the channel's uploads
    const response = await client.get<YouTubeVideosResponse>("/search", {
      params: {
        part: "snippet",
        channelId,
        maxResults,
        order: "date",
        type: "video",
      },
    });

    // If we have videos, get the full details for each one
    if (response.data.items.length > 0) {
      const videoIds = response.data.items.map((item) => item.id);

      const videoDetails = await client.get<YouTubeVideosResponse>("/videos", {
        params: {
          part: "snippet,contentDetails,statistics",
          id: videoIds.join(","),
        },
      });

      console.log("Videos response:", videoDetails.data);
      return videoDetails.data.items || [];
    }

    return [];
  } catch (error) {
    console.error("Error fetching videos:", error);
    return [];
  }
};

// Get the channel's subscribers
export const getSubscribers = async (): Promise<number> => {
  try {
    const channelInfo = await getChannelInfo();
    return channelInfo ? parseInt(channelInfo.statistics.subscriberCount) : 0;
  } catch (error) {
    console.error("Error fetching subscribers:", error);
    return 0;
  }
};

// Get video views for a specific video
export const getVideoViews = async (videoId: string): Promise<number> => {
  try {
    const client = createYouTubeClient();
    const response = await client.get<YouTubeVideosResponse>("/videos", {
      params: {
        part: "statistics",
        id: videoId,
      },
    });

    const video = response.data.items[0];
    return video ? parseInt(video.statistics.viewCount) : 0;
  } catch (error) {
    console.error("Error fetching video views:", error);
    return 0;
  }
};

// Get the channel's total view count
export const getTotalViews = async (): Promise<number> => {
  try {
    const channelInfo = await getChannelInfo();
    return channelInfo ? parseInt(channelInfo.statistics.viewCount) : 0;
  } catch (error) {
    console.error("Error fetching total views:", error);
    return 0;
  }
};

// Get the channel's subscriber growth (mock data for now)
export const generateSubscriberHistory = (
  totalSubscribers: number
): SubscriberDataPoint[] => {
  // Calculate a reasonable growth curve based on total subscribers
  const growthPercentage = 0.05; // Assume 5% monthly growth
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

  // Calculate subscriber count for each month
  const subscriberData: SubscriberDataPoint[] = [];
  const currentSubscribers = totalSubscribers;

  for (let i = 0; i < 5; i++) {
    const monthlySubscribers = Math.round(
      currentSubscribers / Math.pow(1 + growthPercentage, 4 - i)
    );

    subscriberData.push({
      name: months[i],
      YouTube: monthlySubscribers,
    });
  }

  return subscriberData;
};

// Get a list of subscribers (note: YouTube API doesn't allow listing individual subscribers)
export const getSubscriptionList = async (
  maxResults = 10
): Promise<YouTubeSubscriptionResponse> => {
  try {
    const client = createYouTubeClient();
    const response = await client.get<YouTubeSubscriptionResponse>(
      "/subscriptions",
      {
        params: {
          part: "snippet",
          mine: true,
          maxResults,
        },
      }
    );

    console.log("Subscriptions response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching subscriptions:", error);
    return {
      items: [],
      pageInfo: {
        totalResults: 0,
        resultsPerPage: 0,
      },
    };
  }
};

// Format YouTube's ISO 8601 duration to a readable format
export const formatYouTubeDuration = (duration: string): string => {
  // Convert ISO 8601 duration format (e.g., "PT1H2M3S") to a readable format
  if (!duration) return "Unknown";

  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);

  if (!match) return duration;

  const hours = parseInt(match[1] || "0");
  const minutes = parseInt(match[2] || "0");
  const seconds = parseInt(match[3] || "0");

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  } else {
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }
};
