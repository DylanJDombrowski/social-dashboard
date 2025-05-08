// pages/api/auth/twitch/index.ts
import { NextApiRequest, NextApiResponse } from "next";
import { initTwitchAuth } from "./callback";

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
): void {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Start the Twitch authentication flow
  initTwitchAuth(req, res);
}
