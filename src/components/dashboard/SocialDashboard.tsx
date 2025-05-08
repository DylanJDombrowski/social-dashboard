// src/components/dashboard/SocialDashboard.tsx
"use client";

import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Settings,
  User,
  TrendingUp,
  Clock,
  MessageSquare,
  Home,
  BarChart2,
  Video,
  Users,
  Activity,
  Bell,
  ExternalLink,
} from "lucide-react";

// Twitch imports
import {
  getUserProfile,
  getFollowers,
  getChannelInfo as getTwitchChannelInfo,
  getStreamInfo,
  getVideos as getTwitchVideos,
  generateFollowerHistory,
} from "@/lib/api/twitch";

// YouTube imports
import {
  getChannelInfo as getYouTubeChannelInfo,
  getSubscribers,
  getVideos as getYouTubeVideos,
  generateSubscriberHistory,
  formatYouTubeDuration,
} from "@/lib/api/youtube";

// Import types
import {
  YouTubeChannel,
  YouTubeVideo,
  SubscriberDataPoint,
} from "@/types/youtube";

// Define interfaces for Twitch API responses
interface TwitchProfile {
  id: string;
  login: string;
  display_name: string;
  profile_image_url: string;
  view_count: number;
  description?: string;
  broadcaster_type: string;
}

interface TwitchFollowers {
  total: number;
  followers: unknown[];
}

interface TwitchVideo {
  id: string;
  title: string;
  url: string;
  view_count: number;
  published_at: string;
  duration: string;
}

interface TwitchStream {
  id: string;
  title: string;
  viewer_count: number;
  started_at: string;
  game_name: string;
}

interface TwitchChannel {
  broadcaster_id: string;
  broadcaster_login: string;
  broadcaster_name: string;
}

interface FollowerDataPoint {
  name: string;
  Twitch: number;
}

interface TwitchData {
  profile: TwitchProfile | null;
  followers: TwitchFollowers;
  videos: TwitchVideo[];
  isLive: boolean;
  streamInfo: TwitchStream | null;
  channelInfo: TwitchChannel | null;
  followerHistory: FollowerDataPoint[];
}

interface YouTubeData {
  channel: YouTubeChannel | null;
  subscribers: number;
  videos: YouTubeVideo[];
  totalViews: number;
  subscriberHistory: SubscriberDataPoint[];
}

// Merged data point for combined charts
interface CombinedDataPoint {
  name: string;
  Twitch?: number;
  YouTube?: number;
}

// Video performance interface for bar chart
interface VideoPerformance {
  name: string;
  platform: string;
  views: number;
  likes: number;
  comments: number;
}

