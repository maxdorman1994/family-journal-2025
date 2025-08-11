import { supabase, JournalEntry, isSupabaseConfigured } from "./supabase";
import { getEnvironmentInfo, debugNetworkError } from "./debug";
import { updateMilestonesFromJournalEntry } from "./milestoneTracker";

/**
 * Journal Service
 * Handles all database operations for journal entries
 * Photos are stored in Minio, URLs stored in PostgreSQL
 */

export interface CreateJournalEntryData {
  title: string;
  content: string;
  date: string;
  location: string;
  weather: string;
  mood: string;
  miles_traveled: number;
  parking: string;
  dog_friendly: boolean;
  paid_activity: boolean;
  adult_tickets: string;
  child_tickets: string;
  other_tickets: string;
  pet_notes: string;
  tags: string[];
  photos: string[]; // Minio URLs
}

/**
 * Create a new journal entry in the database
 */
export async function createJournalEntry(
  data: CreateJournalEntryData,
): Promise<JournalEntry> {
  if (!isSupabaseConfigured()) {
    throw new Error(
      "Database not configured - please set DATABASE_HOST, DATABASE_NAME, DATABASE_USER, and DATABASE_PASSWORD",
    );
  }

  try {
    const { data: entry, error } = await supabase
      .from("journal_entries")
      .insert(data)
      .single();

    if (error) {
      console.error("Database error creating journal entry:", error);
      throw new Error(
        `Database error: ${error.message || "Unknown database error"}`,
      );
    }

    // Update milestones based on the new journal entry
    try {
      await updateMilestonesFromJournalEntry(entry, "demo-user", true);
      console.log("✅ Milestones updated from new journal entry");
    } catch (milestoneError) {
      console.error("Error updating milestones:", milestoneError);
      // Don't fail the journal creation if milestone update fails
    }

    return entry;
  } catch (error) {
    console.error("Error in createJournalEntry:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`Failed to create journal entry: ${String(error)}`);
  }
}

/**
 * Get all journal entries, ordered by date (newest first)
 */
export async function getJournalEntries(): Promise<JournalEntry[]> {
  // Debug environment configuration
  const envInfo = getEnvironmentInfo();
  const supabaseValidation = validateSupabaseConfig();

  if (!isSupabaseConfigured()) {
    console.error("❌ Supabase not configured:", {
      environment: envInfo,
      validation: supabaseValidation,
    });
    throw new Error(
      "Supabase not configured - please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY",
    );
  }

  try {
    console.log("🔄 Attempting to fetch journal entries from Supabase...");
    console.log("📊 Configuration status:", { envInfo, supabaseValidation });

    const { data: entries, error } = await supabase
      .from("journal_entries")
      .select("*")
      .order("date", { ascending: false });

    if (error) {
      console.error("Supabase error fetching journal entries:", error);

      // More detailed error information
      const errorMessage =
        error.message ||
        error.details ||
        error.hint ||
        "Unknown database error";
      const errorCode = error.code || "UNKNOWN";

      console.error("Error details:", {
        message: errorMessage,
        code: errorCode,
        details: error.details,
        hint: error.hint,
      });

      throw new Error(`Supabase error (${errorCode}): ${errorMessage}`);
    }

    console.log(
      `✅ Successfully fetched ${entries?.length || 0} journal entries`,
    );
    return entries || [];
  } catch (error) {
    console.error("Error in getJournalEntries:", error);

    // Debug the network error
    debugNetworkError(error);

    // Check if it's a network error
    if (
      error instanceof TypeError &&
      error.message.includes("Failed to fetch")
    ) {
      console.error("❌ Network error: Unable to connect to Supabase");
      console.error("🔧 Possible causes:", [
        "Internet connection issue",
        "Supabase service is down",
        "Invalid Supabase URL",
        "Firewall blocking request",
        "CORS configuration issue",
      ]);
      throw new Error(
        "Network error: Unable to connect to database. Please check your internet connection and Supabase configuration.",
      );
    }

    // Check if it's a CORS error
    if (error instanceof TypeError && error.message.includes("CORS")) {
      console.error("❌ CORS error: Invalid Supabase configuration");
      throw new Error(
        "CORS error: Invalid Supabase URL or configuration. Please check your environment variables.",
      );
    }

    if (error instanceof Error) {
      throw error;
    }

    throw new Error(`Failed to fetch journal entries: ${String(error)}`);
  }
}

/**
 * Get a single journal entry by ID
 */
export async function getJournalEntry(
  id: string,
): Promise<JournalEntry | null> {
  const { data: entry, error } = await supabase
    .from("journal_entries")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null; // Entry not found
    }
    console.error("Error fetching journal entry:", error);
    throw new Error(`Failed to fetch journal entry: ${error.message}`);
  }

  return entry;
}

/**
 * Update a journal entry
 */
