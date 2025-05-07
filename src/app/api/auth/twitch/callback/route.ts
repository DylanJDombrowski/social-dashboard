// src/app/api/auth/twitch/callback/route.ts
import { NextRequest, NextResponse } from "next/server";

// SECURITY WARNING: Only use this in development
if (process.env.NODE_ENV !== "production") {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  console.log("Auth callback received:", { code, state, error });

  if (error) {
    console.error("Auth error:", error);
    return NextResponse.redirect(new URL("/?error=auth_failed", request.url));
  }

  if (!code) {
    console.error("No authorization code received");
    return NextResponse.redirect(new URL("/?error=no_code", request.url));
  }

  try {
    console.log("Exchanging code for token using fetch...");

    // Construct URL and params for token request
    const params = new URLSearchParams({
      client_id: process.env.TWITCH_CLIENT_ID || "",
      client_secret: process.env.TWITCH_CLIENT_SECRET || "",
      code,
      grant_type: "authorization_code",
      redirect_uri: `${request.nextUrl.origin}/api/auth/twitch/callback`,
    });

    // Use fetch instead of axios
    const tokenResponse = await fetch(`https://id.twitch.tv/oauth2/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      throw new Error(
        `Token exchange failed: ${tokenResponse.status} ${errorData}`
      );
    }

    const tokenData = await tokenResponse.json();
    console.log("Token response received");

    const { access_token, refresh_token, expires_in } = tokenData;

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

    console.log("Redirecting to dashboard with success");
    return response;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Error exchanging code for token:", error.message);
    return NextResponse.redirect(
      new URL(
        `/dashboard?error=token_exchange_failed&details=${encodeURIComponent(
          error.message
        )}`,
        request.url
      )
    );
  }
}
