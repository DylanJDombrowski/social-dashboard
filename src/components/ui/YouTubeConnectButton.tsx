// src/components/ui/YouTubeConnectButton.tsx
"use client";

import Link from "next/link";

export default function YouTubeConnectButton() {
  return (
    <Link href="/api/auth/youtube">
      <button className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-3 px-6 rounded-lg transition-colors shadow-md text-lg">
        <svg
          viewBox="0 0 24 24"
          width="24"
          height="24"
          fill="white"
          className="mr-2"
        >
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
        Connect with YouTube
      </button>
    </Link>
  );
}
