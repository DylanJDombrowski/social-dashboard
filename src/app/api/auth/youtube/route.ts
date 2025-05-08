import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { nanoid } from "nanoid";

export async function GET(request: NextRequest): Promise<NextResponse> {
  // Generate state param for CSRF protection
  const state = nanoid();
  const url = new URL(request.url);

  // Store state in cookie
  const cookieStore = cookies();
  (await cookieStore).set("youtube_auth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 10 * 60, // 10 minutes
    sameSite: "lax",
  });

  // Build auth URL
  const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  authUrl.searchParams.append(
    "client_id",
    process.env.YOUTUBE_CLIENT_ID as string
  );
  authUrl.searchParams.append(
    "redirect_uri",
    `${
      process.env.NEXT_PUBLIC_BASE_URL || url.origin
    }/api/auth/youtube/callback`
  );
  authUrl.searchParams.append("response_type", "code");
  authUrl.searchParams.append(
    "scope",
    "https://www.googleapis.com/auth/youtube.readonly"
  );
  authUrl.searchParams.append("state", state);
  authUrl.searchParams.append("access_type", "offline");
  authUrl.searchParams.append("prompt", "consent");

  return NextResponse.redirect(authUrl.toString());
}
