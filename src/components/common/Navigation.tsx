// src/components/common/Navigation.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="bg-white p-4 shadow">
      <div className="flex space-x-4">
        <Link
          href="/"
          className={`px-3 py-2 rounded ${
            pathname === "/" ? "bg-blue-100" : ""
          }`}
        >
          Home
        </Link>
        <Link
          href="/connect/twitch"
          className={`px-3 py-2 rounded ${
            pathname === "/connect/twitch" ? "bg-blue-100" : ""
          }`}
        >
          Connect Twitch
        </Link>
        <Link
          href="/dashboard"
          className={`px-3 py-2 rounded ${
            pathname.startsWith("/dashboard") ? "bg-blue-100" : ""
          }`}
        >
          Dashboard
        </Link>
      </div>
    </nav>
  );
}
