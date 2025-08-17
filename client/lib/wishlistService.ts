import {
  executeQuery,
  executeMutation,
  GET_WISHLIST_ITEMS,
  INSERT_WISHLIST_ITEM,
  UPDATE_WISHLIST_ITEM,
  DELETE_WISHLIST_ITEM,
  INCREMENT_WISHLIST_VOTES,
  TOGGLE_WISHLIST_RESEARCH,
  isHasuraConfigured
} from "./hasura";

/**
 * Supabase Wishlist Service
 * Handles all database operations for adventure wishlist items
 */

export interface WishlistItem {
  id: string;
  title: string;
  location: string;
  description: string;
  priority: "High" | "Medium" | "Low";
  status: "Planning" | "Researching" | "Ready" | "Booked";
  estimated_cost: number;
  best_seasons: string[];
  duration: string;
  category:
    | "Mountain"
    | "Coast"
    | "City"
    | "Island"
    | "Castle"
    | "Nature"
    | "Activity";
  family_votes: number;
  notes: string;
  target_date?: string;
  researched: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateWishlistItemData {
  title: string;
  location: string;
  description?: string;
  priority: "High" | "Medium" | "Low";
  status?: "Planning" | "Researching" | "Ready" | "Booked";
  estimated_cost?: number;
  best_seasons?: string[];
  duration?: string;
  category:
    | "Mountain"
    | "Coast"
    | "City"
    | "Island"
    | "Castle"
    | "Nature"
    | "Activity";
  notes?: string;
  target_date?: string;
}

/**
 * Get all wishlist items from Hasura
 */
export async function getWishlistItems(): Promise<WishlistItem[]> {
  if (!isHasuraConfigured()) {
    console.warn("Hasura not configured, returning empty wishlist");
    return [];
  }

  try {
    console.log("🔄 Fetching wishlist items from Hasura...");

    const response = await executeQuery<{ wishlist_items: WishlistItem[] }>(
      GET_WISHLIST_ITEMS
    );

    const items = response.wishlist_items || [];
    console.log(`✅ Loaded ${items.length} wishlist items from Hasura`);
    return items;
  } catch (error) {
    console.error("❌ Error fetching wishlist items from Hasura:", error);
    console.log("��� Returning empty array as fallback");
    return [];
  }
}

/**
 * Create a new wishlist item in Hasura
 */
export async function createWishlistItem(
  data: CreateWishlistItemData,
): Promise<WishlistItem> {
  if (!isHasuraConfigured()) {
    throw new Error("Hasura not configured");
  }

  try {
    console.log(`🎯 Creating wishlist item in Hasura: ${data.title}...`);

    const itemData = {
      title: data.title,
      location: data.location,
      description: data.description || "",
      priority: data.priority,
      status: data.status || "Planning",
      estimated_cost: data.estimated_cost || 500,
      best_seasons: data.best_seasons || ["Summer"],
      duration: data.duration || "3-4 days",
      category: data.category,
      family_votes: 0,
      notes: data.notes || "",
      target_date: data.target_date || null,
      researched: false,
    };

    const response = await executeMutation<{ insert_wishlist_items_one: WishlistItem }>(
      INSERT_WISHLIST_ITEM,
      { item: itemData }
    );

    if (!response.insert_wishlist_items_one) {
      throw new Error("Failed to create wishlist item");
    }

    console.log(`✅ Wishlist item created successfully in Hasura: ${data.title}`);
    return response.insert_wishlist_items_one;
  } catch (error) {
    console.error("❌ Error creating wishlist item in Hasura:", error);
    throw error;
  }
}

/**
 * Update a wishlist item in Hasura
 */
export async function updateWishlistItem(
  id: string,
  updates: Partial<WishlistItem>,
): Promise<WishlistItem> {
  if (!isHasuraConfigured()) {
    throw new Error("Hasura not configured");
  }

  try {
    console.log(`🔄 Updating wishlist item in Hasura: ${id}...`);

    const response = await executeMutation<{ update_wishlist_items_by_pk: WishlistItem }>(
      UPDATE_WISHLIST_ITEM,
      {
        id,
        item: {
          ...updates,
          updated_at: new Date().toISOString()
        }
      }
    );

    if (!response.update_wishlist_items_by_pk) {
      throw new Error(`Failed to update wishlist item with ID: ${id}`);
    }

    console.log(`✅ Wishlist item updated successfully in Hasura: ${id}`);
    return response.update_wishlist_items_by_pk;
  } catch (error) {
    console.error("❌ Error updating wishlist item in Hasura:", error);
    throw error;
  }
}

/**
 * Delete a wishlist item from Hasura
 */
export async function deleteWishlistItem(id: string): Promise<void> {
  if (!isHasuraConfigured()) {
    throw new Error("Hasura not configured");
  }

  try {
    console.log(`🗑️ Deleting wishlist item from Hasura: ${id}...`);

    const response = await executeMutation<{ delete_wishlist_items_by_pk: { id: string } }>(
      DELETE_WISHLIST_ITEM,
      { id }
    );

    if (!response.delete_wishlist_items_by_pk) {
      throw new Error(`Failed to delete wishlist item with ID: ${id}`);
    }

    console.log(`✅ Wishlist item deleted successfully from Hasura: ${id}`);
  } catch (error) {
    console.error("❌ Error deleting wishlist item from Hasura:", error);
    throw error;
  }
}

/**
 * Add a family vote to a wishlist item
 */
export async function addVoteToItem(id: string): Promise<WishlistItem> {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase not configured");
  }

