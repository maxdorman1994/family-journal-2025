import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️  Supabase configuration missing. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface JournalEntry {
  id: string;
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
  photos: string[]; // Array of Supabase Storage URLs
  created_at?: string;
  updated_at?: string;
}

export interface ProcessedPhoto {
  id: string;
  file: File;
  originalFile: File;
  preview: string;
  isProcessing: boolean;
  uploadProgress: number;
  supabaseUrl?: string;
  error?: string;
}

// Supabase Storage bucket name
export const PHOTO_BUCKET = 'journal-photos';

/**
 * Check if Supabase is properly configured
 */
export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseAnonKey);
}

/**
 * Get Supabase configuration status
 */
export function getSupabaseStatus(): {
  configured: boolean;
  message: string;
  url?: string;
} {
  if (!supabaseUrl || !supabaseAnonKey) {
    return {
      configured: false,
      message: 'Supabase not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.',
    };
  }

  return {
    configured: true,
    message: 'Supabase configured successfully',
    url: supabaseUrl,
  };
}
