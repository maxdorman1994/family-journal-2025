import { supabase } from "./supabase";

export interface MapPin {
  id: string;
  latitude: number;
  longitude: number;
  title: string;
  description: string;
  category: "adventure" | "photo" | "memory" | "wishlist";
  date?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Get all map pins from the database
 */
export async function getMapPins(): Promise<MapPin[]> {
  try {
    console.log("📍 Fetching map pins from database...");
    
    const { data, error } = await supabase
      .from("map_pins")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("❌ Error fetching map pins:", error);
      throw error;
    }

    console.log(`✅ Successfully fetched ${data?.length || 0} map pins`);
    return data || [];
  } catch (error) {
    console.error("Error in getMapPins:", error);
    throw error;
  }
}

/**
 * Add a new map pin to the database
 */
export async function addMapPin(pin: Omit<MapPin, "id" | "created_at" | "updated_at">): Promise<MapPin> {
  try {
    console.log("📍 Adding new map pin:", pin.title);
    
    const { data, error } = await supabase
      .from("map_pins")
      .insert([{
        latitude: pin.latitude,
        longitude: pin.longitude,
        title: pin.title,
        description: pin.description,
        category: pin.category,
        date: pin.date
      }])
      .select()
      .single();

    if (error) {
      console.error("❌ Error adding map pin:", error);
      throw error;
    }

    console.log("✅ Successfully added map pin:", data.title);
    return data;
  } catch (error) {
    console.error("Error in addMapPin:", error);
    throw error;
  }
}

/**
 * Update an existing map pin
 */
export async function updateMapPin(id: string, updates: Partial<Omit<MapPin, "id" | "created_at" | "updated_at">>): Promise<MapPin> {
  try {
    console.log("📍 Updating map pin:", id);
    
    const { data, error } = await supabase
      .from("map_pins")
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("❌ Error updating map pin:", error);
      throw error;
    }

    console.log("✅ Successfully updated map pin:", data.title);
    return data;
  } catch (error) {
    console.error("Error in updateMapPin:", error);
    throw error;
  }
}

/**
 * Delete a map pin from the database
 */
export async function deleteMapPin(id: string): Promise<void> {
  try {
    console.log("📍 Deleting map pin:", id);
    
    const { error } = await supabase
      .from("map_pins")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("❌ Error deleting map pin:", error);
      throw error;
    }

    console.log("✅ Successfully deleted map pin");
  } catch (error) {
    console.error("Error in deleteMapPin:", error);
    throw error;
  }
}

/**
 * Subscribe to real-time map pin changes
 */
export function subscribeToMapPins(callback: (pins: MapPin[]) => void): () => void {
  console.log("📍 Setting up real-time sync for map pins...");
  
  // Initial fetch
  getMapPins().then(callback).catch(console.error);
  
  // Set up real-time subscription
  const subscription = supabase
    .channel("map_pins_changes")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "map_pins"
      },
      (payload) => {
        console.log("📍 Real-time map pin change detected:", payload.eventType);
        
        // Refetch all pins when any change occurs
        getMapPins().then(callback).catch(console.error);
      }
    )
    .subscribe();

  // Return unsubscribe function
  return () => {
    console.log("📍 Unsubscribing from map pins real-time updates");
    supabase.removeChannel(subscription);
  };
}

/**
 * Get map pins by category
 */
export async function getMapPinsByCategory(category: MapPin["category"]): Promise<MapPin[]> {
  try {
    console.log("📍 Fetching map pins by category:", category);
    
    const { data, error } = await supabase
      .from("map_pins")
      .select("*")
      .eq("category", category)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("❌ Error fetching map pins by category:", error);
      throw error;
    }

    console.log(`✅ Successfully fetched ${data?.length || 0} ${category} pins`);
    return data || [];
  } catch (error) {
    console.error("Error in getMapPinsByCategory:", error);
    throw error;
  }
}

/**
 * Get map pins statistics
 */
export async function getMapPinsStats(): Promise<{
  total: number;
  byCategory: Record<MapPin["category"], number>;
}> {
  try {
    const pins = await getMapPins();
    
    const stats = {
      total: pins.length,
      byCategory: {
        adventure: pins.filter(p => p.category === "adventure").length,
        photo: pins.filter(p => p.category === "photo").length,
        memory: pins.filter(p => p.category === "memory").length,
        wishlist: pins.filter(p => p.category === "wishlist").length,
      }
    };

    console.log("📍 Map pins stats:", stats);
    return stats;
  } catch (error) {
    console.error("Error in getMapPinsStats:", error);
    throw error;
  }
}
