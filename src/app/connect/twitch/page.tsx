// src/app/connect/twitch/page.tsx
"use client";

import { useEffect } from "react";

export default function ConnectTwitch() {
  useEffect(() => {
    // Build Twitch authorization URL
    const authUrl = new URL("https://id.twitch.tv/oauth2/authorize");
    authUrl.searchParams.append(
      "client_id",
      process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID || ""
    );
    authUrl.searchParams.append(
      "redirect_uri",
      `${window.location.origin}/api/auth/twitch/callback`
    );
    authUrl.searchParams.append("response_type", "code");
    authUrl.searchParams.append("scope", "user:read:email");

    // Log the URL for debugging
    console.log("Redirecting to:", authUrl.toString());

    // Redirect to Twitch
    window.location.href = authUrl.toString();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Connecting to Twitch...</h1>
      <p>You will be redirected to Twitch for authorization.</p>
    </div>
  );
}
