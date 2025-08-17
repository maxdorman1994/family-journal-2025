// Temporary disable file to prevent Supabase imports from breaking the app
// This file provides fallback exports so old imports don't crash

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
  photos: string[];
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
  cloudflareUrl?: string;
  error?: string;
}

// Mock Supabase client that does nothing
export const supabase = {
  from: () => ({
    select: () => ({ data: [], error: null }),
    insert: () => ({ data: null, error: { message: 'Supabase disabled - use Hasura' } }),
    update: () => ({ data: null, error: { message: 'Supabase disabled - use Hasura' } }),
    delete: () => ({ data: null, error: { message: 'Supabase disabled - use Hasura' } }),
  }),
  channel: () => ({
    on: () => ({}),
    subscribe: () => ({}),
  }),
  removeChannel: () => {},
  rpc: () => ({ data: null, error: { message: 'Supabase disabled - use Hasura' } }),
};

export function isSupabaseConfigured(): boolean {
  return false; // Always return false to disable Supabase functionality
}

export function getSupabaseStatus(): {
  configured: boolean;
  message: string;
  url?: string;
} {
  return {
    configured: false,
    message: "Supabase disabled - using Hasura GraphQL API",
  };
}
