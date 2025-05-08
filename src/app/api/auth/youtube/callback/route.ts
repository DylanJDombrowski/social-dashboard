/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import https from "https";
import { cookies } from "next/headers";

interface YouTubeTokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
  scope: string;
}

interface YouTubeUserResponse {
  items: [
    {
      id: string;
      snippet: {
        title: string;
        description: string;
        customUrl: string;
        thumbnails: {
          default: {
            url: string;
          };
          medium: {
            url: string;
          };
          high: {
            url: string;
          };
        };
      };
      statistics: {
        viewCount: string;
        subscriberCount: string;
        videoCount: string;
      };
    }
  ];
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  // Get URL parameters
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");

  // Handle authorization errors
  if (error) {
    console.error(`YouTube auth error: ${error}`);
    return NextResponse.redirect(
      `${url.origin}/auth/error?message=${encodeURIComponent(
        "YouTube authentication failed"
      )}`
    );
  }

  // Get cookie store
  const cookieStore = await cookies();

  // Verify state parameter
  const storedState = cookieStore.get("youtube_auth_state")?.value;

  if (!state || !storedState || state !== storedState) {
    console.error("State parameter mismatch - possible CSRF attack");
    return NextResponse.redirect(
      `${url.origin}/auth/error?message=Invalid+authentication+state`
    );
  }

  // Clear state cookie
  cookieStore.set("youtube_auth_state", "", { maxAge: -1 });

  if (!code) {
    console.error("No authorization code received from YouTube");
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
    const tokenResponse = await axiosInstance.post<YouTubeTokenResponse>(
      "https://oauth2.googleapis.com/token",
      {
        client_id: process.env.YOUTUBE_CLIENT_ID,
        client_secret: process.env.YOUTUBE_CLIENT_SECRET,
        code,
        grant_type: "authorization_code",
        redirect_uri: `${
          process.env.NEXT_PUBLIC_BASE_URL || url.origin
        }/api/auth/youtube/callback`,
      }
    );

    const { access_token, refresh_token, expires_in } = tokenResponse.data;

    if (!access_token) {
      throw new Error("No access token received from YouTube");
    }

    // Fetch user channel
    const userResponse = await axiosInstance.get<YouTubeUserResponse>(
      "https://www.googleapis.com/youtube/v3/channels",
      {
        params: {
          part: "snippet,statistics",
          mine: true,
        },
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    const channelData = userResponse.data.items[0];

    // Set cookies
    const secure = process.env.NODE_ENV === "production";

    // Store access token
    cookieStore.set("youtube_access_token", access_token, {
      httpOnly: true,
      secure,
      maxAge: expires_in,
      sameSite: "lax",
    });

    // Store refresh token
    if (refresh_token) {
      cookieStore.set("youtube_refresh_token", refresh_token, {
        httpOnly: true,
        secure,
        maxAge: 30 * 24 * 60 * 60, // 30 days
        sameSite: "lax",
      });
    }

    // Store user info
    const userInfo = {
      id: channelData.id,
      title: channelData.snippet.title,
      customUrl: channelData.snippet.customUrl,
      thumbnail: channelData.snippet.thumbnails.high.url,
      subscriberCount: channelData.statistics.subscriberCount,
      viewCount: channelData.statistics.viewCount,
      videoCount: channelData.statistics.videoCount,
      authenticated: true,
      expires_at: new Date(Date.now() + expires_in * 1000).toISOString(),
    };

    cookieStore.set("youtube_user", JSON.stringify(userInfo), {
      secure,
      maxAge: expires_in,
      sameSite: "lax",
    });

    // Redirect to dashboard
    return NextResponse.redirect(
      `${url.origin}/dashboard?auth=success&platform=youtube`
    );
  } catch (error: any) {
    console.error(
      "Error during YouTube authentication:",
      error?.response?.data || error?.message
    );

    let errorMessage = "Failed to authenticate with YouTube";

    if (error?.response) {
      if (error.response?.status === 401) {
        errorMessage = "Unauthorized: Invalid client credentials";
      } else if (error.response?.status === 400) {
        const responseData = error.response?.data as {
          error_description?: string;
        };
        errorMessage =
          "Bad request: " +
          (responseData.error_description || "Invalid parameters");
      }
    }

    return NextResponse.redirect(
      `${url.origin}/auth/error?message=${encodeURIComponent(errorMessage)}`
    );
  }
}
