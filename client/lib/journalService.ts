import { supabase, JournalEntry } from './supabase';

/**
 * Supabase Journal Service
 * Handles all database operations for journal entries
 * Photos are stored in Cloudflare R2, URLs stored in Supabase
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
  photos: string[]; // Cloudflare R2 URLs
}

/**
 * Create a new journal entry in Supabase
 */
export async function createJournalEntry(data: CreateJournalEntryData): Promise<JournalEntry> {
  const { data: entry, error } = await supabase
    .from('journal_entries')
    .insert([data])
    .select()
    .single();

  if (error) {
    console.error('Error creating journal entry:', error);
    throw new Error(`Failed to create journal entry: ${error.message}`);
  }

  return entry;
}

/**
 * Get all journal entries, ordered by date (newest first)
 */
export async function getJournalEntries(): Promise<JournalEntry[]> {
  try {
    const { data: entries, error } = await supabase
      .from('journal_entries')
      .select('*')
      .order('date', { ascending: false });

    if (error) {
      console.error('Supabase error fetching journal entries:', error);
      throw new Error(`Supabase error: ${error.message || error.details || 'Unknown database error'}`);
    }

    return entries || [];
  } catch (error) {
    console.error('Error in getJournalEntries:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`Failed to fetch journal entries: ${String(error)}`);
  }
}

/**
 * Get a single journal entry by ID
 */
export async function getJournalEntry(id: string): Promise<JournalEntry | null> {
  const { data: entry, error } = await supabase
    .from('journal_entries')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Entry not found
    }
    console.error('Error fetching journal entry:', error);
    throw new Error(`Failed to fetch journal entry: ${error.message}`);
  }

  return entry;
}

/**
 * Update a journal entry
 */
export async function updateJournalEntry(id: string, updates: Partial<CreateJournalEntryData>): Promise<JournalEntry> {
  const { data: entry, error } = await supabase
    .from('journal_entries')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating journal entry:', error);
    throw new Error(`Failed to update journal entry: ${error.message}`);
  }

  return entry;
}

/**
 * Delete a journal entry
 */
export async function deleteJournalEntry(id: string): Promise<void> {
  const { error } = await supabase
    .from('journal_entries')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting journal entry:', error);
    throw new Error(`Failed to delete journal entry: ${error.message}`);
  }
}

/**
 * Search journal entries by title, content, or location
 */
export async function searchJournalEntries(query: string): Promise<JournalEntry[]> {
  const { data: entries, error } = await supabase
    .from('journal_entries')
    .select('*')
    .or(`title.ilike.%${query}%,content.ilike.%${query}%,location.ilike.%${query}%`)
    .order('date', { ascending: false });

  if (error) {
    console.error('Error searching journal entries:', error);
    throw new Error(`Failed to search journal entries: ${error.message}`);
  }

  return entries || [];
}

/**
 * Filter journal entries by tag
 */
export async function getJournalEntriesByTag(tag: string): Promise<JournalEntry[]> {
  const { data: entries, error } = await supabase
    .from('journal_entries')
    .select('*')
    .contains('tags', [tag])
    .order('date', { ascending: false });

  if (error) {
    console.error('Error filtering journal entries by tag:', error);
    throw new Error(`Failed to filter journal entries: ${error.message}`);
  }

  return entries || [];
}

/**
 * Get all unique tags from journal entries
 */
export async function getAllTags(): Promise<string[]> {
  const { data: entries, error } = await supabase
    .from('journal_entries')
    .select('tags');

  if (error) {
    console.error('Error fetching tags:', error);
    throw new Error(`Failed to fetch tags: ${error.message}`);
  }

  // Flatten and deduplicate tags
  const allTags = entries?.flatMap(entry => entry.tags || []) || [];
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
    .from('journal_entries')
    .select('tags, photos, location');

  if (error) {
    console.error('Error fetching journal stats:', error);
    throw new Error(`Failed to fetch journal stats: ${error.message}`);
  }

  const stats = {
    totalEntries: entries?.length || 0,
    totalPhotos: entries?.reduce((sum, entry) => sum + (entry.photos?.length || 0), 0) || 0,
    totalTags: new Set(entries?.flatMap(entry => entry.tags || [])).size || 0,
    totalPlaces: new Set(entries?.map(entry => entry.location).filter(Boolean)).size || 0,
  };

  return stats;
}

/**
 * Subscribe to real-time changes in journal entries
 */
export function subscribeToJournalEntries(
  callback: (entries: JournalEntry[]) => void
) {
  const subscription = supabase
    .channel('journal_entries_changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'journal_entries'
      },
      async () => {
        // Refetch all entries when any change occurs
        try {
          const entries = await getJournalEntries();
          callback(entries);
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
 * Check if Supabase is working properly
 */
export async function testSupabaseConnection(): Promise<{
  success: boolean;
  message: string;
  error?: string;
}> {
  try {
    const { data, error } = await supabase
      .from('journal_entries')
      .select('count', { count: 'exact', head: true });

    if (error) {
      return {
        success: false,
        message: 'Supabase connection failed',
        error: error.message
      };
    }

    return {
      success: true,
      message: `Supabase connected successfully. ${data?.length || 0} journal entries found.`
    };
  } catch (error) {
    return {
      success: false,
      message: 'Supabase connection error',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
