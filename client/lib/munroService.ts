import { supabase, isSupabaseConfigured } from './supabase';

/**
 * Supabase Munro Service
 * Handles all database operations for Munro tracking and completion
 */

export interface MunroData {
  id: string;
  name: string;
  height: number;
  region: string;
  difficulty: 'Easy' | 'Moderate' | 'Hard' | 'Extreme';
  latitude: number;
  longitude: number;
  description: string;
  estimated_time: string;
  best_seasons: string[];
  os_grid_ref: string;
  rank: number;
  created_at?: string;
  updated_at?: string;
}

export interface MunroCompletion {
  id: string;
  munro_id: string;
  completed_date: string;
  notes: string;
  photo_count: number;
  weather_conditions: string;
  climbing_time: string;
  created_at?: string;
  updated_at?: string;
}

export interface MunroWithCompletion extends MunroData {
  completed: boolean;
  completion?: MunroCompletion;
}

export interface CreateMunroCompletionData {
  munro_id: string;
  completed_date?: string;
  notes?: string;
  photo_count?: number;
  weather_conditions?: string;
  climbing_time?: string;
}

/**
 * Get all Munros with their completion status
 */
export async function getAllMunrosWithCompletion(): Promise<MunroWithCompletion[]> {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase not configured - please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
  }

  try {
    console.log('🔄 Fetching all Munros with completion status...');

    const { data: munros, error: munrosError } = await supabase
      .from('munros')
      .select('*')
      .order('rank', { ascending: true });

    if (munrosError) {
      console.error('Error fetching Munros:', munrosError);
      // Check if it's a table not found error
      if (munrosError.message.includes('Could not find the table') ||
          munrosError.message.includes('relation "munros" does not exist')) {
        throw new Error('SCHEMA_MISSING: Database tables not found');
      }
      throw new Error(`Failed to fetch Munros: ${munrosError.message}`);
    }

    const { data: completions, error: completionsError } = await supabase
      .from('munro_completions')
      .select('*');

    if (completionsError) {
      console.error('Error fetching completions:', completionsError);
      // For completions, we can continue without them if the table doesn't exist
      if (!completionsError.message.includes('Could not find the table') &&
          !completionsError.message.includes('relation "munro_completions" does not exist')) {
        throw new Error(`Failed to fetch completions: ${completionsError.message}`);
      }
      console.warn('Completions table not found, continuing without completion data');
    }

    // Combine Munros with completion data
    const munrosWithCompletion: MunroWithCompletion[] = (munros || []).map(munro => {
      const completion = (completions || []).find(c => c.munro_id === munro.id);
      return {
        ...munro,
        completed: !!completion,
        completion: completion || undefined
      };
    });

    console.log(`✅ Loaded ${munrosWithCompletion.length} Munros with completion status`);
    return munrosWithCompletion;
  } catch (error) {
    console.error('Error in getAllMunrosWithCompletion:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`Failed to fetch Munros: ${String(error)}`);
  }
}

/**
 * Mark a Munro as completed
 */
export async function completeMunro(data: CreateMunroCompletionData): Promise<MunroCompletion> {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase not configured');
  }

  try {
    console.log(`🎯 Marking Munro ${data.munro_id} as completed...`);

    const completionData = {
      munro_id: data.munro_id,
      completed_date: data.completed_date || new Date().toISOString().split('T')[0],
      notes: data.notes || '',
      photo_count: data.photo_count || 0,
      weather_conditions: data.weather_conditions || '',
      climbing_time: data.climbing_time || ''
    };

    const { data: completion, error } = await supabase
      .from('munro_completions')
      .upsert(completionData, { 
        onConflict: 'munro_id',
        ignoreDuplicates: false 
      })
      .select()
      .single();

    if (error) {
      console.error('Error completing Munro:', error);
      throw new Error(`Failed to complete Munro: ${error.message}`);
    }

    console.log(`✅ Munro completed successfully: ${data.munro_id}`);
    return completion;
  } catch (error) {
    console.error('Error in completeMunro:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`Failed to complete Munro: ${String(error)}`);
  }
}

/**
 * Remove a Munro completion (mark as not completed)
 */
export async function uncompleteMunro(munroId: string): Promise<void> {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase not configured');
  }

  try {
    console.log(`🔄 Removing completion for Munro ${munroId}...`);

    const { error } = await supabase
      .from('munro_completions')
      .delete()
      .eq('munro_id', munroId);

    if (error) {
      console.error('Error uncompleting Munro:', error);
      throw new Error(`Failed to uncomplete Munro: ${error.message}`);
    }

    console.log(`✅ Munro completion removed: ${munroId}`);
  } catch (error) {
    console.error('Error in uncompleteMunro:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`Failed to uncomplete Munro: ${String(error)}`);
  }
}

/**
 * Get Munro completion statistics
 */
