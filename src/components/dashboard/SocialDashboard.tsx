"use client";

import React, { useState } from "react";
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
} from "lucide-react";

// Mock data - in a real application, this would come from API calls
const followerData = [
  { name: "Jan", Twitch: 240, YouTube: 300, TikTok: 500, Twitter: 120 },
  { name: "Feb", Twitch: 300, YouTube: 398, TikTok: 680, Twitter: 200 },
  { name: "Mar", Twitch: 350, YouTube: 480, TikTok: 780, Twitter: 280 },
  { name: "Apr", Twitch: 410, YouTube: 520, TikTok: 890, Twitter: 330 },
  { name: "May", Twitch: 490, YouTube: 600, TikTok: 1000, Twitter: 390 },
];

const engagementData = [
  { name: "Twitch", value: 40, color: "#6441a5" },
  { name: "YouTube", value: 30, color: "#FF0000" },
  { name: "TikTok", value: 20, color: "#000000" },
  { name: "Twitter", value: 10, color: "#1DA1F2" },
];

const contentPerformance = [
  { name: "Post 1", views: 1200, likes: 300, shares: 80, comments: 45 },
  { name: "Post 2", views: 800, likes: 120, shares: 30, comments: 25 },
  { name: "Post 3", views: 1500, likes: 450, shares: 120, comments: 85 },
  { name: "Post 4", views: 600, likes: 80, shares: 20, comments: 15 },
];

const platformStats = {
  twitch: { followers: 4500, views: 125000, streams: 24 },
  youtube: { subscribers: 8200, views: 345000, videos: 86 },
  tiktok: { followers: 12500, likes: 78000, posts: 42 },
  twitter: { followers: 3800, tweets: 650, impressions: 95000 },
};

