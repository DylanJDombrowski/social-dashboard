"use client";

import { useState, useEffect } from "react";
import Navigation from "@/components/common/Navigation";
import YouTubeProfileCard from "@/components/platforms/youtube/ProfileCard";
import StatCard from "@/components/ui/StatCard";
import {
  getSubscribers,
  getTotalViews,
  getVideos,
  formatYouTubeDuration,
} from "@/lib/api/youtube";
import { Users, Eye, Video, ThumbsUp } from "lucide-react";
import { YouTubeVideo } from "@/types/youtube";

export default function YouTubeDashboardPage() {
  const [subscriberCount, setSubscriberCount] = useState<number | null>(null);
  const [totalViews, setTotalViews] = useState<number | null>(null);
  const [recentVideos, setRecentVideos] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchYouTubeData = async () => {
      try {
        // Get subscribers, views, and recent videos
        const subscribers = await getSubscribers().catch(() => null);
        const views = await getTotalViews().catch(() => null);
        const videos = await getVideos(5).catch(() => []);

        if (subscribers !== null) {
          setSubscriberCount(subscribers);
        }

        if (views !== null) {
          setTotalViews(views);
        }

        if (videos.length > 0) {
          setRecentVideos(videos);
        }
      } catch (error) {
        console.error("Error fetching YouTube data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchYouTubeData();
  }, []);

  return (
    <div className="flex h-screen bg-gray-50">
      <Navigation />

      <main className="flex-1 overflow-y-auto">
        <div className="p-6">
          <header className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">
              YouTube Dashboard
            </h1>

            <div>
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
            <YouTubeProfileCard />
          </div>

          {/* Stats section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <StatCard
              title="Subscribers"
              value={loading ? "-" : subscriberCount || 0}
              icon={<Users size={20} className="text-red-500" />}
            />

            <StatCard
              title="Total Views"
              value={loading ? "-" : totalViews || 0}
              icon={<Eye size={20} className="text-red-500" />}
            />

            <StatCard
              title="Video Count"
              value={loading ? "-" : recentVideos.length || 0}
              icon={<Video size={20} className="text-red-500" />}
            />

            <StatCard
              title="Engagement Rate"
              value={loading ? "-" : "Coming Soon"}
              icon={<ThumbsUp size={20} className="text-red-500" />}
            />
          </div>

          {/* Recent videos section */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-medium mb-4">Recent Videos</h3>
            {loading ? (
              <div className="animate-pulse">
                <div className="h-10 bg-gray-200 rounded mb-4"></div>
                <div className="h-10 bg-gray-200 rounded mb-4"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            ) : recentVideos.length > 0 ? (
              <div className="space-y-4">
                {recentVideos.map((video) => (
                  <div
                    key={video.id}
                    className="flex items-center border-b border-gray-200 pb-4 last:border-0"
                  >
                    <div className="flex-shrink-0 w-32 h-20 bg-gray-100 rounded overflow-hidden mr-4">
                      <img
                        src={video.snippet.thumbnails.medium.url}
                        alt={video.snippet.title}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-grow">
                      <h4 className="text-sm font-medium text-gray-900 mb-1">
                        {video.snippet.title}
                      </h4>
                      <div className="flex space-x-4 text-xs text-gray-500">
                        <span>
                          {new Date(
                            video.snippet.publishedAt
                          ).toLocaleDateString()}
                        </span>
                        <span>
                          {formatYouTubeDuration(video.contentDetails.duration)}
                        </span>
                        <span>{video.statistics.viewCount} views</span>
                      </div>
                    </div>

                    <a
                      href={`https://www.youtube.com/watch?v=${video.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                    >
                      Watch
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No videos found</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