// Dashboard component
const SocialDashboard = () => {
  const [activePlatform, setActivePlatform] = useState("all");
  const [loading, setLoading] = useState(true);
  const [twitchData, setTwitchData] = useState<TwitchData>({
    profile: null,
    followers: { total: 0, followers: [] },
    videos: [],
    isLive: false,
    streamInfo: null,
    channelInfo: null,
    followerHistory: [],
  });
  const [youtubeData, setYouTubeData] = useState<YouTubeData>({
    channel: null,
    subscribers: 0,
    videos: [],
    totalViews: 0,
    subscriberHistory: [],
  });

  useEffect(() => {
    if (activePlatform === "twitch" || activePlatform === "all") {
      fetchTwitchData();
    }

    if (activePlatform === "youtube" || activePlatform === "all") {
      fetchYouTubeData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePlatform]);

  const fetchTwitchData = async () => {
    try {
      setLoading(true);

      console.log("Checking Twitch authentication...");
      // Check if we have an access token
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("twitch_access_token="));

      if (!token) {
        console.log("No Twitch access token found.");
        setLoading(false);
        return;
      }

      console.log("Authenticated. Fetching Twitch profile...");

      // Fetch user profile
      const profile = await getUserProfile();

      if (!profile) {
        console.error("Failed to fetch Twitch profile. Token may be invalid.");
        // Clear invalid tokens
        document.cookie =
          "twitch_access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
        document.cookie =
          "twitch_refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
        setLoading(false);
        return;
      }

      console.log("Profile fetched successfully:", profile.display_name);

      try {
        // Fetch additional data in parallel
        const [followersData, channelInfo, streamInfo, videos] =
          await Promise.all([
            getFollowers(profile.id).catch((e) => {
              console.error("Error fetching followers:", e);
              return { total: 0, followers: [] };
            }),
            getTwitchChannelInfo(profile.id).catch((e) => {
              console.error("Error fetching channel info:", e);
              return null;
            }),
            getStreamInfo(profile.id).catch((e) => {
              console.error("Error fetching stream info:", e);
              return null;
            }),
            getTwitchVideos(profile.id, 5).catch((e) => {
              console.error("Error fetching videos:", e);
              return [];
            }),
          ]);

        console.log("All Twitch data fetched successfully");

        // Generate follower history based on total followers
        const followerHistory = generateFollowerHistory(followersData.total);

        // Update state with all Twitch data
        setTwitchData({
          profile,
          followers: followersData,
          videos,
          isLive: !!streamInfo,
          streamInfo,
          channelInfo,
          followerHistory,
        });
      } catch (error) {
        console.error("Error fetching Twitch data details:", error);
        // Still update the profile even if other data fails
        setTwitchData((prev) => ({
          ...prev,
          profile,
        }));
      }
    } catch (error) {
      console.error("Error in Twitch data fetching:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchYouTubeData = async () => {
    try {
      setLoading(true);

      console.log("Checking YouTube authentication...");
      // Check if we have an access token
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("youtube_access_token="));

      if (!token) {
        console.log("No YouTube access token found.");
        setLoading(false);
        return;
      }

      console.log("Authenticated. Fetching YouTube channel...");

      // Fetch channel info
      const channel = await getYouTubeChannelInfo();

      if (!channel) {
        console.error("Failed to fetch YouTube channel. Token may be invalid.");
        // Clear invalid tokens
        document.cookie =
          "youtube_access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
        document.cookie =
          "youtube_refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
        setLoading(false);
        return;
      }

      console.log("Channel fetched successfully:", channel.snippet.title);

      try {
        // Fetch additional data in parallel
        const [subscribers, totalViews, videos] = await Promise.all([
          getSubscribers().catch((e) => {
            console.error("Error fetching subscribers:", e);
            return 0;
          }),
          getTotalViews(),
          getYouTubeVideos(5).catch((e) => {
            console.error("Error fetching videos:", e);
            return [];
          }),
        ]);

        console.log("All YouTube data fetched successfully");

        // Generate subscriber history based on total subscribers
        const subscriberHistory = generateSubscriberHistory(subscribers);

        // Update state with all YouTube data
        setYouTubeData({
          channel,
          subscribers,
          videos,
          totalViews,
          subscriberHistory,
        });
      } catch (error) {
        console.error("Error fetching YouTube data details:", error);
        // Still update the channel even if other data fails
        setYouTubeData((prev) => ({
          ...prev,
          channel,
        }));
      }
    } catch (error) {
      console.error("Error in YouTube data fetching:", error);
    } finally {
      setLoading(false);
    }
  };

  // Prepare engagement data for the pie chart
  const engagementData = [
    {
      name: "Twitch",
      value: twitchData.followers.total || 0,
      color: "#6441a5",
    },
    { name: "YouTube", value: youtubeData.subscribers || 0, color: "#FF0000" },
  ];

  // Filter engagement data based on active platform
  const filteredEngagementData = engagementData.filter(
    (item) =>
      activePlatform === "all" || item.name.toLowerCase() === activePlatform
  );

  // Prepare video performance data for the bar chart
  const videoPerformance: VideoPerformance[] = [];

  // Add Twitch videos if available and platform is selected
  if (
    (activePlatform === "twitch" || activePlatform === "all") &&
    twitchData.videos.length > 0
  ) {
    twitchData.videos.slice(0, 2).forEach((video) => {
      videoPerformance.push({
        name: video.title?.substring(0, 10) + "...",
        platform: "Twitch",
        views: video.view_count,
        likes: Math.floor(video.view_count * 0.2), // Estimated
        comments: Math.floor(video.view_count * 0.05), // Estimated
      });
    });
  }

  // Add YouTube videos if available and platform is selected
  if (
    (activePlatform === "youtube" || activePlatform === "all") &&
    youtubeData.videos.length > 0
  ) {
    youtubeData.videos.slice(0, 2).forEach((video) => {
      videoPerformance.push({
        name: video.snippet.title.substring(0, 10) + "...",
        platform: "YouTube",
        views: parseInt(video.statistics.viewCount),
        likes: parseInt(video.statistics.likeCount),
        comments: parseInt(video.statistics.commentCount),
      });
    });
  }

  // Combine follower/subscriber history for the line chart
  const combinedHistory: CombinedDataPoint[] = [];

  if (
    twitchData.followerHistory.length > 0 &&
    youtubeData.subscriberHistory.length > 0
  ) {
    // Assuming both histories have the same months
    for (let i = 0; i < twitchData.followerHistory.length; i++) {
      combinedHistory.push({
        name: twitchData.followerHistory[i].name,
        Twitch: twitchData.followerHistory[i].Twitch,
        YouTube: youtubeData.subscriberHistory[i].YouTube,
      });
    }
  } else if (twitchData.followerHistory.length > 0) {
    combinedHistory.push(
      ...twitchData.followerHistory.map((item) => ({ ...item }))
    );
  } else if (youtubeData.subscriberHistory.length > 0) {
    combinedHistory.push(
      ...youtubeData.subscriberHistory.map((item) => ({
        name: item.name,
        YouTube: item.YouTube,
      }))
    );
  }

  // Add this to your SocialDashboard.tsx file, before the main component
  const AuthError = () => (
    <div className="bg-white p-8 rounded-lg shadow-md">
      <h3 className="text-xl font-bold text-red-600 mb-4">
        Authentication Issue
      </h3>
      <p className="text-gray-700 mb-6">
        We could not connect to your social media accounts. This could be
        because:
      </p>
      <ul className="list-disc pl-5 mb-6 text-gray-700">
        <li>Your authentication has expired</li>
        <li>You have not connected your accounts yet</li>
        <li>There was an issue with the API</li>
      </ul>
      <div className="flex flex-col space-y-3">
        <a
          href="/connect/twitch"
          className="inline-block px-6 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors"
        >
          Connect with Twitch
        </a>
        <a
          href="/connect/youtube"
          className="inline-block px-6 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
        >
          Connect with YouTube
        </a>
      </div>
    </div>
  );

  // Check if we have any connected platforms
  const isTwitchConnected = !!twitchData.profile;
  const isYouTubeConnected = !!youtubeData.channel;
  const isAnyPlatformConnected = isTwitchConnected || isYouTubeConnected;

  // Get platform-specific stats
  const getTotalFollowers = () => {
    let total = 0;
    if (activePlatform === "all" || activePlatform === "twitch") {
      total += twitchData.followers.total || 0;
    }
    if (activePlatform === "all" || activePlatform === "youtube") {
      total += youtubeData.subscribers || 0;
    }
    return total;
  };

  const getTotalViews = () => {
    let total = 0;
    if (activePlatform === "all" || activePlatform === "twitch") {
      total += twitchData.profile?.view_count || 0;
    }
    if (activePlatform === "all" || activePlatform === "youtube") {
      total += youtubeData.totalViews || 0;
    }
    return total;
  };

  const getTotalContent = () => {
    let total = 0;
    if (activePlatform === "all" || activePlatform === "twitch") {
      total += twitchData.videos.length || 0;
    }
    if (activePlatform === "all" || activePlatform === "youtube") {
      total += youtubeData.videos.length || 0;
    }
    return total;
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-md">
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold text-gray-800">Social Dashboard</h1>
        </div>

        <nav className="mt-4">
          <SidebarItem
            icon={<Home />}
            text="Overview"
            active={activePlatform === "all"}
            onClick={() => setActivePlatform("all")}
          />
          <SidebarItem
            icon={<Video />}
            text="Twitch"
            active={activePlatform === "twitch"}
            onClick={() => setActivePlatform("twitch")}
            disabled={!isTwitchConnected}
          />
          <SidebarItem
            icon={<Activity />}
            text="YouTube"
            active={activePlatform === "youtube"}
            onClick={() => setActivePlatform("youtube")}
            disabled={!isYouTubeConnected}
          />
          <SidebarItem
            icon={<TrendingUp />}
            text="TikTok"
            active={activePlatform === "tiktok"}
            onClick={() => setActivePlatform("tiktok")}
            disabled
          />
          <SidebarItem
            icon={<MessageSquare />}
            text="Twitter"
            active={activePlatform === "twitter"}
            onClick={() => setActivePlatform("twitter")}
            disabled
          />
          <div className="border-t my-4"></div>
          <SidebarItem icon={<BarChart2 />} text="Analytics" />
          <SidebarItem icon={<Clock />} text="Content Calendar" />
          <SidebarItem icon={<Users />} text="Audience" />
          <SidebarItem icon={<Bell />} text="Notifications" />
          <SidebarItem icon={<Settings />} text="Settings" />
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto p-6">
        <header className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            {activePlatform === "all"
              ? "Cross-Platform Overview"
              : activePlatform === "twitch"
              ? "Twitch Analytics"
              : activePlatform === "youtube"
              ? "YouTube Analytics"
              : activePlatform.charAt(0).toUpperCase() +
                activePlatform.slice(1) +
                " Analytics"}
          </h2>
          <div className="flex items-center space-x-4">
            {twitchData.isLive && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                <span className="w-2 h-2 mr-1 bg-red-500 rounded-full animate-pulse"></span>
                Live Now
              </span>
            )}
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Refresh Data
            </button>
            <div className="bg-white p-2 rounded-full shadow">
              <User size={24} />
            </div>
          </div>
        </header>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-white rounded-lg shadow p-6 animate-pulse"
              >
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-gray-300 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : !isAnyPlatformConnected ? (
          <div className="flex justify-center items-center h-full">
            <AuthError />
          </div>
        ) : (
          <>
            {/* Stats overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <StatCard
                title="Total Followers/Subscribers"
                value={getTotalFollowers()}
                change="+10.5%"
              />
              <StatCard
                title="Total Views"
                value={getTotalViews()}
                change="+8.7%"
              />
              <StatCard title="Engagement Rate" value="4.8%" change="+1.2%" />
              <StatCard
                title="Content Pieces"
                value={getTotalContent()}
                change="+5.3%"
              />
            </div>

            {/* Charts - now in a more flexible layout */}
            <div className="grid grid-cols-12 gap-6 mb-6">
              {/* Follower Growth Chart - 2/3 width */}
              <div className="col-span-12 lg:col-span-8 bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium mb-4">
                  Follower/Subscriber Growth
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={combinedHistory}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    {(activePlatform === "twitch" ||
                      activePlatform === "all") &&
                      twitchData.followerHistory.length > 0 && (
                        <Line
                          type="monotone"
                          dataKey="Twitch"
                          stroke="#6441a5"
                          strokeWidth={2}
                          activeDot={{ r: 8 }}
                        />
                      )}
                    {(activePlatform === "youtube" ||
                      activePlatform === "all") &&
                      youtubeData.subscriberHistory.length > 0 && (
                        <Line
                          type="monotone"
                          dataKey="YouTube"
                          stroke="#FF0000"
                          strokeWidth={2}
                          activeDot={{ r: 8 }}
                        />
                      )}
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Engagement Distribution - 1/3 width */}
              <div className="col-span-12 lg:col-span-4 bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium mb-4">
                  Platform Distribution
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={filteredEngagementData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {filteredEngagementData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Content performance - full width */}
            <div className="bg-white p-6 rounded-lg shadow mb-6">
              <h3 className="text-lg font-medium mb-4">
                Recent Content Performance
              </h3>
              {videoPerformance.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={videoPerformance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-white p-3 border rounded shadow-sm">
                              <p className="font-medium">{data.name}</p>
                              <p className="text-sm text-gray-600">
                                {data.platform}
                              </p>
                              <p className="text-sm">
                                Views: {data.views.toLocaleString()}
                              </p>
                              <p className="text-sm">
                                Likes: {data.likes.toLocaleString()}
                              </p>
                              <p className="text-sm">
                                Comments: {data.comments.toLocaleString()}
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend />
                    <Bar name="Views" dataKey="views" fill="#8884d8" />
                    <Bar name="Likes" dataKey="likes" fill="#82ca9d" />
                    <Bar name="Comments" dataKey="comments" fill="#ff8042" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex justify-center items-center h-64 bg-gray-50 rounded">
                  <p className="text-gray-500">No recent content found</p>
                </div>
              )}
            </div>

            {/* Profile and channel information - new section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Twitch profile card */}
              {(activePlatform === "all" || activePlatform === "twitch") &&
                twitchData.profile && (
                  <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-medium mb-4">Twitch Profile</h3>
                    <div className="flex items-center mb-4">
                      <img
                        src={twitchData.profile.profile_image_url}
                        alt={twitchData.profile.display_name}
                        className="w-16 h-16 rounded-full mr-4"
                      />
                      <div>
                        <h4 className="text-xl font-semibold">
                          {twitchData.profile.display_name}
                        </h4>
                        <p className="text-gray-600">
                          @{twitchData.profile.login}
                        </p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-gray-700">
                        {twitchData.profile.description ||
                          "No channel description"}
                      </p>
                    </div>

                    <div className="flex justify-between text-center">
                      <div className="px-4 py-2 bg-gray-50 rounded">
                        <p className="text-sm text-gray-500">Followers</p>
                        <p className="text-xl font-semibold">
                          {twitchData.followers.total.toLocaleString()}
                        </p>
                      </div>
                      <div className="px-4 py-2 bg-gray-50 rounded">
                        <p className="text-sm text-gray-500">Views</p>
                        <p className="text-xl font-semibold">
                          {twitchData.profile.view_count.toLocaleString()}
                        </p>
                      </div>
                      <div className="px-4 py-2 bg-gray-50 rounded">
                        <p className="text-sm text-gray-500">Type</p>
                        <p className="text-xl font-semibold capitalize">
                          {twitchData.profile.broadcaster_type || "Standard"}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4">
                      <a
                        href={`https://twitch.tv/${twitchData.profile.login}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-purple-600 hover:text-purple-800"
                      >
                        View Channel <ExternalLink size={16} className="ml-1" />
                      </a>
                    </div>
                  </div>
                )}

              {/* YouTube profile card */}
              {(activePlatform === "all" || activePlatform === "youtube") &&
                youtubeData.channel && (
                  <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-medium mb-4">
                      YouTube Profile
                    </h3>
                    <div className="flex items-center mb-4">
                      <img
                        src={youtubeData.channel.snippet.thumbnails.high.url}
                        alt={youtubeData.channel.snippet.title}
                        className="w-16 h-16 rounded-full mr-4"
                      />
                      <div>
                        <h4 className="text-xl font-semibold">
                          {youtubeData.channel.snippet.title}
                        </h4>
                        <p className="text-gray-600">
                          {youtubeData.channel.snippet.customUrl
                            ? `@${youtubeData.channel.snippet.customUrl}`
                            : "Custom URL not set"}
                        </p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-gray-700">
                        {youtubeData.channel.snippet.description
                          ? youtubeData.channel.snippet.description.length > 150
                            ? youtubeData.channel.snippet.description.substring(
                                0,
                                150
                              ) + "..."
                            : youtubeData.channel.snippet.description
                          : "No channel description"}
                      </p>
                    </div>

                    <div className="flex justify-between text-center">
                      <div className="px-4 py-2 bg-gray-50 rounded">
                        <p className="text-sm text-gray-500">Subscribers</p>
                        <p className="text-xl font-semibold">
                          {youtubeData.channel.statistics.hiddenSubscriberCount
                            ? "Hidden"
                            : parseInt(
                                youtubeData.channel.statistics.subscriberCount
                              ).toLocaleString()}
                        </p>
                      </div>
                      <div className="px-4 py-2 bg-gray-50 rounded">
                        <p className="text-sm text-gray-500">Views</p>
                        <p className="text-xl font-semibold">
                          {parseInt(
                            youtubeData.channel.statistics.viewCount
                          ).toLocaleString()}
                        </p>
                      </div>
                      <div className="px-4 py-2 bg-gray-50 rounded">
                        <p className="text-sm text-gray-500">Videos</p>
                        <p className="text-xl font-semibold">
                          {parseInt(
                            youtubeData.channel.statistics.videoCount
                          ).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <a
                        href={`https://youtube.com/channel/${youtubeData.channel.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-red-600 hover:text-red-800"
                      >
                        View Channel <ExternalLink size={16} className="ml-1" />
                      </a>
                    </div>
                  </div>
                )}

              {/* Stream status - only show for Twitch or All platforms */}
              {(activePlatform === "all" || activePlatform === "twitch") && (
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-medium mb-4">
                    Twitch Stream Status
                  </h3>
                  {twitchData.isLive && twitchData.streamInfo ? (
                    <div>
                      <div className="flex items-center mb-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 mr-2">
                          <span className="w-2 h-2 mr-1 bg-red-500 rounded-full animate-pulse"></span>
                          Live
                        </span>
                        <span className="text-gray-600">
                          {twitchData.streamInfo.viewer_count} viewers watching
                        </span>
                      </div>

                      <h4 className="text-lg font-semibold mb-2">
                        {twitchData.streamInfo.title}
                      </h4>

                      <div className="mb-4">
                        <p className="text-sm text-gray-500">Playing</p>
                        <p>
                          {twitchData.streamInfo.game_name || "Unknown Game"}
                        </p>
                      </div>

                      <div className="mb-4">
                        <p className="text-sm text-gray-500">Started</p>
                        <p>
                          {new Date(
                            twitchData.streamInfo.started_at
                          ).toLocaleString()}
                        </p>
                      </div>

                      <a
                        href={`https://twitch.tv/${twitchData.profile?.login}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                      >
                        Watch Stream
                      </a>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-52 bg-gray-50 rounded">
                      <p className="text-gray-500 mb-2">Not currently live</p>
                      <p className="text-sm text-gray-400">
                        Your last stream ended on{" "}
                        {twitchData.videos[0]?.published_at
                          ? new Date(
                              twitchData.videos[0]?.published_at
                            ).toLocaleDateString()
                          : "N/A"}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Recent content section - handles both Twitch and YouTube videos */}
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Recent Content</h3>
                <div className="flex space-x-4">
                  {twitchData.profile && (
                    <a
                      href={`https://twitch.tv/${twitchData.profile?.login}/videos`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-purple-600 hover:text-purple-800"
                    >
                      View Twitch Videos
                    </a>
                  )}
                  {youtubeData.channel && (
                    <a
                      href={`https://youtube.com/channel/${youtubeData.channel?.id}/videos`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-red-600 hover:text-red-800"
                    >
                      View YouTube Videos
                    </a>
                  )}
                </div>
              </div>

              {(activePlatform === "all" ||
                activePlatform === "twitch" ||
                activePlatform === "youtube") &&
              (twitchData.videos.length > 0 ||
                youtubeData.videos.length > 0) ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Platform
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Title
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Duration
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Views
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Published
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {/* Show Twitch videos if active platform is 'all' or 'twitch' */}
                      {(activePlatform === "all" ||
                        activePlatform === "twitch") &&
                        twitchData.videos.map((video) => (
                          <tr key={`twitch-${video.id}`}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <div className="flex items-center">
                                <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                                Twitch
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {video.title?.length > 40
                                  ? `${video.title.substring(0, 40)}...`
                                  : video.title}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatDuration(video.duration)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {video.view_count.toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(
                                video.published_at
                              ).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <a
                                href={video.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-purple-600 hover:text-purple-800"
                              >
                                Watch
                              </a>
                            </td>
                          </tr>
                        ))}

                      {/* Show YouTube videos if active platform is 'all' or 'youtube' */}
                      {(activePlatform === "all" ||
                        activePlatform === "youtube") &&
                        youtubeData.videos.map((video) => (
                          <tr key={`youtube-${video.id}`}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <div className="flex items-center">
                                <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                                YouTube
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {video.snippet.title.length > 40
                                  ? `${video.snippet.title.substring(0, 40)}...`
                                  : video.snippet.title}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatYouTubeDuration(
                                video.contentDetails.duration
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {parseInt(
                                video.statistics.viewCount
                              ).toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(
                                video.snippet.publishedAt
                              ).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <a
                                href={`https://www.youtube.com/watch?v=${video.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-red-600 hover:text-red-800"
                              >
                                Watch
                              </a>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No recent content found</p>
                </div>
              )}
            </div>

            {/* Add platform-specific sections if needed */}
            {activePlatform === "youtube" && youtubeData.channel && (
              <div className="bg-white p-6 rounded-lg shadow mt-6">
                <h3 className="text-lg font-medium mb-4">YouTube Analytics</h3>
                <p className="text-gray-600 mb-4">
                  Additional YouTube-specific analytics will be displayed here
                  as they are implemented.
                </p>
                <p className="text-sm text-gray-500">
                  Coming soon: View time analytics, audience demographics, and
                  more detailed engagement metrics.
                </p>
              </div>
            )}

            {activePlatform === "twitch" && twitchData.profile && (
              <div className="bg-white p-6 rounded-lg shadow mt-6">
                <h3 className="text-lg font-medium mb-4">Twitch Analytics</h3>
                <p className="text-gray-600 mb-4">
                  Additional Twitch-specific analytics will be displayed here as
                  they are implemented.
                </p>
                <p className="text-sm text-gray-500">
                  Coming soon: Clip analytics, chat engagement, and detailed
                  stream statistics.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

// Helper components
const SidebarItem = ({
  icon,
  text,
  active = false,
  onClick = () => {},
  disabled = false,
}: {
  icon: React.ReactNode;
  text: string;
  active?: boolean;
  onClick?: () => void;
  disabled?: boolean;
}) => (
  <div
    className={`flex items-center px-4 py-3 cursor-pointer ${
      disabled
        ? "text-gray-400 cursor-not-allowed"
        : active
        ? "bg-blue-50 text-blue-600"
        : "text-gray-600 hover:bg-gray-50"
    }`}
    onClick={disabled ? undefined : onClick}
  >
    <div className="mr-3">{icon}</div>
    <span className="font-medium">{text}</span>
    {disabled && (
      <span className="ml-auto text-xs px-2 py-1 rounded bg-gray-200 text-gray-600">
        Soon
      </span>
    )}
  </div>
);

interface StatCardProps {
  title: string;
  value: string | number;
  change: string;
}

const StatCard = ({ title, value, change }: StatCardProps) => (
  <div className="bg-white p-6 rounded-lg shadow">
    <h3 className="text-sm font-medium text-gray-500">{title}</h3>
    <div className="flex items-end mt-2">
      <span className="text-2xl font-bold text-gray-800">
        {typeof value === "number" && value > 1000
          ? `${(value / 1000).toFixed(1)}k`
          : value}
      </span>
      <span
        className={`ml-2 text-sm ${
          change.startsWith("+") ? "text-green-500" : "text-red-500"
        }`}
      >
        {change}
      </span>
    </div>
  </div>
);

// Helper function to format Twitch video duration
const formatDuration = (duration: string) => {
  // Convert Twitch duration format (e.g., "1h2m3s") to a readable format
  if (!duration) return "Unknown";

  let hours = 0;
  let minutes = 0;
  let seconds = 0;

  // Extract hours
  const hourMatch = duration.match(/(\d+)h/);
  if (hourMatch) hours = parseInt(hourMatch[1]);

  // Extract minutes
  const minuteMatch = duration.match(/(\d+)m/);
  if (minuteMatch) minutes = parseInt(minuteMatch[1]);

  // Extract seconds
  const secondMatch = duration.match(/(\d+)s/);
  if (secondMatch) seconds = parseInt(secondMatch[1]);

  // Format based on duration
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  } else {
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }
};

export default SocialDashboard;
