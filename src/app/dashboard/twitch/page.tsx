"use client";

import { useState, useEffect } from "react";
import Navigation from "@/components/common/Navigation";
import TwitchProfileCard from "@/components/platforms/twitch/ProfileCard";
import StatCard from "@/components/ui/StatCard";
import { getFollowerCount, getStreamInfo } from "@/lib/api/twitch";
import { Users, Eye, Clock, Heart } from "lucide-react";

export default function TwitchDashboardPage() {
  const [followerCount, setFollowerCount] = useState<number | null>(null);
  const [currentViewers, setCurrentViewers] = useState<number | null>(null);
  const [streamTitle, setStreamTitle] = useState<string | null>(null);
  const [isLive, setIsLive] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTwitchData = async () => {
      try {
        // Get follower count and stream info
        const followers = await getFollowerCount().catch(() => null);
        const streamInfo = await getStreamInfo().catch(() => null);

        if (followers !== null) {
          setFollowerCount(followers);
        }

        if (streamInfo) {
          setIsLive(true);
          setCurrentViewers(streamInfo.viewer_count || 0);
          setStreamTitle(streamInfo.title || "");
        }
      } catch (error) {
        console.error("Error fetching Twitch data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTwitchData();
  }, []);

  return (
    <div className="flex h-screen bg-gray-50">
      <Navigation />

      <main className="flex-1 overflow-y-auto">
        <div className="p-6">
          <header className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">
              Twitch Dashboard
            </h1>

            <div>
              {isLive && (
                <span className="inline-flex items-center px-3 py-1 mr-2 rounded-full text-sm font-medium bg-red-100 text-red-800">
                  <span className="w-2 h-2 mr-1 bg-red-500 rounded-full animate-pulse"></span>
                  Live Now
                </span>
              )}

              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Refresh Data
              </button>
            </div>
          </header>

          {/* Profile section */}
          <div className="mb-6">
            <TwitchProfileCard />
          </div>

          {/* Stats section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <StatCard
              title="Followers"
              value={loading ? "-" : followerCount || 0}
              icon={<Users size={20} className="text-purple-500" />}
            />

            <StatCard
              title="Current Viewers"
              value={isLive ? currentViewers || 0 : "Offline"}
              icon={<Eye size={20} className="text-purple-500" />}
            />

            <StatCard
              title="Stream Uptime"
              value={isLive ? "Live Now" : "Offline"}
              icon={<Clock size={20} className="text-purple-500" />}
            />

            <StatCard
              title="Subscriber Count"
              value="Coming Soon"
              icon={<Heart size={20} className="text-purple-500" />}
            />
          </div>

          {/* Stream info section */}
          {isLive && streamTitle && (
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
              <h3 className="text-lg font-medium mb-2">Current Stream</h3>
              <p className="text-gray-700">{streamTitle}</p>
              <div className="mt-4">
                <a
                  href="#"
                  className="inline-block px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                >
                  View Stream
                </a>
              </div>
            </div>
          )}

          {/* Recent streams section */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-medium mb-4">Recent Streams</h3>
            {loading ? (
              <div className="animate-pulse">
                <div className="h-10 bg-gray-200 rounded mb-4"></div>
                <div className="h-10 bg-gray-200 rounded mb-4"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">
                  Recent stream data will be displayed here
                </p>
                <p className="text-sm text-gray-400 mt-2">
                  This feature is coming soon
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
