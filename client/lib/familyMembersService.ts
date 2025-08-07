import { supabase, isSupabaseConfigured } from "./supabase";
import { uploadPhotoToCloudflare, ProcessedPhoto } from "./photoUtils";

/**
 * Test network connectivity to Supabase
 */
export async function testSupabaseConnection(): Promise<{
  success: boolean;
  error?: string;
}> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: "Supabase not configured" };
  }

  try {
    console.log("🔍 Testing Supabase connection...");

    // Simple query to test connectivity
    const { data, error } = await supabase
      .from("family_members")
      .select("count")
      .limit(1);

    if (error) {
      console.error("❌ Supabase connection test failed:", error);
      return { success: false, error: error.message };
    }

    console.log("✅ Supabase connection test successful");
    return { success: true };
  } catch (error) {
    console.error("❌ Network error during connection test:", error);
    if (
      error instanceof TypeError &&
      error.message.includes("Failed to fetch")
    ) {
      return {
        success: false,
        error:
          "Network connection failed. Please check your internet connection.",
      };
    }
    return { success: false, error: String(error) };
  }
}

/**
 * Supabase Family Members Service
 * Handles all database operations for family member profile pictures and data
 */

export interface FamilyMember {
  id: string;
  name: string;
  role: string;
  avatar_url?: string;
  bio?: string;
  position_index: number;
  colors: {
    bg: string;
    border: string;
    accent: string;
  };
  has_custom_avatar?: boolean;
  display_avatar?: string;
  created_at?: string;
  updated_at?: string;
}

export interface UpdateFamilyMemberData {
  name?: string;
  role?: string;
  avatar_url?: string;
  bio?: string;
  colors?: {
    bg: string;
    border: string;
    accent: string;
  };
}

/**
 * Get all family members
 */
export async function getFamilyMembers(): Promise<FamilyMember[]> {
  if (!isSupabaseConfigured()) {
    throw new Error(
      "Supabase not configured - please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY",
    );
  }

  try {
    console.log("🔄 Fetching family members...");
    console.log("🔍 Supabase client config:", {
      url: import.meta.env.VITE_SUPABASE_URL ? "configured" : "missing",
      key: import.meta.env.VITE_SUPABASE_ANON_KEY ? "configured" : "missing",
    });

    // First try the view, then fallback to base table
    console.log("📋 Attempting to query family_members_with_stats view...");
    let { data: members, error } = await supabase
      .from("family_members_with_stats")
      .select("*")
      .order("position_index", { ascending: true });

    console.log("📋 View query result:", { members, error });

    // If view doesn't exist, try base table
    if (
      error &&
      (error.message.includes("Could not find the table") ||
        error.message.includes(
          'relation "family_members_with_stats" does not exist',
        ) ||
        error.code === "PGRST116")
    ) {
      console.log("📋 View not found, trying base table family_members...");

      const baseQuery = await supabase
        .from("family_members")
        .select("*")
        .order("position_index", { ascending: true });

      console.log("📋 Base table query result:", {
        data: baseQuery.data,
        error: baseQuery.error,
      });

      members = baseQuery.data;
      error = baseQuery.error;

      // Add computed fields that would be in the view
      if (members && !error) {
        members = members.map((member) => ({
          ...member,
          has_custom_avatar: member.avatar_url ? true : false,
          display_avatar: member.avatar_url || "/placeholder.svg",
        }));
      }
    }

    if (error) {
      console.error("Error fetching family members:", {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        error,
      });

      // Check if it's a table not found error
      if (
        error.message.includes("Could not find the table") ||
        error.message.includes('relation "family_members" does not exist') ||
        error.message.includes(
          'relation "family_members_with_stats" does not exist',
        ) ||
        error.code === "PGRST116"
      ) {
        throw new Error("SCHEMA_MISSING: Database tables not found");
      }
      throw new Error(`Failed to fetch family members: ${error.message}`);
    }

    console.log(`✅ Loaded ${members?.length || 0} family members`);
    return members || [];
  } catch (error) {
    console.error("Error in getFamilyMembers:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`Failed to fetch family members: ${String(error)}`);
  }
}

/**
 * Update a family member's avatar
 */
export async function updateFamilyMemberAvatar(
  id: string,
  avatarUrl: string,
): Promise<FamilyMember> {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase not configured");
  }

  try {
    console.log(`🔄 Updating avatar for family member: ${id}...`);

    const { data: member, error } = await supabase
      .from("family_members")
      .update({ avatar_url: avatarUrl })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating family member avatar:", error);
      throw new Error(`Failed to update avatar: ${error.message}`);
    }

    console.log(`✅ Avatar updated successfully: ${id}`);
    return member;
  } catch (error) {
    console.error("Error in updateFamilyMemberAvatar:", error);

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
    throw new Error(`Failed to update avatar: ${String(error)}`);
  }
}

/**
 * Remove a family member's avatar
 */
export async function removeFamilyMemberAvatar(
  id: string,
): Promise<FamilyMember> {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase not configured");
  }

  try {
    console.log(`🗑️ Removing avatar for family member: ${id}...`);

    const { data: member, error } = await supabase
      .from("family_members")
      .update({ avatar_url: null })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error(
        "Error removing family member avatar:",
        JSON.stringify(error, null, 2),
      );
      throw new Error(`Failed to remove avatar: ${error.message}`);
    }

    console.log(`✅ Avatar removed successfully: ${id}`);
    return member;
  } catch (error) {
    console.error("Error in removeFamilyMemberAvatar:", error);

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
    throw new Error(`Failed to remove avatar: ${String(error)}`);
  }
}

