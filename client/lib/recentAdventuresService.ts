import { supabase, isSupabaseConfigured } from "./supabase";

/**
 * Recent Adventures Service
 * Fetches real recent journal entries for the home page
 */

export interface RecentAdventure {
  id: string;
  title: string;
  location: string;
  formatted_date: string;
  featured_image: string;
  tags: string[];
  adventure_type: string;
  photo_count: number;
  excerpt: string;
  time_ago?: string;
}

export interface AdventureStats {
  total_adventures: number;
  recent_count: number;
  latest_adventure: string;
  oldest_adventure: string;
}

/**
 * Get recent adventures from the database (latest 3)
 */
export async function getRecentAdventures(): Promise<RecentAdventure[]> {
  if (!isSupabaseConfigured()) {
    throw new Error(
      "Supabase not configured - please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY",
    );
  }

  try {
    console.log("🔄 Fetching recent adventures from database...");

    const { data: adventures, error } = await supabase
      .from("recent_adventures")
      .select("*");

    if (error) {
      console.error("Error fetching recent adventures:", error);
      // Check if it's a table/view not found error
      if (
        error.message.includes("Could not find the table") ||
        error.message.includes('relation "recent_adventures" does not exist')
      ) {
        throw new Error("SCHEMA_MISSING: Database views not found");
      }
      throw new Error(`Failed to fetch recent adventures: ${error.message}`);
    }

    console.log(`✅ Loaded ${adventures?.length || 0} recent adventures`);
    return adventures || [];
  } catch (error) {
    console.error("Error in getRecentAdventures:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`Failed to fetch recent adventures: ${String(error)}`);
  }
}

/**
 * Get all adventures with metadata
 */
export async function getAllAdventuresWithMetadata(): Promise<
  RecentAdventure[]
> {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase not configured");
  }

  try {
    console.log("🔄 Fetching all adventures with metadata...");

    const { data: adventures, error } = await supabase
      .from("adventures_with_metadata")
      .select(
        "id, title, location, formatted_date, featured_image, tags, adventure_type, photo_count, excerpt, time_ago",
      )
      .limit(10); // Get latest 10

    if (error) {
      console.error("Error fetching adventures metadata:", error);
      throw new Error(`Failed to fetch adventures metadata: ${error.message}`);
    }

    console.log(
      `✅ Loaded ${adventures?.length || 0} adventures with metadata`,
    );
    return adventures || [];
  } catch (error) {
    console.error("Error in getAllAdventuresWithMetadata:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`Failed to fetch adventures metadata: ${String(error)}`);
  }
}

/**
 * Get adventure statistics
 */
export async function getAdventureStats(): Promise<AdventureStats> {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase not configured");
  }

  try {
    console.log("🔄 Fetching adventure statistics...");

    const { data, error } = await supabase.rpc("refresh_recent_adventures");

    if (error) {
      console.error("Error fetching adventure stats:", error);
      throw new Error(`Failed to fetch adventure stats: ${error.message}`);
    }

    console.log("✅ Adventure stats loaded:", data);
    return (
      data?.[0] || {
        total_adventures: 0,
        recent_count: 0,
        latest_adventure: "",
        oldest_adventure: "",
      }
    );
  } catch (error) {
    console.error("Error in getAdventureStats:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`Failed to fetch adventure stats: ${String(error)}`);
  }
}

/**
 * Get fallback recent adventures for when database is unavailable
 */
export function getFallbackRecentAdventures(): RecentAdventure[] {
  return [
    {
      id: "fallback-1",
      title: "Ben Nevis Summit",
      location: "Fort William",
      formatted_date: "3 August 2025",
      featured_image: "/placeholder.svg",
      tags: ["Mountain", "Challenge", "Views"],
      adventure_type: "Mountain",
      photo_count: 12,
      excerpt:
        "Our most challenging adventure yet! The weather was perfect as we made our way to Scotland's highest peak...",
    },
    {
      id: "fallback-2",
      title: "Loch Lomond Picnic",
      location: "Balloch",
      formatted_date: "28 July 2025",
      featured_image: "/placeholder.svg",
      tags: ["Lake", "Family", "Relaxing"],
      adventure_type: "Water",
      photo_count: 8,
      excerpt:
        "A perfect family day by the bonnie banks of Loch Lomond. The kids loved skipping stones while we enjoyed...",
    },
    {
      id: "fallback-3",
      title: "Edinburgh Castle Visit",
      location: "Edinburgh",
      formatted_date: "15 July 2025",
      featured_image: "/placeholder.svg",
      tags: ["History", "Culture", "City"],
      adventure_type: "Historic",
      photo_count: 15,
      excerpt:
        "Stepping back in time at this iconic fortress. The views over Edinburgh from the castle ramparts were...",
    },
  ];
}

/**
 * Get recent adventures with fallback
 */
export async function getRecentAdventuresWithFallback(): Promise<
  RecentAdventure[]
> {
  try {
    const adventures = await getRecentAdventures();

    // If we have real adventures, return them
    if (adventures && adventures.length > 0) {
      return adventures;
    }

    // If no real adventures, return fallback
    console.log("📦 No real adventures found, using fallback data");
    return getFallbackRecentAdventures();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.warn(
      "Failed to load real adventures, using fallback:",
      errorMessage,
    );
    return getFallbackRecentAdventures();
  }
}

/**
 * Subscribe to real-time changes in journal entries (for recent adventures)
 */
export function subscribeToAdventureUpdates(
  callback: (adventures: RecentAdventure[]) => void,
) {
  if (!isSupabaseConfigured()) {
    console.warn("Supabase not configured, skipping real-time subscription");
    return () => {}; // Return empty unsubscribe function
  }

  console.log("🔄 Setting up real-time recent adventures sync...");

  const subscription = supabase
    .channel("journal_entries_for_recent_adventures")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "journal_entries",
      },
      async (payload) => {
        console.log(
          "📡 Real-time journal change detected for recent adventures:",
          payload.eventType,
        );

        // Refetch recent adventures when journal entries change
        try {
          const adventures = await getRecentAdventuresWithFallback();
          callback(adventures);
          console.log("✅ Recent adventures sync updated with latest data");
        } catch (error) {
          console.error(
            "Error in real-time recent adventures subscription:",
            error,
          );
        }
      },
    )
    .subscribe((status) => {
      console.log("📡 Recent adventures subscription status:", status);
    });

  console.log("✅ Real-time recent adventures sync enabled");

  return () => {
    console.log("🔌 Unsubscribing from recent adventures changes");
    subscription.unsubscribe();
  };
}

