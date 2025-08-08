import { supabase, isSupabaseConfigured } from "./supabase";

/**
 * Supabase Castles and Lochs Service
 * Handles all database operations for Castle and Loch tracking and visits
 */

export interface CastleData {
  id: string;
  name: string;
  region: string;
  type:
    | "Royal Castle"
    | "Historic Fortress"
    | "Clan Castle"
    | "Ruin"
    | "Palace";
  built_century: string;
  latitude: number;
  longitude: number;
  description: string;
  visiting_info: string;
  best_seasons: string[];
  admission_fee: string;
  managed_by: string;
  accessibility: string;
  rank: number;
  is_custom: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface LochData {
  id: string;
  name: string;
  region: string;
  type: "Freshwater Loch" | "Sea Loch" | "Tidal Loch";
  length_km: number;
  max_depth_m: number;
  latitude: number;
  longitude: number;
  description: string;
  activities: string[];
  best_seasons: string[];
  famous_for: string;
  nearest_town: string;
  rank: number;
  is_custom: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CastleVisit {
  id: string;
  castle_id: string;
  visited_date: string;
  notes: string;
  photo_count: number;
  weather_conditions: string;
  visit_duration: string;
  favorite_part: string;
  would_recommend: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface LochVisit {
  id: string;
  loch_id: string;
  visited_date: string;
  notes: string;
  photo_count: number;
  weather_conditions: string;
  activities_done: string[];
  water_temperature: string;
  wildlife_spotted: string[];
  would_recommend: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CastleWithVisit extends CastleData {
  visited: boolean;
  visit?: CastleVisit;
}

export interface LochWithVisit extends LochData {
  visited: boolean;
  visit?: LochVisit;
}

export interface HiddenGemData {
  id: string;
  name: string;
  region: string;
  type:
    | "Secret Beach"
    | "Hidden Waterfall"
    | "Ancient Site"
    | "Natural Wonder"
    | "Historic Village"
    | "Remote Island"
    | "Mountain Peak"
    | "Forest Grove"
    | "Cave System"
    | "Coastal Feature";
  latitude: number;
  longitude: number;
  description: string;
  how_to_find: string;
  best_seasons: string[];
  difficulty_level: "Easy" | "Moderate" | "Challenging" | "Expert";
  requires_hiking: boolean;
  nearest_town: string;
  special_features: string;
  photography_tips: string;
  rank: number;
  is_custom: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface HiddenGemVisit {
  id: string;
  user_id: string;
  hidden_gem_id: string;
  visited_date: string;
  rating?: number;
  notes?: string;
  photo_count?: number;
  weather_conditions?: string;
  would_recommend?: boolean;
  difficulty_experienced?: "Easy" | "Moderate" | "Challenging" | "Expert";
  created_at: string;
  updated_at: string;
}

export interface HiddenGemWithVisit extends HiddenGemData {
  visited: boolean;
  visit?: HiddenGemVisit;
}

export interface CreateCastleVisitData {
  castle_id: string;
  visited_date?: string;
  notes?: string;
  photo_count?: number;
  weather_conditions?: string;
  visit_duration?: string;
  favorite_part?: string;
  would_recommend?: boolean;
}

export interface CreateLochVisitData {
  loch_id: string;
  visited_date?: string;
  notes?: string;
  photo_count?: number;
  weather_conditions?: string;
  activities_done?: string[];
  water_temperature?: string;
  wildlife_spotted?: string[];
  would_recommend?: boolean;
}

/**
 * Get all castles with their visit status
 */
export async function getAllCastlesWithVisits(): Promise<CastleWithVisit[]> {
  if (!isSupabaseConfigured()) {
    throw new Error(
      "Supabase not configured - please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY",
    );
  }

  try {
    console.log("🔄 Fetching all castles with visit status...");

    const { data: castles, error: castlesError } = await supabase
      .from("castles")
      .select("*")
      .order("rank", { ascending: true });

    if (castlesError) {
      console.error("Error fetching castles:", castlesError);
      if (
        castlesError.message.includes("Could not find the table") ||
        castlesError.message.includes('relation "castles" does not exist')
      ) {
        throw new Error("SCHEMA_MISSING: Database tables not found");
      }
      throw new Error(`Failed to fetch castles: ${castlesError.message}`);
    }

    const { data: visits, error: visitsError } = await supabase
      .from("castle_visits")
      .select("*");

    if (visitsError) {
      console.error("Error fetching castle visits:", visitsError);
      if (
        !visitsError.message.includes("Could not find the table") &&
        !visitsError.message.includes('relation "castle_visits" does not exist')
      ) {
        throw new Error(
          `Failed to fetch castle visits: ${visitsError.message}`,
        );
      }
      console.warn(
        "Castle visits table not found, continuing without visit data",
      );
    }

    // Combine castles with visit data
    const castlesWithVisits: CastleWithVisit[] = (castles || []).map(
      (castle) => {
        const visit = (visits || []).find((v) => v.castle_id === castle.id);
        return {
          ...castle,
          visited: !!visit,
          visit: visit || undefined,
        };
      },
    );

    console.log(
      `✅ Loaded ${castlesWithVisits.length} castles with visit status`,
    );
    return castlesWithVisits;
  } catch (error) {
    console.error("Error in getAllCastlesWithVisits:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`Failed to fetch castles: ${String(error)}`);
  }
}

/**
 * Get all lochs with their visit status
 */
export async function getAllLochsWithVisits(): Promise<LochWithVisit[]> {
  if (!isSupabaseConfigured()) {
    throw new Error(
      "Supabase not configured - please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY",
    );
  }

  try {
    console.log("🔄 Fetching all lochs with visit status...");

    const { data: lochs, error: lochsError } = await supabase
      .from("lochs")
      .select("*")
      .order("rank", { ascending: true });

    if (lochsError) {
      console.error("Error fetching lochs:", lochsError);
      if (
        lochsError.message.includes("Could not find the table") ||
        lochsError.message.includes('relation "lochs" does not exist')
      ) {
        throw new Error("SCHEMA_MISSING: Database tables not found");
      }
      throw new Error(`Failed to fetch lochs: ${lochsError.message}`);
    }

    const { data: visits, error: visitsError } = await supabase
      .from("loch_visits")
      .select("*");

    if (visitsError) {
      console.error("Error fetching loch visits:", visitsError);
      if (
        !visitsError.message.includes("Could not find the table") &&
        !visitsError.message.includes('relation "loch_visits" does not exist')
      ) {
        throw new Error(`Failed to fetch loch visits: ${visitsError.message}`);
      }
      console.warn(
        "Loch visits table not found, continuing without visit data",
      );
    }

    // Combine lochs with visit data
    const lochsWithVisits: LochWithVisit[] = (lochs || []).map((loch) => {
      const visit = (visits || []).find((v) => v.loch_id === loch.id);
      return {
        ...loch,
        visited: !!visit,
        visit: visit || undefined,
      };
    });

    console.log(`✅ Loaded ${lochsWithVisits.length} lochs with visit status`);
    return lochsWithVisits;
  } catch (error) {
    console.error("Error in getAllLochsWithVisits:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`Failed to fetch lochs: ${String(error)}`);
  }
}

/**
 * Mark a castle as visited
 */
export async function visitCastle(
  data: CreateCastleVisitData,
): Promise<CastleVisit> {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase not configured");
  }

  try {
    console.log(`🏰 Marking castle ${data.castle_id} as visited...`);

    const visitData = {
      castle_id: data.castle_id,
      visited_date: data.visited_date || new Date().toISOString().split("T")[0],
      notes: data.notes || "",
      photo_count: data.photo_count || 0,
      weather_conditions: data.weather_conditions || "",
      visit_duration: data.visit_duration || "",
      favorite_part: data.favorite_part || "",
      would_recommend: data.would_recommend ?? true,
    };

    const { data: visit, error } = await supabase
      .from("castle_visits")
      .upsert(visitData, {
        onConflict: "castle_id",
        ignoreDuplicates: false,
      })
      .select()
      .single();

    if (error) {
      console.error("Error visiting castle:", error);
      throw new Error(`Failed to visit castle: ${error.message}`);
    }

    console.log(`✅ Castle visited successfully: ${data.castle_id}`);
    return visit;
  } catch (error) {
    console.error("Error in visitCastle:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`Failed to visit castle: ${String(error)}`);
  }
}

/**
 * Mark a loch as visited
 */
export async function visitLoch(data: CreateLochVisitData): Promise<LochVisit> {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase not configured");
  }

  try {
    console.log(`🌊 Marking loch ${data.loch_id} as visited...`);

    const visitData = {
      loch_id: data.loch_id,
      visited_date: data.visited_date || new Date().toISOString().split("T")[0],
      notes: data.notes || "",
      photo_count: data.photo_count || 0,
      weather_conditions: data.weather_conditions || "",
      activities_done: data.activities_done || [],
      water_temperature: data.water_temperature || "",
      wildlife_spotted: data.wildlife_spotted || [],
      would_recommend: data.would_recommend ?? true,
    };

    const { data: visit, error } = await supabase
      .from("loch_visits")
      .upsert(visitData, {
        onConflict: "loch_id",
        ignoreDuplicates: false,
      })
      .select()
      .single();

    if (error) {
      console.error("Error visiting loch:", error);
      throw new Error(`Failed to visit loch: ${error.message}`);
    }

    console.log(`✅ Loch visited successfully: ${data.loch_id}`);
    return visit;
  } catch (error) {
    console.error("Error in visitLoch:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`Failed to visit loch: ${String(error)}`);
  }
}

/**
 * Remove a castle visit (mark as not visited)
 */
export async function unvisitCastle(castleId: string): Promise<void> {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase not configured");
  }

  try {
    console.log(`🔄 Removing visit for castle ${castleId}...`);

    const { error } = await supabase
      .from("castle_visits")
      .delete()
      .eq("castle_id", castleId);

    if (error) {
      console.error("Error unvisiting castle:", error);
      throw new Error(`Failed to unvisit castle: ${error.message}`);
    }

    console.log(`✅ Castle visit removed: ${castleId}`);
  } catch (error) {
    console.error("Error in unvisitCastle:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`Failed to unvisit castle: ${String(error)}`);
  }
}

/**
 * Remove a loch visit (mark as not visited)
 */
export async function unvisitLoch(lochId: string): Promise<void> {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase not configured");
  }

  try {
    console.log(`🔄 Removing visit for loch ${lochId}...`);

    const { error } = await supabase
      .from("loch_visits")
      .delete()
      .eq("loch_id", lochId);

    if (error) {
      console.error("Error unvisiting loch:", error);
      throw new Error(`Failed to unvisit loch: ${error.message}`);
    }

    console.log(`✅ Loch visit removed: ${lochId}`);
  } catch (error) {
    console.error("Error in unvisitLoch:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`Failed to unvisit loch: ${String(error)}`);
  }
}

/**
 * Get castle visit statistics
 */
export async function getCastleVisitStats(): Promise<{
  visited_count: number;
  total_castles: number;
  completion_percentage: number;
  castles_with_photos: number;
  total_photos: number;
  first_visit: string | null;
  latest_visit: string | null;
  recommended_count: number;
}> {
  const defaultStats = {
    visited_count: 0,
    total_castles: 100,
    completion_percentage: 0,
    castles_with_photos: 0,
    total_photos: 0,
    first_visit: null,
    latest_visit: null,
    recommended_count: 0,
  };

  if (!isSupabaseConfigured()) {
    console.warn("Supabase not configured, returning default castle stats");
    return defaultStats;
  }

  try {
    console.log("📊 Fetching castle visit statistics...");

    const { data, error } = await supabase
      .from("castle_visit_stats")
      .select("*")
      .single();

    if (error) {
      console.error("Error fetching castle stats:", error);
      console.warn("Castle stats view not available, returning default stats");
      return defaultStats;
    }

    console.log("✅ Castle stats loaded successfully");
    return data || defaultStats;
  } catch (error) {
    console.error("Error in getCastleVisitStats:", error);
    console.warn("Falling back to default castle stats due to error");
    return defaultStats;
  }
}

/**
 * Get loch visit statistics
 */
export async function getLochVisitStats(): Promise<{
  visited_count: number;
  total_lochs: number;
  completion_percentage: number;
  lochs_with_photos: number;
  total_photos: number;
  first_visit: string | null;
  latest_visit: string | null;
  recommended_count: number;
}> {
  const defaultStats = {
    visited_count: 0,
    total_lochs: 20,
    completion_percentage: 0,
    lochs_with_photos: 0,
    total_photos: 0,
    first_visit: null,
    latest_visit: null,
    recommended_count: 0,
  };

  if (!isSupabaseConfigured()) {
    console.warn("Supabase not configured, returning default loch stats");
    return defaultStats;
  }

  try {
    console.log("📊 Fetching loch visit statistics...");

    const { data, error } = await supabase
      .from("loch_visit_stats")
      .select("*")
      .single();

    if (error) {
      console.error("Error fetching loch stats:", error);
      console.warn("Loch stats view not available, returning default stats");
      return defaultStats;
    }

    console.log("✅ Loch stats loaded successfully");
    return data || defaultStats;
  } catch (error) {
    console.error("Error in getLochVisitStats:", error);
    console.warn("Falling back to default loch stats due to error");
    return defaultStats;
  }
}

/**
 * Get all unique regions from castles and lochs
 */
export async function getCastleLochRegions(): Promise<string[]> {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase not configured");
  }

  try {
    const [castleRegions, lochRegions] = await Promise.all([
      supabase.from("castles").select("region").order("region"),
      supabase.from("lochs").select("region").order("region"),
    ]);

    if (castleRegions.error || lochRegions.error) {
      throw new Error("Failed to fetch regions");
    }

    const allRegions = [
      ...(castleRegions.data || []).map((row) => row.region),
      ...(lochRegions.data || []).map((row) => row.region),
    ];

    const uniqueRegions = Array.from(new Set(allRegions)).sort();
    return uniqueRegions;
  } catch (error) {
    console.error("Error in getCastleLochRegions:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`Failed to fetch regions: ${String(error)}`);
  }
}

/**
 * Test Supabase connection for castles and lochs data
 */
export async function testCastleLochConnection(): Promise<{
  success: boolean;
  message: string;
  error?: string;
}> {
  try {
    const [castleResult, lochResult] = await Promise.all([
      supabase.from("castles").select("*", { count: "exact", head: true }),
      supabase.from("lochs").select("*", { count: "exact", head: true }),
    ]);

    if (castleResult.error || lochResult.error) {
      return {
        success: false,
        message: "Castles and Lochs database connection failed",
        error:
          castleResult.error?.message || lochResult.error?.message || "Unknown",
      };
    }

    return {
      success: true,
      message: `Castles and Lochs database connected! Found ${castleResult.count || 0} castles and ${lochResult.count || 0} lochs.`,
    };
  } catch (error) {
    return {
      success: false,
      message: "Castles and Lochs database connection error",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * HIDDEN GEMS FUNCTIONS
 */

export async function getAllHiddenGemsWithVisits(): Promise<
  HiddenGemWithVisit[]
> {
  if (!isSupabaseConfigured()) {
    console.log(
      "📝 Supabase not configured, returning empty hidden gems array",
    );
    return [];
  }

  try {
    console.log(`🔍 Debug: Loading hidden gems (using custom auth system)...`);

    // Get all hidden gems
    const { data: gemsData, error: gemsError } = await supabase
      .from("hidden_gems")
      .select("*")
      .order("rank", { ascending: true });

    if (gemsError) {
      console.error("❌ Error fetching hidden gems:", gemsError);
      if (
        !gemsError.message.includes('relation "hidden_gems" does not exist')
      ) {
        throw gemsError;
      }
      return [];
    }

    // Get ALL visits (since we're using custom auth, we'll get all visits and filter client-side if needed)
    console.log(`🔍 Debug: Loading all hidden gem visits...`);
    const { data: visitsData, error: visitsError } = await supabase
      .from("hidden_gem_visits")
      .select("*");

    console.log(`🔍 Debug: Found ${visitsData?.length || 0} total visits`);
    console.log(`🔍 Debug: Visits data:`, visitsData);

    if (visitsError) {
      console.error("❌ Error fetching hidden gem visits:", visitsError);
      if (
        !visitsError.message.includes(
          'relation "hidden_gem_visits" does not exist',
        )
      ) {
        throw visitsError;
      }
    }

    // Create visits map from all visits (custom auth system doesn't use user_id filtering)
    const visitsMap = new Map(
      (visitsData || []).map((visit: HiddenGemVisit) => [
        visit.hidden_gem_id,
        visit,
      ]),
    );

    console.log(`🔍 Debug: Created visits map with ${visitsMap.size} entries`);

    return (gemsData || []).map((gem: HiddenGemData) => {
      const visit = visitsMap.get(gem.id);
      return {
        ...gem,
        visited: !!visit,
        visit: visit || undefined,
      };
    });
  } catch (error) {
    console.error("❌ Error in getAllHiddenGemsWithVisits:", error);
    throw error;
  }
}

export async function visitHiddenGem(
  hiddenGemId: string,
  visitData: Partial<HiddenGemVisit> = {},
) {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase not configured");
  }

  try {
    console.log(`💎 Marking hidden gem ${hiddenGemId} as visited...`);
    console.log(`🔍 Debug: Getting current user for hidden gem visit...`);

    // Note: Using custom auth system, not Supabase auth, so user_id will be set by trigger
    console.log(
      `🔍 Debug: Using custom auth system - user_id will be auto-populated`,
    );

    const visitRecord = {
      // user_id will be set by database trigger or left null for now
      hidden_gem_id: hiddenGemId,
      visited_date: new Date().toISOString().split("T")[0],
      rating: visitData.rating || 5,
      notes: visitData.notes || "Amazing hidden gem discovery!",
      photo_count: visitData.photo_count || Math.floor(Math.random() * 8) + 1,
      weather_conditions:
        visitData.weather_conditions || "Perfect for photography",
      would_recommend: visitData.would_recommend ?? true,
      difficulty_experienced: visitData.difficulty_experienced || "Moderate",
    };

    const { data: visit, error } = await supabase
      .from("hidden_gem_visits")
      .insert(visitRecord)
      .select()
      .single();

    if (error) {
      console.error("Error visiting hidden gem:", error);
      throw new Error(`Failed to visit hidden gem: ${error.message}`);
    }

    console.log(`✅ Hidden gem visited successfully: ${hiddenGemId}`);
    console.log(`🔍 Debug: Visit record created:`, visit);
    return visit;
  } catch (error) {
    console.error("Error in visitHiddenGem:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`Failed to visit hidden gem: ${String(error)}`);
  }
}

export async function unvisitHiddenGem(hiddenGemId: string): Promise<void> {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase not configured");
  }

  try {
    console.log(`🔄 Removing visit for hidden gem ${hiddenGemId}...`);

    // Get current user to ensure we only delete their visit
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const deleteQuery = supabase
      .from("hidden_gem_visits")
      .delete()
      .eq("hidden_gem_id", hiddenGemId);

    // If user is authenticated, filter by user_id, otherwise delete any visits for this gem
    if (user?.id) {
      deleteQuery.eq("user_id", user.id);
    }

    const { error } = await deleteQuery;

    if (error) {
      console.error("Error unvisiting hidden gem:", error);
      throw new Error(`Failed to unvisit hidden gem: ${error.message}`);
    }

    console.log(`✅ Hidden gem visit removed: ${hiddenGemId}`);
  } catch (error) {
    console.error("Error in unvisitHiddenGem:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`Failed to unvisit hidden gem: ${String(error)}`);
  }
}

export async function getHiddenGemVisitStats(): Promise<{
  visited_count: number;
  total_gems: number;
  completion_percentage: number;
  gems_with_photos: number;
  total_photos: number;
  first_visit: string | null;
  latest_visit: string | null;
  recommended_count: number;
}> {
  const defaultStats = {
    visited_count: 0,
    total_gems: 30,
    completion_percentage: 0,
    gems_with_photos: 0,
    total_photos: 0,
    first_visit: null,
    latest_visit: null,
    recommended_count: 0,
  };

  if (!isSupabaseConfigured()) {
    console.warn("Supabase not configured, returning default hidden gem stats");
    return defaultStats;
  }

  try {
    console.log("📊 Fetching hidden gem visit statistics...");

    const { data, error } = await supabase
      .from("hidden_gem_visit_stats")
      .select("*")
      .single();

    if (error) {
      console.error("Error fetching hidden gem stats:", error);
      console.warn(
        "Hidden gem stats view not available, returning default stats",
      );
      return defaultStats;
    }

    console.log("✅ Hidden gem stats loaded successfully");
    return data || defaultStats;
  } catch (error) {
    console.error("Error in getHiddenGemVisitStats:", error);
    console.warn("Falling back to default hidden gem stats due to error");
    return defaultStats;
  }
}
