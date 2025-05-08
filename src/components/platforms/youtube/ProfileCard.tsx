"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { getChannelInfo } from "@/lib/api/youtube";
import { YouTubeChannel } from "@/types/youtube";

export default function YouTubeProfileCard() {
  const [channel, setChannel] = useState<YouTubeChannel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChannel = async () => {
      try {
        const channelData = await getChannelInfo();
        setChannel(channelData);
      } catch (err) {
        setError("Failed to load YouTube channel");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchChannel();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
        <div className="flex items-center space-x-4">
          <div className="rounded-full bg-gray-200 h-16 w-16"></div>
          <div className="flex-1">
            <div className="h-5 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          </div>
        </div>
        <div className="h-4 bg-gray-200 rounded w-full mt-4"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6 mt-2"></div>
      </div>
    );
  }

  if (error || !channel) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-red-500">{error || "No channel data available"}</p>
        <button
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          onClick={() => (window.location.href = "/connect/youtube")}
        >
          Reconnect YouTube
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center space-x-4">
        <Image
          src={channel.snippet.thumbnails.high.url}
          alt={channel.snippet.title}
          width={64}
          height={64}
          className="rounded-full"
        />
        <div>
          <h3 className="text-xl font-semibold">{channel.snippet.title}</h3>
          <p className="text-gray-500">
            {channel.snippet.customUrl
              ? `@${channel.snippet.customUrl}`
              : `Channel ID: ${channel.id.substring(0, 10)}...`}
          </p>
        </div>
      </div>

      {channel.snippet.description && (
        <p className="mt-4 text-gray-700">
          {channel.snippet.description.length > 200
            ? channel.snippet.description.substring(0, 200) + "..."
            : channel.snippet.description}
        </p>
      )}

      <div className="mt-4 grid grid-cols-3 gap-4">
        <div className="text-center p-3 bg-gray-50 rounded">
          <p className="text-sm text-gray-500">Subscribers</p>
          <p className="text-xl font-semibold">
            {channel.statistics.hiddenSubscriberCount
              ? "Hidden"
              : parseInt(channel.statistics.subscriberCount).toLocaleString()}
          </p>
        </div>

        <div className="text-center p-3 bg-gray-50 rounded">
          <p className="text-sm text-gray-500">Total Views</p>
          <p className="text-xl font-semibold">
            {parseInt(channel.statistics.viewCount).toLocaleString()}
          </p>
        </div>

        <div className="text-center p-3 bg-gray-50 rounded">
          <p className="text-sm text-gray-500">Videos</p>
          <p className="text-xl font-semibold">
            {parseInt(channel.statistics.videoCount).toLocaleString()}
          </p>
        </div>
      </div>

      <div className="mt-4">
        <a
          href={`https://youtube.com/channel/${channel.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          View Channel
        </a>
      </div>
    </div>
  );
}
