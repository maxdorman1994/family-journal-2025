import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import SyncStatus from "@/components/SyncStatus";

interface EnvironmentStatus {
  database: boolean;
  storage: boolean;
  api: boolean;
  environment: string;
}

export default function Debug() {
  const [status, setStatus] = useState<EnvironmentStatus | null>(null);
  const [loading, setLoading] = useState(false);

  const checkEnvironment = async () => {
    setLoading(true);
    try {
      // Check API endpoint
      const apiResponse = await fetch("/api/ping");
      const apiData = await apiResponse.json();

      // Check database and storage status
      const [dbResponse, storageResponse] = await Promise.all([
        fetch("/api/database/status"),
        fetch("/api/storage/status")
      ]);

      const dbData = await dbResponse.json();
      const storageData = await storageResponse.json();

      setStatus({
        api: apiResponse.ok,
        storage: storageData.configured || false,
        database: dbData.configured || false,
        environment: apiData.environment || "unknown",
      });
    } catch (error) {
      console.error("Environment check failed:", error);
      setStatus({
        api: false,
        storage: false,
        database: false,
        environment: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkEnvironment();
  }, []);

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">System Status</h1>

      <div className="space-y-4">
        <div className="border rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-3">Environment Check</h2>

          {loading ? (
            <p>Checking environment...</p>
          ) : status ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span>API Server</span>
                <span
                  className={`px-2 py-1 rounded text-sm ${
                    status.api
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {status.api ? "✅ Connected" : "❌ Disconnected"}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span>Cloudflare Images</span>
                <span
                  className={`px-2 py-1 rounded text-sm ${
                    status.cloudflare
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {status.cloudflare
                    ? "✅ Configured"
                    : "⚠️ Using Placeholders"}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span>Supabase Database</span>
                <span
                  className={`px-2 py-1 rounded text-sm ${
                    status.supabase
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {status.supabase ? "✅ Configured" : "❌ Not Configured"}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span>Platform</span>
                <span className="px-2 py-1 rounded text-sm bg-blue-100 text-blue-800">
                  {status.environment}
                </span>
              </div>
            </div>
          ) : (
            <p>Failed to check environment</p>
          )}

          <Button
            onClick={checkEnvironment}
            className="mt-4"
            disabled={loading}
          >
            {loading ? "Checking..." : "Refresh Status"}
          </Button>
        </div>

        <div className="border rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-3">Backend Configuration</h2>
          <div className="space-y-1 text-sm">
            <div>
              <strong>Database:</strong>{" "}
              {status?.database ? "✅ Connected" : "❌ Not Available"}
            </div>
            <div>
              <strong>Storage:</strong>{" "}
              {status?.storage ? "✅ Connected" : "❌ Not Available"}
            </div>
            <div>
              <strong>API:</strong>{" "}
              {status?.api ? "✅ Working" : "❌ Failed"}
            </div>
          </div>
        </div>

        <SyncStatus showDetails={true} className="border-2 border-blue-200" />
      </div>
    </div>
  );
}
