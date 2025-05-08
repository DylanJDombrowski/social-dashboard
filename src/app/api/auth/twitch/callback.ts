// pages/api/auth/twitch/callback.ts
import { NextApiRequest, NextApiResponse } from "next";
import axios, { AxiosError } from "axios";
import { setCookie } from "cookies-next";
import { nanoid } from "nanoid";
import {
  TwitchTokenResponse,
  TwitchUserResponse,
  TwitchUserInfo,
} from "../../../../types/twitch";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  // Only allow GET requests for the callback
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { code, state, error, error_description } = req.query as {
    code?: string;
    state?: string;
    error?: string;
    error_description?: string;
  };

  // Handle authorization errors returned from Twitch
  if (error) {
    console.error(`Twitch auth error: ${error}`, error_description);
    res.redirect(
      `/auth/error?message=${encodeURIComponent(
        error_description || "Authentication failed"
      )}`
    );
    return;
  }

  // Verify the state parameter to prevent CSRF attacks
  const storedState = req.cookies.twitch_auth_state;

  if (!state || !storedState || state !== storedState) {
    console.error("State parameter mismatch - possible CSRF attack");
    res.redirect("/auth/error?message=Invalid+authentication+state");
    return;
  }

  // Clear the state cookie as it's no longer needed
  setCookie("twitch_auth_state", "", { req, res, maxAge: 0 });

  if (!code) {
    console.error("No authorization code received from Twitch");
    res.redirect("/auth/error?message=No+authorization+code+received");
    return;
  }

  try {
    // Exchange the authorization code for access and refresh tokens
    const tokenResponse = await axios.post<TwitchTokenResponse>(
      "https://id.twitch.tv/oauth2/token",
      null,
      {
        params: {
          client_id: process.env.TWITCH_CLIENT_ID,
          client_secret: process.env.TWITCH_CLIENT_SECRET,
          code,
          grant_type: "authorization_code",
          redirect_uri: `${
            process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
          }/api/auth/twitch/callback`,
        },
      }
    );

    const { access_token, refresh_token, expires_in } = tokenResponse.data;

    if (!access_token) {
      throw new Error("No access token received from Twitch");
    }

    // Fetch the user's profile to get their Twitch ID and username
    const userResponse = await axios.get<TwitchUserResponse>(
      "https://api.twitch.tv/helix/users",
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
          "Client-Id": process.env.TWITCH_CLIENT_ID as string,
        },
      }
    );

    const userData = userResponse.data.data[0];

    // Store tokens securely in HTTP-only cookies
    const secure = process.env.NODE_ENV === "production";
    const maxAge = expires_in; // In seconds

    // Store access token (HTTP-only for security)
    setCookie("twitch_access_token", access_token, {
      req,
      res,
      httpOnly: true,
      secure,
      maxAge,
      sameSite: "lax",
    });

    // Store refresh token (HTTP-only for security)
    if (refresh_token) {
      setCookie("twitch_refresh_token", refresh_token, {
        req,
        res,
        httpOnly: true,
        secure,
        maxAge: 30 * 24 * 60 * 60, // Store refresh token longer (30 days)
        sameSite: "lax",
      });
    }

    // Store user info in a regular cookie for frontend access
    const userInfo: TwitchUserInfo = {
      id: userData.id,
      login: userData.login,
      display_name: userData.display_name,
      profile_image_url: userData.profile_image_url,
      authenticated: true,
      expires_at: new Date(Date.now() + expires_in * 1000).toISOString(),
    };

    setCookie("twitch_user", JSON.stringify(userInfo), {
      req,
      res,
      secure,
      maxAge,
      sameSite: "lax",
    });

    // Redirect to dashboard or home page after successful authentication
    res.redirect("/dashboard");
  } catch (error) {
    console.error(
      "Error during Twitch authentication:",
      (error as AxiosError).response?.data || (error as Error).message
    );

    // Handle different types of errors with appropriate messages
    let errorMessage = "Failed to authenticate with Twitch";

    if ((error as AxiosError).response) {
      if ((error as AxiosError).response?.status === 401) {
        errorMessage = "Unauthorized: Invalid client credentials";
      } else if ((error as AxiosError).response?.status === 400) {
        const responseData = (error as AxiosError).response?.data as {
          message?: string;
        };
        errorMessage =
          "Bad request: " + (responseData.message || "Invalid parameters");
      }
    }

    res.redirect(`/auth/error?message=${encodeURIComponent(errorMessage)}`);
  }
}

/**
 * Initialize the Twitch auth flow
 * This is a separate function you can use in your auth initiation endpoint
 */
export function initTwitchAuth(
  req: NextApiRequest,
  res: NextApiResponse
): void {
  // Generate a random state parameter for CSRF protection
  const state = nanoid();

  // Store the state in a cookie for later verification
  setCookie("twitch_auth_state", state, {
    req,
    res,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 10 * 60, // 10 minutes
    sameSite: "lax",
  });

  // Redirect to Twitch's authorization endpoint
  const authUrl = new URL("https://id.twitch.tv/oauth2/authorize");
  authUrl.searchParams.append(
    "client_id",
    process.env.TWITCH_CLIENT_ID as string
  );
  authUrl.searchParams.append(
    "redirect_uri",
    `${
      process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
    }/api/auth/twitch/callback`
  );
  authUrl.searchParams.append("response_type", "code");
  authUrl.searchParams.append(
    "scope",
    "user:read:email user:read:follows channel:read:subscriptions moderator:read:followers"
  );
  authUrl.searchParams.append("state", state);

  res.redirect(authUrl.toString());
}
