"use client";

import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// Mock data - replace with real API data later
const mockData = [
  { date: "Jan", Twitch: 240 },
  { date: "Feb", Twitch: 300 },
  { date: "Mar", Twitch: 350 },
  { date: "Apr", Twitch: 410 },
  { date: "May", Twitch: 490 },
];

interface FollowerData {
  date: string;
  Twitch: number;
  YouTube?: number;
  TikTok?: number;
  Twitter?: number;
}

export default function FollowerChart() {
  const [data, setData] = useState<FollowerData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real implementation, fetch data from your API
    // For now, use mock data
    const fetchData = async () => {
      try {
        // Replace with actual API calls
        // const twitchData = await fetchTwitchFollowerHistory();

        // For now, use mock data
        setData(mockData);
      } catch (error) {
        console.error("Error fetching follower data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md animate-pulse h-80">
        <div className="h-6 bg-gray-200 rounded w-1/4 mb-6"></div>
        <div className="h-64 bg-gray-100 rounded"></div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-medium mb-4">Follower Growth</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="Twitch"
            stroke="#6441a5"
            activeDot={{ r: 8 }}
          />
          {/* Add more lines as you add platforms */}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
