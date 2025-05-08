"use client";

import { useState, useEffect } from "react";
import { getTwitchToken } from "@/lib/api/twitch";
import { getYouTubeToken } from "@/lib/api/youtube";

export function useAuth() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [connectedPlatforms, setConnectedPlatforms] = useState<string[]>([]);

  useEffect(() => {
    // Check which platforms are connected
    const checkConnections = () => {
      const connected: string[] = [];

      // Check Twitch
      if (getTwitchToken()) {
        connected.push("twitch");
      }

      // Check YouTube
      if (getYouTubeToken()) {
        connected.push("youtube");
      }

      // Add checks for other platforms as you implement them

      setConnectedPlatforms(connected);
      setIsLoaded(true);
    };

    checkConnections();
  }, []);

  return {
    isLoaded,
    connectedPlatforms,
  };
}