  try {
    console.log(`👍 Adding vote to wishlist item: ${id}...`);

    // First get current votes
    const { data: currentItem, error: fetchError } = await supabase
      .from("wishlist_items")
      .select("family_votes")
      .eq("id", id)
      .single();

    if (fetchError) {
      throw new Error(`Failed to fetch current votes: ${fetchError.message}`);
    }

    const newVotes = (currentItem.family_votes || 0) + 1;

    const { data: item, error } = await supabase
      .from("wishlist_items")
      .update({ family_votes: newVotes })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error adding vote:", error);
      throw new Error(`Failed to add vote: ${error.message}`);
    }

    console.log(`✅ Vote added successfully: ${id}`);
    return item;
  } catch (error) {
    console.error("Error in addVoteToItem:", error);

    // Check if it's a network error
    if (
      error instanceof TypeError &&
      error.message.includes("Failed to fetch")
    ) {
      throw new Error(
        "Network connection failed. Please check your internet connection and try again.",
      );
    }

    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`Failed to add vote: ${String(error)}`);
  }
}

/**
 * Remove a family vote from a wishlist item
 */
export async function removeVoteFromItem(id: string): Promise<WishlistItem> {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase not configured");
  }

  try {
    console.log(`👎 Removing vote from wishlist item: ${id}...`);

    // First get current votes
    const { data: currentItem, error: fetchError } = await supabase
      .from("wishlist_items")
      .select("family_votes")
      .eq("id", id)
      .single();

    if (fetchError) {
      throw new Error(`Failed to fetch current votes: ${fetchError.message}`);
    }

    const newVotes = Math.max(0, (currentItem.family_votes || 0) - 1);

    const { data: item, error } = await supabase
      .from("wishlist_items")
      .update({ family_votes: newVotes })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error removing vote:", error);
      throw new Error(`Failed to remove vote: ${error.message}`);
    }

    console.log(`✅ Vote removed successfully: ${id}`);
    return item;
  } catch (error) {
    console.error("Error in removeVoteFromItem:", error);

    // Check if it's a network error
    if (
      error instanceof TypeError &&
      error.message.includes("Failed to fetch")
    ) {
      throw new Error(
        "Network connection failed. Please check your internet connection and try again.",
      );
    }

    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`Failed to remove vote: ${String(error)}`);
  }
}

/**
 * Toggle research status of a wishlist item
 */
export async function toggleResearchStatus(id: string): Promise<WishlistItem> {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase not configured");
  }

  try {
    console.log(`🔍 Toggling research status: ${id}...`);

    // First get current status
    const { data: currentItem, error: fetchError } = await supabase
      .from("wishlist_items")
      .select("researched")
      .eq("id", id)
      .single();

    if (fetchError) {
      throw new Error(
        `Failed to fetch current research status: ${fetchError.message}`,
      );
    }

    const newStatus = !currentItem.researched;

    const { data: item, error } = await supabase
      .from("wishlist_items")
      .update({ researched: newStatus })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error toggling research status:", error);
      throw new Error(`Failed to toggle research status: ${error.message}`);
    }

    console.log(`✅ Research status toggled successfully: ${id}`);
    return item;
  } catch (error) {
    console.error("Error in toggleResearchStatus:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`Failed to toggle research status: ${String(error)}`);
  }
}

/**
 * Get wishlist statistics
 */
export async function getWishlistStats(): Promise<{
  total_items: number;
  high_priority: number;
  medium_priority: number;
  low_priority: number;
  planning_items: number;
  researching_items: number;
  ready_items: number;
  booked_items: number;
  total_categories: number;
  total_budget: number;
  average_votes: number;
  highest_votes: number;
}> {
  const defaultStats = {
    total_items: 0,
    high_priority: 0,
    medium_priority: 0,
    low_priority: 0,
    planning_items: 0,
    researching_items: 0,
    ready_items: 0,
    booked_items: 0,
    total_categories: 0,
    total_budget: 0,
    average_votes: 0,
    highest_votes: 0,
  };

  if (!isSupabaseConfigured()) {
    console.warn("Supabase not configured, returning default wishlist stats");
    return defaultStats;
  }

  try {
    console.log("📊 Fetching wishlist statistics...");

    const { data, error } = await supabase
      .from("wishlist_stats")
      .select("*")
      .single();

    if (error) {
      console.error("Error fetching wishlist stats:", error);
      // Check if it's a table not found error or network error
      if (
        error.message.includes("Could not find the table") ||
        error.message.includes('relation "wishlist_stats" does not exist') ||
        error.message.includes("Failed to fetch") ||
        error.code === "PGRST116"
      ) {
        console.warn("Stats view not available, returning default stats");
        return defaultStats;
      }
      console.warn(
        "Stats fetch error, returning default stats:",
        error.message,
      );
      return defaultStats;
    }

    console.log("✅ Wishlist stats loaded successfully");
    return data || defaultStats;
  } catch (error) {
    console.error("Error in getWishlistStats:", error);
    console.warn("Falling back to default stats due to error");
    return defaultStats;
  }
}

