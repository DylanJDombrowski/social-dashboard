import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function GET(request: NextRequest) {
  // Get the refresh token from cookies
  const refreshToken = request.cookies.get("twitch_refresh_token")?.value;

  if (!refreshToken) {
    return NextResponse.json(
      { error: "No refresh token available" },
      { status: 401 }
    );
  }

  try {
    // Exchange refresh token for new access token
    const response = await axios.post(
      "https://id.twitch.tv/oauth2/token",
      null,
      {
        params: {
          grant_type: "refresh_token",
          refresh_token: refreshToken,
          client_id: process.env.TWITCH_CLIENT_ID,
          client_secret: process.env.TWITCH_CLIENT_SECRET,
        },
      }
    );

    const { access_token, refresh_token, expires_in } = response.data;

    // Create response
    const apiResponse = NextResponse.json({ success: true });

    // Set new cookies
    apiResponse.cookies.set({
      name: "twitch_access_token",
      value: access_token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: expires_in,
      path: "/",
      sameSite: "lax",
    });

    if (refresh_token) {
      apiResponse.cookies.set({
        name: "twitch_refresh_token",
        value: refresh_token,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: "/",
        sameSite: "lax",
      });
    }

    return apiResponse;
  } catch (error) {
    console.error("Error refreshing token:", error);

    // Clear invalid tokens
    const errorResponse = NextResponse.json(
      { error: "Failed to refresh token" },
      { status: 401 }
    );

    errorResponse.cookies.delete("twitch_access_token");
    errorResponse.cookies.delete("twitch_refresh_token");
    errorResponse.cookies.delete("twitch_user_id");

    return errorResponse;
  }
}
