/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import https from "https";
import { cookies } from "next/headers";
import { TwitchTokenResponse, TwitchUserResponse } from "@/types/twitch";

export async function GET(request: NextRequest): Promise<NextResponse> {
  // Get URL parameters
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");
  const error_description = url.searchParams.get("error_description");

  // Handle authorization errors
  if (error) {
    console.error(`Twitch auth error: ${error}`, error_description);
    return NextResponse.redirect(
      `${url.origin}/auth/error?message=${encodeURIComponent(
        error_description || "Authentication failed"
      )}`
    );
  }

  // Get cookie store
  const cookieStore = await cookies();

  // Verify state parameter
  const storedState = cookieStore.get("twitch_auth_state")?.value;

  if (!state || !storedState || state !== storedState) {
    console.error("State parameter mismatch - possible CSRF attack");
    return NextResponse.redirect(
      `${url.origin}/auth/error?message=Invalid+authentication+state`
    );
  }

  // Clear state cookie - no need to delete in App Router, just set with negative maxAge
  cookieStore.set("twitch_auth_state", "", { maxAge: -1 });

  if (!code) {
    console.error("No authorization code received from Twitch");
    return NextResponse.redirect(
      `${url.origin}/auth/error?message=No+authorization+code+received`
    );
  }

  try {
    // Create axios instance with SSL configuration (for development only)
    const axiosInstance = axios.create({
      ...(process.env.NODE_ENV === "development" && {
        httpsAgent: new https.Agent({
          rejectUnauthorized: false, // Only use in development
        }),
      }),
    });

    // Exchange code for tokens
    const tokenResponse = await axiosInstance.post<TwitchTokenResponse>(
      "https://id.twitch.tv/oauth2/token",
      null,
      {
        params: {
          client_id: process.env.TWITCH_CLIENT_ID,
          client_secret: process.env.TWITCH_CLIENT_SECRET,
          code,
          grant_type: "authorization_code",
          redirect_uri: `${
            process.env.NEXT_PUBLIC_BASE_URL || url.origin
          }/api/auth/twitch/callback`,
        },
      }
    );

    const { access_token, refresh_token, expires_in } = tokenResponse.data;

    if (!access_token) {
      throw new Error("No access token received from Twitch");
    }

    // Fetch user profile
    const userResponse = await axiosInstance.get<TwitchUserResponse>(
      "https://api.twitch.tv/helix/users",
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
          "Client-Id": process.env.TWITCH_CLIENT_ID as string,
        },
      }
    );

    const userData = userResponse.data.data[0];

    // Set cookies
    const secure = process.env.NODE_ENV === "production";

    // Store access token
    cookieStore.set("twitch_access_token", access_token, {
      httpOnly: true,
      secure,
      maxAge: expires_in,
      sameSite: "lax",
    });

    // Store refresh token
    if (refresh_token) {
      cookieStore.set("twitch_refresh_token", refresh_token, {
        httpOnly: true,
        secure,
        maxAge: 30 * 24 * 60 * 60, // 30 days
        sameSite: "lax",
      });
    }

    // Store user info
    const userInfo = {
      id: userData.id,
      login: userData.login,
      display_name: userData.display_name,
      profile_image_url: userData.profile_image_url,
      authenticated: true,
      expires_at: new Date(Date.now() + expires_in * 1000).toISOString(),
    };

    cookieStore.set("twitch_user", JSON.stringify(userInfo), {
      secure,
      maxAge: expires_in,
      sameSite: "lax",
    });

    // Redirect to dashboard
    return NextResponse.redirect(`${url.origin}/dashboard?auth=success`);
  } catch (error: any) {
    console.error(
      "Error during Twitch authentication:",
      error?.response?.data || error?.message
    );

    let errorMessage = "Failed to authenticate with Twitch";

    if (error?.response) {
      if (error.response?.status === 401) {
        errorMessage = "Unauthorized: Invalid client credentials";
      } else if (error.response?.status === 400) {
        const responseData = error.response?.data as {
          message?: string;
        };
        errorMessage =
          "Bad request: " + (responseData.message || "Invalid parameters");
      }
    }

    return NextResponse.redirect(
      `${url.origin}/auth/error?message=${encodeURIComponent(errorMessage)}`
    );
  }
}
