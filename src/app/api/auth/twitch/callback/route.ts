// src/app/api/auth/twitch/callback/route.ts
import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  console.log("Auth callback received:", { code, error });

  if (error) {
    console.error("Auth error:", error);
    return NextResponse.redirect(new URL("/?error=auth_failed", request.url));
  }

  if (!code) {
    return NextResponse.redirect(new URL("/?error=no_code", request.url));
  }

  try {
    // Exchange the authorization code for access tokens
    const tokenResponse = await axios.post(
      "https://id.twitch.tv/oauth2/token",
      null,
      {
        params: {
          client_id: process.env.TWITCH_CLIENT_ID,
          client_secret: process.env.TWITCH_CLIENT_SECRET,
          code,
          grant_type: "authorization_code",
          redirect_uri: `${request.nextUrl.origin}/api/auth/twitch/callback`,
        },
      }
    );

    const { access_token, refresh_token, expires_in } = tokenResponse.data;

    // Create response with redirect
    const response = NextResponse.redirect(
      new URL("/dashboard?auth=success", request.url)
    );

    // Set secure HTTP-only cookies
    response.cookies.set({
      name: "twitch_access_token",
      value: access_token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: expires_in,
      path: "/",
      sameSite: "lax",
    });

    if (refresh_token) {
      response.cookies.set({
        name: "twitch_refresh_token",
        value: refresh_token,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: "/",
        sameSite: "lax",
      });
    }

    return response;
  } catch (error) {
    console.error("Error exchanging code for token:", error);
    return NextResponse.redirect(
      new URL("/dashboard?error=token_exchange_failed", request.url)
    );
  }
}
