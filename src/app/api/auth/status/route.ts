// src/app/api/auth/status/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const twitchToken = request.cookies.get("twitch_access_token")?.value;
  const youtubeToken = request.cookies.get("youtube_access_token")?.value;

  return NextResponse.json({
    authenticated: {
      twitch: !!twitchToken,
      youtube: !!youtubeToken,
      tiktok: false,
      twitter: false,
    },
  });
}
