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

import {
  getUserProfile,
  getFollowers,
  getChannelInfo,
  getStreamInfo,
  getVideos,
  generateFollowerHistory,
} from "@/lib/api/twitch";

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

// Dashboard component
const SocialDashboard = () => {
  const [activePlatform, setActivePlatform] = useState("twitch");
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

  // Engagement data - we'll use this for the pie chart
  const engagementData = [{ name: "Twitch", value: 100, color: "#6441a5" }];

  useEffect(() => {
    const fetchTwitchData = async () => {
      try {
        setLoading(true);

        console.log("Checking Twitch authentication...");
        // Check if we have an access token
        const token = document.cookie
          .split("; ")
          .find((row) => row.startsWith("twitch_access_token="));

        if (!token) {
          console.error(
            "No Twitch access token found. Please authenticate first."
          );
          setLoading(false);
          return;
        }

        console.log("Authenticated. Fetching Twitch profile...");

        // Fetch user profile
        const profile = await getUserProfile();

        if (!profile) {
          console.error(
            "Failed to fetch Twitch profile. Token may be invalid."
          );
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
              getChannelInfo(profile.id).catch((e) => {
                console.error("Error fetching channel info:", e);
                return null;
              }),
              getStreamInfo(profile.id).catch((e) => {
                console.error("Error fetching stream info:", e);
                return null;
              }),
              getVideos(profile.id, 5).catch((e) => {
                console.error("Error fetching videos:", e);
                return [];
              }),
            ]);

          console.log("All data fetched successfully");

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

    fetchTwitchData();
  }, []);

  // Format video performance data for the bar chart
  const videoPerformance = twitchData.videos.slice(0, 4).map((video) => ({
    name: video.title?.substring(0, 10) + "...",
    views: video.view_count,
    likes: Math.floor(video.view_count * 0.2), // Estimated likes
    comments: Math.floor(video.view_count * 0.05), // Estimated comments
  }));

  // Add this to your SocialDashboard.tsx file, before the main component
  const AuthError = () => (
    <div className="bg-white p-8 rounded-lg shadow-md">
      <h3 className="text-xl font-bold text-red-600 mb-4">
        Authentication Issue
      </h3>
      <p className="text-gray-700 mb-6">
        We could not connect to your Twitch account. This could be because:
      </p>
      <ul className="list-disc pl-5 mb-6 text-gray-700">
        <li>Your Twitch authentication has expired</li>
        <li>You have not connected your Twitch account yet</li>
        <li>There was an issue with the Twitch API</li>
      </ul>
      <a
        href="/connect/twitch"
        className="inline-block px-6 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors"
      >
        Connect with Twitch
      </a>
    </div>
  );

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
          />
          <SidebarItem
            icon={<Activity />}
            text="YouTube"
            active={activePlatform === "youtube"}
            onClick={() => setActivePlatform("youtube")}
            disabled
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
        ) : !twitchData.profile ? (
          <div className="flex justify-center items-center h-full">
            <AuthError />
          </div>
        ) : (
          <>
            {/* Stats overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <StatCard
                title="Total Followers"
                value={twitchData.followers.total || 0}
                change="+12.3%"
              />
              <StatCard
                title="Total Views"
                value={twitchData.profile?.view_count || 0}
                change="+8.7%"
              />
              <StatCard title="Engagement Rate" value="4.8%" change="+1.2%" />
              <StatCard
                title="Content Pieces"
                value={twitchData.videos.length || 0}
                change="+5.3%"
              />
            </div>

            {/* Charts - now in a more flexible layout */}
            <div className="grid grid-cols-12 gap-6 mb-6">
              {/* Follower Growth Chart - 2/3 width */}
              <div className="col-span-12 lg:col-span-8 bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium mb-4">Follower Growth</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={twitchData.followerHistory}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="Twitch"
                      stroke="#6441a5"
                      strokeWidth={2}
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Engagement Distribution - 1/3 width */}
              <div className="col-span-12 lg:col-span-4 bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium mb-4">
                  Engagement Distribution
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={engagementData.filter(
                        (item) =>
                          activePlatform === "all" ||
                          item.name.toLowerCase() === activePlatform
                      )}
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
                      {engagementData.map((entry, index) => (
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
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="views" fill="#8884d8" />
                    <Bar dataKey="likes" fill="#82ca9d" />
                    <Bar dataKey="comments" fill="#ff8042" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex justify-center items-center h-64 bg-gray-50 rounded">
                  <p className="text-gray-500">No recent videos found</p>
                </div>
              )}
            </div>

            {/* Profile and channel information - new section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Twitch profile card */}
              {twitchData.profile && (
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

              {/* Stream status */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium mb-4">Stream Status</h3>
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
                      <p>{twitchData.streamInfo.game_name || "Unknown Game"}</p>
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
            </div>

            {/* Recent videos section - new section */}
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Recent Videos</h3>
                <a
                  href={`https://twitch.tv/${twitchData.profile?.login}/videos`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-purple-600 hover:text-purple-800"
                >
                  View All Videos
                </a>
              </div>

              {twitchData.videos.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
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
                      {twitchData.videos.map((video) => (
                        <tr key={video.id}>
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
                            {new Date(video.published_at).toLocaleDateString()}
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
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No recent videos found</p>
                </div>
              )}
            </div>
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

// Helper function to format video duration
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
