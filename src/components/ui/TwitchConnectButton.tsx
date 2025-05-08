// src/components/ui/TwitchConnectButton.tsx
"use client";

import Link from "next/link";

export default function TwitchConnectButton() {
  return (
    <Link href="/api/auth/twitch">
      <button className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white py-3 px-6 rounded-lg transition-colors shadow-md text-lg">
        <svg
          viewBox="0 0 24 24"
          width="24"
          height="24"
          fill="white"
          className="mr-2"
        >
          <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z" />
        </svg>
        Connect with Twitch
      </button>
    </Link>
  );
}