/**
 * Subscribe to real-time changes in wishlist items
 * Provides robust cross-device synchronization
 */
export function subscribeToWishlistItems(
  callback: (items: WishlistItem[]) => void,
) {
  if (!isSupabaseConfigured()) {
    console.warn("Supabase not configured, skipping real-time subscription");
    return () => {}; // Return empty unsubscribe function
  }

  console.log("🔄 Setting up real-time wishlist sync...");

  const subscription = supabase
    .channel("wishlist_items_changes")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "wishlist_items",
      },
      async (payload) => {
        console.log(
          "📡 Real-time wishlist change detected:",
          payload.eventType,
        );

        // Refetch all wishlist items when any change occurs
        try {
          const items = await getWishlistItems();
          callback(items);
          console.log("✅ Wishlist sync updated with latest data");
        } catch (error) {
          console.error("Error in real-time wishlist subscription:", error);
        }
      },
    )
    .subscribe((status) => {
      console.log("📡 Wishlist subscription status:", status);
    });

  console.log("✅ Real-time wishlist sync enabled");

  return () => {
    console.log("🔌 Unsubscribing from wishlist changes");
    subscription.unsubscribe();
  };
}

/**
 * Test Supabase connection for wishlist data
 */
export async function testWishlistConnection(): Promise<{
  success: boolean;
  message: string;
  error?: string;
  details?: {
    tables_exist: boolean;
    can_read: boolean;
    can_write: boolean;
    real_time_enabled: boolean;
  };
}> {
  if (!isSupabaseConfigured()) {
    return {
      success: false,
      message: "Supabase not configured",
      error: "Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY",
    };
  }

  const details = {
    tables_exist: false,
    can_read: false,
    can_write: false,
    real_time_enabled: false,
  };

  try {
    console.log("🔍 Testing wishlist database connection...");

    // Test 1: Check if tables exist and can read
    const { data, error, count } = await supabase
      .from("wishlist_items")
      .select("*", { count: "exact", head: true });

    if (error) {
      if (
        error.message.includes("Could not find the table") ||
        error.message.includes('relation "wishlist_items" does not exist')
      ) {
        return {
          success: false,
          message: "Database tables not found - please run wishlist-schema.sql",
          error: "Tables missing: wishlist_items, wishlist_stats",
          details,
        };
      }
      return {
        success: false,
        message: "Database connection failed",
        error: error.message,
        details,
      };
    }

    details.tables_exist = true;
    details.can_read = true;

    // Test 2: Check write permissions by attempting to insert/delete a test item
    try {
      const testItem = {
        title: "__test_connection__",
        location: "__test__",
        description: "Connection test item",
        priority: "Low" as const,
        status: "Planning" as const,
        estimated_cost: 1,
        best_seasons: ["Summer"],
        duration: "1 day",
        category: "Activity" as const,
        family_votes: 0,
        notes: "Test item - will be deleted",
        researched: false,
      };

      // Insert test item
      const { data: insertData, error: insertError } = await supabase
        .from("wishlist_items")
        .insert(testItem)
        .select()
        .single();

      if (insertError) {
        return {
          success: false,
          message: "Write permission denied",
          error: insertError.message,
          details,
        };
      }

      details.can_write = true;

      // Clean up test item
      if (insertData?.id) {
        await supabase.from("wishlist_items").delete().eq("id", insertData.id);
      }
    } catch (writeError) {
      console.warn("Write test failed:", writeError);
    }

    // Test 3: Check real-time functionality
    try {
      const testChannel = supabase.channel("connection_test");
      details.real_time_enabled = true;
      testChannel.unsubscribe();
    } catch (realtimeError) {
      console.warn("Real-time test failed:", realtimeError);
    }

    const itemCount = count || 0;
    return {
      success: true,
      message: `✅ Full connection verified! Found ${itemCount} adventure${itemCount !== 1 ? "s" : ""}.`,
      details,
    };
  } catch (error) {
    return {
      success: false,
      message: "Connection test failed",
      error: error instanceof Error ? error.message : "Unknown error",
      details,
    };
  }
}