/**
 * Update family member information
 */
export async function updateFamilyMember(
  id: string,
  updates: UpdateFamilyMemberData,
): Promise<FamilyMember> {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase not configured");
  }

  try {
    console.log(`🔄 Updating family member: ${id}...`);

    const { data: member, error } = await supabase
      .from("family_members")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating family member:", error);
      throw new Error(`Failed to update family member: ${error.message}`);
    }

    console.log(`✅ Family member updated successfully: ${id}`);
    return member;
  } catch (error) {
    console.error("Error in updateFamilyMember:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`Failed to update family member: ${String(error)}`);
  }
}

/**
 * Upload and set family member avatar
 */
export async function uploadFamilyMemberAvatar(
  memberId: string,
  processedPhoto: ProcessedPhoto,
  onProgress?: (progress: number) => void,
): Promise<FamilyMember> {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase not configured");
  }

  try {
    console.log(`📸 Uploading avatar for family member: ${memberId}...`);

    // Upload photo to Cloudflare
    const cloudflareUrl = await uploadPhotoToCloudflare(
      processedPhoto,
      onProgress,
    );

    // Update family member with new avatar URL
    const updatedMember = await updateFamilyMemberAvatar(
      memberId,
      cloudflareUrl,
    );

    console.log(`✅ Avatar uploaded and updated successfully: ${memberId}`);
    return updatedMember;
  } catch (error) {
    console.error("Error in uploadFamilyMemberAvatar:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`Failed to upload avatar: ${String(error)}`);
  }
}

/**
 * Subscribe to real-time changes in family members
 */
export function subscribeToFamilyMembers(
  callback: (members: FamilyMember[]) => void,
) {
  if (!isSupabaseConfigured()) {
    console.warn("Supabase not configured, skipping real-time subscription");
    return () => {}; // Return empty unsubscribe function
  }

  console.log("🔄 Setting up real-time family members sync...");

  const subscription = supabase
    .channel("family_members_changes")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "family_members",
      },
      async (payload) => {
        console.log(
          "📡 Real-time family member change detected:",
          payload.eventType,
        );

        // Refetch all family members when any change occurs
        try {
          const members = await getFamilyMembers();
          callback(members);
          console.log("✅ Family members sync updated with latest data");
        } catch (error) {
          console.error(
            "Error in real-time family members subscription:",
            error,
          );
        }
      },
    )
    .subscribe((status) => {
      console.log("📡 Family members subscription status:", status);
    });

  console.log("✅ Real-time family members sync enabled");

  return () => {
    console.log("🔌 Unsubscribing from family members changes");
    subscription.unsubscribe();
  };
}

/**
 * Debug function to list available tables
 */
export async function debugAvailableTables(): Promise<string[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  try {
    // Try to query the information schema to see what tables exist
    const { data, error } = await supabase.rpc("get_table_list");

    if (error) {
      console.log(
        "📋 Could not get table list via RPC, trying manual check...",
      );

      // Manually test common table names
      const testTables = [
        "family_members",
        "family_members_with_stats",
        "journal_entries",
        "wishlist_items",
      ];
      const existingTables = [];

      for (const tableName of testTables) {
        try {
          const { error: testError } = await supabase
            .from(tableName)
            .select("*", { count: "exact", head: true });

          if (!testError) {
            existingTables.push(tableName);
          } else {
            console.log(
              `❌ Table ${tableName} not accessible:`,
              testError.message,
            );
          }
        } catch (e) {
          console.log(`❌ Table ${tableName} test failed:`, e);
        }
      }

      return existingTables;
    }

    return data || [];
  } catch (error) {
    console.error("Error debugging tables:", error);
    return [];
  }
}

/**
 * Test Supabase connection for family members data
 */
export async function testFamilyMembersConnection(): Promise<{
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
    console.log("🔍 Testing family members database connection...");

    // Debug: Check what tables are available
    console.log("🔍 Checking available tables...");
    const availableTables = await debugAvailableTables();
    console.log("📋 Available tables:", availableTables);

    // Test 1: Check if base table exists
    console.log("🔍 Testing family_members table...");
    const { data, error, count } = await supabase
      .from("family_members")
      .select("*", { count: "exact", head: true });

    if (error) {
      console.error("Base table test failed:", error);
      if (
        error.message.includes("Could not find the table") ||
        error.message.includes('relation "family_members" does not exist')
      ) {
        return {
          success: false,
          message:
            "Database tables not found - please run family-members-schema.sql",
          error:
            "Missing: family_members table. Run the SQL schema to create all required tables and views.",
        };
      }
      return {
        success: false,
        message: "Database connection failed",
        error: error.message,
      };
    }

    // Test 2: Check if view exists
    const { error: viewError } = await supabase
      .from("family_members_with_stats")
      .select("*", { count: "exact", head: true });

    let viewStatus = "";
    if (viewError) {
      if (
        viewError.message.includes("Could not find the table") ||
        viewError.message.includes(
          'relation "family_members_with_stats" does not exist',
        )
      ) {
        viewStatus = " (View missing - using fallback)";
      } else {
        viewStatus = " (View error - using fallback)";
      }
    } else {
      viewStatus = " (View working)";
    }

    const memberCount = count || 0;
    return {
      success: true,
      message: `✅ Family members database connected! Found ${memberCount} member${memberCount !== 1 ? "s" : ""}${viewStatus}.`,
    };
  } catch (error) {
    return {
      success: false,
      message: "Connection test failed",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
