"use client";

import { useState, useEffect } from "react";
import { getTwitchTokens } from "@/lib/api/twitch";

export function useAuth() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [connectedPlatforms, setConnectedPlatforms] = useState<string[]>([]);

  useEffect(() => {
    // Check which platforms are connected
    const checkConnections = () => {
      const connected: string[] = [];

      // Check Twitch
      if (getTwitchTokens()) {
        connected.push("twitch");
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