/**
 * Test connection for recent adventures
 */
export async function testRecentAdventuresConnection(): Promise<{
  success: boolean;
  message: string;
  error?: string;
}> {
  if (!isSupabaseConfigured()) {
    return {
      success: false,
      message: "Supabase not configured",
      error: "Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY",
    };
  }

  try {
    console.log("🔍 Testing recent adventures database connection...");

    // Test if the view exists and works
    const { data, error } = await supabase
      .from("recent_adventures")
      .select("*", { count: "exact", head: true });

    if (error) {
      if (
        error.message.includes("Could not find the table") ||
        error.message.includes('relation "recent_adventures" does not exist')
      ) {
        return {
          success: false,
          message:
            "Database views not found - please run recent-adventures-view.sql",
          error: "Views missing: recent_adventures, adventures_with_metadata",
        };
      }
      return {
        success: false,
        message: "Database connection failed",
        error: error.message,
      };
    }

    // Get actual stats
    try {
      const stats = await getAdventureStats();
      return {
        success: true,
        message: `✅ Recent adventures connected! Found ${stats.total_adventures} total adventure${stats.total_adventures !== 1 ? "s" : ""}, ${stats.recent_count} recent.`,
      };
    } catch (statsError) {
      return {
        success: true,
        message:
          "✅ Recent adventures view connected! (Stats function not available)",
      };
    }
  } catch (error) {
    return {
      success: false,
      message: "Connection test failed",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