// Dashboard component
const SocialDashboard = () => {
  const [activePlatform, setActivePlatform] = useState("all");

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
          />
          <SidebarItem
            icon={<TrendingUp />}
            text="TikTok"
            active={activePlatform === "tiktok"}
            onClick={() => setActivePlatform("tiktok")}
          />
          <SidebarItem
            icon={<MessageSquare />}
            text="Twitter"
            active={activePlatform === "twitter"}
            onClick={() => setActivePlatform("twitter")}
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
              : activePlatform.charAt(0).toUpperCase() +
                activePlatform.slice(1) +
                " Analytics"}
          </h2>
          <div className="flex items-center space-x-4">
            <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              Refresh Data
            </button>
            <div className="bg-white p-2 rounded-full shadow">
              <User size={24} />
            </div>
          </div>
        </header>

        {/* Stats overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <StatCard
            title="Total Followers"
            value={
              activePlatform === "all"
                ? platformStats.twitch.followers +
                  platformStats.youtube.subscribers +
                  platformStats.tiktok.followers +
                  platformStats.twitter.followers
                : activePlatform === "twitch"
                ? platformStats.twitch.followers
                : activePlatform === "youtube"
                ? platformStats.youtube.subscribers
                : activePlatform === "tiktok"
                ? platformStats.tiktok.followers
                : platformStats.twitter.followers
            }
            change="+12.3%"
          />
          <StatCard
            title="Total Views"
            value={
              activePlatform === "all"
                ? platformStats.twitch.views +
                  platformStats.youtube.views +
                  platformStats.tiktok.likes +
                  platformStats.twitter.impressions
                : activePlatform === "twitch"
                ? platformStats.twitch.views
                : activePlatform === "youtube"
                ? platformStats.youtube.views
                : activePlatform === "tiktok"
                ? platformStats.tiktok.likes
                : platformStats.twitter.impressions
            }
            change="+8.7%"
          />
          <StatCard title="Engagement Rate" value="4.8%" change="+1.2%" />
          <StatCard
            title="Content Pieces"
            value={
              activePlatform === "all"
                ? platformStats.twitch.streams +
                  platformStats.youtube.videos +
                  platformStats.tiktok.posts +
                  platformStats.twitter.tweets
                : activePlatform === "twitch"
                ? platformStats.twitch.streams
                : activePlatform === "youtube"
                ? platformStats.youtube.videos
                : activePlatform === "tiktok"
                ? platformStats.tiktok.posts
                : platformStats.twitter.tweets
            }
            change="+5.3%"
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium mb-4">Follower Growth</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={followerData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                {activePlatform === "all" || activePlatform === "twitch" ? (
                  <Line type="monotone" dataKey="Twitch" stroke="#6441a5" />
                ) : null}
                {activePlatform === "all" || activePlatform === "youtube" ? (
                  <Line type="monotone" dataKey="YouTube" stroke="#FF0000" />
                ) : null}
                {activePlatform === "all" || activePlatform === "tiktok" ? (
                  <Line type="monotone" dataKey="TikTok" stroke="#000000" />
                ) : null}
                {activePlatform === "all" || activePlatform === "twitter" ? (
                  <Line type="monotone" dataKey="Twitter" stroke="#1DA1F2" />
                ) : null}
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
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

        {/* Content performance */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h3 className="text-lg font-medium mb-4">
            Recent Content Performance
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={contentPerformance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="views" fill="#8884d8" />
              <Bar dataKey="likes" fill="#82ca9d" />
              <Bar dataKey="shares" fill="#ffc658" />
              <Bar dataKey="comments" fill="#ff8042" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Upcoming content */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Upcoming Content</h3>
            <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
              + New Post
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Content
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Platform
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Scheduled
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <UpcomingContentRow
                  title="Gaming Stream Highlights"
                  platform="Twitch"
                  date="Tomorrow, 2:00 PM"
                  status="Scheduled"
                />
                <UpcomingContentRow
                  title="Tutorial Video"
                  platform="YouTube"
                  date="May 10, 4:30 PM"
                  status="Draft"
                />
                <UpcomingContentRow
                  title="Product Showcase"
                  platform="TikTok"
                  date="May 12, 9:00 AM"
                  status="Scheduled"
                />
                <UpcomingContentRow
                  title="Industry News Thread"
                  platform="Twitter"
                  date="May 8, 11:15 AM"
                  status="Scheduled"
                />
              </tbody>
            </table>
          </div>
        </div>
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
}: {
  icon: React.ReactNode;
  text: string;
  active?: boolean;
  onClick?: () => void;
}) => (
  <div
    className={`flex items-center px-4 py-3 cursor-pointer ${
      active ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-gray-50"
    }`}
    onClick={onClick}
  >
    <div className="mr-3">{icon}</div>
    <span className="font-medium">{text}</span>
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

interface UpcomingContentRowProps {
  title: string;
  platform: string;
  date: string;
  status: string;
}

const UpcomingContentRow = ({
  title,
  platform,
  date,
  status,
}: UpcomingContentRowProps) => (
  <tr>
    <td className="px-6 py-4 whitespace-nowrap">
      <div className="text-sm font-medium text-gray-900">{title}</div>
    </td>
    <td className="px-6 py-4 whitespace-nowrap">
      <span
        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
        ${
          platform === "Twitch"
            ? "bg-purple-100 text-purple-800"
            : platform === "YouTube"
            ? "bg-red-100 text-red-800"
            : platform === "TikTok"
            ? "bg-gray-100 text-gray-800"
            : "bg-blue-100 text-blue-800"
        }`}
      >
        {platform}
      </span>
    </td>
    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
      {date}
    </td>
    <td className="px-6 py-4 whitespace-nowrap">
      <span
        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
        ${
          status === "Scheduled"
            ? "bg-green-100 text-green-800"
            : status === "Draft"
            ? "bg-yellow-100 text-yellow-800"
            : "bg-gray-100 text-gray-800"
        }`}
      >
        {status}
      </span>
    </td>
    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
      <button className="text-blue-600 hover:text-blue-800 mr-3">Edit</button>
      <button className="text-red-600 hover:text-red-800">Delete</button>
    </td>
  </tr>
);

export default SocialDashboard;
