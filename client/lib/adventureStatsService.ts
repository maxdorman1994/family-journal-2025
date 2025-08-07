import { supabase, isSupabaseConfigured } from './supabase';

/**
 * Supabase Adventure Statistics Service
 * Handles all database operations for adventure statistics
 */

export interface AdventureStat {
  stat_type: string;
  stat_value: number;
  stat_description: string;
  last_updated?: string;
  is_primary_stat?: boolean;
  display_order?: number;
}

export interface AdventureStatsConfig {
  journal_entries: { value: number; description: string; icon: string; colors: { bg: string; accent: string; gradient: string } };
  places_explored: { value: number; description: string; icon: string; colors: { bg: string; accent: string; gradient: string } };
  memory_tags: { value: number; description: string; icon: string; colors: { bg: string; accent: string; gradient: string } };
  photos_captured: { value: number; description: string; icon: string; colors: { bg: string; accent: string; gradient: string } };
  miles_traveled: { value: number; description: string; icon: string; colors: { bg: string; accent: string; gradient: string } };
  munros_climbed: { value: number; description: string; icon: string; colors: { bg: string; accent: string; gradient: string } };
  adventures_this_year: { value: number; description: string; icon: string; colors: { bg: string; accent: string; gradient: string } };
  wildlife_spotted: { value: number; description: string; icon: string; colors: { bg: string; accent: string; gradient: string } };
  castles_explored: { value: number; description: string; icon: string; colors: { bg: string; accent: string; gradient: string } };
  weather_adventures: { value: number; description: string; icon: string; colors: { bg: string; accent: string; gradient: string } };
}

/**
 * Get all adventure statistics
 */
export async function getAdventureStats(): Promise<AdventureStat[]> {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase not configured - please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
  }

  try {
    console.log('🔄 Fetching adventure statistics...');

    const { data: stats, error } = await supabase
      .from('adventure_stats_summary')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching adventure stats:', error);
      // Check if it's a table not found error
      if (error.message.includes('Could not find the table') ||
          error.message.includes('relation "adventure_stats" does not exist')) {
        throw new Error('SCHEMA_MISSING: Database tables not found');
      }
      throw new Error(`Failed to fetch adventure stats: ${error.message}`);
    }

    console.log(`✅ Loaded ${stats?.length || 0} adventure statistics`);
    return stats || [];
  } catch (error) {
    console.error('Error in getAdventureStats:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`Failed to fetch adventure stats: ${String(error)}`);
  }
}

/**
 * Get primary adventure statistics (the 4 shown by default)
 */
export async function getPrimaryAdventureStats(): Promise<AdventureStat[]> {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase not configured');
  }

  try {
    console.log('🔄 Fetching primary adventure statistics...');

    const { data: stats, error } = await supabase
      .from('primary_adventure_stats')
      .select('*');

    if (error) {
      console.error('Error fetching primary adventure stats:', error);
      throw new Error(`Failed to fetch primary adventure stats: ${error.message}`);
    }

    console.log(`✅ Loaded ${stats?.length || 0} primary adventure statistics`);
    return stats || [];
  } catch (error) {
    console.error('Error in getPrimaryAdventureStats:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`Failed to fetch primary adventure stats: ${String(error)}`);
  }
}

/**
 * Update a specific adventure statistic
 */
export async function updateAdventureStat(
  statType: string, 
  value: number, 
  description?: string
): Promise<void> {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase not configured');
  }

  try {
    console.log(`🔄 Updating adventure stat: ${statType} = ${value}...`);

    const { error } = await supabase.rpc('set_adventure_stat', {
      p_stat_type: statType,
      p_value: value,
      p_description: description
    });

    if (error) {
      console.error('Error updating adventure stat:', error);
      throw new Error(`Failed to update adventure stat: ${error.message}`);
    }

    console.log(`✅ Adventure stat updated: ${statType}`);
  } catch (error) {
    console.error('Error in updateAdventureStat:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`Failed to update adventure stat: ${String(error)}`);
  }
}

/**
 * Increment a specific adventure statistic
 */
export async function incrementAdventureStat(
  statType: string, 
  increment: number = 1
): Promise<number> {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase not configured');
  }

  try {
    console.log(`🔄 Incrementing adventure stat: ${statType} by ${increment}...`);

    const { data, error } = await supabase.rpc('increment_adventure_stat', {
      p_stat_type: statType,
      p_increment: increment
    });

    if (error) {
      console.error('Error incrementing adventure stat:', error);
      throw new Error(`Failed to increment adventure stat: ${error.message}`);
    }

    console.log(`✅ Adventure stat incremented: ${statType} = ${data}`);
    return data || 0;
  } catch (error) {
    console.error('Error in incrementAdventureStat:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`Failed to increment adventure stat: ${String(error)}`);
  }
}

/**
 * Subscribe to real-time changes in adventure statistics
 */
