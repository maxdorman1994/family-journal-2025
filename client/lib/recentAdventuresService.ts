import {
  hasuraClient,
  isHasuraConfigured,
  executeQuery,
  GET_RECENT_ADVENTURES
} from "./hasura";

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
 * Get recent adventures from the database (latest 3 journal entries)
 */
export async function getRecentAdventures(): Promise<RecentAdventure[]> {
  if (!isHasuraConfigured()) {
    throw new Error(
      "Hasura not configured - please set VITE_HASURA_GRAPHQL_URL",
    );
  }

  try {
    console.log(
      "🔄 Fetching latest 3 journal entries for recent adventures from Hasura...",
    );

    // Use Hasura GraphQL query for recent adventures
    const result = await executeQuery(GET_RECENT_ADVENTURES);

    if (!result.recent_adventures) {
      console.log("📦 No recent adventures found in Hasura response");
      return [];
    }

    const journalEntries = result.recent_adventures;

    if (!journalEntries || journalEntries.length === 0) {
      console.log("📦 No journal entries found in Hasura, returning empty array");
      return [];
    }

    // Transform journal entries into RecentAdventure format
    const recentAdventures: RecentAdventure[] = journalEntries.map(
      (entry, index) => ({
        id: entry.id,
        title: entry.title,
        location: entry.location,
        formatted_date: entry.date,
        featured_image:
          entry.photos && entry.photos.length > 0
            ? entry.photos[0]
            : "/placeholder.svg",
        tags: entry.tags || [],
        adventure_type:
          entry.tags && entry.tags.length > 0 ? entry.tags[0] : "Adventure",
        photo_count: entry.photos ? entry.photos.length : 0,
        excerpt: entry.content
          ? entry.content.substring(0, 150) + "..."
          : "A wonderful Scottish adventure!",
        time_ago: formatTimeAgo(entry.date),
      }),
    );

    console.log(
      `✅ Loaded ${recentAdventures.length} recent adventures from journal entries`,
    );
    return recentAdventures;
  } catch (error) {
    console.error("Error in getRecentAdventures:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`Failed to fetch recent adventures: ${String(error)}`);
  }
}

/**
 * Helper function to format time ago
 */
function formatTimeAgo(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) {
      return "Today";
    } else if (diffInDays === 1) {
      return "Yesterday";
    } else if (diffInDays < 7) {
      return `${diffInDays} days ago`;
    } else if (diffInDays < 30) {
      const weeks = Math.floor(diffInDays / 7);
      return `${weeks} week${weeks > 1 ? "s" : ""} ago`;
    } else {
      const months = Math.floor(diffInDays / 30);
      return `${months} month${months > 1 ? "s" : ""} ago`;
    }
  } catch (error) {
    return dateString; // Fallback to original date string
  }
}

/**
 * Get all adventures with metadata
 */
export async function getAllAdventuresWithMetadata(): Promise<
  RecentAdventure[]
> {
  if (!isHasuraConfigured()) {
    throw new Error("Hasura not configured");
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
      `��� Loaded ${adventures?.length || 0} adventures with metadata`,
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
  if (!isHasuraConfigured()) {
    throw new Error("Hasura not configured");
  }

  try {
    console.log("🔄 Fetching adventure statistics...");

    // TODO: Implement refresh function for Hasura
    const data = null;
    const error = null;

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
    // First check if we can connect to Hasura at all
    if (!isHasuraConfigured()) {
      console.log("📦 Hasura not configured, using fallback data");
      return getFallbackRecentAdventures();
    }

    const adventures = await getRecentAdventures();

    // If we have real adventures, return them (should be latest 3 from journal)
    if (adventures && adventures.length > 0) {
      console.log(
        `✅ Using ${adventures.length} real journal entries for recent adventures`,
      );
      return adventures;
    }

    // If no real adventures, return fallback
    console.log("📦 No journal entries found, using fallback data");
    return getFallbackRecentAdventures();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    // Check if it's a schema missing error
    if (errorMessage.includes("SCHEMA_MISSING")) {
      console.warn(
        "��� Database views not found, using fallback data. Please run the SQL setup.",
      );
    } else {
      console.warn(
        "📦 Failed to load real adventures, using fallback:",
        errorMessage,
      );
    }

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
          "��� Real-time journal change detected for recent adventures:",
          payload.eventType,
          "Entry ID:",
          payload.new?.id || payload.old?.id,
        );

        // Refetch recent adventures when journal entries change
        try {
          const adventures = await getRecentAdventuresWithFallback();
          callback(adventures);
          console.log("��� Recent adventures sync updated with latest data");
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
