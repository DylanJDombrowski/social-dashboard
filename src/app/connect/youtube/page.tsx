// src/app/connect/youtube/page.tsx
"use client";

import { useEffect } from "react";

export default function YouTubeConnectPage() {
  useEffect(() => {
    // Directly redirect to your API route which handles the auth URL building
    window.location.href = "/api/auth/youtube";
  }, []);

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
        <p className="text-lg">Connecting to YouTube...</p>
      </div>
    </div>
  );
}