export async function getMunroCompletionStats(): Promise<{
  completed_count: number;
  total_munros: number;
  completion_percentage: number;
  highest_completed: number;
  total_photos: number;
  first_completion: string | null;
  latest_completion: string | null;
}> {
  const defaultStats = {
    completed_count: 0,
    total_munros: 282,
    completion_percentage: 0,
    highest_completed: 0,
    total_photos: 0,
    first_completion: null,
    latest_completion: null
  };

  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured, returning default stats');
    return defaultStats;
  }

  try {
    console.log('📊 Fetching Munro completion statistics...');

    const { data, error } = await supabase
      .from('munro_completion_stats')
      .select('*')
      .single();

    if (error) {
      console.error('Error fetching stats:', error);
      // Check if it's a table not found error or network error
      if (error.message.includes('Could not find the table') ||
          error.message.includes('relation "munro_completion_stats" does not exist') ||
          error.message.includes('Failed to fetch') ||
          error.code === 'PGRST116') {
        console.warn('Stats view not available, returning default stats');
        return defaultStats;
      }
      console.warn('Stats fetch error, returning default stats:', error.message);
      return defaultStats;
    }

    console.log('✅ Munro stats loaded successfully');
    return data || defaultStats;
  } catch (error) {
    console.error('Error in getMunroCompletionStats:', error);
    console.warn('Falling back to default stats due to error');
    return defaultStats;
  }
}

/**
 * Get all unique regions from Munros
 */
export async function getMunroRegions(): Promise<string[]> {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase not configured');
  }

  try {
    const { data, error } = await supabase
      .from('munros')
      .select('region')
      .order('region');

    if (error) {
      // Check if it's a table not found error
      if (error.message.includes('Could not find the table') ||
          error.message.includes('relation "munros" does not exist')) {
        throw new Error('SCHEMA_MISSING: Database tables not found');
      }
      throw new Error(`Failed to fetch regions: ${error.message}`);
    }

    const regions = Array.from(new Set((data || []).map(row => row.region))).sort();
    return regions;
  } catch (error) {
    console.error('Error in getMunroRegions:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`Failed to fetch regions: ${String(error)}`);
  }
}

/**
 * Update Munro completion details
 */
export async function updateMunroCompletion(
  munroId: string, 
  updates: Partial<CreateMunroCompletionData>
): Promise<MunroCompletion> {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase not configured');
  }

  try {
    console.log(`🔄 Updating completion for Munro ${munroId}...`);

    const { data: completion, error } = await supabase
      .from('munro_completions')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('munro_id', munroId)
      .select()
      .single();

    if (error) {
      console.error('Error updating completion:', error);
      throw new Error(`Failed to update completion: ${error.message}`);
    }

    console.log(`✅ Munro completion updated: ${munroId}`);
    return completion;
  } catch (error) {
    console.error('Error in updateMunroCompletion:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`Failed to update completion: ${String(error)}`);
  }
}

/**
 * Search Munros by name or region
 */
export async function searchMunros(query: string): Promise<MunroWithCompletion[]> {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase not configured');
  }

  try {
    const { data: munros, error } = await supabase
      .from('munros')
      .select(`
        *,
        munro_completions (*)
      `)
      .or(`name.ilike.%${query}%,region.ilike.%${query}%,description.ilike.%${query}%`)
      .order('rank');

    if (error) {
      throw new Error(`Failed to search Munros: ${error.message}`);
    }

    const results: MunroWithCompletion[] = (munros || []).map(munro => ({
      ...munro,
      completed: munro.munro_completions && munro.munro_completions.length > 0,
      completion: munro.munro_completions?.[0] || undefined
    }));

    return results;
  } catch (error) {
    console.error('Error in searchMunros:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`Failed to search Munros: ${String(error)}`);
  }
}

/**
 * Subscribe to real-time changes in Munro completions
 */
export function subscribeToMunroCompletions(
  callback: (completions: MunroCompletion[]) => void
) {
  const subscription = supabase
    .channel('munro_completions_changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'munro_completions'
      },
      async () => {
        // Refetch all completions when any change occurs
        try {
          const { data, error } = await supabase
            .from('munro_completions')
            .select('*');
          
          if (!error && data) {
            callback(data);
          }
        } catch (error) {
          console.error('Error in real-time subscription:', error);
        }
      }
    )
    .subscribe();

  return () => {
    subscription.unsubscribe();
  };
}

/**
 * Test Supabase connection for Munro data
 */
export async function testMunroConnection(): Promise<{
  success: boolean;
  message: string;
  error?: string;
}> {
  try {
    const { data, error, count } = await supabase
      .from('munros')
      .select('*', { count: 'exact', head: true });

    if (error) {
      return {
        success: false,
        message: 'Munro database connection failed',
        error: error.message
      };
    }

    return {
      success: true,
      message: `Munro database connected! Found ${count || 0} Munros.`
    };
  } catch (error) {
    return {
      success: false,
      message: 'Munro database connection error',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
