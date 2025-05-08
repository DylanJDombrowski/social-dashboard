// pages/api/auth/twitch/validate.ts
import { NextApiRequest, NextApiResponse } from "next";
import axios, { AxiosError } from "axios";
import { getCookie, setCookie } from "cookies-next";
import { TwitchUserResponse, TwitchUserInfo } from "../../../../types/twitch";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Get access token from cookie
  const accessToken = getCookie("twitch_access_token", { req, res });

  if (!accessToken) {
    return res.status(401).json({
      authenticated: false,
      error: "No Twitch access token found. Please authenticate first.",
    });
  }

  try {
    // Validate the token by making a request to Twitch API
    const userResponse = await axios.get<TwitchUserResponse>(
      "https://api.twitch.tv/helix/users",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Client-Id": process.env.TWITCH_CLIENT_ID as string,
        },
      }
    );

    const userData = userResponse.data.data[0];

    // Update the user info cookie with fresh data
    const userInfo: TwitchUserInfo = {
      id: userData.id,
      login: userData.login,
      display_name: userData.display_name,
      profile_image_url: userData.profile_image_url,
      authenticated: true,
      expires_at: getCookie("twitch_user", { req, res })
        ? JSON.parse(getCookie("twitch_user", { req, res }) as string)
            .expires_at
        : new Date(Date.now() + 3600 * 1000).toISOString(),
    };

    setCookie("twitch_user", JSON.stringify(userInfo), {
      req,
      res,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    return res.status(200).json({
      authenticated: true,
      user: userInfo,
    });
  } catch (error) {
    console.error("Error validating Twitch token:", (error as Error).message);

    // Token might be expired or invalid
    if ((error as AxiosError).response?.status === 401) {
      // Try to refresh the token if we have a refresh token
      const refreshToken = getCookie("twitch_refresh_token", { req, res });

      if (refreshToken) {
        try {
          const response = await axios.post(
            "https://id.twitch.tv/oauth2/token",
            null,
            {
              params: {
                client_id: process.env.TWITCH_CLIENT_ID,
                client_secret: process.env.TWITCH_CLIENT_SECRET,
                refresh_token: refreshToken,
                grant_type: "refresh_token",
              },
            }
          );

          const { access_token, refresh_token, expires_in } = response.data;

          // Store the new tokens
          setCookie("twitch_access_token", access_token, {
            req,
            res,
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: expires_in,
            sameSite: "lax",
          });

          if (refresh_token) {
            setCookie("twitch_refresh_token", refresh_token, {
              req,
              res,
              httpOnly: true,
              secure: process.env.NODE_ENV === "production",
              maxAge: 30 * 24 * 60 * 60, // 30 days
              sameSite: "lax",
            });
          }

          // Recursively call this handler again now that we have a new token
          return handler(req, res);
        } catch (refreshError) {
          console.error(
            "Error refreshing token:",
            (refreshError as Error).message
          );
          // Clear all cookies since the refresh failed
          [
            "twitch_access_token",
            "twitch_refresh_token",
            "twitch_user",
          ].forEach((cookie) => setCookie(cookie, "", { req, res, maxAge: 0 }));
        }
      } else {
        // Clear all cookies if we can't refresh
        ["twitch_access_token", "twitch_user"].forEach((cookie) =>
          setCookie(cookie, "", { req, res, maxAge: 0 })
        );
      }
    }

    return res.status(401).json({
      authenticated: false,
      error:
        "Invalid or expired Twitch authentication. Please re-authenticate.",
    });
  }
}
