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

    // Using only valid scopes (removed channel:read:analytics)
    authUrl.searchParams.append(
      "scope",
      [
        "user:read:email",
        "user:read:follows",
        "channel:read:subscriptions",
        "moderator:read:followers",
      ].join(" ")
    );

    // Add state for security
    const state = Math.random().toString(36).substring(2, 15);
    localStorage.setItem("twitch_auth_state", state);
    authUrl.searchParams.append("state", state);

    // Log for debugging
    console.log("Redirecting to Twitch auth:", authUrl.toString());

    // Redirect to Twitch
    window.location.href = authUrl.toString();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 to-purple-900 text-white">
      <div className="max-w-md w-full bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg p-8 rounded-lg shadow-lg text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-purple-600 rounded-full flex items-center justify-center">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="white">
            <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold mb-4">Connecting to Twitch</h1>
        <p className="mb-6">
          You will be redirected to Twitch to authorize access to your channel
          data.
        </p>

        <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
          <div
            className="bg-purple-500 h-full animate-pulse"
            style={{ width: "90%" }}
          ></div>
        </div>
      </div>
    </div>
  );
}