export async function updateJournalEntry(
  id: string,
  updates: Partial<CreateJournalEntryData>,
): Promise<JournalEntry> {
  const { data: entry, error } = await supabase
    .from("journal_entries")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating journal entry:", error);
    throw new Error(`Failed to update journal entry: ${error.message}`);
  }

  // Update milestones based on the updated journal entry
  try {
    await updateMilestonesFromJournalEntry(entry, "demo-user", false);
    console.log("✅ Milestones updated from journal entry update");
  } catch (milestoneError) {
    console.error("Error updating milestones:", milestoneError);
    // Don't fail the journal update if milestone update fails
  }

  return entry;
}

/**
 * Delete a journal entry
 */
export async function deleteJournalEntry(id: string): Promise<void> {
  const { error } = await supabase
    .from("journal_entries")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting journal entry:", error);
    throw new Error(`Failed to delete journal entry: ${error.message}`);
  }
}

/**
 * Search journal entries by title, content, or location
 */
export async function searchJournalEntries(
  query: string,
): Promise<JournalEntry[]> {
  const { data: entries, error } = await supabase
    .from("journal_entries")
    .select("*")
    .or(
      `title.ilike.%${query}%,content.ilike.%${query}%,location.ilike.%${query}%`,
    )
    .order("date", { ascending: false });

  if (error) {
    console.error("Error searching journal entries:", error);
    throw new Error(`Failed to search journal entries: ${error.message}`);
  }

  return entries || [];
}

/**
 * Filter journal entries by tag
 */
export async function getJournalEntriesByTag(
  tag: string,
): Promise<JournalEntry[]> {
  const { data: entries, error } = await supabase
    .from("journal_entries")
    .select("*")
    .contains("tags", [tag])
    .order("date", { ascending: false });

  if (error) {
    console.error("Error filtering journal entries by tag:", error);
    throw new Error(`Failed to filter journal entries: ${error.message}`);
  }

  return entries || [];
}

/**
 * Get all unique tags from journal entries
 */
export async function getAllTags(): Promise<string[]> {
  const { data: entries, error } = await supabase
    .from("journal_entries")
    .select("tags");

  if (error) {
    console.error("Error fetching tags:", error);
    throw new Error(`Failed to fetch tags: ${error.message}`);
  }

  // Flatten and deduplicate tags
  const allTags = entries?.flatMap((entry) => entry.tags || []) || [];
  return Array.from(new Set(allTags)).sort();
}

/**
 * Get journal statistics
 */
export async function getJournalStats(): Promise<{
  totalEntries: number;
  totalPhotos: number;
  totalTags: number;
  totalPlaces: number;
}> {
  const { data: entries, error } = await supabase
    .from("journal_entries")
    .select("tags, photos, location");

  if (error) {
    console.error("Error fetching journal stats:", error);
    throw new Error(`Failed to fetch journal stats: ${error.message}`);
  }

  const stats = {
    totalEntries: entries?.length || 0,
    totalPhotos:
      entries?.reduce((sum, entry) => sum + (entry.photos?.length || 0), 0) ||
      0,
    totalTags: new Set(entries?.flatMap((entry) => entry.tags || [])).size || 0,
    totalPlaces:
      new Set(entries?.map((entry) => entry.location).filter(Boolean)).size ||
      0,
  };

  return stats;
}

/**
 * Subscribe to real-time changes in journal entries
 */
export function subscribeToJournalEntries(
  callback: (entries: JournalEntry[]) => void,
) {
  const subscription = supabase
    .channel("journal_entries_changes")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "journal_entries",
      },
      async () => {
        // Refetch all entries when any change occurs
        try {
          const entries = await getJournalEntries();
          callback(entries);
        } catch (error) {
          console.error("Error in real-time subscription:", error);
        }
      },
    )
    .subscribe();

  return () => {
    subscription.unsubscribe();
  };
}

/**
 * Check if Supabase is working properly
 */
export async function testSupabaseConnection(): Promise<{
  success: boolean;
  message: string;
  error?: string;
}> {
  console.log("🧪 Testing Supabase connection...");

  // First check configuration
  const envInfo = getEnvironmentInfo();
  const validation = validateSupabaseConfig();

  console.log("📋 Environment check:", { envInfo, validation });

  if (!isSupabaseConfigured()) {
    return {
      success: false,
      message: "Configuration missing",
      error: "VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY not set",
    };
  }

  if (!validation.urlValid) {
    return {
      success: false,
      message: "Invalid Supabase URL",
      error: "URL must start with https:// and contain supabase",
    };
  }

  if (!validation.keyValid) {
    return {
      success: false,
      message: "Invalid Supabase key",
      error: "Anon key appears to be too short or invalid",
    };
  }

  try {
    const { data, error, count } = await supabase
      .from("journal_entries")
      .select("*", { count: "exact", head: true });

    if (error) {
      console.error("❌ Supabase query error:", error);
      return {
        success: false,
        message: "Database query failed",
        error: `${error.code || "UNKNOWN"}: ${error.message}`,
      };
    }

    console.log("✅ Supabase connection successful");
    return {
      success: true,
      message: `Connected successfully! Found ${count || 0} entries.`,
    };
  } catch (error) {
    console.error("❌ Connection test failed:", error);
    debugNetworkError(error);

    return {
      success: false,
      message: "Connection test failed",
      error: error instanceof Error ? error.message : "Unknown network error",
    };
  }
}
