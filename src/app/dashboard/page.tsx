// src/app/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import SocialDashboard from "../../components/dashboard/SocialDashboard";

export default function Dashboard() {
  const searchParams = useSearchParams();
  const [authStatus, setAuthStatus] = useState<string | null>(null);

  useEffect(() => {
    // Check for auth success parameter
    const auth = searchParams.get("auth");
    if (auth === "success") {
      setAuthStatus("Successfully authenticated with Twitch!");
    }
  }, [searchParams]);

  return (
    <>
      {authStatus && (
        <div className="fixed top-0 left-0 right-0 bg-green-100 text-green-800 p-3 text-center z-50">
          {authStatus}
        </div>
      )}
      <SocialDashboard />
    </>
  );
}
