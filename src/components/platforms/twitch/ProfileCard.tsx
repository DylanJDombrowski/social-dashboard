"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { getUserProfile } from "@/lib/api/twitch"; // Adjust the import path as necessary

interface TwitchProfile {
  id: string;
  login: string;
  display_name: string;
  profile_image_url: string;
  view_count: number;
  description: string;
  broadcaster_type: string;
}

export default function TwitchProfileCard() {
  const [profile, setProfile] = useState<TwitchProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profileData = await getUserProfile();
        setProfile(profileData);
      } catch (err) {
        setError("Failed to load Twitch profile");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
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

  if (error || !profile) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-red-500">{error || "No profile data available"}</p>
        <button
          className="mt-2 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          onClick={() => (window.location.href = "/connect/twitch")}
        >
          Reconnect Twitch
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center space-x-4">
        <Image
          src={profile.profile_image_url}
          alt={profile.display_name}
          width={64}
          height={64}
          className="rounded-full"
        />
        <div>
          <h3 className="text-xl font-semibold">{profile.display_name}</h3>
          <p className="text-gray-500">@{profile.login}</p>
        </div>
      </div>

      {profile.description && (
        <p className="mt-4 text-gray-700">{profile.description}</p>
      )}

      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="text-center p-3 bg-gray-50 rounded">
          <p className="text-sm text-gray-500">Total Views</p>
          <p className="text-xl font-semibold">
            {profile.view_count.toLocaleString()}
          </p>
        </div>

        <div className="text-center p-3 bg-gray-50 rounded">
          <p className="text-sm text-gray-500">Type</p>
          <p className="text-xl font-semibold capitalize">
            {profile.broadcaster_type || "Standard"}
          </p>
        </div>
      </div>

      <div className="mt-4">
        <a
          href={`https://twitch.tv/${profile.login}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
        >
          View Channel
        </a>
      </div>
    </div>
  );
}