export function subscribeToAdventureStats(
  callback: (stats: AdventureStat[]) => void
) {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured, skipping real-time subscription');
    return () => {}; // Return empty unsubscribe function
  }

  console.log('🔄 Setting up real-time adventure stats sync...');
  
  const subscription = supabase
    .channel('adventure_stats_changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'adventure_stats'
      },
      async (payload) => {
        console.log('📡 Real-time adventure stats change detected:', payload.eventType);
        
        // Refetch all adventure stats when any change occurs
        try {
          const stats = await getAdventureStats();
          callback(stats);
          console.log('✅ Adventure stats sync updated with latest data');
        } catch (error) {
          console.error('Error in real-time adventure stats subscription:', error);
        }
      }
    )
    .subscribe((status) => {
      console.log('📡 Adventure stats subscription status:', status);
    });

  console.log('✅ Real-time adventure stats sync enabled');

  return () => {
    console.log('🔌 Unsubscribing from adventure stats changes');
    subscription.unsubscribe();
  };
}

/**
 * Get default fallback statistics for when database is unavailable
 */
export function getFallbackAdventureStats(): AdventureStatsConfig {
  return {
    journal_entries: {
      value: 6,
      description: 'Stories captured & memories preserved',
      icon: 'calendar',
      colors: {
        bg: 'from-blue-400 to-purple-500',
        accent: 'from-blue-500 to-purple-600',
        gradient: 'from-blue-600 to-purple-600'
      }
    },
    places_explored: {
      value: 6,
      description: 'Across Scotland\'s breathtaking landscapes',
      icon: 'map-pin',
      colors: {
        bg: 'from-emerald-400 to-teal-500',
        accent: 'from-emerald-500 to-teal-600',
        gradient: 'from-emerald-600 to-teal-600'
      }
    },
    memory_tags: {
      value: 19,
      description: 'Special moments & magical experiences',
      icon: 'heart',
      colors: {
        bg: 'from-pink-400 to-rose-500',
        accent: 'from-pink-500 to-rose-600',
        gradient: 'from-pink-600 to-rose-600'
      }
    },
    photos_captured: {
      value: 127,
      description: 'Beautiful moments frozen in time',
      icon: 'camera',
      colors: {
        bg: 'from-orange-400 to-amber-500',
        accent: 'from-orange-500 to-amber-600',
        gradient: 'from-orange-600 to-amber-600'
      }
    },
    miles_traveled: {
      value: 342,
      description: 'Across Scotland\'s stunning terrain',
      icon: 'zap',
      colors: {
        bg: 'from-indigo-400 to-blue-500',
        accent: 'from-indigo-500 to-blue-600',
        gradient: 'from-indigo-600 to-blue-600'
      }
    },
    munros_climbed: {
      value: 3,
      description: 'Scottish peaks conquered together',
      icon: 'mountain',
      colors: {
        bg: 'from-green-400 to-lime-500',
        accent: 'from-green-500 to-lime-600',
        gradient: 'from-green-600 to-lime-600'
      }
    },
    adventures_this_year: {
      value: 12,
      description: 'Family expeditions & discoveries',
      icon: 'calendar',
      colors: {
        bg: 'from-violet-400 to-purple-500',
        accent: 'from-violet-500 to-purple-600',
        gradient: 'from-violet-600 to-purple-600'
      }
    },
    wildlife_spotted: {
      value: 23,
      description: 'Amazing creatures encountered',
      icon: 'heart',
      colors: {
        bg: 'from-emerald-400 to-green-500',
        accent: 'from-emerald-500 to-green-600',
        gradient: 'from-emerald-600 to-green-600'
      }
    },
    castles_explored: {
      value: 4,
      description: 'Historic fortresses & legends',
      icon: 'home',
      colors: {
        bg: 'from-red-400 to-pink-500',
        accent: 'from-red-500 to-pink-600',
        gradient: 'from-red-600 to-pink-600'
      }
    },
    weather_adventures: {
      value: 8,
      description: 'Sunshine, rain & Scottish mists',
      icon: 'cloud',
      colors: {
        bg: 'from-cyan-400 to-blue-500',
        accent: 'from-cyan-500 to-blue-600',
        gradient: 'from-cyan-600 to-blue-600'
      }
    }
  };
}

/**
 * Test Supabase connection for adventure statistics
 */
export async function testAdventureStatsConnection(): Promise<{
  success: boolean;
  message: string;
  error?: string;
}> {
  if (!isSupabaseConfigured()) {
    return {
      success: false,
      message: 'Supabase not configured',
      error: 'Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY'
    };
  }

  try {
    console.log('🔍 Testing adventure stats database connection...');

    const { data, error, count } = await supabase
      .from('adventure_stats')
      .select('*', { count: 'exact', head: true });

    if (error) {
      if (error.message.includes('Could not find the table') || 
          error.message.includes('relation "adventure_stats" does not exist')) {
        return {
          success: false,
          message: 'Database tables not found - please run adventure-stats-schema.sql',
          error: 'Tables missing: adventure_stats'
        };
      }
      return {
        success: false,
        message: 'Database connection failed',
        error: error.message
      };
    }

    const statsCount = count || 0;
    return {
      success: true,
      message: `✅ Adventure stats database connected! Found ${statsCount} statistic${statsCount !== 1 ? 's' : ''}.`
    };
  } catch (error) {
    return {
      success: false,
      message: 'Connection test failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
