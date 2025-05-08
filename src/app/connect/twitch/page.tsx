// src/app/connect/twitch/page.tsx
"use client";

import { useEffect } from "react";

export default function TwitchConnectPage() {
  useEffect(() => {
    // Directly redirect to your API route which handles the auth URL building
    window.location.href = "/api/auth/twitch";
  }, []);

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
        <p className="text-lg">Connecting to Twitch...</p>
      </div>
    </div>
  );
}
